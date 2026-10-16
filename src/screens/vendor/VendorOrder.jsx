'use client';
// Vendor portal › a parcel (/vendor-order?id=&s=; Batch E): the items with what the store paid and what the vendor gets, the
// address to deliver to, and the next step — Accept → Packing → Book a courier (Steadfast, Pathao or RedX: simulated,
// gives the tracking number) or Use my own courier (name and tracking) → Delivered. Delivered = owed to the vendor in the
// next payout. Side: deliver to, the money for this parcel (store paid, commission or markup, discount the vendor pays,
// fee per parcel, you get) and the history. Data: lib/platform/gridShop.js.

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { EmptyState } from '@/components/ui';
import { Pic } from '@/components/ui/Pic';
import { orderById, acceptParcel, startPacking, bookCourier, markOwnCourier, markDelivered, pbOf, BOOK_COURIERS } from '@/lib/platform/gridShop';
import { navigate } from '@/runtime/routes';
import { VendorFrame, useVendor, ParcelBadge, tk, qp, dTime, say, picOf } from './vendorShared';

const STEPS = [['accepted', 'Accepted'], ['packing', 'Packed'], ['shipped', 'On the way'], ['delivered', 'Delivered']];
const ORDER = ['sent', 'accepted', 'packing', 'shipped', 'delivered'];

