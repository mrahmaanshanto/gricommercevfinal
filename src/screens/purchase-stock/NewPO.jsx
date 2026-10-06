'use client';
// Generated from design/templates/purchase-stock/NewPO.dc.html by scripts/convert-design.mjs.
// NewPO — Purchase & Stock module — New purchase order.
// Edit freely: this file is now the source for the screen.
// Saving stores the order in src/lib/purchaseOrders.js (Draft, or Sent when placed), so it shows in
// Purchase orders and in Receive goods' order picker. Suppliers and their credit terms come from
// src/lib/supplierBills.js; places from src/lib/locations.js.

import React from 'react';
import { DCLogic, Icon as __Icon, list as __list } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { PhoneActionBar as __PhoneActionBar, useIsPhone as __useIsPhone, InfoTip } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { toast as __toast } from '@/runtime/ui';
import { SUPPLIERS, getSuppliers, termsLabel } from '@/lib/supplierBills';
import { addPOs, getPOs } from '@/lib/purchaseOrders';
import { STOCK_PLACES, getReceivingPlaces } from '@/lib/locations';
import { productBy } from '@/lib/stock';
import { formatBDT, formatDate } from '@/lib/format';
import { clockNow } from '@/lib/settlements';

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
var CATALOG = [
  { name: 'Phone Ring Holder', code: '8941100500112', cost: 320, vat: 15 },
  { name: 'Anker 20W USB-C Charger', code: '8941100500235', cost: 540, vat: 15 },
  { name: 'Magnetic Wireless Charger 15W', code: '8941100500341', cost: 410, vat: 15 },
  { name: 'Cotton Face Towel (pack of 3)', code: '8941100500457', cost: 180, vat: 7.5 },
  { name: 'SIM Ejector Pin Pack', code: '8941100500563', cost: 95, vat: 15 }
];
var TERMS = [{ d: 0, label: 'Cash now' }, { d: 3, label: '3 days' }, { d: 7, label: '7 days' }, { d: 10, label: '10 days' }, { d: 14, label: '14 days' }, { d: 15, label: '15 days' }, { d: 30, label: '30 days' }, { d: 45, label: '45 days' }];
// the last order from each supplier among the demo purchase orders (Purchase orders shows them)
var DEMO_LAST = { 'Rahman Telecom': ['PO-2609-0024', '18 Sep 2026'], 'Dhaka Audio Imports': ['PO-2609-0023', '17 Sep 2026'], 'Chattogram Packaging Co.': ['PO-2609-0022', '16 Sep 2026'], 'Nabil Mobile House': ['PO-2609-0020', '12 Sep 2026'], 'Mim Enterprise': ['PO-2608-0017', '20 Aug 2026'] };
var FIRST_DAY = new Date(2026, 8, 18).getTime();   // first render, before the browser's date is read
var DAY = 864e5;
var BLANK = { lines: [], ship: 0, customs: 0, courier: 0, split: 'value', toast: '', flash: null, date: '', inv: '', note: '', errs: {}, saved: null, fileGone: true };
class Component extends DCLogic {
  st() {
    var s = this.state || {};
    var today = s.today || FIRST_DAY;
    return {
      lines: s.lines || [{ i: 0, qty: 60 }, { i: 1, qty: 48 }, { i: 2, qty: 40 }],
      ship: s.ship != null ? s.ship : 1500, customs: s.customs != null ? s.customs : 0, courier: s.courier != null ? s.courier : 600,
      split: s.split || 'value', term: s.term != null ? s.term : 30, next: s.next || 3, toast: s.toast || '', flash: s.flash,
      sup: s.sup != null ? s.sup : 'Rahman Telecom', date: s.date != null ? s.date : fmtDate(new Date(today + 7 * DAY)), errs: s.errs || {},
      place: s.place || 'Central Warehouse', sups: s.sups || SUPPLIERS, pos: s.pos || [], today: today,
      inv: s.inv || '', note: s.note || '', saved: s.saved || null, fileGone: !!s.fileGone
    };
  }
  componentDidMount() {
    var d = new Date(clockNow()); d.setHours(0, 0, 0, 0);   // the app clock (gc.clock.offset moves it for testing)
    this.setState({ sups: getSuppliers(), pos: getPOs(), today: d.getTime(), places: getReceivingPlaces() });   // live places that can receive deliveries
  }
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.st(), limit = this.props.approvalLimit ?? 50000;
    var set = function (patch) { self.setState(patch); };
    var sub = 0, vat = 0, pieces = 0;
    s.lines.forEach(function (l) { var p = CATALOG[l.i]; sub += p.cost * l.qty; vat += p.cost * l.qty * p.vat / 100; pieces += l.qty; });
    var extra = (+s.ship || 0) + (+s.customs || 0) + (+s.courier || 0);
    var items = s.lines.map(function (l, idx) {
      var p = CATALOG[l.i];
      var per = s.split === 'value' ? (sub ? extra * p.cost / sub : 0) : (pieces ? extra / pieces : 0);
      var upd = function (q) { var ls = s.lines.slice(); if (q <= 0) ls.splice(idx, 1); else ls[idx] = { i: l.i, qty: q }; set({ lines: ls }); };
      return {
        name: p.name, code: p.code, qty: l.qty, cost: bdt(p.cost), vat: p.vat + '%',
        landed: '৳' + (p.cost + per).toFixed(2), extra: '+৳' + per.toFixed(2) + ' extra',
        total: bdt(p.cost * l.qty * (1 + p.vat / 100)), rowCls: s.flash === l.i ? 'np-flash' : '',
        inc: function () { upd(l.qty + 1); }, dec: function () { upd(l.qty - 1); }, remove: function () { upd(0); }
      };
    });
    var total = sub + vat + extra;
    var d = new Date(s.today + s.term * DAY);
    var due = s.term === 0 ? 'Today, on delivery' : fmtDate(d);
    var supRow = s.sups.find(function (x) { return x.name === s.sup; }) || null;
    var mine = s.pos.filter(function (p) { return p.supplier === s.sup; });
    var lastPo = mine.length ? [mine[0].no, formatDate(mine[0].at)] : DEMO_LAST[s.sup] || null;
    var supNote = supRow ? s.sup + ' gives you ' + termsLabel(supRow.terms).replace('Pay on delivery', 'no credit: pay on delivery') + '.' : '';
    var lastNote = lastPo ? ' Last order: ' + lastPo[0] + ' on ' + lastPo[1] + '.' : ' No orders from them yet.';
    var admin = (this.props.role ?? 'admin') === 'admin';
    var needs = !admin && total > limit;
    var num = function (k) { return function (e) { var v = e.target.value.replace(/[^0-9]/g, ''); var p = {}; p[k] = v === '' ? 0 : +v; set(p); }; };
    // Validate, show each problem under its field and focus the first one. A draft only needs a supplier.
    // Saving stores the order: a draft or one waiting for an admin stays 'Draft'; a placed order is 'Sent'.
    var save = function (draft) {
      if (s.saved) { __toast(s.saved.no + ' is already saved. Start another order to make a new one.', { tone: 'info' }); return; }
      var er = {}, first = null, add = function (k, id, m) { er[k] = m; if (!first) first = id; };
      if (!s.sup) add('sup', 'po-sup', 'Choose the supplier you are buying from.');
      if (!draft && !s.date.trim()) add('date', 'po-date', 'Enter when you expect the delivery.');
      if (!draft && s.lines.length === 0) add('items', 'po-scan', 'Add at least one product to the order.');
      if (first) { set({ errs: er }); __focusSoon(first); return; }
      var status = draft || needs ? 'Draft' : 'Sent';
      var po = addPOs([{
        supplier: s.sup, place: s.place || 'Central Warehouse', status: status, approval: !draft && needs ? 'waiting' : undefined,
        lines: s.lines.map(function (l) { var p = CATALOG[l.i]; return { name: p.name, code: p.code, sku: (productBy(p.name) || {}).sku || '', qty: l.qty, cost: p.cost }; }),
        terms: s.term, expected: s.date.trim(), invoice: s.inv.trim(), note: s.note.trim(), extra: { ship: +s.ship || 0, customs: +s.customs || 0, courier: +s.courier || 0, split: s.split }
      }])[0];
      var how = draft ? 'saved as a draft' : needs ? 'saved and sent to an admin for approval' : 'placed with ' + s.sup;
      set({ errs: {}, saved: { no: po.no, status: status, how: how, total: po.total } });
      __toast(po.no + ' ' + how + ' · ' + formatBDT(po.total) + ' of products');
    };
    return {
      errs: s.errs, itemsErr: s.lines.length === 0 ? s.errs.items : '',
      sup: s.sup, hasSup: !!s.sup, date: s.date, supNote: supNote, lastNote: lastNote,
      supOptions: s.sups.map(function (x) { return x.name; }).sort(),
      supIn: function (e) {
        var name = e.target.value, row = s.sups.find(function (x) { return x.name === name; });
        var p = { sup: name, errs: __without(s.errs, 'sup') };
        if (row && TERMS.some(function (t) { return t.d === row.terms; })) p.term = row.terms;
        set(p);
      },
      place: s.place, places: (self.state && self.state.places) || STOCK_PLACES, placeIn: function (e) { set({ place: e.target.value }); },
      inv: s.inv, invIn: function (e) { set({ inv: e.target.value }); },
      scanInv: function () { var c = s.inv || 'INV-' + String(Math.floor(s.today / DAY) % 10000).padStart(4, '0'); set({ inv: c }); __toast('Supplier invoice ' + c + ' read'); },
      note: s.note, noteIn: function (e) { set({ note: e.target.value }); },
      hasFile: !s.fileGone, removeFile: function () { set({ fileGone: true }); __toast('rahman-quotation.pdf removed'); },
      addFile: function () { set({ fileGone: false }); __toast('Quotation attached'); },
      saved: s.saved, isSaved: !!s.saved, notSaved: !s.saved, poNo: s.saved ? s.saved.no : 'Number given when you save',
      savedHref: s.saved ? '/po-detail?no=' + encodeURIComponent(s.saved.no) : '/purchase-orders',
      startNew: function () { var d0 = new Date(clockNow()); d0.setHours(0, 0, 0, 0); self.setState(Object.assign({}, BLANK, { sups: getSuppliers(), pos: getPOs(), today: d0.getTime() })); },
      notReady: function (what) { return function () { __toast(what + ' is not available in this demo yet. Scan or add the products one by one.', { tone: 'info' }); }; },
      dateIn: function (e) { set({ date: e.target.value, errs: __without(s.errs, 'date') }); },
      submit: function (e) { if (e && e.preventDefault) e.preventDefault(); save(false); },
      saveDraft: function () { save(true); },
      items: items, itemCount: s.lines.length + ' products · ' + pieces + ' pieces', pieces: pieces,
      toast: s.toast,
      scan: function () {
        var i = s.next % CATALOG.length; var ls = s.lines.slice(); var found = -1;
        ls.forEach(function (l, k) { if (l.i === i) found = k; });
        var msg;
        if (found >= 0) { ls[found] = { i: i, qty: ls[found].qty + 1 }; msg = 'Scanned again: ' + CATALOG[i].name + ' — quantity +1'; }
        else { ls.push({ i: i, qty: 12 }); msg = 'Added ' + CATALOG[i].name + ' (' + CATALOG[i].code + ')'; }
        set({ lines: ls, next: s.next + 1, toast: msg, flash: i });
        clearTimeout(self.t); self.t = setTimeout(function () { self.setState({ toast: '', flash: null }); }, 2600);
      },
      ship: s.ship, customs: s.customs, courier: s.courier,
      shipIn: num('ship'), customsIn: num('customs'), courierIn: num('courier'),
      byValue: s.split === 'value', byQty: s.split !== 'value',
      setValue: function () { set({ split: 'value' }); }, setQty: function () { set({ split: 'qty' }); },
      terms: TERMS.map(function (t) { var on = t.d === s.term; return { label: t.label, on: on, pick: function () { set({ term: t.d }); } }; }),
      dueDate: due,
      sub: bdt(sub), vat: bdt(vat), extra: bdt(extra), total: bdt(total),
      needsApproval: needs, noApproval: !needs, isAdmin: admin, smallOrder: !admin && total <= limit,
      primaryLabel: needs ? 'Send for approval' : 'Place order'
    };
  }
}

