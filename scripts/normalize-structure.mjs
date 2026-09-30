// Structural pass over the converted screens (run after normalize-type and normalize-shape):
//   - replaces the fixed 1440px design-board wrapper with the fluid shell classes
//   - gives every shell screen exactly one <h1> (hero title, or a <PageHeader>)
//   - tags multi-column grids and card rows so they reflow on narrow screens
//   - wraps tables so they scroll inside their card, never the page
//   - names unlabelled controls and makes click-only elements keyboard reachable
//   - snaps button heights onto 28 / 32 / 36 / 44 / 52
// All layout rules for the classes added here live in src/styles/design-system.css.
// Idempotent: safe to run again after a fresh `npm run convert`.
//
//   node scripts/normalize-structure.mjs          apply
//   node scripts/normalize-structure.mjs --dry    report only

import fs from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry');
const stats = { shell: 0, h1: 0, pageHeader: 0, grids: 0, cardRows: 0, sides: 0, tables: 0, labels: 0, roles: 0, buttons: 0, files: 0 };

// ---- class helper -----------------------------------------------------------------------------
/** Adds `cls` to a JSX opening tag (the text from `<tag` up to, but not including, `style=`). */
function withClass(head, cls) {
  if (new RegExp(`\\b${cls}\\b`).test(head)) return head;
  const str = /className="([^"]*)"/.exec(head);
  if (str) return head.replace(str[0], `className="${(str[1] + ' ' + cls).trim()}"`);
  const expr = /className=\{/.exec(head);
  if (expr) {
    // balance the braces of the expression
    let depth = 0, i = expr.index + 'className='.length, end = -1;
    for (; i < head.length; i++) { if (head[i] === '{') depth++; else if (head[i] === '}' && --depth === 0) { end = i; break; } }
    if (end < 0) return head;
    const inner = head.slice(expr.index + 'className={'.length, end);
    return head.slice(0, expr.index) + `className={"${cls} " + (${inner} || "")}` + head.slice(end + 1);
  }
  return head.replace(/\s*$/, '') + ` className="${cls}" `;
}

/** Rewrites opening tags whose inline style matches `test`; `fn` gets (head, style) and returns [head, style]. */
function eachStyled(text, tagRe, test, fn) {
  const re = new RegExp(`(<(?:${tagRe})\\b[^<>]*?)(style=\\{\\{)([^{}]*)(\\}\\})`, 'g');
  return text.replace(re, (all, head, open, style, close) => {
    if (!test(style, head)) return all;
    const out = fn(head, style);
    return out ? out[0] + open + out[1] + close : all;
  });
}

const stripProps = (style, names) => {
  let out = style;
  for (const n of names) out = out.replace(new RegExp(`(^|,)\\s*${n}: "[^"]*"\\s*(,)?`, 'g'), (m, lead, trail) => (lead && trail ? ',' : ''));
  return ' ' + out.replace(/^[\s,]+/, '').replace(/,\s*,/g, ',').replace(/[\s,]+$/, '') + ' ';
};

// ---- 1. shell ---------------------------------------------------------------------------------
function shell(text) {
  const lines = text.split('\n');
  const at = lines.findIndex((l, i) => /^\s+<div\b/.test(l) && /<__Sidebar\b/.test(lines[i + 1] || '') && /display: "flex"/.test(l) && /padding: "12px"/.test(l));
  if (at < 0) return text;
  let changed = false;
  const edit = (i, cls, drop) => {
    const m = /^(\s*)(<\w+\b[^<>]*?)style=\{\{([^{}]*)\}\}(.*)$/.exec(lines[i]);
    if (!m) return;
    const head = withClass(m[2], cls);
    const style = stripProps(m[3], drop);
    const next = `${m[1]}${head}style={{${style}}}${m[4]}`;
    if (next !== lines[i]) { lines[i] = next; changed = true; }
  };
  edit(at, 'gc-shell', ['width', 'height', 'overflow', 'boxSizing']);
  edit(at + 2, 'gc-shell__main', ['overflow', 'overflowY']);
  const top = lines.findIndex((l, i) => i > at && /<__Topbar\b/.test(l));
  if (top > 0 && /^\s+<(div|main)\b/.test(lines[top + 1] || '')) edit(top + 1, 'gc-shell__content', ['overflowY']);
  if (changed) stats.shell++;
  return lines.join('\n');
}

