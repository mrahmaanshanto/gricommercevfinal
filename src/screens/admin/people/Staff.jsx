'use client';
// Staff (/admin/staff) — GridCommerce's own employee directory, copied from the merchant panel's staff-hr/AllStaff.jsx
// and laid out like Merchants: title row (Add employee, Export), a few key figures, one card with the status views as
// tabs (counts on the tabs), search and a department filter, the table (a two-line list on phones). A row opens the
// employee's page (/admin/staff/view?id=). Data: lib/admin/people.js (addEmployee). ?view= and ?dept= stay in the address.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/runtime/ui';
import { Sheet, EmptyState } from '@/components/ui';
import { FilterBar } from '@/components/ui/FilterBar';
import { ShopHeader, IndexTabs, MetricStrip, Pager } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { dmy } from '@/lib/platform/util';
import { ADMIN_ROLES } from '@/lib/admin/access';
import { DEPARTMENTS, STATUSES, empName, grossOf, isCurrent, addEmployee, keyOf } from '@/lib/admin/people';
import { AdminShell } from '../AdminShell';
import { PEOPLE_CSS, usePeople, meName, money, plural, viewHref, Person, EmpStatus, Skeleton, rowGo, setParam, Field, ctl } from './peopleShared';

const PAGE = 25;
const VIEWS = [['all', 'All'], ['active', 'Active'], ['probation', 'Probation'], ['onleave', 'On leave'], ['notice', 'Notice period'], ['left', 'Left']];
const CSS = `
.st-email{max-width:220px;overflow:hidden;text-overflow:ellipsis}
.st-filters{padding:8px;border-bottom:1px solid var(--border-subtle)}
.st-filters .gc-filterbar__search{max-width:320px}
`;

const tenureYears = (e, t) => Math.max(0, ((e.leftAt || t) - e.joined) / (365.25 * 864e5));
const csvRows = (D, rows) => [
  ['Employee ID', 'Name', 'Department', 'Designation', 'Email', 'Phone', 'Status', 'Joined', 'Reporting manager', 'Monthly gross (BDT)'],
  ...rows.map((e) => [e.id, e.name, e.dept, e.designation, e.email, e.phone, STATUSES[e.status].label, dmy(e.joined), e.manager ? empName(D, e.manager) : '', grossOf(e.salary)]),
];

