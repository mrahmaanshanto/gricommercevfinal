// platform/notices — announcements GridCommerce shows inside the merchant panel (SA-F4; catalogue module S9 Merchant
// notices). Written and scheduled by staff in the super admin (Communications › Merchant notices, /admin/notices); shown
// to the stores they are for as a banner under the top bar and in the "What's new" list (components/MerchantNotices.jsx).
// Shared by both panels like a server would be: browser storage gc.platform.notices, event gc:notices.
//
//   notice  { id, title, text, link { label, href } | null, kind 'news' | 'maintenance', severity 'info' | 'warning',
//             audience { kind 'all' | 'plan' | 'edition' | 'stores', plans [], editions [], stores [] (platform ids) },
//             startAt, endAt (null = until stopped), window { from, to } (maintenance: when the platform is down),
//             dismissible, createdBy, createdAt, stoppedAt, stoppedBy }
//   stateOf(n, t)        'scheduled' | 'live' | 'ended' | 'stopped'
//   reaches(n, store)    does the notice go to this store ({ id, ladder, plan })?
//   forStore(store, t)   live notices for a store, warnings first, newest first
//   saveNotice(f, by) · stopNotice(id, by) · removeNotice(id) · noticeProblems(f)
//   dismissed(person) · dismiss(id, person) · undismiss(id, person)   per person, in this browser (gc.notices.dismissed)
// The merchant panel is store #0090 (Dazzle Shop). Front end only: the live system serves notices from the platform API
// and keeps the dismissals per user account.

export const KEY = 'gc.platform.notices';
export const EVENT = 'gc:notices';
export const DISMISS_KEY = 'gc.notices.dismissed';
export const SELF_SHOP = '0090';
const isBrowser = typeof window !== 'undefined';
const DAY = 864e5, H = 3600e3;

export const AUDIENCE = [['all', 'Every store'], ['plan', 'Stores on a plan'], ['edition', 'Stores on an edition'], ['stores', 'Chosen stores']];
export const KINDS = [['news', 'News'], ['maintenance', 'Maintenance']];
export const SEVERITY = [['info', 'Info'], ['warning', 'Warning']];
export const STATE_LABEL = { scheduled: ['Scheduled', 'primary'], live: ['Live', 'success'], ended: ['Ended', 'neutral'], stopped: ['Stopped', 'neutral'] };
/** The merchant panel's edition ids → the platform's (catalogue.js LADDERS). */
export const EDITION_TO_LADDER = { 'retail-wholesale': 'retail', online: 'online', 'retail-online': 'retail-online', comms: 'connect', full: 'retail-online' };

export function now() {
  if (!isBrowser) return 0;
  try { return Date.now() + (Number(window.localStorage.getItem('gc.clock.offset')) || 0); } catch { return Date.now(); }
}

// ---- demo ---------------------------------------------------------------------------------------------------------------
function seed(t) {
  const sun = (() => { const d = new Date(t); d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7)); d.setHours(2, 0, 0, 0); return d.getTime(); })();
  return {
    v: 1, seq: 5,
    list: [
      { id: 'NT-0004', title: 'Planned maintenance on Sunday night', text: 'The panel and the POS sync stop for about an hour while we upgrade the servers. Your storefront keeps selling; counter sales sync when it ends.', link: null, kind: 'maintenance', severity: 'warning', audience: { kind: 'all', plans: [], editions: [], stores: [] }, startAt: t - 2 * H, endAt: sun + 3 * H, window: { from: sun, to: sun + H }, dismissible: true, createdBy: 'Rakib Hasan', createdAt: t - 3 * H, stoppedAt: null, stoppedBy: null },
      { id: 'NT-0003', title: 'New: business email for your shop', text: 'Get name@yourshop.com mailboxes, set up from Settings in a few minutes.', link: { label: 'Set up email', href: '/email' }, kind: 'news', severity: 'info', audience: { kind: 'all', plans: [], editions: [], stores: [] }, startAt: t - 3 * DAY, endAt: t + 11 * DAY, window: null, dismissible: true, createdBy: 'Tania Sultana', createdAt: t - 3 * DAY, stoppedAt: null, stoppedBy: null },
      { id: 'NT-0002', title: 'Pathao Courier tracking is back', text: 'Tracking updates were late on Tuesday. They are back to normal and every parcel has caught up.', link: null, kind: 'news', severity: 'info', audience: { kind: 'edition', plans: [], editions: ['online', 'retail-online'], stores: [] }, startAt: t - 9 * DAY, endAt: t - 2 * DAY, window: null, dismissible: true, createdBy: 'Farhana Akter', createdAt: t - 9 * DAY, stoppedAt: null, stoppedBy: null },
      { id: 'NT-0001', title: 'Growth plan: 2 more POS counters', text: 'From next month the Growth plan includes 4 POS counters instead of 2, at the same price.', link: { label: 'See plans', href: '/subscription' }, kind: 'news', severity: 'info', audience: { kind: 'plan', plans: ['growth'], editions: [], stores: [] }, startAt: t + 4 * DAY, endAt: t + 18 * DAY, window: null, dismissible: true, createdBy: 'Mahin Khan', createdAt: t - DAY, stoppedAt: null, stoppedBy: null },
    ],
  };
}