// The scan box: a shorter hint on phones, where the full one is cut off.
function ScanInput({ phonePlaceholder, placeholder, ...rest }) {
  const phone = __useIsPhone();
  return <input {...rest} placeholder={phone && phonePlaceholder ? phonePlaceholder : placeholder} />;
}

// ---- styles ----

const CSS = `
.np-body{display:flex;flex-direction:column;gap:var(--space-3)}
.np-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.np-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.np-opt{font-weight:var(--weight-regular);color:var(--text-muted)}
.np-scan{display:flex;gap:var(--space-2)}
.np-in{position:relative;flex:1;min-width:0}
.np-in>svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--primary);pointer-events:none}
.np-in>input{padding-left:34px}
.np-inwrap{position:relative}
.np-inwrap>input{padding-right:40px}
.np-inwrap>.ix-btn{position:absolute;right:2px;top:50%;transform:translateY(-50%)}
.np-msg{display:flex;align-items:center;gap:var(--space-2);padding:6px 10px;border-radius:var(--radius-lg);background:var(--fill-success-soft);color:var(--text-success);font-size:var(--text-xs-plus);font-weight:var(--weight-medium)}
.np-tw{overflow-x:auto}
.np-tw .ix-table tbody tr{cursor:default}
.np-tw .ix-table tbody tr:hover td{background:none}
.np-tw .ix-table th,.np-tw .ix-table td{padding-left:8px;padding-right:8px}
.np-tw .ix-table th:first-child,.np-tw .ix-table td:first-child{padding-left:0}
.np-prod{display:block;min-width:160px;white-space:normal}
.np-prod b{display:block;font-weight:var(--weight-medium);color:var(--text-heading)}
.np-prod small{display:block;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.np-step{display:inline-flex;align-items:center;border:1px solid var(--border-field);border-radius:var(--radius-lg);overflow:hidden}
.np-step b{min-width:36px;font-weight:var(--weight-medium);color:var(--text-heading);text-align:center}
.np-step .ix-btn{border:0;border-radius:0;box-shadow:none}
.np-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.np-flash td{animation:npFlash 900ms ease-out}
@keyframes npFlash{from{background:var(--fill-success-soft)}to{background:transparent}}
.np-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.np-chip{height:28px;padding:0 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.np-chip[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.np-money{position:relative}
.np-money>span{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:var(--text-sm);color:var(--text-muted)}
.np-money>input{padding-left:26px}
.np-file{display:flex;align-items:center;gap:var(--space-2);padding:6px 8px;border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-xs-plus)}
.np-file>span{flex:1;min-width:0}
.np-note{min-height:88px;padding:8px 12px;resize:vertical;line-height:20px}
.np-total{display:flex;align-items:baseline;justify-content:space-between;gap:var(--space-2);padding-top:var(--space-2);border-top:1px solid var(--border-subtle);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.np-total b{font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold)}
.np-saved{display:flex;flex-direction:column;align-items:flex-start;gap:var(--space-2);padding:var(--space-3);border-radius:var(--radius-lg);background:var(--fill-success-soft);color:var(--text-success);font-size:var(--text-sm)}
.np-id{font-family:var(--font-data)}
@media (max-width:640px){
  .np-grid{grid-template-columns:minmax(0,1fr)}
  .np-scan{flex-direction:column}
  .np-chip{height:36px}
  .npo-lines.gc-cards-on>tbody{padding:0}
}
`;

