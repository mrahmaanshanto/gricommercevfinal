// shopUsers — who can sign in to the shop and with which role (Settings › Users & roles, /set-users). Part of core
// Settings: it works on every plan, with or without the Staff & HR module.
//   Built-in people   the demo accounts in lib/team.js › USERS; changes to them (role, places, deactivated) are kept here
//   Invited people    invite (name, phone / email, role, places) → Invited until they sign in for the first time → Active
//   Custom roles      a copy of a built-in role with its own pages, place scope and POS limits; lib/team.js reads them
//                     through roleDefOf(), so a custom role drives the menu (navFor) and the page guard (RoleGuard)
//   Activity          who invited, changed or deactivated whom (the access log)
//
//   applyUserChanges(u) · addedUsers() · roleDefOf(id) · customRoles()       read by lib/team.js
//   inviteUser · resendInvite · cancelInvite · changeUser · setUserStatus · noteSignIn
//   saveRole · deleteRole · posLimitsOf(u) · placeScopeOf(u) · accessLog()
//
// Front end only, kept in this browser (gc.shop.users). A real shop keeps users on the server: the invite message
// carries a one-time link where the person sets a password. Here the invite goes through the shared send layer
// (lib/messaging.js, so it shows in the delivery log) and the demo link signs in at once (?as=<user id>).
// Leaf module: no imports from lib/team.js (team.js imports this).

export const USERS_KEY = 'gc.shop.users';
export const USERS_EVENT = 'gc:shop-users';

const ssr = () => typeof window === 'undefined';
const blank = () => ({ users: {}, added: [], roles: [], log: [] });
function read() {
  if (ssr()) return blank();
  try { const v = JSON.parse(window.localStorage.getItem(USERS_KEY)); return v && typeof v === 'object' ? { ...blank(), ...v } : blank(); } catch { return blank(); }
}
function write(all) {
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent(USERS_EVENT));
    // the menu, the page guard and the top bar re-read the person on this event
    window.dispatchEvent(new CustomEvent('gc:session'));
  } catch { /* storage full or blocked */ }
}
const initialsOf = (name) => String(name || '').trim().split(/\s+/).map((x) => x[0] || '').slice(0, 2).join('').toUpperCase();
const logLine = (all, by, text) => { all.log = [{ at: Date.now(), by: by || 'Owner', text }, ...(all.log || [])].slice(0, 200); };

// ---- read by lib/team.js -----------------------------------------------------------------------------------
/** A built-in person with the shop's changes on top (role, places, status, last sign-in). */
export function applyUserChanges(u) {
  if (!u || ssr()) return u;
  const o = read().users[u.id];
  if (!o) return u;
  const out = { ...u };
  if (o.roles && o.roles.length) { out.roles = o.roles.slice(); out.role = o.role || o.roles[0]; }
  if (o.places) { out.places = o.places.slice(); out.place = o.places[0] || u.place; }
  if (o.status) out.status = o.status;
  if (o.lastSignIn) out.lastSignIn = o.lastSignIn;
  return out;
}
/** People invited in this shop (every status but cancelled). */
export function addedUsers() {
  if (ssr()) return [];
  return read().added.filter((u) => u.status !== 'cancelled').map((u) => ({ ...u, initials: initialsOf(u.name), roles: u.roles && u.roles.length ? u.roles : [u.role], place: (u.places || [])[0] || 'Head office', staff: '', invited: true }));
}
/** A custom role by id (null when it doesn't exist). Shaped like lib/team.js › ROLES entries. */
export function roleDefOf(id) {
  if (!id || ssr() || String(id).indexOf('cr-') !== 0) return null;
  const r = read().roles.find((x) => x.id === id);
  return r ? { title: r.title, icon: r.icon || 'user-cog', tone: r.tone || 'slate', blurb: r.blurb || 'Custom role', access: r.access.slice(), custom: true, base: r.base, scope: r.scope, pos: r.pos } : null;
}
export const customRoles = () => (ssr() ? [] : read().roles.slice());

// ---- people ----------------------------------------------------------------------------------------------------
let seq = 0;
const newId = (p) => p + Date.now().toString(36).slice(-5) + (seq++ % 36).toString(36);

