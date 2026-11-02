# Summit Lake Properties sample site: technical notes

Last updated: 2026-10-05

Sample website by Midvora. This is a pitch sample, not a live site. Every page carries an "Unofficial sample" banner and a `noindex, nofollow` meta tag, and the site can sit behind the Midvora visitor gate (see Sample gate).

## Stack

- Astro 4.16 (static output), Tailwind CSS 3.4 via `@astrojs/tailwind`
- Fonts self-hosted through Fontsource: Bricolage Grotesque (headings), Instrument Sans (body)
- `@emailjs/browser` for the maintenance form, loaded only when the form is submitted
- No GSAP, no Three.js, no Bootstrap. Hero motion is CSS only.

## Run it

```
npm install
cp .env.example .env     # optional, fill in values
npm run dev              # http://localhost:4321
npm run build            # static site in dist/
npm run preview
npm run verify           # after a build: banner, noindex, links, anchors, alt text, em dash scan
```

## File tree

```
src/
  config/site.ts          every fact shown on the site; unknowns are null
  config/env.ts           reads .env values, validates URLs
  lib/contours.ts         deterministic SVG contour geometry
  lib/sanitize.ts         input cleaning
  lib/validate.ts         maintenance form validation rules
  lib/csv.ts              CSV parser and vacancy column whitelist
  lib/vacancies.ts        fetches and renders the vacancy sheet
  config/sample.ts        invented sample data (units, rents, photos, payment history)
  components/             SampleGate, SampleBanner, Header, Footer, CallBar, Announcement, Contours,
                          PageHero, Icon, Logo, CopyButton, MaintenanceForm,
                          PaymentMethods, PayFlow, PhotoSlider, HomeViewer, InquiryForm
  layouts/Base.astro      head, meta, Open Graph, noindex, skip link
  pages/                  index, tenants, pay, vacancies, apply, contact, 404, sitemap.xml
  styles/global.css       color variables and shared component classes
  styles/gate.css         sample gate card and banner styles (from the Midvora sample kit)
public/                   favicon.svg, og-image.png, robots.txt, sample/ (stock photos)
scripts/verify.mjs        post build checks
scripts/make-og.mjs       optional, regenerates og-image.png (needs Playwright)
```

## Config and the null rule

