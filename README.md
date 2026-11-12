# Akasha QA Automation

Automated checks (Playwright) for **course.akashayogaacademy.com** (Next.js + ThriveCart) and
**www.akashayogaacademy.com** (Wix Stores): all pages, the navigation flow, and every checkout / enroll button.
Results go into a findings report you can hand straight to the dev/web team.

> ⚠ The tests run against **production** and **never complete a payment or submit a lead form**.
> Checkout tests stop at the form and only click "Pay"/"Continue" with an **empty** form, which
> triggers client-side validation. Adding a product to the Wix cart only creates an anonymous cart.

## Quick start

```bash
npm install
npx playwright install chromium

npm run test:smoke      # 8 pages per site + every checkout test (~15 min)
npm test                # full run: every page in both sitemaps (~45–60 min)
```

| Command | What it does |
| --- | --- |
| `npm run test:course` / `npm run test:main` | One site only (Playwright project `course` or `main`) |
| `npm run test:checkout` | Checkout flows only (tag `@checkout`) |
| `npm run test:health` | Page-health crawl only (tag `@health`) |
| `npm run test:navigation` | Header + mobile menu only (tag `@navigation`) |
| `npx playwright test --project=main --grep "product 80-hour"` | Any combination of project / tag / title |
| `npx playwright test --ui` | Playwright UI mode: pick tests, watch them run, time-travel through steps |
| `FINDINGS_MERGE=1 npx playwright test --last-failed` | Re-run only the failed tests and **merge** the result into the existing report |
| `WORKERS=2 npm test` | Fewer parallel browsers (default 4) |
| `RETRIES=0 npm test` | Disable the automatic retry (default: 1, so a network blip is not reported as a finding) |
| `CHECK_EXTERNAL=1 npm test` | Also check links to Instagram, YouTube, etc. |
| `npm run report` | Open Playwright's HTML report (traces, screenshots, steps) |
| `npm run check` | Type-check + lint (run before committing) |

> Only **one run at a time** per folder: a second run is refused while another is active (`.qa-run.lock`),
> because both would overwrite `data/urls.json`, `test-results/` and `reports/`.
> Keep the laptop awake during a full run (sleep shows up as `ERR_NETWORK_IO_SUSPENDED` / timeouts).

## Output

| File | For whom |
| --- | --- |
| `reports/findings-report.html` | **Main report**: grouped issues, severity, repro steps, screenshot, every affected page. Filterable. |
| `reports/findings-report.md` | Same content in Markdown (Jira / ClickUp / Discord) |
| `reports/findings.json` | Machine-readable (dashboards, CI) |
| `reports/playwright-html/` | Developer view: per-test trace with every `test.step` |

The same issue on many pages (e.g. one console error on 120 Wix pages) is reported **once**, with the list of affected pages.

## What is tested

| Spec | Checks |
| --- | --- |
| `tests/*/page-health.spec.ts`: every sitemap URL | HTTP status, soft-404, sitemap redirects, broken images, broken first-party & Calendly/ThriveCart links, `#anchor` targets, **every visible CTA is clickable**, **CTAs without href do something when clicked**, course checkout links use a valid `?product=` that matches the page, JS/console errors |
| `tests/course/checkout.spec.ts` | Each `?product=` embeds the right ThriveCart product; name/email/Pay + Stripe fields load; empty "Pay" shows validation; page title; click-through from every course page → checkout → "Close" returns; `/enroll` redirects; invalid product; noindex |
| `tests/main/store-checkout.spec.ts` | Every Wix product: name + price → Add to Cart → side cart → `/checkout-1` form; total = product price; order summary = product; empty "Continue" shows validation |
| `tests/main/enroll-pages.spec.ts` | Every enroll / payment-plan page has a button that reaches a product page or checkout |
| `tests/*/navigation.spec.ts` | Each header menu item works (desktop); hamburger menu opens (phone size) |

### Severity

