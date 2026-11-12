/**
 * Reads the sitemaps of both sites (following sitemap indexes) and writes
 * data/urls.json, which the page-health tests use to create one test per page.
 *
 *   node scripts/discover-urls.mjs
 *
 * Always writes the FULL list. SMOKE=1 / MAX_PAGES_PER_SITE are applied when the tests
 * load it (src/utils/sitemap.ts), so the store checkout tests always cover every product.
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';

// Never overwrite the URL list while a test run is using it (see src/run-lock.ts)
if (existsSync('.qa-run.lock')) {
  const pid = Number(readFileSync('.qa-run.lock', 'utf8'));
  let alive = false;
  try { process.kill(pid, 0); alive = true; } catch { /* process is gone */ }
  if (alive) {
    console.error(`A test run is active (pid ${pid}). Wait until it finishes, then try again.`);
    process.exit(1);
  }
}

// Keep in sync with src/config/sites.ts (this plain-JS script cannot import TypeScript).
const SITES = {
  course: 'https://course.akashayogaacademy.com/sitemap.xml',
  main: 'https://www.akashayogaacademy.com/sitemap.xml',
};

// Pages that are not in the sitemap but are part of the purchase flow.
const EXTRA = {
  course: ['https://course.akashayogaacademy.com/'],
  main: ['https://www.akashayogaacademy.com/'],
};

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AkashaQA/1.0';

async function readSitemap(url, seen = new Set()) {
  if (seen.has(url)) return [];
  seen.add(url);
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`Sitemap ${url} → HTTP ${res.status}`);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'));
  if (/<sitemapindex/i.test(xml)) {
    const nested = await Promise.all(locs.map((l) => readSitemap(l, seen)));
    return nested.flat();
  }
  return locs.filter((l) => !/\.(jpg|jpeg|png|webp|gif|pdf)$/i.test(l));
}

const out = { generatedAt: new Date().toISOString(), sites: {} };

for (const [key, sitemap] of Object.entries(SITES)) {
  // new URL().href normalises "https://x.com" → "https://x.com/" so the homepage is not tested twice
  const urls = [...new Set([...EXTRA[key], ...(await readSitemap(sitemap))].map((u) => new URL(u).href))];
  out.sites[key] = urls;
  console.log(`${key}: ${urls.length} URLs`);
}

mkdirSync('data', { recursive: true });
writeFileSync('data/urls.json', JSON.stringify(out, null, 2));
console.log('Wrote data/urls.json');
