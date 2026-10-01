// notifications — SMS and email messages about an order, sent when something happens to it (event-driven).
//   EVENTS     every order event a message can go out for, with its default templates
//   VARIABLES  the {{placeholders}} a template can use
//   getNotifySettings() / saveNotifySettings()   Settings › Notifications › Order notifications
//   notify(order, event, extra)    sends what the settings turn on, once per order and event (a courier
//                                  webhook that arrives twice sends nothing the second time)
//   notificationLog(order)         the order's log: event, channel, recipient, trigger, time, status, retries
//   retryNotification(id)          sends a failed message again
// Front end only: nothing leaves the browser. A message "goes out" as a log row; an SMS to a bad number fails
// the way the real gateway would refuse it, and a customer with no email address gets no email.
// Orders the demo generates (orders.js, liveOrders.js) get the rows their past events would have sent.

import { MERCHANT } from './merchant';
import { formatBDT } from './format';

const SETTINGS_KEY = 'gc.notify.settings';
const LOG_KEY = 'gc.notify.log';
export const NOTIFY_EVENT = 'gc:notify';

const read = (key, fb) => { if (typeof window === 'undefined') return fb; try { const v = JSON.parse(window.localStorage.getItem(key)); return v == null ? fb : v; } catch { return fb; } };
const write = (key, v) => { try { window.localStorage.setItem(key, JSON.stringify(v)); window.dispatchEvent(new CustomEvent(NOTIFY_EVENT)); } catch { /* ignore */ } };

/** The placeholders a template can use, with an example for the preview. */
export const VARIABLES = [
  ['customer_name', 'Customer name', 'Nusrat Jahan'], ['order_id', 'Order number', '#136829'], ['order_total', 'Order total', '৳2,000'],
  ['paid_amount', 'Paid so far', '৳500'], ['advance_amount', 'Advance asked or paid', '৳500'], ['remaining_amount', 'Still to pay', '৳1,500'],
  ['cod_amount', 'Cash to collect on delivery', '৳1,500'], ['courier_name', 'Courier', 'Pathao'], ['tracking_id', 'Tracking ID', 'PT-4480127'],
  ['tracking_url', 'Tracking link', 'https://gridshop.com.bd/track/PT-4480127'], ['payment_link', 'Payment link', 'https://gridshop.com.bd/pay/136829'],
  ['cancel_reason', 'Why it was cancelled', 'Customer asked to cancel'], ['store_name', 'Shop name', MERCHANT.name], ['support_phone', 'Support phone', MERCHANT.phone],
];

