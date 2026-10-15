'use client';
// TrackOrder — the customer's order page (ON-F7, also the order-status page of ON-F15): /track?id=<order number>.
// The SMS / WhatsApp "Track" link ({{tracking_url}}, orderStatus.js › trackingLink) and the checkout's thank-you page
// open it. The customer types the mobile number the order was placed with; only then the order shows:
//   where it is (Order placed → Confirmed → Packed → With the courier → Delivered, with the times), the courier and
//   tracking ID with the courier's scans, the cash to pay on delivery, the items, and how to reach the shop.
// Nothing else (no address, no other orders). A delivered order can ask for a return here (lib/returnRequests.js:
// items, reason, refund or exchange); an open request shows its stage.
// Front end only: orders come from this browser (lib/orders.js); the live shop serves the same page on its domain.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { getOrders } from '@/lib/orders';
import { trackingOf, isDigitalOrder } from '@/lib/orderFlow';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { businessProfile } from '@/lib/businessProfile';
import { requestsForOrder, requestReturn, canRequestReturn, RR_LABEL, RR_REASONS, REFUND_TO, RETURN_REQUESTS_EVENT } from '@/lib/returnRequests';
import { StoreChrome, Crumbs } from './storeChrome';

const digits = (t) => String(t || '').replace(/\D/g, '').replace(/^88(?=01)/, '');
// what the customer reads for each saved status
export const NOW = {
  onhold: ['Waiting for confirmation', 'We will call you to confirm the order.'],
  processing: ['Paid · waiting for confirmation', 'We will confirm it shortly.'],
  pending: ['Waiting for payment', 'Pay with the link we sent, then we confirm it.'],
  approved: ['Confirmed', 'We are packing your order.'],
  ready: ['Packed', 'Waiting for the courier to pick it up.'],
  shipped: ['On the way', 'The courier has your parcel.'],
  delivered: ['Delivered', 'Thank you for shopping with us.'],
  cancelled: ['Cancelled', 'This order was cancelled.'],
  returned: ['Returned', 'The parcel came back to the shop.'],
};
const STEPS = [['placed', 'Order placed'], ['approved', 'Confirmed'], ['ready', 'Packed'], ['shipped', 'With the courier'], ['delivered', 'Delivered']];

const CSS = `
.tr-card{max-width:640px;margin:0 auto;display:flex;flex-direction:column;gap:var(--space-4);padding:28px 32px}
.tr-card h1{margin:0;font-size:var(--text-2xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.tr-card h2{margin:0;font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.tr-lead{margin:0;font-size:var(--text-sm);color:var(--text-muted)}
.tr-form{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:var(--space-3);align-items:end}
.tr-fld{display:flex;flex-direction:column;gap:6px;min-width:0}
.tr-fld label,.tr-lbl{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.tr-err{margin:0;font-size:var(--text-sm);color:var(--text-danger)}
.tr-head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:var(--space-2)}
.tr-id{font-family:var(--font-data)}
.tr-now{display:flex;gap:var(--space-3);align-items:center;padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);background:var(--fill-primary-soft)}
.tr-now b{display:block;font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.tr-now span{font-size:var(--text-sm);color:var(--text-body)}
.tr-steps{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.tr-steps li{position:relative;display:grid;grid-template-columns:20px minmax(0,1fr) auto;gap:var(--space-3);align-items:baseline;padding-bottom:var(--space-3)}
.tr-steps li::before{content:"";position:absolute;left:9px;top:18px;bottom:0;width:2px;background:var(--border-subtle)}
.tr-steps li:last-child{padding-bottom:0}.tr-steps li:last-child::before{display:none}
.tr-steps i{width:20px;height:20px;border-radius:var(--radius-full);border:2px solid var(--border-strong);background:var(--surface-card);transform:translateY(4px)}
.tr-steps li.is-done i{border-color:var(--fill-success);background:var(--fill-success)}
.tr-steps li.is-done::before{background:var(--fill-success)}
.tr-steps b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.tr-steps li:not(.is-done) b{color:var(--text-muted);font-weight:var(--weight-regular)}
.tr-steps span{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.tr-kv{display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px var(--space-4);margin:0;font-size:var(--text-sm)}
.tr-kv dt{color:var(--text-muted)}.tr-kv dd{margin:0;color:var(--text-heading);text-align:right;overflow-wrap:anywhere}
.tr-cod{padding:var(--space-3) var(--space-4);border:2px solid var(--primary);border-radius:var(--radius-lg);display:flex;justify-content:space-between;align-items:center;font-size:var(--text-sm)}
.tr-cod b{font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.tr-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;font-size:var(--text-sm);color:var(--text-body)}
.tr-list li{display:flex;justify-content:space-between;gap:var(--space-3)}
.tr-scan{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px;font-size:var(--text-xs);color:var(--text-muted)}
.tr-hr{height:1px;margin:0;border:0;background:var(--border-subtle)}
.tr-ret{display:flex;flex-direction:column;gap:var(--space-3)}
.tr-qty{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);font-size:var(--text-sm)}
.tr-qty input{width:84px;text-align:right}
.tr-badge{display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body)}
@media (max-width:640px){
  .tr-card{padding:20px 16px}
  .tr-form{grid-template-columns:minmax(0,1fr)}
  .tr-form .gc-btn{width:100%}
}
`;

