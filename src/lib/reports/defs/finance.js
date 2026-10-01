// Reports · Finance group. See ../catalogue.js for the definition contract.
// This file starts with the example report other groups follow.
// Cash and P&L figures follow the same rules as Accounts › Reports (screens/accounts/AccountReports.jsx):
// accountFlows() is its cash-flow rule and cashPnl() its cash-basis profit & loss, copied here.

import { getEntries, balanceOf, ACCOUNTS, accountBy, KIND_LABEL } from '../../ledger';
import { homeOf, CHANNELS } from '../../categories';
import { profitByChannel } from '../../profit';
import * as salesBook from '../../salesBook';
import { getItems, costsOf, partnerBy, clockNow } from '../../settlements';
import { getLiabilities, leftOf, LIAB_TYPES } from '../../liabilities';
import { getInvoices } from '../../invoices';
import { getBills, billLeft, getSuppliers, findSupplier } from '../../supplierBills';
import { getCatalog, getMoves, stockAt, unitValue } from '../../stock';
import { getHolds } from '../../stockHolds';
import { getTransfers } from '../../transfers';
import { allProducts } from '../../products';
import { unitCost } from '../../purchaseOrders';
import { loadVat, vatRateFor } from '../../vat';
import { getMembers, pointsLiability, walletLiability } from '../../loyalty';
import { getShifts } from '../../posStore';
import { loadSnapshot, loanLeft } from '../../hr';
import { bucketsOf, sum, groupBy, dayKey, startOfDay, addDays, monthStart } from '../period';

const EXPENSE_KINDS = ['expense', 'salary', 'commission', 'affiliate payout', 'promotion', 'paid out'];

const expensesByCategory = {
  id: 'expenses-by-category',
  group: 'finance',
  title: 'Expenses by category',
  description: 'Where the money went: each expense category, which channel it belongs to, and how it moved over the period.',
  icon: 'receipt',
  keywords: 'costs spending rent salary marketing utilities',
  filters: ['account'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const out = getEntries().filter((e) => EXPENSE_KINDS.includes(e.kind) && e.amount < 0 && e.at >= from && e.at < to && (!filters.account || e.account === filters.account));
    const labelOf = (e) => e.cat || (e.kind === 'paid out' ? 'Paid out at counters' : e.kind === 'salary' ? 'Salary' : 'Other');
    const total = sum(out, (e) => -e.amount);
    const groups = [...groupBy(out, labelOf)].map(([cat, list]) => ({ cat, amount: sum(list, (e) => -e.amount), count: list.length, home: homeOf(cat) }))
      .sort((a, b) => b.amount - a.amount);
    const { buckets, keyOf } = bucketsOf(from, to);
    const top = groups.slice(0, 5).map((g) => g.cat);
    const tones = ['primary', 'success', 'warning', 'info', 'danger', 'slate'];
    const series = [...top, 'Everything else'].map((name, i) => ({ name, tone: tones[i], values: buckets.map(() => 0) }));
    out.forEach((e) => {
      const i = buckets.findIndex((b) => b.key === keyOf(e.at));
      if (i < 0) return;
      const s = series.find((x) => x.name === labelOf(e)) || series[series.length - 1];
      s.values[i] += -e.amount;
    });
    return {
      kpis: [
        { key: 'total', label: 'Spent', value: total, format: 'money', good: 'down' },
        { key: 'count', label: 'Payments', value: out.length, format: 'int', good: 'none' },
        { key: 'top', label: 'Biggest category', value: groups[0] ? groups[0].cat : '—', format: 'text', sub: groups[0] ? `${Math.round((groups[0].amount / (total || 1)) * 100)}% of spend` : '' },
        { key: 'shared', label: 'Shared by the whole shop', value: sum(groups.filter((g) => g.home === 'Shared'), (g) => g.amount), format: 'money', good: 'down' },
      ],
      chart: { type: 'stacked', labels: buckets.map((b) => b.label), series: series.filter((s) => s.values.some(Boolean)), format: 'money0' },
      table: {
        columns: [
          { key: 'cat', label: 'Category' },
          { key: 'home', label: 'Counts under' },
          { key: 'count', label: 'Payments', format: 'int', align: 'right', total: 'sum' },
          { key: 'amount', label: 'Amount', format: 'money', align: 'right', total: 'sum' },
          { key: 'share', label: 'Share', format: 'pct', align: 'right' },
        ],
        rows: groups.map((g) => ({ ...g, share: total ? g.amount / total : 0, _href: '/expenses-bills' })),
        sort: { key: 'amount', dir: 'desc' },
      },
      notes: ['Salaries, commission, affiliates and promotions show here when they were paid. Sales & profit counts them when they were owed.'],
    };
  },
};

// ---- shared helpers -----------------------------------------------------------------------------
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const MON = (t) => new Date(t).toLocaleString('en', { month: 'short' });
const TYPES = [['Cash', 'Cash'], ['Bank', 'Bank'], ['Mobile', 'Mobile wallets'], ['Holding', 'With partners']];
const TYPE_LABEL = Object.fromEntries(TYPES);
const OWN_TYPES = ['Cash', 'Bank', 'Mobile'];
/** Moves between the shop's own accounts (left out of money in / out when all accounts are added up). */
const INTERNAL = ['transfer', 'cash pickup', 'cash in'];
const typeOf = (id) => (accountBy(id) || {}).type || '';
const isOwn = (id) => OWN_TYPES.includes(typeOf(id));
const kindLabel = (k) => KIND_LABEL[k] || (k ? k.charAt(0).toUpperCase() + k.slice(1) : 'Other');
const ACCOUNT_PAGE = { Cash: '/cash-book', Bank: '/bank-accounts', Mobile: '/mfs-accounts', Holding: '/settlements' };
/** The end of a period, not past today (days still to come have no money yet). */
const endOf = (to, now) => Math.min(to, addDays(startOfDay(now || clockNow()), 1));
const digits = (p) => String(p || '').replace(/[^0-9]/g, '').replace(/^88/, '');
const safe = (fn, fb) => { try { return fn(); } catch { return fb; } };

/** Each account from opening to closing over [from, to) — the Cash flow rule of Accounts › Reports. */
function accountFlows(entries, from, to) {
  const by = groupBy(entries, (e) => e.account);
  return ACCOUNTS.map((a) => {
    const mine = by.get(a.id) || [];
    const opening = r2(a.opening + mine.filter((e) => e.at < from).reduce((s, e) => s + e.amount, 0));
    const inPeriod = mine.filter((e) => e.at >= from && e.at < to);
    const inn = r2(inPeriod.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0));
    const out = r2(inPeriod.filter((e) => e.amount < 0).reduce((s, e) => s + e.amount, 0));
    return { ...a, opening, inn, out, closing: r2(opening + inn + out), moves: inPeriod.length };
  });
}

