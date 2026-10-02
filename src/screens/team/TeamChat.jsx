'use client';
// Team chat (/team-chat?ch=…) — talk between people and teams (src/lib/teamChat.js):
//   #general, #announcements (owner and HR post), a channel per team (lib/tasks.js teams) and direct messages
//   @mentions, #TK-123 task links, reactions, replies, pins, edit / delete your own, search
//   turn a message into a task, ask another team for something (a request task + a message in their channel)
// Side panel: pinned messages, members (start a direct message), the team's open tasks.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { Dialog } from '@/components/ui';
import { formatDate, formatTime } from '@/lib/format';
import { USERS, userBy, roleOf } from '@/lib/team';
import { getTeams, saveTask, teamBy, dayKeyOf, statusLabel, statusTone } from '@/lib/tasks';
import { getMessages, channelsFor, otherTeams, unread, markRead, send, patchMessage, removeMessage, react, demoReply, dmId, REACTIONS, CHAT_EVENT } from '@/lib/teamChat';
import { TeamPage, useMe, useTick, useTasks, UserAvatar, userName } from './teamShared';

const CSS = `
.ch{display:grid;grid-template-columns:270px minmax(0,1fr) 280px;height:calc(100dvh - 210px);min-height:540px;padding:0;overflow:hidden}
.ch.no-side{grid-template-columns:270px minmax(0,1fr)}
.ch-list{display:flex;flex-direction:column;border-right:1px solid var(--border-subtle);min-height:0}
.ch-list__top{padding:var(--space-3);border-bottom:1px solid var(--border-subtle)}
.ch-list__scroll{flex:1;overflow:auto;padding:var(--space-2)}
.ch-list h3{display:flex;align-items:center;justify-content:space-between;margin:var(--space-3) var(--space-2) 4px;font-size:var(--text-2xs);font-weight:var(--weight-semibold);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.ch-item{display:flex;align-items:center;gap:var(--space-2);width:100%;min-height:40px;padding:0 var(--space-2);border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-sm);color:var(--text-body);text-align:left;cursor:pointer}
.ch-item:hover{background:var(--surface-subtle)}
.ch-item[aria-current="true"]{background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-medium)}
.ch-item.is-unread{color:var(--text-heading);font-weight:var(--weight-semibold)}
.ch-item span:nth-child(2){flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ch-badge{min-width:20px;height:20px;padding:0 6px;border-radius:var(--radius-full);background:var(--primary);color:var(--text-on-dark);font-size:var(--text-2xs);font-weight:var(--weight-semibold);display:inline-grid;place-items:center}
.ch-main{display:flex;flex-direction:column;min-width:0;min-height:0}
.ch-head{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.ch-head h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ch-head p{margin:0;font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ch-msgs{flex:1;overflow:auto;padding:var(--space-3) var(--space-4)}
.ch-day{display:flex;align-items:center;gap:var(--space-3);margin:var(--space-3) 0;font-size:var(--text-2xs);font-weight:var(--weight-semibold);color:var(--text-muted)}
.ch-day::before,.ch-day::after{content:'';flex:1;height:1px;background:var(--border-subtle)}
.ch-msg{position:relative;display:flex;gap:var(--space-3);padding:6px var(--space-2);border-radius:var(--radius-md)}
.ch-msg:hover,.ch-msg:focus-within{background:var(--surface-subtle)}
.ch-msg.is-pinned{background:var(--fill-warning-soft)}
.ch-msg.is-cont{padding-top:0}
.ch-msg.is-cont .ch-av{visibility:hidden;height:0}
.ch-body{flex:1;min-width:0}
.ch-who{display:flex;align-items:baseline;gap:var(--space-2);flex-wrap:wrap}
.ch-who b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ch-who small{font-size:var(--text-2xs);color:var(--text-muted)}
.ch-text{margin:2px 0 0;font-size:var(--text-sm);line-height:1.55;color:var(--text-body);white-space:pre-wrap;overflow-wrap:anywhere}
.ch-at{padding:0 3px;border-radius:var(--radius-sm, 4px);background:var(--fill-info-soft);color:var(--text-info);font-weight:var(--weight-medium)}
.ch-at.is-me{background:var(--fill-warning-soft);color:var(--text-warning)}
.ch-tk{padding:0 4px;border:0;border-radius:var(--radius-sm, 4px);background:var(--fill-primary-soft);color:var(--primary);font:inherit;font-family:var(--font-data);font-size:var(--text-xs);font-weight:var(--weight-medium);cursor:pointer}
.ch-quote{margin:2px 0 4px;padding:4px var(--space-2);border-left:3px solid var(--border-strong, var(--border-field));font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ch-card{display:flex;align-items:center;gap:var(--space-2);margin-top:6px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);max-width:460px;text-decoration:none;color:inherit}
.ch-reacts{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}
.ch-react{display:inline-flex;align-items:center;gap:4px;min-height:28px;padding:0 8px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);cursor:pointer}
.ch-react[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.ch-tools{position:absolute;right:var(--space-2);top:-14px;display:none;gap:2px;padding:2px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-sm)}
.ch-msg:hover .ch-tools,.ch-msg:focus-within .ch-tools{display:flex}
.ch-tools button{display:grid;place-items:center;min-width:32px;height:32px;border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-sm);cursor:pointer;color:var(--text-body)}
.ch-tools button:hover{background:var(--surface-subtle)}
.ch-compose{position:relative;padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle)}
.ch-compose__box{display:flex;align-items:flex-end;gap:var(--space-2);padding:var(--space-2);border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-card)}
.ch-compose__box:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px var(--fill-primary-soft)}
.ch-compose textarea{flex:1;min-height:40px;max-height:160px;padding:8px;border:0;outline:0;resize:none;font:inherit;font-size:var(--text-sm);background:none;color:var(--text-heading)}
.ch-replying{display:flex;align-items:center;gap:var(--space-2);margin-bottom:6px;font-size:var(--text-xs);color:var(--text-muted)}
.ch-suggest{position:absolute;left:var(--space-4);bottom:calc(100% - 6px);z-index:5;min-width:240px;padding:4px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-lg)}
.ch-suggest button{display:flex;align-items:center;gap:var(--space-2);width:100%;min-height:36px;padding:0 var(--space-2);border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-sm);text-align:left;cursor:pointer}
.ch-suggest button:hover,.ch-suggest button.is-on{background:var(--surface-subtle)}
.ch-side{display:flex;flex-direction:column;border-left:1px solid var(--border-subtle);min-height:0}
.ch-side__tabs{display:flex;gap:2px;padding:var(--space-2);border-bottom:1px solid var(--border-subtle)}
.ch-side__body{flex:1;overflow:auto;padding:var(--space-3);display:flex;flex-direction:column;gap:var(--space-2)}
.ch-person{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm)}
.ch-person > span:nth-child(2){flex:1;min-width:0}
.ch-dot{width:8px;height:8px;border-radius:var(--radius-full);background:var(--text-success);flex:none}
.ch-back{display:none}
@media (max-width:1200px){.ch{grid-template-columns:240px minmax(0,1fr)}.ch-side{display:none}}
@media (max-width:767px){.ch,.ch.no-side{grid-template-columns:minmax(0,1fr);height:calc(100dvh - 180px)}.ch-list{border-right:0}.ch.is-open .ch-list{display:none}.ch:not(.is-open) .ch-main{display:none}.ch-back{display:grid}}
`;
const sameDay = (a, b) => dayKeyOf(a) === dayKeyOf(b);
const dayText = (t) => { const k = dayKeyOf(t); const today = dayKeyOf(Date.now()); return k === today ? 'Today' : k === dayKeyOf(Date.now() - 864e5) ? 'Yesterday' : formatDate(t); };
const FIRST = Object.fromEntries(USERS.map((u) => [u.name.split(' ')[0].toLowerCase(), u]));

