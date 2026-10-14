// admin/actionRights — who may do what to a store, and the second person for risky store actions (review SA-F2).
// Front end only: a real build checks every right on the server; here the screens hide or disable what a person may
// not do (with the reason), and every change goes through run() / ask() below, which check again.
//
//   Rights come from Administration › Roles & permissions (lib/admin/admin.js: the person's role and its Edit /
//   Approve columns per menu area). The super administrator may do everything.
//   Second person: Administration › Security › Approvals (admin.js › approvals). When a rule is on and the store's
//   figure is above its amount (monthly bill, amount owed, credits) — or always, for a rule with no amount — the
//   action becomes a request that someone else with the approver role approves. Never the person who asked.
//
//   ACTIONS                                   the store actions and the rights they need
//   rightOf(action, staff?)                   { ok, reason } — may this person do it at all
//   ruleFor(action, value)                    the approval rule that applies (or null)
//   ask({ action, shopIds, value, params, reason })   run it now, or file a request → { ok, done | pending, error }
//   decide(id, 'approve' | 'reject', note)    the second person's decision (runs the action on approve)
//   cancelRequest(id) · pendingFor(shopId) · pendingAll() · canDecide(req, staff?)
// Requests live in createStore key `storeActions`; each also writes an event to the store's history.

import { createStore } from './store';
import { admin } from './admin';
import { ADMIN_ROLES } from './roles';
import { AREAS } from '@/screens/admin/adminNav';
import { commit, staff as currentStaff } from '@/lib/platform/store';
import { shopOf, subOf, mrrOf, openInvoices, balance, setControl, pauseStore, cancelStore } from '@/lib/platform/billing';
import { taka } from '@/lib/platform/util';
import { extendGrace, addCredits, setModule } from './merchants';

const areaLabel = (id) => (AREAS.find((a) => a.id === id) || {}).label || id;
const OP = { edit: 'Edit', approve: 'Approve', create: 'Create' };

/** Store actions: any one of `any` ([area, op]) is enough; `rule` = the approval rule (admin.js › approvals). */
export const ACTIONS = {
  suspend: { label: 'Suspend a store', any: [['area-merchants', 'approve'], ['area-billing', 'approve']], rule: 'store-control' },
  unsuspend: { label: 'Reactivate a store', any: [['area-merchants', 'approve'], ['area-billing', 'edit'], ['area-billing', 'approve']] },
  pause: { label: 'Pause a store', any: [['area-merchants', 'approve'], ['area-billing', 'approve']], rule: 'store-control' },
  cancel: { label: 'Cancel a store', any: [['area-merchants', 'approve'], ['area-billing', 'approve']], rule: 'store-control' },
  revoke: { label: 'Revoke a licence', any: [['area-merchants', 'approve'], ['area-plans', 'approve']], rule: 'licence-revoke' },
  grace: { label: 'Extend grace', any: [['area-billing', 'edit']], rule: 'grace' },
  credits: { label: 'Add credits', any: [['area-billing', 'edit']], rule: 'free-credits' },
  module: { label: 'Turn a module on or off for a store', any: [['area-plans', 'edit']] },
  bulkSuspend: { label: 'Suspend several stores', any: [['area-merchants', 'approve'], ['area-billing', 'approve']], rule: 'store-control' },
};

/** Who may approve under each approver choice of a rule (role ids). null = anyone else with the right. */
const APPROVER_ROLES = {
  'Finance or Admin': ['finance', 'admin'], 'Management or Admin': ['management', 'admin'], 'Admin only': ['admin'],
  'HR and Finance': ['hr', 'finance'], 'Any other administrator': null,
};

function matrix() {
  try { admin.load(); } catch { /* server render */ }
  return admin.get();
}
/** The person's role id in the saved matrix (their built-in role until it has loaded). */
export function roleIdOf(s, d = matrix()) {
  if (!s) return null;
  return d && d.assign && s.id in d.assign ? d.assign[s.id] : s.role;
}
const roleTitleOf = (d, id) => ((d.roles || []).find((r) => r.id === id) || {}).title || (ADMIN_ROLES[id] || {}).title || id || 'No role';
function has(d, roleId, area, op) {
  if (roleId === 'admin') return true;
  const role = (d.roles || []).find((r) => r.id === roleId);
  return !!(role && role.perms && role.perms[area] && role.perms[area][op]);
}
/** "Approve on Merchants or Approve on Billing & credits" */
const needText = (any) => any.map(([a, o]) => `${OP[o] || o} on ${areaLabel(a)}`).join(' or ');

