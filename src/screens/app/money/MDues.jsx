'use client';
// Merchant app · Dues (/m-dues). The web's Dues page on a phone, from the same books:
//   You'll get   customers who owe on their invoices (lib/invoices.js, grouped by phone like Dues › You will get),
//                overdue ones first. A customer opens a sheet: their open invoices (To accept · Accepted), Call,
//                SMS reminder (lib/messaging.js send: consent, quiet hours and the delivery log apply) and Record
//                payment — one payment spread oldest invoice first (lib/allocations.js allocatePayment, which posts the
//                money to the method's account and checks the transaction ID was not used before). Payment partners'
//                money links to Payouts.
//   You owe      suppliers with open bills (lib/supplierBills.js): Pay clears the bills oldest due first from the
//                account picked (paySupplier, as Suppliers › Pay); other bills to pay — salaries, commission,
//                affiliates, promotions (lib/liabilities.js payLiability, each line from its usual account or one
//                account for all)
// ?tab=get|owe picks the side (Home's "Pay suppliers" opens owe).

import React, { useEffect, useMemo, useState } from 'react';
import {
  AppScreen, Content, AppBar, TabBar, Section, Card, ListRow, Segmented, Pill, Button, Sheet, Field, TextInput, Note,
  EmptyState, Skeleton, Avatar, Icon, useAppData, refresh, toast, money, dateText, initials,
} from '../kit/AppKit';
import { MERCHANT } from '@/lib/merchant';
import { allocatePayment, splitOldestFirst } from '@/lib/allocations';
import { refMessage } from '@/lib/paymentRefs';
import { acceptInvoice, stageOf } from '@/lib/invoices';
import { paySupplier } from '@/lib/supplierBills';
import { payLiability } from '@/lib/liabilities';
import { accountsForMethod, balanceOf } from '@/lib/ledger';
import { send } from '@/lib/messaging';
import { hasModule } from '@/lib/edition';
import { duesData, accountOptions, allowed, accName, dueWords, ageDays, safe, LIAB_TYPES } from './moneyData';
import { AccountField, AmountField, ChoiceChips, Lines, HeroCard, NotHere } from './moneyParts';

const SIDES = [{ key: 'get', label: 'You’ll get' }, { key: 'owe', label: 'You owe' }];
const CUSTOMER_METHODS = ['Cash', 'bKash', 'Nagad', 'Rocket', 'Bank transfer'];
const SUPPLIER_METHODS = ['Cash', 'bKash', 'Nagad', 'Bank'];
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const LIAB_ICON = { salary: 'users', commission: 'tag', affiliate: 'users', promotion: 'megaphone', gratuity: 'gift', other: 'receipt' };
const telOf = (phone) => 'tel:' + String(phone || '').replace(/[^\d+]/g, '');

