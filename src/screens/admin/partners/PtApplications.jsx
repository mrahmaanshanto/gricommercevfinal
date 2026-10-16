'use client';
// Grid Partners › Applications (/admin/partners/applications?id=; Batch E): creators who applied — photo, type, biggest
// platform, standards passed (n of 5), applied when. Tabs Waiting · Rejected. A row opens the review side panel with the
// minimum standards checklist, platforms, samples and rate card: Approve (only when every standard is met) or Reject with a
// reason the creator reads. Data: lib/platform/partners.js.

import React, { useEffect, useMemo, useState } from 'react';
import { ShopHeader, IndexTabs } from '@/components/ui/IndexKit';
import { EmptyState } from '@/components/ui';
import { Pic } from '@/components/ui/Pic';
import { getPartners, standardsPassed, typeLabel } from '@/lib/platform/partners';
import { AdminShell } from '../AdminShell';
import { usePartners, PT_CSS, TopReach, PartnerBadge, qp, dTime } from '@/screens/partners/partnerShared';
import { ReviewSheet, PTA_CSS } from './ptAdmin';

export default function PtApplications() {
  const { ready, tick } = usePartners();
  const [view, setView] = useState('applied');
  const [open, setOpen] = useState('');
  useEffect(() => { const id = qp('id'); if (id) setOpen(id); }, []);
  const all = useMemo(() => (ready ? getPartners().filter((p) => ['applied', 'rejected'].includes(p.status)).sort((a, b) => (b.appliedAt || 0) - (a.appliedAt || 0)) : []), [ready, tick]);
  const rows = all.filter((p) => p.status === view);
  const tabs = [['applied', 'Waiting'], ['rejected', 'Rejected']].map(([k, l]) => ({ key: k, id: 'pta-' + k, label: l, count: ready ? all.filter((p) => p.status === k).length : null, on: view === k, onClick: () => setView(k) }));
  const show = (id) => { setOpen(id); const u = new URL(window.location.href); u.searchParams.set('id', id); window.history.replaceState(null, '', u); };
  const close = () => { setOpen(''); const u = new URL(window.location.href); u.searchParams.delete('id'); window.history.replaceState(null, '', u); };
  return (
    <AdminShell active="pt-applications" title="Grid Partners applications">
      <style dangerouslySetInnerHTML={{ __html: PT_CSS + PTA_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="user-check" title="Applications"
          about="Models, influencers and video creators who want to join Grid Partners. Check each against the minimum standards (followers by type, samples, phone checked, ID checked, a rate card; set in Grid Partners › Settings). Approve makes the profile public and lets stores send requests. Reject needs a reason: the creator reads it and can send the profile again."
          secondary={[{ label: 'Standards', href: '/admin/partners/settings' }]} more={[{ label: 'Join page (creators)', href: '/grid-partners/join' }]} />
        <section className="ix-card" aria-label="Applications">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Applications" /></div>
          {!ready ? <div style={{ minHeight: 200 }} aria-busy="true" /> : rows.length ? (<>
            <ul className="ix-plist">{rows.map((p) => { const s = standardsPassed(p); return (
              <li key={p.id}><button type="button" className="ix-pitem ix-pitem--thumb" style={{ width: '100%', border: 0, background: 'none', textAlign: 'left', font: 'inherit' }} onClick={() => show(p.id)}>
                <span style={{ gridRow: 'span 2' }}><Pic src={p.photo} name={p.name} kind="person" /></span>
                <span className="ix-pitem__top"><b>{p.name}</b><span className={'pta-pass ' + (s.n === s.of ? 'is-ok' : 'is-bad')}>{s.n}/{s.of}</span></span>
                <span className="ix-pitem__mid">{typeLabel(p.type)} · {p.city} · {dTime(p.appliedAt)}</span>
              </button></li>
            ); })}</ul>
            <div className="ix-table-wrap">
              <table className="ix-table">
                <caption className="sr-only">Applications</caption>
                <thead><tr><th scope="col">Creator</th><th scope="col">Type</th><th scope="col">Followers</th><th scope="col">Standards</th><th scope="col">Applied</th><th scope="col">Status</th></tr></thead>
                <tbody>{rows.map((p) => { const s = standardsPassed(p); return (
                  <tr key={p.id} onClick={(e) => { if (!e.target.closest('a,button')) show(p.id); }} style={{ cursor: 'pointer' }}>
                    <td><span className="gc-picrow"><Pic src={p.photo} name={p.name} kind="person" size={32} /><span><button type="button" style={{ all: 'unset', cursor: 'pointer', fontWeight: 'var(--weight-medium)', color: 'var(--text-heading)' }} onClick={() => show(p.id)}>{p.name}</button><span className="pt-sub">{p.city} · @{p.handle}</span></span></span></td>
                    <td>{typeLabel(p.type)}</td>
                    <td><TopReach p={p} /></td>
                    <td><span className={'pta-pass ' + (s.n === s.of ? 'is-ok' : 'is-bad')}>{s.n} of {s.of}</span>{p.status === 'rejected' && p.reason ? <span className="pt-sub" style={{ maxWidth: 280, whiteSpace: 'normal' }}>{p.reason}</span> : null}</td>
                    <td>{dTime(p.appliedAt)}</td>
                    <td><PartnerBadge p={p} /></td>
                  </tr>
                ); })}</tbody>
              </table>
            </div>
          </>) : <div className="ix-empty"><EmptyState icon="user-check" title={view === 'applied' ? 'No applications waiting' : 'No rejected applications'} body="New applications from the Join page show here." /></div>}
          {ready ? <div className="ix-foot"><span>{rows.length} application{rows.length === 1 ? '' : 's'}</span></div> : null}
        </section>
      </div>
      <ReviewSheet key={open + tick} id={open} onClose={close} />
    </AdminShell>
  );
}
