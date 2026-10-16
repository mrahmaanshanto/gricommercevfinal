'use client';
// Become an affiliate — the store's sign-up page for the affiliate programme (/affiliate-program; Batch B step 3).
// What an affiliate earns (Marketing › Affiliates › Settings: commission, link days, minimum payout, return window),
// how it works, the form (name or page, mobile, email, where they share, audience, how) and the terms. With automatic
// approval the code comes at once; otherwise the shop reviews the application. Affiliates follow their results in
// My account › Affiliate (StoreAccount.jsx › AffiliateTab). Data: lib/affiliates.js.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { affSettings, applyAffiliate, affiliateOfPhone, getApplications } from '@/lib/affiliates';
import { currentAccount } from '@/lib/storefront/account';
import { StoreChrome, Crumbs } from './storeChrome';
import { bdt } from './storeKit';

const HEAD = { title: 'Become an affiliate', description: 'Share our products and earn a commission on every order through your link.', robots: 'index, follow', canonical: '', og: {}, jsonld: [] };
const CSS = `
.saf{display:flex;flex-direction:column;gap:var(--sf-gap);padding-bottom:var(--sf-section)}
.saf-hero{display:flex;flex-direction:column;gap:12px;padding:32px;border-radius:var(--sf-radius-card);background:var(--sf-soft)}
.saf-hero h1{font-size:var(--sf-fs-h1)}
.saf-hero p{margin:0;max-width:640px}
.saf-figs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:8px}
.saf-figs div{display:flex;flex-direction:column;gap:2px;padding:12px 14px;border-radius:var(--sf-radius);background:var(--sf-surface)}
.saf-figs b{font-size:var(--sf-fs-lg);font-weight:var(--weight-semibold)}
.saf-figs span{font-size:var(--sf-fs-sm);color:var(--sf-muted)}
.saf-two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:var(--sf-gap);align-items:start}
.saf-card{display:flex;flex-direction:column;gap:14px;padding:20px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.saf-card h2{font-size:var(--sf-fs-h3)}
.saf-steps{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:14px}
.saf-steps li{display:grid;grid-template-columns:32px minmax(0,1fr);gap:12px;align-items:start}
.saf-steps i{display:grid;place-items:center;width:32px;height:32px;border-radius:var(--radius-full);background:var(--sf-primary);color:var(--sf-on-primary);font-style:normal;font-weight:var(--weight-semibold)}
.saf-fld{display:flex;flex-direction:column;gap:6px;min-width:0}
.saf-fld label{font-size:var(--sf-fs-sm);font-weight:var(--weight-medium)}
.saf-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.saf-terms{margin:0;padding:12px 14px;border-radius:var(--sf-radius);background:var(--sf-soft);font-size:var(--sf-fs-sm)}
.saf-err{margin:0;color:#b91c1c;font-size:var(--sf-fs-sm)}
.saf-done{display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.saf-code{font-family:var(--font-data);font-weight:var(--weight-semibold);padding:4px 10px;border:1px dashed var(--sf-primary);border-radius:var(--sf-radius);color:var(--sf-primary)}
@media (max-width:899px){.saf-two{grid-template-columns:minmax(0,1fr)}.saf-figs{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:640px){.saf-hero{padding:20px}.saf-2{grid-template-columns:minmax(0,1fr)}}
`;

