// customerSignals — customer features and signals (brief #13, Recovery & customer intelligence).
// Features are figures worked out from a customer's history, with the time they were worked out ("as of") and the
// window they cover: recency, frequency, spend, average order, return rate, usual gap between orders, open carts.
// Signals are judgements built on the features, each with the rule or model and its version, when it was made,
// until when it holds, and "Not enough data" when the history is too short to say:
//   churn      Normal · Watch · At risk          rule  churn-rule v1.2   (needs 2+ orders)
//   vip        Low · Medium · High (likelihood)  model vip-score v0.9  (needs 1+ order)
//   nextOrder  a date window                     rule  next-order v1.0   (needs 2+ orders)
//   history    Normal history · Review recommended · Not enough history  rule history v1.1 (needs 3+ orders);
//              never "no risk": no bad news is not proof of good.
// Signals are derived: they never change orders or the customer. They are kept as snapshots (gc.crm.signals) for as
// long as Customer settings › Data kept says (crmPrivacy.js), and a model change makes new snapshots.

import { daysSince } from './crm';

export const SIGNALS_KEY = 'gc.crm.signals';
const DAY = 24 * 60 * 60 * 1000;
export const WINDOW_DAYS = 365;
export const VALID_HOURS = 24;
export const MODELS = {
  churn: { id: 'churn-rule', version: '1.2', kind: 'Rule', label: 'Churn risk', minOrders: 2 },
  vip: { id: 'vip-score', version: '0.9', kind: 'Model', label: 'VIP likelihood', minOrders: 1 },
  nextOrder: { id: 'next-order', version: '1.0', kind: 'Rule', label: 'Next order', minOrders: 2 },
  history: { id: 'history', version: '1.1', kind: 'Rule', label: 'Order history', minOrders: 3 },
};
export const SIGNAL_TONE = { Normal: 'success', Watch: 'warning', 'At risk': 'error', Low: 'neutral', Medium: 'info', High: 'success', 'Normal history': 'success', 'Review recommended': 'warning' };
export const NOT_ENOUGH = 'Not enough data';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const short = (t) => { const d = new Date(t); return d.getDate() + ' ' + MONTHS[d.getMonth()]; };

/** Features of one customer row (crm.js). */
export function featuresOf(c, now = Date.now()) {
  const recency = daysSince(c.lastAt, now);
  const tenure = Math.max(1, daysSince(c.signupAt || c.lastAt, now) || 1);
  const orders = c.orders || 0;
  const span = c.signupAt && c.lastAt ? Math.max(1, (c.lastAt - c.signupAt) / DAY) : tenure;
  return {
    asOf: now, window: WINDOW_DAYS, from: now - WINDOW_DAYS * DAY,
    recencyDays: recency, frequency: orders, spend: c.spent || 0, aov: orders ? Math.round((c.spent || 0) / orders) : 0,
    returnRate: orders ? (c.returns || 0) / orders : 0, returns: c.returns || 0, tenureDays: tenure,
    gapDays: orders >= 2 ? Math.max(7, Math.round(span / (orders - 1))) : null, openCarts: c.openCarts || 0,
    source: c.origin === 'book' ? 'Invoices and sales' : 'Orders (demo history)',
  };
}

