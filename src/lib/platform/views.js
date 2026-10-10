// platform/views — what each console screen shows, worked out from the data (db) at a time (t).
// Screens keep their design markup and read these. Nothing here changes data.
//
//   profile(shop)            the store's own trading picture (sales, team, integrations) — observed from the tenant
//   health(db, shop, t)      score 0–100 from six parts, band, change over 7 days and why
//   lastActiveDays · ordersMTD · storeRow · merchants · attention · overview · badges
//   collections · invoices · subscriptions · adjustments · provisioning · plans

import { DAY, rng, hash, daysBetween, startOfDay, startOfMonth, addMonths, periodOf, monthOf, monthLong, dm, dmy, hm, ago, ahead, taka, num, spark, initials, lastSeen, dur, dayOfMonth, at } from './util';
import { PLAN_NAME, ladderLabel, staffIni, staffColor, STAGES, SETS, LIMIT_KEYS, UNLIMITED, REASON_LABEL, GRACE_DAYS, READONLY_DAYS } from './catalogue';
import {
  shopOf, subOf, subState, isPaying, isLiveStore, mrrOf, planOf, balance, invoiceState, openInvoices, paidOn, creditOn,
  lastPayment, paidVia, billItems, priceOf, itemName, outcomeLabel, dayName,
} from './billing';

const AVG_ORDER = { Electronics: 758, Fashion: 1180, Grocery: 640, Beauty: 920, 'Jewellery and accessories': 4300 };

// ---- the store's own trading picture -------------------------------------------------------------------
/** Stable per store (seeded from its id). Dhaka Gadget Hub keeps the numbers drawn on the board. */
export function profile(shop) {
  const r = rng('profile' + shop.id);
  const h = shop.h0 || 70;
  const around = (base, spread) => Math.max(5, Math.min(100, Math.round(base + (r() - 0.5) * spread)));
  const p = {
    parts: { activation: around(h + 8, 20), activity: around(h + 4, 24), integrations: around(h, 30), technical: around(h + 10, 16), support: around(h + 2, 20) },
    avg: Math.round((AVG_ORDER[shop.cat] || 900) * (0.85 + r() * 0.3)),
    repeat: 0.25 + r() * 0.15,
    counter: shop.segs.includes('Retail') ? 0.55 + r() * 0.25 : 0,
  };
  if (shop.id === '0031') {
    p.parts = { activation: 88, activity: 76, integrations: 35, technical: 81, support: 70 };
    p.fixed = { lifetimeSales: 4862300, lifetimeOrders: 6412, customers: 3904, repeatBuyers: 1210, avg: 758, avgDelta: 34, counter: 0.71 };
  }
  return p;
}

/** Whole days since the store was last used (owner or team signed in). */
export function lastActiveDays(db, shop, t) {
  const since = Math.max(0, daysBetween(db.anchor, t));
  if (shop.lastDays0 != null) return shop.lastDays0 + since;
  if (shop.every) return since % shop.every;
  return 0;
}
/** Orders this month so far (the store's monthly pace × how far into the month). */
export function ordersMTD(db, shop, t) {
  const st = subState(db, shop.id, t);
  if (['suspended', 'paused', 'cancelled', 'archived', 'setup', 'failed'].includes(st.key)) return 0;
  if (st.key === 'trial') return Math.round(shop.orders0 * Math.min(1, daysBetween(subOf(db, shop.id).trialStart, t) / 14 + 0.3));
  return Math.round((shop.orders0 * dayOfMonth(t)) / 30);
}

// ---- health -------------------------------------------------------------------------------------------
const W = { activation: 0.1, activity: 0.2, billing: 0.25, integrations: 0.2, technical: 0.1, support: 0.15 };
const PART_LABEL = [['activation', 'Activation'], ['activity', 'Activity'], ['billing', 'Billing'], ['integrations', 'Integrations'], ['technical', 'Technical'], ['support', 'Support']];
function billingPart(st) {
  return { active: 96, trial: 70, grace: 20, pastdue: 10, suspended: 0, paused: 40, cancelled: 0, archived: 0, setup: 60, failed: 30 }[st.key] ?? 60;
}
export function health(db, shop, t) {
  const p = profile(shop);
  const st = subState(db, shop.id, t);
  const days = lastActiveDays(db, shop, t);
  const parts = {
    ...p.parts,
    activity: Math.round(p.parts.activity * Math.max(0, 1 - Math.max(0, days - 1) / 20)),
    billing: billingPart(st),
  };
  const score = Math.round(Object.entries(W).reduce((s, [k, w]) => s + parts[k] * w, 0));
  const band = score >= 75 ? 'Healthy' : score >= 50 ? 'Watch' : 'At risk';
  const tone = score >= 75 ? 'ok' : score >= 50 ? 'warn' : 'err';
  // the score a week ago (billing and activity then)
  const t7 = t - 7 * DAY;
  const st7 = subState(db, shop.id, t7);
  const days7 = Math.max(0, days - 7);
  const then = Math.round(Object.entries(W).reduce((s, [k, w]) => s + (k === 'billing' ? billingPart(st7) : k === 'activity' ? Math.round(p.parts.activity * Math.max(0, 1 - Math.max(0, days7 - 1) / 20)) : parts[k]) * w, 0));
  const reasons = [];
  if (['grace', 'pastdue', 'suspended'].includes(st.key)) reasons.push('unpaid invoice');
  if (parts.integrations < 50) reasons.push(shop.id === '0031' ? 'Steadfast failures' : 'courier sync failures');
  if (days >= 7) reasons.push(`no login ${days} days`);
  return {
    score, band, tone, change: score - then, why: reasons.join(' and '),
    parts: PART_LABEL.map(([k, label]) => ({ key: k, label, value: parts[k], tone: parts[k] >= 75 ? 'ok' : parts[k] >= 50 ? 'warn' : 'err' })),
  };
}

