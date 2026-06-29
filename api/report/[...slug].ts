import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getReportFile } from "../github";

function contentTypeForPath(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".html")) return "text/html; charset=utf-8";
  if (lower.endsWith(".json")) return "application/json; charset=utf-8";
  if (lower.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (lower.endsWith(".css")) return "text/css; charset=utf-8";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".zip")) return "application/zip";
  if (lower.endsWith(".md")) return "text/plain; charset=utf-8";
  if (lower.endsWith(".txt")) return "text/plain; charset=utf-8";
  return "application/octet-stream";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "GITHUB_TOKEN not configured on the server" });
  }

  const slug = req.query.slug;
  const parts = Array.isArray(slug) ? slug : typeof slug === "string" ? [slug] : [];
  if (parts.length === 0) {
    return res.status(400).json({ error: "Invalid report path" });
  }

  const runId = parts[0];
  const filePath = parts.slice(1).join("/") || "index.html";

  try {
    const file = await getReportFile(token, runId, filePath);
    if (!file) {
      return res.status(404).json({ error: "Report not available yet" });
    }

    res.setHeader("Content-Type", contentTypeForPath(filePath));
    res.setHeader("Cache-Control", "private, max-age=300");

    if (req.method === "HEAD") {
      res.setHeader("Content-Length", String(file.data.length));
      return res.status(200).end();
    }

    return res.status(200).send(file.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
