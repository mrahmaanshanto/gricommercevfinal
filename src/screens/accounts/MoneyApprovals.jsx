'use client';
// MoneyApprovals — "Approvals": expenses, money moves, refunds and write-offs over a limit wait here for a second
// person (brief #6, "approval limits" and "separate duties"). A Shopify list page (docs/shopify-style.md):
//   figures   waiting, the money waiting, the oldest
//   card      views Waiting · Approved · Denied · All, a kind filter, search; a row opens the review panel
//   panel     what it is, the facts, the limit it passed, who asked and when; Approve posts it (approvalActions.js),
//             Deny asks for a reason. The person who made it can't decide it (they can take it back), and deciding
//             needs the Approver duty (Accounts setup › Approvals).
// ?id=<request id> opens it · ?view=waiting|approved|denied|all
// Front end only: lib/approvals.js (limits and requests), approvalActions.js, financeDuties.js.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState, Sheet, StatusBadge } from '@/components/ui';
import { MetricStrip, IndexTabs, SearchField, LearnMore, KV } from '@/components/ui/IndexKit';
import { formatDateTime } from '@/lib/format';
import { getRequests, getLimits, limitText, cancelRequest, KINDS, KIND_TEXT } from '@/lib/approvals';
import { decide } from '@/lib/approvalActions';
import { canDecide, peopleWith } from '@/lib/financeDuties';
import { AccPage, useBooks, useMe, money, shortDate } from './accShared';

const VIEWS = [['waiting', 'Waiting'], ['approved', 'Approved'], ['denied', 'Denied'], ['all', 'All']];
const TONE = { waiting: 'warning', approved: 'success', denied: 'error', cancelled: 'neutral' };
const WORD = { waiting: 'Waiting', approved: 'Approved', denied: 'Denied', cancelled: 'Taken back' };
const ABOUT = 'Expenses, money moves, refunds and write-offs over your limits wait here until someone with the Approver duty approves them. The person who made one can’t approve it.';
const CSS = `
.ma-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.ma-old{color:var(--text-danger)}
.ma{display:flex;flex-direction:column;gap:var(--space-4)}
.ma-sum{display:flex;flex-direction:column;gap:2px;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.ma-sum b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ma-sum span{font-size:var(--text-xs);color:var(--text-muted)}
.ma-foot{display:flex;flex-wrap:wrap;gap:var(--space-2);justify-content:flex-end;width:100%}
.ma-foot .ma-left{margin-right:auto}
.ma-area{height:auto;min-height:72px;padding:10px 12px}
`;
const hoursSince = (t, now) => Math.max(0, (now - t) / 36e5);
const ageWords = (t, now) => { const h = hoursSince(t, now); return h < 1 ? Math.max(1, Math.round(h * 60)) + ' min' : h < 48 ? Math.round(h) + ' h' : Math.round(h / 24) + ' d'; };

