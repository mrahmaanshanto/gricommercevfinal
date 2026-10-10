'use client';
// taskShared — parts of the super admin's Tasks page (/admin/tasks): styles, pickers (people, tags, related record),
// the "New task" side panel and a task's side panel (status, people, dates, related record, tags, checklist, time,
// comments, history). Copied from the merchant panel's Tasks screen (src/screens/team/Tasks.jsx) and adapted to
// GridCommerce's own teams; data from lib/admin/tasks (and lib/admin/meetings, lib/platform for the related pickers).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge } from '@/components/ui';
import { ago, dm } from '@/lib/platform/util';
import {
  TEAMS, STATUSES, PRIORITIES, RELATED, teamOf, statusOf, priorityOf, relatedHref, people as taskPeople, tagsInUse, dayKey,
  addTask, updateTask, setStatus, addCheckItem, toggleCheck, removeCheckItem, addComment, logTime, removeTask,
} from '@/lib/admin/tasks';
import { allMeetings } from '@/lib/admin/meetings';
import { Dot } from './meetShared';

export const TASK_CSS = `
.tk-skel{height:320px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:tk-sk 1.4s ease infinite}
@keyframes tk-sk{from{background-position:100% 0}to{background-position:-100% 0}}
.tk-shows{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:6px 8px 6px 12px;border-bottom:1px solid var(--border-subtle)}
.tk-shows .gc-seg__btn{height:32px}
.tk-shows__end{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);margin-left:auto}
.tk-group>h3{display:flex;align-items:center;gap:var(--space-2);min-height:32px;margin:0;padding:2px 12px 2px var(--space-4);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-body);background:var(--surface-subtle);border-bottom:1px solid var(--border-subtle)}
.tk-group>h3 input{width:16px;height:16px;margin-left:auto;accent-color:var(--primary)}
.tk-group>h3.is-over{color:var(--text-danger)}
.tk-row{display:flex;align-items:center;gap:var(--space-3);min-height:48px;padding:6px var(--space-4);border-bottom:1px solid var(--border-subtle);cursor:pointer}
.tk-row>input{width:16px;height:16px;flex:none;accent-color:var(--primary)}
.tk-row:hover{background:var(--surface-subtle)}
.tk-row:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.tk-row.is-sel{background:var(--fill-primary-soft)}
.tk-row.is-done .tk-title{text-decoration:line-through;color:var(--text-muted)}
.tk-check{position:relative;display:grid;place-items:center;width:32px;height:32px;flex:none;margin:-6px;border:0;border-radius:var(--radius-full);background:none;color:var(--text-inverse,#fff);cursor:pointer;padding:0}
.tk-check::before{content:'';position:absolute;inset:7px;border:2px solid var(--border-strong);border-radius:var(--radius-full);background:var(--surface-card)}
.tk-check>*{position:relative}
.tk-check[aria-pressed="true"]::before{background:var(--text-success);border-color:var(--text-success)}
.tk-main{flex:1;min-width:0}
.tk-title{display:block;overflow:hidden;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.tk-meta{display:flex;flex-wrap:wrap;align-items:center;gap:4px var(--space-3);margin-top:2px;font-size:var(--text-xs);color:var(--text-muted)}
.tk-meta>span,.tk-meta>a{display:inline-flex;align-items:center;gap:4px}
.tk-meta .gc-badge{height:20px;padding:0 8px}
.tk-due--overdue{color:var(--text-danger);font-weight:var(--weight-medium)}
.tk-due--today{color:var(--text-warning);font-weight:var(--weight-medium)}
.tk-tag{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-2xs);font-weight:var(--weight-medium);color:var(--text-body)}
.tk-team{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 8px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-2xs);font-weight:var(--weight-medium);color:var(--text-body)}
.tk-stack{display:flex;flex:none}
.tk-stack>*{margin-left:-6px;box-shadow:0 0 0 2px var(--surface-card)}
.tk-stack>*:first-child{margin-left:0}
.tk-board{display:grid;grid-auto-columns:minmax(250px,1fr);grid-auto-flow:column;gap:var(--space-3);padding:var(--space-3) var(--space-4) var(--space-4);overflow-x:auto}
.tk-col{display:flex;flex-direction:column;gap:var(--space-2);min-height:220px;padding:var(--space-2);border-radius:var(--radius-xl);background:var(--surface-subtle)}
.tk-col.is-over{outline:2px dashed var(--primary);outline-offset:-2px}
.tk-col>header{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);padding:2px 4px;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.tk-card{display:flex;flex-direction:column;gap:6px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);cursor:grab}
.tk-card:hover{border-color:var(--primary)}
.tk-card__top{display:flex;align-items:flex-start;gap:4px}
.tk-card__title{flex:1;min-width:0;padding:0;border:0;background:none;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-align:left;cursor:pointer}
.tk-card__title:hover{color:var(--primary)}
.tk-card__foot{display:flex;align-items:center;justify-content:space-between;gap:6px}
.tk-prog{height:4px;border-radius:var(--radius-full);background:var(--border-subtle);overflow:hidden}
.tk-prog i{display:block;height:100%;background:var(--text-success)}
.tk-cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;padding:var(--space-3) var(--space-4) var(--space-4)}
.tk-cal__h{padding:4px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:center}
.tk-cal__d{display:flex;flex-direction:column;gap:3px;min-height:96px;padding:6px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);min-width:0}
.tk-cal__d.is-today{border-color:var(--primary);background:var(--fill-primary-soft)}
.tk-cal__d.is-out{opacity:.45}
.tk-cal__d>span{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.tk-cal__t{display:block;width:100%;min-height:22px;padding:2px 6px;border:0;border-radius:var(--radius-sm);font:inherit;font-size:var(--text-2xs);text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;background:var(--fill-info-soft);color:var(--text-info)}
.tk-cal__t.is-late{background:var(--fill-error-soft);color:var(--text-danger)}
.tk-cal__t.is-urgent{background:var(--fill-warning-soft);color:var(--text-warning)}
.tk-cal__t.is-done{background:var(--fill-success-soft);color:var(--text-success);text-decoration:line-through}
.tk-load{display:flex;flex-direction:column}
.tk-load>div{display:grid;grid-template-columns:minmax(180px,1.2fr) minmax(140px,2fr) repeat(4,72px);align-items:center;gap:var(--space-3);min-height:48px;padding:6px var(--space-4);border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm)}
.tk-load>div:last-child{border-bottom:0}
.tk-load__row{cursor:pointer}
.tk-load__row:hover{background:var(--surface-subtle)}
.tk-load__row:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.tk-load__head{min-height:36px!important;background:var(--surface-subtle);font-size:var(--text-xs)!important;font-weight:var(--weight-medium);color:var(--text-body)}
.tk-load__who{display:flex;align-items:center;gap:8px;min-width:0}
.tk-load__who b{display:block;font-weight:var(--weight-medium);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tk-load__who small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.tk-load__bar{display:flex;height:8px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.tk-load__bar i{display:block;height:100%}
.tk-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums;text-align:right}
.tk-fig.is-bad{color:var(--text-danger);font-weight:var(--weight-medium)}
.tk-form{display:flex;flex-direction:column;gap:var(--space-3)}
.tk-form .gc-label{margin-bottom:6px}
.tk-form textarea.gc-input{height:auto;min-height:72px;padding:var(--space-2) var(--space-3);resize:vertical;line-height:1.5}
.tk-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.tk-chips{display:flex;flex-wrap:wrap;gap:6px}
.tk-pick{display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:2px 10px 2px 2px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);color:var(--text-body);cursor:pointer}
.tk-pick:hover{border-color:var(--text-danger)}
.tk-pick--tag{padding-left:10px}
.tk-add{display:flex;gap:var(--space-2)}
.tk-add .gc-input{flex:1;min-width:0}
.tk-sec{display:flex;flex-direction:column;gap:var(--space-2);padding-top:var(--space-3);border-top:1px solid var(--border-subtle)}
.tk-sec h3{display:flex;align-items:center;justify-content:space-between;margin:0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-body)}
.tk-sec h3 small{font-family:var(--font-data);font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.tk-cl{display:flex;flex-direction:column;gap:2px}
.tk-cl label{display:flex;align-items:center;gap:var(--space-2);min-height:36px;padding:0 var(--space-2);border-radius:var(--radius-md);font-size:var(--text-sm)}
.tk-cl label:hover{background:var(--surface-subtle)}
.tk-cl .is-done{text-decoration:line-through;color:var(--text-muted)}
.tk-cmt{display:flex;gap:var(--space-2);font-size:var(--text-sm)}
.tk-cmt b{font-weight:var(--weight-medium);color:var(--text-heading)}
.tk-cmt small{font-size:var(--text-xs);color:var(--text-muted)}
.tk-cmt p{margin:2px 0 0;color:var(--text-body);white-space:pre-wrap}
.tk-hist{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;font-size:var(--text-xs);color:var(--text-muted)}
.tk-hist b{color:var(--text-heading);font-weight:var(--weight-medium)}
.tk-err{margin:0;font-size:var(--text-xs);color:var(--text-danger)}
.tk-help{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.tk-titlein{font-size:var(--text-sm);font-weight:var(--weight-semibold)}
@media (max-width:900px){.tk-load>div{grid-template-columns:minmax(140px,1fr) repeat(2,56px)}.tk-load .hide-sm{display:none}}
@media (max-width:640px){
  .tk-two{grid-template-columns:1fr}
  .tk-row{padding:6px var(--space-3)}
  .tk-check{width:36px;height:36px}
  .tk-shows__end{margin-left:0}
  .tk-cal{gap:2px;padding:var(--space-2)}
  .tk-cal__d{min-height:56px;padding:4px}
  .tk-cal__t{height:6px;min-height:6px;padding:0;font-size:0}
}
@media (prefers-reduced-motion:reduce){.tk-skel{animation:none}}
`;

