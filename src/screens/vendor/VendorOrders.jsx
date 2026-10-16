'use client';
// Vendor portal › Orders (/vendor-orders?tab=; Batch E): the vendor's parcels from Grid Shop orders — To ship (new, accepted,
// packing) · On the way · Delivered — each with the first item's picture, the items, the store and district, the state and
// what the vendor gets for it. A row opens the parcel (/vendor-order?id=&s=). Data: lib/platform/gridShop.js › vendorParcels.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ShopHeader, IndexTabs } from '@/components/ui/IndexKit';
import { EmptyState } from '@/components/ui';
import { Pic } from '@/components/ui/Pic';
import { vendorParcels } from '@/lib/platform/gridShop';
import { navigate } from '@/runtime/routes';
import { VendorFrame, useVendor, ParcelBadge, tk, qp, dShort, picOf } from './vendorShared';

const TABS = [['ship', 'To ship'], ['way', 'On the way'], ['done', 'Delivered']];

function Body({ v }) {
  const { tick } = useVendor();
  const [tab, setTab] = useState('ship');
  useEffect(() => { const t = qp('tab'); if (TABS.some((x) => x[0] === t)) setTab(t); }, []);
  const rows = useMemo(() => vendorParcels(v.id), [v.id, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = rows.filter((x) => x.state === tab);
  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'vo-' + k, label: l, count: rows.filter((x) => x.state === k).length, on: tab === k, onClick: () => setTab(k) }));
  const href = (x) => `/vendor-order?id=${x.o.id}&s=${x.s.id}`;
  const what = (x) => x.lines.map((l) => `${l.qty} × ${l.name}`).join(', ');
  return (<>
    <ShopHeader icon="truck" title="Orders" about="Parcels stores bought from you on Grid Shop. GridCommerce has already taken the store’s payment. Accept the parcel, pack it, then book a courier here (Steadfast, Pathao or RedX) or use your own; mark it delivered when the store has it. A delivered parcel is owed to you and paid in your next payout." />
    <section className="ix-card" aria-label="Parcels">
      <div className="ix-bar"><IndexTabs tabs={tabs} label="Parcels by state" /></div>
      {shown.length ? (<>
        <ul className="ix-plist">{shown.map((x) => <li key={x.o.id + x.s.id}><Link href={href(x)} className="ix-pitem ix-pitem--thumb"><span style={{ gridRow: 'span 2' }}><Pic src={picOf(x.lines[0])} name={x.lines[0].name} kind="item" /></span><span className="ix-pitem__top"><b>{x.o.shopName}</b><span><ParcelBadge s={x.s} /></span></span><span className="ix-pitem__mid">{x.o.id} · {tk(x.amount)} · {what(x)}</span></Link></li>)}</ul>
        <div className="ix-table-wrap">
          <table className="ix-table">
            <caption className="sr-only">Parcels</caption>
            <thead><tr><th scope="col">Parcel</th><th scope="col">Items</th><th scope="col">Deliver to</th><th scope="col">Status</th><th scope="col" className="ix-num">You get</th></tr></thead>
            <tbody>{shown.map((x) => (
              <tr key={x.o.id + x.s.id} onClick={(e) => { if (!e.target.closest('a,button')) navigate(href(x)); }}>
                <td><span className="gc-picrow"><Pic src={picOf(x.lines[0])} name={x.lines[0].name} kind="item" size={32} /><span><Link href={href(x)} className="ix-strong">{x.o.shopName}</Link><span className="vd-sub">{x.o.id} · {dShort(x.o.paid.at)}</span></span></span></td>
                <td className="ix-muted" style={{ maxWidth: 360, minWidth: 220, whiteSpace: 'normal' }}>{what(x)}</td>
                <td>{x.o.address.district}<span className="vd-sub">{x.s.tracking ? `${x.s.courier} · ${x.s.tracking}` : x.o.address.name}</span></td>
                <td><ParcelBadge s={x.s} /></td>
                <td className="ix-num">{tk(x.amount)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </>) : <div className="ix-empty"><EmptyState icon="package-check" title={tab === 'ship' ? 'Nothing to ship' : 'Nothing here'} body={tab === 'ship' ? 'New orders show here as soon as a store pays.' : 'Try another tab.'} /></div>}
      <div className="ix-foot"><span>{shown.length === 1 ? '1 parcel' : shown.length + ' parcels'}</span></div>
    </section>
  </>);
}

export default function VendorOrders() {
  return <VendorFrame active="orders" screen="VendorOrders">{(v) => <Body v={v} />}</VendorFrame>;
}
