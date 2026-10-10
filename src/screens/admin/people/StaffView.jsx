'use client';
// Employee page (/admin/staff/view?id=GC-E003&tab=personal) — one GridCommerce employee, copied from the merchant
// panel's staff-profile/StaffProfile.jsx and cut to what the company keeps: the header (status, ID, designation; Edit
// details, More), then the tabs Personal · Employment · Reporting · Attendance · Leave · Salary · Tasks · Performance ·
// Documents · Admin access. Changes go through side panels with a reason where it matters (status, salary).
// Admin access shows their super admin role (lib/admin/access.js ADMIN_ROLES / canOpen) and what it opens; changing it
// updates the People store only — roles are managed under Administration › Roles & permissions (step 14).
// Data: lib/admin/people.js. ?id= and ?tab= are read after mount; the tab stays in the address.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState, InfoTip } from '@/components/ui';
import { RecordHeader, IndexTabs, KV, MetricStrip } from '@/components/ui/IndexKit';
import { dmy } from '@/lib/platform/util';
import { ADMIN_ROLES, canOpen, roleTitle } from '@/lib/admin/access';
import {
  empBy, empName, reportsOf, current, DEPARTMENTS, STATUSES, LEAVE_TYPES, REQ_STATUS, ATT, SALARY_PARTS, PF_RATE, DOC_KINDS, CYCLES,
  statusOf, grossOf, splitGross, monthlyTax, personMonth, attendancePeriods, periodLabel, keyOf, dayLong, rangeLabel, leaveDays, balanceOf,
  runsNewest, payslipId, goalPct, goalTone, reviewOf, tm, updateEmployee, setStatus, setSalary, setAdminRole, addTask, toggleTask, addDocument, setGoalActual, addGoal,
} from '@/lib/admin/people';
import { AdminShell } from '../AdminShell';
import { AREAS } from '../adminNav';
import { ReviewDrawer } from './ReviewDrawer';
import { Payslip } from './Payroll';
import { ReviewSheet, Rating } from './Reviews';
import { PEOPLE_CSS, usePeople, meName, money, minus, plural, viewHref, Person, EmpStatus, setParam, Field, ctl, Card } from './peopleShared';

const TABS = [
  ['personal', 'Personal'], ['employment', 'Employment'], ['reporting', 'Reporting'], ['attendance', 'Attendance'], ['leave', 'Leave'],
  ['salary', 'Salary'], ['tasks', 'Tasks'], ['performance', 'Performance'], ['documents', 'Documents'], ['access', 'Admin access'],
];
const KEYS = TABS.map((x) => x[0]);
const CSS = `
.sv-tabs{overflow:visible}
.sv-tabs .ix-tabs{padding:6px 8px}
.sv-hist{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.sv-hist li{display:flex;justify-content:space-between;gap:var(--space-3);padding:8px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.sv-hist li:first-child{border-top:0}
.sv-hist small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sv-hist time{flex:none;font-size:var(--text-xs);color:var(--text-muted)}
.sv-task{display:flex;align-items:center;gap:var(--space-3);min-height:40px;padding:6px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.sv-task:first-child{border-top:0}
.sv-task input{width:16px;height:16px;accent-color:var(--primary)}
.sv-task.is-done span{color:var(--text-muted);text-decoration:line-through}
.sv-add{display:flex;gap:var(--space-2);margin-top:var(--space-3)}
.sv-add .gc-input{flex:1}
.sv-area{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:36px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.sv-area:first-child{border-top:0}
.sv-area span{display:inline-flex;align-items:center;gap:var(--space-2)}
.sv-areas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:var(--space-6)}
.sv-goal{display:grid;grid-template-columns:minmax(0,1fr) 120px 56px auto;align-items:center;gap:var(--space-3);min-height:48px;padding:6px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.sv-goal:first-child{border-top:0}
.sv-goal small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sv-goal b{font-family:var(--font-data);font-weight:var(--weight-medium);text-align:right}
.sv-rev{padding:10px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.sv-rev:first-child{border-top:0}
.sv-rev p{margin:4px 0 0;color:var(--text-body)}
.sv-rev small{font-size:var(--text-xs);color:var(--text-muted)}
.sv-chain{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:var(--text-sm)}
.sv-chain a{color:var(--text-heading);text-decoration:none}
.sv-chain a:hover{color:var(--primary);text-decoration:underline}
.sv-skel{height:320px;border-radius:var(--radius-xl);background:var(--surface-subtle)}
@media (max-width:640px){
  .sv-areas{grid-template-columns:1fr}
  .sv-goal{grid-template-columns:minmax(0,1fr) 56px;row-gap:4px}
  .sv-goal .pp-bar{grid-column:1 / -1;grid-row:2}
  .sv-goal>button{grid-column:2;grid-row:1}
  .sv-goal>b{display:none}
}
`;
const src = (r) => (!r ? '—' : r.src === 'app' ? 'Staff app' : r.src === 'card' ? 'Card reader' : r.src === 'fix' ? 'Approved fix' : r.src === 'hand' ? 'Typed by HR' : '—');
const years = (ms) => { const y = ms / (365.25 * 864e5); return y < 1 ? `${Math.max(1, Math.round(y * 12))} months` : `${y.toFixed(1)} years`; };

