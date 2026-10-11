'use client';
// taskParts — what the app's task screens (/m-tasks, /m-task) share: people's faces, due text, the list row with its
// tick, and the New task sheet. Data: src/lib/tasks.js (the web's Tasks page reads and writes the same list).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, Sheet, Button, Field, TextInput, Segmented, Pill, Icon, toast } from '../kit/AppKit';
import { USERS, userBy } from '@/lib/team';
import { saveTask, setStatus, teamBy, teamsOf, getTeams, priorityOf, statusLabel, statusTone, dueState, dayKeyOf } from '@/lib/tasks';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FACE = [['#e0f3fb', '#003087'], ['#e7f7f0', '#0b5c40'], ['#fff4e0', '#7a3e05'], ['#eef3fa', '#1e3a6e'], ['#ffece5', '#8a3510'], ['#f1ecfb', '#5b3a99']];
/** design tones (lib/tasks.js) → board pill tones */
export const TONE = { slate: 'grey', info: 'nav', warning: 'warn', error: 'err', success: 'ok', primary: 'nav', secondary: 'nav' };

export const todayKey = () => dayKeyOf(Date.now());
export const firstOf = (id) => String((userBy(id) || { name: id || '' }).name).split(' ')[0];
export const nameOf = (id) => (userBy(id) || { name: id || '—' }).name;
/** '12 Oct', 'Today', 'Tomorrow' from a 'YYYY-MM-DD' key. */
export function dueText(key, today = todayKey()) {
  if (!key) return 'No date';
  if (key === today) return 'Today';
  const d = new Date(key + 'T00:00:00');
  const t = new Date(today + 'T00:00:00');
  const diff = Math.round((d - t) / 864e5);
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return `${d.getDate()} ${MON[d.getMonth()]}`;
}

