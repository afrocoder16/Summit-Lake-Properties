/**
 * Post-build checks on dist/: banner, noindex, broken internal links and anchors,
 * images with alt text, and em dashes anywhere in the project. Run: npm run verify
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const dist = 'dist';
const base = (process.env.BASE_PATH ?? '').replace(/\/$/, '');
const failures = [];
const fail = (msg) => failures.push(msg);

const walk = (dir, skip = []) =>
  readdirSync(dir).flatMap((name) => {
    if (skip.includes(name)) return [];
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p, skip) : [p];
  });

const htmlFiles = walk(dist).filter((f) => f.endsWith('.html'));
const idsByFile = new Map();
for (const f of htmlFiles) {
  const html = readFileSync(f, 'utf8');
  idsByFile.set(f, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}
const resolve = (path) => {
  const clean = (base && path.startsWith(base) ? path.slice(base.length) : path).replace(/\/$/, '');
  return [join(dist, clean), join(dist, clean, 'index.html'), join(dist, clean + '.html')].find((p) => existsSync(p) && statSync(p).isFile());
};

for (const f of htmlFiles) {
  const html = readFileSync(f, 'utf8');
  if (!html.includes('Sample website by Midvora')) fail(`${f}: missing sample banner`);
  if (!/<meta name="robots" content="noindex/.test(html)) fail(`${f}: missing noindex`);
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt=/.test(m[0])) fail(`${f}: img without alt`);
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:|sms:|data:|#$)/.test(url)) continue;
    const [path, hash] = url.split('#');
    const target = path ? resolve(path) : f;
    if (!target) fail(`${f}: broken link ${url}`);
    else if (hash && target.endsWith('.html') && !idsByFile.get(target)?.has(hash)) fail(`${f}: missing anchor ${url}`);
  }
}

const textExt = new Set(['.ts', '.astro', '.mjs', '.md', '.css', '.json', '.html', '.txt', '.svg', '.example']);
const em = String.fromCharCode(0x2014);
for (const f of [...walk('.', ['node_modules', 'dist', '.git', '.astro']), ...walk(dist)]) {
  if (!textExt.has(extname(f)) && !f.endsWith('.env.example')) continue;
  if (f.endsWith('package-lock.json')) continue;
  if (readFileSync(f, 'utf8').includes(em)) fail(`${f}: contains an em dash`);
}

console.log(`${htmlFiles.length} pages checked`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('verify: all checks passed');
