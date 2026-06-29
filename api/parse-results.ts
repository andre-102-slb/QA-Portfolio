import type { ParsedResults, PlaywrightTestResult } from "./types";

interface RawSuite {
  title?: string;
  specs?: RawSpec[];
  suites?: RawSuite[];
}

interface RawSpec {
  title: string;
  file: string;
  tests?: RawTest[];
}

interface RawTest {
  results?: Array<{ status?: string; projectName?: string; duration?: number }>;
}

interface RawReport {
  stats?: {
    expected?: number;
    unexpected?: number;
    skipped?: number;
    flaky?: number;
    duration?: number;
  };
  suites?: RawSuite[];
}

function collectTests(suite: RawSuite, titles: string[] = []): PlaywrightTestResult[] {
  const tests: PlaywrightTestResult[] = [];
  const chain = [...titles, suite.title].filter(Boolean) as string[];

  for (const spec of suite.specs ?? []) {
    const specChain = [...chain, spec.title].filter(Boolean);
    for (const test of spec.tests ?? []) {
      const result = test.results?.[test.results.length - 1];
      tests.push({
        title: specChain.join(" › "),
        file: spec.file,
        status: result?.status ?? "unknown",
        project: result?.projectName ?? null,
        duration: result?.duration ?? null,
      });
    }
  }

  for (const child of suite.suites ?? []) {
    tests.push(...collectTests(child, chain));
  }

  return tests;
}

export function parsePlaywrightResults(report: RawReport): ParsedResults {
  const stats = report.stats ?? {};
  const tests = (report.suites ?? []).flatMap((suite) => collectTests(suite));

  const passed = stats.expected ?? tests.filter((t) => t.status === "passed").length;
  const failed = stats.unexpected ?? tests.filter((t) => t.status === "failed").length;
  const skipped = stats.skipped ?? tests.filter((t) => t.status === "skipped").length;
  const flaky = stats.flaky ?? tests.filter((t) => t.status === "flaky").length;

  return {
    stats: {
      total: passed + failed + skipped + flaky,
      passed,
      failed,
      skipped,
      flaky,
      duration: stats.duration ?? null,
    },
    tests,
  };
}
