/**
 * CHECKOUT: www.akashayogaacademy.com (Wix Stores), one test per product page.
 *
 *   Product page → name + price → "Add to Cart" → side cart → "Checkout"
 *   → /checkout-1 (customer form, same total, same product) → "Continue" with an empty form shows validation
 *
 * ⚠ No order is ever placed: adding to cart only creates an anonymous cart.
 */
import { expect, test } from '../../src/fixtures';
import { Issues } from '../../src/findings/issues';
import { wixProductPages } from '../../src/utils/sitemap';
import { moneyDigits } from '../../src/utils/text';

test.describe('Wix store: every product can be added to cart and reaches checkout', { tag: '@checkout' }, () => {
  for (const url of wixProductPages()) {
    const slug = url.split('/product-page/')[1];

    test(`product ${slug}`, async ({ wixProduct: product, wixCheckout: checkout, page, findings }) => {
      findings.pageUrl = url;
      const steps = [`Open ${url}`];

      const productPage = await test.step('product page shows name, price and a buy button', async () => {
        const res = await product.open(url, { hydrationTimeout: 25_000 });
        if (!res || res.status() >= 400) {
          await findings.report(Issues.productPageError, { actual: `HTTP ${res?.status()}` });
          return null;
        }
        const name = await product.readName();
        const price = await product.readPrice();
        if (!name || !price) {
          await findings.report(Issues.productMissingNameOrPrice, { actual: `title="${name}" price="${price}"` });
        }
        if (!(await product.buyButton.isVisible())) {
          const soldOut = await product.outOfStockLabel.isVisible();
          await findings.report(soldOut ? Issues.productOutOfStock : Issues.addToCartMissing, { actual: soldOut ? 'Out of stock' : 'No buy button' });
          return null;
        }
        if (!(await product.buyButton.isEnabled())) {
          await findings.report(Issues.addToCartDisabled, { actual: 'disabled' });
          return null;
        }
        return { name, price, buyText: (await product.buyButton.innerText()).trim() };
      });
      if (!productPage) return;

      const { name, price, buyText } = productPage;
      steps.push(`Click "${buyText}"`);

      const reachedCheckout = await test.step(`"${buyText}" → side cart → checkout`, async () => {
        const opened = await product.clickBuy();
        if (!opened) {
          await findings.report(Issues.addToCartDoesNothing, {
            title: `"${buyText}" button does nothing (cart does not open)`,
            actual: 'Nothing happened after 30s', steps: [`Open ${url}`, 'Wait until the page is fully loaded', `Click "${buyText}"`],
          });
          return false;
        }
        if (opened === 'side-cart') {
          await product.sideCartCheckoutButton.click();
          steps.push('Click "Checkout" in the side cart');
          return findings.check(() => expect(page).toHaveURL(/\/checkout/, { timeout: 30_000 }), Issues.sideCartCheckoutBroken, () => ({
            actual: page.url(), steps,
          }));
        }
        return true;
      });
      if (!reachedCheckout) return;

      const formShown = await test.step('checkout form renders', async () => {
        await checkout.waitUntilHydrated(20_000);
        return findings.check(() => expect(checkout.emailInput).toBeVisible({ timeout: 30_000 }), Issues.wixCheckoutFormMissing, {
          actual: 'Email field missing after 30s', steps,
        });
      });
      if (!formShown) return;

      await test.step('order summary matches the product page', async () => {
        const total = await checkout.readTotal();
        if (price && total && moneyDigits(total) !== moneyDigits(price)) {
          await findings.report(Issues.checkoutTotalMismatch, { expected: price, actual: total, steps: [...steps, 'Compare Total'] });
        }
        const lineItem = await checkout.readFirstLineItem();
        if (name && lineItem && !lineItem.toLowerCase().includes(name.slice(0, 20).toLowerCase())) {
          await findings.report(Issues.checkoutSummaryWrongProduct, { expected: name, actual: lineItem });
        }
      });

      await test.step('"Continue" with an empty form shows validation (no order)', async () => {
        if (!(await checkout.continueButton.isVisible())) return;
        await checkout.continueButton.click();
        await findings.check(() => expect(checkout.fieldError).toBeVisible({ timeout: 8_000 }), Issues.continueNoValidation, {
          actual: 'No error shown',
        });
      });
    });
  }
});
