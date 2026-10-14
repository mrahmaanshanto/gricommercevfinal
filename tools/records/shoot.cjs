// Replays the screenshot specs in docs/records/<batch>/record.json (or a folder of <ID>.json records) and saves
// BEFORE (frozen handover build) and AFTER (work-branch build) JPEGs. Usage:
//   node tools/records/shoot.cjs <recordsDir> <outImgDir> <beforeBase> <afterBase>
// Env SHOTS=wholesale|normal filters by the shot's `wholesale` flag.
// Each shot: { route, query, viewport: desktop|phone, steps:[{click|fill+value|goto|wait|press}], crop, highlight, beforeToo }
const fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PW || '/opt/npm-tools/node_modules/playwright');
const [dir, out, BEFORE, AFTER] = process.argv.slice(2);
const VP = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };
fs.mkdirSync(out, { recursive: true });
const url = (base, route, q) => base + route + (route.includes('?') ? '&' : '?') + ['quiet=1', q].filter(Boolean).join('&');
async function shoot(browser, base, s, file) {
  const ctx = await browser.newContext({ viewport: VP[s.viewport || 'desktop'], deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  try {
    await p.goto(url(base, s.route, s.query), { waitUntil: 'networkidle', timeout: 60000 });
    await p.waitForTimeout(900);
    for (const st of s.steps || []) {
      if (st.click) await p.locator(st.click).first().click({ timeout: 8000 });
      else if (st.fill) await p.locator(st.fill).first().fill(String(st.value ?? ''), { timeout: 8000 });
      else if (st.press) await p.keyboard.press(st.press);
      else if (st.goto) {
        // a goto keeps who/which edition from the shot (as, edition, staff); its own query wins for everything else
        const [gp, gq] = st.goto.split('?'); const keep = new URLSearchParams();
        new URLSearchParams(s.query || '').forEach((v, k) => { if (['as', 'edition', 'staff'].includes(k)) keep.set(k, v); });
        new URLSearchParams(gq || '').forEach((v, k) => { if (k !== 'quiet') keep.set(k, v); });
        await p.goto(url(base, gp, keep.toString()), { waitUntil: 'networkidle' });
      }
      if (st.wait) await p.waitForTimeout(st.wait); else await p.waitForTimeout(350);
    }
    if (s.highlight) await p.evaluate((sel) => { const el = document.querySelector(sel); if (!el) return; const r = el.getBoundingClientRect(); const d = document.createElement('div'); Object.assign(d.style, { position: 'absolute', left: (r.left + scrollX - 4) + 'px', top: (r.top + scrollY - 4) + 'px', width: (r.width + 8) + 'px', height: (r.height + 8) + 'px', border: '3px solid #e11d48', borderRadius: '8px', zIndex: 2147483647, pointerEvents: 'none' }); document.body.appendChild(d); }, s.highlight);
    const opt = { path: file, type: 'jpeg', quality: 70 };
    if (s.crop && await p.locator(s.crop).count()) await p.locator(s.crop).first().screenshot(opt);
    else await p.screenshot(opt);
    return 'ok';
  } catch (e) { return 'fail: ' + e.message.split('\n')[0]; } finally { await ctx.close(); }
}
(async () => {
  const browser = await chromium.launch();
  const recs = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'record.json').map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  const log = {};
  // SHOTS=wholesale → only shots marked wholesale (taken on wholesale-on servers); SHOTS=normal → all others
  const only = process.env.SHOTS || '';
  for (const r of recs) for (const [i, s] of (r.shots || []).entries()) {
    const n = `${r.id}-${i + 1}`;
    if (only === 'wholesale' && !s.wholesale) continue;
    if (only === 'normal' && s.wholesale) continue;
    log[n + '-after'] = await shoot(browser, AFTER, s, path.join(out, n + '-after.jpg'));
    if (s.beforeToo !== false) log[n + '-before'] = await shoot(browser, BEFORE, s, path.join(out, n + '-before.jpg'));
  }
  await browser.close();
  console.log(JSON.stringify(log, null, 1));
})();
