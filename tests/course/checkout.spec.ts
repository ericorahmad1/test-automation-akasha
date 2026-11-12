/**
 * CHECKOUT: course.akashayogaacademy.com (Next.js + ThriveCart iframe + Stripe)
 *
 *   Course page → "Enroll Now" → /checkout?product=X
 *   → ThriveCart iframe (right product) → contact form + Stripe card fields
 *   → "Pay" with an empty form shows validation → "Close checkout" returns to the course page
 *
 * ⚠ No payment is ever submitted: the form stays empty, so ThriveCart's validation stops it.
 */
import {
  COURSE_CHECKOUT_PRODUCTS,
  COURSE_ENROLL_REDIRECTS,
  COURSE_NOINDEX_PAGES,
  COURSE_PAGE_PRODUCT,
} from '../../src/config/sites';
import { expect, test } from '../../src/fixtures';
import { Issues } from '../../src/findings/issues';
import { CourseCheckoutPage } from '../../src/pages/course/course-checkout-page';
import { escapeRegExp } from '../../src/utils/text';

/** Matches a ThriveCart URL for the given product slug: …thrivecart.com/<slug>/ */
const thriveCartProduct = (product: string) => new RegExp(`/${escapeRegExp(COURSE_CHECKOUT_PRODUCTS[product].thrivecart)}/`);

test.describe('Course checkout: each product loads the right ThriveCart form', { tag: '@checkout' }, () => {
  for (const [product, { thrivecart, keyword }] of Object.entries(COURSE_CHECKOUT_PRODUCTS)) {
    test(`checkout?product=${product}`, async ({ courseCheckout: checkout, page, findings, errors }) => {
      const path = CourseCheckoutPage.path(product);
      const steps = [`Open ${path}`];
      findings.pageUrl = path;
      await checkout.openProduct(product);

      const iframeLoaded = await test.step('ThriveCart iframe loads', () =>
        findings.check(() => expect(checkout.iframe).toBeAttached({ timeout: 30_000 }), Issues.checkoutIframeMissing, {
          actual: 'No iframe after 30s', steps,
        }),
      );
      if (!iframeLoaded) return;

      await test.step('iframe sells the right product', () =>
        findings.check(() => expect(checkout.iframe).toHaveAttribute('src', thriveCartProduct(product)), Issues.checkoutWrongProduct, async () => ({
          expected: `ThriveCart /${thrivecart}/`, actual: await checkout.thriveCartUrl(), steps,
        })),
      );

      const formComplete = await test.step('name, email and Pay button render', async () => {
        const fields = { 'Name field': checkout.nameInput, 'Email field': checkout.emailInput, 'Pay button': checkout.payButton };
        for (const [label, field] of Object.entries(fields)) {
          const ok = await findings.check(() => expect(field).toBeAttached({ timeout: 30_000 }), Issues.checkoutFieldMissing, {
            title: `Checkout form incomplete: ${label} missing`,
            expected: `${label} rendered inside ThriveCart`, actual: 'Not found after 30s', steps,
          });
          if (!ok) return false;
        }
        return true;
      });
      if (!formComplete) return;

      await test.step('Stripe card fields load', () =>
        findings.check(() => expect.poll(() => checkout.stripeFieldsLoaded(), { timeout: 30_000 }).toBe(true), Issues.stripeMissing, {
          actual: 'Missing', steps,
        }),
      );

      await test.step('"Pay" with an empty form shows validation (no charge)', async () => {
        await checkout.payButton.click();
        await findings.check(() => expect(checkout.blankFieldError).toBeVisible({ timeout: 10_000 }), Issues.payNoValidation, {
          actual: 'No validation message shown', steps: [...steps, 'Click "Pay with Card" with an empty form'],
        });
      });

      await test.step('page title names the course', () =>
        findings.check(() => expect(page).toHaveTitle(keyword, { timeout: 2_000 }), Issues.checkoutTitleWrong, async () => ({
          expected: `Title mentions ${keyword}`, actual: await page.title(),
        })),
      );

      // Uncaught JS errors on a checkout are more serious than elsewhere
      for (const msg of new Set(errors.pageErrors)) {
        await findings.report(Issues.checkoutJsError, { actual: msg.slice(0, 200) });
      }
    });
  }
});

