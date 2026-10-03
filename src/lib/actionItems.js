// actionItems — what needs someone, kept as records (brief #10 "normalized action items"). A page that finds work
// (Home, Finances › Overview, the HR dashboard …) reports it here; each record keeps who owns it, how urgent it is,
// how old it is, one key per issue (the same issue reported by two pages is one item) and how it was resolved.
// The source pages still own the work: an item only points at the page where it is done (href).
//
// An item:
//   key        one per issue, e.g. 'orders:verify', 'finance:late-payouts' (the de-duplication key)
//   label, n   the pill text and its count (or an amount as text); value: optional money at stake
//   href       the page where the work is done
//   source     who reported it ('home', 'finance', 'hr' …; an item may have several: `sources`)
//   area       the menu area it belongs to (navigation.js id), for lists per area
//   owner      role ids that own it (lib/team.js ROLES); people whose roles have '*' access see every item
//   severity   'critical' (money or a customer at risk) · 'high' (due today, late) · 'normal' · 'low' (watch)
//   since      when the oldest thing behind it started (ms); else when it was first seen. age = now − since
//   resolution null (open) or { state: 'done' | 'snoozed' | 'dismissed', by, byName, at, until? }
//
// API:
//   addItem(item)                       add or refresh one item (by key); a done item that comes back opens again,
//                                       a snoozed or dismissed one keeps its resolution
//   listItems({ area, source, user, all, now })  open items, most urgent and oldest first. user: only the items one
//                                       of their roles owns; all: every record (resolved ones too)
//   resolveItem(key, state, { until })  'done' | 'snoozed' (until a time; snoozeUntil('hour' | 'tomorrow')) | 'dismissed'
//   reopenItem(key)
//   syncItems(source, items)            the source's full list right now: adds / refreshes them, and marks the source's
//                                       items it no longer reports as done (by the system). Returns listItems({ source })
//   trackItems(source, rows, { sync, user })  for a page's own pill list: rows { key, label, n, href, severity, owner,
//                                       since … } → the rows still open (and owned by `user`, when given), most urgent
//                                       first, each with its record as `item` (sync: false only reads)
//   ownsItem(user, item) · ageOf(item, now) · ageText(ms) · SEVERITY · ACTIONS_EVENT
// Kept in this browser (gc.actions). Front end only: a real build keeps these server-side, per shop, with history.

import { clockNow } from './settlements';
import { currentUser, rolesOf, ROLES } from './team';

const KEY = 'gc.actions';
export const ACTIONS_EVENT = 'gc:actions';
export const SEVERITY = {
  critical: { rank: 0, label: 'Urgent', tone: 'error' },
  high: { rank: 1, label: 'High', tone: 'warning' },
  normal: { rank: 2, label: 'Normal', tone: 'info' },
  low: { rank: 3, label: 'Low', tone: 'neutral' },
};
const KEEP_DONE = 30 * 24 * 60 * 60 * 1000;   // resolved records are kept 30 days, then dropped

const ssr = () => typeof window === 'undefined';
const now0 = () => { try { return clockNow(); } catch { return Date.now(); } };
function read() {
  if (ssr()) return {};
  try { const v = JSON.parse(window.localStorage.getItem(KEY)); return v && v.v === 1 && v.items ? v.items : {}; } catch { return {}; }
}
function write(items, announce) {
  if (ssr()) return;
  const now = now0();
  // drop old resolved records
  Object.keys(items).forEach((k) => { const r = items[k]; if (r.resolution && r.resolution.state === 'done' && now - r.resolution.at > KEEP_DONE) delete items[k]; });
  try { window.localStorage.setItem(KEY, JSON.stringify({ v: 1, items })); } catch { /* ignore */ }
  if (announce) window.dispatchEvent(new CustomEvent(ACTIONS_EVENT));
}
const who = () => { try { const u = currentUser(); return { by: u.id, byName: u.name }; } catch { return { by: 'system', byName: 'GridCommerce' }; } };
const SYSTEM = { by: 'system', byName: 'GridCommerce' };

/** Is a record open now (no resolution, or a snooze that has run out)? */
export function isOpen(r, now = now0()) {
  if (!r) return false;
  if (!r.resolution) return true;
  return r.resolution.state === 'snoozed' && (r.resolution.until || 0) <= now;
}

