#!/usr/bin/env node
// Converts the design canvas (design/templates/**/<Page>.dc.html) into React screens and
// Next.js routes. Run once per design import: `npm run convert`.
//
//   design/templates/<folder>/<Page>.dc.html  ->  src/screens/<folder>/<Page>.jsx
//                                             ->  src/app/(<group>)/<kebab-page>/page.jsx
//                                             ->  src/screens/registry.js (index of all screens)
//
// A .dc.html page is markup with {{ holes }}, <sc-for>, <sc-if> and <dc-import>, plus a logic class
// (`class Component extends DCLogic`) whose renderVals() feeds the holes. The markup becomes JSX
// inside a render() added to that class; the logic is kept verbatim.

import fs from 'node:fs';
import path from 'node:path';
import { parseDocument } from 'htmlparser2';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DESIGN = path.join(ROOT, 'design');
const TEMPLATES = path.join(DESIGN, 'templates');
const OUT_SCREENS = path.join(ROOT, 'src/screens');
const OUT_APP = path.join(ROOT, 'src/app');

// ---------------------------------------------------------------------------------------------
// helpers

const kebab = (name) => String(name)
  .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
  .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
  .toLowerCase();

const ASSET_EXT = Object.fromEntries(
  fs.readdirSync(path.join(DESIGN, 'assets')).map((f) => f.split('.')).filter(([, e]) => e !== 'js'),
);
const assetUrl = (id) => '/assets/' + id + '.' + (ASSET_EXT[id] || 'png');
const rewriteAssets = (t) => String(t).replace(/\/_blob\/([0-9a-f]{32})/g, (_, id) => assetUrl(id));

const DC_RE = /(?:^|\/)([A-Za-z0-9_]+)\.dc\.html(#.*)?$/;
const routeOf = (href) => {
  const m = String(href).match(DC_RE);
  return m ? '/' + kebab(m[1]) + (m[2] || '') : href;
};

const J = (s) => JSON.stringify(s);
const tpl = (s) => String(s).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
const HOLE = /\{\{\s*([\s\S]*?)\s*\}\}/g;
const IDENT = /^[A-Za-z_$][\w$]*$/;
const RESERVED = new Set(('break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof new return super switch this throw try typeof var void while with yield let static enum await implements package protected interface private public').split(' '));

// Canvas index: titles, sizes, pages.
const canvas = JSON.parse(fs.readFileSync(path.join(DESIGN, 'canvas.json'), 'utf8'));
const PAGE_NAMES = Object.fromEntries(canvas.pages.map((p) => [p.id, p.name]));

// Route groups (folders in src/app) by design folder. Groups don't change URLs.
const GROUP = {
  app: '(phone-app)', console: '(platform-console)', 'core-backend': '(platform-console)',
  'dev-reference': '(dev-reference)', 'pos-register': '(pos)', 'settings-console': '(settings)',
  storefront: '(storefront)', 'merchant-signin': '(auth)', 'merchant-onboarding': '(auth)',
};
const groupOf = (folder) => GROUP[folder] || '(merchant)';

// ---------------------------------------------------------------------------------------------
// expressions

/** Compiles a hole's dotted path (`item.name`, `$index`, `true`) to a JS expression. */
function pathExpr(raw, ctx) {
  const p = raw.trim();
  if (p === '') return 'undefined';
  if (/^(true|false|null|undefined)$/.test(p)) return p;
  if (/^-?\d+(\.\d+)?$/.test(p)) return p;
  if (/^'[^']*'$/.test(p) || /^"[^"]*"$/.test(p)) return p;
  const segs = p.split('.');
  if (!segs.every((s) => /^[\w$-]+$/.test(s))) {
    ctx.warn(`non-path hole {{ ${p} }}`);
    return 'undefined';
  }
  const [head, ...rest] = segs;
  let out;
  if (ctx.scope.has(head)) out = ctx.scope.get(head);
  else out = IDENT.test(head) ? 'v.' + head : 'v[' + J(head) + ']';
  for (const s of rest) out += /^\d+$/.test(s) ? `?.[${s}]` : IDENT.test(s) ? '?.' + s : `?.[${J(s)}]`;
  return out;
}

/** Splits text with holes into [{lit}|{expr}] parts. */
function parts(text, ctx) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(HOLE)) {
    if (m.index > last) out.push({ lit: text.slice(last, m.index) });
    out.push({ expr: pathExpr(m[1], ctx) });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ lit: text.slice(last) });
  return out;
}

