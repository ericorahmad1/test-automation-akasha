/**
 * PAGE HEALTH: one test per sitemap URL. Used by tests/course/ and tests/main/.
 *
 * Each test:
 *   1. page loads (HTTP < 400, not a "page not found" screen, has a title)
 *   2. images render
 *   3. links work: same-page anchors, course checkout links, Akasha + booking links (HTTP)
 *   4. every visible CTA (Enroll / Book / Buy…) can be clicked, and CTAs without an href
 *      actually do something when clicked
 *   5. JS / console / network errors are reported (low severity)
 */
import type { APIRequestContext, Page } from '@playwright/test';
import { COURSE_CHECKOUT_PRODUCTS, COURSE_PAGE_PRODUCT, PURCHASE_CTA_TEXT, type SiteKey } from '../config/sites';
import { test } from '../fixtures';
import type { Findings } from '../findings/findings';
import { Issues } from '../findings/issues';
import type { SitePage } from '../pages/site-page';
import { isFirstParty, isKnownNoise, type CollectedErrors } from '../utils/error-collector';
import { checkLink, shouldCheckLink } from '../utils/link-checker';
import { clickAndObserve, scanClickables, type Clickable } from '../utils/page-scanner';
import { sitemapUrls } from '../utils/sitemap';
import { firstLine, normalizeMessage, pathOf } from '../utils/text';

/** Clicking CTAs without an href is slow; cap it per page. */
const MAX_CLICK_PROBES_PER_PAGE = 8;
const NOT_FOUND_TEXT = /page (you are looking for )?(does not exist|not found|isn.t available)|we couldn.t find (the|this) page|404 - not found/i;

export function definePageHealthTests(site: SiteKey) {
  test.describe('Page health', { tag: '@health' }, () => {
    test.describe.configure({ timeout: 240_000 });

    for (const url of sitemapUrls(site)) {
      test(new URL(url).pathname, async ({ sitePage, page, request, findings, errors }) => {
        findings.pageUrl = url;

        const loaded = await test.step('page loads', () => checkPageLoads(sitePage, findings, url));
        if (!loaded) return;

        await test.step('images render', () => checkImages(page, findings));

        const clickables = await scanClickables(page);
        await test.step('links work', () => checkLinks({ page, request, findings, clickables, site, url }));
        await test.step('CTA buttons respond', () => checkCtas(sitePage, findings, clickables, url));
        await test.step('no JS / console / network errors', () => checkErrors(findings, errors, url));
      });
    }
  });
}

/* ------------------------------------------------------------------ */

async function checkPageLoads(sitePage: SitePage, findings: Findings, url: string): Promise<boolean> {
  const { page } = sitePage;
  const steps = [`Open ${url}`];

  let response;
  try {
    response = await sitePage.open(url);
  } catch (e) {
    await findings.report(Issues.pageLoadFailed, { actual: firstLine((e as Error).message), steps });
    return false;
  }

  const status = response?.status() ?? 0;
  if (status === 0 || status >= 400) {
    await findings.report(Issues.pageHttpError, { actual: `HTTP ${status}`, steps });
    return false;
  }
  if (response?.request().redirectedFrom()) {
    await findings.report(Issues.sitemapRedirect, { actual: `Redirects to ${page.url()}` });
  }

  const bodyText = await page.locator('body').innerText().catch(() => '');
  const notFound = bodyText.slice(0, 3000).match(NOT_FOUND_TEXT);
  if (notFound) await findings.report(Issues.soft404, { actual: notFound[0] });

  if (!(await page.title()).trim()) await findings.report(Issues.missingTitle, { actual: 'empty' });
  return true;
}

async function checkImages(page: Page, findings: Findings) {
  const broken = await page.locator('img').evaluateAll((imgs) =>
    (imgs as HTMLImageElement[])
      .filter((i) => i.complete && i.naturalWidth === 0 && !!i.currentSrc && i.getBoundingClientRect().width > 0)
      .map((i) => i.currentSrc)
      .slice(0, 10),
  );
  for (const src of broken) {
    await findings.report(Issues.brokenImage, { element: src, actual: 'naturalWidth = 0' });
  }
}

interface LinkCheckContext {
  page: Page;
  request: APIRequestContext;
  findings: Findings;
  clickables: Clickable[];
  site: SiteKey;
  url: string;
}

