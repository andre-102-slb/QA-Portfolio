import type { VercelRequest, VercelResponse } from "@vercel/node";
import { downloadRunResults, githubFailureStatus, readGithubToken } from "../lib/github";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = readGithubToken();
  if (!token) {
    return res.status(500).json({ error: "GITHUB_TOKEN not configured on the server" });
  }

  const runId = typeof req.query.run_id === "string" ? req.query.run_id : undefined;
  if (!runId) {
    return res.status(400).json({ error: "run_id is required" });
  }

  try {
    const results = await downloadRunResults(token, runId);

    if (!results) {
      return res.status(404).json({ error: "Results not available yet" });
    }

    return res.status(200).json(results);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(githubFailureStatus(error)).json({ error: message });
  }
}
