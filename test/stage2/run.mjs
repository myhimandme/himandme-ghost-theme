// Stage 2 checks: site chrome (headers, footers, menus, mobile bar) on every template, driven by
// Ghost data (navigation, theme settings, content blocks), plus the footer block fallback.
// LOCAL Ghost only (localhost / 127.0.0.1). Run after test/stage1/reset-local.mjs.
//
//   GHOST_ADMIN_EMAIL=… GHOST_ADMIN_PASSWORD=… node test/stage2/run.mjs
const BASE = (process.env.GHOST_URL || 'http://localhost:2368').replace(/\/$/, '');
if (!['localhost', '127.0.0.1'].includes(new URL(BASE).hostname)) { console.error('Local Ghost only.'); process.exit(2); }
const { GHOST_ADMIN_EMAIL: EMAIL, GHOST_ADMIN_PASSWORD: PASSWORD } = process.env;
if (!EMAIL || !PASSWORD) { console.error('Set GHOST_ADMIN_EMAIL and GHOST_ADMIN_PASSWORD.'); process.exit(2); }

let cookie = '';
async function admin(path, { method = 'GET', json } = {}) {
  const r = await fetch(`${BASE}/ghost/api/admin${path}`, { method, headers: { 'Content-Type': 'application/json', Origin: BASE, ...(cookie ? { Cookie: cookie } : {}) }, body: json ? JSON.stringify(json) : undefined });
  const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0];
  const t = await r.text(); if (!r.ok) throw new Error(`${method} ${path} -> ${r.status} ${t.slice(0, 200)}`);
  try { return t ? JSON.parse(t) : {}; } catch { return {}; }
}
const page = async (p) => { const r = await fetch(BASE + p); return { status: r.status, html: await r.text() }; };
const results = [];
const check = (id, what, pass, detail = '') => { results.push({ id, what, pass }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${id.padEnd(4)} ${what}${detail ? ` — ${detail}` : ''}`); };
const count = (html, needle) => html.split(needle).length - 1;

await admin('/session/', { method: 'POST', json: { username: EMAIL, password: PASSWORD } });
const settings = Object.fromEntries((await admin('/settings/')).settings.map((s) => [s.key, s.value]));
const nav = JSON.parse(settings.navigation); const cats = JSON.parse(settings.secondary_navigation);
const custom = Object.fromEntries((await admin('/custom_theme_settings/')).custom_theme_settings.map((s) => [s.key, s.value]));

// Which chrome each template must render (from the prototype boards)
const expect = {
  '/': { mode: 'main', parts: ['hm-utility', 'hm-header', 'hm-footer__cols', 'hm-mbar'] },
  '/disfungsi-ereksi/': { mode: 'main', parts: ['hm-header', 'hm-footer--compact', 'hm-mbar'], not: ['hm-utility', 'hm-footer__cols'] },
  '/notis-privasi/': { mode: 'main', parts: ['hm-header', 'hm-footer--compact'], not: ['hm-mbar'] },
  '/blog/': { mode: 'blog', parts: ['hm-topbar', 'hm-bheader', 'hm-cats', 'hm-bfooter--links'], not: ['hm-mbar'] },
  '/blog/topik/disfungsi-ereksi/': { mode: 'blog', parts: ['hm-topbar', 'hm-bheader', 'hm-bfooter--links'] },
  '/blog/penulis/dr/': { mode: 'blog', parts: ['hm-topbar', 'hm-bheader', 'hm-bfooter--links'] },
  '/blog/artikel-ujian-01/': { mode: 'blog', parts: ['hm-topbar', 'hm-aheader', 'hm-progress', 'hm-bfooter', 'hm-mbar--article'], not: ['hm-bfooter--links', 'hm-cats'] },
  '/tiada-halaman-ini/': { mode: 'main', status: 404, parts: ['hm-header', 'hm-footer--compact', 'data-template="error-404"'] },
};
for (const [path, e] of Object.entries(expect)) {
  const { status, html } = await page(path);
  const missing = e.parts.filter((p) => !html.includes(p));
  const extra = (e.not || []).filter((p) => html.includes(`class="${p}`) || html.includes(` ${p}"`) || html.includes(`${p} `));
  const modeOk = new RegExp(`<body class="[^"]*is-${e.mode}"`).test(html);
  check('S1', `${path} has the ${e.mode} chrome`, status === (e.status || 200) && modeOk && !missing.length && !extra.length,
    `HTTP ${status}${missing.length ? `; missing ${missing.join(', ')}` : ''}${extra.length ? `; unexpected ${extra.join(', ')}` : ''}`);
}

