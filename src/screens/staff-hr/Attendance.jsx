'use client';
// Attendance — punches from the fingerprint device, POS log-in and the staff app, one record per
// person per day (src/lib/hr.js). Fix or add a day by hand, accept staff fix requests, and see the
// month register. The register feeds Payroll: absences, unpaid leave and lates become cuts, overtime is paid.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog } from '@/components/ui';
import {
  todayKey, addDays, dayLabel, dowOf, WEEKDAYS, keysOf, monthOf, addMonths, monthLabel, cellOf, monthSummary, dayPlan,
  shiftBy, lateFor, toMin, t12, hm, saveAttendance, bulkAttendance, decideFix, staffBy, ATT_CODES, HR_PLACES, leaveType,
} from '@/lib/hr';
import { HrPage, useHr, Person, ShiftChip } from './hrShared';

const CSS = `
.at-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3)}
.at-nav{display:inline-flex;align-items:center;gap:var(--space-1);padding:3px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card)}
.at-nav span{min-width:190px;text-align:center;font-weight:var(--weight-semibold);color:var(--text-heading);font-size:var(--text-sm)}
.at-place{width:auto;min-width:200px;margin-left:auto}
.at-day{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,320px)}
.at-side{border-left:1px solid var(--border-subtle);padding:var(--space-4) var(--space-5);display:flex;flex-direction:column;gap:var(--space-3);background:var(--surface-quiet)}
.at-side h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.at-fix{padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);display:flex;flex-direction:column;gap:6px;font-size:var(--text-xs)}
.at-fix b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.at-rules{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px;font-size:var(--text-xs);color:var(--text-body)}
.at-reg{border-collapse:collapse;font-size:var(--text-xs)}
.at-reg th,.at-reg td{border-bottom:1px solid var(--border-subtle)}
.at-reg th{padding:8px 0;font-weight:var(--weight-medium);color:var(--text-muted);text-align:center;min-width:30px}
.at-reg th.is-today{color:var(--primary)}
.at-reg .at-name{position:sticky;left:0;z-index:1;background:var(--surface-card);text-align:left;padding:6px var(--space-4);white-space:nowrap;font-weight:var(--weight-medium);color:var(--text-heading);min-width:160px}
.at-reg td{padding:3px 2px;text-align:center}
.at-cell{display:inline-flex;width:26px;height:26px;align-items:center;justify-content:center;border:0;border-radius:var(--radius-md);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);cursor:pointer;padding:0}
.at-cell:focus-visible{outline:2px solid var(--primary);outline-offset:1px}
.at-cell--q{border:1px dashed var(--text-warning)}
.at-tot{padding:6px 10px!important;text-align:right!important;font-variant-numeric:tabular-nums;white-space:nowrap}
.at-legend{display:flex;flex-wrap:wrap;gap:var(--space-3);padding:var(--space-3) var(--space-5);border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-body)}
.at-legend span{display:inline-flex;align-items:center;gap:6px}
.at-legend i{display:inline-flex;width:18px;height:18px;border-radius:var(--radius-sm);align-items:center;justify-content:center;font-style:normal;font-size:var(--text-2xs);font-weight:var(--weight-medium)}
.at-pick{max-height:260px;overflow:auto;display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
@media (max-width:1023px){.at-day{grid-template-columns:minmax(0,1fr)}.at-side{border-left:0;border-top:1px solid var(--border-subtle)}}
@media (max-width:640px){.at-place{margin-left:0;width:100%}.at-nav span{min-width:0}}
@media (max-width:640px){
  /* page title + "More" + main button share one row: the title keeps whole words (never split mid-word),
     the main button is a little narrower; if they still do not fit, the row wraps */
  [data-screen="Attendance"] .gc-shell__content .gc-pagehead>.gc-pagehead__text{flex-basis:0!important;min-width:min-content!important}
  [data-screen="Attendance"] .gc-pagehead__actions .gc-btn--solid{padding:0 var(--space-3)}
}
@media print{
  body *{visibility:hidden}
  .at-print,.at-print *{visibility:visible}
  .at-print{position:absolute;left:0;top:0;width:100%}
  .at-print .gc-table-wrap{overflow:visible}
  .at-noprint{display:none!important}
}
`;
const DAY_STATUS = { P: ['Present', 'success'], L: ['Late', 'warning'], A: ['Absent', 'error'], HD: ['Half day', 'warning'], V: ['On leave', 'info'], U: ['Unpaid leave', 'slate'], W: ['Weekly off', 'slate'], H: ['Holiday', 'secondary'], S: ['Suspended', 'error'], '?': ['Not marked', 'warning'], wait: ['Not in yet', 'slate'], '·': ['—', 'slate'] };

