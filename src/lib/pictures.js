// pictures — the one place that finds a small picture for a table row (Batch E, Oct 2026: picture columns). Rows are
// recognised faster by sight than by reading: a product, a person, a company or a piece of visual content.
//   productPic(row)      a product, SKU or order line: its own first photo (`media[0].src`, `img`, `photo`, `cover`), else the
//                        demo photo for its product id / SKU / name (DEMO_PRODUCT_PICS, filled from
//                        lib/productPhotos.js), else '' (the row shows its initial on a tile)
//   initialsOf(name)     "Mehedi Rahman" → "MR"
//   toneOf(text)         a stable soft colour pair [background, text] for a name (initials tiles and avatars)
// Components: components/ui/Pic.jsx (`<Pic src name kind="item|person|logo|cover" size />`).

import { PRODUCT_PHOTOS } from './productPhotos';

const TONES = [
  ['#e0f2fe', '#075985'], ['#e7f8f1', '#047857'], ['#fff4e0', '#a14f06'], ['#f3e8ff', '#6d28d9'], ['#fde7f1', '#9d174d'],
  ['#e0e7ff', '#3730a3'], ['#ecfccb', '#3f6212'], ['#ffe4e6', '#9f1239'], ['#cffafe', '#155e75'], ['#f1f5f9', '#334155'],
];
export function toneOf(text) {
  const s = String(text || '?');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length];
}
export function initialsOf(name, max = 2) {
  const w = String(name || '').replace(/[^\p{L}\p{N}\s&.-]/gu, ' ').split(/\s+/).filter(Boolean);
  if (!w.length) return '?';
  if (w.length === 1) return w[0].slice(0, max === 1 ? 1 : 2).toUpperCase();
  return (w[0][0] + (max > 1 ? w[w.length - 1][0] : '')).toUpperCase();
}
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
/** A product's picture: its own photo first, then the demo photo by id, SKU or name. '' = none. */
export function productPic(row) {
  if (!row) return '';
  if (typeof row === 'string') return PRODUCT_PHOTOS.byName[norm(row)] || PRODUCT_PHOTOS.bySku[row] || '';
  const own = (row.media && row.media[0] && (row.media[0].src || row.media[0].url)) || row.img || row.photo || row.cover || row.image || '';
  if (own && typeof own === 'string') return own;
  return PRODUCT_PHOTOS.byId[row.productId] || PRODUCT_PHOTOS.byId[row.id] || PRODUCT_PHOTOS.bySku[row.sku] || PRODUCT_PHOTOS.byName[norm(row.name || row.title || row.product)] || '';
}