export default function MDuesScreen() {
  const { ready, tick, ctx } = useAppData(['gc:settle', 'gc:messages']);
  const [side, setSide] = useState('get');
  const [data, setData] = useState(null);
  const [cust, setCust] = useState('');     // customer key
  const [sup, setSup] = useState('');       // supplier id
  const [liab, setLiab] = useState('');     // liability id
  useEffect(() => { const t = new URLSearchParams(window.location.search).get('tab'); if (t === 'owe' || t === 'get') setSide(t); }, []);
  useEffect(() => {
    if (!ready || !ctx) return undefined;
    const id = window.setTimeout(() => setData(safe(() => duesData(), null)), 0);
    return () => window.clearTimeout(id);
  }, [ready, tick, ctx]);

  if (ctx && !allowed('/m-dues', ctx)) return <NotHere name="MDues" title="Dues" />;
  const me = ctx ? ctx.user : null;
  const back = ctx && allowed('/m-finance', ctx) ? '/m-finance' : '/m-more';
  const pick = (v) => { setSide(v); const u = new URL(window.location.href); u.searchParams.set('tab', v); window.history.replaceState(window.history.state, '', u.pathname + u.search); };
  const g = cust && data ? data.customers.find((x) => x.key === cust) : null;
  const s = sup && data ? data.supplierRows.find((x) => x.id === sup) : null;
  const l = liab && data ? data.liabs.find((x) => x.id === liab) : null;
  const get = side === 'get';

  return (
    <AppScreen name="MDues" title="Dues">
      <AppBar title="Dues" back={back} />
      <Content top={103}>
        <Segmented items={SIDES} value={side} onChange={pick} style={{ marginTop: '4px' }} />
        <HeroCard
          label={get ? 'Customers owe you' : 'You owe'}
          value={data ? money(get ? data.customerDue : data.supplierLeft + data.liabLeft) : '—'}
          pill={data && (get ? data.customerOverdue : data.oweOverdue) ? `${money(get ? data.customerOverdue : data.oweOverdue)} overdue` : null}
          figures={!data ? [] : get
            ? [[String(data.customers.length), 'Customers'], [money(data.partnersHeld), 'Partners hold']]
            : [[money(data.supplierLeft), 'Suppliers'], [money(data.liabLeft), 'Other bills']]}
        />

        {!data ? <><Section title={get ? 'Customers' : 'Suppliers'} /><Skeleton rows={4} /></> : get ? (
          <>
            <Section title="Customers">
              {data.customers.length ? (
                <Card>
                  {data.customers.map((c) => (
                    <ListRow key={c.key} onClick={() => setCust(c.key)}
                      avatar={<Avatar text={initials(c.name)} tone={{ bg: '#e0f3fb', fg: '#003087' }} />}
                      title={c.name}
                      sub={`${c.invoices.length} invoice${c.invoices.length === 1 ? '' : 's'} · oldest ${ageDays(c.oldest, data.today)} days${c.toAccept ? ` · ${c.toAccept} to accept` : ''}`}
                      end={<span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}><span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(c.due)}</span>{c.overdue ? <Pill tone="err" shape>Overdue</Pill> : null}</span>} />
                  ))}
                </Card>
              ) : <Card><EmptyState icon="check" title="No customer owes you money" /></Card>}
            </Section>
            {data.partnersHeld > 0 && ctx && allowed('/m-payouts', ctx) ? (
              <Section title="Payment partners">
                <Card><ListRow href="/m-payouts" icon="cash" title={ctx && hasModule('online', ctx.ed) ? 'Gateways and couriers' : 'Card machine and gateways'} sub="Collected for you, paid out later" end={<span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(data.partnersHeld)}</span>} /></Card>
              </Section>
            ) : null}
          </>
        ) : (
          <>
            <Section title="Suppliers" action={<span className="num" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{money(data.supplierLeft)}</span>}>
              {data.supplierRows.length ? (
                <Card>
                  {data.supplierRows.map((x) => {
                    const [w, tone] = dueWords(x.next, data.today);
                    return (
                      <ListRow key={x.id} onClick={() => setSup(x.id)}
                        avatar={<Avatar text={initials(x.name)} tone={{ bg: '#fff4e0', fg: '#003087' }} />}
                        title={x.name} sub={`${x.bills.length} bill${x.bills.length === 1 ? '' : 's'} · ${w.toLowerCase()}`}
                        end={<span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}><span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(x.left)}</span>{tone !== 'grey' ? <Pill tone={tone} shape>{tone === 'err' ? 'Overdue' : 'Today'}</Pill> : null}</span>} />
                    );
                  })}
                </Card>
              ) : <Card><EmptyState icon="check" title="No supplier bills to pay" /></Card>}
            </Section>
            <Section title="Other bills" action={<span className="num" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{money(data.liabLeft)}</span>}>
              {data.liabs.length ? (
                <Card>
                  {data.liabs.map((x) => (
                    <ListRow key={x.id} onClick={() => setLiab(x.id)} icon={LIAB_ICON[x.type] || 'receipt'}
                      title={x.title} sub={`${(LIAB_TYPES[x.type] || LIAB_TYPES.other).label} · ${x.party} · due ${dateText(x.due)}`}
                      end={<span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}><span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(x.left)}</span>{x.status === 'Overdue' ? <Pill tone="err" shape>Overdue</Pill> : x.status === 'Partly paid' ? <Pill tone="warn">Part paid</Pill> : null}</span>} />
                  ))}
                </Card>
              ) : <Card><EmptyState icon="check" title="No other bills to pay" /></Card>}
            </Section>
          </>
        )}
        <div style={{ height: '8px' }} />
      </Content>

      {g ? <CustomerSheet key={g.key} g={g} me={me} now={data.now} onClose={() => { setCust(''); refresh(); }} /> : null}
      {s ? <SupplierSheet key={s.id} s={s} me={me} today={data.today} onClose={() => { setSup(''); refresh(); }} /> : null}
      {l ? <LiabilitySheet key={l.id} l={l} me={me} onClose={() => { setLiab(''); refresh(); }} /> : null}
    </AppScreen>
  );
}

