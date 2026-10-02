'use client';
// One conversation: the header with its actions, the messages grouped by day, and the composer
// (saved replies on "/", emoji, photo, product card, payment link, new order, internal notes,
// Bangla/English quick replies and suggested replies). Enter sends, Shift+Enter is a new line.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { StatusBadge, EmptyState } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';
import { formatBDT } from '@/lib/format';
import { ORDER_STATUSES } from '@/lib/orderStatus';
import { orderHref } from '@/lib/orders';
import { productBy, stockAt, getCatalog } from '@/lib/stock';
import { isStatusSellable } from '@/lib/sellable';
import { CHANNELS, channelName, staffName, STAFF, ME, statusOf, dayLabel, sameDay, clock, fmtDur, suggestions, fillReply, countReplyUse, snoozeChoices, whenText, samePhone } from '@/lib/inbox';
import { Avatar, StaffAvatar, Menu, MenuItem } from './parts';
import { TagMenu } from './CustomerPanel';
import { SavedRepliesDialog, ProductDialog, PaymentDialog, Lightbox, catIcon } from './Dialogs';

const EMOJI = ['😊', '🙏', '👍', '❤️', '😍', '🎉', '✅', '📦', '🚚', '💳', '🛍️', '⭐', '😅', '🤝', '👋', '🔥', '💯', '🙂', '😔', '⏰', '📍', '🎁', '💌', '👌'];
const STATUS_BADGE = { pending: ['Pending', 'info'], snoozed: ['Snoozed', 'warning'], closed: ['Closed', 'slate'] };
const METHOD = { bkash: 'bKash', nagad: 'Nagad', sslcommerz: 'Card or bank' };
const GAP = 5 * 60 * 1000;

const orderTone = (o) => (ORDER_STATUSES.find((s) => s.key === o.statusKey) || { tone: 'neutral' }).tone;
/** A price to put in a suggested reply: the last product card, else a product named in the last message. */
function guessPrice(conv) {
  const card = [...conv.messages].reverse().find((m) => m.type === 'product');
  if (card) { const p = productBy(card.sku); if (p) return p.price; }
  const last = [...conv.messages].reverse().find((m) => m.from === 'customer' && m.text);
  if (!last) return 0;
  const words = last.text.toLowerCase();
  const hit = getCatalog().filter(isStatusSellable).find((p) => p.name.toLowerCase().split(/[\s·]+/).some((w) => w.length > 4 && words.includes(w)));
  return hit ? hit.price : 0;
}

