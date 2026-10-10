'use client';
// Inbox (/admin/inbox) — GridCommerce's own omnichannel inbox: chats with leads, merchants, affiliates and partners
// from Facebook Messenger, Instagram, WhatsApp, email, the website's live chat and Telegram. Reuses the merchant
// panel's Inbox (screens/merchant-inbox/MerchantInbox.jsx + components/inbox/*: same three columns, Messenger bubbles,
// composer and full-window layout), copied into inboxParts / inboxThread / inboxPanel and fed by lib/admin/inbox.js.
//   left     views (All · Mine · Unassigned · Unread · Priority · Closed, with counts), channel chips, search, the list
//   middle   the conversation (inboxThread.jsx): status, priority, assign / transfer, AI mode, needs approval, composer
//   right    the contact (inboxPanel.jsx): Lead / Merchant / Affiliate / Partner, store package and subscription,
//            tags, note, tickets, previous conversations
//   header   the default AI mode for every conversation (AI off · AI assist · AI auto) and what waits for approval
// Three panes from 1280px, two below (the contact slides over), one on phones (list → thread → contact).
// Keyboard: ↑/↓ move through the list, Enter opens; in the composer Enter sends, Shift+Enter is a new line, "/" saved replies.
// URL: ?c=<conversation id> opens one, ?view=mine|unassigned|unread|priority|closed picks the view.
// Demo: the first reply in a conversation gets an answer back a few seconds later; in AI auto GridAI then answers by
// the rules (a sensitive answer waits in Needs approval).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { ShopHeader } from '@/components/ui/IndexKit';
import { ChannelIcon } from '@/components/ui';
import { staff as currentStaff } from '@/lib/platform/store';
import { useAdminStore } from '@/lib/admin/store';
import {
  inbox, VIEWS, inView, CHANNEL_IDS, channelName, staffName, firstName, statusOf, lastOf, lastAt, previewOf, priorityOf,
  aiModeOf, aiModeName, KINDS, fillReply, markRead, markUnread, send, tick, setStatus, setPriority, assign, toggleTag, saveContactNote,
  setAi, setDefaultAi, takeOver, approveDraft, rejectDraft, schedule, cancelScheduled, sendScheduledNow, flushScheduled,
  contactWrites, aiAnswer, logCall, sensitiveName,
} from '@/lib/admin/inbox';
import { AdminShell, usePlatform } from '../AdminShell';
import { useMedia, Avatar, StaffAvatar, SearchBox, Sheet, PARTS_CSS, chIcon } from './inboxParts';
import { Thread, THREAD_CSS, whenText, dayLabel } from './inboxThread';
import { ContactPanel, SavedReplies, NewConversation, AiSettings, PANEL_CSS } from './inboxPanel';

const EMPTY = {
  all: ['inbox', 'You are all caught up'], mine: ['user-round-check', 'Nothing assigned to you'], unassigned: ['users', 'Every conversation has an owner'],
  unread: ['mail-open', 'No unread conversations'], priority: ['flag', 'No urgent or high-priority conversations'], closed: ['archive', 'No closed conversations'],
};
const COMEBACK = {
  lead: ['Thanks! Can you send the price list on WhatsApp too?', 'Ok. Is there any setup fee?', 'Sounds good. Can I pay by bKash every month?'],
  merchant: ['Thank you, I will try now 🙏', 'Still the same. Can someone call me?', 'Got it, thanks a lot!'],
  affiliate: ['Great, thanks bhai!', 'When will it reach my bKash?', 'Ok noted 👍'],
  partner: ['Thanks, noted.', 'We will confirm by tomorrow.', 'Perfect, let us know when it is live.'],
};
const LINE_FOR = { lead: 'sales', merchant: 'support', affiliate: 'billing', partner: 'partners' };
/** "4m", "3h", "Mon", "02 Oct" */
const shortAgo = (at, now) => { const m = Math.max(0, Math.round((now - at) / 60000)); if (m < 1) return 'now'; if (m < 60) return m + 'm'; if (m < 24 * 60 && dayLabel(at, now) === 'Today') return Math.floor(m / 60) + 'h'; return dayLabel(at, now) === 'Yesterday' ? 'Yesterday' : dayLabel(at, now); };

