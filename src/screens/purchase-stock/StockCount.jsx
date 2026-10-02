'use client';
// Generated from design/templates/purchase-stock/StockCount.dc.html by scripts/convert-design.mjs.
// StockCount — Purchase & Stock module — Stock count.
// Edit freely: this file is now the source for the screen.
// Flow: choose the place (STOCK_PLACES) and what to count → start: selling is paused at that place
// (a switch turns it back on) → scan or type what is on the shelf → post the difference: a manager
// approves it with their PIN after seeing the summary, then each difference is saved as a stock move
// of kind 'count'. "Save and continue later" keeps the count in this browser.
// Laid out like a Shopify record (components/ui/IndexKit.jsx): while counting, the title row carries the actions
// (Finish and post difference, Save and continue later, Cancel count in "More actions"); the scan box sits beside
// the count summary, and the lines (by area) run full width below.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { StatusBadge as __StatusBadge } from '@/components/ui';
import { ShopHeader, RecordHeader, IndexTabs, KV, LearnMore } from '@/components/ui/IndexKit';
import { toast as __toast, confirmDialog as __confirm } from '@/runtime/ui';
import { ManagerPin } from '@/components/ManagerPin';
import { STOCK_PLACES, getStockPlaces, placeName } from '@/lib/locations';
import { CATALOG, productBy, stockAt, getMoves, addMove } from '@/lib/stock';
import { getHolds } from '@/lib/stockHolds';
import { formatBDT, formatDateTime } from '@/lib/format';

// ---- logic (from the design's <script type="text/x-dc">) ----

