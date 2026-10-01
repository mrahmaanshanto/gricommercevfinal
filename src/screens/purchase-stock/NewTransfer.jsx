'use client';
// Generated from design/templates/purchase-stock/NewTransfer.dc.html by scripts/convert-design.mjs.
// NewTransfer — Purchase & Stock module — New transfer.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { PageHeader as __PageHeader, PhoneActionBar as __PhoneActionBar, useIsPhone as __useIsPhone } from '@/components/ui';
import { toast as __toast, confirmDialog as __confirm } from '@/runtime/ui';
import { STOCK_PLACES, getStockPlaces, placeName } from '@/lib/locations';
import { CATALOG, productBy, stockAt, getMoves } from '@/lib/stock';
import { getHolds } from '@/lib/stockHolds';
import { addTransfer } from '@/lib/transfers';

// ---- form helpers: required marker, field error text, invalid attributes, focus the first error ----
function __Req() { return <span aria-hidden="true" style={{ color: 'var(--text-danger)' }}> *</span>; }
function __Err({ id, msg }) { return msg ? <span id={id} style={{ display: 'block', fontSize: 'var(--text-xs)', lineHeight: '16px', color: 'var(--text-danger)' }}>{msg}</span> : null; }
function __inv(err, id) { return err ? { 'aria-invalid': 'true', 'aria-describedby': id } : {}; }
function __focusSoon(id) { setTimeout(function () { var el = document.getElementById(id); if (el) el.focus(); }, 0); }
function __without(o, k) { var r = {}; for (var x in (o || {})) if (x !== k) r[x] = o[x]; return r; }

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function flashMsg(self, msg, bad, patch) { clearTimeout(self.t); var p = patch || {}; p.msg = msg; p.bad = !!bad; self.setState(p); self.t = setTimeout(function () { self.setState({ flash: null }); }, 900); }
function msgVals(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#ffece6' : '#e7f8f1', msgFg: s.bad ? '#8a2a0c' : '#065f46' }; }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
// Places come from src/lib/locations.js, products from the catalogue; "Have here" is what is free to
// sell at the sender. Sending saves the transfer (src/lib/transfers.js); it is scanned in on Transfers.
var LOCS = STOCK_PLACES;
var TP = CATALOG.map(function (p) { return { sku: p.sku, name: p.name, code: p.sku + ' · ' + p.variant, barcode: p.barcode, cost: p.wholesale }; });
var SCAN = ['SK-SUN-50', 'CL-TEE-BM', 'SK-SUN-50', 'EL-EAR-PRO'].map(function (sku) { return TP.findIndex(function (x) { return x.sku === sku; }); });
class Component extends DCLogic {
  componentDidMount() {
    // live places, and ?from=<place> / ?to=<place> from a link (Warehouses, Branches: "New transfer")
    var locs = getStockPlaces(), q = new URLSearchParams(window.location.search), p = { holds: getHolds(), moves: getMoves(), locs: locs };
    var want = function (k) { var v = q.get(k); v = v ? placeName(v) : ''; return v && locs.indexOf(v) >= 0 ? v : ''; };
    var from = want('from') || 'Central Warehouse', to = want('to');
    if (want('from')) p.from = from;
    if (to && to !== from) p.to = to;
    else if (from === 'Dhanmondi branch' || locs.indexOf('Dhanmondi branch') < 0) p.to = locs.filter(function (x) { return x !== from; })[0] || '';
    this.setState(p);
  }
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var lines = s.lines || [{ i: SCAN[0], q: 12 }, { i: SCAN[1], q: 10 }];
    var sent = !!s.sent, errs = s.errs || {};
    var by = s.by != null ? s.by : 'Jamal (van driver)';
    var setL = function (x, extra) { self.setState(assign({ lines: x }, extra || {})); };
    var pcs = 0, val = 0, tooMany = false;
    var from0 = s.from != null ? s.from : 'Central Warehouse';
    var haveOf = function (p) { return from0 ? stockAt(p.sku, from0, s.holds || [], s.moves || [], null).available : 0; };
    var rows = lines.map(function (l, k) {
      var p = TP[l.i], have = haveOf(p); pcs += l.q; val += l.q * p.cost; var left = have - l.q; if (left < 0) tooMany = true;
      return { name: p.name, code: p.code, initial: p.name.charAt(0), have: have, qty: l.q, left: left, leftColor: left < 0 ? '#b83210' : '#0f172a', rowCls: s.flash === l.i ? 'row flash' : 'row',
        inc: function () { var x = lines.slice(); x[k] = { i: l.i, q: l.q + 1 }; setL(x); },
        dec: function () { var x = lines.slice(); x[k] = { i: l.i, q: Math.max(1, l.q - 1) }; setL(x); },
        remove: function () { var x = lines.slice(); x.splice(k, 1); setL(x); } };
    });
    var from = s.from != null ? s.from : 'Central Warehouse', to = s.to != null ? s.to : 'Dhanmondi branch';
    // Validate, show each problem under its field and focus the first one. "Save, send later" only needs the two places.
    var check = function (full) {
      var er = {}, first = null, add = function (k, id, m) { er[k] = m; if (!first) first = id; };
      if (!from) add('from', 'tr-from', 'Choose where the stock leaves from.');
      if (!to) add('to', 'tr-to', 'Choose where the stock is going.');
      else if (to === from) add('to', 'tr-to', 'Choose a different place from the sender.');
      if (full && lines.length === 0) add('items', 'tr-scan', 'Scan or add at least one item to send.');
      else if (full && tooMany) add('items', 'tr-scan', 'You are sending more than you have of one product. Lower the red number.');
      if (full && !by.trim()) add('by', 'tr-by', 'Enter who is carrying the items.');
      self.setState({ errs: er }); if (first) __focusSoon(first);
      return !first;
    };
    return assign({
      errs: errs, itemsErr: (lines.length === 0 || tooMany) ? errs.items : '', locs: s.locs || LOCS, by: by,
      byIn: function (e) { self.setState({ by: e.target.value, errs: __without(errs, 'by') }); },
      fromIn: function (e) { self.setState({ from: e.target.value, errs: __without(__without(errs, 'from'), 'to') }); },
      toIn: function (e) { self.setState({ to: e.target.value, errs: __without(errs, 'to') }); },
      from: from, to: to, swap: function () { self.setState({ from: to, to: from, errs: __without(__without(errs, 'from'), 'to') }); },
      lines: rows,
      scan: function (e) {
        var n = s.n || 0, q = e && e.target && e.target.value ? e.target.value.trim().toLowerCase() : '';
        var i = SCAN[n % SCAN.length];
        if (q) { var hit = productBy(q) || CATALOG.filter(function (x) { return (x.sku + ' ' + x.name + ' ' + x.variant).toLowerCase().indexOf(q) >= 0; })[0]; if (!hit) { flashMsg(self, 'No product matches “' + e.target.value.trim() + '”', true); return; } i = TP.findIndex(function (x) { return x.sku === hit.sku; }); e.target.value = ''; }
        var x = lines.slice(); var f = -1;
        x.forEach(function (l, k) { if (l.i === i) f = k; });
        if (f >= 0) x[f] = { i: i, q: x[f].q + 1 }; else x.push({ i: i, q: 1 });
        flashMsg(self, 'Beep — ' + TP[i].name + (f >= 0 ? ' +1' : ' added'), false, { lines: x, n: n + 1, flash: i });
      },
      prods: lines.length, pcs: pcs, val: '৳' + Math.round(val).toLocaleString('en-IN'), tooMany: tooMany,
      notSent: !sent, sent: sent,
      submit: function (e) {
        if (e && e.preventDefault) e.preventDefault(); if (sent || !check(true)) return;
        var t = addTransfer({ from: from, to: to, by: 'Karim', carrier: by.trim(), status: 'way', lines: lines.map(function (l) { return { sku: TP[l.i].sku, qty: l.q }; }) });
        self.setState({ sent: true, no: t.no }); __toast(t.no + ' sent · ' + pcs + ' pieces on the way to ' + to);
      },
      saveLater: function () {
        if (!check(false)) return;
        if (!lines.length) { __toast('Add at least one item before saving.', { tone: 'error' }); return; }
        var t = addTransfer({ from: from, to: to, by: 'Karim', carrier: by.trim(), status: 'draft', lines: lines.map(function (l) { return { sku: TP[l.i].sku, qty: l.q }; }) });
        __toast(t.no + ' saved. Send it from Transfers when the items are packed.');
        self.setState({ lines: [] });
      },
      no: s.no || '',
      doneText: pcs + ' pieces left ' + from + '. They will be added to ' + to + ' when the slip and items are scanned in.'
    }, msgVals(s));
  }
}

