'use client';
// The customer panel beside a conversation: who they are (from the customer book by phone),
// lifetime value and orders (from the orders list by phone), tags, the team's note and every
// other conversation with the same person across channels.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { ChannelIcon, StatusBadge } from '@/components/ui';
import { formatBDT, formatDate } from '@/lib/format';
import { ORDER_STATUSES } from '@/lib/orderStatus';
import { orderHref } from '@/lib/orders';
import { findCustomer, saveCustomerOnce } from '@/lib/customers';
import { channelName, samePhone, lastAny, previewOf, ago, statusOf, tagTone } from '@/lib/inbox';
import { Avatar, Menu, MenuItem } from './parts';

const STATUS_WORD = { open: 'Open', pending: 'Pending', snoozed: 'Snoozed', closed: 'Closed' };
const orderTone = (o) => (ORDER_STATUSES.find((s) => s.key === o.statusKey) || { tone: 'neutral' }).tone;

export function CustomerPanel({ conv, convs, orders, customers, tags, now, onOpenConv, onPatch, onToggleTag, onAddTag, onSaved, onClose }) {
  const [note, setNote] = useState(conv.note || '');
  const [saving, setSaving] = useState(null);   // save-as-customer form
  useEffect(() => { setNote(conv.note || ''); setSaving(null); }, [conv.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const customer = conv.phone ? findCustomer(customers, conv.phone) : null;
  const mine = conv.phone ? orders.filter((o) => samePhone(o.phone, conv.phone)).sort((a, b) => b.at - a.at) : [];
  const counted = mine.filter((o) => o.statusKey !== 'cancelled');
  const ltv = counted.reduce((a, o) => a + o.amount, 0);
  const returns = mine.filter((o) => o.statusKey === 'returned').length;
  const history = convs.filter((c) => c.id !== conv.id && ((conv.phone && samePhone(c.phone, conv.phone)) || (conv.handle && c.handle === conv.handle)));
  const address = (customer && customer.address) || (mine[0] && mine[0].address) || '';
  const q = conv.phone ? `?phone=${encodeURIComponent(conv.phone)}&name=${encodeURIComponent(conv.name)}` : `?name=${encodeURIComponent(conv.name)}`;
  const channels = [{ ch: conv.ch, text: conv.handle || conv.phone || conv.name, primary: true }, ...(conv.links || []).map((l) => ({ ch: l.ch, text: l.handle })), ...history.map((c) => ({ ch: c.ch, text: c.handle || c.phone || c.name, id: c.id }))];

  const saveNote = () => { if (note !== (conv.note || '')) { onPatch({ note }); toast('Note saved'); } };
  const saveCustomer = (e) => {
    e.preventDefault();
    const row = saveCustomerOnce({ name: saving.name, phone: saving.phone, address: saving.address, types: ['Online'], addedFrom: 'Inbox' });
    if (!row) { toast('Enter an 11-digit mobile number, for example 01712345678', { tone: 'error' }); return; }
    if (!conv.phone) onPatch({ phone: row.phone });
    setSaving(null);
    onSaved();
    toast(`${row.name} saved as a customer`);
  };

  return (
    <div className="cp">
      <div className="cp-head">
        <Avatar name={conv.name} avatar={conv.avatar} pos={conv.pos} ch={conv.ch} size={48} />
        <div className="cp-head__text">
          <h2 className="ib-h2 cp-name">{customer ? customer.name : conv.name}</h2>
          <span className="ib-sub">{customer ? `${(customer.types || []).join(' · ')} customer${customer.signup ? ' · since ' + customer.signup : ''}` : conv.phone ? 'Not in the customer book yet' : 'No phone number yet'}</span>
        </div>
        {onClose ? <button type="button" className="gc-iconbtn cp-close" aria-label="Close customer details" onClick={onClose}><Icon name="x" width="18" height="18" /></button> : null}
      </div>

      <div className="cp-actions">
        {conv.phone ? <Link className="gc-btn gc-btn--sm gc-btn--neutral" href={`/merchant-calls?dial=${conv.phone}&name=${encodeURIComponent(conv.name)}`}><Icon name="phone" width="16" height="16" aria-hidden="true" />Call</Link> : null}
        <Link className="gc-btn gc-btn--sm gc-btn--neutral" href={'/new-order' + q}><Icon name="shopping-bag" width="16" height="16" aria-hidden="true" />New order</Link>
        {customer ? <Link className="gc-btn gc-btn--sm gc-btn--neutral" href={`/customer-profile?phone=${customer.phone}`}><Icon name="user-round" width="16" height="16" aria-hidden="true" />Profile</Link>
          : <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={() => setSaving({ name: conv.name.replace(/^@/, ''), phone: conv.phone, address: '' })}><Icon name="user-plus" width="16" height="16" aria-hidden="true" />Save customer</button>}
      </div>

      {saving ? (
        <form className="cp-save" onSubmit={saveCustomer}>
          <div><label className="gc-label" htmlFor="cp-name">Name</label><input id="cp-name" className="gc-input" value={saving.name} onChange={(e) => setSaving({ ...saving, name: e.target.value })} /></div>
          <div><label className="gc-label" htmlFor="cp-phone">Mobile number *</label><input id="cp-phone" className="gc-input ib-data" inputMode="tel" value={saving.phone} onChange={(e) => setSaving({ ...saving, phone: e.target.value })} placeholder="01712345678" /></div>
          <div><label className="gc-label" htmlFor="cp-addr">Address</label><input id="cp-addr" className="gc-input" value={saving.address} onChange={(e) => setSaving({ ...saving, address: e.target.value })} placeholder="House, road, area, city" /></div>
          <div className="cp-save__foot"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setSaving(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--sm gc-btn--solid">Save customer</button></div>
        </form>
      ) : null}

      <div className="cp-stats">
        <div><span className="cp-stat">{formatBDT(ltv)}</span><span className="ib-sub">Lifetime value</span></div>
        <div><span className="cp-stat">{counted.length}</span><span className="ib-sub">Orders</span></div>
        <div><span className="cp-stat">{counted.length ? formatBDT(Math.round(ltv / counted.length)) : '—'}</span><span className="ib-sub">Average order</span></div>
        <div><span className="cp-stat">{returns}</span><span className="ib-sub">Returns</span></div>
      </div>

      <section className="cp-sec" aria-label="Tags">
        <div className="cp-sec__head"><h3 className="ib-h3">Tags</h3>
          <Menu label="Tags" button={({ toggle, open }) => <button type="button" className="gc-btn gc-btn--xs gc-btn--flat" aria-expanded={open} onClick={toggle}><Icon name="plus" width="14" height="14" aria-hidden="true" />Tag</button>}>
            {(close) => <TagMenu tags={tags} on={conv.tags || []} onToggle={onToggleTag} onAdd={(n) => { onAddTag(n); close(); }} />}
          </Menu>
        </div>
        {(conv.tags || []).length ? (
          <div className="cp-tags">{conv.tags.map((t) => <span key={t} className={'gc-badge gc-badge--' + tagTone(tags, t)}>{t}<button type="button" className="cp-x" aria-label={'Remove tag ' + t} onClick={() => onToggleTag(t)}><Icon name="x" width="12" height="12" /></button></span>)}</div>
        ) : <p className="cp-empty">No tags yet.</p>}
      </section>

      <section className="cp-sec" aria-label="Contact">
        <h3 className="ib-h3">Contact</h3>
        <ul className="cp-list">
          <li><Icon name="phone" width="16" height="16" aria-hidden="true" /><span className="ib-data">{conv.phone || 'No phone number'}</span></li>
          {address ? <li><Icon name="map-pin" width="16" height="16" aria-hidden="true" /><span>{address}</span></li> : null}
          {channels.map((x, i) => (
            <li key={i}>
              <ChannelIcon channel={x.ch} size={18} decorative />
              {x.id ? <button type="button" className="cp-linkbtn" onClick={() => onOpenConv(x.id)}>{x.text}</button> : <span className="cp-trunc">{x.text}</span>}
              <span className="ib-sub cp-right">{x.primary ? 'This chat' : channelName(x.ch)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="cp-sec" aria-label="Orders">
        <div className="cp-sec__head"><h3 className="ib-h3">Orders</h3>{mine.length > 4 ? <span className="ib-sub">Latest 4 of {mine.length}</span> : null}</div>
        {mine.length ? (
          <ul className="cp-orders">
            {mine.slice(0, 4).map((o) => (
              <li key={o.id}>
                <span className="cp-orders__text"><Link className="ib-link ib-data" href={orderHref(o.id, 'inbox')}>{o.id}</Link><span className="ib-sub">{formatDate(o.at)} · {o.itemTitle}</span></span>
                <span className="cp-orders__right"><span className="ib-price">{o.total}</span><StatusBadge tone={orderTone(o)}>{o.status}</StatusBadge></span>
              </li>
            ))}
          </ul>
        ) : <p className="cp-empty">{conv.phone ? 'No orders from this number yet.' : 'Orders show here once the phone number is known.'}</p>}
      </section>

      <section className="cp-sec" aria-label="Team note">
        <h3 className="ib-h3"><label htmlFor={'cp-note-' + conv.id}>Team note</label></h3>
        <textarea id={'cp-note-' + conv.id} className="gc-input cp-note" rows="3" value={note} onChange={(e) => setNote(e.target.value)} onBlur={saveNote} placeholder="Anything the next agent should know. Only the team sees this." />
      </section>

      <section className="cp-sec" aria-label="Conversation history">
        <h3 className="ib-h3">Other conversations</h3>
        {history.length ? (
          <ul className="cp-hist">
            {history.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => onOpenConv(c.id)}>
                  <ChannelIcon channel={c.ch} size={20} decorative />
                  <span className="cp-hist__text"><span className="cp-hist__top"><b>{channelName(c.ch)}</b><span className="ib-sub">{ago((lastAny(c) || { at: 0 }).at, now)}</span></span><span className="ib-sub cp-trunc">{previewOf(lastAny(c))}</span></span>
                  <span className="gc-badge gc-badge--slate">{STATUS_WORD[statusOf(c, now)]}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="cp-empty">Only this conversation so far.</p>}
      </section>
    </div>
  );
}

/** Tag checklist with "new tag" field (used in the panel, the thread menu and bulk actions). */
export function TagMenu({ tags, on, onToggle, onAdd }) {
  const [name, setName] = useState('');
  return (
    <>
      <p className="ib-menu__head">Tags</p>
      {Object.keys(tags).map((t) => <MenuItem key={t} checked={on.includes(t)} onClick={() => onToggle(t)}><span className={'ib-dot ib-dot--' + ({ primary: 'info', slate: '' }[tags[t]] ?? tags[t])} /> {t}</MenuItem>)}
      <form className="ib-menu__form" onSubmit={(e) => { e.preventDefault(); const n = name.trim(); if (n) { onAdd(n); setName(''); } }}>
        <input className="gc-input" aria-label="New tag" placeholder="New tag" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit" className="gc-btn gc-btn--sm gc-btn--soft">Add</button>
      </form>
    </>
  );
}

export const PANEL_CSS = `
.cp{display:flex;flex-direction:column;gap:var(--space-5);padding:var(--space-5)}
.cp-head{display:flex;align-items:center;gap:var(--space-3)}
.cp-head__text{flex:1;min-width:0}
.cp-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cp-actions{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.cp-actions .gc-btn{flex:1 1 auto;padding:0 var(--space-3)}
.cp-save{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-page)}
.cp-save__foot{display:flex;justify-content:flex-end;gap:var(--space-2)}
.cp-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;overflow:hidden;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--border-subtle)}
.cp-stats>div{padding:var(--space-3);background:var(--surface-card)}
.cp-stat{display:block;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cp-sec{display:flex;flex-direction:column;gap:var(--space-2)}
.cp-sec__head{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);min-height:30px}
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
.cp-linkbtn{min-width:0;padding:0;border:0;background:none;color:var(--primary);font-weight:var(--weight-medium);text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}
.cp-linkbtn:hover{text-decoration:underline}
.cp-orders,.cp-hist{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.cp-orders li{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2-5) 0;border-bottom:1px solid var(--border-subtle)}
.cp-orders li:last-child{border-bottom:0}
.cp-orders__text{flex:1;min-width:0}
.cp-orders__text .ib-sub{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cp-orders__right{display:flex;flex-direction:column;align-items:flex-end;gap:var(--space-1);flex:none}
.cp-note{min-height:84px}
.cp-hist button{display:flex;align-items:center;gap:var(--space-2-5);width:100%;padding:var(--space-2) var(--space-2);margin:0 calc(var(--space-2) * -1);border:0;border-radius:var(--radius-lg);background:none;text-align:left;cursor:pointer;box-sizing:content-box}
.cp-hist button:hover{background:var(--surface-subtle)}
.cp-hist__text{flex:1;min-width:0;display:flex;flex-direction:column}
.cp-hist__top{display:flex;justify-content:space-between;gap:var(--space-2);font-size:var(--text-sm)}
.cp-hist__top b{font-weight:var(--weight-medium);color:var(--text-heading)}
`;
