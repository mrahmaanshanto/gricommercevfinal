'use client';
// PurchaseParts — pieces the purchase screens share, drawn like the MPurchase board.
//   PoCard     { po, href }    number, status pill, supplier, when, total and the received bar
//   BillCard   { bill, href }  a supplier bill (direct purchase or a received order): paid bar instead
//   PaySheet   { open, onClose, supplier (id), bills: [bill], onPaid }  pay a supplier from an account
//              (supplierBills.paySupplier → ledger), like Purchases › Pay on the web
//   SupplierSheet { open, onClose, onPick(name), allowNew }  pick a supplier, or type a new one

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Sheet, Button, Field, TextInput, Chips, Pill, SearchField, ListRow, Avatar, EmptyState, money, toast, initials } from '../kit/AppKit';
import { paySupplier, payableOf, termsLabel } from '@/lib/supplierBills';
import { accountsForMethod, balanceOf, getEntries } from '@/lib/ledger';
import { suppliers } from './purchaseData';
import { safe, me, dayText } from './stockData';

const head = (no, pill) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <span className="mono" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{no}</span>
    <span style={{ marginLeft: 'auto' }}>{pill}</span>
  </div>
);
const body = (title, sub, amount) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '10px', marginTop: '6px' }}>
    <div style={{ minWidth: '0' }}>
      <div className="ell" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)' }}>{title}</div>
      <div style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{sub}</div>
    </div>
    <div className="num" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', flex: 'none' }}>{money(amount)}</div>
  </div>
);
const bar = (pct, color, text) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
    <span className="bar" style={{ flex: '1' }}><i style={{ width: Math.max(0, Math.min(100, pct)) + '%', background: color }} /></span>
    <span className="num" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)', flex: 'none' }}>{text}</span>
  </div>
);
const CARD = { display: 'block', margin: '0 20px 12px', padding: '16px' };

/** What the line under the supplier says. */
function poWhen(po) {
  if (po.s === 'draft') return 'Draft · not sent';
  if (po.s === 'approval') return 'Waiting for an admin';
  if (po.s === 'received' || po.s === 'closed') return po.deliveries && po.deliveries[0] ? 'Received ' + dayText(po.deliveries[0].at) : 'Received';
  if (po.s === 'cancelled') return 'Cancelled';
  if (po.s === 'partial') return po.deliveries && po.deliveries[0] ? 'Arrived ' + dayText(po.deliveries[0].at) : 'Partly received';
  return 'Ordered ' + dayText(po.sentAt || po.at) + (po.expected ? ' · due ' + po.expected : po.due ? ' · ' + po.due.replace(/^Due /, 'due ') : '');
}

export function PoCard({ po, href }) {
  const done = po.of && po.got >= po.of;
  return (
    <Link href={href} className="card" style={CARD}>
      {head(po.no, <Pill tone={po.tone} shape={po.shape}>{po.label}</Pill>)}
      {body(po.supplier, poWhen(po), po.total)}
      {bar(po.of ? (po.got / po.of) * 100 : 0, done ? '#10b981' : '#003087', `${po.got}/${po.of} received`)}
    </Link>
  );
}

export function BillCard({ bill, href }) {
  const paid = (bill.paid || 0) + (bill.credited || 0);
  return (
    <Link href={href} className="card" style={CARD}>
      {head(bill.no, <Pill tone={bill.tone} shape={bill.shape}>{bill.status}</Pill>)}
      {body(bill.supplierName, `${bill.direct ? 'Bought' : 'Billed'} ${dayText(bill.at)}${bill.left > 0 ? ' · due ' + dayText(bill.due) : ''}`, bill.amount)}
      {bar(bill.amount ? (paid / bill.amount) * 100 : 100, bill.left > 0 ? '#003087' : '#10b981', bill.left > 0 ? `${money(bill.left)} to pay` : 'Paid')}
    </Link>
  );
}

