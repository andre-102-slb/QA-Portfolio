const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");

fs.mkdirSync(publicDir, { recursive: true });

for (const file of ["index.html", "suites.json"]) {
  fs.copyFileSync(path.join(root, file), path.join(publicDir, file));
}

console.log("Copied static files to public/");
