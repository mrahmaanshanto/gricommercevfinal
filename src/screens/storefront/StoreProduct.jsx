'use client';
// Product page — what a customer sees for one product (/product?handle=galaxy-a15-6-128gb): photos, name, rating,
// price (VAT included) with the old price, stock, short description, options, Add to cart; then the description and
// the product FAQ. The head carries its SEO and the automatic Product schema (price in BDT, availability from live
// stock, rating from Reviews), the breadcrumb and the FAQ (lib/seo.js › autoSchema; the shop's own schema replaces
// a type it also makes). Active products only; ?preview=1 shows a draft to staff. A renamed product's old address
// follows its redirect. A plain page for now: the storefront builder (Module A) will draw it with the theme.
// Front end only: products from lib/products.js; the live website serves the same at dazzleshop.com.bd/products/<handle>.

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { formatBDT } from '@/lib/format';
import { contextOf } from '@/lib/seoItems';
import { demoHref, parsePath } from '@/lib/seo';
import { summaryText } from '@/lib/productReviews';
import { sanitizeHtml } from '@/screens/products/RichText';
import { StoreChrome, useStoreItem, NotFound, Crumbs } from './storeChrome';

const CSS = `
.spd{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:40px;align-items:start}
.spd-photo{aspect-ratio:1/1;border-radius:var(--radius-xl);overflow:hidden;display:grid;place-items:center;background:#eef2f6;color:#334155;font-size:var(--text-5xl);font-weight:var(--weight-semibold)}
.spd-photo img{width:100%;height:100%;object-fit:cover}
.spd-thumbs{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.spd-thumbs img{width:64px;height:64px;object-fit:cover;border-radius:var(--radius-lg);border:1px solid #e2e8f0}
.spd-info{display:flex;flex-direction:column;gap:14px}
.spd-info h1{margin:0;font-size:var(--text-3xl);line-height:var(--text-3xl-lh);font-weight:var(--weight-semibold);color:#0f172a}
.spd-brand{font-size:var(--text-sm);color:var(--text-muted)}
.spd-price{display:flex;align-items:baseline;gap:10px}
.spd-price b{font-size:var(--text-2xl);font-weight:var(--weight-semibold);color:#0f172a;font-family:var(--font-data)}
.spd-price s{color:var(--text-muted);font-family:var(--font-data)}
.spd-off{padding:2px 8px;border-radius:var(--radius-full);background:#fde7e7;color:#b91c1c;font-size:var(--text-xs);font-weight:var(--weight-medium)}
.spd-stock{font-size:var(--text-sm)}
.spd-stock.is-in{color:#047857}.spd-stock.is-out{color:#b91c1c}
.spd-opts{display:flex;flex-direction:column;gap:6px}
.spd-opts span{display:flex;flex-wrap:wrap;gap:6px}
.spd-opts i{font-style:normal;padding:6px 12px;border:1px solid #cbd5e1;border-radius:var(--radius-full);font-size:var(--text-sm);color:#334155}
.spd-buy{display:flex;gap:10px;flex-wrap:wrap}
.spd-sec{margin-top:32px}
.spd-sec h2{margin:0 0 12px;font-size:var(--text-lg);font-weight:var(--weight-semibold);color:#0f172a}
.spd-desc{font-size:var(--text-sm);line-height:1.7;color:#334155}
.spd-desc img{max-width:100%;height:auto}
.spd-desc table{border-collapse:collapse}.spd-desc td,.spd-desc th{border:1px solid #e2e8f0;padding:6px 10px}
@media (max-width:860px){.spd{grid-template-columns:1fr;gap:20px}}
`;

/** The description's links to the shop's own pages open their customer view here. */
const demoLinks = (html) => String(html || '').replace(/href="([^"]+)"/g, (all, u) => { const p = /^\/|dazzleshop\.com\.bd/i.test(u) ? parsePath(u) : null; return p ? `href="${demoHref(p.kind, p.handle)}"` : all; });

