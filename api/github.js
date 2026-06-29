const AdmZip = require("adm-zip");
const { parsePlaywrightResults } = require("./parse-results");

const GITHUB_REPO = process.env.GITHUB_REPO || "andre-102-slb/QA-Portfolio";
const GITHUB_REF = process.env.GITHUB_REF || "main";
const WORKFLOW_FILE = "playwright.yml";
const RESULTS_ARTIFACT = "playwright-results";
const API_VERSION = "2022-11-28";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function githubGet(path, token) {
  const response = await fetch(`https://api.github.com${path}`, {
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

  return response.json();
}

async function listWorkflowRuns(token, perPage = 5) {
  const data = await githubGet(
    `/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=${perPage}&branch=${GITHUB_REF}`,
    token
  );
  return data.workflow_runs || [];
}

async function findRunAfterDispatch(token, dispatchedAt) {
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

async function getRunStatus(token, runId) {
  const run = await githubGet(`/repos/${GITHUB_REPO}/actions/runs/${runId}`, token);
  const jobsData = await githubGet(
    `/repos/${GITHUB_REPO}/actions/runs/${runId}/jobs?per_page=10`,
    token
  );

  const jobs = (jobsData.jobs || []).map((job) => ({
    id: job.id,
    name: job.name,
    status: job.status,
    conclusion: job.conclusion,
    html_url: job.html_url,
    steps: (job.steps || []).map((step) => ({
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

async function downloadRunResults(token, runId) {
  const data = await githubGet(`/repos/${GITHUB_REPO}/actions/runs/${runId}/artifacts`, token);
  const artifact = (data.artifacts || []).find((item) => item.name === RESULTS_ARTIFACT);
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
    .find((item) => item.entryName === "results.json" || item.entryName.endsWith("/results.json"));

  if (!entry) return null;

  return parsePlaywrightResults(JSON.parse(entry.getData().toString("utf8")));
}

module.exports = {
  GITHUB_REPO,
  GITHUB_REF,
  WORKFLOW_FILE,
  findRunAfterDispatch,
  getRunStatus,
  listWorkflowRuns,
  downloadRunResults,
};
