'use client';
// Generated from design/templates/products/CustomerCatalogue.dc.html by scripts/convert-design.mjs.
// Customer catalogue — Products — Customer catalogue, a Shopify-style tool page (docs/shopify-style.md): the
// catalogue's settings on the left; sharing and the live phone preview on the right; Save in the header.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import { DCLogic, Icon as __Icon, list as __list } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { StatusBadge as __StatusBadge, InfoTip as __InfoTip } from '@/components/ui';
import { ShopHeader, MetricStrip } from '@/components/ui/IndexKit';
import { QrCode } from '@/components/QrCode';
import { toast as __toast } from '@/runtime/ui';

// ---- logic (from the design's <script type="text/x-dc">) ----

var BND = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
function dg(s, bn) { s = String(s); return bn ? s.replace(/[0-9]/g, function (d) { return BND[+d]; }) : s; }
function money(n, bn) { var s = String(Math.round(Math.abs(n))); var last = s.slice(-3), rest = s.slice(0, -3); if (rest) s = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last; else s = last; return dg((n < 0 ? '−' : '') + '৳' + s, bn); }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m) { __toast(m); }
function sw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
var T = {"shop": ["রহমান স্টোর", "GridShop"], "shopInitial": ["র", "R"], "h": ["কাস্টমার ক্যাটালগ", "Customer catalogue"], "hsub": ["মালের তালিকা WhatsApp বা Facebook-এ পাঠান — কাস্টমার ফোনে দেখে অর্ডার দেবে।", "Send your item list on WhatsApp or Facebook — customers browse on their phone and order."], "onPhone": ["ফোনে কেমন দেখায়", "See it on a phone"], "save": ["সেভ করুন", "Save"], "setTitle": ["ক্যাটালগ সাজান", "Set up the catalogue"], "cName": ["ক্যাটালগের নাম", "Catalogue name"], "whichCats": ["কোন কোন ক্যাটাগরি দেখাবে", "Which categories to show"], "priceQ": ["দাম দেখাবে?", "Show prices?"], "stockSw": ["স্টক আছে কিনা দেখাবে", "Show whether in stock"], "stockHint": ["“স্টকে আছে / অল্প আছে / শেষ” লেখা থাকবে", "Shows “In stock / Few left / Out”"], "wa": ["অর্ডারের WhatsApp নম্বর", "WhatsApp number for orders"], "waHint": ["প্রতিটা মালের নিচে “WhatsApp-এ অর্ডার” বাটন থাকবে", "Every item gets a “Order on WhatsApp” button"], "shareTitle": ["শেয়ার করুন", "Share"], "copy": ["লিংক কপি", "Copy link"], "sendWa": ["WhatsApp-এ পাঠান", "Send on WhatsApp"], "pdf": ["PDF নামান", "Download PDF"], "qrHint": ["দোকানে QR প্রিন্ট করে লাগিয়ে রাখুন", "Print the QR and put it up in the shop"], "views": ["এই মাসে দেখেছে", "Views this month"], "orders": ["WhatsApp-এ অর্ডার", "WhatsApp orders"], "prevTitle": ["কাস্টমার যা দেখবে", "What customers will see"], "prevHint": ["আপনি যা বদলান, এখানে সাথে সাথে দেখাবে", "Your changes show here right away"], "openNow": ["খোলা আছে", "Open now"], "addr": ["মিরপুর ১০, ঢাকা", "Mirpur 10, Dhaka"], "order": ["অর্ডার", "Order"], "all": ["সব", "All"], "noCats": ["অন্তত একটা ক্যাটাগরি বাছুন", "Pick at least one category"], "waBtn": ["WhatsApp", "WhatsApp"]};
var CATS = [['rice', 'চাল-ডাল-চিনি', 'Cables & chargers', 42], ['oil', 'তেল-মসলা', 'Cases & covers', 36], ['soap', 'সাবান-শ্যাম্পু', 'Screen care', 48], ['snack', 'বিস্কুট-পানীয়', 'Audio', 54], ['cloth', 'জামাকাপড়', 'Clothing', 22], ['elec', 'ইলেকট্রনিক্স', 'Electronics', 18], ['home', 'ঘরের জিনিস', 'Household', 22]];
// cat, bn, en, price, stock state (ok/low/out)
var PR = [
  ['rice', 'মিনিকেট চাল ২৫ কেজি', 'Power bank 20,000 mAh', 1950, 'ok'], ['rice', 'চিনি ১ কেজি', 'Lightning cable 1 m', 135, 'ok'], ['rice', 'মসুর ডাল ১ কেজি', 'Micro-USB cable 1 m', 145, 'ok'],
  ['oil', 'সয়াবিন তেল ৫ লি.', '20W USB-C fast charger', 890, 'low'], ['oil', 'হলুদ গুঁড়া ২০০ গ্রাম', 'Pop-up phone grip', 95, 'ok'],
  ['soap', 'লাক্স সাবান ১০০ গ্রাম', 'Screen cleaning wipes', 65, 'ok'], ['soap', 'শ্যাম্পু ১৮০ মি.লি.', 'Cleaning spray 100 ml', 240, 'low'], ['soap', 'ডিটারজেন্ট ১ কেজি', 'Shockproof case A15', 180, 'ok'],
  ['snack', 'বিস্কুট (ফ্যামিলি)', 'Tempered glass 2-pack', 60, 'ok'], ['snack', 'গুঁড়া দুধ ৫০০ গ্রাম', 'AA battery 4-pack', 420, 'out'], ['snack', 'পানি ২ লি.', 'Cable protector pack', 35, 'ok'],
  ['cloth', 'পোলো টি-শার্ট', 'Polo T-shirt', 550, 'ok'], ['cloth', 'পাঞ্জাবি (সুতি)', 'Panjabi (cotton)', 1250, 'ok'],
  ['elec', 'রাইস কুকার ১.৮ লি.', 'Bluetooth speaker Mini', 3200, 'ok'], ['elec', 'ব্লেন্ডার', 'Blender', 2850, 'low'],
  ['home', 'প্লাস্টিক বালতি ২০ লি.', 'Wireless charging pad', 180, 'ok']
];
// stock words on the preview cards, with one badge tone each
var ST = { ok: ['success', 'স্টকে আছে', 'In stock'], low: ['warning', 'অল্প আছে', 'Few left'], out: ['neutral', 'শেষ', 'Out'] };

