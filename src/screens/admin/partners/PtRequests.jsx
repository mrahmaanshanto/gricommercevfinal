'use client';
// Grid Partners › Requests (/admin/partners/requests?id=; Batch E): every store ↔ partner request, read-only (GridCommerce
// does not take part in the deal). Tabs Waiting · Accepted · Done · Closed · All, search. A request opens in a side panel
// with the brief and the conversation; Cancel (reason required, both sides read it) is for abuse only.
// Data: lib/platform/partners.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { ShopHeader, IndexTabs, SearchField } from '@/components/ui/IndexKit';
import { EmptyState, Sheet } from '@/components/ui';
import { Pic } from '@/components/ui/Pic';
import { getRequests, requestById, partnerById, packageOf, lastMessage, cancelRequest, typeLabel } from '@/lib/platform/partners';
import { AdminShell } from '../AdminShell';
import { usePartners, PT_CSS, ReqBadge, Thread, Tick, tk, qp, dShort, dayText, say, PtStars } from '@/screens/partners/partnerShared';
import { PTA_CSS, byName } from './ptAdmin';

const VIEWS = [['sent', 'Waiting', (r) => r.status === 'sent'], ['accepted', 'Accepted', (r) => r.status === 'accepted'], ['done', 'Done', (r) => r.status === 'done'], ['closed', 'Closed', (r) => ['declined', 'cancelled'].includes(r.status)], ['all', 'All', () => true]];

function ReqSheet({ id, onClose }) {
  const r = id ? requestById(id) : null;
  const [why, setWhy] = useState(null);
  useEffect(() => { setWhy(null); }, [id]);
  if (!r) return null;
  const p = partnerById(r.partnerId) || { name: 'Partner', type: 'creator', handle: '' };
  const k = packageOf(p, r.packageId);
  const open = ['sent', 'accepted'].includes(r.status);
  const cancel = () => { if (say(cancelRequest(r.id, why, byName()), 'Request cancelled: both sides see why')) setWhy(null); };
  const foot = !open ? <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={onClose}>Close</button>
    : why != null ? <><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setWhy(null)}>Back</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid gc-btn--error" onClick={cancel}>Cancel request</button></>
      : <><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setWhy('')}>Cancel for abuse…</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={onClose}>Close</button></>;
  return (
    <Sheet open title={`${r.id} · ${r.shopName} → ${p.name}`} onClose={onClose} footer={foot}>
      <div className="pt-form">
        <div className="pta-who">
          <Pic src={p.photo} name={p.name} kind="person" size={44} />
          <span><b>{p.name}{p.verified ? <Tick size={14} /> : null}</b><small>{typeLabel(p.type)} · <Link href={'/admin/partner?id=' + p.id} className="bl-link">record</Link></small></span>
          <ReqBadge r={r} />
        </div>
        <div className="pt-facts">
          <div><span>Store</span><b>{r.shopName} · #{r.shopId}</b></div>
          <div><span>Package</span><b>{k ? k.name : 'Custom'}</b></div>
          <div><span>Budget</span><b>{tk(r.budget)}</b></div>
          <div><span>Wanted by</span><b>{dayText(r.wantedBy)}</b></div>
        </div>
        <p className="pt-muted">{r.contactShared ? 'Contact details were shared when the partner accepted.' : 'No contact details shared yet.'}</p>
        {r.rating ? <p className="pt-note pt-note--ok"><Icon name="star" width="16" height="16" aria-hidden="true" /><span><PtStars value={r.rating.stars} size={12} /> {r.rating.text}</span></p> : null}
        {why != null ? (
          <div><label className="gc-label" htmlFor="ptq-why">Why (the store and the partner read it)</label><textarea id="ptq-why" className="gc-input" rows={3} autoFocus value={why} onChange={(e) => setWhy(e.target.value)} placeholder="e.g. The brief asks for fake reviews" /></div>
        ) : null}
        <h3 className="pta-sec" style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>Conversation</h3>
        <Thread r={r} me="none" />
      </div>
    </Sheet>
  );
}

