// product-photos — draws the demo product pictures (Batch E picture columns) as studio-style SVG renders and saves them
// as 480×480 JPEGs. Rerunnable:
//   node tools/records/product-photos.cjs            all pictures
//   node tools/records/product-photos.cjs p-iphone-15 bubble   only these ids
// Writes public/assets/products/<product id>.jpg (Dazzle Shop demo products and stock-catalogue items) and
// public/assets/gridshop/<item id>.jpg (Grid Shop items). The pictures are illustrations: no brand names, logos or
// wordmarks. src/lib/productPhotos.js maps product ids, SKUs and names to these files (keep ITEMS below in step with it).
// Needs Playwright (chromium) and sharp; set PW / SHARP to their folders if they are not in /opt/npm-tools.
const fs = require('fs');
const path = require('path');
const NM = '/opt/npm-tools/node_modules';
const { chromium } = require(process.env.PW || NM + '/playwright');
const sharp = require(process.env.SHARP || NM + '/sharp');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = { dazzle: path.join(ROOT, 'public/assets/products'), grid: path.join(ROOT, 'public/assets/gridshop') };

// ---- colour -----------------------------------------------------------------------------------------------------
const h2r = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((x) => x + x).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const r2h = (r) => '#' + r.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const A = h2r(a), B = h2r(b); return r2h(A.map((v, i) => v + (B[i] - v) * t)); };
const L = (a, t) => mix(a, '#ffffff', t);
const D = (a, t) => mix(a, '#000000', t);
const f = (n) => (Math.round(n * 100) / 100).toString();

// ---- one drawing's defs ------------------------------------------------------------------------------------------
class Ctx {
  constructor() { this.defs = []; this.n = 0; }
  id(p = 'i') { return p + ++this.n; }
  grad(type, stops, attrs) {
    const id = this.id('g');
    const s = stops.map(([o, col, a]) => `<stop offset="${o}" stop-color="${col}"${a == null ? '' : ` stop-opacity="${a}"`}/>`).join('');
    this.defs.push(`<${type} id="${id}" ${attrs}>${s}</${type}>`);
    return `url(#${id})`;
  }
  lin(stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1, user = false) {
    return this.grad('linearGradient', stops, `x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${user ? ' gradientUnits="userSpaceOnUse"' : ''}`);
  }
  rad(stops, cx = 0.5, cy = 0.5, r = 0.5, user = false, fx, fy) {
    return this.grad('radialGradient', stops, `cx="${cx}" cy="${cy}" r="${r}"${fx != null ? ` fx="${fx}" fy="${fy}"` : ''}${user ? ' gradientUnits="userSpaceOnUse"' : ''}`);
  }
  clip(inner) { const id = this.id('c'); this.defs.push(`<clipPath id="${id}">${inner}</clipPath>`); return `url(#${id})`; }
  sym(inner) { const id = this.id('s'); this.defs.push(`<g id="${id}">${inner}</g>`); return id; }
}

const FILTERS = [1, 1.5, 2, 3, 5, 8, 12, 18, 30].map((b) => `<filter id="b${String(b).replace('.', '_')}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${b}"/></filter>`).join('');
const blur = (b) => `url(#b${String(b).replace('.', '_')})`;

/** A soft floor shadow (wide) or contact shadow (tight). */
const S = (cx, cy, rx, ry, o = 0.22, b = 12) => { if (b >= 14) { o *= 0.7; b = 30; ry *= 1.3; } return `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="#1a2130" opacity="${o}" filter="${blur(b)}"/>`; };
const rr = (x, y, w, h, r, extra = '') => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}" ${extra}/>`;
const circ = (cx, cy, r, extra = '') => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" ${extra}/>`;
const ell = (cx, cy, rx, ry, extra = '') => `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" ${extra}/>`;
const poly = (pts, extra = '') => `<polygon points="${pts.map((p) => f(p[0]) + ',' + f(p[1])).join(' ')}" ${extra}/>`;
const g = (tr, inner) => `<g transform="${tr}">${inner}</g>`;

function scene(c, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="480" height="480" viewBox="0 0 480 480">
<defs>${FILTERS}
<radialGradient id="bgG" cx="240" cy="190" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#f3f5f8"/><stop offset="1" stop-color="#dbe0e7"/></radialGradient>
<linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b6577" stop-opacity="0"/><stop offset="1" stop-color="#5b6577" stop-opacity=".09"/></linearGradient>
${c.defs.join('\n')}</defs>
<rect width="480" height="480" fill="url(#bgG)"/><rect y="300" width="480" height="180" fill="url(#floorG)"/>
${body}</svg>`;
}

/** Stack a shape from (dx,dy) back to the front: a smooth extruded solid (rounded boxes, rolls, pucks). */
function extrude(c, shape, dx, dy, steps = 24) {
  const id = c.sym(shape);
  let s = '';
  for (let i = steps; i >= 1; i--) { const t = i / steps; s += `<use href="#${id}" transform="translate(${f(dx * t)},${f(dy * t)})"/>`; }
  return s;
}
function extrudeClip(c, shape, dx, dy, steps = 24) {
  const id = c.sym(shape);
  let s = `<use href="#${id}"/>`;
  for (let i = steps; i >= 1; i--) { const t = i / steps; s += `<use href="#${id}" transform="translate(${f(dx * t)},${f(dy * t)})"/>`; }
  return c.clip(s);
}

// ---- isometric-ish boxes -------------------------------------------------------------------------------------------
const EX = [0.86, -0.27], EY = [-0.66, -0.3];
function isoBox(c, ox, oy, W, Dp, H, col, o = {}) {
  const P = (x, y, z) => [ox + x * EX[0] + y * EY[0], oy + x * EX[1] + y * EY[1] - z];
  const top = o.top || L(col, 0.14), left = o.left || col, right = o.right || D(col, 0.16);
  const fR = c.lin([[0, L(right, 0.06)], [1, D(right, 0.08)]], 0, 0, 1, 0);
  const fL = c.lin([[0, D(left, 0.04)], [1, L(left, 0.07)]], 0, 0, 1, 0);
  const fT = c.lin([[0, L(top, 0.08)], [1, D(top, 0.03)]], 0, 0, 1, 1);
  const st = o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw || 1}" stroke-linejoin="round"` : '';
  const body = poly([P(0, 0, 0), P(W, 0, 0), P(W, 0, H), P(0, 0, H)], `fill="${fR}"${st}`)
    + poly([P(0, 0, 0), P(0, Dp, 0), P(0, Dp, H), P(0, 0, H)], `fill="${fL}"${st}`)
    + poly([P(0, 0, H), P(W, 0, H), P(W, Dp, H), P(0, Dp, H)], `fill="${fT}"${st}`)
    + `<polyline points="${[P(0, Dp, H), P(0, 0, H), P(W, 0, H)].map((p) => f(p[0]) + ',' + f(p[1])).join(' ')}" fill="none" stroke="#fff" stroke-opacity="${o.edge ?? 0.45}" stroke-width="1.2"/>`
    + `<line x1="${f(P(0, 0, 0)[0])}" y1="${f(P(0, 0, 0)[1])}" x2="${f(P(0, 0, H)[0])}" y2="${f(P(0, 0, H)[1])}" stroke="#fff" stroke-opacity="${(o.edge ?? 0.45) * 0.6}" stroke-width="1"/>`;
  // draw flat things onto a face: R (front-right), L (front-left), T (top). Face coordinates: u across, v down from the top edge.
  const M = {
    R: `matrix(${EX[0]},${EX[1]},0,1,${f(ox)},${f(oy - H)})`,
    L: `matrix(${-EY[0]},${-EY[1]},0,1,${f(ox + Dp * EY[0])},${f(oy + Dp * EY[1] - H)})`,
    T: `matrix(${EX[0]},${EX[1]},${-EY[0]},${-EY[1]},${f(ox + Dp * EY[0])},${f(oy + Dp * EY[1] - H)})`,
  };
  const on = (face, inner) => `<g transform="${M[face]}">${inner}</g>`;
  return { body, P, on };
}

// ---- parts -------------------------------------------------------------------------------------------------------
function lens(c, cx, cy, r, ring = '#8d939c') {
  const rg = c.lin([[0, L(ring, 0.55)], [0.5, ring], [1, D(ring, 0.45)]], 0, 0, 1, 1);
  const glass = c.rad([[0, '#3d4f86'], [0.35, '#1b2342'], [0.8, '#07080d'], [1, '#050507']], 0.42, 0.4, 0.6);
  return circ(cx, cy + r * 0.08, r * 1.04, `fill="#000" opacity=".35" filter="${blur(1.5)}"`)
    + circ(cx, cy, r, `fill="${rg}"`) + circ(cx, cy, r * 0.8, `fill="#0a0b0f"`) + circ(cx, cy, r * 0.62, `fill="${glass}"`)
    + circ(cx, cy, r * 0.22, `fill="#141a30"`) + circ(cx + r * 0.08, cy + r * 0.1, r * 0.1, `fill="#5866a8" opacity=".5"`)
    + ell(cx - r * 0.26, cy - r * 0.3, r * 0.2, r * 0.1, `fill="#fff" opacity=".55" transform="rotate(-35 ${f(cx - r * 0.26)} ${f(cy - r * 0.3)})"`);
}
const flash = (c, cx, cy, r) => circ(cx, cy, r, `fill="${c.rad([[0, '#fffdf2'], [0.6, '#efe3b8'], [1, '#bfb08a']])}" stroke="#00000033" stroke-width=".6"`);

function phoneFront(c, o) {
  const { x, y, w, h, r = 26, frame = '#3a3f47', wall = ['#0f172a', '#6d28d9', '#38bdf8'], cut = 'punch', time = '10:30', screen } = o;
  const bz = Math.max(5, w * 0.042);
  const sx = x + bz, sy = y + bz, sw = w - 2 * bz, sh = h - 2 * bz, sr = Math.max(4, r - bz * 0.85);
  const clip = c.clip(rr(sx, sy, sw, sh, sr));
  const rim = c.lin([[0, L(frame, 0.5)], [0.05, frame], [0.5, D(frame, 0.2)], [0.95, frame], [1, L(frame, 0.5)]], 0, 0, 1, 0);
  const base = c.lin([[0, wall[0]], [1, D(wall[1], 0.4)]], 0, 0, 0.3, 1);
  let s = '';
  s += rr(x + w - 2, y + h * 0.2, 4.5, h * 0.08, 2, `fill="${D(frame, 0.15)}"`) + rr(x + w - 2, y + h * 0.31, 4.5, h * 0.13, 2, `fill="${D(frame, 0.15)}"`);
  s += rr(x, y, w, h, r, `fill="${rim}"`);
  s += rr(x + 2.4, y + 2.4, w - 4.8, h - 4.8, r - 2.2, `fill="#060709"`);
  let inner = rr(sx, sy, sw, sh, 0, `fill="${base}"`);
  if (screen) inner += screen(sx, sy, sw, sh);
  else {
    inner += circ(sx + sw * 0.12, sy + sh * 0.8, sw * 0.78, `fill="${wall[2]}" opacity=".85" filter="${blur(30)}"`)
      + circ(sx + sw * 0.98, sy + sh * 0.36, sw * 0.62, `fill="${wall[1]}" opacity=".95" filter="${blur(30)}"`)
      + circ(sx + sw * 0.62, sy + sh * 1.05, sw * 0.5, `fill="${L(wall[2], 0.45)}" opacity=".55" filter="${blur(30)}"`)
      + rr(sx, sy, sw, sh, 0, `fill="${c.lin([[0, '#000', 0.4], [0.45, '#000', 0]])}"`)
      + `<text x="${f(sx + sw / 2)}" y="${f(sy + sh * 0.135)}" font-family="Inter" font-size="${f(sw * 0.075)}" font-weight="500" fill="#fff" fill-opacity=".85" text-anchor="middle">Thursday 16 October</text>`
      + `<text x="${f(sx + sw / 2)}" y="${f(sy + sh * 0.27)}" font-family="Inter Display, Inter" font-size="${f(sw * 0.3)}" font-weight="300" letter-spacing="-1" fill="#fff" fill-opacity=".96" text-anchor="middle">${time}</text>`
      + circ(sx + sw * 0.16, sy + sh * 0.92, sw * 0.075, `fill="#fff" opacity=".16"`) + circ(sx + sw * 0.84, sy + sh * 0.92, sw * 0.075, `fill="#fff" opacity=".16"`)
      + rr(sx + sw * 0.34, sy + sh - 9, sw * 0.32, 3.4, 1.7, `fill="#fff" opacity=".75"`);
  }
  inner += poly([[sx + sw * 0.42, sy], [sx + sw * 0.8, sy], [sx + sw * 0.1, sy + sh], [sx - sw * 0.28, sy + sh]], `fill="#fff" opacity=".06"`);
  s += `<g clip-path="${clip}">${inner}</g>`;
  const cx = x + w / 2;
  if (cut === 'punch') s += circ(cx, sy + 11, w * 0.03, `fill="#030304"`) + circ(cx - 1, sy + 10, w * 0.011, `fill="#26304f"`);
  if (cut === 'pill') s += rr(cx - w * 0.15, sy + 7, w * 0.3, w * 0.088, w * 0.044, `fill="#030304"`) + circ(cx + w * 0.09, sy + 7 + w * 0.044, w * 0.017, `fill="#1c2340"`);
  if (cut === 'drop') s += `<path d="M${f(cx - w * 0.09)},${f(sy)} C${f(cx - w * 0.05)},${f(sy)} ${f(cx - w * 0.055)},${f(sy + w * 0.075)} ${f(cx)},${f(sy + w * 0.075)} C${f(cx + w * 0.055)},${f(sy + w * 0.075)} ${f(cx + w * 0.05)},${f(sy)} ${f(cx + w * 0.09)},${f(sy)} Z" fill="#060709"/>` + circ(cx, sy + w * 0.035, w * 0.015, `fill="#1c2340"`);
  s += rr(x + 0.7, y + 0.7, w - 1.4, h - 1.4, r - 0.5, `fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"`);
  return s;
}

