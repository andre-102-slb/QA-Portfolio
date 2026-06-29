import fs from "fs";
import path from "path";

const TEST_CASES_ROOT = "test-cases";

export interface TestCaseAutomation {
  path: string;
  test: string;
}

export interface TestCaseSummary {
  id: string;
  title: string;
  feature: string;
  suite: string;
  group: string;
  priority: string;
  tags: string[];
  automated: boolean;
  automation: TestCaseAutomation | null;
  file: string;
}

export interface TestCaseDetail extends TestCaseSummary {
  body: string;
  bodyHtml: string;
}

function getProjectRoot(): string {
  const fromCwd = process.cwd();
  if (fs.existsSync(path.join(fromCwd, TEST_CASES_ROOT))) return fromCwd;
  return path.join(__dirname, "..");
}

function splitFrontmatter(content: string): { yaml: string; body: string } | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return null;
  return { yaml: match[1], body: match[2].trim() };
}

function parseSimpleFields(yaml: string): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const line of yaml.split("\n")) {
    if (line.startsWith(" ") || line.startsWith("\t")) continue;
    const match = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (match) fields[match[1]] = match[2].trim();
  }
  return fields;
}

function parseTags(yaml: string): string[] {
  const tags: string[] = [];
  let inTags = false;

  for (const line of yaml.split("\n")) {
    if (/^tags:\s*$/.test(line)) {
      inTags = true;
      continue;
    }
    if (inTags) {
      const item = line.match(/^\s*-\s*(.+)$/);
      if (item) tags.push(item[1].trim());
      else if (line.trim() && !line.startsWith(" ")) inTags = false;
    }
  }

  return tags;
}

function parseAutomation(yaml: string): TestCaseAutomation | null {
  const pathMatch = yaml.match(/^\s+path:\s*(.+)$/m);
  const testMatch = yaml.match(/^\s+test:\s*(.+)$/m);
  if (!pathMatch || !testMatch) return null;
  return { path: pathMatch[1].trim(), test: testMatch[1].trim() };
}

export function markdownToHtml(markdown: string): string {
  const blocks = markdown.split(/\n\n+/);

  return blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";

      if (/^#{1,3}\s/.test(trimmed)) {
        return trimmed
          .split("\n")
          .map((line) => {
            if (line.startsWith("### ")) return `<h3>${inlineMarkdown(line.slice(4))}</h3>`;
            if (line.startsWith("## ")) return `<h2>${inlineMarkdown(line.slice(3))}</h2>`;
            if (line.startsWith("# ")) return `<h1>${inlineMarkdown(line.slice(2))}</h1>`;
            return inlineMarkdown(line);
          })
          .join("\n");
      }

      return `<p>${inlineMarkdown(trimmed.replace(/\n/g, " "))}</p>`;
    })
    .filter(Boolean)
    .join("\n");
}

function inlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function parseTestCaseFile(filePath: string, feature: string): TestCaseDetail | null {
  const basename = path.basename(filePath);
  if (basename === "TEMPLATE.md" || basename.startsWith("_")) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const parts = splitFrontmatter(raw);
  if (!parts) return null;

  const fields = parseSimpleFields(parts.yaml);
  const id = fields.id?.trim();
  const title = fields.title?.trim();
  if (!id || !title) return null;

  const root = getProjectRoot();
  const relativeFile = path.relative(root, filePath).split(path.sep).join("/");
  const automation = parseAutomation(parts.yaml);
  const automated = fields.automated === "true" && automation !== null;

  return {
    id,
    title,
    feature,
    suite: fields.suite?.trim() || feature,
    group: fields.group?.trim() || "",
    priority: fields.priority?.trim() || "medium",
    tags: parseTags(parts.yaml),
    automated,
    automation,
    file: relativeFile,
    body: parts.body,
    bodyHtml: markdownToHtml(parts.body),
  };
}

function collectTestCaseFiles(): TestCaseDetail[] {
  const root = path.join(getProjectRoot(), TEST_CASES_ROOT);
  if (!fs.existsSync(root)) return [];

  const cases: TestCaseDetail[] = [];

  for (const featureEntry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!featureEntry.isDirectory()) continue;

    const featureDir = path.join(root, featureEntry.name);
    for (const fileEntry of fs.readdirSync(featureDir, { withFileTypes: true })) {
      if (!fileEntry.isFile() || !fileEntry.name.endsWith(".md")) continue;
      const parsed = parseTestCaseFile(path.join(featureDir, fileEntry.name), featureEntry.name);
      if (parsed) cases.push(parsed);
    }
  }

  return cases.sort((a, b) => a.id.localeCompare(b.id));
}

export function listTestCases(): TestCaseSummary[] {
  return collectTestCaseFiles().map(({ body: _body, bodyHtml: _bodyHtml, ...summary }) => summary);
}

export function getTestCaseById(id: string): TestCaseDetail | null {
  return collectTestCaseFiles().find((item) => item.id === id) ?? null;
}

export function listTestCasesWithContent(): TestCaseDetail[] {
  return collectTestCaseFiles();
}
