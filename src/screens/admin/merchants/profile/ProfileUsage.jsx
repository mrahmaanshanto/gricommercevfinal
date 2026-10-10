'use client';
// Merchant 360° profile › Messaging usage (this month's SMS, WhatsApp, email, AI replies and call minutes),
// › Resources (used against the plan's limits) and › Business activity (the store's own trading picture).

import React from 'react';
import { StatusBadge, InfoTip } from '@/components/ui';
import { MetricStrip, KV } from '@/components/ui/IndexKit';
import { ColumnChart, HBars, Legend } from '@/components/charts/DashCharts';
import { taka, num, monthLong } from '@/lib/platform/util';
import { PLAN_NAME } from '@/lib/platform/catalogue';
import { usageOf } from '@/lib/admin/merchants';
import { Card, Row, Empty, Meter, salesByMonth } from './profileShared';
import { nextPlan } from './ProfileOverview';

const COLORS = ['var(--viz-1)', 'var(--viz-3)', 'var(--viz-4)', 'var(--viz-5)', 'var(--viz-2)'];
const short = (n) => (n >= 1e5 ? (n / 1e5).toFixed(n >= 1e6 ? 0 : 1).replace(/\.0$/, '') + 'L' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : String(Math.round(n)));

export function MessagingTab({ ctx }) {
  const { db, t, shop } = ctx;
  const u = usageOf(db, shop, t);
  const total = u.comms.reduce((s, c) => s + c.cost, 0);
  const sent = u.comms.filter((c) => c.count > 0);
  return (
    <div className="ix-record">
      <div className="ix-main">
        <Card title={`Cost by service, ${monthLong(t)}`} action={<InfoTip label="How messaging is paid" text="Paid from the store's GridCommerce credits; the month's total is billed as one row per service when the month closes." />}>
          {sent.length ? (
            <>
              <HBars rows={u.comms.map((c, k) => ({ key: c.key, label: c.label, value: c.cost, text: taka(c.cost), color: COLORS[k] }))} />
              <div style={{ marginTop: 'var(--space-3)' }}><Legend items={u.comms.map((c, k) => ({ name: c.label, color: COLORS[k], value: num(c.count) }))} /></div>
            </>
          ) : <Empty text="Nothing sent this month." />}
        </Card>
      </div>
      <div className="ix-side">
        <Card title="This month" flush>
          {u.comms.map((c) => <Row key={c.key} title={c.label} sub={`${num(c.count)} ${c.key === 'calls' ? 'minutes' : c.key === 'ai' ? 'replies' : 'sent'}`} end={<span className="mp-fig">{taka(c.cost)}</span>} />)}
          <Row title="Total" end={<span className="mp-fig">{taka(total)}</span>} />
        </Card>
      </div>
    </div>
  );
}

export function ResourcesTab({ ctx }) {
  const { db, t, shop, sub, open } = ctx;
  const u = usageOf(db, shop, t);
  const pct = (r) => (r.unlimited || !r.limit ? 0 : Math.round((r.used / r.limit) * 100));
  const near = u.resources.filter((r) => !r.unlimited && r.limit && pct(r) >= 80);
  const up = nextPlan(sub.plan);
  const fmt = (r, n) => (r.key === 'storage' ? `${n} GB` : num(n));
  return (
    <>
      {near.length ? (
        <div className="mp-banner" role="status">
          <p><b>{near.length}</b> {near.length === 1 ? 'limit is' : 'limits are'} at 80% or more: {near.map((r) => r.label.toLowerCase()).join(', ')}.</p>
          {up ? <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => open('plan', { plan: up })}>Offer upgrade to {PLAN_NAME[up]}</button> : null}
        </div>
      ) : null}
      <Card title={`Used against the ${PLAN_NAME[sub.plan]} plan`} flush>
        {u.resources.map((r) => {
          const p = pct(r);
          return (
            <div key={r.key} className="mp-res">
              <span>{r.label}</span>
              <Meter used={r.used} limit={r.limit} unlimited={r.unlimited} label={r.label} />
              <span>
                <span className="mp-data">{fmt(r, r.used)}</span>
                <span className="mp-muted"> / {r.unlimited ? 'Unlimited' : fmt(r, r.limit)}</span>
                {!r.unlimited && p >= 80 ? <> <StatusBadge tone={p > 100 ? 'error' : 'warning'}>{p > 100 ? 'Over' : p + '%'}</StatusBadge></> : null}
              </span>
            </div>
          );
        })}
      </Card>
    </>
  );
}

export function BusinessTab({ ctx }) {
  const { db, t, shop, view } = ctx;
  const series = salesByMonth(db, shop, t).slice(-12);
  const now = series[series.length - 1] || { orders: 0, sales: 0 };
  const kp = Object.fromEntries(view.overview.kpis.map((k) => [k.k, k]));
  const data = series.map((m) => ({ label: m.label, title: m.title, values: [m.sales] }));
  return (
    <div className="ix-record">
      <div className="ix-main">
        <MetricStrip label="Trading this month" items={[
          { label: 'Orders this month', value: num(now.orders), icon: 'receipt' },
          { label: 'Sales this month', value: taka(now.sales), icon: 'banknote' },
          kp.avg ? { label: 'Average order', value: kp.avg.value, icon: 'shopping-bag' } : null,
          kp.cust ? { label: 'Customers', value: kp.cust.value, sub: kp.cust.note, icon: 'users' } : null,
        ]} />
        <Card title="Sales by month">
          {series.length > 1 ? (
            <ColumnChart label="The store's sales by month, last 12 months" data={data} series={[{ name: 'Sales', color: 'var(--viz-1)' }]} fmt={taka} tickFmt={short} height={200} now={series.length - 1} />
          ) : <Empty text="Not a full month of trading yet." />}
          {kp.life ? <p className="mp-muted" style={{ margin: 'var(--space-3) 0 0', fontSize: 'var(--text-xs)' }}>Lifetime {kp.life.value} · {kp.orders ? kp.orders.value + ' orders' : ''} · the month in progress is so far.</p> : null}
        </Card>
      </div>
      <div className="ix-side">
        <Card title={`Team · ${view.overview.team.length}`} flush>
          {view.overview.team.map((p) => <Row key={p.name} icon="user-round" title={p.name} sub={`${p.role} · ${p.last}`} />)}
        </Card>
        <Card title="Connected" flush>
          {view.overview.integrations.length ? view.overview.integrations.map((i) => (
            <Row key={i.name} title={i.name} sub={i.text} end={<span className={'mp-dot' + (/err/.test(i.shp) ? ' is-err' : /warn/.test(i.shp) ? ' is-warn' : '')} aria-label={/err/.test(i.shp) ? 'Failing' : /warn/.test(i.shp) ? 'Warning' : 'Healthy'} role="img" />} />
          )) : <Empty text="Nothing connected." />}
        </Card>
        <Card title="Store">
          <KV rows={[['Segment', shop.segs.join(' · ')], ['Category', shop.cat], kp.paid ? ['Paid to GridCommerce', kp.paid.value] : null]} />
        </Card>
      </div>
    </div>
  );
}
