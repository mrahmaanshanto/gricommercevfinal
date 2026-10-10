'use client';
// Ticket (/admin/tickets/view?id=T-2291) — one support ticket: the header with the next step as the main button (Reply,
// Solve or Reopen), the conversation with the merchant (the merchant Inbox's look) and the composer (reply to the
// merchant or an internal note, saved replies, attachments by name), then the facts on the right: the merchant
// (package, state, what they owe), assignee / priority / status / category, the SLA clocks, escalations (Escalate to
// Technical with a reason, Hand back) and the linked Inbox conversation and incident. Solving asks for a resolution note
// and sends the merchant a rating request.
// Data: lib/admin/support.js (every change), lib/admin/merchants.js › merchantRow and lib/platform (the store).
// ?id= is read after mount; the server render is the outline only.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, Dialog, StatusBadge, EmptyState, InfoTip } from '@/components/ui';
import { RecordHeader, Menu, KV } from '@/components/ui/IndexKit';
import { formatBDT } from '@/lib/format';
import { dm, hm, ahead } from '@/lib/platform/util';
import { staff as currentStaff } from '@/lib/platform/store';
import { shopOf } from '@/lib/platform/billing';
import { merchantRow, ownerOf } from '@/lib/admin/merchants';
import { useAdminStore } from '@/lib/admin/store';
import {
  supportStore, ticketById, ticketsOf, isActive, slaOf, span, fillReply, TARGETS, PRIORITIES, CATEGORIES, STATUSES, DESK, TECH,
  SAVED_REPLIES, INCIDENTS, ESCALATE_REASONS, CHANNEL_ICON, reply, addNote, assign, setStatus, setField, escalate, handBack, solve, reopen, merge,
} from '@/lib/admin/support';
import { AdminShell, usePlatform } from '../AdminShell';
import { SUPPORT_CSS, Conversation, StatusTag, PriorityTag, Who, Field, ctl, when, plural } from './supportShared';

const CSS = `
.tv-conv{padding:0}
.tv-compose{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3) var(--space-4) var(--space-4);border-top:1px solid var(--border-subtle)}
.tv-compose.is-note textarea.gc-input{background:var(--fill-warning-soft)}
.tv-seg{display:inline-flex;align-self:flex-start;padding:2px;border-radius:var(--radius-lg);background:var(--surface-subtle)}
.tv-seg button{height:28px;padding:0 var(--space-3);border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.tv-seg button[aria-pressed="true"]{background:var(--surface-card);color:var(--text-heading);box-shadow:var(--shadow-xs)}
.tv-seg button:focus-visible{outline:2px solid var(--primary);outline-offset:1px}
.tv-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.tv-tools .tv-send{margin-left:auto}
.tv-hint{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.tv-side .gc-field{margin:0}
.tv-fields{display:flex;flex-direction:column;gap:var(--space-3)}
.tv-mer{display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3)}
.tv-mer__txt{display:flex;flex-direction:column;min-width:0}
.tv-mer__txt a{font-weight:var(--weight-medium);color:var(--text-heading);overflow-wrap:anywhere}
.tv-mer__txt small{font-size:var(--text-xs);color:var(--text-muted)}
.tv-sla{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.tv-sla:first-child{border-top:0;padding-top:0}
.tv-sla__top{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2)}
.tv-sla__top b{font-weight:var(--weight-medium);color:var(--text-heading)}
.tv-sla small{font-size:var(--text-xs);color:var(--text-muted)}
.tv-sla .is-bad{color:var(--text-danger);font-weight:var(--weight-medium)}
.tv-sla .is-ok{color:var(--text-success);font-weight:var(--weight-medium)}
.tv-esc{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body)}
.tv-esc:first-child{border-top:0;padding-top:0}
.tv-esc b{font-weight:var(--weight-medium);color:var(--text-heading)}
.tv-esc small{font-size:var(--text-xs);color:var(--text-muted)}
.tv-line{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);margin:0;font-size:var(--text-sm);color:var(--text-muted)}
.tv-link{display:flex;align-items:center;gap:var(--space-2);min-height:36px;font-size:var(--text-sm);color:var(--text-heading);text-decoration:none}
.tv-link:hover{color:var(--primary)}
.tv-link>svg{flex:none;color:var(--text-muted)}
.tv-link span{flex:1;min-width:0}
.tv-link small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.tv-res{margin:0 0 var(--space-3);font-size:var(--text-sm);color:var(--text-heading);white-space:pre-wrap}
.tv-stars{display:inline-flex;gap:2px;color:var(--warning)}
.tv-stars svg{fill:currentColor}
.tv-stars .is-off{color:var(--border-strong)}
@media (max-width:640px){.tv-compose{padding:var(--space-3)}.tv-tools .tv-send{flex:1 1 100%;margin-left:0}}
`;

