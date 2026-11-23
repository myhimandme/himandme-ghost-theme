// G5 (Stage 7): placeholder and test-content scanner (docs/STAGE-7-PLAN.md §3.4).
//
//   node scripts/check-placeholders.mjs --theme                 theme files that go into the zip
//   node scripts/check-placeholders.mjs --seed dist/launch-seed.json
//   (rendered pages are scanned by test/prod/smoke.mjs, which imports scanText from here)
//
// Exit code 0 only when there are no hits outside the documented allowlist.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const PATTERNS = [
  { id: 'bracket-placeholder', re: /(?<![\w\])}.'"$])\[[A-Z][^\]\n<>{}]{1,100}\]/g },
  { id: 'test-word-ujian', re: /\bujian\b/gi },
  { id: 'teks-contoh', re: /teks contoh/gi },
  { id: 'gambar-ujian', re: /gambar ujian/gi },
  { id: 'dr-ujian', re: /dr\.?\s*ujian/gi },
  { id: 'default-credentials', re: /Doktor yang sah/g },
  { id: 'local-host', re: /localhost|himandme\.local|127\.0\.0\.1|:2368\b/gi },
  { id: 'email-address', re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi },
  { id: 'email-word', re: /\be-?mel\b|\bemail\b/gi },
];
// Text that is legitimately allowed everywhere.
const ALWAYS_ALLOWED = ['[Akta 709]', '[Act 709]'];

export function scanText(text, where) {
  const hits = [];
  for (const { id, re } of PATTERNS) {
    for (const m of text.matchAll(re)) {
      if (ALWAYS_ALLOWED.includes(m[0])) continue;
      const line = text.slice(0, m.index).split('\n').length;
      hits.push({ where, line, id, match: m[0] });
    }
  }
  return hits;
}

// Theme files: documented, intentional occurrences (file + exact match). Anything else fails.
const THEME_ALLOW = [
  { file: 'package.json', match: 'Doktor yang sah', why: 'default of the doctor_credentials setting; production sets the verified value (E8, O3)' },
  { file: 'package.json', id: 'email-address', why: 'author.email is required by GScan; package.json is never served by Ghost' },
  { file: 'package.json', id: 'email-word', why: 'the JSON key of author.email (same field as above)' },
];

function themeFiles() {
  const out = [];
  const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : out.push(p); } };
  for (const f of readdirSync('.')) if (f.endsWith('.hbs')) out.push(f);
  out.push('package.json', 'routes.yaml');
  for (const d of ['partials', 'assets/built', 'locales']) if (existsSync(d)) walk(d);
  return out.filter((f) => /\.(hbs|js|css|json|yaml)$/.test(f));
}

function report(hits, label) {
  if (!hits.length) { console.log(`✓ ${label}: no placeholder or test-content hits`); return 0; }
  console.log(`✗ ${label}: ${hits.length} hit(s)`);
  for (const h of hits.slice(0, 50)) console.log(`  ${h.where}:${h.line}  [${h.id}]  ${JSON.stringify(h.match)}`);
  return 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  let rc = 0;
  if (args.includes('--theme')) {
    const hits = [];
    const allowed = [];
    for (const f of themeFiles()) {
      for (const h of scanText(readFileSync(f, 'utf8'), f)) {
        const a = THEME_ALLOW.find((x) => x.file === f && (x.match ? x.match === h.match : x.id === h.id));
        (a ? allowed : hits).push(h);
      }
    }
    rc |= report(hits, `theme (${themeFiles().length} files)`);
    for (const a of THEME_ALLOW) {
      const n = allowed.filter((h) => h.where === a.file && (a.match ? h.match === a.match : h.id === a.id)).length;
      if (n) console.log(`  allowed: ${a.file} ${a.match ? JSON.stringify(a.match) : `[${a.id}]`} ×${n}: ${a.why}`);
    }
  }
  const si = args.indexOf('--seed');
  if (si >= 0) {
    const file = args[si + 1];
    const data = JSON.parse(readFileSync(file, 'utf8')).db[0].data;
    const hits = [];
    for (const p of data.posts) {
      for (const k of ['slug', 'title', 'custom_excerpt', 'html', 'meta_title', 'meta_description']) {
        if (p[k]) hits.push(...scanText(String(p[k]), `${file} ${p.slug}.${k}`));
      }
    }
    rc |= report(hits, `seed ${file} (${data.posts.length} posts/pages)`);
  }
  if (!args.length) { console.error('Usage: --theme and/or --seed <file>'); rc = 2; }
  process.exit(rc);
}