const METHODS = ['Cash', 'bKash', 'Nagad', 'Bank'];
/** Pay a supplier: the money clears the bills in order (supplierBills.paySupplier) and leaves the account. */
export function PaySheet({ open, onClose, supplier, bills, onPaid }) {
  const left = (bills || []).reduce((a, b) => a + (b.left || 0), 0);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [account, setAccount] = useState('');
  const [ref, setRef] = useState('');
  const accounts = useMemo(() => (open ? safe(() => { const e = getEntries(); return accountsForMethod(method).map((a) => ({ ...a, balance: balanceOf(a.id, e) })); }, []) : []), [open, method]);
  useEffect(() => { if (open) { setAmount(String(Math.round(left))); setRef(''); } }, [open, left]);
  useEffect(() => { setAccount(accounts[0] ? accounts[0].id : ''); }, [accounts]);
  const n = Math.round(Number(amount) || 0);
  const acc = accounts.find((a) => a.id === account);
  const pay = () => {
    if (!(n > 0)) { toast('Enter the amount', { tone: 'error' }); return; }
    if (n > left) { toast(`Only ${money(left)} is owed`, { tone: 'error' }); return; }
    if (!account) { toast('Choose where the money is paid from', { tone: 'error' }); return; }
    if (method !== 'Cash' && !ref.trim()) { toast(method === 'Bank' ? 'Type the bank reference' : `Type the ${method} transaction ID`, { tone: 'error' }); return; }
    const p = paySupplier({ supplier, bills: bills.map((b) => b.no), amount: n, method, account, ref: ref.trim(), by: me() });
    toast(`${money(p.amount)} paid · ${p.no}`);
    if (onPaid) onPaid(p);
  };
  return (
    <Sheet open={open} onClose={onClose} title="Pay supplier" footer={<><Button kind="line" onClick={onClose}>Cancel</Button><Button onClick={pay} style={{ flex: 2 }}>Pay {n > 0 ? money(n) : ''}</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Field label="Amount" help={`${money(left)} owed on ${bills && bills.length === 1 ? bills[0].no : (bills || []).length + ' bills'}`}><TextInput value={amount} onChange={(v) => setAmount(v.replace(/[^\d]/g, ''))} prefix="৳" inputMode="numeric" /></Field>
        <div className="field"><span className="lab">Paid by</span><Chips items={METHODS.map((m) => ({ key: m, label: m }))} value={method} onChange={setMethod} style={{ padding: 0 }} /></div>
        {accounts.length > 1 ? <div className="field"><span className="lab">From</span><Chips items={accounts.map((a) => ({ key: a.id, label: a.name }))} value={account} onChange={setAccount} style={{ padding: 0, overflowX: 'auto' }} /></div> : null}
        {acc ? <span className="help" style={{ marginTop: '-8px' }}>{acc.name} has {money(acc.balance)}</span> : null}
        {method !== 'Cash' ? <Field label={method === 'Bank' ? 'Bank reference' : 'Transaction ID'}><TextInput value={ref} onChange={setRef} placeholder={method === 'Bank' ? 'e.g. TT 44812' : 'e.g. 9GH3K2LQ1P'} /></Field> : null}
      </div>
    </Sheet>
  );
}

/** Pick a supplier (or type a new one). */
export function SupplierSheet({ open, onClose, onPick, allowNew = true }) {
  const [q, setQ] = useState('');
  useEffect(() => { if (open) setQ(''); }, [open]);
  const list = useMemo(() => (open ? suppliers() : []), [open]);
  const k = q.trim().toLowerCase();
  const shown = list.filter((s) => !k || [s.name, s.goods, s.phone].some((x) => String(x || '').toLowerCase().includes(k)));
  const exact = list.some((s) => s.name.toLowerCase() === k);
  return (
    <Sheet open={open} onClose={onClose} title="Supplier">
      <SearchField value={q} onChange={setQ} placeholder="Search or type a new supplier" style={{ margin: '0 0 10px' }} />
      <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
        {allowNew && k && !exact ? <ListRow onClick={() => onPick(q.trim())} icon="plus" title={`Add “${q.trim()}”`} sub="New supplier" compact /> : null}
        {shown.map((s) => {
          const owe = safe(() => payableOf(s.id), 0);
          return <ListRow key={s.id} compact onClick={() => onPick(s.name)} avatar={<Avatar text={initials(s.name)} size={36} tone={{ bg: '#fde7ef', fg: '#003087' }} />} title={s.name} sub={[s.goods, termsLabel(s.terms)].filter(Boolean).join(' · ')} end={owe > 0 ? <span className="num" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--err)' }}>{money(owe)}</span> : null} chevron={false} />;
        })}
        {!shown.length && !(allowNew && k) ? <EmptyState icon="users" title="No suppliers" /> : null}
      </div>
    </Sheet>
  );
}
