'use client';
// gpShared — the Grid Partners creators' app frames (Batch E). Two frames:
//   PublicFrame  the open pages (/grid-partners landing, /grid-partners/join, /gp-sign-in, the public profile /p?h=): a top
//                bar with the Grid Partners mark, For stores · Sign in · Join, and a short footer.
//   GpFrame      the signed-in partner's app (/gp, /gp-requests, /gp-profile): a left menu (Home, Requests, Profile, Public
//                page) with the partner's photo and name in the top bar and Sign out; on phones the menu is a bottom tab
//                bar. A banner says when the profile waits for review, was rejected (with the reason) or is suspended.
// It reuses the vendor portal's frame styles (vendorShared VD_CSS) and the Grid Partners parts (../partnerShared).
// Data: lib/platform/partners.js (session gc.partner.session).

import React from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { EmptyState } from '@/components/ui';
import { Pic } from '@/components/ui/Pic';
import { toast } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { currentPartner, partnerSignOut, getRequests, resubmit, publicPath } from '@/lib/platform/partners';
import { VD_CSS } from '../../vendor/vendorShared';
import { usePartners, PT_CSS } from '../partnerShared';

/** { ready, tick, partner } — the signed-in partner after mount. */
export function usePartner() {
  const { ready, tick } = usePartners();
  return { ready, tick, partner: ready ? currentPartner() : null };
}

function Mark({ size = 32 }) {
  return <span className="gp-mark" style={{ width: size, height: size }} aria-hidden="true"><Icon name="users-round" width={Math.round(size * 0.55)} height={Math.round(size * 0.55)} /></span>;
}

/** The open pages' frame. */
export function PublicFrame({ screen, css = '', children, wide, hideJoin }) {
  return (
    <div className="dc-screen ds gp-pub" data-screen={screen}>
      <style dangerouslySetInnerHTML={{ __html: PT_CSS + GP_CSS + css }} />
      <header className="gp-bar">
        <Link href="/grid-partners" className="gp-brand"><Mark /><span><b>Grid Partners</b><small>by GridCommerce</small></span></Link>
        <nav className="gp-bar__nav" aria-label="Grid Partners">
          <Link href="/partners" className="gp-hide-sm">For stores</Link>
          <Link href="/gp-sign-in">Sign in</Link>
          {hideJoin ? null : <Link href="/grid-partners/join" className="ix-btn ix-btn--primary ix-btn--sm">Join</Link>}
        </nav>
      </header>
      <main className={'gp-pubmain' + (wide ? ' is-wide' : '')}>{children}</main>
      <footer className="gp-foot"><span>Grid Partners connects online shops with models, influencers and video creators. GridCommerce does not take a cut: you agree the work and the payment with each other.</span></footer>
    </div>
  );
}

export const GP_NAV = [
  { id: 'home', href: '/gp', label: 'Home', icon: 'layout-dashboard' },
  { id: 'requests', href: '/gp-requests', label: 'Requests', icon: 'inbox' },
  { id: 'profile', href: '/gp-profile', label: 'Profile', icon: 'user-round-pen' },
];

/** The status line under the top bar for a profile that is not live. */
function StatusNote({ p }) {
  if (p.status === 'applied') return <p className="pt-note pt-note--warn"><Icon name="hourglass" width="16" height="16" aria-hidden="true" /><span><b>Waiting for review.</b> GridCommerce checks new profiles within 2 working days. Stores can’t see you until then.</span></p>;
  if (p.status === 'rejected') {
    return (
      <p className="pt-note pt-note--bad"><Icon name="circle-x" width="16" height="16" aria-hidden="true" />
        <span><b>Not approved:</b> {p.reason} Fix it in your profile, then <button type="button" className="gp-linkbtn" onClick={() => { const r = resubmit(p.id); if (r.ok === false) toast(r.error, { tone: 'error' }); else toast('Sent again for review'); }}>send it again</button>.</span>
      </p>
    );
  }
  if (p.status === 'suspended') return <p className="pt-note pt-note--bad"><Icon name="pause-circle" width="16" height="16" aria-hidden="true" /><span><b>Suspended by GridCommerce:</b> {p.reason} Stores can’t see your profile. Write to partners@gridcommerce.net.</span></p>;
  return null;
}

