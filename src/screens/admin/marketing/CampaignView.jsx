'use client';
// Marketing › Campaign (/admin/campaigns/view?id=MC-103) — one of GridCommerce's own marketing campaigns, laid out like
// a merchant record: RecordHeader (status badge, the next status action as the main button: Launch / Pause / Resume;
// Edit and New UTM link beside it; End, Delete draft and Export under More), then the work column (budget against
// spend with the day-by-day spend, the results funnel impressions → clicks → leads → trials → paid, results per
// channel, the linked ads and UTM links) and the side column (details, notes, activity).
// Data: lib/admin/marketing.js (campaignFacts, launchCampaign, pauseCampaign, resumeCampaign, endCampaign, deleteCampaign).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState, InfoTip } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { ColumnChart, CHART_CSS } from '@/components/charts/DashCharts';
import { downloadCsv } from '@/lib/reports/period';
import { DAY, dm, dmy, ago } from '@/lib/platform/util';
import {
  campaignFacts, goalLabel, CH_COLOR, PLATFORMS, launchCampaign, pauseCampaign, resumeCampaign, endCampaign, deleteCampaign,
} from '@/lib/admin/marketing';
import { AdminShell } from '../AdminShell';
import {
  useMarketing, MK_CSS, Skel, Card, Status, Channels, Bar, Funnel, Plat, CampaignSheet, UtmSheet, copyText, money, num, pct, orDash, times, short,
} from './mkShared';

