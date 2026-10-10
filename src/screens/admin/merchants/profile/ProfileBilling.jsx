'use client';
// Merchant 360° profile › Billing & payments (bills, payments, credit notes and adjustments, collection calls) and
// › Credits (the prepaid GridCommerce credits for SMS, WhatsApp, email and AI, plus account credit carried on bills).

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { StatusBadge, InfoTip } from '@/components/ui';
import { toast } from '@/runtime/ui';
import { KV, MetricStrip } from '@/components/ui/IndexKit';
import { HBars } from '@/components/charts/DashCharts';
import { dm, dmy, daysBetween, taka, monthLong, num } from '@/lib/platform/util';
import { REASON_LABEL, viaLabel } from '@/lib/platform/catalogue';
import { openInvoices, balance, invoiceState, storeCredit, sendPayLinks, paidVia } from '@/lib/platform/billing';
import { walletOf } from '@/lib/admin/merchants';
import { Card, Row, Empty, when } from './profileShared';

const INV_STATE = {
  nocharge: ['No charge · trial', 'neutral'], void: ['Void', 'neutral'], paid: ['Paid', 'success'], credited: ['Settled by credit', 'success'],
  due: ['Due', 'warning'], overdue: ['Overdue', 'error'],
};
const ADJ_STATE = { pending: ['Waiting 2nd approval', 'warning'], approved: ['Applied', 'success'], rejected: ['Rejected', 'neutral'] };
const ADJ_TYPE = { credit: 'Credit note', discount: 'Discount', charge: 'Extra charge', waive: 'Waiver' };

