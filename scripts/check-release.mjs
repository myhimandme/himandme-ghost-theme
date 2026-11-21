// Stage 7 (G1/G3): final release checks, run last by `npm run release`.
//
//   1. routes.yaml keeps the production author channel (O4: slug `dr`) and the #blok exclusions;
//   2. the theme zip holds only theme files (no tests, docs, seed, scripts, node_modules, dist, source maps),
//      every entry is mode 0644, and package.json inside it carries the release version;
//   3. writes dist/SHA256SUMS for the zip, the launch seed, routes.yaml and redirects.yaml.
// It reads local files only and changes nothing outside dist/.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

let failed = 0;
const check = (name, ok, detail = '') => { if (!ok) failed++; console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`); };

// 1. routes.yaml
const routes = readFileSync('routes.yaml', 'utf8');
check('routes.yaml: author channel /blog/penulis/dr/', /^ {2}\/blog\/penulis\/dr\/:\s*$/m.test(routes));
check('routes.yaml: channel filter authors:dr+tag:-hash-blok', /^\s+filter: authors:dr\+tag:-hash-blok\s*$/m.test(routes));
check('routes.yaml: channel data author.dr', /^\s+data: author\.dr\s*$/m.test(routes));
check('routes.yaml: /blog/ collection excludes #blok', /^ {2}\/blog\/:[\s\S]*?filter: tag:-hash-blok/m.test(routes));
const routeLines = routes.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n'); // ignore comments
check('routes.yaml: no placeholder author slug left', !/REPLACE|TODO|CHANGEME|YOUR[-_]/i.test(routeLines));

// 2. zip contents
const zip = 'dist/himandme-ghost-theme.zip';
check(`${zip} exists`, existsSync(zip));
if (existsSync(zip)) {
  const listing = execFileSync('zipinfo', [zip]).toString().split('\n').filter((l) => /^[-d][rwx-]{9}/.test(l));
  const entries = listing.map((l) => ({ mode: l.slice(0, 10), name: l.split(/\s+/).slice(8).join(' ') }));
  const forbidden = entries.filter((e) => /^(test|docs|seed|scripts|node_modules|dist|\.git|\.github)\//.test(e.name) || /\.map$|\.env|\.DS_Store/.test(e.name));
  check(`zip: only theme files (${entries.length} entries)`, entries.length > 0 && forbidden.length === 0, forbidden.slice(0, 5).map((e) => e.name).join(', '));
  const badMode = entries.filter((e) => e.mode !== '-rw-r--r--');
  check('zip: every entry is mode 0644', badMode.length === 0, badMode.slice(0, 5).map((e) => `${e.name} ${e.mode}`).join(', '));
  const need = ['package.json', 'routes.yaml', 'index.hbs', 'post.hbs', 'default.hbs', 'home.hbs', 'author.hbs', 'assets/built/main.js', 'assets/built/screen.css'];
  const missing = need.filter((n) => !entries.some((e) => e.name === n));
  check('zip: required theme files present', missing.length === 0, missing.join(', '));
  const pkgZip = JSON.parse(execFileSync('unzip', ['-p', zip, 'package.json']).toString());
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  check(`zip: package.json version ${pkg.version}`, pkgZip.version === pkg.version && pkg.version === '1.0.0', `zip ${pkgZip.version}`);
  const builtJs = execFileSync('unzip', ['-p', zip, 'assets/built/main.js']).toString();
  const builtCss = execFileSync('unzip', ['-p', zip, 'assets/built/screen.css']).toString();
  check('zip: no sourceMappingURL in built assets', !/sourceMappingURL/.test(builtJs + builtCss));
}

// 3. checksums
const files = [zip, 'dist/launch-seed.json', 'routes.yaml', 'redirects.yaml'];
const missing = files.filter((f) => !existsSync(f));
check('release files present for checksums', missing.length === 0, missing.join(', '));
if (!missing.length) {
  const sums = files.map((f) => `${createHash('sha256').update(readFileSync(f)).digest('hex')}  ${f}`).join('\n') + '\n';
  writeFileSync('dist/SHA256SUMS', sums);
  console.log(`\ndist/SHA256SUMS:\n${sums}`);
}
console.log(failed ? `${failed} release check(s) failed` : 'release checks passed');
process.exit(failed ? 1 : 0);
