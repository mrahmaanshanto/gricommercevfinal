'use client';
// Support access to a merchant's store (review SA-F1) — the pieces the super admin pages share:
//   <AccessSheet shopId ticketId subject onClose />   ask the owner → owner approves (demo button) or the one-time PIN
//                                                    → pick View only / Approved changes and 15 · 30 · 60 min → start
//   <AccessBanner />                                  across /admin while the person's session is on: store, scope,
//                                                    time left, Open store admin, End session (AdminShell draws it)
//   <AccessLog shopId onRequest />                    the store's access log (merchant profile › Support)
//   <AccessTable />                                   every store's sessions (Administration › Security › Store access)
// Data: lib/admin/supportAccess.js. Nobody opens a store without a session that the owner approved.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { useAdminStore } from '@/lib/admin/store';
import { now as platformNow, isLive, staff as currentStaff } from '@/lib/platform/store';
import { dmy, hm, MIN } from '@/lib/platform/util';
import {
  access, SCOPES, DURATIONS, APPROVAL_VALID, STATE_LABEL, STATE_TONE, scopeLabel, stateOf, accessRight, activeFor, openRequest,
  sessionById, sessionsFor, allSessions, pinOf, usedMinutes, shopName, requestAccess, ownerApproved, approveWithPin, startSession,
  endSession, withdrawRequest, sweep,
} from '@/lib/admin/supportAccess';

export const ACCESS_CSS = `
.acc-banner{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);margin:0 0 var(--space-4);padding:var(--space-2) var(--space-4);background:var(--fill-warning-soft);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);font-size:var(--text-sm);color:var(--text-heading)}
.acc-banner b{font-weight:var(--weight-semibold)}
.acc-banner__txt{display:flex;flex-wrap:wrap;align-items:center;gap:4px var(--space-2);flex:1;min-width:0}
.acc-banner__time{font-family:var(--font-data);color:var(--text-warning);font-weight:var(--weight-medium)}
.acc-banner__acts{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.acc-steps{display:flex;gap:var(--space-2);margin:0 0 var(--space-3);padding:0;list-style:none;font-size:var(--text-xs);color:var(--text-muted)}
.acc-steps li{display:flex;align-items:center;gap:4px}
.acc-steps li.is-on{color:var(--text-heading);font-weight:var(--weight-medium)}
.acc-steps li.is-done{color:var(--text-success)}
.acc-form{display:flex;flex-direction:column;gap:var(--space-3)}
.acc-box{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.acc-box p{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.acc-muted{font-size:var(--text-xs);color:var(--text-muted)}
.acc-pin{display:flex;gap:var(--space-2);align-items:flex-start}
.acc-pin .gc-input{font-family:var(--font-data);letter-spacing:.2em;max-width:160px}
.acc-choice{display:flex;align-items:flex-start;gap:var(--space-2);padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);cursor:pointer}
.acc-choice:has(input:checked){border-color:var(--primary);background:var(--fill-primary-soft)}
.acc-choice[aria-disabled="true"]{opacity:.6;cursor:not-allowed}
.acc-choice span{display:flex;flex-direction:column;min-width:0;font-size:var(--text-sm);color:var(--text-heading)}
.acc-choice small{font-size:var(--text-xs);color:var(--text-muted)}
.acc-rows{margin:0;padding:0;list-style:none}
.acc-row{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) auto;gap:var(--space-3);align-items:center;padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.acc-row:first-child{border-top:0}
.acc-row>span{display:flex;flex-direction:column;min-width:0;color:var(--text-body)}
.acc-row b{font-weight:var(--weight-medium);color:var(--text-heading)}
.acc-row small{font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:640px){.acc-row{grid-template-columns:minmax(0,1fr)}.acc-row>span:last-child{align-items:flex-start}.acc-banner__acts{width:100%}}
`;

/** Re-read the access store and the clock (every 20 s and on change); expire sessions whose time ran out. */
function useAccess() {
  const st = useAdminStore(access);
  const t = st.live ? platformNow() : st.t;
  useEffect(() => { if (st.live) sweep(platformNow()); }, [st.live, st.t]);   // eslint-disable-line react-hooks/exhaustive-deps
  return { ...st, t };
}
const left = (s, t) => Math.max(0, Math.ceil((s.endsAt - t) / MIN));
const STEPS = ['Ask the owner', 'Owner approves', 'Start'];

