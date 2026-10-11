'use client';
// Merchant app · Inbox (/m-inbox). The design board's layout (design/templates/app/MInbox.dc.html) over the shared inbox
// (lib/inbox.js), the same one the web Inbox (/merchant-inbox) reads:
//   Chats     the people row (latest open chats, a blue ring while unread), filter chips (All · Unread · Mine · Done)
//             and the connected chat channels (Connections › connectedInbox('Messages'), as the web's chips), then the
//             chats: newest first, unread in bold with the count, an order or tag pill, Pending / Snoozed / GridAI.
//             A chat opens /m-chat?id=. Search looks through names, numbers, tags and messages.
//   Comments  public comments on the connected channels' posts (inbox.getComments): To answer · All · Hidden. A comment
//             opens a sheet: reply in public, like, reply in a private chat (inbox.dmFromComment), hide / show.
//   Mentions  story and post mentions of the shop and team notes that @mention you (getMentions, teamMentions): reply
//             in a chat (chatFromMention), mark done.
//   New message (the pencil): channel, name, number and the first message (inbox.addConversation, as the web's
//             New conversation; an existing chat with that number on that channel opens instead).
// ?view=comments | mentions opens a view. Counts follow lib/liveCounts.js; everything redraws on gc:inbox.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AppScreen, Content, LargeHeader, TabBar, Card, IconButton, SearchField, Segmented, Sheet, Button, Pill, Field, TextInput,
  EmptyState, Skeleton, Note, useAppData, useQuery, toast,
} from './kit/AppKit';
import {
  ME, CHANNELS, CHANNEL_IDS, channelName, staffName, firstName, getConvs, getComments, patchComment, saveComments, dmFromComment,
  getMentions, patchMention, chatFromMention, teamMentions, addConversation, statusOf, lastAt, lastVisible, previewOf,
  postBy, INTENTS, MENTION_KIND, samePhone, ago as inboxAgo,
} from '@/lib/inbox';
import { connectedInbox, CONNECTIONS_EVENT } from '@/lib/connections';
import { CHANNELS_EVENT } from '@/lib/channels';
import { autopilotOn } from '@/lib/gridai/inboxAi';
import { Face, ChLogo, XIcon, NoAccess, useNow } from './messages/msgParts';
import { access, mid, sys, ME_NAME, dialable } from './messages/msgData';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const SOURCE_TAGS = ['From a comment', 'From a mention'];
const tone = (t) => ({ success: 'ok', warning: 'warn', error: 'err', info: 'nav', primary: 'nav', slate: 'grey' })[t] || 'grey';
const ago = (t, now) => { const a = inboxAgo(t, now); return a.replace(/^(\d+)m$/, '$1 min').replace(/^(\d+)h$/, '$1 h'); };
const lastOrder = (c) => { const m = [...(c.messages || [])].reverse().find((x) => x.type === 'order' && x.order); return m ? m.order : ''; };

