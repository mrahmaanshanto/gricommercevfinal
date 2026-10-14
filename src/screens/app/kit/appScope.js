// appScope — which sales figures a person sees in the app, by the same access rules as the web (lib/team.js › canSee,
// the role lists behind the menu, and My dashboard's "my sales" / "Dhanmondi sales" blocks):
//   salesScope(user)   { kind, place, label }
//       shop    the whole shop's sales: people with the Dashboard or Finance pages (owner / CEO)
//       place   their branch's or warehouse's sales: people who run a place (shop manager / supervisor with the
//               counters, warehouse manager) — `place` from their team row
//       online  online sales: people who work on the online orders (order management, online sales, inbox) — they
//               open every one of those orders anyway
//       me      their own sales (sold by them at the counter): everyone else, e.g. a shop seller
//   scopedSales(scope, user, from, to, sales)  { total, count, units, recent: [{ id, at, party, amount }] } for [from, to)
//   seesCost(user)     buying prices and stock value at cost: people with the stock or purchase reports, purchase
//                      orders or Finance (warehouse manager, owner); a seller or shop manager sees selling prices only
// Read after mount (browser storage).

import { canSee } from '@/lib/team';
import { getSaleLines } from '@/lib/salesBook';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const sees = (user, id) => !!user && safe(() => canSee(user, id), false);
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

export function salesScope(user) {
  if (!user || sees(user, 'home') || sees(user, 'acc-home') || sees(user, 'acc-money')) return { kind: 'shop', place: '', label: 'Sales today' };
  // someone who runs a branch or a warehouse sees that place first, even when they can also open the orders
  const place = user.place && user.place !== 'Head office' ? user.place : '';
  if (place && (sees(user, 'pos-counters') || sees(user, 'stock-wh'))) {
    return { kind: 'place', place, label: 'Sales today · ' + place.replace(/ branch$/, '') };
  }
  if (sees(user, 'orders-all')) return { kind: 'online', place: '', label: 'Online sales today' };
  return { kind: 'me', place: '', label: 'My sales today' };
}

/** Does a sale line belong to the scope? (shop: everything) */
function lineIn(scope, user) {
  if (scope.kind === 'online') return (l) => l.channel === 'Online';
  if (scope.kind === 'place') return (l) => l.place === scope.place;
  if (scope.kind === 'me') { const name = (user && user.name) || '\u0000'; return (l) => (l.salesperson || l.cashier) === name; }
  return () => true;
}

/** The scope's sales in [from, to): the lines' revenue (before VAT, as the shop figures), sales, pieces, latest sales. */
export function scopedSales(scope, user, from, to, sales) {
  const keep = lineIn(scope, user);
  const lines = safe(() => getSaleLines(sales), []).filter((l) => l.at >= from && l.at < to && keep(l));
  const bySale = new Map();
  lines.forEach((l) => {
    const id = l.saleId || l.id;
    const s = bySale.get(id) || bySale.set(id, { id, at: l.at, party: (l.customer && l.customer.name) || 'Walk-in customer', amount: 0, est: !!l.est }).get(id);
    s.amount += Number(l.revenue) || 0;
  });
  const total = r2(lines.reduce((a, l) => a + (Number(l.revenue) || 0), 0));
  const units = lines.reduce((a, l) => a + (Number(l.qty) || 0), 0);
  // demo September days are one record per day: they count as sales but aren't listed one by one
  const recent = [...bySale.values()].filter((s) => !s.est).sort((a, b) => b.at - a.at).slice(0, 3).map((s) => ({ ...s, amount: r2(s.amount) }));
  return { total, count: bySale.size, units, recent };
}

export const seesCost = (user) => !user || ['home', 'acc-home', 'acc-money', 'rep-inventory', 'rep-purchase', 'po-orders'].some((id) => sees(user, id));
