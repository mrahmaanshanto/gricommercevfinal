'use client';
// Marketing › Overview (/admin/marketing) — GridCommerce's own marketing to win merchants at a glance, laid out like the
// merchant Home: the title row (New UTM link, New campaign), five figures for the period (spend, leads, cost per lead,
// new trials, CAC), at most five things to fix, spend against leads per day, the channel mix, paid stores and
// qualified leads, the top five campaigns and this month's campaign calendar strip.
// Data: lib/admin/marketing.js (records, periodRange, totalsBy, attention, calendar). Worked out after mount.

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { InfoTip } from '@/components/ui';
import { MetricStrip, ShopHeader } from '@/components/ui/IndexKit';
import { ColumnChart, Donut, Legend, CHART_CSS } from '@/components/charts/DashCharts';
import { DAY, startOfDay, monthLong, dm } from '@/lib/platform/util';
import {
  PERIODS, CHANNELS, CH_COLOR, records, inRange, periodRange, sum, totalsBy, series, attention, calendar, campaignById, mcStatus, goalLabel, FIRST_YEAR,
} from '@/lib/admin/marketing';
import { AdminShell } from '../AdminShell';
import {
  useMarketing, MK_CSS, Skel, LoadError, Card, Status, FixList, Delta, CampaignSheet, UtmSheet, money, num, pct, moneyShort, orDash, times, plural,
} from './mkShared';

const CSS = `
.mo-mini{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.mo-mini>div{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-page)}
.mo-mini span{font-size:var(--text-xs);color:var(--text-muted)}
.mo-mini b{font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.mo-mini small{font-size:var(--text-xs);color:var(--text-muted)}
.mo-mix{display:flex;align-items:center;gap:var(--space-4)}
.mo-mix .dch-legend{flex:1;min-width:0;flex-direction:column;align-items:stretch}
.mo-cal{overflow-x:auto;padding:var(--space-3) var(--space-4) var(--space-4)}
.mo-cal__in{min-width:680px;display:flex;flex-direction:column;gap:6px}
.mo-cal__days,.mo-cal__row{display:grid;grid-template-columns:200px repeat(var(--n),minmax(0,1fr));align-items:center;column-gap:0}
.mo-cal__days span{font-family:var(--font-data);font-size:var(--text-2xs);color:var(--text-muted);text-align:center}
.mo-cal__days span.is-today{color:var(--primary);font-weight:var(--weight-semibold)}
.mo-cal__days span.is-we{opacity:.6}
.mo-cal__name{display:flex;flex-direction:column;min-width:0;padding-right:var(--space-2)}
.mo-cal__name a{overflow:hidden;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-decoration:none;text-overflow:ellipsis;white-space:nowrap}
.mo-cal__name a:hover{color:var(--primary)}
.mo-cal__name small{font-size:var(--text-xs);color:var(--text-muted)}
.mo-cal__bar{position:relative;height:22px;border-radius:var(--radius-full);color:var(--text-heading);border-left:3px solid var(--c);background:color-mix(in srgb,var(--c) 22%,var(--surface-card));font-size:var(--text-2xs);line-height:22px;padding:0 8px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.mo-cal__bar.is-Draft{background:transparent!important;border:1px dashed var(--border-strong);color:var(--text-muted)}
.mo-cal__bar.is-Paused{opacity:.55}
.mo-cal__bar.is-Scheduled{opacity:.75}
.mo-cal__row{position:relative;min-height:36px;border-top:1px solid var(--border-subtle)}
.mo-cal__today{position:absolute;top:0;bottom:0;width:2px;background:var(--primary);opacity:.5;pointer-events:none}
@media (max-width:640px){.mo-mix{flex-direction:column;align-items:stretch}.mo-mix .dch-donut{align-self:center}}
`;

