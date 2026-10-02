'use client';
// ScheduledReports — every report set to go out by WhatsApp or email (/scheduled-reports):
//   report · how often · time · next run · send to · format · on/off, with Edit, Delete and
//   "Send a test now", which shows the message that would go out, with the report's key figures for
//   the last full period (yesterday, last week or last month).
// Front end only: schedules live in this browser (src/lib/reports/prefs.js); sending needs the server.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { Dialog, EmptyState } from '@/components/ui';
import { ReportsShell, useDataTick } from '@/components/reports/ReportsShell';
import { ScheduleDialog } from '@/components/reports/ScheduleDialog';
import { reportBy } from '@/lib/reports/catalogue';
import { getPrefs, saveSchedule, deleteSchedule, nextRun } from '@/lib/reports/prefs';
import { periodOf, rangeText, fmt, clockNow, dayKey } from '@/lib/reports/period';
import { dailySummary } from '@/lib/reports/dailySummary';
import { MERCHANT } from '@/lib/merchant';

const DAILY = { id: 'daily-summary', title: 'Daily summary', href: '/daily-summary', icon: 'sun' };
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const FORMAT = { pdf: 'PDF', csv: 'CSV', text: 'Short message' };
const CSS = `
.sr-note{display:flex;gap:var(--space-3);align-items:flex-start;padding:var(--space-3) var(--space-4);border-radius:var(--radius-xl);background:var(--fill-info-soft);color:var(--text-info);font-size:var(--text-sm);line-height:1.5}
.sr-note svg{flex:none;margin-top:2px}
.sr-table td{vertical-align:middle}
.sr-name{display:flex;align-items:center;gap:var(--space-3);min-width:0}
.sr-name a{font-weight:var(--weight-medium);color:var(--text-heading);text-decoration:none}
.sr-name a:hover{text-decoration:underline}
.sr-name small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sr-data{font-family:var(--font-data);white-space:nowrap}
.sr-muted{color:var(--text-muted)}
.sr-acts{display:flex;justify-content:flex-end;gap:var(--space-1);white-space:nowrap}
.sr-acts .gc-iconbtn{width:44px;height:44px}
.sr-msg{margin:0;padding:var(--space-4);border-radius:var(--radius-xl);background:var(--fill-success-soft);color:var(--text-heading);font-family:var(--font-sans);font-size:var(--text-sm);line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere}
.sr-msg.is-email{background:var(--surface-subtle);border:1px solid var(--border-subtle)}
.sr-meta{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px var(--space-3);margin:0;font-size:var(--text-xs)}
.sr-meta dt{color:var(--text-muted)}
.sr-meta dd{margin:0;color:var(--text-heading);overflow-wrap:anywhere}
@media (max-width:767px){
  .sr-table thead{display:none}
  .sr-table,.sr-table tbody,.sr-table tr,.sr-table td{display:block;width:100%}
  .sr-table tr{padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
  .sr-table td{display:flex;justify-content:space-between;align-items:center;gap:var(--space-3);padding:4px 0!important;border:0!important;text-align:right}
  .sr-table td::before{content:attr(data-label);color:var(--text-muted);font-size:var(--text-xs);text-align:left;flex:none}
  .sr-table td:first-child::before,.sr-table td:last-child::before{content:none}
  .sr-table td:first-child{text-align:left}
  .sr-acts{width:100%}
}
`;

