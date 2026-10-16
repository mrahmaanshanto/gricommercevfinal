'use client';
// Grid Shop › Checkout (/grid-shop-checkout; Batch D, vendors Batch E): what is in the cart grouped by who sends it (our
// stock in one parcel, each vendor's items in theirs), delivery to (name, mobile, address, district: Dhaka or outside sets
// the charge), a note, how to pay, and the total: items at this store's prices (discounts already taken off), the
// platform fee when a pricing rule adds one, delivery and VAT (gridShop.cartTotals). Placing it pays (demo) and opens the
// order; for this shop the payment is also booked in Money. Data: lib/platform/gridShop.js.

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { navigate } from '@/runtime/routes';
import { postEntry } from '@/lib/ledger';
import { cartTotals, placeOrder, PAY_METHODS, vendorById } from '@/lib/platform/gridShop';
import { SELF_SHOP, SELF_NAME } from '@/lib/platform/services';
import { SvcFrame, tk } from './svcShared';
import { useGridShop, ProductPic, GS_CSS } from './gsShared';

const DISTRICTS = ['Dhaka', 'Gazipur', 'Narayanganj', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh', 'Cumilla', 'Bogura', 'Cox’s Bazar'];
const PAY_ACCOUNT = { bkash: 'bkash', nagad: 'nagad', card: 'brac', credits: 'gc-credits' };

export default function GridShopCheckout() {
  const { ready } = useGridShop();
  const [a, setA] = useState({ name: 'Mehedi Rahman', phone: '01711-000001', line: 'House 42, Road 27, Dhanmondi', district: 'Dhaka' });
  const [method, setMethod] = useState('bkash');
  const [note, setNote] = useState('');
  const [err, setErr] = useState({});
  const T = ready ? cartTotals(SELF_SHOP, a.district) : { lines: [], subtotal: 0, discount: 0, platformFee: 0, delivery: 0, vatPct: 15, vat: 0, total: 0 };
  const lines = T.lines;
  const groups = {};
  lines.forEach((l) => { const k = l.p.fulfil === 'stock' ? 'stock' : l.p.vendorId || l.p.supplierId; (groups[k] = groups[k] || []).push(l); });
  const place = () => {
    const r = placeOrder({ shopId: SELF_SHOP, shopName: SELF_NAME, address: a, method, note });
    if (!r.ok) { setErr(r.field ? { [r.field]: r.error } : {}); toast(r.error, { tone: 'error' }); return; }
    try { postEntry({ account: PAY_ACCOUNT[method], amount: -r.order.total, kind: 'expense', cat: 'Packaging & supplies', party: 'GridCommerce Grid Shop', note: `Grid Shop ${r.order.id}`, ref: r.order.paid.txId, by: 'Staff' }); } catch { /* the books are optional here */ }
    toast('Ordered and paid. We are on it.');
    navigate('/grid-shop-order?id=' + r.order.id);
  };
  const E = (k) => (err[k] ? <p className="gc-help gc-help--error" role="alert">{err[k]}</p> : null);
  return (
    <SvcFrame gate="shop" screen="GridShopCheckout" active="gs-shop" page="Checkout" crumb="Services" css={GS_CSS} narrow>
      <RecordHeader back="/grid-shop" backLabel="Business supplies" title="Checkout" />
      {!ready ? <div style={{ minHeight: 300 }} aria-busy="true" /> : !lines.length ? (
        <section className="ix-card ix-empty"><EmptyState icon="shopping-cart" title="Your cart is empty" actionLabel="See supplies" onAction={() => navigate('/grid-shop')} /></section>
      ) : (<>
        <section className="ix-card svc-pad" aria-labelledby="gc-items">
          <h2 id="gc-items">Items · {Object.keys(groups).length > 1 ? `${Object.keys(groups).length} parcels` : '1 parcel'}</h2>
          {Object.entries(groups).map(([k, ls]) => (
            <div key={k} className="gs-ship">
              <header><b>{k === 'stock' ? 'Sold by GridCommerce' : `Sold and shipped by ${(vendorById(k) || { name: 'the vendor' }).name}`}</b><small>{Math.max(...ls.map((l) => l.p.days))} days</small></header>
              <ul className="gs-cart" style={{ paddingLeft: 0 }}>{ls.map((l) => <li key={l.p.id}><ProductPic p={l.p} className="gs-pic gs-pic--sm" /><span className="gs-cart__main"><b>{l.qty} × {l.p.name}</b><small>{tk(l.price)} a {l.p.unit}{l.pb.discount ? <> · <s>{tk(l.pb.storeUnit)}</s> {l.pb.discountPct}% off</> : null}</small>{!l.av.ok ? <small style={{ color: 'var(--text-danger)' }}>{l.av.why}</small> : null}</span><span className="gs-price">{tk(l.price * l.qty)}</span></li>)}</ul>
            </div>
          ))}
          <Link href="/grid-shop" className="bl-link" style={{ fontSize: 'var(--text-sm)' }}>Add more</Link>
        </section>
        <section className="ix-card svc-pad" aria-labelledby="gc-to">
          <h2 id="gc-to">Deliver to</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 'var(--space-3)' }}>
            <div><label className="gc-label" htmlFor="gc-n">Name</label><input id="gc-n" className="gc-input" value={a.name} onChange={(e) => setA({ ...a, name: e.target.value })} autoComplete="name" />{E('name')}</div>
            <div><label className="gc-label" htmlFor="gc-p">Mobile</label><input id="gc-p" className="gc-input" inputMode="tel" value={a.phone} onChange={(e) => setA({ ...a, phone: e.target.value })} autoComplete="tel" />{E('phone')}</div>
          </div>
          <div><label className="gc-label" htmlFor="gc-l">Address</label><input id="gc-l" className="gc-input" value={a.line} onChange={(e) => setA({ ...a, line: e.target.value })} autoComplete="street-address" />{E('line')}</div>
          <div><label className="gc-label" htmlFor="gc-d">District</label><select id="gc-d" className="gc-input gc-select" value={a.district} onChange={(e) => setA({ ...a, district: e.target.value })}>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select>{E('district')}</div>
          <div><label className="gc-label" htmlFor="gc-note">Note (optional)</label><input id="gc-note" className="gc-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Call before coming; the logo file follows by email" /></div>
        </section>
        <section className="ix-card svc-pad" aria-labelledby="gc-pay">
          <h2 id="gc-pay">Payment</h2>
          <div className="svc-pay">{PAY_METHODS.map(([k, l]) => <label key={k} className={method === k ? 'is-on' : ''}><input type="radio" name="gc-pay" checked={method === k} onChange={() => setMethod(k)} />{l}</label>)}</div>
          <div className="svc-sum">
            <div><span>Items</span><span>{tk(T.subtotal)}</span></div>
            {T.discount ? <div><span>You save</span><span style={{ color: 'var(--text-success)' }}>{tk(T.discount)}</span></div> : null}
            {T.platformFee ? <div><span>Platform fee</span><span>{tk(T.platformFee)}</span></div> : null}
            <div><span>Delivery{a.district ? ' · ' + a.district : ''}</span><span>{T.delivery ? tk(T.delivery) : 'Free'}</span></div>
            <div><span>VAT {T.vatPct}%</span><span>{tk(T.vat)}</span></div>
            <div className="is-total"><span>To pay</span><span>{tk(T.total)}</span></div>
          </div>
          <button type="button" className="gc-btn gc-btn--solid" onClick={place}><Icon name="lock" width="16" height="16" aria-hidden="true" />Pay {tk(T.total)} and order</button>
          <p className="gc-help" style={{ margin: 0 }}>You get a VAT invoice. Cancel for a full refund until the first parcel leaves.</p>
        </section>
      </>)}
    </SvcFrame>
  );
}
