'use client';
// Executive dashboard (/admin) — GridCommerce's company at a glance, laid out like the merchant Home: the key figures
// in one strip, what needs someone today (at most five grouped rows), then one card per question: is recurring revenue
// growing, how are the merchants doing, is sales filling the funnel, is support keeping up, is the platform healthy,
// and does the money add up. Each card links to the page where the work is done.
// Figures: lib/admin/dashboard.js (merchants, revenue, collections from lib/platform; the rest from lib/admin/company).
// Worked out after the saved data loads, so the server render (UTC) shows the outline only.

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { MetricStrip } from '@/components/ui/IndexKit';
import { ColumnChart, Donut, HBars, Legend, CHART_CSS } from '@/components/charts/DashCharts';
import { downloadCsv } from '@/lib/reports/period';
import { formatBDT } from '@/lib/format';
import { executive, alerts, PERIODS } from '@/lib/admin/dashboard';
import { FUNNEL } from '@/lib/admin/company';
import { AdminShell, usePlatform } from './AdminShell';

const CSS = `
.dash-top{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.dash-top .ix-head{flex:1 1 auto}
.dash-grid{display:grid;gap:var(--space-4);align-items:start}
.dash-grid--2{grid-template-columns:minmax(0,2fr) minmax(0,1fr)}
.dash-grid--3{grid-template-columns:repeat(3,minmax(0,1fr))}
.dash-body{padding:var(--space-3) var(--space-4) var(--space-4)}
.dash-big{display:flex;align-items:baseline;flex-wrap:wrap;gap:var(--space-2);margin:0 0 var(--space-3);font-family:var(--font-data);font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.dash-big small{font-family:var(--font-sans);font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.dash-foot{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-5);margin-top:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.dash-foot b{margin-left:4px;font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.dash-rows{display:flex;flex-direction:column}
.dash-row{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:40px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body);text-decoration:none}
.dash-row:first-child{border-top:0}
.dash-row b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
a.dash-row:hover{color:var(--primary)}
.dash-donut{display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-3)}
.dash-donut .dch-legend{flex-direction:column;align-items:flex-start}
.dash-alerts{display:flex;flex-direction:column;padding:var(--space-1) var(--space-2) var(--space-2)}
.dash-alert{display:flex;align-items:center;gap:var(--space-3);min-height:48px;padding:6px var(--space-2);border-radius:var(--radius-lg);color:inherit;text-decoration:none}
.dash-alert:hover{background:var(--surface-subtle)}
.dash-alert__ic{flex:none;display:grid;place-items:center;width:32px;height:32px;border-radius:var(--radius-full);background:var(--fill-warning-soft);color:var(--text-warning)}
.dash-alert__ic--err{background:var(--fill-error-soft);color:var(--text-danger)}
.dash-alert__txt{flex:1;min-width:0;display:flex;flex-direction:column}
.dash-alert__txt b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.dash-alert__txt small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-xs);color:var(--text-muted)}
.dash-alert>svg{flex:none;color:var(--text-muted)}
.dash-mini{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-2);margin-bottom:var(--space-4)}
.dash-mini a,.dash-mini div{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-page);color:inherit;text-decoration:none}
.dash-mini a:hover{background:var(--surface-subtle)}
.dash-mini span{font-size:var(--text-xs);color:var(--text-muted)}
.dash-mini b{font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.dash-mini b.is-bad{color:var(--text-danger)}
.dash-sub{margin:0 0 var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.dash-meter{display:grid;grid-template-columns:64px minmax(0,1fr) 40px;align-items:center;gap:var(--space-2);min-height:28px;font-size:var(--text-sm);color:var(--text-body)}
.dash-meter b{text-align:right;font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--text-heading)}
.dash-meter__track{height:8px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.dash-meter__track span{display:block;height:100%;border-radius:var(--radius-full);background:var(--viz-1)}
.dash-meter__track span.is-warn{background:var(--warning)}
.dash-svc{display:flex;align-items:center;gap:var(--space-2);min-height:40px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body);text-decoration:none}
.dash-svc i{flex:none;width:8px;height:8px;border-radius:var(--radius-full);background:var(--success)}
.dash-svc i.is-warn{background:var(--warning)}
.dash-svc span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dash-svc small{flex:none;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.dash-fin{display:grid;grid-template-columns:minmax(0,3fr) minmax(240px,2fr);gap:var(--space-5);align-items:start}
.dash-net--bad{color:var(--text-danger)!important}
.dash-skel{height:260px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:dash-sk 1.4s ease infinite}
.dash-skel--strip{height:72px}
@keyframes dash-sk{from{background-position:100% 0}to{background-position:-100% 0}}
.dash-err{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);padding:var(--space-8) var(--space-4);text-align:center;font-size:var(--text-sm);color:var(--text-body)}
@media (max-width:1180px){.dash-grid--3{grid-template-columns:repeat(2,minmax(0,1fr))}.dash-grid--3>:last-child{grid-column:1/-1}}
@media (max-width:1023px){.dash-grid--2,.dash-fin{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.dash-grid--3{grid-template-columns:minmax(0,1fr)}.dash-mini b{font-size:var(--text-sm)}.dash-donut{flex-direction:column;align-items:flex-start}}
@media (prefers-reduced-motion:reduce){.dash-skel{animation:none}}
`;

