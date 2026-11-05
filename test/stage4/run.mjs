// Stage 4 checks: Disfungsi Ereksi page. Section order, page fields, every #blok-ed block (edit →
// visible, unpublish → approved fallback, restore), body splitting, FAQ from the page body,
// settings-driven tiles, every appointment/WhatsApp CTA, the WhatsApp enquiry form (real browser),
// accessibility basics and no horizontal overflow. LOCAL Ghost only.
//
//   GHOST_ADMIN_EMAIL=… GHOST_ADMIN_PASSWORD=… node test/stage4/run.mjs
import { createRequire } from 'node:module';
import { BLOCKS } from '../../seed/blocks.mjs';

const BASE = (process.env.GHOST_URL || 'http://localhost:2368').replace(/\/$/, '');
if (!['localhost', '127.0.0.1'].includes(new URL(BASE).hostname)) { console.error('Local Ghost only.'); process.exit(2); }
const { GHOST_ADMIN_EMAIL: EMAIL, GHOST_ADMIN_PASSWORD: PASSWORD } = process.env;
if (!EMAIL || !PASSWORD) { console.error('Set GHOST_ADMIN_EMAIL and GHOST_ADMIN_PASSWORD.'); process.exit(2); }
const PATH = '/disfungsi-ereksi/';

