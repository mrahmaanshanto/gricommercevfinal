// stockMerge — one inventory for a one-place shop (moving from a store with branches to online only).
//   mergePlan(home)  what sits at every other place (product by product), the order holds there and the transfers on
//                    the way — shown before anything moves
//   mergeInto(home)  every other place's stock moves into `home` (a 'transfer' move out there and in here, so totals
//                    stay the same and the history says where it came from); order holds there move with it;
//                    transfers on the way are closed (their stock never left the sender, which has just been merged)
// The damaged bay stays as it is. Nothing is deleted.

import { getCatalog, stockAt, addMove } from './stock';
import { getPlaces, namesOf } from './locations';
import { getHolds, closeHold, addHolds } from './stockHolds';
import { getTransfers, updateTransfer } from './transfers';

const otherPlaces = (home) => getPlaces({ all: true }).filter((p) => !p.noSale && !namesOf(home).includes(p.name));

export function mergePlan(home) {
  const others = otherPlaces(home);
  const rows = [];
  getCatalog().forEach((p) => {
    const at = {};
    let total = 0;
    others.forEach((pl) => { const q = stockAt(p.sku, pl.name).onHand; if (q) { at[pl.name] = q; total += q; } });
    if (Object.keys(at).length) rows.push({ sku: p.sku, name: p.name, at, total, home: stockAt(p.sku, home).onHand });
  });
  const otherNames = others.flatMap((pl) => namesOf(pl.name));
  const holds = getHolds().filter((h) => h.status === 'held' && otherNames.includes(h.place));
  const transfers = getTransfers().filter((t) => t.status === 'way');
  return { places: others.map((p) => p.name).filter((n) => rows.some((r) => r.at[n] != null)), rows, holds, transfers, pcs: rows.reduce((a, r) => a + r.total, 0) };
}

export function mergeInto(home, by = 'Staff') {
  const plan = mergePlan(home);
  const ref = 'MERGE-' + Date.now().toString(36).toUpperCase();
  plan.rows.forEach((r) => Object.entries(r.at).forEach(([place, qty]) => {
    addMove({ sku: r.sku, place, qty: -qty, kind: 'transfer', reason: `Merged into ${home}`, by, ref });
    addMove({ sku: r.sku, place: home, qty, kind: 'transfer', reason: `Merged from ${place}`, by, ref });
  }));
  plan.holds.forEach((h) => {
    closeHold(h.id, 'released', `Moved to ${home} (one stock place)`);
    addHolds({ type: h.type, ref: h.ref, who: h.who, place: home, note: `Moved from ${h.place}`, by }, [{ name: h.product, qty: h.qty }]);
  });
  plan.transfers.forEach((t) => updateTransfer(t.no, { status: 'cancelled', note: 'Closed: stock merged into one place' }));
  return { ...plan, ref };
}