/** The partner app's frame. active = a GP_NAV id; children(partner). */
export function GpFrame({ active, screen, css = '', children, after }) {
  const { ready, partner } = usePartner();
  const fresh = ready && partner ? getRequests({ partnerId: partner.id }).filter((r) => r.status === 'sent').length : 0;
  const count = (id) => (id === 'requests' && fresh ? fresh : null);
  const out = () => { partnerSignOut(); navigate('/gp-sign-in'); };
  const nav = partner ? [...GP_NAV, { id: 'public', href: publicPath(partner.handle), label: 'Public page', icon: 'globe', ext: true }] : GP_NAV;
  return (
    <div className="dc-screen ds vd gp" data-screen={screen}>
      <style dangerouslySetInnerHTML={{ __html: VD_CSS + PT_CSS + GP_CSS + css }} />
      <div className="vd-shell">
        <aside className="vd-side" aria-label="Partner menu">
          <Link href="/gp" className="vd-brand"><Mark /><span><b>Grid Partners</b><small>Creator app</small></span></Link>
          <nav className="vd-nav" aria-label="Grid Partners">
            {nav.map((n) => <Link key={n.id} href={n.href} target={n.ext ? '_blank' : undefined} aria-current={active === n.id ? 'page' : undefined}><Icon name={n.icon} width="16" height="16" aria-hidden="true" /><span>{n.label}</span>{count(n.id) ? <span className="vd-n">{count(n.id)}</span> : null}{n.ext ? <Icon name="external-link" width="12" height="12" aria-hidden="true" style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} /> : null}</Link>)}
          </nav>
          <p className="vd-side__foot">Demo app. Everything stays in this browser.</p>
        </aside>
        <div className="vd-main">
          <header className="vd-top">
            <Link href="/gp" className="vd-top__brand" aria-label="Grid Partners home"><Mark size={30} /></Link>
            {partner ? (
              <div className="vd-who">
                <Pic src={partner.photo} name={partner.name} kind="person" size={32} />
                <span className="vd-who__name"><b>{partner.name}</b><small>@{partner.handle}</small></span>
                <button type="button" className="ix-btn ix-btn--sm" onClick={out}><Icon name="log-out" width="16" height="16" aria-hidden="true" /><span className="vd-hide-sm">Sign out</span></button>
              </div>
            ) : null}
          </header>
          <main className="vd-content">
            <div className="ix-page">
              {!ready ? <div style={{ minHeight: 360 }} aria-busy="true" /> : !partner ? (
                <section className="ix-card" style={{ padding: 'var(--space-6) var(--space-4)' }}><EmptyState icon="log-in" title="Sign in to Grid Partners" body="See requests from stores and edit your profile." actionLabel="Sign in" onAction={() => navigate('/gp-sign-in')} /></section>
              ) : (<>
                <StatusNote p={partner} />
                {children(partner)}
              </>)}
            </div>
          </main>
        </div>
      </div>
      <nav className="vd-tabs gp-tabs" aria-label="Grid Partners">
        {nav.map((n) => <Link key={n.id} href={n.href} target={n.ext ? '_blank' : undefined} aria-current={active === n.id ? 'page' : undefined}><Icon name={n.icon} width="20" height="20" aria-hidden="true" /><span>{n.id === 'public' ? 'Public' : n.label}</span>{count(n.id) ? <span className="vd-tabs__n">{count(n.id)}</span> : null}</Link>)}
      </nav>
      {ready && partner ? after : null}
    </div>
  );
}

export const GP_CSS = `
.gp-mark{display:grid;place-items:center;flex:none;border-radius:var(--radius-lg);background:linear-gradient(135deg,var(--primary),var(--fill-info,var(--primary)));color:var(--text-on-dark)}
.gp-pub{min-height:100vh;display:flex;flex-direction:column;background:var(--surface-page)}
.gp-bar{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:60px;padding:8px var(--space-5);border-bottom:1px solid var(--border-subtle);background:var(--surface-card)}
.gp-brand{display:flex;align-items:center;gap:10px;color:inherit;text-decoration:none}
.gp-brand b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.gp-brand small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.gp-bar__nav{display:flex;align-items:center;gap:var(--space-4)}
.gp-bar__nav>a:not(.ix-btn){font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body);text-decoration:none}
.gp-bar__nav>a:not(.ix-btn):hover{color:var(--primary)}
.gp-pubmain{flex:1;width:100%;max-width:1120px;margin:0 auto;padding:var(--space-5) var(--space-5) var(--space-8);box-sizing:border-box;display:flex;flex-direction:column;gap:var(--space-4)}
.gp-pubmain.is-wide{max-width:1240px}
.gp-foot{padding:var(--space-4) var(--space-5);border-top:1px solid var(--border-subtle);background:var(--surface-card);font-size:var(--text-xs);color:var(--text-muted);text-align:center}
.gp-linkbtn{all:unset;color:var(--text-link);text-decoration:underline;cursor:pointer}
.gp-linkbtn:focus-visible{outline:2px solid var(--primary)}
.gp .vd-tabs{grid-template-columns:repeat(4,minmax(0,1fr))}
@media (max-width:640px){
  .gp-bar{padding:8px 16px}
  .gp-hide-sm{display:none}
  .gp-brand small{display:none}
  .gp-pubmain{padding:var(--space-3) 16px var(--space-6)}
}
`;
