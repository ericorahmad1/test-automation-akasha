import { SitePage } from './site-page';

/** Possible hamburger buttons: Wix and Next.js render them differently. */
const MOBILE_MENU_TOGGLES = [
  'button[aria-label*="menu" i]',
  '[role="button"][aria-label*="menu" i]',
  'button[aria-label*="navigation" i]',
  '[data-testid*="hamburger" i]',
  '[id*="MENU_AS_CONTAINER_TOGGLE"]',
  'button[aria-haspopup]',
  'button[aria-expanded="false"]',
];

/** Header menu (desktop) and hamburger menu (mobile) on either site. */
export class SiteNavigation extends SitePage {
  readonly headerLinks = this.page.locator('header a[href]:visible, #SITE_HEADER a[href]:visible, nav a[href]:visible');
  readonly mobileMenuToggle = this.page.locator(MOBILE_MENU_TOGGLES.map((s) => `${s}:visible`).join(', ')).first();

  /** Unique header links as [{ href, text }]. */
  async headerLinkTargets(): Promise<{ href: string; text: string }[]> {
    const links = await this.headerLinks.evaluateAll((as) =>
      as.map((a) => ({
        href: (a as HTMLAnchorElement).href.split('#')[0],
        text: ((a as HTMLElement).innerText || a.getAttribute('aria-label') || '').trim(),
      })),
    );
    const unique = new Map(links.filter((l) => /^https?:/.test(l.href)).map((l) => [l.href, l]));
    return [...unique.values()];
  }

  /**
   * "text|href" of every link currently inside the viewport. The menu counts as opened
   * when NEW entries appear (a plain count is not enough: an overlay menu can hide as many
   * links as it shows).
   */
  async linksInViewport(): Promise<string[]> {
    return this.page.locator('a[href]').evaluateAll((as) =>
      as
        .filter((a) => {
          const r = a.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && r.top >= 0 && r.top < window.innerHeight;
        })
        .map((a) => `${(a as HTMLElement).innerText.trim()}|${(a as HTMLAnchorElement).href}`),
    );
  }
}
