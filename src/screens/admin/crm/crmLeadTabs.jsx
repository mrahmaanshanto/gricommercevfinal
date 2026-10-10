'use client';
// The lead page's tabs (LeadView.jsx): Overview · Activity · Notes · Tasks · Quotations · Meetings · Conversion history.
// Each tab gets ctx = { l, t, me, open(kind, params), go(tab) }; `open` shows a sheet from crmLeadSheets.jsx.

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { StatusBadge } from '@/components/ui';
import { KV } from '@/components/ui/IndexKit';
import { dmy, daysBetween, num } from '@/lib/platform/util';
import {
  ACT_KINDS, LOG_KINDS, QUOTE_STATUS, stageOf, isOpen, followState, planLabel, quoteTotal, logActivity, addNote, toggleTask, setQuoteStatus,
} from '@/lib/admin/crm';
import { money, plural, Avatar, StageBadge, whenText, nextText, FOLLOW_CLS, dateTime, toInput, fromInput, Field, ctl, focusField, nextStep } from './crmShared';

export function Card({ title, action, children, flush, label }) {
  return (
    <section className="ix-card" aria-label={label || title}>
      {title || action ? <div className="ix-card__head">{title ? <h2>{title}</h2> : <span />}{action || null}</div> : null}
      <div className={flush ? 'lv-flush' : 'ix-card__body'}>{children}</div>
    </section>
  );
}
export function Row({ title, sub, end, icon, href }) {
  const inner = (<>
    {icon ? <span className="lv-row__ic" aria-hidden="true"><Icon name={icon} width="16" height="16" /></span> : null}
    <span className="lv-row__main"><b>{title}</b>{sub ? <small>{sub}</small> : null}</span>
    {end ? <span className="lv-row__end">{end}</span> : null}
  </>);
  return href ? <Link href={href} className="lv-row">{inner}</Link> : <div className="lv-row">{inner}</div>;
}
export function Empty({ text, action }) {
  return (
    <p className="lv-empty">
      <span>{text}</span>
      {action ? <button type="button" className="ix-btn ix-btn--sm" onClick={action.onClick}>{action.label}</button> : null}
    </p>
  );
}
const waOf = (mobile) => 'https://wa.me/88' + String(mobile).replace(/\D/g, '');
const quoteState = (q, t) => (q.status === 'sent' && q.validUntil < t ? 'expired' : q.status);

