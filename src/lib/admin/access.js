// admin/access — which areas of the super admin each staff role opens (demo; a real build checks this on the server).
// The super admin keeps its own roles: it never reads the merchant panel's team.js. Staff come from lib/platform
// (catalogue STAFF, switched with ?staff=<id> or the account menu). Roles from the brief that have no demo staff yet
// (management, marketing, hr, analyst) are listed too. Administration › Roles & permissions edits a copy of these
// (lib/admin/admin.js); the menu follows that copy once it has loaded (canOpen's `matrix`).

import { ADMIN_ROLES } from './roles';

export { ADMIN_ROLES };

export const roleTitle = (role) => (ADMIN_ROLES[role] || {}).title || role;

/** Can this staff member open the area? `matrix` = Administration's saved roles (lib/admin/admin.js data, once it has
 *  loaded): the person's assigned role and its View right decide. Without it, the built-in ADMIN_ROLES do. */
export function canOpen(staff, areaId, matrix = null) {
  if (areaId === 'area-dashboard') return true;
  if (matrix && staff) {
    const roleId = staff.id in (matrix.assign || {}) ? matrix.assign[staff.id] : staff.role;
    const role = (matrix.roles || []).find((x) => x.id === roleId);
    // an area newer than the saved roles (e.g. Merchant AI) falls back to the built-in roles below
    if (role && role.perms && role.perms[areaId]) return !!role.perms[areaId].view;
    if (role && !(ADMIN_ROLES[roleId] || ADMIN_ROLES[staff.role])) return false;
    if (roleId === null) return false;
  }
  const r = ADMIN_ROLES[(staff && staff.role) || ''];
  if (!r) return false;
  return r.areas === '*' || r.areas.includes(areaId);
}
