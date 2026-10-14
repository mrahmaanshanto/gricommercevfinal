// personalCoupons — one-time coupon codes made for named customers (Customers › Assign coupon, and the customer page).
// Each code is an offer in promotions.js limited to one customer (conditions.customer 'one' + customerKey), one use,
// for a set number of days, so the POS register, Create order and the checkout accept it only for that customer. The
// codes show in Marketing › Coupons like any other. Telling the customer goes through Communications (messaging.js),
// which checks consent: a customer who said no is left out and the result says so.
//
//   COUPON_KINDS · COUPON_DAYS · TELL_BY
//   makePersonalCoupons(customers, { kind, days, tell, by })   customers = [{ id, name, phone, phones? }] → { made: [{ name, code, status }], failed: [{ name, reason }],
//                                                               told, notTold }
//   personalCouponsOf(customer) → [{ id, code, label, made, ends, state: 'Unused' | 'Used' | 'Expired' | 'Paused' }]
// Front end only: kept in this browser with the other offers.

import { saveOffer, getOffers, lifecycleOf } from './promotions';
import { customerKey } from './customerRef';
import { clockNow } from './settlements';
import { send } from './messaging';

const DAY = 864e5;
export const COUPON_KINDS = [
  { k: 'pct10', label: '10% off, up to ৳300', type: 'percent', reward: { value: 10, cap: 300 }, offer: '10% off' },
  { k: 'tk100', label: '৳100 off', type: 'amount', reward: { value: 100 }, offer: '৳100 off' },
  { k: 'tk200', label: '৳200 off', type: 'amount', reward: { value: 200 }, offer: '৳200 off' },
  { k: 'ship', label: 'Free delivery', type: 'free-delivery', reward: {}, offer: 'free delivery' },
];
export const COUPON_DAYS = [3, 7, 14, 30];
export const TELL_BY = [['sms', 'SMS'], ['whatsapp', 'WhatsApp'], ['none', 'Don’t send a message']];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dm = (t) => { const d = new Date(t); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); };
const ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** A code like NUSR7K2Q: up to four letters of the name and four random ones, not used by another offer. */
function codeFor(name, taken) {
  const head = String(name || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'GIFT';
  for (let n = 0; n < 50; n += 1) {
    let tail = '';
    for (let i = 0; i < 4; i += 1) tail += ABC[Math.floor(Math.random() * ABC.length)];
    if (!taken.has(head + tail)) return head + tail;
  }
  return head + Date.now().toString(36).toUpperCase().slice(-6);
}
const keyOf = (c) => customerKey(c && c.id ? { id: c.id, phone: c.phone } : c && c.phone);
const digits = (p) => String(p || '').replace(/\D/g, '').replace(/^88/, '');
/** 'P:01…' keys for every full mobile number of the customer (phone, phones), so the POS finds the code by number too. */
const phoneKeys = (c) => [...new Set([c.phone, ...(c.phones || [])].map(digits).filter((d) => /^01[3-9]\d{8}$/.test(d)))].map((d) => 'P:' + d);

/** Make one code per customer. customers = [{ id, name, phone, phones? }]. */
export function makePersonalCoupons(customers, { kind = 'pct10', days = 7, tell = 'none', by = 'Staff' } = {}) {
  const k = COUPON_KINDS.find((x) => x.k === kind) || COUPON_KINDS[0];
  const taken = new Set(getOffers().map((o) => o.code).filter(Boolean));
  const start = clockNow() - 60000;
  const end = start + days * DAY;
  const out = { made: [], failed: [], told: 0, notTold: 0, reasons: {} };
  (customers || []).forEach((c) => {
    const key = keyOf(c);
    if (!key) { out.failed.push({ name: c.name, reason: 'No customer ID or phone' }); return; }
    const code = codeFor(c.name, taken);
    taken.add(code);
    const r = saveOffer({
      name: code + ' — ' + k.label + ' for ' + c.name, code, activation: 'code', type: k.type, reward: k.reward,
      conditions: { customer: 'one', customerKey: key, customerKeys: phoneKeys(c) }, limits: { total: 1, perCustomer: 1 },
      schedule: { start, end, days: null, hours: null }, status: 'active', personal: { customerId: c.id || '', name: c.name, phone: c.phone || '' },
    }, by);
    if (r.error) { out.failed.push({ name: c.name, reason: r.error }); return; }
    const row = { name: c.name, code, status: '' };
    if (tell !== 'none') {
      const s = send({ source: 'Campaigns', event: 'Personal coupon', cls: 'Marketing', channel: tell, to: { name: c.name, phone: c.phone, customerId: c.id || '' },
        text: '{{store_name}}: Hi {{customer_name}}, here is {{offer}} just for you. Use code {{coupon_code}} by {{date}}. {{link}}',
        vars: { offer: k.offer, coupon_code: code, date: dm(end) }, ref: r.offer.id });
      row.status = s.status;
      if (s.status === 'Delivered' || s.status === 'Read' || s.status === 'Queued') out.told += 1;
      else { out.notTold += 1; const why = (s.row && s.row.reason) || s.status; out.reasons[why] = (out.reasons[why] || 0) + 1; }
    }
    out.made.push(row);
  });
  return out;
}

const STATE = { Active: 'Unused', Exhausted: 'Used', Ended: 'Expired', Paused: 'Paused', Archived: 'Expired', Scheduled: 'Unused', Draft: 'Paused' };
/** The one-customer codes made for this customer, newest first. */
export function personalCouponsOf(c) {
  const key = keyOf(c);
  if (!key) return [];
  const mine = [key, ...phoneKeys(c)];
  return getOffers().filter((o) => o.activation === 'code' && o.conditions.customer === 'one' && [o.conditions.customerKey, ...(o.conditions.customerKeys || [])].some((k) => k && mine.includes(k)))
    .map((o) => ({ id: o.id, code: o.code, label: o.name.replace(/^\S+ — /, '').replace(/ for .*$/, ''), made: o.createdAt || (o.schedule || {}).start || 0, ends: (o.schedule || {}).end || null, state: STATE[lifecycleOf(o)] || 'Unused' }))
    .sort((a, b) => b.made - a.made);
}
