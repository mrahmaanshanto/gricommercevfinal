'use client';
// Generated from design/templates/accounts/BankAccounts.dc.html by scripts/convert-design.mjs.
// Bank accounts — Accounts — bank accounts with ledger codes, balances and opening balances.
// Edit freely: this file is now the source for the screen.
// Live ledger (src/lib/ledger.js): the BRAC, Dutch-Bangla and card-settlement rows are the ledger's bank
// accounts, so their balances come from balanceOf (opening + every entry posted in this browser) and
// the detail panel lists their latest entries. The Money book (/money-book) shows every account.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { toast as __toast } from '@/runtime/ui';
import { EmptyState as __EmptyState } from '@/components/ui';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { getEntries, balanceOf, accountBy } from '@/lib/ledger';
import { formatDate as __formatDate, formatTime as __formatTime } from '@/lib/format';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function pTabs(self, list, cur, key, counts) { return mkTabs(self, list, cur, key, counts).map(function (x) { x.pcls = x.on ? 'ptab on' : 'ptab'; return x; }); }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function stepN(self, key, def, step, min, max) { var s = self.state || {}; var v = s[key] == null ? def : s[key]; return { v: v, dec: function () { var p = {}; p[key] = Math.max(min, +(v - step).toFixed(2)); self.setState(p); }, inc: function () { var p = {}; p[key] = Math.min(max, +(v + step).toFixed(2)); self.setState(p); } }; }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { __toast(m, { tone: bad ? 'error' : 'success' }); }
function setQuery(key, value) { if (typeof window === 'undefined') return; var u = new URL(window.location.href); if (value) u.searchParams.set(key, value); else u.searchParams.delete(key); window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash); }
function getQuery(key) { if (typeof window === 'undefined') return ''; return new URLSearchParams(window.location.search).get(key) || ''; }
function focusField(id, first) { setTimeout(function () { var el = document.getElementById(id); if (el && first) el = el.querySelector('button, input, select, textarea') || el; if (!el) return; var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); el.focus({ preventScroll: true }); }, 0); }
function msgV(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#fff4e0' : '#e7f8f1', msgFg: s.bad ? '#7a3b04' : '#065f46' }; }
function segv(self, opts, cur, key) { return opts.map(function (o) { var on = o[0] === cur; return { l: o[1], on: on, bg: on ? '#0b1733' : 'transparent', fg: on ? '#fff' : '#475569', pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
function lseg(self, opts, cur, key) { return opts.map(function (o) { var on = o[0] === cur; return { l: o[1], on: on, bg: on ? '#fff' : 'transparent', fg: on ? '#0b1733' : '#64748b', sh: on ? '0 1px 2px rgba(15,23,42,.08), 0 1px 1px rgba(15,23,42,.04)' : 'none', pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
function ring(pctv, r) { var C = 2 * Math.PI * r; return { da: (C * pctv / 100).toFixed(1) + ' ' + C.toFixed(1) }; }
function curve(pts) { if (!pts.length) return ''; var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1); for (var i = 0; i < pts.length - 1; i++) { var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6, c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6; d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1); } return d; }
function pts(vals, w, h, max, min, padT, padB) { padT = padT || 2; padB = padB || 2; min = min == null ? 0 : min; max = max || Math.max.apply(null, vals) || 1; var n = vals.length; return vals.map(function (v, i) { return [n === 1 ? w / 2 : i * w / (n - 1), padT + (h - padT - padB) * (1 - (v - min) / (max - min || 1))]; }); }
function sparkP(vals, w, h) { w = w || 160; h = h || 30; var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals); var p = pts(vals, w, h, mx + (mx - mn) * .1, mn - (mx - mn) * .15, 3, 2); var l = curve(p); return { line: l, area: l + ' L' + w + ' ' + h + ' L0 ' + h + ' Z' }; }
function series(n, base, amp, seed, trend) { var out = []; for (var i = 0; i < n; i++) { var s = Math.sin((i + seed) * 1.7) * .5 + Math.sin((i * 3 + seed) * .9) * .3 + Math.cos(i * .45 + seed) * .2; out.push(Math.max(0, base * (1 + (trend || 0) * (i / n - .5)) + amp * s)); } return out; }

function val(e) { return e && e.target ? e.target.value : e; }

// Chart of accounts: code, name, group, normal side (D/C), opening balance, auto-posted note
var COA = [
  [1010, 'Cash in hand · Dhanmondi drawer', 'Assets', 'D', 18450, 'POS sessions'], [1011, 'Cash in hand · Mirpur drawer', 'Assets', 'D', 9820, 'POS sessions'],
  [1020, 'BRAC Bank · current ··2081', 'Assets', 'D', 842300, ''], [1021, 'Dutch-Bangla Bank · savings ··5530', 'Assets', 'D', 310000, ''],
  [1030, 'bKash merchant · 01711-482093', 'Assets', 'D', 126540, 'Online payments'], [1031, 'Nagad merchant · 01811-843300', 'Assets', 'D', 48210, 'Online payments'], [1032, 'Rocket · 01611-390155', 'Assets', 'D', 6300, ''],
  [1040, 'Courier COD receivable', 'Assets', 'D', 85800, 'Deliveries'], [1050, 'SSLCOMMERZ settlement receivable', 'Assets', 'D', 21400, 'Card payments'], [1060, 'POS clearing', 'Assets', 'D', 0, 'POS sales'],
  [1100, 'Accounts receivable', 'Assets', 'D', 32600, 'Credit sales'], [1200, 'Inventory', 'Assets', 'D', 4862300, 'Purchases and sales'], [1300, 'Advances to staff', 'Assets', 'D', 45000, 'Loans & advances'],
  [2010, 'Supplier payables', 'Liabilities', 'C', 1512400, 'Purchase orders'], [2020, 'Salaries payable', 'Liabilities', 'C', 0, 'Payroll'], [2030, 'VAT payable', 'Liabilities', 'C', 38250, 'Sales'],
  [2040, 'BRAC SME loan', 'Liabilities', 'C', 1250000, ''], [2050, 'Customer wallet balances', 'Liabilities', 'C', 18760, 'Loyalty wallet'], [2060, 'Commissions payable', 'Liabilities', 'C', 12400, 'Commissions'],
  [3010, 'Owner’s capital', 'Equity', 'C', 3000000, ''], [3020, 'Owner’s drawings', 'Equity', 'D', 180000, ''], [3030, 'Retained earnings', 'Equity', 'C', 0, 'Year end'], [3040, 'Opening balances', 'Equity', 'C', 0, 'Setup'],
  [4010, 'Sales · online', 'Income', 'C', 3842000, 'Orders'], [4020, 'Sales · shops', 'Income', 'C', 2716000, 'POS'], [4030, 'Delivery charges collected', 'Income', 'C', 214300, 'Orders'], [4040, 'Other income', 'Income', 'C', 12500, ''],
  [5000, 'Cost of goods sold', 'Expenses', 'D', 3291540, 'Sales'],
  [6010, 'Rent', 'Expenses', 'D', 540000, ''], [6020, 'Electricity, water and gas', 'Expenses', 'D', 86400, ''], [6030, 'Salaries', 'Expenses', 'D', 1260000, 'Payroll'], [6040, 'Courier charges', 'Expenses', 'D', 198600, 'Deliveries'],
  [6050, 'Payment gateway fees', 'Expenses', 'D', 42100, 'Settlements'], [6060, 'Advertising', 'Expenses', 'D', 372000, ''], [6070, 'Internet and software', 'Expenses', 'D', 48600, 'GridCommerce billing'],
  [6080, 'Packaging', 'Expenses', 'D', 64300, ''], [6090, 'Bank charges', 'Expenses', 'D', 6200, ''], [6100, 'Staff commissions', 'Expenses', 'D', 52800, 'Commissions'], [6110, 'SMS, WhatsApp and AI calls', 'Expenses', 'D', 16800, 'Wallet'], [6120, 'Miscellaneous', 'Expenses', 'D', 9800, ''], [6130, 'Cash short and over', 'Expenses', 'D', 1250, 'POS sessions'], [6140, 'Loan interest', 'Expenses', 'D', 37500, '']
];
(function () { // retained earnings makes the books balance: assets + drawings + expenses = liabilities + capital + income + RE
  var sum = function (g) { return COA.filter(function (a) { return a[2] === g; }).reduce(function (x, a) { return x + a[4]; }, 0); };
  var dr = sum('Assets') + 180000 + sum('Expenses'), cr = sum('Liabilities') + 3000000 + sum('Income');
  COA.forEach(function (a) { if (a[0] === 3030) a[4] = dr - cr; });
})();
function acct(code) { return COA.filter(function (a) { return a[0] === code; })[0]; }
function aName(code) { var a = acct(code); return a ? a[1] : String(code); }
var MONS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtD(d) { var x = new Date(d + 'T00:00:00'); return isNaN(x) ? d : x.getDate() + ' ' + MONS[x.getMonth()]; }
function num(x) { var n = parseFloat(String(x || '').replace(/[^\d.]/g, '')); return isNaN(n) ? 0 : n; }
function tk2(n) { n = Math.round(n * 100) / 100; var neg = n < 0; n = Math.abs(n); var p = n.toFixed(2).split('.'); return (neg ? '−' : '') + bdt(+p[0]) + (p[1] !== '00' ? '.' + p[1] : ''); }
function linesView(lines) { var d = 0, c = 0; var rows = lines.filter(function (l) { return l[1] || l[2]; }).map(function (l) { d += l[1] || 0; c += l[2] || 0; return { code: typeof l[0] === 'number' ? String(l[0]) : 'new', n: aName(l[0]), d: l[1] ? tk2(l[1]) : '', c: l[2] ? tk2(l[2]) : '' }; });
  var ok = Math.abs(d - c) < 0.005 && d > 0; return { rows: rows, td: tk2(d), tc: tk2(c), ok: ok, okL: ok ? 'Balanced' : d === 0 ? 'Enter an amount' : 'Out by ' + tk2(Math.abs(d - c)), okBg: ok ? '#e7f8f1' : '#fff4e0', okFg: ok ? '#047857' : '#a14f06' }; }
var CASHLIKE = [1010, 1011, 1020, 1021, 1030, 1031, 1032];
function shortName(code) { return { 1010: 'Cash · Dhanmondi', 1011: 'Cash · Mirpur', 1020: 'BRAC Bank', 1021: 'Dutch-Bangla Bank', 1030: 'bKash', 1031: 'Nagad', 1032: 'Rocket', 1040: 'Courier COD', 1050: 'SSLCOMMERZ', 2010: 'Supplier payables', 2020: 'Salaries payable', 2030: 'VAT payable', 2040: 'BRAC SME loan', 2060: 'Commissions payable' }[code] || aName(code); }


var POSTS = true;
// `led` is the ledger account the row is (its balance and entries come from the ledger)
var ROWS = [ { id: 'BRAC Bank ··2081', st: 'current', code: 1020, led: 'brac', branch: 'Gulshan Avenue', rec: '25 Sep', f: { amt: '642300', name: 'BRAC Bank current', code: 1020 } }, { id: 'Dutch-Bangla ··5530', st: 'savings', code: 1021, led: 'dbbl', branch: 'Dhanmondi', rec: '31 Aug', f: { amt: '188750', name: 'Dutch-Bangla savings', code: 1021 } }, { id: 'Card settlements', st: 'current', code: 1050, led: 'card', branch: 'Paid out to BRAC Bank', rec: 'Not yet', f: { amt: '0', name: 'Card settlements (to BRAC Bank)', code: 1050 } } ];
var KIND_L = { sale: 'Sale', 'invoice payment': 'Invoice payment', refund: 'Refund', 'supplier payment': 'Supplier payment', expense: 'Expense', 'paid out': 'Paid out', 'cash pickup': 'Cash pickup', transfer: 'Transfer', 'cash in': 'Cash added' };
/** Balance of a row: the ledger's live balance when it is a ledger account, else its opening balance. */
function balOf(r, entries) { return r.led ? balanceOf(r.led, entries) : num(r.f.amt); }
var DEF = { bank: 'BRAC Bank', type: 'current', name: '', no: '', branch: '', amt: '', date: '2026-09-29' };
var FIELDS = [{ k: 'bank', l: 'Bank', t: 'chips', o: [['BRAC Bank', 'BRAC Bank'], ['Dutch-Bangla Bank', 'Dutch-Bangla Bank'], ['The City Bank', 'The City Bank']] }, { k: 'type', l: 'Type', t: 'chips', o: [['current', 'Current'], ['savings', 'Savings'], ['snd', 'SND']] },
  { k: 'no', l: 'Account number', t: 'text', ph: '13 to 17 digits', hint: function (f) { return f.no && !/^\d{10,17}$/.test(f.no.replace(/\s/g, '')) ? 'Use digits only.' : f.no ? 'Shown as ··' + f.no.replace(/\s/g, '').slice(-4) + ' everywhere else.' : ''; }, hintC: function (f) { return /^\d{10,17}$/.test((f.no || '').replace(/\s/g, '')) ? '#64748b' : '#b83210'; } },
  { k: 'branch', l: 'Branch', t: 'text', ph: 'e.g. Banani' }, { k: 'amt', l: 'Opening balance', t: 'money' }, { k: 'date', l: 'Balance as of', t: 'date' }];
function RULE(f) { var a = num(f.amt); var nm = f.bank + ' · ' + (f.type === 'snd' ? 'SND' : f.type) + (f.no ? ' ··' + f.no.replace(/\s/g, '').slice(-4) : ''); if (f.code) return [[f.code, a, 0], [3040, 0, a]]; return [[nm, a, 0], [3040, 0, a]]; }
function CHECK(f) { if (!/^\d{10,17}$/.test((f.no || '').replace(/\s/g, ''))) return 'Enter the account number.'; if (!f.branch) return 'Enter the branch.'; return ''; }
function ERRS(f) { var e = {}; var no = (f.no || '').replace(/\s/g, ''); if (!no) e.no = 'Enter the account number.'; else if (!/^\d{10,17}$/.test(no)) e.no = 'Use 10 to 17 digits, numbers only.'; if (!(f.branch || '').trim()) e.branch = 'Enter the branch.'; if (!num(f.amt) && String(f.amt || '').trim() === '') e.amt = 'Enter the opening balance (0 is fine).'; return e; }
var TYPE_L = { current: 'Current', savings: 'Savings', snd: 'SND' };
var CHIPS = [['all', 'All'], ['current', 'Current'], ['savings', 'Savings'], ['snd', 'SND']];
var HEADS = [['Account'], ['Branch'], ['Ledger'], ['Balance', 'right'], ['Reconciled to']];
function CELLS(r, entries) { return [[r.id, r.st === 'snd' ? 'SND' : r.st.charAt(0).toUpperCase() + r.st.slice(1)], [r.branch], [r.code ? String(r.code) : 'new'], [tk2(balOf(r, entries)), r.led ? 'live · ledger' : 'opening balance'], [r.rec]]; }
function JSUB(r) { return r.led ? 'Opening balance and the latest money posted to this account' : 'Opening balance posted when the account was added'; }
function NEWROW(f, n) { var l4 = f.no.replace(/\s/g, '').slice(-4); return { id: f.bank + ' ··' + l4, st: f.type, code: 1022 + n, branch: f.branch, rec: 'Not yet', f: assign(assign({}, f), { code: 1022 + n }) }; }
function SAVED(r) { return r.id + ' added as ledger account ' + r.code + '. Opening balance posted.'; }
function HEADLINE(all, entries) { return all.length + ' bank accounts · ' + tk2(all.reduce(function (a, r) { return a + balOf(r, entries); }, 0)); }
function TILES(all, entries) {
  var m0 = new Date(); m0.setDate(1); m0.setHours(0, 0, 0, 0);
  var bank = entries.filter(function (e) { var a = accountBy(e.account); return a && a.type === 'Bank' && e.at >= m0.getTime(); });
  var inn = bank.filter(function (e) { return e.amount > 0; }).reduce(function (a, e) { return a + e.amount; }, 0);
  var out = bank.filter(function (e) { return e.amount < 0; }).reduce(function (a, e) { return a - e.amount; }, 0);
  return [{ l: 'BRAC Bank current', v: tk2(balanceOf('brac', entries)), s: 'ledger 1020 · live', c: '#60a5fa' }, { l: 'Dutch-Bangla savings', v: tk2(balanceOf('dbbl', entries)), s: 'ledger 1021 · live', c: '#34d399' }, { l: 'Unreconciled', v: '4 days', s: 'BRAC since 25 Sep', c: '#fbbf24' }, { l: 'This month in', v: tk2(inn), s: bank.length + ' ledger entries · ' + tk2(out) + ' out', c: '#a78bfa' }];
}

class Component extends DCLogic {
  componentDidMount() { var t = getQuery('type'), q = getQuery('q'), p = { ledger: getEntries() }; if (CHIPS.some(function (c) { return c[0] === t; })) p.st = t; if (q) p.q = q; if (Object.keys(p).length) this.setState(p); }
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var f = assign(assign({}, DEF), s.f || {});
    function setF(k, x) { var n = assign({}, s.f || {}); n[k] = x; self.setState({ f: n }); }
    var seen = {}; var all = (s.added || []).concat(ROWS).filter(function (r) { if (seen[r.id]) return false; seen[r.id] = 1; return true; });
    var st = s.st || 'all', q = (s.q || '').toLowerCase();
    var shown = all.filter(function (r) { return (st === 'all' || r.st === st) && (!q || JSON.stringify(r).toLowerCase().indexOf(q) >= 0); });
    var recs = s.recs || {}; all = all.map(function (r) { return recs[r.id] ? assign(assign({}, r), { rec: recs[r.id] }) : r; });
    shown = shown.map(function (r) { return recs[r.id] ? assign(assign({}, r), { rec: recs[r.id] }) : r; });
    // The detail panel follows the list: if the filter hides the chosen account, the first visible one is shown.
    var selId = s.sel && shown.some(function (r) { return r.id === s.sel; }) ? s.sel : (shown[0] ? shown[0].id : (s.sel || (all[0] && all[0].id))), selRow = all.filter(function (r) { return r.id === selId; })[0];
    var errs = s.tried ? ERRS(f) : {};
    var lv = POSTS ? linesView(RULE(f)) : { ok: true, rows: [] };
    var err = CHECK(f);
    var entries = s.ledger || [];
    var recent = selRow && selRow.led ? entries.filter(function (e) { return e.account === selRow.led; }).slice(0, 8) : [];
    var v = {
      headline: HEADLINE(all, entries), tiles: TILES(all, entries),
      hasLive: !!(selRow && selRow.led), liveHref: '/money-book?account=' + (selRow && selRow.led ? selRow.led : ''),
      recent: recent.map(function (e) { return { when: __formatDate(e.at) + ', ' + __formatTime(e.at), what: (KIND_L[e.kind] || 'Entry') + (e.party ? ' · ' + e.party : ''), ref: e.ref || '', amt: (e.amount > 0 ? '+' : '') + tk2(e.amount), col: e.amount > 0 ? 'var(--text-success)' : 'var(--text-danger)' }; }),
      noRecent: !!(selRow && selRow.led) && recent.length === 0,
      chips: CHIPS.map(function (c) { var on = c[0] === st; return { label: c[1], on: on, n: c[0] === 'all' ? all.length : all.filter(function (r) { return r.st === c[0]; }).length, cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ st: c[0], sel: null }); setQuery('type', c[0] === 'all' ? '' : c[0]); } }; }),
      q: s.q || '', onQ: function (e) { var x = val(e); self.setState({ q: x }); setQuery('q', String(x || '').trim()); },
      clearFilters: function () { self.setState({ q: '', st: 'all' }); setQuery('q', ''); setQuery('type', ''); },
      heads: HEADS.map(function (h) { return { l: h[0], al: h[1] || 'left' }; }),
      rows: shown.map(function (r) { return { id: r.id, on: r.id === selId, bg: r.id === selId ? 'rgba(0,48,135,.04)' : 'transparent', btn: POSTS ? 'Journal' : 'Details', pick: function () { self.setState({ sel: r.id }); }, open: function () { self.setState({ sel: r.id }); focusField('bk-detail-h'); },
        cells: CELLS(r, entries).map(function (c, i) { return { v: c[0], sub: c[1] || '', hasSub: !!c[1], al: (HEADS[i] && HEADS[i][1]) || 'left', fw: i === 0 ? 600 : 400, col: c[2] || (i === 0 ? '#0f172a' : '#334155') }; }) }; }),
      empty: shown.length === 0,
      det: selRow ? [['Type', TYPE_L[selRow.st] || selRow.st], ['Branch', selRow.branch], ['Ledger account', selRow.code ? String(selRow.code) : 'new'], ['Balance', tk2(balOf(selRow, entries))], ['Reconciled to', selRow.rec]].map(function (d) { return { l: d[0], v: d[1] }; }) : [],
      recDone: !!selRow && selRow.rec === '29 Sep',
      reconcile: function () { if (!selRow) return; var prev = recs[selRow.id], id = selRow.id; var n = assign({}, recs); n[id] = '29 Sep'; self.setState({ recs: n });
        __toast(id + ' marked reconciled to 29 Sep.', { undo: function () { self.setState(function (p) { var m = assign({}, (p && p.recs) || {}); if (prev) m[id] = prev; else delete m[id]; return { recs: m }; }); } }); },
      hasJ: !!selRow, jTitle: selRow ? (POSTS ? 'Journal · ' + selRow.id : selRow.id) : '', jSub: selRow ? JSUB(selRow) : '',
      j: selRow && POSTS ? (num(selRow.f.amt) ? linesView(RULE(selRow.f)) : assign(linesView(RULE(selRow.f)), { okL: 'No opening balance', okBg: '#eef2f6', okFg: '#475569' })) : { rows: [], td: '', tc: '', okL: '', okBg: '', okFg: '' },
      fields: FIELDS.map(function (d) { var x = f[d.k];
        var o = { k: d.k, id: 'bk-' + d.k, lid: 'bk-' + d.k + '-l', eid: 'bk-' + d.k + '-e', err: errs[d.k] || '', bad: !!errs[d.k], req: d.k === 'no' || d.k === 'branch' || d.k === 'amt', l: d.l, isChips: d.t === 'chips', isMoney: d.t === 'money', isText: d.t === 'text' || d.t === 'date', itype: d.t === 'date' ? 'date' : 'text', ph: d.ph || '', v: x, hint: d.hint ? d.hint(f) : '', hasHint: !!(d.hint && d.hint(f)), hc: d.hintC ? d.hintC(f) : '#64748b',
          onC: function (e) { var t = String(val(e) || ''); if (d.t === 'money') t = t.replace(/[^\d.]/g, ''); setF(d.k, t); } };
        if (d.t === 'chips') o.opts = (typeof d.o === 'function' ? d.o(f) : d.o).map(function (op) { var on = String(op[0]) === String(x); return { l: op[1], on: on, cls: on ? 'chip on fch' : 'chip fch', pick: function () { setF(d.k, op[0]); } }; });
        return o; }),
      posts: POSTS, noPost: !POSTS, pv: lv, formBd: s.pulse ? '#003087' : 'transparent',
      focusForm: function () { self.setState({ pulse: true }); focusField('bk-form', true); },
      save: function (e) { if (e && e.preventDefault) e.preventDefault();
        var es = ERRS(f), first = es.no ? 'no' : es.branch ? 'branch' : es.amt ? 'amt' : '';
        if (first) { self.setState({ tried: true }); focusField('bk-' + first); toast(self, es[first], true); return; }
        if (POSTS && !lv.ok) { self.setState({ tried: true }); focusField('bk-amt'); toast(self, 'The opening balance must be more than 0 for the entry to balance.', true); return; }
        var n = all.length + 1; var row = NEWROW(f, n); self.setState({ added: [row].concat(s.added || []), sel: row.id, f: {}, st: 'all', pulse: false, tried: false }); setQuery('type', ''); toast(self, SAVED(row)); }
    };
    return assign(v, { hasMsg: false, msg: '' });
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
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

.tc{background:#fff;border:1px solid #e7ebf2;border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04),0 12px 32px -20px rgba(15,23,42,.18)}
.ey{font-size:var(--text-xs);line-height:17px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.ey-d{color:rgba(203,216,238,.7)}
.tn{font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1;letter-spacing:0}
.dl{display:inline-flex;align-items:center;gap:3px;height:22px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);font-variant-numeric:tabular-nums}
.hero{position:relative;overflow:hidden;border-radius:var(--radius-xl);background:#0b1733;color:#fff;padding:24px 26px;--accent-text:#7fcff0;--text-success:#6ee7b7;--text-warning:#fcd34d;--text-danger:#fda4af;--text-info:#7dd3fc}
.hero::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:32px 32px;pointer-events:none}
.hero>*{position:relative}
.ht{border-radius:var(--radius-xl);background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.09);padding:14px 16px;display:flex;flex-direction:column;gap:6px;min-width:0}
.dseg{display:inline-flex;padding:3px;border-radius:var(--radius-full);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1)}
.dseg button{height:32px;padding:0 14px;border:0;border-radius:var(--radius-full);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer;transition:transform 160ms cubic-bezier(.23,1,.32,1),background-color 200ms ease}
.lseg{display:inline-flex;padding:3px;border-radius:var(--radius-xl);background:#f1f4f9;border:1px solid #e7ebf2}
.lseg button{height:32px;padding:0 13px;border:0;border-radius:var(--radius-lg);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer;transition:transform 160ms cubic-bezier(.23,1,.32,1),background-color 200ms ease,box-shadow 200ms ease}
button:active,.btn:active,.abtn:active{transform:scale(.97)}
.btn,.abtn{transition:transform 160ms cubic-bezier(.23,1,.32,1),background-color 200ms ease}
.st>*{animation:taUp 420ms cubic-bezier(.23,1,.32,1) both}
.st>*:nth-child(2){animation-delay:40ms}.st>*:nth-child(3){animation-delay:80ms}.st>*:nth-child(4){animation-delay:120ms}.st>*:nth-child(5){animation-delay:160ms}.st>*:nth-child(6){animation-delay:200ms}.st>*:nth-child(7){animation-delay:240ms}.st>*:nth-child(8){animation-delay:280ms}
@keyframes taUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.gr{transform-origin:left center;animation:taGrow 700ms cubic-bezier(.23,1,.32,1) both}
@keyframes taGrow{from{transform:scaleX(.35);opacity:0}to{transform:none;opacity:1}}
.draw{stroke-dasharray:1600;stroke-dashoffset:0;animation:taDraw 1100ms cubic-bezier(.77,0,.175,1) both}
@keyframes taDraw{from{stroke-dashoffset:1600}to{stroke-dashoffset:0}}
.fadein{animation:taFade 600ms ease both 200ms}@keyframes taFade{from{opacity:0}to{opacity:1}}
.tt{position:relative}
.tt .tip{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translate(-50%,4px) scale(.97);transform-origin:bottom center;opacity:0;pointer-events:none;transition:opacity 125ms ease-out,transform 125ms ease-out;background:#0b1733;color:#fff;border-radius:var(--radius-lg);padding:8px 10px;font-size:var(--text-xs);white-space:nowrap;box-shadow:0 10px 24px -8px rgba(15,23,42,.45);z-index:5}
.col{position:relative;flex:1;height:100%;border-radius:var(--radius-md);transition:background-color 150ms ease}
.col .tip{bottom:auto;top:6px}
.col .cl{position:absolute;top:0;bottom:0;left:50%;width:1px;background:rgba(15,23,42,.18);opacity:0;transition:opacity 125ms ease}
@media (hover:hover) and (pointer:fine){.tt:hover .tip,.col:hover .tip{opacity:1;transform:translate(-50%,0) scale(1)}.col:hover .cl{opacity:1}.row:hover{background:#f7f9fd}.tc.lift{transition:box-shadow 200ms ease,transform 200ms cubic-bezier(.23,1,.32,1)}.tc.lift:hover{box-shadow:0 1px 2px rgba(15,23,42,.05),0 18px 40px -20px rgba(15,23,42,.3)}}
.tb{width:100%;border-collapse:separate;border-spacing:0}
.tb th{font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted);text-align:left;padding:12px 16px;border-bottom:1px solid #eef1f6;background:#fbfcfe;white-space:nowrap}
.tb td{padding:13px 16px;border-bottom:1px solid #f1f4f8;font-size:var(--text-sm);vertical-align:middle}
.tb tr:last-child td{border-bottom:0}
.tb .r{text-align:right}
@media (prefers-reduced-motion:reduce){.st>*,.gr,.draw,.fadein{animation:none}}

.pgc>*{flex-shrink:0}.tb th{white-space:normal}.stp2{flex-shrink:0}.pgc>.fill{flex-shrink:1;min-height:0}
.sec{display:flex;flex-direction:column;gap:14px;padding:20px 22px}
.h2{margin:0;font-size:var(--text-base);line-height:22px;font-weight:var(--weight-semibold);color:#0f172a;letter-spacing:0}
.sub{margin:2px 0 0;font-size:var(--text-xs-plus);line-height:18px;color:var(--text-muted)}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.chk{display:flex;align-items:center;gap:14px;padding:12px 16px;border-bottom:1px solid #f1f4f8}
.chk:last-child{border-bottom:0}
.pill{display:inline-flex;align-items:center;height:24px;padding:0 9px;border-radius:var(--radius-full);background:#f1f4f9;font-size:var(--text-xs);color:#334155;white-space:nowrap}
.amt{height:36px;padding:0 16px;border-radius:var(--radius-lg);border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:#1e293b;cursor:pointer;font-variant-numeric:tabular-nums}
.amt.on{border-color:#003087;background:rgba(0,48,135,.06);color:#003087}
.amt:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.stp2{display:inline-flex;align-items:center;border:1px solid #cbd5e1;border-radius:var(--radius-lg);overflow:hidden;height:40px}
.stp2 button{width:38px;height:100%;border:0;background:#f8fafc;font:inherit;font-size:var(--text-base);cursor:pointer;color:#334155}
.stp2 span{min-width:64px;text-align:center;font-size:var(--text-sm);font-weight:var(--weight-medium);font-variant-numeric:tabular-nums}
.sel{height:44px;padding:0 12px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-sm);color:#1e293b;width:100%}
.msgb{max-width:78%;padding:10px 14px;border-radius:var(--radius-xl);font-size:var(--text-sm);line-height:20px}
.code{margin:0;padding:12px 14px;border-radius:var(--radius-lg);background:#0b1733;color:#cbd8ee;font-size:var(--text-xs);line-height:18px;white-space:pre-wrap;--text-muted:#94a3b8}
.lrow{display:flex;align-items:center;gap:12px;width:100%;padding:12px 16px;border:0;border-bottom:1px solid #f1f4f8;background:transparent;font:inherit;text-align:left;cursor:pointer}
.lrow:hover{background:#f7f9fd}.lrow.on{background:rgba(0,48,135,.05)}
.lrow:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:-3px}
.tb td,.tb th{padding-left:12px;padding-right:12px}.tb td{white-space:normal}.jt td{padding:9px 14px;font-size:var(--text-xs-plus);border-bottom:1px solid #f1f4f8}.jt th{padding:9px 14px;font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted);text-align:left;border-bottom:1px solid #eef1f6;background:#fbfcfe}.jt{width:100%;border-collapse:collapse}.jt .r{text-align:right}.fch{height:32px;font-size:var(--text-xs-plus);padding:0 11px}
.bk-rowbtn{display:block;border:0;background:transparent;padding:0;font:inherit;font-weight:var(--weight-semibold);color:#0f172a;text-align:left;cursor:pointer;border-radius:var(--radius-sm)}
.bk-rowbtn:hover{color:#003087;text-decoration:underline}
.bk-rowbtn:focus-visible,#bk-detail-h:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.bk-det{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin:0;padding:4px 18px 14px}
.bk-det dt{font-size:var(--text-xs);color:var(--text-muted)}
.bk-det dd{margin:2px 0 0;font-size:var(--text-sm);font-weight:var(--weight-medium);color:#0f172a}
.btn[disabled]{opacity:.6;cursor:default}`;

// ---- markup ----

export default class BankAccountsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="BankAccounts">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="acc-bankaccts" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Accounts" page="Bank accounts" placeholder="Search" />
            <div className="pgc gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "22px" }}>
              <section className="hero st">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <div className="ey ey-d">Accounts · Bank accounts</div>
                    <h1 style={{ margin: "6px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)" }}>{v.headline}</h1>
                    <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "20px", color: "rgba(226,232,240,.78)", maxWidth: "680px" }}>Every bank account has its own ledger account, so deposits, transfers and payments post to it directly.</p>
                  </div>
                  <__Link href="/money-book" className="btn sm" style={{ background: "rgba(255,255,255,.1)", color: "#fff", height: "36px", flexShrink: "0" }}><__Icon name="book-open" width="16" height="16" aria-hidden="true" />Money book</__Link>
                  <button type="button" className="btn sm" onClick={v.focusForm} style={{ background: "#fff", color: "#0b1733", height: "36px", flexShrink: "0" }}>Add account</button>
                </div>
                <div className="st gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px", marginTop: "20px" }}>
                  {__list(v.tiles).map((ht, $index) => (<React.Fragment key={$index}>
                      <div className="ht">
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={__sx(`width: 7px; height: 7px; border-radius: var(--radius-full); background: ${ht?.c ?? ""};`)} />
                          <span style={{ fontSize: "var(--text-xs)", color: "rgba(203,216,238,.85)" }}>{ht?.l}</span>
                        </div>
                        <div className="tn" style={{ fontSize: "var(--text-2xl)", lineHeight: "30px", fontWeight: "var(--weight-semibold)", color: "#fff" }}>{ht?.v}</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "rgba(203,216,238,.7)" }}>{ht?.s}</div>
                      </div>
                    </React.Fragment>))}
                </div>
              </section>
              {v.hasMsg ? (<>
                <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-lg); background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: var(--text-sm); font-weight: var(--weight-medium);`)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{v.msg}</span>
                </div>
              </>) : null}
              <div className="gc-split" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 400px", gap: "16px", alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <section className="tc" style={{ overflow: "hidden" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", padding: "14px 16px", borderBottom: "1px solid #eef1f6" }}>
                      <div role="group" aria-label="Account type" style={{ display: "contents" }}>
                        {__list(v.chips).map((ch, $index) => (<React.Fragment key={$index}>
                            <button type="button" className={ch?.cls} aria-pressed={ch?.on} onClick={ch?.pick} style={{ height: "36px" }}>{ch?.label}<span className="pcnt">{ch?.n}</span></button>
                          </React.Fragment>))}
                      </div>
                      <span style={{ flexGrow: "1" }} />
                      <input className="inp" type="search" aria-label="Search bank accounts" placeholder="Search bank accounts" value={v.q} onChange={v.onQ} style={{ maxWidth: "220px", height: "38px" }} />
                    </div>
                    <div className="gc-table-wrap">
                      <table className="tb">
                        <thead>
                          <tr>
                            {__list(v.heads).map((h, $index) => (<React.Fragment key={$index}>
                                <th style={__sx(`text-align: ${h?.al ?? ""};`)}>{h?.l}</th>
                              </React.Fragment>))}
                            <th><span className="gc-sr-only" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>Actions</span></th>
                          </tr>
                        </thead>
                        <tbody>
                          {__list(v.rows).map((r, $index) => (<React.Fragment key={$index}>
                              <tr className="row" style={__sx(`background: ${r?.bg ?? ""};`)}>
                                {__list(r?.cells).map((c, $index) => (<React.Fragment key={$index}>
                                    <td style={__sx(`text-align: ${c?.al ?? ""}; font-weight: ${c?.fw ?? ""}; color: ${c?.col ?? ""};`)}>
                                      {$index === 0 ? (
                                        <button type="button" className="bk-rowbtn" aria-pressed={r?.on} aria-label={`Show details of ${c?.v ?? ""}`} onClick={r?.pick}>{c?.v}</button>
                                      ) : (<div>{c?.v}</div>)}
                                      {c?.hasSub ? (<>
                                        <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>{c?.sub}</div>
                                      </>) : null}
                                    </td>
                                  </React.Fragment>))}
                                <td className="r">
                                  <button type="button" className="abtn" aria-label={`${r?.btn ?? ""} of ${r?.id ?? ""}`} onClick={r?.open}>{r?.btn}</button>
                                </td>
                              </tr>
                            </React.Fragment>))}
                        </tbody>
                      </table>
                    </div>
                    {v.empty ? (<>
                      <__EmptyState title="No bank accounts match" body="Clear the search or pick another account type." actionLabel="Clear filters" onAction={v.clearFilters} />
                    </>) : null}
                  </section>
                  {v.hasJ ? (<>
                    <section className="tc" style={{ overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px 18px 10px" }}>
                        <div style={{ flexGrow: "1" }}>
                          <h2 className="h2" id="bk-detail-h" tabIndex={-1} style={{ outline: "none", scrollMarginTop: "96px" }}>{v.jTitle}</h2>
                          <p className="sub">{v.jSub}</p>
                        </div>
                        <span className="badge" style={__sx(`background: ${v.j?.okBg ?? ""}; color: ${v.j?.okFg ?? ""};`)}>{v.j?.okL}</span>
                      </div>
                      <dl className="bk-det">
                        {__list(v.det).map((d, i) => (
                          <div key={i}>
                            <dt>{d.l}</dt>
                            <dd className="tn">{d.v}</dd>
                          </div>
                        ))}
                      </dl>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "0 18px 14px" }}>
                        <button type="button" className="btn soft sm" onClick={v.reconcile} disabled={v.recDone}><__Icon name="check-check" width="16" height="16" aria-hidden="true" />{v.recDone ? "Reconciled to 29 Sep" : "Mark reconciled to today"}</button>
                        <__Link href="/journals" className="btn line sm"><__Icon name="book-open" width="16" height="16" aria-hidden="true" />Open journals</__Link>
                        {v.hasLive ? (<__Link href={v.liveHref} className="btn line sm"><__Icon name="list" width="16" height="16" aria-hidden="true" />All entries</__Link>) : null}
                      </div>
                      {v.hasLive ? (<>
                        <div style={{ padding: "0 18px 6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Latest money in and out</div>
                        {v.noRecent ? (<p style={{ margin: "0", padding: "0 18px 14px", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Nothing posted to this account in this browser yet. Sales, invoice payments and refunds paid by bank or card show here.</p>) : (
                          <div className="gc-table-wrap" style={{ marginBottom: "10px" }}>
                            <table className="jt">
                              <thead><tr><th>When</th><th>What</th><th className="r">Amount</th></tr></thead>
                              <tbody>
                                {__list(v.recent).map((e, $index) => (
                                  <tr key={$index}>
                                    <td className="tn" style={{ whiteSpace: "nowrap" }}>{e.when}</td>
                                    <td>{e.what}{e.ref ? (<span className="mono" style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{e.ref}</span>) : null}</td>
                                    <td className="r tn" style={{ fontWeight: "var(--weight-semibold)", color: e.col, whiteSpace: "nowrap" }}>{e.amt}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>) : null}
                      <div className="gc-table-wrap">
                        <table className="jt">
                          <thead>
                            <tr>
                              <th>Account</th>
                              <th className="r">Debit</th>
                              <th className="r">Credit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {__list(v.j?.rows).map((l, $index) => (<React.Fragment key={$index}>
                                <tr>
                                  <td>
                                    <span className="mono" style={{ color: "var(--text-muted)", marginRight: "8px" }}>{l?.code}</span>
                                    <span style={{ color: "#0f172a" }}>{l?.n}</span>
                                  </td>
                                  <td className="r tn">{l?.d}</td>
                                  <td className="r tn">{l?.c}</td>
                                </tr>
                              </React.Fragment>))}
                            <tr>
                              <td style={{ fontWeight: "var(--weight-medium)" }}>Total</td>
                              <td className="r tn" style={{ fontWeight: "var(--weight-semibold)" }}>{v.j?.td}</td>
                              <td className="r tn" style={{ fontWeight: "var(--weight-semibold)" }}>{v.j?.tc}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </>) : null}
                </div>
                <aside style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <form id="bk-form" className="tc sec" noValidate onSubmit={v.save} aria-labelledby="bk-form-h" style={__sx(`border: 1.5px solid ${v.formBd ?? ""}; scroll-margin-top: 96px;`)}>
                    <div>
                      <h2 className="h2" id="bk-form-h">Add a bank account</h2>
                      <p className="sub">The opening balance is posted once, dated the day you start.</p>
                    </div>
                    {__list(v.fields).map((fd, $index) => (<React.Fragment key={$index}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                          {fd?.isChips ? (<span className="lbl" id={fd?.lid}>{fd?.l}</span>) : (<label className="lbl" htmlFor={fd?.id}>{fd?.l}{fd?.req ? (<span aria-hidden="true" style={{ color: "var(--text-danger)" }}> *</span>) : null}</label>)}
                          {fd?.isChips ? (<>
                            <div role="group" aria-labelledby={fd?.lid} style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                              {__list(fd?.opts).map((o, $index) => (<React.Fragment key={$index}>
                                  <button type="button" className={o?.cls} aria-pressed={o?.on} onClick={o?.pick}>{o?.l}</button>
                                </React.Fragment>))}
                            </div>
                          </>) : null}
                          {fd?.isMoney ? (<>
                            <div style={{ position: "relative" }}>
                              <span aria-hidden="true" style={{ position: "absolute", left: "14px", top: "12px", color: "var(--text-muted)" }}>৳</span>
                              <input id={fd?.id} className="inp tn" inputMode="decimal" value={fd?.v} onChange={fd?.onC} aria-required={fd?.req} aria-invalid={fd?.bad} aria-describedby={fd?.bad ? fd?.eid : undefined} style={__sx(`padding-left: 32px;${fd?.bad ? " border-color: var(--text-danger);" : ""}`)} />
                            </div>
                          </>) : null}
                          {fd?.isText ? (<>
                            <input id={fd?.id} className="inp" type={fd?.itype} placeholder={fd?.ph} value={fd?.v} onChange={fd?.onC} aria-required={fd?.req} aria-invalid={fd?.bad} aria-describedby={fd?.bad ? fd?.eid : undefined} style={fd?.bad ? { borderColor: "var(--text-danger)" } : undefined} />
                          </>) : null}
                          {fd?.bad ? (<span id={fd?.eid} className="gc-help gc-help--error">{fd?.err}</span>) : null}
                          {fd?.hasHint ? (<>
                            <span style={__sx(`font-size: var(--text-xs); color: ${fd?.hc ?? ""};`)}>{fd?.hint}</span>
                          </>) : null}
                        </div>
                      </React.Fragment>))}
                    {v.posts ? (<>
                      <div style={{ border: "1px solid #eef1f6", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#fbfcfe", borderBottom: "1px solid #eef1f6" }}>
                          <span style={{ flexGrow: "1", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Posts to the books</span>
                          <span className="badge" style={__sx(`background: ${v.pv?.okBg ?? ""}; color: ${v.pv?.okFg ?? ""};`)}>{v.pv?.okL}</span>
                        </div>
                        <div className="gc-table-wrap">
                          <table className="jt">
                            <tbody>
                              {__list(v.pv?.rows).map((l, $index) => (<React.Fragment key={$index}>
                                  <tr>
                                    <td><span className="mono" style={{ color: "var(--text-muted)", marginRight: "6px" }}>{l?.code}</span>{l?.n}</td>
                                    <td className="r tn" style={{ width: "96px" }}>{l?.d}</td>
                                    <td className="r tn" style={{ width: "96px" }}>{l?.c}</td>
                                  </tr>
                                </React.Fragment>))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>) : null}
                    {v.noPost ? (<>
                      <div style={{ padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "#f7f9fc", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Saved as a record. Money moves are posted from the pages that use it.</div>
                    </>) : null}
                    <button type="submit" className="btn solid">Add account</button>
                  </form>
                </aside>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
