/**
 * Test data: the URLs from both sitemaps, written by `npm run discover`
 * (scripts/discover-urls.mjs → data/urls.json).
 *
 * Tests are generated from this list when Playwright loads the spec files,
 * so it has to exist before `playwright test` starts.
 */
import { existsSync, readFileSync } from 'node:fs';
import { WIX_ENROLL_PAGE, WIX_PRODUCT_PAGE, type SiteKey } from '../config/sites';

const URLS_FILE = 'data/urls.json';
const SMOKE_PAGES_PER_SITE = 8;

function allUrls(site: SiteKey): string[] {
  if (!existsSync(URLS_FILE)) throw new Error(`${URLS_FILE} is missing: run \`npm run discover\` first.`);
  const data = JSON.parse(readFileSync(URLS_FILE, 'utf8')) as { sites: Record<SiteKey, string[]> };
  return data.sites[site] ?? [];
}

/**
 * Pages for the page-health crawl.
 *   SMOKE=1               → only the first 8 pages per site
 *   MAX_PAGES_PER_SITE=N  → only the first N pages per site
 */
export function sitemapUrls(site: SiteKey): string[] {
  const cap = process.env.SMOKE === '1' ? SMOKE_PAGES_PER_SITE : Number(process.env.MAX_PAGES_PER_SITE || Infinity);
  return allUrls(site).slice(0, cap);
}

/** Every Wix store product page (always all of them, also in smoke mode). */
export const wixProductPages = () => allUrls('main').filter((u) => WIX_PRODUCT_PAGE.test(u));

/** Wix landing pages that sell something (always all of them). */
export const wixEnrollPages = () =>
  allUrls('main').filter((u) => WIX_ENROLL_PAGE.test(new URL(u).pathname) && !WIX_PRODUCT_PAGE.test(u));