/** Cash-basis profit & loss for [from, to) — the Profit & loss rule of Accounts › Reports (profitOf). */
const SALE_KINDS = ['sale', 'invoice payment', 'order payment', 'collected'];
const isHolding = (e) => typeOf(e.account) === 'Holding';
function cashPnl(entries, from, to) {
  const list = entries.filter((e) => e.at >= from && e.at < to);
  const total = (f) => r2(list.filter(f).reduce((a, e) => a + e.amount, 0));
  const salesIn = r2(total((e) => SALE_KINDS.includes(e.kind) && e.amount > 0) + total((e) => e.kind === 'refund'));
  const otherIn = total((e) => e.kind === 'income');
  const spent = -total((e) => e.kind === 'expense' || e.kind === 'paid out');
  const stock = -total((e) => e.kind === 'supplier payment');
  const people = -total((e) => ['salary', 'commission', 'affiliate payout', 'promotion'].includes(e.kind));
  const partners = -total((e) => ['partner fee', 'courier charge', 'settlement difference'].includes(e.kind) && isHolding(e));
  const costs = r2(spent + stock + people + partners);
  return {
    salesIn, otherIn, stock, costs, profit: r2(salesIn + otherIn - costs),
    ownerOut: -total((e) => e.kind === 'owner withdraw'), ownerIn: total((e) => e.kind === 'investment'),
  };
}

/** Item-level sale lines when the sales book has them (salesBook.getSaleLines), else null. */
function saleLines(from, to) {
  if (typeof salesBook.getSaleLines !== 'function') return null;
  const list = safe(() => salesBook.getSaleLines(), null);
  if (!Array.isArray(list)) return null;
  return list.filter((l) => l && l.at >= from && l.at < to);
}

/** Buying price of one catalogue item: the product's cost, else the purchase cost, else its shelf value. */
function costIndex() {
  const idx = {};
  safe(() => allProducts(), []).forEach((p) => { if (p && p.cost) { if (p.sku) idx[p.sku] = p.cost; if (p.name) idx[p.name] = p.cost; } });
  return (p) => idx[p.sku] || idx[p.name] || safe(() => unitCost(p.name), 0) || unitValue(p);
}
/** Stock on hand everywhere (not the damaged bay), valued at buying price. */
function stockValue() {
  const holds = safe(() => getHolds(), []), moves = safe(() => getMoves(), []);
  const transfers = typeof window === 'undefined' ? null : safe(() => getTransfers(), []);
  const costOf = costIndex();
  let value = 0, pieces = 0;
  safe(() => getCatalog(), []).forEach((p) => {
    const on = Math.max(0, stockAt(p.sku, '', holds, moves, transfers).onHand);
    if (!on) return;
    pieces += on;
    value += on * (Number(costOf(p)) || 0);
  });
  return { value: r2(value), pieces };
}

// ---- daily closing --------------------------------------------------------------------------------
const dailyClosing = {
  id: 'daily-closing',
  group: 'finance',
  title: 'Daily closing (cash)',
  description: 'Each day’s opening, money in, money out and closing for cash, bank and mobile wallets, with drawer over and short.',
  icon: 'calendar-check',
  keywords: 'cash closing day end opening balance drawer over short safe bank bkash nagad',
  filters: ['account'],
  defaultPeriod: 'lastweek',
  compute({ from, to, now, filters }) {
    const f = filters || {};
    const own = ACCOUNTS.filter((a) => a.type !== 'Holding' && (!f.account || a.id === f.account));
    const ids = new Set(own.map((a) => a.id));
    const mine = getEntries().filter((e) => ids.has(e.account));
    const end = endOf(to, now);
    const bal = Object.fromEntries(own.map((a) => [a.id, a.opening]));
    mine.forEach((e) => { if (e.at < from) bal[e.account] += e.amount; });
    const byDay = groupBy(mine.filter((e) => e.at >= from && e.at < end), (e) => dayKey(e.at));
    const shifts = groupBy(safe(() => getShifts(), []).filter((s) => s.closedAt && s.closedAt >= from && s.closedAt < end), (s) => dayKey(s.closedAt));
    const total = () => r2(Object.values(bal).reduce((a, v) => a + v, 0));
    const ofType = (type) => r2(own.filter((a) => a.type === type).reduce((s, a) => s + bal[a.id], 0));
    const openingAll = total();
    const rows = [];
    for (let t = startOfDay(from); t < end; t = addDays(t, 1)) {
      const k = dayKey(t);
      const opening = total();
      let inn = 0, out = 0;
      (byDay.get(k) || []).forEach((e) => {
        bal[e.account] += e.amount;
        if (!f.account && INTERNAL.includes(e.kind)) return;
        if (e.amount > 0) inn += e.amount; else out -= e.amount;
      });
      const sh = shifts.get(k);
      rows.push({
        _key: k, day: t, opening, inn: r2(inn), out: r2(out), closing: total(),
        cash: ofType('Cash'), bank: ofType('Bank'), mobile: ofType('Mobile'),
        over: sh ? sum(sh, (s) => s.diff) : null, _href: '/cash-book',
      });
    }
    const inn = sum(rows, (r) => r.inn), out = sum(rows, (r) => r.out);
    const closing = rows.length ? rows[rows.length - 1].closing : openingAll;
    const shiftList = [...shifts.values()].flat();
    const over = sum(shiftList, (s) => s.diff);
    const { buckets, keyOf } = bucketsOf(from, to);
    const inS = buckets.map(() => 0), outS = buckets.map(() => 0);
    rows.forEach((r) => { const i = buckets.findIndex((b) => b.key === keyOf(r.day)); if (i >= 0) { inS[i] += r.inn; outS[i] += r.out; } });
    const last = rows[rows.length - 1] || {};
    return {
      kpis: [
        { key: 'opening', label: 'Opening', value: openingAll, format: 'money', good: 'none' },
        { key: 'in', label: 'Money in', value: inn, format: 'money', good: 'up' },
        { key: 'out', label: 'Money out', value: out, format: 'money', good: 'down' },
        { key: 'closing', label: 'Closing', value: closing, format: 'money', good: 'up', sub: `${closing - openingAll >= 0 ? 'Up' : 'Down'} ৳${Math.abs(Math.round(closing - openingAll)).toLocaleString('en-IN')}` },
        { key: 'over', label: 'Drawer over / short', value: over, format: 'money', good: 'none', sub: shiftList.length ? `${shiftList.length} shift${shiftList.length === 1 ? '' : 's'} closed` : 'No shifts closed' },
      ],
      chart: { type: 'bar', labels: buckets.map((b) => b.label), series: [{ name: 'Money in', tone: 'success', values: inS }, { name: 'Money out', tone: 'danger', values: outS }], format: 'money0' },
      table: {
        columns: [
          { key: 'day', label: 'Day', format: 'date' },
          { key: 'opening', label: 'Opening', format: 'money', align: 'right' },
          { key: 'inn', label: 'Money in', format: 'money', align: 'right' },
          { key: 'out', label: 'Money out', format: 'money', align: 'right' },
          { key: 'closing', label: 'Closing', format: 'money', align: 'right' },
          { key: 'cash', label: 'Cash', format: 'money', align: 'right' },
          { key: 'bank', label: 'Bank', format: 'money', align: 'right' },
          { key: 'mobile', label: 'Mobile wallets', format: 'money', align: 'right' },
          { key: 'over', label: 'Drawer over / short', format: 'money', align: 'right' },
        ],
        rows,
        totals: rows.length ? { day: 'Period', opening: openingAll, inn, out, closing, cash: last.cash, bank: last.bank, mobile: last.mobile, over } : null,
        sort: { key: 'day', dir: 'desc' },
      },
      notes: [
        f.account ? 'One account: moves to and from your other accounts count as money in and out.' : 'Moves between your own accounts (drawer to safe, safe to bank) are left out of money in and out; they are in each type’s closing.',
        'Over / short is what the counted drawer differed from the expected cash when a POS shift closed that day.',
      ],
    };
  },
};

