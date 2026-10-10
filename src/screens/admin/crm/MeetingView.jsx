'use client';
// Meeting (/admin/meetings/view?id=MT-1003, menu: Sales & CRM › Meetings) — one meeting's page. Main column: the
// outcome (a form once the meeting has started: outcome, notes, an optional follow-up task), the notes, the AI summary
// with action items (each one can become a task in /admin/tasks), and the follow-up tasks. Side column: details,
// participants, agenda, reminders, attachments (names only, demo) and the history. Header: join or record the
// outcome; copy link, reschedule, mark missed and cancel (with a reason). Data: lib/admin/meetings + lib/admin/tasks.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState, StatusBadge } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { useAdminStore } from '@/lib/admin/store';
import { staff as currentStaff } from '@/lib/platform/store';
import { DAY, dm, hm, ago } from '@/lib/platform/util';
import {
  meetingsStore, meetingById, OUTCOMES, REMINDERS, OFFICE, typeOf, providerOf, whoOf, isOpen, needsOutcome, nextReminder,
  markMissed, saveNotes, completeMeeting, generateSummary, actionToTask, addFollowUpTask, addAttachment, removeAttachment, setReminders,
} from '@/lib/admin/meetings';
import { tasksStore, allTasks, statusOf, dayKey, fromKey, people as taskPeople } from '@/lib/admin/tasks';
import { AdminShell } from '../AdminShell';
import { MEET_CSS, MeetBadges, Dot, RescheduleSheet, CancelSheet, joinMeeting, copyLink, whenText, dayLabel } from './meetShared';

const VIEW_CSS = `
.mv-card{display:flex;flex-direction:column;gap:var(--space-3)}
.mv-items{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.mv-items li{display:flex;align-items:center;gap:var(--space-3);min-height:48px;padding:6px 0;border-top:1px solid var(--border-subtle)}
.mv-items li:first-child{border-top:0}
.mv-items li>span{flex:1;min-width:0}
.mv-items b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.mv-items small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.mv-ai{padding:var(--space-3);border-radius:var(--radius-lg);background:var(--fill-primary-soft);font-size:var(--text-sm);color:var(--text-body);line-height:1.6}
.mv-files{display:flex;flex-direction:column;gap:4px;margin:0;padding:0;list-style:none}
.mv-files li{display:flex;align-items:center;gap:var(--space-2);min-height:36px;font-size:var(--text-sm)}
.mv-files li span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mv-h{margin:0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-body)}
.mv-out{display:flex;align-items:flex-start;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-heading)}
.mv-out>svg{flex:none;margin-top:2px;color:var(--text-success)}
@media (max-width:640px){.mv-items li{flex-wrap:wrap}}
`;

function Card({ title, extra, id, children }) {
  return (
    <section className="ix-card" id={id} aria-label={title}>
      <div className="ix-card__head"><h2>{title}</h2>{extra || null}</div>
      <div className="ix-card__body mv-card">{children}</div>
    </section>
  );
}

