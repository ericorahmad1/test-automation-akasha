import type { Locator, Page } from '@playwright/test';
import { CTA_IGNORE, CTA_TEXT } from '../config/sites';

export interface Clickable {
  text: string;
  /** href exactly as written in the HTML */
  rawHref: string | null;
  /** absolute href (links only) */
  href: string | null;
  visible: boolean;
  isCta: boolean;
  tag: string;
  /** Locator for this element: `page.locator(clickable.selector)` */
  selector: string;
}

/**
 * Lists every link and button on the page in one browser round-trip.
 * Each element is tagged with data-qa-idx so it can be located again.
 * Call it again after a reload, because the tags are lost.
 */
export async function scanClickables(page: Page): Promise<Clickable[]> {
  return page.locator('a, button, [role="button"], input[type="submit"]').evaluateAll(
    (nodes, { ctaSrc, ignoreSrc }) => {
      const cta = new RegExp(ctaSrc, 'i');
      const ignore = new RegExp(ignoreSrc, 'i');
      return nodes.map((el, i) => {
        el.setAttribute('data-qa-idx', String(i));
        const box = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const text = ((el as HTMLElement).innerText || (el as HTMLInputElement).value || el.getAttribute('aria-label') || '')
          .trim()
          .replace(/\s+/g, ' ')
          .slice(0, 80);
        const rawHref = el.getAttribute('href');
        return {
          text,
          rawHref,
          href: el instanceof HTMLAnchorElement && rawHref ? el.href : null,
          visible: box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none',
          // FAQ accordion questions ("How do I sign up…?") are not CTAs
          isCta: !!text && cta.test(text) && !ignore.test(text) && !text.endsWith('?'),
          tag: el.tagName.toLowerCase(),
          selector: `[data-qa-idx="${i}"]`,
        };
      });
    },
    { ctaSrc: CTA_TEXT.source, ignoreSrc: CTA_IGNORE.source },
  );
}

/** Network requests that do not count as "the button did something". */
const ANALYTICS = /google|doubleclick|facebook|mixpanel|clarity|hotjar|tiktok|sentry|frog\.wix|panorama|bolt|analytics|collect|pixel|postaffiliatepro/i;

/** How long to watch for a reaction after the click. */
const OBSERVE_MS = 2_500;

/**
 * Clicks a button that has no href and watches whether *anything* happens:
 * URL change, new tab, DOM change or a (non-analytics) network request.
 * Returns a description of the effect, or null when the click did nothing.
 */
export async function clickAndObserve(page: Page, button: Locator): Promise<string | null> {
  const startUrl = page.url();
  const requests: string[] = [];
  const onRequest = (r: { url(): string }) => {
    if (!ANALYTICS.test(r.url())) requests.push(r.url());
  };
  page.on('request', onRequest);
  const popup = page.context().waitForEvent('page', { timeout: OBSERVE_MS + 1_500 }).catch(() => null);

  await page.evaluate(() => {
    const w = window as unknown as { __qaMutations: number; __qaObserver?: MutationObserver };
    w.__qaMutations = 0;
    w.__qaObserver = new MutationObserver((list) => {
      for (const m of list) if (m.addedNodes.length || m.removedNodes.length) w.__qaMutations++;
    });
    w.__qaObserver.observe(document.body, { childList: true, subtree: true });
  });

  await button.click({ timeout: 8_000 });
  // There is no event that means "nothing happened", so watching for a fixed time is intentional here.
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(OBSERVE_MS);
  page.off('request', onRequest);

  const newPage = await popup;
  if (newPage) {
    const url = newPage.url();
    await newPage.close();
    return `opened new tab ${url}`;
  }
  if (page.url() !== startUrl) return `navigated to ${page.url()}`;

  const mutations = await page
    .evaluate(() => {
      const w = window as unknown as { __qaMutations: number; __qaObserver?: MutationObserver };
      w.__qaObserver?.disconnect();
      return w.__qaMutations;
    })
    .catch(() => 1); // page navigated away while evaluating = something happened
  if (mutations > 0) return `DOM changed (${mutations} mutations)`;
  if (requests.length) return `network request ${requests[0]}`;
  return null;
}
