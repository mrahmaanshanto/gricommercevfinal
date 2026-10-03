'use client';
// ChatDock — Messenger chat windows on every page (Facebook-style chat heads). The top bar's chat button lists the
// latest chats (gc-topbar.js); picking one fires `gc:chat-open` and the chat opens here in a small window docked above
// the GridAI button: the messages (MessageList from Thread.jsx), voice messages, a call button, 👍 and send. A window can
// be minimised to a round chat head (with its unread count) or opened in the full Inbox. Up to three windows on a
// desktop, one full-screen window on phones. Shown only on pages with the merchant top bar, and not on the Inbox itself.
// Windows stay open while moving between pages (the root layout keeps this component mounted).

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { getConvs, addMessages, patchConv, markRead, channelName, comeback, lockOf, ME } from '@/lib/inbox';
import { useInbox, useMedia, Avatar, PARTS_CSS } from './parts';
import { MessageList, canCall, endCall, THREAD_CSS } from './Thread';
import { VoiceRecorder, CallScreen } from './Messenger';
import { keepVoice } from '@/lib/inbox';

export const CHAT_OPEN_EVENT = 'gc:chat-open';
const MAX = 3;
const mid = () => 'm-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function ChatDock() {
  const path = usePathname() || '';
  const phone = useMedia('(max-width:640px)');
  const data = useInbox(() => ({ convs: getConvs() }));
  const [wins, setWins] = useState([]);   // [{ id, min }]
  const [typing, setTyping] = useState('');
  const [shell, setShell] = useState(false);   // the page has the merchant top bar (where the chat button is)
  useEffect(() => {
    const look = () => setShell(!!document.querySelector('gc-topbar'));
    look();
    const t = window.setTimeout(look, 400);
    return () => window.clearTimeout(t);
  }, [path]);
  const demoDone = useRef(new Set());
  const timers = useRef([]);
  useEffect(() => {
    const open = (e) => {
      const id = e.detail && e.detail.id;
      if (!id) return;
      markRead(id);
      setWins((w) => {
        const rest = w.filter((x) => x.id !== id);
        const next = [{ id, min: false }, ...rest];
        // keep up to MAX open windows; older ones become chat heads
        let shown = 0;
        return next.map((x) => (!x.min && ++shown > (window.matchMedia('(max-width:640px)').matches ? 1 : MAX) ? { ...x, min: true } : x)).slice(0, 8);
      });
    };
    window.addEventListener(CHAT_OPEN_EVENT, open);
    const list = timers.current;
    return () => { window.removeEventListener(CHAT_OPEN_EVENT, open); list.forEach((t) => window.clearTimeout(t)); };
  }, []);
  if (!data || !shell || path.startsWith('/merchant-inbox') || !wins.length) return null;
  const convOf = (id) => data.convs.find((c) => c.id === id);
  const live = wins.filter((w) => convOf(w.id));
  const setMin = (id, min) => { if (!min) markRead(id); setWins((w) => w.map((x) => (x.id === id ? { ...x, min } : phone && !min ? { ...x, min: true } : x))); };
  const close = (id) => setWins((w) => w.filter((x) => x.id !== id));
  const later = (ms, fn) => timers.current.push(window.setTimeout(fn, ms));
  const send = (id, msgs) => {
    const c = convOf(id);
    if (!c) return;
    const lock = lockOf(id);
    if (lock) { toast(`${lock.name} is replying. Wait until they finish.`, { tone: 'error' }); return; }
    const rows = msgs.map((m) => ({ ...m, id: mid(), at: Date.now() }));
    addMessages(id, rows, { unread: 0, ...(c.status === 'closed' || c.status === 'snoozed' ? { status: 'open', snoozeUntil: null } : {}), ...(c.assignee ? {} : { assignee: ME }) });
    const ids = rows.map((m) => m.id);
    later(900, () => patchConv(id, (x) => ({ messages: x.messages.map((m) => (ids.includes(m.id) && m.status === 'sent' ? { ...m, status: 'delivered' } : m)) })));
    // demo: the customer reads it and answers the first time in each chat
    if (demoDone.current.has(id) || c.blocked) return;
    demoDone.current.add(id);
    later(1800, () => setTyping(id));
    later(4400, () => {
      setTyping('');
      patchConv(id, (x) => ({ messages: x.messages.map((m) => (m.from === 'agent' && m.status !== 'read' ? { ...m, status: 'read' } : m)) }));
      addMessages(id, { from: 'customer', type: 'text', text: comeback(demoDone.current.size) }, (x) => ({ unread: (x.unread || 0) + (wins.find((w) => w.id === id && !w.min) ? 0 : 1) }));
    });
  };
  const heads = live.filter((w) => w.min);
  const open = live.filter((w) => !w.min);
  return (
    <div className={'cd' + (phone ? ' cd--phone' : '')}>
      <style dangerouslySetInnerHTML={{ __html: PARTS_CSS + THREAD_CSS + CD_CSS }} />
      {heads.length ? (
        <div className="cd-heads" aria-label="Minimised chats">
          {heads.map((w) => {
            const c = convOf(w.id);
            return (
              <span key={w.id} className="cd-head">
                <button type="button" className="cd-head__btn" onClick={() => setMin(w.id, false)} aria-label={'Open chat with ' + c.name + (c.unread ? ', ' + c.unread + ' unread' : '')} title={c.name}>
                  <Avatar name={c.name} avatar={c.avatar} pos={c.pos} ch={c.ch} size={48} />
                  {c.unread ? <span className="cd-head__n">{c.unread}</span> : null}
                </button>
                <button type="button" className="cd-head__x" onClick={() => close(w.id)} aria-label={'Close chat with ' + c.name}><Icon name="x" width="12" height="12" aria-hidden="true" /></button>
              </span>
            );
          })}
        </div>
      ) : null}
      {open.map((w) => (
        <ChatWindow key={w.id} conv={convOf(w.id)} typing={typing === w.id} onSend={(msgs) => send(w.id, msgs)}
          onMin={() => setMin(w.id, true)} onClose={() => close(w.id)}
          onExpand={() => { close(w.id); navigate('/merchant-inbox?c=' + encodeURIComponent(w.id)); }} />
      ))}
    </div>
  );
}