function Card({ title, action, children, flush, label, tip }) {
  return (
    <section className="ix-card" aria-label={label || title}>
      {title || action ? <div className="ix-card__head"><h2>{title}{tip ? <> <InfoTip text={tip} label={'About ' + String(title).toLowerCase()} /></> : null}</h2>{action || null}</div> : null}
      <div className={flush ? 'tv-conv' : 'ix-card__body'}>{children}</div>
    </section>
  );
}

function Stars({ n }) {
  return (
    <span className="tv-stars" role="img" aria-label={`${n} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" width="16" height="16" className={i <= n ? '' : 'is-off'} aria-hidden="true" />)}
    </span>
  );
}

/** One SLA clock: its target, when it is due and whether it was met. */
function Clock({ label, target, due, at, met, paused, closed, t }) {
  let state;
  if (at) state = <span className={met ? 'is-ok' : 'is-bad'}>{met ? 'Met' : 'Missed'} · {span(at)}</span>;
  else if (closed) state = <span>—</span>;
  else if (paused) state = <span>Paused</span>;
  else if (met === false) state = <span className="is-bad">Overdue {span(t - due)}</span>;
  else state = <span>{span(due - t)} left</span>;
  return (
    <div className="tv-sla">
      <span className="tv-sla__top"><b>{label}</b>{state}</span>
      <small>Target {span(target)}{due && !at && !paused && !closed ? ' · due ' + ahead(due, t) : ''}{paused ? ' · the clock stops while the merchant answers' : ''}</small>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="ix-page" aria-busy="true" aria-label="Loading the ticket">
      <div className="sp-skel sp-skel--head" />
      <div className="ix-record"><div className="sp-skel" /><div className="sp-skel" /></div>
    </div>
  );
}

export default function TicketView() {
  const router = useRouter();
  const { db, live: plive } = usePlatform();
  const { t, live: slive } = useAdminStore(supportStore);
  const live = plive && slive;
  const me = currentStaff().name;
  const [id, setId] = useState(null);
  const [mode, setMode] = useState('reply');
  const [draft, setDraft] = useState('');
  const [files, setFiles] = useState([]);
  const [err, setErr] = useState('');
  const [sheet, setSheet] = useState(null);   // { kind: 'solve'|'escalate'|'back'|'merge', … }
  const box = useRef(null);
  const threadEnd = useRef(0);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setId(String(p.get('id') || '').trim().toUpperCase());
  }, []);
  useEffect(() => { setDraft(''); setFiles([]); setErr(''); setMode('reply'); }, [id]);

  const tk = live && id ? ticketById(id) : null;
  // keep the conversation scrolled to the newest message
  const count = tk ? tk.messages.length : 0;
  useEffect(() => {
    if (!count) return;
    const el = document.querySelector('.sp-thread');
    if (el && (threadEnd.current === 0 || count > threadEnd.current)) el.scrollTop = el.scrollHeight;
    threadEnd.current = count;
  }, [count]);

  if (!live || id == null) {
    return <AdminShell active="tickets" title="Ticket"><style dangerouslySetInnerHTML={{ __html: SUPPORT_CSS + CSS }} /><Skeleton /></AdminShell>;
  }
  if (!tk) {
    return (
      <AdminShell active="tickets" title="Ticket">
        <style dangerouslySetInnerHTML={{ __html: SUPPORT_CSS + CSS }} />
        <div className="ix-page">
          <RecordHeader back="/admin/tickets" backLabel="Back to tickets" title="Ticket" />
          <section className="ix-card">
            <EmptyState icon="life-buoy" title={id ? `No ticket ${id}` : 'No ticket picked'} body="Check the ticket number, or open it from the list." actionLabel="Back to tickets" onAction={() => router.push('/admin/tickets')} />
          </section>
        </div>
      </AdminShell>
    );
  }

  const shop = shopOf(db, tk.shopId);
  let row = null;
  try { row = shop ? merchantRow(db, shop, t) : null; } catch { row = null; }
  const owner = shop ? ownerOf(shop) : { name: 'the merchant', phone: '' };
  const sla = slaOf(tk, t);
  const tg = TARGETS[tk.priority] || TARGETS.Normal;
  const act = isActive(tk);
  const others = ticketsOf(tk.shopId).filter((x) => x.id !== tk.id);
  const otherOpen = others.filter(isActive);
  const lastPublic = [...tk.messages].reverse().find((m) => m.from === 'merchant' || m.from === 'agent');
  const needsReply = !tk.firstReplyAt || (lastPublic && lastPublic.from === 'merchant');
  const lastEsc = tk.escalations[tk.escalations.length - 1];

  // ---- actions ----
  const done = (res, msg) => { if (res && res.ok === false) { toast(res.error); return false; } if (msg) toast(msg); return true; };
  const focusBox = (m) => {
    setMode(m);
    setTimeout(() => { if (box.current) { box.current.scrollIntoView({ block: 'center', behavior: 'smooth' }); box.current.focus(); } }, 0);
  };
  const send = () => {
    const res = mode === 'reply' ? reply(tk.id, draft, files) : addNote(tk.id, draft, files);
    if (!res.ok) { setErr(res.error); return; }
    setDraft(''); setFiles([]); setErr('');
    toast(mode === 'reply' ? `Reply sent to ${owner.name} by ${tk.channel === 'Phone' || tk.channel === 'In-app' ? 'SMS and in-app' : tk.channel}` : 'Internal note added');
  };
  const doReopen = () => done(reopen(tk.id), tk.id + ' reopened');
  const openSolve = () => setSheet({ kind: 'solve', note: tk.resolution || '', ask: true });
  const doSheet = () => {
    if (sheet.kind === 'solve') {
      const res = solve(tk.id, sheet.note, sheet.ask);
      if (!res.ok) { setSheet({ ...sheet, error: res.error }); return; }
      setSheet(null);
      toast(tk.id + ' solved');
      if (sheet.ask) setTimeout(() => toast(`Rating request sent to ${owner.name}${owner.phone ? ' (' + owner.phone + ')' : ''} by SMS`), 700);
    } else if (sheet.kind === 'escalate') {
      const why = [sheet.reason, sheet.detail.trim()].filter(Boolean).join(': ');
      const res = escalate(tk.id, why, sheet.incident);
      if (!res.ok) { setSheet({ ...sheet, error: res.error }); return; }
      setSheet(null);
      toast(`Escalated to Technical (${TECH})`);
    } else if (sheet.kind === 'back') {
      const res = handBack(tk.id, sheet.note);
      if (!res.ok) { setSheet({ ...sheet, error: res.error }); return; }
      setSheet(null);
      toast('Handed back to support');
    } else if (sheet.kind === 'merge') {
      if (!sheet.into) { setSheet({ ...sheet, error: 'Pick the ticket to keep.' }); return; }
      const res = merge([tk.id], sheet.into);
      if (!res.ok) { setSheet({ ...sheet, error: res.error }); return; }
      setSheet(null);
      toast(`${tk.id} merged into ${sheet.into}`);
      router.push('/admin/tickets/view?id=' + sheet.into);
      setId(sheet.into);
    }
  };
  const onStatus = (s) => {
    if (s === tk.status) return;
    if (s === 'Solved') { openSolve(); return; }
    if (s === 'Escalated') { setSheet({ kind: 'escalate', reason: '', detail: '', incident: tk.incident || '' }); return; }
    done(setStatus([tk.id], s), `${tk.id} moved to ${s}`);
  };
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.origin + '/admin/tickets/view?id=' + tk.id); toast('Ticket link copied'); } catch { toast('Copy failed: copy the address from the browser bar'); }
  };

  const A = {
    reply: { label: 'Reply', icon: 'reply', onClick: () => focusBox('reply') },
    solve: { label: 'Solve', icon: 'circle-check', onClick: openSolve },
    reopen: { label: 'Reopen', icon: 'rotate-ccw', onClick: doReopen },
    escalate: { label: 'Escalate', icon: 'arrow-up-right', onClick: () => setSheet({ kind: 'escalate', reason: '', detail: '', incident: tk.incident || '' }) },
    back: { label: 'Hand back', icon: 'corner-down-left', onClick: () => setSheet({ kind: 'back', note: '' }) },
    take: { label: 'Assign to me', icon: 'user-round-check', onClick: () => done(assign([tk.id], me), 'Assigned to you') },
  };
  const primary = tk.mergedInto ? null : !act ? A.reopen : needsReply ? A.reply : A.solve;
  const secondary = [
    act ? (tk.status === 'Escalated' ? A.back : A.escalate) : null,
    act && DESK.includes(me) && tk.agent !== me ? A.take : null,
  ].filter(Boolean);
  const more = [
    act && primary !== A.solve ? { label: 'Solve', onClick: openSolve } : null,
    act && primary !== A.reply ? { label: 'Reply', onClick: () => focusBox('reply') } : null,
    { label: 'Add internal note', onClick: () => focusBox('note') },
    act && otherOpen.length ? { label: 'Merge into another ticket', onClick: () => setSheet({ kind: 'merge', into: '' }) } : null,
    tk.status === 'Solved' ? { label: 'Close ticket', onClick: () => done(setStatus([tk.id], 'Closed'), tk.id + ' closed') } : null,
    { label: 'Copy ticket link', onClick: copyLink },
    shop ? { label: 'Open merchant', href: '/admin/merchant?id=' + tk.shopId + '&tab=support' } : null,
  ].filter(Boolean);

  const insertSaved = (r) => {
    setMode('reply');
    setDraft((d) => (d.trim() ? d.trimEnd() + '\n\n' : '') + fillReply(r.text, owner.name));
    setErr('');
    setTimeout(() => { if (box.current) box.current.focus(); }, 0);
  };
  const canReply = act;

  return (
    <AdminShell active="tickets" title={tk.id}>
      <style dangerouslySetInnerHTML={{ __html: SUPPORT_CSS + CSS }} />
      <div className="ix-page">
        <RecordHeader back="/admin/tickets" backLabel="Back to tickets" title={tk.subject}
          about="One merchant's support ticket: the conversation, internal notes, who has it, its SLA clocks, escalations and links. Replies go to the merchant on the channel the ticket came in by; internal notes stay with GridCommerce staff."
          badges={<><StatusTag s={tk.status} /><PriorityTag p={tk.priority} />{act && sla.breached ? <StatusBadge tone="error" icon="clock-alert">Past SLA</StatusBadge> : null}</>}
          meta={<><span className="sp-id">{tk.id}</span> · {shop ? shop.name : '#' + tk.shopId} · {tk.channel} · opened {when(tk.createdAt, t)}</>}
          secondary={secondary} more={more} primary={primary} />

        {tk.mergedInto ? (
          <section className="ix-card"><div className="ix-card__body">
            <p className="tv-line"><Icon name="merge" width="16" height="16" aria-hidden="true" />Merged into <Link className="ix-strong" href={'/admin/tickets/view?id=' + tk.mergedInto} onClick={() => setId(tk.mergedInto)}>{tk.mergedInto}</Link>. Its messages are there.</p>
          </div></section>
        ) : null}

        <div className="ix-record">
          <div className="ix-main">
            <Card title="Conversation" flush action={<span className="sp-muted" style={{ fontSize: 'var(--text-xs)' }}>{plural(tk.messages.filter((m) => m.from !== 'system').length, 'message')}</span>}>
              <Conversation tk={tk} t={t} me={me} />
              <div className={'tv-compose' + (mode === 'note' ? ' is-note' : '')}>
                <div className="tv-seg" role="group" aria-label="Write">
                  <button type="button" aria-pressed={mode === 'reply'} onClick={() => setMode('reply')} disabled={!canReply}>Reply to merchant</button>
                  <button type="button" aria-pressed={mode === 'note'} onClick={() => setMode('note')}>Internal note</button>
                </div>
                {!canReply && mode === 'reply' ? (
                  <p className="tv-line">This ticket is {tk.status.toLowerCase()}. {tk.mergedInto ? null : <button type="button" className="ix-btn ix-btn--sm" onClick={doReopen}>Reopen to reply</button>}</p>
                ) : (
                  <>
                    <label className="sr-only" htmlFor="tv-box">{mode === 'reply' ? 'Reply to ' + owner.name : 'Internal note'}</label>
                    <textarea id="tv-box" ref={box} className={'gc-input' + (err ? ' gc-input--error' : '')} rows={3} value={draft} aria-invalid={err ? true : undefined}
                      placeholder={mode === 'reply' ? `Reply to ${owner.name}…` : 'Only GridCommerce staff see this. Mention a teammate with @Name'}
                      onChange={(e) => { setDraft(e.target.value); setErr(''); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(); } }} />
                    {err ? <p className="gc-help gc-help--error" role="alert">{err}</p> : null}
                    {files.length ? (
                      <span className="sp-files">
                        {files.map((n) => <span key={n} className="sp-file">{n}<button type="button" aria-label={'Remove ' + n} onClick={() => setFiles((f) => f.filter((x) => x !== n))}><Icon name="x" width="12" height="12" aria-hidden="true" /></button></span>)}
                      </span>
                    ) : null}
                    <div className="tv-tools">
                      {mode === 'reply' ? <Menu label="Saved replies" icon="message-square-text" cls="ix-btn ix-btn--sm" align="start" items={SAVED_REPLIES.map((r) => ({ label: r.title, onClick: () => insertSaved(r) }))} /> : null}
                      <label className="ix-btn ix-btn--sm"><Icon name="paperclip" width="16" height="16" aria-hidden="true" />Attach
                        <input type="file" multiple hidden onChange={(e) => { const names = Array.from(e.target.files || []).map((x) => x.name); e.target.value = ''; setFiles((f) => [...new Set([...f, ...names])].slice(0, 5)); setErr(''); }} />
                      </label>
                      <span className="tv-hint">Ctrl + Enter sends</span>
                      <button type="button" className="gc-btn gc-btn--sm gc-btn--solid tv-send" onClick={send}>
                        <Icon name={mode === 'reply' ? 'send' : 'lock'} width="16" height="16" aria-hidden="true" />{mode === 'reply' ? 'Send reply' : 'Add note'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {!act ? (
              <Card title="Resolution">
                <p className="tv-res">{tk.resolution || 'No resolution note.'}</p>
                <KV rows={[
                  ['Solved', tk.solvedAt ? when(tk.solvedAt, t) + ' · after ' + span(tk.solvedAt - tk.createdAt) : '—'],
                  ['Rating', tk.rating ? <span key="r"><Stars n={tk.rating} /></span> : tk.ratingAskedAt ? 'Asked ' + when(tk.ratingAskedAt, t) + ', no answer yet' : 'Not asked'],
                  tk.ratingNote ? ['Merchant said', tk.ratingNote] : null,
                ]} />
              </Card>
            ) : null}
          </div>

          <div className="ix-side tv-side">
            <Card title="Merchant" action={shop ? <Link className="ix-btn ix-btn--sm" href={'/admin/merchant?id=' + tk.shopId + '&tab=support'}>Open</Link> : null}>
              {shop && row ? (
                <>
                  <div className="tv-mer">
                    <Who name={shop.name} size={36} merchant />
                    <span className="tv-mer__txt">
                      <Link href={'/admin/merchant?id=' + tk.shopId + '&tab=support'}>{shop.name}</Link>
                      <small><span className="sp-data">#{tk.shopId}</span> · {row.packageName}</small>
                    </span>
                  </div>
                  <KV rows={[
                    ['State', <StatusBadge key="s" tone={row.tone}>{row.stateLabel}</StatusBadge>],
                    ['Owes', row.owed > 0 ? <span key="o" className="sp-fig ix-bad">{formatBDT(Math.round(row.owed))}</span> : 'Nothing'],
                    ['Owner', <span key="w">{owner.name}{owner.phone ? <><br /><span className="sp-data sp-muted">{owner.phone}</span></> : null}</span>],
                    ['Account manager', row.am || 'None'],
                    ['Other tickets', others.length ? <Link key="t" href={'/admin/tickets?merchant=' + tk.shopId + '&view=' + (otherOpen.length ? 'open' : 'solved')}>{otherOpen.length ? `${otherOpen.length} open · ` : ''}{others.length} in all</Link> : 'None'],
                  ]} />
                </>
              ) : <p className="tv-line">Store #{tk.shopId} is not in the platform any more.</p>}
            </Card>

            <Card title="Ticket">
              <div className="tv-fields">
                <Field id="tv-agent" label="Assignee">
                  <select id="tv-agent" {...ctl(false, true)} value={tk.agent || ''} onChange={(e) => done(assign([tk.id], e.target.value || null), e.target.value ? 'Assigned to ' + (e.target.value === me ? 'you' : e.target.value) : 'Unassigned')}>
                    <option value="">Unassigned</option>
                    {DESK.map((x) => <option key={x} value={x}>{x}{x === TECH ? ' (Technical)' : ''}</option>)}
                  </select>
                </Field>
                <Field id="tv-status" label="Status">
                  <select id="tv-status" {...ctl(false, true)} value={tk.status} onChange={(e) => onStatus(e.target.value)} disabled={!!tk.mergedInto}>
                    {STATUSES.map((x) => <option key={x} value={x} disabled={x === 'New' && tk.status !== 'New'}>{x}</option>)}
                  </select>
                </Field>
                <Field id="tv-pri" label="Priority">
                  <select id="tv-pri" {...ctl(false, true)} value={tk.priority} onChange={(e) => done(setField(tk.id, 'priority', e.target.value), 'Priority set to ' + e.target.value)}>
                    {PRIORITIES.slice().reverse().map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </Field>
                <Field id="tv-cat" label="Category">
                  <select id="tv-cat" {...ctl(false, true)} value={tk.category} onChange={(e) => done(setField(tk.id, 'category', e.target.value), 'Category set to ' + e.target.value)}>
                    {CATEGORIES.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </Field>
                <KV rows={[
                  ['Came in by', <span key="c" className="sp-person"><Icon name={CHANNEL_ICON[tk.channel] || 'message-square'} width="16" height="16" aria-hidden="true" />{tk.channel}</span>],
                  ['Team', tk.team],
                  ['Opened', dm(tk.createdAt) + ' ' + hm(tk.createdAt)],
                  ['Last update', when(tk.updatedAt, t)],
                ]} />
              </div>
            </Card>

            <Card title="SLA" tip="First reply within 30 min for urgent tickets, 2 h for high, 8 h for normal and 24 h for low. Solved within 4 h, 24 h, 48 h and 5 days. The solving clock stops while the ticket waits on the merchant.">
              <Clock label="First reply" target={tg.first} due={sla.firstDue} at={tk.firstReplyAt ? tk.firstReplyAt - tk.createdAt : 0} met={sla.firstMet} closed={!act} t={t} />
              <Clock label="Solved" target={tg.resolve} due={sla.resolveDue} at={tk.solvedAt ? tk.solvedAt - tk.createdAt : 0} met={sla.resolveMet} paused={act && sla.paused} closed={!act} t={t} />
            </Card>

            <Card title="Escalation" action={act && tk.status !== 'Escalated' ? <button type="button" className="ix-btn ix-btn--sm" onClick={A.escalate.onClick}>Escalate</button> : act && tk.status === 'Escalated' ? <button type="button" className="ix-btn ix-btn--sm" onClick={A.back.onClick}>Hand back</button> : null}>
              {tk.escalations.length ? tk.escalations.slice().reverse().map((e, i) => (
                <div key={i} className="tv-esc">
                  <b>To {e.team} · {e.to}</b>
                  <span>{e.reason}</span>
                  <small>by {e.by} · {when(e.at, t)}</small>
                  {e.backAt ? <small>Handed back {when(e.backAt, t)}: {e.backNote}</small> : tk.status === 'Escalated' && e === lastEsc ? <small>With Technical for {span(t - e.at)}</small> : null}
                </div>
              )) : <p className="tv-line">Not escalated.</p>}
            </Card>

            <Card title="Linked">
              {tk.conv ? (
                <Link className="tv-link" href={'/admin/inbox?conv=' + encodeURIComponent(tk.conv)}>
                  <Icon name="messages-square" width="16" height="16" aria-hidden="true" /><span>Inbox conversation<small className="sp-data">{tk.conv}</small></span><Icon name="chevron-right" width="16" height="16" aria-hidden="true" />
                </Link>
              ) : <p className="tv-link"><Icon name="messages-square" width="16" height="16" aria-hidden="true" /><span className="sp-muted">No Inbox conversation</span></p>}
              {tk.incident ? (
                <Link className="tv-link" href={'/admin/incidents?id=' + encodeURIComponent(tk.incident)}>
                  <Icon name="siren" width="16" height="16" aria-hidden="true" /><span>Incident<small className="sp-data">{tk.incident}</small></span><Icon name="chevron-right" width="16" height="16" aria-hidden="true" />
                </Link>
              ) : <p className="tv-link"><Icon name="siren" width="16" height="16" aria-hidden="true" /><span className="sp-muted">No incident</span></p>}
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={!!sheet && sheet.kind === 'solve'} title={'Solve ' + tk.id} onClose={() => setSheet(null)} width={520}
        footer={<>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setSheet(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={doSheet}>Solve ticket</button>
        </>}>
        {sheet && sheet.kind === 'solve' ? (
          <div className="sp-form">
            <Field id="tv-res" label="Resolution note" error={sheet.error} hint="What was wrong and what fixed it. Saved on the ticket for the next person.">
              <textarea id="tv-res" {...ctl(sheet.error)} rows={4} data-autofocus value={sheet.note} onChange={(e) => setSheet({ ...sheet, note: e.target.value, error: '' })} />
            </Field>
            <label className="sp-check"><input type="checkbox" checked={sheet.ask} onChange={(e) => setSheet({ ...sheet, ask: e.target.checked })} />Ask {owner.name} to rate the help (SMS)</label>
          </div>
        ) : null}
      </Dialog>

      <Sheet open={!!sheet && sheet.kind !== 'solve'} title={sheet ? (sheet.kind === 'escalate' ? 'Escalate to Technical' : sheet.kind === 'back' ? 'Hand back to support' : 'Merge into another ticket') : ''} onClose={() => setSheet(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setSheet(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={doSheet}>{sheet && sheet.kind === 'escalate' ? 'Escalate' : sheet && sheet.kind === 'back' ? 'Hand back' : 'Merge'}</button>
        </>}>
        {sheet && sheet.kind === 'escalate' ? (
          <div className="sp-form">
            <p><b>{TECH}</b> (Technical) takes the ticket; it shows as Escalated until it is handed back.</p>
            <Field id="tv-why" label="Reason" error={sheet.error && !sheet.reason ? sheet.error : ''}>
              <select id="tv-why" {...ctl(sheet.error && !sheet.reason, true)} data-autofocus value={sheet.reason} onChange={(e) => setSheet({ ...sheet, reason: e.target.value, error: '' })}>
                <option value="">Choose a reason</option>
                {ESCALATE_REASONS.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </Field>
            <Field id="tv-detail" label="What Technical should know" hint="Store, orders, what you already tried.">
              <textarea id="tv-detail" {...ctl(false)} rows={3} value={sheet.detail} onChange={(e) => setSheet({ ...sheet, detail: e.target.value })} />
            </Field>
            <Field id="tv-inc" label="Incident" error={sheet.error && sheet.reason ? sheet.error : ''}>
              <select id="tv-inc" {...ctl(false, true)} value={sheet.incident} onChange={(e) => setSheet({ ...sheet, incident: e.target.value, error: '' })}>
                <option value="">None</option>
                {[...new Set([tk.incident, ...INCIDENTS].filter(Boolean))].map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </Field>
          </div>
        ) : null}
        {sheet && sheet.kind === 'back' ? (
          <div className="sp-form">
            <p>The ticket goes back to {lastEsc && lastEsc.from && lastEsc.from !== TECH ? lastEsc.from : 'the support desk'} as Waiting on us.</p>
            <Field id="tv-back" label="What Technical found or did" error={sheet.error}>
              <textarea id="tv-back" {...ctl(sheet.error)} rows={4} data-autofocus value={sheet.note} onChange={(e) => setSheet({ ...sheet, note: e.target.value, error: '' })} />
            </Field>
          </div>
        ) : null}
        {sheet && sheet.kind === 'merge' ? (
          <div className="sp-form">
            <p>{tk.id} closes and its messages move into the ticket you keep.</p>
            <Field id="tv-into" label="Keep this ticket" error={sheet.error}>
              <select id="tv-into" {...ctl(sheet.error, true)} data-autofocus value={sheet.into} onChange={(e) => setSheet({ ...sheet, into: e.target.value, error: '' })}>
                <option value="">Choose a ticket</option>
                {otherOpen.map((x) => <option key={x.id} value={x.id}>{x.id} · {x.subject}</option>)}
              </select>
            </Field>
          </div>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
