'use client';
// Grid Partners › a partner (/admin/partner?id=&tab=; Batch E): the partner's record — header with photo, status and the
// public page link; switches for the blue tick and Featured; Suspend (reason required, the partner and stores' open
// requests see it) or Restore; a waiting application opens the review panel. Tabs: Profile (about, platforms, samples,
// rate card, private contact, figures), Requests (every store request with its status) and History.
// Data: lib/platform/partners.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { RecordHeader, IndexTabs, MetricStrip, KV } from '@/components/ui/IndexKit';
import { EmptyState, Sheet } from '@/components/ui';
import { Pic } from '@/components/ui/Pic';
import { BrandLogo } from '@/components/BrandLogo';
import { partnerById, getRequests, ratingOf, setFlag, suspendPartner, restorePartner, typeLabel, netLabel, followersText, packageOf, lastMessage, publicPath } from '@/lib/platform/partners';
import { AdminShell } from '../AdminShell';
import { usePartners, PT_CSS, PartnerBadge, AvailBadge, ReqBadge, Samples, Packages, Tick, tk, qp, dShort, dTime, dayText, say } from '@/screens/partners/partnerShared';
import { ReviewSheet, Standards, PTA_CSS, byName } from './ptAdmin';

const TABS = [['profile', 'Profile'], ['requests', 'Requests'], ['history', 'History']];

function Switch({ on, label, sub, onFlip }) {
  return (
    <div className="ptr-sw">
      <span><b>{label}</b><small>{sub}</small></span>
      <button type="button" role="switch" className="gc-switch" aria-checked={on} aria-label={label} onClick={onFlip}><span className="gc-switch__knob" /></button>
    </div>
  );
}

function Profile({ p }) {
  const r = ratingOf(p.id);
  return (
    <div className="ix-record">
      <div className="ix-main">
        <section className="ix-card pt-pad" aria-labelledby="ptr-about">
          <h2 id="ptr-about">About</h2>
          {p.bio ? <p className="pp-bio">{p.bio}</p> : <p className="pt-muted">No bio.</p>}
          <div className="pt-chips">{(p.niches || []).map((n) => <span key={n} className="pt-chip">{n}</span>)}{(p.languages || []).map((n) => <span key={n} className="pt-chip">{n}</span>)}</div>
        </section>
        <section className="ix-card pt-pad" aria-labelledby="ptr-plat">
          <h2 id="ptr-plat">Platforms</h2>
          <ul className="pta-plat">{(p.platforms || []).map((x) => <li key={x.net + x.handle}><BrandLogo brand={x.net} size={24} decorative /><span><b>{followersText(x.followers)}</b> on {netLabel(x.net)}{x.handle ? ' · @' + x.handle : ''}</span>{x.url ? <a href={x.url} target="_blank" rel="noopener noreferrer" className="bl-link">Open</a> : null}</li>)}</ul>
        </section>
        <section className="ix-card pt-pad" aria-labelledby="ptr-smp"><h2 id="ptr-smp">Samples</h2><Samples p={p} /></section>
        <section className="ix-card pt-pad" aria-labelledby="ptr-std"><h2 id="ptr-std">Minimum standards</h2><Standards p={p} /></section>
      </div>
      <aside className="ix-side" aria-label="Facts">
        <section className="ix-card pt-pad">
          <h2>Rate card</h2>
          <Packages p={p} compact />
          {p.budgetFrom ? <p className="pt-muted">Usual budget {tk(p.budgetFrom)}{p.budgetTo ? '–' + tk(p.budgetTo) : '+'}</p> : null}
        </section>
        <section className="ix-card pt-pad">
          <h2>Contact (private)</h2>
          <KV rows={[['Phone', <>{p.phone}{p.phoneVerified ? <span className="pt-sub">Checked with a code</span> : null}</>], ['Email', p.email], ['ID', p.idChecked ? 'Checked' : 'Not checked']]} />
        </section>
        <section className="ix-card pt-pad">
          <h2>Facts</h2>
          <KV rows={[['Rating', r.count ? `${r.avg.toFixed(1)} from ${r.count}` : 'No ratings yet'], ['Applied', dShort(p.appliedAt)], ['Approved', p.joinedAt ? `${dShort(p.joinedAt)}${p.reviewedBy ? ' by ' + p.reviewedBy : ''}` : '—'], ['Public link', <a key="l" href={publicPath(p.handle)} target="_blank" rel="noopener noreferrer" className="bl-link">/p?h={p.handle}</a>]]} />
        </section>
      </aside>
    </div>
  );
}

