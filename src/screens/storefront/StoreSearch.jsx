'use client';
// Search — the store's search results (/search?q=…&cat=…), drawn with the theme's Search layout: the search box with
// the category picker, how many products match, and the products as cards (the theme's product card). Nothing found →
// the categories to browse instead. Products from the shop's own list (Active, sold online).

import React, { useEffect, useMemo, useState } from 'react';
import { searchProducts, topCategories } from '@/lib/storefront/catalog';
import { StoreChrome, Crumbs } from './storeChrome';
import { SearchForm } from './storeHeader';
import { Sections, useLayout, ProductList } from './sections';

const CSS = `
.ssr{display:flex;flex-direction:column;gap:16px;padding-bottom:var(--sf-section)}
.ssr h1{font-size:var(--sf-fs-h1)}
.ssr-cats{display:flex;flex-wrap:wrap;gap:8px}
.ssr-cats a{display:inline-flex;align-items:center;min-height:36px;padding:0 14px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-btn);background:var(--sf-surface);text-decoration:none}
`;

export default function StoreSearch() {
  const lay = useLayout('search', {}, 'search');
  const [q, setQ] = useState(null);
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    setQ({ q: u.get('q') || '', cat: u.get('cat') || '' });
  }, []);
  const head = useMemo(() => (q ? { title: q.q ? `Search: ${q.q}` : 'Search', description: '', robots: 'noindex, follow', canonical: '', og: {}, jsonld: [] } : null), [q]);
  return (
    <StoreChrome screen="StoreSearch" kind="search" head={head} headerId={lay ? lay.header : ''} css={CSS}>
      {(shell) => {
        if (!lay || !q) return <div style={{ minHeight: 400 }} aria-busy="true" />;
        const list = searchProducts(q.q, q.cat);
        const main = (
          <div className="sf-wrap">
            <Crumbs items={[{ name: 'Search' }]} />
            <div className="ssr">
              <h1>{q.q ? `Results for “${q.q}”` : 'All products'}</h1>
              <div style={{ maxWidth: 640 }}><SearchForm el={{ cats: true, size: 'L' }} ctx={shell} idp="ssr" value={q.q} cat={q.cat} /></div>
              <p className="sf-muted" style={{ margin: 0 }} role="status">{list.length} product{list.length === 1 ? '' : 's'}{q.cat ? ` in ${q.cat}` : ''}</p>
              {list.length ? <ProductList list={list.slice(0, 48)} v={shell.values} /> : (
                <>
                  <p style={{ margin: 0 }}>Nothing matches. Check the spelling, or browse a category:</p>
                  <div className="ssr-cats">{topCategories().map((c) => <a key={c.id} href={c.href}>{c.name}</a>)}</div>
                </>
              )}
            </div>
          </div>
        );
        return <Sections sections={lay.sections} main={main} values={shell.values} catalog={shell.catalog} />;
      }}
    </StoreChrome>
  );
}