const reportOf = (s) => (s.reportId === DAILY.id ? DAILY : reportBy(s.reportId)) || { id: s.reportId, title: s.title || s.reportId, href: '/reports-centre', missing: true };
const howOften = (s) => (s.every === 'week' ? `Every ${DAYS[s.weekday ?? 6]}` : s.every === 'month' ? `Day ${s.monthDay || 1} of each month` : 'Every day');
const clock = (hhmm) => { const [h, m] = String(hhmm || '20:00').split(':').map(Number); return `${h % 12 || 12}:${String(m || 0).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
const filtersOf = (query) => { const out = {}; try { new URLSearchParams(query || '').forEach((v, k) => { if (k.startsWith('f_') && v) out[k.slice(2)] = v; }); } catch { /* ignore */ } return out; };

/** The message a schedule sends, with the report's key figures for the last full period. */
export function buildMessage(s, now = clockNow()) {
  const r = reportOf(s);
  const p = periodOf(s.every === 'week' ? 'lastweek' : s.every === 'month' ? 'lastmonth' : 'yesterday', now);
  const site = MERCHANT.web.replace(/^www\./, '');
  let when = rangeText(p.from, p.to), lines = [], link = '';
  if (r.id === DAILY.id) {
    const d = dailySummary(p.from, now);
    lines = d.figures.map(([k, v]) => `${k}: ${v}`);
    link = `${site}/daily-summary?day=${dayKey(p.from)}`;
    when = new Date(p.from).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } else if (r.kind === 'def') {
    try {
      const res = r.compute({ from: p.from, to: p.to, now, filters: filtersOf(s.query) });
      lines = (res.kpis || []).map((k) => `${k.label}: ${fmt(k.value, k.format)}`);
      if (r.snapshot) when = 'As of ' + fmt(now, 'datetime');
    } catch { lines = ['The figures could not be worked out for this period.']; }
    link = `${site}/report${s.query && s.query.includes('id=') ? s.query : '?id=' + r.id}`;
  } else {
    lines = ['Open the page for the latest figures.'];
    link = site + (r.href || '');
  }
  const head = `${MERCHANT.name} · ${r.title}`;
  const body = s.to === 'email'
    ? `${lines.join('\n')}\n\nThe full report is attached as ${s.format === 'csv' ? 'a CSV spreadsheet' : s.format === 'text' ? 'text' : 'a PDF'}.\nOpen it online: ${link}`
    : `*${head}*\n${when}\n\n${lines.map((x) => '• ' + x).join('\n')}\n\nFull report: ${link}`;
  return { r, head, when, body, subject: `${head} · ${when}` };
}

export default function ScheduledReports() {
  const tick = useDataTick();
  const [list, setList] = useState(null);
  const [edit, setEdit] = useState(null);        // { report, existing } | { report } (new daily summary)
  const [test, setTest] = useState(null);        // schedule being previewed

  useEffect(() => { setList(getPrefs().schedules); }, [tick]);
  const now = tick ? clockNow() : 0;
  const preview = useMemo(() => (test ? buildMessage(test) : null), [test]);

  const toggle = (s) => {
    saveSchedule({ ...s, active: s.active === false });
    toast(s.active === false ? `${reportOf(s).title} will be sent again · next ${fmt(nextRun(s, clockNow()), 'datetime')}` : `${reportOf(s).title} paused`);
  };
  const remove = async (s) => {
    const ok = await confirmDialog({ title: 'Delete this schedule?', body: `${reportOf(s).title} will no longer be sent ${howOften(s).toLowerCase()} to ${s.address}.`, confirmLabel: 'Delete', tone: 'danger' });
    if (!ok) return;
    deleteSchedule(s.id);
    toast('Schedule deleted');
  };
  const sendTest = (s) => { setTest(s); toast('Test prepared · sending needs the shop’s server, so here is the message it would send', { tone: 'info' }); };
  const hasDaily = (list || []).some((s) => s.reportId === DAILY.id);

  const actions = (
    <>
      <Link href="/reports-centre" className="gc-btn gc-btn--neutral"><Icon name="file-bar-chart" width="18" height="18" aria-hidden="true" /> All reports</Link>
      <button type="button" className="gc-btn gc-btn--solid" onClick={() => setEdit({ report: hasDaily ? null : DAILY, choose: true })}><Icon name="plus" width="18" height="18" aria-hidden="true" /> New scheduled report</button>
    </>
  );

  return (
    <ReportsShell screen="ScheduledReports" crumb="Automation" active="auto-reports" page="Scheduled reports" title="Scheduled reports" about="Send any report automatically by WhatsApp or email every day, week or month, for example the daily summary to the manager at 8 PM." actions={actions} css={CSS}>
      <div className="sr-note" role="note">
        <Icon name="info" width="18" height="18" aria-hidden="true" />
        <span>Sending starts once the shop’s server is connected.</span>
      </div>

      {list && !list.length ? (
        <section className="gc-card">
          <EmptyState icon="calendar-clock" title="No reports scheduled yet" body="Pick a report, who gets it and when." actionLabel="New scheduled report" onAction={() => setEdit({ report: DAILY, choose: true })} />
        </section>
      ) : null}

      {list && list.length ? (
        <section className="gc-card" aria-label="Schedules" style={{ overflow: 'hidden' }}>
          <div className="rp-head">
            <div><h2>{list.length} schedule{list.length === 1 ? '' : 's'}</h2><p>{list.filter((s) => s.active !== false).length} on · {list.filter((s) => s.active === false).length} paused</p></div>
          </div>
          <div className="gc-table-wrap">
            <table className="gc-table sr-table">
              <thead><tr><th scope="col">Report</th><th scope="col">How often</th><th scope="col">Next</th><th scope="col">Send to</th><th scope="col">As</th><th scope="col">On</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {list.map((s) => {
                  const r = reportOf(s);
                  const on = s.active !== false;
                  return (
                    <tr key={s.id}>
                      <td>
                        <div className="sr-name">
                          <span className="rp-tile" aria-hidden="true"><Icon name={r.icon || 'file-bar-chart'} width="18" height="18" /></span>
                          <span style={{ minWidth: 0 }}><Link href={r.id === DAILY.id ? DAILY.href : r.kind === 'def' ? '/report' + (s.query && s.query.includes('id=') ? s.query : '?id=' + r.id) : r.href}>{r.title}</Link>{r.missing ? <small>This report is no longer available</small> : s.query && /[?&]f_/.test(s.query) ? <small>With the filters you chose</small> : null}</span>
                        </div>
                      </td>
                      <td data-label="How often"><span>{howOften(s)}<small className="sr-muted" style={{ display: 'block', fontSize: 'var(--text-xs)' }}>at {clock(s.time)}</small></span></td>
                      <td data-label="Next" className="sr-data">{on ? (now ? fmt(nextRun(s, now), 'datetime') : '') : <span className="gc-badge gc-badge--slate">Paused</span>}</td>
                      <td data-label="Send to"><span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name={s.to === 'email' ? 'mail' : 'message-circle'} width="16" height="16" aria-hidden="true" />{s.to === 'email' ? 'Email' : 'WhatsApp'}</span><small className="sr-muted sr-data" style={{ display: 'block', fontSize: 'var(--text-xs)' }}>{s.address}</small></span></td>
                      <td data-label="As">{FORMAT[s.format] || 'PDF'}</td>
                      <td data-label="On"><button type="button" role="switch" className="gc-switch" aria-checked={on} aria-label={`Send ${r.title}`} onClick={() => toggle(s)}><span className="gc-switch__knob" /></button></td>
                      <td>
                        <div className="sr-acts">
                          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => sendTest(s)}><Icon name="send" width="16" height="16" aria-hidden="true" /> Send a test now</button>
                          <button type="button" className="gc-iconbtn" aria-label={'Edit schedule for ' + r.title} onClick={() => setEdit({ report: { id: s.reportId, title: s.title || r.title }, existing: s })}><Icon name="pencil" width="18" height="18" aria-hidden="true" /></button>
                          <button type="button" className="gc-iconbtn" aria-label={'Delete schedule for ' + r.title} onClick={() => remove(s)}><Icon name="trash-2" width="18" height="18" aria-hidden="true" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {edit ? <ScheduleDialog report={edit.report} existing={edit.existing} choose={!!edit.choose} onClose={() => setEdit(null)} /> : null}

      <Dialog open={!!preview} title="Test message" onClose={() => setTest(null)} width={520}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={async () => { try { await navigator.clipboard.writeText(preview.body); toast('Message copied'); } catch { toast('Select the message to copy it', { tone: 'info' }); } }}><Icon name="copy" width="16" height="16" aria-hidden="true" /> Copy message</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={() => setTest(null)}>Done</button>
        </>}>
        {preview ? (
          <>
            <dl className="sr-meta">
              <dt>To</dt><dd>{test.to === 'email' ? 'Email' : 'WhatsApp'} · <span className="sr-data">{test.address}</span></dd>
              {test.to === 'email' ? <><dt>Subject</dt><dd>{preview.subject}</dd></> : null}
              <dt>Figures for</dt><dd>{preview.when}</dd>
            </dl>
            <pre className={'sr-msg' + (test.to === 'email' ? ' is-email' : '')}>{preview.body}</pre>
            <p className="gc-help" style={{ margin: 0 }}>Not sent: sending starts once the shop’s server is connected.</p>
          </>
        ) : null}
      </Dialog>
    </ReportsShell>
  );
}
