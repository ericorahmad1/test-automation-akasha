/**
 * Everything that is specific to the two Akasha websites lives here.
 * Update this file when domains, products, checkout slugs or button wording change.
 */

export type SiteKey = 'course' | 'main';

/**
 * One Playwright project per site (see playwright.config.ts). The project name is the SiteKey.
 * Keep the sitemap URLs in sync with scripts/discover-urls.mjs.
 */
export const SITES: Record<SiteKey, { label: string; baseURL: string; sitemap: string }> = {
  course: {
    label: 'course.akashayogaacademy.com (Next.js / Vercel)',
    baseURL: 'https://course.akashayogaacademy.com',
    sitemap: 'https://course.akashayogaacademy.com/sitemap.xml',
  },
  main: {
    label: 'akashayogaacademy.com (Wix)',
    baseURL: 'https://www.akashayogaacademy.com',
    sitemap: 'https://www.akashayogaacademy.com/sitemap.xml',
  },
};

/** Hosts that belong to Akasha (links to these are always checked). */
export const FIRST_PARTY_HOSTS = [
  'course.akashayogaacademy.com',
  'www.akashayogaacademy.com',
  'akashayogaacademy.com',
  'checkout.akashayogaacademy.com',
  'online.akashayogaacademy.com',
  'akashayogaacademy.thrivecart.com',
];

/** Third-party hosts that are part of the purchase/booking flow (also checked). */
export const FLOW_HOSTS = ['calendly.com'];

/* ------------------------------------------------------------------ */
/* course.akashayogaacademy.com                                        */
/* ------------------------------------------------------------------ */

/**
 * /checkout?product=<key>  →  the ThriveCart product that MUST be embedded,
 * plus a keyword the page title should mention.
 *
 * New course? Add it here AND in COURSE_PAGE_PRODUCT below.
 */
export const COURSE_CHECKOUT_PRODUCTS: Record<string, { thrivecart: string; keyword: RegExp }> = {
  essential: { thrivecart: '200hr-ttc', keyword: /200/i },
  premium: { thrivecart: '200hr-premium', keyword: /200|premium/i },
  '80h-yin': { thrivecart: '80hr-yin-ytt', keyword: /yin/i },
  '80h-hatha-pranayama': { thrivecart: '80hr-hatha', keyword: /hatha|pranayama/i },
  '80h-meditation': { thrivecart: '80hr-meditation', keyword: /meditation/i },
  '300h-ytt': { thrivecart: '300hr', keyword: /300/i },
  'kundalini-india': { thrivecart: 'kundalini-india', keyword: /kundalini|india/i },
  'feminine-wisdom': { thrivecart: 'feminine-wisdom', keyword: /feminine/i },
};

/**
 * Course pages that sell ONE product: every checkout button on that page
 * must point to that product (guards against copy-paste mistakes).
 */
export const COURSE_PAGE_PRODUCT: Record<string, string> = {
  '/200h-essential': 'essential',
  '/200h-premium': 'premium',
  '/80h-yin': '80h-yin',
  '/faq/80h-yin': '80h-yin',
  '/80h-hatha-pranayama': '80h-hatha-pranayama',
  '/faq/80h-hatha-pranayama': '80h-hatha-pranayama',
  '/80h-meditation': '80h-meditation',
  '/300h-ytt': '300h-ytt',
  '/faq/300h-ytt': '300h-ytt',
  '/kundalini-india': 'kundalini-india',
  '/feminine-wisdom': 'feminine-wisdom',
};

/** Short-link style enroll routes that must redirect to a checkout. */
export const COURSE_ENROLL_REDIRECTS: Record<string, string> = {
  '/200h-essential/enroll': '/checkout?product=essential',
};

/** Pages that must carry <meta name="robots" content="noindex">. */
export const COURSE_NOINDEX_PAGES = ['/checkout?product=essential', '/thank-you'];

/* ------------------------------------------------------------------ */
/* www.akashayogaacademy.com (Wix)                                     */
/* ------------------------------------------------------------------ */

/** Sitemap pages that are store products (tested by tests/main/store-checkout.spec.ts). */
export const WIX_PRODUCT_PAGE = /\/product-page\//;

/** Sitemap pages that sell something and must lead to a product page / checkout. */
export const WIX_ENROLL_PAGE = /enroll|payment-plan|upgrade-to-premium|access-extension|support-extension/i;

/* ------------------------------------------------------------------ */
/* Buttons & noise                                                     */
/* ------------------------------------------------------------------ */

/** Text that identifies a "call to action" element. */
export const CTA_TEXT =
  /enrol|book (my|a|your)|book now|buy|checkout|check out|apply|join|register|reserve|sign ?up|add to cart|pay |pay$|get started|start now|claim|secure (my|your)|upgrade|purchase|order now|get access/i;

/** CTA text that means "this button sells something". */
export const PURCHASE_CTA_TEXT = /enrol|buy|checkout|add to cart|pay/i;

/** Elements that are never treated as CTAs (cookie banners, chat widgets…). */
export const CTA_IGNORE = /no thanks|sounds good|accept|reject|cookie|settings|close|menu|skip to/i;

/** Console messages that are known third-party noise → reported as Info only. */
export const KNOWN_THIRD_PARTY_NOISE: RegExp[] = [
  /\[Report Only\]/i, // CSP report-only, not blocking
  /Mixpanel library has already been downloaded/i,
];
