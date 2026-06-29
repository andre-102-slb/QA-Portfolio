const fs = require("fs");
const path = require("path");

const TEST_ROOT = "frontend-tests";
const TAG_BY_GROUP = { smoke: "smoke", regression: "e2e" };
const NAME_BY_GROUP = { smoke: "Smoke Tests", regression: "Regression Tests" };
const SPEC_FILE = /\.spec\.(ts|js|tsx|jsx|mjs|cjs)$/;
const TEST_CALL = /(?:^|[^\w.])test(?:\.(?:only|skip|fixme))?\s*\(/gm;

function getProjectRoot() {
  const fromCwd = process.cwd();
  if (fs.existsSync(path.join(fromCwd, TEST_ROOT))) return fromCwd;
  return path.join(__dirname, "..");
}

function formatGroupName(id) {
  return NAME_BY_GROUP[id] || `${id.charAt(0).toUpperCase()}${id.slice(1)} Tests`;
}

function formatGroupTag(id) {
  return TAG_BY_GROUP[id] || "e2e";
}

function listSpecFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listSpecFiles(fullPath));
    } else if (SPEC_FILE.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function countTestsInFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return (content.match(TEST_CALL) || []).length;
}

/** Each test() in .spec files under the folder counts as one test. */
function getTestCount(testPath) {
  const folderPath = path.join(getProjectRoot(), testPath);
  const specFiles = listSpecFiles(folderPath);

  return specFiles.reduce((total, file) => total + countTestsInFile(file), 0);
}

function listChildFolders(groupPath) {
  if (!fs.existsSync(groupPath)) return [];

  return fs
    .readdirSync(groupPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function buildSuites() {
  const root = path.join(getProjectRoot(), TEST_ROOT);
  if (!fs.existsSync(root)) return [];

  const groupIds = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  return groupIds.map((groupId) => {
    const groupFsPath = path.join(root, groupId);
    const childNames = listChildFolders(groupFsPath);

    const children = childNames.map((childName) => {
      const childPath = `${TEST_ROOT}/${groupId}/${childName}`;
      return {
        name: childName,
        path: childPath,
        tests: getTestCount(childPath),
      };
    });

    return {
      id: groupId,
      name: formatGroupName(groupId),
      path: `${TEST_ROOT}/${groupId}`,
      tag: formatGroupTag(groupId),
      children,
    };
  });
}

module.exports = { buildSuites, getTestCount, countTestsInFile };
