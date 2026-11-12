import { SitePage } from '../site-page';

const PURCHASE_TARGETS = [
  'a[href*="/product-page/"]',
  'a[href*="checkout"]',
  'a[href*="thrivecart"]',
  'a[href*="online.akashayogaacademy.com"]',
  'a[href*="course.akashayogaacademy.com/checkout"]',
];

/** A Wix landing page that sells something (e.g. /bali-retreat-enroll-now). */
export class WixEnrollPage extends SitePage {
  /** Visible links that lead to a product page or a checkout. */
  readonly purchaseLinks = this.page.locator(PURCHASE_TARGETS.map((s) => `${s}:visible`).join(', '));

  /** '"ENROLL NOW" → https://…' for every visible enroll-style link: used to explain a finding. */
  async enrollLinkTargets(): Promise<string[]> {
    const links = await this.page.locator('a:visible').evaluateAll((as) =>
      as
        .filter((a) => /enrol|register|buy|join|start/i.test((a as HTMLElement).innerText))
        .map((a) => `"${(a as HTMLElement).innerText.trim()}" → ${(a as HTMLAnchorElement).href}`),
    );
    return [...new Set(links)];
  }
}
