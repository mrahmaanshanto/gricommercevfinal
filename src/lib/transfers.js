// transfers — stock moving between warehouses and branches.
//   draft     saved, not sent yet
//   way       on the way: shows as "in transit" at the place it is going to
//   received  scanned in. A line with fewer pieces than were sent is "short" until it is resolved:
//             written off, claimed from the carrier, or kept as pending until the pieces are found.
// Stock stays on the sender's books until the transfer is scanned in (the screen records the moves).
// Front end only: kept in this browser; starts from demo rows.

const KEY = 'gc.stock.transfers';
const at = (day, h, m) => new Date(2026, 8, day, h, m).getTime();
const L = (sku, qty, got) => ({ sku, qty, got: got == null ? 0 : got });

const SEED = [
  { no: 'TRF-0012', at: at(29, 16, 20), by: 'Karim', from: 'Central Warehouse', to: 'Mirpur branch', carrier: 'Jamal (van driver)', status: 'way', lines: [L('AC-CSE-A55', 10), L('AU-EAR-PRO', 4)] },
  { no: 'TRF-0011', at: at(28, 11, 5), by: 'Karim', from: 'Central Warehouse', to: 'Dhanmondi branch', carrier: 'Jamal (van driver)', status: 'way', lines: [L('WR-BND-08', 6), L('AC-CHG-20', 24), L('AC-GLS-9H', 12)] },
  { no: 'TRF-0010', at: at(27, 10, 40), by: 'Karim', from: 'Central Warehouse', to: 'Central Warehouse', carrier: 'Sundarban Courier', status: 'draft', lines: [L('AC-CBL-100', 40), L('PH-RLM-N50', 6)] },
  { no: 'TRF-0009', at: at(24, 9, 15), by: 'Karim', from: 'Central Warehouse', to: 'Mirpur branch', carrier: 'Jamal (van driver)', status: 'received', receivedAt: at(24, 14, 30), lines: [L('AC-LNS-PR', 20, 20), L('AC-STD-FLD', 12, 12)] },
  { no: 'TRF-0008', at: at(22, 12, 0), by: 'Tania', from: 'Dhanmondi branch', to: 'Central Warehouse', carrier: 'Pathao Courier', status: 'received', receivedAt: at(23, 11, 10), lines: [L('AU-EAR-TC', 12, 10), L('AC-HLD-CAR', 6, 6)] },
  { no: 'TRF-0007', at: at(15, 10, 30), by: 'Karim', from: 'Central Warehouse', to: 'Central Warehouse', carrier: 'Sundarban Courier', status: 'received', receivedAt: at(17, 15, 0), lines: [L('AC-CBL-100', 80, 80), L('AU-EAR-PRO', 10, 10), L('PH-RLM-N50', 8, 8), L('AC-CLN-KIT', 22, 22)] },
];

const read = () => { try { return JSON.parse(window.localStorage.getItem(KEY)) || SEED; } catch { return SEED; } };
const write = (list) => { try { window.localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ } };

/** Every transfer, newest first. Empty on the server. */
export const getTransfers = () => (typeof window === 'undefined' ? [] : read());
export const transferBy = (no) => getTransfers().find((t) => t.no === no) || null;
export const nextTransferNo = (list = getTransfers()) => 'TRF-' + String(list.reduce((m, t) => Math.max(m, Number(t.no.split('-')[1]) || 0), 0) + 1).padStart(4, '0');

/** Add a new transfer ({ from, to, by, carrier, note, status: 'draft' | 'way', lines: [{ sku, qty }] }). Returns it. */
export function addTransfer(t) {
  const list = read();
  const row = { no: nextTransferNo(list), at: Date.now(), status: 'way', ...t, lines: t.lines.map((l) => L(l.sku, l.qty)) };
  write([row, ...list]);
  return row;
}
/** Change one transfer. `patch` is merged, or a function (t) => new t. Returns the new list. */
export function updateTransfer(no, patch) {
  const list = read().map((t) => (t.no === no ? (typeof patch === 'function' ? patch(t) : { ...t, ...patch }) : t));
  write(list);
  return list;
}

/** Pieces that did not arrive on one line (0 when it is not received yet). */
export const missingOf = (t, l) => (t.status === 'received' ? Math.max(0, l.qty - l.got) : 0);
/** Lines short on arrival that nobody has dealt with yet. */
export const openShort = (t) => t.lines.filter((l) => missingOf(t, l) > 0 && !l.res);
/** Short lines kept as "found later". */
export const pendingShort = (t) => t.lines.filter((l) => missingOf(t, l) > 0 && l.res && l.res.kind === 'pending');
/** Pieces in transit to each place, from transfers that are on the way: { place: { sku: qty } }. */
export function inTransit(list = getTransfers()) {
  const out = {};
  list.filter((t) => t.status === 'way').forEach((t) => t.lines.forEach((l) => {
    out[t.to] = out[t.to] || {};
    out[t.to][l.sku] = (out[t.to][l.sku] || 0) + l.qty;
  }));
  return out;
}