export default function StoreProduct() {
  const st = useStoreItem('product');
  const p = st.item;
  const ctx = useMemo(() => (p ? contextOf('product', p) : null), [p]);
  const facts = (ctx && ctx.product) || {};
  const off = p && p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
  const desc = useMemo(() => (p && p.long ? demoLinks(/</.test(p.long) ? sanitizeHtml(p.long) : '<p>' + String(p.long).replace(/</g, '&lt;') + '</p>') : ''), [p]);
  const faq = (ctx && ctx.faq) || [];
  return (
    <StoreChrome screen="StoreProduct" css={CSS} head={st.ready ? st.head : null} movedFrom={st.movedFrom}
      preview={st.ready && st.shows && p && p.st !== 'active' ? <>Preview · this product is not on sale yet <Link href={`/add-product?id=${p.id}`} style={{ color: 'inherit' }}>Edit product</Link></> : null}>
      {() => (!st.ready ? <div style={{ minHeight: 400 }} aria-busy="true" /> : st.shows ? (<>
        <Crumbs wide items={[...(ctx.breadcrumbs || []).slice(0, -1).map((b) => { const x = parsePath(b.path); return { name: b.name, href: x ? demoHref(x.kind, x.handle) : undefined }; }), { name: p.name }]} />
        <div className="spg-card spg-wide">
          <div className="spd">
            <div>
              <div className="spd-photo" style={{ background: p.tbg || undefined }}>{ctx.images[0] ? <img src={ctx.images[0].src} alt={ctx.images[0].alt || p.name} /> : <span aria-hidden="true">{p.name.slice(0, 1)}</span>}</div>
              {ctx.images.length > 1 ? <div className="spd-thumbs">{ctx.images.slice(1, 6).map((x, i) => <img key={i} src={x.src} alt={x.alt || ''} />)}</div> : null}
            </div>
            <div className="spd-info">
              {p.brand ? <span className="spd-brand">{p.brand}</span> : null}
              <h1>{p.name}</h1>
              {facts.rating && facts.rating.count ? <span className="spd-brand">{summaryText(facts.rating)}</span> : null}
              <div className="spd-price"><b>{formatBDT(p.price)}</b>{off ? <><s>{formatBDT(p.mrp)}</s><span className="spd-off">{off}% off</span></> : null}</div>
              <span className="spd-brand">VAT included · cash on delivery all over Bangladesh</span>
              <span className={'spd-stock ' + (facts.stock > 0 ? 'is-in' : 'is-out')}>{facts.stock > 0 ? (facts.stock < 10 ? 'Only ' + facts.stock + ' left' : 'In stock') : p.oversell ? 'Pre-order: ships when it arrives' : 'Out of stock'}</span>
              {p.short ? <p className="spd-desc" style={{ margin: 0 }}>{String(p.short).replace(/<[^>]+>/g, ' ')}</p> : null}
              {(p.opts || []).length ? <div className="spd-opts">{p.opts.map((o) => <div key={o.name}><span className="spd-brand">{o.name}</span><span>{(o.values || []).map((x) => <i key={x}>{x}</i>)}</span></div>)}</div> : null}
              <div className="spd-buy">
                <button type="button" className="gc-btn gc-btn--solid" disabled={facts.stock <= 0 && !p.oversell} onClick={() => toast(p.name + ' added to the cart.')}><Icon name="shopping-bag" width="16" height="16" aria-hidden="true" />Add to cart</button>
                <Link href="/checkout" className="gc-btn gc-btn--neutral" style={{ textDecoration: 'none' }}>Go to checkout</Link>
              </div>
            </div>
          </div>
          {desc ? <section className="spd-sec"><h2>Description</h2><div className="spd-desc" dangerouslySetInnerHTML={{ __html: desc }} /></section> : null}
          {faq.length ? <section className="spd-sec"><h2>Questions</h2><div className="bl-article"><div className="bl-a-faq">{faq.map((x, i) => <details key={i}><summary>{x.q}</summary><p>{x.a}</p></details>)}</div></div></section> : null}
        </div>
      </>) : <NotFound />)}
    </StoreChrome>
  );
}
