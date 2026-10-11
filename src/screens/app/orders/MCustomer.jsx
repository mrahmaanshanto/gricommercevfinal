'use client';
// Merchant app · Customer (/m-customer?id=<customer ID> or ?phone=<any number>). New in the boards' design (the order
// board's customer card with Call / WhatsApp, Stock's figure tiles, list rows in cards, sections): what the web
// customer page (src/screens/customers-crm/CustomerCRM.jsx) shows that matters on a phone:
//   head       name, number, restrictions and tags (restrictions.js via crm.js), Call · WhatsApp · SMS
//   figures    orders, spent, due (crm.js row; a number only seen on orders is a guest built from those orders)
//   orders     their orders from the one order list (orders.getOrders, matched on any of their numbers), New order
//   dues       unpaid invoices, overdue, store credit (lib/invoices.js); invoices open on the web
//   warranty   items still covered (customerWarranty.warrantyItems), IMEI and days left
//   notes      team notes, saved on the customer (customers.updateIdentity, as the web does); a guest is saved as a
//              customer first (customers.saveCustomerOnce)
//   segments   the segments they are in (segments.segmentsOf)

import React, { useMemo, useState } from 'react';
import {
  AppScreen, AppBar, Content, Sheet, Section, Card, ListRow, Pill, OrderPill, Avatar, Stat, StatRow, IconButton, Button,
  TextInput, Note, EmptyState, Skeleton, Icon, useAppData, useQuery, money, dateText, initials, toast, refresh,
} from '../kit/AppKit';
import { canUse } from '../kit/appNav';
import { hasModule } from '@/lib/edition';
import { getCrmRows } from '@/lib/crm';
import { updateIdentity, saveCustomerOnce, ADDED_FROM, normalizePhone } from '@/lib/customers';
import { getOrders } from '@/lib/orders';
import { segmentsOf } from '@/lib/segments';
import { restrictionText } from '@/lib/restrictions';
import { warrantyItems } from '@/lib/customerWarranty';
import { profileOf, moneyOf, phonesOf } from './customerData';
import { plural, byName } from './orderData';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const digits = (p) => normalizePhone(p) || String(p || '').replace(/\D/g, '').replace(/^88(?=01)/, '');
const W_TONE = { active: 'ok', ending: 'warn', expired: 'grey' };

