'use client';
// Generated from design/templates/purchase-stock/StockCount.dc.html by scripts/convert-design.mjs.
// StockCount — Purchase & Stock module — Stock count.
// Edit freely: this file is now the source for the screen.
// Flow: choose the place (STOCK_PLACES) and what to count → start: selling is paused at that place
// (a switch turns it back on) → scan or type what is on the shelf → post the difference: a manager
// approves it with their PIN after seeing the summary, then each difference is saved as a stock move
// of kind 'count'. "Save and continue later" keeps the count in this browser.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { PageHeader as __PageHeader } from '@/components/ui';
import { toast as __toast, confirmDialog as __confirm } from '@/runtime/ui';
import { ManagerPin } from '@/components/ManagerPin';
import { STOCK_PLACES } from '@/lib/locations';
import { CATALOG, productBy, stockAt, getMoves, addMove } from '@/lib/stock';
import { getHolds } from '@/lib/stockHolds';
import { formatBDT, formatDateTime } from '@/lib/format';

// ---- logic (from the design's <script type="text/x-dc">) ----

function flashMsg(self, msg, bad, patch) { clearTimeout(self.t); var p = patch || {}; p.msg = msg; p.bad = !!bad; self.setState(p); self.t = setTimeout(function () { self.setState({ flash: null }); }, 900); }
function msgVals(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#ffece6' : '#e7f8f1', msgFg: s.bad ? '#8a2a0c' : '#065f46' }; }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
var DRAFT = 'gc.stock.count.draft';
var COUNTER = 'Karim';
var RACK = { Grocery: 'G', Clothing: 'C', 'Skin care': 'A', Electronics: 'E', Home: 'H' };
var CATS = CATALOG.reduce(function (a, p) { if (a.indexOf(p.cat) < 0) a.push(p.cat); return a; }, []);
var AREAS = [{ k: 'all', label: 'Whole place' }].concat(CATS.map(function (c) { return { k: c, label: c }; }));
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function readDraft() { try { return JSON.parse(window.localStorage.getItem(DRAFT)); } catch (e) { return null; } }
function writeDraft(d) { try { if (d) window.localStorage.setItem(DRAFT, JSON.stringify(d)); else window.localStorage.removeItem(DRAFT); } catch (e) { /* ignore */ } }
function cost(p) { return Math.round(p.wholesale * 0.85); }
class Component extends DCLogic {
  componentDidMount() {
    var d = readDraft(), p = { holds: getHolds(), moves: getMoves() };
    if (d && STOCK_PLACES.indexOf(d.place) >= 0) assign(p, { place: d.place, area: d.area || 'all', c: d.c || {}, pause: d.pause !== false, started: d.started, run: true });
    this.setState(p);
  }
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var place = s.place || STOCK_PLACES[0], area = s.area || 'all', c = s.c || {}, run = !!s.run, fin = s.fin || null, pause = s.pause !== false;
    var holds = s.holds || [], moves = s.moves || [];
    var prods = CATALOG.filter(function (p) { return (area === 'all' || p.cat === area) && (p.on[place] || stockAt(p.sku, place, holds, moves, null).onHand); });
    var setC = function (sku, v, extra) { var x = assign({}, c); if (v === null) delete x[sku]; else x[sku] = v; self.setState(assign({ c: x }, extra || {})); };
    var done = 0, match = 0, missP = 0, missV = 0, exP = 0, exV = 0, shortL = 0, overL = 0, diffs = [];
    var lines = prods.map(function (p, i) {
      var sys = stockAt(p.sku, place, holds, moves, null).onHand, v = c[p.sku], counted = v !== null && v !== undefined, unit = cost(p);
      var d = counted ? v - sys : 0;
      if (counted) { done++; if (d === 0) match++; else { diffs.push({ p: p, d: d, sys: sys, v: v }); if (d < 0) { shortL++; missP -= d; missV -= d * unit; } else { overL++; exP += d; exV += d * unit; } } }
      return { name: p.name, code: p.sku + ' · ' + p.variant, initial: p.name.charAt(0), rack: (RACK[p.cat] || 'R') + '-' + (i + 1), sys: sys, qty: v, counted: counted, notCounted: !counted,
        diff: !counted ? '—' : (d === 0 ? 'Match' : (d > 0 ? '+' + d : '−' + Math.abs(d))),
        dBadge: !counted ? '' : (d === 0 ? 'badge b-received' : (d > 0 ? 'badge b-approved' : 'badge b-cancelled')),
        value: !counted || d === 0 ? '—' : (d > 0 ? '+' : '−') + formatBDT(Math.abs(d) * unit),
        vColor: d < 0 ? '#b83210' : (d > 0 ? '#047857' : '#64748b'), rowCls: s.flash === p.sku ? 'row flash' : 'row',
        start: function () { setC(p.sku, 0); }, inc: function () { setC(p.sku, (v || 0) + 1); }, dec: function () { setC(p.sku, Math.max(0, (v || 0) - 1)); },
        type: function (e) { var n = e.target.value; setC(p.sku, n === '' ? 0 : Math.max(0, Math.round(Number(n) || 0))); } };
    });
    var net = exV - missV;
    var beep = function (p) { var x = assign({}, c); x[p.sku] = (x[p.sku] || 0) + 1; flashMsg(self, 'Beep — +1 ' + p.name, false, { c: x, flash: p.sku, code: '' }); };
    var save = function (patch) { var st = assign({ place: place, area: area, c: c, pause: pause, started: s.started }, patch || {}); writeDraft(st); };
    return assign({
      run: run, notRun: !run, place: place, places: STOCK_PLACES,
      onPlace: function (e) { self.setState({ place: e.target.value, c: {} }); },
      areas: mkChips(this, AREAS, area, 'area'), areaLabel: AREAS.filter(function (a) { return a.k === area; })[0].label,
      startCount: function () { var t = Date.now(); self.setState({ run: true, pause: true, c: {}, fin: null, started: t, msg: '' }); writeDraft({ place: place, area: area, c: {}, pause: true, started: t }); __toast('Count started at ' + place + ' · selling is paused there'); },
      startedText: s.started ? 'Started ' + formatDateTime(s.started) + ' by ' + COUNTER : '',
      pause: pause, pauseText: pause ? 'Selling is paused at ' + place + ' while counting' : 'Selling is on at ' + place + ' during this count',
      pauseHelp: pause ? 'POS and online orders cannot take stock from here until you post or cancel the count.' : 'Sales made now change the numbers you are counting. Count slow shelves only.',
      togglePause: function () { var n = !pause; self.setState({ pause: n }); save({ pause: n }); __toast(n ? 'Selling paused at ' + place : 'Selling is back on at ' + place); },
      cancel: function () { __confirm({ title: 'Cancel this count?', body: 'The numbers you counted are thrown away and selling starts again at ' + place + '.', confirmLabel: 'Cancel count', tone: 'danger' }).then(function (ok) { if (!ok) return; writeDraft(null); self.setState({ run: false, c: {}, msg: '', pause: true }); __toast('Count cancelled · selling is back on at ' + place); }); },
      code: s.code || '', codeIn: function (e) { self.setState({ code: e.target.value }); },
      codeKey: function (e) {
        if (e.key !== 'Enter') return; e.preventDefault();
        var q = (s.code || '').trim(); if (!q) return;
        var p = productBy(q) || prods.filter(function (x) { return (x.sku + ' ' + x.name + ' ' + x.variant).toLowerCase().indexOf(q.toLowerCase()) >= 0; })[0];
        if (!p || prods.indexOf(p) < 0) { flashMsg(self, '“' + q + '” is not in this count at ' + place + '.', true, { code: '' }); return; }
        beep(p);
      },
      lines: lines, done: done, all: lines.length, pct: (lines.length ? Math.round(done / lines.length * 100) : 0) + '%',
      scan: function () { if (!lines.length) return; var n = s.n || 0; var p = prods[[0, 0, 1, 2, 0, 3][n % 6] % prods.length]; self.setState({ n: n + 1 }); beep(p); },
      match: match, miss: missP + ' pcs · ' + formatBDT(missV), extra: exP + ' pcs · ' + formatBDT(exV), left: (lines.length - done) + ' products',
      net: (net < 0 ? '−' : '+') + formatBDT(Math.abs(net)), netColor: net < 0 ? '#b83210' : '#047857',
      notFinished: !fin, finished: !!fin,
      finish: function () {
        if (!done) { flashMsg(self, 'Count at least one product first.', true); return; }
        if (!diffs.length) { self.setState({ fin: { n: done, pcs: 0, by: '' }, run: false }); writeDraft(null); __toast('Count finished · everything matched. Selling is back on at ' + place); return; }
        self.setState({ ask: true });
      },
      saveLater: function () { save(); __toast('Count saved. Open Stock count again to carry on.'); },
      askOpen: !!s.ask, closeAsk: function () { self.setState({ ask: false }); },
      askReason: (<>
        <span style={{ display: 'block', marginBottom: 8 }}>Post the count at <b>{place}</b> ({AREAS.filter(function (a) { return a.k === area; })[0].label.toLowerCase()}):</span>
        <span style={{ display: 'block' }}>Short: {shortL} {shortL === 1 ? 'line' : 'lines'} · −{missP} pcs · −{formatBDT(missV)}</span>
        <span style={{ display: 'block' }}>Over: {overL} {overL === 1 ? 'line' : 'lines'} · +{exP} pcs · +{formatBDT(exV)}</span>
        <span style={{ display: 'block', marginTop: 4 }}><b>Net {(net < 0 ? '−' : '+') + formatBDT(Math.abs(net))}</b> · {match} matched · {lines.length - done} not counted stay as they are</span>
      </>),
      approve: function (manager) {
        var ref = 'CNT-' + Date.now().toString(36).toUpperCase();
        diffs.forEach(function (x) { addMove({ sku: x.p.sku, place: place, qty: x.d, kind: 'count', reason: 'Count difference · system ' + x.sys + ', counted ' + x.v, by: COUNTER + ' · approved by ' + manager, ref: ref }); });
        writeDraft(null);
        self.setState({ ask: false, run: false, pause: true, moves: getMoves(), fin: { n: done, pcs: missP + exP, by: manager, lines: diffs.length } });
        __toast(diffs.length + ' count differences posted at ' + place + ' · approved by ' + manager);
      },
      again: function () { self.setState({ fin: null, c: {}, msg: '' }); },
      doneText: fin ? fin.n + ' products counted at ' + place + '. ' + (fin.pcs ? fin.pcs + ' pieces of difference on ' + fin.lines + ' lines were posted as stock changes, approved by ' + fin.by + '.' : 'Everything matched.') + ' Selling is back on.' : ''
    }, msgVals(s));
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `section.card th{white-space:normal}

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
.sc-pause{display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:var(--radius-xl);background:var(--fill-warning-soft);color:var(--text-warning);font-size:var(--text-sm)}
.sc-pause.is-off{background:var(--surface-subtle);color:var(--text-body)}
.sc-pause b{font-weight:var(--weight-medium)}
.sc-pause small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sc-pause__sw{display:flex;align-items:center;gap:10px;margin-left:auto;white-space:nowrap;font-size:var(--text-xs);font-weight:var(--weight-medium)}
.sc-qty{width:56px;height:36px;border:0;border-left:1px solid #cbd5e1;border-right:1px solid #cbd5e1;text-align:center;font:inherit;font-weight:var(--weight-medium);background:transparent;color:inherit;-moz-appearance:textfield}
.sc-qty::-webkit-outer-spin-button,.sc-qty::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.sc-qty:focus{outline:2px solid var(--primary);outline-offset:-2px}
.sc-sum{display:grid;grid-template-columns:1fr auto;gap:6px 16px;margin:0;font-size:var(--text-sm)}
.sc-sum dd{margin:0;text-align:right;font-weight:var(--weight-medium)}
.sc-setup{display:flex;flex-direction:column;gap:18px;max-width:640px}
.sc-setup .gc-select{max-width:360px}
section.card .td{white-space:normal}
section.card .td .badge{white-space:nowrap}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
`;

// ---- markup ----

const SCAN_SVG = (size) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M8 7v10" /><path d="M12 7v10" /><path d="M17 7v10" />
  </svg>
);

export default class StockCountScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="StockCount">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="stock-count" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Stock" page="Stock count" placeholder="Search or scan any barcode" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <__PageHeader title="Stock count" actions={<__Link href="/stock-adjustments" className="gc-btn gc-btn--neutral"><__Icon name="sliders-horizontal" width="18" height="18" aria-hidden="true" /> Stock adjustments</__Link>} />
              {v.notRun && v.notFinished ? (
                <section className="card sc-setup" style={{ padding: "24px" }} aria-labelledby="sc-setup-h">
                  <div>
                    <h2 id="sc-setup-h" style={{ margin: "0", fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Start a stock count</h2>
                    <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "#475569" }}>Choose where you are counting. Selling is paused there while you count, so the numbers do not move.</p>
                  </div>
                  <div>
                    <label className="gc-label" htmlFor="sc-place">Where are you counting? *</label>
                    <select id="sc-place" className="gc-input gc-select" value={v.place} onChange={v.onPlace}>
                      {__list(v.places).map((x) => (<option key={x}>{x}</option>))}
                    </select>
                  </div>
                  <div>
                    <span className="gc-label" id="sc-area-l">What are you counting?</span>
                    <div role="group" aria-labelledby="sc-area-l" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {__list(v.areas).map((a, $index) => (<button key={$index} type="button" className={a?.cls} aria-pressed={a?.on} onClick={a?.pick}>{a?.label}</button>))}
                    </div>
                  </div>
                  <p className="gc-help" style={{ margin: 0 }}>{v.all} products to count at {v.place}.</p>
                  <div><button type="button" className="gc-btn gc-btn--solid" onClick={v.startCount} disabled={!v.all}><__Icon name="clipboard-check" width="18" height="18" aria-hidden="true" /> Start count</button></div>
                </section>
              ) : null}
              {v.run ? (<>
              <section className="card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <span className="chip on" style={{ cursor: "default" }}>
                  <__Icon name="store" width="16" height="16" aria-hidden="true" />
                  <span>{v.place}</span>
                </span>
                {__list(v.areas).map((a, $index) => (<React.Fragment key={$index}>
                    <button type="button" className={a?.cls} aria-pressed={a?.on} onClick={a?.pick}>{a?.label}</button>
                  </React.Fragment>))}
                <div style={{ flexGrow: "1" }} />
                <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>{v.startedText}</span>
                <button type="button" className="btn line sm" onClick={v.cancel}>Cancel count</button>
              </section>
              <div className={v.pause ? "sc-pause" : "sc-pause is-off"} role="status">
                <__Icon name={v.pause ? "circle-pause" : "circle-play"} width="22" height="22" aria-hidden="true" />
                <div><b>{v.pauseText}</b><small>{v.pauseHelp}</small></div>
                <label className="sc-pause__sw">
                  <span>Pause selling</span>
                  <button type="button" role="switch" aria-checked={v.pause} aria-label={`Pause selling at ${v.place}`} className="gc-switch" onClick={v.togglePause}><span className="gc-switch__knob" /></button>
                </label>
              </div>
              <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
                <div style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "20px" }}>
                  <section className="card" style={{ padding: "24px", display: "flex", gap: "24px", alignItems: "stretch", flexWrap: "wrap" }}>
                    <div style={{ flexGrow: "1", flexBasis: "320px", display: "flex", flexDirection: "column", gap: "14px" }}>
                      <h2 style={{ margin: "0", fontSize: "var(--text-xl)", lineHeight: "28px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Scan every item on the shelf</h2>
                      <p style={{ margin: "0", fontSize: "var(--text-sm)", lineHeight: "22px", color: "#475569" }}>Each beep counts one. For a full box, scan once and type the number. Don’t look at the system number — just count.</p>
                      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <label style={{ position: "relative", flexGrow: "1", minWidth: "220px" }}>
                          <span style={{ position: "absolute", left: "16px", top: "15px", color: "#003087" }}>{SCAN_SVG(22)}</span>
                          <input className="inp" type="search" placeholder="Scan a barcode or type a SKU, then Enter" aria-label="Scan a barcode or type a SKU" value={v.code} onChange={v.codeIn} onKeyDown={v.codeKey} style={{ height: "54px", paddingLeft: "50px", fontSize: "var(--text-sm-plus)", border: "2px solid #003087" }} />
                        </label>
                        <button type="button" className="btn solid big" onClick={v.scan}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                            <circle cx="12" cy="13" r="3" />
                          </svg>
                          <span>Scan with camera</span>
                        </button>
                      </div>
                      {v.hasMsg ? (<>
                        <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-lg); background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: var(--text-sm); line-height: 20px; font-weight: var(--weight-medium);`)}>
                          <span style={{ flexShrink: "0" }}>{SCAN_SVG(20)}</span>
                          <span>{v.msg}</span>
                        </div>
                      </>) : null}
                    </div>
                    <div className="gc-on-dark" style={{ width: "220px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#012169", color: "#ffffff", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "6px", textAlign: "center" }}>
                      <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", color: "#7fcff0" }}>PRODUCTS COUNTED</div>
                      <div style={{ fontSize: "var(--text-5xl)", lineHeight: "1.12", fontWeight: "var(--weight-semibold)" }}>{v.done}<span style={{ fontSize: "var(--text-2xl)", color: "rgba(255,255,255,.7)" }}>/{v.all}</span></div>
                      <div style={{ width: "100%", height: "8px", marginTop: "8px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.16)", overflow: "hidden" }}>
                        <div style={__sx(`height: 8px; border-radius: var(--radius-full); background: #10b981; width: ${v.pct ?? ""}; transition: width 300ms ease-out;`)} />
                      </div>
                    </div>
                  </section>
                  <section className="card" style={{ overflow: "hidden" }}>
                    <div className="gc-table-wrap">
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th className="th">Product</th>
                            <th className="th">Rack</th>
                            <th className="th" style={{ textAlign: "center" }}>System says</th>
                            <th className="th" style={{ textAlign: "center" }}>You counted</th>
                            <th className="th" style={{ textAlign: "center" }}>Difference</th>
                            <th className="th" style={{ textAlign: "right" }}>Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {__list(v.lines).map((r, $index) => (<React.Fragment key={$index}>
                              <tr className={r?.rowCls}>
                                <td className="td">
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "var(--weight-medium)" }}>{r?.initial}</span>
                                    <div>
                                      <div style={{ fontWeight: "var(--weight-medium)" }}>{r?.name}</div>
                                      <div className="mono" style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>{r?.code}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="td">{r?.rack}</td>
                                <td className="td" style={{ textAlign: "center", color: "#475569" }}>{r?.sys}</td>
                                <td className="td" style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                                  {r?.counted ? (<>
                                    <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "#fff" }}>
                                      <button type="button" className="ib" aria-label={`One less ${r?.name ?? ""}`} onClick={r?.dec} style={{ borderRadius: "0" }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /></svg>
                                      </button>
                                      <input className="sc-qty" type="number" min="0" inputMode="numeric" aria-label={`Counted ${r?.name ?? ""}`} value={r?.qty} onChange={r?.type} />
                                      <button type="button" className="ib" aria-label={`One more ${r?.name ?? ""}`} onClick={r?.inc} style={{ borderRadius: "0" }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                      </button>
                                    </div>
                                  </>) : null}
                                  {r?.notCounted ? (<>
                                    <button type="button" className="btn line sm" onClick={r?.start}>Not counted yet</button>
                                  </>) : null}
                                </td>
                                <td className="td" style={{ textAlign: "center" }}>
                                  <span className={r?.dBadge}>{r?.diff}</span>
                                </td>
                                <td className="td" style={__sx(`text-align: right; white-space: nowrap; font-weight: var(--weight-medium); color: ${r?.vColor ?? ""};`)}>{r?.value}</td>
                              </tr>
                            </React.Fragment>))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
                <aside className="gc-side" style={{ width: "340px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <section className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <h2 style={{ margin: "0", fontSize: "var(--text-lg)", lineHeight: "24px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Count summary</h2>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                      <span style={{ color: "#475569" }}>Match</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#047857" }}>{v.match} products</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                      <span style={{ color: "#475569" }}>Missing</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#b83210" }}>{v.miss}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                      <span style={{ color: "#475569" }}>Extra</span>
                      <span style={{ fontWeight: "var(--weight-medium)", color: "#047857" }}>{v.extra}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                      <span style={{ color: "#475569" }}>Not counted yet</span>
                      <span style={{ fontWeight: "var(--weight-medium)" }}>{v.left}</span>
                    </div>
                    <div style={{ height: "1px", background: "#e2e8f0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>Net difference</span>
                      <span style={__sx(`font-size: var(--text-2xl); line-height: 34px; font-weight: var(--weight-semibold); color: ${v.netColor ?? ""};`)}>{v.net}</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#475569" }}>A manager approves the difference with their PIN. It is then saved as stock changes with the reason “Count difference”. Products not counted stay as they are.</p>
                    <button type="button" className="btn solid big" style={{ width: "100%" }} onClick={v.finish}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>Finish and post difference</span>
                    </button>
                    <button type="button" className="btn line" style={{ width: "100%" }} onClick={v.saveLater}>Save and continue later</button>
                  </section>
                </aside>
              </div>
              </>) : null}
              {v.finished ? (<>
                <section className="card fade" style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: "14px", alignItems: "center", textAlign: "center", maxWidth: "520px", alignSelf: "center" }}>
                  <span style={{ width: "64px", height: "64px", borderRadius: "var(--radius-full)", background: "#e7f8f1", color: "var(--text-success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <h2 style={{ margin: "0", fontSize: "var(--text-xl)", lineHeight: "28px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Count posted</h2>
                  <p style={{ margin: "0", fontSize: "var(--text-sm)", lineHeight: "22px", color: "#475569" }}>{v.doneText}</p>
                  <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                    <__Link href="/stock" className="btn line" style={{ flex: "1" }}>Back to stock list</__Link>
                    <button type="button" className="btn solid" style={{ flex: "1" }} onClick={v.again}>Start another count</button>
                  </div>
                </section>
              </>) : null}
            </div>
          </main>
        </div>
        <ManagerPin open={v.askOpen} reason={v.askReason} onApprove={v.approve} onClose={v.closeAsk} />
      </div>
    );
  }
}
