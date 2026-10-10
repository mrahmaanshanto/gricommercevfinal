// platform/store — where the console's data lives (front end only: this browser's storage, key gc.platform.db).
//
//   db()            the data; before the page has loaded it in the browser (server render, first paint) it is the
//                   demo world at the design moment (REF, Sun 20 Sep 2026 14:32), so the server and the first
//                   render agree; load() then swaps in the saved data (first visit: a new demo world around now)
//   now()           the console's clock: REF until loaded, then the real time (+ gc.clock.offset for testing)
//   commit(fn)      change the data: fn(db, now) runs, the billing engine catches up, it is saved and screens redraw
//   attach(comp)    for a screen (class component): load, redraw on every change, every 20 s and from other tabs
//   staff()         who is signed in to the console (demo: Mahin Khan, admin; ?staff=<id> switches)
//   resetDemo()     start the demo again (or open any console page with ?reset=1)
// A real build keeps all of this on the server (#19: tenant registry, billing engine, audit) — see CorePlan.

import { seedDB, DATA_VERSION as VERSION } from './seed';
import { dhaka } from './util';
import { STAFF, staffBy } from './catalogue';

export const KEY = 'gc.platform.db';
export const STAFF_KEY = 'gc.platform.staff';
export const EVENT = 'gc:platform';
/** The moment the console was drawn at; the server render uses it. */
export const REF = dhaka(2026, 8, 20, 14, 32);
const isBrowser = typeof window !== 'undefined';

let LIVE = null;
let SNAP = null;
let ticker = (d) => d;
const listeners = new Set();

/** billing.js registers the engine that brings the data up to the current time. */
export function setTicker(fn) { ticker = fn; }

export function clockNow() {
  try { return Date.now() + (Number(window.localStorage.getItem('gc.clock.offset')) || 0); } catch { return Date.now(); }
}
export const isLive = () => !!LIVE;
export const now = () => (LIVE ? clockNow() : REF);

export function db() {
  if (LIVE) return LIVE;
  if (!SNAP) { SNAP = seedDB(REF); ticker(SNAP, REF); }
  return SNAP;
}

/** Read the saved data (or start the demo) — browser only, after the first render. */
export function load() {
  if (LIVE || !isBrowser) return;
  let data = null;
  // ?reset=1 on any console page starts the demo again
  let reset = false;
  try { reset = new URLSearchParams(window.location.search).get('reset') === '1'; } catch { reset = false; }
  try { const raw = reset ? null : window.localStorage.getItem(KEY); if (raw) data = JSON.parse(raw); } catch { data = null; }
  if (!data || data.v !== VERSION) data = seedDB(clockNow());
  LIVE = data;
  ticker(LIVE, clockNow());
  save();
}
function save() {
  try { window.localStorage.setItem(KEY, JSON.stringify(LIVE)); } catch { /* storage full or blocked: keep working in memory */ }
}
function emit() {
  listeners.forEach((f) => { try { f(); } catch { /* a screen that went away */ } });
  if (isBrowser) window.dispatchEvent(new CustomEvent(EVENT));
}

/** Change the data. fn(db, now) may return anything; commit returns it. */
export function commit(fn) {
  load();
  const t = clockNow();
  const out = fn(LIVE, t);
  ticker(LIVE, t);
  save();
  emit();
  return out;
}

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

let timer = null;
let storageBound = false;
/** Connect a screen: load the data, redraw on changes, on the clock and when another tab changes it. */
export function attach(comp) {
  load();
  const redraw = () => comp.forceUpdate();
  const off = subscribe(redraw);
  if (isBrowser && !timer) {
    timer = window.setInterval(() => {
      if (!listeners.size) return;
      const before = JSON.stringify(LIVE.seq);
      ticker(LIVE, clockNow());
      if (JSON.stringify(LIVE.seq) !== before) save();
      emit();
    }, 20000);
  }
  if (isBrowser && !storageBound) {
    storageBound = true;
    window.addEventListener('storage', (e) => {
      if (e.key !== KEY && e.key !== STAFF_KEY) return;
      if (e.key === KEY) { LIVE = null; load(); }
      emit();
    });
  }
  redraw();
  return off;
}

/** Start the demo again (Staff and roles › reset, or by hand). */
export function resetDemo() {
  if (!isBrowser) return;
  try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
  LIVE = null;
  load();
  emit();
}

// ---- who is signed in --------------------------------------------------------------------------------
/** The console staff member using this browser (demo: Mahin Khan, admin). ?staff=<id> switches. */
export function staff() {
  if (!LIVE || !isBrowser) return staffBy('mahin');
  try {
    const q = new URLSearchParams(window.location.search).get('staff');
    if (q && staffBy(q)) { window.localStorage.setItem(STAFF_KEY, q); return staffBy(q); }
    return staffBy(window.localStorage.getItem(STAFF_KEY)) || staffBy('mahin');
  } catch { return staffBy('mahin'); }
}
export function setStaff(id) {
  if (!isBrowser || !staffBy(id)) return;
  try { window.localStorage.setItem(STAFF_KEY, id); } catch { /* ignore */ }
  emit();
}
export const staffList = () => STAFF.filter((s) => !s.invite);

/** The id in the address (?id=0031), read after load so the server render keeps the default. */
export function param(name, fallback = null) {
  if (!LIVE || !isBrowser) return fallback;
  try { return new URLSearchParams(window.location.search).get(name) ?? fallback; } catch { return fallback; }
}