// group · key · label · when it fires · customer on · merchant on · SMS · email text
const E = (group, key, label, when, cust, merch, sms, subject, body, note) => ({ group, key, label, when, customer: cust, merchant: merch, sms, subject, body, note: note || '' });
export const EVENTS = [
  E('New order', 'new-order', 'Order received', 'Order placed', true, true,
    '{{store_name}}: Order {{order_id}} received. Total {{order_total}}.',
    'Order {{order_id}} received', 'Hi {{customer_name}},\n\nThanks for your order {{order_id}}. We\'ll call you to confirm it.\n\n{{store_name}}'),
  E('New order', 'on-hold', 'Order on hold', 'COD order waiting for verification', false, false,
    '{{store_name}}: We\'ll call you to confirm order {{order_id}}.',
    'Order {{order_id}} on hold', 'Hi {{customer_name}},\n\nWe\'ll call you to confirm order {{order_id}}.\n\n{{store_name}}'),
  E('New order', 'payment-pending', 'Payment pending', 'Order placed with payment due', true, false,
    '{{store_name}}: Pay {{remaining_amount}} for order {{order_id}}: {{payment_link}}',
    'Payment due for {{order_id}}', 'Hi {{customer_name}},\n\nPay {{remaining_amount}} for order {{order_id}}:\n{{payment_link}}\n\n{{store_name}}'),
  E('New order', 'processing', 'Payment received', 'Order paid in full', true, false,
    '{{store_name}}: Payment of {{paid_amount}} received for order {{order_id}}.',
    'Payment received for {{order_id}}', 'Hi {{customer_name}},\n\nWe received {{paid_amount}} for order {{order_id}}.\n\n{{store_name}}'),
  E('Verification', 'verify-requested', 'Verification call', 'Auto call started', false, false,
    '{{store_name}}: We\'re calling you to confirm order {{order_id}}.', 'Confirming order {{order_id}}', 'Hi {{customer_name}},\n\nWe\'re calling you to confirm order {{order_id}}.\n\n{{store_name}}'),
  E('Verification', 'verified', 'Order verified', 'Customer confirmed on the call', false, false,
    '{{store_name}}: Thanks for confirming order {{order_id}}.', 'Order {{order_id}} confirmed', 'Hi {{customer_name}},\n\nThanks for confirming order {{order_id}}.\n\n{{store_name}}', 'Optional'),
  E('Approval', 'approved', 'Order approved', 'Order approved', true, false,
    '{{store_name}}: Order {{order_id}} confirmed. We\'re preparing it.',
    'Order {{order_id}} confirmed', 'Hi {{customer_name}},\n\nYour order {{order_id}} is confirmed. We\'re preparing it.\n\n{{store_name}}'),
  E('Approval', 'advance-requested', 'Advance requested', 'Advance asked for a COD order', true, false,
    '{{store_name}}: Pay {{advance_amount}} advance for order {{order_id}}: {{payment_link}}. Pay {{remaining_amount}} on delivery.',
    'Advance for order {{order_id}}', 'Hi {{customer_name}},\n\nPay {{advance_amount}} advance to confirm order {{order_id}}:\n{{payment_link}}\n\nOrder total: {{order_total}}\nPay on delivery: {{remaining_amount}}\n\n{{store_name}}'),
  E('Approval', 'advance-received', 'Advance received', 'Advance paid', true, true,
    '{{store_name}}: Advance of {{advance_amount}} received. Remaining: {{remaining_amount}}.',
    'Advance received for {{order_id}}', 'Hi {{customer_name}},\n\nWe received your advance of {{advance_amount}}.\nRemaining: {{remaining_amount}}\n\n{{store_name}}'),
  E('Approval', 'cancelled', 'Order cancelled', 'Order cancelled', true, true,
    '{{store_name}}: Order {{order_id}} cancelled. {{cancel_reason}}',
    'Order {{order_id}} cancelled', 'Hi {{customer_name}},\n\nYour order {{order_id}} was cancelled. {{cancel_reason}}\nQuestions? Call {{support_phone}}.\n\n{{store_name}}'),
  E('Courier', 'ready', 'Ready for courier', 'Parcel packed', false, false,
    '{{store_name}}: Order {{order_id}} is packed and ready to ship.',
    'Order {{order_id}} packed', 'Hi {{customer_name}},\n\nYour order {{order_id}} is packed and ready to ship.\n\n{{store_name}}', 'Usually internal'),
  E('Courier', 'in-transit', 'In transit', 'Sent to courier', true, false,
    '{{store_name}}: Order {{order_id}} shipped via {{courier_name}}. Track: {{tracking_url}}',
    'Order {{order_id}} is on the way', 'Hi {{customer_name}},\n\nYour order {{order_id}} is on the way.\nCourier: {{courier_name}}\nTracking ID: {{tracking_id}}\n{{tracking_url}}\n\n{{store_name}}'),
  E('Delivery', 'out-for-delivery', 'Out for delivery', 'Courier out for delivery', true, false,
    '{{store_name}}: Order {{order_id}} arrives today. Please keep {{cod_amount}} ready.',
    'Order {{order_id}} arrives today', 'Hi {{customer_name}},\n\nYour order {{order_id}} arrives today.\nPay on delivery: {{cod_amount}}\n\n{{store_name}}', 'If the courier sends it'),
  E('Delivery', 'delivered', 'Delivered', 'Courier confirmed delivery', true, false,
    '{{store_name}}: Order {{order_id}} delivered. Thank you for shopping with us.',
    'Order {{order_id}} delivered', 'Hi {{customer_name}},\n\nYour order {{order_id}} was delivered. Thank you for shopping with us.\n\n{{store_name}}'),
  E('Delivery', 'delivery-failed', 'Delivery failed', 'Courier could not deliver', true, true,
    '{{store_name}}: We couldn\'t deliver order {{order_id}}. Call {{support_phone}}.',
    'Delivery failed for {{order_id}}', 'Hi {{customer_name}},\n\nWe couldn\'t deliver order {{order_id}} today. Call {{support_phone}} to rearrange.\n\n{{store_name}}'),
  E('Returns', 'return-initiated', 'Return started', 'Courier started the return', false, true,
    'Order {{order_id}} is being returned.', 'Order {{order_id}} return started', 'Order {{order_id}} ({{customer_name}}) is being returned by {{courier_name}}.'),
  E('Returns', 'returning', 'Returning', 'Parcel on its way back', false, false,
    'Order {{order_id}} is on its way back.', 'Order {{order_id}} returning', 'Order {{order_id}} is on its way back.'),
  E('Returns', 'returned', 'Returned', 'Parcel back at the shop', false, true,
    'Order {{order_id}} is back. Check it into stock.', 'Order {{order_id}} returned', 'Order {{order_id}} ({{customer_name}}) is back. Check it into stock.'),
];
export const eventBy = (key) => EVENTS.find((e) => e.key === key) || null;
/** The merchant's own message for an event (customers get the event's text; the shop gets this). */
const MERCHANT_SMS = {
  'new-order': 'New order {{order_id}} from {{customer_name}}. {{order_total}}.',
  'advance-received': 'Advance {{advance_amount}} received for {{order_id}}.',
  cancelled: 'Order {{order_id}} cancelled. {{cancel_reason}}',
  'delivery-failed': 'Delivery failed: {{order_id}} ({{courier_name}}).',
  'return-initiated': 'Return started: {{order_id}} ({{courier_name}}).',
  returned: 'Order {{order_id}} is back.',
};