// ---- Overview ---------------------------------------------------------------------------------------------------------
export function OverviewTab({ ctx }) {
  const { l, t, open, go } = ctx;
  const fs = followState(l, t);
  const st = stageOf(l.stage);
  const openTasks = l.tasks.filter((x) => !x.done).sort((a, b) => a.due - b.due);
  const lastQuote = l.quotes[0];
  const step = nextStep(l);
  return (
    <div className="ix-record">
      <div className="ix-main">
        <Card title="Contact" action={<span className="lv-tools">
          <a className="ix-btn ix-btn--sm" href={'tel:' + l.mobile.replace(/\D/g, '')}><Icon name="phone" width="16" height="16" aria-hidden="true" />Call</a>
          <a className="ix-btn ix-btn--sm" href={waOf(l.mobile)} target="_blank" rel="noreferrer"><Icon name="message-circle" width="16" height="16" aria-hidden="true" />WhatsApp</a>
          {l.email ? <a className="ix-btn ix-btn--sm lv-wide" href={'mailto:' + l.email}><Icon name="mail" width="16" height="16" aria-hidden="true" />Email</a> : null}
        </span>}>
          <KV rows={[
            ['Name', l.name],
            ['Mobile', <span key="m" className="crm-data">{l.mobile}</span>],
            ['Email', l.email || '—'],
            ['District', l.district],
            ['Source', l.source],
            ['Added', dmy(l.createdAt)],
          ]} />
        </Card>
        <Card title="Company">
          <KV rows={[
            ['Business', l.business],
            ['Type', `${l.type} · ${l.category}`],
            ['Current software', l.software],
            ['Orders a month', <span key="o" className="crm-data">{num(l.orders)}</span>],
          ]} />
        </Card>
        <Card title="Needs" action={<button type="button" className="ix-btn ix-btn--sm" onClick={() => open('edit')}>Edit</button>}>
          {l.modules.length ? <div className="ix-chips">{l.modules.map((m) => <span key={m} className="lv-tag">{m}</span>)}</div> : <Empty text="No modules picked yet." action={{ label: 'Pick modules', onClick: () => open('edit') }} />}
          {l.notes[0] ? <p className="lv-quote">“{l.notes[0].text}” <button type="button" className="lv-link" onClick={() => go('notes')}>{plural(l.notes.length, 'note')}</button></p> : null}
        </Card>
      </div>
      <div className="ix-side">
        <Card title="Expected subscription">
          <p className="lv-big"><span className="crm-fig">{money(l.value)}</span><small>/month</small></p>
          <KV rows={[
            ['Package', planLabel(l.ladder, l.plan)],
            isOpen(l) ? ['Chance', `${Math.round(st.weight * 100)}% · ${money(l.value * st.weight)}`] : null,
            lastQuote ? ['Quotation', <span key="q">{lastQuote.id} · {QUOTE_STATUS[quoteState(lastQuote, t)][0]}</span>] : null,
          ]} />
        </Card>
        {isOpen(l) ? (
          <Card title="Next follow-up" action={<button type="button" className="ix-btn ix-btn--sm" onClick={() => open('followup')}>{l.next ? 'Change' : 'Set'}</button>}>
            {l.next ? (
              <div className="lv-next">
                <b className={FOLLOW_CLS[fs] || ''}>{nextText(l, t)}</b>
                <span>{l.next.what} · {dateTime(l.next.at)}</span>
              </div>
            ) : <Empty text="No follow-up set." />}
            {step && step.kind !== 'merchant' ? <p className="lv-hint">Next step: {step.label.toLowerCase()}.</p> : null}
          </Card>
        ) : null}
        <Card title="Salesperson" action={<button type="button" className="ix-btn ix-btn--sm" onClick={() => open('owner')}>Change</button>}>
          <div className="lv-person"><Avatar name={l.owner} size={32} /><span><b>{l.owner}</b><small>Last contact {whenText(l.lastContact, t)}</small></span></div>
        </Card>
        <Card title="Open tasks" action={<button type="button" className="ix-btn ix-btn--sm" onClick={() => open('task')}>Add</button>} flush>
          {openTasks.length ? openTasks.slice(0, 3).map((x) => <TaskRow key={x.id} l={l} x={x} t={t} />) : <Empty text="Nothing to do." />}
          {openTasks.length > 3 ? <p className="lv-empty"><button type="button" className="ix-btn ix-btn--sm" onClick={() => go('tasks')}>All {openTasks.length} tasks</button></p> : null}
        </Card>
      </div>
    </div>
  );
}

// ---- Activity ---------------------------------------------------------------------------------------------------------
const FILTERS = [['all', 'All'], ['call', 'Calls'], ['whatsapp', 'WhatsApp'], ['email', 'Emails'], ['meeting', 'Meetings'], ['stage', 'Stages'], ['quote', 'Quotations'], ['system', 'System']];

export function LogForm({ l, t }) {
  const open = isOpen(l);
  const [f, setF] = useState({ kind: 'call', text: '', setNext: open, at: toInput(t + 24 * 3600e3), what: '' });
  const [err, setErr] = useState(null);
  const save = (e) => {
    e.preventDefault();
    const at = fromInput(f.at);
    if (open && f.setNext && !Number.isFinite(at)) { setErr({ field: 'next', error: 'Pick when to follow up.' }); return; }
    const res = logActivity(l.id, { kind: f.kind, text: f.text, next: open ? (f.setNext ? { at, what: f.what } : undefined) : undefined });
    if (!res.ok) { setErr({ field: res.field, error: res.error }); if (res.field === 'text') focusField('lv-log-text'); return; }
    setErr(null);
    setF({ ...f, text: '', what: '' });
    toast(`${ACT_KINDS[f.kind][0]} logged${res.moved ? ' · moved to Contacted' : ''}${open && f.setNext ? ' · follow-up ' + dateTime(at) : ''}`);
  };
  const e = (k) => (err && err.field === k ? err.error : null);
  return (
    <form className="crm-form" onSubmit={save} noValidate>
      <div className="ix-chips" role="group" aria-label="What happened">
        {LOG_KINDS.map((k) => (
          <button key={k} type="button" className="ix-chip" aria-pressed={f.kind === k} onClick={() => setF({ ...f, kind: k })}>
            <Icon name={ACT_KINDS[k][1]} width="14" height="14" aria-hidden="true" />{ACT_KINDS[k][0]}
          </button>
        ))}
      </div>
      <Field id="lv-log-text" label="What happened" error={e('text')}>
        <textarea id="lv-log-text" rows={2} {...ctl(e('text'))} value={f.text} onChange={(ev) => { setF({ ...f, text: ev.target.value }); if (err) setErr(null); }}
          placeholder={f.kind === 'call' ? 'e.g. Talked to the owner; wants the price for 2 branches' : ''} />
      </Field>
      {open ? (<>
        <label className="lv-check"><input type="checkbox" checked={f.setNext} onChange={(ev) => setF({ ...f, setNext: ev.target.checked })} />Set the next follow-up</label>
        {f.setNext ? (
          <div className="crm-two">
            <Field id="lv-log-at" label="When" error={e('next')}><input id="lv-log-at" type="datetime-local" {...ctl(e('next'))} value={f.at} onChange={(ev) => setF({ ...f, at: ev.target.value })} /></Field>
            <Field id="lv-log-what" label="To do"><input id="lv-log-what" className="gc-input" value={f.what} placeholder={stageOf(l.stage).next || 'Follow up'} onChange={(ev) => setF({ ...f, what: ev.target.value })} /></Field>
          </div>
        ) : null}
      </>) : null}
      <div><button type="submit" className="gc-btn gc-btn--solid">Save</button></div>
    </form>
  );
}

