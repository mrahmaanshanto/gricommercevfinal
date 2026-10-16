'use client';
// Services › Grid Partners › My requests (/partner-requests?id=; Batch E): every quote request this store sent to a Grid
// Partner — status, partner, package or budget, the last message. A request opens in a side panel with the brief, the
// conversation and a message box; the partner's phone and email appear once they accept. Withdraw a waiting request;
// Mark done when the work is delivered, then rate it (1–5 stars, shown on the partner's profile).
// Data: lib/platform/partners.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState, Sheet } from '@/components/ui';
import { ShopHeader, IndexTabs } from '@/components/ui/IndexKit';
import { Pic } from '@/components/ui/Pic';
import { getRequests, requestById, partnerById, packageOf, lastMessage, lastAt, messageRequest, markDone, rateRequest, cancelRequest, typeLabel, SELF_SHOP } from '@/lib/platform/partners';
import { SvcFrame, StarPicker } from '../services/svcShared';
import { usePartners, PT_CSS, ReqBadge, Thread, ContactCard, Tick, tk, qp, dShort, dayText, say, PtStars } from './partnerShared';

const VIEWS = [['open', 'Open', (r) => ['sent', 'accepted'].includes(r.status)], ['done', 'Done', (r) => r.status === 'done'], ['closed', 'Declined or withdrawn', (r) => ['declined', 'cancelled'].includes(r.status)], ['all', 'All', () => true]];

