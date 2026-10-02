// Order links and hand-made orders, kept in this browser (the app has no backend).
//   merchant: createOrderLink(draft) -> id -> /order-link?id=<id>
//   customer: getOrderLink(id), then submitLinkOrder(id, form) -> the order shows in Orders as a new order
//   (On hold, Processing or Pending by its payment: orderStatus.js)
// addOrder() is also used by the Create order page, so a new order appears in the list.
// Each order keeps `times` (placed, approved, ready, shipped, delivered, returned, cancelled: ms or
// null), stamped when its status changes, its `source` (Website, Facebook, Phone, Order link, Chat)
// and the payment `method` it was taken with; its lines keep sku, cat and the buying price (cost).

import { formatBDT } from './format';
import { freezeLine } from './productCost';

const LINKS = 'gc.orderLinks';
const ORDERS = 'gc.extraOrders';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function read(key, fallback) {
  try { return JSON.parse(window.localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function write(key, value) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}

export const DELIVERY_RATES = [
  { id: 'dhaka', label: 'Inside Dhaka', note: '1–2 days · Pathao', fee: 70 },
  { id: 'sub', label: 'Sub-Dhaka', note: 'Savar, Gazipur, Narayanganj · 2–3 days', fee: 110 },
  { id: 'outside', label: 'Outside Dhaka', note: '3–5 days · Steadfast', fee: 150 },
  { id: 'pickup', label: 'Shop pickup', note: 'Customer collects from the shop', fee: 0 },
];

/** The label the orders list shows for each payment term. */
export const PAYMENT_LABEL = { cod: 'COD', partial: 'Partial', full: 'Paid' };

export const BD_MOBILE = /^01[3-9]\d{8}$/;
export const cleanPhone = (text) => String(text || '').replace(/[\s-]/g, '').replace(/^\+?88/, '');
export const prettyPhone = (digits) => digits.slice(0, 5) + '-' + digits.slice(5);

export function createOrderLink(draft) {
  const id = Math.random().toString(36).slice(2, 8).toUpperCase();
  const links = read(LINKS, {});
  links[id] = { ...draft, id, created: Date.now(), used: false };
  write(LINKS, links);
  return id;
}

export function getOrderLink(id) {
  return read(LINKS, {})[id] || null;
}

const stamp = (d) => {
  const h = d.getHours();
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};

/** Which time an order status stamps in `times`. */
export const STATUS_TIME = { Approved: 'approved', 'Ready for courier': 'ready', 'In transit': 'shipped', 'Ready to ship': 'ready', Shipped: 'shipped', Delivered: 'delivered', Returned: 'returned', Cancelled: 'cancelled' };
/** The payment method an order was taken with, from its payment label. */
export const METHOD_OF_PAYMENT = { COD: 'COD', Paid: 'Gateway', Partial: 'Mixed', Unpaid: 'Due' };
const isCounter = (channel) => /^(POS|Wholesale)/.test(String(channel || ''));

// ---- the line as sold (Nayeem's Sales & Orders brief #4: the order keeps what was sold) ----------------
// Each line is frozen when the order is made, so a later price, cost or product change never rewrites it:
//   { name, qty, price (final, each), listPrice (the catalogue price then), priceChanged, variant, sku, cat,
//     cost (buying price of one), productId, discount (this line's share of the order discount),
//     taxRate (%), tax (this line's VAT) }
// The order keeps discount, discountReason, vat, vatRate, note and tags beside its total.
function freezeLines(lines, discount, vat, vatRate) {
  const gross = lines.reduce((s, l) => s + (Number(l.price) || 0) * l.qty, 0);
  let leftDisc = Math.round(Number(discount) || 0), leftVat = Math.round(Number(vat) || 0);
  return lines.map((l, i) => {
    const f = freezeLine(l);
    const amount = (Number(l.price) || 0) * l.qty;
    const last = i === lines.length - 1;
    const share = gross ? amount / gross : 0;
    const disc = last ? leftDisc : Math.min(leftDisc, Math.round((Number(discount) || 0) * share));
    const tax = last ? leftVat : Math.min(leftVat, Math.round((Number(vat) || 0) * share));
    leftDisc -= disc; leftVat -= tax;
    const listPrice = l.listPrice != null && l.listPrice !== '' ? Number(l.listPrice) : Number(l.price);
    return { name: l.name, qty: l.qty, price: l.price, listPrice, priceChanged: listPrice !== Number(l.price), variant: l.variant || l.meta || '', sku: f.sku, cat: f.cat, cost: f.cost,
      productId: l.productId || '', discount: disc, taxRate: Number(vatRate) || 0, tax };
  });
}
// The same order sent twice (a double press, a slow network resending) is one order: same customer phone,
// same items and same total within DUP_MS returns the first order (marked duplicate) instead of a second one.
const DUP_MS = 20 * 1000;
const keyOf = (phone, lines, total) => [String(phone || '').replace(/\D/g, ''), Math.round(Number(total) || 0), ...lines.map((l) => `${l.sku || l.name}x${l.qty}@${l.price}`).sort()].join('|');

/** Adds an order row (the shape the orders list uses) and returns it. The lines are kept so the
 *  order page can show them (frozen as sold, see freezeLines). Returns the earlier order, marked
 *  { duplicate: true }, when the same order was just added. */
export function addOrder({ lines, customer, phone, zone, total, status = 'New', payment = 'COD', channel = 'Manual order', address = '', shipping = 0, paid, source, method, discount = 0, discountReason = '', vat = 0, vatRate = 0, note = '', tags = [] }) {
  const list = read(ORDERS, []);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const now = new Date();
  const t = now.getTime();
  // counter sales and walk-ins (no phone) are never treated as repeats: two shoppers may buy the same thing
  const guard = !isCounter(channel) && String(phone || '').replace(/\D/g, '').length >= 10;
  const key = guard ? keyOf(phone, lines, total) : '';
  const same = guard ? list.find((o) => o.key === key && t - (o.at || 0) < DUP_MS) : null;
  if (same) return { ...same, duplicate: true };
  const counter = isCounter(channel);
  const times = { placed: t, approved: null, ready: null, shipped: null, delivered: null, returned: null, cancelled: null };
  if (status === 'Approved' || status === 'Delivered') times.approved = t;
  if (STATUS_TIME[status]) times[STATUS_TIME[status]] = t;
  const row = {
    id: '#' + (136813 + list.length),
    at: t, placed: stamp(now), channel, customer, address, shipping, times,
    source: source || (counter ? '' : channel === 'Order link' ? 'Order link' : 'Phone'),
    method: method || (counter ? '' : METHOD_OF_PAYMENT[payment] || ''),
    lines: freezeLines(lines, discount, vat, vatRate), key,
    ...(discount ? { discount: Math.round(discount), discountReason: discountReason || '' } : {}),
    ...(vat ? { vat: Math.round(vat), vatRate: Number(vatRate) || 0 } : {}),
    ...(note ? { note } : {}), ...(tags && tags.length ? { tags } : {}),
    initials: customer.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase(),
    phone, zone,
    itemTitle: lines[0].name + (lines.length > 1 ? ` + ${lines.length - 1} more` : ''),
    itemMeta: `${count} item${count > 1 ? 's' : ''} · ${formatBDT(lines.reduce((s, l) => s + l.price * l.qty, 0))}`,
    courier: 'Not assigned', consignment: '—', status, payment, total: formatBDT(total),
    ...(paid != null ? { paid } : {}),
  };
  write(ORDERS, [row, ...list]);
  return row;
}

/** Change an order made in this browser, for example when its invoice is paid. A new status stamps its time. */
export function updateOrder(id, patch) {
  const now = Date.now();
  write(ORDERS, read(ORDERS, []).map((o) => {
    if (o.id !== id) return o;
    const next = { ...o, ...patch };
    const k = STATUS_TIME[patch.status];
    if (k && patch.status !== o.status) next.times = { ...(o.times || { placed: o.at || null }), ...(patch.times || {}), [k]: now };
    return next;
  }));
}

/** Orders created in this browser, newest first. */
export function extraOrders() {
  return typeof window === 'undefined' ? [] : read(ORDERS, []);
}

/** The customer's answer to an order link: becomes a new order and closes the link. */
export function submitLinkOrder(id, form) {
  const links = read(LINKS, {});
  const link = links[id];
  const rate = DELIVERY_RATES.find((r) => r.id === form.area) || DELIVERY_RATES[0];
  const row = addOrder({
    lines: form.lines, customer: form.name, phone: prettyPhone(form.phone), zone: rate.label,
    total: form.total, status: 'New', payment: form.terms === 'cod' ? 'COD' : 'Unpaid', channel: 'Order link', address: form.address || '', shipping: rate.fee,
  });
  if (link) { links[id] = { ...link, used: true, order: row.id }; write(LINKS, links); }
  return row;
}

/**
 * Courier record for a phone number: parcels sent, delivered and returned, per courier.
 * Demo figures derived from the number itself, so the same number always shows the same record.
 */
export function courierHistory(phoneText) {
  const phone = cleanPhone(phoneText);
  if (!BD_MOBILE.test(phone)) return null;
  let seed = 0;
  for (const ch of phone) seed = (seed * 31 + ch.charCodeAt(0)) % 100003;
  const pick = (mod) => { seed = (seed * 1103 + 12345) % 100003; return seed % mod; };
  if (pick(6) === 0) return { phone, total: 0, delivered: 0, returned: 0, rate: null, couriers: [] };
  const couriers = ['Pathao', 'Steadfast', 'RedX'].map((name) => {
    const total = pick(14);
    const returned = total ? Math.min(total, pick(Math.max(2, Math.ceil(total / 3)))) : 0;
    return { name, total, delivered: total - returned, returned };
  }).filter((c) => c.total > 0);
  const total = couriers.reduce((n, c) => n + c.total, 0);
  const delivered = couriers.reduce((n, c) => n + c.delivered, 0);
  return { phone, total, delivered, returned: total - delivered, rate: total ? Math.round(100 * delivered / total) : null, couriers };
}
