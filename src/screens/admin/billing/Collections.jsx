'use client';
// Collections (/admin/collections) — the day's call list: every store that owes (a bill issued and not paid), one row
// per store, grouped by how far it has gone: Grace (days 1–7, full access) · Read-only (days 8–14) · Suspended
// (day 15+) · Due soon (issued, not yet due; last, as a pay link usually does). Each row: owed, days overdue, the last call and its outcome, the promise-to-pay day, the next
// call and the collector, with Log a call as the row's action and Record payment, Extend grace, Send pay link and the
// store's profile under its menu. Four figures that the groups don't show: collected today, promised this week, calls
// made today and the call success rate (30 days). Collector filter and search.
// Data: lib/platform (views › collections, billing › logCall / recordPayment / sendPayLinks) and lib/admin/merchants
// (extendGrace). Worked out after the saved data loads.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { EmptyState, InfoTip } from '@/components/ui';
import { FilterBar } from '@/components/ui/FilterBar';
import { ShopHeader, MetricStrip, Menu } from '@/components/ui/IndexKit';
import { DAY, dm, startOfDay, hash, taka } from '@/lib/platform/util';
import { COLLECTORS, GRACE_DAYS, READONLY_DAYS } from '@/lib/platform/catalogue';
import { shopOf, outcomeLabel, openInvoices, sendPayLinks } from '@/lib/platform/billing';
import { collections } from '@/lib/platform/views';
import { downloadCsv } from '@/lib/reports/period';
import { toast, confirmDialog } from '@/runtime/ui';
import { AdminShell, usePlatform } from '../AdminShell';
import { BILL_CSS, Skeleton, money, plural, when, packageOf, payLink, PaySheet, CallSheet, GraceSheet } from './billingShared';

const CSS = `
.col-group .ix-card__head h2{display:flex;align-items:center;gap:var(--space-2)}
.col-group .ix-card__head h2 small{font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.col-dot{display:inline-block;width:8px;height:8px;border-radius:var(--radius-full);background:var(--border-strong)}
.col-dot.is-grace{background:var(--warning)}.col-dot.is-readonly{background:var(--error)}.col-dot.is-suspended{background:var(--text-danger)}
.col-od{font-family:var(--font-data);font-variant-numeric:tabular-nums;white-space:nowrap}
.col-call{display:flex;flex-direction:column;min-width:0;max-width:220px}
.col-call span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.col-call small{font-size:var(--text-xs);color:var(--text-muted)}
.col-who{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.col-who i{display:grid;place-items:center;width:22px;height:22px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);font-style:normal;font-weight:var(--weight-medium);color:var(--text-heading)}
.col-group .ix-table td{vertical-align:middle}
.col-filters{margin-bottom:0}
`;

const GROUPS = [
  ['grace', 'Grace', `Days 1–${GRACE_DAYS} overdue: the store still has full access, with a banner.`],
  ['readonly', 'Read-only', `Days ${GRACE_DAYS + 1}–${READONLY_DAYS}: the owner's admin is read-only; the storefront keeps selling.`],
  ['suspended', 'Suspended', `Day ${READONLY_DAYS + 1} on: the store and its admin are off until it pays.`],
  ['due', 'Due soon', 'Bills issued, not due yet or due today. A pay link is usually enough.'],
];
const stageOf = (key, od) => (key === 'suspended' ? 'suspended' : key === 'pastdue' ? 'readonly' : key === 'grace' || od > 0 ? 'grace' : 'due');
const ini = (name) => String(name || '').split(' ').map((w) => w[0]).join('').slice(0, 2);

