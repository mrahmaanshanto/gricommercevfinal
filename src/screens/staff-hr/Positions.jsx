'use client';
// Positions & grades (/positions) — the jobs in the shop by department: grade, salary band, who holds each one,
// how many are still to hire, and who reports to whom. A new position here shows in Add staff and promotions.
// Saved in src/lib/hr.js › settings.positions (the department's list of titles follows).

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Dialog, EmptyState } from '@/components/ui';
import { savePosition, removePosition, holdersOf, saveSettings, gradeLabel } from '@/lib/hr';
import { HrPage, useHr, Avatar, money, profileHref } from './hrShared';

const CSS = `
.po-dept{display:flex;flex-direction:column}
.po-dept + .po-dept{border-top:1px solid var(--border-subtle)}
.po-dept > header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-2);padding:var(--space-3) var(--space-5);background:var(--surface-subtle)}
.po-dept > header b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.po-people{display:flex;flex-wrap:wrap;align-items:center;gap:4px}
.po-people a{line-height:0;border-radius:var(--radius-full)}
.po-people .hr-av{width:28px;height:28px;font-size:var(--text-2xs)}
.po-bar{position:relative;display:block;width:140px;height:6px;margin-top:6px;border-radius:var(--radius-full);background:var(--fill-primary-soft)}
.po-bar i{position:absolute;top:-3px;width:4px;height:12px;border-radius:2px;background:var(--primary)}
.po-tree{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-4) var(--space-5) var(--space-5)}
.po-node{display:flex;align-items:center;gap:var(--space-2);min-height:44px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);text-decoration:none;color:inherit}
.po-node:hover{border-color:var(--primary)}
.po-node b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.po-kids{display:flex;flex-direction:column;gap:var(--space-2);margin-left:22px;padding-left:var(--space-4);border-left:1px dashed var(--border-strong, var(--border-subtle))}
.po-grades{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:var(--space-2);padding:var(--space-4) var(--space-5) var(--space-5)}
.po-grade{padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.po-grade b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.po-grade span{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.po-split{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:var(--space-4);align-items:start}
@media (max-width:1100px){.po-split{grid-template-columns:minmax(0,1fr)}}
`;

