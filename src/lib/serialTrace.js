// serialTrace — the life of one serial number or IMEI (Nayeem's Inventory brief #2 › "Serial / IMEI / Lot
// Traceability"): received → moved → held → sold → returned → with a vendor → back, with the place it is at now.
//
//   A unit: { code, sku, name, type ('IMEI' | 'Serial'), status, place, events: [{ at, kind, place, ref, who, by, note }] }
//   status: 'in stock' · 'held' · 'sold' · 'returned' · 'with vendor' · 'written off'
//
//   findUnit(code)              the unit with this serial / IMEI (any case, spaces ignored), or null
//   traceSerial(code)           { unit, events (oldest first), moves (stock moves that name it) } or null
//   recordSerial(code, ev, patch) adds an event (and sets status / place); a new code is added as a unit
//   unitsOf(sku)                every unit of a product, newest first
//   serialOwner(code)           the unit that already has this code (block duplicates)
//
// Two registers, one view: the register's own list (serials.js: units the POS sells and returns, gc.serials) and this
// file's list (receipts, transfers, holds, custody, counts, gc.stock.serials). findUnit / traceSerial read both, so a
// unit sold at the till and later sent to a vendor shows one life. Front end only.

import { getMoves } from './stock';
import { getSerials as posSerials } from './serials';

const KEY = 'gc.stock.serials';
export const SERIAL_EVENT = 'gc:serials';
export const SERIAL_STATUS = { 'in stock': 'success', held: 'info', sold: 'neutral', returned: 'warning', 'with vendor': 'warning', 'written off': 'error' };
export const SERIAL_KIND = { receive: 'Received', transfer: 'Moved', hold: 'Held for an order', sale: 'Sold', return: 'Returned', 'custody out': 'Sent to vendor', 'custody back': 'Back from vendor', count: 'Counted', 'write-off': 'Written off', release: 'Back on sale' };

