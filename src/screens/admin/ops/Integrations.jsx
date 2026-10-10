'use client';
// Integrations (/admin/integrations) — every outside service the platform talks to for its merchants, grouped like the
// merchant panel's Connections page (Payments, Messaging, Couriers, Channels, Store sync): status, success rate, last
// success, failures in 24 hours, the stores hit and the stores using it. A provider opens a side panel with failures by
// hour, the stores hit (links to the merchant), the failure log, the open incident, and the two actions: Retry failed
// (sends the failed deliveries again) and Pause / Resume sync (asks for a reason).
// Data: lib/admin/ops.js › integrations, integration, retryIntegration, pauseIntegration, resumeIntegration.
// ?app=steadfast opens that provider's panel.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, EmptyState, InfoTip } from '@/components/ui';
import { ShopHeader, MetricStrip, KV } from '@/components/ui/IndexKit';
import { ColumnChart, CHART_CSS } from '@/components/charts/DashCharts';
import { BrandLogo } from '@/components/BrandLogo';
import { downloadCsv } from '@/lib/reports/period';
import { useAdminStore } from '@/lib/admin/store';
import { ops, GROUPS, INTEGRATIONS, integrations, integration, activeIncidents, retryIntegration, pauseIntegration, resumeIntegration } from '@/lib/admin/ops';
import { AdminShell, usePlatform } from '../AdminShell';
import { OPS_CSS, StateTag, IncidentBanner, Skeleton, ErrorCard, Field, ctl, ago, when, num, rateText, plural } from './opsShared';

const CSS = `
.in-prov{display:flex;align-items:center;gap:var(--space-3);min-width:0}
.in-prov__txt{display:flex;flex-direction:column;min-width:0}
.in-prov__txt b{font-weight:var(--weight-semibold);color:var(--text-heading)}
.in-prov__txt small{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.in-num{font-family:var(--font-data);font-variant-numeric:tabular-nums;text-align:right}
.in-num.is-bad{color:var(--text-danger);font-weight:var(--weight-medium)}
.in-head{display:flex;align-items:center;gap:var(--space-3)}
.in-head p{margin:0}
.in-stores{display:flex;flex-wrap:wrap;gap:6px}
.in-note{display:flex;align-items:flex-start;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm);color:var(--text-body)}
.in-note svg{flex:none;margin-top:2px;color:var(--text-muted)}
.in-note.is-warn{background:var(--fill-warning-soft)}
.in-note.is-warn svg{color:var(--text-warning)}
.in-state{font-size:var(--text-xs);color:var(--text-muted)}
.in-state.is-failed{color:var(--text-danger)}
`;

const csvRows = (list) => [
  ['Provider', 'Group', 'Status', 'Requests (24 h)', 'Failed (24 h)', 'Success %', 'Waiting to resend', 'Stores hit', 'Stores using', 'Incident'],
  ...list.map((i) => [i.name, i.group, i.status, i.req, i.failed, i.success.toFixed(2), i.pending, i.affected.length, i.users.length, i.incident || '']),
];

