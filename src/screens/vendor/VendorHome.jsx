'use client';
// Vendor portal › Home (/vendor; Batch E): what the vendor sold today and this month (what stores paid for their items),
// parcels to ship, the balance owed to them, products waiting for approval (new ones, rejected ones with the reason, and
// changes to live products), and their rates now (commission or markup, fee per parcel, monthly fee, store discounts they
// pay for). Data: lib/platform/gridShop.js.

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ShopHeader, MetricStrip } from '@/components/ui/IndexKit';
import { EmptyState } from '@/components/ui';
import { Pic } from '@/components/ui/Pic';
import { vendorParcels, vendorStatement, getProducts, reviewOf, vendorRates, ruleValueText, now } from '@/lib/platform/gridShop';
import { VendorFrame, useVendor, ApprovalBadge, ParcelBadge, tk, dShort, picOf } from './vendorShared';

const rateText = (x) => (x.unit === '%' ? x.value + '%' : tk(x.value)) + (x.rule && x.rule.to ? ` until ${dShort(x.rule.to)}` : '');

function Body({ v }) {
  const { tick } = useVendor();
  const d = useMemo(() => {
    const t = now();
    const day = new Date(t); day.setHours(0, 0, 0, 0);
    const month = new Date(t); month.setDate(1); month.setHours(0, 0, 0, 0);
    const parcels = vendorParcels(v.id);
    const sold = (from) => parcels.filter((x) => x.o.paid.at >= from).reduce((a, x) => a + x.sales, 0);
    return { parcels, today: sold(day.getTime()), month: sold(month.getTime()), monthN: parcels.filter((x) => x.o.paid.at >= month.getTime()).length, st: vendorStatement(v.id), waiting: getProducts().filter((p) => p.vendorId === v.id && (['pending', 'rejected', 'draft'].includes(reviewOf(p)) || p.pendingChange)), rates: vendorRates(v.id) };
  }, [v.id, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const toShip = d.parcels.filter((x) => x.state === 'ship');
  const r = d.rates;
  return (<>
    <ShopHeader icon="layout-dashboard" title={`Hello, ${(v.contact || v.name).split(' ')[0]}`}
      about="Your Grid Shop at a glance: what stores bought from you, parcels to send, what you are owed and products waiting for GridCommerce to approve. GridCommerce takes the store’s payment; you ship the parcel and are paid for it once it is delivered."
      primary={{ label: 'Add product', icon: 'plus', href: '/vendor-product' }} />
    <MetricStrip items={[
      { label: 'Sales today', value: tk(d.today), icon: 'receipt' },
      { label: 'This month', value: tk(d.month), sub: d.monthN + ' parcels', icon: 'calendar' },
      { label: 'To ship', value: String(toShip.length), href: '/vendor-orders', icon: 'truck' },
      { label: 'Balance', value: tk(d.st.totals.balance), sub: 'owed to you', href: '/vendor-money', icon: 'wallet' },
    ]} />
    <div className="ix-record">
      <div className="ix-main">
        <section className="ix-card vd-pad" aria-labelledby="vh-ship">
          <h2 id="vh-ship">Parcels to ship</h2>
          {toShip.length ? (
            <ul className="vd-list">{toShip.slice(0, 5).map((x) => (
              <li key={x.o.id + x.s.id}>
                <Pic src={picOf(x.lines[0])} name={x.lines[0].name} kind="item" size={32} />
                <Link href={`/vendor-order?id=${x.o.id}&s=${x.s.id}`} className="vd-list__main"><b>{x.lines.map((l) => `${l.qty} × ${l.name}`).join(', ')}</b><small>{x.o.id} · {x.o.shopName} · {x.o.address.district} · {dShort(x.o.paid.at)}</small></Link>
                <ParcelBadge s={x.s} />
              </li>
            ))}</ul>
          ) : <EmptyState icon="package-check" title="Nothing to ship" body="New orders show here." />}
          {toShip.length > 5 ? <Link href="/vendor-orders" className="bl-link" style={{ fontSize: 'var(--text-sm)' }}>View all {toShip.length}</Link> : null}
        </section>
        <section className="ix-card vd-pad" aria-labelledby="vh-wait">
          <h2 id="vh-wait">Products for approval</h2>
          {d.waiting.length ? (
            <ul className="vd-list">{d.waiting.slice(0, 5).map((p) => (
              <li key={p.id}>
                <Pic src={picOf(p)} name={p.name} kind="item" size={32} />
                <Link href={'/vendor-product?id=' + p.id} className="vd-list__main"><b>{p.name}</b><small>{reviewOf(p) === 'rejected' ? 'Rejected: ' + ((p.review && p.review.reason) || '') : p.pendingChange ? 'Change waiting: ' + Object.keys(p.pendingChange.fields).join(', ') : reviewOf(p) === 'draft' ? 'Draft: send it when ready' : 'GridCommerce checks it within a working day'}</small></Link>
                <ApprovalBadge p={p} />
              </li>
            ))}</ul>
          ) : <EmptyState icon="circle-check" title="Nothing waiting" body="New products and price changes wait here for GridCommerce." />}
        </section>
      </div>
      <aside className="ix-side" aria-label="Your rates">
        <section className="ix-card vd-pad">
          <h2>Your rates now</h2>
          {r ? (
            <div className="vd-break">
              <div><span>{r.model === 'markup' ? 'Our markup on your price' : 'Our commission'}</span><span>{rateText(r.model === 'markup' ? r.markup : r.commission)}</span></div>
              <div><span>Fee per parcel</span><span>{rateText(r.feePerOrder)}</span></div>
              <div><span>Monthly fee</span><span>{rateText(r.monthlyFee)}</span></div>
              <div><span>Paid every</span><span>{v.payoutEvery} days</span></div>
            </div>
          ) : null}
          {r && r.discounts.length ? r.discounts.map((x) => <p key={x.id} className="vd-note"><span><b>{x.name}</b>: {ruleValueText(x)} off for stores{x.to ? ' until ' + dShort(x.to) : ''}{x.fundedBy === 'vendor' ? '; it comes off what you get.' : '; GridCommerce pays it.'}</span></p>) : null}
          <Link href="/vendor-profile" className="bl-link" style={{ fontSize: 'var(--text-sm)' }}>See your profile</Link>
        </section>
      </aside>
    </div>
  </>);
}

export default function VendorHome() {
  return <VendorFrame active="home" screen="VendorHome">{(v) => <Body v={v} />}</VendorFrame>;
}
