'use client';
// OrderLink — the page a customer opens from an order link the merchant sent.
// The products are already chosen. The customer adds name, phone and address, picks the delivery
// area and how to pay, and submits. The request then shows in the merchant's Orders as Pending.

import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { formatBDT } from '@/lib/format';
import { getOrderLink, submitLinkOrder, DELIVERY_RATES, BD_MOBILE, cleanPhone } from '@/lib/orderLinks';
import { saveCustomerOnce, ADDED_FROM } from '@/lib/customers';

const VAT_RATE = 0.05;
const TERMS = [
  { id: 'cod', label: 'Cash on delivery', note: 'Pay the rider when the parcel arrives' },
  { id: 'partial', label: 'Pay delivery charge now', note: 'Advance by bKash or Nagad, the rest on delivery' },
  { id: 'full', label: 'Pay in full now', note: 'bKash, Nagad or card' },
];
// shown when the page is opened without a link id, so the layout can be reviewed
const SAMPLE = { id: 'SAMPLE', discount: 0, vat: true, lines: [{ id: 'p1', name: 'Denim Jeans · Blue', variant: 'Size 32', price: 1290, qty: 1 }, { id: 'p3', name: 'Sunscreen SPF 50 · 50ml', variant: 'Single', price: 890, qty: 1 }] };

const CSS = `
.ol{min-height:100dvh;background:var(--surface-page);color:var(--text-body);font-family:var(--font-sans);font-size:var(--text-sm)}
.ol__top{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-4) var(--space-5);border-bottom:1px solid var(--border-subtle);background:var(--surface-card)}
.ol__logo{display:grid;place-items:center;width:36px;height:36px;border-radius:var(--radius-lg);background:var(--primary);color:#fff;font-size:var(--text-lg);font-weight:var(--weight-semibold)}
.ol__shop{font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ol__wrap{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:var(--space-6);align-items:start;max-width:1040px;margin:0 auto;padding:var(--space-8) var(--space-5) var(--space-12)}
.ol h1{margin:0;font-size:var(--text-2xl);line-height:var(--text-2xl-lh);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ol__lead{margin:var(--space-1) 0 var(--space-5);max-width:52ch;font-size:var(--text-base);line-height:var(--text-base-lh)}
.ol__card{padding:var(--space-5);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-soft)}
.ol__card+.ol__card{margin-top:var(--space-4)}
.ol h2{margin:0 0 var(--space-4);font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ol__field{margin-bottom:var(--space-4)}
.ol__field:last-child{margin-bottom:0}
.ol .gc-input{border-radius:var(--radius-lg);font-size:var(--text-base)}
.ol__err{margin:var(--space-1-5) 0 0;font-size:var(--text-xs);color:var(--text-danger)}
.ol__opt{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);cursor:pointer}
.ol__opt+.ol__opt{margin-top:var(--space-2)}
.ol__opt:has(input:checked){border-color:var(--primary);background:var(--fill-primary-soft)}
.ol__opt input{margin-top:3px;accent-color:var(--primary)}
@media (max-width:640px){.ol__opt input{flex:none;width:20px;height:20px;margin:1px 0 0}} /* a radio a thumb can hit */
.ol__opt b{display:block;font-weight:var(--weight-medium);color:var(--text-heading)}
.ol__opt small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ol__opt span:first-of-type{flex:1;min-width:0}
.ol__amt{font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums;white-space:nowrap}
.ol__line{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) 0}
.ol__thumb{display:grid;place-items:center;width:44px;height:44px;flex:none;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-semibold)}
.ol__line div{flex:1;min-width:0}
.ol__line b{display:block;font-weight:var(--weight-medium);color:var(--text-heading)}
.ol__line small{font-size:var(--text-xs);color:var(--text-muted)}
.ol__sum{display:grid;grid-template-columns:1fr auto;gap:var(--space-2);margin-top:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--border-subtle)}
.ol__sum span:nth-child(even){text-align:right;font-variant-numeric:tabular-nums;color:var(--text-heading)}
.ol__total{grid-column:1/-1;display:flex;justify-content:space-between;align-items:baseline;margin-top:var(--space-2);padding-top:var(--space-3);border-top:1px solid var(--border-subtle);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ol__total span:last-child{font-size:var(--text-2xl)}
.ol__done{max-width:520px;margin:var(--space-12) auto;padding:var(--space-10) var(--space-6);text-align:center}
.ol__done svg{color:var(--text-success)}
@media (max-width:860px){.ol__wrap{grid-template-columns:minmax(0,1fr);padding:var(--space-5) var(--space-4) var(--space-10)}.ol__side{order:-1}}
`;

