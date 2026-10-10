'use client';
// Attribution (/admin/analytics/attribution) — where GridCommerce's stores come from, after the merchant panel's
// Attribution page: the model switch (last touch / first touch), five key figures (visits, leads, trials, paid stores,
// cost to win a store), one table by channel or by UTM campaign (visits, leads, trials, paid, revenue to date, cost, CAC,
// ROAS, with totals), and first touch against last touch per channel. Ads, affiliates, UTM links and campaigns are
// managed on their own pages (linked); this page only reads.
// Data: lib/admin/analytics › attribution, touchShares, acquisitions (campaigns and costs in this module's store, ad
// spend from lib/admin/company, stores and payments from lib/platform). ?p, ?model, ?by live in the address.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { MetricStrip, IndexTabs } from '@/components/ui/IndexKit';
import { CHART_CSS } from '@/components/charts/DashCharts';
import { downloadCsv } from '@/lib/reports/period';
import { CH, acquisitions, attribution, touchShares } from '@/lib/admin/analytics';
import { AdminShell } from '../AdminShell';
import { AN_CSS, useAnalytics, useQuery, usePeriod, AnHeader, Card, Loading, ErrorCard, Segmented, attempt, money, short, num, pct, times } from './anShared';

const CSS = `
.at-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-bottom:1px solid var(--border-subtle)}
.at-tools .an-sub{margin:0 0 0 auto}
.at-touch{display:flex;flex-direction:column;gap:var(--space-3)}
.at-trow{display:grid;grid-template-columns:minmax(110px,150px) minmax(0,1fr) 92px;align-items:center;gap:var(--space-3);font-size:var(--text-sm)}
.at-trow>span:first-child{display:flex;align-items:center;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-heading)}
.at-bars{display:flex;flex-direction:column;gap:3px}
.at-bars i{display:block;height:8px;min-width:2px;border-radius:var(--radius-full)}
.at-vals{display:flex;flex-direction:column;align-items:flex-end;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-body)}
.at-shift{font-family:var(--font-data);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.at-shift.is-up{color:var(--text-success)}.at-shift.is-down{color:var(--text-danger)}
.at-roas.is-good{color:var(--text-success)}.at-roas.is-weak{color:var(--text-danger)}
@media (max-width:640px){.at-trow{grid-template-columns:minmax(0,1fr) 84px}.at-bars{grid-column:1/-1;grid-row:2}}
`;
const FIRST = 'var(--viz-7)';
const LAST = 'var(--viz-1)';
const MODELS = [['last', 'Last touch'], ['first', 'First touch']];
const ACT = [['/admin/ads', 'megaphone', 'Ads'], ['/admin/affiliates', 'handshake', 'Affiliates'], ['/admin/utm', 'link', 'UTM links'], ['/admin/campaigns', 'send', 'Campaigns'], ['/admin/leads', 'user-plus', 'Leads']];

