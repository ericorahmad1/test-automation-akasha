import { SitePage } from '../site-page';

/**
 * course.akashayogaacademy.com/checkout?product=<key>
 * A Next.js page that embeds a ThriveCart checkout (iframe) with Stripe card fields inside.
 */
export class CourseCheckoutPage extends SitePage {
  readonly iframe = this.page.locator('iframe[src*="thrivecart"]').first();
  private readonly form = this.iframe.contentFrame();

  // ThriveCart field names are stable; their labels are not exposed as accessible names.
  readonly nameInput = this.form.locator('input[name="customer.name"]');
  readonly emailInput = this.form.locator('input[name="customer.email"]');
  readonly payButton = this.form.getByRole('button', { name: /pay/i }).last();
  readonly blankFieldError = this.form.getByText(/can.t be blank|required/i).first();

  readonly closeButton = this.page.getByRole('button', { name: /close checkout/i });
  readonly robotsMeta = this.page.locator('meta[name="robots"]');

  static path(product: string) {
    return `/checkout?product=${encodeURIComponent(product)}`;
  }

  openProduct(product: string) {
    return this.open(CourseCheckoutPage.path(product));
  }

  async thriveCartUrl() {
    return (await this.iframe.getAttribute('src').catch(() => null)) ?? '(no iframe)';
  }

  /** Stripe Elements renders the card fields in its own iframe. */
  stripeFieldsLoaded() {
    return this.page.frames().some((f) => /js\.stripe\.com\/v3\/elements-inner/.test(f.url()));
  }
}
