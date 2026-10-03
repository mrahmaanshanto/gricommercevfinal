'use client';
// AddProductParts — the small pieces of the Add / Edit product page (AddProduct.jsx): field error, switch, segmented
// choice, AI buttons, the side-panel drawer with Cancel / Save, ↑ ↓ × order buttons, the subcategory multi-select, and
// the specification layout model (groups and rows a single product can reorder, rename, add or hide without changing
// the shop's template).

import React, { useEffect, useRef, useState } from 'react';
import { Icon, list as __list } from '@/runtime/dc';
import { Sheet } from '@/components/ui';

export function Err({ id, text }) {
  return text ? <span id={id} className="ap-err" role="alert"><Icon name="circle-alert" width="14" height="14" aria-hidden="true" />{text}</span> : null;
}

export function Switch({ on, onToggle, label, disabled }) {
  return <button type="button" role="switch" aria-checked={!!on} aria-label={label} className="gc-switch" onClick={onToggle} disabled={disabled}><span className="gc-switch__knob" /></button>;
}

export function Seg({ opts, label, labelledBy }) {
  return (
    <div className="gc-seg ap-seg" role="group" aria-label={label} aria-labelledby={labelledBy}>
      {__list(opts).map((o, i) => (
        <button key={i} type="button" className={'gc-seg__btn' + (o.on ? ' gc-seg__btn--active' : '')} aria-pressed={!!o.on} onClick={o.pick}>{o.l}</button>
      ))}
    </div>
  );
}

export function AiBtn({ onClick, children, label }) {
  return <button type="button" className="ix-btn ix-btn--sm ix-btn--plain ap-ai" onClick={onClick} aria-label={label}><Icon name="sparkles" width="16" height="16" aria-hidden="true" />{children}</button>;
}

export function AiCheck({ onKeep, onUndo }) {
  return (
    <div className="ap-aicheck ap-fade">
      <span className="ap-aitag"><Icon name="sparkles" width="12" height="12" aria-hidden="true" />AI wrote this — please check</span>
      <button type="button" className="ix-btn ix-btn--sm" onClick={onKeep}>Looks good</button>
      <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={onUndo}>Undo</button>
    </div>
  );
}

/** ↑ ↓ × for a row, a group or an option. */
export function OrderBtns({ onUp, onDown, onRemove, upOff, downOff, what, removeText }) {
  return (
    <span className="ap-order">
      <button type="button" className="ap-obtn" aria-label={'Move ' + what + ' up'} onClick={onUp} disabled={upOff}><Icon name="arrow-up" width="14" height="14" aria-hidden="true" /></button>
      <button type="button" className="ap-obtn" aria-label={'Move ' + what + ' down'} onClick={onDown} disabled={downOff}><Icon name="arrow-down" width="14" height="14" aria-hidden="true" /></button>
      {onRemove ? (removeText
        ? <button type="button" className="ap-obtn ap-obtn--text" onClick={onRemove}>{removeText}</button>
        : <button type="button" className="ap-obtn" aria-label={'Remove ' + what} onClick={onRemove}><Icon name="x" width="14" height="14" aria-hidden="true" /></button>) : null}
    </span>
  );
}

/** A side panel (Sheet) with the product's name under its title and Cancel / Save in its footer. */
export function Drawer({ open, title, sub, onCancel, onSave, saveLabel = 'Save', cancelLabel = 'Cancel', wide, children }) {
  return (
    <Sheet open={open} title={title} onClose={onCancel}
      footer={<>{cancelLabel ? <button type="button" className="ix-btn" onClick={onCancel}>{cancelLabel}</button> : null}<button type="button" className="ix-btn ix-btn--primary" onClick={onSave}>{saveLabel}</button></>}>
      {wide ? <span className="ap-wide" hidden /> : null}
      {sub ? <p className="ap-dsub">{sub}</p> : null}
      {children}
    </Sheet>
  );
}

/** A select-like button that opens a list of checkboxes. groups: [{ name, items: [{ k, label, on, toggle }] }] */
export function MultiCheck({ id, groups, placeholder, labelledBy }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const off = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    const key = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', off); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', key); };
  }, [open]);
  const picked = groups.reduce((a, g) => a.concat(g.items.filter((x) => x.on).map((x) => x.label)), []);
  return (
    <div className="ap-multi" ref={box} data-nodirty="">
      <button type="button" id={id} className="gc-input ap-multi__btn" aria-haspopup="listbox" aria-expanded={open} aria-labelledby={labelledBy} onClick={() => setOpen(!open)}>
        <span className={picked.length ? '' : 'ix-muted'}>{picked.length ? picked.join(', ') : placeholder}</span>
        <Icon name="chevron-down" width="16" height="16" aria-hidden="true" />
      </button>
      {open ? (
        <div className="ap-multi__pop" role="listbox" aria-multiselectable="true">
          {groups.filter((g) => g.items.length).map((g) => (
            <div key={g.name} className="ap-multi__grp">
              <span className="ap-multi__name">{g.name}</span>
              {g.items.map((x) => (
                <label key={x.k} className="ap-multi__item">
                  <input type="checkbox" className="gc-check" checked={!!x.on} onChange={x.toggle} />{x.label}
                </label>
              ))}
            </div>
          ))}
          {!groups.some((g) => g.items.length) ? <span className="ap-multi__none">No subcategories yet</span> : null}
        </div>
      ) : null}
    </div>
  );
}