function ChatWindow({ conv, typing, onSend, onMin, onClose, onExpand }) {
  const [text, setText] = useState('');
  const [rec, setRec] = useState(false);
  const [calling, setCalling] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const box = useRef(null);
  const input = useRef(null);
  const count = conv.messages.length;
  useEffect(() => { const el = box.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: count ? 'smooth' : 'auto' }); }, [count, typing]);
  useEffect(() => { if (input.current) input.current.focus(); }, []);
  useEffect(() => { if (conv.unread) markRead(conv.id); }, [conv.unread, conv.id]);
  const re = () => (replyTo ? { replyTo: replyTo.id } : {});
  const submit = () => { const t = text.trim(); if (!t) return; onSend([{ from: 'agent', by: ME, type: 'text', text: t, status: 'sent', ...re() }]); setText(''); setReplyTo(null); };
  const like = () => { onSend([{ from: 'agent', by: ME, type: 'text', text: '👍', status: 'sent', ...re() }]); setReplyTo(null); };
  const voice = ({ dur, url }) => { const vk = 'v-' + Date.now().toString(36); keepVoice(vk, url); onSend([{ from: 'agent', by: ME, type: 'voice', dur, vk, status: 'sent', ...re() }]); setRec(false); setReplyTo(null); };
  return (
    <section className="cd-win" aria-label={'Chat with ' + conv.name} onKeyDown={(e) => { if (e.key === 'Escape' && !calling) { e.stopPropagation(); onMin(); } }}>
      <header className="cd-win__head">
        <button type="button" className="cd-win__who" onClick={onExpand} title="Open in Inbox">
          <Avatar name={conv.name} avatar={conv.avatar} pos={conv.pos} ch={conv.ch} size={32} />
          <span className="cd-win__text"><b>{conv.name}</b><small>{channelName(conv.ch)}{conv.phone ? ' · ' + conv.phone : ''}</small></span>
        </button>
        {canCall(conv) && !conv.blocked ? <button type="button" className="cd-ib" onClick={() => setCalling(true)} aria-label={'Voice call ' + conv.name} title="Voice call"><Icon name="phone" width="16" height="16" aria-hidden="true" /></button> : null}
        <button type="button" className="cd-ib" onClick={onExpand} aria-label="Open in Inbox" title="Open in Inbox"><Icon name="maximize-2" width="16" height="16" aria-hidden="true" /></button>
        <button type="button" className="cd-ib" onClick={onMin} aria-label="Minimise" title="Minimise"><Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
        <button type="button" className="cd-ib" onClick={onClose} aria-label="Close chat" title="Close"><Icon name="x" width="16" height="16" aria-hidden="true" /></button>
      </header>
      <div className="cd-win__msgs th-msgs" ref={box} role="log" aria-label={'Messages with ' + conv.name} aria-live="polite">
        <MessageList conv={conv} now={Date.now()} typing={typing} compact onReply={setReplyTo} onCall={() => setCalling(true)} />
      </div>
      {replyTo ? (
        <div className="ms-replybar cd-reply">
          <span className="ms-replybar__text"><b>Replying to {replyTo.from === 'customer' ? conv.name : 'yourself'}</b></span>
          <button type="button" className="cd-ib" aria-label="Cancel reply" onClick={() => setReplyTo(null)}><Icon name="x" width="14" height="14" aria-hidden="true" /></button>
        </div>
      ) : null}
      <footer className="cd-win__foot">
        {conv.blocked ? <p className="cd-blocked">You blocked {conv.name}.</p> : rec ? <VoiceRecorder onSend={voice} onCancel={() => setRec(false)} /> : (
          <>
            <button type="button" className="cd-ib cd-ib--brand" onClick={() => setRec(true)} aria-label="Record a voice message" title="Voice message"><Icon name="mic" width="18" height="18" aria-hidden="true" /></button>
            <label className="cd-input">
              <span className="sr-only">Message {conv.name}</span>
              <textarea ref={input} rows="1" value={text} placeholder="Aa" onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); } }} />
            </label>
            {text.trim()
              ? <button key="s" type="button" className="cd-ib cd-ib--brand ms-pop" onClick={submit} aria-label="Send"><Icon name="send" width="18" height="18" aria-hidden="true" /></button>
              : <button key="l" type="button" className="ms-like cd-like" onClick={like} aria-label="Send a thumbs up"><span aria-hidden="true">👍</span></button>}
          </>
        )}
      </footer>
      {calling ? <CallScreen conv={conv} onEnd={(sec, answered) => { setCalling(false); endCall(conv, sec, answered, onSend); }} /> : null}
    </section>
  );
}