// ---- storage ------------------------------------------------------------------------------------------------------------
const EMPTY = { v: 1, seq: 1, list: [] };
let cache = { raw: undefined, db: null };
export function read() {
  if (!isBrowser) return EMPTY;
  let raw = null;
  try { raw = window.localStorage.getItem(KEY); } catch { /* ignore */ }
  if (raw && raw === cache.raw && cache.db) return cache.db;
  let db = null;
  try { db = raw ? JSON.parse(raw) : null; } catch { db = null; }
  if (!db || db.v !== 1) { db = seed(now()); write(db, true); return db; }
  cache = { raw, db };
  return db;
}
function write(db, quiet) {
  try { const raw = JSON.stringify(db); window.localStorage.setItem(KEY, raw); cache = { raw, db }; if (!quiet) window.dispatchEvent(new CustomEvent(EVENT)); } catch { /* ignore */ }
}
function commit(fn) {
  const db = JSON.parse(JSON.stringify(read()));
  const res = fn(db, now());
  if (res && res.ok === false) return res;
  write(db);
  return res || { ok: true };
}

// ---- reads --------------------------------------------------------------------------------------------------------------
export const notices = () => read().list.slice().sort((a, b) => b.createdAt - a.createdAt);
export const noticeById = (id) => read().list.find((n) => n.id === id) || null;
export function stateOf(n, t = now()) {
  if (n.stoppedAt) return 'stopped';
  if (n.startAt > t) return 'scheduled';
  if (n.endAt && n.endAt <= t) return 'ended';
  return 'live';
}
/** Does the notice go to this store? store = { id, ladder, plan } (platform ids). */
export function reaches(n, store) {
  const a = n.audience || { kind: 'all' };
  if (a.kind === 'all') return true;
  if (a.kind === 'plan') return (a.plans || []).includes(store.plan);
  if (a.kind === 'edition') return (a.editions || []).includes(store.ladder);
  if (a.kind === 'stores') return (a.stores || []).includes(store.id);
  return false;
}
/** Live notices for a store: warnings first, then the newest. */
export function forStore(store, t = now()) {
  return read().list.filter((n) => stateOf(n, t) === 'live' && reaches(n, store))
    .sort((a, b) => (a.severity === 'warning' ? 0 : 1) - (b.severity === 'warning' ? 0 : 1) || b.startAt - a.startAt);
}
/** Notices that ended for a store in the last `days` days (the "What's new" list keeps them a while). */
export function recentForStore(store, t = now(), days = 14) {
  return read().list.filter((n) => ['ended', 'stopped'].includes(stateOf(n, t)) && reaches(n, store) && (n.stoppedAt || n.endAt || 0) > t - days * DAY)
    .sort((a, b) => b.startAt - a.startAt);
}
/** How many stores a notice reaches, from a list of { id, ladder, plan }. */
export const reachCount = (n, stores) => stores.filter((s) => reaches(n, s)).length;

