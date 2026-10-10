'use client';
// Marketing › Campaigns (/admin/campaigns) — GridCommerce's own marketing campaigns, adapted from the merchant panel's
// Campaigns & creatives list: the title row (Export, New campaign), one card with the statuses as tabs (counts on the
// tabs), search and filters (channel, goal, owner), a List / Calendar switch, the table (a two-line list on phones) with
// budget against spend and results, and the pager. The calendar is a month grid with each campaign as a chip on the
// days it runs. A row or chip opens the campaign (/admin/campaigns/view?id=). New campaign is a side panel that also
// makes a UTM link per channel. View, tab, search and filters live in the address.
// Data: lib/admin/marketing.js (campaignRows, saveCampaign).

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { FilterBar } from '@/components/ui/FilterBar';
import { ShopHeader, IndexTabs, Pager } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { DAY, dm, dmy, monthLong, yearOf, startOfMonth, startOfDay, addMonths } from '@/lib/platform/util';
import { STATUSES, CHANNELS, GOALS, TEAM_NAMES, CH_COLOR, campaignRows, goalLabel } from '@/lib/admin/marketing';
import { AdminShell } from '../AdminShell';
import { useMarketing, MK_CSS, Skel, Status, Channels, BudgetCell, CampaignSheet, money, num, orDash, plural } from './mkShared';

const PAGE = 25;
const TABS = [['all', 'All'], ...STATUSES.map((s) => [s.toLowerCase(), s])];
const FILTER_KEYS = ['ch', 'goal', 'owner'];
const WEEK = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const CSS = `
.cg-filters{display:flex;flex-wrap:wrap;align-items:flex-start;gap:var(--space-2);padding:8px;border-bottom:1px solid var(--border-subtle)}
.cg-filters>.gc-filterbar-wrap{flex:1 1 480px;min-width:0}
.cg-filters .gc-filterbar__search{max-width:300px}
.cg-seg{display:inline-flex;padding:2px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.cg-seg button{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.cg-seg button[aria-pressed=true]{background:var(--surface-card);box-shadow:var(--shadow-xs);color:var(--text-heading)}
.cg-seg button:focus-visible{outline:2px solid var(--primary);outline-offset:1px}
.cg-cal{padding:var(--space-3) var(--space-4) var(--space-4)}
.cg-cal__nav{display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3)}
.cg-cal__nav h3{flex:1;margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cg-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));border-top:1px solid var(--border-subtle);border-left:1px solid var(--border-subtle)}
.cg-wd{padding:6px 8px;border-right:1px solid var(--border-subtle);border-bottom:1px solid var(--border-subtle);background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.cg-day{display:flex;flex-direction:column;gap:3px;min-height:108px;padding:6px;border-right:1px solid var(--border-subtle);border-bottom:1px solid var(--border-subtle);min-width:0}
.cg-day.is-out{background:var(--surface-page)}
.cg-day.is-out .cg-day__n{opacity:.45}
.cg-day__n{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.cg-day.is-today .cg-day__n{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:var(--radius-full);background:var(--primary);color:var(--surface-card);font-weight:var(--weight-semibold)}
.cg-chip{display:block;overflow:hidden;height:20px;padding:0 6px;border-left:3px solid var(--c);border-radius:var(--radius-sm);background:color-mix(in srgb,var(--c) 18%,var(--surface-card));font-size:var(--text-2xs);line-height:20px;color:var(--text-heading);text-decoration:none;text-overflow:ellipsis;white-space:nowrap}
.cg-chip:hover{background:color-mix(in srgb,var(--c) 30%,var(--surface-card))}
.cg-chip.is-Draft{border-left-style:dashed;background:var(--surface-subtle);color:var(--text-muted)}
.cg-chip.is-Paused,.cg-chip.is-Ended{opacity:.6}
.cg-more{font-size:var(--text-2xs);color:var(--text-muted)}
.cg-agenda{display:none;margin:var(--space-3) 0 0;padding:0;list-style:none}
.cg-agenda li{border-top:1px solid var(--border-subtle)}
.cg-agenda a{display:flex;align-items:center;gap:var(--space-2);min-height:44px;color:inherit;text-decoration:none;font-size:var(--text-sm)}
.cg-agenda i{flex:none;width:8px;height:8px;border-radius:var(--radius-full)}
.cg-agenda b{flex:1;min-width:0;overflow:hidden;font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.cg-agenda small{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
@media (max-width:640px){
  .cg-filters{padding:6px}
  .cg-cal{padding:var(--space-2)}
  .cg-wd{padding:4px 2px;text-align:center}
  .cg-day{min-height:52px;padding:3px}
  .cg-chip{height:5px;padding:0;border-left-width:0;background:var(--c);font-size:0}
  .cg-chip.is-Draft{background:var(--border-strong)}
  .cg-more{font-size:var(--text-2xs);line-height:1}
  .cg-agenda{display:block}
}
`;

