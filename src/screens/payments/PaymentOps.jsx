'use client';
// PaymentOps — "Payments": the one workspace for customer payments after they are taken (brief #5,
// "Payments Operations"). A Shopify list page (docs/shopify-style.md):
//   figures   to check, references used twice, open refunds, failed refunds, card batch differences (each opens
//             its view)
//   card      four views:
//     Transactions   manual bKash / Nagad / Rocket / bank payments customers reported, with the duplicate-
//                    reference check; a row opens the review panel (one checker at a time)
//     Refunds        requested → approved → sent → done, or failed (with Retry); the age of each
//     Payment links  links made from an order or invoice: amount, expiry, one-time or reusable, paid state
//     Card batches   each card machine's end-of-day batch total against the card sales of that terminal and day
// Payouts from gateways and couriers stay on /settlements; where the money sits is Money.
// ?tab=tx|refunds|links|batches · ?view= · ?open=<MP-/RF-/PL- id> opens its panel · ?new=link|refund|batch
// Front end only: lib/manualPayments.js, refunds.js, paymentLinks.js, terminalBatches.js, paymentRefs.js.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { EmptyState, StatusBadge } from '@/components/ui';
import { MetricStrip, IndexTabs, SearchField, LearnMore } from '@/components/ui/IndexKit';
import { formatDate } from '@/lib/format';
import { getManualPayments, duplicateOf, STATUS as MP_STATUS } from '@/lib/manualPayments';
import { lockOf } from '@/lib/paymentRefs';
import { getRefunds, ageText, ageHours, STAGE_LABEL, STAGE_TONE } from '@/lib/refunds';
import { getLinks, linkStatus, STATUS_TEXT, STATUS_TONE } from '@/lib/paymentLinks';
import { batchRows, needsLook, BATCH_STATUS } from '@/lib/terminalBatches';
import { AccPage, useBooks, money, shortDate } from '@/screens/accounts/accShared';
import { PaymentReview, RefundPanel, LinkPanel, BatchPanel, LinkDialog, RefundDialog, BatchDialog, PAY_CSS } from './payShared';
import { ModuleSetup } from '@/components/ModuleSetup';

const TABS = [['tx', 'Transactions'], ['refunds', 'Refunds'], ['links', 'Payment links'], ['batches', 'Card batches']];
const VIEWS = {
  tx: [['check', 'To check'], ['done', 'Verified'], ['rejected', 'Rejected'], ['all', 'All']],
  refunds: [['open', 'Open'], ['failed', 'Failed'], ['done', 'Done'], ['all', 'All']],
  links: [['active', 'Active'], ['paid', 'Paid'], ['expired', 'Expired'], ['all', 'All']],
  batches: [['look', 'Needs a look'], ['all', 'All']],
};
const ABOUT = 'Customer payments after they are taken: manual payments to check, refunds and their stages, payment links, and card machine batches. Payouts from gateways and couriers are on Payouts.';
const CSS = `
.po-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.po-sub{display:flex;flex-wrap:wrap;gap:var(--space-2);padding:var(--space-3) var(--space-4) 0}
.po-lock{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);color:var(--text-muted)}
.po-out{color:var(--text-danger)}
`;

const inView = {
  tx: (v, mp) => (v === 'check' ? mp.status === 'waiting' || mp.status === 'correction' : v === 'done' ? mp.status === 'verified' || mp.status === 'part' : v === 'rejected' ? mp.status === 'rejected' : true),
  refunds: (v, rf) => (v === 'open' ? ['requested', 'approved', 'sent'].includes(rf.stage) : v === 'failed' ? rf.stage === 'failed' : v === 'done' ? rf.stage === 'done' || rf.stage === 'cancelled' : true),
  links: (v, l, now) => v === 'all' || linkStatus(l, now) === v || (v === 'expired' && linkStatus(l, now) === 'cancelled'),
  batches: (v, b) => v === 'all' || needsLook(b) || b.status === 'missing',
};