class Component extends DCLogic {
  renderVals() {
    var self = this, s = this.state || {};
    var bn = false, i = bn ? 0 : 1;
    var t = {}; Object.keys(T).forEach(function (k) { t[k] = T[k][i]; });
    var L = function (a, b) { return bn ? a : b; };
    var on = s.on || { rice: 1, oil: 1, soap: 1, snack: 1, elec: 1 };
    var pm = s.pm || 'show';
    var cName = s.cName == null ? L('মাসিক বাজার', 'New arrivals') : s.cName;
    var waNum = s.waNum == null ? dg('01819-456789', bn) : s.waNum;
    var stockSw = sw(self, 'stockSw', true);
    var pcat = s.pcat || 'all';
    if (pcat !== 'all' && !on[pcat]) pcat = 'all';
    var chosen = CATS.filter(function (c2) { return on[c2[0]]; });
    // round-robin across chosen categories
    var pools = chosen.filter(function (c2) { return pcat === 'all' || c2[0] === pcat; }).map(function (c2) { return PR.filter(function (p) { return p[0] === c2[0]; }); });
    var picked = [];
    for (var r = 0; r < 4 && picked.length < 8; r++) pools.forEach(function (pl) { if (pl[r] && picked.length < 8) picked.push(pl[r]); });
    return {
      t: t,
      saveAll: function () { toast(self, L('ক্যাটালগ সেভ হলো। লিংক একই থাকবে, কাস্টমার নতুনটা দেখবে।', 'Catalogue saved. Same link — customers see the new version.')); },
      cName: cName, typeName: function (e) { self.setState({ cName: e.target.value }); },
      catChecks: CATS.map(function (c2) { var o = !!on[c2[0]]; return { k: c2[0], l: c2[1 + i], n: dg(c2[3], bn), on: o, toggle: function () { var n2 = assign({}, on); if (o) delete n2[c2[0]]; else n2[c2[0]] = 1; self.setState({ on: n2 }); } }; }),
      priceModes: [['show', 'দাম দেখাও', 'Show prices', 'সবাই দাম দেখবে', 'Everyone sees prices'], ['hide', 'দাম লুকাও', 'Hide prices', '“দাম জানতে কল করুন” লেখা থাকবে', 'Shows “Call for price”'], ['whole', 'শুধু পাইকারি কাস্টমারকে দেখাও', 'Only wholesale customers', 'পাইকারি কাস্টমার নম্বর দিয়ে ঢুকলে দাম দেখবে', 'Wholesale customers see prices after entering their number']].map(function (o) { return { k: o[0], l: o[1 + i], h: o[3 + i], on: o[0] === pm, pick: function () { self.setState({ pm: o[0] }); } }; }),
      stockSw: stockSw, showStock: stockSw.on,
      waNum: waNum, typeWa: function (e) { self.setState({ waNum: e.target.value }); },
      link: 'gridshop.com.bd/catalog',
      copyLink: function () { toast(self, L('লিংক কপি হলো — WhatsApp বা Facebook-এ পেস্ট করুন।', 'Link copied — paste it on WhatsApp or Facebook.')); },
      sendWa: function () { toast(self, L('WhatsApp খুলছে — কাকে পাঠাবেন বাছুন।', 'Opening WhatsApp — choose who to send it to.')); },
      getPdf: function () { toast(self, L('PDF বানানো হচ্ছে — ' + dg(chosen.reduce(function (n, c2) { return n + c2[3]; }, 0), true) + 'টা প্রোডাক্ট।', 'Making the PDF — ' + chosen.reduce(function (n, c2) { return n + c2[3]; }, 0) + ' products.')); },
      views: dg('1,240', bn), orders: dg('86', bn) + L('টা', ''),
      pChips: [['all', t.all]].concat(chosen.map(function (c2) { return [c2[0], c2[1 + i]]; })).map(function (o) { return { k: o[0], l: o[1], on: o[0] === pcat, pick: function () { self.setState({ pcat: o[0] }); } }; }),
      noCats: chosen.length === 0,
      priceShow: pm === 'show', priceHide: pm === 'hide', priceWhole: pm === 'whole',
      callTxt: L('দাম জানতে কল করুন', 'Call for price'), wholeTxt: L('পাইকারি দাম — নম্বর দিন', 'Wholesale price — enter no.'),
      cards: picked.map(function (p, j) { var st = ST[p[4]]; return { name: p[1 + i], ini: p[1 + i].slice(0, 1), tint: j % 4, price: money(p[3], bn), tone: st[0], sTxt: st[1 + i] }; })
    };
  }
}