function flashMsg(self, msg, bad, patch) { clearTimeout(self.t); var p = patch || {}; p.msg = msg; p.bad = !!bad; self.setState(p); self.t = setTimeout(function () { self.setState({ flash: null }); }, 900); }
function msgVals(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBad: !!s.bad }; }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
var DRAFT = 'gc.stock.count.draft';
var COUNTER = 'Karim';
var RACK = { Grocery: 'G', Clothing: 'C', 'Skin care': 'A', Electronics: 'E', Home: 'H' };
var CATS = CATALOG.reduce(function (a, p) { if (a.indexOf(p.cat) < 0) a.push(p.cat); return a; }, []);
var AREAS = [{ k: 'all', label: 'Whole place' }].concat(CATS.map(function (c) { return { k: c, label: c }; }));
function readDraft() { try { return JSON.parse(window.localStorage.getItem(DRAFT)); } catch (e) { return null; } }
function writeDraft(d) { try { if (d) window.localStorage.setItem(DRAFT, JSON.stringify(d)); else window.localStorage.removeItem(DRAFT); } catch (e) { /* ignore */ } }
function cost(p) { return Math.round(p.wholesale * 0.85); }
class Component extends DCLogic {
  componentDidMount() {
    var d = readDraft(), p = { holds: getHolds(), moves: getMoves(), places: getStockPlaces() };   // live places after mount
    if (d && p.places.indexOf(placeName(d.place)) >= 0) assign(p, { place: placeName(d.place), area: d.area || 'all', c: d.c || {}, pause: d.pause !== false, started: d.started, run: true });
    this.setState(p);
  }
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var place = s.place || (s.places || STOCK_PLACES)[0], area = s.area || 'all', c = s.c || {}, run = !!s.run, fin = s.fin || null, pause = s.pause !== false;
    var holds = s.holds || [], moves = s.moves || [];
    var prods = CATALOG.filter(function (p) { return (area === 'all' || p.cat === area) && (p.on[place] || stockAt(p.sku, place, holds, moves, null).onHand); });
    var setC = function (sku, v, extra) { var x = assign({}, c); if (v === null) delete x[sku]; else x[sku] = v; self.setState(assign({ c: x }, extra || {})); };
    var done = 0, match = 0, missP = 0, missV = 0, exP = 0, exV = 0, shortL = 0, overL = 0, diffs = [];
    var lines = prods.map(function (p, i) {
      var sys = stockAt(p.sku, place, holds, moves, null).onHand, v = c[p.sku], counted = v !== null && v !== undefined, unit = cost(p);
      var d = counted ? v - sys : 0;
      if (counted) { done++; if (d === 0) match++; else { diffs.push({ p: p, d: d, sys: sys, v: v }); if (d < 0) { shortL++; missP -= d; missV -= d * unit; } else { overL++; exP += d; exV += d * unit; } } }
      return { sku: p.sku, name: p.name, code: p.sku + ' · ' + p.variant, initial: p.name.charAt(0), rack: (RACK[p.cat] || 'R') + '-' + (i + 1), sys: sys, qty: v, counted: counted, notCounted: !counted,
        diff: !counted ? '—' : (d === 0 ? 'Match' : (d > 0 ? '+' + d : '−' + Math.abs(d))),
        dTone: !counted ? '' : (d === 0 ? 'success' : (d > 0 ? 'info' : 'error')),
        value: !counted || d === 0 ? '—' : (d > 0 ? '+' : '−') + formatBDT(Math.abs(d) * unit),
        vCls: d < 0 ? 'sc-down' : (d > 0 ? 'sc-up' : 'ix-muted'), flash: s.flash === p.sku,
        start: function () { setC(p.sku, 0); }, inc: function () { setC(p.sku, (v || 0) + 1); }, dec: function () { setC(p.sku, Math.max(0, (v || 0) - 1)); },
        type: function (e) { var n = e.target.value; setC(p.sku, n === '' ? 0 : Math.max(0, Math.round(Number(n) || 0))); } };
    });
    var net = exV - missV;
    var beep = function (p) { var x = assign({}, c); x[p.sku] = (x[p.sku] || 0) + 1; flashMsg(self, 'Beep — +1 ' + p.name, false, { c: x, flash: p.sku, code: '' }); };
    var save = function (patch) { var st = assign({ place: place, area: area, c: c, pause: pause, started: s.started }, patch || {}); writeDraft(st); };
    return assign({
      run: run, notRun: !run, place: place, places: s.places || STOCK_PLACES,
      onPlace: function (e) { self.setState({ place: e.target.value, c: {} }); },
      areas: AREAS.map(function (x) { return { key: x.k, id: 'sc-area-' + x.k.replace(/\W+/g, '-'), label: x.label, on: x.k === area, onClick: function () { self.setState({ area: x.k }); } }; }),
      areaLabel: AREAS.filter(function (a) { return a.k === area; })[0].label,
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
      net: (net < 0 ? '−' : '+') + formatBDT(Math.abs(net)), netCls: net < 0 ? 'sc-down' : 'sc-up',
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

// ---- styles ----

const CSS = `
.sc-form{display:flex;flex-direction:column;gap:var(--space-4)}
.sc-form .gc-select{max-width:360px}
.sc-help{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.sc-pause{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);background:var(--fill-warning-soft);color:var(--text-warning);font-size:var(--text-sm)}
.sc-pause.is-off{background:var(--surface-card);color:var(--text-body)}
.sc-pause>svg{flex:none}
.sc-pause b{font-weight:var(--weight-medium)}
.sc-pause small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sc-pause__sw{display:flex;align-items:center;gap:10px;margin-left:auto;white-space:nowrap;font-size:var(--text-xs);font-weight:var(--weight-medium)}
.sc-scan{display:flex;flex-direction:column;gap:var(--space-3)}
.sc-scan h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sc-scanrow{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.sc-scanrow .ix-search{flex:1 1 240px;border-color:var(--primary)}
.sc-msg{display:flex;align-items:center;gap:var(--space-2);margin:0;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-success)}
.sc-msg.is-bad{color:var(--text-danger)}
.sc-msg svg{flex:none}
.sc-prog{display:flex;flex-direction:column;gap:6px}
.sc-prog__row{display:flex;justify-content:space-between;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.sc-prog__row b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sc-prog .gc-progress__fill{background:var(--success)}
.sc-thumb{background:var(--fill-primary-soft);color:var(--primary)}
.sc-code{display:block;font-family:var(--font-data);font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.sc-table td{height:44px}
.sc-step{display:inline-flex;align-items:center;border:1px solid var(--border-field);border-radius:var(--radius-lg);overflow:hidden;background:var(--surface-card)}
.sc-step button{display:grid;place-items:center;width:28px;height:28px;border:0;background:none;color:var(--text-body);cursor:pointer}
.sc-step button:hover{background:var(--surface-subtle);color:var(--text-heading)}
.sc-qty{width:52px;height:28px;border:0;border-left:1px solid var(--border-field);border-right:1px solid var(--border-field);text-align:center;font:inherit;font-weight:var(--weight-medium);background:transparent;color:inherit;-moz-appearance:textfield}
.sc-qty::-webkit-outer-spin-button,.sc-qty::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.sc-qty:focus{outline:2px solid var(--primary);outline-offset:-2px}
.sc-up{color:var(--text-success)}.sc-down{color:var(--text-danger)}
.sc-flash td{animation:scFlash 900ms ease-out}
@keyframes scFlash{from{background:var(--fill-success-soft)}to{background:transparent}}
.sc-pitem{cursor:default}
.sc-pitem__ctl{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);margin-top:2px}
.sc-done{display:flex;flex-direction:column;gap:var(--space-3)}
.sc-done h2{display:flex;align-items:center;gap:var(--space-2);margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sc-done h2 svg{color:var(--text-success)}
.sc-done p{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.sc-done__acts{display:flex;flex-wrap:wrap;gap:var(--space-2)}
@media (prefers-reduced-motion:reduce){.sc-flash td{animation:none}}
@media (max-width:640px){.sc-pause{flex-wrap:wrap}.sc-pause__sw{margin-left:0}}
`;

// ---- markup ----

function Stepper({ r }) {
  return (
    <span className="sc-step">
      <button type="button" aria-label={`One less ${r.name}`} onClick={r.dec}><__Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
      <input className="sc-qty" type="number" min="0" inputMode="numeric" aria-label={`Counted ${r.name}`} value={r.qty} onChange={r.type} />
      <button type="button" aria-label={`One more ${r.name}`} onClick={r.inc}><__Icon name="plus" width="16" height="16" aria-hidden="true" /></button>
    </span>
  );
}

export default class StockCountScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="StockCount">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="stock-count" />
          <main className="gc-shell__main">
            <__Topbar crumb="Stock" page="Stock count" placeholder="Search or scan any barcode" />
            <div className="gc-shell__content">
              {v.run ? (
                <div className="ix-page">
                  <RecordHeader title="Stock count"
                    badges={<__StatusBadge tone="info" icon="clipboard-check">Counting</__StatusBadge>}
                    meta={[v.place, v.areaLabel, v.startedText].filter(Boolean).join(' · ')}
                    about="Count what is on the shelf at one place. Selling is paused there while you count; a manager approves the difference with their PIN and it is saved as stock changes."
                    secondary={[{ label: 'Save and continue later', onClick: v.saveLater }]}
                    more={[{ label: 'Cancel count', onClick: v.cancel, tone: 'danger' }]}
                    primary={{ label: 'Finish and post difference', onClick: v.finish }} />

                  <div className={'ix-card sc-pause' + (v.pause ? '' : ' is-off')} role="status">
                    <__Icon name={v.pause ? 'circle-pause' : 'circle-play'} width="16" height="16" aria-hidden="true" />
                    <div><b>{v.pauseText}</b><small>{v.pauseHelp}</small></div>
                    <label className="sc-pause__sw">
                      <span>Pause selling</span>
                      <button type="button" role="switch" aria-checked={v.pause} aria-label={`Pause selling at ${v.place}`} className="gc-switch" onClick={v.togglePause}><span className="gc-switch__knob" /></button>
                    </label>
                  </div>

                  <div className="ix-record">
                    <div className="ix-main">
                      <section className="ix-card ix-card--pad sc-scan" aria-labelledby="sc-scan-h">
                        <h2 id="sc-scan-h">Scan every item on the shelf</h2>
                        <p className="sc-help">Each beep counts one. For a full box, scan once and type the number. Don’t look at the system number — just count.</p>
                        <div className="sc-scanrow">
                          <label className="ix-search">
                            <__Icon name="scan-barcode" width="16" height="16" aria-hidden="true" />
                            <input type="search" placeholder="Scan a barcode or type a SKU, then Enter" aria-label="Scan a barcode or type a SKU" value={v.code} onChange={v.codeIn} onKeyDown={v.codeKey} />
                          </label>
                          <button type="button" className="ix-btn" onClick={v.scan}><__Icon name="camera" width="16" height="16" aria-hidden="true" />Scan with camera</button>
                        </div>
                        {v.hasMsg ? <p className={'sc-msg' + (v.msgBad ? ' is-bad' : '')} role="status"><__Icon name="scan-barcode" width="16" height="16" aria-hidden="true" /><span>{v.msg}</span></p> : null}
                        <div className="sc-prog">
                          <div className="sc-prog__row"><span>Products counted</span><b>{`${v.done} / ${v.all}`}</b></div>
                          <div className="gc-progress" role="progressbar" aria-label="Products counted" aria-valuenow={v.done} aria-valuemin={0} aria-valuemax={v.all}><div className="gc-progress__fill" style={{ width: v.pct }} /></div>
                        </div>
                      </section>
                    </div>
                    <aside className="ix-side">
                      <section className="ix-card" aria-labelledby="sc-sum-h">
                        <div className="ix-card__head"><h2 id="sc-sum-h">Count summary</h2></div>
                        <div className="ix-card__body sc-form">
                          <KV rows={[
                            ['Match', <span key="m" className="sc-up">{`${v.match} products`}</span>],
                            ['Missing', <span key="x" className="sc-down">{v.miss}</span>],
                            ['Extra', <span key="e" className="sc-up">{v.extra}</span>],
                            ['Not counted yet', v.left],
                            ['Net difference', <b key="n" className={v.netCls}>{v.net}</b>],
                          ]} />
                          <p className="sc-help">A manager approves the difference with their PIN. It is then saved as stock changes with the reason “Count difference”. Products not counted stay as they are.</p>
                        </div>
                      </section>
                    </aside>
                  </div>

                  <section className="ix-card" aria-label="Count lines">
                    <div className="ix-bar"><IndexTabs tabs={v.areas} label="What are you counting?" /></div>
                    <ul className="ix-plist" aria-label="Count lines">
                      {v.lines.map((r) => (
                        <li key={r.sku}>
                          <div className="ix-pitem sc-pitem">
                            <span className="ix-pitem__top"><b>{r.name}</b>{r.dTone ? <__StatusBadge tone={r.dTone}>{r.diff}</__StatusBadge> : null}</span>
                            <span className="ix-pitem__mid">{r.code} · {r.rack} · {`System ${r.sys}`}</span>
                            <span className="sc-pitem__ctl">
                              {r.counted ? <Stepper r={r} /> : <button type="button" className="ix-btn ix-btn--sm" onClick={r.start}>Not counted yet</button>}
                              <span className={r.vCls}>{r.value}</span>
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="ix-table-wrap">
                      <table className="ix-table ix-table--static gc-table--keep sc-table">
                        <caption className="sr-only">Count at {v.place}, {v.areaLabel}</caption>
                        <thead>
                          <tr>
                            <th scope="col">Product</th>
                            <th scope="col">Rack</th>
                            <th scope="col" className="ix-num">System says</th>
                            <th scope="col">You counted</th>
                            <th scope="col">Difference</th>
                            <th scope="col" className="ix-num">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {v.lines.map((r) => (
                            <tr key={r.sku} className={r.flash ? 'sc-flash' : ''}>
                              <td>
                                <span className="ix-prod">
                                  <span className="ix-thumb sc-thumb" aria-hidden="true">{r.initial}</span>
                                  <span className="ix-strong">{r.name}<span className="sc-code">{r.code}</span></span>
                                </span>
                              </td>
                              <td className="ix-muted">{r.rack}</td>
                              <td className="ix-num ix-muted">{r.sys}</td>
                              <td>{r.counted ? <Stepper r={r} /> : <button type="button" className="ix-btn ix-btn--sm" onClick={r.start}>Not counted yet</button>}</td>
                              <td>{r.dTone ? <__StatusBadge tone={r.dTone}>{r.diff}</__StatusBadge> : <span className="ix-muted">{r.diff}</span>}</td>
                              <td className={'ix-num ' + r.vCls}>{r.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="ix-page ix-page--narrow">
                  <ShopHeader icon="clipboard-check" title="Stock count"
                    about="Count what is on the shelf at one place. Selling is paused there while you count; a manager approves the difference with their PIN and it is saved as stock changes."
                    secondary={[{ label: 'Stock adjustments', href: '/stock-adjustments' }]} />
                  {v.notFinished ? (
                    <section className="ix-card" aria-labelledby="sc-setup-h">
                      <div className="ix-card__head"><h2 id="sc-setup-h">Start a stock count</h2></div>
                      <div className="ix-card__body sc-form">
                        <div>
                          <label className="gc-label" htmlFor="sc-place">Where are you counting? *</label>
                          <select id="sc-place" className="gc-input gc-select" value={v.place} onChange={v.onPlace}>
                            {v.places.map((x) => (<option key={x}>{x}</option>))}
                          </select>
                          <p className="sc-help" style={{ marginTop: 'var(--space-1)' }}>Choose where you are counting. Selling is paused there while you count, so the numbers do not move.</p>
                        </div>
                        <div>
                          <span className="gc-label" id="sc-area-l">What are you counting?</span>
                          <div className="ix-chips" role="group" aria-labelledby="sc-area-l">
                            {v.areas.map((a) => (<button key={a.key} type="button" className="ix-chip" aria-pressed={a.on} onClick={a.onClick}>{a.label}</button>))}
                          </div>
                        </div>
                        <p className="sc-help">{v.all} products to count at {v.place}.</p>
                        <div><button type="button" className="ix-btn ix-btn--primary" onClick={v.startCount} disabled={!v.all}><__Icon name="clipboard-check" width="16" height="16" aria-hidden="true" />Start count</button></div>
                      </div>
                    </section>
                  ) : (
                    <section className="ix-card ix-card--pad sc-done" aria-labelledby="sc-done-h">
                      <h2 id="sc-done-h"><__Icon name="circle-check" width="16" height="16" aria-hidden="true" />Count posted</h2>
                      <p>{v.doneText}</p>
                      <div className="sc-done__acts">
                        <__Link href="/stock" className="ix-btn">Back to stock list</__Link>
                        <button type="button" className="ix-btn ix-btn--primary" onClick={v.again}>Start another count</button>
                      </div>
                    </section>
                  )}
                  <LearnMore topic="stock counts" />
                </div>
              )}
            </div>
          </main>
        </div>
        <ManagerPin open={v.askOpen} reason={v.askReason} onApprove={v.approve} onClose={v.closeAsk} />
      </div>
    );
  }
}
