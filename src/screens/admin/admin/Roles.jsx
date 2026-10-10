'use client';
// Roles & permissions (/admin/roles) — who may do what in the super admin. Left: the roles (people with each, the
// layers it reaches, a warning when a role mixes merchant money / infrastructure with the company's customer-facing
// work). Right: the open role (?role=) — its permission matrix (the menu's areas grouped by layer × View, Create,
// Edit, Approve, Delete, Export; one Save), the people who have it (assign / remove) and "Preview the menu as this
// role" (/admin?staff=<a demo sign-in with that role>). New role, Duplicate, Rename and Delete (custom roles only).
// The menu still reads lib/admin/access.js; this matrix becomes the source once the super admin has a server.
// Data: lib/admin/admin.js (roles, assign; saveRolePerms, createRole, duplicateRole, renameRole, deleteRole,
// assignRole, removeRole — each writes administrator activity).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState, InfoTip } from '@/components/ui';
import { ShopHeader, Menu } from '@/components/ui/IndexKit';
import { ago } from '@/lib/platform/util';
import {
  OPS, AREA_GROUPS, roleRows, peopleRows, normalise, permChanges, layersOf, mixWarning, previewStaffFor, roleTitleOf,
  saveRolePerms, createRole, duplicateRole, renameRole, deleteRole, assignRole, removeRole,
} from '@/lib/admin/admin';
import { AdminShell } from '../AdminShell';
import { ADX_CSS, useAdmin, Skeleton, Field, CardHead, Person, Note, SaveBar, plural, clone } from './admShared';

const CSS = `
.rl-grid{display:grid;grid-template-columns:280px minmax(0,1fr);gap:var(--space-4);align-items:start}
.rl-main{display:flex;flex-direction:column;gap:var(--space-4);min-width:0}
.rl-roles{display:flex;flex-direction:column;margin:0;padding:4px;list-style:none}
.rl-role{display:flex;align-items:flex-start;gap:10px;width:100%;padding:10px 12px;border:0;border-radius:var(--radius-lg);background:none;font:inherit;text-align:left;color:var(--text-body);cursor:pointer}
.rl-role:hover{background:var(--surface-subtle)}
.rl-role[aria-current="true"]{background:var(--fill-primary-soft)}
.rl-role:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.rl-role>span{display:flex;flex-direction:column;flex:1;min-width:0}
.rl-role b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.rl-role small{font-size:var(--text-xs);color:var(--text-muted)}
.rl-role .rl-warn{flex:none;margin-top:2px;color:var(--text-warning)}
.rl-sum{display:flex;flex-direction:column;gap:6px;padding:var(--space-3) var(--space-4) var(--space-4)}
.rl-sum p{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.rl-badges{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.rl-matrix{min-width:640px}
.rl-matrix th,.rl-matrix td{text-align:center}
.rl-matrix th:first-child,.rl-matrix td:first-child{text-align:left}
.rl-matrix .rl-layer td{padding-top:12px;background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em}
.rl-cell{display:inline-grid;place-items:center;width:36px;height:36px;border-radius:var(--radius-md);cursor:pointer}
.rl-cell:hover{background:var(--surface-subtle)}
.rl-cell input:disabled{cursor:not-allowed}
.rl-area{display:inline-flex;align-items:center;gap:8px;color:var(--text-heading)}
.rl-area svg{color:var(--text-muted)}
.rl-row-all{margin-left:6px;padding:0 6px;border:0;background:none;font:inherit;font-size:var(--text-xs);color:var(--primary);cursor:pointer;opacity:0;transition:opacity .15s}
.rl-matrix tr:hover .rl-row-all,.rl-row-all:focus-visible{opacity:1}
.rl-people{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.rl-people li{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle)}
.rl-people li:first-child{border-top:0}
.rl-tags{display:inline-flex;flex-wrap:wrap;gap:6px;align-items:center}
@media (max-width:1023px){.rl-grid{grid-template-columns:minmax(0,1fr)}.rl-roles{flex-direction:row;overflow-x:auto;scroll-snap-type:x mandatory}.rl-role{flex:none;width:auto;min-width:180px;scroll-snap-align:start}}
@media (hover:none){.rl-row-all{opacity:1}}
@media (max-width:640px){.rl-people li{flex-wrap:wrap}}
`;

const ICONS = Object.fromEntries(AREA_GROUPS.flatMap((g) => g.areas.map((a) => [a.id, a.icon])));

