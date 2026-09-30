// Snaps the literal type values in the converted screens onto the type tokens in
// src/styles/design-system.css (sizes, weights, tracking), relaxes cramped line heights and
// trims oversized status pills. Idempotent: values that are already tokens are left alone, so it
// is safe to run again after a fresh `npm run convert`.
//
//   node scripts/normalize-type.mjs          apply
//   node scripts/normalize-type.mjs --dry    report only

import fs from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry');
const ROOTS = ['src/screens', 'src/shell', 'src/components', 'src/app/page.jsx', 'src/styles/globals.css'];

// ---- the scale -------------------------------------------------------------------------------
// [max literal px, token, resolved px]. Sizes under 9px are miniature previews (labels, phone
// mock-ups) and stay as they are.
const SIZE_STEPS = [
  [10.5, '--text-2xs', 11], [12, '--text-xs', 12], [13, '--text-xs-plus', 13], [14, '--text-sm', 13],
  [15, '--text-sm-plus', 14], [16, '--text-base', 16], [18, '--text-lg', 18], [21, '--text-xl', 20],
  [26, '--text-2xl', 24], [34, '--text-3xl', 30], [44, '--text-4xl', 40], [56, '--text-5xl', 56],
];
// Customer-facing reading surfaces: supporting text and body copy sit one step up.
const READING = { folders: [], bump: {} };
const TOKEN_PX = Object.fromEntries(SIZE_STEPS.map(([, t, px]) => [t, px]));

function sizeFor(px, reading) {
  if (px < 9 || px > 56) return null;
  if (reading && READING.bump[px]) return READING.bump[px];
  for (const [max, token, to] of SIZE_STEPS) if (px <= max) return [token, to];
  return null;
}

/** Weight by role: 600 is for headings, prices and figures (15px and up); smaller text tops out at 500. */
function weightFor(w, sizePx) {
  if (w >= 700) return sizePx != null && sizePx <= 12 ? 500 : 600;
  if (w === 600) return sizePx != null && sizePx >= 14 ? 600 : 500;
  return w;
}
const WEIGHT_TOKEN = { 400: '--weight-regular', 500: '--weight-medium', 600: '--weight-semibold' };

/** Tracking: no tightening below 24px (it crowds Bangla conjuncts); caps labels share one step. */
function trackingFor(em, sizePx) {
  if (em < 0) return sizePx != null && sizePx >= 24 ? 'var(--tracking-tight)' : '0';
  if (em >= 0.17) return 'var(--tracking-caps)';
  if (em >= 0.06) return 'var(--tracking-label)';
  if (em === 0.025) return 'var(--tracking-wide)';
  return null;
}

const MIN_LH = 1.3;
const lhTarget = (px) => Math.round(px * 1.4);

