'use client';
// Grid Shop › a supply order (/grid-shop-order?id=; Batch D, vendors Batch E): each parcel (from our stock, or from a vendor) with its
// items, status, courier and tracking number; the delivery address; the payment and the VAT invoice lines; Cancel (full
// refund) until the first parcel leaves; Order again. Data: lib/platform/gridShop.js.

import React, { useMemo } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState, StatusBadge } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { navigate } from '@/runtime/routes';
import { orderById, cancelOrder, addToCart, vendorById, SHIP_STATUS, payLabel, productById, isListed } from '@/lib/platform/gridShop';
import { Pic } from '@/components/ui/Pic';
import { productPic } from '@/lib/pictures';
import { SELF_SHOP, SELF_NAME } from '@/lib/platform/services';
import { SvcFrame, tk, query, dateText, timeText } from './svcShared';
import { useGridShop, GsStatus, GS_CSS } from './gsShared';

const TONE = { preparing: 'info', sent: 'info', accepted: 'info', packing: 'info', shipped: 'primary', delivered: 'success' };

export default function GridShopOrder() {
  const { ready, tick } = useGridShop();
  const o = useMemo(() => (ready ? orderById(query('id')) : null), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ready) return <SvcFrame gate="shop" screen="GridShopOrder" active="gs-orders" page="Supply order" crumb="Services"><div style={{ minHeight: 400 }} aria-busy="true" /></SvcFrame>;
  if (!o || o.shopId !== SELF_SHOP) return <SvcFrame gate="shop" screen="GridShopOrder" active="gs-orders" page="Supply order" crumb="Services" narrow><RecordHeader back="/grid-shop-orders" backLabel="My supply orders" title="Order not found" /><section className="ix-card ix-empty"><EmptyState icon="package" title="This order is not here" /></section></SvcFrame>;
  const shipped = o.shipments.some((s) => ['shipped', 'delivered'].includes(s.status));
  const cancel = async () => {
    if (!(await confirmDialog({ title: 'Cancel this order?', body: `Nothing has left yet, so the full ${tk(o.total)} comes back to your ${payLabel(o.paid.method)}.`, confirmLabel: 'Cancel order', cancelLabel: 'Keep it', tone: 'danger' }))) return;
    const r = cancelOrder(o.id, SELF_NAME); if (r.ok === false) toast(r.error, { tone: 'error' }); else toast('Cancelled. The refund is on its way.');
  };
  const again = () => { let n = 0; o.lines.forEach((l) => { const p = productById(l.productId); if (p && isListed(p) && addToCart(SELF_SHOP, p.id, l.qty).ok !== false) n++; }); toast(n ? 'Added to the cart' : 'These items are not on sale now', { tone: n ? undefined : 'error' }); if (n) navigate('/grid-shop-checkout'); };
  return (
    <SvcFrame gate="shop" screen="GridShopOrder" active="gs-orders" page={o.id} crumb="Services" css={GS_CSS}>
      <RecordHeader back="/grid-shop-orders" backLabel="My supply orders" title={'Supply order ' + o.id} badges={<GsStatus o={o} />} meta={<>Paid {dateText(o.paid.at)} · {payLabel(o.paid.method)}</>}
        secondary={[{ label: 'Order again', onClick: again }]}
        more={!o.cancelled && !shipped ? [{ label: 'Cancel order', onClick: cancel, tone: 'danger' }] : []} />
      <div className="ix-record">
        <div className="ix-main">
          <section className="ix-card svc-pad" aria-labelledby="go-par">
            <h2 id="go-par">{o.shipments.length === 1 ? 'Your parcel' : `Your ${o.shipments.length} parcels`}</h2>
            {o.cancelled ? <p className="gc-help" style={{ margin: 0 }}>Cancelled {dateText(o.cancelledAt)}. {o.cancelReason}.</p> : null}
            {o.shipments.map((s) => (
              <div key={s.id} className="gs-ship">
                <header>
                  <b>{s.from === 'stock' ? 'From GridCommerce' : `From ${(vendorById(s.from) || { name: 'the vendor' }).name}`}</b>
                  {o.cancelled ? <StatusBadge tone="neutral">Cancelled</StatusBadge> : <StatusBadge tone={TONE[s.status]}>{SHIP_STATUS[s.status]}</StatusBadge>}
                </header>
                <ul>{s.lines.map((i) => <li key={i}>{o.lines[i].qty} × {o.lines[i].name}</li>)}</ul>
                {s.tracking ? <small><Icon name="truck" width="12" height="12" aria-hidden="true" /> {s.courier} · {s.tracking}{s.shippedAt ? ' · sent ' + timeText(s.shippedAt) : ''}{s.deliveredAt ? ' · delivered ' + timeText(s.deliveredAt) : ''}</small> : <small>{s.from === 'stock' ? 'Packed at our warehouse, then a courier brings it.' : 'The vendor packs it and ships it to you.'}</small>}
              </div>
            ))}
          </section>
          <section className="ix-card svc-pad" aria-labelledby="go-inv">
            <h2 id="go-inv">Items</h2>
            <div className="svc-sum">
              {o.lines.map((l, i) => { const p = productById(l.productId); return <div key={i}><span className="gc-picrow"><Pic src={productPic(p || l)} name={l.name} kind="item" size={32} /><span>{l.qty} × {l.name}{l.pb && l.pb.discount ? <small className="ix-muted" style={{ display: 'block' }}>{l.pb.discountPct}% off · saved {tk(l.pb.discount * l.qty)}</small> : null}</span></span><span>{tk(l.price * l.qty)}</span></div>; })}
              {o.platformFee ? <div><span>Platform fee</span><span>{tk(o.platformFee)}</span></div> : null}
              <div><span>Delivery</span><span>{o.delivery ? tk(o.delivery) : 'Free'}</span></div>
              <div><span>VAT {o.vatPct}%</span><span>{tk(o.vat)}</span></div>
              <div className="is-total"><span>Paid</span><span>{tk(o.total)}</span></div>
            </div>
          </section>
        </div>
        <aside className="ix-side" aria-label="Details">
          <section className="ix-card svc-pad">
            <h2>Delivery to</h2>
            <KV rows={[['Name', o.address.name], ['Mobile', o.address.phone], ['Address', o.address.line], ['District', o.address.district], o.note ? ['Note', o.note] : null].filter(Boolean)} />
          </section>
          <section className="ix-card svc-pad">
            <h2>Payment</h2>
            <KV rows={[['Paid by', payLabel(o.paid.method)], ['Transaction', o.paid.txId], ['Date', dateText(o.paid.at)]]} />
          </section>
          <p className="gc-help" style={{ margin: 0 }}>Something wrong with a parcel? <a href="/support-tickets?new=1" className="bl-link">Ask support</a></p>
        </aside>
      </div>
    </SvcFrame>
  );
}
