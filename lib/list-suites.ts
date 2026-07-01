import fs from "fs";
import path from "path";
import type { SuiteGroup } from "./types";

const TESTS_DIR = path.join(process.cwd(), "frontend-tests");

const GROUP_LABELS: Record<string, { name: string; tag: string }> = {
  smoke: { name: "Smoke Tests", tag: "smoke" },
  regression: { name: "Regression Tests", tag: "e2e" },
};

/** Builds the suite tree from the `frontend-tests/<group>/<suite>` folder layout. */
export function listSuites(): SuiteGroup[] {
  if (!fs.existsSync(TESTS_DIR)) return [];

  return subdirs(TESTS_DIR).map((groupId) => {
    const label = GROUP_LABELS[groupId] ?? { name: `${groupId} Tests`, tag: "e2e" };
    return {
      id: groupId,
      name: label.name,
      tag: label.tag,
      path: `frontend-tests/${groupId}`,
      children: subdirs(path.join(TESTS_DIR, groupId)).map((name) => ({
        name,
        path: `frontend-tests/${groupId}/${name}`,
      })),
    };
  });
}

function subdirs(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}
