import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchRecentReports } from "./github";

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

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "GITHUB_TOKEN not configured on the server" });
  }

  const limit =
    typeof req.query.limit === "string" && Number(req.query.limit) > 0
      ? Math.min(Number(req.query.limit), 20)
      : 10;

  try {
    const reports = await fetchRecentReports(token, limit);
    return res.status(200).json({ reports });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