/** Ask for access to one store, and walk through approval and start. */
export function AccessSheet({ shopId, ticketId = null, subject = '', onClose }) {
  const { t, live } = useAccess();
  const me = currentStaff();
  const right = accessRight(me);
  const [id, setId] = useState(null);           // the request this sheet follows
  const [reason, setReason] = useState(subject ? (ticketId ? ticketId + ' · ' : '') + subject : '');
  const [pin, setPin] = useState('');
  const [scope, setScope] = useState('view');
  const [minutes, setMinutes] = useState(30);
  const [err, setErr] = useState(null);
  useEffect(() => {
    if (!live || id) return;
    const cur = activeFor(me.id, platformNow());
    const open = cur && cur.shopId === shopId ? cur : openRequest(me.id, shopId, platformNow());
    if (open) setId(open.id);
  }, [live]);   // eslint-disable-line react-hooks/exhaustive-deps

  const s = id ? sessionById(id) : null;
  const state = s ? stateOf(s, t) : 'new';
  const step = state === 'new' ? 0 : state === 'asked' ? 1 : state === 'approved' ? 2 : 3;
  const name = shopName(shopId);
  const fail = (r) => { setErr({ field: r.field || 'form', text: r.error }); };

  const ask = () => {
    const r = requestAccess({ shopId, ticketId, reason });
    if (!r.ok) { fail(r); return; }
    setErr(null); setId(r.session.id);
    toast(r.existing ? 'You already asked; waiting for the owner' : 'The owner is asked to approve');
  };
  const owner = () => { const r = ownerApproved(id); if (!r.ok) { fail(r); return; } setErr(null); toast('Owner approved'); };
  const checkPin = () => { const r = approveWithPin(id, pin); if (!r.ok) { fail(r); return; } setErr(null); toast('PIN accepted'); };
  const start = () => {
    const r = startSession(id, { scope, minutes });
    if (!r.ok) { fail(r); return; }
    toast(`Store access on · ${scopeLabel(scope)}, ${minutes} min`);
    onClose();
  };
  const end = () => { const r = endSession(id); if (!r.ok) { fail(r); return; } toast('Session ended'); onClose(); };
  const withdraw = () => { const r = withdrawRequest(id); if (!r.ok) { fail(r); return; } toast('Request withdrawn'); onClose(); };
  const e = (f) => (err && err.field === f ? err.text : null);

  let body = null;
  let footer = <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button>;
  if (!right.ok) {
    body = <p className="acc-muted" role="alert">{right.reason}</p>;
  } else if (state === 'new' || ['ended', 'expired', 'lapsed', 'declined', 'withdrawn'].includes(state)) {
    body = (
      <div className="acc-form">
        {state === 'lapsed' ? <p className="acc-muted">The last approval lapsed. Ask again.</p> : null}
        <div className="gc-field">
          <label className="gc-label" htmlFor="acc-reason">Why you need to open the store</label>
          <textarea id="acc-reason" rows={3} className={'gc-input' + (e('reason') ? ' gc-input--error' : '')} aria-invalid={e('reason') ? true : undefined} data-autofocus value={reason} onChange={(ev) => { setReason(ev.target.value); setErr(null); }} />
          {e('reason') ? <p className="gc-help gc-help--error" role="alert">{e('reason')}</p> : <p className="gc-help">The owner sees this with the request.</p>}
        </div>
      </div>
    );
    footer = <><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => { if (['ended', 'expired', 'lapsed', 'declined', 'withdrawn'].includes(state)) setId(null); ask(); }} disabled={!live}>Ask the owner</button></>;
  } else if (state === 'asked') {
    body = (
      <div className="acc-form">
        <div className="acc-box">
          <p>The owner of {name} got the request by SMS and in their panel. When they approve it, you can start.</p>
          {/* demo: there is no owner on the other end, so this button stands in for the owner tapping Approve */}
          <div><button type="button" className="gc-btn gc-btn--solid" onClick={owner}>Owner approved</button></div>
        </div>
        <div className="acc-box">
          <p>Or the owner reads out the one-time PIN from their panel:</p>
          <div className="acc-pin">
            <input aria-label="Owner’s one-time PIN" className={'gc-input' + (e('pin') ? ' gc-input--error' : '')} inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={pin} onChange={(ev) => { setPin(ev.target.value.replace(/\D/g, '')); setErr(null); }} />
            <button type="button" className="gc-btn gc-btn--neutral" onClick={checkPin}>Check PIN</button>
          </div>
          {e('pin') ? <p className="gc-help gc-help--error" role="alert">{e('pin')}</p> : null}
          <p className="acc-muted">Demo: the owner’s PIN is <span style={{ fontFamily: 'var(--font-data)' }}>{pinOf(s)}</span>.</p>
        </div>
      </div>
    );
    footer = <><button type="button" className="gc-btn gc-btn--neutral" onClick={withdraw}>Withdraw request</button><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button></>;
  } else if (state === 'approved') {
    const lapse = Math.max(1, Math.ceil((s.approvedAt + APPROVAL_VALID - t) / MIN));
    body = (
      <div className="acc-form">
        <p className="acc-muted">Owner approved {s.approvedHow === 'pin' ? 'with the PIN' : 'in their panel'}. Start within {lapse} min.</p>
        <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
          <legend className="gc-label">What you may do</legend>
          <div className="acc-form" style={{ gap: 'var(--space-2)' }}>
            {SCOPES.map(([k, l, d]) => {
              const off = k === 'changes' && !right.changes;
              return (
                <label key={k} className="acc-choice" aria-disabled={off ? 'true' : undefined} title={off ? 'Needs Edit on Merchants (Roles & permissions)' : undefined}>
                  <input type="radio" name="acc-scope" className="gc-check gc-check--radio" checked={scope === k} disabled={off} onChange={() => { setScope(k); setErr(null); }} />
                  <span>{l}<small>{off ? 'Needs Edit on Merchants (Roles & permissions).' : d}</small></span>
                </label>
              );
            })}
          </div>
          {e('scope') ? <p className="gc-help gc-help--error" role="alert">{e('scope')}</p> : null}
        </fieldset>
        <div className="gc-field">
          <span className="gc-label" id="acc-min">How long</span>
          <div className="ix-chips" role="group" aria-labelledby="acc-min">
            {DURATIONS.map((m) => <button key={m} type="button" className="ix-chip" aria-pressed={minutes === m} onClick={() => setMinutes(m)}>{m} min</button>)}
          </div>
        </div>
      </div>
    );
    footer = <><button type="button" className="gc-btn gc-btn--neutral" onClick={withdraw}>Withdraw</button><button type="button" className="gc-btn gc-btn--solid" onClick={start}>Start session</button></>;
  } else if (state === 'active') {
    body = (
      <div className="acc-form">
        <div className="acc-box">
          <p><b>{scopeLabel(s.scope)}</b> · {left(s, t)} min left of {s.minutes}</p>
          <p className="acc-muted">Started {hm(s.startedAt)} · {s.reason}</p>
        </div>
      </div>
    );
    footer = <><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button><button type="button" className="gc-btn gc-btn--solid gc-btn--error" onClick={end}>End session</button></>;
  }

  return (
    <Sheet open title={`Store access · ${name}`} onClose={onClose} footer={footer}>
      <style dangerouslySetInnerHTML={{ __html: ACCESS_CSS }} />
      {right.ok ? (
        <ol className="acc-steps" aria-label="Steps">
          {STEPS.map((x, i) => <li key={x} className={i === step ? 'is-on' : i < step ? 'is-done' : ''}>{i < step ? <Icon name="check" width="12" height="12" aria-hidden="true" /> : <span aria-hidden="true">{i + 1}.</span>}{x}</li>)}
        </ol>
      ) : null}
      {body}
      {err && err.field === 'form' ? <p className="gc-help gc-help--error" role="alert">{err.text}</p> : null}
    </Sheet>
  );
}

