'use client';
// Marketing › Ads (/admin/ads?tab=) — GridCommerce's own paid ads on Meta, Google (search and YouTube) and TikTok, reusing
// the merchant panel's Ad accounts and Campaigns & creatives screens and the Pixels / Attribution look:
//   Overview          five figures (spend, leads, cost per lead, paid stores, ROAS), every figure per channel in a
//                     table, spend and leads over time, cost per result, campaign comparison
//   Ad accounts       connected accounts per platform: Connect / Reconnect / Disconnect (UI only, toasts)
//   Campaigns         ad campaigns → ad sets → ads (expand a row), pause / turn on at every level (?open=AC-206)
//   Budget            monthly budget per platform against spend and the pace it is on (Edit budget)
//   Conversion tracking   Meta Pixel + Conversions API and the Google tag: events, health, Send test, Check again
//   Attribution       first touch against last touch by channel, and the link to Analytics › Attribution
// Data: lib/admin/marketing.js (records, adRows, accountRows, budgetRows, trackingRows, attribution, setAdState,
// connectAccount, disconnectAccount, setBudget, testEvent, recheckEvent).

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge, InfoTip, EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, Menu } from '@/components/ui/IndexKit';
import { ColumnChart, Sparkline, HBars, Legend, CHART_CSS } from '@/components/charts/DashCharts';
import { DAY, ago, monthLong, startOfDay } from '@/lib/platform/util';
import {
  AD_CHANNELS, CH_COLOR, PLATFORMS, PLATFORM_KEYS, records, inRange, sum, totalsBy, series, adRows, accountRows, budgetRows, trackingRows,
  attribution, setAdState, connectAccount, disconnectAccount, setBudget, testEvent, recheckEvent, FIRST_YEAR,
} from '@/lib/admin/marketing';
import { AdminShell } from '../AdminShell';
import {
  useMarketing, useQueryState, MK_CSS, Skel, LoadError, Card, Status, Plat, Bar, Delta, money, num, pct, orDash, times, short, moneyShort,
} from './mkShared';

const TABS = [['overview', 'Overview'], ['accounts', 'Ad accounts'], ['campaigns', 'Campaigns'], ['budget', 'Budget'], ['tracking', 'Conversion tracking'], ['attribution', 'Attribution']];
const TAB_KEYS = TABS.map((x) => x[0]);
const PERIODS = [['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 90 days']];

const CSS = `
.ad-tabs{padding:0 var(--space-1)}
.ad-acc{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-4);align-items:start}
.ad-acc__head{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--border-subtle)}
.ad-acc__head img{width:20px;height:20px;object-fit:contain;flex:none}
.ad-acc__head div{flex:1;min-width:0;display:flex;flex-direction:column}
.ad-acc__head b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ad-acc__head small{font-size:var(--text-xs);color:var(--text-muted)}
.ad-acc__row{display:flex;flex-direction:column;gap:8px;padding:12px 16px;border-bottom:1px solid var(--border-subtle)}
.ad-acc__row:last-child{border-bottom:0}
.ad-acc__top{display:flex;align-items:center;gap:10px}
.ad-dot{flex:none;width:9px;height:9px;border-radius:var(--radius-full);background:var(--success);box-shadow:0 0 0 4px var(--fill-success-soft)}
.ad-dot.is-warn{background:var(--warning);box-shadow:0 0 0 4px var(--fill-warning-soft)}
.ad-dot.is-err{background:var(--error);box-shadow:0 0 0 4px var(--fill-error-soft)}
.ad-dot.is-off{background:var(--border-strong);box-shadow:0 0 0 4px var(--surface-subtle)}
.ad-acc__name{flex:1;min-width:0;display:flex;flex-direction:column}
.ad-acc__name b{overflow:hidden;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.ad-acc__name small{overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.ad-acc__meta{display:flex;flex-wrap:wrap;gap:4px var(--space-4);padding-left:19px;font-size:var(--text-xs);color:var(--text-muted)}
.ad-acc__meta b{font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--text-heading)}
.ad-acc__tok{display:flex;align-items:center;gap:8px;padding-left:19px;font-size:var(--text-xs);color:var(--text-muted)}
.ad-acc__tok .mk-bar{flex:1;height:4px}
.ad-acc__tok.is-warn{color:var(--text-warning)}
.ad-tree td:first-child{max-width:340px}
.ad-tog{display:inline-flex;align-items:center;gap:6px;max-width:100%;padding:0;border:0;background:none;font:inherit;text-align:left;color:inherit;cursor:pointer}
.ad-tog svg{flex:none;color:var(--text-muted);transition:transform .15s}
.ad-tog[aria-expanded=true] svg{transform:rotate(90deg)}
.ad-tog:focus-visible{outline:2px solid var(--primary);outline-offset:2px;border-radius:var(--radius-sm)}
.ad-l1 .mk-name{padding-left:22px}
.ad-l2 .mk-name{padding-left:44px}
.ad-l1 td{background:var(--surface-page)}
.ad-l2 td{background:var(--surface-page)}
.ad-l1 .mk-name b,.ad-l2 .mk-name b{font-weight:var(--weight-regular)}
.ad-chips{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:8px;border-bottom:1px solid var(--border-subtle)}
.ad-chips .ix-pick{margin-left:auto}
.ad-pace{display:flex;flex-direction:column;gap:6px;min-width:180px}
.ad-pace small{font-size:var(--text-xs);color:var(--text-muted)}
.ad-ev td{vertical-align:top;padding-top:10px;padding-bottom:10px}
.ad-ev__issue{display:block;max-width:420px;margin-top:4px;font-size:var(--text-xs);color:var(--text-muted);white-space:normal}
.ad-px{display:flex;align-items:center;gap:10px}
.ad-px img{width:20px;height:20px;object-fit:contain}
.ad-px div{display:flex;flex-direction:column;min-width:0}
.ad-px b{font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ad-px small{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.ad-spk{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-4)}
.ad-spk>div{display:flex;flex-direction:column;gap:4px}
.ad-spk span{font-size:var(--text-xs);color:var(--text-muted)}
.ad-spk b{font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ad-total th,.ad-total td{font-weight:var(--weight-semibold)}
.ad-link{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);font-size:var(--text-sm);color:var(--text-body)}
.ad-link>span{flex:1;min-width:220px}
@media (max-width:1100px){.ad-acc{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.ad-spk{grid-template-columns:minmax(0,1fr)}.ad-chips{padding:6px}.ad-chips .ix-pick{margin-left:0}}
`;

