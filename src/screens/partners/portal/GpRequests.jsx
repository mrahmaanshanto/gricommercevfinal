'use client';
// Grid Partners › Requests (/gp-requests?id=; Batch E): what stores asked this partner for — New (to answer), Accepted, Done,
// Closed. A request opens in a side panel: the store, package or custom job, budget, wanted by, the brief and the
// conversation. Accept (with an optional note) shares both sides' phone and email; Decline takes a note the store reads.
// Accepted requests show the store's contact and a message box. Data: lib/platform/partners.js.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { EmptyState, Sheet } from '@/components/ui';
import { ShopHeader, IndexTabs } from '@/components/ui/IndexKit';
import { Pic } from '@/components/ui/Pic';
import { getRequests, requestById, packageOf, acceptRequest, declineRequest, messageRequest, lastMessage } from '@/lib/platform/partners';
import { ReqBadge, Thread, ContactCard, tk, qp, dShort, dayText, say, PtStars } from '../partnerShared';
import { GpFrame, usePartner } from './gpShared';

const VIEWS = [['new', 'New', (r) => r.status === 'sent'], ['accepted', 'Accepted', (r) => r.status === 'accepted'], ['done', 'Done', (r) => r.status === 'done'], ['closed', 'Closed', (r) => ['declined', 'cancelled'].includes(r.status)], ['all', 'All', () => true]];

const CSS = `
.gr-h{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.gr-who{display:flex;align-items:center;gap:var(--space-3)}
.gr-who>span:not([class]){flex:1;min-width:0;display:flex;flex-direction:column}
.gr-who b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.gr-who small{font-size:var(--text-xs);color:var(--text-muted)}
.gr-compose{display:flex;gap:var(--space-2);align-items:flex-end}
.gr-compose textarea{flex:1;min-height:44px;resize:vertical}
.gr-answer{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.gr-last{display:block;max-width:340px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-xs);color:var(--text-muted)}
`;

