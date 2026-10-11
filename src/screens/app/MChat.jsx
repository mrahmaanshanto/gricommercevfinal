'use client';
// Merchant app · Chat (/m-chat?id=<conversation>). The design board's layout (design/templates/app/MChat.dc.html) running
// the web Inbox's conversation (/merchant-inbox: lib/inbox.js, components/inbox/Thread.jsx, Copilot.jsx):
//   header     the customer with their channel and whether they are active; Call (the call screen, the call lands in
//              this chat and the call log) and ⋯ (mark done / reopen, assign, GridAI for this chat, customer, snooze,
//              pending, mark unread, create order, create ticket, block)
//   strip      their orders and what they spent (tap: the customer sheet with GridAI's summary, tags, note and
//              orders) and GridAI's mode for this chat (Auto · Assist · Off; Auto needs "Enable auto reply")
//   thread     messages as on the web: groups, Seen, reactions and replies (tap a message), voice, photos, product /
//              order / payment / story / call cards, notes; GridAI's suggested reply at the end while the customer
//              waits (Send · Edit · Again · ✕), or "GridAI is answering · Take over" while it is on Auto
//   composer   quick chips (Saved replies, Share product, Payment link, Create order, Note), + (photo, product,
//              payment link, note), the reply box, voice message (MediaRecorder; inbox.keepVoice) and Send.
//              A teammate writing in the same chat holds the send lock (inbox.lockOf); a closed reply window says so.
// Sending is messages/msgData.js › personReply (the web's act.send: reopen, first-reply assignment, Autopilot
// takeover, delivered / read ticks and the demo customer's answer). ?edit=1 puts GridAI's draft in the reply box.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AppScreen, Content, Sheet, Button, Pill, OrderPill, ListRow, SearchField, Segmented, TextInput, Note, EmptyState, StatRow, Stat,
  Icon, useAppData, useQuery, toast, confirmDialog, money,
} from './kit/AppKit';
import {
  ME, STAFF, channelName, staffName, getConvs, patchConv, addMessages, statusOf, lastAt, replyStateOf, lockOf, holdLock, releaseLock,
  getReplies, fillReply, countReplyUse, reactTo, REACTIONS, keepVoice, snoozeChoices, whenText, clock, ago as inboxAgo, CALL_DIRS,
} from '@/lib/inbox';
import { getOrders } from '@/lib/orders';
import { searchProducts, stockAt } from '@/lib/stock';
import { isStatusSellable } from '@/lib/sellable';
import { connectedInbox } from '@/lib/connections';
import { controlFor } from '@/lib/aiReply';
import { currentUser } from '@/lib/team';
import { can, why } from '@/lib/permissions';
import { customerTurn, summarize, INTENT_WORD } from '@/lib/gridai/engine';
import { autopilotOn } from '@/lib/gridai/inboxAi';
import { markRun } from '@/lib/gridai/usage';
import { logAi } from '@/lib/gridai/activity';
import { Face, XIcon } from './messages/msgParts';
import { Thread, Recorder } from './messages/ChatParts';
import {
  access, sys, ME_NAME, factsOf, fmtPhone, personReply, autopilotReply, waitingMsg, startCall, aiSetup,
} from './messages/msgData';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const CALL_CHANNELS = ['whatsapp', 'facebook', 'instagram', 'telegram'];
const AI_WORD = { auto: 'Auto', assist: 'Assist', off: 'Off' };
const AI_OPTS = [['auto', 'Auto', 'GridAI answers simple questions by itself; the rest come to you.'], ['assist', 'Assist', 'GridAI writes a reply. You check it and send.'], ['off', 'Off', 'GridAI stays out of this chat.']];
const METHODS = [['bkash', 'bKash'], ['nagad', 'Nagad'], ['sslcommerz', 'Card or bank']];
/** The chat's GridAI mode: Auto (Autopilot), Assist (drafts) or Off. */
export function chatAiMode(c) {
  if (!c) return 'assist';
  if (autopilotOn(c)) return 'auto';
  if (c.aiMode === 'off') return 'off';
  if (c.autopilot === false || c.aiMode === 'assist') return 'assist';
  return safe(() => controlFor({ conv: c }).mode, 'assist') === 'off' ? 'off' : 'assist';
}

const CSS = `
[data-screen="MChat"] > .ph > .content.mc-thread{justify-content:flex-start !important}
[data-screen="MChat"] > .ph > .content.mc-thread > :first-child{margin-top:auto}
[data-screen="MChat"] .mc-input{flex:1;min-width:0;max-height:96px;padding:9px 4px;border:0;outline:0;background:transparent;resize:none;font:inherit;font-size:var(--text-sm-plus);line-height:21px;color:var(--ink)}
[data-screen="MChat"] .mc-input::placeholder{color:var(--muted)}
[data-screen="MChat"] .composer .chip{cursor:pointer}
[data-screen="MChat"] .composer .chip.note-on{background:var(--warnbg);border-color:#f5d9a8;color:#7a3e05}
[data-screen="MChat"] .mc-dot{animation:mc-dot 1s infinite ease-in-out}
[data-screen="MChat"] .mc-dot:nth-child(2){animation-delay:.15s}[data-screen="MChat"] .mc-dot:nth-child(3){animation-delay:.3s}
@keyframes mc-dot{0%,80%,100%{opacity:.4;transform:translateY(0)}40%{opacity:1;transform:translateY(-2px)}}
[data-screen="MChat"] .mc-recdot{animation:mc-blink 1s infinite}
@keyframes mc-blink{50%{opacity:.25}}
@media (prefers-reduced-motion:reduce){[data-screen="MChat"] .mc-dot,[data-screen="MChat"] .mc-recdot{animation:none}}
`;

