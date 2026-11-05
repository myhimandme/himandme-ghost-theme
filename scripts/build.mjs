// Builds assets/css/screen.css and assets/js/*.js into assets/built/ (minified, with sourcemaps).
// Usage: node scripts/build.mjs [--watch]
import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

const options = {
  entryPoints: {
    screen: 'assets/css/screen.css',
    main: 'assets/js/main.js',
  },
  outdir: 'assets/built',
  bundle: true,
  minify: true,
  sourcemap: true,
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
  await esbuild.build(options);
}
