'use client';
// Grid Partners › Partners (/admin/partners; Batch E): the directory of approved and suspended partners — tabs All · Models
// · Influencers · Video creators · Suspended, search, city and niche filters. Rows: photo, name with the blue tick, type,
// city, biggest platform, from-price, requests and accepted, views, status. A row opens the partner's record
// (/admin/partner?id=). Data: lib/platform/partners.js.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShopHeader, IndexTabs, SearchField, MetricStrip } from '@/components/ui/IndexKit';
import { EmptyState } from '@/components/ui';
import { Pic } from '@/components/ui/Pic';
import { getPartners, getRequests, settings, TYPES, typeLabel, fromPrice } from '@/lib/platform/partners';
import { AdminShell } from '../AdminShell';
import { usePartners, PT_CSS, TopReach, PartnerBadge, AvailBadge, Tick, tk } from '@/screens/partners/partnerShared';
import { PTA_CSS } from './ptAdmin';

export default function PtDirectory() {
  const { ready, tick } = usePartners();
  const router = useRouter();
  const [view, setView] = useState('all');
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [niche, setNiche] = useState('');
  const all = useMemo(() => (ready ? getPartners().filter((p) => ['approved', 'suspended'].includes(p.status)) : []), [ready, tick]);
  const reqs = useMemo(() => (ready ? getRequests() : []), [ready, tick]);
  const st = ready ? settings() : { cities: [], niches: [] };
  const live = all.filter((p) => p.status === 'approved');
  const inView = (p) => (view === 'suspended' ? p.status === 'suspended' : p.status === 'approved' && (view === 'all' || p.type === view));
  const words = q.trim().toLowerCase();
  const rows = all.filter((p) => inView(p) && (!words || [p.name, p.handle, p.city, p.email, p.phone, ...(p.niches || [])].join(' ').toLowerCase().includes(words)) && (!city || p.city === city) && (!niche || (p.niches || []).includes(niche)));
  const tabs = [['all', 'All'], ...Object.entries(TYPES).map(([k, t]) => [k, t.plural]), ['suspended', 'Suspended']].map(([k, l]) => ({ key: k, id: 'ptd-' + k, label: l, count: ready ? all.filter((p) => (k === 'suspended' ? p.status === 'suspended' : p.status === 'approved' && (k === 'all' || p.type === k))).length : null, on: view === k, onClick: () => setView(k) }));
  const waiting = ready ? getPartners('applied').length : 0;
  const reqOf = (id) => reqs.filter((r) => r.partnerId === id);
  return (
    <AdminShell active="pt-directory" title="Grid Partners">
      <style dangerouslySetInnerHTML={{ __html: PT_CSS + PTA_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="users-round" title="Partners"
          about="Every approved Grid Partner (models, influencers and video creators) and the suspended ones. Open a partner to give the blue tick, feature them, suspend with a reason, see their requests and open their public page. Stores find partners in Services › Grid Partners; GridCommerce does not handle the money."
          secondary={[{ label: waiting ? `Applications (${waiting})` : 'Applications', href: '/admin/partners/applications' }]}
          more={[{ label: 'Requests', href: '/admin/partners/requests' }, { label: 'Settings', href: '/admin/partners/settings' }, { label: 'Partner app (demo)', href: '/gp-sign-in' }]} />
        {ready ? <MetricStrip items={[
          { label: 'Live partners', value: String(live.length), sub: `${live.filter((p) => p.verified).length} with the blue tick`, icon: 'users-round' },
          { label: 'Waiting for review', value: String(waiting), href: '/admin/partners/applications', icon: 'hourglass' },
          { label: 'Open requests', value: String(reqs.filter((r) => ['sent', 'accepted'].includes(r.status)).length), href: '/admin/partners/requests', icon: 'inbox' },
          { label: 'Profile views', value: live.reduce((a, p) => a + ((p.stats && p.stats.views) || 0), 0).toLocaleString('en-IN'), icon: 'eye' },
        ]} /> : null}
        <section className="ix-card" aria-label="Partners">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Partner type" /></div>
          <div className="pta-filters">
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, link, phone or email" />
            <select className="gc-input gc-select" value={city} onChange={(e) => setCity(e.target.value)} aria-label="City"><option value="">Any city</option>{st.cities.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            <select className="gc-input gc-select" value={niche} onChange={(e) => setNiche(e.target.value)} aria-label="Niche"><option value="">Any niche</option>{st.niches.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          </div>
          {!ready ? <div style={{ minHeight: 240 }} aria-busy="true" /> : rows.length ? (<>
            <ul className="ix-plist">{rows.map((p) => (
              <li key={p.id}><Link href={'/admin/partner?id=' + p.id} className="ix-pitem ix-pitem--thumb">
                <span style={{ gridRow: 'span 2' }}><Pic src={p.photo} name={p.name} kind="person" /></span>
                <span className="ix-pitem__top"><b>{p.name}</b>{p.status === 'suspended' ? <PartnerBadge p={p} /> : <AvailBadge a={p.availability} />}</span>
                <span className="ix-pitem__mid">{typeLabel(p.type)} · {p.city} · {reqOf(p.id).length} request{reqOf(p.id).length === 1 ? '' : 's'}</span>
              </Link></li>
            ))}</ul>
            <div className="ix-table-wrap">
              <table className="ix-table">
                <caption className="sr-only">Partners</caption>
                <thead><tr><th scope="col">Partner</th><th scope="col">Type</th><th scope="col">Followers</th><th scope="col" className="ix-num">From</th><th scope="col" className="ix-num">Requests</th><th scope="col" className="ix-num">Views</th><th scope="col">Status</th></tr></thead>
                <tbody>{rows.map((p) => { const rs = reqOf(p.id); return (
                  <tr key={p.id} onClick={(e) => { if (!e.target.closest('a,button')) router.push('/admin/partner?id=' + p.id); }} style={{ cursor: 'pointer' }}>
                    <td><span className="gc-picrow"><Pic src={p.photo} name={p.name} kind="person" size={32} /><span><Link href={'/admin/partner?id=' + p.id} className="ix-strong" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{p.name}{p.verified ? <Tick size={14} /> : null}</Link><span className="pt-sub">{p.city} · {(p.niches || []).slice(0, 2).join(', ')}{p.featured ? ' · Featured' : ''}</span></span></span></td>
                    <td>{typeLabel(p.type)}</td>
                    <td><TopReach p={p} /></td>
                    <td className="ix-num">{fromPrice(p) ? tk(fromPrice(p)) : '—'}</td>
                    <td className="ix-num">{rs.length}<span className="pt-sub">{rs.filter((r) => ['accepted', 'done'].includes(r.status)).length} accepted</span></td>
                    <td className="ix-num">{((p.stats && p.stats.views) || 0).toLocaleString('en-IN')}</td>
                    <td>{p.status === 'suspended' ? <PartnerBadge p={p} /> : <AvailBadge a={p.availability} />}</td>
                  </tr>
                ); })}</tbody>
              </table>
            </div>
          </>) : <div className="ix-empty"><EmptyState icon="users-round" title="No partners here" body="Try another tab or filter." /></div>}
          {ready ? <div className="ix-foot"><span>{rows.length} partner{rows.length === 1 ? '' : 's'}</span></div> : null}
        </section>
      </div>
    </AdminShell>
  );
}
