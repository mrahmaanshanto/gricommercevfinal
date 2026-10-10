'use client';
// One conversation in the super admin's Inbox, copied from the merchant panel's components/inbox/Thread.jsx and
// Messenger.jsx (same Messenger look: grouped bubbles, time between groups, Seen avatar, reactions, call bubbles, voice
// messages) without the shop parts (products, orders, payments). Added for GridCommerce's own team:
//   header      who it is (Lead / Merchant / Affiliate / Partner), AI mode, call, assign / transfer, priority, snooze, close
//   AI bar      in AI auto: GridAI answers by the rules, "Take over" switches the chat to people
//   approvals   "Needs approval": GridAI's refund, price, cancellation and payment replies wait for Approve / Edit / Reject
//   scheduled   replies set to go later (Send now / Cancel)
//   composer    reply or internal note (yellow, @mentions), files (names only), saved replies on "/", GridAI suggestions
//               (insert a draft, never sent by itself), emoji, schedule send. Enter sends, Shift+Enter is a new line.
// Data and every change: lib/admin/inbox.js (the caller passes `act`).

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { DAY, MIN, hm, dm, daysBetween, startOfDay, weekday } from '@/lib/platform/util';
import {
  CHANNELS, channelName, staffName, firstName, TEAM, PRIORITIES, priorityOf, AI_MODES, aiModeOf, aiModeName, statusOf,
  aiSuggestions, fillReply, previewOf, sensitiveName, countReplyUse, react,
} from '@/lib/admin/inbox';
import { Avatar, StaffAvatar, KindBadge, Menu, MenuItem } from './inboxParts';

const EMOJI = ['😊', '🙏', '👍', '❤️', '🎉', '✅', '📦', '🚚', '💳', '⭐', '😅', '🤝', '👋', '🔥', '💯', '🙂', '⏰', '📍'];
export const REACTIONS = ['❤️', '😆', '😮', '😢', '😠', '👍'];
const STATUS_BADGE = { pending: ['Pending', 'info'], snoozed: ['Snoozed', 'warning'], closed: ['Closed', 'slate'] };
const GAP = 5 * MIN;
const GROUP_GAP = 15 * MIN;

// ---- time words ---------------------------------------------------------------------------------------------------
export const clock = (ms) => hm(ms);
export function dayLabel(ms, now) {
  const n = daysBetween(ms, now);
  if (n <= 0) return 'Today';
  if (n === 1) return 'Yesterday';
  if (n < 7) return weekday(ms);
  return dm(ms);
}
export const whenText = (ms, now) => { const n = daysBetween(now, ms); return n === 0 ? 'today ' + hm(ms) : n === 1 ? 'tomorrow ' + hm(ms) : n === -1 ? 'yesterday ' + hm(ms) : dm(ms) + ' ' + hm(ms); };
export const fmtDur = (s) => { const x = Math.max(0, Math.round(s || 0)); return Math.floor(x / 60) + ':' + String(x % 60).padStart(2, '0'); };
const sameDay = (a, b) => startOfDay(a) === startOfDay(b);
/** Later today, tomorrow morning, Sunday: [label, time]. */
export function laterChoices(now) {
  const day = startOfDay(now);
  const list = [['In 1 hour', now + 60 * MIN]];
  if (now < day + 17 * 3600e3) list.push(['This evening', day + 18 * 3600e3]);
  list.push(['Tomorrow morning', day + DAY + 9 * 3600e3]);
  // the next Sunday (the Bangladesh work week starts on Sunday)
  let s = day + DAY;
  while (weekday(s) !== 'Sun') s += DAY;
  list.push(['Sunday morning', s + 10 * 3600e3]);
  return list;
}
const toLocalInput = (ms) => { const d = new Date(ms + 6 * 3600e3); return d.toISOString().slice(0, 16); };
const fromLocalInput = (v) => (v ? Date.parse(v + ':00Z') - 6 * 3600e3 : NaN);

/** Pick a date and time (Dhaka) in a menu. */
function WhenForm({ now, label, onPick }) {
  const [v, setV] = useState(toLocalInput(now + 2 * 3600e3));
  return (
    <form className="ib-menu__form th-when" onSubmit={(e) => { e.preventDefault(); const ms = fromLocalInput(v); if (!(ms > now)) { toast('Pick a time in the future', { tone: 'error' }); return; } onPick(ms); }}>
      <input type="datetime-local" className="gc-input" aria-label={label} value={v} min={toLocalInput(now)} onChange={(e) => setV(e.target.value)} />
      <button type="submit" className="gc-btn gc-btn--sm gc-btn--soft">Set</button>
    </form>
  );
}