/** Text with @mentions and #TK-123 links. */
function Rich({ text, me, onTask }) {
  const parts = String(text).split(/(@[A-Za-z]+|#TK-\d+)/g);
  return parts.map((p, i) => {
    if (/^@[A-Za-z]+$/.test(p)) { const u = FIRST[p.slice(1).toLowerCase()]; return u ? <span key={i} className={'ch-at' + (u.id === me.id ? ' is-me' : '')} title={`${u.name} · ${roleOf(u).title}`}>@{u.name.split(' ')[0]}</span> : p; }
    if (/^#TK-\d+$/.test(p)) return <button key={i} type="button" className="ch-tk" onClick={() => onTask(p.slice(1))}>{p}</button>;
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

export default function TeamChat() {
  const { me, ready } = useMe();
  const n = useTick([CHAT_EVENT, 'gc:tasks']);
  const { tasks } = useTasks();
  const teams = useMemo(() => getTeams(), [n]); // eslint-disable-line react-hooks/exhaustive-deps
  const msgs = useMemo(() => getMessages(), [n]); // eslint-disable-line react-hooks/exhaustive-deps
  const channels = useMemo(() => channelsFor(me, teams, msgs), [me, teams, msgs]);
  const [ch, setCh] = useState('general');
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [reply, setReply] = useState(null);
  const [edit, setEdit] = useState(null);
  const [side, setSide] = useState('members');
  const [q, setQ] = useState('');
  const [newDm, setNewDm] = useState(false);
  const [toTask, setToTask] = useState(null);
  const [askTeam, setAskTeam] = useState(null);
  const [share, setShare] = useState(false);
  const [sugIdx, setSugIdx] = useState(0);
  const scroller = useRef(null);
  const box = useRef(null);

  useEffect(() => {
    if (!ready) return;
    const want = new URLSearchParams(window.location.search).get('ch');
    if (want) { setCh(want); setOpen(true); }
  }, [ready]);
  const current = channels.find((c) => c.id === ch) || (ch.startsWith('dm:') && ch.split(':').includes(me.id) ? { id: ch, name: userName(ch.split(':').slice(1).find((x) => x !== me.id)), kind: 'dm', icon: 'user', members: ch.split(':').slice(1), other: ch.split(':').slice(1).find((x) => x !== me.id) } : channels[0]);
  const chId = current ? current.id : 'general';
  const here = msgs.filter((m) => m.ch === chId);
  const needle = q.trim().toLowerCase();
  const shown = needle ? here.filter((m) => m.text.toLowerCase().includes(needle) || userName(m.by).toLowerCase().includes(needle)) : here;

  useEffect(() => { if (ready && current) markRead(chId, me.id); }, [ready, chId, here.length, me.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const el = scroller.current; if (el) el.scrollTop = el.scrollHeight; }, [chId, here.length]);

  const go = (id) => { setCh(id); setOpen(true); setReply(null); setEdit(null); setQ(''); const u = new URL(window.location.href); u.searchParams.set('ch', id); window.history.replaceState(window.history.state, '', u.pathname + u.search); };
  const openTask = (id) => navigate(`/tasks?task=${id}`);
  const readOnly = current && current.id === 'announcements' && !['ceo', 'hr'].includes(me.role);

  // @ suggestions
  const word = (text.match(/@([A-Za-z]*)$/) || [])[1];
  const sugg = word != null ? (current ? current.members : []).map(userBy).filter((u) => u && u.id !== me.id && u.name.toLowerCase().startsWith(word.toLowerCase())).slice(0, 6) : [];
  const pickSugg = (u) => { setText(text.replace(/@([A-Za-z]*)$/, `@${u.name.split(' ')[0]} `)); setSugIdx(0); box.current && box.current.focus(); };

  const submit = (e) => {
    if (e) e.preventDefault();
    const t = text.trim();
    if (!t) return;
    if (edit) { patchMessage(edit.id, { text: t, edited: true }); setEdit(null); setText(''); return; }
    const taskRef = (t.match(/#(TK-\d+)/) || [])[1];
    send(chId, me.id, t, { reply: reply ? reply.id : undefined, task: taskRef && tasks.some((x) => x.id === taskRef) ? taskRef : undefined });
    setText(''); setReply(null);
    demoReply(chId, me.id);
  };
  const onKey = (e) => {
    if (sugg.length && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); setSugIdx((i) => (i + (e.key === 'ArrowDown' ? 1 : sugg.length - 1)) % sugg.length); return; }
    if (sugg.length && (e.key === 'Enter' || e.key === 'Tab')) { e.preventDefault(); pickSugg(sugg[sugIdx] || sugg[0]); return; }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
    if (e.key === 'Escape') { setReply(null); setEdit(null); }
  };

  const groups = [
    ['Channels', channels.filter((c) => c.kind === 'channel')],
    ['Teams', channels.filter((c) => c.kind === 'team')],
    ['Direct messages', channels.filter((c) => c.kind === 'dm')],
  ];
  const teamOfCh = current && current.kind === 'team' ? current.team : null;
  const teamTasks = teamOfCh ? tasks.filter((t) => t.team === teamOfCh.id && t.status !== 'done') : [];
  const pins = here.filter((m) => m.pinned);

  return (
    <TeamPage screen="TeamChat" active="team-chat" crumb="General" page="Team chat" title="Team chat" css={CSS}
      about="Talk with your team and the other teams. Mention @someone, link a task with #TK-…, or turn a message into a task."
      actions={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setAskTeam({ team: (otherTeams(me, teams)[0] || teams[0]).id, title: '', notes: '', due: '' })}><Icon name="send" width="18" height="18" aria-hidden="true" /> Ask another team</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => setNewDm(true)}><Icon name="message-square-plus" width="18" height="18" aria-hidden="true" /> New message</button></>}>
      <section className={'gc-card ch' + (open ? ' is-open' : '')}>
        <nav className="ch-list" aria-label="Channels">
          <div className="ch-list__top"><input type="search" className="gc-input" placeholder="Search this chat" aria-label="Search messages" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <div className="ch-list__scroll">
            {groups.map(([label, list]) => (list.length || label === 'Direct messages') ? (
              <div key={label}>
                <h3>{label}{label === 'Direct messages' ? <button type="button" className="gc-iconbtn" style={{ width: 28, height: 28 }} aria-label="New direct message" onClick={() => setNewDm(true)}><Icon name="plus" width="14" height="14" aria-hidden="true" /></button> : null}</h3>
                {list.map((c) => { const u = ready ? unread(c.id, me.id, msgs) : 0; return (
                  <button key={c.id} type="button" className={'ch-item' + (u ? ' is-unread' : '')} aria-current={c.id === chId} onClick={() => go(c.id)}>
                    {c.kind === 'dm' ? <UserAvatar id={c.other} size={24} /> : <Icon name={c.kind === 'channel' ? c.icon : c.icon} width="16" height="16" aria-hidden="true" />}
                    <span>{c.kind === 'channel' ? `# ${c.name}` : c.name}</span>
                    {u ? <span className="ch-badge" aria-label={`${u} unread`}>{u}</span> : null}
                  </button>
                ); })}
                {label === 'Direct messages' && !list.length ? <p className="tm-sub" style={{ padding: '0 var(--space-2)' }}>No direct messages yet.</p> : null}
              </div>
            ) : null)}
          </div>
        </nav>

        <div className="ch-main">
          {current ? (
            <>
              <header className="ch-head">
                <button type="button" className="gc-iconbtn ch-back" aria-label="Back to channels" onClick={() => setOpen(false)}><Icon name="arrow-left" width="18" height="18" aria-hidden="true" /></button>
                {current.kind === 'dm' ? <UserAvatar id={current.other} size={34} /> : <span className="tm-tile"><Icon name={current.icon} width="16" height="16" aria-hidden="true" /></span>}
                <div style={{ minWidth: 0, flex: 1 }}><h2>{current.kind === 'channel' ? `# ${current.name}` : current.name}</h2><p>{current.kind === 'dm' ? roleOf(userBy(current.other)).title : `${current.members.length} people · ${current.about || ''}`}</p></div>
                {pins.length ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setSide('pins')}><Icon name="pin" width="14" height="14" aria-hidden="true" /> {pins.length}</button> : null}
                {teamOfCh ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setSide('tasks')}><Icon name="list-checks" width="14" height="14" aria-hidden="true" /> {teamTasks.length} tasks</button> : null}
              </header>
              <div className="ch-msgs" ref={scroller} aria-live="polite">
                {!shown.length ? <p className="tm-sub" style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>{needle ? 'No messages match.' : current.kind === 'dm' ? `This is the start of your messages with ${current.name}.` : 'No messages yet — say hello.'}</p> : null}
                {shown.map((m, i) => {
                  const prev = shown[i - 1];
                  const newDay = !prev || !sameDay(prev.at, m.at);
                  const cont = prev && !newDay && prev.by === m.by && m.at - prev.at < 5 * 60e3 && !m.reply;
                  const quoted = m.reply ? here.find((x) => x.id === m.reply) : null;
                  const tk = m.task ? tasks.find((x) => x.id === m.task) : null;
                  const mine = m.by === me.id;
                  return (
                    <React.Fragment key={m.id}>
                      {newDay ? <div className="ch-day">{dayText(m.at)}</div> : null}
                      <div className={'ch-msg' + (cont ? ' is-cont' : '') + (m.pinned ? ' is-pinned' : '')} tabIndex={-1}>
                        <span className="ch-av"><UserAvatar id={m.by} size={34} /></span>
                        <div className="ch-body">
                          {!cont ? <div className="ch-who"><b>{userName(m.by)}</b><small>{roleOf(userBy(m.by)).title} · {formatTime(m.at)}{m.edited ? ' · edited' : ''}{m.pinned ? ' · pinned' : ''}</small></div> : null}
                          {quoted ? <div className="ch-quote">↪ {userName(quoted.by).split(' ')[0]}: {quoted.text}</div> : null}
                          <p className="ch-text"><Rich text={m.text} me={me} onTask={openTask} /></p>
                          {tk ? <Link href={`/tasks?task=${tk.id}`} className="ch-card"><Icon name="square-check" width="16" height="16" aria-hidden="true" style={{ color: 'var(--primary)' }} /><span style={{ flex: 1, minWidth: 0 }}><span className="tm-strong">{tk.title}</span><span className="tm-sub">{tk.id} · {(teamBy(tk.team, teams) || {}).name} · {tk.assignees.map((x) => userName(x).split(' ')[0]).join(', ') || 'not taken'}</span></span><span className={'gc-badge gc-badge--' + statusTone(tk.status)}>{statusLabel(tk.status)}</span></Link> : null}
                          {Object.entries(m.reactions || {}).filter(([, who]) => who.length).length ? <div className="ch-reacts">{Object.entries(m.reactions).filter(([, who]) => who.length).map(([e, who]) => <button key={e} type="button" className="ch-react" aria-pressed={who.includes(me.id)} title={who.map((x) => userName(x).split(' ')[0]).join(', ')} onClick={() => react(m.id, e, me.id)}>{e} {who.length}</button>)}</div> : null}
                        </div>
                        <div className="ch-tools" role="toolbar" aria-label="Message actions">
                          {REACTIONS.slice(0, 3).map((e) => <button key={e} type="button" aria-label={`React ${e}`} onClick={() => react(m.id, e, me.id)}>{e}</button>)}
                          <button type="button" aria-label="Reply" title="Reply" onClick={() => { setReply(m); box.current && box.current.focus(); }}><Icon name="reply" width="16" height="16" aria-hidden="true" /></button>
                          <button type="button" aria-label="Make a task" title="Make a task" onClick={() => setToTask({ title: m.text.replace(/\s+/g, ' ').slice(0, 80), notes: `From ${userName(m.by)} in ${current.kind === 'channel' ? '#' + current.name : current.name}: “${m.text}”`, team: teamOfCh ? teamOfCh.id : 'mgmt', assignee: m.by === me.id ? me.id : m.by, due: '', msg: m.id })}><Icon name="list-plus" width="16" height="16" aria-hidden="true" /></button>
                          <button type="button" aria-label={m.pinned ? 'Unpin' : 'Pin'} title={m.pinned ? 'Unpin' : 'Pin'} onClick={() => { patchMessage(m.id, { pinned: !m.pinned }); toast(m.pinned ? 'Unpinned.' : 'Pinned to the channel.'); }}><Icon name={m.pinned ? 'pin-off' : 'pin'} width="16" height="16" aria-hidden="true" /></button>
                          {mine ? <button type="button" aria-label="Edit" title="Edit" onClick={() => { setEdit(m); setText(m.text); box.current && box.current.focus(); }}><Icon name="pencil" width="16" height="16" aria-hidden="true" /></button> : null}
                          {mine || me.role === 'ceo' ? <button type="button" aria-label="Delete" title="Delete" onClick={async () => { if (await confirmDialog({ title: 'Delete this message?', body: 'It goes for everyone.', confirmLabel: 'Delete', tone: 'danger' })) removeMessage(m.id); }}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button> : null}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
              <form className="ch-compose" onSubmit={submit}>
                {sugg.length ? <div className="ch-suggest" role="listbox" aria-label="Mention someone">{sugg.map((u, i) => <button key={u.id} type="button" role="option" aria-selected={i === sugIdx} className={i === sugIdx ? 'is-on' : ''} onMouseDown={(e) => { e.preventDefault(); pickSugg(u); }}><UserAvatar id={u.id} size={24} /><span>{u.name}<span className="tm-sub">{roleOf(u).title}</span></span></button>)}</div> : null}
                {reply || edit ? <div className="ch-replying"><Icon name={edit ? 'pencil' : 'reply'} width="14" height="14" aria-hidden="true" /><span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{edit ? 'Editing your message' : `Replying to ${userName(reply.by)}: ${reply.text}`}</span><button type="button" className="gc-btn gc-btn--flat gc-btn--sm" onClick={() => { setReply(null); if (edit) { setEdit(null); setText(''); } }}>Cancel</button></div> : null}
                {readOnly ? <p className="tm-sub" style={{ margin: 0, textAlign: 'center', padding: 'var(--space-2)' }}>Only the owner and HR post in #announcements. React to show you’ve read it.</p> : (
                  <div className="ch-compose__box">
                    <button type="button" className="gc-iconbtn" aria-label="Share a task" title="Share a task" onClick={() => setShare(true)}><Icon name="square-check" width="18" height="18" aria-hidden="true" /></button>
                    <textarea ref={box} rows={1} aria-label={`Message ${current.kind === 'channel' ? '#' + current.name : current.name}`} placeholder={`Message ${current.kind === 'channel' ? '#' + current.name : current.name.split(' ')[0]}`} title="@ to mention someone, #TK-123 to link a task. Enter sends, Shift+Enter for a new line." value={text} onChange={(e) => { setText(e.target.value); setSugIdx(0); }} onKeyDown={onKey} />
                    <button type="submit" className="gc-btn gc-btn--solid gc-btn--sm" disabled={!text.trim()} aria-label="Send"><Icon name="send" width="16" height="16" aria-hidden="true" /></button>
                  </div>
                )}
              </form>
            </>
          ) : null}
        </div>

        <aside className="ch-side" aria-label="About this chat">
          <div className="ch-side__tabs" role="tablist">
            {[['members', 'People'], ['pins', `Pinned · ${pins.length}`], ...(teamOfCh ? [['tasks', 'Tasks']] : [])].map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={side === k} className={'gc-btn gc-btn--sm ' + (side === k ? 'gc-btn--solid' : 'gc-btn--flat')} onClick={() => setSide(k)}>{l}</button>)}
          </div>
          <div className="ch-side__body">
            {side === 'members' && current ? current.members.map(userBy).filter(Boolean).map((u) => (
              <div key={u.id} className="ch-person"><UserAvatar id={u.id} size={30} /><span><span className="tm-strong">{u.name}{teamOfCh && teamOfCh.lead === u.id ? ' · lead' : ''}</span><span className="tm-sub">{roleOf(u).title}</span></span>{u.id !== me.id ? <button type="button" className="gc-iconbtn" aria-label={`Message ${u.name}`} onClick={() => go(dmId(me.id, u.id))}><Icon name="message-circle" width="16" height="16" aria-hidden="true" /></button> : <span className="ch-dot" aria-label="You" />}</div>
            )) : null}
            {side === 'pins' ? (pins.length ? pins.map((m) => <div key={m.id} className="ch-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}><span className="tm-sub">{userName(m.by)} · {formatDate(m.at)}</span><span style={{ fontSize: 'var(--text-sm)' }}>{m.text}</span></div>) : <p className="tm-sub" style={{ margin: 0 }}>Nothing pinned. Hover a message and press the pin.</p>) : null}
            {side === 'tasks' && teamOfCh ? (
              <>
                {teamTasks.slice(0, 12).map((t) => <Link key={t.id} href={`/tasks?task=${t.id}`} className="ch-card" style={{ maxWidth: 'none' }}><span style={{ flex: 1, minWidth: 0 }}><span className="tm-strong">{t.title}</span><span className="tm-sub">{t.id} · {t.assignees.map((x) => userName(x).split(' ')[0]).join(', ') || 'not taken'}{t.due ? ` · ${formatDate(new Date(t.due + 'T00:00:00').getTime())}` : ''}</span></span></Link>)}
                <Link href={`/tasks?scope=all&new=1`} className="gc-btn gc-btn--sm gc-btn--neutral">New task</Link>
              </>
            ) : null}
          </div>
        </aside>
      </section>

      <Dialog open={newDm} title="New direct message" onClose={() => setNewDm(false)} width={480} footer={null}>
        <div className="tm-form">{USERS.filter((u) => u.id !== me.id).map((u) => <button key={u.id} type="button" className="ch-item" onClick={() => { setNewDm(false); go(dmId(me.id, u.id)); }}><UserAvatar id={u.id} size={28} /><span>{u.name}<span className="tm-sub">{roleOf(u).title}</span></span></button>)}</div>
      </Dialog>
      <Dialog open={share} title="Share a task" onClose={() => setShare(false)} width={560} footer={null}>
        <div className="tm-form" style={{ maxHeight: 420, overflow: 'auto' }}>{tasks.filter((t) => t.status !== 'done').map((t) => <button key={t.id} type="button" className="ch-item" style={{ minHeight: 48 }} onClick={() => { setText((x) => `${x}${x && !x.endsWith(' ') ? ' ' : ''}#${t.id} `); setShare(false); box.current && box.current.focus(); }}><span className="tm-fig tm-sub" style={{ width: 60 }}>{t.id}</span><span>{t.title}<span className="tm-sub">{(teamBy(t.team, teams) || {}).name} · {statusLabel(t.status)}</span></span></button>)}</div>
      </Dialog>
      <Dialog open={!!toTask} title="Make a task from this message" onClose={() => setToTask(null)} width={560}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setToTask(null)}>Cancel</button><button type="submit" form="ch-task" className="gc-btn gc-btn--solid">Make task</button></>}>
        {toTask ? (
          <form id="ch-task" className="tm-form" onSubmit={(e) => { e.preventDefault(); if (!toTask.title.trim()) return; const t = saveTask({ title: toTask.title.trim(), notes: toTask.notes, team: toTask.team, assignees: toTask.assignee ? [toTask.assignee] : [], by: me.id, due: toTask.due, watchers: [me.id] }, me.id); send(chId, me.id, `Made a task from this: #${t.id}`, { task: t.id, reply: toTask.msg }); toast(`${t.id} added.`); setToTask(null); }}>
            <div><label className="gc-label" htmlFor="tt-t">Task</label><input id="tt-t" className="gc-input" value={toTask.title} onChange={(e) => setToTask({ ...toTask, title: e.target.value })} data-autofocus /></div>
            <div className="tm-three">
              <div><label className="gc-label" htmlFor="tt-team">Team</label><select id="tt-team" className="gc-input gc-select" value={toTask.team} onChange={(e) => setToTask({ ...toTask, team: e.target.value })}>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
              <div><label className="gc-label" htmlFor="tt-who">For</label><select id="tt-who" className="gc-input gc-select" value={toTask.assignee} onChange={(e) => setToTask({ ...toTask, assignee: e.target.value })}><option value="">Anyone in the team</option>{USERS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
              <div><label className="gc-label" htmlFor="tt-due">Due</label><input id="tt-due" type="date" className="gc-input" value={toTask.due} onChange={(e) => setToTask({ ...toTask, due: e.target.value })} /></div>
            </div>
          </form>
        ) : null}
      </Dialog>
      <Dialog open={!!askTeam} title="Ask another team" onClose={() => setAskTeam(null)} width={560}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setAskTeam(null)}>Cancel</button><button type="submit" form="ch-ask" className="gc-btn gc-btn--solid">Send request</button></>}>
        {askTeam ? (
          <form id="ch-ask" className="tm-form" onSubmit={(e) => { e.preventDefault(); if (!askTeam.title.trim()) { toast('Say what you need', { tone: 'error' }); return; } const tm = teamBy(askTeam.team, teams); const t = saveTask({ title: askTeam.title.trim(), type: 'request', team: tm.id, assignees: [], by: me.id, due: askTeam.due, notes: askTeam.notes, watchers: [me.id] }, me.id); send('team:' + tm.id, me.id, `Request for ${tm.name} from ${userName(me.id).split(' ')[0]}: #${t.id} ${t.title}${askTeam.due ? ` (by ${formatDate(new Date(askTeam.due + 'T00:00:00').getTime())})` : ''}`, { task: t.id }); toast(`Sent to ${tm.name}. Anyone there can take it; you follow it under Watching.`); setAskTeam(null); }}>
            <div><label className="gc-label" htmlFor="at-team">Team</label><select id="at-team" className="gc-input gc-select" value={askTeam.team} onChange={(e) => setAskTeam({ ...askTeam, team: e.target.value })}>{teams.map((t) => <option key={t.id} value={t.id}>{t.name} · lead {userName(t.lead).split(' ')[0]}</option>)}</select></div>
            <div><label className="gc-label" htmlFor="at-t">What do you need?</label><input id="at-t" className="gc-input" value={askTeam.title} onChange={(e) => setAskTeam({ ...askTeam, title: e.target.value })} placeholder="e.g. 12 product photos of the new sarees" data-autofocus /></div>
            <div className="tm-two">
              <div><label className="gc-label" htmlFor="at-due">Needed by</label><input id="at-due" type="date" className="gc-input" value={askTeam.due} onChange={(e) => setAskTeam({ ...askTeam, due: e.target.value })} /></div>
              <div />
            </div>
            <div><label className="gc-label" htmlFor="at-n">Details</label><textarea id="at-n" className="gc-input" rows={3} style={{ height: 'auto', paddingTop: 10 }} value={askTeam.notes} onChange={(e) => setAskTeam({ ...askTeam, notes: e.target.value })} /></div>
            <p className="gc-help" style={{ margin: 0 }}>It goes to the team’s chat and their task list as a request.</p>
          </form>
        ) : null}
      </Dialog>
    </TeamPage>
  );
}
