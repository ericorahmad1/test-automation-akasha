/**
 * Catalogue of every issue type the tests can report.
 *
 * ➜ To change how serious something is, change `severity` here: nothing else.
 * ➜ `title` is the grouping key in the report: the same title on 50 pages = 1 issue.
 * ➜ Critical / High / Medium make the test fail; Low / Info are only listed in the report.
 */

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

export interface IssueType {
  severity: Severity;
  category: string;
  title: string;
  /** Default "expected" text (a test can override it). */
  expected?: string;
  recommendation?: string;
}

export const FAILING_SEVERITIES: Severity[] = ['Critical', 'High', 'Medium'];

export const Issues = {
  /* ---------------- Page health (every sitemap page) ---------------- */
  pageLoadFailed: {
    severity: 'High', category: 'Page load', title: 'Page failed to load (timeout / network error)',
    expected: 'Page loads within 60s',
  },
  pageHttpError: {
    severity: 'High', category: 'Page load', title: 'Page listed in sitemap returns an HTTP error',
    expected: 'HTTP 200', recommendation: 'Fix the page or remove it from the sitemap / add a redirect.',
  },
  soft404: {
    severity: 'High', category: 'Page load', title: 'Page shows a "not found" message (soft 404)',
    expected: 'Real page content',
  },
  sitemapRedirect: {
    severity: 'Low', category: 'SEO / Sitemap', title: 'Sitemap URL redirects to another page',
    expected: 'Sitemap only lists final (200) URLs', recommendation: 'Replace the URL in the sitemap with the final destination.',
  },
  missingTitle: { severity: 'Low', category: 'SEO / Sitemap', title: 'Page has no <title>', expected: 'Non-empty title' },
  brokenImage: { severity: 'Low', category: 'Broken image', title: 'Image fails to load', expected: 'Image renders' },

  anchorMissing: {
    severity: 'Low', category: 'Broken link', title: 'Anchor link points to a section that does not exist',
  },
  ctaAnchorMissing: {
    severity: 'Medium', category: 'CTA button', title: 'Anchor link points to a section that does not exist',
  },
  linkBroken: { severity: 'Medium', category: 'Broken link', title: 'Broken link (HTTP error)', expected: 'HTTP 200' },
  ctaBroken: { severity: 'High', category: 'CTA button', title: 'CTA button leads to an error page', expected: 'HTTP 200' },
  checkoutCtaBroken: { severity: 'Critical', category: 'CTA button', title: 'CTA button leads to an error page', expected: 'HTTP 200' },
  purchaseCtaToHomepage: {
    severity: 'High', category: 'CTA button', title: 'Purchase button links to the homepage instead of a checkout',
    expected: 'Product page / checkout URL', recommendation: 'Point the button to the right product page or checkout.',
  },
  ctaNotClickable: {
    severity: 'High', category: 'CTA button', title: 'CTA button is visible but cannot be clicked (covered or disabled)',
    expected: 'Button receives the click',
  },
  ctaDoesNothing: {
    severity: 'High', category: 'CTA button', title: 'CTA button does nothing when clicked',
    expected: 'Navigation, popup, or form/cart opens',
  },

  checkoutLinkWithoutProduct: {
    severity: 'Medium', category: 'Checkout', title: 'Checkout CTA has no product parameter (falls back to 200hr checkout)',
    expected: '/checkout?product=<product>', recommendation: 'Add the intended ?product= value so the right course is sold.',
  },
  checkoutLinkUnknownProduct: { severity: 'High', category: 'Checkout', title: 'Checkout CTA uses an unknown product' },
  checkoutLinkWrongProduct: { severity: 'High', category: 'Checkout', title: 'Checkout CTA on a course page sells a different course' },

  /** Title is overridden per message: "Uncaught JS error: …" */
  jsError: { severity: 'Low', category: 'JavaScript error', title: 'Uncaught JS error', expected: 'No uncaught exceptions' },
  /** Title is overridden per message: "Console error: …" */
  consoleError: { severity: 'Low', category: 'Console error', title: 'Console error', expected: 'Clean console' },
  consoleNoise: { severity: 'Info', category: 'Console error', title: 'Console error', expected: 'Clean console' },
  /** Title is overridden per status: "First-party resource returns HTTP 404" */
  firstPartyResourceError: { severity: 'Medium', category: 'Broken resource', title: 'First-party resource returns an HTTP error', expected: 'HTTP 200' },
  firstPartyRequestFailed: { severity: 'Low', category: 'Broken resource', title: 'First-party request failed', expected: 'Request succeeds' },

  /* ---------------- Course checkout (ThriveCart) ---------------- */
  checkoutIframeMissing: {
    severity: 'Critical', category: 'Checkout', title: 'Checkout iframe does not load', expected: 'ThriveCart iframe present',
  },
  checkoutWrongProduct: { severity: 'Critical', category: 'Checkout', title: 'Checkout loads the wrong product' },
  /** Title is overridden per field: "Checkout form incomplete: Email field missing" */
  checkoutFieldMissing: { severity: 'Critical', category: 'Checkout', title: 'Checkout form incomplete' },
  stripeMissing: {
    severity: 'Critical', category: 'Checkout', title: 'Stripe card fields do not load', expected: 'Stripe Elements iframe present',
  },
  payNoValidation: {
    severity: 'High', category: 'Checkout', title: 'Pay button shows no validation on empty form',
    expected: '"can\'t be blank" errors on required fields',
  },
  checkoutTitleWrong: {
    severity: 'Low', category: 'Checkout', title: 'Checkout page title shows the wrong course name',
    recommendation: 'Set the <title> per product (affects browser tab, analytics & ad conversion reports).',
  },
  checkoutJsError: {
    severity: 'Medium', category: 'JavaScript error', title: 'Uncaught JS error on checkout page', expected: 'No uncaught exceptions',
  },
  courseNoEnrollButton: {
    severity: 'Critical', category: 'CTA button', title: 'Course page has no visible Enroll/Checkout button',
    expected: 'At least one visible checkout CTA',
  },
  enrollDoesNotOpenCheckout: {
    severity: 'Critical', category: 'CTA button', title: 'Enroll button does not open checkout', expected: 'Navigates to /checkout',
  },
  enrollOpensWrongCourse: { severity: 'High', category: 'Checkout', title: 'Enroll button opens checkout for a different course' },
  closeCheckoutWrongPage: { severity: 'Medium', category: 'Checkout', title: '"Close checkout" does not return to the course page' },
  enrollShortLinkBroken: { severity: 'Critical', category: 'Checkout', title: 'Enroll short-link does not redirect to checkout' },
  unknownProductFallback: {
    severity: 'Medium', category: 'Checkout', title: 'Invalid/missing product silently falls back to the 200hr checkout',
    expected: 'Error message or redirect to /courses',
    recommendation:
      'Validate ?product= and show "course not found" (or redirect) instead of defaulting to 200hr: a typo in a CTA/ads link would sell the wrong course.',
  },
  missingNoindex: {
    severity: 'Low', category: 'SEO / Sitemap', title: 'Checkout / thank-you page has no noindex meta tag',
    expected: '<meta name="robots" content="noindex">',
    recommendation: 'robots.txt Disallow does not stop indexing of linked URLs; add noindex.',
  },

  /* ---------------- Wix store checkout ---------------- */
  productPageError: { severity: 'High', category: 'Checkout', title: 'Product page returns an error', expected: 'HTTP 200' },
  productMissingNameOrPrice: {
    severity: 'High', category: 'Checkout', title: 'Product page missing name or price', expected: 'Product title + price visible',
  },
  productOutOfStock: {
    severity: 'High', category: 'CTA button', title: 'Product is out of stock (cannot be purchased)', expected: 'Visible "Add to Cart"/"Buy Now"',
  },
  addToCartMissing: {
    severity: 'High', category: 'CTA button', title: 'Add to Cart button missing on product page', expected: 'Visible "Add to Cart"/"Buy Now"',
  },
  addToCartDisabled: { severity: 'High', category: 'CTA button', title: 'Add to Cart button is disabled', expected: 'Enabled' },
  /** Title is overridden with the button text: '"Add to Cart" button does nothing (cart does not open)' */
  addToCartDoesNothing: {
    severity: 'Critical', category: 'CTA button', title: 'Buy button does nothing (cart does not open)',
    expected: 'Side cart opens with the product (or checkout opens)',
  },
  sideCartCheckoutBroken: {
    severity: 'Critical', category: 'Checkout', title: 'Side cart "Checkout" button does not open checkout', expected: '/checkout-1 page',
  },
  wixCheckoutFormMissing: {
    severity: 'Critical', category: 'Checkout', title: 'Wix checkout form does not render',
    expected: 'Customer details form (Email, First name, Last name)',
  },
  checkoutTotalMismatch: { severity: 'High', category: 'Checkout', title: 'Checkout total differs from product page price' },
  checkoutSummaryWrongProduct: { severity: 'High', category: 'Checkout', title: 'Checkout order summary shows a different product' },
  continueNoValidation: {
    severity: 'Medium', category: 'Checkout', title: 'Wix checkout "Continue" shows no validation on empty form',
    expected: 'Required-field errors',
  },

  /* ---------------- Wix enroll pages ---------------- */
  enrollPageNoPurchaseButton: {
    severity: 'Critical', category: 'CTA button', title: 'Enroll page has no working purchase button (cannot buy from this page)',
    expected: 'At least one Enroll button that leads to a product page / checkout',
    recommendation: 'Link the plan buttons to the matching product page (or remove the page from the sitemap if the offer has ended).',
  },
  enrollPageButtonDoesNothing: {
    severity: 'Critical', category: 'CTA button', title: 'Enroll page purchase button does nothing', expected: 'Opens product page / checkout',
  },
  enrollPageButton404: {
    severity: 'Critical', category: 'CTA button', title: 'Enroll page purchase button leads to a 404', expected: 'Product / checkout page',
  },

  /* ---------------- Navigation ---------------- */
  headerNoLinks: { severity: 'High', category: 'Navigation', title: 'Header navigation has no visible links', expected: 'Menu links' },
  headerLinkBroken: { severity: 'High', category: 'Navigation', title: 'Header menu item leads to an error page', expected: 'HTTP 200' },
  mobileToggleNotFound: {
    severity: 'Info', category: 'Navigation', title: 'Mobile menu toggle could not be identified automatically',
    expected: 'Hamburger button with aria-label', recommendation: 'Add aria-label="Open menu" (also improves accessibility).',
  },
  mobileMenuDoesNotOpen: {
    severity: 'High', category: 'Navigation', title: 'Mobile hamburger menu does not open',
    expected: 'Menu links appear after tapping the menu',
  },
} satisfies Record<string, IssueType>;
