import { SitePage } from '../site-page';

/** Wix checkout (www.akashayogaacademy.com/checkout-1?checkoutId=…). */
export class WixCheckoutPage extends SitePage {
  readonly emailInput = this.page.locator('input[type="email"]').first();
  readonly total = this.page.getByTestId('TotalsSectionDataHooks.TotalRowValue');
  readonly firstLineItemName = this.page.getByTestId('LineItemDataHooks.Name').first();
  readonly continueButton = this.page.getByTestId('FormDetailsButtons.continue').first();
  /** Any field marked invalid after "Continue" with an empty form. */
  readonly fieldError = this.page.locator('[aria-invalid="true"], [data-hook*="error" i]').first();

  async readTotal() {
    return this.total.innerText().catch(() => null);
  }

  async readFirstLineItem() {
    return this.firstLineItemName.innerText().catch(() => '');
  }
}
