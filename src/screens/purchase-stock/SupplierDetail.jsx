'use client';
// Supplier — one supplier (/supplier-detail?id=<supplier id>, from Suppliers & payables), laid out like a Shopify
// record: back to the list, the supplier's name and what is owed, then the ledger views on the left (ledger, bills,
// payment history, due dates, purchase orders) and the facts on the right (contact, supplies, credit terms).
// Bills, payments and credit notes come from src/lib/supplierBills.js, purchase orders from src/lib/purchaseOrders.js
// (plus the demo orders), and paying takes the money out of a ledger account (src/lib/ledger.js).

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { Dialog, StatusBadge } from '@/components/ui';
import { RecordHeader, MetricStrip, IndexTabs, KV } from '@/components/ui/IndexKit';
import { toast as __toast } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { EMPLOYEES } from '@/lib/posStore';
import { accountBy, accountsForMethod, balanceOf, getEntries } from '@/lib/ledger';
import { getPOs, poPieces, poReceived, PO_STATUS_TONE, DEMO_POS } from '@/lib/purchaseOrders';
import { getDb, demoDb, findSupplier, totalsOf, ledgerOf, billsOf, paymentsOf, billLeft, billStatus, dayStart, daysFrom, paySupplier } from '@/lib/supplierBills';

// ---- logic ----

function money(n) { var s = String(Math.round(Math.abs(n))); var last = s.slice(-3), rest = s.slice(0, -3); if (rest) s = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last; else s = last; return (n < 0 ? '−' : '') + '৳' + s; }
function num(x) { return +(String(x).replace(/[^\d.]/g, '').replace(/^$/, '0')) || 0; }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
var ME = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function D(ms) { var d = new Date(ms); return d.getDate() + ' ' + ME[d.getMonth()]; }
var DAY = 864e5;
var T = {
  back: 'Back', print: 'Print / PDF ledger', pay: 'Pay', contact: 'Contact', call: 'Call', addr: 'Address', supplies: 'Supplies',
  kOwe: 'Total payable', kToday: 'Overdue', kYear: 'Bought', kPaid: 'Paid in total',
  cDate: 'Date', cDesc: 'Details', cBuy: 'Bought (+)', cPay: 'Paid or credit (−)', cBal: 'Balance',
  cNo: 'Bill', cTotal: 'Total', cPaid: 'Paid', cDue: 'Due date', cStatus: 'Status', seePhoto: 'View photo',
  cAmt: 'Amount', cMethod: 'Method', cWho: 'Paid by', cFor: 'For bills',
  remind: 'Remind me the day before', remindHint: 'You get a phone notification and SMS at 9:00 AM', remindRow: 'Remind',
  payTitle: 'Pay supplier', amount: 'Amount', method: 'Pay with', which: 'Which bills this settles', whichHint: 'Ticking fills in the amount for you',
  note: 'Note or reference', notePh: 'e.g. handed to the owner, or TrxID', paid: 'Paid', nowOwe: 'Owed now', after: 'Left after this',
  photoTitle: 'Bill photo', close: 'Close', cancel: 'Cancel'
};
var METHODS = ['Cash', 'bKash', 'Nagad', 'Bank'];
var TABS = [['ledger', 'Ledger'], ['inv', 'Bills'], ['pays', 'Payment history'], ['due', 'Due dates'], ['po', 'Purchase orders']];
// the demo purchase orders' words and tones (the same rows Purchase orders shows)
var DEMO_PO_LABEL = { draft: 'Draft', approval: 'Waiting for approval', approved: 'Approved', ordered: 'Ordered', partial: 'Partly received', received: 'Received', closed: 'Closed', cancelled: 'Cancelled' };
var DEMO_PO_TONE = { draft: 'slate', approval: 'warning', approved: 'info', ordered: 'primary', partial: 'warning', received: 'success', closed: 'slate', cancelled: 'error' };
var DEMO = demoDb();
var FIRST_DAY = new Date(2026, 8, 29).getTime();

