'use client';
// My account — the shopper's account on the online store (/account?tab=; Batch B step 2, "Remaining work" item 5).
// Signed out: sign in with the mobile number and a code by SMS or WhatsApp (demo code 1234; a new number gets an
// account), or with an email and password when Settings › Checkout allows it. Signed in: Orders (status, track, buy
// again, invoice), Returns (ask for one on the order page, see where each is), Addresses (district and area picker),
// Wishlist and Compare (their own pages), Points & credit (loyalty points, level, store credit), Coupons (the website's
// live codes), Warranty (items, days left, ask for service) and Profile (name, email, password, message choices that
// write the shop's consent record) and Affiliate (the affiliate dashboard: link, code, QR, results, payouts; or Become an
// affiliate). Data: lib/storefront/account.js and the shop's own libs (orders, returnRequests,
// loyalty, storeCredit, storeOffers, customerWarranty). When accounts are off, the page says so.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { formatDate } from '@/lib/format';
import { printNode } from '@/lib/printNode';
import { invoiceIdentity } from '@/lib/businessProfile';
import { returnRequests, canRequestReturn, RR_LABEL, RETURN_REQUESTS_EVENT } from '@/lib/returnRequests';
import { findMember, getLoyaltySettings } from '@/lib/loyalty';
import { creditHistory } from '@/lib/storeCredit';
import { websiteOffers } from '@/lib/storeOffers';
import { warrantyItems, requestService, getClaims, CLAIM_LABEL, stepOf, CLAIMS_EVENT } from '@/lib/customerWarranty';
import { addToCart, openSideCart, skuForProduct } from '@/lib/storefront/cart';
import { storeProducts, refreshCatalog } from '@/lib/storefront/catalog';
import {
  accountSettings, sendCode, signInWithCode, signInWithPassword, signOut, updateAccount, setPassword, saveAddress, removeAddress,
  ordersOf, buyAgainSkus, toggleWishlist, wishlistLink, messageChoices, setMessageChoice, MESSAGE_CHANNELS, hasAccount, prettyMobile, DEMO_SHOPPER, DEMO_CODE, ACCOUNT_EVENT,
} from '@/lib/storefront/account';
import { AreaPicker } from '@/components/AreaPicker';
import { QrCode } from '@/components/QrCode';
import { affiliateOfPhone, getApplications, commissionsOf, statsOf, payoutsOf, affLink, affSettings, updateAffiliate, PAYOUT_METHODS, AFF_EVENT, withdrawRules, requestPlan, requestWithdrawal, withdrawalsOf, WD_LABEL } from '@/lib/affiliates';
import { StoreChrome, Crumbs } from './storeChrome';
import { bdt } from './storeKit';
import { useAccount } from './accountParts';
import { AvatarField, Avatar, AVATAR_CSS } from './AvatarCrop';

const HEAD = { title: 'My account', description: '', robots: 'noindex, nofollow', canonical: '', og: {}, jsonld: [] };
// what the shopper reads for each order status (as on the order page, /track)
const NOW = { onhold: 'Waiting for confirmation', processing: 'Paid · waiting for confirmation', pending: 'Waiting for payment', approved: 'Confirmed', ready: 'Packed', shipped: 'On the way', delivered: 'Delivered', cancelled: 'Cancelled', returned: 'Returned' };
const TONE = { delivered: 'ok', cancelled: 'off', returned: 'off', shipped: 'go', pending: 'warn' };
// Profile is first in the list (Batch C step 2); the page still opens on Orders unless ?tab= says otherwise
export const ACCOUNT_TABS = [
  ['profile', 'Profile', 'user'], ['orders', 'Orders', 'package'], ['returns', 'Returns', 'undo-2'], ['addresses', 'Addresses', 'map-pin'], ['wishlist', 'Wishlist', 'heart'],
  ['compare', 'Compare', 'git-compare'], ['rewards', 'Points & credit', 'gift'], ['coupons', 'Coupons', 'ticket'], ['warranty', 'Warranty', 'shield-check'],
  ['affiliate', 'Affiliate', 'share-2'],
];

