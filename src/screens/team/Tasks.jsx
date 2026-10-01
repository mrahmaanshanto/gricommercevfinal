'use client';
// Tasks (/tasks) — the team's to-do list (src/lib/tasks.js): my tasks, what I gave others, or everyone; a list by
// due date or a board by status (drag a card, or use its menu); priority, area, repeat, checklist and comments.
// ?task=TK-101 opens a task; ?new=1 starts one.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Dialog, EmptyState } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { USERS, roleOf } from '@/lib/team';
import { STATUSES, PRIORITIES, AREAS, statusLabel, statusTone, priorityOf, saveTask, setStatus, toggleCheck, addComment, removeTask, dueState, dayKeyOf } from '@/lib/tasks';
import { TeamPage, useMe, useTasks, UserAvatar, userName } from './teamShared';

const CSS = `
.tk-group > h3{display:flex;align-items:center;gap:var(--space-2);margin:0;padding:var(--space-3) var(--space-5);font-size:var(--text-xs);font-weight:var(--weight-semibold);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted);background:var(--surface-subtle);border-bottom:1px solid var(--border-subtle)}
.tk-row{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-5);border-bottom:1px solid var(--border-subtle);cursor:pointer}
.tk-row:hover{background:var(--surface-subtle)}
.tk-row.is-done .tk-title{text-decoration:line-through;color:var(--text-muted)}
.tk-check{position:relative;display:grid;place-items:center;width:36px;height:36px;flex:none;margin:-6px;border:0;border-radius:var(--radius-full);background:none;color:var(--text-on-dark);cursor:pointer;padding:0}
.tk-check::before{content:'';position:absolute;inset:6px;border:2px solid var(--border-strong, var(--border-field));border-radius:var(--radius-full);background:var(--surface-card)}
.tk-check > *{position:relative}
.tk-check[aria-pressed="true"]::before{background:var(--text-success);border-color:var(--text-success)}
.tk-check:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.tk-main{flex:1;min-width:0}
.tk-title{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.tk-meta{display:flex;flex-wrap:wrap;align-items:center;gap:6px var(--space-3);margin-top:3px;font-size:var(--text-xs);color:var(--text-muted)}
.tk-meta span{display:inline-flex;align-items:center;gap:4px}
.tk-due--overdue{color:var(--text-danger);font-weight:var(--weight-medium)}
.tk-due--today{color:var(--text-warning);font-weight:var(--weight-medium)}
.tk-board{display:grid;grid-template-columns:repeat(4,minmax(240px,1fr));gap:var(--space-3);padding:var(--space-4) var(--space-5) var(--space-5);overflow-x:auto}
.tk-col{display:flex;flex-direction:column;gap:var(--space-2);min-height:200px;padding:var(--space-3);border-radius:var(--radius-xl);background:var(--surface-subtle)}
.tk-col.is-over{outline:2px dashed var(--primary);outline-offset:-2px}
.tk-col > header{display:flex;align-items:center;justify-content:space-between;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.tk-card{display:flex;flex-direction:column;gap:6px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);cursor:grab;text-align:left;font:inherit}
.tk-card:hover{border-color:var(--primary)}
.tk-card b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.tk-prog{height:4px;border-radius:var(--radius-full);background:var(--border-subtle);overflow:hidden}
.tk-prog i{display:block;height:100%;background:var(--text-success)}
.tk-cl{display:flex;flex-direction:column;gap:4px}
.tk-cl label{display:flex;align-items:center;gap:var(--space-2);min-height:36px;padding:0 var(--space-2);border-radius:var(--radius-md);font-size:var(--text-sm)}
.tk-cl label:hover{background:var(--surface-subtle)}
.tk-cl .is-done{text-decoration:line-through;color:var(--text-muted)}
.tk-cmt{display:flex;gap:var(--space-2);font-size:var(--text-sm)}
.tk-cmt p{margin:2px 0 0;color:var(--text-body)}
@media (max-width:640px){.tk-row{padding:var(--space-3)}}
`;
const GROUPS = [['overdue', 'Overdue'], ['today', 'Today'], ['week', 'This week'], ['later', 'Later'], ['none', 'No date'], ['done', 'Done']];
const blank = (me, today) => ({ title: '', notes: '', assignee: me.id, by: me.id, due: today, priority: 'normal', status: 'todo', area: 'Management', repeat: '', checklist: [], comments: [], link: null });