function ReqSheet({ id, p, onClose }) {
  const r = id ? requestById(id) : null;
  const [note, setNote] = useState('');
  const [mode, setMode] = useState('');      // '' | 'decline'
  const [text, setText] = useState('');
  useEffect(() => { setNote(''); setMode(''); setText(''); }, [id]);
  if (!r || r.partnerId !== p.id) return null;
  const pkg = packageOf(p, r.packageId);
  const accept = () => { if (say(acceptRequest(r.id, note), `Accepted: ${r.shopName} can now call or email you`)) setNote(''); };
  const decline = () => { if (say(declineRequest(r.id, note), 'Declined: the store sees your note')) { setNote(''); setMode(''); } };
  const send = () => { if (say(messageRequest(r.id, 'partner', text), 'Message sent')) setText(''); };
  const foot = r.status === 'sent'
    ? (mode === 'decline'
      ? <><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setMode('')}>Back</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid gc-btn--error" onClick={decline}>Decline</button></>
      : <><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setMode('decline')}>Decline…</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={accept}><Icon name="check" width="14" height="14" aria-hidden="true" />Accept</button></>)
    : <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={onClose}>Close</button>;
  return (
    <Sheet open title={`${r.id} · ${r.shopName}`} onClose={onClose} footer={foot}>
      <div className="pt-form">
        <div className="gr-who"><Pic name={r.shopName} kind="logo" size={44} /><span><b>{r.shopName}</b><small>Store on GridCommerce · sent {dShort(r.at)}</small></span><ReqBadge r={r} side="partner" /></div>
        <div className="pt-facts">
          <div><span>Package</span><b>{pkg ? pkg.name : 'Custom request'}</b></div>
          <div><span>Budget</span><b>{tk(r.budget)}</b></div>
          <div><span>Wanted by</span><b>{dayText(r.wantedBy)}</b></div>
        </div>
        <ContactCard r={r} side="partner" />
        {r.status === 'cancelled' && r.reason ? <p className="pt-note pt-note--warn"><Icon name="ban" width="16" height="16" aria-hidden="true" /><span>{r.cancelledBy === 'GridCommerce' ? 'Cancelled by GridCommerce: ' : ''}{r.reason}</span></p> : null}
        {r.rating ? <p className="pt-note pt-note--ok"><Icon name="star" width="16" height="16" aria-hidden="true" /><span><PtStars value={r.rating.stars} size={12} /> {r.rating.text}</span></p> : null}
        <h3 className="gr-h">Conversation</h3>
        <Thread r={r} me="partner" />
        {r.status === 'sent' ? (
          <div className="gr-answer">
            <label className="gc-label" htmlFor="gr-note" style={{ margin: 0 }}>{mode === 'decline' ? 'Why (the store reads it)' : 'Note with your answer (optional)'}</label>
            <textarea id="gr-note" className="gc-input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder={mode === 'decline' ? 'e.g. Fully booked until November' : 'e.g. Happy to do it. I can film next week.'} />
            {mode !== 'decline' ? <p className="gc-help" style={{ margin: 0 }}>Accepting shares your phone and email with {r.shopName}, and theirs with you.</p> : null}
          </div>
        ) : r.status === 'accepted' ? (
          <form className="gr-compose" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <label className="sr-only" htmlFor="gr-msg">Message to {r.shopName}</label>
            <textarea id="gr-msg" className="gc-input" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${r.shopName}`} />
            <button type="submit" className="ix-btn" disabled={!text.trim()}><Icon name="send" width="16" height="16" aria-hidden="true" />Send</button>
          </form>
        ) : null}
      </div>
    </Sheet>
  );
}

function Body({ p }) {
  const { tick } = usePartner();
  const [view, setView] = useState('new');
  const [open, setOpen] = useState('');
  useEffect(() => { const id = qp('id'); if (id) { setOpen(id); const r = requestById(id); if (r && r.status !== 'sent') setView('all'); } }, []);
  const all = useMemo(() => getRequests({ partnerId: p.id }), [p.id, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const test = (VIEWS.find((v) => v[0] === view) || VIEWS[0])[2];
  const rows = all.filter(test);
  const tabs = VIEWS.map(([k, l, fn]) => ({ key: k, id: 'gr-tab-' + k, label: l, count: all.filter(fn).length, on: view === k, onClick: () => setView(k) }));
  const show = (id) => { setOpen(id); const u = new URL(window.location.href); u.searchParams.set('id', id); window.history.replaceState(null, '', u); };
  const close = () => { setOpen(''); const u = new URL(window.location.href); u.searchParams.delete('id'); window.history.replaceState(null, '', u); };
  return (<>
    <ShopHeader icon="inbox" title="Requests" about="Requests from stores. Accept to share phone numbers and emails, then agree the work and the payment directly with the store. Decline with a short note; the store reads it." />
    <section className="ix-card" aria-label="Requests">
      <div className="ix-bar"><IndexTabs tabs={tabs} label="Requests" /></div>
      {rows.length ? (<>
        <ul className="ix-plist">{rows.map((r) => { const m = lastMessage(r); return (
          <li key={r.id}><button type="button" className="ix-pitem ix-pitem--thumb" style={{ width: '100%', border: 0, background: 'none', textAlign: 'left', font: 'inherit' }} onClick={() => show(r.id)}>
            <span style={{ gridRow: 'span 2' }}><Pic name={r.shopName} kind="logo" /></span>
            <span className="ix-pitem__top"><b>{r.shopName}</b><ReqBadge r={r} side="partner" /></span>
            <span className="ix-pitem__mid">{tk(r.budget)} · {m ? m.text : r.brief}</span>
          </button></li>
        ); })}</ul>
        <div className="ix-table-wrap">
          <table className="ix-table">
            <caption className="sr-only">Requests from stores</caption>
            <thead><tr><th scope="col">Store</th><th scope="col">Request</th><th scope="col" className="ix-num">Budget</th><th scope="col">Wanted by</th><th scope="col">Status</th><th scope="col">Last message</th></tr></thead>
            <tbody>{rows.map((r) => { const m = lastMessage(r); const pkg = packageOf(p, r.packageId); return (
              <tr key={r.id} onClick={(e) => { if (!e.target.closest('a,button')) show(r.id); }} style={{ cursor: 'pointer' }}>
                <td><span className="gc-picrow"><Pic name={r.shopName} kind="logo" size={32} /><span><button type="button" style={{ all: 'unset', cursor: 'pointer', fontWeight: 'var(--weight-medium)', color: 'var(--text-heading)' }} onClick={() => show(r.id)}>{r.shopName}</button><span className="pt-sub">{r.id} · {dShort(r.at)}</span></span></span></td>
                <td>{pkg ? pkg.name : 'Custom request'}</td>
                <td className="ix-num">{tk(r.budget)}</td>
                <td>{dayText(r.wantedBy)}</td>
                <td><ReqBadge r={r} side="partner" /></td>
                <td><span className="gr-last">{m ? (m.from === 'partner' ? 'You: ' : '') + m.text : '—'}</span></td>
              </tr>
            ); })}</tbody>
          </table>
        </div>
      </>) : <div className="ix-empty"><EmptyState icon="inbox" title={view === 'new' ? 'No new requests' : 'Nothing here'} body="Share your profile so stores find you." /></div>}
      <div className="ix-foot"><span>{rows.length} request{rows.length === 1 ? '' : 's'}</span></div>
    </section>
    <ReqSheet key={open + tick} id={open} p={p} onClose={close} />
  </>);
}

export default function GpRequests() {
  return <GpFrame active="requests" screen="GpRequests" css={CSS}>{(p) => <Body p={p} />}</GpFrame>;
}
