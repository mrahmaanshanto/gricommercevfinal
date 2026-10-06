'use client';
// Generated from design/templates/purchase-stock/NewTransfer.dc.html by scripts/convert-design.mjs.
// NewTransfer — Purchase & Stock module — New transfer.
// Edit freely: this file is now the source for the screen.
// Laid out like a Shopify form (components/ui/IndexKit.jsx): a back arrow to Transfers and the title, then the
// work on the left (route, the items scanned, who carries them) and the summary with Send on the right
// (on phones Send stays in reach in the bottom bar).

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { PhoneActionBar as __PhoneActionBar, useIsPhone as __useIsPhone } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { toast as __toast } from '@/runtime/ui';
import { STOCK_PLACES, getStockPlaces, placeName } from '@/lib/locations';
import { CATALOG, productBy, stockAt, getMoves } from '@/lib/stock';
import { resolveScan } from '@/lib/identifiers';
import { getHolds } from '@/lib/stockHolds';
import { addTransfer } from '@/lib/transfers';

// ---- form helpers: required marker, field error text, invalid attributes, focus the first error ----
function __Req() { return <span aria-hidden="true" style={{ color: 'var(--text-danger)' }}> *</span>; }
function __Err({ id, msg }) { return msg ? <span id={id} className="gc-help gc-help--error" style={{ display: 'block' }}>{msg}</span> : null; }
function __inv(err, id) { return err ? { 'aria-invalid': 'true', 'aria-describedby': id } : {}; }
function __focusSoon(id) { setTimeout(function () { var el = document.getElementById(id); if (el) el.focus(); }, 0); }
function __without(o, k) { var r = {}; for (var x in (o || {})) if (x !== k) r[x] = o[x]; return r; }

// ---- logic (from the design's <script type="text/x-dc">) ----