export function ActivityTab({ ctx }) {
  const { l, t } = ctx;
  const [kind, setKind] = useState('all');
  const [more, setMore] = useState(false);
  const rows = l.activity.slice().sort((a, b) => b.at - a.at);
  const count = (k) => (k === 'all' ? rows.length : rows.filter((r) => r.kind === k).length);
  const list = rows.filter((r) => kind === 'all' || r.kind === kind);
  const shown = more ? list : list.slice(0, 30);
  return (
    <div className="ix-record">
      <div className="ix-main">
        <Card title="Timeline" flush>
          <div className="ix-chips lv-filter" role="group" aria-label="Show activity">
            {FILTERS.filter(([k]) => k === 'all' || count(k)).map(([k, label]) => <button key={k} type="button" className="ix-chip" aria-pressed={kind === k} onClick={() => { setKind(k); setMore(false); }}>{label} · {count(k)}</button>)}
          </div>
          {shown.length ? shown.map((a) => <Row key={a.id} icon={(ACT_KINDS[a.kind] || ACT_KINDS.note)[1]} title={a.text} sub={`${(ACT_KINDS[a.kind] || ACT_KINDS.note)[0]} · ${a.by} · ${dateTime(a.at)}`} />)
            : <Empty text="Nothing of this kind yet." action={{ label: 'Show all', onClick: () => setKind('all') }} />}
          {list.length > shown.length ? <p className="lv-empty"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setMore(true)}>Show {list.length - shown.length} more</button></p> : null}
        </Card>
      </div>
      <div className="ix-side">
        <Card title="Log activity"><LogForm l={l} t={t} /></Card>
      </div>
    </div>
  );
}

// ---- Notes ------------------------------------------------------------------------------------------------------------
export function NotesTab({ ctx }) {
  const { l, t } = ctx;
  const [text, setText] = useState('');
  const [err, setErr] = useState(null);
  const save = (e) => {
    e.preventDefault();
    const res = addNote(l.id, text);
    if (!res.ok) { setErr(res.error); return; }
    setText(''); setErr(null);
    toast('Note added');
  };
  return (
    <div className="ix-record">
      <div className="ix-main">
        <Card title="Notes">
          {l.notes.length ? (
            <div className="lv-notes">
              {l.notes.map((n) => <div key={n.id} className="lv-note"><p>{n.text}</p><small>{n.by} · {whenText(n.at, t)}</small></div>)}
            </div>
          ) : <Empty text="No notes yet." action={{ label: 'Write one', onClick: () => focusField('lv-note') }} />}
        </Card>
      </div>
      <div className="ix-side">
        <Card title="Add a note">
          <form className="crm-form" onSubmit={save} noValidate>
            <Field id="lv-note" label="Note" error={err}>
              <textarea id="lv-note" rows={4} {...ctl(err)} value={text} onChange={(e) => { setText(e.target.value); setErr(null); }} placeholder="Only the team sees notes." />
            </Field>
            <div><button type="submit" className="gc-btn gc-btn--solid">Add note</button></div>
          </form>
        </Card>
      </div>
    </div>
  );
}