// The scan box: a shorter hint on phones, where the full one is cut off.
function ScanInput({ phonePlaceholder, placeholder, ...rest }) {
  const phone = __useIsPhone();
  return <input {...rest} placeholder={phone && phonePlaceholder ? phonePlaceholder : placeholder} />;
}

// ---- styles (from the design's <helmet>) ----

const CSS = `/* phones: rows of label + buttons wrap instead of running out of the card */
@media (max-width:640px){.gc-shell__content [style*="display:flex"]:not([role="tablist"]):not([style*="column"]),.gc-shell__content [style*="display: flex"]:not([role="tablist"]):not([style*="column"]){flex-wrap:wrap}.gc-shell__content select,.gc-shell__content input{min-width:0;max-width:100%}.gc-shell__content .mono,.gc-shell__content [class*="badge"]{overflow-wrap:anywhere}}

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
.inp[aria-invalid="true"],.stepbox[aria-invalid="true"]{border-color:var(--text-danger)!important}
.inp[aria-invalid="true"]:focus{border-color:var(--text-danger)}
@media (max-width:1023px){.gc-shell__content :has(> .gc-side){align-items:stretch!important}}
.locsel{width:100%;height:44px;margin-top:4px;padding:0 12px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-lg);font-weight:var(--weight-semibold);color:#0f172a;cursor:pointer}
.locsel:hover{border-color:#94a3b8}.locsel:focus{outline:none;border-color:#003087}
.locsel[aria-invalid="true"]{border-color:var(--text-danger)}
@media (max-width:767px){.tr-route{flex-direction:column;align-items:stretch!important}.tr-route>div{flex-basis:auto!important}.tr-route>.ib{align-self:center}.tr-scanrow{flex-direction:column}}
.fade{animation:gcFade 260ms cubic-bezier(0,0,.2,1)}
@keyframes gcFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.flash{animation:gcFlash 900ms ease-out}
@keyframes gcFlash{from{background:#e7f8f1}to{background:transparent}}
.scanline{animation:gcScan 1.8s ease-in-out infinite alternate}
@keyframes gcScan{from{transform:translateY(0)}to{transform:translateY(150px)}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}

/* phones: item cards line up with the scan box, the picture stays beside the name, place pickers use the standard select text */
@media (max-width:640px){
  .ntr-lines.gc-cards-on>tbody{padding:0}
  .ntr-lines td:first-child>div{flex-wrap:nowrap!important}
  .ntr-lines td:first-child>div>div{min-width:0}
  .locsel{font-size:var(--text-sm);font-weight:var(--weight-regular)}
}
`;