// ---- one store as a row of the Merchants list ------------------------------------------------------------
export function storeRow(db, shop, t) {
  const sub = subOf(db, shop.id);
  const st = subState(db, shop.id, t);
  const hl = health(db, shop, t);
  const plan = planOf(db, sub);
  const runningModTrial = sub.moduleTrials.some((m) => !m.result && m.start <= t);
  const trial = st.key === 'trial' ? (st.left <= 3 ? 'ending' : 'trial') : runningModTrial ? 'module' : 'none';
  const open = openInvoices(db, shop.id);
  const bill = st.key === 'trial' || st.key === 'setup' ? 'Trial' : open.some((i) => i.dueAt < startOfDay(t)) ? 'Overdue' : open.some((i) => i.dueAt - 7 * DAY <= t) ? 'Due' : 'Paid';
  const am = shop.am || shop.by;
  return {
    id: shop.id, n: shop.name, tid: shop.id, dom: shop.dom || `${shop.sub}.gridcommerce.com.bd`,
    seg: shop.segs.join(' · '), plan: plan.name, planId: sub.plan, ladder: sub.ladder,
    st: st.label, sk: st.tone === 'info' ? 'none' : st.tone, state: st, h: hl.score, health: hl,
    orders: ordersMTD(db, shop, t), lim: plan.limits.orders >= UNLIMITED ? 99999 : plan.limits.orders,
    last: lastActiveDays(db, shop, t), own: staffIni(am), ownName: am, ownColor: staffColor(am),
    mods: shop.mods, trial, bill, src: shop.src, by: shop.by, dist: shop.dist,
    mrr: isPaying(st) ? mrrOf(db, sub, t) : 0, createdAt: shop.createdAt,
  };
}

const shown = (db, t) => db.shops.filter((s) => isLiveStore(subState(db, s.id, t)));

export function merchants(db, t) {
  const live = shown(db, t);
  const rows = live.map((s) => storeRow(db, s, t));
  const paying = rows.filter((r) => isPaying(r.state));
  const trials = rows.filter((r) => r.state.key === 'trial');
  const overdue = rows.filter((r) => r.bill === 'Overdue');
  const overdueAmt = overdue.reduce((s, r) => s + openInvoices(db, r.id).filter((i) => i.dueAt < startOfDay(t)).reduce((x, i) => x + balance(db, i), 0), 0);
  const inactive = rows.filter((r) => r.last >= 7);
  const newThisMonth = rows.filter((r) => r.createdAt >= startOfMonth(t)).length;
  return {
    rows,
    total: rows.length,
    kpis: {
      stores: rows.length, storesNote: `+${newThisMonth} this month`,
      paying: paying.length, payingNote: `${taka(paying.reduce((s, r) => s + r.mrr, 0))} a month`,
      trial: trials.length, trialNote: `${trials.filter((r) => r.state.left <= 3).length} end in 3 days`,
      overdue: overdue.length, overdueNote: `${taka(overdueAmt)} · being called`,
      inactive: inactive.length, inactiveNote: `${inactive.filter((r) => isPaying(r.state)).length} are paying`,
    },
  };
}

