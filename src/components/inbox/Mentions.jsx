'use client';
// Mentions — where people tag the shop (Instagram and Facebook stories, posts, TikTok videos, comments in other pages and
// groups) and where a teammate @mentions you in an internal note. Laid out like Messenger's story replies: the person,
// what they said, the story or post, and the actions: reply in a private chat, send a ❤️, mark as done.
// Data: lib/inbox.js › getMentions (social, kept in this browser) and teamMentions (read from the notes).

import React, { useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState, StatusBadge } from '@/components/ui';
import { getMentions, patchMention, chatFromMention, teamMentions, addMessages, staffName, firstName, channelName, ago, ME, MENTION_KIND } from '@/lib/inbox';
import { useInbox, Avatar } from './parts';
import { Mentioned } from './Messenger';

const FILTERS = [['all', 'All'], ['story', 'Stories'], ['post', 'Posts'], ['comment', 'Comments'], ['team', 'Team']];
const compact = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'K' : String(n));
const VERB = { story: 'mentioned you in their story', post: 'mentioned you in a post', comment: 'mentioned you in a comment' };

export function MentionsView({ now, onOpenConv }) {
  const data = useInbox(() => ({ social: getMentions(), team: teamMentions(ME) }));
  const [f, setF] = useState('all');
  const [showDone, setShowDone] = useState(false);
  const rows = useMemo(() => {
    if (!data) return [];
    const all = [...data.social, ...data.team].sort((a, b) => b.at - a.at);
    return all.filter((x) => (f === 'all' || x.kind === f) && (showDone || x.kind === 'team' || x.status !== 'done'));
  }, [data, f, showDone]);
  if (!data) return null;
  const count = (k) => [...data.social, ...data.team].filter((x) => (k === 'all' || x.kind === k) && (x.kind === 'team' || x.status !== 'done')).length;
  const reply = (x) => { const id = chatFromMention(x); toast('Chat opened with ' + x.who); onOpenConv(id); };
  const heart = (x) => {
    const id = chatFromMention(x);
    addMessages(id, { from: 'agent', by: ME, type: 'text', text: '❤️', status: 'sent' });
    toast('❤️ sent to ' + x.who);
  };
  const done = (x, on) => { patchMention(x.id, { status: on ? 'done' : 'new' }); toast(on ? 'Marked as done' : 'Moved back to new'); };
  return (
    <div className="mn">
      <div className="mn-bar">
        <div className="ix-chips" role="group" aria-label="Show">
          {FILTERS.map(([k, l]) => <button key={k} type="button" className="ix-chip" aria-pressed={f === k} onClick={() => setF(k)}>{l}{count(k) ? <span className="mn-n">{count(k)}</span> : null}</button>)}
        </div>
        <label className="mn-done"><input type="checkbox" className="gc-check" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />Show done</label>
      </div>
      {rows.length ? (
        <ul className="mn-list" aria-label="Mentions">
          {rows.map((x, i) => (
            <li key={x.id} className={'mn-item' + (x.status === 'done' ? ' is-done' : '')} style={{ animationDelay: Math.min(i, 8) * 40 + 'ms' }}>
              {x.kind === 'team' ? (
                <>
                  <span className="mn-av mn-av--team"><Icon name="at-sign" width="18" height="18" aria-hidden="true" /></span>
                  <div className="mn-main">
                    <p className="mn-head"><b>{staffName(x.by)}</b> mentioned you in a note on <b>{x.name}</b><span className="mn-when">{ago(x.at, now || Date.now())}</span></p>
                    <p className="mn-note"><Mentioned text={x.text} /></p>
                    <div className="mn-acts"><button type="button" className="ix-btn ix-btn--sm" onClick={() => onOpenConv(x.convId)}><Icon name="message-circle" width="16" height="16" aria-hidden="true" />Open chat</button></div>
                  </div>
                </>
              ) : (
                <>
                  <Avatar name={x.who} avatar={x.avatar} ch={x.ch} size={40} />
                  <div className="mn-main">
                    <p className="mn-head">
                      <b>{x.who}</b> {VERB[x.kind] || 'mentioned you'}{x.where ? ' · ' + x.where : ''}
                      <span className="mn-when">{ago(x.at, now || Date.now())}</span>
                      {x.sentiment === 'negative' ? <StatusBadge tone="error">Negative</StatusBadge> : null}
                      {x.status === 'done' ? <StatusBadge tone="success">Done</StatusBadge> : null}
                    </p>
                    <div className="mn-content">
                      {x.img ? <span className={'mn-thumb' + (x.kind === 'story' ? ' is-story' : '')}><img src={x.img} alt="" /><span className="mn-thumb__kind">{MENTION_KIND[x.kind]}</span></span> : null}
                      <div className="mn-text">
                        <p className="mn-bubble">{x.text}</p>
                        <span className="mn-sub">{channelName(x.ch)}{x.reach ? ' · ' + compact(x.reach) + (x.kind === 'story' ? ' views' : ' reach') : ''}</span>
                      </div>
                    </div>
                    <div className="mn-acts">
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => reply(x)}><Icon name="message-circle" width="16" height="16" aria-hidden="true" />Reply in chat</button>
                      <button type="button" className="ix-btn ix-btn--sm" onClick={() => heart(x)} aria-label={'Send a heart to ' + firstName(x.who)}><span aria-hidden="true">❤️</span>Send a heart</button>
                      {x.status === 'done'
                        ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => done(x, false)}>Move back to new</button>
                        : <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => done(x, true)}><Icon name="check" width="16" height="16" aria-hidden="true" />Mark as done</button>}
                    </div>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : <div className="ix-empty"><EmptyState icon="at-sign" title={f === 'team' ? 'Nobody mentioned you in a note' : 'No new mentions'} body="When someone tags the shop in a story, post or comment, it shows here." /></div>}
    </div>
  );
}

export const MENTIONS_CSS = `
.mn{display:flex;flex-direction:column;gap:var(--space-3);max-width:820px;padding:var(--space-3) var(--space-4) var(--space-6)}
.mn-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-2)}
.mn-n{margin-left:6px;font-size:var(--text-xs);color:var(--text-muted)}
.mn-done{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-sm);color:var(--text-body)}
.mn-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-card);overflow:hidden}
.mn-item{display:flex;gap:var(--space-3);padding:var(--space-4);border-top:1px solid var(--border-subtle);animation:mn-in 260ms cubic-bezier(.23,1,.32,1) both}
.mn-item:first-child{border-top:0}
.mn-item.is-done{opacity:.7}
.mn-av{display:grid;place-items:center;flex:none;width:40px;height:40px;border-radius:var(--radius-full)}
.mn-av--team{background:var(--fill-primary-soft);color:var(--primary)}
.mn-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--space-2)}
.mn-head{display:flex;flex-wrap:wrap;align-items:center;gap:4px var(--space-1-5);margin:0;font-size:var(--text-sm);color:var(--text-body)}
.mn-head b{font-weight:var(--weight-semibold);color:var(--text-heading)}
.mn-when{font-size:var(--text-xs);color:var(--text-muted)}
.mn-content{display:flex;align-items:flex-start;gap:var(--space-3)}
.mn-thumb{position:relative;flex:none;width:96px;height:96px;border-radius:var(--radius-xl);overflow:hidden;background:var(--surface-subtle);box-shadow:var(--shadow-soft)}
.mn-thumb.is-story{width:72px;height:128px}
.mn-thumb img{display:block;width:100%;height:100%;object-fit:cover}
.mn-thumb__kind{position:absolute;left:6px;bottom:6px;padding:0 6px;border-radius:var(--radius-full);background:color-mix(in srgb,var(--navy-950) 60%,transparent);color:var(--text-inverse);font-size:var(--text-xs);line-height:18px}
.mn-text{min-width:0;display:flex;flex-direction:column;gap:4px}
.mn-bubble{margin:0;padding:var(--space-2) var(--space-3);border-radius:var(--radius-2xl);border-top-left-radius:var(--radius-sm);background:var(--surface-quiet);color:var(--text-heading);font-size:var(--text-sm);line-height:var(--text-sm-lh);overflow-wrap:anywhere}
.mn-note{margin:0;padding:var(--space-2) var(--space-3);border:1px dashed color-mix(in srgb,var(--warning) 60%,transparent);border-radius:var(--radius-lg);background:var(--fill-warning-soft);font-size:var(--text-sm);color:var(--text-heading)}
.mn-sub{font-size:var(--text-xs);color:var(--text-muted)}
.mn-acts{display:flex;flex-wrap:wrap;gap:var(--space-2)}
@keyframes mn-in{from{opacity:0;transform:translateY(6px)}}
@media (prefers-reduced-motion:reduce){.mn-item{animation:none}}
@media (max-width:640px){.mn-item{padding:var(--space-3)}.mn-thumb{width:72px;height:72px}.mn-thumb.is-story{width:56px;height:100px}}
`;
