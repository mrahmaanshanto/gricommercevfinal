'use client';
// A partner's public profile (/p?h=<handle>; Batch E) — the page partners post on social media: cover, photo, name with the
// blue tick, type and city, platforms with followers, about, samples (tap a photo to see it large), rate card and what
// stores said. "Hire me on Grid Partners" takes a store to Grid Partners in the merchant panel (sign in first). No phone or
// email here. Only approved partners show; any other handle says "This profile is not public".
// The handle is a query parameter so the page stays one static page. Data: lib/platform/partners.js.

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { EmptyState } from '@/components/ui';
import { publicPartner, addView, fromPrice, typeLabel } from '@/lib/platform/partners';
import { usePartners, PartnerProfile, tk, qp } from '../partnerShared';
import { PublicFrame } from './gpShared';

const CSS = `
.pb-hire{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4)}
.pb-hire h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pb-hire p{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.pb-bar{display:none}
@media (max-width:640px){
  .pb-bar{position:fixed;left:0;right:0;bottom:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);padding:10px 16px calc(10px + env(safe-area-inset-bottom));border-top:1px solid var(--border-subtle);background:var(--surface-card)}
  .pb-bar span{font-size:var(--text-sm);color:var(--text-body)}
  .gp-pub .gp-foot{padding-bottom:84px}
}
body:has(#nl-badge-frame) .pb-bar{bottom:var(--host-badge)}
`;

export default function PartnerPublic() {
  const { ready } = usePartners();
  const h = ready ? qp('h') : '';
  const p = ready ? publicPartner(h) : null;
  useEffect(() => { if (p) { addView(p.id); document.title = `${p.name} · ${typeLabel(p.type)} · Grid Partners`; } }, [p && p.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ready) return <PublicFrame screen="PartnerPublic" css={CSS} wide><div style={{ minHeight: 480 }} aria-busy="true" /></PublicFrame>;
  if (!p) {
    return (
      <PublicFrame screen="PartnerPublic" css={CSS}>
        <h1 className="sr-only">Profile not found</h1>
        <section className="ix-card" style={{ padding: 'var(--space-8) var(--space-4)' }}>
          <EmptyState icon="user-x" title="This profile is not public" body="The link may be wrong, or the profile is not approved yet." actionLabel="See Grid Partners" onAction={() => { window.location.href = '/grid-partners'; }} />
        </section>
      </PublicFrame>
    );
  }
  const fp = fromPrice(p);
  const hire = <Link href="/partners" className="ix-btn ix-btn--primary"><Icon name="handshake" width="16" height="16" aria-hidden="true" />Hire me on Grid Partners</Link>;
  return (
    <PublicFrame screen="PartnerPublic" css={CSS} wide>
      <PartnerProfile p={p} h1 action={hire}
        side={(
          <section className="ix-card pb-hire" aria-labelledby="pb-hire">
            <h2 id="pb-hire">Work with {p.name.split(' ')[0]}</h2>
            <p>Stores on GridCommerce send a request through Grid Partners{fp ? `; rates start at ${tk(fp)}` : ''}. Once {p.name.split(' ')[0]} accepts, you get each other’s contact details.</p>
            {hire}
            <p className="pt-muted">Not on GridCommerce yet? <Link href="/merchant-sign-in" className="bl-link">Start your store</Link></p>
          </section>
        )} />
      <div className="pb-bar"><span>{fp ? <>From <b>{tk(fp)}</b></> : typeLabel(p.type)}</span>{hire}</div>
    </PublicFrame>
  );
}
