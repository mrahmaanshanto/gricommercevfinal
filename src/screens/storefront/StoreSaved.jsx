'use client';
// Wishlist (/wishlist) and Compare (/compare): the products a shopper saved on the website (lib/storefront/saved.js).
// Compare lines up to four products side by side: price, rating, stock, brand, warranty and every specification their
// product templates mark for comparing (Catalog setup › Product templates), with "Only the differences".
// Front end only: the live store keeps the lists on the customer's account once they sign in.

import React, { useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { storeProducts } from '@/lib/storefront/catalog';
import { useSaved, toggleCompare, clearCompare } from '@/lib/storefront/saved';
import { allProducts, getSavedProducts } from '@/lib/products';
import { templateFor, fieldsOf, fieldValue } from '@/lib/productTemplates';
import { StoreChrome, Crumbs } from './storeChrome';
import { ProductCard, Price, Stars, addAndShow } from './storeKit';
import { w } from '@/lib/storefront/words';

const HEAD = (title) => ({ title, description: '', robots: 'noindex, follow', canonical: '', og: {}, jsonld: [] });
const pick = (ids) => { let all = []; try { all = storeProducts(); } catch { all = []; } return ids.map((id) => all.find((p) => p.id === id)).filter(Boolean); };

export function StoreWishlist() {
  const saved = useSaved();
  const list = useMemo(() => pick(saved.wish), [saved.wish]);
  return (
    <StoreChrome screen="StoreWishlist" kind="wishlist" head={HEAD('Wishlist')} css={SAVED_CSS}>
      {(shell) => (
        <div className="sf-wrap ssv">
          <Crumbs items={[{ name: 'Wishlist' }]} />
          <header className="ssv-head"><h1 data-w="wishlistTitle">{w('wishlistTitle')}</h1>{list.length ? <span>{list.length} saved</span> : null}</header>
          {!list.length ? (
            <div className="ssv-empty"><Icon name="heart" width="32" height="32" aria-hidden="true" /><p data-w="wishlistEmpty">{w('wishlistEmpty')}</p><a className="sf-btn" href="/store">Browse products</a></div>
          ) : (
            <div className="sf-grid">{list.map((p) => <ProductCard key={p.id} p={p} values={shell.values} />)}</div>
          )}
        </div>
      )}
    </StoreChrome>
  );
}

export function StoreCompare() {
  const saved = useSaved();
  const [diff, setDiff] = useState(false);
  const list = useMemo(() => pick(saved.compare), [saved.compare]);
  const rows = useMemo(() => {
    let raw = [];
    try { raw = allProducts(getSavedProducts()); } catch { raw = []; }
    const specs = new Map();
    list.forEach((p) => {
      const r = raw.find((x) => x.id === p.id);
      if (!r) return;
      let fields = [];
      try { fields = fieldsOf(templateFor(r).id).filter((f) => f.compare || f.key); } catch { fields = []; }
      fields.forEach((f) => {
        const val = fieldValue(r, f).value;
        const text = val === '' || val == null ? '' : (f.t === 'yes' ? (val === true || val === 'Yes' ? 'Yes' : 'No') : String(val)) + (f.u ? ' ' + f.u : '');
        if (!specs.has(f.l)) specs.set(f.l, {});
        specs.get(f.l)[p.id] = text;
      });
    });
    const base = [
      ['Brand', (p) => p.brand || '—'],
      ['Availability', (p) => (p.stock > 0 ? 'In stock' : p.oversell ? 'Pre-order' : 'Out of stock')],
      ['Warranty', (p) => p.warranty || '—'],
    ].map(([l, f]) => [l, Object.fromEntries(list.map((p) => [p.id, f(p)]))]);
    const spec = [...specs.entries()].filter(([, by]) => list.some((p) => by[p.id])).map(([l, by]) => [l, Object.fromEntries(list.map((p) => [p.id, by[p.id] || '—']))]);
    return [...base, ...spec];
  }, [list]);
  const shown = diff ? rows.filter(([, by]) => new Set(list.map((p) => by[p.id])).size > 1) : rows;
  return (
    <StoreChrome screen="StoreCompare" kind="compare" head={HEAD('Compare products')} css={SAVED_CSS}>
      {(shell) => (
        <div className="sf-wrap ssv">
          <Crumbs items={[{ name: 'Compare' }]} />
          <header className="ssv-head">
            <h1 data-w="compareTitle">{w('compareTitle')}</h1>
            {list.length > 1 ? <label className="ssv-diff"><input type="checkbox" checked={diff} onChange={(e) => setDiff(e.target.checked)} />Only the differences</label> : null}
            {list.length ? <button type="button" className="sf-link" onClick={clearCompare}>Clear all</button> : null}
          </header>
          {!list.length ? (
            <div className="ssv-empty"><Icon name="git-compare-arrows" width="32" height="32" aria-hidden="true" /><p>Add up to four products with the compare button on a product card.</p><a className="sf-btn" href="/store">Browse products</a></div>
          ) : (
            <div className="ssv-scroll" tabIndex={0} role="region" aria-label="Products side by side">
              <table className="ssv-table gc-table--keep">
                <thead>
                  <tr>
                    <th scope="row"><span className="ssv-cnt">{list.length} of 4</span></th>
                    {list.map((p) => (
                      <th key={p.id} scope="col">
                        <div className="ssv-prod">
                          <button type="button" className="ssv-x" aria-label={`Remove ${p.name}`} onClick={() => toggleCompare(p.id)}><Icon name="x" width="16" height="16" aria-hidden="true" /></button>
                          <a href={p.href} className="ssv-pic" style={{ background: p.tbg }}>{p.img ? <img src={p.img} alt="" loading="lazy" /> : <span aria-hidden="true">{p.name.slice(0, 1)}</span>}</a>
                          <a href={p.href} className="ssv-name">{p.name}</a>
                          <Price price={p.price} mrp={p.mrp} />
                          <Stars rating={p.rating} small />
                          <button type="button" className="sf-btn sf-btn--sm" disabled={p.stock <= 0 && !p.oversell} onClick={() => addAndShow(p, shell.values)}><Icon name="shopping-cart" width="16" height="16" aria-hidden="true" />Add to cart</button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shown.map(([l, by]) => <tr key={l}><th scope="row">{l}</th>{list.map((p) => <td key={p.id}>{by[p.id]}</td>)}</tr>)}
                  {!shown.length ? <tr><td colSpan={list.length + 1}>These products are the same on everything listed.</td></tr> : null}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </StoreChrome>
  );
}

export const SAVED_CSS = `
.ssv{display:flex;flex-direction:column;gap:20px;padding-bottom:var(--sf-section)}
.ssv-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px 20px}
.ssv-head h1{margin:0!important;font-size:var(--sf-fs-h2)}
.ssv-head>span{color:var(--sf-muted)}
.ssv-head .sf-link{margin-left:auto;min-height:44px}
.ssv-diff{display:inline-flex;align-items:center;gap:8px;min-height:44px;cursor:pointer}
.ssv-empty{display:flex;flex-direction:column;align-items:center;gap:14px;padding:clamp(40px,8vw,88px) 16px;border:1px dashed var(--sf-line);border-radius:var(--sf-radius-card);text-align:center;color:var(--sf-muted)}
.ssv-empty svg{color:var(--sf-primary)}
.ssv-empty p{margin:0;max-width:44ch}
.ssv-scroll{overflow-x:auto;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.ssv-table{width:100%;min-width:640px;border-collapse:collapse;table-layout:fixed}
.ssv-table th,.ssv-table td{padding:12px 14px;border-bottom:1px solid var(--sf-line);text-align:left;vertical-align:top;overflow-wrap:anywhere}
.ssv-table tbody th{width:170px;color:var(--sf-muted);font-weight:var(--weight-medium);font-size:var(--sf-fs-sm)}
.ssv-table thead th:first-child{width:170px;vertical-align:bottom}
.ssv-table tbody tr:nth-child(even){background:color-mix(in srgb,var(--sf-soft) 55%,transparent)}
.ssv-cnt{color:var(--sf-muted);font-weight:var(--weight-regular);font-size:var(--sf-fs-sm)}
.ssv-prod{position:relative;display:flex;flex-direction:column;gap:8px;font-weight:var(--weight-regular)}
.ssv-x{position:absolute;top:-4px;right:-6px;z-index:1;display:grid;place-items:center;width:36px;height:36px;border:0;border-radius:50%;background:var(--sf-surface);color:var(--sf-muted);box-shadow:0 1px 4px rgba(15,23,42,.18);cursor:pointer}
.ssv-pic{display:grid;grid-template:minmax(0,1fr)/minmax(0,1fr);place-items:center;aspect-ratio:1/1;border-radius:var(--sf-radius);overflow:hidden;color:var(--sf-text);font-size:var(--sf-fs-h2);text-decoration:none}
.ssv-pic img{width:100%;height:100%;object-fit:contain}
.ssv-name{color:var(--sf-text);font-weight:var(--weight-semibold);text-decoration:none;line-height:1.3}
.ssv-name:hover{color:var(--sf-primary)}
`;
