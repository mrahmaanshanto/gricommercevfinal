'use client';
// PlacementSheet — the side panel that places an HTML block across the store (Online Store › HTML blocks › Place, and
// the Placements list; lib/storefront/placements.js). New: one block, any number of spots (one placement each). Edit:
// one placement's spot. Both: pages (for the spots on every page), categories and products (for the spots on product
// and category pages, and the every-page spots), devices, start and end (Bangladesh time) and the order within a spot.

import React from 'react';
import { Icon } from '@/runtime/dc';
import { Sheet } from '@/components/ui';
import { toDhakaInput, fromDhakaInput } from '@/lib/seo';
import { SPOTS, spotBy, PAGE_KINDS, DEVICES } from '@/lib/storefront/schema';
import { placementProblem } from '@/lib/storefront/placements';
import { BlockPick, CatPick, ProductPick } from './sfShared';

const GROUPS = [
  ['Every page', ['above-header', 'below-header', 'before-footer']],
  ['Home', ['home-top']],
  ['Product page', ['product-under-price', 'product-under-cart', 'product-tab']],
  ['Category page', ['category-top', 'category-bottom']],
  ['Cart and checkout', ['cart', 'checkout', 'thank-you']],
];
const short = (s) => { const x = spotBy(s); return x ? x.label.replace(/^(Product page|Category page): /, '') : s; };

/**
 * draft: { block, spots: [spot] (new) | spot (edit), show, start, end, order }. setDraft(next). onSave().
 */
