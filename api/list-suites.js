const fs = require("fs");
const path = require("path");

const TEST_ROOT = "frontend-tests";
const TAG_BY_GROUP = { smoke: "smoke", regression: "e2e" };
const NAME_BY_GROUP = { smoke: "Smoke Tests", regression: "Regression Tests" };

function getProjectRoot() {
  const fromCwd = process.cwd();
  if (fs.existsSync(path.join(fromCwd, TEST_ROOT))) return fromCwd;
  return path.join(__dirname, "..");
}

function listSuites() {
  const root = path.join(getProjectRoot(), TEST_ROOT);
  if (!fs.existsSync(root)) return [];

  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .map((groupId) => {
      const groupPath = path.join(root, groupId);
      const children = fs
        .readdirSync(groupPath, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => ({
          name: entry.name,
          path: `${TEST_ROOT}/${groupId}/${entry.name}`,
        }));

      return {
        id: groupId,
        name: NAME_BY_GROUP[groupId] || `${groupId} Tests`,
        path: `${TEST_ROOT}/${groupId}`,
        tag: TAG_BY_GROUP[groupId] || "e2e",
        children,
      };
    });
}

module.exports = { listSuites };