const periodLabel = (p) => (PERIODS.find((x) => x[0] === p) || PERIODS[1])[1];
function rangeOf(p, t) {
  const n = Number(p) || 30;
  const to = startOfDay(t) + DAY;
  return { from: to - n * DAY, to, prevFrom: to - 2 * n * DAY, prevTo: to - n * DAY, n };
}
const runIt = (r, ok) => { if (r.ok) toast(ok); else toast(r.error, { tone: 'error' }); };

// ---- Overview ------------------------------------------------------------------------------------------------------------
function Overview({ data, t, period, lead }) {
  const recs = records(data, t).filter((r) => r.ac);
  const r = rangeOf(period, t);
  const cur = inRange(recs, r.from, r.to);
  const prev = inRange(recs, r.prevFrom, r.prevTo);
  const a = sum(cur), b = sum(prev);
  const byCh = totalsBy(cur, 'channel');
  const days = series(cur, r.from, r.to);
  const perCh = AD_CHANNELS.map((ch) => series(cur.filter((x) => x.channel === ch), r.from, r.to));
  const weekly = r.n > 31;
  const bucket = (arr, f) => {
    if (!weekly) return arr.map((d, i) => ({ label: d.label, title: d.title, i }));
    const out = [];
    for (let i = 0; i < arr.length; i += 7) out.push({ label: arr[i].label, title: 'Week of ' + arr[i].title, i, n: Math.min(7, arr.length - i) });
    return out;
  };
  const cols = bucket(days);
  const val = (arr, c, k) => (weekly ? arr.slice(c.i, c.i + c.n).reduce((x, d) => x + d[k], 0) : arr[c.i][k]);
  const spendData = cols.map((c) => ({ label: c.label, title: c.title, values: perCh.map((s) => val(s, c, 'spend')) }));
  const leadData = cols.map((c) => ({ label: c.label, title: c.title, values: perCh.map((s) => val(s, c, 'leads')) }));
  // cost per lead and CAC by week
  const wk = [];
  for (let i = 0; i < days.length; i += 7) {
    const s = days.slice(i, i + 7);
    const sp = s.reduce((x, d) => x + d.spend, 0), ld = s.reduce((x, d) => x + d.leads, 0), pd = s.reduce((x, d) => x + d.paid, 0);
    wk.push({ label: 'Week of ' + s[0].title, cpl: ld ? sp / ld : 0, cac: pd ? sp / pd : 0 });
  }
  const camps = adRows(data, t, null, r.from, r.to).filter((x) => x.m.spend > 0).sort((x, y) => y.m.leads - x.m.leads).slice(0, 8);
  const SER = AD_CHANNELS.map((ch) => ({ name: ch, color: CH_COLOR[ch] }));
  const tableRows = [...AD_CHANNELS.map((ch) => ({ key: ch, label: ch, m: byCh[ch] })).filter((x) => x.m), { key: 'all', label: 'All ads', m: a, total: true }];

  return (
    <>
      <MetricStrip lead={lead} label={'Ad figures, ' + periodLabel(period).toLowerCase()} items={[
        { label: 'Ad spend', value: money(a.spend), sub: <Delta now={a.spend} prev={b.spend} lowerIsBetter />, icon: 'wallet' },
        { label: 'Leads', value: num(a.leads), sub: <Delta now={a.leads} prev={b.leads} />, icon: 'users' },
        { label: 'Cost per lead', value: orDash(a.cpl), sub: <Delta now={a.cpl || 0} prev={b.cpl || 0} lowerIsBetter />, icon: 'target' },
        { label: 'Paid stores', value: num(a.paid), sub: <Delta now={a.paid} prev={b.paid} />, icon: 'store' },
        { label: 'ROAS', value: times(a.roas), sub: <Delta now={a.roas || 0} prev={b.roas || 0} />, icon: 'trending-up' },
      ]} />
      <Card title="Every figure by channel" flush action={<InfoTip text={`Reach counts people once a day per ad. CAC = spend ÷ stores that started paying. ROAS = first-year value of those stores (about ${money(FIRST_YEAR)} each) ÷ spend.`} />}>
        <div className="ix-table-wrap ix-table-wrap--show">
          <table className="ix-table ix-table--static gc-table--keep gc-table--scroll">
            <caption className="sr-only">Ad figures by channel, {periodLabel(period).toLowerCase()}</caption>
            <thead><tr><th scope="col">Channel</th>{['Spend', 'Impressions', 'Reach', 'Clicks', 'CTR', 'Leads', 'Cost per lead', 'Trials', 'Paid', 'CAC', 'ROAS'].map((h) => <th key={h} scope="col" className="ix-num">{h}</th>)}</tr></thead>
            <tbody>
              {tableRows.map(({ key, label, m, total }) => (
                <tr key={key} className={total ? 'ad-total' : ''}>
                  <th scope="row">{total ? label : <span className="mk-ch"><i style={{ background: CH_COLOR[label] }} aria-hidden="true" />{label}</span>}</th>
                  <td className="ix-num mk-fig">{money(m.spend)}</td>
                  <td className="ix-num mk-fig">{num(m.impressions)}</td>
                  <td className="ix-num mk-fig">{num(m.reach)}</td>
                  <td className="ix-num mk-fig">{num(m.clicks)}</td>
                  <td className="ix-num mk-fig">{pct(m.ctr, 2)}</td>
                  <td className="ix-num mk-fig">{num(m.leads)}</td>
                  <td className="ix-num mk-fig">{orDash(m.cpl)}</td>
                  <td className="ix-num mk-fig">{num(m.trials)}</td>
                  <td className="ix-num mk-fig">{num(m.paid)}</td>
                  <td className="ix-num mk-fig">{orDash(m.cac)}</td>
                  <td className="ix-num mk-fig">{times(m.roas)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="mk-grid mk-grid--even">
        <Card title="Spend over time">
          <ColumnChart key={'s' + period} label={'Ad spend by channel, ' + periodLabel(period).toLowerCase()} data={spendData} series={SER} fmt={money} tickFmt={(v) => '৳' + short(v)} height={200} now={spendData.length - 1} />
          <div style={{ marginTop: 'var(--space-3)' }}><Legend items={SER.map((s) => ({ ...s, value: moneyShort(byCh[s.name] ? byCh[s.name].spend : 0) }))} /></div>
        </Card>
        <Card title="Leads over time">
          <ColumnChart key={'l' + period} label={'Leads from ads by channel, ' + periodLabel(period).toLowerCase()} data={leadData} series={SER} fmt={(v) => num(v)} height={200} now={leadData.length - 1} />
          <div style={{ marginTop: 'var(--space-3)' }}><Legend items={SER.map((s) => ({ ...s, value: num(byCh[s.name] ? byCh[s.name].leads : 0) }))} /></div>
        </Card>
      </div>
      <div className="mk-grid mk-grid--even">
        <Card title="Cost per result" action={<InfoTip text="Week by week: what one lead and one paying store cost across every ad." />}>
          <div className="ad-spk">
            <div><span>Cost per lead</span><b>{orDash(a.cpl)}</b><Sparkline values={wk.map((w) => w.cpl)} labels={wk.map((w) => w.label)} color="var(--viz-1)" fmt={money} label="Cost per lead by week" /></div>
            <div><span>CAC (cost per paid store)</span><b>{orDash(a.cac)}</b><Sparkline values={wk.map((w) => w.cac)} labels={wk.map((w) => w.label)} color="var(--viz-5)" fmt={money} label="CAC by week" /></div>
          </div>
        </Card>
        <Card title="Campaign comparison" link={{ href: '/admin/ads?tab=campaigns', label: 'All ad campaigns' }}>
          {camps.length ? <HBars Link={Link} rows={camps.map((x) => ({ key: x.id, label: x.name, sub: `${x.channel} · ${orDash(x.m.cpl)} a lead · ${num(x.m.paid)} paid`, value: x.m.leads, text: num(x.m.leads) + ' leads', color: CH_COLOR[x.channel], href: '/admin/ads?tab=campaigns&open=' + x.id }))} />
            : <p className="mk-empty">No ads ran in this period.</p>}
        </Card>
      </div>
    </>
  );
}

// ---- Ad accounts ---------------------------------------------------------------------------------------------------------
function Accounts({ data, t }) {
  const rows = accountRows(data, t);
  const connect = (a) => { const r = connectAccount(a.id); runIt(r, r.reconnected ? `${a.a.name} reconnected · sign-in good for 60 days` : `${PLATFORMS[a.platform].long} connected · first sync running`); };
  const disconnect = async (a) => {
    const yes = await confirmDialog({ title: `Disconnect ${a.a.name}?`, body: 'Spend and results stop coming in from this account. Its ads keep running on the platform; past results stay here.', confirmLabel: 'Disconnect', tone: 'danger' });
    if (yes) runIt(disconnectAccount(a.id), 'Disconnected');
  };
  return (
    <>
      <MetricStrip label="Ad accounts" items={[
        { label: 'Connected', value: String(rows.filter((r) => r.state !== 'off').length), sub: `of ${rows.length} accounts`, icon: 'plug' },
        { label: 'Need you', value: String(rows.filter((r) => r.state === 'expiring' || r.state === 'expired').length), sub: 'sign-in ending', icon: 'triangle-alert' },
        { label: 'Spend this month', value: money(rows.reduce((x, r) => x + r.spend, 0)), sub: monthLong(t), icon: 'wallet' },
        { label: 'Active ad campaigns', value: String(rows.reduce((x, r) => x + r.campaigns, 0)), icon: 'megaphone' },
      ]} />
      <div className="ad-acc">
        {PLATFORM_KEYS.map((p) => {
          const list = rows.filter((r) => r.platform === p);
          const P = PLATFORMS[p];
          return (
            <section key={p} className="ix-card" aria-label={P.long} style={{ overflow: 'hidden' }}>
              <div className="ad-acc__head">
                <img src={P.logo} alt="" width="20" height="20" />
                <div><b>{P.long}</b><small>{list.filter((r) => r.state !== 'off').length ? `${list.filter((r) => r.state !== 'off').length} connected · ${list[0].a.business}` : 'Not connected'}</small></div>
                {list.some((r) => r.state !== 'off') ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => toast(`Sign in to another ${P.long} account on ${P.name}’s page; it is added next to these.`)}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add</button> : null}
              </div>
              {list.map((r) => {
                const dot = r.state === 'ok' ? '' : r.state === 'off' ? ' is-off' : r.state === 'expired' ? ' is-err' : ' is-warn';
                return (
                  <div key={r.id} className="ad-acc__row">
                    <div className="ad-acc__top">
                      <span className={'ad-dot' + dot} aria-hidden="true" />
                      <span className="ad-acc__name"><b>{r.a.name}</b><small>{r.state === 'off' ? 'Spend, results and audiences' : <span className="mk-id">{r.a.ref}</span>}</small></span>
                      {r.state === 'off' ? <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => connect(r)}>Connect</button>
                        : r.state === 'ok' ? <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={[{ label: 'Reconnect', onClick: () => connect(r) }, { label: 'Disconnect', tone: 'danger', onClick: () => disconnect(r) }]} />
                          : <><button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => connect(r)}>Reconnect</button><Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={[{ label: 'Disconnect', tone: 'danger', onClick: () => disconnect(r) }]} /></>}
                    </div>
                    {r.state !== 'off' ? (
                      <>
                        <div className="ad-acc__meta"><span>This month <b>{money(r.spend)}</b></span><span>Active campaigns <b>{r.campaigns}</b></span><span>BDT</span><span>Synced {ago(r.sync, t)}</span></div>
                        <div className={'ad-acc__tok' + (r.state === 'ok' ? '' : ' is-warn')}><Bar value={Math.min(1, (r.left || 0) / 60)} label={r.label} /><span>{r.state === 'ok' ? `Sign-in good for ${r.left} days` : r.label}</span></div>
                      </>
                    ) : <div className="ad-acc__meta"><span>{p === 'tiktok' ? 'Connect to run and measure TikTok ads for GridCommerce.' : 'Connect to read this account’s spend and results.'}</span></div>}
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </>
  );
}

// ---- Campaigns (ad campaigns → ad sets → ads) ----------------------------------------------------------------------------
function AdCampaigns({ data, t, period, lead }) {
  const [plat, setPlat] = useState('');
  const [st, setSt] = useState('');
  const [open, setOpen] = useState(() => new Set());
  const r = rangeOf(period, t);
  const scrolled = useRef(false);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('open');
    if (!id) return;
    setOpen((o) => new Set([...o, id]));
    if (!scrolled.current) { scrolled.current = true; setTimeout(() => { const el = document.getElementById('ad-' + id); if (el) { el.scrollIntoView({ block: 'center' }); el.focus(); } }, 60); }
  }, []);
  const all = adRows(data, t, null, r.from, r.to);
  const rows = all.filter((x) => (!plat || x.channel === plat) && (!st || x.status === st));
  const toggle = (id) => setOpen((o) => { const n = new Set(o); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const act = (level, x) => {
    const on = x.status === 'Paused';
    runIt(setAdState(level, x.id, on), `${on ? 'Turned on' : 'Paused'}: ${x.name}`);
  };
  const canAct = (x) => x.status === 'Active' || x.status === 'Paused';
  const cells = (m) => (
    <>
      <td className="ix-num mk-fig">{money(m.spend)}</td>
      <td className="ix-num mk-fig">{num(m.impressions)}</td>
      <td className="ix-num mk-fig">{num(m.clicks)}</td>
      <td className="ix-num mk-fig">{pct(m.ctr, 2)}</td>
      <td className="ix-num mk-fig">{num(m.leads)}</td>
      <td className="ix-num mk-fig">{orDash(m.cpl)}</td>
      <td className="ix-num mk-fig">{num(m.paid)}</td>
      <td className="ix-num mk-fig">{orDash(m.cac)}</td>
      <td className="ix-num mk-fig">{times(m.roas)}</td>
    </>
  );
  const actCell = (level, x) => <td className="mk-acts">{canAct(x) ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => act(level, x)}>{x.status === 'Paused' ? 'Turn on' : 'Pause'}</button> : null}</td>;
  return (
    <section className="ix-card" aria-label="Ad campaigns">
      <div className="ad-chips">
        <div className="ix-chips" role="group" aria-label="Channel">
          {[['', 'All'], ...AD_CHANNELS.map((c) => [c, c])].map(([k, l]) => <button key={l} type="button" className="ix-chip" aria-pressed={plat === k} onClick={() => setPlat(k)}>{l}</button>)}
        </div>
        <select className="ix-pick" aria-label="Status" value={st} onChange={(e) => setSt(e.target.value)}>
          <option value="">Any status</option>{['Active', 'Paused', 'Scheduled', 'Ended', 'Draft'].map((s) => <option key={s}>{s}</option>)}
        </select>
        {lead}
      </div>
      {!rows.length ? (
        <div className="ix-empty"><EmptyState title="No ad campaigns match." actionLabel="Show all" onAction={() => { setPlat(''); setSt(''); }} /></div>
      ) : (
        <div className="ix-table-wrap ix-table-wrap--show">
          <table className="ix-table ix-table--static gc-table--keep gc-table--scroll ad-tree">
            <caption className="sr-only">Ad campaigns, ad sets and ads, {periodLabel(period).toLowerCase()}</caption>
            <thead><tr>
              <th scope="col">Campaign · ad set · ad</th><th scope="col">Status</th><th scope="col" className="ix-num">Budget a day</th>
              {['Spend', 'Impressions', 'Clicks', 'CTR', 'Leads', 'Cost per lead', 'Paid', 'CAC', 'ROAS'].map((h) => <th key={h} scope="col" className="ix-num">{h}</th>)}<th scope="col"><span className="sr-only">Actions</span></th>
            </tr></thead>
            <tbody>
              {rows.map((c) => {
                const isOpen = open.has(c.id);
                return (
                  <React.Fragment key={c.id}>
                    <tr id={'ad-' + c.id} tabIndex={-1}>
                      <td>
                        <button type="button" className="ad-tog" aria-expanded={isOpen} onClick={() => toggle(c.id)}>
                          <Icon name="chevron-right" width="16" height="16" aria-hidden="true" />
                          <span className="mk-name"><b>{c.name}</b><small className="mk-sub"><Plat p={c.platform} label={`${c.channel} · ${c.ac.objective} · ${c.account ? c.account.name : ''}`} /></small></span>
                        </button>
                      </td>
                      <td><Status s={c.status} /></td>
                      <td className="ix-num mk-fig">{money(c.budgetDay)}</td>
                      {cells(c.m)}
                      {actCell('campaign', c)}
                    </tr>
                    {isOpen ? c.sets.map((s) => (
                      <React.Fragment key={s.id}>
                        <tr className="ad-l1">
                          <td><span className="mk-name"><b>{s.name}</b><small className="mk-sub">Ad set · {s.audience}</small></span></td>
                          <td><Status s={c.status === 'Active' ? s.status : c.status} /></td>
                          <td className="ix-num mk-fig">{money(s.budgetDay)}</td>
                          {cells(s.m)}
                          {c.status === 'Active' || c.status === 'Paused' ? actCell('set', s) : <td />}
                        </tr>
                        {s.ads.map((ad) => (
                          <tr key={ad.id} className="ad-l2">
                            <td><span className="mk-name"><b>{ad.name}</b><small className="mk-sub">Ad · {ad.creative}</small></span></td>
                            <td><Status s={c.status === 'Active' && s.status === 'Active' ? ad.status : c.status !== 'Active' ? c.status : s.status} /></td>
                            <td className="ix-num ix-muted">—</td>
                            {cells(ad.m)}
                            {c.status === 'Active' || c.status === 'Paused' ? actCell('ad', ad) : <td />}
                          </tr>
                        ))}
                      </React.Fragment>
                    )) : null}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="ix-foot"><span className="mk-foot"><span>{rows.length} ad campaigns</span><span>Spend<b>{money(rows.reduce((x, c) => x + c.m.spend, 0))}</b></span><span>Leads<b>{num(rows.reduce((x, c) => x + c.m.leads, 0))}</b></span><span>Made in each platform’s ads manager; linked by UTM campaign name</span></span></div>
    </section>
  );
}

// ---- Budget ----------------------------------------------------------------------------------------------------------------
const PACE = { ok: ['On pace', 'success'], over: ['Over pace', 'warning'], under: ['Under pace', 'primary'], none: ['No budget', 'neutral'], off: ['Not connected', 'neutral'] };
function Budget({ data, t }) {
  const rows = budgetRows(data, t);
  const [edit, setEdit] = useState(null);   // { p, value, error }
  const save = () => {
    const r = setBudget(edit.p, String(edit.value).replace(/[^0-9.]/g, '') || 'x');
    if (!r.ok) { setEdit({ ...edit, error: r.error }); return; }
    toast(`${PLATFORMS[edit.p].long} budget saved`);
    setEdit(null);
  };
  const totB = rows.reduce((x, r) => x + r.budget, 0), totS = rows.reduce((x, r) => x + r.spent, 0), totP = rows.reduce((x, r) => x + r.projected, 0);
  return (
    <>
      <MetricStrip label={'Budget, ' + monthLong(t)} items={[
        { label: 'Monthly ad budget', value: money(totB), sub: monthLong(t), icon: 'wallet' },
        { label: 'Spent so far', value: money(totS), sub: pct(totB ? (totS / totB) * 100 : null, 0) + ' of budget' },
        { label: 'On course for', value: money(totP), sub: 'by month end, at the last 7 days’ pace', icon: 'trending-up' },
        { label: 'Month gone', value: pct((rows[0] ? rows[0].elapsed : 0) * 100, 0), icon: 'calendar' },
      ]} />
      <section className="ix-card" aria-label="Budget per platform">
        <div className="ix-card__head"><h2>Per platform</h2><InfoTip text="The line on each bar is how much of the month has gone. YouTube ads are paid from the Google Ads account." /></div>
        <div className="ix-table-wrap ix-table-wrap--show">
          <table className="ix-table ix-table--static gc-table--keep gc-table--scroll">
            <caption className="sr-only">Monthly ad budget per platform</caption>
            <thead><tr><th scope="col">Platform</th><th scope="col">Spent of budget</th><th scope="col" className="ix-num">A day, last 7 days</th><th scope="col" className="ix-num">On course for</th><th scope="col">Pace</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.p}>
                  <th scope="row"><Plat p={r.p} label={r.platform.long} /></th>
                  <td><span className="ad-pace"><Bar value={r.budget ? r.spent / r.budget : 0} mark={r.budget ? r.elapsed : undefined} label={`${money(r.spent)} of ${money(r.budget)}`} /><small><span className="mk-fig">{money(r.spent)}</span> of {r.budget ? money(r.budget) : 'no budget set'}</small></span></td>
                  <td className="ix-num mk-fig">{money(r.perDay)}</td>
                  <td className="ix-num mk-fig">{r.budget ? money(r.projected) : '—'}</td>
                  <td><StatusBadge tone={PACE[r.state][1]}>{PACE[r.state][0]}{r.pace && r.state !== 'ok' && r.state !== 'off' ? ` · ${Math.round(r.pace * 100)}%` : ''}</StatusBadge></td>
                  <td className="mk-acts"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setEdit({ p: r.p, value: String(r.budget || ''), error: null })}>Edit budget</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Sheet open={!!edit} title={edit ? `${PLATFORMS[edit.p].long} budget` : ''} onClose={() => setEdit(null)} footer={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit(null)}>Cancel</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={save}>Save</button>
      </>}>
        {edit ? (
          <div className="mk-form">
            <div className="mk-field">
              <label className="gc-label" htmlFor="ad-bud">Budget for {monthLong(t)} (৳)</label>
              <input id="ad-bud" data-autofocus inputMode="numeric" className={'gc-input' + (edit.error ? ' gc-input--error' : '')} aria-invalid={edit.error ? true : undefined} value={edit.value} onChange={(e) => setEdit({ ...edit, value: e.target.value, error: null })} />
              {edit.error ? <p className="gc-help gc-help--error" role="alert">{edit.error}</p> : <p className="gc-help">Used for pacing here. The daily budgets of the ads are set in {PLATFORMS[edit.p].name}’s ads manager.</p>}
            </div>
          </div>
        ) : null}
      </Sheet>
    </>
  );
}

// ---- Conversion tracking -----------------------------------------------------------------------------------------------
function Tracking({ data, t }) {
  const px = trackingRows(data, t);
  const test = (p, ev) => runIt(testEvent(p.id, ev.name), `Test ${ev.name} sent to the ${p.platform === 'google' ? 'Google tag' : 'Meta Pixel'}. It shows in ${p.platform === 'google' ? 'Tag Assistant' : 'Events Manager › Test events'} within a minute.`);
  const recheck = (p, ev) => { const r = recheckEvent(p.id, ev.name); if (r.ok) toast(r.fixed ? `${ev.name} is firing again` : `${ev.name} is healthy`); else toast(r.error, { tone: 'error' }); };
  const all = px.flatMap((p) => p.events);
  return (
    <>
      <MetricStrip label="Tracking health" items={[
        { label: 'Events healthy', value: `${all.filter((e) => e.tone === 'success').length} of ${all.length}`, icon: 'circle-check' },
        { label: 'Not firing', value: String(all.filter((e) => e.tone === 'error').length), icon: 'circle-alert' },
        { label: 'Leads tracked, 24 h', value: num(all.filter((e) => e.name === 'Lead').reduce((x, e) => x + e.count, 0)), sub: 'both tags', icon: 'users' },
        { label: 'Trials tracked, 24 h', value: num(all.filter((e) => e.name === 'StartTrial').reduce((x, e) => x + e.count, 0)), sub: 'both tags', icon: 'rocket' },
      ]} />
      {px.map((p) => (
        <section key={p.id} className="ix-card" aria-label={p.name}>
          <div className="ix-card__head">
            <span className="ad-px"><img src={PLATFORMS[p.platform].logo} alt="" width="20" height="20" /><span style={{ display: 'flex', flexDirection: 'column' }}><b>{p.name}</b><small>{p.ref}</small></span></span>
            <StatusBadge tone={p.server ? 'success' : 'neutral'}>{p.server ? 'Server events on' : 'Browser only'}</StatusBadge>
          </div>
          <div className="ix-table-wrap ix-table-wrap--show">
            <table className="ix-table ix-table--static gc-table--keep gc-table--scroll ad-ev">
              <caption className="sr-only">{p.name} events</caption>
              <thead><tr><th scope="col">Event</th><th scope="col">Sent from</th><th scope="col" className="ix-num">Last 24 h</th><th scope="col">Last seen</th>{p.platform === 'meta' ? <th scope="col" className="ix-num">Match quality</th> : null}<th scope="col">Health</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {p.events.map((ev) => (
                  <tr key={ev.name}>
                    <th scope="row" style={{ whiteSpace: 'normal' }}><span className="mk-fig" style={{ fontWeight: 'var(--weight-medium)' }}>{ev.name}</span>{ev.issue && ev.tone !== 'success' ? <span className="ad-ev__issue">{ev.issue}</span> : null}</th>
                    <td className="ix-muted">{ev.src}</td>
                    <td className="ix-num mk-fig">{num(ev.count)}</td>
                    <td className="ix-muted">{ago(ev.last, t)}</td>
                    {p.platform === 'meta' ? <td className="ix-num mk-fig">{ev.match != null ? ev.match.toFixed(1) + ' / 10' : '—'}</td> : null}
                    <td><StatusBadge tone={ev.tone}>{ev.label}</StatusBadge></td>
                    <td className="mk-acts">
                      <button type="button" className="ix-btn ix-btn--sm" onClick={() => test(p, ev)}>Send test</button>
                      {ev.tone !== 'success' ? <> <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => recheck(p, ev)}>Check again</button></> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}

// ---- Attribution ------------------------------------------------------------------------------------------------------------
function Attribution({ data, t, period, lead }) {
  const r = rangeOf(period, t);
  const rows = attribution(inRange(records(data, t), r.from, r.to));
  const tot = rows.reduce((x, y) => x + y.last, 0);
  return (
    <>
      <section className="ix-card" aria-label="Full attribution">
        <div className="ad-link">
          <Icon name="git-compare-arrows" width="20" height="20" aria-hidden="true" />
          <span>Every model (first touch, last touch, linear, position based), paths and time to sign-up are in Analytics › Attribution.</span>
          <Link href="/admin/analytics/attribution" className="ix-btn">Open attribution</Link>
        </div>
      </section>
      <section className="ix-card" aria-label="First touch and last touch">
        <div className="ix-card__head"><h2>First touch and last touch</h2><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>{lead}<InfoTip text="Last touch credits the channel of the visit that became a lead. First touch credits the channel that first brought the person to gridcommerce.net. Channels that start journeys (Meta, YouTube) gain under first touch." /></span></div>
        <div className="ix-table-wrap ix-table-wrap--show">
          <table className="ix-table ix-table--static gc-table--keep gc-table--scroll">
            <caption className="sr-only">Leads by channel under first touch and last touch, {periodLabel(period).toLowerCase()}</caption>
            <thead><tr><th scope="col">Channel</th><th scope="col" className="ix-num">First touch</th><th scope="col" className="ix-num">Last touch</th><th scope="col" className="ix-num">Difference</th><th scope="col" className="ix-num">Paid (last touch)</th><th scope="col" className="ix-num">Spend</th></tr></thead>
            <tbody>
              {rows.map((x) => {
                const d = x.first - x.last;
                return (
                  <tr key={x.ch}>
                    <th scope="row"><span className="mk-ch"><i style={{ background: CH_COLOR[x.ch] }} aria-hidden="true" />{x.ch}</span></th>
                    <td className="ix-num mk-fig">{num(x.first)}</td>
                    <td className="ix-num mk-fig">{num(x.last)}</td>
                    <td className="ix-num"><span className={'mk-delta ' + (Math.abs(d) < 1 ? '' : d > 0 ? 'is-good' : 'is-bad')}>{d >= 0 ? '+' : '−'}{num(Math.abs(d))}</span></td>
                    <td className="ix-num mk-fig">{num(x.paid)}</td>
                    <td className="ix-num mk-fig">{money(x.spend)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="ix-foot"><span className="mk-foot"><span>Leads<b>{num(tot)}</b></span><span>{periodLabel(period)} · every channel, not only ads</span></span></div>
      </section>
    </>
  );
}

// ---- page ------------------------------------------------------------------------------------------------------------------
export default function Ads() {
  const { data, t, live } = useMarketing();
  const [tab, setTab] = useQueryState('tab', TAB_KEYS, 'overview');
  const [period, setPeriod] = useState('30');
  const [retry, setRetry] = useState(0);
  const lead = (
    <select className="ix-pick" aria-label="Period" value={period} onChange={(e) => setPeriod(e.target.value)}>
      {PERIODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
    </select>
  );
  const attention = live ? accountRows(data, t).filter((a) => a.state === 'expiring' || a.state === 'expired').length : 0;
  const failing = live ? data.tracking.reduce((x, p) => x + p.events.filter((e) => e.status !== 'ok').length, 0) : 0;
  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'ad-tab-' + k, label: l, count: k === 'accounts' && attention ? attention : k === 'tracking' && failing ? failing : null, on: tab === k, onClick: () => setTab(k) }));

  let body;
  if (!live) body = <Skel label="Loading ads" />;
  else {
    try {
      const props = { data, t, period, lead };
      body = tab === 'accounts' ? <Accounts key={retry} {...props} /> : tab === 'campaigns' ? <AdCampaigns key={retry} {...props} /> : tab === 'budget' ? <Budget key={retry} {...props} />
        : tab === 'tracking' ? <Tracking key={retry} {...props} /> : tab === 'attribution' ? <Attribution key={retry} {...props} /> : <Overview key={retry} {...props} />;
    } catch (e) {
      body = <LoadError text="The ad figures could not be worked out." onRetry={() => setRetry((n) => n + 1)} />;
    }
  }

  return (
    <AdminShell active="ads" title="Ads">
      <style dangerouslySetInnerHTML={{ __html: MK_CSS + CSS + CHART_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="badge-dollar-sign" title="Ads"
          about="GridCommerce’s own paid ads: Meta (Facebook and Instagram), Google search and YouTube, and TikTok once connected. Spend, reach, clicks, leads, trials and paid stores per campaign, ad set and ad; the ad accounts; each platform’s monthly budget and pace; the Meta Pixel, Conversions API and Google tag events; and which channel gets the credit."
          secondary={[{ label: 'Campaigns', icon: 'megaphone', href: '/admin/campaigns' }]}
          more={[{ label: 'UTM links', href: '/admin/utm' }, { label: 'Marketing overview', href: '/admin/marketing' }, { label: 'Attribution (Analytics)', href: '/admin/analytics/attribution' }]}
          primary={{ label: 'Connect account', icon: 'plug', onClick: () => setTab('accounts') }} />
        <div className="ix-card ad-tabs"><IndexTabs label="Ads views" tabs={tabs} /></div>
        {body}
      </div>
    </AdminShell>
  );
}