function AddEmployee({ D, t, open, onClose }) {
  const router = useRouter();
  const blank = () => ({ name: '', dept: '', designation: '', email: '', phone: '', joined: keyOf(t + 7 * 864e5), manager: '', gross: '', pay: 'bank', adminRole: '', error: '' });
  const [f, setF] = useState(blank);
  const [emailTouched, setEmailTouched] = useState(false);
  useEffect(() => { if (open) { setF(blank()); setEmailTouched(false); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k) => (ev) => {
    const v = ev.target.value;
    setF((o) => {
      const n = { ...o, [k]: v, error: '' };
      if (k === 'name' && !emailTouched) { const first = v.trim().split(/\s+/)[0] || ''; n.email = first ? first.toLowerCase().replace(/[^a-z]/g, '') + '@gridcommerce.net' : ''; }
      if (k === 'dept' && !o.adminRole) n.adminRole = { Management: 'management', Sales: 'sales', Marketing: 'marketing', 'Customer Support': 'support', Technical: 'ops', Finance: 'finance', Operations: 'ops', HR: 'hr' }[v] || '';
      return n;
    });
  };
  const save = (ev) => {
    ev.preventDefault();
    const res = addEmployee(f, meName());
    if (!res.ok) { setF((o) => ({ ...o, error: res.error })); return; }
    toast(`${f.name.trim()} added as ${res.id}, on probation`);
    onClose();
    router.push(viewHref(res.id));
  };
  const managers = D.employees.filter((e) => isCurrent(e)).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <Sheet open={open} title="Add employee" onClose={onClose}
      footer={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button>
        <button type="submit" form="st-add" className="gc-btn gc-btn--solid">Add employee</button>
      </>}>
      <form id="st-add" className="pp-form" onSubmit={save} noValidate>
        <Field id="st-name" label="Full name"><input id="st-name" {...ctl()} value={f.name} onChange={set('name')} autoComplete="off" data-autofocus /></Field>
        <div className="pp-two">
          <Field id="st-dept" label="Department">
            <select id="st-dept" {...ctl(null, true)} value={f.dept} onChange={set('dept')}><option value="">Choose</option>{DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}</select>
          </Field>
          <Field id="st-des" label="Designation"><input id="st-des" {...ctl()} value={f.designation} onChange={set('designation')} placeholder="e.g. Support executive" /></Field>
        </div>
        <div className="pp-two">
          <Field id="st-email" label="Work email"><input id="st-email" type="email" {...ctl()} value={f.email} onChange={(ev) => { setEmailTouched(true); set('email')(ev); }} /></Field>
          <Field id="st-phone" label="Mobile"><input id="st-phone" type="tel" inputMode="tel" {...ctl()} value={f.phone} onChange={set('phone')} placeholder="01711-234567" /></Field>
        </div>
        <div className="pp-two">
          <Field id="st-join" label="Joining date"><input id="st-join" type="date" {...ctl()} value={f.joined} min={keyOf(addDaysMs(t, -90))} onChange={set('joined')} /></Field>
          <Field id="st-mgr" label="Reports to">
            <select id="st-mgr" {...ctl(null, true)} value={f.manager} onChange={set('manager')}><option value="">Nobody</option>{managers.map((e) => <option key={e.id} value={e.id}>{e.name} · {e.dept}</option>)}</select>
          </Field>
        </div>
        <div className="pp-two">
          <Field id="st-gross" label="Monthly gross (৳)" hint="Split into basic 50%, house rent 30%, medical, conveyance and other."><input id="st-gross" inputMode="numeric" {...ctl()} value={f.gross} onChange={set('gross')} placeholder="40,000" /></Field>
          <Field id="st-pay" label="Salary paid to">
            <select id="st-pay" {...ctl(null, true)} value={f.pay} onChange={set('pay')}><option value="bank">Bank account</option><option value="bkash">bKash</option></select>
          </Field>
        </div>
        <Field id="st-role" label="Super admin role" hint="What they can open in this panel. Roles are managed under Administration › Roles & permissions.">
          <select id="st-role" {...ctl(null, true)} value={f.adminRole} onChange={set('adminRole')}><option value="">No access</option>{Object.entries(ADMIN_ROLES).map(([k, r]) => <option key={k} value={k}>{r.title}</option>)}</select>
        </Field>
        {f.error ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{f.error}</p> : null}
      </form>
    </Sheet>
  );
}
const addDaysMs = (t, n) => t + n * 864e5;

export default function Staff() {
  const router = useRouter();
  const { D, t, live } = usePeople();
  const [ready, setReady] = useState(false);
  const [view, setView] = useState('all');
  const [dept, setDept] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [adding, setAdding] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (VIEWS.some(([k]) => k === p.get('view'))) setView(p.get('view'));
    if (DEPARTMENTS.includes(p.get('dept'))) setDept(p.get('dept'));
    if (p.get('new') === '1') setAdding(true);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    setParam('view', view === 'all' ? '' : view);
    setParam('dept', dept);
    if (first.current) { first.current = false; return; }
    setPage(0);
  }, [ready, view, dept, q]);

  const all = D.employees;
  const counts = Object.fromEntries(VIEWS.map(([k]) => [k, k === 'all' ? all.filter(isCurrent).length : all.filter((e) => e.status === k).length]));
  const s = q.trim().toLowerCase();
  const digits = s.replace(/\D/g, '');
  const filtered = all.filter((e) => {
    if (view === 'all' ? !isCurrent(e) : e.status !== view) return false;
    if (dept && e.dept !== dept) return false;
    if (!s) return true;
    if ([e.name, e.id, e.email, e.designation].join(' ').toLowerCase().includes(s)) return true;
    return digits.length >= 3 && e.phone.replace(/\D/g, '').includes(digits);
  }).sort((a, b) => a.id.localeCompare(b.id));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const rows = filtered.slice(pg * PAGE, pg * PAGE + PAGE);
  const viewLabel = (VIEWS.find(([k]) => k === view) || [])[1];

  const cur = all.filter(isCurrent);
  const year = keyOf(t).slice(0, 4);
  const newThisYear = all.filter((e) => keyOf(e.joined).slice(0, 4) === year).length;
  const payroll = cur.reduce((a, e) => a + grossOf(e.salary), 0);
  const tenure = cur.length ? cur.reduce((a, e) => a + tenureYears(e, t), 0) / cur.length : 0;
  const leaving = all.filter((e) => e.status === 'notice').length;

  const exportCsv = () => {
    if (!filtered.length) { toast('Nothing to export'); return; }
    downloadCsv(`gridcommerce-staff-${view}.csv`, csvRows(D, filtered));
    toast(plural(filtered.length, 'employee') + ' exported');
  };
  const open = (id) => router.push(viewHref(id));
  const tabs = VIEWS.map(([k, label]) => ({ key: k, id: 'st-tab-' + k, label, count: live ? counts[k] : null, on: view === k, onClick: () => setView(k) }));
  const filters = [{ key: 'dept', label: 'Department', all: 'All departments', value: dept, options: DEPARTMENTS.map((d) => [d, d]), onChange: setDept }];

  return (
    <AdminShell active="staff" title="Staff">
      <style dangerouslySetInnerHTML={{ __html: PEOPLE_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="id-card" title="Staff"
          about="GridCommerce’s own employees: who they are, their department, manager and status. Open someone to see their attendance, leave, salary, goals, documents and what they can open in this super admin."
          secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv }]}
          primary={{ label: 'Add employee', icon: 'plus', onClick: () => setAdding(true) }} />
        {!live ? <Skeleton label="Loading staff" /> : (<>
          <MetricStrip label="Team" items={[
            { label: 'Headcount', value: String(cur.length), sub: `${new Set(cur.map((e) => e.dept)).size} departments`, icon: 'users' },
            { label: `Joined in ${year}`, value: String(newThisYear), icon: 'user-plus' },
            { label: 'Monthly gross payroll', value: money(payroll), href: '/admin/payroll', icon: 'banknote' },
            { label: 'Average time here', value: tenure.toFixed(1) + ' yrs', sub: leaving ? `${leaving} leaving` : null, icon: 'hourglass' },
          ]} />
          <section className="ix-card" aria-label={viewLabel + ' staff'}>
            <div className="ix-bar"><IndexTabs tabs={tabs} label="Staff views" /></div>
            <div className="st-filters">
              <FilterBar label="Filter staff" filters={filters} onClear={() => setQ('')}
                search={{ value: q, onChange: setQ, placeholder: 'Search name, ID, email, phone or designation' }} />
            </div>
            {!filtered.length ? (
              <div className="ix-empty">
                {s || dept ? <EmptyState title="No one matches these filters." actionLabel="Clear filters" onAction={() => { setQ(''); setDept(''); }} />
                  : <EmptyState icon="users" title={`No one in ${viewLabel}.`} actionLabel="Show everyone" onAction={() => setView('all')} />}
              </div>
            ) : (<>
              <ul className="ix-plist" aria-label={viewLabel + ' staff'}>
                {rows.map((e) => (
                  <li key={e.id}>
                    <Link href={viewHref(e.id)} className="ix-pitem">
                      <span className="ix-pitem__top"><b>{e.name}</b><EmpStatus e={e} /></span>
                      <span className="ix-pitem__mid"><span className="ix-id">{e.id}</span> · {e.designation}</span>
                      <span className="ix-pitem__mid">{e.dept} · {e.phone}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table gc-table--keep">
                  <caption className="sr-only">{viewLabel} staff</caption>
                  <thead><tr>
                    <th scope="col">ID</th><th scope="col">Name</th><th scope="col">Department</th><th scope="col">Email</th>
                    <th scope="col">Phone</th><th scope="col">Status</th><th scope="col">Joined</th><th scope="col">Manager</th>
                  </tr></thead>
                  <tbody>
                    {rows.map((e) => (
                      <tr key={e.id} tabIndex={0} onClick={rowGo(() => open(e.id))} onKeyDown={(ev) => { if (ev.key === 'Enter' && ev.target === ev.currentTarget) open(e.id); }}>
                        <td><span className="ix-id ix-muted">{e.id}</span></td>
                        <td><Person e={e} sub={e.designation} /></td>
                        <td>{e.dept}</td>
                        <td className="ix-muted"><span className="st-email" title={e.email}>{e.email}</span></td>
                        <td className="ix-muted"><span className="pp-fig">{e.phone}</span></td>
                        <td><EmpStatus e={e} /></td>
                        <td className="ix-muted">{dmy(e.joined)}</td>
                        <td>{e.manager ? empName(D, e.manager) : <span className="ix-muted">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>)}
            <Pager label={filtered.length ? `${pg * PAGE + 1}–${pg * PAGE + rows.length} of ${plural(filtered.length, 'person', 'people')}` : '0 people'}
              atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
          </section>
        </>)}
      </div>
      {live ? <AddEmployee D={D} t={t} open={adding} onClose={() => setAdding(false)} /> : null}
    </AdminShell>
  );
}
