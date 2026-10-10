'use client';
// Servers (/admin/servers) — the platform's machines at a glance: the health strip (uptime, CPU, memory, disk, error
// rate), the open incident if there is one, the server table with small trend lines (a row opens the server), CPU and
// memory over the last hour / 24 hours / 7 days, the database (connections, slow queries, replication lag, backups),
// network traffic, and the background job queues (retry failed jobs).
// Data: lib/admin/ops.js (simulated: every figure follows the clock; the page redraws every 20 s).

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, Spark, KV } from '@/components/ui/IndexKit';
import { Sparkline, Legend, CHART_CSS } from '@/components/charts/DashCharts';
import { downloadCsv } from '@/lib/reports/period';
import { useAdminStore } from '@/lib/admin/store';
import {
  ops, SERVERS, RANGES, servers, serverLoad, serverSeries, database, queues, failedJobs, activeIncidents, retryJobs, backupNow, UPTIME_30D,
} from '@/lib/admin/ops';
import { AdminShell, usePlatform } from '../AdminShell';
import { OPS_CSS, Card, Meter, Seg, StateTag, LineChart, IncidentBanner, Skeleton, ErrorCard, span, ago, when, plural, num } from './opsShared';

const CSS = `
.sv-name{display:flex;flex-direction:column;min-width:0}
.sv-name b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sv-name small{font-size:var(--text-xs);color:var(--text-muted)}
.sv-fig{display:inline-flex;align-items:center;gap:var(--space-2);color:var(--text-heading)}
.sv-fig .ix-spark{color:var(--viz-1)}
.sv-fig b{min-width:36px;font-family:var(--font-data);font-weight:var(--weight-medium);text-align:right}
.sv-fig b.is-warn{color:var(--text-warning)}
.sv-disk{display:grid;grid-template-columns:72px 36px;align-items:center;gap:var(--space-2)}
.sv-disk b{font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--text-heading);text-align:right}
.sv-net{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-body);white-space:nowrap}
.sv-charthead{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.sv-charthead .ix-pick{max-width:200px}
.sv-db{display:flex;flex-direction:column;gap:var(--space-3)}
.sv-dbrow{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:4px var(--space-3);font-size:var(--text-sm);color:var(--text-body)}
.sv-dbrow b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading);text-align:right}
.sv-dbrow .ops-meter{grid-column:1 / -1}
.sv-dbrow small{grid-column:1 / -1;font-size:var(--text-xs);color:var(--text-muted)}
.sv-lag{grid-column:1 / -1}
.sv-q{display:flex;flex-direction:column;min-width:0;max-width:300px}
.sv-q b{font-weight:var(--weight-medium);color:var(--text-heading)}
.sv-q small{overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.sv-slow{margin:0;padding:0;list-style:none}
.sv-slow li{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) 0;border-top:1px solid var(--border-subtle)}
.sv-slow code{font-family:var(--font-code);font-size:var(--text-xs);color:var(--text-heading);overflow-wrap:anywhere}
.sv-slow small{font-size:var(--text-xs);color:var(--text-muted)}
.sv-netlist{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:6px var(--space-4);margin-top:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.sv-netlist span{font-family:var(--font-data)}
.sv-netlist span:not(:first-child){text-align:right;color:var(--text-heading)}
.sv-netlist .is-head{font-family:var(--font-sans);font-size:var(--text-xs);color:var(--text-muted)}
.sv-jobs .ix-num b.is-bad{color:var(--text-danger)}
.sv-sheetchart{margin-top:var(--space-2)}
`;

const RANGE_TICK = { '1h': (v) => v + '%', '24h': (v) => v + '%', '7d': (v) => v + '%' };
const csvRows = (list, qs) => [
  ['Server', 'Role', 'Region', 'Size', 'Status', 'CPU %', 'Memory %', 'Disk %', 'In Mbps', 'Out Mbps'],
  ...list.map((s) => [s.name, s.role, s.region, s.size, s.status, s.cpu, s.ram, s.disk, s.in, s.out]),
  [],
  ['Queue', 'Waiting', 'Running', 'Failed', 'Retrying', 'Oldest waiting (s)'],
  ...qs.map((q) => [q.key, q.waiting, q.running, q.failed, q.retrying, q.oldest]),
];