export default function Attendance() {
  const { S, ready } = useHr();
  const today = todayKey(S);
  const [day, setDay] = useState(null);
  const [view, setView] = useState('day');
  const [month, setMonth] = useState(null);
  const [place, setPlace] = useState('');
  const [edit, setEdit] = useState(null);   // { code, key, s, in, out, ot }
  const [bulk, setBulk] = useState(null);   // { key, codes, mode }
  useEffect(() => { const v = new URLSearchParams(window.location.search).get('view'); if (v === 'month') setView('month'); }, []);
  const key = day || today;
  const mon = month || monthOf(today);
  const staff = S.staff.filter((st) => st.status !== 'left' && (!place || st.branch === place));

  const rows = staff.map((st) => ({ st, c: cellOf(S, st.code, key) }));
  const count = (codes) => rows.filter((r) => codes.includes(r.c.code)).length;
  const otToday = rows.reduce((a, r) => a + ((r.c.rec && r.c.rec.ot) || 0), 0);
  const monthStats = useMemo(() => {
    let present = 0, late = 0;
    staff.forEach((st) => { const m = monthSummary(S, st.code, monthOf(today)); present += m.present; late += m.late; });
    return present ? Math.round((present - late) / present * 100) : 100;
  }, [S, staff, today]);
  const fixes = S.fixes.filter((f) => f.status === 'wait' && (!place || (staffBy(S, f.code) || {}).branch === place));

  const openEdit = (code, k) => {
    const st = staffBy(S, code), c = cellOf(S, code, k), p = dayPlan(S, st, k), sh = shiftBy(S, p.shifts[0] || st.shift);
    const r = c.rec;
    setEdit({ code, key: k, s: r ? r.s : 'P', in: r ? r.in || '' : sh ? sh.start : '09:00', out: r ? r.out || '' : '', ot: r ? String(r.ot || 0) : '0', had: !!r });
  };
  const saveEdit = (e) => {
    e.preventDefault();
    const st = staffBy(S, edit.code), p = dayPlan(S, st, edit.key), sh = shiftBy(S, p.shifts[0] || st.shift);
    if (edit.key > today) { toast('That day has not come yet', { tone: 'error' }); return; }
    if (edit.s !== 'A' && !edit.in) { toast('Enter the time they came in', { tone: 'error' }); return; }
    const rec = edit.s === 'A' ? { s: 'A', src: 'Manual · Owner' } : { s: edit.s, in: edit.in, out: edit.out, late: lateFor(sh, edit.in), ot: Math.max(0, Math.round(Number(edit.ot) || 0)), src: 'Manual · Owner' };
    saveAttendance(edit.key, edit.code, rec);
    toast(`${st.name} · ${dayLabel(edit.key)}: ${edit.s === 'A' ? 'absent' : edit.s === 'HD' ? 'half day' : rec.late ? `in ${t12(edit.in)}, ${rec.late} min late` : `present from ${t12(edit.in)}`}. Saved in the activity log.`);
    setEdit(null);
  };
  const suggestOt = () => {
    const st = staffBy(S, edit.code), p = dayPlan(S, st, edit.key), sh = shiftBy(S, p.shifts[0] || st.shift);
    if (!sh || !edit.out) return;
    let d = toMin(edit.out) - toMin(sh.end);
    if (d < -720) d += 1440;
    setEdit({ ...edit, ot: String(Math.max(0, d)) });
  };
  const openBulk = () => {
    const k = key <= today ? key : today;
    setBulk({ key: k, mode: 'P', codes: S.staff.filter((st) => dayPlan(S, st, k).kind === 'work' && !((S.att[k] || {})[st.code])).map((st) => st.code) });
  };
  const saveBulk = (e) => {
    e.preventDefault();
    if (!bulk.codes.length) { toast('Tick at least one person', { tone: 'error' }); return; }
    bulkAttendance(bulk.key, bulk.codes, (st) => {
      if (bulk.mode === 'A') return { s: 'A', src: 'Bulk · Owner' };
      const p = dayPlan(S, st, bulk.key), sh = shiftBy(S, p.shifts[0] || st.shift);
      return { s: 'P', in: sh ? sh.start : '09:00', out: sh ? sh.end : '', late: 0, ot: 0, src: 'Bulk · Owner' };
    });
    toast(`${bulk.codes.length} staff marked ${bulk.mode === 'A' ? 'absent' : 'present at their shift times'} on ${dayLabel(bulk.key)}.`);
    setBulk(null);
  };
  const worked = (r) => {
    if (!r || !r.in) return '—';
    let end = r.out ? toMin(r.out) : key === today && ready ? new Date(S.now).getHours() * 60 + new Date(S.now).getMinutes() : null;
    if (end == null) return '—';
    let d = end - toMin(r.in);
    if (d < 0) d += 1440;
    return hm(d);
  };
  const set = S.settings;

  return (
    <HrPage screen="Attendance" active="hr-attendance" page="Attendance" title="Attendance" css={CSS}
      description="Punches come in from the fingerprint device, POS log-in and the staff app. Fix anything wrong here — every change is logged and flows into payroll."
      actions={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={openBulk}><Icon name="list-checks" width="18" height="18" aria-hidden="true" /> Bulk entry</button>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => toast('The ZKTeco devices sync by themselves every few minutes. A CSV import from the device is not in the demo yet.', { tone: 'info' })}><Icon name="fingerprint" width="18" height="18" aria-hidden="true" /> Import from device</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={() => openEdit(staff[0].code, key <= today ? key : today)}><Icon name="plus" width="18" height="18" aria-hidden="true" /> Add attendance</button>
      </>}>

      <div className="at-tools">
        {view === 'day' ? (
          <div className="at-nav">
            <button type="button" className="gc-iconbtn" aria-label="Previous day" onClick={() => setDay(addDays(key, -1))}><Icon name="chevron-left" width="18" height="18" /></button>
            <span>{key === today ? 'Today · ' : ''}{WEEKDAYS[dowOf(key)]} {dayLabel(key, true)}</span>
            <button type="button" className="gc-iconbtn" aria-label="Next day" disabled={key >= today} onClick={() => setDay(addDays(key, 1))}><Icon name="chevron-right" width="18" height="18" /></button>
          </div>
        ) : (
          <div className="at-nav">
            <button type="button" className="gc-iconbtn" aria-label="Previous month" onClick={() => setMonth(addMonths(mon, -1))}><Icon name="chevron-left" width="18" height="18" /></button>
            <span>{monthLabel(mon)}</span>
            <button type="button" className="gc-iconbtn" aria-label="Next month" disabled={mon >= monthOf(today)} onClick={() => setMonth(addMonths(mon, 1))}><Icon name="chevron-right" width="18" height="18" /></button>
          </div>
        )}
        <div className="hr-seg" role="group" aria-label="View">
          <button type="button" aria-pressed={view === 'day'} onClick={() => setView('day')}>Day</button>
          <button type="button" aria-pressed={view === 'month'} onClick={() => setView('month')}>Month register</button>
        </div>
        <select className="gc-input gc-select at-place" aria-label="Location" value={place} onChange={(e) => setPlace(e.target.value)}>
          <option value="">All locations</option>
          {HR_PLACES.filter((p) => S.staff.some((s) => s.branch === p)).map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      <div className="gc-kpis gc-kpis--tight">
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-success-soft)', color: 'var(--text-success)' }}><Icon name="user-check" width="20" height="20" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Present</p><p className="gc-kpi__value">{count(['P', 'L', 'HD'])}</p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-warning-soft)', color: 'var(--text-warning)' }}><Icon name="alarm-clock" width="20" height="20" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Late</p><p className="gc-kpi__value">{count(['L'])}</p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-info-soft)', color: 'var(--text-info)' }}><Icon name="plane" width="20" height="20" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">On leave</p><p className="gc-kpi__value">{count(['V', 'U'])}</p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-error-soft)', color: 'var(--text-danger)' }}><Icon name="user-x" width="20" height="20" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Absent</p><p className="gc-kpi__value">{count(['A'])}<small>{count(['?']) ? `${count(['?'])} not marked` : ''}</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="timer" width="20" height="20" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Overtime</p><p className="gc-kpi__value">{otToday ? hm(otToday) : '—'}</p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-success-soft)', color: 'var(--text-success)' }}><Icon name="badge-check" width="20" height="20" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">On time this month</p><p className="gc-kpi__value">{monthStats}%</p></div></div>
      </div>

      {view === 'day' ? (
        <section className="gc-card hr-card at-day">
          <div className="gc-table-wrap">
            <table className="gc-table gc-table--compact gc-table--hoverable">
              <thead><tr><th scope="col">Staff</th><th scope="col">Shift</th><th scope="col">In</th><th scope="col">Out</th><th scope="col">Worked</th><th scope="col">Late</th><th scope="col">Overtime</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {rows.map(({ st, c }) => {
                  const r = c.rec, [label, tone] = DAY_STATUS[c.code] || DAY_STATUS['·'];
                  return (
                    <tr key={st.code}>
                      <td><Person st={st} sub={st.branch} /></td>
                      <td>{c.plan.kind === 'work' ? c.plan.shifts.map((id) => <ShiftChip key={id} S={S} id={id} />) : c.plan.kind === 'leave' ? <span className="hr-sub">{leaveType(S, c.plan.leave.type).name} leave</span> : c.plan.kind === 'holiday' ? <span className="hr-sub">{c.plan.holiday}</span> : <span className="hr-sub">{c.plan.kind === 'off' ? 'Weekly off' : '—'}</span>}</td>
                      <td className="hr-fig hr-strong">{r && r.in ? t12(r.in) : '—'}</td>
                      <td className="hr-fig">{r && r.in ? (r.out ? t12(r.out) : <span className="hr-sub">{key === today ? 'still in' : 'no punch'}</span>) : '—'}</td>
                      <td className="hr-fig">{worked(r)}</td>
                      <td className={'hr-fig' + (r && r.late ? ' hr-warn' : '')}>{r && r.late ? `${r.late} min` : '—'}</td>
                      <td className="hr-fig">{r && r.ot ? hm(r.ot) : '—'}</td>
                      <td><span className={'gc-badge gc-badge--' + tone}>{label}</span>{r && r.src ? <span className="hr-sub">{r.src}</span> : null}</td>
                      <td><div className="hr-actions">{c.plan.kind !== 'suspended' && c.plan.kind !== 'none' ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => openEdit(st.code, key)} aria-label={`${r ? 'Fix' : 'Mark'} ${st.name} on ${dayLabel(key)}`}>{r ? 'Fix' : 'Mark'}</button> : null}</div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <aside className="at-side">
            <h2>Fix requests <span className="hr-sub" style={{ display: 'inline' }}>· {fixes.length}</span></h2>
            {fixes.length ? fixes.map((f) => {
              const st = staffBy(S, f.code);
              return (
                <div key={f.id} className="at-fix">
                  <b>{st.name} · {WEEKDAYS[dowOf(f.key)]} {dayLabel(f.key)}</b>
                  <span>{f.text}</span>
                  <div className="hr-actions" style={{ justifyContent: 'flex-start' }}>
                    <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => { decideFix(f.id, false); toast(`Rejected — ${st.name} is told by SMS.`, { tone: 'info' }); }}>Reject</button>
                    <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => { decideFix(f.id, true); toast(`Accepted — ${st.name}’s ${dayLabel(f.key)} is updated.`); }}>Accept</button>
                  </div>
                </div>
              );
            }) : <p className="hr-sub" style={{ margin: 0 }}>No fix requests waiting.</p>}
            <h2 style={{ marginTop: 'var(--space-2)' }}>Rules in use</h2>
            <ul className="at-rules">
              <li>Grace time is set per shift ({S.shifts.map((s) => `${s.name} ${s.graceMin} min`).join(', ')})</li>
              <li>{set.lateRule === 'days' ? `${set.latesPerCut} lates in a month = 1 day’s pay cut` : set.lateRule === 'minutes' ? 'Pay is cut for every minute late' : 'Lates are shown, not cut'}</li>
              <li>Under {set.halfDayHours} hours worked = half day</li>
              <li>{set.otRate ? `Overtime paid at ${set.otRate}× the hourly rate` : 'No overtime paid'}</li>
              <li>Weekly off: {set.weeklyOff.map((d) => WEEKDAYS[d]).join(', ') || 'by roster'}</li>
            </ul>
            <Link href="/hr-setup?sec=att" className="hr-link">Change rules in HR setup</Link>
          </aside>
        </section>
      ) : (
        <section className="gc-card hr-card at-print">
          <div className="hr-head">
            <div><h2>Attendance register · {monthLabel(mon)}</h2><p>Click a day to fix it. Absences, unpaid leave and every {set.latesPerCut} lates are cut in payroll.</p></div>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral at-noprint" onClick={() => window.print()}><Icon name="printer" width="14" height="14" aria-hidden="true" /> Print register</button>
          </div>
          <div className="gc-table-wrap">
            <table className="at-reg">
              <thead><tr>
                <th scope="col" className="at-name">Staff</th>
                {keysOf(mon).map((k) => <th key={k} scope="col" className={k === today ? 'is-today' : ''}>{Number(k.slice(8))}<div style={{ fontSize: 'var(--text-2xs)' }}>{WEEKDAYS[dowOf(k)].charAt(0)}</div></th>)}
                <th scope="col" className="at-tot">P</th><th scope="col" className="at-tot">L</th><th scope="col" className="at-tot">A</th><th scope="col" className="at-tot">Lv</th><th scope="col" className="at-tot">OT</th>
              </tr></thead>
              <tbody>
                {staff.map((st) => {
                  const m = monthSummary(S, st.code, mon);
                  return (
                    <tr key={st.code}>
                      <th scope="row" className="at-name">{st.name}</th>
                      {keysOf(mon).map((k) => {
                        const c = cellOf(S, st.code, k), [label, bg, fg, txt] = ATT_CODES[c.code] || ATT_CODES['·'];
                        const can = k <= today && c.plan.kind !== 'none' && c.plan.kind !== 'suspended';
                        return <td key={k}><button type="button" className={'at-cell' + (c.code === '?' ? ' at-cell--q' : '')} style={{ background: c.code === 'P' ? 'var(--fill-success-soft)' : bg, color: fg, cursor: can ? 'pointer' : 'default' }} title={`${st.name} · ${dayLabel(k)} · ${label}`} aria-label={`${st.name}, ${dayLabel(k)}: ${label}`} onClick={() => (can ? openEdit(st.code, k) : toast(k > today ? 'That day has not come yet.' : 'Nothing to mark on this day.', { tone: 'info' }))}>{txt}</button></td>;
                      })}
                      <td className="at-tot hr-in">{m.present}</td><td className="at-tot hr-warn">{m.late}</td><td className="at-tot hr-out">{m.absent}</td><td className="at-tot">{m.paidLeave + m.unpaidLeave}</td><td className="at-tot">{m.otMin ? hm(m.otMin) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="at-legend">
            {['P', 'L', 'A', 'HD', 'V', 'U', 'W', 'H', 'S', '?'].map((c) => { const [l, bg, fg, t] = ATT_CODES[c]; return <span key={c}><i style={{ background: c === 'P' ? 'var(--fill-success-soft)' : bg, color: fg, border: c === '?' ? '1px dashed var(--text-warning)' : 0 }}>{t}</i>{l}</span>; })}
          </div>
        </section>
      )}

      <Dialog open={!!edit} title={edit && edit.had ? 'Fix attendance' : 'Add attendance'} onClose={() => setEdit(null)} width={560}
        footer={<>{edit && edit.had ? <button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={() => { saveAttendance(edit.key, edit.code, null); toast('Record removed. The day shows from the roster again.', { tone: 'info' }); setEdit(null); }}>Remove record</button> : null}<button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit(null)}>Cancel</button><button type="submit" form="at-edit" className="gc-btn gc-btn--solid">Save</button></>}>
        {edit ? (() => {
          const st = staffBy(S, edit.code), p = dayPlan(S, st, edit.key), sh = shiftBy(S, p.shifts[0] || st.shift), late = edit.s !== 'A' ? lateFor(sh, edit.in) : 0;
          return (
            <form id="at-edit" className="hr-form" onSubmit={saveEdit}>
              <div className="hr-two">
                <div><label className="gc-label" htmlFor="at-staff">Staff</label><select id="at-staff" className="gc-input gc-select" value={edit.code} disabled={edit.had} onChange={(e) => openEdit(e.target.value, edit.key)}>{S.staff.filter((s) => s.status !== 'left').map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}</select></div>
                <div><label className="gc-label" htmlFor="at-date">Date</label><input id="at-date" type="date" className="gc-input" value={edit.key} max={today} disabled={edit.had} onChange={(e) => e.target.value && openEdit(edit.code, e.target.value)} /></div>
              </div>
              <p className="gc-help" style={{ margin: 0 }}>{p.kind === 'work' ? `On ${sh ? `${sh.name} · ${t12(sh.start)}–${t12(sh.end)}, grace ${sh.graceMin} min` : 'no shift'}.` : p.kind === 'leave' ? `On ${leaveType(S, p.leave.type).name.toLowerCase()} leave that day — a record here overrides it.` : p.kind === 'holiday' ? `${p.holiday} (holiday) — worked anyway?` : p.kind === 'off' ? 'Weekly off — worked anyway?' : ''}</p>
              <div className="hr-seg" role="group" aria-label="Status">
                {[['P', 'Present'], ['HD', 'Half day'], ['A', 'Absent']].map(([k, l]) => <button key={k} type="button" aria-pressed={edit.s === k} onClick={() => setEdit({ ...edit, s: k })}>{l}</button>)}
              </div>
              {edit.s !== 'A' ? (
                <>
                  <div className="hr-three">
                    <div><label className="gc-label" htmlFor="at-in">In</label><input id="at-in" type="time" className="gc-input" value={edit.in} onChange={(e) => setEdit({ ...edit, in: e.target.value })} data-autofocus /></div>
                    <div><label className="gc-label" htmlFor="at-out">Out</label><input id="at-out" type="time" className="gc-input" value={edit.out} onChange={(e) => setEdit({ ...edit, out: e.target.value })} onBlur={suggestOt} /></div>
                    <div><label className="gc-label" htmlFor="at-ot">Overtime (min)</label><input id="at-ot" className="gc-input hr-fig" inputMode="numeric" value={edit.ot} onChange={(e) => setEdit({ ...edit, ot: e.target.value.replace(/[^\d]/g, '') })} /></div>
                  </div>
                  <div className={'hr-note ' + (late ? 'hr-note--warn' : 'hr-note--ok')}><Icon name={late ? 'alarm-clock' : 'circle-check'} width="16" height="16" aria-hidden="true" /><span>{late ? <><b>{late} min late.</b> Counts toward the {set.latesPerCut}-lates rule in payroll.</> : 'On time.'}{Number(edit.ot) ? ` ${hm(Number(edit.ot))} overtime is paid in payroll.` : ''}</span></div>
                </>
              ) : <div className="hr-note hr-note--warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>An absent day is cut from salary (gross ÷ 30).</span></div>}
            </form>
          );
        })() : null}
      </Dialog>

      <Dialog open={!!bulk} title="Bulk entry" onClose={() => setBulk(null)} width={560}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setBulk(null)}>Cancel</button><button type="submit" form="at-bulk" className="gc-btn gc-btn--solid">Mark {bulk ? bulk.codes.length : 0} staff</button></>}>
        {bulk ? (
          <form id="at-bulk" className="hr-form" onSubmit={saveBulk}>
            <div className="hr-two">
              <div><label className="gc-label" htmlFor="bk-date">Date</label><input id="bk-date" type="date" className="gc-input" value={bulk.key} max={today} onChange={(e) => e.target.value && setBulk({ ...bulk, key: e.target.value, codes: S.staff.filter((st) => dayPlan(S, st, e.target.value).kind === 'work' && !((S.att[e.target.value] || {})[st.code])).map((st) => st.code) })} /></div>
              <div><span className="gc-label">Mark as</span><div className="hr-seg" role="group" aria-label="Mark as"><button type="button" aria-pressed={bulk.mode === 'P'} onClick={() => setBulk({ ...bulk, mode: 'P' })}>Present at shift times</button><button type="button" aria-pressed={bulk.mode === 'A'} onClick={() => setBulk({ ...bulk, mode: 'A' })}>Absent</button></div></div>
            </div>
            <div className="at-pick">
              {S.staff.filter((st) => st.status !== 'left').map((st) => {
                const p = dayPlan(S, st, bulk.key), has = (S.att[bulk.key] || {})[st.code];
                return <label key={st.code} className="hr-check"><input type="checkbox" checked={bulk.codes.includes(st.code)} onChange={() => setBulk({ ...bulk, codes: bulk.codes.includes(st.code) ? bulk.codes.filter((c) => c !== st.code) : [...bulk.codes, st.code] })} />{st.name}<span className="hr-sub" style={{ display: 'inline' }}>· {p.kind === 'work' ? (shiftBy(S, p.shifts[0]) || {}).name : p.kind}{has ? ' · already marked (replaced)' : ''}</span></label>;
              })}
            </div>
          </form>
        ) : null}
      </Dialog>
    </HrPage>
  );
}
