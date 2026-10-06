// countSessions — stock counts as sessions (Nayeem's Inventory brief #2 › "Stock Counts": Quick / Blind / Cycle / Full,
// snapshot, recount, several counters).
//
// A session fixes its scope when it starts: the place, the area (a category, or the whole place) and the products. It
// records a snapshot of what the system had on hand at that moment. Selling may go on while people count: a sale,
// receipt or transfer after the snapshot changes what should be on the shelf, so the expected number is
//   expected = snapshot + what changed since the snapshot (on hand now − on hand at the snapshot)
// and only counted − expected is a difference. Nothing sold during the count shows up as missing.
//
//   Each count line keeps who counted what: counts [{ by, qty, at, pass }]. Several people can count one session; in one
//   pass their numbers add up (each counts their own shelf). A difference bigger than recountLimit() asks for a recount
//   (pass 2, ideally by someone else), except in a Quick count; the latest pass is the one that counts.
//   Uncounted products: unchanged in Quick, Blind and Cycle counts; in a Full count the session says (keep or zero).
//   Posting needs a manager (ManagerPin) and writes one 'count' stock move per difference, with the operation key
//   session + product, so posting twice changes nothing.
// Front end only: gc.stock.countSessions. A count started before sessions existed (gc.stock.count.draft) becomes one.

import { stockAt, addMove, getMoves, getCatalog } from './stock';
import { namesOf } from './locations';

const KEY = 'gc.stock.countSessions';
const OLD_DRAFT = 'gc.stock.count.draft';
export const COUNT_EVENT = 'gc:count-sessions';
export const COUNT_MODES = [
  { k: 'quick', label: 'Quick count', hint: 'A spot check. You see the system number.', blind: false, recount: false },
  { k: 'blind', label: 'Blind count', hint: 'The system number stays hidden until you finish.', blind: true, recount: true },
  { k: 'cycle', label: 'Cycle count', hint: 'One area or a set of products, by one or more people.', blind: true, recount: true },
  { k: 'full', label: 'Full count', hint: 'Everything at the place. Decide what happens to products nobody counts.', blind: true, recount: true },
];
export const modeBy = (k) => COUNT_MODES.find((m) => m.k === k) || COUNT_MODES[0];

const at = (d, h, m) => new Date(2026, 8, d, h, m || 0).getTime();
const SEED = [
  { id: 'CNT-0007', mode: 'cycle', place: 'Dhanmondi branch', area: 'Phones', skus: ['PH-RLM-N50', 'AU-EAR-PRO'], snapshotAt: at(20, 17, 30), snapshot: { 'PH-RLM-N50': 13, 'AU-EAR-PRO': 9 },
    lines: { 'PH-RLM-N50': { counts: [{ by: 'Suman', qty: 12, at: at(20, 17, 52), pass: 1 }] }, 'AU-EAR-PRO': { counts: [{ by: 'Suman', qty: 9, at: at(20, 17, 55), pass: 1 }] } },
    after: { 'PH-RLM-N50': 0, 'AU-EAR-PRO': 0 }, status: 'posted', createdBy: 'Suman', postedAt: at(20, 18, 10), postedBy: 'Rakib Hasan', uncounted: 'keep', seed: true },
  { id: 'CNT-0006', mode: 'full', place: 'Mirpur branch', area: 'all', skus: [], snapshotAt: at(12, 21, 0), snapshot: {}, lines: {}, status: 'posted', createdBy: 'Moumita Das', postedAt: at(12, 23, 40), postedBy: 'Nabila Rahman', uncounted: 'keep', seed: true, summary: '64 products · 3 differences' },
];

const ssr = () => typeof window === 'undefined';
const read = () => { if (ssr()) return SEED; try { const v = JSON.parse(window.localStorage.getItem(KEY)); return Array.isArray(v) ? v : SEED; } catch { return SEED; } };
const write = (list) => { try { window.localStorage.setItem(KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(COUNT_EVENT)); } catch { /* ignore */ } };
const nextId = (list) => 'CNT-' + String(list.reduce((m, x) => Math.max(m, Number(String(x.id).split('-')[1]) || 0), 0) + 1).padStart(4, '0');

