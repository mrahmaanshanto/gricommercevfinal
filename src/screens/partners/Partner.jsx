'use client';
// A Grid Partner's profile for a store (/partner?h=<handle>; Batch E): the same profile as the public page (cover, photo,
// blue tick, platforms with followers, about, samples, rate card, what stores said) plus "Request a quote": a side panel
// to pick a package (or a custom job), write the brief, budget and the date it is wanted by. The request goes to the
// partner through Grid Partners; once they accept, both sides see each other's phone and email (/partner-requests).
// No contact details here. Only approved partners show. Data: lib/platform/partners.js.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState, Sheet, PhoneActionBar } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { publicPartner, sendRequest, getRequests, addView, fromPrice, packageOf, typeLabel, SELF_SHOP, SELF_NAME, SELF_CONTACT, now } from '@/lib/platform/partners';
import { navigate } from '@/runtime/routes';
import { SvcFrame } from '../services/svcShared';
import { usePartners, PT_CSS, PartnerProfile, ReqBadge, tk, qp } from './partnerShared';

/** The "Request a quote" side panel. */
export function QuoteSheet({ p, open, pkgId, onClose }) {
  const [f, setF] = useState({ packageId: '', brief: '', budget: '', wantedBy: '' });
  const [err, setErr] = useState({});
  const [min, setMin] = useState('');
  useEffect(() => {
    if (!open) return;
    const pkg = packageOf(p, pkgId) || null;
    setF({ packageId: pkg ? pkg.id : '', brief: '', budget: pkg ? String(pkg.price) : '', wantedBy: '' });
    setErr({});
    setMin(new Date(now()).toISOString().slice(0, 10));
  }, [open, pkgId]); // eslint-disable-line react-hooks/exhaustive-deps
  const pick = (id) => { const pkg = packageOf(p, id); setF((x) => ({ ...x, packageId: id, budget: pkg ? String(pkg.price) : x.budget })); };
  const send = () => {
    const r = sendRequest({ shopId: SELF_SHOP, shopName: SELF_NAME, shopContact: SELF_CONTACT, partnerId: p.id, ...f });
    if (r.ok === false) { setErr({ [r.field || 'form']: r.error }); toast(r.error, { tone: 'error' }); return; }
    toast(`Request sent to ${p.name}`);
    onClose();
    navigate('/partner-requests?id=' + r.request.id);
  };
  return (
    <Sheet open={open} title={`Request a quote from ${p.name}`} onClose={onClose}
      footer={<><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={onClose}>Cancel</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={send}><Icon name="send" width="14" height="14" aria-hidden="true" />Send request</button></>}>
      <form className="pt-form" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <legend className="gc-label">What you want</legend>
          {(p.packages || []).map((k) => (
            <label key={k.id} className="pt-radio"><input type="radio" name="pq-pkg" className="gc-check gc-check--radio" checked={f.packageId === k.id} onChange={() => pick(k.id)} /><span><b>{k.name}</b><small>{tk(k.price)}{k.includes && k.includes.length ? ' · ' + k.includes.slice(0, 2).join(', ') : ''}</small></span></label>
          ))}
          <label className="pt-radio"><input type="radio" name="pq-pkg" className="gc-check gc-check--radio" checked={!f.packageId} onChange={() => setF({ ...f, packageId: '' })} /><span><b>Something else</b><small>Describe it below and give your budget</small></span></label>
        </fieldset>
        <div>
          <label className="gc-label" htmlFor="pq-brief">Your brief</label>
          <textarea id="pq-brief" className="gc-input" rows={5} value={f.brief} onChange={(e) => setF({ ...f, brief: e.target.value })} placeholder="What to make, which products, where it will be posted" aria-invalid={!!err.brief} />
          {err.brief ? <p className="gc-help gc-help--error" role="alert">{err.brief}</p> : null}
        </div>
        <div className="pt-grid2">
          <div>
            <label className="gc-label" htmlFor="pq-budget">Budget (৳)</label>
            <input id="pq-budget" className="gc-input" inputMode="numeric" value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value })} aria-invalid={!!err.budget} />
            {err.budget ? <p className="gc-help gc-help--error" role="alert">{err.budget}</p> : null}
          </div>
          <div>
            <label className="gc-label" htmlFor="pq-date">Wanted by</label>
            <input id="pq-date" type="date" className="gc-input" min={min || undefined} value={f.wantedBy} onChange={(e) => setF({ ...f, wantedBy: e.target.value })} aria-invalid={!!err.wantedBy} />
            {err.wantedBy ? <p className="gc-help gc-help--error" role="alert">{err.wantedBy}</p> : null}
          </div>
        </div>
        <p className="pt-note"><Icon name="lock" width="16" height="16" aria-hidden="true" /><span>Your phone and email are shared only if {p.name.split(' ')[0]} accepts. You agree the work and pay the partner directly.</span></p>
      </form>
    </Sheet>
  );
}

