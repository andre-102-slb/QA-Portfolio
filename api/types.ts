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
  run_name?: string;
}

export interface ReportSummary {
  run_id: number;
  title: string;
  created_at: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  has_report: boolean;
  report_url: string | null;
}
