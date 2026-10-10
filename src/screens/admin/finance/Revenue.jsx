'use client';
// Revenue (/admin/revenue) — what GridCommerce earns, laid out like the merchant panel's Sales & profit
// (screens/accounts/SalesProfit.jsx): key figures, revenue by month split by source (subscriptions, add-ons, messaging
// credits, one-off charges), by package (Online / Retail / Wholesale), how recurring revenue moved (new, expansion,
// contraction, churn — an estimate worked out from today's bills), and the stores that paid the most. Export as CSV.
// Data: lib/admin/finance › revenueMonths, revenueByPackage, mrrNow, mrrMovement, topStores (from lib/platform payments).

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/runtime/ui';
import { InfoTip } from '@/components/ui';
import { MetricStrip, ShopHeader } from '@/components/ui/IndexKit';
import { ColumnChart, Donut, HBars, Legend, CHART_CSS } from '@/components/charts/DashCharts';
import { downloadCsv } from '@/lib/reports/period';
import { startOfMonth, addMonths } from '@/lib/platform/util';
import { revenueMonths, revenueByPackage, mrrNow, mrrMovement, topStores, SOURCES } from '@/lib/admin/finance';
import { AdminShell } from '../AdminShell';
import { FIN_CSS, SOURCE_COLORS, useFinance, money, short, tick, Skeleton, ErrorCard, Card, rowGo, rowKey } from './finShared';

const PKG_COLORS = { online: 'var(--viz-1)', retail: 'var(--viz-3)', wholesale: 'var(--viz-4)' };
const signedK = (n) => (n > 0 ? '+' : n < 0 ? '−' : '') + money(n);

function work(db, F, t) {
  const months = revenueMonths(db, F, t, 12);
  const from = addMonths(startOfMonth(t), -11, 1);
  const total = months.reduce((s, m) => s + m.net, 0);
  const bySource = Object.fromEntries(SOURCES.map(([k]) => [k, months.reduce((s, m) => s + m[k], 0)]));
  const refunds = months.reduce((s, m) => s + m.refunds, 0);
  const pkgs = revenueByPackage(db, from, t + 1);
  const mrr = mrrNow(db, t);
  const moves = mrrMovement(db, t, 6);
  const top = topStores(db, from, t + 1, 10);
  const cur = months[months.length - 1];
  const prev = months[months.length - 2];
  const thisMove = moves[moves.length - 1];
  return { months, total, bySource, refunds, pkgs, mrr, moves, top, cur, prev, thisMove };
}

