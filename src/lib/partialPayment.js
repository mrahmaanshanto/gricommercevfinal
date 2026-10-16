// partialPayment — "Pay part now, the rest on delivery" (Batch C step 7). The shop sets rules in Settings › Checkout ›
// Partial payment; a cash-on-delivery order a rule matches asks the customer to pay a part online at checkout (with the
// online methods the shop picks), and the rest is the COD amount. Staff can also ask for a part payment on any order from
// its page (Request part payment): a payment link (lib/paymentLinks.js) sent by SMS, WhatsApp, email or Messenger
// (lib/messaging.js › send). It reuses what was there: the advance % of Payment setup (deliveryRates.advancePercent) is
// the default for a new % rule and for a staff request, and an order's `advance` ({ amount, state, link }) is the same
// field "Take advance + approve" uses (orderFlow.js); when the link is paid the advance is marked paid and the rest
// becomes the COD amount (paymentLinks.payLink › onLinkPaid).
//
//   partSettings() · savePartSettings(patch) · PART_DEFAULTS · RULE_KINDS · PART_METHODS
//   partFor({ lines, zone, total }) → null | { now, later, rule, text }    (what checkout asks for)
//   requestPartPayment(order, { amount, channels, by }) → { ok, link, sent[] } · PART_CHANNELS
//   onLinkPaid(order, link, amount)  (called by paymentLinks.payLink)
// Front end only (browser storage gc.partpay). The server must work the amount out again and take the payment.

import { advancePercent } from './deliveryRates';
import { createLink, linkUrl } from './paymentLinks';
import { send } from './messaging';
import { patchOrder, logOrder } from './orders';
import { formatBDT } from './format';
import { clockNow } from './settlements';