export default function MeetingView() {
  const router = useRouter();
  const { data, t, live } = useAdminStore(meetingsStore);
  const { data: tdata } = useAdminStore(tasksStore);
  const me = live ? currentStaff().name : 'Mahin Khan';
  const [id, setId] = useState(null);
  const [act, setAct] = useState('');
  const [out, setOut] = useState({ outcome: '', notes: '', fu: false, title: '', owner: '', due: '', err: '' });
  const [notes, setNotes] = useState(null);       // the notes being edited (null = not touched)
  const [fu, setFu] = useState({ title: '', owner: '', due: '', err: '' });
  const fileRef = useRef(null);

  useEffect(() => { try { setId(new URLSearchParams(window.location.search).get('id') || ''); } catch { setId(''); } }, []);
  const m = live && id ? meetingById(id) : null;
  useEffect(() => {
    if (!m) return;
    setOut((o) => ({ ...o, notes: o.notes || m.notes || '', owner: o.owner || m.host, due: o.due || dayKey(Math.max(m.at, t) + 2 * DAY) }));
    setFu((f) => ({ ...f, owner: f.owner || m.host, due: f.due || dayKey(Math.max(m.at, t) + 2 * DAY) }));
    if (window.location.hash === '#outcome') setTimeout(() => { const el = document.getElementById('outcome'); if (el) el.scrollIntoView({ block: 'start' }); }, 50);
  }, [m && m.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const shell = (title, body) => (
    <AdminShell active="meetings" title={title}>
      <style dangerouslySetInnerHTML={{ __html: MEET_CSS + VIEW_CSS }} />
      <div className="ix-page">{body}</div>
    </AdminShell>
  );
  if (!live || id == null) return shell('Meeting', <div aria-busy="true" aria-label="Loading the meeting" className="ix-page"><div className="mt-skel mt-skel--sm" /><div className="ix-record"><div className="mt-skel" /><div className="mt-skel" /></div></div>);
  if (!m) {
    return shell('Meeting', (<>
      <RecordHeader back="/admin/meetings" backLabel="Back to meetings" title="Meeting" />
      <section className="ix-card"><div className="ix-empty"><EmptyState icon="calendar-x" title={id ? `Meeting ${id} is not in the list.` : 'No meeting chosen.'} actionLabel="Back to meetings" onAction={() => router.push('/admin/meetings')} /></div></section>
    </>));
  }

  const who = whoOf(m);
  const p = providerOf(m.provider);
  const open = isOpen(m);
  const started = m.at <= t;
  const late = needsOutcome(m, t);
  const peopleList = taskPeople();
  const tasks = allTasks().filter((x) => (m.tasks || []).includes(x.id) || (x.related && x.related.kind === 'meeting' && x.related.id === m.id));
  void tdata;

  const missed = async () => {
    if (!(await confirmDialog({ title: 'Mark this meeting missed?', body: `${m.title} shows as Missed. You can book a new time after.`, confirmLabel: 'Mark missed' }))) return;
    const r = markMissed(m.id, me);
    if (r.ok) toast('Marked missed'); else toast(r.error, { tone: 'error' });
  };
  const saveOutcome = () => {
    const r = completeMeeting(m.id, { outcome: out.outcome, notes: out.notes, followUp: out.fu ? { title: out.title, owner: out.owner, due: out.due } : null }, me);
    if (!r.ok) { setOut({ ...out, err: r.error }); return; }
    toast(`Outcome saved · AI summary written${out.fu && out.title.trim() ? ' · follow-up task made' : ''}`);
    setOut({ ...out, err: '', fu: false, title: '' }); setNotes(null);
  };
  const keepNotes = () => {
    const r = saveNotes(m.id, notes == null ? m.notes : notes, me);
    if (r.ok) { toast('Notes saved'); setNotes(null); } else toast(r.error, { tone: 'error' });
  };
  const summary = () => {
    if (notes != null && notes !== m.notes) saveNotes(m.id, notes, me);
    const r = generateSummary(m.id, me);
    if (r.ok) { toast('AI summary written (demo)'); setNotes(null); } else toast(r.error, { tone: 'error' });
  };
  const makeTask = (item) => {
    const r = actionToTask(m.id, item.id, me);
    if (r.ok) toast(`Task ${r.task.id} made for ${item.owner}`); else toast(r.error, { tone: 'error' });
  };
  const addFu = () => {
    const r = addFollowUpTask(m.id, { title: fu.title, owner: fu.owner, due: fu.due }, me);
    if (!r.ok) { setFu({ ...fu, err: r.error }); return; }
    toast(`Task ${r.task.id} made for ${fu.owner}`);
    setFu({ ...fu, title: '', err: '' });
  };
  const attach = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const r = addAttachment(m.id, file.name, me);
    if (r.ok) toast(`${file.name} attached (name only, demo)`); else toast(r.error, { tone: 'error' });
    e.target.value = '';
  };
  const toggleRem = (v) => {
    const list = (m.reminders || []).includes(v) ? m.reminders.filter((x) => x !== v) : [...(m.reminders || []), v];
    const r = setReminders(m.id, list, me);
    if (r.ok) toast(list.length ? 'Reminders updated' : 'Reminders off');
  };

  const more = [
    ...(open ? [{ label: 'Reschedule', icon: 'calendar-clock', onClick: () => setAct('move') }] : []),
    ...(open && started ? [{ label: 'Mark missed', icon: 'user-x', onClick: missed }] : []),
    ...(open ? [{ label: 'Cancel meeting', icon: 'calendar-x', tone: 'danger', onClick: () => setAct('cancel') }] : []),
    { label: 'All meetings', icon: 'calendar', href: '/admin/meetings' },
  ];
  const primary = late || (open && started)
    ? { label: 'Record outcome', icon: 'notebook-pen', onClick: () => { const el = document.getElementById('outcome'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }
    : open ? { label: m.link ? 'Join' : m.provider === 'phone' ? 'Call' : 'Directions', icon: p.icon, onClick: () => joinMeeting(m) } : null;
  const nr = nextReminder(m, t);
  const editing = notes != null;

  return shell(m.title, (<>
    <RecordHeader back="/admin/meetings" backLabel="Back to meetings" title={m.title}
      about="One meeting: record the outcome once it has started (with an optional follow-up task), keep notes, and turn the AI summary's action items into tasks. Reschedule, mark missed or cancel with a reason from More."
      badges={<MeetBadges m={m} t={t} />}
      meta={<><span className="mt-data">#{m.id}</span> · {whenText(m)} · {p.label}</>}
      secondary={m.link ? [{ label: 'Copy link', icon: 'copy', onClick: () => copyLink(m) }] : []}
      more={more} primary={primary} />

    <div className="ix-record">
      <div className="ix-page">
        {m.status === 'completed' ? (
          <Card title="Outcome" id="outcome" extra={<StatusBadge tone="success">Completed</StatusBadge>}>
            <div className="mv-out"><Icon name="circle-check" width="16" height="16" aria-hidden="true" /><span>{m.outcome}<small className="mt-help" style={{ display: 'block' }}>Recorded {ago(m.outcomeAt, t)}</small></span></div>
          </Card>
        ) : m.status === 'cancelled' ? (
          <Card title="Cancelled" id="outcome"><p className="mt-help" style={{ fontSize: 'var(--text-sm)' }}>{m.cancelReason || 'No reason given.'}</p></Card>
        ) : m.status === 'missed' ? (
          <Card title="Missed" id="outcome" extra={<StatusBadge tone="error">Missed</StatusBadge>}>
            <p className="mt-help" style={{ fontSize: 'var(--text-sm)' }}>{who.kind === 'none' ? 'The meeting did not happen.' : `${who.name} did not join.`} Book a new time from Meetings.</p>
            <span><Link href={`/admin/meetings?new=1&type=followup${m.merchantId ? '&merchant=' + m.merchantId : m.leadName ? '&lead=' + encodeURIComponent(m.leadName) : ''}`} className="ix-btn"><Icon name="calendar-plus" width="16" height="16" aria-hidden="true" /><span>Book a new time</span></Link></span>
          </Card>
        ) : started ? (
          <Card title="Record the outcome" id="outcome" extra={late ? <StatusBadge tone="warning" icon="clock-alert">Needs outcome</StatusBadge> : null}>
            <div className="mt-form">
              <div><label className="gc-label" htmlFor="mv-out">Outcome *</label>
                <select id="mv-out" className="gc-input gc-select" value={out.outcome} onChange={(e) => setOut({ ...out, outcome: e.target.value, err: '' })} aria-required="true">
                  <option value="">Choose the outcome</option>{OUTCOMES.map((o) => <option key={o}>{o}</option>)}
                </select></div>
              <div><label className="gc-label" htmlFor="mv-onotes">Notes</label><textarea id="mv-onotes" className="gc-input" value={out.notes} onChange={(e) => setOut({ ...out, notes: e.target.value })} placeholder="What they want, what was agreed, what you promised" /></div>
              <label className="mt-chk"><input type="checkbox" className="gc-check" checked={out.fu} onChange={(e) => setOut({ ...out, fu: e.target.checked })} />Make a follow-up task</label>
              {out.fu ? (
                <div className="mt-three">
                  <div style={{ gridColumn: 'span 1' }}><label className="gc-label" htmlFor="mv-ft">Task</label><input id="mv-ft" className="gc-input" value={out.title} onChange={(e) => setOut({ ...out, title: e.target.value })} placeholder="Send the proposal" /></div>
                  <div><label className="gc-label" htmlFor="mv-fo">For</label><select id="mv-fo" className="gc-input gc-select" value={out.owner} onChange={(e) => setOut({ ...out, owner: e.target.value })}>{peopleList.map((x) => <option key={x.name}>{x.name}</option>)}</select></div>
                  <div><label className="gc-label" htmlFor="mv-fd">Due</label><input id="mv-fd" className="gc-input" type="date" value={out.due} onChange={(e) => setOut({ ...out, due: e.target.value })} /></div>
                </div>
              ) : null}
              {out.err ? <p className="mt-err" role="alert">{out.err}</p> : null}
              <span><button type="button" className="ix-btn ix-btn--primary" onClick={saveOutcome}>Save outcome</button></span>
            </div>
          </Card>
        ) : null}

        <Card title="Notes" extra={editing ? <span className="ix-tools"><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setNotes(null)}>Discard</button><button type="button" className="ix-btn ix-btn--sm" onClick={keepNotes}>Save</button></span> : null}>
          <div className="mt-form">
            <textarea className="gc-input" aria-label="Meeting notes" rows={5} value={editing ? notes : m.notes || ''} onChange={(e) => setNotes(e.target.value)} placeholder={started ? 'What was said and agreed' : 'Prep notes: what to show, what to ask'} />
          </div>
        </Card>

        <Card title="AI summary" extra={m.ai ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={summary}><Icon name="sparkles" width="14" height="14" aria-hidden="true" /><span>Write again</span></button> : null}>
          {m.ai ? (<>
            <p className="mv-ai">{m.ai.summary}</p>
            <h3 className="mv-h">Action items</h3>
            <ul className="mv-items">
              {m.ai.items.map((x) => (
                <li key={x.id}>
                  <Dot name={x.owner} size={28} />
                  <span><b>{x.text}</b><small>{x.owner} · due {dayLabel(fromKey(x.due), t)}</small></span>
                  {x.taskId ? <Link href={`/admin/tasks?task=${x.taskId}`} className="ix-btn ix-btn--sm"><Icon name="square-check" width="14" height="14" aria-hidden="true" /><span>{x.taskId}</span></Link>
                    : <button type="button" className="ix-btn ix-btn--sm" onClick={() => makeTask(x)}><Icon name="plus" width="14" height="14" aria-hidden="true" /><span>Make task</span></button>}
                </li>
              ))}
            </ul>
          </>) : (
            <div className="mt-form">
              <p className="mt-help" style={{ fontSize: 'var(--text-sm)' }}>No summary yet. It is written from the notes when you record the outcome.</p>
              <span><button type="button" className="ix-btn" onClick={summary}><Icon name="sparkles" width="16" height="16" aria-hidden="true" /><span>Write AI summary</span></button></span>
            </div>
          )}
        </Card>

        <Card title="Follow-up tasks" extra={<small className="mt-help">{tasks.length}</small>}>
          {tasks.length ? (
            <ul className="mv-items">
              {tasks.map((x) => (
                <li key={x.id}>
                  <Dot name={(x.assignees || [])[0] || '?'} size={28} />
                  <span><b>{x.title}</b><small><span className="mt-data">{x.id}</span> · {(x.assignees || []).join(', ') || 'Unassigned'}{x.due ? ` · due ${dayLabel(fromKey(x.due), t)}` : ''}</small></span>
                  <StatusBadge tone={statusOf(x.status).tone}>{statusOf(x.status).label}</StatusBadge>
                  <Link href={`/admin/tasks?task=${x.id}`} className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Open task ${x.id}`}><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></Link>
                </li>
              ))}
            </ul>
          ) : <p className="mt-help" style={{ fontSize: 'var(--text-sm)' }}>No tasks from this meeting yet.</p>}
          {m.status !== 'cancelled' ? (
            <div className="mt-form">
              <div className="mt-three">
                <div><label className="gc-label" htmlFor="mv-nt">New task</label><input id="mv-nt" className="gc-input" value={fu.title} onChange={(e) => setFu({ ...fu, title: e.target.value, err: '' })} placeholder="What needs doing" onKeyDown={(e) => { if (e.key === 'Enter') addFu(); }} /></div>
                <div><label className="gc-label" htmlFor="mv-no">For</label><select id="mv-no" className="gc-input gc-select" value={fu.owner} onChange={(e) => setFu({ ...fu, owner: e.target.value })}>{peopleList.map((x) => <option key={x.name}>{x.name}</option>)}</select></div>
                <div><label className="gc-label" htmlFor="mv-nd">Due</label><input id="mv-nd" className="gc-input" type="date" value={fu.due} onChange={(e) => setFu({ ...fu, due: e.target.value })} /></div>
              </div>
              {fu.err ? <p className="mt-err" role="alert">{fu.err}</p> : null}
              <span><button type="button" className="ix-btn" onClick={addFu}><Icon name="plus" width="16" height="16" aria-hidden="true" /><span>Add task</span></button></span>
            </div>
          ) : null}
        </Card>
      </div>

      <div className="ix-page">
        <Card title="Details">
          <KV rows={[
            ['Type', typeOf(m.type).label],
            ['When', `${dayLabel(m.at, t)} · ${hm(m.at)}`],
            ['Duration', `${m.mins} min`],
            ['Where', m.provider === 'office' ? OFFICE : p.label],
            who.kind !== 'none' ? [who.kind === 'merchant' ? 'Merchant' : 'Lead', who.href ? <Link key="w" href={who.href}>{who.name}{who.kind === 'merchant' ? ` #${who.id}` : ''}</Link> : who.name] : null,
            who.kind === 'lead' && who.id ? ['Lead ID', <span key="l" className="mt-data">{who.id}</span>] : null,
            ['Runs it', m.host],
            (m.staff || []).length ? ['Also joining', m.staff.join(', ')] : null,
            (m.moves || []).length ? ['Moved', `${m.moves.length}× · was ${dm(m.moves[m.moves.length - 1].from)} ${hm(m.moves[m.moves.length - 1].from)}`] : null,
          ]} />
          {m.link ? <div className="mt-link"><span>{m.link}</span><button type="button" className="ix-btn ix-btn--sm" onClick={() => copyLink(m)}>Copy</button></div> : null}
        </Card>

        <Card title="Participants" extra={<small className="mt-help">{(m.participants || []).length + 1 + (m.staff || []).length}</small>}>
          <ul className="mv-files">
            {[{ name: m.host, role: 'GridCommerce · runs it' }, ...(m.staff || []).map((n) => ({ name: n, role: 'GridCommerce' })), ...(m.participants || [])].map((x, i) => (
              <li key={x.name + i}><Dot name={x.name} size={28} /><span>{x.name}{x.role ? <small className="mt-help" style={{ display: 'block' }}>{x.role}</small> : null}</span></li>
            ))}
          </ul>
        </Card>

        {m.agenda ? <Card title="Agenda"><p className="mt-help" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-body)', whiteSpace: 'pre-wrap' }}>{m.agenda}</p></Card> : null}

        {open ? (
          <Card title="Reminders" extra={<small className="mt-help">{nr ? `Next ${dayLabel(nr, t).toLowerCase()} ${hm(nr)}` : ''}</small>}>
            <div className="ix-chips" role="group" aria-label="Reminders">
              {REMINDERS.map(([v, l]) => <button key={v} type="button" className="ix-chip" aria-pressed={(m.reminders || []).includes(v)} onClick={() => toggleRem(v)}>{l}</button>)}
            </div>
          </Card>
        ) : null}

        <Card title="Attachments" extra={<button type="button" className="ix-btn ix-btn--sm" onClick={() => fileRef.current && fileRef.current.click()}><Icon name="paperclip" width="14" height="14" aria-hidden="true" /><span>Attach</span></button>}>
          <input ref={fileRef} type="file" hidden onChange={attach} />
          {(m.attachments || []).length ? (
            <ul className="mv-files">
              {m.attachments.map((n) => (
                <li key={n}><Icon name="file-text" width="16" height="16" aria-hidden="true" /><span className="mt-data">{n}</span>
                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Remove ${n}`} onClick={() => { removeAttachment(m.id, n, me); toast(`${n} removed`); }}><Icon name="x" width="14" height="14" aria-hidden="true" /></button></li>
              ))}
            </ul>
          ) : <p className="mt-help">No files.</p>}
        </Card>

        <Card title="History">
          <ul className="mt-hist">
            {(m.history || []).slice().reverse().map((h, i) => <li key={i}><b>{h.by}</b> · {h.text} · {ago(h.at, t)}</li>)}
          </ul>
        </Card>
      </div>
    </div>

    {act === 'move' ? <RescheduleSheet m={m} t={t} me={me} onClose={() => setAct('')} /> : null}
    {act === 'cancel' ? <CancelSheet m={m} me={me} onClose={() => setAct('')} /> : null}
  </>));
}
