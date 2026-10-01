'use client';
// FilterBar — the one search + filter pattern (docs/ux-audit.md J5).
//   Desktop: search, the filters inline, then `right` (view switch, export …).
//   Phones:  search + [Filter (n)] → bottom sheet with the same filters; active filters show as chips with Clear all.
// filters: [{ key, label, value, all ('All places'), options: [[value, label]], onChange }]  (selects)
// Extra controls that are not selects can go in `more` (shown inline on desktop, in the sheet on phones).

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { Sheet, useIsPhone } from './index';
export { useIsPhone };

export function FilterBar({ search, filters = [], more = null, right = null, onClear, label = 'Filters', chips: extraChips = [] }) {
  const [open, setOpen] = useState(false);
  const active = filters.filter((f) => f.value !== '' && f.value != null && f.value !== (f.empty ?? ''));
  const chips = [...active.map((f) => ({ key: f.key, text: `${f.label}: ${(f.options.find((o) => String(o[0]) === String(f.value)) || [f.value, f.value])[1]}`, clear: () => f.onChange(f.empty ?? '') })), ...extraChips];
  const count = chips.length;
  const selects = (inSheet) => filters.map((f) => (
    <div key={f.key} className={inSheet ? '' : 'gc-filterbar__field'}>
      {inSheet ? <label className="gc-label" htmlFor={'fb-' + f.key}>{f.label}</label> : null}
      <select id={inSheet ? 'fb-' + f.key : undefined} className="gc-input gc-select" aria-label={f.label} value={f.value} onChange={(e) => f.onChange(e.target.value)}>
        {f.all ? <option value={f.empty ?? ''}>{f.all}</option> : null}
        {f.options.map(([v, l]) => <option key={String(v)} value={v}>{l}</option>)}
      </select>
    </div>
  ));
  const clearAll = () => { filters.forEach((f) => f.onChange(f.empty ?? '')); extraChips.forEach((c) => c.clear()); if (onClear) onClear(); };
  return (
    <div className="gc-filterbar-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="gc-filterbar" role="search" aria-label={label}>
        {search ? (
          <label className="gc-filterbar__search">
            <Icon name="search" width="16" height="16" aria-hidden="true" />
            <input type="search" className="gc-input" placeholder={search.placeholder || 'Search'} aria-label={search.placeholder || 'Search'} value={search.value} onChange={(e) => search.onChange(e.target.value)} />
          </label>
        ) : null}
        <span className="gc-filterbar__inline">{selects(false)}{more}</span>
        {filters.length || more ? (
          <button type="button" className="gc-btn gc-btn--neutral gc-filterbar__btn" onClick={() => setOpen(true)} aria-haspopup="dialog">
            <Icon name="sliders-horizontal" width="16" height="16" aria-hidden="true" /> Filter{count ? <span className="gc-filterbar__count">{count}</span> : null}
          </button>
        ) : null}
        {right}
      </div>
      {count ? (
        <div className="gc-chips" aria-label="Active filters">
          {chips.map((c) => <button key={c.key || c.text} type="button" className="gc-chip" onClick={c.clear} aria-label={`Remove ${c.text}`}>{c.text}<Icon name="x" width="14" height="14" aria-hidden="true" /></button>)}
          <button type="button" className="gc-btn gc-btn--flat gc-btn--sm" onClick={clearAll}>Clear all</button>
        </div>
      ) : null}
      <Sheet open={open} title={label} onClose={() => setOpen(false)}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={clearAll}>Clear all</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => setOpen(false)}>Show results</button></>}>
        <div className="gc-filterbar__fields">{selects(true)}{more}</div>
      </Sheet>
    </div>
  );
}

/**
 * MobileFilters — wrap a page's own filter controls: inline as they are on desktop; on phones a
 * "Filter (n)" button opens them in a bottom sheet. The controls keep their own state (no rewrite needed).
 * A control marked `data-sheet-close` (e.g. "More filters", which opens its own dialog) closes the sheet first.
 */
export function MobileFilters({ children, count = 0, label = 'Filters', onClear }) {
  const phone = useIsPhone();
  const [open, setOpen] = useState(false);
  if (!phone) return <>{children}</>;
  return (
    <>
      <button type="button" className="gc-btn gc-btn--neutral gc-mf__btn" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <Icon name="sliders-horizontal" width="16" height="16" aria-hidden="true" /> Filter{count ? <span className="gc-filterbar__count">{count}</span> : null}
      </button>
      <Sheet open={open} title={label} onClose={() => setOpen(false)}
        footer={<>{onClear ? <button type="button" className="gc-btn gc-btn--neutral" onClick={onClear}>Clear all</button> : null}<button type="button" className="gc-btn gc-btn--solid" onClick={() => setOpen(false)}>Show results</button></>}>
        <div className="gc-mf" onClick={(e) => { if (e.target.closest && e.target.closest('[data-sheet-close]')) setOpen(false); }}>{children}</div>
      </Sheet>
    </>
  );
}
