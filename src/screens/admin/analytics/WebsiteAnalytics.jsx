'use client';
// Website analytics (/admin/analytics/website) — gridcommerce.net for a period, compared with the period before or last
// year, laid out like the merchant panel's Analytics hub: five key figures (visitors, sessions, page views, conversion
// rate, bounce rate), visitors over time by source with the compared period as a line, sources, the four conversions
// (signup started, trial created, demo requested, contact form), landing page performance, devices and geography.
// Data: lib/admin/analytics › website, trafficTrend (traffic model, leads per day, trials from the platform's stores).
// ?p, ?cmp and ?all (every landing page) live in the address; figures are worked out after the saved data loads.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { MetricStrip } from '@/components/ui/IndexKit';
import { ColumnChart, Donut, HBars, Legend, CHART_CSS } from '@/components/charts/DashCharts';
import { downloadCsv } from '@/lib/reports/period';
import { SOURCES, acquisitions, website, trafficTrend } from '@/lib/admin/analytics';
import { AdminShell } from '../AdminShell';
import { AN_CSS, useAnalytics, useQuery, usePeriod, AnHeader, Card, Loading, ErrorCard, attempt, num, pct, secs, tick, deltaText, Delta } from './anShared';

const CSS = `
.wa-pages td:first-child{white-space:normal}
.wa-more{display:flex;justify-content:center;padding:var(--space-2);border-top:1px solid var(--border-subtle)}
`;