class Component extends DCLogic {
  componentDidMount() {
    var id = new URLSearchParams(window.location.search).get('id') || 'tli';
    this.setState({ ready: true, sid: id, today: dayStart() });
    this.reload();
  }
  reload() { this.setState({ db: getDb(), entries: getEntries(), pos: getPOs() }); }
  renderVals() {
    var self = this, s = this.state || {};
    var base = { t: T };
    if (!s.ready) return assign(base, { ready: false, emptyMsg: 'Opening the supplier ledger…' });
    var db = s.db || DEMO, today = s.today || FIRST_DAY, entries = s.entries || [];
    var sup = findSupplier(s.sid, db.suppliers);
    if (!sup) return assign(base, { ready: false, emptyMsg: 'This supplier is not on your list. Go back to Suppliers & payables and open a ledger from there.' });
    var t = assign(assign({}, T), {
      name: sup.name,
      hsub: 'Supplier · ' + sup.kind + (sup.since ? ' · with you since ' + sup.since : ''),
      person: sup.person || sup.name, addrV: sup.address || 'Address not added yet',
      credit: sup.terms ? 'Gives ' + sup.terms + ' days’ credit' : 'Pay on delivery',
      creditHint: sup.terms ? 'Pay within ' + sup.terms + ' days of delivery' : 'Bills are paid when the goods arrive',
      ledgerNote: 'Balance is what you owe ' + sup.name + '. Credit notes from returned goods lower it.'
    });
    var tot = totalsOf(sup.id, db, today);
    var led = ledgerOf(sup.id, db);
    var bills = billsOf(sup.id, db).slice().sort(function (a, b) { return b.at - a.at; });
    var pays = paymentsOf(sup.id, db).slice().sort(function (a, b) { return b.at - a.at; });
    var open = tot.open, lp = pays[0];
    var overdueBills = open.filter(function (b) { return daysFrom(b.due, today) < 0; });
    var tab = s.tab || 'ledger';
    var remOn = s.remind == null ? true : s.remind;
    var remRow = s.remRow || {};
    var isToday = function (ms) { return dayStart(ms) === today; };
    var accName = function (id) { var a = accountBy(id); return a ? a.name.split(' · ')[0] : ''; };

    // ---- pay window
    var pm = s.pm || 'Cash';
    var accounts = accountsForMethod(pm).map(function (a) { var bal = balanceOf(a.id, entries); return { id: a.id, bal: bal, label: a.name + ' · ' + money(bal) + ' available' }; });
    var acc = accounts.find(function (a) { return a.id === s.acc; }) || accounts[0] || null;
    var ticks = s.ticks || {};
    var ticked = open.filter(function (b) { return ticks[b.no]; });
    var tickSum = ticked.reduce(function (n, b) { return n + billLeft(b); }, 0);
    var amt = s.payAmt == null ? tickSum : Math.min(s.payAmt, tickSum);
    var short = acc ? amt > acc.bal : true;

    var poRows = (s.pos || []).filter(function (p) { return p.supplier === sup.name; }).map(function (p) {
      return { no: p.no, date: D(p.at), label: p.status + (p.approval === 'waiting' ? ' · needs approval' : ''), tone: PO_STATUS_TONE[p.status] || 'slate', pieces: poReceived(p.lines) + ' of ' + poPieces(p.lines), total: money(p.total) };
    }).concat(DEMO_POS.filter(function (r) { return r.supplier === sup.name; }).map(function (r) {
      return { no: r.no, date: D(r.at), label: DEMO_PO_LABEL[r.s], tone: DEMO_PO_TONE[r.s], pieces: r.got + ' of ' + r.of, total: money(r.total) };
    })).map(function (p) { return assign(p, { href: '/po-detail?no=' + encodeURIComponent(p.no) }); });

    return assign(base, {
      ready: true, t: t, mobile: sup.phone,
      call: function () { __toast('Calling ' + (sup.person || sup.name) + '… ' + sup.phone, { tone: 'info' }); },
      print: function () { __toast('Ledger PDF of ' + sup.name + ' is ready to print · ' + plural(led.length, 'line')); },
      goods: String(sup.goods || '').split(',').map(function (x) { return x.trim(); }).filter(function (x) { return x && x !== '—'; }).map(function (x) { return x.charAt(0).toUpperCase() + x.slice(1); }),
      overdue: overdueBills.length > 0,
      k: {
        owe: money(tot.payable), oweN: open.length ? plural(open.length, 'bill') : 'Nothing owed',
        today: money(tot.overdue), todayN: tot.today ? money(tot.today) + ' due today' : overdueBills.length ? plural(overdueBills.length, 'bill') : 'Nothing overdue',
        year: money(tot.bought), yearN: bills.length ? 'since ' + D(tot.first) : 'No bills yet',
        paid: money(tot.paid), paidN: lp ? 'last ' + D(lp.at) : 'No payment yet'
      },
      tabs: TABS.map(function (o) { return { key: o[0], id: 'sd-tab-' + o[0], label: o[1], on: o[0] === tab, onClick: function () { self.setState({ tab: o[0] }); } }; }),
      isLedger: tab === 'ledger', isInv: tab === 'inv', isPays: tab === 'pays', isDue: tab === 'due', isPo: tab === 'po',
      ledger: led.map(function (r) {
        var it = r.item;
        var desc = r.kind === 'bill' ? 'Bill #' + r.no + ' — goods bought' + (it.po ? ' · ' + it.po : '') + (it.grn ? ' · ' + it.grn : '')
          : r.kind === 'payment' ? 'Paid (' + it.method + (it.account ? ', ' + accName(it.account) : '') + ')' + (it.bills.length ? ' · ' + it.bills.join(', ') : '')
          : 'Credit note ' + r.no + ' — goods returned' + (it.ret ? ' · ' + it.ret : '');
        return { key: r.kind + r.no, date: D(r.at) + (isToday(r.at) ? ' (today)' : ''), desc: desc, buy: r.plus ? money(r.plus) : '', pay: r.minus ? money(r.minus) : '', bal: money(r.balance) };
      }),
      ledgerEmpty: 'No bills or payments yet. A bill is added when you receive goods from ' + sup.name + '.',
      invs: bills.map(function (b) {
        var left = billLeft(b), st = billStatus(b, today), off = daysFrom(b.due, today);
        var pill = st === 'Paid' ? ['Paid in full', 'success'] : st === 'Overdue' ? ['Overdue · ' + money(left), 'error'] : off === 0 ? ['Due today · ' + money(left), 'error'] : ['Owe ' + money(left), 'warning'];
        var what = b.lines.length ? plural(b.lines.reduce(function (n, l) { return n + l.qty; }, 0), 'piece') : b.po || 'Supplier bill';
        return { no: b.no, sub: D(b.at) + ' · ' + what + (b.grn ? ' · ' + b.grn : ''), total: money(b.amount), paid: money((b.paid || 0) + (b.credited || 0)), due: D(b.due), st: pill[0], tone: pill[1], photo: function () { self.setState({ photo: b.no }); } };
      }),
      pays: pays.map(function (p) {
        return { key: p.no || String(p.at), date: D(p.at), amt: money(p.amount), m: p.method, ref: [accName(p.account), p.ref].filter(Boolean).join(' · '), who: p.by, inv: p.bills.join(', ') || '—' };
      }),
      remind: { on: remOn, toggle: function () { self.setState({ remind: !remOn }); } },
      sched: open.map(function (b) {
        var off = daysFrom(b.due, today), on = remRow[b.no] !== false && remOn;
        return {
          due: D(b.due), rel: off === 0 ? 'Today' : off < 0 ? plural(-off, 'day') + ' late' : 'In ' + plural(off, 'day'), tone: off <= 0 ? 'error' : 'neutral', inv: b.no,
          sub: 'Bought ' + D(b.at) + ' · reminder on ' + D(b.due - DAY) + (off <= 1 ? ' (sent)' : ''),
          amt: money(billLeft(b)), on: on,
          toggle: function () { var o = assign({}, remRow); o[b.no] = !on; self.setState({ remRow: o }); __toast(on ? 'No reminder for ' + b.no : 'Reminder set for ' + b.no); }
        };
      }),
      noDue: open.length === 0,
      pos: poRows, noPos: poRows.length === 0,
      payOpen: !!s.payOpen,
      openPay: function () {
        if (!open.length) { __toast('Nothing is owed to ' + sup.name, { tone: 'info' }); return; }
        var o = {}; o[open[0].no] = 1;
        self.setState({ payOpen: true, ticks: o, payAmt: null, pm: 'Cash', acc: null, payNote: '', payBy: s.payBy || EMPLOYEES[2].name });
      },
      closePay: function () { self.setState({ payOpen: false }); },
      pm: {
        amtTxt: String(s.payAmt == null ? tickSum : s.payAmt), amtMoney: money(amt), left: money(Math.max(0, tot.payable - amt)),
        typeAmt: function (e) { self.setState({ payAmt: num(e.target.value) }); },
        methods: METHODS.map(function (m) { return { k: m, on: m === pm, pick: function () { self.setState({ pm: m, acc: null }); } }; }),
        accounts: accounts, acc: acc ? acc.id : '', accIn: function (e) { self.setState({ acc: e.target.value }); },
        short: short && amt > 0, accMsg: !acc ? 'No account for this method' : amt > acc.bal ? 'This account holds ' + money(acc.bal) + ', less than ' + money(amt) + '.' : money(acc.bal - amt) + ' will be left in this account.',
        staff: EMPLOYEES.map(function (e) { return e.name; }), by: s.payBy || EMPLOYEES[2].name, byIn: function (e) { self.setState({ payBy: e.target.value }); },
        note: s.payNote || '', noteIn: function (e) { self.setState({ payNote: e.target.value }); },
        invs: open.map(function (b) {
          var on = !!ticks[b.no], off = daysFrom(b.due, today);
          return {
            no: b.no, sub: 'Bought ' + D(b.at), due: off === 0 ? 'Today' : off < 0 ? plural(-off, 'day') + ' late' : D(b.due), tone: off <= 0 ? 'warning' : 'neutral', amt: money(billLeft(b)), on: on,
            toggle: function () { var o = assign({}, ticks); if (on) delete o[b.no]; else o[b.no] = 1; self.setState({ ticks: o, payAmt: null }); }
          };
        }),
        confirm: function () {
          if (!ticked.length) { __toast('Tick the bills this payment settles', { tone: 'error' }); return; }
          if (!amt) { __toast('Enter the amount first', { tone: 'error' }); return; }
          if (!acc) { __toast('Choose the account the money leaves from', { tone: 'error' }); return; }
          if (amt > acc.bal) { __toast(accName(acc.id) + ' does not hold ' + money(amt) + '. Choose another account or pay less.', { tone: 'error' }); return; }
          var done = paySupplier({ supplier: sup.id, bills: ticked.map(function (b) { return b.no; }), amount: amt, method: pm, account: acc.id, by: s.payBy || EMPLOYEES[2].name, ref: (s.payNote || '').trim() });
          self.setState({ payOpen: false, ticks: null, payAmt: null, tab: 'ledger' });
          self.reload();
          __toast('Paid ' + money(done.amount) + ' to ' + sup.name + ' from ' + accName(acc.id) + '. Still owed: ' + money(Math.max(0, tot.payable - done.amount)) + '.');
        }
      },
      photoOpen: !!s.photo, photoName: (s.photo || '') + '.jpg', closePhoto: function () { self.setState({ photo: null }); }
    });
  }
}

