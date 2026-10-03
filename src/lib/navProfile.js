// navProfile — each person's own menu shortcuts (brief #21, "UserNavigationProfile"). Personal layout only: the menu's
// areas and their order never change.
//   pins     up to MAX_PINS pages pinned at the top of the side menu (pin / unpin from the menu)
//   landing  the start page opened after sign-in (account menu › Start page)
//   last     the last page used in each menu area: tapping the area opens it again
// Kept in this browser per demo user (gc.nav.profile = { [userId]: { pins, landing, last } }). What is stored is
// checked against what the person can open now (lib/team.js › navFor / homeOf), so a page they lose is dropped, never
// shown. Leaf module (imports only the menu), so scripts/test-nav.mjs can load it in Node.
//
//   MAX_PINS · NAV_PROFILE_EVENT
//   getProfile(userId) · pinsOf(userId) · isPinned(userId, id) · togglePin(userId, id) → { pinned, full }
//   movePin(userId, id, step) · landingOf(userId) · setLanding(userId, href) · lastTabOf(userId, areaId)
//   rememberTab(userId, areaId, pageId) · areaOf(pageId) · navItem(id)

import { NAV, NAV_ALIAS } from '../shell/navigation';

const KEY = 'gc.nav.profile';
export const NAV_PROFILE_EVENT = 'gc:nav-profile';
export const MAX_PINS = 5;

const ssr = () => typeof window === 'undefined';
function readAll() {
  if (ssr()) return {};
  try { const v = JSON.parse(window.localStorage.getItem(KEY)); return v && typeof v === 'object' ? v : {}; } catch { return {}; }
}
function writeAll(all, quiet) {
  if (ssr()) return;
  try { window.localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* ignore */ }
  if (!quiet) window.dispatchEvent(new CustomEvent(NAV_PROFILE_EVENT));
}
const blank = () => ({ pins: [], landing: '', last: {} });
export function getProfile(userId) {
  const p = readAll()[userId || ''] || {};
  return { ...blank(), ...p, pins: Array.isArray(p.pins) ? p.pins.filter(Boolean) : [], last: p.last && typeof p.last === 'object' ? p.last : {} };
}
function update(userId, fn, quiet) {
  const all = readAll();
  const next = fn(getProfile(userId));
  all[userId || ''] = next;
  writeAll(all, quiet);
  return next;
}

// ---- the menu, flat ------------------------------------------------------------------------------------
const AREAS = NAV.flatMap((g) => g.items);
const ALL = AREAS.flatMap((it) => [it, ...(it.children || [])]);
/** A menu item by id (old ids follow NAV_ALIAS). */
export const navItem = (id) => ALL.find((x) => x.id === (NAV_ALIAS[id] || id)) || null;
/** The area (top-level row) a page belongs to; an area is its own area. */
export function areaOf(id) {
  const key = NAV_ALIAS[id] || id;
  return AREAS.find((a) => a.id === key || (a.children || []).some((c) => c.id === key)) || null;
}

// ---- pins ----------------------------------------------------------------------------------------------
export const pinsOf = (userId) => getProfile(userId).pins;
export const isPinned = (userId, id) => pinsOf(userId).includes(id);
/** Pin or unpin a page. At MAX_PINS a new pin is refused: { pinned: false, full: true }. */
export function togglePin(userId, id) {
  const p = getProfile(userId);
  if (p.pins.includes(id)) { update(userId, (x) => ({ ...x, pins: x.pins.filter((k) => k !== id) })); return { pinned: false, full: false }; }
  if (p.pins.length >= MAX_PINS) return { pinned: false, full: true };
  update(userId, (x) => ({ ...x, pins: [...x.pins, id] }));
  return { pinned: true, full: false };
}
/** Move a pin up (-1) or down (+1) inside the Pinned list. */
export function movePin(userId, id, step) {
  update(userId, (x) => {
    const pins = [...x.pins];
    const i = pins.indexOf(id), j = i + step;
    if (i < 0 || j < 0 || j >= pins.length) return x;
    [pins[i], pins[j]] = [pins[j], pins[i]];
    return { ...x, pins };
  });
}

// ---- start page ------------------------------------------------------------------------------------------
export const landingOf = (userId) => getProfile(userId).landing || '';
export function setLanding(userId, href) { update(userId, (x) => ({ ...x, landing: href || '' })); }

// ---- last page per area -----------------------------------------------------------------------------------
export const lastTabOf = (userId, areaId) => getProfile(userId).last[areaId] || '';
/** Remember the page used in an area (quiet: the menu redraws on its own route change). */
export function rememberTab(userId, areaId, pageId) {
  if (!areaId || !pageId || lastTabOf(userId, areaId) === pageId) return;
  update(userId, (x) => ({ ...x, last: { ...x.last, [areaId]: pageId } }), true);
}
