'use client';
// Merchant app · Report (/m-report?id=<id>). One report from the web's catalogue, laid out for a phone:
//   period chips   Today · Yesterday · 7 days · This month · Last month (a snapshot report shows "As of now")
//   figures        the report's key figures with the change against the previous period of the same length
//   bars           its chart as a simple bar list (categories) or small columns (days), no chart library
//   rows           the table as cards (title, the main figure, two more); a card opens every column in a sheet,
//                  with Open when the app has that record (an order, Payouts, Dues)
//   Share (the figures as text) · Download CSV (lib/reports/period.js downloadCsv, same file as the web)
// id=daily is the Daily summary (lib/reports/dailySummary.js, the web Home's and the 8 PM summary's pack): today or
// yesterday's sales, orders, money at closing, payouts, dues collected, expenses, top products and low stock.
// Reports outside the edition are not shown. Everything is worked out after mount (Netlify prerenders in UTC).

import React, { useEffect, useMemo, useState } from 'react';
import {
  AppScreen, Content, AppBar, TabBar, Section, Card, ListRow, Chips, Pill, Button, Sheet, IconButton, EmptyState,
  Skeleton, useAppData, useQuery, toast, money,
} from '../kit/AppKit';
import { markViewed } from '@/lib/reports/prefs';
import { dailySummary, keyFigures } from '@/lib/reports/dailySummary';
import { downloadCsv, dayKey, clockNow, startOfDay, addDays } from '@/lib/reports/period';
import { hasModule } from '@/lib/edition';
import { allowed, safe } from '../money/moneyData';
import { Lines, HeroCard, NotHere } from '../money/moneyParts';
import { phoneReports, reportBy, PERIODS, periodFor, defaultKey, run, bars, cardColumns, csvRows, appLink, fmt, change, rangeText, GROUP_BY_ID } from './reportData';

const PAGE = 30;
const CSS = `
[data-screen="MReport"] .kpis{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 20px 0}
[data-screen="MReport"] .kpi{padding:12px 14px;min-width:0}
[data-screen="MReport"] .kpi .k{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
[data-screen="MReport"] .kpi b{display:block;margin-top:2px;font-size:var(--text-lg);font-weight:var(--weight-semibold);letter-spacing:var(--tracking-tight);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
[data-screen="MReport"] .kpi .pill{margin-top:6px;height:22px;padding:0 8px}
[data-screen="MReport"] .blist{padding:6px 16px 10px}
[data-screen="MReport"] .brow{padding:8px 0}
[data-screen="MReport"] .brow + .brow{border-top:1px solid var(--line)}
[data-screen="MReport"] .brow .l{display:flex;justify-content:space-between;gap:12px;font-size:var(--text-sm);margin-bottom:6px}
[data-screen="MReport"] .brow .l span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--body)}
[data-screen="MReport"] .cols{display:flex;align-items:flex-end;gap:3px;height:120px;padding:16px 14px 10px}
[data-screen="MReport"] .cols > span{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end}
[data-screen="MReport"] .cols i{display:block;width:100%;border-radius:var(--radius-sm);background:#dbe6f7}
[data-screen="MReport"] .cols i.hi{background:#003087}
[data-screen="MReport"] .cols small{font-size:var(--text-xs);color:var(--muted);height:16px;line-height:16px}
[data-screen="MReport"] .acts{display:flex;gap:10px;padding:20px 20px 0}
[data-screen="MReport"] .acts .btn{flex:1}
[data-screen="MReport"] .notes{margin:12px 20px 0;padding:0 0 0 16px;font-size:var(--text-xs-plus);color:var(--muted);line-height:18px}
`;
const TONE_GOOD = (k, ch) => (ch == null || !ch ? 'grey' : k.good === 'none' ? 'grey' : (ch > 0) === (k.good !== 'down') ? 'ok' : 'err');

