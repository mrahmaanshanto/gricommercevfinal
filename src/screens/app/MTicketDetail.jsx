'use client';
// Merchant app · Ticket (/m-ticket-detail?id=2304). The design board's layout (design/templates/app/MTicketDetail.dc.html)
// with live data (lib/supportTickets.js):
//   head      subject, the customer (orders on their phone number from lib/orders.js), Call (the phone's dialer) and
//             Message (their Inbox chat in /m-chat when there is one, lib/inbox.js)
//   facts     Status · Priority · Assigned · Order (→ /m-order-detail) · Channel; a tap on the first three changes it
//   Activity  calls, the customer's words, replies, internal notes, changes; attachments by name
//   Rating    on a solved ticket: the customer's stars and words, "Ask the customer"
//   bottom    Reply (reply on the channel or internal note, attach files by name) · Mark solved; solved: Reopen · Rating
//   More (…)  status, owner, ask for a rating, open on the web

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AppScreen, AppBar, Content, ActionBar, Button, Sheet, IconButton, Icon, Pill, Card, Segmented, TextInput, Field,
  EmptyState, Skeleton, useAppData, useQuery, toast, timeText, dateText,
} from './kit/AppKit';
import { canUse } from './kit/appNav';
import {
  ticketById, slaOf, chName, ref, isOpen, STATUSES, STATUS_TONE, PRIORITIES, deskPeople, personOf, meName,
  reply, assign, setStatus, setPriority, solve, reopen, askRating, rate,
} from '@/lib/supportTickets';
import { Face, PriorityMark, OwnerDot, FileChips, AttachButton, Star } from './support/ticketParts';
import { getOrders, findOrder } from '@/lib/orders';
import { getConvs } from '@/lib/inbox';
import { phoneDigits } from '@/lib/customers';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const CSS = `[data-screen="MTicketDetail"] .act-i{flex:1;min-width:0;padding-bottom:16px;border-bottom:1px solid var(--line)}
[data-screen="MTicketDetail"] .act > :last-child .act-i{border-bottom:0}
[data-screen="MTicketDetail"] button.lrow{width:100%;border:0;background:none;font:inherit;color:inherit;text-align:left;cursor:pointer}
[data-screen="MTicketDetail"] .lrow + button.lrow,[data-screen="MTicketDetail"] button.lrow + .lrow{border-top:1px solid var(--line)}
[data-screen="MTicketDetail"] .stars{display:flex;gap:6px;justify-content:center;padding:4px 0 2px}
[data-screen="MTicketDetail"] .stars button{width:44px;height:44px;display:flex;align-items:center;justify-content:center;border:0;border-radius:var(--radius-full);background:none;color:#f59e0b;cursor:pointer}
[data-screen="MTicketDetail"] .opt{display:flex;align-items:center;gap:12px;width:100%;min-height:52px;padding:10px 4px;border:0;border-bottom:1px solid var(--line);background:none;font:inherit;color:var(--ink);text-align:left;cursor:pointer}
[data-screen="MTicketDetail"] .opt:last-child{border-bottom:0}`;

// how each kind of activity is drawn: icon, its tint, and the title line
const KIND = {
  call: ['phone', 'var(--okbg)', 'var(--ok)'],
  customer: ['user', '#eef1f5', '#475569'],
  agent: ['chat', 'var(--soft)', 'var(--brand)'],
  note: ['edit', '#fff4e0', '#b45309'],
  system: ['clock', '#eef1f5', '#475569'],
};
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function titleOf(x, t, me) {
  const first = t.customer.split(' ')[0];
  if (x.from === 'call') return `Call from ${first}${x.dur ? ' · ' + mmss(x.dur) : ''}`;
  if (x.from === 'customer') return `${first} on ${chName(t.ch)}`;
  if (x.from === 'agent') return `${x.by && x.by !== me ? x.by : 'You'} replied on ${chName(t.ch)}`;
  if (x.from === 'note') return `${x.by && x.by !== me ? x.by : 'You'} · internal note`;
  return x.text;
}

