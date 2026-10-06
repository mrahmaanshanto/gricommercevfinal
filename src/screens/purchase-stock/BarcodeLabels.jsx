'use client';
// Generated from design/templates/purchase-stock/BarcodeLabels.dc.html by scripts/convert-design.mjs.
// Barcode labels — Stocks & inventory — Barcode labels, a Shopify-style tool page (docs/shopify-style.md): pick the
// items and the label layout on the left, the live preview on the right, Print in the header.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import { DCLogic, Icon as __Icon, list as __list } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { ShopHeader } from '@/components/ui/IndexKit';
import { toast as __toast } from '@/runtime/ui';

// ---- logic (from the design's <script type="text/x-dc">) ----

var BND = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
function dg(s, bn) { s = String(s); return bn ? s.replace(/[0-9]/g, function (d) { return BND[+d]; }) : s; }
function money(n, bn) { var s = String(Math.round(Math.abs(n))); var last = s.slice(-3), rest = s.slice(0, -3); if (rest) s = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last; else s = last; return dg((n < 0 ? '−' : '') + '৳' + s, bn); }
function unbn(x) { return String(x).replace(/[০-৯]/g, function (d) { return BND.indexOf(d); }); }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function seg(self, opts, cur, key, i) { return opts.map(function (o) { var on = o[0] === cur; return { k: o[0], l: o[1 + i], on: on, pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
function sw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function toast(self, m) { __toast(m); }
var T = {"shop": ["রহমান স্টোর", "Dazzle Shop"], "h": ["বারকোড লেবেল প্রিন্ট", "Print barcode labels"], "hsub": ["কোন মালে লেবেল লাগবে বাছুন, কয়টা লাগবে দিন, তারপর প্রিন্ট করুন।", "Pick the items, set how many labels, then print."], "toProducts": ["প্রোডাক্ট তালিকা", "Product list"], "s1": ["১. আইটেম", "1. Items"], "byStock": ["স্টক অনুযায়ী", "Match stock"], "find": ["প্রোডাক্ট খুঁজুন", "Find a product"], "inStock": ["স্টকে", "In stock"], "noCode": ["যে প্রোডাক্টের বারকোড নেই: ৫টা", "Products without a barcode: 5"], "makeCode": ["বানিয়ে দিন", "Make them"], "madeCode": ["৫টা প্রোডাক্টের বারকোড বানানো হলো। এখন ওদের লেবেলও প্রিন্ট করা যাবে।", "Barcodes made for 5 products. You can print their labels now."], "less": ["কমান", "Less"], "more": ["বাড়ান", "More"], "s2": ["২. লেআউট", "2. Layout"], "size": ["লেবেলের মাপ", "Label size"], "showOn": ["লেবেলে যা থাকবে", "Show on label"], "oShop": ["দোকানের নাম", "Shop name"], "oName": ["প্রোডাক্টের নাম", "Product name"], "oPrice": ["দাম", "Price"], "oMrp": ["এমআরপি", "MRP"], "printer": ["প্রিন্টার", "Printer"], "s3": ["৩. প্রিন্ট", "3. Print"], "mrp": ["এমআরপি", "MRP"], "totalLbl": ["মোট লেবেল", "Total labels"], "pageTitle": ["বারকোড লেবেল", "Barcode labels"]};

class Component extends DCLogic {
  renderVals() {
    var self = this, s = this.state || {};
    var bn = false, i = bn ? 0 : 1;
    var t = {}; Object.keys(T).forEach(function (k) { t[k] = T[k][i]; });
    var L = function (a, b) { return bn ? a : b; };
    var EAN = ['3211', '2221', '2122', '1411', '1132', '1231', '1114', '1312', '1213', '3112'];
    // id, bn, en, ini, swatch, code, stock, sell, mrp, defaultQty, tile
    var IT = [
      ['v1', 'সিলিকন কেস · M নেভি', 'Silicone case · A55 Navy', 'প', '#1e3a6e', '8941230551007', 8, 550, 600, 8],
      ['v2', 'সিলিকন কেস · M কালো', 'Silicone case · A55 Black', 'প', '#111827', '8941230551014', 6, 550, 600, 6],
      ['v3', 'সিলিকন কেস · L নেভি', 'Silicone case · A35 Navy', 'প', '#1e3a6e', '8941230551021', 10, 550, 600, 10],
      ['v4', 'সিলিকন কেস · L কালো', 'Silicone case · A35 Black', 'প', '#111827', '8941230551038', 7, 550, 600, 7],
      ['v5', 'সিলিকন কেস · XL নেভি', 'Silicone case · A15 Navy', 'প', '#1e3a6e', '8941230551045', 4, 550, 600, 4],
      ['v6', 'সিলিকন কেস · XL কালো', 'Silicone case · A15 Black', 'প', '#111827', '8941230551052', 3, 550, 600, 3],
      ['p9', 'স্ক্রিন ক্লিনিং ওয়াইপস', 'Screen cleaning wipes', 'ল', '', '8941100504108', 55, 65, 70, 10],
      ['p4', 'লাইটনিং ক্যাবল ১ মি.', 'Lightning cable 1 m', 'চ', '', '8941100503118', 64, 135, 140, 0],
      ['p8', 'মাইক্রো-USB ক্যাবল ১ মি.', 'Micro-USB cable 1 m', 'ম', '', '8941100503217', 40, 145, 150, 0]
    ];
    var SIZES = {
      s38: { cols: 3, gap: 10, h: 120, pad: 8, rad: 8, g: 3, f1: 10.5, f2: 12.5, barH: 34, f3: 10, f4: 15, mod: 1, sheetBg: '#eef2f6', per: 9 },
      s50: { cols: 2, gap: 12, h: 170, pad: 12, rad: 10, g: 4, f1: 12.5, f2: 15, barH: 52, f3: 12, f4: 19, mod: 2, sheetBg: '#eef2f6', per: 4 },
      a4: { cols: 5, gap: 5, h: 60, pad: 3, rad: 3, g: 1, f1: 7, f2: 8, barH: 14, f3: 7, f4: 8.5, mod: 0.9, sheetBg: '#ffffff', per: 30 }
    };
    var size = s.size || 's38', z = SIZES[size];
    var qtys = s.qtys || {};
    var qOf = function (it) { return qtys[it[0]] == null ? it[9] : qtys[it[0]]; };
    var setQ = function (id, v) { var o = assign({}, qtys); o[id] = Math.max(0, v); self.setState({ qtys: o }); };
    var q = s.q || '';
    var total = IT.reduce(function (n, it) { return n + qOf(it); }, 0);
    var bars = function (code) {
      var out = [], push = function (w, dark) { out.push({ w: +(w * z.mod).toFixed(2), bg: dark ? '#0f172a' : 'transparent' }); };
      push(1, 1); push(1, 0); push(1, 1);
      for (var k = 1; k < 13; k++) {
        var p = EAN[+code[k]];
        if (k === 7) { push(1, 0); push(1, 1); push(1, 0); push(1, 1); push(1, 0); }
        var right = k >= 7;
        for (var m = 0; m < 4; m++) push(+p[m], right ? (m % 2 === 0) : (m % 2 === 1));
      }
      push(1, 1); push(1, 0); push(1, 1);
      return out;
    };
    var fmtCode = function (c) { return dg(c.slice(0, 1) + ' ' + c.slice(1, 7) + ' ' + c.slice(7), bn); };
    var showShop = sw(self, 'oShop', true), showName = sw(self, 'oName', true), showPrice = sw(self, 'oPrice', true), showMrp = sw(self, 'oMrp', false);
    var labels = [];
    IT.forEach(function (it) { var n = qOf(it); if (!n) return; var br = bars(it[5]); for (var k = 0; k < n && labels.length < z.per; k++) labels.push({ name: it[1 + i], bars: br, num: fmtCode(it[5]), price: money(it[7], bn), mrp: money(it[8], bn) }); });
    var printer = s.printer || (size === 'a4' ? 'a4' : 'xp');
    var pages = Math.max(1, Math.ceil(total / 65));
    return {
      t: t,
      fillStock: function () { var picked = IT.filter(function (it) { return qOf(it) > 0; }); var use = picked.length ? picked : IT; var o = assign({}, qtys); use.forEach(function (it) { o[it[0]] = it[6]; }); self.setState({ qtys: o }); toast(self, L('স্টক যতগুলো, লেবেলও ততগুলো বসানো হলো।', 'Label counts now match stock.')); },
      q: q, typeQ: function (e) { self.setState({ q: e.target.value }); },
      codeMissing: !s.made, codeMade: !!s.made,
      makeCodes: function () { self.setState({ made: true }); toast(self, L('৫টা নতুন বারকোড বানানো হলো।', '5 new barcodes created.')); },
      items: IT.filter(function (it) { return !q || (it[1] + ' ' + it[2] + ' ' + it[5]).toLowerCase().indexOf(unbn(q).toLowerCase()) >= 0 || (it[1] + it[2]).indexOf(q) >= 0; }).map(function (it) {
        var n = qOf(it), sel = n > 0;
        return { name: it[1 + i], ini: it[1 + i].slice(0, 1), hasSw: !!it[4], sw: it[4] || 'transparent', code: dg(it[5], bn), stock: dg(it[6], bn),
          qty: dg(n, bn), sel: sel,
          inc: function () { setQ(it[0], n + 1); }, dec: function () { setQ(it[0], n - 1); } };
      }),
      totalTxt: dg(total, bn) + L('টা', ''),
      sizes: seg(self, [['s38', '৩৮×২৫ মিমি', '38×25 mm'], ['s50', '৫০×৩০ মিমি', '50×30 mm'], ['a4', 'A4 শিটে ৬৫টা', 'A4 sheet, 65 up']], size, 'size', i),
      shows: [[showShop, 'oShop'], [showName, 'oName'], [showPrice, 'oPrice'], [showMrp, 'oMrp']].map(function (x) { return { l: t[x[1]], on: x[0].on, toggle: x[0].toggle }; }),
      printer: printer, pickPrinter: function (e) { self.setState({ printer: e.target.value === 'a4' ? 'a4' : 'xp' }); },
      printers: [{ k: 'xp', l: L('Xprinter XP-365B · লেবেল প্রিন্টার', 'Xprinter XP-365B · label printer') }, { k: 'a4', l: L('Canon LBP2900 · সাধারণ A4 প্রিন্টার', 'Canon LBP2900 · regular A4 printer') }],
      z: z, labels: labels,
      showShop: showShop.on, showName: showName.on, showPrice: showPrice.on, showMrp: showMrp.on, showPriceRow: showPrice.on || showMrp.on,
      previewNote: size === 'a4' ? L('প্রথম ৩০টা দেখাচ্ছে · ' + dg(pages, true) + 'টা A4 শিট লাগবে', 'First 30 shown · ' + pages + ' A4 sheet' + (pages > 1 ? 's' : '') + ' needed') : L('প্রথম ' + dg(labels.length, true) + 'টা দেখাচ্ছে · মোট ' + dg(total, true) + 'টা', 'First ' + labels.length + ' shown · ' + total + ' in total'),
      printLbl: L('প্রিন্ট করুন (' + dg(total, true) + 'টা লেবেল)', 'Print (' + total + ' labels)'),
      print: function () { if (!total) { toast(self, L('আগে বাম পাশে লেবেলের সংখ্যা দিন।', 'Set label counts on the left first.')); return; } toast(self, L(dg(total, true) + 'টা লেবেল প্রিন্টারে পাঠানো হলো।', total + ' labels sent to the printer.')); }
    };
  }
}

// ---- styles ----

const CSS = `
.bl-tool{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:var(--space-4);align-items:start}
.bl-col{display:flex;flex-direction:column;gap:var(--space-4);min-width:0}
.bl-body{display:flex;flex-direction:column;gap:var(--space-3)}
.bl-body>.ix-search{flex:none}
.bl-note{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);font-size:var(--text-sm)}
.bl-note>span{flex:1;min-width:0}
.bl-note--warn{background:var(--fill-warning-soft);color:var(--text-heading)}
.bl-note--warn>svg{color:var(--text-warning)}
.bl-note--ok{background:var(--fill-success-soft);color:var(--text-heading)}
.bl-note--ok>svg{color:var(--text-success)}
.bl-items{margin:0;padding:0;list-style:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.bl-item{display:flex;align-items:center;gap:var(--space-3);padding:6px 6px 6px 10px;border-top:1px solid var(--border-subtle)}
.bl-item:first-child{border-top:0}
.bl-item.is-on{background:var(--fill-primary-soft)}
.bl-item .ix-thumb{position:relative;background:var(--surface-subtle);color:var(--text-muted)}
.bl-item.is-on .ix-thumb{background:var(--surface-card);color:var(--primary)}
.bl-swatch{position:absolute;right:-3px;bottom:-3px;width:12px;height:12px;border:2px solid var(--surface-card);border-radius:var(--radius-full)}
.bl-name{display:flex;flex:1;flex-direction:column;min-width:0}
.bl-name>b{overflow:hidden;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.bl-name>span{font-size:var(--text-xs);color:var(--text-muted);font-variant-numeric:tabular-nums}
.bl-step{display:flex;flex:none;align-items:center;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.bl-item.is-on .bl-step{border-color:var(--primary)}
.bl-step>span{min-width:28px;text-align:center;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-muted);font-variant-numeric:tabular-nums}
.bl-item.is-on .bl-step>span{color:var(--primary)}
.bl-total{display:flex;align-items:center;justify-content:space-between;font-size:var(--text-sm);color:var(--text-body)}
.bl-total>b{font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.bl-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.bl-field .gc-label{margin:0}
.bl-shows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2) var(--space-4)}
.bl-show{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);min-height:32px;font-size:var(--text-sm);color:var(--text-heading)}
/* the preview: a sheet of real-size-looking labels (paper stays white in both themes) */
.bl-sheet{height:410px;overflow:hidden;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.bl-label{display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;border:1px solid var(--slate-300);background:#fff;color:var(--slate-900)}
.bl-label__shop{line-height:1.15;font-weight:var(--weight-medium);color:var(--slate-600);white-space:nowrap}
.bl-label__name{max-width:100%;overflow:hidden;line-height:1.2;font-weight:var(--weight-semibold);text-overflow:ellipsis;white-space:nowrap}
.bl-label__code{font-family:var(--font-data);line-height:1.1;letter-spacing:var(--tracking-label)}
.bl-label>*{flex-shrink:0}
.bl-label__price{display:flex;align-items:baseline;line-height:1.1;white-space:nowrap;font-variant-numeric:tabular-nums}
@media (max-width:1023px){.bl-tool{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.bl-shows{grid-template-columns:minmax(0,1fr)}.bl-sheet{height:auto;max-height:420px}}
`;

// ---- markup ----

export default class BarcodeLabelsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const t = v.t || {};
    const z = v.z || {};
    return (
      <div className="dc-screen ds" data-screen="BarcodeLabels">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="stock-labels" />
          <main className="gc-shell__main">
            <__Topbar crumb={"Stocks & inventory"} page="Barcode labels" placeholder="Search products, customers or memo no." />
            <div className="gc-shell__content">
              <div className="ix-page">
                <ShopHeader icon="scan-barcode" title={t.h} about={t.hsub}
                  secondary={[{ label: t.toProducts, href: '/all-products' }]}
                  primary={{ label: v.printLbl, onClick: v.print, icon: 'printer' }} />

                <div className="bl-tool">
                  <div className="bl-col">
                    {/* 1. which items, and how many labels of each */}
                    <section className="ix-card" aria-labelledby="bl-h-items">
                      <div className="ix-card__head">
                        <h2 id="bl-h-items">{t.s1}</h2>
                        <button type="button" className="ix-btn ix-btn--sm" onClick={v.fillStock}><__Icon name="layers" width="16" height="16" aria-hidden="true" />{t.byStock}</button>
                      </div>
                      <div className="ix-card__body bl-body">
                        <label className="ix-search">
                          <__Icon name="search" width="16" height="16" aria-hidden="true" />
                          <input value={v.q} onInput={v.typeQ} onChange={v.typeQ} placeholder={t.find} aria-label={t.find} />
                        </label>
                        {v.codeMissing ? (
                          <div className="bl-note bl-note--warn">
                            <__Icon name="triangle-alert" width="16" height="16" aria-hidden="true" />
                            <span>{t.noCode}</span>
                            <button type="button" className="ix-btn ix-btn--sm" onClick={v.makeCodes}><__Icon name="scan-barcode" width="16" height="16" aria-hidden="true" />{t.makeCode}</button>
                          </div>
                        ) : null}
                        {v.codeMade ? (
                          <div className="bl-note bl-note--ok" role="status">
                            <__Icon name="circle-check" width="16" height="16" aria-hidden="true" />
                            <span>{t.madeCode}</span>
                          </div>
                        ) : null}
                        <ul className="bl-items">
                          {__list(v.items).map((it, i) => (
                            <li key={i} className={'bl-item' + (it.sel ? ' is-on' : '')}>
                              <span className="ix-thumb" aria-hidden="true">{it.ini}{it.hasSw ? <span className="bl-swatch" style={{ background: it.sw }} /> : null}</span>
                              <span className="bl-name"><b>{it.name}</b><span><span style={{ fontFamily: "var(--font-data)" }}>{it.code}</span> · {t.inStock} {it.stock}</span></span>
                              <span className="bl-step">
                                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" onClick={it.dec} aria-label={`${t.less ?? ""} ${it.name ?? ""}`}><__Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
                                <span>{it.qty}</span>
                                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" onClick={it.inc} aria-label={`${t.more ?? ""} ${it.name ?? ""}`}><__Icon name="plus" width="16" height="16" aria-hidden="true" /></button>
                              </span>
                            </li>
                          ))}
                        </ul>
                        <div className="bl-total"><span>{t.totalLbl}</span><b>{v.totalTxt}</b></div>
                      </div>
                    </section>

                    {/* 2. label size, what shows on it, the printer */}
                    <section className="ix-card" aria-labelledby="bl-h-layout">
                      <div className="ix-card__head"><h2 id="bl-h-layout">{t.s2}</h2></div>
                      <div className="ix-card__body bl-body">
                        <div className="bl-field">
                          <span className="gc-label" id="bl-size">{t.size}</span>
                          <div className="gc-seg" role="group" aria-labelledby="bl-size">
                            {__list(v.sizes).map((o) => <button key={o.k} type="button" className={'gc-seg__btn' + (o.on ? ' gc-seg__btn--active' : '')} aria-pressed={!!o.on} onClick={o.pick}>{o.l}</button>)}
                          </div>
                        </div>
                        <div className="bl-field">
                          <span className="gc-label">{t.showOn}</span>
                          <div className="bl-shows">
                            {__list(v.shows).map((o) => (
                              <div key={o.l} className="bl-show">
                                <span>{o.l}</span>
                                <button type="button" role="switch" aria-checked={!!o.on} aria-label={o.l} className="gc-switch" onClick={o.toggle}><span className="gc-switch__knob" /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <label className="bl-field">
                          <span className="gc-label">{t.printer}</span>
                          <select className="gc-input gc-select" value={v.printer} onInput={v.pickPrinter} onChange={v.pickPrinter} aria-label={t.printer}>
                            {__list(v.printers).map((o) => <option key={o.k} value={o.k}>{o.l}</option>)}
                          </select>
                        </label>
                      </div>
                    </section>
                  </div>

                  {/* 3. the live preview */}
                  <section className="ix-card" aria-labelledby="bl-h-preview">
                    <div className="ix-card__head">
                      <h2 id="bl-h-preview">{t.s3}</h2>
                      <span className="ix-muted" style={{ fontSize: "var(--text-xs)" }}>{v.previewNote}</span>
                    </div>
                    <div className="ix-card__body">
                      <div className="bl-sheet" style={{ background: z.sheetBg === '#ffffff' ? 'var(--surface-card)' : 'var(--surface-subtle)' }}>
                        <div style={{ display: "grid", gridTemplateColumns: `repeat(${z.cols}, minmax(0, 1fr))`, gap: z.gap }}>
                          {__list(v.labels).map((lb, i) => (
                            <div key={i} className="bl-label" style={{ height: z.h, padding: z.pad, gap: z.g, borderRadius: z.rad }}>
                              {v.showShop ? <span className="bl-label__shop" style={{ fontSize: z.f1 }}>{t.shop}</span> : null}
                              {v.showName ? <span className="bl-label__name" style={{ fontSize: z.f2 }}>{lb.name}</span> : null}
                              <span aria-hidden="true" style={{ display: "flex", flexShrink: 0, height: z.barH }}>
                                {__list(lb.bars).map((b, j) => <span key={j} style={{ width: b.w, background: b.bg }} />)}
                              </span>
                              <span className="bl-label__code" style={{ fontSize: z.f3 }}>{lb.num}</span>
                              {v.showPriceRow ? (
                                <span className="bl-label__price" style={{ gap: z.g }}>
                                  {v.showPrice ? <span style={{ fontSize: z.f4, fontWeight: "var(--weight-semibold)" }}>{lb.price}</span> : null}
                                  {v.showMrp ? <span style={{ fontSize: z.f3, color: "var(--slate-600)" }}>{t.mrp} {lb.mrp}</span> : null}
                                </span>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
