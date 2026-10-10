'use client';
// Analytics overview (/admin/analytics) — the headline story for a period, compared with the period before or the same
// dates last year: five key figures (visitors, signups, trials, new paying stores, recurring revenue), the path from a
// website visit to a paying store, the channels that bring the trials, recurring revenue over 12 months and churn.
// Every card links to the page with the detail (Website, Sales & growth, Attribution, Usage, Reports); detailed reports
// live once, in Reports. Data: lib/admin/analytics (overview, acquisitions) and lib/admin/dashboard › executive.
// ?p (period) and ?cmp (compare) live in the address; figures are worked out after the saved data loads.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { MetricStrip } from '@/components/ui/IndexKit';
import { ColumnChart, Legend, CHART_CSS } from '@/components/charts/DashCharts';
import { downloadCsv } from '@/lib/reports/period';
import { dmy } from '@/lib/platform/util';
import { acquisitions, overview, growthFunnel } from '@/lib/admin/analytics';
import { executive } from '@/lib/admin/dashboard';
import { AdminShell } from '../AdminShell';
import { AN_CSS, useAnalytics, useQuery, usePeriod, AnHeader, Card, Funnel, Loading, ErrorCard, attempt, money, short, num, pct, moneyTick, deltaText } from './anShared';

const LADDER_COLORS = ['var(--viz-1)', 'var(--viz-3)', 'var(--viz-4)'];
const EXPLORE = [
  ['/admin/analytics/website', 'globe', 'Website'], ['/admin/analytics/growth', 'trending-up', 'Sales & growth'],
  ['/admin/analytics/attribution', 'git-branch', 'Attribution'], ['/admin/analytics/usage', 'gauge', 'Usage'],
  ['/admin/reports', 'file-bar-chart', 'Reports'], ['/admin/leads', 'user-plus', 'Leads'], ['/admin/campaigns', 'megaphone', 'Campaigns'],
  ['/admin/utm', 'link', 'UTM links'], ['/admin/finance', 'landmark', 'Finance'],
];