// ---- cash flow summary ------------------------------------------------------------------------------
const cashFlowSummary = {
  id: 'cash-flow-summary',
  group: 'finance',
  title: 'Cash flow summary',
  description: 'What brought money in and what took it out, by kind of movement, for cash, bank, mobile wallets and partners.',
  icon: 'arrow-left-right',
  keywords: 'cash flow money in out movement kind net change bank bkash',
  filters: ['account'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const f = filters || {};
    const all = getEntries();
    const list = all.filter((e) => e.at >= from && e.at < to && (!f.account || e.account === f.account));
    const rows = [...groupBy(list, (e) => e.kind)].map(([kind, es]) => {
      const row = { _key: kind, kind: kindLabel(kind), internal: INTERNAL.includes(kind) ? 'Yes' : '', count: es.length };
      TYPES.forEach(([t]) => { row[t] = sum(es.filter((e) => typeOf(e.account) === t), (e) => e.amount); });
      row.own = r2(row.Cash + row.Bank + row.Mobile);
      return row;
    }).sort((a, b) => Math.abs(b.own) - Math.abs(a.own) || Math.abs(b.Holding) - Math.abs(a.Holding));
    const flows = accountFlows(all, from, to).filter((a) => !f.account || a.id === f.account);
    const own = flows.filter((a) => OWN_TYPES.includes(a.type));
    const opening = sum(own, (a) => a.opening), closing = sum(own, (a) => a.closing);
    const ext = list.filter((e) => isOwn(e.account) && !INTERNAL.includes(e.kind));
    const inn = sum(ext.filter((e) => e.amount > 0), (e) => e.amount), out = -sum(ext.filter((e) => e.amount < 0), (e) => e.amount);
    const held = flows.filter((a) => a.type === 'Holding');
    const labels = TYPES.map(([, l]) => l);
    return {
      kpis: [
        { key: 'in', label: 'Money in', value: inn, format: 'money', good: 'up', sub: 'Cash, bank and wallets' },
        { key: 'out', label: 'Money out', value: out, format: 'money', good: 'down' },
        { key: 'net', label: 'Net change', value: r2(closing - opening), format: 'money', good: 'up', sub: `৳${Math.round(opening).toLocaleString('en-IN')} → ৳${Math.round(closing).toLocaleString('en-IN')}` },
        { key: 'held', label: 'Change with partners', value: sum(held, (a) => a.closing - a.opening), format: 'money', good: 'none', sub: 'Gateways, card and COD' },
      ],
      chart: {
        type: 'bar', labels, format: 'money0',
        series: [
          { name: 'In', tone: 'success', values: TYPES.map(([t]) => sum(flows.filter((a) => a.type === t), (a) => a.inn)) },
          { name: 'Out', tone: 'danger', values: TYPES.map(([t]) => -sum(flows.filter((a) => a.type === t), (a) => a.out)) },
        ],
      },
      table: {
        columns: [
          { key: 'kind', label: 'Kind of movement' },
          { key: 'count', label: 'Entries', format: 'int', align: 'right', total: 'sum' },
          { key: 'Cash', label: 'Cash', format: 'money', align: 'right', total: 'sum' },
          { key: 'Bank', label: 'Bank', format: 'money', align: 'right', total: 'sum' },
          { key: 'Mobile', label: 'Mobile wallets', format: 'money', align: 'right', total: 'sum' },
          { key: 'own', label: 'Your accounts', format: 'money', align: 'right', total: 'sum' },
          { key: 'Holding', label: 'With partners', format: 'money', align: 'right', total: 'sum' },
          { key: 'internal', label: 'Between own accounts' },
        ],
        rows: rows.map((r) => ({ ...r, _href: '/money-book' })),
        sort: null,
      },
      notes: [
        'Each column is money in minus money out for that kind of movement. Moves between your own accounts add up to nothing across the columns.',
        'Partner columns are money gateways, the card machine and couriers collected for you and have not paid out yet.',
      ],
    };
  },
};

// ---- account balances ---------------------------------------------------------------------------------
const accountBalances = {
  id: 'account-balances',
  group: 'finance',
  title: 'Bank & wallet balances',
  description: 'How much is in every cash box, bank account and mobile wallet now, and what partners still hold for you.',
  icon: 'wallet',
  keywords: 'balance bank wallet cash safe drawer bkash nagad rocket holding partners',
  filters: [],
  snapshot: true,
  compare: false,
  defaultPeriod: 'month',
  compute() {
    const entries = getEntries();
    const by = groupBy(entries, (e) => e.account);
    const rows = ACCOUNTS.map((a) => {
      const mine = by.get(a.id) || [];
      const last = mine.reduce((m, e) => Math.max(m, e.at || 0), 0);
      return { _key: a.id, name: a.name, type: TYPE_LABEL[a.type] || a.type, typeId: a.type, opening: a.opening, moves: mine.length, last: last || null, balance: balanceOf(a.id, entries), _href: ACCOUNT_PAGE[a.type] || '/money-book' };
    }).filter((r) => r.typeId !== 'Holding' || r.balance || r.moves);
    const ofType = (t) => sum(rows.filter((r) => r.typeId === t), (r) => r.balance);
    const ownTotal = r2(ofType('Cash') + ofType('Bank') + ofType('Mobile'));
    return {
      kpis: [
        { key: 'own', label: 'Your money', value: ownTotal, format: 'money', good: 'up', sub: 'Cash, bank and wallets' },
        { key: 'cash', label: 'Cash', value: ofType('Cash'), format: 'money', good: 'none' },
        { key: 'bank', label: 'Bank', value: ofType('Bank'), format: 'money', good: 'none' },
        { key: 'mobile', label: 'Mobile wallets', value: ofType('Mobile'), format: 'money', good: 'none' },
        { key: 'held', label: 'With partners', value: ofType('Holding'), format: 'money', good: 'none', sub: 'To be paid out to you' },
      ],
      chart: { type: 'donut', labels: TYPES.map(([, l]) => l), series: [{ name: 'Balance', values: TYPES.map(([t]) => Math.max(0, ofType(t))) }], format: 'money0' },
      table: {
        columns: [
          { key: 'name', label: 'Account' },
          { key: 'type', label: 'Type' },
          { key: 'opening', label: 'Opening (1 Sep)', format: 'money', align: 'right', total: 'sum' },
          { key: 'moves', label: 'Entries', format: 'int', align: 'right', total: 'sum' },
          { key: 'last', label: 'Last movement', format: 'datetime' },
          { key: 'balance', label: 'Balance now', format: 'money', align: 'right', total: 'sum' },
        ],
        rows,
        sort: { key: 'balance', dir: 'desc' },
      },
      notes: ['Balance is the opening balance plus every entry in the money book. Partner rows are money collected by gateways, the card machine and couriers that has not reached your bank yet.'],
    };
  },
};