/** The strip across every super admin page while the signed-in person has a session on. */
export function AccessBanner() {
  const { t, live } = useAccess();
  if (!live || !isLive()) return null;
  const me = currentStaff();
  const s = activeFor(me.id, t);
  if (!s) return null;
  const end = () => { const r = endSession(s.id); toast(r.ok ? 'Session ended' : r.error); };
  return (
    <div className="acc-banner" role="status">
      <style dangerouslySetInnerHTML={{ __html: ACCESS_CSS }} />
      <Icon name="key-round" width="16" height="16" aria-hidden="true" />
      <span className="acc-banner__txt">
        <span>Store access: <b>{shopName(s.shopId)}</b> · {scopeLabel(s.scope)}</span>
        <span className="acc-banner__time">{left(s, t)} min left</span>
      </span>
      <span className="acc-banner__acts">
        {/* a real build opens the store's own admin with a token limited to the scope and the time (server); the
            demo opens the merchant panel's demo shop in a new tab */}
        <a className="gc-btn gc-btn--sm gc-btn--neutral" href="/merchant-overview?quiet=1" target="_blank" rel="noopener noreferrer">Open store admin</a>
        <Link className="gc-btn gc-btn--sm gc-btn--neutral" href={`/admin/merchant?id=${s.shopId}&tab=support`}>Store</Link>
        <button type="button" className="gc-btn gc-btn--sm gc-btn--solid gc-btn--error" onClick={end}>End session</button>
      </span>
    </div>
  );
}