const LADDER_COLORS = ['var(--viz-1)', 'var(--viz-3)', 'var(--viz-4)'];
const money = (n) => formatBDT(Math.round(Number(n) || 0));
const short = (n) => {
  const v = Math.abs(Number(n) || 0);
  const sign = n < 0 ? '−' : '';
  if (v >= 1e7) return sign + '৳' + (v / 1e7).toFixed(2).replace(/\.?0+$/, '') + ' Cr';
  if (v >= 1e5) return sign + '৳' + (v / 1e5).toFixed(2).replace(/\.?0+$/, '') + ' L';
  return sign + money(v);
};
const tick = (n) => (n >= 1e5 ? (n / 1e5).toFixed(n >= 1e6 ? 0 : 1).replace(/\.0$/, '') + 'L' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : String(Math.round(n)));
const pctText = (x) => (x == null ? null : (x >= 0 ? '▲ ' : '▼ ') + Math.abs(x).toFixed(1) + '%');
const share = (x) => (x == null ? '—' : Math.round(x * 100) + '%');

function Card({ title, link, children, label }) {
  return (
    <section className="ix-card" aria-label={label || title}>
      <div className="ix-card__head"><h2>{title}</h2>{link ? <Link href={link.href}>{link.label}</Link> : null}</div>
      <div className="dash-body">{children}</div>
    </section>
  );
}

