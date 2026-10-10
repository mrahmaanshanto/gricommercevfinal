'use client';
// APIs (/admin/apis) — GridCommerce's API over the last 24 hours: the totals (requests, average and P95 latency, error
// rate, timeouts), the open incident if one touches it, and the endpoint directory (method, path, requests, avg, P95,
// error %, failed, timeouts) with search, an area filter and sorting. An endpoint opens a side panel: latency by hour
// (average and P95), status codes, recent errors and timeouts by hour.
// Data: lib/admin/ops.js › endpoints, endpointDetail, apiTotals (simulated, follows the clock).
// ?q=, ?group=, ?sort= and ?ep= (the endpoint open in the panel) live in the address, read after mount.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, SearchField, KV } from '@/components/ui/IndexKit';
import { ColumnChart, StackBar, Legend, CHART_CSS } from '@/components/charts/DashCharts';
import { downloadCsv } from '@/lib/reports/period';
import { useAdminStore } from '@/lib/admin/store';
import { ops, endpoints, endpointDetail, apiTotals, activeIncidents, API_GROUPS, INTEGRATIONS } from '@/lib/admin/ops';
import { AdminShell, usePlatform } from '../AdminShell';
import { OPS_CSS, Method, LineChart, IncidentBanner, Skeleton, ErrorCard, msText, pctText, num, compact, ago } from './opsShared';

const SORTS = [['req', 'Most requests'], ['p95', 'Slowest (P95)'], ['avg', 'Slowest (average)'], ['errorRate', 'Highest error rate'], ['failed', 'Most failed'], ['timeouts', 'Most timeouts']];
const CODE_COLORS = { '2xx': 'var(--viz-1)', '4xx': 'var(--viz-4)', '5xx': 'var(--viz-8)', Timeouts: 'var(--viz-2)' };

const CSS = `
.ap-ep{display:flex;align-items:center;gap:var(--space-2);min-width:0;max-width:420px}
.ap-ep .ops-path{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ap-num{font-family:var(--font-data);font-variant-numeric:tabular-nums;text-align:right}
.ap-num.is-bad{color:var(--text-danger);font-weight:var(--weight-medium)}
.ap-num.is-warn{color:var(--text-warning);font-weight:var(--weight-medium)}
.ap-th{text-align:right}
.ap-th .ops-sortbtn{justify-content:flex-end;width:100%}
.ap-sheethead{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.ap-err{display:grid;grid-template-columns:44px minmax(0,1fr);gap:2px var(--space-2);padding:var(--space-2) 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.ap-err:first-child{border-top:0}
.ap-code{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-danger)}
.ap-code.is-4{color:var(--text-warning)}
.ap-err small{grid-column:2;font-size:var(--text-xs);color:var(--text-muted)}
.ap-pathbig{font-family:var(--font-data);font-size:var(--text-sm);color:var(--text-heading);overflow-wrap:anywhere}
`;

const csvRows = (list) => [
  ['Method', 'Path', 'Area', 'Requests (24 h)', 'Average ms', 'P95 ms', 'Error %', 'Failed', 'Timeouts', '4xx'],
  ...list.map((e) => [e.method, e.path, e.group, e.req, e.avg, e.p95, e.errorRate.toFixed(2), e.failed, e.timeouts, e.c4]),
];
const errTone = (r) => (r >= 2 ? 'is-bad' : r >= 1 ? 'is-warn' : '');