// ---- what needs attention (Overview, Monitoring) --------------------------------------------------------
/** Stores that need someone today, most urgent first. */
export function attention(db, t) {
  const out = [];
  for (const shop of shown(db, t)) {
    const row = storeRow(db, shop, t);
    const st = row.state;
    const sub = subOf(db, shop.id);
    const am = shop.am ? shop.am.split(' ')[0] + ' ' + shop.am.split(' ')[1][0] + '.' : 'Unassigned';
    const go = (tab) => `/admin/merchant?id=${shop.id}${tab ? '&tab=' + tab : ''}`;
    if (['grace', 'pastdue', 'suspended'].includes(st.key)) {
      const reason = st.key === 'grace' ? `Invoice unpaid${row.health.parts.find((p) => p.key === 'integrations').value < 50 ? ' · courier failing' : ` · day ${st.days} of grace`}` : st.key === 'pastdue' ? `Read-only · no login ${row.last} days` : `Suspended · unpaid ${st.days} days`;
      out.push({ ...row, reason, band: 'At risk', tone: 'err', am, next: 'Call today →', href: go('billing'), w: 100 + st.days });
    } else if (st.key === 'trial' && row.last >= 5) {
      out.push({ ...row, reason: `Setup stalled · no orders ${row.last} days`, band: 'Watch', tone: 'warn', am, next: shop.am ? 'Call →' : 'Assign →', href: go('onboarding'), w: 60 + row.last });
    } else if (st.key === 'trial' && st.left <= 3) {
      out.push({ ...row, reason: `Trial day ${st.days} · ${shop.dom ? 'ends in ' + st.left + ' days' : 'domain not verified'}`, band: 'Watch', tone: 'warn', am, next: 'Send guide →', href: go('onboarding'), w: 50 + (3 - st.left) });
    } else if (row.lim && row.orders / row.lim >= 0.8 && isPaying(st)) {
      out.push({ ...row, reason: `${Math.round((row.orders / row.lim) * 100)}% of order limit`, band: 'Watch', tone: 'warn', am, next: 'Offer upgrade →', href: go('billing'), w: 40 + (row.orders / row.lim) * 10 });
    } else if (row.h < 50) {
      out.push({ ...row, reason: row.health.why || 'Health dropped', band: 'At risk', tone: 'err', am, next: 'Call →', href: go(), w: 70 });
    }
    void sub;
  }
  return out.sort((a, b) => b.w - a.w);
}

// ---- Overview (console home) ----------------------------------------------------------------------------
function storesAt(db, t) { return db.shops.filter((s) => s.createdAt <= t && isLiveStore(subState(db, s.id, t))).length; }
function mrrAt(db, t) { return db.shops.reduce((sum, s) => { if (s.createdAt > t) return sum; const st = subState(db, s.id, t); return isPaying(st) ? sum + mrrOf(db, subOf(db, s.id), t) : sum; }, 0); }
function riskAt(db, t) { return db.shops.filter((s) => s.createdAt <= t && isLiveStore(subState(db, s.id, t)) && health(db, s, t).score < 50).length; }
function series(fn, t, days, n = 24) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push(fn(t - (i * days * DAY) / (n - 1)));
  return out;
}
function kpiPath(values) {
  const { line, area } = spark(values, 200, 36);
  return { d: line, area };
}
export function overview(db, t, range) {
  const days = { 1: 1, 7: 7, 30: 30 }[range] || 7;
  const word = { 1: 'today', 7: 'this week', 30: 'in 30 days' }[range] || 'this week';
  const vs = { 1: 'vs yesterday', 7: 'vs last week', 30: 'vs last month' }[range] || 'vs last week';
  const t0 = t - days * DAY;
  const s1 = storesAt(db, t), s0 = storesAt(db, t0);
  const m1 = mrrAt(db, t), m0 = mrrAt(db, t0);
  const r1 = riskAt(db, t), r0 = riskAt(db, t0);
  const pct = m0 ? ((m1 - m0) / m0) * 100 : 0;
  const kpis = [
    { label: 'Active stores', value: num(s1), delta: `${s1 - s0 >= 0 ? '+' : ''}${s1 - s0} ${word}`, toneCls: s1 >= s0 ? 'tone-good' : 'tone-bad', ...kpiPath(series((x) => storesAt(db, x), t, days)) },
    { label: 'Recurring revenue', value: taka(m1), delta: `${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct).toFixed(1)}% ${vs}`, toneCls: pct >= 0 ? 'tone-good' : 'tone-bad', ...kpiPath(series((x) => mrrAt(db, x), t, days)) },
    { label: 'Stores at risk', value: num(r1), delta: r1 === r0 ? `same as ${vs.replace('vs ', '')}` : `${r1 > r0 ? '▲' : '▼'} ${Math.abs(r1 - r0)} ${vs}`, toneCls: r1 > r0 ? 'tone-bad' : r1 < r0 ? 'tone-good' : 'tone-flat', ...kpiPath(series((x) => riskAt(db, x), t, days)) },
    { label: 'Open incidents', value: '1', delta: '3 closed this week', toneCls: 'tone-flat', ...kpiPath([2, 3, 2, 1, 2, 3, 4, 3, 2, 2, 1, 2, 3, 2, 1, 1, 2, 3, 2, 1, 2, 1, 1, 1]) },
  ];
  const att = attention(db, t);
  return { kpis, stores: s1, attention: att.slice(0, 5), attentionCount: att.length };
}

