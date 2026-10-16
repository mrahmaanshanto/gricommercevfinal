'use client';
// Grid Partners › Sign in (/gp-sign-in; Batch E). Demo: every partner is listed (approved first, then waiting for review,
// rejected and suspended); tapping one signs in at once (partners.partnerSignIn, session gc.partner.session) and opens the
// partner's Home (/gp). A real app signs in with the mobile number and a one-time code.

import React from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Pic } from '@/components/ui/Pic';
import { navigate } from '@/runtime/routes';
import { getPartners, partnerSignIn, typeLabel, PSTATUS } from '@/lib/platform/partners';
import { PartnerBadge, Tick } from '../partnerShared';
import { PublicFrame, usePartner } from './gpShared';

const CSS = `
.gs-wrap{max-width:560px;width:100%;margin:0 auto;display:flex;flex-direction:column;gap:var(--space-4)}
.gs-wrap h1{margin:0;font-size:var(--text-2xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.gs-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.gs-list li+li{border-top:1px solid var(--border-subtle)}
.gs-list button{display:flex;align-items:center;gap:var(--space-3);width:100%;min-height:64px;padding:10px var(--space-4);border:0;background:none;text-align:left;cursor:pointer;color:inherit;font:inherit}
.gs-list button:hover,.gs-list button:focus-visible{background:var(--surface-subtle)}
.gs-list b{display:flex;align-items:center;gap:4px;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.gs-list small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.gs-list .gs-main{flex:1;min-width:0}
.gs-group{margin:0;padding:var(--space-3) var(--space-4) var(--space-1);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted)}
`;
const ORDER = ['approved', 'applied', 'rejected', 'suspended'];

export default function GpSignIn() {
  const { ready, partner } = usePartner();
  const all = ready ? getPartners() : [];
  const go = (p) => { const r = partnerSignIn(p.id); if (r.ok === false) { toast(r.error, { tone: 'error' }); return; } toast(`Signed in as ${p.name}`); navigate('/gp'); };
  return (
    <PublicFrame screen="GpSignIn" css={CSS}>
      <div className="gs-wrap">
        <h1>Sign in to Grid Partners</h1>
        <p className="pt-note"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>Demo: tap a partner to sign in. The real app sends a one-time code to the partner’s mobile.</span></p>
        {ready && partner ? <p className="pt-note pt-note--warn"><Icon name="log-in" width="16" height="16" aria-hidden="true" /><span>You are signed in as {partner.name}. <Link href="/gp" className="bl-link">Open your app</Link></span></p> : null}
        <section className="ix-card" aria-label="Partners">
          {!ready ? <div style={{ minHeight: 320 }} aria-busy="true" /> : ORDER.map((s) => {
            const list = all.filter((p) => p.status === s);
            if (!list.length) return null;
            return (
              <div key={s}>
                <h2 className="gs-group">{PSTATUS[s].label}</h2>
                <ul className="gs-list">
                  {list.map((p) => (
                    <li key={p.id}>
                      <button type="button" onClick={() => go(p)}>
                        <Pic src={p.photo} name={p.name} kind="person" size={40} />
                        <span className="gs-main"><b>{p.name}{p.verified ? <Tick size={14} /> : null}</b><small>{typeLabel(p.type)} · {p.city} · @{p.handle}</small></span>
                        {s !== 'approved' ? <PartnerBadge p={p} /> : null}
                        <Icon name="chevron-right" width="16" height="16" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
        <p className="pt-muted" style={{ margin: 0, textAlign: 'center' }}>New here? <Link href="/grid-partners/join" className="bl-link">Join Grid Partners</Link></p>
      </div>
    </PublicFrame>
  );
}