export default function TrackOrder() {
  const [ready, setReady] = useState(false);
  const [num, setNum] = useState('');
  const [phone, setPhone] = useState('');
  const [found, setFound] = useState('');   // the order id shown, after the phone check
  const [err, setErr] = useState('');
  const [tick, setTick] = useState(0);
  const [ret, setRet] = useState(null);     // the return form: { qty, reason, want, method, number, note, error }
  const [sent, setSent] = useState('');
  const [shop, setShop] = useState({ phone: '', email: '' });   // Settings › General's customer contact

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setNum(p.get('id') || '');
    try { const c = businessProfile().contact || {}; setShop({ phone: c.phone || '', email: c.email || '' }); } catch { /* defaults */ }
    setReady(true);
    const again = () => setTick((t) => t + 1);
    window.addEventListener(RETURN_REQUESTS_EVENT, again);
    return () => window.removeEventListener(RETURN_REQUESTS_EVENT, again);
  }, []);

  const all = useMemo(() => (ready ? getOrders() : []), [ready, tick]);
  const o = found ? all.find((x) => x.id === found) || null : null;

  const look = (e) => {
    e.preventDefault();
    const n = num.trim().replace(/^#?/, '#').toUpperCase();
    const raw = num.trim().toUpperCase();
    const hit = all.find((x) => !/^(POS|Wholesale)/.test(String(x.channel || '')) && !x.isInvoice && (x.id.toUpperCase() === n || (x.consignment && x.consignment !== '—' && x.consignment.toUpperCase() === raw)));
    // the mobile number must match the order's: nothing shows otherwise (the same message either way)
    if (!hit || digits(hit.phone).length < 10 || digits(hit.phone) !== digits(phone)) { setFound(''); setErr('No order matches that number and mobile number.'); return; }
    setErr(''); setFound(hit.id); setRet(null); setSent('');
  };

  const shell = (body) => (
    <StoreChrome screen="TrackOrder" head={{ title: 'Track your order', description: '', robots: 'noindex, nofollow', canonical: '', og: {}, jsonld: [] }}>
      {() => (<>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <Crumbs items={[{ name: 'Track your order' }]} />
        {body}
      </>)}
    </StoreChrome>
  );

  if (!ready) return shell(<div className="spg-card tr-card" style={{ minHeight: 320 }} aria-busy="true" />);

  const form = (
    <form className="tr-form" onSubmit={look} noValidate>
      <div className="tr-fld"><label htmlFor="tr-num">Order number</label><input id="tr-num" className="gc-input" value={num} onChange={(e) => setNum(e.target.value)} placeholder="#136779" autoComplete="off" /></div>
      <div className="tr-fld"><label htmlFor="tr-phone">Mobile number</label><input id="tr-phone" className="gc-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" inputMode="tel" autoComplete="tel" /></div>
      <button type="submit" className="gc-btn gc-btn--solid">Track</button>
    </form>
  );

  if (!o) {
    return shell(
      <section className="spg-card tr-card" aria-labelledby="tr-h">
        <h1 id="tr-h">Track your order</h1>
        <p className="tr-lead">Enter your order number and the mobile number you ordered with.</p>
        {form}
        {err ? <p className="tr-err" role="alert">{err}</p> : null}
      </section>
    );
  }

  const now = NOW[o.statusKey] || [o.status, ''];
  const digital = isDigitalOrder(o);
  const steps = (digital ? STEPS.filter(([k]) => k !== 'ready' && k !== 'shipped') : STEPS);
  const t = o.times || {};
  const reached = (k) => !!t[k] || (k === 'placed');
  const off = o.statusKey === 'cancelled' || o.statusKey === 'returned';
  const scans = trackingOf(o);
  const cod = o.codAmount != null ? o.codAmount : Math.max(0, (o.amount || 0) - (o.paid || 0));
  const showCod = cod > 0 && !['delivered', 'cancelled', 'returned'].includes(o.statusKey);
  const reqs = requestsForOrder(o.id);
  const can = canRequestReturn(o);
  const first = String(o.customer || '').split(' ')[0];

  const openReturn = () => setRet({ qty: Object.fromEntries(o.lines.map((l) => [l.name, 0])), reason: '', want: 'refund', method: 'bKash', number: digits(o.phone), note: '', error: '' });
  const sendReturn = (e) => {
    e.preventDefault();
    const r = requestReturn(o, {
      lines: Object.entries(ret.qty).map(([name, qty]) => ({ name, qty })), reason: ret.reason, note: ret.note, want: ret.want,
      refundTo: ret.want === 'refund' ? { method: ret.method, number: ret.number } : null, from: 'Customer',
    });
    if (!r.ok) { setRet({ ...ret, error: r.error }); return; }
    setRet(null); setSent(r.request.id); setTick((x) => x + 1);
  };

  return shell(
    <section className="spg-card tr-card" aria-labelledby="tr-h">
      <div className="tr-head">
        <h1 id="tr-h">Order <span className="tr-id">{o.id}</span></h1>
        <span className="tr-lead">Placed {formatDate(o.at)}{first ? ' · ' + first : ''}</span>
      </div>

      <div className="tr-now" role="status">
        <Icon name={o.statusKey === 'delivered' ? 'package-check' : off ? 'circle-x' : o.statusKey === 'shipped' ? 'truck' : 'clock'} width="24" height="24" aria-hidden="true" />
        <span><b>{now[0]}</b>{now[1]}</span>
      </div>

      {!off ? (
        <ol className="tr-steps" aria-label="Order progress">
          {steps.map(([k, label]) => (
            <li key={k} className={reached(k) ? 'is-done' : ''}>
              <i aria-hidden="true" /><b>{label}<span className="sr-only">{reached(k) ? ' (done)' : ' (not yet)'}</span></b><span>{t[k] ? formatTime(t[k]) + ', ' + formatDate(t[k]) : ''}</span>
            </li>
          ))}
        </ol>
      ) : null}

      {showCod ? <div className="tr-cod"><span>Pay on delivery</span><b>{formatBDT(cod)}</b></div> : null}

      {o.courier && o.consignment && o.consignment !== '—' ? (<>
        <hr className="tr-hr" />
        <h2>Courier</h2>
        <dl className="tr-kv"><dt>Courier</dt><dd>{o.courier}</dd><dt>Tracking ID</dt><dd className="tr-id">{o.consignment}</dd></dl>
        {scans.length ? <ul className="tr-scan">{scans.map((x, i) => <li key={x.code + x.at + i}>{formatTime(x.at)}, {formatDate(x.at)} · {x.text}</li>)}</ul> : null}
      </>) : null}

      <hr className="tr-hr" />
      <h2>Items</h2>
      <ul className="tr-list">
        {o.lines.map((l, i) => <li key={l.name + i}><span>{l.name} × {l.qty}</span><span>{formatBDT((Number(l.price) || 0) * l.qty)}</span></li>)}
        {Number(o.shipping) > 0 ? <li><span>Delivery</span><span>{formatBDT(o.shipping)}</span></li> : null}
        {Number(o.codFee) > 0 ? <li><span>Cash on delivery fee</span><span>{formatBDT(o.codFee)}</span></li> : null}
        {Number(o.discount) > 0 ? <li><span>Discount</span><span>−{formatBDT(o.discount)}</span></li> : null}
        <li style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-heading)' }}><span>Total</span><span>{formatBDT(o.amount)}</span></li>
      </ul>

      {reqs.length || can.ok || sent || (o.statusKey === 'delivered' && can.until) ? <hr className="tr-hr" /> : null}
      {reqs.length ? (
        <div className="tr-ret">
          <h2>Return</h2>
          {reqs.map((r) => (
            <p key={r.id} className="tr-lead" style={{ color: 'var(--text-body)' }}>
              <span className="tr-badge">{RR_LABEL[r.stage]}</span>{' '}{r.id} · {r.lines.map((l) => `${l.name} × ${l.qty}`).join(', ')}{r.rejectReason ? ' · ' + r.rejectReason : ''}{r.pickup ? ` · pickup ${r.pickup.courier} ${r.pickup.id}` : ''}
            </p>
          ))}
        </div>
      ) : null}
      {sent ? <p className="tr-lead" role="status" style={{ color: 'var(--text-success)' }}>Return {sent} sent. We will call you to arrange the pickup.</p> : null}
      {o.statusKey === 'delivered' && !can.ok && !reqs.length && can.until ? <p className="tr-lead">Returns closed on {formatDate(can.until)}.</p> : null}
      {can.ok && !ret ? <div><button type="button" className="gc-btn gc-btn--neutral" onClick={openReturn}><Icon name="undo-2" width="16" height="16" aria-hidden="true" />Request a return</button><p className="tr-lead" style={{ marginTop: 'var(--space-2)' }}>Open until {formatDate(can.until)}.</p></div> : null}
      {ret ? (
        <form className="tr-ret" onSubmit={sendReturn} noValidate>
          <h2>Request a return</h2>
          {o.lines.map((l) => (
            <div key={l.name} className="tr-qty">
              <label htmlFor={'tr-q-' + l.name}>{l.name} <span className="tr-lead">(bought {l.qty})</span></label>
              <input id={'tr-q-' + l.name} className="gc-input" type="number" min="0" max={l.qty} inputMode="numeric" value={ret.qty[l.name]} onChange={(e) => setRet({ ...ret, qty: { ...ret.qty, [l.name]: Math.max(0, Math.min(l.qty, Number(e.target.value) || 0)) }, error: '' })} />
            </div>
          ))}
          <div className="tr-fld"><label htmlFor="tr-why">Why</label><select id="tr-why" className="gc-input gc-select" value={ret.reason} onChange={(e) => setRet({ ...ret, reason: e.target.value, error: '' })}><option value="">Choose a reason</option>{RR_REASONS.map((x) => <option key={x}>{x}</option>)}</select></div>
          <div className="ix-chips" role="group" aria-label="What you want">{[['refund', 'Money back'], ['exchange', 'Same item again']].map(([k, l]) => <button key={k} type="button" className="ix-chip" aria-pressed={ret.want === k} onClick={() => setRet({ ...ret, want: k })}>{l}</button>)}</div>
          {ret.want === 'refund' ? (
            <div className="tr-form" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
              <div className="tr-fld"><label htmlFor="tr-m">Refund to</label><select id="tr-m" className="gc-input gc-select" value={ret.method} onChange={(e) => setRet({ ...ret, method: e.target.value })}>{REFUND_TO.map((x) => <option key={x}>{x}</option>)}</select></div>
              {['bKash', 'Nagad'].includes(ret.method) ? <div className="tr-fld"><label htmlFor="tr-n">{ret.method} number</label><input id="tr-n" className="gc-input" inputMode="tel" value={ret.number} onChange={(e) => setRet({ ...ret, number: e.target.value, error: '' })} /></div> : null}
            </div>
          ) : null}
          <div className="tr-fld"><label htmlFor="tr-note">Anything else (optional)</label><input id="tr-note" className="gc-input" value={ret.note} onChange={(e) => setRet({ ...ret, note: e.target.value })} /></div>
          {ret.error ? <p className="tr-err" role="alert">{ret.error}</p> : null}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}><button type="submit" className="gc-btn gc-btn--solid">Send request</button><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setRet(null)}>Cancel</button></div>
        </form>
      ) : null}

      <hr className="tr-hr" />
      <p className="tr-lead">Questions? Call or message us with the order number{shop.phone ? <>: <a href={'tel:' + digits(shop.phone)}>{shop.phone}</a></> : null}{shop.email ? <> · <a href={'mailto:' + shop.email}>{shop.email}</a></> : null}.</p>
      <button type="button" className="gc-btn gc-btn--neutral" style={{ alignSelf: 'flex-start' }} onClick={() => { setFound(''); setPhone(''); setNum(''); }}>Track another order</button>
    </section>
  );
}