// ---- the conversation ---------------------------------------------------------------------------------------------
export function Thread({ conv, data, now, me, typing, panelOpen, onBack, onTogglePanel, act, draftIn }) {
  const status = statusOf(conv, now);
  const mode = aiModeOf(conv, data);
  const scroller = useRef(null);
  const bottom = useRef(true);
  const [fresh, setFresh] = useState(0);
  const [showJump, setShowJump] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [calling, setCalling] = useState(false);
  useEffect(() => { setReplyTo(null); setCalling(false); }, [conv.id]);
  const count = conv.messages.length;
  const seen = useRef({ id: '', count: 0 });

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (seen.current.id !== conv.id) {
      el.scrollTop = el.scrollHeight;
      bottom.current = true; setShowJump(false); setFresh(0);
    } else if (count > seen.current.count) {
      const last = conv.messages[count - 1];
      if (bottom.current || last.from === 'agent' || last.from === 'note' || last.from === 'system') el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      else setFresh((f) => f + count - seen.current.count);
    }
    seen.current = { id: conv.id, count };
  }, [conv.id, count]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const el = scroller.current; if (typing && el && bottom.current) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); }, [typing]);
  const onScroll = () => {
    const el = scroller.current;
    const at = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    bottom.current = at;
    setShowJump(!at);
    if (at) setFresh(0);
  };
  const jump = () => { const el = scroller.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); setFresh(0); };

  const s = STATUS_BADGE[status];
  const pr = priorityOf(conv.priority);
  const canCall = (CHANNELS[conv.ch] || {}).call || !!conv.phone;

  return (
    <>
      <header className="th-head">
        <button type="button" className="gc-iconbtn th-back" onClick={onBack} aria-label="Back to conversations"><Icon name="arrow-left" width="20" height="20" /></button>
        <button type="button" className="th-who" onClick={onTogglePanel} aria-label={`Contact details for ${conv.name}`} aria-expanded={panelOpen}>
          <Avatar name={conv.name} ch={conv.ch} size={40} />
          <span className="th-who__text">
            <span className="th-who__name"><span className="th-name">{conv.name}</span>{s ? <span className={'gc-badge gc-badge--' + s[1]}>{status === 'snoozed' ? 'Until ' + whenText(conv.snoozeUntil, now) : s[0]}</span> : null}{conv.priority === 'urgent' || conv.priority === 'high' ? <span className={'gc-badge gc-badge--' + pr[2]}>{pr[1]}</span> : null}</span>
            <span className="ib-sub th-who__sub">{conv.company ? conv.company + ' · ' : ''}{channelName(conv.ch)}</span>
          </span>
        </button>
        <div className="th-acts">
          <Menu label="GridAI for this chat" wide button={({ toggle, open }) => (
            <button type="button" className={'gc-btn gc-btn--sm gc-btn--neutral th-ai th-ai--' + mode} aria-expanded={open} onClick={toggle} aria-label={`GridAI: ${aiModeName(mode)}. Change`}>
              <Icon name="sparkles" width="16" height="16" aria-hidden="true" /><span className="th-lbl">{aiModeName(mode)}</span><Icon name="chevron-down" width="14" height="14" aria-hidden="true" />
            </button>
          )}>
            {(close) => (
              <>
                <p className="ib-menu__head">GridAI for this chat</p>
                {AI_MODES.map(([k, l, sub]) => <MenuItem key={k} checked={conv.ai === k} onClick={() => { act.setAi(k); close(); }} hint={k === data.settings.defaultAi && !conv.ai ? 'Default' : undefined}>{l}</MenuItem>)}
                <MenuItem checked={!conv.ai} onClick={() => { act.setAi(null); close(); }} hint={aiModeName(data.settings.defaultAi)}>Use the default</MenuItem>
                <p className="ib-menu__note">{(AI_MODES.find((x) => x[0] === mode) || AI_MODES[0])[2]}</p>
              </>
            )}
          </Menu>
          {canCall ? <button type="button" className="gc-iconbtn ms-callbtn th-hide-xs" onClick={() => setCalling(true)} aria-label={'Voice call ' + conv.name} title="Voice call"><Icon name="phone" width="18" height="18" /></button> : null}
          <Menu label="Assign to" wide button={({ toggle, open }) => (
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral th-assign" aria-expanded={open} onClick={toggle} aria-label={conv.assignee ? `Assigned to ${staffName(conv.assignee)}. Transfer` : 'Assign'}>
              <StaffAvatar id={conv.assignee} size={22} /><span className="th-lbl">{conv.assignee ? firstName(staffName(conv.assignee)) : 'Assign'}</span><Icon name="chevron-down" width="14" height="14" aria-hidden="true" />
            </button>
          )}>
            {(close) => (
              <>
                <p className="ib-menu__head">{conv.assignee ? 'Transfer to' : 'Assign to'}</p>
                {TEAM.map((p) => <MenuItem key={p.id} checked={conv.assignee === p.id} onClick={() => { act.assign(p.id); close(); }} hint={p.id === me ? 'Me' : p.title}>{p.name}</MenuItem>)}
                {conv.assignee ? <MenuItem icon="user-x" onClick={() => { act.assign(''); close(); }}>Unassign</MenuItem> : null}
              </>
            )}
          </Menu>
          <Menu label="Priority" button={({ toggle, open }) => <button type="button" className={'gc-iconbtn th-hide-xs th-flag th-flag--' + conv.priority} aria-expanded={open} onClick={toggle} aria-label={'Priority: ' + pr[1]} title={'Priority: ' + pr[1]}><Icon name="flag" width="18" height="18" /></button>}>
            {(close) => <><p className="ib-menu__head">Priority</p>{PRIORITIES.map(([k, l, tone]) => <MenuItem key={k} checked={conv.priority === k} onClick={() => { act.priority(k); close(); }}><span className={'ib-dot ib-dot--' + (tone === 'neutral' ? (k === 'low' ? '' : 'info') : tone)} /> {l}</MenuItem>)}</>}
          </Menu>
          <Menu label="Snooze" button={({ toggle, open }) => <button type="button" className="gc-iconbtn th-hide-xs" aria-expanded={open} onClick={toggle} aria-label="Snooze" title="Snooze"><Icon name="alarm-clock" width="18" height="18" /></button>}>
            {(close) => (
              <>
                <p className="ib-menu__head">Snooze until</p>
                {laterChoices(now).map(([label, t]) => <MenuItem key={label} onClick={() => { act.status('snoozed', t); close(); }} hint={whenText(t, now)}>{label}</MenuItem>)}
                <WhenForm now={now} label="Snooze until" onPick={(t) => { act.status('snoozed', t); close(); }} />
                {status === 'snoozed' ? <MenuItem icon="bell-ring" onClick={() => { act.status('open'); close(); }}>Unsnooze now</MenuItem> : null}
              </>
            )}
          </Menu>
          {status === 'closed'
            ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => act.status('open')}><Icon name="rotate-ccw" width="16" height="16" aria-hidden="true" /><span className="th-lbl">Reopen</span></button>
            : <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={() => act.status('closed')}><Icon name="check" width="16" height="16" aria-hidden="true" /><span className="th-lbl">Close</span></button>}
          <Menu label="More actions" button={({ toggle, open }) => <button type="button" className="gc-iconbtn" aria-expanded={open} onClick={toggle} aria-label="More actions" title="More actions"><Icon name="more-vertical" width="18" height="18" /></button>}>
            {(close) => (
              <>
                <span className="th-only-xs">
                  {canCall ? <MenuItem icon="phone" onClick={() => { close(); setCalling(true); }}>Voice call</MenuItem> : null}
                  <MenuItem icon="alarm-clock" onClick={() => { act.status('snoozed', laterChoices(now).find((x) => x[0] === 'Tomorrow morning')[1]); close(); }}>Snooze until tomorrow</MenuItem>
                  <MenuItem icon="flag" onClick={() => { act.priority(conv.priority === 'urgent' ? 'normal' : 'urgent'); close(); }}>{conv.priority === 'urgent' ? 'Clear urgent' : 'Mark urgent'}</MenuItem>
                </span>
                <MenuItem icon="mail" onClick={() => { act.markUnread(); close(); }}>Mark as unread</MenuItem>
                {status !== 'pending' ? <MenuItem icon="hourglass" onClick={() => { act.status('pending'); close(); }}>Set to pending</MenuItem> : null}
                {status === 'pending' ? <MenuItem icon="inbox" onClick={() => { act.status('open'); close(); }}>Back to open</MenuItem> : null}
                {conv.phone ? <Link className="gc-dropdown__item" role="menuitem" href={`/admin/calls?dial=${encodeURIComponent(conv.phone)}&name=${encodeURIComponent(conv.name)}`}><Icon name="phone-outgoing" width="16" height="16" aria-hidden="true" />Call {conv.phone} from Calls</Link> : null}
                <MenuItem icon="panel-right" onClick={() => { close(); onTogglePanel(); }}>Contact details</MenuItem>
              </>
            )}
          </Menu>
          <button type="button" className={'gc-iconbtn th-panelbtn' + (panelOpen ? ' gc-iconbtn--active' : '')} onClick={onTogglePanel} aria-label={panelOpen ? 'Hide contact details' : 'Show contact details'} aria-pressed={panelOpen} title="Contact details"><Icon name="panel-right" width="18" height="18" /></button>
        </div>
      </header>

      {mode === 'auto' && status !== 'closed' ? (
        <div className="th-aibar" role="status">
          <Icon name="sparkles" width="16" height="16" aria-hidden="true" />
          <span><b>GridAI is answering</b> by the rules. Refunds, prices, cancellations and payment details wait for a person.</span>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={act.takeOver}><Icon name="hand" width="16" height="16" aria-hidden="true" />Take over</button>
        </div>
      ) : null}

      <div className="th-scrollwrap">
        <div className="th-msgs" ref={scroller} onScroll={onScroll} role="log" aria-label={`Messages with ${conv.name}`} aria-live="polite">
          <MessageList conv={conv} now={now} me={me} typing={typing} onReply={setReplyTo} onCall={() => setCalling(true)} />
        </div>
        {showJump || fresh ? (
          <button type="button" className="th-jump" onClick={jump}><Icon name="arrow-down" width="16" height="16" aria-hidden="true" />{fresh ? `${fresh} new` : 'Jump to latest'}</button>
        ) : null}
      </div>

      {conv.approvals.length ? <Approvals conv={conv} act={act} /> : null}
      {conv.scheduled.length ? <Scheduled conv={conv} now={now} act={act} /> : null}
      <Composer conv={conv} data={data} me={me} mode={mode} status={status} now={now} onSend={act.send} onSchedule={act.schedule} onReplies={act.openReplies}
        replyTo={replyTo} onClearReply={() => setReplyTo(null)} draftIn={draftIn} />
      {calling ? <CallScreen conv={conv} onEnd={(sec, answered) => { setCalling(false); act.endCall(sec, answered); }} /> : null}
    </>
  );
}

// ---- needs approval (AI auto) -------------------------------------------------------------------------------------
function Approvals({ conv, act }) {
  const [edit, setEdit] = useState(null);   // { id, text }
  return (
    <section className="th-approve" aria-label="Needs approval">
      <p className="th-approve__head"><Icon name="shield-alert" width="16" height="16" aria-hidden="true" />Needs approval<b>{conv.approvals.length}</b><span>GridAI wrote these but may not send them on its own.</span></p>
      {conv.approvals.map((a) => (
        <div key={a.id} className="th-approve__item">
          <span className="gc-badge gc-badge--warning">{sensitiveName(a.topic)}</span>
          {edit && edit.id === a.id ? (
            <textarea className="gc-input th-approve__edit" rows="3" value={edit.text} onChange={(e) => setEdit({ ...edit, text: e.target.value })} aria-label="Edit GridAI's reply" autoFocus />
          ) : <p className="th-approve__text">{a.text}</p>}
          <span className="th-approve__acts">
            {edit && edit.id === a.id ? (<>
              <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setEdit(null)}>Cancel</button>
              <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" disabled={!edit.text.trim()} onClick={() => { if (act.approve(a.id, edit.text)) setEdit(null); }}>Approve and send</button>
            </>) : (<>
              <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => act.reject(a.id)}>Reject</button>
              <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setEdit({ id: a.id, text: a.text })}>Edit</button>
              <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => act.approve(a.id)}>Approve</button>
            </>)}
          </span>
        </div>
      ))}
    </section>
  );
}

