// Guard rule (approved Stage 0–1 requirement): every post query in the theme must either
//   (a) explicitly exclude content blocks with "tag:-hash-blok", or
//   (b) be a specific block lookup by slug ("slug:blok-…") or by a block tag ("tag:hash-blok…").
// Collection listings are covered by routes.yaml (filter: tag:-hash-blok); this checks {{#get}} queries.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const files = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (['node_modules', 'dist', '.git', 'test'].includes(f)) continue;
    if (statSync(p).isDirectory()) walk(p); else if (p.endsWith('.hbs')) files.push(p);
  }
})('.');

const problems = [];
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\{\{#get\s+"posts"([^}]*)\}\}/g)) {
    const args = m[1];
    const filter = (args.match(/filter="([^"]*)"/) || [])[1] || '';
    const ok = filter.includes('tag:-hash-blok') || /^slug:blok-[a-z0-9-]+$/.test(filter) || /^tag:hash-blok[a-z0-9-]*$/.test(filter);
    if (!ok) problems.push(`${f}: {{#get "posts"${args}}} — add "+tag:-hash-blok" or use a specific block lookup`);
  }
}

if (problems.length) { console.error('Content-block guard failed:\n' + problems.join('\n')); process.exit(1); }
console.log(`Content-block guard: ${files.length} templates checked, every post query excludes #blok or targets a specific block.`);
