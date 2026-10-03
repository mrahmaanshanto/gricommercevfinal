// financeDuties — who may do what with money (brief #6, "separate finance duties"). Four duties, given to
// each team role by default and changeable per person in Accounts setup › Approvals:
//   cashier      takes and gives money at a counter
//   custodian    holds the safe and the drawers' cash, moves cash between them and to the bank
//   approver     approves expenses, money moves, refunds and write-offs above the limits (approvals.js)
//   reconciler   matches bank and wallet statements, card batches and payouts
// A small shop gives all four to the owner. The rule that always holds: the person who made a movement
// can't approve it (canDecide). Roles and people come from team.js (owned by the team agent; read only).
// Front end only: changes are kept in this browser (gc.fin.duties).

import { USERS, ROLES, currentUser, rolesOf } from './team';

export const DUTIES = [
  ['cashier', 'Cashier', 'Takes and gives money at a counter'],
  ['custodian', 'Cash custodian', 'Holds the safe and drawer cash, moves cash to the bank'],
  ['approver', 'Approver', 'Approves expenses, money moves, refunds and write-offs above the limits'],
  ['reconciler', 'Reconciler', 'Matches statements, card batches and payouts'],
];
export const DUTY_LABEL = Object.fromEntries(DUTIES.map(([id, label]) => [id, label]));
/** What each team role does with money, unless changed per person. */
export const ROLE_DUTIES = {
  ceo: ['cashier', 'custodian', 'approver', 'reconciler'],
  cto: ['reconciler'],
  orders: ['reconciler'],
  'shop-manager': ['cashier', 'custodian', 'approver'],
  'shop-supervisor': ['cashier', 'custodian'],
  seller: ['cashier'],
  hr: [],
  'online-sales': [],
  'wh-manager': [],
  'wh-supervisor': [],
  content: [],
  comms: [],
  ads: [],
};
const KEY = 'gc.fin.duties';
const read = () => { if (typeof window === 'undefined') return {}; try { return JSON.parse(window.localStorage.getItem(KEY)) || {}; } catch { return {}; } };

/** The duties of a person: their own list when it was changed, else their role's. */
export function dutiesOf(user) {
  if (!user) return [];
  const own = read()[user.id];
  if (own) return own;
  // a person can hold several roles (team.js): the duties of all of them
  const roles = typeof rolesOf === 'function' ? rolesOf(user) : [user.role];
  return [...new Set(roles.flatMap((r) => ROLE_DUTIES[r] || []))];
}
export const hasDuty = (user, duty) => dutiesOf(user).includes(duty);
/** Give or take one duty from one person. */
export function setDuty(userId, duty, on) {
  const u = USERS.find((x) => x.id === userId);
  if (!u) return;
  const now = new Set(dutiesOf(u));
  if (on) now.add(duty); else now.delete(duty);
  const all = read();
  all[userId] = DUTIES.map(([d]) => d).filter((d) => now.has(d));
  try { window.localStorage.setItem(KEY, JSON.stringify(all)); window.dispatchEvent(new CustomEvent('gc:ledger')); } catch { /* ignore */ }
}
/** Back to the role's duties for everyone. */
export function resetDuties() {
  try { window.localStorage.removeItem(KEY); window.dispatchEvent(new CustomEvent('gc:ledger')); } catch { /* ignore */ }
}
/** Has a person's duties been changed from their role's? */
export const changedFor = (userId) => !!read()[userId];
/** People with a duty (for "who can approve this"). */
export const peopleWith = (duty) => USERS.filter((u) => hasDuty(u, duty));
export const roleTitle = (u) => (ROLES[u.role] || {}).title || u.role;

/**
 * May `user` approve or deny `request` ({ by: user id of the maker })? { ok, why }.
 * The maker can never decide their own request; the decider needs the Approver duty.
 */
export function canDecide(user = currentUser(), request = {}) {
  if (!user) return { ok: false, why: 'Sign in to decide.' };
  if (request.by && request.by === user.id) return { ok: false, why: 'You made this, so someone else must approve it.' };
  if (!hasDuty(user, 'approver')) return { ok: false, why: 'You don’t have the Approver duty.' };
  return { ok: true, why: '' };
}
/** May `user` match statements (Reconciler duty)? */
export function canReconcile(user = currentUser()) {
  return hasDuty(user, 'reconciler') ? { ok: true, why: '' } : { ok: false, why: 'Matching needs the Reconciler duty.' };
}
export { currentUser };
