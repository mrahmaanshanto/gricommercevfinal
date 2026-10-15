// deliveryRates — the one place delivery charges and the advance rule come from (ON-U7). Settings › Delivery
// (/set-delivery, form 'delivery') sets each zone's charge, extra per unit after the first and delivery time; Settings ›
// Payment Gateway (/set-payments, form 'payments') sets the advance percentage. Create order, the order link page, the
// storefront checkout, the merchant app, the online order reports, the live demo orders and the Shipping & delivery
// store page all read them here, so a change in Settings shows everywhere.
//
//   deliveryRates({ pickup })   [{ id 'dhaka'|'sub'|'outside'|'pickup', k 'in'|'sub'|'out', label, fee, extra, time, note }]
//   DEFAULT_RATES               the same with the settings' defaults (first render, before the browser's settings are read)
//   rateOf(idOrLabel)           one rate by id ('dhaka'), checkout key ('in') or label ('Inside Dhaka')
//   feeFor(idOrLabel, units)    charge + extra per unit after the first
//   zoneFee(label)              the zone's charge (0 for an unknown zone)
//   deliveryTable()             rows for the Shipping & delivery page: [label, '৳70', '1–2 days']
//   advancePercent()            Payment setup's advance percentage (20 by default)
//   advanceFor(order)           the advance to ask by default: that share of the order's products (at least ৳1)
// Front end only: read from this browser's saved settings (lib/settingsStore.js).

import { settingValue } from './settingsStore';

// id · checkout key · settings prefix · label · charge · extra per unit · days from · days to · areas note
const ZONES = [
  ['dhaka', 'in', 'inside_dhaka', 'Inside Dhaka', 70, 10, 1, 2, ''],
  ['sub', 'sub', 'sub_dhaka', 'Sub-Dhaka', 110, 15, 2, 3, 'Savar, Gazipur, Narayanganj'],
  ['outside', 'out', 'outside_dhaka', 'Outside Dhaka', 150, 20, 3, 5, ''],
];
export const PICKUP_RATE = { id: 'pickup', k: 'pickup', label: 'Shop pickup', fee: 0, extra: 0, time: '', note: 'Customer collects from the shop' };
const num = (v, d) => { const n = parseFloat(String(v == null ? '' : v).replace(/,/g, '')); return Number.isFinite(n) ? n : d; };
const make = (z, get) => {
  const [id, k, pre, label, fee, extra, from, to, areas] = z;
  const unit = String(get(pre + '_delivery_time_unit', 'Days')).toLowerCase();
  const time = get(pre + '_delivery_time', String(from)) + '–' + get(pre + '_delivery_time_to', String(to)) + ' ' + unit;
  return { id, k, label, fee: num(get(pre + '_delivery_charge', fee), fee), extra: num(get(pre + '_extra_per_unit', extra), extra), time, note: (areas ? areas + ' · ' : '') + time };
};

/** The rates with the settings' defaults (what the server renders). */
export const DEFAULT_RATES = [...ZONES.map((z) => make(z, (n, d) => d)), PICKUP_RATE];

/** The rates saved in Settings › Delivery (Shop pickup last unless pickup: false). */
export function deliveryRates({ pickup = true } = {}) {
  const get = (n, d) => (typeof window === 'undefined' ? d : settingValue('delivery', n, d));
  const list = ZONES.map((z) => make(z, get));
  return pickup ? [...list, PICKUP_RATE] : list;
}

/** One rate by id, checkout key or label (null when unknown). */
export function rateOf(key, list = deliveryRates()) {
  const k = String(key || '');
  return list.find((r) => r.id === k || r.k === k || r.label === k) || null;
}
/** The charge for a parcel of `units` pieces: the zone's charge plus its extra per unit after the first. */
export function feeFor(key, units = 1, list) {
  const r = rateOf(key, list);
  return r ? r.fee + r.extra * Math.max(0, (Number(units) || 1) - 1) : 0;
}
/** The zone's charge (0 for an unknown zone). */
export const zoneFee = (label) => (rateOf(label) || { fee: 0 }).fee;
/** Rows for the store's Shipping & delivery page. */
export const deliveryTable = () => deliveryRates({ pickup: false }).map((r) => [r.label, '৳' + Math.round(r.fee).toLocaleString('en-IN'), r.time]);

/** Payment setup's advance percentage (Settings › Payment Gateway › Advance percentage), 20 by default. */
export function advancePercent() {
  const v = typeof window === 'undefined' ? '20%' : settingValue('payments', 'advance_percentage', '20%');
  const n = parseFloat(String(v).replace('%', ''));
  return n > 0 && n < 100 ? n : 20;
}
/** The advance to ask by default: the advance percentage of the order's products, never above what is still due. */
export function advanceFor(o) {
  const base = Number(o && (o.subtotal != null ? o.subtotal : o.amount)) || 0;
  const due = Math.max(0, (Number(o && o.amount) || 0) - (Number(o && o.paid) || 0));
  const want = Math.max(1, Math.round(base * advancePercent() / 100));
  return due > 1 ? Math.min(want, due - 1) : want;
}
