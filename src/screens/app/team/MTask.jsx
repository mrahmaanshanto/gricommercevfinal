'use client';
// Merchant app · Task (/m-task?id=TK-101). One task from src/lib/tasks.js, as the web's task drawer on a phone:
//   title, type, team and tags; status chips (setStatus — done on a repeating task makes the next one)
//   facts: who does it (sheet: the team's people), due (sheet: date), priority (sheet), repeats, asked by, waits for
//   notes; checklist (toggleCheck, add an item); time (logged of the estimate, + 15 min / 30 min / 1 h: saveTask
//   logged — goes in the history); the page it is about (the web link); comments (addComment); recent activity
// Action bar: Start (to do → in progress) and Mark done / Open again. More: delete (confirmDialog), open on the web.

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppScreen, AppBar, Content, ActionBar, Sheet, Card, Section, ListRow, Pill, Button, Field, TextInput, IconButton,
  EmptyState, Skeleton, Icon, useAppData, useQuery, toast, confirmDialog, ago,
} from '../kit/AppKit';
import {
  getTasks, saveTask, setStatus, toggleCheck, addComment, removeTask, teamBy, tagBy, getTeams, STATUSES, PRIORITIES,
  TYPES, priorityOf, statusLabel, openBlockers, dueState, TASKS_EVENT,
} from '@/lib/tasks';
import { Face, Faces, firstOf, nameOf, dueText, todayKey, TASK_CSS, TONE } from './taskParts';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const REPEAT = { daily: 'Every day', weekly: 'Every week', monthly: 'Every month' };

const CSS = TASK_CSS + `
[data-screen="MTask"] .head{padding:4px 20px 0}
[data-screen="MTask"] .head h2{margin:0;font-size:var(--text-xl);line-height:28px;font-weight:var(--weight-semibold);letter-spacing:var(--tracking-tight)}
[data-screen="MTask"] .head .meta{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:8px;font-size:var(--text-xs-plus);color:var(--muted)}
[data-screen="MTask"] .sts{display:flex;flex-wrap:wrap;gap:8px;padding:0 20px}
[data-screen="MTask"] .notes{margin:0;padding:14px 16px;font-size:var(--text-sm);line-height:21px;white-space:pre-line;color:var(--body)}
[data-screen="MTask"] .ck{display:flex;align-items:center;gap:10px;min-height:48px;padding:4px 16px 4px 8px;border-top:1px solid var(--line);font-size:var(--text-sm)}
[data-screen="MTask"] .ck:first-child{border-top:0}
[data-screen="MTask"] .ck.on .tx{color:var(--muted);text-decoration:line-through}
[data-screen="MTask"] .ck .tx{flex:1;min-width:0}
[data-screen="MTask"] .addck{display:flex;align-items:center;gap:8px;padding:8px 8px 8px 16px;border-top:1px solid var(--line)}
[data-screen="MTask"] .addck input{flex:1;min-width:0;height:36px;border:0;outline:0;background:transparent;font:inherit;font-size:var(--text-sm);color:var(--ink)}
[data-screen="MTask"] .addck input::placeholder{color:var(--muted)}
[data-screen="MTask"] .time{padding:14px 16px}
[data-screen="MTask"] .time .btns{display:flex;gap:8px;margin-top:12px}
[data-screen="MTask"] .time .btns .btn{flex:1;height:36px;padding:0 8px}
[data-screen="MTask"] .cm{display:flex;gap:10px;padding:12px 16px;border-top:1px solid var(--line)}
[data-screen="MTask"] .cm:first-child{border-top:0}
[data-screen="MTask"] .cm b{font-size:var(--text-sm);font-weight:var(--weight-semibold)}
[data-screen="MTask"] .cm small{margin-left:6px;font-size:var(--text-xs);color:var(--muted)}
[data-screen="MTask"] .cm p{margin:2px 0 0;font-size:var(--text-sm);line-height:20px;white-space:pre-line;color:var(--body)}
[data-screen="MTask"] .say{display:flex;align-items:flex-end;gap:8px;padding:10px 10px 10px 16px;border-top:1px solid var(--line)}
[data-screen="MTask"] .say textarea{flex:1;min-width:0;min-height:36px;max-height:120px;padding:8px 0;border:0;outline:0;resize:none;background:transparent;font:inherit;font-size:var(--text-sm);line-height:20px;color:var(--ink)}
[data-screen="MTask"] .say textarea::placeholder{color:var(--muted)}
[data-screen="MTask"] .send{flex:none;width:40px;height:40px;border:0;border-radius:var(--radius-lg);background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer}
[data-screen="MTask"] .send:disabled{background:var(--soft);color:var(--muted);cursor:default}
[data-screen="MTask"] .hist{padding:4px 16px 8px}
[data-screen="MTask"] .hist div{display:flex;justify-content:space-between;gap:12px;padding:6px 0;font-size:var(--text-xs-plus);color:var(--body)}
[data-screen="MTask"] .hist span:last-child{flex:none;color:var(--muted)}
`;