// ---- styles ----

const CSS = `
.sd-id{font-family:var(--font-data)}
.sd-tw{overflow-x:auto}
.sd-tw .ix-table tbody tr{cursor:default}
.sd-tw .ix-table tbody tr:hover td{background:none}
.sd-tw .ix-table td.sd-wrap{white-space:normal;min-width:220px}
.sd-tw--link .ix-table tbody tr{cursor:pointer}
.sd-tw--link .ix-table tbody tr:hover td{background:var(--surface-subtle)}
.sd-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sd-plus{color:var(--text-warning)}
.sd-minus{color:var(--text-success)}
.sd-foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.sd-foot b{font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sd-empty{margin:0;padding:var(--space-4);font-size:var(--text-sm);color:var(--text-muted)}
.sd-remind{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.sd-remind>div{flex:1;min-width:0}
.sd-remind b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.sd-side{display:flex;flex-direction:column;gap:var(--space-2)}
.sd-person{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sd-phone{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-family:var(--font-data);font-size:var(--text-sm);color:var(--text-heading)}
.sd-chips{display:flex;flex-wrap:wrap;gap:6px}
.sd-credit b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sd-credit span{font-size:var(--text-xs-plus);color:var(--text-muted)}
.sd-form{display:flex;flex-direction:column;gap:var(--space-4)}
.sd-amt{display:flex;gap:var(--space-3);align-items:flex-end}
.sd-amt>label{flex:1;min-width:0}
.sd-after{flex:none;display:flex;flex-direction:column;justify-content:center;min-width:150px;height:var(--control-height);padding:0 var(--space-3);border-radius:var(--radius-lg);background:var(--fill-warning-soft);font-size:var(--text-xs);color:var(--text-warning)}
.sd-after b{font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold)}
.sd-fld{display:flex;flex-direction:column;gap:6px;min-width:0}
.sd-methods{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.sd-chip{flex:1 1 0;min-width:72px;height:32px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.sd-chip[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.sd-bills{display:flex;flex-direction:column;gap:6px}
.sd-bill{display:flex;align-items:center;gap:var(--space-3);width:100%;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;font-size:var(--text-sm);text-align:left;cursor:pointer}
.sd-bill[aria-checked="true"]{border-color:var(--primary);background:var(--fill-primary-soft)}
.sd-bill>input{pointer-events:none;width:16px;height:16px;accent-color:var(--primary)}
.sd-bill>span:nth-child(2){flex:1;min-width:0}
.sd-bill b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sd-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.sd-photo{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--space-2);height:320px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle);font-family:var(--font-data);font-size:var(--text-sm);color:var(--text-muted)}
@media (max-width:640px){
  .sd-amt{flex-direction:column;align-items:stretch}
  .sd-two{grid-template-columns:minmax(0,1fr)}
  .sd-chip{height:36px}
}
`;

