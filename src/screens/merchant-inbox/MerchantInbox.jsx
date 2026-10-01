'use client';
// MerchantInbox — one inbox for chats from Facebook, Instagram, WhatsApp, TikTok, LinkedIn and
// Telegram, plus moderation of public comments on posts and reels.
//   Chats     conversation list (status tabs, channel chips with unread counts, mine/unassigned,
//             search, sort, SLA timers, bulk close/assign/tag) · thread · customer panel
//   Comments  posts list · moderation queue · insights (src/components/inbox/Comments.jsx)
// Three panes from 1280px, two on tablets (customer panel slides over), one on phones
// (list → thread with a back button; the panel is a full-screen sheet).
// Keyboard: ↑/↓ move through the list, Enter opens; in the composer Enter sends, Shift+Enter is a
// new line and "/" searches saved replies.
// Front end only: data lives in this browser (src/lib/inbox.js); customers and orders come from
// src/lib/customers.js and src/lib/orders.js by phone number.
// URL: ?view=comments opens the comments, ?c=<conversation id> or ?phone=<number> opens a chat.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { PageHeader, EmptyState, ChannelIcon } from '@/components/ui';
import { getOrders } from '@/lib/orders';
import { getCustomers } from '@/lib/customers';
import {
  ME, STAFF, CHANNEL_IDS, channelName, staffName, firstName, getConvs, patchConv, addMessages, addConversation, mergeConversations,
  getTags, addTag as saveTag, getReplies, getComments, statusOf, lastAny, lastAt, waitingMinutes, previewOf, ago, whenText, comeback, samePhone,
} from '@/lib/inbox';
import { useInbox, useNow, useMedia, Avatar, StaffAvatar, SlaChip, Menu, MenuItem, Sheet, Seg, SearchBox, PARTS_CSS } from '@/components/inbox/parts';
import { Thread, THREAD_CSS } from '@/components/inbox/Thread';
import { CustomerPanel, TagMenu, PANEL_CSS } from '@/components/inbox/CustomerPanel';
import { SavedRepliesDialog, MergeDialog, NewConversationDialog, SnoozeDialog, DIALOGS_CSS } from '@/components/inbox/Dialogs';
import { CommentsView, COMMENTS_CSS } from '@/components/inbox/Comments';

const TABS = [['open', 'Open'], ['pending', 'Pending'], ['snoozed', 'Snoozed'], ['closed', 'Closed']];
const SORTS = [['recent', 'Newest message'], ['waiting', 'Waiting longest'], ['unread', 'Unread first'], ['oldest', 'Oldest message']];
const EMPTY_TAB = {
  open: ['inbox', 'You are all caught up', 'No open conversations. New messages land here.'],
  pending: ['hourglass', 'Nothing pending', 'Conversations waiting on the customer show here.'],
  snoozed: ['alarm-clock', 'Nothing snoozed', 'Snoozed conversations come back to Open at their time.'],
  closed: ['archive', 'No closed conversations', 'Closed conversations are kept here and reopen when the customer writes.'],
};
const mid = () => 'm-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const sys = (icon, text) => ({ id: mid(), from: 'system', type: 'text', icon, text });
const me = staffName(ME);