// ---- settings --------------------------------------------------------------------------------------------
const defaults = () => ({
  senderName: MERCHANT.name, emailFrom: MERCHANT.name, replyTo: 'support@gridshop.com.bd',
  adminPhone: '01700-000000', adminEmail: 'orders@gridshop.com.bd',
  events: Object.fromEntries(EVENTS.map((e) => [e.key, { sms: e.customer || e.merchant, email: e.customer || e.merchant, customer: e.customer, merchant: e.merchant, smsText: e.sms, subject: e.subject, body: e.body, merchantText: MERCHANT_SMS[e.key] || '' }])),
});
export function getNotifySettings() {
  const d = defaults();
  const s = read(SETTINGS_KEY, {});
  return { ...d, ...s, events: Object.fromEntries(EVENTS.map((e) => [e.key, { ...d.events[e.key], ...((s.events || {})[e.key] || {}) }])) };
}
export const saveNotifySettings = (s) => write(SETTINGS_KEY, s);
export const defaultTemplate = (key) => defaults().events[key];

// ---- templates ------------------------------------------------------------------------------------------
const money = (n) => formatBDT(Math.round(Number(n) || 0));
/** The values the placeholders take for an order (and the event's extras). */
export function varsOf(o, extra = {}) {
  const paid = Number(o.paid) || 0;
  const remaining = Math.max(0, (Number(o.amount) || 0) - paid);
  const id = String(o.consignment && o.consignment !== '—' ? o.consignment : extra.trackingId || '');
  return {
    customer_name: o.customer || 'Customer', order_id: o.id, order_total: money(o.amount), paid_amount: money(paid),
    advance_amount: money(extra.advance != null ? extra.advance : (o.advance && o.advance.amount) || 0),
    remaining_amount: money(extra.remaining != null ? extra.remaining : remaining), cod_amount: money(o.codAmount != null ? o.codAmount : remaining),
    courier_name: (o.courier && o.courier !== 'Not assigned' ? o.courier : extra.courier) || 'the courier', tracking_id: id || '—',
    tracking_url: o.trackingUrl || (id ? 'https://gridshop.com.bd/track/' + id : ''), payment_link: 'https://gridshop.com.bd/pay/' + String(o.id).replace('#', ''),
    cancel_reason: extra.reason ? `${extra.reason}.` : '', store_name: MERCHANT.name, support_phone: MERCHANT.phone,
    ...(extra.vars || {}),
  };
}
/** Fill a template's {{placeholders}}; an unknown one stays as it is. */
export const fill = (text, vars) => String(text || '').replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
/** SMS parts: 160 characters a part in English, 70 when the text has Bangla (or other non-GSM) letters. */
export function smsParts(text) {
  const t = String(text || '');
  const unicode = /[^\x00-\x7F৳]/.test(t.replace(/৳/g, ''));
  const per = unicode ? 70 : 160;
  return { chars: t.length, parts: Math.max(1, Math.ceil(t.length / per)), per, unicode };
}

// ---- sending ------------------------------------------------------------------------------------------------
const digits = (p) => String(p || '').replace(/\D/g, '').replace(/^88/, '');
const hash = (s) => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 1000003; return h; };
/** What a gateway does with one message: delivered, refused (bad number) or not sent (no address). */
function outcome(channel, to, key) {
  if (channel === 'SMS') {
    if (!/^01[3-9]\d{8}$/.test(digits(to))) return { status: 'Failed', error: 'Not a Bangladeshi mobile number' };
    return hash(key) % 17 === 0 ? { status: 'Failed', error: 'The SMS gateway did not accept the message' } : { status: 'Delivered' };
  }
  if (!to) return { status: 'Skipped', error: 'No email address' };
  return { status: 'Delivered' };
}
const getLog = () => read(LOG_KEY, []);

/**
 * Send what the settings turn on for this event. Each order gets one round per event (and `extra.once`,
 * e.g. a courier's event id): repeating the same event — a webhook delivered twice — sends nothing.
 * Returns { sent: n, duplicate: bool }.
 */
