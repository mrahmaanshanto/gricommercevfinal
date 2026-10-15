'use client';
// Menus — Online Store › Menus (/store-menus): the links in the website's header and footer, like Shopify's Navigation.
//   Menu tabs     Main menu (header) · Footer menu · Customer care · menus you add (footer columns)
//   The menu      its name; each item with a drag handle, its label and where it goes (a warning when the page or
//                 product is gone or not live); move up / down (or drag), put under the item above (one level) or back
//                 out, edit, remove (with undo; an item with sub-items asks first). Add menu item at the end.
//   Item panel    label, link to: home page · a page · a category · a product · the offers page · the blog (or a post) ·
//                 a web address, chosen from the store's real pages, categories, products and posts
//   Save bar      changes are kept on the page until Save menu; Discard puts the saved menu back
//   Preview       the header's links (sub-items in a drop-down, or the mega menu) and the footer's columns, as you edit
//   Mega menu     (Module A · A5) a top item of the header menu can open a mega menu: width (same as the page / full /
//                 custom), 2–5 columns (category list, link list = its sub-items, image banner, HTML block) and an
//                 optional promo picture; phones show the sub-items as a normal list. Set in the item panel.
// ?menu=<id> opens that menu. Front end only: data from src/lib/storeMenus.js; the live theme would draw the menus.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, Dialog, EmptyState, StatusBadge } from '@/components/ui';
import { ShopHeader, IndexTabs, LearnMore } from '@/components/ui/IndexKit';
import {
  saveMenu, addMenu, deleteMenu, newItem, LINK_TYPES, linkTypeOf, linkTargets, resolveLink, urlProblem,
  MEGA_WIDTHS, MEGA_KINDS, newMegaColumn, blankMega, megaProblem,
} from '@/lib/storeMenus';
import { getBlock } from '@/lib/storefront/blocks';
import { catChildren, catByPath } from '@/lib/storefront/catalog';
import { ImagePick, BlockPick, CatPick, SFB_CSS } from './sfShared';
import { StoreFrame, useStoreMenus, queryParam } from './storeShared';

const clone = (x) => JSON.parse(JSON.stringify(x));
const count = (items) => (items || []).reduce((n, it) => n + 1 + (it.children || []).length, 0);

const CSS = SFB_CSS + `
.mn-name{display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-3);padding:var(--space-4) var(--space-4) 0}
.mn-name>div{flex:1 1 240px;min-width:0}
.mn-list{display:flex;flex-direction:column;gap:var(--space-2);margin:0;padding:var(--space-4);list-style:none}
.mn-kids{display:flex;flex-direction:column;gap:var(--space-2);margin:var(--space-2) 0 0 var(--space-6);padding:0 0 0 var(--space-3);list-style:none;border-left:2px solid var(--border-subtle)}
.mn-row{display:flex;align-items:center;gap:var(--space-2);min-height:48px;padding:var(--space-1) var(--space-1) var(--space-1) var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.mn-row.is-drag{opacity:.45}
.mn-row.is-over{border-color:var(--primary);box-shadow:0 -2px 0 0 var(--primary)}
.mn-grip{display:grid;place-items:center;width:24px;height:32px;flex:none;color:var(--text-muted);cursor:grab}
.mn-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.mn-text b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mn-to{display:flex;align-items:center;gap:6px;min-width:0;font-size:var(--text-xs);color:var(--text-muted)}
.mn-to span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mn-to.is-bad{color:var(--text-danger)}
.mn-to.is-warn{color:var(--text-warning)}
.mn-acts{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:2px}
.mn-acts .ix-btn[disabled]{opacity:.35}
.mn-add{padding:0 var(--space-4) var(--space-4)}
.mn-bar{position:sticky;top:var(--header-height);z-index:20;display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);padding:var(--space-2) var(--space-3);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-card)}
.mn-bar>span{flex:1 1 180px;font-size:var(--text-sm);color:var(--text-heading)}
.mn-form{display:flex;flex-direction:column;gap:var(--space-4)}
.mn-url{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted);overflow-wrap:anywhere}
/* preview */
.mn-pv{padding:var(--space-4);display:flex;flex-direction:column;gap:var(--space-3)}
.mn-pv h3{margin:0;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.mn-site{border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:visible;background:var(--surface-card)}
.mn-hdr{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-5);padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.mn-logo{display:flex;align-items:center;gap:var(--space-2);font-weight:var(--weight-semibold);color:var(--text-heading)}
.mn-logo i{display:grid;place-items:center;width:28px;height:28px;border-radius:var(--radius-md);background:var(--primary);color:var(--text-on-dark);font-style:normal;font-size:var(--text-xs)}
.mn-nav{display:flex;flex-wrap:wrap;gap:var(--space-1) var(--space-4);margin:0;padding:0;list-style:none}
.mn-nav>li{position:relative}
.mn-nav>li>span{display:inline-flex;align-items:center;gap:2px;padding:var(--space-1) 0;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body);cursor:default}
.mn-nav>li:hover>span,.mn-nav>li:focus-within>span{color:var(--primary)}
.mn-drop{position:absolute;left:0;top:100%;z-index:5;display:none;min-width:180px;margin:0;padding:var(--space-1);list-style:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-lg)}
.mn-nav>li:hover .mn-drop,.mn-nav>li:focus-within .mn-drop,.mn-drop.is-open{display:block}
.mn-drop li{padding:var(--space-1) var(--space-2);font-size:var(--text-sm);color:var(--text-body);white-space:nowrap}
.mn-ftr{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:var(--space-4);padding:var(--space-4);border-radius:var(--radius-lg);background:var(--navy-900);color:var(--text-on-dark)}
.mn-ftr b{display:block;margin-bottom:var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-semibold)}
.mn-ftr ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:var(--space-1)}
.mn-ftr li{font-size:var(--text-xs);opacity:.85}
.mn-ftr .is-cur{outline:1px dashed currentColor;outline-offset:4px;border-radius:var(--radius-md)}
@media (min-width:1025px){.mn-side{position:sticky;top:calc(var(--header-height) + var(--space-4));align-self:flex-start}}
.mn-off{text-decoration:line-through;opacity:.6}
.mn-mega{position:absolute;left:0;right:0;top:100%;z-index:6;display:none;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:0 0 var(--radius-lg) var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-lg)}
.mn-nav>li.is-mega{position:static}
.mn-site,.mn-hdr{position:relative}
.mn-nav>li:hover .mn-mega,.mn-nav>li:focus-within .mn-mega,.mn-mega.is-open{display:grid;gap:var(--space-3)}
.mn-mega b{display:block;margin-bottom:4px;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.mn-mega ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:2px;font-size:var(--text-xs);color:var(--text-body)}
.mn-mega img{width:100%;height:56px;object-fit:cover;border-radius:var(--radius-md)}
.mn-mega small{font-size:var(--text-xs);color:var(--text-muted)}
.mn-megapv{display:flex;flex-direction:column;gap:var(--space-2)}
.mn-megapv .mn-mega{position:static;display:grid;border-radius:var(--radius-lg)}
.mn-megaform{display:flex;flex-direction:column;gap:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--border-subtle)}
.mn-col{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.mn-colhead{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
@media (max-width:640px){.mn-row{flex-wrap:wrap}.mn-text{flex-basis:calc(100% - 40px)}.mn-acts{width:100%;justify-content:flex-start}.mn-kids{margin-left:var(--space-3)}.mn-bar{position:static}}
`;

