// orderRules — the shop's own order settings (Orders › Order settings, /order-settings). Nayeem's Sales & Orders
// brief #4: custom statuses tied to the real states, and "Completed" worked out by a rule.
//
//   custom statuses   the shop's own labels ("Waiting for size", "Call again") — each tied to one real status
//                     (orderStatus.js). A label is a sub-status only: it never changes payment, stock, fulfilment or
//                     delivery, and it drops off by itself once the order leaves that status.
//                     customStatusOf(o) · setCustomStatus(o, id) · customStatusesFor(statusKey)
//   completion        Completed = delivered + fully paid + the return window passed (returnDays; 0 = at once).
//                     Counter sales are completed as soon as they are paid and handed over (brief: POS).
//                     Delivered stays a step: completionOf(o) says when the order completes or what it waits for.
// Kept in this browser (gc.orders.rules); the chosen sub-status lives on the order (orders.js › patchOrder).

import { patchOrder, logOrder } from './orders';
import { clockNow } from './settlements';
import { formatDate } from './format';

const KEY = 'gc.orders.rules';
const DAY = 24 * 60 * 60 * 1000;
export const RULES_EVENT = 'gc:order-rules';

/** Return windows the settings offer, in days. */
export const RETURN_WINDOWS = [0, 3, 7, 14, 30];
/** Badge colours a custom status can take: [tone, label]. */
export const CUSTOM_TONES = [['neutral', 'Grey'], ['info', 'Blue'], ['warning', 'Amber'], ['success', 'Green'], ['error', 'Red']];

const DEFAULT = {
  custom: [
    { id: 'cs-size', label: 'Waiting for size', base: 'onhold', tone: 'warning' },
    { id: 'cs-call', label: 'Call again', base: 'onhold', tone: 'info' },
    { id: 'cs-qc', label: 'Quality check', base: 'approved', tone: 'info' },
  ],
  returnDays: 7,
};

const read = () => { try { return JSON.parse(window.localStorage.getItem(KEY)) || null; } catch { return null; } };
/** { custom: [{ id, label, base, tone }], returnDays } */
export function getOrderRules() {
  const saved = typeof window === 'undefined' ? null : read();
  return { ...DEFAULT, ...(saved || {}), custom: (saved && Array.isArray(saved.custom) ? saved.custom : DEFAULT.custom).filter((c) => c && c.label) };
}
export function saveOrderRules(rules) {
  const clean = {
    returnDays: Math.max(0, Number(rules.returnDays) || 0),
    custom: (rules.custom || []).map((c) => ({ id: c.id || 'cs-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), label: String(c.label || '').trim(), base: c.base, tone: c.tone || 'neutral' })).filter((c) => c.label && c.base),
  };
  try { window.localStorage.setItem(KEY, JSON.stringify(clean)); window.dispatchEvent(new CustomEvent(RULES_EVENT)); } catch { /* ignore */ }
  return clean;
}

// ---- custom statuses ------------------------------------------------------------------------------------
export const customStatuses = (rules = getOrderRules()) => rules.custom;
/** The custom statuses that can be chosen while an order is in this status. */
export const customStatusesFor = (statusKey, rules = getOrderRules()) => rules.custom.filter((c) => c.base === statusKey);
/** The order's custom status, or null (none chosen, removed in settings, or the order moved on). */
export function customStatusOf(o, rules = getOrderRules()) {
  if (!o || !o.sub) return null;
  const c = rules.custom.find((x) => x.id === o.sub);
  return c && c.base === o.statusKey ? c : null;
}
/** Set (or clear, with '') the order's custom status. Only a label: the order's real states don't change. */
export function setCustomStatus(o, id, by = 'Staff') {
  const c = id ? getOrderRules().custom.find((x) => x.id === id) : null;
  if (id && (!c || c.base !== o.statusKey)) return false;
  patchOrder(o, { sub: c ? c.id : null });
  logOrder(o.id, 'tag', c ? 'Sub-status: ' + c.label : 'Sub-status cleared', by);
  return true;
}

// ---- completion -----------------------------------------------------------------------------------------
const COUNTER = (o) => /^(POS|Wholesale)/.test(String(o.channel || '')) || !!o.isInvoice;
/**
 * Whether the order is Completed by the rule, and if not, what it waits for:
 *   { done, at (ms, when it completed or completes), wait: '' | 'delivery' | 'payment' | 'return window', text }
 * `due` is what the customer still owes (orderStates.js passes it; worked out here when left out).
 */
export function completionOf(o, { rules = getOrderRules(), now = clockNow(), due } = {}) {
  if (!o) return { done: false, at: null, wait: 'delivery', text: '' };
  const owed = due != null ? due : o.statusKey === 'cancelled' ? 0 : Math.max(0, (Number(o.amount) || 0) - (o.paid == null ? (o.payment === 'Paid' ? Number(o.amount) || 0 : 0) : Number(o.paid) || 0));
  if (o.statusKey !== 'delivered') return { done: false, at: null, wait: 'delivery', text: 'Completes after delivery' };
  if (owed > 0) return { done: false, at: null, wait: 'payment', text: 'Completes when paid' };
  const delivered = (o.times && o.times.delivered) || o.at || now;
  const at = COUNTER(o) ? delivered : delivered + (Number(rules.returnDays) || 0) * DAY;
  if (now < at) return { done: false, at, wait: 'return window', text: 'Completes ' + formatDate(at) };
  return { done: true, at, wait: '', text: 'Completed ' + formatDate(at) };
}