function Scheduled({ conv, now, act }) {
  return (
    <section className="th-sched" aria-label="Scheduled messages">
      {conv.scheduled.map((s) => (
        <div key={s.id} className="th-sched__item">
          <Icon name="clock" width="16" height="16" aria-hidden="true" />
          <span className="th-sched__text"><b>Sends {whenText(s.at, now)}</b><span>{s.text || (s.files || []).join(', ')}</span></span>
          <button type="button" className="gc-btn gc-btn--xs gc-btn--flat" onClick={() => act.sendScheduled(s.id)}>Send now</button>
          <button type="button" className="gc-iconbtn" aria-label="Cancel the scheduled message" title="Cancel" onClick={() => act.cancelScheduled(s.id)}><Icon name="x" width="16" height="16" /></button>
        </div>
      ))}
    </section>
  );
}

// ---- the messages (Messenger style) -------------------------------------------------------------------------------
const outgoing = (m) => m.from === 'agent' || m.from === 'ai';
const joins = (a, b) => a && b && a.from === b.from && (a.from === 'contact' || a.from === 'ai' || a.by === b.by) && a.from !== 'system' && a.from !== 'note' && Math.abs(b.at - a.at) < GAP && sameDay(a.at, b.at);
const senderOf = (conv, m, me) => (m.from === 'contact' ? firstName(conv.name) : m.from === 'ai' ? 'GridAI' : m.by === me ? 'you' : firstName(staffName(m.by)));
const reactionsOf = (m) => { const n = {}; Object.values(m.reactions || {}).forEach((e) => { n[e] = (n[e] || 0) + 1; }); return Object.entries(n); };
const bigEmoji = (t) => { const s = String(t || '').trim(); return !!s && s.length <= 12 && /^(\p{Extended_Pictographic}|️|‍|\s)+$/u.test(s) && [...s.replace(/\s/g, '')].filter((c) => /\p{Extended_Pictographic}/u.test(c)).length <= 3; };
const NAMES = new Set(TEAM.map((p) => firstName(p.name).toLowerCase()));
export function Mentioned({ text }) {
  const parts = String(text || '').split(/(@[A-Za-z]+)/g);
  return <>{parts.map((p, i) => (p.startsWith('@') && NAMES.has(p.slice(1).toLowerCase()) ? <span key={i} className="ms-at">{p}</span> : <React.Fragment key={i}>{p}</React.Fragment>))}</>;
}

export function MessageList({ conv, now, me, typing, onReply, onCall }) {
  const seenIds = useRef({ id: '', ids: new Set() });
  if (seenIds.current.id !== conv.id) seenIds.current = { id: conv.id, ids: new Set(conv.messages.map((m) => m.id)) };
  const [active, setActive] = useState('');
  const [picker, setPicker] = useState('');
  useEffect(() => { setActive(''); setPicker(''); }, [conv.id]);
  const msgs = conv.messages;
  const lastOut = (() => { for (let i = msgs.length - 1; i >= 0; i--) if (outgoing(msgs[i])) return msgs[i].id; return ''; })();
  const byId = (id) => msgs.find((x) => x.id === id) || null;
  if (!msgs.length) return <EmptyState icon="message-square-dashed" title="No messages yet" />;
  return (
    <>
      {msgs.map((m, i) => {
        const prev = msgs[i - 1], next = msgs[i + 1];
        const newDay = !prev || !sameDay(prev.at, m.at);
        const gap = !newDay && prev && m.at - prev.at > GROUP_GAP;
        const isNew = !seenIds.current.ids.has(m.id);
        const sep = newDay ? <div className="ms-time" role="separator"><span>{dayLabel(m.at, now)} · {clock(m.at)}</span></div>
          : gap ? <div className="ms-time" role="separator"><span>{clock(m.at)}</span></div> : null;
        if (m.from === 'system') return <React.Fragment key={m.id}>{sep}<div className={'th-sys' + (isNew ? ' ms-new' : '')}><Icon name={m.icon || 'info'} width="14" height="14" aria-hidden="true" /><span>{m.text}</span><span className="th-sys__time">{clock(m.at)}</span></div></React.Fragment>;
        if (m.from === 'note') {
          return (
            <React.Fragment key={m.id}>{sep}
              <div className={'th-note' + (isNew ? ' ms-new' : '')}>
                <p className="th-note__label"><Icon name="lock" width="12" height="12" aria-hidden="true" />Internal note · only the team sees this</p>
                <p className="th-note__text"><Mentioned text={m.text} /></p>
                <p className="th-meta">{staffName(m.by)} · {clock(m.at)}</p>
              </div>
            </React.Fragment>
          );
        }
        const first = newDay || gap || !joins(prev, m);
        const last = !joins(m, next) || (next && (!sameDay(m.at, next.at) || next.at - m.at > GROUP_GAP));
        return (
          <React.Fragment key={m.id}>{sep}
            <Bubble m={m} conv={conv} me={me} first={first} last={last} isNew={isNew}
              seen={m.id === lastOut ? m.status : ''} reply={m.replyTo ? byId(m.replyTo) : null}
              active={active === m.id} onActive={() => setActive((a) => (a === m.id ? '' : m.id))}
              pickerOpen={picker === m.id} onPicker={(on) => setPicker(on ? m.id : '')}
              onReact={(e) => { react(conv.id, m.id, e); setPicker(''); }}
              onReply={onReply ? () => onReply(m) : null} onCall={onCall} />
          </React.Fragment>
        );
      })}
      {typing ? (
        <div className="ms-row ms-row--in g-single ms-new">
          <Avatar name={conv.name} size={28} />
          <div className="ms-col"><div className="ms-bubble ms-typing" aria-label={`${conv.name} is typing`}><i /><i /><i /></div></div>
        </div>
      ) : null}
    </>
  );
}

function Files({ files }) {
  if (!files || !files.length) return null;
  return <span className="ms-files">{files.map((f) => <span key={f} className="ms-file"><Icon name={/\.(png|jpe?g|webp|gif)$/i.test(f) ? 'image' : /\.(xlsx?|csv)$/i.test(f) ? 'sheet' : /\.zip$/i.test(f) ? 'folder-archive' : 'file-text'} width="16" height="16" aria-hidden="true" /><span>{f}</span></span>)}</span>;
}

