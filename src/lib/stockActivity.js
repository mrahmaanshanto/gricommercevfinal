// stockActivity — one list of every stock movement (Nayeem's Inventory brief #2 › "Stock Activity / Ledger": receipts,
// holds, sales, transfers, returns, counts, damage, disposal, custody), with filters by product, place, type,
// reference, user, batch and serial / IMEI.
//
// Rows come from the stock moves (stock.js) plus what other books record before or without a move: adjustments waiting
// for approval or rejected (stockAdjustments.js), transfers on the way (transfers.js), holds for orders and damage
// (stockHolds.js), batches received (batches.js), stock with vendors (custody.js), posted count sessions
// (countSessions.js) and, when searching a serial, that unit's life (serialTrace.js). The demo's own history (seeded
// adjustments, transfers, holds and batches that never made a move in this browser) is listed too, so the page is
// never empty; a book row whose reference already has a stock move is left out, so nothing shows twice.
//
//   activity({ q, place, group, ref, user, batch, serial, from, to }) → rows, newest first
//   row: { id, at, kind, label, group, sku, name, place, qty, unit, ref, by, batch, serial, reason, status, effect, sync }
//     status  done · waiting · rejected · transit · held · queued
//     effect  'onhand' (on hand changed) · 'available' (only what can be sold changed) · 'none' (nothing moved yet)

import { getMoves, productBy } from './stock';
import { getAdjustments } from './stockAdjustments';
import { getTransfers } from './transfers';
import { getHolds, DAMAGED_PLACE } from './stockHolds';
import { getBatches } from './batches';
import { getCustody } from './custody';
import { getSessions } from './countSessions';
import { traceSerial } from './serialTrace';
import { unitOf } from './units';

export const KIND_LABEL = {
  adjust: 'Adjusted', count: 'Counted', transfer: 'Transfer', receive: 'Received', sale: 'Sold', delivery: 'Delivered', return: 'Returned', rto: 'Courier return',
  exchange: 'Given in exchange', 'write-off': 'Written off', writeoff: 'Written off', opening: 'Opening stock', 'supplier return': 'Returned to supplier', repaired: 'Repaired',
  assemble: 'Assembled', disassemble: 'Taken apart', 'custody out': 'Sent to vendor', 'custody back': 'Back from vendor', hold: 'Held', release: 'Back on sale', damaged: 'Damaged',
};
export const GROUPS = [
  { k: 'all', label: 'All' },
  { k: 'adjust', label: 'Adjustments', kinds: ['adjust', 'count', 'write-off', 'writeoff', 'damaged'] },
  { k: 'move', label: 'Transfers', kinds: ['transfer', 'custody out', 'custody back'] },
  { k: 'in', label: 'Received', kinds: ['receive', 'opening', 'repaired', 'assemble', 'disassemble', 'supplier return'] },
  { k: 'sale', label: 'Sales & returns', kinds: ['sale', 'delivery', 'return', 'rto', 'exchange'] },
  { k: 'hold', label: 'Holds', kinds: ['hold', 'release'] },
];
const groupOf = (kind) => (GROUPS.find((g) => g.kinds && g.kinds.includes(kind)) || { k: 'other' }).k;
const low = (x) => String(x == null ? '' : x).toLowerCase();

function row(o) {
  const p = productBy(o.sku) || productBy(o.name);
  return {
    id: o.id, at: o.at || 0, kind: o.kind, label: o.label || KIND_LABEL[o.kind] || 'Stock change', group: groupOf(o.kind), sku: p ? p.sku : o.sku || '', name: p ? p.name : o.name || o.sku || '',
    place: o.place || '', qty: Number(o.qty) || 0, unit: unitOf(p && p.unit).short, ref: o.ref || '', by: o.by || '', batch: o.batch || '', serial: o.serial || '', reason: o.reason || '',
    status: o.status || 'done', effect: o.effect || 'onhand', sync: o.sync || '', pack: o.pack || null, keys: o.keys || null, part: o.part || '',
  };
}

