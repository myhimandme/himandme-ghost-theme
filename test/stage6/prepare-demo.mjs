// Stage 6 demo setup (LOCAL Ghost only). Run after test/stage1/reset-local.mjs.
// Turns the lead demo article into a full example of every article style, the way Ghost's editor stores it:
//   • the pull quote becomes Ghost's alternate quote style (an "aside" node → <blockquote class="kg-blockquote-alt">;
//     the JSON importer turns it into a plain quote),
//   • a labelled TEST feature image (16:7) with alt text and caption,
//   • a labelled TEST image card with a caption after the list.
// Test data only — nothing here is used on the live site.
//
//   GHOST_ADMIN_EMAIL=… GHOST_ADMIN_PASSWORD=… node test/stage6/prepare-demo.mjs
import { readFileSync } from 'node:fs';

const BASE = (process.env.GHOST_URL || 'http://localhost:2368').replace(/\/$/, '');
if (!['localhost', '127.0.0.1'].includes(new URL(BASE).hostname)) { console.error('Local Ghost only.'); process.exit(2); }
const { GHOST_ADMIN_EMAIL: EMAIL, GHOST_ADMIN_PASSWORD: PASSWORD } = process.env;
if (!EMAIL || !PASSWORD) { console.error('Set GHOST_ADMIN_EMAIL and GHOST_ADMIN_PASSWORD.'); process.exit(2); }
export const DEMO_SLUG = 'disfungsi-ereksi-bukan-sekadar-soal-usia';

let cookie = '';
async function admin(path, { method = 'GET', json, form } = {}) {
  const headers = { Origin: BASE, ...(cookie ? { Cookie: cookie } : {}), ...(json ? { 'Content-Type': 'application/json' } : {}) };
  const r = await fetch(`${BASE}/ghost/api/admin${path}`, { method, headers, body: json ? JSON.stringify(json) : form });
  const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0];
  const t = await r.text(); if (!r.ok) throw new Error(`${method} ${path} -> ${r.status} ${t.slice(0, 300)}`);
  try { return t ? JSON.parse(t) : {}; } catch { return {}; }
}
const upload = async (file) => {
  const f = new FormData();
  f.append('file', new Blob([readFileSync(new URL(`./fixtures/${file}`, import.meta.url))], { type: 'image/jpeg' }), file);
  return (await admin('/images/upload/', { method: 'POST', form: f })).images[0].url;
};

await admin('/session/', { method: 'POST', json: { username: EMAIL, password: PASSWORD } });
const post = (await admin(`/posts/slug/${DEMO_SLUG}/?formats=lexical`)).posts[0];
const lx = JSON.parse(post.lexical);
let quotes = 0;
for (const n of lx.root.children) if (n.type === 'extended-quote' && JSON.stringify(n).includes('Perubahan pada fungsi ereksi')) { n.type = 'aside'; n.version = 1; quotes++; }
const inline = await upload('gambar-ujian-sokongan.jpg');
if (!lx.root.children.some((n) => n.type === 'image')) {
  const at = lx.root.children.findIndex((n) => n.type === 'list');
  lx.root.children.splice(at + 1, 0, { type: 'image', version: 1, src: inline, width: 1200, height: 640, title: '', alt: 'Gambar ujian sokongan', caption: '[Gambar sokongan / ilustrasi ringkas — kapsyen]', cardWidth: 'regular', href: '' });
}
const hero = await upload('gambar-ujian-utama.jpg');
await admin(`/posts/${post.id}/`, { method: 'PUT', json: { posts: [{ lexical: JSON.stringify(lx), feature_image: hero, feature_image_alt: 'Gambar ujian utama artikel', feature_image_caption: '[Kapsyen gambar &amp; kredit]', updated_at: post.updated_at }] } });
console.log(`✓ ${DEMO_SLUG}: alternate quote (${quotes}), test feature image + caption, test image card`);
