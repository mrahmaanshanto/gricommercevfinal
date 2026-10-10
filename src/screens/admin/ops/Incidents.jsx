'use client';
// Incidents (/admin/incidents) — platform incidents: the 90-day picture (uptime, how many, how fast they were fixed,
// how many were major), then the list with Active / Resolved as tabs (counts on the tabs), search, and a row per
// incident (severity, status, services, stores, owner, start, duration). A row opens the incident
// (/admin/incidents/view?id=). "Declare incident" opens a side panel: title, severity, affected services, which
// stores, owner, the first update and "Notify affected merchants".
// Data: lib/admin/ops.js › incidents, incidentStats, declareIncident, services, storesFor. ?view=, ?q= in the address;
// ?new=1 opens the Declare panel.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/runtime/ui';
import { Sheet, EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { dmy, hm } from '@/lib/platform/util';
import { useAdminStore } from '@/lib/admin/store';
import { ops, incidents, incidentStats, declareIncident, services, storesFor, INTEGRATIONS, SEVERITIES, OWNERS } from '@/lib/admin/ops';
import { AdminShell, usePlatform } from '../AdminShell';
import { OPS_CSS, SevTag, IncTag, Field, ctl, Skeleton, ErrorCard, when, span, plural } from './opsShared';

const VIEWS = [['active', 'Active'], ['resolved', 'Resolved']];
const CSS = `
.ic-title{display:flex;flex-direction:column;min-width:0;max-width:360px}
.ic-title a{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ic-title small{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.ic-svcs{display:inline-block;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle}
.ic-sev{display:flex;flex-direction:column;gap:6px}
.ic-sev label{display:flex;align-items:flex-start;gap:var(--space-2);padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.ic-sev label:has(input:checked){border-color:var(--primary);background:var(--fill-primary-soft)}
.ic-sev input{margin:3px 0 0;flex:none;accent-color:var(--primary)}
.ic-sev b{display:block;font-weight:var(--weight-semibold);color:var(--text-heading)}
`;

const svcName = (list, k) => (list.find((s) => s.key === k) || {}).name || k;
const BLANK = { title: '', severity: 'SEV3', services: [], who: 'users', ids: '', owner: 'Rakib Hasan', text: '', notify: true, errors: {} };

export default function Incidents() {
  const router = useRouter();
  const { db, live: plive } = usePlatform();
  const { t, live: olive } = useAdminStore(ops);
  const live = plive && olive;
  const [ready, setReady] = useState(false);
  const [view, setView] = useState('active');
  const [q, setQ] = useState('');
  const [form, setForm] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setView(VIEWS.some(([k]) => k === p.get('view')) ? p.get('view') : 'active');
    setQ(p.get('q') || '');
    if (p.get('new') === '1') setForm({ ...BLANK });
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams();
    if (view !== 'active') p.set('view', view);
    if (q.trim()) p.set('q', q.trim());
    const s = p.toString();
    window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
  }, [ready, view, q]);

  let x = null, error = null;
  if (live) {
    try { x = { list: incidents(), stats: incidentStats(t), svcs: services(t) }; } catch (e) { error = e; }
  }
  const s = q.trim().toLowerCase();
  const counts = x ? { active: x.list.filter((i) => i.status !== 'Resolved').length, resolved: x.list.filter((i) => i.status === 'Resolved').length } : {};
  const rows = x ? x.list.filter((i) => (view === 'active' ? i.status !== 'Resolved' : i.status === 'Resolved'))
    .filter((i) => !s || [i.id, i.title, i.owner, i.severity, ...(i.services || []).map((k) => svcName(x.svcs, k))].join(' ').toLowerCase().includes(s))
    .sort((a, b) => b.startedAt - a.startedAt) : [];
  const open = (id) => router.push('/admin/incidents/view?id=' + id);

  const exportCsv = () => {
    if (!x) return;
    downloadCsv('gridcommerce-incidents.csv', [
      ['Incident', 'Title', 'Severity', 'Status', 'Services', 'Stores', 'Owner', 'Started', 'Resolved', 'Minutes', 'Tickets', 'Resolution'],
      ...x.list.map((i) => [i.id, i.title, i.severity, i.status, (i.services || []).map((k) => svcName(x.svcs, k)).join('; '), (i.stores || []).length, i.owner,
        dmy(i.startedAt) + ' ' + hm(i.startedAt), i.resolvedAt ? dmy(i.resolvedAt) + ' ' + hm(i.resolvedAt) : '', Math.round(((i.resolvedAt || t) - i.startedAt) / 60000), (i.tickets || []).join('; '), i.resolution || '']),
    ]);
    toast(plural(x.list.length, 'incident') + ' exported');
  };

  // ---- Declare ----
  const integ = form ? INTEGRATIONS.find((i) => form.services.includes(i.service)) || null : null;
  const live2 = (db.shops || []).filter((z) => z.status === 'live').map((z) => z.id);
  const pickStores = (f) => {
    if (f.who === 'users' && integ) return storesFor(integ.key);
    if (f.who === 'all') return live2;
    if (f.who === 'ids') return [...new Set(String(f.ids).split(/[\s,]+/).map((v) => v.replace(/\D/g, '').padStart(4, '0')).filter((v) => v !== '0000' && (db.shops || []).some((z) => z.id === v)))];
    return [];
  };
  const stores = form ? pickStores(form) : [];
  const setF = (k) => (e) => { const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value; setForm((f) => ({ ...f, [k]: v, errors: {} })); };
  const toggleSvc = (k) => setForm((f) => ({ ...f, services: f.services.includes(k) ? f.services.filter((v) => v !== k) : [...f.services, k], errors: {} }));
  const submit = () => {
    if (form.who === 'ids' && !stores.length) { setForm({ ...form, errors: { ids: 'Enter store IDs like 0031, 0007.' } }); return; }
    const res = declareIncident({ title: form.title, severity: form.severity, services: form.services, integration: integ ? integ.key : null, stores, owner: form.owner, text: form.text, notify: form.notify });
    if (!res.ok) { setForm({ ...form, errors: { [res.field || 'form']: res.error } }); return; }
    setForm(null);
    toast(res.id + ' declared' + (res.notified ? ` · ${plural(res.notified, 'merchant')} told by SMS and email` : ''));
    router.push('/admin/incidents/view?id=' + res.id);
  };

  const header = (
    <ShopHeader icon="siren" title="Incidents"
      about="Problems with the platform or a connected service that affect merchants. An incident moves Investigating → Identified → Monitoring → Resolved; each step is posted on its timeline and can be sent to the affected merchants. Severity: SEV1 down for many stores, SEV2 a main feature broken, SEV3 degraded or a few stores, SEV4 minor. A post-mortem follows every SEV1 and SEV2."
      secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv }]}
      more={[{ label: 'Servers', href: '/admin/servers' }, { label: 'Integrations', href: '/admin/integrations' }]}
      primary={{ label: 'Declare incident', icon: 'siren', onClick: () => setForm({ ...BLANK }) }} />
  );

  let body;
  if (!live) body = <Skeleton rows={1} />;
  else if (error) body = <ErrorCard onRetry={() => setRetry(retry + 1)} what="Incidents" />;
  else {
    const st = x.stats;
    const tabs = VIEWS.map(([k, label]) => ({ key: k, id: 'ic-tab-' + k, label, count: counts[k], on: view === k, onClick: () => setView(k) }));
    body = (
      <>
        <MetricStrip label="Last 90 days" items={[
          { label: 'Uptime, 30 days', value: st.uptime + '%', icon: 'activity', href: '/admin/servers' },
          { label: 'Incidents, 90 days', value: String(st.total), icon: 'siren' },
          { label: 'Time to resolve', value: span(st.mttr), sub: 'average', icon: 'timer' },
          { label: 'SEV1 and SEV2', value: String(st.major), sub: '90 days', icon: 'triangle-alert' },
        ]} />
        <section className="ix-card" aria-label={view === 'active' ? 'Active incidents' : 'Resolved incidents'}>
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Incident views" /></div>
          <div className="ops-filters"><SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search incident, service or owner" onDone={() => setQ('')} /></div>
          {!rows.length ? (
            <div className="ix-empty">
              {s ? <EmptyState title="No incident matches." actionLabel="Clear search" onAction={() => setQ('')} />
                : view === 'active' ? <EmptyState icon="circle-check" title="No open incidents. Everything works." actionLabel="Show resolved" onAction={() => setView('resolved')} />
                  : <EmptyState icon="siren" title="No resolved incidents yet." actionLabel="Show active" onAction={() => setView('active')} />}
            </div>
          ) : (
            <>
              <ul className="ix-plist" aria-label="Incidents">
                {rows.map((i) => (
                  <li key={i.id}>
                    <Link href={'/admin/incidents/view?id=' + i.id} className="ix-pitem">
                      <span className="ix-pitem__top"><b>{i.title}</b><SevTag s={i.severity} /></span>
                      <span className="ix-pitem__mid"><span className="ix-id">{i.id}</span> · {plural((i.stores || []).length, 'store')} · {i.owner} · {when(i.startedAt, t)}</span>
                      <span className="ix-pitem__tags"><IncTag s={i.status} /></span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table gc-table--keep">
                  <caption className="sr-only">{view === 'active' ? 'Active' : 'Resolved'} incidents</caption>
                  <thead><tr>
                    <th scope="col">Incident</th><th scope="col">Severity</th><th scope="col">Status</th><th scope="col">Services</th>
                    <th scope="col" className="ix-num">Stores</th><th scope="col">Owner</th><th scope="col">Started</th><th scope="col">{view === 'active' ? 'Open for' : 'Lasted'}</th>
                  </tr></thead>
                  <tbody>
                    {rows.map((i) => (
                      <tr key={i.id} tabIndex={0} onClick={() => open(i.id)} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) open(i.id); }}>
                        <td><span className="ic-title"><Link href={'/admin/incidents/view?id=' + i.id} className="ix-strong" onClick={(e) => e.stopPropagation()} title={i.title}>{i.title}</Link><small>{i.id}{(i.tickets || []).length ? ' · ' + i.tickets.join(', ') : ''}</small></span></td>
                        <td><SevTag s={i.severity} /></td>
                        <td><IncTag s={i.status} /></td>
                        <td><span className="ic-svcs">{(i.services || []).map((k) => svcName(x.svcs, k)).join(', ')}</span></td>
                        <td className="ix-num ops-data">{(i.stores || []).length}</td>
                        <td className="ix-nowrap">{i.owner}</td>
                        <td className="ix-muted ix-nowrap">{when(i.startedAt, t)}</td>
                        <td className="ix-muted ix-nowrap">{span((i.resolvedAt || t) - i.startedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <div className="ix-foot"><span>{plural(rows.length, 'incident')}</span></div>
        </section>
      </>
    );
  }

  const e = form ? form.errors : {};
  return (
    <AdminShell active="incidents" title="Incidents">
      <style dangerouslySetInnerHTML={{ __html: OPS_CSS + CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>

      <Sheet open={!!form} title="Declare incident" onClose={() => setForm(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setForm(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={submit}>Declare</button>
        </>}>
        {form && x ? (
          <div className="ops-form">
            <Field id="ic-title" label="Title" error={e.title} hint="What merchants notice, e.g. “Pathao bookings failing”.">
              <input id="ic-title" {...ctl(e.title)} data-autofocus value={form.title} onChange={setF('title')} maxLength={80} />
            </Field>
            <div className="gc-field">
              <span className="gc-label" id="ic-sev-l">Severity</span>
              <div className="ic-sev" role="radiogroup" aria-labelledby="ic-sev-l">
                {SEVERITIES.map(([k, d]) => (
                  <label key={k}><input type="radio" name="ic-sev" value={k} checked={form.severity === k} onChange={setF('severity')} /><span><b>{k}</b>{d}</span></label>
                ))}
              </div>
            </div>
            <div className="gc-field">
              <span className="gc-label" id="ic-svc-l">Affected services</span>
              <div className="ops-checks" role="group" aria-labelledby="ic-svc-l">
                {x.svcs.map((v) => <label key={v.key} className="ops-check"><input type="checkbox" checked={form.services.includes(v.key)} onChange={() => toggleSvc(v.key)} />{v.name}</label>)}
              </div>
              {e.services ? <p className="gc-help gc-help--error" role="alert">{e.services}</p> : null}
            </div>
            <Field id="ic-who" label="Affected stores" error={e.ids} hint={`${plural(stores.length, 'store')} on this incident.`}>
              <select id="ic-who" {...ctl(e.ids, true)} value={form.who} onChange={setF('who')}>
                <option value="users" disabled={!integ}>{integ ? `Every store using ${integ.name} (${storesFor(integ.key).length})` : 'Every store using the service (pick a provider above)'}</option>
                <option value="all">Every live store ({live2.length})</option>
                <option value="ids">Only some stores</option>
                <option value="none">Not known yet</option>
              </select>
            </Field>
            {form.who === 'ids' ? (
              <Field id="ic-ids" label="Store IDs" hint="Separate with commas: 0031, 0007">
                <input id="ic-ids" {...ctl(e.ids)} value={form.ids} onChange={setF('ids')} inputMode="numeric" />
              </Field>
            ) : null}
            <Field id="ic-owner" label="Owner" error={e.owner}>
              <select id="ic-owner" {...ctl(e.owner, true)} value={form.owner} onChange={setF('owner')}>
                {OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field id="ic-text" label="First update" error={e.text}>
              <textarea id="ic-text" {...ctl(e.text)} rows={3} value={form.text} onChange={setF('text')} placeholder="What is happening and what we are doing" />
            </Field>
            <label className="ops-check"><input type="checkbox" checked={form.notify && stores.length > 0} disabled={!stores.length} onChange={setF('notify')} />Notify affected merchants by SMS and email{stores.length ? ` (${stores.length})` : ''}</label>
            {e.form ? <p className="ops-formerr" role="alert">{e.form}</p> : null}
          </div>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