export function Thread({ conv, now, tags, orders, replies, typing, panelOpen, onBack, onTogglePanel, act }) {
  const status = statusOf(conv, now);
  const scroller = useRef(null);
  const bottom = useRef(true);
  const [fresh, setFresh] = useState(0);
  const [showJump, setShowJump] = useState(false);
  const [photo, setPhoto] = useState('');
  const count = conv.messages.length;
  const seen = useRef({ id: '', count: 0 });
  const mineOrders = useMemo(() => (conv.phone ? orders.filter((o) => samePhone(o.phone, conv.phone)).sort((a, b) => b.at - a.at) : []), [orders, conv.phone]);

  // open at the latest message; follow new messages when already at the bottom
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (seen.current.id !== conv.id) {
      el.scrollTop = el.scrollHeight;
      bottom.current = true; setShowJump(false); setFresh(0);
    } else if (count > seen.current.count) {
      const last = conv.messages[count - 1];
      if (bottom.current || last.from === 'agent' || last.from === 'note') el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
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
  const q = conv.phone ? `?phone=${encodeURIComponent(conv.phone)}&name=${encodeURIComponent(conv.name)}` : `?name=${encodeURIComponent(conv.name)}`;

  return (
    <>
      <header className="th-head">
        <button type="button" className="gc-iconbtn th-back" onClick={onBack} aria-label="Back to conversations"><Icon name="arrow-left" width="20" height="20" /></button>
        <button type="button" className="th-who" onClick={onTogglePanel} aria-label={`Customer details for ${conv.name}`} aria-expanded={panelOpen}>
          <Avatar name={conv.name} avatar={conv.avatar} pos={conv.pos} ch={conv.ch} size={40} />
          <span className="th-who__text">
            <span className="th-who__name"><span className="th-name">{conv.name}</span>{s ? <span className={'gc-badge gc-badge--' + s[1]}>{status === 'snoozed' ? 'Until ' + whenText(conv.snoozeUntil, now) : s[0]}</span> : null}{conv.blocked ? <span className="gc-badge gc-badge--error">Blocked</span> : null}</span>
            <span className="ib-sub th-who__sub">{channelName(conv.ch)}{conv.handle ? ' · ' + conv.handle : ''}{conv.phone && !conv.handle ? ' · ' + conv.phone : ''}</span>
          </span>
        </button>
        <div className="th-acts">
          <Menu label="Assign to" wide button={({ toggle, open }) => (
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral th-assign" aria-expanded={open} onClick={toggle} aria-label={conv.assignee ? `Assigned to ${staffName(conv.assignee)}. Change` : 'Assign'}>
              <StaffAvatar id={conv.assignee} size={22} /><span className="th-lbl">{conv.assignee ? staffName(conv.assignee).split(' ')[0] : 'Assign'}</span><Icon name="chevron-down" width="14" height="14" aria-hidden="true" />
            </button>
          )}>
            {(close) => (
              <>
                <p className="ib-menu__head">Assign to</p>
                {STAFF.map((p) => <MenuItem key={p.id} checked={conv.assignee === p.id} onClick={() => { act.assign(p.id); close(); }} hint={p.id === ME ? 'Me' : p.role}>{p.name}</MenuItem>)}
                {conv.assignee ? <MenuItem icon="user-x" onClick={() => { act.assign(''); close(); }}>Unassign</MenuItem> : null}
              </>
            )}
          </Menu>
          <Menu label="Tags" button={({ toggle, open }) => <button type="button" className="gc-iconbtn th-hide-xs" aria-expanded={open} onClick={toggle} aria-label="Tags" title="Tags"><Icon name="tag" width="18" height="18" /></button>}>
            {(close) => <TagMenu tags={tags} on={conv.tags || []} onToggle={act.toggleTag} onAdd={(n) => { act.addTag(n); close(); }} />}
          </Menu>
          <Menu label="Snooze" button={({ toggle, open }) => <button type="button" className="gc-iconbtn th-hide-xs" aria-expanded={open} onClick={toggle} aria-label="Snooze" title="Snooze"><Icon name="alarm-clock" width="18" height="18" /></button>}>
            {(close) => (
              <>
                <p className="ib-menu__head">Snooze until</p>
                {snoozeChoices(now || Date.now()).map(([label, t]) => <MenuItem key={label} onClick={() => { act.snooze(t); close(); }} hint={clock(t)}>{label}</MenuItem>)}
                <MenuItem icon="calendar-clock" onClick={() => { act.snoozeCustom(); close(); }}>Pick a date and time…</MenuItem>
                {status === 'snoozed' ? <MenuItem icon="bell-ring" onClick={() => { act.unsnooze(); close(); }}>Unsnooze now</MenuItem> : null}
              </>
            )}
          </Menu>
          {status === 'closed'
            ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={act.reopen}><Icon name="rotate-ccw" width="16" height="16" aria-hidden="true" /><span className="th-lbl">Reopen</span></button>
            : <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={act.close}><Icon name="check" width="16" height="16" aria-hidden="true" /><span className="th-lbl">Close</span></button>}
          <Menu label="More actions" button={({ toggle, open }) => <button type="button" className="gc-iconbtn" aria-expanded={open} onClick={toggle} aria-label="More actions" title="More actions"><Icon name="more-vertical" width="18" height="18" /></button>}>
            {(close) => (
              <>
                <span className="th-only-xs">
                  <MenuItem icon="alarm-clock" onClick={() => { act.snooze(snoozeChoices(Date.now())[2][1]); close(); }}>Snooze until tomorrow</MenuItem>
                  <MenuItem icon="tag" onClick={() => { close(); act.openPanel(); }}>Tags and details</MenuItem>
                </span>
                <MenuItem icon="mail" onClick={() => { act.markUnread(); close(); }}>Mark as unread</MenuItem>
                {status !== 'pending' ? <MenuItem icon="hourglass" onClick={() => { act.pending(); close(); }}>Set to pending</MenuItem> : null}
                <MenuItem icon="merge" onClick={() => { act.merge(); close(); }}>Merge duplicate contact…</MenuItem>
                {conv.phone ? <Link className="gc-dropdown__item" role="menuitem" href={`/merchant-calls?dial=${conv.phone}&name=${encodeURIComponent(conv.name)}`}><Icon name="phone" width="16" height="16" aria-hidden="true" />Call {conv.phone}</Link> : null}
                <Link className="gc-dropdown__item" role="menuitem" href={'/new-order' + q}><Icon name="shopping-bag" width="16" height="16" aria-hidden="true" />Create an order</Link>
                <hr className="gc-dropdown__divider" />
                {conv.blocked
                  ? <MenuItem icon="shield-check" onClick={() => { act.unblock(); close(); }}>Unblock</MenuItem>
                  : <MenuItem icon="ban" danger onClick={() => { close(); act.block(); }}>Block {conv.name}</MenuItem>}
              </>
            )}
          </Menu>
          <button type="button" className={'gc-iconbtn th-panelbtn' + (panelOpen ? ' gc-iconbtn--active' : '')} onClick={onTogglePanel} aria-label={panelOpen ? 'Hide customer details' : 'Show customer details'} aria-pressed={panelOpen} title="Customer details"><Icon name="panel-right" width="18" height="18" /></button>
        </div>
      </header>

      <div className="th-scrollwrap">
        <div className="th-msgs" ref={scroller} onScroll={onScroll} role="log" aria-label={`Messages with ${conv.name}`} aria-live="polite">
          {conv.messages.length ? conv.messages.map((m, i) => {
            const prev = conv.messages[i - 1], next = conv.messages[i + 1];
            const newDay = !prev || !sameDay(prev.at, m.at);
            const joins = (a, b) => a && b && a.from === b.from && a.by === b.by && Math.abs(b.at - a.at) < GAP && sameDay(a.at, b.at);
            return (
              <React.Fragment key={m.id}>
                {newDay ? <div className="th-day" role="separator"><span>{dayLabel(m.at, now || Date.now())}</span></div> : null}
                <Message m={m} conv={conv} orders={orders} first={!joins(prev, m) || newDay} last={!joins(m, next)} onPhoto={setPhoto} />
              </React.Fragment>
            );
          }) : <EmptyState icon="message-square-dashed" title="No messages yet" body="Say hello — your first reply starts the conversation." />}
          {typing ? (
            <div className="th-row th-row--in th-first">
              <Avatar name={conv.name} avatar={conv.avatar} pos={conv.pos} size={28} />
              <div className="th-bubble th-typing" aria-label={`${conv.name} is typing`}><i /><i /><i /></div>
            </div>
          ) : null}
        </div>
        {showJump || fresh ? (
          <button type="button" className="th-jump" onClick={jump}><Icon name="arrow-down" width="16" height="16" aria-hidden="true" />{fresh ? `${fresh} new` : 'Jump to latest'}</button>
        ) : null}
      </div>

      <Composer conv={conv} status={status} replies={replies} orders={mineOrders} onSend={act.send} onUnblock={act.unblock} onSystem={act.system} newOrderHref={'/new-order' + q} />
      <Lightbox src={photo} onClose={() => setPhoto('')} />
    </>
  );
}

// ---- one message ----------------------------------------------------------------------------------
function Ticks({ status }) {
  if (status === 'read') return <span className="th-tick th-tick--read" title="Seen"><Icon name="check-check" width="14" height="14" aria-hidden="true" /><span className="sr-only">Seen</span></span>;
  if (status === 'delivered') return <span className="th-tick" title="Delivered"><Icon name="check-check" width="14" height="14" aria-hidden="true" /><span className="sr-only">Delivered</span></span>;
  return <span className="th-tick" title="Sent"><Icon name="check" width="14" height="14" aria-hidden="true" /><span className="sr-only">Sent</span></span>;
}

function Message({ m, conv, orders, first, last, onPhoto }) {
  if (m.from === 'system') {
    return <div className="th-sys"><Icon name={m.icon || 'info'} width="14" height="14" aria-hidden="true" /><span>{m.text}</span><span className="th-sys__time">{clock(m.at)}</span></div>;
  }
  if (m.from === 'note') {
    return (
      <div className={'th-note' + (first ? ' th-first' : '')}>
        <p className="th-note__label"><Icon name="lock" width="12" height="12" aria-hidden="true" />Internal note · only your team sees this</p>
        <p className="th-note__text">{m.text}</p>
        <p className="th-meta">{staffName(m.by)} · {clock(m.at)}</p>
      </div>
    );
  }
  const out = m.from === 'agent';
  const body = (() => {
    if (m.type === 'image') return <div className="th-media"><button type="button" className="th-img" onClick={() => onPhoto(m.img)} aria-label="Open photo"><img src={m.img} alt="" /></button>{m.text ? <p className="th-bubble th-caption">{m.text}</p> : null}</div>;
    if (m.type === 'voice') return <VoiceNote dur={m.dur} out={out} />;
    if (m.type === 'product') return <ProductCard sku={m.sku} />;
    if (m.type === 'order') return <OrderCard id={m.order} orders={orders} />;
    if (m.type === 'payment') return <PaymentCard m={m} />;
    return <p className="th-bubble">{m.text}</p>;
  })();
  return (
    <div className={'th-row th-row--' + (out ? 'out' : 'in') + (first ? ' th-first' : '')}>
      {out ? null : last ? <Avatar name={conv.name} avatar={conv.avatar} pos={conv.pos} size={28} /> : <span className="th-spacer" aria-hidden="true" />}
      <div className="th-stack">
        {body}
        {last ? (
          <p className="th-meta">
            {out ? <span>{staffName(m.by)}</span> : null}
            <time dateTime={new Date(m.at).toISOString()}>{clock(m.at)}</time>
            {m.via ? <span>· {m.via === 'comment' ? 'from a comment' : 'via ' + channelName(m.via)}</span> : null}
            {out ? <Ticks status={m.status} /> : null}
          </p>
        ) : null}
      </div>
    </div>
  );
}

const BARS = [8, 14, 20, 12, 22, 16, 10, 18, 24, 14, 8, 16, 20, 12, 18, 10, 14, 22, 16, 8, 12, 18, 14, 10];
function VoiceNote({ dur = 10, out }) {
  const [pos, setPos] = useState(0);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on) return undefined;
    const id = window.setInterval(() => setPos((p) => { if (p + 0.25 >= dur) { setOn(false); return 0; } return p + 0.25; }), 250);
    return () => window.clearInterval(id);
  }, [on, dur]);
  const done = pos / dur;
  return (
    <div className={'th-bubble th-voice' + (out ? ' th-voice--out' : '')}>
      <button type="button" className="th-voice__btn" onClick={() => setOn((v) => !v)} aria-label={on ? 'Pause voice message' : 'Play voice message'}><Icon name={on ? 'pause' : 'play'} width="16" height="16" /></button>
      <span className="th-voice__bars" aria-hidden="true">{BARS.map((h, i) => <i key={i} style={{ height: h }} className={i / BARS.length < done ? 'is-on' : ''} />)}</span>
      <span className="th-voice__time ib-data">{fmtDur(on || pos ? pos : dur)}</span>
    </div>
  );
}

