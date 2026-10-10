'use client';
// Attendance (/admin/attendance) — GridCommerce staff attendance, copied from the merchant panel's staff-hr/
// Attendance.jsx without the device integration: punches come from the office card reader and the staff app (remote
// days). Office 09:00–18:00, late after 09:30, weekend Friday and Saturday. Views: Today (the board, missing
// punch-outs grouped) · Monthly (people × days, scrolls in its box; a cell corrects the day) · Late entries ·
// Absences · Summary per person · Fix requests (open the review drawer). Data: lib/admin/people.js (cellOf,
// todayBoard, personMonth, attendanceRows, setPunch, decideFix via ReviewDrawer). ?tab= and ?month= stay in the address.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState, InfoTip } from '@/components/ui';
import { ShopHeader, IndexTabs, MetricStrip } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { dmy } from '@/lib/platform/util';
import {
  empBy, current, ATT, OFFICE, REQ_STATUS, cellOf, todayBoard, personMonth, attendanceRows, attendancePeriods, setPunch, keyOf, dayLong, dayLabel,
  periodOfKey, periodLabel, daysOfPeriod, dowOf, isWorkday, tm, WEEKDAYS, HOLIDAYS,
} from '@/lib/admin/people';
import { AdminShell } from '../AdminShell';
import { ReviewDrawer } from './ReviewDrawer';
import { PEOPLE_CSS, usePeople, meName, plural, Person, Skeleton, rowGo, setParam, Field, ctl } from './peopleShared';

const CSS = `
.at-reg{border-collapse:separate;border-spacing:0;font-size:var(--text-xs)}
.at-reg th,.at-reg td{border-bottom:1px solid var(--border-subtle)}
.at-reg th{height:36px;min-width:30px;padding:2px 0;background:var(--surface-subtle);font-weight:var(--weight-medium);color:var(--text-muted);text-align:center}
.at-reg th small{display:block;font-size:var(--text-2xs);font-weight:var(--weight-regular)}
.at-reg th.is-today{color:var(--primary)}
.at-reg .at-name{position:sticky;left:0;z-index:1;min-width:160px;padding:4px var(--space-3);background:var(--surface-card);text-align:left;white-space:nowrap;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.at-reg thead .at-name{background:var(--surface-subtle);font-size:var(--text-xs)}
.at-reg td{padding:2px;text-align:center}
.at-reg tbody tr{cursor:default}
.at-cell{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;border:0;border-radius:var(--radius-md);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);cursor:pointer}
.at-cell:disabled{cursor:default}
.at-cell:focus-visible{outline:2px solid var(--primary);outline-offset:1px}
.at-cell--miss{outline:1px dashed var(--text-warning);outline-offset:-1px}
.at-tot{padding:4px 8px!important;text-align:right!important;font-variant-numeric:tabular-nums;white-space:nowrap}
.at-day{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:10px 12px;border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm)}
.at-day b{font-weight:var(--weight-semibold);color:var(--text-heading)}
.at-urgent{border-bottom:1px solid var(--border-subtle)}
.at-urgent h3{margin:0;padding:10px 12px 0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted)}
.at-urow{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:44px;padding:6px 12px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.at-urow:first-of-type{border-top:0}
.at-urow>span{min-width:0}
@media (max-width:640px){.at-reg .at-name{min-width:120px}}
`;
const TONE = {
  present: ['var(--fill-success-soft)', 'var(--text-success)'], late: ['var(--fill-warning-soft)', 'var(--text-warning)'], absent: ['var(--fill-error-soft)', 'var(--text-danger)'],
  leave: ['var(--fill-primary-soft)', 'var(--primary)'], remote: ['var(--fill-info-soft)', 'var(--text-info)'], notin: ['var(--surface-subtle)', 'var(--text-muted)'],
  holiday: ['var(--surface-subtle)', 'var(--text-muted)'], off: ['transparent', 'var(--text-muted)'],
};
const TABS = [['today', 'Today'], ['month', 'Monthly'], ['late', 'Late entries'], ['absent', 'Absences'], ['summary', 'Summary'], ['fixes', 'Fix requests']];
const ORDER = ['absent', 'late', 'notin', 'remote', 'present', 'leave'];
const badgeTone = { present: 'success', late: 'warning', absent: 'error', leave: 'primary', remote: 'neutral', notin: 'neutral' };