export default function MCustomerScreen() {
  const { ready, tick, ctx } = useAppData(['gc:crm-identity', 'gc:crm-restrictions', 'gc:warranty-claims', 'gc:crm-segments']);
  const query = useQuery();
  const ref = query ? query.get('id') || query.get('phone') || '' : '';
  const [allOrders, setAllOrders] = useState(false);
  const [more, setMore] = useState(false);
  const [note, setNote] = useState('');

  const rows = useMemo(() => (ready ? safe(() => getCrmRows(), []) : []), [ready, tick]);
  const orders = useMemo(() => (ready ? safe(() => getOrders(), []) : []), [ready, tick]);
  const prof = useMemo(() => (ready && ref ? safe(() => profileOf(ref, rows, orders), null) : null), [ready, ref, rows, orders]);
  const data = useMemo(() => {
    if (!prof) return null;
    const { c } = prof;
    const phones = phonesOf(c);
    const qPhone = query && query.get('phone') ? digits(query.get('phone')) : '';
    if (qPhone && !phones.includes(qPhone)) phones.push(qPhone);
    const mine = orders.filter((o) => phones.includes(digits(o.phone))).sort((a, b) => (b.at || 0) - (a.at || 0));
    return {
      phones,
      orders: mine,
      money: safe(() => moneyOf(phones), { invoices: [], owed: 0, overdue: 0, credit: 0 }),
      warranty: phones.flatMap((p) => safe(() => warrantyItems(p), [])),
      segments: prof.guest ? [] : safe(() => segmentsOf(c, rows), []),
    };
  }, [prof, orders, rows, query]);

  if (!ready || !query) {
    return (
      <AppScreen name="MCustomer" title="Customer">
        <AppBar title="Customer" back="/m-customers" />
        <Content top={103}><div style={{ height: '4px' }} /><Skeleton rows={4} /></Content>
      </AppScreen>
    );
  }
  if (!prof) {
    return (
      <AppScreen name="MCustomer" title="Customer not found">
        <AppBar title="Customer" back="/m-customers" />
        <Content top={103}><Card><EmptyState icon="search" title={ref ? `No customer ${ref}` : 'No customer chosen'} action={{ label: 'All customers', href: '/m-customers' }} /></Card></Content>
      </AppScreen>
    );
  }

  const { c, guest } = prof;
  const tel = data.phones.find((p) => /^01[3-9]\d{8}$/.test(p)) || '';
  const orderCount = guest ? data.orders.filter((o) => o.statusKey !== 'cancelled').length : Math.max(c.orders || 0, data.orders.length);
  const spent = guest ? c.spent : Math.max(c.spent || 0, data.orders.filter((o) => o.statusKey !== 'cancelled').reduce((a, o) => a + (o.amount || 0), 0));
  const due = Math.max(c.due || 0, data.money.owed);
  const notes = c.notes || [];
  const canNewOrder = ctx && canUse('/m-new-order', ctx) && hasModule('online', ctx.ed);
  const shownOrders = allOrders ? data.orders : data.orders.slice(0, 5);
  const restr = c.restrictions || [];
  const me = byName();

  const addNote = () => {
    const t = note.trim();
    if (!t) return;
    let id = c.id;
    if (!id) {
      // a guest becomes a customer so the note has somewhere to live
      const row = safe(() => saveCustomerOnce({ name: c.name, phone: tel, address: c.address, types: ['Online'], addedFrom: ADDED_FROM.order }), null);
      id = row && row.id;
      if (!id) { toast('Add a mobile number first', { tone: 'error' }); return; }
    }
    updateIdentity(id, { notes: [{ t, by: me + ' · ' + dateText(Date.now()) }, ...notes] });
    setNote(''); refresh();
    toast('Note added');
    if (!c.id) window.location.replace('/m-customer?id=' + encodeURIComponent(id));
  };
  const saveGuest = () => {
    const row = safe(() => saveCustomerOnce({ name: c.name, phone: tel, address: c.address, types: ['Online'], addedFrom: ADDED_FROM.order }), null);
    if (!row) { toast('No mobile number to save', { tone: 'error' }); return; }
    toast('Saved as a customer');
    if (row.id) window.location.replace('/m-customer?id=' + encodeURIComponent(row.id)); else refresh();
  };

  const backHref = '/m-customer?' + (c.id ? 'id=' + encodeURIComponent(c.id) : 'phone=' + tel);
  return (
    <AppScreen name="MCustomer" title={c.name}>
      <AppBar title={c.name} back="/m-customers" actions={<IconButton icon="dots" label="More actions" onClick={() => setMore(true)} />} />
      <Content top={103} bottom={0}>
        <div className="card" style={{ margin: '4px 20px 0', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar text={initials(c.name)} size={52} tone={{ bg: '#e0f3fb', fg: '#003087' }} />
            <div style={{ flex: '1', minWidth: '0' }}>
              <div className="ell" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)' }}>{c.name}</div>
              <div className="num ell" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{c.phone || 'No number'}{c.id ? ' · ' + c.id : ' · Guest'}</div>
            </div>
          </div>
          {(c.status !== 'Active' || (c.restrictionShort || []).length || (c.tags || []).length || c.level) ? (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
              {c.status !== 'Active' ? <Pill tone="err">{c.status}</Pill> : null}
              {(c.restrictionShort || []).map((x) => <Pill key={x} tone="warn">{x}</Pill>)}
              {c.level && c.level !== 'Member' ? <Pill tone="nav">{c.level}</Pill> : null}
              {(c.tags || []).map((x) => <Pill key={x} tone="grey">{x}</Pill>)}
            </div>
          ) : null}
          {c.address ? <div style={{ fontSize: 'var(--text-sm)', color: 'var(--body)', marginTop: '12px', lineHeight: '21px' }}>{c.address}</div> : null}
          {tel ? (
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <a className="btn btns" href={'tel:' + tel} style={{ flex: '1', height: '44px', fontSize: 'var(--text-sm-plus)', padding: '0 10px' }}><Icon name="phone" size={18} />Call</a>
              <a className="btn btns" href={'https://wa.me/88' + tel} target="_blank" rel="noreferrer" style={{ flex: '1', height: '44px', fontSize: 'var(--text-sm-plus)', padding: '0 10px', background: '#e7f7f0', color: '#0f7a55' }}><Icon name="whatsapp" size={18} />WhatsApp</a>
              <a className="btn btns" href={'sms:' + tel} style={{ flex: '1', height: '44px', fontSize: 'var(--text-sm-plus)', padding: '0 10px' }}><Icon name="chat" size={18} />SMS</a>
            </div>
          ) : null}
        </div>

        <StatRow style={{ margin: '12px 20px 0' }}>
          <Stat label="Orders" value={String(orderCount)} tone="nav" />
          <Stat label="Spent" value={money(spent)} tone="ok" />
          <Stat label="Due" value={money(due)} tone={due > 0 ? 'err' : 'grey'} />
        </StatRow>

        {restr.length ? (
          <div style={{ margin: '12px 20px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {restr.map((r) => <Note key={r.id} tone="warn" icon="alert">{safe(() => restrictionText(r), r.type)}{r.reason ? ' · ' + r.reason : ''}</Note>)}
          </div>
        ) : null}

        <Section title="Orders" action={canNewOrder && tel ? { label: 'New order', href: '/m-new-order?phone=' + tel } : null}>
          {data.orders.length ? (
            <Card>
              {shownOrders.map((o) => (
                <ListRow key={o.id} href={'/m-order-detail?id=' + encodeURIComponent(o.id) + '&from=' + encodeURIComponent(backHref)}
                  icon="bag" title={<><span className="mono">{o.id}</span> · {money(o.amount)}</>} sub={`${dateText(o.at)} · ${o.itemTitle}`}
                  end={<OrderPill statusKey={o.statusKey} />} chevron={false} />
              ))}
              {data.orders.length > 5 ? <div style={{ padding: '0 16px 14px' }}><Button kind="soft" style={{ width: '100%', height: '36px' }} onClick={() => setAllOrders(!allOrders)}>{allOrders ? 'Show less' : `Show all ${data.orders.length}`}</Button></div> : null}
            </Card>
          ) : <Card><EmptyState icon="bag" title={orderCount ? 'Their earlier orders are on the web' : 'No orders yet'} action={canNewOrder && tel ? { label: 'New order', href: '/m-new-order?phone=' + tel } : null} /></Card>}
        </Section>

        {data.money.invoices.length || data.money.credit > 0 ? (
          <Section title="Dues & invoices" action={data.money.owed ? <span className="num" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--err)' }}>{money(data.money.owed)}</span> : null}>
            <Card>
              {data.money.invoices.slice(0, 5).map((i) => (
                <ListRow key={i.id} href={'/sales-invoice?id=' + encodeURIComponent(i.id)} icon="receipt" title={<span className="mono">{i.id}</span>} sub={`${dateText(i.at)} · ${i.stage}${i.late ? ' · overdue' : ''}`}
                  end={<span className="num" style={{ fontWeight: 'var(--weight-semibold)', color: i.late ? 'var(--err)' : 'var(--ink)' }}>{money(i.due)}</span>} chevron={false} />
              ))}
              {data.money.credit > 0 ? <ListRow icon="wallet" title="Store credit" sub="Can be used on the next purchase" end={<span className="num" style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--ok)' }}>{money(data.money.credit)}</span>} /> : null}
            </Card>
          </Section>
        ) : null}

        {data.warranty.length ? (
          <Section title="Warranty" action={<span style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{plural(data.warranty.filter((w) => w.state !== 'expired').length, 'item')} covered</span>}>
            <Card>
              {data.warranty.slice(0, 4).map((w) => (
                <ListRow key={w.key} href={'/m-order-detail?id=' + encodeURIComponent(w.order) + '&from=' + encodeURIComponent(backHref)} icon="mobile" title={w.name}
                  sub={[w.serials && w.serials.length ? 'IMEI ' + w.serials[0] : '', w.label, 'to ' + dateText(w.until)].filter(Boolean).join(' · ')}
                  end={<Pill tone={W_TONE[w.state]}>{w.state === 'expired' ? 'Ended' : `${w.days} days left`}</Pill>} chevron={false} />
              ))}
            </Card>
          </Section>
        ) : null}

        <Section title="Notes">
          <Card pad="14px 16px">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ flex: '1', minWidth: '0' }}><TextInput value={note} onChange={setNote} placeholder="A note for your team" /></span>
              <Button kind="soft" disabled={!note.trim()} onClick={addNote}>Add</Button>
            </div>
            {notes.length ? notes.slice(0, 6).map((n, i) => (
              <div key={i} style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink)', lineHeight: '20px' }}>{n.t}</div>
                <div style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{n.by}</div>
              </div>
            )) : <div className="help" style={{ marginTop: '10px' }}>The customer never sees these.</div>}
          </Card>
        </Section>

        {data.segments.length ? (
          <Section title="Segments">
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '0 20px' }}>
              {data.segments.map((s) => <Pill key={s.id} tone="nav">{s.name}</Pill>)}
            </div>
          </Section>
        ) : null}
        <div style={{ height: '8px' }} />
      </Content>

      <Sheet open={more} onClose={() => setMore(false)} title={c.name}>
        <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
          {canNewOrder && tel ? <ListRow compact icon="plus" title="New order" href={'/m-new-order?phone=' + tel} /> : null}
          {guest ? <ListRow compact icon="user" title="Save as customer" sub="Keep this number in the customer list" onClick={saveGuest} /> : null}
          {c.id ? <ListRow compact icon="globe" title="Open on the web" sub="Edit, consent, restrictions, statement" href={'/customer-crm?id=' + encodeURIComponent(c.id)} /> : null}
          <ListRow compact icon="users" title="All customers" href="/m-customers" />
        </div>
      </Sheet>
    </AppScreen>
  );
}

