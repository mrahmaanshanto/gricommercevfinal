'use client';
// Support performance (/admin/support-performance) — how the support desk is doing: the desk now and the period's
// averages (five figures), tickets created against solved, what merchants write in about, how often the SLA is met,
// what merchants think of the help (CSAT by week) and each agent's numbers. Every figure is worked out from
// lib/admin/support.js › performance(from, to, t), after the saved data loads (the server render is the outline only).

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { InfoTip } from '@/components/ui';
import { MetricStrip } from '@/components/ui/IndexKit';
import { ColumnChart, HBars, CHART_CSS } from '@/components/charts/DashCharts';
import { downloadCsv } from '@/lib/reports/period';
import { DAY, dm, startOfDay } from '@/lib/platform/util';
import { useAdminStore } from '@/lib/admin/store';
import { supportStore, performance, TARGETS, span } from '@/lib/admin/support';
import { AdminShell } from '../AdminShell';
import { SUPPORT_CSS, Who } from './supportShared';

const PERIODS = [['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 90 days']];

const CSS = `
.spf-top{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.spf-top .ix-head{flex:1 1 auto}
.spf-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:var(--space-4);align-items:start}
.spf-grid--even{grid-template-columns:repeat(2,minmax(0,1fr))}
.spf-body{padding:var(--space-3) var(--space-4) var(--space-4)}
.spf-big{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-6);margin:0 0 var(--space-3)}
.spf-big div{display:flex;flex-direction:column;gap:2px}
.spf-big b{font-family:var(--font-data);font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.spf-big span{font-size:var(--text-xs);color:var(--text-muted)}
.spf-foot{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-5);margin-top:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.spf-foot b{margin-left:4px;font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.spf-table td,.spf-table th{white-space:nowrap}
.spf-low{color:var(--text-danger)}
.spf-err{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);padding:var(--space-8) var(--space-4);text-align:center;font-size:var(--text-sm)}
.spf-skel{height:280px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:spf-sk 1.4s ease infinite}
.spf-skel--strip{height:76px}
@keyframes spf-sk{from{background-position:100% 0}to{background-position:-100% 0}}
@media (max-width:1023px){.spf-grid,.spf-grid--even{grid-template-columns:minmax(0,1fr)}}
@media (prefers-reduced-motion:reduce){.spf-skel{animation:none}}
`;

const pct = (x) => (x == null ? '—' : x + '%');
const mins = (x) => (x == null ? '—' : span(x * 60000));
const hours = (x) => (x == null ? '—' : span(x * 3600e3));

function Card({ title, tip, link, children }) {
  return (
    <section className="ix-card" aria-label={title}>
      <div className="ix-card__head"><h2>{title}{tip ? <> <InfoTip text={tip} label={'About ' + title.toLowerCase()} /></> : null}</h2>{link ? <Link href={link.href}>{link.label}</Link> : null}</div>
      <div className="spf-body">{children}</div>
    </section>
  );
}

/** Created and solved per day (7 or 30 days) or per week (90 days). */
function series(days, weekly) {
  if (!weekly) return days.map((d) => ({ label: dm(d.day), values: [d.created], line: d.solved }));
  const out = [];
  for (let i = 0; i < days.length; i += 7) {
    const w = days.slice(i, i + 7);
    out.push({ label: dm(w[0].day), title: 'Week of ' + dm(w[0].day), values: [w.reduce((s, d) => s + d.created, 0)], line: w.reduce((s, d) => s + d.solved, 0) });
  }
  return out;
}