/** A customer's open invoices: accept, call, SMS reminder, record a payment (oldest invoice first). */
function CustomerSheet({ g, me, now, onClose }) {
  const [pay, setPay] = useState(false);
  const [amount, setAmount] = useState(String(g.due));
  const [method, setMethod] = useState('bKash');
  const [ref, setRef] = useState('');
  const amt = r2(amount);
  const dup = ref.trim() ? safe(() => refMessage(ref.trim()), '') : '';
  const by = (me && me.name) || 'Staff';
  const ids = g.invoices.map((i) => i.id);
  const text = `Dear ${g.name}, ${money(g.due)} is due on ${ids.length === 1 ? 'invoice' : 'invoices'} ${ids.join(', ')}. Please pay by bKash 01700-000000 or bank transfer at your earliest convenience. Thank you. — ${MERCHANT.name}`;

  const remind = () => {
    const r = safe(() => send({ source: 'Dues', event: 'due reminder', cls: 'Transactional', channel: 'sms', to: { name: g.name, phone: g.phone }, text, ref: ids.join(',') }), null);
    const st = r && r.row ? r.row.status : r ? r.status : 'Failed';
    if (st === 'Delivered' || st === 'Read') toast(`Reminder sent to ${g.name} by SMS`);
    else if (st === 'Queued') toast(`Reminder queued · it goes out after quiet hours`);
    else toast(`Reminder not sent${r && r.row && r.row.reason ? ': ' + r.row.reason : ''}`, { tone: 'error' });
  };
  const accept = (inv) => { acceptInvoice(inv, by); toast(`${inv.id} accepted`); refresh(); };
  const save = () => {
    if (!(amt > 0)) { toast('Enter the amount received', { tone: 'error' }); return; }
    if (amt > g.due + 0.001) { toast(`${g.name} owes ${money(g.due)}. Enter up to that.`, { tone: 'error' }); return; }
    if (method !== 'Cash' && dup) { toast(dup, { tone: 'error' }); return; }
    const lines = splitOldestFirst(g.invoices, amt);
    const r = allocatePayment({ customer: g.name, method, amount: amt, ref: method === 'Cash' ? '' : ref.trim(), lines }, me || undefined);
    if (!r.ok) { toast(r.message, { tone: 'error' }); return; }
    const n = r.allocation.lines.length;
    toast(`${money(amt)} from ${g.name} recorded on ${n} invoice${n === 1 ? '' : 's'}`);
    onClose();
  };

  const footer = pay
    ? <><Button kind="line" onClick={() => setPay(false)}>Back</Button><Button kind="primary" style={{ flex: 2 }} onClick={save}>Record {amt > 0 ? money(amt) : 'payment'}</Button></>
    : <Button kind="primary" icon="cash" onClick={() => setPay(true)}>Record payment</Button>;
  return (
    <Sheet open title={g.name} onClose={onClose} footer={footer}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <div className="v num">{money(g.due)}</div>
          <div className="k">{g.phone ? <span className="num">{g.phone}</span> : 'No phone'} · {g.invoices.length} invoice{g.invoices.length === 1 ? '' : 's'}{g.overdue ? ` · ${money(g.overdue)} overdue` : ''}</div>
        </div>
        {!pay ? (
          <>
            {g.phone ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <a className="btn btnl" style={{ flex: 1 }} href={telOf(g.phone)}><Icon name="phone" size={20} stroke={2} />Call</a>
                <Button kind="soft" icon="chat" onClick={remind} style={{ flex: 1 }}>SMS reminder</Button>
              </div>
            ) : null}
            <div className="card" style={{ margin: 0, boxShadow: 'none', border: '1px solid var(--line)' }}>
              {g.invoices.map((inv) => {
                const st = stageOf(inv);
                const late = inv.dueAt ? inv.dueAt < now : inv.at + 30 * 864e5 < now;
                return (
                  <ListRow key={inv.id} compact chevron={false}
                    title={<span className="mono">{inv.id}</span>}
                    sub={`${dateText(inv.at)} · ${money(inv.totals.total)} total${late ? ' · overdue' : ''}`}
                    end={<span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(inv.due)}</span>
                      {st === 'review' ? <button type="button" className="pill p-warn" style={{ border: 0, cursor: 'pointer' }} onClick={() => accept(inv)}>Accept</button> : <Pill tone="nav">Accepted</Pill>}
                    </span>} />
                );
              })}
            </div>
            <div className="help">The reminder says: “{text}”</div>
          </>
        ) : (
          <>
            <AmountField label="Amount received" value={amount} onChange={setAmount} autoFocus help="Oldest invoice first." />
            <div className="field"><span className="lab">Paid by</span><ChoiceChips label="Paid by" items={CUSTOMER_METHODS} value={method} onChange={setMethod} /></div>
            {method !== 'Cash' ? (
              <Field label={method === 'Bank transfer' ? 'Bank reference' : 'Transaction ID'} error={dup}>
                <TextInput value={ref} onChange={setRef} placeholder="e.g. 9KT5MX2RQA" />
              </Field>
            ) : null}
            {amt > 0 ? (
              <div className="card" style={{ margin: 0, padding: '14px 16px', boxShadow: 'none', border: '1px solid var(--line)' }}>
                <Lines rows={splitOldestFirst(g.invoices, amt).filter((x) => x.amount > 0).map((x) => [x.id, money(x.amount)])} />
              </div>
            ) : null}
          </>
        )}
      </div>
    </Sheet>
  );
}