function Bubble({ m, conv, me, first, last, isNew, seen, reply, active, onActive, pickerOpen, onPicker, onReact, onReply, onCall }) {
  const out = outgoing(m);
  const ai = m.from === 'ai';
  const pos = first && last ? 'g-single' : first ? 'g-first' : last ? 'g-last' : 'g-mid';
  const reacts = reactionsOf(m);
  const mine = (m.reactions || {})[me] || '';
  const big = m.type === 'text' && !(m.files || []).length && bigEmoji(m.text);
  const body = (() => {
    if (big) return <p className="ms-emoji">{m.text}</p>;
    if (m.type === 'voice') return <VoiceNote m={m} out={out} />;
    if (m.type === 'call') {
      const missed = m.dir === 'missed';
      return (
        <div className={'ms-callb' + (missed ? ' is-missed' : '')}>
          <span className="ms-callb__row">
            <span className="ms-callb__ic"><Icon name={missed ? 'phone-missed' : out ? 'phone-outgoing' : 'phone-incoming'} width="16" height="16" aria-hidden="true" /></span>
            <span className="ms-callb__text"><b>{missed ? (out ? 'No answer' : 'Missed call') : 'Voice call'}</b><small>{missed ? clock(m.at) : fmtDur(m.dur)}</small></span>
          </span>
          {onCall ? <button type="button" className="ms-callb__back" onClick={onCall}>Call back</button> : null}
        </div>
      );
    }
    return (
      <div className="ms-media">
        {m.text ? <p className="ms-bubble">{m.text}</p> : null}
        <Files files={m.files} />
      </div>
    );
  })();
  return (
    <div className={'ms-row ms-row--' + (out ? 'out' : 'in') + (ai ? ' ms-row--ai' : '') + ' ' + pos + (isNew ? ' ms-new' : '') + (reacts.length ? ' has-react' : '') + (active ? ' is-active' : '') + (big ? ' is-big' : '')}>
      {out ? null : last ? <Avatar name={conv.name} size={28} /> : <span className="th-spacer" aria-hidden="true" />}
      <div className="ms-col">
        {first && out && (ai || m.by !== me) ? <span className="ms-who">{ai ? <><Icon name="sparkles" width="12" height="12" aria-hidden="true" />GridAI{m.approvedBy ? ' · approved by ' + firstName(staffName(m.approvedBy)) : ''}</> : firstName(staffName(m.by))}</span> : null}
        {reply ? (
          <div className="ms-quote">
            <span className="ms-quote__lbl"><Icon name="reply" width="12" height="12" aria-hidden="true" />{(out ? (m.by === me ? 'You' : firstName(staffName(m.by))) : firstName(conv.name)) + ' replied to ' + senderOf(conv, reply, me)}</span>
            <span className="ms-quote__txt">{previewOf(reply)}</span>
          </div>
        ) : null}
        <div className="ms-body" title={clock(m.at)} onClick={(e) => { if (!e.target.closest('button,a')) onActive(); }}>
          {body}
          {reacts.length ? <span className="ms-reacts" aria-label={'Reactions: ' + reacts.map(([e, n]) => e + (n > 1 ? ' ' + n : '')).join(', ')}>{reacts.map(([e]) => <i key={e}>{e}</i>)}{reacts.reduce((a, r) => a + r[1], 0) > 1 ? <b>{reacts.reduce((a, r) => a + r[1], 0)}</b> : null}</span> : null}
          <span className={'ms-acts' + (pickerOpen ? ' is-open' : '')}>
            <button type="button" className="ms-act" onClick={() => onPicker(!pickerOpen)} aria-label="React" aria-expanded={pickerOpen} title="React"><Icon name="smile-plus" width="16" height="16" aria-hidden="true" /></button>
            {onReply ? <button type="button" className="ms-act" onClick={onReply} aria-label="Reply" title="Reply"><Icon name="reply" width="16" height="16" aria-hidden="true" /></button> : null}
            {pickerOpen ? <ReactPicker mine={mine} onPick={onReact} onClose={() => onPicker(false)} /> : null}
          </span>
        </div>
        {seen ? <Seen status={seen} conv={conv} /> : null}
      </div>
    </div>
  );
}

function Seen({ status, conv }) {
  if (status === 'read') return <span className="ms-seen" title="Seen"><span className="ms-seen__dot" aria-hidden="true">{firstName(conv.name).charAt(0)}</span><span className="sr-only">Seen</span></span>;
  return <span className={'ms-seen ms-seen--' + status} title={status === 'delivered' ? 'Delivered' : 'Sent'}><Icon name={status === 'delivered' ? 'circle-check' : 'circle'} width="14" height="14" aria-hidden="true" /><span className="sr-only">{status === 'delivered' ? 'Delivered' : 'Sent'}</span></span>;
}

