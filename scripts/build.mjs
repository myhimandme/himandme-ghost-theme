// Builds assets/css/screen.css and assets/js/*.js into assets/built/ (minified).
// Usage: node scripts/build.mjs [--watch] [--release]
// Development builds include sourcemaps; --release (used by `npm run zip`) builds without them, so the
// release zip contains no .map files and no sourceMappingURL references (Stage 7 plan §4).
import { rmSync } from 'node:fs';
import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');
const release = process.argv.includes('--release');

const options = {
  entryPoints: {
    screen: 'assets/css/screen.css',
    main: 'assets/js/main.js',
  },
  outdir: 'assets/built',
  bundle: true,
  minify: true,
  sourcemap: !release,
  target: ['es2019', 'chrome90', 'safari14', 'firefox90'],
  // Fonts and images referenced from CSS stay as files next to the theme assets.
  external: ['../fonts/*', '../images/*'],
  logLevel: 'info',
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log('Watching assets/ for changes…');
} else {
  // Remove stale maps so a release build never ships an old .map file.
  if (release) for (const f of ['assets/built/screen.css.map', 'assets/built/main.js.map']) rmSync(f, { force: true });
  await esbuild.build(options);
}
