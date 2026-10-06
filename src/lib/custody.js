// custody — stock that is ours but not in any of our places (Nayeem's Inventory brief #2 › "External Custody"): a unit
// sent to a supplier or a service centre for repair, inspection or a warranty claim. It is not a supplier return (we
// still own it), not sold and not disposed.
//   sendToVendor()  the pieces leave the place (a 'custody out' stock move), so they are out of on hand and available,
//                   and show as "with vendor" until they come back
//   receiveBack()   they come back into a place by receiving (a 'custody back' move); a unit that cannot come back is
//                   closed (written off, replaced, or credited by the supplier) with no stock move
// Each record: { id, sku, name, qty, back, place, party, rma, serials, sentAt, expectedAt, status ('out' | 'back' |
//   'closed'), note, by, events }. Moves use operation keys (id + step), so a repeated tap never moves stock twice.
// Front end only: gc.stock.custody; one demo phone at a service centre (already out of the demo counts).

import { addMove, productBy } from './stock';
import { recordSerial, luhn } from './serialTrace';

const KEY = 'gc.stock.custody';
export const CUSTODY_EVENT = 'gc:custody';
export const CUSTODY_STATUS = { out: ['With vendor', 'warning'], back: ['Back in stock', 'success'], closed: ['Closed', 'neutral'] };
export const CUSTODY_REASONS = ['Warranty repair', 'Inspection', 'Replacement claim', 'Service', 'Other'];
const at = (d, h) => new Date(2026, 8, d, h || 10).getTime();
const SEED = [
  { id: 'EXT-0001', sku: 'PH-5GP-256-SV', name: '5G Smartphone Pro 256GB · Silver / 256 GB', qty: 1, back: 0, place: 'Mirpur branch', party: 'Samsung service centre, Mirpur 10', rma: 'SSC-77812',
    serials: [luhn('35678910451236')], reason: 'Warranty repair', sentAt: at(24, 15), expectedAt: at(8 + 30, 12), status: 'out', note: 'Screen flicker · customer claim WC-0018', by: 'Tareq Aziz', seed: true },
];

const read = () => { if (typeof window === 'undefined') return SEED; try { const v = JSON.parse(window.localStorage.getItem(KEY)); return Array.isArray(v) ? v : SEED; } catch { return SEED; } };
const write = (list) => { try { window.localStorage.setItem(KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(CUSTODY_EVENT)); } catch { /* ignore */ } };
const nextId = (list) => 'EXT-' + String(list.reduce((m, x) => Math.max(m, Number(String(x.id).split('-')[1]) || 0), 0) + 1).padStart(4, '0');

export const getCustody = () => read();
export const openCustody = () => read().filter((r) => r.status === 'out');
/** Pieces of a product with vendors now (all places, or sent from `place`). */
export const withVendor = (sku, place = '') => openCustody().filter((r) => r.sku === sku && (!place || r.place === place)).reduce((a, r) => a + (r.qty - (r.back || 0)), 0);

/** Send pieces to a vendor: { sku, qty, place, party, rma, reason, expectedAt, serials, note, by }. Returns { ok, error, row }. */
export function sendToVendor(f) {
  const row0 = productBy(f.sku);
  const qty = Math.max(0, Math.round(Number(f.qty) || 0));
  if (!row0) return { ok: false, error: 'Pick a product.' };
  if (!qty) return { ok: false, error: 'Enter how many.' };
  if (!String(f.party || '').trim()) return { ok: false, error: 'Enter who it goes to.' };
  const list = read();
  const id = nextId(list);
  const serials = (f.serials || []).map((x) => String(x).trim()).filter(Boolean);
  const row = { id, sku: row0.sku, name: row0.name, qty, back: 0, place: f.place, party: String(f.party).trim(), rma: String(f.rma || '').trim(), serials, reason: f.reason || CUSTODY_REASONS[0],
    sentAt: Date.now(), expectedAt: f.expectedAt || null, status: 'out', note: f.note || '', by: f.by || 'Staff' };
  addMove({ sku: row0.sku, place: f.place, qty: -qty, kind: 'custody out', reason: 'Sent to ' + row.party + (row.rma ? ' · ' + row.rma : ''), by: row.by, ref: id, op: id + ':out' });
  serials.forEach((sn) => { try { recordSerial(sn, { kind: 'custody out', place: row.party, ref: id, by: row.by, note: row.reason }, { sku: row0.sku, name: row0.name }); } catch { /* ignore */ } });
  write([row, ...list]);
  return { ok: true, row };
}
/** Pieces come back by receiving: { qty, place, by, note }. A partial return keeps the rest out. */
export function receiveBack(id, f = {}) {
  const list = read();
  const r = list.find((x) => x.id === id);
  if (!r || r.status !== 'out') return { ok: false, error: 'This is not with a vendor.' };
  const left = r.qty - (r.back || 0);
  const qty = Math.min(left, Math.max(0, Math.round(Number(f.qty == null ? left : f.qty) || 0)));
  if (!qty) return { ok: false, error: 'Enter how many came back.' };
  const place = f.place || r.place, n = (r.back || 0) + qty;
  addMove({ sku: r.sku, place, qty, kind: 'custody back', reason: 'Back from ' + r.party + (f.note ? ' · ' + f.note : ''), by: f.by || 'Staff', ref: id, op: id + ':back:' + n });
  r.serials.forEach((sn) => { try { recordSerial(sn, { kind: 'custody back', place, ref: id, by: f.by || 'Staff', note: f.note || '' }); } catch { /* ignore */ } });
  write(list.map((x) => (x.id === id ? { ...x, back: n, status: n >= x.qty ? 'back' : 'out', backAt: Date.now(), backPlace: place } : x)));
  return { ok: true };
}
/** Close what is still out without stock coming back (replaced, written off or credited by the supplier). */
export function closeCustody(id, how, by = 'Staff') {
  const list = read().map((x) => (x.id === id && x.status === 'out' ? { ...x, status: 'closed', closedAt: Date.now(), closedHow: how || 'Closed', closedBy: by } : x));
  write(list);
  return list.find((x) => x.id === id) || null;
}
