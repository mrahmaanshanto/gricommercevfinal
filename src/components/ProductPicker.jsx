'use client';
// ProductPicker — pick one product from the catalogue by typing its SKU, name, variant or barcode.
// Each match reads "SKU · name · variant · N available here" (the `hint` prop writes the last part).
// Keyboard: ↑/↓ to move, Enter to pick, Esc to close.
import React, { useState } from 'react';
import { productBy, productLabel, searchProducts } from '@/lib/stock';

export const PICKER_CSS = `
.pp{position:relative}
.pp__list{position:absolute;z-index:5;left:0;right:0;top:calc(100% + 4px);max-height:264px;overflow-y:auto;margin:0;padding:var(--space-1);list-style:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-lg)}
.pp__opt{display:flex;align-items:baseline;justify-content:space-between;gap:var(--space-3);padding:var(--space-2) var(--space-3);border-radius:var(--radius-md);font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.pp__opt.is-active{background:var(--fill-primary-soft)}
.pp__opt[aria-selected="true"] .pp__name{color:var(--primary)}
.pp__name{min-width:0}
.pp__sku{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.pp__hint{flex:none;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-success);white-space:nowrap}
.pp__hint.is-none{color:var(--text-danger)}
.pp__none{padding:var(--space-3);font-size:var(--text-sm);color:var(--text-muted)}
`;

/**
 * value: the chosen SKU · onChange(sku) · hint(product) → { text, none } shown on each row, e.g.
 * { text: '12 available here', none: false }. Pass `invalid` and `describedBy` for field errors.
 */
export function ProductPicker({ id, value, onChange, hint, invalid, describedBy, autoFocus }) {
  const sel = productBy(value);
  const [q, setQ] = useState(null);       // null while not typing: the input shows the chosen product
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const list = searchProducts(q || '').slice(0, 12);
  const text = q != null ? q : sel ? productLabel(sel) : '';
  const pick = (p) => { onChange(p.sku); setQ(null); setOpen(false); };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((i) => Math.min(list.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Enter' && open) { e.preventDefault(); if (list[active]) pick(list[active]); }
    else if (e.key === 'Escape' && open) { e.preventDefault(); e.stopPropagation(); setOpen(false); setQ(null); }
  };
  return (
    <div className="pp">
      <input
        id={id} className={'gc-input' + (invalid ? ' gc-input--error' : '')} type="text" role="combobox" autoComplete="off"
        aria-expanded={open} aria-controls={id + '-list'} aria-autocomplete="list" aria-invalid={invalid ? 'true' : undefined} aria-describedby={describedBy}
        aria-activedescendant={open && list[active] ? `${id}-opt-${active}` : undefined}
        placeholder="Search by SKU, name or variant" value={text} data-autofocus={autoFocus ? '' : undefined}
        onFocus={(e) => { e.target.select(); setOpen(true); setActive(0); }}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
        onBlur={() => { setOpen(false); setQ(null); }}
        onKeyDown={onKey}
      />
      {open ? (
        <ul id={id + '-list'} role="listbox" className="pp__list" aria-label="Products">
          {list.length ? list.map((p, i) => {
            const h = hint ? hint(p) : null;
            return (
              <li key={p.sku} id={`${id}-opt-${i}`} role="option" aria-selected={p.sku === value} className={'pp__opt' + (i === active ? ' is-active' : '')} onMouseDown={(e) => e.preventDefault()} onMouseEnter={() => setActive(i)} onClick={() => pick(p)}>
                <span className="pp__name"><span className="pp__sku">{p.sku}</span> · {p.name} · {p.variant}</span>
                {h ? <span className={'pp__hint' + (h.none ? ' is-none' : '')}>{h.text}</span> : null}
              </li>
            );
          }) : <li className="pp__none">No product matches “{q}”</li>}
        </ul>
      ) : null}
    </div>
  );
}