/** Every session, newest first. A count saved by the old screen is turned into a session the first time. */
export function getSessions() {
  if (ssr()) return SEED;
  let list = read();
  try {
    const d = JSON.parse(window.localStorage.getItem(OLD_DRAFT));
    if (d && d.place) {
      const s = makeSession(list, { mode: 'quick', place: d.place, area: d.area || 'all', pause: d.pause !== false, by: 'Staff', at: d.started || Date.now() });
      Object.keys(d.c || {}).forEach((sku) => { if (s.lines[sku] || s.skus.includes(sku)) s.lines[sku] = { counts: [{ by: 'Staff', qty: d.c[sku], at: Date.now(), pass: 1 }] }; });
      list = [s, ...list];
      write(list);
      window.localStorage.removeItem(OLD_DRAFT);
    }
  } catch { /* ignore */ }
  return list;
}
export const sessionBy = (id) => getSessions().find((s) => s.id === id) || null;
/** The count in progress (counting or waiting for recounts), if any. */
export const activeSession = () => getSessions().find((s) => s.status === 'counting' || s.status === 'recount') || null;

/** Products in a count's scope: products stocked at the place, in the area (a category) or the list given. */
export function scopeOf(place, area, skus) {
  const names = namesOf(place);
  return getCatalog().filter((p) => {
    if (p.format && p.format !== 'physical') return false;
    if (p.bundle && p.bundle.type !== 'kit') return false;
    if (skus && skus.length) return skus.includes(p.sku);
    if (area && area !== 'all' && p.cat !== area) return false;
    return names.some((n) => ((p.on || {})[n] || 0) > 0) || stockAt(p.sku, place).onHand !== 0;
  });
}

function makeSession(list, { mode, place, area, skus, pause, by, at: t, uncounted }) {
  const scope = scopeOf(place, area, skus);
  const snapshot = {};
  scope.forEach((p) => { snapshot[p.sku] = stockAt(p.sku, place).onHand; });
  return { id: nextId(list), mode: mode || 'quick', place, area: area || 'all', skus: scope.map((p) => p.sku), snapshotAt: t || Date.now(), snapshot, lines: {}, status: 'counting',
    pause: pause !== false, createdBy: by || 'Staff', counters: [by || 'Staff'], uncounted: uncounted || 'keep' };
}
/** Start a count: { mode, place, area, skus, pause, by, uncounted }. The snapshot is taken now. */
export function startSession(opts) {
  const list = getSessions();
  const s = makeSession(list, opts);
  write([s, ...list]);
  return s;
}
function update(id, fn) {
  let out = null;
  const list = getSessions().map((s) => { if (s.id !== id) return s; out = fn({ ...s, lines: { ...s.lines } }); return out; });
  write(list);
  return out;
}
/** The pass a line is on: 2 once a recount was asked for it. */
const passOf = (s, sku) => ((s.recount || {})[sku] ? 2 : 1);
/** Set what `by` counted for a product (in the line's current pass). serial: a unit's number scanned while counting. */
export function setCount(id, sku, qty, by, serial) {
  return update(id, (s) => {
    const pass = passOf(s, sku);
    const line = { counts: [], serials: [], ...(s.lines[sku] || {}) };
    const counts = line.counts.filter((c) => !(c.by === by && c.pass === pass));
    if (qty != null) counts.push({ by, qty: Math.max(0, Number(qty) || 0), at: Date.now(), pass });
    s.lines[sku] = { ...line, counts, serials: serial && !line.serials.includes(serial) ? [...line.serials, serial] : line.serials };
    if (by && !(s.counters || []).includes(by)) s.counters = [...(s.counters || []), by];
    if (!s.skus.includes(sku)) { s.skus = [...s.skus, sku]; s.snapshot = { ...s.snapshot, [sku]: stockAt(sku, s.place).onHand }; }
    return s;
  });
}
/** What one person counted for a product in the line's current pass (null = not counted by them). */
export function myCount(s, sku, by) {
  const c = ((s.lines[sku] || {}).counts || []).find((x) => x.by === by && x.pass === passOf(s, sku));
  return c ? c.qty : null;
}

/** Recount when the difference is more than 2 pieces and more than this % of what was expected. */
export const recountLimit = () => 10;