const CSS = `
.pt-radio{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border:1px solid var(--border-field);border-radius:var(--radius-lg);cursor:pointer}
.pt-radio:has(input:checked){border-color:var(--primary);background:var(--fill-primary-soft)}
.pt-radio input{margin-top:2px}
.pt-radio b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.pt-radio small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.pt-mine{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.pt-mine li{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);padding:8px 0;border-top:1px solid var(--border-subtle)}
.pt-mine li:first-child{border-top:0}
.pt-mine a{display:flex;flex-direction:column;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-decoration:none}
.pt-mine small{font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
`;

export default function Partner() {
  const { ready, tick } = usePartners();
  const [ask, setAsk] = useState(null);         // null = closed, '' = custom, else a package id
  const p = ready ? publicPartner(qp('h')) : null;
  useEffect(() => { if (p) addView(p.id); }, [p && p.id]); // eslint-disable-line react-hooks/exhaustive-deps
  void tick;
  if (!ready) return <SvcFrame gate="partners" screen="Partner" active="gp-profile" page="Partner" css={PT_CSS}><div style={{ minHeight: 400 }} aria-busy="true" /></SvcFrame>;
  if (!p) {
    return (
      <SvcFrame gate="partners" screen="Partner" active="gp-profile" page="Partner" css={PT_CSS} narrow>
        <RecordHeader back="/partners" backLabel="Grid Partners" title="Partner not found" />
        <section className="ix-card ix-empty"><EmptyState icon="user-x" title="This profile is not public" body="The partner may be away or not approved yet." actionLabel="See all partners" onAction={() => navigate('/partners')} /></section>
      </SvcFrame>
    );
  }
  const mine = getRequests({ shopId: SELF_SHOP, partnerId: p.id });
  const waiting = mine.find((r) => r.status === 'sent');
  const fp = fromPrice(p);
  const action = waiting
    ? <Link href={'/partner-requests?id=' + waiting.id} className="ix-btn"><Icon name="clock" width="16" height="16" aria-hidden="true" />Request waiting</Link>
    : <button type="button" className="ix-btn ix-btn--primary" onClick={() => setAsk('')}><Icon name="send" width="16" height="16" aria-hidden="true" />Request a quote</button>;
  return (
    <SvcFrame gate="partners" screen="Partner" active="gp-profile" page={p.name} css={PT_CSS + CSS}
      after={<>
        <QuoteSheet p={p} open={ask != null} pkgId={ask} onClose={() => setAsk(null)} />
        {!waiting ? <PhoneActionBar label="Request a quote" note={fp ? <>From <b>{tk(fp)}</b></> : null}><button type="button" className="gc-btn gc-btn--solid" onClick={() => setAsk('')}>Request a quote</button></PhoneActionBar> : null}
      </>}>
      <RecordHeader back="/partners" backLabel="Grid Partners" title={p.name}
        about="A Grid Partner's profile: their platforms and followers, sample work and rate card. Request a quote sends your brief to the partner; once they accept you both see each other's phone and email and agree the work directly."
        secondary={[{ label: 'Public page', href: '/p?h=' + p.handle }]} />
      <PartnerProfile p={p} action={action}
        side={mine.length ? (
          <section className="ix-card pt-pad" aria-labelledby="pp-mine">
            <h2 id="pp-mine">Your requests</h2>
            <ul className="pt-mine">{mine.slice(0, 4).map((r) => <li key={r.id}><Link href={'/partner-requests?id=' + r.id}>{r.id}<small>{packageOf(p, r.packageId) ? packageOf(p, r.packageId).name : 'Custom'} · {tk(r.budget)}</small></Link><ReqBadge r={r} /></li>)}</ul>
          </section>
        ) : null}
        onPick={(k) => setAsk(k.id)} />
    </SvcFrame>
  );
}
