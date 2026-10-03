'use client';
// Public comments on posts and reels: a posts list with unanswered counts, the moderation queue for
// one post (filters, reply publicly, reply privately in a DM, like, hide, delete, assign, bulk hide
// spam) and insights (sentiment, what people ask, auto-moderation rules, saved replies).
// Three panes on desktop, two on tablets (insights slide over), one on phones.

import { useLiveChannels } from './useLiveChannels';
import React, { useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { ChannelIcon, EmptyState } from '@/components/ui';
import { formatBDT } from '@/lib/format';
import {
  POSTS, INTENTS, SENTIMENTS, RULES, STAFF, ME, CHANNEL_IDS, channelName, staffName, ago, fillReply,
  getComments, saveComments, patchComment, deleteComment, getRules, saveRules, getReplies, countReplyUse, dmFromComment,
} from '@/lib/inbox';
import { useInbox, Avatar, StaffAvatar, Menu, MenuItem, Sheet, SearchBox } from './parts';
import { SavedRepliesDialog } from './Dialogs';

const FILTERS = [['all', 'All'], ['open', 'Unanswered'], ['ask', 'Questions and prices'], ['order', 'Order intent'], ['negative', 'Negative'], ['spam', 'Spam'], ['hidden', 'Hidden']];
const matchFilter = (c, f) => ({
  all: c.status !== 'hidden',
  open: c.status === 'open',
  ask: c.status !== 'hidden' && (c.intent === 'question' || c.intent === 'price'),
  order: c.status !== 'hidden' && c.intent === 'order',
  negative: c.status !== 'hidden' && c.sentiment === 'negative',
  spam: c.intent === 'spam' && c.status !== 'hidden',
  hidden: c.status === 'hidden',
}[f]);
const SORTS = [['open', 'Most unanswered'], ['new', 'Newest post'], ['count', 'Most comments'], ['sales', 'Attributed sales']];
const QUICK = [
  ['Price + COD', 'Hi {name}! Price and details are in your inbox 💌 Cash on delivery all over Bangladesh.'],
  ['Check inbox', 'Thanks {name}! We have sent you a message — please check your inbox.'],
  ['বাংলা', 'ধন্যবাদ {name}! বিস্তারিত ইনবক্সে পাঠানো হয়েছে 💌'],
  ['Sorry + DM', 'Sorry to hear this, {name}. We have messaged you to sort it out right away.'],
];
const PHONE_RE = /01[0-9x]{9}/i;

export function CommentsView({ now, onOpenConv, wide }) {
  // only channels connected in Connections bring comments in
  const live = useLiveChannels('Comments');
  const seen = (ch) => !live || live.includes(ch);
  const SHOWN = POSTS.filter((p) => seen(p.ch));
  const comments = (useInbox(getComments) || []).filter((c) => SHOWN.some((p) => p.id === c.post));
  const rules = useInbox(getRules) || [true, true, true, false];
  const replies = useInbox(getReplies) || [];
  const [post, setPost] = useState('p-eid');
  const [pane, setPane] = useState('list');
  const [chan, setChan] = useState('all');
  const [sort, setSort] = useState('open');
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState([]);
  const [reply, setReply] = useState(null);     // { id, text }
  const [panel, setPanel] = useState(false);
  const [manage, setManage] = useState(false);

  const openOf = (pid) => comments.filter((c) => c.post === pid && c.status === 'open').length;
  const posts = useMemo(() => SHOWN.filter((p) => chan === 'all' || p.ch === chan).map((p) => ({ ...p, open: openOf(p.id), count: comments.filter((c) => c.post === p.id).length }))
    .sort((a, b) => (sort === 'open' ? b.open - a.open : sort === 'count' ? b.count - a.count : sort === 'sales' ? b.sales - a.sales : 0)), [comments, chan, sort, live]); // eslint-disable-line react-hooks/exhaustive-deps
  const cur = SHOWN.find((p) => p.id === post) || SHOWN[0] || POSTS[0];
  const here = comments.filter((c) => c.post === cur.id);
  const shown = here.filter((c) => matchFilter(c, filter) && (!q || (c.author + ' ' + c.text).toLowerCase().includes(q.toLowerCase()))).sort((a, b) => (a.status === 'open') === (b.status === 'open') ? b.at - a.at : a.status === 'open' ? -1 : 1);
  const spam = here.filter((c) => c.intent === 'spam' && c.status !== 'hidden');
  const totalOpen = comments.filter((c) => c.status === 'open').length;

  const pick = (id) => { setPost(id); setPane('queue'); setSel([]); setReply(null); setFilter('all'); setQ(''); };
  const toggleSel = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const hide = (ids, why = '') => { saveComments(getComments().map((c) => (ids.includes(c.id) ? { ...c, status: 'hidden', was: c.status === 'hidden' ? c.was : c.status, hiddenBy: why } : c))); };
  const unhide = (c) => { patchComment(c.id, { status: c.was || (c.replies.length ? 'answered' : 'open'), hiddenBy: '' }); toast('Comment is visible again'); };
  const post1 = (c, text) => {
    patchComment(c.id, (x) => ({ status: 'answered', replies: [...x.replies, { at: Date.now(), by: ME, text }] }));
    setReply(null);
    toast(`Reply posted on ${channelName(cur.ch)}`);
  };
  const toDm = (c) => {
    const id = dmFromComment(c);
    toast(`Moved to DM · ${c.author}`);
    onOpenConv(id);
  };
  const remove = async (ids) => {
    const one = ids.length === 1 ? comments.find((c) => c.id === ids[0]) : null;
    if (!(await confirmDialog({ title: one ? `Delete ${one.author}’s comment?` : `Delete ${ids.length} comments?`, body: `They are removed from ${channelName(cur.ch)} for everyone. This cannot be undone.`, confirmLabel: 'Delete', tone: 'danger' }))) return;
    saveComments(getComments().filter((c) => !ids.includes(c.id)));
    setSel([]);
    toast(one ? 'Comment deleted' : `${ids.length} comments deleted`);
  };
  const assign = (ids, who) => { saveComments(getComments().map((c) => (ids.includes(c.id) ? { ...c, assignee: who } : c))); toast(who ? `Assigned to ${staffName(who)}` : 'Unassigned'); };
  const hideSpam = () => { hide(spam.map((c) => c.id), 'Marked as spam'); toast(`${spam.length} spam comment${spam.length === 1 ? '' : 's'} hidden`); };
  const toggleRule = (i) => {
    const on = !rules[i];
    saveRules(rules.map((r, k) => (k === i ? on : r)));
    if (!on) { toast(`${RULES[i]} is off`); return; }
    const all = getComments();
    let n = 0;
    if (i === 0 || i === 1) {
      const hit = all.filter((c) => c.status !== 'hidden' && c.intent === 'spam' && (i === 0 ? PHONE_RE.test(c.text) : !PHONE_RE.test(c.text)));
      n = hit.length;
      hide(hit.map((c) => c.id), RULES[i]);
    } else if (i === 3) {
      const hit = all.filter((c) => c.status === 'open' && c.intent === 'price');
      n = hit.length;
      saveComments(all.map((c) => (hit.includes(c) ? { ...c, status: 'answered', replies: [...c.replies, { at: Date.now(), by: 'auto', text: `Hi ${c.author.replace(/^@/, '')}! We have sent the price to your inbox 💌` }] } : c)));
    }
    toast(`${RULES[i]} is on${n ? ` · ${n} comment${n === 1 ? '' : 's'} ${i === 3 ? 'answered' : 'hidden'} now` : ''}`);
  };
  const applySaved = (r) => {
    if (!reply) { toast('Open Reply on a comment first, then pick the saved reply', { tone: 'info' }); return; }
    const c = comments.find((x) => x.id === reply.id);
    setReply({ ...reply, text: fillReply(r.body, { name: c ? c.author : '' }) });
    countReplyUse(r.id);
  };

  const insights = <Insights here={here} comments={comments} cur={cur} rules={rules} replies={replies} onToggleRule={toggleRule} onUse={applySaved} onManage={() => setManage(true)} />;

  return (
    <div className="ibx-app cm-app" data-pane={pane} data-panel={wide ? 'open' : 'closed'}>
      <section className="ibx-list" aria-label="Posts and reels">
        <div className="ibx-listhead">
          <div className="ibx-listhead__row">
            <h2 className="ib-h2">Posts and reels</h2>
            <span className="ib-sub">{totalOpen} unanswered</span>
            <button type="button" className="gc-btn gc-btn--xs gc-btn--flat cm-sync" onClick={() => toast(`Synced ${new Set(SHOWN.map((p) => p.ch)).size} channels · no new comments`)}><Icon name="refresh-cw" width="14" height="14" aria-hidden="true" />Sync</button>
          </div>
          <div className="ib-scroll-x" role="group" aria-label="Filter by channel">
            <button type="button" className="ib-chip" aria-pressed={chan === 'all'} onClick={() => setChan('all')}>All<b>{totalOpen}</b></button>
            {[...new Set(SHOWN.map((p) => p.ch))].map((ch) => (
              <button key={ch} type="button" className="ib-chip" aria-pressed={chan === ch} onClick={() => setChan(ch)} aria-label={channelName(ch)} title={channelName(ch)}>
                <ChannelIcon channel={ch} size={20} decorative /><b>{comments.filter((c) => c.status === 'open' && (POSTS.find((p) => p.id === c.post) || {}).ch === ch).length}</b>
              </button>
            ))}
          </div>
          <select className="gc-input gc-select" aria-label="Sort posts" value={sort} onChange={(e) => setSort(e.target.value)}>{SORTS.map(([v, l]) => <option key={v} value={v}>Sort: {l.toLowerCase()}</option>)}</select>
        </div>
        <div className="ibx-rows">
          {posts.length ? (
            <ul className="ibx-ul">
              {posts.map((p) => (
                <li key={p.id}>
                  <button type="button" className="cm-post" aria-current={p.id === cur.id ? 'true' : undefined} onClick={() => pick(p.id)}>
                    <span className="cm-post__tile" data-ch={p.ch}>{p.kind}<span className="ib-av__ch"><ChannelIcon channel={p.ch} size={18} decorative /></span></span>
                    <span className="cm-post__text">
                      <span className="cm-post__top"><span className="cm-post__title">{p.title}</span><span className="ib-sub">{p.date.replace(' 2026', '')}</span></span>
                      <span className="ib-sub">{p.count} comments{p.sales ? ' · ' + formatBDT(p.sales) + ' sales' : p.views ? ' · ' + p.views.toLocaleString('en-IN') + ' views' : ''}</span>
                      <span className={'gc-badge gc-badge--' + (p.open ? (p.open > 4 ? 'error' : 'warning') : 'success')}>{p.open ? `${p.open} unanswered` : 'All answered'}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : <EmptyState icon="image-off" title="No posts on this channel" body="Pick another channel to see its posts." actionLabel="Show all channels" onAction={() => setChan('all')} />}
        </div>
      </section>

      <section className="ibx-thread cm-queue" aria-label={`Comments on ${cur.title}`}>
        <header className="th-head">
          <button type="button" className="gc-iconbtn th-back" onClick={() => setPane('list')} aria-label="Back to posts"><Icon name="arrow-left" width="20" height="20" /></button>
          <div className="cm-qhead">
            <span className="th-name">{cur.title}</span>
            <span className="ib-sub th-who__sub">{channelName(cur.ch)} {cur.kind.toLowerCase()} · {cur.date} · {here.length} comments · {openOf(cur.id)} unanswered</span>
          </div>
          <button type="button" className="gc-iconbtn" aria-label={`Open the ${cur.kind.toLowerCase()} on ${channelName(cur.ch)}`} title="Open on the channel" onClick={() => toast(`Opens the ${cur.kind.toLowerCase()} on ${channelName(cur.ch)} in a new tab (not in the demo)`, { tone: 'info' })}><Icon name="external-link" width="18" height="18" /></button>
          {!wide ? <button type="button" className="gc-iconbtn" aria-label="Insights and rules" title="Insights and rules" onClick={() => setPanel(true)}><Icon name="chart-no-axes-column" width="18" height="18" /></button> : null}
        </header>
        <div className="cm-scroll">
          <div className="cm-post-card">
            <p className="cm-caption">{cur.caption}</p>
            <div className="cm-stats">
              <span><b>{cur.reactions.toLocaleString('en-IN')}</b>Reactions</span>
              <span><b>{here.length}</b>Comments</span>
              <span><b>{cur.views ? cur.views.toLocaleString('en-IN') : cur.shares}</b>{cur.views ? 'Views' : 'Shares'}</span>
              <span><b>{cur.sales ? formatBDT(cur.sales) : '—'}</b>Attributed sales</span>
            </div>
          </div>
          <div className="cm-filters ib-scroll-x" role="group" aria-label="Filter comments">
            {FILTERS.map(([v, l]) => <button key={v} type="button" className="ib-chip" aria-pressed={filter === v} onClick={() => { setFilter(v); setSel([]); }}>{l}<b>{here.filter((c) => matchFilter(c, v)).length}</b></button>)}
          </div>
          <div className="cm-bar">
            <label className="cm-selall">
              <input type="checkbox" className="gc-check" checked={!!shown.length && shown.every((c) => sel.includes(c.id))} onChange={(e) => setSel(e.target.checked ? shown.map((c) => c.id) : [])} aria-label="Select all comments shown" />
              {sel.length ? <b>{sel.length} selected</b> : null}
            </label>
            {sel.length ? (
              <>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => { hide(sel); toast(`${sel.length} hidden`); setSel([]); }}><Icon name="eye-off" width="16" height="16" aria-hidden="true" />Hide</button>
                <Menu label="Assign" button={({ toggle, open }) => <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" aria-expanded={open} onClick={toggle}><Icon name="user-round-plus" width="16" height="16" aria-hidden="true" />Assign</button>}>
                  {(close) => STAFF.map((p) => <MenuItem key={p.id} onClick={() => { assign(sel, p.id); setSel([]); close(); }} hint={p.role}>{p.name}</MenuItem>)}
                </Menu>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--error gc-btn--soft" onClick={() => remove(sel)}><Icon name="trash-2" width="16" height="16" aria-hidden="true" />Delete</button>
              </>
            ) : <SearchBox value={q} onChange={setQ} placeholder="Search comments" />}
            {spam.length && !sel.length ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral cm-spam" onClick={hideSpam}><Icon name="shield-ban" width="16" height="16" aria-hidden="true" />Hide spam ({spam.length})</button> : null}
          </div>
          {shown.length ? (
            <ul className="cm-list">
              {shown.map((c) => (
                <Comment key={c.id} c={c} ch={cur.ch} now={now} selected={sel.includes(c.id)} onSelect={() => toggleSel(c.id)}
                  reply={reply && reply.id === c.id ? reply : null} replies={replies}
                  onReply={() => setReply(reply && reply.id === c.id ? null : { id: c.id, text: '' })} onReplyText={(text) => setReply({ id: c.id, text })} onPost={(text) => post1(c, text)}
                  onDm={() => toDm(c)} onLike={() => { patchComment(c.id, { liked: !c.liked }); toast(c.liked ? 'Like removed' : 'Liked as the shop'); }}
                  onHide={() => { hide([c.id]); toast('Comment hidden · only the author and their friends still see it'); }} onUnhide={() => unhide(c)}
                  onDelete={() => remove([c.id])} onAssign={(who) => assign([c.id], who)} onSaved={(r) => { setReply({ id: c.id, text: fillReply(r.body, { name: c.author }) }); countReplyUse(r.id); }} />
              ))}
            </ul>
          ) : <EmptyState icon="message-square-dashed" title={filter === 'open' ? 'Every comment here is answered' : 'No comments match'} body={q ? 'Check the spelling or clear the search.' : 'Try another filter.'} actionLabel={filter !== 'all' || q ? 'Show all comments' : undefined} onAction={() => { setFilter('all'); setQ(''); }} />}
        </div>
      </section>

      {wide ? <aside className="ibx-panel cm-panel" aria-label="Insights and rules">{insights}</aside> : null}
      <Sheet open={!wide && panel} onClose={() => setPanel(false)} title="Insights and rules">{insights}</Sheet>
      <SavedRepliesDialog open={manage} onClose={() => setManage(false)} />
    </div>
  );
}

function Comment({ c, ch, now, selected, onSelect, reply, replies, onReply, onReplyText, onPost, onDm, onLike, onHide, onUnhide, onDelete, onAssign, onSaved }) {
  const intent = INTENTS[c.intent];
  const hidden = c.status === 'hidden';
  const t = now || Date.now();
  // Facebook-style: the comment in a grey bubble with the name inside, a "time · Like · Reply" line under it, and the
  // shop's replies nested below with a thread line
  return (
    <li className={'cm-item' + (hidden ? ' is-hidden' : '') + (selected ? ' is-sel' : '')}>
      <input type="checkbox" className="gc-check cm-check" checked={selected} onChange={onSelect} aria-label={`Select ${c.author}’s comment`} />
      <Avatar name={c.author} size={36} />
      <div className="cm-body">
        <div className="cm-bub">
          <b className="cm-author">{c.author}</b>
          <p className="cm-text">{c.text}</p>
          {c.liked ? <span className="cm-likes" aria-label="Liked by the shop"><Icon name="heart" width="12" height="12" aria-hidden="true" /></span> : null}
        </div>
        <div className="cm-line">
          <span className="cm-time">{ago(c.at, t)}</span>
          {hidden ? (
            <>
              <button type="button" className="cm-lbtn" onClick={onUnhide}>Unhide</button>
              <button type="button" className="cm-lbtn cm-lbtn--danger" onClick={onDelete}>Delete</button>
            </>
          ) : (
            <>
              <button type="button" className={'cm-lbtn' + (c.liked ? ' is-on' : '')} aria-pressed={c.liked} onClick={onLike}>{c.liked ? 'Liked' : 'Like'}</button>
              <button type="button" className="cm-lbtn" aria-expanded={!!reply} onClick={onReply}>Reply</button>
              <button type="button" className="cm-lbtn" onClick={onDm}>{c.dm ? 'Open chat' : 'Reply privately'}</button>
              <button type="button" className="cm-lbtn" onClick={onHide}>Hide</button>
              <Menu label="More" button={({ toggle, open }) => <button type="button" className="cm-lbtn cm-lbtn--icon" aria-expanded={open} onClick={toggle} aria-label={`More actions for ${c.author}’s comment`}><Icon name="ellipsis" width="16" height="16" aria-hidden="true" /></button>}>
                {(close) => (
                  <>
                    <p className="ib-menu__head">Assign to</p>
                    {STAFF.map((p) => <MenuItem key={p.id} checked={c.assignee === p.id} onClick={() => { onAssign(p.id); close(); }}>{p.name}</MenuItem>)}
                    <hr className="gc-dropdown__divider" />
                    {c.intent === 'order' || c.intent === 'price' ? <a className="gc-dropdown__item" role="menuitem" href={`/new-order?name=${encodeURIComponent(c.author)}`}><Icon name="shopping-bag" width="16" height="16" aria-hidden="true" />Create an order</a> : null}
                    <MenuItem icon="trash-2" danger onClick={() => { close(); onDelete(); }}>Delete comment</MenuItem>
                  </>
                )}
              </Menu>
            </>
          )}
          <span className="cm-tags">
            {intent ? <span className={'gc-badge gc-badge--' + intent.tone}><Icon name={intent.icon} width="12" height="12" aria-hidden="true" />{intent.label}</span> : null}
            {c.sentiment === 'negative' ? <span className="cm-senti" title="Negative sentiment"><span className="ib-dot" style={{ background: SENTIMENTS.negative[1] }} />Negative</span> : null}
            {c.status === 'answered' ? <span className="gc-badge gc-badge--success"><Icon name="check" width="12" height="12" aria-hidden="true" />Answered</span> : null}
            {hidden ? <span className="gc-badge gc-badge--slate"><Icon name="eye-off" width="12" height="12" aria-hidden="true" />{c.hiddenBy ? 'Hidden · ' + c.hiddenBy : 'Hidden'}</span> : null}
            {c.assignee ? <StaffAvatar id={c.assignee} size={22} /> : null}
          </span>
        </div>
        {c.replies.length ? (
          <ul className="cm-replies">
            {c.replies.map((r, i) => (
              <li key={i} className="cm-rep">
                <span className="cm-page"><Icon name={r.by === 'auto' ? 'bot' : 'store'} width="14" height="14" aria-hidden="true" /></span>
                <span className="cm-rep__col">
                  <span className="cm-bub cm-bub--shop"><b className="cm-author">{r.by === 'auto' ? 'Auto-reply' : 'Shop · ' + staffName(r.by).split(' ')[0]}</b><span className="cm-text">{r.text}</span></span>
                  <span className="cm-line"><span className="cm-time">{ago(r.at, t)}</span></span>
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        {reply ? (
          <form className="cm-reply" onSubmit={(e) => { e.preventDefault(); if (reply.text.trim()) onPost(reply.text.trim()); }}>
            <span className="cm-page cm-page--lg"><Icon name="store" width="16" height="16" aria-hidden="true" /></span>
            <div className="cm-reply__col">
              <div className="cm-reply__pill">
                <textarea className="cm-reply__input" rows="1" data-autofocus autoFocus value={reply.text} onChange={(e) => onReplyText(e.target.value)} aria-label={`Public reply to ${c.author}`} placeholder={`Reply to ${c.author} as the shop…`} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (reply.text.trim()) onPost(reply.text.trim()); } }} />
                <button type="submit" className="cm-reply__send" disabled={!reply.text.trim()} aria-label="Post reply"><Icon name="send" width="16" height="16" aria-hidden="true" /></button>
              </div>
              <p className="ib-sub cm-reply__note">Public on {channelName(ch)} · everyone can see this · <button type="button" className="cm-lbtn" onClick={onReply}>Cancel</button></p>
              <div className="ib-scroll-x cm-quick">
                {QUICK.map(([l, tx]) => <button key={l} type="button" className={'ib-chip th-chip' + (l === 'বাংলা' ? ' ib-bn' : '')} onClick={() => onReplyText(fillReply(tx, { name: c.author }))}>{l}</button>)}
                <Menu label="Saved replies" up align="left" wide button={({ toggle, open }) => <button type="button" className="ib-chip th-chip" aria-expanded={open} onClick={toggle}><Icon name="zap" width="14" height="14" aria-hidden="true" />Saved</button>}>
                  {(close) => replies.slice(0, 8).map((r) => <MenuItem key={r.id} onClick={() => { onSaved(r); close(); }} hint={'/' + r.short}><span className={r.lang === 'bn' ? 'ib-bn' : ''}>{r.title}</span></MenuItem>)}
                </Menu>
              </div>
            </div>
          </form>
        ) : null}
      </div>
    </li>
  );
}

function Insights({ here, comments, cur, rules, replies, onToggleRule, onUse, onManage }) {
  const visible = here.filter((c) => c.intent !== 'spam');
  const n = visible.length || 1;
  const senti = ['positive', 'neutral', 'negative'].map((s) => [s, Math.round((visible.filter((c) => c.sentiment === s).length / n) * 100)]);
  const asks = ['price', 'question', 'order', 'complaint', 'praise'].map((k) => [k, here.filter((c) => c.intent === k).length]).filter(([, v]) => v);
  const max = Math.max(1, ...asks.map(([, v]) => v));
  const byCh = [...new Set(POSTS.map((p) => p.ch))].map((ch) => [ch, comments.filter((c) => c.status === 'open' && (POSTS.find((p) => p.id === c.post) || {}).ch === ch).length]).filter(([, v]) => v);
  const stats = [
    ['Unanswered', comments.filter((c) => c.status === 'open').length, 'message-circle-question'],
    ['Negative, open', comments.filter((c) => c.status === 'open' && c.sentiment === 'negative').length, 'frown'],
    ['Moved to DM', comments.filter((c) => c.dm).length, 'send'],
    ['Hidden by rules', comments.filter((c) => c.status === 'hidden' && c.hiddenBy).length, 'eye-off'],
  ];
  return (
    <div className="cm-ins">
      <div className="cm-kpis">{stats.map(([l, v, icon]) => <div key={l}><Icon name={icon} width="16" height="16" aria-hidden="true" /><b>{v}</b><span className="ib-sub">{l}</span></div>)}</div>
      <section className="cp-sec">
        <h3 className="ib-h3">Sentiment on this {cur.kind.toLowerCase()}</h3>
        <div className="cm-senti-bar" role="img" aria-label={senti.map(([s, v]) => `${SENTIMENTS[s][0]} ${v}%`).join(', ')}>{senti.map(([s, v]) => (v ? <span key={s} style={{ width: v + '%', background: SENTIMENTS[s][1] }} /> : null))}</div>
        <div className="cm-legend">{senti.map(([s, v]) => <span key={s}><span className="ib-dot" style={{ background: SENTIMENTS[s][1] }} />{SENTIMENTS[s][0]} <b>{v}%</b></span>)}</div>
      </section>
      <section className="cp-sec">
        <h3 className="ib-h3">What people say</h3>
        {asks.length ? asks.map(([k, v]) => (
          <div key={k} className="cm-meter"><span className="cm-meter__top"><span>{INTENTS[k].label}</span><b>{v}</b></span><span className="gc-progress"><span className="gc-progress__fill" style={{ width: (v / max) * 100 + '%' }} /></span></div>
        )) : <p className="cp-empty">No comments yet.</p>}
      </section>
      <section className="cp-sec">
        <h3 className="ib-h3">Unanswered by channel</h3>
        {byCh.length ? <ul className="cp-list">{byCh.map(([ch, v]) => <li key={ch}><ChannelIcon channel={ch} size={18} decorative /><span>{channelName(ch)}</span><b className="cp-right ib-data">{v}</b></li>)}</ul> : <p className="cp-empty">Every comment is answered.</p>}
      </section>
      <section className="cp-sec">
        <h3 className="ib-h3">Auto-moderation</h3>
        {RULES.map((r, i) => (
          <label key={r} className="cm-rule">
            <span>{r}</span>
            <button type="button" role="switch" aria-checked={!!rules[i]} className="gc-switch" onClick={() => onToggleRule(i)} aria-label={r}><span className="gc-switch__knob" /></button>
          </label>
        ))}
      </section>
      <section className="cp-sec">
        <div className="cp-sec__head"><h3 className="ib-h3">Saved replies</h3><button type="button" className="gc-btn gc-btn--xs gc-btn--flat" onClick={onManage}>Manage</button></div>
        {replies.slice(0, 4).map((r) => (
          <div key={r.id} className="cm-saved"><span><b className={r.lang === 'bn' ? 'ib-bn' : ''}>{r.title}</b><span className="ib-sub">Used {r.uses || 0} times</span></span><button type="button" className="gc-btn gc-btn--xs gc-btn--soft" onClick={() => onUse(r)}>Use</button></div>
        ))}
      </section>
    </div>
  );
}

export const COMMENTS_CSS = `
.cm-sync{margin-left:auto}
.cm-post{display:flex;gap:var(--space-3);width:100%;padding:var(--space-3) var(--space-4);border:0;border-left:3px solid transparent;background:none;text-align:left;cursor:pointer}
.cm-post:hover{background:var(--surface-page)}
.cm-post[aria-current="true"]{border-left-color:var(--primary);background:var(--fill-primary-soft)}
.cm-post__tile{position:relative;display:grid;place-items:center;flex:none;width:44px;height:44px;border-radius:var(--radius-lg);background:var(--surface-quiet);color:var(--text-body);font-size:var(--text-2xs);font-weight:var(--weight-medium)}
.cm-post__tile[data-ch="instagram"]{background:var(--fill-secondary-soft);color:var(--secondary-focus)}
.cm-post__tile[data-ch="facebook"],.cm-post__tile[data-ch="linkedin"]{background:var(--fill-primary-soft);color:var(--primary)}
.cm-post__text{flex:1;min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:3px}
.cm-post__top{display:flex;align-items:baseline;gap:var(--space-2);width:100%}
.cm-post__title{flex:1;min-width:0;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cm-qhead{flex:1;min-width:0;display:flex;flex-direction:column}
.cm-scroll{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:var(--space-4) var(--space-5) var(--space-6);display:flex;flex-direction:column;gap:var(--space-3)}
.cm-post-card{padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.cm-caption{margin:0 0 var(--space-3);font-size:var(--text-sm);line-height:var(--text-sm-lh);color:var(--text-body)}
.cm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-3)}
.cm-stats span{display:flex;flex-direction:column;font-size:var(--text-xs);color:var(--text-muted)}
.cm-stats b{font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.cm-filters{padding:2px 0}
.cm-bar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.cm-bar .ib-search{flex:1 1 200px}
.cm-selall{display:inline-flex;align-items:center;gap:var(--space-2);height:44px;padding:0 var(--space-2);font-size:var(--text-sm);color:var(--text-heading)}
.cm-selall b{font-weight:var(--weight-medium)}
.cm-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:var(--space-1)}
.cm-item{display:flex;gap:var(--space-2);padding:var(--space-2) var(--space-2);border-radius:var(--radius-xl);transition:background-color var(--duration-fast) ease;animation:cm-in 220ms cubic-bezier(.23,1,.32,1) both}
.cm-item:hover{background:var(--surface-page)}
.cm-item.is-sel{background:var(--fill-primary-soft)}
.cm-item.is-hidden .cm-bub{opacity:.6}
.cm-check{flex:none;margin-top:10px}
.cm-body{flex:1;min-width:0;display:flex;flex-direction:column;align-items:flex-start}
.cm-bub{position:relative;display:inline-flex;flex-direction:column;max-width:100%;padding:var(--space-2) var(--space-3);border-radius:var(--radius-2xl);background:var(--surface-quiet)}
.cm-bub--shop{background:var(--fill-primary-soft)}
.cm-author{font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cm-text{margin:0;font-size:var(--text-sm);line-height:var(--text-sm-lh);color:var(--text-heading);overflow-wrap:anywhere}
.cm-likes{position:absolute;right:-8px;bottom:-8px;display:grid;place-items:center;width:20px;height:20px;border-radius:var(--radius-full);background:var(--error);color:var(--text-inverse);box-shadow:0 0 0 2px var(--surface-card);animation:cm-pop 260ms cubic-bezier(.34,1.56,.64,1)}
.cm-line{display:flex;flex-wrap:wrap;align-items:center;gap:2px var(--space-3);margin:4px 0 0 var(--space-3);font-size:var(--text-xs)}
.cm-time{color:var(--text-muted)}
.cm-lbtn{padding:0;border:0;background:none;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-body);cursor:pointer}
.cm-lbtn:hover{text-decoration:underline}
.cm-lbtn.is-on{color:var(--text-danger)}
.cm-lbtn--danger{color:var(--text-danger)}
.cm-lbtn--icon{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:var(--radius-full)}
.cm-lbtn--icon:hover{background:var(--surface-subtle);text-decoration:none}
.cm-tags{display:inline-flex;flex-wrap:wrap;align-items:center;gap:var(--space-1-5)}
.cm-senti{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);color:var(--text-muted)}
.cm-replies{list-style:none;margin:var(--space-2) 0 0;padding:0 0 0 var(--space-3);border-left:2px solid var(--border-subtle);display:flex;flex-direction:column;gap:var(--space-2)}
.cm-rep{display:flex;gap:var(--space-2);animation:cm-in 220ms cubic-bezier(.23,1,.32,1) both}
.cm-rep__col{min-width:0;display:flex;flex-direction:column;align-items:flex-start}
.cm-page{display:grid;place-items:center;flex:none;width:28px;height:28px;border-radius:var(--radius-full);background:var(--primary);color:var(--text-inverse)}
.cm-page--lg{width:32px;height:32px}
.cm-reply{display:flex;gap:var(--space-2);width:100%;margin-top:var(--space-2);animation:cm-in 180ms cubic-bezier(.23,1,.32,1)}
.cm-reply__col{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--space-1-5)}
.cm-reply__pill{display:flex;align-items:flex-end;gap:var(--space-1);padding:var(--space-1) var(--space-1) var(--space-1) var(--space-3);border-radius:var(--radius-2xl);background:var(--surface-quiet)}
.cm-reply__pill:focus-within{box-shadow:0 0 0 2px var(--border-field-focus)}
.cm-reply__input:focus,.cm-reply__input:focus-visible{box-shadow:none;outline:none}
.cm-reply__input{flex:1;min-width:0;min-height:32px;max-height:120px;padding:6px 0;border:0;background:none;color:var(--text-heading);font:inherit;font-size:var(--text-sm);resize:none;outline:none}
.cm-reply__send{display:grid;place-items:center;flex:none;width:32px;height:32px;border:0;border-radius:var(--radius-full);background:none;color:var(--primary);cursor:pointer}
.cm-reply__send:disabled{color:var(--text-disabled);cursor:default}
.cm-reply__note{margin:0 0 0 var(--space-3)}
.cm-quick{min-width:0}
.cm-quick .ib-menu{flex:none}
@keyframes cm-in{from{opacity:0;transform:translateY(4px)}}
@keyframes cm-pop{from{opacity:0;transform:scale(.4)}}
@media (prefers-reduced-motion:reduce){.cm-item,.cm-rep,.cm-reply,.cm-likes{animation:none}}
.cm-ins{display:flex;flex-direction:column;gap:var(--space-5);padding:var(--space-5)}
.cm-kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.cm-kpis div{display:flex;flex-direction:column;gap:2px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-page)}
.cm-kpis svg{color:var(--text-muted)}
.cm-kpis b{font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.cm-senti-bar{display:flex;gap:2px;height:8px;overflow:hidden;border-radius:var(--radius-full);background:var(--surface-quiet)}
.cm-senti-bar span{display:block;height:100%}
.cm-legend{display:flex;flex-wrap:wrap;gap:var(--space-3);font-size:var(--text-xs);color:var(--text-muted)}
.cm-legend span{display:inline-flex;align-items:center;gap:4px}
.cm-legend b{font-weight:var(--weight-medium);color:var(--text-heading)}
.cm-meter{display:flex;flex-direction:column;gap:4px}
.cm-meter__top{display:flex;justify-content:space-between;font-size:var(--text-sm);color:var(--text-body)}
.cm-meter__top b{font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums}
.cm-meter .gc-progress{height:6px}
.cm-rule{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:36px;font-size:var(--text-sm);color:var(--text-body)}
.cm-saved{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle)}
.cm-saved:last-child{border-bottom:0}
.cm-saved>span{min-width:0;display:flex;flex-direction:column}
.cm-saved b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
@container (max-width:560px){
  .cm-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .cm-scroll{padding:var(--space-3) var(--space-3) var(--space-5)}
  .cm-item{padding:var(--space-3)}
  .cm-item .ib-av{display:none}
}
`;
