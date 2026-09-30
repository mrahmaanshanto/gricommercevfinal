// Brings every converted screen onto the one GridCommerce pattern for font families, corner
// radii and the shared control recipes (button, input, card, chip, icon button). The pattern
// itself lives in src/styles/design-system.css; this only rewrites literals to those tokens.
// Idempotent: safe to run again after a fresh `npm run convert`.
//
//   node scripts/normalize-shape.mjs          apply
//   node scripts/normalize-shape.mjs --dry    report only

import fs from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry');
const ROOTS = ['src/screens', 'src/shell', 'src/components', 'src/app/page.jsx', 'src/styles/globals.css'];
const stats = { family: 0, radius: 0, control: 0, colour: 0, files: 0 };

// ---- font families: one UI face, one Bangla face, one face for IDs and figures ---------------
function familyFor(value) {
  const v = value.replace(/['"\s]/g, '').toLowerCase();
  if (v === 'inherit' || v.startsWith('var(') || v.includes('$')) return null;
  if (/mono/.test(v)) return 'var(--font-data)';
  if (v.startsWith('hindsiliguri')) return 'var(--font-bn)';
  if (v.startsWith('poppins')) return 'var(--font-sans)';
  return null; // anything else (e.g. the serif "I" on an italic button) is deliberate
}

// ---- corner radii: 4 tags · 6 small controls · 8 controls · 12 cards and panels · full pills ---
function radiusPart(part) {
  const m = /^([0-9.]+)px$/.exec(part);
  if (!m) return part;
  const px = +m[1];
  if (px <= 3) return part;              // hairline bars and marks
  if (px <= 5) return 'var(--radius-sm)';
  if (px <= 7) return 'var(--radius-md)';
  if (px <= 11) return 'var(--radius-lg)';
  if (px <= 24) return 'var(--radius-xl)';
  if (px >= 99) return 'var(--radius-full)';
  return part;                           // 26px and up: sheets and device frames
}
const radiusFor = (value) => value.trim().split(/\s+/).map(radiusPart).join(' ');

// ---- shared control recipes -----------------------------------------------------------------
// Applied to the per-screen class rules of the same name, so a button is the same button on the
// merchant screens, the console, the POS and the phone app.
const RECIPES = {
  btn: { height: '44px', 'min-height': '44px', 'border-radius': 'var(--radius-lg)', 'font-size': 'var(--text-sm)', 'font-weight': 'var(--weight-medium)', padding: '0 18px' },
  inp: { height: '44px', 'border-radius': 'var(--radius-lg)', 'font-size': 'var(--text-sm)', padding: '0 14px' },
  sel: { height: '44px', 'border-radius': 'var(--radius-lg)', 'font-size': 'var(--text-sm)' },
  sm: { height: '36px', 'border-radius': 'var(--radius-lg)', 'font-size': 'var(--text-xs-plus)', padding: '0 12px' },
  big: { height: '52px', 'border-radius': 'var(--radius-lg)', 'font-size': 'var(--text-sm-plus)', padding: '0 24px' },
  card: { 'border-radius': 'var(--radius-xl)' },
  chip: { height: '36px', 'border-radius': 'var(--radius-full)', 'font-size': 'var(--text-xs-plus)', padding: '0 14px' },
  tab: { height: '36px' },
  ib: { height: '36px', 'border-radius': 'var(--radius-full)' },
  lbl: { 'font-size': 'var(--text-sm)', 'font-weight': 'var(--weight-medium)' },
  th: { 'font-size': 'var(--text-xs)', 'font-weight': 'var(--weight-medium)' },
  td: { 'font-size': 'var(--text-sm)' },
};
// size modifiers only count when the rule really is a control size (it sets a height)
const NEEDS_HEIGHT = new Set(['sm', 'big']);

function applyRecipe(name, body) {
  const recipe = RECIPES[name];
  if (NEEDS_HEIGHT.has(name) && !/(^|;)height:/.test(body)) return body;
  let out = body;
  for (const [prop, want] of Object.entries(recipe)) {
    const re = new RegExp(`(^|;)(${prop}:)([^;]+)`);
    const m = re.exec(out);
    if (!m) continue;                       // a recipe only corrects what the rule already sets
    if (prop === 'padding' && !/^0 \d+px$/.test(m[3].trim())) continue; // custom padding stays
    if (m[3].trim() === want) continue;
    out = out.slice(0, m.index) + m[1] + m[2] + want + out.slice(m.index + m[0].length);
    stats.control++;
  }
  // square icon buttons keep width == height
  if (name === 'ib') out = out.replace(/(^|;)(width:)(\d+)px/, (all, a, b, w) => (+w >= 34 && +w <= 48 ? `${a}${b}36px` : all));
  return out;
}

function transform(text) {
  let out = text;

  // 1. families (CSS text and JSX style objects)
  out = out.replace(/(font-family\s*:\s*)([^;"`}\\]+)/g, (all, head, val) => {
    const to = familyFor(val);
    if (!to || val.trim() === to) return all;
    stats.family++;
    return head + to;
  });
  out = out.replace(/(fontFamily:\s*)"([^"]*)"/g, (all, head, val) => {
    const to = familyFor(val);
    if (!to || val === to) return all;
    stats.family++;
    return `${head}"${to}"`;
  });

  // 2. radii
  out = out.replace(/(border-radius\s*:\s*)([^;"`}\\!]+)/g, (all, head, val) => {
    if (/[$(]/.test(val) && !/^[\d.px\s]+$/.test(val)) return all;
    const to = radiusFor(val);
    if (to === val.trim()) return all;
    stats.radius++;
    return head + to;
  });
  out = out.replace(/(borderRadius:\s*)"([^"]*)"/g, (all, head, val) => {
    if (!/^[\d.px\s]+$/.test(val)) return all;
    const to = radiusFor(val);
    if (to === val) return all;
    stats.radius++;
    return `${head}"${to}"`;
  });
  // native controls never take the card radius
  out = out.replace(/<(button|input|select|textarea)\b([^<>]*?borderRadius: )"var\(--radius-xl\)"/g, (all, tag, mid) => {
    stats.radius++;
    return `<${tag}${mid}"var(--radius-lg)"`;
  });

  // 3. control recipes on the per-screen class rules
  out = out.replace(/^\.(btn|inp|sel|sm|big|card|chip|tab|ib|lbl|th|td)\{([^{}]*)\}/gm, (all, name, body) => {
    const next = applyRecipe(name, body);
    return next === body ? all : `.${name}{${next}}`;
  });

  // 4. any other clickable class rule sits on the control scale: 28 · 32 · 36 · 44 · 52
  out = out.replace(/^([.][^{}\n]*)\{([^{}]*cursor:pointer[^{}]*)\}/gm, (all, sel, body) => {
    if (/^\.(btn|inp|sel|sm|big|card|chip|tab|ib|lbl|th|td)$/.test(sel)) return all;
    const next = body.replace(/(^|;)((?:min-)?height:)(\d+)px/g, (m, a, b, h) => {
      const n = +h;
      const to = n < 24 || n > 58 ? n : n <= 30 ? 28 : n <= 33 ? 32 : n <= 40 ? 36 : n <= 47 ? 44 : 52;
      if (to === n) return m;
      stats.control++;
      return `${a}${b}${to}px`;
    }).replace(/(^|;)(width:)(\d+)px(?=;height:(\d+)px)/, (m) => m); // widths are left alone
    return next === body ? all : `${sel}{${next}}`;
  });

  // 5. status colours: 500-shade text and white-on-500 fills fail contrast, so they move to the 700 shade
  const TEXT = { '#10b981': 'var(--text-success)', '#059669': 'var(--text-success)', '#f59e0b': 'var(--text-warning)', '#ff9800': 'var(--text-warning)', '#ff5724': 'var(--text-danger)', '#0ea5e9': 'var(--text-info)', '#0089c3': 'var(--accent-text)', '#009cde': 'var(--accent-text)', '#697a9b': 'var(--text-muted)' };
  const FILL = { '#10b981': 'var(--fill-success)', '#f59e0b': 'var(--fill-warning)', '#ff9800': 'var(--fill-warning)', '#ff5724': 'var(--fill-danger)', '#0ea5e9': 'var(--fill-info)', '#009cde': 'var(--accent-fill)', '#ff6d5a': 'var(--primary)' };
  out = out.replace(/(?<![-a-zA-Z])(color:\s*"?)(#[0-9a-fA-F]{6})\b/g, (all, head, hex) => {
    const to = TEXT[hex.toLowerCase()];
    if (!to) return all;
    stats.colour++;
    return head + to;
  });
  out = out.replace(/\{\{[^{}]*\}\}|\{[^{}]*\}|__sx\(`[^`]*`\)/g, (group) => {
    if (!/(?<![-a-zA-Z])color:\s*"?(#fff\b|#ffffff\b|white\b)/i.test(group)) return group;
    return group.replace(/(background(?:-color|Color)?:\s*"?)(#[0-9a-fA-F]{6})\b/g, (all, head, hex) => {
      const to = FILL[hex.toLowerCase()];
      if (!to) return all;
      stats.colour++;
      return head + to;
    });
  });

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
    const after = transform(before);
    if (after === before) continue;
    stats.files++;
    if (!DRY) fs.writeFileSync(file, after);
  }
}
console.log((DRY ? '[dry run] ' : '') + JSON.stringify(stats));