export default function MoneyApprovals() {
  const tick = useBooks();
  const me = useMe();
  const [view, setView] = useState('waiting');
  const [kind, setKind] = useState('');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const [openId, setOpenId] = useState('');
  const booted = useRef(false);

  const d = useMemo(() => (tick ? { now: Date.now(), list: getRequests(), limits: getLimits() } : null), [tick]);
  useEffect(() => {
    if (!tick || booted.current) return;
    booted.current = true;
    const u = new URLSearchParams(window.location.search);
    const v = u.get('view');
    if (VIEWS.some((x) => x[0] === v)) setView(v);
    const id = u.get('id');
    if (id && getRequests().some((r) => r.id === id)) setOpenId(id);
  }, [tick]);
  const pickView = (v) => { setView(v); const u = new URL(window.location.href); u.searchParams.set('view', v); u.searchParams.delete('id'); window.history.replaceState(window.history.state, '', u.pathname + u.search); };
  const close = () => { setOpenId(''); const u = new URL(window.location.href); if (u.searchParams.has('id')) { u.searchParams.delete('id'); window.history.replaceState(window.history.state, '', u.pathname + u.search); } };

  const words = q.trim().toLowerCase();
  const inView = (r) => (view === 'all' ? true : view === 'denied' ? r.status === 'denied' || r.status === 'cancelled' : r.status === view);
  const rows = d ? d.list.filter((r) => inView(r) && (!kind || r.kind === kind) && (!words || [r.title, r.byName, r.id, KIND_TEXT[r.kind]].join(' ').toLowerCase().includes(words))) : [];
  const waiting = d ? d.list.filter((r) => r.status === 'waiting') : [];
  const counts = d ? Object.fromEntries(VIEWS.map(([v]) => [v, d.list.filter((r) => (v === 'all' ? true : v === 'denied' ? r.status === 'denied' || r.status === 'cancelled' : r.status === v)).length])) : {};
  const tabs = VIEWS.map(([v, label]) => ({ key: v, id: 'ma-tab-' + v, label, count: d ? counts[v] : null, on: view === v, onClick: () => pickView(v) }));
  const ruleOf = (r) => (d ? d.limits.find((x) => x.id === r.rule) : null);
  const oldest = waiting.length ? Math.min(...waiting.map((r) => r.at)) : null;
  const open = openId && d ? d.list.find((r) => r.id === openId) : null;

  return (
    <AccPage screen="MoneyApprovals" active="acc-approvals" page="Approvals" title="Approvals" css={CSS} icon="badge-check" about={ABOUT}
      secondary={[{ label: 'Limits and duties', href: '/account-setup?tab=approvals' }]}
      more={[{ label: 'Income & expenses', href: '/expenses-bills' }, { label: 'Money', href: '/money' }, { label: 'Payments', href: '/payment-ops?tab=refunds' }, { label: 'Dues', href: '/dues' }]}>
      <MetricStrip label="Approvals" items={[
        { label: 'Waiting', value: d ? String(waiting.length) : '—', sub: d ? [...new Set(waiting.map((r) => KIND_TEXT[r.kind]))].join(', ') || 'Nothing waiting' : '', onClick: () => pickView('waiting'), on: view === 'waiting' },
        { label: 'Money waiting', value: d ? money(waiting.reduce((a, r) => a + r.amount, 0)) : '—' },
        { label: 'Oldest', value: oldest ? ageWords(oldest, d.now) : '—', sub: oldest ? shortDate(oldest) : '' },
      ]} />

      <section className="ix-card" aria-label="Approvals">
        <div className="ix-bar">
          {find ? (<>
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="What, who…" onDone={() => { setQ(''); setFind(false); }} autoFocus />
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setQ(''); setFind(false); }}>Cancel</button>
          </>) : (<>
            <IndexTabs tabs={tabs} label="Approvals" />
            <span className="ix-tools">
              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
            </span>
          </>)}
        </div>
        <div className="ix-filters" role="group" aria-label="Filters">
          <select aria-label="Kind" className={'ix-filter' + (kind ? ' is-set' : '')} value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">Kind</option>
            {KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          {kind ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setKind('')}>Clear all</button> : null}
        </div>
        <div role="tabpanel" aria-labelledby={'ma-tab-' + view}>
          {!d ? <p className="ac-wait">Reading the books…</p> : rows.length ? (<>
            <ul className="ix-plist" aria-label="Requests">{rows.map((r) => (
              <li key={r.id}><button type="button" className="ix-pitem" onClick={() => setOpenId(r.id)}>
                <span className="ix-pitem__top"><b>{r.title}</b><span className="ma-fig">{money(r.amount)}</span></span>
                <span className="ix-pitem__mid">{KIND_TEXT[r.kind]} · {r.byName} · {ageWords(r.at, d.now)}</span>
                <span className="ix-pitem__tags"><StatusBadge tone={TONE[r.status]}>{WORD[r.status]}</StatusBadge></span>
              </button></li>))}</ul>
            <div className="ix-table-wrap"><table className="ix-table gc-table--keep">
              <caption className="sr-only">Approval requests</caption>
              <thead><tr><th scope="col">What</th><th scope="col">Kind</th><th scope="col">Asked by</th><th scope="col">Asked</th><th scope="col">Status</th><th scope="col" className="ix-num">Amount</th></tr></thead>
              <tbody>{rows.map((r) => (
                <tr key={r.id} onClick={() => setOpenId(r.id)} title={ruleOf(r) ? limitText(ruleOf(r)) : undefined}>
                  <td className="ix-strong">{r.title}</td>
                  <td className="ix-muted">{KIND_TEXT[r.kind]}</td>
                  <td>{r.byName}</td>
                  <td className={'ix-nowrap' + (r.status === 'waiting' && hoursSince(r.at, d.now) > 24 ? ' ma-old' : '')}>{shortDate(r.at)} · {ageWords(r.at, d.now)}</td>
                  <td><StatusBadge tone={TONE[r.status]}>{WORD[r.status]}</StatusBadge></td>
                  <td className="ix-num ma-fig ix-strong">{money(r.amount)}</td>
                </tr>))}</tbody>
            </table></div>
          </>) : <div className="ix-empty"><EmptyState icon={words ? 'search-x' : 'circle-check'} title={words ? 'Nothing matches that search' : view === 'waiting' ? 'Nothing waiting for approval' : 'Nothing here'} actionLabel={view !== 'waiting' ? 'Show waiting' : undefined} onAction={view !== 'waiting' ? () => pickView('waiting') : undefined} /></div>}
        </div>
        <div className="ix-foot"><span>{d ? `${rows.length} shown` : ''}</span></div>
      </section>
      <LearnMore topic="approvals" />

      {open ? <Review key={open.id} r={open} rule={ruleOf(open)} me={me} onClose={close} /> : null}
    </AccPage>
  );
}