const home = (await page('/')).html; const ed = (await page('/disfungsi-ereksi/')).html; const blog = (await page('/blog/')).html; const topic = (await page('/blog/topik/gaya-hidup/')).html;
check('S2', 'Primary navigation comes from Settings → Navigation', nav.every((n) => home.includes(`>${n.label}</a>`)), nav.map((n) => n.label).join(', '));
check('S3', 'Blog category bar comes from secondary navigation (+ Semua)', cats.every((c) => blog.includes(`>${c.label}</a>`)) && blog.includes('hm-cats__link'), cats.map((c) => c.label).join(', '));
check('S4', 'Active page is marked (Disfungsi Ereksi on the ED page)', /hm-nav__link nav-current"[^>]*>Disfungsi Ereksi</.test(ed));
check('S5', 'Active category is marked on a topic page', /hm-cats__link nav-current"[^>]*>Gaya Hidup</.test(topic));
const wa = `https://wa.me/${custom.whatsapp_number}?text=${encodeURIComponent(custom.whatsapp_default_message)}`;
check('S6', 'WhatsApp links use the theme settings (number + default message)', home.includes(wa.replace(/&/g, '&amp;')) || home.includes(wa), `${count(home, 'https://wa.me/')} WhatsApp links on /`);
check('S7', 'Booking buttons point to /disfungsi-ereksi/#temujanji', home.includes(`${BASE}/disfungsi-ereksi/#temujanji`));
check('S8', 'Utility bar shows address + hours settings', home.includes(`<span>${custom.address_short}</span>`) && home.includes(`<span>${custom.opening_hours_short}</span>`));
const info = (await admin('/posts/slug/blok-maklumat-hubungan/?formats=html')).posts[0];
check('S9', 'Footer address/hours come from block "blok-maklumat-hubungan"', home.includes(info.custom_excerpt.split('\n')[0]) && home.includes('Isnin – Jumaat'));
const pen = (await admin('/posts/slug/blok-penafian/?formats=html')).posts[0];
check('S10', 'Footer disclaimer: block body on main site, block excerpt on the blog', home.includes(pen.html.replace(/<\/?p>/g, '').slice(0, 60)) && blog.includes(pen.custom_excerpt.slice(0, 60)));

// Fallback: unpublish the disclaimer block → approved copy appears; then restore.
await admin(`/posts/${pen.id}/`, { method: 'PUT', json: { posts: [{ status: 'draft', updated_at: pen.updated_at }] } });
const homeFb = (await page('/')).html; const blogFb = (await page('/blog/')).html;
const fresh = (await admin(`/posts/${pen.id}/`)).posts[0];
await admin(`/posts/${pen.id}/`, { method: 'PUT', json: { posts: [{ status: 'published', updated_at: fresh.updated_at }] } });
check('S11', 'Missing disclaimer block falls back to the approved copy (main + blog)', homeFb.includes('Kesesuaian sebarang rawatan ditentukan selepas penilaian oleh doktor.') && blogFb.includes('Artikel disemak sebelum diterbitkan.') && !homeFb.includes('ZZBLOK-007'));

check('S12', 'Mobile menu markup: dialog, hidden by default, labelled open/close buttons', /id="hm-menu" role="dialog" aria-modal="true"[^>]*hidden/.test(home) && home.includes('aria-controls="hm-menu"') && home.includes('data-hm-menu-close'));
check('S13', 'Skip link and <html lang> from the publication language', home.includes('class="hm-skip-link" href="#main"') && home.includes(`<html lang="${settings.locale}">`) && home.includes('id="main"'), `lang=${settings.locale}`);
check('S14', 'Native search script is not loaded; brand font is preloaded', !home.includes('sodo-search') && /rel="preload" href="[^"]*manrope-latin-wght-normal\.woff2/.test(home));
check('S15', 'Newsletter "Langgan" control removed from blog headers', !blog.includes('Langgan') && !(await page('/blog/artikel-ujian-01/')).html.includes('Langgan'));
const fontRes = await fetch(BASE + (home.match(/href="([^"]*manrope-latin-wght-normal\.woff2[^"]*)"/) || [])[1]?.replace(BASE, ''));
check('S16', 'Self-hosted font file is served', fontRes.ok && fontRes.headers.get('content-type')?.includes('font'), `${fontRes.status} ${fontRes.headers.get('content-type')}`);

const fails = results.filter((r) => !r.pass);
console.log(`\n${results.length - fails.length} passed, ${fails.length} failed`);
process.exit(fails.length ? 1 : 0);