export default function SupportPerformance() {
  const { t, live } = useAdminStore(supportStore);
  const [period, setPeriod] = useState('30');
  const [retry, setRetry] = useState(0);
  const n = Number(period);
  const to = startOfDay(t) + DAY;
  const from = to - n * DAY;
  let p = null;
  let error = null;
  if (live) {
    try { p = performance(from, to, t); } catch (e) { error = e; }
  }
  const periodName = (PERIODS.find(([k]) => k === period) || [])[1];

  const exportCsv = () => {
    if (!p) return;
    downloadCsv(`gridcommerce-support-${period}d.csv`, [
      ['GridCommerce · Support performance', periodName],
      [],
      ['Figure', 'Value'],
      ['Open now', p.open], ['Waiting on merchant', p.pending], ['High or urgent, open', p.high],
      ['Average first reply (min)', p.firstReply ?? ''], ['Average time to solve (h)', p.resolveHours ?? ''],
      ['Tickets created', p.createdCount], ['Tickets solved', p.solvedCount], ['First reply on time', pct(p.firstMet)], ['Solved on time', pct(p.resolveMet)],
      ['Satisfaction (of 5)', p.csat ?? ''], ['Ratings', p.csatCount],
      [],
      ['Agent', 'Assigned', 'Solved', 'First reply (min)', 'Time to solve (h)', 'Rating', 'Ratings', 'Open now'],
      ...p.agents.map((a) => [a.name, a.assigned, a.solved, a.firstReply ?? '', a.resolveHours ?? '', a.rating ?? '', a.ratings, a.openNow]),
      [],
      ['Category', 'Tickets'], ...p.byCategory.map((c) => [c.name, c.value]),
    ]);
    toast('Support performance exported');
  };

  const header = (
    <div className="spf-top">
      <header className="ix-head">
        <h1 className="ix-head__title"><Icon name="life-buoy" width="18" height="18" aria-hidden="true" /><span>Support performance</span></h1>
        <span className="gc-pagehead__about" hidden>How GridCommerce's support desk is doing for its merchants: what is open now, how fast the first reply and the fix come, how often the SLA is met, what merchants write in about, what they think of the help, and each agent's numbers, for the period you pick.</span>
      </header>
      <div className="ix-head__actions">
        <select className="ix-pick" aria-label="Period" value={period} onChange={(e) => setPeriod(e.target.value)}>
          {PERIODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <button type="button" className="ix-btn" onClick={exportCsv} disabled={!p}><Icon name="download" width="16" height="16" aria-hidden="true" /><span>Export</span></button>
        <Link className="ix-btn ix-btn--primary" href="/admin/tickets"><Icon name="life-buoy" width="16" height="16" aria-hidden="true" /><span>Open tickets</span></Link>
      </div>
    </div>
  );

  let body;
  if (!live) {
    body = (
      <div className="ix-page" aria-busy="true" aria-label="Loading support performance">
        <div className="spf-skel spf-skel--strip" />
        <div className="spf-grid"><div className="spf-skel" /><div className="spf-skel" /></div>
      </div>
    );
  } else if (error || !p) {
    body = (
      <section className="ix-card"><div className="spf-err" role="alert">
        <Icon name="triangle-alert" width="24" height="24" aria-hidden="true" />
        <p style={{ margin: 0 }}>The figures could not be worked out.</p>
        <button type="button" className="ix-btn" onClick={() => setRetry(retry + 1)}>Try again</button>
      </div></section>
    );
  } else {
    const flow = series(p.days, n > 30);
    const csat = p.weeks.map((w) => ({ label: dm(w.from), title: 'Week of ' + dm(w.from) + (w.count ? ` · ${w.count} rating${w.count === 1 ? '' : 's'}` : ' · no ratings'), values: [w.rating] }));
    body = (
      <>
        <MetricStrip label={'Support, ' + periodName.toLowerCase()} items={[
          { label: 'Open tickets', value: String(p.open), href: '/admin/tickets?view=open', icon: 'life-buoy' },
          { label: 'Waiting on merchant', value: String(p.pending), href: '/admin/tickets?view=open', icon: 'hourglass' },
          { label: 'High priority open', value: String(p.high), href: '/admin/tickets?view=open&pri=Urgent', icon: 'triangle-alert' },
          { label: 'First reply', value: mins(p.firstReply), sub: 'average', icon: 'messages-square' },
          { label: 'Time to solve', value: hours(p.resolveHours), sub: 'average', icon: 'clock' },
        ]} />

        <div className="spf-grid">
          <Card title="Created and solved" link={{ href: '/admin/tickets?view=solved', label: 'Solved tickets' }}>
            <ColumnChart data={flow} series={[{ name: 'Created', color: 'var(--viz-1)' }]} line={{ name: 'Solved', color: 'var(--viz-3)' }}
              height={220} label={`Tickets created and solved, ${periodName.toLowerCase()}${n > 30 ? ', by week' : ', by day'}`} />
            <div className="spf-foot">
              <span>Created<b>{p.createdCount}</b></span>
              <span>Solved<b>{p.solvedCount}</b></span>
              <span>Open now<b>{p.open}</b></span>
            </div>
          </Card>
          <Card title="What merchants write about" link={{ href: '/admin/tickets', label: 'Tickets' }}>
            {p.createdCount ? (
              <HBars Link={Link} rows={p.byCategory.filter((c) => c.value).map((c) => ({ key: c.name, label: c.name, value: c.value, text: String(c.value), color: 'var(--viz-1)', href: '/admin/tickets?view=solved&cat=' + encodeURIComponent(c.name) }))} />
            ) : <p className="sp-muted" style={{ margin: 0, fontSize: 'var(--text-sm)' }}>No tickets in this period.</p>}
          </Card>
        </div>

        <div className="spf-grid spf-grid--even">
          <Card title="SLA met" tip={`First reply within ${span(TARGETS.Urgent.first)} (urgent), ${span(TARGETS.High.first)} (high), ${span(TARGETS.Normal.first)} (normal), ${span(TARGETS.Low.first)} (low); solved within ${span(TARGETS.Urgent.resolve)}, ${span(TARGETS.High.resolve)}, ${span(TARGETS.Normal.resolve)} and ${span(TARGETS.Low.resolve)}. The solving clock stops while a ticket waits on the merchant.`}>
            <div className="spf-big">
              <div><b>{pct(p.firstMet)}</b><span>First reply on time</span></div>
              <div><b>{pct(p.resolveMet)}</b><span>Solved on time</span></div>
            </div>
            <div className="ix-table-wrap">
              <table className="ix-table ix-table--static gc-table--keep gc-table--scroll spf-table">
                <caption className="sr-only">SLA met by priority</caption>
                <thead><tr><th scope="col">Priority</th><th scope="col" className="ix-num">Tickets</th><th scope="col" className="ix-num">First reply</th><th scope="col" className="ix-num">Solved</th></tr></thead>
                <tbody>
                  {p.byPriority.map((r) => (
                    <tr key={r.name}>
                      <th scope="row">{r.name}</th>
                      <td className="ix-num sp-data">{r.count}</td>
                      <td className={'ix-num sp-data' + (r.first != null && r.first < 80 ? ' spf-low' : '')}>{pct(r.first)}</td>
                      <td className={'ix-num sp-data' + (r.resolve != null && r.resolve < 80 ? ' spf-low' : '')}>{pct(r.resolve)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card title="Merchant satisfaction" tip="After a ticket is solved the merchant gets an SMS asking them to rate the help from 1 to 5. Satisfied = 4 or 5.">
            <div className="spf-big">
              <div><b>{p.csat == null ? '—' : p.csat.toFixed(1)}</b><span>Average of 5 · {p.csatCount} rating{p.csatCount === 1 ? '' : 's'}</span></div>
              <div><b>{pct(p.satisfied)}</b><span>Satisfied</span></div>
            </div>
            <ColumnChart data={csat} series={[{ name: 'Average rating', color: 'var(--viz-1)' }]} height={170} fmt={(v) => (v == null ? '—' : Number(v).toFixed(1))} tickFmt={(v) => String(Math.round(v * 10) / 10)}
              label="Average rating by week" />
          </Card>
        </div>

        <section className="ix-card" aria-label="Agents">
          <div className="ix-card__head"><h2>Agents</h2></div>
          <div className="ix-table-wrap">
            <table className="ix-table ix-table--static gc-table--keep spf-table">
              <caption className="sr-only">Each agent's numbers, {periodName.toLowerCase()}</caption>
              <thead>
                <tr>
                  <th scope="col">Agent</th>
                  <th scope="col" className="ix-num">Assigned</th>
                  <th scope="col" className="ix-num">Solved</th>
                  <th scope="col" className="ix-num">First reply</th>
                  <th scope="col" className="ix-num">Time to solve</th>
                  <th scope="col" className="ix-num">Rating</th>
                  <th scope="col" className="ix-num">Open now</th>
                </tr>
              </thead>
              <tbody>
                {p.agents.map((a) => (
                  <tr key={a.name}>
                    <th scope="row"><span className="sp-person"><Who name={a.name} size={24} /><Link className="ix-strong" href={'/admin/tickets?view=open&agent=' + encodeURIComponent(a.name)}>{a.name}</Link></span></th>
                    <td className="ix-num sp-data">{a.assigned}</td>
                    <td className="ix-num sp-data">{a.solved}</td>
                    <td className="ix-num sp-data">{mins(a.firstReply)}</td>
                    <td className="ix-num sp-data">{hours(a.resolveHours)}</td>
                    <td className={'ix-num sp-data' + (a.rating != null && a.rating < 4 ? ' spf-low' : '')}>{a.rating == null ? '—' : a.rating.toFixed(1)}{a.ratings ? <span className="sp-muted"> ({a.ratings})</span> : null}</td>
                    <td className="ix-num sp-data">{a.openNow}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  return (
    <AdminShell active="support-performance" title="Support performance">
      <style dangerouslySetInnerHTML={{ __html: SUPPORT_CSS + CHART_CSS + CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>
    </AdminShell>
  );
}
