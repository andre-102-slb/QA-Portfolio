const GITHUB_REPO = process.env.GITHUB_REPO || "andre-102-slb/QA-Portfolio";
const GITHUB_REF = process.env.GITHUB_REF || "main";
const WORKFLOW_FILE = "playwright.yml";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({
      error: "GITHUB_TOKEN not configured on the server",
    });
  }

  const { test_paths } = req.body || {};
  const testPaths =
    typeof test_paths === "string" && test_paths.trim()
      ? test_paths.trim()
      : "frontend-tests/smoke frontend-tests/regression";

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        ref: GITHUB_REF,
        inputs: { test_paths: testPaths },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    return res.status(response.status).json({ error });
  }

  return res.status(202).json({
    ok: true,
    test_paths: testPaths,
    actions_url: `https://github.com/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}`,
  });
}