export default function PtRequests() {
  const { ready, tick } = usePartners();
  const [view, setView] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState('');
  useEffect(() => { const id = qp('id'); if (id) setOpen(id); }, []);
  const all = useMemo(() => (ready ? getRequests() : []), [ready, tick]);
  const words = q.trim().toLowerCase();
  const test = (VIEWS.find((v) => v[0] === view) || VIEWS[4])[2];
  const pOf = (r) => partnerById(r.partnerId) || { name: 'Partner', type: 'creator' };
  const rows = all.filter((r) => test(r) && (!words || [r.id, r.shopName, r.brief, pOf(r).name].join(' ').toLowerCase().includes(words)));
  const tabs = VIEWS.map(([k, l, fn]) => ({ key: k, id: 'ptq-' + k, label: l, count: ready ? all.filter(fn).length : null, on: view === k, onClick: () => setView(k) }));
  const show = (id) => { setOpen(id); const u = new URL(window.location.href); u.searchParams.set('id', id); window.history.replaceState(null, '', u); };
  const close = () => { setOpen(''); const u = new URL(window.location.href); u.searchParams.delete('id'); window.history.replaceState(null, '', u); };
  return (
    <AdminShell active="pt-requests" title="Grid Partners requests">
      <style dangerouslySetInnerHTML={{ __html: PT_CSS + PTA_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="inbox" title="Requests"
          about="Every request a store sent to a Grid Partner, with its conversation. GridCommerce only connects the two sides: the work and the payment are agreed between them. Cancel a request only for abuse (fake reviews, spam, a suspended partner); both sides read the reason." />
        <section className="ix-card" aria-label="Requests">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Requests" /></div>
          <div className="pta-filters"><SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search store, partner or request" /></div>
          {!ready ? <div style={{ minHeight: 200 }} aria-busy="true" /> : rows.length ? (<>
            <ul className="ix-plist">{rows.map((r) => { const p = pOf(r); return (
              <li key={r.id}><button type="button" className="ix-pitem ix-pitem--thumb" style={{ width: '100%', border: 0, background: 'none', textAlign: 'left', font: 'inherit' }} onClick={() => show(r.id)}>
                <span style={{ gridRow: 'span 2' }}><Pic src={p.photo} name={p.name} kind="person" /></span>
                <span className="ix-pitem__top"><b>{p.name}</b><ReqBadge r={r} /></span>
                <span className="ix-pitem__mid">{r.shopName} · {tk(r.budget)} · {r.id}</span>
              </button></li>
            ); })}</ul>
            <div className="ix-table-wrap">
              <table className="ix-table">
                <caption className="sr-only">Requests</caption>
                <thead><tr><th scope="col">Partner</th><th scope="col">Store</th><th scope="col">Request</th><th scope="col" className="ix-num">Budget</th><th scope="col">Status</th><th scope="col">Last message</th></tr></thead>
                <tbody>{rows.map((r) => { const p = pOf(r); const k = packageOf(p, r.packageId); const m = lastMessage(r); return (
                  <tr key={r.id} onClick={(e) => { if (!e.target.closest('a,button')) show(r.id); }} style={{ cursor: 'pointer' }}>
                    <td><span className="gc-picrow"><Pic src={p.photo} name={p.name} kind="person" size={32} /><span><button type="button" style={{ all: 'unset', cursor: 'pointer', fontWeight: 'var(--weight-medium)', color: 'var(--text-heading)' }} onClick={() => show(r.id)}>{p.name}</button><span className="pt-sub">{typeLabel(p.type)}</span></span></span></td>
                    <td><span className="gc-picrow"><Pic name={r.shopName} kind="logo" size={28} /><span>{r.shopName}<span className="pt-sub">#{r.shopId}</span></span></span></td>
                    <td>{r.id}<span className="pt-sub">{k ? k.name : 'Custom'} · {dShort(r.at)}</span></td>
                    <td className="ix-num">{tk(r.budget)}</td>
                    <td><ReqBadge r={r} /></td>
                    <td><span className="pta-last">{m ? m.text : '—'}</span></td>
                  </tr>
                ); })}</tbody>
              </table>
            </div>
          </>) : <div className="ix-empty"><EmptyState icon="inbox" title="No requests here" body="Try another tab or word." /></div>}
          {ready ? <div className="ix-foot"><span>{rows.length} request{rows.length === 1 ? '' : 's'}</span></div> : null}
        </section>
      </div>
      <ReqSheet key={open + tick} id={open} onClose={close} />
    </AdminShell>
  );
}
