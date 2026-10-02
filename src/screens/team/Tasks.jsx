'use client';
// Tasks (/tasks) — the team's work (src/lib/tasks.js):
//   views: My tasks · My teams · I gave · Watching · IT desk · Everyone
//   shown as: List (by due date) · Board (by status, team, person or priority — drag a card) · Calendar · Workload
//   filters (team, person, tag, type, priority, search), bulk changes, Ask IT, teams and tags
// A task has a team, several people, watchers, tags, type (task, IT request, bug, request), start and due dates,
// estimate and time logged, checklist, files, "blocked by" other tasks, comments, history and "discuss in chat".
// ?task=TK-101 opens a task; ?new=1 starts one; ?view=it opens the IT desk.
// Laid out like a Shopify list: whose tasks are the view tabs, the search button opens search and filter pills, the
// List / Board / Calendar / Workload switch sits under them, and selected tasks get a bulk bar.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { Dialog, EmptyState } from '@/components/ui';
import { StatusBadge } from '@/components/ui';
import { IndexTabs, SearchField, Menu, LearnMore } from '@/components/ui/IndexKit';
import { formatDate, formatTime } from '@/lib/format';
import { USERS, roleOf } from '@/lib/team';
import {
  STATUSES, PRIORITIES, TYPES, IT_CATS, TONES, statusLabel, statusTone, priorityOf, saveTask, setStatus, toggleCheck, addComment, removeTask,
  dueState, dayKeyOf, getTeams, getTags, teamBy, tagBy, teamsOf, isMine, watching, bulkUpdate, saveTeam, removeTeam, saveTag, removeTag, openBlockers,
} from '@/lib/tasks';
import { send } from '@/lib/teamChat';
import { TeamPage, useMe, useTasks, UserAvatar, userName } from './teamShared';

const CSS = `
.tk-shows{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:6px 8px 6px 12px;border-bottom:1px solid var(--border-subtle)}
.tk-shows .ix-pick{height:28px}
.tk-group > h3{display:flex;align-items:center;gap:var(--space-2);min-height:32px;margin:0;padding:2px 12px 2px var(--space-4);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-body);background:var(--surface-subtle);border-bottom:1px solid var(--border-subtle)}
.tk-group > h3 input{width:16px;height:16px;accent-color:var(--primary)}
.tk-row{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:6px var(--space-4);border-bottom:1px solid var(--border-subtle);cursor:pointer}
.tk-row > input{width:16px;height:16px;flex:none;accent-color:var(--primary)}
.tk-row:hover{background:var(--surface-subtle)}
.tk-row.is-sel{background:var(--fill-primary-soft)}
.tk-row.is-done .tk-title{text-decoration:line-through;color:var(--text-muted)}
.tk-check{position:relative;display:grid;place-items:center;width:32px;height:32px;flex:none;margin:-6px;border:0;border-radius:var(--radius-full);background:none;color:var(--text-on-dark);cursor:pointer;padding:0}
.tk-check::before{content:'';position:absolute;inset:7px;border:2px solid var(--border-strong, var(--border-field));border-radius:var(--radius-full);background:var(--surface-card)}
.tk-check > *{position:relative}
.tk-check[aria-pressed="true"]::before{background:var(--text-success);border-color:var(--text-success)}
.tk-main{flex:1;min-width:0}
.tk-title{display:flex;align-items:center;gap:6px;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.tk-meta{display:flex;flex-wrap:wrap;align-items:center;gap:4px var(--space-3);margin-top:2px;font-size:var(--text-xs);color:var(--text-muted)}
.tk-meta > span{display:inline-flex;align-items:center;gap:4px}
.tk-due--overdue{color:var(--text-danger);font-weight:var(--weight-medium)}
.tk-due--today{color:var(--text-warning);font-weight:var(--weight-medium)}
.tk-tag{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-2xs);font-weight:var(--weight-medium)}
.tk-team{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 8px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-2xs);font-weight:var(--weight-medium);color:var(--text-body)}
.tk-stack{display:flex;flex:none}
.tk-stack > *{margin-left:-6px;border:2px solid var(--surface-card)}
.tk-stack > *:first-child{margin-left:0}
.tk-board{display:grid;grid-auto-columns:minmax(240px,1fr);grid-auto-flow:column;gap:var(--space-3);padding:var(--space-3) var(--space-4) var(--space-4);overflow-x:auto}
.tk-col{display:flex;flex-direction:column;gap:var(--space-2);min-height:200px;padding:var(--space-2);border-radius:var(--radius-xl);background:var(--surface-subtle)}
.tk-col.is-over{outline:2px dashed var(--primary);outline-offset:-2px}
.tk-col > header{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.tk-card{display:flex;flex-direction:column;gap:6px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);cursor:grab;text-align:left;font:inherit}
.tk-card:hover{border-color:var(--primary)}
.tk-card b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.tk-prog{height:4px;border-radius:var(--radius-full);background:var(--border-subtle);overflow:hidden}
.tk-prog i{display:block;height:100%;background:var(--text-success)}
.tk-cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;padding:var(--space-3) var(--space-4) var(--space-4)}
.tk-cal__h{padding:4px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:center}
.tk-cal__d{display:flex;flex-direction:column;gap:3px;min-height:92px;padding:6px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);min-width:0}
.tk-cal__d.is-today{border-color:var(--primary);background:var(--fill-primary-soft)}
.tk-cal__d.is-out{opacity:.45}
.tk-cal__d > span{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.tk-cal__t{display:block;width:100%;padding:2px 6px;border:0;border-radius:var(--radius-sm);font:inherit;font-size:var(--text-2xs);text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;min-height:22px}
.tk-load{display:flex;flex-direction:column}
.tk-load > div{display:grid;grid-template-columns:minmax(180px,1.2fr) minmax(160px,2fr) repeat(4,80px);align-items:center;gap:var(--space-3);min-height:44px;padding:6px var(--space-4);border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm)}
.tk-load__head{min-height:36px!important;background:var(--surface-subtle);font-size:var(--text-xs)!important;font-weight:var(--weight-medium);color:var(--text-body)}
.tk-load__bar{display:flex;height:8px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.tk-load__bar i{display:block;height:100%}
.ix-bulk .ix-pick{flex:none;height:28px;font-size:var(--text-xs-plus)}
.tk-panel{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:var(--space-5)}
.tk-side{display:flex;flex-direction:column;gap:var(--space-3)}
.tk-side .gc-input{height:40px}
.tk-side .tm-two{grid-template-columns:1fr}
.tk-chips{display:flex;flex-wrap:wrap;gap:6px}
.tk-pick{display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:2px 10px 2px 2px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);cursor:pointer}
.tk-pick:hover{border-color:var(--text-danger)}
.tk-tagbtn{min-height:32px;padding:0 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);cursor:pointer}
.tk-tagbtn[aria-pressed="true"]{border-color:transparent}
.tk-cl{display:flex;flex-direction:column;gap:2px}
.tk-cl label{display:flex;align-items:center;gap:var(--space-2);min-height:36px;padding:0 var(--space-2);border-radius:var(--radius-md);font-size:var(--text-sm)}
.tk-cl label:hover{background:var(--surface-subtle)}
.tk-cl .is-done{text-decoration:line-through;color:var(--text-muted)}
.tk-cmt{display:flex;gap:var(--space-2);font-size:var(--text-sm)}
.tk-cmt p{margin:2px 0 0;color:var(--text-body);white-space:pre-wrap}
.tk-hist{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;font-size:var(--text-xs);color:var(--text-muted)}
.tk-hist b{color:var(--text-heading);font-weight:var(--weight-medium)}
.tk-tabs2{display:flex;gap:4px;margin-bottom:var(--space-2)}
.tk-mgr{display:flex;flex-direction:column;gap:var(--space-2)}
.tk-mgr > div{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
@media (max-width:900px){.tk-panel{grid-template-columns:minmax(0,1fr)}.tk-load > div{grid-template-columns:minmax(140px,1fr) repeat(2,64px)}.tk-load__bar,.tk-load .hide-sm{display:none}}
@media (max-width:640px){.tk-row{padding:6px var(--space-3)}.tk-check{width:36px;height:36px}.tk-cal{grid-template-columns:repeat(7,minmax(40px,1fr));overflow-x:auto}.tk-cal__d{min-height:64px}.tk-cal__t{font-size:0;padding:0;height:6px;min-height:6px}}
`;
const GROUPS = [['overdue', 'Overdue'], ['today', 'Today'], ['week', 'This week'], ['later', 'Later'], ['none', 'No date'], ['done', 'Done']];
const WD = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const toneBg = (tone) => (tone === 'slate' ? ['var(--surface-subtle)', 'var(--text-body)'] : tone === 'primary' ? ['var(--fill-primary-soft)', 'var(--primary)'] : tone === 'secondary' ? ['var(--fill-secondary-soft)', 'var(--secondary)'] : [`var(--fill-${tone}-soft)`, `var(--text-${tone === 'error' ? 'danger' : tone})`]);
const dateText = (key) => (key ? formatDate(new Date(key + 'T00:00:00').getTime()) : '');
const blank = (me, today, patch = {}) => ({ title: '', notes: '', type: 'task', itCat: '', team: (teamsOf(me.id)[0] || { id: 'mgmt' }).id, assignees: [me.id], watchers: [], by: me.id, start: '', due: today, priority: 'normal', status: 'todo', tags: [], checklist: [], comments: [], repeat: '', estimate: '', link: null, ...patch });