/** A person's initials in their colour. */
export function Face({ id, size = 32 }) {
  const u = userBy(id);
  const i = Math.max(0, USERS.findIndex((x) => x.id === id));
  const [bg, fg] = FACE[i % FACE.length];
  return <Avatar text={u ? u.initials : '?'} size={size} tone={{ bg, fg }} round />;
}
export function Faces({ ids, size = 28 }) {
  const list = ids || [];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {list.slice(0, 3).map((id, i) => <span key={id} style={{ marginLeft: i ? '-8px' : 0, borderRadius: 'var(--radius-full)', boxShadow: '0 0 0 2px var(--card)', display: 'inline-flex' }}><Face id={id} size={size} /></span>)}
      {list.length > 3 ? <span style={{ marginLeft: '4px', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>+{list.length - 3}</span> : null}
    </span>
  );
}

export const TASK_CSS = `
.tk-row{display:flex;align-items:center;gap:12px;min-height:64px;padding:10px 16px 10px 12px}
.tk-row + .tk-row{border-top:1px solid var(--line)}
.tk-row .m{flex:1;min-width:0;color:inherit}
.tk-row .t{display:block;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);line-height:20px;color:var(--ink)}
.tk-row.done .t{color:var(--muted);text-decoration:line-through}
.tk-row .s{display:block;font-size:var(--text-xs-plus);color:var(--muted);line-height:18px}
.tk-row .s .late{color:var(--err);font-weight:var(--weight-medium)}
.tk-row .s .now{color:var(--warn);font-weight:var(--weight-medium)}
.tk-tick{flex:none;width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;padding:0;border:0;border-radius:var(--radius-full);background:none;color:var(--muted);cursor:pointer}
.tk-tick span{width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border:2px solid #cbd5e1;border-radius:var(--radius-full)}
.tk-tick.on span{background:var(--ok);border-color:var(--ok);color:#fff}
.tk-tick:focus-visible{outline:2px solid var(--brand);outline-offset:1px}
.ph .wrap{display:flex;flex-wrap:wrap;gap:8px}
.ph .chip{cursor:pointer}

.ph .two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
`;

/** One task in a list: the tick, title, due · team · people, and a pill when it matters. */
export function TaskRow({ t, me, showPeople, today = todayKey() }) {
  const ds = dueState(t, today);
  const done = t.status === 'done';
  const tick = (e) => {
    e.preventDefault();
    const made = setStatus(t.id, done ? 'todo' : 'done', me);
    toast(done ? `“${t.title}” is open again.` : made ? `Done. Next one is on ${dueText(made.due, today)}.` : 'Done. Nice work.');
  };
  const pri = priorityOf(t.priority);
  const team = teamBy(t.team);
  const pill = done ? null : t.status === 'blocked' || t.status === 'review' || t.status === 'doing' ? { tone: TONE[statusTone(t.status)], text: statusLabel(t.status) }
    : t.priority === 'urgent' || t.priority === 'high' ? { tone: TONE[pri[2]], text: pri[1] } : null;
  return (
    <div className={'tk-row' + (done ? ' done' : '')}>
      <button type="button" className={'tk-tick' + (done ? ' on' : '')} aria-pressed={done} aria-label={done ? `Open “${t.title}” again` : `Mark “${t.title}” done`} onClick={tick}>
        <span>{done ? <Icon name="check" size={14} stroke={3} /> : null}</span>
      </button>
      <Link href={`/m-task?id=${encodeURIComponent(t.id)}`} className="m">
        <span className="t ell">{t.title}</span>
        <span className="s ell">
          <span className={ds === 'overdue' ? 'late' : ds === 'today' ? 'now' : ''}>{done ? `Done${t.doneAt ? ' ' + dueText(dayKeyOf(t.doneAt), today).toLowerCase() : ''}` : dueText(t.due, today)}{ds === 'overdue' ? ' · late' : ''}</span>
          {team ? ` · ${team.name}` : ''}
          {showPeople && (t.assignees || []).length ? ` · ${(t.assignees || []).map(firstOf).join(', ')}` : ''}
          {(t.checklist || []).length ? ` · ${(t.checklist || []).filter((c) => c.done).length}/${t.checklist.length}` : ''}
        </span>
      </Link>
      {pill ? <Pill tone={pill.tone}>{pill.text}</Pill> : null}
    </div>
  );
}

/** New task: title, notes, due, priority, team and who does it. */
export function NewTaskSheet({ open, onClose, me, onMade }) {
  const today = todayKey();
  const blank = () => ({ title: '', notes: '', due: today, priority: 'normal', team: ((teamsOf(me.id)[0]) || { id: 'mgmt' }).id, assignees: [me.id] });
  const [f, setF] = useState(blank);
  useEffect(() => { if (open) setF(blank()); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!open) return null;
  const teams = getTeams();
  const team = teamBy(f.team, teams);
  const people = [...new Set([me.id, ...((team && team.members) || [])])];
  const togglePerson = (id) => setF({ ...f, assignees: f.assignees.includes(id) ? f.assignees.filter((x) => x !== id) : [...f.assignees, id] });
  const add = () => {
    if (!f.title.trim()) { toast('Give the task a title', { tone: 'error' }); return; }
    const row = saveTask({ ...f, title: f.title.trim(), notes: f.notes.trim(), by: me.id, status: 'todo' }, me.id);
    toast(row.assignees.length && !row.assignees.includes(me.id) ? `Task given to ${row.assignees.map(firstOf).join(', ')}.` : row.assignees.length ? 'Task added to your list.' : `Task added to ${team ? team.name : 'the team'} for anyone to take.`);
    onClose();
    if (onMade) onMade(row);
  };
  return (
    <Sheet open title="New task" onClose={onClose} footer={<><Button kind="line" onClick={onClose}>Cancel</Button><Button onClick={add} style={{ flex: 2 }}>Add task</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Field label="Title"><TextInput value={f.title} onChange={(v) => setF({ ...f, title: v })} placeholder="What needs doing?" autoFocus /></Field>
        <Field label="Notes (optional)"><TextInput multiline value={f.notes} onChange={(v) => setF({ ...f, notes: v })} /></Field>
        <div className="two">
          <Field label="Due"><TextInput type="date" value={f.due} onChange={(v) => setF({ ...f, due: v })} /></Field>
          <div className="field"><span className="lab">Priority</span>
            <Segmented style={{ margin: 0 }} value={f.priority} onChange={(v) => setF({ ...f, priority: v })} items={[{ key: 'normal', label: 'Normal' }, { key: 'high', label: 'High' }, { key: 'urgent', label: 'Urgent' }]} />
          </div>
        </div>
        <div className="field"><span className="lab">Team</span>
          <div className="wrap">{teams.map((tm) => <button key={tm.id} type="button" className={'chip' + (f.team === tm.id ? ' on' : '')} aria-pressed={f.team === tm.id} onClick={() => setF({ ...f, team: tm.id })}>{tm.name}</button>)}</div>
        </div>
        <div className="field"><span className="lab">Who does it</span>
          <div className="wrap">
            {people.map((id) => <button key={id} type="button" className={'chip' + (f.assignees.includes(id) ? ' on' : '')} aria-pressed={f.assignees.includes(id)} onClick={() => togglePerson(id)}>{id === me.id ? 'Me' : firstOf(id)}</button>)}
          </div>
          <span className="help">{f.assignees.length ? `${f.assignees.length} ${f.assignees.length === 1 ? 'person' : 'people'}` : 'Nobody yet: anyone in the team can take it.'}</span>
        </div>
      </div>
    </Sheet>
  );
}
