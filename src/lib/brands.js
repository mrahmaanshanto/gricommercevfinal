// Brands: the makers a product can be tagged with (Products › Brands, /brands). Front end only: browser storage
// ('gc.brands'), seeded with the demo brands the products already use.
// A brand: { id, name, description (optional), image (optional: a data URL, 480 px on the long side), at }.
// The product form's Brand list and the product counts read this list; a product keeps the brand's name.

import { allProducts } from './products';

const KEY = 'gc.brands';
export const BRANDS_EVENT = 'gc:brands';
export const BRAND_NAME_MAX = 60;
export const BRAND_DESC_MAX = 500;

const SEED = ['Samsung', 'Apple', 'Xiaomi', 'ASUS', 'SoundMax', 'Beauty of Joseon', 'Nature Republic', 'GridShop', 'Chashi', 'Walton']
  .map((name, i) => ({ id: 'b-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name, description: '', image: '', at: Date.UTC(2026, 8, 1) + i }));
/** The demo brands (also what the server renders before the browser list is read). */
export const DEMO_BRANDS = SEED;

const read = () => {
  if (typeof window === 'undefined') return null;
  try { const v = JSON.parse(window.localStorage.getItem(KEY)); return Array.isArray(v) ? v : null; } catch { return null; }
};
function write(list) {
  try { window.localStorage.setItem(KEY, JSON.stringify(list)); } catch { return false; }
  window.dispatchEvent(new CustomEvent(BRANDS_EVENT));
  return true;
}

/** Every brand, A to Z. */
export const getBrands = () => (read() || SEED).slice().sort((a, b) => a.name.localeCompare(b.name));
/** Brand names, A to Z (the product form's list). */
export const brandNames = () => getBrands().map((b) => b.name);

/** The problem with a brand name, or '' when it is fine. */
export function brandNameError(name, ownId) {
  const n = String(name || '').trim();
  if (!n) return 'Enter a brand name.';
  if (n.length > BRAND_NAME_MAX) return 'Keep the name under ' + BRAND_NAME_MAX + ' letters.';
  if (getBrands().some((b) => b.id !== ownId && b.name.toLowerCase() === n.toLowerCase())) return 'There is already a brand called “' + n + '”.';
  return '';
}

/** Add a brand ({ name, description, image }) or save changes to one ({ id, … }). Returns { ok, brand } or { ok: false, error }. */
export function saveBrand(input) {
  const error = brandNameError(input.name, input.id);
  if (error) return { ok: false, error };
  const list = read() || SEED.slice();
  const clean = { name: String(input.name).trim(), description: String(input.description || '').trim().slice(0, BRAND_DESC_MAX), image: input.image || '' };
  let brand;
  if (input.id && list.some((b) => b.id === input.id)) {
    brand = { ...list.find((b) => b.id === input.id), ...clean };
    if (!write(list.map((b) => (b.id === input.id ? brand : b)))) return { ok: false, error: 'The image is too large to save. Try a smaller one.' };
  } else {
    brand = { id: 'b-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), ...clean, at: Date.now() };
    if (!write([...list, brand])) return { ok: false, error: 'The image is too large to save. Try a smaller one.' };
  }
  return { ok: true, brand };
}

/** Delete a brand. Products keep the name they were saved with. */
export function deleteBrand(id) {
  const list = read() || SEED.slice();
  write(list.filter((b) => b.id !== id));
}

/** How many products (not deleted) carry each brand name: { [lowercase name]: n }. */
export function productCounts() {
  const out = {};
  allProducts().forEach((p) => {
    if (!p.brand || p.st === 'deleted') return;
    const k = p.brand.toLowerCase();
    out[k] = (out[k] || 0) + 1;
  });
  return out;
}

/** Read an image file into a data URL, 480 px on the long side (JPEG; PNG kept for transparent logos). */
export function readBrandImage(file) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) { reject(new Error('Choose an image (JPG, PNG or WebP).')); return; }
    if (file.size > 10 * 1024 * 1024) { reject(new Error('The image is too large (10 MB max).')); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 480 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(file.type === 'image/png' ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('This image could not be opened. Try another file.')); };
    img.src = url;
  });
}