function ProductCard({ sku }) {
  const p = productBy(sku);
  if (!p) return <p className="th-bubble">Product {sku} is no longer in the catalogue.</p>;
  const free = stockAt(p.sku, '').available;
  return (
    <div className="th-card">
      <div className="th-card__row">
        <span className="th-card__tile"><Icon name={catIcon(p.cat)} width="22" height="22" aria-hidden="true" /></span>
        <span className="th-card__text">
          <span className="th-card__title">{p.name}</span>
          <span className="ib-sub"><span className="ib-data">{p.sku}</span>{p.variant ? ' · ' + p.variant : ''}</span>
        </span>
      </div>
      <div className="th-card__foot"><span className="ib-price">{formatBDT(p.price)}</span><span className={'gc-badge gc-badge--' + (free ? 'success' : 'error')}>{free ? `${free} in stock` : 'Out of stock'}</span></div>
    </div>
  );
}

function OrderCard({ id, orders }) {
  const o = orders.find((x) => x.id === id);
  return (
    <div className="th-card">
      <div className="th-card__row">
        <span className="th-card__tile"><Icon name="shopping-bag" width="22" height="22" aria-hidden="true" /></span>
        <span className="th-card__text">
          <span className="th-card__title">Order <Link className="ib-link ib-data" href={orderHref(id, 'inbox')}>{id}</Link></span>
          <span className="ib-sub">{o ? `${o.itemTitle} · ${o.units} item${o.units === 1 ? '' : 's'}` : 'Order details are on the order page'}</span>
        </span>
      </div>
      {o ? <div className="th-card__foot"><span className="ib-price">{o.total}</span><StatusBadge tone={orderTone(o)}>{o.status}</StatusBadge></div> : null}
    </div>
  );
}