const KEY = 'gc.partpay';
export const PART_EVENT = 'gc:partpay';
const ssr = () => typeof window === 'undefined';
const read = () => { if (ssr()) return {}; try { return JSON.parse(window.localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const write = (v) => { try { window.localStorage.setItem(KEY, JSON.stringify(v)); window.dispatchEvent(new CustomEvent(PART_EVENT)); } catch { /* ignore */ } };
const r0 = (n) => Math.round(Number(n) || 0);

export const RULE_KINDS = [['zone', 'Delivery zone'], ['total', 'Order total above'], ['product', 'Products']];
export const PART_METHODS = [['bkash', 'bKash'], ['nagad', 'Nagad'], ['rocket', 'Rocket'], ['card', 'Card']];
export const PART_CHANNELS = [['sms', 'SMS'], ['whatsapp', 'WhatsApp'], ['email', 'Email'], ['facebook', 'Messenger']];

// the demo shop asks outside-Dhaka COD orders for the delivery charge, and big orders for 10%
export const PART_DEFAULTS = {
  on: true,
  methods: ['bkash', 'nagad'],
  rules: [
    { id: 'pr-1', kind: 'zone', zones: ['Outside Dhaka'], type: 'fixed', value: 150 },
    { id: 'pr-2', kind: 'total', min: 20000, type: 'percent', value: 10 },
  ],
};
export const partSettings = () => ({ ...PART_DEFAULTS, ...read() });
export function savePartSettings(patch) {
  const next = { ...partSettings(), ...patch };
  next.on = next.on !== false;
  next.methods = (next.methods || []).filter((m) => PART_METHODS.some(([k]) => k === m));
  if (!next.methods.length) next.methods = ['bkash'];
  next.rules = (next.rules || []).map((r, i) => ({
    id: r.id || 'pr-' + (Date.now() + i).toString(36),
    kind: RULE_KINDS.some(([k]) => k === r.kind) ? r.kind : 'total',
    type: r.type === 'fixed' ? 'fixed' : 'percent',
    value: Math.max(0, r.type === 'fixed' ? r0(r.value) : Math.min(100, Number(r.value) || 0)),
    zones: r.kind === 'zone' ? (r.zones || []).filter(Boolean) : undefined,
    min: r.kind === 'total' ? Math.max(0, r0(r.min)) : undefined,
    products: r.kind === 'product' ? (r.products || []).filter(Boolean) : undefined,
  })).filter((r) => r.value > 0 && (r.kind !== 'zone' || r.zones.length) && (r.kind !== 'product' || r.products.length));
  write(next);
  return next;
}
/** A new rule, its % starting from Payment setup's advance percentage. */
export const newRule = (kind = 'total') => ({ id: '', kind, type: 'percent', value: advancePercent(), zones: [], min: 10000, products: [] });

/** In words, for lists: "Outside Dhaka · ৳150" */
export function ruleText(r) {
  const amt = r.type === 'fixed' ? formatBDT(r.value) + (r.kind === 'product' ? ' a unit' : '') : r.value + '%' + (r.kind === 'product' ? ' of those items' : ' of the order');
  if (r.kind === 'zone') return `${(r.zones || []).join(', ') || 'No zone'} · ${amt}`;
  if (r.kind === 'total') return `Orders above ${formatBDT(r.min || 0)} · ${amt}`;
  return `${(r.products || []).length} product${(r.products || []).length === 1 ? '' : 's'} · ${amt}`;
}

/** What one rule asks for this cart (0 when it doesn't apply). lines: [{ productId, price, qty }] */
function askOf(r, { lines = [], zone = '', total = 0 }) {
  if (r.kind === 'zone') return (r.zones || []).includes(zone) ? (r.type === 'fixed' ? r.value : total * r.value / 100) : 0;
  if (r.kind === 'total') return total > (r.min || 0) ? (r.type === 'fixed' ? r.value : total * r.value / 100) : 0;
  const hit = lines.filter((l) => (r.products || []).includes(l.productId));
  if (!hit.length) return 0;
  return r.type === 'fixed' ? hit.reduce((a, l) => a + r.value * (Number(l.qty) || 0), 0) : hit.reduce((a, l) => a + (Number(l.price) || 0) * (Number(l.qty) || 0), 0) * r.value / 100;
}
/** The part to pay now for a cash-on-delivery cart, or null. When several rules apply, the largest part wins. */
export function partFor(cart, s = partSettings()) {
  if (!s.on || !(cart.total > 0)) return null;
  let best = null;
  (s.rules || []).forEach((r) => { const a = askOf(r, cart); if (a > 0 && (!best || a > best.now)) best = { now: a, rule: r }; });
  if (!best) return null;
  const now = Math.max(1, Math.min(r0(cart.total), r0(best.now)));
  if (now >= r0(cart.total)) return null; // asking for everything is not a part payment: the shopper pays online
  return { now, later: r0(cart.total) - now, rule: best.rule, text: `Pay ${formatBDT(now)} now, ${formatBDT(r0(cart.total) - now)} on delivery` };
}

const PART_TEXT = 'Hi {{customer_name}}, to confirm order {{order_id}} please pay {{amount}} now: {{link}} The rest, {{rest}}, is paid on delivery. – {{store_name}}';

/** Staff ask for a part payment from the order page: a payment link sent on the chosen channels. */
export function requestPartPayment(o, { amount, channels = ['sms'], by = 'Staff' } = {}) {
  const owed = Math.max(0, (Number(o.amount) || 0) - (Number(o.paid) || 0));
  const amt = r0(amount);
  if (!(amt > 0)) return { ok: false, error: 'Enter the amount to pay now.' };
  if (amt >= owed) return { ok: false, error: 'That is the whole amount. Send a payment link for the full order instead.' };
  if (!channels.length) return { ok: false, error: 'Choose how to send it.' };
  const link = createLink({ ref: o.id, refKind: 'order', customer: o.customer, phone: o.phone, amount: amt, days: 2 }, { name: by });
  if (!link) return { ok: false, error: 'The payment link could not be made.' };
  const url = linkUrl(link);
  const to = { name: o.customer, phone: o.phone, email: o.email || '', handle: o.phone };
  const vars = { order_id: o.id, amount: formatBDT(amt), rest: formatBDT(owed - amt), link: url };
  const sent = channels.map((ch) => {
    const r = send({ source: 'Orders', event: 'Part payment request', cls: 'Transactional', channel: ch, to, text: PART_TEXT, subject: `Pay ${formatBDT(amt)} to confirm order ${o.id}`, vars, ref: o.id });
    return { channel: ch, status: r && r.row ? r.row.status : r.status, reason: r && r.row ? r.row.reason || '' : '' };
  });
  patchOrder(o, { advance: { amount: amt, state: 'requested', at: clockNow(), link: link.id } });
  const ok = sent.filter((x) => !['Failed', 'Suppressed', 'Blocked', 'Skipped'].includes(x.status));
  logOrder(o.id, 'send', 'Part payment requested', `${formatBDT(amt)} · ${link.id} · ${sent.map((x) => (PART_CHANNELS.find(([k]) => k === x.channel) || [0, x.channel])[1] + (ok.includes(x) ? '' : ' (not sent)')).join(', ')}`);
  return { ok: true, link, url, sent };
}

/** A payment link was paid: when it is the order's requested advance, the advance is paid and the rest is COD. */
export function onLinkPaid(o, link, amount) {
  if (!o || !o.advance || o.advance.state !== 'requested' || (o.advance.link && o.advance.link !== link.id)) return;
  const paid = (Number(o.paid) || 0);
  const cod = Math.max(0, (Number(o.amount) || 0) - paid);
  patchOrder(o, { payment: 'Partial', codAmount: cod, advance: { ...o.advance, state: 'paid', method: 'payment link', paidAt: clockNow(), amount } });
  logOrder(o.id, 'hand-coins', 'Advance received', `${formatBDT(amount)} · COD ${formatBDT(cod)}`);
}
