'use client';
// Tasks (/admin/tasks, Sales & CRM › Tasks) — GridCommerce staff's own work across Sales, Support, Marketing, Technical,
// Finance, Operations and HR. Reused from the merchant panel's Tasks screen (src/screens/team/Tasks.jsx), fed by
// lib/admin/tasks (never the merchant lib/tasks).
//   view tabs (open counts): Mine · Watching · Overdue · Blocked · Everyone; filters: team, person, priority; search
//   shown as: List (by due date, with bulk status / assignee / priority) · Board (status columns: drag a card, or its
//   "Move to" menu) · Calendar (by due date) · Workload (open, late, this week and hours left per person)
//   "New task" and a task's side panel (status, people, watchers, related merchant / lead / meeting / ticket, tags,
//   checklist, time, comments, history). ?task=T-2101 opens one; ?new=1 (&merchant=<id> | &meeting=<id>) starts one.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, EmptyState, StatusBadge } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField, Menu } from '@/components/ui/IndexKit';
import { useAdminStore } from '@/lib/admin/store';
import { staff as currentStaff } from '@/lib/platform/store';
import { DAY, startOfMonth, addMonths, monthLong, yearOf, dayOfMonth, dm, weekday } from '@/lib/platform/util';
import {
  tasksStore, TEAMS, STATUSES, PRIORITIES, statusOf, priorityOf, teamOf, dueState, dayKey, fromKey, people as taskPeople,
  setStatus, bulkUpdate, addPerson,
} from '@/lib/admin/tasks';
import { meetingById } from '@/lib/admin/meetings';
import { AdminShell, usePlatform } from '../AdminShell';
import { MEET_CSS, Dot, WEEK, weekStart } from './meetShared';
import { TASK_CSS, People, TeamChip, RelLink, NewTaskSheet, TaskSheet } from './taskShared';

const SCOPES = [['mine', 'Mine'], ['watching', 'Watching'], ['overdue', 'Overdue'], ['blocked', 'Blocked'], ['all', 'Everyone']];
const SHOWS = [['list', 'List'], ['board', 'Board'], ['calendar', 'Calendar'], ['load', 'Workload']];
const GROUPS = [['overdue', 'Overdue'], ['today', 'Today'], ['week', 'Next 7 days'], ['later', 'Later'], ['none', 'No due date'], ['done', 'Done']];
const PRI_COLOR = { urgent: 'var(--text-danger)', high: 'var(--warning)', normal: 'var(--primary)', low: 'var(--border-strong)' };
const dueText = (key, today) => (key === today ? 'Today' : key === dayKey(fromKey(today) + DAY) ? 'Tomorrow' : `${weekday(fromKey(key))} ${dm(fromKey(key))}`);

