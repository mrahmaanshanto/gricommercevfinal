// locations — the one list of places that hold stock. Every dropdown that asks "which warehouse
// or branch" reads it, so the names are the same everywhere.
//
// LOCATIONS and the name lists below are the built-in places (static, the same on the server and in
// the browser). The merchant can add, edit and deactivate places in Warehouses / Branches; those
// changes are kept in this browser (localStorage 'gc.places') and merged in by the live helpers:
//   getPlaces()        every place with its details (built-in + added, merchant edits applied)
//   getStockPlaces()   names of active places whose stock can be sold or held
//   getPlaceNames(), getWarehouseNames(), getBranchNames()   active names, live
//   placeById(), placeByName(), namesOf()                     lookups
//   savePlace(), setPlaceActive(), deletePlace()              changes
// A place keeps its id when it is renamed; the old name is kept in `aka`, so stock, holds, moves and
// transfers saved under the old name still count for it (stockAt reads namesOf()).
export const LOCATIONS = [
  { id: 'cw', name: 'Central Warehouse', type: 'Warehouse', address: 'Plot 12, Tejgaon I/A, Dhaka', code: 'CW', area: 'Tejgaon, Dhaka', phone: '01556-XX7713', manager: 'Tareq Aziz', role: 'Main' },
  { id: 'ctg', name: 'Chattogram hub', type: 'Warehouse', address: 'Agrabad C/A, Chattogram', code: 'CH', area: 'Agrabad, Chattogram', phone: '01798-XX3301', manager: 'Sabbir Hossain', role: 'Hub' },
  { id: 'rd', name: 'Returns & damaged', type: 'Warehouse', address: 'Central Warehouse, bay 7', noSale: true, code: 'RD', area: 'Tejgaon, Dhaka', manager: 'Tareq Aziz', role: 'Returns', fixed: true },
  { id: 'dh', name: 'Dhanmondi branch', type: 'Branch', address: 'House 42, Road 27, Dhanmondi, Dhaka', code: 'DH-1', area: 'Dhanmondi, Dhaka', phone: '01712-XX4410', manager: 'Rakib Hasan', hours: 'Sat–Thu 10:00 AM – 10:00 PM' },
  { id: 'mp', name: 'Mirpur branch', type: 'Branch', address: 'Plot 8, Section 10, Mirpur, Dhaka', code: 'MP-1', area: 'Mirpur, Dhaka', phone: '01715-XX6630', manager: 'Nabila Rahman', hours: 'Sat–Thu 10:00 AM – 9:00 PM' },
  { id: 'gl', name: 'Gulshan-1 branch', type: 'Branch', address: 'Road 11, Gulshan-1, Dhaka', code: 'GL-1', area: 'Gulshan, Dhaka', phone: '01713-XX2215', manager: 'Rakib Hasan', hours: 'Sat–Thu 11:00 AM – 9:00 PM' },
  { id: 'ut', name: 'Uttara branch', type: 'Branch', address: 'Sector 7, Uttara, Dhaka', opening: '1 Nov 2026', code: 'UT-1', area: 'Uttara, Dhaka', hours: 'From 1 Nov 2026', counter: false },
];
export const PLACE_NAMES = LOCATIONS.map((l) => l.name);
/** Places whose stock can be sold or held for an order (not the damaged bay, not a branch still opening). */
export const STOCK_PLACES = LOCATIONS.filter((l) => !l.noSale && !l.opening).map((l) => l.name);
export const WAREHOUSE_NAMES = LOCATIONS.filter((l) => l.type === 'Warehouse').map((l) => l.name);
export const BRANCH_NAMES = LOCATIONS.filter((l) => l.type === 'Branch').map((l) => l.name);
export const DAMAGED_PLACE = 'Returns & damaged';
const OLD = { 'Dhanmondi branch': 'Dhanmondi branch', 'Mirpur branch': 'Mirpur branch', 'Gulshan-1 branch': 'Gulshan-1 branch' };
/** Older saved rows may still carry an old name (also a name the merchant has since changed). */
export const placeName = (name) => {
  if (OLD[name] && OLD[name] !== name) return OLD[name];
  const p = name ? placeByName(name) : null;
  return p ? p.name : name;
};