// ---- tabs ------------------------------------------------------------------------------------------------------------
function PersonalTab({ e }) {
  return (
    <div className="ix-record">
      <div className="ix-main">
        <Card title="Personal details"><KV rows={[
          ['Full name', e.name], ['Date of birth', e.dob ? dmy(e.dob) : '—'], ['Blood group', e.blood], ['Home district', e.district], ['Lives at', e.address],
        ]} /></Card>
      </div>
      <div className="ix-side">
        <Card title="Contact"><KV rows={[
          ['Work email', <a key="m" href={'mailto:' + e.email}>{e.email}</a>], ['Mobile', <a key="p" className="pp-fig" href={'tel:' + e.phone.replace(/\D/g, '')}>{e.phone}</a>],
        ]} /></Card>
        <Card title="Emergency contact">{e.emergency && e.emergency.name ? <KV rows={[['Name', e.emergency.name], ['Relation', e.emergency.relation], ['Phone', <span key="p" className="pp-fig">{e.emergency.phone}</span>]]} /> : <p className="pp-empty" style={{ padding: 0 }}>Not added yet.</p>}</Card>
      </div>
    </div>
  );
}

function EmploymentTab({ D, e, t }) {
  const s = statusOf(e);
  return (
    <div className="ix-record">
      <div className="ix-main">
        <Card title="Employment"><KV rows={[
          ['Employee ID', <span key="i" className="pp-fig">{e.id}</span>], ['Department', e.dept], ['Designation', e.designation], ['Status', <StatusBadge key="s" tone={s.tone}>{s.label}</StatusBadge>],
          ['Joined', dmy(e.joined)], e.probationEnd ? ['Probation ends', dmy(e.probationEnd)] : null, e.noticeEnd ? ['Last working day', dmy(e.noticeEnd)] : null,
          e.leftAt ? ['Left', dmy(e.leftAt - 864e5)] : null, ['Time here', years((e.leftAt || t) - e.joined)], ['Works', e.workMode], ['Location', e.location],
          ['Reports to', e.manager ? <Link key="m" href={viewHref(e.manager, 'reporting')}>{empName(D, e.manager)}</Link> : 'Board of directors'],
        ]} /></Card>
      </div>
      <div className="ix-side">
        <Card title="History">
          <ul className="sv-hist">{[...(e.history || [])].reverse().map((h, i) => <li key={i}><span>{h.text}<small>{h.by}</small></span><time>{dmy(h.at)}</time></li>)}</ul>
        </Card>
      </div>
    </div>
  );
}