export default function MReportScreen() {
  const { ready, tick, ctx } = useAppData(['gc:reports']);
  const query = useQuery();
  const id = query ? query.get('id') || '' : null;
  const allowedList = useMemo(() => (ctx ? safe(() => phoneReports(ctx.ed), []) : null), [ctx]);
  const def = useMemo(() => (id && id !== 'daily' && allowedList && allowedList.some((r) => r.id === id && r.kind === 'def') ? reportBy(id) : null), [id, allowedList]);
  useEffect(() => { if (id && (def || id === 'daily')) safe(() => markViewed(id), null); }, [id, def]);

  if (ctx && !allowed('/m-reports', ctx)) return <NotHere name="MReport" title="Report" />;
  if (id === 'daily') return <DailyView ready={ready} tick={tick} ctx={ctx} />;
  const loading = !ready || !query || !allowedList;
  return (
    <AppScreen name="MReport" title={def ? def.title : 'Report'} css={CSS}>
      <AppBar title={def ? def.title : 'Report'} back="/m-reports" />
      <Content top={103}>
        {loading ? <Skeleton rows={4} /> : def ? <DefView def={def} tick={tick} /> : (
          <Card style={{ marginTop: '8px' }}><EmptyState icon="chart" title="This report isn’t here. It may not be part of your plan, or it reads better on a computer." action={{ label: 'All reports', href: '/m-reports' }} /></Card>
        )}
      </Content>
      <TabBar />
    </AppScreen>
  );
}