// ---- Tasks ------------------------------------------------------------------------------------------------------------
function TaskRow({ l, x, t }) {
  const late = !x.done && x.due < t;
  const flip = () => { const r = toggleTask(l.id, x.id); if (r.ok) toast(r.done ? 'Task done' : 'Task opened again'); };
  return (
    <div className={'lv-task' + (x.done ? ' is-done' : '')}>
      <input type="checkbox" checked={x.done} onChange={flip} aria-label={(x.done ? 'Open again: ' : 'Mark done: ') + x.title} />
      <span className="lv-row__main"><b>{x.title}</b><small><span className={late ? 'ix-bad' : ''}>{x.done ? 'Done ' + whenText(x.doneAt, t) : (late ? 'Was due ' : 'Due ') + dmy(x.due)}</span> · {x.owner}</small></span>
    </div>
  );
}
export function TasksTab({ ctx }) {
  const { l, t, open } = ctx;
  const todo = l.tasks.filter((x) => !x.done).sort((a, b) => a.due - b.due);
  const done = l.tasks.filter((x) => x.done).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
  return (
    <div className="lv-grid2">
      <Card title={`To do · ${todo.length}`} action={<button type="button" className="ix-btn ix-btn--sm" onClick={() => open('task')}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add task</button>} flush>
        {todo.length ? todo.map((x) => <TaskRow key={x.id} l={l} x={x} t={t} />) : <Empty text="Nothing to do on this lead." action={{ label: 'Add task', onClick: () => open('task') }} />}
      </Card>
      <Card title={`Done · ${done.length}`} flush>
        {done.length ? done.map((x) => <TaskRow key={x.id} l={l} x={x} t={t} />) : <Empty text="No finished tasks yet." />}
      </Card>
    </div>
  );
}

// ---- Quotations -------------------------------------------------------------------------------------------------------
export function QuotesTab({ ctx }) {
  const { l, t, open } = ctx;
  const set = (q, status) => {
    const r = setQuoteStatus(l.id, q.id, status);
    if (!r.ok) { toast(r.error); return; }
    toast(`${q.id} ${QUOTE_STATUS[status][0].toLowerCase()}${status === 'accepted' ? ' · the lead’s package and price now follow it' : ''}`);
  };
  return (
    <Card title="Quotations" action={<button type="button" className="ix-btn ix-btn--sm" onClick={() => open('quote')}><Icon name="plus" width="16" height="16" aria-hidden="true" />Create quotation</button>} flush>
      {l.quotes.length ? l.quotes.map((q) => {
        const s = quoteState(q, t);
        const [label, tone] = QUOTE_STATUS[s];
        return (
          <div key={q.id} className="lv-quoteRow">
            <span className="lv-row__main">
              <b><span className="crm-data">{q.id}</span> · {planLabel(q.ladder, q.plan)}</b>
              <small>{q.modules.length ? q.modules.join(', ') : 'Plan only'}{q.note ? ' · ' + q.note : ''}</small>
              <small>{dmy(q.at)} by {q.by} · valid until {dmy(q.validUntil)}</small>
            </span>
            <span className="lv-quoteRow__fig">
              <b className="crm-fig">{money(quoteTotal(q))}<small>/mo</small></b>
              {q.discount ? <small><s>{money(q.price)}</s> · {q.discount}% off</small> : null}
            </span>
            <span className="lv-row__end">
              <StatusBadge tone={tone}>{label}</StatusBadge>
              {q.status === 'draft' || q.status === 'sent' ? (
                <span className="lv-tools">
                  {q.status === 'draft' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => set(q, 'sent')}>Mark sent</button> : null}
                  <button type="button" className="ix-btn ix-btn--sm" onClick={() => set(q, 'accepted')}>Accepted</button>
                  <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => set(q, 'declined')}>Declined</button>
                </span>
              ) : null}
            </span>
          </div>
        );
      }) : <Empty text="No quotations yet." action={{ label: 'Create quotation', onClick: () => open('quote') }} />}
    </Card>
  );
}

