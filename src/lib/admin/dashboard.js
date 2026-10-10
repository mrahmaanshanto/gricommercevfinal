// admin/dashboard — the Executive dashboard's figures (/admin). Merchants, recurring revenue, collections and dues come
// from the platform's demo records (lib/platform: stores, subscriptions, invoices, payments), so they agree with the
// merchant pages; the rest comes from each module's own data: leads (crm.js, stage moves in the period), tickets
// (support.js), services and server load (ops.js), costs (finance.js), marketing spend (marketing.js), trials that
// became paying (analytics.js); messaging resold is still the company.js estimate.
//
//   PERIODS                       the period picker: month (this month so far) · 30 · 90 · year (last 12 months)
//   executive(db, t, period)      everything the dashboard shows
//   alerts(db, t)                 what needs someone today, grouped (the dashboard list and the top bar's bell)

import { DAY, startOfDay, startOfMonth, addMonths, monthOf } from '@/lib/platform/util';
import { subOf, subState, isPaying, isLiveStore, mrrOf, openInvoices, balance } from '@/lib/platform/billing';
import { attention } from '@/lib/platform/views';
import { otherIncome } from './company';
import { ops, services, serverLoad } from './ops';
import { analytics, acquisitions, growthFunnel } from './analytics';
import { marketing, records as mkRecords, inRange as mkInRange, sum as mkSum } from './marketing';

/** Marketing spend in [from, to) from the campaigns and ads (lib/admin/marketing.js). */
function adSpend(from, to, t) { marketing.load(); return mkSum(mkInRange(mkRecords(marketing.get(), t), from, to)).spend || 0; }
import { costs as bookCosts } from './finance';

/** The company's costs in [from, to) from the books (lib/admin/finance.js): the four biggest and the rest as Other. */
function costs(from, to) {
  const all = bookCosts(from, to).slice().sort((a, b) => b.value - a.value);
  const top = all.slice(0, 4);
  const rest = all.slice(4).reduce((x, c) => x + c.value, 0);
  return rest ? [...top, { key: 'other', name: 'Everything else', value: rest }] : top;
}
import { crm, funnelMoves as funnel } from './crm';
import { supportStore, deskSummary } from './support';

/** The module stores the dashboard reads (browser only; loading twice does nothing). */
function loadStores() { crm.load(); supportStore.load(); ops.load(); analytics.load(); }

export const PERIODS = [
  ['month', 'This month'], ['30', 'Last 30 days'], ['90', 'Last 90 days'], ['year', 'Last 12 months'],
];

/** [from, to] of a period, and the period before it of the same length. */
export function range(period, t) {
  let from;
  if (period === 'month') from = startOfMonth(t);
  else if (period === 'year') from = addMonths(startOfMonth(t), -11, 1);
  else from = startOfDay(t) - (Number(period) - 1) * DAY;
  const len = t - from;
  return { from, to: t, prevFrom: from - len, prevTo: from, days: Math.max(1, Math.round(len / DAY)) };
}

const LADDERS = [['online', 'Online'], ['retail', 'Retail'], ['wholesale', 'Wholesale']];

/** Monthly recurring revenue at a moment, split by ladder. */
function mrrAt(db, x) {
  const by = { online: 0, retail: 0, wholesale: 0 };
  for (const s of db.shops) {
    if (s.createdAt > x) continue;
    const sub = subOf(db, s.id);
    if (!sub || !isPaying(subState(db, s.id, x))) continue;
    by[sub.ladder] = (by[sub.ladder] || 0) + mrrOf(db, sub, x);
  }
  return { ...by, total: by.online + by.retail + by.wholesale };
}
function payingAt(db, x) {
  return db.shops.filter((s) => s.createdAt <= x && isPaying(subState(db, s.id, x))).length;
}
const collected = (db, from, to) => db.payments.filter((p) => p.status === 'ok' && p.at >= from && p.at < to).reduce((s, p) => s + p.amount, 0);

/** Stores that left (cancelled or archived) in a window. */
const leftIn = (db, from, to) => Object.values(db.subs).filter((s) => s.cancelledAt && s.cancelledAt >= from && s.cancelledAt < to).length;

const pct = (a, b) => (b ? ((a - b) / b) * 100 : null);