/** Pay a supplier: tick bills (oldest due first), method, account; the money clears them in order. */
function SupplierSheet({ s, me, today, onClose }) {
  const [ticks, setTicks] = useState(() => Object.fromEntries(s.bills.map((b) => [b.no, true])));
  const [method, setMethod] = useState('Bank');
  const listFor = (m) => accountsForMethod(m).map((a) => ({ id: a.id, type: a.type, name: accName(a.id), balance: balanceOf(a.id) }));
  const [account, setAccount] = useState(() => (listFor('Bank')[0] || {}).id || '');
  const [amount, setAmount] = useState(null);   // null = everything on the ticked bills
  const accounts = useMemo(() => listFor(method), [method]); // eslint-disable-line react-hooks/exhaustive-deps
  const ticked = s.bills.filter((b) => ticks[b.no]);
  const sum = r2(ticked.reduce((a, b) => a + b.left, 0));
  const amt = amount == null ? sum : Math.min(r2(amount), sum);
  const acc = accounts.find((a) => a.id === account) || accounts[0] || null;
  const pickMethod = (m) => { setMethod(m); setAccount((listFor(m)[0] || {}).id || ''); };
  const save = () => {
    if (!(amt > 0)) { toast('Tick a bill and enter the amount', { tone: 'error' }); return; }
    if (!acc) { toast('Choose the account the money leaves from', { tone: 'error' }); return; }
    if (amt > acc.balance) { toast(`${acc.name} doesn’t hold ${money(amt)}. Choose another account or pay less.`, { tone: 'error' }); return; }
    const done = paySupplier({ supplier: s.id, bills: ticked.map((b) => b.no), amount: amt, method, account: acc.id, by: (me && me.name) || 'Staff' });
    toast(`${money(done.amount)} paid to ${s.name} from ${acc.name}${done.amount < sum ? ` · ${money(sum - done.amount)} still owed` : ''}`);
    onClose();
  };
  return (
    <Sheet open title={`Pay ${s.name}`} onClose={onClose}
      footer={<><Button kind="line" onClick={onClose}>Cancel</Button><Button kind="primary" style={{ flex: 2 }} onClick={save}>Pay {amt > 0 ? money(amt) : ''}</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="card" style={{ margin: 0, boxShadow: 'none', border: '1px solid var(--line)' }}>
          {s.bills.map((b) => {
            const [w, tone] = dueWords(b.due, today);
            const on = !!ticks[b.no];
            return (
              <button key={b.no} type="button" className="row" role="checkbox" aria-checked={on} style={{ minHeight: '56px', padding: '9px 16px' }} onClick={() => setTicks({ ...ticks, [b.no]: !on })}>
                <span className="ico" style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-md)', background: on ? 'var(--brand)' : 'var(--card)', color: '#fff', border: on ? 0 : '1.5px solid #cbd5e1' }}>{on ? <Icon name="check" size={16} stroke={2.4} /> : null}</span>
                <span className="m">
                  <span className="t ell" style={{ display: 'block' }}><span className="mono">{b.no}</span>{b.ref ? ` · ${b.ref}` : ''}</span>
                  <span className="s" style={{ display: 'block', color: tone === 'err' ? 'var(--err)' : undefined }}>{w}</span>
                </span>
                <span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(b.left)}</span>
              </button>
            );
          })}
        </div>
        <AmountField label="Amount" value={amount == null ? String(sum) : amount} onChange={setAmount} help={ticked.length ? `${ticked.length} bill${ticked.length === 1 ? '' : 's'} ticked · ${money(sum)}. Oldest due first.` : 'Tick the bills you pay.'} />
        <div className="field"><span className="lab">Paid by</span><ChoiceChips label="Paid by" items={SUPPLIER_METHODS} value={method} onChange={pickMethod} /></div>
        {accounts.length > 1 ? <AccountField label="From" value={acc ? acc.id : ''} onChange={setAccount} accounts={accounts} /> : acc ? <div className="help">From {acc.name} · {money(acc.balance)}</div> : null}
        {acc && amt > acc.balance ? <Note tone="warn" icon="alert"><b>{acc.name} holds {money(acc.balance)}.</b> Choose another account or pay less.</Note> : null}
      </div>
    </Sheet>
  );
}