// ---- styles ----

const CSS = `
.cc-body{display:flex;flex-direction:column;gap:var(--space-4)}
.cc-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.cc-field .gc-label{margin:0}
.cc-lbl{display:flex;align-items:center;gap:6px}
.cc-cats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px var(--space-4)}
.cc-cat{display:flex;align-items:center;gap:var(--space-2);min-height:32px;font-size:var(--text-sm);color:var(--text-heading);cursor:pointer}
.cc-cat>span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cc-cat>small{font-size:var(--text-xs);color:var(--text-muted);font-variant-numeric:tabular-nums}
.cc-radios{display:flex;flex-direction:column;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.cc-radio{display:flex;align-items:flex-start;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-top:1px solid var(--border-subtle);cursor:pointer}
.cc-radio:first-child{border-top:0}
.cc-radio>input{margin-top:2px}
.cc-radio>span{display:flex;flex-direction:column}
.cc-radio b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cc-radio small{font-size:var(--text-xs);color:var(--text-muted)}
.cc-switch{display:flex;align-items:center;gap:var(--space-3);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cc-switch>span{display:flex;flex:1;align-items:center;gap:6px;min-width:0}
.cc-tool{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--space-4);align-items:start}
.cc-col{display:flex;flex-direction:column;gap:var(--space-4);min-width:0}
.cc-share{display:flex;gap:var(--space-4);align-items:flex-start}
.cc-share>div:first-child{display:flex;flex:1;flex-direction:column;gap:var(--space-2);min-width:0}
.cc-qr{display:flex;flex:none;flex-direction:column;align-items:center;gap:6px;max-width:120px;text-align:center;font-size:var(--text-xs);color:var(--text-muted)}
.cc-qr>svg{border:1px solid var(--border-subtle);border-radius:var(--radius-md)}
.cc-link{display:flex;align-items:center;height:var(--control-height);min-width:0;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle);font-family:var(--font-data);font-size:var(--text-sm);color:var(--text-body);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cc-row{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.cc-row>.ix-btn{flex:1 1 auto}
.cc-copy{flex-wrap:nowrap}
.cc-copy>.ix-btn{flex:none}
/* the phone preview */
.cc-phone{max-width:360px;margin:0 auto;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-subtle);overflow:hidden}
.cc-bar{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-3);background:var(--brand-navy-deep);color:#fff}
.cc-bar>i{display:grid;flex:none;place-items:center;width:32px;height:32px;border-radius:var(--radius-lg);background:#fff;color:var(--primary);font-size:var(--text-sm);font-style:normal;font-weight:var(--weight-semibold)}
.cc-bar>div{display:flex;flex:1;flex-direction:column;min-width:0}
.cc-bar b{overflow:hidden;font-size:var(--text-sm);font-weight:var(--weight-semibold);text-overflow:ellipsis;white-space:nowrap}
.cc-bar small{display:flex;align-items:center;gap:4px;font-size:var(--text-xs);opacity:.85}
.cc-bar small>em{width:6px;height:6px;border-radius:var(--radius-full);background:var(--success)}
.cc-bar>span{display:inline-flex;flex:none;align-items:center;gap:4px;height:24px;padding:0 8px;border-radius:var(--radius-full);background:var(--success);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.cc-shop{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3)}
.cc-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.cc-card{display:flex;flex-direction:column;gap:4px;padding:6px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.cc-card>i{display:grid;height:44px;place-items:center;border-radius:var(--radius-md);font-size:var(--text-lg);font-style:normal;font-weight:var(--weight-semibold)}
.cc-t0{background:var(--fill-primary-soft);color:var(--primary)}.cc-t1{background:var(--fill-success-soft);color:var(--text-success)}.cc-t2{background:var(--fill-warning-soft);color:var(--text-warning)}.cc-t3{background:var(--fill-secondary-soft);color:var(--secondary)}
.cc-card>b{display:-webkit-box;overflow:hidden;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);line-height:16px;color:var(--text-heading);-webkit-line-clamp:2;-webkit-box-orient:vertical}
.cc-price{font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--primary)}
.cc-ask{display:flex;align-items:center;gap:4px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.cc-order{display:flex;align-items:center;justify-content:center;gap:4px;height:24px;border-radius:var(--radius-md);background:var(--fill-success-soft);color:var(--text-success);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.cc-warn{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-warning-soft);font-size:var(--text-sm);color:var(--text-heading)}
.cc-warn>svg{color:var(--text-warning)}
@media (max-width:1023px){.cc-tool{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.cc-cats{grid-template-columns:minmax(0,1fr)}.cc-share{flex-direction:column-reverse;align-items:stretch}.cc-qr{flex-direction:row;max-width:none;text-align:left}}
`;

