'use client';
// My account (/account): a shopper signs in with their mobile number and a one-time code, then sees every order placed
// with that number (status in plain words, items, total, Track), their wishlist and their details from the last order.
// Demo: the code shows on the screen (the live store sends it by SMS, Settings › Notifications) and the signed-in number
// is kept in this browser (`gc.store.customer`). Orders come from lib/orders.js, the same list the shop works from.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { getOrders } from '@/lib/orders';
import { formatBDT, formatDate } from '@/lib/format';
import { useSaved } from '@/lib/storefront/saved';
import { StoreChrome, Crumbs } from './storeChrome';
import { NOW } from './TrackOrder';
import { SAVED_CSS } from './StoreSaved';
import { w } from '@/lib/storefront/words';

const KEY = 'gc.store.customer';
const digits = (t) => String(t || '').replace(/\D/g, '').replace(/^88(?=01)/, '');
const PHONE_RE = /^01[3-9]\d{8}$/;
const HEAD = { title: 'My account', description: '', robots: 'noindex, nofollow', canonical: '', og: {}, jsonld: [] };
const online = (o) => !/^(POS|Wholesale)/.test(String(o.channel || '')) && !o.isInvoice;

export default function StoreAccount() {
  const [me, setMe] = useState(null);
  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState('');
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('orders');
  const saved = useSaved();
  useEffect(() => {
    try { const x = JSON.parse(window.localStorage.getItem(KEY) || 'null'); if (x && x.phone) setMe(x); } catch { /* ignore */ }
    setReady(true);
  }, []);
  const orders = useMemo(() => {
    if (!me) return [];
    let all = [];
    try { all = getOrders(); } catch { all = []; }
    return all.filter((o) => digits(o.phone) === me.phone).sort((a, b) => (Number(b.at) || 0) - (Number(a.at) || 0));
  }, [me]);
  const demoPhone = () => { let all = []; try { all = getOrders().filter(online); } catch { all = []; } const o = all.find((x) => PHONE_RE.test(digits(x.phone))); if (o) { setPhone(digits(o.phone)); setErr(''); } };
  const send = (e) => {
    e.preventDefault();
    const d = digits(phone);
    if (!PHONE_RE.test(d)) { setErr('Write an 11-digit mobile number, like 01712345678.'); return; }
    setErr(''); setSent(String(1000 + Math.floor(Math.random() * 9000))); setCode('');
  };
  const check = (e) => {
    e.preventDefault();
    if (code.trim() !== sent) { setErr('That code is not right. Check the SMS and try again.'); return; }
    const x = { phone: digits(phone), at: Date.now() };
    try { window.localStorage.setItem(KEY, JSON.stringify(x)); } catch { /* ignore */ }
    setMe(x); setErr(''); setSent('');
  };
  const signOut = () => { try { window.localStorage.removeItem(KEY); } catch { /* ignore */ } setMe(null); setPhone(''); };
  const last = orders[0];
  return (
    <StoreChrome screen="StoreAccount" kind="account" head={HEAD} css={SAVED_CSS + ACCOUNT_CSS}>
      {() => (
        <div className="sf-wrap sac">
          <Crumbs items={[{ name: 'My account' }]} />
          {!ready ? <div style={{ minHeight: 320 }} aria-busy="true" /> : !me ? (
            <div className="sac-in">
              <h1 data-w="accountTitle">{w('accountTitle')}</h1>
              <p className="sac-lead" data-w="accountLead">{w('accountLead')}</p>
              {!sent ? (
                <form onSubmit={send} noValidate className="sac-form">
                  <label className="shi-field" htmlFor="sac-phone"><span>Mobile number</span><input id="sac-phone" className="sf-input" type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={err ? true : undefined} aria-describedby={err ? 'sac-err' : undefined} /></label>
                  {err ? <small id="sac-err" className="sac-err">{err}</small> : null}
                  <button type="submit" className="sf-btn">Send the code</button>
                  <button type="button" className="sf-link sac-demo" onClick={demoPhone}>Demo: use a customer who has orders</button>
                </form>
              ) : (
                <form onSubmit={check} noValidate className="sac-form">
                  <p className="sac-note"><Icon name="message-square-text" width="16" height="16" aria-hidden="true" />Demo: your code is <b>{sent}</b>. The live store sends it to {phone} by SMS.</p>
                  <label className="shi-field" htmlFor="sac-code"><span>Code</span><input id="sac-code" className="sf-input" inputMode="numeric" autoComplete="one-time-code" maxLength={4} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} aria-invalid={err ? true : undefined} aria-describedby={err ? 'sac-err' : undefined} /></label>
                  {err ? <small id="sac-err" className="sac-err">{err}</small> : null}
                  <button type="submit" className="sf-btn">Sign in</button>
                  <button type="button" className="sf-link" onClick={() => { setSent(''); setErr(''); }}>Use another number</button>
                </form>
              )}
            </div>
          ) : (
            <div className="sac-me">
              <header className="sac-top">
                <span className="sac-av" aria-hidden="true"><Icon name="user" width="22" height="22" /></span>
                <div><h1>{(last && last.customer) || 'My account'}</h1><p>{me.phone} · {orders.length} order{orders.length === 1 ? '' : 's'}</p></div>
                <button type="button" className="sf-btn sf-btn--line sf-btn--sm" onClick={signOut}>Sign out</button>
              </header>
              <div className="sac-tabs" role="tablist" aria-label="My account">
                {[['orders', 'Orders', orders.length], ['wish', 'Wishlist', saved.wish.length], ['details', 'My details', 0]].map(([k, l, n]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}{n ? <em>{n}</em> : null}</button>)}
              </div>
              {tab === 'orders' ? (
                orders.length ? (
                  <ul className="sac-orders">
                    {orders.map((o) => {
                      const now = NOW[o.statusKey] || [o.status, ''];
                      const items = (o.lines || []).reduce((a, l) => a + (Number(l.qty) || 0), 0);
                      return (
                        <li key={o.id}>
                          <div className="sac-o1"><b>{o.id}</b><small>{o.at ? formatDate(new Date(o.at)) : ''}</small><span className={'sac-st is-' + (o.statusKey || 'x')}>{now[0]}</span></div>
                          <p>{(o.lines || []).slice(0, 2).map((l) => l.name).join(', ')}{(o.lines || []).length > 2 ? ` and ${(o.lines || []).length - 2} more` : ''}</p>
                          <div className="sac-o2"><span>{items} item{items === 1 ? '' : 's'} · <b>{formatBDT(Math.round(Number(o.amount != null ? o.amount : o.total) || 0))}</b></span>{online(o) ? <a className="sf-btn sf-btn--sm sf-btn--line" href={'/track?id=' + encodeURIComponent(o.id)}><Icon name="map-pin" width="14" height="14" aria-hidden="true" />Track</a> : null}</div>
                        </li>
                      );
                    })}
                  </ul>
                ) : <div className="ssv-empty sac-empty"><Icon name="package" width="28" height="28" aria-hidden="true" /><p>No orders with this number yet.</p><a className="sf-btn" href="/store">Start shopping</a></div>
              ) : null}
              {tab === 'wish' ? <div className="sac-empty"><p>{saved.wish.length ? `${saved.wish.length} product${saved.wish.length === 1 ? '' : 's'} saved.` : 'Nothing saved yet.'}</p><a className="sf-btn" href="/wishlist">Open the wishlist</a></div> : null}
              {tab === 'details' ? (
                <dl className="sac-kv">
                  <dt>Name</dt><dd>{(last && last.customer) || '—'}</dd>
                  <dt>Mobile</dt><dd>{me.phone}</dd>
                  <dt>Last delivery address</dt><dd>{(last && last.address) || '—'}</dd>
                </dl>
              ) : null}
            </div>
          )}
        </div>
      )}
    </StoreChrome>
  );
}