export default function WebsiteAnalytics() {
  const { db, t, data, live } = useAnalytics();
  const [q, setQ] = useQuery({ p: '30', cmp: 'previous', all: '' });
  const [retry, setRetry] = useState(0);
  const P = usePeriod(q, t);

  const minute = Math.floor(t / 60000);
  const res = useMemo(() => (live ? attempt(() => {
    const acq = acquisitions(db, data, t);
    const cur = website(data, P.range.from, P.range.to, t, acq);
    const before = P.cmp ? website(data, P.cmp.from, P.cmp.to, t, acq) : null;
    const trend = trafficTrend(data, P.range.from, P.range.to, t);
    const trendBefore = P.cmp ? trafficTrend(data, P.cmp.from, P.cmp.to, t) : null;
    return { cur, before, trend, trendBefore };
  }) : null), [live, q.p, q.cmp, retry, minute]); // eslint-disable-line react-hooks/exhaustive-deps
  const v = res && res.value;

  const exportCsv = () => {
    if (!v) return;
    const w = v.cur;
    downloadCsv(`gridcommerce-website-${q.p}.csv`, [
      ['gridcommerce.net · Website analytics', P.text], [],
      ['Visitors', w.visitors], ['Sessions', w.sessions], ['Page views', w.pageviews], ['Bounce rate', pct(w.bounce)], ['Leads', w.leads], ['Conversion rate', pct(w.conv)],
      [], ['Source', 'Visitors', 'Sessions', 'Bounce rate', 'Leads', 'Trials', 'Conversion rate'],
      ...w.channels.map((c) => [c.name, c.visitors, c.sessions, pct(c.bounce), c.leads, c.trials, pct(c.conv)]),
      [], ['Landing page', 'Path', 'Sessions', 'Bounce rate', 'Avg. time (s)', 'Leads', 'Trials', 'Conversion rate'],
      ...w.pages.map((p) => [p.title, p.path, p.sessions, pct(p.bounce), Math.round(p.avgSec || 0), p.leads, p.trials, pct(p.conv)]),
      [], ['Conversion', 'Count', 'Rate'], ...w.conversions.map((c) => [c.label, c.count, pct(c.rate)]),
      [], ['Device', 'Visitors'], ...w.devices.map((d) => [d.name, d.visitors]),
      [], ['Division', 'Visitors', 'Leads'], ...w.divisions.map((d) => [d.name, d.visitors, d.leads]),
      [], ['Country', 'Visitors'], ...w.countries.map((d) => [d.name, d.visitors]),
    ]);
    toast('Website figures exported');
  };

  let body;
  if (!res) body = <Loading cards={2} label="Loading website analytics" />;
  else if (res.error) body = <ErrorCard onRetry={() => setRetry((n) => n + 1)} />;
  else {
    const { cur: w, before: b, trend, trendBefore } = v;
    const series = SOURCES.map((c) => ({ name: c.name, color: c.color }));
    const chart = trend.list.map((x, i) => ({ ...x, line: trendBefore && trendBefore.list[i] ? trendBefore.list[i].total : null }));
    const pages = q.all ? w.pages : w.pages.slice(0, 8);
    const bd = w.countries[0] ? w.countries[0].visitors : 0;
    body = (
      <>
        <MetricStrip label={'Key figures, ' + P.label.toLowerCase()} items={[
          { label: 'Visitors', value: num(w.visitors), sub: b ? deltaText(w.visitors, b.visitors) : null, icon: 'eye' },
          { label: 'Sessions', value: num(w.sessions), sub: b ? deltaText(w.sessions, b.sessions) : null, icon: 'mouse-pointer-click' },
          { label: 'Page views', value: num(w.pageviews), sub: b ? deltaText(w.pageviews, b.pageviews) : null, icon: 'file-text' },
          { label: 'Conversion rate', value: pct(w.conv), sub: `${num(w.leads)} leads`, icon: 'percent' },
          { label: 'Bounce rate', value: pct(w.bounce, 1), sub: b ? deltaText(w.bounce, b.bounce) : null, icon: 'log-out' },
        ]} />

        <Card title="Visitors" tip={`Visitors per ${trend.unit} by where they came from.${b ? ' The line is the compared period.' : ''}`}>
          <ColumnChart key={q.p + q.cmp} label={`Website visitors per ${trend.unit} by source`} data={chart} series={series}
            line={trendBefore ? { name: 'Compared period', color: 'var(--viz-quiet)', dash: true } : null} fmt={num} tickFmt={tick} height={220} now={chart.length - 1} />
          <div style={{ marginTop: 'var(--space-3)' }}>
            <Legend items={[...series.map((s) => ({ name: s.name, color: s.color })), ...(trendBefore ? [{ name: 'Compared period', color: 'var(--viz-quiet)', kind: 'dash' }] : [])]} />
          </div>
          <div className="an-foot">
            <span>Pages per session<b>{w.pagesPerSession ? w.pagesPerSession.toFixed(1) : '—'}</b></span>
            <span>Average session<b>{secs(w.avgSec)}</b></span>
            <span>Leads<b>{num(w.leads)}</b>{b ? <> <Delta now={w.leads} before={b.leads} /></> : null}</span>
          </div>
        </Card>

        <div className="an-grid an-grid--21">
          <Card title="Sources" tip="Where visitors came from, read from the UTM tags and the referrer. Trials are stores that signed up from that source." link={{ href: '/admin/analytics/attribution', label: 'Attribution' }} flush>
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table ix-table--static an-table">
                <caption className="sr-only">Website traffic by source</caption>
                <thead><tr>
                  <th scope="col">Source</th><th scope="col" className="ix-num">Visitors</th><th scope="col" className="ix-num">Sessions</th>
                  <th scope="col" className="ix-num">Bounce rate</th><th scope="col" className="ix-num">Leads</th><th scope="col" className="ix-num">Conversion</th><th scope="col" className="ix-num">Trials</th>
                </tr></thead>
                <tbody>
                  {w.channels.map((c) => (
                    <tr key={c.key}>
                      <td><i className="an-dot" style={{ background: c.color }} aria-hidden="true" />{c.name}</td>
                      <td className="ix-num">{num(c.visitors)}</td><td className="ix-num">{num(c.sessions)}</td>
                      <td className="ix-num">{pct(c.bounce, 0)}</td><td className="ix-num">{num(c.leads)}</td>
                      <td className="ix-num">{pct(c.conv)}</td><td className="ix-num">{num(c.trials)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr>
                  <td>Total</td><td className="ix-num">{num(w.visitors)}</td><td className="ix-num">{num(w.sessions)}</td><td className="ix-num">{pct(w.bounce, 0)}</td>
                  <td className="ix-num">{num(w.leads)}</td><td className="ix-num">{pct(w.conv)}</td><td className="ix-num">{num(w.trials)}</td>
                </tr></tfoot>
              </table>
            </div>
          </Card>
          <Card title="Conversions" tip="Forms finished on the website. A trial is created when the signup finishes and the store is set up; rates are per session.">
            <div className="an-rows">
              {w.conversions.map((c) => {
                const before = b ? (b.conversions.find((x) => x.key === c.key) || {}).count : null;
                return (
                  <div key={c.key} className="an-row">
                    <span>{c.label}<small>{pct(c.rate)}</small></span>
                    <b>{num(c.count)} {before != null ? <Delta now={c.count} before={before} /> : null}</b>
                  </div>
                );
              })}
            </div>
            <div className="an-foot">
              <Link href="/admin/leads">Open leads</Link>
              <Link href="/admin/onboarding?tab=trials">Open trials</Link>
            </div>
          </Card>
        </div>

        <Card title="Landing pages" tip="The first page of a session. Conversion is leads (signup, demo or contact form) per session that started on the page." flush>
          <div className="ix-table-wrap ix-table-wrap--show">
            <table className="ix-table ix-table--static an-table wa-pages">
              <caption className="sr-only">Landing page performance</caption>
              <thead><tr>
                <th scope="col">Page</th><th scope="col" className="ix-num">Sessions</th><th scope="col" className="ix-num">Bounce rate</th>
                <th scope="col" className="ix-num">Avg. time</th><th scope="col" className="ix-num">Leads</th><th scope="col" className="ix-num">Conversion</th><th scope="col" className="ix-num">Trials</th>
              </tr></thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.path}>
                    <td className="an-name"><b>{p.title}</b><small>gridcommerce.net{p.path === '/' ? '' : p.path}</small></td>
                    <td className="ix-num">{num(p.sessions)}</td><td className="ix-num">{pct(p.bounce, 0)}</td><td className="ix-num">{secs(p.avgSec)}</td>
                    <td className="ix-num">{num(p.leads)}</td><td className="ix-num">{pct(p.conv)}</td><td className="ix-num">{num(p.trials)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {w.pages.length > 8 ? (
            <div className="wa-more">
              <button type="button" className="ix-btn ix-btn--sm" onClick={() => setQ({ all: q.all ? '' : '1' })}>
                {q.all ? 'Show the top 8' : `Show all ${w.pages.length} pages`}
              </button>
            </div>
          ) : null}
        </Card>

        <div className="an-grid an-grid--3">
          <Card title="Devices">
            <div className="an-donut">
              <Donut label="Visitors by device" parts={w.devices.map((d) => ({ name: d.name, value: d.visitors, color: d.color }))} total={pct(w.devices[0].visitors / Math.max(1, w.visitors), 0)} totalLabel="on mobile" size={128} thickness={16} fmt={num} />
              <Legend items={w.devices.map((d) => ({ name: d.name, color: d.color, value: pct(d.visitors / Math.max(1, w.visitors), 0) }))} />
            </div>
            <div className="an-foot">
              {w.devices.map((d) => <span key={d.key}>{d.name} leads<b>{num(d.leads)}</b></span>)}
            </div>
          </Card>
          <Card title="Bangladesh by division">
            <HBars rows={w.divisions.map((d) => ({ key: d.name, label: d.name, value: d.visitors, text: num(d.visitors), sub: `${num(d.leads)} leads`, color: 'var(--viz-1)' }))} />
          </Card>
          <Card title="Countries" tip="Mostly Bangladeshi business owners and shoppers living abroad.">
            <div className="an-rows">
              {w.countries.map((c) => (
                <div key={c.name} className="an-row"><span>{c.name}<small>{pct(c.visitors / Math.max(1, w.visitors), 1)}</small></span><b>{num(c.visitors)}</b></div>
              ))}
            </div>
            <div className="an-foot"><span>Outside Bangladesh<b>{num(w.visitors - bd)}</b></span></div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <AdminShell active="analytics-website" title="Website analytics">
      <style dangerouslySetInnerHTML={{ __html: AN_CSS + CHART_CSS + CSS }} />
      <div className="ix-page">
        <AnHeader icon="globe" title="Website" q={q} setQ={setQ}
          about="gridcommerce.net: visitors, sessions, page views, where visitors come from, which landing pages turn visits into signups, demo requests and contact forms, devices and geography. Trials come from the platform's stores; ad and campaign results are on Attribution.">
          <a className="ix-btn ix-head__sec" href="https://gridcommerce.net" target="_blank" rel="noreferrer"><Icon name="external-link" width="16" height="16" aria-hidden="true" /><span>Open site</span></a>
          <button type="button" className="ix-btn" onClick={exportCsv} disabled={!v}><Icon name="download" width="16" height="16" aria-hidden="true" /><span>Export</span></button>
        </AnHeader>
        {live ? <p className="an-meta" aria-live="polite">{P.text}{P.cmp ? ' · compared with ' + P.cmpText : ''}</p> : null}
        {body}
      </div>
    </AdminShell>
  );
}