const CSS = `
.sac{display:grid;grid-template-columns:240px minmax(0,1fr);gap:var(--sf-gap);align-items:start;padding-bottom:var(--sf-section)}
.sac-nav{display:flex;flex-direction:column;gap:2px;padding:8px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface);position:sticky;top:16px}
.sac-nav a,.sac-nav button{display:flex;align-items:center;gap:10px;min-height:40px;padding:0 12px;border:0;border-radius:var(--sf-radius);background:none;color:inherit;font:inherit;text-decoration:none;cursor:pointer;text-align:left}
.sac-nav a:hover,.sac-nav button:hover{background:var(--sf-soft)}
.sac-nav a[aria-current="page"]{background:var(--sf-soft);color:var(--sf-primary);font-weight:var(--weight-medium)}
.sac-nav hr{border:0;border-top:1px solid var(--sf-line);margin:6px 0}
.sac-main{display:flex;flex-direction:column;gap:16px;min-width:0}
.sac-card{display:flex;flex-direction:column;gap:14px;padding:20px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.sac-card h1{font-size:var(--sf-fs-h2)}
.sac-card h2{font-size:var(--sf-fs-h3)}
.sac-hi{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 16px}
.sac-figs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.sac-figs a{display:flex;flex-direction:column;gap:2px;padding:12px 14px;border:1px solid var(--sf-line);border-radius:var(--sf-radius);text-decoration:none}
.sac-figs b{font-size:var(--sf-fs-lg);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.sac-figs span{font-size:var(--sf-fs-sm);color:var(--sf-muted)}
.sac-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.sac-list>li{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;padding:14px 0;border-top:1px solid var(--sf-line)}
.sac-list>li:first-child{border-top:0;padding-top:0}
.sac-grow{flex:1 1 240px;min-width:0;display:flex;flex-direction:column;gap:2px}
.sac-grow b{font-weight:var(--weight-medium)}
.sac-grow small,.sac-sm{font-size:var(--sf-fs-sm);color:var(--sf-muted)}
.sac-acts{display:flex;flex-wrap:wrap;gap:6px}
.sac-tag{display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:var(--radius-full);background:var(--sf-soft);font-size:var(--sf-fs-sm);font-weight:var(--weight-medium);white-space:nowrap}
.sac-tag.ok{background:#dcfce7;color:#166534}.sac-tag.off{background:#f1f5f9;color:#475569}.sac-tag.go{background:#dbeafe;color:#1e40af}.sac-tag.warn{background:#fef3c7;color:#92400e}
.sac-fld{display:flex;flex-direction:column;gap:6px;min-width:0}
.sac-fld label,.sac-lbl{font-size:var(--sf-fs-sm);font-weight:var(--weight-medium)}
.sac-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.sac-err{margin:0;font-size:var(--sf-fs-sm);color:#b91c1c}
.sac-ok{margin:0;font-size:var(--sf-fs-sm);color:#047857}
.sac-chips{display:flex;flex-wrap:wrap;gap:6px}
.sac-chips button{min-height:36px;padding:0 14px;border:1px solid var(--sf-line);border-radius:var(--radius-full);background:var(--sf-surface);color:inherit;font:inherit;font-size:var(--sf-fs-sm);cursor:pointer}
.sac-chips button[aria-pressed="true"]{border-color:var(--sf-primary);color:var(--sf-primary);box-shadow:inset 0 0 0 1px var(--sf-primary)}
.sac-sign{max-width:440px;margin:8px auto var(--sf-section);width:100%}
.sac-demo{padding:10px 12px;border-radius:var(--sf-radius);background:var(--sf-soft);font-size:var(--sf-fs-sm)}
.sac-sw{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:44px;border-top:1px solid var(--sf-line)}
.sac-sw:first-of-type{border-top:0}
.sac-sw input{width:20px;height:20px;accent-color:var(--sf-primary)}
.sac-code{font-family:var(--font-data);font-weight:var(--weight-semibold);letter-spacing:.04em;padding:4px 10px;border:1px dashed var(--sf-primary);border-radius:var(--sf-radius);color:var(--sf-primary)}
.sac-bar{height:8px;border-radius:var(--radius-full);background:var(--sf-soft);overflow:hidden}
.sac-bar i{display:block;height:100%;background:var(--sf-primary)}
.sac-inv{font-size:var(--text-xs);color:#0f172a;padding:24px}
.sac-inv table{width:100%;border-collapse:collapse;margin:12px 0}
.sac-inv th,.sac-inv td{padding:6px 8px;border-bottom:1px solid #e2e8f0;text-align:left}
.sac-inv td:last-child,.sac-inv th:last-child{text-align:right}
.sac-wl{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin:0;padding:0;list-style:none}
.sac-wl li{display:flex;flex-direction:column;border:1px solid var(--sf-line);border-radius:var(--sf-radius);overflow:hidden;background:var(--sf-surface);min-width:0}
.sac-wl-img{position:relative;display:block;aspect-ratio:1/1;overflow:hidden}
.sac-wl-img img{width:100%;height:100%;object-fit:cover;display:block}
.sac-wl-img>a{display:block;width:100%;height:100%}
.sac-wl-img>a>span{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:var(--sf-fs-h2);color:var(--sf-muted)}
.sac-wl-x{position:absolute;top:6px;right:6px;display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:0;border-radius:var(--radius-full);background:rgba(255,255,255,.92);color:#334155;cursor:pointer;box-shadow:0 1px 3px rgba(15,23,42,.15)}
.sac-wl-x:hover{color:#b91c1c}
.sac-wl-b{display:flex;flex-direction:column;gap:4px;padding:10px;flex:1}
.sac-wl-b a{font-size:var(--sf-fs-sm);font-weight:var(--weight-medium);text-decoration:none;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sac-wl-p{display:flex;align-items:baseline;gap:6px;font-variant-numeric:tabular-nums}
.sac-wl-p b{font-weight:var(--weight-semibold)}
.sac-wl-p s{font-size:var(--sf-fs-sm);color:var(--sf-muted)}
.sac-wl-b .sf-btn{margin-top:auto;width:100%;justify-content:center}
@media (max-width:899px){
  .sac{grid-template-columns:minmax(0,1fr)}
  .sac-nav{position:static;flex-direction:row;overflow-x:auto;padding:6px;scrollbar-width:none}
  .sac-nav a,.sac-nav button{flex:none;white-space:nowrap}
  .sac-nav hr{display:none}
  .sac-figs{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:640px){.sac-card{padding:16px}.sac-2{grid-template-columns:minmax(0,1fr)}.sac-wl{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}}
`;

// ---- signing in ----------------------------------------------------------------------------------------------------
function SignIn({ s, q }) {
  const [how, setHow] = useState(s.code ? 'code' : 'password');
  const [phone, setPhone] = useState('');
  const [via, setVia] = useState('sms');
  const [sent, setSent] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const isNew = !!sent && !hasAccount(sent);
  const send = (e) => { e.preventDefault(); const r = sendCode(phone, via); if (!r.ok) { setErr(r.error); return; } setErr(''); setSent(phone.replace(/\D/g, '')); setCode(''); toast(r.note); };
  const check = (e) => { e.preventDefault(); const r = signInWithCode(sent, code, { name }); if (!r.ok) { setErr(r.error); return; } toast(r.created ? 'Account made. Welcome!' : 'Signed in'); };
  const byPw = (e) => { e.preventDefault(); const r = signInWithPassword(email, pw); if (!r.ok) setErr(r.error); else toast('Signed in'); };
  return (
    <div className="sac-sign">
      <section className="sac-card" aria-labelledby="sac-in">
        <h1 id="sac-in">{s.mode === 'required' ? 'Sign in to shop' : 'Sign in or make an account'}</h1>
        {s.code && s.password ? <div className="sac-chips" role="group" aria-label="How to sign in">{[['code', 'Mobile number'], ['password', 'Email and password']].map(([k, l]) => <button key={k} type="button" aria-pressed={how === k} onClick={() => { setHow(k); setErr(''); }}>{l}</button>)}</div> : null}
        {how === 'code' ? (!sent ? (
          <form onSubmit={send} className="sac-main" noValidate>
            <div className="sac-fld"><label htmlFor="sac-phone">Mobile number</label><input id="sac-phone" className="sf-input" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => { setPhone(e.target.value); setErr(''); }} /></div>
            <div className="sac-fld"><span className="sac-lbl" id="sac-via">Send the code by</span><div className="sac-chips" role="group" aria-labelledby="sac-via">{[['sms', 'SMS'], ['whatsapp', 'WhatsApp']].map(([k, l]) => <button key={k} type="button" aria-pressed={via === k} onClick={() => setVia(k)}>{l}</button>)}</div></div>
            {err ? <p className="sac-err" role="alert">{err}</p> : null}
            <button type="submit" className="sf-btn sf-btn--fill">Send code</button>
          </form>
        ) : (
          <form onSubmit={check} className="sac-main" noValidate>
            <p className="sac-sm" style={{ margin: 0 }}>We sent a 4-digit code by {via === 'whatsapp' ? 'WhatsApp' : 'SMS'} to <b>{prettyMobile(sent)}</b>. <button type="button" className="sf-link" onClick={() => { setSent(''); setErr(''); }}>Change number</button></p>
            <div className="sac-fld"><label htmlFor="sac-code">Code</label><input id="sac-code" className="sf-input" inputMode="numeric" autoComplete="one-time-code" maxLength={4} value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setErr(''); }} style={{ maxWidth: 160, letterSpacing: '.3em' }} /></div>
            {isNew ? <div className="sac-fld"><label htmlFor="sac-name">Your name</label><input id="sac-name" className="sf-input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="So we know what to call you" /></div> : null}
            {err ? <p className="sac-err" role="alert">{err}</p> : null}
            <button type="submit" className="sf-btn sf-btn--fill">{isNew ? 'Make my account' : 'Sign in'}</button>
            <button type="button" className="sf-link" style={{ alignSelf: 'flex-start' }} onClick={() => { const r = sendCode(sent, via); toast(r.note || r.error); }}>Send the code again</button>
          </form>
        )) : (
          <form onSubmit={byPw} className="sac-main" noValidate>
            <div className="sac-fld"><label htmlFor="sac-email">Email</label><input id="sac-email" className="sf-input" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(''); }} /></div>
            <div className="sac-fld"><label htmlFor="sac-pw">Password</label><input id="sac-pw" className="sf-input" type="password" autoComplete="current-password" value={pw} onChange={(e) => { setPw(e.target.value); setErr(''); }} /></div>
            {err ? <p className="sac-err" role="alert">{err}</p> : null}
            <button type="submit" className="sf-btn sf-btn--fill">Sign in</button>
            {s.code ? <button type="button" className="sf-link" style={{ alignSelf: 'flex-start' }} onClick={() => setHow('code')}>Forgot it? Sign in with your mobile number</button> : null}
          </form>
        )}
        <p className="sac-demo">Demo: sign in as {DEMO_SHOPPER.name} with <b>{prettyMobile(DEMO_SHOPPER.phone)}</b> and code <b>{DEMO_CODE}</b>, or use any mobile number to make a new account.</p>
        {s.mode !== 'required' ? <p className="sac-sm" style={{ margin: 0 }}>No account needed to shop: <a className="sf-link" href={'/track' + q}>track an order</a> with its number and your mobile number.</p> : null}
      </section>
    </div>
  );
}

