'use client';
// Vendor portal › Sign in (/vendor-sign-in; Batch E). Demo: every Grid Shop vendor is listed; tapping one signs in at once
// (gridShop.vendorSignIn, session gc.vendor.session) and opens the portal's Home. A real portal signs in with the vendor's
// email and a one-time code. Already signed in: a line to go back to the portal.

import React from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Pic } from '@/components/ui/Pic';
import { getVendors, vendorSignIn } from '@/lib/platform/gridShop';
import { navigate } from '@/runtime/routes';
import { useVendor, VD_CSS } from './vendorShared';

const CSS = `
.vs-wrap{max-width:520px;margin:0 auto;padding:40px 16px 64px;display:flex;flex-direction:column;gap:var(--space-4)}
.vs-head{display:flex;align-items:center;gap:10px}
.vs-head b{display:block;font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.vs-head small{display:block;font-size:var(--text-sm);color:var(--text-muted)}
.vs-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.vs-list li+li{border-top:1px solid var(--border-subtle)}
.vs-list button{display:flex;align-items:center;gap:var(--space-3);width:100%;min-height:64px;padding:10px var(--space-4);border:0;background:none;text-align:left;cursor:pointer;color:inherit;font:inherit}
.vs-list button:hover,.vs-list button:focus-visible{background:var(--surface-subtle)}
.vs-list b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.vs-list small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.vs-list svg{margin-left:auto;flex:none;color:var(--text-muted)}
`;

export default function VendorSignIn() {
  const { ready, vendor } = useVendor();
  const go = (v) => { const r = vendorSignIn(v.id); if (r.ok === false) { toast(r.error, { tone: 'error' }); return; } toast(`Signed in as ${v.name}`); navigate('/vendor'); };
  const list = ready ? getVendors() : [];
  return (
    <div className="dc-screen ds vd" data-screen="VendorSignIn">
      <style dangerouslySetInnerHTML={{ __html: VD_CSS + CSS }} />
      <main className="vs-wrap">
        <header className="vs-head">
          <span className="vd-brand__ico" aria-hidden="true"><Icon name="shopping-bag" width="18" height="18" /></span>
          <span><b>Grid Shop vendor portal</b><small>Sell to GridCommerce stores</small></span>
        </header>
        <h1 className="sr-only">Sign in</h1>
        <p className="vd-note"><Icon name="info" width="16" height="16" aria-hidden="true" />Demo: tap a vendor to sign in. The real portal sends a one-time code to the vendor’s email.</p>
        {ready && vendor ? <p className="vd-note vd-note--warn"><Icon name="log-in" width="16" height="16" aria-hidden="true" /><span>You are signed in as {vendor.name}. <Link href="/vendor" className="bl-link">Open your portal</Link></span></p> : null}
        <section className="ix-card" aria-label="Vendors">
          {!ready ? <div style={{ minHeight: 280 }} aria-busy="true" /> : (
            <ul className="vs-list">
              {list.map((v) => (
                <li key={v.id}>
                  <button type="button" onClick={() => go(v)}>
                    <Pic src={v.logo} name={v.name} kind="logo" size={40} />
                    <span><b>{v.name}</b><small>{v.about || v.contact}{v.status === 'paused' ? ' · paused' : ''}</small></span>
                    <Icon name="chevron-right" width="16" height="16" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <p className="gc-help" style={{ margin: 0, textAlign: 'center' }}>Want to sell on Grid Shop? Write to vendors@gridcommerce.net.</p>
      </main>
    </div>
  );
}