| Level | Meaning | Example |
| --- | --- | --- |
| **Critical** | Blocks a purchase | Checkout doesn't load, Add to Cart does nothing, enroll button → 404 |
| **High** | Wrong/broken in the purchase or main flow | Page 404 in sitemap, CTA covered by another element, wrong course in checkout |
| **Medium** | Broken but with a workaround | Broken normal link, invalid product falls back to 200hr |
| **Low** | Quality / SEO / noise | Wrong page title, console errors, sitemap redirects |
| **Info** | Known third-party noise | CSP report-only warnings |

Critical/High/Medium make the test fail (red in Playwright); Low/Info are only reported.
Severities are defined in one place: [`src/findings/issues.ts`](src/findings/issues.ts).

## Project layout

```text
playwright.config.ts            projects (course / main), baseURL, timeouts, reporters
src/
  config/sites.ts               ← site knowledge: domains, products, checkout slugs, CTA wording
  fixtures.ts                   ← `test` + `expect` to import in every spec (findings, errors, page objects)
  findings/
    issues.ts                   ← every issue type: severity, category, title, recommendation
    findings.ts                 findings.report() / findings.check(): record an issue, keep testing
    reporter.ts                 groups findings → reports/findings.*  (merge mode, screenshots)
    report-templates.ts         HTML + Markdown layout of the report
  pages/                        Page Objects: ALL selectors live here
    site-page.ts                open() = goto + wait for hydration + close cookie banner
    site-navigation.ts          header + hamburger menu
    course/                     CourseLandingPage, CourseCheckoutPage (ThriveCart iframe)
    main/                       WixProductPage (+ side cart), WixCheckoutPage, WixEnrollPage
  suites/                       test suites shared by both sites (page-health, navigation)
  utils/                        sitemap data, link checker, error collector, click observer, text helpers
  global-setup.ts               one-run-at-a-time lock
tests/
  course/                       runs as project "course" (baseURL = course.akashayogaacademy.com)
  main/                         runs as project "main"   (baseURL = www.akashayogaacademy.com)
scripts/discover-urls.mjs       sitemaps → data/urls.json (run automatically by npm test)
```

## Maintenance

| Change on the website | Update |
| --- | --- |
| New course on course.\* | `COURSE_CHECKOUT_PRODUCTS` + `COURSE_PAGE_PRODUCT` in `src/config/sites.ts` |
| New page / product | Nothing: picked up from the sitemap |
| A button / field was renamed or redesigned | The locator in the matching Page Object in `src/pages/` |
| New CTA wording | `CTA_TEXT` in `src/config/sites.ts` |
| Third-party console noise you accept | `KNOWN_THIRD_PARTY_NOISE` in `src/config/sites.ts` |
| An issue should be more / less severe | `severity` in `src/findings/issues.ts` |

## Writing a new test

1. Put it in `tests/course/` or `tests/main/` (the folder decides which site / baseURL it runs against).
2. Import `test` and `expect` from `src/fixtures`, **not** from `@playwright/test`.
3. Use a Page Object fixture for the page, and add new locators to that class, not to the test.
4. Report problems with `findings`, so one run shows every problem instead of stopping at the first:

```ts
import { expect, test } from '../../src/fixtures';
import { Issues } from '../../src/findings/issues';

test('feminine wisdom checkout shows the Pay button', { tag: '@checkout' }, async ({ courseCheckout, findings }) => {
  findings.pageUrl = '/checkout?product=feminine-wisdom';
  await courseCheckout.openProduct('feminine-wisdom');

  await test.step('Pay button renders', () =>
    findings.check(() => expect(courseCheckout.payButton).toBeVisible(), Issues.checkoutFieldMissing, {
      title: 'Checkout form incomplete: Pay button missing',
    }),
  );
});
```

- `findings.check(() => expect(…), Issue)` runs a normal web-first assertion; when it fails, the issue is reported and the test continues.
- `findings.report(Issue, { actual, element, steps })` reports directly (for checks that are not an assertion).
- A new kind of problem gets a new entry in `src/findings/issues.ts`.
- Group the flow with `test.step(...)`: the steps show up in the HTML report and trace viewer.
- Prefer user-facing locators (`getByRole`, `getByText`); on the Wix site `getByTestId('…')` reads Wix's `data-hook` attribute.
- Don't use `page.waitForTimeout()`: wait for something visible with `expect(...)` instead. `npm run lint` flags it.
