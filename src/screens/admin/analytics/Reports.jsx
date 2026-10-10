'use client';
// Reports (/admin/reports) — every super admin report in one catalogue, as on the merchant panel's Reports page: two
// tabs (Reports · Scheduled, counts on the tabs), a search, the reports grouped (Merchants, Revenue & billing, Sales,
// Marketing, Support, Usage, Finance, People), each opening /admin/reports/view?id=<id>. Scheduled lists the report
// deliveries (email or WhatsApp; daily, weekly or monthly) with the next send; "Schedule a report" adds one in a side
// panel and Remove asks first. Sending is UI only: nothing leaves the browser.
// Data: lib/admin/reportDefs (GROUPS, REPORTS), lib/admin/analytics (schedules, addSchedule, removeSchedule, nextRun).
// ?tab and ?q live in the address.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, EmptyState } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField } from '@/components/ui/IndexKit';
import { dm, hm, dmy } from '@/lib/platform/util';
import { staff } from '@/lib/platform/store';
import { GROUPS, REPORTS, reportBy } from '@/lib/admin/reportDefs';
import { FREQS, SEND_VIA, addSchedule, removeSchedule, nextRun } from '@/lib/admin/analytics';
import { AdminShell } from '../AdminShell';
import { AN_CSS, useAnalytics, useQuery } from './anShared';

const CSS = `
.rp-group{border-top:1px solid var(--border-subtle)}
.rp-group:first-child{border-top:0}
.rp-ghead{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-3) var(--space-4) var(--space-1)}
.rp-ghead h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.rp-ghead span{font-size:var(--text-xs);color:var(--text-muted)}
.rp-ghead svg{color:var(--text-muted)}
.rp-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 var(--space-4);margin:0;padding:0 var(--space-2) var(--space-2);list-style:none}
.rp-item{display:flex;align-items:flex-start;gap:var(--space-3);min-height:56px;padding:var(--space-2);border-radius:var(--radius-lg);color:inherit;text-decoration:none}
.rp-item:hover{background:var(--surface-subtle)}
.rp-item>svg{flex:none;margin-top:2px;color:var(--text-muted)}
.rp-item b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.rp-item small{display:block;font-size:var(--text-xs);line-height:1.45;color:var(--text-muted)}
.rp-item .rp-sch{display:inline-flex;align-items:center;gap:4px;margin-top:2px;color:var(--text-body)}
.rp-search{padding:var(--space-2) var(--space-3);border-bottom:1px solid var(--border-subtle)}
.rp-search .ix-search{max-width:360px}
.rp-form{display:flex;flex-direction:column;gap:var(--space-4)}
.rp-row2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--space-3)}
.rp-formerr{margin:0;font-size:var(--text-sm);color:var(--text-danger)}
.rp-who b{display:block;font-weight:var(--weight-medium);color:var(--text-heading)}
.rp-who small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:900px){.rp-list{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.rp-row2{grid-template-columns:minmax(0,1fr)}.rp-search .ix-search{max-width:none}}
`;

const freqLabel = (k) => (FREQS.find(([v]) => v === k) || [k, k])[1];
const viaLabel = (k) => (SEND_VIA.find(([v]) => v === k) || [k, k])[1];

function Field({ id, label, error, hint, children }) {
  return (
    <div className="gc-field">
      <label className="gc-label" htmlFor={id}>{label}</label>
      {children}
      {error ? <p className="gc-help gc-help--error" role="alert">{error}</p> : hint ? <p className="gc-help">{hint}</p> : null}
    </div>
  );
}
const ctl = (error, select) => ({ className: 'gc-input' + (select ? ' gc-select' : '') + (error ? ' gc-input--error' : ''), 'aria-invalid': error ? true : undefined });

