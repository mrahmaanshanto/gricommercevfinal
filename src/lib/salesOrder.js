// salesOrder — orders for business buyers that are not rung up at a till: a sales order taken at the office desk
// (Orders › Wholesale orders › New sales order, WH-F2) and a quote turned into an order (WH-U3). Both run the same
// checks as the POS register and make the same records, so a buyer is treated the same everywhere.
//
//   businessBuyers()           who a quote or a sales order can be for: wholesale buyers (while wholesale is on),
//                              companies, and open leads that are a business (Corporate / Wholesale / with a company)
//   buyerOfQuote(c)            the buyer row the price and credit rules read ({ id, phone, name, types, tier, kind })
//   isWholesaleBuyer(c)        buys at wholesale (wholesale must be on in the edition)
//   checkSale({ customer, lines, unpaid, place, wholesale })
//        → { ok, blocks, warnings, needPin, pinReason, lines: { [i]: { moq, free, short, moqShort } } }
//        credit limit and overdue hold (wholesalePrice.js › creditCheck), customer restrictions (restrictions.js ›
//        checkOrder), MOQ (wholesale only, a warning as at the POS) and free stock at the place (short = refused unless
//        the item may be sold out of stock)
//   makeSale({ customer, lines, discount, vatRate, note, place, by, quoteId, approvedBy, dueAt })
//        → { ok, orderId, invoiceId, route }   the order (Approved, Unpaid), the unpaid invoice and the goods held
//        at the place until the invoice's deliveries hand them over. `route` says how it was booked:
//          'wholesale'  a wholesale buyer: a wholesale invoice (Wholesale orders)
//          'retail'     any other business buyer in an edition that sells at the counter: an invoice delivered from
//                       the invoice page (challan), like a wholesale one
//          'online'     the Online edition (no counter): an approved online order that ships through the courier steps
// Front end only: everything is kept in this browser like the rest of the demo. A real shop does this on the server.

import { addOrder } from './orderLinks';
import { POS_KEYS, load, save } from './posStore';
import { addHolds } from './stockHolds';
import { freezeLine } from './productCost';
import { clockNow } from './settlements';
import { getCustomers, getDirectory, phoneDigits, PRICE_TIERS, tierOf } from './customers';
import { wholesaleOn, editionChannels, holdsStock } from './edition';
import { creditCheck, priceFor } from './wholesalePrice';
import { checkOrder } from './restrictions';
import { productBy, stockAt } from './stock';
import { getLeads, isBusinessLead, OPEN_STAGES } from './leads';
import { findOrder, takeOrderStock } from './orders';

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const money = (n) => '৳' + Math.round(n).toLocaleString('en-IN');

/** Buys at wholesale (wholesale must be on in the edition in use). */
export const isWholesaleBuyer = (c) => !!c && wholesaleOn() && (c.types || []).includes('Wholesale');

/**
 * Everyone a quote can be for, as [{ key, kind: 'wholesale' | 'company' | 'lead', name, phone, id, tier, types, leadId,
 * company, label }]. Wholesale buyers only while wholesale is on; companies and business leads always.
 */
export function businessBuyers() {
  if (typeof window === 'undefined') return [];
  const out = [];
  const seen = new Set();
  const push = (b) => { const d = phoneDigits(b.phone); if (d && seen.has(d)) return; if (d) seen.add(d); out.push(b); };
  if (wholesaleOn()) {
    getCustomers().filter((c) => (c.types || []).includes('Wholesale')).forEach((c) => push({
      key: 'w:' + c.phone, kind: 'wholesale', name: c.name, phone: c.phone, id: c.id || '', tier: c.tier || 'A', types: c.types, creditLimit: c.creditLimit || 0,
      label: c.name + ' · ' + ((tierOf(c) || PRICE_TIERS.A).label.split(' · ')[0]),
    }));
  }
  let dir = [];
  try { dir = getDirectory(); } catch { dir = []; }
  dir.filter((c) => c.kind === 'company').forEach((c) => push({
    key: 'c:' + c.id, kind: 'company', name: c.name, phone: phoneDigits(c.phone), id: c.id, tier: c.tier || '', types: c.types || [], creditLimit: c.creditLimit || 0,
    label: c.name + ' · Company',
  }));
  getLeads().filter((l) => OPEN_STAGES.includes(l.stage) && isBusinessLead(l)).forEach((l) => push({
    key: 'l:' + l.id, kind: 'lead', name: l.company ? `${l.name} · ${l.company}` : l.name, phone: phoneDigits(l.phone), id: '', leadId: l.id, company: l.company || '', types: [],
    label: (l.company || l.name) + ' · Lead ' + l.id,
  }));
  return out;
}