// ---- Meetings ---------------------------------------------------------------------------------------------------------
export function MeetingsTab({ ctx }) {
  const { l, t, open } = ctx;
  const up = l.meetings.filter((m) => !m.done && m.at >= t).sort((a, b) => a.at - b.at);
  const past = l.meetings.filter((m) => m.done || m.at < t).sort((a, b) => b.at - a.at);
  const row = (m) => {
    const missed = !m.done && m.at < t;
    return (
      <Row key={m.id} icon={m.kind === 'Phone call' ? 'phone' : m.kind === 'Office visit' || m.kind === 'At their shop' ? 'map-pin' : 'video'}
        title={`${m.title} · ${dateTime(m.at)}`}
        sub={`${m.kind} · with ${m.with} · ${m.by}${m.note ? ' · ' + m.note : ''}`}
        end={<>
          <StatusBadge tone={m.done ? 'success' : missed ? 'warning' : 'primary'}>{m.done ? 'Done' : missed ? 'Not marked' : 'Upcoming'}</StatusBadge>
          {!m.done ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => open('meetingDone', { mid: m.id })}>Mark done</button> : null}
        </>} />
    );
  };
  return (
    <div className="lv-grid2">
      <Card title={`Upcoming · ${up.length}`} action={<span className="lv-tools">
        <Link className="ix-btn ix-btn--sm ix-btn--plain lv-wide" href="/admin/meetings">All meetings</Link>
        <button type="button" className="ix-btn ix-btn--sm" onClick={() => open('meeting')}><Icon name="calendar-plus" width="16" height="16" aria-hidden="true" />Schedule</button>
      </span>} flush>
        {up.length ? up.map(row) : <Empty text="No meeting booked." action={{ label: 'Schedule meeting', onClick: () => open('meeting') }} />}
      </Card>
      <Card title={`Past · ${past.length}`} flush>
        {past.length ? past.map(row) : <Empty text="No meetings yet." />}
      </Card>
    </div>
  );
}

