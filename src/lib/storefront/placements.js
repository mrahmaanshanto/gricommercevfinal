// storefront/placements — HTML block push (Online Store › HTML blocks › Placements, Batch A step 3): one block placed in
// many spots at once — above or under the header, the top of Home, before the footer, on the product page (under the
// price, under Add to cart, as a new tab), at the top or bottom of a category page, in the cart, at checkout and on the
// thank-you page — for chosen pages, categories, products and devices, between two dates, in a set order. Kept in the
// storefront store (`placements`), so placements travel in a store kit.
//
//   getPlacements() · savePlacements(list) · savePlacement(p) · deletePlacement(id) · newPlacement(patch)
//   placeBlock(blockId, spots, patch) → the new placements (one per spot)
//   placementsOfBlock(id) · removeBlockPlacements(id) · placementProblem(p) · placementState(p, now) (as notices.js)
//   placedAt(spot, { kind, product, category, now }) → the live placements of one spot, in order, whose block exists
// Front end only.

import { read, update, sfId, previewValue, isPreview } from './store';
import { spotBy } from './schema.js';
import { showMatches, inWindow } from './show.js';

export function getPlacements() {
  const ov = previewValue('placements');
  if (ov !== undefined) return ov;
  return read().placements || [];
}
export function savePlacements(list) { update((d) => { d.placements = list; }); }
export function savePlacement(p) {
  const list = getPlacements().slice();
  const i = list.findIndex((x) => x.id === p.id);
  if (i >= 0) list[i] = p; else list.push(p);
  savePlacements(list);
  return p;
}
export function deletePlacement(id) { savePlacements(getPlacements().filter((x) => x.id !== id)); }
export const newPlacement = (patch = {}) => ({ id: sfId('plc'), on: true, block: '', spot: 'below-header', show: { pages: 'all', devices: 'all' }, start: '', end: '', order: 0, ...patch });

/** Place one block in several spots at once (one placement per spot, same audience and dates). */
export function placeBlock(blockId, spots, patch = {}) {
  const made = (spots || []).map((spot) => newPlacement({ ...patch, block: blockId, spot, id: sfId('plc') }));
  savePlacements([...getPlacements(), ...made]);
  return made;
}
export const placementsOfBlock = (id) => getPlacements().filter((p) => p.block === id);
export function removeBlockPlacements(id) { savePlacements(getPlacements().filter((p) => p.block !== id)); }

export function placementProblem(p) {
  if (!p.block) return 'Choose a block.';
  if (!spotBy(p.spot)) return 'Choose where it goes.';
  if (p.start && p.end && Date.parse(p.end) <= Date.parse(p.start)) return 'The end is before the start.';
  const s = p.show || {};
  if (Array.isArray(s.pages) && !s.pages.length) return 'Choose at least one kind of page, or Every page.';
  return '';
}
export function placementState(p, now = Date.now()) {
  if (!p.on) return 'off';
  if (p.end && now >= Date.parse(p.end)) return 'ended';
  if (p.start && now < Date.parse(p.start)) return 'scheduled';
  return 'live';
}

/** The placements a customer page shows in one spot (ordered; only those whose block still exists). */
export function placedAt(spot, { kind = '', product = '', category = '', now = Date.now() } = {}) {
  const d = read();
  const blocks = new Set((d.blocks || []).map((b) => b.id));
  const def = spotBy(spot);
  if (!def) return [];
  // a spot on one kind of page only shows there; the "every page" spots follow the placement's own page choice
  if (def.page !== 'all' && def.page !== kind) return [];
  return getPlacements()
    .filter((p) => p && p.on && p.spot === spot && blocks.has(p.block) && inWindow(p, now))
    .filter((p) => showMatches(def.page === 'all' ? p.show : { ...(p.show || {}), pages: 'all' }, { kind, product, category }))
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
}
export const previewing = () => isPreview();