const CSS = `
.cv-budget{display:flex;flex-direction:column;gap:var(--space-2)}
.cv-budget__top{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-body)}
.cv-budget__top b{font-family:var(--font-data);font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cv-budget .mk-bar{height:8px}
.cv-facts{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:var(--space-2);margin-top:var(--space-4)}
.cv-facts>div{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-page)}
.cv-facts span{font-size:var(--text-xs);color:var(--text-muted)}
.cv-facts b{font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cv-log{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.cv-log li{display:flex;flex-direction:column;gap:2px;padding:8px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body)}
.cv-log li:first-child{border-top:0;padding-top:0}
.cv-log small{font-size:var(--text-xs);color:var(--text-muted)}
.cv-notes{margin:0;font-size:var(--text-sm);color:var(--text-body);white-space:pre-wrap}
.cv-skel{height:220px;border-radius:var(--radius-xl);background:var(--surface-subtle)}
.cv-code{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-heading)}
.cv-copy{display:inline-flex;align-items:center;gap:4px;padding:0;border:0;background:none;font:inherit;font-family:var(--font-data);font-size:var(--text-xs);color:var(--primary);cursor:pointer}
.cv-copy:hover{text-decoration:underline}
.cv-copy:focus-visible{outline:2px solid var(--primary);outline-offset:2px;border-radius:var(--radius-sm)}
@media (max-width:900px){.cv-facts{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;

const ABOUT = 'One marketing campaign: its budget against what has been spent, the results funnel from impressions to paid stores, the results by channel, the ads and UTM links that belong to it, and its history. Pause stops spend on every channel and its ads at once; End stops it for good.';

function csvRows(f) {
  return [
    ['Channel', 'Planned (BDT)', 'Spent (BDT)', 'Impressions', 'Reach', 'Clicks', 'Leads', 'Qualified', 'Trials', 'Paid', 'Cost per lead', 'CAC', 'First-year revenue'],
    ...f.channels.map(({ ch, plan, m }) => [ch, plan, Math.round(m.spend), Math.round(m.impressions), Math.round(m.reach), Math.round(m.clicks), Math.round(m.leads), Math.round(m.qualified), Math.round(m.trials), Math.round(m.paid), m.cpl ? Math.round(m.cpl) : '', m.cac ? Math.round(m.cac) : '', Math.round(m.revenue)]),
  ];
}

export default function CampaignView() {
  const router = useRouter();
  const { data, t, live } = useMarketing();
  const [id, setId] = useState(null);
  const [edit, setEdit] = useState(null);
  const [utm, setUtm] = useState(false);
  useEffect(() => { setId((new URLSearchParams(window.location.search).get('id') || '').trim().toUpperCase()); }, []);

  const shell = (inner, title = 'Campaign') => (
    <AdminShell active="campaigns" title={title}>
      <style dangerouslySetInnerHTML={{ __html: MK_CSS + CSS + CHART_CSS }} />
      {inner}
    </AdminShell>
  );
  if (!live || id == null) {
    return shell(<div className="ix-page" aria-busy="true" aria-label="Loading the campaign"><div className="mk-skel mk-skel--strip" /><div className="ix-record"><div className="cv-skel" /><div className="cv-skel" /></div></div>);
  }
  const f = id ? campaignFacts(data, t, id) : null;
  if (!f) {
    return shell(
      <div className="ix-page">
        <RecordHeader back="/admin/campaigns" backLabel="Back to campaigns" title="Campaign" />
        <section className="ix-card">
          <EmptyState icon="megaphone" title={id ? `No campaign with the ID ${id}` : 'No campaign picked'} body="Check the ID, or open the campaign from the list." actionLabel="Back to campaigns" onAction={() => router.push('/admin/campaigns')} />
        </section>
      </div>,
    );
  }

  const { c, status, total: m, budget, elapsed } = f;
  const run = (fn, ok) => { const r = fn(); if (r.ok) toast(typeof ok === 'function' ? ok(r) : ok); else toast(r.error, { tone: 'error' }); };
  const doEnd = async () => {
    const yes = await confirmDialog({ title: `End “${c.name}”?`, body: 'Spend stops on every channel and its ads end. Results so far stay. It can’t be restarted; make a new campaign instead.', confirmLabel: 'End campaign', tone: 'danger' });
    if (yes) run(() => endCampaign(c.id), 'Campaign ended');
  };
  const doDelete = async () => {
    const yes = await confirmDialog({ title: `Delete the draft “${c.name}”?`, body: 'Its UTM links go too.', confirmLabel: 'Delete draft', tone: 'danger' });
    if (!yes) return;
    const r = deleteCampaign(c.id);
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    toast('Draft deleted');
    router.push('/admin/campaigns');
  };
  const primary = status === 'Draft' ? { label: 'Launch', icon: 'rocket', onClick: () => run(() => launchCampaign(c.id), (r) => (r.scheduled ? 'Scheduled · starts ' + dm(c.start) : 'Campaign launched')) }
    : status === 'Running' || status === 'Scheduled' ? { label: 'Pause', icon: 'pause', onClick: () => run(() => pauseCampaign(c.id), 'Paused · spend stops on every channel') }
      : status === 'Paused' ? { label: 'Resume', icon: 'play', onClick: () => run(() => resumeCampaign(c.id), 'Resumed') } : null;
  const secondary = [
    status !== 'Ended' ? { label: 'Edit', icon: 'pencil', onClick: () => setEdit(c.id) } : null,
    { label: 'New UTM link', icon: 'link', onClick: () => setUtm({ mcId: c.id, n: Date.now() }) },
  ].filter(Boolean);
  const more = [
    { label: 'Export results', onClick: () => { downloadCsv(`campaign-${c.id}.csv`, csvRows(f)); toast('Results exported'); } },
    status === 'Draft' ? { label: 'Delete draft', tone: 'danger', onClick: doDelete } : null,
    status === 'Running' || status === 'Paused' || status === 'Scheduled' ? { label: 'End campaign', tone: 'danger', onClick: doEnd } : null,
  ].filter(Boolean);

  // spend per day (per week for long campaigns)
  let chart = f.days.map((d) => ({ label: d.label, title: d.title, values: [d.spend] }));
  if (chart.length > 45) {
    const w = [];
    for (let i = 0; i < f.days.length; i += 7) { const s = f.days.slice(i, i + 7); w.push({ label: s[0].label, title: 'Week of ' + s[0].title, values: [s.reduce((a, d) => a + d.spend, 0)] }); }
    chart = w;
  }
  const end = Math.min(c.end, c.endedAt || Infinity);
  const daysLeft = Math.max(0, Math.ceil((c.end - t) / DAY));
  const used = budget ? m.spend / budget : 0;
  const adCh = f.channels.filter((x) => x.ad).map((x) => x.ch);
  const noAds = adCh.filter((ch) => !f.ads.some((a) => a.channel === ch));

  return shell(
    <div className="ix-page">
      <RecordHeader back="/admin/campaigns" backLabel="Back to campaigns" title={c.name} badges={<Status s={status} />}
        meta={`${goalLabel(c.goal)} · ${c.channels.join(', ')} · ${dm(c.start)}–${dmy(end)} · ${c.owner}`}
        about={ABOUT} secondary={secondary} more={more} primary={primary} />
      <div className="ix-record">
        <div className="ix-main">
          <Card title="Budget and spend" action={<InfoTip text="The line on the bar shows how much of the campaign’s time has gone. Meta, Google and YouTube spend comes from the linked ads; email, SMS, events and affiliates from their own costs." />}>
            <div className="cv-budget">
              <div className="cv-budget__top"><span><b>{money(m.spend)}</b> of {money(budget)}</span><span>{pct(used * 100, 0)} spent · {status === 'Ended' ? 'ended ' + dm(end) : status === 'Draft' ? 'not launched' : status === 'Scheduled' ? 'starts ' + dm(c.start) : `${daysLeft} days left`}</span></div>
              <Bar value={used} mark={status === 'Draft' || status === 'Scheduled' ? undefined : elapsed} label={`${pct(used * 100, 0)} of the budget spent, ${pct(elapsed * 100, 0)} of the time gone`} />
            </div>
            {chart.length ? (
              <div style={{ marginTop: 'var(--space-4)' }}>
                <ColumnChart label="Spend per day" height={170} data={chart} series={[{ name: 'Spend', color: 'var(--viz-1)' }]} fmt={money} tickFmt={(v) => '৳' + short(v)} now={chart.length - 1} />
              </div>
            ) : <p className="mk-note" style={{ marginTop: 'var(--space-3)' }}>Spend shows here once the campaign starts.</p>}
          </Card>

          <Card title="Results">
            {m.impressions > 0 ? <>
            <Funnel m={m} />
            <div className="cv-facts">
              <div><span>Cost per lead</span><b>{orDash(m.cpl)}</b></div>
              <div><span>Qualified leads</span><b>{num(m.qualified)}</b></div>
              <div><span>Cost per trial</span><b>{orDash(m.cpt)}</b></div>
              <div><span>CAC</span><b>{orDash(m.cac)}</b></div>
              <div><span>Return on spend</span><b>{times(m.roas)}</b></div>
            </div>
            </> : <p className="mk-empty">Results show here once the campaign runs.</p>}
          </Card>

          <Card title="By channel" flush>
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table ix-table--static gc-table--keep gc-table--scroll">
                <caption className="sr-only">Results by channel</caption>
                <thead><tr><th scope="col">Channel</th><th scope="col">Spent of planned</th><th scope="col" className="ix-num">Impressions</th><th scope="col" className="ix-num">Clicks</th><th scope="col" className="ix-num">Leads</th><th scope="col" className="ix-num">Cost per lead</th><th scope="col" className="ix-num">Trials</th><th scope="col" className="ix-num">Paid</th><th scope="col" className="ix-num">CAC</th></tr></thead>
                <tbody>
                  {f.channels.map(({ ch, plan, m: x }) => (
                    <tr key={ch}>
                      <th scope="row" style={{ fontWeight: 'var(--weight-medium)' }}><span className="mk-ch"><i style={{ background: CH_COLOR[ch] }} aria-hidden="true" />{ch}</span></th>
                      <td><span className="mk-budget"><Bar value={plan ? x.spend / plan : 0} label={`${money(x.spend)} of ${money(plan)}`} /><small><span className="mk-fig">{money(x.spend)}</span> of {money(plan)}</small></span></td>
                      <td className="ix-num mk-fig">{num(x.impressions)}</td>
                      <td className="ix-num mk-fig">{num(x.clicks)}</td>
                      <td className="ix-num mk-fig">{num(x.leads)}</td>
                      <td className="ix-num mk-fig">{orDash(x.cpl)}</td>
                      <td className="ix-num mk-fig">{num(x.trials)}</td>
                      <td className="ix-num mk-fig">{num(x.paid)}</td>
                      <td className="ix-num mk-fig">{orDash(x.cac)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {adCh.length ? (
            <Card title="Ads" link={{ href: '/admin/ads?tab=campaigns', label: 'All ads' }} flush>
              {f.ads.length ? (
                <div className="ix-table-wrap ix-table-wrap--show">
                  <table className="ix-table gc-table--keep gc-table--scroll">
                    <caption className="sr-only">Ad campaigns in this campaign</caption>
                    <thead><tr><th scope="col">Ad campaign</th><th scope="col">Status</th><th scope="col" className="ix-num">Budget a day</th><th scope="col" className="ix-num">Spend</th><th scope="col" className="ix-num">Leads</th><th scope="col" className="ix-num">Cost per lead</th><th scope="col" className="ix-num">Paid</th></tr></thead>
                    <tbody>
                      {f.ads.map((a) => {
                        const go = () => router.push('/admin/ads?tab=campaigns&open=' + a.id);
                        return (
                          <tr key={a.id} tabIndex={0} onClick={go} onKeyDown={(e) => { if (e.key === 'Enter') go(); }}>
                            <td><span className="mk-name"><b>{a.name}</b><small className="mk-sub"><Plat p={a.platform} label={`${a.channel} · ${a.account ? a.account.name : ''}`} /></small></span></td>
                            <td><Status s={a.status} /></td>
                            <td className="ix-num mk-fig">{money(a.budgetDay)}</td>
                            <td className="ix-num mk-fig">{money(a.m.spend)}</td>
                            <td className="ix-num mk-fig">{num(a.m.leads)}</td>
                            <td className="ix-num mk-fig">{orDash(a.m.cpl)}</td>
                            <td className="ix-num mk-fig">{num(a.m.paid)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : null}
              {noAds.length ? <div className="mk-body"><p className="mk-note">No {noAds.join(' or ')} ads are linked yet. Make them in {noAds.map((ch) => (ch === 'Meta' ? PLATFORMS.meta.long : PLATFORMS.google.long)).filter((v, i, a) => a.indexOf(v) === i).join(' and ')} with the campaign name <span className="cv-code">{c.slug}</span>; they show here after the next sync.</p></div> : null}
            </Card>
          ) : null}

          <Card title="UTM links" action={<button type="button" className="ix-btn ix-btn--sm" onClick={() => setUtm({ mcId: c.id, n: Date.now() })}><Icon name="plus" width="16" height="16" aria-hidden="true" />New link</button>} flush>
            {f.links.length ? (
              <div className="ix-table-wrap ix-table-wrap--show">
                <table className="ix-table ix-table--static gc-table--keep gc-table--scroll">
                  <caption className="sr-only">UTM links of this campaign</caption>
                  <thead><tr><th scope="col">Link</th><th scope="col">Short link</th><th scope="col" className="ix-num">Clicks</th><th scope="col" className="ix-num">Leads</th><th scope="col" className="ix-num">Trials</th><th scope="col" className="ix-num">Paid</th></tr></thead>
                  <tbody>
                    {f.links.map((l) => (
                      <tr key={l.id}>
                        <td><span className="mk-name"><b>{l.name}</b><small className="mk-sub">{l.source} / {l.medium}{l.content ? ' · ' + l.content : ''} → {l.page}{l.archived ? ' · archived' : ''}</small></span></td>
                        <td><button type="button" className="cv-copy" onClick={() => copyText('https://' + l.short, 'Short link')} aria-label={'Copy ' + l.short}>{l.short}<Icon name="copy" width="14" height="14" aria-hidden="true" /></button></td>
                        <td className="ix-num mk-fig">{num(l.m.clicks)}</td>
                        <td className="ix-num mk-fig">{num(l.m.leads)}</td>
                        <td className="ix-num mk-fig">{num(l.m.trials)}</td>
                        <td className="ix-num mk-fig">{num(l.m.paid)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div className="mk-body"><p className="mk-empty">No UTM links yet.</p></div>}
          </Card>
        </div>

        <div className="ix-side">
          <Card title="Details">
            <KV rows={[
              ['ID', <span key="id" className="mk-id">{c.id}</span>],
              ['Goal', goalLabel(c.goal)],
              ['Channels', <Channels key="ch" list={c.channels} />],
              ['Business type', c.audience.type],
              ['District', c.audience.district],
              ['Size', c.audience.size],
              ['Owner', c.owner],
              ['Runs', `${dmy(c.start)} – ${dmy(c.end)}`],
              c.endedAt ? ['Ended', dmy(c.endedAt)] : null,
              ['UTM campaign', <span key="u" className="cv-code">{c.slug}</span>],
              ['Created', dmy(c.createdAt)],
            ]} />
          </Card>
          {c.notes ? <Card title="Notes"><p className="cv-notes">{c.notes}</p></Card> : null}
          <Card title="Activity">
            <ul className="cv-log">
              {(c.log || []).slice(0, 8).map((e, i) => (
                <li key={i}><span>{e.text}</span><small>{e.by} · {ago(e.at, t)}</small></li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
      <CampaignSheet id={edit} data={data} t={t} onClose={() => setEdit(null)} />
      <UtmSheet open={utm} data={data} onClose={() => setUtm(false)} />
    </div>,
    c.name,
  );
}
