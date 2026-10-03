// audiences — sending a customer segment to Meta or TikTok as a custom audience (brief #13 › Ad audiences).
// An audience links one segment (segments.js) to one ad account. Each sync works out who may be sent (a phone or
// email, an active account, not left out of ads, and a marketing "yes" on at least one channel), uploads them and
// reads back the platform's match figure, which is a range, never an exact count. Removing an audience, or a
// customer asking to be left out, queues a removal at the platform.
// Ads and their results stay with Analytics; this file only owns which segment is sent and how the sync went.
// Front end only: the platforms are simulated (syncs finish after a few seconds); kept in gc.recovery.audiences.
// Phone numbers and emails would be cleaned and hashed (SHA-256) before upload; hashing hides the raw values but
// does not make the data anonymous.

import { segmentMembers, getSegment } from './segments';
import { getConsent, isAllowed } from './consent';
import { getCrmRows } from './crm';
import { statusOf } from './connections';

export const AUDIENCES_KEY = 'gc.recovery.audiences';
export const AUDIENCES_EVENT = 'gc:audiences';
export const PROVIDERS = { meta: { label: 'Meta', app: 'meta-ads' }, tiktok: { label: 'TikTok', app: 'tiktok-ads' } };
export const USE_CASES = { retarget: 'Show ads to them', exclude: 'Leave them out of ads', lookalike: 'Find people like them' };
export const AUD_STATUS = {
  syncing: { label: 'Syncing', tone: 'info' }, healthy: { label: 'Healthy', tone: 'success' }, partial: { label: 'Partly synced', tone: 'warning' },
  error: { label: 'Error', tone: 'error' }, disconnected: { label: 'Disconnected', tone: 'neutral' }, removing: { label: 'Removing', tone: 'warning' }, removed: { label: 'Removed', tone: 'neutral' },
};
const SYNC_MS = 6000;
const HOUR = 3600 * 1000;

const ssr = () => typeof window === 'undefined';
function seed(now) {
  return [
    { id: 'AUD-2001', name: 'Big spenders · Meta', segmentId: 'TPL-big-spenders', provider: 'meta', providerId: '23851190447720', useCase: 'lookalike', createdAt: now - 20 * 24 * HOUR, by: 'Shakil', syncStartedAt: now - 3 * HOUR - SYNC_MS, lastSyncAt: now - 3 * HOUR, last: { eligible: 4, excluded: 1, added: 1, removed: 0, match: '50–70%' }, removals: [] },
    { id: 'AUD-2002', name: 'Lapsed 90 days · TikTok', segmentId: 'TPL-lapsed-90', provider: 'tiktok', providerId: '7311902284471', useCase: 'retarget', createdAt: now - 9 * 24 * HOUR, by: 'Shakil', syncStartedAt: now - 26 * HOUR - SYNC_MS, lastSyncAt: now - 26 * HOUR, last: { eligible: 0, excluded: 0, added: 0, removed: 0, match: 'Too few to show' }, removals: [] },
  ];
}
function read() {
  if (ssr()) return seed(Date.now());
  try { const v = JSON.parse(window.localStorage.getItem(AUDIENCES_KEY)); if (Array.isArray(v)) return v; } catch { /* fall through */ }
  const s = seed(Date.now()); write(s); return s;
}
function write(list) { try { window.localStorage.setItem(AUDIENCES_KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(AUDIENCES_EVENT)); } catch { /* storage blocked */ } }

/** Why a customer can't go into an ad audience ('' when they can). */
export function adWhyNot(c) {
  if (!c) return 'Unknown customer.';
  if (!(c.phones || []).length && !(c.emails || []).length) return 'No phone or email';
  if (c.status !== 'Active') return 'Account not active';
  if (getConsent(c).adsOut) return 'Left out of ads';
  if (!['sms', 'whatsapp', 'email'].some((k) => isAllowed(c, k, 'marketing'))) return 'No marketing consent';
  return '';
}
/** Who in the segment can be sent: { members, eligible, excluded: { reason: n } }. */
export function audienceCheck(segmentId, rows) {
  const m = segmentMembers(segmentId, rows || getCrmRows());
  const excluded = {};
  const eligible = m.filter((c) => { const w = adWhyNot(c); if (w) excluded[w] = (excluded[w] || 0) + 1; return !w; });
  return { members: m, eligible, excluded };
}
function matchRange(n) { if (n < 20) return 'Too few to show'; const lo = Math.max(10, Math.floor((n * 0.5) / 10) * 10); return lo + '–' + Math.ceil((n * 0.75) / 10) * 10; }