`src/config/site.ts` is the single source of truth. Verified values (name, Kane's first name, phone, PO Box, goal) are filled in. Everything unknown is `null` and is never rendered, including its label and section:

| Field | Value now |
| --- | --- |
| `manager.lastName` | null |
| `email` | null |
| `buildingAddresses` | null |
| `unitCount` | null |
| `officeHours` | null |
| `logo` | null (a simple SVG mark is used instead) |
| `rentPayableTo` | null |
| `rentDueNote` | null |
| `onlinePaymentUrl` | null |
| `features.onlineRentPayment` | false |

`features.onlineRentPayment` is a future extension point. The Pay online block shows only when the flag is true and `onlinePaymentUrl` is set. No payment processor is built.

The announcements bar reads `site.announcement`. Set it to null to hide it. Its current message repeats the notice taped to the building.

## Environment variables (names only)

See `.env.example`. Never commit `.env`.

- `SITE_URL`: final domain for canonical links, Open Graph and sitemap. Falls back to `http://localhost:4321`.
- `PUBLIC_EMAILJS_SERVICE_ID`
- `PUBLIC_EMAILJS_TEMPLATE_ID`
- `PUBLIC_EMAILJS_PUBLIC_KEY`
- `PUBLIC_EMAILJS_INQUIRY_TEMPLATE_ID`: separate template for home inquiries and tour requests. Variables sent: `request_type`, `from_name`, `phone`, `unit`, `rent`, `preferred_time`, `message`, `submitted_at`. The template must be created to match (unconfirmed, needs verification).
- `PUBLIC_VACANCIES_CSV_URL`
- `PUBLIC_APPLY_FORM_URL`
- `BASE_PATH`: sub-path when hosted in a folder (GitHub Pages sets it in CI). Empty for a domain root.

`PUBLIC_` values are bundled into the browser build. That is how client side EmailJS works on static hosting. The EmailJS public key is designed to be public, but see the security notes below.

## Pages

- Home: hero, announcements bar, what tenants need to know (who manages, where rent goes, who to call), commitment, next steps.
- Tenants: mailing instructions with a copy button, optional online payment block (hidden), maintenance form.
- Vacancies: client side fetch of the published CSV. States: loading, results, empty (also used when no URL is set), error. Empty and error states show Kane's number.
- Apply: Google Form link when `PUBLIC_APPLY_FORM_URL` is set, otherwise "Call Kane to apply". A privacy note about Social Security numbers always shows.
- Contact: phone, mailing address, plus email, building addresses and office hours only when set.
- 404 and `/sitemap.xml` (generated from the nav list).

## Sample gate (Midvora sample kit v2.2, Astro variant)

Before the sample opens, a visitor sees a Midvora card asking for a name and email. Midvora gets an email through Web3Forms (`Sample opened: <name> (Summit Lake Properties)`), so we know the client looked. It is a **soft gate**: it records who looked and does not hide the files.

- Files: `components/SampleGate.astro`, `components/SampleBanner.astro`, `styles/gate.css`, `public/midvora-logo.png`. Wired in `layouts/Base.astro`. The client name is set at the top of `SampleGate.astro` (`CLIENT`, `SAMPLE_LABEL`); the build fails if the kit placeholder is left in.
- Variables: `PUBLIC_GATE_KEY` (Midvora Web3Forms access key, public by design) and `PUBLIC_FORCE_GATE=1` to preview. In CI the key comes from the repo variable `VITE_GATE_KEY` (same name the kit publishing script sets), mapped in `deploy.yml`.
- Modes: no key means no gate (the site opens straight away and the production build logs a console warning); `PUBLIC_FORCE_GATE=1` shows the gate and sends nothing ("Preview mode: nothing is sent."); with a key it sends a real email. Messages are truthful: "We got your request" only appears after a real send. If the send fails the visitor sees the error and can open the sample anyway.
- A remembered visitor is stored under `midvora-sample-visitor:summit-lake-properties`, so other samples on the same github.io account are not unlocked by this one.
- While the gate shows, `gate.css` stops the rest of the page from rendering. Without JavaScript the gate stays hidden.
- Not tested: a real Web3Forms submission (it emails Midvora). Do one from a normal browser on the live link and confirm the email arrives.

## Design samples (pitch aids)

All sample content is invented and labelled "Sample" on the page. Content lives in `src/config/sample.ts`.

### Pay rent (`/pay`)

`pages/pay.astro` + `components/PayFlow.astro`. A step-by-step flow that runs only in the browser with invented units and rents. Nothing is sent anywhere and no bank or card details are collected (the card fields on the sample checkout are disabled).

1. Your home: name + unit (autofills the sample rent).
2. How to pay: bank transfer (no fee) or card (2.9% + 30 cents shown up front).
3. Review, then a sample "secure checkout" screen styled like the page Stripe hosts, then a receipt.
4. "Autopay and receipts" tab: sample email-code sign in (any 6 digits), autopay switch, saved bank, payment history. This mirrors Stripe's hosted customer portal.

Design decision: no custom tenant login. Guest checkout covers paying. Autopay and history would come from Stripe's own email-code portal, so there is no password system to build or secure. A custom portal (balance, ledger) needs a backend and is a later phase or a job for a rent platform.

Going live with Stripe (not built): create a Payment Link (ACH + card) with custom fields for unit and name, and replace the checkout step with a link to it. For autopay, create a subscription per tenant and enable the customer portal. Fees and the ACH mandate behavior must be confirmed on Stripe's own pages.

The Tenants page links to `/pay` from the "Ways to pay rent" section (`PaymentMethods.astro`). Mail a check remains the live method.

### Vacancies

- Three sample listings (`sampleVacancies` in `sample.ts`) render only while `PUBLIC_VACANCIES_CSV_URL` is empty. Setting the URL replaces them with the sheet rows.
- `PhotoSlider.astro`: native scroll-snap slider (swipe on touch), previous/next buttons, "n of N" counter, arrow keys, no auto-rotate, no library. Follows the W3C carousel pattern (region, slide groups, native buttons).
- `HomeViewer.astro`: one native `<dialog>` per home with a large slider, thumbnails, details and contact options. Escape or Close or a click outside closes it and focus returns to the button. `/vacancies#home-3b` opens that home directly, so a link can be texted.
- Contact options per home: Text Kane (`sms:` link with a prefilled message, `smsHref()` in `site.ts`), Call Kane, a copy-number fallback for computers, and `InquiryForm.astro` (Ask a question or Request a tour; validation in `validateInquiry`, honeypot, 30 second cooldown, sample mode until EmailJS is set).
- Photos are downloaded into `public/sample/` (12 files), not hot-linked, so the sample cannot break. They are free stock photos from Pexels, which allows use without attribution. Photo IDs: 2A: 1643383, 2062426, 271624, 1457847. 3B: 1571453, 1457842, 2029694, 3144580. 1C: 1571463, 2724748, 1918291, 6585751 (URL pattern `https://www.pexels.com/photo/<id>/`). These are not photos of the real building. Replace them with Kane's own photos.

### Removing the samples

Delete the `data-sample` block in `pages/vacancies.astro`, the `#ways-to-pay` section in `pages/tenants.astro`, `pages/pay.astro`, the "Pay rent" entry in `nav` in `site.ts`, and `public/sample/`.

### Other changes

- `global.css` forces `[hidden]` to `display: none` so hidden flex and grid elements stay hidden, and locks page scroll while a dialog is open.
- `verify.mjs` ignores `sms:` links.

## Payment options research (verify fees before quoting)

Figures come from third-party blogs and vendor pages, not official pricing pages. Checked 2026-11-02.

- Mail a check: free, no tracking. Works today.
- Rent platform portal (TurboTenant, TenantCloud, RentRedi, Avail/Zillow): autopay, receipts, ledger, late fees. Often free ACH for tenants, card fee around 3% paid by tenant. Fastest to launch, but tenants leave this site and it locks in a vendor.
- Stripe Payment Links or Checkout: ACH about 0.8% capped at $5, cards 2.9% + 30 cents, no monthly fee. Fully branded, money goes to the owner's bank, but there is no tenant ledger or autopay logic.
- Zelle, Venmo, Cash App: personal-use tools with no records and scam risk. Not recommended as the main method.

Suggested pitch: keep mail now, offer bank transfer as the main online option, card as a backup. Lead with a platform portal, mention Stripe as the custom upgrade.

## Maintenance form

Fields: name, unit, phone, best time to reach you, what is wrong, optional photo note. The phone field was added beyond the brief so Kane can actually reach the tenant (unconfirmed, needs Samson's approval).

- Honeypot field `company`, hidden off screen. If filled, the form shows a fake success and sends nothing.
- Input is cleaned (`lib/sanitize.ts`: Unicode normalize, control and invisible characters removed, HTML tags and angle brackets removed, length caps) then validated (`lib/validate.ts`).
- 30 second cooldown per browser via localStorage.
- Success and error messages are announced (`role="status"` or `role="alert"`) and focus moves to them. Kane's number is always on the form and in every message.
- If the three EmailJS variables are missing, the form validates and then shows "Sample mode: nothing was sent". This keeps the sample honest.
- EmailJS template variables sent: `from_name`, `unit`, `phone`, `contact_time`, `message`, `photo_note`, `submitted_at`. The EmailJS template itself must be created to match (unconfirmed, needs verification).

## Vacancies sheet format

Only these columns are read, case insensitive: `unit`, `bedrooms`, `bathrooms`, `rent`, `available`, `details`, `status`. Any other column is ignored and never rendered. A row shows when `status` is empty, "available" or "vacant". Text is inserted with `textContent`, so sheet content cannot become markup. Maximum 50 rows.

Use a separate sheet that holds public vacancy info only. Never publish a sheet that contains tenant or applicant data. Google publishes CSV with open CORS in practice, but this was tested only against a local CSV server. Live Google behavior is unconfirmed, needs verification.

## Design

Colors are CSS variables in `src/styles/global.css` (`--lake`, `--deep`, `--shore`, `--mist`, `--sky`, `--ink`, `--glow`) and mapped in `tailwind.config.mjs`. Swap the seven values to rebrand. Hero art is SVG built in `components/Contours.astro`; lines draw in once on load. With `prefers-reduced-motion: reduce` the finished art shows with no animation. Opacity modifiers like `text-lake/50` do not work with these variable colors, so use the `muted` color or `color-mix`.

The logo mark in the header is a generated SVG placeholder for the sample, not Summit Lake Properties' logo.

## Security and privacy notes

- No secrets in the repo. `.env` is git ignored; `.env.example` has names only.
- Client side sanitizing is not a security boundary. In the EmailJS dashboard, restrict allowed origins to the final domain, and consider rate limits or reCAPTCHA (unconfirmed, needs verification).
- Applicants are told not to send Social Security numbers by email or text.
- External links open with `rel="noopener noreferrer"`.
- URLs from `.env` must be https (plain http only for localhost testing).

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages on every push to `master` or `main`. The workflow sets `SITE_URL` and `BASE_PATH` from the Pages settings, runs `npm run verify`, then publishes `dist/`. The EmailJS, vacancy and apply values can be set as repository variables with the same names as in `.env.example` (Settings, Secrets and variables, Actions, Variables). They are public by design. Until they are set, the site runs in sample mode. Enabling Pages automatically through the workflow is unconfirmed, needs verification (if the first run fails, set Settings, Pages, Source to GitHub Actions).

## Checks run on 2026-10-05

- `npm run build`: passes, 6 pages.
- `npm run verify`: sample banner and noindex on every page, no broken links or anchors, no em dashes.
- Layout checked at 375, 768 and 1280 px: no horizontal overflow on any page.
- Functional checks in Chromium: validation errors, honeypot, sample mode, EmailJS error path, copy button, mobile menu, skip link, vacancy states (results, empty, error, no URL), apply with and without URL.
- Not tested: a real EmailJS send, a real Google Sheet, a real Google Form, screen readers, Safari and Firefox.

## Checks run on 2026-11-02

- `npm run build` and `npm run verify`: pass, 7 pages.
- Phone widths 360, 375 and 390: no horizontal overflow and no tap target under 40 px on any page; menu, vacancy slider and viewer, inquiry form, full pay flow and account view exercised in Chromium with touch emulation.
- Gate: no key, preview mode and key mode (Web3Forms call mocked, nothing real sent) all pass.
- Not tested: a real Web3Forms send, a real EmailJS send, Safari, Firefox, screen readers, Chrome autofill on the gate.

## Known gaps

- Photo viewer and inquiry form work for the sample homes only. Rows loaded from the Google Sheet still use the simple card from `lib/vacancies.ts`. Next step: add an optional `photos` column (https URLs, comma separated) to the whitelist in `lib/csv.ts`, and render the same slider and viewer for sheet rows.
- The Stripe checkout, autopay and portal are visual samples. No Stripe account, keys or Payment Links exist yet.
- `/pay` is in the nav and sitemap. It is also `noindex` like every page of the sample.
- Domain and hosting are undecided. `SITE_URL` defaults to localhost, so the sitemap and Open Graph URLs need it set before sharing.
- `og-image.png` is a screenshot of the hero, generated once.
- Rent mailing block uses "Summit Lake Properties" as the addressee. Unconfirmed, needs verification.

## Changelog

- 2026-11-02: Phone polish: payment cards compact on small screens, bedroom filter fits one row, pay page no longer overflows sideways in the account view, sticky call bar can no longer cover a focused or scrolled-to button (`scroll-padding-bottom`), copy fix on Tenants.
- 2026-11-02: Added the Midvora sample gate and banner (kit v2.2 Astro variant), replacing the old plain banner.
- 2026-11-02: Added the `/pay` sample flow (Stripe style checkout, receipt, autopay and history), vacancy photo sliders with a full screen viewer, text / call / inquiry / tour request options, and a "Pay rent" nav item.
- 2026-11-02: Added sample "Ways to pay" section and sample vacancy listings (see Design samples).
- 2026-10-05: Added base path support and the GitHub Pages deploy workflow.
- 2026-10-05: Initial sample build. Pages, config, EmailJS form, vacancies CSV, apply link, sitemap, verify script.