function Requests({ p }) {
  const rows = getRequests({ partnerId: p.id });
  if (!rows.length) return <section className="ix-card ix-empty"><EmptyState icon="inbox" title="No requests yet" /></section>;
  return (
    <section className="ix-card" aria-label="Requests">
      <div className="ix-table-wrap ix-table-wrap--show">
        <table className="ix-table">
          <caption className="sr-only">Requests to {p.name}</caption>
          <thead><tr><th scope="col">Store</th><th scope="col">Request</th><th scope="col" className="ix-num">Budget</th><th scope="col">Wanted by</th><th scope="col">Status</th><th scope="col">Last message</th></tr></thead>
          <tbody>{rows.map((r) => { const m = lastMessage(r); const k = packageOf(p, r.packageId); return (
            <tr key={r.id}>
              <td><span className="gc-picrow"><Pic name={r.shopName} kind="logo" size={32} /><span><Link href={'/admin/partners/requests?id=' + r.id} className="ix-strong">{r.shopName}</Link><span className="pt-sub">{r.id} · #{r.shopId} · {dShort(r.at)}</span></span></span></td>
              <td>{k ? k.name : 'Custom'}</td>
              <td className="ix-num">{tk(r.budget)}</td>
              <td>{dayText(r.wantedBy)}</td>
              <td><ReqBadge r={r} />{r.rating ? <span className="pt-sub">{r.rating.stars} stars</span> : null}</td>
              <td><span className="pta-last">{m ? m.text : '—'}</span></td>
            </tr>
          ); })}</tbody>
        </table>
      </div>
    </section>
  );
}