export default function MInboxScreen() {
  const router = useRouter();
  const { ready, tick, ctx } = useAppData([CONNECTIONS_EVENT, CHANNELS_EVENT], { every: 30000 });
  const query = useQuery();
  const now = useNow(30000);
  const [view, setView] = useState('chats');
  const [find, setFind] = useState(false);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [ch, setCh] = useState('all');
  const [cFilter, setCFilter] = useState('open');
  const [mFilter, setMFilter] = useState('new');
  const [comment, setComment] = useState(null);
  const [mention, setMention] = useState(null);
  const [compose, setCompose] = useState(null);
  useEffect(() => { if (query && ['comments', 'mentions'].includes(query.get('view'))) setView(query.get('view')); }, [query]);
  const switchView = (v) => {
    setView(v);
    try { const u = new URL(window.location.href); if (v === 'chats') u.searchParams.delete('view'); else u.searchParams.set('view', v); window.history.replaceState(window.history.state, '', u.pathname + u.search); } catch { /* ignore */ }
  };

  const data = useMemo(() => {
    if (!ready) return null;
    const live = safe(() => connectedInbox('Messages'), CHANNEL_IDS);
    const liveC = safe(() => connectedInbox('Comments'), []);
    const convs = safe(() => getConvs(), []);
    const comments = safe(() => getComments(), []).filter((c) => { const p = postBy(c.post); return p && liveC.includes(p.ch); });
    const mentions = [...safe(() => getMentions(), []), ...safe(() => teamMentions(ME, convs), [])].sort((a, b) => b.at - a.at);
    return { live, liveC, convs, comments, mentions };
  }, [ready, tick]);

  if (ctx && !access('/m-inbox', ctx)) {
    return (
      <AppScreen name="MInbox" title="Inbox">
        <Content top={47}><LargeHeader title="Inbox" /><NoAccess title="The Inbox isn’t part of your access in this edition." /></Content>
      </AppScreen>
    );
  }

  const t = now || Date.now();
  const needle = q.trim().toLowerCase();
  // ---- chats
  const convs = data ? data.convs : [];
  const notDone = convs.filter((c) => statusOf(c, t) !== 'closed');
  const byFilter = (c, f) => (f === 'done' ? statusOf(c, t) === 'closed' : statusOf(c, t) !== 'closed') && (f !== 'unread' || c.unread) && (f !== 'mine' || c.assignee === ME);
  const bySearch = (c) => !needle || [c.name, c.phone, c.handle, ...(c.tags || []), ...(c.messages || []).map((m) => m.text || '')].join(' ').toLowerCase().includes(needle);
  const inFilter = convs.filter((c) => byFilter(c, filter) && bySearch(c));
  const list = inFilter.filter((c) => ch === 'all' || c.ch === ch).sort((a, b) => lastAt(b) - lastAt(a));
  const people = notDone.slice().sort((a, b) => ((b.unread ? 1 : 0) - (a.unread ? 1 : 0)) || lastAt(b) - lastAt(a)).slice(0, 5);
  const chanList = data ? CHANNEL_IDS.filter((x) => data.live.includes(x)) : [];
  // ---- comments
  const comments = data ? data.comments : [];
  const cMatch = (c) => (cFilter === 'open' ? c.status === 'open' : cFilter === 'hidden' ? c.status === 'hidden' : c.status !== 'hidden') && (ch === 'all' || (postBy(c.post) || {}).ch === ch) && (!needle || (c.author + ' ' + c.text).toLowerCase().includes(needle));
  const cList = comments.filter(cMatch).sort((a, b) => b.at - a.at);
  // ---- mentions
  const mentions = data ? data.mentions : [];
  const mList = mentions.filter((x) => (mFilter === 'all' || x.kind === 'team' || x.status !== 'done') && (!needle || (x.who || x.name || '') .toLowerCase().includes(needle) || (x.text || '').toLowerCase().includes(needle)));
  const counts = {
    chats: notDone.filter((c) => c.unread).length,
    comments: comments.filter((c) => c.status === 'open').length,
    mentions: mentions.filter((x) => x.kind === 'team' || x.status === 'new').length,
  };

  // ---- actions
  const openChat = (id) => router.push('/m-chat?id=' + encodeURIComponent(id));
  const replyPublic = (c, text) => {
    const body = text.trim();
    if (!body) return;
    patchComment(c.id, (x) => ({ status: 'answered', replies: [...(x.replies || []), { at: Date.now(), by: ME, text: body }] }));
    toast('Reply posted on ' + channelName((postBy(c.post) || {}).ch));
    setComment(null);
  };
  const hide = (c) => { saveComments(getComments().map((x) => (x.id === c.id ? { ...x, status: 'hidden', was: x.status === 'hidden' ? x.was : x.status } : x))); toast('Comment hidden · only the author and their friends still see it'); setComment(null); };
  const unhide = (c) => { patchComment(c.id, { status: c.was || ((c.replies || []).length ? 'answered' : 'open'), hiddenBy: '' }); toast('Comment is visible again'); setComment(null); };
  const toDm = (c) => { const id = dmFromComment(c); toast('Private chat opened with ' + c.author); openChat(id); };
  const replyMention = (x) => { const id = chatFromMention(x); toast('Chat opened with ' + x.who); openChat(id); };
  const mentionDone = (x, on) => { patchMention(x.id, { status: on ? 'done' : 'new' }); toast(on ? 'Marked as done' : 'Moved back to new'); setMention(null); };
  const startConv = () => {
    const f = compose;
    if (!f.name.trim()) { toast('Add the customer’s name', { tone: 'error' }); return; }
    if (f.ch === 'whatsapp' && !dialable(f.phone)) { toast('Enter an 11-digit mobile number for WhatsApp', { tone: 'error' }); return; }
    if (!f.text.trim()) { toast('Write the first message', { tone: 'error' }); return; }
    const known = f.phone && convs.find((c) => c.ch === f.ch && samePhone(c.phone, f.phone));
    setCompose(null);
    if (known) { toast(`You already have a ${channelName(f.ch)} chat with ${known.name}`, { tone: 'info' }); openChat(known.id); return; }
    const row = addConversation({ ch: f.ch, name: f.name.trim(), phone: f.phone.trim(), messages: [sys('square-pen', `Started by ${ME_NAME}`), { id: mid(), at: Date.now(), from: 'agent', by: ME, type: 'text', text: f.text.trim(), status: 'delivered' }] });
    toast(`Conversation with ${row.name} started on ${channelName(f.ch)}`);
    openChat(row.id);
  };

  const chip = (key, label, n, on, onClick, logo) => (
    <button key={key} type="button" className={'pchip' + (on ? ' on' : '')} aria-pressed={on} onClick={onClick} style={{ cursor: 'pointer', paddingLeft: logo && !on ? '8px' : '14px' }}>
      {logo && !on ? <ChLogo ch={logo} size={22} /> : null}{label}{n != null ? <> <b className="num" style={{ opacity: on ? '.7' : '.6', fontSize: 'var(--text-xs)' }}>{n}</b></> : null}
    </button>
  );
  const chanChips = (chs, countOf) => chs.map((x) => chip('ch-' + x, channelName(x), countOf(x) || null, ch === x, () => setCh(ch === x ? 'all' : x), x));

  return (
    <AppScreen name="MInbox" title="Inbox">
      <Content top={47} bottom={0}>
        <LargeHeader title="Inbox" actions={<>
          <IconButton icon="search" label="Search" soft onClick={() => { setFind(!find); if (find) setQ(''); }} />
          <IconButton icon="edit" label="New message" soft onClick={() => setCompose({ ch: (chanList[0] || 'whatsapp'), name: '', phone: '', text: '' })} />
        </>} />
        {find ? <SearchField value={q} onChange={setQ} placeholder={view === 'chats' ? 'Search chats, numbers, tags' : view === 'comments' ? 'Search comments' : 'Search mentions'} autoFocus style={{ marginTop: '12px' }} /> : null}
        <Segmented style={{ marginTop: '14px' }} value={view} onChange={(v) => { switchView(v); setCh('all'); }}
          items={[{ key: 'chats', label: 'Chats' + (counts.chats ? ' ' + counts.chats : '') }, { key: 'comments', label: 'Comments' + (counts.comments ? ' ' + counts.comments : '') }, { key: 'mentions', label: 'Mentions' + (counts.mentions ? ' ' + counts.mentions : '') }]} />

        {view === 'chats' ? (
          <>
            {!needle && filter === 'all' && people.length ? (
              <div style={{ display: 'flex', gap: '10px', padding: '16px 20px 0', overflow: 'hidden' }}>
                {people.map((c) => (
                  <Link key={c.id} href={'/m-chat?id=' + encodeURIComponent(c.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '62px', flex: 'none', fontSize: 'var(--text-xs)', color: 'var(--ink)' }}>
                    <span style={{ padding: '3px', borderRadius: 'var(--radius-full)', background: c.unread ? 'conic-gradient(#009cde,#003087,#009cde)' : '#e2e8f0' }}>
                      <span style={{ display: 'block', padding: '2px', borderRadius: 'var(--radius-full)', background: 'var(--bg)' }}>
                        <Face name={c.name} avatar={c.avatar} pos={c.pos} ch={c.ch} size={50} badge={21} />
                      </span>
                    </span>
                    <span className="ell" style={{ maxWidth: '62px' }}>{firstName(c.name)}</span>
                  </Link>
                ))}
              </div>
            ) : null}
            <div className="chips" style={{ marginTop: '16px' }}>
              {chip('all', 'All', data ? notDone.length : null, filter === 'all', () => setFilter('all'))}
              {chip('unread', 'Unread', data ? counts.chats : null, filter === 'unread', () => setFilter(filter === 'unread' ? 'all' : 'unread'))}
              {chip('mine', 'Mine', data ? notDone.filter((c) => c.assignee === ME).length : null, filter === 'mine', () => setFilter(filter === 'mine' ? 'all' : 'mine'))}
              {chanChips(chanList, (x) => inFilter.filter((c) => c.ch === x).length)}
              {chip('done', 'Done', null, filter === 'done', () => setFilter(filter === 'done' ? 'all' : 'done'))}
            </div>
            <div style={{ height: '16px' }} />
            {!data ? <Skeleton rows={5} /> : list.length ? (
              <div className="card" style={{ margin: '0 20px' }}>
                {list.map((c) => <ChatRow key={c.id} c={c} now={t} />)}
              </div>
            ) : (
              <Card><EmptyState icon="chat" title={needle ? `No chats match “${q}”` : filter === 'done' ? 'No chats marked done' : filter === 'unread' ? 'You are all caught up' : 'No chats here'} action={needle || filter !== 'all' || ch !== 'all' ? { label: 'Show all chats', onClick: () => { setQ(''); setFilter('all'); setCh('all'); } } : null} /></Card>
            )}
          </>
        ) : null}

        {view === 'comments' ? (
          <>
            <div className="chips" style={{ marginTop: '16px' }}>
              {chip('open', 'To answer', data ? counts.comments : null, cFilter === 'open', () => setCFilter('open'))}
              {chip('all', 'All', null, cFilter === 'all', () => setCFilter('all'))}
              {chanChips(data ? CHANNEL_IDS.concat(['youtube', 'pinterest', 'threads']).filter((x) => data.liveC.includes(x)) : [], (x) => comments.filter((c) => c.status === 'open' && (postBy(c.post) || {}).ch === x).length)}
              {chip('hidden', 'Hidden', null, cFilter === 'hidden', () => setCFilter(cFilter === 'hidden' ? 'open' : 'hidden'))}
            </div>
            <div style={{ height: '16px' }} />
            {!data ? <Skeleton rows={5} /> : !data.liveC.length ? (
              <Card><EmptyState icon="chat" title="No channel brings comments yet" action={{ label: 'Connect on the web', href: '/connections' }} /></Card>
            ) : cList.length ? (
              <div className="card" style={{ margin: '0 20px' }}>
                {cList.map((c) => {
                  const p = postBy(c.post) || {};
                  const it = INTENTS[c.intent];
                  return (
                    <button key={c.id} type="button" className="lrow" onClick={() => setComment(c)} style={{ width: '100%', border: 0, background: 'none', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', alignItems: 'flex-start', opacity: c.status === 'hidden' ? 0.6 : 1 }}>
                      <Face name={c.author} ch={p.ch} size={44} />
                      <span style={{ flex: '1', minWidth: '0' }}>
                        <span style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span className="ell" style={{ fontSize: 'var(--text-sm-plus)', fontWeight: c.status === 'open' ? 'var(--weight-semibold)' : 'var(--weight-medium)' }}>{c.author}</span>
                          <span style={{ marginLeft: 'auto', flex: 'none', fontSize: 'var(--text-xs)', color: c.status === 'open' ? 'var(--brand)' : 'var(--muted)' }}>{ago(c.at, t)}</span>
                        </span>
                        <span style={{ fontSize: 'var(--text-sm)', color: c.status === 'open' ? 'var(--ink)' : 'var(--muted)', marginTop: '2px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{c.text}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', minWidth: 0 }}>
                          {it ? <Pill tone={tone(it.tone)}>{it.label}</Pill> : null}
                          {c.status === 'answered' ? <Pill tone="ok">Answered</Pill> : c.status === 'hidden' ? <Pill tone="grey">Hidden</Pill> : null}
                          <span className="ell" style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', minWidth: 0 }}>on “{p.title}”</span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : <Card><EmptyState icon="check" title={cFilter === 'open' ? 'Every comment is answered' : 'No comments here'} /></Card>}
          </>
        ) : null}

        {view === 'mentions' ? (
          <>
            <div className="chips" style={{ marginTop: '16px' }}>
              {chip('new', 'New', data ? counts.mentions : null, mFilter === 'new', () => setMFilter('new'))}
              {chip('all', 'All', null, mFilter === 'all', () => setMFilter('all'))}
            </div>
            <div style={{ height: '16px' }} />
            {!data ? <Skeleton rows={4} /> : mList.length ? (
              <div className="card" style={{ margin: '0 20px' }}>
                {mList.map((x) => {
                  const team = x.kind === 'team';
                  const who = team ? staffName(x.by) : x.who;
                  return (
                    <button key={x.id} type="button" className="lrow" onClick={() => (team ? openChat(x.convId) : setMention(x))} style={{ width: '100%', border: 0, background: 'none', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', alignItems: 'flex-start', opacity: !team && x.status === 'done' ? 0.65 : 1 }}>
                      <Face name={who} avatar={team ? '' : x.avatar} ch={team ? '' : x.ch} size={44} />
                      <span style={{ flex: '1', minWidth: '0' }}>
                        <span style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span className="ell" style={{ fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-semibold)' }}>{who}</span>
                          <span style={{ marginLeft: 'auto', flex: 'none', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{ago(x.at, t)}</span>
                        </span>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink)', marginTop: '2px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{x.text}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', minWidth: 0 }}>
                          <Pill tone={team ? 'nav' : x.sentiment === 'negative' ? 'err' : 'grey'}>{team ? 'Note about ' + x.name : MENTION_KIND[x.kind] + (x.ch ? ' · ' + channelName(x.ch) : '')}</Pill>
                          {!team && x.status === 'done' ? <Pill tone="ok">Done</Pill> : null}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : <Card><EmptyState icon="check" title="No new mentions" /></Card>}
          </>
        ) : null}
      </Content>

      {/* a comment */}
      <CommentSheet c={comment} onClose={() => setComment(null)} onReply={replyPublic} onDm={toDm} onHide={hide} onUnhide={unhide}
        onLike={(c) => { patchComment(c.id, { liked: !c.liked }); setComment({ ...c, liked: !c.liked }); toast(c.liked ? 'Like removed' : 'Liked as the shop'); }}
        canOrder={ctx ? access('/m-new-order', ctx) : false} />

      {/* a mention */}
      <Sheet open={!!mention} onClose={() => setMention(null)} title={mention ? mention.who : ''}
        footer={mention ? <>
          <Button kind="line" onClick={() => mentionDone(mention, mention.status !== 'done')}>{mention.status === 'done' ? 'Move to new' : 'Mark done'}</Button>
          <Button kind="primary" style={{ flex: 2 }} onClick={() => replyMention(mention)} icon="chat">Reply in a chat</Button>
        </> : null}>
        {mention ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>
              <ChLogo ch={mention.ch} size={18} />{MENTION_KIND[mention.kind]} on {channelName(mention.ch)}{mention.where ? ' · ' + mention.where : ''} · {ago(mention.at, t)}
            </div>
            {mention.img ? <img src={mention.img} alt="" style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', borderRadius: 'var(--radius-xl)', display: 'block', marginBottom: '12px' }} /> : null}
            <p style={{ margin: 0, fontSize: 'var(--text-sm-plus)', lineHeight: '21px' }}>{mention.text}</p>
            {mention.reach ? <div className="num" style={{ marginTop: '8px', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>Seen by about {Number(mention.reach).toLocaleString('en-IN')} people</div> : null}
            {mention.sentiment === 'negative' ? <Note tone="warn" icon="alert" style={{ marginTop: '12px' }}>An unhappy post: reply in a chat before others join in.</Note> : null}
          </>
        ) : null}
      </Sheet>

      {/* new message */}
      <Sheet open={!!compose} onClose={() => setCompose(null)} title="New message"
        footer={<Button kind="primary" onClick={startConv} icon="chat">Start chat</Button>}>
        {compose ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div className="lab" style={{ marginBottom: '8px' }}>Channel</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(chanList.length ? chanList : CHANNEL_IDS).filter((x) => CHANNELS[x]).map((x) => (
                  <button key={x} type="button" className={'pchip' + (compose.ch === x ? ' on' : '')} aria-pressed={compose.ch === x} onClick={() => setCompose({ ...compose, ch: x })} style={{ cursor: 'pointer', paddingLeft: compose.ch === x ? '14px' : '8px' }}>
                    {compose.ch === x ? null : <ChLogo ch={x} size={22} />}{channelName(x)}
                  </button>
                ))}
              </div>
            </div>
            <Field label="Name"><TextInput value={compose.name} onChange={(v) => setCompose({ ...compose, name: v })} placeholder="Customer’s name" /></Field>
            <Field label="Mobile number" help={compose.ch === 'whatsapp' ? 'WhatsApp needs the number' : 'Optional'}><TextInput value={compose.phone} onChange={(v) => setCompose({ ...compose, phone: v })} placeholder="01XXXXXXXXX" type="tel" inputMode="tel" /></Field>
            <Field label="Message"><TextInput multiline value={compose.text} onChange={(v) => setCompose({ ...compose, text: v })} placeholder="Assalamu alaikum! …" /></Field>
          </div>
        ) : null}
      </Sheet>
    </AppScreen>
  );
}

/** One chat in the list (the board's .lrow). */
function ChatRow({ c, now }) {
  const m = lastVisible(c);
  const unread = c.unread || 0;
  const mine = m && m.from === 'agent';
  const st = statusOf(c, now);
  const order = lastOrder(c);
  const tag = (c.tags || []).filter((g) => !SOURCE_TAGS.includes(g))[0];
  const online = m && m.from === 'customer' && now - m.at < 15 * 60000;
  const ai = autopilotOn(c);
  const pills = [
    order ? <Pill key="o" tone="nav">Order {order}</Pill> : null,
    !order && tag ? <Pill key="t" tone="grey">{tag}</Pill> : null,
    st === 'pending' ? <Pill key="p" tone="nav">Pending</Pill> : st === 'snoozed' ? <Pill key="s" tone="warn">Snoozed</Pill> : null,
    ai && st !== 'closed' ? <Pill key="a" tone="nav">GridAI</Pill> : null,
  ].filter(Boolean);
  return (
    <Link href={'/m-chat?id=' + encodeURIComponent(c.id)} className="lrow">
      <Face name={c.name} avatar={c.avatar} pos={c.pos} ch={c.ch} size={52} online={online} />
      <span style={{ flex: '1', minWidth: '0' }}>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span className="ell" style={{ fontSize: 'var(--text-base)', fontWeight: unread ? 'var(--weight-semibold)' : 'var(--weight-medium)' }}>{c.name}</span>
          <span style={{ marginLeft: 'auto', flex: 'none', fontSize: 'var(--text-xs)', color: unread ? 'var(--brand)' : 'var(--muted)', fontWeight: unread ? 'var(--weight-medium)' : 'var(--weight-regular)' }}>{m ? ago(m.at, now) : ''}</span>
        </span>
        {' '}
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
          <span className="ell" style={{ flex: '1', fontSize: 'var(--text-sm)', color: unread ? 'var(--ink)' : 'var(--muted)', fontWeight: unread ? 'var(--weight-medium)' : 'var(--weight-regular)' }}>{m ? (mine ? (m.ai ? 'GridAI: ' : 'You: ') : '') + previewOf(m) : 'No messages yet'}</span>
          {unread ? <span className="cnt nav" style={{ flex: 'none' }}>{unread}</span> : null}
        </span>
        {pills.length ? <>{' '}<span style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>{pills}</span></> : null}
      </span>
    </Link>
  );
}

/** A public comment: reply in public or in private, like, hide. */
function CommentSheet({ c, onClose, onReply, onDm, onHide, onUnhide, onLike, canOrder }) {
  const [text, setText] = useState('');
  useEffect(() => { setText(''); }, [c && c.id]);
  if (!c) return null;
  const p = postBy(c.post) || {};
  const hidden = c.status === 'hidden';
  return (
    <Sheet open onClose={onClose} title={c.author}
      footer={hidden ? <Button kind="primary" onClick={() => onUnhide(c)}>Show again</Button> : <>
        <Button kind="line" onClick={() => onDm(c)} icon="chat">Reply privately</Button>
        <Button kind="primary" style={{ flex: 1.4 }} onClick={() => onReply(c, text)} disabled={!text.trim()}><XIcon name="send" size={18} />Reply</Button>
      </>}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)', minWidth: 0 }}>
        <ChLogo ch={p.ch} size={18} /><span className="ell">{p.kind || 'Post'} · “{p.title}”</span>
      </div>
      <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-md)', background: 'var(--soft)', fontSize: 'var(--text-sm-plus)', lineHeight: '21px' }}>{c.text}</div>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', margin: '6px 4px 0', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>
        <span>{inboxAgo(c.at)}</span>
        {!hidden ? <button type="button" onClick={() => onLike(c)} aria-pressed={!!c.liked} style={{ border: 0, background: 'none', padding: 0, font: 'inherit', color: c.liked ? 'var(--brand)' : 'var(--muted)', fontWeight: 'var(--weight-medium)', cursor: 'pointer' }}>{c.liked ? 'Liked' : 'Like'}</button> : null}
        {!hidden ? <button type="button" onClick={() => onHide(c)} style={{ border: 0, background: 'none', padding: 0, font: 'inherit', color: 'var(--muted)', fontWeight: 'var(--weight-medium)', cursor: 'pointer' }}>Hide</button> : <span>Hidden{c.hiddenBy ? ' · ' + c.hiddenBy : ''}</span>}
        {canOrder && (c.intent === 'order' || c.intent === 'price') ? <Link href={'/m-new-order?name=' + encodeURIComponent(c.author)} style={{ color: 'var(--brand)', fontWeight: 'var(--weight-medium)' }}>Create order</Link> : null}
      </div>
      {(c.replies || []).map((r, i) => (
        <div key={i} style={{ margin: '10px 0 0 28px' }}>
          <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-xl)', background: '#e9eef5', fontSize: 'var(--text-sm)', lineHeight: '20px' }}><b style={{ fontWeight: 'var(--weight-semibold)' }}>{r.by === ME ? 'You' : staffName(r.by)}</b> {r.text}</div>
        </div>
      ))}
      {!hidden ? <div style={{ marginTop: '14px' }}><TextInput multiline value={text} onChange={setText} placeholder={`Reply in public on ${channelName(p.ch)}…`} /></div> : null}
    </Sheet>
  );
}