export function notify(o, event, extra = {}) {
  if (typeof window === 'undefined' || !o) return { sent: 0, duplicate: false };
  const ev = eventBy(event);
  if (!ev) return { sent: 0, duplicate: false };
  const once = `${o.id}|${event}|${extra.once || ''}`;
  const log = getLog();
  if (log.some((r) => r.once === once) || synthLog(o).some((r) => r.event === event)) return { sent: 0, duplicate: true };
  const s = getNotifySettings();
  const t = s.events[event];
  const vars = varsOf(o, extra);
  const at = extra.at || Date.now();
  const rows = [];
  const add = (recipient, channel, to, text, subject) => {
    const id = 'NT-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    rows.push({ id, once, order: o.id, event, label: ev.label, trigger: extra.trigger || ev.when, recipient, channel, to, text, subject: subject || '', at, retries: 0, ...outcome(channel, to, id + to) });
  };
  const toCustomer = t.customer && !extra.noCustomer;
  if (toCustomer && t.sms) add('Customer', 'SMS', o.phone, fill(t.smsText, vars));
  if (toCustomer && t.email && o.email) add('Customer', 'Email', o.email, fill(t.body, vars), fill(t.subject, vars));   // most orders have a phone only
  if (t.merchant && t.sms) add('Shop', 'SMS', s.adminPhone, fill(t.merchantText || t.smsText, vars));
  if (t.merchant && t.email) add('Shop', 'Email', s.adminEmail, fill(t.merchantText || t.body, vars), fill(t.subject, vars));
  // nothing turned on: the event is still marked, so a repeat stays a repeat
  write(LOG_KEY, [...(rows.length ? rows : [{ id: 'NT-' + Date.now().toString(36), once, order: o.id, event, label: ev.label, trigger: extra.trigger || ev.when, recipient: '', channel: '', to: '', text: '', at, retries: 0, status: 'Off', quiet: true }]), ...log].slice(0, 3000));
  return { sent: rows.length, duplicate: false };
}

/** Send a failed message again (the demo gateway takes it the second time). */
export function retryNotification(id) {
  const log = getLog();
  const row = log.find((r) => r.id === id);
  if (!row) return null;
  const next = { ...row, retries: (row.retries || 0) + 1, lastTry: Date.now(), ...(row.channel === 'SMS' && /^01[3-9]\d{8}$/.test(digits(row.to)) ? { status: 'Delivered', error: '' } : {}) };
  write(LOG_KEY, log.map((r) => (r.id === id ? next : r)));
  return next;
}

// ---- the log ------------------------------------------------------------------------------------------------
// what the demo's own orders would have sent, from the times their events happened
const TIME_EVENTS = [['placed', 'new-order'], ['approved', 'approved'], ['shipped', 'in-transit'], ['delivered', 'delivered'], ['returned', 'returned'], ['cancelled', 'cancelled']];
function synthLog(o) {
  if (!o || o.made || !o.times || /^(POS|Wholesale)/.test(String(o.channel || '')) || o.isInvoice) return [];
  const s = getNotifySettings();
  const out = [];
  TIME_EVENTS.forEach(([k, event]) => {
    const at = o.times[k];
    if (!at) return;
    const t = s.events[event];
    const ev = eventBy(event);
    const vars = varsOf(o);
    const base = { order: o.id, event, label: ev.label, trigger: ev.when, at: at + 60 * 1000, retries: 0, demo: true };
    if (t.customer && t.sms) out.push({ ...base, id: `${o.id}-${event}-cs`, recipient: 'Customer', channel: 'SMS', to: o.phone, text: fill(t.smsText, vars), ...outcome('SMS', o.phone, o.id + event) });
    if (t.customer && t.email && o.email) out.push({ ...base, id: `${o.id}-${event}-ce`, recipient: 'Customer', channel: 'Email', to: o.email, text: fill(t.body, vars), subject: fill(t.subject, vars), ...outcome('Email', o.email, '') });
    if (t.merchant && t.sms) out.push({ ...base, id: `${o.id}-${event}-ms`, recipient: 'Shop', channel: 'SMS', to: s.adminPhone, text: fill(t.merchantText || t.smsText, vars), status: 'Delivered' });
  });
  return out;
}
/** Every message for an order, newest first. */
export function notificationLog(o) {
  if (!o) return [];
  const mine = getLog().filter((r) => r.order === o.id && !r.quiet);
  const done = new Set(mine.map((r) => r.event));
  return [...mine, ...synthLog(o).filter((r) => !done.has(r.event))].sort((a, b) => b.at - a.at);
}
