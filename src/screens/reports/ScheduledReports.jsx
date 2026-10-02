'use client';
// ScheduledReports — every report set to go out by WhatsApp or email (/scheduled-reports), as a Shopify list:
//   On / Paused views, then one row per schedule (report · how often · next run · send to · format · on/off).
//   A row opens the schedule (Edit); its ⋯ menu has "Send a test now", which shows the message that would go out
//   with the report's key figures for the last full period (yesterday, last week or last month), Edit and Delete.
// Front end only: schedules live in this browser (src/lib/reports/prefs.js); sending needs the server.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Dialog, EmptyState, StatusBadge } from '@/components/ui';
import { IndexTabs, LearnMore, Menu } from '@/components/ui/IndexKit';
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
.sr-name{display:block;max-width:300px;overflow:hidden;text-overflow:ellipsis}
.sr-to{display:inline-flex;align-items:center;gap:6px;max-width:240px}
.sr-to>svg{flex:none;color:var(--text-muted)}
.sr-to>span{min-width:0;overflow:hidden;text-overflow:ellipsis;font-family:var(--font-data)}
.sr-table td.sr-act{width:1%;padding-left:0}
.sr-pli{display:flex;align-items:center;gap:4px;padding-right:8px;border-bottom:1px solid var(--border-subtle)}
.sr-pli:last-child{border-bottom:0}
.sr-pli>.ix-pitem{flex:1;min-width:0;border-bottom:0}
.sr-msg{margin:0;padding:var(--space-4);border-radius:var(--radius-xl);background:var(--fill-success-soft);color:var(--text-heading);font-family:var(--font-sans);font-size:var(--text-sm);line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere}
.sr-msg.is-email{background:var(--surface-subtle);border:1px solid var(--border-subtle)}
.sr-meta{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px var(--space-3);margin:0;font-size:var(--text-xs)}
.sr-meta dt{color:var(--text-muted)}
.sr-meta dd{margin:0;color:var(--text-heading);overflow-wrap:anywhere}
.sr-data{font-family:var(--font-data)}
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
  const [view, setView] = useState('all');       // all | on | paused

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

  const all = list || [];
  const onCount = all.filter((s) => s.active !== false).length;
  const rows = all.filter((s) => (view === 'on' ? s.active !== false : view === 'paused' ? s.active === false : true));
  const tabs = [['all', 'All', all.length], ['on', 'On', onCount], ['paused', 'Paused', all.length - onCount]]
    .map(([key, label, count]) => ({ key, label, count, id: 'sr-tab-' + key, on: view === key, onClick: () => setView(key) }));
  const hrefOf = (s, r) => (r.id === DAILY.id ? DAILY.href : r.kind === 'def' ? '/report' + (s.query && s.query.includes('id=') ? s.query : '?id=' + r.id) : r.href);
  const editOf = (s, r) => () => setEdit({ report: { id: s.reportId, title: s.title || r.title }, existing: s });
  const menuOf = (s, r) => [
    { label: 'Send a test now', icon: 'send', onClick: () => sendTest(s) },
    { label: 'Edit', icon: 'pencil', onClick: editOf(s, r) },
    { label: s.active === false ? 'Turn on' : 'Pause', icon: s.active === false ? 'play' : 'pause', onClick: () => toggle(s) },
    { label: 'Delete', icon: 'trash-2', onClick: () => remove(s), tone: 'danger' },
  ];

  return (
    <ReportsShell screen="ScheduledReports" crumb="Automation" active="auto-reports" page="Scheduled reports" css={CSS}
      icon="calendar-clock" title="Scheduled reports"
      about="Send any report automatically by WhatsApp or email every day, week or month, for example the daily summary to the manager at 8 PM. Sending starts once the shop’s server is connected."
      more={[{ label: 'All reports', href: '/reports-centre' }, { label: 'Daily summary', href: '/daily-summary' }]}
      primary={{ label: 'New scheduled report', onClick: () => setEdit({ report: hasDaily ? null : DAILY, choose: true }) }}>
      <section className="ix-card" aria-label="Schedules">
        {all.length ? <div className="ix-bar"><IndexTabs tabs={tabs} label="Schedules" /></div> : null}
        {list && !all.length ? (
          <div className="ix-empty"><EmptyState icon="calendar-clock" title="No reports scheduled yet" actionLabel="New scheduled report" onAction={() => setEdit({ report: DAILY, choose: true })} /></div>
        ) : null}
        {all.length && !rows.length ? <div className="ix-empty"><EmptyState icon="calendar-clock" title={view === 'paused' ? 'No paused schedules' : 'No schedules are on'} actionLabel="Show all" onAction={() => setView('all')} /></div> : null}
        {rows.length ? (<>
          <ul className="ix-plist" aria-label="Schedules">
            {rows.map((s) => {
              const r = reportOf(s);
              const on = s.active !== false;
              return (
                <li key={s.id} className="sr-pli">
                  <button type="button" className="ix-pitem" onClick={editOf(s, r)}>
                    <span className="ix-pitem__top"><b>{r.title}</b><StatusBadge tone={on ? 'success' : 'neutral'}>{on ? 'On' : 'Paused'}</StatusBadge></span>
                    <span className="ix-pitem__mid">{howOften(s)} at {clock(s.time)} · {s.address}</span>
                  </button>
                  <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--icon ix-btn--plain" items={menuOf(s, r)} />
                </li>
              );
            })}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table gc-table--keep sr-table">
              <caption className="sr-only">Schedules</caption>
              <thead><tr><th scope="col">Report</th><th scope="col">How often</th><th scope="col">Next</th><th scope="col">Send to</th><th scope="col">As</th><th scope="col">On</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {rows.map((s) => {
                  const r = reportOf(s);
                  const on = s.active !== false;
                  return (
                    <tr key={s.id} onClick={(e) => { if (e.target.closest('a,button,input,label,.ix-menu')) return; editOf(s, r)(); }}>
                      <td>
                        <Link href={hrefOf(s, r)} className="ix-strong sr-name" title={r.missing ? 'This report is no longer available' : s.query && /[?&]f_/.test(s.query) ? 'With the filters you chose' : undefined}>{r.title}</Link>
                      </td>
                      <td>{howOften(s)} <span className="ix-muted">at {clock(s.time)}</span></td>
                      <td className="ix-muted sr-data">{on ? (now ? fmt(nextRun(s, now), 'datetime') : '') : <StatusBadge tone="neutral">Paused</StatusBadge>}</td>
                      <td><span className="sr-to" title={s.to === 'email' ? 'Email' : 'WhatsApp'}><Icon name={s.to === 'email' ? 'mail' : 'message-circle'} width="16" height="16" aria-hidden="true" /><span>{s.address}</span></span></td>
                      <td className="ix-muted">{FORMAT[s.format] || 'PDF'}</td>
                      <td><button type="button" role="switch" className="gc-switch" aria-checked={on} aria-label={`Send ${r.title}`} onClick={() => toggle(s)}><span className="gc-switch__knob" /></button></td>
                      <td className="sr-act"><Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={menuOf(s, r)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="ix-foot"><span>{onCount} on · {all.length - onCount} paused</span></div>
        </>) : null}
      </section>
      <LearnMore topic="scheduled reports" />

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
