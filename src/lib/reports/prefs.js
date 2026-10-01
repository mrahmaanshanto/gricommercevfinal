// reports/prefs — favourites, recently viewed, saved views and schedules, kept in this browser.

const KEY = 'gc.reports.prefs';
const EVENT = 'gc:reports';
const blank = () => ({ favs: [], recent: [], views: [], schedules: [] });
const read = () => { try { return { ...blank(), ...(JSON.parse(window.localStorage.getItem(KEY)) || {}) }; } catch { return blank(); } };
const write = (p) => { try { window.localStorage.setItem(KEY, JSON.stringify(p)); window.dispatchEvent(new CustomEvent(EVENT)); } catch { /* ignore */ } };
export const PREFS_EVENT = EVENT;
export const getPrefs = () => (typeof window === 'undefined' ? blank() : read());

export function toggleFav(id) { const p = read(); write({ ...p, favs: p.favs.includes(id) ? p.favs.filter((x) => x !== id) : [id, ...p.favs] }); return !p.favs.includes(id); }
export function markViewed(id) { const p = read(); write({ ...p, recent: [id, ...p.recent.filter((x) => x !== id)].slice(0, 8) }); }

/** A saved view: { name, reportId, query (URL search string) }. */
export function saveView(v) { const p = read(); const row = { id: 'v' + Date.now().toString(36), at: Date.now(), ...v }; write({ ...p, views: [row, ...p.views] }); return row; }
export function deleteView(id) { const p = read(); write({ ...p, views: p.views.filter((v) => v.id !== id) }); }

/**
 * A schedule: { reportId (or 'daily-summary'), title, query, every: 'day'|'week'|'month', time: 'HH:MM', weekday?, monthDay?,
 *   to: 'email'|'whatsapp', address, format: 'pdf'|'csv', active }.
 */
export function saveSchedule(s) {
  const p = read();
  const row = s.id ? s : { ...s, id: 's' + Date.now().toString(36), at: Date.now(), active: true };
  write({ ...p, schedules: s.id ? p.schedules.map((x) => (x.id === s.id ? row : x)) : [row, ...p.schedules] });
  return row;
}
export function deleteSchedule(id) { const p = read(); write({ ...p, schedules: p.schedules.filter((s) => s.id !== id) }); }
/** When a schedule next runs, after `now`. */
export function nextRun(s, now = Date.now()) {
  const [h, m] = String(s.time || '20:00').split(':').map(Number);
  const d = new Date(now); d.setSeconds(0, 0); d.setHours(h, m);
  const bump = () => {
    if (s.every === 'week') { const want = s.weekday ?? 6; while (d.getDay() !== want || d.getTime() <= now) d.setDate(d.getDate() + 1); }
    else if (s.every === 'month') { const md = s.monthDay || 1; d.setDate(md); if (d.getTime() <= now) { d.setMonth(d.getMonth() + 1); d.setDate(md); } }
    else if (d.getTime() <= now) d.setDate(d.getDate() + 1);
  };
  bump();
  return d.getTime();
}
