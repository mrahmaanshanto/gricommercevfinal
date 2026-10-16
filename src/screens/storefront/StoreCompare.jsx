'use client';
// Compare — up to 4 products side by side (/compare; Batch B step 2). The shopper picks them with the compare button on
// a product card or page (lib/storefront/account.js › compareList, kept in this browser, signed in or not) or adds one
// here. Rows: price, rating, stock, brand, warranty, then the product template's specifications grouped as on the
// product page (lib/productTemplates.js), only fields at least one product has; "Only differences" hides rows where
// every product is the same. Add to cart and Remove per product. Phones scroll the table inside its box.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { allProducts } from '@/lib/products';
import { storeProducts, refreshCatalog } from '@/lib/storefront/catalog';
import { templateFor, groupsOf, fieldValue } from '@/lib/productTemplates';
import { warrantyOf } from '@/lib/warranty';
import { compareList, toggleCompare, clearCompare, COMPARE_MAX } from '@/lib/storefront/account';
import { StoreChrome, Crumbs } from './storeChrome';
import { Stars, Price, addAndShow } from './storeKit';
import { useAccount } from './accountParts';

const HEAD = { title: 'Compare products', description: '', robots: 'noindex, follow', canonical: '', og: {}, jsonld: [] };
const CSS = `
.scp{padding-bottom:var(--sf-section)}
.scp-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}
.scp-head h1{font-size:var(--sf-fs-h1)}
.scp-tools{display:flex;flex-wrap:wrap;align-items:center;gap:12px}
.scp-tools label{display:inline-flex;align-items:center;gap:8px;min-height:36px;font-size:var(--sf-fs-sm);cursor:pointer}
.scp-tools select{max-width:260px}
.scp-box{overflow-x:auto;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.scp-t{width:100%;border-collapse:separate;border-spacing:0;font-size:var(--sf-fs-sm);table-layout:fixed;min-width:calc(150px + var(--n) * 190px)}
.scp-t col.k{width:170px}
.scp-t th,.scp-t td{padding:10px 14px;border-bottom:1px solid var(--sf-line);text-align:left;vertical-align:top;overflow-wrap:anywhere}
.scp-t tbody th{position:sticky;left:0;z-index:1;background:var(--sf-surface);color:var(--sf-muted);font-weight:var(--weight-regular)}
.scp-t thead th{position:sticky;left:0;background:var(--sf-surface)}
.scp-t .grp th{padding-top:18px;color:var(--sf-text);font-weight:var(--weight-semibold);background:var(--sf-soft)}
.scp-t .grp td{background:var(--sf-soft)}
.scp-t tr.is-diff td{background:color-mix(in srgb,var(--sf-primary) 6%,transparent)}
.scp-p{display:flex;flex-direction:column;gap:8px}
.scp-p a.img{width:100%;max-width:160px;display:grid;place-items:center;aspect-ratio:1/1;border-radius:var(--sf-radius);overflow:hidden;font-size:var(--sf-fs-h2);font-weight:var(--weight-semibold);text-decoration:none;color:var(--sf-text)}
.scp-p a.img img{width:100%;height:100%;object-fit:cover}
.scp-p a.nm{font-weight:var(--weight-medium);text-decoration:none;line-height:1.35}
.scp-p .row{display:flex;gap:6px;flex-wrap:wrap}
.scp-x{display:inline-flex;align-items:center;gap:4px;min-height:36px;padding:0;border:0;background:none;color:var(--sf-muted);font:inherit;font-size:var(--sf-fs-sm);cursor:pointer}
.scp-x:hover{color:var(--sf-sale)}
.scp-empty{display:flex;flex-direction:column;align-items:flex-start;gap:12px;padding:28px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.scp-no{color:var(--sf-muted)}
@media (max-width:640px){.scp-t{min-width:calc(110px + var(--n) * 160px)}.scp-t col.k{width:110px}.scp-t th,.scp-t td{padding:8px 10px}.scp-tools select{max-width:100%;width:100%}}
`;

const show = (f, val) => (val === '' || val == null ? '' : f.t === 'yes' ? (val === true || val === 'Yes' ? 'Yes' : 'No') : String(val) + (f.u ? ' ' + f.u : ''));