export default function AnalyticsOverview() {
  const { db, t, data, live } = useAnalytics();
  const [q, setQ] = useQuery({ p: '30', cmp: 'previous' });
  const [retry, setRetry] = useState(0);
  const P = usePeriod(q, t);

  const minute = Math.floor(t / 60000);
  const res = useMemo(() => (live ? attempt(() => {
    const acq = acquisitions(db, data, t);
    const cur = overview(db, data, P.range.from, P.range.to, t, acq);
    const before = P.cmp ? overview(db, data, P.cmp.from, P.cmp.to, t, acq) : null;
    const x = executive(db, t, 'year');
    const fn = growthFunnel(acq, P.range.from, P.range.to, t);
    return { cur, before, x, fn };
  }) : null), [live, q.p, q.cmp, retry, minute]); // eslint-disable-line react-hooks/exhaustive-deps
  const v = res && res.value;

  const exportCsv = () => {
    if (!v) return;
    const c = v.cur, b = v.before;
    downloadCsv(`gridcommerce-analytics-${q.p}.csv`, [
      ['GridCommerce · Analytics overview', P.text], P.cmp ? ['Compared with', P.cmpText] : [], [],
      ['Figure', 'This period', b ? 'Compared period' : ''],
      ['Website visitors', c.visitors, b ? b.visitors : ''], ['Website sessions', c.sessions, b ? b.sessions : ''],
      ['Signups started', c.signups, b ? b.signups : ''], ['Leads', c.leads, b ? b.leads : ''], ['Trials', c.trials, b ? b.trials : ''],
      ['New paying stores', c.newPaying, b ? b.newPaying : ''], ['Stores that left', c.left, b ? b.left : ''],
      ['Monthly recurring revenue (now)', Math.round(v.x.figs.mrr), ''], ['Monthly churn (90-day rate)', v.x.figs.churn.toFixed(1) + '%', ''],
      [], ['Channel', 'Visitors', 'Trials', 'Became paying'], ...c.channels.map((ch) => [ch.name, ch.visitors == null ? 'offline' : ch.visitors, ch.trials, ch.paid]),
    ]);
    toast('Overview exported');
  };

  let body;
  if (!res) body = <Loading cards={2} label="Loading the analytics overview" />;
  else if (res.error) body = <ErrorCard onRetry={() => setRetry((n) => n + 1)} />;
  else {
    const { cur: c, before: b, x, fn } = v;
    const mrrMonths = x.mrr.months;
    const mrrSpark = mrrMonths.map((m) => m.values.reduce((a, n) => a + n, 0));
    const top = c.channels.filter((ch) => ch.trials || ch.visitors).slice(0, 5);
    const maxTrials = Math.max(1, ...top.map((ch) => ch.trials));
    body = (
      <>
        <MetricStrip label={'Key figures, ' + P.label.toLowerCase()} items={[
          { label: 'Website visitors', value: num(c.visitors), sub: b ? deltaText(c.visitors, b.visitors) : null, href: '/admin/analytics/website', icon: 'eye' },
          { label: 'Signups started', value: num(c.signups), sub: b ? deltaText(c.signups, b.signups) : null, href: '/admin/analytics/website', icon: 'user-plus' },
          { label: 'Trials', value: num(c.trials), sub: b ? deltaText(c.trials, b.trials) : null, href: '/admin/onboarding?tab=trials', icon: 'flask-conical' },
          { label: 'New paying stores', value: num(c.newPaying), sub: b ? deltaText(c.newPaying, b.newPaying) : null, href: '/admin/analytics/growth', icon: 'store' },
          { label: 'Recurring revenue', value: short(x.figs.mrr), sub: 'a month', spark: mrrSpark, href: '/admin/analytics/growth' },
        ]} />

        <div className="an-grid an-grid--21">
          <Card title="From visit to paying store" tip="Visitors and signups are counted on gridcommerce.net. Trials are every store that started in the period (website, field sales and events). Paying stores are those whose first paid month started in the period."
            link={{ href: '/admin/analytics/website', label: 'Website' }}>
            <Funnel label="From website visit to paying store" steps={[
              { label: 'Visitors', value: c.visitors, delta: b ? deltaText(c.visitors, b.visitors) : null, href: '/admin/analytics/website', color: 'var(--viz-1)' },
              { label: 'Signups started', value: c.signups, delta: b ? deltaText(c.signups, b.signups) : null, href: '/admin/analytics/website', color: 'var(--viz-1)' },
              { label: 'Trials', sub: 'all channels', value: c.trials, delta: b ? deltaText(c.trials, b.trials) : null, href: '/admin/onboarding?tab=trials', color: 'var(--viz-1)' },
              { label: 'Became paying', value: c.newPaying, delta: b ? deltaText(c.newPaying, b.newPaying) : null, href: '/admin/analytics/growth', color: 'var(--viz-3)' },
            ]} />
            <div className="an-foot">
              <span>Visit to lead<b>{pct(c.conv)}</b></span>
              <span>Leads<b>{num(c.leads)}</b></span>
              <span>Stores that left<b>{num(c.left)}</b></span>
            </div>
          </Card>
          <Card title="Top channels" tip="Trials started in the period by the channel recorded when the store signed up (last touch). Attribution shows first touch, campaigns, cost and return."
            link={{ href: '/admin/analytics/attribution', label: 'Attribution' }}>
            {top.length ? (
              <div className="an-rows">
                {top.map((ch) => (
                  <Link key={ch.key} className="an-row" href={'/admin/analytics/attribution?by=channel'}>
                    <span><i className="an-dot" style={{ background: ch.color }} aria-hidden="true" />{ch.name}<small>{ch.visitors == null ? 'offline' : num(ch.visitors) + ' visits'}</small></span>
                    <b>{ch.trials} {ch.trials === 1 ? 'trial' : 'trials'}</b>
                  </Link>
                ))}
              </div>
            ) : <p className="an-empty">No trials in this period.</p>}
            <div className="an-foot">
              <span>Best for trials<b>{top[0] && maxTrials ? top[0].name : '—'}</b></span>
            </div>
          </Card>
        </div>

        <div className="an-grid an-grid--2">
          <Card title="Recurring revenue" link={{ href: '/admin/analytics/growth', label: 'Sales & growth' }}>
            <p className="an-big">{money(x.figs.mrr)}<small>a month · {short(x.mrr.arr)} a year</small></p>
            <ColumnChart label="Monthly recurring revenue by segment, last 12 months" data={mrrMonths}
              series={x.mrr.ladders.map((n, k) => ({ name: n, color: LADDER_COLORS[k] }))} fmt={money} tickFmt={moneyTick} height={200} now={11} />
            <div style={{ marginTop: 'var(--space-3)' }}><Legend items={x.mrr.ladders.map((n, k) => ({ name: n, color: LADDER_COLORS[k], value: short(x.mrr[n.toLowerCase()]) }))} /></div>
            <div className="an-foot">
              <span>Paying stores<b>{x.merchants.paying}</b></span>
              <span>Average per store<b>{money(x.unit.arpa)}</b></span>
              <span>Lifetime value<b>{short(x.unit.ltv)}</b></span>
            </div>
          </Card>
          <Card title="Churn" tip="Monthly churn: paying stores that cancelled or closed in the last 90 days, divided by the paying stores at its start, per month."
            link={{ href: '/admin/analytics/growth#churn', label: 'Reasons' }}>
            <p className="an-big">{x.figs.churn.toFixed(1)}%<small>a month (last 90 days)</small></p>
            <div className="an-rows">
              <div className="an-row"><span>Stores that left in this period</span><b>{num(c.left)}</b></div>
              {b ? <div className="an-row"><span>The period before</span><b>{num(b.left)}</b></div> : null}
              <div className="an-row"><span>Trials that ended and paid</span><b>{fn.ended ? `${fn.won} of ${fn.ended} · ${pct(fn.trialToPaid, 0)}` : '—'}</b></div>
              <Link className="an-row" href="/admin/merchants?view=late"><span>Behind on payment now</span><b>{x.merchants.late}</b></Link>
            </div>
          </Card>
        </div>

        <section className="ix-card" aria-label="Explore">
          <div className="ix-card__head"><h2>Explore</h2><span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>Figures as of {dmy(t)}</span></div>
          <div className="an-body an-links">
            {EXPLORE.map(([href, icon, label]) => <Link key={href} href={href} className="an-chip"><Icon name={icon} width="16" height="16" aria-hidden="true" />{label}</Link>)}
          </div>
        </section>
      </>
    );
  }

  return (
    <AdminShell active="analytics" title="Analytics">
      <style dangerouslySetInnerHTML={{ __html: AN_CSS + CHART_CSS }} />
      <div className="ix-page">
        <AnHeader icon="chart-column" title="Analytics" q={q} setQ={setQ}
          about="GridCommerce's numbers in one place: website visitors, signups, trials, new paying stores and recurring revenue for the period you pick, compared with the period before or the same dates last year. Each card opens the page with the detail; every detailed report lives in Reports.">
          <button type="button" className="ix-btn" onClick={exportCsv} disabled={!v}><Icon name="download" width="16" height="16" aria-hidden="true" /><span>Export</span></button>
        </AnHeader>
        {live ? <p className="an-meta" aria-live="polite">{P.text}{P.cmp ? ' · compared with ' + P.cmpText : ''}</p> : null}
        {body}
      </div>
    </AdminShell>
  );
}
