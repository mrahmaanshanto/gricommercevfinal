// traffic — visitors to the online store (demo): for every day from 1 September, visitors by hour, where
// they came from and on what device. The same day always gets the same numbers (a fixed random seed per
// date); today counts only up to now (the current hour in proportion to the minutes gone).
// The dashboard divides the day's online orders by these visitors for the conversion rate.
// Front end only; a real shop reads this from its analytics (Tracking & analytics › Connections).

const HOUR = 60 * 60 * 1000;
const FROM = new Date(2026, 8, 1).getTime();
// share of a day's visitors in each hour: quiet at night, a lunch bump, busiest after dinner
const CURVE = [3, 2, 1.2, 0.8, 0.7, 0.9, 1.6, 2.6, 3.6, 4.6, 5.4, 5.8, 6.2, 6.4, 5.8, 5.4, 5.3, 5.6, 6.2, 7.2, 8.6, 9.4, 8.4, 5.6];
const CURVE_SUM = CURVE.reduce((a, x) => a + x, 0);
/** Where visitors come from, in this order everywhere (legend, charts). */
export const SOURCES = ['Facebook', 'Instagram', 'Google', 'Direct', 'TikTok'];
const SOURCE_MIX = [38, 12, 24, 18, 8];
export const DEVICES = ['Mobile', 'Desktop', 'Tablet'];

function seeded(n) {
  let a = n >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const dayStart = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const dateKey = (t) => { const d = new Date(t); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };

const MEMO = new Map();
/** The whole day, every hour (before it is cut at now). */
function fullDay(day) {
  const key = dateKey(day);
  if (MEMO.has(key)) return MEMO.get(key);
  const rand = seeded(key * 7 + 3);
  const n = Math.max(0, Math.floor((day - FROM) / (24 * HOUR)));
  const weekday = new Date(day).getDay();
  // 480–760 visitors a day, growing a little week on week; Fridays busier, Sundays quieter
  const total = (480 + rand() * 280) * (1 + n * 0.003) * (weekday === 5 ? 1.18 : weekday === 0 ? 0.92 : 1);
  const byHour = CURVE.map((w) => Math.max(0, Math.round(total * (w / CURVE_SUM) * (0.82 + rand() * 0.36))));
  const mix = SOURCE_MIX.map((w) => w * (0.8 + rand() * 0.4));
  const mobile = 0.74 + rand() * 0.08, tablet = 0.03 + rand() * 0.02;
  const out = { byHour, mix, devices: [mobile, 1 - mobile - tablet, tablet] };
  MEMO.set(key, out);
  return out;
}

/**
 * Visitors on the day that contains `day`, as of `now`:
 * { total, byHour: [24] (null for hours still to come), sources: [{ name, visitors }], devices: [{ name, share }], est: true }
 */
export function visitsOn(day, now = Date.now()) {
  const from = dayStart(day);
  const blank = { total: 0, byHour: Array(24).fill(0), sources: SOURCES.map((name) => ({ name, visitors: 0 })), devices: DEVICES.map((name) => ({ name, share: 0 })), est: true };
  if (from < FROM || from > now) return { ...blank, byHour: Array(24).fill(from > now ? null : 0) };
  const f = fullDay(from);
  const byHour = f.byHour.map((v, h) => {
    const start = from + h * HOUR;
    if (start > now) return null;
    if (start + HOUR <= now) return v;
    return Math.round(v * ((now - start) / HOUR));
  });
  const total = byHour.reduce((a, v) => a + (v || 0), 0);
  const mixSum = f.mix.reduce((a, x) => a + x, 0);
  const shares = f.mix.map((w) => Math.round(total * w / mixSum));
  shares[0] += total - shares.reduce((a, x) => a + x, 0);
  return { total, byHour, sources: SOURCES.map((name, i) => ({ name, visitors: shares[i] })), devices: DEVICES.map((name, i) => ({ name, share: f.devices[i] })), est: true };
}

/** Visitors per day for `days` days ending on the day that contains `now` (oldest first): [{ day, visitors }]. */
export function visitsByDay(days, now = Date.now()) {
  const out = [];
  const end = dayStart(now);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end); d.setDate(d.getDate() - i);
    out.push({ day: d.getTime(), visitors: visitsOn(d.getTime(), now).total });
  }
  return out;
}