// ---- scanning --------------------------------------------------------------------------------
const PROP = /(font-size|font-weight|letter-spacing|line-height)(\s*:\s*)([^;"'`}\\<]+)|(fontSize|fontWeight|letterSpacing|lineHeight)(\s*:\s*)("[^"]*"|'[^']*'|-?[0-9.]+)/g;
const KEBAB = { fontSize: 'font-size', fontWeight: 'font-weight', letterSpacing: 'letter-spacing', lineHeight: 'line-height' };

/** `${…}` interpolations blanked out so their braces do not split a declaration group. */
function mask(text) {
  const out = text.split('');
  for (let i = 0; i < text.length - 1; i++) {
    if (text[i] !== '$' || text[i + 1] !== '{') continue;
    let depth = 0, j = i + 1;
    for (; j < text.length; j++) {
      if (text[j] === '{') depth++;
      else if (text[j] === '}' && --depth === 0) break;
    }
    for (let k = i; k <= j && k < text.length; k++) out[k] = ' ';
    i = j;
  }
  return out.join('');
}

/** The declaration group around `at`: the innermost braces (or template literal for CSS text). */
function bounds(masked, at, camel) {
  let depth = 0, start = Math.max(0, at - 2500), end = Math.min(masked.length, at + 2500);
  for (let i = at - 1; i >= start; i--) {
    const c = masked[i];
    if (c === '}') depth++;
    else if (c === '{') { if (depth === 0) { start = i; break; } depth--; }
    else if (c === '`' && !camel) { start = i; break; }
  }
  depth = 0;
  for (let i = at; i < end; i++) {
    const c = masked[i];
    if (c === '{') depth++;
    else if (c === '}') { if (depth === 0) { end = i; break; } depth--; }
    else if (c === '`' && !camel) { end = i; break; }
  }
  return [start, end];
}

const stats = { size: 0, weight: 0, tracking: 0, lineHeight: 0, pill: 0, files: 0 };

function transform(text, reading) {
  const masked = mask(text);
  const hits = [];
  let m;
  PROP.lastIndex = 0;
  while ((m = PROP.exec(masked))) {
    const camel = !!m[4];
    const prop = camel ? KEBAB[m[4]] : m[1];
    const rawFull = text.slice(m.index, m.index + m[0].length);
    const rawVal = camel ? m[6] : m[3];
    if (/[$(]/.test(rawVal) && !/^["']?var\(/.test(rawVal.trim())) continue; // dynamic
    const quote = camel && /^["']/.test(rawVal) ? rawVal[0] : '';
    const val = (quote ? rawVal.slice(1, -1) : rawVal).trim();
    const [gs, ge] = bounds(masked, m.index, camel);
    hits.push({ i: m.index, len: rawFull.length, camel, prop, head: (camel ? m[4] : m[1]) + (camel ? m[5] : m[2]), val, quote, numeric: camel && !quote, g: gs + ':' + ge, gs, ge });
  }

  // resolved size of every font-size hit (after mapping), used as context for its neighbours
  for (const h of hits) {
    if (h.prop !== 'font-size') continue;
    const px = /^([0-9.]+)px$/.exec(h.val.replace(/\s*!important/, ''));
    const tok = /^var\((--text-[a-z0-9-]+)\)/.exec(h.val);
    if (px) { const s = sizeFor(+px[1], reading); h.to = s; h.px = s ? s[1] : +px[1]; }
    else if (tok) h.px = TOKEN_PX[tok[1]];
  }
  const sizeNear = (h) => {
    let best = null;
    for (const s of hits) {
      if (s.prop !== 'font-size' || s.px == null || s.g !== h.g) continue;
      const d = Math.abs(s.i - h.i);
      if (d <= 400 && (!best || d < best.d)) best = { d, px: s.px };
    }
    return best ? best.px : null;
  };

  const edits = [];
  const put = (h, value) => {
    const important = /!important/.test(h.val) ? '!important' : '';
    const body = h.numeric ? value : h.quote + value + h.quote;
    edits.push([h.i, h.len, h.head + body + important]);
  };

  for (const h of hits) {
    const v = h.val.replace(/\s*!important/, '');
    if (h.prop === 'font-size') {
      if (h.to) { put(h, `var(${h.to[0]})`); stats.size++; }
    } else if (h.prop === 'font-weight') {
      if (v === 'var(--weight-semibold)' || v === 'var(--weight-bold)') {
        // badges, counters and other 12px-and-under labels carry 500, never 600
        const near = sizeNear(h);
        if (near != null && near <= 12) { put(h, 'var(--weight-medium)'); stats.weight++; }
        else if (v === 'var(--weight-bold)') { put(h, 'var(--weight-semibold)'); stats.weight++; }
        continue;
      }
      if (!/^[0-9]+$/.test(v)) continue;
      const to = weightFor(+v, sizeNear(h));
      // a bare number cannot be marked as done, so only the 700+ step applies to it (keeps reruns stable)
      if (h.numeric) { if (+v >= 700) { put(h, '600'); stats.weight++; } }
      else { put(h, `var(${WEIGHT_TOKEN[to]})`); stats.weight++; }
    } else if (h.prop === 'letter-spacing') {
      const em = /^(-?[0-9]*\.?[0-9]+)em$/.exec(v);
      if (!em) continue;
      const to = trackingFor(+em[1], sizeNear(h));
      if (to && to !== v) { put(h, to); stats.tracking++; }
    } else if (h.prop === 'line-height') {
      const size = sizeNear(h);
      if (size == null) continue;
      const px = /^([0-9.]+)px$/.exec(v);
      if (size >= 40) { // fluid display steps: a fixed line box would not follow the size down
        if (px) { put(h, size >= 56 ? '1.12' : '1.2'); stats.lineHeight++; }
        continue;
      }
      if (size > 16) { // headings: never tighter than 1.15
        if (px && +px[1] / size < 1.15) { put(h, Math.round(size * 1.25) + 'px'); stats.lineHeight++; }
        continue;
      }
      if (px && +px[1] / size < MIN_LH) { put(h, lhTarget(size) + 'px'); stats.lineHeight++; }
      else if (/^[0-9.]+$/.test(v) && +v > 1 && +v < MIN_LH) { put(h, '1.4'); stats.lineHeight++; }
    }
  }

  // status pills: a label, not a control, so it stays compact
  const seen = new Set();
  for (const h of hits) {
    if (h.prop !== 'font-size' || h.px == null || h.px > 12 || seen.has(h.g)) continue;
    seen.add(h.g);
    const group = text.slice(h.gs, h.ge);
    if (!/border-?[rR]adius:\s*"?(99+px|var\(--radius-full\))/.test(group)) continue;
    if (/cursor:\s*"?pointer/.test(group)) continue;
    if (/(^|[^a-zA-Z])(min-?)?[wW]idth:/.test(group)) continue; // fixed-size marks (avatars, counters) keep their box
    if (h.camel && /<(button|a|__Link|__A|input|label)\b[^<]*$/.test(text.slice(Math.max(0, h.gs - 300), h.gs))) continue;
    const hm = /(^|[;{\s,"])(height:\s*"?)(2[6-9]|30)px/.exec(group);
    if (!hm) continue;
    edits.push([h.gs + hm.index + hm[1].length, hm[2].length + hm[3].length + 2, hm[2] + '24px']);
    const pm = /(padding:\s*"?0 )(1[0-4])px/.exec(group);
    if (pm) edits.push([h.gs + pm.index, pm[0].length, pm[1] + (+pm[2] > 10 ? 10 : 8) + 'px']);
    stats.pill++;
  }

  if (!edits.length) return text;
  edits.sort((a, b) => b[0] - a[0]);
  let out = text;
  for (const [i, len, rep] of edits) out = out.slice(0, i) + rep + out.slice(i + len);
  return out;
}

function* walk(p) {
  const st = fs.statSync(p);
  if (st.isFile()) { yield p; return; }
  for (const f of fs.readdirSync(p)) yield* walk(path.join(p, f));
}

for (const root of ROOTS) {
  for (const file of walk(root)) {
    if (!/\.(jsx|js|css)$/.test(file) || file.endsWith('registry.js')) continue;
    const before = fs.readFileSync(file, 'utf8');
    const reading = READING.folders.some((f) => file.includes(`/screens/${f}/`));
    const after = transform(before, reading);
    if (after === before) continue;
    stats.files++;
    if (!DRY) fs.writeFileSync(file, after);
  }
}
console.log((DRY ? '[dry run] ' : '') + JSON.stringify(stats));