// ---- small parts --------------------------------------------------------------------------------------------------
export function People({ names, size = 24 }) {
  const list = names || [];
  return <span className="tk-stack" aria-label={list.join(', ')}>{list.slice(0, 3).map((n) => <Dot key={n} name={n} size={size} />)}{list.length > 3 ? <span className="mt-av" style={{ width: size, height: size, background: 'var(--surface-subtle)', color: 'var(--text-body)' }}>+{list.length - 3}</span> : null}</span>;
}
export function TeamChip({ id }) {
  const t = teamOf(id);
  return <span className="tk-team"><Icon name={t.icon} width="12" height="12" aria-hidden="true" />{t.name}</span>;
}
export function RelLink({ rel }) {
  if (!rel) return null;
  const href = relatedHref(rel);
  const icon = rel.kind === 'merchant' ? 'store' : rel.kind === 'lead' ? 'user-plus' : rel.kind === 'meeting' ? 'video' : 'life-buoy';
  const body = <><Icon name={icon} width="12" height="12" aria-hidden="true" />{rel.label}</>;
  return href ? <Link href={href} onClick={(e) => e.stopPropagation()}>{body}</Link> : <span>{body}</span>;
}

function PeoplePicker({ id, label, value, onChange, hint }) {
  const all = taskPeople();
  return (
    <div>
      <label className="gc-label" htmlFor={id}>{label}</label>
      {value.length ? <div className="tk-chips" style={{ marginBottom: 6 }}>{value.map((n) => <button key={n} type="button" className="tk-pick" onClick={() => onChange(value.filter((x) => x !== n))} aria-label={`Remove ${n}`}><Dot name={n} size={26} />{n}<Icon name="x" width="12" height="12" aria-hidden="true" /></button>)}</div> : null}
      <select id={id} className="gc-input gc-select" value="" onChange={(e) => e.target.value && onChange([...value, e.target.value])}>
        <option value="">{hint || 'Add a person…'}</option>
        {TEAMS.map((tm) => { const list = all.filter((p) => p.team === tm.id && !value.includes(p.name)); return list.length ? <optgroup key={tm.id} label={tm.name}>{list.map((p) => <option key={p.name} value={p.name}>{p.name} · {p.title}</option>)}</optgroup> : null; })}
      </select>
    </div>
  );
}

