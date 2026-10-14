// Builds the change-record PDF for a batch from docs/records/<batch>/<ID>.json (+ img/) — see CLAUDE.md "Change records".
// Usage: node tools/records/build-pdf.cjs <batchDir> <out.pdf> <meta.json>
//   meta.json: { batch, title, date, branch, preview, intro, notes: [ "…" ], skipped: [ { id, why } ] }
// Record (plain language): { id, kind fix|new, area, title, problem, now, steps[], status done|partly, left, files[], notes,
//   copyOnly?, copy[{where,old,new}]?, shots[] }. Images: img/<ID>-<n>-before.jpg / -after.jpg (tools/records/shoot.cjs).
// Uses Playwright's print-to-PDF (local Chromium; no paid services). Images are embedded as data URIs.
const fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PW || '/opt/npm-tools/node_modules/playwright');
const [dir, outPdf, metaFile] = process.argv.slice(2);
const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
const img = path.join(dir, 'img');
const SECTIONS = { ON: 'Online selling', PR: 'Products & stock', RT: 'Retail & POS', WH: 'Wholesale', CX: 'Customers & marketing',
  MS: 'Money, team & settings', SA: 'Super admin', AP: 'Phone app' };
const ORDER = Object.keys(SECTIONS);
const num = (id) => parseInt(String(id).replace(/\D+/g, ''), 10) || 0;
const recs = fs.readdirSync(dir).filter((f) => /^[A-Z]{2}-[FU]\d+\.json$/.test(f)).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
  .sort((a, b) => ORDER.indexOf(a.id.slice(0, 2)) - ORDER.indexOf(b.id.slice(0, 2)) || (a.kind === b.kind ? 0 : a.kind === 'fix' ? -1 : 1) || num(a.id) - num(b.id));
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const md = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
const data = (f) => { const p = path.join(img, f); return fs.existsSync(p) ? 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64') : null; };
const fixes = recs.filter((r) => r.kind === 'fix'), news = recs.filter((r) => r.kind === 'new'), partly = recs.filter((r) => r.status === 'partly');
const word = (r) => (r.copyOnly ? 'Wording' : r.kind === 'new' ? 'New' : 'Fix');

function shots(r) {
  return (r.shots || []).map((s, i) => {
    const n = `${r.id}-${i + 1}`, b = data(n + '-before.jpg'), a = data(n + '-after.jpg');
    if (!a && !b) return '';
    const pair = !!(b && a);
    const fig = (src, lab, cls) => (src ? `<figure class="${cls}"><figcaption>${lab}</figcaption><img src="${src}"></figure>` : '');
    return `<div class="shot"><div class="cap">${esc(s.label || '')}${s.viewport === 'phone' ? ' <span>· phone</span>' : ''}</div>
      <div class="${pair ? 'pair' : 'single'}">${pair ? fig(b, 'Before', 'before') : ''}${fig(a, pair ? 'Now' : r.kind === 'new' ? 'New' : 'Now', 'after')}</div></div>`;
  }).join('');
}
const copyTable = (r) => (r.copy || []).length ? `<table class="copy"><tr><th style="width:24%">Where</th><th>Before</th><th>Now</th></tr>${r.copy.map((c) => `<tr><td>${md(c.where)}</td><td>${md(c.old)}</td><td>${md(c.new)}</td></tr>`).join('')}</table>` : '';
const entry = (r) => `<section class="entry">
  <div class="top"><span class="id">${esc(r.id)}</span><span class="area">${esc(r.area || SECTIONS[r.id.slice(0, 2)])}</span>
    <span class="kind ${r.kind}">${word(r)}</span><span class="st ${r.status}">${r.status === 'partly' ? 'Partly done' : 'Done'}</span></div>
  <h2>${esc(r.title)}</h2>
  <div class="pn"><div class="box prob"><b>${r.kind === 'new' ? 'What was missing' : 'Problem'}</b><p>${md(r.problem)}</p></div>
    <div class="box now"><b>Now</b><p>${md(r.now)}</p></div></div>
  ${shots(r)}${r.copyOnly ? copyTable(r) : ''}
  <div class="try"><b>Try it yourself</b><ol>${(r.steps || []).map((s) => `<li>${md(s)}</li>`).join('')}</ol></div>
  ${r.left ? `<div class="left"><b>Not covered yet:</b> ${md(r.left)}</div>` : ''}
  <div class="tech">For developers · ${(r.files || []).map((f) => `<code>${esc(f)}</code>`).join(' ')}${r.notes ? ` · ${md(r.notes)}` : ''}</div>
</section>`;

const bySection = ORDER.map((k) => [k, recs.filter((r) => r.id.startsWith(k))]).filter(([, l]) => l.length);
const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(meta.title)}</title><style>
@page{size:A4}
body{font-family:Poppins,"Segoe UI",Arial,sans-serif;font-size:11px;line-height:1.5;color:#0d1b3d;margin:0}
h1{font-size:28px;margin:0 0 6px;line-height:1.15} h2{font-size:17px;margin:4px 0 10px;line-height:1.3}
.cover{page-break-after:always;padding-top:30mm}
.eyebrow{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#0084bd;font-weight:600}
.lead{font-size:12.5px;color:#33415e;max-width:150mm;margin:8px 0 0}
.meta{margin:16px 0;display:grid;grid-template-columns:110px 1fr;gap:4px 12px;font-size:11px}.meta b{color:#5a6785;font-weight:500}
.counts{display:flex;gap:10px;margin:18px 0}.counts div{border:1px solid #dce2ee;border-radius:10px;padding:10px 14px;min-width:100px;font-size:11px;color:#5a6785}.counts b{display:block;font-size:24px;color:#0d1b3d}
.howto{border:1px solid #dce2ee;border-radius:10px;padding:10px 14px;font-size:11px;color:#33415e;margin-top:14px}
table{width:100%;border-collapse:collapse;font-size:10.5px}th,td{border-bottom:1px solid #e3e8f1;padding:5px 6px;text-align:left;vertical-align:top}th{color:#5a6785;font-weight:600}
.index{page-break-after:always} .index h3{font-size:12px;margin:14px 0 4px;color:#003087}
.entry{page-break-before:always}
.top{display:flex;gap:8px;align-items:center;font-size:10px}
.id{font-family:"JetBrains Mono",Consolas,monospace;font-size:10.5px;color:#003087;font-weight:600}
.area{color:#5a6785}
.kind,.st{font-size:9px;font-weight:600;padding:2px 8px;border-radius:999px}
.kind.fix{background:#e6f0ff;color:#003087}.kind.new{background:#efedfd;color:#4b3cc4}
.st.done{background:#e7f6ec;color:#15803d}.st.partly{background:#fdf3e2;color:#b45309}
.pn{display:flex;gap:10px;margin-bottom:10px}
.box{flex:1;border-radius:10px;padding:10px 12px}.box b{font-size:10px;text-transform:uppercase;letter-spacing:.06em}.box p{margin:4px 0 0;font-size:12.5px;line-height:1.45}
.prob{background:#fdf0f0}.prob b{color:#b91c1c}.now{background:#ecf8f0}.now b{color:#15803d}
.shot{margin:8px 0;break-inside:avoid}.cap{font-size:10.5px;font-weight:600;margin-bottom:4px}.cap span{color:#5a6785;font-weight:400}
.pair{display:flex;gap:8px;align-items:flex-start}.pair figure{flex:1;min-width:0}
figure{margin:0;border:1px solid #dce2ee;border-radius:6px;overflow:hidden}
figcaption{font-size:9px;font-weight:700;padding:3px 8px;background:#f1f4fa;text-transform:uppercase;letter-spacing:.05em}
figure.before figcaption{color:#b91c1c}figure.after figcaption{color:#15803d}
img{display:block;width:100%;max-height:300px;object-fit:contain;object-position:top left;background:#fff}
.single img{max-height:380px}
.try{margin-top:10px;font-size:11.5px}.try b{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#003087}.try ol{margin:4px 0 0;padding-left:18px}.try li{margin-bottom:2px}
.left{margin-top:8px;font-size:11px;background:#fdf6e7;border-radius:8px;padding:6px 10px;color:#7a4a05}
.tech{margin-top:10px;font-size:8px;color:#7a869e;border-top:1px solid #e3e8f1;padding-top:5px}
code{font-family:"JetBrains Mono",Consolas,monospace;font-size:7.5px;background:#f1f4fa;padding:0 3px;border-radius:3px;word-break:break-word}
.copy{margin-top:8px}
.sec{page-break-before:always} .note li{margin-bottom:4px}
</style></head><body>
<div class="cover"><span class="eyebrow">Grid Commerce · change record</span><h1>${esc(meta.title)}</h1>
<p class="lead">${md(meta.intro || '')}</p>
<div class="meta"><b>Batch</b><span>${esc(meta.batch)}</span><b>Date</b><span>${esc(meta.date)}</span><b>Branch</b><span>${esc(meta.branch)}</span><b>Preview</b><span>${esc(meta.preview)}</span><b>Compared with</b><span>Mostafiz vai's handover (12 Oct 2026)</span></div>
<div class="counts"><div><b>${recs.length}</b>changes</div><div><b>${fixes.length}</b>fixes</div><div><b>${news.length}</b>new features</div><div><b>${partly.length}</b>partly done</div><div><b>${(meta.skipped || []).length}</b>skipped</div></div>
<div class="howto"><b>How to read each page:</b> the red box says what was wrong (or missing), the green box says what happens now, the pictures show Before and Now on the same screen, and "Try it yourself" lists the clicks to see it on the preview site. Grey small print at the bottom is for developers.</div></div>
<div class="index"><h2>All changes</h2>${bySection.map(([k, l]) => `<h3>${SECTIONS[k]} · ${l.length}</h3><table><tr><th style="width:12%">ID</th><th style="width:12%">Type</th><th>Change</th><th style="width:12%">Status</th></tr>
${l.map((r) => `<tr><td class="id">${esc(r.id)}</td><td>${word(r)}</td><td>${esc(r.title)}</td><td>${r.status === 'partly' ? 'Partly' : 'Done'}</td></tr>`).join('')}</table>`).join('')}</div>
${recs.map(entry).join('')}
<section class="sec"><h2>Partly done, skipped and found along the way</h2>
${partly.length ? `<h3>Partly done (${partly.length})</h3><table><tr><th style="width:12%">ID</th><th style="width:34%">Change</th><th>Not covered yet</th></tr>${partly.map((r) => `<tr><td class="id">${esc(r.id)}</td><td>${esc(r.title)}</td><td>${md(r.left)}</td></tr>`).join('')}</table>` : ''}
${(meta.skipped || []).length ? `<h3>Skipped</h3><table>${meta.skipped.map((s) => `<tr><td class="id">${esc(s.id)}</td><td>${md(s.why)}</td></tr>`).join('')}</table>` : '<p>Nothing was skipped.</p>'}
${(meta.notes || []).length ? `<h3>Found along the way (not part of this batch)</h3><ul class="note">${meta.notes.map((n) => `<li>${md(n)}</li>`).join('')}</ul>` : ''}
</section></body></html>`;

(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.setContent(html, { waitUntil: 'load' });
  await p.pdf({ path: outPdf, format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: `<div style="font-size:8px;color:#5a6785;width:100%;padding:0 12mm;display:flex;justify-content:space-between"><span>${esc(meta.title)}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    margin: { top: '14mm', bottom: '16mm', left: '12mm', right: '12mm' } });
  await b.close(); console.log('PDF:', outPdf, recs.length, 'entries');
})();