/** The review panel: summary, facts, the limit, who asked; Approve / Deny in the footer. */
function Review({ r, rule, me, onClose }) {
  const [deny, setDeny] = useState(false);
  const [why, setWhy] = useState('');
  const may = me ? canDecide(me, r) : { ok: false, why: '' };
  const waiting = r.status === 'waiting';
  const mine = me && r.by === me.id;
  const approvers = peopleWith('approver').filter((u) => u.id !== r.by).map((u) => u.name.split(' ')[0]);
  const act = (verdict) => {
    const res = decide(r.id, verdict, me, why);
    if (!res.ok) { toast(res.message, { tone: 'error' }); return; }
    toast(res.message);
    onClose();
  };
  const takeBack = () => { if (cancelRequest(r.id, me)) { toast('Request taken back'); onClose(); } };
  const footer = !waiting ? <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button> : (
    <div className="ma-foot">
      {mine ? <button type="button" className="gc-btn gc-btn--neutral ma-left" onClick={takeBack}>Take back</button> : <span className="ma-left" />}
      {!may.ok ? <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button>
        : deny ? <>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDeny(false)}>Back</button>
          <button type="button" className="gc-btn gc-btn--solid gc-btn--error" onClick={() => act('deny')}>Deny</button>
        </> : <>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDeny(true)}>Deny</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={() => act('approve')}>Approve {money(r.amount)}</button>
        </>}
    </div>
  );
  return (
    <Sheet open title={r.title} onClose={onClose} footer={footer}>
      <div className="ma">
        <div className="ma-sum"><b>{money(r.amount)} · {KIND_TEXT[r.kind]}</b><span>Asked by {r.byName} · {formatDateTime(r.at)}</span></div>
        {waiting && !may.ok ? <div className="ac-note ac-note--warn" role="status"><Icon name="user-check" width="16" height="16" aria-hidden="true" /><span>{may.why}{approvers.length ? ` ${approvers.join(', ')} can approve it.` : ''}</span></div> : null}
        <KV rows={[
          // a write-off's invoice opens the invoice
          ...(r.facts || []).map(([k, v]) => (r.kind === 'write-off' && k === 'Invoice' && r.payload ? [k, <Link key="inv" href={'/sales-invoice?id=' + encodeURIComponent(r.payload.invoiceId)}>{v}</Link>] : [k, v])),
          rule ? ['Limit', limitText(rule)] : null,
          r.note ? ['Note', r.note] : null,
          r.status !== 'waiting' ? [WORD[r.status] + ' by', `${r.decidedName || '—'} · ${r.decidedAt ? formatDateTime(r.decidedAt) : ''}`] : null,
          r.reason ? ['Reason', r.reason] : null,
          r.kind === 'refund' && r.payload && r.payload.refundId ? ['Refund', <Link key="rf" href={'/payment-ops?open=' + encodeURIComponent(r.payload.refundId)}>{r.payload.refundId}</Link>] : null,
        ]} />
        {deny ? <div><label className="gc-label" htmlFor="ma-why">Why is it denied?</label><textarea id="ma-why" className="gc-input ma-area" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="e.g. Use the City Bank account for ads" data-autofocus /></div> : null}
        {waiting && may.ok && !deny ? <p className="gc-help" style={{ margin: 0 }}>{r.kind === 'expense' || r.kind === 'move' ? 'Approving posts it to the books now.' : r.kind === 'refund' ? 'Approving makes the refund ready to send.' : 'Approving lowers what the invoice still owes. No money moves.'}</p> : null}
      </div>
    </Sheet>
  );
}