export default function Positions() {
  const { S } = useHr();
  const [edit, setEdit] = useState(null);
  const [dept, setDept] = useState(null);
  const positions = S.settings.positions || [];
  const active = S.staff.filter((s) => s.status !== 'left');
  const openings = positions.reduce((a, p) => a + (p.openings || 0), 0);
  const noPos = active.filter((s) => !positions.some((p) => p.title === s.designation));

  const save = (e) => {
    e.preventDefault();
    const title = edit.title.trim();
    if (!title) { toast('Give the position a name', { tone: 'error' }); return; }
    if (positions.some((p) => p.id !== edit.id && p.title.toLowerCase() === title.toLowerCase())) { toast('That position is already there', { tone: 'error' }); return; }
    if (Number(edit.max) && Number(edit.min) > Number(edit.max)) { toast('The band starts above where it ends', { tone: 'error' }); return; }
    const row = savePosition({ ...edit, title });
    toast(edit.id ? `${row.title} saved.` : `${row.title} added. It shows in Add staff and promotions.`);
    setEdit(null);
  };
  const remove = async (p) => {
    const holders = holdersOf(S, p.title);
    if (holders.length) { toast(`${holders.map((h) => h.name).join(', ')} ${holders.length === 1 ? 'holds' : 'hold'} this position. Move them first.`, { tone: 'error' }); return; }
    if (!(await confirmDialog({ title: `Remove ${p.title}?`, body: 'Nobody holds it now. Old records keep the name.', confirmLabel: 'Remove', tone: 'danger' }))) return;
    removePosition(p.id);
    toast(`${p.title} removed.`);
  };
  const saveDept = (e) => {
    e.preventDefault();
    const name = dept.name.trim();
    if (!name) { toast('Name the department', { tone: 'error' }); return; }
    if (S.settings.departments.some((d) => d.name.toLowerCase() === name.toLowerCase() && d.name !== dept.was)) { toast('That department is already there', { tone: 'error' }); return; }
    const departments = dept.was ? S.settings.departments.map((d) => (d.name === dept.was ? { ...d, name, head: dept.head } : d)) : [...S.settings.departments, { name, titles: [], head: dept.head }];
    saveSettings({ departments, positions: dept.was && dept.was !== name ? positions.map((p) => (p.department === dept.was ? { ...p, department: name } : p)) : positions });
    toast(`${name} saved.`);
    setDept(null);
  };

  // who reports to whom: people without a manager (or whose manager left) hang under the owner
  const kids = (code) => active.filter((s) => (s.reportsTo || '') === code || (code === '' && s.reportsTo && !active.some((m) => m.code === s.reportsTo)));
  const Node = ({ s, depth }) => {
    const under = kids(s.code);
    return (
      <div>
        <Link href={profileHref(s.code)} className="po-node"><Avatar st={s} /><span><b>{s.name}</b><span className="hr-sub">{s.designation} · {s.branch}{under.length ? ` · ${under.length} report${under.length === 1 ? '' : 's'}` : ''}</span></span></Link>
        {under.length && depth < 4 ? <div className="po-kids" style={{ marginTop: 'var(--space-2)' }}>{under.map((k) => <Node key={k.code} s={k} depth={depth + 1} />)}</div> : null}
      </div>
    );
  };

  return (
    <HrPage screen="Positions" active="hr-positions" page="Positions & grades" title="Positions & grades" css={CSS}
      about="The jobs in the shop: grade, salary band, who holds each one and what is still to hire."
      actions={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDept({ name: '', head: 'Owner', was: '' })}><Icon name="building-2" width="18" height="18" aria-hidden="true" /> New department</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={() => setEdit({ title: '', department: S.settings.departments[0].name, grade: 'G1', min: '', max: '', reportsTo: '', openings: 0 })}><Icon name="plus" width="18" height="18" aria-hidden="true" /> New position</button>
      </>}>
      <div className="gc-kpis">
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="network" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Positions</p><p className="gc-kpi__value">{positions.length}<small>in {S.settings.departments.length} departments</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-success-soft)', color: 'var(--text-success)' }}><Icon name="users" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">People</p><p className="gc-kpi__value">{active.length}<small>{noPos.length ? `${noPos.length} without a position` : 'all placed'}</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-warning-soft)', color: 'var(--text-warning)' }}><Icon name="user-search" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">To hire</p><p className="gc-kpi__value">{openings}<small>{positions.filter((p) => p.openings).map((p) => p.title).join(', ') || 'no openings'}</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-info-soft)', color: 'var(--text-info)' }}><Icon name="banknote" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Outside their band</p><p className="gc-kpi__value">{active.filter((s) => { const p = positions.find((x) => x.title === s.designation); return p && (s.gross < p.min || s.gross > p.max); }).length}<small>people paid below or above</small></p></div></div>
      </div>

      <section className="gc-card hr-card">
        <div className="hr-head"><div><h2>Positions by department</h2><p>The band is the salary range for the job. The marks show where each holder’s gross sits.</p></div></div>
        {S.settings.departments.map((d) => {
          const rows = positions.filter((p) => p.department === d.name);
          const head = d.head && d.head !== 'Owner' ? S.staff.find((s) => s.name === d.head) : null;
          return (
            <div key={d.name} className="po-dept">
              <header><span><b>{d.name}</b> <span className="hr-sub" style={{ display: 'inline' }}>· head {head ? head.name : d.head || 'Owner'} · {active.filter((s) => s.department === d.name).length} {active.filter((s) => s.department === d.name).length === 1 ? 'person' : 'people'}</span></span><button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => setDept({ name: d.name, head: d.head || 'Owner', was: d.name })}><Icon name="pencil" width="14" height="14" aria-hidden="true" /> Edit</button></header>
              {rows.length ? (
                <div className="gc-table-wrap">
                  <table className="gc-table gc-table--compact">
                    <thead><tr><th scope="col">Position</th><th scope="col">Grade</th><th scope="col">Salary band</th><th scope="col">Held by</th><th scope="col" className="hr-num">To hire</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                    <tbody>{rows.map((p) => {
                      const holders = holdersOf(S, p.title);
                      return (
                        <tr key={p.id}>
                          <td className="hr-strong">{p.title}<span className="hr-sub">Reports to {p.reportsTo || 'Owner'}</span></td>
                          <td>{gradeLabel(S, p.grade)}</td>
                          <td><span className="hr-fig">{money(p.min)} – {money(p.max)}</span><span className="po-bar" aria-hidden="true">{holders.map((h) => <i key={h.code} style={{ left: `${Math.max(0, Math.min(100, p.max > p.min ? ((h.gross - p.min) / (p.max - p.min)) * 100 : 50))}%` }} title={`${h.name} ${money(h.gross)}`} />)}</span></td>
                          <td>{holders.length ? <div className="po-people">{holders.map((h) => <Link key={h.code} href={profileHref(h.code)} title={`${h.name} · ${money(h.gross)}`} aria-label={h.name}><Avatar st={h} /></Link>)}<span className="hr-sub" style={{ marginLeft: 4 }}>{holders.length}</span></div> : <span className="hr-sub">Nobody</span>}</td>
                          <td className={'hr-num' + (p.openings ? ' hr-warn hr-strong' : '')}>{p.openings || '—'}</td>
                          <td><div className="hr-actions"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setEdit({ ...p, min: String(p.min), max: String(p.max) })}>Edit</button><button type="button" className="gc-btn gc-btn--sm gc-btn--flat" aria-label={`Remove ${p.title}`} onClick={() => remove(p)}><Icon name="trash-2" width="14" height="14" aria-hidden="true" /></button></div></td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
                </div>
              ) : <p className="hr-sub" style={{ margin: 0, padding: 'var(--space-3) var(--space-5)' }}>No positions yet.</p>}
            </div>
          );
        })}
      </section>

      <div className="po-split">
        <section className="gc-card hr-card">
          <div className="hr-head"><div><h2>Who reports to whom</h2><p>Set on each profile (Reports to).</p></div></div>
          <div className="po-tree">
            <div className="po-node" style={{ cursor: 'default' }}><span className="hr-av" style={{ background: 'var(--primary)', color: 'var(--text-on-dark)' }} aria-hidden="true">OW</span><span><b>Owner</b><span className="hr-sub">{kids('').length} report{kids('').length === 1 ? '' : 's'} directly</span></span></div>
            <div className="po-kids">{kids('').map((s) => <Node key={s.code} s={s} depth={1} />)}</div>
          </div>
        </section>
        <section className="gc-card hr-card">
          <div className="hr-head"><div><h2>Grades</h2><p>Grades group positions of the same level.</p></div></div>
          <div className="po-grades">
            {(S.settings.grades || []).map(([g, l]) => {
              const ps = positions.filter((p) => p.grade === g);
              const people = active.filter((s) => ps.some((p) => p.title === s.designation));
              return <div key={g} className="po-grade"><b>{g} · {l}</b><span>{ps.length ? `${money(Math.min(...ps.map((p) => p.min)))} – ${money(Math.max(...ps.map((p) => p.max)))}` : 'No positions'}</span><span>{ps.length} position{ps.length === 1 ? '' : 's'} · {people.length} {people.length === 1 ? 'person' : 'people'}</span></div>;
            })}
          </div>
          {noPos.length ? <div className="hr-note hr-note--warn" style={{ margin: '0 var(--space-5) var(--space-5)' }}><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>{noPos.map((s) => s.name).join(', ')} {noPos.length === 1 ? 'has a job title' : 'have job titles'} that is not a position here. Add it, or promote them into one.</span></div> : null}
        </section>
      </div>

      <Dialog open={!!edit} title={edit && edit.id ? `Edit · ${edit.title}` : 'New position'} onClose={() => setEdit(null)} width={600}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit(null)}>Cancel</button><button type="submit" form="po-form" className="gc-btn gc-btn--solid">{edit && edit.id ? 'Save' : 'Add position'}</button></>}>
        {edit ? (
          <form id="po-form" className="hr-form" onSubmit={save}>
            <div className="hr-two">
              <div><label className="gc-label" htmlFor="po-title">Position name</label><input id="po-title" className="gc-input" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} data-autofocus />{edit.id && holdersOf(S, edit.title).length ? <span className="gc-help">Renaming changes the title of the {holdersOf(S, edit.title).length} people in it.</span> : null}</div>
              <div><label className="gc-label" htmlFor="po-dept">Department</label><select id="po-dept" className="gc-input gc-select" value={edit.department} onChange={(e) => setEdit({ ...edit, department: e.target.value })}>{S.settings.departments.map((d) => <option key={d.name}>{d.name}</option>)}</select></div>
              <div><label className="gc-label" htmlFor="po-grade">Grade</label><select id="po-grade" className="gc-input gc-select" value={edit.grade} onChange={(e) => setEdit({ ...edit, grade: e.target.value })}>{S.settings.grades.map(([g, l]) => <option key={g} value={g}>{g} · {l}</option>)}</select></div>
              <div><label className="gc-label" htmlFor="po-rep">Reports to</label><select id="po-rep" className="gc-input gc-select" value={edit.reportsTo || ''} onChange={(e) => setEdit({ ...edit, reportsTo: e.target.value })}><option value="">Owner</option>{positions.filter((p) => p.id !== edit.id).map((p) => <option key={p.id} value={p.title}>{p.title}</option>)}</select></div>
              <div><label className="gc-label" htmlFor="po-min">Salary band from (৳)</label><input id="po-min" className="gc-input hr-fig" inputMode="numeric" value={edit.min} onChange={(e) => setEdit({ ...edit, min: e.target.value.replace(/\D/g, '') })} /></div>
              <div><label className="gc-label" htmlFor="po-max">to (৳)</label><input id="po-max" className="gc-input hr-fig" inputMode="numeric" value={edit.max} onChange={(e) => setEdit({ ...edit, max: e.target.value.replace(/\D/g, '') })} /></div>
              <div><label className="gc-label" htmlFor="po-open">People still to hire</label><input id="po-open" className="gc-input hr-fig" inputMode="numeric" value={edit.openings} onChange={(e) => setEdit({ ...edit, openings: e.target.value.replace(/\D/g, '') })} /><span className="gc-help">Shows on the HR dashboard until filled.</span></div>
            </div>
          </form>
        ) : null}
      </Dialog>
      <Dialog open={!!dept} title={dept && dept.was ? `Edit · ${dept.was}` : 'New department'} onClose={() => setDept(null)} width={480}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDept(null)}>Cancel</button><button type="submit" form="po-dform" className="gc-btn gc-btn--solid">Save</button></>}>
        {dept ? (
          <form id="po-dform" className="hr-form" onSubmit={saveDept}>
            <div><label className="gc-label" htmlFor="po-dname">Department</label><input id="po-dname" className="gc-input" value={dept.name} onChange={(e) => setDept({ ...dept, name: e.target.value })} data-autofocus /></div>
            <div><label className="gc-label" htmlFor="po-dhead">Head</label><select id="po-dhead" className="gc-input gc-select" value={dept.head} onChange={(e) => setDept({ ...dept, head: e.target.value })}><option>Owner</option>{active.map((s) => <option key={s.code} value={s.name}>{s.name} · {s.designation}</option>)}</select></div>
          </form>
        ) : null}
      </Dialog>
    </HrPage>
  );
}