export default function Servers() {
  const { live: plive } = usePlatform();
  const { t, live: olive } = useAdminStore(ops);
  const live = plive && olive;
  const [range, setRange] = useState('1h');
  const [which, setWhich] = useState('all');
  const [server, setServer] = useState(null);    // the server open in the side panel
  const [sRange, setSRange] = useState('1h');
  const [queue, setQueue] = useState(null);      // the queue open in the side panel
  const [retry, setRetry] = useState(0);

  let x = null, error = null;
  if (live) {
    try {
      x = { list: servers(t), load: serverLoad(t), series: serverSeries(which, range, t), db: database(t), qs: queues(t), inc: activeIncidents(), fleetSpark: serverSeries('all', '1h', t).filter((_, i) => i % 5 === 4).map((p) => p.cpu) };
    } catch (e) { error = e; }
  }

  const doRetry = (key, ids) => {
    const res = retryJobs(key, ids);
    if (!res.ok) { toast(res.error); return; }
    toast(`${plural(res.n, 'job')} queued again`);
  };
  const doBackup = () => {
    const res = backupNow();
    if (!res.ok) { toast(res.error); return; }
    toast('Database backup taken');
  };
  const exportCsv = () => {
    if (!x) return;
    downloadCsv('gridcommerce-servers.csv', csvRows(x.list, x.qs));
    toast('Servers exported');
  };

  const header = (
    <ShopHeader icon="server" title="Servers"
      about="The machines GridCommerce runs on: health now, CPU and memory over time, the database and its backups, network traffic and the background job queues. Every figure here is simulated demo data; a real build reads it from monitoring."
      secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv }]}
      more={[{ label: 'Back up the database now', onClick: doBackup }, { label: 'APIs', href: '/admin/apis' }, { label: 'Integrations', href: '/admin/integrations' }]}
      primary={{ label: 'Declare incident', icon: 'siren', href: '/admin/incidents?new=1' }} />
  );

  let body;
  if (!live) body = <Skeleton rows={2} />;
  else if (error) body = <ErrorCard onRetry={() => setRetry(retry + 1)} what="Server figures" />;
  else {
    const { list, load, db, qs } = x;
    const failed = qs.reduce((a, q) => a + q.failed, 0);
    body = (
      <>
        <MetricStrip label="Health now" items={[
          { label: 'Uptime, 30 days', value: UPTIME_30D + '%', icon: 'activity', href: '/admin/incidents' },
          { label: 'CPU', value: load.cpu + '%', icon: 'cpu', spark: x.fleetSpark },
          { label: 'Memory', value: load.ram + '%', icon: 'memory-stick' },
          { label: 'Disk', value: load.disk + '%', icon: 'hard-drive' },
          { label: 'Error rate', value: load.errorRate + '%', icon: 'circle-alert', href: '/admin/apis' },
        ]} />
        <IncidentBanner list={x.inc} t={t} />

        <section className="ix-card" aria-label="Servers">
          <div className="ix-card__head"><h2>Servers</h2><span className="ops-small">{list.filter((s) => s.status === 'ok').length} of {list.length} healthy</span></div>
          <ul className="ix-plist" aria-label="Servers" style={{ marginTop: 'var(--space-2)' }}>
            {list.map((s) => (
              <li key={s.key}>
                <button type="button" className="ix-pitem" style={{ width: '100%', border: 0, background: 'none', textAlign: 'left', font: 'inherit' }} onClick={() => setServer(s.key)}>
                  <span className="ix-pitem__top"><b>{s.name}</b><StateTag s={s.status} /></span>
                  <span className="ix-pitem__mid">{s.role} · CPU {s.cpu}% · memory {s.ram}% · disk {s.disk}%</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="ix-table-wrap" style={{ marginTop: 'var(--space-2)' }}>
            <table className="ix-table gc-table--keep">
              <caption className="sr-only">Servers</caption>
              <thead><tr>
                <th scope="col">Server</th><th scope="col">Region</th><th scope="col">Status</th><th scope="col">CPU</th><th scope="col">Memory</th>
                <th scope="col">Disk</th><th scope="col">Network in / out</th><th scope="col">Up for</th>
              </tr></thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.key} tabIndex={0} onClick={() => setServer(s.key)} onKeyDown={(e) => { if (e.key === 'Enter') setServer(s.key); }}>
                    <td><span className="sv-name"><b>{s.name}</b><small>{s.role}</small></span></td>
                    <td className="ix-muted">{s.region}</td>
                    <td><StateTag s={s.status} /></td>
                    <td><span className="sv-fig"><Spark values={s.spark} /><b className={s.cpu >= 75 ? 'is-warn' : ''}>{s.cpu}%</b></span></td>
                    <td><span className="sv-fig"><Spark values={s.sparkRam} /><b className={s.ram >= 85 ? 'is-warn' : ''}>{s.ram}%</b></span></td>
                    <td><span className="sv-disk"><Meter pct={s.disk} label={s.name + ' disk'} /><b>{s.disk}%</b></span></td>
                    <td><span className="sv-net">{s.in} / {s.out} Mbps</span></td>
                    <td className="ix-muted ix-nowrap">{span(t - s.bootedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <Card title="CPU and memory" action={
          <span className="sv-charthead">
            <select className="ix-pick" aria-label="Server" value={which} onChange={(e) => setWhich(e.target.value)}>
              <option value="all">All servers (average)</option>
              {SERVERS.map((s) => <option key={s.key} value={s.key}>{s.key}</option>)}
            </select>
            <Seg value={range} onChange={setRange} options={RANGES.map(([k]) => [k, k])} label="Period" />
          </span>
        }>
          <LineChart key={which + range} label={`CPU and memory, ${which === 'all' ? 'all servers' : which}, ${(RANGES.find(([k]) => k === range) || [])[1]}`}
            points={x.series} series={[{ name: 'CPU', color: 'var(--viz-1)', values: x.series.map((p) => p.cpu) }, { name: 'Memory', color: 'var(--viz-3)', values: x.series.map((p) => p.ram) }]}
            max={100} warn={80} fmt={(v) => Math.round(v) + '%'} tickFmt={RANGE_TICK[range]} height={220} />
          <div className="ops-legend"><Legend items={[{ name: 'CPU', color: 'var(--viz-1)', kind: 'line' }, { name: 'Memory', color: 'var(--viz-3)', kind: 'line' }, { name: 'Warning at 80%', color: 'var(--warning)', kind: 'dash' }]} /></div>
        </Card>

        <div className="ops-grid ops-grid--2">
          <Card title="Database" tip="db-primary takes every write; db-replica follows it and serves reports. A full backup runs every night at 03:00 and a small one every hour; backups are kept 30 days." action={<button type="button" className="ix-btn ix-btn--sm" onClick={doBackup}><Icon name="database-backup" width="16" height="16" aria-hidden="true" />Back up now</button>}>
            <div className="sv-db">
              <div className="sv-dbrow"><span>Connections</span><b>{db.connections} of {db.maxConnections}</b><Meter pct={(db.connections / db.maxConnections) * 100} label="Connections in use" /></div>
              <div className="sv-dbrow"><span>Slow queries, last hour</span><b className={db.slowQueries > 8 ? 'ops-warn' : ''}>{db.slowQueries}</b><small>Queries over {db.slowOver / 1000} s</small></div>
              <div className="sv-dbrow"><span>Replication lag</span><b className={db.lag >= db.lagWarn ? 'ops-bad' : ''}>{db.lag} s</b>
                <span className="sv-lag"><Sparkline values={db.lagSeries} label="Replication lag, last hour (seconds)" fmt={(v) => v + ' s'} height={36} color="var(--viz-3)" /></span></div>
              <KV rows={[
                ['Last full backup', when(db.backups.full, t) + ' · ' + db.backups.fullTook + ' min'],
                ['Last hourly backup', ago(db.backups.incremental, t)],
                db.backups.manual ? ['Taken by hand', ago(db.backups.manual.at, t) + ' · ' + db.backups.manual.by] : null,
                ['Size', db.size + ' GB'],
                ['Kept for', db.backups.retention + ' days'],
                ['Last restore test', when(db.backups.restoreTest, t)],
              ]} />
              <details className="gc-disclose">
                <summary>Slowest queries</summary>
                <ul className="sv-slow">
                  {db.topSlow.map((q) => <li key={q.q}><code>{q.q}</code><small>{(q.avg / 1000).toFixed(1)} s on average · {q.n} times · {q.where}</small></li>)}
                </ul>
              </details>
            </div>
          </Card>
          <Card title="Network" action={<span className="ops-small">{(RANGES.find(([k]) => k === range) || [])[1]}{which !== 'all' ? ' · ' + which : ''}</span>}>
            <LineChart key={'net' + which + range} label={`Network traffic in and out, ${which === 'all' ? 'all servers' : which}`}
              points={x.series} series={[{ name: 'In', color: 'var(--viz-1)', values: x.series.map((p) => p.in) }, { name: 'Out', color: 'var(--viz-2)', values: x.series.map((p) => p.out) }]}
              fmt={(v) => Math.round(v) + ' Mbps'} tickFmt={(v) => Math.round(v)} height={170} />
            <div className="ops-legend"><Legend items={[{ name: 'In (Mbps)', color: 'var(--viz-1)', kind: 'line' }, { name: 'Out (Mbps)', color: 'var(--viz-2)', kind: 'line' }]} /></div>
            <div className="sv-netlist" role="table" aria-label="Traffic now by server">
              <span className="is-head" role="columnheader">Now</span><span className="is-head" role="columnheader">In</span><span className="is-head" role="columnheader">Out</span>
              {list.map((s) => <React.Fragment key={s.key}><span role="cell">{s.name}</span><span role="cell">{s.in}</span><span role="cell">{s.out}</span></React.Fragment>)}
            </div>
          </Card>
        </div>

        <section className="ix-card sv-jobs" aria-label="Background jobs and queues">
          <div className="ix-card__head"><h2>Background jobs</h2><span className="ops-small">{num(qs.reduce((a, q) => a + q.waiting, 0))} waiting · {failed} failed</span></div>
          <ul className="ix-plist" aria-label="Queues" style={{ marginTop: 'var(--space-2)' }}>
            {qs.map((q) => (
              <li key={q.key}>
                <button type="button" className="ix-pitem" style={{ width: '100%', border: 0, background: 'none', textAlign: 'left', font: 'inherit' }} onClick={() => setQueue(q.key)}>
                  <span className="ix-pitem__top"><b>{q.name}</b><StateTag s={q.status} label={q.held ? 'Held up' : undefined} /></span>
                  <span className="ix-pitem__mid">{q.waiting} waiting · {q.running} running · {q.failed} failed{q.retrying ? ` · ${q.retrying} retrying` : ''}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="ix-table-wrap" style={{ marginTop: 'var(--space-2)' }}>
            <table className="ix-table gc-table--keep">
              <caption className="sr-only">Background job queues</caption>
              <thead><tr>
                <th scope="col">Queue</th><th scope="col" className="ix-num">Waiting</th><th scope="col" className="ix-num">Running</th><th scope="col" className="ix-num">Failed</th>
                <th scope="col" className="ix-num">Retrying</th><th scope="col" className="ix-num">Oldest waiting</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Action</span></th>
              </tr></thead>
              <tbody>
                {qs.map((q) => (
                  <tr key={q.key} tabIndex={0} onClick={() => setQueue(q.key)} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) setQueue(q.key); }}>
                    <td><span className="sv-q"><b className="ops-data">{q.key}</b><small>{q.what}</small></span></td>
                    <td className="ix-num ops-data">{q.waiting}</td>
                    <td className="ix-num ops-data">{q.running}</td>
                    <td className="ix-num ops-data"><b className={q.failed ? 'is-bad' : ''} style={{ fontWeight: 'var(--weight-medium)' }}>{q.failed}</b></td>
                    <td className="ix-num ops-data">{q.retrying || '—'}</td>
                    <td className="ix-num ops-data">{q.waiting ? span(q.oldest * 1000) : '—'}</td>
                    <td><StateTag s={q.status} label={q.held ? 'Held up' : undefined} /></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {q.failed ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => doRetry(q.key, 'all')}><Icon name="rotate-ccw" width="16" height="16" aria-hidden="true" />Retry {q.failed}</button> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  // the side panels
  const sv = x && server ? x.list.find((s) => s.key === server) : null;
  const svSeries = sv ? serverSeries(sv.key, sRange, t) : [];
  const q = x && queue ? x.qs.find((y) => y.key === queue) : null;
  const jobs = q ? failedJobs(q.key, t) : [];
  const qInc = q && q.held ? x.inc.find((i) => (i.queues || []).includes(q.key)) || null : null;

  return (
    <AdminShell active="servers" title="Servers">
      <style dangerouslySetInnerHTML={{ __html: OPS_CSS + CHART_CSS + CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>

      <Sheet open={!!sv} title={sv ? sv.name : ''} onClose={() => setServer(null)}
        footer={<button type="button" className="gc-btn gc-btn--neutral" onClick={() => setServer(null)}>Close</button>}>
        {sv ? (
          <div className="ops-form">
            <p><StateTag s={sv.status} /> <span className="ops-muted">{sv.role}</span></p>
            <KV rows={[
              ['Region', sv.region], ['Size', sv.size], ['CPU now', sv.cpu + '%'], ['Memory now', sv.ram + '%'], ['Disk', sv.disk + '%'],
              ['Network', `${sv.in} in · ${sv.out} out (Mbps)`], ['Running since', when(sv.bootedAt, t) + ' · ' + span(t - sv.bootedAt)], ['Uptime, 30 days', sv.uptime30 + '%'],
            ]} />
            <div className="ops-tools"><Seg value={sRange} onChange={setSRange} options={RANGES} label="Period" /></div>
            <div className="sv-sheetchart">
              <LineChart key={sv.key + sRange} label={`CPU and memory, ${sv.name}`} points={svSeries}
                series={[{ name: 'CPU', color: 'var(--viz-1)', values: svSeries.map((p) => p.cpu) }, { name: 'Memory', color: 'var(--viz-3)', values: svSeries.map((p) => p.ram) }]}
                max={100} warn={80} fmt={(v) => Math.round(v) + '%'} tickFmt={(v) => v + '%'} height={180} />
              <div className="ops-legend"><Legend items={[{ name: 'CPU', color: 'var(--viz-1)', kind: 'line' }, { name: 'Memory', color: 'var(--viz-3)', kind: 'line' }]} /></div>
            </div>
          </div>
        ) : null}
      </Sheet>

      <Sheet open={!!q} title={q ? q.name + ' queue' : ''} onClose={() => setQueue(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setQueue(null)}>Close</button>
          {q && jobs.length ? <button type="button" className="gc-btn gc-btn--solid" onClick={() => doRetry(q.key, 'all')}><Icon name="rotate-ccw" width="16" height="16" aria-hidden="true" />Retry all {jobs.length}</button> : null}
        </>}>
        {q ? (
          <div className="ops-form">
            <p>{q.what}</p>
            <KV rows={[
              ['Waiting', String(q.waiting)], ['Running', `${q.running} of ${q.workers} workers`], ['Retrying now', String(q.retrying || 0)],
              ['Oldest waiting', q.waiting ? span(q.oldest * 1000) : '—'],
              qInc ? ['Held up by', <Link key="i" href={'/admin/incidents/view?id=' + qInc.id}>{qInc.id} · {qInc.title}</Link>] : null,
            ]} />
            <h3 className="ops-sec">Failed in the last 6 hours</h3>
            {jobs.length ? (
              <ul className="ops-list">
                {jobs.map((j) => (
                  <li key={j.id}>
                    <span className="ops-list__main"><b>{j.error}</b><small><span className="ops-data">{j.id}</span> · {ago(j.at, t)} · {j.attempts} tries{j.shopId ? <> · <Link href={'/admin/merchant?id=' + j.shopId}>#{j.shopId}</Link></> : null}</small></span>
                    <span className="ops-list__end"><button type="button" className="ix-btn ix-btn--sm" onClick={() => doRetry(q.key, [j.id])}>Retry</button></span>
                  </li>
                ))}
              </ul>
            ) : <EmptyState icon="circle-check" title="No failed jobs." />}
          </div>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