// ---- sidebar badges ---------------------------------------------------------------------------------------
export function badges(db, t) {
  const call = collections(db, t).rows.filter((r) => r.overdueDays >= 0).length;
  const risk = attention(db, t).filter((a) => a.band === 'At risk').length;
  return { billing: call, collections: call, monitoring: risk, health: risk, support: 12, tickets: 12, crm: 18, leads: 18, operations: 2, integrations: 1, incidents: 1 };
}

// ---- Collections ----------------------------------------------------------------------------------------
export function collections(db, t) {
  const rows = [];
  for (const shop of db.shops) {
    const st = subState(db, shop.id, t);
    if (!isLiveStore(st) || st.key === 'trial') continue;
    for (const inv of openInvoices(db, shop.id)) {
      if (inv.dueAt - 7 * DAY > t) continue;
      const od = daysBetween(inv.dueAt, t);
      const calls = db.calls.filter((c) => c.invoiceId === inv.id).sort((a, b) => b.at - a.at);
      const lastCall = calls[0] || null;
      const noAns = calls.filter((c) => c.outcome === 'noanswer').length;
      let contact = { text: od > 0 ? 'Not called yet' : od === 0 ? 'Due today' : `Due in ${-od} day${od === -1 ? '' : 's'}`, cls: 'pill p-grey' };
      if (lastCall) {
        if (lastCall.outcome === 'promised' && lastCall.promiseAt) contact = { text: `Promised ${dayName(lastCall.promiseAt)}${lastCall.method ? ' · ' + lastCall.method : ''}`, cls: 'pill p-sky' };
        else if (lastCall.outcome === 'noanswer') contact = { text: noAns > 1 ? `No answer × ${noAns}` : 'No answer', cls: 'pill p-err' };
        else if (lastCall.outcome === 'reminder') contact = { text: lastCall.note.startsWith('Pay link') ? 'Pay link sent' : 'Panel reminder sent', cls: 'pill p-grey' };
        else if (lastCall.outcome === 'later') contact = { text: lastCall.note, cls: 'pill p-warn' };
        else if (lastCall.outcome === 'dispute') contact = { text: 'Disputes the bill', cls: 'pill p-err' };
        else if (lastCall.outcome === 'panel') contact = { text: 'Will pay from panel', cls: 'pill p-sky' };
      }
      let next = lastCall && lastCall.nextAt && lastCall.nextAt > t - DAY ? lastCall.nextAt : od > 0 ? at(t, 16) : od === 0 ? at(t, 16) : at(inv.dueAt, 11);
      if (next < t && od > 0) next = at(t + DAY, 11);
      const am = shop.am || shop.by;
      const pending = db.adjustments.find((a) => a.invoiceId === inv.id && a.status === 'pending');
      rows.push({
        key: inv.id, shopId: shop.id, name: shop.name, ini: initials(shop.name), invoiceId: inv.id, amount: balance(db, inv), total: inv.total,
        overdueDays: od, overdueText: od > 0 ? `${od} day${od === 1 ? '' : 's'} overdue` : 'Due',
        bar: Math.min(100, Math.max(0, od) * 5), barCol: od > READONLY_DAYS ? '#c2410c' : od > GRACE_DAYS ? '#ff5724' : od > 0 ? '#ff9800' : '#cbd5e1',
        contact, next: ahead(next, t), nextAt: next, am: staffIni(am), amName: am, amColor: staffColor(am), state: st, pending,
        calls, promised: lastCall && lastCall.outcome === 'promised' && lastCall.promiseAt >= startOfDay(t) ? balance(db, inv) : 0,
        method: (lastPayment(db, (db.invoices.filter((i) => i.shopId === shop.id && i.id !== inv.id && paidOn(db, i.id) > 0).sort((a, b) => b.dueAt - a.dueAt)[0] || {}).id) || {}).method || 'bKash',
      });
    }
  }
  rows.sort((a, b) => (b.overdueDays > 0) - (a.overdueDays > 0) || b.overdueDays - a.overdueDays);
  const weekEnd = t + 7 * DAY;
  const dueWeek = rows.filter((r) => r.overdueDays <= 0 && r.nextAt <= weekEnd + DAY);
  const overdue = rows.filter((r) => r.overdueDays > 0);
  const promised = rows.filter((r) => r.promised > 0);
  const today0 = startOfDay(t);
  const todayPays = db.payments.filter((p) => p.at >= today0 && p.status === 'ok' && p.via !== 'auto');
  const month0 = startOfMonth(t);
  const monthPaid = db.payments.filter((p) => p.at >= month0 && p.status === 'ok');
  const byPanel = monthPaid.filter((p) => p.via === 'panel').length;
  const byCall = monthPaid.filter((p) => p.via === 'call').length;
  const byAuto = monthPaid.filter((p) => p.via === 'auto').length;
  const collectors = {};
  for (const p of monthPaid.filter((x) => x.via === 'call')) collectors[p.by] = (collectors[p.by] || 0) + 1;
  // paid by due date, this month vs last month
  const onTime = (from, to) => {
    const bills = db.invoices.filter((i) => !i.noCharge && i.dueAt >= from && i.dueAt < to && i.dueAt <= t);
    if (!bills.length) return 0;
    const ok = bills.filter((i) => { const p = lastPayment(db, i.id); return p && p.at <= i.dueAt + DAY; }).length;
    return Math.round((ok / bills.length) * 100);
  };
  const onNow = onTime(month0, t + 1), onPrev = onTime(addMonths(month0, -1, 1), month0);
  return {
    rows,
    kpis: {
      dueWeek: dueWeek.reduce((s, r) => s + r.amount, 0), dueWeekN: dueWeek.length,
      overdue: overdue.reduce((s, r) => s + r.amount, 0), overdueN: new Set(overdue.map((r) => r.shopId)).size,
      promised: promised.reduce((s, r) => s + r.promised, 0), promisedN: promised.length, promisedDay: promised[0] ? dayName(promised[0].calls[0].promiseAt) : '',
      today: todayPays.reduce((s, p) => s + p.amount, 0), todayCalls: todayPays.filter((p) => p.via === 'call').length, todayN: todayPays.length,
      onTime: onNow, onTimeDelta: onNow - onPrev,
    },
    month: monthLong(t), byPanel, byCall, byAuto, paidStores: new Set(monthPaid.map((p) => p.shopId)).size,
    collectors: Object.entries(collectors).sort((a, b) => b[1] - a[1]),
  };
}

