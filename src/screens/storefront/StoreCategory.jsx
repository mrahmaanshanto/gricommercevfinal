'use client';
// Category page — what a customer sees for one product category (/category?handle=chargers-and-cables): its name and
// description, then its active products (each opens its product page). The head carries the category's SEO with a
// CollectionPage and breadcrumb schema. Categories hidden from the shop menu show only with ?preview=1. A renamed
// category's old address follows its redirect. A plain page for now: the storefront builder (Module A) will draw it
// with the theme. Front end only: categories from lib/productCategories.js, products from lib/products.js; the live
// website serves the same at dazzleshop.com.bd/collections/<handle>.

import React, { useMemo } from 'react';
import Link from 'next/link';
import { formatBDT } from '@/lib/format';
import { productsIn } from '@/lib/productCategories';
import { productHandle } from '@/lib/products';
import { contextOf } from '@/lib/seoItems';
import { demoHref, parsePath } from '@/lib/seo';
import { StoreChrome, useStoreItem, NotFound, Crumbs } from './storeChrome';

const CSS = `
.scat h1{margin:0 0 8px;font-size:var(--text-3xl);line-height:var(--text-3xl-lh);font-weight:var(--weight-semibold);color:#0f172a}
.scat-lead{margin:0 0 24px;font-size:var(--text-sm);line-height:1.7;color:#475569;max-width:720px}
.scat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px}
.scat-card{display:flex;flex-direction:column;gap:6px;padding:12px;border:1px solid #e2e8f0;border-radius:var(--radius-xl);background:#fff;color:inherit;text-decoration:none}
.scat-card:hover{border-color:#003087}
.scat-img{aspect-ratio:1/1;border-radius:var(--radius-lg);display:grid;place-items:center;overflow:hidden;font-size:var(--text-3xl);font-weight:var(--weight-semibold);color:#334155}
.scat-img img{width:100%;height:100%;object-fit:cover}
.scat-card b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:#0f172a}
.scat-card span{font-family:var(--font-data);font-size:var(--text-sm);color:#0f172a}
.scat-card small{font-size:var(--text-xs);color:var(--text-muted)}
`;

export default function StoreCategory() {
  const st = useStoreItem('category');
  const c = st.item;
  const ctx = useMemo(() => (c ? contextOf('category', c) : null), [c]);
  const list = useMemo(() => (c ? productsIn(c.path).filter((p) => p.st === 'active') : []), [c]);
  return (
    <StoreChrome screen="StoreCategory" css={CSS} head={st.ready ? st.head : null} movedFrom={st.movedFrom}
      preview={st.ready && st.shows && c && c.hidden ? <>Preview · this category is hidden from the shop menu <Link href={`/categories?id=${c.id}`} style={{ color: 'inherit' }}>Edit category</Link></> : null}>
      {() => (!st.ready ? <div style={{ minHeight: 400 }} aria-busy="true" /> : st.shows ? (<>
        <Crumbs wide items={(ctx.breadcrumbs || []).map((b, i, all) => { const x = parsePath(b.path); return { name: b.name, href: i < all.length - 1 && x ? demoHref(x.kind, x.handle) : undefined }; })} />
        <div className="spg-card spg-wide scat">
          <h1>{c.name}</h1>
          {c.desc ? <p className="scat-lead">{c.desc}</p> : null}
          {list.length ? (
            <div className="scat-grid">
              {list.map((p) => {
                const img = (p.media || []).find((m) => m.src && (m.kind || 'image') === 'image');
                const stock = (p.variants || []).length ? p.variants.reduce((a, v) => a + (Number(v.stock) || 0), 0) : Number(p.inv) || 0;
                return (
                  <Link key={p.id} href={demoHref('product', productHandle(p))} className="scat-card">
                    <span className="scat-img" style={{ background: p.tbg || '#eef2f6' }}>{img ? <img src={img.src} alt={img.alt || p.name} /> : <span aria-hidden="true">{p.name.slice(0, 1)}</span>}</span>
                    <b>{p.name}</b>
                    <span>{formatBDT(p.price)}</span>
                    <small>{stock > 0 ? 'In stock' : p.oversell ? 'Pre-order' : 'Out of stock'}</small>
                  </Link>
                );
              })}
            </div>
          ) : <p className="scat-lead">No products here yet.</p>}
        </div>
      </>) : <NotFound />)}
    </StoreChrome>
  );
}