export default function Integrations() {
  const { db, live: plive } = usePlatform();
  const { t, live: olive } = useAdminStore(ops);
  const live = plive && olive;
  const [app, setApp] = useState(null);
  const [ready, setReady] = useState(false);
  const [pause, setPause] = useState(null);   // { reason, error } while the pause form is open
  const [allStores, setAllStores] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const a = p.get('app');
    setApp(INTEGRATIONS.some((i) => i.key === a) ? a : null);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    window.history.replaceState(window.history.state, '', window.location.pathname + (app ? '?app=' + app : ''));
    setPause(null); setAllStores(false);
  }, [ready, app]);

  let x = null, error = null;
  if (live) {
    try { x = { list: integrations(t), inc: activeIncidents() }; } catch (e) { error = e; }
  }
  const shopName = (id) => ((db.shops || []).find((s) => s.id === id) || {}).name || '#' + id;

  const exportCsv = () => {
    if (!x) return;
    downloadCsv('gridcommerce-integrations.csv', csvRows(x.list));
    toast('Integrations exported');
  };
  const doRetry = (key) => {
    const res = retryIntegration(key);
    if (!res.ok) { toast(res.error); return; }
    const it = INTEGRATIONS.find((i) => i.key === key);
    toast(`${num(res.n)} failed ${it.what} sent again`);
  };
  const doPause = async (key) => {
    const it = INTEGRATIONS.find((i) => i.key === key);
    if (String(pause.reason || '').trim().length < 5) { setPause({ ...pause, error: 'Say why it is paused (5 characters or more).' }); return; }
    const ok = await confirmDialog({ title: `Pause ${it.name}?`, body: `${it.name} stops syncing for ${plural(x.list.find((i) => i.key === key).users.length, 'store')} until someone resumes it. Nothing is lost; ${it.what} wait and go out after.`, confirmLabel: 'Pause sync', tone: 'danger' });
    if (!ok) return;
    const res = pauseIntegration(key, pause.reason);
    if (!res.ok) { setPause({ ...pause, error: res.error }); return; }
    setPause(null);
    toast(`${it.name} paused for ${plural(res.n, 'store')}`);
  };
  const doResume = (key) => {
    const res = resumeIntegration(key);
    if (!res.ok) { toast(res.error); return; }
    toast(INTEGRATIONS.find((i) => i.key === key).name + ' sync resumed');
  };

  const header = (
    <ShopHeader icon="plug" title="Integrations"
      about="The outside services GridCommerce connects for its merchants: payment gateways, SMS and email providers, couriers, Meta and Google, and store sync. Each shows whether it works now, how many calls failed in the last 24 hours, and which stores were hit. Retry failed sends the failed deliveries again; Pause sync stops one provider for every store until it is resumed. Simulated demo data."
      secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv }]}
      more={[{ label: 'APIs', href: '/admin/apis' }, { label: 'Incidents', href: '/admin/incidents' }]} />
  );

  let body;
  if (!live) body = <Skeleton rows={2} />;
  else if (error) body = <ErrorCard onRetry={() => setRetry(retry + 1)} what="Integration figures" />;
  else {
    const list = x.list;
    const req = list.reduce((a, i) => a + i.req, 0), failed = list.reduce((a, i) => a + i.failed, 0);
    const pending = list.reduce((a, i) => a + i.pending, 0);
    const notOk = list.filter((i) => i.status !== 'ok');
    const hit = new Set(notOk.flatMap((i) => i.affected));
    body = (
      <>
        <MetricStrip label="Integrations now" items={[
          { label: 'Working', value: `${list.length - notOk.length} of ${list.length}`, icon: 'plug-zap' },
          { label: 'Success, 24 h', value: rateText((1 - failed / Math.max(1, req)) * 100), icon: 'circle-check' },
          { label: 'Failures, 24 h', value: num(failed), icon: 'circle-alert' },
          { label: 'Waiting to resend', value: num(pending), icon: 'rotate-ccw' },
          { label: 'Stores hit now', value: String(hit.size), icon: 'store' },
        ]} />
        <IncidentBanner list={x.inc} t={t} />
        {GROUPS.map((g) => {
          const rows = list.filter((i) => i.group === g);
          return (
            <section key={g} className="ix-card" aria-label={g}>
              <div className="ix-card__head"><h2>{g}</h2><span className="ops-small">{rows.filter((i) => i.status === 'ok').length} of {rows.length} working</span></div>
              <ul className="ix-plist" aria-label={g} style={{ marginTop: 'var(--space-2)' }}>
                {rows.map((i) => (
                  <li key={i.key}>
                    <button type="button" className="ix-pitem" style={{ width: '100%', border: 0, background: 'none', textAlign: 'left', font: 'inherit' }} onClick={() => setApp(i.key)}>
                      <span className="ix-pitem__top"><b>{i.name}</b><StateTag s={i.status} /></span>
                      <span className="ix-pitem__mid">{rateText(i.success)} success · {num(i.failed)} failed · {plural(i.users.length, 'store')}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="ix-table-wrap" style={{ marginTop: 'var(--space-2)' }}>
                <table className="ix-table gc-table--keep">
                  <caption className="sr-only">{g} providers</caption>
                  <thead><tr>
                    <th scope="col">Provider</th><th scope="col">Status</th><th scope="col" className="ix-num">Success, 24 h</th><th scope="col">Last success</th>
                    <th scope="col" className="ix-num">Failures, 24 h</th>
                    <th scope="col" className="ix-num">Stores hit <InfoTip text="During an incident: every store on it. Otherwise: stores with a failure in the last 6 hours that has not been sent again." label="About stores hit" /></th>
                    <th scope="col" className="ix-num">Stores using</th>
                  </tr></thead>
                  <tbody>
                    {rows.map((i) => (
                      <tr key={i.key} tabIndex={0} onClick={() => setApp(i.key)} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) setApp(i.key); }}>
                        <td><span className="in-prov"><BrandLogo brand={i.brand} size={28} decorative /><span className="in-prov__txt"><b>{i.name}</b><small>{i.kind}</small></span></span></td>
                        <td><StateTag s={i.status} />{i.incident ? <span className="ops-small"> · {i.incident}</span> : null}</td>
                        <td className={'in-num' + (i.success < 99 ? ' is-bad' : '')}>{rateText(i.success)}</td>
                        <td className="ix-muted ix-nowrap">{ago(i.lastSuccess, t)}</td>
                        <td className={'in-num' + (i.failed >= 30 ? ' is-bad' : '')}>{num(i.failed)}</td>
                        <td className="in-num">{i.affected.length}</td>
                        <td className="in-num">{i.users.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </>
    );
  }

  // the provider panel
  let d = null;
  if (x && app) { try { d = integration(app, t); } catch { d = null; } }
  const inc = d && d.incident ? x.inc.find((i) => i.id === d.incident) : null;
  const shown = d ? (allStores ? d.affected : d.affected.slice(0, 12)) : [];

  return (
    <AdminShell active="integrations" title="Integrations">
      <style dangerouslySetInnerHTML={{ __html: OPS_CSS + CHART_CSS + CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>

      <Sheet open={!!d} title={d ? d.name : ''} onClose={() => setApp(null)}
        footer={d ? <>
          {d.paused
            ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => doResume(d.key)}><Icon name="play" width="16" height="16" aria-hidden="true" />Resume sync</button>
            : pause ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setPause(null)}>Cancel</button>
              : <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setPause({ reason: '', error: '' })}><Icon name="pause" width="16" height="16" aria-hidden="true" />Pause sync</button>}
          {pause && !d.paused
            ? <button type="button" className="gc-btn gc-btn--solid" onClick={() => doPause(d.key)}>Pause sync</button>
            : <button type="button" className="gc-btn gc-btn--solid" onClick={() => doRetry(d.key)} disabled={!d.pending || !!d.paused}><Icon name="rotate-ccw" width="16" height="16" aria-hidden="true" />Retry failed{d.pending ? ' (' + num(d.pending) + ')' : ''}</button>}
        </> : null}>
        {d ? (
          <div className="ops-form">
            <div className="in-head"><BrandLogo brand={d.brand} size={40} decorative /><span className="in-prov__txt"><b>{d.kind}</b><small>{d.group}</small></span><StateTag s={d.status} /></div>
            {inc ? (
              <div className="in-note is-warn"><Icon name="siren" width="16" height="16" aria-hidden="true" /><span><Link href={'/admin/incidents/view?id=' + inc.id} className="ix-strong">{inc.id} · {inc.title}</Link><br />{inc.status} · {inc.severity} · owner {inc.owner}</span></div>
            ) : null}
            {d.paused ? (
              <div className="in-note"><Icon name="pause" width="16" height="16" aria-hidden="true" /><span>Paused by {d.paused.by} {ago(d.paused.at, t)}: {d.paused.reason}</span></div>
            ) : null}
            {pause && !d.paused ? (
              <Field id="in-pause" label="Why pause it?" error={pause.error} hint={`Every store using ${d.name} stops syncing until it is resumed.`}>
                <input id="in-pause" {...ctl(pause.error)} data-autofocus value={pause.reason} maxLength={140} placeholder="e.g. Provider maintenance until 14:00" onChange={(e) => setPause({ reason: e.target.value, error: '' })} />
              </Field>
            ) : null}
            <KV rows={[
              ['Success, 24 h', rateText(d.success)], ['Calls, 24 h', num(d.req)], ['Failed, 24 h', num(d.failed)],
              ['Waiting to resend', num(d.pending)], ['Last success', ago(d.lastSuccess, t)],
              d.retriedAt ? ['Last resend', when(d.retriedAt, t) + ' · ' + d.retriedBy] : null,
              ['Uptime, 30 days', d.uptime + '%'], ['Stores using', String(d.users.length)],
            ]} />
            <h3 className="ops-sec">Failures by hour</h3>
            <ColumnChart key={'f' + d.key} label={'Failures by hour, ' + d.name} data={d.hours.map((h) => ({ label: (new Date(h.h + 6 * 3600e3).getUTCHours() + '').padStart(2, '0'), title: when(h.h, t), values: [h.failed] }))}
              series={[{ name: 'Failed', color: 'var(--viz-8)' }]} fmt={num} height={130} now={d.hours.length - 1} />
            <h3 className="ops-sec">{inc ? `Stores on ${inc.id}` : 'Stores hit, last 6 hours'} ({d.affected.length})</h3>
            {d.affected.length ? (
              <>
                <div className="in-stores">
                  {shown.map((id) => <Link key={id} href={'/admin/merchant?id=' + id} className="ops-chip">{shopName(id)} <span className="ops-data">#{id}</span></Link>)}
                </div>
                {d.affected.length > shown.length || allStores ? (
                  <button type="button" className="ix-btn ix-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => setAllStores(!allStores)}>{allStores ? 'Show fewer' : `Show all ${d.affected.length}`}</button>
                ) : null}
              </>
            ) : <p className="ops-muted">No store has an open failure.</p>}
            <h3 className="ops-sec">Failure log</h3>
            {d.log.length ? (
              <ul className="ops-list">
                {d.log.map((f) => (
                  <li key={f.id}>
                    <span className="ops-list__main"><b>{f.msg}</b><small>{ago(f.at, t)}{f.shopId ? <> · <Link href={'/admin/merchant?id=' + f.shopId}>{shopName(f.shopId)}</Link></> : null}{f.of > 4 ? ` · 1 of ${f.of} that hour` : ''}</small></span>
                    <span className="ops-list__end"><span className={'in-state' + (f.state === 'Failed' ? ' is-failed' : '')}>{f.state}</span></span>
                  </li>
                ))}
              </ul>
            ) : <EmptyState icon="circle-check" title="No failures in the last 24 hours." />}
          </div>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
