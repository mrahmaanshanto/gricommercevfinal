'use client';
// gsShared — what the merchant's Grid Shop pages share (Batch D; Services › Business supplies: /grid-shop,
// /grid-shop-item, /grid-shop-checkout, /grid-shop-orders, /grid-shop-order): useGridShop() (lib/platform/gridShop.js after
// mount, re-read on change and from other tabs), the product picture (or a tile with its icon when there is none or it
// does not load), who sells it ("Sold by Star Tech" / "Sold by GridCommerce"), the store's price for this shop
// (gridShop.priceFor: a discount shows the old price struck through with the % off), the cart side panel, the status
// badge and the CSS. Pages use SvcFrame with gate="shop" (closed stores see why).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { read, GS_EVENT, GS_KEY, ORDER_STATUS, statusOf, cartLines, setCartQty, deliveryFor, soldBy, priceFor } from '@/lib/platform/gridShop';
import { SELF_SHOP } from '@/lib/platform/services';
import { tk } from './svcShared';

export function useGridShop() {
  const [st, set] = useState({ ready: false, tick: 0 });
  useEffect(() => {
    const load = () => { read(); set((x) => ({ ready: true, tick: x.tick + 1 })); };
    load();
    const onStorage = (e) => { if (!e.key || e.key === GS_KEY) load(); };
    window.addEventListener(GS_EVENT, load); window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener(GS_EVENT, load); window.removeEventListener('storage', onStorage); };
  }, []);
  return st;
}

export function ProductPic({ p, className = 'gs-pic', big }) {
  const [bad, setBad] = useState('');
  if (p.cover && bad !== p.cover) return <span className={className + ' has-img'} role="img" aria-label={p.name}><img src={p.cover} alt="" loading="lazy" decoding="async" onError={() => setBad(p.cover)} /></span>;
  return <span className={className + ' is-tile gs-tile--' + p.cat} aria-hidden="true"><Icon name={p.icon || 'package'} width={big ? 64 : 36} height={big ? 64 : 36} /></span>;
}

/** This store's price for a product (SELF_SHOP), from gridShop.priceFor. */
export const storePrice = (p, qty = 1) => priceFor(p, SELF_SHOP, qty);

/** The price a unit: a discount shows the old price struck through and the % off. */
export function PriceTag({ b, cls = 'gs-price' }) {
  return (
    <span className="gs-pricetag">
      <span className={cls}>{tk(b.storeUnitNet)}</span>
      {b.discount ? <><s className="gs-was">{tk(b.storeUnit)}</s><span className="gs-off">{b.discountPct ? b.discountPct + '% off' : tk(b.discount) + ' off'}</span></> : null}
    </span>
  );
}

export function GsStatus({ o }) {
  const s = ORDER_STATUS[statusOf(o)] || { label: '—', tone: 'neutral' };
  return <StatusBadge tone={s.tone}>{s.label}</StatusBadge>;
}

/** "Sold by GridCommerce" or "Sold by <vendor>" with the days to deliver. */
export function FulfilNote({ p }) {
  return (
    <span className="gs-ful">
      <Icon name={p.fulfil === 'stock' ? 'warehouse' : 'store'} width="14" height="14" aria-hidden="true" />
      {`Sold by ${soldBy(p)} · ${p.days} day${p.days === 1 ? '' : 's'}`}
    </span>
  );
}

/** The cart in a side panel. */
export function CartSheet({ open, onClose }) {
  const lines = open ? cartLines(SELF_SHOP) : [];
  const sub = lines.reduce((a, l) => a + l.price * l.qty, 0);
  const set = (l, q) => { const r = setCartQty(SELF_SHOP, l.p.id, q); if (r.ok === false) toast(r.error, { tone: 'error' }); };
  const bad = lines.find((l) => !l.av.ok);
  return (
    <Sheet open={open} title={`Cart · ${lines.length}`} onClose={onClose}
      footer={lines.length ? <><span className="gs-sheet-sum">{tk(sub)} <small>+ VAT and delivery</small></span><Link href="/grid-shop-checkout" className={'gc-btn gc-btn--solid' + (bad ? ' is-disabled' : '')} aria-disabled={!!bad} onClick={(e) => { if (bad) { e.preventDefault(); toast(`${bad.p.name}: ${bad.av.why}.`, { tone: 'error' }); } }} style={{ textDecoration: 'none' }}>Checkout</Link></> : null}>
      {lines.length ? (
        <ul className="gs-cart">
          {lines.map((l) => (
            <li key={l.p.id}>
              <ProductPic p={l.p} className="gs-pic gs-pic--sm" />
              <span className="gs-cart__main">
                <b>{l.p.name}</b>
                <small>{tk(l.price)} a {l.p.unit}{l.pb.discount ? ` · ${l.pb.discountPct}% off` : l.pb.listPrice < l.p.price ? ' · bulk price' : ''} · {soldBy(l.p)}</small>
                {!l.av.ok ? <small style={{ color: 'var(--text-danger)' }}>{l.av.why}</small> : null}
              </span>
              <span className="gs-qty">
                <button type="button" aria-label={'One less ' + l.p.name} onClick={() => set(l, l.qty - 1)}><Icon name="minus" width="14" height="14" /></button>
                <span aria-live="polite">{l.qty}</span>
                <button type="button" aria-label={'One more ' + l.p.name} onClick={() => set(l, l.qty + 1)}><Icon name="plus" width="14" height="14" /></button>
              </span>
            </li>
          ))}
        </ul>
      ) : <EmptyState icon="shopping-cart" title="Your cart is empty" body="Add packaging, printers, labels and more." />}
      {lines.length ? <p className="gc-help" style={{ marginTop: 'var(--space-3)' }}>Delivery {tk(deliveryFor('Dhaka', sub))} in Dhaka, {tk(deliveryFor('Sylhet', sub))} outside; free over ৳10,000.</p> : null}
    </Sheet>
  );
}