let cookie = '';
async function admin(path, { method = 'GET', json } = {}) {
  const r = await fetch(`${BASE}/ghost/api/admin${path}`, { method, headers: { Origin: BASE, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: json ? JSON.stringify(json) : undefined });
  const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0];
  const t = await r.text(); if (!r.ok) throw new Error(`${method} ${path} -> ${r.status} ${t.slice(0, 300)}`);
  try { return t ? JSON.parse(t) : {}; } catch { return {}; }
}
const page = async (p = PATH) => (await fetch(BASE + p)).text();
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const results = [];
const check = (id, what, pass, detail = '') => { results.push({ id, pass }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${id.padEnd(4)} ${what}${detail ? ` — ${detail}` : ''}`); };
const edit = async (type, id, fields) => {
  const cur = (await admin(`/${type}/${id}/`)).posts?.[0] || (await admin(`/${type}/${id}/`)).pages[0];
  return admin(`/${type}/${id}/?source=html`, { method: 'PUT', json: { [type]: [{ ...fields, updated_at: cur.updated_at }] } });
};

await admin('/session/', { method: 'POST', json: { username: EMAIL, password: PASSWORD } });
const blocks = Object.fromEntries((await admin('/posts/?limit=all&filter=tag:hash-blok-ed')).posts.map((p) => [p.slug, p]));
const edPage = (await admin('/pages/slug/disfungsi-ereksi/?formats=html')).pages[0];
let h = await page();

// E1 — section order matches the prototype
const order = ['apa', 'punca', 'penilaian', 'shockwave', 'ems', 'hm-cmp-title', 'first-trial', 'soalan', 'temujanji'].map((id) => h.indexOf(`id="${id}"`));
check('E1', 'Sections in the prototype order: 01 Apa → 02 Punca → 03 Penilaian → 04 Shockwave → 05 Kegel EMS → comparison → First Trial → 06 FAQ → booking',
  order.every((v, i) => v > 0 && (i === 0 || v > order[i - 1])), order.join(' < '));

// E2 — hero from the Ghost page itself
check('E2', 'H1 = page title, intro = page excerpt (Pages → Disfungsi Ereksi)', h.includes(`<h1 class="hm-edhero__title">${esc(edPage.title)}</h1>`) && h.includes(esc(edPage.custom_excerpt)));
await edit('pages', edPage.id, { title: `${edPage.title} (diedit)` });
const h2edit = await page();
await edit('pages', edPage.id, { title: edPage.title });
check('E3', 'Editing the page title in Ghost Admin changes the H1', h2edit.includes(`${esc(edPage.title)} (diedit)</h1>`));

// E4 — every ED block drives its section and falls back when unpublished
const edBlocks = BLOCKS.filter((b) => b.slug.startsWith('blok-ed-'));
const bad = [];
for (const b of edBlocks) {
  const post = blocks[b.slug]; if (!post) { bad.push(`${b.slug} missing`); continue; }
  const marker = `${post.title} (diedit)`;
  await edit('posts', post.id, { title: marker }); const e = await page();
  await edit('posts', post.id, { status: 'draft' }); const f = await page();
  await edit('posts', post.id, { status: 'published', title: post.title });
  if (!e.includes(esc(marker)) || f.includes(esc(marker)) || !f.includes(esc(b.title))) bad.push(`${b.slug}: block ${e.includes(esc(marker)) ? 'ok' : 'NOT used'}, fallback ${!f.includes(esc(marker)) && f.includes(esc(b.title)) ? 'ok' : 'MISSING'}`);
}
check('E4', `All ${edBlocks.length} ED blocks drive their section and fall back to approved copy when unpublished`, bad.length === 0, bad.join('; ') || 'edit → visible; unpublish → approved copy; restored');

// E5 — FAQ comes from the page body
h = await page();
const faqCount = (h.match(/<section class="hm-faq hm-faq--ed[\s\S]*?<\/section>/)?.[0].match(/kg-toggle-card"/g) || []).length;
const pageToggles = (edPage.html.match(/kg-toggle-card"/g) || []).length;
check('E5', 'FAQ questions are the toggle cards in the page body', faqCount === pageToggles && faqCount > 0, `${faqCount} questions`);

// E6 — settings drive the tiles; show_prices hides fee/price tiles; city label fallback
const cs = (await admin('/custom_theme_settings/')).custom_theme_settings;
const csCur = {}; // test values accumulate across steps (the real values are restored afterwards)
const setCS = (vals) => { Object.assign(csCur, vals); return admin('/custom_theme_settings/', { method: 'PUT', json: { custom_theme_settings: cs.map((s) => ({ key: s.key, value: s.key in csCur ? csCur[s.key] : s.value })) } }); };
await setCS({ consultation_duration: '30 minit', consultation_fee: 'RM 99', shockwave_session_duration: '20 minit', shockwave_price: 'RM 999 / pakej', kegel_ems_session_duration: '25 minit', show_prices: true, city: 'Kuala Lumpur' });
const withP = await page(); const homeCity = await page('/');
await setCS({ consultation_fee: '', shockwave_session_duration: '' });
const emptyTiles = await page();
await setCS({ show_prices: false, city: '' });
const noP = await page(); const homeNoCity = await page('/');
await admin('/custom_theme_settings/', { method: 'PUT', json: { custom_theme_settings: cs.map((s) => ({ key: s.key, value: s.value })) } });
const tile = (html, v) => html.includes(`hm-tile__value">${esc(v)}</strong>`);
check('E6', 'Session/price tiles show the theme settings', ['30 minit', 'RM 99', '20 minit', 'RM 999 / pakej', '25 minit'].every((v) => tile(withP, v)));
check('E7', 'show_prices off hides the fee and price tiles (and only those)', !tile(noP, 'RM 99') && !noP.includes('>KOS<') && !noP.includes('>YURAN<') && noP.includes('>TEMPOH<'));
check('E7b', 'An empty setting hides its own tile (e.g. consultation fee) even with prices shown', !emptyTiles.includes('>YURAN<') && emptyTiles.includes('>TEMPOH<') && (emptyTiles.match(/>TEMPOH SESI</g) || []).length === 1 && emptyTiles.includes('>KOS<'));
const label = (html) => (html.match(/<span class="hm-label"><span class="hm-label__slash">\/<\/span> KESIHATAN LELAKI([\s\S]*?)<\/span>\s*<h1/) || [])[1] ?? 'not found';
check('E8', 'City setting: shown in the hero label when set; empty → label without any city or placeholder',
  /· Kuala Lumpur/.test(label(homeCity)) && label(homeNoCity).trim() === '' && !homeNoCity.includes('[BANDAR]'), `set: "${label(homeCity).replace(/<[^>]+>/g, '')}" · empty: "${label(homeNoCity)}"`);

// E9 — CTAs
const wa = cs.find((s) => s.key === 'whatsapp_number').value;
const waLinks = [...h.matchAll(/href="(https:\/\/wa\.me\/[^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
const msgs = waLinks.map((u) => decodeURIComponent(new URL(u).searchParams.get('text') || ''));
check('E9', 'Every WhatsApp link uses the configured number', waLinks.length >= 5 && waLinks.every((u) => u.startsWith(`https://wa.me/${wa}?`)), `${waLinks.length} WhatsApp links`);
check('E10', 'Treatment CTAs prefill a service-specific WhatsApp message', msgs.some((m) => m.includes('Shockwave therapy')) && msgs.some((m) => m.includes('Kegel EMS')));
const anchors = [...h.matchAll(/href="#([a-z]+)"/g)].map((m) => m[1]);
check('E11', 'All in-page CTAs/tabs/contents links point to sections that exist', anchors.length > 10 && anchors.every((a) => h.includes(`id="${a}"`)), `${new Set(anchors).size} distinct anchors`);
check('E12', 'Mobile bar and header booking buttons go to the booking form (#temujanji)', (h.match(/\/disfungsi-ereksi\/#temujanji"/g) || []).length >= 2 && h.includes('id="temujanji"'));
check('E13', 'Without JavaScript the form still opens WhatsApp (GET wa.me, message field named "text")', h.includes(`action="https://wa.me/${wa}"`) && /<textarea name="text"/.test(h));

// E14 — accessibility basics (server HTML)
const h1s = (h.match(/<h1[\s>]/g) || []).length;
const inputs = [...(h.match(/<form class="hm-form"[\s\S]*?<\/form>/)?.[0] || '').matchAll(/<(input|select|textarea)\b/g)].length;
const labelled = [...(h.match(/<form class="hm-form"[\s\S]*?<\/form>/)?.[0] || '').matchAll(/<label[^>]*>(?:(?!<\/label>)[\s\S])*?<(input|select|textarea)\b/g)].length;
check('E14', 'One <h1>; every form control sits inside a <label>; table headers have scope', h1s === 1 && inputs === labelled && /<th scope="row">/.test(h) && /<th scope="col">/.test(h), `${h1s} h1, ${labelled}/${inputs} controls labelled`);


// ---------- First Trial offer ----------
const home = await page('/');
const offerBlk = (await admin('/posts/slug/blok-tawaran/?formats=html')).posts[0];
const priceNow = cs.find((s) => s.key === 'offer_price').value;
const offerMsg = (name, price) => `Salam Him & Me, saya berminat untuk menempah ${name} ${price}.`;
const offerCtas = (html) => [...html.matchAll(/<a [^>]*href="(https:\/\/wa\.me\/[^"]+)"[^>]*data-hm-offer-cta/g)].map((m) => decodeURIComponent(new URL(m[1].replace(/&amp;/g, '&')).searchParams.get('text')));
const heroEnd = home.indexOf('</section>', home.indexOf('class="hm-container hm-hero"'));
check('F1', 'Placement: homepage card directly after the hero (before the trust strip); ED bar in the hero, "Apa yang termasuk" after the comparison, form option',
  home.indexOf('class="hm-container hm-offer"') > heroEnd && home.indexOf('class="hm-container hm-offer"') < home.indexOf('class="hm-trust"')
  && h.indexOf('class="hm-offerbar"') > h.indexOf('class="hm-edhero"') && h.indexOf('class="hm-offerbar"') < h.indexOf('data-hm-tabs')
  && /<option value="First Trial RM288" selected>First Trial RM288<\/option>/.test(h));
check('F2', 'Every First Trial button opens WhatsApp with the simple enquiry built from the offer name + price',
  [...offerCtas(home), ...offerCtas(h)].length === 4 && [...offerCtas(home), ...offerCtas(h)].every((m) => m === offerMsg(offerBlk.title, priceNow)), offerMsg(offerBlk.title, priceNow));
check('F3', 'The price is not stored in the block (title, CTA text and body contain no price)', !/RM\s?\d/.test(`${offerBlk.title} ${offerBlk.custom_excerpt} ${offerBlk.html}`));
check('F4', 'No comparative pricing ("Nilai biasa", "Biasa RM…") on the homepage or ED page', ![home, h].some((x) => /Nilai biasa|Biasa RM/i.test(x)));
check('F5', 'Confirmed package contents shown: 1 × consultation, 1 × Shockwave Therapy, 1 × Kegel EMS', ['1 × Konsultasi doktor', '1 × Shockwave Therapy', '1 × Kegel EMS'].every((t) => home.includes(t) && h.includes(t)));

// Price changed once in Ghost Admin → every location updates (incl. WhatsApp message and form option)
await setCS({ offer_price: 'RM299' });
const homeP = await page('/'); const edP = await page();
const where = (html) => (html.match(/RM299/g) || []).length;
const msgsP = [...offerCtas(homeP), ...offerCtas(edP)];
check('F6', 'Changing offer_price once updates the homepage card, ED bar, ED section, booking option and every WhatsApp message',
  homeP.includes('hm-offer__amount">RM299<') && edP.includes('hm-offerbar__amount">RM299<') && (edP.match(/hm-offer__amount">RM299</g) || []).length === 1
  && edP.includes('<option value="First Trial RM299" selected>') && msgsP.length === 4 && msgsP.every((m) => m === offerMsg(offerBlk.title, 'RM299'))
  && !homeP.includes('RM288') && !edP.includes('RM288'), `RM299 ×${where(homeP)} on Utama, ×${where(edP)} on ED; RM288 left: ${(homeP + edP).includes('RM288')}`);
await setCS({ offer_price: '' });
const homeOff = await page('/'); const edOff = await page();
check('F7', 'Emptying offer_price switches the offer off everywhere (cards, bar, tab, form option)',
  ![homeOff, edOff].some((x) => /class="hm-container hm-offer|class="hm-offerbar"|href="#first-trial"|First Trial RM/.test(x)));
await admin('/custom_theme_settings/', { method: 'PUT', json: { custom_theme_settings: cs.map((s) => ({ key: s.key, value: s.value })) } });

// Offer copy comes from the block; fallback when unpublished
await edit('posts', offerBlk.id, { title: 'First Trial (diedit)' });
const homeE = await page('/'); const edE = await page();
await edit('posts', offerBlk.id, { status: 'draft' });
const homeF = await page('/');
await edit('posts', offerBlk.id, { status: 'published', title: offerBlk.title });
check('F8', 'Offer name/CTA/contents come from block "blok-tawaran" (edit → visible incl. WhatsApp message); unpublished → approved copy',
  homeE.includes('id="hm-offer-title">First Trial (diedit)</h2>') && edE.includes('Apa yang termasuk dalam First Trial (diedit)') && offerCtas(edE).every((m) => m.includes('First Trial (diedit) '))
  && homeF.includes('id="hm-offer-title">First Trial</h2>') && homeF.includes('1 × Shockwave Therapy'));

// Combined treatment programme
const sevenTen = (x) => (x.match(/7–10/g) || []).length;
check('F9', 'Combined programme: one estimate ("Anggaran 7–10 sesi rawatan … Shockwave Therapy dan Kegel EMS …"); no separate per-treatment estimates',
  h.includes('Anggaran 7–10 sesi rawatan. Setiap sesi merangkumi Shockwave Therapy dan Kegel EMS, dengan cadangan rawatan disesuaikan mengikut penilaian individu.')
  && sevenTen(h) === 1 && sevenTen(home) === 0 && !h.includes('BILANGAN SESI'), `"7–10" on ED: ${sevenTen(h)}, on Utama: ${sevenTen(home)}`);
check('F10', 'Theme settings: 20 registered (Ghost/GScan maximum), offer_price among them', (await admin('/custom_theme_settings/')).custom_theme_settings.length === 20 && cs.some((s) => s.key === 'offer_price'));

// Browser checks
let chromium; try { ({ chromium } = createRequire(import.meta.url)('playwright')); } catch { console.log('SKIP  browser checks — Playwright not available'); }
if (chromium) {
  const b = await chromium.launch();
  // E15 — no horizontal overflow
  const widths = [];
  for (const w of [390, 768, 1024, 1440]) { const p = await b.newPage({ viewport: { width: w, height: 900 } }); await p.goto(BASE + PATH); widths.push([w, await p.evaluate(() => document.documentElement.scrollWidth)]); await p.close(); }
  check('E15', 'No horizontal page overflow at 390 / 768 / 1024 / 1440px', widths.every(([w, s]) => s === w), widths.map(([w, s]) => `${w}:${s}`).join(' '));

  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.addInitScript(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); return {}; }; });
  await p.goto(BASE + PATH); await p.waitForTimeout(500);
  // E16 — body splitting: left column shows paragraphs only, card shows the list only; lead/rest around the tiles
  const split = await p.evaluate(() => {
    const vis = (sel) => [...document.querySelectorAll(sel + ' > *')].filter((e) => getComputedStyle(e).display !== 'none').map((e) => e.tagName);
    return { left: vis('.hm-edapa__body'), card: vis('.hm-signs__list'), lead: vis('#shockwave .hm-edsvc__lead'), rest: vis('#shockwave .hm-edsvc__rest') };
  });
  check('E16', 'One block body, two places: paragraphs left + list in the card; description above the tiles, list + note below',
    split.left.every((t) => t === 'P') && split.left.length >= 1 && split.card.join() === 'UL' && split.lead.join() === 'P' && split.rest.includes('UL'), JSON.stringify(split));
  // E17 — active tab follows scrolling
  await p.evaluate(() => document.getElementById('punca').scrollIntoView()); await p.waitForTimeout(700);
  const active = await p.evaluate(() => document.querySelector('.hm-tabs__link.is-active')?.textContent.trim());
  check('E17', 'Sticky tab bar marks the section in view', active === 'Punca', `active: ${active}`);
  // E18 — form validation, service preselect, WhatsApp message
  await p.click('#temujanji button[type="submit"]');
  const errShown = await p.evaluate(() => !document.querySelector('[data-hm-form-error]').hidden && window.__opened.length === 0);
  await p.click('#ems .hm-svc-cta__link'); await p.waitForTimeout(300);
  const pre = await p.$eval('select[name="hm_perkhidmatan"]', (s) => s.value);
  await p.fill('input[name="hm_nama"]', 'Ahmad'); await p.fill('input[name="hm_telefon"]', '012-345 6789');
  await p.fill('input[name="hm_tarikh"]', '2027-01-15'); await p.check('input[name="hm_masa"][value="Petang"]');
  await p.fill('textarea[name="text"]', 'Soalan ringkas.'); await p.check('input[name="hm_consent"]');
  await p.click('#temujanji button[type="submit"]'); await p.waitForTimeout(300);
  const opened = await p.evaluate(() => window.__opened[0] || '');
  const minDate = await p.$eval('input[name="hm_tarikh"]', (i) => i.min);
  const msg = opened ? decodeURIComponent(new URL(opened).searchParams.get('text')) : '';
  check('E18', 'Form: empty submit shows the error and opens nothing; treatment link preselects the service', errShown && pre === 'Kegel EMS', `preselected: ${pre}`);
  check('E19', 'Form opens WhatsApp with the visitor\'s details as the message; past dates blocked',
    opened.startsWith(`https://wa.me/${wa}?text=`) && ['Nama: Ahmad', 'No. telefon: 012-345 6789', 'Perkhidmatan: Kegel EMS', 'Tarikh pilihan: 15/01/2027', 'Masa pilihan: Petang', 'Mesej: Soalan ringkas.'].every((l) => msg.includes(l)) && /^\d{4}-\d{2}-\d{2}$/.test(minDate),
    msg.split('\n').filter(Boolean).join(' | '));
  // F11 — form defaults to the First Trial option and carries it into the WhatsApp message
  const p3 = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p3.addInitScript(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); return {}; }; });
  await p3.goto(BASE + PATH); await p3.waitForTimeout(400);
  await p3.fill('input[name="hm_nama"]', 'Ali'); await p3.check('input[name="hm_consent"]'); await p3.click('#temujanji button[type="submit"]'); await p3.waitForTimeout(200);
  const m3 = await p3.evaluate(() => decodeURIComponent(new URL(window.__opened[0]).searchParams.get('text')));
  const sw = await p3.evaluate(() => [390, document.documentElement.scrollWidth]);
  await p3.goto(BASE + '/'); const swHome = await p3.evaluate(() => document.documentElement.scrollWidth);
  const offerTop = await p3.evaluate(() => Math.round(document.querySelector('.hm-offer').getBoundingClientRect().top + scrollY));
  const offerH = await p3.evaluate(() => Math.round(document.querySelector('.hm-offer').getBoundingClientRect().height));
  await p3.close();
  check('F11', 'Booking form defaults to "First Trial RM288" and the WhatsApp message names it; phone layout has no overflow',
    m3.includes(`Perkhidmatan: First Trial ${priceNow}`) && sw[1] === 390 && swHome === 390, `offer card on phone: ${offerH}px tall, starts at ${offerTop}px`);
  // E20 — FAQ first question open
  const faq = await p.$$eval('#soalan .kg-toggle-card', (els) => els.map((e) => e.dataset.kgToggleState));
  check('E20', 'FAQ: first question open, others closed', faq[0] === 'open' && faq.slice(1).every((s) => s === 'close'), faq.join(','));
  await b.close();
}

const fails = results.filter((r) => !r.pass);
console.log(`\n${results.length - fails.length} passed, ${fails.length} failed`);
process.exit(fails.length ? 1 : 0);
