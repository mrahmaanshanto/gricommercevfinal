'use client';
// Merchant app · Tasks (/m-tasks). The web's Tasks page (src/screens/team/Tasks.jsx) as a phone list.
//   views    My tasks (lib/tasks.js › isMine: assigned to me, or a team task nobody took yet) · Team (my teams' open
//            tasks) · Overdue (mine and my teams') · Done (latest first) — chips with counts
//   list     grouped by when it is due (Overdue, Today, This week, Later, No date); the tick marks a task done
//            (setStatus: a repeating task makes the next one) or opens it again; a row opens /m-task?id=
//   quick add  a title → a task for me, due today, in my first team (saveTask)
//   New task   the + button: title, notes, due, priority, team and people (taskParts.NewTaskSheet)
//   Team chat  links to the web's Team chat (/team-chat) with my unread count (lib/teamChat.js › unreadTotal)

import React, { useMemo, useState } from 'react';
import {
  AppScreen, Content, LargeHeader, TabBar, Fab, Card, Section, Chips, IconButton, EmptyState, Skeleton, Icon,
  useAppData, toast,
} from '../kit/AppKit';
import { getTasks, getTeams, teamsOf, isMine, dueState, saveTask, TASKS_EVENT } from '@/lib/tasks';
import { unreadTotal, CHAT_EVENT } from '@/lib/teamChat';
import { TaskRow, NewTaskSheet, TASK_CSS, todayKey } from './taskParts';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const GROUPS = [['overdue', 'Overdue'], ['today', 'Today'], ['week', 'This week'], ['later', 'Later'], ['none', 'No date']];
const PRI = { urgent: 0, high: 1, normal: 2, low: 3 };

const CSS = TASK_CSS + `
[data-screen="MTasks"] .chips{overflow-x:auto;scrollbar-width:none}
[data-screen="MTasks"] .chips::-webkit-scrollbar{display:none}
[data-screen="MTasks"] .qa{display:flex;align-items:center;gap:10px;margin:14px 20px 0;padding:0 6px 0 16px;height:52px}
[data-screen="MTasks"] .qa input{flex:1;min-width:0;height:100%;border:0;outline:0;background:transparent;font:inherit;font-size:var(--text-sm-plus);color:var(--ink)}
[data-screen="MTasks"] .qa input::placeholder{color:var(--muted)}
[data-screen="MTasks"] .qa:focus-within{box-shadow:0 0 0 3px rgba(0,48,135,.12),0 1px 2px rgba(15,23,42,.04)}
[data-screen="MTasks"] .qa .go{flex:none;width:40px;height:40px;border:0;border-radius:var(--radius-lg);background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer}
[data-screen="MTasks"] .qa .go:disabled{background:var(--soft);color:var(--muted);cursor:default}
`;

export default function MTasksScreen() {
  const { ready, tick, ctx } = useAppData([TASKS_EVENT, CHAT_EVENT]);
  const me = ctx ? ctx.user : null;
  const [view, setView] = useState('mine');
  const [quick, setQuick] = useState('');
  const [adding, setAdding] = useState(false);
  const today = ready ? todayKey() : '';

  const data = useMemo(() => {
    if (!ready || !me) return null;
    const tasks = safe(() => getTasks(), []);
    const teams = safe(() => getTeams(), []);
    const mine = teamsOf(me.id, teams).map((t) => t.id);
    const isM = (t) => isMine(t, me.id, teams);
    const inTeams = (t) => mine.includes(t.team);
    const open = tasks.filter((t) => t.status !== 'done');
    const lists = {
      mine: open.filter(isM),
      team: open.filter(inTeams),
      overdue: open.filter((t) => (isM(t) || inTeams(t)) && dueState(t, today) === 'overdue'),
      done: tasks.filter((t) => t.status === 'done' && (isM(t) || inTeams(t))).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0)),
    };
    return { lists, unread: safe(() => unreadTotal(me), 0), firstTeam: mine[0] || 'mgmt' };
  }, [ready, tick, me, today]);

  const list = data ? data.lists[view] : [];
  const sorted = [...list].sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999') || (PRI[a.priority] ?? 2) - (PRI[b.priority] ?? 2));
  const groups = view === 'done' || view === 'overdue' ? [[view, null, view === 'done' ? list : sorted]]
    : GROUPS.map(([k, l]) => [k, l, sorted.filter((t) => dueState(t, today) === k)]).filter(([, , a]) => a.length);
  const counts = data ? data.lists : {};

  const add = (e) => {
    e.preventDefault();
    if (!quick.trim() || !me) return;
    saveTask({ title: quick.trim(), assignees: [me.id], by: me.id, due: today, team: data.firstTeam, priority: 'normal', status: 'todo' }, me.id);
    setQuick('');
    toast('Task added to your list, due today.');
  };

  return (
    <AppScreen name="MTasks" title="Tasks" css={CSS}>
      <Content top={47} bottom={0}>
        <LargeHeader title="Tasks" eyebrow={data ? `${counts.mine.length} open · ${counts.overdue.length} overdue` : ' '}
          actions={<IconButton icon="chat" label="Team chat" href="/team-chat" soft badge={data ? data.unread : 0} />} />
        <form className="card qa" onSubmit={add}>
          <Icon name="plus" size={20} />
          <input value={quick} onChange={(e) => setQuick(e.target.value)} placeholder="Add a task for today" aria-label="Add a task for today" enterKeyHint="done" />
          <button type="submit" className="go" aria-label="Add" disabled={!quick.trim() || !me}><Icon name="check" size={20} stroke={2.2} /></button>
        </form>
        <Chips style={{ marginTop: '14px' }} value={view} onChange={setView}
          items={[['mine', 'My tasks'], ['team', 'Team'], ['overdue', 'Overdue'], ['done', 'Done']].map(([k, l]) => ({ key: k, label: l, n: data && k !== 'done' ? counts[k].length : undefined }))} />

        {!data ? <div style={{ marginTop: '18px' }}><Skeleton rows={5} /></div> : list.length ? groups.map(([k, l, items]) => (
          <Section key={k} title={l || (view === 'done' ? 'Done' : 'Overdue')} action={<span style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{items.length}</span>}>
            <Card>{items.slice(0, view === 'done' ? 30 : 60).map((t) => <TaskRow key={t.id} t={t} me={me.id} showPeople={view !== 'mine'} today={today} />)}</Card>
          </Section>
        )) : (
          <div style={{ marginTop: '18px' }}>
            <Card><EmptyState icon="tasks" title={view === 'overdue' ? 'Nothing overdue.' : view === 'done' ? 'Nothing done yet.' : 'No open tasks.'} action={view === 'done' || view === 'overdue' ? null : { label: 'New task', onClick: () => setAdding(true) }} /></Card>
          </div>
        )}

        {data ? (
          <Section title="Team chat">
            <Card href="/team-chat" pad={false}>
              <div className="row">
                <span className="ico"><Icon name="chat" /></span>
                <span className="m"><span className="t" style={{ display: 'block' }}>Team chat</span><span className="s" style={{ display: 'block' }}>Channels and messages · opens the web panel</span></span>
                {data.unread ? <span className="cnt">{data.unread}</span> : null}
              </div>
            </Card>
          </Section>
        ) : null}
        <div style={{ height: '8px' }} />
      </Content>
      <Fab onClick={() => setAdding(true)} label="New task" />
      <TabBar />
      {me ? <NewTaskSheet open={adding} onClose={() => setAdding(false)} me={me} /> : null}
    </AppScreen>
  );
}