function Code({ s }) {
  const [bg, fg] = TONE[s] || TONE.notin;
  return <span className="pp-chip" style={{ background: bg, color: fg }}>{ATT[s].label}</span>;
}

export default function Attendance() {
  const { D, t, live } = usePeople();
  const [tab, setTab] = useState('today');
  const [month, setMonth] = useState(null);
  const [review, setReview] = useState(null);
  const [edit, setEdit] = useState(null);       // { emp, key, in, out, remote, error }
  const [allMissing, setAllMissing] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (TABS.some(([k]) => k === p.get('tab'))) setTab(p.get('tab'));
    if (/^\d{4}-\d{2}$/.test(p.get('month') || '')) setMonth(p.get('month'));
    if (p.get('fix')) setReview({ kind: 'fix', id: p.get('fix') });
  }, []);
  const go = (k) => { setTab(k); setParam('tab', k === 'today' ? '' : k); };
  const periods = live ? attendancePeriods(D, t) : [];
  const mon = month && periods.includes(month) ? month : periods[0] || periodOfKey(keyOf(t));
  const pickMonth = (p) => { setMonth(p); setParam('month', p); };

  const today = keyOf(t);
  const board = live ? todayBoard(D, t) : null;
  const waitingFixes = D.fixes.filter((f) => f.status === 'wait');
  const name = (id) => (empBy(D, id) || { name: id }).name;

  const openEdit = (emp, key) => {
    const pend = D.fixes.find((f) => f.emp === emp && f.key === key && f.status === 'wait');
    if (pend) { setReview({ kind: 'fix', id: pend.id }); return; }
    const e = empBy(D, emp);
    const c = cellOf(D, e, key, t) || {};
    const rec = c.rec || {};
    setEdit({ emp, key, in: rec.in != null && !rec.absent ? tm(rec.in) : '', out: rec.out != null ? tm(rec.out) : '', remote: !!rec.remote, error: '' });
  };
  const saveEdit = (ev) => {
    ev.preventDefault();
    if (!edit.in) { setEdit({ ...edit, error: 'Write the in time.' }); return; }
    const res = setPunch(edit.emp, edit.key, { in: edit.in, out: edit.out, remote: edit.remote }, meName());
    if (!res.ok) { setEdit({ ...edit, error: res.error }); return; }
    toast(`${name(edit.emp)} · ${dayLong(edit.key)} corrected`);
    setEdit(null);
  };

  const stepper = (
    <div className="pp-sub2">
      <label className="sr-only" htmlFor="at-month">Month</label>
      <select id="at-month" className="ix-pick" value={mon} onChange={(ev) => pickMonth(ev.target.value)}>
        {periods.map((p) => <option key={p} value={p}>{periodLabel(p)}</option>)}
      </select>
      {tab === 'month' ? (
        <div className="pp-legend">
          {['present', 'late', 'remote', 'absent', 'leave', 'holiday'].map((k) => <span key={k}><i style={{ background: TONE[k][1] }} />{ATT[k].short} {ATT[k].label}</span>)}
          <span><i style={{ border: '1px dashed var(--text-warning)' }} />No punch-out</span>
        </div>
      ) : null}
    </div>
  );

  let body = null;
  if (live && tab === 'today') {
    const g = board.groups;
    const rows = ORDER.flatMap((s) => g[s].map((x) => ({ ...x, s })));
    const missing = board.missing.sort((a, b) => b.days.length - a.days.length);
    const shown = allMissing ? missing : missing.slice(0, 5);
    const urgent = [
      waitingFixes.length ? { key: 'fx', text: <><b>{plural(waitingFixes.length, 'fix request')}</b> waiting for a decision</>, act: <button type="button" className="ix-btn ix-btn--sm" onClick={() => go('fixes')}>Review</button> } : null,
    ].filter(Boolean);
    body = (<>
      <div className="at-day">
        <b>{board.isToday ? 'Today' : 'Last working day'} · {dayLong(board.key)}</b>
        {board.todayOff ? <span className="ix-muted">Today is {board.todayOff === 'Weekend' ? 'the weekend' : board.todayOff}</span> : !board.isToday ? <span className="ix-muted">Today’s board opens at 08:30</span> : null}
      </div>
      {urgent.length || missing.length ? (
        <div className="at-urgent">
          <h3>Needs a look</h3>
          {urgent.map((u) => <div key={u.key} className="at-urow"><span>{u.text}</span>{u.act}</div>)}
          {missing.length ? <div className="at-urow"><span><b>{plural(missing.reduce((a, m) => a + m.days.length, 0), 'missing punch-out')}</b> in the last 7 working days</span></div> : null}
          {shown.map((m) => (
            <div key={m.e.id} className="at-urow">
              <span><Person e={m.e} sub={m.days.map(dayLabel).join(', ')} tab="attendance" /></span>
              <button type="button" className="ix-btn ix-btn--sm" onClick={() => openEdit(m.e.id, m.days[0])} aria-label={`Fix ${m.e.name}’s punch-out on ${dayLabel(m.days[0])}`}>Fix {dayLabel(m.days[0])}</button>
            </div>
          ))}
          {missing.length > 5 ? <div className="at-urow"><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setAllMissing(!allMissing)}>{allMissing ? 'Show fewer' : `View all ${missing.length}`}</button></div> : null}
        </div>
      ) : null}
      <ul className="ix-plist" aria-label="Today">
        {rows.map(({ e, c, s }) => (
          <li key={e.id}><button type="button" className="ix-pitem" onClick={() => (s === 'leave' ? null : openEdit(e.id, board.key))}>
            <span className="ix-pitem__top"><b>{e.name}</b><StatusBadge tone={badgeTone[s]}>{ATT[s].label}</StatusBadge></span>
            <span className="ix-pitem__mid">{e.dept}{c.in != null ? ` · in ${tm(c.in)}` : ''}{c.out != null ? ` · out ${tm(c.out)}` : ''}</span>
          </button></li>
        ))}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table gc-table--keep">
          <caption className="sr-only">{dayLong(board.key)}</caption>
          <thead><tr><th scope="col">Employee</th><th scope="col">Department</th><th scope="col">Status</th><th scope="col">In</th><th scope="col">Out</th><th scope="col">Recorded by</th></tr></thead>
          <tbody>
            {rows.map(({ e, c, s }) => (
              <tr key={e.id} onClick={rowGo(() => { if (s !== 'leave') openEdit(e.id, board.key); })}>
                <td><Person e={e} sub={e.designation} tab="attendance" /></td>
                <td className="ix-muted">{e.dept}</td>
                <td><Code s={s} />{c.late ? <span className="pp-sub" style={{ display: 'inline', marginLeft: 6 }}>{c.late} min</span> : null}</td>
                <td className="pp-fig">{c.in != null ? tm(c.in) : '—'}</td>
                <td className="pp-fig">{c.out != null ? tm(c.out) : c.miss ? <span className="pp-warn">Missing</span> : '—'}</td>
                <td className="ix-muted">{s === 'leave' ? 'Approved leave' : c.rec ? (c.rec.src === 'app' ? 'Staff app' : c.rec.src === 'card' ? 'Card reader' : c.rec.src === 'fix' ? 'Approved fix' : c.rec.src === 'hand' ? 'Typed by HR' : '—') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ix-foot"><span>A row corrects the day <InfoTip text={`Office hours ${tm(OFFICE.start)}–${tm(OFFICE.end)}. Coming in after ${tm(OFFICE.late)} is late. Remote days are punched from the staff app.`} /></span><span>{plural(rows.length, 'person', 'people')}</span></div>
    </>);
  }

  if (live && tab === 'month') {
    const keys = daysOfPeriod(mon);
    const team = D.employees.filter((e) => personMonth(D, e, mon, t).sum.work > 0 || (e.status !== 'left' && e.joined < t));
    body = (<>
      {stepper}
      <div className="ix-table-wrap ix-table-wrap--show">
        <table className="ix-table at-reg gc-table--keep gc-table--scroll">
          <caption className="sr-only">Attendance register, {periodLabel(mon)}</caption>
          <thead><tr>
            <th scope="col" className="at-name">Employee</th>
            {keys.map((k) => <th key={k} scope="col" className={k === today ? 'is-today' : ''} title={HOLIDAYS[k] || undefined}>{Number(k.slice(8))}<small>{WEEKDAYS[dowOf(k)].slice(0, 2)}</small></th>)}
            <th scope="col" className="at-tot">P</th><th scope="col" className="at-tot">L</th><th scope="col" className="at-tot">A</th>
          </tr></thead>
          <tbody>
            {team.map((e) => {
              const m = personMonth(D, e, mon, t);
              return (
                <tr key={e.id}>
                  <th scope="row" className="at-name"><Link href={`/admin/staff/view?id=${e.id}&tab=attendance`} style={{ color: 'inherit', textDecoration: 'none' }}>{e.name}</Link></th>
                  {m.cells.map(({ key, c }) => {
                    if (!c) return <td key={key} />;
                    const [bg, fg] = TONE[c.s] || TONE.notin;
                    const can = isWorkday(key) && key <= today && c.s !== 'leave';
                    const label = `${e.name}, ${dayLong(key)}: ${ATT[c.s].label}${c.in != null ? ', in ' + tm(c.in) : ''}${c.out != null ? ', out ' + tm(c.out) : c.miss ? ', no punch-out' : ''}`;
                    return (
                      <td key={key}>
                        {c.s === 'off' ? <span aria-hidden="true" /> : (
                          <button type="button" className={'at-cell' + (c.miss ? ' at-cell--miss' : '')} style={{ background: bg, color: fg }} disabled={!can} title={label} aria-label={label}
                            onClick={() => openEdit(e.id, key)}>{ATT[c.s].short}</button>
                        )}
                      </td>
                    );
                  })}
                  <td className="at-tot">{m.sum.present + m.sum.remote}</td><td className="at-tot pp-warn">{m.sum.late || '—'}</td><td className="at-tot pp-bad">{m.sum.absent || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="ix-foot"><span>P present (office or remote) · L late · A absent. A cell corrects the day.</span></div>
    </>);
  }

  if (live && (tab === 'late' || tab === 'absent')) {
    const rows = attendanceRows(D, mon, t, tab);
    const byPerson = {};
    rows.forEach((r) => { byPerson[r.e.id] = (byPerson[r.e.id] || 0) + 1; });
    const top = Object.entries(byPerson).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id, n]) => `${name(id).split(' ')[0]} ${n}`).join(' · ');
    const exp = () => {
      downloadCsv(`gridcommerce-${tab === 'late' ? 'late-entries' : 'absences'}-${mon}.csv`, [
        ['Employee ID', 'Name', 'Department', 'Date', ...(tab === 'late' ? ['In', 'Minutes late'] : [])],
        ...rows.map((r) => [r.e.id, r.e.name, r.e.dept, r.key, ...(tab === 'late' ? [tm(r.c.in), r.c.late] : [])]),
      ]);
      toast(plural(rows.length, 'row') + ' exported');
    };
    body = (<>
      {stepper}
      {rows.length ? (<>
        <ul className="ix-plist" aria-label={tab === 'late' ? 'Late entries' : 'Absences'}>
          {rows.map((r) => (
            <li key={r.e.id + r.key}><button type="button" className="ix-pitem" onClick={() => openEdit(r.e.id, r.key)}>
              <span className="ix-pitem__top"><b>{r.e.name}</b><span className="pp-fig">{tab === 'late' ? `${tm(r.c.in)} · ${r.c.late} min` : dayLabel(r.key)}</span></span>
              <span className="ix-pitem__mid">{dayLong(r.key)} · {r.e.dept}</span>
            </button></li>
          ))}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table gc-table--keep">
            <caption className="sr-only">{tab === 'late' ? 'Late entries' : 'Absences'}, {periodLabel(mon)}</caption>
            <thead><tr><th scope="col">Employee</th><th scope="col">Department</th><th scope="col">Day</th>{tab === 'late' ? <><th scope="col">In</th><th scope="col" className="ix-num">Late by</th></> : <th scope="col">Leave</th>}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.e.id + r.key} onClick={rowGo(() => openEdit(r.e.id, r.key))}>
                  <td><Person e={r.e} sub={r.e.designation} tab="attendance" /></td>
                  <td className="ix-muted">{r.e.dept}</td>
                  <td>{dayLong(r.key)}</td>
                  {tab === 'late' ? <><td className="pp-fig">{tm(r.c.in)}</td><td className="ix-num pp-fig pp-warn">{r.c.late} min</td></>
                    : <td><Link className="ix-btn ix-btn--sm" href={`/admin/leave?new=1&emp=${r.e.id}`}>Add leave</Link></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ix-foot"><span>{plural(rows.length, tab === 'late' ? 'late entry' : 'absence', tab === 'late' ? 'late entries' : 'absences')}{top ? ` · most: ${top}` : ''}</span><button type="button" className="ix-btn ix-btn--sm" onClick={exp}><Icon name="download" width="16" height="16" aria-hidden="true" />Export</button></div>
      </>) : <div className="ix-empty"><EmptyState icon={tab === 'late' ? 'clock' : 'user-x'} title={tab === 'late' ? `No late entries in ${periodLabel(mon)}.` : `No absences in ${periodLabel(mon)}.`} /></div>}
    </>);
  }

  if (live && tab === 'summary') {
    const list = D.employees.map((e) => ({ e, m: personMonth(D, e, mon, t).sum })).filter((x) => x.m.work > 0);
    body = (<>
      {stepper}
      <ul className="ix-plist" aria-label="Summary per person">
        {list.map(({ e, m }) => (
          <li key={e.id}><Link className="ix-pitem" href={`/admin/staff/view?id=${e.id}&tab=attendance`}>
            <span className="ix-pitem__top"><b>{e.name}</b><span className="pp-fig">{m.onTime == null ? '—' : m.onTime + '% on time'}</span></span>
            <span className="ix-pitem__mid">{m.present + m.remote} in · {m.late} late · {m.absent} absent · {m.leave} leave</span>
          </Link></li>
        ))}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table gc-table--keep">
          <caption className="sr-only">Attendance summary per person, {periodLabel(mon)}</caption>
          <thead><tr><th scope="col">Employee</th><th scope="col" className="ix-num">Office</th><th scope="col" className="ix-num">Remote</th><th scope="col" className="ix-num">Late</th><th scope="col" className="ix-num">Absent</th><th scope="col" className="ix-num">Leave</th><th scope="col" className="ix-num">Usual in</th><th scope="col" className="ix-num">On time</th><th scope="col" className="ix-num">No punch-out</th></tr></thead>
          <tbody>
            {list.map(({ e, m }) => (
              <tr key={e.id} onClick={rowGo(() => { window.location.href = `/admin/staff/view?id=${e.id}&tab=attendance`; })}>
                <td><Person e={e} sub={e.dept} tab="attendance" /></td>
                <td className="ix-num">{m.present + m.late}</td>
                <td className="ix-num">{m.remote || '—'}</td>
                <td className={'ix-num' + (m.late >= 4 ? ' pp-warn' : '')}>{m.late || '—'}</td>
                <td className={'ix-num' + (m.absent ? ' pp-bad' : '')}>{m.absent || '—'}</td>
                <td className="ix-num">{m.leave || '—'}</td>
                <td className="ix-num pp-fig">{tm(m.avgIn)}</td>
                <td className="ix-num pp-fig">{m.onTime == null ? '—' : m.onTime + '%'}</td>
                <td className={'ix-num' + (m.miss ? ' pp-warn' : '')}>{m.miss || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ix-foot"><span>Working days in {periodLabel(mon)} up to today</span></div>
    </>);
  }

  if (live && tab === 'fixes') {
    const list = [...D.fixes].sort((a, b) => (b.status === 'wait') - (a.status === 'wait') || b.at - a.at);
    body = list.length ? (<>
      <ul className="ix-plist" aria-label="Fix requests">
        {list.map((f) => (
          <li key={f.id}><button type="button" className="ix-pitem" onClick={() => setReview({ kind: 'fix', id: f.id })}>
            <span className="ix-pitem__top"><b>{name(f.emp)}</b><StatusBadge tone={REQ_STATUS[f.status].tone}>{REQ_STATUS[f.status].label}</StatusBadge></span>
            <span className="ix-pitem__mid">{dayLong(f.key)} · {f.text}</span>
          </button></li>
        ))}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table gc-table--keep">
          <caption className="sr-only">Attendance-fix requests</caption>
          <thead><tr><th scope="col">Employee</th><th scope="col">Day</th><th scope="col">Asks for</th><th scope="col">Asked</th><th scope="col">Status</th></tr></thead>
          <tbody>
            {list.map((f) => { const e = empBy(D, f.emp) || { id: f.emp, name: f.emp }; return (
              <tr key={f.id} onClick={rowGo(() => setReview({ kind: 'fix', id: f.id }))}>
                <td><Person e={e} sub={e.dept} tab="attendance" /></td>
                <td>{dayLong(f.key)}</td>
                <td>{[f.patch.in != null ? `In ${tm(f.patch.in)}` : null, f.patch.out != null ? `Out ${tm(f.patch.out)}` : null].filter(Boolean).join(' · ')}</td>
                <td className="ix-muted">{dmy(f.at)}</td>
                <td>{f.status === 'wait' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => setReview({ kind: 'fix', id: f.id })} aria-label={`Review ${e.name}’s fix for ${dayLong(f.key)}`}>Review</button> : <StatusBadge tone={REQ_STATUS[f.status].tone}>{REQ_STATUS[f.status].label}</StatusBadge>}</td>
              </tr>
            ); })}
          </tbody>
        </table>
      </div>
      <div className="ix-foot"><span>Staff ask from the app when a punch is missing or wrong</span></div>
    </>) : <div className="ix-empty"><EmptyState icon="fingerprint" title="No fix requests." /></div>;
  }

  const g = board ? board.groups : null;
  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'at-tab-' + k, label: l, count: k === 'fixes' && live ? waitingFixes.length || null : null, on: tab === k, onClick: () => go(k) }));
  const editEmp = edit ? empBy(D, edit.emp) : null;

  return (
    <AdminShell active="attendance" title="Attendance">
      <style dangerouslySetInnerHTML={{ __html: PEOPLE_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="fingerprint" title="Attendance"
          about="Who came in, who was late or away, from the office card reader and the staff app. Correct a day from the register; fix requests from staff open for a decision."
          primary={{ label: 'Correct a day', icon: 'pencil', onClick: () => { const e = current(D)[0]; if (e) openEdit(e.id, board ? board.key : today); } }} />
        {!live ? <Skeleton label="Loading attendance" /> : (<>
          <MetricStrip label={(board.isToday ? 'Today' : dayLong(board.key)) + ' at a glance'} items={[
            { label: 'In the office', value: String(g.present.length + g.late.length), sub: `of ${plural(current(D).length, 'person', 'people')}`, icon: 'building-2' },
            { label: 'Late', value: String(g.late.length), sub: `after ${tm(OFFICE.late)}`, icon: 'clock-alert' },
            { label: 'Remote', value: String(g.remote.length), icon: 'laptop' },
            { label: 'On leave', value: String(g.leave.length), href: '/admin/leave?tab=cal', icon: 'plane' },
            { label: board.isToday && g.notin.length ? 'Absent or not in' : 'Absent', value: String(g.absent.length + g.notin.length), icon: 'user-x' },
          ]} />
          <section className="ix-card" aria-label="Attendance">
            <div className="ix-bar"><IndexTabs tabs={tabs} label="Attendance views" /></div>
            {body}
          </section>
        </>)}
      </div>

      {live ? <ReviewDrawer D={D} t={t} req={review} onClose={() => setReview(null)} /> : null}
      <Sheet open={!!edit} title="Correct a day" onClose={() => setEdit(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit(null)}>Cancel</button>
          <button type="submit" form="at-edit" className="gc-btn gc-btn--solid">Save</button>
        </>}>
        {edit ? (
          <form id="at-edit" className="pp-form" onSubmit={saveEdit} noValidate>
            <Field id="at-emp" label="Employee">
              <select id="at-emp" {...ctl(null, true)} value={edit.emp} onChange={(ev) => setEdit({ ...edit, emp: ev.target.value, error: '' })}>
                {current(D).map((e) => <option key={e.id} value={e.id}>{e.name} · {e.dept}</option>)}
              </select>
            </Field>
            <Field id="at-key" label="Day" hint={editEmp && !isWorkday(edit.key) ? 'That day is a weekend or holiday.' : null}>
              <input id="at-key" type="date" {...ctl()} value={edit.key} max={today} onChange={(ev) => setEdit({ ...edit, key: ev.target.value, error: '' })} />
            </Field>
            <div className="pp-two">
              <Field id="at-in" label="In (24-hour)"><input id="at-in" {...ctl()} value={edit.in} onChange={(ev) => setEdit({ ...edit, in: ev.target.value, error: '' })} placeholder="09:05" inputMode="numeric" /></Field>
              <Field id="at-out" label="Out (24-hour)"><input id="at-out" {...ctl()} value={edit.out} onChange={(ev) => setEdit({ ...edit, out: ev.target.value, error: '' })} placeholder="18:10" inputMode="numeric" /></Field>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)' }}>
              <input type="checkbox" checked={edit.remote} onChange={(ev) => setEdit({ ...edit, remote: ev.target.checked })} style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />Worked remotely
            </label>
            <p className="gc-help" style={{ margin: 0 }}>Saved as typed by {meName()}; it shows on the person’s record.</p>
            {edit.error ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{edit.error}</p> : null}
          </form>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