// ---- profit by channel --------------------------------------------------------------------------------
const profitByChannelSummary = {
  id: 'profit-by-channel-summary',
  group: 'finance',
  title: 'Profit by channel',
  description: 'Net sales, cost of goods and each channel’s own costs for Online, Retail and Wholesale, then shared costs and net profit.',
  icon: 'chart-pie',
  keywords: 'profit channel online retail wholesale gross margin shared costs net profit accrual',
  filters: [],
  defaultPeriod: 'lastmonth',
  compute({ from, to }) {
    const p = profitByChannel(from, to);
    const rows = CHANNELS.map((ch) => {
      const c = p.channels[ch];
      return { _key: ch, line: ch, net: c.net, cost: c.cost, gross: c.gross, costs: c.costsTotal, profit: c.profit, margin: c.profitMargin, _href: '/sales-profit' };
    });
    rows.push({ _key: 'shared', line: 'Shared costs (whole shop)', net: null, cost: null, gross: null, costs: p.shared.total, profit: -p.shared.total, margin: null, _href: '/sales-profit' });
    if (p.income.total) rows.push({ _key: 'income', line: 'Other income', net: null, cost: null, gross: null, costs: null, profit: p.income.total, margin: null, _href: '/account-reports' });
    const best = CHANNELS.slice().sort((a, b) => p.channels[b].profit - p.channels[a].profit)[0];
    return {
      kpis: [
        { key: 'net', label: 'Net sales', value: p.all.net, format: 'money', good: 'up' },
        { key: 'gross', label: 'Gross profit', value: p.all.gross, format: 'money', good: 'up', sub: `${Math.round((p.all.margin || 0) * 1000) / 10}% of sales` },
        { key: 'profit', label: 'Net profit', value: p.net, format: 'money', good: 'up' },
        { key: 'margin', label: 'Net margin', value: p.netMargin, format: 'pct', good: 'up' },
        { key: 'best', label: 'Best channel', value: p.all.net ? best : '—', format: 'text', sub: p.all.net ? `৳${Math.round(p.channels[best].profit).toLocaleString('en-IN')} profit` : '' },
      ],
      chart: {
        type: 'bar', labels: CHANNELS, format: 'money0',
        series: [
          { name: 'Gross profit', tone: 'primary', values: CHANNELS.map((ch) => p.channels[ch].gross) },
          { name: 'Channel profit', tone: 'success', values: CHANNELS.map((ch) => p.channels[ch].profit) },
        ],
      },
      table: {
        columns: [
          { key: 'line', label: 'Channel' },
          { key: 'net', label: 'Net sales', format: 'money', align: 'right', total: 'sum' },
          { key: 'cost', label: 'Cost of goods', format: 'money', align: 'right', total: 'sum' },
          { key: 'gross', label: 'Gross profit', format: 'money', align: 'right', total: 'sum' },
          { key: 'costs', label: 'Costs', format: 'money', align: 'right', total: 'sum' },
          { key: 'profit', label: 'Profit', format: 'money', align: 'right', total: 'sum' },
          { key: 'margin', label: 'Margin', format: 'pct', align: 'right' },
        ],
        rows,
        totals: { line: 'Net profit', net: p.all.net, cost: p.all.cost, gross: p.all.gross, costs: r2(CHANNELS.reduce((a, ch) => a + p.channels[ch].costsTotal, 0) + p.shared.total), profit: p.net, margin: p.netMargin },
        sort: null,
      },
      notes: [
        'Counted when the sale or cost happened: salaries, commission and promotions count in the month they are owed, partner fees on the day the money was collected.',
        'Same figures as Sales & profit. Days without item detail use each channel’s usual cost share.',
      ],
    };
  },
};

// ---- monthly P&L --------------------------------------------------------------------------------------
const pnlMonthly = {
  id: 'pnl-monthly',
  group: 'finance',
  title: 'Profit & loss by month',
  description: 'Month by month: net sales, cost of goods, gross profit, costs and net profit, with the cash result beside it.',
  icon: 'calendar-range',
  keywords: 'profit loss p&l monthly month over month trend net profit gross cash',
  filters: [],
  defaultPeriod: 'year',
  compute({ from, to }) {
    const entries = getEntries();
    const all = [];
    for (let m = monthStart(from); m < to; m = monthStart(m, 1)) {
      const a = Math.max(m, from), b = Math.min(monthStart(m, 1), to);
      if (b <= a) continue;
      const p = profitByChannel(a, b, { entries });
      const cash = cashPnl(entries, a, b);
      const costs = r2(CHANNELS.reduce((s, ch) => s + p.channels[ch].costsTotal, 0) + p.shared.total);
      all.push({ _key: dayKey(m), at: m, month: `${MON(m)} ${new Date(m).getFullYear()}`, net: p.all.net, cost: p.all.cost, gross: p.all.gross, costs, income: p.income.total, profit: p.net, margin: p.netMargin, cash: cash.profit, _href: '/sales-profit' });
    }
    // leave out the empty months before the first month with anything in it
    const first = all.findIndex((r) => r.net || r.costs || r.income || r.cash);
    const rows = first < 0 ? [] : all.slice(first);
    const net = sum(rows, (r) => r.net), profit = sum(rows, (r) => r.profit);
    const best = rows.length ? rows.reduce((x, y) => (y.profit > x.profit ? y : x)) : null;
    return {
      kpis: [
        { key: 'net', label: 'Net sales', value: net, format: 'money', good: 'up' },
        { key: 'gross', label: 'Gross profit', value: sum(rows, (r) => r.gross), format: 'money', good: 'up' },
        { key: 'profit', label: 'Net profit', value: profit, format: 'money', good: 'up', sub: net ? `${Math.round((profit / net) * 1000) / 10}% of sales` : '' },
        { key: 'cash', label: 'Cash result', value: sum(rows, (r) => r.cash), format: 'money', good: 'up', sub: 'Money in less money out' },
        { key: 'best', label: 'Best month', value: best ? best.month : '—', format: 'text', sub: best ? `৳${Math.round(best.profit).toLocaleString('en-IN')} profit` : '' },
      ],
      chart: {
        type: 'bar', labels: rows.map((r) => MON(r.at)), format: 'money0',
        series: [
          { name: 'Net sales', tone: 'primary', values: rows.map((r) => r.net) },
          { name: 'Gross profit', tone: 'info', values: rows.map((r) => r.gross) },
          { name: 'Net profit', tone: 'success', values: rows.map((r) => r.profit) },
        ],
      },
      table: {
        columns: [
          { key: 'month', label: 'Month' },
          { key: 'net', label: 'Net sales', format: 'money', align: 'right', total: 'sum' },
          { key: 'cost', label: 'Cost of goods', format: 'money', align: 'right', total: 'sum' },
          { key: 'gross', label: 'Gross profit', format: 'money', align: 'right', total: 'sum' },
          { key: 'costs', label: 'Costs', format: 'money', align: 'right', total: 'sum' },
          { key: 'income', label: 'Other income', format: 'money', align: 'right', total: 'sum' },
          { key: 'profit', label: 'Net profit', format: 'money', align: 'right', total: 'sum' },
          { key: 'margin', label: 'Margin', format: 'pct', align: 'right', total: net ? profit / net : null },
          { key: 'cash', label: 'Cash result', format: 'money', align: 'right', total: 'sum' },
        ],
        rows,
        sort: null,
      },
      notes: [
        'Net profit is counted when sales and costs happen (as on Sales & profit). Cash result is money in less money out in the month (as the P&L on Account reports): it counts stock when it is paid for and salaries when they are paid.',
      ],
    };
  },
};