export default function Roles() {
  const { d, t, live } = useAdmin();
  const [sel, setSel] = useState('');            // the open role id
  const [perms, setPerms] = useState(null);      // the matrix being edited
  const [form, setForm] = useState(null);        // New role / Rename sheet: { mode, title, about, from, error }
  const [pick, setPick] = useState(null);        // Assign person sheet: { person, error }

  useEffect(() => {
    if (!live) return;
    const q = new URLSearchParams(window.location.search).get('role');
    setSel((cur) => cur || (q && d.roles.some((r) => r.id === q) ? q : 'admin'));
  }, [live]); // eslint-disable-line react-hooks/exhaustive-deps

  const role = live && sel ? d.roles.find((r) => r.id === sel) || d.roles[0] : null;
  const saved = role ? role.perms : null;
  const dirty = !!(perms && saved && permChanges(saved, normalise(perms)).length);
  // load the role's matrix when it opens or changes elsewhere while nothing is being edited
  useEffect(() => { if (role && (!perms || !dirty)) setPerms(clone(role.perms)); }, [role && role.id, saved]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = async (id) => {
    if (id === sel) return;
    if (dirty && !(await confirmDialog({ title: 'Discard changes to ' + role.title + '?', body: 'The rights you changed are not saved.', confirmLabel: 'Discard', tone: 'danger' }))) return;
    setSel(id); setPerms(null);
    const u = new URL(window.location.href); u.searchParams.set('role', id);
    window.history.replaceState(window.history.state, '', u.pathname + u.search);
  };

  const locked = role && role.id === 'admin';
  const toggle = (area, op) => setPerms((p) => {
    const n = clone(p);
    n[area][op] = !n[area][op];
    if (op === 'view' && !n[area].view) for (const [k] of OPS) n[area][k] = false;
    if (op !== 'view' && n[area][op]) n[area].view = true;
    return n;
  });
  const rowAll = (area) => setPerms((p) => { const n = clone(p); const all = OPS.every(([k]) => n[area][k]); for (const [k] of OPS) n[area][k] = !all; return n; });

  const save = () => {
    const res = saveRolePerms(role.id, perms);
    if (!res.ok) { toast(res.error, { tone: res.error === 'Nothing changed.' ? 'info' : 'error' }); return; }
    toast(res.changes.length === 1 ? `${role.title}: ${res.changes[0]}` : `${role.title}: ${res.changes.length} rights changed`);
  };
  const discard = () => setPerms(clone(role.perms));

  const submitForm = () => {
    const res = form.mode === 'new' ? createRole({ title: form.title, about: form.about, from: form.from }) : renameRole(role.id, form.title, form.about);
    if (!res.ok) { setForm({ ...form, error: res.error }); return; }
    if (form.mode === 'new') { setSel(res.role.id); setPerms(null); toast(`Role “${res.role.title}” created`); } else toast('Role saved');
    setForm(null);
  };
  const duplicate = () => {
    const res = duplicateRole(role.id);
    if (!res.ok) { toast(res.error, { tone: 'error' }); return; }
    setSel(res.role.id); setPerms(null);
    toast(`“${res.role.title}” created · rename it and change its rights`);
  };
  const remove = async () => {
    if (!(await confirmDialog({ title: `Delete “${role.title}”?`, body: 'The role and its rights are removed. This can’t be undone.', confirmLabel: 'Delete role', tone: 'danger' }))) return;
    const res = deleteRole(role.id);
    if (!res.ok) { toast(res.error, { tone: 'error' }); return; }
    setSel('admin'); setPerms(null);
    toast('Role deleted');
  };
  const doAssign = () => {
    if (!pick.person) { setPick({ ...pick, error: 'Pick a person.' }); return; }
    const res = assignRole(pick.person, role.id);
    if (!res.ok) { setPick({ ...pick, error: res.error }); return; }
    setPick(null);
    toast('Role given · the person sees it at their next sign-in');
  };
  const unassign = async (p) => {
    if (!(await confirmDialog({ title: `Remove ${p.name} from ${role.title}?`, body: 'Without a role they only open the Dashboard until they are given another one.', confirmLabel: 'Remove', tone: 'danger' }))) return;
    const res = removeRole(p.id);
    if (!res.ok) { toast(res.error, { tone: 'error' }); return; }
    toast(`${p.name} removed from ${role.title}`);
  };

  if (!live || !role || !perms) {
    return <AdminShell active="roles" title="Roles & permissions"><style dangerouslySetInnerHTML={{ __html: ADX_CSS + CSS }} /><Skeleton label="Loading roles" /></AdminShell>;
  }

  const rows = roleRows(d);
  const people = peopleRows(d);
  const holders = people.filter((p) => p.roleId === role.id);
  const others = people.filter((p) => p.roleId !== role.id && p.state !== 'inactive');
  const draftRole = { ...role, perms: normalise(perms) };
  const warn = mixWarning(draftRole);
  const layers = layersOf(draftRole);
  const preview = previewStaffFor(role.id);
  const nRights = Object.values(draftRole.perms).reduce((n, r) => n + OPS.filter(([k]) => r[k]).length, 0);

  return (
    <AdminShell active="roles" title="Roles & permissions">
      <style dangerouslySetInnerHTML={{ __html: ADX_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="shield-check" title="Roles & permissions"
          about="Each role says which areas of the super admin a person opens and what they may do there: view, create, edit, approve, delete or export. The three layers stay apart: a marketing person manages leads and campaigns without touching merchant subscriptions or the servers."
          primary={{ label: 'New role', icon: 'plus', onClick: () => setForm({ mode: 'new', title: '', about: '', from: '', error: '' }) }} />

        <div className="rl-grid">
          <section className="ix-card" aria-label="Roles">
            <ul className="rl-roles">
              {rows.map((r) => (
                <li key={r.id}>
                  <button type="button" className="rl-role" aria-current={r.id === role.id} onClick={() => go(r.id)}>
                    <span><b>{r.title}</b><small>{plural(r.people, 'person', 'people')} · {r.layers.join(', ') || 'No areas'}</small></span>
                    {r.warning ? <Icon className="rl-warn" name="triangle-alert" width="16" height="16" aria-label="Mixes layers" /> : null}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <div className="rl-main">
            <section className="ix-card" aria-labelledby="rl-role-h">
              <CardHead id="rl-role-h" title={role.title}>
                {preview
                  ? <Link className="ix-btn ix-btn--sm" href={'/admin?staff=' + preview.id} title={`Signs the demo in as ${preview.name}; switch back from the account menu`}><Icon name="eye" width="16" height="16" aria-hidden="true" />Preview the menu</Link>
                  : <button type="button" className="ix-btn ix-btn--sm" onClick={() => toast('No demo sign-in has this role yet, so its menu can’t be previewed.', { tone: 'info' })}><Icon name="eye-off" width="16" height="16" aria-hidden="true" />Preview the menu</button>}
                <Menu icon="ellipsis" label="" cls="ix-btn ix-btn--sm ix-btn--icon" items={[
                  { label: 'Duplicate', onClick: duplicate },
                  { label: 'Rename', onClick: () => setForm({ mode: 'edit', title: role.title, about: role.about, error: '' }) },
                  ...(role.system ? [] : [{ label: 'Delete role', onClick: remove, tone: 'danger' }]),
                ]} />
              </CardHead>
              <div className="rl-sum">
                {role.about ? <p>{role.about}</p> : null}
                <span className="rl-badges">
                  <StatusBadge tone={role.system ? 'neutral' : 'primary'}>{role.system ? 'Built-in' : 'Custom'}</StatusBadge>
                  <span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>{plural(nRights, 'right')} · {layers.join(', ') || 'No areas'}{role.updatedAt ? ` · changed ${ago(role.updatedAt, t)} by ${role.updatedBy}` : ''}</span>
                </span>
                {warn ? <Note warn>{warn}</Note> : null}
              </div>
            </section>

            <section className="ix-card" aria-labelledby="rl-mx-h">
              <CardHead id="rl-mx-h" title="Permissions" tip={<InfoTip text="A right needs View. Turning View off turns the area off. The menu still reads access.js (which areas each role opens); this matrix becomes the source once the super admin has a server." />} />
              {locked ? <div style={{ padding: 'var(--space-3) var(--space-4) 0' }}><Note>The super administrator always has every right. Duplicate it to make a narrower role.</Note></div> : null}
              <div className="ix-table-wrap ix-table-wrap--show">
                <table className="ix-table rl-matrix gc-table--keep gc-table--scroll">
                  <caption className="sr-only">{role.title}: rights per area</caption>
                  <thead><tr><th scope="col">Area</th>{OPS.map(([k, l]) => <th key={k} scope="col">{l}</th>)}</tr></thead>
                  <tbody>
                    {AREA_GROUPS.map((g) => (
                      <React.Fragment key={g.layer}>
                        <tr className="rl-layer"><td colSpan={OPS.length + 1}>{g.label}</td></tr>
                        {g.areas.map((a) => (
                          <tr key={a.id}>
                            <th scope="row" style={{ fontWeight: 'var(--weight-regular)' }}>
                              <span className="rl-area"><Icon name={ICONS[a.id]} width="16" height="16" aria-hidden="true" />{a.label}</span>
                              {!locked ? <button type="button" className="rl-row-all" onClick={() => rowAll(a.id)} aria-label={'All rights on ' + a.label}>{OPS.every(([k]) => perms[a.id][k]) ? 'None' : 'All'}</button> : null}
                            </th>
                            {OPS.map(([k, l]) => (
                              <td key={k}>
                                <label className="rl-cell">
                                  <input type="checkbox" className="gc-check" checked={!!perms[a.id][k]} disabled={locked} onChange={() => toggle(a.id, k)} aria-label={`${l} on ${a.label}`} />
                                </label>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="ix-card" aria-labelledby="rl-ppl-h">
              <CardHead id="rl-ppl-h" title={`People with this role · ${holders.length}`}>
                <button type="button" className="ix-btn ix-btn--sm" onClick={() => setPick({ person: '', error: '' })}><Icon name="user-plus" width="16" height="16" aria-hidden="true" />Assign person</button>
              </CardHead>
              {holders.length ? (
                <ul className="rl-people">
                  {holders.map((p) => (
                    <li key={p.id}>
                      <Person p={p} sub={p.title + ' · ' + p.email} />
                      <span className="rl-tags">
                        {p.state === 'invited' ? <StatusBadge tone="warning">Invited</StatusBadge> : null}
                        {!p.demo ? <span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }} title="Not one of the demo sign-ins">No demo sign-in</span> : null}
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => unassign(p)}>Remove</button>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : <div className="ix-empty"><EmptyState icon="users" title="Nobody has this role yet." actionLabel="Assign person" onAction={() => setPick({ person: '', error: '' })} /></div>}
            </section>

            {dirty ? <SaveBar onSave={save} onDiscard={discard} label={'Unsaved rights for ' + role.title} /> : null}
          </div>
        </div>
      </div>

      <Sheet open={!!form} title={form && form.mode === 'new' ? 'New role' : 'Rename role'} onClose={() => setForm(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setForm(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={submitForm}>{form && form.mode === 'new' ? 'Create role' : 'Save'}</button>
        </>}>
        {form ? (
          <div className="adx-form">
            <Field label="Name" htmlFor="rl-title" error={form.error}>
              <input id="rl-title" className={'gc-input' + (form.error ? ' gc-input--error' : '')} data-autofocus value={form.title} maxLength={40} placeholder="For example: Field sales" onChange={(e) => setForm({ ...form, title: e.target.value, error: '' })} />
            </Field>
            <Field label="What this role is for" optional htmlFor="rl-about">
              <textarea id="rl-about" className="gc-input adx-area" rows={3} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} />
            </Field>
            {form.mode === 'new' ? (
              <Field label="Start from" htmlFor="rl-from" help="Its rights are copied; change them after.">
                <select id="rl-from" className="gc-input gc-select" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })}>
                  <option value="">Nothing (Dashboard only)</option>
                  {rows.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                </select>
              </Field>
            ) : null}
          </div>
        ) : null}
      </Sheet>

      <Sheet open={!!pick} title={'Assign ' + role.title} onClose={() => setPick(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setPick(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={doAssign}>Assign</button>
        </>}>
        {pick ? (
          <div className="adx-form">
            <Field label="Person" htmlFor="rl-person" error={pick.error} help="A person has one role; their old role is replaced.">
              <select id="rl-person" className={'gc-input gc-select' + (pick.error ? ' gc-input--error' : '')} data-autofocus value={pick.person} onChange={(e) => setPick({ person: e.target.value, error: '' })}>
                <option value="">Choose a person</option>
                {others.map((p) => <option key={p.id} value={p.id}>{p.name} · now {roleTitleOf(d, p.roleId)}</option>)}
              </select>
            </Field>
            <Note>The menu a person sees still comes from access.js and their demo sign-in; this assignment becomes the source once the super admin has a server.</Note>
          </div>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