export default function Tasks() {
  const { me, ready } = useMe();
  const { tasks } = useTasks();
  const today = dayKeyOf(Date.now());
  const boss = roleOf(me).access === '*' || ['hr', 'shop-manager', 'wh-manager'].includes(me.role);
  const [scope, setScope] = useState('mine');
  const [view, setView] = useState('list');
  const [q, setQ] = useState('');
  const [who, setWho] = useState('');
  const [area, setArea] = useState('');
  const [openId, setOpenId] = useState('');
  const [draft, setDraft] = useState(null);
  const [showDone, setShowDone] = useState(false);
  const [over, setOver] = useState('');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('task')) setOpenId(p.get('task'));
    if (p.get('new')) setDraft(blank(me, today));
    if (p.get('scope')) setScope(p.get('scope'));
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const needle = q.trim().toLowerCase();
  const list = useMemo(() => tasks.filter((t) => (scope === 'mine' ? t.assignee === me.id : scope === 'gave' ? t.by === me.id && t.assignee !== me.id : true)
    && (!who || t.assignee === who) && (!area || t.area === area) && (!needle || `${t.title} ${t.notes} ${t.id}`.toLowerCase().includes(needle))), [tasks, scope, me.id, who, area, needle]);
  const open = list.filter((t) => t.status !== 'done');
  const kpi = { open: open.length, overdue: open.filter((t) => dueState(t, today) === 'overdue').length, today: open.filter((t) => dueState(t, today) === 'today').length, done: list.filter((t) => t.doneAt && t.doneAt > Date.now() - 7 * 864e5).length };
  const task = tasks.find((t) => t.id === openId) || null;

  const done = (t) => {
    const made = setStatus(t.id, t.status === 'done' ? 'todo' : 'done');
    toast(t.status === 'done' ? `“${t.title}” is open again.` : made ? `Done. Next one is on ${formatDate(new Date(made.due + 'T00:00:00').getTime())}.` : 'Done. Nice work.');
  };
  const create = (e) => {
    e.preventDefault();
    if (!draft.title.trim()) { toast('Give the task a title', { tone: 'error' }); return; }
    const row = saveTask({ ...draft, title: draft.title.trim() });
    toast(row.assignee === me.id ? 'Task added to your list.' : `Task given to ${userName(row.assignee)}.`);
    setDraft(null);
  };
  const drop = (status) => (e) => { e.preventDefault(); setOver(''); const id = e.dataTransfer.getData('text/plain'); const t = tasks.find((x) => x.id === id); if (t && t.status !== status) { const made = setStatus(id, status); toast(`Moved to ${statusLabel(status)}${made ? ' · the next one is made' : ''}.`); } };

  const Row = ({ t }) => {
    const ds = dueState(t, today);
    const cl = t.checklist || [];
    const pr = priorityOf(t.priority);
    return (
      <div className={'tk-row' + (t.status === 'done' ? ' is-done' : '')} onClick={() => setOpenId(t.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setOpenId(t.id); }}>
        <button type="button" className="tk-check" aria-pressed={t.status === 'done'} aria-label={t.status === 'done' ? `Open “${t.title}” again` : `Mark “${t.title}” done`} onClick={(e) => { e.stopPropagation(); done(t); }}>{t.status === 'done' ? <Icon name="check" width="14" height="14" aria-hidden="true" /> : null}</button>
        <div className="tk-main">
          <span className="tk-title">{t.title}</span>
          <div className="tk-meta">
            {t.due ? <span className={ds === 'overdue' ? 'tk-due--overdue' : ds === 'today' ? 'tk-due--today' : ''}><Icon name="calendar" width="12" height="12" aria-hidden="true" />{ds === 'today' ? 'Today' : formatDate(new Date(t.due + 'T00:00:00').getTime())}{ds === 'overdue' ? ' · late' : ''}</span> : null}
            <span>{t.area}</span>
            {t.status !== 'todo' && t.status !== 'done' ? <span className={'gc-badge gc-badge--' + statusTone(t.status)}>{statusLabel(t.status)}</span> : null}
            {t.priority === 'urgent' || t.priority === 'high' ? <span className={'gc-badge gc-badge--' + pr[2]}>{pr[1]}</span> : null}
            {cl.length ? <span><Icon name="list-checks" width="12" height="12" aria-hidden="true" />{cl.filter((c) => c.done).length}/{cl.length}</span> : null}
            {(t.comments || []).length ? <span><Icon name="message-square" width="12" height="12" aria-hidden="true" />{t.comments.length}</span> : null}
            {t.repeat ? <span><Icon name="repeat" width="12" height="12" aria-hidden="true" />{t.repeat}</span> : null}
            {scope !== 'mine' || t.by !== me.id ? <span>{t.by !== t.assignee ? `from ${userName(t.by).split(' ')[0]}` : ''}</span> : null}
          </div>
        </div>
        <UserAvatar id={t.assignee} size={30} />
      </div>
    );
  };

  return (
    <TeamPage screen="Tasks" active="tasks" crumb="General" page="Tasks" title="Tasks" css={CSS}
      description={scope === 'mine' ? `${me.name.split(' ')[0]}’s tasks — tick them off as you go.` : 'What the team is working on.'}
      actions={<button type="button" className="gc-btn gc-btn--solid" onClick={() => setDraft(blank(me, today))}><Icon name="plus" width="18" height="18" aria-hidden="true" /> New task</button>}>
      <div className="gc-kpis">
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="list-todo" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Open</p><p className="gc-kpi__value">{kpi.open}</p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-error-soft)', color: 'var(--text-danger)' }}><Icon name="alarm-clock" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Overdue</p><p className="gc-kpi__value">{kpi.overdue}</p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-warning-soft)', color: 'var(--text-warning)' }}><Icon name="calendar-check" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Due today</p><p className="gc-kpi__value">{kpi.today}</p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-success-soft)', color: 'var(--text-success)' }}><Icon name="circle-check" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Done this week</p><p className="gc-kpi__value">{kpi.done}</p></div></div>
      </div>

      <section className="gc-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="tm-bar">
          <div className="tm-bar__g">
            <div className="gc-seg" role="group" aria-label="Whose tasks">
              {[['mine', 'My tasks'], ['gave', 'I gave'], ...(boss ? [['all', 'Everyone']] : [])].map(([k, l]) => <button key={k} type="button" className={'gc-seg__btn' + (scope === k ? ' gc-seg__btn--active' : '')} aria-pressed={scope === k} onClick={() => setScope(k)}>{l}</button>)}
            </div>
            <div className="gc-seg" role="group" aria-label="View">
              {[['list', 'List'], ['board', 'Board']].map(([k, l]) => <button key={k} type="button" className={'gc-seg__btn' + (view === k ? ' gc-seg__btn--active' : '')} aria-pressed={view === k} onClick={() => setView(k)}>{l}</button>)}
            </div>
          </div>
          <div className="tm-bar__g">
            {scope === 'all' ? <select className="gc-input gc-select" style={{ width: 'auto' }} aria-label="Person" value={who} onChange={(e) => setWho(e.target.value)}><option value="">Everyone</option>{USERS.map((u) => <option key={u.id} value={u.id}>{u.name} · {roleOf(u).title}</option>)}</select> : null}
            <select className="gc-input gc-select" style={{ width: 'auto' }} aria-label="Area" value={area} onChange={(e) => setArea(e.target.value)}><option value="">All areas</option>{AREAS.map((a) => <option key={a}>{a}</option>)}</select>
            <input type="search" className="gc-input" style={{ width: 220 }} placeholder="Search tasks" aria-label="Search tasks" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        {!list.length ? <EmptyState icon="list-checks" title={scope === 'mine' ? 'Nothing on your list' : 'No tasks here'} body="Add a task, or look at another view." actionLabel="New task" onAction={() => setDraft(blank(me, today))} /> : view === 'list' ? (
          GROUPS.map(([g, label]) => {
            const rows = list.filter((t) => dueState(t, today) === g).sort((a, b) => (a.due || '9').localeCompare(b.due || '9') || PRIORITIES.findIndex((p) => p[0] === a.priority) - PRIORITIES.findIndex((p) => p[0] === b.priority));
            if (!rows.length) return null;
            if (g === 'done') return (
              <div key={g} className="tk-group">
                <h3><button type="button" className="gc-btn gc-btn--flat gc-btn--sm" onClick={() => setShowDone(!showDone)} aria-expanded={showDone}><Icon name={showDone ? 'chevron-down' : 'chevron-right'} width="14" height="14" aria-hidden="true" />Done · {rows.length}</button></h3>
                {showDone ? rows.map((t) => <Row key={t.id} t={t} />) : null}
              </div>
            );
            return <div key={g} className="tk-group"><h3>{label} <span className="gc-badge gc-badge--slate">{rows.length}</span></h3>{rows.map((t) => <Row key={t.id} t={t} />)}</div>;
          })
        ) : (
          <div className="tk-board">
            {STATUSES.map(([k, label]) => {
              const col = list.filter((t) => t.status === k);
              return (
                <div key={k} className={'tk-col' + (over === k ? ' is-over' : '')} onDragOver={(e) => { e.preventDefault(); setOver(k); }} onDragLeave={() => setOver('')} onDrop={drop(k)}>
                  <header><span>{label}</span><span className="gc-badge gc-badge--slate">{col.length}</span></header>
                  {col.map((t) => {
                    const cl = t.checklist || [];
                    const ds = dueState(t, today);
                    return (
                      <button key={t.id} type="button" className="tk-card" draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', t.id)} onClick={() => setOpenId(t.id)}>
                        <b>{t.title}</b>
                        <span className="tk-meta" style={{ marginTop: 0 }}>
                          {t.due ? <span className={ds === 'overdue' ? 'tk-due--overdue' : ds === 'today' ? 'tk-due--today' : ''}>{ds === 'today' ? 'Today' : formatDate(new Date(t.due + 'T00:00:00').getTime())}</span> : null}
                          <span>{t.area}</span>
                          {t.priority === 'urgent' || t.priority === 'high' ? <span className={'gc-badge gc-badge--' + priorityOf(t.priority)[2]}>{priorityOf(t.priority)[1]}</span> : null}
                        </span>
                        {cl.length ? <span className="tk-prog" aria-label={`${cl.filter((c) => c.done).length} of ${cl.length} steps`}><i style={{ width: `${(cl.filter((c) => c.done).length / cl.length) * 100}%` }} /></span> : null}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><UserAvatar id={t.assignee} size={24} /><span className="tm-sub">{userName(t.assignee)}</span></span>
                      </button>
                    );
                  })}
                  {!col.length ? <span className="tm-sub" style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>Drop a task here</span> : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {task ? <TaskDialog task={task} me={me} onClose={() => { setOpenId(''); const u = new URL(window.location.href); if (u.searchParams.has('task')) { u.searchParams.delete('task'); window.history.replaceState(window.history.state, '', u.pathname + u.search); } }} /> : null}
      <Dialog open={!!draft} title="New task" onClose={() => setDraft(null)} width={600}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDraft(null)}>Cancel</button><button type="submit" form="tk-new" className="gc-btn gc-btn--solid">Add task</button></>}>
        {draft ? <form id="tk-new" className="tm-form" onSubmit={create}><TaskFields t={draft} set={(p) => setDraft({ ...draft, ...p })} autoFocus /></form> : null}
      </Dialog>
    </TeamPage>
  );
}

function TaskFields({ t, set, autoFocus }) {
  return (
    <>
      <div><label className="gc-label" htmlFor="tk-title">Task</label><input id="tk-title" className="gc-input" value={t.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Count the damaged items bay" data-autofocus={autoFocus || undefined} /></div>
      <div className="tm-two">
        <div><label className="gc-label" htmlFor="tk-who">For</label><select id="tk-who" className="gc-input gc-select" value={t.assignee} onChange={(e) => set({ assignee: e.target.value })}>{USERS.map((u) => <option key={u.id} value={u.id}>{u.name} · {roleOf(u).title}</option>)}</select></div>
        <div><label className="gc-label" htmlFor="tk-due">Due</label><input id="tk-due" type="date" className="gc-input" value={t.due} onChange={(e) => set({ due: e.target.value })} /></div>
      </div>
      <div className="tm-three">
        <div><label className="gc-label" htmlFor="tk-pri">Priority</label><select id="tk-pri" className="gc-input gc-select" value={t.priority} onChange={(e) => set({ priority: e.target.value })}>{PRIORITIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
        <div><label className="gc-label" htmlFor="tk-area">Area</label><select id="tk-area" className="gc-input gc-select" value={t.area} onChange={(e) => set({ area: e.target.value })}>{AREAS.map((a) => <option key={a}>{a}</option>)}</select></div>
        <div><label className="gc-label" htmlFor="tk-rep">Repeat</label><select id="tk-rep" className="gc-input gc-select" value={t.repeat} onChange={(e) => set({ repeat: e.target.value })}><option value="">Does not repeat</option><option value="daily">Every day</option><option value="weekly">Every week</option><option value="monthly">Every month</option></select></div>
      </div>
      <div><label className="gc-label" htmlFor="tk-notes">Notes</label><textarea id="tk-notes" className="gc-input" rows={3} style={{ height: 'auto', paddingTop: 10 }} value={t.notes} onChange={(e) => set({ notes: e.target.value })} /></div>
    </>
  );
}

function TaskDialog({ task, me, onClose }) {
  const [edit, setEdit] = useState(null);
  const [step, setStep] = useState('');
  const [note, setNote] = useState('');
  const cl = task.checklist || [];
  const saveEdit = (e) => { e.preventDefault(); if (!edit.title.trim()) { toast('Give the task a title', { tone: 'error' }); return; } saveTask({ ...edit, id: task.id, title: edit.title.trim() }); setEdit(null); toast('Task saved.'); };
  const addStep = (e) => { e.preventDefault(); if (!step.trim()) return; saveTask({ id: task.id, checklist: [...cl, { id: 'c' + Date.now().toString(36), text: step.trim(), done: false }] }); setStep(''); };
  const send = (e) => { e.preventDefault(); if (!note.trim()) return; addComment(task.id, me.id, note); setNote(''); };
  const remove = async () => { if (await confirmDialog({ title: 'Delete this task?', body: `“${task.title}” and its comments go for good.`, confirmLabel: 'Delete', tone: 'danger' })) { removeTask(task.id); toast('Task deleted.'); onClose(); } };
  const pr = priorityOf(task.priority);
  return (
    <Dialog open title={edit ? 'Edit task' : task.title} onClose={onClose} width={680}
      footer={edit ? <><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit(null)}>Cancel</button><button type="submit" form="tk-edit" className="gc-btn gc-btn--solid">Save</button></> : <><button type="button" className="gc-btn gc-btn--flat" onClick={remove}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /> Delete</button><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit({ ...task })}><Icon name="pencil" width="16" height="16" aria-hidden="true" /> Edit</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => { const made = setStatus(task.id, task.status === 'done' ? 'todo' : 'done'); toast(task.status === 'done' ? 'Opened again.' : made ? 'Done — the next one is made.' : 'Done.'); }}>{task.status === 'done' ? 'Open again' : 'Mark done'}</button></>}>
      {edit ? <form id="tk-edit" className="tm-form" onSubmit={saveEdit}><TaskFields t={edit} set={(p) => setEdit({ ...edit, ...p })} /></form> : (
        <div className="tm-form">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center' }}>
            <span className="gc-badge gc-badge--slate">{task.id}</span>
            <span className={'gc-badge gc-badge--' + pr[2]}>{pr[1]}</span>
            <span className="gc-badge gc-badge--slate">{task.area}</span>
            {task.repeat ? <span className="gc-badge gc-badge--info"><Icon name="repeat" width="12" height="12" aria-hidden="true" /> {task.repeat}</span> : null}
          </div>
          <div className="tm-three">
            <div><span className="gc-label">For</span><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><UserAvatar id={task.assignee} size={28} /><span className="tm-strong">{userName(task.assignee)}</span></span></div>
            <div><span className="gc-label">Due</span><span className="tm-strong">{task.due ? formatDate(new Date(task.due + 'T00:00:00').getTime()) : 'No date'}</span></div>
            <div><label className="gc-label" htmlFor="tk-st">Status</label><select id="tk-st" className="gc-input gc-select" value={task.status} onChange={(e) => { const made = setStatus(task.id, e.target.value); toast(`Moved to ${statusLabel(e.target.value)}${made ? ' · the next one is made' : ''}.`); }}>{STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          </div>
          {task.notes ? <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)', whiteSpace: 'pre-wrap' }}>{task.notes}</p> : null}
          {task.link ? <Link href={task.link.href} className="gc-btn gc-btn--neutral gc-btn--sm" style={{ alignSelf: 'flex-start' }}><Icon name="external-link" width="14" height="14" aria-hidden="true" /> {task.link.label}</Link> : null}
          <div>
            <span className="gc-label">Checklist {cl.length ? `· ${cl.filter((c) => c.done).length} of ${cl.length}` : ''}</span>
            <div className="tk-cl">{cl.map((c) => <label key={c.id}><input type="checkbox" className="gc-check" checked={c.done} onChange={() => toggleCheck(task.id, c.id)} /><span className={c.done ? 'is-done' : ''}>{c.text}</span></label>)}</div>
            <form onSubmit={addStep} style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 6 }}><input className="gc-input" aria-label="New step" placeholder="Add a step" value={step} onChange={(e) => setStep(e.target.value)} /><button type="submit" className="gc-btn gc-btn--neutral">Add</button></form>
          </div>
          <div>
            <span className="gc-label">Comments</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {(task.comments || []).map((c, i) => <div key={i} className="tk-cmt"><UserAvatar id={c.by} size={28} /><div><span className="tm-strong">{userName(c.by)}</span> <span className="tm-sub" style={{ display: 'inline' }}>{formatDate(c.at)}</span><p>{c.text}</p></div></div>)}
            </div>
            <form onSubmit={send} style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}><input className="gc-input" aria-label="Comment" placeholder="Write a comment" value={note} onChange={(e) => setNote(e.target.value)} /><button type="submit" className="gc-btn gc-btn--neutral">Send</button></form>
          </div>
          <span className="tm-sub">Given by {userName(task.by)} on {formatDate(task.at)}{task.doneAt ? ` · done ${formatDate(task.doneAt)}` : ''}</span>
        </div>
      )}
    </Dialog>
  );
}
