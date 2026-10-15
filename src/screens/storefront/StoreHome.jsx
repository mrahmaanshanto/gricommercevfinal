'use client';
// Store home — the online store's home page (/store), drawn by the theme: the Home layout's sections (Online Store ›
// Layouts: hero, category tiles, products, flash sale countdown, offer banner, brands, reviews, blog …) inside the
// theme's header and footer. Customers see the published look; ?preview=1 shows the draft (the Theme editor's preview).
// Front end only: the live website serves the same at dazzleshop.com.bd.
// A "Tweak this page" button opens the page as a draft with the tweak panel (StoreTweak.jsx, ?preview=1&tweak=1), where
// each part is restyled on the page itself. In this demo everyone sees the button; a live store shows it only to staff
// signed in to the shop (their session), never to customers.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { businessProfile } from '@/lib/businessProfile';
import { StoreChrome } from './storeChrome';
import { Sections, useLayout } from './sections';

const StoreTweak = React.lazy(() => import('./StoreTweak'));

/** ?tweak=1 (with ?preview=1): the panel is open; otherwise the button that opens it. */
function useTweak() {
  const [st, setSt] = useState({ on: false, staff: false });
  useEffect(() => {
    let q = null;
    try { q = new URLSearchParams(window.location.search); } catch { q = null; }
    // demo: every visitor counts as staff (see the note at the top)
    setSt({ on: !!q && q.get('tweak') === '1' && q.get('preview') === '1', staff: true });
  }, []);
  return st;
}
const tweakHref = (on) => { const q = new URLSearchParams(window.location.search); if (on) { q.set('preview', '1'); q.set('tweak', '1'); } else { q.delete('tweak'); q.delete('preview'); } const s = q.toString(); return '/store' + (s ? '?' + s : ''); };

export default function StoreHome() {
  const lay = useLayout('home', {}, 'home');
  const [head, setHead] = useState(null);
  const [name, setName] = useState('Dazzle Shop');
  const tweak = useTweak();
  useEffect(() => {
    let p = null;
    try { p = businessProfile(); } catch { p = null; }
    const n = (p && p.brand && p.brand.name) || 'Dazzle Shop';
    setName(n);
    setHead({ title: n + ' · Official phones, accessories and repairs', description: 'Shop official smartphones, chargers, earbuds and accessories with warranty and cash on delivery all over Bangladesh.', robots: 'index, follow', canonical: 'https://dazzleshop.com.bd/', og: { 'og:title': n, 'og:type': 'website' }, jsonld: [] });
  }, []);
  return (
    <StoreChrome screen="StoreHome" kind="home" head={head} headerId={lay ? lay.header : ''}>
      {(shell) => (!lay ? <div style={{ minHeight: 480 }} aria-busy="true" /> : (<>
        <h1 className="sr-only">{name}</h1>
        <Sections sections={lay.sections} values={shell.values} catalog={shell.catalog} main={null} />
        <div style={{ height: 'var(--sf-section)' }} />
        {tweak.on && lay.id ? <React.Suspense fallback={null}><StoreTweak layoutId={lay.id} onClose={() => { window.location.href = tweakHref(false); }} /></React.Suspense> : null}
        {!tweak.on && tweak.staff ? <a className="stw-launch" href="#tweak" onClick={(e) => { e.preventDefault(); window.location.href = tweakHref(true); }}><Icon name="sliders-horizontal" width="16" height="16" aria-hidden="true" /><span>Tweak this page</span></a> : null}
        <style dangerouslySetInnerHTML={{ __html: LAUNCH_CSS }} />
      </>))}
    </StoreChrome>
  );
}

const LAUNCH_CSS = `
.stw-launch{position:fixed;left:50%;bottom:calc(20px + var(--host-badge,0px));z-index:70;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 18px;border-radius:var(--radius-full);background:#0f172a;color:#fff;font-family:var(--font-sans);font-size:var(--text-sm);font-weight:var(--weight-semibold);text-decoration:none;box-shadow:0 12px 28px -10px rgba(15,23,42,.55);transform:translateX(-50%);transition:transform .2s cubic-bezier(.2,.8,.2,1)}
.stw-launch:hover{transform:translateX(-50%) translateY(-2px)}
@media (max-width:640px){.stw-launch{left:16px;bottom:calc(76px + var(--host-badge,0px));width:48px;height:48px;padding:0;transform:none}.stw-launch:hover{transform:none}.stw-launch>span{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}}
`;