test.describe('Course checkout: click-through from each course page', { tag: '@checkout' }, () => {
  for (const [path, product] of Object.entries(COURSE_PAGE_PRODUCT)) {
    test(`${path} → Enroll → checkout → Close`, async ({ courseLanding, courseCheckout, page, findings }) => {
      findings.pageUrl = path;
      await courseLanding.open(path);

      const hasButton = await findings.check(() => expect(courseLanding.enrollButton).toBeVisible({ timeout: 5_000 }), Issues.courseNoEnrollButton, {
        actual: 'None found',
      });
      if (!hasButton) return;

      const buttonText = await courseLanding.enrollButtonText();
      const steps = [`Open ${path}`, `Click "${buttonText}"`];

      const opened = await test.step(`click "${buttonText}"`, async () => {
        await courseLanding.enrollButton.click();
        // toHaveURL only waits for the URL, not for the heavy ThriveCart iframe to finish loading
        return findings.check(() => expect(page).toHaveURL(/\/checkout/, { timeout: 20_000 }), Issues.enrollDoesNotOpenCheckout, () => ({
          element: `"${buttonText}"`, actual: `Stayed on ${page.url()}`, steps,
        }));
      });
      if (!opened) return;

      await test.step('checkout is for this course', async () => {
        await findings.check(
          () => expect(page).toHaveURL(new RegExp(`[?&]product=${escapeRegExp(product)}(&|$)`), { timeout: 5_000 }),
          Issues.enrollOpensWrongCourse,
          () => ({ element: `"${buttonText}"`, expected: `product=${product}`, actual: `product=${new URL(page.url()).searchParams.get('product')}`, steps }),
        );
        await findings.check(
          () => expect(courseCheckout.iframe).toHaveAttribute('src', thriveCartProduct(product), { timeout: 30_000 }),
          Issues.checkoutWrongProduct,
          async () => ({ expected: `ThriveCart /${COURSE_CHECKOUT_PRODUCTS[product].thrivecart}/`, actual: await courseCheckout.thriveCartUrl(), steps }),
        );
      });

      await test.step('"Close checkout" returns to the course page', async () => {
        await courseCheckout.dismissOverlays();
        await courseCheckout.closeButton.click();
        await findings.check(
          () => expect.poll(() => new URL(page.url()).pathname, { timeout: 10_000 }).toBe(path),
          Issues.closeCheckoutWrongPage,
          () => ({ expected: path, actual: page.url(), steps: [...steps, 'Click ✕ (Close checkout)'] }),
        );
      });
    });
  }
});

test.describe('Course checkout: redirects & negative cases', { tag: '@checkout' }, () => {
  for (const [from, to] of Object.entries(COURSE_ENROLL_REDIRECTS)) {
    test(`${from} redirects to ${to}`, async ({ sitePage, page, findings }) => {
      findings.pageUrl = from;
      await sitePage.open(from);
      await findings.check(() => expect(page).toHaveURL(new RegExp(`${escapeRegExp(to)}$`)), Issues.enrollShortLinkBroken, () => ({
        expected: to, actual: page.url(),
      }));
    });
  }

  test('unknown product does not silently sell the 200hr course', async ({ courseCheckout: checkout, findings }) => {
    const product = 'this-product-does-not-exist';
    findings.pageUrl = CourseCheckoutPage.path(product);
    await checkout.openProduct(product);
    await findings.check(() => expect(checkout.iframe).toHaveCount(0, { timeout: 5_000 }), Issues.unknownProductFallback, async () => ({
      actual: `Shows payable checkout: ${await checkout.thriveCartUrl()}`, steps: [`Open ${findings.pageUrl}`],
    }));
  });

  for (const path of COURSE_NOINDEX_PAGES) {
    test(`${path} is not indexable`, async ({ courseCheckout, page, findings }) => {
      findings.pageUrl = path;
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await findings.check(
        () => expect(courseCheckout.robotsMeta).toHaveAttribute('content', /noindex/i, { timeout: 2_000 }),
        Issues.missingNoindex,
        async () => ({ actual: (await courseCheckout.robotsMeta.getAttribute('content', { timeout: 1_000 }).catch(() => null)) ?? '(none: only robots.txt Disallow)' }),
      );
    });
  }
});