/** People from Staff who can manage a place (Staff › All staff). */
export const STAFF_NAMES = ['Rakib Hasan', 'Nabila Rahman', 'Tareq Aziz', 'Sabbir Hossain', 'Sadia Akter', 'Moumita Das', 'Rafi Ahmed', 'Arif Rahman', 'Jahid Hasan', 'Lamia Sultana', 'Rumana Islam'];
export const PLACE_TYPES = ['Warehouse', 'Branch'];

// ---- merchant changes (this browser) -------------------------------------------------------------
const KEY = 'gc.places';
const DEFAULTS = { code: '', address: '', area: '', phone: '', manager: '', hours: '', opening: '', active: true, aka: [] };
/** Short code from a name: "Bashundhara branch" → "BA". */
export const codeOf = (name) => String(name || '').replace(/[^A-Za-z ]/g, '').split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'PL';
const withDefaults = (l) => ({
  ...DEFAULTS,
  counter: l.type === 'Branch' && !l.noSale && !l.opening,   // sells at a POS counter
  receives: !l.noSale,                                        // can receive purchase deliveries
  ...l,
  code: l.code || codeOf(l.name),
  aka: Array.isArray(l.aka) ? l.aka : [],
});

let cache = { raw: undefined, saved: [], list: null };
const readSaved = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw !== cache.raw) { const v = JSON.parse(raw); cache = { raw, saved: Array.isArray(v) ? v : [], list: null }; }
    return cache.saved;
  } catch { return []; }
};
const writeSaved = (list) => { try { window.localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ } };
const build = (saved) => LOCATIONS.map((l) => withDefaults({ ...l, ...(saved.find((s) => s.id === l.id) || {}), builtIn: true }))
  .concat(saved.filter((s) => s && s.id && !LOCATIONS.some((l) => l.id === s.id) && !s.deleted).map((s) => withDefaults({ ...s, builtIn: false })));

/**
 * Every place: built-in places with the merchant's edits, then the places the merchant added.
 * `{ active: true }` leaves out deactivated places. `{ saved: [] }` gives the built-in list only
 * (the same on the server and in the browser, for a first render).
 */
export function getPlaces({ active, saved } = {}) {
  let list;
  if (saved) list = build(saved);
  else {
    const s = readSaved();
    if (typeof window !== 'undefined' && cache.list && cache.saved === s) list = cache.list;
    else { list = build(s); if (typeof window !== 'undefined') cache.list = list; }
  }
  return active ? list.filter((p) => p.active !== false) : list;
}
export const placeById = (id, list = getPlaces()) => list.find((p) => p.id === id) || null;
/** The place with this name, or with this as an old name. */
export function placeByName(name, list = getPlaces()) {
  const n = String(name || '').trim().toLowerCase();
  if (!n) return null;
  return list.find((p) => p.name.toLowerCase() === n) || list.find((p) => p.aka.some((a) => a.toLowerCase() === n)) || null;
}
/** Every name a place has been saved under (today's first). Unknown names come back as they are. */
export function namesOf(name, list) {
  const p = placeByName(name, list || getPlaces());
  return p ? [p.name, ...p.aka.filter((a) => a !== p.name)] : [name];
}
/** Live lists (active places only). */
export const getStockPlaces = () => getPlaces({ active: true }).filter((p) => !p.noSale && !p.opening).map((p) => p.name);
export const getPlaceNames = () => getPlaces({ active: true }).map((p) => p.name);
export const getWarehouseNames = () => getPlaces({ active: true }).filter((p) => p.type === 'Warehouse').map((p) => p.name);
export const getBranchNames = () => getPlaces({ active: true }).filter((p) => p.type === 'Branch').map((p) => p.name);
/** Active places that can receive purchase deliveries (stock places with "Can receive purchase deliveries" on). */
export const getReceivingPlaces = () => getPlaces({ active: true }).filter((p) => p.receives && !p.noSale && !p.opening).map((p) => p.name);
/** For filters of past records: today's stock places, then deactivated places (their history stays findable). */
export const getFilterPlaces = () => getStockPlaces().concat(getPlaces().filter((p) => p.active === false && !p.noSale).map((p) => p.name));

