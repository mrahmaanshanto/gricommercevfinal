// storefront/blocks — HTML blocks (Online Store › HTML blocks, A3): reusable content made with the blog's block editor
// (paragraphs, headings, lists, images, buttons, tables, FAQ …), placed in headers, layouts, mega menus, the footer and
// the product page's extra tab. One library: landing pages can use it later.
//
//   block  { id, name, type, blocks: [blog block], updatedAt }
//   BLOCK_KINDS (content · banner · mega · footer · tab · cattext) · kindOf(type)
//   getBlocks() · getBlock(id) · saveBlock(b) · newHtmlBlock(type) · duplicateBlock(id) · deleteBlock(id)
//   usedIn(id) → [{ where, href }] — the headers, layouts, menus (mega menu columns) and theme settings that show it
//   blocksOfType(type) — the picker lists (a footer picker shows footer blocks first, then the rest)

import { read, update, sfId } from './store';
import { newBlock } from '../blog';
import { elementsOf } from './headers';
import { getMenus } from '../storeMenus';

export const BLOCK_KINDS = [
  { type: 'content', label: 'Content', icon: 'file-text', hint: 'Any page part: text, pictures, buttons.' },
  { type: 'banner', label: 'Banner', icon: 'image', hint: 'A picture with a line and a button.' },
  { type: 'mega', label: 'Mega menu column', icon: 'columns-3', hint: 'One column of a mega menu.' },
  { type: 'footer', label: 'Footer', icon: 'panel-bottom', hint: 'The whole footer, instead of the footer layout.' },
  { type: 'tab', label: 'Product page tab', icon: 'panels-top-left', hint: 'An extra tab on every product page.' },
  { type: 'cattext', label: 'Category text', icon: 'text', hint: 'Text at the top or bottom of a category page.' },
];
export const kindOf = (type) => BLOCK_KINDS.find((k) => k.type === type) || BLOCK_KINDS[0];

export const getBlocks = () => (read().blocks || []).slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
export const getBlock = (id) => (read().blocks || []).find((b) => b.id === id) || null;
/** Blocks for a picker: this type first, then the others. */
export const blocksOfType = (type) => { const all = getBlocks(); return type ? [...all.filter((b) => b.type === type), ...all.filter((b) => b.type !== type)] : all; };

export function newHtmlBlock(type = 'content') {
  return { id: sfId('blk'), name: '', type: kindOf(type).type, blocks: [newBlock('p')], updatedAt: 0 };
}
/** Insert or replace a block. Returns the saved block. */
export function saveBlock(b) {
  const saved = { ...b, name: String(b.name || '').trim() || 'Untitled block', updatedAt: Date.now() };
  update((d) => {
    const list = d.blocks || [];
    const i = list.findIndex((x) => x.id === b.id);
    if (i >= 0) list[i] = saved; else list.unshift(saved);
    d.blocks = list;
  });
  return saved;
}
export function duplicateBlock(id) {
  const src = getBlock(id);
  if (!src) return null;
  const copy = JSON.parse(JSON.stringify(src));
  return saveBlock({ ...copy, id: sfId('blk'), name: 'Copy of ' + src.name, blocks: copy.blocks.map((x) => ({ ...x, id: sfId('b') })) });
}
/** Delete a block; the places that showed it simply show nothing there. */
export function deleteBlock(id) {
  update((d) => {
    d.blocks = (d.blocks || []).filter((b) => b.id !== id);
    const off = (v) => (v && v.footerBlock === id ? { ...v, footerBlock: '', footerSource: 'layout' } : v && v.tabBlock === id ? { ...v, tabBlock: '' } : v);
    if (d.theme) d.theme = { ...d.theme, draft: off(d.theme.draft), live: off(d.theme.live) };
  });
}

/** Where a block shows: headers, layouts, the theme's footer / product tab and mega menus. */
export function usedIn(id, menus = getMenus()) {
  if (!id) return [];
  const d = read();
  const out = [];
  (d.headers || []).forEach((h) => {
    const hit = [h.doc.draft, h.doc.live].some((H) => elementsOf(H).some((e) => e.type === 'html' && e.block === id));
    if (hit) out.push({ where: 'Header · ' + h.name, href: '/header-builder?id=' + h.id });
  });
  (d.layouts || []).forEach((l) => {
    const hit = [l.doc.draft, l.doc.live].some((x) => ((x && x.sections) || []).some((s) => s.type === 'html' && s.block === id));
    if (hit) out.push({ where: 'Layout · ' + l.name, href: '/layout-edit?id=' + l.id });
  });
  const t = d.theme || {};
  if ([t.draft, t.live].some((v) => v && v.footerSource === 'block' && v.footerBlock === id)) out.push({ where: 'Theme · Footer', href: '/theme-editor?group=footer' });
  if ([t.draft, t.live].some((v) => v && v.tabBlock === id)) out.push({ where: 'Theme · Product page tab', href: '/theme-editor?group=product' });
  (menus || []).forEach((m) => (m.items || []).forEach((it) => {
    if (it.mega && it.mega.on && (it.mega.cols || []).some((c) => c.kind === 'block' && c.block === id)) out.push({ where: `Menu · ${m.name} › ${it.label}`, href: '/store-menus?menu=' + m.id });
  }));
  return out;
}
