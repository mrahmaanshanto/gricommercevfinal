'use client';
// ptAdmin — what the super admin's Grid Partners pages share (Batch E): who is signed in (staff name for the history), the
// standards checklist, the review side panel (ReviewSheet: photo, type, platforms, samples, rate card, the standards
// checklist, Approve or Reject with a reason the creator reads) and the CSS. Data: lib/platform/partners.js; the profile
// parts come from the merchant side's screens/partners/partnerShared.jsx.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { Sheet } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';
import { staff } from '@/lib/platform/store';
import { partnerById, checkStandards, approvePartner, rejectPartner, typeLabel, netLabel, followersText } from '@/lib/platform/partners';
import { Avatar, Tick, PartnerBadge, Samples, Packages, say, dTime } from '@/screens/partners/partnerShared';

export const byName = () => { try { return staff().name; } catch { return 'Staff'; } };

export function Standards({ p }) {
  const list = checkStandards(p);
  return (
    <ul className="pt-check" aria-label="Minimum standards">
      {list.map((c) => <li key={c.key} className={c.ok ? 'is-ok' : 'is-bad'}><Icon name={c.ok ? 'circle-check' : 'circle-x'} width="16" height="16" aria-hidden="true" /><span><b>{c.label}</b><small>{c.detail}</small></span></li>)}
    </ul>
  );
}

/** The application review panel. */
export function ReviewSheet({ id, onClose }) {
  const p = id ? partnerById(id) : null;
  const [rej, setRej] = useState(null);
  useEffect(() => { setRej(null); }, [id]);
  if (!p) return null;
  const ok = checkStandards(p).every((c) => c.ok);
  const approve = () => { if (say(approvePartner(p.id, byName()), `${p.name} approved: stores can find them now`)) onClose(); };
  const reject = () => { if (say(rejectPartner(p.id, rej, byName()), `${p.name} rejected: they see why`)) onClose(); };
  const waiting = p.status === 'applied';
  const foot = !waiting ? <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={onClose}>Close</button>
    : rej != null ? <><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setRej(null)}>Back</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid gc-btn--error" onClick={reject}>Reject</button></>
      : <><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setRej('')}>Reject…</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" disabled={!ok} onClick={approve}><Icon name="check" width="14" height="14" aria-hidden="true" />Approve</button></>;
  return (
    <Sheet open title={`Review · ${p.name}`} onClose={onClose} footer={foot}>
      <div className="pt-form">
        <div className="pta-who">
          <Avatar p={p} size={64} />
          <span><b>{p.name}{p.verified ? <Tick size={14} /> : null}</b><small>{typeLabel(p.type)} · {p.city} · @{p.handle}</small><small>Applied {dTime(p.appliedAt)}</small></span>
          <PartnerBadge p={p} />
        </div>
        {p.status === 'rejected' && p.reason ? <p className="pt-note pt-note--bad"><Icon name="circle-x" width="16" height="16" aria-hidden="true" /><span>Rejected: {p.reason}</span></p> : null}
        <section className="pta-sec" aria-labelledby="pta-std">
          <h3 id="pta-std">Minimum standards</h3>
          <Standards p={p} />
          {!ok && waiting ? <p className="gc-help" style={{ margin: 0 }}>Approve opens once every standard is met. Reject with what to fix.</p> : null}
        </section>
        {rej != null ? (
          <div className="pta-sec">
            <label className="gc-label" htmlFor="pta-why" style={{ margin: 0 }}>Why (the creator reads it)</label>
            <textarea id="pta-why" className="gc-input" rows={3} autoFocus value={rej} onChange={(e) => setRej(e.target.value)} placeholder="e.g. Add at least 3 samples of your work and an Instagram with 5,000+ followers." />
          </div>
        ) : null}
        <section className="pta-sec" aria-labelledby="pta-plat">
          <h3 id="pta-plat">Platforms</h3>
          <ul className="pta-plat">{(p.platforms || []).map((x) => <li key={x.net + x.handle}><BrandLogo brand={x.net} size={24} decorative /><span><b>{followersText(x.followers)}</b> on {netLabel(x.net)}{x.handle ? ' · @' + x.handle : ''}</span>{x.url ? <a href={x.url} target="_blank" rel="noopener noreferrer" className="bl-link">Open</a> : null}</li>)}</ul>
        </section>
        {p.bio ? <section className="pta-sec"><h3>About</h3><p className="pp-bio">{p.bio}</p><p className="pt-muted">{(p.niches || []).join(', ')}{(p.languages || []).length ? ' · ' + p.languages.join(', ') : ''}</p></section> : null}
        <section className="pta-sec" aria-labelledby="pta-smp"><h3 id="pta-smp">Samples</h3><Samples p={p} /></section>
        <section className="pta-sec" aria-labelledby="pta-rate"><h3 id="pta-rate">Rate card</h3><Packages p={p} compact /></section>
        <section className="pta-sec"><h3>Contact (private)</h3><p className="pt-muted">{p.phone}{p.phoneVerified ? ' · checked' : ' · not checked'} · {p.email}</p></section>
        <Link href={'/admin/partner?id=' + p.id} className="bl-link" style={{ fontSize: 'var(--text-sm)' }}>Open the full record</Link>
      </div>
    </Sheet>
  );
}

export const PTA_CSS = `
.pta-who{display:flex;align-items:center;gap:var(--space-3)}
.pta-who>span:not([class]){flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.pta-who b{display:flex;align-items:center;gap:4px;font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pta-who small{font-size:var(--text-xs);color:var(--text-muted)}
.pta-sec{display:flex;flex-direction:column;gap:var(--space-2)}
.pta-sec h3{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pta-sec p{margin:0}
.pta-plat{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}
.pta-plat li{display:flex;align-items:center;gap:10px;font-size:var(--text-sm);color:var(--text-body)}
.pta-plat li span{flex:1;min-width:0}
.pta-plat b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pta-pass{font-family:var(--font-data);font-weight:var(--weight-semibold)}
.pta-pass.is-bad{color:var(--text-danger)}
.pta-pass.is-ok{color:var(--text-success)}
.pta-filters{display:flex;flex-wrap:wrap;gap:var(--space-2);padding:var(--space-2) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.pta-filters>.ix-search{flex:2 1 240px}
.pta-filters select{flex:1 1 150px;width:auto;min-width:0}
.pta-last{display:block;max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-xs);color:var(--text-muted)}
`;
