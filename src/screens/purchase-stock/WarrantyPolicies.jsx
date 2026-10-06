'use client';
// Generated from design/templates/purchase-stock/WarrantyPolicies.dc.html by scripts/convert-design.mjs.
// Warranty policies — Stock — Warranty policies, laid out like Shopify (docs/shopify-style.md): the list of policies
// first; a policy opens as a record on this page (basics, coverage, claim process and terms on the left; what it
// applies to, the customer's view and the versions on the right), with Publish in its header.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import { DCLogic, Icon as __Icon, list as __list } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { StatusBadge as __StatusBadge, InfoTip as __InfoTip } from '@/components/ui';
import { ShopHeader, RecordHeader, LearnMore } from '@/components/ui/IndexKit';
import { QrCode } from '@/components/QrCode';
import { toast as __toast } from '@/runtime/ui';

// ---- logic (from the design's <script type="text/x-dc">) ----

function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m) { __toast(m); }
var POLS = {
  phone: { n: 'Smartphone brand warranty', type: 'brand', per: ['12', 'months'], cnt: '46 products', st: 'Published', ver: 'v3 · published 2 Sep 2026', tint: '#e0f3fb', ink: '#003087', def: false,
    cov: ['Manufacturing defects', 'Battery below 80% health', 'Motherboard and display faults'], not: ['Physical or liquid damage', 'Opened by third party', 'Software issues after rooting'],
    apply: [['Category', 'Smartphones'], ['Brands', 'Samsung, Xiaomi'], ['Products', '46 products'], ['Variants', 'All variants'], ['Excluded', 'Refurbished, open-box']] },
  shop: { n: 'Shop service warranty', type: 'seller', per: ['6', 'months'], cnt: '38 products', st: 'Published', ver: 'v2 · published 14 Jul 2026', tint: '#e7f8f1', ink: '#047857', def: true,
    cov: ['Parts and labour at our shop', 'Charging and power faults'], not: ['Physical damage', 'Accessories and cables'],
    apply: [['Category', 'Accessories, Audio'], ['Brands', 'All brands'], ['Products', '38 products'], ['Variants', 'All variants'], ['Excluded', 'Clearance stock']] },
  rep: { n: '7-day replacement guarantee', type: 'replace', per: ['7', 'days'], cnt: '112 products', st: 'Published', ver: 'v1 · published 3 May 2026', tint: '#fff4e0', ink: '#a14f06', def: false,
    cov: ['Faulty on arrival', 'Wrong item sent'], not: ['Change of mind', 'Used or unsealed items'],
    apply: [['Category', 'Accessories, Audio'], ['Brands', 'All brands'], ['Products', '112 products'], ['Variants', 'All variants'], ['Excluded', 'Sale items']] },
  tv: { n: '2 years parts, 1 year service', type: 'service', per: ['2', 'years'], cnt: '14 products', st: 'Draft', ver: 'v1 · draft, not published', tint: '#f3e8ff', ink: '#6d28d9', def: false,
    cov: ['Panel and board parts', 'Power supply'], not: ['Burn-in from static images', 'Wall mount damage'],
    apply: [['Category', 'Wearables, Power banks'], ['Brands', 'Xiaomi, Anker'], ['Products', '14 products'], ['Variants', 'All variants'], ['Excluded', 'Display units']] },
  money: { n: '15-day money-back', type: 'money', per: ['15', 'days'], cnt: '9 products', st: 'Published', ver: 'v1 · published 20 Aug 2026', tint: '#ffece6', ink: '#b83210', def: false,
    cov: ['Any reason, unused, in the box'], not: ['Opened software or gift cards'],
    apply: [['Category', 'Smart home'], ['Brands', 'Dazzle Shop'], ['Products', '9 products'], ['Variants', 'All variants'], ['Excluded', '—']] }
};
var ORDER = ['phone', 'shop', 'rep', 'tv', 'money'];
var TYPEL = { brand: 'Brand warranty', seller: 'Seller warranty', service: 'Service warranty', replace: 'Replacement guarantee', money: 'Money-back guarantee' };
var REM = [['repair', 'Repair'], ['replace', 'Replacement'], ['refund', 'Refund'], ['credit', 'Store credit']];
var PROOF = [['inv', 'Invoice'], ['imei', 'Serial or IMEI number'], ['card', 'Warranty card'], ['box', 'Original box']];
var TERMS = {
  en: '1. This warranty covers manufacturing defects for 12 months from the delivery date.\n2. Bring the phone with the invoice and IMEI to our service centre in Mirpur 10, or book a courier pickup.\n3. We repair first. If it cannot be repaired within 15 days, we replace it.\n4. Physical or liquid damage, repair by others and rooting void this warranty.',
  bn: '১. ডেলিভারির তারিখ থেকে ১২ মাস পর্যন্ত উৎপাদনজনিত ত্রুটি এই ওয়ারেন্টির আওতায়।\n২. ইনভয়েস ও IMEI সহ ফোনটি মিরপুর ১০-এর সার্ভিস সেন্টারে আনুন, অথবা কুরিয়ার পিকআপ বুক করুন।\n৩. আগে মেরামত করা হবে। ১৫ দিনে মেরামত না হলে বদলে দেওয়া হবে।\n৪. ভাঙা বা পানিতে নষ্ট হওয়া, অন্য কোথাও খোলা বা রুট করা হলে ওয়ারেন্টি থাকবে না।'
};
var MONTHS3 = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
class Component extends DCLogic {
  renderVals() {
    var self = this, s = this.state || {};
    var pk = s.pk || 'phone', P = POLS[pk];
    var ov = (s.ov || {})[pk] || {};
    var g = function (k, d) { return ov[k] != null ? ov[k] : d; };
    var set = function (patch) { var all = assign({}, s.ov || {}); all[pk] = assign(assign({}, ov), patch); self.setState({ ov: all }); };
    var name = g('n', P.n), type = g('type', P.type), perN = g('perN', P.per[0]), perU = g('perU', P.per[1]);
    var cov = g('cov', P.cov), not = g('not', P.not);
    var rem = g('rem', ['repair', 'replace', 'refund', 'credit']), remOff = g('remOff', ['refund', 'credit']);
    var pr = g('proof', ['inv', 'imei']);
    var lang = s.lang || 'en';
    var end = (function () { var d = new Date(Date.UTC(2026, 8, 19)); var n = +perN || 0; if (perU === 'days') d.setUTCDate(d.getUTCDate() + n); else if (perU === 'months') d.setUTCMonth(d.getUTCMonth() + n); else d.setUTCFullYear(d.getUTCFullYear() + n); return d.getUTCDate() + ' ' + MONTHS3[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); })();
    var v = {
      // the list; a policy opens as its own record on this page
      editing: !!s.edit, back: function () { self.setState({ edit: false }); },
      pols: ORDER.map(function (k) { var p = POLS[k], on = k === pk; return { k: k, n: k === pk ? name : p.n, t: TYPEL[p.type], cnt: p.cnt, per: p.per[0] + ' ' + p.per[1], st: p.st, def: p.def, on: on, pick: function () { self.setState({ pk: k, edit: true }); } }; }),
      newPolicy: function () { toast(self, 'A blank policy is ready — give it a name and a period.'); },
      pName: name, pVer: P.ver, pSt: P.st, typeName: function (e) { set({ n: e.target.value }); },
      pType: type, setType: function (e) { set({ type: e.target.value }); },
      perN: perN, typePer: function (e) { set({ perN: e.target.value }); }, perU: perU, setPerU: function (e) { set({ perU: e.target.value }); },
      proofTxt: PROOF.filter(function (x) { return pr.indexOf(x[0]) >= 0; }).map(function (x) { return x[1].replace('Serial or IMEI number', 'IMEI'); }).join(' + ') || 'Nothing',
      split: mkSw(this, 'split', true),
      parts: [['Motherboard', '12 months'], ['Display', '12 months'], ['Battery', '6 months']].map(function (x) { return { k: x[0], v: x[1] }; }),
      covd: cov.map(function (t, i) { return { t: t, del: function () { set({ cov: cov.filter(function (_, j) { return j !== i; }) }); } }; }),
      notc: not.map(function (t, i) { return { t: t, del: function () { set({ not: not.filter(function (_, j) { return j !== i; }) }); } }; }),
      covIn: s.covIn || '', covInType: function (e) { self.setState({ covIn: e.target.value }); }, addCov: function () { if (!s.covIn) return; set({ cov: cov.concat([s.covIn]) }); self.setState({ covIn: '' }); },
      notIn: s.notIn || '', notInType: function (e) { self.setState({ notIn: e.target.value }); }, addNot: function () { if (!s.notIn) return; set({ not: not.concat([s.notIn]) }); self.setState({ notIn: '' }); },
      remedy: rem.map(function (k, i) { var off = remOff.indexOf(k) >= 0; var l = REM.filter(function (x) { return x[0] === k; })[0][1]; return { l: l, n: off ? '–' : i + 1, off: off, sym: off ? 'plus' : 'x', togL: (off ? 'Turn on ' : 'Turn off ') + l, upL: 'Move ' + l + ' earlier',
        up: function () { if (!i) return; var r = rem.slice(); r[i] = r[i - 1]; r[i - 1] = k; set({ rem: r }); },
        tog: function () { set({ remOff: off ? remOff.filter(function (x) { return x !== k; }) : remOff.concat([k]) }); } }; }),
      voids: ['Physical or liquid damage', 'Opened or repaired by others', 'Rooted or modified software', 'Warranty sticker removed'].map(function (t) { return { t: t }; }),
      proofs: PROOF.map(function (x) { var on = pr.indexOf(x[0]) >= 0; return { l: x[1], on: on, tog: function () { set({ proof: on ? pr.filter(function (y) { return y !== x[0]; }) : pr.concat([x[0]]) }); } }; }),
      langs: [['en', 'English'], ['bn', 'বাংলা']].map(function (x) { var on = x[0] === lang; return { l: x[1], on: on, pick: function () { self.setState({ lang: x[0] }); } }; }),
      termsTxt: TERMS[lang], termsBn: lang === 'bn', aiTerms: function () { toast(self, 'Full terms rewritten in English and Bangla from the fields above.'); },
      apply: P.apply.map(function (x) { return { k: x[0], v: x[1] }; }),
      isDef: mkSw(this, 'def_' + pk, P.def),
      bulk: function () { toast(self, 'Pick products on the next screen — the policy is attached to all of them at once.'); },
      custTitle: perN + ' ' + perU + ' ' + TYPEL[type].toLowerCase(), custSub: cov.length ? 'Covers ' + cov[0].toLowerCase() + (cov.length > 1 ? ' and more' : '') : 'See what is covered', cardEnd: end,
      vers: [['v3', '2 Sep 2026', 'Added battery below 80% health · 214 orders sold on this version', true], ['v2', '11 Apr 2026', 'Courier pickup added · 812 orders'], ['v1', '6 Jan 2026', 'First version · 390 orders']].map(function (x) { return { v: x[0], d: x[1], s: x[2], live: !!x[3] }; }),
      preview: function () { toast(self, 'Opening the policy page as customers see it.'); },
      saveDraft: function () { toast(self, 'Draft saved. Customers still see the published version.'); },
      publish: function () { toast(self, name + ' published as a new version. New orders use it from now on.'); }
    };
    return v;
  }
}