/** The request side panel (store side). */
function RequestSheet({ id, onClose }) {
  const r = id ? requestById(id) : null;
  const [text, setText] = useState('');
  const [rate, setRate] = useState({ stars: 0, text: '' });
  useEffect(() => { setText(''); setRate({ stars: 0, text: '' }); }, [id]);
  if (!r) return <Sheet open={false} title="" onClose={onClose} />;
  const p = partnerById(r.partnerId) || { name: 'Partner', type: 'creator' };
  const pkg = packageOf(p, r.packageId);
  const send = () => { if (say(messageRequest(r.id, 'shop', text), 'Message sent')) setText(''); };
  const done = async () => { if (await confirmDialog({ title: 'Mark this work done?', body: `You can then rate ${p.name}. The conversation stays here.`, confirmLabel: 'Mark done' })) say(markDone(r.id), 'Marked done: rate the work below'); };
  const withdraw = async () => { if (await confirmDialog({ title: 'Withdraw this request?', body: `${p.name} will see that you withdrew it.`, confirmLabel: 'Withdraw', tone: 'danger' })) say(cancelRequest(r.id, '', 'shop'), 'Request withdrawn'); };
  const closed = ['declined', 'cancelled'].includes(r.status);
  const foot = r.status === 'sent' ? <><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={withdraw}>Withdraw</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={onClose}>Close</button></>
    : r.status === 'accepted' ? <><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={onClose}>Close</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={done}><Icon name="check" width="14" height="14" aria-hidden="true" />Mark done</button></>
      : <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={onClose}>Close</button>;
  return (
    <Sheet open title={`${r.id} · ${p.name}`} onClose={onClose} footer={foot}>
      <div className="pt-form">
        <div className="pr-who">
          <Pic src={p.photo} name={p.name} kind="person" size={48} />
          <span><b>{p.name}{p.verified ? <Tick size={14} /> : null}</b><small>{typeLabel(p.type)}{p.city ? ' · ' + p.city : ''}</small></span>
          <ReqBadge r={r} />
        </div>
        <div className="pt-facts">
          <div><span>Package</span><b>{pkg ? pkg.name : 'Something else'}</b></div>
          <div><span>Budget</span><b>{tk(r.budget)}</b></div>
          <div><span>Wanted by</span><b>{dayText(r.wantedBy)}</b></div>
          <div><span>Sent</span><b>{dShort(r.at)}</b></div>
        </div>
        <ContactCard r={r} side="shop" />
        {r.status === 'cancelled' && r.reason ? <p className="pt-note pt-note--warn"><Icon name="ban" width="16" height="16" aria-hidden="true" /><span>{r.cancelledBy === 'GridCommerce' ? 'Cancelled by GridCommerce: ' : ''}{r.reason}</span></p> : null}
        <h3 className="pr-h">Conversation</h3>
        <Thread r={r} me="shop" />
        {!closed ? (
          <form className="pr-compose" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <label className="sr-only" htmlFor="pr-msg">Message to {p.name}</label>
            <textarea id="pr-msg" className="gc-input" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${p.name.split(' ')[0]}`} />
            <button type="submit" className="ix-btn" disabled={!text.trim()}><Icon name="send" width="16" height="16" aria-hidden="true" />Send</button>
          </form>
        ) : null}
        {r.status === 'done' ? (
          r.rating ? (
            <div className="pr-rated"><b>Your rating</b><PtStars value={r.rating.stars} /> {r.rating.text ? <p>{r.rating.text}</p> : null}</div>
          ) : (
            <section className="pr-rate" aria-labelledby="pr-rate-h">
              <h3 className="pr-h" id="pr-rate-h">Rate {p.name.split(' ')[0]}’s work</h3>
              <StarPicker value={rate.stars} onChange={(s) => setRate({ ...rate, stars: s })} />
              <label className="sr-only" htmlFor="pr-rate-t">What went well</label>
              <textarea id="pr-rate-t" className="gc-input" rows={2} value={rate.text} onChange={(e) => setRate({ ...rate, text: e.target.value })} placeholder="What went well (shown on their profile)" />
              <div><button type="button" className="ix-btn ix-btn--primary" disabled={!rate.stars} onClick={() => say(rateRequest(r.id, rate.stars, rate.text), 'Thanks: your rating is on their profile')}>Save rating</button></div>
            </section>
          )
        ) : null}
        <Link href={'/partner?h=' + p.handle} className="bl-link" style={{ fontSize: 'var(--text-sm)' }}>See {p.name.split(' ')[0]}’s profile</Link>
      </div>
    </Sheet>
  );
}

const CSS = `
.pr-who{display:flex;align-items:center;gap:var(--space-3)}
.pr-who>span:not([class]){flex:1;min-width:0;display:flex;flex-direction:column}
.pr-who b{display:flex;align-items:center;gap:4px;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pr-who small{font-size:var(--text-xs);color:var(--text-muted)}
.pr-h{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pr-compose{display:flex;gap:var(--space-2);align-items:flex-end}
.pr-compose textarea{flex:1;min-height:44px;resize:vertical}
.pr-rate{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.pr-rated{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:var(--text-sm)}
.pr-rated p{flex-basis:100%;margin:0;color:var(--text-body)}
.pr-last{display:block;max-width:360px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-xs);color:var(--text-muted)}
`;

export default function PartnerRequests() {
  const { ready, tick } = usePartners();
  const router = useRouter();
  const [view, setView] = useState('open');
  const [open, setOpen] = useState('');
  useEffect(() => { const id = qp('id'); if (id) { setOpen(id); const r = requestById(id); if (r && !['sent', 'accepted'].includes(r.status)) setView('all'); } }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const all = useMemo(() => (ready ? getRequests({ shopId: SELF_SHOP }) : []), [ready, tick]);
  const test = (VIEWS.find((v) => v[0] === view) || VIEWS[0])[2];
  const rows = all.filter(test);
  const tabs = VIEWS.map(([k, l, fn]) => ({ key: k, id: 'pr-tab-' + k, label: l, count: ready ? all.filter(fn).length : null, on: view === k, onClick: () => setView(k) }));
  const show = (id) => { setOpen(id); const u = new URL(window.location.href); u.searchParams.set('id', id); window.history.replaceState(null, '', u); };
  const close = () => { setOpen(''); const u = new URL(window.location.href); u.searchParams.delete('id'); window.history.replaceState(null, '', u); };
  return (
    <SvcFrame gate="partners" screen="PartnerRequests" active="gp-requests" page="My partner requests" css={PT_CSS + CSS} after={<RequestSheet key={open + tick} id={open} onClose={close} />}>
      <ShopHeader icon="inbox" title="Partner requests"
        about="Your quote requests to Grid Partners. A partner accepts or declines; once they accept you both see each other's phone and email and agree the work directly (GridCommerce does not handle the payment). Mark the work done when it is delivered, then rate it: ratings show on the partner's profile."
        primary={{ label: 'Find partners', icon: 'users-round', href: '/partners' }} />
      <section className="ix-card" aria-label="Requests">
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Requests" /></div>
        {!ready ? <div style={{ minHeight: 240 }} aria-busy="true" /> : rows.length ? (<>
          <ul className="ix-plist">{rows.map((r) => { const p = partnerById(r.partnerId) || { name: 'Partner' }; const m = lastMessage(r); return (
            <li key={r.id}><button type="button" className="ix-pitem ix-pitem--thumb" style={{ width: '100%', border: 0, background: 'none', textAlign: 'left', font: 'inherit' }} onClick={() => show(r.id)}>
              <span style={{ gridRow: 'span 2' }}><Pic src={p.photo} name={p.name} kind="person" /></span>
              <span className="ix-pitem__top"><b>{p.name}</b><ReqBadge r={r} /></span>
              <span className="ix-pitem__mid">{r.id} · {tk(r.budget)}{m ? ' · ' + m.text : ''}</span>
            </button></li>
          ); })}</ul>
          <div className="ix-table-wrap">
            <table className="ix-table">
              <caption className="sr-only">Partner requests</caption>
              <thead><tr><th scope="col">Partner</th><th scope="col">Request</th><th scope="col" className="ix-num">Budget</th><th scope="col">Wanted by</th><th scope="col">Status</th><th scope="col">Last message</th></tr></thead>
              <tbody>{rows.map((r) => { const p = partnerById(r.partnerId) || { name: 'Partner', type: 'creator' }; const m = lastMessage(r); const pkg = packageOf(p, r.packageId); return (
                <tr key={r.id} onClick={(e) => { if (!e.target.closest('a,button')) show(r.id); }} style={{ cursor: 'pointer' }}>
                  <td><span className="gc-picrow"><Pic src={p.photo} name={p.name} kind="person" size={32} /><span><button type="button" className="ix-strong" style={{ all: 'unset', cursor: 'pointer', fontWeight: 'var(--weight-medium)', color: 'var(--text-heading)' }} onClick={() => show(r.id)}>{p.name}</button><span className="pt-sub">{typeLabel(p.type)}</span></span></span></td>
                  <td>{r.id}<span className="pt-sub">{pkg ? pkg.name : 'Something else'}</span></td>
                  <td className="ix-num">{tk(r.budget)}</td>
                  <td>{dayText(r.wantedBy)}</td>
                  <td><ReqBadge r={r} /></td>
                  <td><span className="pr-last">{m ? (m.from === 'shop' ? 'You: ' : m.from === 'partner' ? p.name.split(' ')[0] + ': ' : '') + m.text : '—'}</span><span className="pt-sub">{dShort(lastAt(r))}</span></td>
                </tr>
              ); })}</tbody>
            </table>
          </div>
        </>) : <div className="ix-empty"><EmptyState icon="inbox" title={view === 'open' ? 'No open requests' : 'Nothing here'} body="Find a partner and send Request a quote." actionLabel="Find partners" onAction={() => router.push('/partners')} /></div>}
        {ready ? <div className="ix-foot"><span>{rows.length} request{rows.length === 1 ? '' : 's'}</span></div> : null}
      </section>
    </SvcFrame>
  );
}