export default function PtRecord() {
  const { ready, tick } = usePartners();
  const [tab, setTab] = useState('profile');
  const [review, setReview] = useState(false);
  const [sus, setSus] = useState(null);
  useEffect(() => { const t = qp('tab'); if (TABS.some((x) => x[0] === t)) setTab(t); }, []);
  const p = useMemo(() => (ready ? partnerById(qp('id')) : null), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ready) return <AdminShell active="pt-partner" title="Partner"><div style={{ minHeight: 400 }} aria-busy="true" /></AdminShell>;
  if (!p) return <AdminShell active="pt-partner" title="Partner"><div className="ix-page"><RecordHeader back="/admin/partners" backLabel="Partners" title="Partner not found" /><section className="ix-card ix-empty"><EmptyState icon="user-x" title="This partner is not here" /></section></div></AdminShell>;
  const by = byName();
  const reqs = getRequests({ partnerId: p.id });
  const flip = (key) => say(setFlag(p.id, key, !p[key], by), key === 'verified' ? (p.verified ? 'Blue tick removed' : 'Blue tick on') : (p.featured ? 'No longer featured' : 'Featured: shown first to stores'));
  const restore = async () => { if (await confirmDialog({ title: `Restore ${p.name}?`, body: 'Their profile goes public again and stores can send requests.', confirmLabel: 'Restore' })) say(restorePartner(p.id, by), 'Restored'); };
  const doSuspend = () => { if (say(suspendPartner(p.id, sus, by), `${p.name} suspended`)) setSus(null); };
  const primary = p.status === 'applied' || p.status === 'rejected' ? { label: 'Review', icon: 'user-check', onClick: () => setReview(true) }
    : p.status === 'suspended' ? { label: 'Restore', icon: 'rotate-ccw', onClick: restore } : null;
  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'ptr-' + k, label: l, count: k === 'requests' ? reqs.length || null : null, on: tab === k, onClick: () => setTab(k) }));
  const st = p.stats || {};
  return (
    <AdminShell active="pt-partner" title={p.name}>
      <style dangerouslySetInnerHTML={{ __html: PT_CSS + PTA_CSS + CSS }} />
      <div className="ix-page">
        <RecordHeader back={p.status === 'approved' || p.status === 'suspended' ? '/admin/partners' : '/admin/partners/applications'} backLabel="Partners"
          title={<span className="gc-picrow"><Pic src={p.photo} name={p.name} kind="person" size={32} /><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{p.name}{p.verified ? <Tick size={16} /> : null}</span></span>}
          badges={<><PartnerBadge p={p} />{p.status === 'approved' ? <AvailBadge a={p.availability} /> : null}</>}
          meta={<>{typeLabel(p.type)} · {p.city} · @{p.handle}</>}
          secondary={p.status === 'approved' ? [{ label: 'Public page', href: publicPath(p.handle) }] : []}
          more={[{ label: 'Email ' + p.name.split(' ')[0], href: 'mailto:' + p.email }, ...(p.status === 'approved' ? [{ label: 'Suspend…', onClick: () => setSus('') }] : [])]}
          primary={primary} />
        {p.status === 'suspended' && p.reason ? <p className="pt-note pt-note--bad"><Icon name="pause-circle" width="16" height="16" aria-hidden="true" /><span>Suspended: {p.reason}</span></p> : null}
        {p.status === 'rejected' && p.reason ? <p className="pt-note pt-note--bad"><Icon name="circle-x" width="16" height="16" aria-hidden="true" /><span>Rejected: {p.reason}</span></p> : null}
        <MetricStrip items={[
          { label: 'Profile views', value: (st.views || 0).toLocaleString('en-IN'), icon: 'eye' },
          { label: 'Requests', value: String(st.requests || 0), icon: 'inbox' },
          { label: 'Accepted', value: String(st.accepted || 0), icon: 'handshake' },
          { label: 'Rating', value: ratingOf(p.id).count ? ratingOf(p.id).avg.toFixed(1) : '—', icon: 'star' },
        ]} />
        {p.status === 'approved' ? (
          <section className="ix-card ptr-sws" aria-label="Controls">
            <Switch on={!!p.verified} label="Blue tick" sub="Shown next to the name: GridCommerce checked who they are." onFlip={() => flip('verified')} />
            <Switch on={!!p.featured} label="Featured" sub="Shown first to stores and on the creators’ page." onFlip={() => flip('featured')} />
          </section>
        ) : null}
        <div className="ix-card" style={{ padding: '0 var(--space-2)' }}><div className="ix-bar" style={{ borderBottom: 0 }}><IndexTabs tabs={tabs} label="Partner" /></div></div>
        {tab === 'profile' ? <Profile p={p} /> : null}
        {tab === 'requests' ? <Requests p={p} /> : null}
        {tab === 'history' ? (
          <section className="ix-card" aria-label="History">
            {(p.history || []).length ? <ul className="ptr-hist">{p.history.map((h, i) => <li key={i}><span>{h.text}</span><small>{h.by} · {dTime(h.at)}</small></li>)}</ul> : <div className="ix-empty"><EmptyState icon="history" title="No changes yet" /></div>}
          </section>
        ) : null}
      </div>
      {review ? <ReviewSheet key={tick} id={p.id} onClose={() => setReview(false)} /> : null}
      <Sheet open={sus != null} title={`Suspend ${p.name}`} onClose={() => setSus(null)}
        footer={<><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setSus(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid gc-btn--error" onClick={doSuspend}>Suspend</button></>}>
        <form className="pt-form" onSubmit={(e) => { e.preventDefault(); doSuspend(); }}>
          <p className="pt-muted">Their public page closes and stores can’t find them or send requests. Open requests stay; cancel them in Requests if needed.</p>
          <div><label className="gc-label" htmlFor="ptr-why">Why (the partner reads it)</label><textarea id="ptr-why" className="gc-input" rows={3} autoFocus value={sus || ''} onChange={(e) => setSus(e.target.value)} placeholder="e.g. Bought followers" /></div>
        </form>
      </Sheet>
    </AdminShell>
  );
}

const CSS = `
.ptr-sws{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.ptr-sw{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-3) var(--space-4)}
.ptr-sw+.ptr-sw{border-left:1px solid var(--border-subtle)}
.ptr-sw>span{display:flex;flex-direction:column;gap:2px;min-width:0}
.ptr-sw b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ptr-sw small{font-size:var(--text-xs);color:var(--text-muted)}
.ptr-hist{list-style:none;margin:0;padding:0}
.ptr-hist li{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.ptr-hist li:first-child{border-top:0}
.ptr-hist small{font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:640px){.ptr-sw+.ptr-sw{border-left:0;border-top:1px solid var(--border-subtle)}}
`;