function PaymentCard({ m }) {
  return (
    <div className="th-card">
      <div className="th-card__row">
        <BrandLogo brand={m.method} size={40} decorative />
        <span className="th-card__text">
          <span className="th-card__title">Payment request{m.order ? ' · ' + m.order : ''}</span>
          <span className="ib-sub ib-data th-trunc">{m.link}</span>
        </span>
      </div>
      {m.note ? <p className="th-card__note">{m.note}</p> : null}
      <div className="th-card__foot"><span className="ib-price">{formatBDT(m.amount)}</span><span className="gc-badge gc-badge--warning">Waiting · {METHOD[m.method] || 'Online'}</span></div>
    </div>
  );
}

// ---- composer ---------------------------------------------------------------------------------------
function Composer({ conv, status, replies, orders, onSend, onUnblock, onSystem, newOrderHref }) {
  const [mode, setMode] = useState('reply');
  const [text, setText] = useState('');
  const [img, setImg] = useState('');
  const [lang, setLang] = useState('en');
  const [pick, setPick] = useState(0);
  const [dlg, setDlg] = useState('');
  const drafts = useRef({});
  const ta = useRef(null);
  const file = useRef(null);
  useEffect(() => { setText(drafts.current[conv.id] || ''); setImg(''); setMode('reply'); }, [conv.id]);
  useEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 168) + 'px';
  }, [text]);
  const setDraft = (v) => { setText(v); drafts.current[conv.id] = v; };
  const ctx = { name: conv.name, order: orders[0] ? orders[0].id : '' };

  const slash = /^\/(\S*)$/.exec(text);
  const slashList = slash ? replies.filter((r) => (r.short + ' ' + r.title).toLowerCase().includes(slash[1].toLowerCase())).slice(0, 6) : [];
  useEffect(() => { setPick(0); }, [slash && slash[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  const focus = () => window.requestAnimationFrame(() => { if (ta.current) { ta.current.focus(); const n = ta.current.value.length; ta.current.setSelectionRange(n, n); } });
  const applyReply = (r) => { setDraft(fillReply(r.body, ctx)); countReplyUse(r.id); focus(); };
  const insert = (s) => {
    const el = ta.current;
    const a = el ? el.selectionStart : text.length, b = el ? el.selectionEnd : text.length;
    setDraft(text.slice(0, a) + s + text.slice(b));
    window.requestAnimationFrame(() => { if (el) { el.focus(); el.setSelectionRange(a + s.length, a + s.length); } });
  };

  const submit = () => {
    const body = text.trim();
    if (!body && !img) { focus(); return; }
    if (mode === 'note') onSend([{ from: 'note', by: ME, type: 'text', text: body }]);
    else if (img) onSend([{ from: 'agent', by: ME, type: 'image', img, text: body, status: 'sent' }]);
    else onSend([{ from: 'agent', by: ME, type: 'text', text: body, status: 'sent' }]);
    setDraft(''); setImg('');
    focus();
  };
  const onKey = (e) => {
    if (slashList.length) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setPick((p) => (p + 1) % slashList.length); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setPick((p) => (p - 1 + slashList.length) % slashList.length); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); applyReply(slashList[Math.min(pick, slashList.length - 1)]); return; }
      if (e.key === 'Escape') { e.preventDefault(); setDraft(''); return; }
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); }
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
        focus();
      };
      im.src = reader.result;
    };
    reader.readAsDataURL(f);
  };
  const sendProduct = (p) => { onSend([{ from: 'agent', by: ME, type: 'product', sku: p.sku, status: 'sent' }]); setDlg(''); toast(`Product card sent · ${p.name}`); };
  const sendPayment = ({ amount, order, method, note }) => {
    const link = 'pay.gridcommerce.app/p/' + Math.random().toString(36).slice(2, 8).toUpperCase();
    onSend([{ from: 'agent', by: ME, type: 'payment', amount, order, method, note, link, status: 'sent' }]);
    setDlg('');
    toast(`Payment link for ${formatBDT(amount)} sent`);
  };

  if (conv.blocked) {
    return (
      <div className="th-composer th-composer--blocked">
        <Icon name="ban" width="18" height="18" aria-hidden="true" />
        <p>You blocked {conv.name}. They can’t message the shop and you can’t reply.</p>
        <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={onUnblock}>Unblock</button>
      </div>
    );
  }
  const quick = replies.filter((r) => r.lang === lang).sort((a, b) => (b.uses || 0) - (a.uses || 0)).slice(0, 4);
  const suggest = suggestions(conv, guessPrice(conv));
  const note = mode === 'note';

  return (
    <div className={'th-composer' + (note ? ' is-note' : '')}>
      {status === 'closed' ? <p className="th-banner"><Icon name="info" width="14" height="14" aria-hidden="true" />This conversation is closed. Sending a reply opens it again.</p> : null}
      {!text && !note ? (
        <div className="th-chips ib-scroll-x" aria-label="Quick replies">
          {suggest.map((s, i) => <button key={i} type="button" className="ib-chip th-chip th-chip--ai" onClick={() => { setDraft(s); focus(); }} title={s}><Icon name="sparkles" width="14" height="14" aria-hidden="true" /><span>{s}</span></button>)}
          <span className="th-chips__sep" aria-hidden="true" />
          <button type="button" className="ib-chip th-chip th-lang" onClick={() => setLang(lang === 'en' ? 'bn' : 'en')} aria-label={lang === 'en' ? 'Show Bangla quick replies' : 'Show English quick replies'}><Icon name="languages" width="14" height="14" aria-hidden="true" />{lang === 'en' ? 'EN' : 'বাংলা'}</button>
          {quick.map((r) => <button key={r.id} type="button" className={'ib-chip th-chip' + (r.lang === 'bn' ? ' ib-bn' : '')} onClick={() => applyReply(r)} title={r.body}><span>{r.title}</span></button>)}
        </div>
      ) : null}
      <div className="th-box">
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
        ) : slash ? <p className="th-slash th-slash--empty">No saved reply matches “/{slash[1]}”. <button type="button" className="ib-link th-linkbtn" onClick={() => setDlg('replies')}>Manage saved replies</button></p> : null}
        <div className="th-mode">
          <div className="th-tabs" role="tablist" aria-label="Message type">
            <button type="button" role="tab" aria-selected={!note} onClick={() => setMode('reply')}>Reply</button>
            <button type="button" role="tab" aria-selected={note} onClick={() => { setMode('note'); setImg(''); }}><Icon name="lock" width="12" height="12" aria-hidden="true" />Internal note</button>
          </div>
          <span className="th-window">{note ? 'Only your team sees notes' : (CHANNELS[conv.ch] || {}).window}</span>
        </div>
        {img ? (
          <div className="th-attach">
            <img src={img} alt="Photo to send" />
            <span className="ib-sub">Photo ready · add a caption or press Send</span>
            <button type="button" className="gc-iconbtn" aria-label="Remove photo" onClick={() => setImg('')}><Icon name="x" width="16" height="16" /></button>
          </div>
        ) : null}
        <textarea ref={ta} className="th-input" rows="1" value={text} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKey}
          placeholder={note ? 'Note for your team — the customer will not see this' : `Reply to ${conv.name} · type / for saved replies`}
          aria-label={note ? `Internal note about ${conv.name}` : `Reply to ${conv.name}`} />
        <div className="th-tools">
          <div className="th-tools__icons ib-scroll-x">
            <Menu label="Emoji" up align="left" button={({ toggle, open }) => <button type="button" className="gc-iconbtn" aria-expanded={open} onClick={toggle} aria-label="Emoji" title="Emoji"><Icon name="smile" width="18" height="18" /></button>}>
              {(close) => <div className="th-emoji">{EMOJI.map((e) => <button key={e} type="button" onClick={() => { insert(e); close(); }} aria-label={'Insert ' + e}>{e}</button>)}</div>}
            </Menu>
            <button type="button" className="gc-iconbtn" onClick={() => setDlg('replies')} aria-label="Saved replies" title="Saved replies (type /)"><Icon name="zap" width="18" height="18" /></button>
            {!note ? <>
              <button type="button" className="gc-iconbtn" onClick={() => file.current && file.current.click()} aria-label="Attach a photo" title="Attach a photo"><Icon name="image" width="18" height="18" /></button>
              <input ref={file} type="file" accept="image/*" hidden onChange={pickImage} />
              <button type="button" className="gc-iconbtn" onClick={() => setDlg('product')} aria-label="Send a product card" title="Send a product card"><Icon name="package" width="18" height="18" /></button>
              <button type="button" className="gc-iconbtn" onClick={() => setDlg('payment')} aria-label="Send a payment link" title="Send a payment link"><Icon name="credit-card" width="18" height="18" /></button>
              <Link className="gc-iconbtn" href={newOrderHref} onClick={() => onSystem('shopping-bag', `${staffName(ME)} started a new order for this customer`)} aria-label="Create an order from this chat" title="Create an order from this chat"><Icon name="shopping-bag" width="18" height="18" /></Link>
            </> : null}
          </div>
          <span className="th-hint" aria-hidden="true">Enter to send · Shift+Enter new line</span>
          <button type="button" className={'gc-btn gc-btn--solid th-send' + (note ? ' th-send--note' : '')} onClick={submit} disabled={!text.trim() && !img}>
            <Icon name={note ? 'sticky-note' : 'send'} width="16" height="16" aria-hidden="true" /><span className="th-lbl">{note ? 'Add note' : 'Send'}</span>
          </button>
        </div>
      </div>

      <SavedRepliesDialog open={dlg === 'replies'} onClose={() => setDlg('')} onUse={applyReply} />
      <ProductDialog open={dlg === 'product'} onClose={() => setDlg('')} onSend={sendProduct} />
      <PaymentDialog open={dlg === 'payment'} onClose={() => setDlg('')} onSend={sendPayment} orders={orders} />
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
.th-assign{gap:var(--space-1-5);padding:0 var(--space-2) 0 var(--space-1-5)}
.th-only-xs{display:none}
.th-scrollwrap{position:relative;flex:1;min-height:0;display:flex}
.th-msgs{flex:1;min-width:0;overflow-y:auto;overscroll-behavior:contain;display:flex;flex-direction:column;gap:var(--space-1);padding:var(--space-5) var(--space-6) var(--space-6)}
.th-day{display:flex;align-items:center;gap:var(--space-3);margin:var(--space-4) 0 var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.th-day:first-child{margin-top:0}
.th-day::before,.th-day::after{content:"";flex:1;height:1px;background:var(--border-subtle)}
.th-row{display:flex;align-items:flex-end;gap:var(--space-2);max-width:min(80%,560px)}
.th-row.th-first,.th-note.th-first{margin-top:var(--space-2-5)}
.th-row--out{align-self:flex-end;flex-direction:row-reverse}
.th-spacer{flex:none;width:28px}
.th-stack{min-width:0;display:flex;flex-direction:column;gap:var(--space-1)}
.th-row--out .th-stack{align-items:flex-end}
.th-bubble{margin:0;padding:var(--space-2-5) var(--space-3-5);border-radius:var(--radius-xl);font-size:var(--text-sm);line-height:var(--text-sm-lh);white-space:pre-wrap;overflow-wrap:anywhere}
.th-row--in .th-bubble{background:var(--surface-card);border:1px solid var(--border-subtle);color:var(--text-heading);border-bottom-left-radius:var(--radius-sm)}
.th-row--out .th-bubble{background:var(--primary);color:var(--text-inverse);border-bottom-right-radius:var(--radius-sm)}
.th-meta{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-1-5);margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.th-tick{display:inline-flex;color:var(--text-muted)}
.th-tick--read{color:var(--accent-text)}
.th-media{display:flex;flex-direction:column;gap:var(--space-1)}
.th-row--out .th-media{align-items:flex-end}
.th-img{display:block;padding:0;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-subtle);overflow:hidden;cursor:zoom-in}
.th-img img{display:block;width:min(260px,60vw);max-height:260px;object-fit:cover}
.th-caption{max-width:260px}
.th-card{width:min(300px,68vw);overflow:hidden;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-soft)}
.th-card__row{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3)}
.th-card__tile{display:grid;place-items:center;flex:none;width:44px;height:44px;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.th-card__text{min-width:0;display:flex;flex-direction:column}
.th-card__title{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.th-card__note{margin:0;padding:0 var(--space-3) var(--space-2);font-size:var(--text-sm);color:var(--text-body)}
.th-card__foot{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-top:1px solid var(--border-subtle);background:var(--surface-page)}
.th-trunc{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.th-voice{display:flex;align-items:center;gap:var(--space-2-5);padding:var(--space-2) var(--space-3) var(--space-2) var(--space-2)}
.th-voice__btn{display:grid;place-items:center;flex:none;width:32px;height:32px;border:0;border-radius:var(--radius-full);background:var(--primary);color:var(--text-inverse);cursor:pointer}
.th-voice--out .th-voice__btn{background:var(--surface-card);color:var(--primary)}
.th-voice__bars{display:flex;align-items:center;gap:2px;height:24px}
.th-voice__bars i{display:block;width:3px;border-radius:var(--radius-full);background:var(--border-strong)}
.th-voice__bars i.is-on{background:var(--primary)}
.th-voice--out .th-voice__bars i{background:color-mix(in srgb,var(--text-inverse) 45%,transparent)}
.th-voice--out .th-voice__bars i.is-on{background:var(--text-inverse)}
.th-voice__time{font-size:var(--text-xs);min-width:30px}
.th-note{align-self:flex-end;max-width:min(80%,560px);padding:var(--space-2-5) var(--space-3-5);border:1px dashed color-mix(in srgb,var(--warning) 60%,transparent);border-radius:var(--radius-xl);background:var(--fill-warning-soft)}
.th-note__label{display:flex;align-items:center;gap:var(--space-1);margin:0 0 var(--space-1);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-warning)}
.th-note__text{margin:0 0 var(--space-1);font-size:var(--text-sm);line-height:var(--text-sm-lh);color:var(--text-heading);white-space:pre-wrap;overflow-wrap:anywhere}
.th-sys{align-self:center;display:inline-flex;align-items:center;gap:var(--space-1-5);max-width:92%;margin:var(--space-2-5) 0 var(--space-1);padding:var(--space-1) var(--space-3);border-radius:var(--radius-full);background:var(--surface-quiet);font-size:var(--text-xs);color:var(--text-body);text-align:center}
.th-sys svg{flex:none;color:var(--text-muted)}
.th-sys__time{flex:none;color:var(--text-muted)}
.th-typing{display:flex;align-items:center;gap:4px;padding:var(--space-3) var(--space-3-5)}
.th-typing i{width:6px;height:6px;border-radius:var(--radius-full);background:var(--text-muted);animation:th-bounce 1.2s infinite ease-in-out}
.th-typing i:nth-child(2){animation-delay:.15s}.th-typing i:nth-child(3){animation-delay:.3s}
@keyframes th-bounce{0%,60%,100%{transform:none;opacity:.5}30%{transform:translateY(-4px);opacity:1}}
@media (prefers-reduced-motion:reduce){.th-typing i{animation:none}}
.th-jump{position:absolute;right:var(--space-5);bottom:var(--space-4);display:inline-flex;align-items:center;gap:var(--space-1-5);height:36px;padding:0 var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);color:var(--primary);font-size:var(--text-xs);font-weight:var(--weight-medium);box-shadow:var(--shadow-lg);cursor:pointer}
.th-composer{flex:none;display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-2) var(--space-4) var(--space-4);border-top:1px solid var(--border-subtle);background:var(--surface-card)}
.th-composer--blocked{flex-direction:row;align-items:center;gap:var(--space-3);padding:var(--space-4);color:var(--text-danger)}
.th-composer--blocked p{flex:1;margin:0;font-size:var(--text-sm);color:var(--text-body)}
.th-banner{display:flex;align-items:center;gap:var(--space-1-5);margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.th-chips{align-items:center;padding-top:var(--space-1)}
.th-chip{height:30px;max-width:280px}
.th-chip span{overflow:hidden;text-overflow:ellipsis}
.th-chip--ai{border-color:color-mix(in srgb,var(--accent) 35%,transparent);background:var(--fill-accent-soft);color:var(--accent-text)}
.th-chip--ai:hover{color:var(--accent-text);border-color:var(--accent)}
.th-chips__sep{flex:none;width:1px;height:20px;background:var(--border-subtle)}
.th-lang{color:var(--text-heading)}
.th-box{position:relative;border:1px solid var(--border-field);border-radius:var(--radius-xl);background:var(--surface-card);transition:var(--transition-colors)}
.th-box:focus-within{border-color:var(--border-field-focus)}
.is-note .th-box{border-color:color-mix(in srgb,var(--warning) 60%,transparent);background:var(--fill-warning-soft)}
.th-mode{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-1-5) var(--space-2) 0}
.th-tabs{display:flex;gap:2px}
.th-tabs button{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 var(--space-2-5);border:0;border-radius:var(--radius-full);background:none;color:var(--text-muted);font-size:var(--text-xs);font-weight:var(--weight-medium);cursor:pointer}
.th-tabs button:hover{color:var(--text-heading)}
.th-tabs button[aria-selected="true"]{background:var(--surface-quiet);color:var(--text-heading)}
.is-note .th-tabs button[aria-selected="true"]{background:color-mix(in srgb,var(--warning) 22%,transparent);color:var(--text-warning)}
.th-window{min-width:0;margin-left:auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-xs);color:var(--text-muted)}
.th-attach{display:flex;align-items:center;gap:var(--space-3);margin:var(--space-2) var(--space-3) 0;padding:var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-page)}
.th-attach img{width:48px;height:48px;flex:none;border-radius:var(--radius-md);object-fit:cover}
.th-attach .ib-sub{flex:1;min-width:0}
.th-input{display:block;width:100%;min-height:44px;max-height:168px;margin:0;padding:var(--space-2-5) var(--space-3-5);border:0;background:none;color:var(--text-heading);font-size:var(--text-sm);line-height:var(--text-sm-lh);resize:none;outline:none}
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
@container (max-width:640px){
  .th-lbl,.th-hint,.th-window{display:none}
  .th-send{width:44px;padding:0}
  .th-msgs{padding:var(--space-4) var(--space-4) var(--space-5)}
  .th-row,.th-note{max-width:88%}
}
@container (max-width:420px){
  .th-hide-xs{display:none}
  .th-only-xs{display:block}
  .th-head{padding-left:var(--space-2)}
  .th-assign .ib-staff+.th-lbl{display:none}
  .th-composer{padding:var(--space-2) var(--space-3) var(--space-3)}
}
`;