export const GS_CSS = `
.gs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:var(--space-3)}
.gs-card{display:flex;flex-direction:column;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);overflow:hidden;color:inherit;text-decoration:none}
.gs-card:hover,.gs-card:focus-visible{border-color:var(--primary)}
.gs-card__body{display:flex;flex-direction:column;gap:6px;padding:var(--space-3)}
.gs-card__body b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);line-height:1.35}
.gs-card__foot{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 8px;margin-top:auto;padding:0 var(--space-3) var(--space-3)}
.gs-pic{display:grid;place-items:center;aspect-ratio:4/3;overflow:hidden;background:var(--surface-subtle) center/cover no-repeat;border-bottom:1px solid var(--border-subtle)}
.gs-pic.has-img img{display:block;width:100%;height:100%;object-fit:cover}
.gs-pricetag{display:inline-flex;flex-wrap:wrap;align-items:baseline;gap:4px 6px}
.gs-was{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.gs-off{padding:1px 6px;border-radius:var(--radius-full);background:var(--fill-success-soft,var(--surface-subtle));font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-success)}
.gs-pic.is-tile{color:var(--primary);background:linear-gradient(135deg,var(--fill-primary-soft),var(--surface-subtle))}
.gs-tile--pos{color:var(--text-info)}
.gs-tile--print{color:var(--text-success)}
.gs-tile--shop{color:var(--text-warning)}
.gs-pic--sm{width:56px;flex:none;aspect-ratio:1;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.gs-pic--sm svg{width:24px;height:24px}
.gs-pic--big{aspect-ratio:4/3;border-radius:var(--radius-xl);border:1px solid var(--border-subtle)}
.gs-price{font-family:var(--font-data);font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.gs-unit{font-size:var(--text-xs);color:var(--text-muted)}
.gs-ful{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-muted)}
.gs-stock{font-size:var(--text-xs);color:var(--text-warning)}
.gs-cart{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.gs-cart li{display:flex;align-items:center;gap:var(--space-3);padding:10px 0;border-top:1px solid var(--border-subtle)}
.gs-cart li:first-child{border-top:0}
.gs-cart__main{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.gs-cart__main b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.gs-cart__main small{font-size:var(--text-xs);color:var(--text-muted)}
.gs-qty{display:inline-flex;align-items:center;border:1px solid var(--border-field);border-radius:var(--radius-lg);overflow:hidden}
.gs-qty button{display:grid;place-items:center;width:36px;height:36px;border:0;background:var(--surface-card);color:var(--text-heading);cursor:pointer}
.gs-qty button:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.gs-qty span,.gs-qty input{min-width:40px;text-align:center;font-family:var(--font-data);font-size:var(--text-sm)}
.gs-qty input{width:56px;height:36px;border:0;border-inline:1px solid var(--border-subtle);background:var(--surface-card)}
.gs-sheet-sum{margin-right:auto;font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.gs-sheet-sum small{font-family:var(--font-sans);font-weight:var(--weight-regular);font-size:var(--text-xs);color:var(--text-muted)}
.gs-tiers{display:flex;flex-wrap:wrap;gap:6px}
.gs-tiers span{padding:4px 10px;border-radius:var(--radius-full);background:var(--fill-success-soft,var(--surface-subtle));font-size:var(--text-xs);color:var(--text-success)}
.gs-ship{display:flex;flex-direction:column;gap:6px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.gs-ship header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px}
.gs-ship header b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.gs-ship ul{margin:0;padding:0 0 0 18px;font-size:var(--text-sm);color:var(--text-body)}
.gs-ship small{font-size:var(--text-xs);color:var(--text-muted)}
.is-disabled{opacity:.55}
`;