// ---- Invoices and credit notes -----------------------------------------------------------------------------
export function invoices(db, t) {
  const month0 = startOfMonth(t);
  const list = [];
  for (const inv of db.invoices) {
    const shop = shopOf(db, inv.shopId);
    const s = invoiceState(db, inv, t);
    const p = lastPayment(db, inv.id);
    let status, cls, shp;
    if (s.key === 'nocharge') { status = 'No charge'; cls = 'pill p-grey'; shp = ''; }
    else if (s.key === 'paid' || s.key === 'credited') { status = s.key === 'credited' ? 'Settled by credit' : 'Paid'; cls = 'pill p-ok'; shp = 'shp shp-ok'; }
    else if (s.key === 'overdue') { status = `Overdue · ${s.days} day${s.days === 1 ? '' : 's'}`; cls = 'pill p-err'; shp = 'shp shp-err'; }
    else { status = s.days === 0 ? 'Due today' : `Due in ${s.days} day${s.days === 1 ? '' : 's'}`; cls = 'pill p-warn'; shp = 'shp shp-warn'; }
    list.push({ key: inv.id, id: inv.id, kind: 'invoice', shopId: inv.shopId, store: shop ? shop.name : inv.shopId, period: monthOf(inv.period), amount: inv.total, amountText: taka(inv.total), method: s.key === 'nocharge' ? 'Trial' : p ? paidVia(p) : '—', status, cls, shp, filter: s.key === 'nocharge' || s.key === 'paid' || s.key === 'credited' ? 'paid' : s.key, at: inv.issuedAt, inv });
  }
  for (const cn of db.credits) {
    const shop = shopOf(db, cn.shopId);
    const inv = db.invoices.find((i) => i.id === cn.invoiceId);
    list.push({ key: cn.id, id: cn.id, kind: 'credit', shopId: cn.shopId, store: shop ? shop.name : cn.shopId, period: inv ? monthOf(inv.period) : monthOf(cn.at), amount: -cn.amount, amountText: taka(-cn.amount), method: 'Credit note', status: 'Credit issued', cls: 'pill p-sky', shp: '', filter: 'credit', at: cn.at, cn });
  }
  list.sort((a, b) => b.at - a.at);
  const thisMonth = db.invoices.filter((i) => i.issuedAt >= month0 && !i.noCharge);
  const invoiced = thisMonth.reduce((s, i) => s + i.total, 0);
  const collected = thisMonth.reduce((s, i) => s + paidOn(db, i.id), 0);
  const open = db.invoices.filter((i) => balance(db, i) > 0 && i.dueAt - 7 * DAY <= t);
  const cnMonth = db.credits.filter((c) => c.at >= month0);
  const count = (f) => list.filter((x) => x.filter === f).length;
  return {
    list,
    month: monthLong(t),
    kpis: {
      invoiced, invoicedN: thisMonth.length, collected, collectedPct: invoiced ? Math.round((collected / invoiced) * 100) : 0,
      open: open.reduce((s, i) => s + balance(db, i), 0), openN: open.length,
      credits: cnMonth.reduce((s, c) => s + c.amount, 0), creditsN: cnMonth.length,
    },
    counts: { all: list.length, paid: count('paid'), overdue: count('overdue'), due: count('due'), credit: count('credit') },
  };
}
/** One invoice with its lines, credits and payments, as the invoice panel shows it. */
export function invoiceDetail(db, id, t) {
  const inv = db.invoices.find((i) => i.id === id);
  if (!inv) return null;
  const shop = shopOf(db, inv.shopId);
  const sub = subOf(db, inv.shopId);
  const cns = db.credits.filter((c) => c.invoiceId === inv.id);
  const pays = db.payments.filter((p) => p.invoiceId === inv.id && p.status === 'ok');
  const s = invoiceState(db, inv, t);
  const lines = inv.lines.map((l, i) => ({ key: i, label: l.label, amount: taka(l.amount) }));
  for (const c of cns) lines.push({ key: c.id, label: `Credit note ${c.id} · ${REASON_LABEL[c.reason] || c.reason}`, amount: taka(-c.amount) });
  const net = inv.total - cns.reduce((x, c) => x + c.amount, 0);
  const adj = cns.map((c) => db.adjustments.find((a) => a.id === c.adjId)).filter(Boolean);
  return {
    inv, shop, sub, title: [inv.id, ...cns.map((c) => c.id)].join(' · '),
    status: s.key === 'paid' || s.key === 'credited' ? 'Settled' : s.key === 'overdue' ? 'Overdue' : s.key === 'nocharge' ? 'No charge' : 'Unpaid',
    statusCls: s.key === 'paid' || s.key === 'credited' || s.key === 'nocharge' ? 'pill p-ok' : s.key === 'overdue' ? 'pill p-err' : 'pill p-warn',
    shp: s.key === 'paid' || s.key === 'credited' ? 'shp shp-ok' : s.key === 'overdue' ? 'shp shp-err' : 'shp shp-warn',
    billedTo: `Billed to ${shop.owner.name} · ${shop.dist}`,
    lines, net: taka(net), paid: pays, balance: balance(db, inv),
    note: adj.length ? adj.map((a) => `The ${taka(a.amount)} correction was issued as a credit note with reason ${a.reason}, approved by ${a.decidedBy === 'auto' ? 'the under-threshold rule' : a.decidedBy}.`).join(' ') : pays.length ? `Paid ${dmy(pays[pays.length - 1].at)} · ${paidVia(pays[pays.length - 1])}${pays[pays.length - 1].txId ? ' · ' + pays[pays.length - 1].txId : ''}.` : 'Not paid yet.',
  };
}