const wholeHole = (v) => /^\s*\{\{[\s\S]*?\}\}\s*$/.test(v) && (v.match(/\{\{/g) || []).length === 1;
const hasHole = (v) => /\{\{[\s\S]*?\}\}/.test(v);

/** An attribute value as a JS expression: raw value for a whole hole, else an interpolated string. */
function valueExpr(value, ctx, { raw = true } = {}) {
  if (raw && wholeHole(value)) return pathExpr(value.trim().slice(2, -2), ctx);
  const ps = parts(value, ctx);
  return '`' + ps.map((x) => (x.lit != null ? tpl(x.lit) : '${' + x.expr + ' ?? ""}')).join('') + '`';
}

// ---------------------------------------------------------------------------------------------
// attributes

const ATTR_MAP = {
  class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength',
  minlength: 'minLength', colspan: 'colSpan', rowspan: 'rowSpan', cellpadding: 'cellPadding',
  cellspacing: 'cellSpacing', autocomplete: 'autoComplete', autofocus: 'autoFocus', autoplay: 'autoPlay',
  contenteditable: 'contentEditable', spellcheck: 'spellCheck', enterkeyhint: 'enterKeyHint',
  inputmode: 'inputMode', crossorigin: 'crossOrigin', srcset: 'srcSet', frameborder: 'frameBorder',
  allowfullscreen: 'allowFullScreen', novalidate: 'noValidate', formaction: 'formAction', datetime: 'dateTime',
  usemap: 'useMap', accesskey: 'accessKey', charset: 'charSet', enctype: 'encType', srcdoc: 'srcDoc',
  playsinline: 'playsInline', referrerpolicy: 'referrerPolicy', 'accept-charset': 'acceptCharset',
  'http-equiv': 'httpEquiv', 'xlink:href': 'xlinkHref', 'xmlns:xlink': 'xmlnsXlink', 'xml:space': 'xmlSpace',
  'xml:lang': 'xmlLang', 'xlink:title': 'xlinkTitle', novalidate_: 'noValidate', viewbox: 'viewBox',
};
const BOOL_ATTRS = new Set(['disabled', 'checked', 'selected', 'hidden', 'required', 'readonly', 'multiple',
  'autofocus', 'open', 'novalidate', 'defer', 'async', 'controls', 'loop', 'muted', 'playsinline', 'reversed',
  'default', 'inert', 'allowfullscreen', 'itemscope', 'nomodule', 'formnovalidate']);

function reactAttrName(name) {
  if (ATTR_MAP[name]) return ATTR_MAP[name];
  if (name.startsWith('data-') || name.startsWith('aria-')) return name;
  if (/^on[A-Z]/.test(name)) return name;
  if (name.includes('-') || name.includes(':')) return name.replace(/[-:]([a-z])/g, (_, c) => c.toUpperCase());
  return name;
}

/** Converts a static style string to an object literal source, or null when it has holes. */
function styleObjectSource(style) {
  const decls = [];
  for (const d of splitDecls(rewriteAssets(style))) {
    const i = d.indexOf(':');
    if (i < 1) continue;
    const name = d.slice(0, i).trim();
    const val = d.slice(i + 1).trim();
    let key;
    if (name.startsWith('--')) key = J(name);
    else {
      let n = name.toLowerCase();
      if (n.startsWith('-ms-')) n = 'ms-' + n.slice(4);
      else n = n.replace(/^-(webkit|moz)-/, (_, v) => v[0].toUpperCase() + v.slice(1) + '-');
      key = n.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (!IDENT.test(key)) key = J(key);
    }
    decls.push(`${key}: ${J(val)}`);
  }
  return '{ ' + decls.join(', ') + ' }';
}

function splitDecls(text) {
  const out = [];
  let depth = 0, quote = '', cur = '';
  for (const ch of text) {
    if (quote) { if (ch === quote) quote = ''; cur += ch; continue; }
    if (ch === '"' || ch === "'") { quote = ch; cur += ch; continue; }
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ';' && depth === 0) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

/** Builds the JSX attribute list for an element. */
function attrsSource(el, ctx, { skip = [], extra = [] } = {}) {
  const out = [...extra];
  const attribs = el.attribs || {};
  const hasHandler = Object.keys(attribs).some((k) => /^on(Change|Input)$/.test(k));
  const tag = el.name;
  for (const [name, value] of Object.entries(attribs)) {
    if (skip.includes(name)) continue;
    if (name.startsWith('hint-')) continue;
    if (name === 'style-hover' || name === 'style-focus') continue; // handled by caller via className
    if (name === 'style') {
      if (hasHole(value)) out.push(`style={__sx(${valueExpr(value, ctx)})}`);
      else if (value.trim()) out.push(`style={${styleObjectSource(value)}}`);
      continue;
    }
    let rname = reactAttrName(name);
    // Uncontrolled form values unless the element has its own change handler.
    if ((tag === 'input' || tag === 'textarea' || tag === 'select') && !hasHandler) {
      if (name === 'value') rname = 'defaultValue';
      if (name === 'checked') rname = 'defaultChecked';
    }
    if (hasHandler && (name === 'value' || name === 'checked') && !hasHole(value)) {
      rname = name === 'value' ? 'defaultValue' : 'defaultChecked';
    }
    if (tag === 'option' && name === 'selected') continue; // moved to <select defaultValue>
    if (BOOL_ATTRS.has(name.toLowerCase()) && !hasHole(value)) {
      out.push(rname);
      continue;
    }
    if (hasHole(value)) {
      out.push(`${rname}={${valueExpr(value, ctx)}}`);
    } else if (name === 'src' || name === 'href' || name === 'poster') {
      out.push(`${rname}=${attrString(rewriteAssets(value))}`);
    } else {
      out.push(`${rname}=${attrString(value)}`);
    }
  }
  return out;
}

const attrString = (v) => (/["&\\\n{}<>]/.test(v) ? `{${J(v)}}` : `"${v}"`);

// ---------------------------------------------------------------------------------------------
// markup -> JSX

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const NO_TEXT_PARENTS = new Set(['table', 'thead', 'tbody', 'tfoot', 'tr', 'colgroup', 'select', 'optgroup',
  'svg', 'g', 'defs', 'linearGradient', 'radialGradient', 'clipPath', 'mask', 'pattern', 'symbol', 'marker', 'filter', 'head', 'html']);
const BLOCK = new Set(['div', 'p', 'section', 'header', 'footer', 'main', 'aside', 'nav', 'ul', 'ol', 'li', 'table',
  'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'article', 'figure', 'fieldset', 'hr', 'dl', 'dt', 'dd', 'blockquote',
  'pre', 'details', 'summary', 'sc-if', 'sc-for', 'dc-import', 'gc-sidebar', 'gc-topbar', 'style', 'script', 'dialog', 'thead', 'tbody', 'tr', 'td', 'th', 'caption', 'option', 'select', 'label_']);

const isWs = (n) => n.type === 'text' && !/\S/.test(n.data);
const isComment = (n) => n.type === 'comment' || n.type === 'directive';

function styleOf(el) {
  return ((el && el.attribs && el.attribs.style) || '').replace(/\s+/g, '');
}
function isLayoutContainer(el) {
  const s = styleOf(el);
  return /display:(flex|grid|inline-flex|inline-grid)/.test(s);
}
function preserves(el) {
  if (!el) return false;
  if (el.name === 'pre' || el.name === 'textarea') return true;
  return /white-space:(pre|pre-wrap|pre-line|break-spaces)/.test(styleOf(el));
}

function textLiteral(text, ctx, parent) {
  // Keep text exactly; JSX-safe when single-line and free of special characters.
  if (!preserves(parent) && !/[\n\r{}<>&"\\]/.test(text) && text === text.replace(/^\s+|\s+$/g, (m) => (m.length ? ' ' : m))) {
    return text;
  }
  return `{${J(text)}}`;
}

function emitText(text, ctx, parent) {
  const ps = parts(text, ctx);
  return ps.map((x) => (x.lit != null ? textLiteral(x.lit, ctx, parent) : `{${x.expr}}`)).join('');
}

function emitChildren(nodes, ctx, parent, indent) {
  const kids = nodes.filter((n) => !isComment(n) && !(n.type === 'tag' && n.name === 'helmet') && !(n.type === 'script' && parent && parent.name !== 'svg'));
  const parentName = parent ? parent.name : 'root';
  const inline = kids.some((n) => n.type === 'text' && /\S/.test(n.data));
  const out = [];
  kids.forEach((n, i) => {
    if (isWs(n)) {
      if (NO_TEXT_PARENTS.has(parentName) || parentName === 'root') return;
      if (isLayoutContainer(parent)) return;
      const prev = kids[i - 1], next = kids[i + 1];
      if (!prev || !next) return; // leading/trailing whitespace inside an element never renders
      if (!inline && (BLOCK.has(prev.name) || BLOCK.has(next.name))) return;
      out.push(preserves(parent) ? `{${J(n.data)}}` : '{" "}');
      return;
    }
    if (n.type === 'text') { out.push(emitText(n.data, ctx, parent)); return; }
    const s = emitNode(n, ctx, inline ? '' : indent + '  ');
    if (s) out.push(s);
  });
  if (!out.length) return '';
  if (inline) return out.join('');
  return out.map((s) => '\n' + indent + '  ' + s.trimStart()).join('') + '\n' + indent;
}

function childOnlyJsx(nodes, ctx, parent, indent) {
  // Children wrapped so they form one expression.
  const inner = emitChildren(nodes, ctx, parent, indent);
  if (!inner.trim()) return 'null';
  return `<>${inner}</>`;
}

let hoverSeq = 0;

function emitNode(n, ctx, indent) {
  if (n.type === 'text') return emitText(n.data, ctx, null);
  if (isComment(n)) return '';
  if (n.type === 'script') return '';
  if (n.type === 'style') {
    const css = n.children.map((c) => c.data).join('');
    return `<style dangerouslySetInnerHTML={{ __html: ${valueExpr(rewriteAssets(css), ctx, { raw: false })} }} />`;
  }
  if (n.type !== 'tag') return '';
  const tag = n.name;
  const a = n.attribs || {};

  if (tag === 'sc-if') {
    const cond = valueExpr(a.value || '', ctx);
    return `{${cond} ? (${childOnlyJsx(n.children, ctx, n, indent)}) : null}`;
  }

  if (tag === 'sc-for') {
    const listExpr = valueExpr(a.list || '', ctx);
    const as = (a.as || 'item').trim();
    const local = RESERVED.has(as) || !IDENT.test(as) ? '_' + as.replace(/\W/g, '_') : as;
    const inner = { ...ctx, scope: new Map(ctx.scope) };
    inner.scope.set(as, local);
    inner.scope.set('$index', '$index');
    const body = emitChildren(n.children, inner, n, indent + '  ');
    return `{__list(${listExpr}).map((${local}, $index) => (<React.Fragment key={$index}>${body || ''}</React.Fragment>))}`;
  }

  if (tag === 'dc-import') {
    const name = a.name;
    ctx.imports.add(name);
    const props = [];
    for (const [k, v] of Object.entries(a)) {
      if (k === 'name' || k === 'style' || k.startsWith('hint-')) continue;
      const pn = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      props.push(hasHole(v) ? `${pn}={${valueExpr(v, ctx)}}` : `${pn}=${attrString(v)}`);
    }
    const style = a.style ? (hasHole(a.style) ? ` style={__sx(${valueExpr(a.style, ctx)})}` : ` style={${styleObjectSource(a.style)}}`) : '';
    return `<div data-dc-import=${J(name)}${style}><__${name}${props.length ? ' ' + props.join(' ') : ''} /></div>`;
  }

  if (tag === 'gc-sidebar' || tag === 'gc-topbar') {
    const comp = tag === 'gc-sidebar' ? '__Sidebar' : '__Topbar';
    const props = [];
    for (const [k, v] of Object.entries(a)) {
      if (k === 'base') continue;
      props.push(hasHole(v) ? `${k}={${valueExpr(v, ctx, { raw: false })}}` : `${k}=${attrString(v)}`);
    }
    return `<${comp}${props.length ? ' ' + props.join(' ') : ''} />`;
  }

  // style-hover / style-focus -> a generated class with !important rules in the screen's CSS.
  const extraClasses = [];
  for (const kind of ['hover', 'focus']) {
    const v = a['style-' + kind];
    if (v == null) continue;
    if (hasHole(v)) { ctx.warn(`style-${kind} with holes on <${tag}>`); continue; }
    const cls = `dc-${kind[0]}${++hoverSeq}`;
    const decls = splitDecls(rewriteAssets(v)).map((d) => d.replace(/\s*!important\s*$/, '') + ' !important').join(';');
    ctx.css.push(kind === 'hover' ? `.${cls}:hover{${decls}}` : `.${cls}:focus,.${cls}:focus-visible,.${cls}:focus-within{${decls}}`);
    extraClasses.push(cls);
  }

  let skip = [];
  let extra = [];
  if (extraClasses.length) {
    skip.push('class');
    const base = a.class != null ? valueExpr(a.class, ctx, { raw: false }) : '``';
    extra.push(a.class != null
      ? `className={${base.slice(0, -1)} ${extraClasses.join(' ')}\`}`
      : `className="${extraClasses.join(' ')}"`);
  }

  // Lucide placeholders.
  if (tag === 'i' && a['data-lucide'] != null) {
    const nameV = a['data-lucide'];
    const nameSrc = hasHole(nameV) ? `name={${valueExpr(nameV, ctx)}}` : `name=${attrString(nameV)}`;
    const own = attrsSource(n, ctx, { skip: ['data-lucide', ...skip], extra });
    const has = (k) => own.some((s) => s.startsWith(k + '=') || s === k);
    const defs = [];
    for (const [k, val] of Object.entries(ctx.iconDefaults)) if (!has(k)) defs.push(`${k}=${attrString(String(val))}`);
    return `<__Icon ${[nameSrc, ...defs, ...own].join(' ')} />`;
  }

  // <select> with an <option selected>: becomes defaultValue.
  if (tag === 'select' && !a.value) {
    const opt = findSelectedOption(n);
    if (opt) extra.push(`defaultValue=${attrString(opt)}`);
  }

  let jsxTag = tag;
  if (tag === 'a' && a.href != null) {
    if (hasHole(a.href)) jsxTag = '__A';
    else if (DC_RE.test(a.href)) {
      jsxTag = '__Link';
      skip.push('href');
      extra.push(`href=${attrString(routeOf(a.href))}`);
    }
  }

  const attrs = attrsSource(n, ctx, { skip, extra });

  if (tag === 'textarea') {
    const text = n.children.map((c) => c.data || '').join('');
    if (text) attrs.push(hasHole(text) ? `defaultValue={${valueExpr(text, ctx, { raw: false })}}` : `defaultValue={${J(text)}}`);
    return `<textarea${attrs.length ? ' ' + attrs.join(' ') : ''} />`;
  }

  const open = `<${jsxTag}${attrs.length ? ' ' + attrs.join(' ') : ''}`;
  if (VOID.has(tag)) return open + ' />';
  const inner = emitChildren(n.children, ctx, n, indent);
  if (!inner) return open + ' />';
  return `${open}>${inner}</${jsxTag}>`;
}

function findSelectedOption(sel) {
  let found = null;
  const walk = (n) => {
    if (found || !n.children) return;
    for (const c of n.children) {
      if (c.type === 'tag' && c.name === 'option' && c.attribs && c.attribs.selected != null) {
        found = c.attribs.value != null ? c.attribs.value : c.children.map((t) => t.data || '').join('').trim();
        return;
      }
      walk(c);
    }
  };
  walk(sel);
  return found;
}

// ---------------------------------------------------------------------------------------------
// one file

function findAll(nodes, pred, out = []) {
  for (const n of nodes) {
    if (pred(n)) out.push(n);
    if (n.children) findAll(n.children, pred, out);
  }
  return out;
}

function convert(file) {
  const rel = path.relative(TEMPLATES, file); // folder/Name.dc.html
  const folder = path.dirname(rel);
  const name = path.basename(rel, '.dc.html');
  const src = fs.readFileSync(file, 'utf8');
  const warnings = [];

  const doc = parseDocument(src, { lowerCaseAttributeNames: false, lowerCaseTags: false, recognizeSelfClosing: true, decodeEntities: true });
  const xdc = findAll(doc.children, (n) => n.type === 'tag' && n.name === 'x-dc')[0];
  if (!xdc) throw new Error('no <x-dc> in ' + rel);
  const titleEl = findAll(doc.children, (n) => n.type === 'tag' && n.name === 'title')[0];
  const title = titleEl ? titleEl.children.map((c) => c.data).join('').trim() : '';

  // Logic script (raw text: take it from the source to keep it byte-exact).
  const m = src.match(/<script type="text\/x-dc"[^>]*data-dc-script[^>]*>([\s\S]*?)<\/script>/);
  let logic = m ? m[1] : 'class Component extends DCLogic { renderVals() { return {}; } }';
  logic = rewriteAssets(logic).replace(/^\n+|\s+$/g, '');
  const propsM = src.match(/data-props='([^']*)'/);
  let preview = null;
  try { preview = propsM ? JSON.parse(propsM[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'"))['$preview'] || null : null; } catch { /* ignore */ }

  // Page-level icon defaults from lucide.createIcons({ attrs: {...} }).
  const iconDefaults = {};
  const ci = logic.match(/createIcons\(\{\s*attrs:\s*\{([^}]*)\}/);
  if (ci) {
    for (const kv of ci[1].split(',')) {
      const [k, v] = kv.split(':').map((s) => s && s.trim().replace(/^['"]|['"]$/g, ''));
      if (k && v) iconDefaults[reactAttrName(k)] = v;
    }
  }

  // Template description comment.
  const tplComment = (src.match(/<!--\s*@template\s+([\s\S]*?)-->/) || [])[1] || '';
  const desc = (tplComment.match(/description="([^"]*)"/) || [])[1] || '';

  // Helmet: styles, scripts.
  const helmet = xdc.children.find((n) => n.type === 'tag' && n.name === 'helmet');
  const css = [];
  const scripts = [];
  if (helmet) {
    for (const n of findAll(helmet.children, () => true)) {
      if (n.type === 'style') css.push(n.children.map((c) => c.data).join(''));
      if (n.type === 'script' && n.attribs.src) scripts.push(n.attribs.src);
    }
  }
  const usesDsBase = scripts.some((s) => /ds-base\.js$/.test(s));
  const usesPosNav = scripts.some((s) => /pos-nav\.js$/.test(s));
  const usesSetNav = scripts.some((s) => /set-nav\.js$/.test(s));
  const usesPosFit = scripts.some((s) => /pos-fit\.js$/.test(s));

  const ctx = {
    scope: new Map(), imports: new Set(), css: [], iconDefaults,
    warn: (w) => warnings.push(w),
  };
  const body = emitChildren(xdc.children, ctx, null, '      ');

  const cssAll = rewriteAssets([...css, ...ctx.css].join('\n'));
  const board = canvas.boards['templates/' + rel] || {};

  const imports = [
    `import React from 'react';`,
    `import __Link from 'next/link';`,
    `import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';`,
  ];
  if (/<__Sidebar|<__Topbar/.test(body) || usesPosNav || usesSetNav || usesPosFit) {
    imports.push(`import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';`);
  }
  for (const imp of [...ctx.imports].sort()) {
    const target = importPath(imp);
    if (!target) { warnings.push('dc-import of unknown ' + imp); continue; }
    imports.push(`import __${imp} from '${target}';`);
  }

  const extras = [
    usesPosFit ? '<__PosFit />' : '',
    usesPosNav ? '<__PosSwitcher />' : '',
    usesSetNav ? '<__SettingsSwitcher />' : '',
  ].filter(Boolean).map((s) => '\n        ' + s).join('');

  const header = [
    '// Generated from design/templates/' + rel.split(path.sep).join('/') + ' by scripts/convert-design.mjs.',
    '// ' + (board.title || title || name) + (desc ? ' — ' + desc : ''),
    '// Edit freely: this file is now the source for the screen.',
  ].join('\n');

  const out = `'use client';
${header}

${imports.join('\n')}

// ---- logic (from the design's <script type="text/x-dc">) ----

${logic}

// ---- styles (from the design's <helmet>) ----

const CSS = \`${tpl(cssAll)}\`;

// ---- markup ----

export default class ${name}Screen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen${usesDsBase ? ' ds' : ''}" data-screen=${J(name)}>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />${extras}${body.replace(/\s+$/, '')}
      </div>
    );
  }
}
`;
  return {
    code: out, folder, name, rel, title: board.title || title || name, desc, warnings,
    page: board.page || null, w: board.w || (preview && preview.width) || null, h: board.h || (preview && preview.height) || null,
    interactive: !!board.is_interactive,
  };
}

let NAME_INDEX = null;
function importPath(name) {
  if (!NAME_INDEX) {
    NAME_INDEX = {};
    for (const f of walk(TEMPLATES)) NAME_INDEX[path.basename(f, '.dc.html')] = path.dirname(path.relative(TEMPLATES, f));
  }
  const folder = NAME_INDEX[name];
  return folder ? `@/screens/${folder}/${name}` : null;
}

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.dc.html')) out.push(p);
  }
  return out.sort();
}

// ---------------------------------------------------------------------------------------------
// main

const files = walk(TEMPLATES);
const registry = [];
let warnCount = 0;
fs.rmSync(OUT_SCREENS, { recursive: true, force: true });
for (const g of new Set(Object.values(GROUP).concat('(merchant)'))) fs.rmSync(path.join(OUT_APP, g), { recursive: true, force: true });

for (const f of files) {
  const r = convert(f);
  const dir = path.join(OUT_SCREENS, r.folder);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, r.name + '.jsx'), r.code);

  const route = '/' + kebab(r.name);
  const pageDir = path.join(OUT_APP, groupOf(r.folder), kebab(r.name));
  fs.mkdirSync(pageDir, { recursive: true });
  fs.writeFileSync(path.join(pageDir, 'page.jsx'), `import Screen from '@/screens/${r.folder}/${r.name}';

export const metadata = { title: ${J(r.title)} };

export default function Page() {
  return <Screen />;
}
`);
  registry.push({
    name: r.name, route, folder: r.folder, title: r.title, description: r.desc,
    canvasPage: r.page ? PAGE_NAMES[r.page] : null, width: r.w, height: r.h, interactive: r.interactive,
  });
  for (const w of r.warnings) { console.warn(`${r.rel}: ${w}`); warnCount++; }
}

fs.writeFileSync(path.join(OUT_SCREENS, 'registry.js'),
  `// Generated by scripts/convert-design.mjs: every screen, its route and its design board.\n\nexport const SCREENS = ${JSON.stringify(registry, null, 2)};\n`);

console.log(`Converted ${files.length} screens (${warnCount} warnings).`);
