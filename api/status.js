const { getRunStatus, listWorkflowRuns } = require("./github");

module.exports = async (req, res) => {
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

  try {
    const runId = req.query.run_id;

    if (runId) {
      const status = await getRunStatus(token, runId);
      return res.status(200).json(status);
    }

    const runs = await listWorkflowRuns(token, 1);
    if (!runs.length) {
      return res.status(404).json({ error: "No workflow runs found" });
    }

    const status = await getRunStatus(token, runs[0].id);
    return res.status(200).json(status);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
