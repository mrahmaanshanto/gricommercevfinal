'use client';
// Category page — what a customer sees for one product category (/category?handle=chargers-and-cables), drawn by the
// theme: the Category page layout's sections (a layout for this category wins; e.g. Signal's Phones layout adds a
// deals block and FAQ), with the category's products as the main section, following Theme › Category page: columns on
// a computer and a phone, filters (left column, top bar or a drawer: brand, price, in stock), the first sort, products per
// page and page numbers or "load more as you scroll". Subcategories show as chips. The head carries the category's SEO
// with a CollectionPage and breadcrumb schema. Hidden categories show only with ?preview=1. A renamed category's old
// address follows its redirect. Front end only: categories from lib/productCategories.js, products from
// lib/products.js; the live website serves the same at dazzleshop.com.bd/collections/<handle>.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { contextOf } from '@/lib/seoItems';
import { demoHref, parsePath } from '@/lib/seo';
import { categoryProducts, catChildren, sortProducts, filterProducts } from '@/lib/storefront/catalog';
import { StoreChrome, useStoreItem, NotFound, Crumbs } from './storeChrome';
import { Sections, useLayout, ProductList } from './sections';

const CSS = `
.scat{padding-bottom:calc(var(--sf-section) / 2)}
.scat h1{font-size:var(--sf-fs-h1);margin-bottom:6px}
.scat-lead{margin:0 0 14px;color:var(--sf-muted);max-width:760px;line-height:1.6}
.scat-subs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.scat-subs a{display:inline-flex;align-items:center;min-height:36px;padding:0 14px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-btn);background:var(--sf-surface);text-decoration:none}
.scat-subs a:hover{border-color:var(--sf-primary);color:var(--sf-primary)}
.scat-bar{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;margin-bottom:16px}
.scat-bar>span{margin-right:auto;color:var(--sf-muted)}
.scat-bar select{min-height:40px;padding:0 10px;border-style:solid;border-color:var(--sf-field-line);border-width:var(--sf-fbt) var(--sf-fbx) var(--sf-fbb);border-radius:var(--sf-field-r);background:var(--sf-field-bg);box-shadow:var(--sf-field-shadow);color:var(--sf-text);font:inherit}
.scat-body{display:grid;grid-template-columns:minmax(0,1fr);gap:var(--sf-gap)}
.scat-body.is-left{grid-template-columns:240px minmax(0,1fr);align-items:start}
.scat-filters{display:flex;flex-direction:column;gap:16px;padding:16px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.scat-filters.is-top{flex-direction:row;flex-wrap:wrap;align-items:flex-end}
.scat-filters fieldset{border:0;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;min-width:0}
.scat-filters.is-top fieldset{flex-direction:row;flex-wrap:wrap;align-items:center;gap:6px 12px}
.scat-filters legend{padding:0;margin-bottom:6px;font-weight:var(--weight-semibold)}
.scat-filters label{display:flex;align-items:center;gap:8px;min-height:32px;cursor:pointer}
.scat-filters input[type="checkbox"]{width:18px;height:18px;accent-color:var(--sf-primary)}
.scat-price{display:flex;gap:6px;align-items:center}
.scat-price input{width:96px;min-height:36px}
.scat-pages{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-top:24px}
.scat-pages button{min-width:40px;min-height:36px;padding:0 10px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-btn);background:var(--sf-surface);color:var(--sf-text);font:inherit;cursor:pointer}
.scat-pages button[aria-current="page"]{background:var(--sf-primary);color:var(--sf-on-primary);border-color:var(--sf-primary)}
.scat-pages button[disabled]{opacity:.4;cursor:default}
.scat-more{height:1px}
.scat-drawer{position:fixed;inset:0;z-index:210}
.scat-drawer>button{position:absolute;inset:0;border:0;background:rgba(15,23,42,.45)}
.scat-drawer>div{position:absolute;right:0;top:0;bottom:0;width:min(340px,90vw);overflow-y:auto;padding:16px;background:var(--sf-surface);color:var(--sf-text)}
.scat-drawer .scat-filters{border:0;padding:0}
@media (max-width:899px){.scat-body.is-left{grid-template-columns:minmax(0,1fr)}.scat-body.is-left>.scat-filters,.scat-filters.is-top{display:none}}
@media (min-width:900px){.scat-fbtn.is-desk-hidden{display:none}}
`;