function SessionRow({ s, t, store }) {
  const st = stateOf(s, t);
  const when = s.startedAt ? `${dmy(s.startedAt)} ${hm(s.startedAt)}` : `${dmy(s.requestedAt)} ${hm(s.requestedAt)}`;
  const how = s.approvedHow === 'pin' ? 'owner’s PIN' : s.approvedHow === 'owner' ? 'owner approved in panel' : 'not approved yet';
  const used = s.startedAt && (st === 'ended' || st === 'expired') ? `${usedMinutes(s)} of ${s.minutes} min` : s.startedAt ? `up to ${s.minutes} min` : '';
  return (
    <li className="acc-row">
      <span><b>{store ? <Link href={`/admin/merchant?id=${s.shopId}&tab=support`}>{shopName(s.shopId)}</Link> : s.by}</b><small>{store ? s.by + ' · ' : ''}{when}{s.ticketId ? ' · ' + s.ticketId : ''}</small></span>
      <span>{s.scope ? scopeLabel(s.scope) : '—'}<small>{[how, used].filter(Boolean).join(' · ')}{s.reason ? ' · ' + s.reason : ''}</small></span>
      <span><StatusBadge tone={STATE_TONE[st] || 'neutral'}>{STATE_LABEL[st] || st}</StatusBadge></span>
    </li>
  );
}

/** One store's access log, newest first, with "Request access". */
export function AccessLog({ shopId, onRequest }) {
  const { t, live } = useAccess();
  const list = live ? sessionsFor(shopId) : [];
  const right = live ? accessRight(currentStaff()) : { ok: false, reason: '' };
  return (
    <section className="ix-card" aria-labelledby="acc-log-h">
      <style dangerouslySetInnerHTML={{ __html: ACCESS_CSS }} />
      <div className="ix-card__head">
        <h2 id="acc-log-h">Store access</h2>
        <button type="button" className="ix-btn ix-btn--sm" onClick={onRequest} disabled={!right.ok} title={right.ok ? undefined : right.reason}>Request access</button>
      </div>
      {!right.ok && live ? <p className="acc-muted" style={{ padding: '0 var(--space-4)' }}>{right.reason}</p> : null}
      {list.length ? <ul className="acc-rows">{list.slice(0, 8).map((s) => <SessionRow key={s.id} s={s} t={t} />)}</ul>
        : <div className="ix-empty"><EmptyState icon="key-round" title="No one has opened this store." /></div>}
    </section>
  );
}

/** Every store's access sessions (Security › Store access). */
export function AccessTable() {
  const { t, live } = useAccess();
  const list = live ? allSessions() : [];
  if (!list.length) return <div className="ix-empty"><EmptyState icon="key-round" title="No store has been opened by staff." /></div>;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ACCESS_CSS }} />
      <ul className="acc-rows" aria-label="Store access sessions">{list.slice(0, 40).map((s) => <SessionRow key={s.id} s={s} t={t} store />)}</ul>
    </>
  );
}
