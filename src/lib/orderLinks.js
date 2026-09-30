// Order links and hand-made orders, kept in this browser (the app has no backend).
//   merchant: createOrderLink(draft) -> id -> /order-link?id=<id>
//   customer: getOrderLink(id), then submitLinkOrder(id, form) -> the order shows in Orders as Pending
// addOrder() is also used by the Create order page, so a new order appears in the list.

import { formatBDT } from './format';

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

/** Adds an order row (the shape the orders list uses) and returns it. The lines are kept so the
 *  order page can show them: [{ name, qty, price, variant }]. */
export function addOrder({ lines, customer, phone, zone, total, status = 'Pending', payment = 'COD', channel = 'Manual order', address = '', shipping = 0 }) {
  const list = read(ORDERS, []);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const now = new Date();
  const row = {
    id: '#' + (136813 + list.length),
    at: now.getTime(), placed: stamp(now), channel, customer, address, shipping,
    lines: lines.map((l) => ({ name: l.name, qty: l.qty, price: l.price, variant: l.variant || l.meta || '' })),
    initials: customer.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase(),
    phone, zone,
    itemTitle: lines[0].name + (lines.length > 1 ? ` + ${lines.length - 1} more` : ''),
    itemMeta: `${count} item${count > 1 ? 's' : ''} · ${formatBDT(lines.reduce((s, l) => s + l.price * l.qty, 0))}`,
    courier: 'Not assigned', consignment: '—', status, payment, total: formatBDT(total),
  };
  write(ORDERS, [row, ...list]);
  return row;
}

/** Change an order made in this browser, for example when its invoice is paid. */
export function updateOrder(id, patch) {
  write(ORDERS, read(ORDERS, []).map((o) => (o.id === id ? { ...o, ...patch } : o)));
}

/** Orders created in this browser, newest first. */
export function extraOrders() {
  return typeof window === 'undefined' ? [] : read(ORDERS, []);
}

/** The customer's answer to an order link: becomes a Pending order and closes the link. */
export function submitLinkOrder(id, form) {
  const links = read(LINKS, {});
  const link = links[id];
  const rate = DELIVERY_RATES.find((r) => r.id === form.area) || DELIVERY_RATES[0];
  const row = addOrder({
    lines: form.lines, customer: form.name, phone: prettyPhone(form.phone), zone: rate.label,
    total: form.total, status: 'Pending', payment: form.terms === 'cod' ? 'COD' : 'Unpaid', channel: 'Order link', address: form.address || '', shipping: rate.fee,
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
