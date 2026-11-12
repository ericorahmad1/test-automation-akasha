# Laporan Temuan QA — Akasha Yoga Academy
- **Tanggal run:** 2026-11-12 07:58 UTC
- **Cakupan:** course.akashayogaacademy.com & www.akashayogaacademy.com (semua halaman sitemap, flow checkout, navigasi)
- **Test:** 439 total · 416 lulus · 23 gagal · 0 skip
- **Temuan:** Critical: 1 · High: 2 · Medium: 3 · Low: 16 · Info: 9
| ID | Severity | Kategori | Temuan | Halaman terdampak |
|---|---|---|---|---|
| AKS-001 | Critical | CTA button | Enroll page has no working purchase button (cannot buy from this page) | 1 |
| AKS-002 | High | CTA button | Purchase button links to the homepage instead of a checkout | 17 |
| AKS-003 | High | CTA button | CTA button is visible but cannot be clicked (covered or disabled) | 2 |
| AKS-004 | Medium | Checkout | Checkout CTA has no product parameter (falls back to 200hr checkout) | 1 |
| AKS-005 | Medium | Broken link | Broken link (HTTP error) | 1 |
| AKS-006 | Medium | Checkout | Invalid/missing product silently falls back to the 200hr checkout | 1 |
| AKS-007 | Low | Console error | Console error: Failed to load resource: the server responded with a status of N (Forbidden) | 270 |
| AKS-008 | Low | Console error | Console error: Failed to load resource: the server responded with a status of N (Not Found) | 270 |
| AKS-009 | Low | Console error | Console error: eapps.Platform throws: "Widget "…-d91f-4bc7-8dfb-…" can`t be initialized because APP_VIEWS_LIMIT_REACHED" with 
	 -> JSHandle@node | 109 |
