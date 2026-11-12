import { expect, type Page, type TestInfo } from '@playwright/test';
import type { SiteKey } from '../config/sites';
import { firstLine } from '../utils/text';
import { FAILING_SEVERITIES, type IssueType, type Severity } from './issues';

/** One occurrence of an issue, as stored in reports/findings.json. */
export interface Finding {
  severity: Severity;
  category: string;
  title: string;
  site: string;
  pageUrl: string;
  element?: string;
  expected: string;
  actual: string;
  steps?: string[];
  recommendation?: string;
  screenshot?: string;
  /** "<project> › <describe> › <test>": used by the reporter to merge re-runs. */
  testTitle?: string;
}

/** What a test knows about one occurrence. Everything else comes from the IssueType. */
export interface FindingDetails {
  actual?: string;
  expected?: string;
  element?: string;
  steps?: string[];
  /** Defaults to `findings.pageUrl`. A path is resolved against the project's baseURL. */
  pageUrl?: string;
  /** Overrides the issue title (only for issues whose title contains the message, e.g. console errors). */
  title?: string;
  recommendation?: string;
}

type LazyDetails = FindingDetails | ((error: Error) => FindingDetails | Promise<FindingDetails>);

/**
 * The `findings` fixture. Instead of stopping at the first problem, a test records
 * findings and keeps going, so one run shows *everything* that is wrong on a page.
 *
 *   await findings.report(Issues.soft404, { actual: 'Page not found' });
 *
 *   // Run a normal Playwright assertion; when it fails, report the issue instead of throwing:
 *   const ok = await findings.check(() => expect(checkout.iframe).toBeAttached(), Issues.checkoutIframeMissing);
 */
export class Findings {
  /** The page under test. Reported as "page" in the findings report. */
  pageUrl?: string;

  constructor(
    private readonly page: Page,
    private readonly testInfo: TestInfo,
    readonly site: SiteKey,
  ) {}

  async report(issue: IssueType, details: FindingDetails = {}): Promise<void> {
    const failing = FAILING_SEVERITIES.includes(issue.severity);
    const finding: Finding = {
      severity: issue.severity,
      category: issue.category,
      title: details.title ?? issue.title,
      site: this.site,
      pageUrl: this.absolute(details.pageUrl ?? this.pageUrl ?? this.page.url()),
      element: details.element,
      expected: details.expected ?? issue.expected ?? '',
      actual: details.actual ?? '',
      steps: details.steps,
      recommendation: details.recommendation ?? issue.recommendation,
      testTitle: [this.testInfo.project.name, ...this.testInfo.titlePath.slice(1)].join(' › '),
    };
    if (failing) finding.screenshot = await this.screenshot();

    await this.testInfo.attach('finding', { body: JSON.stringify(finding), contentType: 'application/json' });

    // Critical / High / Medium mark the test as failed, but the test keeps running.
    if (failing) expect.soft(finding.actual, `[${finding.severity}] ${finding.title}`).toBe(finding.expected);
  }

  /**
   * Run a Playwright assertion. If it fails, report `issue` (with the assertion
   * error as "actual" unless the details say otherwise) and return false.
   */
  async check(assertion: () => Promise<unknown>, issue: IssueType, details: LazyDetails = {}): Promise<boolean> {
    try {
      await assertion();
      return true;
    } catch (e) {
      const error = e as Error;
      const resolved = typeof details === 'function' ? await details(error) : details;
      await this.report(issue, { ...resolved, actual: resolved.actual ?? firstLine(error.message) });
      return false;
    }
  }

  private absolute(url: string) {
    const baseURL = this.testInfo.project.use.baseURL;
    return baseURL && url.startsWith('/') ? new URL(url, baseURL).href : url;
  }

  private async screenshot(): Promise<string | undefined> {
    if (this.page.isClosed()) return undefined;
    const path = this.testInfo.outputPath(`finding-${Date.now()}.png`);
    return this.page.screenshot({ path, timeout: 10_000 }).then(() => path, () => undefined);
  }
}