/** Every stock movement, newest first, unfiltered. */
export function allActivity({ serial } = {}) {
  if (typeof window === 'undefined') return [];
  const moves = getMoves();
  const refs = new Set(moves.map((m) => m.ref).filter(Boolean));
  const out = moves.map((m) => row({ ...m, status: m.sync === 'queued' ? 'queued' : 'done' }));
  // adjustments that did not move stock (waiting, rejected) or were approved before this browser kept moves
  getAdjustments().forEach((a) => {
    if (refs.has(a.id)) return;
    out.push(row({ id: a.id, at: a.at, kind: 'adjust', sku: a.sku, place: a.place, qty: a.qty, ref: a.id, by: a.by + (a.decidedBy && a.status === 'approved' ? ' · approved by ' + a.decidedBy : ''),
      reason: a.reason + (a.note ? ' · ' + a.note : '') + (a.decisionNote ? ' · ' + a.decisionNote : ''), status: a.status === 'approved' ? 'done' : a.status, effect: a.status === 'approved' ? 'onhand' : 'none' }));
  });
  // transfers: on the way (nothing moved yet) and received before this browser kept moves
  getTransfers().forEach((t) => {
    if (refs.has(t.no) || t.status === 'draft') return;
    t.lines.forEach((l, i) => {
      if (t.status === 'way') out.push(row({ id: t.no + '-' + i, at: t.at, kind: 'transfer', label: 'On the way', sku: l.sku, place: t.from, qty: -l.qty, ref: t.no, by: t.by, reason: 'To ' + t.to + (t.carrier ? ' · ' + t.carrier : ''), status: 'transit', effect: 'none' }));
      else {
        out.push(row({ id: t.no + '-s' + i, at: t.at, kind: 'transfer', label: 'Sent', sku: l.sku, place: t.from, qty: -l.got - (l.res && l.res.kind !== 'pending' ? l.qty - l.got : 0), ref: t.no, by: t.by, reason: 'To ' + t.to }));
        out.push(row({ id: t.no + '-r' + i, at: t.receivedAt || t.at, kind: 'transfer', label: 'Received', sku: l.sku, place: t.to, qty: l.got, ref: t.no, by: t.by, reason: 'From ' + t.from + (l.got < l.qty ? ' · ' + (l.qty - l.got) + ' short' : '') }));
      }
    });
  });
  // holds: what can be sold changes, on hand does not (damaged pieces move to the damaged bay)
  getHolds().forEach((h) => {
    out.push(row({ id: h.id, at: h.at, kind: h.status === 'damaged' ? 'damaged' : 'hold', label: h.status === 'damaged' ? 'Damaged' : 'Held', name: h.product, sku: h.product, place: h.status === 'damaged' ? h.from || h.place : h.place, qty: -h.qty,
      ref: h.ref === '—' ? h.id : h.ref, by: h.by, reason: [h.who !== '—' ? h.who : '', h.note].filter(Boolean).join(' · '), status: h.status === 'held' ? 'held' : 'done', effect: h.status === 'damaged' ? 'onhand' : 'available' }));
    if (h.status === 'released' && h.closedAt) out.push(row({ id: h.id + '-r', at: h.closedAt, kind: 'release', name: h.product, sku: h.product, place: h.place, qty: h.qty, ref: h.ref === '—' ? h.id : h.ref, by: h.by, reason: h.note, effect: 'available' }));
  });
  // batches received (purchase bills); their write-offs are stock moves already
  getBatches().forEach((b) => {
    if (b.seed) out.push(row({ id: b.id, at: b.at, kind: 'receive', sku: b.sku, name: b.name, place: b.place, qty: b.qty, ref: b.ref, by: b.supplier, batch: b.id, reason: 'Batch ' + b.id + ' · expires ' + new Date(b.expiry).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }));
  });
  // stock with vendors that left before this browser kept moves
  getCustody().forEach((c) => {
    if (c.seed) out.push(row({ id: c.id, at: c.sentAt, kind: 'custody out', sku: c.sku, place: c.place, qty: -c.qty, ref: c.id, by: c.by, serial: (c.serials || [])[0] || '', reason: 'Sent to ' + c.party + (c.rma ? ' · ' + c.rma : '') }));
  });
  // posted counts from before this browser kept moves
  getSessions().filter((s) => s.seed && s.status === 'posted').forEach((s) => {
    Object.keys(s.lines || {}).forEach((sku) => {
      const c = s.lines[sku].counts, n = c.reduce((a, x) => a + x.qty, 0), d = n - (s.snapshot[sku] || 0);
      if (d) out.push(row({ id: s.id + '-' + sku, at: s.postedAt, kind: 'count', sku, place: s.place, qty: d, ref: s.id, by: c.map((x) => x.by).join(', ') + ' · approved by ' + s.postedBy, reason: 'Count difference' }));
    });
  });
  // one unit's life, when a serial / IMEI is searched
  if (serial) {
    const t = traceSerial(serial);
    if (t) t.events.forEach((e, i) => { if (!out.some((r) => r.ref === e.ref && r.serial && low(r.serial) === low(t.unit.code))) out.push(row({ id: 'SN-' + i, at: e.at, kind: e.kind, sku: t.unit.sku, name: t.unit.name, place: e.place, qty: /sale|custody out|write/.test(e.kind) ? -1 : e.kind === 'hold' || e.kind === 'count' ? 0 : 1, ref: e.ref, by: e.by, serial: t.unit.code, reason: [e.who, e.note].filter(Boolean).join(' · '), effect: e.kind === 'hold' ? 'available' : e.kind === 'count' ? 'none' : 'onhand' })); });
  }
  return out.sort((a, b) => b.at - a.at);
}

/** The list with filters: { q (product, SKU), place, group, ref, user, batch, serial, from, to (ms) }. */
export function activity(f = {}) {
  const q = low(f.q).trim(), ref = low(f.ref).trim(), user = low(f.user).trim(), batch = low(f.batch).trim(), serial = low(f.serial).replace(/\s+/g, '');
  return allActivity({ serial: f.serial }).filter((r) => {
    if (f.group && f.group !== 'all' && r.group !== f.group) return false;
    if (f.place && r.place !== f.place && !(f.place === DAMAGED_PLACE && r.kind === 'damaged')) return false;
    if (q && !(low(r.name).includes(q) || low(r.sku).includes(q))) return false;
    if (ref && !low(r.ref).includes(ref)) return false;
    if (user && !low(r.by).includes(user)) return false;
    if (batch && !(low(r.batch).includes(batch) || low(r.ref).includes(batch))) return false;
    if (serial && !low(r.serial).replace(/\s+/g, '').includes(serial)) return false;
    if (f.from && r.at < f.from) return false;
    if (f.to && r.at > f.to) return false;
    return true;
  });
}
/** The people named on the activity (for the user filter). */
export const activityUsers = (rows) => Array.from(new Set(rows.map((r) => String(r.by).split(' · ')[0]).filter((x) => x && x !== '—'))).sort();
