// Packages the theme for upload in Ghost Admin (Settings → Theme → Change theme → Upload theme).
// Only theme files are included; dev tooling, tests and node_modules are left out.
import { mkdirSync, existsSync, rmSync, readdirSync } from 'node:fs';
import bestzip from 'bestzip';

const out = 'dist/himandme-ghost-theme.zip';
mkdirSync('dist', { recursive: true });
if (existsSync(out)) rmSync(out);

// Directories are added whole; top-level files are listed explicitly.
const include = [
  'package.json',
  'routes.yaml',
  ...readdirSync('.').filter((f) => f.endsWith('.hbs')),
  ...['partials', 'assets/built', 'assets/fonts', 'assets/images', 'locales'].filter((d) => existsSync(d)),
];

await bestzip({ source: include, destination: out });
console.log(`Created ${out}`);
