'use client';
// Merchant app · Welcome (/onb-welcome) — the first screen of the app's sign-up (design board
// design/templates/app/OnbWelcome.dc.html, now drawn with the app kit). Create my shop → /onb-phone (the five steps in
// lib/shopOnboarding.js); I already have an account → /onb-sign-in. Someone already signed in sees "Open my shop".

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppScreen, LangSwitch } from './kit/AppKit';
import { hasSession } from './kit/AppSession';

const CSS = `
[data-screen="OnbWelcome"] .hi{background:#fff}
[data-screen="OnbWelcome"] .wl-top{position:absolute;top:56px;left:20px;right:20px;display:flex;justify-content:space-between;align-items:center;z-index:3}
[data-screen="OnbWelcome"] .wl-foot{position:absolute;left:20px;right:20px;bottom:44px;color:#fff;z-index:3}
[data-screen="OnbWelcome"] .wl-foot .btn{width:100%}
`;

export default function OnbWelcomeScreen() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => { setSignedIn(hasSession()); }, []);
  return (
    <AppScreen name="OnbWelcome" title="Welcome to GridCommerce" statusTone="light" tabs={false} css={CSS}>
      <h1 className="sr-only">Welcome to GridCommerce</h1>
      <img src="/assets/cfbbbbd758347fbb3f71590345d24674.webp" alt="" style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', background: '#1e293b' }} />
      <div style={{ position: 'absolute', inset: '0', background: 'linear-gradient(180deg,rgba(1,15,51,.55) 0%,rgba(1,15,51,.05) 30%,rgba(1,15,51,.35) 52%,rgba(1,15,51,.94) 78%)' }} />
      <div className="wl-top">
        <img src="/assets/2cdd11de6454f32fc6bb856d35bf4f3e.png" alt="GridCommerce" style={{ height: '26px' }} />
        <LangSwitch />
      </div>
      <div className="wl-foot" data-pin-bottom="">
        <span className="pill" style={{ background: 'rgba(255,255,255,.16)', color: '#fff', backdropFilter: 'blur(8px)' }}>Fashion boutique · Dhaka</span>
        <p style={{ margin: '12px 0 0', fontSize: 'var(--text-2xl)', lineHeight: '28px', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-tight)' }}>“Facebook orders, courier booking and stock used to live in three notebooks. Now it’s one screen.”</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
          <span className="av" style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,.18)', color: '#fff', fontSize: 'var(--text-xs-plus)' }}>N</span>
          <span>
            <span style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>Nusrat Jahan</span>
            <span style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: '#cbd8ee' }}>Nusrat’s Closet · Online fashion</span>
          </span>
          <span className="pill" style={{ marginLeft: 'auto', background: 'rgba(255,255,255,.1)', color: '#cbd8ee' }}>Sample story</span>
        </div>
        {signedIn ? <Link href="/m-home" className="btn" style={{ marginTop: '22px', background: '#fff', color: '#003087' }}>Open my shop</Link> : null}
        <Link href="/onb-phone" className="btn" style={signedIn ? { marginTop: '10px', background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.2)' } : { marginTop: '22px', background: '#fff', color: '#003087' }}>Create my shop — free</Link>
        {signedIn ? null : <Link href="/onb-sign-in" className="btn" style={{ marginTop: '10px', background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.2)' }}>I already have an account</Link>}
      </div>
    </AppScreen>
  );
}