// ---- Subscriptions ------------------------------------------------------------------------------------------
export function subscriptions(db, t) {
  const month0 = startOfMonth(t);
  const prev0 = addMonths(month0, -1, 1);
  const startMrr = mrrAt(db, month0);
  const endMrr = mrrAt(db, t);
  const prevMrr = mrrAt(db, prev0);
  // movement this month: new (trial → paying), expansion (plan up, modules added), contraction, churn
  let nw = 0, nwN = 0, ex = 0, exN = 0, co = 0, ch = 0, chN = 0;
  for (const shop of db.shops) {
    const sub = subOf(db, shop.id);
    const a = isPaying(subState(db, shop.id, month0)) ? mrrOf(db, sub, month0) : 0;
    const b = isPaying(subState(db, shop.id, t)) ? mrrOf(db, sub, t) : 0;
    if (!a && b) { nw += b; nwN++; } else if (a && !b) { ch += a; chN++; } else if (b > a) { ex += b - a; exN++; } else if (b < a) co += a - b;
  }
  const states = { trial: 0, active: 0, grace: 0, pastdue: 0, paused: 0, suspended: 0, cancelled: 0 };
  for (const shop of db.shops) { const k = subState(db, shop.id, t).key; if (k in states) states[k]++; }
  const mrr12 = [];
  for (let i = 11; i >= 0; i--) { const m = i ? addMonths(month0, -i + 1, 1) - 1 : t; mrr12.push({ t: m, v: mrrAt(db, m) }); }
  const col = collections(db, t);
  return {
    month: monthLong(t), mrr: endMrr, mrrPct: prevMrr ? ((endMrr - prevMrr) / prevMrr) * 100 : 0,
    move: { start: startMrr, nw, nwN, ex, exN, co, ch, chN, end: endMrr },
    states, mrr12,
    onTime: col.kpis.onTime, onTimeDelta: col.kpis.onTimeDelta,
    unpaid: col.rows.filter((r) => r.overdueDays >= 0).reduce((s, r) => s + r.amount, 0), unpaidN: col.rows.filter((r) => r.overdueDays >= 0).length,
    calling: col.rows.filter((r) => r.overdueDays >= 0 || r.state.key !== 'active').slice(0, 6),
    sparks: {
      mrr: mrr12.map((x) => x.v),
    },
  };
}

