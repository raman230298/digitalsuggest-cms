import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const wranglerJson = path.join(distDir, 'server', 'wrangler.json');

if (fs.existsSync(wranglerJson)) {
  try {
    const cfg = JSON.parse(fs.readFileSync(wranglerJson, 'utf8'));
    // Remove bindings that cause Cloudflare Pages validation errors
    delete cfg.assets;
    if (cfg.previews) delete cfg.previews.assets;
    // Ensure SESSION KV namespace is configured
    cfg.kv_namespaces = [
      {
        binding: "SESSION",
        id: "208971ab196a4f5994d4598d5c173ee8"
      }
    ];
    fs.writeFileSync(wranglerJson, JSON.stringify(cfg, null, 2), 'utf8');
    console.log('Sanitized dist/server/wrangler.json for Cloudflare Pages compatibility.');
  } catch (err) {
    console.error('Failed to sanitize wrangler.json:', err);
  }
}

// Clean any temporary wrangler deploy configs
const dotWranglerDeploy = path.resolve('.wrangler', 'deploy');
if (fs.existsSync(dotWranglerDeploy)) {
  fs.rmSync(dotWranglerDeploy, { recursive: true, force: true });
  console.log('Cleaned .wrangler/deploy configuration.');
}

// Bridge _worker.js for Pages Advanced mode
const workerJs = path.join(distDir, '_worker.js');
fs.writeFileSync(workerJs, 'export { default } from "./server/entry.mjs";\n', 'utf8');
console.log('Generated dist/_worker.js bridging Pages Advanced mode.');

// Synchronize static client assets into dist root
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
console.log('Postbuild completed successfully.');
