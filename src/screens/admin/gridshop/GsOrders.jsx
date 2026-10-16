'use client';
// Grid Shop › Orders (/admin/grid-shop?tab=; Batch D): every store's supply order by state (To prepare: paid, nothing
// sent yet · On the way · Delivered · Cancelled · All), each with the first item's picture, the store, items, parcels (our
// stock and each vendor), the total and profit. Figures: open orders, sales and profit in 30 days, what we owe vendors,
// low stock. A row opens
// the order (/admin/grid-shop/order?id=). Who may buy: Services › Access (Grid Shop). Data: lib/platform/gridShop.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShopHeader, MetricStrip, IndexTabs } from '@/components/ui/IndexKit';
import { EmptyState } from '@/components/ui';
import { getOrders, statusOf, profitOf, getProducts, report, vendorById, waitingReview } from '@/lib/platform/gridShop';
import { Pic } from '@/components/ui/Pic';
import { AdminShell } from '../AdminShell';
import { tk, dShort, qp, SVA_CSS } from '../services/svcAdmin';
import { useGs, GsOrderStatus, GSA_CSS, gsPic } from './gsAdmin';

const TABS = [['prepare', 'To prepare'], ['way', 'On the way'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled'], ['all', 'All']];
const inTab = (o, t) => { const s = statusOf(o); return t === 'all' ? true : t === 'prepare' ? ['placed', 'processing'].includes(s) : t === 'way' ? ['partly', 'shipped'].includes(s) : s === t; };

export default function GsOrders() {
  const { ready, tick } = useGs();
  const router = useRouter();
  const [tab, setTab] = useState('prepare');
  useEffect(() => { const t = qp('tab'); if (TABS.some((x) => x[0] === t)) setTab(t); }, []);
  const rows = useMemo(() => (ready ? getOrders() : []), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = rows.filter((o) => inTab(o, tab));
  const r = useMemo(() => (ready ? report(Date.now() - 30 * 864e5) : null), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const low = ready ? getProducts().filter((p) => p.fulfil === 'stock' && p.status === 'live' && p.stock <= 5) : [];
  const toApprove = ready ? waitingReview().length : 0;
  const parcelsOf = (o) => o.shipments.map((s) => (s.from === 'stock' ? 'Our stock' : (vendorById(s.from) || { name: 'Vendor' }).name)).join(' + ');
  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'gso-' + k, label: l, count: ready ? rows.filter((o) => inTab(o, k)).length : null, on: tab === k, onClick: () => setTab(k) }));
  const what = (o) => o.lines.map((l) => `${l.qty} × ${l.name}`).join(', ');
  return (
    <AdminShell active="gshop-orders" title="Grid Shop orders">
      <style dangerouslySetInnerHTML={{ __html: SVA_CSS + GSA_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="shopping-bag" title="Grid Shop orders"
          about="Business supplies stores bought on Grid Shop. Our own stock is packed and shipped by us; vendor items are packed and shipped by the vendor straight to the store (they book the courier in their portal). A vendor's parcel is owed to them once delivered and paid in a payout. Paid orders reach Finance › Income by themselves."
          secondary={[{ label: 'Products', href: '/admin/grid-shop/products' }]} more={[{ label: 'Vendors', href: '/admin/grid-shop/vendors' }, { label: 'Pricing rules', href: '/admin/grid-shop/pricing' }, { label: 'Who may buy', href: '/admin/services/access?m=shop' }]} />
        {r ? <MetricStrip label="Last 30 days" items={[
          { label: 'To prepare', value: String(rows.filter((o) => inTab(o, 'prepare')).length), icon: 'package-open', onClick: () => setTab('prepare'), on: tab === 'prepare' },
          { label: 'Sales', value: tk(r.revenue), sub: r.orders + ' orders · ' + r.buyers + ' stores', icon: 'banknote' },
          { label: 'Profit', value: tk(r.profit), sub: r.revenue ? Math.round((r.profit / r.revenue) * 100) + '%' : '', icon: 'trending-up' },
          { label: 'Owed to vendors', value: tk(r.owed), sub: toApprove ? toApprove + ' products to approve' : 'delivered, not paid', icon: 'hand-coins', href: '/admin/grid-shop/vendors' },
          { label: 'Low stock', value: String(low.length), sub: low.slice(0, 2).map((p) => p.name.split(' (')[0]).join(', '), icon: 'triangle-alert', onClick: () => router.push('/admin/grid-shop/products?view=low') },
        ]} /> : null}
        <section className="ix-card" aria-label="Orders">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Orders by state" /></div>
          {!ready ? <div style={{ minHeight: 240 }} aria-busy="true" /> : shown.length ? (<>
            <ul className="ix-plist">{shown.map((o) => <li key={o.id}><Link href={'/admin/grid-shop/order?id=' + o.id} className="ix-pitem ix-pitem--thumb"><span style={{ gridRow: 'span 2' }}><Pic src={gsPic(o.lines[0])} name={o.lines[0].name} kind="item" /></span><span className="ix-pitem__top"><b>{o.shopName}</b><GsOrderStatus o={o} /></span><span className="ix-pitem__mid">{o.id} · {tk(o.total)} · {what(o)}</span></Link></li>)}</ul>
            <div className="ix-table-wrap">
              <table className="ix-table">
                <caption className="sr-only">Grid Shop orders</caption>
                <thead><tr><th scope="col">Order</th><th scope="col">Items</th><th scope="col">Parcels</th><th scope="col">Status</th><th scope="col" className="ix-num">Total</th><th scope="col" className="ix-num">Profit</th></tr></thead>
                <tbody>{shown.map((o) => { const p = profitOf(o); return (
                  <tr key={o.id} onClick={(e) => { if (!e.target.closest('a,button')) router.push('/admin/grid-shop/order?id=' + o.id); }}>
                    <td><span className="gc-picrow"><Pic src={gsPic(o.lines[0])} name={o.lines[0].name} kind="item" size={32} /><span><Link href={'/admin/grid-shop/order?id=' + o.id} className="ix-strong">{o.shopName}</Link><span className="sva-sub">{o.id} · {dShort(o.paid.at)}</span></span></span></td>
                    <td className="ix-muted" style={{ maxWidth: 360 }}>{what(o)}</td>
                    <td>{parcelsOf(o)}<span className="sva-sub">{o.shipments.filter((s) => s.status === 'delivered').length} of {o.shipments.length} delivered</span></td>
                    <td><GsOrderStatus o={o} /></td>
                    <td className="ix-num">{tk(o.total)}</td>
                    <td className="ix-num">{o.cancelled ? '—' : tk(p.profit)}{p.margin != null && !o.cancelled ? <span className="sva-sub">{p.margin}%</span> : null}</td>
                  </tr>
                ); })}</tbody>
              </table>
            </div>
          </>) : <div className="ix-empty"><EmptyState icon="package" title="No orders here" body="Try another tab." /></div>}
          <div className="ix-foot"><span>{shown.length === 1 ? '1 order' : shown.length + ' orders'}</span></div>
        </section>
      </div>
    </AdminShell>
  );
}
