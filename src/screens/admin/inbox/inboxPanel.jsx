'use client';
// The contact panel beside a conversation in the super admin's Inbox (copied from the merchant panel's
// components/inbox/CustomerPanel.jsx, same look): who it is (Lead / Merchant / Affiliate / Partner); for a merchant its
// package and subscription state from lib/admin/merchants › merchantRow with a link to the merchant page; for a lead a
// link into Leads (by name; the CRM is its own module); contact details, assignee, tags, related tickets, the team's
// note and every other conversation with the same contact.
// Also here: SavedReplies (manage and insert), NewConversation, AiSettings (the default AI mode and the rules).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { ChannelIcon, StatusBadge } from '@/components/ui';
import { KV } from '@/components/ui/IndexKit';
import { formatBDT } from '@/lib/format';
import { dmy } from '@/lib/platform/util';
import { merchantRow } from '@/lib/admin/merchants';
import {
  KINDS, CHANNELS, CHANNEL_IDS, channelName, staffName, TEAM, statusOf, lastOf, lastAt, previewOf, history, fillReply,
  AI_MODES, SENSITIVE, aiModeOf, upsertReply, deleteReply, startConversation,
} from '@/lib/admin/inbox';
import { Avatar, StaffAvatar, KindBadge, Menu, MenuItem, Sheet, SearchBox, chIcon } from './inboxParts';
import { dayLabel, clock } from './inboxThread';

const STATUS_WORD = { open: 'Open', pending: 'Pending', snoozed: 'Snoozed', closed: 'Closed' };

