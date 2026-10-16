'use client';
// Grid Shop — Services › Business supplies (/grid-shop; Batch D): packaging, POS machines and printers, labels and
// printing, shop supplies from GridCommerce and its vendors. Category tabs and search; each card shows the picture, this
// store's price per unit (gridShop.priceFor: a discount shows the old price struck through; bulk prices from a quantity),
// who sells it (GridCommerce or a vendor such as Star Tech, who ships it straight to you) and the days; Add puts it in
// the cart (side panel). Orders in progress are one line at the top. Closed stores see why (marketAccess 'shop').
// Data: lib/platform/gridShop.js.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField } from '@/components/ui/IndexKit';
import { GS_CATS, liveProducts, addToCart, cartOf, getOrders, statusOf, availability } from '@/lib/platform/gridShop';
import { SELF_SHOP } from '@/lib/platform/services';
import { SvcFrame, tk } from './svcShared';
import { useGridShop, ProductPic, FulfilNote, CartSheet, PriceTag, storePrice, GS_CSS } from './gsShared';

export default function GridShop() {
  const { ready, tick } = useGridShop();
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [cart, setCart] = useState(false);
  const list = useMemo(() => (ready ? liveProducts() : []), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const inCart = ready ? cartOf(SELF_SHOP).reduce((a, c) => a + c.qty, 0) : 0;
  const open = ready ? getOrders(SELF_SHOP).filter((o) => !['delivered', 'cancelled'].includes(statusOf(o))) : [];
  const shown = list.filter((p) => (cat === 'all' || p.cat === cat) && (!q.trim() || (p.name + ' ' + p.blurb + ' ' + (p.vendorId || 'gridcommerce')).toLowerCase().includes(q.trim().toLowerCase())));
  const tabs = [{ key: 'all', id: 'gs-tab-all', label: 'All', count: ready ? list.length : null, on: cat === 'all', onClick: () => setCat('all') },
    ...GS_CATS.map((c) => ({ key: c.id, id: 'gs-tab-' + c.id, label: c.name, count: ready ? list.filter((p) => p.cat === c.id).length : null, on: cat === c.id, onClick: () => setCat(c.id) }))];
  const add = (p) => { const r = addToCart(SELF_SHOP, p.id, 1); if (r.ok === false) { toast(r.error, { tone: 'error' }); return; } toast(`${p.name} added to the cart`); };

  return (
    <SvcFrame gate="shop" screen="GridShop" active="gs-shop" page="Business supplies" crumb="Services" css={GS_CSS} after={<CartSheet open={cart} onClose={() => setCart(false)} />}>
      <ShopHeader icon="shopping-bag" title="Business supplies"
        about="Grid Shop: packaging, POS machines and printers, labels and shop supplies chosen to work with GridCommerce. GridCommerce sells some items from its own stock; vendors such as Star Tech sell others and ship them straight to you. Each card says who sells it and how many days it takes. Bulk prices apply from the quantity shown. Pay with bKash, Nagad, card or GridCommerce credits."
        secondary={[{ label: open.length ? `My orders (${open.length})` : 'My orders', href: '/grid-shop-orders' }]}
        primary={{ label: inCart ? `Cart (${inCart})` : 'Cart', icon: 'shopping-cart', onClick: () => setCart(true) }} />
      <section className="ix-card" aria-label="Products">
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Categories" /></div>
        <div style={{ padding: 'var(--space-2) var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}><SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search supplies" /></div>
        {!ready ? <div style={{ minHeight: 320 }} aria-busy="true" /> : shown.length ? (
          <div className="svc-pad">
            <div className="gs-grid">
              {shown.map((p) => {
                const av = availability(p, p.moq || 1);
                const b = storePrice(p, p.moq || 1);
                const tier = (p.tiers || [])[0];
                return (
                  <article key={p.id} className="gs-card">
                    <Link href={'/grid-shop-item?id=' + p.id} style={{ color: 'inherit', textDecoration: 'none' }} aria-label={p.name}><ProductPic p={p} /></Link>
                    <div className="gs-card__body">
                      <Link href={'/grid-shop-item?id=' + p.id} style={{ color: 'inherit', textDecoration: 'none' }}><b>{p.name}</b></Link>
                      <FulfilNote p={p} />
                      {!p.madeToOrder && p.stock > 0 && p.stock <= 5 ? <span className="gs-stock">Only {p.stock} left</span> : null}
                    </div>
                    <div className="gs-card__foot">
                      <PriceTag b={b} /><span className="gs-unit">a {p.unit}{tier ? ` · ${tk(storePrice(p, tier.qty).storeUnitNet)} from ${tier.qty}` : ''}</span>
                      <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" style={{ marginLeft: 'auto' }} disabled={!av.ok} onClick={() => add(p)}>{av.ok ? <><Icon name="plus" width="14" height="14" aria-hidden="true" />Add</> : av.why}</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : <div className="ix-empty"><EmptyState icon="package-search" title="Nothing here" body="Try another category or word." /></div>}
      </section>
    </SvcFrame>
  );
}
