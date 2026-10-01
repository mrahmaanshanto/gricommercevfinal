'use client';
// HR setup — the rules every HR page uses (saved in src/lib/hr.js › settings):
// departments, salary split (the payslip lines), leave types and yearly quota, attendance rules
// (weekly off, late rule, half day, overtime), public holidays (shared with Accounts through
// src/lib/settlements.js), roles, and payroll settings (pay day, rounding, bonus, advance limit,
// default pay accounts).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Dialog } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { getConfig, saveConfig, HOLIDAYS_2026, fromKey } from '@/lib/settlements';
import { AccountSelect } from '@/screens/accounts/accShared';
import { saveSettings, WEEKDAYS, WEEK_ORDER, dowOf, todayKey } from '@/lib/hr';
import { HrPage, useHr } from './hrShared';

const CSS = `
.su-wrap{display:grid;grid-template-columns:minmax(200px,240px) minmax(0,1fr);gap:var(--space-5);align-items:start}
.su-nav{display:flex;flex-direction:column;gap:2px;padding:var(--space-2)}
.su-nav button{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);height:40px;padding:0 var(--space-3);border:0;border-radius:var(--radius-lg);background:none;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer;text-align:left}
.su-nav button:hover{background:var(--surface-subtle)}
.su-nav button[aria-current="true"]{background:var(--fill-primary-soft);color:var(--primary)}
.su-nav small{font-size:var(--text-xs);color:var(--text-muted);font-variant-numeric:tabular-nums}
.su-body{display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-4) var(--space-5) var(--space-5)}
.su-rows{display:flex;flex-direction:column}
.su-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(200px,280px);align-items:center;gap:var(--space-4);padding:var(--space-3) 0;border-bottom:1px solid var(--border-subtle)}
.su-row:last-child{border-bottom:0}
.su-row b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.su-days{display:flex;flex-wrap:wrap;gap:6px}
.su-day{height:36px;min-width:48px;padding:0 var(--space-3);border:1px solid var(--border-field);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.su-day[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.su-split{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:var(--space-3)}
.su-dept{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:var(--space-3)}
.su-deptcard{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);text-align:left;font:inherit;background:var(--surface-card);cursor:pointer}
.su-deptcard:hover{border-color:var(--primary)}
.su-deptcard b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.su-tags{display:flex;flex-wrap:wrap;gap:6px}
@media (max-width:1023px){.su-wrap{grid-template-columns:minmax(0,1fr)}.su-nav{flex-direction:row;overflow-x:auto}.su-nav button{flex:none}}
@media (max-width:640px){.su-row{grid-template-columns:minmax(0,1fr)}.su-split{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;
const SECS = [['dept', 'Departments'], ['ids', 'Employee numbers & ID cards'], ['docs', 'Documents'], ['pay', 'Salary components'], ['leave', 'Leave types'], ['att', 'Attendance rules'], ['hol', 'Holidays'], ['roles', 'Roles and permissions'], ['run', 'Payroll settings']];
const ROLES = [['Owner', 'Everything', '—'], ['Manager', 'Orders, stock, staff attendance, approve leave', 'Salary of others, delete data'], ['Cashier', 'POS, returns up to ৳2,000, own attendance', 'Discounts over 10%, reports'], ['Sales staff', 'POS, customers', 'Refunds, cash drawer'], ['Stock staff', 'Receive goods, stock count, transfers', 'Prices, orders'], ['Rider', 'Rider app, own deliveries', 'Admin panel'], ['Accounts', 'Payroll, accounting, reports', 'Change products'], ['Support', 'Inbox, tickets, orders (view)', 'Refunds, stock'], ['Marketing', 'Campaigns, social posts, reviews', 'Orders, money']];

function Switch({ on, onChange, label }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className="gc-switch" onClick={() => onChange(!on)}><span className="gc-switch__knob" /></button>;
}

export default function HrSetup() {
  const { S } = useHr();
  const set = S.settings;
  const [sec, setSec] = useState('pay');
  const [split, setSplit] = useState(null);
  const [dept, setDept] = useState(null);
  const [lt, setLt] = useState(null);
  const [hol, setHol] = useState(null);
  const [cfg, setCfg] = useState(null);
  useEffect(() => { const s = new URLSearchParams(window.location.search).get('sec'); if (SECS.some((x) => x[0] === s)) setSec(s); setCfg(getConfig()); }, []);
  const holidays = [...HOLIDAYS_2026.filter(([k]) => !((cfg || {}).holidaysRemoved || []).includes(k)), ...((cfg || {}).holidaysAdded || [])].sort((a, b) => a[0].localeCompare(b[0]));
  const sp = split || set.split.map(([id, l, p]) => [id, l, String(p)]);
  const spTotal = sp.reduce((a, x) => a + (Number(x[2]) || 0), 0);

  const put = (patch, msg) => { saveSettings(patch); toast(msg || 'Saved. Used from the next payroll and roster.'); };
  const count = (k) => ({ dept: set.departments.length, docs: (set.docTypes || []).length, pay: set.split.length + 5, leave: set.leaveTypes.length, hol: holidays.length, roles: ROLES.length }[k]);
  const emp = set.empNo || { prefix: 'EMP-', digits: 4 };
  const card = set.idCard || {};
  const saveSplit = (e) => {
    e.preventDefault();
    if (Math.abs(spTotal - 100) > 0.001) { toast(`The parts add up to ${spTotal}% — they must make 100%`, { tone: 'error' }); return; }
    put({ split: sp.map(([id, l, p]) => [id, l, Number(p)]) }, 'Salary split saved. Payslips from the next payroll use it.');
    setSplit(null);
  };
  const saveDept = (e) => {
    e.preventDefault();
    if (!dept.name.trim()) { toast('Name the department', { tone: 'error' }); return; }
    const row = { name: dept.name.trim(), titles: dept.titles.split(',').map((x) => x.trim()).filter(Boolean), head: dept.head };
    const list = dept.old ? set.departments.map((d) => (d.name === dept.old ? row : d)) : [...set.departments, row];
    put({ departments: list }, `${row.name} saved.`);
    setDept(null);
  };
  const saveLt = (e) => {
    e.preventDefault();
    if (!lt.name.trim()) { toast('Name the leave type', { tone: 'error' }); return; }
    const row = { ...lt, name: lt.name.trim(), days: lt.days === '' ? null : Number(lt.days), carry: Number(lt.carry) || 0, id: lt.id || lt.name.trim().toLowerCase().replace(/[^a-z]+/g, '-') };
    delete row.isNew;
    const list = lt.isNew ? [...set.leaveTypes, row] : set.leaveTypes.map((t) => (t.id === row.id ? row : t));
    put({ leaveTypes: list }, `${row.name} leave saved. Balances update now.`);
    setLt(null);
  };
  const saveHol = (e) => {
    e.preventDefault();
    if (!hol.date || !hol.name.trim()) { toast('Pick the date and name the holiday', { tone: 'error' }); return; }
    const c = getConfig();
    saveConfig({ ...c, holidaysAdded: [...(c.holidaysAdded || []).filter(([k]) => k !== hol.date), [hol.date, hol.name.trim()]], holidaysRemoved: (c.holidaysRemoved || []).filter((k) => k !== hol.date) });
    setCfg(getConfig());
    toast(`${hol.name.trim()} on ${formatDate(fromKey(hol.date))} added. The roster, attendance and payout days use it.`);
    setHol(null);
  };
  const removeHol = ([k, name]) => confirmDialog({ title: `Remove ${name}?`, body: `${formatDate(fromKey(k))} becomes a normal working day on the roster, in attendance and for payouts.`, confirmLabel: 'Remove holiday', tone: 'danger' }).then((ok) => {
    if (!ok) return;
    const c = getConfig();
    const added = (c.holidaysAdded || []).some(([x]) => x === k);
    saveConfig({ ...c, holidaysAdded: (c.holidaysAdded || []).filter(([x]) => x !== k), holidaysRemoved: added ? c.holidaysRemoved || [] : [...(c.holidaysRemoved || []), k] });
    setCfg(getConfig());
    toast(`${name} removed.`, { tone: 'info' });
  });
  const toggleOff = (d) => { const next = set.weeklyOff.includes(d) ? set.weeklyOff.filter((x) => x !== d) : [...set.weeklyOff, d]; put({ weeklyOff: next }, next.length ? `Weekly off: ${next.map((x) => WEEKDAYS[x]).join(', ')}. The roster follows it.` : 'No fixed weekly off — plan days off on the roster.'); };

  const head = (title, text, action) => <div className="hr-head" style={{ borderBottom: '1px solid var(--border-subtle)' }}><div><h2>{title}</h2><p>{text}</p></div>{action}</div>;
  const row = (title, text, control) => <div className="su-row"><span><b>{title}</b><span className="hr-sub">{text}</span></span><div>{control}</div></div>;
  const select = (id, value, opts, onChange) => <select id={id} className="gc-input gc-select" value={String(value)} onChange={(e) => onChange(e.target.value)}>{opts.map(([v, l]) => <option key={v} value={String(v)}>{l}</option>)}</select>;

  return (
    <HrPage screen="HrSetup" active="hr-setup" page="HR setup" title="HR setup" css={CSS}
      description="The rules attendance, the roster, leave and payroll use. Changes apply from the next payroll — approved months stay as they were.">
      <div className="su-wrap">
        <nav className="gc-card su-nav" aria-label="HR setup sections">
          {SECS.map(([k, l]) => <button key={k} type="button" aria-current={sec === k} onClick={() => setSec(k)}>{l}{count(k) != null ? <small>{count(k)}</small> : null}</button>)}
        </nav>
        <section className="gc-card hr-card">
          {sec === 'dept' ? <>
            {head('Departments and designations', 'Used on the staff profile, reports and payroll groups. Grades and salary bands are in Positions & grades.', <div className="hr-actions"><Link href="/positions" className="gc-btn gc-btn--sm gc-btn--neutral"><Icon name="network" width="14" height="14" aria-hidden="true" /> Positions & grades</Link><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setDept({ name: '', titles: '', head: 'Owner' })}><Icon name="plus" width="14" height="14" aria-hidden="true" /> Department</button></div>)}
            <div className="su-body">
              <div className="su-dept">
                {set.departments.map((d) => (
                  <button key={d.name} type="button" className="su-deptcard" onClick={() => setDept({ old: d.name, name: d.name, titles: d.titles.join(', '), head: d.head })}>
                    <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><b>{d.name}</b><span className="gc-badge gc-badge--slate">{S.staff.filter((s) => s.department === d.name && s.status !== 'left').length} staff</span></span>
                    <span className="su-tags">{d.titles.map((t) => <span key={t} className="hr-chip" style={{ background: 'var(--surface-subtle)', color: 'var(--text-body)' }}>{t}</span>)}</span>
                    <span className="hr-sub">Head: {d.head}</span>
                  </button>
                ))}
              </div>
            </div>
          </> : null}

          {sec === 'ids' ? <>
            {head('Employee numbers & ID cards', 'The number every new person gets, and what the ID card shows.', <Link href="/id-cards" className="gc-btn gc-btn--sm gc-btn--neutral"><Icon name="id-card" width="14" height="14" aria-hidden="true" /> Print ID cards</Link>)}
            <div className="su-body su-rows">
              {row('Starts with', 'Letters before the number, e.g. EMP- or GS-.', <input className="gc-input hr-fig" aria-label="Employee number starts with" value={emp.prefix} maxLength={6} onChange={(e) => saveSettings({ empNo: { ...emp, prefix: e.target.value.toUpperCase().replace(/[^A-Z-]/g, '') } })} />)}
              {row('Digits', `The next person gets ${emp.prefix}${String(S.staff.reduce((m, x) => Math.max(m, Number(String(x.code).replace(/\D/g, '')) || 0), 0) + 1).padStart(emp.digits, '0')}. People already on the list keep their numbers.`, select('su-digits', emp.digits, [[3, '3 · 001'], [4, '4 · 0001'], [5, '5 · 00001']], (v) => put({ empNo: { ...emp, digits: Number(v) } }, 'Employee numbers saved.')))}
              {row('QR on the card holds', 'The employee number works with the POS and the attendance kiosk; a link lets anyone check the card on a phone.', select('su-qr', card.qr || 'code', [['code', 'Employee number'], ['link', 'Link to check the card']], (v) => put({ idCard: { ...card, qr: v } }, 'ID card QR saved.')))}
              {row('Card valid for', 'Printed on the back.', select('su-valid', card.validYears || 2, [[1, '1 year'], [2, '2 years'], [3, '3 years']], (v) => put({ idCard: { ...card, validYears: Number(v) } }, 'Saved.')))}
              {row('Machines and gratuity', 'Attendance machines and the gratuity rule have their own pages.', <div className="hr-actions" style={{ justifyContent: 'flex-start' }}><Link href="/attendance-devices" className="gc-btn gc-btn--sm gc-btn--neutral">Attendance devices</Link><Link href="/gratuity" className="gc-btn gc-btn--sm gc-btn--neutral">Gratuity</Link></div>)}
            </div>
          </> : null}

          {sec === 'docs' ? <>
            {head('Documents', 'Papers kept on each profile. Required ones show as missing until uploaded.')}
            <div className="su-body su-rows">
              {(set.docTypes || []).map(([k, l, need]) => <React.Fragment key={k}>{row(l, need ? 'Required for everyone' : 'Optional', <Switch on={!!need} label={`${l} required`} onChange={(v) => put({ docTypes: set.docTypes.map((d) => (d[0] === k ? [d[0], d[1], v] : d)) }, `${l} is ${v ? 'required' : 'optional'} now.`)} />)}</React.Fragment>)}
              <p className="hr-sub" style={{ margin: 0 }}>{S.staff.filter((x) => x.status !== 'left' && (set.docTypes || []).some(([k, , need]) => need && !(x.docs || []).some((d) => d.kind === k))).length} people are missing a required paper.</p>
            </div>
          </> : null}

          {sec === 'pay' ? <>
            {head('Salary components', 'How gross salary is split on the payslip, and what is added or cut each month.')}
            <form className="su-body" onSubmit={saveSplit}>
              <div className="su-split">
                {sp.map(([id, l, p], i) => <div key={id}><label className="gc-label" htmlFor={'sp-' + id}>{l} (%)</label><input id={'sp-' + id} className="gc-input hr-fig" inputMode="decimal" value={p} onChange={(e) => setSplit(sp.map((x, j) => (j === i ? [x[0], x[1], e.target.value.replace(/[^\d.]/g, '')] : x)))} /></div>)}
              </div>
              <div className={'hr-note ' + (Math.abs(spTotal - 100) < 0.001 ? 'hr-note--ok' : 'hr-note--warn')}><Icon name={Math.abs(spTotal - 100) < 0.001 ? 'circle-check' : 'triangle-alert'} width="16" height="16" aria-hidden="true" /><span>{sp.map(([, l, p]) => `${l} ${p || 0}%`).join(' + ')} = <b>{spTotal}%</b> of gross. Basic is also what advances and festival bonuses are worked out from.</span></div>
              {split ? <div className="hr-actions"><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setSplit(null)}>Undo</button><button type="submit" className="gc-btn gc-btn--solid">Save split</button></div> : null}
              <table className="hr-mini">
                <thead><tr><th scope="col">Added or cut each month</th><th scope="col">Type</th><th scope="col">How it is worked out</th><th scope="col">Comes from</th></tr></thead>
                <tbody>
                  <tr><td>Overtime</td><td className="hr-in">Earning</td><td>Hours × {set.otRate || 0} × gross ÷ ({set.monthDays === 'calendar' ? 'days in month' : '30'} × {set.hoursPerDay} h), to the nearest ৳10</td><td>Attendance</td></tr>
                  <tr><td>Sales incentive</td><td className="hr-in">Earning</td><td>1% of own POS sales above ৳1,00,000 — typed in the salary sheet</td><td>Payroll review</td></tr>
                  <tr><td>One-time line</td><td>Either</td><td>Bonus, uniform, phone bill… for one month</td><td>Payroll review</td></tr>
                  <tr><td>Late / absence cut</td><td className="hr-out">Deduction</td><td>Gross ÷ {set.monthDays === 'calendar' ? 'days in month' : '30'} × (absent + unpaid leave + ½ half days{set.lateRule === 'days' ? ` + 1 per ${set.latesPerCut} lates` : ''})</td><td>Attendance · Leave</td></tr>
                  <tr><td>Loan instalment · advance recovery</td><td className="hr-out">Deduction</td><td>The monthly amount set when it was given</td><td><Link href="/loans-advances" className="hr-link">Loans & advances</Link></td></tr>
                </tbody>
              </table>
            </form>
          </> : null}

          {sec === 'leave' ? <>
            {head('Leave types and policy', 'Defaults follow the Bangladesh Labour Act, 2006. Change them if your policy gives more.', <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setLt({ isNew: true, name: '', days: '5', paid: true, carry: '0', needs: '—', who: 'Everyone' })}><Icon name="plus" width="14" height="14" aria-hidden="true" /> Leave type</button>)}
            <div className="gc-table-wrap">
              <table className="gc-table gc-table--compact gc-table--hoverable">
                <thead><tr><th scope="col">Leave type</th><th scope="col">Days a year</th><th scope="col">Paid</th><th scope="col">Carry forward</th><th scope="col">Needs</th><th scope="col">Who gets it</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>{set.leaveTypes.map((t) => <tr key={t.id}><td className="hr-strong">{t.name}</td><td>{t.accrue ? `1 per ${t.accrue} days worked` : t.days ?? 'As approved'}</td><td>{t.paid ? 'Yes' : <span className="hr-out">No — cut</span>}</td><td>{t.carry ? `Up to ${t.carry} days` : 'No'}</td><td>{t.needs}</td><td>{t.who}</td><td><div className="hr-actions"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setLt({ ...t, days: t.days == null ? '' : String(t.days), carry: String(t.carry || 0) })}>Edit</button></div></td></tr>)}</tbody>
              </table>
            </div>
            <div className="su-body" style={{ paddingTop: 0 }}>
              <div className="su-rows">
                {row('Who approves leave', 'Requests from the staff app go to', select('su-appr', set.leaveApprover, [['manager-owner', 'Branch manager, then owner'], ['owner', 'Owner only'], ['manager', 'Branch manager only']], (v) => put({ leaveApprover: v })))}
                {row('People off at once', 'Warn when a branch has this many off on one day', select('su-offwarn', set.offWarn, [[2, '2 or more'], [3, '3 or more'], [99, 'Never warn']], (v) => put({ offWarn: Number(v) })))}
              </div>
            </div>
          </> : null}

          {sec === 'att' ? <>
            {head('Attendance rules', 'Used to mark late, half day and overtime — and to cut or add pay.')}
            <div className="su-body"><div className="su-rows">
              {row('Weekly off', 'Days the shops are closed for staff. Anyone can have their own off days on the roster.', <div className="su-days" role="group" aria-label="Weekly off">{WEEK_ORDER.map((d) => <button key={d} type="button" className="su-day" aria-pressed={set.weeklyOff.includes(d)} onClick={() => toggleOff(d)}>{WEEKDAYS[d]}</button>)}</div>)}
              {row('Working hours a day', 'For the hourly rate (overtime) and per-minute cuts', select('su-hours', set.hoursPerDay, [[8, '8 hours'], [9, '9 hours'], [10, '10 hours']], (v) => put({ hoursPerDay: Number(v) })))}
              {row('Grace time for new shifts', 'Each shift keeps its own grace (Shifts & roster)', select('su-grace', set.graceMin, [[5, '5 minutes'], [10, '10 minutes'], [15, '15 minutes']], (v) => put({ graceMin: Number(v) })))}
              {row('Late rule', 'When lates turn into a pay cut', select('su-late', set.lateRule === 'days' ? `days-${set.latesPerCut}` : set.lateRule, [['days-3', '3 lates = 1 day cut'], ['days-4', '4 lates = 1 day cut'], ['minutes', 'Cut per minute late'], ['warn', 'Warn only']], (v) => put(v.startsWith('days') ? { lateRule: 'days', latesPerCut: Number(v.slice(5)) } : { lateRule: v })))}
              {row('Half day', 'Worked less than', select('su-half', set.halfDayHours, [[4, '4 hours'], [5, '5 hours']], (v) => put({ halfDayHours: Number(v) })))}
              {row('Overtime', 'Paid rate for time after the shift ends', select('su-ot', set.otRate, [[2, '2× hourly rate'], [1.5, '1.5× hourly rate'], [0, 'No overtime']], (v) => put({ otRate: Number(v) })))}
              {row('Fingerprint device', 'ZKTeco at Dhanmondi, Mirpur and the warehouse', <Switch on={set.device} label="Fingerprint device" onChange={(v) => put({ device: v }, v ? 'Device punches are used.' : 'Device punches are ignored.')} />)}
              {row('POS log-in counts as clock-in', 'Cashiers are marked present when they open the register', <Switch on={set.posIn} label="POS log-in counts as clock-in" onChange={(v) => put({ posIn: v })} />)}
              {row('Staff app check-in only inside the shop', 'Uses the phone’s location — 100 m around the branch', <Switch on={set.geo} label="Location check" onChange={(v) => put({ geo: v })} />)}
            </div></div>
          </> : null}

          {sec === 'hol' ? <>
            {head('Holidays', 'Paid days off for everyone. Shown on the roster and attendance register, and used for payout days in Accounts.', <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setHol({ date: todayKey(S), name: '' })}><Icon name="plus" width="14" height="14" aria-hidden="true" /> Holiday</button>)}
            <div className="gc-table-wrap">
              <table className="gc-table gc-table--compact gc-table--hoverable">
                <thead><tr><th scope="col">Date</th><th scope="col">Holiday</th><th scope="col">Day</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>{holidays.map(([k, name]) => <tr key={k} style={k < todayKey(S) ? { opacity: 0.6 } : undefined}><td className="hr-fig">{formatDate(fromKey(k))}</td><td className="hr-strong">{name}</td><td>{WEEKDAYS[dowOf(k)]}{set.weeklyOff.includes(dowOf(k)) ? ' · weekly off anyway' : ''}</td><td><div className="hr-actions"><button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => removeHol([k, name])} aria-label={`Remove ${name}`}>Remove</button></div></td></tr>)}</tbody>
              </table>
            </div>
            <p className="hr-sub" style={{ margin: 0, padding: 'var(--space-3) var(--space-5)' }}>Dates that follow the moon (Eid, Ashura) can move a day or two — correct them here when the government announces them.</p>
          </> : null}

          {sec === 'roles' ? <>
            {head('Roles and permissions', 'What each role can see and do in the admin and POS. Change one person’s role on All staff.', <Link href="/staff-access" className="gc-btn gc-btn--sm gc-btn--neutral">Staff access</Link>)}
            <div className="gc-table-wrap">
              <table className="gc-table gc-table--compact">
                <thead><tr><th scope="col">Role</th><th scope="col" className="hr-num">People</th><th scope="col">Can do</th><th scope="col">Can not</th></tr></thead>
                <tbody>{ROLES.map(([r, y, x]) => <tr key={r}><td className="hr-strong">{r}</td><td className="hr-num">{r === 'Owner' ? 1 : S.staff.filter((s) => s.role === r && s.status !== 'left').length}</td><td>{y}</td><td className="hr-sub" style={{ display: 'table-cell' }}>{x}</td></tr>)}</tbody>
              </table>
            </div>
          </> : null}

          {sec === 'run' ? <>
            {head('Payroll settings', 'When and how salary is paid.')}
            <div className="su-body"><div className="su-rows">
              {row('Pay day', 'Salary for a month is due on — sets the due date of the salary liability', select('su-payday', set.payDay, [['first', '1st of next month'], ['last', 'Last day of the month'], ['seventh', '7th of next month']], (v) => put({ payDay: v })))}
              {row('Days in a month', 'Used for per-day pay and cuts', select('su-mdays', set.monthDays, [['fixed', '30 days (fixed)'], ['calendar', 'Calendar days']], (v) => put({ monthDays: v })))}
              {row('Rounding', 'Net pay rounded to', select('su-round', set.rounding, [[1, 'Nearest ৳1'], [10, 'Nearest ৳10']], (v) => put({ rounding: Number(v) })))}
              {row('Festival bonus', 'Default for Eid and Puja bonus runs', select('su-bonus', `${set.bonusPct}-${set.bonusMonths}`, [['100-6', '100% of basic · 6+ months'], ['50-6', '50% of basic · 6+ months'], ['100-0', '100% of basic · everyone']], (v) => { const [p, m] = v.split('-').map(Number); put({ bonusPct: p, bonusMonths: m }); }))}
              {row('Advance limit', 'Largest single salary advance — more needs the owner', select('su-adv', set.advanceLimit, [[50, '50% of basic'], [100, '100% of basic'], [0, 'No limit']], (v) => put({ advanceLimit: Number(v) })))}
              {row('Send payslip by SMS', 'A short link to the payslip goes to each staff member', <Switch on={set.slipSms} label="Send payslip by SMS" onChange={(v) => put({ slipSms: v })} />)}
            </div>
            <div className="hr-three">
              {[['bank', 'Bank staff are paid from'], ['bkash', 'bKash staff are paid from'], ['cash', 'Cash staff are paid from']].map(([m, l]) => <AccountSelect key={m} id={'su-acc-' + m} label={l} value={set.payAccounts[m]} onChange={(v) => put({ payAccounts: { ...set.payAccounts, [m]: v } }, 'Default pay account saved. It is used for new staff; each person can have their own on All staff.')} />)}
            </div>
            <p className="gc-help" style={{ margin: 0 }}>Salary payments always post to Accounts › Money book, one line per person, when payroll is paid.</p>
            </div>
          </> : null}
        </section>
      </div>

      <Dialog open={!!dept} title={dept && dept.old ? `Edit · ${dept.old}` : 'New department'} onClose={() => setDept(null)} width={520}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDept(null)}>Cancel</button><button type="submit" form="su-dept" className="gc-btn gc-btn--solid">Save</button></>}>
        {dept ? (
          <form id="su-dept" className="hr-form" onSubmit={saveDept}>
            <div><label className="gc-label" htmlFor="dp-name">Name</label><input id="dp-name" className="gc-input" value={dept.name} onChange={(e) => setDept({ ...dept, name: e.target.value })} data-autofocus /></div>
            <div><label className="gc-label" htmlFor="dp-titles">Designations</label><input id="dp-titles" className="gc-input" value={dept.titles} onChange={(e) => setDept({ ...dept, titles: e.target.value })} placeholder="Cashier, Sales associate" /><span className="gc-help">Separate with commas.</span></div>
            <div><label className="gc-label" htmlFor="dp-head">Head</label><select id="dp-head" className="gc-input gc-select" value={dept.head} onChange={(e) => setDept({ ...dept, head: e.target.value })}><option>Owner</option>{S.staff.filter((s) => s.status !== 'left').map((s) => <option key={s.code}>{s.name}</option>)}</select></div>
          </form>
        ) : null}
      </Dialog>

      <Dialog open={!!lt} title={lt && !lt.isNew ? `Edit · ${lt.name} leave` : 'New leave type'} onClose={() => setLt(null)} width={560}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setLt(null)}>Cancel</button><button type="submit" form="su-lt" className="gc-btn gc-btn--solid">Save</button></>}>
        {lt ? (
          <form id="su-lt" className="hr-form" onSubmit={saveLt}>
            <div className="hr-two">
              <div><label className="gc-label" htmlFor="lt-name">Name</label><input id="lt-name" className="gc-input" value={lt.name} onChange={(e) => setLt({ ...lt, name: e.target.value })} data-autofocus /></div>
              {lt.accrue ? <div><label className="gc-label" htmlFor="lt-acc">1 day for every … days worked</label><input id="lt-acc" className="gc-input hr-fig" inputMode="numeric" value={lt.accrue} onChange={(e) => setLt({ ...lt, accrue: Number(e.target.value.replace(/[^\d]/g, '')) || 18 })} /></div>
                : <div><label className="gc-label" htmlFor="lt-days">Days a year</label><input id="lt-days" className="gc-input hr-fig" inputMode="numeric" placeholder="Blank = as approved" value={lt.days} onChange={(e) => setLt({ ...lt, days: e.target.value.replace(/[^\d]/g, '') })} /></div>}
            </div>
            <div className="hr-two">
              <div><label className="gc-label" htmlFor="lt-carry">Carry forward (days)</label><input id="lt-carry" className="gc-input hr-fig" inputMode="numeric" value={lt.carry} onChange={(e) => setLt({ ...lt, carry: e.target.value.replace(/[^\d]/g, '') })} /></div>
              <div><label className="gc-label" htmlFor="lt-needs">Needs</label><input id="lt-needs" className="gc-input" value={lt.needs} onChange={(e) => setLt({ ...lt, needs: e.target.value })} /></div>
            </div>
            <div><label className="gc-label" htmlFor="lt-who">Who gets it</label><input id="lt-who" className="gc-input" value={lt.who} onChange={(e) => setLt({ ...lt, who: e.target.value })} /></div>
            <label className="hr-check"><input type="checkbox" checked={lt.paid} onChange={(e) => setLt({ ...lt, paid: e.target.checked })} />Paid leave (unticked = cut from salary)</label>
          </form>
        ) : null}
      </Dialog>

      <Dialog open={!!hol} title="Add a holiday" onClose={() => setHol(null)} width={480}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setHol(null)}>Cancel</button><button type="submit" form="su-hol" className="gc-btn gc-btn--solid">Add holiday</button></>}>
        {hol ? (
          <form id="su-hol" className="hr-form" onSubmit={saveHol}>
            <div className="hr-two">
              <div><label className="gc-label" htmlFor="hl-date">Date</label><input id="hl-date" type="date" className="gc-input" value={hol.date} onChange={(e) => setHol({ ...hol, date: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="hl-name">Holiday</label><input id="hl-name" className="gc-input" value={hol.name} onChange={(e) => setHol({ ...hol, name: e.target.value })} placeholder="e.g. Shab-e-Barat" data-autofocus /></div>
            </div>
          </form>
        ) : null}
      </Dialog>
    </HrPage>
  );
}