// ---- markup ----

export default class SupplierDetailScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const t = v.t || T;
    return (
      <div className="dc-screen ds" data-screen="SupplierDetail">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="po-suppliers" />
          <main className="gc-shell__main">
            <__Topbar crumb="Purchase" page="Supplier ledger" placeholder="Search products, customers or memo no." />
            <div className="gc-shell__content">
              <div className="ix-page">
                {!v.ready ? (<>
                  <RecordHeader back="/suppliers" backLabel="Back to Suppliers & payables" title="Supplier ledger" />
                  <section className="ix-card" role="status"><p className="sd-empty">{v.emptyMsg}</p></section>
                </>) : (<>
                  <RecordHeader back="/suppliers" backLabel={t.back} title={t.name}
                    badges={v.overdue ? <StatusBadge tone="error">Overdue</StatusBadge> : null}
                    meta={t.hsub}
                    about={t.ledgerNote}
                    secondary={[{ label: t.print, icon: 'printer', onClick: v.print }]}
                    more={[{ label: 'New purchase order', href: '/new-po' }, { label: 'Return goods', href: '/supplier-return' }]}
                    primary={{ label: t.pay, icon: 'hand-coins', onClick: v.openPay }} />

                  <MetricStrip label="Supplier totals" items={[
                    { label: t.kOwe, value: v.k.owe, sub: v.k.oweN },
                    { label: t.kToday, value: v.k.today, sub: v.k.todayN },
                    { label: t.kYear, value: v.k.year, sub: v.k.yearN },
                    { label: t.kPaid, value: v.k.paid, sub: v.k.paidN },
                  ]} />

                  <div className="ix-record">
                    <div className="ix-main">
                      <section className="ix-card" aria-label="Supplier ledger">
                        <div className="ix-bar"><IndexTabs tabs={v.tabs} label="Ledger views" /></div>

                        {v.isLedger ? (<>
                          {v.ledger.length ? (
                            <div className="sd-tw">
                              <table className="ix-table">
                                <caption className="sr-only">Ledger</caption>
                                <thead><tr><th scope="col">{t.cDate}</th><th scope="col">{t.cDesc}</th><th scope="col" className="ix-num">{t.cBuy}</th><th scope="col" className="ix-num">{t.cPay}</th><th scope="col" className="ix-num">{t.cBal}</th></tr></thead>
                                <tbody>
                                  {v.ledger.map((r) => (
                                    <tr key={r.key}>
                                      <td className="ix-muted">{r.date}</td>
                                      <td className="sd-wrap">{r.desc}</td>
                                      <td className="ix-num sd-plus">{r.buy}</td>
                                      <td className="ix-num sd-minus">{r.pay}</td>
                                      <td className="ix-num ix-strong">{r.bal}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : <p className="sd-empty">{v.ledgerEmpty}</p>}
                          <div className="sd-foot"><span>{t.ledgerNote}</span><span>{t.kOwe} <b>{v.k.owe}</b></span></div>
                        </>) : null}

                        {v.isInv ? (
                          v.invs.length ? (
                            <div className="sd-tw">
                              <table className="ix-table">
                                <caption className="sr-only">Bills</caption>
                                <thead><tr><th scope="col">{t.cNo}</th><th scope="col" className="ix-num">{t.cTotal}</th><th scope="col" className="ix-num">{t.cPaid}</th><th scope="col">{t.cDue}</th><th scope="col">{t.cStatus}</th><th scope="col"><span className="sr-only">{t.seePhoto}</span></th></tr></thead>
                                <tbody>
                                  {v.invs.map((b) => (
                                    <tr key={b.no}>
                                      <td><span className="ix-strong sd-id">{b.no}</span><span className="sd-sub">{b.sub}</span></td>
                                      <td className="ix-num">{b.total}</td>
                                      <td className="ix-num">{b.paid}</td>
                                      <td className="ix-muted">{b.due}</td>
                                      <td><StatusBadge tone={b.tone}>{b.st}</StatusBadge></td>
                                      <td><button type="button" className="ix-btn ix-btn--sm" onClick={b.photo}><__Icon name="image" width="16" height="16" aria-hidden="true" /><span>{t.seePhoto}</span></button></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : <p className="sd-empty">No bills yet.</p>
                        ) : null}

                        {v.isPays ? (
                          v.pays.length ? (
                            <div className="sd-tw">
                              <table className="ix-table">
                                <caption className="sr-only">Payment history</caption>
                                <thead><tr><th scope="col">{t.cDate}</th><th scope="col" className="ix-num">{t.cAmt}</th><th scope="col">{t.cMethod}</th><th scope="col">{t.cWho}</th><th scope="col">{t.cFor}</th></tr></thead>
                                <tbody>
                                  {v.pays.map((p) => (
                                    <tr key={p.key}>
                                      <td className="ix-muted">{p.date}</td>
                                      <td className="ix-num ix-strong">{p.amt}</td>
                                      <td>{p.m}{p.ref ? <span className="sd-sub">{p.ref}</span> : null}</td>
                                      <td>{p.who}</td>
                                      <td className="ix-muted sd-id">{p.inv}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : <p className="sd-empty">No payment yet.</p>
                        ) : null}

                        {v.isDue ? (<>
                          <div className="sd-remind">
                            <div><b>{t.remind}</b><span className="sd-sub">{t.remindHint}</span></div>
                            <button type="button" role="switch" className="gc-switch" aria-checked={v.remind.on} aria-label={t.remind} onClick={v.remind.toggle}><span className="gc-switch__knob" /></button>
                          </div>
                          {v.noDue ? <p className="sd-empty">Nothing is owed to {t.name}. No payment dates to remind you about.</p> : (
                            <div className="sd-tw">
                              <table className="ix-table">
                                <caption className="sr-only">Due dates</caption>
                                <thead><tr><th scope="col">{t.cDue}</th><th scope="col">{t.cNo}</th><th scope="col" className="ix-num">{t.cAmt}</th><th scope="col">{t.remindRow}</th></tr></thead>
                                <tbody>
                                  {v.sched.map((x) => (
                                    <tr key={x.inv}>
                                      <td><span className="ix-strong">{x.due}</span> <StatusBadge tone={x.tone}>{x.rel}</StatusBadge></td>
                                      <td><span className="sd-id">{x.inv}</span><span className="sd-sub">{x.sub}</span></td>
                                      <td className="ix-num ix-strong">{x.amt}</td>
                                      <td><button type="button" role="switch" className="gc-switch" aria-checked={x.on} aria-label={`${t.remindRow} ${x.inv}`} onClick={x.toggle}><span className="gc-switch__knob" /></button></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </>) : null}

                        {v.isPo ? (
                          v.noPos ? <p className="sd-empty">No purchase orders to {t.name} yet. Use New purchase order to order from them.</p> : (
                            <div className="sd-tw sd-tw--link">
                              <table className="ix-table">
                                <caption className="sr-only">Purchase orders</caption>
                                <thead><tr><th scope="col">Order</th><th scope="col">{t.cDate}</th><th scope="col">{t.cStatus}</th><th scope="col" className="ix-num">Received</th><th scope="col" className="ix-num">{t.cTotal}</th></tr></thead>
                                <tbody>
                                  {v.pos.map((p) => (
                                    <tr key={p.no} onClick={(e) => { if (!e.target.closest('a,button')) navigate(p.href); }}>
                                      <td><__Link href={p.href} className="ix-strong sd-id">{p.no}</__Link></td>
                                      <td className="ix-muted">{p.date}</td>
                                      <td><StatusBadge tone={p.tone}>{p.label}</StatusBadge></td>
                                      <td className="ix-num ix-muted">{p.pieces}</td>
                                      <td className="ix-num">{p.total}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )
                        ) : null}
                      </section>
                    </div>

                    <div className="ix-side">
                      <section className="ix-card" aria-labelledby="sd-contact">
                        <div className="ix-card__head"><h2 id="sd-contact">{t.contact}</h2></div>
                        <div className="ix-card__body sd-side">
                          <span className="sd-person">{t.person}</span>
                          <span className="sd-phone"><span>{v.mobile}</span><button type="button" className="ix-btn ix-btn--sm" onClick={v.call}><__Icon name="phone" width="16" height="16" aria-hidden="true" /><span>{t.call}</span></button></span>
                          <KV rows={[[t.addr, t.addrV]]} />
                        </div>
                      </section>
                      {v.goods.length ? (
                        <section className="ix-card" aria-labelledby="sd-goods">
                          <div className="ix-card__head"><h2 id="sd-goods">{t.supplies}</h2></div>
                          <div className="ix-card__body sd-chips">{v.goods.map((g) => <span key={g} className="gc-badge gc-badge--slate">{g}</span>)}</div>
                        </section>
                      ) : null}
                      <section className="ix-card" aria-labelledby="sd-terms">
                        <div className="ix-card__head"><h2 id="sd-terms">Payment terms</h2></div>
                        <div className="ix-card__body sd-credit"><b>{t.credit}</b><span>{t.creditHint}</span></div>
                      </section>
                    </div>
                  </div>
                </>)}
              </div>
            </div>
          </main>
        </div>

        <Dialog open={!!v.payOpen} title={t.payTitle + (t.name ? ' · ' + t.name : '')} onClose={v.closePay || (() => {})} width={560} footer={v.payOpen ? <>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={v.closePay}>{t.cancel}</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={v.pm.confirm}><__Icon name="check" width="16" height="16" aria-hidden="true" /> {t.paid} · {v.pm.amtMoney}</button>
        </> : null}>
          {v.payOpen ? (
            <div className="sd-form">
              <p className="gc-help" style={{ margin: 0 }}>{t.nowOwe} <b>{v.k.owe}</b></p>
              <div className="sd-amt">
                <label className="sd-fld">
                  <span className="gc-label">{t.amount}</span>
                  <input className="gc-input sd-id" inputMode="numeric" value={v.pm.amtTxt} onChange={v.pm.typeAmt} aria-label={t.amount} />
                </label>
                <div className="sd-after"><span>{t.after}</span><b>{v.pm.left}</b></div>
              </div>
              <div className="sd-fld">
                <span className="gc-label">{t.method}</span>
                <div className="sd-methods" role="group" aria-label={t.method}>
                  {v.pm.methods.map((o) => <button key={o.k} type="button" className="sd-chip" aria-pressed={o.on} onClick={o.pick}>{o.k}</button>)}
                </div>
              </div>
              <div className="sd-fld">
                <span className="gc-label">{t.which}</span>
                <span className="gc-help" style={{ margin: 0 }}>{t.whichHint}</span>
                <div className="sd-bills">
                  {v.pm.invs.map((b) => (
                    <button key={b.no} type="button" role="checkbox" aria-checked={b.on} className="sd-bill" onClick={b.toggle}>
                      <input type="checkbox" checked={b.on} readOnly tabIndex={-1} aria-hidden="true" />
                      <span><b>{b.no}</b><span className="sd-sub">{b.sub}</span></span>
                      <StatusBadge tone={b.tone}>{b.due}</StatusBadge>
                      <span className="ix-num ix-strong">{b.amt}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="sd-two">
                <label className="sd-fld">
                  <span className="gc-label">Pay from account</span>
                  <select className="gc-input gc-select" value={v.pm.acc} onChange={v.pm.accIn} aria-label="Pay from account">
                    {v.pm.accounts.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                  </select>
                  <span className={'gc-help' + (v.pm.short ? ' gc-help--error' : '')} role={v.pm.short ? 'alert' : undefined} style={{ margin: 0 }}>{v.pm.accMsg}</span>
                </label>
                <label className="sd-fld">
                  <span className="gc-label">{t.cWho}</span>
                  <select className="gc-input gc-select" value={v.pm.by} onChange={v.pm.byIn} aria-label={t.cWho}>
                    {v.pm.staff.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
              </div>
              <label className="sd-fld">
                <span className="gc-label">{t.note}</span>
                <input className="gc-input" placeholder={t.notePh} aria-label={t.note} value={v.pm.note} onChange={v.pm.noteIn} />
              </label>
            </div>
          ) : null}
        </Dialog>

        <Dialog open={!!v.photoOpen} title={t.photoTitle} onClose={v.closePhoto || (() => {})} width={480} footer={v.photoOpen ? <>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={v.print}><__Icon name="printer" width="16" height="16" aria-hidden="true" /> {t.print}</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={v.closePhoto}>{t.close}</button>
        </> : null}>
          {v.photoOpen ? <div role="img" aria-label={`${t.photoTitle} ${v.photoName}`} className="sd-photo"><__Icon name="image" width="16" height="16" aria-hidden="true" /><span>{v.photoName}</span></div> : null}
        </Dialog>
      </div>
    );
  }
}