// ---- markup ----

export default class NewPOScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="NewPO">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="po-orders" />
          <main className="gc-shell__main">
            <__Topbar crumb="Purchase › Purchase orders" page="New purchase order" placeholder="Search or scan any barcode" />
            <div className="gc-shell__content">
              <div className="ix-page ix-page--narrow">
                <RecordHeader back="/purchase-orders" backLabel="Back to purchase orders" title="New purchase order" meta={v.poNo}
                  about="Send the order to the supplier on WhatsApp or print it. Every printed order carries its own barcode, so your staff can scan it when the goods arrive."
                  secondary={v.isSaved ? [] : [{ label: 'Save as draft', onClick: v.saveDraft }]}
                  more={[
                    { label: 'Copy a past order', onClick: v.notReady('Copying a past order') },
                    { label: 'Import CSV', onClick: v.notReady('Importing a CSV file') },
                    { label: 'Low-stock list (8 items)', href: '/requests' },
                  ]}
                  primary={v.isSaved ? { label: 'Open ' + v.saved.no, href: v.savedHref } : { label: v.primaryLabel, onClick: v.submit }} />

                <form id="npo-form" noValidate onSubmit={v.submit} aria-label="New purchase order" className="ix-record">
                  <div className="ix-main">
                    <section className="ix-card" aria-labelledby="np-h-sup">
                      <div className="ix-card__head"><h2 id="np-h-sup">Supplier and delivery</h2></div>
                      <div className="ix-card__body np-body">
                        <div className="gc-cols-2 np-grid">
                          <div className="np-field">
                            <label className="gc-label" htmlFor="po-sup">Supplier<__Req /></label>
                            <select id="po-sup" className="gc-input gc-select" value={v.sup} onChange={v.supIn} aria-required="true" {...__inv(v.errs?.sup, "po-sup-err")}>
                              <option value="">Choose a supplier</option>
                              {__list(v.supOptions).map((name) => <option key={name} value={name}>{name}</option>)}
                            </select>
                            <__Err id="po-sup-err" msg={v.errs?.sup} />
                          </div>
                          <div className="np-field">
                            <label className="gc-label" htmlFor="po-wh">Receive at warehouse<__Req /></label>
                            <select id="po-wh" className="gc-input gc-select" aria-required="true" value={v.place} onChange={v.placeIn}>
                              {__list(v.places).map((x) => <option key={x} value={x}>{x}</option>)}
                            </select>
                          </div>
                          <div className="np-field">
                            <label className="gc-label" htmlFor="po-date">Expected delivery<__Req /></label>
                            <input id="po-date" className="gc-input" type="text" value={v.date} onChange={v.dateIn} aria-required="true" {...__inv(v.errs?.date, "po-date-err")} />
                            <__Err id="po-date-err" msg={v.errs?.date} />
                          </div>
                          <div className="np-field">
                            <label className="gc-label" htmlFor="po-inv">Supplier invoice no. <span className="np-opt">(optional)</span></label>
                            <div className="np-inwrap">
                              <input id="po-inv" className="gc-input" type="text" placeholder="Type or scan" value={v.inv} onChange={v.invIn} />
                              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Scan supplier invoice" onClick={v.scanInv}><__Icon name="scan-barcode" width="16" height="16" aria-hidden="true" /></button>
                            </div>
                          </div>
                        </div>
                        {v.hasSup ? <p className="gc-help" style={{ margin: 0 }}><b>{v.supNote}</b>{v.lastNote}</p> : null}
                      </div>
                    </section>

                    <section className="ix-card" aria-labelledby="np-h-items">
                      <div className="ix-card__head"><h2 id="np-h-items">Products</h2><span className="ix-muted">{v.itemCount}</span></div>
                      <div className="ix-card__body np-body">
                        <div className="np-scan">
                          <label className="np-in">
                            <__Icon name="scan-barcode" width="16" height="16" aria-hidden="true" />
                            <ScanInput id="po-scan" className="gc-input" type="search" placeholder="Scan a barcode or type product name" phonePlaceholder="Scan or type a product" aria-label="Scan a barcode or type product name" {...__inv(v.itemsErr, "po-items-err")} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); v.scan(); } }} />
                          </label>
                          <button type="button" className="ix-btn" onClick={v.scan}><__Icon name="camera" width="16" height="16" aria-hidden="true" /><span>Scan with camera</span></button>
                        </div>
                        {v.toast ? <div className="np-msg" role="status"><__Icon name="scan-barcode" width="16" height="16" aria-hidden="true" /><span>{v.toast}</span></div> : null}
                        {v.items.length ? (
                          <div className="np-tw">
                            <table className="ix-table npo-lines">
                              <caption className="sr-only">Products on this order</caption>
                              <thead>
                                <tr>
                                  <th scope="col">Product</th>
                                  <th scope="col">Quantity</th>
                                  <th scope="col" className="ix-num">Buy price</th>
                                  <th scope="col" className="ix-num">Real cost / unit</th>
                                  <th scope="col" className="ix-num">Line total</th>
                                  <th scope="col"><span className="sr-only">Remove</span></th>
                                </tr>
                              </thead>
                              <tbody>
                                {__list(v.items).map((it, $index) => (
                                  <tr key={it.code + $index} className={it.rowCls}>
                                    <td><span className="np-prod"><b>{it.name}</b><small>{it.code}</small></span></td>
                                    <td>
                                      <span className="np-step">
                                        <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label={`Less ${it.name}`} onClick={it.dec}><__Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
                                        <b>{it.qty}</b>
                                        <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label={`More ${it.name}`} onClick={it.inc}><__Icon name="plus" width="16" height="16" aria-hidden="true" /></button>
                                      </span>
                                    </td>
                                    <td className="ix-num">{it.cost}<span className="np-sub">VAT {it.vat}</span></td>
                                    <td className="ix-num">{it.landed}<span className="np-sub">{it.extra}</span></td>
                                    <td className="ix-num ix-strong">{it.total}</td>
                                    <td><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Remove ${it.name}`} onClick={it.remove}><__Icon name="x" width="16" height="16" aria-hidden="true" /></button></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : null}
                        <__Err id="po-items-err" msg={v.itemsErr} />
                        <div className="np-row">
                          <button type="button" className="ix-btn ix-btn--sm" onClick={v.scan}><__Icon name="plus" width="16" height="16" aria-hidden="true" /><span>Add product</span></button>
                          <button type="button" className="ix-btn ix-btn--sm" onClick={v.notReady('Importing lines from a CSV file')}><span>Import lines from CSV</span></button>
                        </div>
                      </div>
                    </section>

                    <section className="ix-card" aria-labelledby="np-h-extra">
                      <div className="ix-card__head"><h2 id="np-h-extra">Extra costs <InfoTip text="Transport, customs and courier are added to each product’s cost, so your profit is correct. Don’t know yet? Skip this — you can add them when the goods arrive." /></h2></div>
                      <div className="ix-card__body np-body">
                        <div className="gc-cols-2 np-grid">
                          <div className="np-field">
                            <label className="gc-label" htmlFor="x-ship">Transport / shipping</label>
                            <div className="np-money"><span>৳</span><input id="x-ship" className="gc-input" type="text" inputMode="numeric" value={v.ship} onChange={v.shipIn} /></div>
                          </div>
                          <div className="np-field">
                            <label className="gc-label" htmlFor="x-cus">{"Customs & LC charges"}</label>
                            <div className="np-money"><span>৳</span><input id="x-cus" className="gc-input" type="text" inputMode="numeric" value={v.customs} onChange={v.customsIn} /></div>
                            <span className="np-sub">For imported goods</span>
                          </div>
                          <div className="np-field">
                            <label className="gc-label" htmlFor="x-cour">{"Courier & labour"}</label>
                            <div className="np-money"><span>৳</span><input id="x-cour" className="gc-input" type="text" inputMode="numeric" value={v.courier} onChange={v.courierIn} /></div>
                          </div>
                        </div>
                        <div className="np-row">
                          <span className="gc-label" style={{ margin: 0 }}>Share extra costs by</span>
                          <button type="button" className="np-chip" aria-pressed={v.byValue} onClick={v.setValue}>Product price</button>
                          <button type="button" className="np-chip" aria-pressed={v.byQty} onClick={v.setQty}>Number of pieces</button>
                        </div>
                      </div>
                    </section>

                    <section className="ix-card" aria-labelledby="np-h-pay">
                      <div className="ix-card__head"><h2 id="np-h-pay">Payment, files and notes</h2></div>
                      <div className="ix-card__body np-body">
                        <div className="np-field">
                          <span className="gc-label">How long before you must pay the supplier?</span>
                          <div className="np-row">
                            {__list(v.terms).map((tm) => <button key={tm.label} type="button" className="np-chip" aria-pressed={tm.on} onClick={tm.pick}>{tm.label}</button>)}
                          </div>
                          <span className="gc-help">Payment due on <b>{v.dueDate}</b>. We will remind you 3 days before.</span>
                        </div>
                        <div className="gc-cols-2 np-grid">
                          <div className="np-field">
                            <span className="gc-label">Supplier invoice or photo</span>
                            <button type="button" className="ix-btn" style={{ alignSelf: 'flex-start' }} onClick={v.addFile}><__Icon name="camera" width="16" height="16" aria-hidden="true" /><span>Add file or photo</span></button>
                            {v.hasFile ? (
                              <div className="np-file">
                                <__Icon name="file-text" width="16" height="16" aria-hidden="true" />
                                <span>rahman-quotation.pdf · 240 KB</span>
                                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Remove file" onClick={v.removeFile}><__Icon name="x" width="16" height="16" aria-hidden="true" /></button>
                              </div>
                            ) : null}
                          </div>
                          <div className="np-field">
                            <label className="gc-label" htmlFor="po-note">Note</label>
                            <textarea id="po-note" className="gc-input np-note" value={v.note} onChange={v.noteIn} placeholder="Example: Deliver after 3 PM. Check expiry dates." />
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="ix-side">
                    <section className="ix-card" aria-labelledby="np-h-total">
                      <div className="ix-card__head"><h2 id="np-h-total">Order total</h2></div>
                      <div className="ix-card__body np-body">
                        <KV rows={[['Products (' + v.pieces + ' pcs)', v.sub], ['VAT', v.vat], ['Extra costs', v.extra]]} />
                        <div className="np-total"><span>Total</span><b>{v.total}</b></div>
                        <KV rows={[['Pay by', v.dueDate]]} />
                        {v.needsApproval ? <div className="gc-alert gc-alert--soft gc-alert--warning" role="status"><span><b>Admin approval needed.</b> Staff orders above ৳50,000 are checked by an admin before they go to the supplier.</span></div> : null}
                        {v.isAdmin ? <p className="gc-help" style={{ margin: 0 }}><b>You’re ordering as admin.</b> No approval needed — the order goes straight to the supplier.</p> : null}
                        {v.smallOrder ? <p className="gc-help" style={{ margin: 0 }}>Under ৳50,000 — no approval needed. You can order right away.</p> : null}
                        {v.isSaved ? (
                          <div className="np-saved" role="status">
                            <span><b className="np-id">{v.saved?.no}</b> {v.saved?.how}. It is in Purchase orders{v.saved?.status === "Sent" ? " and ready to receive when the goods arrive" : ""}.</span>
                            <button type="button" className="ix-btn ix-btn--sm" onClick={v.startNew}>Start another order</button>
                          </div>
                        ) : (
                          <__PhoneActionBar note={"Total " + v.total}><button type="submit" form="npo-form" className="gc-btn gc-btn--solid">{v.primaryLabel}</button></__PhoneActionBar>
                        )}
                      </div>
                    </section>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
