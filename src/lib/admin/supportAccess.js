// admin/supportAccess — support access sessions (review SA-F1). GridCommerce staff never open a merchant's store "as
// the owner" on their own: they ask, the owner approves (or reads out a one-time PIN), staff pick what they may do and
// for how long, and every session is kept in the store's access log.
//
//   Steps: requestAccess → owner approves (ownerApproved, demo) or approveWithPin → startSession(scope, minutes)
//          → a banner across the super admin while it runs (time left, End session) → endSession, or the time runs out
//   Reads: sessionsFor(shopId) · allSessions() · activeFor(staffId, t) · stateOf(s, t) · pinOf(s) (demo only)
//   Rights: asking needs Edit on Support; "Approved changes" also needs Edit on Merchants (Roles & permissions).
//
// Front end only (createStore key `access`). In a real build the owner gets the request by SMS and in their panel,
// approves it there or reads the one-time PIN from it, and the server opens the store with a token limited to the
// scope and the time; here the "Owner approved" button stands in for the owner, and the demo shows the PIN.

import { createStore } from './store';
import { admin, logActivity } from './admin';
import { ADMIN_ROLES } from './roles';
import { commit, db as platformDb, staff as currentStaff } from '@/lib/platform/store';
import { shopOf } from '@/lib/platform/billing';
import { DAY, MIN, at, startOfDay, rng } from '@/lib/platform/util';

export const SCOPES = [
  ['view', 'View only', 'See settings, orders and logs. Nothing can be changed.'],
  ['changes', 'Approved changes', 'Make the changes the owner agreed to. Each change is logged.'],
];
export const scopeLabel = (k) => (SCOPES.find((x) => x[0] === k) || [k, k])[1];
export const DURATIONS = [15, 30, 60];
/** An approval not used within this time lapses. */
export const APPROVAL_VALID = 15 * MIN;

const PIN_LEN = 6;
const pinFor = (id, t) => { const r = rng('pin:' + id + ':' + t); return Array.from({ length: PIN_LEN }, () => r.int(0, 9)).join(''); };

function seed(now) {
  const today = startOfDay(now);
  const list = [];
  let n = 1;
  // the sessions the activity log already tells of (lib/admin/admin.js seed) and the one on Dhaka Gadget Hub
  const add = (daysAgo, h, mi, shopId, by, byId, minutes, used, reason, ticketId, scope = 'view', how = 'pin') => {
    const startedAt = at(today - daysAgo * DAY, h, mi);
    if (startedAt > now) return;
    const id = 'ACC-' + String(n++).padStart(4, '0');
    list.push({
      id, shopId, ticketId, reason, by, byId, requestedAt: startedAt - 4 * MIN, approvedAt: startedAt - MIN, approvedHow: how,
      scope, minutes, startedAt, endsAt: startedAt + minutes * MIN, endedAt: startedAt + used * MIN, endedBy: by, endNote: 'Done',
      status: 'ended', pin: null,
    });
  };
  add(19, 15, 2, '0044', 'Rakib Hasan', 'rakib', 15, 12, 'Courier settings', null);
  add(13, 17, 20, '0012', 'Farhana Akter', 'farhana', 15, 8, 'Checkout not loading', null, 'changes', 'owner');
  add(4, 16, 25, '0017', 'Farhana Akter', 'farhana', 15, 5, 'Product import', null);
  add(1, 14, 33, '0031', 'Farhana Akter', 'farhana', 15, 6, 'Steadfast orders not syncing', 'T-2291');
  add(1, 10, 20, '0038', 'Rakib Hasan', 'rakib', 15, 9, 'Domain check', null);
  return { list: list.sort((a, b) => b.requestedAt - a.requestedAt), seq: n };
}

export const access = createStore({ key: 'access', version: 1, seed });

// ---- rights ---------------------------------------------------------------------------------------------------------
function rights(s = currentStaff()) {
  let d = null;
  try { admin.load(); d = admin.get(); } catch { d = null; }
  const rid = d && d.assign && s.id in d.assign ? d.assign[s.id] : s.role;
  const role = d ? (d.roles || []).find((r) => r.id === rid) : null;
  const can = (area, op) => rid === 'admin' || !!(role && role.perms[area] && role.perms[area][op]);
  const title = (role && role.title) || (ADMIN_ROLES[rid] || {}).title || 'No role';
  return { ask: can('area-support', 'edit'), changes: can('area-support', 'edit') && can('area-merchants', 'edit'), title };
}
/** May this person ask for access, and with which scopes? { ok, changes, reason } */
export function accessRight(s = currentStaff()) {
  const r = rights(s);
  return { ok: r.ask, changes: r.changes, reason: r.ask ? '' : `Needs Edit on Support (Roles & permissions). You are ${r.title}.` };
}