// ---- the tabs ------------------------------------------------------------------------------------------------------
function Orders({ acc, orders, q }) {
  const [inv, setInv] = useState(null);
  const ref = useRef(null);
  useEffect(() => { if (inv && ref.current) { printNode(ref.current, { title: 'Invoice ' + inv.id }); setInv(null); } }, [inv]);
  const again = (o) => {
    const r = buyAgainSkus(o);
    if (!r.lines.length) { toast('These items are not sold any more.', { tone: 'error' }); return; }
    r.lines.forEach((l) => addToCart(l.sku, l.qty));
    openSideCart();
    if (r.missing.length) toast(`Not sold any more: ${r.missing.join(', ')}`, { tone: 'info' });
  };
  let id = {};
  try { id = invoiceIdentity(); } catch { id = {}; }
  return (
    <section className="sac-card" aria-labelledby="sac-orders">
      <h2 id="sac-orders">Orders</h2>
      {!orders.length ? <p className="sac-sm" style={{ margin: 0 }}>No orders yet. <a className="sf-link" href={'/store' + q}>Start shopping</a></p> : (
        <ul className="sac-list">
          {orders.map((o) => (
            <li key={o.id}>
              <span className="sac-grow">
                <b><span style={{ fontFamily: 'var(--font-data)' }}>{o.id}</span> · {bdt(o.amount)}</b>
                <small>{formatDate(o.at)} · {o.lines.map((l) => `${l.name}${l.qty > 1 ? ' × ' + l.qty : ''}`).join(', ')}</small>
              </span>
              <span className={'sac-tag ' + (TONE[o.statusKey] || '')}>{NOW[o.statusKey] || o.status}</span>
              <span className="sac-acts">
                <a className="sf-btn sf-btn--sm sf-btn--line" href={'/track?id=' + encodeURIComponent(o.id) + (q ? '&preview=1' : '')}>{o.statusKey === 'delivered' ? 'Details' : 'Track'}</a>
                <button type="button" className="sf-btn sf-btn--sm sf-btn--line" onClick={() => again(o)}>Buy again</button>
                <button type="button" className="sf-btn sf-btn--sm sf-btn--line" onClick={() => setInv(o)} aria-label={'Invoice for ' + o.id}><Icon name="printer" width="14" height="14" aria-hidden="true" />Invoice</button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <div hidden>
        {inv ? (
          <div ref={ref} className="sac-inv">
            <h2 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>{id.tradingName || id.name || 'Invoice'}</h2>
            <div>{id.address}{id.phone ? ' · ' + id.phone : ''}{id.bin ? ' · BIN ' + id.bin : ''}</div>
            <p style={{ margin: '14px 0 0' }}><b>Invoice {inv.id}</b> · {formatDate(inv.at)}<br />{inv.customer} · {inv.phone}<br />{inv.address}</p>
            <table data-keep="">
              <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead>
              <tbody>
                {inv.lines.map((l, i) => <tr key={i}><td>{l.name}</td><td>{l.qty}</td><td>{bdt(l.price)}</td><td>{bdt((Number(l.price) || 0) * l.qty)}</td></tr>)}
                {Number(inv.shipping) > 0 ? <tr><td colSpan={3}>Delivery</td><td>{bdt(inv.shipping)}</td></tr> : null}
                {Number(inv.discount) > 0 ? <tr><td colSpan={3}>Discount</td><td>−{bdt(inv.discount)}</td></tr> : null}
                <tr><th colSpan={3}>Total</th><th>{bdt(inv.amount)}</th></tr>
              </tbody>
            </table>
            <div>Payment: {inv.payment}{Number(inv.paid) > 0 ? ' · paid ' + bdt(inv.paid) : ''}</div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Returns({ orders, q }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const on = () => setTick((t) => t + 1); window.addEventListener(RETURN_REQUESTS_EVENT, on); return () => window.removeEventListener(RETURN_REQUESTS_EVENT, on); }, []);
  const ids = new Set(orders.map((o) => o.id));
  const reqs = useMemo(() => returnRequests().filter((r) => ids.has(r.order)), [orders, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const open = orders.filter((o) => canRequestReturn(o).ok && !reqs.some((r) => r.order === o.id));
  const link = (id) => '/track?id=' + encodeURIComponent(id) + (q ? '&preview=1' : '');
  return (<>
    <section className="sac-card" aria-labelledby="sac-ret">
      <h2 id="sac-ret">Your returns</h2>
      {!reqs.length ? <p className="sac-sm" style={{ margin: 0 }}>No returns asked for.</p> : (
        <ul className="sac-list">
          {reqs.map((r) => (
            <li key={r.id}>
              <span className="sac-grow"><b>{r.id} · order {r.order}</b><small>{formatDate(r.at)} · {r.lines.map((l) => `${l.name} × ${l.qty}`).join(', ')}{r.rejectReason ? ' · ' + r.rejectReason : ''}{r.pickup ? ` · pickup ${r.pickup.courier} ${r.pickup.id}` : ''}</small></span>
              <span className={'sac-tag ' + (r.stage === 'refunded' || r.stage === 'exchanged' ? 'ok' : r.stage === 'rejected' ? 'off' : 'go')}>{RR_LABEL[r.stage]}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
    <section className="sac-card" aria-labelledby="sac-ask">
      <h2 id="sac-ask">Ask for a return</h2>
      {!open.length ? <p className="sac-sm" style={{ margin: 0 }}>No delivered orders can be returned now. Returns open for a few days after delivery.</p> : (
        <ul className="sac-list">
          {open.map((o) => (
            <li key={o.id}>
              <span className="sac-grow"><b>{o.id}</b><small>Delivered · open until {formatDate(canRequestReturn(o).until)} · {o.lines.map((l) => l.name).join(', ')}</small></span>
              <a className="sf-btn sf-btn--sm sf-btn--line" href={link(o.id)}>Request a return</a>
            </li>
          ))}
        </ul>
      )}
    </section>
  </>);
}

const BLANK = { id: '', label: 'Home', name: '', phone: '', district: '', thana: '', line: '', main: false };
function Addresses({ acc }) {
  const [edit, setEdit] = useState(null);
  const [err, setErr] = useState('');
  const list = acc.addresses || [];
  const save = (e) => { e.preventDefault(); const r = saveAddress(acc.phone, edit); if (!r.ok) { setErr(r.error); return; } setEdit(null); setErr(''); toast('Address saved'); };
  return (
    <section className="sac-card" aria-labelledby="sac-addr">
      <div className="sac-hi"><h2 id="sac-addr">Addresses</h2>{!edit ? <button type="button" className="sf-btn sf-btn--sm sf-btn--line" onClick={() => setEdit({ ...BLANK, name: acc.name, phone: acc.phone, main: !list.length })}><Icon name="plus" width="14" height="14" aria-hidden="true" />Add address</button> : null}</div>
      {edit ? (
        <form className="sac-main" onSubmit={save} noValidate>
          <div className="sac-2">
            <div className="sac-fld"><label htmlFor="ad-label">Name it</label><input id="ad-label" className="sf-input" value={edit.label} onChange={(e) => setEdit({ ...edit, label: e.target.value })} placeholder="Home, Office…" /></div>
            <div className="sac-fld"><label htmlFor="ad-name">Deliver to</label><input id="ad-name" className="sf-input" autoComplete="name" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
          </div>
          <div className="sac-fld"><label htmlFor="ad-phone">Mobile number</label><input id="ad-phone" className="sf-input" inputMode="tel" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></div>
          <AreaPicker idPrefix="ad" district={edit.district} area={edit.thana} selectClass="sf-input" labelClass="sac-lbl" required onChange={({ district, area }) => setEdit({ ...edit, district, thana: area })} gap="12px" />
          <div className="sac-fld"><label htmlFor="ad-line">House and road</label><input id="ad-line" className="sf-input" autoComplete="street-address" value={edit.line} onChange={(e) => setEdit({ ...edit, line: e.target.value })} placeholder="House 14, Road 7, Sector 4" /></div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 36 }}><input type="checkbox" checked={!!edit.main} onChange={(e) => setEdit({ ...edit, main: e.target.checked })} />Use this address first</label>
          {err ? <p className="sac-err" role="alert">{err}</p> : null}
          <div className="sac-acts"><button type="submit" className="sf-btn sf-btn--fill sf-btn--sm">Save address</button><button type="button" className="sf-btn sf-btn--line sf-btn--sm" onClick={() => { setEdit(null); setErr(''); }}>Cancel</button></div>
        </form>
      ) : !list.length ? <p className="sac-sm" style={{ margin: 0 }}>No addresses yet. Checkout fills in the one you pick.</p> : (
        <ul className="sac-list">
          {list.map((a) => (
            <li key={a.id}>
              <span className="sac-grow"><b>{a.label}{a.main ? <span className="sac-tag" style={{ marginLeft: 8 }}>First</span> : null}</b><small>{a.name} · {prettyMobile(a.phone)}<br />{a.line}, {a.thana}, {a.district}</small></span>
              <span className="sac-acts">
                <button type="button" className="sf-btn sf-btn--sm sf-btn--line" onClick={() => setEdit({ ...a })}>Edit</button>
                <button type="button" className="sf-btn sf-btn--sm sf-btn--line" onClick={() => { removeAddress(acc.phone, a.id); toast('Address removed'); }} aria-label={'Remove ' + a.label}>Remove</button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Rewards({ acc }) {
  const m = findMember(acc.phone);
  const ls = getLoyaltySettings();
  const credit = m ? creditHistory(acc.phone).slice(0, 6) : [];
  const next = m ? [...ls.tiers].sort((a, b) => a.min - b.min).find((t) => t.min > m.bought) : null;
  return (<>
    <section className="sac-card" aria-labelledby="sac-pts">
      <h2 id="sac-pts">Points</h2>
      {!m ? <p className="sac-sm" style={{ margin: 0 }}>You earn points with every order. They show here after your first one.</p> : (<>
        <div className="sac-figs" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
          <a href="#sac-pts"><b>{m.points.toLocaleString('en-IN')}</b><span>points · worth {bdt(m.value)}</span></a>
          <a href="#sac-pts"><b>{m.tierObj.name}</b><span>your level</span></a>
          <a href="#sac-cr"><b>{bdt(m.wallet)}</b><span>store credit</span></a>
        </div>
        {next ? (<>
          <div className="sac-bar" role="progressbar" aria-label={'Progress to ' + next.name} aria-valuemin={0} aria-valuemax={next.min} aria-valuenow={Math.round(m.bought)}><i style={{ width: Math.min(100, (m.bought / next.min) * 100) + '%' }} /></div>
          <p className="sac-sm" style={{ margin: 0 }}>Spend {bdt(next.min - m.bought)} more to reach {next.name}{next.pct ? ` (${next.pct}% off every order)` : ''}.</p>
        </>) : null}
        {m.expiring ? <p className="sac-sm" style={{ margin: 0 }}>{m.expiring} points end within a month: use them on your next order.</p> : null}
        {m.code ? <p className="sac-sm" style={{ margin: 0 }}>Your invite code: <span className="sac-code">{m.code}</span> Friends get points on their first order, and so do you.</p> : null}
      </>)}
    </section>
    <section className="sac-card" aria-labelledby="sac-cr">
      <h2 id="sac-cr">Store credit</h2>
      {!credit.length ? <p className="sac-sm" style={{ margin: 0 }}>No store credit. A return kept as credit or a reward lands here; it is used at checkout.</p> : (
        <ul className="sac-list">{credit.map((c) => <li key={c.id}><span className="sac-grow"><b>{c.label}</b><small>{formatDate(c.at)}{c.what ? ' · ' + c.what : ''}</small></span><b style={{ fontVariantNumeric: 'tabular-nums' }}>{c.amount > 0 ? '+' : '−'}{bdt(Math.abs(c.amount))}</b></li>)}</ul>
      )}
    </section>
  </>);
}

function Coupons({ q }) {
  const list = websiteOffers().filter((o) => o.kind === 'code' && o.state === 'live' && o.code);
  const copy = async (c) => { try { await navigator.clipboard.writeText(c); toast(`${c} copied. Paste it at checkout.`); } catch { toast(`Use ${c} at checkout.`); } };
  return (
    <section className="sac-card" aria-labelledby="sac-cp">
      <h2 id="sac-cp">Coupons</h2>
      {!list.length ? <p className="sac-sm" style={{ margin: 0 }}>No coupons right now. <a className="sf-link" href={'/offers' + q}>See all offers</a></p> : (
        <ul className="sac-list">
          {list.map((o) => (
            <li key={o.id}>
              <span className="sac-grow"><b>{o.title}</b><small>{o.blurb}{o.end ? ' · until ' + formatDate(o.end) : ''}</small></span>
              <span className="sac-code">{o.code}</span>
              <button type="button" className="sf-btn sf-btn--sm sf-btn--line" onClick={() => copy(o.code)}>Copy</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Warranty({ acc }) {
  const [tick, setTick] = useState(0);
  const [ask, setAsk] = useState(null);
  const [problem, setProblem] = useState('');
  useEffect(() => { const on = () => setTick((t) => t + 1); window.addEventListener(CLAIMS_EVENT, on); return () => window.removeEventListener(CLAIMS_EVENT, on); }, []);
  const items = useMemo(() => warrantyItems(acc.phone), [acc.phone, tick]);
  const claims = useMemo(() => getClaims().filter((c) => items.some((i) => i.order === c.order && i.name === c.item)), [items, tick]);
  const openFor = (it) => claims.find((c) => c.order === it.order && c.item === it.name && !['returned', 'rejected'].includes(stepOf(c)));
  const send = (e) => {
    e.preventDefault();
    if (problem.trim().length < 5) { toast('Tell us what is wrong in a few words.', { tone: 'error' }); return; }
    const c = requestService(ask, { problem, phone: acc.phone, name: acc.name, by: 'Customer' });
    setAsk(null); setProblem(''); setTick((t) => t + 1);
    toast(`Request ${c.id} sent. We will call you about bringing it in.`);
  };
  return (
    <section className="sac-card" aria-labelledby="sac-w">
      <h2 id="sac-w">Warranty</h2>
      {!items.length ? <p className="sac-sm" style={{ margin: 0 }}>Items with a warranty show here after delivery.</p> : (
        <ul className="sac-list">
          {items.map((it) => {
            const c = openFor(it);
            return (
              <li key={it.key}>
                <span className="sac-grow"><b>{it.name}</b><small>Order {it.order} · {it.label}{it.serials && it.serials.length ? ' · IMEI / serial ' + it.serials.join(', ') : ''}</small>
                  {it.state !== 'expired' ? <span className="sac-bar" style={{ marginTop: 6 }} aria-hidden="true"><i style={{ width: Math.max(2, Math.min(100, (it.days / Math.max(1, it.total)) * 100)) + '%' }} /></span> : null}
                </span>
                <span className={'sac-tag ' + (it.state === 'expired' ? 'off' : it.state === 'ending' ? 'warn' : 'ok')}>{it.state === 'expired' ? 'Ended ' + formatDate(it.until) : `${it.days} days left`}</span>
                {c ? <span className="sac-tag go">{c.id} · {CLAIM_LABEL[stepOf(c)] || stepOf(c)}</span>
                  : it.state !== 'expired' ? <button type="button" className="sf-btn sf-btn--sm sf-btn--line" onClick={() => { setAsk(it); setProblem(''); }}>Make a claim</button> : null}
                {ask && ask.key === it.key ? (
                  <form onSubmit={send} className="sac-main" style={{ flexBasis: '100%' }} noValidate>
                    <div className="sac-fld"><label htmlFor="sac-prob">What is wrong?</label><input id="sac-prob" className="sf-input" value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="e.g. The battery drains in 4 hours" autoFocus /></div>
                    <div className="sac-acts"><button type="submit" className="sf-btn sf-btn--sm sf-btn--fill">Send claim</button><button type="button" className="sf-btn sf-btn--sm sf-btn--line" onClick={() => setAsk(null)}>Cancel</button></div>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// Wishlist inside My account (Batch C step 1): the saved products as a compact grid, each with remove and add to cart.
// /wishlist stays for shared links (?ids=) and for guests.
function WishlistTab({ wish, q }) {
  const [all, setAll] = useState(null);
  useEffect(() => { refreshCatalog(); setAll(storeProducts()); }, []);
  const list = useMemo(() => (all ? wish.map((id) => all.find((p) => p.id === id)).filter(Boolean) : null), [all, wish]);
  const add = (p) => {
    const sku = skuForProduct(p.id);
    if (!sku || (p.stock <= 0 && !p.oversell)) { toast(p.name + ' can’t be bought right now.', { tone: 'error' }); return; }
    addToCart(sku, 1); openSideCart();
  };
  const addAll = () => {
    let n = 0;
    (list || []).forEach((p) => { if (p.stock > 0 || p.oversell) { const sku = skuForProduct(p.id); if (sku) { addToCart(sku, 1); n += 1; } } });
    if (n) openSideCart(); else toast('None of these can be bought right now.', { tone: 'error' });
  };
  const share = async () => {
    const url = window.location.origin + wishlistLink(wish);
    try {
      if (navigator.share) { await navigator.share({ title: 'My wishlist', url }); return; }
      await navigator.clipboard.writeText(url);
      toast('Link copied. Anyone with it can see these products.');
    } catch { toast('Copy this link: ' + url); }
  };
  const remove = (p) => { toggleWishlist(p.id); toast(p.name + ' removed from your wishlist'); };
  return (
    <section className="sac-card" aria-labelledby="sac-wl">
      <div className="sac-hi">
        <h2 id="sac-wl">Wishlist{list && list.length ? ' · ' + list.length : ''}</h2>
        {list && list.length ? (
          <span className="sac-acts">
            <button type="button" className="sf-btn sf-btn--sm sf-btn--line" onClick={share}><Icon name="share-2" width="16" height="16" aria-hidden="true" />Share</button>
            <button type="button" className="sf-btn sf-btn--sm sf-btn--fill" onClick={addAll}><Icon name="shopping-bag" width="16" height="16" aria-hidden="true" />Add all to cart</button>
          </span>
        ) : null}
      </div>
      {!list ? <div style={{ minHeight: 160 }} aria-busy="true" /> : !list.length ? (
        <p className="sac-sm" style={{ margin: 0 }}>Nothing saved yet. Tap the heart on a product to keep it here. <a className="sf-link" href={'/store' + q}>Keep shopping</a></p>
      ) : (
        <ul className="sac-wl">
          {list.map((p) => {
            const out = p.stock <= 0 && !p.oversell;
            return (
              <li key={p.id}>
                <span className="sac-wl-img" style={{ background: p.tbg }}>
                  <a href={p.href} aria-label={p.name} tabIndex={-1}>{p.img ? <img src={p.img} alt="" loading="lazy" /> : <span aria-hidden="true">{p.name.slice(0, 1)}</span>}</a>
                  <button type="button" className="sac-wl-x" aria-label={'Remove ' + p.name + ' from the wishlist'} onClick={() => remove(p)}><Icon name="x" width="16" height="16" aria-hidden="true" /></button>
                </span>
                <span className="sac-wl-b">
                  <a href={p.href}>{p.name}</a>
                  <span className="sac-wl-p"><b>{bdt(p.price)}</b>{p.mrp > p.price ? <s>{bdt(p.mrp)}</s> : null}</span>
                  <small className="sac-sm">{p.stock > 0 ? (p.stock < 6 ? `Only ${p.stock} left` : 'In stock') : p.oversell ? 'Pre-order' : 'Out of stock'}</small>
                  <button type="button" className="sf-btn sf-btn--sm sf-btn--line" disabled={out} onClick={() => add(p)}><Icon name="plus" width="16" height="16" aria-hidden="true" />{out ? 'Sold out' : 'Add to cart'}</button>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// Request withdrawal (Batch C step 6): within the shop's rules (Marketing › Affiliates › Settings); the shop approves it
// and pays it from Finances › Liabilities. Shows the requests and their answers.
function Withdraw({ a }) {
  const r = withdrawRules(a);
  const mine = withdrawalsOf(a.id);
  const [open, setOpen] = useState(false);
  const top = r.max ? Math.min(r.available, r.max) : r.available;
  const [f, setF] = useState(() => ({ amount: String(Math.floor(top)), method: r.methods.includes((a.payout || {}).method) ? a.payout.method : r.methods[0], number: (a.payout || {}).number || '' }));
  const [err, setErr] = useState('');
  const plan = requestPlan(a, Number(f.amount) || 0);
  const send = (e) => {
    e.preventDefault();
    const res = requestWithdrawal(a.id, { amount: Number(f.amount) || 0, method: f.method, number: f.number });
    if (!res.ok) { setErr(res.error); return; }
    setErr(''); setOpen(false);
    toast(res.request.status === 'approved' ? `${res.request.id} approved: ${bdt(res.request.amount)} is on its way.` : `${res.request.id} sent. The shop will check it.`);
  };
  const how = [r.min ? `from ${bdt(r.min)}` : '', r.max ? `up to ${bdt(r.max)} a time` : '', r.every ? (r.every === 1 ? 'once a day' : r.every === 7 ? 'once a week' : r.every === 30 ? 'once a month' : `every ${r.every} days`) : '', r.approval === 'auto' ? 'approved at once' : 'checked by the shop'].filter(Boolean).join(' · ');
  const TONE = { pending: 'warn', approved: 'ok', rejected: 'off' };
  return (
    <section className="sac-card" aria-labelledby="sac-afw">
      <div className="sac-hi">
        <h2 id="sac-afw">Withdraw</h2>
        {!open ? <button type="button" className="sf-btn sf-btn--sm sf-btn--fill" disabled={!r.open} onClick={() => { setOpen(true); setErr(''); setF((x) => ({ ...x, amount: String(Math.floor(top)) })); }}><Icon name="hand-coins" width="16" height="16" aria-hidden="true" />Request withdrawal</button> : null}
      </div>
      <p className="sac-sm" style={{ margin: 0 }}><b>{bdt(r.available)}</b> payable now · {how}.{!r.open && r.why ? ' ' + r.why : ''}</p>
      {open ? (
        <form className="sac-main" onSubmit={send} noValidate>
          <div className="sac-2">
            <div className="sac-fld"><label htmlFor="wd-amt">Amount (৳)</label><input id="wd-amt" className="sf-input" inputMode="numeric" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value.replace(/[^\d.]/g, '') })} /></div>
            <div className="sac-fld"><label htmlFor="wd-m">Pay me by</label><select id="wd-m" className="sf-input" value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })}>{PAYOUT_METHODS.filter(([k]) => r.methods.includes(k)).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          </div>
          <div className="sac-fld"><label htmlFor="wd-n">{f.method === 'bank' ? 'Bank and account number' : f.method === 'nagad' ? 'Nagad number' : 'bKash number'}</label><input id="wd-n" className="sf-input" inputMode={f.method === 'bank' ? 'text' : 'tel'} value={f.number} onChange={(e) => setF({ ...f, number: e.target.value })} /></div>
          {plan.orders.length && plan.amount !== (Number(f.amount) || 0) ? <p className="sac-sm" style={{ margin: 0 }}>We pay whole orders: this request will be {bdt(plan.amount)} for {plan.orders.length} order{plan.orders.length === 1 ? '' : 's'}.</p> : null}
          {err ? <p className="sac-err" role="alert">{err}</p> : null}
          <span className="sac-acts"><button type="submit" className="sf-btn sf-btn--sm sf-btn--fill">Send request</button><button type="button" className="sf-btn sf-btn--sm sf-btn--line" onClick={() => setOpen(false)}>Cancel</button></span>
        </form>
      ) : null}
      {mine.length ? (
        <ul className="sac-list">
          {mine.map((w) => (
            <li key={w.id}>
              <span className="sac-grow"><b>{w.id} · {bdt(w.amount)}</b><small>{formatDate(w.at)} · {(PAYOUT_METHODS.find(([k]) => k === w.method) || [0, w.method])[1]} {w.number}{w.status === 'rejected' && w.reason ? ' · ' + w.reason : ''}</small></span>
              <span className={'sac-tag ' + TONE[w.status]}>{w.status === 'pending' ? 'Being checked' : WD_LABEL[w.status]}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

// the affiliate dashboard (Marketing › Affiliates, lib/affiliates.js): link, code, QR, results, orders, payouts, payout method
function AffiliateTab({ acc, q }) {
  const [tick, setTick] = useState(0);
  const [origin, setOrigin] = useState('');
  useEffect(() => { setOrigin(window.location.origin); const on = () => setTick((t) => t + 1); window.addEventListener(AFF_EVENT, on); window.addEventListener('gc:ledger', on); return () => { window.removeEventListener(AFF_EVENT, on); window.removeEventListener('gc:ledger', on); }; }, []);
  const a = useMemo(() => affiliateOfPhone(acc.phone), [acc.phone, tick]);
  const [pm, setPm] = useState(null);
  useEffect(() => { if (a) setPm({ method: (a.payout || {}).method || 'bkash', number: (a.payout || {}).number || '' }); }, [a]);
  const join = '/affiliate-program' + q;
  if (!a) {
    const app = getApplications().find((x) => x.phone === acc.phone);
    return (
      <section className="sac-card" aria-labelledby="sac-af">
        <h2 id="sac-af">Affiliate</h2>
        {app && app.status === 'pending' ? <p className="sac-sm" style={{ margin: 0 }}>Your application ({app.name}) is with us. We will message you once it is checked.</p>
          : app && app.status === 'rejected' ? <p className="sac-sm" style={{ margin: 0 }}>Your application was not accepted{app.reason ? ': ' + app.reason : ''}.</p>
          : (<><p className="sac-sm" style={{ margin: 0 }}>Share our products and earn a commission on every order through your link.</p><a className="sf-btn sf-btn--fill sf-btn--sm" style={{ alignSelf: 'flex-start' }} href={join}>Become an affiliate</a></>)}
      </section>
    );
  }
  const s = affSettings();
  const comm = commissionsOf(a.id);
  const st = statsOf(a, comm);
  const pays = payoutsOf(a);
  const link = affLink(a, origin);
  const copy = async (t, what) => { try { await navigator.clipboard.writeText(t); toast(what + ' copied'); } catch { toast(t); } };
  const savePm = (e) => { e.preventDefault(); if (!pm.number.trim()) { toast('Add the number or account to pay.', { tone: 'error' }); return; } updateAffiliate(a.id, { payout: { method: pm.method, number: pm.number.trim() } }); toast('Payout details saved'); };
  const STATE = { pending: '', approved: 'ok', requested: 'warn', owed: 'go', paid: 'off', cancelled: 'off' };
  return (<>
    <section className="sac-card" aria-labelledby="sac-af">
      <div className="sac-hi"><h2 id="sac-af">Affiliate · {a.name}</h2>{a.status !== 'active' ? <span className="sac-tag warn">Paused by the shop</span> : null}</div>
      <div className="sac-fld"><span className="sac-lbl">Your link</span><span style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}><code className="sac-code" style={{ overflowWrap: 'anywhere', flex: '1 1 220px' }}>{link}</code><button type="button" className="sf-btn sf-btn--sm sf-btn--line" onClick={() => copy(link, 'Link')}>Copy link</button></span></div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <QrCode text={link} size={96} label="QR code for your link" />
        <span className="sac-sm">Shoppers can also type your code at checkout: <span className="sac-code">{a.code}</span> <button type="button" className="sf-link" onClick={() => copy(a.code, 'Code')}>Copy</button><br />An order within {s.linkDays} days of a click counts. Your own orders don’t.</span>
      </div>
      <div className="sac-figs">
        <a href="#sac-afo"><b>{st.clicks.toLocaleString('en-IN')}</b><span>clicks</span></a>
        <a href="#sac-afo"><b>{st.orders}</b><span>orders</span></a>
        <a href="#sac-afo"><b>{bdt(st.pending)}</b><span>pending</span></a>
        <a href="#sac-afw"><b>{bdt(st.approved + (st.requested || 0) + st.owed)}</b><span>to be paid</span></a>
      </div>
      <p className="sac-sm" style={{ margin: 0 }}>Commission is {s.type === 'fixed' ? bdt(a.fixed != null ? a.fixed : s.fixed) + ' per order' : (a.rate != null ? a.rate : s.rate) + '% of each sale'}. It becomes payable {s.returnDays} days after delivery; we pay from {bdt(s.minPayout)} up. Paid so far: {bdt(st.paid)}.</p>
    </section>
    {affSettings().wdOn ? <Withdraw key={tick} a={a} /> : null}
    <section className="sac-card" aria-labelledby="sac-afo">
      <h2 id="sac-afo">Orders through you</h2>
      {!comm.length ? <p className="sac-sm" style={{ margin: 0 }}>None yet. Share your link to start.</p> : (
        <ul className="sac-list">
          {comm.map((c) => (
            <li key={c.order}>
              <span className="sac-grow"><b>{c.order} · {bdt(c.amount)}</b><small>{formatDate(c.at)} · sale {bdt(c.base)} · {c.via === 'code' ? 'your code' : 'your link'}</small></span>
              <span className={'sac-tag ' + (STATE[c.state] || '')}>{c.state === 'approved' ? 'Payable' : c.label}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
    <section className="sac-card" aria-labelledby="sac-afp">
      <h2 id="sac-afp">Payouts</h2>
      {pays.length ? <ul className="sac-list">{pays.map((p) => <li key={p.liab}><span className="sac-grow"><b>{p.title}</b><small>Due {formatDate(p.due)}</small></span><b>{bdt(p.amount)}</b><span className={'sac-tag ' + (p.paid >= p.amount ? 'ok' : 'go')}>{p.paid >= p.amount ? 'Paid' : p.paid > 0 ? 'Partly paid' : 'On the way'}</span></li>)}</ul> : <p className="sac-sm" style={{ margin: 0 }}>No payouts yet.</p>}
      {pm ? (
        <form className="sac-main" onSubmit={savePm} noValidate>
          <div className="sac-2">
            <div className="sac-fld"><label htmlFor="af-pm">Pay me by</label><select id="af-pm" className="sf-input" value={pm.method} onChange={(e) => setPm({ ...pm, method: e.target.value })}>{PAYOUT_METHODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
            <div className="sac-fld"><label htmlFor="af-pn">{pm.method === 'bank' ? 'Bank and account number' : pm.method === 'nagad' ? 'Nagad number' : 'bKash number'}</label><input id="af-pn" className="sf-input" value={pm.number} onChange={(e) => setPm({ ...pm, number: e.target.value })} /></div>
          </div>
          <button type="submit" className="sf-btn sf-btn--sm sf-btn--line" style={{ alignSelf: 'flex-start' }}>Save payout details</button>
        </form>
      ) : null}
    </section>
  </>);
}

function Profile({ acc, s }) {
  const [d, setD] = useState({ name: acc.name, email: acc.email });
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState(() => messageChoices(acc.phone));
  const [err, setErr] = useState('');
  const save = (e) => { e.preventDefault(); const r = updateAccount(acc.phone, d); if (!r.ok) { setErr(r.error); return; } setErr(''); toast('Details saved'); };
  const savePw = (e) => { e.preventDefault(); const r = setPassword(acc.phone, d.email, pw); if (!r.ok) { setErr(r.error); return; } setErr(''); setPw(''); toast('Password set. You can sign in with your email too.'); };
  return (<>
    <section className="sac-card" aria-labelledby="sac-p">
      <h2 id="sac-p">Your details</h2>
      <AvatarField acc={acc} />
      <form className="sac-main" onSubmit={save} noValidate>
        <div className="sac-2">
          <div className="sac-fld"><label htmlFor="pr-name">Name</label><input id="pr-name" className="sf-input" autoComplete="name" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} /></div>
          <div className="sac-fld"><label htmlFor="pr-email">Email (optional)</label><input id="pr-email" className="sf-input" type="email" autoComplete="email" value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} /></div>
        </div>
        <p className="sac-sm" style={{ margin: 0 }}>Mobile number: <b>{prettyMobile(acc.phone)}</b> (you sign in with it)</p>
        {err ? <p className="sac-err" role="alert">{err}</p> : null}
        <button type="submit" className="sf-btn sf-btn--sm sf-btn--fill" style={{ alignSelf: 'flex-start' }}>Save details</button>
      </form>
      {s.password ? (
        <form className="sac-main" onSubmit={savePw} noValidate>
          <div className="sac-fld"><label htmlFor="pr-pw">{acc.pw ? 'New password' : 'Set a password'} (to sign in with your email)</label><input id="pr-pw" className="sf-input" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" /></div>
          <button type="submit" className="sf-btn sf-btn--sm sf-btn--line" style={{ alignSelf: 'flex-start' }}>Save password</button>
        </form>
      ) : null}
    </section>
    <section className="sac-card" aria-labelledby="sac-m">
      <h2 id="sac-m">Offers and news</h2>
      <div>
        {MESSAGE_CHANNELS.map(([k, l]) => (
          <label key={k} className="sac-sw"><span>Send me offers by {l}</span><input type="checkbox" checked={!!msg[k]} onChange={(e) => { setMessageChoice(acc.phone, k, e.target.checked); setMsg({ ...msg, [k]: e.target.checked }); toast(e.target.checked ? `Offers by ${l} on` : `No more offers by ${l}`); }} /></label>
        ))}
      </div>
      <p className="sac-sm" style={{ margin: 0 }}>Order updates and codes always come, whatever you pick here.</p>
    </section>
  </>);
}

export default function StoreAccount() {
  const acc = useAccount();
  const [tab, setTab] = useState('orders');
  const [s, setS] = useState(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('tab');
    if (t && ACCOUNT_TABS.some(([k]) => k === t)) setTab(t);
    setS(accountSettings());
    const on = () => setTick((x) => x + 1);
    window.addEventListener(ACCOUNT_EVENT, on);
    return () => window.removeEventListener(ACCOUNT_EVENT, on);
  }, []);
  // after signing in from the wishlist ("Sign in to keep it everywhere"), go back there
  useEffect(() => {
    if (!acc.account) return;
    const next = new URLSearchParams(window.location.search).get('next');
    if (next === 'wishlist') { setTab('wishlist'); const u = new URL(window.location.href); u.searchParams.delete('next'); u.searchParams.set('tab', 'wishlist'); window.history.replaceState(null, '', u); }
  }, [acc.account]);
  const me = acc.account;
  const orders = useMemo(() => (me ? ordersOf(me.phone) : []), [me, tick]);

  // on phones the tab list is a sideways strip: keep the open tab in view
  useEffect(() => { const a = document.querySelector('.sac-nav a[aria-current="page"]'); if (a && a.parentElement.scrollWidth > a.parentElement.clientWidth) a.parentElement.scrollLeft = a.offsetLeft - 8; }, [tab, acc.account, s]);
  const go = (k) => (e) => { e.preventDefault(); setTab(k); const u = new URL(window.location.href); u.searchParams.set('tab', k); window.history.replaceState(null, '', u); };
  return (
    <StoreChrome screen="StoreAccount" kind="page" head={HEAD} css={CSS + AVATAR_CSS}>
      {(shell) => {
        const q = shell.preview ? '?preview=1' : '';
        if (!acc.ready || !s) return <div className="sf-wrap" style={{ minHeight: 480 }} aria-busy="true" />;
        if (s.mode === 'off') {
          return <div className="sf-wrap"><Crumbs items={[{ name: 'My account' }]} /><div className="sac-sign"><section className="sac-card"><h1>No accounts here</h1><p className="sac-sm" style={{ margin: 0 }}>This shop takes orders without an account. <a className="sf-link" href={'/track' + q}>Track an order</a></p></section></div></div>;
        }
        if (!me) return <div className="sf-wrap"><Crumbs items={[{ name: 'Sign in' }]} /><SignIn s={s} q={q} /></div>;
        const m = findMember(me.phone);
        const open = orders.filter((o) => !['delivered', 'cancelled', 'returned'].includes(o.statusKey)).length;
        const href = (k) => (k === 'compare' ? '/compare' + q : '/account?tab=' + k + (q ? '&preview=1' : ''));
        return (
          <div className="sf-wrap">
            <Crumbs items={[{ name: 'My account' }]} />
            <div className="sac">
              <nav className="sac-nav" aria-label="My account">
                {ACCOUNT_TABS.map(([k, l, ic]) => (
                  <a key={k} href={href(k)} aria-current={tab === k ? 'page' : undefined} onClick={k === 'compare' ? undefined : go(k)}>
                    <Icon name={ic} width="16" height="16" aria-hidden="true" />{l}{k === 'wishlist' && acc.wish.length ? ` (${acc.wish.length})` : k === 'compare' && acc.compare.length ? ` (${acc.compare.length})` : ''}
                  </a>
                ))}
                <hr />
                <button type="button" onClick={() => { signOut(); toast('Signed out'); }}><Icon name="log-out" width="16" height="16" aria-hidden="true" />Sign out</button>
              </nav>
              <div className="sac-main">
                <section className="sac-card" aria-labelledby="sac-h">
                  <div className="sac-hi"><span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><a href={href('profile')} onClick={go('profile')} aria-label="Your picture and details"><Avatar acc={me} size={44} /></a><h1 id="sac-h">{me.name ? 'Hi, ' + me.name.split(' ')[0] : 'Hi there'}</h1></span><span className="sac-sm">{prettyMobile(me.phone)}{me.email ? ' · ' + me.email : ''}</span></div>
                  <div className="sac-figs">
                    <a href={href('orders')} onClick={go('orders')}><b>{orders.length}</b><span>orders{open ? ` · ${open} on the way` : ''}</span></a>
                    <a href={href('rewards')} onClick={go('rewards')}><b>{m ? m.points.toLocaleString('en-IN') : 0}</b><span>points</span></a>
                    <a href={href('rewards')} onClick={go('rewards')}><b>{bdt(m ? m.wallet : 0)}</b><span>store credit</span></a>
                    <a href={href('wishlist')} onClick={go('wishlist')}><b>{acc.wish.length}</b><span>in your wishlist</span></a>
                  </div>
                </section>
                {tab === 'orders' ? <Orders acc={me} orders={orders} q={q} /> : null}
                {tab === 'wishlist' ? <WishlistTab wish={acc.wish} q={q} /> : null}
                {tab === 'returns' ? <Returns orders={orders} q={q} /> : null}
                {tab === 'addresses' ? <Addresses acc={me} /> : null}
                {tab === 'rewards' ? <Rewards acc={me} /> : null}
                {tab === 'coupons' ? <Coupons q={q} /> : null}
                {tab === 'warranty' ? <Warranty acc={me} /> : null}
                {tab === 'affiliate' ? <AffiliateTab acc={me} q={q} /> : null}
                {tab === 'profile' ? <Profile key={me.phone} acc={me} s={s} /> : null}
              </div>
            </div>
          </div>
        );
      }}
    </StoreChrome>
  );
}
