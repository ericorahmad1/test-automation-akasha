import type { Locator, Page, Response } from '@playwright/test';

/**
 * Base Page Object shared by both sites: opening a page the same way everywhere.
 * Specific pages (checkout, product page…) extend this class and add their locators.
 */
export class SitePage {
  constructor(readonly page: Page) {}

  /**
   * Opens a URL or a path (relative to the project's baseURL), waits until the page
   * reacts to clicks, and closes cookie banners.
   */
  async open(url: string, { hydrationTimeout = 15_000 } = {}): Promise<Response | null> {
    const response = await this.page.goto(url, { waitUntil: 'load' });
    await this.waitUntilHydrated(hydrationTimeout);
    await this.dismissOverlays();
    return response;
  }

  /**
   * Wix (and the ThriveCart iframe) ignore clicks until their JavaScript has hydrated
   * the page. There is no element that signals "ready", so we wait (bounded) for the
   * network to go quiet. Without this, tests report false "button does nothing" findings.
   */
  async waitUntilHydrated(timeout = 15_000) {
    // eslint-disable-next-line playwright/no-networkidle
    await this.page.waitForLoadState('networkidle', { timeout }).catch(() => {});
  }

  /** Close cookie banners / popups that would intercept clicks. */
  async dismissOverlays() {
    const overlays: Locator[] = [
      this.page.getByRole('button', { name: /^no thanks$/i }), // course site cookie banner
      this.page.locator('[data-hook="consent-banner-apply-button"]'), // Wix consent banner
    ];
    for (const button of overlays) {
      if (await button.count()) await button.first().click({ timeout: 4_000 }).catch(() => {});
    }
  }
}
