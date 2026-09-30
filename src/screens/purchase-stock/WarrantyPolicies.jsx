'use client';
// Generated from design/templates/purchase-stock/WarrantyPolicies.dc.html by scripts/convert-design.mjs.
// Warranty policies — Stock — Warranty policies.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { PageHeader as __PageHeader } from '@/components/ui';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function pTabs(self, list, cur, key, counts) { return mkTabs(self, list, cur, key, counts).map(function (x) { x.pcls = x.on ? 'ptab on' : 'ptab'; return x; }); }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function stepN(self, key, def, step, min, max) { var s = self.state || {}; var v = s[key] == null ? def : s[key]; return { v: v, dec: function () { var p = {}; p[key] = Math.max(min, +(v - step).toFixed(2)); self.setState(p); }, inc: function () { var p = {}; p[key] = Math.min(max, +(v + step).toFixed(2)); self.setState(p); } }; }
var CHN = { sms: ['SMS', '#e7f8f1', '#047857'], wa: ['WhatsApp', '#dcfce7', '#166534'], email: ['Email', '#e0f2fe', '#075985'] };
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { clearTimeout(self.t); self.setState({ msg: m, bad: !!bad }); self.t = setTimeout(function () { self.setState({ msg: '' }); }, 2800); }
function msgV(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#fff4e0' : '#e7f8f1', msgFg: s.bad ? '#7a3b04' : '#065f46' }; }
var POLS = {
  phone: { n: 'Smartphone brand warranty', type: 'brand', per: ['12', 'months'], cnt: '46 products', st: 'Published', ver: 'v3 · published 2 Sep 2026', tint: '#e0f3fb', ink: '#003087', def: false,
    cov: ['Manufacturing defects', 'Battery below 80% health', 'Motherboard and display faults'], not: ['Physical or liquid damage', 'Opened by third party', 'Software issues after rooting'],
    apply: [['Category', 'Smartphones'], ['Brands', 'Samsung, Xiaomi'], ['Products', '46 products'], ['Variants', 'All variants'], ['Excluded', 'Refurbished, open-box']] },
  shop: { n: 'Shop service warranty', type: 'seller', per: ['6', 'months'], cnt: '38 products', st: 'Published', ver: 'v2 · published 14 Jul 2026', tint: '#e7f8f1', ink: '#047857', def: true,
    cov: ['Parts and labour at our shop', 'Charging and power faults'], not: ['Physical damage', 'Accessories and cables'],
    apply: [['Category', 'Accessories, Audio'], ['Brands', 'All brands'], ['Products', '38 products'], ['Variants', 'All variants'], ['Excluded', 'Clearance stock']] },
  rep: { n: '7-day replacement guarantee', type: 'replace', per: ['7', 'days'], cnt: '112 products', st: 'Published', ver: 'v1 · published 3 May 2026', tint: '#fff4e0', ink: '#a14f06', def: false,
    cov: ['Faulty on arrival', 'Wrong item sent'], not: ['Change of mind', 'Used or unsealed items'],
    apply: [['Category', 'Skin care, Clothing'], ['Brands', 'All brands'], ['Products', '112 products'], ['Variants', 'All variants'], ['Excluded', 'Sale items']] },
  tv: { n: '2 years parts, 1 year service', type: 'service', per: ['2', 'years'], cnt: '14 products', st: 'Draft', ver: 'v1 · draft, not published', tint: '#f3e8ff', ink: '#6d28d9', def: false,
    cov: ['Panel and board parts', 'Power supply'], not: ['Burn-in from static images', 'Wall mount damage'],
    apply: [['Category', 'TVs, Monitors'], ['Brands', 'Walton, Sony'], ['Products', '14 products'], ['Variants', 'All variants'], ['Excluded', 'Display units']] },
  money: { n: '15-day money-back', type: 'money', per: ['15', 'days'], cnt: '9 products', st: 'Published', ver: 'v1 · published 20 Aug 2026', tint: '#ffece6', ink: '#b83210', def: false,
    cov: ['Any reason, unused, in the box'], not: ['Opened software or gift cards'],
    apply: [['Category', 'Smart home'], ['Brands', 'GridShop'], ['Products', '9 products'], ['Variants', 'All variants'], ['Excluded', '—']] }
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
  componentWillUnmount() { clearTimeout(this.t); }
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
      pols: ORDER.map(function (k) { var p = POLS[k], on = k === pk; var pub = p.st === 'Published'; return { n: k === pk ? name : p.n, t: TYPEL[p.type], cnt: p.cnt, per: p.per[0] + (p.per[1] === 'days' ? 'd' : p.per[1] === 'months' ? 'm' : 'y'), st: p.st, sb: pub ? '#e7f8f1' : '#eef2f6', sf: pub ? '#047857' : '#475569', tint: p.tint, ink: p.ink, def: p.def, on: on, bd: on ? '#003087' : '#e6eaf0', bg: on ? '#f5f8ff' : '#fff', pick: function () { self.setState({ pk: k }); } }; }),
      newPolicy: function () { toast(self, 'A blank policy is ready — give it a name and a period.'); },
      pName: name, pVer: P.ver, typeName: function (e) { set({ n: e.target.value }); },
      pType: type, setType: function (e) { set({ type: e.target.value }); },
      perN: perN, typePer: function (e) { set({ perN: e.target.value }); }, perU: perU, setPerU: function (e) { set({ perU: e.target.value }); },
      proofTxt: PROOF.filter(function (x) { return pr.indexOf(x[0]) >= 0; }).map(function (x) { return x[1].replace('Serial or IMEI number', 'IMEI'); }).join(' + ') || 'Nothing',
      split: mkSw(this, 'split', true),
      parts: [['Motherboard', '12 months'], ['Display', '12 months'], ['Battery', '6 months']].map(function (x) { return { k: x[0], v: x[1] }; }),
      covd: cov.map(function (t, i) { return { t: t, del: function () { set({ cov: cov.filter(function (_, j) { return j !== i; }) }); } }; }),
      notc: not.map(function (t, i) { return { t: t, del: function () { set({ not: not.filter(function (_, j) { return j !== i; }) }); } }; }),
      covIn: s.covIn || '', covInType: function (e) { self.setState({ covIn: e.target.value }); }, addCov: function () { if (!s.covIn) return; set({ cov: cov.concat([s.covIn]) }); self.setState({ covIn: '' }); },
      notIn: s.notIn || '', notInType: function (e) { self.setState({ notIn: e.target.value }); }, addNot: function () { if (!s.notIn) return; set({ not: not.concat([s.notIn]) }); self.setState({ notIn: '' }); },
      remedy: rem.map(function (k, i) { var off = remOff.indexOf(k) >= 0; var l = REM.filter(function (x) { return x[0] === k; })[0][1]; return { l: l, n: off ? '–' : i + 1, bd: off ? '#e2e8f0' : '#003087', bg: off ? '#f8fafc' : '#f5f8ff', fg: off ? 'var(--text-muted)' : '#003087', dot: off ? '#64748b' : '#003087', sym: off ? 'plus' : 'x', off: off, togL: (off ? 'Turn on ' : 'Turn off ') + l, upL: 'Move ' + l + ' earlier',
        up: function () { if (!i) return; var r = rem.slice(); r[i] = r[i - 1]; r[i - 1] = k; set({ rem: r }); },
        tog: function () { set({ remOff: off ? remOff.filter(function (x) { return x !== k; }) : remOff.concat([k]) }); } }; }),
      voids: ['Physical or liquid damage', 'Opened or repaired by others', 'Rooted or modified software', 'Warranty sticker removed'].map(function (t) { return { t: t }; }),
      proofs: PROOF.map(function (x) { var on = pr.indexOf(x[0]) >= 0; return { l: x[1], on: on, bd: on ? '#003087' : '#e2e8f0', bg: on ? '#f5f8ff' : '#fff', fg: on ? '#003087' : '#475569', tog: function () { set({ proof: on ? pr.filter(function (y) { return y !== x[0]; }) : pr.concat([x[0]]) }); } }; }),
      langs: [['en', 'English'], ['bn', 'বাংলা']].map(function (x) { var on = x[0] === lang; return { l: x[1], on: on, bg: on ? '#0b1733' : 'transparent', fg: on ? '#fff' : '#475569', pick: function () { self.setState({ lang: x[0] }); } }; }),
      termsTxt: TERMS[lang], termsCls: lang === 'bn' ? 'bn' : '', aiTerms: function () { toast(self, 'Full terms rewritten in English and Bangla from the fields above.'); },
      apply: P.apply.map(function (x) { return { k: x[0], v: x[1] }; }),
      isDef: mkSw(this, 'def_' + pk, P.def),
      bulk: function () { toast(self, 'Pick products on the next screen — the policy is attached to all of them at once.'); },
      custTitle: perN + ' ' + perU + ' ' + TYPEL[type].toLowerCase(), custSub: cov.length ? 'Covers ' + cov[0].toLowerCase() + (cov.length > 1 ? ' and more' : '') : 'See what is covered', cardEnd: end,
      vers: [['v3', '2 Sep 2026', 'Added battery below 80% health · 214 orders sold on this version', '#10b981'], ['v2', '11 Apr 2026', 'Courier pickup added · 812 orders', '#94a3b8'], ['v1', '6 Jan 2026', 'First version · 390 orders', '#cbd5e1']].map(function (x) { return { v: x[0], d: x[1], s: x[2], c: x[3] }; }),
      preview: function () { toast(self, 'Opening the policy page as customers see it.'); },
      saveDraft: function () { toast(self, 'Draft saved. Customers still see the published version.'); },
      publish: function () { toast(self, name + ' published as a new version. New orders use it from now on.'); }
    };
    return assign(v, msgV(s));
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `/* phones: rows of label + buttons wrap instead of running out of the card */
@media (max-width:640px){.gc-shell__content [style*="display:flex"]:not([role="tablist"]),.gc-shell__content [style*="display: flex"]:not([role="tablist"]){flex-wrap:wrap}.gc-shell__content select,.gc-shell__content input{min-width:0;max-width:100%}.gc-shell__content .mono,.gc-shell__content [class*="badge"]{overflow-wrap:anywhere}}

body{margin:0;font-family:var(--font-sans);background:#e9eef5;color:#1e293b;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087}a:hover{color:#002a77}
.card{background:#ffffff;border-radius:var(--radius-xl);box-shadow:0 3px 10px 0 rgba(48,46,56,.06)}
.nav{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:var(--radius-lg);color:#475569;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:.01em;text-decoration:none;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 300ms ease-in-out}
.nav:hover{background:#f1f5f9;color:#0f172a;text-decoration:none}
.nav.on{background:rgba(0,48,135,.08);color:#003087}
.navh{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);color:var(--text-muted);padding:18px 12px 6px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:var(--radius-lg);border:0;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 200ms,border-color 200ms}
.btn:hover{text-decoration:none}
.btn:focus-visible,.nav:focus-visible,.ib:focus-visible,.tab:focus-visible,.chip:focus-visible,.step:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.soft{background:rgba(0,48,135,.08);color:#003087}.soft:hover{background:rgba(0,48,135,.16);color:#003087}
.line{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.line:hover{background:#f1f5f9;color:#1e293b}
.warnbtn{background:#b45309;color:#fff}.warnbtn:hover{background:#92400e;color:#fff}
.big{height:52px;padding:0 24px;font-size:var(--text-sm-plus)}
.sm{height:36px;padding:0 12px;font-size:var(--text-xs-plus)}
.ib{width:36px;height:36px;border-radius:var(--radius-full);border:0;background:transparent;color:#475569;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.ib:hover{background:rgba(203,213,225,.35);color:#0f172a}
.inp{width:100%;height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-sm);color:#1e293b;transition:border-color 200ms}
.inp:hover{border-color:#94a3b8}.inp:focus{outline:none;border-color:#003087}
.inp::placeholder{color:var(--text-muted)}
.lbl{font-size:var(--text-sm);line-height:18px;font-weight:var(--weight-medium);color:#334155}
.tab{height:36px;padding:0 14px;border-radius:var(--radius-full);border:0;background:transparent;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#475569;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,color 200ms}
.tab:hover{background:#f1f5f9;color:#0f172a}
.tab.on{background:#003087;color:#fff}
.chip{height:36px;padding:0 14px;border-radius:var(--radius-full);border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,border-color 200ms,color 200ms}
.chip:hover{border-color:#94a3b8}
.chip.on{border-color:#003087;background:rgba(0,48,135,.08);color:#003087}
.th{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);text-transform:uppercase;color:var(--text-muted);text-align:left;padding:12px 16px;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.td{padding:14px 16px;border-bottom:1px solid #eef2f6;font-size:var(--text-sm);line-height:20px;vertical-align:middle}
.row{transition:background-color 200ms}.row:hover{background:#f8fafc}
.badge{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.badge::before{content:"";width:6px;height:6px;border-radius:var(--radius-full);background:currentColor}
.b-draft{background:#eef2f6;color:#475569}.b-approval{background:#fff4e0;color:#a14f06}.b-approved{background:#e0f2fe;color:#075985}
.b-ordered{background:rgba(0,48,135,.08);color:#003087}.b-partial{background:#fff1e6;color:#b4410c}.b-received{background:#e7f8f1;color:#047857}
.b-closed{background:#e2e8f0;color:#334155}.b-cancelled{background:#ffece6;color:#b83210}.b-over{background:#ffece6;color:#b83210}
.mono{font-family:var(--font-data);letter-spacing:.02em}
.fade{animation:gcFade 260ms cubic-bezier(0,0,.2,1)}
@keyframes gcFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.flash{animation:gcFlash 900ms ease-out}
@keyframes gcFlash{from{background:#e7f8f1}to{background:transparent}}
.scanline{animation:gcScan 1.8s ease-in-out infinite alternate}
@keyframes gcScan{from{transform:translateY(0)}to{transform:translateY(150px)}}

.sw{position:relative;width:48px;height:28px;border-radius:var(--radius-full);border:0;background:#cbd5e1;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:var(--radius-full);background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.25);transition:transform 200ms cubic-bezier(0,0,.2,1)}
.sw.on{background:#003087}.sw.on::after{transform:translateX(20px)}
.sw:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.b-live{background:#e7f8f1;color:#047857}.b-sched{background:#e0f2fe;color:#075985}.b-ended{background:#eef2f6;color:#475569}.b-paused{background:#fff4e0;color:#a14f06}
.t-member{background:#eef2f6;color:#475569}.t-silver{background:#e2e8f0;color:#334155}.t-gold{background:#fff4e0;color:#a14f06}.t-plat{background:rgba(0,48,135,.08);color:#003087}
.actc{border:1px solid transparent;transition:border-color 200ms,box-shadow 200ms}.actc:hover{border-color:#003087;box-shadow:0 6px 18px rgba(0,48,135,.12)}
.bn{font-family:var(--font-bn)}
.pulse{animation:gcPulse 1.6s ease-in-out infinite}
@keyframes gcPulse{0%,100%{opacity:1}50%{opacity:.45}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
.pcard{background:#fff;border:1px solid #e6eaf0;border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px -14px rgba(15,23,42,.10)}
.psec{font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.num{font-variant-numeric:tabular-nums}
.ai{height:28px;padding:0 10px;border-radius:var(--radius-lg);border:1px solid #d9d2fb;background:linear-gradient(135deg,#f5f3ff,#eef6ff);color:#5b21b6;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);display:inline-flex;align-items:center;gap:6px;cursor:pointer;transition:box-shadow 200ms,border-color 200ms}
.ai:hover{border-color:#a78bfa;box-shadow:0 4px 12px -6px rgba(91,33,182,.5)}
.ai:focus-visible{outline:3px solid rgba(124,58,237,.4);outline-offset:2px}
.abtn{height:32px;padding:0 12px;border-radius:var(--radius-lg);border:1px solid #e2e8f0;background:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.abtn:hover{background:#f1f5f9}
.ptabs{display:flex;gap:2px;padding:0 16px;border-bottom:1px solid #e6eaf0}
.ptab{position:relative;height:52px;padding:0 12px;border:0;background:transparent;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-muted);cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.ptab:hover{color:#0f172a}.ptab.on{color:#003087;font-weight:var(--weight-medium)}
.ptab.on::after{content:"";position:absolute;left:8px;right:8px;bottom:-1px;height:2.5px;border-radius:3px 3px 0 0;background:#003087}
.pcnt{min-width:20px;height:20px;padding:0 6px;border-radius:var(--radius-full);background:#eef2f6;color:#475569;font-size:var(--text-xs);font-weight:var(--weight-medium);display:inline-flex;align-items:center;justify-content:center}
.ptab.on .pcnt{background:rgba(0,48,135,.1);color:#003087}
.thumb{width:44px;height:44px;flex-shrink:0;border-radius:var(--radius-lg);border:1px solid #e6eaf0;display:flex;align-items:center;justify-content:center;font-weight:var(--weight-semibold);color:#003087}
`;

// ---- markup ----

export default class WarrantyPoliciesScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="WarrantyPolicies">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="stock-wpol" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Stock" page="Warranty policies" placeholder="Search policy, product or brand" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <__PageHeader title="Warranty policies" />
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flexGrow: "1", fontSize: "var(--text-sm)", lineHeight: "20px", color: "#475569" }}>Write a warranty policy once. Attach it to products, categories or brands — it then shows on the product page, invoice and warranty card by itself.</div>
                <__Link href="/warranty-claims" className="btn line">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{"Claims & serial numbers"}</span>
                </__Link>
                <button type="button" className="btn solid" onClick={v.newPolicy}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  <span>New policy</span>
                </button>
              </div>
              {v.hasMsg ? (<>
                <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-lg); background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: var(--text-sm); font-weight: var(--weight-medium);`)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{v.msg}</span>
                </div>
              </>) : null}
              <div className="gc-cols-5" style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "12px" }}>
                {__list(v.pols).map((pl, $index) => (<React.Fragment key={$index}>
                    <button type="button" onClick={pl?.pick} aria-pressed={pl?.on} style={__sx(`text-align: left; padding: 16px; border-radius: var(--radius-xl); border: 1.5px solid ${pl?.bd ?? ""}; background: ${pl?.bg ?? ""}; font: inherit; cursor: pointer; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 1px 2px rgba(15,23,42,.04);`)}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={__sx(`width: 34px; height: 34px; border-radius: var(--radius-lg); background: ${pl?.tint ?? ""}; color: ${pl?.ink ?? ""}; display: flex; align-items: center; justify-content: center; font-size: var(--text-xs); font-weight: var(--weight-medium);`)}>{pl?.per}</span>
                        <span style={{ flexGrow: "1" }} />
                        <span style={__sx(`height: 22px; padding: 0 8px; border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: var(--weight-medium); display: inline-flex; align-items: center; background: ${pl?.sb ?? ""}; color: ${pl?.sf ?? ""};`)}>{pl?.st}</span>
                      </div>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a", lineHeight: "20px" }}>{pl?.n}</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{pl?.t} · {pl?.cnt}</div>
                      {pl?.def ? (<>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#047857" }}>★ Store default</span>
                      </>) : null}
                    </button>
                  </React.Fragment>))}
                <button type="button" onClick={v.newPolicy} style={{ padding: "16px", borderRadius: "var(--radius-lg)", border: "1.5px dashed #94a3b8", background: "transparent", font: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>New policy</button>
              </div>
              <div className="gc-on-dark" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "20px 24px", borderRadius: "var(--radius-xl)", background: "#0b1733", color: "#fff" }}>
                <div style={{ flexGrow: "1" }}>
                  <div style={{ fontSize: "var(--text-xs)", opacity: ".7" }}>Stock › Warranty policies › {v.pName}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "2px" }}>
                    <h2 style={{ margin: "0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)" }}>{v.pName}</h2>
                    <span style={{ height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.14)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center" }}>{v.pVer}</span>
                  </div>
                </div>
                <button type="button" className="btn" onClick={v.preview} style={{ background: "rgba(255,255,255,.1)", color: "#fff" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>Preview</span>
                </button>
                <button type="button" className="btn" onClick={v.saveDraft} style={{ background: "rgba(255,255,255,.1)", color: "#fff" }}>Save draft</button>
                <button type="button" className="btn" onClick={v.publish} style={{ background: "#fff", color: "#0b1733" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>Publish policy</span>
                </button>
              </div>
              <div style={{ display: "flex", gap: "18px", alignItems: "flex-start" }}>
                <div style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "18px" }}>
                  <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div className="psec" style={{ color: "#0a5bd0" }}>Policy basics</div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: "14px" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Policy name</span>
                        <input className="inp" value={v.pName} onInput={v.typeName} onChange={v.typeName} aria-label="Policy name" />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Type</span>
                        <select className="inp" value={v.pType} onChange={v.setType} aria-label="Type">
                          <option value="brand">Brand warranty</option>
                          <option value="seller">Seller warranty</option>
                          <option value="service">Service warranty</option>
                          <option value="replace">Replacement guarantee</option>
                          <option value="money">Money-back guarantee</option>
                        </select>
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Provided by</span>
                        <select className="inp" aria-label="Provided by">
                          <option>Brand (official)</option>
                          <option>Our shop</option>
                          <option>Supplier</option>
                        </select>
                      </label>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Period</span>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input className="inp num" value={v.perN} onInput={v.typePer} onChange={v.typePer} aria-label="Period" style={{ width: "90px", textAlign: "center", fontWeight: "var(--weight-semibold)" }} />
                          <select className="inp" value={v.perU} onChange={v.setPerU} aria-label="Period unit">
                            <option value="days">days</option>
                            <option value="months">months</option>
                            <option value="years">years</option>
                          </select>
                        </div>
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Starts from</span>
                        <select className="inp" aria-label="Starts from">
                          <option>Delivery date</option>
                          <option>Purchase date</option>
                          <option>Activation date</option>
                        </select>
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Proof needed</span>
                        <div className="inp" style={{ display: "flex", alignItems: "center", background: "#f8fafc" }}>{v.proofTxt}</div>
                        <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Pick below in Claim process</span>
                      </label>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M21 4h-7" />
                          <path d="M10 4H3" />
                          <path d="M21 12h-9" />
                          <path d="M8 12H3" />
                          <path d="M21 20h-5" />
                          <path d="M12 20H3" />
                          <path d="M14 2v4" />
                          <path d="M8 10v4" />
                          <path d="M16 18v4" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Different periods for parts, labour or components</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>e.g. motherboard 12 months, battery 6 months</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.split?.on} aria-label="Different periods for parts, labour or components" className={v.split?.cls} onClick={v.split?.toggle} />
                    </div>
                    {v.split?.on ? (<>
                      <div className="fade gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px" }}>
                        {__list(v.parts).map((pt, $index) => (<React.Fragment key={$index}>
                            <div style={{ padding: "12px 14px", borderRadius: "var(--radius-xl)", background: "#f7f9fc", border: "1px solid #e6eaf0" }}>
                              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{pt?.k}</div>
                              <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{pt?.v}</div>
                            </div>
                          </React.Fragment>))}
                        <button type="button" className="abtn" style={{ height: "auto", justifyContent: "center" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>Add component</button>
                      </div>
                    </>) : null}
                  </section>
                  <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div className="psec" style={{ color: "#0a5bd0" }}>Covered / not covered</div>
                      </div>
                    </div>
                    <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Covered</div>
                        {__list(v.covd).map((co, $index) => (<React.Fragment key={$index}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "var(--radius-lg)", background: "#f7f9fc" }}>
                              <span style={{ width: "10px", height: "10px", borderRadius: "var(--radius-full)", background: "#10b981", flexShrink: "0" }} />
                              <span style={{ flexGrow: "1", fontSize: "var(--text-sm)" }}>{co?.t}</span>
                              <button type="button" className="ib" onClick={co?.del} aria-label={"Remove: " + (co?.t ?? "")} style={{ width: "28px", height: "28px" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M18 6 6 18" />
                                  <path d="m6 6 12 12" />
                                </svg>
                              </button>
                            </div>
                          </React.Fragment>))}
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input className="inp" value={v.covIn} onInput={v.covInType} onChange={v.covInType} placeholder="Add something covered" aria-label="Add something covered" style={{ height: "38px" }} />
                          <button type="button" className="btn soft sm" onClick={v.addCov}>Add</button>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Not covered</div>
                        {__list(v.notc).map((no, $index) => (<React.Fragment key={$index}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "var(--radius-lg)", background: "#f7f9fc" }}>
                              <span style={{ width: "10px", height: "10px", borderRadius: "var(--radius-full)", background: "#e11d48", flexShrink: "0" }} />
                              <span style={{ flexGrow: "1", fontSize: "var(--text-sm)" }}>{no?.t}</span>
                              <button type="button" className="ib" onClick={no?.del} aria-label={"Remove: " + (no?.t ?? "")} style={{ width: "28px", height: "28px" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M18 6 6 18" />
                                  <path d="m6 6 12 12" />
                                </svg>
                              </button>
                            </div>
                          </React.Fragment>))}
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input className="inp" value={v.notIn} onInput={v.notInType} onChange={v.notInType} placeholder="Add something not covered" aria-label="Add something not covered" style={{ height: "38px" }} />
                          <button type="button" className="btn soft sm" onClick={v.addNot}>Add</button>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Remedy — offered in this order</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        {__list(v.remedy).map((rm, $index) => (<React.Fragment key={$index}>
                            <div style={__sx(`display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 6px 0 12px; border-radius: var(--radius-xl); border: 1.5px solid ${rm?.bd ?? ""}; background: ${rm?.bg ?? ""}; font-size: var(--text-sm); font-weight: var(--weight-medium); color: ${rm?.fg ?? ""};`)}><span style={__sx(`width: 22px; height: 22px; border-radius: var(--radius-full); background: ${rm?.dot ?? ""}; color: #fff; font-size: var(--text-xs); display: inline-flex; align-items: center; justify-content: center;`)}>{rm?.n}</span>{rm?.l}<button type="button" className="ib" onClick={rm?.up} aria-label={rm?.upL} title={rm?.upL} style={{ width: "28px", height: "28px" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
</button><button type="button" className="ib" onClick={rm?.tog} aria-label={rm?.togL} title={rm?.togL} style={{ width: "28px", height: "28px" }}><__Icon name={rm?.sym} width="14" height="14" aria-hidden="true" /></button></div>
                          </React.Fragment>))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-sm)", color: "#334155" }}>Replace if it cannot be repaired within<input className="inp num" defaultValue="15" aria-label="Days" style={{ width: "64px", height: "36px", textAlign: "center" }} />days</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Conditions that void the warranty</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {__list(v.voids).map((vd, $index) => (<React.Fragment key={$index}>
                            <span style={{ display: "inline-flex", alignItems: "center", height: "32px", padding: "0 12px", borderRadius: "var(--radius-full)", background: "#fff1f2", color: "#9f1239", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>{vd?.t}</span>
                          </React.Fragment>))}
                        <button type="button" className="abtn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>Add condition</button>
                      </div>
                    </div>
                  </section>
                  <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div className="psec" style={{ color: "#0a5bd0" }}>Claim process</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <span className="lbl">How customers claim</span>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "38px", padding: "0 12px", borderRadius: "var(--radius-lg)", border: "1px solid #e2e8f0", background: "#fff", fontSize: "var(--text-sm)", cursor: "pointer" }}><input type="checkbox" defaultChecked="" style={{ width: "16px", height: "16px", accentColor: "#003087" }} />Drop-off at shop</label>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "38px", padding: "0 12px", borderRadius: "var(--radius-lg)", border: "1px solid #e2e8f0", background: "#fff", fontSize: "var(--text-sm)", cursor: "pointer" }}><input type="checkbox" defaultChecked="" style={{ width: "16px", height: "16px", accentColor: "#003087" }} />Courier pickup</label>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "38px", padding: "0 12px", borderRadius: "var(--radius-lg)", border: "1px solid #e2e8f0", background: "#fff", fontSize: "var(--text-sm)", cursor: "pointer" }}><input type="checkbox" style={{ width: "16px", height: "16px", accentColor: "#003087" }} />On-site visit</label>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "14px" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Service centre</span>
                        <input className="inp" defaultValue="Service centre, Mirpur 10, Dhaka" aria-label="Service centre" />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Hours</span>
                        <input className="inp" defaultValue="Sat–Thu, 10:00 AM – 7:00 PM" aria-label="Hours" />
                      </label>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <span className="lbl">Proof the customer must show</span>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {__list(v.proofs).map((pf, $index) => (<React.Fragment key={$index}>
                            <button type="button" onClick={pf?.tog} aria-pressed={pf?.on} style={__sx(`height: 38px; padding: 0 14px; border-radius: var(--radius-lg); border: 1.5px solid ${pf?.bd ?? ""}; background: ${pf?.bg ?? ""}; color: ${pf?.fg ?? ""}; font: inherit; font-size: var(--text-sm); font-weight: var(--weight-medium); cursor: pointer;`)}>{pf?.l}</button>
                          </React.Fragment>))}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Turnaround</span>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <input className="inp num" defaultValue="7" aria-label="From days" style={{ width: "70px", textAlign: "center" }} />
                          <span>to</span>
                          <input className="inp num" defaultValue="15" aria-label="To days" style={{ width: "70px", textAlign: "center" }} />
                          <span>days</span>
                        </div>
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Delivery cost during a claim</span>
                        <select className="inp" aria-label="Who pays">
                          <option>Shop pays both ways</option>
                          <option>Customer pays to send, shop pays return</option>
                          <option>Customer pays both ways</option>
                        </select>
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Claim updates to the customer</span>
                        <select className="inp" aria-label="Updates">
                          <option>SMS + WhatsApp at every step</option>
                          <option>SMS only</option>
                          <option>WhatsApp only</option>
                        </select>
                      </label>
                    </div>
                  </section>
                  <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div className="psec" style={{ color: "#0a5bd0" }}>Full terms</div>
                        <p style={{ margin: "4px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Shown on the full policy page of your website. Write both languages — customers pick one.</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ display: "inline-flex", padding: "3px", borderRadius: "var(--radius-full)", background: "#eef2f6" }}>
                        {__list(v.langs).map((lg, $index) => (<React.Fragment key={$index}>
                            <button type="button" onClick={lg?.pick} aria-pressed={lg?.on} style={__sx(`height: 32px; padding: 0 16px; border: 0; border-radius: var(--radius-full); font: inherit; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); cursor: pointer; background: ${lg?.bg ?? ""}; color: ${lg?.fg ?? ""};`)}>{lg?.l}</button>
                          </React.Fragment>))}
                      </div>
                      <span style={{ flexGrow: "1" }} />
                      <button type="button" className="ai" onClick={v.aiTerms}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>Write from the fields above</button>
                    </div>
                    <div style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                      <div aria-hidden="true" style={{ display: "flex", gap: "2px", padding: "6px 8px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)", color: "#475569" }}>
                        <span style={{ width: "30px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><__Icon name="bold" width="16" height="16" /></span>
                        <span style={{ width: "30px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><__Icon name="italic" width="16" height="16" /></span>
                        <span style={{ width: "30px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><__Icon name="heading" width="16" height="16" /></span>
                        <span style={{ width: "30px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><__Icon name="list" width="16" height="16" /></span>
                        <span style={{ width: "30px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><__Icon name="list-ordered" width="16" height="16" /></span>
                        <span style={{ width: "30px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><__Icon name="link" width="16" height="16" /></span>
                      </div>
                      <div className={v.termsCls} style={{ padding: "14px 16px", fontSize: "var(--text-sm)", lineHeight: "22px", color: "#334155", minHeight: "150px", whiteSpace: "pre-line" }}>{v.termsTxt}</div>
                    </div>
                  </section>
                </div>
                <div style={{ width: "380px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "18px" }}>
                  <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div className="psec" style={{ color: "#0a5bd0" }}>Applies to</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {__list(v.apply).map((ap, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 0", borderBottom: "1px solid #eef2f6" }}>
                            <span style={{ width: "84px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{ap?.k}</span>
                            <span style={{ flexGrow: "1", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{ap?.v}</span>
                            <button type="button" className="abtn" style={{ height: "28px" }}>Edit</button>
                          </div>
                        </React.Fragment>))}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Store default policy</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Used when a product, category or brand has none. A product’s own choice always wins.</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.isDef?.on} aria-label="Store default policy" className={v.isDef?.cls} onClick={v.isDef?.toggle} />
                    </div>
                    <button type="button" className="btn line" onClick={v.bulk} style={{ width: "100%" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m7.5 4.27 9 5.15" />
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                        <path d="m3.3 7 8.7 5 8.7-5" />
                        <path d="M12 22V12" />
                      </svg>
                      <span>Bulk attach to products</span>
                    </button>
                  </section>
                  <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div className="psec" style={{ color: "#0a5bd0" }}>As the customer sees it</div>
                      </div>
                    </div>
                    <div style={{ padding: "16px", borderRadius: "var(--radius-xl)", background: "#e8f1fd" }}>
                      <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{v.custTitle}</div>
                      <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569", marginTop: "2px" }}>{v.custSub}</div>
                      <div style={{ fontSize: "var(--text-xs-plus)", color: "#0a5bd0", fontWeight: "var(--weight-medium)", marginTop: "8px" }}>See full warranty policy ›</div>
                    </div>
                    <div style={{ borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                      <div className="gc-on-dark" style={{ padding: "10px 14px", background: "#0b1733", color: "#fff", display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  <path d="m9 12 2 2 4-4" />
</svg>WARRANTY CARD</div>
                      <div style={{ display: "flex", gap: "12px", padding: "14px" }}>
                        <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "4px", fontSize: "var(--text-xs-plus)" }}>
                          <div style={{ fontWeight: "var(--weight-semibold)", fontSize: "var(--text-sm)" }}>Galaxy A55 5G · 8/256 GB</div>
                          <div className="mono" style={{ color: "#475569" }}>IMEI 350912118845201</div>
                          <div>Starts <b>19 Sep 2026</b></div>
                          <div>Ends <b>{v.cardEnd}</b></div>
                          <div style={{ color: "var(--text-muted)" }}>INV-24817 · GridShop</div>
                        </div>
                        <svg width="76" height="76" viewBox="0 0 21 21" aria-label="QR code" style={{ flexShrink: "0" }}>
                          <rect width="21" height="21" fill="#fff" />
                          <rect x="0" y="0" width="1" height="1" fill="#0b1733" />
                          <rect x="1" y="0" width="1" height="1" fill="#0b1733" />
                          <rect x="2" y="0" width="1" height="1" fill="#0b1733" />
                          <rect x="3" y="0" width="1" height="1" fill="#0b1733" />
                          <rect x="4" y="0" width="1" height="1" fill="#0b1733" />
                          <rect x="5" y="0" width="1" height="1" fill="#0b1733" />
                          <rect x="6" y="0" width="1" height="1" fill="#0b1733" />
                          <rect x="7" y="0" width="1" height="1" fill="#0b1733" />
                          <rect x="8" y="0" width="1" height="1" fill="#0b1733" />
                          <rect x="10" y="0" width="1" height="1" fill="#0b1733" />
                          <rect x="12" y="0" width="1" height="1" fill="#0b1733" />
                          <rect x="13" y="0" width="1" height="1" fill="#0b1733" />
                          <rect x="14" y="0" width="1" height="1" fill="#0b1733" />
                          <rect x="15" y="0" width="1" height="1" fill="#0b1733" />
                          <rect x="16" y="0" width="1" height="1" fill="#0b1733" />
                          <rect x="17" y="0" width="1" height="1" fill="#0b1733" />
                          <rect x="18" y="0" width="1" height="1" fill="#0b1733" />
                          <rect x="19" y="0" width="1" height="1" fill="#0b1733" />
                          <rect x="20" y="0" width="1" height="1" fill="#0b1733" />
                          <rect x="0" y="1" width="1" height="1" fill="#0b1733" />
                          <rect x="6" y="1" width="1" height="1" fill="#0b1733" />
                          <rect x="8" y="1" width="1" height="1" fill="#0b1733" />
                          <rect x="9" y="1" width="1" height="1" fill="#0b1733" />
                          <rect x="10" y="1" width="1" height="1" fill="#0b1733" />
                          <rect x="11" y="1" width="1" height="1" fill="#0b1733" />
                          <rect x="12" y="1" width="1" height="1" fill="#0b1733" />
                          <rect x="14" y="1" width="1" height="1" fill="#0b1733" />
                          <rect x="20" y="1" width="1" height="1" fill="#0b1733" />
                          <rect x="0" y="2" width="1" height="1" fill="#0b1733" />
                          <rect x="2" y="2" width="1" height="1" fill="#0b1733" />
                          <rect x="3" y="2" width="1" height="1" fill="#0b1733" />
                          <rect x="4" y="2" width="1" height="1" fill="#0b1733" />
                          <rect x="6" y="2" width="1" height="1" fill="#0b1733" />
                          <rect x="7" y="2" width="1" height="1" fill="#0b1733" />
                          <rect x="8" y="2" width="1" height="1" fill="#0b1733" />
                          <rect x="12" y="2" width="1" height="1" fill="#0b1733" />
                          <rect x="14" y="2" width="1" height="1" fill="#0b1733" />
                          <rect x="16" y="2" width="1" height="1" fill="#0b1733" />
                          <rect x="17" y="2" width="1" height="1" fill="#0b1733" />
                          <rect x="18" y="2" width="1" height="1" fill="#0b1733" />
                          <rect x="20" y="2" width="1" height="1" fill="#0b1733" />
                          <rect x="0" y="3" width="1" height="1" fill="#0b1733" />
                          <rect x="2" y="3" width="1" height="1" fill="#0b1733" />
                          <rect x="3" y="3" width="1" height="1" fill="#0b1733" />
                          <rect x="4" y="3" width="1" height="1" fill="#0b1733" />
                          <rect x="6" y="3" width="1" height="1" fill="#0b1733" />
                          <rect x="7" y="3" width="1" height="1" fill="#0b1733" />
                          <rect x="9" y="3" width="1" height="1" fill="#0b1733" />
                          <rect x="10" y="3" width="1" height="1" fill="#0b1733" />
                          <rect x="11" y="3" width="1" height="1" fill="#0b1733" />
                          <rect x="12" y="3" width="1" height="1" fill="#0b1733" />
                          <rect x="14" y="3" width="1" height="1" fill="#0b1733" />
                          <rect x="16" y="3" width="1" height="1" fill="#0b1733" />
                          <rect x="17" y="3" width="1" height="1" fill="#0b1733" />
                          <rect x="18" y="3" width="1" height="1" fill="#0b1733" />
                          <rect x="20" y="3" width="1" height="1" fill="#0b1733" />
                          <rect x="0" y="4" width="1" height="1" fill="#0b1733" />
                          <rect x="2" y="4" width="1" height="1" fill="#0b1733" />
                          <rect x="3" y="4" width="1" height="1" fill="#0b1733" />
                          <rect x="4" y="4" width="1" height="1" fill="#0b1733" />
                          <rect x="6" y="4" width="1" height="1" fill="#0b1733" />
                          <rect x="7" y="4" width="1" height="1" fill="#0b1733" />
                          <rect x="10" y="4" width="1" height="1" fill="#0b1733" />
                          <rect x="12" y="4" width="1" height="1" fill="#0b1733" />
                          <rect x="13" y="4" width="1" height="1" fill="#0b1733" />
                          <rect x="14" y="4" width="1" height="1" fill="#0b1733" />
                          <rect x="16" y="4" width="1" height="1" fill="#0b1733" />
                          <rect x="17" y="4" width="1" height="1" fill="#0b1733" />
                          <rect x="18" y="4" width="1" height="1" fill="#0b1733" />
                          <rect x="20" y="4" width="1" height="1" fill="#0b1733" />
                          <rect x="0" y="5" width="1" height="1" fill="#0b1733" />
                          <rect x="6" y="5" width="1" height="1" fill="#0b1733" />
                          <rect x="7" y="5" width="1" height="1" fill="#0b1733" />
                          <rect x="9" y="5" width="1" height="1" fill="#0b1733" />
                          <rect x="10" y="5" width="1" height="1" fill="#0b1733" />
                          <rect x="13" y="5" width="1" height="1" fill="#0b1733" />
                          <rect x="14" y="5" width="1" height="1" fill="#0b1733" />
                          <rect x="20" y="5" width="1" height="1" fill="#0b1733" />
                          <rect x="0" y="6" width="1" height="1" fill="#0b1733" />
                          <rect x="1" y="6" width="1" height="1" fill="#0b1733" />
                          <rect x="2" y="6" width="1" height="1" fill="#0b1733" />
                          <rect x="3" y="6" width="1" height="1" fill="#0b1733" />
                          <rect x="4" y="6" width="1" height="1" fill="#0b1733" />
                          <rect x="5" y="6" width="1" height="1" fill="#0b1733" />
                          <rect x="6" y="6" width="1" height="1" fill="#0b1733" />
                          <rect x="9" y="6" width="1" height="1" fill="#0b1733" />
                          <rect x="14" y="6" width="1" height="1" fill="#0b1733" />
                          <rect x="15" y="6" width="1" height="1" fill="#0b1733" />
                          <rect x="16" y="6" width="1" height="1" fill="#0b1733" />
                          <rect x="17" y="6" width="1" height="1" fill="#0b1733" />
                          <rect x="18" y="6" width="1" height="1" fill="#0b1733" />
                          <rect x="19" y="6" width="1" height="1" fill="#0b1733" />
                          <rect x="20" y="6" width="1" height="1" fill="#0b1733" />
                          <rect x="0" y="7" width="1" height="1" fill="#0b1733" />
                          <rect x="2" y="7" width="1" height="1" fill="#0b1733" />
                          <rect x="3" y="7" width="1" height="1" fill="#0b1733" />
                          <rect x="5" y="7" width="1" height="1" fill="#0b1733" />
                          <rect x="7" y="7" width="1" height="1" fill="#0b1733" />
                          <rect x="12" y="7" width="1" height="1" fill="#0b1733" />
                          <rect x="0" y="8" width="1" height="1" fill="#0b1733" />
                          <rect x="5" y="8" width="1" height="1" fill="#0b1733" />
                          <rect x="6" y="8" width="1" height="1" fill="#0b1733" />
                          <rect x="8" y="8" width="1" height="1" fill="#0b1733" />
                          <rect x="10" y="8" width="1" height="1" fill="#0b1733" />
                          <rect x="11" y="8" width="1" height="1" fill="#0b1733" />
                          <rect x="12" y="8" width="1" height="1" fill="#0b1733" />
                          <rect x="14" y="8" width="1" height="1" fill="#0b1733" />
                          <rect x="15" y="8" width="1" height="1" fill="#0b1733" />
                          <rect x="16" y="8" width="1" height="1" fill="#0b1733" />
                          <rect x="18" y="8" width="1" height="1" fill="#0b1733" />
                          <rect x="19" y="8" width="1" height="1" fill="#0b1733" />
                          <rect x="3" y="9" width="1" height="1" fill="#0b1733" />
                          <rect x="4" y="9" width="1" height="1" fill="#0b1733" />
                          <rect x="5" y="9" width="1" height="1" fill="#0b1733" />
                          <rect x="8" y="9" width="1" height="1" fill="#0b1733" />
                          <rect x="9" y="9" width="1" height="1" fill="#0b1733" />
                          <rect x="10" y="9" width="1" height="1" fill="#0b1733" />
                          <rect x="11" y="9" width="1" height="1" fill="#0b1733" />
                          <rect x="14" y="9" width="1" height="1" fill="#0b1733" />
                          <rect x="15" y="9" width="1" height="1" fill="#0b1733" />
                          <rect x="16" y="9" width="1" height="1" fill="#0b1733" />
                          <rect x="17" y="9" width="1" height="1" fill="#0b1733" />
                          <rect x="3" y="10" width="1" height="1" fill="#0b1733" />
                          <rect x="8" y="10" width="1" height="1" fill="#0b1733" />
                          <rect x="9" y="10" width="1" height="1" fill="#0b1733" />
                          <rect x="10" y="10" width="1" height="1" fill="#0b1733" />
                          <rect x="12" y="10" width="1" height="1" fill="#0b1733" />
                          <rect x="13" y="10" width="1" height="1" fill="#0b1733" />
                          <rect x="14" y="10" width="1" height="1" fill="#0b1733" />
                          <rect x="15" y="10" width="1" height="1" fill="#0b1733" />
                          <rect x="16" y="10" width="1" height="1" fill="#0b1733" />
                          <rect x="17" y="10" width="1" height="1" fill="#0b1733" />
                          <rect x="18" y="10" width="1" height="1" fill="#0b1733" />
                          <rect x="19" y="10" width="1" height="1" fill="#0b1733" />
                          <rect x="20" y="10" width="1" height="1" fill="#0b1733" />
                          <rect x="0" y="11" width="1" height="1" fill="#0b1733" />
                          <rect x="1" y="11" width="1" height="1" fill="#0b1733" />
                          <rect x="4" y="11" width="1" height="1" fill="#0b1733" />
                          <rect x="5" y="11" width="1" height="1" fill="#0b1733" />
                          <rect x="6" y="11" width="1" height="1" fill="#0b1733" />
                          <rect x="7" y="11" width="1" height="1" fill="#0b1733" />
                          <rect x="8" y="11" width="1" height="1" fill="#0b1733" />
                          <rect x="13" y="11" width="1" height="1" fill="#0b1733" />
                          <rect x="14" y="11" width="1" height="1" fill="#0b1733" />
                          <rect x="15" y="11" width="1" height="1" fill="#0b1733" />
                          <rect x="16" y="11" width="1" height="1" fill="#0b1733" />
                          <rect x="18" y="11" width="1" height="1" fill="#0b1733" />
                          <rect x="19" y="11" width="1" height="1" fill="#0b1733" />
                          <rect x="1" y="12" width="1" height="1" fill="#0b1733" />
                          <rect x="3" y="12" width="1" height="1" fill="#0b1733" />
                          <rect x="8" y="12" width="1" height="1" fill="#0b1733" />
                          <rect x="9" y="12" width="1" height="1" fill="#0b1733" />
                          <rect x="10" y="12" width="1" height="1" fill="#0b1733" />
                          <rect x="14" y="12" width="1" height="1" fill="#0b1733" />
                          <rect x="15" y="12" width="1" height="1" fill="#0b1733" />
                          <rect x="1" y="13" width="1" height="1" fill="#0b1733" />
                          <rect x="3" y="13" width="1" height="1" fill="#0b1733" />
                          <rect x="4" y="13" width="1" height="1" fill="#0b1733" />
                          <rect x="5" y="13" width="1" height="1" fill="#0b1733" />
                          <rect x="6" y="13" width="1" height="1" fill="#0b1733" />
                          <rect x="7" y="13" width="1" height="1" fill="#0b1733" />
                          <rect x="10" y="13" width="1" height="1" fill="#0b1733" />
                          <rect x="14" y="13" width="1" height="1" fill="#0b1733" />
                          <rect x="15" y="13" width="1" height="1" fill="#0b1733" />
                          <rect x="16" y="13" width="1" height="1" fill="#0b1733" />
                          <rect x="17" y="13" width="1" height="1" fill="#0b1733" />
                          <rect x="18" y="13" width="1" height="1" fill="#0b1733" />
                          <rect x="0" y="14" width="1" height="1" fill="#0b1733" />
                          <rect x="1" y="14" width="1" height="1" fill="#0b1733" />
                          <rect x="2" y="14" width="1" height="1" fill="#0b1733" />
                          <rect x="3" y="14" width="1" height="1" fill="#0b1733" />
                          <rect x="4" y="14" width="1" height="1" fill="#0b1733" />
                          <rect x="5" y="14" width="1" height="1" fill="#0b1733" />
                          <rect x="6" y="14" width="1" height="1" fill="#0b1733" />
                          <rect x="11" y="14" width="1" height="1" fill="#0b1733" />
                          <rect x="17" y="14" width="1" height="1" fill="#0b1733" />
                          <rect x="19" y="14" width="1" height="1" fill="#0b1733" />
                          <rect x="0" y="15" width="1" height="1" fill="#0b1733" />
                          <rect x="6" y="15" width="1" height="1" fill="#0b1733" />
                          <rect x="8" y="15" width="1" height="1" fill="#0b1733" />
                          <rect x="9" y="15" width="1" height="1" fill="#0b1733" />
                          <rect x="12" y="15" width="1" height="1" fill="#0b1733" />
                          <rect x="13" y="15" width="1" height="1" fill="#0b1733" />
                          <rect x="14" y="15" width="1" height="1" fill="#0b1733" />
                          <rect x="17" y="15" width="1" height="1" fill="#0b1733" />
                          <rect x="0" y="16" width="1" height="1" fill="#0b1733" />
                          <rect x="2" y="16" width="1" height="1" fill="#0b1733" />
                          <rect x="3" y="16" width="1" height="1" fill="#0b1733" />
                          <rect x="4" y="16" width="1" height="1" fill="#0b1733" />
                          <rect x="6" y="16" width="1" height="1" fill="#0b1733" />
                          <rect x="7" y="16" width="1" height="1" fill="#0b1733" />
                          <rect x="9" y="16" width="1" height="1" fill="#0b1733" />
                          <rect x="10" y="16" width="1" height="1" fill="#0b1733" />
                          <rect x="15" y="16" width="1" height="1" fill="#0b1733" />
                          <rect x="18" y="16" width="1" height="1" fill="#0b1733" />
                          <rect x="19" y="16" width="1" height="1" fill="#0b1733" />
                          <rect x="20" y="16" width="1" height="1" fill="#0b1733" />
                          <rect x="0" y="17" width="1" height="1" fill="#0b1733" />
                          <rect x="2" y="17" width="1" height="1" fill="#0b1733" />
                          <rect x="3" y="17" width="1" height="1" fill="#0b1733" />
                          <rect x="4" y="17" width="1" height="1" fill="#0b1733" />
                          <rect x="6" y="17" width="1" height="1" fill="#0b1733" />
                          <rect x="7" y="17" width="1" height="1" fill="#0b1733" />
                          <rect x="9" y="17" width="1" height="1" fill="#0b1733" />
                          <rect x="10" y="17" width="1" height="1" fill="#0b1733" />
                          <rect x="11" y="17" width="1" height="1" fill="#0b1733" />
                          <rect x="13" y="17" width="1" height="1" fill="#0b1733" />
                          <rect x="17" y="17" width="1" height="1" fill="#0b1733" />
                          <rect x="0" y="18" width="1" height="1" fill="#0b1733" />
                          <rect x="2" y="18" width="1" height="1" fill="#0b1733" />
                          <rect x="3" y="18" width="1" height="1" fill="#0b1733" />
                          <rect x="4" y="18" width="1" height="1" fill="#0b1733" />
                          <rect x="6" y="18" width="1" height="1" fill="#0b1733" />
                          <rect x="8" y="18" width="1" height="1" fill="#0b1733" />
                          <rect x="9" y="18" width="1" height="1" fill="#0b1733" />
                          <rect x="10" y="18" width="1" height="1" fill="#0b1733" />
                          <rect x="11" y="18" width="1" height="1" fill="#0b1733" />
                          <rect x="13" y="18" width="1" height="1" fill="#0b1733" />
                          <rect x="17" y="18" width="1" height="1" fill="#0b1733" />
                          <rect x="0" y="19" width="1" height="1" fill="#0b1733" />
                          <rect x="6" y="19" width="1" height="1" fill="#0b1733" />
                          <rect x="7" y="19" width="1" height="1" fill="#0b1733" />
                          <rect x="9" y="19" width="1" height="1" fill="#0b1733" />
                          <rect x="10" y="19" width="1" height="1" fill="#0b1733" />
                          <rect x="16" y="19" width="1" height="1" fill="#0b1733" />
                          <rect x="0" y="20" width="1" height="1" fill="#0b1733" />
                          <rect x="1" y="20" width="1" height="1" fill="#0b1733" />
                          <rect x="2" y="20" width="1" height="1" fill="#0b1733" />
                          <rect x="3" y="20" width="1" height="1" fill="#0b1733" />
                          <rect x="4" y="20" width="1" height="1" fill="#0b1733" />
                          <rect x="5" y="20" width="1" height="1" fill="#0b1733" />
                          <rect x="6" y="20" width="1" height="1" fill="#0b1733" />
                          <rect x="14" y="20" width="1" height="1" fill="#0b1733" />
                          <rect x="18" y="20" width="1" height="1" fill="#0b1733" />
                          <rect x="19" y="20" width="1" height="1" fill="#0b1733" />
                          <rect x="20" y="20" width="1" height="1" fill="#0b1733" />
                        </svg>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Also printed on</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm)" }}><input type="checkbox" defaultChecked="" style={{ width: "16px", height: "16px", accentColor: "#003087" }} />Invoice and receipt</label>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm)" }}><input type="checkbox" defaultChecked="" style={{ width: "16px", height: "16px", accentColor: "#003087" }} />Warranty card with QR</label>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm)" }}><input type="checkbox" defaultChecked="" style={{ width: "16px", height: "16px", accentColor: "#003087" }} />Order confirmation message</label>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm)" }}><input type="checkbox" defaultChecked="" style={{ width: "16px", height: "16px", accentColor: "#003087" }} />Customer account, per order</label>
                      </div>
                    </div>
                  </section>
                  <section className="pcard" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div className="psec" style={{ color: "#0a5bd0" }}>Version history</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {__list(v.vers).map((vr, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                            <span style={__sx(`width: 10px; height: 10px; margin-top: 5px; border-radius: var(--radius-full); background: ${vr?.c ?? ""}; flex-shrink: 0;`)} />
                            <div style={{ flexGrow: "1" }}>
                              <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{vr?.v} <span style={{ fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>· {vr?.d}</span></div>
                              <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{vr?.s}</div>
                            </div>
                          </div>
                        </React.Fragment>))}
                    </div>
                    <div style={{ padding: "12px 14px", borderRadius: "var(--radius-xl)", background: "#fff4e0", color: "#7a3b04", fontSize: "var(--text-xs-plus)" }}>Orders keep the version they were sold under. Changing the policy never changes an old customer’s warranty.</div>
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
