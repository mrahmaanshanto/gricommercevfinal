'use client';
// Grid AI › Activity & approvals — what the AI did and what waits for a person.
//   Approvals    risk-4 actions (refunds, discounts above the limit, stock changes, bulk messages …): the request, where
//                it came from, the customer or record, the change, the reason, the expiry; Approve or Reject (with a
//                reason). Checked again when decided (lib/gridai/aiApprovals.js). Needs "Approve high-risk AI actions".
//   Activity     the AI's log (replies, suggestions, actions, hand-overs, blocked instructions, knowledge, settings).
//   Feedback     how the team rated AI answers (lib/gridai/quality.js).

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { ShopHeader, IndexTabs } from '@/components/ui/IndexKit';
import { toast } from '@/runtime/ui';
import { formatDateTime, formatBDT } from '@/lib/format';
import { currentUser } from '@/lib/team';
import { can, why, PERMS_EVENT } from '@/lib/permissions';
import { getApprovals, decide, KINDS as AP_KINDS, APPROVALS_EVENT } from '@/lib/gridai/aiApprovals';
import { getActivity, KINDS, KIND_LABEL, KIND_ICON, ACTIVITY_EVENT } from '@/lib/gridai/activity';
import { getFeedback, VERDICT, QUALITY_EVENT } from '@/lib/gridai/quality';
import { channelName } from '@/lib/inbox';
import { GaFrame, Field, useLive } from './gaShared';

const CSS = `
.ac-ico{display:grid;flex:none;place-items:center;width:32px;height:32px;border-radius:var(--radius-md);background:var(--surface-subtle);color:var(--text-body)}
.ac-ico.is-warn{background:var(--fill-warning-soft);color:var(--text-warning)}
.ac-row{display:flex;align-items:center;gap:10px;min-width:0}
.ac-row b{display:block;font-weight:var(--weight-medium);color:var(--text-heading)}
.ac-row small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ac-kv{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:6px var(--space-4);margin:0;font-size:var(--text-sm)}
.ac-kv dt{color:var(--text-muted)}
.ac-kv dd{margin:0;color:var(--text-heading);overflow-wrap:anywhere}
.ac-change{margin:0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm);line-height:1.5;color:var(--text-heading)}
.ac-foot{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);width:100%;justify-content:flex-end}
`;
const AP_TONE = { waiting: 'warning', approved: 'success', rejected: 'error', expired: 'neutral' };
const AP_WORD = { waiting: 'Waiting', approved: 'Approved', rejected: 'Rejected', expired: 'Expired' };
const left = (t, now) => { const m = Math.max(0, Math.round((t - now) / 60e3)); return m >= 60 ? Math.floor(m / 60) + ' h ' + (m % 60) + ' min' : m + ' min'; };