export default function MChatScreen() {
  const router = useRouter();
  const { ready, tick, ctx } = useAppData(['gc:comms'], { every: 15000 });
  const query = useQuery();
  const [id, setId] = useState('');
  const [typing, setTyping] = useState('');
  const [text, setText] = useState('');
  const [note, setNote] = useState(false);
  const [img, setImg] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [recording, setRecording] = useState(false);
  const [sheet, setSheet] = useState('');       // more · ai · assign · profile · replies · product · payment · attach · msg · photo
  const [msg, setMsg] = useState(null);
  const [photo, setPhoto] = useState('');
  const [q, setQ] = useState('');
  const [pay, setPay] = useState({ amount: '', method: 'bkash', order: '', note: '' });
  const [variant, setVariant] = useState(0);
  const [hidden, setHidden] = useState('');
  const [run, setRun] = useState(null);
  const [compH, setCompH] = useState(142);
  const scroller = useRef(null);
  const input = useRef(null);
  const file = useRef(null);
  const comp = useRef(null);
  const idRef = useRef('');
  idRef.current = id;

  // which chat: ?id=, else the newest open one
  useEffect(() => {
    if (!query || !ready) return;
    const want = query.get('id');
    const all = safe(() => getConvs(), []);
    const hit = (want && all.find((c) => c.id === want)) || all.filter((c) => statusOf(c) !== 'closed').sort((a, b) => lastAt(b) - lastAt(a))[0];
    if (hit) setId(hit.id);
  }, [query, ready]);

  const conv = useMemo(() => (ready && id ? safe(() => getConvs().find((c) => c.id === id), null) : null), [ready, tick, id]); // eslint-disable-line react-hooks/exhaustive-deps
  const orders = useMemo(() => (ready ? safe(() => getOrders(), []) : []), [ready, tick]);
  const facts = conv ? factsOf(conv.phone, orders) : { orders: [], count: 0, spent: 0 };
  const now = Date.now();
  const mode = chatAiMode(conv);
  const waiting = conv ? waitingMsg(conv) : null;
  const live = useMemo(() => (ready ? safe(() => connectedInbox('Messages'), null) : null), [ready, tick]);
  const reach = conv ? safe(() => replyStateOf(conv, now, !live || live.includes(conv.ch)), null) : null;
  const lock = conv ? safe(() => lockOf(conv.id), null) : null;
  const status = conv ? statusOf(conv, now) : 'open';
  const setup = ctx ? aiSetup(ctx.ed) : null;

  // read: opening the chat clears its unread count
  useEffect(() => { if (conv && conv.unread) patchConv(conv.id, { unread: 0 }); }, [conv && conv.id, conv && conv.unread]); // eslint-disable-line react-hooks/exhaustive-deps
  // the send lock is let go when the chat closes
  useEffect(() => { const x = id; return () => { if (x) releaseLock(x); }; }, [id]);
  // GridAI's draft while the customer waits (Assist) — the web's CopilotCard
  const draftKey = conv && waiting ? conv.id + ':' + waiting.id : '';
  useEffect(() => { setVariant(0); }, [draftKey]);
  useEffect(() => {
    if (!conv || !waiting || conv.blocked || mode !== 'assist' || !setup || !setup.providers) { setRun(null); return; }
    const r = safe(() => customerTurn(conv, { variant }), null);
    setRun(r && r.reply ? r : null);
  }, [draftKey, variant, mode, setup && setup.providers]); // eslint-disable-line react-hooks/exhaustive-deps
  // ?edit=1 (GridAI › Needs your OK › Edit): the draft goes into the reply box once
  const edited = useRef(false);
  useEffect(() => {
    if (edited.current || !run || !query || query.get('edit') !== '1') return;
    edited.current = true;
    setText(run.reply); markRun(run.id, 'edited'); setHidden(draftKey);
  }, [run, query]); // eslint-disable-line react-hooks/exhaustive-deps

  // keep the newest message in view
  const count = conv ? conv.messages.length : 0;
  const stick = useRef(true);
  useEffect(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [count, typing, run, id, compH]);
  const onScroll = (e) => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; };
  // the thread clears the composer, whatever it holds
  useEffect(() => {
    const el = comp.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => setCompH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [conv && conv.id]);
  // the reply box grows with its text (up to four lines)
  useEffect(() => { const el = input.current; if (!el) return; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 96) + 'px'; }, [text]);

  const opts = { onTyping: setTyping, isOpen: (x) => x === idRef.current };
  const send = (rows) => {
    if (!conv) return false;
    const reply = rows.some((m) => m.from === 'agent');
    if (reply && lock) { toast(`${lock.name} is replying. Wait until they finish.`, { tone: 'error' }); return false; }
    const ok = personReply(conv.id, rows, opts);
    if (!ok) toast('A teammate is replying. Wait until they finish.', { tone: 'error' });
    stick.current = true;
    return ok;
  };
  const re = () => (replyTo && !note ? { replyTo: replyTo.id } : {});
  const submit = () => {
    const body = text.trim();
    if (!body && !img) { if (input.current) input.current.focus(); return; }
    let ok;
    if (note) ok = send([{ from: 'note', by: ME, type: 'text', text: body }]);
    else if (img) ok = send([{ from: 'agent', by: ME, type: 'image', img, text: body, status: 'sent', ...re() }]);
    else ok = send([{ from: 'agent', by: ME, type: 'text', text: body, status: 'sent', ...re() }]);
    if (ok === false) return;
    setText(''); setImg(''); setReplyTo(null); setNote(false);
  };
  const sendVoice = ({ dur, url }) => {
    const vk = 'v-' + Date.now().toString(36);
    keepVoice(vk, url);
    send([{ from: 'agent', by: ME, type: 'voice', dur, vk, status: 'sent', ...re() }]);
    setRecording(false); setReplyTo(null);
  };
  const pickImage = (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    if (!/^image\//.test(f.type)) { toast('Choose a photo (JPG, PNG or WebP)', { tone: 'error' }); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const im = new Image();
      im.onload = () => {
        const k = Math.min(1, 900 / Math.max(im.width, im.height));
        const c = document.createElement('canvas');
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        setImg(c.toDataURL('image/jpeg', 0.82));
      };
      im.src = reader.result;
    };
    reader.readAsDataURL(f);
  };
  const onType = (v) => { setText(v); if (conv && !note && v) holdLock(conv.id); };

  // GridAI draft
  const acceptDraft = () => {
    if (!send([{ from: 'agent', by: ME, type: 'text', text: run.reply, status: 'sent', aiDraft: run.id }])) return;
    markRun(run.id, 'accepted');
    logAi({ kind: 'suggestion', title: 'Draft sent as written', detail: run.reply.slice(0, 90), channel: conv.ch, customer: conv.name, conv: conv.id, by: ME_NAME });
  };
  const editDraft = () => { setText(run.reply); markRun(run.id, 'edited'); setHidden(draftKey); if (input.current) input.current.focus(); };
  const dismissDraft = () => { markRun(run.id, 'dismissed'); setHidden(draftKey); };

  // actions on the chat (the web's act.*)
  const act = {
    close: () => { addMessages(conv.id, sys('circle-check', `Closed by ${ME_NAME}`), { status: 'closed', snoozeUntil: null, unread: 0 }); toast('Marked as done', { undo: () => addMessages(conv.id, sys('rotate-ccw', `Reopened by ${ME_NAME}`), { status: 'open' }) }); },
    reopen: () => { addMessages(conv.id, sys('rotate-ccw', `Reopened by ${ME_NAME}`), { status: 'open' }); toast('Conversation reopened'); },
    pending: () => { addMessages(conv.id, sys('hourglass', `Set to Pending (waiting on the customer) by ${ME_NAME}`), { status: 'pending' }); toast('Moved to Pending'); },
    snooze: (until) => { addMessages(conv.id, sys('alarm-clock', `Snoozed until ${whenText(until)} by ${ME_NAME}`), { status: 'snoozed', snoozeUntil: until }); toast(`Snoozed until ${whenText(until)}`); },
    unsnooze: () => { addMessages(conv.id, sys('bell-ring', `Unsnoozed by ${ME_NAME}`), { status: 'open', snoozeUntil: null }); toast('Back in Open'); },
    assign: (who) => { addMessages(conv.id, sys('user-round-check', who ? `Assigned to ${staffName(who)} by ${ME_NAME}` : `Unassigned by ${ME_NAME}`), { assignee: who }); toast(who ? `Assigned to ${staffName(who)}` : 'Unassigned'); },
    unread: () => { patchConv(conv.id, (c) => ({ unread: Math.max(1, c.unread || 0) })); toast('Marked as unread'); router.push('/m-inbox'); },
    block: async () => {
      if (!(await confirmDialog({ title: `Block ${conv.name}?`, body: `They can no longer message the shop on ${channelName(conv.ch)}, and the conversation is closed. You can unblock them later.`, confirmLabel: 'Block', tone: 'danger' }))) return;
      addMessages(conv.id, sys('ban', `Blocked by ${ME_NAME}`), { blocked: true, status: 'closed' });
      toast(`${conv.name} is blocked`);
    },
    unblock: () => { addMessages(conv.id, sys('shield-check', `Unblocked by ${ME_NAME}`), { blocked: false }); toast(`${conv.name} is unblocked`); },
    setAi: (m) => {
      if (m === mode) return;
      if (m === 'auto' && !can(currentUser(), 'ai-autoreply')) { toast(why('ai-autoreply'), { tone: 'info' }); return; }
      const word = { auto: `GridAI Autopilot turned on by ${ME_NAME}`, assist: `${ME_NAME} set GridAI to Assist · it drafts, a person sends`, off: `${ME_NAME} turned GridAI off for this chat` }[m];
      addMessages(conv.id, sys('sparkles', word), { autopilot: m === 'auto', aiMode: m });
      logAi({ kind: 'settings', title: m === 'auto' ? 'Autopilot on for a chat' : m === 'off' ? 'GridAI off for a chat' : 'Autopilot off for a chat', detail: conv.name, channel: conv.ch, by: ME_NAME });
      toast(m === 'auto' ? 'GridAI answers this chat. Taking over is one tap.' : m === 'assist' ? 'You are handling this chat. GridAI keeps drafting.' : 'GridAI is off for this chat.');
      if (m === 'auto' && waiting) autopilotReply(conv.id, opts);
    },
  };
  const call = () => {
    if (!conv) return;
    const phone = conv.phone || '';
    if (!phone) { toast(`${conv.name} has no number yet. Add one in the customer details.`, { tone: 'info' }); return; }
    if (!startCall({ phone, name: conv.name, dir: 'out', conv: conv.id, line: conv.ch === 'whatsapp' ? 'whatsapp' : 'support', back: '/m-chat?id=' + encodeURIComponent(conv.id) })) { toast('Finish the call you are on first', { tone: 'error' }); }
    router.push('/m-call-active');
  };

  const canOrder = ctx ? access('/m-new-order', ctx) : false;
  const canTicket = ctx ? access('/m-tickets', ctx) : false;
  const orderHref = conv ? `/m-new-order?phone=${encodeURIComponent(conv.phone || '')}&name=${encodeURIComponent(conv.name)}&conv=${encodeURIComponent(conv.id)}` : '';
  const replies = sheet === 'replies' ? safe(() => getReplies(), []).filter((r) => !q || (r.title + ' ' + r.short + ' ' + r.body).toLowerCase().includes(q.toLowerCase())) : [];
  const products = sheet === 'product' ? safe(() => searchProducts(q).filter(isStatusSellable).slice(0, 30).map((p) => ({ ...p, free: stockAt(p.sku, '').available })), []) : [];
  const summary = sheet === 'profile' && conv ? safe(() => summarize(conv), null) : null;
  const callable = conv && (CALL_CHANNELS.includes(conv.ch) || conv.phone);
  const lastIn = conv ? [...conv.messages].reverse().find((m) => m.from === 'customer') : null;
  const active = lastIn && now - lastIn.at < 15 * 60000;

  if (ready && query && !id) {
    return (
      <AppScreen name="MChat" title="Chat">
        <header className="appbar"><Link href="/m-inbox" className="ib" aria-label="Back"><Icon name="back" size={24} stroke={2} /></Link><h1>Chat</h1><span style={{ width: '36px' }} /></header>
        <Content top={103}><div className="card" style={{ margin: '0 20px' }}><EmptyState icon="chat" title="This chat isn’t here any more" action={{ label: 'Open the Inbox', href: '/m-inbox' }} /></div></Content>
      </AppScreen>
    );
  }
  if (ctx && !access('/m-inbox', ctx)) {
    return (
      <AppScreen name="MChat" title="Chat">
        <header className="appbar"><Link href="/m-home" className="ib" aria-label="Back"><Icon name="back" size={24} stroke={2} /></Link><h1>Chat</h1><span style={{ width: '36px' }} /></header>
        <Content top={103}><div className="card" style={{ margin: '0 20px' }}><EmptyState icon="alert" title="The Inbox isn’t part of your access in this edition." action={{ label: 'Go to Home', href: '/m-home' }} /></div></Content>
      </AppScreen>
    );
  }

  const placeholder = note ? 'Internal note · @mention the team' : conv ? `Reply on ${channelName(conv.ch)}…` : 'Reply…';
  const showDraft = run && hidden !== draftKey && mode === 'assist' && !conv.blocked;
  const css = CSS + `[data-screen="MChat"] > .ph > .content.mc-thread{bottom:${compH + 14}px}
@media (max-width:480px){
  [data-screen="MChat"] > .ph:not([data-board]) > .content.mc-thread{bottom:0 !important;padding-bottom:calc(${compH}px + var(--space-3)) !important}
}`;

  return (
    <AppScreen name="MChat" title={conv ? 'Chat with ' + conv.name : 'Chat'} css={css}>
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', margin: '-1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>{conv ? 'Chat with ' + conv.name : 'Chat'}</h1>
      <header className="appbar" style={{ height: '64px', background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line)' }}>
        <Link href="/m-inbox" className="ib" aria-label="Back"><Icon name="back" size={24} stroke={2} /></Link>
        {conv ? (
          <button type="button" onClick={() => setSheet('profile')} aria-label={`${conv.name}: customer details`} style={{ display: 'flex', alignItems: 'center', flex: '1', minWidth: '0', padding: 0, border: 0, background: 'none', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer' }}>
            <Face name={conv.name} avatar={conv.avatar} pos={conv.pos} ch={conv.ch} size={42} badge={18} online={active} />
            <span style={{ flex: '1', minWidth: '0', paddingLeft: '8px' }}>
              <span className="ell" style={{ display: 'block', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)' }}>{conv.name}</span>
              <span className="ell" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                {active ? <span style={{ width: '7px', height: '7px', borderRadius: 'var(--radius-full)', background: '#10b981', flex: 'none' }} /> : null}
                {active ? 'Active now' : lastIn ? 'Wrote ' + inboxAgo(lastIn.at, now).replace(/^(\d+)m$/, '$1 min ago').replace(/^(\d+)h$/, '$1 h ago') : 'No messages yet'} · {channelName(conv.ch)}
              </span>
            </span>
          </button>
        ) : <span style={{ flex: 1 }} />}
        {conv && callable ? <button type="button" className="ib" aria-label="Call" onClick={call}><Icon name="phone" size={21} /></button> : null}
        <button type="button" className="ib" aria-label="More actions" onClick={() => setSheet('more')} disabled={!conv}><Icon name="dots" size={21} /></button>
      </header>

      <div style={{ position: 'absolute', top: '111px', left: '0', right: '0', padding: '10px 16px', zIndex: '4' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 8px 8px 14px', borderRadius: 'var(--radius-xl)', background: 'var(--card)', boxShadow: '0 1px 2px rgba(15,23,42,.05)', fontSize: 'var(--text-xs-plus)' }}>
          <button type="button" onClick={() => setSheet('profile')} disabled={!conv} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: 0, border: 0, background: 'none', font: 'inherit', color: 'inherit', cursor: 'pointer', minWidth: 0 }}>
            <span style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}><b className="num" style={{ color: 'var(--ink)' }}>{conv ? facts.count : '—'}</b> order{facts.count === 1 ? '' : 's'}</span>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}><b className="num" style={{ color: 'var(--ink)' }}>{conv ? money(facts.spent) : '—'}</b> spent</span>
          </button>
          <button type="button" className={'pill p-' + (mode === 'auto' ? 'nav' : mode === 'assist' ? 'grey' : 'grey')} onClick={() => setSheet('ai')} disabled={!conv} aria-label={'GridAI for this chat: ' + AI_WORD[mode] + '. Change'} style={{ marginLeft: 'auto', border: 0, cursor: 'pointer', font: 'inherit', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)' }}>
            <Icon name="sparkles" size={13} />GridAI · {AI_WORD[mode]}
          </button>
        </div>
      </div>

      <div className="content mc-thread" ref={scroller} onScroll={onScroll} role="log" aria-label={conv ? `Messages with ${conv.name}` : 'Messages'} aria-live="polite"
        style={{ top: '170px', bottom: compH + 14 + 'px', padding: '6px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {conv ? (
          <>
            <Thread conv={conv} now={now} orders={orders} typing={typing === conv.id}
              onTap={(m) => { setMsg(m); setSheet('msg'); }} onPhoto={(src) => { setPhoto(src); setSheet('photo'); }} onCall={call} />
            {mode === 'auto' && status !== 'closed' ? (
              <div style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 6px 6px 12px', borderRadius: 'var(--radius-full)', background: 'var(--soft)', fontSize: 'var(--text-xs-plus)', color: 'var(--brand)', marginTop: '6px' }}>
                <Icon name="sparkles" size={14} />GridAI is answering this chat
                <button type="button" onClick={() => act.setAi('assist')} style={{ height: '28px', padding: '0 10px', border: 0, borderRadius: 'var(--radius-full)', background: 'var(--card)', color: 'var(--ink)', font: 'inherit', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', cursor: 'pointer' }}>Take over</button>
              </div>
            ) : null}
            {showDraft ? (
              <section aria-label="GridAI suggestion" style={{ alignSelf: 'flex-end', width: '86%', padding: '12px 14px', borderRadius: 'var(--radius-xl) var(--radius-xl) var(--radius-md) var(--radius-xl)', background: 'linear-gradient(180deg,var(--soft),var(--card) 70%)', border: '1px dashed #9db6e3', marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--muted)', minWidth: 0 }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: 'var(--radius-full)', background: 'var(--brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="sparkles" size={12} /></span>
                  <b style={{ color: 'var(--ink)', fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap' }}>GridAI suggests</b>
                  <span className="ell">{(run.intents || []).map((k) => INTENT_WORD[k] || k).join(', ')}</span>
                  {run.decision && run.decision.act === 'person' ? <Pill tone="warn" style={{ marginLeft: 'auto' }}>Check first</Pill> : null}
                </div>
                <p style={{ margin: '8px 0 10px', fontSize: 'var(--text-sm)', lineHeight: '20px', color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>{run.reply}</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button type="button" className="chip on" onClick={acceptDraft} style={{ height: '32px', cursor: 'pointer' }}><XIcon name="send" size={14} />Send</button>
                  <button type="button" className="chip" onClick={editDraft} style={{ height: '32px', cursor: 'pointer' }}>Edit</button>
                  <button type="button" className="chip" onClick={() => setVariant((v) => v + 1)} style={{ height: '32px', cursor: 'pointer' }}>Again</button>
                  <button type="button" className="ib" aria-label="Dismiss the suggestion" onClick={dismissDraft} style={{ width: '32px', height: '32px', marginLeft: 'auto' }}><Icon name="x" size={16} /></button>
                </div>
              </section>
            ) : null}
            {reach && reach.state !== 'open' && !conv.blocked ? <Note tone={reach.state === 'disconnected' ? 'info' : 'warn'} icon="alert">{reach.label}{reach.state === 'template' ? ': the free reply window has closed, send an approved template from the web.' : reach.state === 'disconnected' ? ': reconnect the channel on the web to reply.' : '.'}</Note> : null}
          </>
        ) : <div style={{ alignSelf: 'center', color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>{' '}</div>}
      </div>

      <div className="composer" ref={comp} style={{ position: 'absolute', left: '0', right: '0', bottom: '0', padding: '10px 0 34px', background: 'linear-gradient(to top,var(--bg) 70%,rgba(245,247,250,0))', zIndex: '6' }}>
        {conv && conv.blocked ? (
          <div style={{ margin: '0 12px', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 10px 10px 14px', borderRadius: 'var(--radius-xl)', background: 'var(--card)', boxShadow: '0 0 0 1px var(--line)', fontSize: 'var(--text-sm)' }}>
            <span style={{ flex: 1 }}>You blocked {conv.name}. They can’t message the shop.</span>
            <Button kind="line" onClick={act.unblock} style={{ height: '36px' }}>Unblock</Button>
          </div>
        ) : (
          <>
            {lock ? <div style={{ margin: '0 12px 8px', fontSize: 'var(--text-xs-plus)', color: 'var(--warn)', display: 'flex', alignItems: 'center', gap: '6px' }}><Icon name="edit" size={14} />{lock.name} is replying. You can still add a note.</div> : null}
            {replyTo ? (
              <div style={{ margin: '0 12px 8px', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 6px 6px 12px', borderRadius: 'var(--radius-lg)', background: 'var(--card)', borderLeft: '3px solid var(--brand)', fontSize: 'var(--text-xs-plus)' }}>
                <span className="ell" style={{ flex: 1, minWidth: 0 }}><b style={{ fontWeight: 'var(--weight-medium)' }}>Replying to {replyTo.from === 'customer' ? conv.name : 'you'}</b> · {replyTo.text || 'message'}</span>
                <button type="button" className="ib" aria-label="Cancel the reply" onClick={() => setReplyTo(null)} style={{ width: '28px', height: '28px' }}><Icon name="x" size={14} /></button>
              </div>
            ) : null}
            {img ? (
              <div style={{ margin: '0 12px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={img} alt="Photo to send" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} />
                <span style={{ flex: 1, fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>Photo ready · add a caption or send</span>
                <button type="button" className="ib" aria-label="Remove the photo" onClick={() => setImg('')} style={{ width: '32px', height: '32px' }}><Icon name="x" size={16} /></button>
              </div>
            ) : null}
            <div className="chips" style={{ padding: '0 12px' }}>
              <button type="button" className="chip" onClick={() => { setQ(''); setSheet('replies'); }}>Saved replies</button>
              <button type="button" className="chip" onClick={() => { setQ(''); setSheet('product'); }}>Share product</button>
              <button type="button" className="chip" onClick={() => { setPay({ amount: facts.orders[0] ? String(Math.round(facts.orders[0].amount || 0)) : '', method: 'bkash', order: facts.orders[0] ? facts.orders[0].id : '', note: '' }); setSheet('payment'); }}>Payment link</button>
              {canOrder ? <Link className="chip" href={orderHref}>Create order</Link> : null}
              <button type="button" className={'chip' + (note ? ' note-on' : '')} aria-pressed={note} onClick={() => setNote(!note)}>{note ? 'Writing a note' : 'Note'}</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 12px 0', padding: '6px', borderRadius: '26px', background: note ? 'var(--warnbg)' : 'var(--card)', boxShadow: '0 6px 20px -10px rgba(15,23,42,.25),0 0 0 1px var(--line)' }}>
              {recording ? <Recorder onSend={sendVoice} onCancel={() => setRecording(false)} /> : (
                <>
                  <button type="button" className="ib" aria-label="Add" onClick={() => setSheet('attach')} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: 'var(--soft)', color: 'var(--brand)', flex: 'none' }}><Icon name="plus" size={20} stroke={2} /></button>
                  <textarea ref={input} className="mc-input" rows={1} value={text} placeholder={placeholder} aria-label={placeholder} disabled={!conv}
                    onChange={(e) => onType(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && window.matchMedia('(min-width: 481px)').matches) { e.preventDefault(); submit(); } }} />
                  {!text.trim() && !img && !note ? <button type="button" className="ib" aria-label="Voice message" onClick={() => setRecording(true)} disabled={!conv} style={{ width: '40px', height: '40px', flex: 'none' }}><XIcon name="mic" size={20} /></button> : null}
                  <button type="button" className="ib" aria-label={note ? 'Add note' : 'Send'} onClick={submit} disabled={!conv} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: note ? '#b45309' : 'var(--brand)', color: '#fff', flex: 'none' }}><XIcon name="send" size={18} /></button>
                </>
              )}
            </div>
          </>
        )}
        <input ref={file} type="file" accept="image/*" hidden onChange={pickImage} />
      </div>

      {/* ⋯ */}
      <Sheet open={sheet === 'more' && !!conv} onClose={() => setSheet('')} title={conv ? conv.name : ''}>
        {conv ? (
          <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
            {status === 'closed'
              ? <ListRow compact icon="undo" title="Reopen" onClick={() => { setSheet(''); act.reopen(); }} chevron={false} />
              : <ListRow compact icon="check" title="Mark done" sub="Closes the chat; it opens again when they write" onClick={() => { setSheet(''); act.close(); }} chevron={false} />}
            <ListRow compact icon="user" title="Assign" sub={conv.assignee ? staffName(conv.assignee) : 'Unassigned'} onClick={() => setSheet('assign')} />
            <ListRow compact icon="sparkles" title="GridAI for this chat" sub={AI_WORD[mode]} onClick={() => setSheet('ai')} />
            <ListRow compact icon="users" title="Customer details" onClick={() => setSheet('profile')} />
            {status === 'snoozed'
              ? <ListRow compact icon="bell" title="Unsnooze" onClick={() => { setSheet(''); act.unsnooze(); }} chevron={false} />
              : <ListRow compact icon="clock" title="Snooze until tomorrow" sub={clock(snoozeChoices(now)[2][1])} onClick={() => { setSheet(''); act.snooze(snoozeChoices(Date.now())[2][1]); }} chevron={false} />}
            {status !== 'pending' && status !== 'closed' ? <ListRow compact icon="clock" title="Set to pending" sub="Waiting on the customer" onClick={() => { setSheet(''); act.pending(); }} chevron={false} /> : null}
            <ListRow compact icon="chat" title="Mark as unread" onClick={() => { setSheet(''); act.unread(); }} chevron={false} />
            {canOrder ? <ListRow compact icon="bag" title="Create order" href={orderHref} /> : null}
            {canTicket ? <ListRow compact icon="ticket" title="Create ticket" href={`/m-ticket-new?conv=${encodeURIComponent(conv.id)}&name=${encodeURIComponent(conv.name)}&phone=${encodeURIComponent(conv.phone || '')}`} /> : null}
            {conv.blocked
              ? <ListRow compact icon="check" title="Unblock" onClick={() => { setSheet(''); act.unblock(); }} chevron={false} />
              : <ListRow compact icon="x" title={`Block ${conv.name}`} onClick={() => { setSheet(''); act.block(); }} chevron={false} />}
          </div>
        ) : null}
      </Sheet>

      {/* GridAI for this chat */}
      <Sheet open={sheet === 'ai' && !!conv} onClose={() => setSheet('')} title="GridAI for this chat">
        {setup && !setup.providers ? <Note tone="warn" icon="alert" style={{ marginBottom: '12px' }}>GridAI isn’t set up for this shop yet. <Link href="/ai-behaviour" style={{ color: 'var(--brand)', fontWeight: 'var(--weight-medium)' }}>Set up on the web</Link></Note> : null}
        <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
          {AI_OPTS.map(([k, l, s]) => (
            <button key={k} type="button" className="row" aria-pressed={mode === k} onClick={() => { act.setAi(k); setSheet(''); }}>
              <span className="ico" style={{ background: mode === k ? 'var(--brand)' : 'var(--soft)', color: mode === k ? '#fff' : 'var(--brand)' }}><Icon name={k === 'auto' ? 'sparkles' : k === 'assist' ? 'edit' : 'x'} /></span>
              <span className="m"><span className="t" style={{ display: 'block' }}>{l}</span><span className="s" style={{ display: 'block' }}>{s}</span></span>
              {mode === k ? <Icon name="check" size={20} stroke={2.2} /> : null}
            </button>
          ))}
        </div>
        <div className="help" style={{ marginTop: '10px' }}>Auto answers only the simple questions the shop allows; anything else, or an unhappy customer, comes to a person. When you reply yourself, Auto stops for this chat.</div>
      </Sheet>

      {/* assign */}
      <Sheet open={sheet === 'assign' && !!conv} onClose={() => setSheet('')} title="Assign to">
        <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
          {[{ id: '', name: 'Unassigned', role: 'Anyone in the team can pick it up', initials: '–' }, ...STAFF].map((s) => (
            <button key={s.id || 'none'} type="button" className="row" style={{ minHeight: '56px', padding: '9px 16px' }} aria-pressed={conv && (conv.assignee || '') === s.id} onClick={() => { if ((conv.assignee || '') !== s.id) act.assign(s.id); setSheet(''); }}>
              <Face name={s.name} size={40} />
              <span className="m"><span className="t" style={{ display: 'block' }}>{s.name}{s.id === ME ? ' (you)' : ''}</span><span className="s" style={{ display: 'block' }}>{s.role}</span></span>
              {conv && (conv.assignee || '') === s.id ? <Icon name="check" size={20} stroke={2.2} /> : null}
            </button>
          ))}
        </div>
      </Sheet>

      {/* customer */}
      <Sheet open={sheet === 'profile' && !!conv} onClose={() => setSheet('')} title="Customer"
        footer={conv ? <>
          {callable ? <Button kind="line" onClick={() => { setSheet(''); call(); }} icon="phone">Call</Button> : null}
          {canOrder ? <Button kind="primary" href={orderHref} icon="bag" style={{ flex: 2 }}>Create order</Button> : null}
        </> : null}>
        {conv ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Face name={conv.name} avatar={conv.avatar} pos={conv.pos} ch={conv.ch} size={56} />
              <span style={{ minWidth: 0 }}>
                <span className="ell" style={{ display: 'block', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)' }}>{conv.name}</span>
                <span className="num ell" style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{[conv.phone ? fmtPhone(conv.phone) : '', conv.handle, channelName(conv.ch)].filter(Boolean).join(' · ')}</span>
              </span>
            </div>
            <StatRow cols={3} style={{ marginTop: '14px' }}>
              <Stat label="Orders" value={String(facts.count)} tone="nav" />
              <Stat label="Spent" value={money(facts.spent)} tone="ok" />
              <Stat label="Last order" value={facts.orders[0] ? inboxAgo(facts.orders[0].at, now) : '—'} tone="grey" />
            </StatRow>
            {(conv.tags || []).length ? <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>{conv.tags.map((g) => <Pill key={g} tone={g === 'VIP' ? 'warn' : 'grey'}>{g}</Pill>)}</div> : null}
            {summary ? (
              <div style={{ marginTop: '14px', padding: '12px 14px', borderRadius: 'var(--radius-xl)', background: 'var(--soft)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', color: 'var(--brand)' }}><Icon name="sparkles" size={13} />GridAI summary</div>
                {summary.lines.map((l) => <div key={l} style={{ fontSize: 'var(--text-sm)', lineHeight: '20px', marginTop: '4px' }}>{l}</div>)}
              </div>
            ) : null}
            {conv.note ? <Note tone="warn" icon="edit" style={{ marginTop: '12px' }}>{conv.note}</Note> : null}
            <div className="lab" style={{ margin: '16px 0 8px' }}>Orders</div>
            {facts.orders.length ? (
              <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
                {facts.orders.slice(0, 5).map((o) => (
                  <Link key={o.id} href={'/m-order-detail?id=' + encodeURIComponent(o.id)} className="lrow" style={{ padding: '11px 14px' }}>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="mono" style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{o.id}</span>
                      <span className="num ell" style={{ display: 'block', fontSize: 'var(--text-sm)' }}>{o.itemTitle || 'Items'} · {money(o.amount)}</span>
                    </span>
                    <OrderPill statusKey={o.statusKey} />
                  </Link>
                ))}
              </div>
            ) : <div className="help">No orders with this number yet.</div>}
            {(conv.links || []).length ? <div className="help" style={{ marginTop: '10px' }}>Also on {conv.links.map((l) => channelName(l.ch)).join(', ')}</div> : null}
          </>
        ) : null}
      </Sheet>

      {/* saved replies */}
      <Sheet open={sheet === 'replies'} onClose={() => setSheet('')} title="Saved replies">
        <SearchField value={q} onChange={setQ} placeholder="Search saved replies" style={{ margin: '0 0 10px' }} />
        <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
          {replies.length ? replies.map((r) => (
            <button key={r.id} type="button" className="lrow" onClick={() => { setText(fillReply(r.body, { name: conv.name, order: facts.orders[0] ? facts.orders[0].id : '' })); countReplyUse(r.id); setSheet(''); if (input.current) input.current.focus(); }}
              style={{ width: '100%', border: 0, background: 'none', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', alignItems: 'flex-start', flexDirection: 'column', gap: '2px' }}>
              <span lang={r.lang === 'bn' ? 'bn' : undefined} className={r.lang === 'bn' ? 'bn' : undefined} style={{ fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-medium)' }}>{r.title} <span className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 'var(--weight-regular)' }}>/{r.short}</span></span>
              <span lang={r.lang === 'bn' ? 'bn' : undefined} className={r.lang === 'bn' ? 'bn' : undefined} style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)', lineHeight: '18px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{r.body}</span>
            </button>
          )) : <div className="empty">No saved reply matches.</div>}
        </div>
      </Sheet>

      {/* product */}
      <Sheet open={sheet === 'product'} onClose={() => setSheet('')} title="Share a product">
        <SearchField value={q} onChange={setQ} placeholder="Search name, SKU or barcode" style={{ margin: '0 0 10px' }} />
        <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
          {products.length ? products.map((p) => (
            <ListRow key={p.sku} compact icon="box" title={p.name + (p.variant ? ' · ' + p.variant : '')} sub={<><span className="num">{money(p.price)}</span> · <span className="mono">{p.sku}</span></>}
              end={<Pill tone={p.free > 0 ? 'ok' : 'err'}>{p.free > 0 ? `${p.free} in stock` : 'Out of stock'}</Pill>} chevron={false}
              onClick={() => { send([{ from: 'agent', by: ME, type: 'product', sku: p.sku, status: 'sent' }]); setSheet(''); toast(`Product card sent · ${p.name}`); }} />
          )) : <div className="empty">No product matches.</div>}
        </div>
      </Sheet>

      {/* payment link */}
      <Sheet open={sheet === 'payment'} onClose={() => setSheet('')} title="Payment link"
        footer={<Button kind="primary" onClick={() => {
          const amount = Math.round(Number(pay.amount) || 0);
          if (amount <= 0) { toast('Enter the amount', { tone: 'error' }); return; }
          const link = 'pay.gridcommerce.app/p/' + Math.random().toString(36).slice(2, 8).toUpperCase();
          if (send([{ from: 'agent', by: ME, type: 'payment', amount, order: pay.order, method: pay.method, note: pay.note.trim(), link, status: 'sent' }])) { setSheet(''); toast(`Payment link for ${money(amount)} sent`); }
        }}>Send link</Button>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label className="field"><span className="lab">Amount</span><TextInput value={pay.amount} onChange={(v) => setPay({ ...pay, amount: v.replace(/[^0-9]/g, '') })} prefix="৳" inputMode="numeric" placeholder="0" /></label>
          <div>
            <div className="lab" style={{ marginBottom: '8px' }}>Pay with</div>
            <Segmented items={METHODS.map(([k, l]) => ({ key: k, label: l }))} value={pay.method} onChange={(k) => setPay({ ...pay, method: k })} style={{ margin: 0 }} />
          </div>
          {facts.orders.length ? (
            <label className="field"><span className="lab">For order</span>
              <span className="inp"><select value={pay.order} onChange={(e) => setPay({ ...pay, order: e.target.value })}><option value="">No order</option>{facts.orders.slice(0, 8).map((o) => <option key={o.id} value={o.id}>{o.id} · {money(o.amount)}</option>)}</select></span>
            </label>
          ) : null}
          <label className="field"><span className="lab">Note (optional)</span><TextInput value={pay.note} onChange={(v) => setPay({ ...pay, note: v })} placeholder="Advance for the order" /></label>
        </div>
      </Sheet>

      {/* + */}
      <Sheet open={sheet === 'attach'} onClose={() => setSheet('')} title="Add">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
          {[
            ['Photo', 'image', () => { setSheet(''); if (file.current) file.current.click(); }],
            ['Product', 'box', () => { setQ(''); setSheet('product'); }],
            ['Payment', 'wallet', () => { setPay({ amount: facts.orders[0] ? String(Math.round(facts.orders[0].amount || 0)) : '', method: 'bkash', order: facts.orders[0] ? facts.orders[0].id : '', note: '' }); setSheet('payment'); }],
            ['Note', 'edit', () => { setNote(true); setSheet(''); if (input.current) input.current.focus(); }],
          ].map(([l, ic, fn]) => (
            <button key={l} type="button" className="tile" onClick={fn}>
              <span className="ico">{ic === 'image' ? <XIcon name="image" size={24} /> : <Icon name={ic} size={24} />}</span>{l}
            </button>
          ))}
        </div>
      </Sheet>

      {/* a message: react or reply */}
      <Sheet open={sheet === 'msg' && !!msg} onClose={() => { setSheet(''); setMsg(null); }} title="Message">
        {msg ? (
          <>
            {msg.text ? <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-xl)', background: 'var(--soft)', fontSize: 'var(--text-sm)', lineHeight: '20px', marginBottom: '14px', maxHeight: '96px', overflow: 'auto' }}>{msg.text}</div> : null}
            <div role="group" aria-label="React" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 2px 14px' }}>
              {REACTIONS.map((e) => {
                const on = (msg.reactions || {})[ME] === e;
                return <button key={e} type="button" aria-pressed={on} aria-label={'React ' + e} onClick={() => { reactTo(conv.id, msg.id, e); setSheet(''); setMsg(null); }} style={{ width: '48px', height: '48px', border: 0, borderRadius: 'var(--radius-full)', background: on ? 'var(--soft)' : 'transparent', fontSize: '28px', cursor: 'pointer' }}>{e}</button>;
              })}
            </div>
            <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
              <ListRow compact icon="undo" title="Reply" onClick={() => { setReplyTo(msg); setNote(false); setSheet(''); setMsg(null); if (input.current) input.current.focus(); }} chevron={false} />
              {msg.text ? <ListRow compact icon="clipboard" title="Copy text" onClick={() => { try { navigator.clipboard.writeText(msg.text).then(() => toast('Copied'), () => toast('Select the text to copy it', { tone: 'info' })); } catch { toast('Select the text to copy it', { tone: 'info' }); } setSheet(''); setMsg(null); }} chevron={false} /> : null}
            </div>
            <div className="help" style={{ marginTop: '10px' }}>{msg.from === 'customer' ? conv.name : msg.ai ? 'GridAI' : msg.by === ME ? 'You' : staffName(msg.by)} · {whenText(msg.at, now)}{msg.type === 'call' && CALL_DIRS[msg.dir] ? ' · ' + CALL_DIRS[msg.dir].label : ''}</div>
          </>
        ) : null}
      </Sheet>

      {/* a photo */}
      <Sheet open={sheet === 'photo' && !!photo} onClose={() => { setSheet(''); setPhoto(''); }} title="Photo">
        {photo ? <img src={photo} alt="" style={{ width: '100%', borderRadius: 'var(--radius-xl)', display: 'block' }} /> : null}
      </Sheet>
    </AppScreen>
  );
}