/** One row per store that owes, from the per-bill view. */
function storeRows(db, t) {
  const view = collections(db, t);
  const by = new Map();
  for (const r of view.rows) {
    const x = by.get(r.shopId);
    if (!x) by.set(r.shopId, { rows: [r] }); else x.rows.push(r);
  }
  const today0 = startOfDay(t);
  const out = [];
  for (const [shopId, { rows }] of by) {
    const shop = shopOf(db, shopId);
    const oldest = rows.slice().sort((a, b) => b.overdueDays - a.overdueDays)[0];
    const since = Math.min(...openInvoices(db, shopId).map((i) => i.issuedAt));
    const calls = db.calls.filter((c) => c.shopId === shopId && c.at >= since).sort((a, b) => b.at - a.at);
    const real = calls.find((c) => c.outcome !== 'reminder');
    const last = real || calls[0] || null;
    const promise = calls.find((c) => c.outcome === 'promised' && c.promiseAt);
    const caller = real && COLLECTORS.includes(real.by) ? real.by : null;
    const collector = COLLECTORS.includes(shop.am) ? shop.am : caller || COLLECTORS[hash(shopId) % COLLECTORS.length];
    const owner = shop.owner && typeof shop.owner === 'object' ? shop.owner : { name: shop.owner || '' };
    out.push({
      shopId, name: shop.name, owner: owner.name, phone: owner.phone || '', pkg: packageOf(db, shopId),
      owed: rows.reduce((s, r) => s + r.amount, 0), bills: rows.map((r) => r.invoiceId), od: oldest.overdueDays,
      state: oldest.state, stage: stageOf(oldest.state.key, oldest.overdueDays),
      last, lastText: last ? (last.outcome === 'reminder' ? (/pay link/i.test(last.note) ? 'Pay link sent' : 'Panel reminder sent') : outcomeLabel(last.outcome)) : 'Not called yet',
      lastNote: last && last.outcome !== 'reminder' && last.note !== outcomeLabel(last.outcome) ? last.note : '',
      lastTone: !last ? '' : last.outcome === 'noanswer' || last.outcome === 'dispute' ? 'bl-bad' : '',
      noAnswer: calls.filter((c) => c.outcome === 'noanswer').length,
      promiseAt: promise ? promise.promiseAt : null, promiseBroken: promise ? promise.promiseAt < today0 : false, promiseMethod: promise ? promise.method : null,
      nextAt: oldest.nextAt, collector,
    });
  }
  return { rows: out.sort((a, b) => b.od - a.od || b.owed - a.owed), view };
}

/** The four figures: collected today, promised this week, calls today, call success rate (30 days). */
function figures(db, t, rows) {
  const today0 = startOfDay(t);
  const collected = db.payments.filter((p) => p.at >= today0 && p.at <= t && p.status === 'ok' && p.via !== 'auto');
  const promised = rows.filter((r) => r.promiseAt && r.promiseAt >= today0 && r.promiseAt < today0 + 8 * DAY);
  const calls = db.calls.filter((c) => c.outcome !== 'reminder');
  const today = calls.filter((c) => c.at >= today0 && c.at <= t);
  const month = calls.filter((c) => c.at >= t - 30 * DAY && c.at <= t);
  const good = month.filter((c) => ['paid', 'promised', 'panel'].includes(c.outcome)).length;
  return {
    collected: collected.reduce((s, p) => s + p.amount, 0), collectedN: collected.length,
    promised: promised.reduce((s, r) => s + r.owed, 0), promisedN: promised.length,
    callsToday: today.length,
    rate: month.length ? Math.round((good / month.length) * 100) : null, rateN: month.length,
  };
}

