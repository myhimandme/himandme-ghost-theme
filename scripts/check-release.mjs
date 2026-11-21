// Stage 7 (G1/G3): final release checks, run last by `npm run release`.
//
//   1. routes.yaml keeps the production author channel (O4: slug `dr`) and the #blok exclusions;
//   2. the theme zip holds only theme files (no tests, docs, seed, scripts, node_modules, dist, source maps);
//      file entries are mode 0644 and directory entries 0755 (any other entry type, such as a symlink, fails);
//      package.json inside it carries the release version;
//   3. writes dist/SHA256SUMS for the zip, the launch seed, routes.yaml and redirects.yaml.
// It reads local files only and changes nothing outside dist/.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

// Reads `zipinfo` output into entries. A directory entry is recognised by its type character `d`
// (the first character of the Unix mode) or by a name ending in "/". The parsed count must equal the
// "number of entries" in the zipinfo header, so an unparsed line can never slip past the checks.
export function zipEntries(zipinfoText) {
  const declared = Number((zipinfoText.match(/number of entries:\s*(\d+)/) || [])[1]);
  const entries = zipinfoText.split('\n')
    .filter((l) => /^[-a-z][rwxsStT-]{9}\s/.test(l))
    .map((l) => {
      const mode = l.slice(0, 10);
      const name = l.split(/\s+/).slice(8).join(' ');
      const type = mode[0] === 'd' || name.endsWith('/') ? 'dir' : mode[0] === '-' ? 'file' : 'other';
      return { mode, name, type };
    });
  return { declared, entries };
}
// Expected permissions: files rw-r--r-- (0644), directories rwxr-xr-x (0755). Returns the entries that differ.
export function badModes(entries) {
  return entries.filter((e) => !((e.type === 'file' && e.mode === '-rw-r--r--') || (e.type === 'dir' && e.mode === 'drwxr-xr-x')));
}

let failed = 0;
const check = (name, ok, detail = '') => { if (!ok) failed++; console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`); };

if (import.meta.url === `file://${process.argv[1]}`) {
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
    const { declared, entries } = zipEntries(execFileSync('zipinfo', [zip]).toString());
    const files = entries.filter((e) => e.type === 'file'); const dirs = entries.filter((e) => e.type === 'dir');
    check('zip: every entry parsed from zipinfo', declared === entries.length, `${entries.length} parsed of ${declared} declared`);
    const forbidden = entries.filter((e) => /^(test|docs|seed|scripts|node_modules|dist|\.git|\.github)\//.test(e.name) || /\.map$|\.env|\.DS_Store/.test(e.name));
    check(`zip: only theme files (${entries.length} entries)`, entries.length > 0 && forbidden.length === 0, forbidden.slice(0, 5).map((e) => e.name).join(', '));
    const badMode = badModes(entries);
    check(`zip: files 0644 (${files.length}), directories 0755 (${dirs.length}), no other entry types`, badMode.length === 0,
      badMode.slice(0, 5).map((e) => `${e.name} ${e.mode} (${e.type})`).join(', '));
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
  const sumFiles = [zip, 'dist/launch-seed.json', 'routes.yaml', 'redirects.yaml'];
  const missing = sumFiles.filter((f) => !existsSync(f));
  check('release files present for checksums', missing.length === 0, missing.join(', '));
  if (!missing.length) {
    const sums = sumFiles.map((f) => `${createHash('sha256').update(readFileSync(f)).digest('hex')}  ${f}`).join('\n') + '\n';
    writeFileSync('dist/SHA256SUMS', sums);
    console.log(`\ndist/SHA256SUMS:\n${sums}`);
  }
  console.log(failed ? `${failed} release check(s) failed` : 'release checks passed');
  process.exit(failed ? 1 : 0);
}
