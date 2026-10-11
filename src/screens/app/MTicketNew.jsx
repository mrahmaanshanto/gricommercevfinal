'use client';
// Merchant app · New ticket (/m-ticket-new). The design board's layout (design/templates/app/MTicketNew.dc.html):
//   Customer      search the shop's customers (lib/customers.js), people who ordered (lib/orders.js) and Inbox chats
//                 (lib/inbox.js) by name or phone, or type a new name and number
//   What is it about?  Change an order · Refund · Delivery · Product question · Complaint
//   Order         one of the customer's orders (optional)
//   Details · Priority · Assign to (Me, the desk, Nobody yet) · files by name
//   Create ticket → lib/supportTickets.addTicket → the ticket (/m-ticket-detail?id=)
// Opened from a call or a chat it comes filled in: ?name=&phone=&order=&ch=&from=call (the green note says the
// recording will be attached).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AppScreen, Content, ActionBar, Button, Field, TextInput, Icon, Note, useAppData, useQuery, toast, money, initials,
} from './kit/AppKit';
import { addTicket, TOPICS, PRIORITIES, PRIORITY_MARK, deskPeople, meName, chName, CHANNELS } from '@/lib/supportTickets';
import { FileChips, AttachButton } from './support/ticketParts';
import { getOrders } from '@/lib/orders';
import { getCustomers, phoneDigits, showPhone } from '@/lib/customers';
import { getConvs } from '@/lib/inbox';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const CSS = `[data-screen="MTicketNew"] .pick{display:flex;align-items:center;gap:10px;width:100%;padding:10px 14px;border:0;border-top:1px solid var(--line);background:none;font:inherit;color:var(--ink);text-align:left;cursor:pointer}
[data-screen="MTicketNew"] .pick:first-child{border-top:0}
[data-screen="MTicketNew"] .inp select{appearance:none;-webkit-appearance:none;cursor:pointer}
[data-screen="MTicketNew"] .wrapchips{display:flex;gap:8px;flex-wrap:wrap}`;

/** Everyone the shop can make a ticket for: customers, people who ordered and Inbox chats, one row per phone. */
function people() {
  const map = new Map();
  const add = (name, phone, ch, img) => {
    const key = phoneDigits(phone) || String(name || '').toLowerCase();
    if (!name || !key || map.has(key)) return;
    map.set(key, { name, phone: phone ? showPhone(phone) : '', ch, img: img || '' });
  };
  safe(() => getConvs(), []).forEach((c) => add(c.name, c.phone, c.ch, c.avatar));
  safe(() => getCustomers(), []).forEach((c) => add(c.name, c.phone, 'phone'));
  safe(() => getOrders(), []).filter((o) => o.customer && o.customer !== 'Walk-in customer').forEach((o) => add(o.customer, o.phone, 'phone'));
  return [...map.values()];
}