export default function Revenue() {
  const router = useRouter();
  const { db, F, t, ready } = useFinance();
  let x = null, error = null;
  if (ready) { try { x = work(db, F, t); } catch (e) { error = e; } }

  const exportCsv = () => {
    if (!x) return;
    downloadCsv('gridcommerce-revenue-12-months.csv', [
      ['Month', ...SOURCES.map(([, l]) => l), 'Total', 'Refunds', 'Net', 'Payments'],
      ...x.months.map((m) => [m.title, ...SOURCES.map(([k]) => m[k]), m.total, m.refunds, m.net, m.payments]),
      [],
      ['Package', 'Collected, 12 months (BDT)', 'Recurring revenue now (BDT a month)'],
      ...x.pkgs.map((p) => [p.name, p.value, x.mrr[p.key]]),
      [],
      ['Recurring revenue movement (estimate)', 'Start', 'New', 'Expansion', 'Contraction', 'Churn', 'End'],
      ...x.moves.map((m) => [m.title, m.start, m.new, m.expansion, -m.contraction, -m.churn, m.end]),
      [],
      ['Top stores', 'Store ID', 'Package', 'Paid, 12 months (BDT)', 'Payments', 'Recurring now (BDT)'],
      ...x.top.map((s) => [s.name, '#' + s.shopId, s.pkg, s.paid, s.payments, s.mrr]),
    ]);
    toast('Revenue exported');
  };

  const header = (
    <ShopHeader icon="trending-up" title="Revenue"
      about="Money GridCommerce took in over the last 12 months, counted when the store paid: subscriptions (plans, proration, less discounts), add-on modules, messaging credits (SMS, WhatsApp, email and AI resold to stores) and one-off charges (extra landing pages, migration, top-ups). Refunds to stores come off. Recurring revenue is what paying stores are billed each month now."
      more={[{ label: 'Invoices', href: '/admin/invoices' }, { label: 'Subscriptions', href: '/admin/subscriptions' }, { label: 'Payments', href: '/admin/payments' }]}
      primary={{ label: 'Export', icon: 'download', onClick: exportCsv }} />
  );

  let body;
  if (!ready) body = <Skeleton label="Loading revenue" />;
  else if (error) body = <ErrorCard what="The revenue figures" />;
  else {
    const netNew = x.thisMove.new + x.thisMove.expansion - x.thisMove.contraction - x.thisMove.churn;
    const srcParts = SOURCES.map(([k, l]) => ({ name: l, value: x.bySource[k], color: SOURCE_COLORS[k] })).filter((p) => p.value > 0);
    body = (
      <>
        <MetricStrip label="Key figures" items={[
          { label: 'Last 12 months', value: short(x.total), sub: x.refunds ? `after ${money(x.refunds)} refunds` : 'net', spark: x.months.map((m) => m.net) },
          { label: 'This month so far', value: short(x.cur.net), sub: `${short(x.prev.net)} last month`, icon: 'calendar' },
          { label: 'Recurring revenue', value: short(x.mrr.total), sub: `${short(x.mrr.total * 12)} a year`, href: '/admin/subscriptions', icon: 'repeat' },
          { label: 'Net new recurring', value: signedK(netNew), sub: 'this month · estimate', icon: 'trending-up' },
        ]} />

        <Card title="Revenue by month">
          <ColumnChart label="Revenue by source, last 12 months" data={x.months.map((m) => ({ label: m.label, title: m.title, values: SOURCES.map(([k]) => m[k]) }))}
            series={SOURCES.map(([k, l]) => ({ name: l, color: SOURCE_COLORS[k] }))} fmt={money} tickFmt={tick} height={240} now={11} />
          <div className="fn-legend"><Legend items={SOURCES.map(([k, l]) => ({ name: l, color: SOURCE_COLORS[k], value: short(x.bySource[k]) }))} /></div>
          <div className="fn-foot">
            <span>Refunds<b>{money(x.refunds)}</b></span>
            <span>Payments<b>{x.months.reduce((s, m) => s + m.payments, 0)}</b></span>
            <span>Best month<b>{[...x.months].sort((a, b) => b.net - a.net)[0].title}</b></span>
          </div>
        </Card>

        <div className="fn-grid fn-grid--half">
          <Card title="By package" action={<Link href="/admin/packages">Packages</Link>}>
            <HBars rows={x.pkgs.map((p) => ({ key: p.key, label: p.name, value: p.value, text: short(p.value), color: PKG_COLORS[p.key], sub: `${money(x.mrr[p.key])} a month now` }))} />
            <div className="fn-foot"><span>Subscriptions collected, last 12 months<b>{short(x.pkgs.reduce((s, p) => s + p.value, 0))}</b></span></div>
          </Card>
          <Card title="By source">
            {srcParts.length ? (
              <div className="fn-donut">
                <Donut label="Revenue by source, last 12 months" parts={srcParts} fmt={money} total={short(x.total)} totalLabel="12 months" size={128} thickness={16} />
                <Legend items={srcParts.map((p) => ({ name: p.name, color: p.color, value: Math.round((p.value / Math.max(1, x.total + x.refunds)) * 100) + '%' }))} />
              </div>
            ) : <p className="fn-empty">No revenue yet.</p>}
          </Card>
        </div>

        <Card flush title={<>Recurring revenue movement <InfoTip label="About the movement" text="New: stores that started paying. Expansion: stores paying more (upgrades, add-ons). Contraction: paying less. Churn: stopped paying (cancelled, paused or suspended). An estimate: a store's state at a past month end is worked out from today's bills, so a bill paid late counts as paid then." /></>} label="Recurring revenue movement">
          <div className="ix-table-wrap ix-table-wrap--show">
            <table className="ix-table ix-table--static gc-table--keep gc-table--scroll">
              <caption className="sr-only">Recurring revenue movement, last 6 months (estimate)</caption>
              <thead><tr>
                <th scope="col">Month</th><th scope="col" className="ix-num">Start</th><th scope="col" className="ix-num">New</th>
                <th scope="col" className="ix-num">Expansion</th><th scope="col" className="ix-num">Contraction</th><th scope="col" className="ix-num">Churn</th><th scope="col" className="ix-num">End</th>
              </tr></thead>
              <tbody>
                {x.moves.map((m) => (
                  <tr key={m.period}>
                    <th scope="row" className="ix-nowrap" style={{ textAlign: 'left', fontWeight: 'var(--weight-medium)' }}>{m.title}</th>
                    <td className="ix-num"><span className="fn-fig">{money(m.start)}</span></td>
                    <td className="ix-num"><span className={'fn-fig' + (m.new ? ' fn-in' : ' fn-muted')}>{m.new ? '+' + money(m.new) : '—'}</span></td>
                    <td className="ix-num"><span className={'fn-fig' + (m.expansion ? ' fn-in' : ' fn-muted')}>{m.expansion ? '+' + money(m.expansion) : '—'}</span></td>
                    <td className="ix-num"><span className={'fn-fig' + (m.contraction ? ' fn-out' : ' fn-muted')}>{m.contraction ? '−' + money(m.contraction) : '—'}</span></td>
                    <td className="ix-num"><span className={'fn-fig' + (m.churn ? ' fn-out' : ' fn-muted')}>{m.churn ? '−' + money(m.churn) : '—'}</span></td>
                    <td className="ix-num"><span className="fn-fig">{money(m.end)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card flush title="Top paying stores" action={<Link href="/admin/merchants?tab=paying">All merchants</Link>}>
          {x.top.length ? (
            <>
              <ul className="ix-plist" aria-label="Top paying stores">
                {x.top.map((s, i) => (
                  <li key={s.shopId}>
                    <Link href={'/admin/merchant?id=' + s.shopId} className="ix-pitem">
                      <span className="ix-pitem__top"><b>{i + 1}. {s.name}</b><span className="fn-fig">{money(s.paid)}</span></span>
                      <span className="ix-pitem__mid">#{s.shopId} · {s.pkg} · {s.payments} payments · {money(s.mrr)} a month</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table">
                  <caption className="sr-only">Stores that paid the most, last 12 months</caption>
                  <thead><tr><th scope="col">Store</th><th scope="col">Package</th><th scope="col" className="ix-num">Payments</th><th scope="col" className="ix-num">Paid, 12 months</th><th scope="col" className="ix-num">Recurring now</th></tr></thead>
                  <tbody>
                    {x.top.map((s) => {
                      const go = () => router.push('/admin/merchant?id=' + s.shopId);
                      return (
                        <tr key={s.shopId} tabIndex={0} onClick={rowGo(go)} onKeyDown={rowKey(go)}>
                          <td><span className="fn-name"><Link href={'/admin/merchant?id=' + s.shopId}>{s.name}</Link><small>#{s.shopId}</small></span></td>
                          <td className="ix-nowrap">{s.pkg}</td>
                          <td className="ix-num">{s.payments}</td>
                          <td className="ix-num"><span className="fn-fig">{money(s.paid)}</span></td>
                          <td className="ix-num"><span className={'fn-fig' + (s.mrr ? '' : ' fn-muted')}>{money(s.mrr)}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : <div className="fn-body"><p className="fn-empty">No store has paid in the last 12 months.</p></div>}
        </Card>
      </>
    );
  }

  return (
    <AdminShell active="revenue" title="Revenue">
      <style dangerouslySetInnerHTML={{ __html: FIN_CSS + CHART_CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>
    </AdminShell>
  );
}