async function checkLinks({ page, request, findings, clickables, site, url }: LinkCheckContext) {
  const done = new Set<string>(); // each anchor / checkout link / URL is checked once per page
  const current = new URL(page.url());
  const currentPath = pathOf(current.href);

  for (const link of clickables) {
    if (!link.href) continue;
    const target = new URL(link.href);
    const element = `"${link.text || '(no text)'}" → ${link.rawHref ?? link.href}`;
    const steps = [`Open ${url}`, `Click "${link.text}"`];

    // a. Same-page anchors (#enroll, #pricing…) must have a target element
    const samePage = target.origin === current.origin && pathOf(target.href) === currentPath;
    if (samePage && target.hash.length > 1) {
      if (done.has(target.hash)) continue;
      done.add(target.hash);
      const id = decodeURIComponent(target.hash.slice(1));
      const exists = await page.evaluate((id) => !!(document.getElementById(id) || document.getElementsByName(id).length), id);
      if (!exists) {
        await findings.report(link.isCta ? Issues.ctaAnchorMissing : Issues.anchorMissing, {
          element, expected: `Element with id="${id}" on the page`, actual: 'No such element: click does nothing', steps,
        });
      }
      continue;
    }

    // b. Course checkout links must name a valid product: the one this page sells
    if (target.hostname === 'course.akashayogaacademy.com' && target.pathname === '/checkout' && !done.has('checkout:' + link.href)) {
      done.add('checkout:' + link.href);
      await checkCheckoutLink(findings, target, element, site === 'course' ? COURSE_PAGE_PRODUCT[currentPath] : undefined);
    }

    // c. A purchase button that just goes to the homepage is a dead end in the funnel
    const toHomepage = (target.pathname === '/' || target.pathname === '') && !target.hash;
    if (link.isCta && PURCHASE_CTA_TEXT.test(link.text) && toHomepage && !done.has('home:' + link.text)) {
      done.add('home:' + link.text);
      await findings.report(Issues.purchaseCtaToHomepage, { element: `"${link.text}" → ${link.href}`, actual: link.href, steps });
    }

    // d. Akasha + booking links must respond with HTTP < 400
    const withoutHash = link.href.split('#')[0];
    if (!shouldCheckLink(link.href) || done.has(withoutHash)) continue;
    done.add(withoutHash);
    const res = await checkLink(request, link.href);
    if (res.status === 0 || res.status >= 400) {
      const sellsSomething = /checkout|thrivecart|enroll|product-page/i.test(link.href);
      const issue = !link.isCta ? Issues.linkBroken : sellsSomething ? Issues.checkoutCtaBroken : Issues.ctaBroken;
      await findings.report(issue, { element, actual: res.status ? `HTTP ${res.status}` : (res.error ?? 'network error'), steps });
    }
  }
}

async function checkCheckoutLink(findings: Findings, target: URL, element: string, pageProduct: string | undefined) {
  const product = target.searchParams.get('product');
  if (!product) {
    await findings.report(Issues.checkoutLinkWithoutProduct, { element, actual: target.pathname + target.search });
  } else if (!COURSE_CHECKOUT_PRODUCTS[product]) {
    await findings.report(Issues.checkoutLinkUnknownProduct, {
      element, expected: `One of: ${Object.keys(COURSE_CHECKOUT_PRODUCTS).join(', ')}`, actual: product,
    });
  }
  if (pageProduct && product && product !== pageProduct) {
    await findings.report(Issues.checkoutLinkWrongProduct, { element, expected: `product=${pageProduct}`, actual: `product=${product}` });
  }
}

async function checkCtas(sitePage: SitePage, findings: Findings, clickables: Clickable[], url: string) {
  const { page } = sitePage;
  const seen = new Set<string>();
  let probes = 0;

  for (const cta of clickables.filter((c) => c.isCta && c.visible)) {
    const key = `${cta.text}|${cta.rawHref}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const button = page.locator(cta.selector);
    if (!(await button.isVisible())) continue;
    const steps = [`Open ${url}`, `Click "${cta.text}"`];
    const href = cta.rawHref?.trim() ?? '';

    if (href && !/^(#|javascript:)/i.test(href)) {
      // A real link: it must receive the click (not covered by another element, not disabled)
      await findings.check(() => button.click({ trial: true, timeout: 6_000 }), Issues.ctaNotClickable, {
        element: `"${cta.text}" → ${href}`, steps,
      });
      continue;
    }
    if (href.length > 1 && href.startsWith('#')) continue; // anchors are checked in checkLinks
    if (probes++ >= MAX_CLICK_PROBES_PER_PAGE) continue;

    // No href: JavaScript must handle it. Click it and see whether anything happens.
    const effect = await clickAndObserve(page, button).catch(() => null);
    if (effect === null) {
      await findings.report(Issues.ctaDoesNothing, {
        element: `<${cta.tag}> "${cta.text}"`,
        actual: 'No navigation, no DOM change, no network request',
        steps: [`Open ${url}`, 'Wait until fully loaded', `Click "${cta.text}"`],
      });
    }
    // Back to a clean page for the next button
    if (page.url().split('#')[0] !== url) {
      await sitePage.open(url).catch(() => {});
      await scanClickables(page); // re-tag elements after the reload
    } else {
      await page.keyboard.press('Escape').catch(() => {});
    }
  }
}

async function checkErrors(findings: Findings, errors: CollectedErrors, url: string) {
  for (const msg of new Set(errors.pageErrors.map(normalizeMessage))) {
    await findings.report(Issues.jsError, { title: `Uncaught JS error: ${msg}`, actual: msg });
  }
  for (const msg of new Set(errors.consoleErrors.map(normalizeMessage))) {
    await findings.report(isKnownNoise(msg) ? Issues.consoleNoise : Issues.consoleError, { title: `Console error: ${msg}`, actual: msg });
  }
  const badFirstParty = errors.badResponses.filter((r) => r.firstParty && r.url.split('?')[0] !== url.split('?')[0]);
  for (const r of badFirstParty.slice(0, 10)) {
    await findings.report(Issues.firstPartyResourceError, {
      title: `First-party resource returns HTTP ${r.status}`, element: r.url.slice(0, 200), actual: `HTTP ${r.status}`,
    });
  }
  for (const r of errors.failedRequests.filter((r) => isFirstParty(r.url)).slice(0, 10)) {
    await findings.report(Issues.firstPartyRequestFailed, { element: r.url.slice(0, 200), actual: r.error });
  }
}
