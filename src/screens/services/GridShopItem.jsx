'use client';
// Grid Shop › a product (/grid-shop-item?id=; Batch D, vendors Batch E): pictures (tap for the large view), this store's
// price per unit and bulk prices (gridShop.priceFor: a discount shows the old price struck through), what it is, who sells
// it (GridCommerce or a vendor, with the vendor's return and warranty terms) and the days, quantity (at least the minimum;
// stock limits it), Add to cart or Buy now (straight to checkout). Data: lib/platform/gridShop.js.

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { navigate } from '@/runtime/routes';
import { productById, addToCart, availability, gsCatName, cartOf, isListed, vendorOf } from '@/lib/platform/gridShop';
import { SELF_SHOP } from '@/lib/platform/services';
import { SvcFrame, tk, query } from './svcShared';
import { useGridShop, ProductPic, FulfilNote, CartSheet, PriceTag, storePrice, GS_CSS } from './gsShared';
import { Lightbox, GIG_CSS } from './ServiceDetail';

export default function GridShopItem() {
  const { ready } = useGridShop();
  const [qty, setQty] = useState(null);
  const [cart, setCart] = useState(false);
  const [big, setBig] = useState(null);
  const p = ready ? productById(query('id')) : null;
  if (!ready) return <SvcFrame gate="shop" screen="GridShopItem" active="gs-shop" page="Business supplies" crumb="Services"><div style={{ minHeight: 400 }} aria-busy="true" /></SvcFrame>;
  if (!p || !isListed(p)) return <SvcFrame gate="shop" screen="GridShopItem" active="gs-shop" page="Business supplies" crumb="Services" narrow><RecordHeader back="/grid-shop" backLabel="Business supplies" title="Not on sale" /><section className="ix-card ix-empty"><EmptyState icon="package-x" title="This item is not on sale right now" actionLabel="See supplies" onAction={() => navigate('/grid-shop')} /></section></SvcFrame>;
  const q = qty == null ? p.moq || 1 : qty;
  const av = availability(p, q);
  const b = storePrice(p, Math.max(1, q));
  const price = b.storeUnitNet;
  const v = vendorOf(p);
  const pics = [...(p.cover ? [{ src: p.cover, caption: p.name }] : []), ...(p.gallery || []).filter((g) => g.src !== p.cover)];
  const inCart = cartOf(SELF_SHOP).reduce((a, c) => a + c.qty, 0);
  const add = (go) => { const r = addToCart(SELF_SHOP, p.id, q); if (r.ok === false) { toast(r.error, { tone: 'error' }); return; } if (go) navigate('/grid-shop-checkout'); else toast(`${q} × ${p.name} in the cart`); };
  return (
    <SvcFrame gate="shop" screen="GridShopItem" active="gs-shop" page={p.name} crumb="Services" css={GIG_CSS + GS_CSS}
      after={<><CartSheet open={cart} onClose={() => setCart(false)} /><Lightbox pics={pics} at={big} onAt={setBig} onClose={() => setBig(null)} /></>}>
      <RecordHeader back="/grid-shop" backLabel="Business supplies" title={p.name} meta={gsCatName(p.cat)}
        primary={{ label: inCart ? `Cart (${inCart})` : 'Cart', icon: 'shopping-cart', onClick: () => setCart(true) }} />
      <div className="ix-record">
        <div className="ix-main">
          <section className="ix-card svc-pad" aria-label="Pictures">
            {pics.length ? <button type="button" className="gs-pic gs-pic--big" style={{ backgroundImage: `url(${pics[0].src})`, width: '100%', cursor: 'zoom-in', padding: 0 }} aria-label="See larger" onClick={() => setBig(0)} /> : <ProductPic p={p} className="gs-pic gs-pic--big" big />}
            {pics.length > 1 ? <div className="sd-thumbs">{pics.map((g, i) => <button key={i} type="button" aria-label={g.caption || 'Picture ' + (i + 1)} style={{ backgroundImage: `url(${g.src})` }} onClick={() => setBig(i)} />)}</div> : null}
          </section>
          <section className="ix-card svc-pad" aria-labelledby="gi-about">
            <h2 id="gi-about">About it</h2>
            <p style={{ color: 'var(--text-body)' }}>{p.blurb}</p>
            {(p.details || []).length ? <ul className="svc-list">{p.details.map((d) => <li key={d}><Icon name="check" width="14" height="14" aria-hidden="true" />{d}</li>)}</ul> : null}
          </section>
          <section className="ix-card svc-pad" aria-labelledby="gi-seller">
            <h2 id="gi-seller">Sold by {v ? v.name : 'GridCommerce'}</h2>
            <p className="gc-help" style={{ margin: 0 }}>{v ? `${v.about ? v.about + '. ' : ''}${v.name} packs it and ships it straight to you; GridCommerce takes your payment and stands behind the order.` : 'Packed at the GridCommerce warehouse and sent by courier.'}</p>
            {v && (v.terms.returns || v.terms.warranty) ? <ul className="svc-list">{v.terms.returns ? <li><Icon name="undo-2" width="14" height="14" aria-hidden="true" />Returns: {v.terms.returns}</li> : null}{v.terms.warranty ? <li><Icon name="shield-check" width="14" height="14" aria-hidden="true" />Warranty: {v.terms.warranty}</li> : null}</ul> : null}
          </section>
        </div>
        <aside className="ix-side" aria-label="Buy">
          <section className="ix-card sd-pkg sd-side">
            <div className="sd-pkg__top"><b>{p.unit.charAt(0).toUpperCase() + p.unit.slice(1)}</b><PriceTag b={b} cls="sd-price" /></div>
            <span className="gc-help" style={{ margin: 0 }}>+ 15% VAT · delivery ৳100 in Dhaka, ৳180 outside, free over ৳10,000</span>
            {(p.tiers || []).length ? <div className="gs-tiers">{p.tiers.map((t) => <span key={t.qty}>{tk(storePrice(p, t.qty).storeUnitNet)} each from {t.qty}</span>)}</div> : null}
            <FulfilNote p={p} />
            {p.madeToOrder ? <span className="gs-ful">Made for you after you pay</span> : <span className={p.stock <= 5 ? 'gs-stock' : 'gs-ful'}>{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</span>}
            <div className="svc-row">
              <span className="gc-label" id="gi-qty" style={{ margin: 0 }}>How many</span>
              <span className="gs-qty" role="group" aria-labelledby="gi-qty">
                <button type="button" aria-label="One less" onClick={() => setQty(Math.max(p.moq || 1, q - 1))}><Icon name="minus" width="14" height="14" /></button>
                <input inputMode="numeric" aria-label="Quantity" value={q} onChange={(e) => setQty(Math.max(0, Number(e.target.value.replace(/\D/g, '')) || 0))} />
                <button type="button" aria-label="One more" onClick={() => setQty(q + 1)}><Icon name="plus" width="14" height="14" /></button>
              </span>
            </div>
            {!av.ok ? <p className="gc-help gc-help--error" style={{ margin: 0 }}>{av.why}</p> : <span className="svc-sum"><div className="is-total"><span>{q} × {tk(price)}</span><span>{tk(q * price)}</span></div></span>}
            <button type="button" className="gc-btn gc-btn--solid" disabled={!av.ok} onClick={() => add(true)}>Buy now</button>
            <button type="button" className="gc-btn gc-btn--neutral" disabled={!av.ok} onClick={() => add(false)}><Icon name="shopping-cart" width="16" height="16" aria-hidden="true" />Add to cart</button>
          </section>
        </aside>
      </div>
    </SvcFrame>
  );
}