// ---- changes (super admin) ------------------------------------------------------------------------------------------------
export function noticeProblems(f) {
  const e = {};
  if (!String(f.title || '').trim()) e.title = 'Give the notice a title.';
  else if (String(f.title).trim().length > 80) e.title = 'Keep the title under 80 letters.';
  if (!String(f.text || '').trim()) e.text = 'Write what the merchants need to know.';
  const a = f.audience || {};
  if (a.kind === 'plan' && !(a.plans || []).length) e.audience = 'Pick at least one plan.';
  if (a.kind === 'edition' && !(a.editions || []).length) e.audience = 'Pick at least one edition.';
  if (a.kind === 'stores' && !(a.stores || []).length) e.audience = 'Add at least one store.';
  if (!f.startAt) e.startAt = 'Pick when it starts.';
  if (f.endAt && f.startAt && f.endAt <= f.startAt) e.endAt = 'It has to end after it starts.';
  if (f.kind === 'maintenance') {
    if (!f.window || !f.window.from || !f.window.to) e.window = 'Give the maintenance start and end.';
    else if (f.window.to <= f.window.from) e.window = 'Maintenance has to end after it starts.';
  }
  if (f.link && (f.link.label || f.link.href) && !(String(f.link.label || '').trim() && /^(\/|https?:\/\/)/.test(String(f.link.href || '').trim()))) e.link = 'A link needs a button name and an address starting with / or https://';
  return e;
}
/** Add (no f.id) or change a notice. A maintenance notice runs until the window ends unless an end is given. */
export function saveNotice(f, by) {
  const e = noticeProblems(f);
  const first = Object.keys(e)[0];
  if (first) return { ok: false, field: first, error: e[first] };
  return commit((db, t) => {
    const link = f.link && String(f.link.label || '').trim() ? { label: String(f.link.label).trim(), href: String(f.link.href).trim() } : null;
    const a = f.audience || { kind: 'all' };
    const audience = { kind: a.kind, plans: a.kind === 'plan' ? a.plans : [], editions: a.kind === 'edition' ? a.editions : [], stores: a.kind === 'stores' ? a.stores : [] };
    const window = f.kind === 'maintenance' ? { from: f.window.from, to: f.window.to } : null;
    const endAt = f.endAt || (window ? window.to : null);
    const base = { title: String(f.title).trim(), text: String(f.text).trim(), link, kind: f.kind || 'news', severity: f.kind === 'maintenance' ? 'warning' : f.severity || 'info', audience, startAt: f.startAt, endAt, window, dismissible: f.dismissible !== false };
    if (f.id) {
      const n = db.list.find((x) => x.id === f.id);
      if (!n) return { ok: false, error: 'Notice not found.' };
      Object.assign(n, base, { editedBy: by, editedAt: t });
      return { ok: true, notice: n };
    }
    const n = { id: 'NT-' + String(db.seq++).padStart(4, '0'), ...base, createdBy: by, createdAt: t, stoppedAt: null, stoppedBy: null };
    db.list.push(n);
    return { ok: true, notice: n };
  });
}
export function stopNotice(id, by) {
  return commit((db, t) => {
    const n = db.list.find((x) => x.id === id);
    if (!n || n.stoppedAt) return { ok: false, error: 'This notice is already stopped.' };
    n.stoppedAt = t; n.stoppedBy = by;
    return { ok: true };
  });
}
export function removeNotice(id) {
  return commit((db) => {
    const before = db.list.length;
    db.list = db.list.filter((x) => x.id !== id);
    return before === db.list.length ? { ok: false, error: 'Notice not found.' } : { ok: true };
  });
}
/** A notice to one store, made by another action (Collections › Ask owner to update payment method). */
export function noticeToStore(shopId, { title, text, link, days = 7, by }) {
  const t = now();
  return saveNotice({ title, text, link, kind: 'news', severity: 'warning', audience: { kind: 'stores', stores: [shopId] }, startAt: t, endAt: t + days * DAY, dismissible: false }, by);
}

// ---- dismissals (merchant panel, per person) -------------------------------------------------------------------------------
function readDismissed() { try { return JSON.parse(window.localStorage.getItem(DISMISS_KEY)) || {}; } catch { return {}; } }
export const dismissed = (person) => (isBrowser ? readDismissed()[person || 'me'] || [] : []);
function setDismissed(person, list) {
  const all = readDismissed();
  all[person || 'me'] = list;
  try { window.localStorage.setItem(DISMISS_KEY, JSON.stringify(all)); window.dispatchEvent(new CustomEvent(EVENT)); } catch { /* ignore */ }
}
export function dismiss(id, person) { const list = dismissed(person); if (!list.includes(id)) setDismissed(person, [...list, id]); }
export function undismiss(id, person) { setDismissed(person, dismissed(person).filter((x) => x !== id)); }