/** Share the figures as text (the phone's share sheet, else the clipboard). */
async function shareText(title, text) {
  try { if (navigator.share) { await navigator.share({ title, text }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(text); toast('Copied · paste it in WhatsApp or a message'); } catch { toast('Sharing isn’t available here', { tone: 'error' }); }
}

function Kpis({ list, before }) {
  if (!list || !list.length) return null;
  return (
    <div className="kpis">
      {list.map((k) => {
        const b = before && (before.kpis || []).find((x) => x.key === k.key);
        const ch = b && typeof k.value === 'number' && typeof b.value === 'number' ? change(k.value, b.value) : null;
        return (
          <div key={k.key || k.label} className="card kpi">
            <span className="k" title={k.label}>{k.label}</span>
            <b className="num">{fmt(k.value, k.format)}</b>
            {ch != null && Number.isFinite(ch) ? <Pill tone={TONE_GOOD(k, ch)}>{`${ch >= 0 ? '▲' : '▼'} ${Math.abs(Math.round(ch * 100))}%`}</Pill>
              : k.sub ? <span className="k">{k.sub}</span> : null}
          </div>
        );
      })}
    </div>
  );
}

function Bars({ chart, title = 'At a glance' }) {
  const b = bars(chart);
  if (!b) return null;
  const peak = Math.max(1, ...b.list.map((x) => Math.abs(x.value)));
  if (b.time && b.list.length > 1) {
    const every = Math.ceil(b.list.length / 8);
    const last = b.list.length - 1;
    return (
      <Section title={title} action={<span className="num" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{fmt(b.list.reduce((a, x) => a + x.value, 0), b.format)}</span>}>
        <div className="card cols" style={{ margin: '0 20px' }} role="img" aria-label={b.list.map((x) => `${x.label} ${fmt(x.value, b.format)}`).join(', ')}>
          {b.list.map((x, i) => (
            <span key={x.label + i} title={`${x.label}: ${fmt(x.value, b.format)}`}>
              <i className={i === last ? 'hi' : ''} style={{ height: Math.max(3, Math.round((Math.abs(x.value) / peak) * 78)) + 'px' }} />
              <small>{i % every === 0 || i === last ? x.label : ''}</small>
            </span>
          ))}
        </div>
      </Section>
    );
  }
  return (
    <Section title={title}>
      <Card className="blist">
        {b.list.map((x) => (
          <div key={x.label} className="brow">
            <div className="l"><span>{x.label}</span><span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{fmt(x.value, b.format)}</span></div>
            <div className="bar"><i style={{ width: Math.max(2, Math.round((Math.abs(x.value) / peak) * 100)) + '%', background: 'var(--brand)' }} /></div>
          </div>
        ))}
      </Card>
    </Section>
  );
}

function DefView({ def, tick }) {
  const [key, setKey] = useState(() => defaultKey(def));
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [row, setRow] = useState(null);
  const [now, setNow] = useState(0);
  useEffect(() => {
    const t = window.setTimeout(() => {
      const n = clockNow();
      setNow(n);
      try { setRes(run(def, periodFor(key, n, def), n)); setErr(''); } catch (e) { setRes(null); setErr('This report could not be worked out.'); }
    }, 0);
    return () => window.clearTimeout(t);
  }, [def, key, tick]);
  useEffect(() => { setLimit(PAGE); }, [key]);
  const period = now ? periodFor(key, now, def) : null;
  const periodText = !period ? ' ' : def.snapshot ? 'As of now' : rangeText(period.from, period.to);
  const cur = res ? res.cur : null;
  const table = cur && cur.table;
  const cols = useMemo(() => cardColumns(table), [table]);
  const rows = (table && table.rows) || [];
  const group = GROUP_BY_ID[def.group];

  const csv = () => {
    if (!cur) return;
    downloadCsv(`${def.id}-${period ? dayKey(period.from) : 'now'}.csv`, csvRows(def, cur, periodText));
    toast('CSV downloaded');
  };
  const share = () => {
    if (!cur) return;
    const lines = (cur.kpis || []).map((k) => `${k.label}: ${fmt(k.value, k.format)}`);
    shareText(def.title, [`${def.title} · ${periodText}`, ...lines].join('\n'));
  };
  const cell = (r, c) => (c ? fmt(r[c.key], c.format) : '');

  return (
    <>
      <div style={{ padding: '0 20px 10px', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{group ? group.label + ' · ' : ''}{periodText}</div>
      {!def.snapshot ? <Chips items={PERIODS} value={key} onChange={setKey} style={{ overflowX: 'auto', scrollbarWidth: 'none' }} /> : null}
      {err ? <Card style={{ marginTop: '14px' }}><EmptyState icon="alert" title={err} /></Card> : !cur ? <div style={{ marginTop: '14px' }}><Skeleton rows={3} /></div> : (
        <>
          <Kpis list={cur.kpis} before={res.before} />
          <Bars chart={cur.chart} />
          {table ? (
            <Section title="Details" action={<span style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{rows.length}</span>}>
              {rows.length ? (
                <Card>
                  {rows.slice(0, limit).map((r, i) => (
                    <ListRow key={i} onClick={() => setRow(r)} compact
                      title={cell(r, cols.title) || '—'}
                      sub={cols.sub.map((c) => `${c.label} ${cell(r, c)}`).join(' · ')}
                      end={cols.end ? <span className="num" style={{ fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap' }}>{cell(r, cols.end)}</span> : null} />
                  ))}
                  {rows.length > limit ? <button type="button" className="row" style={{ justifyContent: 'center', color: 'var(--brand)', fontWeight: 'var(--weight-semibold)', minHeight: '52px' }} onClick={() => setLimit(limit + PAGE)}>Show {Math.min(PAGE, rows.length - limit)} more</button> : null}
                </Card>
              ) : <Card><EmptyState icon="chart" title="Nothing in this period" /></Card>}
            </Section>
          ) : null}
          {cur.notes && cur.notes.length ? <ul className="notes">{cur.notes.map((n, i) => <li key={i}>{n}</li>)}</ul> : null}
          <div className="acts">
            <Button kind="line" icon="arrows" onClick={share}>Share</Button>
            <Button kind="soft" icon="download" onClick={csv}>Download CSV</Button>
          </div>
        </>
      )}
      <div style={{ height: '8px' }} />
      {row ? (
        <Sheet open title={cell(row, cols.title) || def.title} onClose={() => setRow(null)}
          footer={appLink(row._href) ? <Button kind="primary" href={appLink(row._href)}>Open</Button> : <Button kind="line" onClick={() => setRow(null)}>Close</Button>}>
          <div className="card" style={{ margin: 0, padding: '14px 16px', boxShadow: 'none', border: '1px solid var(--line)' }}>
            <Lines rows={cols.all.filter((c) => c !== cols.title).map((c) => [c.label, cell(row, c)])} />
          </div>
        </Sheet>
      ) : null}
    </>
  );
}

/** Daily summary: today or yesterday, from the same pack the web Home and the 8 PM message use. */
function DailyView({ ready, tick, ctx }) {
  const [which, setWhich] = useState('today');
  const [d, setD] = useState(null);
  useEffect(() => {
    if (!ready) return undefined;
    const t = window.setTimeout(() => {
      const now = clockNow();
      const day = which === 'today' ? startOfDay(now) : addDays(startOfDay(now), -1);
      setD(safe(() => dailySummary(day, now), null));
    }, 0);
    return () => window.clearTimeout(t);
  }, [ready, tick, which]);
  const online = ctx ? hasModule('online', ctx.ed) : true;
  const dateLine = d ? new Date(d.from).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : ' ';
  const text = () => (d ? [`Daily summary · ${dateLine}`, ...safe(() => keyFigures(d), []).map(([k, v]) => `${k}: ${v}`)].join('\n') : '');
  const csv = () => {
    if (!d) return;
    const rows = [['Daily summary'], [dateLine], [], ...safe(() => keyFigures(d), []).map(([k, v]) => [k, v]), [],
      ['Channel', 'Sales', 'Returns', 'Orders'], ...d.sales.byChannel.map((c) => [c.channel, c.revenue, c.returns, c.orders]), [],
      ['Money at closing', 'Opening', 'In', 'Out', 'Closing'], ...d.cash.map((c) => [c.label, c.opening, c.in, c.out, c.closing]), [],
      ['Top products', 'Qty', 'Sales'], ...d.top.map((p) => [p.name, p.qty, p.revenue]), [],
      ['Expenses', 'Amount'], ...d.expenses.byCat.map((x) => [x.cat, x.amount])];
    downloadCsv(`daily-summary-${dayKey(d.from)}.csv`, rows);
    toast('CSV downloaded');
  };
  const avg = d && d.sales.orders ? d.sales.total / d.sales.orders : 0;
  return (
    <AppScreen name="MReport" title="Daily summary" css={CSS}>
      <AppBar title="Daily summary" back="/m-reports" actions={<IconButton icon="download" label="Download CSV" onClick={csv} />} />
      <Content top={103}>
        <div style={{ padding: '0 20px 10px', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{dateLine}</div>
        <Chips items={[{ key: 'today', label: 'Today' }, { key: 'yesterday', label: 'Yesterday' }]} value={which} onChange={setWhich} />
        {!d ? <div style={{ marginTop: '14px' }}><Skeleton rows={4} /></div> : (
          <>
            <HeroCard label="Sales" value={money(d.sales.total)} pill={d.sales.returns ? `${money(d.sales.returns)} returned` : null}
              figures={[[String(d.sales.orders), online ? 'Orders' : 'Sales'], [money(avg), online ? 'Avg. order' : 'Avg. sale'], [money(d.sales.gross), 'Gross profit']]} />

            {d.sales.byChannel.length > 1 || d.sales.byPlace.length > 1 ? (
              <Section title="Where it sold">
                <Card className="blist">
                  {(d.sales.byChannel.length > 1 ? d.sales.byChannel.map((c) => [c.channel, c.revenue]) : []).concat(d.sales.byPlace.slice(0, 5).map((p) => [p.place, p.revenue])).map(([label, v], i, all) => {
                    const peak = Math.max(1, ...all.map((x) => x[1]));
                    return (
                      <div key={label + i} className="brow">
                        <div className="l"><span>{label}</span><span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(v)}</span></div>
                        <div className="bar"><i style={{ width: Math.max(2, Math.round((v / peak) * 100)) + '%', background: 'var(--brand)' }} /></div>
                      </div>
                    );
                  })}
                </Card>
              </Section>
            ) : null}

            {online ? (
              <Section title="Orders">
                <Card pad="14px 16px"><Lines rows={[['Placed online', String(d.orders.placed)], ['Delivered', String(d.orders.delivered)], ['Returned', String(d.orders.returned)], ['Cancelled', String(d.orders.cancelled)], ['Waiting now', String(d.orders.waiting), { strong: true }]]} /></Card>
              </Section>
            ) : null}

            <Section title="Money at closing" action={<span className="num" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{money(d.cashTotal)}</span>}>
              <Card>
                {d.cash.map((c) => (
                  <ListRow key={c.type} icon={c.type === 'Cash' ? 'cash' : c.type === 'Bank' ? 'card' : 'wallet'} title={c.label} chevron={false}
                    sub={`In ${money(c.in)} · out ${money(c.out)}`} end={<span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(c.closing)}</span>} />
                ))}
              </Card>
            </Section>

            {d.payouts.arrived.length || d.payouts.late.length ? (
              <Section title="Payouts" action={ctx && allowed('/m-payouts', ctx) ? { label: 'Open', href: '/m-payouts' } : null}>
                <Card pad="14px 16px">
                  <Lines rows={[
                    ['Arrived', money(d.payouts.arrivedTotal), { tone: 'ok' }],
                    d.payouts.late.length ? [`Late (${d.payouts.late.length})`, money(d.payouts.lateTotal), { tone: 'err' }] : null,
                    d.payouts.dueToday.length ? [`Due today (${d.payouts.dueToday.length})`, money(d.payouts.dueToday.reduce((a, p) => a + p.amount, 0))] : null,
                  ]} />
                </Card>
              </Section>
            ) : null}

            <Section title="Dues and expenses">
              <Card pad="14px 16px">
                <Lines rows={[
                  [`Dues collected${d.dues.count ? ` (${d.dues.count})` : ''}`, money(d.dues.collected), { tone: d.dues.collected ? 'ok' : undefined }],
                  ...d.expenses.byCat.slice(0, 5).map((x) => [x.cat, '−' + money(x.amount)]),
                  ['Spent', money(d.expenses.total), { strong: true }],
                ]} />
              </Card>
            </Section>

            {d.top.length ? (
              <Section title="Top products">
                <Card>
                  {d.top.map((p, i) => (
                    <ListRow key={p.sku || p.name} compact chevron={false} icon="box" title={p.name} sub={`#${i + 1} · ${p.qty} sold`} end={<span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(p.revenue)}</span>} />
                  ))}
                </Card>
              </Section>
            ) : null}

            {d.low.count ? (
              <Section title="Low stock" action={<Pill tone="warn">{d.low.count}</Pill>}>
                <Card>
                  {d.low.items.map((x) => (
                    <ListRow key={x.sku + x.place} compact chevron={false} icon="layers" title={x.name} sub={x.place} end={<Pill tone={x.available <= 0 ? 'err' : 'warn'}>{`${x.available} left`}</Pill>} />
                  ))}
                </Card>
              </Section>
            ) : null}

            <div className="acts">
              <Button kind="line" icon="arrows" onClick={() => shareText('Daily summary', text())}>Share</Button>
              <Button kind="soft" icon="download" onClick={csv}>Download CSV</Button>
            </div>
          </>
        )}
        <div style={{ height: '8px' }} />
      </Content>
      <TabBar />
    </AppScreen>
  );
}