function KV({ label, children, onClick }) {
  const inner = (
    <>
      <span style={{ width: '84px', flex: 'none', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{label}</span>
      <span style={{ flex: '1', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px', minWidth: '0', fontSize: 'var(--text-sm)' }}>{children}</span>
      {onClick ? <Icon name="chev" size={16} stroke={2} style={{ color: 'var(--text-muted)', flex: 'none' }} /> : null}
    </>
  );
  return onClick
    ? <button type="button" className="lrow" style={{ padding: '11px 16px' }} onClick={onClick}>{inner}</button>
    : <div className="lrow" style={{ padding: '11px 16px' }}>{inner}</div>;
}

export default function MTicketDetailScreen() {
  const query = useQuery();
  const { ready, tick, ctx } = useAppData(['gc:tickets']);
  const id = query ? query.get('id') || '' : null;
  const [sheet, setSheet] = useState('');          // reply | status | priority | owner | rating | more
  const [mode, setMode] = useState('reply');       // reply | note
  const [draft, setDraft] = useState('');
  const [files, setFiles] = useState([]);
  const [stars, setStars] = useState(0);
  const [words, setWords] = useState('');
  const t = useMemo(() => (ready && id != null ? safe(() => ticketById(id), null) : undefined), [ready, tick, id]);
  const now = useMemo(() => Date.now(), [tick, ready]);
  const me = ready ? meName() : '';

  const extra = useMemo(() => {
    if (!t) return null;
    const digits = phoneDigits(t.phone);
    const orders = digits ? safe(() => getOrders().filter((o) => phoneDigits(o.phone) === digits), []) : [];
    const conv = safe(() => getConvs().find((c) => (digits && phoneDigits(c.phone) === digits) || c.name === t.customer), null);
    const order = t.order ? safe(() => findOrder(t.order), null) : null;
    return { orders, conv, order };
  }, [t]);

  const close = () => setSheet('');
  const done = (res, msg) => { if (res && res.ok) { if (msg) toast(msg); return true; } toast((res && res.error) || 'That did not work', { tone: 'error' }); return false; };
  const openReply = (m) => { setMode(m); setDraft(''); setFiles([]); setSheet('reply'); };
  const send = () => {
    if (done(reply(t.id, draft, files, { internal: mode === 'note' }), mode === 'note' ? 'Note added' : 'Reply sent on ' + chName(t.ch))) close();
  };
  const markSolved = () => { if (done(solve(t.id), ref(t) + ' solved')) { setStars(0); setWords(''); } };
  const openRating = () => { setStars(t.rating || 0); setWords(t.ratingNote || ''); setSheet('rating'); };
  const saveRating = () => { if (done(rate(t.id, stars, words), 'Rating saved')) close(); };

  if (t === undefined || query == null) {
    return (
      <AppScreen name="MTicketDetail" title="Ticket" css={CSS}>
        <AppBar title="Ticket" back="/m-tickets" />
        <Content top={103}><Skeleton rows={4} /></Content>
      </AppScreen>
    );
  }
  if (!t) {
    return (
      <AppScreen name="MTicketDetail" title="Ticket" css={CSS}>
        <AppBar title="Ticket" back="/m-tickets" />
        <Content top={103}><Card><EmptyState icon="ticket" title="This ticket was not found" action={{ label: 'All tickets', href: '/m-tickets' }} /></Card></Content>
      </AppScreen>
    );
  }

  const open = isOpen(t);
  const s = slaOf(t, now);
  const owner = personOf(t.assignee);
  const people = deskPeople();
  const sub = [extra.orders.length ? `${extra.orders.length} ${extra.orders.length === 1 ? 'order' : 'orders'}` : '', t.phone, t.topic].filter(Boolean).join(' · ');
  const orderHref = extra.order && ctx && canUse('/m-orders', ctx) ? '/m-order-detail?id=' + encodeURIComponent(t.order) : extra.order ? '/order-detail?id=' + encodeURIComponent(t.order) : null;
  const chatHref = extra.conv ? '/m-chat?id=' + encodeURIComponent(extra.conv.id) : t.phone ? 'sms:' + phoneDigits(t.phone) : null;
  const dayStart = new Date(now).setHours(0, 0, 0, 0);
  const when = (at) => (at >= dayStart ? timeText(at) : dateText(at));

  return (
    <AppScreen name="MTicketDetail" title={ref(t)} css={CSS}>
      <AppBar title={ref(t)} back="/m-tickets" actions={<IconButton icon="dots" label="More" onClick={() => setSheet('more')} />} />
      <Content top={103} bottom={98}>
        <div style={{ padding: '2px 20px 0' }}>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', lineHeight: '25px', letterSpacing: '0' }}>{t.subject}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
            <Face t={t} size={36} />
            <span style={{ flex: '1', minWidth: '0' }}>
              <span className="ell" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>{t.customer}</span>
              <span className="ell" style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{sub || chName(t.ch)}</span>
            </span>
            {t.phone ? (
              <a href={'tel:' + phoneDigits(t.phone)} className="ib" aria-label={'Call ' + t.customer} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: 'var(--okbg)', color: 'var(--ok)' }}><Icon name="phone" size={20} /></a>
            ) : null}
            {chatHref ? (
              <Link href={chatHref} className="ib" aria-label={'Message ' + t.customer} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: 'var(--soft)', color: 'var(--brand)' }}><Icon name="chat" size={20} /></Link>
            ) : null}
          </div>
        </div>

        <div className="card" style={{ margin: '16px 20px 0' }}>
          <KV label="Status" onClick={() => setSheet('status')}><Pill tone={open ? s.tone : 'ok'} shape={s.shape}>{open && s.text !== t.status && t.status !== 'Waiting on customer' ? `${t.status} · ${s.text}` : t.status}</Pill></KV>
          <KV label="Priority" onClick={open ? () => setSheet('priority') : undefined}><PriorityMark priority={t.priority} /></KV>
          <KV label="Assigned" onClick={() => setSheet('owner')}>
            {owner ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'var(--weight-medium)', minWidth: '0' }}><OwnerDot who={t.assignee} size={24} /><span className="ell">{owner.name}{owner.first === me ? ' (you)' : ''}</span></span>
              : <span style={{ color: 'var(--muted)' }}>Nobody yet</span>}
          </KV>
          {t.order ? (
            <KV label="Order">{orderHref ? <Link href={orderHref} style={{ color: 'var(--brand)', fontWeight: 'var(--weight-medium)' }} className="mono">{t.order}</Link> : <span className="mono">{t.order}</span>}</KV>
          ) : null}
          <KV label="Came in by">{chName(t.ch)}</KV>
        </div>

        {!open ? (
          <>
            <div className="sec"><h2>Customer rating</h2></div>
            <Card pad="14px 16px">
              {t.rating ? (
                <button type="button" onClick={openRating} style={{ display: 'block', width: '100%', border: 0, background: 'none', padding: 0, font: 'inherit', color: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
                  <span style={{ display: 'flex', gap: '2px', color: '#f59e0b' }} role="img" aria-label={`${t.rating} of 5 stars`}>{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={20} on={n <= t.rating} />)}</span>
                  {t.ratingNote ? <span style={{ display: 'block', marginTop: '6px', fontSize: 'var(--text-sm)', color: 'var(--body)' }}>“{t.ratingNote}”</span> : null}
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ flex: '1', fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>{t.ratingAskedAt ? `Asked ${dateText(t.ratingAskedAt)}. No answer yet.` : 'Not rated yet.'}</span>
                  {!t.ratingAskedAt ? <Button kind="soft" style={{ height: '36px' }} onClick={() => done(askRating(t.id), 'Rating request sent on ' + chName(t.ch))}>Ask</Button> : null}
                </div>
              )}
            </Card>
          </>
        ) : null}

        <div className="sec"><h2>Activity</h2></div>
        <div className="card act" style={{ margin: '0 20px', padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {t.thread.slice().reverse().map((x) => {
            const [icon, bg, fg] = KIND[x.from] || KIND.system;
            const sys = x.from === 'system';
            return (
              <div key={x.id} style={{ display: 'flex', gap: '12px' }}>
                <span className="ico" style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-full)', background: bg, color: fg }}><Icon name={icon} size={18} /></span>
                <div className="act-i">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: 'var(--text-xs-plus)' }}>
                    <b style={{ fontWeight: sys ? 'var(--weight-regular)' : 'var(--weight-medium)', color: sys ? 'var(--body)' : undefined, minWidth: '0' }}>{titleOf(x, t, me)}</b>
                    <span className="num" style={{ color: 'var(--muted)', flex: 'none' }}>{when(x.at)}</span>
                  </div>
                  {!sys && x.from !== 'call' && x.text ? <div style={{ fontSize: 'var(--text-sm)', lineHeight: '20px', color: 'var(--body)', marginTop: '2px', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{x.text}</div> : null}
                  {x.from === 'call' && x.files && x.files.length ? <div style={{ fontSize: 'var(--text-sm)', lineHeight: '20px', color: 'var(--body)', marginTop: '2px' }}>Recording attached</div> : null}
                  {x.from !== 'call' ? <FileChips files={x.files} /> : null}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ height: '8px' }} />
      </Content>

      <ActionBar>
        {open ? (
          <>
            <Button kind="line" icon="edit" onClick={() => openReply('reply')}>Reply</Button>
            <Button kind="primary" icon="check" style={{ flex: 2 }} onClick={markSolved}>Mark solved</Button>
          </>
        ) : (
          <>
            <Button kind="line" icon="undo" onClick={() => done(reopen(t.id), ref(t) + ' reopened')}>Reopen</Button>
            <Button kind="primary" style={{ flex: 2 }} onClick={openRating}>{t.rating ? 'Change rating' : 'Add the rating'}</Button>
          </>
        )}
      </ActionBar>

      <Sheet open={sheet === 'reply'} onClose={close} title={mode === 'note' ? 'Internal note' : 'Reply to ' + t.customer.split(' ')[0]}
        footer={<Button kind="primary" icon={mode === 'note' ? 'edit' : 'chat'} onClick={send}>{mode === 'note' ? 'Add note' : 'Send on ' + chName(t.ch)}</Button>}>
        <Segmented items={[{ key: 'reply', label: 'Reply' }, { key: 'note', label: 'Internal note' }]} value={mode} onChange={setMode} style={{ margin: '0 0 14px' }} />
        <Field label={mode === 'note' ? 'Only your team sees this' : `Goes to ${t.customer} on ${chName(t.ch)}`}>
          <TextInput multiline value={draft} onChange={setDraft} placeholder={mode === 'note' ? 'Write a note for the team' : 'Write your reply'} autoFocus />
        </Field>
        <div style={{ marginTop: '12px' }}>
          <AttachButton onAdd={(names) => setFiles((f) => [...f, ...names].slice(0, 5))} />
          <FileChips files={files} onRemove={(i) => setFiles((f) => f.filter((_, j) => j !== i))} />
        </div>
      </Sheet>

      <Sheet open={sheet === 'status'} onClose={close} title="Status">
        {STATUSES.map((st) => (
          <button key={st} type="button" className="opt" onClick={() => { if (done(setStatus(t.id, st), st === 'Solved' ? ref(t) + ' solved' : 'Moved to ' + st)) close(); }}>
            <span style={{ flex: '1' }}><Pill tone={STATUS_TONE[st]}>{st}</Pill></span>
            {t.status === st ? <Icon name="check" size={20} stroke={2.2} style={{ color: 'var(--brand)' }} /> : null}
          </button>
        ))}
      </Sheet>

      <Sheet open={sheet === 'priority'} onClose={close} title="Priority">
        {PRIORITIES.slice().reverse().map((p) => (
          <button key={p} type="button" className="opt" onClick={() => { if (done(setPriority(t.id, p), 'Priority ' + p)) close(); }}>
            <span style={{ flex: '1' }}><PriorityMark priority={p} /></span>
            {t.priority === p ? <Icon name="check" size={20} stroke={2.2} style={{ color: 'var(--brand)' }} /> : null}
          </button>
        ))}
      </Sheet>

      <Sheet open={sheet === 'owner'} onClose={close} title="Assign to">
        {[...people, { first: '', name: 'Nobody yet' }].map((p) => (
          <button key={p.first || 'none'} type="button" className="opt" onClick={() => { if (done(assign(t.id, p.first), p.first ? 'Assigned to ' + (p.first === me ? 'you' : p.first) : 'Unassigned')) close(); }}>
            {p.first ? <OwnerDot who={p.first} size={32} /> : <span className="av" style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', background: '#eef1f5', color: 'var(--muted)' }}><Icon name="user" size={16} /></span>}
            <span style={{ flex: '1', fontWeight: 'var(--weight-medium)' }}>{p.name}{p.first && p.first === me ? ' (you)' : ''}</span>
            {t.assignee === p.first ? <Icon name="check" size={20} stroke={2.2} style={{ color: 'var(--brand)' }} /> : null}
          </button>
        ))}
      </Sheet>

      <Sheet open={sheet === 'rating'} onClose={close} title="Customer rating"
        footer={<>
          {!t.rating ? <Button kind="line" onClick={() => { if (done(askRating(t.id), 'Rating request sent on ' + chName(t.ch))) close(); }}>Ask the customer</Button> : null}
          <Button kind="primary" disabled={!stars} onClick={saveRating}>Save rating</Button>
        </>}>
        <div className="stars" role="radiogroup" aria-label="Stars">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={stars === n} aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`} onClick={() => setStars(n)}><Star size={32} on={n <= stars} /></button>
          ))}
        </div>
        <div style={{ textAlign: 'center', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)', margin: '0 0 14px' }}>{stars ? ['Very unhappy', 'Unhappy', 'Okay', 'Happy', 'Very happy'][stars - 1] : 'What the customer gave'}</div>
        <Field label="What they said (optional)">
          <TextInput value={words} onChange={setWords} placeholder="Quick and polite" />
        </Field>
      </Sheet>

      <Sheet open={sheet === 'more'} onClose={close} title={ref(t)}>
        <button type="button" className="opt" onClick={() => setSheet('status')}><Icon name="refresh" size={20} /><span style={{ flex: '1' }}>Change status</span></button>
        <button type="button" className="opt" onClick={() => setSheet('owner')}><Icon name="user" size={20} /><span style={{ flex: '1' }}>Assign to someone</span></button>
        {open ? <button type="button" className="opt" onClick={() => openReply('note')}><Icon name="edit" size={20} /><span style={{ flex: '1' }}>Add an internal note</span></button> : null}
        {!open && !t.rating ? <button type="button" className="opt" onClick={() => { if (done(askRating(t.id), 'Rating request sent on ' + chName(t.ch))) close(); }}><Icon name="megaphone" size={20} /><span style={{ flex: '1' }}>Ask the customer for a rating</span></button> : null}
        <Link className="opt" href="/support-tickets"><Icon name="globe" size={20} /><span style={{ flex: '1' }}>Open the ticket desk on the web</span></Link>
      </Sheet>
    </AppScreen>
  );
}