function phoneBack(c, o) {
  const { x, y, w, h, r = 26, body, frame = body, cam = 'v3', ring = '#9aa0a8' } = o;
  const rim = c.lin([[0, L(frame, 0.45)], [0.05, frame], [0.5, D(frame, 0.2)], [0.95, frame], [1, L(frame, 0.5)]], 0, 0, 1, 0);
  const panel = c.lin([[0, L(body, 0.24)], [0.45, body], [1, D(body, 0.3)]], 0, 0, 0.9, 1);
  const clip = c.clip(rr(x + 2.4, y + 2.4, w - 4.8, h - 4.8, r - 2));
  let s = rr(x - 2, y + h * 0.2, 4.5, h * 0.08, 2, `fill="${D(frame, 0.15)}"`) + rr(x - 2, y + h * 0.31, 4.5, h * 0.13, 2, `fill="${D(frame, 0.15)}"`);
  s += rr(x, y, w, h, r, `fill="${rim}"`) + rr(x + 2.4, y + 2.4, w - 4.8, h - 4.8, r - 2, `fill="${panel}"`);
  s += `<g clip-path="${clip}">${poly([[x + w * 0.55, y], [x + w * 1.1, y], [x + w * 0.15, y + h], [x - w * 0.4, y + h]], `fill="#fff" opacity=".07"`)}${poly([[x + w * 0.78, y], [x + w * 0.88, y], [x - w * 0.05, y + h * 1.05], [x - w * 0.15, y + h * 1.05]], `fill="#fff" opacity=".05"`)}</g>`;
  const bumpCol = L(body, 0.1);
  if (cam === 'v3') {
    const lr = w * 0.085;
    for (let i = 0; i < 3; i++) s += lens(c, x + w * 0.2, y + w * 0.2 + i * lr * 2.45, lr, ring);
    s += flash(c, x + w * 0.42, y + w * 0.2, w * 0.03);
  } else if (cam === 'sq2' || cam === 'sq3') {
    const bs = w * (cam === 'sq2' ? 0.44 : 0.52), bx = x + w * 0.07, by = y + w * 0.07;
    s += rr(bx, by + 2, bs, bs, bs * 0.28, `fill="#000" opacity=".3" filter="${blur(2)}"`)
      + rr(bx, by, bs, bs, bs * 0.28, `fill="${c.lin([[0, L(bumpCol, 0.2)], [1, D(bumpCol, 0.12)]], 0, 0, 1, 1)}" stroke="${L(body, 0.35)}" stroke-width="1"`);
    if (cam === 'sq2') { const lr = bs * 0.2; s += lens(c, bx + bs * 0.3, by + bs * 0.29, lr, ring) + lens(c, bx + bs * 0.3, by + bs * 0.71, lr, ring) + flash(c, bx + bs * 0.74, by + bs * 0.3, bs * 0.07) + circ(bx + bs * 0.74, by + bs * 0.72, bs * 0.03, `fill="#111"`); }
    else { const lr = bs * 0.19; s += lens(c, bx + bs * 0.29, by + bs * 0.27, lr, ring) + lens(c, bx + bs * 0.29, by + bs * 0.73, lr, ring) + lens(c, bx + bs * 0.71, by + bs * 0.5, lr, ring) + flash(c, bx + bs * 0.76, by + bs * 0.2, bs * 0.065) + circ(bx + bs * 0.76, by + bs * 0.8, bs * 0.06, `fill="#15171c"`); }
  } else if (cam === 'isl3') {
    const iw = w * 0.38, ih = w * 0.74, ix = x + w * 0.07, iy = y + w * 0.07;
    s += rr(ix, iy + 2, iw, ih, iw * 0.32, `fill="#000" opacity=".3" filter="${blur(2)}"`) + rr(ix, iy, iw, ih, iw * 0.32, `fill="${c.lin([[0, L(body, 0.12)], [1, D(body, 0.25)]], 0, 0, 1, 1)}" stroke="${L(body, 0.3)}" stroke-width="1"`);
    s += lens(c, ix + iw / 2, iy + iw * 0.48, iw * 0.33, ring) + lens(c, ix + iw / 2, iy + iw * 1.18, iw * 0.3, ring) + lens(c, ix + iw * 0.3, iy + ih - iw * 0.26, iw * 0.13, ring) + flash(c, ix + iw * 0.7, iy + ih - iw * 0.26, iw * 0.11);
  } else if (cam === 'rings2') {
    const iw = w * 0.36, ih = w * 0.8, ix = x + w * 0.07, iy = y + w * 0.07;
    s += rr(ix, iy + 2, iw, ih, iw / 2, `fill="#000" opacity=".3" filter="${blur(2)}"`) + rr(ix, iy, iw, ih, iw / 2, `fill="${c.lin([[0, L(body, 0.16)], [1, D(body, 0.2)]], 0, 0, 1, 1)}" stroke="${L(body, 0.3)}" stroke-width="1"`);
    s += lens(c, ix + iw / 2, iy + iw * 0.5, iw * 0.38, ring) + lens(c, ix + iw / 2, iy + iw * 1.32, iw * 0.38, ring) + flash(c, ix + iw / 2, iy + ih - iw * 0.22, iw * 0.1);
  }
  s += rr(x + 0.7, y + 0.7, w - 1.4, h - 1.4, r - 0.5, `fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1"`);
  return s;
}

function phonePair(c, o) {
  const back = { x: 92, y: 60, w: 152, h: 318 }, front = { x: 222, y: 80, w: 164, h: 340 };
  return S(171, 382, 92, 9, 0.28, 8) + S(304, 424, 100, 10, 0.32, 8) + S(250, 420, 190, 22, 0.12, 18)
    + phoneBack(c, { ...back, r: o.r || 26, body: o.body, frame: o.frame || o.body, cam: o.cam, ring: o.ring })
    + phoneFront(c, { ...front, r: (o.r || 26) + 1, frame: o.frame || o.body, wall: o.wall, cut: o.cut, time: o.time });
}

/** A plain rounded box (front face + side seen to the top right): chargers, power banks, adapters. */
function roundBox(c, o) {
  const { x, y, w, h, r, dx, dy, col, sideCol = D(col, 0.18), topCol = L(col, 0.1), front } = o;
  const layer = c.lin([[0, topCol], [0.5, mix(topCol, sideCol, 0.5)], [1, sideCol]], 0, 0, 1, 1);
  let s = extrude(c, rr(x, y, w, h, r, `fill="${layer}"`), dx, dy, Math.max(16, Math.round(Math.hypot(dx, dy) / 1.2)));
  s += rr(x, y, w, h, r, `fill="${front || c.rad([[0, L(col, 0.35)], [0.7, col], [1, D(col, 0.08)]], 0.35, 0.3, 0.9)}"`);
  s += rr(x + 0.8, y + 0.8, w - 1.6, h - 1.6, r - 0.6, `fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.2"`);
  return s;
}

function usbC(c, cx, cy, w = 34, h = 12) {
  return rr(cx - w / 2, cy - h / 2, w, h, h / 2, `fill="${c.lin([[0, '#1b1d22'], [1, '#3a3e46']])}" stroke="#9aa1ab" stroke-width="1.2"`)
    + rr(cx - w * 0.3, cy - 1.6, w * 0.6, 3.2, 1.6, `fill="#d4b26a" opacity=".85"`);
}

function pins(c, xs, baseY, len = 46, wdt = 15) {
  const m = c.lin([[0, '#6c727c'], [0.3, '#f4f6f8'], [0.55, '#c3c8cf'], [1, '#5f656e']], 0, 0, 1, 0);
  const tip = c.rad([[0, '#ffffff'], [0.5, '#d5d9de'], [1, '#7b828b']], 0.35, 0.3, 0.7);
  return xs.map((px) => ell(px, baseY, wdt * 0.85, wdt * 0.32, `fill="#c9cdd3"`) + rr(px - wdt / 2, baseY - len, wdt, len, 2, `fill="${m}"`)
    + `<path d="M${f(px - wdt / 2)},${f(baseY - len + 1)} A${f(wdt / 2)},${f(wdt * 0.55)} 0 0 1 ${f(px + wdt / 2)},${f(baseY - len + 1)} Z" fill="${tip}"/>`
    + ell(px, baseY - len * 0.25, wdt * 0.5, 1.4, `fill="#4b5058" opacity=".35"`)).join('');
}

/** A coiled cable: loops around (cx,cy). */
function coil(c, cx, cy, rx, ry, loops, col, o = {}) {
  const wd = o.width || 9;
  const hi = o.hi || L(col, 0.5);
  let s = '';
  for (let i = 0; i < loops; i++) {
    const ox = cx + (i - loops / 2) * 5, oy = cy + (i - loops / 2) * 4, rot = (i - loops / 2) * 4;
    const e = (sw, colr, op, dy2 = 0, extra = '') => ell(ox, oy + dy2, rx - i * 3, ry - i * 1.5, `fill="none" stroke="${colr}" stroke-width="${sw}" opacity="${op}" transform="rotate(${rot} ${f(ox)} ${f(oy)})" ${extra}`);
    s += e(wd + 2.2, D(col, 0.45), 0.55, 1.5) + e(wd, col, 1) + e(wd * 0.32, hi, 0.55, -wd * 0.22);
    if (o.braid) s += e(wd * 0.75, L(col, 0.25), 0.35, 0, 'stroke-dasharray="1.6 2.4"');
  }
  return s;
}
const cable = (d, col, wd, o = {}) => `<path d="${d}" fill="none" stroke="${D(col, 0.4)}" stroke-width="${wd + 2}" stroke-linecap="round" opacity=".55"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${wd}" stroke-linecap="round"/>`
  + `<path d="${d}" fill="none" stroke="${L(col, 0.55)}" stroke-width="${wd * 0.3}" stroke-linecap="round" opacity=".5" transform="translate(-1,-1.2)"/>` + (o.braid ? `<path d="${d}" fill="none" stroke="${L(col, 0.3)}" stroke-width="${wd * 0.75}" stroke-dasharray="1.6 2.4" opacity=".35"/>` : '');

/** USB plug lying on the floor, pointing along angle a (deg), housing centre (cx,cy). type c | a | ltg */
function plug(c, cx, cy, a, o = {}) {
  const { col = '#2b2f36', type = 'c', s = 1 } = o;
  const hw = (type === 'a' ? 34 : 28) * s, hh = 66 * s;
  const house = c.lin([[0, D(col, 0.25)], [0.3, L(col, 0.35)], [0.55, col], [1, D(col, 0.35)]], 0, 0, 1, 0);
  const metal = c.lin([[0, '#80878f'], [0.35, '#f3f5f7'], [0.65, '#b8bec6'], [1, '#6f757d']], 0, 0, 1, 0);
  let inner = rr(-hw * 0.32, hh * 0.42, hw * 0.64, 22 * s, 6 * s, `fill="${house}"`);
  inner += rr(-hw / 2, -hh / 2, hw, hh, (type === 'a' ? 6 : 11) * s, `fill="${house}"`) + rr(-hw / 2 + 1, -hh / 2 + 1, hw - 2, hh - 2, 10 * s, `fill="none" stroke="#fff" stroke-opacity=".35"`);
  if (type === 'c') inner += rr(-8.5 * s, -hh / 2 - 22 * s, 17 * s, 25 * s, 7 * s, `fill="${metal}"`) + rr(-5 * s, -hh / 2 - 19 * s, 10 * s, 3 * s, 1.5 * s, `fill="#2a2d33"`);
  if (type === 'a') inner += rr(-14 * s, -hh / 2 - 34 * s, 28 * s, 36 * s, 1.5 * s, `fill="${metal}"`) + rr(-8 * s, -hh / 2 - 28 * s, 5 * s, 6 * s, 1, `fill="#3a3e45"`) + rr(3 * s, -hh / 2 - 28 * s, 5 * s, 6 * s, 1, `fill="#3a3e45"`);
  if (type === 'ltg') inner += rr(-5.5 * s, -hh / 2 - 26 * s, 11 * s, 29 * s, 5 * s, `fill="${metal}"`) + rr(-2 * s, -hh / 2 - 22 * s, 4 * s, 16 * s, 2 * s, `fill="#d9c27a" opacity=".6"`);
  return S(cx, cy + 10, hw * 0.9, 9, 0.2, 5) + g(`translate(${f(cx)},${f(cy)}) rotate(${a})`, inner);
}

function caseBack(c, o) {
  const { x, y, w, h, r = 30, col, cut = 'sq', clear = false, rugged = false } = o;
  let s = '';
  const outer = rr(x, y, w, h, r);
  const holeX = x + w * 0.07, holeY = y + w * 0.07, hs = cut === 'v3' ? [w * 0.28, w * 0.66] : [w * 0.5, w * 0.5];
  if (clear) {
    s += rr(x, y, w, h, r, `fill="${c.lin([[0, '#ffffff', 0.55], [0.5, '#e8eef6', 0.35], [1, '#cfd8e4', 0.55]], 0, 0, 1, 1)}" stroke="#aab5c3" stroke-width="2.2"`);
    s += rr(x + 7, y + 7, w - 14, h - 14, r - 6, `fill="none" stroke="#ffffff" stroke-opacity=".9" stroke-width="2"`);
    s += rr(x + 3, y + 3, w - 6, h - 6, r - 2, `fill="none" stroke="#b9c4d2" stroke-opacity=".7" stroke-width="1"`);
    [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([qx, qy]) => { s += circ(qx + (qx > x ? -r * 0.55 : r * 0.55), qy + (qy > y ? -r * 0.55 : r * 0.55), r * 0.55, `fill="#ffffff" opacity=".45"`); });
    s += rr(holeX, holeY, hs[0], hs[1], hs[0] * 0.28, `fill="#e9edf2" stroke="#9aa6b5" stroke-width="2"`);
    s += `<g clip-path="${c.clip(outer)}">${poly([[x + w * 0.5, y], [x + w * 0.75, y], [x + w * 0.05, y + h], [x - w * 0.2, y + h]], `fill="#fff" opacity=".55"`)}${poly([[x + w * 0.85, y], [x + w * 0.92, y], [x + w * 0.2, y + h], [x + w * 0.13, y + h]], `fill="#fff" opacity=".5"`)}</g>`;
    s += rr(x + w - 3, y + h * 0.22, 5, h * 0.18, 2.5, `fill="#c9d2dd"`);
    return s;
  }
  const lip = c.lin([[0, L(col, 0.25)], [0.5, D(col, 0.12)], [1, L(col, 0.1)]], 0, 0, 1, 0);
  s += rr(x, y, w, h, r, `fill="${lip}"`);
  const pan = rugged ? c.lin([[0, L(col, 0.18)], [1, D(col, 0.15)]], 0, 0, 1, 1) : c.rad([[0, L(col, 0.22)], [0.6, col], [1, D(col, 0.18)]], 0.3, 0.25, 0.95);
  s += rr(x + 4, y + 4, w - 8, h - 8, r - 3, `fill="${pan}"`);
  if (rugged) {
    s += rr(x + 16, y + h * 0.3, w - 32, h * 0.6, 14, `fill="${c.lin([[0, L(col, 0.1)], [1, D(col, 0.12)]], 0, 0, 1, 1)}" stroke="${L(col, 0.22)}" stroke-width="1.5"`);
    for (let i = 0; i < 6; i++) s += rr(x + 30, y + h * 0.36 + i * 9, w - 60, 3, 1.5, `fill="${L(col, 0.18)}" opacity=".6"`);
    s += rr(x + w * 0.3, y + h * 0.62, w * 0.4, h * 0.22, 8, `fill="${D(col, 0.2)}" stroke="${L(col, 0.25)}" stroke-width="1.2"`) + rr(x + w * 0.36, y + h * 0.66, w * 0.28, 4, 2, `fill="${L(col, 0.2)}"`);
    [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([qx, qy]) => { const ax = qx > x ? qx - 34 : qx, ay = qy > y ? qy - 34 : qy; s += rr(ax, ay, 34, 34, 16, `fill="${D(col, 0.25)}" opacity=".85"`) + rr(ax + 4, ay + 4, 26, 26, 12, `fill="none" stroke="${L(col, 0.25)}" stroke-width="1.2" opacity=".7"`); });
  }
  s += rr(holeX - 3, holeY - 3, hs[0] + 6, hs[1] + 6, hs[0] * 0.3, `fill="${D(col, 0.22)}"`);
  s += rr(holeX, holeY, hs[0], hs[1], hs[0] * 0.26, `fill="${c.lin([[0, D(col, 0.45)], [1, D(col, 0.2)]], 0, 0, 0, 1)}"`);
  s += rr(holeX + 3, holeY + hs[1] - 8, hs[0] - 6, 4, 2, `fill="#fff" opacity=".12"`);
  s += rr(x + w - 4, y + h * 0.22, 6, h * 0.09, 3, `fill="${L(col, 0.12)}"`) + rr(x + w - 4, y + h * 0.33, 6, h * 0.14, 3, `fill="${L(col, 0.12)}"`);
  s += `<g clip-path="${c.clip(outer)}">${poly([[x + w * 0.45, y], [x + w * 0.85, y], [x + w * 0.15, y + h], [x - w * 0.25, y + h]], `fill="#fff" opacity=".06"`)}</g>`;
  s += rr(x + 0.8, y + 0.8, w - 1.6, h - 1.6, r - 0.6, `fill="none" stroke="#fff" stroke-opacity=".25"`);
  return s;
}