// ---- reads ----------------------------------------------------------------------------------------------------------
/** asked · approved · active · ended · expired (time ran out) · lapsed (approval not used) · declined · withdrawn */
export function stateOf(s, t) {
  if (s.status === 'active') return s.endsAt <= t ? 'expired' : 'active';
  if (s.status === 'approved') return s.approvedAt + APPROVAL_VALID <= t ? 'lapsed' : 'approved';
  return s.status;
}
export const STATE_LABEL = { asked: 'Waiting for the owner', approved: 'Owner approved', active: 'On now', ended: 'Ended', expired: 'Time ran out', lapsed: 'Approval lapsed', declined: 'Owner declined', withdrawn: 'Withdrawn' };
export const STATE_TONE = { asked: 'warning', approved: 'primary', active: 'success', ended: 'neutral', expired: 'neutral', lapsed: 'neutral', declined: 'error', withdrawn: 'neutral' };
export const allSessions = () => access.get().list;
export const sessionsFor = (shopId) => access.get().list.filter((s) => s.shopId === shopId);
export const sessionById = (id) => access.get().list.find((s) => s.id === id) || null;
/** The person's session that is on now (one at a time). */
export const activeFor = (staffId, t) => access.get().list.find((s) => s.byId === staffId && stateOf(s, t) === 'active') || null;
/** The person's open request for a store (asked or approved, not started yet). */
export const openRequest = (staffId, shopId, t) => access.get().list.find((s) => s.byId === staffId && s.shopId === shopId && ['asked', 'approved'].includes(stateOf(s, t))) || null;
/** Demo only: the one-time PIN the owner would read out from their panel. */
export const pinOf = (s) => (s && s.pin) || null;
export const usedMinutes = (s) => Math.max(1, Math.round(((s.endedAt || s.endsAt) - s.startedAt) / MIN));

// ---- changes --------------------------------------------------------------------------------------------------------
const me = () => currentStaff();
/** The store's name for a session row. */
export const shopName = (shopId) => (shopOf(platformDb(), shopId) || { name: '#' + shopId }).name;

function storeEvent(shopId, text) {
  commit((db, t) => { db.events.push({ id: 'E' + db.seq.ev++, shopId, at: t, kind: 'session', text, by: me().name }); return null; });
}

/** Ask the owner for access. f: { shopId, ticketId?, reason } */
export function requestAccess({ shopId, ticketId = null, reason }) {
  const s = me();
  const r = accessRight(s);
  if (!r.ok) return { ok: false, error: r.reason };
  if (!shopId) return { ok: false, error: 'Pick the store.' };
  if (!String(reason || '').trim()) return { ok: false, field: 'reason', error: 'Say why you need to open the store.' };
  const out = access.commit((d, t) => {
    if (d.list.some((x) => x.byId === s.id && stateOf(x, t) === 'active')) return { ok: false, error: 'End the session you have on now first.' };
    const open = d.list.find((x) => x.byId === s.id && x.shopId === shopId && ['asked', 'approved'].includes(stateOf(x, t)));
    if (open) return { ok: true, session: open, existing: true };
    const id = 'ACC-' + String(d.seq++).padStart(4, '0');
    const x = {
      id, shopId, ticketId, reason: String(reason).trim(), by: s.name, byId: s.id, requestedAt: t, approvedAt: null, approvedHow: null,
      scope: null, minutes: null, startedAt: null, endsAt: null, endedAt: null, endedBy: null, endNote: '', status: 'asked', pin: pinFor(id, t),
    };
    d.list.unshift(x);
    return { ok: true, session: x };
  });
  if (out.ok && !out.existing) storeEvent(shopId, `Support access asked by ${s.name}${ticketId ? ' for ' + ticketId : ''} · ${out.session.reason} · the owner is asked by SMS and in their panel`);
  return out;
}

