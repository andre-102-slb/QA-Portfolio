import type { VercelRequest, VercelResponse } from "@vercel/node";
import { listTestCases, getTestCaseById } from "./list-test-cases";

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

  try {
    const id = typeof req.query.id === "string" ? req.query.id.trim() : "";

    if (id) {
      const detail = getTestCaseById(id);
      if (!detail) {
        return res.status(404).json({ error: "Test case not found" });
      }
      return res.status(200).json({ case: detail });
    }

    return res.status(200).json({ cases: listTestCases() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