function earbud(c, cx, cy, rot, col, o = {}) {
  const mesh = o.mesh || (col === '#f4f5f7' ? '#3a3f47' : '#8b929c');
  const bodyG = c.rad([[0, L(col, 0.55)], [0.55, col], [1, D(col, 0.3)]], 0.35, 0.3, 0.8);
  const inner = ell(0, 0, 30, 26, `fill="${bodyG}"`) + ell(-20, 4, 15, 17, `fill="${c.rad([[0, L(o.tip || '#9aa3ad', 0.4)], [1, o.tip || '#9aa3ad']], 0.4, 0.35, 0.7)}" opacity=".95"`)
    + ell(6, -4, 12, 9, `fill="${mesh}" opacity=".85"`) + ell(4, -7, 6, 2.5, `fill="#fff" opacity=".35"`)
    + rr(8, 10, 14, 44, 7, `fill="${c.lin([[0, D(col, 0.15)], [0.4, L(col, 0.4)], [1, D(col, 0.25)]], 0, 0, 1, 0)}"`)
    + ell(-6, -14, 10, 4, `fill="#fff" opacity=".6" transform="rotate(-20)"`);
  return g(`translate(${f(cx)},${f(cy)}) rotate(${rot})`, inner);
}

function budsCase(c, o) {
  const { cx = 240, by = 380, w = 200, h = 116, col, inside, bud, r = 50 } = o;
  const x = cx - w / 2, y = by - h;
  let s = S(cx, by + 4, w * 0.5, 10, 0.32, 6) + S(cx, by + 6, w * 0.7, 22, 0.14, 16);
  // lid, open, behind
  const lidH = h * 0.95, ly = y - lidH - 18;
  s += rr(x + 6, ly, w - 12, lidH, r, `fill="${c.lin([[0, L(col, 0.12)], [1, D(col, 0.18)]], 0, 0, 0, 1)}"`);
  s += rr(x + 14, ly + 8, w - 28, lidH - 14, r - 8, `fill="${c.lin([[0, D(inside, 0.05)], [1, L(inside, 0.12)]], 0, 0, 0, 1)}"`);
  s += rr(x + 6.8, ly + 0.8, w - 13.6, lidH - 1.6, r - 0.8, `fill="none" stroke="#fff" stroke-opacity=".4"`);
  s += rr(cx - 34, y - 26, 68, 16, 6, `fill="${c.lin([[0, '#b8bec7'], [0.5, '#eef1f4'], [1, '#8a9099']], 0, 0, 1, 0)}"`);
  // base: top surface + cradle
  s += extrude(c, rr(x, y, w, h, r, `fill="${c.lin([[0, L(col, 0.2)], [1, D(col, 0.12)]])}"`), 0, -26, 18);
  s += rr(x + 16, y - 22, w - 32, 34, 17, `fill="${c.lin([[0, D(inside, 0.25)], [1, D(inside, 0.05)]])}"`);
  s += earbud(c, cx - 44, y - 22, -28, bud, { tip: o.tip }) + earbud(c, cx + 44, y - 22, 208, bud, { tip: o.tip });
  s += g(`translate(${f(2 * (cx + 44))},0) scale(-1,1)`, '');
  // front
  s += rr(x, y, w, h, r, `fill="${c.rad([[0, L(col, 0.32)], [0.65, col], [1, D(col, 0.2)]], 0.35, 0.2, 0.95)}"`);
  s += rr(x + 1, y + 1, w - 2, h - 2, r - 1, `fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.2"`);
  s += `<g clip-path="${c.clip(rr(x, y, w, h, r))}">${poly([[x + w * 0.2, y], [x + w * 0.45, y], [x + w * 0.3, y + h], [x + w * 0.05, y + h]], `fill="#fff" opacity=".1"`)}</g>`;
  s += circ(cx, y + h * 0.5, 3, `fill="#fff" opacity=".95"`) + circ(cx, y + h * 0.5, 7, `fill="#fff" opacity=".35" filter="${blur(3)}"`);
  return s;
}

function rollFace(c, cx, cy, R, o = {}) {
  // a roll lying on its side, face to the viewer (slightly turned), depth to the back right
  const { col = '#f7f7f5', edge = D(col, 0.12), core = '#b88a5a', hole = 0.38, coreW = 0.12, dx = 34, dy = -16, squash = 0.86, rings = true } = o;
  const rx = R * squash, ry = R;
  let s = extrude(c, ell(cx, cy, rx, ry, `fill="${c.lin([[0, L(edge, 0.25)], [1, D(edge, 0.12)]], 0, 0, 1, 1)}"`), dx, dy, 28);
  s += ell(cx, cy, rx, ry, `fill="${c.rad([[0, L(col, 0.4)], [0.8, col], [1, D(col, 0.08)]], 0.4, 0.35, 0.7)}"`);
  if (rings) for (let k = 1; k <= 6; k++) { const t = hole + coreW + (1 - hole - coreW) * (k / 7); s += ell(cx, cy, rx * t, ry * t, `fill="none" stroke="${D(col, 0.1)}" stroke-width=".7" opacity=".6"`); }
  if (o.face) s += o.face(cx, cy, rx, ry);
  s += ell(cx, cy, rx * (hole + coreW), ry * (hole + coreW), `fill="${c.lin([[0, L(core, 0.15)], [1, D(core, 0.15)]], 0, 0, 1, 1)}"`);
  s += ell(cx, cy, rx * hole, ry * hole, `fill="${c.lin([[0, D(core, 0.55)], [1, D(core, 0.25)]], 0, 0, 1, 1)}"`);
  s += `<path d="M${f(cx - rx * hole)},${f(cy)} A${f(rx * hole)},${f(ry * hole)} 0 0 1 ${f(cx + rx * hole)},${f(cy)} A${f(rx * hole * 0.9)},${f(ry * hole * 0.8)} 0 0 0 ${f(cx - rx * hole)},${f(cy)} Z" fill="${D(core, 0.65)}" opacity=".6"/>`;
  s += ell(cx, cy, rx - 0.8, ry - 0.8, `fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.2"`);
  return s;
}

function cylUp(c, cx, by, rx, ry, h, col, o = {}) {
  const side = c.lin([[0, D(col, 0.22)], [0.28, L(col, 0.35)], [0.55, col], [1, D(col, 0.28)]], 0, 0, 1, 0);
  let s = `<path d="M${f(cx - rx)},${f(by - h)} L${f(cx - rx)},${f(by)} A${f(rx)},${f(ry)} 0 0 0 ${f(cx + rx)},${f(by)} L${f(cx + rx)},${f(by - h)} Z" fill="${side}"/>`;
  if (o.lines) for (let k = 1; k < o.lines; k++) { const yy = by - h * (k / o.lines); s += `<path d="M${f(cx - rx)},${f(yy)} A${f(rx)},${f(ry)} 0 0 0 ${f(cx + rx)},${f(yy)}" fill="none" stroke="${D(col, 0.1)}" stroke-width=".6" opacity=".5"/>`; }
  s += ell(cx, by - h, rx, ry, `fill="${c.lin([[0, L(col, 0.35)], [1, L(col, 0.08)]], 0, 0, 1, 1)}"`);
  if (o.hole) {
    const t = o.hole, k = o.core || 0.12;
    if (o.rings) for (let j = 1; j <= 5; j++) { const q = t + k + (1 - t - k) * (j / 6); s += ell(cx, by - h, rx * q, ry * q, `fill="none" stroke="${D(col, 0.1)}" stroke-width=".7" opacity=".55"`); }
    s += ell(cx, by - h, rx * (t + k), ry * (t + k), `fill="${c.lin([[0, '#c9a172'], [1, '#9b7148']], 0, 0, 1, 1)}"`) + ell(cx, by - h, rx * t, ry * t, `fill="${c.lin([[0, '#3b2a1a'], [1, '#6b4c30']])}"`);
  }
  s += ell(cx, by - h, rx - 0.6, ry - 0.6, `fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1"`);
  return s;
}

const barcode = (x, y, w, h, col = '#1b1d22', seed = 7) => {
  let s = '', px = x, k = seed;
  while (px < x + w - 2) { k = (k * 9301 + 49297) % 233280; const bw = 0.8 + (k % 4) * 0.7; s += `<rect x="${f(px)}" y="${f(y)}" width="${f(bw)}" height="${f(h)}" fill="${col}"/>`; px += bw + 0.9 + ((k >> 3) % 3) * 0.6; }
  return s;
};
const lines = (x, y, ws, gap, h = 3, col = '#c7ccd4') => ws.map((w, i) => rr(x, y + i * gap, w, h, h / 2, `fill="${col}"`)).join('');

/** A generic brand mark for "your logo" items: a rounded square with an abstract arc (no letters). */
const mark = (cx, cy, s, col, fg = '#fff') => rr(cx - s / 2, cy - s / 2, s, s, s * 0.28, `fill="${col}"`) + `<path d="M${f(cx - s * 0.22)},${f(cy + s * 0.18)} A${f(s * 0.24)},${f(s * 0.24)} 0 1 1 ${f(cx + s * 0.22)},${f(cy + s * 0.18)}" fill="none" stroke="${fg}" stroke-width="${f(s * 0.12)}" stroke-linecap="round"/>` + circ(cx, cy + s * 0.12, s * 0.08, `fill="${fg}"`);

// ---- the items ---------------------------------------------------------------------------------------------------
const W = (c, body) => body;   // readability helper
const ITEMS = [];
const add = (kind, id, name, skus, draw) => ITEMS.push({ kind, id, name, skus, draw });

// Phones
add('dazzle', 'p-phone-5gp', '5G Smartphone Pro 256GB', ['PH-5GP-256', 'PH-5GP-256-BK', 'PH-5GP-256-SV', 'PH-5GP-256-BL', 'PH-5GP-512-BK'],
  (c) => phonePair(c, { body: '#1f2329', frame: '#3b4048', cam: 'v3', cut: 'punch', wall: ['#0b1026', '#7c3aed', '#22d3ee'] }));
add('dazzle', 'p-iphone-15', 'iPhone 15 128GB', ['PH-IPH-15'],
  (c) => phonePair(c, { body: '#2c3036', frame: '#4a4f57', cam: 'sq2', cut: 'pill', r: 30, wall: ['#1a1023', '#f472b6', '#fb923c'], time: '9:24' }));
add('dazzle', 'p-redmi-n13', 'Redmi Note 13 8/256GB', ['PH-RDM-N13'],
  (c) => phonePair(c, { body: '#4a5059', frame: '#5d636c', cam: 'isl3', cut: 'punch', r: 22, wall: ['#071a1f', '#14b8a6', '#a3e635'], time: '11:05' }));
add('dazzle', 'p-galaxy-a15', 'Galaxy A15 6/128GB', ['PH-GAL-A15'],
  (c) => phonePair(c, { body: '#1d2b4a', frame: '#2a3a5e', cam: 'v3', ring: '#2c3a58', cut: 'drop', r: 24, wall: ['#08122e', '#3b82f6', '#a78bfa'], time: '8:47' }));
add('dazzle', 'p-realme-n50', 'Realme Note 50 6/128GB', ['PH-RLM-N50'],
  (c) => phonePair(c, { body: '#16181d', frame: '#2a2d33', cam: 'rings2', ring: '#c9a96a', cut: 'punch', r: 24, wall: ['#1a0b05', '#f59e0b', '#ef4444'], time: '7:15' }));
add('dazzle', 'p-iphone-15p', 'iPhone 15 Pro (old stock)', ['PH-IPH-15P', 'PH-IPH-15P-128', 'PH-IPH-15P-256'],
  (c) => phonePair(c, { body: '#8f8a81', frame: '#b5afa4', cam: 'sq3', ring: '#a39d92', cut: 'pill', r: 30, wall: ['#1c1917', '#a8a29e', '#f5d0a9'], time: '6:52' }));

add('dazzle', 'p-symphony-d50', 'Symphony D50 Feature Phone', ['PH-SYM-D50'], (c) => {
  const x = 165, y = 52, w = 150, h = 356, col = '#24272c';
  let s = S(240, 410, 82, 10, 0.32, 7) + S(240, 412, 140, 20, 0.12, 16);
  s += rr(x, y, w, h, 40, `fill="${c.lin([[0, L(col, 0.18)], [0.12, col], [0.5, D(col, 0.15)], [0.88, col], [1, L(col, 0.15)]], 0, 0, 1, 0)}"`);
  s += rr(x + 4, y + 4, w - 8, h - 8, 36, `fill="${c.lin([[0, L(col, 0.12)], [1, D(col, 0.2)]], 0, 0, 0.6, 1)}"`);
  s += rr(x + w / 2 - 22, y + 18, 44, 5, 2.5, `fill="#0b0c0e"`);
  const sx = x + 18, sy = y + 34, sw = w - 36, sh = 120;
  s += rr(sx - 4, sy - 4, sw + 8, sh + 8, 10, `fill="#0a0b0d"`);
  s += rr(sx, sy, sw, sh, 4, `fill="${c.lin([[0, '#1d4ed8'], [0.55, '#2563eb'], [1, '#7dd3fc']], 0, 0, 0.6, 1)}"`);
  s += circ(sx + sw * 0.75, sy + sh * 0.8, 40, `fill="#bae6fd" opacity=".5" filter="${blur(12)}"`);
  s += [0, 1, 2, 3].map((i) => rr(sx + 6 + i * 4.5, sy + 14 - i * 2.5, 3, 4 + i * 2.5, 0.8, `fill="#fff"`)).join('');
  s += rr(sx + sw - 22, sy + 6, 15, 8, 1.5, `fill="none" stroke="#fff" stroke-width="1.2"`) + rr(sx + sw - 20, sy + 8, 9, 4, 0.5, `fill="#fff"`);
  s += `<text x="${f(sx + sw / 2)}" y="${f(sy + 66)}" font-family="Inter" font-weight="300" font-size="34" fill="#fff" text-anchor="middle">12:45</text>`;
  s += `<text x="${f(sx + sw / 2)}" y="${f(sy + 86)}" font-family="Inter" font-weight="500" font-size="10" fill="#fff" fill-opacity=".85" text-anchor="middle">Thu, 16 Oct</text>`;
  s += `<text x="${f(sx + 6)}" y="${f(sy + sh - 7)}" font-family="Inter" font-weight="500" font-size="9" fill="#fff">Menu</text><text x="${f(sx + sw - 6)}" y="${f(sy + sh - 7)}" font-family="Inter" font-weight="500" font-size="9" fill="#fff" text-anchor="end">Names</text>`;
  s += poly([[sx + sw * 0.5, sy], [sx + sw, sy], [sx + sw, sy + sh * 0.3], [sx + sw * 0.2, sy + sh]], `fill="#fff" opacity=".07"`);
  const ky = sy + sh + 16, keyG = c.lin([[0, '#4a4f57'], [1, '#2e3238']]);
  s += rr(x + 16, ky, 30, 14, 7, `fill="${keyG}"`) + rr(x + w - 46, ky, 30, 14, 7, `fill="${keyG}"`);
  s += circ(x + w / 2, ky + 26, 24, `fill="${c.lin([[0, '#565b63'], [1, '#2a2d33']])}" stroke="#16181b" stroke-width="1"`) + circ(x + w / 2, ky + 26, 10, `fill="${c.lin([[0, '#6b7079'], [1, '#3a3e45']])}"`);
  s += rr(x + 16, ky + 24, 30, 14, 7, `fill="${keyG}"`) + rr(x + 25, ky + 30, 12, 3, 1.5, `fill="#22c55e"`);
  s += rr(x + w - 46, ky + 24, 30, 14, 7, `fill="${keyG}"`) + rr(x + w - 37, ky + 30, 12, 3, 1.5, `fill="#ef4444"`);
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
  keys.forEach((k, i) => {
    const kx = x + 16 + (i % 3) * 41, kyy = ky + 60 + Math.floor(i / 3) * 31;
    s += rr(kx, kyy + 1.5, 36, 25, 10, `fill="#0c0d0f" opacity=".6"`) + rr(kx, kyy, 36, 25, 10, `fill="${c.lin([[0, '#5b6068'], [1, '#33373d']])}"`) + rr(kx + 4, kyy + 2, 28, 5, 2.5, `fill="#fff" opacity=".12"`);
    s += `<text x="${f(kx + 18)}" y="${f(kyy + 17.5)}" font-family="Inter" font-weight="500" font-size="13" fill="#f3f4f6" text-anchor="middle">${k}</text>`;
  });
  s += rr(x + 0.8, y + 0.8, w - 1.6, h - 1.6, 39, `fill="none" stroke="#fff" stroke-opacity=".3"`);
  return s;
});

