// reports/period — periods, comparisons, time buckets, number formats and CSV for every report.
// A period is [from, to) in ms. Weeks run Saturday → Friday, as shops in Bangladesh count them.

import { clockNow, startOfDay, fromKey, dayKey } from '../settlements';
import { formatBDT } from '../format';

export { clockNow, startOfDay, fromKey, dayKey };
const DAY = 864e5;
export const addDays = (t, n) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n).getTime(); };
export const monthStart = (t, add = 0) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth() + add, 1).getTime(); };
/** Saturday that starts the week of t. */
export const weekStart = (t) => { const d = startOfDay(t); const back = (new Date(d).getDay() + 1) % 7; return addDays(d, -back); };
const quarterStart = (t, add = 0) => { const d = new Date(t); return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3 + add * 3, 1).getTime(); };

export const PRESETS = [
  ['today', 'Today'], ['yesterday', 'Yesterday'], ['week', 'This week'], ['lastweek', 'Last week'],
  ['month', 'This month'], ['lastmonth', 'Last month'], ['quarter', 'This quarter'], ['year', 'This year'], ['custom', 'Custom'],
];
export const PRESET_LABEL = Object.fromEntries(PRESETS);

/** The period [from, to) for a preset. custom = { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' } (inclusive days). */
export function periodOf(preset, now = clockNow(), custom = null) {
  const today = startOfDay(now), tomorrow = addDays(today, 1);
  switch (preset) {
    case 'today': return { from: today, to: tomorrow };
    case 'yesterday': return { from: addDays(today, -1), to: today };
    case 'week': return { from: weekStart(now), to: tomorrow };
    case 'lastweek': return { from: addDays(weekStart(now), -7), to: weekStart(now) };
    case 'lastmonth': return { from: monthStart(now, -1), to: monthStart(now) };
    case 'quarter': return { from: quarterStart(now), to: tomorrow };
    case 'year': return { from: new Date(new Date(now).getFullYear(), 0, 1).getTime(), to: tomorrow };
    case 'custom': {
      if (!custom || !custom.from || !custom.to) return { from: monthStart(now), to: tomorrow };
      let a = fromKey(custom.from), b = fromKey(custom.to);
      if (b < a) [a, b] = [b, a];
      return { from: a, to: addDays(b, 1) };
    }
    case 'month':
    default: return { from: monthStart(now), to: tomorrow };
  }
}

/** The period to compare with: 'previous' (the same length just before) or 'year' (same dates last year), or null. */
export function compareOf(p, mode) {
  if (!mode || mode === 'none') return null;
  if (mode === 'year') {
    const shift = (t) => { const d = new Date(t); return new Date(d.getFullYear() - 1, d.getMonth(), d.getDate()).getTime(); };
    return { from: shift(p.from), to: shift(p.to) };
  }
  // a whole calendar month compares with the whole month before
  const a = new Date(p.from), b = new Date(p.to);
  if (a.getDate() === 1 && b.getDate() === 1 && (b.getMonth() - a.getMonth() + 12) % 12 === 1) return { from: monthStart(p.from, -1), to: p.from };
  const len = Math.round((p.to - p.from) / DAY);
  return { from: addDays(p.from, -len), to: p.from };
}

const MON = (t) => new Date(t).toLocaleString('en', { month: 'short' });
/** '1–30 Sep 2026' · '28 Sep – 4 Oct 2026' for [from, to). */
export function rangeText(from, to) {
  const a = new Date(from), b = new Date(addDays(to, -1));
  if (a.getTime() >= b.getTime()) return `${a.getDate()} ${MON(a)} ${a.getFullYear()}`;
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) return `${a.getDate()}–${b.getDate()} ${MON(b)} ${b.getFullYear()}`;
  return `${a.getDate()} ${MON(a)}${a.getFullYear() !== b.getFullYear() ? ' ' + a.getFullYear() : ''} – ${b.getDate()} ${MON(b)} ${b.getFullYear()}`;
}