// ---- markup ----

export default class CustomerCatalogueScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const t = v.t || {};
    return (
      <div className="dc-screen ds" data-screen="CustomerCatalogue">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="products-catalogue" />
          <main className="gc-shell__main">
            <__Topbar crumb="Products" page="Customer catalogue" placeholder="Search products, customers or memo no." />
            <div className="gc-shell__content">
              <div className="ix-page">
                <ShopHeader icon="book-open" title={t.h} about={t.hsub}
                  secondary={[{ label: t.onPhone, href: '/customer-catalogue' }]}
                  primary={{ label: t.save, onClick: v.saveAll }} />

                <MetricStrip label={t.h} items={[
                  { label: t.views, value: v.views },
                  { label: t.orders, value: v.orders },
                ]} />

                <div className="cc-tool">
                  {/* the catalogue: name, categories, prices, stock, the WhatsApp number for orders */}
                  <section className="ix-card" aria-labelledby="cc-h-set">
                    <div className="ix-card__head"><h2 id="cc-h-set">{t.setTitle}</h2></div>
                    <div className="ix-card__body cc-body">
                      <label className="cc-field">
                        <span className="gc-label">{t.cName}</span>
                        <input className="gc-input" value={v.cName} onInput={v.typeName} onChange={v.typeName} aria-label={t.cName} />
                      </label>
                      <fieldset className="cc-field" style={{ margin: 0, padding: 0, border: 0 }}>
                        <legend className="gc-label" style={{ marginBottom: "6px" }}>{t.whichCats}</legend>
                        <div className="cc-cats">
                          {__list(v.catChecks).map((o) => (
                            <label key={o.k} className="cc-cat"><input type="checkbox" className="gc-check" checked={!!o.on} onChange={o.toggle} /><span>{o.l}</span><small>{o.n}</small></label>
                          ))}
                        </div>
                      </fieldset>
                      <fieldset className="cc-field" style={{ margin: 0, padding: 0, border: 0 }}>
                        <legend className="gc-label" style={{ marginBottom: "6px" }}>{t.priceQ}</legend>
                        <div className="cc-radios">
                          {__list(v.priceModes).map((o) => (
                            <label key={o.k} className="cc-radio"><input type="radio" name="cc-price" className="gc-check gc-check--radio" checked={!!o.on} onChange={o.pick} /><span><b>{o.l}</b><small>{o.h}</small></span></label>
                          ))}
                        </div>
                      </fieldset>
                      <div className="cc-switch">
                        <span>{t.stockSw}<__InfoTip text={t.stockHint} /></span>
                        <button type="button" role="switch" aria-checked={!!v.stockSw?.on} aria-label={t.stockSw} className="gc-switch" onClick={v.stockSw?.toggle}><span className="gc-switch__knob" /></button>
                      </div>
                      <div className="cc-field">
                        <div className="cc-lbl"><label className="gc-label" htmlFor="cc-wa">{t.wa}</label><__InfoTip text={t.waHint} /></div>
                        <input id="cc-wa" className="gc-input" value={v.waNum} onInput={v.typeWa} onChange={v.typeWa} inputMode="tel" aria-label={t.wa} style={{ fontVariantNumeric: "tabular-nums" }} />
                      </div>
                    </div>
                  </section>

                  <div className="cc-col">
                    {/* sharing: the link, WhatsApp, a PDF and the QR for the shop */}
                    <section className="ix-card" aria-labelledby="cc-h-share">
                      <div className="ix-card__head"><h2 id="cc-h-share">{t.shareTitle}</h2></div>
                      <div className="ix-card__body cc-share">
                        <div>
                          <div className="cc-row cc-copy">
                            <span className="cc-link" style={{ flex: 1 }}>{v.link}</span>
                            <button type="button" className="ix-btn" onClick={v.copyLink}><__Icon name="copy" width="16" height="16" aria-hidden="true" />{t.copy}</button>
                          </div>
                          <div className="cc-row">
                            <button type="button" className="ix-btn" onClick={v.sendWa}><__Icon name="send" width="16" height="16" aria-hidden="true" />{t.sendWa}</button>
                            <button type="button" className="ix-btn" onClick={v.getPdf}><__Icon name="download" width="16" height="16" aria-hidden="true" />{t.pdf}</button>
                          </div>
                        </div>
                        <div className="cc-qr">
                          <QrCode text={'https://' + v.link} size={88} label="QR" />
                          <span>{t.qrHint}</span>
                        </div>
                      </div>
                    </section>

                    {/* what customers see on their phone, live */}
                    <section className="ix-card" aria-labelledby="cc-h-prev">
                      <div className="ix-card__head"><h2 id="cc-h-prev">{t.prevTitle} <__InfoTip text={t.prevHint} /></h2></div>
                      <div className="ix-card__body">
                        <div className="cc-phone">
                          <div className="cc-bar gc-on-dark">
                            <i>{t.shopInitial}</i>
                            <div>
                              <b>{t.shop} · {v.cName}</b>
                              <small>{t.addr} · <em />{t.openNow}</small>
                            </div>
                            <span><__Icon name="phone" width="12" height="12" aria-hidden="true" />{t.waBtn}</span>
                          </div>
                          <div className="cc-shop">
                            <div className="ix-chips" style={{ gap: "6px" }}>
                              {__list(v.pChips).map((o) => <button key={o.k} type="button" className="ix-chip" aria-pressed={!!o.on} onClick={o.pick}>{o.l}</button>)}
                            </div>
                            {v.noCats ? <div className="cc-warn"><__Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>{t.noCats}</span></div> : null}
                            <div className="cc-cards">
                              {__list(v.cards).map((pc, i) => (
                                <div key={i} className="cc-card">
                                  <i className={'cc-t' + pc.tint} aria-hidden="true">{pc.ini}</i>
                                  <b>{pc.name}</b>
                                  {v.priceShow ? <span className="cc-price">{pc.price}</span> : null}
                                  {v.priceHide ? <span className="cc-ask"><__Icon name="phone" width="12" height="12" aria-hidden="true" />{v.callTxt}</span> : null}
                                  {v.priceWhole ? <span className="cc-ask"><__Icon name="lock" width="12" height="12" aria-hidden="true" />{v.wholeTxt}</span> : null}
                                  {v.showStock ? <span><__StatusBadge tone={pc.tone}>{pc.sTxt}</__StatusBadge></span> : null}
                                  <span className="cc-order"><__Icon name="send" width="12" height="12" aria-hidden="true" />{t.order}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