function TagPicker({ value, onChange }) {
  const [txt, setTxt] = useState('');
  const known = tagsInUse().filter((x) => !value.includes(x));
  const add = (x) => { const s = String(x || '').trim(); if (s && !value.includes(s)) onChange([...value, s]); setTxt(''); };
  return (
    <div>
      <span className="gc-label">Tags</span>
      {value.length ? <div className="tk-chips" style={{ marginBottom: 6 }}>{value.map((x) => <button key={x} type="button" className="tk-pick tk-pick--tag" onClick={() => onChange(value.filter((y) => y !== x))} aria-label={`Remove tag ${x}`}>#{x}<Icon name="x" width="12" height="12" aria-hidden="true" /></button>)}</div> : null}
      <div className="tk-add">
        <input className="gc-input" list="tk-tag-list" aria-label="Add a tag" placeholder="Add a tag" value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(txt); } }} />
        <datalist id="tk-tag-list">{known.map((x) => <option key={x} value={x} />)}</datalist>
        <button type="button" className="ix-btn" onClick={() => add(txt)}>Add</button>
      </div>
    </div>
  );
}

/** The record a task is about: { kind, id, label } or null. */
function RelatedPicker({ value, onChange, shops }) {
  const kind = value ? value.kind : '';
  const meetings = allMeetings().slice().reverse().slice(0, 60);
  const setKind = (k) => onChange(k ? { kind: k, id: '', label: '' } : null);
  return (
    <div className="tk-two">
      <div><label className="gc-label" htmlFor="tk-rk">Related to</label>
        <select id="tk-rk" className="gc-input gc-select" value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="">Nothing</option>{RELATED.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select></div>
      {kind === 'merchant' ? (
        <div><label className="gc-label" htmlFor="tk-rv">Merchant</label>
          <select id="tk-rv" className="gc-input gc-select" value={value.id} onChange={(e) => { const s = shops.find((x) => x.id === e.target.value); onChange(s ? { kind, id: s.id, label: s.name } : { kind, id: '', label: '' }); }}>
            <option value="">Choose a store</option>{shops.map((s) => <option key={s.id} value={s.id}>{s.name} · #{s.id}</option>)}
          </select></div>
      ) : kind === 'meeting' ? (
        <div><label className="gc-label" htmlFor="tk-rv">Meeting</label>
          <select id="tk-rv" className="gc-input gc-select" value={value.id} onChange={(e) => { const m = meetings.find((x) => x.id === e.target.value); onChange(m ? { kind, id: m.id, label: m.title } : { kind, id: '', label: '' }); }}>
            <option value="">Choose a meeting</option>{meetings.map((m) => <option key={m.id} value={m.id}>{dm(m.at)} · {m.title}</option>)}
          </select></div>
      ) : kind ? (
        <div><label className="gc-label" htmlFor="tk-rv">{kind === 'lead' ? 'Lead name' : 'Ticket'}</label>
          <input id="tk-rv" className="gc-input" value={value.label} onChange={(e) => onChange({ kind, id: kind === 'ticket' ? e.target.value.trim().split(/\s+/)[0] || '' : '', label: e.target.value })} placeholder={kind === 'lead' ? 'Business name' : 'TCK-4182 · subject'} /></div>
      ) : null}
    </div>
  );
}

// ---- new task -----------------------------------------------------------------------------------------------------
/** The "New task" side panel (mount it to open it). preset: { related, team, … } */
export function NewTaskSheet({ onClose, me, t, shops, preset, onDone }) {
  const [f, setF] = useState(() => {
    const mine = taskPeople().find((p) => p.name === me);
    return { title: '', team: mine ? mine.team : 'operations', priority: 'normal', due: dayKey(t), assignees: [me], watchers: [], related: null, tags: [], steps: '', notes: '', estimate: '', err: '', ...(preset || {}) };
  });
  const set = (p) => setF({ ...f, ...p, err: '' });
  const save = () => {
    const r = addTask({ ...f, checklist: f.steps.split('\n').map((x) => x.trim()).filter(Boolean), related: f.related && f.related.label ? f.related : null }, me);
    if (!r.ok) { setF({ ...f, err: r.error }); return; }
    const to = r.task.assignees.filter((x) => x !== me);
    toast(to.length ? `${r.task.id} given to ${to.join(', ')}` : r.task.assignees.length ? `${r.task.id} added to your list` : `${r.task.id} added to ${teamOf(r.task.team).name} for anyone to take`);
    if (onDone) onDone(r.task);
    onClose();
  };
  return (
    <Sheet open title="New task" onClose={onClose}
      footer={<><button type="button" className="ix-btn" onClick={onClose}>Cancel</button><button type="button" className="ix-btn ix-btn--primary" onClick={save}>Add task</button></>}>
      <div className="tk-form">
        <div><label className="gc-label" htmlFor="tn-title">Task *</label><input id="tn-title" className="gc-input" value={f.title} onChange={(e) => set({ title: e.target.value })} placeholder="For example: send the proposal to Shapla Electronics" aria-required="true" data-autofocus /></div>
        <div className="tk-two">
          <div><label className="gc-label" htmlFor="tn-team">Team</label><select id="tn-team" className="gc-input gc-select" value={f.team} onChange={(e) => set({ team: e.target.value })}>{TEAMS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
          <div><label className="gc-label" htmlFor="tn-pri">Priority</label><select id="tn-pri" className="gc-input gc-select" value={f.priority} onChange={(e) => set({ priority: e.target.value })}>{PRIORITIES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></div>
        </div>
        <div className="tk-two">
          <div><label className="gc-label" htmlFor="tn-due">Due</label><input id="tn-due" className="gc-input" type="date" value={f.due} onChange={(e) => set({ due: e.target.value })} /></div>
          <div><label className="gc-label" htmlFor="tn-est">Estimate (hours)</label><input id="tn-est" className="gc-input mt-data" inputMode="decimal" value={f.estimate} onChange={(e) => set({ estimate: e.target.value.replace(/[^\d.]/g, '') })} /></div>
        </div>
        <PeoplePicker id="tn-who" label="Assign to" value={f.assignees} onChange={(v) => set({ assignees: v })} hint={f.assignees.length ? 'Add another person…' : 'Leave empty for anyone in the team…'} />
        <PeoplePicker id="tn-watch" label="Watchers" value={f.watchers} onChange={(v) => set({ watchers: v })} hint="They follow the updates…" />
        <RelatedPicker value={f.related} onChange={(v) => set({ related: v })} shops={shops} />
        <TagPicker value={f.tags} onChange={(v) => set({ tags: v })} />
        <div><label className="gc-label" htmlFor="tn-steps">Checklist</label><textarea id="tn-steps" className="gc-input" value={f.steps} onChange={(e) => set({ steps: e.target.value })} placeholder="One step per line" /></div>
        <div><label className="gc-label" htmlFor="tn-notes">Notes</label><textarea id="tn-notes" className="gc-input" value={f.notes} onChange={(e) => set({ notes: e.target.value })} /></div>
        {f.err ? <p className="tk-err" role="alert">{f.err}</p> : null}
      </div>
    </Sheet>
  );
}

// ---- one task -----------------------------------------------------------------------------------------------------
export function TaskSheet({ task, me, t, shops, onClose }) {
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes || '');
  const [step, setStep] = useState('');
  const [note, setNote] = useState('');
  const [hours, setHours] = useState('');
  const [tab, setTab] = useState('comments');
  useEffect(() => { setTitle(task.title); setNotes(task.notes || ''); }, [task.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const save = (patch, msg) => { const r = updateTask(task.id, patch, me); if (!r.ok) toast(r.error, { tone: 'error' }); else if (msg) toast(msg); };
  const cl = task.checklist || [];
  const doneN = cl.filter((c) => c.done).length;
  const remove = async () => {
    if (!(await confirmDialog({ title: 'Delete this task?', body: `“${task.title}” and its comments go for good.`, confirmLabel: 'Delete', tone: 'danger' }))) return;
    removeTask(task.id); toast(`${task.id} deleted`); onClose();
  };
  const toggleDone = () => { setStatus(task.id, task.status === 'done' ? 'todo' : 'done', me); toast(task.status === 'done' ? `${task.id} is open again` : `${task.id} done`); };
  const log = () => { const r = logTime(task.id, hours, me); if (!r.ok) { toast(r.error, { tone: 'error' }); return; } toast(`${Number(hours)} h logged`); setHours(''); };
  const watchingMe = (task.watchers || []).includes(me);
  return (
    <Sheet open title={task.id} label={`Task ${task.id}: ${task.title}`} onClose={onClose}
      footer={<><button type="button" className="ix-btn ix-btn--danger" onClick={remove}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /><span>Delete</span></button><span style={{ flex: 1 }} /><button type="button" className={task.status === 'done' ? 'ix-btn' : 'ix-btn ix-btn--primary'} onClick={toggleDone}><Icon name={task.status === 'done' ? 'rotate-ccw' : 'check'} width="16" height="16" aria-hidden="true" /><span>{task.status === 'done' ? 'Open again' : 'Mark done'}</span></button></>}>
      <div className="tk-form">
        <div><label className="gc-label" htmlFor="tt-title">Task</label>
          <input id="tt-title" className="gc-input tk-titlein" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => { if (title.trim() && title.trim() !== task.title) save({ title }, 'Title saved'); else setTitle(task.title); }} /></div>
        <div className="tk-chips">
          <StatusBadge tone={statusOf(task.status).tone}>{statusOf(task.status).label}</StatusBadge>
          {task.priority === 'urgent' || task.priority === 'high' ? <StatusBadge tone={priorityOf(task.priority).tone}>{priorityOf(task.priority).label}</StatusBadge> : null}
          <TeamChip id={task.team} />
          {task.related ? <span className="tk-meta" style={{ marginTop: 0 }}><RelLink rel={task.related} /></span> : null}
        </div>
        <div className="tk-two">
          <div><label className="gc-label" htmlFor="tt-st">Status</label><select id="tt-st" className="gc-input gc-select" value={task.status} onChange={(e) => save({ status: e.target.value }, `Status: ${statusOf(e.target.value).label}`)}>{STATUSES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></div>
          <div><label className="gc-label" htmlFor="tt-pri">Priority</label><select id="tt-pri" className="gc-input gc-select" value={task.priority} onChange={(e) => save({ priority: e.target.value })}>{PRIORITIES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></div>
          <div><label className="gc-label" htmlFor="tt-team">Team</label><select id="tt-team" className="gc-input gc-select" value={task.team} onChange={(e) => save({ team: e.target.value })}>{TEAMS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
          <div><label className="gc-label" htmlFor="tt-due">Due</label><input id="tt-due" className="gc-input" type="date" value={task.due || ''} onChange={(e) => save({ due: e.target.value })} /></div>
        </div>
        <PeoplePicker id="tt-who" label="Assigned to" value={task.assignees || []} onChange={(v) => save({ assignees: v })} hint={(task.assignees || []).length ? 'Add someone…' : 'Open for the team. Give it to…'} />
        {!(task.assignees || []).includes(me) ? <span><button type="button" className="ix-btn ix-btn--sm" onClick={() => save({ assignees: [...(task.assignees || []), me] }, 'It’s yours now')}><Icon name="hand" width="14" height="14" aria-hidden="true" /><span>Take it</span></button></span> : null}
        <div>
          <PeoplePicker id="tt-watch" label="Watchers" value={task.watchers || []} onChange={(v) => save({ watchers: v })} hint="Add a watcher…" />
          <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" style={{ marginTop: 6 }} onClick={() => save({ watchers: watchingMe ? task.watchers.filter((x) => x !== me) : [...(task.watchers || []), me] }, watchingMe ? 'You stopped watching' : 'You’re watching it')}><Icon name={watchingMe ? 'eye-off' : 'eye'} width="14" height="14" aria-hidden="true" /><span>{watchingMe ? 'Stop watching' : 'Watch'}</span></button>
        </div>
        <RelatedPicker value={task.related} onChange={(v) => { if (!v || v.label) save({ related: v }); }} shops={shops} />
        <TagPicker value={task.tags || []} onChange={(v) => save({ tags: v })} />
        <div><label className="gc-label" htmlFor="tt-notes">Notes</label><textarea id="tt-notes" className="gc-input" value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => { if (notes !== (task.notes || '')) save({ notes }, 'Notes saved'); }} /></div>

        <section className="tk-sec" aria-label="Checklist">
          <h3>Checklist<small>{cl.length ? `${doneN} of ${cl.length}` : ''}</small></h3>
          {cl.length ? <div className="tk-prog"><i style={{ width: `${(doneN / cl.length) * 100}%` }} /></div> : null}
          <div className="tk-cl">{cl.map((c) => <label key={c.id}><input type="checkbox" className="gc-check" checked={c.done} onChange={() => toggleCheck(task.id, c.id, me)} /><span className={c.done ? 'is-done' : ''} style={{ flex: 1 }}>{c.text}</span><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Remove step ${c.text}`} onClick={(e) => { e.preventDefault(); removeCheckItem(task.id, c.id, me); }}><Icon name="x" width="14" height="14" aria-hidden="true" /></button></label>)}</div>
          <div className="tk-add"><input className="gc-input" aria-label="New step" placeholder="Add a step" value={step} onChange={(e) => setStep(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && addCheckItem(task.id, step, me).ok) setStep(''); }} /><button type="button" className="ix-btn" onClick={() => { if (addCheckItem(task.id, step, me).ok) setStep(''); }}>Add</button></div>
        </section>

        <section className="tk-sec" aria-label="Time">
          <h3>Time<small>{task.logged || 0} of {task.estimate || '—'} h</small></h3>
          {task.estimate ? <div className="tk-prog"><i style={{ width: `${Math.min(100, ((task.logged || 0) / task.estimate) * 100)}%`, background: (task.logged || 0) > task.estimate ? 'var(--text-danger)' : undefined }} /></div> : null}
          <div className="tk-add"><input className="gc-input mt-data" inputMode="decimal" aria-label="Hours to log" placeholder="+ hours" value={hours} onChange={(e) => setHours(e.target.value.replace(/[^\d.]/g, ''))} onKeyDown={(e) => { if (e.key === 'Enter') log(); }} /><button type="button" className="ix-btn" onClick={log}>Log time</button></div>
        </section>

        <section className="tk-sec" aria-label="Comments and history">
          <div className="gc-seg" role="tablist" aria-label="Comments or history">
            {[['comments', `Comments · ${(task.comments || []).length}`], ['history', 'History']].map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} className={'gc-seg__btn' + (tab === k ? ' gc-seg__btn--active' : '')} onClick={() => setTab(k)}>{l}</button>)}
          </div>
          {tab === 'comments' ? (<>
            {(task.comments || []).map((c, i) => <div key={i} className="tk-cmt"><Dot name={c.by} size={28} /><div><b>{c.by}</b> <small>{ago(c.at, t)}</small><p>{c.text}</p></div></div>)}
            <div className="tk-add"><input className="gc-input" aria-label="Comment" placeholder="Write a comment" value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && addComment(task.id, me, note).ok) setNote(''); }} /><button type="button" className="ix-btn" onClick={() => { if (addComment(task.id, me, note).ok) setNote(''); }}>Send</button></div>
          </>) : (
            <ul className="tk-hist">{[...(task.history || [])].reverse().map((h, i) => <li key={i}><b>{h.by}</b> · {h.text} · {ago(h.at, t)}</li>)}</ul>
          )}
        </section>
        <p className="tk-help">Made by {task.by} · {ago(task.at, t)}{task.doneAt ? ` · done ${ago(task.doneAt, t)}` : ''}</p>
      </div>
    </Sheet>
  );
}