export default function PaymentOps() {
  const tick = useBooks();
  const [tab, setTab] = useState('tx');
  const [view, setView] = useState('check');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const [panel, setPanel] = useState(null);    // { kind: 'mp'|'rf'|'pl'|'bt', id }
  const [dialog, setDialog] = useState(null);  // 'link' | 'refund' | 'batch' | 'import'
  const booted = useRef(false);

  const d = useMemo(() => {
    if (!tick) return null;
    const now = Date.now();
    const mps = getManualPayments();
    const refunds = getRefunds();
    const links = getLinks();
    const batches = batchRows();
    const toCheck = mps.filter((m) => m.status === 'waiting' || m.status === 'correction');
    return {
      now, mps, refunds, links, batches,
      fig: {
        check: toCheck.length, checkAmt: toCheck.reduce((a, m) => a + m.claimed, 0),
        dups: toCheck.filter((m) => duplicateOf(m)).length,
        open: refunds.filter((r) => ['requested', 'approved', 'sent'].includes(r.stage)),
        failed: refunds.filter((r) => r.stage === 'failed'),
        diffs: batches.filter(needsLook),
      },
    };
  }, [tick]);

  const pick = (t, v) => {
    setTab(t); setView(v || VIEWS[t][0][0]);
    const u = new URL(window.location.href); u.searchParams.set('tab', t); u.searchParams.delete('open'); if (v) u.searchParams.set('view', v); else u.searchParams.delete('view');
    window.history.replaceState(window.history.state, '', u.pathname + u.search);
  };
  useEffect(() => {
    if (!tick || booted.current) return;
    booted.current = true;
    const u = new URLSearchParams(window.location.search);
    const t = u.get('tab');
    if (TABS.some((x) => x[0] === t)) { setTab(t); const v = u.get('view'); setView(VIEWS[t].some((x) => x[0] === v) ? v : VIEWS[t][0][0]); }
    const id = u.get('open') || '';
    const kind = id.startsWith('MP-') ? 'mp' : id.startsWith('RF-') ? 'rf' : id.startsWith('PL-') ? 'pl' : '';
    if (kind) { setPanel({ kind, id }); const tt = { mp: 'tx', rf: 'refunds', pl: 'links' }[kind]; setTab(tt); setView('all'); }
    const nw = u.get('new');
    if (['link', 'refund', 'batch'].includes(nw)) setDialog(nw);
  }, [tick]);

  const words = q.trim().toLowerCase();
  const has = (...xs) => !words || xs.join(' ').toLowerCase().includes(words);
  const rows = !d ? [] : tab === 'tx' ? d.mps.filter((m) => inView.tx(view, m) && has(m.order, m.customer, m.txn, m.method, m.sender))
    : tab === 'refunds' ? d.refunds.filter((r) => inView.refunds(view, r) && has(r.id, r.ref, r.customer, r.method, r.providerRef))
      : tab === 'links' ? d.links.filter((l) => inView.links(view, l, d.now) && has(l.ref, l.customer, l.code))
        : d.batches.filter((b) => inView.batches(view, b) && has(b.terminal, b.day, b.term && b.term.branch));
  const closePanel = () => { setPanel(null); const u = new URL(window.location.href); if (u.searchParams.has('open')) { u.searchParams.delete('open'); window.history.replaceState(window.history.state, '', u.pathname + u.search); } };
  const closeFind = () => { setQ(''); setFind(false); };
  const row = (kind, id) => (e) => { if (e.target.closest('a,button:not(.ix-pitem)')) return; setPanel({ kind, id }); };

  const tabs = TABS.map(([id, label]) => ({ key: id, id: 'po-tab-' + id, label, count: d ? { tx: d.fig.check, refunds: d.fig.open.length + d.fig.failed.length, links: d.links.filter((l) => linkStatus(l, d.now) === 'active').length, batches: d.fig.diffs.length }[id] : null, on: tab === id, onClick: () => pick(id) }));
  const head = {
    icon: 'credit-card', about: ABOUT,
    secondary: [{ label: 'Record refund', onClick: () => setDialog('refund') }],
    more: [{ label: 'Enter card batch', onClick: () => setDialog('batch') }, { label: 'Import card batches', onClick: () => setDialog('import') }, { label: 'Payouts', href: '/settlements' }, { label: 'Approvals', href: '/money-approvals' }, { label: 'Money', href: '/money' }],
    primary: { label: 'Create payment link', onClick: () => setDialog('link') },
  };

  const empty = (title) => <div className="ix-empty"><EmptyState icon={words ? 'search-x' : 'circle-check'} title={words ? 'Nothing matches that search' : title} actionLabel={words ? 'Clear search' : undefined} onAction={words ? closeFind : undefined} /></div>;

  const txView = () => (rows.length ? (<>
    <ul className="ix-plist" aria-label="Transactions">{rows.map((m) => { const dup = duplicateOf(m); return (
      <li key={m.id}><button type="button" className="ix-pitem" onClick={() => setPanel({ kind: 'mp', id: m.id })}>
        <span className="ix-pitem__top"><b>{m.order} · {m.customer}</b><span className="po-fig">{money(m.claimed)}</span></span>
        <span className="ix-pitem__mid">{m.method} · {m.txn}</span>
        <span className="ix-pitem__tags"><StatusBadge tone={MP_STATUS[m.status][1]}>{MP_STATUS[m.status][0]}</StatusBadge>{dup ? <StatusBadge tone="error">Used before</StatusBadge> : null}</span>
      </button></li>); })}</ul>
    <div className="ix-table-wrap"><table className="ix-table gc-table--keep">
      <caption className="sr-only">Manual payments</caption>
      <thead><tr><th scope="col">Order</th><th scope="col">Sent</th><th scope="col">Customer</th><th scope="col">Method</th><th scope="col">Transaction ID</th><th scope="col">Status</th><th scope="col" className="ix-num">Amount</th></tr></thead>
      <tbody>{rows.map((m) => { const dup = duplicateOf(m); const lk = (m.status === 'waiting' || m.status === 'correction') && lockOf(m.id); return (
        <tr key={m.id} onClick={row('mp', m.id)} title={dup || undefined}>
          <td className="ix-strong">{m.order}</td>
          <td className="ix-nowrap">{shortDate(m.at)}</td>
          <td>{m.customer}</td>
          <td>{m.method}</td>
          <td><span className="po-fig">{m.txn}</span></td>
          <td>{dup ? <StatusBadge tone="error">Used before</StatusBadge> : <StatusBadge tone={MP_STATUS[m.status][1]}>{MP_STATUS[m.status][0]}</StatusBadge>}{lk ? <> <span className="po-lock"><Icon name="lock" width="12" height="12" aria-hidden="true" />{lk.name.split(' ')[0]}</span></> : null}</td>
          <td className="ix-num po-fig ix-strong">{money(m.claimed)}</td>
        </tr>); })}</tbody>
    </table></div>
  </>) : empty(view === 'check' ? 'Nothing to check' : 'No payments here'));

  const refundView = () => (rows.length ? (<>
    <ul className="ix-plist" aria-label="Refunds">{rows.map((r) => (
      <li key={r.id}><button type="button" className="ix-pitem" onClick={() => setPanel({ kind: 'rf', id: r.id })}>
        <span className="ix-pitem__top"><b>{r.id} · {r.customer}</b><span className="po-fig">{money(r.amount)}</span></span>
        <span className="ix-pitem__mid">{r.ref || '—'} · {r.method} · {ageText(r, d.now)}</span>
        <span className="ix-pitem__tags"><StatusBadge tone={STAGE_TONE[r.stage]}>{STAGE_LABEL[r.stage]}</StatusBadge></span>
      </button></li>))}</ul>
    <div className="ix-table-wrap"><table className="ix-table gc-table--keep">
      <caption className="sr-only">Refunds</caption>
      <thead><tr><th scope="col">Refund</th><th scope="col">For</th><th scope="col">Customer</th><th scope="col">Method</th><th scope="col">Stage</th><th scope="col">Age</th><th scope="col" className="ix-num">Amount</th></tr></thead>
      <tbody>{rows.map((r) => (
        <tr key={r.id} onClick={row('rf', r.id)} title={r.failReason || r.reason || undefined}>
          <td className="ix-strong">{r.id}</td>
          <td>{r.ref || '—'}</td>
          <td>{r.customer}</td>
          <td>{r.method}</td>
          <td><StatusBadge tone={STAGE_TONE[r.stage]}>{STAGE_LABEL[r.stage]}</StatusBadge></td>
          <td className={'ix-nowrap' + (['requested', 'approved', 'failed'].includes(r.stage) && ageHours(r, d.now) > 48 ? ' po-out' : ' ix-muted')}>{ageText(r, d.now)}</td>
          <td className="ix-num po-fig ix-strong">{money(r.amount)}</td>
        </tr>))}</tbody>
    </table></div>
  </>) : empty(view === 'failed' ? 'No failed refunds' : 'No refunds here'));

  const linkView = () => (rows.length ? (<>
    <ul className="ix-plist" aria-label="Payment links">{rows.map((l) => { const st = linkStatus(l, d.now); return (
      <li key={l.id}><button type="button" className="ix-pitem" onClick={() => setPanel({ kind: 'pl', id: l.id })}>
        <span className="ix-pitem__top"><b>{l.ref} · {l.customer}</b><span className="po-fig">{money(l.amount)}</span></span>
        <span className="ix-pitem__mid">{l.reusable ? 'Reusable' : 'One-time'} · expires {shortDate(l.expiresAt)}</span>
        <span className="ix-pitem__tags"><StatusBadge tone={STATUS_TONE[st]}>{STATUS_TEXT[st]}</StatusBadge></span>
      </button></li>); })}</ul>
    <div className="ix-table-wrap"><table className="ix-table gc-table--keep">
      <caption className="sr-only">Payment links</caption>
      <thead><tr><th scope="col">For</th><th scope="col">Made</th><th scope="col">Customer</th><th scope="col">Type</th><th scope="col">Expires</th><th scope="col">Status</th><th scope="col" className="ix-num">Amount</th></tr></thead>
      <tbody>{rows.map((l) => { const st = linkStatus(l, d.now); return (
        <tr key={l.id} onClick={row('pl', l.id)}>
          <td className="ix-strong">{l.ref}</td>
          <td className="ix-nowrap">{shortDate(l.createdAt)}</td>
          <td>{l.customer}</td>
          <td className="ix-muted">{l.reusable ? 'Reusable' : 'One-time'}</td>
          <td className="ix-nowrap">{formatDate(l.expiresAt)}</td>
          <td><StatusBadge tone={STATUS_TONE[st]}>{STATUS_TEXT[st]}</StatusBadge></td>
          <td className="ix-num po-fig ix-strong">{money(l.amount)}</td>
        </tr>); })}</tbody>
    </table></div>
  </>) : empty(view === 'active' ? 'No active links' : 'No links here'));

  const batchView = () => (rows.length ? (<>
    <ul className="ix-plist" aria-label="Card batches">{rows.map((b) => (
      <li key={b.key}><button type="button" className="ix-pitem" onClick={() => setPanel({ kind: 'bt', id: b.key })}>
        <span className="ix-pitem__top"><b>{b.terminal} · {shortDate(new Date(b.day + 'T12:00:00').getTime())}</b><span className={'po-fig' + (b.diff ? ' po-out' : '')}>{b.diff == null ? money(b.grid) : (b.diff < 0 ? '−' : b.diff > 0 ? '+' : '') + money(b.diff)}</span></span>
        <span className="ix-pitem__mid">Sales {money(b.grid)} · batch {b.batch ? money(b.batch.total) : '—'}</span>
        <span className="ix-pitem__tags"><StatusBadge tone={BATCH_STATUS[b.status][1]}>{BATCH_STATUS[b.status][0]}</StatusBadge></span>
      </button></li>))}</ul>
    <div className="ix-table-wrap"><table className="ix-table gc-table--keep">
      <caption className="sr-only">Card machine batches</caption>
      <thead><tr><th scope="col">Day</th><th scope="col">Terminal</th><th scope="col">Branch</th><th scope="col" className="ix-num">Card sales</th><th scope="col" className="ix-num">Batch total</th><th scope="col" className="ix-num">Difference</th><th scope="col">Status</th></tr></thead>
      <tbody>{rows.map((b) => (
        <tr key={b.key} onClick={row('bt', b.key)}>
          <td className="ix-nowrap">{shortDate(new Date(b.day + 'T12:00:00').getTime())}</td>
          <td className="ix-strong">{b.terminal}</td>
          <td className="ix-muted">{b.term ? b.term.branch : '—'}</td>
          <td className="ix-num po-fig">{money(b.grid)}</td>
          <td className="ix-num po-fig">{b.batch ? money(b.batch.total) : '—'}</td>
          <td className={'ix-num po-fig' + (b.diff ? ' po-out' : ' ix-muted')}>{b.diff == null ? '—' : b.diff ? (b.diff < 0 ? '−' : '+') + money(b.diff) : '৳0'}</td>
          <td><StatusBadge tone={BATCH_STATUS[b.status][1]}>{BATCH_STATUS[b.status][0]}</StatusBadge></td>
        </tr>))}</tbody>
    </table></div>
  </>) : empty(view === 'look' ? 'Every batch matches' : 'No batches yet'));

  const f = d && d.fig;
  return (
    <AccPage screen="PaymentOps" active="acc-payments" page="Payments" title="Payments" css={PAY_CSS + CSS} {...head}>
      <ModuleSetup area="area-payments" />
      <MetricStrip label="Payments" items={[
        { label: 'To check', value: f ? String(f.check) : '—', sub: f ? money(f.checkAmt) : '', onClick: () => pick('tx', 'check'), on: tab === 'tx' && view === 'check' },
        { label: 'Used before', value: f ? String(f.dups) : '—', sub: 'Transaction IDs', onClick: () => pick('tx', 'check') },
        { label: 'Open refunds', value: f ? String(f.open.length) : '—', sub: f ? money(f.open.reduce((a, r) => a + r.amount, 0)) : '', onClick: () => pick('refunds', 'open'), on: tab === 'refunds' && view === 'open' },
        { label: 'Failed refunds', value: f ? String(f.failed.length) : '—', sub: f ? money(f.failed.reduce((a, r) => a + r.amount, 0)) : '', onClick: () => pick('refunds', 'failed'), on: tab === 'refunds' && view === 'failed' },
        { label: 'Card batch differences', value: f ? String(f.diffs.length) : '—', sub: f ? money(f.diffs.reduce((a, b) => a + Math.abs(b.diff || 0), 0)) : '', onClick: () => pick('batches', 'look'), on: tab === 'batches' && view === 'look' },
      ]} />

      <section className="ix-card" aria-label="Payments">
        <div className="ix-bar">
          {find ? (<>
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order, customer, transaction ID…" onDone={closeFind} autoFocus />
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
          </>) : (<>
            <IndexTabs tabs={tabs} label="Payments" />
            <span className="ix-tools"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button></span>
          </>)}
        </div>
        <div className="po-sub ix-chips" role="group" aria-label="Show">
          {VIEWS[tab].map(([v, label]) => <button key={v} type="button" className="ix-chip" aria-pressed={view === v} onClick={() => pick(tab, v)}>{label}</button>)}
        </div>
        <div role="tabpanel" aria-labelledby={'po-tab-' + tab} style={{ marginTop: 'var(--space-3)' }}>
          {!d ? <p className="ac-wait">Reading the books…</p> : tab === 'tx' ? txView() : tab === 'refunds' ? refundView() : tab === 'links' ? linkView() : batchView()}
        </div>
        <div className="ix-foot"><span>{d ? `${rows.length} shown` : ''}</span></div>
      </section>
      <LearnMore topic="payments" />

      {panel && panel.kind === 'mp' ? <PaymentReview key={panel.id} id={panel.id} onClose={closePanel} /> : null}
      {panel && panel.kind === 'rf' ? <RefundPanel key={panel.id} id={panel.id} onClose={closePanel} /> : null}
      {panel && panel.kind === 'pl' ? <LinkPanel key={panel.id} id={panel.id} onClose={closePanel} /> : null}
      {panel && panel.kind === 'bt' ? <BatchPanel key={panel.id} rowKey={panel.id} onClose={closePanel} /> : null}
      {dialog === 'link' ? <LinkDialog onClose={(l) => { setDialog(null); if (l) { pick('links', 'active'); setPanel({ kind: 'pl', id: l.id }); } }} /> : null}
      {dialog === 'refund' ? <RefundDialog onClose={(rf) => { setDialog(null); if (rf) { pick('refunds', 'open'); setPanel({ kind: 'rf', id: rf.id }); } }} /> : null}
      {dialog === 'batch' || dialog === 'import' ? <BatchDialog importing={dialog === 'import'} onClose={(ok) => { setDialog(null); if (ok) pick('batches', 'all'); }} /> : null}
    </AccPage>
  );
}
