// Renders the Notis Privasi contact address as a transparent PNG (assets/images/hubungi-himandme.png).
// Anti-harvesting measure: the address is never in the page HTML as text. It is not OCR-proof.
// Typeset in the theme's own Manrope at the article body size and colour, rendered at 3× for sharp
// display on high-density screens; shown at 1/3 of its pixel size by .hm-contact-img (doc.css).
//   node scripts/make-contact-image.mjs   (needs Playwright with Chromium; then optimise, see README)
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const ADDRESS = 'myhimandme@gmail.com';
const font = fileURLToPath(new URL('../assets/fonts/manrope-latin-wght-normal.woff2', import.meta.url));
const out = fileURLToPath(new URL('../assets/images/hubungi-himandme.png', import.meta.url));
const b = await chromium.launch();
const p = await b.newPage({ deviceScaleFactor: 3 });
await p.setContent(`<style>@font-face{font-family:M;src:url(data:font/woff2;base64,${readFileSync(font).toString('base64')}) format("woff2");font-weight:200 800}
html,body{margin:0;background:transparent}span{display:inline-block;font:500 19px/1 M;color:#2E2E2E;padding:4px 1px 5px;letter-spacing:0}</style><span>${ADDRESS}</span>`);
await p.evaluate(async () => { await document.fonts.load('500 19px M'); await document.fonts.ready; if (!document.fonts.check('500 19px M')) throw new Error('Manrope not loaded'); });
await (await p.$('span')).screenshot({ path: out, omitBackground: true });
await b.close();
console.log('✓', out);
