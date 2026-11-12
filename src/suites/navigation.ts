/**
 * NAVIGATION: used by tests/course/ and tests/main/.
 *   • every header menu item on the homepage leads to a working page (desktop)
 *   • the hamburger menu opens on a phone-size screen
 */
import { expect, test } from '../fixtures';
import { Issues } from '../findings/issues';
import { firstLine } from '../utils/text';

export function defineNavigationTests() {
  test.describe('Navigation', { tag: '@navigation' }, () => {
    test('header menu links work (desktop)', async ({ navigation, page, findings }) => {
      test.setTimeout(300_000);
      findings.pageUrl = '/';
      await navigation.open('/', { hydrationTimeout: 25_000 });

      const links = await navigation.headerLinkTargets();
      if (links.length === 0) {
        await findings.report(Issues.headerNoLinks, { actual: 'none' });
        return;
      }

      for (const { href, text } of links) {
        await test.step(`menu "${text}" → ${href}`, async () => {
          const result = await page.goto(href, { waitUntil: 'domcontentloaded' }).catch((e: Error) => e);
          const status = result instanceof Error ? 0 : (result?.status() ?? 0);
          if (status === 0 || status >= 400) {
            await findings.report(Issues.headerLinkBroken, {
              element: `"${text}" → ${href}`,
              actual: result instanceof Error ? firstLine(result.message) : `HTTP ${status}`,
              steps: ['Open the homepage', `Click menu item "${text}"`],
            });
          }
        });
      }
    });

    test.describe('mobile', () => {
      test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

      test('hamburger menu opens', async ({ navigation, findings }) => {
        findings.pageUrl = '/';
        await navigation.open('/', { hydrationTimeout: 25_000 });

        const toggle = navigation.mobileMenuToggle;
        if ((await toggle.count()) === 0) {
          await findings.report(Issues.mobileToggleNotFound, { actual: 'No button with aria-label "menu" found' });
          return;
        }

        const before = new Set(await navigation.linksInViewport());
        await toggle.click();

        const menuOpened = async () =>
          (await navigation.linksInViewport()).some((l) => !before.has(l)) ||
          (await toggle.getAttribute('aria-expanded').catch(() => null)) === 'true';

        await findings.check(() => expect.poll(menuOpened, { timeout: 5_000 }).toBe(true), Issues.mobileMenuDoesNotOpen, {
          actual: 'No new links visible and aria-expanded is not "true"',
          steps: ['Open the homepage on a phone', 'Tap the menu icon'],
        });
      });
    });
  });
}
