// storefront/brandKit — colours and fonts suggested from the shop's logo (the tweak panel's Brand kit, Customize).
// logoColours reads the picture in the browser (a small canvas; uploads in Files, pictures on this site or a data
// address), keeps the colours that carry the brand (near-white backgrounds and see-through pixels are ignored, saturated
// colours count more) and merges look-alikes. suggestPalettes turns them into ready colour sets for the theme, each one
// checked so button text stays readable (4.5:1); suggestFonts picks font pairs that suit the brand colour's mood.
//
//   logoColours(src) → Promise<[hex]> · suggestPalettes(colours) → [{ id, name, why, values }]
//   suggestFonts(colours) → [{ id, why }] (FONT_PAIRS ids) · moodOf(hex)
// Front end only: a picture on another site that does not allow reading its pixels gives no colours.

import { fileUrl } from '../files';
import { contrast } from './theme';

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const toHex = (r, g, b) => '#' + [r, g, b].map((x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, '0')).join('');
function rgbOf(hex) { const h = String(hex || '').replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function hslOf(hex) {
  const [r, g, b] = rgbOf(hex).map((x) => x / 255);
  const mx = Math.max(r, g, b); const mn = Math.min(r, g, b); const l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn; const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function hsl(h, s, l) {
  h = ((h % 360) + 360) % 360; s = clamp(s, 0, 1); l = clamp(l, 0, 1);
  const c = (1 - Math.abs(2 * l - 1)) * s; const x = c * (1 - Math.abs(((h / 60) % 2) - 1)); const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return toHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}
const hueGap = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
/** Darken until white text on it is readable (buttons). */
function readable(hex) {
  let [h, s, l] = hslOf(hex);
  let out = hex;
  for (let i = 0; i < 20 && contrast('#ffffff', out) < 4.5; i++) { l -= 0.03; out = hsl(h, s, l); }
  return out;
}

/** The brand colours in a logo, most important first (up to five). */
export async function logoColours(src) {
  if (!src || typeof window === 'undefined') return [];
  const url = await fileUrl(src, 'md');
  if (!url) return [];
  const img = await new Promise((ok) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => ok(i); i.onerror = () => ok(null); i.src = url; });
  if (!img) return [];
  const W = 72; const H = Math.max(1, Math.round((img.naturalHeight / Math.max(1, img.naturalWidth)) * W));
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  let data;
  try { cx.drawImage(img, 0, 0, W, H); data = cx.getImageData(0, 0, W, H).data; } catch { return []; }
  const buckets = new Map();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 160) continue;
    const r = data[i]; const g = data[i + 1]; const b = data[i + 2];
    const [, s, l] = hslOf(toHex(r, g, b));
    if (l > 0.93 || (l > 0.86 && s < 0.12)) continue;   // the background
    const k = (r >> 4) + ',' + (g >> 4) + ',' + (b >> 4);
    const w = 1 + s * 3 + (l < 0.12 ? -0.4 : 0);
    const e = buckets.get(k) || { r: 0, g: 0, b: 0, n: 0, w: 0 };
    e.r += r; e.g += g; e.b += b; e.n += 1; e.w += w;
    buckets.set(k, e);
  }
  const list = [...buckets.values()].map((e) => ({ hex: toHex(e.r / e.n, e.g / e.n, e.b / e.n), w: e.w })).sort((a, b) => b.w - a.w);
  const out = [];
  list.forEach((c) => {
    const [r, g, b] = rgbOf(c.hex);
    if (out.length < 5 && !out.some((o) => { const [x, y, z] = rgbOf(o); return Math.hypot(r - x, g - y, b - z) < 48; })) out.push(c.hex);
  });
  return out;
}

/** The colour that carries the brand: saturated and not too light or dark. */
function lead(colours) {
  const ok = (colours || []).filter((c) => { const [, s, l] = hslOf(c); return s > 0.25 && l > 0.18 && l < 0.72; });
  return ok[0] || (colours || [])[0] || '#1d4ed8';
}
function second(colours, base) {
  const [h] = hslOf(base);
  const other = (colours || []).find((c) => { const [hh, s, l] = hslOf(c); return hueGap(hh, h) > 28 && s > 0.2 && l > 0.15 && l < 0.85; });
  return other || hsl(h + 165, 0.75, 0.5);
}