// ---- styles ----

const CSS = `
.wp-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.wp-field .gc-label{margin:0}
.wp-lbl{display:flex;align-items:center;gap:6px}
.wp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3) var(--space-4)}
.wp-body{display:flex;flex-direction:column;gap:var(--space-4)}
.wp-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.wp-row>.gc-input{flex:1 1 140px;min-width:0}
.wp-sub{margin:0;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body)}
.wp-help{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.wp-readonly{display:flex;align-items:center;background:var(--surface-subtle);color:var(--text-body)}
.wp-switch{display:flex;align-items:center;gap:var(--space-3);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.wp-switch>span{display:flex;flex:1;align-items:center;gap:6px;min-width:0}
.wp-parts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-2)}
.wp-part{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.wp-part>span{font-size:var(--text-xs);color:var(--text-muted)}
.wp-part>b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.wp-list{display:flex;flex-direction:column;gap:6px}
.wp-item{display:flex;align-items:center;gap:var(--space-2);min-height:32px;padding:2px 2px 2px 10px;border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm)}
.wp-item>span:nth-child(2){flex:1;min-width:0}
.wp-dot{width:8px;height:8px;flex:none;border-radius:var(--radius-full)}
.wp-dot--ok{background:var(--success)}.wp-dot--no{background:var(--error)}
.wp-rem{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 2px 0 8px;border:1px solid var(--primary);border-radius:var(--radius-lg);background:var(--fill-primary-soft);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--primary)}
.wp-rem.is-off{border-color:var(--border-subtle);background:var(--surface-subtle);color:var(--text-muted)}
.wp-rem>i{display:grid;place-items:center;width:20px;height:20px;border-radius:var(--radius-full);background:var(--primary);color:#fff;font-size:var(--text-xs);font-style:normal}
.wp-rem.is-off>i{background:var(--slate-400)}
.wp-chip{display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:var(--radius-full);background:var(--fill-error-soft);color:var(--text-danger);font-size:var(--text-xs-plus);font-weight:var(--weight-medium)}
.wp-checks{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-4);font-size:var(--text-sm)}
.wp-checks label{display:flex;align-items:center;gap:var(--space-2);cursor:pointer}
.wp-checks--col{flex-direction:column}
.wp-terms{border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden}
.wp-terms__bar{display:flex;gap:2px;padding:4px 6px;border-bottom:1px solid var(--border-subtle);background:var(--surface-subtle);color:var(--text-muted)}
.wp-terms__bar>span{display:grid;place-items:center;width:28px;height:24px}
.wp-terms__text{min-height:140px;padding:var(--space-3);font-size:var(--text-sm);line-height:22px;color:var(--text-body);white-space:pre-line}
.wp-apply{display:flex;flex-direction:column}
.wp-apply>div{display:flex;align-items:center;gap:var(--space-2);padding:6px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.wp-apply>div:first-child{border-top:0;padding-top:0}
.wp-apply span{width:76px;flex:none;font-size:var(--text-xs-plus);color:var(--text-muted)}
.wp-apply b{flex:1;min-width:0;font-weight:var(--weight-medium);color:var(--text-heading)}
.wp-snip{display:flex;flex-direction:column;gap:2px;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--fill-primary-soft)}
.wp-snip>b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.wp-snip>span{font-size:var(--text-xs-plus);color:var(--text-body)}
.wp-snip>em{margin-top:4px;font-size:var(--text-xs-plus);font-style:normal;font-weight:var(--weight-medium);color:var(--text-link)}
.wp-card{border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden}
.wp-card__head{display:flex;align-items:center;gap:var(--space-2);padding:6px var(--space-3);background:var(--brand-navy-deep);color:#fff;font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label)}
.wp-card__body{display:flex;gap:var(--space-3);padding:var(--space-3);font-size:var(--text-xs-plus)}
.wp-card__body>div{display:flex;flex:1;flex-direction:column;gap:2px;min-width:0}
.wp-vers{display:flex;flex-direction:column;gap:var(--space-2);margin:0;padding:0;list-style:none}
.wp-vers li{display:flex;gap:var(--space-2)}
.wp-vers li>i{width:8px;height:8px;flex:none;margin-top:6px;border-radius:var(--radius-full);background:var(--slate-300)}
.wp-vers li>i.is-live{background:var(--success)}
.wp-vers b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.wp-vers small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.wp-note{margin:0;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-warning-soft);font-size:var(--text-xs-plus);color:var(--text-heading)}
@media (max-width:640px){
  .wp-grid{grid-template-columns:minmax(0,1fr)}
  .wp-parts{grid-template-columns:repeat(2,minmax(0,1fr))}
}
`;

