'use client';
// Verification (/admin/kyc) — the business verification queue (SA-F3): every store's KYC state as one list, laid out like
// All merchants. Views: To review (oldest first, the work) · Rejected · Verified · Not verified. A row opens the store's
// verification in a side panel (kycShared.jsx › KycSheet): the numbers and documents, Approve, or Reject with a reason
// the owner sees in Settings › Business verification. "Ask the owner" sends a store a notice with the link.
// Data: lib/platform (shops.js › kycQueue, reviewKyc). Worked out after the saved data loads.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField } from '@/components/ui/IndexKit';
import { dmy } from '@/lib/platform/util';
import { kycQueue } from '@/lib/platform/shops';
import { subState, isLiveStore } from '@/lib/platform/billing';
import { ownerOf } from '@/lib/admin/merchants';
import { AdminShell, usePlatform } from '../AdminShell';
import { Pic } from '@/components/ui/Pic';
import { KycBadge, KycSheet } from './kycShared';

const VIEWS = [['submitted', 'To review'], ['rejected', 'Rejected'], ['verified', 'Verified'], ['none', 'Not verified']];
const CSS = `
.kyc-bar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:8px;border-bottom:1px solid var(--border-subtle)}
.kyc-bar .ix-search{flex:1 1 240px;max-width:360px}
.kyc-data{font-family:var(--font-data);color:var(--text-heading)}
.kyc-name{display:flex;flex-direction:column;min-width:0;max-width:240px}
.kyc-name small{font-size:var(--text-xs);color:var(--text-muted)}
.kyc-skel{height:360px;border-radius:var(--radius-xl);background:var(--surface-card)}
`;

export default function Verification() {
  const { db, t, live } = usePlatform();
  const [view, setView] = useState('submitted');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState('');
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get('view');
    if (VIEWS.some(([k]) => k === v)) setView(v);
  }, []);
  const pickView = (v) => {
    setView(v);
    const p = new URLSearchParams(window.location.search);
    if (v === 'submitted') p.delete('view'); else p.set('view', v);
    const s = p.toString();
    window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
  };

  // stores that are live (not being set up, cancelled or archived)
  const all = live ? kycQueue(db).filter((x) => isLiveStore(subState(db, x.shop.id, t))) : [];
  const counts = Object.fromEntries(VIEWS.map(([k]) => [k, all.filter((x) => x.kyc.state === k).length]));
  const s = q.trim().toLowerCase();
  let rows = all.filter((x) => x.kyc.state === view && (!s || [x.shop.name, x.shop.id, '#' + x.shop.id, ownerOf(x.shop).name, x.kyc.licence, x.kyc.tin].join(' ').toLowerCase().includes(s)));
  if (view !== 'submitted') rows = rows.slice().sort((a, b) => (b.kyc.reviewedAt || b.shop.createdAt) - (a.kyc.reviewedAt || a.shop.createdAt));
  const shop = openId && live ? db.shops.find((x) => x.id === openId) : null;
  const label = (VIEWS.find(([k]) => k === view) || [])[1];

  return (
    <AdminShell active="kyc" title="Verification">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ix-page">
        <ShopHeader icon="shield-check" title="Verification"
          about="Business verification (KYC): each store's trade licence, TIN, BIN and the owner's NID with photos. Review the ones waiting, approve or reject with a reason the owner sees. Verified stores can use their own SMS sender name and online payment gateways." />
        {!live ? <div className="kyc-skel" aria-busy="true" aria-label="Loading verifications" /> : (
          <section className="ix-card" aria-label={label}>
            <div className="ix-bar"><IndexTabs label="Verification views" tabs={VIEWS.map(([k, l]) => ({ key: k, id: 'kyc-tab-' + k, label: l, count: counts[k], on: view === k, onClick: () => pickView(k) }))} /></div>
            <div className="kyc-bar"><SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search store, owner, licence or TIN" onDone={() => setQ('')} /></div>
            {!rows.length ? (
              <div className="ix-empty">
                {s ? <EmptyState title="No store matches." actionLabel="Clear search" onAction={() => setQ('')} />
                  : <EmptyState icon="shield-check" title={view === 'submitted' ? 'Nothing waits for review.' : `No store in ${label}.`} />}
              </div>
            ) : (
              <>
                <ul className="ix-plist" aria-label={label}>
                  {rows.map(({ shop: sh, kyc: k }) => (
                    <li key={sh.id}>
                      <button type="button" className="ix-pitem ix-pitem--thumb" style={{ width: '100%', textAlign: 'left', border: 0, background: 'none', font: 'inherit' }} onClick={() => setOpenId(sh.id)}>
                        <span style={{ gridRow: 'span 3' }}><Pic src={sh.logo} name={sh.name} kind="logo" /></span>
                        <span className="ix-pitem__top"><b>{sh.name}</b><KycBadge k={k} /></span>
                        <span className="ix-pitem__mid"><span className="ix-id">#{sh.id}</span> · {ownerOf(sh).name}</span>
                        <span className="ix-pitem__mid">{k.state === 'submitted' ? 'Sent ' + dmy(k.submittedAt) : k.reviewedAt ? dmy(k.reviewedAt) + ' · ' + k.reviewedBy : 'Nothing sent'}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="ix-table-wrap">
                  <table className="ix-table gc-table--keep">
                    <caption className="sr-only">{label}</caption>
                    <thead>
                      <tr>
                        <th scope="col">Store</th>
                        <th scope="col">Owner</th>
                        <th scope="col">Trade licence</th>
                        <th scope="col">TIN</th>
                        <th scope="col">{view === 'submitted' ? 'Sent' : view === 'none' ? 'Registered' : 'Decided'}</th>
                        <th scope="col">State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(({ shop: sh, kyc: k }) => (
                        <tr key={sh.id} tabIndex={0} onClick={() => setOpenId(sh.id)} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) setOpenId(sh.id); }}>
                          <td><span className="gc-picrow"><Pic src={sh.logo} name={sh.name} kind="logo" /><span className="kyc-name"><Link href={'/admin/merchant?id=' + sh.id} className="ix-strong" onClick={(e) => e.stopPropagation()}>{sh.name}</Link><small>#{sh.id}</small></span></span></td>
                          <td>{k.ownerName || ownerOf(sh).name}</td>
                          <td><span className="kyc-data">{k.licence || '—'}</span></td>
                          <td><span className="kyc-data">{k.tin || '—'}</span></td>
                          <td className="ix-muted">{k.state === 'submitted' ? dmy(k.submittedAt) : k.state === 'none' ? dmy(sh.createdAt) : k.reviewedAt ? `${dmy(k.reviewedAt)} · ${k.reviewedBy}` : '—'}</td>
                          <td><KycBadge k={k} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        )}
      </div>
      {shop ? <KycSheet key={shop.id} shop={shop} close={() => setOpenId('')} /> : null}
    </AdminShell>
  );
}
