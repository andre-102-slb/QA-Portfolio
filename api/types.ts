export interface SuiteChild {
  name: string;
  path: string;
}

export interface SuiteGroup {
  id: string;
  name: string;
  path: string;
  tag: string;
  children: SuiteChild[];
}

export interface PlaywrightTestResult {
  title: string;
  file: string;
  status: string;
  project: string | null;
  duration: number | null;
}

export interface ParsedResults {
  stats: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
    duration: number | null;
  };
  tests: PlaywrightTestResult[];
}

export interface TriggerBody {
  test_paths?: string;
  retries?: number | string;
}