export default function Attribution() {
  const { db, t, data, live } = useAnalytics();
  const [q, setQ] = useQuery({ p: 'year', cmp: 'none', model: 'last', by: 'channel' });
  const [retry, setRetry] = useState(0);
  const P = usePeriod(q, t);
  const minute = Math.floor(t / 60000);
  const model = q.model === 'first' ? 'first' : 'last';
  const by = q.by === 'campaign' ? 'campaign' : 'channel';

  const res = useMemo(() => (live ? attempt(() => {
    const acq = acquisitions(db, data, t);
    const channels = attribution(db, data, P.range.from, P.range.to, t, { model, by: 'channel', acq });
    const campaigns = attribution(db, data, P.range.from, P.range.to, t, { model, by: 'campaign', acq });
    const touch = touchShares(acq, P.range.from, P.range.to, t, 'trials');
    return { channels, campaigns, touch };
  }) : null), [live, q.p, model, retry, minute]); // eslint-disable-line react-hooks/exhaustive-deps
  const v = res && res.value;

  const exportCsv = () => {
    if (!v) return;
    const tbl = by === 'campaign' ? v.campaigns : v.channels;
    downloadCsv(`gridcommerce-attribution-${by}-${model}-${q.p}.csv`, [
      ['GridCommerce · Attribution', P.text, (MODELS.find(([k]) => k === model) || [])[1]], [],
      [by === 'campaign' ? 'Campaign' : 'Channel', 'UTM', 'Channel', 'Visits', 'Leads', 'Trials', 'Paid', 'Revenue to date', 'Cost', 'Cost to win a store', 'ROAS'],
      ...tbl.rows.map((r) => [r.name, r.utm, r.channelName, r.visits == null ? 'offline' : r.visits, r.leads, r.trials, r.paid, Math.round(r.revenue), r.cost, r.cac == null ? '' : Math.round(r.cac), r.roas == null ? '' : r.roas.toFixed(2)]),
      ['Total', '', '', tbl.total.visits, tbl.total.leads, tbl.total.trials, tbl.total.paid, Math.round(tbl.total.revenue), tbl.total.cost, tbl.total.cac == null ? '' : Math.round(tbl.total.cac), tbl.total.roas == null ? '' : tbl.total.roas.toFixed(2)],
    ]);
    toast('Attribution exported');
  };

  let body;
  if (!res) body = <Loading cards={1} label="Loading attribution" />;
  else if (res.error) body = <ErrorCard onRetry={() => setRetry((n) => n + 1)} />;
  else {
    const tbl = by === 'campaign' ? v.campaigns : v.channels;
    const T = tbl.total;
    const roasTone = (x) => (x == null ? '' : x >= 1 ? ' is-good' : x < 0.3 ? ' is-weak' : '');
    const maxShare = Math.max(0.01, ...v.touch.flatMap((r) => [r.first, r.last]));
    body = (
      <>
        <MetricStrip label={'Key figures, ' + P.label.toLowerCase()} items={[
          { label: 'Website visits', value: num(T.visits), icon: 'eye' },
          { label: 'Leads', value: num(T.leads), sub: pct(T.visits ? T.leads / T.visits : null) + ' of visits', href: '/admin/leads', icon: 'user-plus' },
          { label: 'Trials', value: num(T.trials), href: '/admin/onboarding?tab=trials', icon: 'flask-conical' },
          { label: 'Paid stores', value: num(T.paid), sub: T.trials ? pct(T.paid / T.trials, 0) + ' of trials' : null, href: '/admin/merchants?view=paying', icon: 'store' },
          { label: 'Cost to win a store', value: T.cac == null ? '—' : short(T.cac), sub: T.roas == null ? null : 'Return ' + times(T.roas), icon: 'wallet' },
        ]} />

        <section className="ix-card" aria-label="Attribution table">
          <div className="ix-bar"><IndexTabs label="Group by" tabs={[
            { key: 'channel', label: 'Channels', count: v.channels.rows.length, on: by === 'channel', onClick: () => setQ({ by: 'channel' }), id: 'at-tab-channel' },
            { key: 'campaign', label: 'Campaigns', count: v.campaigns.rows.length, on: by === 'campaign', onClick: () => setQ({ by: 'campaign' }), id: 'at-tab-campaign' },
          ]} /></div>
          {tbl.rows.length ? (
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table ix-table--static an-table">
                <caption className="sr-only">{by === 'campaign' ? 'Campaigns' : 'Channels'}, {MODELS.find(([k]) => k === model)[1].toLowerCase()}</caption>
                <thead><tr>
                  <th scope="col">{by === 'campaign' ? 'Campaign' : 'Channel'}</th>
                  <th scope="col" className="ix-num">Visits</th><th scope="col" className="ix-num">Leads</th><th scope="col" className="ix-num">Trials</th>
                  <th scope="col" className="ix-num">Paid</th><th scope="col" className="ix-num">Revenue to date</th><th scope="col" className="ix-num">Cost</th>
                  <th scope="col" className="ix-num">CAC</th><th scope="col" className="ix-num">ROAS</th>
                </tr></thead>
                <tbody>
                  {tbl.rows.map((r) => (
                    <tr key={r.key}>
                      <td className="an-name">
                        <b><i className="an-dot" style={{ background: (CH[r.channel] || {}).color || 'var(--viz-quiet)' }} aria-hidden="true" />{r.name}</b>
                        <small>{by === 'campaign' ? r.channelName + (r.utm ? ' · ' + r.utm : '') : r.utm}</small>
                      </td>
                      <td className="ix-num">{r.visits == null ? <span className="ix-muted">offline</span> : num(r.visits)}</td>
                      <td className="ix-num">{num(r.leads)}</td><td className="ix-num">{num(r.trials)}</td><td className="ix-num">{num(r.paid)}</td>
                      <td className="ix-num">{r.revenue ? money(r.revenue) : '—'}</td><td className="ix-num">{r.cost ? money(r.cost) : '—'}</td>
                      <td className="ix-num">{r.cac == null ? '—' : money(r.cac)}</td>
                      <td className={'ix-num at-roas' + roasTone(r.roas)}>{times(r.roas)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr>
                  <td>Total</td><td className="ix-num">{num(T.visits)}</td><td className="ix-num">{num(T.leads)}</td><td className="ix-num">{num(T.trials)}</td>
                  <td className="ix-num">{num(T.paid)}</td><td className="ix-num">{money(T.revenue)}</td><td className="ix-num">{money(T.cost)}</td>
                  <td className="ix-num">{T.cac == null ? '—' : money(T.cac)}</td><td className="ix-num">{times(T.roas)}</td>
                </tr></tfoot>
              </table>
            </div>
          ) : <p className="an-empty">No visits, leads or trials in this period. <button type="button" className="ix-btn ix-btn--sm" onClick={() => setQ({ p: 'year' })}>Show 12 months</button></p>}
        </section>

        <div className="an-grid an-grid--21">
          <Card title="First touch against last touch" tip="Share of the period's trials credited to each channel. Channels that introduce people (ads, search, referrals) usually get more under first touch; the ones that close (direct, email, WhatsApp) get more under last touch.">
            {v.touch.length ? (
              <div className="at-touch">
                {v.touch.map((r) => {
                  const d = Math.round((r.first - r.last) * 100);
                  return (
                    <div key={r.key} className="at-trow" aria-label={`${r.name}: first touch ${pct(r.first, 0)}, last touch ${pct(r.last, 0)}`}>
                      <span><i className="an-dot" style={{ background: r.color }} aria-hidden="true" />{r.name}</span>
                      <span className="at-bars" aria-hidden="true">
                        <i style={{ width: `${(r.first / maxShare) * 100}%`, background: FIRST }} />
                        <i style={{ width: `${(r.last / maxShare) * 100}%`, background: LAST }} />
                      </span>
                      <span className="at-vals"><span>{pct(r.first, 0)} · {pct(r.last, 0)}</span><span className={'at-shift' + (d > 0 ? ' is-up' : d < 0 ? ' is-down' : '')}>{d > 0 ? '+' : d < 0 ? '−' : ''}{Math.abs(d)} pts</span></span>
                    </div>
                  );
                })}
                <ul className="dch-legend">
                  <li><i style={{ background: FIRST }} aria-hidden="true" />First touch</li>
                  <li><i style={{ background: LAST }} aria-hidden="true" />Last touch</li>
                </ul>
              </div>
            ) : <p className="an-empty">No trials in this period.</p>}
          </Card>
          <Card title="Where to act">
            <div className="an-rows">
              {ACT.map(([href, icon, label]) => (
                <Link key={href} href={href} className="an-row"><span><Icon name={icon} width="16" height="16" aria-hidden="true" style={{ marginRight: 8, verticalAlign: 'middle' }} />{label}</span><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></Link>
              ))}
            </div>
            <div className="an-foot"><span>Revenue to date is what the paid stores have paid so far; cost is the period's spend, fees and commission.</span></div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <AdminShell active="analytics-attribution" title="Attribution">
      <style dangerouslySetInnerHTML={{ __html: AN_CSS + CHART_CSS + CSS }} />
      <div className="ix-page">
        <AnHeader icon="git-branch" title="Attribution" q={q} setQ={setQ} compare={false}
          about="Which channels and UTM campaigns bring GridCommerce its stores: website visits, leads, trials and paid stores, with what each paid so far, what the channel cost, the cost to win a store (CAC) and the return on spend (ROAS). Switch between last touch (the channel recorded at signup) and first touch (where the person first came from).">
          <Segmented label="Attribution model" value={model} onChange={(m) => setQ({ model: m })} options={MODELS} />
          <button type="button" className="ix-btn" onClick={exportCsv} disabled={!v}><Icon name="download" width="16" height="16" aria-hidden="true" /><span>Export</span></button>
        </AnHeader>
        {live ? <p className="an-meta" aria-live="polite">{P.text} · {model === 'first' ? 'first touch' : 'last touch'}</p> : null}
        {body}
      </div>
    </AdminShell>
  );
}
