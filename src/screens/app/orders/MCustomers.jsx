'use client';
// Merchant app · Customers (/m-customers). New in the boards' design (the Orders board's big title, search and chips,
// list rows in one card, FAB, tab bar): the one customer list the web Customers page reads (lib/crm.js › getCrmRows).
//   search    name, any phone, email or customer ID (customers.customerMatches)
//   chips     ready views (All · Repeat buyers · Big spenders · With dues · New this week · Restricted) with counts,
//             and Segment: a saved segment or a ready-made one (lib/segments.js › segmentMembers)
//   rows      name, phone, orders and area; what they owe, else what they spent; 30 at a time
//   add       the FAB adds a customer (customers.saveCustomerOnce) and opens them
// Each row opens /m-customer?id=.

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppScreen, Content, LargeHeader, TabBar, Fab, Sheet, Chips, SearchField, Card, ListRow, Pill, Avatar, Button, Field,
  TextInput, EmptyState, Skeleton, IconButton, useAppData, money, initials, toast,
} from '../kit/AppKit';
import { hasModule } from '@/lib/edition';
import { getCrmRows } from '@/lib/crm';
import { customerMatches, saveCustomerOnce, ADDED_FROM, resolveCustomer } from '@/lib/customers';
import { getSegments, SEGMENT_TEMPLATES, segmentMembers, SEGMENTS_EVENT } from '@/lib/segments';
import { BD_MOBILE, cleanPhone } from '@/lib/orderLinks';
import { VIEWS, inView } from './customerData';
import { plural } from './orderData';

const PAGE = 30;
const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const CSS = `
[data-screen="MCustomers"] .chips{overflow-x:auto;scrollbar-width:none}
[data-screen="MCustomers"] .chips::-webkit-scrollbar{display:none}
[data-screen="MCustomers"] .linkbtn{border:0;background:none;padding:0;font:inherit;font-size:var(--text-xs-plus);color:var(--brand);font-weight:var(--weight-medium);cursor:pointer}
`;