// ---- 2. one <h1> per shell screen -------------------------------------------------------------
function headings(text) {
  if (!/gc-shell/.test(text) || /<h1\b/.test(text)) return text;
  // dark hero band: its title is the page title
  const hero = /(<section className="hero[^"]*"[\s\S]{0,1200}?)<h2\b([^>]*)>([\s\S]*?)<\/h2>/.exec(text);
  if (hero) {
    stats.h1++;
    return text.slice(0, hero.index) + hero[1] + `<h1${hero[2]}>${hero[3]}</h1>` + text.slice(hero.index + hero[0].length);
  }
  const pm = /<__Topbar\b[^>]*\bpage=(?:"([^"]+)"|\{"([^"]+)"\})/.exec(text);
  const page = pm ? [pm[0], pm[1] || pm[2]] : null;
  const content = /^(\s*)<(?:div|main)\b[^<>]*\bgc-shell__content\b[^\n]*>\s*$/m.exec(text);
  if (!page || !content || /__PageHeader/.test(text)) return text;
  const insertAt = content.index + content[0].length;
  let out = text.slice(0, insertAt) + `\n${content[1]}  <__PageHeader title={${JSON.stringify(page[1])}} />` + text.slice(insertAt);
  out = out.replace("from '@/shell/Shell';", "from '@/shell/Shell';\nimport { PageHeader as __PageHeader } from '@/components/ui';");
  stats.pageHeader++;
  return out;
}

// ---- 3. reflow hooks ----------------------------------------------------------------------------
function reflow(text) {
  let out = text;
  // equal-column grids
  out = eachStyled(out, 'div|section|ul|dl|form|article|main|aside', (s) => /gridTemplateColumns: "(repeat\((\d), ?(minmax\(0, ?1fr\)|1fr)\)|1fr 1fr|minmax\(0, ?1fr\) minmax\(0, ?1fr\))"/.test(s), (head, style) => {
    const m = /gridTemplateColumns: "(?:repeat\((\d)|(1fr 1fr|minmax\(0, ?1fr\) minmax))/.exec(style);
    const n = m[1] ? +m[1] : 2;
    if (n < 2 || n > 6) return null;
    const next = withClass(head, `gc-cols-${n}`);
    if (next === head) return null;
    stats.grids++;
    return [next, style];
  });
  // content + fixed side panel
  out = eachStyled(out, 'div|section|main|form', (s) => /gridTemplateColumns: "(minmax\(0, ?1fr\) (\d{3})px|(\d{3})px minmax\(0, ?1fr\))"/.test(s), (head, style) => {
    const m = /gridTemplateColumns: "(?:minmax\(0, ?1fr\) (\d{3})px|(\d{3})px minmax\(0, ?1fr\))"/.exec(style);
    if (+(m[1] || m[2]) < 260) return null; // label/value rows, not page splits
    const next = withClass(head, 'gc-split');
    if (next === head) return null;
    stats.grids++;
    return [next, style];
  });
  // fixed-width side columns in a flex row
  out = eachStyled(out, 'aside|section|div', (s, head) => /^<aside/.test(head) && /(^|[ ,])width: "(\d{3})px"/.test(s) && /flexShrink: "0"|flex: "none"/.test(s), (head, style) => {
    const w = +/(?:^|[ ,])width: "(\d{3})px"/.exec(style)[1];
    if (w < 260) return null;
    const next = withClass(head, 'gc-side');
    if (next === head) return null;
    stats.sides++;
    return [next, style];
  });
  // a flex row of equal cards
  const lines = out.split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    if (!/^\s*<div\b[^<>]*style=\{\{ display: "flex", gap: "\d+px" \}\}>\s*$/.test(lines[i])) continue;
    if (!/flexGrow: "1", flexBasis: "0"/.test(lines[i + 1])) continue;
    const m = /^(\s*)(<div\b[^<>]*?)(style=.*)$/.exec(lines[i]);
    const head = withClass(m[2], 'gc-cardrow');
    if (head === m[2]) continue;
    lines[i] = m[1] + head + m[3];
    stats.cardRows++;
  }
  return lines.join('\n');
}

// ---- 4. tables scroll inside a wrapper --------------------------------------------------------
function tables(text) {
  const lines = text.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const open = /^(\s*)<table\b/.exec(lines[i]);
    if (!open) { out.push(lines[i]); continue; }
    const prev = [...out].reverse().find((l) => l.trim());
    const close = lines.findIndex((l, j) => j > i && l.startsWith(open[1] + '</table>'));
    if (close < 0 || /gc-table-wrap|overflowX: "auto"|overflow: "auto"/.test(prev || '')) { out.push(lines[i]); continue; }
    out.push(`${open[1]}<div className="gc-table-wrap">`);
    for (let j = i; j <= close; j++) out.push('  ' + lines[j]);
    out.push(`${open[1]}</div>`);
    i = close;
    stats.tables++;
  }
  return out.join('\n');
}

