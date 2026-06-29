const fs = require("fs");
const path = require("path");
const { listSuites } = require("./list-suites");

const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");

fs.writeFileSync(
  path.join(root, "suites.json"),
  JSON.stringify({ suites: listSuites() }, null, 2) + "\n"
);

fs.mkdirSync(publicDir, { recursive: true });

for (const file of ["index.html", "suites.json"]) {
  fs.copyFileSync(path.join(root, file), path.join(publicDir, file));
}

console.log("Build complete — public/ ready for Vercel");
