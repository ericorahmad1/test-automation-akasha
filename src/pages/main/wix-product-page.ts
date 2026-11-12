import { SitePage } from '../site-page';

/**
 * Wix Stores product page (www.akashayogaacademy.com/product-page/<slug>) and its side cart.
 * `getByTestId` reads Wix's data-hook attribute (testIdAttribute in playwright.config.ts).
 */
export class WixProductPage extends SitePage {
  readonly name = this.page.getByTestId('product-title').first();
  readonly price = this.page.getByTestId('formatted-primary-price').first();
  readonly buyButton = this.page.getByTestId('add-to-cart').or(this.page.getByTestId('buy-now-button')).first();
  readonly outOfStockLabel = this.page.getByText(/out of stock|sold out/i).first();
  readonly sideCartCheckoutButton = this.page.getByTestId('CheckoutButtonDataHook.button');

  async readName() {
    return (await this.name.innerText().catch(() => '')).trim();
  }

  async readPrice() {
    return this.price.innerText({ timeout: 10_000 }).catch(() => null);
  }

  /**
   * Clicks "Add to Cart" / "Buy Now" and reports what Wix opened:
   * the side cart, the checkout directly, or nothing (null) within 30s.
   */
  async clickBuy(): Promise<'side-cart' | 'checkout' | null> {
    await this.buyButton.click();
    return Promise.race([
      this.sideCartCheckoutButton.waitFor({ timeout: 30_000 }).then(() => 'side-cart' as const),
      this.page.waitForURL(/\/checkout/, { timeout: 30_000 }).then(() => 'checkout' as const),
    ]).catch(() => null);
  }
}
