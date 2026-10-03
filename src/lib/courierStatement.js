// courierStatement — the courier statement (Orders › Courier statement, /courier-statement): every online parcel handed
// to a courier, courier by courier, for a date range (by the day it was dispatched).
//
//   parcel state   pickup     packed and booked for a courier, not handed over yet (Ready for courier)
//                  transit    with the courier · out (out for delivery) · failed (a delivery attempt failed, still out)
//                  delivered  delivered to the customer
//                  returning  the courier is bringing it back (not received at the shop yet)
//                  returned   received back at the shop (or partly: `partial`)
//   money          cod        cash the courier collects (0 for paid orders)
//                  collected  COD of parcels delivered
//                  charge     the courier's delivery charge (Accounts › Settlements rates; charged on returns too)
//                  net        collected − charges (what the courier owes the shop for these parcels)
//                  paid       payouts received from the courier (Settlements) in the range
//                  due        payouts expected and not received yet · held: COD the courier holds now (ledger)
//
// Reads the shared books: salesBook.getOnlineOrders (the demo September and every online order), orders.getOrders
// (live state: courier hooks, COD locked at booking, charge), orders.rtoState (what came back), settlements (payouts).

import { getOnlineOrders } from './salesBook';
import { getOrders, rtoState, isCounterSale } from './orders';
import { courierPartner, courierChargeOf, getPayouts, heldBy, partnerBy, clockNow } from './settlements';

export const COURIERS = ['Steadfast', 'Pathao', 'RedX', 'Carrybee'];
export const STATE = {
  pickup: ['Waiting pickup', 'neutral'],
  transit: ['In transit', 'info'],
  out: ['Out for delivery', 'info'],
  failed: ['Delivery failed', 'warning'],
  delivered: ['Delivered', 'success'],
  returning: ['Coming back', 'warning'],
  partial: ['Partly received', 'warning'],
  returned: ['Returned', 'error'],
};
/** States in the order a parcel moves through them (the bar and the columns use it). */
export const FLOW = ['pickup', 'transit', 'out', 'failed', 'delivered', 'returning', 'partial', 'returned'];

const HOUR = 36e5;
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const courierOf = (name) => COURIERS.find((c) => String(name || '').toLowerCase().includes(c.toLowerCase())) || '';

/** One parcel's state now. */
function stateOf(p, live, now) {
  const t = p.times || {};
  if (!t.shipped) return p.status === 'Ready for courier' || (live && live.statusKey === 'ready') ? 'pickup' : '';
  if (t.delivered) return 'delivered';
  if (t.returned || (live && live.statusKey === 'returned')) {
    // an order in Orders: what was received at Courier returns; the demo September's own returns were booked in the
    // day after the courier brought them
    if (live && live.lines) {
      const s = rtoState(live).status;
      return s === 'received' ? 'returned' : s === 'partial' ? 'partial' : 'returning';
    }
    return t.returned && t.returned + 20 * HOUR <= now ? 'returned' : 'returning';
  }
  const codes = ((live && live.hooks) || []).map((h) => h.code);
  if (codes.includes('failed')) return 'failed';
  if (codes.includes('out')) return 'out';
  return 'transit';
}

/** Every parcel with a courier: [{ id, courier, at (dispatched or packed), state, cod, charge, zone, customer, phone,
 *  consignment, days, rtoReason }]. */
export function parcels(now = clockNow()) {
  const live = Object.fromEntries(getOrders().filter((o) => !isCounterSale(o) && !o.isInvoice).map((o) => [o.id, o]));
  const out = [];
  getOnlineOrders().forEach((p) => {
    const o = live[p.id];
    const courier = courierOf((o && (o.courier || (o.prep && o.prep.courier))) || p.courier);
    if (!courier) return;
    const state = stateOf(p, o, now);
    if (!state) return;
    const t = p.times || {};
    const paid = o && o.paid != null ? o.paid : p.method === 'COD' ? 0 : p.amount;
    const cod = o && o.codAmount != null ? o.codAmount : Math.max(0, (p.amount || 0) - (paid || 0));
    const partner = courierPartner(courier);
    const charge = (o && o.courierCharge) || (partner ? Number(courierChargeOf(partner, p.zone)) || 0 : 0);
    const end = t.delivered || t.returned || null;
    out.push({
      id: p.id, courier, partner, state, at: t.shipped || t.ready || p.at, dispatched: t.shipped || null,
      cod: r2(cod), charge: state === 'pickup' ? 0 : charge, zone: p.zone || '', customer: p.customer, phone: p.phone,
      consignment: (o && o.consignment && o.consignment !== '—' ? o.consignment : '') || '',
      days: t.shipped ? Math.max(0, ((end || now) - t.shipped) / (24 * HOUR)) : 0, rtoReason: p.rtoReason || '', est: !!p.est,
    });
  });
  return out.sort((a, b) => b.at - a.at);
}

const blank = () => Object.fromEntries(FLOW.map((k) => [k, 0]));
/**
 * The statement for a range ({ from, to } ms, by dispatch day; parcels waiting pickup count by their packing day) and
 * one courier (or all): { couriers: [row], totals: row, parcels }.
 * row = { name, partner, brand, counts, dispatched, active (on the way), back (returning + returned), rate (% delivered
 *         of finished), avgDays, cod, collected, charges, net, paid, due, held, parcels }
 */
export function courierStatement({ from = 0, to = Infinity, courier = '', now = clockNow() } = {}) {
  const all = parcels(now).filter((p) => p.at >= from && p.at < to && (!courier || p.courier === courier));
  const payouts = (() => { try { return getPayouts(now); } catch { return []; } })();
  const row = (name, list) => {
    const counts = blank();
    list.forEach((p) => { counts[p.state] += 1; });
    const done = counts.delivered + counts.returned + counts.partial + counts.returning;
    const deliveredList = list.filter((p) => p.state === 'delivered');
    const partner = name ? courierPartner(name) : '';
    const pays = payouts.filter((x) => (partner ? x.partner === partner : COURIERS.some((c) => courierPartner(c) === x.partner)));
    const collected = r2(deliveredList.reduce((a, p) => a + p.cod, 0));
    const charges = r2(list.reduce((a, p) => a + p.charge, 0));
    return {
      name: name || 'All couriers', partner, brand: partner ? (partnerBy(partner) || {}).brand || partner : '',
      counts, dispatched: list.filter((p) => p.dispatched).length,
      active: counts.transit + counts.out + counts.failed, back: counts.returning + counts.partial + counts.returned,
      rate: done ? Math.round((counts.delivered / done) * 100) : null,
      avgDays: deliveredList.length ? r2(deliveredList.reduce((a, p) => a + p.days, 0) / deliveredList.length) : null,
      cod: r2(list.reduce((a, p) => a + p.cod, 0)), collected, charges, net: r2(collected - charges),
      paid: r2(pays.filter((x) => x.status === 'received' && x.date >= from && x.date < to).reduce((a, x) => a + (x.received || 0), 0)),
      due: r2(pays.filter((x) => x.status === 'expected' || x.status === 'delayed').reduce((a, x) => a + (x.net || 0), 0)),
      held: (() => { try { return partner ? r2(heldBy(partner)) : r2(COURIERS.reduce((a, c) => a + (heldBy(courierPartner(c)) || 0), 0)); } catch { return 0; } })(),
      parcels: list,
    };
  };
  const names = courier ? [courier] : COURIERS;
  return { couriers: names.map((c) => row(c, all.filter((p) => p.courier === c))), totals: row('', all), parcels: all };
}