// ---- Adjustments ----------------------------------------------------------------------------------------------
export function adjustments(db, t) {
  const month0 = startOfMonth(t);
  const list = db.adjustments.slice().sort((a, b) => b.at - a.at).map((a) => {
    const shop = shopOf(db, a.shopId);
    const type = { credit: 'Credit', discount: 'Discount', waive: 'Waive', charge: 'Charge' }[a.type];
    const change = a.type === 'discount' && a.pct ? `Discount ${a.pct}% · ${a.note}` : a.type === 'credit' ? `Credit ${taka(a.amount)} · ${a.note}` : `${type} · ${a.note}`;
    const status = a.status === 'pending' ? 'Needs 2nd approval' : a.status === 'approved' ? (a.decidedBy === 'auto' ? 'Approved · under limit' : 'Approved') : 'Rejected';
    const cls = a.status === 'pending' ? 'pill p-warn' : a.status === 'approved' ? 'pill p-ok' : 'pill p-err';
    return { ...a, key: a.id, store: shop ? shop.name : a.shopId, ini: shop ? initials(shop.name) : '', change, amountText: taka(a.amount), statusText: status, cls, shp: 'shp shp-' + (a.status === 'pending' ? 'warn' : a.status === 'approved' ? 'ok' : 'err') };
  });
  const pending = list.filter((a) => a.status === 'pending');
  const approvedMonth = list.filter((a) => a.status === 'approved' && a.decidedAt >= month0);
  const rejected = list.filter((a) => a.status === 'rejected' && a.decidedAt >= month0);
  const byReason = {};
  for (const a of list.filter((x) => x.at >= month0)) byReason[a.reason] = (byReason[a.reason] || 0) + 1;
  return {
    list, month: monthLong(t), threshold: db.settings.adjThreshold,
    kpis: { pending: pending.length, pendingAmt: pending.reduce((s, a) => s + a.amount, 0), approved: approvedMonth.reduce((s, a) => s + a.amount, 0), approvedN: approvedMonth.length, rejected: rejected.length },
    reasons: Object.entries(byReason).sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ key: k, label: REASON_LABEL[k] || k, n })),
  };
}
/** What a bill looks like before and after an adjustment. */
export function adjustmentEffect(db, a, t) {
  if (!a) return null;
  const inv = a.invoiceId && a.invoiceId !== 'next' ? db.invoices.find((i) => i.id === a.invoiceId) : null;
  const sub = subOf(db, a.shopId);
  const before = inv ? inv.total : mrrOf(db, sub, t);
  const after = a.type === 'charge' ? before + a.amount : Math.max(0, before - a.amount);
  return {
    beforeLabel: inv ? `Before · ${inv.id}` : 'Before · next bill',
    before, after,
    afterLabel: a.cnId ? `After · with ${a.cnId}` : a.type === 'credit' || a.type === 'waive' ? 'After · with a credit note' : 'After',
    planLine: `${ladderLabel(sub.ladder)} · ${PLAN_NAME[sub.plan]}, ${inv ? monthLong(inv.period) : 'next bill'}`,
    explain: a.type === 'credit' && inv ? `credit ${taka(a.amount)}${a.reason === 'OUTAGE-CREDIT' && inv.total ? ' = ' + Math.round((a.amount / inv.total) * 30) + ' of 30 days' : ''}` : a.type === 'discount' ? `${a.pct ? a.pct + '% ' : ''}off the next bill` : a.type === 'waive' ? 'bill cancelled in full' : 'one-off line on the next bill',
  };
}