export const ACCOUNT_CSS = `
.sac{padding-bottom:var(--sf-section)}
.sac-in{display:flex;flex-direction:column;gap:12px;max-width:440px;margin:clamp(12px,4vw,40px) auto 0;padding:clamp(20px,4vw,36px);border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.sac-in h1{margin:0!important;font-size:var(--sf-fs-h2)}
.sac-lead{margin:0;color:var(--sf-muted)}
.sac-form{display:flex;flex-direction:column;gap:12px}
.sac-form .shi-field{display:flex;flex-direction:column;gap:6px}
.sac-form .shi-field>span{font-size:var(--sf-fs-sm);font-weight:var(--weight-medium)}
.sac-form .sf-input{font-size:max(var(--text-base),var(--sf-fs))}
.sac-form>.sf-btn{width:100%}
.sac-demo{align-self:center;min-height:44px}
.sac-err{color:#b91c1c;font-size:var(--sf-fs-sm)}
.sac-note{display:flex;align-items:flex-start;gap:8px;margin:0;padding:10px 12px;border-radius:var(--sf-radius);background:var(--sf-soft);font-size:var(--sf-fs-sm)}
.sac-me{display:flex;flex-direction:column;gap:18px}
.sac-top{display:flex;flex-wrap:wrap;align-items:center;gap:14px}
.sac-top>div{flex:1;min-width:0}
.sac-top h1{margin:0!important;font-size:var(--sf-fs-h2)}
.sac-top p{margin:2px 0 0;color:var(--sf-muted)}
.sac-av{display:grid;place-items:center;width:52px;height:52px;border-radius:50%;background:var(--sf-soft);color:var(--sf-primary)}
.sac-tabs{display:flex;gap:6px;overflow-x:auto;border-bottom:1px solid var(--sf-line);scrollbar-width:none}
.sac-tabs button{display:inline-flex;align-items:center;gap:8px;flex:none;min-height:44px;padding:0 14px;border:0;border-bottom:2px solid transparent;background:none;color:var(--sf-muted);font:inherit;font-weight:var(--weight-medium);cursor:pointer}
.sac-tabs button[aria-selected="true"]{border-bottom-color:var(--sf-primary);color:var(--sf-text)}
.sac-tabs em{padding:0 7px;border-radius:var(--radius-full);background:var(--sf-soft);font-style:normal;font-size:var(--sf-fs-sm)}
.sac-orders{display:flex;flex-direction:column;gap:10px;margin:0;padding:0;list-style:none}
.sac-orders li{display:flex;flex-direction:column;gap:8px;padding:16px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.sac-orders p{margin:0;color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.sac-o1{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px}
.sac-o1 b{font-family:var(--sf-font-data,inherit)}
.sac-o1 small{color:var(--sf-muted)}
.sac-st{margin-left:auto;padding:2px 10px;border-radius:var(--radius-full);background:var(--sf-soft);font-size:var(--sf-fs-sm);font-weight:var(--weight-medium)}
.sac-st.is-delivered{background:color-mix(in srgb,#16a34a 12%,transparent);color:#15803d}
.sac-st.is-cancelled,.sac-st.is-returned{background:color-mix(in srgb,#dc2626 10%,transparent);color:#b91c1c}
.sac-o2{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px}
.sac-empty{display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.sac-empty.ssv-empty{align-items:center}
.sac-kv{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px 24px;margin:0;max-width:560px}
.sac-kv dt{color:var(--sf-muted)}
.sac-kv dd{margin:0}
`;