// Chargers and power
function brick(c, o) {
  const { x, y, w, h, r, col = '#f4f5f7', dx = 46, dy = -30, pinsAt, port = true, seam } = o;
  let s = S(x + w / 2 + 14, y + h + 2, w * 0.62, 10, 0.3, 7) + S(x + w / 2 + 20, y + h + 4, w * 0.95, 22, 0.12, 16);
  s += extrude(c, rr(x, y, w, h, r, `fill="${c.lin([[0, '#ffffff'], [0.5, '#e6e8ec'], [1, '#c7cbd2']], 0, 0, 1, 1)}"`), dx, dy, 30);
  if (pinsAt) s += pins(c, pinsAt.map((px) => x + dx * 0.5 + px), y + dy * 0.5 + 4, o.pinLen || 50, 15);
  s += rr(x, y, w, h, r, `fill="${c.rad([[0, '#ffffff'], [0.6, col], [1, '#dfe2e7']], 0.35, 0.3, 0.9)}"`);
  s += rr(x + 1, y + 1, w - 2, h - 2, r - 1, `fill="none" stroke="#fff" stroke-width="1.5"`);
  if (seam) s += rr(x + 6, y + seam, w - 12, 1.2, 0.6, `fill="#c3c8cf"`);
  if (port) s += usbC(c, x + w / 2, y + h * (o.portY || 0.62), 34, 12);
  return s;
}
add('dazzle', 'p-charger-20', 'Anker 20W USB-C Charger', ['AC-CHG-20'],
  (c) => brick(c, { x: 138, y: 186, w: 178, h: 196, r: 34, dx: 52, dy: -34, pinsAt: [56, 122], seam: 34 }));
add('dazzle', 'cat-AC-CHG-25', 'Samsung 25W Fast Charger', ['AC-CHG-25'],
  (c) => brick(c, { x: 158, y: 150, w: 146, h: 240, r: 46, dx: 44, dy: -28, pinsAt: [44, 102], pinLen: 46, portY: 0.74 }));

add('dazzle', 'p-cable-100w', 'Baseus USB-C Cable 100W 1m', ['AC-CBL-100'], (c) => {
  const col = '#2a2d33';
  let s = S(240, 330, 170, 34, 0.18, 14);
  s += coil(c, 238, 238, 128, 74, 5, col, { width: 10, braid: true });
  s += cable('M120,250 C100,300 92,330 112,356', col, 10, { braid: true }) + cable('M352,256 C380,300 384,330 362,352', col, 10, { braid: true });
  s += plug(c, 118, 376, 200, { col: '#3d4249', type: 'c' }) + plug(c, 358, 374, 155, { col: '#3d4249', type: 'c' });
  return s;
});
add('dazzle', 'cat-AC-CBL-LTG', 'Lightning Cable 1m', ['AC-CBL-LTG'], (c) => {
  const col = '#f1f2f4';
  let s = S(240, 330, 170, 34, 0.16, 14);
  s += coil(c, 238, 238, 128, 74, 5, col, { width: 9, hi: '#ffffff' });
  s += cable('M120,250 C100,300 92,330 112,356', col, 9) + cable('M352,256 C380,300 384,330 362,352', col, 9);
  s += plug(c, 116, 378, 200, { col: '#f3f4f6', type: 'a' }) + plug(c, 358, 376, 155, { col: '#f3f4f6', type: 'ltg', s: 0.9 });
  return s;
});

add('dazzle', 'p-earphones-tc', 'Type-C Wired Earphones', ['AU-EAR-TC'], (c) => g('translate(244,250) scale(1.2) translate(-250,-262)', earphones(c)));
function earphones(c) {
  const col = '#f4f5f7';
  let s = S(250, 392, 170, 26, 0.14, 14);
  s += cable('M212,192 C210,230 232,250 240,272', col, 4.5) + cable('M298,182 C296,228 254,248 240,272', col, 4.5);
  s += cable('M240,290 C236,330 170,330 150,350 C126,376 190,392 250,384 C300,378 318,352 330,336', col, 4.5);
  s += rr(233, 266, 14, 30, 7, `fill="${c.lin([[0, '#c9cdd3'], [0.4, '#ffffff'], [1, '#bfc4cb']], 0, 0, 1, 0)}"`);
  s += plug(c, 344, 318, 40, { col: '#f3f4f6', type: 'c', s: 0.85 });
  s += earbud(c, 196, 150, -18, col, { tip: '#c4cad2' }) + g('translate(600,0) scale(-1,1)', earbud(c, 300, 138, -24, col, { tip: '#c4cad2' }));
  return s;
}
add('dazzle', 'p-earbuds-pro', 'Wireless Earbuds Pro', ['AU-EAR-PRO', 'AU-EAR-PRO-BLA', 'AU-EAR-PRO-WHI'],
  (c) => budsCase(c, { col: '#25282d', inside: '#3a3e45', bud: '#2b2e34', tip: '#4a4f57', r: 46 }));
add('dazzle', 'p-redmi-buds', 'Redmi Buds 5', ['AU-RDB-5'],
  (c) => budsCase(c, { col: '#f3f4f6', inside: '#d7dbe0', bud: '#f4f5f7', tip: '#c3c9d1', w: 210, h: 104, r: 52 }));

add('dazzle', 'p-mag-charger', 'Magnetic Wireless Charger 15W', ['AC-MAG-15', 'AC-MAG-15-BLA', 'AC-MAG-15-WHI'], (c) => {
  const cx = 228, cy = 262, rx = 132, ry = 58, t = 22;
  let s = S(cx, cy + t + 8, rx * 1.02, ry * 0.75, 0.25, 10);
  s += cable('M262,210 C300,150 400,150 404,230 C408,300 380,340 350,360', '#f1f2f4', 8);
  s += plug(c, 342, 382, 160, { col: '#f3f4f6', type: 'c', s: 0.9 });
  s += ell(cx, cy + t, rx, ry, `fill="#9aa1ab"`) + `<rect x="${cx - rx}" y="${cy}" width="${rx * 2}" height="${t}" fill="${c.lin([[0, '#8d949e'], [0.3, '#eef1f4'], [0.6, '#c4c9d0'], [1, '#7f8690']], 0, 0, 1, 0)}"/>`;
  s += ell(cx, cy, rx, ry, `fill="${c.lin([[0, '#f6f7f9'], [1, '#d3d7dd']], 0, 0, 1, 1)}"`);
  s += ell(cx, cy, rx - 8, ry - 3.6, `fill="${c.rad([[0, '#ffffff'], [0.7, '#f1f3f6'], [1, '#e1e5ea']], 0.4, 0.35, 0.7)}"`);
  s += ell(cx, cy, rx * 0.62, ry * 0.62, `fill="none" stroke="#d5d9df" stroke-width="2"`) + ell(cx, cy, rx * 0.62, ry * 0.62, `fill="none" stroke="#fff" stroke-width="1" transform="translate(0,1.5)"`);
  s += ell(cx, cy, rx - 1, ry - 1, `fill="none" stroke="#fff" stroke-width="1.5" opacity=".9"`);
  s += ell(cx, cy + ry * 0.82, 6, 2.4, `fill="#60a5fa"`) + ell(cx, cy + ry * 0.82, 12, 5, `fill="#60a5fa" opacity=".35" filter="${blur(2)}"`);
  return s;
});

add('dazzle', 'cat-PB-ANK-10K', 'Anker Power Bank 10000mAh', ['PB-ANK-10K'], (c) => {
  const x = 168, y = 92, w = 142, h = 286, r = 24, col = '#24272c';
  let s = S(x + w / 2 + 16, y + h + 2, w * 0.65, 10, 0.34, 7) + S(x + w / 2 + 22, y + h + 4, w, 22, 0.13, 16);
  s += extrude(c, rr(x, y, w, h, r, `fill="${c.lin([[0, '#565b63'], [1, '#191b1f']], 0, 0, 1, 1)}"`), 34, -24, 30);
  s += rr(x + 34 * 0.5 + w * 0.32, y - 24 * 0.5 + 2, 26, 6, 3, `fill="#0b0c0e"`) + rr(x + 34 * 0.5 + w * 0.6, y - 24 * 0.5 + 2, 18, 6, 3, `fill="#0b0c0e"`);
  s += rr(x, y, w, h, r, `fill="${c.rad([[0, '#4a4f57'], [0.6, col], [1, '#16181b']], 0.3, 0.25, 0.95)}"`);
  s += rr(x + 1, y + 1, w - 2, h - 2, r - 1, `fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.2"`);
  s += `<g clip-path="${c.clip(rr(x, y, w, h, r))}">${poly([[x + w * 0.3, y], [x + w * 0.62, y], [x + w * 0.22, y + h], [x - w * 0.1, y + h]], `fill="#fff" opacity=".05"`)}</g>`;
  [0, 1, 2, 3].forEach((i) => { s += circ(x + w / 2 - 21 + i * 14, y + h - 30, 2.6, `fill="${i < 3 ? '#7dd3fc' : '#3a3f47'}"`) + (i < 3 ? circ(x + w / 2 - 21 + i * 14, y + h - 30, 6, `fill="#7dd3fc" opacity=".35" filter="${blur(2)}"`) : ''); });
  s += circ(x + w - 22, y + h - 30, 6, `fill="${c.lin([[0, '#3a3e45'], [1, '#1b1d21']])}" stroke="#4b5058"`);
  return s;
});

add('dazzle', 'p-battery-5c', 'Nokia BL-5C Battery', ['AC-BAT-5C'], (c) => {
  const x = 140, y = 120, w = 190, h = 270, col = '#3a3e45';
  let s = S(240 + 10, y + h + 2, 120, 10, 0.32, 7) + S(250, y + h + 4, 170, 20, 0.12, 16);
  let inner = extrude(c, rr(0, 0, w, h, 12, `fill="${c.lin([[0, '#6b7079'], [1, '#22252a']], 0, 0, 1, 1)}"`), 16, -12, 14);
  inner += rr(0, 0, w, h, 12, `fill="${c.lin([[0, L(col, 0.12)], [1, D(col, 0.25)]], 0, 0, 0.7, 1)}"`);
  inner += rr(14, 70, w - 28, h - 92, 6, `fill="${c.lin([[0, '#e9ecf0'], [1, '#c5cad1']], 0, 0, 1, 1)}"`);
  inner += rr(14, 70, w - 28, 26, 6, `fill="#2563eb"`) + rr(14, 86, w - 28, 10, 0, `fill="#2563eb"`);
  inner += lines(28, 112, [110, 84, 120, 70], 15, 4, '#9aa2ad') + barcode(28, h - 70, 92, 32, '#2a2d33', 11);
  inner += rr(w - 62, h - 72, 34, 34, 4, `fill="none" stroke="#9aa2ad" stroke-width="2"`) + `<path d="M${w - 52},${h - 50} l7,-12 l7,12 z" fill="#9aa2ad"/>`;
  [0, 1, 2].forEach((i) => { inner += rr(40 + i * 40, 16, 26, 22, 3, `fill="${c.lin([[0, '#f4d58a'], [0.5, '#c89b3c'], [1, '#e8c56d']], 0, 0, 1, 1)}"`); });
  inner += rr(0.8, 0.8, w - 1.6, h - 1.6, 11, `fill="none" stroke="#fff" stroke-opacity=".3"`);
  s += g(`translate(${x},${y}) rotate(-6 ${w / 2} ${h / 2})`, inner);
  return s;
});

// Cases, glass, protectors
add('dazzle', 'p-case-sil', 'Liquid Silicone Case', ['AC-CSE-SIL', ...['BLA', 'NAV', 'RED'].flatMap((cl) => ['GAL', 'RED', 'IPH'].map((m) => `AC-CSE-SIL-${cl}-${m}`))], (c) => {
  let s = S(240, 412, 170, 20, 0.16, 16);
  const one = (col, tr) => g(tr, caseBack(c, { x: -76, y: -158, w: 152, h: 316, col, r: 32 }));
  s += S(150, 400, 70, 8, 0.25, 7) + one('#22252b', 'translate(170,232) rotate(-14)');
  s += S(240, 408, 70, 8, 0.25, 7) + one('#1e3a8a', 'translate(240,236) rotate(-2)');
  s += S(320, 410, 72, 8, 0.28, 7) + one('#c0262d', 'translate(312,244) rotate(11)');
  return s;
});
add('dazzle', 'p-phone-case', 'Clear Phone Case (TPU)', ['EL-CASE-CLR'], (c) => S(250, 412, 92, 9, 0.22, 7) + S(250, 414, 150, 20, 0.1, 16)
  + g('translate(245,238) rotate(6)', caseBack(c, { x: -84, y: -170, w: 168, h: 340, r: 34, clear: true })));
add('dazzle', 'cat-AC-CSE-A55', 'Spigen Tough Armor Case · Galaxy A55', ['AC-CSE-A55'], (c) => S(244, 414, 94, 9, 0.3, 7) + S(250, 416, 150, 20, 0.12, 16)
  + g('translate(240,236) rotate(-7)', caseBack(c, { x: -84, y: -172, w: 168, h: 344, r: 30, col: '#2a2d33', rugged: true, cut: 'v3' })));