// ---- Messenger pieces (from components/inbox/Messenger.jsx) ---------------------------------------------------------
const hash = (s) => { let h = 7; for (const c of String(s || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
function barsFor(key, n = 28) {
  let h = hash(key) || 1;
  return Array.from({ length: n }, (_, i) => { h = (h * 1103515245 + 12345) >>> 0; const edge = Math.min(i, n - 1 - i) < 3 ? 0.55 : 1; return Math.round((6 + (h % 18)) * edge); });
}
/** A voice message: a timed preview (the demo keeps no audio). */
function VoiceNote({ m, out }) {
  const dur = Math.max(1, m.dur || 1);
  const [pos, setPos] = useState(0);
  const [on, setOn] = useState(false);
  const bars = useRef(barsFor(m.id));
  useEffect(() => {
    if (!on) return undefined;
    const id = window.setInterval(() => setPos((p) => { const n = p + 0.1; if (n >= dur) { setOn(false); return 0; } return n; }), 100);
    return () => window.clearInterval(id);
  }, [on, dur]);
  const done = pos / dur;
  return (
    <div className={'ms-voice' + (out ? ' ms-voice--out' : '')}>
      <button type="button" className="ms-voice__btn" onClick={() => setOn((v) => !v)} aria-label={on ? 'Pause voice message' : 'Play voice message'}><Icon name={on ? 'pause' : 'play'} width="16" height="16" aria-hidden="true" /></button>
      <span className="ms-voice__bars" aria-hidden="true">{bars.current.map((h, i) => <i key={i} style={{ height: h }} className={i / bars.current.length < done ? 'is-on' : ''} />)}</span>
      <span className="ms-voice__time">{fmtDur(on || pos ? pos : dur)}</span>
    </div>
  );
}

/** A Messenger-style voice call. onEnd(seconds, answered). */
export function CallScreen({ conv, onEnd }) {
  const [phase, setPhase] = useState('calling');
  const [sec, setSec] = useState(0);
  const [muted, setMuted] = useState(false);
  const started = useRef(0);
  const endBtn = useRef(null);
  useEffect(() => {
    if (endBtn.current) endBtn.current.focus();
    const t = window.setTimeout(() => { setPhase('live'); started.current = Date.now(); }, 2600);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => {
    if (phase !== 'live') return undefined;
    const id = window.setInterval(() => setSec((Date.now() - started.current) / 1000), 500);
    return () => window.clearInterval(id);
  }, [phase]);
  const end = () => onEnd(phase === 'live' ? Math.max(1, Math.round(sec)) : 0, phase === 'live');
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') end(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });
  const via = (CHANNELS[conv.ch] || {}).call ? channelName(conv.ch) : 'phone';
  return (
    <div className="ms-call" role="dialog" aria-modal="true" aria-label={'Voice call with ' + conv.name}>
      <div className="ms-call__card">
        <div className={'ms-call__av' + (phase === 'calling' ? ' is-ringing' : '')}>
          <i aria-hidden="true" /><i aria-hidden="true" />
          <Avatar name={conv.name} size={96} />
        </div>
        <p className="ms-call__name">{conv.name}</p>
        <p className="ms-call__state" aria-live="polite">{phase === 'calling' ? 'Calling on ' + via + '…' : fmtDur(sec)}</p>
        <div className="ms-call__acts">
          <button type="button" className={'ms-call__btn' + (muted ? ' is-on' : '')} aria-pressed={muted} onClick={() => setMuted((v) => !v)} aria-label={muted ? 'Unmute' : 'Mute'}><Icon name={muted ? 'mic-off' : 'mic'} width="20" height="20" aria-hidden="true" /></button>
          <button ref={endBtn} type="button" className="ms-call__btn ms-call__btn--end" onClick={end} aria-label="End call"><Icon name="phone-off" width="20" height="20" aria-hidden="true" /></button>
        </div>
      </div>
    </div>
  );
}

function ReactPicker({ mine, onPick, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const first = ref.current && ref.current.querySelector('button');
    if (first) first.focus();
    const off = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', off); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc); };
  }, [onClose]);
  return (
    <div className="ms-picker" ref={ref} role="menu" aria-label="React">
      {REACTIONS.map((e) => <button key={e} type="button" role="menuitemradio" aria-checked={mine === e} className={mine === e ? 'is-on' : ''} onClick={() => onPick(e)} aria-label={'React ' + e}>{e}</button>)}
    </div>
  );
}

// ---- composer ---------------------------------------------------------------------------------------------------------
function Composer({ conv, data, me, mode, status, now, onSend, onSchedule, onReplies, replyTo, onClearReply, draftIn }) {
  const [note, setNote] = useState(false);
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [pick, setPick] = useState(0);
  const drafts = useRef({});
  const ta = useRef(null);
  const file = useRef(null);
  useEffect(() => { setText(drafts.current[conv.id] || ''); setFiles([]); setNote(false); }, [conv.id]);
  useEffect(() => { if (replyTo) { setNote(false); focus(); } }, [replyTo]); // eslint-disable-line react-hooks/exhaustive-deps
  // a draft handed in from outside (Edit on a GridAI reply, a saved reply picked in the side panel)
  useEffect(() => { if (draftIn && draftIn.conv === conv.id) { setNote(false); setDraft(draftIn.text); focus(); } }, [draftIn]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 168) + 'px';
  }, [text]);
  const setDraft = (v) => { setText(v); drafts.current[conv.id] = v; };
  const ctx = { name: conv.name, store: conv.company, agent: staffName(me) };
  const replies = data.replies;

  const slash = !note ? /^\/(\S*)$/.exec(text) : null;
  const slashList = slash ? replies.filter((r) => (r.short + ' ' + r.title).toLowerCase().includes(slash[1].toLowerCase())).slice(0, 6) : [];
  const at = note ? /(^|\s)@([A-Za-z]*)$/.exec(text) : null;
  const atList = at ? TEAM.filter((p) => p.id !== me && firstName(p.name).toLowerCase().startsWith(at[2].toLowerCase())) : [];
  const pickAt = (p) => { setDraft(text.replace(/@([A-Za-z]*)$/, '@' + firstName(p.name) + ' ')); focus(); };
  useEffect(() => { setPick(0); }, [slash && slash[1], at && at[2]]); // eslint-disable-line react-hooks/exhaustive-deps
  const focus = () => window.requestAnimationFrame(() => { if (ta.current) { ta.current.focus(); const n = ta.current.value.length; ta.current.setSelectionRange(n, n); } });
  const applyReply = (r) => { setDraft(fillReply(r.body, ctx)); countReplyUse(r.id); focus(); };
  const insert = (s) => {
    const el = ta.current;
    const a = el ? el.selectionStart : text.length, b = el ? el.selectionEnd : text.length;
    setDraft(text.slice(0, a) + s + text.slice(b));
    window.requestAnimationFrame(() => { if (el) { el.focus(); el.setSelectionRange(a + s.length, a + s.length); } });
  };
  const message = () => {
    const body = text.trim();
    const re = replyTo && !note ? { replyTo: replyTo.id } : {};
    return note ? { from: 'note', by: me, type: 'text', text: body } : { from: 'agent', by: me, type: 'text', text: body, files, status: 'sent', ...re };
  };
  const clear = () => { setDraft(''); setFiles([]); if (onClearReply) onClearReply(); focus(); };
  const submit = () => {
    if (!text.trim() && !files.length) { focus(); return; }
    if (note && !text.trim()) { toast('Write the note first', { tone: 'error' }); return; }
    onSend([message()]);
    clear();
  };
  const later = (ms) => {
    if (!text.trim() && !files.length) { toast('Write the message first', { tone: 'error' }); return; }
    if (onSchedule({ text: text.trim(), files }, ms)) clear();
  };
  const like = () => { onSend([{ from: 'agent', by: me, type: 'text', text: '👍', files: [], status: 'sent', ...(replyTo ? { replyTo: replyTo.id } : {}) }]); if (onClearReply) onClearReply(); };
  const onKey = (e) => {
    if (atList.length) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setPick((p) => (p + 1) % atList.length); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setPick((p) => (p - 1 + atList.length) % atList.length); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); pickAt(atList[Math.min(pick, atList.length - 1)]); return; }
    }
    if (e.key === 'Escape' && replyTo && onClearReply) { e.preventDefault(); onClearReply(); return; }
    if (slashList.length) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setPick((p) => (p + 1) % slashList.length); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setPick((p) => (p - 1 + slashList.length) % slashList.length); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); applyReply(slashList[Math.min(pick, slashList.length - 1)]); return; }
      if (e.key === 'Escape') { e.preventDefault(); setDraft(''); return; }
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); }
  };
  const pickFiles = (e) => {
    const list = [...(e.target.files || [])].map((f) => f.name);
    e.target.value = '';
    if (!list.length) return;
    setFiles((x) => [...new Set([...x, ...list])].slice(0, 6));
    focus();
  };

  const suggest = mode !== 'off' && !note && status !== 'closed' ? aiSuggestions(conv, me) : [];
  const quick = [...replies].sort((a, b) => (b.uses || 0) - (a.uses || 0)).slice(0, 3);
  const empty = !text.trim() && !files.length;

  return (
    <div className={'th-composer' + (note ? ' is-note' : '')}>
      {status === 'closed' ? <p className="th-banner"><Icon name="info" width="14" height="14" aria-hidden="true" />This conversation is closed. Sending a reply opens it again.</p> : null}
      {!text && !note ? (
        <div className="th-chips ib-scroll-x" aria-label="Suggested replies">
          {suggest.map((s, i) => <button key={i} type="button" className="ib-chip th-chip th-chip--ai" onClick={() => { setDraft(s); focus(); }} title={s}><Icon name="sparkles" width="14" height="14" aria-hidden="true" /><span>{s}</span></button>)}
          {suggest.length ? <span className="th-chips__sep" aria-hidden="true" /> : null}
          {quick.map((r) => <button key={r.id} type="button" className={'ib-chip th-chip' + (r.lang === 'bn' ? ' ib-bn' : '')} onClick={() => applyReply(r)} title={fillReply(r.body, ctx)}><span>{r.title}</span></button>)}
        </div>
      ) : null}
      {replyTo && !note ? (
        <div className="ms-replybar">
          <Icon name="reply" width="16" height="16" aria-hidden="true" />
          <span className="ms-replybar__text"><b>Replying to {replyTo.from === 'contact' ? conv.name : replyTo.from === 'ai' ? 'GridAI' : replyTo.by === me ? 'yourself' : staffName(replyTo.by)}</b><span>{previewOf(replyTo)}</span></span>
          <button type="button" className="gc-iconbtn" aria-label="Cancel reply" onClick={onClearReply}><Icon name="x" width="16" height="16" /></button>
        </div>
      ) : null}
      <div className="th-box">
        {atList.length ? (
          <ul className="th-slash" role="listbox" aria-label="Mention a teammate">
            {atList.map((p, i) => (
              <li key={p.id} role="option" aria-selected={i === pick}>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); pickAt(p); }} onMouseEnter={() => setPick(i)}>
                  <span className="th-slash__top"><b>@{firstName(p.name)}</b><span className="ib-muted">{p.title}</span></span>
                  <span className="ib-sub">{p.name}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {slashList.length ? (
          <ul className="th-slash" role="listbox" aria-label="Saved replies">
            {slashList.map((r, i) => (
              <li key={r.id} role="option" aria-selected={i === pick}>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); applyReply(r); }} onMouseEnter={() => setPick(i)}>
                  <span className="th-slash__top"><b className={r.lang === 'bn' ? 'ib-bn' : ''}>{r.title}</b><span className="ib-data ib-muted">/{r.short}</span></span>
                  <span className={'ib-sub th-trunc' + (r.lang === 'bn' ? ' ib-bn' : '')}>{fillReply(r.body, ctx)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : slash ? <p className="th-slash th-slash--empty">No saved reply matches “/{slash[1]}”. <button type="button" className="ib-link th-linkbtn" onClick={onReplies}>Manage saved replies</button></p> : null}
        <div className="th-mode">
          <div className="th-tabs" role="tablist" aria-label="Message type">
            <button type="button" role="tab" aria-selected={!note} onClick={() => setNote(false)}>Reply</button>
            <button type="button" role="tab" aria-selected={note} onClick={() => { setNote(true); setFiles([]); }}><Icon name="lock" width="12" height="12" aria-hidden="true" />Internal note</button>
          </div>
          <span className="th-window">{note ? 'Only the team sees notes' : (CHANNELS[conv.ch] || {}).window}</span>
        </div>
        {files.length ? (
          <div className="th-attach">
            {files.map((f) => <span key={f} className="ms-file"><Icon name="paperclip" width="14" height="14" aria-hidden="true" /><span>{f}</span><button type="button" className="th-attach__x" aria-label={'Remove ' + f} onClick={() => setFiles((x) => x.filter((y) => y !== f))}><Icon name="x" width="12" height="12" /></button></span>)}
          </div>
        ) : null}
        <textarea ref={ta} className="th-input" rows="1" value={text} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKey}
          placeholder={note ? 'Note for the team — type @ to mention someone' : `Reply to ${firstName(conv.name)} · type / for saved replies`}
          aria-label={note ? `Internal note about ${conv.name}` : `Reply to ${conv.name}`} />
        <div className="th-tools">
          <div className="th-tools__icons ib-scroll-x">
            <Menu label="Emoji" up align="left" button={({ toggle, open }) => <button type="button" className="gc-iconbtn" aria-expanded={open} onClick={toggle} aria-label="Emoji" title="Emoji"><Icon name="smile" width="18" height="18" /></button>}>
              {(close) => <div className="th-emoji">{EMOJI.map((e) => <button key={e} type="button" onClick={() => { insert(e); close(); }} aria-label={'Insert ' + e}>{e}</button>)}</div>}
            </Menu>
            <button type="button" className="gc-iconbtn" onClick={onReplies} aria-label="Saved replies" title="Saved replies (type /)"><Icon name="zap" width="18" height="18" /></button>
            {!note ? <>
              <button type="button" className="gc-iconbtn" onClick={() => file.current && file.current.click()} aria-label="Attach files" title="Attach files"><Icon name="paperclip" width="18" height="18" /></button>
              <input ref={file} type="file" multiple hidden onChange={pickFiles} />
              <Menu label="Send later" up align="left" button={({ toggle, open }) => <button type="button" className="gc-iconbtn" aria-expanded={open} onClick={toggle} aria-label="Send later" title="Send later"><Icon name="clock" width="18" height="18" /></button>}>
                {(close) => (
                  <>
                    <p className="ib-menu__head">Send later</p>
                    {laterChoices(now).map(([label, t]) => <MenuItem key={label} onClick={() => { close(); later(t); }} hint={whenText(t, now)}>{label}</MenuItem>)}
                    <WhenForm now={now} label="Send at" onPick={(t) => { close(); later(t); }} />
                  </>
                )}
              </Menu>
            </> : null}
          </div>
          <span className="th-hint" aria-hidden="true">{note ? 'Type @ to mention a teammate' : 'Enter to send · Shift+Enter new line'}</span>
          {!note && empty ? (
            <button key="like" type="button" className="ms-like" onClick={like} aria-label="Send a thumbs up" title="Send 👍"><span aria-hidden="true">👍</span></button>
          ) : (
            <button key="send" type="button" className={'gc-btn gc-btn--solid th-send ms-pop' + (note ? ' th-send--note' : '')} onClick={submit} disabled={note ? !text.trim() : empty}>
              <Icon name={note ? 'sticky-note' : 'send'} width="16" height="16" aria-hidden="true" /><span className="th-lbl">{note ? 'Add note' : 'Send'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const THREAD_CSS = `
.th-head{display:flex;align-items:center;gap:var(--space-2);flex:none;min-height:64px;padding:var(--space-2) var(--space-3) var(--space-2) var(--space-4);border-bottom:1px solid var(--border-subtle);background:var(--surface-card)}
.th-back{display:none;flex:none}
.th-who{flex:1;min-width:0;display:flex;align-items:center;gap:var(--space-3);padding:var(--space-1);margin:calc(var(--space-1) * -1);border:0;border-radius:var(--radius-lg);background:none;text-align:left;cursor:pointer}
.th-who:hover{background:var(--surface-subtle)}
.th-who__text{min-width:0;display:flex;flex-direction:column}
.th-who__name{display:flex;align-items:center;gap:var(--space-2);min-width:0}
.th-name{margin:0;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.th-who__name .gc-badge{flex:none}
.th-who__sub{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.th-acts{display:flex;align-items:center;gap:var(--space-1);flex:none}
.th-assign,.th-ai{gap:var(--space-1-5);padding:0 var(--space-2) 0 var(--space-1-5)}
.th-ai--assist{color:var(--accent-text)}
.th-ai--auto{border-color:color-mix(in srgb,var(--accent) 45%,transparent);background:var(--fill-accent-soft);color:var(--accent-text)}
.th-flag--urgent{color:var(--text-danger)}
.th-flag--high{color:var(--text-warning)}
.th-only-xs{display:none}
.th-when{align-items:center}
.th-when .gc-input{flex:1;min-width:0}
.th-aibar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);flex:none;padding:var(--space-2) var(--space-4);border-bottom:1px solid var(--border-subtle);background:var(--fill-accent-soft);font-size:var(--text-xs);color:var(--accent-text)}
.th-aibar>span{flex:1 1 220px;min-width:0}
.th-aibar b{font-weight:var(--weight-semibold)}
.th-scrollwrap{position:relative;flex:1;min-height:0;display:flex}
.th-msgs{flex:1;min-width:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;display:flex;flex-direction:column;gap:var(--space-1);padding:var(--space-5) var(--space-6) var(--space-6)}
.th-spacer{flex:none;width:28px}
.th-meta{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-1-5);margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.th-trunc{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.th-note{align-self:flex-end;max-width:min(80%,560px);margin-top:var(--space-2);padding:var(--space-2-5) var(--space-3-5);border:1px dashed color-mix(in srgb,var(--warning) 60%,transparent);border-radius:var(--radius-xl);background:var(--fill-warning-soft)}
.th-note__label{display:flex;align-items:center;gap:var(--space-1);margin:0 0 var(--space-1);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-warning)}
.th-note__text{margin:0 0 var(--space-1);font-size:var(--text-sm);line-height:var(--text-sm-lh);color:var(--text-heading);white-space:pre-wrap;overflow-wrap:anywhere}
.th-sys{align-self:center;display:inline-flex;align-items:center;gap:var(--space-1-5);max-width:92%;margin:var(--space-2-5) 0 var(--space-1);padding:var(--space-1) var(--space-3);border-radius:var(--radius-full);background:var(--surface-quiet);font-size:var(--text-xs);color:var(--text-body);text-align:center}
.th-sys svg{flex:none;color:var(--text-muted)}
.th-sys__time{flex:none;color:var(--text-muted)}
.th-jump{position:absolute;right:var(--space-5);bottom:var(--space-4);display:inline-flex;align-items:center;gap:var(--space-1-5);height:36px;padding:0 var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);color:var(--primary);font-size:var(--text-xs);font-weight:var(--weight-medium);box-shadow:var(--shadow-lg);cursor:pointer}
.th-approve{flex:none;display:flex;flex-direction:column;gap:var(--space-2);max-height:40%;overflow-y:auto;padding:var(--space-3) var(--space-4);border-top:1px solid color-mix(in srgb,var(--warning) 40%,transparent);background:var(--fill-warning-soft)}
.th-approve__head{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-1-5);margin:0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-warning)}
.th-approve__head b{display:inline-grid;place-items:center;min-width:20px;height:20px;padding:0 6px;border-radius:var(--radius-full);background:var(--fill-warning);color:var(--text-inverse);font-size:var(--text-2xs);font-weight:var(--weight-medium)}
.th-approve__head span{font-weight:var(--weight-regular);color:var(--text-body)}
.th-approve__item{display:flex;flex-direction:column;align-items:flex-start;gap:var(--space-2);padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-sm)}
.th-approve__text{margin:0;font-size:var(--text-sm);line-height:var(--text-sm-lh);color:var(--text-heading);white-space:pre-wrap}
.th-approve__edit{width:100%;height:auto;min-height:72px;padding:var(--space-2) var(--space-3);resize:vertical;line-height:1.5}
.th-approve__acts{display:flex;flex-wrap:wrap;gap:var(--space-2);align-self:flex-end}
.th-sched{flex:none;display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle);background:var(--surface-card)}
.th-sched__item{display:flex;align-items:center;gap:var(--space-2);min-height:36px;font-size:var(--text-xs);color:var(--text-body)}
.th-sched__item>svg{flex:none;color:var(--primary)}
.th-sched__text{flex:1;min-width:0;display:flex;gap:var(--space-2)}
.th-sched__text b{flex:none;font-weight:var(--weight-medium);color:var(--text-heading)}
.th-sched__text span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.th-composer{flex:none;display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-2) var(--space-4) var(--space-4);border-top:1px solid var(--border-subtle);background:var(--surface-card)}
.th-banner{display:flex;align-items:center;gap:var(--space-1-5);margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.th-chips{align-items:center;padding-top:var(--space-1)}
.th-chip{height:30px;max-width:300px}
.th-chip span{overflow:hidden;text-overflow:ellipsis}
.th-chip--ai{border-color:color-mix(in srgb,var(--accent) 35%,transparent);background:var(--fill-accent-soft);color:var(--accent-text)}
.th-chip--ai:hover{color:var(--accent-text);border-color:var(--accent)}
.th-chips__sep{flex:none;width:1px;height:20px;background:var(--border-subtle)}
.th-box{position:relative;border:1px solid var(--border-field);border-radius:var(--radius-xl);background:var(--surface-card);transition:var(--transition-colors);box-shadow:0 1px 2px rgba(15,23,42,.04)}
.th-box:focus-within{border-color:var(--border-field-focus);box-shadow:0 0 0 3px var(--focus-ring),0 6px 18px -8px rgba(15,23,42,.16)}
.is-note .th-box{border-color:color-mix(in srgb,var(--warning) 60%,transparent);background:var(--fill-warning-soft)}
.th-mode{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-1-5) var(--space-2) 0}
.th-tabs{display:flex;gap:2px}
.th-tabs button{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 var(--space-2-5);border:0;border-radius:var(--radius-full);background:none;color:var(--text-muted);font-size:var(--text-xs);font-weight:var(--weight-medium);cursor:pointer}
.th-tabs button:hover{color:var(--text-heading)}
.th-tabs button[aria-selected="true"]{background:var(--surface-quiet);color:var(--text-heading)}
.is-note .th-tabs button[aria-selected="true"]{background:color-mix(in srgb,var(--warning) 22%,transparent);color:var(--text-warning)}
.th-window{min-width:0;margin-left:auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-xs);color:var(--text-muted)}
.th-attach{display:flex;flex-wrap:wrap;gap:var(--space-1-5);margin:var(--space-2) var(--space-3) 0}
.th-attach__x{display:inline-grid;place-items:center;width:18px;height:18px;padding:0;border:0;border-radius:var(--radius-full);background:none;color:var(--text-muted);cursor:pointer}
.th-attach__x:hover{background:var(--surface-quiet);color:var(--text-heading)}
.th-input,.th-input:focus,.th-input:focus-visible{box-shadow:none;outline:none}
.th-input{display:block;width:100%;min-height:44px;max-height:168px;margin:0;padding:var(--space-2-5) var(--space-3-5);border:0;background:none;color:var(--text-heading);font-size:var(--text-sm-plus);line-height:var(--text-sm-lh);resize:none;outline:none}
.th-input::placeholder{color:color-mix(in srgb,var(--text-muted) 80%,transparent)}
.th-tools{display:flex;align-items:center;gap:var(--space-2);padding:0 var(--space-2) var(--space-2)}
.th-tools__icons{flex:1;min-width:0;gap:0;align-items:center}
.th-tools__icons .gc-iconbtn{flex:none}
.th-hint{flex:none;font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.th-send{flex:none;height:40px;padding:0 var(--space-4)}
.th-send--note{background:var(--fill-warning);color:var(--text-inverse)}
.th-send--note:hover,.th-send--note:focus{background:var(--fill-warning)}
.th-emoji{display:grid;grid-template-columns:repeat(6,36px);gap:2px;padding:var(--space-1) var(--space-2)}
.th-emoji button{width:36px;height:36px;border:0;border-radius:var(--radius-md);background:none;font-size:var(--text-lg);line-height:1;cursor:pointer}
.th-emoji button:hover{background:var(--surface-subtle)}
.th-slash{position:absolute;left:0;right:0;bottom:calc(100% + var(--space-2));z-index:var(--z-dropdown);list-style:none;margin:0;padding:var(--space-1);max-height:280px;overflow-y:auto;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-lg)}
.th-slash--empty{padding:var(--space-3) var(--space-4);font-size:var(--text-sm);color:var(--text-muted)}
.th-slash li button{display:flex;flex-direction:column;gap:2px;width:100%;padding:var(--space-2) var(--space-3);border:0;border-radius:var(--radius-lg);background:none;text-align:left;cursor:pointer}
.th-slash li[aria-selected="true"] button{background:var(--fill-primary-soft)}
.th-slash__top{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-sm)}
.th-slash__top b{font-weight:var(--weight-medium);color:var(--text-heading)}
.th-linkbtn{padding:0;border:0;background:none;cursor:pointer}
.ms-callbtn{color:var(--primary)}
.ms-time{align-self:center;margin:var(--space-3) 0 var(--space-1);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.ms-time:first-child{margin-top:0}
.ms-row{position:relative;display:flex;align-items:flex-end;gap:var(--space-2);max-width:min(72%,640px)}
.ms-row.g-first,.ms-row.g-single{margin-top:var(--space-2)}
.ms-row--out{align-self:flex-end;flex-direction:row-reverse}
.ms-row.has-react{margin-bottom:var(--space-3)}
.ms-col{position:relative;min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:2px}
.ms-row--out .ms-col{align-items:flex-end}
.ms-who{display:inline-flex;align-items:center;gap:4px;margin:0 var(--space-3) 2px;font-size:var(--text-xs);color:var(--text-muted)}
.ms-row--ai .ms-who{color:var(--accent-text)}
.ms-body{position:relative;max-width:100%}
.ms-bubble{margin:0;padding:var(--space-2) var(--space-3-5);border-radius:var(--radius-2xl);font-size:var(--text-sm-plus);line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere}
.ms-row--in .ms-bubble{background:var(--surface-quiet);color:var(--text-heading)}
.ms-row--out .ms-bubble{background:var(--primary);color:var(--text-inverse)}
.ms-row--ai .ms-bubble{background:var(--fill-accent-soft);color:var(--text-heading);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent) 30%,transparent)}
.ms-row--in.g-first .ms-bubble{border-bottom-left-radius:var(--radius-sm)}
.ms-row--in.g-mid .ms-bubble{border-top-left-radius:var(--radius-sm);border-bottom-left-radius:var(--radius-sm)}
.ms-row--in.g-last .ms-bubble{border-top-left-radius:var(--radius-sm)}
.ms-row--out.g-first .ms-bubble{border-bottom-right-radius:var(--radius-sm)}
.ms-row--out.g-mid .ms-bubble{border-top-right-radius:var(--radius-sm);border-bottom-right-radius:var(--radius-sm)}
.ms-row--out.g-last .ms-bubble{border-top-right-radius:var(--radius-sm)}
.ms-emoji{margin:0;font-size:calc(var(--text-xl) * 2);line-height:1.1}
.ms-media{display:flex;flex-direction:column;gap:4px}
.ms-row--out .ms-media{align-items:flex-end}
.ms-files{display:flex;flex-wrap:wrap;gap:var(--space-1-5)}
.ms-row--out .ms-files{justify-content:flex-end}
.ms-file{display:inline-flex;align-items:center;gap:var(--space-1-5);max-width:260px;min-height:32px;padding:0 var(--space-2-5);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-heading)}
.ms-file>svg{flex:none;color:var(--primary)}
.ms-file>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ms-callb{display:flex;flex-direction:column;min-width:200px;border-radius:var(--radius-2xl);background:var(--surface-quiet);overflow:hidden}
.ms-callb__row{display:flex;align-items:center;gap:var(--space-2-5);padding:var(--space-2-5) var(--space-3)}
.ms-callb__ic{display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:var(--radius-full);background:var(--surface-card);color:var(--text-heading)}
.ms-callb.is-missed .ms-callb__ic{color:var(--text-danger)}
.ms-callb__text{display:flex;flex-direction:column;font-size:var(--text-sm);color:var(--text-heading)}
.ms-callb__text b{font-weight:var(--weight-semibold)}
.ms-callb__text small{font-size:var(--text-xs);color:var(--text-muted);font-family:var(--font-data)}
.ms-callb__back{height:36px;border:0;border-top:1px solid var(--border-subtle);background:none;color:var(--primary);font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer}
.ms-callb__back:hover{background:var(--surface-subtle)}
.ms-quote{display:flex;flex-direction:column;gap:2px;max-width:100%;margin-bottom:-6px;padding:var(--space-1-5) var(--space-3) var(--space-3);border-radius:var(--radius-xl);background:var(--surface-subtle);opacity:.85}
.ms-quote__lbl{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);color:var(--text-muted)}
.ms-quote__txt{font-size:var(--text-xs);color:var(--text-body);overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.ms-reacts{position:absolute;right:4px;bottom:-14px;display:inline-flex;align-items:center;gap:1px;height:20px;padding:0 5px;border-radius:var(--radius-full);background:var(--surface-card);box-shadow:var(--shadow-sm);font-size:var(--text-xs);animation:ms-react 260ms cubic-bezier(.34,1.56,.64,1)}
.ms-reacts i{font-style:normal;line-height:1}
.ms-reacts b{margin-left:3px;font-weight:var(--weight-medium);color:var(--text-muted)}
.ms-acts{position:absolute;top:50%;display:flex;align-items:center;gap:2px;transform:translateY(-50%);opacity:0;pointer-events:none;transition:opacity 120ms ease-out}
.ms-row--in .ms-acts{left:calc(100% + 6px)}
.ms-row--out .ms-acts{right:calc(100% + 6px);flex-direction:row-reverse}
.ms-row:hover .ms-acts,.ms-row:focus-within .ms-acts,.ms-row.is-active .ms-acts,.ms-acts.is-open{opacity:1;pointer-events:auto}
.ms-row--in .ms-picker{left:0}
.ms-row--out .ms-picker{right:0}
.ms-act{display:grid;place-items:center;width:28px;height:28px;border:0;border-radius:var(--radius-full);background:none;color:var(--text-muted);cursor:pointer}
.ms-act:hover{background:var(--surface-subtle);color:var(--text-heading)}
.ms-seen{display:inline-flex;align-self:flex-end;margin-top:2px;color:var(--text-muted);animation:ms-fadein var(--duration-base) ease-out}
.ms-seen--delivered{color:var(--primary)}
.ms-seen__dot{display:grid;place-items:center;width:16px;height:16px;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-size:var(--text-2xs);font-weight:var(--weight-semibold);line-height:1}
.ms-typing{display:flex;align-items:center;gap:4px;padding:var(--space-3) var(--space-3-5)}
.ms-typing i{width:7px;height:7px;border-radius:var(--radius-full);background:var(--text-muted);animation:ms-bounce 1.2s infinite ease-in-out}
.ms-typing i:nth-child(2){animation-delay:.15s}.ms-typing i:nth-child(3){animation-delay:.3s}
@keyframes ms-bounce{0%,60%,100%{transform:none;opacity:.45}30%{transform:translateY(-4px);opacity:1}}
.ms-new .ms-body,.ms-new.th-sys,.ms-new.th-note,.ms-new .ms-typing{animation:ms-in 220ms cubic-bezier(.23,1,.32,1) both}
.ms-row--in.ms-new .ms-body{transform-origin:bottom left}
.ms-row--out.ms-new .ms-body{transform-origin:bottom right}
.ms-new.is-big .ms-body{animation:ms-big 380ms cubic-bezier(.34,1.56,.64,1) both}
@keyframes ms-in{from{opacity:0;transform:translateY(8px) scale(.96)}}
@keyframes ms-big{from{opacity:0;transform:scale(.4)}}
@keyframes ms-react{from{opacity:0;transform:scale(.4)}}
@keyframes ms-fadein{from{opacity:0}}
.ms-replybar{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-1-5) var(--space-2) var(--space-1-5) var(--space-3);border-left:3px solid var(--primary);border-radius:var(--radius-md);background:var(--surface-subtle);color:var(--text-muted);animation:ms-in 180ms cubic-bezier(.23,1,.32,1)}
.ms-replybar__text{flex:1;min-width:0;display:flex;flex-direction:column;font-size:var(--text-xs)}
.ms-replybar__text b{font-weight:var(--weight-medium);color:var(--text-heading)}
.ms-replybar__text span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ms-like{display:grid;place-items:center;flex:none;width:40px;height:40px;border:0;border-radius:var(--radius-full);background:none;font-size:var(--text-xl);line-height:1;cursor:pointer;transition:transform 160ms cubic-bezier(.23,1,.32,1);animation:ms-fadein 160ms ease-out}
.ms-like:active{transform:scale(.85)}
@media (hover:hover) and (pointer:fine){.ms-like:hover{transform:scale(1.12)}}
.ms-pop{animation:ms-big 220ms cubic-bezier(.23,1,.32,1)}
.ms-voice{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-1-5) var(--space-3) var(--space-1-5) var(--space-1-5);border-radius:var(--radius-full);background:var(--surface-quiet);color:var(--text-heading)}
.ms-voice--out{background:var(--primary);color:var(--text-inverse)}
.ms-voice__btn{display:grid;place-items:center;flex:none;width:32px;height:32px;border:0;border-radius:var(--radius-full);background:var(--primary);color:var(--text-inverse);cursor:pointer}
.ms-voice--out .ms-voice__btn{background:var(--surface-card);color:var(--primary)}
.ms-voice__bars{display:flex;align-items:center;gap:2px;height:26px}
.ms-voice__bars i{display:block;width:3px;border-radius:var(--radius-full);background:color-mix(in srgb,var(--text-muted) 55%,transparent)}
.ms-voice__bars i.is-on{background:var(--primary)}
.ms-voice__time{font-family:var(--font-data);font-size:var(--text-xs);min-width:30px}
.ms-call{position:fixed;inset:0;z-index:var(--z-modal,1000);display:grid;place-items:center;padding:var(--space-4);background:color-mix(in srgb,var(--navy-950) 55%,transparent);animation:ms-fadein var(--duration-base) ease-out}
.ms-call__card{display:flex;flex-direction:column;align-items:center;width:min(320px,100%);padding:var(--space-8) var(--space-5) var(--space-6);border-radius:var(--radius-2xl);background:linear-gradient(180deg,var(--navy-800),var(--navy-950));color:var(--text-inverse);box-shadow:var(--shadow-xl);animation:ms-rise 260ms cubic-bezier(.23,1,.32,1)}
.ms-call__av{position:relative;display:grid;place-items:center;width:96px;height:96px;margin-bottom:var(--space-4)}
.ms-call__av>i{position:absolute;inset:0;border-radius:var(--radius-full);border:2px solid color-mix(in srgb,var(--text-inverse) 55%,transparent);opacity:0}
.ms-call__av.is-ringing>i{animation:ms-ring 1.8s cubic-bezier(.23,1,.32,1) infinite}
.ms-call__av.is-ringing>i+i{animation-delay:.6s}
.ms-call__av .ib-av{position:relative}
@keyframes ms-ring{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.7);opacity:0}}
@keyframes ms-rise{from{opacity:0;transform:translateY(12px) scale(.97)}}
.ms-call__name{margin:0;font-size:var(--text-lg);font-weight:var(--weight-semibold)}
.ms-call__state{margin:var(--space-1) 0 var(--space-6);font-size:var(--text-sm);opacity:.75;font-variant-numeric:tabular-nums}
.ms-call__acts{display:flex;gap:var(--space-4)}
.ms-call__btn{display:grid;place-items:center;width:52px;height:52px;border:0;border-radius:var(--radius-full);background:color-mix(in srgb,var(--text-inverse) 16%,transparent);color:var(--text-inverse);cursor:pointer}
.ms-call__btn.is-on{background:var(--text-inverse);color:var(--navy-900)}
.ms-call__btn--end{background:var(--error)}
.ms-picker{position:absolute;bottom:calc(100% + 4px);z-index:var(--z-dropdown,50);display:flex;gap:2px;padding:4px;border-radius:var(--radius-full);background:var(--surface-card);box-shadow:var(--shadow-lg);animation:ms-big 160ms cubic-bezier(.23,1,.32,1)}
.ms-picker button{display:grid;place-items:center;width:36px;height:36px;border:0;border-radius:var(--radius-full);background:none;font-size:var(--text-xl);line-height:1;cursor:pointer;transition:transform 140ms cubic-bezier(.23,1,.32,1)}
.ms-picker button.is-on{background:var(--fill-primary-soft)}
@media (hover:hover) and (pointer:fine){.ms-picker button:hover{transform:scale(1.25) translateY(-2px)}}
.ms-at{padding:0 3px;border-radius:var(--radius-sm);background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-medium)}
@media (prefers-reduced-motion:reduce){
  .ms-new .ms-body,.ms-new.th-sys,.ms-new.th-note,.ms-new .ms-typing,.ms-new.is-big .ms-body,.ms-reacts,.ms-pop,.ms-replybar,.ms-call,.ms-call__card,.ms-picker{animation:ms-fadein 120ms ease-out both}
  .ms-typing i,.ms-call__av.is-ringing>i{animation:none}
}
@media (hover:none){.ms-row--in .ms-acts{left:auto;right:0;top:auto;bottom:calc(100% + 2px);transform:none}.ms-row--out .ms-acts{right:auto;left:0;top:auto;bottom:calc(100% + 2px);transform:none}}
@container (max-width:640px){
  .th-lbl,.th-hint,.th-window{display:none}
  .th-send{width:44px;padding:0}
  .th-msgs{padding:var(--space-4) var(--space-4) var(--space-5)}
  .ms-row,.th-note{max-width:88%}
}
@container (max-width:460px){
  .th-hide-xs{display:none}
  .th-only-xs{display:block}
  .th-head{padding-left:var(--space-2)}
  .th-composer{padding:var(--space-2) var(--space-3) var(--space-3)}
  .th-approve,.th-sched{padding-left:var(--space-3);padding-right:var(--space-3)}
}
`;
