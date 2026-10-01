// translateDom — the Bangla interface for every page without rewriting 190 screens (docs/ux-audit.md G).
// When the language is Bangla, visible text and the placeholder / aria-label / title of controls that exactly
// match an entry in src/lib/i18n/bn.js (or one of its number patterns) are swapped; switching back restores
// the English. Data never changes: input values are left alone, and an <option> without a value keeps its
// English value. The shell (menu, top bar) translates itself (src/shell/i18n.js); Help has its own Bangla.
// Skip a part of a page with data-no-translate, or by marking it lang="bn" (already Bangla).

import { BN, BN_PATTERNS } from '../lib/i18n/bn';
import { getLocale } from './ui';

const ATTRS = ['placeholder', 'aria-label', 'title'];
const CONTROLS = 'button,a,input,select,textarea,[role=button],[role=tab],[role=menuitem],[role=switch],[role=checkbox]';
const SKIP = 'script,style,noscript,textarea,code,pre,[contenteditable="true"],[data-no-translate],body [lang="bn"],.gc-sheet .hp-sec';

const textOrig = new Map(); // text node → English
const attrOrig = new Map(); // element → { attr: English }
let on = false;
let obs = null;
let queued = new Set();
let timer = 0;

function lookup(raw) {
  const t = raw.replace(/\s+/g, ' ').trim();
  if (!t || t.length > 140 || !/[A-Za-z]/.test(t)) return null;
  if (Object.prototype.hasOwnProperty.call(BN, t)) return BN[t];
  for (const [re, fn] of BN_PATTERNS) { const m = re.exec(t); if (m) return fn(m); }
  return null;
}
const keep = (raw, out) => { const lead = raw.match(/^\s*/)[0]; const trail = raw.match(/\s*$/)[0]; return lead + out + trail; };

function skipped(el) { return !el || (el.closest && el.closest(SKIP)); }

function doText(node) {
  const parent = node.parentElement;
  if (!parent || skipped(parent)) return;
  const now = node.nodeValue;
  const had = textOrig.get(node);
  // our own write coming back, or nothing to do
  if (had != null && now === keep(had, lookup(had) || had)) return;
  const bn = lookup(now);
  if (bn == null || bn === now.trim()) { if (had != null) textOrig.delete(node); return; }
  if (parent.tagName === 'OPTION' && !parent.hasAttribute('value')) parent.setAttribute('value', parent.textContent);
  textOrig.set(node, now);
  node.nodeValue = keep(now, bn);
}

function doAttrs(el) {
  if (skipped(el)) return;
  for (const a of ATTRS) {
    if (!el.hasAttribute(a)) continue;
    // aria-label only on controls: landmarks and groups keep theirs (print and layout rules may select them)
    if (a === 'aria-label' && !el.matches(CONTROLS)) continue;
    const v = el.getAttribute(a);
    const saved = attrOrig.get(el) || {};
    if (saved[a] != null && v === lookup(saved[a])) continue;
    const bn = lookup(v);
    if (bn == null || bn === v) continue;
    saved[a] = v; attrOrig.set(el, saved);
    el.setAttribute(a, bn);
  }
}

function walk(root) {
  if (!root) return;
  if (root.nodeType === 3) { doText(root); return; }
  if (root.nodeType !== 1 || skipped(root)) return;
  doAttrs(root);
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.nodeType === 1 && n.matches(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  let n = tw.nextNode();
  while (n) { if (n.nodeType === 3) doText(n); else doAttrs(n); n = tw.nextNode(); }
}

function flush() {
  timer = 0;
  const list = [...queued]; queued = new Set();
  list.forEach((n) => { if (n.isConnected) walk(n); });
  // forget nodes React has removed
  if (textOrig.size > 4000) [...textOrig.keys()].forEach((k) => { if (!k.isConnected) textOrig.delete(k); });
}
function queue(n) { queued.add(n); if (!timer) timer = window.setTimeout(flush, 60); }

function start() {
  if (on) return;
  on = true;
  document.documentElement.classList.add('gc-bn');
  walk(document.body);
  obs = new MutationObserver((muts) => {
    muts.forEach((m) => {
      if (m.type === 'characterData') queue(m.target);
      else if (m.type === 'attributes') queue(m.target);
      else m.addedNodes.forEach(queue);
    });
  });
  obs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
}

function stop() {
  if (!on) return;
  on = false;
  if (obs) obs.disconnect();
  obs = null;
  document.documentElement.classList.remove('gc-bn');
  textOrig.forEach((en, node) => { if (node.isConnected) node.nodeValue = en; });
  attrOrig.forEach((saved, el) => { if (el.isConnected) Object.entries(saved).forEach(([a, v]) => el.setAttribute(a, v)); });
  textOrig.clear(); attrOrig.clear();
}

let started = false;
/** Start following the language switch (called once from Overlays). */
export function startTranslator() {
  if (started || typeof window === 'undefined') return;
  started = true;
  const apply = () => (getLocale() === 'bn' ? start() : stop());
  window.addEventListener('gc:locale', apply);
  // after hydration, so the server HTML and the first client render still match
  if ('requestIdleCallback' in window) window.requestIdleCallback(apply, { timeout: 800 }); else window.setTimeout(apply, 200);
}
