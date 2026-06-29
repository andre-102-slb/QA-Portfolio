const { downloadRunResults } = require("./github");

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

  const runId = req.query.run_id;
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
    return res.status(500).json({ error: error.message });
  }
};