export default function Apis() {
  const { live: plive } = usePlatform();
  const { t, live: olive } = useAdminStore(ops);
  const live = plive && olive;
  const [ready, setReady] = useState(false);
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('');
  const [sort, setSort] = useState('req');
  const [ep, setEp] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQ(p.get('q') || '');
    setGroup(API_GROUPS.includes(p.get('group')) ? p.get('group') : '');
    setSort(SORTS.some(([k]) => k === p.get('sort')) ? p.get('sort') : 'req');
    setEp(p.get('ep') || null);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (group) p.set('group', group);
    if (sort !== 'req') p.set('sort', sort);
    if (ep) p.set('ep', ep);
    const s = p.toString();
    window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
  }, [ready, q, group, sort, ep]);

  let x = null, error = null;
  if (live) {
    try { x = { list: endpoints(t), tot: apiTotals(t), inc: activeIncidents() }; } catch (e) { error = e; }
  }
  const s = q.trim().toLowerCase();
  const rows = x ? x.list.filter((e) => (!group || e.group === group) && (!s || (e.method + ' ' + e.path + ' ' + e.group).toLowerCase().includes(s)))
    .sort((a, b) => b[sort] - a[sort]) : [];
  const filtersOn = !!s || !!group;
  const exportCsv = () => {
    if (!rows.length) { toast('Nothing to export'); return; }
    downloadCsv('gridcommerce-api-endpoints.csv', csvRows(rows));
    toast(`${rows.length} endpoints exported`);
  };
  const sortTh = (k, children) => (
    <th key={k} scope="col" className="ap-th" aria-sort={sort === k ? 'descending' : undefined}>
      <button type="button" className="ops-sortbtn" aria-pressed={sort === k} onClick={() => setSort(k)}>{children}<Icon name={sort === k ? 'arrow-down' : 'arrow-up-down'} width="12" height="12" aria-hidden="true" /></button>
    </th>
  );

  const header = (
    <ShopHeader icon="waypoints" title="APIs"
      about="Every GridCommerce API endpoint over the last 24 hours: how many requests, how fast (average and the slowest 5%, P95), how many failed with a server error, and how many timed out after 30 s. 4xx answers (bad input, not signed in) are the caller's mistake and are not counted as failed. Simulated demo data."
      secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv }]}
      more={[{ label: 'Servers', href: '/admin/servers' }, { label: 'Integrations', href: '/admin/integrations' }]} />
  );

  let body;
  if (!live) body = <Skeleton rows={1} />;
  else if (error) body = <ErrorCard onRetry={() => setRetry(retry + 1)} what="API figures" />;
  else {
    const tot = x.tot;
    body = (
      <>
        <MetricStrip label="API, last 24 hours" items={[
          { label: 'Requests, 24 h', value: compact(tot.req), icon: 'arrow-down-up', spark: tot.perHour.map((h) => h.req) },
          { label: 'Average', value: msText(tot.avg), icon: 'timer' },
          { label: 'P95', value: msText(tot.p95), icon: 'gauge' },
          { label: 'Error rate', value: pctText(tot.errorRate), sub: num(tot.failed) + ' failed', icon: 'circle-alert', onClick: () => setSort('errorRate'), on: sort === 'errorRate' },
          { label: 'Timeouts', value: num(tot.timeouts), icon: 'clock-alert', onClick: () => setSort('timeouts'), on: sort === 'timeouts' },
        ]} />
        <IncidentBanner list={x.inc} t={t} />

        <section className="ix-card" aria-label="Endpoints">
          <div className="ops-filters">
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search path or method" onDone={() => setQ('')} />
            <select className="ix-pick" aria-label="Area" value={group} onChange={(e) => setGroup(e.target.value)}>
              <option value="">All areas</option>
              {API_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <select className="ix-pick" aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          {!rows.length ? (
            <div className="ix-empty"><EmptyState title="No endpoint matches." actionLabel="Clear search" onAction={() => { setQ(''); setGroup(''); }} /></div>
          ) : (
            <>
              <ul className="ix-plist" aria-label="Endpoints">
                {rows.map((e) => (
                  <li key={e.id}>
                    <button type="button" className="ix-pitem" style={{ width: '100%', border: 0, background: 'none', textAlign: 'left', font: 'inherit' }} onClick={() => setEp(e.id)}>
                      <span className="ix-pitem__top"><span className="ap-ep"><Method m={e.method} /><span className="ops-path">{e.path}</span></span></span>
                      <span className="ix-pitem__mid">{compact(e.req)} requests · P95 {msText(e.p95)} · {pctText(e.errorRate)} errors{e.timeouts ? ` · ${e.timeouts} timeouts` : ''}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table gc-table--keep">
                  <caption className="sr-only">API endpoints, last 24 hours</caption>
                  <thead><tr>
                    <th scope="col">Endpoint</th><th scope="col">Area</th>
                    {sortTh('req', 'Requests')}{sortTh('avg', 'Average')}{sortTh('p95', 'P95')}
                    {sortTh('errorRate', 'Error %')}{sortTh('failed', 'Failed')}{sortTh('timeouts', 'Timeouts')}
                  </tr></thead>
                  <tbody>
                    {rows.map((e) => (
                      <tr key={e.id} tabIndex={0} onClick={() => setEp(e.id)} onKeyDown={(ev) => { if (ev.key === 'Enter') setEp(e.id); }}>
                        <td><span className="ap-ep"><Method m={e.method} /><span className="ops-path" title={e.path}>{e.path}</span></span></td>
                        <td className="ix-muted">{e.group}</td>
                        <td className="ap-num">{num(e.req)}</td>
                        <td className="ap-num">{msText(e.avg)}</td>
                        <td className={'ap-num' + (e.p95 >= 2000 ? ' is-warn' : '')}>{msText(e.p95)}</td>
                        <td className={'ap-num ' + errTone(e.errorRate)}>{pctText(e.errorRate)}</td>
                        <td className="ap-num">{num(e.failed)}</td>
                        <td className={'ap-num' + (e.timeouts >= 20 ? ' is-warn' : '')}>{num(e.timeouts)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <div className="ix-foot"><span>{filtersOn ? `${rows.length} of ${x.list.length} endpoints` : `${x.list.length} endpoints`} · last 24 hours</span></div>
        </section>
      </>
    );
  }

  // the endpoint panel
  let d = null;
  if (x && ep) { try { d = endpointDetail(ep, t); } catch { d = null; } }
  const it = d && d.integration ? INTEGRATIONS.find((i) => i.key === d.integration) : null;
  const inc = d && x ? x.inc.find((i) => i.integration === d.integration) : null;

  return (
    <AdminShell active="apis" title="APIs">
      <style dangerouslySetInnerHTML={{ __html: OPS_CSS + CHART_CSS + CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>

      <Sheet open={!!d} title={d ? d.method + ' ' + d.path : ''} onClose={() => setEp(null)}
        footer={<button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEp(null)}>Close</button>}>
        {d ? (
          <div className="ops-form">
            <div className="ap-sheethead"><Method m={d.method} /><span className="ap-pathbig">{d.path}</span></div>
            {inc ? <p><Link href={'/admin/incidents/view?id=' + inc.id}>{inc.id} · {inc.title}</Link> affects this endpoint.</p> : null}
            <KV rows={[
              ['Area', d.group],
              it ? ['Integration', <Link key="i" href={'/admin/integrations?app=' + it.key}>{it.name}</Link>] : null,
              ['Requests, 24 h', num(d.req)], ['Average', msText(d.avg)], ['P95', msText(d.p95)],
              ['Error rate', pctText(d.errorRate)], ['Failed', num(d.failed)], ['Timeouts', num(d.timeouts)], ['4xx answers', num(d.c4)],
            ]} />
            <h3 className="ops-sec">Latency by hour</h3>
            <LineChart key={'lat' + d.id} label={'Latency by hour, ' + d.path} points={d.hours}
              series={[{ name: 'Average', color: 'var(--viz-1)', values: d.hours.map((h) => h.avg) }, { name: 'P95', color: 'var(--viz-3)', values: d.hours.map((h) => h.p95) }]}
              fmt={msText} tickFmt={(v) => (v >= 1000 ? v / 1000 + 's' : Math.round(v))} height={170} />
            <Legend items={[{ name: 'Average', color: 'var(--viz-1)', kind: 'line' }, { name: 'P95', color: 'var(--viz-3)', kind: 'line' }]} />
            <h3 className="ops-sec">Status codes</h3>
            <StackBar label="Status codes, last 24 hours" parts={d.codes.map((c) => ({ ...c, color: CODE_COLORS[c.name] }))} fmt={num} />
            <Legend items={d.codes.map((c) => ({ name: c.name, color: CODE_COLORS[c.name], value: num(c.value) }))} />
            <h3 className="ops-sec">Timeouts by hour</h3>
            {d.timeouts ? (
              <ColumnChart key={'to' + d.id} label={'Timeouts by hour, ' + d.path} data={d.hours.map((h) => ({ label: h.label, title: h.title, values: [h.timeouts] }))}
                series={[{ name: 'Timeouts', color: 'var(--viz-2)' }]} fmt={num} height={130} now={d.hours.length - 1} />
            ) : <p className="ops-muted">No timeouts in the last 24 hours.</p>}
            <h3 className="ops-sec">Recent errors</h3>
            {d.recent.length ? (
              <div>
                {d.recent.map((r) => (
                  <div key={r.id} className="ap-err">
                    <span className={'ap-code' + (r.code < 500 ? ' is-4' : '')}>{r.code}</span>
                    <span>{r.msg}</span>
                    <small>{ago(r.at, t)} · {msText(r.ms)}{r.shopId ? <> · store <Link href={'/admin/merchant?id=' + r.shopId}>#{r.shopId}</Link></> : null}</small>
                  </div>
                ))}
              </div>
            ) : <p className="ops-muted">No errors in the last 24 hours.</p>}
          </div>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