// ---- specification layout (one product) -------------------------------------------------------------------------
// layout = { tpl, groups: [{ name, keys }], hidden: [key], labels: { key: label }, extra: { key: { l } } }
// Kept on the product (record.specLayout) for the template it was made for; another template starts from that
// template's own groups again (the layout comes back when the template does). Values always stay in product.data.

/** Groups and rows to show for a template: the product's own layout, else the template's groups. */
export function specModel(tplId, base, layout) {
  const L = layout && layout.tpl === tplId ? layout : null;
  const fieldBy = {};
  base.forEach((g) => g.fields.forEach((f) => { fieldBy[f.k] = f; }));
  const extra = (L && L.extra) || {};
  Object.keys(extra).forEach((k) => { fieldBy[k] = { k, l: extra[k].l || 'Specification', t: 'text', u: '', o: null, d: '', own: true }; });
  const hidden = (L && L.hidden) || [];
  let groups;
  if (L) {
    groups = (L.groups || []).map((g) => ({ name: g.name, keys: (g.keys || []).filter((k) => fieldBy[k] && hidden.indexOf(k) < 0) }));
    const placed = {};
    groups.forEach((g) => g.keys.forEach((k) => { placed[k] = 1; }));
    // fields the shop added to the template later go to their template group
    base.forEach((g) => {
      const missing = g.fields.map((f) => f.k).filter((k) => !placed[k] && hidden.indexOf(k) < 0);
      if (!missing.length) return;
      let to = groups.filter((x) => x.name === g.name)[0];
      if (!to) { to = { name: g.name, keys: [] }; groups.push(to); }
      to.keys = to.keys.concat(missing);
    });
  } else groups = base.map((g) => ({ name: g.name, keys: g.fields.map((f) => f.k) }));
  return { tpl: tplId, groups, fieldBy, hidden: hidden.slice(), labels: (L && L.labels) || {}, extra, own: !!L };
}
/** The model as a layout to store (a copy the caller may change). */
export function layoutOf(m) {
  const ex = {};
  Object.keys(m.extra).forEach((k) => { ex[k] = { l: m.extra[k].l }; });
  const lb = {};
  Object.keys(m.labels).forEach((k) => { lb[k] = m.labels[k]; });
  return { tpl: m.tpl, groups: m.groups.map((g) => ({ name: g.name, keys: g.keys.slice() })), hidden: m.hidden.slice(), labels: lb, extra: ex };
}
export const swap = (arr, i, j) => { const a = arr.slice(); if (i < 0 || j < 0 || i >= a.length || j >= a.length) return a; const t = a[i]; a[i] = a[j]; a[j] = t; return a; };

// ---- the page's own styles ----------------------------------------------------------------------------------------
export const PARTS_CSS = `
.ap-err{display:flex;align-items:center;gap:6px;margin:0;font-size:var(--text-xs);color:var(--text-danger)}
.ap-ai{color:var(--viz-7)}
.ap-ai-on{border-color:var(--viz-7)!important}
.ap-aicheck{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.ap-aitag{display:inline-flex;align-items:center;gap:6px;height:20px;padding:0 8px;border-radius:var(--radius-full);background:color-mix(in srgb,var(--viz-7) 10%,transparent);color:var(--viz-7);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.ap-order{display:inline-flex;align-items:center;gap:4px;flex:none}
.ap-obtn{display:inline-grid;place-items:center;min-width:24px;height:24px;padding:0 6px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);background:var(--surface-card);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.ap-obtn:hover:not(:disabled){border-color:var(--border-strong);color:var(--text-heading)}
.ap-obtn:disabled{opacity:.4;cursor:default}
.ap-obtn--text{color:var(--text-danger)}
.ap-dsub{margin:calc(var(--space-2) * -1) 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.gc-sheet:has(.ap-wide){width:min(560px,100vw)}
.ap-multi{position:relative;min-width:0}
.ap-multi__btn{display:flex;align-items:center;gap:var(--space-2);width:100%;text-align:left;cursor:pointer}
.ap-multi__btn>span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ap-multi__btn>svg{flex:none;color:var(--text-muted)}
.ap-multi__pop{position:absolute;z-index:20;top:calc(100% + 4px);left:0;right:0;display:flex;flex-direction:column;gap:var(--space-2);max-height:320px;overflow:auto;padding:var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-lg)}
.ap-multi__grp{display:flex;flex-direction:column}
.ap-multi__name{padding:4px 8px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.ap-multi__item{display:flex;align-items:center;gap:var(--space-2);min-height:32px;padding:0 8px;border-radius:var(--radius-md);font-size:var(--text-sm);color:var(--text-heading);cursor:pointer}
.ap-multi__item:hover{background:var(--surface-subtle)}
.ap-multi__item .gc-check{width:16px;height:16px}
.ap-multi__none{padding:6px 8px;font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:640px){
  .ap-obtn{min-width:36px;height:36px}
  .ap-multi__item{min-height:40px}
}
`;
