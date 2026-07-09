import AdmZip from "adm-zip";
import { parsePlaywrightResults } from "./parse-results";
import type { ParsedResults, ReportSummary } from "./types";

export const GITHUB_REPO = process.env.GITHUB_REPO ?? "andre-102-slb/QA-Portfolio";
export const GITHUB_REF = process.env.GITHUB_REF ?? "main";
export const WORKFLOW_FILE = "playwright.yml";

const REPORT_ARTIFACT = "playwright-report";
const API = "https://api.github.com";

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function ghGet<T>(token: string, path: string): Promise<T> {
  const response = await fetch(`${API}${path}`, { headers: authHeaders(token) });
  if (!response.ok) throw new Error((await response.text()) || `GitHub ${response.status}`);
  return response.json() as Promise<T>;
}

function workflowRunsPath(limit: number, event?: string): string {
  const query = `per_page=${limit}&branch=${GITHUB_REF}`;
  const eventFilter = event ? `&event=${encodeURIComponent(event)}` : "";
  return `/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/runs?${query}${eventFilter}`;
}

type WorkflowRun = {
  id: number;
  html_url: string;
  created_at: string;
  status: string;
  conclusion: string | null;
  display_title: string;
};

export async function listWorkflowRuns(
  token: string,
  limit = 5,
  event?: string
): Promise<WorkflowRun[]> {
  const data = await ghGet<{ workflow_runs?: WorkflowRun[] }>(token, workflowRunsPath(limit, event));
  return data.workflow_runs ?? [];
}

export async function findRunAfterDispatch(
  token: string,
  dispatchedAt: Date
): Promise<WorkflowRun | null> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const run = (await listWorkflowRuns(token, 5, "workflow_dispatch")).find(
      (item) => new Date(item.created_at).getTime() >= dispatchedAt.getTime() - 5000
    );
    if (run) return run;
  }
  return null;
}

export async function getRunStatus(token: string, runId: string) {
  const run = await ghGet<{
    id: number;
    status: string;
    conclusion: string | null;
    html_url: string;
    display_title: string;
    event: string;
    created_at: string;
    updated_at: string;
  }>(token, `/repos/${GITHUB_REPO}/actions/runs/${runId}`);

  const jobsData = await ghGet<{
    jobs?: Array<{
      id: number;
      name: string;
      status: string;
      conclusion: string | null;
      html_url: string;
      steps?: Array<{ name: string; status: string; conclusion: string | null }>;
    }>;
  }>(token, `/repos/${GITHUB_REPO}/actions/runs/${runId}/jobs?per_page=10`);

  return {
    run_id: run.id,
    status: run.status,
    conclusion: run.conclusion,
    html_url: run.html_url,
    display_title: run.display_title,
    event: run.event,
    created_at: run.created_at,
    updated_at: run.updated_at,
    jobs: (jobsData.jobs ?? []).map((job) => ({
      id: job.id,
      name: job.name,
      status: job.status,
      conclusion: job.conclusion,
      html_url: job.html_url,
      steps: (job.steps ?? []).map((step) => ({
        name: step.name,
        status: step.status,
        conclusion: step.conclusion,
      })),
    })),
  };
}

async function downloadReportZip(token: string, runId: string): Promise<AdmZip | null> {
  const data = await ghGet<{ artifacts?: Array<{ name: string; archive_download_url: string }> }>(
    token,
    `/repos/${GITHUB_REPO}/actions/runs/${runId}/artifacts`
  );

  const artifact = (data.artifacts ?? []).find((item) => item.name === REPORT_ARTIFACT);
  if (!artifact) return null;

  const response = await fetch(artifact.archive_download_url, { headers: authHeaders(token) });
  if (!response.ok) throw new Error(`Artifact download failed (${response.status})`);

  return new AdmZip(Buffer.from(await response.arrayBuffer()));
}

function findZipEntry(zip: AdmZip, filePath: string): AdmZip.IZipEntry | null {
  const file = (filePath || "index.html").replace(/^\/+/, "");
  return (
    zip.getEntry(file) ??
    zip.getEntry(`playwright-report/${file}`) ??
    zip.getEntries().find((entry) => entry.entryName.endsWith(`/${file}`)) ??
    null
  );
}

export async function getReportFile(
  token: string,
  runId: string,
  filePath: string
): Promise<{ data: Buffer; entryName: string } | null> {
  const zip = await downloadReportZip(token, runId);
  if (!zip) return null;

  const entry = findZipEntry(zip, filePath);
  if (!entry) return null;

  return { data: entry.getData(), entryName: entry.entryName };
}

export async function downloadRunResults(
  token: string,
  runId: string
): Promise<ParsedResults | null> {
  const zip = await downloadReportZip(token, runId);
  if (!zip) return null;

  const entry = findZipEntry(zip, "results.json");
  if (!entry) return null;

  return parsePlaywrightResults(JSON.parse(entry.getData().toString("utf8")));
}

async function runHasReport(token: string, runId: number): Promise<boolean> {
  const data = await ghGet<{ artifacts?: Array<{ name: string }> }>(
    token,
    `/repos/${GITHUB_REPO}/actions/runs/${runId}/artifacts`
  );
  return (data.artifacts ?? []).some((item) => item.name === REPORT_ARTIFACT);
}

export async function fetchRecentReports(token: string, limit = 10): Promise<ReportSummary[]> {
  const runs = await listWorkflowRuns(token, limit, "workflow_dispatch");

  return Promise.all(
    runs.map(async (run) => {
      const hasReport = run.status === "completed" ? await runHasReport(token, run.id) : false;

      return {
        run_id: run.id,
        title: run.display_title || "Playwright Tests",
        created_at: run.created_at,
        status: run.status,
        conclusion: run.conclusion,
        html_url: run.html_url,
        has_report: hasReport,
        report_url: hasReport ? `/api/report/${run.id}/index.html` : null,
      };
    })
  );
}