export const luhn = (b) => { let t = 0; String(b).split('').reverse().forEach((d, i) => { let n = Number(d); if (i % 2 === 0) { n *= 2; if (n > 9) n -= 9; } t += n; }); return b + String((10 - (t % 10)) % 10); };
const at = (m, d, h, mi) => new Date(2026, m - 1, d, h || 10, mi || 0).getTime();
const E = (t, kind, place, ref, by, extra) => ({ at: t, kind, place, ref, by, ...(extra || {}) });
const SEED = [
  { code: luhn('35678910451234'), sku: 'PH-5GP-256-BK', name: '5G Smartphone Pro 256GB · Phantom Black / 256 GB', type: 'IMEI', status: 'sold', place: '',
    events: [E(at(8, 24, 11), 'receive', 'Central Warehouse', 'PO-1042', 'Tareq Aziz', { who: 'Dhaka Gadget Hub' }), E(at(9, 2, 15), 'transfer', 'Dhanmondi branch', 'TRF-0005', 'Karim'), E(at(9, 14, 17, 40), 'sale', 'Dhanmondi branch', 'INV-0219', 'Rafi Ahmed', { who: 'Mahmudul Karim' })] },
  { code: luhn('35678910451235'), sku: 'PH-5GP-256-BK', name: '5G Smartphone Pro 256GB · Phantom Black / 256 GB', type: 'IMEI', status: 'returned', place: 'Central Warehouse',
    events: [E(at(8, 24, 11), 'receive', 'Central Warehouse', 'PO-1042', 'Tareq Aziz', { who: 'Dhaka Gadget Hub' }), E(at(9, 18, 12), 'sale', 'Central Warehouse', '#136742', 'System', { who: 'Nasrin Sultana' }), E(at(9, 25, 16, 5), 'return', 'Central Warehouse', 'RET-0031', 'Farhana Yasmin', { who: 'Nasrin Sultana', note: 'Speaker crackles' })] },
  { code: luhn('35678910451236'), sku: 'PH-5GP-256-SV', name: '5G Smartphone Pro 256GB · Silver / 256 GB', type: 'IMEI', status: 'with vendor', place: 'Samsung service centre, Mirpur 10',
    events: [E(at(8, 24, 11), 'receive', 'Central Warehouse', 'PO-1042', 'Tareq Aziz', { who: 'Dhaka Gadget Hub' }), E(at(9, 10, 13), 'sale', 'Mirpur branch', 'INV-0207', 'Sadia Akter', { who: 'Tanvir Hasan' }), E(at(9, 22, 10, 30), 'return', 'Mirpur branch', 'WC-0018', 'Sadia Akter', { who: 'Tanvir Hasan', note: 'Warranty claim · screen flicker' }), E(at(9, 24, 15), 'custody out', 'Samsung service centre, Mirpur 10', 'EXT-0001', 'Tareq Aziz', { note: 'RMA SSC-77812' })] },
  { code: luhn('35678910451237'), sku: 'PH-5GP-256-SV', name: '5G Smartphone Pro 256GB · Silver / 256 GB', type: 'IMEI', status: 'in stock', place: 'Central Warehouse',
    events: [E(at(8, 24, 11), 'receive', 'Central Warehouse', 'PO-1042', 'Tareq Aziz', { who: 'Dhaka Gadget Hub' })] },
  { code: luhn('35678910451238'), sku: 'PH-5GP-512-BK', name: '5G Smartphone Pro 256GB · Phantom Black / 512 GB', type: 'IMEI', status: 'held', place: 'Central Warehouse',
    events: [E(at(8, 24, 11), 'receive', 'Central Warehouse', 'PO-1042', 'Tareq Aziz', { who: 'Dhaka Gadget Hub' }), E(at(9, 30, 10, 12), 'hold', 'Central Warehouse', '#136812', 'System', { who: 'Nusrat Jahan' })] },
  { code: luhn('86123405009871'), sku: 'PH-RLM-N50', name: 'Realme Note 50 6/128GB', type: 'IMEI', status: 'in stock', place: 'Dhanmondi branch',
    events: [E(at(9, 3, 9, 30), 'receive', 'Central Warehouse', 'PO-1038', 'Tareq Aziz', { who: 'Symphony Mobile Ltd' }), E(at(9, 15, 10, 30), 'transfer', 'Dhanmondi branch', 'TRF-0007', 'Karim'), E(at(9, 20, 18), 'count', 'Dhanmondi branch', 'CNT-0007', 'Suman')] },
  { code: 'SMX-EP-2409-00187', sku: 'AU-EAR-PRO', name: 'Wireless Earbuds Pro', type: 'Serial', status: 'sold', place: '',
    events: [E(at(9, 1, 12), 'receive', 'Central Warehouse', 'PO-1036', 'Sabbir Hossain', { who: 'SoundMax BD' }), E(at(9, 29, 17, 40), 'sale', 'Central Warehouse', '#136810', 'System', { who: 'Karim Saheb' })] },
  { code: 'SMX-EP-2409-00188', sku: 'AU-EAR-PRO', name: 'Wireless Earbuds Pro', type: 'Serial', status: 'in stock', place: 'Central Warehouse',
    events: [E(at(9, 1, 12), 'receive', 'Central Warehouse', 'PO-1036', 'Sabbir Hossain', { who: 'SoundMax BD' })] },
  { code: 'ASUS-RTX-K9N0CV11', sku: 'PH-IPH-15P', name: 'iPhone 15 Pro (old stock)', type: 'Serial', status: 'in stock', place: 'Central Warehouse',
    events: [E(at(7, 12, 14), 'receive', 'Central Warehouse', 'PO-0991', 'Tareq Aziz', { who: 'Global Brand PLC' }), E(at(8, 30, 11), 'custody out', 'ASUS service centre, Agargaon', 'EXT-0000', 'Tareq Aziz', { note: 'Fan noise' }), E(at(9, 12, 16), 'custody back', 'Central Warehouse', 'EXT-0000', 'Tareq Aziz', { note: 'Fan replaced' })] },
];

const norm = (c) => String(c || '').replace(/\s+/g, '').toLowerCase();
const read = () => { if (typeof window === 'undefined') return SEED; try { const v = JSON.parse(window.localStorage.getItem(KEY)); return Array.isArray(v) ? v : SEED; } catch { return SEED; } };
const write = (list) => { try { window.localStorage.setItem(KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(SERIAL_EVENT)); } catch { /* ignore */ } };

