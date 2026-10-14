// demoClock — the demo's seed data was written as if today were Thursday 1 October 2026 (DEMO_TODAY). What looks
// ahead or back from "today" (follow-ups, due dates, waiting requests, trials, last sync) moves with the real
// clock: it is shifted by the whole days between that day and today, so a follow-up "tomorrow" stays tomorrow.
// The shift is worked out in the browser, after mount (the server renders the seed as written, so prerendered
// pages match their first render). The app's clock offset for testing (gc.clock.offset) counts.
// Leaf module: no imports.

const DAY = 864e5;
/** The day the seed data treats as today. */
export const DEMO_TODAY = new Date(2026, 9, 1).getTime();

/** The app's clock (settlements.js › clockNow reads the same test offset). */
export const demoNow = () => { try { return Date.now() + (Number(window.localStorage.getItem('gc.clock.offset')) || 0); } catch { return Date.now(); } };

// Pages read some seeds while they render; their first render in the browser must match the server's, so the
// shift starts only once the page has hydrated (components/DemoClockReady.jsx calls demoClockReady from the root
// layout); the libs' change events then make every open page read its data again.
const ready = () => typeof window !== 'undefined' && !!window.__gcDemoClock;
export function demoClockReady() {
  if (typeof window === 'undefined' || window.__gcDemoClock) return;
  window.__gcDemoClock = true;
  ['gc:tasks', 'gc:leads', 'gc:hr', 'gc:ledger'].forEach((name) => { try { window.dispatchEvent(new CustomEvent(name)); } catch { /* ignore */ } });
}

/** Whole days from DEMO_TODAY to today (0 on the server, before hydration or before that day). */
export function shiftDays(now) {
  if (!ready()) return 0;
  const t = new Date(now == null ? demoNow() : now); t.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((t.getTime() - DEMO_TODAY) / DAY));
}
/** A seed time (ms) moved on by `days`, keeping its time of day. */
export function shiftTime(t, days) {
  if (typeof t !== 'number' || !days) return t;
  const d = new Date(t); d.setDate(d.getDate() + days);
  return d.getTime();
}
/** A seed time of something that already happened, moved on by `days` but never past now (an 8 AM note of the
 *  demo's morning stays in the past when the page is opened at midnight). */
export function shiftPast(t, days, now) {
  const x = shiftTime(t, days);
  if (typeof x !== 'number' || !days) return x;
  return Math.min(x, now == null ? demoNow() : now);
}
const pad = (n) => String(n).padStart(2, '0');
/** A seed day key ('YYYY-MM-DD') moved on by `days`. */
export function shiftKey(key, days) {
  if (!days || !/^\d{4}-\d{2}-\d{2}$/.test(String(key || ''))) return key;
  const [y, m, d] = key.split('-').map(Number);
  const x = new Date(y, m - 1, d + days);
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
}
/** 'D Mon' / 'D Mon YYYY' for a time. */
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const shortDate = (t, year) => { const d = new Date(t); return `${d.getDate()} ${MON[d.getMonth()]}${year ? ' ' + d.getFullYear() : ''}`; };
/** Keep one rebased copy of a seed per day (seeds are read many times per page). */
export function perDay(make) {
  let memo = { days: -1, value: null };
  return () => {
    const days = shiftDays();
    if (memo.days !== days) memo = { days, value: make(days) };
    return memo.value;
  };
}