function fromUrl() {
  const p = new URLSearchParams(window.location.search);
  const tab = TABS.some(([k]) => k === p.get('tab')) ? p.get('tab') : 'all';
  const f = {};
  for (const k of FILTER_KEYS) f[k] = p.get(k) || '';
  return { tab, q: p.get('q') || '', f, view: p.get('view') === 'calendar' ? 'calendar' : 'list' };
}
function toUrl({ tab, q, f, view }) {
  const p = new URLSearchParams();
  if (view !== 'list') p.set('view', view);
  if (tab !== 'all') p.set('tab', tab);
  if (q.trim()) p.set('q', q.trim());
  for (const k of FILTER_KEYS) if (f[k]) p.set(k, f[k]);
  const s = p.toString();
  window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
}

const csv = (rows) => [
  ['Campaign ID', 'Name', 'Goal', 'Channels', 'Status', 'Starts', 'Ends', 'Business type', 'District', 'Size', 'Owner', 'Budget (BDT)', 'Spent (BDT)', 'Impressions', 'Clicks', 'Leads', 'Qualified leads', 'Trials', 'Paid', 'Cost per lead', 'CAC', 'First-year revenue'],
  ...rows.map((r) => [r.id, r.name, goalLabel(r.c.goal), r.c.channels.join('; '), r.status, dmy(r.c.start), dmy(r.c.end), r.c.audience.type, r.c.audience.district, r.c.audience.size, r.c.owner, r.budget, Math.round(r.spent),
    Math.round(r.m.impressions), Math.round(r.m.clicks), Math.round(r.m.leads), Math.round(r.m.qualified), Math.round(r.m.trials), Math.round(r.m.paid), r.m.cpl ? Math.round(r.m.cpl) : '', r.m.cac ? Math.round(r.m.cac) : '', Math.round(r.m.revenue)]),
];

/** The month grid: weeks Saturday to Friday, a chip per campaign on each day it runs. */
function Calendar({ rows: all, t, month, setMonth }) {
  const rows = [...all].sort((a, b) => (a.c.end - a.c.start) - (b.c.end - b.c.start)); // short campaigns first, so they get the visible slots
  const next = addMonths(month, 1, 1);
  const lead = (new Date(month + 6 * 3600e3).getUTCDay() + 1) % 7;   // days before the 1st (Saturday first)
  const days = Math.round((next - month) / DAY);
  const cells = Math.ceil((lead + days) / 7) * 7;
  const today = startOfDay(t);
  const runsOn = (r, d) => { const end = Math.min(r.c.end, r.c.endedAt || Infinity); return r.c.start < d + DAY && end >= d; };
  const inMonth = rows.filter((r) => r.c.start < next && Math.min(r.c.end, r.c.endedAt || Infinity) >= month);
  return (
    <div className="cg-cal">
      <div className="cg-cal__nav">
        <h3>{monthLong(month)} {yearOf(month)}</h3>
        <button type="button" className="ix-btn ix-btn--sm" onClick={() => setMonth(startOfMonth(t))}>Today</button>
        <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Previous month" onClick={() => setMonth(addMonths(month, -1, 1))}><Icon name="chevron-left" width="16" height="16" aria-hidden="true" /></button>
        <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Next month" onClick={() => setMonth(next)}><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button>
      </div>
      <div className="cg-grid" role="grid" aria-label={`Campaigns in ${monthLong(month)} ${yearOf(month)}`}>
        {WEEK.map((w) => <div key={w} className="cg-wd" role="columnheader">{w}</div>)}
        {Array.from({ length: cells }, (_, i) => {
          const d = month + (i - lead) * DAY;
          const out = i < lead || i >= lead + days;
          const on = rows.filter((r) => runsOn(r, d));
          const shown = on.slice(0, 3);
          return (
            <div key={i} role="gridcell" className={'cg-day' + (out ? ' is-out' : '') + (d === today ? ' is-today' : '')} aria-label={`${dm(d)}: ${on.length ? on.map((r) => r.name).join(', ') : 'no campaigns'}`}>
              <span className="cg-day__n">{new Date(d + 6 * 3600e3).getUTCDate()}</span>
              {shown.map((r) => (
                <Link key={r.id} href={'/admin/campaigns/view?id=' + r.id} className={'cg-chip is-' + r.status} style={{ '--c': CH_COLOR[r.c.channels[0]] }} title={`${r.name} · ${r.status}`}>{r.name}</Link>
              ))}
              {on.length > 3 ? <span className="cg-more">+{on.length - 3} more</span> : null}
            </div>
          );
        })}
      </div>
      <ul className="cg-agenda" aria-label={`Campaigns in ${monthLong(month)}`}>
        {inMonth.map((r) => (
          <li key={r.id}><Link href={'/admin/campaigns/view?id=' + r.id}><i style={{ background: CH_COLOR[r.c.channels[0]] }} aria-hidden="true" /><b>{r.name}</b><small>{dm(r.c.start)}–{dm(Math.min(r.c.end, r.c.endedAt || Infinity))} · {r.status}</small></Link></li>
        ))}
      </ul>
      {!inMonth.length ? <p className="mk-empty" style={{ marginTop: 'var(--space-3)' }}>No campaign runs in {monthLong(month)}.</p> : null}
    </div>
  );
}