/** Pay what is left on a salary run, commission, affiliate payout or promotion. */
function LiabilitySheet({ l, me, onClose }) {
  const open = l.lines.filter((x) => x.amount - (x.paid || 0) > 0);
  const [ticks, setTicks] = useState(() => Object.fromEntries(open.map((x) => [x.name, true])));
  const [account, setAccount] = useState('');
  const accounts = useMemo(() => accountOptions(), []);
  const chosen = open.filter((x) => ticks[x.name]);
  const total = r2(chosen.reduce((a, x) => a + (x.amount - (x.paid || 0)), 0));
  const save = () => {
    if (!chosen.length) { toast('Tick who you pay', { tone: 'error' }); return; }
    const lines = Object.fromEntries(chosen.map((x) => [x.name, r2(x.amount - (x.paid || 0))]));
    const done = payLiability(l.id, { lines, account: account || undefined, by: (me && me.name) || 'Staff' });
    if (!done) { toast('Nothing was paid', { tone: 'error' }); return; }
    toast(`${money(total)} paid · ${l.title}`);
    onClose();
  };
  return (
    <Sheet open title={l.title} onClose={onClose}
      footer={<><Button kind="line" onClick={onClose}>Cancel</Button><Button kind="primary" style={{ flex: 2 }} onClick={save}>Pay {total > 0 ? money(total) : ''}</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <div className="v num">{money(l.left)}</div>
          <div className="k">{l.party} · due {dateText(l.due)}{l.status === 'Overdue' ? ' · overdue' : ''}</div>
        </div>
        <div className="card" style={{ margin: 0, boxShadow: 'none', border: '1px solid var(--line)' }}>
          {open.map((x) => {
            const on = !!ticks[x.name];
            return (
              <button key={x.name} type="button" className="row" role="checkbox" aria-checked={on} style={{ minHeight: '56px', padding: '9px 16px' }} onClick={() => setTicks({ ...ticks, [x.name]: !on })}>
                <span className="ico" style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-md)', background: on ? 'var(--brand)' : 'var(--card)', color: '#fff', border: on ? 0 : '1.5px solid #cbd5e1' }}>{on ? <Icon name="check" size={16} stroke={2.4} /> : null}</span>
                <span className="m">
                  <span className="t ell" style={{ display: 'block' }}>{x.name}</span>
                  <span className="s ell" style={{ display: 'block' }}>{[x.note, accName(x.account)].filter(Boolean).join(' · ')}</span>
                </span>
                <span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(x.amount - (x.paid || 0))}</span>
              </button>
            );
          })}
        </div>
        <AccountField label="Pay from" value={account} onChange={setAccount} accounts={accounts} first={{ value: '', label: 'Each person’s usual account' }} />
      </div>
    </Sheet>
  );
}