export default function Activity() {
  const data = useLive(() => ({ ap: getApprovals(), log: getActivity(), fb: getFeedback(), me: currentUser(), now: Date.now() }), [APPROVALS_EVENT, ACTIVITY_EVENT, QUALITY_EVENT, PERMS_EVENT], 30000);
  const [tab, setTab] = useState('approvals');
  const [kind, setKind] = useState('');
  const [openId, setOpenId] = useState('');
  const [reject, setReject] = useState(null);
  useEffect(() => { const p = new URLSearchParams(window.location.search); if (['approvals', 'activity', 'feedback'].includes(p.get('tab'))) setTab(p.get('tab')); }, []);
  const ready = !!data;
  const mayApprove = ready && can(data.me, 'ai-approve');
  const mayLogs = ready && can(data.me, 'ai-logs');
  const waiting = ready ? data.ap.filter((r) => r.status === 'waiting') : [];
  const req = ready && openId ? data.ap.find((r) => r.id === openId) : null;
  const tabs = [['approvals', 'Approvals', waiting.length], ['activity', 'Activity', ready ? data.log.length : null], ['feedback', 'Feedback', ready ? data.fb.length : null]].map(([k, l, n]) => ({ key: k, id: 'ac-tab-' + k, label: l, count: n, on: tab === k, onClick: () => setTab(k) }));
  const act = (verdict, reason = '') => {
    const r = decide(req.id, verdict, { by: data.me.name, user: data.me, reason });
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    toast(verdict === 'approve' ? 'Approved: ' + req.title : 'Rejected. GridAI tells the customer a person will follow up.');
    setOpenId(''); setReject(null);
  };
  const log = ready ? data.log.filter((e) => !kind || e.kind === kind) : [];

  return (
    <GaFrame screen="AiActivity" active="ai-activity" page="Activity & approvals" css={CSS} after={(<>
      <Sheet open={!!req} title={req ? req.title : ''} onClose={() => { setOpenId(''); setReject(null); }}
        footer={req && req.status === 'waiting' ? <div className="ac-foot">
          {reject ? (<><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setReject(null)}>Back</button><button type="button" className="gc-btn gc-btn--sm gc-btn--error" onClick={() => act('reject', reject.reason)}>Reject</button></>)
            : (<><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" disabled={!mayApprove} onClick={() => setReject({ reason: '' })}>Reject</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" disabled={!mayApprove} onClick={() => act('approve')}>Approve</button></>)}
        </div> : null}>
        {req ? (
          <div className="ga-body" style={{ padding: 0 }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}><StatusBadge tone={AP_TONE[req.status]}>{AP_WORD[req.status]}</StatusBadge>{req.status === 'waiting' ? <span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>Expires in {left(req.expires, data.now)}</span> : null}</div>
            <p className="ac-change">{req.change}</p>
            <dl className="ac-kv">
              <dt>Kind</dt><dd>{(AP_KINDS[req.kind] || [req.kind])[0]}</dd>
              <dt>Asked from</dt><dd>{req.from}</dd>
              {req.customer ? <><dt>For</dt><dd>{req.customer}</dd></> : null}
              {req.record ? <><dt>Record</dt><dd>{req.record}</dd></> : null}
              {req.amount ? <><dt>Amount</dt><dd>{formatBDT(req.amount)}</dd></> : null}
              <dt>Why</dt><dd>{req.reason}</dd>
              <dt>Asked</dt><dd>{formatDateTime(new Date(req.at))}</dd>
              {req.decidedBy ? <><dt>{req.status === 'approved' ? 'Approved by' : 'Decided by'}</dt><dd>{req.decidedBy} · {formatDateTime(new Date(req.decidedAt))}</dd></> : null}
              {req.rejectReason ? <><dt>Reason</dt><dd>{req.rejectReason}</dd></> : null}
            </dl>
            {reject ? <Field label="Why is it rejected?" htmlFor="ac-why"><textarea id="ac-why" className="gc-input ga-area" rows={3} value={reject.reason} onChange={(e) => setReject({ reason: e.target.value })} autoFocus /></Field> : null}
            {!mayApprove && req.status === 'waiting' ? <p className="ga-locked"><Icon name="lock" width="13" height="13" aria-hidden="true" />{why('ai-approve')}</p> : null}
          </div>
        ) : null}
      </Sheet>
    </>)}>
      <ShopHeader icon="shield-check" title="Activity & approvals"
        about="GridAI never refunds, gives a discount above your limit, changes stock, deletes customer data or sends to many people by itself. It prepares the action and it waits here. Approving checks the request again at that moment; a request expires after 24 hours. The activity log shows everything the AI did, and Feedback shows how the team rated its answers." />
      <div className="ix-bar" style={{ padding: 0 }}><IndexTabs tabs={tabs} label="Activity & approvals" /></div>

      {tab === 'approvals' ? (
        <section className="ix-card" aria-label="Approvals">
          {!ready ? <div style={{ minHeight: 200 }} aria-busy="true" /> : !data.ap.length ? <div className="ix-empty"><EmptyState icon="shield-check" title="Nothing waits for approval" /></div> : (<>
            <ul className="ix-plist" aria-label="Approvals">{data.ap.map((r) => (
              <li key={r.id}><button type="button" className="ix-pitem" onClick={() => setOpenId(r.id)}><span className="ix-pitem__top"><b>{r.title}</b><StatusBadge tone={AP_TONE[r.status]}>{AP_WORD[r.status]}</StatusBadge></span><span className="ix-pitem__mid">{r.from} · {r.customer || r.record}</span></button></li>
            ))}</ul>
            <div className="ix-table-wrap">
              <table className="ix-table">
                <caption className="sr-only">Approvals</caption>
                <thead><tr><th scope="col">Request</th><th scope="col">From</th><th scope="col">For</th><th scope="col">Asked</th><th scope="col">Status</th></tr></thead>
                <tbody>{data.ap.map((r) => (
                  <tr key={r.id} onClick={() => setOpenId(r.id)}>
                    <td><span className="ac-row"><span className={'ac-ico' + (r.status === 'waiting' ? ' is-warn' : '')} aria-hidden="true"><Icon name={(AP_KINDS[r.kind] || [0, 'hand'])[1]} width="16" height="16" /></span><span><button type="button" className="ix-strong" style={{ textAlign: 'left' }} onClick={() => setOpenId(r.id)}><b>{r.title}</b></button><small>{r.detail}</small></span></span></td>
                    <td className="ix-muted">{r.from}</td>
                    <td>{r.customer || r.record}</td>
                    <td className="ix-muted">{formatDateTime(new Date(r.at))}</td>
                    <td><StatusBadge tone={AP_TONE[r.status]}>{AP_WORD[r.status]}</StatusBadge>{r.status === 'waiting' ? <small className="ix-muted" style={{ display: 'block', fontSize: 'var(--text-xs)' }}>{left(r.expires, data.now)} left</small> : null}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>)}
          <div className="ix-foot"><span>{ready ? waiting.length + ' waiting' : ''}</span>{ready && !mayApprove ? <span className="ga-locked"><Icon name="lock" width="13" height="13" aria-hidden="true" />{why('ai-approve')}</span> : null}</div>
        </section>
      ) : null}

      {tab === 'activity' ? (
        <section className="ix-card" aria-label="Activity">
          <div className="ix-bar"><span className="ix-tools"><select className="ix-pick" aria-label="Kind" value={kind} onChange={(e) => setKind(e.target.value)}><option value="">Everything</option>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></span></div>
          {!ready ? null : !mayLogs ? <div className="ix-empty"><EmptyState icon="lock" title={why('ai-logs')} /></div> : !log.length ? <div className="ix-empty"><EmptyState icon="history" title="No activity of this kind" /></div> : (
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table ix-table--static">
                <caption className="sr-only">Activity</caption>
                <thead><tr><th scope="col">What happened</th><th scope="col">Where</th><th scope="col">Who</th><th scope="col">When</th></tr></thead>
                <tbody>{log.slice(0, 100).map((e) => (
                  <tr key={e.id}>
                    <td><span className="ac-row"><span className="ac-ico" aria-hidden="true"><Icon name={KIND_ICON[e.kind] || 'dot'} width="16" height="16" /></span><span><b>{e.title}</b><small>{KIND_LABEL[e.kind]}{e.detail ? ' · ' + e.detail : ''}</small></span></span></td>
                    <td className="ix-muted">{e.channel ? channelName(e.channel) : '—'}{e.customer ? ' · ' + e.customer : ''}</td>
                    <td className="ix-muted">{e.by}</td>
                    <td className="ix-muted">{formatDateTime(new Date(e.at))}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      {tab === 'feedback' ? (
        <section className="ix-card" aria-label="Feedback">
          {!ready ? null : !data.fb.length ? <div className="ix-empty"><EmptyState icon="thumbs-up" title="No ratings yet" /></div> : (
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table ix-table--static">
                <caption className="sr-only">Feedback</caption>
                <thead><tr><th scope="col">Answer</th><th scope="col">Rating</th><th scope="col">Note</th><th scope="col">By</th><th scope="col">When</th></tr></thead>
                <tbody>{data.fb.map((f) => (
                  <tr key={f.id}><td><span style={{ display: 'block', maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.text || '—'}</span></td><td><StatusBadge tone={VERDICT[f.verdict].tone}>{VERDICT[f.verdict].label}</StatusBadge></td><td className="ix-muted">{f.note || '—'}</td><td className="ix-muted">{f.by}</td><td className="ix-muted">{formatDateTime(new Date(f.at))}</td></tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </GaFrame>
  );
}
