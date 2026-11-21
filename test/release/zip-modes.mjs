// B-gate correction: proves the release zip permission check (scripts/check-release.mjs) on fixture zips.
// Builds small zips in a temporary folder with real `zip` and `zipinfo`, so directory entries, wrong modes and
// symlinks appear exactly as zipinfo prints them. Local files only; nothing leaves the machine.
//   node test/release/zip-modes.mjs
import { mkdtempSync, mkdirSync, writeFileSync, chmodSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { zipEntries, badModes } from '../../scripts/check-release.mjs';

const root = mkdtempSync(join(tmpdir(), 'zip-modes-'));
let failed = 0;
const check = (id, name, ok, detail = '') => { if (!ok) failed++; console.log(`${ok ? '✓' : '✗'} ${id} ${name}${detail ? ` — ${detail}` : ''}`); };

// Creates a fixture tree, zips it (with directory entries unless noDirs) and returns the parsed result.
function fixture(name, { dirMode = 0o755, fileMode = 0o644, link = false, noDirs = false } = {}) {
  const src = join(root, name); mkdirSync(join(src, 'assets/built'), { recursive: true });
  writeFileSync(join(src, 'package.json'), '{}'); writeFileSync(join(src, 'assets/built/main.js'), '1');
  if (link) symlinkSync('package.json', join(src, 'link.json'));
  for (const f of ['package.json', 'assets/built/main.js']) chmodSync(join(src, f), fileMode);
  for (const d of ['assets/built', 'assets']) chmodSync(join(src, d), dirMode);
  const out = join(root, `${name}.zip`);
  execFileSync('zip', ['-X', '-q', '-y', '-r', ...(noDirs ? ['-D'] : []), out, '.'], { cwd: src });
  return zipEntries(execFileSync('zipinfo', [out]).toString());
}
const show = (bad) => bad.map((e) => `${e.name} ${e.mode} (${e.type})`).join(', ');

try {
  const a = fixture('ok');
  const aDirs = a.entries.filter((e) => e.type === 'dir');
  check('Z1', 'Directory entries are recognised as directories (type d, name ends in "/")', aDirs.length === 2 && aDirs.every((e) => e.mode[0] === 'd' && e.name.endsWith('/')), aDirs.map((e) => `${e.name} ${e.mode}`).join(', '));
  check('Z2', 'Every zipinfo entry is parsed (count equals the header)', a.declared === a.entries.length, `${a.entries.length}/${a.declared}`);
  check('Z3', 'Files 0644 + directories 0755 pass', badModes(a.entries).length === 0, show(badModes(a.entries)) || `${a.entries.length} entries`);
  const b = fixture('dir700', { dirMode: 0o700 });
  check('Z4', 'A directory that is not 0755 fails', badModes(b.entries).length === 2 && badModes(b.entries).every((e) => e.type === 'dir'), show(badModes(b.entries)));
  const c = fixture('file600', { fileMode: 0o600 });
  check('Z5', 'A file that is not 0644 fails (the old 0600 logo case)', badModes(c.entries).length === 2 && badModes(c.entries).every((e) => e.type === 'file'), show(badModes(c.entries)));
  const d = fixture('file755', { fileMode: 0o755 });
  check('Z6', 'A file with directory permissions (0755) fails', badModes(d.entries).length === 2, show(badModes(d.entries)));
  const e = fixture('symlink', { link: true });
  const eb = badModes(e.entries);
  check('Z7', 'A symlink entry fails (not a file or directory)', eb.length === 1 && eb[0].type === 'other', show(eb));
  const f = fixture('nodirs', { noDirs: true });
  check('Z8', 'A zip without directory entries (the release zip, built with zip -D) passes', f.entries.every((x) => x.type === 'file') && badModes(f.entries).length === 0, `${f.entries.length} file entries`);
} finally {
  rmSync(root, { recursive: true, force: true });
}
console.log(`\n${failed ? `${failed} failed` : 'all passed'}`);
process.exit(failed ? 1 : 0);