export default function Campaigns() {
  const router = useRouter();
  const { data, t, live } = useMarketing();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('all');
  const [view, setView] = useState('list');
  const [q, setQ] = useState('');
  const [f, setF] = useState({ ch: '', goal: '', owner: '' });
  const [page, setPage] = useState(0);
  const [month, setMonth] = useState(null);
  const [sheet, setSheet] = useState(null);
  const first = useRef(true);

  useEffect(() => { const s = fromUrl(); setTab(s.tab); setQ(s.q); setF(s.f); setView(s.view); setReady(true); }, []);
  useEffect(() => {
    if (!ready) return;
    toUrl({ tab, q, f, view });
    if (first.current) { first.current = false; return; }
    setPage(0);
  }, [ready, tab, q, f, view]);

  const all = live ? campaignRows(data, t) : [];
  const s = q.trim().toLowerCase();
  const base = all.filter((r) => {
    if (f.ch && !r.c.channels.includes(f.ch)) return false;
    if (f.goal && r.c.goal !== f.goal) return false;
    if (f.owner && r.c.owner !== f.owner) return false;
    if (s && ![r.name, r.id, r.c.slug, r.c.audience.district, r.c.audience.type].join(' ').toLowerCase().includes(s)) return false;
    return true;
  });
  const counts = {};
  for (const [k, l] of TABS) counts[k] = live ? base.filter((r) => k === 'all' || r.status === l).length : null;
  const tabLabel = (TABS.find(([k]) => k === tab) || [])[1] || 'All';
  const filtered = base.filter((r) => tab === 'all' || r.status === tabLabel);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const rows = filtered.slice(pg * PAGE, pg * PAGE + PAGE);
  const filtersOn = !!s || FILTER_KEYS.some((k) => f[k]);
  const clear = () => { setQ(''); setF({ ch: '', goal: '', owner: '' }); };
  const setFilter = (k) => (v) => setF((o) => ({ ...o, [k]: v }));
  const open = (id) => router.push('/admin/campaigns/view?id=' + id);
  const spent = filtered.reduce((a, r) => a + r.spent, 0);
  const leads = filtered.reduce((a, r) => a + r.m.leads, 0);

  const exportCsv = () => {
    if (!filtered.length) { toast('Nothing to export'); return; }
    downloadCsv(`gridcommerce-marketing-campaigns-${tab}.csv`, csv(filtered));
    toast(plural(filtered.length, 'campaign') + ' exported');
  };

  const filters = [
    { key: 'ch', label: 'Channel', all: 'All channels', value: f.ch, options: CHANNELS.map((x) => [x, x]), onChange: setFilter('ch') },
    { key: 'goal', label: 'Goal', all: 'All goals', value: f.goal, options: GOALS, onChange: setFilter('goal') },
    { key: 'owner', label: 'Owner', all: 'All owners', value: f.owner, options: TEAM_NAMES.map((x) => [x, x]), onChange: setFilter('owner') },
  ];
  const seg = (
    <span className="cg-seg" role="group" aria-label="View">
      <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}><Icon name="list" width="16" height="16" aria-hidden="true" />List</button>
      <button type="button" aria-pressed={view === 'calendar'} onClick={() => setView('calendar')}><Icon name="calendar-days" width="16" height="16" aria-hidden="true" />Calendar</button>
    </span>
  );

  let body;
  if (!live) body = <Skel label="Loading campaigns" strip={false} />;
  else {
    body = (
      <section className="ix-card" aria-label={tabLabel + ' campaigns'}>
        <div className="ix-bar"><IndexTabs label="Campaign statuses" tabs={TABS.map(([k, l]) => ({ key: k, id: 'cg-tab-' + k, label: l, count: counts[k], on: tab === k, onClick: () => setTab(k) }))} /></div>
        <div className="cg-filters">
          <FilterBar label="Filter campaigns" filters={filters} onClear={() => setQ('')} search={{ value: q, onChange: setQ, placeholder: 'Search name, ID or district' }} />
          {seg}
        </div>
        {view === 'calendar' ? (
          <Calendar rows={filtered} t={t} month={month ?? startOfMonth(t)} setMonth={setMonth} />
        ) : !filtered.length ? (
          <div className="ix-empty">
            {filtersOn ? <EmptyState title="No campaigns match these filters." actionLabel="Clear filters" onAction={clear} />
              : <EmptyState icon="megaphone" title={tab === 'all' ? 'No campaigns yet.' : `No ${tabLabel.toLowerCase()} campaigns.`} actionLabel="New campaign" onAction={() => setSheet('new')} />}
          </div>
        ) : (
          <>
            <ul className="ix-plist" aria-label={tabLabel + ' campaigns'}>
              {rows.map((r) => (
                <li key={r.id}><Link href={'/admin/campaigns/view?id=' + r.id} className="ix-pitem">
                  <span className="ix-pitem__top"><b>{r.name}</b><span className="mk-fig">{money(r.spent)}</span></span>
                  <span className="ix-pitem__mid">{goalLabel(r.c.goal)} · {r.c.channels.join(', ')} · {dm(r.c.start)}–{dm(r.c.end)}</span>
                  <span className="ix-pitem__tags"><Status s={r.status} /><span className="ix-pitem__mid">{num(r.m.leads)} leads · {num(r.m.paid)} paid</span></span>
                </Link></li>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">{tabLabel} campaigns</caption>
                <thead><tr>
                  <th scope="col">Campaign</th><th scope="col">Status</th><th scope="col">Channels</th><th scope="col">Dates</th><th scope="col">Budget</th>
                  <th scope="col" className="ix-num">Leads</th><th scope="col" className="ix-num">Cost per lead</th><th scope="col" className="ix-num">Trials</th><th scope="col" className="ix-num">Paid</th><th scope="col" className="ix-num">CAC</th><th scope="col">Owner</th>
                </tr></thead>
                <tbody>
                  {rows.map((r) => {
                    const mark = r.status === 'Running' || r.status === 'Paused' ? Math.min(1, (t - r.c.start) / Math.max(DAY, r.c.end - r.c.start)) : undefined;
                    return (
                      <tr key={r.id} tabIndex={0} onClick={() => open(r.id)} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) open(r.id); }}>
                        <td><span className="mk-name"><Link href={'/admin/campaigns/view?id=' + r.id} onClick={(e) => e.stopPropagation()}>{r.name}</Link><small className="mk-sub">{goalLabel(r.c.goal)} · {r.c.audience.type} · {r.c.audience.district}</small></span></td>
                        <td><Status s={r.status} /></td>
                        <td><Channels list={r.c.channels} /></td>
                        <td className="ix-muted">{dm(r.c.start)} – {dm(Math.min(r.c.end, r.c.endedAt || Infinity))}</td>
                        <td><BudgetCell spent={r.spent} budget={r.budget} mark={mark} /></td>
                        <td className="ix-num mk-fig">{num(r.m.leads)}</td>
                        <td className="ix-num mk-fig">{orDash(r.m.cpl)}</td>
                        <td className="ix-num mk-fig">{num(r.m.trials)}</td>
                        <td className="ix-num mk-fig">{num(r.m.paid)}</td>
                        <td className="ix-num mk-fig">{orDash(r.m.cac)}</td>
                        <td className="ix-muted">{r.c.owner}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        {view === 'list' ? (
          <Pager label={<span className="mk-foot"><span>{filtered.length ? `${pg * PAGE + 1}–${pg * PAGE + rows.length} of ${filtered.length}` : '0 campaigns'}</span><span>Spent<b>{money(spent)}</b></span><span>Leads<b>{num(leads)}</b></span></span>}
            atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
        ) : <div className="ix-foot"><span className="mk-foot"><span>{plural(filtered.length, 'campaign')}</span><span>Colour = first channel</span></span></div>}
      </section>
    );
  }

  return (
    <AdminShell active="campaigns" title="Campaigns">
      <style dangerouslySetInnerHTML={{ __html: MK_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="megaphone" title="Campaigns"
          about="GridCommerce’s own marketing campaigns to win merchants: goal, channels, budget, dates, audience and owner, with spend and results (leads, trials, paid stores) from every channel. Meta, Google and YouTube results come from the linked ads; a new campaign makes a UTM link for each channel."
          secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv }]}
          more={[{ label: 'Marketing overview', href: '/admin/marketing' }, { label: 'Ads', href: '/admin/ads' }, { label: 'UTM links', href: '/admin/utm' }]}
          primary={{ label: 'New campaign', icon: 'plus', onClick: () => setSheet('new') }} />
        {body}
      </div>
      <CampaignSheet id={sheet} data={data} t={t} onClose={() => setSheet(null)} onSaved={(id) => router.push('/admin/campaigns/view?id=' + id)} />
    </AdminShell>
  );
}