/**
 * One line's numbers: { sku, snapshot, since (changes after the snapshot), expected, counted (null = not counted),
 * diff, counters (names), pass, recount (asked), needsRecount (big difference, not recounted yet), serials }.
 */
export function lineOf(s, sku, now = null) {
  const snapshot = s.snapshot[sku] || 0;
  const onHand = now == null ? stockAt(sku, s.place).onHand : now;
  const since = s.status === 'posted' ? (s.after || {})[sku] || 0 : onHand - snapshot;
  const expected = snapshot + since;
  const line = s.lines[sku] || { counts: [] };
  const pass = passOf(s, sku);
  const inPass = line.counts.filter((c) => c.pass === pass);
  const counted = inPass.length ? inPass.reduce((a, c) => a + c.qty, 0) : null;
  const diff = counted == null ? 0 : counted - expected;
  const big = Math.abs(diff) > 2 && Math.abs(diff) > Math.max(1, expected) * recountLimit() / 100;
  return { sku, snapshot, since, expected, counted, diff, pass, counters: Array.from(new Set(inPass.map((c) => c.by))), recount: pass === 2,
    needsRecount: modeBy(s.mode).recount && pass === 1 && counted != null && big, serials: line.serials || [], history: line.counts };
}
/** Every line of a session plus the totals. */
export function summaryOf(s) {
  const lines = s.skus.map((sku) => lineOf(s, sku));
  const counted = lines.filter((l) => l.counted != null);
  return { lines, counted: counted.length, total: lines.length, diffs: counted.filter((l) => l.diff !== 0), recounts: lines.filter((l) => l.needsRecount), moved: lines.filter((l) => l.since !== 0) };
}
/** Ask for a recount of the lines with big differences. Returns how many. */
export function askRecounts(id) {
  let n = 0;
  update(id, (s) => {
    const rc = { ...(s.recount || {}) };
    summaryOf(s).recounts.forEach((l) => { rc[l.sku] = true; n++; });
    return { ...s, recount: rc, status: n ? 'recount' : s.status };
  });
  return n;
}
/** A blind count shows its differences (after the first Finish). */
export const revealSession = (id) => update(id, (s) => ({ ...s, revealed: true }));
export const setSessionPause = (id, pause) => update(id, (s) => ({ ...s, pause: !!pause }));
export const setUncounted = (id, how) => update(id, (s) => ({ ...s, uncounted: how === 'zero' ? 'zero' : 'keep' }));
export const cancelSession = (id, by) => update(id, (s) => ({ ...s, status: 'cancelled', cancelledAt: Date.now(), cancelledBy: by || 'Staff' }));

/** Post the differences (a manager approved): one 'count' move per line, keyed by session + product. */
export function postSession(id, manager) {
  const s = sessionBy(id);
  if (!s || (s.status !== 'counting' && s.status !== 'recount')) return null;
  const sum = summaryOf(s);
  const zero = s.mode === 'full' && s.uncounted === 'zero';
  const after = {};
  let pcs = 0, posted = 0;
  sum.lines.forEach((l) => {
    after[l.sku] = l.since;
    const diff = l.counted == null ? (zero ? -l.expected : 0) : l.diff;
    if (!diff) return;
    const who = l.counted == null ? 'Not counted' : l.counters.join(', ');
    addMove({ sku: l.sku, place: s.place, qty: diff, kind: 'count', ref: s.id, op: s.id + ':' + l.sku, by: who + ' · approved by ' + manager,
      reason: l.counted == null ? 'Full count · not counted, set to 0' : 'Count difference · expected ' + l.expected + (l.since ? ' (' + l.snapshot + ' at the snapshot, ' + (l.since > 0 ? '+' : '') + l.since + ' since)' : '') + ', counted ' + l.counted });
    pcs += Math.abs(diff); posted++;
  });
  return update(id, (x) => ({ ...x, status: 'posted', postedAt: Date.now(), postedBy: manager, after, result: { lines: posted, pcs, counted: sum.counted } }));
}
/** The stock moves at the place since the snapshot (sales, receipts, transfers), for "what changed while you counted". */
export function movesSince(s, sku) {
  const names = namesOf(s.place);
  return getMoves().filter((m) => m.at > s.snapshotAt && names.includes(m.place) && (!sku || m.sku === sku) && !(m.kind === 'count' && m.ref === s.id));
}