// ---- markup ----

export default class NewTransferScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="NewTransfer">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="stock-transfers" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Stock › Transfers" page="New transfer" placeholder="Search or scan any barcode" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <__PageHeader title="New transfer" />
              <form id="ntr-form" noValidate onSubmit={v.submit} aria-label="New transfer" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <section className="card tr-route" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ flexGrow: "1", flexBasis: "0", padding: "18px", borderRadius: "var(--radius-xl)", border: "2px solid #e2e8f0", display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ width: "48px", height: "48px", borderRadius: "var(--radius-xl)", background: "#fff1e6", color: "#b4410c", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                      <path d="M2 7h20" />
                    </svg>
                  </span>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <label htmlFor="tr-from" style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>SEND FROM<__Req /></label>
                    <select id="tr-from" className="locsel" value={v.from} onChange={v.fromIn} aria-required="true" {...__inv(v.errs?.from, "tr-from-err")}>
                      <option value="">Choose a place</option>
                      {__list(v.locs).map((l) => (<option key={l} value={l}>{l}</option>))}
                    </select>
                    <__Err id="tr-from-err" msg={v.errs?.from} />
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Stock goes down when you send</div>
                  </div>
                </div>
                <button type="button" className="ib" aria-label="Swap from and to" onClick={v.swap} style={{ width: "52px", height: "52px", border: "1px solid #cbd5e1" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M8 3 4 7l4 4" />
                    <path d="M4 7h16" />
                    <path d="m16 21 4-4-4-4" />
                    <path d="M20 17H4" />
                  </svg>
                </button>
                <div style={{ flexGrow: "1", flexBasis: "0", padding: "18px", borderRadius: "var(--radius-xl)", border: "2px solid #e2e8f0", display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ width: "48px", height: "48px", borderRadius: "var(--radius-xl)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                      <path d="M2 7h20" />
                    </svg>
                  </span>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <label htmlFor="tr-to" style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "var(--text-muted)" }}>SEND TO<__Req /></label>
                    <select id="tr-to" className="locsel" value={v.to} onChange={v.toIn} aria-required="true" {...__inv(v.errs?.to, "tr-to-err")}>
                      <option value="">Choose a place</option>
                      {__list(v.locs).map((l) => (<option key={l} value={l}>{l}</option>))}
                    </select>
                    <__Err id="tr-to-err" msg={v.errs?.to} />
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Stock goes up when they scan it in</div>
                  </div>
                </div>
              </section>
              <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
                <div style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "20px" }}>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "var(--radius-full)", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>1</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Scan the items you are sending</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Pack as you scan. Each beep adds one.</p>
                      </div>
                    </div>
                    <div className="tr-scanrow" style={{ display: "flex", gap: "12px" }}>
                      <label style={{ position: "relative", flexGrow: "1" }}>
                        <span style={{ position: "absolute", left: "16px", top: "15px", color: "#003087" }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                            <path d="M8 7v10" />
                            <path d="M12 7v10" />
                            <path d="M17 7v10" />
                          </svg>
                        </span>
                        <ScanInput id="tr-scan" className="inp" type="search" placeholder="Scan an item or type a SKU, then Enter" phonePlaceholder="Scan or type a SKU" aria-label="Scan an item to send" {...__inv(v.itemsErr, "tr-items-err")} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); v.scan(e); } }} style={{ height: "54px", paddingLeft: "50px", fontSize: "var(--text-sm-plus)", border: "2px solid #003087" }} />
                      </label>
                      <button type="button" className="btn solid big" onClick={() => v.scan()}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                          <circle cx="12" cy="13" r="3" />
                        </svg>
                        <span>Scan with camera</span>
                      </button>
                    </div>
                    {v.hasMsg ? (<>
                      <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-lg); background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: var(--text-sm); line-height: 20px; font-weight: var(--weight-medium);`)}>
                        <span style={{ flexShrink: "0" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                            <path d="M8 7v10" />
                            <path d="M12 7v10" />
                            <path d="M17 7v10" />
                          </svg>
                        </span>
                        <span>{v.msg}</span>
                      </div>
                    </>) : null}
                    <div className="gc-table-wrap">
                      <table className="ntr-lines" style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th className="th" style={{ paddingLeft: "0" }}>Product</th>
                            <th className="th" style={{ textAlign: "center" }}>Have here</th>
                            <th className="th">Sending</th>
                            <th className="th" style={{ textAlign: "center" }}>Left here</th>
                            <th className="th" style={{ width: "48px" }} />
                          </tr>
                        </thead>
                        <tbody>
                          {__list(v.lines).map((r, $index) => (<React.Fragment key={$index}>
                              <tr className={r?.rowCls}>
                                <td className="td" style={{ paddingLeft: "0" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "var(--weight-medium)" }}>{r?.initial}</span>
                                    <div>
                                      <div style={{ fontWeight: "var(--weight-medium)" }}>{r?.name}</div>
                                      <div className="mono" style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>{r?.code}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="td" style={{ textAlign: "center" }}>{r?.have}</td>
                                <td className="td">
                                  <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "#fff" }}>
                                    <button type="button" className="ib" aria-label={`Send fewer ${r?.name ?? ""}`} onClick={r?.dec} style={{ borderRadius: "0" }}>
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M5 12h14" />
                                      </svg>
                                    </button>
                                    <span style={{ minWidth: "44px", textAlign: "center", fontWeight: "var(--weight-medium)" }}>{r?.qty}</span>
                                    <button type="button" className="ib" aria-label={`Send more ${r?.name ?? ""}`} onClick={r?.inc} style={{ borderRadius: "0" }}>
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M5 12h14" />
                                        <path d="M12 5v14" />
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                                <td className="td" style={__sx(`text-align: center; font-weight: var(--weight-medium); color: ${r?.leftColor ?? ""};`)}>{r?.left}</td>
                                <td className="td">
                                  <button type="button" className="ib" aria-label={`Remove ${r?.name ?? ""}`} onClick={r?.remove}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M3 6h18" />
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2" />
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                            </React.Fragment>))}
                        </tbody>
                      </table>
                    </div>
                    <__Err id="tr-items-err" msg={v.itemsErr} />
                  </section>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ width: "32px", height: "32px", flexShrink: "0", borderRadius: "var(--radius-full)", background: "#003087", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>2</span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Who is taking it?</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>So you know who to call if something goes missing.</p>
                      </div>
                    </div>
                    <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px 20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label className="lbl" htmlFor="tr-by">Carried by<__Req /></label>
                        <input id="tr-by" className="inp" type="text" value={v.by} onChange={v.byIn} aria-required="true" {...__inv(v.errs?.by, "tr-by-err")} />
                        <__Err id="tr-by-err" msg={v.errs?.by} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label className="lbl" htmlFor="tr-date">Should arrive</label>
                        <input id="tr-date" className="inp" type="text" defaultValue="18 Sep 2026, before 6 PM" />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "1 / -1" }}>
                        <label className="lbl" htmlFor="tr-note">Note</label>
                        <input id="tr-note" className="inp" type="text" placeholder="Example: For the weekend sale" />
                      </div>
                    </div>
                  </section>
                </div>
                <aside className="gc-side" style={{ width: "340px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {v.notSent ? (<>
                    <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div>
                        <h2 style={{ margin: "0", fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Transfer summary</h2>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                        <span style={{ color: "#475569" }}>Products</span>
                        <span style={{ fontWeight: "var(--weight-medium)" }}>{v.prods}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                        <span style={{ color: "#475569" }}>Pieces</span>
                        <span style={{ fontWeight: "var(--weight-medium)" }}>{v.pcs}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Stock value</span>
                        <span style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{v.val}</span>
                      </div>
                      {v.tooMany ? (<>
                        <div className="fade" style={{ padding: "10px 12px", borderRadius: "var(--radius-lg)", background: "#ffece6", color: "#8a2a0c", fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>You are sending more than you have of one product. Check the red number.</div>
                      </>) : null}
                      <button type="submit" className="btn solid big" style={{ width: "100%" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                          <path d="M15 18H9" />
                          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                          <circle cx="17" cy="18" r="2" />
                          <circle cx="7" cy="18" r="2" />
                        </svg>
                        <span>Send and print slip</span>
                      </button>
                      <button type="button" className="btn line" style={{ width: "100%" }} onClick={v.saveLater}>Save, send later</button>
                      <__PhoneActionBar note={v.pcs + " pcs · " + v.val}><button type="submit" form="ntr-form" className="gc-btn gc-btn--solid">Send and print slip</button></__PhoneActionBar>
                      <p style={{ margin: "0", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>The slip has a barcode. The other side scans it, then scans the items in. Missing items are flagged at once.</p>
                    </section>
                  </>) : null}
                  {v.sent ? (<>
                    <section className="card fade" style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: "14px", alignItems: "center", textAlign: "center" }}>
                      <span style={{ width: "64px", height: "64px", borderRadius: "var(--radius-full)", background: "#e7f8f1", color: "var(--text-success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <h2 style={{ margin: "0", fontSize: "var(--text-xl)", lineHeight: "28px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>On the way</h2>
                      <p style={{ margin: "0", fontSize: "var(--text-sm)", lineHeight: "22px", color: "#475569" }}>{v.doneText}</p>
                      <div style={{ padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)" }}>
                        <svg width="160" height="34" viewBox="0 0 160 34" aria-hidden="true">
                          <rect x="0" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="2" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="6" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="9" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="13" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="15" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="20" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="24" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="27" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="31" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="35" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="40" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="45" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="48" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="54" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="58" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="64" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="67" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="71" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="73" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="75" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="77" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="79" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="84" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="89" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="92" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="96" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="99" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="101" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="103" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="107" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="110" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="114" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="118" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="120" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="122" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="124" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="127" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="129" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="133" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="138" y="0" width="3" height="34" fill="#0f172a" />
                          <rect x="142" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="144" y="0" width="2" height="34" fill="#0f172a" />
                          <rect x="147" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="151" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="154" y="0" width="1" height="34" fill="#0f172a" />
                          <rect x="158" y="0" width="2" height="34" fill="#0f172a" />
                        </svg>
                        <div className="mono" style={{ fontSize: "var(--text-xs)", color: "#334155" }}>{v.no}</div>
                      </div>
                      <__Link href="/transfers" className="btn line" style={{ width: "100%" }}>See all transfers</__Link>
                    </section>
                  </>) : null}
                </aside>
              </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