export function executive(db, t, period = 'month') {
  loadStores();
  const R = range(period, t);
  const live = db.shops.filter((s) => isLiveStore(subState(db, s.id, t)));
  const states = live.map((s) => subState(db, s.id, t).key);
  const count = (...keys) => states.filter((k) => keys.includes(k)).length;

  // recurring revenue: now, the start of the period, and the last 12 month-ends (this month = now)
  const mrr = mrrAt(db, t);
  const mrrThen = mrrAt(db, R.from);
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const end = i === 0 ? t : addMonths(startOfMonth(t), -i + 1, 1) - 1;
    const m = mrrAt(db, end);
    months.push({ label: monthOf(end), title: monthOf(end) + (i === 0 ? ' (so far)' : ''), values: LADDERS.map(([k]) => m[k]), line: null });
  }

  const paying = count('active', 'grace', 'pastdue');
  const payingThen = payingAt(db, R.from);
  const newStores = live.filter((s) => s.createdAt >= R.from).length;

  // money in and owed
  const inNow = collected(db, R.from, R.to);
  const inBefore = collected(db, R.prevFrom, R.prevTo);
  let owed = 0, overdue = 0, overdueStores = 0;
  for (const s of db.shops) {
    let late = false;
    for (const inv of openInvoices(db, s.id)) {
      const b = balance(db, inv);
      owed += b;
      if (inv.dueAt < startOfDay(t)) { overdue += b; late = true; }
    }
    if (late) overdueStores++;
  }

  // churn and unit economics, over the last 90 days so a short period still has a rate
  const q = range('90', t);
  const left90 = leftIn(db, q.from, q.to);
  const paying90 = Math.max(1, payingAt(db, q.from));
  const churnMonthly = left90 / paying90 / 3;
  const leftNow = leftIn(db, R.from, R.to);
  const arpa = paying ? mrr.total / paying : 0;
  const ltv = churnMonthly > 0 ? arpa / churnMonthly : arpa * 36;
  // trials and new paying stores from Analytics' acquisition records (they keep the trials that ended without paying)
  const acq = acquisitions(db, analytics.get(), t);
  const g = growthFunnel(acq, R.from, R.to, t);
  const g90 = growthFunnel(acq, q.from, q.to, t);
  const trial = g.ended ? { ended: g.ended, won: g.won } : { ended: g90.ended, won: g90.won };
  const spend = adSpend(R.from, R.to, t);
  const wonStores = g.newPaying || 0;
  const cac = wonStores ? spend / wonStores : null;

  // sales funnel, support, services
  const f = funnel(R.from, R.to);
  const fPrev = funnel(R.prevFrom, R.prevTo);
  const desk = deskSummary(R.from, R.to, t);
  const svc = services(t);
  const load = serverLoad(t);

  // finance: what came in against what went out
  const other = otherIncome(R.from, R.to);
  const cost = costs(R.from, R.to);
  const costTotal = cost.reduce((s, c) => s + c.value, 0);
  const revenue = inNow + other.comms;
  const finMonths = [];
  for (let i = 5; i >= 0; i--) {
    const from = addMonths(startOfMonth(t), -i, 1);
    const to = i === 0 ? t : addMonths(startOfMonth(t), -i + 1, 1);
    const rev = collected(db, from, to) + otherIncome(from, to).comms;
    const out = costs(from, to).reduce((s, c) => s + c.value, 0);
    finMonths.push({ label: monthOf(from), title: monthOf(from) + (i === 0 ? ' (so far)' : ''), values: [rev], line: out });
  }

  return {
    range: R,
    figs: {
      mrr: mrr.total, mrrChange: pct(mrr.total, mrrThen.total),
      mrrSpark: months.map((m) => m.values.reduce((a, v) => a + v, 0)),
      paying, payingChange: paying - payingThen,
      collected: inNow, collectedChange: pct(inNow, inBefore),
      owed, overdue, overdueStores,
      churn: churnMonthly * 100, left: leftNow,
    },
    merchants: {
      total: live.length, paying, trial: count('trial'), late: count('grace', 'pastdue'), suspended: count('suspended'), paused: count('paused'),
      newStores, trialEnded: trial.ended, trialWon: trial.won, trialRate: trial.ended ? trial.won / trial.ended : null,
      ladders: LADDERS.map(([k, name]) => ({ key: k, name, value: live.filter((s) => (subOf(db, s.id) || {}).ladder === k).length })),
    },
    mrr: { ...mrr, arr: mrr.total * 12, months, ladders: LADDERS.map(([, n]) => n) },
    unit: { arpa, ltv, cac, spend },
    funnel: f, funnelPrev: fPrev,
    support: desk,
    services: svc, load, svcIssues: svc.filter((s) => s.status !== 'ok'),
    finance: { revenue, subs: inNow, comms: other.comms, refunds: other.refunds, costs: cost, costTotal, net: revenue - costTotal, owed, months: finMonths },
  };
}

/** What needs someone today, grouped (at most five rows), most urgent first. */
export function alerts(db, t) {
  loadStores();
  const att = attention(db, t);
  const late = att.filter((a) => ['grace', 'pastdue', 'suspended'].includes(a.state.key));
  const trials = att.filter((a) => a.state.key === 'trial');
  const limits = att.filter((a) => /order limit/.test(a.reason));
  const failed = db.shops.filter((s) => subState(db, s.id, t).key === 'failed');
  const svc = services(t).filter((s) => s.status !== 'ok');
  const desk = deskSummary(t - DAY, t, t);
  const rows = [];
  if (late.length) rows.push({ key: 'late', tone: 'err', title: `${late.length} store${late.length > 1 ? 's' : ''} behind on payment`, sub: late.slice(0, 3).map((a) => a.n).join(', '), href: '/admin/collections' });
  if (svc.length) rows.push({ key: 'svc', tone: 'err', title: `${svc[0].name}: ${svc[0].note}`, sub: `${svc[0].incident || 'Incident'} open · ${svc.length} service${svc.length > 1 ? 's' : ''} affected`, href: '/admin/incidents' });
  if (desk.critical) rows.push({ key: 'tickets', tone: 'err', title: `${desk.critical} critical tickets`, sub: desk.unassigned ? `${desk.unassigned} not assigned yet` : 'All assigned', href: '/admin/tickets?view=open' });
  if (trials.length) rows.push({ key: 'trials', tone: 'warn', title: `${trials.length} trial${trials.length > 1 ? 's' : ''} need a call`, sub: trials.slice(0, 3).map((a) => a.n).join(', '), href: '/admin/onboarding?tab=trials' });
  if (failed.length) rows.push({ key: 'setup', tone: 'warn', title: `${failed.length} store setup stopped`, sub: failed.map((s) => s.name).join(', '), href: '/admin/onboarding?tab=stopped' });
  if (limits.length) rows.push({ key: 'limits', tone: 'warn', title: `${limits.length} store${limits.length > 1 ? 's' : ''} near the order limit`, sub: 'Offer an upgrade', href: '/admin/merchants' });
  return rows.slice(0, 5);
}