export function PlacementSheet({ open, draft, setDraft, onSave, onClose, isNew, blockFixed }) {
  if (!open || !draft) return null;
  const set = (patch) => setDraft({ ...draft, ...patch });
  const spots = isNew ? draft.spots || [] : [draft.spot];
  const show = draft.show || { pages: 'all', devices: 'all' };
  const setShow = (patch) => set({ show: { ...show, ...patch } });
  const anyAll = spots.some((s) => (spotBy(s) || {}).page === 'all');
  const anyItem = spots.some((s) => ['product', 'category'].includes((spotBy(s) || {}).page)) || anyAll;
  const allPages = show.pages === 'all' || show.pages == null;
  const kinds = allPages ? [] : show.pages || [];
  const problem = !spots.length ? 'Choose at least one spot.' : placementProblem({ ...draft, spot: spots[0] });
  const toggleSpot = (s) => set({ spots: spots.includes(s) ? spots.filter((x) => x !== s) : [...spots, s] });
  return (
    <Sheet open title={isNew ? 'Place a block' : 'Edit placement'} onClose={onClose}
      footer={<>
        {problem ? <p className="sfb-warn" style={{ flex: 1 }}><Icon name="triangle-alert" width="14" height="14" aria-hidden="true" /><span>{problem}</span></p> : <span style={{ flex: 1 }} />}
        <button type="button" className="gc-btn" onClick={onClose}>Cancel</button>
        <button type="button" className="gc-btn gc-btn--solid" disabled={!!problem} onClick={onSave}>{isNew && spots.length > 1 ? `Place in ${spots.length} spots` : 'Save'}</button>
      </>}>
      <div className="sfb-fields">
        {!blockFixed ? <div className="sfb-field"><label className="gc-label" htmlFor="pl-block">Block</label><BlockPick id="pl-block" value={draft.block} onChange={(x) => set({ block: x })} /></div> : null}
        {isNew ? (
          <div className="sfb-field">
            <span className="gc-label">Where it goes</span>
            {GROUPS.map(([g, list]) => (
              <fieldset key={g} className="pl-group">
                <legend>{g}</legend>
                {list.map((s) => <label key={s}><input type="checkbox" className="gc-check" checked={spots.includes(s)} onChange={() => toggleSpot(s)} />{short(s)}</label>)}
              </fieldset>
            ))}
          </div>
        ) : (
          <div className="sfb-field"><label className="gc-label" htmlFor="pl-spot">Where it goes</label>
            <select id="pl-spot" className="gc-input gc-select" value={draft.spot} onChange={(e) => set({ spot: e.target.value })}>{SPOTS.map((s) => <option key={s.spot} value={s.spot}>{s.label}</option>)}</select>
          </div>
        )}
        {anyAll ? (
          <div className="sfb-field">
            <span className="gc-label">On which pages</span>
            <div className="sfb-row"><span id="pl-all">Every page</span><button type="button" role="switch" className="gc-switch" aria-checked={allPages} aria-labelledby="pl-all" onClick={() => setShow({ pages: allPages ? ['home'] : 'all' })}><span className="gc-switch__knob" /></button></div>
            {!allPages ? <div className="pl-kinds" role="group" aria-label="Kinds of page">{PAGE_KINDS.map(([k, l]) => <label key={k}><input type="checkbox" className="gc-check" checked={kinds.includes(k)} onChange={() => setShow({ pages: kinds.includes(k) ? kinds.filter((x) => x !== k) : [...kinds, k] })} />{l}</label>)}</div> : null}
          </div>
        ) : null}
        {anyItem ? (<>
          <div className="sfb-field">
            <label className="gc-label" htmlFor="pl-cat">Only for these categories</label>
            <CatPick id="pl-cat" value="" onChange={(c) => { if (c && !(show.categories || []).includes(c)) setShow({ categories: [...(show.categories || []), c] }); }} />
            {(show.categories || []).length ? <div className="pl-chips">{show.categories.map((c) => <button key={c} type="button" aria-label={'Remove ' + c} onClick={() => setShow({ categories: show.categories.filter((x) => x !== c) })}>{c}<Icon name="x" width="12" height="12" aria-hidden="true" /></button>)}</div> : <p className="sfb-muted">Empty = every category and product.</p>}
          </div>
          <div className="sfb-field">
            <label className="gc-label" htmlFor="pl-prod">Or these products</label>
            <ProductPick id="pl-prod" value="" onChange={(p) => { if (p && !(show.products || []).includes(p)) setShow({ products: [...(show.products || []), p] }); }} />
            {(show.products || []).length ? <div className="pl-chips">{show.products.map((p) => <button key={p} type="button" aria-label={'Remove ' + p} onClick={() => setShow({ products: show.products.filter((x) => x !== p) })}>{p}<Icon name="x" width="12" height="12" aria-hidden="true" /></button>)}</div> : null}
          </div>
        </>) : null}
        <div className="sfb-field"><label className="gc-label" htmlFor="pl-dev">Devices</label><select id="pl-dev" className="gc-input gc-select" value={show.devices || 'all'} onChange={(e) => setShow({ devices: e.target.value })}>{DEVICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
        <div className="sfb-two">
          <div className="sfb-field"><label className="gc-label" htmlFor="pl-start">Starts</label><input id="pl-start" type="datetime-local" className="gc-input" value={toDhakaInput(draft.start)} onChange={(e) => set({ start: fromDhakaInput(e.target.value) })} /></div>
          <div className="sfb-field"><label className="gc-label" htmlFor="pl-end">Ends</label><input id="pl-end" type="datetime-local" className="gc-input" value={toDhakaInput(draft.end)} onChange={(e) => set({ end: fromDhakaInput(e.target.value) })} /></div>
        </div>
        <div className="sfb-field"><label className="gc-label" htmlFor="pl-order">Order in the spot</label><input id="pl-order" type="number" min={0} max={99} className="gc-input" style={{ maxWidth: 120 }} value={draft.order || 0} onChange={(e) => set({ order: Math.max(0, Math.min(99, Number(e.target.value) || 0)) })} /><p className="sfb-muted">Lower shows first when two blocks share a spot.</p></div>
      </div>
    </Sheet>
  );
}

export const PLACEMENT_CSS = `
.pl-group{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 12px;margin:0;padding:8px 0;border:0;border-top:1px solid var(--border-subtle)}
.pl-group legend{padding:0 0 4px;font-size:var(--text-xs);color:var(--text-muted);font-weight:var(--weight-medium)}
.pl-group label,.pl-kinds label{display:flex;align-items:center;gap:8px;font-size:var(--text-sm)}
.pl-kinds{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 12px}
.pl-chips{display:flex;flex-wrap:wrap;gap:6px}
.pl-chips button{display:inline-flex;align-items:center;gap:4px;min-height:28px;padding:0 8px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-subtle);font:inherit;font-size:var(--text-xs);color:var(--text-heading);cursor:pointer}
@media (max-width:640px){.pl-group,.pl-kinds{grid-template-columns:minmax(0,1fr)}}
`;
