// storefront/customCode — the safe core of custom sections (Batch A step 6). A custom section is the shop's own HTML and
// CSS with named settings ({{key}} in the HTML) that anyone can then fill in from the layout editor without touching code.
// Pure (no imports, no browser), so the kit checker and the storefront share it.
//
//   CUSTOM_FIELD_TYPES · CUSTOM_LIMITS
//   sanitizeHtml(html) → { html, removed: [plain words] }   allow-list of tags and attributes; no scripts, frames,
//                         forms, event handlers, javascript: links or inline <style>; links to other sites open in a new
//                         tab with rel="noopener"
//   scopeCss(css, scope) → { css, removed }   every selector is put under `.<scope>` (so the section can't restyle the
//                         rest of the store); no @import, url() outside https:// or /assets, expression(), position:fixed
//   fillTemplate(html, fields, values) → html   {{key}} → the value, escaped; links and pictures only safe addresses;
//                         colours only #rrggbb; numbers only digits
//   fillCss(css, fields, values) → css   {{key}} in the CSS: colours, numbers and pictures (as url()) only;
//                         {{brand_primary}} / {{brand_accent}} become the store's colours. The store's other colours
//                         are CSS variables a section may use: var(--sf-primary), --sf-accent, --sf-text, --sf-muted,
//                         --sf-surface, --sf-soft, --sf-line, --sf-radius, --sf-font-head …
//   renderCustom(def, values, scope) → { html, css, removed }   all three steps, for the storefront and previews
//   customProblem(def) → '' or what is wrong (no name, a field without a key, two fields with one key …)
//   checkCss(css, { max }) → { ok, problems: [plain words], css }   the strict check for the shop's own CSS (Online Store ›
//                         Snippets and Theme › Custom CSS, Batch C step 8): refused, not cleaned, when it has tags,
//                         backslash escapes, @import or any at-rule but @media / @supports / @keyframes, url() to
//                         another site, expression() / behavior / -moz-binding / javascript:, attr(), attribute
//                         selectors that can read what is typed (value, placeholder, ^= $= *= ~= |=) or
//                         position:fixed; `css` is the passing CSS scoped under .sf-theme (the storefront only)
//
// The server must run the same allow-list again when it saves (a browser can be bypassed).

export const CUSTOM_FIELD_TYPES = [['text', 'Text'], ['area', 'Longer text'], ['image', 'Picture'], ['link', 'Link'], ['color', 'Colour'], ['number', 'Number']];
export const CUSTOM_LIMITS = { html: 20000, css: 20000, fields: 12, customs: 20 };

