// permissions — what a person may DO (not which pages they may open; that is team.js › canSee). Same pattern as
// financeDuties.js: each team role has permissions by default, changeable per person (Grid AI › Behaviour ›
// Permissions). Used by Grid AI: configuring the AI, knowledge, testing, auto reply, approving high-risk AI actions,
// logs, spam, meetings and seeing every conversation.
//   can(user, perm) → true / false        why(perm) → the sentence shown when a control is locked
// Front end only: changes are kept in this browser (gc.perms).

import { USERS, rolesOf, currentUser } from './team';

export const PERMISSIONS = [
  ['ai-configure', 'Configure Grid AI', 'Change how the AI behaves, its channels and defaults'],
  ['ai-knowledge', 'Upload AI knowledge', 'Add, sync, disable and remove knowledge sources'],
  ['ai-test', 'Test AI', 'Chat with the AI as a customer in Test agent'],
  ['ai-autoreply', 'Enable auto reply', 'Turn AI Auto reply on for a channel or a conversation'],
  ['ai-approve', 'Approve high-risk AI actions', 'Approve, reject or edit what the AI asks to do'],
  ['ai-logs', 'View AI logs', 'See the AI activity log'],
  ['spam-manage', 'Manage spam', 'Restore, mark not spam and block senders'],
  ['meetings', 'Schedule meetings', 'Book follow-ups and meetings with customers'],
  ['conversations-all', 'View all conversations', 'See conversations assigned to other people'],
];
export const PERM_LABEL = Object.fromEntries(PERMISSIONS.map(([id, label]) => [id, label]));
const ALL = PERMISSIONS.map(([id]) => id);
/** What each team role may do, unless changed per person. */
export const ROLE_PERMS = {
  ceo: ALL,
  cto: ['ai-configure', 'ai-knowledge', 'ai-test', 'ai-autoreply', 'ai-logs', 'spam-manage', 'conversations-all'],
  comms: ['ai-knowledge', 'ai-test', 'spam-manage', 'meetings', 'conversations-all'],
  orders: ['ai-test', 'meetings'],
  'online-sales': ['ai-test', 'meetings'],
  'shop-manager': ['ai-approve', 'meetings'],
  'wh-manager': [],
  'wh-supervisor': [],
  'shop-supervisor': [],
  seller: [],
  hr: [],
  content: ['ai-knowledge'],
  ads: [],
};
export const PERMS_EVENT = 'gc:perms';
const KEY = 'gc.perms';
const read = () => { if (typeof window === 'undefined') return {}; try { return JSON.parse(window.localStorage.getItem(KEY)) || {}; } catch { return {}; } };

/** A person's permissions: their own list when it was changed, else their roles'. */
export function permsOf(user) {
  if (!user) return [];
  const own = read()[user.id];
  if (own) return own;
  return [...new Set(rolesOf(user).flatMap((r) => ROLE_PERMS[r] || []))];
}
export const can = (user, perm) => permsOf(user || currentUser()).includes(perm);
/** The note on a locked control. */
export const why = (perm) => 'Ask someone who can “' + (PERM_LABEL[perm] || perm) + '”.';
/** Give or take one permission from one person. */
export function setPerm(userId, perm, on) {
  const u = USERS.find((x) => x.id === userId);
  if (!u) return;
  const now = new Set(permsOf(u));
  if (on) now.add(perm); else now.delete(perm);
  const all = read();
  all[userId] = ALL.filter((p) => now.has(p));
  try { window.localStorage.setItem(KEY, JSON.stringify(all)); window.dispatchEvent(new CustomEvent(PERMS_EVENT)); } catch { /* ignore */ }
}
export const changedFor = (userId) => !!read()[userId];
export function resetPerms() { try { window.localStorage.removeItem(KEY); window.dispatchEvent(new CustomEvent(PERMS_EVENT)); } catch { /* ignore */ } }
/** People who hold a permission (who can approve this, who gets an escalation). */
export const peopleWith = (perm) => USERS.filter((u) => permsOf(u).includes(perm));