export default function Tasks() {
  const { db } = usePlatform();
  const { data, t, live } = useAdminStore(tasksStore);
  const me = live ? currentStaff().name : 'Mahin Khan';
  const today = dayKey(t);
  const [scope, setScope] = useState('');
  const [show, setShow] = useState('list');
  const [f, setF] = useState({ team: '', who: '', pri: '' });
  const [find, setFind] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState([]);
  const [openId, setOpenId] = useState('');
  const [draft, setDraft] = useState(null);        // preset for "New task", or null
  const [showDone, setShowDone] = useState(false);
  const [over, setOver] = useState('');
  const [month, setMonth] = useState(null);         // first day of the calendar month (ms), null = this month
  const [person, setPerson] = useState(null);       // "Add a person" form, or null

  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.get('task')) setOpenId(p.get('task'));
      if (SHOWS.some(([k]) => k === p.get('view'))) setShow(p.get('view'));
      if (SCOPES.some(([k]) => k === p.get('scope'))) setScope(p.get('scope'));
      if (p.get('new')) {
        const preset = {};
        if (p.get('merchant')) { const s = db.shops.find((x) => x.id === p.get('merchant')); if (s) preset.related = { kind: 'merchant', id: s.id, label: s.name }; }
        if (p.get('meeting')) { const m = meetingById(p.get('meeting')); if (m) preset.related = { kind: 'meeting', id: m.id, label: m.title }; }
        setDraft(preset);
      }
    } catch { /* ignore */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tasks = live ? data.tasks : [];
  const shops = useMemo(() => db.shops.slice().sort((a, b) => a.name.localeCompare(b.name)), [db]);
  const everyone = live ? taskPeople() : [];
  const scopeTest = (k, x) => {
    if (k === 'mine') return (x.assignees || []).includes(me);
    if (k === 'watching') return (x.watchers || []).includes(me) || (x.by === me && !(x.assignees || []).includes(me));
    if (k === 'overdue') return dueState(x, today) === 'overdue';
    if (k === 'blocked') return x.status === 'blocked';
    return true;
  };
  const counts = Object.fromEntries(SCOPES.map(([k]) => [k, tasks.filter((x) => x.status !== 'done' && scopeTest(k, x)).length]));
  const cur = scope || (counts.mine ? 'mine' : 'all');
  const s = q.trim().toLowerCase();
  const list = tasks.filter((x) => scopeTest(cur, x) && (!f.team || x.team === f.team) && (!f.who || (x.assignees || []).includes(f.who)) && (!f.pri || x.priority === f.pri)
    && (!s || `${x.id} ${x.title} ${x.notes} ${(x.tags || []).join(' ')} ${x.related ? x.related.label : ''}`.toLowerCase().includes(s)));
  const filtered = !!(f.team || f.who || f.pri || s);
  const task = openId ? tasks.find((x) => x.id === openId) || null : null;

  const clearAll = () => { setF({ team: '', who: '', pri: '' }); setQ(''); setFind(false); };
  const go = (k) => { setShow(k); setSel([]); try { const u = new URL(window.location.href); if (k === 'list') u.searchParams.delete('view'); else u.searchParams.set('view', k); window.history.replaceState(window.history.state, '', u.pathname + u.search); } catch { /* ignore */ } };
  const closeTask = () => { setOpenId(''); try { const u = new URL(window.location.href); if (u.searchParams.has('task')) { u.searchParams.delete('task'); window.history.replaceState(window.history.state, '', u.pathname + u.search); } } catch { /* ignore */ } };
  const pick = (id) => setSel(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]);
  const bulk = (patch, label) => { const r = bulkUpdate(sel, patch, me); toast(`${r.count} task${r.count === 1 ? '' : 's'} · ${label}`); setSel([]); };
  const toggleDone = (x) => { setStatus(x.id, x.status === 'done' ? 'todo' : 'done', me); toast(x.status === 'done' ? `${x.id} is open again` : `${x.id} done`); };
  const moveTo = (x, st) => { if (x.status === st) return; setStatus(x.id, st, me); toast(`${x.id} → ${statusOf(st).label}`); };
  const drop = (st) => (e) => { e.preventDefault(); setOver(''); const id = e.dataTransfer.getData('text/plain'); const x = tasks.find((y) => y.id === id); if (x) moveTo(x, st); };
  const savePerson = () => { const r = addPerson(person.name, person.team); if (!r.ok) { setPerson({ ...person, err: r.error }); return; } toast(`${r.name} can now get tasks`); setPerson(null); };

  // ---- list ---------------------------------------------------------------------------------------------------------
  const Row = ({ x }) => {
    const ds = dueState(x, today);
    const cl = x.checklist || [];
    const on = sel.includes(x.id);
    return (
      <div className={'tk-row' + (x.status === 'done' ? ' is-done' : '') + (on ? ' is-sel' : '')} role="button" tabIndex={0} onClick={() => setOpenId(x.id)} onKeyDown={(e) => { if (e.key === 'Enter') setOpenId(x.id); }} aria-label={`${x.id} ${x.title}`}>
        <input type="checkbox" checked={on} onClick={(e) => e.stopPropagation()} onChange={() => pick(x.id)} aria-label={`Select ${x.title}`} />
        <button type="button" className="tk-check" aria-pressed={x.status === 'done'} aria-label={x.status === 'done' ? `Open ${x.title} again` : `Mark ${x.title} done`} onClick={(e) => { e.stopPropagation(); toggleDone(x); }}>{x.status === 'done' ? <Icon name="check" width="14" height="14" aria-hidden="true" /> : null}</button>
        <div className="tk-main">
          <span className="tk-title">{x.title}</span>
          <div className="tk-meta">
            {x.due ? <span className={ds === 'overdue' ? 'tk-due--overdue' : ds === 'today' ? 'tk-due--today' : ''}><Icon name="calendar" width="12" height="12" aria-hidden="true" />{dueText(x.due, today)}{ds === 'overdue' ? ' · late' : ''}</span> : null}
            <TeamChip id={x.team} />
            {x.status === 'doing' || x.status === 'blocked' ? <StatusBadge tone={statusOf(x.status).tone}>{statusOf(x.status).label}</StatusBadge> : null}
            {x.priority === 'urgent' || x.priority === 'high' ? <StatusBadge tone={priorityOf(x.priority).tone}>{priorityOf(x.priority).label}</StatusBadge> : null}
            {x.related ? <RelLink rel={x.related} /> : null}
            {(x.tags || []).slice(0, 2).map((g) => <span key={g} className="tk-tag">#{g}</span>)}
            {cl.length ? <span><Icon name="list-checks" width="12" height="12" aria-hidden="true" />{cl.filter((c) => c.done).length}/{cl.length}</span> : null}
            {(x.comments || []).length ? <span><Icon name="message-square" width="12" height="12" aria-hidden="true" />{x.comments.length}</span> : null}
            {x.estimate ? <span><Icon name="timer" width="12" height="12" aria-hidden="true" />{x.logged || 0}/{x.estimate} h</span> : null}
          </div>
        </div>
        {(x.assignees || []).length ? <People names={x.assignees} /> : <span className="gc-badge gc-badge--slate">Open</span>}
      </div>
    );
  };
  const listBody = GROUPS.map(([g, label]) => {
    const rows = list.filter((x) => dueState(x, today) === g).sort((a, b) => (a.due || '9').localeCompare(b.due || '9') || PRIORITIES.findIndex((p) => p.id === a.priority) - PRIORITIES.findIndex((p) => p.id === b.priority));
    if (!rows.length) return null;
    if (g === 'done') {
      return (
        <div key={g} className="tk-group">
          <h3><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" style={{ marginLeft: -10 }} onClick={() => setShowDone(!showDone)} aria-expanded={showDone}><Icon name={showDone ? 'chevron-down' : 'chevron-right'} width="16" height="16" aria-hidden="true" />Done · {rows.length}</button></h3>
          {showDone ? rows.map((x) => <Row key={x.id} x={x} />) : null}
        </div>
      );
    }
    const all = rows.every((r) => sel.includes(r.id));
    return (
      <div key={g} className="tk-group">
        <h3 className={g === 'overdue' ? 'is-over' : ''}>{label} <span className="ix-tab__n">{rows.length}</span>
          <input type="checkbox" aria-label={`Select all: ${label}`} checked={all} onChange={(e) => setSel(e.target.checked ? [...new Set([...sel, ...rows.map((r) => r.id)])] : sel.filter((id) => !rows.some((r) => r.id === id)))} /></h3>
        {rows.map((x) => <Row key={x.id} x={x} />)}
      </div>
    );
  });

  // ---- board --------------------------------------------------------------------------------------------------------
  const boardBody = (
    <div className="tk-board">
      {STATUSES.map((st) => {
        const items = list.filter((x) => x.status === st.id);
        return (
          <div key={st.id} className={'tk-col' + (over === st.id ? ' is-over' : '')} onDragOver={(e) => { e.preventDefault(); setOver(st.id); }} onDragLeave={() => setOver('')} onDrop={drop(st.id)} aria-label={`${st.label}, ${items.length}`}>
            <header><StatusBadge tone={st.tone}>{st.label}</StatusBadge><span className="gc-badge gc-badge--slate">{items.length}</span></header>
            {items.map((x) => {
              const cl = x.checklist || [];
              const ds = dueState(x, today);
              return (
                <div key={x.id} className="tk-card" draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', x.id)}>
                  <div className="tk-card__top">
                    <button type="button" className="tk-card__title" onClick={() => setOpenId(x.id)}>{x.title}</button>
                    <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={STATUSES.filter((o) => o.id !== x.status).map((o) => ({ label: `Move to ${o.label}`, onClick: () => moveTo(x, o.id) }))} />
                  </div>
                  <span className="tk-meta" style={{ marginTop: 0 }}>
                    {x.due ? <span className={ds === 'overdue' ? 'tk-due--overdue' : ds === 'today' ? 'tk-due--today' : ''}>{dueText(x.due, today)}</span> : null}
                    <TeamChip id={x.team} />
                    {x.priority === 'urgent' || x.priority === 'high' ? <StatusBadge tone={priorityOf(x.priority).tone}>{priorityOf(x.priority).label}</StatusBadge> : null}
                  </span>
                  {cl.length ? <span className="tk-prog" aria-label={`${cl.filter((c) => c.done).length} of ${cl.length} steps`}><i style={{ width: `${(cl.filter((c) => c.done).length / cl.length) * 100}%` }} /></span> : null}
                  <span className="tk-card__foot"><span className="mt-data tk-help">{x.id}</span>{(x.assignees || []).length ? <People names={x.assignees} /> : <span className="tk-help">Not taken</span>}</span>
                </div>
              );
            })}
            {!items.length ? <span className="tk-help" style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>Drop a task here</span> : null}
          </div>
        );
      })}
    </div>
  );

  // ---- calendar -----------------------------------------------------------------------------------------------------
  const first = month == null ? startOfMonth(t) : month;
  const next = addMonths(first, 1, 1);
  const gridStart = weekStart(first);
  const cells = Array.from({ length: Math.ceil(Math.round((next - gridStart) / DAY) / 7) * 7 }, (_, i) => dayKey(gridStart + i * DAY + 3600e3));
  const firstKey = dayKey(first);
  const nextKey = dayKey(next);
  const calBody = (
    <>
      <div className="ix-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: '0 var(--space-2) 0 0', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-heading)' }}>{monthLong(first)} {yearOf(first)}</h2>
          <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Previous month" onClick={() => setMonth(addMonths(first, -1, 1))}><Icon name="chevron-left" width="16" height="16" aria-hidden="true" /></button>
          <button type="button" className="ix-btn ix-btn--sm" onClick={() => setMonth(null)}>Today</button>
          <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Next month" onClick={() => setMonth(next)}><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button>
        </div>
      </div>
      <div className="tk-cal">
        {WEEK.map((d) => <span key={d} className="tk-cal__h">{d}</span>)}
        {cells.map((k) => {
          const items = list.filter((x) => x.due === k);
          return (
            <div key={k} className={'tk-cal__d' + (k === today ? ' is-today' : '') + (k < firstKey || k >= nextKey ? ' is-out' : '')}>
              <span>{dayOfMonth(fromKey(k))}</span>
              {items.slice(0, 4).map((x) => {
                const cls = x.status === 'done' ? ' is-done' : dueState(x, today) === 'overdue' ? ' is-late' : x.priority === 'urgent' ? ' is-urgent' : '';
                return <button key={x.id} type="button" className={'tk-cal__t' + cls} onClick={() => setOpenId(x.id)} title={x.title}>{x.title}</button>;
              })}
              {items.length > 4 ? <span className="tk-help">+{items.length - 4} more</span> : null}
            </div>
          );
        })}
      </div>
    </>
  );

  // ---- workload -----------------------------------------------------------------------------------------------------
  const open = list.filter((x) => x.status !== 'done');
  const loads = everyone.map((p) => {
    const mine = open.filter((x) => (x.assignees || []).includes(p.name));
    return { p, mine, late: mine.filter((x) => dueState(x, today) === 'overdue').length, week: mine.filter((x) => ['today', 'week'].includes(dueState(x, today))).length, hours: Math.round(mine.reduce((a, x) => a + Math.max(0, (Number(x.estimate) || 0) - (Number(x.logged) || 0)), 0) * 10) / 10 };
  }).filter((r) => r.mine.length || f.who === r.p.name).sort((a, b) => b.mine.length - a.mine.length);
  const max = Math.max(1, ...loads.map((r) => r.mine.length));
  const unassigned = open.filter((x) => !(x.assignees || []).length).length;
  const loadBody = (
    <div className="tk-load" role="table" aria-label="Workload per person">
      <div className="tk-load__head" role="row"><span role="columnheader">Person</span><span role="columnheader" className="hide-sm">Open by priority</span><span role="columnheader" className="tk-fig">Open</span><span role="columnheader" className="tk-fig">Late</span><span role="columnheader" className="tk-fig hide-sm">7 days</span><span role="columnheader" className="tk-fig hide-sm">Hours left</span></div>
      {loads.map(({ p, mine, late, week, hours }) => (
        <div key={p.name} className="tk-load__row" role="row" tabIndex={0} onClick={() => { setF({ ...f, who: p.name }); setScope('all'); go('list'); }} onKeyDown={(e) => { if (e.key === 'Enter') { setF({ ...f, who: p.name }); setScope('all'); go('list'); } }} aria-label={`${p.name}: ${mine.length} open, ${late} late. Show their tasks`}>
          <span className="tk-load__who" role="cell"><Dot name={p.name} size={28} /><span style={{ minWidth: 0 }}><b>{p.name}</b><small>{teamOf(p.team).name} · {p.title}</small></span></span>
          <span className="tk-load__bar hide-sm" role="cell" style={{ width: `${(mine.length / max) * 100}%`, minWidth: 8 }}>{PRIORITIES.map((pr) => { const n = mine.filter((x) => x.priority === pr.id).length; return n ? <i key={pr.id} style={{ width: `${(n / mine.length) * 100}%`, background: PRI_COLOR[pr.id] }} title={`${n} ${pr.label.toLowerCase()}`} /> : null; })}</span>
          <span className="tk-fig" role="cell">{mine.length}</span>
          <span className={'tk-fig' + (late ? ' is-bad' : '')} role="cell">{late}</span>
          <span className="tk-fig hide-sm" role="cell">{week}</span>
          <span className="tk-fig hide-sm" role="cell">{hours} h</span>
        </div>
      ))}
      {unassigned ? <div role="row"><span role="cell" className="tk-help">Not taken yet: {unassigned} task{unassigned === 1 ? '' : 's'}</span></div> : null}
    </div>
  );

  const body = !list.length ? (
    <div className="ix-empty">
      {filtered ? <EmptyState icon="search-x" title="No task matches." actionLabel="Clear filters" onAction={clearAll} />
        : <EmptyState icon="list-checks" title={cur === 'mine' ? 'Nothing on your list.' : cur === 'overdue' ? 'Nothing is late.' : cur === 'blocked' ? 'Nothing is blocked.' : 'No tasks yet.'} actionLabel="New task" onAction={() => setDraft({})} />}
    </div>
  ) : show === 'list' ? listBody : show === 'board' ? boardBody : show === 'calendar' ? calBody : loadBody;

  return (
    <AdminShell active="tasks">
      <style dangerouslySetInnerHTML={{ __html: MEET_CSS + TASK_CSS }} />
      <div className="ix-page">
        <ShopHeader title="Tasks"
          about="GridCommerce staff's work across Sales, Support, Marketing, Technical, Finance, Operations and HR: who does what, by when, and which merchant, lead, meeting or ticket it is about. Show it as a list by due date, a board by status (drag a card or use its menu), a calendar by due date, or each person's workload. Select tasks in the list to change their status, person or priority together. A task holds its checklist, comments, time logged and history."
          more={[{ label: 'Add a person', icon: 'user-plus', onClick: () => setPerson({ name: '', team: 'sales', err: '' }) }, { label: 'Meetings', icon: 'video', href: '/admin/meetings' }]}
          primary={{ label: 'New task', icon: 'plus', onClick: () => setDraft({}) }} />

        {!live ? (
          <div aria-busy="true" aria-label="Loading tasks" className="tk-skel" />
        ) : (
          <section className="ix-card" aria-label="Tasks">
            {sel.length && show === 'list' ? (
              <div className="ix-bulk" role="toolbar" aria-label="Change the selected tasks">
                <span className="ix-bulk__n">{sel.length} selected</span>
                <select className="ix-pick" aria-label="Set status" value="" onChange={(e) => e.target.value && bulk({ status: e.target.value }, statusOf(e.target.value).label)}><option value="">Status…</option>{STATUSES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select>
                <select className="ix-pick" aria-label="Give to" value="" onChange={(e) => e.target.value && bulk({ assignees: e.target.value === '_none' ? [] : [e.target.value] }, e.target.value === '_none' ? 'open for the team' : `given to ${e.target.value}`)}><option value="">Assign to…</option><option value="_none">Nobody (team)</option>{everyone.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}</select>
                <select className="ix-pick" aria-label="Priority" value="" onChange={(e) => e.target.value && bulk({ priority: e.target.value }, priorityOf(e.target.value).label)}><option value="">Priority…</option>{PRIORITIES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setSel([])}>Clear</button>
              </div>
            ) : (
              <div className="ix-bar">
                {find ? (<>
                  <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks, tags or records" onDone={() => { setQ(''); setFind(false); }} autoFocus />
                  <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setQ(''); setFind(false); }}>Cancel</button>
                </>) : (<>
                  <IndexTabs label="Whose tasks" tabs={SCOPES.map(([k, l]) => ({ key: k, id: 'tk-tab-' + k, label: l, count: counts[k], on: cur === k, onClick: () => { setScope(k); setSel([]); } }))} />
                  <span className="ix-tools"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search tasks" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button></span>
                </>)}
              </div>
            )}
            <div className="tk-shows">
              <div className="gc-seg" role="group" aria-label="Show as">
                {SHOWS.map(([k, l]) => <button key={k} type="button" className={'gc-seg__btn' + (show === k ? ' gc-seg__btn--active' : '')} aria-pressed={show === k} onClick={() => go(k)}>{l}</button>)}
              </div>
              <span className="tk-shows__end" role="group" aria-label="Filters">
                <select className={'ix-filter' + (f.team ? ' is-set' : '')} aria-label="Team" value={f.team} onChange={(e) => setF({ ...f, team: e.target.value })}><option value="">All teams</option>{TEAMS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
                <select className={'ix-filter' + (f.who ? ' is-set' : '')} aria-label="Person" value={f.who} onChange={(e) => setF({ ...f, who: e.target.value })}><option value="">Anyone</option>{everyone.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}</select>
                <select className={'ix-filter' + (f.pri ? ' is-set' : '')} aria-label="Priority" value={f.pri} onChange={(e) => setF({ ...f, pri: e.target.value })}><option value="">Any priority</option>{PRIORITIES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select>
                {filtered ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={clearAll}>Clear</button> : null}
              </span>
            </div>
            {body}
            <div className="ix-foot"><span>{list.filter((x) => x.status !== 'done').length} open · {list.filter((x) => x.status === 'done').length} done</span></div>
          </section>
        )}
      </div>

      {draft && live ? <NewTaskSheet preset={draft} onClose={() => setDraft(null)} me={me} t={t} shops={shops} /> : null}
      {task ? <TaskSheet task={task} me={me} t={t} shops={shops} onClose={closeTask} /> : null}
      <Sheet open={!!person} title="Add a person" onClose={() => setPerson(null)}
        footer={<><button type="button" className="ix-btn" onClick={() => setPerson(null)}>Cancel</button><button type="button" className="ix-btn ix-btn--primary" onClick={savePerson}>Add person</button></>}>
        {person ? (
          <div className="tk-form">
            <div><label className="gc-label" htmlFor="tp-name">Full name</label><input id="tp-name" className="gc-input" value={person.name} onChange={(e) => setPerson({ ...person, name: e.target.value, err: '' })} placeholder="For example: Rumana Afroz" data-autofocus /></div>
            <div><label className="gc-label" htmlFor="tp-team">Team</label><select id="tp-team" className="gc-input gc-select" value={person.team} onChange={(e) => setPerson({ ...person, team: e.target.value })}>{TEAMS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
            <p className="tk-help">They can be given tasks and added as watchers. Sign-in access is set in Roles &amp; permissions.</p>
            {person.err ? <p className="tk-err" role="alert">{person.err}</p> : null}
          </div>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
