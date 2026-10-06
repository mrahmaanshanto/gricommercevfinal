'use client';
// Generated from design/templates/purchase-stock/StockCount.dc.html by scripts/convert-design.mjs.
// StockCount — Purchase & Stock module — Stock count.
// Edit freely: this file is now the source for the screen.
// Count sessions (Nayeem's Inventory brief #2, lib/countSessions.js): choose the place, what to count and the kind
// of count (Quick: you see the system number · Blind / Cycle / Full: the number stays hidden until you finish). Starting
// takes a snapshot of what the system has; sales and receipts during the count are allowed and are worked out of the
// difference (expected = snapshot + changes since). Each count line keeps who counted it ("Counting as"); several
// people can count one session. Finishing a blind count shows the differences and asks for a recount of big ones;
// then a manager approves with their PIN and each difference is saved once as a 'count' stock move (keyed by session
// and product). Scans go through identifiers.js: a pack barcode counts the whole pack, a serial counts one unit.
// Sessions are kept in this browser, so "Save and continue later" is just leaving the page.
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
import { CATALOG, productBy, STOCK_EVENT } from '@/lib/stock';
import { formatBDT, formatDateTime } from '@/lib/format';
import { COUNT_MODES, modeBy, getSessions, activeSession, sessionBy, scopeOf, startSession, setCount, myCount, summaryOf, askRecounts, revealSession, setSessionPause, setUncounted, cancelSession, postSession } from '@/lib/countSessions';
import { resolveScan, scanLine } from '@/lib/identifiers';
import { productCostOf } from '@/lib/productCost';
import { currentUser, USERS } from '@/lib/team';

// ---- logic (from the design's <script type="text/x-dc">) ----