// ---- Provisioning -------------------------------------------------------------------------------------------
export function runState(run, t) {
  const total = run.stages.reduce((s, x) => s + x.ms, 0);
  let acc = 0;
  const stages = STAGES.map(([key, label], i) => {
    const ms = run.stages[i].ms;
    const startAt = run.startedAt + acc;
    acc += ms;
    let st = 'done';
    if (run.failedAt) {
      const fi = STAGES.findIndex((s) => s[0] === run.failedAt);
      st = i < fi ? 'done' : i === fi ? 'failed' : 'todo';
    } else if (t < startAt) st = 'todo';
    else if (t < startAt + ms) st = 'running';
    return { key, label, ms, st };
  });
  const running = !run.failedAt && t < run.startedAt + total;
  const status = run.failedAt ? 'failed' : running ? 'running' : 'live';
  return { stages, total, status, elapsed: Math.min(t, run.startedAt + total) - run.startedAt };
}
export function provisioning(db, t) {
  const today0 = startOfDay(t);
  const runs = db.runs.slice().sort((a, b) => b.startedAt - a.startedAt).map((run) => {
    const shop = shopOf(db, run.shopId);
    const rs = runState(run, t);
    return {
      ...run, key: run.id, name: shop ? shop.name : run.shopId, ini: shop ? initials(shop.name) : '', tid: run.shopId, ...rs,
      timeText: rs.status === 'running' ? `Running · ${dur(rs.elapsed)}` : rs.status === 'failed' ? `Stopped at ${STAGES.find((s) => s[0] === run.failedAt)[1]}` : dur(rs.total),
      pill: rs.status === 'live' ? 'pill p-ok' : rs.status === 'running' ? 'pill p-sky' : 'pill p-err', label: rs.status === 'live' ? 'Live' : rs.status === 'running' ? 'Running' : 'Failed',
      signedUp: hm(run.startedAt),
    };
  });
  const day = (d) => runs.filter((r) => r.startedAt >= today0 - d * DAY && r.startedAt < today0 - (d - 1) * DAY).length;
  const last30 = runs.filter((r) => r.startedAt >= t - 30 * DAY);
  const done = last30.filter((r) => r.status === 'live');
  const sorted = done.map((r) => r.total).sort((a, b) => a - b);
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
  const stageMedian = STAGES.map(([key, label], i) => {
    const v = done.map((r) => r.stages[i].ms).sort((a, b) => a - b);
    return { key, label: key === 'search' ? 'Search index' : key === 'wizard' ? 'Wizard hand-off' : label, ms: v.length ? v[Math.floor(v.length / 2)] : STAGES[i][2] };
  });
  const failed = runs.filter((r) => r.status === 'failed');
  return {
    runs: runs.slice(0, 8), all: runs,
    kpis: { today: day(0), todayDelta: day(0) - day(1), median, failed: failed.length, failedWhy: failed[0] ? (failed[0].failedAt === 'domain' ? 'Domain name taken' : 'Stopped') : 'none', success: last30.length ? (((last30.length - failed.length) / last30.length) * 100).toFixed(1) : '100.0', retried: last30.filter((r) => r.retried).length, n30: last30.length },
    stageMedian, failedRun: failed[0] || null,
    daily: Array.from({ length: 14 }, (_, i) => { const d0 = today0 - (13 - i) * DAY; const rs = done.filter((r) => r.startedAt >= d0 && r.startedAt < d0 + DAY).map((r) => r.total).sort((a, b) => a - b); return { t: d0, v: rs.length ? rs[Math.floor(rs.length / 2)] / 1000 : null }; }),
  };
}

// ---- Plans -----------------------------------------------------------------------------------------------------
export function plans(db, t, ladderId) {
  const ladder = db.plans[ladderId];
  const live = ladder.versions.find((v) => v.v === ladder.live);
  const subs = Object.values(db.subs).filter((s) => s.ladder === ladderId && isLiveStore(subState(db, s.shopId, t)));
  const counts = {};
  for (const s of subs) counts[s.plan] = (counts[s.plan] || 0) + 1;
  const older = subs.filter((s) => s.version < ladder.live).length;
  const tabs = ['online', 'retail', 'wholesale'].map((id) => ({ id, label: ladderLabel(id) + ' ladder', n: Object.values(db.subs).filter((s) => s.ladder === id && isLiveStore(subState(db, s.shopId, t))).length }));
  const setRows = SETS.filter((s) => !['service'].includes(s.id) && (!s.ladder || s.ladder === ladderId)).map((s) => ({ id: s.id, label: s.label, cells: ['growth', 'business', 'enterprise'].map((p) => live.plans[p].sets[s.id] || (s.id === 'credits' ? 'Add-on' : 'Included')) }));
  const limitRows = LIMIT_KEYS.slice(0, 6).map(([k, label]) => ({ k, label, cells: ['growth', 'business', 'enterprise'].map((p) => { const v = live.plans[p].limits[k]; return v >= UNLIMITED ? 'Unlimited' : k === 'storage' ? v + ' GB' : num(v); }) }));
  const drafts = db.planDrafts.filter((d) => d.ladder === ladderId && d.status !== 'approved');
  return { ladder, live, counts, older, tabs, setRows, limitRows, drafts, liveFrom: dmy(live.liveFrom) };
}

export { ago, dmy, dm, hm, taka, num, initials, lastSeen, monthOf, monthLong, periodOf };
export { priceOf, itemName, billItems, outcomeLabel };
