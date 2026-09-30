'use client';
// Generated from design/templates/purchase-stock/WarrantyClaims.dc.html by scripts/convert-design.mjs.
// Warranty claims & serials — Stock — Warranty claims.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

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
var STEPS = ['Received', 'Inspecting', 'Sent to brand', 'Repairing', 'Ready', 'Returned'];
var SC = { 0: ['#e0f2fe', '#075985'], 1: ['#fff4e0', '#a14f06'], 2: ['#f3e8ff', '#6d28d9'], 3: ['#fff4e0', '#a14f06'], 4: ['#e7f8f1', '#047857'], 5: ['#e2e8f0', '#334155'], rej: ['#ffece6', '#b83210'] };
var CL = [['WC-0318', 'Galaxy A55 5G', 'IMEI 350912118845201', 'Rahima K.', 'Screen flickers after 10 minutes', 1, 2], ['WC-0317', 'Redmi Note 13', 'IMEI 862210045517733', 'Tanvir A.', 'Battery drains in 4 hours', 2, 5], ['WC-0315', 'Laptop 14" i5', 'SN LP14-22A0917', 'Arif H.', 'Keyboard keys not working', 3, 8], ['WC-0314', 'Bluetooth speaker', 'SN SPK-88120', 'Nabila S.', 'No sound from left driver', 4, 6], ['WC-0312', 'Galaxy A35 5G', 'IMEI 350912118830122', 'Fahim R.', 'Charging port loose', 0, 1], ['WC-0309', 'Smart watch', 'SN SW-44109', 'Mitu D.', 'Strap broken', 'rej', 3], ['WC-0305', 'Redmi Note 13', 'IMEI 862210045501890', 'Sakib M.', 'Camera does not focus', 5, 11]];
var SN = [['350912118845201', 'Galaxy A55 5G', 'GRN-0931 · Star Tech Traders', 'Under claim', 'Rahima K.', '12 Feb 2027'], ['350912118845219', 'Galaxy A55 5G', 'GRN-0931 · Star Tech Traders', 'In stock', '—', 'Starts on sale'], ['350912118845227', 'Galaxy A55 5G', 'GRN-0931 · Star Tech Traders', 'Sold', 'Imran H.', '3 Sep 2027'], ['862210045517733', 'Redmi Note 13', 'GRN-0927 · Mobile Hub BD', 'Under claim', 'Tanvir A.', '20 Jan 2027'], ['862210045520018', 'Redmi Note 13', 'GRN-0927 · Mobile Hub BD', 'In stock', '—', 'Starts on sale'], ['LP14-22A0917', 'Laptop 14" i5', 'GRN-0919 · Byte Supply', 'Under claim', 'Arif H.', '8 May 2027'], ['SPK-88120', 'Bluetooth speaker', 'GRN-0880 · SoundMax', 'Returned', 'Nabila S.', '30 Nov 2026']];
var SNC = { 'Under claim': ['#fff4e0', '#a14f06'], 'In stock': ['#e7f8f1', '#047857'], Sold: ['#e0f2fe', '#075985'], Returned: ['#e2e8f0', '#334155'] };
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var tab = s.tab || this.props.tab || 'claims';
    var stg = s.stg || {};
    var stage = function (c) { return stg[c[0]] != null ? stg[c[0]] : c[5]; };
    var filt = s.filt || 'all';
    var sel = s.sel || 'WC-0318';
    var D = CL.filter(function (c) { return c[0] === sel; })[0] || CL[0];
    var ds = stage(D);
    var by = s.by || 'imei';
    var scans = s.scans || ['350912118845243', '350912118845250', '350912118845268'];
    var label = function (st) { return st === 'rej' ? 'Rejected' : STEPS[st]; };
    var open = CL.filter(function (c) { var x = stage(c); return x !== 'rej' && x < 5; }).length;
    var counts = { all: CL.length }; CL.forEach(function (c) { var x = stage(c); counts[x] = (counts[x] || 0) + 1; });
    var v = {
      tabs: pTabs(self, [{ k: 'claims', label: 'Warranty claims' }, { k: 'serials', label: 'Serial & IMEI register' }], tab, 'tab', { claims: open, serials: 1284 }),
      is_claims: tab === 'claims', is_serials: tab === 'serials',
      kOpen: String(open), kOpenSub: '2 waiting on the brand',
      newClaim: function () { toast(self, 'Look up the item first — the claim fills itself from the sale.'); },
      byOpts: [['inv', 'Invoice'], ['phone', 'Phone'], ['imei', 'Serial or IMEI']].map(function (x) { var on = x[0] === by; return { l: x[1], on: on, bg: on ? '#0b1733' : 'transparent', fg: on ? '#fff' : '#475569', pick: function () { self.setState({ by: x[0] }); } }; }),
      q: s.q != null ? s.q : '350912118845201', typeQ: function (e) { self.setState({ q: e.target.value }); },
      lookup: function () { self.setState({ hit: true }); toast(self, 'Found 1 sale. Warranty checked against the policy it was sold under.'); },
      hasHit: s.hit !== false, hitBd: '#86efac', hitBg: '#f0fdf4', hitFg: '#047857', hitSt: 'WITHIN WARRANTY', hitLeft: '4 months 24 days left',
      openClaim: function () { self.setState({ sel: 'WC-0318', tab: 'claims' }); toast(self, 'Claim WC-0318 is open for this IMEI.'); },
      fchips: [['all', 'All'], [0, 'Received'], [1, 'Inspecting'], [2, 'Sent to brand'], [3, 'Repairing'], [4, 'Ready'], [5, 'Returned'], ['rej', 'Rejected']].map(function (x) { var on = String(x[0]) === String(filt); return { l: x[1], c: counts[x[0]] || 0, on: on, cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ filt: x[0] }); } }; }),
      claims: CL.filter(function (c) { return filt === 'all' || String(stage(c)) === String(filt); }).map(function (c) { var x = stage(c); var col = SC[x]; var on = c[0] === sel; return { id: c[0], p: c[1], sn: c[2], c: c[3], i: c[4], st: label(x), sb: col[0], sf: col[1], d: c[6] + 'd', dc: c[6] > 7 ? '#b83210' : '#334155', rowBg: on ? '#f5f8ff' : 'transparent', pick: function () { self.setState({ sel: c[0] }); } }; }),
      dId: D[0], dP: D[1], dC: D[3], dI: D[4], dPill: { st: label(ds), sb: SC[ds][0], sf: SC[ds][1] },
      dCheck: 'Within warranty · policy v2 · proof: invoice + IMEI',
      steps: STEPS.map(function (l, i) { var done = ds !== 'rej' && i < ds, cur = ds !== 'rej' && i === ds; return { l: l, n: done ? '✓' : i + 1, dot: done ? '#10b981' : cur ? '#003087' : '#cbd5e1', line: done ? '#10b981' : '#e2e8f0', fg: done || cur ? '#0f172a' : '#94a3b8', when: done ? 'Done' : cur ? 'Now' : '' }; }),
      dMsg: ds === 'rej' ? 'SMS sent: claim rejected — strap damage is not covered.' : 'WhatsApp to ' + D[3] + ': “Your ' + D[1] + ' is now ' + label(ds).toLowerCase() + '.”',
      advLbl: ds === 'rej' || ds >= 5 ? 'Closed' : 'Move to: ' + STEPS[ds + 1],
      advance: function () { if (ds === 'rej' || ds >= 5) return; var n = assign({}, stg); n[D[0]] = ds + 1; self.setState({ stg: n }); toast(self, D[0] + ' moved to ' + STEPS[ds + 1] + '. Customer updated by WhatsApp.'); },
      reject: function () { var n = assign({}, stg); n[D[0]] = 'rej'; self.setState({ stg: n }); toast(self, D[0] + ' rejected. The reason was sent to the customer.', true); },
      byBrand: [['Samsung', 7], ['Xiaomi', 4], ['Laptops', 2], ['Audio', 2]].map(function (b) { return { l: b[0], n: b[1], w: b[1] / 7 * 100 + '%' }; }),
      sns: SN.map(function (r) { var c = SNC[r[3]]; return { no: r[0], p: r[1], b: r[2], st: r[3], sb: c[0], sf: c[1], c: r[4], e: r[5] }; }),
      scanN: 11 + scans.length, scanW: (11 + scans.length) / 20 * 100 + '%',
      scanIn: s.scanIn || '', typeScan: function (e) { self.setState({ scanIn: e.target.value }); },
      addScan: function () { var t = (s.scanIn || '').trim(); if (!t) { toast(self, 'Scan or type an IMEI first.', true); return; } if (scans.indexOf(t) >= 0) { toast(self, 'Already added — duplicates are blocked.', true); return; } self.setState({ scans: [t].concat(scans), scanIn: '' }); toast(self, 'Added. ' + (19 - scans.length - 11) + ' left to scan.'); },
      recent: scans.slice(0, 3).map(function (t) { return { t: t }; }),
      remind: mkSw(this, 'remind', true)
    };
    return assign(v, msgV(s));
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:'Poppins',system-ui,-apple-system,'Segoe UI',sans-serif;background:#e9eef5;color:#1e293b;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087}a:hover{color:#002a77}
.card{background:#ffffff;border-radius:12px;box-shadow:0 3px 10px 0 rgba(48,46,56,.06)}
.nav{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:8px;color:#475569;font-size:14px;font-weight:500;letter-spacing:.01em;text-decoration:none;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 300ms ease-in-out}
.nav:hover{background:#f1f5f9;color:#0f172a;text-decoration:none}
.nav.on{background:rgba(0,48,135,.08);color:#003087}
.navh{font-size:11px;line-height:16px;font-weight:600;letter-spacing:.08em;color:#64748b;padding:18px 12px 6px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:8px;border:0;font:inherit;font-size:14px;font-weight:500;letter-spacing:.025em;cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 200ms,border-color 200ms}
.btn:hover{text-decoration:none}
.btn:focus-visible,.nav:focus-visible,.ib:focus-visible,.tab:focus-visible,.chip:focus-visible,.step:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.soft{background:rgba(0,48,135,.08);color:#003087}.soft:hover{background:rgba(0,48,135,.16);color:#003087}
.line{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.line:hover{background:#f1f5f9;color:#1e293b}
.warnbtn{background:#b45309;color:#fff}.warnbtn:hover{background:#92400e;color:#fff}
.big{height:52px;padding:0 24px;font-size:15px}
.sm{height:36px;padding:0 12px;font-size:13px}
.ib{width:40px;height:40px;border-radius:999px;border:0;background:transparent;color:#475569;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.ib:hover{background:rgba(203,213,225,.35);color:#0f172a}
.inp{width:100%;height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;font:inherit;font-size:14px;color:#1e293b;transition:border-color 200ms}
.inp:hover{border-color:#94a3b8}.inp:focus{outline:none;border-color:#003087}
.inp::placeholder{color:#64748b}
.lbl{font-size:13px;line-height:18px;font-weight:500;color:#334155}
.tab{height:40px;padding:0 14px;border-radius:999px;border:0;background:transparent;font:inherit;font-size:13px;font-weight:500;color:#475569;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,color 200ms}
.tab:hover{background:#f1f5f9;color:#0f172a}
.tab.on{background:#003087;color:#fff}
.chip{height:40px;padding:0 14px;border-radius:999px;border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:13px;font-weight:500;color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,border-color 200ms,color 200ms}
.chip:hover{border-color:#94a3b8}
.chip.on{border-color:#003087;background:rgba(0,48,135,.08);color:#003087}
.th{font-size:12px;line-height:16px;font-weight:600;letter-spacing:.025em;text-transform:uppercase;color:#64748b;text-align:left;padding:12px 16px;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.td{padding:14px 16px;border-bottom:1px solid #eef2f6;font-size:14px;line-height:20px;vertical-align:middle}
.row{transition:background-color 200ms}.row:hover{background:#f8fafc}
.badge{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap}
.badge::before{content:"";width:6px;height:6px;border-radius:999px;background:currentColor}
.b-draft{background:#eef2f6;color:#475569}.b-approval{background:#fff4e0;color:#a14f06}.b-approved{background:#e0f2fe;color:#075985}
.b-ordered{background:rgba(0,48,135,.08);color:#003087}.b-partial{background:#fff1e6;color:#b4410c}.b-received{background:#e7f8f1;color:#047857}
.b-closed{background:#e2e8f0;color:#334155}.b-cancelled{background:#ffece6;color:#b83210}.b-over{background:#ffece6;color:#b83210}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.02em}
.fade{animation:gcFade 260ms cubic-bezier(0,0,.2,1)}
@keyframes gcFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.flash{animation:gcFlash 900ms ease-out}
@keyframes gcFlash{from{background:#e7f8f1}to{background:transparent}}
.scanline{animation:gcScan 1.8s ease-in-out infinite alternate}
@keyframes gcScan{from{transform:translateY(0)}to{transform:translateY(150px)}}

.sw{position:relative;width:48px;height:28px;border-radius:999px;border:0;background:#cbd5e1;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:999px;background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.25);transition:transform 200ms cubic-bezier(0,0,.2,1)}
.sw.on{background:#003087}.sw.on::after{transform:translateX(20px)}
.sw:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.b-live{background:#e7f8f1;color:#047857}.b-sched{background:#e0f2fe;color:#075985}.b-ended{background:#eef2f6;color:#475569}.b-paused{background:#fff4e0;color:#a14f06}
.t-member{background:#eef2f6;color:#475569}.t-silver{background:#e2e8f0;color:#334155}.t-gold{background:#fff4e0;color:#a14f06}.t-plat{background:rgba(0,48,135,.08);color:#003087}
.actc{border:1px solid transparent;transition:border-color 200ms,box-shadow 200ms}.actc:hover{border-color:#003087;box-shadow:0 6px 18px rgba(0,48,135,.12)}
.bn{font-family:'Hind Siliguri','Poppins',sans-serif}
.pulse{animation:gcPulse 1.6s ease-in-out infinite}
@keyframes gcPulse{0%,100%{opacity:1}50%{opacity:.45}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
.pcard{background:#fff;border:1px solid #e6eaf0;border-radius:16px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px -14px rgba(15,23,42,.10)}
.psec{font-size:11px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:#64748b}
.num{font-variant-numeric:tabular-nums}
.ai{height:30px;padding:0 10px;border-radius:8px;border:1px solid #d9d2fb;background:linear-gradient(135deg,#f5f3ff,#eef6ff);color:#5b21b6;font:inherit;font-size:12px;font-weight:600;display:inline-flex;align-items:center;gap:6px;cursor:pointer;transition:box-shadow 200ms,border-color 200ms}
.ai:hover{border-color:#a78bfa;box-shadow:0 4px 12px -6px rgba(91,33,182,.5)}
.ai:focus-visible{outline:3px solid rgba(124,58,237,.4);outline-offset:2px}
.abtn{height:32px;padding:0 12px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;font:inherit;font-size:12.5px;font-weight:500;color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.abtn:hover{background:#f1f5f9}
.ptabs{display:flex;gap:2px;padding:0 16px;border-bottom:1px solid #e6eaf0}
.ptab{position:relative;height:48px;padding:0 12px;border:0;background:transparent;font:inherit;font-size:13.5px;font-weight:500;color:#64748b;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.ptab:hover{color:#0f172a}.ptab.on{color:#003087;font-weight:600}
.ptab.on::after{content:"";position:absolute;left:8px;right:8px;bottom:-1px;height:2.5px;border-radius:3px 3px 0 0;background:#003087}
.pcnt{min-width:20px;height:20px;padding:0 6px;border-radius:999px;background:#eef2f6;color:#475569;font-size:11px;font-weight:600;display:inline-flex;align-items:center;justify-content:center}
.ptab.on .pcnt{background:rgba(0,48,135,.1);color:#003087}
.thumb{width:44px;height:44px;flex-shrink:0;border-radius:10px;border:1px solid #e6eaf0;display:flex;align-items:center;justify-content:center;font-weight:700;color:#003087}
`;

// ---- markup ----

export default class WarrantyClaimsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="WarrantyClaims">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1640px", background: "#eef2f7", padding: "12px", display: "flex", gap: "12px", overflow: "hidden" }}>
          <__Sidebar sticky="" active="stock-wclaims" />
          <main style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <__Topbar crumb="Stock" page={"Warranty claims & serial numbers"} placeholder="Search invoice, phone, serial or IMEI" />
            <div style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flexGrow: "1", fontSize: "14px", lineHeight: "20px", color: "#475569" }}>Find any sold item by invoice, phone, serial or IMEI. The system checks the warranty by itself and keeps the customer updated.</div>
                <__Link href="/warranty-policies" className="btn line">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    <path d="M10 9H8" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                  </svg>
                  <span>Warranty policies</span>
                </__Link>
                <button type="button" className="btn solid" onClick={v.newClaim}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  <span>New claim</span>
                </button>
              </div>
              {v.hasMsg ? (<>
                <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: 14px; font-weight: 500;`)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{v.msg}</span>
                </div>
              </>) : null}
              <div style={{ display: "flex", gap: "16px" }}>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#003087" }}>{v.kOpen}</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Open claims</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>{v.kOpenSub}</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#047857" }}>6.4 days</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Average turnaround</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Promise: 7–15 days</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#ffece6", color: "#b83210", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m4.9 4.9 14.2 14.2" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#b83210" }}>3</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Rejected this month</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>All with a reason sent</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "12px", background: "#eef2f6", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                      <path d="m3.3 7 8.7 5 8.7-5" />
                      <path d="M12 22V12" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "26px", lineHeight: "34px", fontWeight: "700", color: "#0f172a" }}>1,284</div>
                    <div style={{ fontSize: "13px", lineHeight: "18px", color: "#475569" }}>Under warranty now</div>
                    <div style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Units sold with a warranty</div>
                  </div>
                </div>
              </div>
              <section className="pcard" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ display: "inline-flex", padding: "3px", borderRadius: "999px", background: "#eef2f6" }}>
                    {__list(v.byOpts).map((by, $index) => (<React.Fragment key={$index}>
                        <button type="button" onClick={by?.pick} aria-pressed={by?.on} style={__sx(`height: 34px; padding: 0 14px; border: 0; border-radius: 999px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; background: ${by?.bg ?? ""}; color: ${by?.fg ?? ""};`)}>{by?.l}</button>
                      </React.Fragment>))}
                  </div>
                  <label style={{ position: "relative", flexGrow: "1", display: "block" }}>
                    <span style={{ position: "absolute", left: "14px", top: "12px", color: "#64748b" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                    </span>
                    <input className="inp mono" value={v.q} onInput={v.typeQ} onChange={v.typeQ} aria-label="Look up" style={{ paddingLeft: "44px", height: "46px", fontSize: "15px" }} />
                  </label>
                  <button type="button" className="btn solid" onClick={v.lookup}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                      <path d="M8 7v10" />
                      <path d="M12 7v10" />
                      <path d="M17 7v10" />
                    </svg>
                    <span>Check warranty</span>
                  </button>
                </div>
                {v.hasHit ? (<>
                  <div className="fade" style={__sx(`display: flex; align-items: center; gap: 18px; padding: 16px 18px; border-radius: 14px; border: 1.5px solid ${v.hitBd ?? ""}; background: ${v.hitBg ?? ""};`)}>
                    <span className="thumb" style={{ width: "52px", height: "52px", background: "#fff" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                        <path d="M12 18h.01" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: "14px", fontSize: "13px" }}>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>Galaxy A55 5G · 8/256 GB</div>
                        <div className="mono" style={{ color: "#475569" }}>IMEI 350912118845201</div>
                      </div>
                      <div>
                        <div style={{ color: "#64748b" }}>Customer</div>
                        <div style={{ fontWeight: "600" }}>Rahima K. · 017••••4521</div>
                      </div>
                      <div>
                        <div style={{ color: "#64748b" }}>Sold</div>
                        <div style={{ fontWeight: "600" }}>INV-24817 · 12 Feb 2026</div>
                      </div>
                      <div>
                        <div style={{ color: "#64748b" }}>Policy (as sold)</div>
                        <div style={{ fontWeight: "600" }}>Smartphone brand warranty v2</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: "0" }}>
                      <div style={__sx(`font-size: 12px; font-weight: 600; color: ${v.hitFg ?? ""};`)}>{v.hitSt}</div>
                      <div style={__sx(`font-size: 18px; font-weight: 700; color: ${v.hitFg ?? ""};`)}>{v.hitLeft}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Ends 12 Feb 2027</div>
                    </div>
                    <button type="button" className="btn solid" onClick={v.openClaim}>Open a claim</button>
                  </div>
                </>) : null}
              </section>
              <section className="pcard" style={{ overflow: "hidden" }}>
                <div className="ptabs" role="tablist">
                  {__list(v.tabs).map((tb, $index) => (<React.Fragment key={$index}>
                      <button type="button" role="tab" className={tb?.pcls} aria-selected={tb?.on} onClick={tb?.pick}>{tb?.label}{tb?.hasCount ? (<>
  <span className="pcnt">{tb?.count}</span>
</>) : null}</button>
                    </React.Fragment>))}
                </div>
                {v.is_claims ? (<>
                  <div className="fade">
                    <div style={{ display: "flex" }}>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", padding: "14px 16px", borderBottom: "1px solid #eef2f6" }}>
                          {__list(v.fchips).map((fc, $index) => (<React.Fragment key={$index}>
                              <button type="button" className={fc?.cls} onClick={fc?.pick} aria-pressed={fc?.on} style={{ height: "34px" }}>{fc?.l}<span style={{ fontSize: "11px", opacity: ".7" }}>{fc?.c}</span></button>
                            </React.Fragment>))}
                        </div>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr>
                              <th className="th">Claim</th>
                              <th className="th">Product</th>
                              <th className="th">Customer</th>
                              <th className="th">Issue</th>
                              <th className="th">Status</th>
                              <th className="th">Open</th>
                            </tr>
                          </thead>
                          <tbody>
                            {__list(v.claims).map((cl, $index) => (<React.Fragment key={$index}>
                                <tr className="row" onClick={cl?.pick} style={__sx(`cursor: pointer; background: ${cl?.rowBg ?? ""};`)}>
                                  <td className="td mono" style={{ fontWeight: "700" }}>{cl?.id}</td>
                                  <td className="td">
                                    <div style={{ fontWeight: "600" }}>{cl?.p}</div>
                                    <div className="mono" style={{ fontSize: "12px", color: "#64748b" }}>{cl?.sn}</div>
                                  </td>
                                  <td className="td" style={{ color: "#334155" }}>{cl?.c}</td>
                                  <td className="td" style={{ color: "#334155", maxWidth: "180px" }}>{cl?.i}</td>
                                  <td className="td">
                                    <span style={__sx(`display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: ${cl?.sb ?? ""}; color: ${cl?.sf ?? ""}; white-space: nowrap;`)}>{cl?.st}</span>
                                  </td>
                                  <td className="td num" style={__sx(`color: ${cl?.dc ?? ""}; font-weight: 600;`)}>{cl?.d}</td>
                                </tr>
                              </React.Fragment>))}
                          </tbody>
                        </table>
                      </div>
                      <aside style={{ width: "400px", flexShrink: "0", borderLeft: "1px solid #eef2f6", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", background: "#fbfcfe" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ flexGrow: "1" }}>
                            <div className="mono" style={{ fontSize: "18px", fontWeight: "700" }}>{v.dId}</div>
                            <div style={{ fontSize: "13px", color: "#64748b" }}>{v.dP} · {v.dC}</div>
                          </div>
                          <span style={__sx(`display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: ${v.dPill?.sb ?? ""}; color: ${v.dPill?.sf ?? ""}; white-space: nowrap;`)}>{v.dPill?.st}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                          {__list(v.steps).map((sp, $index) => (<React.Fragment key={$index}>
                              <div style={{ display: "flex", gap: "12px", alignItems: "stretch" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <span style={__sx(`width: 22px; height: 22px; border-radius: 999px; background: ${sp?.dot ?? ""}; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center;`)}>{sp?.n}</span>
                                  <span style={__sx(`width: 2px; flex-grow: 1; background: ${sp?.line ?? ""}; min-height: 12px;`)} />
                                </div>
                                <div style={{ paddingBottom: "10px" }}>
                                  <div style={__sx(`font-size: 13.5px; font-weight: 600; color: ${sp?.fg ?? ""};`)}>{sp?.l}</div>
                                  <div style={{ fontSize: "12px", color: "#64748b" }}>{sp?.when}</div>
                                </div>
                              </div>
                            </React.Fragment>))}
                        </div>
                        <div style={{ padding: "12px 14px", borderRadius: "12px", background: "#fff", border: "1px solid #e6eaf0", fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "#047857", fontWeight: "600" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="10" />
  <path d="m9 12 2 2 4-4" />
</svg>{v.dCheck}</div>
                          <div style={{ color: "#334155" }}><b>Issue:</b> {v.dI}</div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <span style={{ width: "64px", height: "48px", borderRadius: "8px", background: "linear-gradient(160deg,#475569,#0f172a)" }} />
                            <span style={{ width: "64px", height: "48px", borderRadius: "8px", background: "linear-gradient(160deg,#64748b,#1e293b)" }} />
                          </div>
                        </div>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Decision</span>
                          <select className="inp" aria-label="Decision">
                            <option>Repair (policy step 1)</option>
                            <option>Replace — sends to Returns</option>
                            <option>Refund — sends to Returns</option>
                            <option>Store credit</option>
                            <option>Reject with reason</option>
                          </select>
                        </label>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "12px", background: "#dcfce7", color: "#14532d", fontSize: "12.5px" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                          </svg>
                          <span style={{ flexGrow: "1" }}>{v.dMsg}</span>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button type="button" className="btn line" onClick={v.reject} style={{ flex: "1" }}>Reject</button>
                          <button type="button" className="btn solid" onClick={v.advance} style={{ flex: "2" }}>{v.advLbl}</button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <span className="psec">Claims by brand · 90 days</span>
                          {__list(v.byBrand).map((bb, $index) => (<React.Fragment key={$index}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                                <span style={{ width: "70px" }}>{bb?.l}</span>
                                <div style={{ flexGrow: "1", height: "8px", borderRadius: "999px", background: "#eef2f6" }}>
                                  <div style={__sx(`width: ${bb?.w ?? ""}; height: 100%; border-radius: 999px; background: #0a5bd0;`)} />
                                </div>
                                <span className="num" style={{ width: "20px", textAlign: "right", fontWeight: "600" }}>{bb?.n}</span>
                              </div>
                            </React.Fragment>))}
                        </div>
                      </aside>
                    </div>
                  </div>
                </>) : null}
                {v.is_serials ? (<>
                  <div className="fade">
                    <div style={{ display: "flex" }}>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderBottom: "1px solid #eef2f6" }}>
                          <span style={{ flexGrow: "1", fontSize: "13.5px", color: "#475569" }}>Every piece with its own number — from the day it arrives to the day its warranty ends.</span>
                          <button type="button" className="btn line sm">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                              <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
                              <rect x="6" y="14" width="12" height="8" rx="1" />
                            </svg>
                            <span>Print warranty cards</span>
                          </button>
                          <button type="button" className="btn line sm">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <path d="m7 10 5 5 5-5" />
                              <path d="M12 15V3" />
                            </svg>
                            <span>CSV</span>
                          </button>
                        </div>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr>
                              <th className="th">Serial / IMEI</th>
                              <th className="th">Product</th>
                              <th className="th">Batch · supplier</th>
                              <th className="th">Status</th>
                              <th className="th">Customer</th>
                              <th className="th">Warranty ends</th>
                            </tr>
                          </thead>
                          <tbody>
                            {__list(v.sns).map((sr, $index) => (<React.Fragment key={$index}>
                                <tr className="row">
                                  <td className="td mono" style={{ fontWeight: "600" }}>{sr?.no}</td>
                                  <td className="td">{sr?.p}</td>
                                  <td className="td" style={{ color: "#475569" }}>{sr?.b}</td>
                                  <td className="td">
                                    <span style={__sx(`display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: ${sr?.sb ?? ""}; color: ${sr?.sf ?? ""}; white-space: nowrap;`)}>{sr?.st}</span>
                                  </td>
                                  <td className="td" style={{ color: "#334155" }}>{sr?.c}</td>
                                  <td className="td">{sr?.e}</td>
                                </tr>
                              </React.Fragment>))}
                          </tbody>
                        </table>
                      </div>
                      <aside style={{ width: "380px", flexShrink: "0", borderLeft: "1px solid #eef2f6", padding: "20px", display: "flex", flexDirection: "column", gap: "14px", background: "#fbfcfe" }}>
                        <div style={{ fontSize: "16px", fontWeight: "600" }}>Add numbers for received goods</div>
                        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Goods received</span>
                          <select className="inp" aria-label="Received batch">
                            <option>GRN-0931 · Galaxy A55 5G · 20 pcs</option>
                            <option>GRN-0927 · Redmi Note 13 · 12 pcs</option>
                            <option>{"GRN-0919 · Laptop 14\" · 6 pcs"}</option>
                          </select>
                          <span style={{ fontSize: "12px", lineHeight: "16px", color: "#64748b" }}>Only products set to keep serial or IMEI numbers show here</span>
                        </label>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                            <span>Scanned</span>
                            <b>{v.scanN} of 20</b>
                          </div>
                          <div style={{ height: "10px", borderRadius: "999px", background: "#eef2f6", overflow: "hidden" }}>
                            <div style={__sx(`width: ${v.scanW ?? ""}; height: 100%; background: #10b981; border-radius: 999px;`)} />
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input className="inp mono" value={v.scanIn} onInput={v.typeScan} onChange={v.typeScan} aria-label="Scan IMEI" placeholder="Scan or type IMEI 1" />
                          <button type="button" className="btn solid" onClick={v.addScan}>Add</button>
                        </div>
                        <div style={{ fontSize: "12.5px", color: "#64748b" }}>Dual-SIM phones ask for IMEI 2 right after. Duplicates are blocked.</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {__list(v.recent).map((rc, $index) => (<React.Fragment key={$index}>
                              <div className="mono" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", padding: "8px 10px", borderRadius: "8px", background: "#fff", border: "1px solid #eef2f6" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>{rc?.t}</div>
                            </React.Fragment>))}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                          <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "10px", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                            </svg>
                          </span>
                          <div style={{ flexGrow: "1" }}>
                            <div style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "600", color: "#0f172a" }}>Warranty ending reminder</div>
                            <div style={{ fontSize: "13px", lineHeight: "18px", color: "#64748b" }}>SMS the customer 30 days before it ends</div>
                          </div>
                          <button type="button" role="switch" aria-checked={v.remind?.on} aria-label="Warranty ending reminder" className={v.remind?.cls} onClick={v.remind?.toggle} />
                        </div>
                      </aside>
                    </div>
                  </div>
                </>) : null}
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
