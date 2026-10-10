'use client';
// Sales & growth (/admin/analytics/growth) — is GridCommerce growing, and does it keep the stores it wins? Five key
// figures (recurring revenue, paying stores, trial → paid, churn, lifetime value), the lead → trial → paid funnel for the
// period (with the compared period), paying stores and revenue over 12 months, retention by sign-up month (share still
// paying 1, 3 and 6 months after the first paid month), churn and its reasons, package popularity and module adoption.
// Data: lib/admin/analytics › growth, growthFunnel, acquisitions (platform stores, payments, subscriptions) and
// lib/admin/dashboard › executive (MRR, churn, unit economics). ?p and ?cmp live in the address.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { MetricStrip } from '@/components/ui/IndexKit';
import { ColumnChart, HBars, Legend, CHART_CSS } from '@/components/charts/DashCharts';
import { downloadCsv } from '@/lib/reports/period';
import { dmy } from '@/lib/platform/util';
import { acquisitions, growth, growthFunnel } from '@/lib/admin/analytics';
import { AdminShell } from '../AdminShell';
import { AN_CSS, useAnalytics, useQuery, usePeriod, AnHeader, Card, Funnel, Loading, ErrorCard, attempt, money, short, num, pct, moneyTick, tick, deltaText } from './anShared';

const CSS = `
.gr-cohort th,.gr-cohort td{text-align:right}
.gr-cohort th:first-child,.gr-cohort td:first-child{text-align:left}
.gr-cohort td{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.gr-cohort td:first-child{font-family:var(--font-sans)}
.gr-cell{display:inline-block;min-width:56px;padding:2px 8px;border-radius:var(--radius-md);color:var(--text-heading)}
.gr-none{color:var(--text-muted)}
small.gr-none{font-family:var(--font-sans);font-size:var(--text-xs)}
.gr-left{display:flex;flex-direction:column;gap:2px;min-width:0}
.gr-left small{font-size:var(--text-xs);color:var(--text-muted)}
`;
const LADDERS = [['Online', 'var(--viz-1)'], ['Retail', 'var(--viz-3)'], ['Wholesale', 'var(--viz-4)']];
const heat = (x) => (x == null ? null : { background: `color-mix(in srgb, var(--viz-3) ${Math.round(10 + x * 45)}%, var(--surface-card))` });