function Body({ v }) {
  const { tick } = useVendor();
  const [courier, setCourier] = useState('Steadfast');
  const [own, setOwn] = useState(null);
  void tick;
  const o = orderById(qp('id'));
  const s = o && o.shipments.find((x) => x.id === qp('s'));
  if (!o || !s || s.from !== v.id) return (<><RecordHeader back="/vendor-orders" backLabel="Orders" title="Parcel not found" /><section className="ix-card ix-empty"><EmptyState icon="package" title="This parcel is not here" actionLabel="Your orders" onAction={() => navigate('/vendor-orders')} /></section></>);
  const ls = s.lines.map((i) => o.lines[i]);
  const bs = ls.map((l) => ({ l, b: pbOf(l) }));
  const sum = (f) => bs.reduce((a, x) => a + f(x), 0);
  const sales = sum((x) => x.l.price * x.l.qty), price = sum((x) => x.b.listPrice * x.l.qty), comm = sum((x) => (x.b.commission || 0) * x.l.qty), funded = sum((x) => (x.b.vendorFunded || 0) * x.l.qty);
  const at = ORDER.indexOf(s.status);
  const by = v.contact || v.name;
  const book = () => { const r = bookCourier(o.id, s.id, courier, v.id); if (say(toast, r)) toast(`Booked with ${courier} · ${r.tracking}`); };
  const ownGo = () => { if (say(toast, markOwnCourier(o.id, s.id, own.courier, own.tracking, v.id), 'On its way')) setOwn(null); };
  const done = async () => { if (await confirmDialog({ title: 'Mark delivered?', body: `Only when ${o.shopName} has the parcel. ${tk(s.pay ? s.pay.amount : 0)} is then owed to you in your next payout.`, confirmLabel: 'Delivered' })) say(toast, markDelivered(o.id, s.id, by, v.id), 'Delivered. It is in your balance now.'); };
  const cancelled = o.cancelled;
  return (<>
    <RecordHeader back="/vendor-orders" backLabel="Orders" title={`${o.shopName} · ${o.id}`} badges={cancelled ? null : <ParcelBadge s={s} />} meta={<>Ordered {dTime(o.paid.at)} · parcel {s.id}{o.shipments.length > 1 ? ` of ${o.shipments.length}` : ''}</>}
      primary={cancelled ? null : s.status === 'sent' ? { label: 'Accept', icon: 'check', onClick: () => say(toast, acceptParcel(o.id, s.id, v.id), 'Accepted. Pack it next.') } : s.status === 'accepted' ? { label: 'Start packing', icon: 'package-open', onClick: () => say(toast, startPacking(o.id, s.id, v.id), 'Packing') } : s.status === 'shipped' ? { label: 'Mark delivered', icon: 'package-check', onClick: done } : null} />
    {cancelled ? <p className="vd-note vd-note--warn"><Icon name="circle-x" width="16" height="16" aria-hidden="true" />The store cancelled this order. Don’t send it.</p> : null}
    <div className="ix-record">
      <div className="ix-main">
        <section className="ix-card vd-pad" aria-labelledby="vo-step">
          <h2 id="vo-step">Next step</h2>
          <ol className="vd-steps" aria-label="Parcel steps">{STEPS.map(([k, l]) => <li key={k} className={ORDER.indexOf(k) <= at ? 'is-done' : ''}>{l}</li>)}</ol>
          {cancelled ? null : s.status === 'sent' ? <p className="gc-help" style={{ margin: 0 }}>Accept it to tell the store you have it in hand. The store has paid; you are paid once it is delivered.</p>
            : s.status === 'accepted' ? <p className="gc-help" style={{ margin: 0 }}>Pack the items with the order number {o.id} on the box, then book the courier.</p>
            : ['packing'].includes(s.status) ? (
              own ? (
                <div className="vd-pad" style={{ padding: 0 }}>
                  <div className="vd-grid2">
                    <div><label className="gc-label" htmlFor="vo-oc">Courier or van</label><input id="vo-oc" className="gc-input" value={own.courier} onChange={(e) => setOwn({ ...own, courier: e.target.value })} placeholder="Our own van, Sundarban…" /></div>
                    <div><label className="gc-label" htmlFor="vo-ot">Tracking or slip number</label><input id="vo-ot" className="gc-input" value={own.tracking} onChange={(e) => setOwn({ ...own, tracking: e.target.value })} /></div>
                  </div>
                  <div className="vd-row"><button type="button" className="ix-btn ix-btn--primary" onClick={ownGo}>It is on its way</button><button type="button" className="ix-btn" onClick={() => setOwn(null)}>Back</button></div>
                </div>
              ) : (
                <div className="vd-pad" style={{ padding: 0 }}>
                  <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                    <legend className="gc-label">Book a courier</legend>
                    <div className="vd-row">{BOOK_COURIERS.map(([c]) => <label key={c} className="ix-btn" style={{ cursor: 'pointer' }}><input type="radio" name="vo-c" className="gc-check gc-check--radio" checked={courier === c} onChange={() => setCourier(c)} />{c}</label>)}</div>
                  </fieldset>
                  <div className="vd-row"><button type="button" className="ix-btn ix-btn--primary" onClick={book}><Icon name="truck" width="16" height="16" aria-hidden="true" />Book {courier}</button><button type="button" className="ix-btn" onClick={() => setOwn({ courier: '', tracking: '' })}>Use my own courier</button></div>
                  <span className="vd-sub">The courier picks it up from your address; the tracking number goes to the store.</span>
                </div>
              )
            ) : s.status === 'shipped' ? <p className="vd-note"><Icon name="truck" width="16" height="16" aria-hidden="true" /><span>{s.courier} · <b className="vd-num">{s.tracking}</b>{s.booked ? ' (booked here)' : ''} · sent {dTime(s.shippedAt)}. Mark it delivered when the store has it.</span></p>
            : <p className="vd-note"><Icon name="circle-check" width="16" height="16" aria-hidden="true" /><span>Delivered {dTime(s.deliveredAt)} · {s.courier} {s.tracking}. {s.pay && s.pay.status === 'paid' ? `Paid in payout ${s.pay.payoutId || ''}${s.pay.ref ? ' · ' + s.pay.ref : ''}.` : s.pay && s.pay.payoutId ? `In payout ${s.pay.payoutId}, waiting for GridCommerce to pay.` : `${tk(s.pay ? s.pay.amount : 0)} is in your balance.`}</span></p>}
        </section>
        <section className="ix-card vd-pad" aria-labelledby="vo-items">
          <h2 id="vo-items">Items</h2>
          <ul className="vd-list">{bs.map(({ l, b }, i) => (
            <li key={i}>
              <Pic src={picOf(l)} name={l.name} kind="item" size={32} />
              <span className="vd-list__main"><b>{l.qty} × {l.name}</b><small>Store paid {tk(l.price)} a unit{b.discount ? ` (${b.discountPct}% off)` : ''} · you get {tk(b.vendorGets)} a unit</small></span>
              <span className="vd-num">{tk(b.vendorGets * l.qty)}</span>
            </li>
          ))}</ul>
          {o.note ? <p className="vd-note"><Icon name="message-square" width="16" height="16" aria-hidden="true" />Note from the store: {o.note}</p> : null}
        </section>
      </div>
      <aside className="ix-side" aria-label="Parcel details">
        <section className="ix-card vd-pad">
          <h2>Deliver to</h2>
          <KV rows={[['Store', o.shopName], ['Name', o.address.name], ['Mobile', <a key="m" href={'tel:' + o.address.phone.replace(/[^0-9+]/g, '')}>{o.address.phone}</a>], ['Address', o.address.line], ['District', o.address.district]]} />
        </section>
        <section className="ix-card vd-pad">
          <h2>Money for this parcel</h2>
          <div className="vd-break">
            <div><span>Store paid (items)</span><span>{tk(sales)}</span></div>
            {comm ? <div><span>Your price</span><span>{tk(price)}</span></div> : null}
            {comm ? <div><span>Our commission</span><span>−{tk(comm)}</span></div> : null}
            {!comm && price !== sales ? <div><span>Your price</span><span>{tk(price)}</span></div> : null}
            {funded ? <div><span>Discount you pay</span><span>−{tk(funded)}</span></div> : null}
            {s.fee ? <div><span>Fee per parcel</span><span>−{tk(s.fee)}</span></div> : null}
            <div className="is-total"><span>You get</span><span>{tk(s.pay ? s.pay.amount : 0)}</span></div>
          </div>
        </section>
        <section className="ix-card vd-pad">
          <h2>History</h2>
          <ul className="vd-list">{o.history.slice().reverse().filter((h) => !/Note:/.test(h.text)).slice(0, 8).map((h, i) => <li key={i}><span className="vd-list__main"><b style={{ whiteSpace: 'normal' }}>{h.text}</b><small>{dTime(h.at)} · {h.by}</small></span></li>)}</ul>
        </section>
      </aside>
    </div>
  </>);
}

export default function VendorOrder() {
  return <VendorFrame active="orders" screen="VendorOrder">{(v) => <Body v={v} />}</VendorFrame>;
}