/** May this person do the action at all? { ok, reason } — reason says what right is missing. */
export function rightOf(action, s = currentStaff()) {
  const a = ACTIONS[action];
  if (!a) return { ok: false, reason: 'Unknown action.' };
  const d = matrix();
  const rid = roleIdOf(s, d);
  if (a.any.some(([area, op]) => has(d, rid, area, op))) return { ok: true, reason: '' };
  return { ok: false, reason: `Needs ${needText(a.any)} (Roles & permissions). You are ${roleTitleOf(d, rid)}.` };
}

/** The approval rule that applies to this action at this figure, or null. */
export function ruleFor(action, value = 0) {
  const a = ACTIONS[action];
  if (!a || !a.rule) return null;
  const r = (matrix().approvals || []).find((x) => x.id === a.rule);
  if (!r || !r.on) return null;
  if (r.threshold === null || r.threshold === undefined) return r;
  return value > r.threshold ? r : null;
}

/** The figure a rule is measured on for a store: its monthly bill, the amount it owes. */
export function figureOf(db, shopId, kind, t) {
  if (kind === 'owed') return openInvoices(db, shopId).reduce((n, i) => n + balance(db, i), 0);
  const sub = subOf(db, shopId);
  return sub ? mrrOf(db, sub, t) : 0;
}

// ---- requests -----------------------------------------------------------------------------------------------------
export const requests = createStore({ key: 'storeActions', version: 1, seed: () => ({ list: [], seq: 1 }) });

const who = () => currentStaff();
function storeEvent(shopId, text) {
  commit((db, t) => { db.events.push({ id: 'E' + db.seq.ev++, shopId, at: t, kind: 'staff', text, by: who().name }); return null; });
}

/** Run the action now (the rights are checked by the caller). */
function perform(req) {
  const p = req.params || {};
  const out = [];
  for (const id of req.shopIds) {
    let r;
    if (req.action === 'suspend' || req.action === 'bulkSuspend') r = setControl(id, 'suspended', req.reason);
    else if (req.action === 'unsuspend') r = setControl(id, null, req.reason);
    else if (req.action === 'pause') r = pauseStore(id, req.reason);
    else if (req.action === 'cancel') r = cancelStore(id, req.reason);
    else if (req.action === 'revoke') r = setControl(id, 'suspended', 'Licence revoked · ' + req.reason);
    else if (req.action === 'grace') r = extendGrace(id, p.days, req.reason);
    else if (req.action === 'credits') r = addCredits(id, p.amount, req.reason);
    else if (req.action === 'module') r = setModule(id, p.code, p.on, req.reason);
    else r = { ok: false, error: 'Unknown action.' };
    out.push(r || { ok: false });
  }
  const bad = out.find((r) => !r.ok);
  return bad && out.length === 1 ? bad : { ok: true, n: out.filter((r) => r.ok).length, results: out };
}

/** What the request is, in words: "Suspend Dhaka Gadget Hub" · "Add ৳2,000 credits to …" */
export function describe(req, db) {
  const names = req.shopIds.map((id) => (shopOf(db, id) || { name: '#' + id }).name);
  const who2 = names.length > 2 ? `${names.length} stores` : names.join(' and ');
  const p = req.params || {};
  switch (req.action) {
    case 'grace': return `Extend grace by ${p.days} days for ${who2}`;
    case 'credits': return `Add ${taka(p.amount)} credits to ${who2}`;
    case 'module': return `Turn ${p.name || p.code} ${p.on ? 'on' : 'off'} for ${who2}`;
    case 'bulkSuspend': return `Suspend ${who2}`;
    default: return `${ACTIONS[req.action].label.replace(/ a store| a licence/, '')} ${req.action === 'revoke' ? 'the licence of ' : ''}${who2}`;
  }
}