export function Tag({ id, tags }) {
  const t = tagBy(id, tags);
  if (!t) return null;
  const [bg, fg] = toneBg(t.tone);
  return <span className="tk-tag" style={{ background: bg, color: fg }}>#{t.name}</span>;
}
function TeamChip({ id, teams }) {
  const t = teamBy(id, teams);
  if (!t) return null;
  return <span className="tk-team"><Icon name={t.icon} width="12" height="12" aria-hidden="true" />{t.name}</span>;
}
function People({ ids, size = 28 }) {
  return <span className="tk-stack">{(ids || []).slice(0, 3).map((id) => <UserAvatar key={id} id={id} size={size} />)}{(ids || []).length > 3 ? <span className="tm-av" style={{ width: size, height: size, background: 'var(--surface-subtle)', color: 'var(--text-body)' }}>+{ids.length - 3}</span> : null}</span>;
}

export default function Tasks() {
  const { me, ready } = useMe();
  const { tasks } = useTasks();
  const teams = useMemo(() => getTeams(), [tasks]); // eslint-disable-line react-hooks/exhaustive-deps
  const tags = useMemo(() => getTags(), [tasks]); // eslint-disable-line react-hooks/exhaustive-deps
  const today = dayKeyOf(Date.now());
  const [scope, setScope] = useState('mine');
  const [view, setView] = useState('list');
  const [groupBy, setGroupBy] = useState('status');
  const [f, setF] = useState({ q: '', team: '', who: '', tag: '', type: '', pri: '' });
  const [sel, setSel] = useState([]);
  const [openId, setOpenId] = useState('');
  const [draft, setDraft] = useState(null);
  const [ask, setAsk] = useState(null);
  const [manage, setManage] = useState('');
  const [showDone, setShowDone] = useState(false);
  const [over, setOver] = useState('');
  const [month, setMonth] = useState(today.slice(0, 7));
  const [find, setFind] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('task')) setOpenId(p.get('task'));
    if (p.get('new')) setDraft(blank(me, today));
    if (p.get('scope')) setScope(p.get('scope'));
    if (p.get('view') === 'it') setScope('it');
    if (p.get('ask')) setAsk({ title: '', itCat: 'Hardware', notes: '', priority: 'normal', place: me.place });
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const myTeams = teamsOf(me.id, teams).map((t) => t.id);
  const scopeTest = (k, t) => {
    switch (k) {
      case 'mine': return isMine(t, me.id, teams);
      case 'teams': return myTeams.includes(t.team);
      case 'gave': return t.by === me.id && !(t.assignees || []).includes(me.id);
      case 'watch': return watching(t, me.id);
      case 'it': return t.type === 'it' || t.type === 'bug' || t.team === 'it';
      default: return true;
    }
  };
  const inScope = (t) => scopeTest(scope, t);
  const needle = f.q.trim().toLowerCase();
  const list = useMemo(() => tasks.filter((t) => inScope(t) && (!f.team || t.team === f.team) && (!f.who || (t.assignees || []).includes(f.who)) && (!f.tag || (t.tags || []).includes(f.tag))
    && (!f.type || t.type === f.type) && (!f.pri || t.priority === f.pri) && (!needle || `${t.title} ${t.notes} ${t.id}`.toLowerCase().includes(needle))), [tasks, scope, f, needle, me.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const open = list.filter((t) => t.status !== 'done');
  const count = (k) => tasks.filter((t) => t.status !== 'done' && scopeTest(k, t)).length;
  const filtered = Object.entries(f).some(([k, v]) => v && k !== 'q') || !!f.q;
  const task = tasks.find((t) => t.id === openId) || null;

  const toggleDone = (t) => {
    const made = setStatus(t.id, t.status === 'done' ? 'todo' : 'done', me.id);
    toast(t.status === 'done' ? `“${t.title}” is open again.` : made ? `Done. Next one is on ${dateText(made.due)}.` : 'Done. Nice work.');
  };
  const pick = (id) => setSel(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]);
  const bulk = async (patch, label) => {
    if (patch.remove) {
      if (!(await confirmDialog({ title: `Delete ${sel.length} task${sel.length === 1 ? '' : 's'}?`, body: 'They go for good, with their comments.', confirmLabel: 'Delete', tone: 'danger' }))) return;
      sel.forEach((id) => removeTask(id)); toast(`${sel.length} deleted.`); setSel([]); return;
    }
    bulkUpdate(sel, patch, me.id);
    toast(`${sel.length} task${sel.length === 1 ? '' : 's'} · ${label}.`);
    setSel([]);
  };
  const create = (e) => {
    e.preventDefault();
    if (!draft.title.trim()) { toast('Give the task a title', { tone: 'error' }); return; }
    const row = saveTask({ ...draft, title: draft.title.trim(), estimate: Number(draft.estimate) || 0 }, me.id);
    toast(row.assignees.length && !row.assignees.includes(me.id) ? `Task given to ${row.assignees.map((x) => userName(x).split(' ')[0]).join(', ')}.` : row.assignees.length ? 'Task added to your list.' : `Task added to ${teamBy(row.team, teams).name} for anyone to take.`);
    setDraft(null);
  };
  const askIt = (e) => {
    e.preventDefault();
    if (!ask.title.trim()) { toast('Say what is wrong', { tone: 'error' }); return; }
    const it = teamBy('it', teams);
    const row = saveTask({ title: ask.title.trim(), type: 'it', itCat: ask.itCat, team: 'it', assignees: it ? [it.lead] : [], watchers: [me.id], by: me.id, due: ask.priority === 'urgent' ? today : '', priority: ask.priority, notes: `${ask.notes.trim()}${ask.place ? `\nWhere: ${ask.place}` : ''}`, tags: [] }, me.id);
    send('team:it', me.id, `New IT request #${row.id}: ${row.title} (${ask.itCat}${ask.priority === 'urgent' ? ', urgent' : ''})`, { task: row.id });
    toast(`Sent to IT as ${row.id}. You’ll see updates under Watching.`);
    setAsk(null);
  };
  const drop = (key) => (e) => {
    e.preventDefault(); setOver('');
    const id = e.dataTransfer.getData('text/plain');
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    if (groupBy === 'status' && t.status !== key) { const made = setStatus(id, key, me.id); toast(`Moved to ${statusLabel(key)}${made ? ' · the next one is made' : ''}.`); }
    if (groupBy === 'team' && t.team !== key) { saveTask({ id, team: key }, me.id); toast(`Moved to ${teamBy(key, teams).name}.`); }
    if (groupBy === 'person' && !(t.assignees || []).includes(key)) { saveTask({ id, assignees: key === '_none' ? [] : [key] }, me.id); toast(key === '_none' ? 'Now open for the team.' : `Given to ${userName(key)}.`); }
    if (groupBy === 'priority' && t.priority !== key) { saveTask({ id, priority: key }, me.id); toast(`Priority ${priorityOf(key)[1]}.`); }
  };

  const Row = ({ t }) => {
    const ds = dueState(t, today);
    const cl = t.checklist || [];
    const pr = priorityOf(t.priority);
    const blockers = openBlockers(t, tasks);
    const isSel = sel.includes(t.id);
    return (
      <div className={'tk-row' + (t.status === 'done' ? ' is-done' : '') + (isSel ? ' is-sel' : '')} onClick={() => setOpenId(t.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setOpenId(t.id); }}>
        <input type="checkbox" checked={isSel} onClick={(e) => e.stopPropagation()} onChange={() => pick(t.id)} aria-label={`Select “${t.title}”`} />
        <button type="button" className="tk-check" aria-pressed={t.status === 'done'} aria-label={t.status === 'done' ? `Open “${t.title}” again` : `Mark “${t.title}” done`} onClick={(e) => { e.stopPropagation(); toggleDone(t); }}>{t.status === 'done' ? <Icon name="check" width="14" height="14" aria-hidden="true" /> : null}</button>
        <div className="tk-main">
          <span className="tk-title">{t.type !== 'task' ? <Icon name={TYPES[t.type][1]} width="14" height="14" aria-label={TYPES[t.type][0]} style={{ color: t.type === 'bug' ? 'var(--text-danger)' : 'var(--text-info)', flex: 'none' }} /> : null}{t.title}</span>
          <div className="tk-meta">
            {t.due ? <span className={ds === 'overdue' ? 'tk-due--overdue' : ds === 'today' ? 'tk-due--today' : ''}><Icon name="calendar" width="12" height="12" aria-hidden="true" />{ds === 'today' ? 'Today' : dateText(t.due)}{ds === 'overdue' ? ' · late' : ''}</span> : null}
            <TeamChip id={t.team} teams={teams} />
            {t.status !== 'todo' && t.status !== 'done' ? <StatusBadge tone={statusTone(t.status) === 'slate' ? 'neutral' : statusTone(t.status)}>{statusLabel(t.status)}</StatusBadge> : null}
            {t.priority === 'urgent' || t.priority === 'high' ? <StatusBadge tone={pr[2]}>{pr[1]}</StatusBadge> : null}
            {(t.tags || []).map((id) => <Tag key={id} id={id} tags={tags} />)}
            {blockers.length ? <span className="tk-due--overdue"><Icon name="lock" width="12" height="12" aria-hidden="true" />waits for {blockers.map((b) => b.id).join(', ')}</span> : null}
            {cl.length ? <span><Icon name="list-checks" width="12" height="12" aria-hidden="true" />{cl.filter((c) => c.done).length}/{cl.length}</span> : null}
            {(t.comments || []).length ? <span><Icon name="message-square" width="12" height="12" aria-hidden="true" />{t.comments.length}</span> : null}
            {(t.files || []).length ? <span><Icon name="paperclip" width="12" height="12" aria-hidden="true" />{t.files.length}</span> : null}
            {t.repeat ? <span><Icon name="repeat" width="12" height="12" aria-hidden="true" />{t.repeat}</span> : null}
            {t.estimate ? <span><Icon name="timer" width="12" height="12" aria-hidden="true" />{t.logged || 0}/{t.estimate} h</span> : null}
          </div>
        </div>
        {(t.assignees || []).length ? <People ids={t.assignees} size={24} /> : <span className="gc-badge gc-badge--slate">Open</span>}
      </div>
    );
  };

  // ---- board columns ----
  const columns = groupBy === 'status' ? STATUSES.map(([k, l, tone]) => ({ key: k, label: l, tone, items: list.filter((t) => t.status === k) }))
    : groupBy === 'team' ? teams.map((tm) => ({ key: tm.id, label: tm.name, tone: tm.tone, items: list.filter((t) => t.team === tm.id && t.status !== 'done') })).filter((c) => c.items.length || f.team === c.key)
      : groupBy === 'priority' ? PRIORITIES.map(([k, l, tone]) => ({ key: k, label: l, tone, items: list.filter((t) => t.priority === k && t.status !== 'done') }))
        : [{ key: '_none', label: 'Not taken yet', tone: 'slate', items: list.filter((t) => !(t.assignees || []).length && t.status !== 'done') }, ...USERS.map((u) => ({ key: u.id, label: u.name, tone: 'slate', items: list.filter((t) => (t.assignees || []).includes(u.id) && t.status !== 'done') })).filter((c) => c.items.length)];

  // ---- calendar ----
  const [cy, cm] = month.split('-').map(Number);
  const first = new Date(cy, cm - 1, 1);
  const lead = (first.getDay() + 1) % 7;
  const gridStart = new Date(cy, cm - 1, 1 - lead);
  const cells = Array.from({ length: Math.ceil((lead + new Date(cy, cm, 0).getDate()) / 7) * 7 }, (_, i) => dayKeyOf(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i).getTime()));
  const shiftMonth = (n) => { const d = new Date(cy, cm - 1 + n, 1); setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); };

  const searching = find || filtered;
  const closeFind = () => { setFind(false); setF({ q: '', team: '', who: '', tag: '', type: '', pri: '' }); };
  const views = [['mine', 'My tasks', 'user'], ['teams', 'My teams', 'users'], ['gave', 'I gave', 'send'], ['watch', 'Watching', 'eye'], ['it', 'IT desk', 'monitor-cog'], ['all', 'Everyone', 'globe']];

  return (
    <TeamPage screen="Tasks" active="tasks" crumb="General" page="Tasks" title="Tasks" icon="list-checks" css={CSS}
      about="The team’s work: who does what, by when, with which team — and what is waiting on what. Show it as a list, a board, a calendar or each person’s workload."
      secondary={[{ label: 'Ask IT', onClick: () => setAsk({ title: '', itCat: 'Hardware', notes: '', priority: 'normal', place: me.place }) }]}
      more={[{ label: 'Teams & tags', onClick: () => setManage('teams') }, { label: 'Team chat', href: '/team-chat' }]}
      primary={{ label: 'New task', onClick: () => setDraft(blank(me, today)) }}>

      <section className="ix-card" aria-label="Tasks">
        {sel.length ? (
          <div className="ix-bulk" role="toolbar" aria-label="Change the selected tasks">
            <span className="ix-bulk__n">{sel.length} selected</span>
            <select className="ix-pick" aria-label="Set status" value="" onChange={(e) => e.target.value && bulk({ status: e.target.value }, statusLabel(e.target.value))}><option value="">Status…</option>{STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            <select className="ix-pick" aria-label="Give to" value="" onChange={(e) => e.target.value && bulk({ assignees: e.target.value === '_none' ? [] : [e.target.value] }, e.target.value === '_none' ? 'open for the team' : `given to ${userName(e.target.value)}`)}><option value="">Give to…</option><option value="_none">Nobody (team)</option>{USERS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
            <select className="ix-pick" aria-label="Priority" value="" onChange={(e) => e.target.value && bulk({ priority: e.target.value }, priorityOf(e.target.value)[1])}><option value="">Priority…</option>{PRIORITIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            <select className="ix-pick" aria-label="Move to team" value="" onChange={(e) => e.target.value && bulk({ team: e.target.value }, `moved to ${teamBy(e.target.value, teams).name}`)}><option value="">Team…</option>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
            <select className="ix-pick" aria-label="Add tag" value="" onChange={(e) => e.target.value && bulk({ addTag: e.target.value }, `tagged #${tagBy(e.target.value, tags).name}`)}><option value="">Add tag…</option>{tags.map((t) => <option key={t.id} value={t.id}>#{t.name}</option>)}</select>
            <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" align="start" items={[{ label: 'Delete', onClick: () => bulk({ remove: true }), tone: 'danger' }, { label: 'Clear selection', onClick: () => setSel([]) }]} />
          </div>
        ) : (
          <div className="ix-bar">
            {searching ? (<>
              <SearchField value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search tasks" onDone={closeFind} autoFocus />
              <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
            </>) : (<>
              <IndexTabs label="Whose tasks" tabs={views.map(([k, l]) => ({ key: k, id: 'tk-tab-' + k, label: l, count: count(k), on: scope === k, onClick: () => { setScope(k); setSel([]); } }))} />
              <span className="ix-tools">
                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
              </span>
            </>)}
          </div>
        )}
        {searching && !sel.length ? (
          <div className="ix-filters" role="group" aria-label="Filters">
            <select className={'ix-filter' + (f.team ? ' is-set' : '')} aria-label="Team" value={f.team} onChange={(e) => setF({ ...f, team: e.target.value })}><option value="">Team</option>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
            <select className={'ix-filter' + (f.who ? ' is-set' : '')} aria-label="Person" value={f.who} onChange={(e) => setF({ ...f, who: e.target.value })}><option value="">Person</option>{USERS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
            <select className={'ix-filter' + (f.tag ? ' is-set' : '')} aria-label="Tag" value={f.tag} onChange={(e) => setF({ ...f, tag: e.target.value })}><option value="">Tag</option>{tags.map((t) => <option key={t.id} value={t.id}>#{t.name}</option>)}</select>
            <select className={'ix-filter' + (f.type ? ' is-set' : '')} aria-label="Type" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option value="">Type</option>{Object.entries(TYPES).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}</select>
            <select className={'ix-filter' + (f.pri ? ' is-set' : '')} aria-label="Priority" value={f.pri} onChange={(e) => setF({ ...f, pri: e.target.value })}><option value="">Priority</option>{PRIORITIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            {filtered ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setF({ q: '', team: '', who: '', tag: '', type: '', pri: '' })}>Clear all</button> : null}
          </div>
        ) : null}
        <div className="tk-shows">
          <div className="gc-seg" role="group" aria-label="Show as">
            {[['list', 'List'], ['board', 'Board'], ['calendar', 'Calendar'], ['load', 'Workload']].map(([k, l]) => <button key={k} type="button" className={'gc-seg__btn' + (view === k ? ' gc-seg__btn--active' : '')} aria-pressed={view === k} onClick={() => setView(k)}>{l}</button>)}
          </div>
          {view === 'board' ? <select className="ix-pick" aria-label="Group the board by" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}><option value="status">By status</option><option value="team">By team</option><option value="person">By person</option><option value="priority">By priority</option></select> : null}
        </div>

        {!list.length ? <div className="ix-empty"><EmptyState icon="list-checks" title={scope === 'mine' ? 'Nothing on your list' : 'No tasks here'} actionLabel={filtered ? 'Clear filters' : 'New task'} onAction={filtered ? closeFind : () => setDraft(blank(me, today))} /></div>
          : view === 'list' ? GROUPS.map(([g, label]) => {
            const rows = list.filter((t) => dueState(t, today) === g).sort((a, b) => (a.due || '9').localeCompare(b.due || '9') || PRIORITIES.findIndex((p) => p[0] === a.priority) - PRIORITIES.findIndex((p) => p[0] === b.priority));
            if (!rows.length) return null;
            if (g === 'done') return <div key={g} className="tk-group"><h3><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" style={{ marginLeft: -10 }} onClick={() => setShowDone(!showDone)} aria-expanded={showDone}><Icon name={showDone ? 'chevron-down' : 'chevron-right'} width="16" height="16" aria-hidden="true" />Done · {rows.length}</button></h3>{showDone ? rows.map((t) => <Row key={t.id} t={t} />) : null}</div>;
            return <div key={g} className="tk-group"><h3>{label} <span className="ix-tab__n">{rows.length}</span><span style={{ marginLeft: 'auto', display: 'inline-flex' }}><input type="checkbox" aria-label={`Select all ${label.toLowerCase()}`} checked={rows.every((r) => sel.includes(r.id))} onChange={(e) => setSel(e.target.checked ? [...new Set([...sel, ...rows.map((r) => r.id)])] : sel.filter((x) => !rows.some((r) => r.id === x)))} /></span></h3>{rows.map((t) => <Row key={t.id} t={t} />)}</div>;
          })
          : view === 'board' ? (
            <div className="tk-board">
              {columns.map((c) => {
                const [bg, fg] = toneBg(c.tone || 'slate');
                return (
                  <div key={c.key} className={'tk-col' + (over === c.key ? ' is-over' : '')} onDragOver={(e) => { e.preventDefault(); setOver(c.key); }} onDragLeave={() => setOver('')} onDrop={drop(c.key)}>
                    <header><span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>{groupBy === 'person' && c.key !== '_none' ? <UserAvatar id={c.key} size={22} /> : <span className="tk-tag" style={{ background: bg, color: fg }}>{c.label}</span>}{groupBy === 'person' && c.key !== '_none' ? c.label : ''}</span><span className="gc-badge gc-badge--slate">{c.items.length}</span></header>
                    {c.items.map((t) => {
                      const cl = t.checklist || [];
                      const ds = dueState(t, today);
                      return (
                        <button key={t.id} type="button" className="tk-card" draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', t.id)} onClick={() => setOpenId(t.id)}>
                          <b>{t.type !== 'task' ? <Icon name={TYPES[t.type][1]} width="13" height="13" aria-hidden="true" style={{ marginRight: 4, verticalAlign: '-2px' }} /> : null}{t.title}</b>
                          <span className="tk-meta" style={{ marginTop: 0 }}>
                            {t.due ? <span className={ds === 'overdue' ? 'tk-due--overdue' : ds === 'today' ? 'tk-due--today' : ''}>{ds === 'today' ? 'Today' : dateText(t.due)}</span> : null}
                            {groupBy !== 'team' ? <TeamChip id={t.team} teams={teams} /> : null}
                            {groupBy !== 'priority' && (t.priority === 'urgent' || t.priority === 'high') ? <span className={'gc-badge gc-badge--' + priorityOf(t.priority)[2]}>{priorityOf(t.priority)[1]}</span> : null}
                            {(t.tags || []).slice(0, 2).map((id) => <Tag key={id} id={id} tags={tags} />)}
                          </span>
                          {cl.length ? <span className="tk-prog" aria-label={`${cl.filter((x) => x.done).length} of ${cl.length} steps`}><i style={{ width: `${(cl.filter((x) => x.done).length / cl.length) * 100}%` }} /></span> : null}
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>{(t.assignees || []).length ? <People ids={t.assignees} size={24} /> : <span className="tm-sub">Not taken</span>}{openBlockers(t, tasks).length ? <Icon name="lock" width="14" height="14" aria-label="Blocked" style={{ color: 'var(--text-danger)' }} /> : null}</span>
                        </button>
                      );
                    })}
                    {!c.items.length ? <span className="tm-sub" style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>Drop a task here</span> : null}
                  </div>
                );
              })}
            </div>
          ) : view === 'calendar' ? (
            <>
              <div className="tm-head" style={{ paddingBottom: 0 }}><h2>{first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h2><div className="tm-bar__g"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Previous month" onClick={() => shiftMonth(-1)}><Icon name="chevron-left" width="16" height="16" aria-hidden="true" /></button><button type="button" className="ix-btn ix-btn--sm" onClick={() => setMonth(today.slice(0, 7))}>Today</button><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Next month" onClick={() => shiftMonth(1)}><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button></div></div>
              <div className="tk-cal">
                {WD.map((d) => <span key={d} className="tk-cal__h">{d}</span>)}
                {cells.map((k) => {
                  const items = list.filter((t) => t.due === k);
                  return (
                    <div key={k} className={'tk-cal__d' + (k === today ? ' is-today' : '') + (k.slice(0, 7) !== month ? ' is-out' : '')}>
                      <span>{Number(k.slice(8))}</span>
                      {items.slice(0, 4).map((t) => { const tone = t.status === 'done' ? 'success' : dueState(t, today) === 'overdue' ? 'error' : t.priority === 'urgent' ? 'warning' : 'info'; const [bg, fg] = toneBg(tone); return <button key={t.id} type="button" className="tk-cal__t" style={{ background: bg, color: fg, textDecoration: t.status === 'done' ? 'line-through' : 'none' }} onClick={() => setOpenId(t.id)} title={t.title}>{t.title}</button>; })}
                      {items.length > 4 ? <span className="tm-sub">+{items.length - 4} more</span> : null}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="tk-load">
              <div className="tk-load__head"><span>Person</span><span className="tk-load__bar" style={{ background: 'none' }}>Open by priority</span><span>Open</span><span>Late</span><span className="hide-sm">This week</span><span className="hide-sm">Hours</span></div>
              {USERS.map((u) => {
                const mine = list.filter((t) => (t.assignees || []).includes(u.id) && t.status !== 'done');
                if (!mine.length && f.who !== u.id) return null;
                const max = Math.max(1, ...USERS.map((x) => list.filter((t) => (t.assignees || []).includes(x.id) && t.status !== 'done').length));
                return (
                  <div key={u.id}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}><UserAvatar id={u.id} size={28} /><span style={{ minWidth: 0 }}><span className="tm-strong">{u.name}</span><span className="tm-sub">{roleOf(u).title}</span></span></span>
                    <span className="tk-load__bar" style={{ width: `${(mine.length / max) * 100}%`, minWidth: 8 }}>{PRIORITIES.map(([k, , tone]) => { const n = mine.filter((t) => t.priority === k).length; return n ? <i key={k} style={{ width: `${(n / mine.length) * 100}%`, background: tone === 'error' ? 'var(--text-danger)' : tone === 'warning' ? 'var(--warning)' : k === 'normal' ? 'var(--primary)' : 'var(--border-strong, var(--text-faint))' }} title={`${n} ${k}`} /> : null; })}</span>
                    <span className="tm-fig tm-strong">{mine.length}</span>
                    <span className={'tm-fig' + (mine.some((t) => dueState(t, today) === 'overdue') ? ' tm-out' : '')}>{mine.filter((t) => dueState(t, today) === 'overdue').length}</span>
                    <span className="tm-fig hide-sm">{mine.filter((t) => ['today', 'week'].includes(dueState(t, today))).length}</span>
                    <span className="tm-fig hide-sm">{mine.reduce((a, t) => a + Math.max(0, (Number(t.estimate) || 0) - (Number(t.logged) || 0)), 0)} h</span>
                  </div>
                );
              })}
            </div>
          )}
      </section>
      <LearnMore topic="tasks" />

      {task ? <TaskPanel task={task} me={me} tasks={tasks} teams={teams} tags={tags} onOpen={setOpenId} onClose={() => { setOpenId(''); const u = new URL(window.location.href); if (u.searchParams.has('task')) { u.searchParams.delete('task'); window.history.replaceState(window.history.state, '', u.pathname + u.search); } }} /> : null}
      <Dialog open={!!draft} title="New task" onClose={() => setDraft(null)} width={680}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDraft(null)}>Cancel</button><button type="submit" form="tk-new" className="gc-btn gc-btn--solid">Add task</button></>}>
        {draft ? <form id="tk-new" className="tm-form" onSubmit={create}><TaskFields t={draft} set={(p) => setDraft({ ...draft, ...p })} teams={teams} tags={tags} autoFocus /></form> : null}
      </Dialog>
      <Dialog open={!!ask} title="Ask IT for help" onClose={() => setAsk(null)} width={560}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setAsk(null)}>Cancel</button><button type="submit" form="tk-ask" className="gc-btn gc-btn--solid">Send to IT</button></>}>
        {ask ? (
          <form id="tk-ask" className="tm-form" onSubmit={askIt}>
            <div><label className="gc-label" htmlFor="ask-t">What is wrong?</label><input id="ask-t" className="gc-input" value={ask.title} onChange={(e) => setAsk({ ...ask, title: e.target.value })} placeholder="e.g. Counter 2 printer prints blank" data-autofocus /></div>
            <div className="tm-two">
              <div><label className="gc-label" htmlFor="ask-c">About</label><select id="ask-c" className="gc-input gc-select" value={ask.itCat} onChange={(e) => setAsk({ ...ask, itCat: e.target.value })}>{IT_CATS.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div><label className="gc-label" htmlFor="ask-p">How urgent</label><select id="ask-p" className="gc-input gc-select" value={ask.priority} onChange={(e) => setAsk({ ...ask, priority: e.target.value })}><option value="urgent">Urgent — work is stopped</option><option value="high">High — slowing us down</option><option value="normal">Normal — this week</option><option value="low">Low — when there is time</option></select></div>
            </div>
            <div><label className="gc-label" htmlFor="ask-w">Where</label><input id="ask-w" className="gc-input" value={ask.place} onChange={(e) => setAsk({ ...ask, place: e.target.value })} /></div>
            <div><label className="gc-label" htmlFor="ask-n">Details</label><textarea id="ask-n" className="gc-input" rows={3} style={{ height: 'auto', paddingTop: 10 }} value={ask.notes} onChange={(e) => setAsk({ ...ask, notes: e.target.value })} placeholder="What you tried, error message, since when" /></div>
            <p className="gc-help" style={{ margin: 0 }}>Goes to {(teamBy('it', teams) || { name: 'IT' }).name} ({userName((teamBy('it', teams) || {}).lead)}), and to their team chat. You follow it under Watching.</p>
          </form>
        ) : null}
      </Dialog>
      {manage ? <Manage which={manage} setWhich={setManage} teams={teams} tags={tags} tasks={tasks} me={me} onClose={() => setManage('')} /> : null}
    </TeamPage>
  );
}

// ---- pickers -----------------------------------------------------------------------------------------
function PeoplePicker({ id, label, value, onChange, hint }) {
  return (
    <div>
      <label className="gc-label" htmlFor={id}>{label}</label>
      <div className="tk-chips" style={{ marginBottom: value.length ? 6 : 0 }}>{value.map((u) => <button key={u} type="button" className="tk-pick" onClick={() => onChange(value.filter((x) => x !== u))} aria-label={`Remove ${userName(u)}`}><UserAvatar id={u} size={26} />{userName(u).split(' ')[0]}<Icon name="x" width="12" height="12" aria-hidden="true" /></button>)}</div>
      <select id={id} className="gc-input gc-select" value="" onChange={(e) => e.target.value && onChange([...value, e.target.value])}><option value="">{hint || 'Add a person…'}</option>{USERS.filter((u) => !value.includes(u.id)).map((u) => <option key={u.id} value={u.id}>{u.name} · {roleOf(u).title}</option>)}</select>
    </div>
  );
}
function TagPicker({ value, onChange, tags }) {
  return <div className="tk-chips">{tags.map((t) => { const on = value.includes(t.id); const [bg, fg] = toneBg(t.tone); return <button key={t.id} type="button" className="tk-tagbtn" aria-pressed={on} style={on ? { background: bg, color: fg } : undefined} onClick={() => onChange(on ? value.filter((x) => x !== t.id) : [...value, t.id])}>#{t.name}</button>; })}</div>;
}

function TaskFields({ t, set, teams, tags, autoFocus }) {
  return (
    <>
      <div><label className="gc-label" htmlFor="tk-title">Task</label><input id="tk-title" className="gc-input" value={t.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Count the damaged items bay" data-autofocus={autoFocus || undefined} /></div>
      <div className="tm-three">
        <div><label className="gc-label" htmlFor="tk-type">Type</label><select id="tk-type" className="gc-input gc-select" value={t.type} onChange={(e) => set({ type: e.target.value, team: e.target.value === 'it' || e.target.value === 'bug' ? 'it' : t.team })}>{Object.entries(TYPES).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}</select></div>
        <div><label className="gc-label" htmlFor="tk-team">Team</label><select id="tk-team" className="gc-input gc-select" value={t.team} onChange={(e) => set({ team: e.target.value })}>{teams.map((tm) => <option key={tm.id} value={tm.id}>{tm.name}</option>)}</select></div>
        {t.type === 'it' ? <div><label className="gc-label" htmlFor="tk-cat">About</label><select id="tk-cat" className="gc-input gc-select" value={t.itCat} onChange={(e) => set({ itCat: e.target.value })}>{IT_CATS.map((c) => <option key={c}>{c}</option>)}</select></div>
          : <div><label className="gc-label" htmlFor="tk-pri">Priority</label><select id="tk-pri" className="gc-input gc-select" value={t.priority} onChange={(e) => set({ priority: e.target.value })}>{PRIORITIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>}
      </div>
      <PeoplePicker id="tk-who" label="Assign to" value={t.assignees} onChange={(v) => set({ assignees: v })} hint={t.assignees.length ? 'Add another person…' : 'Leave empty for anyone in the team…'} />
      <div className="tm-three">
        <div><label className="gc-label" htmlFor="tk-start">Start</label><input id="tk-start" type="date" className="gc-input" value={t.start} onChange={(e) => set({ start: e.target.value })} /></div>
        <div><label className="gc-label" htmlFor="tk-due">Due</label><input id="tk-due" type="date" className="gc-input" value={t.due} onChange={(e) => set({ due: e.target.value })} /></div>
        <div><label className="gc-label" htmlFor="tk-est">Estimate (hours)</label><input id="tk-est" className="gc-input tm-fig" inputMode="decimal" value={t.estimate} onChange={(e) => set({ estimate: e.target.value.replace(/[^\d.]/g, '') })} /></div>
      </div>
      {t.type === 'it' ? <div><label className="gc-label" htmlFor="tk-pri2">Priority</label><select id="tk-pri2" className="gc-input gc-select" value={t.priority} onChange={(e) => set({ priority: e.target.value })}>{PRIORITIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div> : null}
      <div><span className="gc-label">Tags</span><TagPicker value={t.tags} onChange={(v) => set({ tags: v })} tags={tags} /></div>
      <div className="tm-two">
        <PeoplePicker id="tk-watch" label="Watchers" value={t.watchers || []} onChange={(v) => set({ watchers: v })} hint="They get updates…" />
        <div><label className="gc-label" htmlFor="tk-rep">Repeat</label><select id="tk-rep" className="gc-input gc-select" value={t.repeat} onChange={(e) => set({ repeat: e.target.value })}><option value="">Does not repeat</option><option value="daily">Every day</option><option value="weekly">Every week</option><option value="monthly">Every month</option></select></div>
      </div>
      <div><label className="gc-label" htmlFor="tk-notes">Notes</label><textarea id="tk-notes" className="gc-input" rows={3} style={{ height: 'auto', paddingTop: 10 }} value={t.notes} onChange={(e) => set({ notes: e.target.value })} /></div>
    </>
  );
}

// ---- the task panel ------------------------------------------------------------------------------------
function TaskPanel({ task, me, tasks, teams, tags, onOpen, onClose }) {
  const [tab, setTab] = useState('comments');
  const [step, setStep] = useState('');
  const [note, setNote] = useState('');
  const [hours, setHours] = useState('');
  const [title, setTitle] = useState(null);
  const fileRef = useRef(null);
  const cl = task.checklist || [];
  const blockers = openBlockers(task, tasks);
  const save = (patch) => saveTask({ id: task.id, ...patch }, me.id);
  const addStep = (e) => { e.preventDefault(); if (!step.trim()) return; save({ checklist: [...cl, { id: 'c' + Date.now().toString(36), text: step.trim(), done: false }] }); setStep(''); };
  const sendNote = (e) => { e.preventDefault(); if (!note.trim()) return; addComment(task.id, me.id, note); setNote(''); };
  const log = (e) => { e.preventDefault(); const h = Number(hours); if (!(h > 0)) return; save({ logged: Math.round(((Number(task.logged) || 0) + h) * 10) / 10 }); toast(`${h} h logged.`); setHours(''); };
  const remove = async () => { if (await confirmDialog({ title: 'Delete this task?', body: `“${task.title}” and its comments go for good.`, confirmLabel: 'Delete', tone: 'danger' })) { removeTask(task.id); toast('Task deleted.'); onClose(); } };
  const discuss = () => { const ch = 'team:' + task.team; send(ch, me.id, `Let’s talk about #${task.id}: ${task.title}`, { task: task.id }); navigate(`/team-chat?ch=${encodeURIComponent(ch)}`); };
  const addFile = (e) => { const file = e.target.files && e.target.files[0]; if (!file) return; save({ files: [...(task.files || []), { name: file.name, size: file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB` }] }); toast(`${file.name} attached.`); e.target.value = ''; };
  const watchingMe = (task.watchers || []).includes(me.id);
  const team = teamBy(task.team, teams);
  return (
    <Dialog open title={`${task.id} · ${TYPES[task.type][0]}`} onClose={onClose} width={900}
      footer={<><button type="button" className="gc-btn gc-btn--flat" onClick={remove}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /> Delete</button><button type="button" className="gc-btn gc-btn--neutral" onClick={discuss}><Icon name="messages-square" width="16" height="16" aria-hidden="true" /> Discuss in {team ? team.name : 'team'} chat</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => { const made = setStatus(task.id, task.status === 'done' ? 'todo' : 'done', me.id); toast(task.status === 'done' ? 'Opened again.' : made ? 'Done — the next one is made.' : 'Done.'); }}>{task.status === 'done' ? 'Open again' : 'Mark done'}</button></>}>
      <div className="tk-panel">
        <div className="tm-form" style={{ minWidth: 0 }}>
          {title != null ? (
            <form onSubmit={(e) => { e.preventDefault(); if (title.trim()) save({ title: title.trim() }); setTitle(null); }} style={{ display: 'flex', gap: 8 }}><input className="gc-input" aria-label="Title" value={title} onChange={(e) => setTitle(e.target.value)} data-autofocus /><button type="submit" className="gc-btn gc-btn--solid">Save</button></form>
          ) : <button type="button" className="gc-btn gc-btn--flat" style={{ height: 'auto', minHeight: 36, padding: 0, justifyContent: 'flex-start', textAlign: 'left', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-heading)' }} onClick={() => setTitle(task.title)} title="Edit title">{task.title}</button>}
          <div className="tk-chips">
            {task.type === 'it' && task.itCat ? <span className="gc-badge gc-badge--info">{task.itCat}</span> : null}
            {task.repeat ? <span className="gc-badge gc-badge--info"><Icon name="repeat" width="12" height="12" aria-hidden="true" /> {task.repeat}</span> : null}
            {(task.tags || []).map((id) => <Tag key={id} id={id} tags={tags} />)}
          </div>
          <div><label className="gc-label" htmlFor="tp-notes">Notes</label><textarea id="tp-notes" className="gc-input" rows={3} style={{ height: 'auto', paddingTop: 10 }} defaultValue={task.notes} onBlur={(e) => { if (e.target.value !== task.notes) { save({ notes: e.target.value }); toast('Notes saved.'); } }} /></div>
          {task.link ? <Link href={task.link.href} className="gc-btn gc-btn--neutral gc-btn--sm" style={{ alignSelf: 'flex-start' }}><Icon name="external-link" width="14" height="14" aria-hidden="true" /> {task.link.label}</Link> : null}
          {blockers.length ? <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', background: 'var(--fill-error-soft)', color: 'var(--text-danger)', fontSize: 'var(--text-sm)' }}><Icon name="lock" width="16" height="16" aria-hidden="true" /><span>Waits for {blockers.map((b, i) => <React.Fragment key={b.id}>{i ? ', ' : ''}<button type="button" className="gc-link" onClick={() => onOpen(b.id)}>{b.id} {b.title}</button> ({statusLabel(b.status).toLowerCase()})</React.Fragment>)}.</span></div> : null}
          <div>
            <span className="gc-label">Checklist {cl.length ? `· ${cl.filter((c) => c.done).length} of ${cl.length}` : ''}</span>
            {cl.length ? <div className="tk-prog" style={{ marginBottom: 6 }}><i style={{ width: `${(cl.filter((c) => c.done).length / cl.length) * 100}%` }} /></div> : null}
            <div className="tk-cl">{cl.map((c) => <label key={c.id}><input type="checkbox" className="gc-check" checked={c.done} onChange={() => toggleCheck(task.id, c.id)} /><span className={c.done ? 'is-done' : ''} style={{ flex: 1 }}>{c.text}</span><button type="button" className="gc-iconbtn" aria-label={`Remove step ${c.text}`} onClick={(e) => { e.preventDefault(); save({ checklist: cl.filter((x) => x.id !== c.id) }); }}><Icon name="x" width="14" height="14" aria-hidden="true" /></button></label>)}</div>
            <form onSubmit={addStep} style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 6 }}><input className="gc-input" aria-label="New step" placeholder="Add a step" value={step} onChange={(e) => setStep(e.target.value)} /><button type="submit" className="gc-btn gc-btn--neutral">Add</button></form>
          </div>
          <div>
            <span className="gc-label">Files</span>
            <div className="tk-chips">{(task.files || []).map((x, i) => <span key={i} className="tk-pick" style={{ paddingLeft: 10, cursor: 'default' }}><Icon name="paperclip" width="12" height="12" aria-hidden="true" />{x.name} <span className="tm-sub" style={{ display: 'inline' }}>{x.size}</span><button type="button" className="gc-iconbtn" style={{ width: 24, height: 24 }} aria-label={`Remove ${x.name}`} onClick={() => save({ files: task.files.filter((_, j) => j !== i) })}><Icon name="x" width="12" height="12" aria-hidden="true" /></button></span>)}
              <input ref={fileRef} type="file" hidden onChange={addFile} /><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => fileRef.current && fileRef.current.click()}><Icon name="upload" width="14" height="14" aria-hidden="true" /> Attach</button></div>
          </div>
          <div>
            <div className="tk-tabs2" role="tablist">{[['comments', `Comments · ${(task.comments || []).length}`], ['history', 'History']].map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} className={'gc-btn gc-btn--sm ' + (tab === k ? 'gc-btn--solid' : 'gc-btn--neutral')} onClick={() => setTab(k)}>{l}</button>)}</div>
            {tab === 'comments' ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>{(task.comments || []).map((c, i) => <div key={i} className="tk-cmt"><UserAvatar id={c.by} size={28} /><div><span className="tm-strong">{userName(c.by)}</span> <span className="tm-sub" style={{ display: 'inline' }}>{formatDate(c.at)} {formatTime(c.at)}</span><p>{c.text}</p></div></div>)}</div>
                <form onSubmit={sendNote} style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}><input className="gc-input" aria-label="Comment" placeholder="Write a comment" value={note} onChange={(e) => setNote(e.target.value)} /><button type="submit" className="gc-btn gc-btn--neutral">Send</button></form>
              </>
            ) : <ul className="tk-hist">{[...(task.history || [])].reverse().map((h, i) => <li key={i}><b>{userName(h.by).split(' ')[0]}</b> · {h.text} · {formatDate(h.at)} {formatTime(h.at)}</li>)}</ul>}
          </div>
        </div>
        <aside className="tk-side" aria-label="Details">
          <div><label className="gc-label" htmlFor="tp-st">Status</label><select id="tp-st" className="gc-input gc-select" value={task.status} onChange={(e) => { const made = setStatus(task.id, e.target.value, me.id); toast(`${statusLabel(e.target.value)}${made ? ' · the next one is made' : ''}.`); }}>{STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <div><label className="gc-label" htmlFor="tp-team">Team</label><select id="tp-team" className="gc-input gc-select" value={task.team} onChange={(e) => save({ team: e.target.value })}>{teams.map((tm) => <option key={tm.id} value={tm.id}>{tm.name}</option>)}</select></div>
          <PeoplePicker id="tp-who" label="Assigned to" value={task.assignees || []} onChange={(v) => save({ assignees: v })} hint={(task.assignees || []).length ? 'Add someone…' : 'Open for the team — take it…'} />
          {!(task.assignees || []).includes(me.id) ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => { save({ assignees: [...(task.assignees || []), me.id] }); toast('It’s yours now.'); }}><Icon name="hand" width="14" height="14" aria-hidden="true" /> Take it</button> : null}
          <div className="tm-two">
            <div><label className="gc-label" htmlFor="tp-start">Start</label><input id="tp-start" type="date" className="gc-input" value={task.start || ''} onChange={(e) => save({ start: e.target.value })} /></div>
            <div><label className="gc-label" htmlFor="tp-due">Due</label><input id="tp-due" type="date" className="gc-input" value={task.due || ''} onChange={(e) => save({ due: e.target.value })} /></div>
          </div>
          <div><label className="gc-label" htmlFor="tp-pri">Priority</label><select id="tp-pri" className="gc-input gc-select" value={task.priority} onChange={(e) => save({ priority: e.target.value })}>{PRIORITIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <div><span className="gc-label">Tags</span><TagPicker value={task.tags || []} onChange={(v) => save({ tags: v })} tags={tags} /></div>
          <div>
            <span className="gc-label">Time · {task.logged || 0} of {task.estimate || '—'} h</span>
            {task.estimate ? <div className="tk-prog"><i style={{ width: `${Math.min(100, ((task.logged || 0) / task.estimate) * 100)}%`, background: (task.logged || 0) > task.estimate ? 'var(--text-danger)' : undefined }} /></div> : null}
            <form onSubmit={log} style={{ display: 'flex', gap: 6, marginTop: 6 }}><input className="gc-input tm-fig" inputMode="decimal" aria-label="Hours to log" placeholder="+ hours" value={hours} onChange={(e) => setHours(e.target.value.replace(/[^\d.]/g, ''))} /><button type="submit" className="gc-btn gc-btn--neutral">Log</button></form>
          </div>
          <div>
            <label className="gc-label" htmlFor="tp-block">Waits for</label>
            <div className="tk-chips" style={{ marginBottom: 6 }}>{(task.blockedBy || []).map((id) => { const b = tasks.find((x) => x.id === id); return <button key={id} type="button" className="tk-pick" style={{ paddingLeft: 10 }} onClick={() => save({ blockedBy: task.blockedBy.filter((x) => x !== id) })} aria-label={`Remove ${id}`}>{id}{b && b.status === 'done' ? ' ✓' : ''}<Icon name="x" width="12" height="12" aria-hidden="true" /></button>; })}</div>
            <select id="tp-block" className="gc-input gc-select" value="" onChange={(e) => e.target.value && save({ blockedBy: [...(task.blockedBy || []), e.target.value] })}><option value="">Add a task it waits for…</option>{tasks.filter((x) => x.id !== task.id && x.status !== 'done' && !(task.blockedBy || []).includes(x.id)).map((x) => <option key={x.id} value={x.id}>{x.id} · {x.title}</option>)}</select>
          </div>
          <div>
            <span className="gc-label">Watchers</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><People ids={task.watchers || []} size={26} /><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => save({ watchers: watchingMe ? task.watchers.filter((x) => x !== me.id) : [...(task.watchers || []), me.id] })}><Icon name={watchingMe ? 'eye-off' : 'eye'} width="14" height="14" aria-hidden="true" /> {watchingMe ? 'Stop watching' : 'Watch'}</button></div>
          </div>
          <span className="tm-sub">Made by {userName(task.by)} on {formatDate(task.at)}{task.doneAt ? ` · done ${formatDate(task.doneAt)}` : ''}</span>
        </aside>
      </div>
    </Dialog>
  );
}

// ---- teams and tags ------------------------------------------------------------------------------------
function Manage({ which, setWhich, teams, tags, tasks, me, onClose }) {
  const [team, setTeam] = useState(null);
  const [tag, setTag] = useState(null);
  const canEdit = roleOf(me).access === '*' || me.role === 'hr' || me.role === 'cto';
  const saveT = (e) => { e.preventDefault(); if (!team.name.trim()) { toast('Name the team', { tone: 'error' }); return; } if (!team.members.length) { toast('Add at least one person', { tone: 'error' }); return; } const row = saveTeam({ ...team, name: team.name.trim(), lead: team.members.includes(team.lead) ? team.lead : team.members[0] }); toast(`${row.name} saved. It has its own chat channel.`); setTeam(null); };
  const saveG = (e) => { e.preventDefault(); if (!tag.name.trim()) { toast('Name the tag', { tone: 'error' }); return; } saveTag({ ...tag, name: tag.name.trim() }); toast(`#${tag.name.trim()} saved.`); setTag(null); };
  return (
    <Dialog open title={team ? (team.id ? `Edit · ${team.name}` : 'New team') : tag ? (tag.id ? `Edit · #${tag.name}` : 'New tag') : 'Teams & tags'} onClose={onClose} width={680}
      footer={team ? <><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setTeam(null)}>Back</button><button type="submit" form="mg-team" className="gc-btn gc-btn--solid">Save team</button></> : tag ? <><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setTag(null)}>Back</button><button type="submit" form="mg-tag" className="gc-btn gc-btn--solid">Save tag</button></> : <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button>}>
      {team ? (
        <form id="mg-team" className="tm-form" onSubmit={saveT}>
          <div className="tm-two">
            <div><label className="gc-label" htmlFor="mg-n">Team name</label><input id="mg-n" className="gc-input" value={team.name} onChange={(e) => setTeam({ ...team, name: e.target.value })} data-autofocus /></div>
            <div><label className="gc-label" htmlFor="mg-tone">Colour</label><select id="mg-tone" className="gc-input gc-select" value={team.tone} onChange={(e) => setTeam({ ...team, tone: e.target.value })}>{TONES.map((t) => <option key={t}>{t}</option>)}</select></div>
          </div>
          <div><label className="gc-label" htmlFor="mg-a">What the team does</label><input id="mg-a" className="gc-input" value={team.about} onChange={(e) => setTeam({ ...team, about: e.target.value })} /></div>
          <PeoplePicker id="mg-m" label="Members" value={team.members} onChange={(v) => setTeam({ ...team, members: v })} />
          <div><label className="gc-label" htmlFor="mg-l">Lead</label><select id="mg-l" className="gc-input gc-select" value={team.lead} onChange={(e) => setTeam({ ...team, lead: e.target.value })}>{team.members.map((u) => <option key={u} value={u}>{userName(u)}</option>)}</select></div>
        </form>
      ) : tag ? (
        <form id="mg-tag" className="tm-form" onSubmit={saveG}>
          <div className="tm-two">
            <div><label className="gc-label" htmlFor="mg-tn">Tag</label><input id="mg-tn" className="gc-input" value={tag.name} onChange={(e) => setTag({ ...tag, name: e.target.value })} data-autofocus /></div>
            <div><label className="gc-label" htmlFor="mg-tt">Colour</label><select id="mg-tt" className="gc-input gc-select" value={tag.tone} onChange={(e) => setTag({ ...tag, tone: e.target.value })}>{TONES.map((t) => <option key={t}>{t}</option>)}</select></div>
          </div>
          <div><span className="gc-label">Looks like</span><Tag id="__p" tags={[{ id: '__p', name: tag.name || 'tag', tone: tag.tone }]} /></div>
        </form>
      ) : (
        <div className="tm-form">
          <div className="gc-seg" role="group" aria-label="Manage"><button type="button" className={'gc-seg__btn' + (which === 'teams' ? ' gc-seg__btn--active' : '')} onClick={() => setWhich('teams')}>Teams · {teams.length}</button><button type="button" className={'gc-seg__btn' + (which === 'tags' ? ' gc-seg__btn--active' : '')} onClick={() => setWhich('tags')}>Tags · {tags.length}</button></div>
          {which === 'teams' ? (
            <div className="tk-mgr">
              {teams.map((t) => { const [bg, fg] = toneBg(t.tone); const n = tasks.filter((x) => x.team === t.id && x.status !== 'done').length; return (
                <div key={t.id}>
                  <span className="tm-tile" style={{ background: bg, color: fg }}><Icon name={t.icon} width="16" height="16" aria-hidden="true" /></span>
                  <span style={{ flex: 1, minWidth: 0 }}><span className="tm-strong">{t.name}</span><span className="tm-sub">Lead {userName(t.lead)} · {n} open task{n === 1 ? '' : 's'} · {t.about}</span></span>
                  <People ids={t.members} size={26} />
                  {canEdit ? <><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setTeam({ ...t })}>Edit</button><button type="button" className="gc-iconbtn" aria-label={`Remove ${t.name}`} onClick={async () => { if (n) { toast(`${t.name} still has ${n} open tasks. Move them first.`, { tone: 'error' }); return; } if (await confirmDialog({ title: `Remove ${t.name}?`, body: 'Its chat channel goes too.', confirmLabel: 'Remove', tone: 'danger' })) { removeTeam(t.id); toast('Team removed.'); } }}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button></> : null}
                </div>
              ); })}
              {canEdit ? <button type="button" className="gc-btn gc-btn--neutral" style={{ alignSelf: 'flex-start' }} onClick={() => setTeam({ name: '', about: '', tone: 'slate', icon: 'users', members: [me.id], lead: me.id })}><Icon name="plus" width="16" height="16" aria-hidden="true" /> New team</button> : <p className="gc-help" style={{ margin: 0 }}>The owner, HR and the CTO can change teams.</p>}
            </div>
          ) : (
            <div className="tk-mgr">
              {tags.map((t) => { const n = tasks.filter((x) => (x.tags || []).includes(t.id)).length; return (
                <div key={t.id}><Tag id={t.id} tags={tags} /><span className="tm-sub" style={{ flex: 1 }}>{n} task{n === 1 ? '' : 's'}</span><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setTag({ ...t })}>Edit</button><button type="button" className="gc-iconbtn" aria-label={`Remove #${t.name}`} onClick={async () => { if (await confirmDialog({ title: `Remove #${t.name}?`, body: `It comes off ${n} task${n === 1 ? '' : 's'}.`, confirmLabel: 'Remove', tone: 'danger' })) { removeTag(t.id); toast('Tag removed.'); } }}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button></div>
              ); })}
              <button type="button" className="gc-btn gc-btn--neutral" style={{ alignSelf: 'flex-start' }} onClick={() => setTag({ name: '', tone: 'info' })}><Icon name="plus" width="16" height="16" aria-hidden="true" /> New tag</button>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}
