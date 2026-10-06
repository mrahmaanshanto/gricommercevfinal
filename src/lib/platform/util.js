// platform/util — time, money and id helpers for the platform console (src/screens/console).
// The console writes dates the way its design does: "05 Aug 2025", "18 Sep 20:15", "Sun 20 Sep · 14:32",
// 24-hour clock, always Dhaka time (UTC+6, no daylight saving) so the server render and the browser agree.

import { groupIndian } from '../format';

export const DAY = 864e5;
export const MIN = 6e4;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const p2 = (n) => String(n).padStart(2, '0');

/** "৳2,500", "−৳833" (lakh grouping, as everywhere in GridCommerce). */
export const taka = (n) => (n < 0 ? '−৳' : '৳') + groupIndian(Math.abs(Math.round(n || 0)));
/** "1,840" */
export const num = (n) => groupIndian(Math.round(n || 0));
/** "৳88k" for chart labels. */
export const takaK = (n) => '৳' + Math.round((n || 0) / 1000) + 'k';

export const TZ = 6 * 3600e3;
// A Date whose UTC fields are the Dhaka wall clock: read it with getUTC*.
const W = (ms) => { const d = new Date(ms + TZ); return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), h: d.getUTCHours(), mi: d.getUTCMinutes(), wd: d.getUTCDay() }; };
/** Dhaka wall clock -> ms: dhaka(2026, 8, 20, 14, 32) */
export const dhaka = (y, m, d = 1, h = 0, mi = 0) => Date.UTC(y, m, d, h, mi) - TZ;
/** "05 Aug 2025" */
export const dmy = (ms) => { const d = W(ms); return `${p2(d.d)} ${MON[d.m]} ${d.y}`; };
/** "18 Sep" */
export const dm = (ms) => { const d = W(ms); return `${p2(d.d)} ${MON[d.m]}`; };
/** "20:15" */
export const hm = (ms) => { const d = W(ms); return `${p2(d.h)}:${p2(d.mi)}`; };
/** "18 Sep 20:15" */
export const dmhm = (ms) => `${dm(ms)} ${hm(ms)}`;
/** "Sun 20 Sep · 14:32" (the top bar clock) */
export const topClock = (ms) => { const d = W(ms); return `${WD[d.wd]} ${p2(d.d)} ${MON[d.m]} · ${hm(ms)}`; };
/** "Sun 11:00" */
export const wdhm = (ms) => `${WD[W(ms).wd]} ${hm(ms)}`;
export const weekday = (ms) => WD[W(ms).wd];
/** "Sep" for a period "2026-09" or a time */
export const monthOf = (x) => (typeof x === 'string' ? MON[Number(x.slice(5, 7)) - 1] : MON[W(x).m]);
/** "September" */
export const monthLong = (x) => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][typeof x === 'string' ? Number(x.slice(5, 7)) - 1 : W(x).m];
/** "2026-09" */
export const periodOf = (ms) => { const d = W(ms); return `${d.y}-${p2(d.m + 1)}`; };
export const yearOf = (ms) => W(ms).y;
export const dayOfMonth = (ms) => W(ms).d;

export const startOfDay = (ms) => Math.floor((ms + TZ) / DAY) * DAY - TZ;
export const startOfMonth = (ms) => { const d = W(ms); return dhaka(d.y, d.m, 1); };
/** Whole calendar days from a to b (b later = positive). */
export const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / DAY);
/** The same day of the month n months later (the day is kept, capped at 28). */
export function addMonths(ms, n, day) {
  const d = W(ms);
  const keep = Math.min(day || d.d, 28);
  return dhaka(d.y, d.m + n, keep, d.h, d.mi);
}
/** A time on the same day: at(ms, 11, 0) */
export const at = (ms, h, m = 0) => startOfDay(ms) + h * 3600e3 + m * 6e4;

/** "Today 10:02" · "Yesterday" · "3 days ago" · "02 Sep" · "02 Sep 2025" */
export function ago(ms, now) {
  if (!ms) return '—';
  const n = daysBetween(ms, now);
  if (n <= 0) return 'Today ' + hm(ms);
  if (n === 1) return 'Yesterday';
  if (n < 7) return n + ' days ago';
  return W(ms).y === W(now).y ? dm(ms) : dmy(ms);
}
/** "Today" · "Yesterday" · "6 days ago" (days only) */
export function lastSeen(days) {
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return days + ' days ago';
}
/** "Today 16:00" · "Tomorrow 11:00" · "Mon" · "06 Oct" (for times ahead) */
export function ahead(ms, now) {
  const n = daysBetween(now, ms);
  if (n <= 0) return 'Today ' + hm(ms);
  if (n === 1) return 'Tomorrow ' + hm(ms);
  if (n < 7) return weekday(ms) + ' ' + hm(ms);
  return dm(ms);
}
/** "2 min 41 s" */
export function dur(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return s + ' s';
  return `${Math.floor(s / 60)} min ${p2(s % 60)} s`;
}

/** Initials: "Dhaka Gadget Hub" -> "DG" */
export const initials = (name) => String(name || '').split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
export const pad4 = (n) => String(n).padStart(4, '0');

// ---- deterministic randomness for the demo data ---------------------------------------------------
export function hash(str) {
  let h = 2166136261;
  for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function rng(seed) {
  let a = typeof seed === 'number' ? seed >>> 0 : hash(seed);
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.int = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
  next.pick = (arr) => arr[Math.floor(next() * arr.length)];
  next.chance = (p) => next() < p;
  return next;
}

/** Parse "2,500" / "৳ 2,500" -> 2500 (NaN when empty). */
export const parseAmount = (s) => Number(String(s ?? '').replace(/[^0-9.\-]/g, ''));

/** A small sparkline path for the KPI cards (64 x 22 box), from a list of numbers. */
export function spark(values, w = 64, h = 22) {
  const v = values.length ? values : [0, 0];
  const lo = Math.min(...v), hi = Math.max(...v);
  const span = hi - lo || 1;
  const pts = v.map((y, i) => [(i * w) / (v.length - 1 || 1), 3 + (h - 6) * (1 - (y - lo) / span)]);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return { line, area: `${line} L${w},${h} L0,${h} Z` };
}
