'use client';
// Grid Shop › My supply orders (/grid-shop-orders; Batch D): every Grid Shop order of the shop, newest first, with its
// status (worked out from its parcels), what is in it, the total and the parcels on the way. A row opens the order.
// Data: lib/platform/gridShop.js.

import React, { useMemo } from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui';
import { ShopHeader } from '@/components/ui/IndexKit';
import { navigate } from '@/runtime/routes';
import { getOrders, productById } from '@/lib/platform/gridShop';
import { Pic } from '@/components/ui/Pic';
import { productPic } from '@/lib/pictures';
import { SELF_SHOP } from '@/lib/platform/services';
import { SvcFrame, tk, shortDate } from './svcShared';
import { useGridShop, GsStatus, GS_CSS } from './gsShared';

export default function GridShopOrders() {
  const { ready, tick } = useGridShop();
  const rows = useMemo(() => (ready ? getOrders(SELF_SHOP) : []), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const what = (o) => o.lines.map((l) => `${l.qty} × ${l.name}`).join(', ');
  const picOf = (o) => { const l = o.lines[0]; return productPic(productById(l.productId) || l); };
  return (
    <SvcFrame gate="shop" screen="GridShopOrders" active="gs-orders" page="My supply orders" crumb="Services" css={GS_CSS}>
      <ShopHeader icon="package" title="My supply orders" about="What you bought from Grid Shop and where each parcel is. GridCommerce's own items come in one parcel; each vendor's items come in their own." primary={{ label: 'Business supplies', href: '/grid-shop' }} />
      <section className="ix-card" aria-label="Orders">
        {!ready ? <div style={{ minHeight: 240 }} aria-busy="true" /> : rows.length ? (<>
          <ul className="ix-plist">{rows.map((o) => <li key={o.id}><Link href={'/grid-shop-order?id=' + o.id} className="ix-pitem ix-pitem--thumb"><span style={{ gridRow: 'span 2' }}><Pic src={picOf(o)} name={o.lines[0].name} kind="item" size={32} /></span><span className="ix-pitem__top"><b>{o.id} · {tk(o.total)}</b><GsStatus o={o} /></span><span className="ix-pitem__mid">{what(o)}</span></Link></li>)}</ul>
          <div className="ix-table-wrap">
            <table className="ix-table">
              <caption className="sr-only">Supply orders</caption>
              <thead><tr><th scope="col">Order</th><th scope="col">Items</th><th scope="col">Parcels</th><th scope="col">Status</th><th scope="col" className="ix-num">Total</th></tr></thead>
              <tbody>{rows.map((o) => (
                <tr key={o.id} onClick={(e) => { if (!e.target.closest('a,button')) navigate('/grid-shop-order?id=' + o.id); }}>
                  <td><span className="gc-picrow"><Pic src={picOf(o)} name={o.lines[0].name} kind="item" size={32} /><span><Link href={'/grid-shop-order?id=' + o.id} className="ix-strong">{o.id}</Link><span className="ix-muted" style={{ display: 'block', fontSize: 'var(--text-xs)' }}>{shortDate(o.paid.at)}</span></span></span></td>
                  <td className="ix-muted" style={{ maxWidth: 420 }}>{what(o)}</td>
                  <td>{o.shipments.filter((s) => s.status === 'delivered').length} of {o.shipments.length} delivered</td>
                  <td><GsStatus o={o} /></td>
                  <td className="ix-num">{tk(o.total)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>) : <div className="ix-empty"><EmptyState icon="package" title="No supply orders yet" actionLabel="See supplies" onAction={() => navigate('/grid-shop')} /></div>}
      </section>
    </SvcFrame>
  );
}