export default function Growth() {
  const { db, t, data, live } = useAnalytics();
  const [q, setQ] = useQuery({ p: 'year', cmp: 'previous' });
  const [retry, setRetry] = useState(0);
  const P = usePeriod(q, t);
  const minute = Math.floor(t / 60000);

  const res = useMemo(() => (live ? attempt(() => {
    const acq = acquisitions(db, data, t);
    const g = growth(db, data, P.range.from, P.range.to, t, acq);
    const before = P.cmp ? growthFunnel(acq, P.cmp.from, P.cmp.to, t) : null;
    return { g, before };
  }) : null), [live, q.p, q.cmp, retry, minute]); // eslint-disable-line react-hooks/exhaustive-deps
  const v = res && res.value;

  const exportCsv = () => {
    if (!v) return;
    const { g } = v;
    const f = g.funnel;
    downloadCsv(`gridcommerce-growth-${q.p}.csv`, [
      ['GridCommerce · Sales & growth', P.text], [],
      ['Leads', f.leads], ['Trials', f.trials], ['Trials that ended', f.ended], ['Became paying', f.won], ['New paying stores', f.newPaying], ['Stores that left', f.left],
      ['Monthly recurring revenue', Math.round(g.mrr)], ['Paying stores', g.paying], ['Monthly churn', pct(g.ltv.churn, 1)], ['Lifetime value', Math.round(g.ltv.ltv)],
      [], ['Month', 'MRR', 'Paying stores', 'Trials', 'New paying', 'Left', 'Collected'],
      ...g.months.map((m) => [m.title, Math.round(m.mrr), m.paying, m.trials, m.newPaying, m.left, Math.round(m.collected)]),
      [], ['Sign-up month', 'Signed up', 'Became paying', 'After 1 month', 'After 3 months', 'After 6 months'],
      ...g.cohorts.map((c) => [c.label, c.signed, c.converted, pct(c.m1, 0), pct(c.m3, 0), pct(c.m6, 0)]),
      [], ['Package', 'Stores', 'Paying', 'Trial', 'MRR'], ...g.packages.map((p) => [p.name, p.stores, p.paying, p.trial, Math.round(p.mrr)]),
      [], ['Module', 'Stores using it', 'Share'], ...g.modules.map((m) => [m.name, m.stores, pct(m.share, 0)]),
      [], ['Why stores left', 'Stores'], ...g.reasons.map((r) => [r.name, r.count]),
    ]);
    toast('Growth figures exported');
  };

  let body;
  if (!res) body = <Loading cards={2} label="Loading sales and growth" />;
  else if (res.error) body = <ErrorCard onRetry={() => setRetry((n) => n + 1)} />;
  else {
    const { g, before: b } = v;
    const f = g.funnel;
    const optional = g.modules.filter((m) => m.optional).slice(0, 8);
    const months = g.months;
    body = (
      <>
        <MetricStrip label={'Key figures, ' + P.label.toLowerCase()} items={[
          { label: 'Recurring revenue', value: short(g.mrr), sub: g.mrrChange == null ? null : deltaText(g.mrr, g.mrr / (1 + g.mrrChange / 100)) + ' in 12 months', spark: months.map((m) => m.mrr), href: '/admin/subscriptions' },
          { label: 'Paying stores', value: num(g.paying), sub: `+${f.newPaying} · −${f.left} in period`, href: '/admin/merchants?view=paying', icon: 'store' },
          { label: 'Trial to paid', value: f.ended ? pct(f.trialToPaid, 0) : '—', sub: f.ended ? `${f.won} of ${f.ended} trials` : 'no trial ended', icon: 'percent' },
          { label: 'Churn', value: pct(g.ltv.churn, 1), sub: 'a month', icon: 'user-minus' },
          { label: 'Lifetime value', value: short(g.ltv.ltv), sub: g.ltv.ratio ? g.ltv.ratio.toFixed(1) + '× cost to win' : null, icon: 'gem' },
        ]} />

        <div className="an-grid an-grid--2">
          <Card title="Lead → trial → paid" tip="Leads are every new lead in the period (website forms, field visits and events). Trials are stores that started. Became paying counts the trials that ended in the period and paid for their first month."
            link={{ href: '/admin/pipeline', label: 'Pipeline' }}>
            <Funnel label="Lead to trial to paid" steps={[
              { label: 'Leads', value: f.leads, delta: b ? deltaText(f.leads, b.leads) : null, href: '/admin/leads' },
              { label: 'Trials', value: f.trials, delta: b ? deltaText(f.trials, b.trials) : null, href: '/admin/onboarding?tab=trials' },
              { label: 'Became paying', sub: 'trials that ended', value: f.won, delta: b ? deltaText(f.won, b.won) : null, href: '/admin/merchants?view=paying', color: 'var(--viz-3)' },
            ]} />
            <div className="an-foot">
              <span>Lead to trial<b>{pct(f.leadToTrial)}</b></span>
              <span>Trial to paid<b>{f.ended ? pct(f.trialToPaid, 0) : '—'}</b></span>
              {b ? <span>Before<b>{b.ended ? pct(b.trialToPaid, 0) : '—'}</b></span> : null}
            </div>
          </Card>
          <Card title="Paying stores" tip="Stores paying at the end of each month, by segment. A store counts from its first paid month until it cancels, pauses or is suspended." link={{ href: '/admin/merchants?view=paying', label: 'Merchants' }}>
            <p className="an-big">{num(g.paying)}<small>paying · {num(g.trial)} on trial</small></p>
            <ColumnChart label="Paying stores at each month end by segment, last 12 months" data={months.map((m) => ({ label: m.label, title: m.title, values: m.payingBy }))}
              series={LADDERS.map(([name, color]) => ({ name, color }))} fmt={num} tickFmt={tick} height={180} now={11} />
            <div style={{ marginTop: 'var(--space-3)' }}><Legend items={LADDERS.map(([name, color], k) => ({ name, color, value: num(months[11].payingBy[k]) }))} /></div>
            <div className="an-foot">
              <span>New paying<b>{num(f.newPaying)}</b></span>
              <span>Left<b>{num(f.left)}</b></span>
              <span>Net<b>{f.newPaying - f.left >= 0 ? '+' : '−'}{Math.abs(f.newPaying - f.left)}</b></span>
            </div>
          </Card>
        </div>

        <Card title="Revenue" tip="Bars: money collected from stores each month (bills paid). Line: monthly recurring revenue at the month end." link={{ href: '/admin/finance', label: 'Finance' }}>
          <ColumnChart label="Money collected per month with recurring revenue, last 12 months" data={months.map((m) => ({ label: m.label, title: m.title, values: [m.collected], line: m.mrr }))}
            series={[{ name: 'Collected', color: 'var(--viz-1)' }]} line={{ name: 'Recurring revenue', color: 'var(--viz-2)' }} fmt={money} tickFmt={moneyTick} height={200} now={11} />
          <div style={{ marginTop: 'var(--space-3)' }}><Legend items={[{ name: 'Collected', color: 'var(--viz-1)' }, { name: 'Recurring revenue', color: 'var(--viz-2)', kind: 'line' }]} /></div>
          <div className="an-foot">
            <span>Annual run rate<b>{short(g.arr)}</b></span>
            <span>Collected in 12 months<b>{short(months.reduce((s, m) => s + m.collected, 0))}</b></span>
            <span>Average per store<b>{money(g.ltv.arpa)}</b></span>
          </div>
        </Card>

        <Card title="Retention by sign-up month" tip="Stores grouped by the month they signed up. Became paying is the share that paid after the trial; the next columns are the share of those still paying 1, 3 and 6 months after their first paid month. Blank: not that old yet." flush>
          <div className="ix-table-wrap ix-table-wrap--show">
            <table className="ix-table ix-table--static gc-table--keep gc-table--scroll gr-cohort">
              <caption className="sr-only">Retention by sign-up month</caption>
              <thead><tr>
                <th scope="col">Sign-up month</th><th scope="col">Signed up</th><th scope="col">Became paying</th>
                <th scope="col">After 1 month</th><th scope="col">After 3 months</th><th scope="col">After 6 months</th>
              </tr></thead>
              <tbody>
                {g.cohorts.slice().reverse().map((c) => (
                  <tr key={c.key}>
                    <td>{c.label}</td>
                    <td>{c.signed || <span className="gr-none">0</span>}</td>
                    <td>{c.signed ? <>{c.converted} · {pct(c.convRate, 0)}{c.stillTrial ? <small className="gr-none"> · {c.stillTrial} on trial</small> : null}</> : <span className="gr-none">—</span>}</td>
                    {[c.m1, c.m3, c.m6].map((x, i) => <td key={i}>{x == null ? <span className="gr-none">—</span> : <span className="gr-cell" style={heat(x)}>{pct(x, 0)}</span>}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="an-grid an-grid--3" id="churn">
          <Card title="Why stores left" tip="Paying stores that cancelled, closed, paused or were suspended for unpaid bills, with the reason recorded when they left." link={{ href: '/admin/merchants?view=closed', label: 'Closed stores' }}>
            {g.reasons.length ? (
              <>
                <HBars rows={g.reasons.map((r) => ({ key: r.name, label: r.name, value: r.count, text: String(r.count), color: 'var(--viz-8)' }))} />
                <p className="an-sub" style={{ marginTop: 'var(--space-4)' }}>Latest</p>
                <div className="an-rows">
                  {g.gone.slice(0, 5).map((a) => (
                    <Link key={a.id} className="an-row" href={'/admin/merchant?id=' + a.id}>
                      <span className="gr-left">{a.name}<small>{a.packageName} · {a.cancelReason || 'No reason given'}</small></span>
                      <b>{dmy(a.leftAt)}</b>
                    </Link>
                  ))}
                </div>
              </>
            ) : <p className="an-empty">No paying store has left.</p>}
          </Card>
          <Card title="Why trials did not pay" tip="Trials that ended in the period without a first payment, with the reason sales recorded on the follow-up call." link={{ href: '/admin/reports/view?id=trial-conversion-by-source', label: 'By source' }}>
            {g.lapseReasons.length ? (
              <HBars rows={g.lapseReasons.map((r) => ({ key: r.name, label: r.name, value: r.count, text: String(r.count), color: 'var(--viz-4)' }))} />
            ) : <p className="an-empty">No trial ended without paying in this period.</p>}
            <div className="an-foot">
              <span>Trials ended<b>{num(f.ended)}</b></span>
              <span>Did not pay<b>{num(f.ended - f.won)}</b></span>
            </div>
          </Card>
          <Card title="Lifetime value" tip="Average revenue per paying store ÷ monthly churn. Cost to win a store is the year's ad spend ÷ trials that became paying.">
            <p className="an-big">{money(g.ltv.ltv)}<small>per store</small></p>
            <div className="an-rows">
              <div className="an-row"><span>Average revenue per store</span><b>{money(g.ltv.arpa)}<small>a month</small></b></div>
              <div className="an-row"><span>Monthly churn</span><b>{pct(g.ltv.churn, 1)}</b></div>
              <div className="an-row"><span>Average lifetime</span><b>{g.ltv.months ? Math.round(g.ltv.months) + ' months' : '—'}</b></div>
              <Link className="an-row" href="/admin/analytics/attribution"><span>Cost to win a store</span><b>{g.ltv.cac == null ? '—' : money(g.ltv.cac)}</b></Link>
              <div className="an-row"><span>Lifetime value ÷ cost to win</span><b>{g.ltv.ratio ? g.ltv.ratio.toFixed(1) + '×' : '—'}</b></div>
            </div>
          </Card>
        </div>

        <div className="an-grid an-grid--2">
          <Card title="Packages" tip="Live stores by package (paying, on trial or behind on payment) and the recurring revenue each package brings." link={{ href: '/admin/packages', label: 'Packages' }} flush>
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table ix-table--static an-table">
                <caption className="sr-only">Package popularity</caption>
                <thead><tr><th scope="col">Package</th><th scope="col" className="ix-num">Stores</th><th scope="col" className="ix-num">Paying</th><th scope="col" className="ix-num">Trial</th><th scope="col" className="ix-num">MRR</th><th scope="col" className="ix-num">Share</th></tr></thead>
                <tbody>
                  {g.packages.map((p) => (
                    <tr key={p.key}>
                      <td>{p.name}</td><td className="ix-num">{p.stores}</td><td className="ix-num">{p.paying}</td><td className="ix-num">{p.trial}</td>
                      <td className="ix-num">{money(p.mrr)}</td><td className="ix-num">{pct(p.share, 0)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr>
                  <td>Total</td><td className="ix-num">{g.packages.reduce((s, p) => s + p.stores, 0)}</td><td className="ix-num">{g.packages.reduce((s, p) => s + p.paying, 0)}</td>
                  <td className="ix-num">{g.packages.reduce((s, p) => s + p.trial, 0)}</td><td className="ix-num">{money(g.packages.reduce((s, p) => s + p.mrr, 0))}</td><td className="ix-num">100%</td>
                </tr></tfoot>
              </table>
            </div>
          </Card>
          <Card title="Module adoption" tip={`Share of the ${optional[0] ? optional[0].of : 0} paying and trial stores that use each optional module (in the package, as an add-on or on trial). Modules every store has are left out.`} link={{ href: '/admin/modules', label: 'Modules' }}>
            {optional.length ? <HBars rows={optional.map((m) => ({ key: m.code, label: m.name, sub: m.setLabel + (m.trials ? ` · ${m.trials} on trial` : ''), value: m.stores, text: `${m.stores} · ${pct(m.share, 0)}`, color: 'var(--viz-1)' }))} /> : <p className="an-empty">No optional module in use.</p>}
            <div className="an-foot"><Link href="/admin/reports/view?id=module-adoption">Every module<Icon name="arrow-right" width="12" height="12" aria-hidden="true" style={{ marginLeft: 4, verticalAlign: 'middle' }} /></Link></div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <AdminShell active="analytics-growth" title="Sales & growth">
      <style dangerouslySetInnerHTML={{ __html: AN_CSS + CHART_CSS + CSS }} />
      <div className="ix-page">
        <AnHeader icon="trending-up" title="Sales & growth" q={q} setQ={setQ}
          about="How GridCommerce grows and keeps its stores: leads, trials and paying stores for the period you pick, recurring revenue and paying stores over 12 months, retention by sign-up month, why stores leave, which packages sell and which modules stores use, and what a store is worth over its lifetime.">
          <button type="button" className="ix-btn" onClick={exportCsv} disabled={!v}><Icon name="download" width="16" height="16" aria-hidden="true" /><span>Export</span></button>
        </AnHeader>
        {live ? <p className="an-meta" aria-live="polite">{P.text}{P.cmp ? ' · compared with ' + P.cmpText : ''} · 12-month charts end today</p> : null}
        {body}
      </div>
    </AdminShell>
  );
}