/** The row the price and credit rules read for a quote's buyer (a lead has no customer row yet: retail prices). */
export function buyerOfQuote(c) {
  if (!c) return null;
  if (c.kind === 'lead' || c.leadId) return null;
  return { id: c.id || '', phone: phoneDigits(c.phone), name: c.name, types: c.types || [], tier: c.tier || '', kind: c.kind === 'company' ? 'company' : 'person', creditLimit: c.creditLimit || 0 };
}
/** The price for one line for this buyer (the one price rule, wholesalePrice.js › priceFor). */
export function linePrice(c, sku, qty) {
  const b = buyerOfQuote(c);
  // priceFor itself falls back to the retail price for a buyer who is not a business buyer (or with wholesale off)
  return priceFor({ customer: b, sku, qty, channel: b ? 'wholesale' : 'retail' });
}

/** Everything that stops or slows this sale, with the line-by-line facts. */
export function checkSale({ customer, lines, unpaid = 0, place = '', wholesale = false }) {
  const out = { ok: true, blocks: [], warnings: [], needPin: false, pinReason: '', lines: {} };
  const b = buyerOfQuote(customer);
  // stock and MOQ, line by line
  const want = {};
  lines.forEach((l) => { const p = productBy(l.sku || l.name); if (p) want[p.sku] = (want[p.sku] || 0) + (Number(l.qty) || 0); });
  lines.forEach((l, i) => {
    const p = productBy(l.sku || l.name);
    const qty = Number(l.qty) || 0;
    const info = { moq: 0, free: null, short: false, moqShort: false };
    if (p) {
      info.moq = wholesale ? Number(p.moq) || 0 : 0;
      info.moqShort = info.moq > 0 && qty < info.moq;
      if (place && !['digital', 'service'].includes(p.format)) {
        info.free = stockAt(p.sku, place).available;
        info.short = want[p.sku] > info.free;
        if (info.short) {
          if (p.oversell || p.backorder) out.warnings.push(`${l.name}: only ${Math.max(0, info.free)} free at ${place}. It is ${p.oversell ? 'sold before it is in stock' : 'taken on backorder'}.`);
          else out.blocks.push(`Not enough ${l.name} at ${place}: ${Math.max(0, info.free)} free, ${want[p.sku]} needed. Lower the quantity or choose another place.`);
        }
      }
      if (info.moqShort) out.warnings.push(`${l.name}: the smallest wholesale order is ${info.moq} pcs, this is ${qty}.`);
    }
    out.lines[i] = info;
  });
  // the buyer's restrictions (blocked, credit on hold, order cap …)
  const ref = (b && (b.id || b.phone)) || phoneDigits(customer && customer.phone);
  if (ref) {
    const total = lines.reduce((s, l) => s + (Number(l.price) || 0) * (Number(l.qty) || 0), 0);
    const rc = checkOrder(ref, { amount: total, payment: unpaid > 0 ? 'credit' : '' });
    out.blocks.push(...rc.blocks);
    out.warnings.push(...rc.warnings);
  }
  // credit: the limit and the overdue hold, as at the POS
  if (unpaid > 0 && (b || phoneDigits(customer && customer.phone))) {
    const cc = creditCheck(b || phoneDigits(customer.phone), unpaid, { phone: customer && customer.phone });
    if (!cc.ok) out.blocks.push(cc.reason);
    else if (cc.needPin) { out.needPin = true; out.pinReason = cc.reason || `${customer.name} would owe ${money(cc.after)}. A manager approves leaving ${money(unpaid)} unpaid.`; }
  }
  out.ok = !out.blocks.length;
  return out;
}