export default function Dashboard() {
  const { db, t, live } = usePlatform();
  const [period, setPeriod] = useState('month');
  const [retry, setRetry] = useState(0);
  // worked out on every redraw (the data changes in place; usePlatform redraws on each change and every 20 s)
  let result = null;
  if (live) {
    try { result = { x: executive(db, t, period), todo: alerts(db, t) }; } catch (e) { result = { error: e, retry }; }
  }
  const x = result && result.x;
  const periodName = (PERIODS.find(([k]) => k === period) || [])[1] || '';

  const exportCsv = () => {
    if (!x) return;
    const f = x.figs, m = x.merchants;
    downloadCsv(`gridcommerce-dashboard-${period}.csv`, [
      ['GridCommerce · Executive dashboard', periodName],
      [],
      ['Figure', 'Value'],
      ['Monthly recurring revenue', Math.round(f.mrr)], ['Annual run rate', Math.round(x.mrr.arr)],
      ['Paying merchants', m.paying], ['Merchants on trial', m.trial], ['Behind on payment', m.late], ['Suspended', m.suspended],
      ['New merchants', m.newStores], ['Trial conversion', m.trialRate == null ? '' : Math.round(m.trialRate * 100) + '%'],
      ['Collected', Math.round(f.collected)], ['Owed to us', Math.round(f.owed)], ['Overdue', Math.round(f.overdue)],
      ['Monthly churn', f.churn.toFixed(1) + '%'], ['Average revenue per store', Math.round(x.unit.arpa)], ['Lifetime value', Math.round(x.unit.ltv)],
      ['Cost to win a store', x.unit.cac == null ? '' : Math.round(x.unit.cac)],
      [],
      ['Funnel', 'Count'], ...FUNNEL.map(([k, l]) => [l, x.funnel[k]]), ['Lost', x.funnel.lost],
      [],
      ['Money', 'Value'], ['Revenue', Math.round(x.finance.revenue)], ...x.finance.costs.map((c) => [c.name, c.value]), ['Net', Math.round(x.finance.net)],
    ]);
    toast('Dashboard exported');
  };

  const header = (
    <div className="dash-top">
      <header className="ix-head">
        <h1 className="ix-head__title"><span>Dashboard</span></h1>
        <span className="gc-pagehead__about" hidden>GridCommerce at a glance: recurring revenue, merchants, the sales funnel, support, the platform and the money, for the period you pick. Each card opens the page where the work is done.</span>
      </header>
      <div className="ix-head__actions">
        <select className="ix-pick" aria-label="Period" value={period} onChange={(e) => setPeriod(e.target.value)}>
          {PERIODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <button type="button" className="ix-btn" onClick={exportCsv} disabled={!x}><Icon name="download" width="16" height="16" aria-hidden="true" /><span>Export</span></button>
      </div>
    </div>
  );

  let body;
  if (!result) {
    body = (
      <div aria-busy="true" aria-label="Loading the dashboard" className="ix-page">
        <div className="dash-skel dash-skel--strip" />
        <div className="dash-grid dash-grid--2"><div className="dash-skel" /><div className="dash-skel" /></div>
      </div>
    );
  } else if (result.error) {
    body = (
      <section className="ix-card"><div className="dash-err" role="alert">
        <Icon name="triangle-alert" width="24" height="24" aria-hidden="true" />
        <p style={{ margin: 0 }}>The figures could not be worked out.</p>
        <button type="button" className="ix-btn" onClick={() => setRetry((n) => n + 1)}>Try again</button>
      </div></section>
    );
  } else {
    const f = x.figs, m = x.merchants, fin = x.finance, s = x.support;
    const stateParts = [
      { name: 'Paying', value: m.paying - m.late, color: 'var(--viz-1)' },
      { name: 'Trial', value: m.trial, color: 'var(--viz-3)' },
      { name: 'Behind on payment', value: m.late, color: 'var(--viz-4)' },
      { name: 'Suspended', value: m.suspended, color: 'var(--viz-8)' },
      { name: 'Paused', value: m.paused, color: 'var(--viz-quiet)' },
    ].filter((p) => p.value > 0);
    body = (
      <>
        <MetricStrip label={'Key figures, ' + periodName.toLowerCase()} items={[
          { label: 'Recurring revenue', value: short(f.mrr), sub: pctText(f.mrrChange), spark: f.mrrSpark, href: '/admin/subscriptions' },
          { label: 'Paying merchants', value: String(m.paying), sub: f.payingChange ? (f.payingChange > 0 ? '+' : '') + f.payingChange : null, href: '/admin/merchants', icon: 'store' },
          { label: 'Collected', value: short(f.collected), sub: pctText(f.collectedChange), href: '/admin/collections' },
          { label: 'Owed to us', value: short(f.owed), sub: f.overdueStores ? `${f.overdueStores} late` : null, href: '/admin/collections', icon: 'hourglass' },
          { label: 'Churn', value: f.churn.toFixed(1) + '%', sub: 'a month', href: '/admin/analytics/growth', icon: 'user-minus' },
        ]} />

        {result.todo.length ? (
          <section className="ix-card" aria-label="Needs someone today">
            <div className="ix-card__head"><h2>Needs someone today</h2></div>
            <div className="dash-alerts">
              {result.todo.map((r) => (
                <Link key={r.key} href={r.href} className="dash-alert">
                  <span className={'dash-alert__ic' + (r.tone === 'err' ? ' dash-alert__ic--err' : '')} aria-hidden="true"><Icon name={r.tone === 'err' ? 'circle-alert' : 'clock'} width="16" height="16" /></span>
                  <span className="dash-alert__txt"><b>{r.title}</b><small>{r.sub}</small></span>
                  <Icon name="chevron-right" width="16" height="16" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <div className="dash-grid dash-grid--2">
          <Card title="Recurring revenue" link={{ href: '/admin/subscriptions', label: 'Subscriptions' }}>
            <p className="dash-big">{money(f.mrr)}<small>a month · {short(x.mrr.arr)} a year</small></p>
            <ColumnChart label="Monthly recurring revenue by package, last 12 months" data={x.mrr.months}
              series={x.mrr.ladders.map((n, k) => ({ name: n, color: LADDER_COLORS[k] }))} fmt={money} tickFmt={tick} height={200} now={11} />
            <div style={{ marginTop: 'var(--space-3)' }}><Legend items={x.mrr.ladders.map((n, k) => ({ name: n, color: LADDER_COLORS[k], value: short(x.mrr[n.toLowerCase()]) }))} /></div>
            <div className="dash-foot">
              <span>Average per store<b>{money(x.unit.arpa)}</b></span>
              <span>Lifetime value<b>{short(x.unit.ltv)}</b></span>
              <span>Cost to win a store<b>{x.unit.cac == null ? '—' : money(x.unit.cac)}</b></span>
            </div>
          </Card>
          <Card title="Merchants" link={{ href: '/admin/merchants', label: 'All merchants' }}>
            <div className="dash-donut">
              <Donut label="Merchants by state" parts={stateParts} total={String(m.total)} totalLabel="stores" size={128} thickness={16} />
              <Legend items={stateParts.map((p) => ({ name: p.name, color: p.color, value: String(p.value) }))} />
            </div>
            <div className="dash-rows">
              <Link className="dash-row" href="/admin/onboarding"><span>New in this period</span><b>{m.newStores}</b></Link>
              <Link className="dash-row" href="/admin/analytics/growth"><span>Trials that became paying</span><b>{m.trialEnded ? `${m.trialWon} of ${m.trialEnded} · ${share(m.trialRate)}` : '—'}</b></Link>
              {m.ladders.map((l) => <Link key={l.key} className="dash-row" href="/admin/packages"><span>{l.name}</span><b>{l.value}</b></Link>)}
            </div>
          </Card>
        </div>

        <div className="dash-grid dash-grid--3">
          <Card title="Sales funnel" link={{ href: '/admin/pipeline', label: 'Pipeline' }}>
            <HBars rows={FUNNEL.map(([k, l], i) => ({ key: k, label: l, value: x.funnel[k], text: String(x.funnel[k]), color: i === FUNNEL.length - 1 ? 'var(--viz-3)' : 'var(--viz-1)', sub: x.funnelPrev[k] ? `${x.funnelPrev[k]} the period before` : null, href: '/admin/leads' }))} Link={Link} />
            <div className="dash-foot">
              <span>Win rate<b>{share(x.funnel.conversion)}</b></span>
              <span>Lost<b>{x.funnel.lost}</b></span>
            </div>
          </Card>
          <Card title="Support" link={{ href: '/admin/tickets', label: 'Tickets' }}>
            <div className="dash-mini">
              <Link href="/admin/tickets"><span>Open</span><b>{s.open}</b></Link>
              <Link href="/admin/tickets"><span>Waiting on merchant</span><b>{s.pending}</b></Link>
              <Link href="/admin/tickets"><span>Critical</span><b className={s.critical ? 'is-bad' : ''}>{s.critical}</b></Link>
            </div>
            <p className="dash-sub">Open tickets by agent</p>
            <HBars rows={s.load.map((a) => ({ key: a.name, label: a.name, value: a.open, text: String(a.open), color: 'var(--viz-1)' }))} />
            <div className="dash-foot">
              <span>First reply<b>{s.firstReply} min</b></span>
              <span>Resolved<b>{s.resolved}</b></span>
            </div>
          </Card>
          <Card title="Platform" link={{ href: '/admin/servers', label: 'Servers' }}>
            {[['CPU', x.load.cpu], ['Memory', x.load.ram], ['Disk', x.load.disk]].map(([l, v]) => (
              <div key={l} className="dash-meter"><span>{l}</span><span className="dash-meter__track"><span className={v >= 75 ? 'is-warn' : ''} style={{ width: v + '%' }} /></span><b>{v}%</b></div>
            ))}
            <div style={{ marginTop: 'var(--space-3)' }}>
              {(x.svcIssues.length ? x.svcIssues : x.services.slice(0, 3)).map((v) => (
                <Link key={v.key} href={v.status === 'ok' ? '/admin/integrations' : '/admin/incidents'} className="dash-svc">
                  <i className={v.status === 'ok' ? '' : 'is-warn'} aria-hidden="true" /><span>{v.name}{v.note && v.status !== 'ok' ? ' · ' + v.note : ''}</span><small>{v.uptime}%</small>
                </Link>
              ))}
            </div>
            <div className="dash-foot">
              <span>Services<b>{x.services.length - x.svcIssues.length} of {x.services.length} normal</b></span>
              <span>Errors<b>{x.load.errorRate}%</b></span>
            </div>
          </Card>
        </div>

        <Card title="Money" link={{ href: '/admin/finance', label: 'Finance' }}>
          <div className="dash-fin">
            <div>
              <ColumnChart label="Revenue and costs, last 6 months" data={x.finance.months} series={[{ name: 'Revenue', color: 'var(--viz-1)' }]}
                line={{ name: 'Costs', color: 'var(--viz-2)' }} fmt={money} tickFmt={tick} height={200} now={5}
                key={'fin' + period} />
              <div style={{ marginTop: 'var(--space-3)' }}><Legend items={[{ name: 'Revenue', color: 'var(--viz-1)' }, { name: 'Costs', color: 'var(--viz-2)', kind: 'line' }]} /></div>
            </div>
            <div className="dash-rows" aria-label={'Money, ' + periodName.toLowerCase()}>
              <Link className="dash-row" href="/admin/revenue"><span>Subscriptions collected</span><b>{money(fin.subs)}</b></Link>
              <Link className="dash-row" href="/admin/revenue"><span>Messaging resold</span><b>{money(fin.comms)}</b></Link>
              {fin.costs.map((c) => <Link key={c.key} className="dash-row" href="/admin/expenses"><span>{c.name}</span><b>{money(c.value)}</b></Link>)}
              <Link className="dash-row" href="/admin/payments"><span>Refunds</span><b>{money(fin.refunds)}</b></Link>
              <div className="dash-row"><span>Net</span><b className={fin.net < 0 ? 'dash-net--bad' : ''}>{fin.net < 0 ? '−' : ''}{money(Math.abs(fin.net))}</b></div>
            </div>
          </div>
        </Card>
      </>
    );
  }

  return (
    <AdminShell active="dashboard">
      <style dangerouslySetInnerHTML={{ __html: CSS + CHART_CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>
    </AdminShell>
  );
}
