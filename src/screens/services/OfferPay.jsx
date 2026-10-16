'use client';
// OfferPay — a custom offer from GridCommerce and how the store pays it (Batch D): what is included, delivery days,
// changes, the price with VAT, until when it is valid, and the payment. Used by the payment-link page
// (/service-offer?code=, ServiceOfferPage below) and by My services › the order while it awaits payment.
// Paying confirms the order (services.js › payOffer); for this shop it also books the expense in Money.

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { postEntry } from '@/lib/ledger';
import { offerByCode, payOffer, stateOf, serviceById, PAY_METHODS, payLabel, SELF_SHOP } from '@/lib/platform/services';
import { useServices, tk, dateText, daysWord, query, SVC_CSS } from './svcShared';

const PAY_ACCOUNT = { bkash: 'bkash', nagad: 'nagad', card: 'brac', credits: 'gc-credits' };

export const OFFER_CSS = `
.of-card{display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-5);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:0 1px 2px rgba(15,23,42,.04)}
.of-cover{aspect-ratio:16/7;max-height:240px;width:100%;border-radius:var(--radius-lg);background:var(--surface-subtle) center/cover no-repeat}
.of-card h2{margin:0;font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.of-card p{margin:0;font-size:var(--text-sm);color:var(--text-body);line-height:1.5}
.of-tag{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-muted)}
.of-done{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);text-align:center;padding:var(--space-4) 0}
.of-done svg{color:var(--text-success)}
`;

/** The offer card with the payment (o = the order in `unpaid`). onPaid(order) after paying. */
export function OfferPay({ o, onPaid }) {
  const [method, setMethod] = useState('bkash');
  const [busy, setBusy] = useState(false);
  const st = stateOf(o);
  const svc = st.svc || serviceById(o.serviceId) || {};
  const pkg = (svc.packages || [])[0] || {};
  const expired = st.status === 'expired';
  const pay = () => {
    setBusy(true);
    const r = payOffer(o.offer.code, method, o.shopName);
    setBusy(false);
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    if (o.shopId === SELF_SHOP) { try { postEntry({ account: PAY_ACCOUNT[method], amount: -o.total, kind: 'expense', cat: 'Software & subscriptions', party: 'GridCommerce Services', note: `${svc.name} · custom offer · ${o.invNo}`, ref: r.order.paid.txId, by: 'Staff' }); } catch { /* the books are optional here */ } }
    toast('Paid. Your order has started.');
    if (onPaid) onPaid(r.order);
  };
  return (
    <section className="of-card" aria-labelledby="of-title">
      {svc.cover ? <span className="of-cover" style={{ backgroundImage: `url(${svc.cover})` }} role="img" aria-label="" /> : null}
      <span className="of-tag"><Icon name="sparkles" width="14" height="14" aria-hidden="true" />Custom offer for {o.shopName} · {o.id}</span>
      <h2 id="of-title">{svc.name}</h2>
      {svc.blurb ? <p>{svc.blurb}</p> : null}
      {(pkg.includes || []).length ? <ul className="svc-list">{pkg.includes.map((x) => <li key={x}><Icon name="check" width="14" height="14" aria-hidden="true" />{x}</li>)}</ul> : null}
      <span className="svc-meta"><span>{daysWord(pkg.days || 0)} to deliver, from payment</span><span>{pkg.revisions ? `${pkg.revisions} change${pkg.revisions === 1 ? '' : 's'} included` : 'No changes included'}</span></span>
      <div className="svc-sum">
        <div><span>Price</span><span>{tk(o.fee)}</span></div>
        <div><span>VAT {o.vatPct}%</span><span>{tk(o.vat)}</span></div>
        <div className="is-total"><span>To pay</span><span>{tk(o.total)}</span></div>
      </div>
      {expired ? (
        <p className="svc-note" style={{ background: 'var(--fill-warning-soft)' }}><Icon name="clock" width="16" height="16" aria-hidden="true" style={{ color: 'var(--text-warning)' }} />This offer ended on {dateText(o.offer.expiresAt)}. Ask GridCommerce for a new link.</p>
      ) : (<>
        <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
          <legend className="gc-label">Pay with</legend>
          <div className="svc-pay">{PAY_METHODS.map(([k, l]) => <label key={k} className={method === k ? 'is-on' : ''}><input type="radio" name="of-pay" value={k} checked={method === k} onChange={() => setMethod(k)} />{l}</label>)}</div>
        </fieldset>
        <button type="button" className="gc-btn gc-btn--solid" disabled={busy} onClick={pay}>Pay {tk(o.total)} and confirm</button>
        <span className="gc-help" style={{ margin: 0 }}>Valid until {dateText(o.offer.expiresAt)}. Work starts when it is paid; you follow it in My services.</span>
      </>)}
    </section>
  );
}

/** /service-offer?code= — the payment link GridCommerce sends (email, WhatsApp, SMS, social). Works without the menu. */
export default function ServiceOfferPage() {
  const { ready, tick } = useServices();
  const [paid, setPaid] = useState(null);
  const code = ready ? query('code') : '';
  const o = ready ? offerByCode(code) : null;
  void tick;
  return (
    <div className="dc-screen ds" data-screen="ServiceOffer" style={{ minHeight: '100vh', background: 'var(--surface-page)' }}>
      <style dangerouslySetInnerHTML={{ __html: SVC_CSS + OFFER_CSS }} />
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '32px 16px 64px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="svc-ico" aria-hidden="true"><Icon name="briefcase-business" width="18" height="18" /></span>
          <span style={{ display: 'flex', flexDirection: 'column' }}><b style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-heading)' }}>GridCommerce Services</b><span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>Secure payment link</span></span>
        </header>
        {!ready ? <div style={{ minHeight: 360 }} aria-busy="true" /> : paid ? (
          <section className="of-card"><div className="of-done">
            <Icon name="circle-check" width="40" height="40" aria-hidden="true" />
            <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-heading)' }}>Paid · {tk(paid.total)}</h2>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{payLabel(paid.paid.method)} · {paid.paid.txId}. Invoice {paid.invNo}. We have started.</p>
            <Link href={'/my-service?id=' + paid.id} className="gc-btn gc-btn--solid" style={{ textDecoration: 'none' }}>Follow it in My services</Link>
          </div></section>
        ) : !o ? (
          <section className="of-card"><EmptyState icon="link-2-off" title="This payment link is not valid" body="Check the link, or ask GridCommerce support for a new one." /></section>
        ) : o.status !== 'unpaid' ? (
          <section className="of-card"><EmptyState icon={o.status === 'cancelled' ? 'circle-x' : 'circle-check'} title={o.status === 'cancelled' ? 'This offer was withdrawn' : 'This offer is already paid'} body={o.status === 'cancelled' ? 'Ask GridCommerce support if you still need the work.' : 'Follow the work in My services.'} actionLabel={o.status === 'cancelled' ? undefined : 'My services'} onAction={o.status === 'cancelled' ? undefined : () => { window.location.href = '/my-service?id=' + o.id; }} /></section>
        ) : <OfferPay o={o} onPaid={setPaid} />}
        <p className="gc-help" style={{ margin: 0, textAlign: 'center' }}>Questions? Reply to the message this link came in, or call GridCommerce support.</p>
      </main>
    </div>
  );
}
