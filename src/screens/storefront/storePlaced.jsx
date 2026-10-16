'use client';
// storePlaced — HTML blocks placed across the store (Online Store › HTML blocks › Placements, lib/storefront/placements.js).
// StoreChrome tells the page what it is (PageInfo: kind, product, category); <Placed spot="…" /> draws the blocks placed
// in that spot, in their order, for this page and device, between their dates.

import React, { createContext, useContext } from 'react';
import { clockNow } from '@/lib/settlements';
import { placedAt } from '@/lib/storefront/placements';
import { deviceClass } from '@/lib/storefront/show';
import { BlockContent } from './storeKit';

export const PageInfo = createContext({ kind: '', product: '', category: '', catalog: [] });

/** The blocks placed in one spot. kind: this page's kind when it differs from the chrome's (the thank-you view). */
export function Placed({ spot, kind, wrap = true }) {
  const info = useContext(PageInfo);
  let list = [];
  try { list = placedAt(spot, { kind: kind || info.kind, product: info.product, category: info.category, now: clockNow() }); } catch { list = []; }
  if (!list.length) return null;
  const body = list.map((p) => (
    <div key={p.id} className={['sf-placed', 'sf-placed--' + spot, deviceClass(p.show && p.show.devices)].filter(Boolean).join(' ')} data-placement={p.id}>
      <BlockContent id={p.block} catalog={info.catalog} compact={spot.startsWith('product-under')} />
    </div>
  ));
  return wrap && ['above-header', 'below-header', 'home-top', 'before-footer'].includes(spot) ? <div className="sf-wrap sf-placed-band">{body}</div> : <>{body}</>;
}

export const PLACED_CSS = `
.sf-placed-band{display:flex;flex-direction:column;gap:12px;padding-top:12px;padding-bottom:12px}
.sf-placed .bl-article{max-width:none}
.sf-placed .bl-article>:first-child{margin-top:0}
.sf-placed .bl-article>:last-child{margin-bottom:0}
.sf-placed--product-under-price,.sf-placed--product-under-cart{padding:12px 14px;border:1px solid var(--sf-line);border-radius:var(--sf-radius);background:var(--sf-surface)}
.sf-placed--category-top,.sf-placed--category-bottom,.sf-placed--cart,.sf-placed--checkout,.sf-placed--thank-you{margin:12px 0}
`;