export default function OrderLink() {
  const [link, setLink] = useState(undefined);   // undefined = loading, null = not found
  const [form, setForm] = useState({ name: '', phone: '', address: '', area: 'dhaka', terms: 'cod' });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(null);
  const refs = { name: useRef(null), phone: useRef(null), address: useRef(null) };

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    setLink(id ? getOrderLink(id) : SAMPLE);
  }, []);

  if (link === undefined) return <div className="dc-screen ds"><style dangerouslySetInnerHTML={{ __html: CSS }} /><div className="ol" /></div>;

  const top = (
    <header className="ol__top"><span className="ol__logo" aria-hidden="true">G</span><span className="ol__shop">GridShop</span></header>
  );

  if (link === null || link.used) {
    return (
      <div className="dc-screen ds"><style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="ol">{top}
          <main className="ol__card ol__done">
            <h1>{link ? 'This order was already submitted' : 'This link is not available'}</h1>
            <p className="ol__lead" style={{ margin: 'var(--space-3) auto 0' }}>{link ? `Your request ${link.order} is with the shop. They will call you to confirm.` : 'The link may have expired, or it was made on another device. Ask the shop to send it again.'}</p>
          </main>
        </div>
      </div>
    );
  }

  const rate = DELIVERY_RATES.find((r) => r.id === form.area);
  const subtotal = link.lines.reduce((s, l) => s + l.price * l.qty, 0);
  const discount = link.discount || 0;
  const tax = link.vat ? Math.round((subtotal - discount) * VAT_RATE) : 0;
  const total = subtotal - discount + rate.fee + tax;
  const payNow = form.terms === 'full' ? total : form.terms === 'partial' ? rate.fee : 0;
  const set = (key) => (e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: undefined }); };

  const submit = (e) => {
    e.preventDefault();
    const phone = cleanPhone(form.phone);
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Enter your full name.';
    if (!BD_MOBILE.test(phone)) errs.phone = 'Enter a mobile number like 01712345678.';
    if (rate.id !== 'pickup' && form.address.trim().length < 8) errs.address = 'Enter your house, road and area.';
    if (form.terms === 'partial' && rate.fee === 0) errs.terms = 'There is no delivery charge to pay in advance. Choose another option.';
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) { if (refs[first] && refs[first].current) refs[first].current.focus(); return; }
    const row = submitLinkOrder(link.id, { name: form.name.trim(), phone, address: form.address.trim(), area: form.area, terms: form.terms, lines: link.lines, total });
    // the shop's customer book keeps the customer (matched by mobile number, never twice)
    saveCustomerOnce({ name: form.name.trim(), phone, address: form.address.trim(), types: ['Online'], addedFrom: ADDED_FROM.link });
    setDone(row);
    window.scrollTo(0, 0);
  };

  if (done) {
    return (
      <div className="dc-screen ds"><style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="ol">{top}
          <main className="ol__card ol__done" role="status">
            <Icon name="circle-check" width="44" height="44" aria-hidden="true" />
            <h1 style={{ marginTop: 'var(--space-3)' }}>Order request sent</h1>
            <p className="ol__lead" style={{ margin: 'var(--space-3) auto 0' }}>Request {done.id} for {formatBDT(total)} is with GridShop. They will call {done.phone} to confirm.{payNow ? ` You chose to pay ${formatBDT(payNow)} now; the shop will send the payment request.` : ' You pay when the parcel arrives.'}</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dc-screen ds" data-screen="OrderLink">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ol">
        {top}
        <main className="ol__wrap">
          <form onSubmit={submit} noValidate>
            <h1>Complete your order</h1>
            <p className="ol__lead">GridShop picked these items for you. Add your details and choose how to pay.</p>

            <section className="ol__card" aria-labelledby="ol-you">
              <h2 id="ol-you">Your details</h2>
              <div className="ol__field"><label className="gc-label" htmlFor="ol-name">Full name *</label><input id="ol-name" ref={refs.name} className={'gc-input' + (errors.name ? ' gc-input--error' : '')} autoComplete="name" aria-required="true" aria-invalid={errors.name ? 'true' : undefined} aria-describedby={errors.name ? 'ol-name-e' : undefined} value={form.name} onChange={set('name')} />{errors.name ? <p id="ol-name-e" className="ol__err" role="alert">{errors.name}</p> : null}</div>
              <div className="ol__field"><label className="gc-label" htmlFor="ol-phone">Mobile number *</label><input id="ol-phone" ref={refs.phone} className={'gc-input' + (errors.phone ? ' gc-input--error' : '')} inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" aria-required="true" aria-invalid={errors.phone ? 'true' : undefined} aria-describedby={errors.phone ? 'ol-phone-e' : undefined} value={form.phone} onChange={set('phone')} />{errors.phone ? <p id="ol-phone-e" className="ol__err" role="alert">{errors.phone}</p> : null}</div>
              <div className="ol__field"><label className="gc-label" htmlFor="ol-addr">Full address {rate.id !== 'pickup' ? '*' : '(optional for pickup)'}</label><textarea id="ol-addr" ref={refs.address} className={'gc-input' + (errors.address ? ' gc-input--error' : '')} rows="2" autoComplete="street-address" placeholder="House, road, area, district" aria-required={rate.id !== 'pickup' ? 'true' : undefined} aria-invalid={errors.address ? 'true' : undefined} aria-describedby={errors.address ? 'ol-addr-e' : undefined} value={form.address} onChange={set('address')} />{errors.address ? <p id="ol-addr-e" className="ol__err" role="alert">{errors.address}</p> : null}</div>
            </section>

            <section className="ol__card" aria-labelledby="ol-del">
              <h2 id="ol-del">Delivery</h2>
              {DELIVERY_RATES.map((r) => (
                <label key={r.id} className="ol__opt">
                  <input type="radio" name="ol-area" checked={form.area === r.id} onChange={() => { setForm({ ...form, area: r.id }); setErrors({ ...errors, terms: undefined }); }} />
                  <span><b>{r.label}</b><small>{r.note}</small></span>
                  <span className="ol__amt">{r.fee ? formatBDT(r.fee) : 'Free'}</span>
                </label>
              ))}
            </section>

            <section className="ol__card" aria-labelledby="ol-pay">
              <h2 id="ol-pay">Payment</h2>
              {TERMS.map((t) => (
                <label key={t.id} className="ol__opt">
                  <input type="radio" name="ol-terms" checked={form.terms === t.id} onChange={() => { setForm({ ...form, terms: t.id }); setErrors({ ...errors, terms: undefined }); }} />
                  <span><b>{t.label}</b><small>{t.note}</small></span>
                  <span className="ol__amt">{t.id === 'cod' ? '' : formatBDT(t.id === 'full' ? total : rate.fee)}</span>
                </label>
              ))}
              {errors.terms ? <p className="ol__err" role="alert">{errors.terms}</p> : null}
            </section>

            <button type="submit" className="gc-btn gc-btn--solid gc-btn--lg gc-btn--block" style={{ marginTop: 'var(--space-5)' }}>Submit order request · {formatBDT(total)}</button>
          </form>

          <aside className="ol__side">
            <section className="ol__card" aria-labelledby="ol-sum">
              <h2 id="ol-sum">Your items</h2>
              {link.lines.map((l) => (
                <div key={l.id} className="ol__line">
                  <span className="ol__thumb" aria-hidden="true">{l.name[0]}</span>
                  <div><b>{l.name}</b><small>{l.variant} · Qty {l.qty}</small></div>
                  <span className="ol__amt">{formatBDT(l.price * l.qty)}</span>
                </div>
              ))}
              <div className="ol__sum">
                <span>Subtotal</span><span>{formatBDT(subtotal)}</span>
                {discount ? <><span>Discount</span><span>−{formatBDT(discount)}</span></> : null}
                <span>Delivery · {rate.label}</span><span>{rate.fee ? formatBDT(rate.fee) : 'Free'}</span>
                {link.vat ? <><span>VAT 5%</span><span>{formatBDT(tax)}</span></> : null}
                <div className="ol__total"><span>Total</span><span>{formatBDT(total)}</span></div>
              </div>
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}