// ---- Conversion history -----------------------------------------------------------------------------------------------
export function HistoryTab({ ctx }) {
  const { l, t, open } = ctx;
  const h = l.history.slice().sort((a, b) => a.at - b.at);
  const firstContact = (l.activity.filter((a) => LOG_KINDS.includes(a.kind)).sort((a, b) => a.at - b.at)[0] || {}).at;
  const end = l.wonAt || l.lostAt || t;
  return (
    <div className="ix-record">
      <div className="ix-main">
        <Card title="Stages" flush>
          {h.map((x, i) => {
            const until = h[i + 1] ? h[i + 1].at : (l.stage === 'won' || l.stage === 'lost' ? null : t);
            const days = until ? daysBetween(x.at, until) : null;
            return <Row key={i} icon={i === h.length - 1 ? 'circle-dot' : 'circle-check'} title={<span className="lv-stageline"><StageBadge stage={x.stage} />{x.stage === 'lost' && l.lostReason ? <span>{l.lostReason}</span> : null}</span>}
              sub={`${dateTime(x.at)} · ${x.by}${days != null ? ` · ${days === 0 ? 'under a day' : plural(days, 'day')}${until === t ? ' so far' : ''}` : ''}`} />;
          })}
        </Card>
      </div>
      <div className="ix-side">
        <Card title="Conversion">
          {l.merchantId ? (<>
            <KV rows={[
              ['Store', <Link key="s" href={'/admin/merchant?id=' + l.merchantId} className="crm-data">#{l.merchantId}</Link>],
              ['Won', dmy(l.wonAt)],
              ['Lead to store', plural(daysBetween(l.createdAt, l.wonAt), 'day')],
              ['Package', planLabel(l.ladder, l.plan)],
              ['Subscription', money(l.value) + '/mo'],
            ]} />
            <p className="lv-hint"><Link href={'/admin/merchant?id=' + l.merchantId}>Open the merchant</Link></p>
          </>) : l.stage === 'lost' ? (
            <KV rows={[['Lost', dmy(l.lostAt)], ['Why', l.lostReason], ['Open for', plural(daysBetween(l.createdAt, l.lostAt), 'day')]]} />
          ) : (<>
            <KV rows={[
              ['Status', l.stage === 'won' ? 'Won · store not set up' : 'Not converted yet'],
              ['First contact', firstContact ? dmy(firstContact) : '—'],
              ['Open for', plural(daysBetween(l.createdAt, end), 'day')],
            ]} />
            <div className="lv-hint"><button type="button" className="ix-btn ix-btn--sm" onClick={() => open('convert')}><Icon name="store" width="16" height="16" aria-hidden="true" />Convert to merchant</button></div>
          </>)}
        </Card>
      </div>
    </div>
  );
}

export const LV_CSS = `
.lv-tabs{padding:var(--space-2)}
.lv-flush{padding:var(--space-1) var(--space-4) var(--space-3)}
.lv-row{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:6px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body);text-decoration:none}
.lv-flush>.lv-row:first-child,.lv-filter+.lv-row{border-top:0}
.lv-row__ic{flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:var(--radius-full);background:var(--surface-subtle);color:var(--text-muted)}
.lv-row__main{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.lv-row__main b{font-weight:var(--weight-medium);color:var(--text-heading);overflow-wrap:anywhere}
.lv-row__main small{font-size:var(--text-xs);color:var(--text-muted);overflow-wrap:anywhere}
.lv-row__end{flex:none;display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:var(--space-2)}
a.lv-row:hover b{color:var(--primary)}
.lv-empty{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);margin:0;padding:var(--space-2) 0;font-size:var(--text-sm);color:var(--text-muted)}
.lv-tools{display:inline-flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.lv-tag{display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:var(--radius-full);background:var(--fill-primary-soft);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--primary)}
.lv-quote{margin:var(--space-3) 0 0;font-size:var(--text-sm);color:var(--text-body)}
.lv-link{padding:0;border:0;background:none;font:inherit;font-size:var(--text-xs);color:var(--primary);text-decoration:underline;cursor:pointer}
.lv-big{display:flex;align-items:baseline;gap:4px;margin:0 0 var(--space-3)}
.lv-big .crm-fig{font-size:var(--text-sm-plus)}
.lv-big small{font-size:var(--text-xs);color:var(--text-muted)}
.lv-next{display:flex;flex-direction:column;gap:2px;font-size:var(--text-sm)}
.lv-next b{font-weight:var(--weight-semibold);color:var(--text-heading)}
.lv-next b.ix-bad{color:var(--text-danger)}.lv-next b.ix-warn{color:var(--text-warning)}
.lv-next span{color:var(--text-body)}
.lv-hint{margin:var(--space-3) 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.lv-hint a{color:var(--primary)}
.lv-person{display:flex;align-items:center;gap:var(--space-3);font-size:var(--text-sm)}
.lv-person>span{display:flex;flex-direction:column;gap:2px}
.lv-person b{font-weight:var(--weight-medium);color:var(--text-heading)}
.lv-person small{font-size:var(--text-xs);color:var(--text-muted)}
.lv-filter{padding:var(--space-2) 0 var(--space-3)}
.lv-check{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-body)}
.lv-check input{width:16px;height:16px;margin:0;accent-color:var(--primary)}
.lv-notes{display:flex;flex-direction:column;gap:var(--space-2)}
.lv-note{padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm)}
.lv-note p{margin:0;color:var(--text-heading);overflow-wrap:anywhere;white-space:pre-wrap}
.lv-note small{display:block;margin-top:2px;font-size:var(--text-xs);color:var(--text-muted)}
.lv-task{display:flex;align-items:flex-start;gap:var(--space-3);min-height:44px;padding:8px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.lv-flush>.lv-task:first-child{border-top:0}
.lv-task input{flex:none;width:16px;height:16px;margin:2px 0 0;accent-color:var(--primary);cursor:pointer}
.lv-task.is-done b{text-decoration:line-through;color:var(--text-muted)}
.lv-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-4);align-items:start}
.lv-quoteRow{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:var(--space-2) var(--space-4);padding:10px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.lv-flush>.lv-quoteRow:first-child{border-top:0}
.lv-quoteRow__fig{display:flex;flex-direction:column;align-items:flex-end;gap:2px;font-size:var(--text-xs);color:var(--text-muted)}
.lv-quoteRow__fig small{font-size:var(--text-xs)}
.lv-stageline{display:inline-flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.lv-stageline>span:last-child{font-weight:var(--weight-regular);color:var(--text-body)}
.lv-banner{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);padding:var(--space-3) var(--space-4);border-radius:var(--radius-xl);font-size:var(--text-sm);color:var(--text-heading)}
.lv-banner--ok{background:var(--fill-success-soft)}
.lv-banner--err{background:var(--fill-error-soft)}
.lv-banner--warn{background:var(--fill-warning-soft)}
.lv-banner p{flex:1;min-width:200px;margin:0}
.lv-banner>svg{flex:none}
.lv-skel{height:220px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:crm-sk 1.4s ease infinite}
.lv-skel--head{height:56px}.lv-skel--tabs{height:44px}
@media (max-width:1023px){.lv-grid2{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){
  .lv-wide{display:none}
  .lv-quoteRow{grid-template-columns:minmax(0,1fr) auto}
  .lv-quoteRow>.lv-row__end{grid-column:1/-1;justify-content:flex-start}
  .lv-row{flex-wrap:wrap}
  .lv-row__end{width:100%;justify-content:flex-start;padding-left:40px}
  .lv-row__end:empty{display:none}
}
@media (prefers-reduced-motion:reduce){.lv-skel{animation:none}}
`;