/**
 * Do a store action, or ask a second person. f: { action, shopIds, value (the rule's figure), params, reason, db }.
 * → { ok:true, done:true, result } · { ok:true, pending:true, request } · { ok:false, error }
 */
export function ask({ action, shopIds, value = 0, params = {}, reason = '', db }) {
  const right = rightOf(action);
  if (!right.ok) return { ok: false, error: right.reason };
  if (!String(reason || '').trim()) return { ok: false, error: 'Pick a reason.' };
  const ids = [].concat(shopIds).filter(Boolean);
  if (!ids.length) return { ok: false, error: 'Pick a store.' };
  const rule = ruleFor(action, value);
  if (!rule) {
    const result = perform({ action, shopIds: ids, params, reason });
    return result.ok ? { ok: true, done: true, result } : { ok: false, error: result.error };
  }
  const me = who();
  const req = requests.commit((data, t) => {
    const r = {
      id: 'SA-' + String(data.seq++).padStart(4, '0'), action, shopIds: ids, params, reason: String(reason).trim(), value,
      rule: rule.id, ruleLabel: rule.label, threshold: rule.threshold, approver: rule.approver,
      by: me.name, byId: me.id, at: t, status: 'pending', decidedBy: null, decidedAt: null, note: '',
    };
    data.list.unshift(r);
    return r;
  });
  const text = describe(req, db || { shops: [] });
  for (const id of ids) storeEvent(id, `${text}: asked by ${me.name}, waits for a second person (${req.approver}) · ${req.reason}`);
  return { ok: true, pending: true, request: req };
}

/** May this person decide the request? { ok, reason } */
export function canDecide(req, s = currentStaff()) {
  if (!req || req.status !== 'pending') return { ok: false, reason: 'Already decided.' };
  if (req.byId === s.id || req.by === s.name) return { ok: false, reason: 'You asked for this, so someone else approves it.' };
  const d = matrix();
  const rid = roleIdOf(s, d);
  const roles = APPROVER_ROLES[req.approver];
  if (roles && !roles.includes(rid)) return { ok: false, reason: `Only ${req.approver} can approve this.` };
  const right = rightOf(req.action, s);
  if (!right.ok && rid !== 'admin') return { ok: false, reason: right.reason };
  return { ok: true, reason: '' };
}

export function decide(id, decision, note = '') {
  const req = requests.get().list.find((x) => x.id === id);
  const me = who();
  const may = canDecide(req, me);
  if (!may.ok) return { ok: false, error: may.reason };
  if (decision === 'reject' && !String(note).trim()) return { ok: false, error: 'Say why it is rejected.' };
  let result = null;
  if (decision === 'approve') {
    result = perform(req);
    if (!result.ok) return { ok: false, error: result.error };
  }
  requests.commit((data, t) => {
    const r = data.list.find((x) => x.id === id);
    Object.assign(r, { status: decision === 'approve' ? 'approved' : 'rejected', decidedBy: me.name, decidedAt: t, note: String(note).trim() });
  });
  if (decision === 'reject') for (const sid of req.shopIds) storeEvent(sid, `Request ${req.id} rejected by ${me.name} · ${String(note).trim()}`);
  else for (const sid of req.shopIds) storeEvent(sid, `Request ${req.id} approved by ${me.name} (asked by ${req.by})`);
  return { ok: true, result };
}
/** The person who asked can withdraw a request that is still waiting. */
export function cancelRequest(id) {
  const me = who();
  const req = requests.get().list.find((x) => x.id === id);
  if (!req || req.status !== 'pending') return { ok: false, error: 'Already decided.' };
  if (req.byId !== me.id) return { ok: false, error: 'Only the person who asked can withdraw it.' };
  requests.commit((data, t) => { const r = data.list.find((x) => x.id === id); Object.assign(r, { status: 'withdrawn', decidedBy: me.name, decidedAt: t }); });
  for (const sid of req.shopIds) storeEvent(sid, `Request ${req.id} withdrawn by ${me.name}`);
  return { ok: true };
}
export const pendingAll = () => requests.get().list.filter((r) => r.status === 'pending');
export const pendingFor = (shopId) => pendingAll().filter((r) => r.shopIds.includes(shopId));
export const historyAll = () => requests.get().list;
