'use client';
// All staff — the one staff list (src/lib/hr.js). New people join through Add staff (/staff-create, the 7-step
// flow); each name opens the full profile. Quick edit here changes place, shift, role and status.
// "Today" comes from Attendance, "On leave" from approved leave.

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, EmptyState } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { fromKey } from '@/lib/settlements';
import {
  todayKey, cellOf, statusOf, saveStaff, nextStaffCode, shiftBy, t12, HR_PLACES, PAY_METHODS, STAFF_TYPES, LOGIN_ROLES, STAFF_STATUS,
} from '@/lib/hr';
import Link from 'next/link';
import { HrPage, useHr, Person, Avatar, ShiftChip, StaffStatus, money, profileHref } from './hrShared';

const CSS = `
.as-search{position:relative;min-width:220px;flex:1 1 220px;max-width:320px}
.as-search svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted)}
.as-search input{padding-left:38px}
.as-place{width:auto;min-width:190px}
.as-sel{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-5);background:var(--fill-primary-soft);border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm)}
.as-sel b{font-weight:var(--weight-semibold);color:var(--primary);margin-right:auto}
.as-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:var(--space-3);padding:var(--space-4) var(--space-5)}
.as-card{text-decoration:none;color:inherit;display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);text-align:left;font:inherit;cursor:pointer;min-width:0}
.as-card:hover{border-color:var(--primary);box-shadow:var(--shadow-sm)}
.as-card b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.as-chips{display:flex;flex-wrap:wrap;gap:6px}
.as-sec{margin:0;font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
@media (max-width:640px){.as-search{max-width:none}.as-place{width:100%}}
`;
const FILTERS = [['all', 'All'], ['active', 'Active'], ['probation', 'Probation'], ['leave', 'On leave'], ['suspended', 'Suspended']];
const TODAY = { P: ['Present · on time', 'hr-in'], L: ['Late', 'hr-warn'], A: ['Absent', 'hr-out'], HD: ['Half day', 'hr-warn'], V: ['On leave', ''], U: ['Unpaid leave', ''], W: ['Weekly off', ''], H: ['Holiday', ''], S: ['—', ''], wait: ['Not in yet', ''], '?': ['Not marked', 'hr-warn'], '·': ['—', ''] };
const csvOf = (rows) => rows.map((r) => r.map((x) => `"${String(x ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
function download(name, text) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' })); a.download = name; a.click(); }

export default function AllStaff() {
  const { S } = useHr();
  const today = todayKey(S);
  const [f, setF] = useState('all');
  const [place, setPlace] = useState('');
  const [q, setQ] = useState('');
  const [view, setView] = useState('table');
  const [sel, setSel] = useState([]);
  const [form, setForm] = useState(null);
  const [assign, setAssign] = useState(null);

  const all = S.staff.filter((s) => s.status !== 'left');
  const statusCount = (k) => all.filter((s) => k === 'all' || statusOf(S, s) === k).length;
  const needle = q.trim().toLowerCase();
  const list = all.filter((s) => (f === 'all' || statusOf(S, s) === f) && (!place || s.branch === place) && (!needle || `${s.name} ${s.code} ${s.phone} ${s.designation}`.toLowerCase().includes(needle)));
  const todayOf = (s) => { const c = cellOf(S, s.code, today); const [l, cls] = TODAY[c.code] || TODAY['·']; return { l: c.code === 'L' ? `Late · ${t12(c.rec.in)}` : c.code === 'P' && c.rec ? `In · ${t12(c.rec.in)}` : c.code === 'wait' && c.plan.shifts[0] ? `Starts ${t12((shiftBy(S, c.plan.shifts[0]) || {}).start)}` : l, cls, code: c.code }; };
  const todays = all.map(todayOf);
  const present = todays.filter((t) => ['P', 'L', 'HD'].includes(t.code)).length;
  const payroll = all.filter((s) => s.status !== 'suspended').reduce((a, s) => a + s.gross, 0);
  const places = [...new Set(all.map((s) => s.branch))];

  const exportRows = (rows) => {
    download('staff.csv', csvOf([['Code', 'Name', 'Designation', 'Department', 'Place', 'Shift', 'Gross', 'Type', 'Status', 'Phone', 'Joined', 'Login role', 'Pay by', 'Paid to'], ...rows.map((s) => [s.code, s.name, s.designation, s.department, s.branch, (shiftBy(S, s.shift) || {}).name, s.gross, s.type, STAFF_STATUS[statusOf(S, s)][0], s.phone, s.joined, s.role, PAY_METHODS[s.payMethod], s.payTo])]));
    toast(`${rows.length} staff exported as CSV.`);
  };
  const save = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast('Enter the name', { tone: 'error' }); return; }
    if (!/^01\d{3}-?[\dX]{6}$/.test(form.phone.replace(/\s/g, ''))) { toast('Phone looks wrong — use 01XXX-XXXXXX', { tone: 'error' }); return; }
    const { isNew, ...row } = form;
    if (row.status === 'suspended' && !row.suspendedFrom) row.suspendedFrom = today;
    if (row.status !== 'suspended') delete row.suspendedFrom;
    const saved = saveStaff({ ...row, gross: Number(row.gross), name: row.name.trim(), type: row.status === 'probation' ? 'Probation' : row.type });
    toast(`${saved.name} saved.`);
    setForm(null);
  };
  const saveAssign = (e) => {
    e.preventDefault();
    sel.forEach((code) => { const s = S.staff.find((x) => x.code === code); saveStaff({ ...s, shift: assign }); });
    toast(`${sel.length} staff now on the ${shiftBy(S, assign).name} shift by default. Change single days in Shifts & roster.`);
    setAssign(null); setSel([]);
  };
  const edit = (s) => setForm({ ...s, gross: String(s.gross), payTo: s.payTo || '' });
  const tick = (code) => setSel(sel.includes(code) ? sel.filter((c) => c !== code) : [...sel, code]);

  return (
    <HrPage screen="AllStaff" active="hr-staff" page="All staff" title="All staff" css={CSS}
      description="Everyone who works for the shop: where, which shift, what they earn and how they are paid."
      actions={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => toast('Staff import from a spreadsheet is not in the demo yet. Add people one by one with Add staff.', { tone: 'info' })}><Icon name="upload" width="18" height="18" aria-hidden="true" /> Import</button>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => exportRows(list)}><Icon name="download" width="18" height="18" aria-hidden="true" /> Export</button>
        <Link href="/staff-create" className="gc-btn gc-btn--solid"><Icon name="user-plus" width="18" height="18" aria-hidden="true" /> Add staff</Link>
      </>}>

      <div className="gc-kpis">
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="users" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Total staff</p><p className="gc-kpi__value">{all.length}<small>across {places.length} places</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-success-soft)', color: 'var(--text-success)' }}><Icon name="user-check" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Present today</p><p className="gc-kpi__value">{present}<small>{todays.filter((t) => t.code === 'L').length} late · {todays.filter((t) => t.code === 'V' || t.code === 'U').length} on leave</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-warning-soft)', color: 'var(--text-warning)' }}><Icon name="banknote" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Monthly salary</p><p className="gc-kpi__value">{money(payroll)}<small>gross, suspended left out</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-info-soft)', color: 'var(--text-info)' }}><Icon name="key-round" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">With admin login</p><p className="gc-kpi__value">{all.filter((s) => s.role !== 'No login').length}<small>{all.filter((s) => s.role === 'No login').length} without</small></p></div></div>
      </div>

      <section className="gc-card hr-card">
        <div className="hr-bar">
          <div className="gc-seg" role="group" aria-label="Status">
            {FILTERS.map(([k, l]) => <button key={k} type="button" className={'gc-seg__btn' + (f === k ? ' gc-seg__btn--active' : '')} aria-pressed={f === k} onClick={() => setF(k)}>{l} · {statusCount(k)}</button>)}
          </div>
          <div className="hr-bar__group">
            <select className="gc-input gc-select as-place" aria-label="Location" value={place} onChange={(e) => setPlace(e.target.value)}><option value="">All locations</option>{places.map((p) => <option key={p}>{p}</option>)}</select>
            <label className="as-search"><Icon name="search" width="16" height="16" aria-hidden="true" /><input className="gc-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, phone or EMP code" aria-label="Search staff" /></label>
            <div className="hr-seg" role="group" aria-label="View"><button type="button" aria-pressed={view === 'table'} onClick={() => setView('table')}>Table</button><button type="button" aria-pressed={view === 'cards'} onClick={() => setView('cards')}>Cards</button></div>
          </div>
        </div>
        {sel.length ? (
          <div className="as-sel">
            <b>{sel.length} selected</b>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => toast(`SMS drafted for ${sel.length} staff. Sending SMS from here is not in the demo yet.`, { tone: 'info' })}>Send SMS</button>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setAssign(S.shifts[0].id)}>Assign shift</button>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => exportRows(S.staff.filter((s) => sel.includes(s.code)))}>Export</button>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => setSel([])}>Clear</button>
          </div>
        ) : null}
        {!list.length ? <EmptyState icon="users" title="No staff match these filters" body="Try another status or place, or clear the search." /> : view === 'table' ? (
          <div className="gc-table-wrap">
            <table className="gc-table gc-table--compact gc-table--hoverable">
              <thead><tr><th scope="col"><input type="checkbox" className="gc-check" aria-label="Select all shown" checked={list.every((s) => sel.includes(s.code))} onChange={(e) => setSel(e.target.checked ? list.map((s) => s.code) : [])} /></th><th scope="col">Staff</th><th scope="col">Designation</th><th scope="col">Place · shift</th><th scope="col">Today</th><th scope="col">Login role</th><th scope="col" className="hr-num">Salary</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {list.map((s) => {
                  const t = todayOf(s);
                  return (
                    <tr key={s.code}>
                      <td><input type="checkbox" className="gc-check" checked={sel.includes(s.code)} onChange={() => tick(s.code)} aria-label={`Select ${s.name}`} /></td>
                      <td><Person st={s} sub={`${s.code} · ${s.phone}`} /></td>
                      <td><span className="hr-strong">{s.designation}</span><span className="hr-sub">{s.department} · {s.type}</span></td>
                      <td>{s.branch}<div style={{ marginTop: 3 }}><ShiftChip S={S} id={s.shift} time /></div></td>
                      <td className={t.cls}>{t.l}</td>
                      <td><span className="gc-badge gc-badge--slate">{s.role}</span></td>
                      <td className="hr-num hr-strong">{money(s.gross)}<span className="hr-sub">{PAY_METHODS[s.payMethod]}</span></td>
                      <td><StaffStatus S={S} st={s} /></td>
                      <td><div className="hr-actions"><button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => edit(s)} aria-label={`Quick edit ${s.name}`}>Edit</button><Link href={profileHref(s.code)} className="gc-btn gc-btn--sm gc-btn--neutral" aria-label={`Open ${s.name}’s profile`}>Profile</Link></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="as-cards">
            {list.map((s) => {
              const t = todayOf(s);
              return (
                <Link key={s.code} href={profileHref(s.code)} className="as-card" aria-label={`Open ${s.name}’s profile`}>
                  <div className="hr-who"><Avatar st={s} large /><span><b>{s.name}</b><span className="hr-sub">{s.designation}</span></span></div>
                  <div className="as-chips"><StaffStatus S={S} st={s} /><ShiftChip S={S} id={s.shift} /></div>
                  <span className="hr-sub">{s.branch} · {s.phone}</span>
                  <span className={'hr-sub ' + t.cls} style={{ fontWeight: 'var(--weight-medium)' }}>{t.l}</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <Dialog open={!!form} title={form ? (form.isNew ? 'Add staff' : `Quick edit · ${form.name}`) : 'Staff'} onClose={() => setForm(null)} width={720}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setForm(null)}>Cancel</button><button type="submit" form="as-form" className="gc-btn gc-btn--solid">{form && form.isNew ? 'Add staff' : 'Save'}</button></>}>
        {form ? (() => {
                  return (
            <form id="as-form" className="hr-form" onSubmit={save}>
              <p className="as-sec">Person · {form.code || nextStaffCode(S)}</p>
              <div className="hr-three">
                <div><label className="gc-label" htmlFor="as-name">Full name *</label><input id="as-name" className="gc-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-autofocus /></div>
                <div><label className="gc-label" htmlFor="as-phone">Phone *</label><input id="as-phone" className="gc-input hr-fig" inputMode="tel" placeholder="01XXX-XXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><label className="gc-label" htmlFor="as-joined">Joined</label><input id="as-joined" type="date" className="gc-input" value={form.joined} onChange={(e) => setForm({ ...form, joined: e.target.value })} /><span className="gc-help">{form.joined ? formatDate(fromKey(form.joined)) : ''}</span></div>
              </div>
              <p className="as-sec">Job</p>
              <div className="hr-three">
                <div><span className="gc-label">Department</span><span className="hr-strong" style={{ display: 'block', paddingTop: 10 }}>{form.department}</span></div>
                <div><span className="gc-label">Position</span><span className="hr-strong" style={{ display: 'block', paddingTop: 10 }}>{form.designation}</span><span className="gc-help">Change it with a promotion on the profile.</span></div>
                <div><label className="gc-label" htmlFor="as-role">Login role</label><select id="as-role" className="gc-input gc-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{LOGIN_ROLES.map((r) => <option key={r}>{r}</option>)}</select></div>
              </div>
              <div className="hr-three">
                <div><label className="gc-label" htmlFor="as-place">Works at</label><select id="as-place" className="gc-input gc-select" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>{HR_PLACES.map((p) => <option key={p}>{p}</option>)}</select></div>
                <div><label className="gc-label" htmlFor="as-shift">Usual shift</label><select id="as-shift" className="gc-input gc-select" value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })}>{S.shifts.map((sh) => <option key={sh.id} value={sh.id}>{sh.name} · {t12(sh.start)}–{t12(sh.end)}{sh.places.includes(form.branch) ? '' : ' (not at this place)'}</option>)}</select></div>
                <div><label className="gc-label" htmlFor="as-type">Type</label><select id="as-type" className="gc-input gc-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{STAFF_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
              </div>
              <div className="hr-two">
                <div><label className="gc-label" htmlFor="as-status">Status</label><select id="as-status" className="gc-input gc-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{['active', 'probation', 'suspended'].map((k) => <option key={k} value={k}>{STAFF_STATUS[k][0]}</option>)}</select>{form.status === 'suspended' ? <span className="gc-help">No shifts and no salary from {form.suspendedFrom ? formatDate(fromKey(form.suspendedFrom)) : 'today'}.</span> : <span className="gc-help">Someone leaving? Use Leaving on their profile — it works out the final pay.</span>}</div>
                {form.status === 'probation' ? <div><label className="gc-label" htmlFor="as-prob">Probation ends</label><input id="as-prob" type="date" className="gc-input" value={form.probationEnd || ''} onChange={(e) => setForm({ ...form, probationEnd: e.target.value })} /></div>
                  : form.type === 'Contract' ? <div><label className="gc-label" htmlFor="as-contract">Contract ends</label><input id="as-contract" type="date" className="gc-input" value={form.contractEnd || ''} onChange={(e) => setForm({ ...form, contractEnd: e.target.value })} /></div> : <div />}
              </div>
              <div className="hr-note hr-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>Salary, increments and the bank / bKash account it goes to are on the profile: <Link href={profileHref(form.code, 'salary')} className="hr-link">Salary & payroll</Link>.</span></div>
            </form>
          );
        })() : null}
      </Dialog>

      <Dialog open={!!assign} title={`Usual shift for ${sel.length} staff`} onClose={() => setAssign(null)} width={480}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setAssign(null)}>Cancel</button><button type="submit" form="as-assign" className="gc-btn gc-btn--solid">Assign shift</button></>}>
        {assign ? (
          <form id="as-assign" className="hr-form" onSubmit={saveAssign}>
            <div className="hr-opts" role="radiogroup" aria-label="Shift">
              {S.shifts.map((sh) => <label key={sh.id} className={'hr-opt' + (assign === sh.id ? ' is-on' : '')}><input type="radio" name="as-shift" checked={assign === sh.id} onChange={() => setAssign(sh.id)} /><span><b>{sh.name} · {t12(sh.start)}–{t12(sh.end)}</b><small>{sh.places.join(', ')}</small></span></label>)}
            </div>
            <p className="gc-help" style={{ margin: 0 }}>{S.staff.filter((s) => sel.includes(s.code)).map((s) => s.name).join(', ')}</p>
          </form>
        ) : null}
      </Dialog>
    </HrPage>
  );
}
