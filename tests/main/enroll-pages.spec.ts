/**
 * ENROLL PAGES: www.akashayogaacademy.com
 * Every landing page that sells something must have a button that reaches a product page or checkout.
 */
import type { Page } from '@playwright/test';
import { test } from '../../src/fixtures';
import { Issues } from '../../src/findings/issues';
import { wixEnrollPages } from '../../src/utils/sitemap';

test.describe('Wix enroll pages: purchase button reaches a product page or checkout', { tag: '@checkout' }, () => {
  test.describe.configure({ timeout: 150_000 });

  for (const url of wixEnrollPages()) {
    test(`enroll ${new URL(url).pathname}`, async ({ wixEnroll: enrollPage, page, findings }) => {
      findings.pageUrl = url;
      await enrollPage.open(url, { hydrationTimeout: 25_000 });

      if ((await enrollPage.purchaseLinks.count()) === 0) {
        // Explain where the enroll-style buttons go instead
        const targets = await enrollPage.enrollLinkTargets();
        await findings.report(Issues.enrollPageNoPurchaseButton, {
          element: targets.slice(0, 5).join(' | ') || undefined,
          actual: targets.length ? `Enroll buttons only go to: ${targets.slice(0, 4).join('; ')}` : 'No enroll buttons found',
          steps: [`Open ${url}`, 'Click any "Enroll Now" button on the plan cards', 'You land on the homepage / same page: no checkout'],
        });
        return;
      }

      const button = enrollPage.purchaseLinks.first();
      const text = (await button.innerText()).trim() || '(image button)';
      const element = `"${text}" → ${await button.getAttribute('href')}`;

      const destination = await test.step(`click "${text}"`, async () => {
        const popup = page.context().waitForEvent('page', { timeout: 15_000 }).catch(() => null);
        await button.click();
        const sameTab = page.waitForURL((u) => u.href !== url, { timeout: 15_000 }).then(() => page);
        return Promise.race<Page | null>([popup, sameTab]).catch(() => null);
      });
      if (!destination) {
        await findings.report(Issues.enrollPageButtonDoesNothing, { element, actual: 'No navigation', steps: [`Open ${url}`, `Click "${text}"`] });
        return;
      }

      await destination.waitForLoadState('load').catch(() => {});
      const title = await destination.title().catch(() => '');
      if (/not found|404|isn.t available/i.test(title)) {
        await findings.report(Issues.enrollPageButton404, { element, actual: `${destination.url()} (${title})` });
      }
    });
  }
});