function approve(id, how) {
  const s = me();
  const out = access.commit((d, t) => {
    const x = d.list.find((y) => y.id === id);
    if (!x || stateOf(x, t) !== 'asked') return { ok: false, error: 'This request is not waiting for the owner.' };
    if (x.byId !== s.id) return { ok: false, error: 'Only the person who asked can use the approval.' };
    Object.assign(x, { status: 'approved', approvedAt: t, approvedHow: how, pin: null });
    return { ok: true, session: x };
  });
  if (out.ok) storeEvent(out.session.shopId, `Owner approved support access for ${s.name}${how === 'pin' ? ' with a one-time PIN' : ' in their panel'}`);
  return out;
}
/** The owner approved it in their own panel (a Services order's store-access card, lib/platform/services.js). */
export function approvedInPanel(id) {
  const out = access.commit((d, t) => {
    const x = d.list.find((y) => y.id === id);
    if (!x || stateOf(x, t) !== 'asked') return { ok: false, error: 'This request is not waiting for the owner.' };
    Object.assign(x, { status: 'approved', approvedAt: t, approvedHow: 'owner', pin: null });
    return { ok: true, session: x };
  });
  if (out.ok) storeEvent(out.session.shopId, `Owner approved support access for ${out.session.by} in their panel`);
  return out;
}
/** Demo: stands in for the owner tapping Approve in their panel. */
export const ownerApproved = (id) => approve(id, 'owner');
/** The owner reads out the one-time PIN from their panel; staff type it here. */
export function approveWithPin(id, pin) {
  const x = sessionById(id);
  const p = String(pin || '').replace(/\D/g, '');
  if (!x) return { ok: false, error: 'This request is gone.' };
  if (p.length !== PIN_LEN) return { ok: false, field: 'pin', error: `Enter the owner's ${PIN_LEN}-digit PIN.` };
  if (p !== x.pin) return { ok: false, field: 'pin', error: 'That PIN is not right. Ask the owner to read it again.' };
  return approve(id, 'pin');
}
/** Start the session the owner approved: scope 'view' | 'changes', minutes 15 · 30 · 60. */
export function startSession(id, { scope, minutes }) {
  const s = me();
  const r = accessRight(s);
  if (!SCOPES.some((x) => x[0] === scope)) return { ok: false, field: 'scope', error: 'Pick what you may do.' };
  if (scope === 'changes' && !r.changes) return { ok: false, field: 'scope', error: 'Approved changes needs Edit on Merchants too. Pick View only.' };
  if (!DURATIONS.includes(Number(minutes))) return { ok: false, field: 'minutes', error: 'Pick how long.' };
  const out = access.commit((d, t) => {
    const x = d.list.find((y) => y.id === id);
    if (!x) return { ok: false, error: 'This request is gone.' };
    const st = stateOf(x, t);
    if (st === 'lapsed') return { ok: false, error: 'The approval lapsed. Ask the owner again.' };
    if (st !== 'approved') return { ok: false, error: 'The owner has not approved this yet.' };
    if (x.byId !== s.id) return { ok: false, error: 'Only the person who asked can start it.' };
    if (d.list.some((y) => y.byId === s.id && stateOf(y, t) === 'active')) return { ok: false, error: 'End the session you have on now first.' };
    Object.assign(x, { status: 'active', scope, minutes: Number(minutes), startedAt: t, endsAt: t + Number(minutes) * MIN });
    return { ok: true, session: x };
  });
  if (out.ok) {
    storeEvent(out.session.shopId, `Support access started by ${s.name} · ${scopeLabel(scope)} · up to ${minutes} min · ${out.session.reason}`);
    try { logActivity(`Opened #${out.session.shopId} with the owner’s ${out.session.approvedHow === 'pin' ? 'PIN' : 'approval'} · ${scopeLabel(scope)}, up to ${minutes} min · ${out.session.reason}`, { kind: 'pin', shopId: out.session.shopId }); } catch { /* the activity log is optional */ }
  }
  return out;
}
/** End a session now (by the person who has it, or an Admin). */
export function endSession(id, note = '') {
  const s = me();
  const out = access.commit((d, t) => {
    const x = d.list.find((y) => y.id === id);
    if (!x || stateOf(x, t) !== 'active') return { ok: false, error: 'This session is not on.' };
    if (x.byId !== s.id && s.role !== 'admin') return { ok: false, error: 'Only the person who has it or an Admin can end it.' };
    Object.assign(x, { status: 'ended', endedAt: t, endedBy: s.name, endNote: String(note || '').trim() || (x.byId === s.id ? 'Done' : 'Ended by an Admin') });
    return { ok: true, session: x };
  });
  if (out.ok) storeEvent(out.session.shopId, `Support access ended by ${s.name} after ${usedMinutes(out.session)} min`);
  return out;
}
/** Withdraw a request that has not started. */
export function withdrawRequest(id) {
  const s = me();
  return access.commit((d, t) => {
    const x = d.list.find((y) => y.id === id);
    if (!x || !['asked', 'approved'].includes(stateOf(x, t))) return { ok: false, error: 'Nothing to withdraw.' };
    if (x.byId !== s.id) return { ok: false, error: 'Only the person who asked can withdraw it.' };
    Object.assign(x, { status: 'withdrawn', endedAt: t, endedBy: s.name, pin: null });
    return { ok: true };
  });
}
/** Close sessions whose time has run out (writes "time ran out" to the store's history once). Browser only. */
export function sweep(t) {
  const due = access.get().list.filter((x) => x.status === 'active' && x.endsAt <= t);
  if (!due.length) return;
  access.commit((d) => {
    for (const x of d.list) if (x.status === 'active' && x.endsAt <= t) Object.assign(x, { status: 'expired', endedAt: x.endsAt, endedBy: 'System', endNote: 'Time ran out' });
  });
  for (const x of due) commit((db) => { db.events.push({ id: 'E' + db.seq.ev++, shopId: x.shopId, at: x.endsAt, kind: 'session', text: `Support access for ${x.by} ended: time ran out (${x.minutes} min)`, by: 'System' }); return null; });
}