const PHONE = /^(\+?880|0)1[3-9][0-9X\- ]{8,10}$/i;
/** Problems with a place before it is saved: { field: message }. Empty when it can be saved. */
export function checkPlace(place, list = getPlaces()) {
  const errs = {};
  const name = String(place.name || '').trim();
  if (!name) errs.name = 'Enter a name.';
  else {
    const other = placeByName(name, list);
    if (other && other.id !== place.id) errs.name = other.name.toLowerCase() === name.toLowerCase() ? 'Another place already has this name.' : `${other.name} used this name before. Choose another.`;
  }
  if (!PLACE_TYPES.includes(place.type)) errs.type = 'Choose Warehouse or Branch.';
  const phone = String(place.phone || '').trim();
  if (phone && !PHONE.test(phone)) errs.phone = 'Enter a Bangladeshi number, for example 01712-345678.';
  const code = String(place.code || '').trim();
  if (code && list.some((p) => p.id !== place.id && p.code.toLowerCase() === code.toLowerCase())) errs.code = 'Another place uses this code.';
  return errs;
}

/**
 * Add or change a place. A new place has no id. Renaming keeps the id and remembers the old name.
 * Returns { ok, errors, place, list }.
 */
export function savePlace(input) {
  const list = getPlaces();
  const errors = checkPlace(input, list);
  if (Object.keys(errors).length) return { ok: false, errors, list };
  const saved = readSaved().slice();
  const before = input.id ? placeById(input.id, list) : null;
  const clean = {
    name: String(input.name).trim(), type: input.type, code: String(input.code || '').trim() || codeOf(input.name),
    address: String(input.address || '').trim(), area: String(input.area || '').trim(), phone: String(input.phone || '').trim(),
    manager: input.manager || '', hours: input.type === 'Branch' ? String(input.hours || '').trim() : '',
    opening: input.type === 'Branch' ? String(input.opening || '').trim() : '',
    counter: input.type === 'Branch' ? !!input.counter : false, receives: !!input.receives,
  };
  if (before && before.fixed) { clean.name = before.name; clean.type = before.type; }   // the damaged bay keeps its name
  let place;
  if (before) {
    const aka = before.aka.slice();
    if (before.name !== clean.name && !aka.includes(before.name)) aka.push(before.name);
    place = { ...before, ...clean, aka: aka.filter((a) => a.toLowerCase() !== clean.name.toLowerCase()) };
  } else {
    place = { id: 'pl-' + Date.now().toString(36), ...clean, active: true, aka: [], at: Date.now() };
  }
  const { builtIn, ...row } = place;   // eslint-disable-line no-unused-vars
  const i = saved.findIndex((s) => s.id === row.id);
  if (i >= 0) saved[i] = row; else saved.push(row);
  writeSaved(saved);
  return { ok: true, errors: {}, place: withDefaults({ ...row, builtIn: !!builtIn }), list: getPlaces() };
}
/** Switch a place on or off. Check placeBlockers (Warehouses / Branches) before switching one off. */
export function setPlaceActive(id, on) {
  const p = placeById(id);
  if (!p) return getPlaces();
  const saved = readSaved().slice();
  const { builtIn, ...row } = { ...p, active: !!on };   // eslint-disable-line no-unused-vars
  const i = saved.findIndex((s) => s.id === id);
  if (i >= 0) saved[i] = row; else saved.push(row);
  writeSaved(saved);
  return getPlaces();
}
/** Remove a place the merchant added (built-in places can only be deactivated). */
export function deletePlace(id) {
  const p = placeById(id);
  if (!p || p.builtIn) return getPlaces();
  writeSaved(readSaved().filter((s) => s.id !== id));
  return getPlaces();
}