export default function StoreCompare() {
  const acc = useAccount();
  const [diff, setDiff] = useState(false);
  const [list, setList] = useState(null);
  const [all, setAll] = useState([]);
  useEffect(() => {
    if (!acc.ready) return;
    refreshCatalog();
    const sp = storeProducts();
    const raw = allProducts();
    setAll(sp);
    setList(acc.compare.map((id) => { const s = sp.find((x) => x.id === id); const r = raw.find((x) => x.id === id); return s && r ? { s, r } : null; }).filter(Boolean));
  }, [acc.ready, acc.compare]);

  // the specification rows: every group and field any of the products has a value for
  const rows = useMemo(() => {
    if (!list || !list.length) return [];
    const groups = [];
    list.forEach(({ r }) => {
      let gs = [];
      try { gs = groupsOf(templateFor(r).id); } catch { gs = []; }
      gs.forEach((g) => {
        let G = groups.find((x) => x.name === g.name);
        if (!G) { G = { name: g.name, fields: [] }; groups.push(G); }
        g.fields.forEach((f) => { if (!G.fields.some((x) => x.k === f.k)) G.fields.push(f); });
      });
    });
    return groups.map((g) => ({
      name: g.name,
      fields: g.fields.map((f) => ({ k: f.k, l: f.l, vals: list.map(({ r }) => { try { return show(f, (fieldValue(r, f) || {}).value); } catch { return ''; } }) })).filter((f) => f.vals.some((v) => v)),
    })).filter((g) => g.fields.length);
  }, [list]);

  return (
    <StoreChrome screen="StoreCompare" kind="page" head={HEAD} css={CSS}>
      {(shell) => {
        const v = shell.values;
        const q = shell.preview ? '?preview=1' : '';
        if (!list) return <div className="sf-wrap" style={{ minHeight: 420 }} aria-busy="true" />;
        const n = list.length;
        const same = (vals) => vals.every((x) => x === vals[0]);
        const base = [
          ['Price', list.map(({ s }) => s.price), list.map(({ s }) => <Price key={s.id} price={s.price} mrp={s.mrp} />)],
          ['Rating', list.map(({ s }) => s.rating.avg), list.map(({ s }) => (s.rating.count ? <Stars key={s.id} rating={s.rating} small /> : <span key={s.id} className="scp-no">No reviews yet</span>))],
          ['Stock', list.map(({ s }) => (s.stock > 0 ? 'in' : s.oversell ? 'pre' : 'out')), list.map(({ s }) => <span key={s.id} className={'sf-stock' + (s.stock > 0 ? '' : ' is-out')}>{s.stock > 0 ? 'In stock' : s.oversell ? 'Pre-order' : 'Out of stock'}</span>)],
          ['Brand', list.map(({ s }) => s.brand), list.map(({ s }) => s.brand || '—')],
          ['Warranty', list.map(({ r }) => { const w = warrantyOf(r); return w ? w.label : ''; }), list.map(({ r }) => { const w = warrantyOf(r); return w ? w.label : '—'; })],
        ];
        const pick = all.filter((x) => !list.some((y) => y.s.id === x.id));
        const firstCat = n ? list[0].s.cat : '';
        const near = [...pick.filter((x) => x.cat === firstCat), ...pick.filter((x) => x.cat !== firstCat)];
        return (
          <div className="sf-wrap scp">
            <Crumbs items={[{ name: 'Compare' }]} />
            <div className="scp-head">
              <h1>Compare{n ? ` ${n} product${n === 1 ? '' : 's'}` : ''}</h1>
              {n ? (
                <div className="scp-tools">
                  <label><input type="checkbox" checked={diff} onChange={(e) => setDiff(e.target.checked)} />Only differences</label>
                  {n < COMPARE_MAX ? (
                    <select className="sf-input" aria-label="Add a product" value="" onChange={(e) => { if (e.target.value) toggleCompare(e.target.value); }}>
                      <option value="">Add a product…</option>
                      {near.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                    </select>
                  ) : null}
                  <button type="button" className="sf-link" onClick={clearCompare}>Clear all</button>
                </div>
              ) : null}
            </div>
            {!n ? (
              <div className="scp-empty">
                <b>Nothing to compare yet</b>
                <span className="sf-muted">Tap <Icon name="git-compare" width="14" height="14" aria-hidden="true" /> on up to {COMPARE_MAX} products, or add one here.</span>
                <select className="sf-input" style={{ maxWidth: 360 }} aria-label="Add a product" value="" onChange={(e) => { if (e.target.value) toggleCompare(e.target.value); }}>
                  <option value="">Add a product…</option>
                  {all.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
                <a className="sf-btn sf-btn--fill" href={'/store' + q}>Keep shopping</a>
              </div>
            ) : (
              <div className="scp-box" role="region" aria-label="Comparison table" tabIndex={0}>
                <table className="scp-t gc-table--keep" style={{ '--n': n }}>
                  <colgroup><col className="k" />{list.map(({ s }) => <col key={s.id} />)}</colgroup>
                  <thead>
                    <tr>
                      <th scope="col"><span className="sr-only">Product</span></th>
                      {list.map(({ s }) => {
                        const out = s.stock <= 0 && !s.oversell;
                        return (
                          <td key={s.id}>
                            <div className="scp-p">
                              <a className="img" href={s.href} style={{ background: s.tbg }} aria-label={s.name}>{s.img ? <img src={s.img} alt="" /> : <span aria-hidden="true">{s.name.slice(0, 1)}</span>}</a>
                              <a className="nm" href={s.href}>{s.name}</a>
                              <div className="row">
                                <button type="button" className="sf-btn sf-btn--sm sf-btn--fill" disabled={out} onClick={() => addAndShow(s, v)}>{out ? 'Sold out' : 'Add to cart'}</button>
                              </div>
                              <button type="button" className="scp-x" onClick={() => toggleCompare(s.id)} aria-label={'Remove ' + s.name}><Icon name="x" width="14" height="14" aria-hidden="true" />Remove</button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {base.filter(([, raw]) => !diff || !same(raw)).map(([l, raw, cells]) => <tr key={l} className={n > 1 && !same(raw) ? 'is-diff' : ''}><th scope="row">{l}</th>{cells.map((c, i) => <td key={i}>{c}</td>)}</tr>)}
                  </tbody>
                  {rows.map((g) => {
                    const fs = g.fields.filter((f) => !diff || !same(f.vals));
                    if (!fs.length) return null;
                    return (
                      <tbody key={g.name}>
                        <tr className="grp"><th scope="rowgroup" colSpan={1}>{g.name}</th>{list.map(({ s }) => <td key={s.id} />)}</tr>
                        {fs.map((f) => <tr key={f.k} className={n > 1 && !same(f.vals) ? 'is-diff' : ''}><th scope="row">{f.l}</th>{f.vals.map((x, i) => <td key={i}>{x || <span className="scp-no">—</span>}</td>)}</tr>)}
                      </tbody>
                    );
                  })}
                </table>
              </div>
            )}
          </div>
        );
      }}
    </StoreChrome>
  );
}