function signal(type, value, f, explanation, extra) {
  const m = MODELS[type];
  return { type, label: m.label, value, model: m.id + ' v' + m.version, modelKind: m.kind, generatedAt: f.asOf, validUntil: f.asOf + VALID_HOURS * 3600 * 1000,
    window: f.window, sufficient: value !== NOT_ENOUGH, explanation, ...(extra || {}) };
}
/** The four signals of one customer row, worked out now. */
export function computeSignals(c, now = Date.now()) {
  const f = featuresOf(c, now);
  const out = {};
  // churn: how long since the last order compared with their usual gap
  if (f.frequency < MODELS.churn.minOrders || f.recencyDays == null) out.churn = signal('churn', NOT_ENOUGH, f, 'Needs at least 2 orders to know their usual gap.');
  else {
    const ratio = f.recencyDays / Math.max(14, f.gapDays);
    const v = ratio < 1.5 ? 'Normal' : ratio < 3 ? 'Watch' : 'At risk';
    out.churn = signal('churn', v, f, 'Last order ' + f.recencyDays + ' days ago; usually orders every ' + f.gapDays + ' days.', { score: Math.round(Math.min(1, ratio / 4) * 100) / 100 });
  }
  // VIP likelihood: spend, orders and few returns
  if (f.frequency < MODELS.vip.minOrders) out.vip = signal('vip', NOT_ENOUGH, f, 'No orders yet.');
  else {
    const score = Math.min(1, f.spend / 150000) * 0.6 + Math.min(1, f.frequency / 20) * 0.3 + (f.returnRate < 0.1 ? 0.1 : 0);
    const v = score >= 0.55 ? 'High' : score >= 0.25 ? 'Medium' : 'Low';
    out.vip = signal('vip', v, f, f.frequency + ' orders, ৳' + f.spend.toLocaleString('en-IN') + ' spent, ' + Math.round(f.returnRate * 100) + '% returned.', { score: Math.round(score * 100) / 100 });
  }
  // next order: last order + their usual gap
  if (f.frequency < MODELS.nextOrder.minOrders || !c.lastAt) out.nextOrder = signal('nextOrder', NOT_ENOUGH, f, 'Needs at least 2 orders.');
  else {
    let from = c.lastAt + f.gapDays * 0.75 * DAY, to = c.lastAt + f.gapDays * 1.25 * DAY;
    const late = to < now;
    if (late) { from = now; to = now + 7 * DAY; }
    out.nextOrder = signal('nextOrder', short(from) + ' – ' + short(to), f, late ? 'Past their usual gap; could order any day.' : 'About ' + f.gapDays + ' days after the last order.', { from, to, late });
  }
  // order history: returns and refusals, only with enough orders
  if (f.frequency < MODELS.history.minOrders) out.history = signal('history', NOT_ENOUGH, f, 'Fewer than 3 orders. No history is not proof of anything.');
  else {
    const v = f.returnRate >= 0.25 ? 'Review recommended' : 'Normal history';
    out.history = signal('history', v, f, f.returns + ' of ' + f.frequency + ' orders returned (' + Math.round(f.returnRate * 100) + '%).');
  }
  return { features: f, signals: out, generatedAt: now };
}

const ssr = () => typeof window === 'undefined';
function readSnaps() { if (ssr()) return {}; try { return JSON.parse(window.localStorage.getItem(SIGNALS_KEY)) || {}; } catch { return {}; } }
function writeSnaps(v) { try { window.localStorage.setItem(SIGNALS_KEY, JSON.stringify(v)); } catch { /* storage blocked */ } }
const versionTag = () => Object.keys(MODELS).map((k) => MODELS[k].id + '@' + MODELS[k].version).join(',');
/**
 * Signals of one customer row: the stored snapshot while it is valid (same model versions), else a new one.
 * → { features, signals, generatedAt, fresh }
 */
export function signalsOf(c, now = Date.now()) {
  if (!c || !c.id) return null;
  const all = readSnaps();
  const snaps = all[c.id] || [];
  const top = snaps[0];
  if (top && top.models === versionTag() && top.generatedAt + VALID_HOURS * 3600 * 1000 > now) return { ...top, fresh: false };
  const next = { ...computeSignals(c, now), models: versionTag() };
  if (!ssr()) { all[c.id] = [next, ...snaps].slice(0, 5); writeSnaps(all); }
  return { ...next, fresh: true };
}
/** Signals for a list without storing them (lists, segments). */
export const quickSignals = (c, now = Date.now()) => computeSignals(c, now).signals;
/** Drop snapshots older than `days`. → how many went. */
export function purgeSnapshots(days, now = Date.now()) {
  const all = readSnaps(); let n = 0;
  Object.keys(all).forEach((id) => { const keep = all[id].filter((s) => now - s.generatedAt <= days * DAY); n += all[id].length - keep.length; if (keep.length) all[id] = keep; else delete all[id]; });
  writeSnaps(all);
  return n;
}
export function forgetSignals(id) { const all = readSnaps(); const had = !!all[id]; delete all[id]; writeSnaps(all); return had; }
export const snapshotCount = () => Object.values(readSnaps()).reduce((a, l) => a + l.length, 0);