export default function Collections() {
  const { db, t, live } = usePlatform();
  const [who, setWho] = useState('');
  const [q, setQ] = useState('');
  const [sheet, setSheet] = useState(null);   // { kind: pay | call | grace, shopId, n }

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (COLLECTORS.includes(p.get('collector'))) setWho(p.get('collector'));
  }, []);
  const pickWho = (v) => {
    setWho(v);
    const p = new URLSearchParams(window.location.search);
    if (v) p.set('collector', v); else p.delete('collector');
    const s = p.toString();
    window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
  };
  const open = (kind, shopId) => setSheet({ kind, shopId, n: Date.now() });
  const close = () => setSheet(null);

  let data = null;
  let error = null;
  if (live) { try { data = storeRows(db, t); } catch (e) { error = e; } }
  const all = data ? data.rows : [];
  const s = q.trim().toLowerCase();
  const rows = all.filter((r) => (!who || r.collector === who) && (!s || [r.name, r.shopId, '#' + r.shopId, r.owner, r.phone, ...r.bills].join(' ').toLowerCase().includes(s)));
  const fig = data ? figures(db, t, all) : null;

  const exportCsv = () => {
    if (!rows.length) { toast('Nothing to export'); return; }
    downloadCsv('gridcommerce-collections.csv', [
      ['Store ID', 'Store', 'Owner', 'Phone', 'Stage', 'Owed (BDT)', 'Days overdue', 'Bills', 'Last call', 'Promised', 'Next call', 'Collector'],
      ...rows.map((r) => ['#' + r.shopId, r.name, r.owner, r.phone, (GROUPS.find((g) => g[0] === r.stage) || [])[1], r.owed, Math.max(0, r.od), r.bills.join('; '), r.lastText, r.promiseAt ? dm(r.promiseAt) : '', r.nextAt ? dm(r.nextAt) : '', r.collector]),
    ]);
    toast(plural(rows.length, 'store') + ' exported');
  };

  const sendAll = async () => {
    if (!(await confirmDialog({ title: `Send pay links to ${plural(rows.length, 'store')}?`, body: `Every store on ${who ? who.split(' ')[0] + '’s' : 'the'} list gets an SMS with a link to pay its unpaid bills, and a reminder in its panel.`, confirmLabel: 'Send links' }))) return;
    const n = rows.reduce((a, r) => a + ((sendPayLinks(r.shopId) || {}).count || 0), 0);
    toast(n ? `Pay links sent for ${plural(n, 'bill')}` : 'No bill is due yet');
  };

  const actions = (r) => [
    { label: 'Record payment', onClick: () => open('pay', r.shopId) },
    { label: 'Send pay link', onClick: () => payLink(r.shopId) },
    r.od > 0 ? { label: 'Extend grace', onClick: () => open('grace', r.shopId), tone: 'danger' } : null,
    { label: 'Open profile', href: '/admin/merchant?id=' + r.shopId + '&tab=billing' },
  ].filter(Boolean);

  const odText = (r) => (r.od > 0 ? plural(r.od, 'day') : r.od === 0 ? 'Due today' : `Due in ${plural(-r.od, 'day')}`);
  const promiseCell = (r) => (r.promiseAt
    ? <span className={r.promiseBroken ? 'bl-bad' : undefined}>{r.promiseBroken ? 'Missed ' : ''}{dm(r.promiseAt)}{r.promiseMethod ? <small className="bl-muted"> · {r.promiseMethod}</small> : null}</span>
    : <span className="bl-muted">—</span>);
  const nextCell = (r) => (r.nextAt ? <span className={r.nextAt < t ? 'bl-warn' : undefined}>{when(r.nextAt, t)}</span> : '—');

  let body;
  if (!live) body = <Skeleton strip label="Loading the call list" />;
  else if (error) {
    body = (
      <section className="ix-card"><div className="bl-err" role="alert">
        <Icon name="triangle-alert" width="24" height="24" aria-hidden="true" />
        <p style={{ margin: 0 }}>The call list could not be worked out.</p>
        <button type="button" className="ix-btn" onClick={() => window.location.reload()}>Try again</button>
      </div></section>
    );
  } else {
    body = (
      <>
        <MetricStrip label="Collections today" items={[
          { label: 'Collected today', value: money(fig.collected), sub: fig.collectedN ? plural(fig.collectedN, 'payment') : null, icon: 'banknote' },
          { label: 'Promised this week', value: money(fig.promised), sub: fig.promisedN ? plural(fig.promisedN, 'store') : null, icon: 'handshake' },
          { label: 'Calls made today', value: String(fig.callsToday), icon: 'phone' },
          { label: 'Call success rate', value: fig.rate == null ? '—' : fig.rate + '%', sub: fig.rateN ? `${plural(fig.rateN, 'call')}, 30 days` : null, icon: 'percent' },
        ]} />

        <section className="ix-card col-filters" aria-label="Filter the call list">
          <div className="bl-filters" style={{ borderBottom: 0 }}>
            <FilterBar label="Filter the call list" onClear={() => setQ('')}
              search={{ value: q, onChange: setQ, placeholder: 'Search store, ID, owner, phone or bill' }}
              filters={[{ key: 'who', label: 'Collector', all: 'All collectors', value: who, options: COLLECTORS.map((n) => [n, n]), onChange: pickWho }]} />
          </div>
        </section>

        {!all.length ? (
          <section className="ix-card"><div className="ix-empty"><EmptyState icon="circle-check" title="Nobody owes anything right now." actionLabel="Open invoices" onAction={() => { window.location.href = '/admin/invoices'; }} /></div></section>
        ) : !rows.length ? (
          <section className="ix-card"><div className="ix-empty"><EmptyState title="No store matches." actionLabel="Clear filters" onAction={() => { setQ(''); pickWho(''); }} /></div></section>
        ) : GROUPS.map(([key, label, help]) => {
          const list = rows.filter((r) => r.stage === key);
          if (!list.length) return null;
          const sum = list.reduce((a, r) => a + r.owed, 0);
          return (
            <section key={key} className="ix-card col-group" aria-label={label}>
              <div className="ix-card__head">
                <h2><span className={'col-dot is-' + key} aria-hidden="true" />{label}<small>{plural(list.length, 'store')} · {taka(sum)}</small></h2>
                <InfoTip label={'About ' + label} text={help} />
              </div>
              <ul className="ix-plist" aria-label={label}>
                {list.map((r) => (
                  <li key={r.shopId}>
                    <div className="ix-pitem ix-pitem--box">
                      <span className="ix-pitem__top"><b><Link href={'/admin/merchant?id=' + r.shopId}>{r.name}</Link></b><span className="bl-fig">{money(r.owed)}</span></span>
                      <span className="ix-pitem__mid">{odText(r)} · {r.lastText}{r.promiseAt ? ` · promised ${dm(r.promiseAt)}` : ''}</span>
                      <span className="ix-pitem__mid">Next call {r.nextAt ? when(r.nextAt, t) : '—'} · {r.collector}</span>
                      <span className="bl-pact">
                        <button type="button" className="ix-btn ix-btn--sm" onClick={() => open('call', r.shopId)}><Icon name="phone" width="16" height="16" aria-hidden="true" />Log a call</button>
                        {r.phone ? <a className="ix-btn ix-btn--sm" href={'tel:' + r.phone}>Call</a> : null}
                        <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={actions(r)} />
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table ix-table--static gc-table--keep">
                  <caption className="sr-only">{label}</caption>
                  <thead>
                    <tr>
                      <th scope="col">Store</th>
                      <th scope="col" className="ix-num">Owed</th>
                      <th scope="col">Overdue</th>
                      <th scope="col">Last call</th>
                      <th scope="col">Promised</th>
                      <th scope="col">Next call</th>
                      <th scope="col">Collector</th>
                      <th scope="col" className="bl-act"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((r) => (
                      <tr key={r.shopId}>
                        <td>
                          <span className="bl-name">
                            <Link href={'/admin/merchant?id=' + r.shopId + '&tab=billing'} className="ix-strong">{r.name}</Link>
                            <small>#{r.shopId} · {r.owner}{r.phone ? ' · ' + r.phone : ''}</small>
                          </span>
                        </td>
                        <td className="ix-num">
                          <span className="bl-name" style={{ alignItems: 'flex-end' }}>
                            <span className="bl-fig">{money(r.owed)}</span>
                            <small>{r.bills.length > 1 ? plural(r.bills.length, 'bill') : <Link href={'/admin/invoices/view?id=' + r.bills[0]} className="bl-data">{r.bills[0]}</Link>}</small>
                          </span>
                        </td>
                        <td className={'col-od' + (r.od > 0 ? ' bl-bad' : ' bl-muted')}>{odText(r)}</td>
                        <td>
                          <span className="col-call">
                            <span className={r.lastTone}>{r.lastText}{r.noAnswer > 1 && r.last && r.last.outcome === 'noanswer' ? ` × ${r.noAnswer}` : ''}</span>
                            <small>{r.last ? [r.lastNote, when(r.last.at, t)].filter(Boolean).join(' · ') : '—'}</small>
                          </span>
                        </td>
                        <td className="ix-nowrap">{promiseCell(r)}</td>
                        <td className="ix-nowrap">{nextCell(r)}</td>
                        <td><span className="col-who"><i aria-hidden="true">{ini(r.collector)}</i>{r.collector.split(' ')[0]}</span></td>
                        <td className="bl-act">
                          <span className="bl-act__in">
                            <button type="button" className="ix-btn ix-btn--sm" onClick={() => open('call', r.shopId)} aria-label={'Log a call to ' + r.name}><Icon name="phone" width="16" height="16" aria-hidden="true" />Log a call</button>
                            <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={actions(r)} />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </>
    );
  }

  return (
    <AdminShell active="collections" title="Collections">
      <style dangerouslySetInnerHTML={{ __html: BILL_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="phone-call" title="Collections"
          about="The day's call list: every store with an unpaid bill, grouped by how far it has gone (due soon, grace, read-only, suspended). Call, log the outcome and the promised day, record the payment with its transaction ID, or send a pay link. Extending grace moves the bill's due date on; the money is still owed."
          secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv }]}
          more={[{ label: 'All invoices', href: '/admin/invoices?tab=overdue' }]}
          primary={live && rows.length ? { label: 'Send pay links', icon: 'send', onClick: sendAll } : null} />
        {body}
      </div>
      {sheet && sheet.kind === 'pay' ? <PaySheet key={sheet.n} db={db} t={t} shopId={sheet.shopId} close={close} /> : null}
      {sheet && sheet.kind === 'call' ? <CallSheet key={sheet.n} db={db} t={t} shopId={sheet.shopId} close={close} onPaid={() => open('pay', sheet.shopId)} /> : null}
      {sheet && sheet.kind === 'grace' ? <GraceSheet key={sheet.n} db={db} t={t} shopId={sheet.shopId} close={close} /> : null}
    </AdminShell>
  );
}
