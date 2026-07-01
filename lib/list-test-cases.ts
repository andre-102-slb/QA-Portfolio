import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const TEST_CASES_DIR = path.join(process.cwd(), "test-cases");

export interface TestCaseAutomation {
  path: string;
  test: string;
}

export interface TestCaseStep {
  action: string;
  data: string | null;
  expected: string[];
}

export interface TestCase {
  id: string;
  title: string;
  feature: string;
  priority: string;
  tags: string[];
  automated: boolean;
  automation: TestCaseAutomation | null;
  precondition: string | null;
  steps: TestCaseStep[];
  bodyHtml: string;
}

type Frontmatter = Record<string, unknown>;

/** Reads every `test-cases/<feature>/*.md` file and turns it into a TestCase. */
export function listTestCases(): TestCase[] {
  if (!fs.existsSync(TEST_CASES_DIR)) return [];

  return subdirs(TEST_CASES_DIR)
    .flatMap((feature) => markdownFiles(path.join(TEST_CASES_DIR, feature)).map((file) => parseTestCase(file, feature)))
    .filter((testCase): testCase is TestCase => testCase !== null)
    .sort((a, b) => a.id.localeCompare(b.id));
}

function parseTestCase(filePath: string, feature: string): TestCase | null {
  const { frontmatter, body } = splitFrontmatter(fs.readFileSync(filePath, "utf8"));
  const meta = parseYaml(frontmatter);

  const id = str(meta.id);
  const title = str(meta.title);
  if (!id || !title) return null;

  const automation = parseAutomation(meta.automation);

  return {
    id,
    title,
    feature,
    priority: str(meta.priority) ?? "medium",
    tags: strList(meta.tags),
    automated: meta.automated === true && automation !== null,
    automation,
    precondition: str(meta.precondition),
    steps: parseSteps(meta.steps),
    bodyHtml: markdownToHtml(body),
  };
}

// ── Filesystem helpers ──────────────────────────────────────────────

function subdirs(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function markdownFiles(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md") && name !== "TEMPLATE.md")
    .map((name) => path.join(dir, name));
}

// ── Frontmatter parsing ─────────────────────────────────────────────

function splitFrontmatter(raw: string): { frontmatter: string; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  return match ? { frontmatter: match[1], body: match[2].trim() } : { frontmatter: "", body: raw.trim() };
}

function parseYaml(text: string): Frontmatter {
  try {
    const data = yaml.load(text);
    return data && typeof data === "object" ? (data as Frontmatter) : {};
  } catch {
    return {};
  }
}

function parseAutomation(value: unknown): TestCaseAutomation | null {
  const automation = value as { path?: unknown; test?: unknown } | null;
  const automationPath = str(automation?.path);
  const test = str(automation?.test);
  return automationPath && test ? { path: automationPath, test } : null;
}

function parseSteps(value: unknown): TestCaseStep[] {
  if (!Array.isArray(value)) return [];
  return value.map(toStep).filter((step): step is TestCaseStep => step !== null);
}

function toStep(raw: unknown): TestCaseStep | null {
  if (typeof raw === "string") {
    return raw.trim() ? { action: raw.trim(), data: null, expected: [] } : null;
  }
  const step = raw as { action?: unknown; data?: unknown; expected?: unknown };
  const action = str(step?.action);
  return action ? { action, data: str(step?.data), expected: strList(step?.expected) } : null;
}

// ── Value coercion ──────────────────────────────────────────────────

function str(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return null;
}

function strList(value: unknown): string[] {
  const items = Array.isArray(value) ? value : [value];
  return items.map(str).filter((item): item is string => item !== null);
}

// ── Minimal Markdown → HTML (headings, paragraphs, inline marks) ─────

function markdownToHtml(markdown: string): string {
  if (!markdown) return "";
  return markdown
    .split(/\n\n+/)
    .map((block) => blockToHtml(block.trim()))
    .filter(Boolean)
    .join("\n");
}

function blockToHtml(block: string): string {
  if (!block) return "";
  const heading = block.match(/^(#{1,3})\s+(.*)$/);
  if (heading) {
    const level = heading[1].length;
    return `<h${level}>${inline(heading[2])}</h${level}>`;
  }
  return `<p>${inline(block.replace(/\n/g, " "))}</p>`;
}

function inline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}