/** The side panel that schedules a report (also opened from a report's page). */
export function ScheduleSheet({ reportId = '', onClose }) {
  const me = staff();
  const [f, setF] = useState({ reportId, via: 'email', to: '', freq: 'weekly', time: '09:00' });
  const [err, setErr] = useState(null);
  const set = (k) => (e) => { setErr(null); setF((x) => ({ ...x, [k]: e.target.value })); };
  const submit = () => {
    const def = reportBy(f.reportId);
    const r = addSchedule({ ...f, title: def ? def.title : '' });
    if (!r.ok) { setErr({ field: r.field || 'form', text: r.error }); return; }
    toast(`${def.title} scheduled · ${freqLabel(f.freq).toLowerCase()} by ${viaLabel(f.via).toLowerCase()}`);
    onClose();
  };
  const e = (k) => (err && err.field === k ? err.text : null);
  return (
    <Sheet open title="Schedule a report" onClose={onClose} footer={(
      <>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button>
        <button type="submit" form="rp-sch" className="gc-btn gc-btn--solid">Schedule</button>
      </>
    )}>
      <form id="rp-sch" className="rp-form" noValidate onSubmit={(ev) => { ev.preventDefault(); submit(); }}>
        <Field id="rp-r" label="Report" error={e('report')}>
          <select id="rp-r" {...ctl(e('report'), true)} value={f.reportId} onChange={set('reportId')}>
            <option value="">Pick a report</option>
            {GROUPS.map((g) => (
              <optgroup key={g.id} label={g.label}>
                {REPORTS.filter((r) => r.group === g.id).map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
              </optgroup>
            ))}
          </select>
        </Field>
        <Field id="rp-v" label="Send by">
          <select id="rp-v" {...ctl(null, true)} value={f.via} onChange={(ev) => { setErr(null); setF((x) => ({ ...x, via: ev.target.value, to: '' })); }}>
            {SEND_VIA.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </Field>
        <Field id="rp-to" label={f.via === 'whatsapp' ? 'WhatsApp number' : 'Email'} error={e('to')} hint={f.via === 'whatsapp' ? 'The report arrives as a PDF.' : 'Several addresses with commas. The report arrives as a PDF with the CSV attached.'}>
          <input id="rp-to" type={f.via === 'whatsapp' ? 'tel' : 'email'} inputMode={f.via === 'whatsapp' ? 'tel' : 'email'} autoComplete="off" {...ctl(e('to'))}
            placeholder={f.via === 'whatsapp' ? '+880 17XX-XXXXXX' : (me.email || 'name@gridcommerce.net')} value={f.to} onChange={set('to')} />
        </Field>
        <div className="rp-row2">
          <Field id="rp-f" label="How often" error={e('freq')}>
            <select id="rp-f" {...ctl(e('freq'), true)} value={f.freq} onChange={set('freq')}>
              {FREQS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </Field>
          <Field id="rp-t" label="At" error={e('time')}>
            <input id="rp-t" type="time" {...ctl(e('time'))} value={f.time} onChange={set('time')} />
          </Field>
        </div>
        <p className="gc-help">Each send covers the period before it: the day, the week (Saturday to Friday) or the month.</p>
        {err && err.field === 'form' ? <p className="rp-formerr" role="alert">{err.text}</p> : null}
      </form>
    </Sheet>
  );
}

export default function Reports() {
  const { t, data, live } = useAnalytics();
  const [q, setQ] = useQuery({ tab: 'all', q: '' });
  const [adding, setAdding] = useState(null);   // null · '' · a report id
  const [text, setText] = useState('');
  useEffect(() => { setText(q.q || ''); }, [q.q]);
  const tab = q.tab === 'scheduled' ? 'scheduled' : 'all';
  const schedules = data.schedules || [];
  const words = text.trim().toLowerCase();
  const match = (r) => !words || [r.title, r.description, (GROUPS.find((g) => g.id === r.group) || {}).label].join(' ').toLowerCase().includes(words);
  const scheduledIds = new Set(schedules.map((s) => s.reportId));

  const remove = async (s) => {
    const ok = await confirmDialog({ title: 'Remove this schedule?', body: `${s.title} will stop going to ${s.to}.`, confirmLabel: 'Remove', tone: 'danger' });
    if (!ok) return;
    const r = removeSchedule(s.id);
    if (r.ok) toast('Schedule removed'); else toast(r.error);
  };

  let body;
  if (tab === 'all') {
    const groups = GROUPS.map((g) => ({ ...g, list: REPORTS.filter((r) => r.group === g.id && match(r)) })).filter((g) => g.list.length);
    body = (
      <>
        <div className="rp-search"><SearchField value={text} onChange={(e) => { setText(e.target.value); setQ({ q: e.target.value }); }} placeholder="Search reports" onDone={() => { setText(''); setQ({ q: '' }); }} /></div>
        {groups.length ? groups.map((g) => (
          <section key={g.id} className="rp-group" aria-labelledby={'rp-g-' + g.id}>
            <div className="rp-ghead"><Icon name={g.icon} width="16" height="16" aria-hidden="true" /><h2 id={'rp-g-' + g.id}>{g.label}</h2><span>· {g.help}</span></div>
            <ul className="rp-list">
              {g.list.map((r) => (
                <li key={r.id}>
                  <Link className="rp-item" href={r.href}>
                    <Icon name={r.icon} width="16" height="16" aria-hidden="true" />
                    <span>
                      <b>{r.title}</b><small>{r.description}</small>
                      {live && scheduledIds.has(r.id) ? <small className="rp-sch"><Icon name="clock" width="12" height="12" aria-hidden="true" />Scheduled</small> : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )) : (
          <div className="ix-empty"><EmptyState title={`No report matches “${text}”.`} actionLabel="Clear search" onAction={() => { setText(''); setQ({ q: '' }); }} /></div>
        )}
      </>
    );
  } else if (!live) {
    body = <div className="an-skel" style={{ height: 160, margin: 'var(--space-3)' }} aria-hidden="true" />;
  } else if (!schedules.length) {
    body = <div className="ix-empty"><EmptyState icon="clock" title="No report is scheduled." actionLabel="Schedule a report" onAction={() => setAdding('')} /></div>;
  } else {
    body = (
      <div className="ix-table-wrap ix-table-wrap--show">
        <table className="ix-table ix-table--static an-table">
          <caption className="sr-only">Scheduled reports</caption>
          <thead><tr><th scope="col">Report</th><th scope="col">Sent to</th><th scope="col">How often</th><th scope="col">Next send</th><th scope="col">Added by</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {schedules.map((s) => {
              const def = reportBy(s.reportId);
              const next = nextRun(s, t);
              return (
                <tr key={s.id}>
                  <td className="an-name"><b>{def ? <Link href={def.href}>{def.title}</Link> : s.title}</b><small>{s.id}</small></td>
                  <td className="rp-who"><b>{viaLabel(s.via)}</b><small>{s.to}</small></td>
                  <td>{freqLabel(s.freq)} · {s.time}</td>
                  <td>{dm(next)} {hm(next)}</td>
                  <td className="rp-who"><b>{s.by}</b><small>{dmy(s.at)}</small></td>
                  <td style={{ textAlign: 'right' }}><button type="button" className="ix-btn ix-btn--sm" onClick={() => remove(s)} aria-label={`Remove the ${s.title} schedule`}>Remove</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <AdminShell active="reports" title="Reports">
      <style dangerouslySetInnerHTML={{ __html: AN_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="file-bar-chart" title="Reports"
          about="Every GridCommerce report in one place, grouped by area. Open one to pick the period, compare it, filter it, choose the table's columns, download it as CSV or print it with the letterhead. Scheduled sends a report by email or WhatsApp every day, week or month."
          secondary={[{ label: 'Analytics', icon: 'chart-column', href: '/admin/analytics' }]}
          primary={{ label: 'Schedule a report', icon: 'clock', onClick: () => setAdding('') }} />
        <section className="ix-card" aria-label="Reports">
          <div className="ix-bar"><IndexTabs label="Reports" tabs={[
            { key: 'all', label: 'Reports', count: REPORTS.length, on: tab === 'all', onClick: () => setQ({ tab: 'all' }), id: 'rp-tab-all' },
            { key: 'scheduled', label: 'Scheduled', count: live ? schedules.length : null, on: tab === 'scheduled', onClick: () => setQ({ tab: 'scheduled' }), id: 'rp-tab-scheduled' },
          ]} /></div>
          {body}
        </section>
      </div>
      {adding != null ? <ScheduleSheet reportId={adding} onClose={() => setAdding(null)} /> : null}
    </AdminShell>
  );
}
