import fs from "fs";
import path from "path";
import type { SuiteGroup } from "./types";

const SPECS_DIR = path.join(process.cwd(), "frontend-tests", "specs");

const GROUPS = [
  { id: "smoke", name: "Smoke Tests", tag: "smoke" },
  { id: "regression", name: "Regression Tests", tag: "normal" },
] as const;

/** Lists only Smoke and Regression suites from `frontend-tests/specs/`. */
export function listSuites(): SuiteGroup[] {
  return GROUPS.flatMap(({ id, name, tag }) => {
    const groupDir = path.join(SPECS_DIR, id);
    if (!fs.existsSync(groupDir)) return [];

    return [
      {
        id,
        name,
        tag,
        path: `frontend-tests/specs/${id}`,
        children: subdirs(groupDir).map((suite) => ({
          name: suite,
          path: `frontend-tests/specs/${id}/${suite}`,
        })),
      },
    ];
  });
}

function subdirs(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}