add('dazzle', 'cat-AC-GLS-9H', 'Tempered Glass 9H', ['AC-GLS-9H'], (c) => {
  let s = S(250, 414, 170, 18, 0.12, 16);
  const sheet = (tr, tab) => {
    const w = 170, h = 340, r = 30;
    let i = rr(-w / 2 + 3, -h / 2 + 5, w, h, r, `fill="#000" opacity=".12" filter="${blur(5)}"`);
    i += rr(-w / 2, -h / 2, w, h, r, `fill="${c.lin([[0, '#ffffff', 0.55], [0.5, '#e6f0f3', 0.35], [1, '#d3e3e8', 0.6]], 0, 0, 1, 1)}"`);
    i += `<path fill-rule="evenodd" d="M${-w / 2 + r},${-h / 2} h${w - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${h - 2 * r} a${r},${r} 0 0 1 ${-r},${r} h${-(w - 2 * r)} a${r},${r} 0 0 1 ${-r},${-r} v${-(h - 2 * r)} a${r},${r} 0 0 1 ${r},${-r} Z M${-w / 2 + 12 + 18},${-h / 2 + 12} h${w - 24 - 36} a18,18 0 0 1 18,18 v${h - 24 - 36} a18,18 0 0 1 -18,18 h${-(w - 24 - 36)} a18,18 0 0 1 -18,-18 v${-(h - 24 - 36)} a18,18 0 0 1 18,-18 Z" fill="#111317"/>`;
    i += circ(0, -h / 2 + 22, 4, `fill="#e6edf2" stroke="#9fb0bb"`);
    i += `<g clip-path="${c.clip(rr(-w / 2, -h / 2, w, h, r))}">${poly([[-w * 0.1, -h / 2], [w * 0.25, -h / 2], [-w * 0.45, h / 2], [-w * 0.8, h / 2]], `fill="#fff" opacity=".55"`)}${poly([[w * 0.35, -h / 2], [w * 0.45, -h / 2], [-w * 0.25, h / 2], [-w * 0.35, h / 2]], `fill="#fff" opacity=".45"`)}</g>`;
    i += rr(-w / 2, -h / 2, w, h, r, `fill="none" stroke="#9fc3c9" stroke-width="2"`) + rr(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4, r - 2, `fill="none" stroke="#fff" stroke-width="1.2" opacity=".9"`);
    if (tab) i += rr(-22, -h / 2 - 26, 44, 34, 6, `fill="${tab}"`) + `<text x="0" y="${-h / 2 - 5}" font-family="Inter" font-weight="600" font-size="15" fill="#fff" text-anchor="middle">1</text>`;
    return g(tr, i);
  };
  s += sheet('translate(196,236) rotate(-9)', '') + sheet('translate(286,248) rotate(5)', '#0ea5e9');
  return s;
});

add('dazzle', 'cat-AC-LNS-PR', 'Camera Lens Protector', ['AC-LNS-PR'], (c) => {
  let s = S(240, 380, 160, 22, 0.14, 14);
  const piece = (tr, sc) => {
    const w = 170, h = 230, r = 46;
    let i = rr(-w / 2 + 4, -h / 2 + 8, w, h, r, `fill="#000" opacity=".18" filter="${blur(6)}"`);
    i += rr(-w / 2, -h / 2, w, h, r, `fill="${c.lin([[0, '#30353d', 0.9], [1, '#121418', 0.92]], 0, 0, 1, 1)}"`);
    i += rr(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2, r - 1, `fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.4"`);
    [[-34, -50, 38], [-34, 52, 38], [40, 0, 30]].forEach(([lx, ly, lr]) => {
      i += circ(lx, ly, lr, `fill="${c.lin([[0, '#f5f7fa'], [0.5, '#9ea5ae'], [1, '#e2e6eb']], 0, 0, 1, 1)}"`) + circ(lx, ly, lr - 5, `fill="${c.rad([[0, '#e6eef5', 0.5], [1, '#aab8c6', 0.35]], 0.4, 0.35, 0.7)}"`);
      i += circ(lx, ly, lr - 5, `fill="none" stroke="#5c646e" stroke-width="1.2"`) + ell(lx - lr * 0.3, ly - lr * 0.35, lr * 0.32, lr * 0.14, `fill="#fff" opacity=".7" transform="rotate(-35 ${lx - lr * 0.3} ${ly - lr * 0.35})"`);
    });
    i += `<g clip-path="${c.clip(rr(-w / 2, -h / 2, w, h, r))}">${poly([[-w * 0.2, -h / 2], [w * 0.1, -h / 2], [-w * 0.5, h / 2], [-w * 0.8, h / 2]], `fill="#fff" opacity=".12"`)}</g>`;
    return g(`${tr} scale(${sc})`, i);
  };
  s += piece('translate(186,212) rotate(-12)', 0.92) + piece('translate(292,268) rotate(8)', 1);
  return s;
});

add('dazzle', 'p-ring-holder', 'Phone Ring Holder', [], (c) => {
  const col = '#d9a38f';
  const met = c.lin([[0, L(col, 0.55)], [0.35, col], [0.6, D(col, 0.25)], [1, L(col, 0.3)]], 0, 0, 1, 1);
  let s = S(240, 372, 120, 22, 0.25, 10);
  s += ell(240, 352, 104, 38, `fill="${D(col, 0.35)}"`) + `<rect x="136" y="340" width="208" height="12" fill="${c.lin([[0, D(col, 0.35)], [0.4, L(col, 0.35)], [1, D(col, 0.4)]], 0, 0, 1, 0)}"/>`;
  s += ell(240, 340, 104, 38, `fill="${c.lin([[0, L(col, 0.45)], [1, D(col, 0.12)]], 0, 0, 1, 1)}"`) + ell(240, 340, 80, 28, `fill="none" stroke="${D(col, 0.18)}" stroke-width="1.5" opacity=".7"`);
  s += ell(240, 340, 103, 37, `fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.2"`);
  s += rr(222, 318, 36, 28, 8, `fill="${c.lin([[0, D(col, 0.25)], [0.5, L(col, 0.4)], [1, D(col, 0.3)]], 0, 0, 1, 0)}"`);
  s += ell(240, 206, 94, 112, `fill="none" stroke="${D(col, 0.5)}" stroke-width="22" opacity=".35" transform="translate(3,5)" filter="${blur(3)}"`);
  s += ell(240, 206, 94, 112, `fill="none" stroke="${met}" stroke-width="20"`);
  s += ell(240, 206, 94, 112, `fill="none" stroke="#fff" stroke-width="2.4" opacity=".55" transform="translate(-2,-3)"`);
  s += ell(240, 206, 84, 102, `fill="none" stroke="${D(col, 0.3)}" stroke-width="1.2" opacity=".6"`);
  s += circ(240, 318, 12, `fill="${c.lin([[0, L(col, 0.5)], [1, D(col, 0.3)]], 0, 0, 1, 1)}"`);
  return s;
});

add('dazzle', 'p-lanyard', 'Phone Lanyard Strap', ['AC-LYD-01'], (c) => {
  const col = '#6f8f72';
  const d = 'M240,330 C150,300 96,200 132,128 C162,70 238,66 268,112 C300,160 300,250 252,318';
  let s = S(250, 392, 150, 24, 0.14, 14);
  s += `<path d="${d}" fill="none" stroke="${D(col, 0.45)}" stroke-width="30" stroke-linecap="round" opacity=".35" transform="translate(4,8)" filter="${blur(5)}"/>`;
  s += `<path d="${d}" fill="none" stroke="${D(col, 0.2)}" stroke-width="28" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="24" stroke-linecap="round"/>`;
  s += `<path d="${d}" fill="none" stroke="${L(col, 0.35)}" stroke-width="18" stroke-dasharray="3 3" stroke-linecap="butt" opacity=".55"/><path d="${d}" fill="none" stroke="${L(col, 0.6)}" stroke-width="3" opacity=".5" transform="translate(-2,-3)"/>`;
  s += rr(214, 312, 52, 34, 9, `fill="${c.lin([[0, '#c9cdd3'], [0.4, '#ffffff'], [1, '#9aa1ab']], 0, 0, 1, 1)}"`) + rr(226, 320, 28, 18, 5, `fill="#8a919b"`);
  s += circ(240, 372, 22, `fill="none" stroke="${c.lin([[0, '#eef1f4'], [1, '#8a919b']], 0, 0, 1, 1)}" stroke-width="7"`) + circ(240, 372, 22, `fill="none" stroke="#fff" stroke-width="1.5" opacity=".6" transform="translate(-1,-2)"`);
  s += rr(206, 350, 68, 16, 7, `fill="${c.lin([[0, '#2a2d33'], [1, '#121316']])}"`) + rr(232, 354, 16, 8, 4, `fill="#3d4148"`);
  return s;
});

add('dazzle', 'p-selfie-old', 'Selfie Stick (old model)', ['AC-SLF-OLD'], (c) => {
  let s = S(178, 438, 60, 8, 0.25, 8) + S(240, 430, 150, 16, 0.14, 16);
  const met = c.lin([[0, '#7b828b'], [0.4, '#f3f5f7'], [0.7, '#b6bcc4'], [1, '#6b717a']], 0, 0, 1, 0);
  let i = '';
  i += rr(-17, 100, 34, 96, 16, `fill="${c.lin([[0, '#1d1f23'], [0.4, '#4a4f57'], [1, '#16181b']], 0, 0, 1, 0)}"`);
  for (let k = 0; k < 7; k++) i += rr(-17, 112 + k * 11, 34, 3, 1.5, `fill="#0e0f11" opacity=".55"`);
  i += circ(0, 102, 9, `fill="#ef4444"`) + circ(-2, 100, 3, `fill="#fff" opacity=".5"`);
  i += rr(-9, -40, 18, 146, 6, `fill="${met}"`) + rr(-7, -150, 14, 116, 5, `fill="${met}"`) + rr(-5.5, -238, 11, 94, 4, `fill="${met}"`);
  i += rr(-11, -44, 22, 9, 3, `fill="#2a2d33"`) + rr(-9, -152, 18, 8, 3, `fill="#2a2d33"`);
  i += rr(-12, -262, 24, 30, 8, `fill="#2a2d33"`);
  i += rr(-56, -328, 112, 66, 12, `fill="${c.lin([[0, '#3a3e45'], [1, '#17191c']])}"`) + rr(-46, -340, 92, 20, 8, `fill="#25282d"`) + rr(-46, -268, 92, 14, 6, `fill="#25282d"`);
  i += rr(-40, -318, 80, 6, 3, `fill="#fff" opacity=".1"`);
  s += g('translate(214,288) rotate(30) scale(.8)', i);
  return s;
});

add('dazzle', 'cat-AC-OTG-C', 'USB-C OTG Adapter', ['AC-OTG-C'], (c) => {
  let s = S(214, 318, 120, 16, 0.24, 9) + S(214, 322, 170, 26, 0.12, 16);
  let i = '';
  const met = c.lin([[0, '#f3f5f7'], [0.45, '#c3c9d0'], [1, '#8b929b']], 0, 0, 0, 1);
  i += rr(-30, -14, 70, 28, 13, `fill="${c.lin([[0, '#d8dce1'], [0.5, '#a9b0b9'], [1, '#7d848e']], 0, 0, 0, 1)}"`) + rr(-24, -9, 58, 5, 2.5, `fill="#fff" opacity=".6"`);
  i += rr(-150, -50, 140, 100, 22, `fill="${met}"`) + rr(-148, -48, 136, 96, 21, `fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.4"`);
  i += rr(-140, -38, 120, 14, 7, `fill="#fff" opacity=".45"`);
  s += g('translate(296,244) scale(1.35) rotate(-16)', i);
  // the USB-A socket on the far end
  s += g('translate(296,244) scale(1.35) rotate(-16) translate(-150,0)', rr(-10, -38, 20, 76, 4, `fill="#bfc5cc"`) + rr(-6, -32, 12, 64, 2, `fill="#16181b"`) + rr(-2, -26, 8, 52, 1, `fill="#2563eb"`));
  s += g('translate(296,244) scale(1.35) rotate(-16) translate(40,0)', rr(-2, -13, 12, 26, 5, `fill="#2a2d33"`) + rr(8, -9.5, 32, 19, 9, `fill="${c.lin([[0, '#f3f5f7'], [0.5, '#b9bfc7'], [1, '#7d848e']], 0, 0, 0, 1)}"`) + rr(14, -3, 22, 6, 3, `fill="#2a2d33"`) + rr(17, -1, 16, 2, 1, `fill="#d4b26a"`));
  return s;
});

add('dazzle', 'cat-AC-STD-FLD', 'Foldable Phone Stand', ['AC-STD-FLD'], (c) => {
  let s = S(240, 380, 170, 22, 0.25, 10);
  const prof = 'M120,360 L330,360 M300,360 L250,210 M250,210 L176,128 M176,128 L160,152 M250,210 L292,176';
  const layer = `<path d="${prof}" fill="none" stroke="${c.lin([[0, '#eef1f4'], [1, '#8d949e']], 0, 0, 1, 1)}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += extrude(c, layer, 46, -22, 30);
  s += `<path d="${prof}" fill="none" stroke="${c.lin([[0, '#c9ced5'], [0.5, '#e8ebef'], [1, '#9aa1ab']], 0, 0, 1, 1)}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="${prof}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7" transform="translate(-1,-4)"/>`;
  s += circ(250, 210, 9, `fill="#6b727c"`) + circ(300, 360, 8, `fill="#6b727c"`) + circ(250, 210, 3.5, `fill="#d9dde2"`) + circ(300, 360, 3, `fill="#d9dde2"`);
  s += rr(168, 136, 10, 12, 3, `fill="#2a2d33"`);
  return s;
});

add('dazzle', 'cat-AC-HLD-CAR', 'Baseus Car Phone Holder', ['AC-HLD-CAR'], (c) => {
  const col = '#2a2d33';
  let s = S(240, 404, 140, 18, 0.2, 12);
  const dk = c.lin([[0, L(col, 0.2)], [1, D(col, 0.3)]], 0, 0, 1, 1);
  s += rr(222, 300, 36, 70, 10, `fill="${c.lin([[0, '#3a3e45'], [0.5, '#5b6068'], [1, '#202227']], 0, 0, 1, 0)}"`);
  s += rr(214, 360, 52, 30, 6, `fill="${c.lin([[0, '#25282d'], [1, '#121316']])}"`) + [0, 1, 2].map((k) => rr(218, 366 + k * 7, 44, 3, 1.5, `fill="#3d4148"`)).join('');
  s += circ(240, 300, 18, `fill="${c.rad([[0, '#6b7079'], [1, '#1d1f23']], 0.35, 0.3, 0.7)}"`);
  s += rr(150, 112, 180, 186, 26, `fill="${dk}"`) + rr(162, 124, 156, 162, 18, `fill="${c.lin([[0, '#3f444b'], [1, '#1f2226']], 0, 0, 1, 1)}"`);
  for (let k = 0; k < 5; k++) s += rr(186, 150 + k * 22, 108, 6, 3, `fill="#4a4f57" opacity=".7"`);
  const arm = (sx) => `<path d="M${240 + sx * 92},${140} C${240 + sx * 122},${140} ${240 + sx * 124},${180} ${240 + sx * 124},${206} L${240 + sx * 124},${236} C${240 + sx * 124},${248} ${240 + sx * 108},${252} ${240 + sx * 104},${240} L${240 + sx * 104},${206} C${240 + sx * 104},${184} ${240 + sx * 100},${166} ${240 + sx * 88},${164} Z" fill="${dk}"/>` + rr(240 + sx * 124 - (sx > 0 ? 8 : 0), 190, 8, 44, 4, `fill="#121316"`);
  s += arm(-1) + arm(1);
  s += `<path d="M180,282 C176,312 196,320 214,312 L214,296 Z" fill="${dk}"/><path d="M300,282 C304,312 284,320 266,312 L266,296 Z" fill="${dk}"/>`;
  s += rr(150.8, 112.8, 178.4, 184.4, 25, `fill="none" stroke="#fff" stroke-opacity=".22"`);
  s += circ(240, 206, 16, `fill="#121316"`) + circ(240, 206, 8, `fill="#0ea5e9" opacity=".8"`);
  return s;
});

