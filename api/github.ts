import AdmZip from "adm-zip";
import { parsePlaywrightResults } from "./parse-results";
import type { ParsedResults } from "./types";

export const GITHUB_REPO = process.env.GITHUB_REPO ?? "andre-102-slb/QA-Portfolio";
export const GITHUB_REF = process.env.GITHUB_REF ?? "main";
export const WORKFLOW_FILE = "playwright.yml";
const RESULTS_ARTIFACT = "playwright-results";
const API_VERSION = "2022-11-28";

interface WorkflowRun {
  id: number;
  html_url: string;
  created_at: string;
}

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

export async function downloadRunResults(
  token: string,
  runId: string
): Promise<ParsedResults | null> {
  const data = await githubGet<{
    artifacts?: Array<{ name: string; archive_download_url: string }>;
  }>(`/repos/${GITHUB_REPO}/actions/runs/${runId}/artifacts`, token);

  const artifact = data.artifacts?.find((item) => item.name === RESULTS_ARTIFACT);
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

  const zip = new AdmZip(Buffer.from(await response.arrayBuffer()));
  const entry = zip
    .getEntries()
    .find(
      (item: { entryName: string }) =>
        item.entryName === "results.json" || item.entryName.endsWith("/results.json")
    );

  if (!entry) return null;

  return parsePlaywrightResults(JSON.parse(entry.getData().toString("utf8")));
}