// ---- 5. accessible names and keyboard reach -----------------------------------------------------
const insideLabel = (text, at) => {
  const back = text.slice(Math.max(0, at - 500), at);
  const open = back.lastIndexOf('<label');
  return open >= 0 && back.indexOf('</label>', open) < 0;
};
const jsxAttr = (s) => `"${s.replace(/"/g, '&quot;').replace(/[{}]/g, '')}"`;

function a11y(text) {
  let out = text;
  // checkboxes in tables
  out = out.replace(/<input\b([^<>]*?)type="checkbox"([^<>]*?)\/?>/g, (all, a, b, at) => {
    if (/aria-label/.test(all) || insideLabel(out, at)) return all;
    const back = out.slice(Math.max(0, at - 400), at);
    const cell = Math.max(back.lastIndexOf('<th'), back.lastIndexOf('<td'));
    if (cell < 0) return all;
    const label = back.lastIndexOf('<th') > back.lastIndexOf('<td') ? 'Select all rows' : 'Select this row';
    stats.labels++;
    return all.replace('<input', `<input aria-label="${label}"`);
  });
  // text inputs named by their placeholder
  out = out.replace(/<(input|textarea)\b([^<>]*?)placeholder="([^"{}]+)"([^<>]*?)>/g, (all, tag, a, ph, b, at) => {
    if (/aria-label|aria-labelledby|\bid=/.test(all) || insideLabel(out, at)) return all;
    stats.labels++;
    return all.replace(`<${tag}`, `<${tag} aria-label=${jsxAttr(ph.replace(/[….]+$/, ''))}`);
  });
  // selects named by their first option
  out = out.replace(/<select\b([^<>]*)>/g, (all, attrs, at) => {
    if (/aria-label|aria-labelledby|\bid=/.test(all) || insideLabel(out, at)) return all;
    const opt = /<option\b[^>]*>([^<{}]+)<\/option>/.exec(out.slice(at, at + 700));
    if (!opt) return all;
    stats.labels++;
    return all.replace('<select', `<select aria-label=${jsxAttr(opt[1].trim().replace(/^All /, ''))}`);
  });
  // click-only containers become buttons for the keyboard (Enter/Space handled once, in <Overlays>)
  out = out.replace(/<(div|span|li|article|section)\b([^<>]*?)(onClick=|cursor: "pointer")/g, (all, tag, attrs) => {
    if (/\brole=|tabIndex/.test(attrs)) return all;
    stats.roles++;
    return all.replace(`<${tag}`, `<${tag} role="button" tabIndex={0}`);
  });
  return out;
}

// ---- 6. button heights: 28 (dense rows) · 32 (icon) · 36 · 44 · 52 -------------------------------
function snap(h) {
  if (h < 24 || h > 58) return h;       // tiny marks (bins, dots) and card-sized tiles are handled per page
  if (h <= 30) return 28;
  if (h <= 33) return 32;
  if (h <= 40) return 36;
  if (h <= 47) return 44;
  return 52;
}
function buttons(text) {
  return text.replace(/(<button\b[^<>]*?style=\{\{[^{}]*?(?:^|[ ,{]))((?:minH|h)eight: ")(\d+)(px")/g, (all, head, key, h, tail) => {
    const to = snap(+h);
    if (to === +h) return all;
    // square icon buttons keep their shape
    const sq = new RegExp(`width: "${h}px"`);
    stats.buttons++;
    return (sq.test(head) ? head.replace(sq, `width: "${to}px"`) : head) + key + to + tail;
  });
}

// ---- run ----------------------------------------------------------------------------------------
function* walk(p) {
  const st = fs.statSync(p);
  if (st.isFile()) { yield p; return; }
  for (const f of fs.readdirSync(p)) yield* walk(path.join(p, f));
}

// The platform console and the phone-app boards are design references, not merchant screens.
const SKIP = /\/screens\/(console|app|dev-reference|core-backend|site-map)\//;

for (const file of walk('src/screens')) {
  if (!file.endsWith('.jsx')) continue;
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  if (!SKIP.test(file)) {
    after = shell(after);
    after = headings(after);
    after = reflow(after);
    after = tables(after);
    after = buttons(after);
  }
  after = a11y(after);
  if (after === before) continue;
  stats.files++;
  if (!DRY) fs.writeFileSync(file, after);
}
console.log((DRY ? '[dry run] ' : '') + JSON.stringify(stats));