export default function StoreAffiliate() {
  const [s, setS] = useState(null);
  const [f, setF] = useState({ name: '', person: '', phone: '', email: '', where: '', audience: '', how: '', agree: false });
  const [err, setErr] = useState('');
  const [done, setDone] = useState(null);
  const [mine, setMine] = useState(null);   // already an affiliate / applied (signed in)
  useEffect(() => {
    setS(affSettings());
    const me = currentAccount();
    if (me) {
      setF((x) => ({ ...x, person: me.name || '', phone: me.phone, email: me.email || '' }));
      const a = affiliateOfPhone(me.phone);
      const app = getApplications().find((y) => y.phone === me.phone && y.status === 'pending');
      setMine(a ? { a } : app ? { app } : null);
    }
  }, []);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }); setErr(''); };
  const send = (e) => { e.preventDefault(); const r = applyAffiliate(f); if (!r.ok) { setErr(r.error); return; } setDone(r); window.scrollTo(0, 0); };
  return (
    <StoreChrome screen="StoreAffiliate" kind="page" head={HEAD} css={CSS}>
      {(shell) => {
        const q = shell.preview ? '?preview=1' : '';
        if (!s) return <div className="sf-wrap" style={{ minHeight: 480 }} aria-busy="true" />;
        const shop = (shell.shop && shell.shop.brand && shell.shop.brand.name) || 'our shop';
        const rate = s.type === 'fixed' ? bdt(s.fixed) : s.rate + '%';
        return (
          <div className="sf-wrap saf">
            <Crumbs items={[{ name: 'Become an affiliate' }]} />
            <section className="saf-hero">
              <h1>Earn with {shop}</h1>
              <p>Share our phones and accessories with your followers. Every order through your link or code earns you {s.type === 'fixed' ? rate + ' per order' : rate + ' of the sale'}.</p>
              <div className="saf-figs">
                <div><b>{rate}</b><span>{s.type === 'fixed' ? 'per order' : 'commission'}</span></div>
                <div><b>{s.linkDays} days</b><span>your link counts</span></div>
                <div><b>{bdt(s.minPayout)}</b><span>minimum payout</span></div>
                <div><b>bKash · Nagad · bank</b><span>how you are paid</span></div>
              </div>
            </section>
            {!s.on ? <section className="saf-card"><h2>The programme is closed right now</h2><p className="sf-muted" style={{ margin: 0 }}>Please check again later.</p></section> : (
              <div className="saf-two">
                <section className="saf-card" aria-labelledby="saf-how">
                  <h2 id="saf-how">How it works</h2>
                  <ol className="saf-steps">
                    <li><i>1</i><span><b>Apply</b><br /><span className="sf-muted">{s.approval === 'auto' ? 'You get your link and code at once.' : 'We check your page and reply within 2 days.'}</span></span></li>
                    <li><i>2</i><span><b>Share your link or code</b><br /><span className="sf-muted">In posts, videos, stories or your group. A shopper who buys within {s.linkDays} days counts.</span></span></li>
                    <li><i>3</i><span><b>Get paid</b><br /><span className="sf-muted">After delivery and the {s.returnDays}-day return window, your commission is payable. We pay from {bdt(s.minPayout)} up.</span></span></li>
                  </ol>
                  <p className="sf-muted" style={{ margin: 0, fontSize: 'var(--sf-fs-sm)' }}>Already an affiliate? <a className="sf-link" href={'/account?tab=affiliate' + (q ? '&preview=1' : '')}>See your dashboard</a></p>
                </section>
                <section className="saf-card" aria-labelledby="saf-form">
                  {done ? (
                    <div className="saf-done" role="status">
                      <h2 id="saf-form">{done.approved ? 'You are in!' : 'Thanks for applying'}</h2>
                      {done.approved ? <p style={{ margin: 0 }}>Your code is <span className="saf-code">{done.affiliate.code}</span>. Sign in to My account with {done.affiliate.phone} to get your link and follow your orders.</p>
                        : <p style={{ margin: 0 }}>We will look at your page and message you on {done.application.phone}. Once approved, your link and code are in My account.</p>}
                      <a className="sf-btn sf-btn--fill" href={'/account?tab=affiliate' + (q ? '&preview=1' : '')}>Go to My account</a>
                    </div>
                  ) : mine ? (
                    <div className="saf-done">
                      <h2 id="saf-form">{mine.a ? 'You are an affiliate' : 'Your application is with us'}</h2>
                      <p style={{ margin: 0 }}>{mine.a ? <>Your code is <span className="saf-code">{mine.a.code}</span>.</> : 'We will message you once it is checked.'}</p>
                      <a className="sf-btn sf-btn--fill" href={'/account?tab=affiliate' + (q ? '&preview=1' : '')}>Open your dashboard</a>
                    </div>
                  ) : (
                    <form onSubmit={send} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <h2 id="saf-form">Apply</h2>
                      <div className="saf-2">
                        <div className="saf-fld"><label htmlFor="saf-name">Your name or page’s name</label><input id="saf-name" className="sf-input" value={f.name} onChange={set('name')} placeholder="e.g. Tech with Rafi" /></div>
                        <div className="saf-fld"><label htmlFor="saf-person">Your full name</label><input id="saf-person" className="sf-input" autoComplete="name" value={f.person} onChange={set('person')} /></div>
                        <div className="saf-fld"><label htmlFor="saf-phone">Mobile number</label><input id="saf-phone" className="sf-input" inputMode="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" /></div>
                        <div className="saf-fld"><label htmlFor="saf-email">Email (optional)</label><input id="saf-email" className="sf-input" type="email" autoComplete="email" value={f.email} onChange={set('email')} /></div>
                      </div>
                      <div className="saf-fld"><label htmlFor="saf-where">Where you will share the link</label><input id="saf-where" className="sf-input" value={f.where} onChange={set('where')} placeholder="e.g. YouTube · youtube.com/@techwithrafi" /></div>
                      <div className="saf-2">
                        <div className="saf-fld"><label htmlFor="saf-aud">Followers or members</label><input id="saf-aud" className="sf-input" value={f.audience} onChange={set('audience')} placeholder="e.g. 12K followers" /></div>
                        <div className="saf-fld"><label htmlFor="saf-how2">How you will promote us</label><input id="saf-how2" className="sf-input" value={f.how} onChange={set('how')} placeholder="e.g. Reviews and unboxing videos" /></div>
                      </div>
                      <p className="saf-terms">{s.terms}</p>
                      <label style={{ display: 'flex', gap: 10, alignItems: 'center', minHeight: 36 }}><input type="checkbox" checked={f.agree} onChange={set('agree')} style={{ width: 20, height: 20, accentColor: 'var(--sf-primary)' }} />I agree to these terms</label>
                      {err ? <p className="saf-err" role="alert">{err}</p> : null}
                      <button type="submit" className="sf-btn sf-btn--fill"><Icon name="send" width="16" height="16" aria-hidden="true" />Send application</button>
                    </form>
                  )}
                </section>
              </div>
            )}
          </div>
        );
      }}
    </StoreChrome>
  );
}
