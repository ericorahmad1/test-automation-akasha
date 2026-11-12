/**
 * Custom fixtures: import `test` and `expect` from here, never from '@playwright/test'.
 *
 *   import { test, expect } from '../../src/fixtures';
 *
 *   test('…', async ({ courseCheckout, findings }) => { … });
 *
 * Every fixture is created only when a test asks for it.
 * https://playwright.dev/docs/test-fixtures
 */
import { test as base, expect } from '@playwright/test';
import { SITES, type SiteKey } from './config/sites';
import { Findings } from './findings/findings';
import { CourseCheckoutPage } from './pages/course/course-checkout-page';
import { CourseLandingPage } from './pages/course/course-landing-page';
import { WixCheckoutPage } from './pages/main/wix-checkout-page';
import { WixEnrollPage } from './pages/main/wix-enroll-page';
import { WixProductPage } from './pages/main/wix-product-page';
import { SiteNavigation } from './pages/site-navigation';
import { SitePage } from './pages/site-page';
import { collectErrors, type CollectedErrors } from './utils/error-collector';

interface Fixtures {
  /** Which site this test runs against: the Playwright project name. */
  site: SiteKey;
  /** Records issues for the findings report (see src/findings/findings.ts). */
  findings: Findings;
  /** JS errors, console errors and failed requests collected during the test. */
  errors: CollectedErrors;

  // Page Objects
  sitePage: SitePage;
  navigation: SiteNavigation;
  courseLanding: CourseLandingPage;
  courseCheckout: CourseCheckoutPage;
  wixProduct: WixProductPage;
  wixCheckout: WixCheckoutPage;
  wixEnroll: WixEnrollPage;
}

export const test = base.extend<Fixtures>({
  site: async ({}, use, testInfo) => {
    const name = testInfo.project.name;
    if (!(name in SITES)) throw new Error(`Project "${name}" is not a site. Use one of: ${Object.keys(SITES).join(', ')}`);
    await use(name as SiteKey);
  },
  findings: async ({ page, site }, use, testInfo) => {
    await use(new Findings(page, testInfo, site));
  },
  errors: async ({ page }, use) => {
    await use(collectErrors(page));
  },

  sitePage: async ({ page }, use) => use(new SitePage(page)),
  navigation: async ({ page }, use) => use(new SiteNavigation(page)),
  courseLanding: async ({ page }, use) => use(new CourseLandingPage(page)),
  courseCheckout: async ({ page }, use) => use(new CourseCheckoutPage(page)),
  wixProduct: async ({ page }, use) => use(new WixProductPage(page)),
  wixCheckout: async ({ page }, use) => use(new WixCheckoutPage(page)),
  wixEnroll: async ({ page }, use) => use(new WixEnrollPage(page)),
});

export { expect };