/** How an order for this buyer is booked in the edition in use (see the top of the file). */
export function routeFor(customer) {
  if (isWholesaleBuyer(customer)) return 'wholesale';
  return editionChannels().includes('Retail') ? 'retail' : 'online';
}

/**
 * Book the order, the unpaid invoice and the stock. lines: [{ name, sku, qty, price, listPrice }].
 * Returns { ok, orderId, invoiceId, route } or { ok: false, error }.
 */
export function makeSale({ customer, lines, discount = 0, vatRate = 0, note = '', place, by = 'Staff', quoteId = '', approvedBy = '', dueAt, idBase, label }) {
  const rows = lines.filter((l) => Number(l.qty) > 0);
  if (!rows.length) return { ok: false, error: 'There are no items.' };
  const route = routeFor(customer);
  const gross = r2(rows.reduce((s, l) => s + (Number(l.price) || 0) * (Number(l.qty) || 0), 0));
  const disc = Math.min(gross, Math.max(0, Number(discount) || 0));
  const taxable = r2(gross - disc);
  const tax = r2(taxable * (Number(vatRate) || 0) / 100);
  const total = r2(taxable + tax);
  const units = rows.reduce((s, l) => s + (Number(l.qty) || 0), 0);
  const sales = load(POS_KEYS.sales, []);
  // a quote's invoice is SO-<quote no.>; a desk sales order numbers on as SO-D0001, SO-D0002 …
  const invoiceId = idBase || 'SO-D' + String(sales.reduce((m, x) => Math.max(m, /^SO-D\d+$/.test(x.id) ? Number(x.id.slice(4)) : 0), 0) + 1).padStart(4, '0');
  const frozen = rows.map((l, i) => ({ ...freezeLine({ name: l.name, qty: Number(l.qty), price: Number(l.price) || 0, sku: l.sku, listPrice: l.listPrice }), id: invoiceId + '-' + i, disc: 0 }));
  const from = label || (quoteId ? 'Quote ' + quoteId : 'Sales order');
  const channel = route === 'wholesale' ? 'Wholesale · ' + from : route === 'retail' ? 'POS · ' + from : 'Manual order';
  const order = addOrder({ lines: frozen, customer: customer.name, phone: customer.phone, zone: route === 'wholesale' ? 'Wholesale' : 'Business', total, status: 'Approved', payment: 'Unpaid', channel, source: quoteId ? 'Quote' : 'Phone', discount: disc, vat: tax, vatRate: Number(vatRate) || 0, note });
  if (order.duplicate) return { ok: true, orderId: order.id, invoiceId: order.invoiceId || '', route, again: true };
  const tier = route === 'wholesale' ? ((tierOf({ types: ['Wholesale'], tier: customer.tier }) || {}).label || '') : '';
  const sale = {
    id: invoiceId, orderId: order.id, ...(quoteId ? { quoteId } : {}), wholesale: route === 'wholesale', ...(route === 'retail' ? { delivers: true } : {}),
    tier, invoice: true, rev: 1, payments: [], at: clockNow(), ...(dueAt ? { dueAt } : {}), ...(approvedBy ? { approvedBy } : {}),
    lines: frozen, customer: { name: customer.name, phone: customer.phone },
    totals: { gross, lineDisc: 0, cartDisc: disc, couponDisc: 0, memberDisc: 0, pointsUsed: 0, pointsDisc: 0, taxable, tax, total, units },
    tenders: [], change: 0, due: total, cashier: by, salesperson: by, counter: from, place, returned: {}, stockOut: false, deliveries: [],
  };
  save(POS_KEYS.sales, [sale, ...sales]);
  // the goods wait at the place: held for this invoice until a delivery hands them over (the Online edition, which
  // has no holds, takes them out when the order is approved, as Create order does)
  if (route === 'online' && !holdsStock()) { const made = findOrder(order.id); if (made) takeOrderStock(made, place, by); }
  else addHolds({ type: route === 'online' ? 'online' : 'retail', ref: route === 'online' ? order.id : invoiceId, who: customer.name, place, note: `${from} · waiting for delivery`, by }, frozen.map((l) => ({ name: l.name, qty: l.qty })));
  return { ok: true, orderId: order.id, invoiceId, route, total };
}