export default function Inbox() {
  const { db, t: pt } = usePlatform();
  const { data, t, live } = useAdminStore(inbox);
  const me = (currentStaff() || {}).id || 'mahin';
  const wide = useMedia('(min-width:1280px)');
  const phone = useMedia('(max-width:767px)');
  const [view, setView] = useState('all');
  const [chan, setChan] = useState('all');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState('');
  const [pane, setPane] = useState('list');
  const [panelWide, setPanelWide] = useState(true);
  const [panelSheet, setPanelSheet] = useState(false);
  const [typing, setTyping] = useState('');
  const [dlg, setDlg] = useState('');            // replies · new · ai
  const [draftIn, setDraftIn] = useState(null);  // { conv, text, n } handed to the composer
  const listRef = useRef(null);
  const selRef = useRef('');
  const booted = useRef(false);
  const autoOff = useRef(false);
  const demoDone = useRef(new Set());
  const timers = useRef([]);
  selRef.current = sel;

  useEffect(() => {
    let saved = null;
    try { saved = window.sessionStorage.getItem('gc.admin.inbox.panel'); } catch { /* ignore */ }
    setPanelWide(saved != null ? saved === '1' : window.matchMedia('(min-width:1600px)').matches);
    const list = timers.current;
    return () => list.forEach((x) => window.clearTimeout(x));
  }, []);
  useEffect(() => { try { window.sessionStorage.setItem('gc.admin.inbox.panel', panelWide ? '1' : '0'); } catch { /* ignore */ } }, [panelWide]);
  // scheduled replies go out as the clock passes them
  useEffect(() => { if (live) flushScheduled(); }, [live, t]);

  const convs = live ? data.convs : [];
  const conv = convs.find((c) => c.id === sel) || null;

  // open from the address once the data is in
  useEffect(() => {
    if (!live || booted.current) return;
    booted.current = true;
    const p = new URLSearchParams(window.location.search);
    if (VIEWS.some((v) => v[0] === p.get('view'))) setView(p.get('view'));
    const hit = p.get('c') && data.convs.find((c) => c.id === p.get('c'));
    if (hit) { if (statusOf(hit, t) === 'closed') setView('closed'); open(hit.id); }
  }, [live]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- the list -------------------------------------------------------------------------------------------------
  const needle = q.trim().toLowerCase();
  const base = convs.filter((c) => (chan === 'all' || c.ch === chan) && (!needle || [c.name, c.company, c.phone, c.email, c.handle, c.id, ...c.tags, ...c.tickets, ...c.messages.map((m) => m.text || '')].join(' ').toLowerCase().includes(needle)));
  const list = useMemo(() => base.filter((c) => inView(c, view, me, t)).sort((a, b) => ((b.priority === 'urgent') - (a.priority === 'urgent')) || (lastAt(b) - lastAt(a))), [base, view, me, t]); // eslint-disable-line react-hooks/exhaustive-deps
  const viewCount = (v) => base.filter((c) => inView(c, v, me, t)).length;
  const chanUnread = (ch) => convs.filter((c) => (ch === 'all' || c.ch === ch) && inView(c, view, me, t) && c.unread).length;
  const waiting = convs.filter((c) => c.approvals.length);
  const filtered = chan !== 'all' || !!needle;

  // desktop keeps a conversation open
  useEffect(() => {
    if (!live || phone || autoOff.current) return;
    if (!conv && list.length) open(list[0].id);
  }, [live, phone, list.length, view]); // eslint-disable-line react-hooks/exhaustive-deps

  function open(id) {
    autoOff.current = false;
    setSel(id);
    setPane('thread');
    const c = inbox.get().convs.find((x) => x.id === id);
    if (c && c.unread) markRead(id);
    try { const u = new URL(window.location.href); u.searchParams.set('c', id); window.history.replaceState(window.history.state, '', u.pathname + u.search); } catch { /* ignore */ }
  }
  const openAny = (id) => {
    const c = inbox.get().convs.find((x) => x.id === id);
    if (c && !inView(c, view, me, t)) setView(statusOf(c, t) === 'closed' ? 'closed' : 'all');
    setChan('all'); setQ(''); setPanelSheet(false); setDlg('');
    open(id);
  };
  const back = () => { setPane('list'); setPanelSheet(false); };
  const switchView = (v) => {
    setView(v); autoOff.current = false;
    try { const u = new URL(window.location.href); if (v === 'all') u.searchParams.delete('view'); else u.searchParams.set('view', v); window.history.replaceState(window.history.state, '', u.pathname + u.search); } catch { /* ignore */ }
  };
  const onListKey = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const rows = [...(listRef.current ? listRef.current.querySelectorAll('.ibx-row') : [])];
    if (!rows.length) return;
    e.preventDefault();
    const i = rows.indexOf(document.activeElement);
    rows[i < 0 ? 0 : Math.max(0, Math.min(rows.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))].focus();
  };

  // ---- actions on the open conversation -----------------------------------------------------------------------------
  const later = (ms, fn) => timers.current.push(window.setTimeout(fn, ms));
  const say = (res, ok) => { if (res && res.ok === false) { toast(res.error, { tone: 'error' }); return false; } if (ok) toast(ok); return true; };
  const act = {
    send: (msgs) => {
      const id = sel;
      const c = inbox.get().convs.find((x) => x.id === id);
      const res = send(id, msgs);
      if (!say(res)) return;
      if (!msgs.some((m) => m.from === 'agent')) return;
      later(900, () => tick(id, res.ids, 'delivered'));
      // demo: the first reply in each conversation gets an answer back; in AI auto GridAI then answers
      if (!c || demoDone.current.has(id)) return;
      demoDone.current.add(id);
      later(1800, () => setTyping(id));
      later(4400, () => {
        setTyping('');
        const lines = COMEBACK[c.kind] || COMEBACK.lead;
        contactWrites(id, lines[demoDone.current.size % lines.length], { open: selRef.current === id });
        const now = inbox.get().convs.find((x) => x.id === id);
        if (now && aiModeOf(now, inbox.get()) === 'auto') later(1600, () => {
          const r = aiAnswer(id);
          if (r.ok && r.waiting) toast(`GridAI drafted a reply for ${firstName(c.name)} · waiting for approval`, { tone: 'info' });
        });
      });
    },
    schedule: (msg, at) => say(schedule(sel, msg, at), `Scheduled for ${whenText(at, t)}`),
    cancelScheduled: (sid) => say(cancelScheduled(sel, sid), 'Scheduled message cancelled'),
    sendScheduled: (sid) => say(sendScheduledNow(sel, sid), 'Sent'),
    status: (s, until) => {
      const id = sel;
      const prev = conv ? conv.status : 'open';
      const res = setStatus(id, s, until);
      if (!say(res)) return;
      const word = { open: 'Back in Open', pending: 'Moved to Pending', snoozed: `Snoozed until ${whenText(until, t)}`, closed: 'Conversation closed' }[s];
      toast(word, s === 'closed' || s === 'snoozed' ? { undo: () => setStatus(id, prev === 'closed' || prev === 'snoozed' ? 'open' : prev) } : undefined);
    },
    priority: (p) => say(setPriority(sel, p), `Priority: ${priorityOf(p)[1]}`),
    assign: (id) => { const from = conv && conv.assignee; say(assign(sel, id), !id ? 'Unassigned' : from && from !== id ? `Transferred to ${staffName(id)}` : `Assigned to ${staffName(id)}`); },
    toggleTag: (g) => say(toggleTag(sel, g)),
    saveNote: (n) => say(saveContactNote(sel, n)),
    setAi: (m) => say(setAi(sel, m), `GridAI: ${aiModeName(m || data.settings.defaultAi)} for this chat`),
    takeOver: () => say(takeOver(sel), 'You took over · GridAI is off for this chat'),
    approve: (aid, text) => { const a = conv && conv.approvals.find((x) => x.id === aid); return say(approveDraft(sel, aid, text), a ? `${sensitiveName(a.topic)} reply sent` : 'Sent'); },
    reject: (aid) => say(rejectDraft(sel, aid), 'Draft rejected'),
    markUnread: () => { markUnread(sel); autoOff.current = true; setSel(''); setPane('list'); toast('Marked as unread'); },
    openReplies: () => setDlg('replies'),
    endCall: (sec, answered) => {
      const c = conv;
      send(c.id, [{ from: 'agent', by: me, type: 'call', dir: answered ? 'out' : 'missed', dur: sec, status: 'sent' }]);
      if (c.phone) logCall({ dir: 'out', line: LINE_FOR[c.kind] || 'support', phone: c.phone, name: c.name, company: c.company, kind: c.kind, contactKey: c.contactKey, shopId: c.shopId, dur: sec, outcome: answered ? '' : 'No answer' });
      toast(answered ? `Call with ${c.name} logged in Calls` : `${c.name} didn’t answer`);
    },
  };

  const panelOn = wide ? panelWide : panelSheet;
  const togglePanel = () => (wide ? setPanelWide((v) => !v) : setPanelSheet((v) => !v));
  const panel = conv ? <ContactPanel conv={conv} data={data} db={db} t={pt} me={me} onOpenConv={openAny} act={act} onClose={wide ? () => setPanelWide(false) : undefined} /> : null;
  const defaultAi = live ? data.settings.defaultAi : 'assist';

  return (
    <AdminShell active="inbox">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ix-page ibx-page aib" data-pane={pane}>
        <ShopHeader icon="inbox" title="Inbox"
          about="GridCommerce's chats with leads, merchants, affiliates and partners from Messenger, Instagram, WhatsApp, email, the website's live chat and Telegram. Pick a chat to reply; the contact, their store and their other conversations are on the right. GridAI can stay off, suggest replies, or answer by itself; refunds, prices, cancellations and payment details always wait for a person."
          secondary={[{ label: 'Saved replies', icon: 'zap', onClick: () => setDlg('replies') }]}
          more={[{ label: 'Calls', href: '/admin/calls' }]}
          primary={{ label: 'New conversation', onClick: () => setDlg('new') }}
          middle={
            <span className="aib-mid">
              <button type="button" className="ix-btn ix-btn--sm aib-ai" onClick={() => setDlg('ai')} aria-label={`GridAI default: ${aiModeName(defaultAi)}. Change`}>
                <Icon name="sparkles" width="16" height="16" aria-hidden="true" /><span>Default: {aiModeName(defaultAi)}</span>
              </button>
              {waiting.length ? <button type="button" className="ix-btn ix-btn--sm aib-wait" onClick={() => setDlg('ai')}><Icon name="shield-alert" width="16" height="16" aria-hidden="true" />{waiting.reduce((a, c) => a + c.approvals.length, 0)} need approval</button> : null}
            </span>
          } />

        <div className="ibx-app" data-pane={pane} data-panel={wide && panelWide && conv ? 'open' : 'closed'}>
          {/* ---- conversation list ---- */}
          <section className="ibx-list" aria-label="Conversations">
            <div className="ibx-listhead">
              <div className="ibx-listhead__row">
                <SearchBox value={q} onChange={setQ} placeholder="Search name, store, message" label="Search conversations" onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); const r = listRef.current && listRef.current.querySelector('.ibx-row'); if (r) r.focus(); } }} />
              </div>
              <div className="ibx-tabs" role="tablist" aria-label="Views">
                {VIEWS.map(([id, l]) => <button key={id} type="button" role="tab" aria-selected={view === id} onClick={() => switchView(id)}>{l}<b>{live ? viewCount(id) : ''}</b></button>)}
              </div>
              <div className="ib-scroll-x" role="group" aria-label="Filter by channel">
                <button type="button" className="ib-chip" aria-pressed={chan === 'all'} onClick={() => setChan('all')}>All{live && chanUnread('all') ? <span className="ib-count">{chanUnread('all')}</span> : null}</button>
                {CHANNEL_IDS.map((ch) => {
                  const n = live ? chanUnread(ch) : 0;
                  return <button key={ch} type="button" className="ib-chip ibx-chanchip" aria-pressed={chan === ch} onClick={() => setChan(chan === ch ? 'all' : ch)} aria-label={channelName(ch) + (n ? `, ${n} unread` : '')} title={channelName(ch)}><ChannelIcon channel={chIcon(ch)} size={18} decorative />{n ? <span className="ib-count">{n}</span> : null}</button>;
                })}
              </div>
            </div>
            <div className="ibx-rows">
              {!live ? <div className="aib-skel" aria-busy="true" aria-label="Loading conversations">{[0, 1, 2, 3, 4, 5].map((i) => <span key={i} />)}</div> : list.length ? (
                <ul className="ibx-ul" ref={listRef} onKeyDown={onListKey} aria-label={`${VIEWS.find((x) => x[0] === view)[1]} conversations`}>
                  {list.map((c) => {
                    const vis = lastOf(c);
                    const lead = vis ? (vis.from === 'agent' ? (vis.by === me ? 'You: ' : firstName(staffName(vis.by)) + ': ') : vis.from === 'ai' ? 'GridAI: ' : vis.from === 'note' ? 'Note: ' : '') : '';
                    const st = statusOf(c, t);
                    const pr = priorityOf(c.priority);
                    return (
                      <li key={c.id}>
                        <button type="button" className="ibx-row" data-unread={c.unread ? '' : undefined} aria-current={c.id === sel ? 'true' : undefined} onClick={() => open(c.id)}
                          aria-label={`${c.name}${c.company ? ', ' + c.company : ''}, ${KINDS[c.kind].label}, ${channelName(c.ch)}${c.unread ? `, ${c.unread} unread` : ''}${c.approvals.length ? ', needs approval' : ''}`}>
                          <Avatar name={c.name} ch={c.ch} size={36} />
                          <span className="ibx-row__main">
                            <span className="ibx-row__top"><span className="ibx-row__name">{c.name}</span><span className="ibx-row__time">{shortAgo(lastAt(c), t)}</span></span>
                            <span className="ibx-row__prev">{lead}{previewOf(vis)}</span>
                            <span className="ibx-row__foot">
                              <span className={'aib-kind aib-kind--' + c.kind}>{KINDS[c.kind].label}</span>
                              {c.approvals.length ? <span className="gc-badge gc-badge--warning">Needs approval</span> : null}
                              {c.priority === 'urgent' || c.priority === 'high' ? <span className={'gc-badge gc-badge--' + pr[2]}>{pr[1]}</span> : null}
                              {st === 'pending' ? <span className="gc-badge gc-badge--info">Pending</span> : st === 'snoozed' ? <span className="gc-badge gc-badge--warning">Snoozed</span> : null}
                              {aiModeOf(c, data) === 'auto' && st !== 'closed' ? <Icon name="sparkles" width="14" height="14" className="aib-autoic" aria-label="AI auto" /> : null}
                              <span className="ibx-row__end"><StaffAvatar id={c.assignee} size={20} />{c.unread ? <span className="ib-count">{c.unread}</span> : null}</span>
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : filtered ? <EmptyState icon="search-x" title="No conversations match" actionLabel="Clear search and channel" onAction={() => { setChan('all'); setQ(''); }} />
                : <EmptyState icon={EMPTY[view][0]} title={EMPTY[view][1]} />}
            </div>
          </section>

          {/* ---- thread ---- */}
          <section className="ibx-thread" aria-label={conv ? `Conversation with ${conv.name}` : 'Conversation'}>
            {conv ? (
              <Thread conv={conv} data={data} now={t} me={me} typing={typing === conv.id} panelOpen={panelOn} onBack={back} onTogglePanel={togglePanel} act={act} draftIn={draftIn} />
            ) : <div className="ibx-pick"><EmptyState icon="messages-square" title={live ? 'Pick a conversation' : 'Loading…'} /></div>}
          </section>

          {/* ---- contact ---- */}
          {wide && panelWide && conv ? <aside className="ibx-panel" aria-label="Contact details">{panel}</aside> : null}
        </div>

        <Sheet open={!wide && panelSheet && !!conv} onClose={() => setPanelSheet(false)} title="Contact details">{panel}</Sheet>
        {live ? <>
          <SavedReplies open={dlg === 'replies'} onClose={() => setDlg('')} data={data} ctx={conv ? { name: conv.name, store: conv.company, agent: staffName(me) } : null}
            onUse={conv ? (r) => { setDlg(''); setDraftIn({ conv: conv.id, text: fillReply(r.body, { name: conv.name, store: conv.company, agent: staffName(me) }), n: Date.now() }); } : null} />
          <NewConversation open={dlg === 'new'} onClose={() => setDlg('')} onDone={(id, f) => { setDlg(''); setView('all'); setChan('all'); setQ(''); open(id); toast(`Conversation with ${f.name} started on ${channelName(f.ch)}`); }} />
          <AiSettings open={dlg === 'ai'} onClose={() => setDlg('')} data={data} t={t} onOpenConv={openAny}
            onDefault={(m) => { setDefaultAi(m); toast(`Default: ${aiModeName(m)}`); }} />
        </> : null}
      </div>
    </AdminShell>
  );
}

const CSS = PARTS_CSS + PANEL_CSS + THREAD_CSS + `
/* the inbox fills the window and each pane scrolls on its own */
body:has(.aib) .gc-ai{display:none}
.adm:has(.aib) .gc-shell__main{height:calc(100dvh - var(--shell-inset) * 2);min-height:600px}
.adm:has(.aib) .gc-shell__content{flex:1;min-height:0;display:flex;flex-direction:column;padding:var(--space-3) var(--space-4)!important;overflow:visible}
body:has(#nl-badge-frame) .adm:has(.aib) .gc-shell__content{padding-bottom:var(--space-3)!important}
.aib{flex:1;min-height:0;gap:var(--space-3);max-width:none}
.aib>.ix-head{flex:none;flex-shrink:0!important}
.aib-mid{display:inline-flex;align-items:center;gap:var(--space-2)}
.aib-ai{color:var(--accent-text)}
.aib-wait{border-color:color-mix(in srgb,var(--warning) 45%,transparent);background:var(--fill-warning-soft);color:var(--text-warning)}
.aib-skel{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3)}
.aib-skel span{height:64px;border-radius:var(--radius-lg);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:aib-sk 1.4s ease infinite}
@keyframes aib-sk{from{background-position:100% 0}to{background-position:-100% 0}}
.aib-kind{display:inline-flex;align-items:center;height:20px;padding:0 6px;border-radius:var(--radius-full);background:var(--surface-quiet);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body)}
.aib-kind--lead{background:var(--fill-primary-soft);color:var(--primary)}
.aib-kind--merchant{background:var(--fill-success-soft);color:var(--text-success)}
.aib-kind--affiliate{background:var(--fill-warning-soft);color:var(--text-warning)}
.aib-autoic{flex:none;color:var(--accent-text)}
.ibx-app{flex:1;min-height:0;display:grid;grid-template-columns:minmax(280px,320px) minmax(0,1fr) minmax(280px,320px);overflow:hidden;border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-card)}
.ibx-app[data-panel="closed"]{grid-template-columns:minmax(280px,320px) minmax(0,1fr)}
.ibx-list{display:flex;flex-direction:column;min-width:0;min-height:0;border-right:1px solid var(--border-subtle);background:var(--surface-card)}
.ibx-thread{display:flex;flex-direction:column;min-width:0;min-height:0;background:var(--surface-page);container-type:inline-size}
.ibx-panel{min-height:0;overflow-y:auto;overscroll-behavior:contain;border-left:1px solid var(--border-subtle);background:var(--surface-card)}
.ibx-pick{flex:1;display:grid;place-items:center}
.ibx-listhead{display:flex;flex-direction:column;gap:var(--space-2);flex:none;padding:var(--space-3) var(--space-3) var(--space-2);border-bottom:1px solid var(--border-subtle)}
.ibx-listhead__row{display:flex;align-items:center;gap:4px}
.ibx-listhead .ib-search .gc-input{height:32px}
.ibx-tabs{display:flex;margin:0 calc(var(--space-3) * -1);padding:0 var(--space-1);overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--border-subtle)}
.ibx-tabs::-webkit-scrollbar{display:none}
.ibx-tabs button{flex:none;display:inline-flex;align-items:center;justify-content:center;gap:5px;height:36px;margin-bottom:-1px;padding:0 var(--space-2);border:0;border-bottom:2px solid transparent;background:none;color:var(--text-body);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap;cursor:pointer}
.ibx-tabs button:hover{color:var(--text-heading)}
.ibx-tabs button[aria-selected="true"]{border-bottom-color:var(--primary);color:var(--primary)}
.ibx-tabs b{font-weight:var(--weight-medium);color:var(--text-muted);font-variant-numeric:tabular-nums}
.ibx-tabs button[aria-selected="true"] b{color:var(--primary)}
.ibx-listhead .ib-chip{height:28px}
.ibx-chanchip{gap:4px;padding:0 var(--space-2)}
.ibx-rows{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain}
.ibx-ul{list-style:none;margin:0;display:flex;flex-direction:column;gap:2px;padding:var(--space-1-5)}
.ibx-row{display:flex;align-items:flex-start;gap:10px;width:100%;padding:10px var(--space-2-5);border:0;border-radius:var(--radius-lg);background:none;font:inherit;text-align:left;cursor:pointer;transition:background-color var(--duration-base) var(--ease-out),box-shadow var(--duration-base) var(--ease-out)}
.ibx-row:hover{background:var(--surface-subtle)}
.ibx-row[aria-current="true"]{background:var(--fill-primary-soft);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 18%,transparent)}
.ibx-row:focus-visible{outline:none;box-shadow:inset 0 0 0 2px var(--focus-ring)}
.aib :is(.ibx-rows,.th-msgs,.ibx-panel){scrollbar-width:thin;scrollbar-color:color-mix(in srgb,var(--text-muted) 35%,transparent) transparent}
@media (prefers-reduced-motion:reduce){.ibx-row{transition:none}.aib-skel span{animation:none}}
.ibx-row__main{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.ibx-row__top{display:flex;align-items:baseline;gap:var(--space-2)}
.ibx-row__name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body)}
.ibx-row__time{flex:none;font-size:var(--text-xs);color:var(--text-muted);font-variant-numeric:tabular-nums}
.ibx-row[data-unread] .ibx-row__name{font-weight:var(--weight-semibold);color:var(--text-heading)}
.ibx-row[data-unread] .ibx-row__time{color:var(--primary);font-weight:var(--weight-medium)}
.ibx-row__prev{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-xs);color:var(--text-muted)}
.ibx-row[data-unread] .ibx-row__prev{color:var(--text-heading)}
.ibx-row__foot{display:flex;align-items:center;gap:6px;min-height:20px;margin-top:2px;overflow:hidden}
.ibx-row__foot .gc-badge{height:20px;padding:0 6px}
.ibx-row__end{display:flex;align-items:center;gap:6px;flex:none;margin-left:auto}
@media (max-width:1599px){.ibx-app{grid-template-columns:minmax(260px,300px) minmax(0,1fr) minmax(260px,300px)}.ibx-app[data-panel="closed"]{grid-template-columns:minmax(260px,300px) minmax(0,1fr)}}
@media (max-width:1279px){.ibx-app,.ibx-app[data-panel]{grid-template-columns:minmax(260px,300px) minmax(0,1fr)}}
@media (max-width:640px){
  .ibx-row__foot{flex-wrap:wrap;row-gap:4px}
  .ibx-row__foot>*{flex:none;max-width:100%}
}
/* phones: one pane at a time; the title row hides while a conversation is open */
@media (max-width:767px){
  .adm:has(.aib) .gc-shell__main{height:100dvh;min-height:0}
  .adm:has(.aib) .gc-shell__content{padding:var(--space-3) 0 0!important}
  .adm:has(.aib[data-pane="thread"]) .gc-shell__content{padding-top:0!important}
  .aib{gap:var(--space-2)}
  .aib>.ix-head{padding:0 var(--space-4)}
  .aib[data-pane="thread"]>.ix-head{display:none}
  .ibx-app,.ibx-app[data-panel]{grid-template-columns:minmax(0,1fr);border-top:1px solid var(--border-subtle);border-radius:0;box-shadow:none}
  .ibx-app[data-pane="list"] .ibx-thread,.ibx-app[data-pane="thread"] .ibx-list{display:none}
  .ibx-list{border-right:0}
  .aib .th-back{display:inline-flex}
  .aib .th-input{min-height:64px}
}
`;