function flashMsg(self, msg, bad, patch) { clearTimeout(self.t); var p = patch || {}; p.msg = msg; p.bad = !!bad; self.setState(p); self.t = setTimeout(function () { self.setState({ flash: null }); }, 900); }
function msgVals(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBad: !!s.bad }; }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
// Places come from src/lib/locations.js, products from the catalogue; "Have here" is what is free to
// sell at the sender. Sending saves the transfer (src/lib/transfers.js); it is scanned in on Transfers.
var LOCS = STOCK_PLACES;
var TP = CATALOG.map(function (p) { return { sku: p.sku, name: p.name, code: p.sku + ' · ' + p.variant, barcode: p.barcode, cost: p.wholesale }; });
var SCAN = ['AC-CHG-20', 'AC-CSE-A55', 'AC-CHG-20', 'AU-EAR-PRO'].map(function (sku) { return TP.findIndex(function (x) { return x.sku === sku; }); });
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
      return { key: p.sku, name: p.name, code: p.code, initial: p.name.charAt(0), have: have, qty: l.q, left: left, short: left < 0, flash: s.flash === l.i,
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
        var i = SCAN[n % SCAN.length], add = 1, packName = '';
        // a scan resolves to product + pack (identifiers.js): a carton barcode adds the whole carton in base units
        var rs = q ? resolveScan(e.target.value.trim()) : null;
        if (rs) { add = rs.qty || 1; packName = rs.pack ? ' (' + rs.pack.name + ')' : ''; }
        if (q) { var hit = (rs && rs.row) || productBy(q) || CATALOG.filter(function (x) { return (x.sku + ' ' + x.name + ' ' + x.variant).toLowerCase().indexOf(q) >= 0; })[0]; if (!hit) { flashMsg(self, 'No product matches “' + e.target.value.trim() + '”', true); return; } i = TP.findIndex(function (x) { return x.sku === hit.sku; }); if (i < 0) { flashMsg(self, hit.name + ' can’t be moved from here', true); return; } e.target.value = ''; }
        var x = lines.slice(); var f = -1;
        x.forEach(function (l, k) { if (l.i === i) f = k; });
        if (f >= 0) x[f] = { i: i, q: x[f].q + add }; else x.push({ i: i, q: add });
        flashMsg(self, 'Beep — ' + TP[i].name + (f >= 0 || add > 1 ? ' +' + add + packName : ' added'), false, { lines: x, n: n + 1, flash: i });
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

// ---- styles ----

const CSS = `
.ntr-route{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:start;gap:var(--space-3)}
.ntr-route .ix-btn{margin-top:22px}
.ntr-help{display:block;margin-top:4px;font-size:var(--text-xs);color:var(--text-muted)}
.ntr-items{display:flex;flex-direction:column;gap:var(--space-3)}
.ntr-scanrow{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.ntr-scanrow .ix-search{flex:1 1 240px;border-color:var(--primary)}
.ntr-scanrow .ix-search:has(input[aria-invalid="true"]){border-color:var(--text-danger)}
.ntr-msg{display:flex;align-items:center;gap:var(--space-2);margin:0;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-success)}
.ntr-msg.is-bad{color:var(--text-danger)}
.ntr-msg svg{flex:none}
.ntr-thumb{background:var(--fill-primary-soft);color:var(--primary)}
.ntr-code{display:block;font-family:var(--font-data);font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.ntr-table td{height:44px}
.ntr-step{display:inline-flex;align-items:center;border:1px solid var(--border-field);border-radius:var(--radius-lg);overflow:hidden;background:var(--surface-card)}
.ntr-step button{display:grid;place-items:center;width:28px;height:28px;border:0;background:none;color:var(--text-body);cursor:pointer}
.ntr-step button:hover{background:var(--surface-subtle);color:var(--text-heading)}
.ntr-step b{min-width:40px;text-align:center;font-weight:var(--weight-medium);font-variant-numeric:tabular-nums}
.ntr-short{color:var(--text-danger);font-weight:var(--weight-semibold)}
.ntr-flash td{animation:ntrFlash 900ms ease-out}
@keyframes ntrFlash{from{background:var(--fill-success-soft)}to{background:transparent}}
.ntr-pitem{cursor:default}
.ntr-pitem__ctl{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);margin-top:2px}
.ntr-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3) var(--space-4)}
.ntr-fields .is-wide{grid-column:1/-1}
.ntr-sum{display:flex;flex-direction:column;gap:var(--space-3)}
.ntr-sum .gc-btn{width:100%}
.ntr-warn{margin:0;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-error-soft);color:var(--text-danger);font-size:var(--text-xs)}
.ntr-note{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.ntr-sent{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);text-align:center}
.ntr-sent h2{display:flex;align-items:center;gap:var(--space-2);margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ntr-sent h2 svg{color:var(--text-success)}
.ntr-sent p{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.ntr-slip{padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);color:var(--text-heading)}
.ntr-slip div{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-body)}
@media (prefers-reduced-motion:reduce){.ntr-flash td{animation:none}}
@media (max-width:640px){
  .ntr-route{grid-template-columns:minmax(0,1fr)}
  .ntr-route .ix-btn{margin-top:0;justify-self:center}
  .ntr-fields{grid-template-columns:minmax(0,1fr)}
}
`;

// ---- markup ----

const BARS = [[0, 1], [2, 2], [6, 1], [9, 2], [13, 1], [15, 2], [20, 3], [24, 2], [27, 3], [31, 2], [35, 3], [40, 2], [45, 1], [48, 3], [54, 3], [58, 3], [64, 1], [67, 2], [71, 1], [73, 1], [75, 1], [77, 1], [79, 2], [84, 3], [89, 1], [92, 2], [96, 2], [99, 1], [101, 1], [103, 2], [107, 1], [110, 2], [114, 1], [118, 1], [120, 1], [122, 1], [124, 2], [127, 1], [129, 3], [133, 3], [138, 3], [142, 1], [144, 2], [147, 1], [151, 1], [154, 1], [158, 2]];

function Stepper({ r }) {
  return (
    <span className="ntr-step">
      <button type="button" aria-label={`Send fewer ${r.name}`} onClick={r.dec}><__Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
      <b>{r.qty}</b>
      <button type="button" aria-label={`Send more ${r.name}`} onClick={r.inc}><__Icon name="plus" width="16" height="16" aria-hidden="true" /></button>
    </span>
  );
}

export default class NewTransferScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="NewTransfer">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="stock-transfers" />
          <main className="gc-shell__main">
            <__Topbar crumb="Stock › Transfers" page="New transfer" placeholder="Search or scan any barcode" />
            <div className="gc-shell__content">
              <div className="ix-page ix-page--narrow">
                <RecordHeader back="/transfers" backLabel="Transfers" title="New transfer"
                  about="Send stock from one place to another. Stock leaves the sender when you send; it is added where it arrives when the slip and the items are scanned in on Transfers." />
                <form id="ntr-form" className="ix-record" noValidate onSubmit={v.submit} aria-label="New transfer">
                  <div className="ix-main">
                    <section className="ix-card ix-card--pad ntr-route" aria-label="From and to">
                      <div>
                        <label className="gc-label" htmlFor="tr-from">Send from<__Req /></label>
                        <select id="tr-from" className="gc-input gc-select" value={v.from} onChange={v.fromIn} aria-required="true" {...__inv(v.errs?.from, "tr-from-err")}>
                          <option value="">Choose a place</option>
                          {v.locs.map((l) => (<option key={l} value={l}>{l}</option>))}
                        </select>
                        <__Err id="tr-from-err" msg={v.errs?.from} />
                        <span className="ntr-help">Stock goes down when you send</span>
                      </div>
                      <button type="button" className="ix-btn ix-btn--icon" aria-label="Swap from and to" onClick={v.swap}><__Icon name="arrow-left-right" width="16" height="16" aria-hidden="true" /></button>
                      <div>
                        <label className="gc-label" htmlFor="tr-to">Send to<__Req /></label>
                        <select id="tr-to" className="gc-input gc-select" value={v.to} onChange={v.toIn} aria-required="true" {...__inv(v.errs?.to, "tr-to-err")}>
                          <option value="">Choose a place</option>
                          {v.locs.map((l) => (<option key={l} value={l}>{l}</option>))}
                        </select>
                        <__Err id="tr-to-err" msg={v.errs?.to} />
                        <span className="ntr-help">Stock goes up when they scan it in</span>
                      </div>
                    </section>

                    <section className="ix-card" aria-labelledby="ntr-items-h">
                      <div className="ix-card__head"><h2 id="ntr-items-h">Scan the items you are sending</h2></div>
                      <div className="ix-card__body ntr-items">
                        <p className="ntr-note">Pack as you scan. Each beep adds one.</p>
                        <div className="ntr-scanrow">
                          <label className="ix-search">
                            <__Icon name="scan-barcode" width="16" height="16" aria-hidden="true" />
                            <ScanInput id="tr-scan" type="search" placeholder="Scan an item or type a SKU, then Enter" phonePlaceholder="Scan or type a SKU" aria-label="Scan an item to send" {...__inv(v.itemsErr, "tr-items-err")} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); v.scan(e); } }} />
                          </label>
                          <button type="button" className="ix-btn" onClick={() => v.scan()}><__Icon name="camera" width="16" height="16" aria-hidden="true" />Scan with camera</button>
                        </div>
                        {v.hasMsg ? <p className={'ntr-msg' + (v.msgBad ? ' is-bad' : '')} role="status"><__Icon name="scan-barcode" width="16" height="16" aria-hidden="true" /><span>{v.msg}</span></p> : null}
                        <__Err id="tr-items-err" msg={v.itemsErr} />
                      </div>
                      <ul className="ix-plist" aria-label="Items to send">
                        {v.lines.map((r) => (
                          <li key={r.key}>
                            <div className="ix-pitem ntr-pitem">
                              <span className="ix-pitem__top"><b>{r.name}</b><span className={r.short ? 'ntr-short' : ''}>{`${r.left} left here`}</span></span>
                              <span className="ix-pitem__mid">{r.code} · {`${r.have} here`}</span>
                              <span className="ntr-pitem__ctl">
                                <Stepper r={r} />
                                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Remove ${r.name}`} onClick={r.remove}><__Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button>
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                      {v.lines.length ? (
                        <div className="ix-table-wrap">
                          <table className="ix-table ix-table--static gc-table--keep ntr-table">
                            <caption className="sr-only">Items to send</caption>
                            <thead>
                              <tr>
                                <th scope="col">Product</th>
                                <th scope="col" className="ix-num">Have here</th>
                                <th scope="col">Sending</th>
                                <th scope="col" className="ix-num">Left here</th>
                                <th scope="col"><span className="sr-only">Remove</span></th>
                              </tr>
                            </thead>
                            <tbody>
                              {v.lines.map((r) => (
                                <tr key={r.key} className={r.flash ? 'ntr-flash' : ''}>
                                  <td>
                                    <span className="ix-prod">
                                      <span className="ix-thumb ntr-thumb" aria-hidden="true">{r.initial}</span>
                                      <span className="ix-strong">{r.name}<span className="ntr-code">{r.code}</span></span>
                                    </span>
                                  </td>
                                  <td className="ix-num ix-muted">{r.have}</td>
                                  <td><Stepper r={r} /></td>
                                  <td className={'ix-num' + (r.short ? ' ntr-short' : '')}>{r.left}</td>
                                  <td className="ix-num"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Remove ${r.name}`} onClick={r.remove}><__Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                    </section>

                    <section className="ix-card" aria-labelledby="ntr-who-h">
                      <div className="ix-card__head"><h2 id="ntr-who-h">Who is taking it?</h2></div>
                      <div className="ix-card__body ntr-fields">
                        <div>
                          <label className="gc-label" htmlFor="tr-by">Carried by<__Req /></label>
                          <input id="tr-by" className="gc-input" type="text" value={v.by} onChange={v.byIn} aria-required="true" {...__inv(v.errs?.by, "tr-by-err")} />
                          <__Err id="tr-by-err" msg={v.errs?.by} />
                        </div>
                        <div>
                          <label className="gc-label" htmlFor="tr-date">Should arrive</label>
                          <input id="tr-date" className="gc-input" type="text" defaultValue="18 Sep 2026, before 6 PM" />
                        </div>
                        <div className="is-wide">
                          <label className="gc-label" htmlFor="tr-note">Note</label>
                          <input id="tr-note" className="gc-input" type="text" placeholder="Example: For the weekend sale" />
                        </div>
                      </div>
                    </section>
                  </div>

                  <aside className="ix-side">
                    {v.notSent ? (
                      <section className="ix-card" aria-labelledby="ntr-sum-h">
                        <div className="ix-card__head"><h2 id="ntr-sum-h">Transfer summary</h2></div>
                        <div className="ix-card__body ntr-sum">
                          <KV rows={[['Products', v.prods], ['Pieces', v.pcs], ['Stock value', <b key="v">{v.val}</b>]]} />
                          {v.tooMany ? <p className="ntr-warn" role="alert">You are sending more than you have of one product. Check the red number.</p> : null}
                          <button type="submit" className="gc-btn gc-btn--solid"><__Icon name="truck" width="16" height="16" aria-hidden="true" /> Send and print slip</button>
                          <button type="button" className="gc-btn gc-btn--neutral" onClick={v.saveLater}>Save, send later</button>
                          <__PhoneActionBar note={v.pcs + " pcs · " + v.val}><button type="submit" form="ntr-form" className="gc-btn gc-btn--solid">Send and print slip</button></__PhoneActionBar>
                          <p className="ntr-note">The slip has a barcode. The other side scans it, then scans the items in. Missing items are flagged at once.</p>
                        </div>
                      </section>
                    ) : (
                      <section className="ix-card ix-card--pad ntr-sent" aria-labelledby="ntr-sent-h">
                        <h2 id="ntr-sent-h"><__Icon name="circle-check" width="16" height="16" aria-hidden="true" />On the way</h2>
                        <p>{v.doneText}</p>
                        <div className="ntr-slip">
                          <svg width="160" height="34" viewBox="0 0 160 34" aria-hidden="true">
                            {BARS.map(([x, w]) => <rect key={x} x={x} y="0" width={w} height="34" fill="currentColor" />)}
                          </svg>
                          <div>{v.no}</div>
                        </div>
                        <__Link href="/transfers" className="ix-btn" style={{ width: '100%' }}>See all transfers</__Link>
                      </section>
                    )}
                  </aside>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