function Bills({ ctx }) {
  const { db, t, shop } = ctx;
  const [all, setAll] = useState(false);
  const bills = db.invoices.filter((i) => i.shopId === shop.id).sort((a, b) => b.issuedAt - a.issuedAt);
  const shown = all ? bills : bills.slice(0, 6);
  return (
    <Card title="Bills" action={bills.length > 6 ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setAll(!all)}>{all ? 'Show fewer' : `All ${bills.length}`}</button> : null} flush={!bills.length} bare={!!bills.length}>
      {bills.length ? (
        <div className="ix-table-wrap ix-table-wrap--show">
          <table className="ix-table ix-table--static mp-table">
            <thead><tr><th scope="col">Bill</th><th scope="col">Period</th><th scope="col" className="ix-num">Amount</th><th scope="col">Due</th><th scope="col">State</th><th scope="col" className="ix-num">Balance</th></tr></thead>
            <tbody>
              {shown.map((i) => {
                const s = invoiceState(db, i, t);
                const [label, tone] = INV_STATE[s.key] || INV_STATE.due;
                const bal = balance(db, i);
                return (
                  <tr key={i.id}>
                    <td className="ix-nowrap"><span className="mp-data ix-strong">{i.id}</span></td>
                    <td>{monthLong(i.period)} {i.period.slice(0, 4)}</td>
                    <td className="ix-num mp-data">{taka(i.total)}</td>
                    <td className="ix-nowrap">{dm(i.dueAt)}</td>
                    <td><StatusBadge tone={tone}>{s.key === 'overdue' ? `${label} · ${s.days} d` : s.key === 'paid' ? `${label} ${dm(s.paidAt)}` : label}</StatusBadge></td>
                    <td className={'ix-num mp-data' + (bal ? ' ix-strong' : ' mp-muted')}>{taka(bal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : <Empty text="No bills yet." />}
    </Card>
  );
}

export function BillingTab({ ctx }) {
  const { db, t, shop, sub, view, owed, open } = ctx;
  const bills = openInvoices(db, shop.id);
  const late = bills.filter((i) => daysBetween(i.dueAt, t) > 0);
  const first = late[0] || bills[0];
  const pays = db.payments.filter((p) => p.shopId === shop.id && p.status === 'ok').sort((a, b) => b.at - a.at).slice(0, 6);
  const credits = db.credits.filter((c) => c.shopId === shop.id).sort((a, b) => b.at - a.at);
  const adjs = db.adjustments.filter((a) => a.shopId === shop.id).sort((a, b) => b.at - a.at).slice(0, 6);
  const calls = view.billing.calls;
  const threshold = (db.settings || {}).adjThreshold || 500;
  const link = () => { const r = sendPayLinks(shop.id); toast(r.count ? `Pay link sent by SMS (${r.count})` : 'No bill is due yet'); };

  return (
    <div className="ix-record">
      <div className="ix-main">
        {first ? (
          <div className={'mp-banner' + (late.length ? ' mp-banner--err' : '')} role="status">
            <Icon name={late.length ? 'clock-alert' : 'receipt'} width="18" height="18" aria-hidden="true" />
            <p><b>{first.id} · {taka(balance(db, first))}</b> {late.length ? `overdue ${daysBetween(first.dueAt, t)} days` : `due ${dm(first.dueAt)}`}{bills.length > 1 ? ` · ${bills.length} bills open, ${taka(owed)} in all` : ''}</p>
            <button type="button" className="ix-btn ix-btn--sm" onClick={link}>Send pay link</button>
            <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => open('pay', { invoiceId: first.id })}>Record payment</button>
          </div>
        ) : (
          <div className="mp-banner mp-banner--ok" role="status"><Icon name="circle-check" width="18" height="18" aria-hidden="true" /><p>Nothing owed{view.billing.nextDue ? ` · next bill ${dm(view.billing.nextDue)}` : ''}.</p></div>
        )}

        <Bills ctx={ctx} />

        <Card title="Payments" flush>
          {pays.length ? pays.map((p) => (
            <Row key={p.id} title={<>{taka(p.amount)} <span className="mp-muted">for</span> <span className="mp-data">{p.invoiceId}</span></>}
              sub={<>{paidVia(p)}{p.txId ? <> · <span className="mp-data">{p.txId}</span></> : null} · {p.by} · {when(p.at, t)}</>} />
          )) : <Empty text="No payments yet." />}
        </Card>

        <Card title="Credit notes and adjustments" action={<span className="mp-tools"><InfoTip label="About adjustments" text={`Bills are never edited: corrections are credit notes. Up to ${taka(threshold)} an adjustment applies at once; above it a second person (Finance or an Admin) approves, never the one who asked.`} /><button type="button" className="ix-btn ix-btn--sm" onClick={() => open('adjust')}>Request adjustment</button></span>} flush>
          {adjs.length || credits.length ? (
            <>
              {adjs.map((a) => {
                const [label, tone] = ADJ_STATE[a.status] || ADJ_STATE.pending;
                return <Row key={a.id} title={<><span className="mp-data">{a.id}</span> · {ADJ_TYPE[a.type] || a.type} {taka(a.amount)}</>} sub={`${REASON_LABEL[a.reason] || a.reason} · ${a.invoiceId === 'next' ? 'next bill' : a.invoiceId} · asked by ${a.by}, ${when(a.at, t)}${a.cnId ? ' · ' + a.cnId : ''}`} end={<StatusBadge tone={tone}>{label}</StatusBadge>} />;
              })}
              {credits.filter((c) => !adjs.some((a) => a.cnId === c.id)).slice(0, 4).map((c) => (
                <Row key={c.id} title={<><span className="mp-data">{c.id}</span> · credit note {taka(c.amount)}</>} sub={`${REASON_LABEL[c.reason] || c.reason} · ${c.invoiceId} · ${c.by}, ${when(c.at, t)}`} end={<StatusBadge tone="success">Issued</StatusBadge>} />
              ))}
            </>
          ) : <Empty text="No credit notes or adjustments." />}
        </Card>
      </div>

      <div className="ix-side">
        <Card title="Collecting">
          <KV rows={[
            ['Owed', <span key="o" className={'mp-data' + (owed ? ' mp-bad' : '')}>{taka(owed)}</span>],
            ['Collected by', sub.autoCharge ? `Auto-charge · ${sub.payMethod}` : 'Hand · pay link or call'],
            ['Usually pays', pays[0] ? `${pays[0].method} · ${viaLabel(pays[0].via).toLowerCase()}` : '—'],
            ['Paid lifetime', <span key="l" className="mp-data">{taka(db.payments.filter((p) => p.shopId === shop.id && p.status === 'ok').reduce((s, p) => s + p.amount, 0))}</span>],
          ]} />
        </Card>
        <Card title="Calls" action={<button type="button" className="ix-btn ix-btn--sm" onClick={() => open('call')}>Log a call</button>} flush>
          {calls.length ? calls.map((c) => <Row key={c.id} title={c.text} sub={`${c.at} · ${c.by}`} />) : <Empty text="No calls yet." />}
        </Card>
      </div>
    </div>
  );
}

export function CreditsTab({ ctx }) {
  const { db, t, shop, open } = ctx;
  const w = walletOf(db, shop.id, t);
  const carried = storeCredit(db, shop.id);
  const rows = w.byService.filter((s) => s.cost > 0);
  return (
    <div className="ix-record">
      <div className="ix-main">
        <MetricStrip label="Credits" items={[
          { label: 'Credits balance', value: taka(w.balance), sub: w.balance < 300 ? 'low' : null, icon: 'wallet' },
          { label: 'Spent this month', value: taka(w.spent), icon: 'send' },
          { label: 'Account credit on bills', value: taka(carried), sub: carried ? 'comes off the next bill' : null, icon: 'receipt' },
        ]} />
        <Card title="Spent this month, by service">
          {rows.length ? (
            <HBars rows={rows.map((s, k) => ({ key: s.key, label: s.label, sub: `${num(s.count)} ${s.key === 'calls' ? 'minutes' : 'sent'}`, value: s.cost, text: taka(s.cost), color: `var(--viz-${[1, 3, 4, 5, 2][k] || 1})` }))} />
          ) : <Empty text="Nothing spent this month." />}
        </Card>
      </div>
      <div className="ix-side">
        <Card title="Top-ups" action={<button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => open('credits')}>Add credits</button>} flush>
          {w.topups.length ? w.topups.slice(0, 8).map((x) => <Row key={x.id} title={taka(x.amount)} sub={`${x.note} · ${x.by} · ${x.seeded ? dmy(x.at) : when(x.at, t)}`} />) : <Empty text="No top-ups yet." />}
        </Card>
      </div>
    </div>
  );
}