function Filters({ brands, f, setF, top }) {
  const toggle = (b) => setF((x) => ({ ...x, brands: x.brands.includes(b) ? x.brands.filter((y) => y !== b) : [...x.brands, b] }));
  return (
    <div className={'scat-filters' + (top ? ' is-top' : '')}>
      {brands.length > 1 ? <fieldset><legend>Brand</legend>{brands.map((b) => <label key={b}><input type="checkbox" checked={f.brands.includes(b)} onChange={() => toggle(b)} />{b}</label>)}</fieldset> : null}
      <fieldset><legend>Price (৳)</legend><span className="scat-price"><input className="sf-input" inputMode="numeric" aria-label="Lowest price" placeholder="Min" value={f.min} onChange={(e) => setF((x) => ({ ...x, min: e.target.value.replace(/\D/g, '') }))} /><span aria-hidden="true">–</span><input className="sf-input" inputMode="numeric" aria-label="Highest price" placeholder="Max" value={f.max} onChange={(e) => setF((x) => ({ ...x, max: e.target.value.replace(/\D/g, '') }))} /></span></fieldset>
      <fieldset><legend>Stock</legend><label><input type="checkbox" checked={f.inStock} onChange={(e) => setF((x) => ({ ...x, inStock: e.target.checked }))} />In stock only</label></fieldset>
      {f.brands.length || f.min || f.max || f.inStock ? <button type="button" className="sf-link" onClick={() => setF({ brands: [], min: '', max: '', inStock: false })}>Clear filters</button> : null}
    </div>
  );
}