add('dazzle', 'cat-WR-BND-08', 'Xiaomi Smart Band 8', ['WR-BND-08'], (c) => {
  const col = '#2b2e34';
  let s = S(240, 410, 120, 16, 0.22, 10);
  const strap = c.lin([[0, D(col, 0.2)], [0.5, L(col, 0.12)], [1, D(col, 0.3)]], 0, 0, 1, 0);
  s += rr(206, 44, 68, 384, 30, `fill="${strap}"`) + rr(206, 44, 68, 60, 30, `fill="${c.lin([[0, '#000', 0.35], [1, '#000', 0]])}"`);
  s += rr(204, 378, 72, 22, 6, `fill="${c.lin([[0, '#8a919b'], [0.5, '#e6e9ed'], [1, '#6b727c']], 0, 0, 1, 0)}"`) + rr(212, 384, 56, 10, 4, `fill="${D(col, 0.2)}"`);
  for (let k = 0; k < 6; k++) s += circ(240, 372 + k * 0, 0, '');
  [0, 1, 2].forEach((k) => { s += ell(240, 72 + k * 18, 4, 3, `fill="#121316"`); });
  s += rr(212, 80, 56, 3, 1.5, `fill="#fff" opacity=".15"`);
  s += rr(184, 140, 112, 200, 52, `fill="${c.lin([[0, '#9aa1ab'], [0.5, '#e6e9ed'], [1, '#6b727c']], 0, 0, 1, 1)}"`);
  s += rr(189, 145, 102, 190, 48, `fill="#07080a"`);
  const sx = 197, sy = 156, sw = 86, sh = 168;
  s += `<g clip-path="${c.clip(rr(sx, sy, sw, sh, 40))}">${rr(sx, sy, sw, sh, 0, `fill="#050608"`)}`
    + `<circle cx="240" cy="${sy + 104}" r="30" fill="none" stroke="#1f2937" stroke-width="7"/><circle cx="240" cy="${sy + 104}" r="30" fill="none" stroke="#34d399" stroke-width="7" stroke-dasharray="130 200" stroke-linecap="round" transform="rotate(-90 240 ${sy + 104})"/>`
    + `<circle cx="240" cy="${sy + 104}" r="20" fill="none" stroke="#1f2937" stroke-width="6"/><circle cx="240" cy="${sy + 104}" r="20" fill="none" stroke="#f59e0b" stroke-width="6" stroke-dasharray="80 200" stroke-linecap="round" transform="rotate(-90 240 ${sy + 104})"/>`
    + `<text x="240" y="${sy + 52}" font-family="Inter Display, Inter" font-weight="300" font-size="34" fill="#fff" text-anchor="middle">10:08</text>`
    + `<text x="240" y="${sy + 152}" font-family="Inter" font-weight="500" font-size="11" fill="#9ca3af" text-anchor="middle">7,842 steps</text>`
    + poly([[sx + sw * 0.4, sy], [sx + sw, sy], [sx + sw * 0.2, sy + sh], [sx - sw * 0.4, sy + sh]], `fill="#fff" opacity=".07"`) + `</g>`;
  s += rr(184.8, 140.8, 110.4, 198.4, 51, `fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.2"`);
  return s;
});

add('dazzle', 'cat-AC-CLN-KIT', 'Screen Cleaning Kit', ['AC-CLN-KIT'], (c) => {
  let s = S(250, 404, 180, 22, 0.16, 14);
  // folded microfibre cloth
  const cl = '#8aa3c2';
  const cloth = isoBox(c, 300, 400, 168, 132, 12, cl, { top: L(cl, 0.12), edge: 0.5 });
  s += cloth.body + cloth.on('T', rr(8, 8, 152, 116, 6, `fill="none" stroke="${L(cl, 0.45)}" stroke-width="1.6" stroke-dasharray="4 3"`) + rr(0, 60, 168, 1.4, 0, `fill="${D(cl, 0.15)}" opacity=".6"`) + rr(0, 62, 168, 10, 0, `fill="${c.lin([[0, '#000', 0.08], [1, '#000', 0]])}"`))
    + cloth.on('R', rr(0, 4, 168, 1, 0, `fill="${L(cl, 0.3)}" opacity=".7"`)) + cloth.on('L', rr(0, 4, 132, 1, 0, `fill="${L(cl, 0.3)}" opacity=".7"`));
  // spray bottle
  const bx = 138, by = 166, bw = 100, bh = 228;
  s += S(bx + bw / 2, by + bh + 2, 56, 8, 0.32, 6);
  s += rr(bx, by, bw, bh, 22, `fill="${c.lin([[0, '#e8f4fb', 0.85], [0.3, '#ffffff', 0.95], [0.7, '#d6e8f3', 0.85], [1, '#b8cfdd', 0.9]], 0, 0, 1, 0)}" stroke="#b7c7d3" stroke-width="1"`);
  s += rr(bx + 5, by + 70, bw - 10, bh - 76, 18, `fill="${c.lin([[0, '#7dd3fc', 0.75], [0.4, '#bae6fd', 0.8], [1, '#38bdf8', 0.8]], 0, 0, 1, 0)}"`);
  s += rr(bx + 10, by + 96, bw - 20, 70, 6, `fill="#ffffff" opacity=".95"`) + `<path d="M${bx + bw / 2},${by + 110} c-10,14 -12,20 -12,26 a12,12 0 0 0 24,0 c0,-6 -2,-12 -12,-26z" fill="#0ea5e9"/>`;
  s += lines(bx + 22, by + 150, [48], 0, 3, '#c7d2dc');
  s += rr(bx + 10, by + 10, 10, bh - 30, 5, `fill="#fff" opacity=".6"`);
  s += rr(bx + 26, by - 26, bw - 52, 30, 6, `fill="${c.lin([[0, '#d9dde2'], [0.5, '#ffffff'], [1, '#b9bfc7']], 0, 0, 1, 0)}"`);
  s += rr(bx + 18, by - 74, bw - 36, 52, 12, `fill="${c.lin([[0, '#e6e9ed'], [0.45, '#ffffff'], [1, '#aeb5be']], 0, 0, 1, 0)}"`) + rr(bx + bw - 22, by - 60, 22, 12, 4, `fill="#cfd4da"`) + circ(bx + bw - 2, by - 54, 2.5, `fill="#6b727c"`);
  return s;
});

// Services, digital and gifts
add('dazzle', 'p-port-repair', 'Charging Port Repair', ['SV-RPR-PORT'], (c) => {
  let s = S(216, 418, 92, 10, 0.3, 7) + S(250, 420, 180, 20, 0.12, 16);
  s += phoneFront(c, { x: 134, y: 78, w: 164, h: 340, r: 26, frame: '#3a3f47', wall: ['#050608', '#050608', '#050608'], cut: 'punch', screen: (sx, sy, sw, sh) => {
    const cx = sx + sw / 2, cy = sy + sh * 0.44;
    return rr(sx, sy, sw, sh, 0, 'fill="#07080a"') + rr(cx - 30, cy - 56, 60, 108, 10, `fill="none" stroke="#e5e7eb" stroke-width="4"`) + rr(cx - 12, cy - 66, 24, 8, 3, `fill="#e5e7eb"`)
      + rr(cx - 22, cy - 6, 44, 50, 4, `fill="#22c55e"`) + `<path d="M${cx + 4},${cy - 40} l-18,34 h14 l-6,28 l20,-38 h-14 z" fill="#fff"/>`
      + `<text x="${cx}" y="${cy + 90}" font-family="Inter" font-size="${f(sw * 0.1)}" font-weight="500" fill="#e5e7eb" text-anchor="middle">Charging</text>`;
  } });
  // precision screwdriver across the front
  let i = rr(-14, -110, 28, 120, 12, `fill="${c.lin([[0, '#1d4ed8'], [0.45, '#60a5fa'], [1, '#1e3a8a']], 0, 0, 1, 0)}"`);
  for (let k = 0; k < 6; k++) i += rr(-14, -96 + k * 14, 28, 4, 2, `fill="#1e3a8a" opacity=".55"`);
  i += rr(-10, -118, 20, 12, 5, `fill="#1e3a8a"`) + rr(-4.5, 10, 9, 92, 3, `fill="${c.lin([[0, '#7b828b'], [0.4, '#f3f5f7'], [1, '#6b717a']], 0, 0, 1, 0)}"`) + `<path d="M-4.5,100 L0,112 L4.5,100 Z" fill="#9aa1ab"/>`;
  s += S(330, 400, 70, 8, 0.25, 6) + g('translate(338,300) rotate(-32)', i);
  return s;
});

