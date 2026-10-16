'use client';
// Services › Reports (/admin/services/reports?days=) — for a period: orders and revenue (fees before VAT, retainer months
// included) by service, on-time % (delivered by the deadline with paused time added), changes asked per order, rating
// by service and by expert, and repeat buyers (stores with more than one order).
// Batch D: costs (task payouts and other costs) and profit by service and by order, payouts owed and paid; custom offers
// count once paid.

import React, { useMemo, useState } from 'react';
import { ShopHeader, MetricStrip } from '@/components/ui/IndexKit';
import { reportOf } from '@/lib/platform/services';
import { AdminShell } from '../AdminShell';
import Link from 'next/link';
import { useSvc, tk, dShort, SVA_CSS } from './svcAdmin';

const PERIODS = [[30, 'Last 30 days'], [90, 'Last 90 days'], [365, 'Last 12 months']];

export default function SvcReports() {
  const { ready, tick } = useSvc();
  const [days, setDays] = useState(90);
  const r = useMemo(() => (ready ? reportOf(Date.now(), Date.now() - days * 864e5) : null), [ready, tick, days]);
  return (
    <AdminShell active="svc-reports" title="Services reports">
      <style dangerouslySetInnerHTML={{ __html: SVA_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="chart-column" title="Services reports" about="How the Services shop does: orders and revenue by service, delivery on time, changes asked, ratings by service and by expert, repeat buyers." secondary={[{ label: 'Orders', href: '/admin/services' }]} />
        <div className="sva-row"><select className="gc-input gc-select" style={{ width: 'auto' }} aria-label="Period" value={days} onChange={(e) => setDays(Number(e.target.value))}>{PERIODS.map(([d, l]) => <option key={d} value={d}>{l}</option>)}</select></div>
        {r ? (<>
          <MetricStrip label={PERIODS.find((p) => p[0] === days)[1]} items={[
            { label: 'Revenue', value: tk(r.revenue), sub: 'fees before VAT', icon: 'banknote' },
            { label: 'Profit', value: tk(r.profit), sub: r.revenue ? Math.round((r.profit / r.revenue) * 100) + '% of revenue' : '', icon: 'trending-up' },
            { label: 'Payouts', value: tk(r.cost), sub: `${tk(r.owed)} owed · ${tk(r.paidOut)} paid`, icon: 'hand-coins' },
            { label: 'Orders', value: String(r.orders), icon: 'clipboard-list' },
            { label: 'Repeat buyers', value: `${r.repeat} of ${r.buyers}`, sub: 'stores with 2+ orders', icon: 'repeat' },
          ]} />
          <section className="ix-card" aria-labelledby="sr-svc">
            <div className="ix-card__head"><h2 id="sr-svc">By service</h2></div>
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table ix-table--static gc-table--keep gc-table--scroll">
                <caption className="sr-only">Orders and revenue by service</caption>
                <thead><tr><th scope="col">Service</th><th scope="col" className="ix-num">Orders</th><th scope="col" className="ix-num">Revenue</th><th scope="col" className="ix-num">Costs</th><th scope="col" className="ix-num">Profit</th><th scope="col" className="ix-num">On time</th><th scope="col" className="ix-num">Changes / order</th><th scope="col">Rating</th></tr></thead>
                <tbody>{r.byService.map((x) => <tr key={x.id}><td>{x.name}</td><td className="ix-num">{x.orders}</td><td className="ix-num">{tk(x.revenue)}</td><td className="ix-num">{tk(x.cost)}</td><td className="ix-num">{tk(x.profit)}{x.margin != null ? <span className="sva-sub">{x.margin}%</span> : null}</td><td className="ix-num">{x.onTime == null ? '—' : x.onTime + '%'}</td><td className="ix-num">{x.revisions}</td><td>{x.rating.count ? `${x.rating.avg.toFixed(1)}★ (${x.rating.count})` : '—'}</td></tr>)}</tbody>
              </table>
            </div>
          </section>
          <section className="ix-card" aria-labelledby="sr-ord">
            <div className="ix-card__head"><h2 id="sr-ord">By order</h2></div>
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table ix-table--static gc-table--keep gc-table--scroll">
                <caption className="sr-only">Profit by order</caption>
                <thead><tr><th scope="col">Order</th><th scope="col">Service</th><th scope="col" className="ix-num">Revenue</th><th scope="col" className="ix-num">Payouts</th><th scope="col" className="ix-num">Other costs</th><th scope="col" className="ix-num">Profit</th></tr></thead>
                <tbody>{r.byOrder.map((x) => <tr key={x.o.id}><td><Link href={'/admin/service-order?id=' + x.o.id} className="ix-strong">{x.o.shopName}</Link><span className="sva-sub">{x.o.id} · {dShort(x.o.paid.at)}</span></td><td>{(r.byService.find((s) => s.id === x.o.serviceId) || { name: x.o.serviceId }).name}</td><td className="ix-num">{tk(x.revenue - x.refunds)}</td><td className="ix-num">{tk(x.tasks)}{x.owed ? <span className="sva-sub">{tk(x.owed)} owed</span> : null}</td><td className="ix-num">{tk(x.costs)}</td><td className="ix-num" style={{ color: x.profit < 0 ? 'var(--text-danger)' : undefined }}>{tk(x.profit)}</td></tr>)}</tbody>
              </table>
            </div>
          </section>
          <section className="ix-card" aria-labelledby="sr-ex">
            <div className="ix-card__head"><h2 id="sr-ex">By expert</h2></div>
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table ix-table--static gc-table--keep gc-table--scroll">
                <caption className="sr-only">Orders and rating by expert</caption>
                <thead><tr><th scope="col">Expert</th><th scope="col" className="ix-num">Orders</th><th scope="col" className="ix-num">Open now</th><th scope="col">Rating</th></tr></thead>
                <tbody>{r.byExpert.map((x) => <tr key={x.id}><td>{x.name}<span className="sva-sub">{x.kind === 'partner' ? 'Partner' : 'Staff'}</span></td><td className="ix-num">{x.orders}</td><td className="ix-num">{x.load} of {x.capacity}</td><td>{x.rating ? x.rating.toFixed(1) + '★' : '—'}</td></tr>)}</tbody>
              </table>
            </div>
          </section>
        </>) : <div style={{ minHeight: 240 }} aria-busy="true" />}
      </div>
    </AdminShell>
  );
}
