import AdmZip from "adm-zip";
import type { ReportSummary } from "./types";

export const GITHUB_REPO = process.env.GITHUB_REPO ?? "andre-102-slb/QA-Portfolio";
export const GITHUB_REF = process.env.GITHUB_REF ?? "main";
export const WORKFLOW_FILE = "playwright.yml";
export const REPORT_ARTIFACT = "playwright-report";
const API_VERSION = "2022-11-28";
const REPORT_CACHE_TTL_MS = 5 * 60 * 1000;

interface WorkflowRun {
  id: number;
  html_url: string;
  created_at: string;
  status: string;
  conclusion: string | null;
  display_title: string;
}

interface ArtifactInfo {
  name: string;
  archive_download_url: string;
}

interface ReportCacheEntry {
  zip: AdmZip;
  expires: number;
}

const reportZipCache = new Map<string, ReportCacheEntry>();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function githubGet<T>(apiPath: string, token: string): Promise<T> {
  const response = await fetch(`https://api.github.com${apiPath}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": API_VERSION,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `GitHub API ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function listWorkflowRuns(token: string, perPage = 5): Promise<WorkflowRun[]> {
  const data = await githubGet<{ workflow_runs?: WorkflowRun[] }>(
    `/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=${perPage}&branch=${GITHUB_REF}`,
    token
  );
  return data.workflow_runs ?? [];
}

export async function findRunAfterDispatch(
  token: string,
  dispatchedAt: Date
): Promise<WorkflowRun | null> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    await sleep(1500);
    const runs = await listWorkflowRuns(token, 8);
    const run = runs.find(
      (item) => new Date(item.created_at).getTime() >= dispatchedAt.getTime() - 5000
    );
    if (run) return run;
  }
  return null;
}

export async function getRunStatus(token: string, runId: string) {
  const run = await githubGet<{
    id: number;
    status: string;
    conclusion: string | null;
    html_url: string;
    display_title: string;
    event: string;
    created_at: string;
    updated_at: string;
  }>(`/repos/${GITHUB_REPO}/actions/runs/${runId}`, token);

  const jobsData = await githubGet<{
    jobs?: Array<{
      id: number;
      name: string;
      status: string;
      conclusion: string | null;
      html_url: string;
      steps?: Array<{ name: string; status: string; conclusion: string | null }>;
    }>;
  }>(`/repos/${GITHUB_REPO}/actions/runs/${runId}/jobs?per_page=10`, token);

  const jobs = (jobsData.jobs ?? []).map((job) => ({
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
  }));

  return {
    run_id: run.id,
    status: run.status,
    conclusion: run.conclusion,
    html_url: run.html_url,
    display_title: run.display_title,
    event: run.event,
    created_at: run.created_at,
    updated_at: run.updated_at,
    jobs,
  };
}

export async function listRunArtifacts(token: string, runId: string): Promise<ArtifactInfo[]> {
  const data = await githubGet<{ artifacts?: ArtifactInfo[] }>(
    `/repos/${GITHUB_REPO}/actions/runs/${runId}/artifacts`,
    token
  );
  return data.artifacts ?? [];
}

export async function hasPlaywrightReport(token: string, runId: string): Promise<boolean> {
  const artifacts = await listRunArtifacts(token, runId);
  return artifacts.some((item) => item.name === REPORT_ARTIFACT);
}

async function downloadReportZip(token: string, runId: string): Promise<AdmZip | null> {
  const artifacts = await listRunArtifacts(token, runId);
  const artifact = artifacts.find((item) => item.name === REPORT_ARTIFACT);
  if (!artifact) return null;

  const response = await fetch(artifact.archive_download_url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": API_VERSION,
    },
  });

  if (!response.ok) {
    throw new Error(`Artifact download failed (${response.status})`);
  }

  return new AdmZip(Buffer.from(await response.arrayBuffer()));
}

export async function getCachedReportZip(token: string, runId: string): Promise<AdmZip | null> {
  const cached = reportZipCache.get(runId);
  if (cached && cached.expires > Date.now()) {
    return cached.zip;
  }

  const zip = await downloadReportZip(token, runId);
  if (!zip) return null;

  reportZipCache.set(runId, { zip, expires: Date.now() + REPORT_CACHE_TTL_MS });
  return zip;
}

function normalizeReportPath(filePath: string): string {
  return filePath.replace(/^\/+/, "");
}

function findZipEntry(zip: AdmZip, filePath: string): AdmZip.IZipEntry | null {
  const normalized = normalizeReportPath(filePath);
  const candidates = new Set([
    normalized,
    `playwright-report/${normalized}`,
    normalized.replace(/^playwright-report\//, ""),
  ]);

  for (const candidate of candidates) {
    const direct = zip.getEntry(candidate);
    if (direct) return direct;
  }

  return (
    zip.getEntries().find((entry) => {
      const name = entry.entryName.replace(/\/$/, "");
      return (
        candidates.has(name) ||
        name.endsWith(`/${normalized}`) ||
        name.replace(/^playwright-report\//, "") === normalized
      );
    }) ?? null
  );
}

export async function getReportFile(
  token: string,
  runId: string,
  filePath: string
): Promise<{ data: Buffer; entryName: string } | null> {
  const zip = await getCachedReportZip(token, runId);
  if (!zip) return null;

  const entry = findZipEntry(zip, filePath || "index.html");
  if (!entry) return null;

  return { data: entry.getData(), entryName: entry.entryName };
}

export function reportPublicUrl(runId: string | number): string {
  return `/api/report/${runId}/index.html`;
}

export async function fetchRecentReports(token: string, limit = 10): Promise<ReportSummary[]> {
  const data = await githubGet<{ workflow_runs?: WorkflowRun[] }>(
    `/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=${limit}&branch=${GITHUB_REF}`,
    token
  );

  const runs = data.workflow_runs ?? [];

  return Promise.all(
    runs.map(async (run) => {
      let hasReport = false;

      if (run.status === "completed") {
        try {
          hasReport = await hasPlaywrightReport(token, String(run.id));
        } catch {
          hasReport = false;
        }
      }

      return {
        run_id: run.id,
        title: run.display_title || "Playwright Tests",
        created_at: run.created_at,
        status: run.status,
        conclusion: run.conclusion,
        html_url: run.html_url,
        has_report: hasReport,
        report_url: hasReport ? reportPublicUrl(run.id) : null,
      };
    })
  );
}