add('dazzle', 'p-av-licence', 'Mobile Security 1-year licence (1 phone)', ['DG-AV-1Y'], (c) => {
  let s = S(250, 400, 170, 20, 0.15, 14);
  const card = (tr, k) => {
    const w = 290, h = 182;
    let i = rr(-w / 2 + 4, -h / 2 + 8, w, h, 16, `fill="#000" opacity=".18" filter="${blur(7)}"`);
    i += rr(-w / 2, -h / 2, w, h, 16, `fill="${c.lin([[0, '#1e40af'], [0.6, '#2563eb'], [1, '#0ea5e9']], 0, 0, 1, 1)}"`);
    i += circ(w * 0.38, -h * 0.4, 110, `fill="#fff" opacity=".07"`) + circ(w * 0.48, h * 0.3, 70, `fill="#fff" opacity=".06"`);
    i += `<path d="M-84,-56 l40,-16 l40,16 v30 c0,30 -18,48 -40,58 c-22,-10 -40,-28 -40,-58 z" fill="#ffffff" opacity=".95"/><path d="M-62,-24 l12,12 l24,-26" fill="none" stroke="#2563eb" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
    i += lines(16, -60, [104, 70], 18, 7, '#ffffff') + rr(16, -60, 104, 7, 3.5, 'fill="#fff" opacity=".9"');
    i += rr(-w / 2 + 22, h / 2 - 54, w - 44, 32, 8, `fill="${c.lin([[0, '#e5e7eb'], [0.5, '#ffffff'], [1, '#c7ccd4']], 0, 0, 1, 0)}"`);
    i += `<text x="0" y="${h / 2 - 32}" font-family="Inter" font-weight="600" font-size="15" letter-spacing="2" fill="#334155" text-anchor="middle">${k}</text>`;
    i += rr(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2, 15, `fill="none" stroke="#fff" stroke-opacity=".35"`);
    return g(tr, i);
  };
  s += card('translate(222,214) rotate(-8)', 'Q7K2-9WMX-P4TB') + card('translate(262,282) rotate(4)', 'H3NV-82LD-X6QA');
  return s;
});

add('dazzle', 'p-ebook', 'Smartphone Care Guide (PDF)', ['DG-EBK-01'], (c) => {
  let s = S(250, 410, 160, 20, 0.15, 14);
  const page = (tr, front) => {
    const w = 226, h = 300;
    let i = rr(-w / 2 + 4, -h / 2 + 8, w, h, 8, `fill="#000" opacity=".16" filter="${blur(7)}"`);
    i += `<path d="M${-w / 2},${-h / 2} h${w - 46} l46,46 v${h - 46} h${-w} z" fill="#ffffff"/>`;
    i += `<path d="M${w / 2 - 46},${-h / 2} v46 h46 z" fill="#e5e7eb"/>`;
    if (front) {
      i += rr(-w / 2 + 18, -h / 2 + 24, w - 84, 112, 8, `fill="${c.lin([[0, '#e0f2fe'], [1, '#bfdbfe']], 0, 0, 1, 1)}"`);
      i += rr(-40, -h / 2 + 36, 50, 90, 9, `fill="#1f2937"`) + rr(-36, -h / 2 + 40, 42, 82, 6, `fill="${c.lin([[0, '#38bdf8'], [1, '#6366f1']], 0, 0, 1, 1)}"`);
      i += `<path d="M30,${-h / 2 + 60} l18,8 v14 c0,14 -8,22 -18,26 c-10,-4 -18,-12 -18,-26 v-14 z" fill="#22c55e"/>`;
      i += rr(-w / 2 + 18, -h / 2 + 152, 150, 12, 6, 'fill="#1f2937"') + rr(-w / 2 + 18, -h / 2 + 172, 110, 12, 6, 'fill="#1f2937"');
      i += lines(-w / 2 + 18, -h / 2 + 200, [180, 172, 186, 150, 176, 120], 13, 5, '#d1d5db');
      i += rr(w / 2 - 74, h / 2 - 46, 60, 30, 7, `fill="#dc2626"`) + `<text x="${w / 2 - 44}" y="${h / 2 - 25}" font-family="Inter" font-weight="600" font-size="15" fill="#fff" text-anchor="middle">PDF</text>`;
    } else i += lines(-w / 2 + 18, -h / 2 + 30, [180, 172, 186, 150, 176, 120, 180, 164, 150, 176, 140, 170, 160, 120], 16, 5, '#e2e5ea');
    i += `<path d="M${-w / 2},${-h / 2} h${w - 46} l46,46 v${h - 46} h${-w} z" fill="none" stroke="#d6dae0"/>`;
    return g(tr, i);
  };
  s += page('translate(212,232) rotate(-7)', false) + page('translate(258,250) rotate(4)', true);
  return s;
});

add('dazzle', 'p-pouch-gift', 'Phone Pouch (gift)', ['GF-POUCH'], (c) => {
  const col = '#c2557a';
  let s = S(240, 404, 120, 16, 0.28, 8) + S(240, 406, 170, 24, 0.12, 16);
  const bag = 'M150,170 C140,210 128,300 136,370 C138,396 160,404 240,404 C320,404 342,396 344,370 C352,300 340,210 330,170 Z';
  s += `<path d="${bag}" fill="${c.lin([[0, L(col, 0.15)], [0.5, col], [1, D(col, 0.3)]], 0, 0, 1, 0)}"/>`;
  s += `<path d="${bag}" fill="${c.rad([[0, '#fff', 0.22], [1, '#fff', 0]], 0.35, 0.35, 0.6)}"/>`;
  [[180, 0.18], [214, 0.12], [262, 0.12], [300, 0.16]].forEach(([fx, o]) => { s += `<path d="M${fx},178 C${fx - 4},250 ${fx + 4},330 ${fx},398" fill="none" stroke="${D(col, 0.35)}" stroke-width="5" opacity="${o}" filter="${blur(2)}"/>`; });
  s += `<path d="M144,150 C150,128 176,122 188,132 C200,118 222,122 240,128 C258,122 280,118 292,132 C304,122 330,128 336,150 L330,178 C300,186 180,186 150,178 Z" fill="${c.lin([[0, L(col, 0.12)], [1, D(col, 0.2)]], 0, 0, 0, 1)}"/>`;
  s += `<path d="M150,178 C200,190 280,190 330,178" fill="none" stroke="${D(col, 0.35)}" stroke-width="7"/><path d="M150,178 C200,190 280,190 330,178" fill="none" stroke="${L(col, 0.35)}" stroke-width="2" transform="translate(0,-3)"/>`;
  s += `<path d="M296,186 C312,230 300,270 316,300" fill="none" stroke="#e8d3a2" stroke-width="5" stroke-linecap="round"/><path d="M286,188 C292,240 270,268 282,306" fill="none" stroke="#e8d3a2" stroke-width="5" stroke-linecap="round"/>`;
  s += rr(308, 298, 14, 26, 5, `fill="#caa864"`) + rr(274, 304, 14, 26, 5, `fill="#caa864"`);
  return s;
});

add('dazzle', 'p-charge-combo', 'Charger & Earphones Combo', ['BN-CHG-01'], (c) => {
  let s = '';
  s += g('translate(-48,40) scale(.82)', brick(c, { x: 150, y: 196, w: 150, h: 168, r: 30, pinsAt: [48, 96], seam: 30 }));
  const col = '#f4f5f7';
  s += S(340, 396, 110, 16, 0.14, 12);
  s += cable('M318,226 C318,256 330,276 340,290', col, 4.2) + cable('M372,222 C372,256 350,276 340,290', col, 4.2);
  s += cable('M340,300 C338,330 280,346 290,370 C300,392 380,392 400,370 C416,352 400,330 392,322', col, 4.2);
  s += rr(334, 286, 12, 24, 6, `fill="${c.lin([[0, '#c9cdd3'], [0.4, '#ffffff'], [1, '#bfc4cb']], 0, 0, 1, 0)}"`);
  s += plug(c, 396, 306, 20, { col: '#f3f4f6', type: 'c', s: 0.7 });
  s += g('translate(310,190) scale(.8)', earbud(c, 0, 0, -18, col, { tip: '#c4cad2' })) + g('translate(380,184) scale(-.8,.8)', earbud(c, 0, 0, -24, col, { tip: '#c4cad2' }));
  return s;
});

add('dazzle', 'p-eid-box', 'Eid Accessory Gift Box', ['KT-EID-01'], (c) => {
  const col = '#0f766e', gold = '#d4a73c';
  let s = S(240, 404, 170, 24, 0.22, 14);
  const ox = 250, oy = 404, Wd = 200, Dp = 150, H = 150;
  const base = isoBox(c, ox, oy, Wd, Dp, H - 30, col, { top: L(col, 0.1) });
  s += base.body;
  s += base.on('R', rr(Wd / 2 - 14, 0, 28, H - 30, 0, `fill="${c.lin([[0, L(gold, 0.2)], [1, D(gold, 0.15)]], 0, 0, 1, 0)}"`));
  s += base.on('L', rr(Dp / 2 - 14, 0, 28, H - 30, 0, `fill="${c.lin([[0, D(gold, 0.1)], [1, L(gold, 0.2)]], 0, 0, 1, 0)}"`));
  // lid (slightly bigger)
  const P0 = base.P(0, 0, H - 30);
  const lid = isoBox(c, P0[0], P0[1] + 6, Wd + 10, Dp + 10, 34, L(col, 0.04), {});
  s += g('translate(-2,0)', lid.body + lid.on('R', rr((Wd + 10) / 2 - 14, 0, 28, 34, 0, `fill="${c.lin([[0, L(gold, 0.2)], [1, D(gold, 0.15)]], 0, 0, 1, 0)}"`))
    + lid.on('L', rr((Dp + 10) / 2 - 14, 0, 28, 34, 0, `fill="${c.lin([[0, D(gold, 0.1)], [1, L(gold, 0.2)]], 0, 0, 1, 0)}"`))
    + lid.on('T', rr((Wd + 10) / 2 - 14, 0, 28, Dp + 10, 0, `fill="${L(gold, 0.15)}"`) + rr(0, (Dp + 10) / 2 - 14, Wd + 10, 28, 0, `fill="${L(gold, 0.1)}"`)
      + `<path d="M150,40 a16,16 0 1 0 12,26 a12,12 0 1 1 -12,-26z" fill="${L(gold, 0.35)}" opacity=".55"/>`));
  // bow
  const T = lid.P((Wd + 10) / 2, (Dp + 10) / 2, 34);
  const bx = T[0] - 2, by = T[1];
  const bowG = c.lin([[0, L(gold, 0.35)], [0.5, gold], [1, D(gold, 0.25)]], 0, 0, 1, 1);
  s += `<path d="M${bx},${by} C${bx - 70},${by - 70} ${bx - 90},${by - 6} ${bx - 6},${by + 4} Z" fill="${bowG}"/><path d="M${bx},${by} C${bx + 70},${by - 74} ${bx + 92},${by - 4} ${bx + 6},${by + 4} Z" fill="${bowG}"/>`;
  s += `<path d="M${bx},${by} C${bx - 46},${by - 40} ${bx - 56},${by - 8} ${bx - 8},${by}" fill="none" stroke="${D(gold, 0.3)}" stroke-width="2" opacity=".6"/><path d="M${bx},${by} C${bx + 46},${by - 42} ${bx + 58},${by - 8} ${bx + 8},${by}" fill="none" stroke="${D(gold, 0.3)}" stroke-width="2" opacity=".6"/>`;
  s += ell(bx, by, 14, 10, `fill="${c.lin([[0, L(gold, 0.4)], [1, D(gold, 0.2)]], 0, 0, 1, 1)}"`);
  return s;
});

// ---- Grid Shop -----------------------------------------------------------------------------------------------------
const KRAFT = '#c8a070';
add('grid', 'mailer-s', 'Mailer boxes, small (pack of 100)', [], (c) => {
  let s = S(240, 404, 190, 26, 0.22, 14);
  const one = (ox, oy, H) => {
    const b = isoBox(c, ox, oy, 230, 170, H, KRAFT, { edge: 0.35 });
    let t = b.body;
    t += b.on('T', rr(0, 0, 230, 30, 0, `fill="${D(KRAFT, 0.07)}"`) + rr(0, 30, 230, 1.2, 0, 'fill="#8a6a44" opacity=".6"'));
    t += b.on('R', rr(0, 0, 230, 15, 0, `fill="${D(KRAFT, 0.12)}"`) + rr(0, 15, 230, 1, 0, 'fill="#7a5c38" opacity=".55"') + `<path d="M103,0 a12,8 0 0 0 24,0" fill="${D(KRAFT, 0.32)}"/>`);
    t += b.on('L', rr(0, 0, 170, 15, 0, `fill="${D(KRAFT, 0.18)}"`) + rr(0, 15, 170, 1, 0, 'fill="#7a5c38" opacity=".55"'));
    return { t, b };
  };
  const low = one(232, 414, 84);
  s += low.t;
  const P = low.b.P(8, 6, 84);
  const up = one(P[0], P[1], 84);
  s += S(P[0] + 10, P[1] - 6, 140, 14, 0.18, 8) + up.t;
  s += up.b.on('R', rr(22, 34, 72, 40, 3, 'fill="#fbfaf7" opacity=".95"') + lines(30, 42, [44, 34, 48], 8, 3, '#b9bec6') + barcode(30, 64, 46, 7, '#3a3e45', 5));
  return s;
});

add('grid', 'poly-bags', 'Courier bags with pocket (pack of 500)', [], (c) => {
  let s = S(240, 404, 190, 24, 0.18, 14);
  const bag = (tr, top) => {
    const w = 260, h = 320;
    let i = rr(-w / 2 + 4, -h / 2 + 8, w, h, 6, `fill="#000" opacity=".16" filter="${blur(6)}"`);
    i += rr(-w / 2, -h / 2, w, h, 6, `fill="${c.lin([[0, '#9ea5b0'], [0.5, '#858c97'], [1, '#6d7480']], 0, 0, 1, 1)}"`);
    i += rr(-w / 2, -h / 2, w, 34, 4, `fill="${c.lin([[0, '#b2b8c1'], [1, '#8e959f']])}"`) + rr(-w / 2 + 10, -h / 2 + 10, w - 20, 14, 2, 'fill="#eef0f3" opacity=".9"');
    i += `<path d="M${-w / 2},${-h / 2 + 34} h${w}" stroke="#5f6670" stroke-width="1.4"/>`;
    i += `<g clip-path="${c.clip(rr(-w / 2, -h / 2, w, h, 6))}">${poly([[-w * 0.2, -h / 2], [w * 0.05, -h / 2], [-w * 0.45, h / 2], [-w * 0.7, h / 2]], 'fill="#fff" opacity=".08"')}${[-60, 10, 80].map((yy) => `<path d="M${-w / 2},${yy} C${-w / 4},${yy + 10} ${w / 4},${yy - 8} ${w / 2},${yy + 4}" stroke="#fff" stroke-width="3" opacity=".06" fill="none"/>`).join('')}</g>`;
    if (top) {
      i += rr(-92, -84, 184, 132, 4, `fill="#ffffff"`) + rr(-92, -84, 184, 132, 4, `fill="${c.lin([[0, '#ffffff', 0.4], [1, '#dbeafe', 0.25]], 0, 0, 1, 1)}" stroke="#d1d5db"`);
      i += rr(-80, -72, 70, 10, 2, 'fill="#1f2937"') + lines(-80, -52, [120, 96, 136, 80], 12, 4, '#9ca3af') + barcode(-80, 6, 120, 26, '#1f2937', 21);
      i += poly([[-92, -84], [-30, -84], [-92, 10]], 'fill="#fff" opacity=".35"');
    }
    return g(tr, i);
  };
  s += bag('translate(204,238) rotate(-9)', false) + bag('translate(226,232) rotate(-3)', false) + bag('translate(254,240) rotate(4)', true);
  return s;
});

add('grid', 'bubble', 'Bubble wrap roll, 50 m', [], (c) => {
  let s = S(240, 380, 200, 30, 0.14, 16);
  // unrolled sheet in front (perspective)
  const sheet = poly([[150, 318], [380, 302], [440, 418], [96, 440]], `fill="${c.lin([[0, '#e8f3fb', 0.85], [1, '#d6e8f5', 0.85]], 0, 0, 1, 1)}" stroke="#b8d1e3"`);
  s += sheet;
  const clipS = c.clip(poly([[150, 318], [380, 302], [440, 418], [96, 440]]));
  let b = '';
  for (let r = 0; r < 9; r++) for (let k = 0; k < 16; k++) {
    const t = r / 8, y = 312 + t * 120, x0 = 150 - t * 54, x1 = 380 + t * 60, rad = 6 + t * 4;
    const x = x0 + ((k + (r % 2) * 0.5) / 15) * (x1 - x0);
    b += ell(x, y, rad, rad * 0.62, `fill="${c.rad([[0, '#ffffff', 0.95], [0.6, '#e3f0f9', 0.7], [1, '#a9c6dc', 0.8]], 0.38, 0.3, 0.7)}" stroke="#a8c3d8" stroke-width=".6"`);
  }
  s += `<g clip-path="${clipS}">${b}</g>`;
  // the roll
  const cx = 360, cy = 214, R = 96;
  const bodyId = c.sym(ell(cx, cy, R * 0.55, R, `fill="${c.lin([[0, '#f4f9fd'], [0.5, '#d2e4f1'], [1, '#a7c2d8']], 0, 0, 0, 1)}"`));
  let layers = '';
  for (let i = 30; i >= 1; i--) layers += `<use href="#${bodyId}" transform="translate(${f(-230 * i / 30)},${f(12 * i / 30)})"/>`;
  s += S(250, 318, 160, 14, 0.25, 8) + layers;
  const hull = c.clip(`<use href="#${bodyId}"/><use href="#${bodyId}" transform="translate(-230,12)"/>` + poly([[cx, cy - R], [cx - 230, cy + 12 - R], [cx - 230, cy + 12 + R], [cx, cy + R]]));
  let bb = '';
  for (let r = 0; r < 14; r++) for (let k = 0; k < 19; k++) {
    const y = cy - R + 8 + r * 14 - 6 * (k / 18) + 12 * (1 - k / 18);
    const x = cx - 236 + k * 13 + (r % 2) * 6;
    const sq = Math.max(0.25, Math.cos(((y - cy) / R) * 1.3));
    bb += ell(x, y, 5.5 * sq + 1, 5.2, `fill="${c.rad([[0, '#ffffff', 0.9], [1, '#9dbbd3', 0.7]], 0.35, 0.3, 0.7)}"`);
  }
  s += `<g clip-path="${hull}">${bb}${rr(cx - 240, cy - R, 250, R * 0.7, 0, `fill="${c.lin([[0, '#ffffff', 0.35], [1, '#ffffff', 0]])}"`)}${rr(cx - 240, cy + R * 0.3, 250, R * 0.8, 0, `fill="${c.lin([[0, '#5a7a94', 0], [1, '#5a7a94', 0.35]])}"`)}</g>`;
  s += ell(cx, cy, R * 0.55, R, `fill="${c.rad([[0, '#f8fbfe'], [1, '#c4d9ea']], 0.45, 0.4, 0.7)}" stroke="#a9c3d8"`);
  for (let k = 1; k <= 5; k++) s += ell(cx, cy, R * 0.55 * (0.3 + k * 0.13), R * (0.3 + k * 0.13), 'fill="none" stroke="#b6cde0" stroke-width=".8"');
  s += ell(cx, cy, R * 0.55 * 0.3, R * 0.3, `fill="${c.lin([[0, '#c9a172'], [1, '#8f6841']], 0, 0, 1, 1)}"`) + ell(cx, cy, R * 0.55 * 0.22, R * 0.22, 'fill="#4a3522"');
  return s;
});

add('grid', 'logo-tape', 'Tape with your logo (36 rolls)', [], (c) => {
  const brand = '#2563eb';
  let s = S(240, 396, 180, 26, 0.18, 14);
  s += g('translate(330,222) scale(.62)', rollFace(c, 0, 0, 120, { col: '#f1f5f9', edge: brand, core: '#c39a66', hole: 0.5, coreW: 0.08, dx: 40, dy: -18, squash: 0.62, rings: false }));
  // strip pulled off the main roll
  s += `<path d="M196,352 C210,384 300,392 420,384 L424,412 C300,422 196,412 170,370 Z" fill="${c.lin([[0, D(brand, 0.1)], [1, L(brand, 0.1)]], 0, 0, 1, 0)}"/>`;
  [250, 310, 370].forEach((mx) => { s += g(`translate(${mx},${400 - (mx - 250) * 0.03}) scale(.55,.4)`, mark(0, 0, 40, '#ffffff', brand)); });
  s += rollFace(c, 200, 262, 120, {
    col: brand, edge: D(brand, 0.1), core: '#c39a66', hole: 0.52, coreW: 0.07, dx: 52, dy: -20, squash: 0.66, rings: true,
  });
  return s;
});

add('grid', 'printer-80', 'Receipt printer 80 mm (USB + LAN)', [], (c) => {
  const col = '#2a2d33';
  let s = S(240, 404, 190, 26, 0.24, 14);
  const b = isoBox(c, 230, 404, 200, 170, 110, col, { top: '#3a3e45', left: '#2e3238', right: '#24272c', edge: 0.25 });
  s += b.body;
  s += b.on('T', rr(10, 10, 180, 100, 10, `fill="${c.lin([[0, '#4a4f57'], [1, '#32363c']], 0, 0, 1, 1)}"`) + rr(10, 112, 180, 3, 1.5, 'fill="#0d0e10"') + rr(20, 130, 30, 14, 7, 'fill="#5b6068"') + circ(170, 137, 4, 'fill="#22c55e"'));
  s += b.on('R', rr(14, 22, 172, 3, 1.5, 'fill="#1a1c20"') + rr(14, 60, 60, 4, 2, 'fill="#3d4148"'));
  // receipt coming out of the slot on top
  const P1 = b.P(20, 58, 110), P2 = b.P(180, 58, 110);
  const P3 = [P2[0] + 6, P2[1] - 110], P4 = [P1[0] + 6, P1[1] - 110];
  s += `<path d="M${f(P1[0])},${f(P1[1])} L${f(P2[0])},${f(P2[1])} C${f(P2[0] + 6)},${f(P2[1] - 40)} ${f(P3[0] - 20)},${f(P3[1] + 30)} ${f(P3[0])},${f(P3[1])} L${f(P4[0])},${f(P4[1])} C${f(P4[0] - 20)},${f(P4[1] + 30)} ${f(P1[0] + 6)},${f(P1[1] - 40)} ${f(P1[0])},${f(P1[1])} Z" fill="${c.lin([[0, '#ffffff'], [1, '#e5e7eb']], 0, 0, 0, 1)}" stroke="#d1d5db"/>`;
  const mx = (P3[0] + P4[0]) / 2, my = (P3[1] + P4[1]) / 2;
  s += g(`translate(${f(mx)},${f(my + 18)}) rotate(-17)`, lines(-58, 0, [70, 100, 84, 96], 10, 3.5, '#9ca3af') + barcode(-58, 46, 96, 14, '#374151', 3));
  return s;
});

add('grid', 'scanner-bt', 'Barcode scanner, wireless', [], (c) => {
  let s = S(240, 410, 150, 20, 0.22, 12);
  const col = '#2a2d33', acc = '#f59e0b';
  const body = `M118,150 C120,122 146,108 178,108 L330,108 C366,108 384,130 380,164 C378,186 362,198 338,202 L270,214 C258,216 252,226 254,240 L274,370 C278,394 262,408 240,410 L214,410 C194,410 184,398 182,380 L170,240 C168,222 154,212 136,206 C122,198 116,176 118,150 Z`;
  s += `<path d="${body}" fill="${c.lin([[0, '#4a4f57'], [0.5, col], [1, '#16181b']], 0, 0, 1, 1)}"/>`;
  s += `<path d="M130,138 C140,122 160,118 184,118 L320,118" stroke="#fff" stroke-width="3" opacity=".22" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M360,112 C384,124 392,150 386,176 C380,196 366,204 350,206 L350,112 Z" fill="${c.lin([[0, '#ef4444'], [1, '#7f1d1d']], 0, 0, 1, 1)}" opacity=".9"/>`;
  s += `<path d="M196,226 C204,224 210,232 210,242 L212,286 C212,296 202,298 198,290 L188,244 C186,234 190,228 196,226 Z" fill="${acc}"/>`;
  s += rr(190, 132, 120, 28, 10, `fill="#16181b"`) + rr(198, 140, 60, 12, 6, 'fill="#1e3a8a"') + circ(284, 146, 5, 'fill="#22c55e"');
  s += `<path d="M226,380 L262,376" stroke="#fff" stroke-width="2" opacity=".15"/>`;
  s += `<path d="M386,140 L460,110 L460,200 Z" fill="#ef4444" opacity=".12"/>`;
  return s;
});

add('grid', 'drawer', 'Cash drawer (5 notes, 8 coins)', [], (c) => {
  const col = '#2a2d33';
  let s = S(240, 404, 200, 26, 0.24, 14);
  const b = isoBox(c, 238, 400, 230, 220, 74, col, { top: '#3a3e45', left: '#2e3238', right: '#26292e', edge: 0.25 });
  s += b.body;
  // open drawer pulled out of the right face
  const dx = EY[0] * -70, dy = EY[1] * -70;
  const d = isoBox(c, 238 + dx, 400 + dy - 6, 220, 70, 50, '#3a3e45', { top: '#2a2d33', left: '#33373d', right: '#2b2e33', edge: 0.3 });
  s += d.body;
  const notes = ['#a3c4a8', '#e7b36a', '#c48fb3', '#8fb3d8', '#d9c27a'];
  s += d.on('T', rr(0, 0, 220, 70, 0, 'fill="#1b1d21"') + notes.map((col2, i) => rr(8 + i * 28, 6, 24, 40, 2, `fill="${col2}"`) + rr(8 + i * 28, 6, 24, 4, 1, 'fill="#fff" opacity=".35"')).join('')
    + [0, 1, 2, 3].map((i) => rr(150 + (i % 2) * 34, 6 + Math.floor(i / 2) * 26, 30, 22, 3, 'fill="#2e3238"') + circ(165 + (i % 2) * 34, 17 + Math.floor(i / 2) * 26, 7, 'fill="#c9a96a"')).join('')
    + rr(0, 50, 140, 16, 0, 'fill="#2e3238"'));
  s += d.on('R', rr(90, 18, 40, 10, 5, 'fill="#16181b"') + circ(180, 22, 7, `fill="${c.lin([[0, '#eef1f4'], [1, '#8a919b']], 0, 0, 1, 1)}"`) + rr(178.5, 18, 3, 8, 1, 'fill="#3a3e45"'));
  return s;
});

add('grid', 'android-pos', 'Android POS terminal with printer', [], (c) => {
  let s = S(240, 418, 100, 12, 0.3, 8) + S(240, 420, 160, 22, 0.12, 16);
  const x = 166, y = 92, w = 148, h = 326, col = '#2b2e34';
  // receipt sticking out of the top
  s += `<path d="M${x + 22},${y + 20} L${x + w - 22},${y + 20} L${x + w - 18},${y - 54} C${x + w - 30},${y - 60} ${x + 40},${y - 50} ${x + 20},${y - 56} Z" fill="${c.lin([[0, '#f3f4f6'], [1, '#ffffff']], 0, 0, 0, 1)}" stroke="#d1d5db"/>`;
  s += lines(x + 34, y - 44, [60, 80, 50], 9, 3, '#9ca3af');
  s += rr(x, y, w, h, 24, `fill="${c.lin([[0, L(col, 0.22)], [0.12, col], [0.88, col], [1, L(col, 0.15)]], 0, 0, 1, 0)}"`);
  s += rr(x + 6, y + 6, w - 12, 46, 14, `fill="${c.lin([[0, '#3d4148'], [1, '#24272c']])}"`) + rr(x + 20, y + 16, w - 40, 6, 3, 'fill="#0d0e10"');
  const sx = x + 12, sy = y + 60, sw = w - 24, sh = 210;
  s += rr(sx - 2, sy - 2, sw + 4, sh + 4, 10, 'fill="#060709"');
  s += `<g clip-path="${c.clip(rr(sx, sy, sw, sh, 8))}">${rr(sx, sy, sw, sh, 0, 'fill="#f8fafc"')}${rr(sx, sy, sw, 26, 0, 'fill="#1e3a8a"')}${rr(sx + 8, sy + 9, 48, 8, 4, 'fill="#fff" opacity=".9"')}`
    + [['#dbeafe', '#2563eb'], ['#dcfce7', '#16a34a'], ['#fef3c7', '#d97706'], ['#fce7f3', '#db2777'], ['#ede9fe', '#7c3aed'], ['#e0f2fe', '#0284c7']].map(([bg, fg], i) => rr(sx + 8 + (i % 2) * (sw / 2 - 4), sy + 34 + Math.floor(i / 2) * 44, sw / 2 - 12, 38, 6, `fill="${bg}"`) + circ(sx + 22 + (i % 2) * (sw / 2 - 4), sy + 48 + Math.floor(i / 2) * 44, 6, `fill="${fg}"`) + rr(sx + 14 + (i % 2) * (sw / 2 - 4), sy + 60 + Math.floor(i / 2) * 44, 30, 4, 2, `fill="${fg}" opacity=".5"`)).join('')
    + rr(sx + 8, sy + sh - 36, sw - 16, 28, 7, 'fill="#16a34a"') + rr(sx + sw / 2 - 22, sy + sh - 25, 44, 6, 3, 'fill="#fff"')
    + poly([[sx + sw * 0.5, sy], [sx + sw, sy], [sx + sw * 0.1, sy + sh], [sx - sw * 0.4, sy + sh]], 'fill="#fff" opacity=".08"') + `</g>`;
  const ky = sy + sh + 12;
  s += rr(x + 18, ky, 30, 14, 7, 'fill="#3d4148"') + rr(x + w / 2 - 15, ky, 30, 14, 7, 'fill="#3d4148"') + rr(x + w - 48, ky, 30, 14, 7, 'fill="#3d4148"');
  s += rr(x + 0.8, y + 0.8, w - 1.6, h - 1.6, 23, 'fill="none" stroke="#fff" stroke-opacity=".28"');
  return s;
});

add('grid', 'labels-50', 'Thermal labels 50 × 25 mm (10 rolls)', [], (c) => {
  let s = S(240, 396, 190, 26, 0.16, 14);
  // strip of labels unrolled to the front
  const strip = 'M222,330 C230,370 280,386 430,378 L432,420 C270,428 214,410 196,350 Z';
  s += `<path d="${strip}" fill="#f3e9c9"/>`;
  [0, 1, 2].forEach((i) => {
    const x = 262 + i * 58;
    s += g(`translate(${x},${384 - i * 1.5}) skewX(-6)`, rr(0, 0, 50, 30, 4, 'fill="#ffffff" stroke="#e5e7eb"') + barcode(6, 6, 32, 12, '#1f2937', 30 + i) + rr(6, 21, 24, 3, 1.5, 'fill="#9ca3af"'));
  });
  s += g('translate(350,214) scale(.66)', rollFace(c, 0, 0, 118, { col: '#ffffff', edge: '#e5e1d3', core: '#c39a66', hole: 0.34, coreW: 0.08, dx: 30, dy: -14, squash: 0.62 }));
  s += rollFace(c, 200, 250, 118, { col: '#ffffff', edge: '#e5e1d3', core: '#c39a66', hole: 0.34, coreW: 0.08, dx: 42, dy: -16, squash: 0.7 });
  return s;
});

add('grid', 'labels-a6', 'Shipping labels A6 (500)', [], (c) => {
  let s = S(240, 404, 190, 26, 0.18, 14);
  const b = isoBox(c, 222, 414, 236, 180, 104, '#f4f5f7', { top: '#ffffff', left: '#e9ebee', right: '#dcdfe4', edge: 0.6 });
  s += b.body;
  s += b.on('R', Array.from({ length: 25 }, (_, k) => rr(0, 4 + k * 4, 236, 0.7, 0, 'fill="#b9bec6" opacity=".7"')).join(''));
  s += b.on('L', Array.from({ length: 25 }, (_, k) => rr(0, 4 + k * 4, 180, 0.7, 0, 'fill="#c2c7ce" opacity=".7"')).join(''));
  s += b.on('T', rr(12, 10, 212, 158, 4, 'fill="none" stroke="#e5e7eb"') + rr(24, 20, 74, 11, 2, 'fill="#111827"') + lines(24, 42, [150, 124, 164], 12, 5, '#6b7280')
    + rr(24, 90, 188, 1.2, 0, 'fill="#d1d5db"') + barcode(24, 102, 146, 44, '#111827', 44) + rr(182, 102, 30, 30, 2, 'fill="#111827"') + rr(187, 107, 20, 20, 1, 'fill="#fff"') + rr(191, 111, 12, 12, 0, 'fill="#111827"'));
  return s;
});

add('grid', 'stickers', 'Stickers with your logo (1,000)', [], (c) => {
  const brand = '#7c3aed';
  let s = S(240, 402, 190, 24, 0.16, 14);
  const sheet = (tr) => {
    const w = 236, h = 300;
    let i = rr(-w / 2 + 4, -h / 2 + 8, w, h, 8, `fill="#000" opacity=".16" filter="${blur(7)}"`) + rr(-w / 2, -h / 2, w, h, 8, 'fill="#ffffff" stroke="#e5e7eb"');
    for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) {
      const cx = -w / 2 + 42 + k * 76, cy = -h / 2 + 42 + r * 72;
      i += circ(cx, cy + 1.5, 31, 'fill="#000" opacity=".12" filter="url(#b1_5)"') + circ(cx, cy, 31, `fill="${c.lin([[0, L(brand, 0.15)], [1, D(brand, 0.15)]], 0, 0, 1, 1)}"`) + mark(cx, cy, 34, brand, '#fff') + circ(cx, cy, 31, 'fill="none" stroke="#fff" stroke-opacity=".5"') + ell(cx - 12, cy - 16, 10, 4, 'fill="#fff" opacity=".35" transform="rotate(-30 ' + (cx - 12) + ' ' + (cy - 16) + ')"');
    }
    return g(tr, i);
  };
  s += sheet('translate(214,230) rotate(-6)');
  const loose = (cx, cy, rot) => S(cx, cy + 34, 34, 7, 0.25, 5) + g(`translate(${cx},${cy}) rotate(${rot})`, circ(0, 0, 38, `fill="${c.lin([[0, L(brand, 0.15)], [1, D(brand, 0.15)]], 0, 0, 1, 1)}"`) + mark(0, 0, 42, brand, '#fff') + circ(0, 0, 38, 'fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"') + `<path d="M24,-30 A38,38 0 0 1 38,-4 L24,-8 Z" fill="#f3f4f6"/>`);
  s += loose(352, 336, 12) + loose(318, 388, -10);
  return s;
});