function merge(items, item, source, now) {
  const old = items[item.key];
  const fresh = !old || (old.resolution && old.resolution.state === 'done');
  const rec = {
    ...(old || {}),
    ...item,
    source: item.source || source || (old && old.source) || '',
    sources: [...new Set([...(fresh ? [] : (old && old.sources) || []), source || item.source].filter(Boolean))],
    severity: SEVERITY[item.severity] ? item.severity : 'normal',
    owner: Array.isArray(item.owner) ? item.owner : item.owner ? [item.owner] : [],
    firstSeen: fresh ? now : old.firstSeen,
    lastSeen: now,
    since: item.since || (fresh ? now : old.since || old.firstSeen),
    resolution: fresh ? null : old.resolution,
  };
  delete rec.item;
  // a run-out snooze opens again (kept in the history)
  if (rec.resolution && rec.resolution.state === 'snoozed' && rec.resolution.until <= now) rec.resolution = null;
  items[item.key] = rec;
  return rec;
}

/** Add or refresh one item (by key). */
export function addItem(item, source) {
  if (!item || !item.key) return null;
  const items = read();
  const rec = merge(items, item, source, now0());
  write(items, false);
  return rec;
}

/** Does one of the person's roles own the item? ('*' roles own everything; an item with no owner is everyone's.) */
export function ownsItem(user, r) {
  if (!user) return true;
  const roles = rolesOf(user);
  const owner = Array.isArray(r && r.owner) ? r.owner : r && r.owner ? [r.owner] : [];
  return roles.some((x) => ROLES[x] && ROLES[x].access === '*') || !owner.length || owner.some((o) => roles.includes(o));
}
/** Open items, most urgent first, then oldest first. */
export function listItems({ area, source, user, all = false, now = now0() } = {}) {
  return Object.values(read())
    .filter((r) => (all || isOpen(r, now)) && (!area || r.area === area) && (!source || (r.sources || []).includes(source) || r.source === source) && ownsItem(user, r))
    .sort((a, b) => (SEVERITY[a.severity] || SEVERITY.normal).rank - (SEVERITY[b.severity] || SEVERITY.normal).rank || (a.since || 0) - (b.since || 0));
}

/** Resolve an item: 'done', 'snoozed' (until a time) or 'dismissed'; who and when are kept. */
export function resolveItem(key, state, { until } = {}) {
  const items = read();
  const r = items[key];
  if (!r || !['done', 'snoozed', 'dismissed'].includes(state)) return null;
  const now = now0();
  r.resolution = { state, ...who(), at: now, ...(state === 'snoozed' ? { until: until || now + 60 * 60 * 1000 } : {}) };
  r.history = [...(r.history || []).slice(-9), r.resolution];
  write(items, true);
  return r;
}
/** Put a snoozed or dismissed item back on the list. */
export function reopenItem(key) {
  const items = read();
  const r = items[key];
  if (!r) return null;
  r.resolution = null;
  r.history = [...(r.history || []).slice(-9), { state: 'reopened', ...who(), at: now0() }];
  write(items, true);
  return r;
}

/** The source's full current list: add / refresh each, and close what it no longer reports. */
export function syncItems(source, list) {
  const items = read();
  const now = now0();
  const keys = new Set();
  (list || []).filter((x) => x && x.key).forEach((x) => { keys.add(x.key); merge(items, x, source, now); });
  Object.values(items).forEach((r) => {
    if (keys.has(r.key) || !(r.sources || []).includes(source)) return;
    r.sources = r.sources.filter((s) => s !== source);
    if (!r.sources.length && (!r.resolution || r.resolution.state !== 'done')) {
      r.resolution = { state: 'done', ...SYSTEM, at: now };
      r.history = [...(r.history || []).slice(-9), r.resolution];
    }
  });
  write(items, false);
  return listItems({ source, now });
}

/** For a page's pill list: sync (unless sync: false) and return the rows still open, each with its record. */
export function trackItems(source, rows, { sync = true, user } = {}) {
  const list = (rows || []).filter((x) => x && x.key);
  if (sync) syncItems(source, list);
  const items = read();
  const now = now0();
  const rank = (x) => (SEVERITY[x.severity] || SEVERITY.normal).rank;
  return list
    .filter((x) => (!items[x.key] || isOpen(items[x.key], now)) && ownsItem(user, x))
    .map((x, i) => ({ ...x, item: items[x.key] || null, i }))
    .sort((a, b) => rank(a) - rank(b) || a.i - b.i)
    .map(({ i, ...x }) => x);
}

/** How long an item has been waiting (ms). */
export const ageOf = (r, now = now0()) => Math.max(0, now - ((r && (r.since || r.firstSeen)) || now));
/** "5 min", "3 h", "2 d". */
export function ageText(ms) {
  const m = Math.round(ms / 60000);
  if (m < 60) return `${Math.max(1, m)} min`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h`;
  return `${Math.round(h / 24)} d`;
}
/** When a snooze ends: in an hour, or tomorrow at 9 AM. */
export function snoozeUntil(kind, now = now0()) {
  if (kind === 'tomorrow') { const d = new Date(now); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d.getTime(); }
  return now + 60 * 60 * 1000;
}