function ReportingTab({ D, e }) {
  const chain = [];
  let m = e.manager ? empBy(D, e.manager) : null;
  while (m && chain.length < 6) { chain.unshift(m); m = m.manager ? empBy(D, m.manager) : null; }
  const reports = reportsOf(D, e.id);
  const peers = e.manager ? reportsOf(D, e.manager).filter((x) => x.id !== e.id) : [];
  return (
    <div className="ix-record">
      <div className="ix-main">
        <Card title={`Direct reports · ${reports.length}`}>
          {reports.length ? <div className="pp-rows">{reports.map((r) => <div key={r.id} className="pp-row"><Person e={r} sub={r.designation} tab="reporting" /><EmpStatus e={r} /></div>)}</div>
            : <p className="pp-empty" style={{ padding: 0 }}>Nobody reports to {e.name.split(' ')[0]}.</p>}
        </Card>
        {peers.length ? <Card title={`Same manager · ${peers.length}`}><div className="pp-rows">{peers.map((r) => <div key={r.id} className="pp-row"><Person e={r} sub={r.designation} /><span className="ix-muted">{r.dept}</span></div>)}</div></Card> : null}
      </div>
      <div className="ix-side">
        <Card title="Reports to">
          {e.manager ? <Person e={empBy(D, e.manager)} sub={empBy(D, e.manager).designation} tab="reporting" /> : <p className="pp-empty" style={{ padding: 0 }}>The board of directors.</p>}
          {chain.length > 1 ? (
            <div style={{ marginTop: 'var(--space-3)' }}>
              <span className="pp-sub" style={{ marginBottom: 4 }}>Line to the top</span>
              <div className="sv-chain">{chain.map((x, i) => <React.Fragment key={x.id}>{i ? <Icon name="chevron-right" width="14" height="14" aria-hidden="true" /> : null}<Link href={viewHref(x.id, 'reporting')}>{x.name}</Link></React.Fragment>)}</div>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}

function AttendanceTab({ D, e, t, openFix, month, setMonth }) {
  const periods = attendancePeriods(D, t);
  const mon = month && periods.includes(month) ? month : periods[0];
  const m = personMonth(D, e, mon, t);
  const days = m.cells.filter((x) => x.c && x.c.s !== 'off' && x.key <= keyOf(t)).reverse();
  const fixes = D.fixes.filter((f) => f.emp === e.id).sort((a, b) => b.at - a.at);
  return (<>
    <MetricStrip label={periodLabel(mon)} lead={(
      <select className="ix-pick" aria-label="Month" value={mon} onChange={(ev) => setMonth(ev.target.value)}>{periods.map((p) => <option key={p} value={p}>{periodLabel(p)}</option>)}</select>
    )} items={[
      { label: 'Came in', value: String(m.sum.present + m.sum.late + m.sum.remote), sub: m.sum.remote ? `${m.sum.remote} remote` : null, icon: 'building-2' },
      { label: 'Late', value: String(m.sum.late), sub: m.sum.lateMin ? `${m.sum.lateMin} min in all` : null, icon: 'clock-alert' },
      { label: 'Absent', value: String(m.sum.absent), icon: 'user-x' },
      { label: 'Usual in', value: tm(m.sum.avgIn), sub: m.sum.onTime == null ? null : `${m.sum.onTime}% on time`, icon: 'clock' },
    ]} />
    {fixes.length ? (
      <Card title="Fix requests" flush>
        <div className="ix-table-wrap ix-table-wrap--show">
          <table className="ix-table gc-table--keep ix-table--static">
            <caption className="sr-only">Fix requests</caption>
            <tbody>{fixes.map((f) => (
              <tr key={f.id} onClick={() => openFix(f.id)} style={{ cursor: 'pointer' }}>
                <td>{dayLong(f.key)}<span className="pp-sub">{f.text}</span></td>
                <td style={{ textAlign: 'right' }}>{f.status === 'wait' ? <button type="button" className="ix-btn ix-btn--sm" onClick={(ev) => { ev.stopPropagation(); openFix(f.id); }}>Review</button> : <StatusBadge tone={REQ_STATUS[f.status].tone}>{REQ_STATUS[f.status].label}</StatusBadge>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
    ) : null}
    <Card title="Days" flush>
      {days.length ? (
        <div className="ix-table-wrap ix-table-wrap--show">
          <table className="ix-table gc-table--keep ix-table--static">
            <caption className="sr-only">Days in {periodLabel(mon)}</caption>
            <thead><tr><th scope="col">Day</th><th scope="col">Status</th><th scope="col">In</th><th scope="col">Out</th><th scope="col">Recorded by</th></tr></thead>
            <tbody>{days.map(({ key, c }) => (
              <tr key={key}>
                <td className="ix-nowrap">{dayLong(key)}</td>
                <td><StatusBadge tone={ATT[c.s].tone === 'info' ? 'neutral' : ATT[c.s].tone}>{c.s === 'holiday' ? c.name : ATT[c.s].label}</StatusBadge>{c.late ? <span className="pp-sub" style={{ display: 'inline', marginLeft: 6 }}>{c.late} min</span> : null}</td>
                <td className="pp-fig">{tm(c.in)}</td>
                <td className="pp-fig">{c.out != null ? tm(c.out) : c.miss ? <span className="pp-warn">Missing</span> : '—'}</td>
                <td className="ix-muted">{c.s === 'leave' ? 'Approved leave' : src(c.rec)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <p className="pp-empty">No attendance kept for {periodLabel(mon)}.</p>}
      <div className="ix-foot"><span>Correct a day from <Link href={`/admin/attendance?tab=month&month=${mon}`}>Attendance</Link></span></div>
    </Card>
  </>);
}

function LeaveTab({ D, e, t, openLeave }) {
  const b = balanceOf(D, e.id, t);
  const list = D.leave.filter((x) => x.emp === e.id).sort((a, c) => (c.status === 'wait') - (a.status === 'wait') || c.from.localeCompare(a.from));
  return (
    <div className="ix-record">
      <div className="ix-main">
        <Card title="Requests" flush action={e.status !== 'left' ? <Link className="ix-btn ix-btn--sm" href={`/admin/leave?new=1&emp=${e.id}`}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add leave</Link> : null}>
          {list.length ? (
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table gc-table--keep ix-table--static">
                <caption className="sr-only">Leave requests</caption>
                <thead><tr><th scope="col">Leave</th><th scope="col">Dates</th><th scope="col" className="ix-num">Days</th><th scope="col">Status</th></tr></thead>
                <tbody>{list.map((x) => (
                  <tr key={x.id} onClick={() => openLeave(x.id)} style={{ cursor: 'pointer' }}>
                    <td>{LEAVE_TYPES[x.type].label}{x.reason ? <span className="pp-sub">{x.reason}</span> : null}</td>
                    <td className="ix-nowrap">{rangeLabel(x.from, x.to)}{x.from.slice(0, 4) !== keyOf(t).slice(0, 4) ? ' ' + x.from.slice(0, 4) : ''}</td>
                    <td className="ix-num">{leaveDays(x.from, x.to)}</td>
                    <td>{x.status === 'wait' ? <button type="button" className="ix-btn ix-btn--sm" onClick={(ev) => { ev.stopPropagation(); openLeave(x.id); }}>Review</button> : <StatusBadge tone={REQ_STATUS[x.status].tone}>{REQ_STATUS[x.status].label}</StatusBadge>}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <p className="pp-empty">No leave this year.</p>}
        </Card>
      </div>
      <div className="ix-side">
        <Card title={`Balance · ${keyOf(t).slice(0, 4)}`}>
          <div className="pp-rows">{Object.entries(LEAVE_TYPES).map(([k, v]) => { const x = b[k]; return (
            <div key={k} className="pp-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
              <span style={{ display: 'flex', justifyContent: 'space-between' }}><span>{v.label}</span><span className="pp-fig">{x.left} of {x.quota} left</span></span>
              <span className="pp-bar"><i style={{ width: `${Math.max(0, x.left) / x.quota * 100}%` }} /></span>
              {x.pending ? <span className="pp-sub">{plural(x.pending, 'day')} asked, waiting</span> : null}
            </div>
          ); })}</div>
        </Card>
      </div>
    </div>
  );
}

function SalaryTab({ D, e, onEdit, onSlip }) {
  const s = e.salary;
  const gross = grossOf(s);
  const pf = e.status === 'probation' ? 0 : Math.round(s.basic * PF_RATE);
  const tax = monthlyTax(gross);
  const slips = runsNewest(D).map((r) => ({ r, l: r.lines.find((x) => x.emp === e.id) })).filter((x) => x.l);
  return (
    <div className="ix-record">
      <div className="ix-main">
        <Card title="Salary structure" action={e.status !== 'left' ? <button type="button" className="ix-btn ix-btn--sm" onClick={onEdit}><Icon name="pencil" width="16" height="16" aria-hidden="true" />Change salary</button> : null}>
          <dl className="ix-sum">
            {SALARY_PARTS.map(([k, label]) => <React.Fragment key={k}><dt>{label}</dt><dd className="pp-fig">{money(s[k])}</dd></React.Fragment>)}
            <dt className="is-total">Gross a month</dt><dd className="is-total pp-fig">{money(gross)}</dd>
            <dt>Income tax</dt><dd className="pp-fig">{minus(tax)}</dd>
            <dt>Provident fund{e.status === 'probation' ? ' (after probation)' : ''}</dt><dd className="pp-fig">{minus(pf)}</dd>
            <dt className="is-total">Usual take-home</dt><dd className="is-total pp-fig">{money(gross - tax - pf)}</dd>
          </dl>
        </Card>
        <Card title="Payslips" flush>
          {slips.length ? (
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table gc-table--keep ix-table--static">
                <caption className="sr-only">Payslips</caption>
                <thead><tr><th scope="col">Month</th><th scope="col">Payslip</th><th scope="col" className="ix-num">Net</th><th scope="col">Status</th></tr></thead>
                <tbody>{slips.map(({ r, l }) => (
                  <tr key={r.id} onClick={() => onSlip(r.id)} style={{ cursor: 'pointer' }}>
                    <td>{periodLabel(r.period)}</td>
                    <td className="pp-id">{payslipId(r, e.id)}</td>
                    <td className="ix-num pp-fig">{money(l.net)}</td>
                    <td><StatusBadge tone={r.status === 'paid' ? 'success' : r.status === 'approved' ? 'primary' : 'neutral'}>{r.status === 'paid' ? 'Paid' : r.status === 'approved' ? 'Approved' : 'Draft'}</StatusBadge></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <p className="pp-empty">No payslips yet.</p>}
        </Card>
      </div>
      <div className="ix-side">
        <Card title="Paid to"><KV rows={e.pay.method === 'bkash' ? [['Method', 'bKash'], ['Number', <span key="n" className="pp-fig">{e.pay.number}</span>]] : [['Method', 'Bank transfer'], ['Bank', e.pay.bank], ['Account', <span key="a" className="pp-fig">{e.pay.account || 'Not added'}</span>]]} /></Card>
      </div>
    </div>
  );
}

function TasksTab({ e }) {
  const [text, setText] = useState('');
  const add = (ev) => { ev.preventDefault(); const r = addTask(e.id, text); if (!r.ok) { toast(r.error, { tone: 'error' }); return; } setText(''); toast('Task added'); };
  const tasks = e.tasks || [];
  return (
    <Card title={`Tasks · ${tasks.filter((x) => !x.done).length} open`}>
      {tasks.length ? <div>{tasks.map((x) => (
        <label key={x.id} className={'sv-task' + (x.done ? ' is-done' : '')}><input type="checkbox" checked={x.done} onChange={() => toggleTask(e.id, x.id)} /><span>{x.text}</span></label>
      ))}</div> : <p className="pp-empty" style={{ padding: 0 }}>No tasks yet.</p>}
      <form className="sv-add" onSubmit={add}>
        <label className="sr-only" htmlFor="sv-task">New task</label>
        <input id="sv-task" className="gc-input" value={text} onChange={(ev) => setText(ev.target.value)} placeholder={`Add a task for ${e.name.split(' ')[0]}`} />
        <button type="submit" className="gc-btn gc-btn--neutral">Add</button>
      </form>
    </Card>
  );
}

function PerformanceTab({ D, e, onReview, onGoal, onNewGoal }) {
  return (
    <div className="ix-record">
      <div className="ix-main">
        <Card title="Goals and KPIs · this half" action={<button type="button" className="ix-btn ix-btn--sm" onClick={onNewGoal}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add goal</button>}>
          {e.goals.length ? <div>{e.goals.map((g) => { const p = goalPct(g); return (
            <div key={g.id} className="sv-goal">
              <span>{g.title}<small>{g.kpi}: {g.actual} of {g.target} {g.unit}{g.lower ? ' · lower is better' : ''} · {g.due}</small></span>
              <span className="pp-bar"><i style={{ width: Math.min(100, p) + '%', background: `var(--${goalTone(p)})` }} /></span>
              <b>{p}%</b>
              <button type="button" className="ix-btn ix-btn--sm" onClick={() => onGoal(g)} aria-label={`Update ${g.title}`}>Update</button>
            </div>
          ); })}</div> : <p className="pp-empty" style={{ padding: 0 }}>No goals yet.</p>}
        </Card>
      </div>
      <div className="ix-side">
        <Card title="Reviews" action={e.status !== 'left' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => onReview(CYCLES[0].id)}>{reviewOf(D, e.id, CYCLES[0].id) ? 'Open ' + CYCLES[0].label : 'Start review'}</button> : null}>
          {CYCLES.map((c) => { const r = reviewOf(D, e.id, c.id); if (!r) return null; return (
            <div key={c.id} className="sv-rev">
              <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><b>{c.label}</b>{r.status === 'done' ? <Rating r={r} /> : <StatusBadge tone="warning">In progress</StatusBadge>}</span>
              {r.comments ? <p>{r.comments}</p> : null}
              <small>{r.reviewer}{r.strengths ? ` · strong: ${r.strengths.toLowerCase()}` : ''}{r.improve ? ` · work on: ${r.improve.toLowerCase()}` : ''}</small>
            </div>
          ); })}
          {!CYCLES.some((c) => reviewOf(D, e.id, c.id)) ? <p className="pp-empty" style={{ padding: 0 }}>No reviews yet.</p> : null}
        </Card>
      </div>
    </div>
  );
}

function DocumentsTab({ e, onAdd }) {
  const docs = e.docs || [];
  return (
    <Card title={`Documents · ${docs.length}`} flush action={<button type="button" className="ix-btn ix-btn--sm" onClick={onAdd}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add document</button>}>
      {docs.length ? (
        <div className="ix-table-wrap ix-table-wrap--show">
          <table className="ix-table gc-table--keep ix-table--static">
            <caption className="sr-only">Documents</caption>
            <thead><tr><th scope="col">Document</th><th scope="col">Added</th><th scope="col" className="ix-num">Size</th><th scope="col" /></tr></thead>
            <tbody>{docs.map((d, i) => (
              <tr key={i}>
                <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name="file-text" width="16" height="16" aria-hidden="true" />{d.name}</span>{d.kind && d.kind !== d.name ? <span className="pp-sub">{d.kind}</span> : null}</td>
                <td className="ix-muted ix-nowrap">{dmy(d.at)}</td>
                <td className="ix-num ix-muted">{d.size}</td>
                <td style={{ textAlign: 'right' }}><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => toast('Files are not kept in this demo; only the document list is.')}>View</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <p className="pp-empty">No documents yet.</p>}
    </Card>
  );
}

function AccessTab({ e }) {
  const [role, setRole] = useState(e.adminRole || '');
  useEffect(() => { setRole(e.adminRole || ''); }, [e.adminRole]);
  const who = { role };
  const save = () => {
    const r = setAdminRole(e.id, role, meName());
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    toast(role ? `${e.name.split(' ')[0]} is now ${roleTitle(role)} in the super admin` : `${e.name.split(' ')[0]} no longer opens the super admin`);
  };
  const areas = AREAS.map((a) => ({ a, ok: role ? canOpen(who, a.id) : false }));
  const n = areas.filter((x) => x.ok).length;
  return (
    <div className="ix-record">
      <div className="ix-main">
        <Card title={role ? `Opens ${n} of ${AREAS.length} areas` : 'No access'}>
          <div className="sv-areas">{areas.map(({ a, ok }) => (
            <div key={a.id} className="sv-area"><span><Icon name={a.icon} width="16" height="16" aria-hidden="true" />{a.label}</span>
              {ok ? <span className="pp-ok"><Icon name="check" width="16" height="16" aria-hidden="true" />Opens</span> : <span className="ix-muted">—</span>}</div>
          ))}</div>
        </Card>
      </div>
      <div className="ix-side">
        <Card title="Super admin role">
          <div className="pp-form">
            <Field id="sv-role" label="Role" hint={role ? ADMIN_ROLES[role].title + (ADMIN_ROLES[role].areas === '*' ? ' · every area' : '') : 'Can’t sign in to the super admin'}>
              <select id="sv-role" {...ctl(null, true)} value={role} onChange={(ev) => setRole(ev.target.value)} disabled={e.status === 'left'}>
                <option value="">No access</option>
                {Object.entries(ADMIN_ROLES).map(([k, r]) => <option key={k} value={k}>{r.title}</option>)}
              </select>
            </Field>
            {e.staffId ? <p className="gc-help" style={{ margin: 0 }}>Signs in as <b>{e.staffId}</b> (demo staff switch).</p> : null}
            <div className="pp-note pp-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>Changing it here updates this employee record only. Roles and what each opens are managed under Administration › Roles &amp; permissions.</span></div>
            <button type="button" className="gc-btn gc-btn--solid" disabled={role === (e.adminRole || '') || e.status === 'left'} onClick={save}>Save role</button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---- the page --------------------------------------------------------------------------------------------------------
export default function StaffView() {
  const { D, t, live } = usePeople();
  const [q, setQ] = useState(null);           // { id, tab }
  const [sheet, setSheet] = useState(null);   // { kind, … }
  const [review, setReview] = useState(null);
  const [month, setMonth] = useState(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQ({ id: (p.get('id') || '').trim().toUpperCase(), tab: KEYS.includes(p.get('tab')) ? p.get('tab') : 'personal' });
  }, []);
  const go = (tab) => { setQ((x) => ({ ...x, tab })); setParam('tab', tab); };
  const close = () => setSheet(null);
  const me = meName();

  if (!live || !q) {
    return <AdminShell active="staff" title="Employee"><div className="ix-page" aria-busy="true" aria-label="Loading the employee"><div className="pp-skel pp-skel--strip" /><div className="pp-skel" /></div><style dangerouslySetInnerHTML={{ __html: PEOPLE_CSS + CSS }} /></AdminShell>;
  }
  const e = q.id ? empBy(D, q.id) : null;
  if (!e) {
    return (
      <AdminShell active="staff" title="Employee">
        <style dangerouslySetInnerHTML={{ __html: PEOPLE_CSS + CSS }} />
        <div className="ix-page">
          <RecordHeader back="/admin/staff" backLabel="Back to staff" title="Employee" />
          <section className="ix-card"><div className="ix-empty"><EmptyState icon="user-x" title={q.id ? `No employee with the ID ${q.id}.` : 'No employee picked.'} actionLabel="Back to staff" onAction={() => { window.location.href = '/admin/staff'; }} /></div></section>
        </div>
      </AdminShell>
    );
  }

  const left = e.status === 'left';
  const more = [
    left ? null : { label: 'Change status', onClick: () => setSheet({ kind: 'status', status: '', reason: '', lastDay: '', error: '' }) },
    left ? null : { label: 'Change salary', onClick: () => setSheet({ kind: 'salary', ...Object.fromEntries(SALARY_PARTS.map(([k]) => [k, String(e.salary[k])])), reason: '', error: '' }) },
    left ? null : { label: 'Add leave', href: `/admin/leave?new=1&emp=${e.id}` },
    left ? null : { label: 'Start review', onClick: () => setSheet({ kind: 'review', cycle: CYCLES[0].id }) },
    { label: 'Admin access', onClick: () => go('access') },
    { label: 'Copy email', onClick: () => { try { navigator.clipboard.writeText(e.email); toast('Email copied'); } catch { toast(e.email); } } },
  ].filter(Boolean);

  const tabCounts = {
    leave: D.leave.filter((x) => x.emp === e.id && x.status === 'wait').length || null,
    attendance: D.fixes.filter((x) => x.emp === e.id && x.status === 'wait').length || null,
    tasks: (e.tasks || []).filter((x) => !x.done).length || null,
    documents: (e.docs || []).length || null,
    reporting: reportsOf(D, e.id).length || null,
  };

  let body = null;
  if (q.tab === 'personal') body = <PersonalTab e={e} />;
  if (q.tab === 'employment') body = <EmploymentTab D={D} e={e} t={t} />;
  if (q.tab === 'reporting') body = <ReportingTab D={D} e={e} />;
  if (q.tab === 'attendance') body = <AttendanceTab D={D} e={e} t={t} month={month} setMonth={setMonth} openFix={(id) => setReview({ kind: 'fix', id })} />;
  if (q.tab === 'leave') body = <LeaveTab D={D} e={e} t={t} openLeave={(id) => setReview({ kind: 'leave', id })} />;
  if (q.tab === 'salary') body = <SalaryTab D={D} e={e} onEdit={more.find((m) => m.label === 'Change salary').onClick} onSlip={(runId) => setSheet({ kind: 'slip', runId })} />;
  if (q.tab === 'tasks') body = <TasksTab e={e} />;
  if (q.tab === 'performance') body = <PerformanceTab D={D} e={e} onReview={(cycle) => setSheet({ kind: 'review', cycle })} onGoal={(g) => setSheet({ kind: 'goal', g, actual: String(g.actual), error: '' })} onNewGoal={() => setSheet({ kind: 'newgoal', title: '', kpi: '', target: '', unit: '', due: 'H2', lower: false, error: '' })} />;
  if (q.tab === 'documents') body = <DocumentsTab e={e} onAdd={() => setSheet({ kind: 'doc', name: '', docKind: DOC_KINDS[0], error: '' })} />;
  if (q.tab === 'access') body = <AccessTab e={e} />;

  // ---- side panels ----
  const set = (k) => (ev) => { const v = ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value; setSheet((o) => ({ ...o, [k]: v, error: '' })); };
  const err = (res) => { if (!res.ok) { setSheet((o) => ({ ...o, error: res.error })); return true; } return false; };
  const submit = (ev) => {
    ev.preventDefault();
    const x = sheet;
    if (x.kind === 'edit') {
      const res = updateEmployee(e.id, { designation: x.designation, dept: x.dept, manager: x.manager || null, phone: x.phone, email: x.email, workMode: x.workMode, address: x.address, emergency: { name: x.emName, relation: x.emRel, phone: x.emPhone } }, me);
      if (err(res)) return;
      toast(res.changed ? 'Details saved' : 'Nothing changed'); close();
    }
    if (x.kind === 'status') {
      const res = setStatus(e.id, x.status, { reason: x.reason, lastDay: x.lastDay }, me);
      if (err(res)) return;
      toast(`${e.name.split(' ')[0]} is now ${STATUSES[x.status].label.toLowerCase()}`); close();
    }
    if (x.kind === 'salary') {
      const res = setSalary(e.id, x, x.reason, me);
      if (err(res)) return;
      toast('Salary saved. This month’s draft payroll is worked out again.'); close();
    }
    if (x.kind === 'goal') {
      const res = setGoalActual(e.id, x.g.id, x.actual);
      if (err(res)) return;
      toast('Goal updated'); close();
    }
    if (x.kind === 'newgoal') {
      const res = addGoal(e.id, x);
      if (err(res)) return;
      toast('Goal added'); close();
    }
    if (x.kind === 'doc') {
      const res = addDocument(e.id, { name: x.name, kind: x.docKind }, me);
      if (err(res)) return;
      toast(`${x.name.trim()} added to the list`); close();
    }
  };
  const footer = (label) => (<>
    <button type="button" className="gc-btn gc-btn--neutral" onClick={close}>Cancel</button>
    <button type="submit" form="sv-form" className="gc-btn gc-btn--solid">{label}</button>
  </>);
  const errLine = sheet && sheet.error ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{sheet.error}</p> : null;
  const sheetGross = sheet && sheet.kind === 'salary' ? grossOf(Object.fromEntries(SALARY_PARTS.map(([k]) => [k, Number(String(sheet[k]).replace(/[^0-9.]/g, '')) || 0]))) : 0;
  const slipRun = sheet && sheet.kind === 'slip' ? D.runs.find((r) => r.id === sheet.runId) : null;

  return (
    <AdminShell active="staff" title={e.name}>
      <style dangerouslySetInnerHTML={{ __html: PEOPLE_CSS + CSS }} />
      <div className="ix-page">
        <RecordHeader back="/admin/staff" backLabel="Back to staff" title={e.name}
          about="One employee: personal and job details, who they report to, attendance, leave, salary and payslips, tasks, goals and reviews, documents, and what they can open in this super admin."
          badges={<EmpStatus e={e} />}
          meta={<><span className="pp-fig">{e.id}</span> · {e.designation} · {e.dept}</>}
          more={more}
          primary={left ? null : { label: 'Edit details', icon: 'pencil', onClick: () => setSheet({ kind: 'edit', designation: e.designation, dept: e.dept, manager: e.manager || '', phone: e.phone, email: e.email, workMode: e.workMode, address: e.address, emName: e.emergency.name, emRel: e.emergency.relation, emPhone: e.emergency.phone, error: '' }) }} />

        <section className="ix-card sv-tabs" aria-label="Sections">
          <IndexTabs label="Employee sections" tabs={TABS.map(([k, l]) => ({ key: k, id: 'sv-tab-' + k, label: l, count: tabCounts[k], on: q.tab === k, onClick: () => go(k) }))} />
        </section>
        <div role="tabpanel" aria-labelledby={'sv-tab-' + q.tab} className="ix-page">{body}</div>
      </div>

      <ReviewDrawer D={D} t={t} req={review} onClose={() => setReview(null)} />
      {slipRun ? <Payslip D={D} run={slipRun} line={slipRun.lines.find((l) => l.emp === e.id)} onClose={close} /> : null}
      <ReviewSheet D={D} open={!!sheet && sheet.kind === 'review'} init={{ emp: e.id, cycle: sheet && sheet.cycle }} onClose={close} />

      <Sheet open={!!sheet && sheet.kind === 'edit'} title="Edit details" onClose={close} footer={footer('Save')}>
        {sheet && sheet.kind === 'edit' ? (
          <form id="sv-form" className="pp-form" onSubmit={submit} noValidate>
            <div className="pp-two">
              <Field id="ed-des" label="Designation"><input id="ed-des" {...ctl()} value={sheet.designation} onChange={set('designation')} data-autofocus /></Field>
              <Field id="ed-dept" label="Department"><select id="ed-dept" {...ctl(null, true)} value={sheet.dept} onChange={set('dept')}>{DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}</select></Field>
            </div>
            <Field id="ed-mgr" label="Reports to">
              <select id="ed-mgr" {...ctl(null, true)} value={sheet.manager} onChange={set('manager')}><option value="">Board of directors</option>{current(D).filter((x) => x.id !== e.id).map((x) => <option key={x.id} value={x.id}>{x.name} · {x.dept}</option>)}</select>
            </Field>
            <div className="pp-two">
              <Field id="ed-mail" label="Work email"><input id="ed-mail" type="email" {...ctl()} value={sheet.email} onChange={set('email')} /></Field>
              <Field id="ed-phone" label="Mobile"><input id="ed-phone" type="tel" {...ctl()} value={sheet.phone} onChange={set('phone')} /></Field>
            </div>
            <div className="pp-two">
              <Field id="ed-mode" label="Works"><select id="ed-mode" {...ctl(null, true)} value={sheet.workMode} onChange={set('workMode')}>{['Office', 'Hybrid', 'Remote'].map((m) => <option key={m} value={m}>{m}</option>)}</select></Field>
              <Field id="ed-addr" label="Lives at"><input id="ed-addr" {...ctl()} value={sheet.address} onChange={set('address')} /></Field>
            </div>
            <span className="gc-label" style={{ marginBottom: -8 }}>Emergency contact</span>
            <div className="pp-two">
              <Field id="ed-emn" label="Name"><input id="ed-emn" {...ctl()} value={sheet.emName} onChange={set('emName')} /></Field>
              <Field id="ed-emr" label="Relation"><input id="ed-emr" {...ctl()} value={sheet.emRel} onChange={set('emRel')} /></Field>
            </div>
            <Field id="ed-emp" label="Phone"><input id="ed-emp" type="tel" {...ctl()} value={sheet.emPhone} onChange={set('emPhone')} /></Field>
            {errLine}
          </form>
        ) : null}
      </Sheet>

      <Sheet open={!!sheet && sheet.kind === 'status'} title="Change status" onClose={close} footer={footer('Change status')}>
        {sheet && sheet.kind === 'status' ? (
          <form id="sv-form" className="pp-form" onSubmit={submit} noValidate>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>Now: <EmpStatus e={e} /></p>
            <Field id="ss-st" label="New status">
              <select id="ss-st" {...ctl(null, true)} value={sheet.status} onChange={set('status')} data-autofocus><option value="">Choose</option>{Object.entries(STATUSES).filter(([k]) => k !== e.status).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
            </Field>
            {sheet.status === 'notice' || sheet.status === 'left' ? <Field id="ss-last" label="Last working day"><input id="ss-last" type="date" {...ctl()} value={sheet.lastDay} onChange={set('lastDay')} /></Field> : null}
            <Field id="ss-why" label="Reason" hint="Kept on the employment history."><textarea id="ss-why" className="gc-input" rows={3} style={{ minHeight: 72 }} value={sheet.reason} onChange={set('reason')} /></Field>
            {sheet.status === 'left' ? <div className="pp-note pp-note--warn"><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>They drop out of attendance and payroll after the last day. Remove their super admin role under Admin access.</span></div> : null}
            {errLine}
          </form>
        ) : null}
      </Sheet>

      <Sheet open={!!sheet && sheet.kind === 'salary'} title="Change salary" onClose={close} footer={footer('Save salary')}>
        {sheet && sheet.kind === 'salary' ? (
          <form id="sv-form" className="pp-form" onSubmit={submit} noValidate>
            <div className="pp-two">{SALARY_PARTS.map(([k, label]) => (
              <Field key={k} id={'sl-' + k} label={label + ' (৳)'}><input id={'sl-' + k} inputMode="numeric" {...ctl()} value={sheet[k]} onChange={set(k)} /></Field>
            ))}</div>
            <div className="pp-note pp-note--info"><Icon name="calculator" width="16" height="16" aria-hidden="true" />
              <span>Gross <b>{money(sheetGross)}</b> a month (now {money(grossOf(e.salary))}) · tax {money(monthlyTax(sheetGross))}.{' '}
                <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setSheet((o) => ({ ...o, ...Object.fromEntries(Object.entries(splitGross(sheetGross)).map(([k, v]) => [k, String(v)])) }))}>Split by the standard shares</button>
              </span>
            </div>
            <Field id="sl-why" label="Reason" hint="For example: yearly increment, promotion to senior."><input id="sl-why" {...ctl()} value={sheet.reason} onChange={set('reason')} /></Field>
            {errLine}
          </form>
        ) : null}
      </Sheet>

      <Sheet open={!!sheet && sheet.kind === 'goal'} title="Update goal" onClose={close} footer={footer('Save')}>
        {sheet && sheet.kind === 'goal' ? (
          <form id="sv-form" className="pp-form" onSubmit={submit} noValidate>
            <KV rows={[['Goal', sheet.g.title], ['KPI', sheet.g.kpi], ['Target', `${sheet.g.target} ${sheet.g.unit}${sheet.g.lower ? ' (lower is better)' : ''}`]]} />
            <Field id="gl-act" label={`Actual so far (${sheet.g.unit})`}><input id="gl-act" inputMode="decimal" {...ctl()} value={sheet.actual} onChange={set('actual')} data-autofocus /></Field>
            {errLine}
          </form>
        ) : null}
      </Sheet>

      <Sheet open={!!sheet && sheet.kind === 'newgoal'} title="Add goal" onClose={close} footer={footer('Add goal')}>
        {sheet && sheet.kind === 'newgoal' ? (
          <form id="sv-form" className="pp-form" onSubmit={submit} noValidate>
            <Field id="ng-t" label="Goal"><input id="ng-t" {...ctl()} value={sheet.title} onChange={set('title')} placeholder="e.g. Close tickets faster" data-autofocus /></Field>
            <Field id="ng-k" label="KPI"><input id="ng-k" {...ctl()} value={sheet.kpi} onChange={set('kpi')} placeholder="e.g. First reply (minutes)" /></Field>
            <div className="pp-two">
              <Field id="ng-tg" label="Target"><input id="ng-tg" inputMode="decimal" {...ctl()} value={sheet.target} onChange={set('target')} /></Field>
              <Field id="ng-u" label="Unit"><input id="ng-u" {...ctl()} value={sheet.unit} onChange={set('unit')} placeholder="%, stores, min …" /></Field>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)' }}><input type="checkbox" checked={sheet.lower} onChange={set('lower')} style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />Lower is better</label>
            {errLine}
          </form>
        ) : null}
      </Sheet>

      <Sheet open={!!sheet && sheet.kind === 'doc'} title="Add document" onClose={close} footer={footer('Add')}>
        {sheet && sheet.kind === 'doc' ? (
          <form id="sv-form" className="pp-form" onSubmit={submit} noValidate>
            <Field id="dc-k" label="Kind"><select id="dc-k" {...ctl(null, true)} value={sheet.docKind} onChange={(ev) => setSheet((o) => ({ ...o, docKind: ev.target.value, name: o.name || ev.target.value, error: '' }))}>{DOC_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}</select></Field>
            <Field id="dc-n" label="Name"><input id="dc-n" {...ctl()} value={sheet.name} onChange={set('name')} placeholder={sheet.docKind} data-autofocus /></Field>
            <p className="gc-help" style={{ margin: 0 }}>This demo keeps the document’s name and date, not the file. <InfoTip text="A real build stores the file on the server with access limited to HR and the person." /></p>
            {errLine}
          </form>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