| AKS-010 | Low | Console error | Console error: Custom state pseudo classes have been changed from ":--productpage_subscriptionstextcolor" to ":state(productpage_subscriptionstextcolor)". See more here: https | 50 |
| AKS-011 | Low | Console error | Console error: Failed to load resource: the server responded with a status of N () | 38 |
| AKS-012 | Low | Console error | Console error: TypeError: navigator.sendBeacon is not a function
    at Object.eval [as flushHandler] (https://static.parastorage.com/…
    at oe.flush (https://static.parasto | 14 |
| AKS-013 | Low | JavaScript error | Uncaught JS error: Minified React error #N; visit https://reactjs.org/… for the full message or use the non-minified dev environment for full errors and additional helpful warning | 12 |
| AKS-014 | Low | Console error | Console error: Mixpanel error: Implementation error. Please turn on debug and contact support@mixpanel.com. | 11 |
| AKS-015 | Low | Checkout | Checkout page title shows the wrong course name | 6 |
| AKS-016 | Low | JavaScript error | Uncaught JS error: Failed to execute 'observe' on 'MutationObserver': parameter 1 is not of type 'Node'. | 4 |
| AKS-017 | Low | SEO / Sitemap | Sitemap URL redirects to another page | 3 |
| AKS-018 | Low | Console error | Console error: Permissions policy violation: payment is not allowed in this document. | 2 |
| AKS-019 | Low | Console error | Console error: Failed to load resource: net::ERR_SOCKET_NOT_CONNECTED | 1 |
| AKS-020 | Low | Console error | Console error: No orderPaymentRequestId | 1 |
| AKS-021 | Low | Console error | Console error: Error with getting user email No user is currently logged in | 1 |
| AKS-022 | Low | Console error | Console error: requestStorageAccess: Permission denied. | 1 |
| AKS-023 | Info | Console error | Console error: Mixpanel error: The Mixpanel library has already been downloaded at least once. Ensure that the Mixpanel code snippet only appears once on the page (and is not  | 62 |
| AKS-024 | Info | Console error | Console error: [Report Only] Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script in the following Content Security Policy direc | 4 |
| AKS-025 | Info | Console error | Console error: [Report Only] Refused to load the script 'https://editor-cdn.thrivecart.com/…' because it violates the following Content Security Policy directive: "script-src  | 3 |
| AKS-026 | Info | Console error | Console error: [Report Only] Refused to load the script 'https://cdn.convertri.com/…' because it violates the following Content Security Policy directive: "script-src 'self' ' | 3 |
| AKS-027 | Info | Console error | Console error: [Report Only] Refused to load the font 'https://cdn.convertri.com/…' because it violates the following Content Security Policy directive: "font-src 'self' https | 3 |
| AKS-028 | Info | Console error | Console error: [Report Only] Refused to load the stylesheet 'https://fonts.googleapis.com/…' because it violates the following Content Security Policy directive: "style-src 's | 3 |
| AKS-029 | Info | Console error | Console error: [Report Only] Refused to load the script 'https://www.youtube-nocookie.com/…' because it violates the following Content Security Policy directive: "script-src ' | 1 |
| AKS-030 | Info | Console error | Console error: [Report Only] Refused to load the script 'https://www.google.com/…' because it violates the following Content Security Policy directive: "script-src 'unsafe-inl | 1 |
| AKS-031 | Info | Navigation | Mobile menu toggle could not be identified automatically | 1 |

## AKS-001 · [Critical] Enroll page has no working purchase button (cannot buy from this page)
- **Kategori:** CTA button
- **Situs:** main
- **Expected:** At least one Enroll button that leads to a product page / checkout
- **Actual:** Enroll buttons only go to: "ENROLL NOW" → https://www.akashayogaacademy.com/; "ENROLL NOW" → https://www.akashayogaacademy.com/200-hr-online-enroll-now-special#en2; "REGISTER NOW – DECIDE LATER" → https://www.akashayogaacademy.com/200-hr-online-enroll-now-special#en2
- **Rekomendasi:** Link the plan buttons to the matching product page (or remove the page from the sitemap if the offer has ended).

**Langkah reproduksi:**
1. Open https://www.akashayogaacademy.com/200-hr-online-enroll-now-special
2. Click any "Enroll Now" button on the plan cards
3. You land on the homepage / same page — no checkout

![screenshot](screenshots/AKS-001.png)

**Terjadi di (1):**
- https://www.akashayogaacademy.com/200-hr-online-enroll-now-special — `"ENROLL NOW" → https://www.akashayogaacademy.com/ | "ENROLL NOW" → https://www.akashayogaacademy.com/200-hr-online-enroll-now-special#en2 | "REGISTER NOW – DECIDE LATER" → https://www.akashayogaacademy.com/200-hr-online-enroll-now-special#en2`

## AKS-002 · [High] Purchase button links to the homepage instead of a checkout
- **Kategori:** CTA button
- **Situs:** main
- **Expected:** Product page / checkout URL
- **Actual:** https://www.akashayogaacademy.com/
- **Rekomendasi:** Point the button to the right product page or checkout.

**Langkah reproduksi:**
1. Open https://www.akashayogaacademy.com/online-200-hr-v2
2. Click "ENROLL NOW"

**Terjadi di (18):**
- https://www.akashayogaacademy.com/online-200-hr-v2 — `"ENROLL NOW" → https://www.akashayogaacademy.com/`
- https://www.akashayogaacademy.com/bali-bliss — `"ENROLL NOW" → https://www.akashayogaacademy.com/`
- https://www.akashayogaacademy.com/200hr-yoga-teacher-training-online — `"ENROLL NOW" → https://course.akashayogaacademy.com/`
- https://www.akashayogaacademy.com/warrior-2 — `"Enroll Now" → https://www.akashayogaacademy.com/`
- https://www.akashayogaacademy.com/dates-and-prices — `"ENROLL NOW" → https://www.akashayogaacademy.com/`
- https://www.akashayogaacademy.com/intro-videos — `"ENROLL NOW" → https://www.akashayogaacademy.com/`
- https://www.akashayogaacademy.com/guided-to-shoulderstand — `"Enroll Now" → https://www.akashayogaacademy.com/`
- https://www.akashayogaacademy.com/design-your-schedule — `"Enroll Now" → https://www.akashayogaacademy.com/`
- https://www.akashayogaacademy.com/brochure-download — `"Enroll Now" → https://www.akashayogaacademy.com/`
- https://www.akashayogaacademy.com/brochure-download — `"ENROLL NOW" → https://www.akashayogaacademy.com/`
- https://www.akashayogaacademy.com/ytt — `"ENROLL NOW" → https://www.akashayogaacademy.com/`
- https://www.akashayogaacademy.com/200hr-yoga-teacher-training-online-old — `"ENROLL NOW" → https://course.akashayogaacademy.com/`
- https://www.akashayogaacademy.com/200-hr-ttc-special — `"ENROLL NOW" → https://www.akashayogaacademy.com/`
- https://www.akashayogaacademy.com/200-hr-online-enroll-now-special — `"ENROLL NOW" → https://www.akashayogaacademy.com/`
- https://www.akashayogaacademy.com/giving-back — `"ENROLL NOW" → https://www.akashayogaacademy.com/`
- https://www.akashayogaacademy.com/bali-retreat-enroll-now — `"ENROLL NOW" → https://www.akashayogaacademy.com/`
- https://www.akashayogaacademy.com/testimonial-online-200-hour — `"ENROLL NOW" → https://www.akashayogaacademy.com/`
- https://www.akashayogaacademy.com/200-hour-online-curriculum — `"ENROLL NOW" → https://www.akashayogaacademy.com/`

## AKS-003 · [High] CTA button is visible but cannot be clicked (covered or disabled)
- **Kategori:** CTA button
- **Situs:** main
- **Expected:** Button receives the click
- **Actual:** locator.click: Timeout 6000ms exceeded.

**Langkah reproduksi:**
1. Open https://www.akashayogaacademy.com/ytt-meet-the-teachers
2. Click "ENROLL NOW"

![screenshot](screenshots/AKS-003.png)

**Terjadi di (2):**
- https://www.akashayogaacademy.com/ytt-meet-the-teachers — `"ENROLL NOW" → https://www.akashayogaacademy.com/enroll-now`
- https://www.akashayogaacademy.com/breath-challenge — `"SIGN UP NOW" → https://www.akashayogaacademy.com/6-day-yin-yoga-challenge-landing`

## AKS-004 · [Medium] Checkout CTA has no product parameter (falls back to 200hr checkout)
- **Kategori:** Checkout
- **Situs:** course
- **Expected:** /checkout?product=<product>
- **Actual:** /checkout
- **Rekomendasi:** Add the intended ?product= value so the right course is sold.

**Terjadi di (1):**
- https://course.akashayogaacademy.com/ — `"ENROLL NOW" → /checkout`

## AKS-005 · [Medium] Broken link (HTTP error)
- **Kategori:** Broken link
- **Situs:** main
- **Expected:** HTTP 200
- **Actual:** HTTP 404

**Langkah reproduksi:**
1. Open https://www.akashayogaacademy.com/challenge-page/33418045-401b-4a21-91fa-b3185daf7a5b
2. Click "Go to the app"

**Terjadi di (1):**
- https://www.akashayogaacademy.com/challenge-page/33418045-401b-4a21-91fa-b3185daf7a5b — `"Go to the app" → https://www.akashayogaacademy.com/_serverless/challenges-web-serverless/redirect-invite-link?programId=33418045-401b-4a21-91fa-b3185daf7a5b`

## AKS-006 · [Medium] Invalid/missing product silently falls back to the 200hr checkout
- **Kategori:** Checkout
- **Situs:** course
- **Expected:** Error message or redirect to /courses
- **Actual:** Shows payable checkout: https://akashayogaacademy.thrivecart.com/200hr-ttc/
- **Rekomendasi:** Validate ?product= and show "course not found" (or redirect) instead of defaulting to 200hr — a typo in a CTA/ads link would sell the wrong course.

**Langkah reproduksi:**
1. Open https://course.akashayogaacademy.com/checkout?product=this-product-does-not-exist

![screenshot](screenshots/AKS-006.png)

**Terjadi di (1):**
- https://course.akashayogaacademy.com/checkout?product=this-product-does-not-exist

## AKS-007 · [Low] Console error: Failed to load resource: the server responded with a status of N (Forbidden)
- **Kategori:** Console error
- **Situs:** main
- **Expected:** Clean console
- **Actual:** Failed to load resource: the server responded with a status of N (Forbidden)

**Terjadi di (270):**
- https://www.akashayogaacademy.com/
- https://www.akashayogaacademy.com/post/new-year-s-resolutions-determination-vs-surrender
- https://www.akashayogaacademy.com/post/freedom-through-movement-with-bex-tyrer
- https://www.akashayogaacademy.com/post/chakra-introduction
- https://www.akashayogaacademy.com/post/epic-yoga-festival-in-marrakech-morocco
- https://www.akashayogaacademy.com/post/we-have-two-available-scholarships-for-our-yoga-alliance-certified-online-teacher-training-in-may
- https://www.akashayogaacademy.com/post/holding-space
- https://www.akashayogaacademy.com/post/flow-state-meeting-the-present-moment-in-motion
- https://www.akashayogaacademy.com/post/berlin-yoga-conference
- https://www.akashayogaacademy.com/post/ubud-the-perfect-setting-for-a-yoga-teacher-training-in-bali
- https://www.akashayogaacademy.com/post/108-sun-salutations-fundraiser-for-mental-health-awareness
- https://www.akashayogaacademy.com/post/the-journey-of-a-yogi-by-jacc-wright
- https://www.akashayogaacademy.com/blog/categories/graduates
- https://www.akashayogaacademy.com/blog
- https://www.akashayogaacademy.com/blog/categories/sharing
- https://www.akashayogaacademy.com/post/the-journey-of-a-yogini-who-upcycles-tyres
- https://www.akashayogaacademy.com/product-page/50-hour-uk-yoga-life-coach-training
- https://www.akashayogaacademy.com/product-page/kundalini-awakening-retreat-in-india
- https://www.akashayogaacademy.com/product-page/300-hour-advanced-yoga-ttc-payment-plan-1-x-80-hour-already-purchased
- https://www.akashayogaacademy.com/product-page/1-month-course-access
- https://www.akashayogaacademy.com/product-page/80-hour-meditation-ttc
- https://www.akashayogaacademy.com/product-page/200-hour-ttc-essential
- https://www.akashayogaacademy.com/product-page/200-hour-online-yoga-teacher-training
- https://www.akashayogaacademy.com/product-page/copy-of-200-hour-yoga-teacher-training-essential-payment-plan
- https://www.akashayogaacademy.com/product-page/one-on-one-coaching-individual-session
- …dan 245 lainnya (lihat findings.json)

## AKS-008 · [Low] Console error: Failed to load resource: the server responded with a status of N (Not Found)
- **Kategori:** Console error
- **Situs:** main
- **Expected:** Clean console
- **Actual:** Failed to load resource: the server responded with a status of N (Not Found)

**Terjadi di (270):**
- https://www.akashayogaacademy.com/
- https://www.akashayogaacademy.com/post/new-year-s-resolutions-determination-vs-surrender
- https://www.akashayogaacademy.com/post/freedom-through-movement-with-bex-tyrer
- https://www.akashayogaacademy.com/post/chakra-introduction
- https://www.akashayogaacademy.com/post/epic-yoga-festival-in-marrakech-morocco
- https://www.akashayogaacademy.com/post/we-have-two-available-scholarships-for-our-yoga-alliance-certified-online-teacher-training-in-may
- https://www.akashayogaacademy.com/post/holding-space
- https://www.akashayogaacademy.com/post/flow-state-meeting-the-present-moment-in-motion
- https://www.akashayogaacademy.com/post/berlin-yoga-conference
- https://www.akashayogaacademy.com/post/ubud-the-perfect-setting-for-a-yoga-teacher-training-in-bali
- https://www.akashayogaacademy.com/post/108-sun-salutations-fundraiser-for-mental-health-awareness
- https://www.akashayogaacademy.com/post/the-journey-of-a-yogi-by-jacc-wright
- https://www.akashayogaacademy.com/blog/categories/graduates
- https://www.akashayogaacademy.com/blog
- https://www.akashayogaacademy.com/blog/categories/sharing
- https://www.akashayogaacademy.com/post/the-journey-of-a-yogini-who-upcycles-tyres
- https://www.akashayogaacademy.com/product-page/50-hour-uk-yoga-life-coach-training
- https://www.akashayogaacademy.com/product-page/kundalini-awakening-retreat-in-india
- https://www.akashayogaacademy.com/product-page/300-hour-advanced-yoga-ttc-payment-plan-1-x-80-hour-already-purchased
- https://www.akashayogaacademy.com/product-page/1-month-course-access
- https://www.akashayogaacademy.com/product-page/80-hour-meditation-ttc
- https://www.akashayogaacademy.com/product-page/200-hour-ttc-essential
- https://www.akashayogaacademy.com/product-page/200-hour-online-yoga-teacher-training
- https://www.akashayogaacademy.com/product-page/copy-of-200-hour-yoga-teacher-training-essential-payment-plan
- https://www.akashayogaacademy.com/product-page/one-on-one-coaching-individual-session
- …dan 245 lainnya (lihat findings.json)

## AKS-009 · [Low] Console error: eapps.Platform throws: "Widget "…-d91f-4bc7-8dfb-…" can`t be initialized because APP_VIEWS_LIMIT_REACHED" with 
	 -> JSHandle@node
- **Kategori:** Console error
- **Situs:** main
- **Expected:** Clean console
- **Actual:** eapps.Platform throws: "Widget "…-d91f-4bc7-8dfb-…" can`t be initialized because APP_VIEWS_LIMIT_REACHED" with 
	 -> JSHandle@node

**Terjadi di (109):**
- https://www.akashayogaacademy.com/
- https://www.akashayogaacademy.com/post/new-year-s-resolutions-determination-vs-surrender
- https://www.akashayogaacademy.com/post/freedom-through-movement-with-bex-tyrer
- https://www.akashayogaacademy.com/post/chakra-introduction
- https://www.akashayogaacademy.com/post/epic-yoga-festival-in-marrakech-morocco
- https://www.akashayogaacademy.com/post/we-have-two-available-scholarships-for-our-yoga-alliance-certified-online-teacher-training-in-may
- https://www.akashayogaacademy.com/post/holding-space
- https://www.akashayogaacademy.com/post/flow-state-meeting-the-present-moment-in-motion
- https://www.akashayogaacademy.com/post/berlin-yoga-conference
- https://www.akashayogaacademy.com/post/ubud-the-perfect-setting-for-a-yoga-teacher-training-in-bali
- https://www.akashayogaacademy.com/post/108-sun-salutations-fundraiser-for-mental-health-awareness
- https://www.akashayogaacademy.com/post/the-journey-of-a-yogi-by-jacc-wright
- https://www.akashayogaacademy.com/blog/categories/graduates
- https://www.akashayogaacademy.com/blog
- https://www.akashayogaacademy.com/blog/categories/sharing
- https://www.akashayogaacademy.com/post/the-journey-of-a-yogini-who-upcycles-tyres
- https://www.akashayogaacademy.com/asana/warrior-pose-ii-%E2%80%94-virabhadrasana-ii
- https://www.akashayogaacademy.com/asana/warrior-pose-1-%E2%80%94-virabhadrasana-1
- https://www.akashayogaacademy.com/asana/triangle-pose-%E2%80%94-trikonasana
- https://www.akashayogaacademy.com/asana/tree-pose-%E2%80%94-vrikshasana
- https://www.akashayogaacademy.com/asana/standing-forward-bend-%E2%80%94-padahastasana
- https://www.akashayogaacademy.com/asana/spinal-twist-pose-%E2%80%94-ardha-matsyendrasana
- https://www.akashayogaacademy.com/asana/sitting-forward-bend-%E2%80%94-paschimottanasana
- https://www.akashayogaacademy.com/asana/shoulder-stand-%E2%80%94-sarvangasana
- https://www.akashayogaacademy.com/asana/plow-pose-%E2%80%94-halasana
- …dan 84 lainnya (lihat findings.json)

## AKS-010 · [Low] Console error: Custom state pseudo classes have been changed from ":--productpage_subscriptionstextcolor" to ":state(productpage_subscriptionstextcolor)". See more here: https
- **Kategori:** Console error
- **Situs:** main
- **Expected:** Clean console
- **Actual:** Custom state pseudo classes have been changed from ":--productpage_subscriptionstextcolor" to ":state(productpage_subscriptionstextcolor)". See more here: https

**Terjadi di (50):**
- https://www.akashayogaacademy.com/product-page/50-hour-uk-yoga-life-coach-training
- https://www.akashayogaacademy.com/product-page/kundalini-awakening-retreat-in-india
- https://www.akashayogaacademy.com/product-page/300-hour-advanced-yoga-ttc-payment-plan-1-x-80-hour-already-purchased
- https://www.akashayogaacademy.com/product-page/1-month-course-access
- https://www.akashayogaacademy.com/product-page/80-hour-meditation-ttc
- https://www.akashayogaacademy.com/product-page/200-hour-ttc-essential
- https://www.akashayogaacademy.com/product-page/200-hour-online-yoga-teacher-training
- https://www.akashayogaacademy.com/product-page/copy-of-200-hour-yoga-teacher-training-essential-payment-plan
- https://www.akashayogaacademy.com/product-page/one-on-one-coaching-individual-session
- https://www.akashayogaacademy.com/product-page/200-hour-yoga-ttc-essential-payment-plan
- https://www.akashayogaacademy.com/product-page/support-extension-300-hour-6-month
- https://www.akashayogaacademy.com/product-page/upgrade-3-month-payment-plan
- https://www.akashayogaacademy.com/product-page/support-extension-200-hour-6-month
- https://www.akashayogaacademy.com/product-page/kundalini-awakening-retreat-payment-plan
- https://www.akashayogaacademy.com/product-page/300-hour-advanced-yoga-ttc-payment-plan-2-x-80-hour-already-purchase
- https://www.akashayogaacademy.com/product-page/300-hour-meditation-ttc
- https://www.akashayogaacademy.com/product-page/one-on-one-onsite-coaching-individual-session
- https://www.akashayogaacademy.com/product-page/300-hour-advanced-yoga-teacher-training-1-x-80-hour-already-purchased
- https://www.akashayogaacademy.com/product-page/200-hour-yoga-teacher-training-premium
- https://www.akashayogaacademy.com/product-page/3-month-payment-plan-200-hour-online-yoga-teacher-training
- https://www.akashayogaacademy.com/product-page/200-hour-yoga-ttc-essential-6-month-payment-plan
- https://www.akashayogaacademy.com/product-page/200-hour-ttc-premium
- https://www.akashayogaacademy.com/product-page/support-extension-300-hour-1-month
- https://www.akashayogaacademy.com/product-page/one-on-one-coaching-spiritual-mentorship-coaching
- https://www.akashayogaacademy.com/product-page/support-extension-200-hour-1-month
- …dan 25 lainnya (lihat findings.json)

## AKS-011 · [Low] Console error: Failed to load resource: the server responded with a status of N ()
- **Kategori:** Console error
- **Situs:** course
- **Expected:** Clean console
- **Actual:** Failed to load resource: the server responded with a status of N ()

**Terjadi di (38):**
- https://course.akashayogaacademy.com/15th-anniversary
- https://course.akashayogaacademy.com/200h-essential
- https://course.akashayogaacademy.com/300h-ytt
- https://course.akashayogaacademy.com/80h-hatha-pranayama
- https://course.akashayogaacademy.com/200h-premium
- https://course.akashayogaacademy.com/80h-meditation
- https://course.akashayogaacademy.com/about
- https://course.akashayogaacademy.com/80h-yin
- https://course.akashayogaacademy.com/asana
- https://course.akashayogaacademy.com/asana/cat-pose-marjariasana
- https://course.akashayogaacademy.com/asana/bow-pose-dhanurasana
- https://course.akashayogaacademy.com/asana/bridge-pose-setubandhasana
- https://course.akashayogaacademy.com/asana/cobra-pose-bhujangasana
- https://course.akashayogaacademy.com/asana/corpse-pose-shavasana
- https://course.akashayogaacademy.com/asana/eagle-pose-garudasana
- https://course.akashayogaacademy.com/asana/grasshopper-pose-shalabasana
- https://course.akashayogaacademy.com/asana/head-to-knee-pose-janushirshasana
- https://course.akashayogaacademy.com/asana/shoulder-stand-sarvangasana
- https://course.akashayogaacademy.com/asana/tree-pose-vrikshasana
- https://course.akashayogaacademy.com/blog/108-sun-salutations-fundraiser-for-mental-health-awareness
- https://course.akashayogaacademy.com/blog/chakra-introduction
- https://course.akashayogaacademy.com/blog
- https://course.akashayogaacademy.com/chakra
- https://course.akashayogaacademy.com/chakra/crown-chakra-sahasrara
- https://course.akashayogaacademy.com/chakra/third-eye-chakra-ajna
- …dan 13 lainnya (lihat findings.json)

## AKS-012 · [Low] Console error: TypeError: navigator.sendBeacon is not a function
    at Object.eval [as flushHandler] (https://static.parastorage.com/…
    at oe.flush (https://static.parasto
- **Kategori:** Console error
- **Situs:** main
- **Expected:** Clean console
- **Actual:** TypeError: navigator.sendBeacon is not a function
    at Object.eval [as flushHandler] (https://static.parastorage.com/…
    at oe.flush (https://static.parasto

**Terjadi di (14):**
- https://www.akashayogaacademy.com/category/all-products
- https://www.akashayogaacademy.com/200-hr-online-ytt/3-month-payment-plan
- https://www.akashayogaacademy.com/300-hr-online-enroll-now
- https://www.akashayogaacademy.com/80hr-yin-ytt-enroll-now
- https://www.akashayogaacademy.com/200-hr-online-upgrade-to-premium
- https://www.akashayogaacademy.com/300-hour-support-extension-program
- https://www.akashayogaacademy.com/indian-retreat-enroll-now
- https://www.akashayogaacademy.com/200hr-ytt-premium
- https://www.akashayogaacademy.com/80-hr-online-enroll-now-hatha-and-pranayama
- https://www.akashayogaacademy.com/enroll-now-80-hr-online-meditation-teacher-training
- https://www.akashayogaacademy.com/support-extension-program-200hr
- https://www.akashayogaacademy.com/200-hour-course-access-extension
- https://www.akashayogaacademy.com/200hr-ytt-essential
- https://www.akashayogaacademy.com/300-hr-online-current-students-payment-plan

## AKS-013 · [Low] Uncaught JS error: Minified React error #N; visit https://reactjs.org/… for the full message or use the non-minified dev environment for full errors and additional helpful warning
- **Kategori:** JavaScript error
- **Situs:** course
- **Expected:** No uncaught exceptions
- **Actual:** Minified React error #N; visit https://reactjs.org/… for the full message or use the non-minified dev environment for full errors and additional helpful warning

**Terjadi di (12):**
- https://course.akashayogaacademy.com/15th-anniversary
- https://course.akashayogaacademy.com/blog/108-sun-salutations-fundraiser-for-mental-health-awareness
- https://course.akashayogaacademy.com/blog/berlin-yoga-conference
- https://course.akashayogaacademy.com/blog/chakra-introduction
- https://course.akashayogaacademy.com/blog
- https://course.akashayogaacademy.com/blog/epic-yoga-festival-in-marrakech-morocco
- https://course.akashayogaacademy.com/blog/flow-state-meeting-the-present-moment-in-motion
- https://course.akashayogaacademy.com/blog/freedom-through-movement-with-bex-tyrer
- https://course.akashayogaacademy.com/blog/holding-space
- https://course.akashayogaacademy.com/blog/the-journey-of-a-yogi-by-jacc-wright
- https://course.akashayogaacademy.com/blog/the-journey-of-a-yogini-who-upcycles-tyres
- https://course.akashayogaacademy.com/blog/we-have-two-available-scholarships-for-our-yoga-alliance-certified-online-teacher-training-in-may

## AKS-014 · [Low] Console error: Mixpanel error: Implementation error. Please turn on debug and contact support@mixpanel.com.
- **Kategori:** Console error
- **Situs:** main
- **Expected:** Clean console
- **Actual:** Mixpanel error: Implementation error. Please turn on debug and contact support@mixpanel.com.

**Terjadi di (11):**
- https://www.akashayogaacademy.com/300-hr-online-enroll-now
- https://www.akashayogaacademy.com/80hr-yin-ytt-enroll-now
- https://www.akashayogaacademy.com/200-hr-online-upgrade-to-premium
- https://www.akashayogaacademy.com/300-hour-support-extension-program
- https://www.akashayogaacademy.com/indian-retreat-enroll-now
- https://www.akashayogaacademy.com/200hr-ytt-premium
- https://www.akashayogaacademy.com/80-hr-online-enroll-now-hatha-and-pranayama
- https://www.akashayogaacademy.com/enroll-now-80-hr-online-meditation-teacher-training
- https://www.akashayogaacademy.com/support-extension-program-200hr
- https://www.akashayogaacademy.com/200-hour-course-access-extension
- https://www.akashayogaacademy.com/300-hr-online-current-students-payment-plan

## AKS-015 · [Low] Checkout page title shows the wrong course name
- **Kategori:** Checkout
- **Situs:** course
- **Expected:** Title mentions /hatha|pranayama/i
- **Actual:** Secure Checkout, 200-Hour Yoga Teacher Training, Akasha Yoga Academy
- **Rekomendasi:** Set the <title> per product (affects browser tab, analytics & ad conversion reports).

**Terjadi di (6):**
- https://course.akashayogaacademy.com/checkout?product=80h-hatha-pranayama
- https://course.akashayogaacademy.com/checkout?product=80h-yin
- https://course.akashayogaacademy.com/checkout?product=80h-meditation
- https://course.akashayogaacademy.com/checkout?product=300h-ytt
- https://course.akashayogaacademy.com/checkout?product=kundalini-india
- https://course.akashayogaacademy.com/checkout?product=feminine-wisdom

## AKS-016 · [Low] Uncaught JS error: Failed to execute 'observe' on 'MutationObserver': parameter 1 is not of type 'Node'.
- **Kategori:** JavaScript error
- **Situs:** main
- **Expected:** No uncaught exceptions
- **Actual:** Failed to execute 'observe' on 'MutationObserver': parameter 1 is not of type 'Node'.

**Terjadi di (4):**
- https://www.akashayogaacademy.com/300-hr-online-enroll-now
- https://www.akashayogaacademy.com/80hr-yin-ytt-enroll-now
- https://www.akashayogaacademy.com/80-hr-online-enroll-now-hatha-and-pranayama
- https://www.akashayogaacademy.com/enroll-now-80-hr-online-meditation-teacher-training

## AKS-017 · [Low] Sitemap URL redirects to another page
- **Kategori:** SEO / Sitemap
- **Situs:** main
- **Expected:** Sitemap only lists final (200) URLs
- **Actual:** Redirects to https://www.akashayogaacademy.com/podcast
- **Rekomendasi:** Replace the URL in the sitemap with the final destination.

**Terjadi di (3):**
- https://www.akashayogaacademy.com/calendar-sign-up
- https://www.akashayogaacademy.com/akasha-calendar
- https://www.akashayogaacademy.com/200hr-yoga-teacher-training-online-old

## AKS-018 · [Low] Console error: Permissions policy violation: payment is not allowed in this document.
- **Kategori:** Console error
- **Situs:** course
- **Expected:** Clean console
- **Actual:** Permissions policy violation: payment is not allowed in this document.

**Terjadi di (2):**
- https://course.akashayogaacademy.com/200h-premium
- https://course.akashayogaacademy.com/kundalini-india

## AKS-019 · [Low] Console error: Failed to load resource: net::ERR_SOCKET_NOT_CONNECTED
- **Kategori:** Console error
- **Situs:** main
- **Expected:** Clean console
- **Actual:** Failed to load resource: net::ERR_SOCKET_NOT_CONNECTED

**Terjadi di (1):**
- https://www.akashayogaacademy.com/contact

## AKS-020 · [Low] Console error: No orderPaymentRequestId
- **Kategori:** Console error
- **Situs:** main
- **Expected:** Clean console
- **Actual:** No orderPaymentRequestId

**Terjadi di (1):**
- https://www.akashayogaacademy.com/payment-request-page

## AKS-021 · [Low] Console error: Error with getting user email No user is currently logged in
- **Kategori:** Console error
- **Situs:** main
- **Expected:** Clean console
- **Actual:** Error with getting user email No user is currently logged in

**Terjadi di (1):**
- https://www.akashayogaacademy.com/challenge-page/33418045-401b-4a21-91fa-b3185daf7a5b

## AKS-022 · [Low] Console error: requestStorageAccess: Permission denied.
- **Kategori:** Console error
- **Situs:** main
- **Expected:** Clean console
- **Actual:** requestStorageAccess: Permission denied.

**Terjadi di (1):**
- https://www.akashayogaacademy.com/design-your-schedule
