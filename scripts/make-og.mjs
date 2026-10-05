/**
 * Optional helper: regenerates public/og-image.png from the built home hero.
 * Needs Playwright (not a project dependency). Run `npm run build && npm run preview` first,
 * then: node scripts/make-og.mjs http://localhost:4321
 */
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:4321';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1200, height: 630 }, reducedMotion: 'reduce' })).newPage();
await page.goto(base, { waitUntil: 'networkidle' });
await page.addStyleTag({
  content: `body > :not(main), main section:not(:first-of-type) { display: none !important; }
  main section:first-of-type { min-height: 630px; display: flex; align-items: center; }
  main section:first-of-type > .container-x { width: 100%; }`,
});
await page.screenshot({ path: 'public/og-image.png', clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