add('grid', 'paper-80', 'Receipt paper rolls 80 mm (50 rolls)', [], (c) => {
  let s = S(240, 400, 200, 26, 0.18, 14);
  const roll = (cx, by, sc) => S(cx, by + 2, 72 * sc, 12 * sc, 0.28, 6) + cylUp(c, cx, by, 70 * sc, 26 * sc, 128 * sc, '#f7f7f5', { hole: 0.18, core: 0.08, rings: true, lines: 0 });
  s += roll(160, 300, 0.92) + roll(318, 292, 0.92);
  s += roll(238, 392, 1.02);
  // a loose end of paper
  s += `<path d="M302,320 C312,350 330,366 368,372 L372,392 C332,388 300,370 290,330 Z" fill="#ffffff" stroke="#e5e7eb"/>`;
  return s;
});

// ---- render ------------------------------------------------------------------------------------------------------
async function main() {
  const only = process.argv.slice(2);
  Object.values(OUT).forEach((d) => fs.mkdirSync(d, { recursive: true }));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 480, height: 480 }, deviceScaleFactor: 2 });
  const done = [];
  for (const it of ITEMS) {
    if (only.length && !only.includes(it.id)) continue;
    const c = new Ctx();
    const body = it.draw(c);
    const svg = scene(c, body);
    await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;padding:0;background:#fff}svg{display:block}</style></head><body>${svg}</body></html>`);
    await page.evaluate(() => document.fonts && document.fonts.ready);
    const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 480, height: 480 } });
    const file = path.join(OUT[it.kind], it.id + '.jpg');
    await sharp(png).resize(480, 480).jpeg({ quality: 78, mozjpeg: true }).toFile(file);
    done.push({ id: it.id, file, kb: Math.round(fs.statSync(file).size / 1024) });
  }
  await browser.close();
  done.forEach((d) => console.log(d.kb + ' KB  ' + path.relative(ROOT, d.file)));
}

module.exports = { ITEMS };
if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