/** An audience with its live state (sync done? account still connected?). */
function live(a, now) {
  const conn = statusOf(PROVIDERS[a.provider].app);
  let status = a.status || 'healthy';
  if (a.removedAt) status = now - a.removedAt > SYNC_MS ? 'removed' : 'removing';
  else if (conn.state === 'off') status = 'disconnected';
  else if (a.syncStartedAt && now - a.syncStartedAt < SYNC_MS) status = 'syncing';
  else if (conn.state === 'attention') status = 'partial';
  else status = 'healthy';
  return { ...a, status, account: conn.account || '', connection: conn.state, connNote: conn.note || '', segment: getSegment(a.segmentId), progress: a.syncStartedAt && now - a.syncStartedAt < SYNC_MS ? Math.round(((now - a.syncStartedAt) / SYNC_MS) * 100) : 100 };
}
export const getAudiences = (now = Date.now()) => read().map((a) => live(a, now)).sort((a, b) => b.createdAt - a.createdAt);

/** Create an audience and start its first sync. → { ok, audience } or { ok: false, error } */
export function createAudience({ name, segmentId, provider, useCase = 'retarget', by = 'Staff' }) {
  if (!getSegment(segmentId)) return { ok: false, error: 'Choose a segment.' };
  if (!PROVIDERS[provider]) return { ok: false, error: 'Choose Meta or TikTok.' };
  if (statusOf(PROVIDERS[provider].app).state === 'off') return { ok: false, error: 'Connect your ' + PROVIDERS[provider].label + ' ad account first.' };
  const now = Date.now();
  const a = { id: 'AUD-' + (2000 + read().length + 1) + '-' + (now % 1000), name: String(name || '').trim() || getSegment(segmentId).name + ' · ' + PROVIDERS[provider].label, segmentId, provider, useCase,
    providerId: String(Math.floor(1e12 + Math.random() * 9e12)), createdAt: now, by, removals: [] };
  write([a, ...read()]);
  syncAudience(a.id);
  return { ok: true, audience: a };
}
/** Sync now: works out who goes in and who comes out since the last sync. */
export function syncAudience(id, now = Date.now()) {
  const list = read(); const a = list.find((x) => x.id === id); if (!a || a.removedAt) return null;
  const chk = audienceCheck(a.segmentId);
  const prevIds = new Set(a.ids || []);
  const ids = chk.eligible.map((c) => c.id);
  const added = ids.filter((x) => !prevIds.has(x)).length;
  const removed = [...prevIds].filter((x) => !ids.includes(x)).length + (a.removals || []).length;
  const excludedTotal = Object.values(chk.excluded).reduce((s, n) => s + n, 0);
  const next = { ...a, ids, syncStartedAt: now, lastSyncAt: now + SYNC_MS, removals: [], last: { eligible: ids.length, excluded: excludedTotal, excludedBy: chk.excluded, excludedTotal, added, removed, match: matchRange(ids.length) } };
  write(list.map((x) => (x.id === id ? next : x)));
  return next;
}
/** Remove an audience: the platform is asked to delete it. */
export function removeAudience(id) { write(read().map((x) => (x.id === id ? { ...x, removedAt: Date.now() } : x))); }
export function forgetRemoved() { write(read().filter((x) => !(x.removedAt && Date.now() - x.removedAt > SYNC_MS))); }
/** A customer asked to be left out (or deleted): queue their removal from every audience. → how many audiences. */
export function removeCustomerFromAudiences(customerId) {
  let n = 0;
  write(read().map((a) => { if ((a.ids || []).includes(customerId)) { n += 1; return { ...a, ids: a.ids.filter((x) => x !== customerId), removals: [...(a.removals || []), customerId] }; } return a; }));
  return n;
}
/** Customer IDs waiting to be removed at the platforms (sent with the next sync). */
export const pendingRemovals = () => read().reduce((s, a) => s + (a.removals || []).length, 0);
