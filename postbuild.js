import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const wranglerJson = path.join(distDir, 'server', 'wrangler.json');
if (fs.existsSync(wranglerJson)) {
  fs.unlinkSync(wranglerJson);
  console.log('Removed dist/server/wrangler.json to prevent Pages reserved ASSETS clash.');
}

const workerJs = path.join(distDir, '_worker.js');
fs.writeFileSync(workerJs, 'export { default } from "./server/entry.mjs";\n', 'utf8');
console.log('Generated dist/_worker.js bridging Pages Advanced mode to Astro server entry.');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  for (const f of fs.readdirSync(src)) {
    const s = path.join(src, f);
    const d = path.join(dest, f);
    if (fs.statSync(s).isDirectory()) {
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

const clientDir = path.join(distDir, 'client');
if (fs.existsSync(clientDir)) {
  copyDir(clientDir, distDir);
  console.log('Synchronized client static assets into dist/ root.');
}
console.log('Postbuild finished successfully.');