/**
 * Time buckets for a trend chart over [from, to): days up to 45 days, weeks (Sat–Fri) up to ~6 months, else months.
 * Returns { unit, buckets: [{ key, label, from, to }], keyOf(t) }.
 */
export function bucketsOf(from, to) {
  const days = Math.round((to - from) / DAY);
  const out = [];
  if (days <= 45) {
    for (let t = from; t < to; t = addDays(t, 1)) out.push({ key: dayKey(t), label: String(new Date(t).getDate()), from: t, to: addDays(t, 1) });
    return { unit: 'day', buckets: out, keyOf: (t) => dayKey(t) };
  }
  if (days <= 190) {
    for (let t = weekStart(from); t < to; t = addDays(t, 7)) out.push({ key: dayKey(t), label: `${new Date(t).getDate()} ${MON(t)}`, from: t, to: addDays(t, 7) });
    return { unit: 'week', buckets: out, keyOf: (t) => dayKey(weekStart(t)) };
  }
  for (let t = monthStart(from); t < to; t = monthStart(t, 1)) out.push({ key: dayKey(t), label: MON(t), from: t, to: monthStart(t, 1) });
  return { unit: 'month', buckets: out, keyOf: (t) => dayKey(monthStart(t)) };
}

// ---- numbers ------------------------------------------------------------------------------------
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
/** Format a value for a report cell: 'money' | 'money0' | 'int' | 'num' | 'pct' | 'date' | 'datetime' | 'days' | 'text'. */
export function fmt(v, format = 'text') {
  if (v == null || v === '' || (typeof v === 'number' && Number.isNaN(v))) return '—';
  switch (format) {
    case 'money': { const n = r2(v); return (n < 0 ? '−' : '') + formatBDT(Math.abs(n), { decimals: Math.round(Math.abs(n) * 100) % 100 ? 2 : 0 }); }
    case 'money0': { const n = Math.round(v); return (n < 0 ? '−' : '') + formatBDT(Math.abs(n)); }
    case 'int': return Math.round(v).toLocaleString('en-IN');
    case 'num': return r2(v).toLocaleString('en-IN', { maximumFractionDigits: 2 });
    case 'pct': return (Math.round(v * 1000) / 10).toLocaleString('en', { maximumFractionDigits: 1 }) + '%';
    case 'days': return `${Math.round(v)} day${Math.round(v) === 1 ? '' : 's'}`;
    case 'date': { const d = new Date(v); return `${d.getDate()} ${MON(d)} ${d.getFullYear()}`; }
    case 'datetime': { const d = new Date(v); return `${d.getDate()} ${MON(d)}, ${d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}`; }
    default: return String(v);
  }
}
/** Plain value for CSV (numbers stay numbers). */
export const csvValue = (v, format) => (typeof v === 'number' && ['money', 'money0', 'int', 'num'].includes(format) ? r2(v) : format === 'pct' && typeof v === 'number' ? r2(v * 100) + '%' : fmt(v, format));
/** Change from b to a as a share (0.12 = +12%), or null when b is 0. */
export const change = (a, b) => (b ? (a - b) / Math.abs(b) : null);
export const sum = (list, f) => r2(list.reduce((a, x) => a + (Number(f(x)) || 0), 0));
/** Group a list: { key: [items] } in first-seen order. */
export function groupBy(list, keyFn) {
  const out = new Map();
  list.forEach((x) => { const k = keyFn(x); if (!out.has(k)) out.set(k, []); out.get(k).push(x); });
  return out;
}
export const inPeriod = (t, p) => t >= p.from && t < p.to;

// ---- CSV ----------------------------------------------------------------------------------------
const cell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
/** Download rows (arrays) as a UTF-8 CSV that Excel opens with Bangla intact. */
export function downloadCsv(name, rows) {
  const text = '﻿' + rows.map((r) => r.map(cell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
