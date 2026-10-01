'use client';
// Generated from design/templates/purchase-stock/SupplierDetail.dc.html by scripts/convert-design.mjs.
// Supplier ledger — Purchase — one supplier's bills, payments, credit notes and purchase orders.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { toast as __toast } from '@/runtime/ui';
import { EMPLOYEES } from '@/lib/posStore';
import { accountBy, accountsForMethod, balanceOf, getEntries } from '@/lib/ledger';
import { getPOs, poPieces, poReceived } from '@/lib/purchaseOrders';
import { getDb, demoDb, findSupplier, totalsOf, ledgerOf, billsOf, paymentsOf, billLeft, billStatus, dayStart, daysFrom, paySupplier } from '@/lib/supplierBills';

// ---- logic ----
// One supplier's ledger: /supplier-detail?id=<supplier id> (from Suppliers & payables). Bills, payments and
// credit notes come from src/lib/supplierBills.js, purchase orders from src/lib/purchaseOrders.js (plus the
// demo orders), and paying takes the money out of a ledger account (src/lib/ledger.js).

function money(n) { var s = String(Math.round(Math.abs(n))); var last = s.slice(-3), rest = s.slice(0, -3); if (rest) s = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last; else s = last; return (n < 0 ? '−' : '') + '৳' + s; }
function num(x) { return +(String(x).replace(/[^\d.]/g, '').replace(/^$/, '0')) || 0; }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
function seg(self, opts, cur, key, base) { return opts.map(function (o) { var on = o[0] === cur; return { k: o[0], l: o[1], on: on, cls: (base || 'sgb') + (on ? ' on' : ''), pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
function sw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
var ME = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function D(ms) { var d = new Date(ms); return d.getDate() + ' ' + ME[d.getMonth()]; }
var DAY = 864e5;
var T = {
  back: 'Back', print: 'Print / PDF ledger', newBuy: 'New purchase', pay: 'Pay', contact: 'Contact', call: 'Call', addr: 'Address', supplies: 'Supplies',
  kOwe: 'Total payable', kToday: 'Overdue', kYear: 'Bought', kPaid: 'Paid in total',
  cDate: 'Date', cDesc: 'Details', cBuy: 'Bought (+)', cPay: 'Paid or credit (−)', cBal: 'Balance',
  cNo: 'Bill', cTotal: 'Total', cPaid: 'Paid', cDue: 'Due date', cStatus: 'Status', seePhoto: 'View photo',
  cAmt: 'Amount', cMethod: 'Method', cWho: 'Paid by', cFor: 'For bills',
  remind: 'Remind me the day before', remindHint: 'You get a phone notification and SMS at 9:00 AM', remindRow: 'Remind',
  payTitle: 'Pay supplier', amount: 'Amount', method: 'Pay with', which: 'Which bills this settles', whichHint: 'Ticking fills in the amount for you',
  note: 'Note or reference', notePh: 'e.g. handed to the owner, or TrxID', paid: 'Paid', nowOwe: 'Owed now', after: 'Left after this',
  photoTitle: 'Bill photo', close: 'Close', cancel: 'Cancel'
};
var MET = { Cash: ['Cash', '#e7f8f1', '#047857', 'cash'], bKash: ['bKash', '#fdecf5', '#a3195b', 'bk'], Nagad: ['Nagad', '#fff1e6', '#b4410c', 'bk'], Bank: ['Bank', '#eef3fb', '#003087', 'bank'] };
var METHODS = ['Cash', 'bKash', 'Nagad', 'Bank'];
var PO_PILL = { Draft: 'pill p-grey', Sent: 'pill p-info', 'Partly received': 'pill p-warn', Received: 'pill p-ok', 'Waiting for approval': 'pill p-warn', Approved: 'pill p-info', Ordered: 'pill p-info', Closed: 'pill p-grey', Cancelled: 'pill p-due' };
// the demo purchase orders (the same rows Purchase orders shows)
var DEMO_POS = [
  ['PO-2609-0024', 18, 9, 'Rahman Traders', 0, 120, 86400, 'Waiting for approval'], ['PO-2609-0023', 17, 9, 'Dhaka Beauty Imports', 0, 48, 38250, 'Draft'],
  ['PO-2609-0022', 16, 9, 'Chattogram Packaging Co.', 0, 500, 27500, 'Approved'], ['PO-2609-0021', 14, 9, 'Rahman Traders', 0, 200, 64800, 'Waiting for approval'],
  ['PO-2609-0020', 12, 9, 'Nabil Fashion House', 140, 240, 112600, 'Partly received'], ['PO-2609-0019', 5, 9, 'Dhaka Beauty Imports', 96, 96, 52980, 'Received'],
  ['PO-2608-0017', 20, 8, 'Mim Enterprise', 60, 60, 41300, 'Received'], ['PO-2609-0018', 3, 9, 'Rahman Traders', 0, 150, 48600, 'Ordered'],
  ['PO-2608-0015', 12, 8, 'Rahman Traders', 300, 300, 95000, 'Closed'], ['PO-2608-0014', 8, 8, 'Nabil Fashion House', 0, 80, 22000, 'Cancelled']
];
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
    var base = { t: T, rootCls: 'fen', hasMsg: false, msg: '' };
    if (!s.ready) return assign(base, { ready: false, emptyMsg: 'Opening the supplier ledger…' });
    var db = s.db || DEMO, today = s.today || FIRST_DAY, entries = s.entries || [];
    var sup = findSupplier(s.sid, db.suppliers);
    if (!sup) return assign(base, { ready: false, emptyMsg: 'This supplier is not on your list. Go back to Suppliers & payables and open a ledger from there.' });
    var t = assign(assign({}, T), {
      name: sup.name, pageTitle: sup.name,
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
    var rem = sw(self, 'remind', true);
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
      return { no: p.no, date: D(p.at), label: p.status + (p.approval === 'waiting' ? ' · needs approval' : ''), cls: PO_PILL[p.status] || 'pill p-grey', pieces: poReceived(p.lines) + ' of ' + poPieces(p.lines), total: money(p.total), href: '/po-detail?no=' + encodeURIComponent(p.no) };
    }).concat(DEMO_POS.filter(function (r) { return r[3] === sup.name; }).map(function (r) {
      return { no: r[0], date: r[1] + ' ' + ME[r[2] - 1], label: r[7], cls: PO_PILL[r[7]] || 'pill p-grey', pieces: r[4] + ' of ' + r[5], total: money(r[6]), href: r[0] === 'PO-2609-0020' ? '/po-detail' : '/purchase-orders' };
    }));

    return assign(base, {
      ready: true, t: t, ini: sup.name.slice(0, 1), mobile: sup.phone,
      call: function () { __toast('Calling ' + (sup.person || sup.name) + '… ' + sup.phone, { tone: 'info' }); },
      print: function () { __toast('Ledger PDF of ' + sup.name + ' is ready to print · ' + plural(led.length, 'line')); },
      goods: String(sup.goods || '').split(',').map(function (x) { return x.trim(); }).filter(function (x) { return x && x !== '—'; }).map(function (x) { return { l: x.charAt(0).toUpperCase() + x.slice(1) }; }),
      k: {
        owe: money(tot.payable),
        oweN: open.length ? 'On ' + plural(open.length, 'bill') + ' · ' + open.slice(0, 3).map(function (b) { return b.no; }).join(', ') + (open.length > 3 ? '…' : '') : 'Nothing owed',
        today: money(tot.overdue),
        todayN: (overdueBills.length ? plural(overdueBills.length, 'bill') + ' past the due date' : 'Nothing overdue') + (tot.today ? ' · ' + money(tot.today) + ' due today' : ''),
        year: money(tot.bought), yearN: bills.length ? plural(bills.length, 'bill') + ' since ' + D(tot.first) : 'No bills yet',
        paid: money(tot.paid), paidN: (lp ? 'Last paid ' + D(lp.at) + ', ' + money(lp.amount) + ' ' + lp.method : 'No payment yet') + (tot.credit ? ' · ' + money(tot.credit) + ' credit for returns' : '')
      },
      tabs: seg(self, [['ledger', 'Ledger'], ['inv', 'Bills'], ['pays', 'Payment history'], ['due', 'Due dates'], ['po', 'Purchase orders']], tab, 'tab', 'tl').map(function (o) { return assign(o, { iLed: o.k === 'ledger', iInv: o.k === 'inv', iPay: o.k === 'pays', iDue: o.k === 'due', iPo: o.k === 'po' }); }),
      isLedger: tab === 'ledger', isInv: tab === 'inv', isPays: tab === 'pays', isDue: tab === 'due', isPo: tab === 'po',
      ledger: led.length ? led.map(function (r) {
        var it = r.item;
        var desc = r.kind === 'bill' ? 'Bill #' + r.no + ' — goods bought' + (it.po ? ' · ' + it.po : '') + (it.grn ? ' · ' + it.grn : '')
          : r.kind === 'payment' ? 'Paid (' + it.method + (it.account ? ', ' + accName(it.account) : '') + ')' + (it.bills.length ? ' · ' + it.bills.join(', ') : '')
          : 'Credit note ' + r.no + ' — goods returned' + (it.ret ? ' · ' + it.ret : '');
        return {
          date: D(r.at) + (isToday(r.at) ? ' (today)' : ''), desc: desc,
          icBg: r.kind === 'bill' ? '#fff4e0' : r.kind === 'payment' ? '#e7f8f1' : '#eef2f6', icFg: '#475569',
          buy: r.plus ? money(r.plus) : '', pay: r.minus ? money(r.minus) : '', bal: money(r.balance),
          rowBg: it.seed ? '#fff' : '#f0fbf6', isBuy: r.kind === 'bill', isPay: r.kind === 'payment', isOpen: r.kind === 'credit'
        };
      }) : [{ date: '—', desc: 'No bills or payments yet. A bill is added when you receive goods from ' + sup.name + '.', buy: '', pay: '', bal: money(0), rowBg: '#fff', icBg: '#eef2f6' }],
      invs: bills.map(function (b) {
        var left = billLeft(b), st = billStatus(b, today), off = daysFrom(b.due, today);
        var pill = st === 'Paid' ? ['Paid in full', 'pill p-ok'] : st === 'Overdue' ? ['Overdue · ' + money(left), 'pill p-due'] : off === 0 ? ['Due today · ' + money(left), 'pill p-due'] : ['Owe ' + money(left), 'pill p-warn'];
        var what = b.lines.length ? plural(b.lines.reduce(function (n, l) { return n + l.qty; }, 0), 'piece') : b.po || 'Supplier bill';
        return { no: b.no, sub: D(b.at) + ' · ' + what + (b.grn ? ' · ' + b.grn : ''), total: money(b.amount), paid: money((b.paid || 0) + (b.credited || 0)), due: D(b.due), st: pill[0], stCls: pill[1], seeLabel: T.seePhoto, photo: function () { self.setState({ photo: b.no }); } };
      }),
      pays: pays.map(function (p) {
        var m = MET[p.method] || MET.Cash;
        return { isCash: m[3] === 'cash', isBk: m[3] === 'bk', isBank: m[3] === 'bank', date: D(p.at), amt: money(p.amount), m: m[0], bg: m[1], fg: m[2], ref: [accName(p.account), p.ref].filter(Boolean).join(' · '), who: p.by, ini: String(p.by || '?').slice(0, 1), inv: p.bills.join(', ') || '—' };
      }),
      remind: rem,
      sched: open.map(function (b) {
        var off = daysFrom(b.due, today), on = remRow[b.no] !== false && rem.on, dd = new Date(b.due);
        return {
          d: String(dd.getDate()), m: ME[dd.getMonth()], fg: off <= 0 ? '#b83210' : '#0f172a',
          rel: off === 0 ? 'Today' : off < 0 ? plural(-off, 'day') + ' late' : 'In ' + plural(off, 'day'), relCls: off <= 0 ? 'pill p-due' : 'pill p-grey', inv: b.no,
          sub: 'Bought ' + D(b.at) + ' · reminder on ' + D(b.due - DAY) + (off <= 1 ? ' (sent)' : ''),
          amt: money(billLeft(b)), bd: off <= 0 ? '#f7c9bb' : '#e6eaf0', bg: off <= 0 ? '#fffaf8' : '#fff',
          swOn: on, swCls: on ? 'sw on' : 'sw', toggle: function () { var o = assign({}, remRow); o[b.no] = !on; self.setState({ remRow: o }); __toast(on ? 'No reminder for ' + b.no : 'Reminder set for ' + b.no); }
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
        methods: seg(self, METHODS.map(function (m) { return [m, m]; }), pm, 'pm', 'chip').map(function (o) { var pick = o.pick; return assign(o, { isCash: o.k === 'Cash', isBk: o.k === 'bKash' || o.k === 'Nagad', isBank: o.k === 'Bank', pick: function () { pick(); self.setState({ acc: null }); } }); }),
        accounts: accounts, acc: acc ? acc.id : '', accIn: function (e) { self.setState({ acc: e.target.value }); },
        short: short && amt > 0, accMsg: !acc ? 'No account for this method' : amt > acc.bal ? 'This account holds ' + money(acc.bal) + ', less than ' + money(amt) + '.' : money(acc.bal - amt) + ' will be left in this account.',
        staff: EMPLOYEES.map(function (e) { return e.name; }), by: s.payBy || EMPLOYEES[2].name, byIn: function (e) { self.setState({ payBy: e.target.value }); },
        note: s.payNote || '', noteIn: function (e) { self.setState({ payNote: e.target.value }); },
        invs: open.map(function (b) {
          var on = !!ticks[b.no], off = daysFrom(b.due, today);
          return {
            no: b.no, sub: 'Bought ' + D(b.at), due: off === 0 ? 'Today' : off < 0 ? plural(-off, 'day') + ' late' : D(b.due), dueCls: off <= 0 ? 'pill p-warn' : 'pill p-grey', amt: money(billLeft(b)), on: on,
            bd: on ? '#003087' : '#e2e8f0', bg: on ? '#f5f8ff' : '#fff', boxBd: on ? '#003087' : '#cbd5e1', boxBg: on ? '#003087' : '#fff',
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

// ---- styles (from the design's <helmet>) ----

const CSS = `
*{box-sizing:border-box}
body{margin:0;background:#e9eef5;color:#0f172a;-webkit-font-smoothing:antialiased;font-family:var(--font-bn)}
a{color:#003087;text-decoration:none}
button{font:inherit;color:inherit}
.fbn{font-family:var(--font-bn)}
.fen{font-family:var(--font-sans)}
.num{font-variant-numeric:tabular-nums}
.mono{font-family:var(--font-data)}
.card{background:#fff;border:1px solid #e6eaf0;border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04),0 10px 28px -18px rgba(15,23,42,.14)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:var(--radius-lg);border:0;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer;white-space:nowrap;text-decoration:none;transition:background-color 200ms,border-color 200ms}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.line{background:#fff;color:#0f172a;border:1px solid #cbd5e1}.line:hover{background:#f1f5f9;color:#0f172a}
.soft{background:#eef3fb;color:#003087}.soft:hover{background:#e0e9f7;color:#003087}
.okb{background:#047857;color:#fff}.okb:hover{background:#065f46;color:#fff}
.dang{background:#fff;color:#b83210;border:1px solid #f3b7a5}.dang:hover{background:#fff4f0;color:#b83210}
.sm{height:36px;padding:0 12px;font-size:var(--text-xs-plus);border-radius:var(--radius-lg)}
.big{height:52px;padding:0 24px;font-size:var(--text-sm-plus);border-radius:var(--radius-lg)}
.ib{width:36px;height:36px;border-radius:var(--radius-full);border:1px solid #e2e8f0;background:#fff;color:#334155;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;position:relative;flex-shrink:0}
.ib:hover{background:#f1f5f9}
.seg{display:inline-flex;padding:4px;gap:2px;border-radius:var(--radius-xl);background:#e9eef5}
.sgb{height:36px;padding:0 14px;border:0;border-radius:var(--radius-lg);background:transparent;font-size:var(--text-sm);font-weight:var(--weight-medium);color:#475569;cursor:pointer;white-space:nowrap}
.sgb.on{background:#fff;color:#003087;font-weight:var(--weight-semibold);box-shadow:0 1px 3px rgba(15,23,42,.14)}
.chip{height:36px;padding:0 14px;border-radius:var(--radius-full);border:1px solid #cbd5e1;background:#fff;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.chip:hover{border-color:#94a3b8}
.chip.on{border-color:#003087;background:#eef3fb;color:#003087;font-weight:var(--weight-medium)}
.pill{display:inline-flex;align-items:center;height:26px;padding:0 10px;border-radius:var(--radius-full);font-size:var(--text-xs-plus);font-weight:var(--weight-medium);white-space:nowrap}
.p-ok{background:#e7f8f1;color:#047857}.p-due{background:#ffece6;color:#b83210}.p-warn{background:#fff4e0;color:#a14f06}.p-info{background:#eef3fb;color:#003087}.p-grey{background:#eef2f6;color:#475569}.p-bk{background:#fdecf5;color:#a3195b}
.inp{width:100%;height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-sm);color:#0f172a}
.inp:focus{outline:none;border-color:#003087;box-shadow:0 0 0 3px rgba(0,48,135,.12)}
.inp::placeholder{color:var(--text-muted)}
.lbl{font-size:var(--text-sm);font-weight:var(--weight-medium);color:#334155}
.fld{display:flex;flex-direction:column;gap:6px;min-width:0}
.hint{font-size:var(--text-xs-plus);line-height:18px;color:var(--text-muted)}
.req{color:#b83210}
.th{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:left;padding:10px 14px;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.td{padding:12px 14px;border-bottom:1px solid #f1f5f9;font-size:var(--text-sm);vertical-align:middle}
.trow:hover{background:#f8fafc}
.h1{margin:0;font-size:var(--text-2xl);line-height:34px;font-weight:var(--weight-semibold)}
.h2{margin:0;font-size:var(--text-lg);line-height:24px;font-weight:var(--weight-semibold)}
.sub{font-size:var(--text-sm-plus);color:var(--text-muted)}
.kpi{padding:18px 20px;display:flex;flex-direction:column;gap:4px}
.kpi .k{font-size:var(--text-sm-plus);color:#475569;font-weight:var(--weight-medium)}
.kpi .v{font-size:var(--text-3xl);line-height:36px;font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.sw{position:relative;width:48px;height:28px;border-radius:var(--radius-full);border:0;background:#cbd5e1;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:var(--radius-full);background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.25);transition:transform 200ms}
.sw.on{background:#003087}.sw.on::after{transform:translateX(20px)}
.tabl{display:flex;gap:4px;border-bottom:1px solid #e2e8f0}
.tl{position:relative;height:44px;padding:0 14px;border:0;background:transparent;font-size:var(--text-sm-plus);font-weight:var(--weight-medium);color:var(--text-muted);cursor:pointer;white-space:nowrap}
.tl.on{color:#003087;font-weight:var(--weight-semibold)}.tl.on::after{content:"";position:absolute;left:10px;right:10px;bottom:-1px;height:3px;border-radius:3px 3px 0 0;background:#003087}
.row{display:flex;align-items:center;gap:12px;padding:14px 16px}
.row + .row{border-top:1px solid #eef2f6}
.bar{height:8px;border-radius:var(--radius-full);background:#eef2f6;overflow:hidden;display:block}.bar>span{display:block;height:8px;border-radius:var(--radius-full)}
.note{display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:var(--radius-xl);font-size:var(--text-sm);line-height:20px}
.n-info{background:#eef3fb;color:#1e3a6e}.n-warn{background:#fff8eb;color:#7a3b04;border:1px solid #fde3b5}.n-ok{background:#e7f8f1;color:#065f46}.n-due{background:#fff4f0;color:#8a2a0d;border:1px solid #f7c9bb}
.chipq{height:36px;padding:0 12px;border-radius:var(--radius-full);border:1px solid #d6e0ef;background:#f5f8ff;color:#003087;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer;white-space:nowrap}
.wave span{display:inline-block;width:4px;margin:0 2px;border-radius:var(--radius-sm);background:#003087;animation:wv 900ms ease-in-out infinite}
.wave span:nth-child(2){animation-delay:.15s}.wave span:nth-child(3){animation-delay:.3s}.wave span:nth-child(4){animation-delay:.45s}.wave span:nth-child(5){animation-delay:.6s}
@keyframes wv{0%,100%{height:8px}50%{height:26px}}
.fade{animation:fd 240ms cubic-bezier(0,0,.2,1)}
@keyframes fd{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.btn:focus-visible,.ib:focus-visible,.sgb:focus-visible,.chip:focus-visible,.tl:focus-visible,.sw:focus-visible,.chipq:focus-visible,a:focus-visible,button:focus-visible{outline:3px solid rgba(0,48,135,.45);outline-offset:2px}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}

.nav{display:flex;align-items:center;gap:11px;height:38px;padding:0 10px;border-radius:var(--radius-lg);color:#334155;font-size:var(--text-sm-plus);font-weight:var(--weight-medium);text-decoration:none;transition:background-color 200ms,color 200ms}
.nav:hover{background:#f1f5f9;color:#0f172a}
.nav.on{background:rgba(0,48,135,.09);color:#003087;font-weight:var(--weight-semibold)}
.nav .cnt{margin-left:auto;min-width:24px;height:21px;padding:0 7px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);display:inline-flex;align-items:center;justify-content:center}
.navh{font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:.04em;color:var(--text-muted);padding:12px 10px 2px}
.act{display:flex;flex-direction:column;align-items:flex-start;gap:10px;padding:16px;border-radius:var(--radius-xl);border:1px solid #e6eaf0;background:#fff;cursor:pointer;text-align:left;text-decoration:none;color:#0f172a;transition:border-color 200ms,box-shadow 200ms}
.act:hover{border-color:#003087;box-shadow:0 8px 20px -12px rgba(0,48,135,.35);color:#0f172a}
.act .ic{width:44px;height:44px;border-radius:var(--radius-xl);display:flex;align-items:center;justify-content:center}
.alert{display:flex;align-items:center;gap:14px;padding:12px 16px;border-top:1px solid #eef2f6}
.abtn{height:36px;padding:0 14px;border-radius:var(--radius-lg);border:1px solid #cbd5e1;background:#fff;font-size:var(--text-sm);font-weight:var(--weight-medium);color:#003087;cursor:pointer;white-space:nowrap}
.abtn:hover{background:#f1f5f9}
.mic{position:absolute;right:28px;bottom:28px;height:60px;padding:0 22px 0 8px;border-radius:var(--radius-full);border:0;background:#003087;color:#fff;display:flex;align-items:center;gap:12px;font-size:var(--text-base);font-weight:var(--weight-semibold);cursor:pointer;box-shadow:0 16px 32px -12px rgba(0,48,135,.6);z-index:20}
.mic .dotc{width:44px;height:44px;border-radius:var(--radius-full);background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center}
.scrim{position:absolute;inset:0;background:rgba(15,23,42,.42);z-index:15}
.drawer{position:absolute;top:0;right:0;bottom:0;width:520px;background:#fff;z-index:16;display:flex;flex-direction:column;box-shadow:-20px 0 50px -20px rgba(15,23,42,.35)}
.modal{position:absolute;left:50%;top:120px;transform:translateX(-50%);width:560px;background:#fff;border-radius:var(--radius-xl);z-index:16;box-shadow:0 30px 70px -20px rgba(15,23,42,.45)}

/* merged: English, compact controls, GridAI button */
body{font-family:var(--font-sans)}
.btn{height:44px;padding:0 18px;font-size:var(--text-sm);border-radius:var(--radius-lg)}
.btn.sm,.sm{height:34px;padding:0 12px;font-size:var(--text-xs-plus);border-radius:var(--radius-lg)}
.btn.big,.big{height:48px;padding:0 22px;font-size:var(--text-sm-plus);border-radius:var(--radius-xl)}
.ib{width:36px;height:36px;border-radius:var(--radius-full)}
.chip{height:36px;padding:0 14px;font-size:var(--text-xs-plus)}
.sgb{height:32px;padding:0 12px;font-size:var(--text-xs-plus)}
.gfab{position:absolute;right:28px;bottom:28px;z-index:20;display:inline-flex;align-items:center;gap:10px;height:52px;padding:0 20px 0 16px;border-radius:var(--radius-full);background:#003087;color:#fff;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);text-decoration:none;box-shadow:0 14px 30px -12px rgba(0,48,135,.6)}
.gfab:hover{background:#002a77;color:#fff}
.gfab:focus-visible{outline:3px solid rgba(0,48,135,.45);outline-offset:3px}
.th,.td{white-space:normal}
/* tablets and phones: contact, address and credit stack instead of three squeezed columns */
@media (max-width:1023px){
  .sd-contact{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  .sd-contact>:last-child{grid-column:1/-1}
}
@media (max-width:767px){
  .sd-contact{grid-template-columns:minmax(0,1fr)!important;gap:16px!important;padding:16px!important}
}
/* phones: back and title share a row, Pay leads the actions, ledger tabs scroll, the pay dialog fits the screen */
@media (max-width:640px){
  .sd-hicon{display:none!important}
  .sd-head{gap:8px 10px!important}
  .sd-head>div:has(> h1){flex:1 1 calc(100% - 52px)!important;min-width:0}
  .sd-head>.btn{flex:1 1 0;padding:0 12px}
  .sd-head>.sd-pay{order:1;flex:1 1 100%}
  .sd-head>.btn:not(.sd-pay){order:2}
  .tabl{overflow-x:auto;scrollbar-width:none}
  .tabl::-webkit-scrollbar{display:none}
  .tabl>.tl{flex:none}
  .modal{width:calc(100% - 24px)!important;top:76px!important}
  .sd-amt{flex-wrap:wrap}
  .sd-amt>div{width:100%!important}
  .sd-methods{flex-wrap:wrap}
  .sd-methods>button{flex:1 1 40%!important}
  .kpi{padding:var(--space-4);min-width:0}
  .kpi .k{flex-direction:column;align-items:flex-start!important;gap:var(--space-2)!important}
  .kpi .v{font-size:var(--text-xl)!important;line-height:var(--text-xl-lh);overflow-wrap:anywhere}
}
`;

// ---- markup ----

export default class SupplierDetailScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="SupplierDetail">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={"gc-shell " + (v.rootCls || "")} style={{ position: "relative", background: "#e9eef5", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="po-suppliers" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f6f8fb", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", position: "relative" }}>
            <__Topbar crumb="Purchase" page="Supplier ledger" placeholder="Search products, customers or memo no." />
            <div className="gc-shell__content" style={{ flexGrow: "1", minHeight: "0", padding: "22px 28px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
              {!v.ready ? (
                <section className="card" role="status" style={{ padding: "28px", display: "flex", alignItems: "center", gap: "14px" }}>
                  <__Link href="/suppliers" className="ib" aria-label="Back to Suppliers & payables">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
                  </__Link>
                  <h1 className="h2" style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-medium)", color: "#475569" }}>{v.emptyMsg}</h1>
                </section>
              ) : (<>
              <div className="sd-head" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <__Link href="/suppliers" className="ib" aria-label={v.t?.back}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </__Link>
                <span className="sd-hicon" style={{ width: "52px", height: "52px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e6eaf0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M5 11H27A2 2 0 0 1 29 13V30A2 2 0 0 1 27 32H5A2 2 0 0 1 3 30V13A2 2 0 0 1 5 11Z" fill="#0ea5e9" />
                    <path d="M8.6 16H16.4A1.1 1.1 0 0 1 17.5 17.1V17.099999999999998A1.1 1.1 0 0 1 16.4 18.2H8.6A1.1 1.1 0 0 1 7.5 17.099999999999998V17.1A1.1 1.1 0 0 1 8.6 16Z" fill="#7dd3fc" />
                    <path d="M8.6 21H20.4A1.1 1.1 0 0 1 21.5 22.1V22.099999999999998A1.1 1.1 0 0 1 20.4 23.2H8.6A1.1 1.1 0 0 1 7.5 22.099999999999998V22.1A1.1 1.1 0 0 1 8.6 21Z" fill="#7dd3fc" />
                    <path d="M29 17L38.5 17L45 25.5L45 32L29 32Z" fill="#0ea5e9" />
                    <path d="M31.5 19.5L37.5 19.5L41.5 25.5L31.5 25.5Z" fill="#7dd3fc" />
                    <path d="M4.5 31H43.5A1.5 1.5 0 0 1 45 32.5V34.0A1.5 1.5 0 0 1 43.5 35.5H4.5A1.5 1.5 0 0 1 3 34.0V32.5A1.5 1.5 0 0 1 4.5 31Z" fill="#003087" />
                    <path d="M7.2 37.5a4.8 4.8 0 1 0 9.6 0a4.8 4.8 0 1 0 -9.6 0Z" fill="#003087" />
                    <path d="M10.2 37.5a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0Z" fill="#ffffff" />
                    <path d="M31.2 37.5a4.8 4.8 0 1 0 9.6 0a4.8 4.8 0 1 0 -9.6 0Z" fill="#003087" />
                    <path d="M34.2 37.5a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0Z" fill="#ffffff" />
                  </svg>
                </span>
                <div style={{ flexGrow: "1" }}>
                  <h1 className="h1">{v.t?.name}</h1>
                  <div className="sub">{v.t?.hsub}</div>
                </div>
                <button type="button" className="btn line" onClick={v.print}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
</svg>{v.t?.print}</button>
                <__Link href="/new-po" className="btn line"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 2-1.5L22 8H6M9 21h.01M18 21h.01" />
</svg>{v.t?.newBuy}</__Link>
                <button type="button" className="btn solid sd-pay" onClick={v.openPay}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M7 7h11l-3-3M17 17H6l3 3" />
</svg>{v.t?.pay}</button>
              </div>
              <section className="card sd-contact" style={{ padding: "18px 20px", display: "grid", gridTemplateColumns: "1.15fr 1.2fr 1fr", gap: "20px", alignItems: "start" }}>
                <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                  <span style={{ position: "relative", width: "60px", height: "60px", borderRadius: "var(--radius-xl)", background: "#e7f8f1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                    <svg width="44" height="44" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M24.5 15a6.5 6.5 0 1 0 13.0 0a6.5 6.5 0 1 0 -13.0 0Z" fill="#7dd3fc" />
                      <path d="M29.5 23H33.5A8.5 8.5 0 0 1 42 31.5V31.5A8.5 8.5 0 0 1 33.5 40H29.5A8.5 8.5 0 0 1 21 31.5V31.5A8.5 8.5 0 0 1 29.5 23Z" fill="#0ea5e9" />
                      <path d="M10.5 17a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#7dd3fc" />
                      <path d="M14.5 26H21.5A8.5 8.5 0 0 1 30 34.5V34.5A8.5 8.5 0 0 1 21.5 43H14.5A8.5 8.5 0 0 1 6 34.5V34.5A8.5 8.5 0 0 1 14.5 26Z" fill="#0ea5e9" />
                    </svg>
                    <span style={{ position: "absolute", right: "-5px", bottom: "-5px", minWidth: "26px", height: "26px", padding: "0 5px", borderRadius: "var(--radius-full)", background: "#047857", color: "#fff", border: "2px solid #fff", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)", display: "flex", alignItems: "center", justifyContent: "center" }}>{v.ini}</span>
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "0" }}>
                    <span className="hint">{v.t?.contact}</span>
                    <span style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>{v.t?.person}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="num" style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.mobile}</span>
                      <button type="button" className="btn soft sm" onClick={v.call} style={{ height: "36px", padding: "0 10px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
</svg>{v.t?.call}</button>
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <div className="hint" style={{ display: "flex", alignItems: "center", gap: "6px" }}><svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M24 3C15.7 3 9.5 9.2 9.5 17.3C9.5 28.5 24 45 24 45C24 45 38.5 28.5 38.5 17.3C38.5 9.2 32.3 3 24 3Z" fill="#ef4444" />
  <path d="M17.8 17.5a6.2 6.2 0 1 0 12.4 0a6.2 6.2 0 1 0 -12.4 0Z" fill="#ffffff" />
</svg>{v.t?.addr}</div>
                    <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-medium)" }}>{v.t?.addrV}</div>
                  </div>
                  <div>
                    <div className="hint" style={{ marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}><svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M10 17H36A2 2 0 0 1 38 19V39A2 2 0 0 1 36 41H10A2 2 0 0 1 8 39V19A2 2 0 0 1 10 17Z" fill="#7dd3fc" />
  <path d="M8 11H38A2 2 0 0 1 40 13V17A2 2 0 0 1 38 19H8A2 2 0 0 1 6 17V13A2 2 0 0 1 8 11Z" fill="#0ea5e9" />
  <path d="M20 11h6v30h-6Z" fill="#e0f2fe" />
  <path d="M29 26L41 26L45 31.5L41 37L29 37Z" fill="#0ea5e9" />
  <path d="M30.9 31.5a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0Z" fill="#ffffff" />
</svg>{v.t?.supplies}</div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {__list(v.goods).map((g, $index) => (<React.Fragment key={$index}>
                          <span className="pill p-grey">{g?.l}</span>
                        </React.Fragment>))}
                    </div>
                  </div>
                </div>
                <div style={{ padding: "12px 14px", borderRadius: "var(--radius-xl)", background: "#eef3fb", display: "flex", alignItems: "center", gap: "12px" }}>
                  <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M4 24a18 18 0 1 0 36 0a18 18 0 1 0 -36 0Z" fill="#e0f2fe" />
                    <path d="M8.5 24a13.5 13.5 0 1 0 27.0 0a13.5 13.5 0 1 0 -27.0 0Z" fill="#ffffff" />
                    <path d="M22 16V24.5L28 28" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M29 36a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z" fill="#0ea5e9" />
                    <path d="M33 36l2.8 2.8 5.2 -5.6" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ color: "#003087", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>{v.t?.credit}</span>
                    <span style={{ fontSize: "var(--text-sm)", color: "#1e3a6e", lineHeight: "19px" }}>{v.t?.creditHint}</span>
                  </div>
                </div>
              </section>
              <div className="gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "14px" }}>
                <div className="card kpi" style={{ borderColor: "#fde3b5", background: "#fffcf5" }}>
                  <span className="k" style={{ display: "flex", alignItems: "center", gap: "10px" }}><svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
  <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
  <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
  <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
  <path d="M36 8.5V17.5M32 13.5l4 4 4 -4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
</svg>{v.t?.kOwe}</span>
                  <span className="v" style={{ color: "#a14f06", fontSize: "var(--text-3xl)" }}>{v.k?.owe}</span>
                  <span className="hint num">{v.k?.oweN}</span>
                </div>
                <div className="card kpi" style={{ borderColor: "#f7c9bb", background: "#fffaf8" }}>
                  <span className="k" style={{ display: "flex", alignItems: "center", gap: "10px" }}><svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M10 8H38A5 5 0 0 1 43 13V37A5 5 0 0 1 38 42H10A5 5 0 0 1 5 37V13A5 5 0 0 1 10 8Z" fill="#e0f2fe" />
  <path d="M10.5 9.5H37.5A4 4 0 0 1 41.5 13.5V36.5A4 4 0 0 1 37.5 40.5H10.5A4 4 0 0 1 6.5 36.5V13.5A4 4 0 0 1 10.5 9.5Z" fill="#ffffff" />
  <path d="M10 8H38A5 5 0 0 1 43 13V14A5 5 0 0 1 38 19H10A5 5 0 0 1 5 14V13A5 5 0 0 1 10 8Z" fill="#0ea5e9" />
  <path d="M5 14h38v5h-38Z" fill="#0ea5e9" />
  <path d="M14.7 4H14.7A1.7 1.7 0 0 1 16.4 5.7V11.3A1.7 1.7 0 0 1 14.7 13H14.7A1.7 1.7 0 0 1 13 11.3V5.7A1.7 1.7 0 0 1 14.7 4Z" fill="#003087" />
  <path d="M33.7 4H33.699999999999996A1.7 1.7 0 0 1 35.4 5.7V11.3A1.7 1.7 0 0 1 33.699999999999996 13H33.7A1.7 1.7 0 0 1 32 11.3V5.7A1.7 1.7 0 0 1 33.7 4Z" fill="#003087" />
  <path d="M12.2 23H15.8A1.2 1.2 0 0 1 17 24.2V26.8A1.2 1.2 0 0 1 15.8 28H12.2A1.2 1.2 0 0 1 11 26.8V24.2A1.2 1.2 0 0 1 12.2 23Z" fill="#e0f2fe" />
  <path d="M22.2 23H25.8A1.2 1.2 0 0 1 27 24.2V26.8A1.2 1.2 0 0 1 25.8 28H22.2A1.2 1.2 0 0 1 21 26.8V24.2A1.2 1.2 0 0 1 22.2 23Z" fill="#e0f2fe" />
  <path d="M32.2 23H35.8A1.2 1.2 0 0 1 37 24.2V26.8A1.2 1.2 0 0 1 35.8 28H32.2A1.2 1.2 0 0 1 31 26.8V24.2A1.2 1.2 0 0 1 32.2 23Z" fill="#0ea5e9" />
  <path d="M12.2 32H15.8A1.2 1.2 0 0 1 17 33.2V35.8A1.2 1.2 0 0 1 15.8 37H12.2A1.2 1.2 0 0 1 11 35.8V33.2A1.2 1.2 0 0 1 12.2 32Z" fill="#e0f2fe" />
  <path d="M22.2 32H25.8A1.2 1.2 0 0 1 27 33.2V35.8A1.2 1.2 0 0 1 25.8 37H22.2A1.2 1.2 0 0 1 21 35.8V33.2A1.2 1.2 0 0 1 22.2 32Z" fill="#e0f2fe" />
  <path d="M32.2 32H35.8A1.2 1.2 0 0 1 37 33.2V35.8A1.2 1.2 0 0 1 35.8 37H32.2A1.2 1.2 0 0 1 31 35.8V33.2A1.2 1.2 0 0 1 32.2 32Z" fill="#e0f2fe" />
</svg>{v.t?.kToday}</span>
                  <span className="v" style={{ color: "#b83210" }}>{v.k?.today}</span>
                  <span className="hint num">{v.k?.todayN}</span>
                </div>
                <div className="card kpi">
                  <span className="k" style={{ display: "flex", alignItems: "center", gap: "10px" }}><svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M18.5 6H27.5A1.5 1.5 0 0 1 29 7.5V15.5A1.5 1.5 0 0 1 27.5 17H18.5A1.5 1.5 0 0 1 17 15.5V7.5A1.5 1.5 0 0 1 18.5 6Z" fill="#7dd3fc" />
  <path d="M21.5 6h3v5h-3Z" fill="#e0f2fe" />
  <path d="M29.5 10H37.5A1.5 1.5 0 0 1 39 11.5V16.5A1.5 1.5 0 0 1 37.5 18H29.5A1.5 1.5 0 0 1 28 16.5V11.5A1.5 1.5 0 0 1 29.5 10Z" fill="#0ea5e9" />
  <path d="M32 10h3v4h-3Z" fill="#e0f2fe" />
  <path d="M8 18L42 18L38.5 32L13 32Z" fill="#0ea5e9" />
  <path d="M15.1 22H37.9A1.1 1.1 0 0 1 39 23.1V23.099999999999998A1.1 1.1 0 0 1 37.9 24.2H15.1A1.1 1.1 0 0 1 14 23.099999999999998V23.1A1.1 1.1 0 0 1 15.1 22Z" fill="#7dd3fc" />
  <path d="M16.1 26.5H35.9A1.1 1.1 0 0 1 37 27.6V27.599999999999998A1.1 1.1 0 0 1 35.9 28.7H16.1A1.1 1.1 0 0 1 15 27.599999999999998V27.6A1.1 1.1 0 0 1 16.1 26.5Z" fill="#7dd3fc" />
  <path d="M3 11H8L13 32H38" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M12.2 38.5a3.8 3.8 0 1 0 7.6 0a3.8 3.8 0 1 0 -7.6 0Z" fill="#003087" />
  <path d="M31.2 38.5a3.8 3.8 0 1 0 7.6 0a3.8 3.8 0 1 0 -7.6 0Z" fill="#003087" />
  <path d="M14.6 38.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#ffffff" />
  <path d="M33.6 38.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#ffffff" />
</svg>{v.t?.kYear}</span>
                  <span className="v">{v.k?.year}</span>
                  <span className="hint num">{v.k?.yearN}</span>
                </div>
                <div className="card kpi">
                  <span className="k" style={{ display: "flex", alignItems: "center", gap: "10px" }}><svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
  <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
  <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
  <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
  <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
  <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
</svg>{v.t?.kPaid}</span>
                  <span className="v" style={{ color: "#047857" }}>{v.k?.paid}</span>
                  <span className="hint num">{v.k?.paidN}</span>
                </div>
              </div>
              <section className="card" style={{ overflow: "hidden" }}>
                <div className="tabl" role="tablist" style={{ padding: "0 12px" }}>
                  {__list(v.tabs).map((o, $index) => (<React.Fragment key={$index}>
                      <button type="button" role="tab" className={o?.cls} aria-selected={o?.on} onClick={o?.pick} style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>{o?.iLed ? (<>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
  </svg>
</>) : null}{o?.iInv ? (<>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5" />
  </svg>
</>) : null}{o?.iPay ? (<>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 7h11l-3-3M17 17H6l3 3" />
  </svg>
</>) : null}{o?.iDue ? (<>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 5h18v16H3zM16 3v4M8 3v4M3 10h18" />
  </svg>
</>) : null}{o?.iPo ? (<>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12h6M9 16h4" />
  </svg>
</>) : null}{o?.l}</button>
                    </React.Fragment>))}
                </div>
                {v.isLedger ? (<>
                  <div className="fade">
                    <div className="gc-table-wrap">
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc" }}>
                            <th className="th">{v.t?.cDate}</th>
                            <th className="th">{v.t?.cDesc}</th>
                            <th className="th" style={{ textAlign: "right" }}>{v.t?.cBuy}</th>
                            <th className="th" style={{ textAlign: "right" }}>{v.t?.cPay}</th>
                            <th className="th" style={{ textAlign: "right" }}>{v.t?.cBal}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {__list(v.ledger).map((r, $index) => (<React.Fragment key={$index}>
                              <tr className="trow" style={__sx(`background: ${r?.rowBg ?? ""};`)}>
                                <td className="td num" style={{ width: "150px", color: "#475569" }}>{r?.date}</td>
                                <td className="td">
                                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span aria-hidden="true" style={__sx(`width: 36px; height: 36px; border-radius: var(--radius-lg); background: ${r?.icBg ?? ""}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`)}>
                                      {r?.isBuy ? (<>
                                        <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
                                          <path d="M18.5 6H27.5A1.5 1.5 0 0 1 29 7.5V15.5A1.5 1.5 0 0 1 27.5 17H18.5A1.5 1.5 0 0 1 17 15.5V7.5A1.5 1.5 0 0 1 18.5 6Z" fill="#7dd3fc" />
                                          <path d="M21.5 6h3v5h-3Z" fill="#e0f2fe" />
                                          <path d="M29.5 10H37.5A1.5 1.5 0 0 1 39 11.5V16.5A1.5 1.5 0 0 1 37.5 18H29.5A1.5 1.5 0 0 1 28 16.5V11.5A1.5 1.5 0 0 1 29.5 10Z" fill="#0ea5e9" />
                                          <path d="M32 10h3v4h-3Z" fill="#e0f2fe" />
                                          <path d="M8 18L42 18L38.5 32L13 32Z" fill="#0ea5e9" />
                                          <path d="M15.1 22H37.9A1.1 1.1 0 0 1 39 23.1V23.099999999999998A1.1 1.1 0 0 1 37.9 24.2H15.1A1.1 1.1 0 0 1 14 23.099999999999998V23.1A1.1 1.1 0 0 1 15.1 22Z" fill="#7dd3fc" />
                                          <path d="M16.1 26.5H35.9A1.1 1.1 0 0 1 37 27.6V27.599999999999998A1.1 1.1 0 0 1 35.9 28.7H16.1A1.1 1.1 0 0 1 15 27.599999999999998V27.6A1.1 1.1 0 0 1 16.1 26.5Z" fill="#7dd3fc" />
                                          <path d="M3 11H8L13 32H38" fill="none" stroke="#003087" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                          <path d="M12.2 38.5a3.8 3.8 0 1 0 7.6 0a3.8 3.8 0 1 0 -7.6 0Z" fill="#003087" />
                                          <path d="M31.2 38.5a3.8 3.8 0 1 0 7.6 0a3.8 3.8 0 1 0 -7.6 0Z" fill="#003087" />
                                          <path d="M14.6 38.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#ffffff" />
                                          <path d="M33.6 38.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#ffffff" />
                                        </svg>
                                      </>) : null}
                                      {r?.isPay ? (<>
                                        <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
                                          <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
                                          <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
                                          <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
                                          <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
                                          <path d="M36 8.5V17.5M32 13.5l4 4 4 -4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      </>) : null}
                                      {r?.isOpen ? (<>
                                        <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true">
                                          <path d="M12 5H32A3 3 0 0 1 35 8V39A3 3 0 0 1 32 42H12A3 3 0 0 1 9 39V8A3 3 0 0 1 12 5Z" fill="#0ea5e9" />
                                          <path d="M11.5 5H12.5A2.5 2.5 0 0 1 15 7.5V39.5A2.5 2.5 0 0 1 12.5 42H11.5A2.5 2.5 0 0 1 9 39.5V7.5A2.5 2.5 0 0 1 11.5 5Z" fill="#003087" />
                                          <path d="M16.5 8H31.5A1.5 1.5 0 0 1 33 9.5V37.5A1.5 1.5 0 0 1 31.5 39H16.5A1.5 1.5 0 0 1 15 37.5V9.5A1.5 1.5 0 0 1 16.5 8Z" fill="#ffffff" />
                                          <path d="M19.1 13H28.9A1.1 1.1 0 0 1 30 14.1V14.1A1.1 1.1 0 0 1 28.9 15.2H19.1A1.1 1.1 0 0 1 18 14.1V14.1A1.1 1.1 0 0 1 19.1 13Z" fill="#e0f2fe" />
                                          <path d="M19.1 18H28.9A1.1 1.1 0 0 1 30 19.1V19.099999999999998A1.1 1.1 0 0 1 28.9 20.2H19.1A1.1 1.1 0 0 1 18 19.099999999999998V19.1A1.1 1.1 0 0 1 19.1 18Z" fill="#e0f2fe" />
                                          <path d="M19.1 23H25.9A1.1 1.1 0 0 1 27 24.1V24.099999999999998A1.1 1.1 0 0 1 25.9 25.2H19.1A1.1 1.1 0 0 1 18 24.099999999999998V24.1A1.1 1.1 0 0 1 19.1 23Z" fill="#e0f2fe" />
                                          <path d="M26 35a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#ffffff" />
                                          <path d="M27.5 35a7.5 7.5 0 1 0 15.0 0a7.5 7.5 0 1 0 -15.0 0Z" fill="#0ea5e9" />
                                          <path d="M35 30.5V39.5M31 35.5l4 4 4 -4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      </>) : null}
                                    </span>
                                    <span className="num" style={{ fontWeight: "var(--weight-medium)" }}>{r?.desc}</span>
                                  </span>
                                </td>
                                <td className="td num" style={{ textAlign: "right", fontWeight: "var(--weight-semibold)", color: "#a14f06" }}>{r?.buy}</td>
                                <td className="td num" style={{ textAlign: "right", fontWeight: "var(--weight-semibold)", color: "#047857" }}>{r?.pay}</td>
                                <td className="td num" style={{ textAlign: "right", fontWeight: "var(--weight-semibold)" }}>{r?.bal}</td>
                              </tr>
                            </React.Fragment>))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", background: "#fffcf5", borderTop: "1px solid #fde3b5" }}>
                      <span className="hint" style={{ flexGrow: "1" }}>{v.t?.ledgerNote}</span>
                      <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v.t?.kOwe}</span>
                      <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#a14f06" }}>{v.k?.owe}</span>
                    </div>
                  </div>
                </>) : null}
                {v.isInv ? (<>
                  <div className="fade">
                    <div className="gc-table-wrap">
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc" }}>
                            <th className="th">{v.t?.cNo}</th>
                            <th className="th" style={{ textAlign: "right" }}>{v.t?.cTotal}</th>
                            <th className="th" style={{ textAlign: "right" }}>{v.t?.cPaid}</th>
                            <th className="th">{v.t?.cDue}</th>
                            <th className="th">{v.t?.cStatus}</th>
                            <th className="th" />
                          </tr>
                        </thead>
                        <tbody>
                          {__list(v.invs).map((v, $index) => (<React.Fragment key={$index}>
                              <tr className="trow">
                                <td className="td">
                                  <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <span style={{ width: "44px", height: "54px", borderRadius: "var(--radius-lg)", background: "#f5f8ff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                                      <svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M11 4H33A3 3 0 0 1 36 7V39A3 3 0 0 1 33 42H11A3 3 0 0 1 8 39V7A3 3 0 0 1 11 4Z" fill="#e0f2fe" />
                                        <path d="M11.5 5.5H32.5A2 2 0 0 1 34.5 7.5V38.5A2 2 0 0 1 32.5 40.5H11.5A2 2 0 0 1 9.5 38.5V7.5A2 2 0 0 1 11.5 5.5Z" fill="#ffffff" />
                                        <path d="M14.6 10H23.4A1.6 1.6 0 0 1 25 11.6V11.6A1.6 1.6 0 0 1 23.4 13.2H14.6A1.6 1.6 0 0 1 13 11.6V11.6A1.6 1.6 0 0 1 14.6 10Z" fill="#0ea5e9" />
                                        <path d="M14.1 17H29.9A1.1 1.1 0 0 1 31 18.1V18.099999999999998A1.1 1.1 0 0 1 29.9 19.2H14.1A1.1 1.1 0 0 1 13 18.099999999999998V18.1A1.1 1.1 0 0 1 14.1 17Z" fill="#e0f2fe" />
                                        <path d="M14.1 22H29.9A1.1 1.1 0 0 1 31 23.1V23.099999999999998A1.1 1.1 0 0 1 29.9 24.2H14.1A1.1 1.1 0 0 1 13 23.099999999999998V23.1A1.1 1.1 0 0 1 14.1 22Z" fill="#e0f2fe" />
                                        <path d="M14.1 27H23.9A1.1 1.1 0 0 1 25 28.1V28.099999999999998A1.1 1.1 0 0 1 23.9 29.2H14.1A1.1 1.1 0 0 1 13 28.099999999999998V28.1A1.1 1.1 0 0 1 14.1 27Z" fill="#e0f2fe" />
                                        <path d="M27 35a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z" fill="#e0f2fe" />
                                        <path d="M28.7 35a6.3 6.3 0 1 0 12.6 0a6.3 6.3 0 1 0 -12.6 0Z" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M32.6 34H37.4A1.1 1.1 0 0 1 38.5 35.1V35.1A1.1 1.1 0 0 1 37.4 36.2H32.6A1.1 1.1 0 0 1 31.5 35.1V35.1A1.1 1.1 0 0 1 32.6 34Z" fill="#0ea5e9" />
                                      </svg>
                                    </span>
                                    <span>
                                      <span className="num mono" style={{ display: "block", fontWeight: "var(--weight-semibold)", color: "#003087" }}>{v?.no}</span>
                                      <span className="num" style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v?.sub}</span>
                                    </span>
                                  </span>
                                </td>
                                <td className="td num" style={{ textAlign: "right", fontWeight: "var(--weight-semibold)" }}>{v?.total}</td>
                                <td className="td num" style={{ textAlign: "right", fontWeight: "var(--weight-medium)", color: "#047857" }}>{v?.paid}</td>
                                <td className="td num">{v?.due}</td>
                                <td className="td">
                                  <span className={v?.stCls}>{v?.st}</span>
                                </td>
                                <td className="td" style={{ textAlign: "right" }}>
                                  <button type="button" className="btn line sm" onClick={v?.photo}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
  </svg>{v?.seeLabel}</button>
                                </td>
                              </tr>
                            </React.Fragment>))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>) : null}
                {v.isPays ? (<>
                  <div className="fade">
                    <div className="gc-table-wrap">
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc" }}>
                            <th className="th">{v.t?.cDate}</th>
                            <th className="th" style={{ textAlign: "right" }}>{v.t?.cAmt}</th>
                            <th className="th">{v.t?.cMethod}</th>
                            <th className="th">{v.t?.cWho}</th>
                            <th className="th">{v.t?.cFor}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {__list(v.pays).map((p, $index) => (<React.Fragment key={$index}>
                              <tr className="trow">
                                <td className="td num">{p?.date}</td>
                                <td className="td num" style={{ textAlign: "right", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#047857" }}>{p?.amt}</td>
                                <td className="td">
                                  <span className="pill" style={__sx(`background: ${p?.bg ?? ""}; color: ${p?.fg ?? ""}; gap: 5px; padding-left: 6px;`)}>{p?.isCash ? (<>
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
      <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
      <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
      <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
      <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
      <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
    </svg>
  </>) : null}{p?.isBk ? (<>
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M17 3H31A5 5 0 0 1 36 8V40A5 5 0 0 1 31 45H17A5 5 0 0 1 12 40V8A5 5 0 0 1 17 3Z" fill="#003087" />
      <path d="M16.5 7H31.5A2 2 0 0 1 33.5 9V37A2 2 0 0 1 31.5 39H16.5A2 2 0 0 1 14.5 37V9A2 2 0 0 1 16.5 7Z" fill="#7dd3fc" />
      <path d="M22.6 41.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#0ea5e9" />
      <path d="M19 11H29A2 2 0 0 1 31 13V17A2 2 0 0 1 29 19H19A2 2 0 0 1 17 17V13A2 2 0 0 1 19 11Z" fill="#0ea5e9" />
      <path d="M18.5 22H29.5A1.5 1.5 0 0 1 31 23.5V23.5A1.5 1.5 0 0 1 29.5 25H18.5A1.5 1.5 0 0 1 17 23.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#ffffff" />
      <path d="M18.5 27H25.5A1.5 1.5 0 0 1 27 28.5V28.5A1.5 1.5 0 0 1 25.5 30H18.5A1.5 1.5 0 0 1 17 28.5V28.5A1.5 1.5 0 0 1 18.5 27Z" fill="#ffffff" />
    </svg>
  </>) : null}{p?.isBank ? (<>
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M4 17L24 5L44 17Z" fill="#0ea5e9" />
      <path d="M7 16H41A1 1 0 0 1 42 17V19A1 1 0 0 1 41 20H7A1 1 0 0 1 6 19V17A1 1 0 0 1 7 16Z" fill="#003087" />
      <path d="M9 21h4.5v14h-4.5Z" fill="#7dd3fc" />
      <path d="M17 21h4.5v14h-4.5Z" fill="#7dd3fc" />
      <path d="M26.5 21h4.5v14h-4.5Z" fill="#7dd3fc" />
      <path d="M34.5 21h4.5v14h-4.5Z" fill="#7dd3fc" />
      <path d="M6.5 35H41.5A1.5 1.5 0 0 1 43 36.5V39.5A1.5 1.5 0 0 1 41.5 41H6.5A1.5 1.5 0 0 1 5 39.5V36.5A1.5 1.5 0 0 1 6.5 35Z" fill="#003087" />
      <path d="M21.8 12.5a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0Z" fill="#7dd3fc" />
    </svg>
  </>) : null}{p?.m}</span>
                                  <span className="num" style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", marginTop: "2px" }}>{p?.ref}</span>
                                </td>
                                <td className="td">
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ width: "30px", height: "30px", borderRadius: "var(--radius-full)", background: "#e0e9f7", color: "#003087", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)", display: "flex", alignItems: "center", justifyContent: "center" }}>{p?.ini}</span>{p?.who}</span>
                                </td>
                                <td className="td num mono" style={{ fontSize: "var(--text-sm)", color: "#475569" }}>{p?.inv}</td>
                              </tr>
                            </React.Fragment>))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>) : null}
                {v.isDue ? (<>
                  <div className="fade" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "var(--radius-xl)", background: "#eef3fb" }}>
                      <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M24 5C16.5 5 12 10.5 12 18V27L8 33H40L36 27V18C36 10.5 31.5 5 24 5Z" fill="#0ea5e9" />
                        <path d="M23 34H25A3 3 0 0 1 28 37V37A3 3 0 0 1 25 40H23A3 3 0 0 1 20 37V37A3 3 0 0 1 23 34Z" fill="#0ea5e9" />
                        <path d="M30.5 10a5.5 5.5 0 1 0 11.0 0a5.5 5.5 0 1 0 -11.0 0Z" fill="#0ea5e9" />
                      </svg>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>{v.t?.remind}</div>
                        <div className="hint">{v.t?.remindHint}</div>
                      </div>
                      <button type="button" className={v.remind?.cls} aria-pressed={v.remind?.on} aria-label={v.t?.remind} onClick={v.remind?.toggle} />
                    </div>
                    {v.noDue ? <div className="note n-ok">Nothing is owed to {v.t?.name}. No payment dates to remind you about.</div> : null}
                    {__list(v.sched).map((x, $index) => (<React.Fragment key={$index}>
                        <div style={__sx(`display: flex; align-items: center; gap: 16px; padding: 14px 16px; border-radius: var(--radius-xl); border: 1px solid ${x?.bd ?? ""}; background: ${x?.bg ?? ""};`)}>
                          <div style={{ width: "66px", height: "66px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                            <span className="num" style={__sx(`font-size: var(--text-2xl); line-height: 30px; font-weight: var(--weight-semibold); color: ${x?.fg ?? ""};`)}>{x?.d}</span>
                            <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{x?.m}</span>
                          </div>
                          <div style={{ flexGrow: "1" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span className={x?.relCls}>{x?.rel}</span>
                              <span className="num mono" style={{ fontSize: "var(--text-sm)", color: "#475569" }}>{x?.inv}</span>
                            </div>
                            <div className="num" style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: "4px" }}>{x?.sub}</div>
                          </div>
                          <span className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#a14f06" }}>{x?.amt}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-sm)", color: "#475569", paddingLeft: "12px", borderLeft: "1px solid #e2e8f0" }}>{v.t?.remindRow}<button type="button" className={x?.swCls} aria-pressed={x?.swOn} aria-label={`${v.t?.remindRow ?? ""} ${x?.inv ?? ""}`} onClick={x?.toggle} /></span>
                        </div>
                      </React.Fragment>))}
                  </div>
                </>) : null}
                {v.isPo ? (<>
                  <div className="fade">
                    {v.noPos ? <div className="note n-info" style={{ margin: "16px" }}>No purchase orders to {v.t?.name} yet. Use New purchase to order from them.</div> : (
                    <div className="gc-table-wrap">
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc" }}>
                            <th className="th">Order</th>
                            <th className="th">{v.t?.cDate}</th>
                            <th className="th">{v.t?.cStatus}</th>
                            <th className="th" style={{ textAlign: "right" }}>Received</th>
                            <th className="th" style={{ textAlign: "right" }}>{v.t?.cTotal}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {__list(v.pos).map((p) => (
                            <tr key={p.no} className="trow">
                              <td className="td"><__Link href={p.href} className="num mono" style={{ fontWeight: "var(--weight-semibold)", color: "#003087" }}>{p.no}</__Link></td>
                              <td className="td num">{p.date}</td>
                              <td className="td"><span className={p.cls}>{p.label}</span></td>
                              <td className="td num" style={{ textAlign: "right" }}>{p.pieces}</td>
                              <td className="td num" style={{ textAlign: "right", fontWeight: "var(--weight-semibold)" }}>{p.total}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    )}
                  </div>
                </>) : null}
              </section>
              {v.payOpen ? (<>
                <div role="button" tabIndex={0} className="scrim" onClick={v.closePay} />
                <section className="modal fade" role="dialog" aria-label={v.t?.payTitle} style={{ top: "90px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "18px 22px", borderBottom: "1px solid #eef2f6" }}>
                    <span style={{ width: "48px", height: "48px", borderRadius: "var(--radius-xl)", background: "#fff8eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                      <svg width="36" height="36" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M10.5 30H27.5A3.5 3.5 0 0 1 31 33.5V33.5A3.5 3.5 0 0 1 27.5 37H10.5A3.5 3.5 0 0 1 7 33.5V33.5A3.5 3.5 0 0 1 10.5 30Z" fill="#0ea5e9" />
                        <path d="M10.5 24.5H27.5A3.5 3.5 0 0 1 31 28.0V28.0A3.5 3.5 0 0 1 27.5 31.5H10.5A3.5 3.5 0 0 1 7 28.0V28.0A3.5 3.5 0 0 1 10.5 24.5Z" fill="#0ea5e9" />
                        <path d="M10.5 19H27.5A3.5 3.5 0 0 1 31 22.5V22.5A3.5 3.5 0 0 1 27.5 26H10.5A3.5 3.5 0 0 1 7 22.5V22.5A3.5 3.5 0 0 1 10.5 19Z" fill="#7dd3fc" />
                        <path d="M27 13a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z" fill="#0ea5e9" />
                        <path d="M36 8.5V17.5M32 13.5l4 4 4 -4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1" }}>
                      <h2 className="h2">{v.t?.payTitle} · {v.t?.name}</h2>
                      <div className="num" style={{ fontSize: "var(--text-sm)", color: "#475569" }}>{v.t?.nowOwe} <b style={{ color: "#a14f06" }}>{v.k?.owe}</b></div>
                    </div>
                    <button type="button" className="ib" onClick={v.closePay} aria-label={v.t?.close}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div className="sd-amt" style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                      <label className="fld" style={{ flexGrow: "1" }}>
                        <span className="lbl">{v.t?.amount}</span>
                        <input className="inp num" inputMode="numeric" value={v.pm?.amtTxt} onChange={v.pm?.typeAmt} aria-label={v.t?.amount} style={{ height: "58px", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }} />
                      </label>
                      <div style={{ width: "180px", height: "58px", padding: "0 12px", borderRadius: "var(--radius-xl)", background: "#fff4e0", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#7a3b04" }}>{v.t?.after}</span>
                        <span className="num" style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#a14f06" }}>{v.pm?.left}</span>
                      </div>
                    </div>
                    <div className="fld">
                      <span className="lbl">{v.t?.method}</span>
                      <div className="sd-methods" style={{ display: "flex", gap: "8px" }}>
                        {__list(v.pm?.methods).map((o, $index) => (<React.Fragment key={$index}>
                            <button type="button" className={o?.cls} aria-pressed={o?.on} onClick={o?.pick} style={{ flex: "1", justifyContent: "center", height: "52px" }}>{o?.isCash ? (<>
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M6.5 13H41.5A3.5 3.5 0 0 1 45 16.5V33.5A3.5 3.5 0 0 1 41.5 37H6.5A3.5 3.5 0 0 1 3 33.5V16.5A3.5 3.5 0 0 1 6.5 13Z" fill="#003087" />
    <path d="M8.5 16H39.5A2.5 2.5 0 0 1 42 18.5V31.5A2.5 2.5 0 0 1 39.5 34H8.5A2.5 2.5 0 0 1 6 31.5V18.5A2.5 2.5 0 0 1 8.5 16Z" fill="#0ea5e9" />
    <path d="M18 25a6 6 0 1 0 12 0a6 6 0 1 0 -12 0Z" fill="#e0f2fe" />
    <path d="M24.0 21H24.0A1.2 1.2 0 0 1 25.2 22.2V27.8A1.2 1.2 0 0 1 24.0 29H24.0A1.2 1.2 0 0 1 22.8 27.8V22.2A1.2 1.2 0 0 1 24.0 21Z" fill="#003087" />
    <path d="M8.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
    <path d="M35.5 25a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z" fill="#7dd3fc" />
  </svg>
</>) : null}{o?.isBk ? (<>
  <span style={{ width: "24px", height: "24px", borderRadius: "var(--radius-md)", background: "#fdecf5", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M17 3H31A5 5 0 0 1 36 8V40A5 5 0 0 1 31 45H17A5 5 0 0 1 12 40V8A5 5 0 0 1 17 3Z" fill="#003087" />
      <path d="M16.5 7H31.5A2 2 0 0 1 33.5 9V37A2 2 0 0 1 31.5 39H16.5A2 2 0 0 1 14.5 37V9A2 2 0 0 1 16.5 7Z" fill="#7dd3fc" />
      <path d="M22.6 41.5a1.4 1.4 0 1 0 2.8 0a1.4 1.4 0 1 0 -2.8 0Z" fill="#0ea5e9" />
      <path d="M19 11H29A2 2 0 0 1 31 13V17A2 2 0 0 1 29 19H19A2 2 0 0 1 17 17V13A2 2 0 0 1 19 11Z" fill="#0ea5e9" />
      <path d="M18.5 22H29.5A1.5 1.5 0 0 1 31 23.5V23.5A1.5 1.5 0 0 1 29.5 25H18.5A1.5 1.5 0 0 1 17 23.5V23.5A1.5 1.5 0 0 1 18.5 22Z" fill="#ffffff" />
      <path d="M18.5 27H25.5A1.5 1.5 0 0 1 27 28.5V28.5A1.5 1.5 0 0 1 25.5 30H18.5A1.5 1.5 0 0 1 17 28.5V28.5A1.5 1.5 0 0 1 18.5 27Z" fill="#ffffff" />
    </svg>
  </span>
</>) : null}{o?.isBank ? (<>
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M4 17L24 5L44 17Z" fill="#0ea5e9" />
    <path d="M7 16H41A1 1 0 0 1 42 17V19A1 1 0 0 1 41 20H7A1 1 0 0 1 6 19V17A1 1 0 0 1 7 16Z" fill="#003087" />
    <path d="M9 21h4.5v14h-4.5Z" fill="#7dd3fc" />
    <path d="M17 21h4.5v14h-4.5Z" fill="#7dd3fc" />
    <path d="M26.5 21h4.5v14h-4.5Z" fill="#7dd3fc" />
    <path d="M34.5 21h4.5v14h-4.5Z" fill="#7dd3fc" />
    <path d="M6.5 35H41.5A1.5 1.5 0 0 1 43 36.5V39.5A1.5 1.5 0 0 1 41.5 41H6.5A1.5 1.5 0 0 1 5 39.5V36.5A1.5 1.5 0 0 1 6.5 35Z" fill="#003087" />
    <path d="M21.8 12.5a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0Z" fill="#7dd3fc" />
  </svg>
</>) : null}{o?.l}</button>
                          </React.Fragment>))}
                      </div>
                    </div>
                    <div className="fld">
                      <span className="lbl" style={{ display: "flex", alignItems: "center", gap: "6px" }}><svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M11 4H33A3 3 0 0 1 36 7V39A3 3 0 0 1 33 42H11A3 3 0 0 1 8 39V7A3 3 0 0 1 11 4Z" fill="#e0f2fe" />
  <path d="M11.5 5.5H32.5A2 2 0 0 1 34.5 7.5V38.5A2 2 0 0 1 32.5 40.5H11.5A2 2 0 0 1 9.5 38.5V7.5A2 2 0 0 1 11.5 5.5Z" fill="#ffffff" />
  <path d="M14.6 10H23.4A1.6 1.6 0 0 1 25 11.6V11.6A1.6 1.6 0 0 1 23.4 13.2H14.6A1.6 1.6 0 0 1 13 11.6V11.6A1.6 1.6 0 0 1 14.6 10Z" fill="#0ea5e9" />
  <path d="M14.1 17H29.9A1.1 1.1 0 0 1 31 18.1V18.099999999999998A1.1 1.1 0 0 1 29.9 19.2H14.1A1.1 1.1 0 0 1 13 18.099999999999998V18.1A1.1 1.1 0 0 1 14.1 17Z" fill="#e0f2fe" />
  <path d="M14.1 22H29.9A1.1 1.1 0 0 1 31 23.1V23.099999999999998A1.1 1.1 0 0 1 29.9 24.2H14.1A1.1 1.1 0 0 1 13 23.099999999999998V23.1A1.1 1.1 0 0 1 14.1 22Z" fill="#e0f2fe" />
  <path d="M14.1 27H23.9A1.1 1.1 0 0 1 25 28.1V28.099999999999998A1.1 1.1 0 0 1 23.9 29.2H14.1A1.1 1.1 0 0 1 13 28.099999999999998V28.1A1.1 1.1 0 0 1 14.1 27Z" fill="#e0f2fe" />
  <path d="M27 35a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z" fill="#e0f2fe" />
  <path d="M28.7 35a6.3 6.3 0 1 0 12.6 0a6.3 6.3 0 1 0 -12.6 0Z" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M32.6 34H37.4A1.1 1.1 0 0 1 38.5 35.1V35.1A1.1 1.1 0 0 1 37.4 36.2H32.6A1.1 1.1 0 0 1 31.5 35.1V35.1A1.1 1.1 0 0 1 32.6 34Z" fill="#0ea5e9" />
</svg>{v.t?.which}</span>
                      <span className="hint">{v.t?.whichHint}</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                        {__list(v.pm?.invs).map((v, $index) => (<React.Fragment key={$index}>
                            <button type="button" role="checkbox" aria-checked={v?.on} onClick={v?.toggle} style={__sx(`display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: var(--radius-xl); border: 1px solid ${v?.bd ?? ""}; background: ${v?.bg ?? ""}; cursor: pointer; text-align: left;`)}>
                              <span style={__sx(`width: 24px; height: 24px; border-radius: var(--radius-md); border: 2px solid ${v?.boxBd ?? ""}; background: ${v?.boxBg ?? ""}; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M20 6 9 17l-5-5" />
                                </svg>
                              </span>
                              <span style={{ flexGrow: "1" }}>
                                <span className="num mono" style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{v?.no}</span>
                                <span className="num" style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v?.sub}</span>
                              </span>
                              <span className={v?.dueCls}>{v?.due}</span>
                              <span className="num" style={{ width: "90px", textAlign: "right", fontWeight: "var(--weight-semibold)" }}>{v?.amt}</span>
                            </button>
                          </React.Fragment>))}
                      </div>
                    </div>
                    <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
                      <label className="fld">
                        <span className="lbl">Pay from account</span>
                        <select className="inp" value={v.pm?.acc} onChange={v.pm?.accIn} aria-label="Pay from account">
                          {__list(v.pm?.accounts).map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                        </select>
                        <span className="hint" role={v.pm?.short ? "alert" : undefined} style={v.pm?.short ? { color: "var(--text-danger)" } : undefined}>{v.pm?.accMsg}</span>
                      </label>
                      <label className="fld">
                        <span className="lbl">{v.t?.cWho}</span>
                        <select className="inp" value={v.pm?.by} onChange={v.pm?.byIn} aria-label={v.t?.cWho}>
                          {__list(v.pm?.staff).map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </label>
                    </div>
                    <label className="fld">
                      <span className="lbl">{v.t?.note}</span>
                      <input className="inp" placeholder={v.t?.notePh} aria-label={v.t?.note} value={v.pm?.note} onChange={v.pm?.noteIn} />
                    </label>
                  </div>
                  <div style={{ padding: "14px 22px 18px", borderTop: "1px solid #eef2f6", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button type="button" className="btn line" onClick={v.closePay}>{v.t?.cancel}</button>
                    <button type="button" className="btn okb" onClick={v.pm?.confirm} style={{ minWidth: "200px" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>{v.t?.paid} · {v.pm?.amtMoney}</button>
                  </div>
                </section>
              </>) : null}
              {v.photoOpen ? (<>
                <div role="button" tabIndex={0} className="scrim" onClick={v.closePhoto} />
                <section className="modal fade" role="dialog" aria-label={v.t?.photoTitle} style={{ top: "90px", width: "480px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", borderBottom: "1px solid #eef2f6" }}>
                    <svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M11 4H33A3 3 0 0 1 36 7V39A3 3 0 0 1 33 42H11A3 3 0 0 1 8 39V7A3 3 0 0 1 11 4Z" fill="#e0f2fe" />
                      <path d="M11.5 5.5H32.5A2 2 0 0 1 34.5 7.5V38.5A2 2 0 0 1 32.5 40.5H11.5A2 2 0 0 1 9.5 38.5V7.5A2 2 0 0 1 11.5 5.5Z" fill="#ffffff" />
                      <path d="M14.6 10H23.4A1.6 1.6 0 0 1 25 11.6V11.6A1.6 1.6 0 0 1 23.4 13.2H14.6A1.6 1.6 0 0 1 13 11.6V11.6A1.6 1.6 0 0 1 14.6 10Z" fill="#0ea5e9" />
                      <path d="M14.1 17H29.9A1.1 1.1 0 0 1 31 18.1V18.099999999999998A1.1 1.1 0 0 1 29.9 19.2H14.1A1.1 1.1 0 0 1 13 18.099999999999998V18.1A1.1 1.1 0 0 1 14.1 17Z" fill="#e0f2fe" />
                      <path d="M14.1 22H29.9A1.1 1.1 0 0 1 31 23.1V23.099999999999998A1.1 1.1 0 0 1 29.9 24.2H14.1A1.1 1.1 0 0 1 13 23.099999999999998V23.1A1.1 1.1 0 0 1 14.1 22Z" fill="#e0f2fe" />
                      <path d="M14.1 27H23.9A1.1 1.1 0 0 1 25 28.1V28.099999999999998A1.1 1.1 0 0 1 23.9 29.2H14.1A1.1 1.1 0 0 1 13 28.099999999999998V28.1A1.1 1.1 0 0 1 14.1 27Z" fill="#e0f2fe" />
                      <path d="M27 35a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z" fill="#e0f2fe" />
                      <path d="M28.7 35a6.3 6.3 0 1 0 12.6 0a6.3 6.3 0 1 0 -12.6 0Z" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M32.6 34H37.4A1.1 1.1 0 0 1 38.5 35.1V35.1A1.1 1.1 0 0 1 37.4 36.2H32.6A1.1 1.1 0 0 1 31.5 35.1V35.1A1.1 1.1 0 0 1 32.6 34Z" fill="#0ea5e9" />
                    </svg>
                    <div style={{ flexGrow: "1" }}>
                      <h2 className="h2">{v.t?.photoTitle}</h2>
                      <div className="num mono hint">{v.photoName}</div>
                    </div>
                    <button type="button" className="ib" onClick={v.closePhoto} aria-label={v.t?.close}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div style={{ padding: "20px" }}>
                    <div role="img" aria-label={`${v.t?.photoTitle ?? ""} ${v.photoName ?? ""}`} style={{ height: "440px", borderRadius: "var(--radius-xl)", background: "#f1f5f9", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", color: "var(--text-muted)" }}>
                      <svg width="80" height="80" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M11 4H33A3 3 0 0 1 36 7V39A3 3 0 0 1 33 42H11A3 3 0 0 1 8 39V7A3 3 0 0 1 11 4Z" fill="#e0f2fe" />
                        <path d="M11.5 5.5H32.5A2 2 0 0 1 34.5 7.5V38.5A2 2 0 0 1 32.5 40.5H11.5A2 2 0 0 1 9.5 38.5V7.5A2 2 0 0 1 11.5 5.5Z" fill="#ffffff" />
                        <path d="M14.6 10H23.4A1.6 1.6 0 0 1 25 11.6V11.6A1.6 1.6 0 0 1 23.4 13.2H14.6A1.6 1.6 0 0 1 13 11.6V11.6A1.6 1.6 0 0 1 14.6 10Z" fill="#0ea5e9" />
                        <path d="M14.1 17H29.9A1.1 1.1 0 0 1 31 18.1V18.099999999999998A1.1 1.1 0 0 1 29.9 19.2H14.1A1.1 1.1 0 0 1 13 18.099999999999998V18.1A1.1 1.1 0 0 1 14.1 17Z" fill="#e0f2fe" />
                        <path d="M14.1 22H29.9A1.1 1.1 0 0 1 31 23.1V23.099999999999998A1.1 1.1 0 0 1 29.9 24.2H14.1A1.1 1.1 0 0 1 13 23.099999999999998V23.1A1.1 1.1 0 0 1 14.1 22Z" fill="#e0f2fe" />
                        <path d="M14.1 27H23.9A1.1 1.1 0 0 1 25 28.1V28.099999999999998A1.1 1.1 0 0 1 23.9 29.2H14.1A1.1 1.1 0 0 1 13 28.099999999999998V28.1A1.1 1.1 0 0 1 14.1 27Z" fill="#e0f2fe" />
                        <path d="M27 35a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z" fill="#e0f2fe" />
                        <path d="M28.7 35a6.3 6.3 0 1 0 12.6 0a6.3 6.3 0 1 0 -12.6 0Z" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M32.6 34H37.4A1.1 1.1 0 0 1 38.5 35.1V35.1A1.1 1.1 0 0 1 37.4 36.2H32.6A1.1 1.1 0 0 1 31.5 35.1V35.1A1.1 1.1 0 0 1 32.6 34Z" fill="#0ea5e9" />
                      </svg>
                      <span className="num" style={{ fontSize: "var(--text-sm)" }}>{v.photoName}</span>
                    </div>
                  </div>
                  <div style={{ padding: "0 20px 20px", display: "flex", gap: "10px" }}>
                    <button type="button" className="btn line" onClick={v.print} style={{ flex: "1" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
</svg>{v.t?.print}</button>
                    <button type="button" className="btn solid" onClick={v.closePhoto} style={{ flex: "1" }}>{v.t?.close}</button>
                  </div>
                </section>
              </>) : null}
              </>)}
            </div>
          </main>
          {v.hasMsg ? (<>
            <div className="fade gc-on-dark" role="status" style={{ position: "absolute", top: "90px", left: "50%", transform: "translateX(-50%)", zIndex: "30", display: "flex", alignItems: "center", gap: "10px", padding: "12px 18px", borderRadius: "var(--radius-xl)", background: "#0f172a", color: "#fff", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-medium)", boxShadow: "0 16px 36px -14px rgba(15,23,42,.6)", maxWidth: "640px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span>{v.msg}</span>
            </div>
          </>) : null}
          <__Link href="/grid-ai" className="gfab" aria-label="Open GridAI">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
              <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" />
            </svg>
            <span>GridAI</span>
          </__Link>
        </div>
      </div>
    );
  }
}
