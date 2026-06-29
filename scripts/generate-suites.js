const fs = require("fs");
const path = require("path");
const { buildSuites } = require("../lib/build-suites");

const output = { suites: buildSuites() };
const outPath = path.join(__dirname, "..", "suites.json");

fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n");
console.log(`Written ${output.suites.length} suite groups to suites.json`);