export default function MTaskScreen() {
  const router = useRouter();
  const { ready, tick, ctx } = useAppData([TASKS_EVENT]);
  const q = useQuery();
  const id = q ? q.get('id') : null;
  const me = ctx ? ctx.user : null;
  const t = useMemo(() => (ready && id ? safe(() => getTasks().find((x) => x.id === id), null) : null), [ready, tick, id]);
  const all = useMemo(() => (ready ? safe(() => getTasks(), []) : []), [ready, tick]);
  const [edit, setEdit] = useState('');       // 'who' | 'due' | 'priority' | 'more' | 'text'
  const [item, setItem] = useState('');
  const [say, setSay] = useState('');
  const today = ready ? todayKey() : '';
  const by = me ? me.id : '';

  if (!ready || !q) return <Frame title="Task"><div style={{ marginTop: '8px' }}><Skeleton rows={4} /></div></Frame>;
  if (!t) return <Frame title="Task"><Card style={{ marginTop: '8px' }}><EmptyState icon="tasks" title="This task is not here any more." action={{ label: 'All tasks', href: '/m-tasks' }} /></Card></Frame>;

  const team = teamBy(t.team);
  const done = t.status === 'done';
  const ds = dueState(t, today);
  const blockers = openBlockers(t, all);
  const checklist = t.checklist || [];
  const ckDone = checklist.filter((c) => c.done).length;
  const est = Number(t.estimate) || 0;
  const logged = Number(t.logged) || 0;
  const pri = priorityOf(t.priority);
  const type = TYPES[t.type] || TYPES.task;

  const status = (s) => {
    if (s === t.status) return;
    const made = setStatus(t.id, s, by);
    toast(s === 'done' ? (made ? `Done. Next one is on ${dueText(made.due, today)}.` : 'Done. Nice work.') : `Status: ${statusLabel(s)}.`);
  };
  const addItem = (e) => {
    e.preventDefault();
    if (!item.trim()) return;
    saveTask({ id: t.id, checklist: [...checklist, { id: 'c' + Date.now().toString(36), text: item.trim(), done: false }] });
    setItem('');
  };
  const log = (h) => { saveTask({ id: t.id, logged: Math.round((logged + h) * 100) / 100 }, by); toast(`${h >= 1 ? h + ' h' : Math.round(h * 60) + ' min'} logged.`); };
  const send = (e) => { e.preventDefault(); if (!say.trim()) return; addComment(t.id, by, say); setSay(''); };
  const del = async () => {
    setEdit('');
    if (!(await confirmDialog({ title: 'Delete this task?', body: 'It goes for good, with its comments.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    removeTask(t.id); toast('Task deleted.'); router.push('/m-tasks');
  };
  const take = () => { saveTask({ id: t.id, assignees: [...(t.assignees || []), by] }, by); toast('It’s on your list now.'); };

  return (
    <Frame title={t.id} actions={<IconButton icon="dots" label="More" onClick={() => setEdit('more')} />}
      bar={done ? <Button kind="soft" icon="undo" onClick={() => status('todo')}>Open again</Button>
        : <>{t.status === 'todo' ? <Button kind="line" onClick={() => status('doing')}>Start</Button> : null}<Button icon="check" onClick={() => status('done')} style={{ flex: 2 }}>Mark done</Button></>}
      sheets={<EditSheets t={t} me={me} edit={edit} setEdit={setEdit} onDelete={del} />}>
      <div className="head">
        <h2>{t.title}</h2>
        <div className="meta">
          <span>{type[0]}{t.itCat ? ` · ${t.itCat}` : ''}{team ? ` · ${team.name}` : ''}</span>
          {(t.tags || []).map((g) => { const tg = tagBy(g); return tg ? <Pill key={g} tone={TONE[tg.tone] || 'grey'}>#{tg.name}</Pill> : null; })}
        </div>
      </div>

      <Section title="Status" />
      <div className="sts" role="radiogroup" aria-label="Status">
        {STATUSES.map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={t.status === k} className={'chip' + (t.status === k ? ' on' : '')} onClick={() => status(k)}>{l}</button>)}
      </div>

      <Section title="Details" />
      <Card>
        <ListRow onClick={() => setEdit('who')} avatar={(t.assignees || []).length ? <span style={{ width: '44px', display: 'flex', justifyContent: 'center' }}><Faces ids={t.assignees} size={30} /></span> : null} icon="user"
          title={(t.assignees || []).length ? (t.assignees || []).map((x) => (me && x === me.id ? 'Me' : nameOf(x))).join(', ') : 'Nobody yet'} sub="Who does it" />
        <ListRow onClick={() => setEdit('due')} icon="calendar" title={<span style={{ color: ds === 'overdue' ? 'var(--err)' : undefined }}>{t.due ? dueText(t.due, today) : 'No date'}{ds === 'overdue' ? ' · late' : ''}</span>} sub={`Due${t.repeat ? ' · ' + REPEAT[t.repeat] : ''}`} />
        <ListRow onClick={() => setEdit('priority')} icon="alert" title={pri[1]} sub="Priority" pill={t.priority === 'urgent' || t.priority === 'high' ? { tone: TONE[pri[2]], text: pri[1] } : null} />
        <ListRow icon="users" title={nameOf(t.by)} sub={`Asked ${ago(t.at)}${(t.watchers || []).length ? ` · ${t.watchers.length} watching` : ''}`} chevron={false} />
        {blockers.length ? <ListRow href={`/m-task?id=${encodeURIComponent(blockers[0].id)}`} icon="clock" title={blockers.map((b) => b.title).join(', ')} sub={`Waits for ${blockers.length === 1 ? 'this task' : `${blockers.length} tasks`}`} /> : null}
        {t.link && t.link.href ? <ListRow href={t.link.href} icon="globe" title={t.link.label || t.link.href} sub="Open on the web" /> : null}
      </Card>
      {!done && !(t.assignees || []).length && me ? <div style={{ margin: '10px 20px 0' }}><Button kind="soft" onClick={take} style={{ width: '100%' }}>Take it</Button></div> : null}

      {t.notes ? (<><Section title="Notes" action={{ label: 'Edit', onClick: () => setEdit('text') }} /><Card><p className="notes">{t.notes}</p></Card></>) : null}

      <Section title="Checklist" action={checklist.length ? <span style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{ckDone} of {checklist.length}</span> : null} />
      <Card>
        {checklist.map((c) => (
          <div key={c.id} className={'ck' + (c.done ? ' on' : '')}>
            <button type="button" className={'tk-tick' + (c.done ? ' on' : '')} aria-pressed={c.done} aria-label={c.text} onClick={() => toggleCheck(t.id, c.id)}><span>{c.done ? <Icon name="check" size={14} stroke={3} /> : null}</span></button>
            <span className="tx">{c.text}</span>
          </div>
        ))}
        <form className="addck" onSubmit={addItem} style={checklist.length ? undefined : { borderTop: 0 }}>
          <input value={item} onChange={(e) => setItem(e.target.value)} placeholder="Add an item" aria-label="Add a checklist item" />
          <button type="submit" className="ib" aria-label="Add item" disabled={!item.trim()}><Icon name="plus" size={20} /></button>
        </form>
      </Card>

      <Section title="Time" />
      <Card>
        <div className="time">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 'var(--text-sm)' }}><b className="num" style={{ fontSize: 'var(--text-lg)' }}>{logged} h</b> logged</span>
            <span className="help">{est ? `of ${est} h planned` : 'No estimate'}</span>
          </div>
          {est ? <div className="bar" style={{ marginTop: '10px' }}><i style={{ width: Math.min(100, Math.round((logged / est) * 100)) + '%', background: logged > est ? 'var(--err)' : 'var(--brand)' }} /></div> : null}
          <div className="btns">
            <Button kind="soft" onClick={() => log(0.25)}>+15 min</Button>
            <Button kind="soft" onClick={() => log(0.5)}>+30 min</Button>
            <Button kind="soft" onClick={() => log(1)}>+1 h</Button>
          </div>
        </div>
      </Card>

      <Section title="Comments" action={(t.comments || []).length ? <span style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{t.comments.length}</span> : null} />
      <Card>
        {(t.comments || []).map((c, i) => (
          <div key={i} className="cm">
            <Face id={c.by} size={32} />
            <div style={{ minWidth: 0 }}><b>{me && c.by === me.id ? 'You' : nameOf(c.by)}</b><small>{ago(c.at)}</small><p>{c.text}</p></div>
          </div>
        ))}
        <form className="say" onSubmit={send} style={(t.comments || []).length ? undefined : { borderTop: 0 }}>
          <textarea rows={1} value={say} onChange={(e) => setSay(e.target.value)} placeholder={`Write to ${(t.assignees || []).filter((x) => !me || x !== me.id).map(firstOf).join(', ') || 'the team'}`} aria-label="Comment" />
          <button type="submit" className="send" aria-label="Send" disabled={!say.trim()}><Icon name="chev" size={20} stroke={2.2} /></button>
        </form>
      </Card>

      {(t.history || []).length ? (<>
        <Section title="Activity" />
        <Card><div className="hist">{[...t.history].reverse().slice(0, 5).map((h, i) => <div key={i}><span>{firstOf(h.by) || 'Someone'} · {h.text}</span><span>{ago(h.at)}</span></div>)}</div></Card>
      </>) : null}
      <div style={{ height: '8px' }} />
    </Frame>
  );
}

function Frame({ title, actions, bar, sheets, children }) {
  return (
    <AppScreen name="MTask" title={title} css={CSS}>
      <AppBar title={title} back="/m-tasks" actions={actions} />
      <Content top={103} bottom={bar ? 98 : 0}>{children}</Content>
      {bar ? <ActionBar>{bar}</ActionBar> : null}
      {sheets}
    </AppScreen>
  );
}

/** Who / due / priority / title and notes / more. */
function EditSheets({ t, me, edit, setEdit, onDelete }) {
  const [due, setDue] = useState(t.due || '');
  const [who, setWho] = useState(t.assignees || []);
  const [text, setText] = useState({ title: t.title, notes: t.notes || '' });
  const by = me ? me.id : '';
  const team = teamBy(t.team, getTeams());
  const people = [...new Set([...(me ? [me.id] : []), ...((team && team.members) || []), ...(t.assignees || [])])];
  const close = () => setEdit('');
  React.useEffect(() => { setDue(t.due || ''); setWho(t.assignees || []); setText({ title: t.title, notes: t.notes || '' }); }, [edit]); // eslint-disable-line react-hooks/exhaustive-deps
  if (edit === 'who') {
    return (
      <Sheet open title="Who does it" onClose={close}
        footer={<><Button kind="line" onClick={close}>Cancel</Button><Button style={{ flex: 2 }} onClick={() => { saveTask({ id: t.id, assignees: who }, by); toast(who.length ? `Given to ${who.map(firstOf).join(', ')}.` : 'Left for anyone in the team.'); close(); }}>Save</Button></>}>
        <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
          {people.map((id) => {
            const on = who.includes(id);
            return <ListRow key={id} onClick={() => setWho(on ? who.filter((x) => x !== id) : [...who, id])} avatar={<Face id={id} size={36} />} title={me && id === me.id ? `${nameOf(id)} (me)` : nameOf(id)} end={on ? <span style={{ color: 'var(--brand)', display: 'flex' }}><Icon name="check" size={20} stroke={2.4} /></span> : null} chevron={false} compact />;
          })}
        </div>
        <p className="help" style={{ margin: '10px 0 0' }}>{team ? `People in ${team.name}.` : ''} With nobody, anyone in the team can take it.</p>
      </Sheet>
    );
  }
  if (edit === 'due') {
    return (
      <Sheet open title="Due" onClose={close}
        footer={<><Button kind="line" onClick={() => { saveTask({ id: t.id, due: '' }, by); toast('No date now.'); close(); }}>No date</Button><Button style={{ flex: 2 }} onClick={() => { saveTask({ id: t.id, due }, by); toast(`Due ${dueText(due)}.`); close(); }}>Save</Button></>}>
        <Field label="Date"><TextInput type="date" value={due} onChange={setDue} /></Field>
        <div className="wrap" style={{ marginTop: '12px' }}>
          {[['Today', 0], ['Tomorrow', 1], ['In a week', 7]].map(([l, n]) => { const k = (() => { const d = new Date(); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })(); return <button key={l} type="button" className={'chip' + (due === k ? ' on' : '')} onClick={() => setDue(k)}>{l}</button>; })}
        </div>
      </Sheet>
    );
  }
  if (edit === 'priority') {
    return (
      <Sheet open title="Priority" onClose={close}>
        <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
          {PRIORITIES.map(([k, l, tone]) => <ListRow key={k} onClick={() => { saveTask({ id: t.id, priority: k }, by); toast(`Priority: ${l}.`); close(); }} title={l} pill={k === 'urgent' || k === 'high' ? { tone: TONE[tone], text: l } : null} end={t.priority === k ? <span style={{ color: 'var(--brand)', display: 'flex' }}><Icon name="check" size={20} stroke={2.4} /></span> : null} chevron={false} compact />)}
        </div>
      </Sheet>
    );
  }
  if (edit === 'text') {
    return (
      <Sheet open title="Edit task" onClose={close}
        footer={<><Button kind="line" onClick={close}>Cancel</Button><Button style={{ flex: 2 }} onClick={() => { if (!text.title.trim()) { toast('Give the task a title', { tone: 'error' }); return; } saveTask({ id: t.id, title: text.title.trim(), notes: text.notes.trim() }, by); toast('Saved.'); close(); }}>Save</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label="Title"><TextInput value={text.title} onChange={(v) => setText({ ...text, title: v })} /></Field>
          <Field label="Notes"><TextInput multiline value={text.notes} onChange={(v) => setText({ ...text, notes: v })} /></Field>
        </div>
      </Sheet>
    );
  }
  if (edit === 'more') {
    return (
      <Sheet open title={t.id} onClose={close}>
        <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
          <ListRow onClick={() => setEdit('text')} icon="edit" title="Edit title and notes" />
          <ListRow href={`/tasks?task=${encodeURIComponent(t.id)}`} icon="globe" title="Open on the web" sub="Tags, watchers, files and more" />
          <ListRow onClick={onDelete} icon="x" title="Delete task" />
        </div>
      </Sheet>
    );
  }
  return null;
}
