'use client';
// All staff — the one staff list (src/lib/hr.js), laid out like Shopify's staff list: status views, search and a
// place filter, bulk actions and a compact table (name, position, place, today, salary, status). Phone, shift, login
// role and pay method are on the profile; a click on a row opens it. New people join through Add staff
// (/staff-create, the 7-step flow). Quick edit (place, shift, role, status) is in the bulk bar for one person.

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { Dialog, EmptyState } from '@/components/ui';
import { MetricStrip, IndexTabs, SearchField, LearnMore, Menu } from '@/components/ui/IndexKit';
import { formatDate } from '@/lib/format';
import { fromKey } from '@/lib/settlements';
import {
  todayKey, cellOf, statusOf, saveStaff, nextStaffCode, shiftBy, t12, HR_PLACES, PAY_METHODS, STAFF_TYPES, LOGIN_ROLES, STAFF_STATUS,
} from '@/lib/hr';
import Link from 'next/link';
import { HrPage, useHr, Person, Avatar, ShiftChip, StaffStatus, money, profileHref, rowGo } from './hrShared';

const CSS = `
.as-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:var(--space-3);padding:var(--space-3) var(--space-4) var(--space-4)}
.as-card{display:flex;flex-direction:column;gap:6px;min-width:0;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);font:inherit;text-align:left;text-decoration:none;color:inherit;cursor:pointer}
.as-card:hover{border-color:var(--primary)}
.as-card b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.as-chips{display:flex;flex-wrap:wrap;gap:6px}
.as-sec{margin:0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted)}
@media (max-width:640px){.as-view{display:none}}
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
  const [find, setFind] = useState(false);
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

  const tabs = FILTERS.map(([k, l]) => ({ key: k, id: 'as-tab-' + k, label: l, count: statusCount(k), on: f === k, onClick: () => setF(k) }));
  const searching = find || !!q || !!place;
  const closeFind = () => { setFind(false); setQ(''); setPlace(''); };
  const allSel = list.length > 0 && list.every((s) => sel.includes(s.code));
  const one = sel.length === 1 ? S.staff.find((x) => x.code === sel[0]) : null;

  return (
    <HrPage screen="AllStaff" active="hr-staff" page="All staff" title="All staff" icon="users" css={CSS}
      about="Everyone who works for the shop: where, which shift, what they earn and how they are paid. Open a person for their profile."
      secondary={[{ label: 'Export', onClick: () => exportRows(list) }]}
      more={[
        { label: 'Import', onClick: () => toast('Staff import from a spreadsheet is not in the demo yet. Add people one by one with Add staff.', { tone: 'info' }) },
        { label: 'Shifts & roster', href: '/shifts' }, { label: 'Positions & grades', href: '/positions' }, { label: 'ID cards & QR', href: '/id-cards' },
      ]}
      primary={{ label: 'Add staff', href: '/staff-create' }}>

      <MetricStrip label="Staff today" items={[
        { label: 'Here today', value: String(present), sub: `of ${all.length}`, href: '/attendance' },
        { label: 'Monthly salary', value: money(payroll), sub: 'gross', href: '/payroll' },
        { label: 'With admin login', value: String(all.filter((s) => s.role !== 'No login').length), sub: `${all.filter((s) => s.role === 'No login').length} without` },
      ]} />

      <section className="ix-card" aria-label="Staff">
        {sel.length ? (
          <div className="ix-bulk" role="toolbar" aria-label="Selected staff">
            <input type="checkbox" checked={allSel} onChange={(e) => setSel(e.target.checked ? list.map((s) => s.code) : [])} aria-label="Select all shown" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
            <span className="ix-bulk__n">{sel.length} selected</span>
            {one ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => edit(one)}><Icon name="pencil" width="16" height="16" aria-hidden="true" />Quick edit</button> : null}
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => setAssign(S.shifts[0].id)}><Icon name="clock" width="16" height="16" aria-hidden="true" />Assign shift</button>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => toast(`SMS drafted for ${sel.length} staff. Sending SMS from here is not in the demo yet.`, { tone: 'info' })}><Icon name="message-square-text" width="16" height="16" aria-hidden="true" />Send SMS</button>
            <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" align="start" items={[{ label: 'Export', onClick: () => exportRows(S.staff.filter((s) => sel.includes(s.code))) }, { label: 'Clear selection', onClick: () => setSel([]) }]} />
          </div>
        ) : (
          <div className="ix-bar">
            {searching ? (<>
              <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, phone or EMP code" onDone={closeFind} autoFocus />
              <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
            </>) : (<>
              <IndexTabs tabs={tabs} label="Status" />
              <span className="ix-tools">
                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon as-view" aria-label={view === 'table' ? 'Show as cards' : 'Show as a table'} aria-pressed={view === 'cards'} onClick={() => setView(view === 'table' ? 'cards' : 'table')}><Icon name={view === 'table' ? 'layout-grid' : 'list'} width="16" height="16" aria-hidden="true" /></button>
              </span>
            </>)}
          </div>
        )}
        {searching && !sel.length ? (
          <div className="ix-filters" role="group" aria-label="Filters">
            <select aria-label="Location" className={'ix-filter' + (place ? ' is-set' : '')} value={place} onChange={(e) => setPlace(e.target.value)}><option value="">Location</option>{places.map((p) => <option key={p}>{p}</option>)}</select>
            {q || place ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setQ(''); setPlace(''); }}>Clear all</button> : null}
          </div>
        ) : null}

        {!list.length ? <div className="ix-empty"><EmptyState icon="users" title="No staff match these filters" actionLabel={q || place ? 'Clear filters' : undefined} onAction={q || place ? () => { setQ(''); setPlace(''); } : undefined} /></div> : view === 'table' ? (
          <>
            <ul className="ix-plist" aria-label="Staff">
              {list.map((s) => { const t = todayOf(s); return (
                <li key={s.code}>
                  <Link href={profileHref(s.code)} className="ix-pitem">
                    <span className="ix-pitem__top"><b>{s.name}</b><StaffStatus S={S} st={s} /></span>
                    <span className="ix-pitem__mid">{s.designation} · {s.branch} · <span className={t.cls}>{t.l}</span></span>
                  </Link>
                </li>
              ); })}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">Staff, {list.length} shown</caption>
                <thead><tr>
                  <th scope="col" className="ix-check"><input type="checkbox" aria-label="Select all shown" checked={allSel} onChange={(e) => setSel(e.target.checked ? list.map((s) => s.code) : [])} /></th>
                  <th scope="col">Staff</th><th scope="col">Position</th><th scope="col">Place</th><th scope="col">Today</th><th scope="col" className="ix-num">Salary</th><th scope="col">Status</th>
                </tr></thead>
                <tbody>
                  {list.map((s) => {
                    const t = todayOf(s);
                    return (
                      <tr key={s.code} className={sel.includes(s.code) ? 'is-sel' : ''} onClick={rowGo(() => navigate(profileHref(s.code)))}>
                        <td className="ix-check"><input type="checkbox" checked={sel.includes(s.code)} onChange={() => tick(s.code)} aria-label={`Select ${s.name}`} /></td>
                        <td><Person st={s} /></td>
                        <td>{s.designation}</td>
                        <td className="ix-muted">{s.branch}</td>
                        <td className={t.cls || 'ix-muted'}>{t.l}</td>
                        <td className="ix-num">{money(s.gross)}</td>
                        <td><StaffStatus S={S} st={s} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="as-cards">
            {list.map((s) => {
              const t = todayOf(s);
              return (
                <Link key={s.code} href={profileHref(s.code)} className="as-card" aria-label={`Open ${s.name}’s profile`}>
                  <div className="hr-who"><Avatar st={s} /><span><b>{s.name}</b><span className="hr-sub">{s.designation}</span></span></div>
                  <div className="as-chips"><StaffStatus S={S} st={s} /><ShiftChip S={S} id={s.shift} /></div>
                  <span className="hr-sub">{s.branch} · {s.phone}</span>
                  <span className={'hr-sub ' + t.cls} style={{ fontWeight: 'var(--weight-medium)' }}>{t.l}</span>
                </Link>
              );
            })}
          </div>
        )}
        <div className="ix-foot"><span>{list.length === 1 ? '1 person' : `${list.length} people`}</span></div>
      </section>
      <LearnMore topic="staff" />

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
              <div className="hr-note hr-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span><Link href={profileHref(form.code, 'salary')} className="hr-link">Salary & payroll</Link>.</span></div>
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
