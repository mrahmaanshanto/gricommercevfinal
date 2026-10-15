'use client';
// Landing page — what a customer sees for a published landing page (/lp?handle=wireless-earbuds-pro): the product with
// its offer line, price and an Order now button (to checkout). The head carries the page's SEO and the product's schema
// (lib/seo.js). Drafts show only with ?preview=1. A moved page follows its redirect. A plain page for now: the landing
// page builder's parts are drawn here once the builder works (its parts are still a design mock-up).
// Front end only: pages from lib/landingPages.js; the live website serves the same at dazzleshop.com.bd/lp/<handle>.

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { formatBDT } from '@/lib/format';
import { allProducts, getSavedProducts } from '@/lib/products';
import { contextOf } from '@/lib/seoItems';
import { dhakaText } from '@/lib/seo';
import { StoreChrome, useStoreItem, NotFound } from './storeChrome';

const CSS = `
.slp{display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center}
.slp h1{margin:0;font-size:var(--text-3xl);line-height:var(--text-3xl-lh);font-weight:var(--weight-semibold);color:#0f172a}
.slp-photo{width:min(360px,100%);aspect-ratio:1/1;border-radius:var(--radius-xl);overflow:hidden;display:grid;place-items:center;font-size:var(--text-5xl);font-weight:var(--weight-semibold);color:#334155}
.slp-photo img{width:100%;height:100%;object-fit:cover}
.slp-offer{padding:6px 14px;border-radius:var(--radius-full);background:#fff4e0;color:#a14f06;font-size:var(--text-sm);font-weight:var(--weight-medium)}
.slp-price{display:flex;align-items:baseline;gap:10px;font-family:var(--font-data)}
.slp-price b{font-size:var(--text-2xl);font-weight:var(--weight-semibold);color:#0f172a}
.slp-price s{color:var(--text-muted)}
.slp p{margin:0;max-width:560px;font-size:var(--text-sm);line-height:1.7;color:#475569}
`;

export default function StoreLanding() {
  const st = useStoreItem('landing');
  const lp = st.item;
  const p = useMemo(() => (lp ? allProducts(getSavedProducts()).find((x) => x.id === lp.productId || x.sku === lp.sku) : null), [lp]);
  const ctx = useMemo(() => (lp ? contextOf('landing', lp) : null), [lp]);
  return (
    <StoreChrome screen="StoreLanding" head={st.ready ? st.head : null} movedFrom={st.movedFrom} css={CSS}
      preview={st.ready && st.shows && lp && lp.status !== 'published' ? <>Preview · this page is a draft{lp.goLiveAt ? ', going live ' + dhakaText(lp.goLiveAt) : ''} <Link href={`/landing-page-builder?id=${lp.id}`} style={{ color: 'inherit' }}>Edit page</Link></> : null}>
      {(shell) => (!st.ready ? <div style={{ minHeight: 400 }} aria-busy="true" /> : st.shows ? (
        <article className="spg-card slp">
          <span className="slp-photo" style={{ background: (p && p.tbg) || '#eef2f6' }}>{ctx.images[0] ? <img src={ctx.images[0].src} alt={ctx.images[0].alt || lp.title} /> : <span aria-hidden="true">{(lp.title || 'P').slice(0, 1)}</span>}</span>
          {lp.offerLine ? <span className="slp-offer">{lp.offerLine}</span> : null}
          <h1>{lp.title}</h1>
          {p ? <div className="slp-price"><b>{formatBDT(p.price)}</b>{p.mrp && p.mrp > p.price ? <s>{formatBDT(p.mrp)}</s> : null}</div> : null}
          {ctx.description ? <p>{String(ctx.description).slice(0, 280)}</p> : null}
          <Link href="/checkout" className="gc-btn gc-btn--solid" style={{ textDecoration: 'none' }}><Icon name="shopping-bag" width="16" height="16" aria-hidden="true" />Order now · cash on delivery</Link>
        </article>
      ) : <NotFound shell={shell} />)}
    </StoreChrome>
  );
}
