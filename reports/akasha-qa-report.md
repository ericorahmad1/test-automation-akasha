# 🧪 Akasha Yoga Academy Website QA Report
**Run date:** 12 Nov 2026 · **Re-verified:** 16 Nov 2026 · **Tool:** Playwright (automation)
**Scope:** course.akashayogaacademy.com & www.akashayogaacademy.com
- 349 pages from the sitemap
- 8 ThriveCart checkout products (course site)
- 50 Wix Store products + 14 enroll pages
- Desktop & mobile navigation menus (the www mobile menu could not be tested automatically, see AKS-031)

> No real transactions were made. Tests stop at the checkout form, and the Pay/Continue buttons are only clicked with an empty form to check validation.

## 📊 Summary
- **439** tests run → **416 passed**, **23 failed**
- 🔴 Critical: **1** · 🟠 High: **2** · 🟡 Medium: **3** · 🔵 Low: **16** · ⚪ Info: **9**
- The 23 failed tests all come from the Critical, High and Medium findings; Low and Info findings are logged without failing a test.
- All Critical, High and Medium findings were re-checked on the live site on 16 Nov 2026 and are still present.

---

## 🔴 CRITICAL

### AKS-001 · The US$119 promo page cannot be used to purchase
**Page:** <https://www.akashayogaacademy.com/200-hr-online-enroll-now-special>
- The **ENROLL NOW** buttons on the package cards lead to the **homepage**, not to a product/checkout.
- The other ENROLL NOW buttons only scroll to `#en2` on the same page.
- The FAQ section on this page shows unrelated categories (Kundalini India Retreat, India Pilgrimage, Bali Bliss Retreat, 300-hour) instead of FAQs for the 200-hour online course.

**Steps to reproduce**
1. Open the page above
2. Click ENROLL NOW on any package card
3. The visitor lands on the homepage, with no path to checkout

**Recommendation:** point the card buttons to the matching product page, or remove the page from the sitemap if the promo has ended.

---

## 🟠 HIGH

### AKS-002 · ENROLL NOW leads to the homepage instead of checkout (17 pages)
On these pages, at least one ENROLL NOW button links to a homepage instead of a product page or checkout, so prospective buyers have to start searching all over again.

**→ www homepage (15 pages)**
- <https://www.akashayogaacademy.com/ytt>
- <https://www.akashayogaacademy.com/online-200-hr-v2>
- <https://www.akashayogaacademy.com/200-hr-ttc-special>
- <https://www.akashayogaacademy.com/200-hr-online-enroll-now-special>
- <https://www.akashayogaacademy.com/200-hour-online-curriculum>
- <https://www.akashayogaacademy.com/testimonial-online-200-hour>
- <https://www.akashayogaacademy.com/dates-and-prices>
- <https://www.akashayogaacademy.com/bali-bliss>
- <https://www.akashayogaacademy.com/bali-retreat-enroll-now>
- <https://www.akashayogaacademy.com/intro-videos>
- <https://www.akashayogaacademy.com/guided-to-shoulderstand>
- <https://www.akashayogaacademy.com/warrior-2>
- <https://www.akashayogaacademy.com/brochure-download> (2 buttons)
- <https://www.akashayogaacademy.com/design-your-schedule>
- <https://www.akashayogaacademy.com/giving-back>

**→ course site homepage, `course.akashayogaacademy.com/` (2 pages)**
- <https://www.akashayogaacademy.com/200hr-yoga-teacher-training-online>
- <https://www.akashayogaacademy.com/200hr-yoga-teacher-training-online-old> (redirects to the page above, see AKS-017)

**Recommendation:** this is likely a single shared Wix section/component, so fixing the link in one place should be enough. On `/dates-and-prices` and `/bali-bliss`, the other buttons on the same page are already correct and can be used as a reference.

### AKS-003 · Buttons are visible but cannot be clicked (covered by another element)
- <https://www.akashayogaacademy.com/ytt-meet-the-teachers> → first **ENROLL NOW** button
- <https://www.akashayogaacademy.com/breath-challenge> → first **SIGN UP NOW** button

The click is blocked because another element is layered on top of the button (Playwright reports that it "intercepts pointer events"). The second button on the same page works.
**Recommendation:** in the Wix Editor, check for a transparent element stacked on top of the button, then use *Arrange → Bring to front* on the button.

---

## 🟡 MEDIUM

### AKS-004 / AKS-006 · Checkout without a valid product silently sells the 200hr course
- <https://course.akashayogaacademy.com/checkout?product=this-product-does-not-exist> → still shows a ready-to-pay **200hr Essential** checkout
- Two ENROLL NOW buttons on the homepage <https://course.akashayogaacademy.com/> use `/checkout` without `?product=`

The result happens to be correct right now (200hr), but it is error-prone: a typo in an ad or email link could sell the wrong course without anyone noticing.
**Recommendation:** validate the `product` parameter and show "Course not found". Change the homepage links to `/checkout?product=essential`.

### AKS-005 · "Go to the app" ends in a 404 on desktop
- <https://www.akashayogaacademy.com/challenge-page/33418045-401b-4a21-91fa-b3185daf7a5b>