/** Day columns for the period (weeks for 90 days, so the bars stay readable). */
function chartRows(recs, r) {
  const days = series(recs, r.from, r.to);
  if (r.days <= 31) return days.map((d) => ({ label: d.label, title: d.title, spend: d.spend, leads: d.leads }));
  const out = [];
  for (let i = 0; i < days.length; i += 7) {
    const w = days.slice(i, i + 7);
    out.push({ label: w[0].label, title: `Week of ${w[0].title}`, spend: w.reduce((a, d) => a + d.spend, 0), leads: w.reduce((a, d) => a + d.leads, 0) });
  }
  return out;
}

export default function MarketingOverview() {
  const router = useRouter();
  const { data, t, live } = useMarketing();
  const [period, setPeriod] = useState('month');
  const [newCamp, setNewCamp] = useState(null);
  const [utm, setUtm] = useState(false);
  const [retry, setRetry] = useState(0);

  let x = null;
  if (live) {
    try {
      const recs = records(data, t);
      const r = periodRange(period, t);
      const cur = inRange(recs, r.from, r.to);
      const prev = inRange(recs, r.prevFrom, r.prevTo);
      const byMc = totalsBy(cur, 'mcId');
      const top = Object.entries(byMc).map(([id, m]) => ({ c: campaignById(data, id), m })).filter((z) => z.c).sort((a, b) => b.m.spend - a.m.spend).slice(0, 5);
      x = { r, now: sum(cur), was: sum(prev), byCh: totalsBy(cur, 'channel'), chart: chartRows(cur, r), top, fix: attention(data, t), cal: calendar(data, t), retry };
    } catch (e) { x = { error: e }; }
  }

  const header = (
    <ShopHeader icon="megaphone" title="Marketing"
      about="GridCommerce’s own marketing to win merchants: what was spent across Meta, Google, YouTube, email, SMS, events and affiliates, the leads, trials and paid stores it brought, and what needs fixing. Cost per lead = spend ÷ leads; CAC = spend ÷ stores that started paying; revenue is each paying store’s first-year value."
      secondary={[{ label: 'New UTM link', icon: 'link', onClick: () => setUtm({ n: Date.now() }) }]}
      more={[{ label: 'Ads', href: '/admin/ads' }, { label: 'UTM links', href: '/admin/utm' }, { label: 'Campaign calendar', href: '/admin/campaigns?view=calendar' }]}
      primary={{ label: 'New campaign', icon: 'plus', onClick: () => setNewCamp('new') }} />
  );

  let body;
  if (!x) body = <Skel label="Loading marketing" />;
  else if (x.error) body = <LoadError text="The figures could not be worked out." onRetry={() => setRetry((n) => n + 1)} />;
  else {
    const { r, now: a, was: b, byCh, chart, top, fix, cal } = x;
    const lead = (
      <select className="ix-pick" aria-label="Period" value={period} onChange={(e) => setPeriod(e.target.value)}>
        {PERIODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
    );
    const mix = CHANNELS.map((ch) => ({ ch, m: byCh[ch] })).filter((z) => z.m && z.m.spend > 0);
    const today = startOfDay(t);
    const todayN = Math.floor((today - cal.monthStart) / DAY) + 1;
    body = (
      <>
        <MetricStrip lead={lead} label={'Key figures, ' + r.label.toLowerCase()} items={[
          { label: 'Marketing spend', value: money(a.spend), sub: <Delta now={a.spend} prev={b.spend} lowerIsBetter />, icon: 'wallet' },
          { label: 'Leads', value: num(a.leads), sub: <Delta now={a.leads} prev={b.leads} />, href: '/admin/leads', icon: 'users' },
          { label: 'Cost per lead', value: orDash(a.cpl), sub: <Delta now={a.cpl || 0} prev={b.cpl || 0} lowerIsBetter />, icon: 'target' },
          { label: 'New trials', value: num(a.trials), sub: <Delta now={a.trials} prev={b.trials} />, icon: 'rocket' },
          { label: 'CAC', value: orDash(a.cac), sub: <Delta now={a.cac || 0} prev={b.cac || 0} lowerIsBetter />, icon: 'user-round-plus' },
        ]} />

        <section className="ix-card" aria-label="Things to fix">
          <div className="ix-card__head"><h2>Things to fix</h2></div>
          <FixList rows={fix} okText="Nothing needs fixing. Tracking, ad accounts and budgets look fine." />
        </section>

        <div className="mk-grid mk-grid--2">
          <Card title="Spend and leads" action={<InfoTip text="Columns: spend in thousand taka. Line: leads. Both from every channel, per day (per week over 90 days)." />}>
            <ColumnChart key={period} label={`Spend and leads, ${r.label.toLowerCase()}`} height={220}
              data={chart.map((d) => ({ label: d.label, title: d.title, values: [d.spend / 1000], line: d.leads }))}
              series={[{ name: 'Spend (৳ thousand)', color: 'var(--viz-1)' }]} line={{ name: 'Leads', color: 'var(--viz-5)' }}
              fmt={(v) => num(v)} now={chart.length - 1} />
            <div style={{ marginTop: 'var(--space-3)' }}>
              <Legend items={[{ name: 'Spend', color: 'var(--viz-1)', value: money(a.spend) }, { name: 'Leads', color: 'var(--viz-5)', kind: 'line', value: num(a.leads) }]} />
            </div>
          </Card>
          <Card title="Channel mix" link={{ href: '/admin/ads', label: 'Ads' }}>
            {mix.length ? (
              <div className="mo-mix">
                <Donut label="Spend by channel" parts={mix.map((z) => ({ name: z.ch, value: z.m.spend, color: CH_COLOR[z.ch] }))} fmt={moneyShort} total={moneyShort(a.spend)} totalLabel="spent" size={132} />
                <Legend items={mix.map((z) => ({ name: `${z.ch} · ${num(z.m.leads)} leads`, color: CH_COLOR[z.ch], value: orDash(z.m.cpl) }))} />
              </div>
            ) : <p className="mk-empty">Nothing was spent in this period.</p>}
          </Card>
        </div>

        <div className="mk-grid mk-grid--2">
          <Card title="Top campaigns" link={{ href: '/admin/campaigns', label: 'All campaigns' }} flush>
            {top.length ? (
              <>
                <ul className="ix-plist" aria-label="Top campaigns">
                  {top.map(({ c, m }) => (
                    <li key={c.id}><Link href={'/admin/campaigns/view?id=' + c.id} className="ix-pitem">
                      <span className="ix-pitem__top"><b>{c.name}</b><span className="mk-fig">{money(m.spend)}</span></span>
                      <span className="ix-pitem__mid">{num(m.leads)} leads · {orDash(m.cpl)} a lead · {num(m.paid)} paid</span>
                    </Link></li>
                  ))}
                </ul>
                <div className="ix-table-wrap">
                  <table className="ix-table gc-table--keep">
                    <caption className="sr-only">Top campaigns by spend, {r.label.toLowerCase()}</caption>
                    <thead><tr><th scope="col">Campaign</th><th scope="col">Status</th><th scope="col" className="ix-num">Spend</th><th scope="col" className="ix-num">Leads</th><th scope="col" className="ix-num">Cost per lead</th><th scope="col" className="ix-num">Trials</th><th scope="col" className="ix-num">Paid</th><th scope="col" className="ix-num">CAC</th></tr></thead>
                    <tbody>
                      {top.map(({ c, m }) => {
                        const go = () => router.push('/admin/campaigns/view?id=' + c.id);
                        return (
                          <tr key={c.id} tabIndex={0} onClick={go} onKeyDown={(e) => { if (e.key === 'Enter') go(); }}>
                            <td><span className="mk-name"><b>{c.name}</b><small className="mk-sub">{goalLabel(c.goal)} · {c.owner}</small></span></td>
                            <td><Status s={mcStatus(c, t)} /></td>
                            <td className="ix-num mk-fig">{money(m.spend)}</td>
                            <td className="ix-num mk-fig">{num(m.leads)}</td>
                            <td className="ix-num mk-fig">{orDash(m.cpl)}</td>
                            <td className="ix-num mk-fig">{num(m.trials)}</td>
                            <td className="ix-num mk-fig">{num(m.paid)}</td>
                            <td className="ix-num mk-fig">{orDash(m.cac)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : <div className="mk-body"><p className="mk-empty">No campaign ran in this period.</p></div>}
          </Card>
          <Card title="Paid stores and qualified leads" action={<InfoTip text={`Qualified: leads the sales team marked as a fit after the first call. Revenue counts each new paying store’s first-year value (about ${money(FIRST_YEAR)}).`} />}>
            <div className="mo-mini">
              <div><span>Paid conversions</span><b>{num(a.paid)}</b><small><Delta now={a.paid} prev={b.paid} /> {pct(a.paidRate, 0)} of trials</small></div>
              <div><span>Qualified leads</span><b>{num(a.qualified)}</b><small>{pct(a.leads ? (a.qualified / a.leads) * 100 : null, 0)} of leads</small></div>
              <div><span>First-year revenue</span><b>{moneyShort(a.revenue)}</b><small><Delta now={a.revenue} prev={b.revenue} /></small></div>
              <div><span>Return on spend</span><b>{times(a.roas)}</b><small>{orDash(a.cpt)} a trial</small></div>
            </div>
          </Card>
        </div>

        <section className="ix-card" aria-label={`Campaigns in ${monthLong(t)}`}>
          <div className="ix-card__head"><h2>{monthLong(t)} campaigns</h2><Link href="/admin/campaigns?view=calendar">Calendar</Link></div>
          {cal.rows.length ? (
            <div className="mo-cal">
              <div className="mo-cal__in" style={{ '--n': cal.days }}>
                <div className="mo-cal__days" aria-hidden="true">
                  <span />
                  {Array.from({ length: cal.days }, (_, i) => {
                    const wd = new Date(cal.monthStart + i * DAY + 6 * 3600e3).getUTCDay();
                    return <span key={i} className={(i + 1 === todayN ? 'is-today' : '') + (wd === 5 || wd === 6 ? ' is-we' : '')}>{i + 1}</span>;
                  })}
                </div>
                {cal.rows.map((row) => (
                  <div key={row.c.id} className="mo-cal__row">
                    <span className="mo-cal__name"><Link href={'/admin/campaigns/view?id=' + row.c.id}>{row.c.name}</Link><small>{row.status} · {dm(row.c.start)}–{dm(Math.min(row.c.end, row.c.endedAt || Infinity))}</small></span>
                    <span className={'mo-cal__bar is-' + row.status} style={{ gridColumn: `${row.from + 1} / ${row.to + 2}`, '--c': CH_COLOR[row.c.channels[0]] }} title={`${row.c.name}: ${row.status}`}>{row.c.channels.join(' · ')}</span>
                    <span className="mo-cal__today" aria-hidden="true" style={{ left: `calc(200px + (100% - 200px) * ${(todayN - 0.5) / cal.days})` }} />
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="mk-body"><p className="mk-empty">No campaign runs this month.</p></div>}
          <div className="ix-foot"><span className="mk-foot"><span>Running<b>{cal.rows.filter((z) => z.status === 'Running').length}</b></span><span>Scheduled<b>{cal.rows.filter((z) => z.status === 'Scheduled').length}</b></span><span>Paused<b>{cal.rows.filter((z) => z.status === 'Paused').length}</b></span><span>{plural(cal.rows.length, 'campaign')} this month</span></span></div>
        </section>
      </>
    );
  }

  return (
    <AdminShell active="marketing" title="Marketing">
      <style dangerouslySetInnerHTML={{ __html: MK_CSS + CSS + CHART_CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>
      <CampaignSheet id={newCamp} data={data} t={t} onClose={() => setNewCamp(null)} onSaved={(id) => router.push('/admin/campaigns/view?id=' + id)} />
      <UtmSheet open={utm} data={data} onClose={() => setUtm(false)} />
    </AdminShell>
  );
}