export default function MTicketNewScreen() {
  const router = useRouter();
  const query = useQuery();
  const { ready } = useAppData();
  const [who, setWho] = useState(null);           // { name, phone, ch, img }
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState('Change an order');
  const [order, setOrder] = useState('');
  const [details, setDetails] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [owner, setOwner] = useState('');
  const [files, setFiles] = useState([]);
  const [fromCall, setFromCall] = useState(false);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);

  // filled in from a call or a chat
  useEffect(() => {
    if (!query || !ready) return;
    setOwner(meName());
    const name = query.get('name');
    if (name) setWho({ name, phone: query.get('phone') || '', ch: CHANNELS.includes(query.get('ch')) ? query.get('ch') : 'phone', img: '' });
    if (query.get('order')) setOrder(query.get('order'));
    if (query.get('from') === 'call') { setFromCall(true); setPriority('High'); }
    if (query.get('topic') && TOPICS.includes(query.get('topic'))) setTopic(query.get('topic'));
  }, [query, ready]);

  const all = useMemo(() => (ready ? people() : []), [ready]);
  const found = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return [];
    const d = n.replace(/[^0-9]/g, '');
    return all.filter((p) => p.name.toLowerCase().includes(n) || (d.length >= 3 && phoneDigits(p.phone).includes(d))).slice(0, 5);
  }, [all, q]);
  const theirOrders = useMemo(() => {
    if (!ready || !who || !who.phone) return [];
    const d = phoneDigits(who.phone);
    return safe(() => getOrders().filter((o) => phoneDigits(o.phone) === d).sort((a, b) => b.at - a.at).slice(0, 8), []);
  }, [ready, who]);
  const desk = ready ? deskPeople() : [];
  const me = ready ? meName() : '';

  const pickNew = () => {
    const t = q.trim();
    const digits = t.replace(/[^0-9]/g, '');
    if (!t) return;
    setWho(digits.length >= 10 ? { name: 'New customer', phone: showPhone(digits), ch: 'phone', img: '' } : { name: t, phone: '', ch: 'phone', img: '' });
    setQ('');
  };
  const create = () => {
    if (busy) return;
    const res = addTicket({ customer: who ? who.name : '', phone: who ? who.phone : '', ch: fromCall ? 'phone' : who ? who.ch : 'phone', img: who ? who.img : '', topic, order, details, priority, assignee: owner, files, fromCall });
    if (!res.ok) { setErrs({ [res.field || 'details']: res.error }); toast(res.error, { tone: 'error' }); return; }
    setBusy(true);
    toast('Ticket TKT-' + res.id + ' created');
    router.push('/m-ticket-detail?id=' + res.id);
  };

  return (
    <AppScreen name="MTicketNew" title="New ticket" css={CSS}>
      <header className="appbar">
        <Link href="/m-tickets" className="ib" aria-label="Close"><Icon name="x" size={24} stroke={2} /></Link>
        <h1>New ticket</h1>
        <span style={{ width: '44px' }} />
      </header>
      <Content top={103} bottom={98} pad gap={14} style={{ paddingTop: '2px' }}>
        {fromCall && who ? (
          <Note tone="ok" icon="phone">From the call with {who.name}. The recording will be attached.</Note>
        ) : null}

        <div className="field">
          <span className="lab" id="tn-cust">Customer</span>
          {who ? (
            <button type="button" className="inp" aria-labelledby="tn-cust" onClick={() => { setWho(null); setOrder(''); }} style={{ width: '100%', cursor: 'pointer', font: 'inherit', textAlign: 'left' }}>
              <span className="pav" style={{ width: '30px', height: '30px' }}>
                {who.img ? <img className="face" src={who.img} alt="" style={{ width: '30px', height: '30px' }} /> : <span className="face" style={{ width: '30px', height: '30px', background: '#fde7ef', color: '#003087', fontSize: 'var(--text-xs)' }}>{initials(who.name)}</span>}
              </span>
              <span className="ell" style={{ flex: '1' }}>{who.name}</span>
              <span className="num" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{who.phone || chName(who.ch)}</span>
              <Icon name="x" size={16} />
            </button>
          ) : (
            <>
              <span className={'inp' + (errs.customer ? ' f' : '')}>
                <Icon name="search" size={18} />
                <input value={q} onChange={(e) => { setQ(e.target.value); setErrs({}); }} placeholder="Name or phone number" aria-labelledby="tn-cust" autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (found[0]) { setWho(found[0]); setQ(''); } else pickNew(); } }} />
              </span>
              {q.trim() ? (
                <div className="card" style={{ overflow: 'hidden' }}>
                  {found.map((p) => (
                    <button key={p.name + p.phone} type="button" className="pick" onClick={() => { setWho(p); setQ(''); }}>
                      <span className="ell" style={{ flex: '1', fontWeight: 'var(--weight-medium)' }}>{p.name}</span>
                      <span className="num" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{p.phone || chName(p.ch)}</span>
                    </button>
                  ))}
                  <button type="button" className="pick" onClick={pickNew} style={{ color: 'var(--brand)' }}><Icon name="plus" size={18} />Use “{q.trim()}”</button>
                </div>
              ) : null}
              {errs.customer ? <span className="help" style={{ color: 'var(--err)' }} role="alert">{errs.customer}</span> : null}
            </>
          )}
        </div>

        <div className="field">
          <span className="lab">What is it about?</span>
          <div className="wrapchips" role="radiogroup" aria-label="What is it about?">
            {TOPICS.map((x) => <button key={x} type="button" role="radio" aria-checked={topic === x} className={'chip' + (topic === x ? ' on' : '')} onClick={() => setTopic(x)}>{x}</button>)}
          </div>
        </div>

        {who && (theirOrders.length || order) ? (
          <Field label="Order">
            <span className="inp">
              <select value={order} onChange={(e) => setOrder(e.target.value)} className="mono" style={{ fontSize: 'var(--text-sm-plus)' }}>
                <option value="">No order</option>
                {order && !theirOrders.some((o) => o.id === order) ? <option value={order}>{order}</option> : null}
                {theirOrders.map((o) => <option key={o.id} value={o.id}>{o.id} · {money(o.amount)}</option>)}
              </select>
              <Icon name="down" size={18} />
            </span>
          </Field>
        ) : null}

        <Field label="Details" error={errs.details}>
          <TextInput multiline value={details} onChange={(v) => { setDetails(v); setErrs({}); }} placeholder="What does the customer need?" />
        </Field>

        <div className="field">
          <span className="lab">Priority</span>
          <div className="seg" style={{ margin: '0' }} role="radiogroup" aria-label="Priority">
            {PRIORITIES.map((p) => (
              <button key={p} type="button" role="radio" aria-checked={priority === p} className={priority === p ? 'on' : ''} onClick={() => setPriority(p)} style={priority === p && (p === 'Urgent' || p === 'High') ? { color: PRIORITY_MARK[p][0] } : undefined}>{p}</button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="lab">Assign to</span>
          <div className="wrapchips" role="radiogroup" aria-label="Assign to">
            {[{ key: me, label: 'Me' }, ...desk.filter((p) => p.first !== me).map((p) => ({ key: p.first, label: p.first })), { key: '', label: 'Nobody yet' }].map((x) => (
              <button key={(x.key || 'none') + ':' + x.label} type="button" role="radio" aria-checked={owner === x.key} className={'chip' + (owner === x.key ? ' on' : '')} onClick={() => setOwner(x.key)}>{x.label}</button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="lab">Files</span>
          <span><AttachButton onAdd={(names) => setFiles((f) => [...f, ...names].slice(0, 5))} /></span>
          <FileChips files={files} onRemove={(i) => setFiles((f) => f.filter((_, j) => j !== i))} />
        </div>
      </Content>
      <ActionBar>
        <Button kind="primary" onClick={create} disabled={busy}>Create ticket</Button>
      </ActionBar>
    </AppScreen>
  );
}