// ---- expenses by channel -------------------------------------------------------------------------------
const HOMES = ['Online', 'Retail', 'Wholesale', 'Shared'];
const expensesByChannel = {
  id: 'expenses-by-channel',
  group: 'finance',
  title: 'Expenses by channel',
  description: 'Each expense category split between Online, Retail, Wholesale and the costs the whole shop shares.',
  icon: 'split',
  keywords: 'expenses channel online retail wholesale shared costs month over month',
  filters: ['account'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const f = filters || {};
    const liabs = safe(() => getLiabilities(), []);
    const out = getEntries().filter((e) => EXPENSE_KINDS.includes(e.kind) && e.amount < 0 && e.at >= from && e.at < to && (!f.account || e.account === f.account));
    const labelOf = (e) => e.cat || (e.kind === 'paid out' ? 'Paid out at counters' : e.kind === 'salary' ? 'Salary' : 'Other');
    // a payment of a liability counts under the channel its line was owed for (as Sales & profit does)
    const homeOfEntry = (e) => {
      if (e.kind === 'paid out') return 'Retail';
      if (e.liab) {
        const l = liabs.find((x) => x.id === e.liab);
        const line = l && (l.lines || []).find((x) => x.name === e.party);
        const ch = (line && line.channel) || (l && l.channel);
        if (CHANNELS.includes(ch)) return ch;
      }
      const h = homeOf(labelOf(e));
      return HOMES.includes(h) ? h : 'Shared';
    };
    const rows = [...groupBy(out, labelOf)].map(([cat, list]) => {
      const row = { _key: cat, cat, count: list.length, _href: '/expenses-bills' };
      HOMES.forEach((h) => { row[h] = sum(list.filter((e) => homeOfEntry(e) === h), (e) => -e.amount); });
      row.total = sum(list, (e) => -e.amount);
      return row;
    });
    const total = sum(rows, (r) => r.total);
    const { buckets, keyOf } = bucketsOf(from, to);
    const tones = { Online: 'primary', Retail: 'success', Wholesale: 'warning', Shared: 'slate' };
    const series = HOMES.map((h) => ({ name: h, tone: tones[h], values: buckets.map(() => 0) }));
    out.forEach((e) => { const i = buckets.findIndex((b) => b.key === keyOf(e.at)); if (i >= 0) series[HOMES.indexOf(homeOfEntry(e))].values[i] += -e.amount; });
    const of = (h) => sum(rows, (r) => r[h]);
    return {
      kpis: [
        { key: 'total', label: 'Spent', value: total, format: 'money', good: 'down' },
        ...HOMES.map((h) => ({ key: h.toLowerCase(), label: h === 'Shared' ? 'Shared' : h, value: of(h), format: 'money', good: 'down', sub: total ? `${Math.round((of(h) / total) * 100)}% of spend` : '' })),
      ],
      chart: { type: 'stacked', labels: buckets.map((b) => b.label), series: series.filter((s) => s.values.some(Boolean)), format: 'money0' },
      table: {
        columns: [
          { key: 'cat', label: 'Category' },
          { key: 'count', label: 'Payments', format: 'int', align: 'right', total: 'sum' },
          ...HOMES.map((h) => ({ key: h, label: h, format: 'money', align: 'right', total: 'sum' })),
          { key: 'total', label: 'Total', format: 'money', align: 'right', total: 'sum' },
        ],
        rows,
        sort: { key: 'total', dir: 'desc' },
      },
      notes: [
        'Each category counts under the channel set for it in Accounts › Setup › Categories; money paid out at the counters counts under Retail.',
        'Payments of salaries, commission and promotions count under the channel they were owed for, on the day they were paid.',
      ],
    };
  },
};