export default function MerchantInbox() {
  const data = useInbox(() => ({ convs: getConvs(), tags: getTags(), replies: getReplies(), openComments: getComments().filter((c) => c.status === 'open').length }));
  const now = useNow(30000);
  const wide = useMedia('(min-width:1280px)');
  const phone = useMedia('(max-width:767px)');
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [view, setView] = useState('chats');
  const [sel, setSel] = useState('');
  const [pane, setPane] = useState('list');
  const [tab, setTab] = useState('open');
  const [chan, setChan] = useState('all');
  const [who, setWho] = useState('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('recent');
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState([]);
  const [panelWide, setPanelWide] = useState(true);
  const [panelSheet, setPanelSheet] = useState(false);
  const [typing, setTyping] = useState('');
  const [dlg, setDlg] = useState('');          // replies · new · merge · snooze
  const listRef = useRef(null);
  const selRef = useRef('');
  const demoDone = useRef(new Set());
  const timers = useRef([]);
  const replyN = useRef(0);
  const booted = useRef(false);
  const autoOff = useRef(false);      // after "mark as unread" nothing is opened by itself
  selRef.current = sel;

  useEffect(() => {
    setOrders(getOrders());
    setCustomers(getCustomers());
    const list = timers.current;
    return () => list.forEach((x) => window.clearTimeout(x));
  }, []);

  const convs = data ? data.convs : [];
  const tags = data ? data.tags : {};
  const conv = convs.find((c) => c.id === sel) || null;
  const t = now || Date.now();

  // open from the URL once the data is in
  useEffect(() => {
    if (!data || booted.current) return;
    booted.current = true;
    const p = new URLSearchParams(window.location.search);
    if (p.get('view') === 'comments') { setView('comments'); return; }
    const byId = p.get('c') && data.convs.find((c) => c.id === p.get('c'));
    const byPhone = p.get('phone') && data.convs.find((c) => samePhone(c.phone, p.get('phone')));
    const hit = byId || byPhone;
    if (hit) { setTab(statusOf(hit, Date.now())); open(hit.id); }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- the list ---------------------------------------------------------------------------------
  const needle = q.trim().toLowerCase();
  const base = convs.filter((c) => (who === 'all' || (who === 'mine' ? c.assignee === ME : !c.assignee)) && (!needle || [c.name, c.phone, c.handle, ...(c.tags || []), ...c.messages.map((m) => m.text || '')].join(' ').toLowerCase().includes(needle)));
  const inTab = base.filter((c) => statusOf(c, t) === tab);
  const list = useMemo(() => inTab.filter((c) => chan === 'all' || c.ch === chan).sort((a, b) => {
    if (sort === 'oldest') return lastAt(a) - lastAt(b);
    if (sort === 'waiting') return (waitingMinutes(b, t) - waitingMinutes(a, t)) || (lastAt(b) - lastAt(a));
    if (sort === 'unread') return ((b.unread ? 1 : 0) - (a.unread ? 1 : 0)) || (lastAt(b) - lastAt(a));
    return lastAt(b) - lastAt(a);
  }), [inTab, chan, sort, t]); // eslint-disable-line react-hooks/exhaustive-deps
  const tabCount = (id) => base.filter((c) => statusOf(c, t) === id && (chan === 'all' || c.ch === chan)).length;
  const chanUnread = (ch) => inTab.filter((c) => (ch === 'all' || c.ch === ch) && c.unread).length;
  const whoCount = (w) => convs.filter((c) => statusOf(c, t) === tab && (w === 'mine' ? c.assignee === ME : !c.assignee)).length;
  const unreadAll = convs.filter((c) => c.unread && statusOf(c, t) !== 'closed').length;
  const filtered = chan !== 'all' || who !== 'all' || !!needle;

  // desktop and tablet keep a conversation open: pick the first one when nothing is open
  useEffect(() => {
    if (!data || phone || view !== 'chats' || autoOff.current) return;
    if (!conv && list.length && !sel) open(list[0].id);
  }, [data, phone, view, list.length]); // eslint-disable-line react-hooks/exhaustive-deps

  function open(id) {
    autoOff.current = false;
    setSel(id);
    setPane('thread');
    const c = getConvs().find((x) => x.id === id);
    if (c && c.unread) patchConv(id, { unread: 0 });
  }
  const back = () => { setPane('list'); setPanelSheet(false); };
  const clearFilters = () => { setChan('all'); setWho('all'); setQ(''); };

  const onListKey = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const rows = [...(listRef.current ? listRef.current.querySelectorAll('.ibx-row') : [])];
    if (!rows.length) return;
    e.preventDefault();
    const i = rows.indexOf(document.activeElement);
    const next = i < 0 ? 0 : Math.max(0, Math.min(rows.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)));
    rows[next].focus();
  };

  // ---- bulk actions --------------------------------------------------------------------------------
  const togglePick = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const endPicking = () => { setPicking(false); setPicked([]); };
  const bulk = (patch, icon, text, done) => {
    picked.forEach((id) => addMessages(id, sys(icon, text), patch));
    toast(done);
    endPicking();
  };
  const bulkTag = (n) => bulk((c) => ({ tags: [...new Set([...(c.tags || []), n])] }), 'tag', `Tagged “${n}” by ${me}`, `Tagged “${n}” on ${picked.length} conversation${picked.length === 1 ? '' : 's'}`);

  // ---- actions on the open conversation ------------------------------------------------------------
  const act = {
    assign: (id) => { addMessages(sel, sys('user-round-check', id ? `Assigned to ${staffName(id)} by ${me}` : `Unassigned by ${me}`), { assignee: id }); toast(id ? `Assigned to ${staffName(id)}` : 'Unassigned'); },
    toggleTag: (name) => {
      const on = (conv.tags || []).includes(name);
      addMessages(sel, sys('tag', on ? `Tag “${name}” removed by ${me}` : `Tagged “${name}” by ${me}`), (c) => ({ tags: on ? c.tags.filter((x) => x !== name) : [...(c.tags || []), name] }));
    },
    addTag: (name) => { saveTag(name); if (!(conv.tags || []).includes(name)) act.toggleTag(name); },
    snooze: (until) => {
      const id = sel;
      addMessages(id, sys('alarm-clock', `Snoozed until ${whenText(until)} by ${me}`), { status: 'snoozed', snoozeUntil: until });
      toast(`Snoozed until ${whenText(until)}`, { undo: () => addMessages(id, sys('bell-ring', `Snooze cancelled by ${me}`), { status: 'open', snoozeUntil: null }) });
    },
    snoozeCustom: () => setDlg('snooze'),
    unsnooze: () => { addMessages(sel, sys('bell-ring', `Unsnoozed by ${me}`), { status: 'open', snoozeUntil: null }); toast('Back in Open'); },
    close: () => {
      const id = sel;
      addMessages(id, sys('circle-check', `Closed by ${me}`), { status: 'closed', snoozeUntil: null, unread: 0 });
      toast('Conversation closed', { undo: () => addMessages(id, sys('rotate-ccw', `Reopened by ${me}`), { status: 'open' }) });
    },
    reopen: () => { addMessages(sel, sys('rotate-ccw', `Reopened by ${me}`), { status: 'open' }); toast('Conversation reopened'); },
    pending: () => { addMessages(sel, sys('hourglass', `Set to Pending (waiting on the customer) by ${me}`), { status: 'pending' }); toast('Moved to Pending'); },
    markUnread: () => {
      const id = sel;
      patchConv(id, (c) => ({ unread: Math.max(1, c.unread || 0) }));
      autoOff.current = true;
      setSel(''); setPane('list');
      toast('Marked as unread');
    },
    block: async () => {
      if (!(await confirmDialog({ title: `Block ${conv.name}?`, body: `They can no longer message the shop on ${channelName(conv.ch)}, and the conversation is closed. You can unblock them later.`, confirmLabel: 'Block', tone: 'danger' }))) return;
      addMessages(sel, sys('ban', `Blocked by ${me}`), { blocked: true, status: 'closed' });
      toast(`${conv.name} is blocked`);
    },
    unblock: () => { addMessages(sel, sys('shield-check', `Unblocked by ${me}`), { blocked: false }); toast(`${conv.name} is unblocked`); },
    merge: () => setDlg('merge'),
    openPanel: () => setPanelSheet(true),
    system: (icon, text) => addMessages(sel, sys(icon, text)),
    send: (msgs) => {
      const id = sel;
      const c = getConvs().find((x) => x.id === id);
      if (!c) return;
      const rows = msgs.map((m) => ({ ...m, id: mid(), at: Date.now() }));
      const reply = rows.some((m) => m.from === 'agent');
      const st = statusOf(c, Date.now());
      const pre = [];
      const patch = { unread: 0 };
      if (reply && (st === 'closed' || st === 'snoozed')) { pre.push(sys('rotate-ccw', `Reopened by ${me} with a reply`)); patch.status = 'open'; patch.snoozeUntil = null; }
      if (reply && !c.assignee) { pre.push(sys('user-round-check', `Assigned to ${me} (first reply)`)); patch.assignee = ME; }
      addMessages(id, [...pre, ...rows], patch);
      if (!reply) return;
      const ids = rows.map((m) => m.id);
      const later = (ms, fn) => timers.current.push(window.setTimeout(fn, ms));
      later(900, () => patchConv(id, (x) => ({ messages: x.messages.map((m) => (ids.includes(m.id) && m.status === 'sent' ? { ...m, status: 'delivered' } : m)) })));
      // typing demo: the first reply in each conversation gets a short answer back
      if (demoDone.current.has(id) || c.blocked) return;
      demoDone.current.add(id);
      later(1800, () => setTyping(id));
      later(4400, () => {
        setTyping('');
        patchConv(id, (x) => ({ messages: x.messages.map((m) => (m.from === 'agent' && m.status !== 'read' ? { ...m, status: 'read' } : m)) }));
        addMessages(id, { from: 'customer', type: 'text', text: comeback(replyN.current++) }, (x) => ({ unread: selRef.current === id ? 0 : (x.unread || 0) + 1 }));
      });
    },
  };

  const createConv = ({ ch, name, phone: ph, text }) => {
    const known = convs.find((c) => c.ch === ch && samePhone(c.phone, ph));
    setDlg('');
    setChan('all'); setWho('all'); setQ('');
    if (known) { setTab(statusOf(known, Date.now())); open(known.id); toast(`You already have a ${channelName(ch)} chat with ${known.name}`, { tone: 'info' }); return; }
    const row = addConversation({ ch, name, phone: ph, messages: [sys('square-pen', `Started by ${me}`), { id: mid(), at: Date.now(), from: 'agent', by: ME, type: 'text', text, status: 'delivered' }] });
    setTab('open');
    open(row.id);
    toast(`Conversation with ${name} started on ${channelName(ch)}`);
  };
  const doMerge = (dropId) => {
    const drop = convs.find((c) => c.id === dropId);
    mergeConversations(sel, dropId);
    setDlg('');
    toast(`${drop ? drop.name + ' on ' + channelName(drop.ch) : 'Duplicate'} merged into this conversation`);
  };
  const setUrlView = (v) => {
    const url = new URL(window.location.href);
    if (v === 'comments') url.searchParams.set('view', 'comments'); else url.searchParams.delete('view');
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  };
  const switchView = (v) => { setView(v); setPane('list'); setPanelSheet(false); setUrlView(v); };
  const openFromComment = (id) => {
    setView('chats'); setUrlView('chats');
    setTab('open'); setChan('all'); setWho('all'); setQ('');
    open(id);
  };

  const panelOn = wide ? panelWide : panelSheet;
  const togglePanel = () => (wide ? setPanelWide((v) => !v) : setPanelSheet((v) => !v));
  const panel = conv ? (
    <CustomerPanel conv={conv} convs={convs} orders={orders} customers={customers} tags={tags} now={t}
      onOpenConv={(id) => { const c = convs.find((x) => x.id === id); if (c) setTab(statusOf(c, t)); setPanelSheet(false); open(id); }}
      onPatch={(patch) => patchConv(conv.id, patch)} onToggleTag={act.toggleTag} onAddTag={act.addTag}
      onSaved={() => setCustomers(getCustomers())} onClose={wide ? () => setPanelWide(false) : undefined} />
  ) : null;

  return (
    <div className="dc-screen ds ibx" data-screen="MerchantInbox">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="inbox" />
        <main className="gc-shell__main ibx-main">
          <Topbar crumb="Management" page="Inbox" />
          <div className="gc-shell__content ibx-content" data-pane={pane}>
            <PageHeader
              compact
              title="Inbox"
              description="Chats from Facebook, Instagram, WhatsApp, TikTok, LinkedIn and Telegram, and comments on your posts, in one place."
              actions={<>
                <Seg size="lg" label="Show" value={view} onChange={switchView} items={[['chats', 'Chats', data ? unreadAll : null, 'messages-square'], ['comments', 'Comments', data ? data.openComments : null, 'at-sign']]} />
                <button type="button" className="gc-btn gc-btn--neutral ibx-iconish" onClick={() => setDlg('replies')} aria-label="Saved replies" title="Saved replies"><Icon name="zap" width="18" height="18" aria-hidden="true" /><span className="ibx-lbl">Saved replies</span></button>
                {view === 'chats' ? <button type="button" className="gc-btn gc-btn--solid ibx-iconish" onClick={() => setDlg('new')} aria-label="New conversation" title="New conversation"><Icon name="square-pen" width="18" height="18" aria-hidden="true" /><span className="ibx-lbl">New conversation</span></button> : null}
              </>}
            />

            {view === 'comments' ? <CommentsView now={t} onOpenConv={openFromComment} wide={wide} /> : (
              <div className="ibx-app" data-pane={pane} data-panel={wide && panelWide && conv ? 'open' : 'closed'}>
                {/* ---- conversation list ---- */}
                <section className="ibx-list" aria-label="Conversations">
                  <div className="ibx-listhead">
                    <div className="ibx-listhead__row">
                      <SearchBox value={q} onChange={setQ} placeholder="Search name, phone, message" label="Search conversations" onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); const r = listRef.current && listRef.current.querySelector('.ibx-row'); if (r) r.focus(); } }} />
                      <Menu label="Sort" button={({ toggle, open: o }) => <button type="button" className="gc-iconbtn gc-iconbtn--xl ibx-tool" aria-expanded={o} onClick={toggle} aria-label={'Sort: ' + SORTS.find((s) => s[0] === sort)[1]} title="Sort"><Icon name="arrow-up-down" width="18" height="18" /></button>}>
                        {(close) => <><p className="ib-menu__head">Sort by</p>{SORTS.map(([v, l]) => <MenuItem key={v} checked={sort === v} onClick={() => { setSort(v); close(); }}>{l}</MenuItem>)}</>}
                      </Menu>
                      <button type="button" className={'gc-iconbtn gc-iconbtn--xl ibx-tool' + (picking ? ' gc-iconbtn--active' : '')} aria-pressed={picking} onClick={() => (picking ? endPicking() : setPicking(true))} aria-label="Select conversations" title="Select conversations"><Icon name="list-checks" width="18" height="18" /></button>
                    </div>
                    <div className="ibx-tabs" role="tablist" aria-label="Status">
                      {TABS.map(([id, l]) => <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => { setTab(id); setPicked([]); }}>{l}<b>{data ? tabCount(id) : ''}</b></button>)}
                    </div>
                    <div className="ib-scroll-x" role="group" aria-label="Filter by channel">
                      <button type="button" className="ib-chip" aria-pressed={chan === 'all'} onClick={() => setChan('all')}>All{chanUnread('all') ? <span className="ib-count">{chanUnread('all')}</span> : null}</button>
                      {CHANNEL_IDS.map((ch) => {
                        const n = chanUnread(ch);
                        return <button key={ch} type="button" className="ib-chip ibx-chan" aria-pressed={chan === ch} onClick={() => setChan(chan === ch ? 'all' : ch)} aria-label={channelName(ch) + (n ? `, ${n} unread` : '')} title={channelName(ch)}><ChannelIcon channel={ch} size={20} decorative />{n ? <span className="ib-count">{n}</span> : null}</button>;
                      })}
                    </div>
                    <Seg label="Assigned to" value={who} onChange={setWho} items={[['all', 'All'], ['mine', 'Mine', data ? whoCount('mine') : null], ['unassigned', 'Unassigned', data ? whoCount('unassigned') : null]]} />
                  </div>
                  {picking ? (
                    <div className="ibx-bulk" role="toolbar" aria-label="Bulk actions">
                      <label className="ibx-bulk__all"><input type="checkbox" className="gc-check" checked={!!list.length && list.every((c) => picked.includes(c.id))} onChange={(e) => setPicked(e.target.checked ? list.map((c) => c.id) : [])} aria-label="Select all shown" /><b>{picked.length} selected</b></label>
                      <Menu label="Assign" button={({ toggle, open: o }) => <button type="button" className="gc-btn gc-btn--xs gc-btn--neutral" disabled={!picked.length} aria-expanded={o} onClick={toggle}>Assign</button>}>
                        {(close) => <>{STAFF.map((p) => <MenuItem key={p.id} onClick={() => { close(); bulk({ assignee: p.id }, 'user-round-check', `Assigned to ${p.name} by ${me}`, `${picked.length} assigned to ${p.name}`); }} hint={p.role}>{p.name}</MenuItem>)}</>}
                      </Menu>
                      <Menu label="Tag" button={({ toggle, open: o }) => <button type="button" className="gc-btn gc-btn--xs gc-btn--neutral" disabled={!picked.length} aria-expanded={o} onClick={toggle}>Tag</button>}>
                        {(close) => <TagMenu tags={tags} on={[]} onToggle={(n) => { close(); bulkTag(n); }} onAdd={(n) => { saveTag(n); close(); bulkTag(n); }} />}
                      </Menu>
                      {tab !== 'closed'
                        ? <button type="button" className="gc-btn gc-btn--xs gc-btn--soft" disabled={!picked.length} onClick={() => bulk({ status: 'closed', snoozeUntil: null, unread: 0 }, 'circle-check', `Closed by ${me}`, `${picked.length} conversation${picked.length === 1 ? '' : 's'} closed`)}>Close</button>
                        : <button type="button" className="gc-btn gc-btn--xs gc-btn--soft" disabled={!picked.length} onClick={() => bulk({ status: 'open' }, 'rotate-ccw', `Reopened by ${me}`, `${picked.length} reopened`)}>Reopen</button>}
                      <button type="button" className="gc-iconbtn ibx-bulk__x" aria-label="Stop selecting" onClick={endPicking}><Icon name="x" width="16" height="16" /></button>
                    </div>
                  ) : null}
                  <div className="ibx-rows">
                    {!data ? <p className="ibx-loading">Loading conversations…</p> : list.length ? (
                      <ul className="ibx-ul" ref={listRef} onKeyDown={onListKey} aria-label={`${TABS.find((x) => x[0] === tab)[1]} conversations`}>
                        {list.map((c) => {
                          const last = lastAny(c);
                          const vis = [...c.messages].reverse().find((m) => m.from !== 'system') || last;
                          const lead = vis ? (vis.from === 'agent' ? (vis.by === ME ? 'You: ' : firstName(staffName(vis.by)) + ': ') : vis.from === 'note' ? 'Note: ' : '') : '';
                          const wait = waitingMinutes(c, t);
                          const on = picked.includes(c.id);
                          return (
                            <li key={c.id}>
                              <button type="button" className="ibx-row" data-unread={c.unread ? '' : undefined} aria-current={!picking && c.id === sel ? 'true' : undefined} aria-pressed={picking ? on : undefined}
                                onClick={() => (picking ? togglePick(c.id) : open(c.id))}
                                aria-label={`${c.name}, ${channelName(c.ch)}${c.unread ? `, ${c.unread} unread` : ''}${wait >= 60 ? `, waiting over ${Math.floor(wait / 60)} hour${wait >= 120 ? 's' : ''}` : ''}`}>
                                {picking ? <span className={'ibx-tick' + (on ? ' is-on' : '')} aria-hidden="true">{on ? <Icon name="check" width="14" height="14" /> : null}</span> : null}
                                <Avatar name={c.name} avatar={c.avatar} pos={c.pos} ch={c.ch} size={42} />
                                <span className="ibx-row__main">
                                  <span className="ibx-row__top"><span className="ibx-row__name">{c.name}</span><span className="ibx-row__time">{ago(last ? last.at : 0, t)}</span></span>
                                  <span className="ibx-row__prev">{lead}{previewOf(vis)}</span>
                                  <span className="ibx-row__foot">
                                    <SlaChip minutes={wait} />
                                    {c.blocked ? <span className="gc-badge gc-badge--error">Blocked</span> : null}
                                    {(c.tags || []).slice(0, 2).map((g) => <span key={g} className={'gc-badge gc-badge--' + (tags[g] || 'slate')}>{g}</span>)}
                                    {(c.tags || []).length > 2 ? <span className="ib-sub">+{c.tags.length - 2}</span> : null}
                                    <span className="ibx-row__end"><StaffAvatar id={c.assignee} size={22} />{c.unread ? <span className="ib-count">{c.unread}</span> : null}</span>
                                  </span>
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : filtered ? <EmptyState icon="search-x" title="No conversations match" body="Check the spelling, or clear the search and filters." actionLabel="Clear filters" onAction={clearFilters} />
                      : <EmptyState icon={EMPTY_TAB[tab][0]} title={EMPTY_TAB[tab][1]} body={EMPTY_TAB[tab][2]} />}
                  </div>
                </section>

                {/* ---- thread ---- */}
                <section className="ibx-thread" aria-label={conv ? `Conversation with ${conv.name}` : 'Conversation'}>
                  {conv ? (
                    <Thread conv={conv} now={t} tags={tags} orders={orders} replies={data.replies} typing={typing === conv.id} panelOpen={panelOn} onBack={back} onTogglePanel={togglePanel} act={act} />
                  ) : <div className="ibx-pick"><EmptyState icon="messages-square" title={data ? 'Pick a conversation' : 'Loading…'} body={data ? 'Choose a chat on the left to read it and reply. Use ↑ and ↓ to move through the list and Enter to open.' : undefined} /></div>}
                </section>

                {/* ---- customer panel ---- */}
                {wide && panelWide && conv ? <aside className="ibx-panel" aria-label="Customer details">{panel}</aside> : null}
              </div>
            )}
          </div>
        </main>
      </div>

      <Sheet open={view === 'chats' && !wide && panelSheet && !!conv} onClose={() => setPanelSheet(false)} title="Customer details">{panel}</Sheet>
      <SavedRepliesDialog open={dlg === 'replies'} onClose={() => setDlg('')} />
      <NewConversationDialog open={dlg === 'new'} onClose={() => setDlg('')} onCreate={createConv} />
      <MergeDialog open={dlg === 'merge'} onClose={() => setDlg('')} conv={conv} convs={convs} onMerge={doMerge} now={t} />
      <SnoozeDialog open={dlg === 'snooze'} onClose={() => setDlg('')} onSnooze={(until) => { setDlg(''); act.snooze(until); }} />
    </div>
  );
}

const CSS = PARTS_CSS + DIALOGS_CSS + PANEL_CSS + THREAD_CSS + COMMENTS_CSS + `
/* the inbox fills the window and each pane scrolls on its own; the floating assistant would cover the composer */
body:has(.ibx) .gc-ai{display:none}
.ibx .gc-shell__main.ibx-main{height:calc(100dvh - var(--shell-inset) * 2);min-height:600px;background:var(--surface-page)}
.ibx .gc-shell__content.ibx-content{flex:1;min-height:0;display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-5) var(--space-6) var(--space-6)!important;overflow:visible}
.ibx-app{flex:1;min-height:0;display:grid;grid-template-columns:minmax(300px,340px) minmax(0,1fr) minmax(300px,340px);overflow:hidden;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-soft)}
.ibx-app[data-panel="closed"]{grid-template-columns:minmax(300px,340px) minmax(0,1fr)}
.ibx-list{display:flex;flex-direction:column;min-width:0;min-height:0;border-right:1px solid var(--border-subtle);background:var(--surface-card)}
.ibx-thread{display:flex;flex-direction:column;min-width:0;min-height:0;background:var(--surface-page);container-type:inline-size}
.ibx-panel{min-height:0;overflow-y:auto;overscroll-behavior:contain;border-left:1px solid var(--border-subtle);background:var(--surface-card)}
.ibx-pick{flex:1;display:grid;place-items:center}
.ibx-listhead{display:flex;flex-direction:column;gap:var(--space-2-5);flex:none;padding:var(--space-4) var(--space-4) var(--space-3);border-bottom:1px solid var(--border-subtle)}
.ibx-listhead__row{display:flex;align-items:center;gap:var(--space-1-5)}
.ibx-listhead__row .ib-h2{margin-right:auto}
.ibx-tool{flex:none}
.ibx-listhead>.ib-seg{align-self:flex-start}
.ibx-tabs{display:flex;margin:0 calc(var(--space-4) * -1);padding:0 var(--space-2);border-bottom:1px solid var(--border-subtle)}
.ibx-tabs button{flex:1 1 0;min-width:0;display:inline-flex;align-items:center;justify-content:center;gap:5px;height:38px;margin-bottom:-1px;padding:0 var(--space-1);border:0;border-bottom:2px solid transparent;background:none;color:var(--text-body);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap;cursor:pointer}
.ibx-tabs button:hover{color:var(--text-heading)}
.ibx-tabs button[aria-selected="true"]{border-bottom-color:var(--primary);color:var(--primary)}
.ibx-tabs b{font-weight:var(--weight-medium);color:var(--text-muted);font-variant-numeric:tabular-nums}
.ibx-tabs button[aria-selected="true"] b{color:var(--primary)}
.ibx-chan{gap:4px;padding:0 var(--space-2)}
.ibx-bulk{display:flex;align-items:center;gap:var(--space-1-5);flex:none;padding:var(--space-2) var(--space-2) var(--space-2) var(--space-4);border-bottom:1px solid var(--border-subtle);background:var(--fill-primary-soft)}
.ibx-bulk__all{display:inline-flex;align-items:center;gap:var(--space-2);margin-right:auto;font-size:var(--text-xs);color:var(--text-heading);white-space:nowrap}
.ibx-bulk__all b{font-weight:var(--weight-medium)}
.ibx-bulk .gc-btn--xs{padding:0 var(--space-2-5)}
.ibx-bulk__x{width:30px;height:30px}
.ibx-rows{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain}
.ibx-loading{margin:0;padding:var(--space-6);text-align:center;font-size:var(--text-sm);color:var(--text-muted)}
.ibx-ul{list-style:none;margin:0;padding:0}
.ibx-row{display:flex;align-items:flex-start;gap:var(--space-3);width:100%;padding:var(--space-3) var(--space-4) var(--space-3) calc(var(--space-4) - 3px);border:0;border-left:3px solid transparent;border-bottom:1px solid var(--border-subtle);background:none;text-align:left;cursor:pointer;transition:background-color var(--duration-base) var(--ease-out)}
.ibx-row:hover{background:var(--surface-page)}
.ibx-row[aria-current="true"]{border-left-color:var(--primary);background:var(--fill-primary-soft)}
.ibx-row[aria-pressed="true"]{background:var(--fill-primary-soft)}
.ibx-row:focus-visible{outline:none;box-shadow:inset 0 0 0 2px var(--focus-ring)}
.ibx-tick{display:grid;place-items:center;flex:none;width:20px;height:20px;margin-top:11px;border:1px solid var(--border-strong);border-radius:var(--radius-md);background:var(--surface-card);color:var(--text-inverse)}
.ibx-tick.is-on{border-color:var(--primary);background:var(--primary)}
.ibx-row__main{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.ibx-row__top{display:flex;align-items:baseline;gap:var(--space-2)}
.ibx-row__name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body)}
.ibx-row[data-unread] .ibx-row__name{font-weight:var(--weight-semibold);color:var(--text-heading)}
.ibx-row__time{flex:none;font-size:var(--text-xs);color:var(--text-muted)}
.ibx-row[data-unread] .ibx-row__time{font-weight:var(--weight-medium);color:var(--primary)}
.ibx-row__prev{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-xs-plus);color:var(--text-muted)}
.ibx-row[data-unread] .ibx-row__prev{color:var(--text-heading)}
.ibx-row__foot{display:flex;align-items:center;gap:var(--space-1-5);min-height:24px;margin-top:4px;overflow:hidden}
.ibx-row__foot .gc-badge{height:20px;padding:0 var(--space-1-5)}
.ibx-row__end{display:flex;align-items:center;gap:var(--space-1-5);flex:none;margin-left:auto}
.ibx-lbl{white-space:nowrap}
/* tablets: two panes, the customer panel slides over */
/* up to 1599px the conversation gets the room: narrower list and customer panel */
@media (max-width:1599px){.ibx-app{grid-template-columns:minmax(260px,300px) minmax(0,1fr) minmax(260px,290px)}.ibx-app[data-panel="closed"]{grid-template-columns:minmax(260px,300px) minmax(0,1fr)}}
@media (max-width:1279px){.ibx-app,.ibx-app[data-panel]{grid-template-columns:minmax(280px,320px) minmax(0,1fr)}}
@media (max-width:1023px){.ibx .gc-shell__content.ibx-content{padding:var(--space-4)!important}}
/* phones: tags that don't fit wrap to a second line; the assignee and unread count stay at the right edge */
@media (max-width:640px){
  .ibx-row__foot{flex-wrap:wrap;row-gap:4px}
  .ibx-row__foot>*{flex:none;max-width:100%}
  .ibx-row__end{flex:none}
}
/* phones: one pane at a time */
@media (max-width:767px){
  .ibx .gc-shell__main.ibx-main{height:100dvh;min-height:0}
  .ibx .gc-shell__content.ibx-content{gap:var(--space-3);padding:var(--space-3) 0 0!important}
  .ibx-content>.gc-pagehead{padding:0 var(--space-4)}
  .ibx-content>.gc-pagehead .gc-pagehead__desc{display:none}
  .ibx-content[data-pane="thread"]{padding-top:0!important}
  .ibx-content[data-pane="thread"]>.gc-pagehead{display:none}
  .ibx-app,.ibx-app[data-panel]{grid-template-columns:minmax(0,1fr);border:0;border-top:1px solid var(--border-subtle);border-radius:0;box-shadow:none}
  .ibx-app[data-pane="list"] .ibx-thread,.ibx-app[data-pane="thread"] .ibx-list,.ibx-app[data-pane="queue"] .ibx-list,.ibx-app[data-pane="list"] .cm-queue{display:none}
  .ibx-list{border-right:0}
  .ibx .th-back{display:inline-flex}
  .ibx-iconish{width:44px;padding:0}
  .ibx-lbl{display:none}
  .ibx-content>.gc-pagehead .gc-pagehead__actions{flex-wrap:nowrap}
  .ibx-content>.gc-pagehead .ib-seg{flex:1;min-width:0}
  .ibx-content>.gc-pagehead .ib-seg button{flex:1;justify-content:center;padding:0 var(--space-2)}
}
`;