/** Ready colour sets for the theme from the logo's colours. */
export function suggestPalettes(colours) {
  const base = lead(colours);
  const [h, s] = hslOf(base);
  const acc = second(colours, base);
  const sale = hueGap(h, 0) < 25 ? '#be123c' : '#dc2626';
  const ink = hsl(h, Math.min(0.35, s), 0.12);
  return [
    { id: 'logo', name: 'From your logo', why: 'Your logo’s main colour for buttons, its second colour for badges.',
      values: { primary: readable(base), accent: acc, text: ink, bg: hsl(h, Math.min(0.3, s), 0.975), surface: '#ffffff', sale } },
    { id: 'soft', name: 'Soft and light', why: 'A pale wash of your colour behind everything; calm and airy.',
      values: { primary: readable(base), accent: readable(hsl(hslOf(acc)[0], 0.55, 0.55)), text: ink, bg: hsl(h, 0.45, 0.955), surface: '#ffffff', sale } },
    { id: 'bold', name: 'Bold contrast', why: 'Deep brand colour and a strong opposite accent; stands out on phones.',
      values: { primary: readable(hsl(h, Math.max(s, 0.6), 0.36)), accent: hsl(h + 180, 0.85, 0.5), text: '#0b0b0f', bg: '#ffffff', surface: '#ffffff', sale, headerTone: 'dark' } },
    { id: 'warm', name: 'Warm neutral', why: 'Cream page and an amber accent; friendly for food, home and gifts.',
      values: { primary: readable(base), accent: '#d97706', text: '#1f1b16', bg: '#faf6ef', surface: '#ffffff', sale } },
    { id: 'mono', name: 'One colour', why: 'Only your brand colour and greys; clean and premium.',
      values: { primary: readable(base), accent: hsl(h, Math.min(0.5, s), 0.2), text: '#111316', bg: '#f5f5f4', surface: '#ffffff', sale } },
  ];
}

const MOODS = [
  { id: 'neutral', test: (h, s) => s < 0.15, fonts: [['archivo', 'Plain and sturdy, lets products lead'], ['instrument', 'Quietly premium serif headings'], ['jakarta', 'Crisp, modern retail']] },
  { id: 'red', test: (h) => h < 18 || h >= 340, fonts: [['unbounded', 'Loud, wide headings for deals'], ['sora', 'Confident and techy'], ['bricolage', 'Energetic, a little playful']] },
  { id: 'orange', test: (h) => h < 48, fonts: [['fraunces', 'Warm, friendly serif'], ['sora', 'Modern and upbeat'], ['bricolage', 'Lively shop feel']] },
  { id: 'yellow', test: (h) => h < 78, fonts: [['lexend', 'Very easy to read'], ['bricolage', 'Cheerful and bold'], ['sora', 'Clean and modern']] },
  { id: 'green', test: (h) => h < 170, fonts: [['youngserif', 'Natural, handmade feel'], ['fraunces', 'Warm and trusted'], ['lexend', 'Calm and clear']] },
  { id: 'blue', test: (h) => h < 250, fonts: [['jakarta', 'Trusted, clean retail'], ['archivo', 'Dense tech catalogue'], ['sora', 'Gadget lifestyle']] },
  { id: 'purple', test: (h) => h < 300, fonts: [['instrument', 'Premium, editorial'], ['dmserif', 'Elegant beauty headings'], ['bodoni', 'Fashion magazine']] },
  { id: 'pink', test: () => true, fonts: [['dmserif', 'Soft, elegant beauty'], ['instrument', 'Premium and calm'], ['bodoni', 'Fashion-forward']] },
];
export function moodOf(hex) { const [h, s] = hslOf(hex); return MOODS.find((m) => m.test(h, s)) || MOODS[0]; }
/** Font pairs that suit the logo's main colour. */
export function suggestFonts(colours) {
  const m = moodOf(lead(colours));
  return m.fonts.map(([id, why]) => ({ id, why }));
}