// ---- receivables and payables -----------------------------------------------------------------------
const receivablesPayables = {
  id: 'receivables-payables',
  group: 'finance',
  title: 'Receivables & payables',
  description: 'Who owes you (customers and partners) against what you owe (suppliers, liabilities and money held for customers), and the difference.',
  icon: 'scale',
  keywords: 'dues receivable payable owe customers suppliers partners liabilities wallets points net',
  filters: [],
  snapshot: true,
  compare: false,
  defaultPeriod: 'month',
  compute({ now }) {
    const today = startOfDay(now || clockNow());
    const rows = [];
    // customers who owe on invoices
    const byCustomer = groupBy(safe(() => getInvoices(), []).filter((inv) => inv.due > 0), (inv) => digits(inv.customer && inv.customer.phone) || 'name:' + ((inv.customer && inv.customer.name) || 'Walk-in customer'));
    byCustomer.forEach((list, key) => {
      const c = list[0].customer || {};
      const wholesale = list.some((i) => i.wholesale);
      const phone = digits(c.phone);
      rows.push({ _key: 'c:' + key, side: 'They owe you', group: 'Customers', who: c.name || 'Walk-in customer', what: `${list.length} invoice${list.length === 1 ? '' : 's'}`, amount: sum(list, (i) => i.due), date: Math.min(...list.map((i) => i.at)), _href: phone ? (wholesale ? '/wholesale-customer?phone=' : '/customer-statement?phone=') + phone : '/sales-invoices' });
    });
    // money gateways, the card machine and couriers hold
    const entries = getEntries();
    ACCOUNTS.filter((a) => a.type === 'Holding').forEach((a) => {
      const held = balanceOf(a.id, entries);
      if (held > 0) rows.push({ _key: 'p:' + a.id, side: 'They owe you', group: 'Partners', who: (partnerBy(a.partner) || {}).name || a.name, what: 'Collected, not paid out yet', amount: held, date: null, _href: '/settlements' });
    });
    // supplier bills
    const suppliers = safe(() => getSuppliers(), []);
    groupBy(safe(() => getBills(), []).filter((b) => billLeft(b) > 0), (b) => b.supplier).forEach((list, id) => {
      const s = findSupplier(id, suppliers);
      rows.push({ _key: 's:' + id, side: 'You owe', group: 'Suppliers', who: s ? s.name : id, what: `${list.length} bill${list.length === 1 ? '' : 's'}`, amount: -sum(list, (b) => billLeft(b)), date: Math.min(...list.map((b) => b.due || b.at || Infinity)), _href: '/supplier-detail?id=' + encodeURIComponent(id) });
    });
    // liabilities not fully paid
    safe(() => getLiabilities(), []).filter((l) => leftOf(l) > 0).forEach((l) => {
      rows.push({ _key: 'l:' + l.id, side: 'You owe', group: 'Liabilities', who: l.title, what: (LIAB_TYPES[l.type] || LIAB_TYPES.other).label, amount: -leftOf(l), date: l.due, _href: '/liabilities' });
    });
    // money held for customers
    const members = safe(() => getMembers(), []);
    const wallets = safe(() => walletLiability(members), { total: 0, customers: [] });
    const points = safe(() => pointsLiability(members), { value: 0, points: 0, members: 0 });
    if (wallets.total > 0) rows.push({ _key: 'w', side: 'You owe', group: 'Held for customers', who: 'Customer wallets and advances', what: `${wallets.customers.length} customer${wallets.customers.length === 1 ? '' : 's'}`, amount: -wallets.total, date: null, _href: '/credit-wallet' });
    if (points.value > 0) rows.push({ _key: 'pts', side: 'You owe', group: 'Held for customers', who: 'Loyalty points', what: `${Math.round(points.points).toLocaleString('en-IN')} points · ${points.members} members`, amount: -points.value, date: null, _href: '/loyalty' });
    rows.forEach((r) => { r.amount = r2(r.amount); r.days = r.date && r.date !== Infinity ? Math.round((today - startOfDay(r.date)) / 864e5) : null; if (r.date === Infinity) r.date = null; });
    const groupSum = (g) => sum(rows.filter((r) => r.group === g), (r) => Math.abs(r.amount));
    const get = sum(rows.filter((r) => r.amount > 0), (r) => r.amount);
    const owe = r2(groupSum('Suppliers') + groupSum('Liabilities'));
    const held = groupSum('Held for customers');
    const net = r2(get - owe - held);
    const groups = ['Customers', 'Partners', 'Suppliers', 'Liabilities', 'Held for customers'];
    return {
      kpis: [
        { key: 'get', label: 'They owe you', value: get, format: 'money', good: 'none', sub: `Customers ৳${Math.round(groupSum('Customers')).toLocaleString('en-IN')} · partners ৳${Math.round(groupSum('Partners')).toLocaleString('en-IN')}` },
        { key: 'owe', label: 'You owe', value: owe, format: 'money', good: 'down', sub: 'Suppliers and liabilities' },
        { key: 'held', label: 'Held for customers', value: held, format: 'money', good: 'down', sub: 'Wallets, advances and points' },
        { key: 'net', label: 'Net', value: net, format: 'money', good: 'up', sub: net >= 0 ? 'More owed to you' : 'You owe more' },
      ],
      chart: { type: 'hbar', labels: groups, series: [{ name: 'Amount', tone: 'primary', values: groups.map(groupSum) }], format: 'money0' },
      table: {
        columns: [
          { key: 'side', label: 'Side' },
          { key: 'group', label: 'Group' },
          { key: 'who', label: 'Who' },
          { key: 'what', label: 'What' },
          { key: 'date', label: 'Since / due', format: 'date' },
          { key: 'days', label: 'Days', format: 'int', align: 'right' },
          { key: 'amount', label: 'Amount', format: 'money', align: 'right', total: 'sum' },
        ],
        rows,
        sort: { key: 'amount', dir: 'desc' },
      },
      notes: [
        'Money owed to you is positive and money you owe is negative, so the total is the net. Days count from the invoice date for customers and to the due date for bills and liabilities (negative = not due yet).',
        'Money held for customers (wallets, advances and points) is shown with what you owe; Dues lists it separately.',
      ],
    };
  },
};

// ---- partner fees ------------------------------------------------------------------------------------
const partnerFees = {
  id: 'partner-fees',
  group: 'finance',
  title: 'Partner fees & delivery charges',
  description: 'What each payment gateway, the card machine and each courier collected for you and what they kept as fees and delivery charges.',
  icon: 'hand-coins',
  keywords: 'gateway fee cod charge courier delivery pathao steadfast redx bkash nagad sslcommerz card effective rate',
  filters: [],
  defaultPeriod: 'lastmonth',
  compute({ from, to }) {
    const items = safe(() => getItems(), []).filter((i) => !i.removed && i.at >= from && i.at < to);
    const rows = [...groupBy(items, (i) => i.partner)].map(([id, list]) => {
      const p = partnerBy(id);
      const s = list.reduce((a, i) => { const c = costsOf(i, p); a.collected += i.gross; a.fee += c.fee; a.charge += c.charge; return a; }, { collected: 0, fee: 0, charge: 0 });
      const collected = r2(s.collected), fee = r2(s.fee), charge = r2(s.charge), cost = r2(s.fee + s.charge);
      return { _key: id, partner: p ? p.name : id, kind: p ? p.kind : '', count: list.length, collected, fee, charge, cost, pct: collected ? cost / collected : 0, feePct: collected ? fee / collected : 0, _href: '/settlements' };
    }).sort((a, b) => b.collected - a.collected);
    const collected = sum(rows, (r) => r.collected), fee = sum(rows, (r) => r.fee), charge = sum(rows, (r) => r.charge), cost = r2(fee + charge);
    const top = rows.slice().sort((a, b) => b.cost - a.cost).slice(0, 10);
    return {
      kpis: [
        { key: 'collected', label: 'Collected', value: collected, format: 'money', good: 'up' },
        { key: 'fee', label: 'Fees', value: fee, format: 'money', good: 'down' },
        { key: 'charge', label: 'Delivery charges', value: charge, format: 'money', good: 'down' },
        { key: 'cost', label: 'Kept by partners', value: cost, format: 'money', good: 'down' },
        { key: 'pct', label: 'Effective rate', value: collected ? cost / collected : 0, format: 'pct', good: 'down', sub: 'Of the money collected' },
      ],
      chart: {
        type: 'hbar', labels: top.map((r) => r.partner), format: 'money0',
        series: [{ name: 'Fees', tone: 'warning', values: top.map((r) => r.fee) }, { name: 'Delivery charges', tone: 'info', values: top.map((r) => r.charge) }],
      },
      table: {
        columns: [
          { key: 'partner', label: 'Partner' },
          { key: 'kind', label: 'Kind' },
          { key: 'count', label: 'Payments', format: 'int', align: 'right', total: 'sum' },
          { key: 'collected', label: 'Collected', format: 'money', align: 'right', total: 'sum' },
          { key: 'fee', label: 'Fee', format: 'money', align: 'right', total: 'sum' },
          { key: 'charge', label: 'Delivery charges', format: 'money', align: 'right', total: 'sum' },
          { key: 'cost', label: 'Kept in all', format: 'money', align: 'right', total: 'sum' },
          { key: 'pct', label: 'Effective %', format: 'pct', align: 'right', total: collected ? cost / collected : null },
        ],
        rows,
        sort: { key: 'collected', dir: 'desc' },
      },
      notes: ['Fees use each partner’s rate in Settlements (courier COD fees are lower inside Dhaka for some couriers). Counted on the day the money was collected, whether it has been paid out yet or not.'],
    };
  },
};