const CD_CSS = `
.cd{position:fixed;right:24px;bottom:84px;z-index:130;display:flex;flex-direction:row-reverse;align-items:flex-end;gap:var(--space-3);pointer-events:none;font-family:var(--font-sans)}
.cd>*{pointer-events:auto}
.cd-heads{display:flex;flex-direction:column-reverse;gap:var(--space-2)}
.cd-head{position:relative;display:block;animation:cd-pop 300ms cubic-bezier(.34,1.56,.64,1)}
.cd-head__btn{position:relative;display:block;padding:0;border:0;border-radius:var(--radius-full);background:none;cursor:pointer;box-shadow:var(--shadow-lg)}
.cd-head__btn .ib-av{box-shadow:0 0 0 2px var(--surface-card)}
.cd-head__n{position:absolute;top:-2px;right:-2px;min-width:18px;height:18px;padding:0 5px;border-radius:var(--radius-full);background:var(--error);color:var(--text-inverse);font-size:var(--text-2xs);font-weight:var(--weight-semibold);line-height:18px;text-align:center;box-shadow:0 0 0 2px var(--surface-card)}
.cd-head__x{position:absolute;top:-6px;left:-6px;display:grid;place-items:center;width:20px;height:20px;border:0;border-radius:var(--radius-full);background:var(--surface-card);color:var(--text-muted);box-shadow:var(--shadow-sm);opacity:0;cursor:pointer;transition:opacity 120ms ease-out}
.cd-head:hover .cd-head__x,.cd-head:focus-within .cd-head__x{opacity:1}
.cd-win{display:flex;flex-direction:column;width:328px;height:min(460px,calc(100dvh - 140px));border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-xl);overflow:hidden;container-type:inline-size;transform-origin:bottom right;animation:cd-rise 240ms cubic-bezier(.23,1,.32,1)}
.cd-win__head{display:flex;align-items:center;gap:2px;padding:var(--space-1-5) var(--space-1-5) var(--space-1-5) var(--space-2);border-bottom:1px solid var(--border-subtle);box-shadow:var(--shadow-xs)}
.cd-win__who{flex:1;min-width:0;display:flex;align-items:center;gap:var(--space-2);padding:var(--space-1);border:0;border-radius:var(--radius-lg);background:none;text-align:left;cursor:pointer}
.cd-win__who:hover{background:var(--surface-subtle)}
.cd-win__text{min-width:0;display:flex;flex-direction:column}
.cd-win__text b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cd-win__text small{font-size:var(--text-xs);color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cd-ib{display:grid;place-items:center;flex:none;width:32px;height:32px;border:0;border-radius:var(--radius-full);background:none;color:var(--primary);cursor:pointer}
.cd-ib:hover{background:var(--surface-subtle)}
.cd-win__msgs{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;display:flex;flex-direction:column;gap:var(--space-1);padding:var(--space-3)}
.cd-win__msgs .ms-row{max-width:86%}
.cd-win__msgs .th-note{max-width:92%}
.cd-win__msgs .th-card{width:min(240px,100%)}
.cd-reply{margin:0 var(--space-2)}
.cd-win__foot{display:flex;align-items:flex-end;gap:var(--space-1);padding:var(--space-2)}
.cd-input{flex:1;min-width:0;display:flex;padding:0 var(--space-3);border-radius:var(--radius-2xl);background:var(--surface-quiet)}
.cd-input textarea:focus,.cd-input textarea:focus-visible{box-shadow:none;outline:none}
.cd-input textarea{flex:1;min-width:0;min-height:36px;max-height:96px;padding:8px 0;border:0;background:none;color:var(--text-heading);font:inherit;font-size:var(--text-sm);resize:none;outline:none}
.cd-input:focus-within{box-shadow:0 0 0 2px var(--border-field-focus)}
.cd-like{width:36px;height:36px}
.cd-blocked{margin:0;padding:var(--space-2);font-size:var(--text-sm);color:var(--text-muted)}
.cd .ms-rec{gap:var(--space-1)}
@keyframes cd-rise{from{opacity:0;transform:translateY(16px) scale(.97)}}
@keyframes cd-pop{from{opacity:0;transform:scale(.5)}}
.cd--phone{right:16px;bottom:84px;z-index:160}
.cd--phone .cd-win{position:fixed;inset:0;z-index:150;width:auto;height:auto;border-radius:0}
@media (prefers-reduced-motion:reduce){.cd-win,.cd-head{animation:none}}
`;
