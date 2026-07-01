import fs from "fs";
import path from "path";
import { listSuites } from "../lib/list-suites";
import { listTestCases } from "../lib/list-test-cases";

const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");

fs.mkdirSync(publicDir, { recursive: true });
fs.copyFileSync(path.join(root, "index.html"), path.join(publicDir, "index.html"));
write("suites.json", { suites: listSuites() });
write("test-cases.json", { cases: listTestCases() });

console.log("Build complete — public/ ready for Vercel");

function write(name: string, data: unknown): void {
  fs.writeFileSync(path.join(publicDir, name), JSON.stringify(data, null, 2));
}