// ---- markup ----

const Switch = ({ sw, label }) => (
  <button type="button" role="switch" aria-checked={!!(sw && sw.on)} aria-label={label} className="gc-switch" onClick={sw && sw.toggle}><span className="gc-switch__knob" /></button>
);
const stTone = (st) => (st === 'Published' ? 'success' : 'info');

export default class WarrantyPoliciesScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const sec = [{ label: 'Preview', onClick: v.preview, icon: 'eye' }, { label: 'Save draft', onClick: v.saveDraft }];
    return (
      <div className="dc-screen ds" data-screen="WarrantyPolicies">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="stock-wpol" />
          <main className="gc-shell__main">
            <__Topbar crumb="Stock" page="Warranty policies" placeholder="Search policy, product or brand" />
            <div className="gc-shell__content">
              {!v.editing ? (
                <div className="ix-page">
                  <ShopHeader icon="shield-check" title="Warranty policies"
                    about="Orders keep the version they were sold under. Changing the policy never changes an old customer’s warranty."
                    secondary={[{ label: 'Claims & serial numbers', href: '/warranty-claims' }]}
                    primary={{ label: 'New policy', onClick: v.newPolicy }} />
                  <section className="ix-card" aria-label="Warranty policies">
                    <ul className="ix-plist" aria-label="Warranty policies">
                      {__list(v.pols).map((pl) => (
                        <li key={pl.k}>
                          <button type="button" className="ix-pitem" onClick={pl.pick}>
                            <span className="ix-pitem__top"><b>{pl.n}</b><__StatusBadge tone={stTone(pl.st)}>{pl.st}</__StatusBadge></span>
                            <span className="ix-pitem__mid">{pl.t} · {pl.per} · {pl.cnt}{pl.def ? ' · ★ Store default' : ''}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="ix-table-wrap">
                      <table className="ix-table gc-table--keep">
                        <caption className="sr-only">Warranty policies</caption>
                        <thead><tr><th scope="col">Policy</th><th scope="col">Type</th><th scope="col">Period</th><th scope="col">Products</th><th scope="col">Status</th></tr></thead>
                        <tbody>
                          {__list(v.pols).map((pl) => (
                            <tr key={pl.k} onClick={pl.pick}>
                              <td>
                                <button type="button" className="ix-strong" onClick={(e) => { e.stopPropagation(); pl.pick(); }}>{pl.n}</button>
                                {pl.def ? <span className="ix-muted" style={{ marginLeft: "var(--space-2)", fontSize: "var(--text-xs)" }}>★ Store default</span> : null}
                              </td>
                              <td className="ix-muted">{pl.t}</td>
                              <td>{pl.per}</td>
                              <td className="ix-muted">{pl.cnt}</td>
                              <td><__StatusBadge tone={stTone(pl.st)}>{pl.st}</__StatusBadge></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="ix-foot"><span>{v.pols.length + ' policies'}</span></div>
                  </section>
                  <LearnMore topic="warranty policies" />
                </div>
              ) : (
                <div className="ix-page">
                  {/* the policy as a record: back to the list, its name and version, Publish */}
                  <RecordHeader onBack={v.back} title={v.pName} badges={<__StatusBadge tone={stTone(v.pSt)}>{v.pSt}</__StatusBadge>} meta={v.pVer}
                    secondary={sec} primary={{ label: 'Publish policy', onClick: v.publish }} />

                  <div className="ix-record">
                    <div className="ix-main">
                      <section className="ix-card" aria-labelledby="wp-h-basics">
                        <div className="ix-card__head"><h2 id="wp-h-basics">Policy basics</h2></div>
                        <div className="ix-card__body wp-body">
                          <div className="wp-grid">
                            <label className="wp-field">
                              <span className="gc-label">Policy name</span>
                              <input className="gc-input" value={v.pName} onInput={v.typeName} onChange={v.typeName} aria-label="Policy name" />
                            </label>
                            <label className="wp-field">
                              <span className="gc-label">Type</span>
                              <select className="gc-input gc-select" value={v.pType} onChange={v.setType} aria-label="Type">
                                <option value="brand">Brand warranty</option>
                                <option value="seller">Seller warranty</option>
                                <option value="service">Service warranty</option>
                                <option value="replace">Replacement guarantee</option>
                                <option value="money">Money-back guarantee</option>
                              </select>
                            </label>
                            <label className="wp-field">
                              <span className="gc-label">Provided by</span>
                              <select className="gc-input gc-select" aria-label="Provided by">
                                <option>Brand (official)</option>
                                <option>Our shop</option>
                                <option>Supplier</option>
                              </select>
                            </label>
                            <div className="wp-field">
                              <span className="gc-label">Period</span>
                              <div className="wp-row" style={{ flexWrap: "nowrap" }}>
                                <input className="gc-input" value={v.perN} onInput={v.typePer} onChange={v.typePer} aria-label="Period" style={{ flex: "0 0 72px", textAlign: "center", fontVariantNumeric: "tabular-nums" }} />
                                <select className="gc-input gc-select" value={v.perU} onChange={v.setPerU} aria-label="Period unit">
                                  <option value="days">days</option>
                                  <option value="months">months</option>
                                  <option value="years">years</option>
                                </select>
                              </div>
                            </div>
                            <label className="wp-field">
                              <span className="gc-label">Starts from</span>
                              <select className="gc-input gc-select" aria-label="Starts from">
                                <option>Delivery date</option>
                                <option>Purchase date</option>
                                <option>Activation date</option>
                              </select>
                            </label>
                            <div className="wp-field">
                              <div className="wp-lbl"><span className="gc-label">Proof needed</span><__InfoTip text="Pick below in Claim process" /></div>
                              <div className="gc-input wp-readonly">{v.proofTxt}</div>
                            </div>
                          </div>
                          <div className="wp-switch">
                            <span>Different periods for parts, labour or components<__InfoTip text="e.g. motherboard 12 months, battery 6 months" /></span>
                            <Switch sw={v.split} label="Different periods for parts, labour or components" />
                          </div>
                          {v.split?.on ? (
                            <div className="wp-parts">
                              {__list(v.parts).map((pt) => <div key={pt.k} className="wp-part"><span>{pt.k}</span><b>{pt.v}</b></div>)}
                              <button type="button" className="ix-btn"><__Icon name="plus" width="16" height="16" aria-hidden="true" />Add component</button>
                            </div>
                          ) : null}
                        </div>
                      </section>

                      <section className="ix-card" aria-labelledby="wp-h-cover">
                        <div className="ix-card__head"><h2 id="wp-h-cover">Covered / not covered</h2></div>
                        <div className="ix-card__body wp-body">
                          <div className="wp-grid">
                            <div className="wp-list">
                              <p className="wp-sub">Covered</p>
                              {__list(v.covd).map((co, i) => (
                                <div key={i} className="wp-item"><span className="wp-dot wp-dot--ok" /><span>{co.t}</span><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" onClick={co.del} aria-label={"Remove: " + (co.t ?? "")}><__Icon name="x" width="14" height="14" aria-hidden="true" /></button></div>
                              ))}
                              <div className="wp-row">
                                <input className="gc-input" value={v.covIn} onInput={v.covInType} onChange={v.covInType} placeholder="Add something covered" aria-label="Add something covered" />
                                <button type="button" className="ix-btn" onClick={v.addCov}>Add</button>
                              </div>
                            </div>
                            <div className="wp-list">
                              <p className="wp-sub">Not covered</p>
                              {__list(v.notc).map((no, i) => (
                                <div key={i} className="wp-item"><span className="wp-dot wp-dot--no" /><span>{no.t}</span><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" onClick={no.del} aria-label={"Remove: " + (no.t ?? "")}><__Icon name="x" width="14" height="14" aria-hidden="true" /></button></div>
                              ))}
                              <div className="wp-row">
                                <input className="gc-input" value={v.notIn} onInput={v.notInType} onChange={v.notInType} placeholder="Add something not covered" aria-label="Add something not covered" />
                                <button type="button" className="ix-btn" onClick={v.addNot}>Add</button>
                              </div>
                            </div>
                          </div>
                          <div className="wp-field">
                            <p className="wp-sub">Remedy — offered in this order</p>
                            <div className="wp-row">
                              {__list(v.remedy).map((rm) => (
                                <span key={rm.l} className={'wp-rem' + (rm.off ? ' is-off' : '')}>
                                  <i>{rm.n}</i>{rm.l}
                                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" onClick={rm.up} aria-label={rm.upL} title={rm.upL}><__Icon name="chevron-left" width="14" height="14" aria-hidden="true" /></button>
                                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" onClick={rm.tog} aria-label={rm.togL} title={rm.togL} style={{ marginLeft: "-6px" }}><__Icon name={rm.sym} width="14" height="14" aria-hidden="true" /></button>
                                </span>
                              ))}
                            </div>
                            <div className="wp-row" style={{ fontSize: "var(--text-sm)" }}>Replace if it cannot be repaired within<input className="gc-input" defaultValue="15" aria-label="Days" style={{ flex: "0 0 64px", textAlign: "center" }} />days</div>
                          </div>
                          <div className="wp-field">
                            <p className="wp-sub">Conditions that void the warranty</p>
                            <div className="wp-row">
                              {__list(v.voids).map((vd) => <span key={vd.t} className="wp-chip">{vd.t}</span>)}
                              <button type="button" className="ix-btn ix-btn--sm"><__Icon name="plus" width="16" height="16" aria-hidden="true" />Add condition</button>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="ix-card" aria-labelledby="wp-h-claim">
                        <div className="ix-card__head"><h2 id="wp-h-claim">Claim process</h2></div>
                        <div className="ix-card__body wp-body">
                          <div className="wp-field">
                            <p className="wp-sub">How customers claim</p>
                            <div className="wp-checks">
                              <label><input type="checkbox" className="gc-check" defaultChecked />Drop-off at shop</label>
                              <label><input type="checkbox" className="gc-check" defaultChecked />Courier pickup</label>
                              <label><input type="checkbox" className="gc-check" />On-site visit</label>
                            </div>
                          </div>
                          <div className="wp-grid">
                            <label className="wp-field"><span className="gc-label">Service centre</span><input className="gc-input" defaultValue="Service centre, Mirpur 10, Dhaka" aria-label="Service centre" /></label>
                            <label className="wp-field"><span className="gc-label">Hours</span><input className="gc-input" defaultValue="Sat–Thu, 10:00 AM – 7:00 PM" aria-label="Hours" /></label>
                          </div>
                          <div className="wp-field">
                            <p className="wp-sub">Proof the customer must show</p>
                            <div className="ix-chips">
                              {__list(v.proofs).map((pf) => <button key={pf.l} type="button" className="ix-chip" onClick={pf.tog} aria-pressed={!!pf.on}>{pf.l}</button>)}
                            </div>
                          </div>
                          <div className="wp-grid">
                            <div className="wp-field">
                              <span className="gc-label">Turnaround</span>
                              <div className="wp-row" style={{ flexWrap: "nowrap", fontSize: "var(--text-sm)" }}>
                                <input className="gc-input" defaultValue="7" aria-label="From days" style={{ flex: "0 0 64px", textAlign: "center" }} />
                                <span>to</span>
                                <input className="gc-input" defaultValue="15" aria-label="To days" style={{ flex: "0 0 64px", textAlign: "center" }} />
                                <span>days</span>
                              </div>
                            </div>
                            <label className="wp-field">
                              <span className="gc-label">Delivery cost during a claim</span>
                              <select className="gc-input gc-select" aria-label="Who pays">
                                <option>Shop pays both ways</option>
                                <option>Customer pays to send, shop pays return</option>
                                <option>Customer pays both ways</option>
                              </select>
                            </label>
                            <label className="wp-field">
                              <span className="gc-label">Claim updates to the customer</span>
                              <select className="gc-input gc-select" aria-label="Updates">
                                <option>SMS + WhatsApp at every step</option>
                                <option>SMS only</option>
                                <option>WhatsApp only</option>
                              </select>
                            </label>
                          </div>
                        </div>
                      </section>

                      <section className="ix-card" aria-labelledby="wp-h-terms">
                        <div className="ix-card__head">
                          <h2 id="wp-h-terms">Full terms <__InfoTip text="Shown on the full policy page of your website. Write both languages — customers pick one." /></h2>
                          <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.aiTerms}><__Icon name="sparkles" width="16" height="16" aria-hidden="true" />Write from the fields above</button>
                        </div>
                        <div className="ix-card__body wp-body">
                          <div className="gc-seg" role="group" aria-label="Language">
                            {__list(v.langs).map((lg) => <button key={lg.l} type="button" className={'gc-seg__btn' + (lg.on ? ' gc-seg__btn--active' : '')} aria-pressed={!!lg.on} onClick={lg.pick}>{lg.l}</button>)}
                          </div>
                          <div className="wp-terms">
                            <div className="wp-terms__bar" aria-hidden="true">
                              <span><__Icon name="bold" width="16" height="16" /></span>
                              <span><__Icon name="italic" width="16" height="16" /></span>
                              <span><__Icon name="heading" width="16" height="16" /></span>
                              <span><__Icon name="list" width="16" height="16" /></span>
                              <span><__Icon name="list-ordered" width="16" height="16" /></span>
                              <span><__Icon name="link" width="16" height="16" /></span>
                            </div>
                            <div className="wp-terms__text" style={v.termsBn ? { fontFamily: "var(--font-bn)" } : undefined}>{v.termsTxt}</div>
                          </div>
                        </div>
                      </section>
                    </div>

                    <aside className="ix-side">
                      <section className="ix-card" aria-labelledby="wp-h-apply">
                        <div className="ix-card__head"><h2 id="wp-h-apply">Applies to</h2></div>
                        <div className="ix-card__body wp-body">
                          <div className="wp-apply">
                            {__list(v.apply).map((ap) => (
                              <div key={ap.k}><span>{ap.k}</span><b>{ap.v}</b><button type="button" className="ix-btn ix-btn--sm ix-btn--plain">Edit</button></div>
                            ))}
                          </div>
                          <div className="wp-switch">
                            <span>Store default policy<__InfoTip text="Used when a product, category or brand has none. A product’s own choice always wins." /></span>
                            <Switch sw={v.isDef} label="Store default policy" />
                          </div>
                          <button type="button" className="ix-btn" onClick={v.bulk}><__Icon name="package" width="16" height="16" aria-hidden="true" />Bulk attach to products</button>
                        </div>
                      </section>

                      <section className="ix-card" aria-labelledby="wp-h-cust">
                        <div className="ix-card__head"><h2 id="wp-h-cust">As the customer sees it</h2></div>
                        <div className="ix-card__body wp-body">
                          <div className="wp-snip">
                            <b>{v.custTitle}</b>
                            <span>{v.custSub}</span>
                            <em>See full warranty policy ›</em>
                          </div>
                          <div className="wp-card">
                            <div className="wp-card__head gc-on-dark"><__Icon name="shield-check" width="14" height="14" aria-hidden="true" />WARRANTY CARD</div>
                            <div className="wp-card__body">
                              <div>
                                <b style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--text-heading)" }}>Galaxy A55 5G · 8/256 GB</b>
                                <span style={{ fontFamily: "var(--font-data)", color: "var(--text-body)" }}>IMEI 350912118845201</span>
                                <span>Starts <b>19 Sep 2026</b></span>
                                <span>Ends <b>{v.cardEnd}</b></span>
                                <span className="ix-muted">INV-24817 · Dazzle Shop</span>
                              </div>
                              <QrCode text="https://dazzleshop.com.bd/warranty/INV-24817" size={76} label="QR code" />
                            </div>
                          </div>
                          <div className="wp-field">
                            <p className="wp-sub">Also printed on</p>
                            <div className="wp-checks wp-checks--col">
                              <label><input type="checkbox" className="gc-check" defaultChecked />Invoice and receipt</label>
                              <label><input type="checkbox" className="gc-check" defaultChecked />Warranty card with QR</label>
                              <label><input type="checkbox" className="gc-check" defaultChecked />Order confirmation message</label>
                              <label><input type="checkbox" className="gc-check" defaultChecked />Customer account, per order</label>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="ix-card" aria-labelledby="wp-h-vers">
                        <div className="ix-card__head"><h2 id="wp-h-vers">Version history</h2></div>
                        <div className="ix-card__body wp-body">
                          <ul className="wp-vers">
                            {__list(v.vers).map((vr) => (
                              <li key={vr.v}><i className={vr.live ? 'is-live' : ''} /><span><b>{vr.v} <span className="ix-muted">· {vr.d}</span></b><small>{vr.s}</small></span></li>
                            ))}
                          </ul>
                          <p className="wp-note">Orders keep the version they were sold under. Changing the policy never changes an old customer’s warranty.</p>
                        </div>
                      </section>
                    </aside>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }
}
