import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  GITHUB_REPO,
  GITHUB_REF,
  WORKFLOW_FILE,
  findRunAfterDispatch,
} from "./github";
import type { TriggerBody } from "./types";

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    return res.status(500).json({ error: "GITHUB_TOKEN not configured on the server" });
  }

  const body = (req.body ?? {}) as TriggerBody;
  const testPaths =
    typeof body.test_paths === "string" && body.test_paths.trim()
      ? body.test_paths.trim()
      : "frontend-tests/smoke/login frontend-tests/regression/login";
  const retryCount = body.retries === 2 || body.retries === "2" ? "2" : "0";
  const runName =
    typeof body.run_name === "string" && body.run_name.trim() ? body.run_name.trim() : "";

  if (!runName) {
    return res.status(400).json({ error: "run_name is required" });
  }

  const dispatchedAt = new Date();

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
        inputs: { test_paths: testPaths, retries: retryCount, run_name: runName },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    return res.status(response.status).json({ error });
  }

  const run = await findRunAfterDispatch(token, dispatchedAt);

  return res.status(202).json({
    ok: true,
    test_paths: testPaths,
    retries: retryCount,
    run_name: runName,
    run_id: run?.id ?? null,
    run_url: run?.html_url ?? null,
    actions_url: `https://github.com/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}`,
  });
}