// ---- tree helpers (top level + one level of children) -------------------------------------------------
function locate(items, id) {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) return { parent: null, index: i };
    const kids = items[i].children || [];
    for (let j = 0; j < kids.length; j++) if (kids[j].id === id) return { parent: items[i].id, pIndex: i, index: j };
  }
  return null;
}
const findItem = (items, id) => { const at = locate(items, id); if (!at) return null; return at.parent ? items[at.pIndex].children[at.index] : items[at.index]; };
function takeOut(items, id) {
  const at = locate(items, id);
  if (!at) return { items, item: null };
  const next = clone(items);
  const item = at.parent ? next[at.pIndex].children.splice(at.index, 1)[0] : next.splice(at.index, 1)[0];
  return { items: next, item };
}

// ---- the item panel -----------------------------------------------------------------------------------
/** The mega menu part of the item panel (top items of the header menu). */
function MegaForm({ mega, onChange, kids, item }) {
  const m = mega || { on: false };
  const set = (patch) => onChange({ ...m, ...patch });
  // a new mega menu's category column starts with the item's own category
  const startMega = () => { const b = blankMega(); if (item && item.type === 'category' && item.ref) b.cols[0] = { ...b.cols[0], ref: item.ref }; return b; };
  const setCol = (i, patch) => set({ cols: m.cols.map((c, j) => (j === i ? { ...c, ...patch } : c)) });
  const moveCol = (i, dir) => { const j = i + dir; if (j < 0 || j >= m.cols.length) return; const l = m.cols.slice(); [l[i], l[j]] = [l[j], l[i]]; set({ cols: l }); };
  return (
    <div className="mn-megaform">
      <div className="sfb-row"><span id="mn-mega-on">Open a mega menu</span><button type="button" role="switch" className="gc-switch" aria-checked={!!m.on} aria-labelledby="mn-mega-on" onClick={() => onChange(m.on ? { ...m, on: false } : (m.cols ? { ...m, on: true } : startMega()))}><span className="gc-switch__knob" /></button></div>
      {m.on ? (<>
        <p className="sfb-muted">On a computer the item opens a wide panel of columns. Phones show {kids ? 'its sub-items' : 'the item'} as a normal list.</p>
        {item && item.preview ? <div className="mn-megapv"><p className="gc-label" style={{ margin: 0 }}>Preview</p><MegaPreview it={{ ...item.preview, mega: m }} open /></div> : null}
        <div className="sfb-two">
          <div className="sfb-field"><label className="gc-label" htmlFor="mn-mw">Width</label><select id="mn-mw" className="gc-input gc-select" value={m.width} onChange={(e) => set({ width: e.target.value })}>{MEGA_WIDTHS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          {m.width === 'custom' ? <div className="sfb-field"><label className="gc-label" htmlFor="mn-mpx">Width (px)</label><input id="mn-mpx" type="number" min={480} max={1600} step={20} className="gc-input" value={m.px} onChange={(e) => set({ px: Number(e.target.value) })} /></div> : null}
        </div>
        {(m.cols || []).map((c, i) => (
          <div key={c.id} className="mn-col">
            <div className="mn-colhead"><span>Column {i + 1}</span><span>
              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Move column ${i + 1} left`} disabled={i === 0} onClick={() => moveCol(i, -1)}><Icon name="arrow-left" width="16" height="16" /></button>
              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Move column ${i + 1} right`} disabled={i === m.cols.length - 1} onClick={() => moveCol(i, 1)}><Icon name="arrow-right" width="16" height="16" /></button>
              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Remove column ${i + 1}`} disabled={m.cols.length <= 2} onClick={() => set({ cols: m.cols.filter((_, j) => j !== i) })}><Icon name="trash-2" width="16" height="16" /></button>
            </span></div>
            <select className="gc-input gc-select" aria-label={`Column ${i + 1} shows`} value={c.kind} onChange={(e) => setCol(i, { kind: e.target.value })}>{MEGA_KINDS.map((k) => <option key={k.kind} value={k.kind}>{k.label}</option>)}</select>
            <input className="gc-input" aria-label={`Column ${i + 1} title`} placeholder="Title (optional)" value={c.title || ''} onChange={(e) => setCol(i, { title: e.target.value })} />
            {c.kind === 'cats' ? <CatPick id={'mn-c' + i} value={c.ref} top onChange={(x) => setCol(i, { ref: x })} /> : null}
            {c.kind === 'links' ? <p className="sfb-muted">{kids ? `Shows the ${kids} sub-item${kids === 1 ? '' : 's'} of this item.` : 'Add sub-items to this item to fill this column.'}</p> : null}
            {c.kind === 'image' ? <><ImagePick id={'mn-i' + i} value={c.src} allowNone={false} onChange={(x) => setCol(i, { src: x })} /><input className="gc-input" aria-label={`Column ${i + 1} link`} placeholder="Link, e.g. /offers" value={c.href || ''} onChange={(e) => setCol(i, { href: e.target.value })} /></> : null}
            {c.kind === 'block' ? <BlockPick id={'mn-b' + i} value={c.block} type="mega" onChange={(x) => setCol(i, { block: x })} /> : null}
          </div>
        ))}
        {(m.cols || []).length < 5 ? <button type="button" className="ix-btn ix-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => set({ cols: [...(m.cols || []), newMegaColumn('cats')] })}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add a column</button> : null}
        <div className="sfb-field">
          <label className="gc-label" htmlFor="mn-promo">Promo picture (optional)</label>
          <ImagePick id="mn-promo" value={(m.promo && m.promo.src) || ''} onChange={(x) => set({ promo: x ? { ...(m.promo || {}), src: x } : null })} />
          {m.promo && m.promo.src ? <div className="sfb-two"><input className="gc-input" aria-label="Promo title" placeholder="Title" value={m.promo.title || ''} onChange={(e) => set({ promo: { ...m.promo, title: e.target.value } })} /><input className="gc-input" aria-label="Promo link" placeholder="Link" value={m.promo.href || ''} onChange={(e) => set({ promo: { ...m.promo, href: e.target.value } })} /></div> : null}
        </div>
      </>) : null}
    </div>
  );
}

function ItemSheet({ item, onClose, onApply, megaOk, kids, onDraft }) {
  const [f, setF] = useState(null);
  const [err, setErr] = useState({});
  const [targets, setTargets] = useState([]);
  useEffect(() => {
    if (!item) { setF(null); return; }
    setF({ label: item.label || '', type: item.link.type || 'page', ref: item.link.ref || '', url: item.link.url || '', auto: !item.label, mega: item.mega ? JSON.parse(JSON.stringify(item.mega)) : null });
    setErr({});
  }, [item]);
  useEffect(() => { if (f) setTargets(linkTargets(f.type)); }, [f && f.type]); // eslint-disable-line react-hooks/exhaustive-deps
  // the preview beside the panel shows the mega menu as it is being built
  const megaKey = f && megaOk ? JSON.stringify(f.mega) : '';
  useEffect(() => { if (onDraft) onDraft(megaOk && f ? f.mega : null); }, [megaKey]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!item || !f) return <Sheet open={false} onClose={onClose} title="" />;
  const needsRef = ['page', 'category', 'product', 'blog'].includes(f.type);
  const titleOf = (type, ref) => (type === 'home' ? 'Home' : type === 'offers' ? 'Offers' : (linkTargets(type).find((t) => t.value === ref) || {}).label || '');
  const pickType = (type) => {
    const list = linkTargets(type);
    const ref = type === 'blog' ? '' : (list[0] && type !== 'page' && type !== 'product' && type !== 'category' ? list[0].value : '');
    setF((x) => ({ ...x, type, ref, label: x.auto ? (type === 'home' ? 'Home' : type === 'offers' ? 'Offers' : type === 'blog' ? 'Blog' : '') : x.label }));
  };
  const pickRef = (ref) => setF((x) => ({ ...x, ref, label: x.auto ? (x.type === 'blog' && !ref ? 'Blog' : titleOf(x.type, ref)) : x.label }));
  const link = { type: f.type, ...(needsRef ? { ref: f.ref } : {}), ...(f.type === 'url' ? { url: f.url.trim() } : {}) };
  const res = resolveLink(link);
  const submit = (e) => {
    e.preventDefault();
    const e2 = {};
    if (!f.label.trim()) e2.label = 'Enter the text people see.';
    if (needsRef && f.type !== 'blog' && !f.ref) e2.ref = `Choose a ${linkTypeOf(f.type).label.toLowerCase()}.`;
    if (f.type === 'url') { const p = urlProblem(f.url); if (p) e2.url = p; }
    const mp = megaOk ? megaProblem(f.mega) : '';
    if (mp) e2.mega = mp;
    setErr(e2);
    if (e2.mega && Object.keys(e2).length === 1) { toast(e2.mega, { tone: 'error' }); return; }
    if (Object.keys(e2).length) { const first = document.getElementById(e2.label ? 'mn-label' : e2.ref ? 'mn-ref' : 'mn-urlin'); if (first) first.focus(); return; }
    onApply({ ...item, label: f.label.trim(), link, ...(megaOk ? { mega: f.mega && f.mega.on ? f.mega : f.mega ? { ...f.mega, on: false } : undefined } : {}) });
  };
  return (
    <Sheet open title={item.label ? `Edit “${item.label}”` : 'Add menu item'} onClose={onClose}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" form="mn-item-form" className="gc-btn gc-btn--solid">Done</button></>}>
      <form id="mn-item-form" className="mn-form" onSubmit={submit} noValidate>
        <div>
          <label className="gc-label" htmlFor="mn-type">Link to</label>
          <select id="mn-type" className="gc-input gc-select" value={f.type} onChange={(e) => pickType(e.target.value)}>
            {LINK_TYPES.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}
          </select>
        </div>
        {needsRef ? (
          <div>
            <label className="gc-label" htmlFor="mn-ref">{f.type === 'blog' ? 'Blog or post' : linkTypeOf(f.type).label} {f.type === 'blog' ? '' : '*'}</label>
            <select id="mn-ref" className={'gc-input gc-select' + (err.ref ? ' gc-input--error' : '')} value={f.ref} onChange={(e) => pickRef(e.target.value)}>
              {f.type !== 'blog' ? <option value="">Choose…</option> : null}
              {targets.map((t) => <option key={t.value || 'home'} value={t.value}>{t.label}{t.note ? ` · ${t.note}` : ''}</option>)}
            </select>
            {err.ref ? <p className="gc-help gc-help--error">{err.ref}</p> : f.type === 'page' ? <p className="gc-help"><Link href="/store-page-edit" className="bl-link">Add a new page</Link></p> : null}
          </div>
        ) : null}
        {f.type === 'url' ? (
          <div>
            <label className="gc-label" htmlFor="mn-urlin">Web address *</label>
            <input id="mn-urlin" className={'gc-input' + (err.url ? ' gc-input--error' : '')} value={f.url} placeholder="/collections/eid or https://…" style={{ fontFamily: 'var(--font-data)' }} onChange={(e) => setF((x) => ({ ...x, url: e.target.value }))} />
            {err.url ? <p className="gc-help gc-help--error">{err.url}</p> : <p className="gc-help">Start with / for a page of your store, or https:// for another website.</p>}
          </div>
        ) : null}
        <div>
          <label className="gc-label" htmlFor="mn-label">Label *</label>
          <input id="mn-label" className={'gc-input' + (err.label ? ' gc-input--error' : '')} value={f.label} placeholder="What people see in the menu" onChange={(e) => setF((x) => ({ ...x, label: e.target.value, auto: false }))} data-autofocus />
          {err.label ? <p className="gc-help gc-help--error">{err.label}</p> : null}
        </div>
        {res.url && !res.broken ? <p className="mn-url">{res.url}</p> : null}
        {res.note && (f.type !== 'url' || f.url) && !(needsRef && !f.ref && f.type !== 'blog') ? <p className={'gc-help' + (res.broken ? ' gc-help--error' : '')} style={{ margin: 0 }}><Icon name="triangle-alert" width="14" height="14" aria-hidden="true" style={{ verticalAlign: 'middle' }} /> {res.note}</p> : null}
        {megaOk ? <MegaForm mega={f.mega} kids={kids} item={{ type: f.type, ref: f.ref, preview: { ...item, label: f.label || item.label } }} onChange={(mega) => setF((x) => ({ ...x, mega }))} /> : null}
      </form>
    </Sheet>
  );
}

// ---- preview ------------------------------------------------------------------------------------------
function MegaPreview({ it, open }) {
  const cols = it.mega.cols || [];
  return (
    <div className={'mn-mega' + (open ? ' is-open' : '')} style={{ gridTemplateColumns: `repeat(${cols.length + (it.mega.promo && it.mega.promo.src ? 1 : 0)},minmax(0,1fr))` }} aria-label={`${it.label} mega menu preview`}>
      {cols.map((c) => {
        if (c.kind === 'cats') { const top = catByPath(c.ref); const kids = catChildren(c.ref); return <div key={c.id}><b>{c.title || (top && top.name) || 'Category list'}</b><ul>{(kids.length ? kids : top ? [top] : []).slice(0, 6).map((k) => <li key={k.id}>{k.name}</li>)}</ul>{!c.ref ? <small>Choose a category</small> : null}</div>; }
        if (c.kind === 'links') return <div key={c.id}><b>{c.title || it.label}</b><ul>{(it.children || []).map((k) => <li key={k.id}>{k.label}</li>)}</ul>{!(it.children || []).length ? <small>No sub-items yet</small> : null}</div>;
        if (c.kind === 'image') return <div key={c.id}>{c.src ? <img src={c.src} alt="" /> : <small>Choose a picture</small>}{c.title ? <small>{c.title}</small> : null}</div>;
        const b = getBlock(c.block);
        return <div key={c.id}><b>{c.title || 'HTML block'}</b><small>{b ? b.name : 'Choose a block'}</small></div>;
      })}
      {it.mega.promo && it.mega.promo.src ? <div><img src={it.mega.promo.src} alt="" />{it.mega.promo.title ? <small>{it.mega.promo.title}</small> : null}</div> : null}
    </div>
  );
}

function Preview({ menus, working, openMega }) {
  const list = menus.map((m) => (working && m.id === working.id ? working : m));
  const header = list.find((m) => m.place === 'header');
  const footers = list.filter((m) => m.place === 'footer');
  const off = (it) => { const r = resolveLink(it.link); return r.broken || !!r.note; };
  const label = (it) => <span className={off(it) ? 'mn-off' : undefined} title={off(it) ? resolveLink(it.link).note : undefined}>{it.label}</span>;
  // a footer menu: items with sub-items become their own columns; the rest form one column under the menu's name
  const columns = [];
  footers.forEach((m) => {
    const loose = (m.items || []).filter((it) => !(it.children || []).length);
    if (loose.length) columns.push({ key: m.id, title: m.name, items: loose, cur: working && m.id === working.id });
    (m.items || []).filter((it) => (it.children || []).length).forEach((it) => columns.push({ key: it.id, title: it.label, items: it.children, cur: working && m.id === working.id }));
  });
  return (
    <section className="ix-card" aria-label="Preview">
      <div className="ix-card__head"><h2>Preview</h2><Link href="/page?handle=about-us" target="_blank" className="bl-link" style={{ fontSize: 'var(--text-xs)' }}>Open a store page</Link></div>
      <div className="mn-pv">
        <h3>Header</h3>
        <div className="mn-site">
          <div className="mn-hdr">
            <span className="mn-logo"><i aria-hidden="true">G</i>Dazzle Shop</span>
            <ul className="mn-nav" aria-label="Header menu preview">
              {header && header.items.length ? header.items.map((it) => (
                <li key={it.id} tabIndex={(it.children || []).length || (it.mega && it.mega.on) ? 0 : undefined} className={it.mega && it.mega.on ? 'is-mega' : undefined}>
                  <span>{label(it)}{(it.children || []).length || (it.mega && it.mega.on) ? <Icon name="chevron-down" width="14" height="14" aria-hidden="true" /> : null}</span>
                  {it.mega && it.mega.on ? <MegaPreview it={it} open={!!openMega && openMega === it.id} /> : (it.children || []).length ? <ul className="mn-drop">{it.children.map((c) => <li key={c.id}>{label(c)}</li>)}</ul> : null}
                </li>
              )) : <li><span className="ix-muted">No links yet</span></li>}
            </ul>
          </div>
        </div>
        <h3>Footer</h3>
        <div className="mn-ftr" aria-label="Footer menus preview">
          {columns.length ? columns.map((c) => (
            <div key={c.key} className={c.cur ? 'is-cur' : undefined}><b>{c.title}</b><ul>{c.items.map((it) => <li key={it.id}>{label(it)}</li>)}</ul></div>
          )) : <span>No footer links yet</span>}
        </div>
        <p className="gc-help" style={{ margin: 0 }}>Struck-through links don’t open on the website yet. Hover a header link to see its drop-down or mega menu.</p>
      </div>
    </section>
  );
}

// ---- the screen -----------------------------------------------------------------------------------------
export default function StoreMenus() {
  const { menus, ready } = useStoreMenus();
  const [cur, setCur] = useState('');
  const [work, setWork] = useState(null);       // the menu being edited (unsaved copy)
  const [savedJson, setSavedJson] = useState('');
  const [editing, setEditing] = useState(null);  // { item, parent, isNew }
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);
  const [adding, setAdding] = useState(null);    // new footer menu name
  const [megaDraft, setMegaDraft] = useState(null);
  const dirtyRef = useRef(false);

  // open a menu (first load: ?menu= or the main menu)
  useEffect(() => {
    if (!ready || cur) return;
    const want = queryParam('menu');
    const m = menus.find((x) => x.id === want) || menus[0];
    if (m) open(m);
  }, [ready, menus, cur]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = !!work && JSON.stringify(work) !== savedJson;
  dirtyRef.current = dirty;
  useEffect(() => {
    const onUnload = (e) => { if (dirtyRef.current) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, []);

  function open(m) {
    const c = clone(m);
    setCur(m.id); setWork(c); setSavedJson(JSON.stringify(c));
    try { window.history.replaceState(window.history.state, '', '/store-menus?menu=' + m.id); } catch { /* ignore */ }
  }
  const switchTo = async (m) => {
    if (m.id === cur) return;
    if (dirty && !(await confirmDialog({ title: `Discard changes to ${work.name}?`, body: 'The changes you made to this menu are not saved.', confirmLabel: 'Discard', tone: 'danger' }))) return;
    open(m);
  };
  const setItems = (items) => setWork((w) => ({ ...w, items }));

  // ---- item actions ----------------------------------------------------------------------------------
  const move = (id, dir) => {
    const at = locate(work.items, id);
    const next = clone(work.items);
    const sib = at.parent ? next[at.pIndex].children : next;
    const j = at.index + dir;
    if (j < 0 || j >= sib.length) return;
    [sib[at.index], sib[j]] = [sib[j], sib[at.index]];
    setItems(next);
    window.requestAnimationFrame(() => { const b = document.querySelector(`[data-item="${id}"] [data-act="${dir < 0 ? 'up' : 'down'}"]:not([disabled])`); if (b) b.focus(); });
  };
  const indent = (id) => {
    const at = locate(work.items, id);
    if (!at || at.parent || at.index === 0) return;
    const it = work.items[at.index];
    if ((it.children || []).length) { toast('An item with its own sub-items stays at the top level.', { tone: 'error' }); return; }
    const next = clone(work.items);
    const [moved] = next.splice(at.index, 1);
    next[at.index - 1].children = [...(next[at.index - 1].children || []), { ...moved, children: [] }];
    setItems(next);
    toast(`${moved.label} is now under ${next[at.index - 1].label}`);
  };
  const outdent = (id) => {
    const at = locate(work.items, id);
    if (!at || !at.parent) return;
    const next = clone(work.items);
    const [moved] = next[at.pIndex].children.splice(at.index, 1);
    next.splice(at.pIndex + 1, 0, { ...moved, children: [] });
    setItems(next);
  };
  const remove = async (id) => {
    const it = findItem(work.items, id);
    const kids = (it.children || []).length;
    if (kids && !(await confirmDialog({ title: `Remove “${it.label}” and its ${kids} sub-item${kids === 1 ? '' : 's'}?`, body: 'They come out of this menu when you save it.', confirmLabel: 'Remove', tone: 'danger' }))) return;
    const before = work.items;
    setItems(takeOut(work.items, id).items);
    toast(`${it.label} removed`, { undo: () => setItems(before) });
  };
  const apply = (item) => {
    const { parent, isNew } = editing;
    const next = clone(work.items);
    if (isNew) {
      if (parent) { const p = next.find((x) => x.id === parent); p.children = [...(p.children || []), { ...item, children: [] }]; } else next.push(item);
    } else {
      const at = locate(next, item.id);
      if (at.parent) next[at.pIndex].children[at.index] = { ...item, children: [] }; else next[at.index] = { ...next[at.index], label: item.label, link: item.link, ...('mega' in item ? { mega: item.mega } : {}) };
    }
    setItems(next);
    setEditing(null);
  };

  // ---- drag and drop: drop on an item = put the dragged one just before it, at its level -------------------
  const onDrop = (targetId) => {
    const id = drag;
    setDrag(null); setOver(null);
    if (!id || id === targetId) return;
    const dragged = findItem(work.items, id);
    const tAt = locate(work.items, targetId);
    if (!dragged || !tAt) return;
    if (tAt.parent && (dragged.children || []).length) { toast('An item with its own sub-items stays at the top level.', { tone: 'error' }); return; }
    if (tAt.parent === id) return;
    const { items: rest, item } = takeOut(work.items, id);
    const t2 = locate(rest, targetId);
    if (t2.parent) rest[t2.pIndex].children.splice(t2.index, 0, { ...item, children: [] }); else rest.splice(t2.index, 0, item);
    setItems(rest);
  };

  // ---- save / menus ----------------------------------------------------------------------------------
  const save = () => {
    if (!String(work.name || '').trim()) { toast('Give the menu a name.', { tone: 'error' }); const el = document.getElementById('mn-name'); if (el) el.focus(); return; }
    const saved = saveMenu(work);
    const c = clone(saved);
    setWork(c); setSavedJson(JSON.stringify(c));
    toast(`${saved.name} saved`);
  };
  const discard = () => { const m = menus.find((x) => x.id === cur); if (m) open(m); };
  const createMenu = (e) => {
    e.preventDefault();
    const name = String(adding || '').trim();
    if (!name) { toast('Enter a name for the menu.', { tone: 'error' }); return; }
    if (menus.some((m) => m.name.toLowerCase() === name.toLowerCase())) { toast(`There is already a menu called ${name}.`, { tone: 'error' }); return; }
    const m = addMenu(name);
    setAdding(null);
    open(m);
    toast(`${m.name} added to the footer`);
  };
  const removeMenu = async () => {
    const ok = await confirmDialog({ title: `Delete ${work.name}?`, body: 'Its links come off the website’s footer.', confirmLabel: 'Delete', tone: 'danger' });
    if (!ok) return;
    const name = work.name;
    deleteMenu(work.id);
    const first = menus.find((m) => m.id !== work.id);
    if (first) open(first);
    toast(`${name} deleted`);
  };

  const tabs = useMemo(() => menus.map((m) => ({ key: m.id, id: 'mn-tab-' + m.id, label: m.name, count: count(m.id === cur && work ? work.items : m.items), on: m.id === cur, onClick: () => switchTo(m) })), [menus, cur, work]); // eslint-disable-line react-hooks/exhaustive-deps

  const row = (it, i, sibs, parent) => {
    const r = resolveLink(it.link);
    const kids = it.children || [];
    const T = linkTypeOf(it.link.type);
    return (
      <li key={it.id}>
        <div className={'mn-row' + (drag === it.id ? ' is-drag' : '') + (over === it.id && drag && drag !== it.id ? ' is-over' : '')} data-item={it.id}
          draggable onDragStart={(e) => { setDrag(it.id); try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', it.id); } catch { /* ignore */ } }}
          onDragEnd={() => { setDrag(null); setOver(null); }} onDragOver={(e) => { if (drag) { e.preventDefault(); if (over !== it.id) setOver(it.id); } }} onDrop={(e) => { e.preventDefault(); onDrop(it.id); }}>
          <span className="mn-grip" title="Drag to move" aria-hidden="true"><Icon name="grip-vertical" width="16" height="16" /></span>
          <span className="mn-text">
            <b>{it.label}{it.mega && it.mega.on ? <> <StatusBadge tone="info">Mega menu</StatusBadge></> : null}</b>
            <span className={'mn-to' + (r.broken ? ' is-bad' : r.note ? ' is-warn' : '')}>
              <Icon name={r.broken || r.note ? 'triangle-alert' : T.icon} width="12" height="12" aria-hidden="true" />
              <span>{r.broken || r.note ? r.note : `${T.label} · ${r.url.replace(/^dazzleshop\.com\.bd/, '') || '/'}`}</span>
            </span>
          </span>
          <span className="mn-acts">
            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" data-act="up" aria-label={`Move ${it.label} up`} title="Move up" disabled={i === 0} onClick={() => move(it.id, -1)}><Icon name="arrow-up" width="16" height="16" /></button>
            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" data-act="down" aria-label={`Move ${it.label} down`} title="Move down" disabled={i === sibs.length - 1} onClick={() => move(it.id, 1)}><Icon name="arrow-down" width="16" height="16" /></button>
            {parent ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Move ${it.label} out to the top level`} title="Move out a level" onClick={() => outdent(it.id)}><Icon name="indent-decrease" width="16" height="16" /></button>
              : <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Put ${it.label} under the item above`} title="Put under the item above" disabled={i === 0 || kids.length > 0} onClick={() => indent(it.id)}><Icon name="indent-increase" width="16" height="16" /></button>}
            {!parent ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Add a sub-item under ${it.label}`} title="Add a sub-item" onClick={() => setEditing({ item: newItem(), parent: it.id, isNew: true })}><Icon name="plus" width="16" height="16" /></button> : null}
            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Edit ${it.label}`} title="Edit" onClick={() => setEditing({ item: it, parent, isNew: false })}><Icon name="pencil" width="16" height="16" /></button>
            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Remove ${it.label}`} title="Remove" onClick={() => remove(it.id)}><Icon name="trash-2" width="16" height="16" /></button>
          </span>
        </div>
        {kids.length ? <ul className="mn-kids" aria-label={`Under ${it.label}`}>{kids.map((c, j) => row(c, j, kids, it.id))}</ul> : null}
      </li>
    );
  };

  return (
    <StoreFrame screen="StoreMenus" active="store-menus" page="Menus" css={CSS}
      after={<>
        <ItemSheet item={editing ? editing.item : null} onClose={() => setEditing(null)} onApply={apply}
          megaOk={!!editing && !editing.parent && !!work && work.place === 'header'} kids={editing ? (editing.item.children || []).length : 0} onDraft={setMegaDraft} />
        <Dialog open={adding != null} title="Add a footer menu" onClose={() => setAdding(null)}>
          <form onSubmit={createMenu} className="mn-form" noValidate>
            <div><label className="gc-label" htmlFor="mn-new">Menu name</label><input id="mn-new" className="gc-input" value={adding || ''} placeholder="e.g. Our branches" onChange={(e) => setAdding(e.target.value)} data-autofocus /><p className="gc-help">It shows as a column of links in the website’s footer.</p></div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setAdding(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">Add menu</button></div>
          </form>
        </Dialog>
      </>}>
      <ShopHeader icon="menu" title="Menus"
        about="The links in your website's header and footer. The Main menu is the header; footer menus are the columns of links at the bottom. An item can hold one level of sub-items: a drop-down in the header, a column in the footer."
        more={[{ label: 'Add a footer menu', onClick: () => setAdding('') }, { label: 'Pages', href: '/store-pages' }]}
        primary={{ label: 'Add menu item', icon: 'plus', onClick: () => { if (work) setEditing({ item: newItem(), parent: null, isNew: true }); } }} />

      {dirty ? (
        <div className="mn-bar" role="status">
          <span>Unsaved changes to {work.name}</span>
          <button type="button" className="ix-btn" onClick={discard}>Discard</button>
          <button type="button" className="ix-btn ix-btn--primary" onClick={save}><Icon name="check" width="16" height="16" aria-hidden="true" />Save menu</button>
        </div>
      ) : null}

      <div className="ix-record">
      <div className="ix-main">
      <section className="ix-card" aria-label="Menu">
        <div className="ix-bar">
          {ready ? <IndexTabs tabs={tabs} label="Menus" /> : <span />}
          <span className="ix-tools"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setAdding('')}><Icon name="plus" width="16" height="16" aria-hidden="true" />Footer menu</button></span>
        </div>
        {!ready || !work ? <div style={{ minHeight: 240 }} aria-busy="true" /> : (<>
          <div className="mn-name">
            <div>
              <label className="gc-label" htmlFor="mn-name">Menu name</label>
              <input id="mn-name" className="gc-input" value={work.name} onChange={(e) => setWork((w) => ({ ...w, name: e.target.value }))} />
            </div>
            <StatusBadge tone="info" icon={work.place === 'header' ? 'panel-top' : 'panel-bottom'}>{work.place === 'header' ? 'Header' : 'Footer'}</StatusBadge>
            {!work.fixed ? <button type="button" className="ix-btn ix-btn--sm" onClick={removeMenu}><Icon name="trash-2" width="16" height="16" aria-hidden="true" />Delete menu</button> : null}
          </div>
          {work.items.length ? (
            <ul className="mn-list" aria-label={`${work.name} items`} onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(null); }}>
              {work.items.map((it, i) => row(it, i, work.items, null))}
            </ul>
          ) : <div className="ix-empty"><EmptyState icon="menu" title="This menu has no links" body="Add a page, a category or the offers page." actionLabel="Add menu item" onAction={() => setEditing({ item: newItem(), parent: null, isNew: true })} /></div>}
          {work.items.length ? (
            <div className="mn-add"><button type="button" className="gc-btn gc-btn--neutral gc-btn--sm" onClick={() => setEditing({ item: newItem(), parent: null, isNew: true })}><Icon name="plus" width="16" height="16" aria-hidden="true" /> Add menu item</button></div>
          ) : null}
        </>)}
      </section>

      </div>
      <aside className="ix-side mn-side" aria-label="Preview">{ready && work ? <Preview menus={menus} working={editing && !editing.isNew && !editing.parent && megaDraft ? { ...work, items: work.items.map((x) => (x.id === editing.item.id ? { ...x, mega: megaDraft } : x)) } : work} openMega={editing && !editing.parent && megaDraft && megaDraft.on ? editing.item.id : ''} /> : null}</aside>
      </div>
      <LearnMore topic="menus" />
    </StoreFrame>
  );
}