/** Invite someone: { name, phone, email, role (built-in or custom id), base (dashboard role), places }. Returns the user. */
export function inviteUser({ name, phone, email, role, base, places }, by) {
  const all = read();
  const u = { id: newId('u-'), name: String(name).trim(), phone: String(phone || '').trim(), email: String(email || '').trim(), role: base || role, roles: [role], places: places && places.length ? places.slice() : [], status: 'invited', invitedAt: Date.now(), invitedBy: by || 'Owner', sends: [] };
  all.added = [u, ...all.added];
  logLine(all, by, 'Invited ' + u.name);
  write(all);
  return u;
}
/** Note that an invite message went out (status from the send layer). */
export function noteInviteSent(id, send) {
  const all = read();
  const u = all.added.find((x) => x.id === id); if (!u) return;
  u.sends = [{ at: Date.now(), channel: send.channel, status: send.status, reason: send.reason || '' }, ...(u.sends || [])].slice(0, 10);
  write(all);
}
export function resendInvite(id, by) {
  const all = read();
  const u = all.added.find((x) => x.id === id); if (!u || u.status !== 'invited') return null;
  logLine(all, by, 'Sent the invite to ' + u.name + ' again');
  write(all);
  return u;
}
export function cancelInvite(id, by) {
  const all = read();
  const u = all.added.find((x) => x.id === id); if (!u || u.status !== 'invited') return false;
  u.status = 'cancelled'; u.cancelledAt = Date.now();
  logLine(all, by, 'Cancelled the invite for ' + u.name);
  write(all);
  return true;
}
/** Change a person's role and places. `who` is the person as shown (built-in or invited). */
export function changeUser(who, { role, base, places }, by, roleTitle) {
  const all = read();
  const patch = { roles: [role], role: base || role, places: places.slice() };
  const added = all.added.find((x) => x.id === who.id);
  if (added) Object.assign(added, patch);
  else all.users[who.id] = { ...(all.users[who.id] || {}), ...patch };
  logLine(all, by, 'Changed ' + who.name + ' to ' + (roleTitle || role) + (places.length ? ' · ' + places.join(', ') : ' · all places'));
  write(all);
}
/** Deactivate ('off') or reactivate ('active') a person. A deactivated person can't sign in. */
export function setUserStatus(who, status, by) {
  const all = read();
  const added = all.added.find((x) => x.id === who.id);
  if (added) added.status = status === 'active' ? (added.acceptedAt ? 'active' : 'invited') : 'off';
  else all.users[who.id] = { ...(all.users[who.id] || {}), status };
  logLine(all, by, (status === 'off' ? 'Deactivated ' : 'Reactivated ') + who.name);
  write(all);
}
/** A sign-in: the time is kept, and an invited person becomes Active. */
export function noteSignIn(id) {
  if (ssr() || !id) return;
  const all = read();
  const added = all.added.find((x) => x.id === id);
  if (added) {
    if (added.status === 'invited') { added.status = 'active'; added.acceptedAt = Date.now(); logLine(all, added.name, added.name + ' accepted the invite'); }
    added.lastSignIn = Date.now();
  } else all.users[id] = { ...(all.users[id] || {}), lastSignIn: Date.now() };
  try { window.localStorage.setItem(USERS_KEY, JSON.stringify(all)); window.dispatchEvent(new CustomEvent(USERS_EVENT)); } catch { /* ignore */ }
}
/** Is this person allowed to sign in? */
export const canSignIn = (u) => !!u && u.status !== 'off' && u.status !== 'cancelled';

// ---- custom roles ------------------------------------------------------------------------------------------------
export const DEFAULT_POS = { maxDiscount: 10, refunds: 'pin', priceChange: 'pin' };
/** Create or update a custom role: { id?, title, base, icon, tone, access: [menu ids], scope: 'all' | 'own', pos }. */
export function saveRole(role, by) {
  const all = read();
  const rec = { ...role, title: String(role.title).trim(), access: [...new Set(role.access || [])], pos: { ...DEFAULT_POS, ...(role.pos || {}) }, scope: role.scope === 'own' ? 'own' : 'all', at: Date.now(), by: by || 'Owner' };
  if (rec.id) all.roles = all.roles.map((r) => (r.id === rec.id ? { ...r, ...rec } : r));
  else { rec.id = newId('cr-'); all.roles = [...all.roles, rec]; }
  logLine(all, by, (role.id ? 'Changed the role ' : 'Made the role ') + rec.title);
  write(all);
  return rec;
}
/** Delete a custom role: people on it go back to the role it was copied from. */
export function deleteRole(id, by) {
  const all = read();
  const r = all.roles.find((x) => x.id === id); if (!r) return 0;
  let moved = 0;
  Object.keys(all.users).forEach((k) => { const o = all.users[k]; if (o.roles && o.roles.includes(id)) { o.roles = [r.base]; o.role = r.base; moved += 1; } });
  all.added.forEach((u) => { if ((u.roles || []).includes(id)) { u.roles = [r.base]; u.role = r.base; moved += 1; } });
  all.roles = all.roles.filter((x) => x.id !== id);
  logLine(all, by, 'Deleted the role ' + r.title + (moved ? ' (' + moved + ' moved to its base role)' : ''));
  write(all);
  return moved;
}
/** Who holds a role (ids), from the shop's changes and invites; built-in holders are added by the page. */
export const usersOnRole = (id) => {
  const all = read();
  return [...Object.keys(all.users).filter((k) => (all.users[k].roles || []).includes(id)), ...all.added.filter((u) => u.status !== 'cancelled' && (u.roles || []).includes(id)).map((u) => u.id)];
};

// POS limits a built-in role has (owner and managers: no limit; everyone else: the register's setting decides)
const BUILT_IN_POS = { ceo: null, 'shop-manager': null };
/** The POS limits that apply to a person: null = no limit of their own (the register's settings decide). With several
 *  roles the most generous one wins. */
export function posLimitsOf(u, roleDef) {
  const ids = (u && u.roles && u.roles.length ? u.roles : [(u || {}).role]).filter(Boolean);
  const lims = ids.map((id) => { const r = roleDefOf(id) || (roleDef ? roleDef(id) : null); return r && r.custom ? r.pos : (id in BUILT_IN_POS ? null : undefined); });
  if (lims.some((l) => l === null)) return null;
  const set = lims.filter(Boolean);
  if (!set.length) return null;
  const rank = { yes: 2, pin: 1, no: 0 };
  const best = (k) => set.map((l) => l[k] || 'pin').sort((a, b) => rank[b] - rank[a])[0];
  return { maxDiscount: Math.max(...set.map((l) => Number(l.maxDiscount) || 0)), refunds: best('refunds'), priceChange: best('priceChange') };
}
/** 'all' places, or the person's own places only (custom roles with scope 'own'). */
export function placeScopeOf(u) {
  const ids = (u && u.roles) || [];
  const defs = ids.map(roleDefOf).filter(Boolean);
  if (!defs.length || defs.some((d) => d.scope !== 'own')) return 'all';
  return 'own';
}
export const accessLog = () => (ssr() ? [] : read().log.slice());
