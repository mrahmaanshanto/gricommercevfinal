#!/usr/bin/env node
// Store kit renderer — shows a kit on the demo shop before anyone imports it: loads the kit into a fresh browser,
// opens Home, a category, a product, search, the cart and the kit's pages, on a computer (1440 px) and a phone (390 px),
// and saves a screenshot of each. Used by the store-building skill (tools/store-kit/SKILL.md) to look at a design and fix
// it before delivery. Nothing is saved to any shop.
//
//   node tools/store-kit/render.mjs <kit.gcstore.json> [--url http://localhost:3000] [--out kit-shots] [--full] [--pages home,product]
// Needs the app running (npm run dev, or npm run build && npx next start) and Playwright
// (npm i -D playwright, or set PLAYWRIGHT_DIR to a folder whose node_modules has it). Chromium must be installed.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

// the app's files are ES modules in a package without "type": "module"; Node reads them fine but warns once
const emit = process.emitWarning;
process.emitWarning = function (w, ...rest) { if (String((w && w.message) || w).includes('Module type of')) return; return emit.call(process, w, ...rest); };

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d; };
const file = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--') && !['--full'].includes(args[i - 1])));
if (!file) { console.log('Usage: node tools/store-kit/render.mjs <kit.gcstore.json> [--url http://localhost:3000] [--out kit-shots] [--full] [--pages home,category,product,search,cart,pages]'); process.exit(1); }
const base = opt('url', 'http://localhost:3000').replace(/\/$/, '');
const out = opt('out', 'kit-shots');
const full = args.includes('--full');
const want = new Set(opt('pages', 'home,category,product,search,cart,pages').split(','));

const { checkKit, kitToStore, fillTokens } = await import(pathToFileURL(path.join(root, 'src/lib/storefront/kit.js')).href);
const r = checkKit(fs.readFileSync(file, 'utf8'));
if (!r.ok) { console.log('The kit has errors; fix them first (node tools/store-kit/check.mjs ' + file + '):'); r.errors.forEach((e) => console.log('  ' + e.path + ': ' + e.text)); process.exit(1); }
const kit = fillTokens(r.kit, { name: 'Dazzle Shop', phone: '01811-843300', email: 'hello@dazzleshop.com.bd', address: 'House 12, Road 5, Dhanmondi, Dhaka', hours: 'Every day, 10 AM – 9 PM', whatsapp: '8801811843300' });
const S = kitToStore(kit);
const now = Date.now();
const store = {
  v: 1, preset: (kit.meta && kit.meta.id) || 'kit',
  theme: S.theme ? { draft: S.theme, live: S.theme, draftAt: now, liveAt: now } : undefined,
  headers: S.headers || [], defaultHeader: S.defaultHeader || '', blocks: S.blocks || [], layouts: S.layouts || [],
  notices: S.notices || [], placements: S.placements || [], customs: S.customs || [], restore: [], kit: { id: (kit.meta && kit.meta.id) || '', name: kit.meta && kit.meta.name },
};
if (!store.theme) delete store.theme;
const demo = (/const DEMO_DATA = '([^']+)'/.exec(fs.readFileSync(path.join(root, 'src/app/layout.jsx'), 'utf8')) || [])[1] || '';

const req = createRequire(import.meta.url);
let pw = null;
for (const p of [process.cwd(), root, process.env.PLAYWRIGHT_DIR, '/opt/npm-tools/node_modules'].filter(Boolean)) {
  try { pw = req(req.resolve('playwright', { paths: [p] })); break; } catch { /* next */ }
}
if (!pw) { console.log('Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium (or set PLAYWRIGHT_DIR).'); process.exit(2); }

fs.mkdirSync(out, { recursive: true });
const browser = await pw.chromium.launch();
const shots = [];
for (const vp of [{ name: 'computer', width: 1440, height: 900 }, { name: 'phone', width: 390, height: 844 }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  await ctx.addInitScript(([demoKey, sf, menus]) => {
    try {
      if (sessionStorage.getItem('kit.loaded')) return;
      if (demoKey) localStorage.setItem('gc.demo.data', demoKey);
      localStorage.setItem('gc.storefront', sf);
      localStorage.setItem('gc.store.cookies', 'yes');
      if (menus) localStorage.setItem('gc.storeMenus', menus);
      sessionStorage.setItem('kit.loaded', '1');
    } catch (e) { /* ignore */ }
  }, [demo, JSON.stringify(store), S.menus ? JSON.stringify(S.menus) : '']);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const go = async (u) => { await page.goto(base + u + (u.includes('?') ? '&' : '?') + 'quiet=1', { waitUntil: 'networkidle', timeout: 60000 }); await page.waitForTimeout(700); };
  const snap = async (key) => { const f = path.join(out, `${key}-${vp.name}.jpg`); await page.screenshot({ path: f, type: 'jpeg', quality: 70, fullPage: full }); shots.push(f); };
  await go('/store');
  // the kit's pages join the shop's own pages (which the app made on first open)
  if (S.pages && S.pages.length) {
    await page.evaluate((pages) => {
      let list = []; try { list = JSON.parse(localStorage.getItem('gc.storePages') || '[]'); } catch { list = []; }
      const t = new Date().toISOString();
      pages.forEach((p) => { const i = list.findIndex((x) => x.handle === p.handle); const row = { id: 'pg-' + p.handle, template: 'blank', noindex: false, createdAt: t, updatedAt: t, publishedAt: t, seo: { title: '', description: '' }, ...(i >= 0 ? list[i] : {}), handle: p.handle, title: p.title, blocks: p.blocks, status: p.status }; if (i >= 0) list[i] = row; else list.unshift(row); });
      localStorage.setItem('gc.storePages', JSON.stringify(list));
    }, S.pages);
    await go('/store');
  }
  if (want.has('home')) await snap('home');
  const firstHref = (pre) => page.evaluate((p) => { const a = [...document.querySelectorAll('a[href]')].map((x) => x.getAttribute('href')).find((h) => h && h.startsWith(p)); return a || ''; }, pre);
  const cat = await firstHref('/category?handle=');
  const prod = await firstHref('/product?handle=');
  if (want.has('category') && cat) { await go(cat); await snap('category'); }
  if (want.has('product') && prod) { await go(prod); await snap('product'); }
  if (want.has('search')) { await go('/search?q=a'); await snap('search'); }
  if (want.has('cart')) { await go('/cart'); await snap('cart'); }
  if (want.has('pages')) for (const p of (S.pages || [])) { await go('/page?handle=' + encodeURIComponent(p.handle)); await snap('page-' + p.handle); }
  if (errors.length) console.log(`${vp.name}: page errors:\n  ` + [...new Set(errors)].slice(0, 5).join('\n  '));
  await ctx.close();
}
await browser.close();
console.log(`Saved ${shots.length} screenshots in ${out}/:\n  ` + shots.map((f) => path.basename(f)).join('\n  '));
