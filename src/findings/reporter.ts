/**
 * Custom Playwright reporter → reports/findings-report.html, findings-report.md, findings.json
 *
 * Collects the "finding" attachments that tests add via `findings.report()` and groups
 * occurrences with the same severity + category + title into one issue
 * (e.g. one console error on 120 pages = 1 issue with 120 occurrences).
 *
 * Merge mode (FINDINGS_MERGE=1): keep the previous report and replace only the tests that ran,
 *   FINDINGS_MERGE=1 npx playwright test --last-failed
 */
import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { firstLine } from '../utils/text';
import type { Finding } from './findings';
import { FAILING_SEVERITIES } from './issues';
import { renderHtml, renderMarkdown, SEVERITY_ORDER, type IssueGroup, type ReportMeta } from './report-templates';

const OUT = 'reports';
const JSON_FILE = join(OUT, 'findings.json');
const SCREENSHOT_DIR = join(OUT, 'screenshots');

interface TestRun {
  status: 'passed' | 'failed' | 'skipped';
  key: string;
  findings: Finding[];
}

/**
 * "<project> › <describe> › <test>": the same string Findings stores in `testTitle`.
 * TestCase.titlePath() is ['', project, file, ...describes, test]; the file is left out.
 */
const testKey = (test: TestCase) => {
  const [, project, , ...rest] = test.titlePath();
  return [project, ...rest].join(' › ');
};

export default class FindingsReporter implements Reporter {
  /** Keyed by test id: with retries only the LAST attempt counts. */
  private runs = new Map<string, TestRun>();
  private started = new Date();

  onTestEnd(test: TestCase, result: TestResult) {
    const key = testKey(test);
    const findings = result.attachments
      .filter((a) => a.name === 'finding' && a.body)
      .map((a) => JSON.parse(a.body!.toString()) as Finding);

    // A test that crashed / timed out without recording a finding is still reported.
    if (findings.length === 0 && (result.status === 'failed' || result.status === 'timedOut')) {
      findings.push(testErrorFinding(test, key, result));
    }
    const status = result.status === 'passed' || result.status === 'skipped' ? result.status : 'failed';
    this.runs.set(test.id, { status, key, findings });
  }

  onEnd(result: FullResult) {
    if (this.runs.size === 0) return; // e.g. `playwright test --list`: keep the previous report
    mkdirSync(OUT, { recursive: true });

    const runs = [...this.runs.values()];
    let findings = runs.flatMap((r) => r.findings);
    let startedAt = this.started.toISOString();
    const tests = {
      total: runs.length,
      passed: runs.filter((r) => r.status === 'passed').length,
      failed: runs.filter((r) => r.status === 'failed').length,
      skipped: runs.filter((r) => r.status === 'skipped').length,
    };
    const screenshots = new Map<Finding, Buffer>();

    if (process.env.FINDINGS_MERGE === '1' && existsSync(JSON_FILE)) {
      const previous = JSON.parse(readFileSync(JSON_FILE, 'utf8')) as { meta: ReportMeta; issues: { items: Finding[] }[] };
      const rerun = new Set(runs.map((r) => r.key));
      const kept = previous.issues.flatMap((i) => i.items).filter((f) => !rerun.has(f.testTitle ?? ''));
      for (const f of kept) {
        if (f.screenshot && existsSync(join(OUT, f.screenshot))) screenshots.set(f, readFileSync(join(OUT, f.screenshot)));
        delete f.screenshot;
      }
      findings = [...kept, ...findings];
      startedAt = previous.meta.startedAt;
      // A test fails exactly when it has a Critical/High/Medium finding, so the merged counts follow from the findings.
      const failed = new Set(findings.filter((f) => FAILING_SEVERITIES.includes(f.severity)).map((f) => f.testTitle));
      tests.total = previous.meta.tests.total;
      tests.skipped = previous.meta.tests.skipped;
      tests.failed = failed.size;
      tests.passed = tests.total - tests.failed - tests.skipped;
    }
    for (const f of findings) {
      if (!screenshots.has(f) && f.screenshot && existsSync(f.screenshot)) screenshots.set(f, readFileSync(f.screenshot));
    }

    const groups = groupFindings(findings);
    writeScreenshots(groups, screenshots);

    const meta: ReportMeta = {
      generatedAt: new Date().toISOString(),
      startedAt,
      status: result.status,
      durationMin: Math.round((Date.now() - new Date(startedAt).getTime()) / 600) / 100,
      tests,
    };
    writeFileSync(JSON_FILE, JSON.stringify({ meta, issues: groups.map((g) => ({ ...g, sites: [...g.sites] })) }, null, 2));
    writeFileSync(join(OUT, 'findings-report.md'), renderMarkdown(groups, meta));
    writeFileSync(join(OUT, 'findings-report.html'), renderHtml(groups, meta));
    console.log(`\n📋 Findings report: ${join(OUT, 'findings-report.html')}  (${groups.length} issues, ${findings.length} occurrences)`);
  }
}

/** Same severity + category + title = one issue. Sorted by severity, then by number of occurrences. */
function groupFindings(findings: Finding[]): IssueGroup[] {
  const groups = new Map<string, IssueGroup>();
  for (const f of findings) {
    const key = `${f.severity}|${f.category}|${f.title}`;
    let group = groups.get(key);
    if (!group) {
      group = { id: '', severity: f.severity, category: f.category, title: f.title, sites: new Set(), items: [] };
      groups.set(key, group);
    }
    group.items.push(f);
    group.sites.add(f.site);
  }
  const sorted = [...groups.values()].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity) || b.items.length - a.items.length,
  );
  sorted.forEach((g, i) => (g.id = `AKS-${String(i + 1).padStart(3, '0')}`));
  return sorted;
}

/** One screenshot per issue: reports/screenshots/AKS-001.png */
function writeScreenshots(groups: IssueGroup[], screenshots: Map<Finding, Buffer>) {
  if (existsSync(SCREENSHOT_DIR)) rmSync(SCREENSHOT_DIR, { recursive: true });
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
  for (const g of groups) {
    const withShot = g.items.find((f) => screenshots.has(f));
    g.items.forEach((f) => delete f.screenshot);
    if (withShot) {
      writeFileSync(join(SCREENSHOT_DIR, `${g.id}.png`), screenshots.get(withShot)!);
      withShot.screenshot = `screenshots/${g.id}.png`;
    }
  }
}

function testErrorFinding(test: TestCase, key: string, result: TestResult): Finding {
  const project = test.parent.project();
  const baseURL = project?.use.baseURL ?? '';
  return {
    severity: 'Medium',
    category: 'Test error',
    title: 'Test could not complete (timeout / unexpected error)',
    site: project?.name ?? '',
    pageUrl: test.title.startsWith('/') && baseURL ? new URL(test.title, baseURL).href : baseURL || test.title,
    expected: 'Test completes',
    actual: firstLine(result.error?.message ?? result.status),
    testTitle: key,
    recommendation: 'Re-run this test; if it fails again, check the page manually.',
  };
}
