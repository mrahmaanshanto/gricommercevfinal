'use client';
// Store actions waiting for a second person (review SA-F2): suspend, pause, cancel or revoke above the Security ›
// Approvals amount, more grace on a large debt, large free credits. The person who asked can withdraw; someone with the
// approver role (never the one who asked) approves — which runs the action — or rejects with a reason.
//   <StoreRequests shopId />   one store (merchant profile), or every store when shopId is left out (Security)
// Data: lib/admin/actionRights.js.

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from '@/runtime/ui';
import { Dialog, StatusBadge } from '@/components/ui';
import { useAdminStore } from '@/lib/admin/store';
import { db as platformDb, staff as currentStaff } from '@/lib/platform/store';
import { ago, taka } from '@/lib/platform/util';
import { requests, pendingAll, historyAll, canDecide, decide, cancelRequest, describe } from '@/lib/admin/actionRights';

const CSS = `
.sr-rows{margin:0;padding:0;list-style:none}
.sr-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--space-3);align-items:center;padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.sr-row:first-child{border-top:0}
.sr-row>span{display:flex;flex-direction:column;min-width:0;color:var(--text-body)}
.sr-row b{font-weight:var(--weight-medium);color:var(--text-heading)}
.sr-row small{font-size:var(--text-xs);color:var(--text-muted)}
.sr-acts{display:flex;flex-wrap:nowrap;gap:var(--space-2);justify-content:flex-end}
@media (max-width:640px){.sr-row{grid-template-columns:minmax(0,1fr)}.sr-acts{flex-wrap:wrap;justify-content:flex-start}}
`;
const TONE = { pending: 'warning', approved: 'success', rejected: 'error', withdrawn: 'neutral' };
const LABEL = { pending: 'Waiting', approved: 'Approved', rejected: 'Rejected', withdrawn: 'Withdrawn' };

export function StoreRequests({ shopId = null, history = false, card = true }) {
  const { t, live } = useAdminStore(requests);
  const [no, setNo] = useState(null);   // reject: { id, note, error }
  if (!live) return null;
  const me = currentStaff();
  const db = platformDb();
  const list = (history ? historyAll() : pendingAll()).filter((r) => !shopId || r.shopIds.includes(shopId)).slice(0, 30);
  if (!list.length && card) return null;
  const approve = (r) => { const x = decide(r.id, 'approve'); toast(x.ok ? `${r.id} approved` : x.error); };
  const reject = () => {
    const x = decide(no.id, 'reject', no.note);
    if (!x.ok) { setNo({ ...no, error: x.error }); return; }
    toast(`${no.id} rejected`); setNo(null);
  };
  const withdraw = (r) => { const x = cancelRequest(r.id); toast(x.ok ? `${r.id} withdrawn` : x.error); };

  const rows = (
    <ul className="sr-rows" aria-label="Store actions waiting for a second person">
      {list.map((r) => {
        const may = canDecide(r, me);
        const mine = r.byId === me.id;
        return (
          <li key={r.id} className="sr-row">
            <span>
              <b>{describe(r, db)}</b>
              <small>
                {r.id} · asked by {mine ? 'you' : r.by} {ago(r.at, t)} · {r.reason}
                {r.threshold != null ? ` · ${r.rule === 'grace' ? 'owed' : r.rule === 'free-credits' ? 'credits' : 'bill'} ${taka(r.value)} above ${taka(r.threshold)}` : ''}
                {r.status === 'pending' ? ` · for ${r.approver}` : r.decidedBy ? ` · ${LABEL[r.status].toLowerCase()} by ${r.decidedBy}${r.note ? ': ' + r.note : ''}` : ''}
                {!shopId && r.shopIds.length === 1 ? <> · <Link href={`/admin/merchant?id=${r.shopIds[0]}`}>open store</Link></> : null}
              </small>
              {r.status === 'pending' && !may.ok && !mine ? <small>{may.reason}</small> : null}
            </span>
            <span className="sr-acts">
              {r.status !== 'pending' ? <StatusBadge tone={TONE[r.status] || 'neutral'}>{LABEL[r.status] || r.status}</StatusBadge>
                : mine ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => withdraw(r)}>Withdraw</button>
                  : <>
                    <button type="button" className="ix-btn ix-btn--sm" onClick={() => setNo({ id: r.id, note: '', error: '' })} disabled={!may.ok}>Reject</button>
                    <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => approve(r)} disabled={!may.ok}>Approve</button>
                  </>}
            </span>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {card ? (
        <section className="ix-card" aria-labelledby="sr-h">
          <div className="ix-card__head"><h2 id="sr-h">Waiting for a second person · {list.length}</h2></div>
          {rows}
        </section>
      ) : list.length ? rows : <p className="ix-muted" style={{ padding: 'var(--space-3) var(--space-4)', margin: 0, fontSize: 'var(--text-sm)' }}>Nothing is waiting.</p>}
      <Dialog open={!!no} title={no ? `Reject ${no.id}?` : ''} onClose={() => setNo(null)} width={480}
        footer={<>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setNo(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid gc-btn--error" onClick={reject}>Reject</button>
        </>}>
        {no ? (
          <div className="gc-field">
            <label className="gc-label" htmlFor="sr-note">Why</label>
            <input id="sr-note" className={'gc-input' + (no.error ? ' gc-input--error' : '')} data-autofocus value={no.note} onChange={(e) => setNo({ ...no, note: e.target.value, error: '' })} />
            {no.error ? <p className="gc-help gc-help--error" role="alert">{no.error}</p> : null}
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