// ---- VAT -----------------------------------------------------------------------------------------------
// the starting rates of the VAT page (Accounts › VAT), used when sales have no item lines
const VAT_DEFAULTS = { rice: 0, oil: 5, soap: 7.5, snack: 5, drink: 5, cloth: 7.5, elec: 15 };
const bandOf = (rate) => (rate >= 15 ? 'Standard rate (15%)' : rate > 0 ? 'Reduced rate' : 'Zero-rated or exempt');
const NO_VAT = 'Online orders (no VAT recorded)';
const vatSummary = {
  id: 'vat-summary',
  group: 'finance',
  title: 'VAT summary (Mushak 9.1)',
  description: 'Sales VAT by rate and category for the month, laid out like the Mushak 9.1 return, with the VAT to pay.',
  icon: 'percent',
  keywords: 'vat tax mushak 9.1 return output vat input vat rate category nbr',
  filters: ['channel', 'category'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const f = filters || {};
    const vat = safe(() => loadVat(), { rates: {}, notReg: false });
    const lines = saleLines(from, to);
    let rows = [], est = false;
    if (lines) {
      const mine = lines.filter((l) => (!f.channel || l.channel === f.channel) && (!f.category || l.cat === f.category));
      // the category's rate on the VAT page; online orders record no VAT, so they are kept apart
      const rateOf = (l) => safe(() => vatRateFor(l.cat, vat), 0) || 0;
      const noVat = (l) => l.channel === 'Online' && !l.vat && rateOf(l) > 0;
      const keyed = groupBy(mine, (l) => [noVat(l) ? NO_VAT : bandOf(rateOf(l)), l.cat || 'Other', rateOf(l)].join('|'));
      rows = [...keyed].map(([k, list]) => {
        const [band, cat, r] = k.split('|');
        const rate = Number(r) || 0;
        const taxable = sum(list, (l) => l.revenue);
        const tax = vat.notReg ? 0 : sum(list, (l) => (l.vat != null ? l.vat : (Number(l.revenue) || 0) * rate / 100));
        if (list.some((l) => l.est || l.vat == null)) est = true;
        return { _key: k, band, cat, rate: rate / 100, lines: list.length, taxable, vat: tax };
      });
    } else {
      // no item lines yet: the average of the VAT page's rates over the sales book (an estimate)
      const book = salesBook.salesByChannel(from, to);
      const pick = f.channel ? book[f.channel] : book.all;
      const rates = Object.keys(VAT_DEFAULTS).map((k) => Number(vat.rates && vat.rates[k] != null ? vat.rates[k] : VAT_DEFAULTS[k]) || 0);
      const avg = rates.reduce((a, v) => a + v, 0) / (rates.length || 1);
      const taxable = r2((pick && pick.revenue) || 0);
      est = true;
      if (taxable) rows = [{ _key: 'all', band: 'All sales (average rate)', cat: f.channel ? f.channel + ' sales' : 'All sales', rate: avg / 100, lines: 0, taxable, vat: vat.notReg ? 0 : r2(taxable * avg / 100) }];
    }
    const bands = ['Standard rate (15%)', 'Reduced rate', 'Zero-rated or exempt'];
    const order = [...bands, NO_VAT];
    rows.sort((a, b) => order.indexOf(a.band) - order.indexOf(b.band) || b.rate - a.rate || b.vat - a.vat);
    const taxable = sum(rows, (r) => r.taxable), output = sum(rows, (r) => r.vat);
    const byCat = [...groupBy(rows, (r) => r.cat)].map(([cat, list]) => ({ cat, vat: sum(list, (r) => r.vat) })).sort((a, b) => b.vat - a.vat).slice(0, 10);
    return {
      kpis: [
        { key: 'taxable', label: 'Sales value (before VAT)', value: taxable, format: 'money', good: 'up', sub: est ? 'Estimate' : '' },
        { key: 'output', label: 'Output VAT', value: output, format: 'money', good: 'none', sub: est ? 'Estimate' : 'From the sale lines' },
        { key: 'input', label: 'Input VAT', value: 'Not tracked', format: 'text', sub: 'Purchases carry no VAT detail yet' },
        { key: 'payable', label: 'VAT to pay', value: output, format: 'money', good: 'down', sub: 'Before any input VAT credit' },
        { key: 'rate', label: 'Effective rate', value: taxable ? output / taxable : 0, format: 'pct', good: 'none' },
      ],
      chart: { type: 'hbar', labels: byCat.map((r) => r.cat), series: [{ name: 'Output VAT', tone: 'primary', values: byCat.map((r) => r.vat) }], format: 'money0' },
      table: {
        columns: [
          { key: 'band', label: 'Mushak 9.1 part' },
          { key: 'cat', label: 'Category' },
          { key: 'rate', label: 'Rate', format: 'pct', align: 'right' },
          { key: 'lines', label: 'Sale lines', format: 'int', align: 'right', total: 'sum' },
          { key: 'taxable', label: 'Value (before VAT)', format: 'money', align: 'right', total: 'sum' },
          { key: 'vat', label: 'VAT', format: 'money', align: 'right', total: 'sum' },
        ],
        rows: rows.map((r) => ({ ...r, _href: '/vat' })),
        sort: null,
      },
      notes: [
        vat.notReg ? 'The shop is set as not VAT-registered (Accounts › VAT), so no VAT is due.'
          : lines ? `Summary like the Mushak 9.1 monthly return: ${bands.map((b) => `${b.toLowerCase()} ৳${Math.round(sum(rows.filter((r) => r.band === b), (r) => r.taxable)).toLocaleString('en-IN')}`).join(', ')}. Input VAT on purchases is not recorded, so nothing is taken off.`
            : 'Sales have no item detail yet, so VAT is estimated with the average of the rates on the VAT page. Input VAT on purchases is not recorded, so nothing is taken off.',
        lines && est ? 'Estimate: demo September counter and wholesale days are built from daily totals, so their VAT is the category rate on the VAT page. Returns are not taken off.' : 'Returns are not taken off.',
        ...(rows.some((r) => r.band === NO_VAT) ? [`Online orders record no VAT, so ৳${Math.round(sum(rows.filter((r) => r.band === NO_VAT), (r) => r.taxable)).toLocaleString('en-IN')} of online sales is listed apart with no VAT; check whether their prices include it.`] : []),
      ],
    };
  },
};

