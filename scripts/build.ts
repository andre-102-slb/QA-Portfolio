import fs from "fs";
import path from "path";
import { listSuites } from "../lib/list-suites";
import { listTestCasesWithContent } from "../lib/list-test-cases";

const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");

fs.writeFileSync(
  path.join(root, "suites.json"),
  JSON.stringify({ suites: listSuites() }, null, 2) + "\n"
);

fs.writeFileSync(
  path.join(root, "test-cases.json"),
  JSON.stringify({ cases: listTestCasesWithContent() }, null, 2) + "\n"
);

fs.mkdirSync(publicDir, { recursive: true });

const buildId = new Date().toISOString();

const indexSrc = fs.readFileSync(path.join(root, "index.html"), "utf8");
const indexOut = indexSrc.replace(
  "<!-- BUILD_ID -->",
  `<!-- build ${buildId} -->`
);
fs.writeFileSync(path.join(publicDir, "index.html"), indexOut);
fs.copyFileSync(path.join(root, "suites.json"), path.join(publicDir, "suites.json"));
fs.copyFileSync(path.join(root, "test-cases.json"), path.join(publicDir, "test-cases.json"));

console.log("Build complete — public/ ready for Vercel");