function flashMsg(self, msg, bad, patch) { clearTimeout(self.t); var p = patch || {}; p.msg = msg; p.bad = !!bad; self.setState(p); self.t = setTimeout(function () { self.setState({ flash: null }); }, 900); }
function msgVals(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBad: !!s.bad }; }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
var RACK = { Phones: 'P', Accessories: 'A', Audio: 'D', Wearables: 'W', 'Power banks': 'B' };
var CATS = CATALOG.reduce(function (a, p) { if (a.indexOf(p.cat) < 0) a.push(p.cat); return a; }, []);
var AREAS = [{ k: 'all', label: 'Whole place' }].concat(CATS.map(function (c) { return { k: c, label: c }; }));
function cost(p) { return productCostOf(p.sku) || Math.round((Number(p.wholesale) || 0) * 0.85); }
class Component extends DCLogic {
  componentDidMount() {
    var self = this, act = activeSession();
    var p = { places: getStockPlaces(), me: currentUser().name, past: getSessions().filter(function (x) { return x.status === 'posted'; }).slice(0, 5) };
    if (act) assign(p, { sid: act.id, place: placeName(act.place), area: act.area, mode: act.mode });
    this.setState(p);
    // a sale or receipt while counting changes what is expected: read the numbers again
    this.re = function () { self.setState({ tick: Date.now() }); };
    window.addEventListener(STOCK_EVENT, this.re);
  }
  componentWillUnmount() { clearTimeout(this.t); if (this.re) window.removeEventListener(STOCK_EVENT, this.re); }
  renderVals() {
    var self = this, s = this.state || {};
    var ses = s.sid ? sessionBy(s.sid) : null;
    var run = !!ses && (ses.status === 'counting' || ses.status === 'recount');
    var place = run ? ses.place : s.place || (s.places || STOCK_PLACES)[0], area = run ? ses.area : s.area || 'all', mode = run ? ses.mode : s.mode || 'quick';
    var md = modeBy(mode), me = s.me || 'Staff', fin = s.fin || null, pause = run ? ses.pause !== false : true;
    var blind = md.blind && !(run && ses.revealed);
    var scope = s.places ? scopeOf(place, area) : [];
    var sum = run ? summaryOf(ses) : null;
    var done = 0, match = 0, missP = 0, missV = 0, exP = 0, exV = 0, shortL = 0, overL = 0, diffs = [];
    var lines = !run ? [] : sum.lines.map(function (l, i) {
      var p = productBy(l.sku) || { sku: l.sku, name: l.sku, variant: '', cat: '' }, unit = cost(p), mine = myCount(ses, l.sku, me);
      var counted = l.counted != null, d = counted ? l.diff : 0;
      if (counted) { done++; if (d === 0) match++; else { diffs.push(l); if (d < 0) { shortL++; missP -= d; missV -= d * unit; } else { overL++; exP += d; exV += d * unit; } } }
      var others = counted && l.counters.some(function (c) { return c !== me; }) ? l.counted - (mine || 0) : 0;
      var set = function (n) { setCount(ses.id, l.sku, n, me); self.setState({ tick: Date.now() }); };
      return { sku: l.sku, name: p.name, code: [p.sku, p.variant].filter(Boolean).join(' · '), initial: p.name.charAt(0), rack: (RACK[p.cat] || 'R') + '-' + (i + 1),
        sys: blind ? '—' : l.expected, since: l.since ? (l.since > 0 ? '+' : '−') + Math.abs(l.since) + ' since the snapshot' : '',
        qty: mine == null ? '' : mine, counted: mine != null || counted, notCounted: !counted, others: others ? '+' + others + ' by ' + l.counters.filter(function (c) { return c !== me; }).join(', ') : '',
        recount: l.recount ? 'Recount' : l.needsRecount && !blind ? 'Big difference' : '',
        diff: !counted ? '—' : blind ? 'Counted' : (d === 0 ? 'Match' : (d > 0 ? '+' + d : '−' + Math.abs(d))),
        dTone: !counted ? '' : blind ? 'info' : (d === 0 ? 'success' : (d > 0 ? 'info' : 'error')),
        value: !counted || d === 0 || blind ? '—' : (d > 0 ? '+' : '−') + formatBDT(Math.abs(d) * unit),
        vCls: blind ? 'ix-muted' : d < 0 ? 'sc-down' : (d > 0 ? 'sc-up' : 'ix-muted'), flash: s.flash === l.sku,
        start: function () { set(0); }, inc: function () { set((mine || 0) + 1); }, dec: function () { set(Math.max(0, (mine || 0) - 1)); },
        type: function (e) { var n = e.target.value; set(n === '' ? 0 : Math.max(0, Number(n) || 0)); } };
    });
    var net = exV - missV;
    var all = run ? sum.total : scope.length;
    return assign({
      run: run, notRun: !run, place: place, places: s.places || STOCK_PLACES, blind: blind, modeLabel: md.label, modeHint: md.hint, full: mode === 'full',
      onPlace: function (e) { self.setState({ place: e.target.value }); },
      areas: AREAS.map(function (x) { return { key: x.k, id: 'sc-area-' + x.k.replace(/\W+/g, '-'), label: x.label, on: x.k === area, onClick: function () { if (!run) self.setState({ area: x.k }); } }; }),
      areaLabel: AREAS.filter(function (a) { return a.k === area; })[0].label,
      modes: COUNT_MODES.map(function (m) { return { key: m.k, label: m.label, on: m.k === mode, onClick: function () { self.setState({ mode: m.k }); } }; }),
      startCount: function () {
        var x = startSession({ mode: mode, place: place, area: area, pause: true, by: me });
        self.setState({ sid: x.id, fin: null, msg: '' });
        __toast('Count started at ' + place + ' · snapshot taken');
      },
      startedText: run ? 'Snapshot ' + formatDateTime(ses.snapshotAt) + ' · ' + ses.counters.join(', ') : '',
      me: me, people: USERS.map(function (u) { return u.name; }).concat(USERS.some(function (u) { return u.name === me; }) ? [] : [me]),
      setMe: function (e) { self.setState({ me: e.target.value }); },
      pause: pause, pauseText: pause ? 'Selling is paused at ' + place + ' while counting' : 'Selling is on at ' + place + ' during this count',
      pauseHelp: pause ? 'POS and online orders cannot take stock from here until you post or cancel the count.' : 'Sales after the snapshot are taken out of the difference, so they don’t show as missing.',
      togglePause: function () { var n = !pause; setSessionPause(ses.id, n); self.setState({ tick: Date.now() }); __toast(n ? 'Selling paused at ' + place : 'Selling is back on at ' + place); },
      moved: run ? sum.moved.length : 0,
      uncounted: run ? ses.uncounted : 'keep', setUncounted: function (e) { setUncounted(ses.id, e.target.value); self.setState({ tick: Date.now() }); },
      cancel: function () { __confirm({ title: 'Cancel this count?', body: 'The numbers you counted are thrown away and selling starts again at ' + place + '.', confirmLabel: 'Cancel count', tone: 'danger' }).then(function (ok) { if (!ok) return; cancelSession(ses.id, me); self.setState({ sid: null, msg: '' }); __toast('Count cancelled · selling is back on at ' + place); }); },
      code: s.code || '', codeIn: function (e) { self.setState({ code: e.target.value }); },
      codeKey: function (e) {
        if (e.key !== 'Enter') return; e.preventDefault();
        var q = (s.code || '').trim(); if (!q) return;
        // one scan → product + pack + serial (identifiers.js); else a name or SKU typed by hand
        var hit = resolveScan(q), p = hit ? hit.row : lines.filter(function (x) { return (x.sku + ' ' + x.name + ' ' + x.code).toLowerCase().indexOf(q.toLowerCase()) >= 0; }).map(function (x) { return productBy(x.sku); })[0];
        if (!p || (area !== 'all' && ses.skus.indexOf(p.sku) < 0)) { flashMsg(self, '“' + q + '” is not in this count at ' + place + '.', true, { code: '' }); return; }
        var add = hit ? hit.qty : 1, cur = myCount(ses, p.sku, me) || 0;
        setCount(ses.id, p.sku, cur + add, me, hit && hit.serial ? hit.serial : '');
        flashMsg(self, 'Beep — +' + (hit && hit.pack ? hit.qty + ' (' + hit.pack.name + ')' : add) + ' ' + p.name + (hit && hit.serial ? ' · ' + scanLine(hit) : ''), false, { flash: p.sku, code: '' });
      },
      lines: lines, done: done, all: all, pct: (all ? Math.round(done / all * 100) : 0) + '%',
      scan: function () { if (!lines.length) return; var n = s.n || 0; var l = lines[[0, 0, 1, 2, 0, 3][n % 6] % lines.length]; setCount(ses.id, l.sku, (myCount(ses, l.sku, me) || 0) + 1, me); flashMsg(self, 'Beep — +1 ' + l.name, false, { n: n + 1, flash: l.sku }); },
      match: match, miss: missP + ' pcs · ' + formatBDT(missV), extra: exP + ' pcs · ' + formatBDT(exV), left: (all - done) + ' products',
      net: (net < 0 ? '−' : '+') + formatBDT(Math.abs(net)), netCls: net < 0 ? 'sc-down' : 'sc-up',
      notFinished: !fin, finished: !!fin,
      finish: function () {
        if (!done) { flashMsg(self, 'Count at least one product first.', true); return; }
        // a blind count shows its differences now, and big ones are counted again first
        if (md.blind && !ses.revealed) {
          revealSession(ses.id);
          var n = askRecounts(ses.id);
          self.setState({ tick: Date.now() });
          if (n) { __toast(n + (n === 1 ? ' product needs' : ' products need') + ' a recount. Count them again, then finish.', { tone: 'info' }); return; }
        } else if (md.recount && summaryOf(ses).recounts.length) {
          var m = askRecounts(ses.id); self.setState({ tick: Date.now() });
          __toast(m + (m === 1 ? ' product needs' : ' products need') + ' a recount first.', { tone: 'info' }); return;
        }
        if (!diffs.length && !(mode === 'full' && ses.uncounted === 'zero' && all > done)) { postSession(ses.id, me); self.setState({ fin: { n: done, pcs: 0, by: '' }, sid: null, past: getSessions().filter(function (x) { return x.status === 'posted'; }).slice(0, 5) }); __toast('Count finished · everything matched. Selling is back on at ' + place); return; }
        self.setState({ ask: true });
      },
      saveLater: function () { __toast('Count saved. Open Stock count again to carry on.'); },
      askOpen: !!s.ask, closeAsk: function () { self.setState({ ask: false }); },
      askReason: (<>
        <span style={{ display: 'block', marginBottom: 8 }}>Post the {md.label.toLowerCase()} at <b>{place}</b> ({AREAS.filter(function (a) { return a.k === area; })[0].label.toLowerCase()}):</span>
        <span style={{ display: 'block' }}>Short: {shortL} {shortL === 1 ? 'line' : 'lines'} · −{missP} pcs · −{formatBDT(missV)}</span>
        <span style={{ display: 'block' }}>Over: {overL} {overL === 1 ? 'line' : 'lines'} · +{exP} pcs · +{formatBDT(exV)}</span>
        <span style={{ display: 'block', marginTop: 4 }}><b>Net {(net < 0 ? '−' : '+') + formatBDT(Math.abs(net))}</b> · {match} matched · {all - done} not counted {mode === 'full' && run && ses.uncounted === 'zero' ? 'set to 0' : 'stay as they are'}</span>
      </>),
      approve: function (manager) {
        var r = postSession(ses.id, manager);
        self.setState({ ask: false, sid: null, fin: { n: done, pcs: r && r.result ? r.result.pcs : missP + exP, by: manager, lines: r && r.result ? r.result.lines : diffs.length }, past: getSessions().filter(function (x) { return x.status === 'posted'; }).slice(0, 5) });
        __toast((r && r.result ? r.result.lines : diffs.length) + ' count differences posted at ' + place + ' · approved by ' + manager);
      },
      again: function () { self.setState({ fin: null, msg: '' }); },
      past: (s.past || []).map(function (x) { return { id: x.id, text: modeBy(x.mode).label + ' · ' + x.place + ' · ' + formatDateTime(x.postedAt || x.snapshotAt), sub: x.result ? x.result.counted + ' counted · ' + x.result.lines + ' differences · approved by ' + x.postedBy : (x.summary || 'Approved by ' + x.postedBy), href: '/stock-activity?ref=' + x.id }; }),
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
.sc-who{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.sc-who .gc-input{width:auto;min-width:200px;height:32px;font-size:var(--text-sm)}
.sc-past{margin:0;padding:0;list-style:none}
.sc-past li{border-top:1px solid var(--border-subtle)}
.sc-past li:first-child{border-top:0}
.sc-past a{display:block;padding:var(--space-3) var(--space-4);font-size:var(--text-sm);color:var(--text-heading);text-decoration:none}
.sc-past a:hover b{color:var(--primary)}
.sc-past b{font-weight:var(--weight-medium)}
.sc-past small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
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
                    meta={[v.modeLabel, v.place, v.areaLabel, v.startedText].filter(Boolean).join(' · ')}
                    about="Count what is on the shelf at one place. The count starts from a snapshot, so sales while you count are not counted as missing. A manager approves the difference with their PIN and it is saved as stock changes."
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
                        <p className="sc-help">{v.blind ? 'Each beep counts one; a box or carton barcode counts the whole pack. The system number stays hidden until you finish.' : 'Each beep counts one; a box or carton barcode counts the whole pack. You can see the system number.'}</p>
                        <label className="sc-who"><span>Counting as</span>
                          <select className="gc-input gc-select" value={v.me} onChange={v.setMe} aria-label="Counting as">{v.people.map((n) => <option key={n}>{n}</option>)}</select>
                        </label>
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
                          {v.blind ? (
                            <KV rows={[['Counted', `${v.done} products`], ['Not counted yet', v.left], ['Differences', 'Shown when you finish']]} />
                          ) : (
                            <KV rows={[
                              ['Match', <span key="m" className="sc-up">{`${v.match} products`}</span>],
                              ['Missing', <span key="x" className="sc-down">{v.miss}</span>],
                              ['Extra', <span key="e" className="sc-up">{v.extra}</span>],
                              ['Not counted yet', v.left],
                              ['Net difference', <b key="n" className={v.netCls}>{v.net}</b>],
                            ]} />
                          )}
                          {v.moved ? <p className="sc-help">{v.moved === 1 ? '1 product sold or moved since the snapshot. That is taken out of the difference.' : v.moved + ' products sold or moved since the snapshot. That is taken out of the difference.'}</p> : null}
                          {v.full ? (
                            <label className="sc-who"><span>Not counted</span>
                              <select className="gc-input gc-select" value={v.uncounted} onChange={v.setUncounted} aria-label="Products nobody counted"><option value="keep">Stay as they are</option><option value="zero">Set to 0</option></select>
                            </label>
                          ) : null}
                          <p className="sc-help">A manager approves the difference with their PIN. It is then saved as stock changes with the reason “Count difference”.{v.full ? '' : ' Products not counted stay as they are.'}</p>
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
                            <span className="ix-pitem__mid">{r.code} · {r.rack}{v.blind ? '' : ` · System ${r.sys}`}{r.since && !v.blind ? ' · ' + r.since : ''}{r.others ? ' · ' + r.others : ''}</span>
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
                            {v.blind ? null : <th scope="col" className="ix-num">System says</th>}
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
                              {v.blind ? null : <td className="ix-num ix-muted">{r.sys}{r.since ? <span className="sc-code">{r.since}</span> : null}</td>}
                              <td>{r.counted ? <Stepper r={r} /> : <button type="button" className="ix-btn ix-btn--sm" onClick={r.start}>Not counted yet</button>}{r.others ? <span className="sc-code">{r.others}</span> : null}</td>
                              <td>{r.dTone ? <__StatusBadge tone={r.dTone}>{r.diff}</__StatusBadge> : <span className="ix-muted">{r.diff}</span>}{r.recount ? <> <__StatusBadge tone="warning">{r.recount}</__StatusBadge></> : null}</td>
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
                    about="Count what is on the shelf at one place. The count starts from a snapshot, so sales while you count are not counted as missing. A manager approves the difference with their PIN and it is saved as stock changes."
                    secondary={[{ label: 'Stock adjustments', href: '/stock-adjustments' }, { label: 'Stock activity', href: '/stock-activity?group=adjust' }]} />
                  {v.notFinished ? (
                    <section className="ix-card" aria-labelledby="sc-setup-h">
                      <div className="ix-card__head"><h2 id="sc-setup-h">Start a stock count</h2></div>
                      <div className="ix-card__body sc-form">
                        <div>
                          <label className="gc-label" htmlFor="sc-place">Where are you counting? *</label>
                          <select id="sc-place" className="gc-input gc-select" value={v.place} onChange={v.onPlace}>
                            {v.places.map((x) => (<option key={x}>{x}</option>))}
                          </select>
                          <p className="sc-help" style={{ marginTop: 'var(--space-1)' }}>Choose where you are counting. The system notes what it has when you start; you can pause selling there.</p>
                        </div>
                        <div>
                          <span className="gc-label" id="sc-mode-l">Kind of count</span>
                          <div className="ix-chips" role="group" aria-labelledby="sc-mode-l">
                            {v.modes.map((m) => (<button key={m.key} type="button" className="ix-chip" aria-pressed={m.on} onClick={m.onClick}>{m.label}</button>))}
                          </div>
                          <p className="sc-help" style={{ marginTop: 'var(--space-1)' }}>{v.modeHint}</p>
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
                  {v.past.length ? (
                    <section className="ix-card" aria-labelledby="sc-past-h">
                      <div className="ix-card__head"><h2 id="sc-past-h">Past counts</h2></div>
                      <ul className="sc-past">
                        {v.past.map((x) => (<li key={x.id}><__Link href={x.href}><b>{x.id}</b> · {x.text}<small>{x.sub}</small></__Link></li>))}
                      </ul>
                    </section>
                  ) : null}
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
