# Summit Lake Properties sample site: technical notes

Last updated: 2026-10-05

Sample website by Midvora. This is a pitch sample, not a live site. Every page carries a "Sample website by Midvora" banner and a `noindex, nofollow` meta tag.

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
  components/             Banner, Header, Footer, CallBar, Announcement, Contours,
                          PageHero, Icon, Logo, CopyButton, MaintenanceForm
  layouts/Base.astro      head, meta, Open Graph, noindex, skip link
  pages/                  index, tenants, vacancies, apply, contact, 404, sitemap.xml
  styles/global.css       color variables and shared component classes
public/                   favicon.svg, og-image.png, robots.txt
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
- `PUBLIC_VACANCIES_CSV_URL`
- `PUBLIC_APPLY_FORM_URL`

`PUBLIC_` values are bundled into the browser build. That is how client side EmailJS works on static hosting. The EmailJS public key is designed to be public, but see the security notes below.

## Pages

- Home: hero, announcements bar, what tenants need to know (who manages, where rent goes, who to call), commitment, next steps.
- Tenants: mailing instructions with a copy button, optional online payment block (hidden), maintenance form.
- Vacancies: client side fetch of the published CSV. States: loading, results, empty (also used when no URL is set), error. Empty and error states show Kane's number.
- Apply: Google Form link when `PUBLIC_APPLY_FORM_URL` is set, otherwise "Call Kane to apply". A privacy note about Social Security numbers always shows.
- Contact: phone, mailing address, plus email, building addresses and office hours only when set.
- 404 and `/sitemap.xml` (generated from the nav list).

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

## Checks run on 2026-10-05

- `npm run build`: passes, 6 pages.
- `npm run verify`: banner and noindex on every page, no broken links or anchors, no em dashes.
- Layout checked at 375, 768 and 1280 px: no horizontal overflow on any page.
- Functional checks in Chromium: validation errors, honeypot, sample mode, EmailJS error path, copy button, mobile menu, skip link, vacancy states (results, empty, error, no URL), apply with and without URL.
- Not tested: a real EmailJS send, a real Google Sheet, a real Google Form, screen readers, Safari and Firefox.

## Known gaps

- Domain and hosting are undecided. `SITE_URL` defaults to localhost, so the sitemap and Open Graph URLs need it set before sharing.
- `og-image.png` is a screenshot of the hero, generated once.
- Rent mailing block uses "Summit Lake Properties" as the addressee. Unconfirmed, needs verification.

## Changelog

- 2026-10-05: Initial sample build. Pages, config, EmailJS form, vacancies CSV, apply link, sitemap, verify script.
