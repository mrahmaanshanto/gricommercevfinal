'use client';
// Grid Partners › Home (/gp; Batch E): the signed-in partner's day — profile views, new requests, accepted work and the
// rating; the newest requests from stores; how complete the profile is (and what is missing); while waiting for review,
// the minimum standards checklist; at the side "Share my profile" (link, QR code, social share links, share card).
// Data: lib/platform/partners.js.

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip } from '@/components/ui/IndexKit';
import { Pic } from '@/components/ui/Pic';
import { getRequests, ratingOf, completeness, checkStandards, packageOf } from '@/lib/platform/partners';
import { ShareCard, ReqBadge, tk, dShort } from '../partnerShared';
import { GpFrame, usePartner } from './gpShared';

const CSS = `
.gh-bar{display:block;height:8px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.gh-bar b{display:block;height:100%;border-radius:var(--radius-full);background:var(--success)}
.gh-miss{display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0;list-style:none}
.gh-miss li{display:inline-flex;align-items:center;gap:6px;min-height:28px;padding:0 10px;border-radius:var(--radius-full);background:var(--fill-warning-soft);font-size:var(--text-xs);color:var(--text-body)}
`;

function Body({ p }) {
  const { tick } = usePartner();
  const d = useMemo(() => {
    const reqs = getRequests({ partnerId: p.id });
    return { reqs, fresh: reqs.filter((r) => r.status === 'sent'), open: reqs.filter((r) => r.status === 'accepted'), rating: ratingOf(p.id), comp: completeness(p) };
  }, [p, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const st = p.stats || {};
  const checks = p.status !== 'approved' ? checkStandards(p) : null;
  return (<>
    <ShopHeader icon="layout-dashboard" title={`Hello, ${p.name.split(' ')[0]}`}
      about="Your Grid Partners home: requests from stores, how many people opened your profile, and your share card. Stores see your phone and email only after you accept their request. GridCommerce does not take a cut: you agree the work and the payment with the store."
      primary={{ label: 'Edit profile', icon: 'user-round-pen', href: '/gp-profile' }} />
    <MetricStrip items={[
      { label: 'Profile views', value: String(st.views || 0), icon: 'eye' },
      { label: 'New requests', value: String(d.fresh.length), href: '/gp-requests', icon: 'inbox' },
      { label: 'Accepted', value: String(st.accepted || 0), sub: `of ${st.requests || 0} requests`, icon: 'handshake' },
      { label: 'Rating', value: d.rating.count ? d.rating.avg.toFixed(1) : '—', sub: d.rating.count ? `${d.rating.count} rating${d.rating.count === 1 ? '' : 's'}` : 'no ratings yet', icon: 'star' },
    ]} />
    <div className="ix-record">
      <div className="ix-main">
        {checks ? (
          <section className="ix-card pt-pad" aria-labelledby="gh-std">
            <h2 id="gh-std">Minimum standards</h2>
            <ul className="pt-check">{checks.map((c) => <li key={c.key} className={c.ok ? 'is-ok' : 'is-bad'}><Icon name={c.ok ? 'circle-check' : 'circle-x'} width="16" height="16" aria-hidden="true" /><span><b>{c.label}</b><small>{c.detail}</small></span></li>)}</ul>
          </section>
        ) : null}
        <section className="ix-card pt-pad" aria-labelledby="gh-req">
          <h2 id="gh-req">New requests</h2>
          {d.fresh.length || d.open.length ? (
            <ul className="vd-list">{[...d.fresh, ...d.open].slice(0, 5).map((r) => (
              <li key={r.id}>
                <Pic name={r.shopName} kind="logo" size={32} />
                <Link href={'/gp-requests?id=' + r.id} className="vd-list__main"><b>{r.shopName} · {packageOf(p, r.packageId) ? packageOf(p, r.packageId).name : 'Custom request'}</b><small>{tk(r.budget)} · {r.brief}</small></Link>
                <ReqBadge r={r} side="partner" />
              </li>
            ))}</ul>
          ) : <EmptyState icon="inbox" title={d.reqs.length ? 'No new requests' : 'No requests yet'} body={p.status === 'approved' ? 'Share your profile so stores find you.' : 'Requests come once you are approved.'} />}
          {d.reqs.length ? <Link href="/gp-requests" className="bl-link" style={{ fontSize: 'var(--text-sm)' }}>All requests</Link> : null}
        </section>
        <section className="ix-card pt-pad" aria-labelledby="gh-comp">
          <h2 id="gh-comp">Profile {d.comp.pct}% complete</h2>
          <span className="gh-bar" role="progressbar" aria-valuenow={d.comp.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Profile complete"><b style={{ width: d.comp.pct + '%' }} /></span>
          {d.comp.missing.length ? (<>
            <ul className="gh-miss">{d.comp.missing.map((m) => <li key={m}><Icon name="plus" width="12" height="12" aria-hidden="true" />{m}</li>)}</ul>
            <div><Link href="/gp-profile" className="ix-btn ix-btn--sm">Finish your profile</Link></div>
          </>) : <p className="pt-muted">Everything stores look for is there. Joined {dShort(p.joinedAt || p.appliedAt)}.</p>}
        </section>
      </div>
      <aside className="ix-side" aria-label="Share">
        <ShareCard p={p} />
      </aside>
    </div>
  </>);
}

export default function GpHome() {
  return <GpFrame active="home" screen="GpHome" css={CSS}>{(p) => <Body p={p} />}</GpFrame>;
}