// a unit from the register's list (serials.js) in this file's shape
const POS_STATE = { stock: 'in stock', sold: 'sold', returned: 'returned' };
function fromPos(x) {
  const ev = [{ at: x.at, kind: 'receive', place: x.place, ref: x.added || '', by: 'System' }];
  if (x.soldAt) ev.push({ at: x.soldAt, kind: 'sale', place: x.place, ref: x.saleId || '', who: x.customer || '', by: x.by || 'System' });
  if (x.returnedAt) ev.push({ at: x.returnedAt, kind: 'return', place: x.place, ref: x.returnRef || '', by: 'Staff' });
  return { code: x.serial, sku: x.sku, name: x.product, type: x.kind === 'imei' ? 'IMEI' : 'Serial', status: POS_STATE[x.state] || 'in stock', place: x.state === 'sold' ? '' : x.place, events: ev, pos: true };
}
const pos = () => { try { return posSerials() || []; } catch { return []; } };

/** Every unit both registers know (this file's first). */
export const getUnits = () => { const mine = read(); const seen = new Set(mine.map((u) => norm(u.code))); return mine.concat(pos().filter((x) => !seen.has(norm(x.serial))).map(fromPos)); };
/** The unit with this serial / IMEI, or null. A unit in both lists gets the register's sale and return too. */
export const findUnit = (code) => {
  const k = norm(code);
  if (!k) return null;
  const mine = read().find((u) => norm(u.code) === k) || null;
  const p = pos().find((x) => norm(x.serial) === k);
  if (!p) return mine;
  if (!mine) return fromPos(p);
  const extra = fromPos(p).events.filter((e) => e.kind !== 'receive' && !mine.events.some((m) => m.kind === e.kind && m.ref === e.ref));
  if (!extra.length) return mine;
  const last = extra[extra.length - 1];
  return { ...mine, events: mine.events.concat(extra).sort((a, b) => a.at - b.at), status: last.at > lastAt(mine) ? fromPos(p).status : mine.status };
};
export const serialOwner = findUnit;
export const unitsOf = (sku) => getUnits().filter((u) => u.sku === sku).sort((a, b) => lastAt(b) - lastAt(a));
const lastAt = (u) => (u.events.length ? u.events[u.events.length - 1].at : 0);

const STATUS_AFTER = { receive: 'in stock', transfer: 'in stock', hold: 'held', release: 'in stock', sale: 'sold', return: 'returned', 'custody out': 'with vendor', 'custody back': 'in stock', 'write-off': 'written off' };
/** Add an event to a unit (a new code becomes a unit when `patch` names its sku). Returns the unit or null. */
export function recordSerial(code, ev, patch = {}) {
  const k = norm(code);
  if (!k) return null;
  const list = read();
  let u = list.find((x) => norm(x.code) === k);
  const e = { at: Date.now(), by: 'Staff', ...ev };
  if (!u) {
    const p = pos().find((x) => norm(x.serial) === k);
    if (p) { u = fromPos(p); delete u.pos; list.unshift(u); }
  }
  if (!u) {
    if (!patch.sku) return null;
    u = { code: String(code).trim(), type: /^\d{15}$/.test(String(code).trim()) ? 'IMEI' : 'Serial', status: 'in stock', place: e.place || '', events: [], ...patch };
    list.unshift(u);
  }
  u.events = [...u.events, e];
  if (STATUS_AFTER[e.kind]) u.status = STATUS_AFTER[e.kind];
  if (e.kind === 'sale') u.place = '';
  else if (e.place) u.place = e.place;
  Object.assign(u, patch);
  write(list);
  return u;
}

/** The whole life of one unit, oldest first, with the stock moves that name it. */
export function traceSerial(code) {
  const u = findUnit(code);
  const k = norm(code);
  const moves = typeof window === 'undefined' ? [] : getMoves().filter((m) => m.serial && norm(m.serial) === k);
  if (!u && !moves.length) return null;
  const events = (u ? u.events : []).concat(moves.filter((m) => !(u && u.events.some((e) => e.ref === m.ref && e.kind === m.kind))).map((m) => ({ at: m.at, kind: m.kind, place: m.place, ref: m.ref, by: m.by, note: m.reason })))
    .sort((a, b) => a.at - b.at);
  return { unit: u || { code: String(code).trim(), sku: moves[0].sku, name: moves[0].sku, type: 'Serial', status: 'in stock', place: moves[0].place, events: [] }, events, moves };
}