function CategoryMain({ c, ctx, v }) {
  const all = useMemo(() => categoryProducts(c.path), [c.path]);
  const subs = useMemo(() => catChildren(c.path), [c.path]);
  const [sort, setSort] = useState(v.sortDefault || 'featured');
  const [f, setF] = useState({ brands: [], min: '', max: '', inStock: false });
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(false);
  const per = Number(v.perPage) || 24;
  const brands = useMemo(() => [...new Set(all.map((p) => p.brand).filter(Boolean))].sort(), [all]);
  const list = useMemo(() => sortProducts(filterProducts(all, { brands: f.brands, min: Number(f.min) || 0, max: Number(f.max) || 0, inStock: f.inStock }), sort), [all, f, sort]);
  useEffect(() => { setPage(1); }, [f, sort]);
  const pages = Math.max(1, Math.ceil(list.length / per));
  const infinite = v.paging === 'infinite';
  const shown = infinite ? list.slice(0, page * per) : list.slice((page - 1) * per, page * per);
  const more = useRef(null);
  useEffect(() => {
    if (!infinite || !more.current || page >= pages || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) setPage((n) => n + 1); }, { rootMargin: '400px' });
    io.observe(more.current);
    return () => io.disconnect();
  }, [infinite, page, pages]);
  const nFil = f.brands.length + (f.min ? 1 : 0) + (f.max ? 1 : 0) + (f.inStock ? 1 : 0);
  const mode = v.filters || 'left';
  return (
    <div className="scat">
      <h1>{c.name}</h1>
      {c.desc ? <p className="scat-lead">{c.desc}</p> : null}
      {subs.length ? <nav className="scat-subs" aria-label="Subcategories">{subs.map((s) => <a key={s.id} href={s.href}>{s.name}</a>)}</nav> : null}
      <div className="scat-bar">
        <span role="status">{list.length} product{list.length === 1 ? '' : 's'}</span>
        <button type="button" className={'sf-btn sf-btn--sm sf-btn--line scat-fbtn' + (mode === 'drawer' ? '' : ' is-desk-hidden')} onClick={() => setDrawer(true)}><Icon name="sliders-horizontal" width="16" height="16" aria-hidden="true" />Filter{nFil ? ` (${nFil})` : ''}</button>
        <label className="sr-only" htmlFor="scat-sort">Sort</label>
        <select id="scat-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="featured">Featured</option><option value="newest">Newest</option><option value="best">Best selling</option><option value="price-asc">Price, low to high</option><option value="price-desc">Price, high to low</option>
        </select>
      </div>
      {mode === 'top' ? <Filters brands={brands} f={f} setF={setF} top /> : null}
      <div className={'scat-body' + (mode === 'left' ? ' is-left' : '')} style={mode === 'top' ? { marginTop: 'var(--sf-gap)' } : undefined}>
        {mode === 'left' ? <Filters brands={brands} f={f} setF={setF} /> : null}
        <div>
          {shown.length ? <ProductList list={shown} v={v} /> : <p className="sf-muted">{all.length ? 'No products match these filters.' : 'No products here yet.'}</p>}
          {infinite ? (page < pages ? <div ref={more} className="scat-more" aria-hidden="true" /> : null) : pages > 1 ? (
            <nav className="scat-pages" aria-label="Pages">
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><Icon name="chevron-left" width="16" height="16" aria-hidden="true" /></button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => <button key={n} type="button" aria-current={n === page ? 'page' : undefined} onClick={() => setPage(n)}>{n}</button>)}
              <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} aria-label="Next page"><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button>
            </nav>
          ) : null}
        </div>
      </div>
      {drawer ? (
        <div className="scat-drawer" role="dialog" aria-modal="true" aria-label="Filters" onKeyDown={(e) => { if (e.key === 'Escape') setDrawer(false); }}>
          <button type="button" aria-label="Close filters" tabIndex={-1} onClick={() => setDrawer(false)} />
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><b>Filters</b><button type="button" className="sfi" aria-label="Close" autoFocus onClick={() => setDrawer(false)}><Icon name="x" width="20" height="20" aria-hidden="true" /></button></div>
            <Filters brands={brands} f={f} setF={setF} />
            <button type="button" className="sf-btn sf-btn--fill" style={{ width: '100%', marginTop: 16 }} onClick={() => setDrawer(false)}>Show {list.length} product{list.length === 1 ? '' : 's'}</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function StoreCategory() {
  const st = useStoreItem('category');
  const c = st.item;
  const ctx = useMemo(() => (c ? contextOf('category', c) : null), [c]);
  const lay = useLayout('category', { category: c }, c ? c.path : '');
  return (
    <StoreChrome screen="StoreCategory" kind="category" css={CSS} head={st.ready ? st.head : null} movedFrom={st.movedFrom} headerId={lay ? lay.header : ''}
      current={(it) => !!c && it.link && it.link.type === 'category' && it.link.ref === c.path}
      preview={st.ready && st.shows && c && c.hidden ? <>Preview · this category is hidden from the shop menu <Link href={`/categories?id=${c.id}`} style={{ color: 'inherit' }}>Edit category</Link></> : null}>
      {(shell) => (!st.ready || !lay ? <div style={{ minHeight: 400 }} aria-busy="true" /> : st.shows ? (
        <Sections sections={lay.sections} values={shell.values} catalog={shell.catalog}
          main={(
            <div className="sf-wrap">
              <Crumbs items={(ctx.breadcrumbs || []).map((b, i, all) => { const x = parsePath(b.path); return { name: b.name, href: i < all.length - 1 && x ? demoHref(x.kind, x.handle) : undefined }; })} />
              <CategoryMain c={c} ctx={ctx} v={shell.values} />
            </div>
          )} />
      ) : <NotFound shell={shell} />)}
    </StoreChrome>
  );
}