const TAGS = new Set(['div', 'span', 'p', 'a', 'img', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 's', 'small', 'br', 'hr', 'section', 'article', 'header', 'footer', 'aside', 'nav', 'figure', 'figcaption', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'picture', 'source', 'details', 'summary', 'mark', 'time', 'sup', 'sub', 'dl', 'dt', 'dd']);
const VOID = new Set(['img', 'br', 'hr', 'source']);
// whole elements dropped with what is inside them
const DROP = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button', 'svg', 'math', 'template', 'noscript', 'link', 'meta', 'base', 'frame', 'frameset', 'applet', 'audio', 'video', 'canvas', 'title', 'head'];
const ATTRS = new Set(['class', 'href', 'src', 'srcset', 'alt', 'title', 'width', 'height', 'loading', 'target', 'role', 'style', 'colspan', 'rowspan', 'datetime', 'open', 'media', 'type', 'sizes']);

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const unesc = (s) => String(s).replace(/&#x([0-9a-f]+);?/gi, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/&#(\d+);?/g, (_, d) => String.fromCharCode(Number(d))).replace(/&colon;/gi, ':').replace(/&tab;|&newline;/gi, '');
/** A link or picture address a customer may follow: /path, #anchor, https://, http://, mailto:, tel: (pictures: /, https). */
export function safeUrl(v, kind = 'link') {
  const s = unesc(String(v || '').trim()).replace(/[\u0000-\u001f\u007f\s]+/g, '');
  if (!s) return '';
  if (/^(\/(?!\/)|#|\.\/)/.test(s)) return String(v).trim();
  if (kind === 'image') return /^https:\/\//i.test(s) ? String(v).trim() : '';
  return /^(https?:\/\/|mailto:|tel:)/i.test(s) ? String(v).trim() : '';
}
/** Inline style / declarations without the dangerous parts. */
function cleanDecls(text, removed) {
  let t = String(text || '');
  if (/expression\s*\(|behavior\s*:|-moz-binding|javascript:/i.test(t)) { removed.add('code inside styles'); t = t.replace(/expression\s*\([^)]*\)|behavior\s*:[^;]*;?|-moz-binding\s*:[^;]*;?|javascript:[^;)'"]*/gi, ''); }
  t = t.replace(/url\(\s*(['"]?)([^'")]*)\1\s*\)/gi, (m, q, u) => (/^(https:\/\/|\/assets\/|\/(?!\/))/i.test(u.trim()) && !/^\s*\/\//.test(u) ? m : (removed.add('pictures from unsafe addresses'), 'none')));
  if (/position\s*:\s*(fixed|sticky)/i.test(t)) { removed.add('fixed positioning (it could cover the page)'); t = t.replace(/position\s*:\s*(fixed|sticky)/gi, 'position:relative'); }
  return t;
}

/** The allow-listed HTML and a plain list of what was taken out. */
export function sanitizeHtml(input) {
  const removed = new Set();
  let h = String(input || '');
  if (/<!--/.test(h)) h = h.replace(/<!--[\s\S]*?(-->|$)/g, '');
  DROP.forEach((t) => {
    const re = new RegExp(`<${t}\\b[\\s\\S]*?(<\\/${t}\\s*>|$)`, 'gi');
    if (re.test(h)) { removed.add(t === 'script' ? 'scripts' : t === 'style' ? 'style tags (put CSS in the CSS box)' : `<${t}>`); h = h.replace(new RegExp(`<${t}\\b[\\s\\S]*?(<\\/${t}\\s*>|$)`, 'gi'), ''); }
    const lone = new RegExp(`<\\/?${t}\\b[^>]*>`, 'gi');
    if (lone.test(h)) { h = h.replace(new RegExp(`<\\/?${t}\\b[^>]*>`, 'gi'), ''); }
  });
  const out = [];
  let i = 0;
  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*\/?>/g;
  let m;
  while ((m = tagRe.exec(h))) {
    out.push(h.slice(i, m.index).replace(/</g, '&lt;'));
    i = tagRe.lastIndex;
    const name = m[1].toLowerCase();
    const closing = m[0][1] === '/';
    if (!TAGS.has(name)) { removed.add(`<${name}>`); continue; }
    if (closing) { if (!VOID.has(name)) out.push(`</${name}>`); continue; }
    const attrs = [];
    let ext = false;
    const aRe = /([^\s"'>/=]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
    let a;
    while ((a = aRe.exec(m[2] || ''))) {
      const key = a[1].toLowerCase();
      let val = a[3] != null ? a[3] : a[4] != null ? a[4] : a[5] != null ? a[5] : '';
      if (key.startsWith('on')) { removed.add('event handlers (onclick …)'); continue; }
      if (!ATTRS.has(key) && !key.startsWith('aria-') && !key.startsWith('data-')) { removed.add(`the ${key} attribute`); continue; }
      if (key === 'href') { const u = safeUrl(val, 'link'); if (!u) { removed.add('unsafe links'); continue; } val = u; if (/^https?:\/\//i.test(u)) ext = true; }
      if (key === 'src') { const u = safeUrl(val, 'image'); if (!u) { removed.add('pictures from unsafe addresses'); continue; } val = u; }
      if (key === 'srcset') { if (val.split(',').some((part) => !safeUrl(part.trim().split(/\s+/)[0], 'image'))) { removed.add('pictures from unsafe addresses'); continue; } }
      if (key === 'style') val = cleanDecls(val, removed);
      if (key === 'target') continue;   // set below for outside links
      attrs.push(` ${key}="${esc(unesc(val))}"`);
    }
    if (name === 'a' && ext) attrs.push(' target="_blank" rel="noopener noreferrer"');
    if (name === 'img' && !attrs.some((x) => x.startsWith(' loading='))) attrs.push(' loading="lazy"');
    out.push(`<${name}${attrs.join('')}>`);
  }
  out.push(h.slice(i).replace(/</g, '&lt;'));
  return { html: out.join(''), removed: [...removed] };
}

/** Prefix every selector with `.scope`; @media / @supports keep their rules (also prefixed); other at-rules go. */
export function scopeCss(input, scope) {
  const removed = new Set();
  let css = String(input || '').replace(/\/\*[\s\S]*?\*\//g, '');
  if (/@import/i.test(css)) { removed.add('@import (no other files)'); css = css.replace(/@import[^;]*;?/gi, ''); }
  css = cleanDecls(css, removed);
  if (/<\/?style/i.test(css)) { removed.add('style tags'); css = css.replace(/<\/?style[^>]*>/gi, ''); }
  const pre = (sel) => sel.split(',').map((s) => s.trim()).filter(Boolean).map((s) => (/^(:root|html|body)\b/i.test(s) ? `.${scope}${s.replace(/^(:root|html|body)/i, '')}` : s === ':scope' || s === '&' ? `.${scope}` : `.${scope} ${s}`)).join(',');
  // walk the text: selector { decls }  or  @media … { rules }
  const walk = (text) => {
    let out = '';
    let i = 0;
    while (i < text.length) {
      const open = text.indexOf('{', i);
      if (open < 0) break;
      const head = text.slice(i, open).trim();
      // find the matching close brace
      let depth = 1; let j = open + 1;
      while (j < text.length && depth) { if (text[j] === '{') depth++; else if (text[j] === '}') depth--; j++; }
      const body = text.slice(open + 1, j - 1);
      if (/^@(media|supports|container)\b/i.test(head)) out += `${head}{${walk(body)}}`;
      else if (/^@keyframes\b/i.test(head)) out += `@keyframes ${scope}-${head.replace(/^@keyframes\s*/i, '').trim()}{${body}}`;
      else if (head.startsWith('@')) removed.add(head.split(/\s/)[0]);
      else if (head) out += `${pre(head)}{${body.replace(/[{}]/g, '')}}`;
      i = j;
    }
    return out;
  };
  let out = walk(css);
  // animations name the scoped keyframes
  out = out.replace(/(animation(?:-name)?\s*:\s*)([a-zA-Z_][\w-]*)/g, (m, a, n) => (/^(none|initial|inherit|unset)$/.test(n) ? m : `${a}${scope}-${n}`));
  return { css: out, removed: [...removed] };
}

/** {{key}} in the HTML → the field's value (escaped; links, pictures, colours and numbers checked). */
export function fillTemplate(html, fields = [], values = {}) {
  const byKey = Object.fromEntries((fields || []).map((f) => [f.key, f]));
  return String(html || '').replace(/\{\{\s*([a-zA-Z][\w-]*)\s*\}\}/g, (m, key) => {
    const f = byKey[key];
    if (!f) return m;   // the shop's own tokens ({{shop_name}} …) are filled when a design file is applied
    const raw = values && values[key] != null && values[key] !== '' ? values[key] : f.default;
    const v = String(raw == null ? '' : raw);
    if (f.type === 'link') return esc(safeUrl(v, 'link') || '#');
    if (f.type === 'image') return esc(safeUrl(v, 'image'));
    if (f.type === 'color') return /^#[0-9a-f]{3,8}$/i.test(v) ? v : '';
    if (f.type === 'number') return /^-?\d+(\.\d+)?$/.test(v) ? v : '';
    if (f.type === 'area') return esc(v).replace(/\n/g, '<br>');
    return esc(v);
  });
}

/** {{key}} in the CSS: only colour and number settings (anything else could break out of the rule) and the brand colours. */
export function fillCss(css, fields = [], values = {}) {
  const byKey = Object.fromEntries((fields || []).map((f) => [f.key, f]));
  return String(css || '').replace(/\{\{\s*([a-zA-Z][\w-]*)\s*\}\}/g, (m, key) => {
    const f = byKey[key];
    if (!f) return key === 'brand_primary' ? 'var(--sf-primary)' : key === 'brand_accent' ? 'var(--sf-accent)' : '';
    const raw = values && values[key] != null && values[key] !== '' ? values[key] : f.default;
    const v = String(raw == null ? '' : raw).trim();
    if (f.type === 'color') return /^#[0-9a-f]{3,8}$/i.test(v) ? v : 'transparent';
    if (f.type === 'number') return /^-?\d+(\.\d+)?$/.test(v) ? v : '0';
    if (f.type === 'image') { const u = safeUrl(v, 'image'); return u && !/[()'"\\\s]/.test(u) ? `url(${u})` : 'none'; }
    return '';
  });
}

/** A custom section ready to draw: its HTML (filled, then allow-listed) and its CSS (scoped). */
export function renderCustom(def, values = {}, scope = '') {
  if (!def) return { html: '', css: '', removed: [] };
  const sc = scope || 'sfc-' + String(def.id || 'x').replace(/[^\w-]/g, '');
  const h = sanitizeHtml(fillTemplate(def.html, def.fields, values));
  const c = scopeCss(fillCss(def.css, def.fields, values), sc);
  return { html: h.html, css: c.css, removed: [...new Set([...h.removed, ...c.removed])], scope: sc };
}

/** '' or what is wrong with a custom section's definition. */
export function customProblem(def) {
  if (!def || !String(def.name || '').trim()) return 'Name the section.';
  if (!String(def.html || '').trim()) return 'Write the HTML.';
  if (String(def.html).length > CUSTOM_LIMITS.html) return `The HTML is over ${CUSTOM_LIMITS.html.toLocaleString('en-US')} characters.`;
  if (String(def.css || '').length > CUSTOM_LIMITS.css) return `The CSS is over ${CUSTOM_LIMITS.css.toLocaleString('en-US')} characters.`;
  const fields = def.fields || [];
  if (fields.length > CUSTOM_LIMITS.fields) return `At most ${CUSTOM_LIMITS.fields} settings.`;
  const seen = new Set();
  for (const f of fields) {
    if (!/^[a-zA-Z][\w-]{0,30}$/.test(String(f.key || ''))) return `“${f.key || ''}” can’t be a setting key: letters, numbers, - and _, starting with a letter.`;
    if (/^(shop_|whatsapp$|brand_)/.test(f.key)) return `“${f.key}” is a shop detail; pick another key.`;
    if (seen.has(f.key)) return `Two settings use the key “${f.key}”.`;
    seen.add(f.key);
    if (!CUSTOM_FIELD_TYPES.some(([t]) => t === f.type)) return `“${f.type}” isn’t a setting type.`;
  }
  return '';
}

// ---- the strict check for the shop's own CSS (Batch C step 8) ---------------------------------------------------------
const CSS_AT_OK = /^@(media|supports|keyframes)\b/i;
/** Is this CSS safe to put on the storefront? Refuses rather than cleans, so what the shop saved is what runs. */
export function checkCss(input, { max = 20000 } = {}) {
  const problems = [];
  const add = (p) => { if (!problems.includes(p)) problems.push(p); };
  const raw = String(input || '');
  if (raw.length > max) add(`It is over ${max.toLocaleString('en-US')} characters.`);
  const css = raw.replace(/\/\*[\s\S]*?\*\//g, '');
  if (/\/\*/.test(css)) add('A comment is not closed (*/ missing).');
  if (/</.test(css)) add('No tags (< >) in CSS.');
  if (/\\/.test(css)) add('No backslash escapes (\\): they can hide other code.');
  if (/@import/i.test(css)) add('No @import: CSS can’t load other files.');
  (css.match(/@[a-z-]+/gi) || []).forEach((a) => { if (!CSS_AT_OK.test(a) && !/^@import$/i.test(a)) add(`${a} isn’t allowed (only @media, @supports and @keyframes).`); });
  (css.match(/url\(\s*(['"]?)([^'")]*)\1\s*\)/gi) || []).forEach((m) => {
    const u = m.replace(/^url\(\s*['"]?|['"]?\s*\)$/g, '').trim();
    if (!/^\/(?!\/)/.test(u)) add('url() can only use pictures from this store (/assets/…), not other sites.');
  });
  if (/url\(/i.test(css.replace(/url\(\s*(['"]?)([^'")]*)\1\s*\)/gi, ''))) add('A url() is not closed.');
  if (/expression\s*\(|behavior\s*:|-moz-binding|javascript:|vbscript:/i.test(css)) add('No expression(), behavior, -moz-binding or javascript: (they run code).');
  if (/\battr\s*\(/i.test(css)) add('No attr(): it can show what customers type.');
  (css.match(/\[[^\]]*\]/g) || []).forEach((sel) => {
    if (/[\^$*~|]=/.test(sel)) add(`${sel} can’t be used: selectors that match part of a value can read what customers type.`);
    else if (/\b(value|placeholder|data-value)\b/i.test(sel)) add(`${sel} can’t be used: it reads what customers type.`);
  });
  if (/position\s*:\s*fixed/i.test(css)) add('No position:fixed: it could cover the page.');
  let depth = 0;
  for (const ch of css) { if (ch === '{') depth++; else if (ch === '}') { depth--; if (depth < 0) break; } }
  if (depth !== 0) add('The { } braces don’t match.');
  if (problems.length) return { ok: false, problems, css: '' };
  return { ok: true, problems: [], css: scopeCss(css, 'sf-theme').css };
}
