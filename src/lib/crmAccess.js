// crmAccess — who may see a customer's IP addresses and devices (brief #7: raw IP and device data sit behind a
// permission). Set in Customer settings; by default only the CEO and the CTO. Everyone else sees "Hidden".
// Front end only: kept in this browser (gc.crm.deviceRoles). The real check belongs on the server.

import { currentUser } from './team';

export const DEVICE_ROLES_KEY = 'gc.crm.deviceRoles';
export const DEFAULT_DEVICE_ROLES = ['ceo', 'cto'];

export function getDeviceRoles() {
  if (typeof window === 'undefined') return DEFAULT_DEVICE_ROLES;
  try { const v = JSON.parse(window.localStorage.getItem(DEVICE_ROLES_KEY)); return Array.isArray(v) ? v : DEFAULT_DEVICE_ROLES; } catch { return DEFAULT_DEVICE_ROLES; }
}
export function setDeviceRoles(roles) {
  try { window.localStorage.setItem(DEVICE_ROLES_KEY, JSON.stringify([...new Set(['ceo', ...roles])])); } catch { /* storage blocked */ }
}
/** Can this user (default: the signed-in one) see raw IP and device data? The CEO always can. */
export function canSeeDeviceData(user) {
  const u = user || currentUser();
  return !!u && (u.role === 'ceo' || getDeviceRoles().includes(u.role));
}
/** Can this user see full phone numbers in a customer export? (Others get masked numbers.) */
export const canExportFullPhones = (user) => { const u = user || currentUser(); return !!u && ['ceo', 'cto', 'online-sales', 'shop-manager'].includes(u.role); };
/** 01712-345678 → 01712-•••678 */
export const maskPhone = (p) => { const s = String(p || ''); return s.length > 6 ? s.slice(0, 6) + s.slice(6, -3).replace(/[0-9X]/g, '•') + s.slice(-3) : s; };
export const maskEmail = (e) => { const s = String(e || ''); const i = s.indexOf('@'); return i > 1 ? s[0] + '•••' + s.slice(i) : s; };