export default function MCustomersScreen() {
  const router = useRouter();
  const { ready, tick, ctx } = useAppData([SEGMENTS_EVENT, 'gc:crm-identity', 'gc:crm-restrictions']);
  const [q, setQ] = useState('');
  const [view, setView] = useState('all');
  const [seg, setSeg] = useState(null);         // { id, name }
  const [segOpen, setSegOpen] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [add, setAdd] = useState(null);         // { name, phone, address, error }

  const rows = useMemo(() => (ready ? safe(() => getCrmRows(), []) : []), [ready, tick]);
  const segIds = useMemo(() => (seg ? new Set(safe(() => segmentMembers(seg.id, rows), []).map((c) => c.id)) : null), [seg, rows]);
  const kept = useMemo(() => rows.filter((c) => (!segIds || segIds.has(c.id)) && (!q.trim() || customerMatches(c, q, rows))), [rows, q, segIds]);
  const list = useMemo(() => kept.filter((c) => inView(c, view)).sort((a, b) => (b.lastAt || 0) - (a.lastAt || 0) || (b.spent || 0) - (a.spent || 0)), [kept, view]);
  const counts = useMemo(() => Object.fromEntries(VIEWS.map((v) => [v.key, kept.filter((c) => inView(c, v.key)).length])), [kept]);
  const segments = useMemo(() => (ready ? [...safe(() => getSegments(), []), ...SEGMENT_TEMPLATES] : []), [ready, tick]);
  const owed = list.reduce((a, c) => a + (c.due || 0), 0);
  const show = list.slice(0, shown);
  React.useEffect(() => { setShown(PAGE); }, [q, view, seg]);

  const saveNew = () => {
    const phone = cleanPhone(add.phone);
    if (!add.name.trim()) { setAdd({ ...add, error: { name: 'Type the customer’s name' } }); return; }
    if (!BD_MOBILE.test(phone)) { setAdd({ ...add, error: { phone: 'Enter a mobile number like 01712345678' } }); return; }
    const known = safe(() => resolveCustomer(phone), null);
    const types = ctx && hasModule('online', ctx.ed) ? ['Online'] : ['Retail'];
    const row = saveCustomerOnce({ name: add.name.trim(), phone, address: add.address.trim(), types, addedFrom: ctx && hasModule('online', ctx.ed) ? ADDED_FROM.order : ADDED_FROM.pos });
    setAdd(null);
    toast(known ? `${known.name} is already a customer` : 'Customer added');
    router.push('/m-customer?' + (row && row.id ? 'id=' + encodeURIComponent(row.id) : 'phone=' + phone));
  };

  return (
    <AppScreen name="MCustomers" title="Customers" css={CSS}>
      <Content top={47} bottom={0}>
        <LargeHeader title="Customers" actions={<IconButton icon="filter" label={seg ? 'Segment: ' + seg.name : 'Segments'} soft dot={!!seg} onClick={() => setSegOpen(true)} />} />
        <SearchField value={q} onChange={setQ} placeholder="Name, phone or customer ID" style={{ marginTop: '14px' }} />
        <Chips style={{ marginTop: '14px' }} value={view} onChange={setView} items={VIEWS.map((v) => ({ key: v.key, label: v.label, n: ready ? counts[v.key] || 0 : undefined }))} />
        {seg ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '10px 20px 0' }}>
            <Pill tone="nav">{seg.name}</Pill>
            <button type="button" className="linkbtn" onClick={() => setSeg(null)}>Clear</button>
          </div>
        ) : null}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '18px 20px 10px', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>
          <span>{ready ? plural(list.length, 'customer') : ' '}</span>
          <span className="num">{owed ? money(owed) + ' due' : ''}</span>
        </div>
        {!ready ? <Skeleton rows={5} /> : show.length ? (
          <>
            <Card>
              {show.map((c) => (
                <ListRow
                  key={c.key || c.id}
                  href={'/m-customer?id=' + encodeURIComponent(c.id)}
                  avatar={<Avatar text={initials(c.name)} tone={{ bg: '#e0f3fb', fg: '#003087' }} />}
                  title={c.name}
                  sub={[c.kind === 'company' ? 'Company' : c.phone, c.orders ? plural(c.orders, 'order') : 'No orders', c.area && c.area !== '—' ? c.area : ''].filter(Boolean).join(' · ')}
                  end={c.due > 0 ? <Pill tone="err">{money(c.due)} due</Pill>
                    : (c.restrictionShort || []).length ? <Pill tone="warn">{c.restrictionShort[0]}</Pill>
                    : c.spent ? <span className="num" style={{ fontSize: 'var(--text-sm)', color: 'var(--body)' }}>{money(c.spent)}</span> : null}
                  chevron={false}
                />
              ))}
            </Card>
            {shown < list.length ? <div style={{ padding: '12px 20px 0' }}><Button kind="soft" style={{ width: '100%' }} onClick={() => setShown((n) => n + PAGE)}>Show more · {list.length - shown} left</Button></div> : null}
          </>
        ) : (
          <Card><EmptyState icon="users" title={q ? `No customers match “${q.trim()}”` : 'No customers here'} action={q || seg || view !== 'all' ? { label: 'Show everyone', onClick: () => { setQ(''); setSeg(null); setView('all'); } } : null} /></Card>
        )}
        <div style={{ height: '8px' }} />
      </Content>
      <Fab onClick={() => setAdd({ name: '', phone: '', address: '', error: {} })} label="Add customer" />

      <Sheet open={segOpen} onClose={() => setSegOpen(false)} title="Segments">
        <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
          {segments.map((s) => (
            <ListRow key={s.id} compact icon="users" title={s.name} sub={s.owner ? 'Ready-made' : 'Saved by ' + (s.by || 'staff')}
              pill={seg && seg.id === s.id ? { tone: 'nav', text: 'On' } : null}
              onClick={() => { setSeg(seg && seg.id === s.id ? null : { id: s.id, name: s.name }); setSegOpen(false); }} />
          ))}
        </div>
      </Sheet>

      <Sheet open={!!add} onClose={() => setAdd(null)} title="Add customer"
        footer={<><Button kind="line" onClick={() => setAdd(null)}>Cancel</Button><Button kind="primary" style={{ flex: '2' }} onClick={saveNew}>Add customer</Button></>}>
        {add ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field label="Name" error={add.error.name}><TextInput value={add.name} onChange={(t) => setAdd({ ...add, name: t, error: {} })} autoFocus /></Field>
            <Field label="Mobile number" error={add.error.phone}><TextInput value={add.phone} onChange={(t) => setAdd({ ...add, phone: t, error: {} })} type="tel" inputMode="tel" placeholder="01XXXXXXXXX" /></Field>
            <Field label="Address"><TextInput value={add.address} onChange={(t) => setAdd({ ...add, address: t })} multiline placeholder="Optional" /></Field>
          </div>
        ) : null}
      </Sheet>
    </AppScreen>
  );
}