export function ContactPanel({ conv, data, db, t, me, onOpenConv, act, onClose }) {
  const [note, setNote] = useState(conv.note || '');
  useEffect(() => { setNote(conv.note || ''); }, [conv.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const kind = KINDS[conv.kind];
  const shop = conv.shopId ? db.shops.find((s) => s.id === conv.shopId) : null;
  const row = useMemo(() => { try { return shop ? merchantRow(db, shop, t) : null; } catch { return null; } }, [db, shop, t]);
  const past = history(data, conv);
  const saveNote = () => { if (note !== (conv.note || '')) { act.saveNote(note); toast('Note saved'); } };

  return (
    <div className="cp">
      <div className="cp-head">
        <Avatar name={conv.name} ch={conv.ch} size={48} />
        <div className="cp-head__text">
          <h2 className="ib-h2 cp-name">{conv.name}</h2>
          <span className="ib-sub cp-trunc">{conv.company || channelName(conv.ch)}</span>
        </div>
        {onClose ? <button type="button" className="gc-iconbtn cp-close" aria-label="Close contact details" onClick={onClose}><Icon name="x" width="18" height="18" /></button> : null}
      </div>
      <div className="cp-kind"><KindBadge kind={conv.kind} />{conv.district ? <span className="ib-sub">{conv.district}</span> : null}{conv.source ? <span className="ib-sub">· {conv.source}</span> : null}</div>

      <div className="cp-actions">
        {kind && (conv.kind !== 'merchant' || conv.shopId) ? <Link className="gc-btn gc-btn--sm gc-btn--neutral" href={kind.href(conv)}><Icon name={{ lead: 'target', merchant: 'store', affiliate: 'handshake', partner: 'plug' }[conv.kind]} width="16" height="16" aria-hidden="true" />{kind.link}</Link> : null}
        {conv.phone ? <Link className="gc-btn gc-btn--sm gc-btn--neutral" href={`/admin/calls?dial=${encodeURIComponent(conv.phone)}&name=${encodeURIComponent(conv.name)}`}><Icon name="phone" width="16" height="16" aria-hidden="true" />Call</Link> : null}
      </div>

      {conv.kind === 'merchant' ? (
        <section className="cp-sec" aria-label="Store">
          <div className="cp-sec__head"><h3 className="ib-h3">Store</h3>{shop ? <span className="ib-sub ib-data">#{shop.id}</span> : null}</div>
          {row ? (
            <KV rows={[
              ['Store', <Link key="s" className="ib-link" href={'/admin/merchant?id=' + row.id}>{row.name}</Link>],
              ['Package', row.packageName],
              ['Subscription', <StatusBadge key="b" tone={row.tone}>{row.stateLabel}</StatusBadge>],
              row.monthly ? ['Pays', formatBDT(row.monthly) + ' / month'] : null,
              row.renewal ? [row.stateKey === 'trial' ? 'Trial ends' : 'Next bill', dmy(row.renewal)] : null,
              row.owed ? ['Owes', <span key="o" className="cp-owed">{formatBDT(row.owed)}</span>] : null,
              ['Owner', row.owner],
              row.am ? ['Account manager', row.am] : null,
            ]} />
          ) : <p className="cp-empty">Store #{conv.shopId || '—'} is not in the merchant list any more.</p>}
        </section>
      ) : null}

      <section className="cp-sec" aria-label="Contact">
        <h3 className="ib-h3">Contact</h3>
        <ul className="cp-list">
          {conv.phone ? <li><Icon name="phone" width="16" height="16" aria-hidden="true" /><span className="ib-data">{conv.phone}</span></li> : null}
          {conv.email ? <li><Icon name="mail" width="16" height="16" aria-hidden="true" /><span className="cp-trunc">{conv.email}</span></li> : null}
          <li><ChannelIcon channel={chIcon(conv.ch)} size={18} decorative /><span className="cp-trunc">{conv.handle || conv.phone || conv.email || conv.name}</span><span className="ib-sub cp-right">This chat</span></li>
          {past.map((c) => (
            <li key={c.id}><ChannelIcon channel={chIcon(c.ch)} size={18} decorative /><button type="button" className="cp-linkbtn" onClick={() => onOpenConv(c.id)}>{c.handle || c.phone || c.email || c.name}</button><span className="ib-sub cp-right">{CHANNELS[c.ch].short}</span></li>
          ))}
        </ul>
      </section>

      <section className="cp-sec" aria-label="Assigned to">
        <div className="cp-sec__head"><h3 className="ib-h3">Assigned to</h3>
          <Menu label="Assign to" button={({ toggle, open }) => <button type="button" className="gc-btn gc-btn--xs gc-btn--flat" aria-expanded={open} onClick={toggle}>{conv.assignee ? 'Transfer' : 'Assign'}</button>}>
            {(close) => <>{TEAM.map((p) => <MenuItem key={p.id} checked={conv.assignee === p.id} hint={p.id === me ? 'Me' : p.title} onClick={() => { act.assign(p.id); close(); }}>{p.name}</MenuItem>)}{conv.assignee ? <MenuItem icon="user-x" onClick={() => { act.assign(''); close(); }}>Unassign</MenuItem> : null}</>}
          </Menu>
        </div>
        <p className="cp-who"><StaffAvatar id={conv.assignee} size={24} />{conv.assignee ? <span><b>{staffName(conv.assignee)}</b><small>{(TEAM.find((p) => p.id === conv.assignee) || {}).title}</small></span> : <span className="ib-muted">Nobody yet</span>}</p>
      </section>

      <section className="cp-sec" aria-label="Tags">
        <div className="cp-sec__head"><h3 className="ib-h3">Tags</h3>
          <Menu label="Tags" button={({ toggle, open }) => <button type="button" className="gc-btn gc-btn--xs gc-btn--flat" aria-expanded={open} onClick={toggle}><Icon name="plus" width="14" height="14" aria-hidden="true" />Tag</button>}>
            {(close) => <TagMenu all={allTags(data)} on={conv.tags} onToggle={act.toggleTag} onAdd={(n) => { act.toggleTag(n); close(); }} />}
          </Menu>
        </div>
        {conv.tags.length ? (
          <div className="cp-tags">{conv.tags.map((g) => <span key={g} className="gc-badge gc-badge--slate">{g}<button type="button" className="cp-x" aria-label={'Remove tag ' + g} onClick={() => act.toggleTag(g)}><Icon name="x" width="12" height="12" /></button></span>)}</div>
        ) : <p className="cp-empty">No tags yet.</p>}
      </section>

      <section className="cp-sec" aria-label="Related tickets">
        <div className="cp-sec__head"><h3 className="ib-h3">Tickets</h3><Link className="gc-btn gc-btn--xs gc-btn--flat" href={'/admin/tickets?new=1&from=' + conv.id}><Icon name="plus" width="14" height="14" aria-hidden="true" />Ticket</Link></div>
        {conv.tickets.length ? (
          <ul className="cp-tickets">{conv.tickets.map((id) => <li key={id}><Icon name="life-buoy" width="16" height="16" aria-hidden="true" /><Link className="ib-link ib-data" href={'/admin/tickets?id=' + id}>{id}</Link></li>)}</ul>
        ) : <p className="cp-empty">No tickets for this conversation.</p>}
      </section>

      <section className="cp-sec" aria-label="Team note">
        <h3 className="ib-h3"><label htmlFor={'cp-note-' + conv.id}>Team note</label></h3>
        <textarea id={'cp-note-' + conv.id} className="gc-input cp-note" rows="3" value={note} onChange={(e) => setNote(e.target.value)} onBlur={saveNote} placeholder="Anything the next person should know. Only the team sees this." />
      </section>

      <section className="cp-sec" aria-label="Previous conversations">
        <h3 className="ib-h3">Previous conversations</h3>
        {past.length ? (
          <ul className="cp-hist">
            {past.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => onOpenConv(c.id)}>
                  <ChannelIcon channel={chIcon(c.ch)} size={20} decorative />
                  <span className="cp-hist__text"><span className="cp-hist__top"><b>{CHANNELS[c.ch].short}</b><span className="ib-sub">{dayLabel(lastAt(c), t)}</span></span><span className="ib-sub cp-trunc">{previewOf(lastOf(c))}</span></span>
                  <span className="gc-badge gc-badge--slate">{STATUS_WORD[statusOf(c, t)]}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="cp-empty">Only this conversation so far.</p>}
      </section>
    </div>
  );
}

export const allTags = (data) => [...new Set(data.convs.flatMap((c) => c.tags))].sort((a, b) => a.localeCompare(b));

/** Tag checklist with a "new tag" field. */
export function TagMenu({ all, on, onToggle, onAdd }) {
  const [name, setName] = useState('');
  return (
    <>
      <p className="ib-menu__head">Tags</p>
      {all.map((g) => <MenuItem key={g} checked={on.includes(g)} onClick={() => onToggle(g)}>{g}</MenuItem>)}
      <form className="ib-menu__form" onSubmit={(e) => { e.preventDefault(); const n = name.trim(); if (n) { onAdd(n); setName(''); } }}>
        <input className="gc-input" aria-label="New tag" placeholder="New tag" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit" className="gc-btn gc-btn--sm gc-btn--soft">Add</button>
      </form>
    </>
  );
}

// ---- saved replies ---------------------------------------------------------------------------------------------------
export function SavedReplies({ open, onClose, data, ctx, onUse }) {
  const [q, setQ] = useState('');
  const [form, setForm] = useState(null);   // { id?, title, short, body, lang }
  const [err, setErr] = useState('');
  useEffect(() => { if (open) { setQ(''); setForm(null); setErr(''); } }, [open]);
  const list = data.replies.filter((r) => !q || (r.title + ' ' + r.short + ' ' + r.body).toLowerCase().includes(q.toLowerCase()));
  const save = (e) => {
    e.preventDefault();
    const res = upsertReply(form);
    if (!res.ok) { setErr(res.error); return; }
    toast(form.id ? 'Saved reply updated' : 'Saved reply added');
    setForm(null); setErr('');
  };
  const remove = async (r) => {
    if (!(await confirmDialog({ title: `Delete “${r.title}”?`, body: 'The team can no longer insert it with /' + r.short + '.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    deleteReply(r.id);
    toast('Saved reply deleted');
  };
  return (
    <Sheet open={open} onClose={onClose} title={form ? (form.id ? 'Edit saved reply' : 'New saved reply') : 'Saved replies'}
      actions={!form ? <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={() => setForm({ title: '', short: '', body: '', lang: 'en' })}><Icon name="plus" width="16" height="16" aria-hidden="true" />New</button> : null}>
      {form ? (
        <form className="ib-form" onSubmit={save}>
          <div className="ib-two">
            <div><label className="gc-label" htmlFor="sr-title">Title</label><input id="sr-title" className="gc-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="gc-label" htmlFor="sr-short">Shortcut</label><input id="sr-short" className="gc-input ib-data" value={form.short} placeholder="price" onChange={(e) => setForm({ ...form, short: e.target.value })} /></div>
          </div>
          <div><label className="gc-label" htmlFor="sr-lang">Language</label><select id="sr-lang" className="gc-input gc-select" value={form.lang} onChange={(e) => setForm({ ...form, lang: e.target.value })}><option value="en">English</option><option value="bn">বাংলা</option></select></div>
          <div><label className="gc-label" htmlFor="sr-body">Reply</label><textarea id="sr-body" className={'gc-input' + (form.lang === 'bn' ? ' ib-bn' : '')} rows="5" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            <p className="ib-sub sr-vars">Fills in: {'{{first}}'} {'{{name}}'} {'{{store}}'} {'{{agent}}'}</p></div>
          {err ? <p className="ib-err" role="alert">{err}</p> : null}
          <div className="sr-foot"><button type="button" className="gc-btn gc-btn--neutral" onClick={() => { setForm(null); setErr(''); }}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">Save reply</button></div>
        </form>
      ) : (
        <div className="sr">
          <SearchBox value={q} onChange={setQ} placeholder="Search saved replies" />
          {list.length ? (
            <ul className="sr-list">
              {list.map((r) => (
                <li key={r.id}>
                  <span className="sr-top"><b className={r.lang === 'bn' ? 'ib-bn' : ''}>{r.title}</b><span className="ib-data ib-muted">/{r.short}</span>{r.uses ? <span className="ib-sub">used {r.uses}×</span> : null}</span>
                  <p className={'sr-body' + (r.lang === 'bn' ? ' ib-bn' : '')}>{ctx ? fillReply(r.body, ctx) : r.body}</p>
                  <span className="sr-acts">
                    <button type="button" className="gc-btn gc-btn--xs gc-btn--flat" onClick={() => setForm({ ...r })}>Edit</button>
                    <button type="button" className="gc-btn gc-btn--xs gc-btn--flat" onClick={() => remove(r)}>Delete</button>
                    {onUse ? <button type="button" className="gc-btn gc-btn--xs gc-btn--soft" onClick={() => onUse(r)}>Insert</button> : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : <p className="cp-empty sr-empty">No saved reply matches “{q}”.</p>}
        </div>
      )}
    </Sheet>
  );
}

// ---- a new conversation ----------------------------------------------------------------------------------------------
export function NewConversation({ open, onClose, onDone }) {
  const blank = { ch: 'whatsapp', kind: 'lead', name: '', company: '', handle: '', text: '' };
  const [f, setF] = useState(blank);
  const [err, setErr] = useState('');
  useEffect(() => { if (open) { setF(blank); setErr(''); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const submit = (e) => {
    e.preventDefault();
    const res = startConversation(f);
    if (!res.ok) { setErr(res.error); return; }
    onDone(res.id, f);
  };
  return (
    <Sheet open={open} onClose={onClose} title="New conversation">
      <form className="ib-form" onSubmit={submit}>
        <div className="ib-two">
          <div><label className="gc-label" htmlFor="nc-kind">Who is it</label><select id="nc-kind" className="gc-input gc-select" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>{Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
          <div><label className="gc-label" htmlFor="nc-ch">Channel</label><select id="nc-ch" className="gc-input gc-select" value={f.ch} onChange={(e) => setF({ ...f, ch: e.target.value })}>{CHANNEL_IDS.map((c) => <option key={c} value={c}>{channelName(c)}</option>)}</select></div>
        </div>
        <div className="ib-two">
          <div><label className="gc-label" htmlFor="nc-name">Name</label><input id="nc-name" className="gc-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Rahim Uddin" /></div>
          <div><label className="gc-label" htmlFor="nc-co">Business</label><input id="nc-co" className="gc-input" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} placeholder="Optional" /></div>
        </div>
        <div><label className="gc-label" htmlFor="nc-h">{f.ch === 'email' ? 'Email address' : f.ch === 'web' ? 'Visitor name or email' : 'Number or handle'}</label><input id="nc-h" className={'gc-input' + (f.ch === 'email' ? '' : ' ib-data')} value={f.handle} onChange={(e) => setF({ ...f, handle: e.target.value })} placeholder={f.ch === 'email' ? 'name@business.com' : '01712-345678'} /></div>
        <div><label className="gc-label" htmlFor="nc-text">First message</label><textarea id="nc-text" className="gc-input" rows="4" value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} /></div>
        {f.ch === 'whatsapp' ? <p className="ib-sub">WhatsApp: a first message to someone who has not written in 24 hours goes as an approved template.</p> : null}
        {err ? <p className="ib-err" role="alert">{err}</p> : null}
        <div className="sr-foot"><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">Send and open</button></div>
      </form>
    </Sheet>
  );
}

// ---- GridAI: the default mode and what waits for a person ----------------------------------------------------------
export function AiSettings({ open, onClose, data, t, onDefault, onOpenConv }) {
  const waiting = data.convs.filter((c) => c.approvals.length);
  const byMode = (m) => data.convs.filter((c) => statusOf(c, t) !== 'closed' && aiModeOf(c, data) === m).length;
  return (
    <Sheet open={open} onClose={onClose} title="GridAI replies">
      <div className="ai-set">
        <fieldset className="ai-modes">
          <legend className="ib-h3">Default for conversations</legend>
          {AI_MODES.map(([k, l, sub]) => (
            <label key={k} className={'ai-mode' + (data.settings.defaultAi === k ? ' is-on' : '')}>
              <input type="radio" name="ai-default" checked={data.settings.defaultAi === k} onChange={() => onDefault(k)} />
              <span><b>{l}</b><small>{sub}</small></span>
              <span className="ib-sub ib-data" title="Open conversations on this mode now">{byMode(k)}</span>
            </label>
          ))}
          <p className="ib-sub">A conversation can have its own mode (the GridAI button above the chat). The rest follow this default.</p>
        </fieldset>
        <section className="cp-sec">
          <h3 className="ib-h3">Always waits for a person</h3>
          <ul className="ai-rules">{SENSITIVE.map(([k, l]) => <li key={k}><Icon name="shield-check" width="16" height="16" aria-hidden="true" />{l}</li>)}</ul>
        </section>
        <section className="cp-sec">
          <h3 className="ib-h3">Needs approval now</h3>
          {waiting.length ? (
            <ul className="cp-hist">
              {waiting.map((c) => (
                <li key={c.id}><button type="button" onClick={() => onOpenConv(c.id)}>
                  <Avatar name={c.name} ch={c.ch} size={28} />
                  <span className="cp-hist__text"><span className="cp-hist__top"><b>{c.name}</b><span className="ib-sub">{clock(c.approvals[0].at)}</span></span><span className="ib-sub cp-trunc">{c.approvals[0].text}</span></span>
                  <span className="gc-badge gc-badge--warning">{c.approvals.length}</span>
                </button></li>
              ))}
            </ul>
          ) : <p className="cp-empty">Nothing is waiting.</p>}
        </section>
      </div>
    </Sheet>
  );
}

export const PANEL_CSS = `
.cp{display:flex;flex-direction:column;gap:var(--space-5);padding:var(--space-5)}
.cp-head{display:flex;align-items:center;gap:var(--space-3)}
.cp-head__text{flex:1;min-width:0;display:flex;flex-direction:column}
.cp-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cp-kind{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-1-5);margin-top:calc(var(--space-3) * -1)}
.cp-kind .ib-sub{display:inline}
.cp-actions{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.cp-actions .gc-btn{flex:1 1 auto;padding:0 var(--space-3)}
.cp-sec{display:flex;flex-direction:column;gap:var(--space-2)}
.cp-sec__head{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);min-height:30px}
.cp-sec .ix-kv{margin:0}
.cp-owed{color:var(--text-danger);font-weight:var(--weight-medium)}
.cp-tags{display:flex;flex-wrap:wrap;gap:var(--space-1-5)}
.cp-x{display:inline-grid;place-items:center;width:16px;height:16px;margin-right:-4px;padding:0;border:0;border-radius:var(--radius-full);background:none;color:inherit;cursor:pointer;opacity:.7}
.cp-x:hover{opacity:1;background:color-mix(in srgb,currentColor 12%,transparent)}
.cp-empty{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.cp-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-body)}
.cp-list li{display:flex;align-items:flex-start;gap:var(--space-2-5);min-width:0}
.cp-list li>svg{flex:none;margin-top:2px;color:var(--text-muted)}
.cp-list li>.gc-channel{margin-top:1px}
.cp-trunc{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cp-right{margin-left:auto;flex:none}
.cp-linkbtn{min-width:0;padding:0;border:0;background:none;color:var(--primary);font:inherit;font-weight:var(--weight-medium);text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}
.cp-linkbtn:hover{text-decoration:underline}
.cp-who{display:flex;align-items:center;gap:var(--space-2-5);margin:0;font-size:var(--text-sm)}
.cp-who>span{display:flex;flex-direction:column;min-width:0}
.cp-who b{font-weight:var(--weight-medium);color:var(--text-heading)}
.cp-who small{font-size:var(--text-xs);color:var(--text-muted)}
.cp-tickets{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-4)}
.cp-tickets li{display:inline-flex;align-items:center;gap:var(--space-1-5);font-size:var(--text-sm)}
.cp-tickets li>svg{color:var(--text-muted)}
.cp-note{height:auto;min-height:84px;padding:var(--space-2) var(--space-3);resize:vertical;line-height:1.5}
.cp-hist{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.cp-hist button{display:flex;align-items:center;gap:var(--space-2-5);width:100%;padding:var(--space-2);margin:0 calc(var(--space-2) * -1);border:0;border-radius:var(--radius-lg);background:none;font:inherit;text-align:left;cursor:pointer;box-sizing:content-box}
.cp-hist button:hover{background:var(--surface-subtle)}
.cp-hist__text{flex:1;min-width:0;display:flex;flex-direction:column}
.cp-hist__top{display:flex;justify-content:space-between;gap:var(--space-2);font-size:var(--text-sm)}
.cp-hist__top b{font-weight:var(--weight-medium);color:var(--text-heading)}
.sr{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4) var(--space-5)}
.sr-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.sr-list li{display:flex;flex-direction:column;gap:var(--space-1);padding:var(--space-3) 0;border-bottom:1px solid var(--border-subtle)}
.sr-list li:last-child{border-bottom:0}
.sr-top{display:flex;flex-wrap:wrap;align-items:baseline;gap:var(--space-2);font-size:var(--text-sm)}
.sr-top b{font-weight:var(--weight-medium);color:var(--text-heading)}
.sr-top .ib-sub{display:inline;margin-left:auto}
.sr-body{margin:0;font-size:var(--text-sm);line-height:var(--text-sm-lh);color:var(--text-body);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.sr-acts{display:flex;justify-content:flex-end;gap:var(--space-1)}
.sr-empty{padding:var(--space-4) 0;text-align:center}
.sr-vars{margin-top:6px}
.sr-foot{display:flex;justify-content:flex-end;gap:var(--space-2)}
.ai-set{display:flex;flex-direction:column;gap:var(--space-5);padding:var(--space-5)}
.ai-modes{display:flex;flex-direction:column;gap:var(--space-2);margin:0;padding:0;border:0}
.ai-modes legend{margin-bottom:var(--space-2)}
.ai-mode{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);cursor:pointer}
.ai-mode.is-on{border-color:color-mix(in srgb,var(--accent) 45%,transparent);background:var(--fill-accent-soft)}
.ai-mode input{margin-top:3px}
.ai-mode>span:nth-of-type(1){flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.ai-mode b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ai-mode small{font-size:var(--text-xs);color:var(--text-body)}
.ai-mode .ib-sub{display:inline;flex:none}
.ai-rules{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:var(--space-1-5);font-size:var(--text-sm);color:var(--text-body)}
.ai-rules li{display:flex;align-items:center;gap:var(--space-2)}
.ai-rules svg{color:var(--text-success)}
`;