// ---- balance sheet -------------------------------------------------------------------------------------
const balanceSheet = {
  id: 'balance-sheet',
  group: 'finance',
  title: 'Balance sheet (simple)',
  description: 'A simple picture of what the shop has (money, stock, money owed to it) against what it owes, and the owner’s share left.',
  icon: 'landmark',
  keywords: 'balance sheet assets liabilities equity net worth stock value receivables payables owner',
  filters: [],
  snapshot: true,
  compare: false,
  defaultPeriod: 'month',
  compute() {
    const entries = getEntries();
    const ofType = (t) => sum(ACCOUNTS.filter((a) => a.type === t), (a) => balanceOf(a.id, entries));
    const stock = safe(() => stockValue(), { value: 0, pieces: 0 });
    const customers = sum(safe(() => getInvoices(), []).filter((i) => i.due > 0), (i) => i.due);
    const S = safe(() => loadSnapshot(), null);
    const staffLoans = S ? sum(S.loans.filter((l) => l.status === 'run'), (l) => loanLeft(l)) : 0;
    const suppliers = sum(safe(() => getBills(), []), (b) => billLeft(b));
    const liabs = sum(safe(() => getLiabilities(), []), (l) => Math.max(0, leftOf(l)));
    const members = safe(() => getMembers(), []);
    const wallets = safe(() => walletLiability(members).total, 0);
    const points = safe(() => pointsLiability(members).value, 0);
    const A = (key, line, amount, href, note = '') => ({ _key: key, side: 'Assets', line, note, amount: r2(amount), _href: href });
    const L = (key, line, amount, href, note = '') => ({ _key: key, side: 'Liabilities', line, note, amount: -r2(amount), _href: href });
    const rows = [
      A('cash', 'Cash (shop, safe, drawers)', ofType('Cash'), '/cash-book'),
      A('bank', 'Bank accounts', ofType('Bank'), '/bank-accounts'),
      A('mobile', 'Mobile wallets', ofType('Mobile'), '/mfs-accounts'),
      A('held', 'Money with partners', ofType('Holding'), '/settlements', 'Gateways, card and COD, to be paid out'),
      A('stock', 'Stock at buying price', stock.value, '/stock', `${Math.round(stock.pieces).toLocaleString('en-IN')} pieces on hand`),
      A('customers', 'Customers owe', customers, '/dues', 'Unpaid invoices'),
      A('loans', 'Staff loans and advances', staffLoans, '/loans-advances', 'Still to be paid back'),
      L('suppliers', 'Supplier bills unpaid', suppliers, '/dues?tab=owe'),
      L('liabs', 'Liabilities unpaid', liabs, '/liabilities', 'Salaries, commission, promotions'),
      L('wallets', 'Customer wallets and advances', wallets, '/credit-wallet'),
      L('points', 'Loyalty points', points, '/loyalty', 'Value of points customers hold'),
    ].filter((r) => r.amount || ['cash', 'bank', 'stock'].includes(r._key));
    const assets = sum(rows.filter((r) => r.side === 'Assets'), (r) => r.amount);
    const owed = -sum(rows.filter((r) => r.side === 'Liabilities'), (r) => r.amount);
    const equity = r2(assets - owed);
    return {
      kpis: [
        { key: 'assets', label: 'What the shop has', value: assets, format: 'money', good: 'up', sub: 'Assets' },
        { key: 'owed', label: 'What it owes', value: owed, format: 'money', good: 'down', sub: 'Liabilities' },
        { key: 'equity', label: 'Owner’s equity', value: equity, format: 'money', good: 'up', sub: 'Assets − liabilities' },
        { key: 'money', label: 'Money in hand', value: r2(ofType('Cash') + ofType('Bank') + ofType('Mobile')), format: 'money', good: 'up', sub: 'Cash, bank and wallets' },
      ],
      chart: { type: 'hbar', labels: ['Assets', 'Liabilities', 'Owner’s equity'], series: [{ name: 'Amount', tone: 'primary', values: [assets, owed, Math.max(0, equity)] }], format: 'money0' },
      table: {
        columns: [
          { key: 'side', label: 'Side' },
          { key: 'line', label: 'Line' },
          { key: 'note', label: 'Note' },
          { key: 'amount', label: 'Amount', format: 'money', align: 'right', total: 'sum' },
        ],
        rows,
        totals: { side: 'Owner’s equity', line: 'Assets − liabilities', note: '', amount: equity },
        sort: null,
      },
      notes: [
        'A simple balance sheet from the books in this app, not an audited statement: shop fittings, equipment, loans from banks and tax are not included.',
        'Liabilities are shown as negative so the total is the owner’s equity. Stock is valued at buying price (the product’s cost, else the purchase price).',
      ],
    };
  },
};

// ---- owner equity ---------------------------------------------------------------------------------------
const ownerEquity = {
  id: 'owner-equity',
  group: 'finance',
  title: 'Owner investment & withdrawals',
  description: 'Money the owner put into the business against money taken out, next to the cash profit of the same period.',
  icon: 'piggy-bank',
  keywords: 'owner equity investment capital withdraw drawings draw',
  filters: ['account'],
  defaultPeriod: 'lastmonth',
  compute({ from, to, filters }) {
    const f = filters || {};
    const entries = getEntries();
    const list = entries.filter((e) => (e.kind === 'investment' || e.kind === 'owner withdraw') && e.at >= from && e.at < to && (!f.account || e.account === f.account));
    const put = sum(list.filter((e) => e.kind === 'investment'), (e) => e.amount);
    const took = -sum(list.filter((e) => e.kind === 'owner withdraw'), (e) => e.amount);
    const cash = cashPnl(entries, from, to);
    const { buckets, keyOf } = bucketsOf(from, to);
    const inS = buckets.map(() => 0), outS = buckets.map(() => 0);
    list.forEach((e) => { const i = buckets.findIndex((b) => b.key === keyOf(e.at)); if (i < 0) return; if (e.kind === 'investment') inS[i] += e.amount; else outS[i] += -e.amount; });
    return {
      kpis: [
        { key: 'put', label: 'Put in', value: put, format: 'money', good: 'none' },
        { key: 'took', label: 'Taken out', value: took, format: 'money', good: 'none' },
        { key: 'net', label: 'Net put in', value: r2(put - took), format: 'money', good: 'none', sub: put - took < 0 ? 'More taken out than put in' : '' },
        { key: 'profit', label: 'Cash profit', value: cash.profit, format: 'money', good: 'up', sub: cash.profit ? `${Math.round((took / Math.abs(cash.profit)) * 100)}% of it taken out` : '' },
      ],
      chart: { type: 'bar', labels: buckets.map((b) => b.label), series: [{ name: 'Put in', tone: 'success', values: inS }, { name: 'Taken out', tone: 'warning', values: outS }], format: 'money0' },
      table: {
        columns: [
          { key: 'at', label: 'Date', format: 'date' },
          { key: 'kind', label: 'Kind' },
          { key: 'party', label: 'Who' },
          { key: 'account', label: 'Account' },
          { key: 'note', label: 'Note' },
          { key: 'amount', label: 'Amount', format: 'money', align: 'right', total: 'sum' },
        ],
        rows: list.map((e) => ({ _key: e.id, at: e.at, kind: kindLabel(e.kind), party: e.party || '', account: (accountBy(e.account) || {}).name || e.account, note: e.note || '', amount: e.amount, _href: e.kind === 'investment' ? '/investment' : '/owner-withdraw' })),
        sort: { key: 'at', dir: 'desc' },
      },
      notes: ['Money put in is positive and money taken out negative, so the total is the net. Cash profit follows the P&L on Account reports (money in less money out, before the owner’s withdrawals).'],
    };
  },
};

export default [
  expensesByCategory, dailyClosing, cashFlowSummary, accountBalances, profitByChannelSummary, pnlMonthly,
  expensesByChannel, receivablesPayables, partnerFees, vatSummary, balanceSheet, ownerEquity,
];
export { EXPENSE_KINDS };