The button links to `/_serverless/challenges-web-serverless/redirect-invite-link`. In a desktop browser this URL returns HTTP 404 ("Not found"). Requested outside a browser, it redirects to a Wix mobile app invite on `fitness.wix.app`, so the button seems to be meant for the mobile app only.
**Recommendation:** hide this button on desktop or change its text, or remove the page from the sitemap if the challenge is no longer active.

---

## 🔵 LOW (16)

These do not block a purchase but are worth cleaning up. Most are console/JavaScript errors.

| ID | Finding | Pages |
|---|---|---|
| AKS-015 | **Wrong checkout tab title:** the Yin, Meditation, Hatha & Pranayama, 300hr, Kundalini India and Feminine Wisdom checkouts are all titled "Secure Checkout, 200-Hour Yoga Teacher Training". The products themselves are correct, but per-course analytics and ad conversion reports can get mixed up. | 6 |
| AKS-017 | **Sitemap lists redirecting URLs:** `/calendar-sign-up` & `/akasha-calendar` → **/podcast**; `/200hr-yoga-teacher-training-online-old` → `/200hr-yoga-teacher-training-online`. Replace them with the final URLs or remove them. | 3 |
| AKS-018 | **"Permissions policy violation: payment is not allowed"** on `/200h-premium` and `/kundalini-india` (course site). The browser blocks the Payment Request API on these pages, which may hide wallet options such as Apple Pay / Google Pay in the checkout. | 2 |
| AKS-009 | **Elfsight widget not displayed** (`APP_VIEWS_LIMIT_REACHED`, view quota exhausted). Check the Elfsight plan/dashboard. | 109 |
| AKS-014 | **Mixpanel "Implementation error"** on www enroll pages (e.g. `/300-hr-online-enroll-now`, `/200hr-ytt-premium`), so tracking on these purchase pages may be unreliable. | 11 |
| AKS-012 | **JS error `navigator.sendBeacon is not a function`** from a Wix script on www enroll/store pages (e.g. `/category/all-products`, `/200hr-ytt-essential`). | 14 |
| AKS-016 | **JS error "Failed to execute 'observe' on 'MutationObserver'"** on 4 www enroll pages (300hr, Yin, Hatha & Pranayama, Meditation), likely a custom embed script looking for an element that is not on the page. | 4 |
| AKS-013 | **React error** on course-site blog pages and `/15th-anniversary`. | 12 |
| AKS-007 / 008 | **Resources failing to load (HTTP 403 Forbidden / 404 Not Found)** on every www page. The automation did not capture which request fails; check DevTools → Network on the homepage to identify it. | 270 |
| AKS-011 | **Resources failing to load** on course-site pages (including the homepage, /about, course, asana and blog pages). | 38 |
| AKS-010 | CSS deprecation warning (`:--productpage_…` → `:state(…)`) on Wix Store product pages. This is Wix platform code; nothing to fix on our side. | 50 |
| AKS-019–022 | Single-page console errors: `/contact` (socket not connected), `/payment-request-page` (no orderPaymentRequestId, expected when opened without an order), challenge page (no user logged in), `/design-your-schedule` (requestStorageAccess denied). | 1 each |

---

## ⚪ INFO (9)

- **AKS-023 · Mixpanel loaded twice** on 62 Wix pages (all 50 product pages + 12 enroll pages), so analytics events may be double-counted. Make sure the Mixpanel snippet is added only once.
- **AKS-024–030 · Content-Security-Policy "Report Only" warnings** on the course pages `/200h-premium`, `/80h-yin`, `/feminine-wisdom`, `/kundalini-india` (string eval plus ThriveCart, Convertri, Google Fonts, YouTube and Google resources). Nothing is blocked today, but these resources would break if the policy is switched to enforce mode.
- **AKS-031 · Mobile menu on www.akashayogaacademy.com could not be tested automatically** (no menu button with an accessible "menu" label). Needs a manual check on a phone.

---

## ✅ What is already working correctly
- **Course site:** all 8 checkout products load the correct ThriveCart product, the form + Stripe card fields appear, the "can't be blank" validation works, and the ✕ button returns to the course page.
- **Course site:** ENROLL NOW on 11 course pages opens the matching product checkout. `/200h-essential/enroll` redirects correctly.
- **Wix Store:** all 50 products pass Add to Cart → Side cart → Checkout → Customer details form. The total price matches the product page.
- **Navigation:** all desktop header menus on both sites work, the course site mobile menu works normally, and no sitemap page returns 404 (the www mobile menu was not covered, see AKS-031).

---

## 🔁 How to re-run
Folder: `test-automation-akasha`
```
npm run test:smoke      # 8 pages per site + all checkout tests, ~15 minutes
npm test                # every sitemap page; the 12 Nov run took ~2 h 20 min (don't let the laptop sleep)
npm run test:checkout   # checkout flows only
```
Reports are saved automatically to `reports/findings-report.html` and `reports/findings-report.md`. Those files list every affected URL for each finding (AKS-001 to AKS-031).
