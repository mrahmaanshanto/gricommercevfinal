'use client';
// Merchant app · Return or exchange (/m-return, AP-F5) — goods coming back, on the phone, on the web's rules
// (/return-exchange; logic in ./returnData.js):
//   1 find the sale: memo / order number, the customer's mobile, or scan the receipt or the item's IMEI (camera or a
//     scanner; ?ref=<sale or order id> opens it straight away, e.g. from the POS or an order page)
//   2 tick what is coming back (never more than is left), the reason, and whether it can be sold again or goes to damaged
//   3 Return: give the money back (cash, bKash / Nagad / card as a tracked refund, store credit, or off the due);
//     Exchange: pick the item given instead; the customer pays the difference (with its transaction ID) or gets it back
//   Confirm saves it; outside the return window a manager approves with their PIN. Done shows what happened to the money
//   and the stock.

import React, { useEffect, useMemo, useState } from 'react';
import {
  AppScreen, Content, AppBar, ActionBar, Button, Card, Section, ListRow, Chips, Segmented, SearchField, Stepper, Field, TextInput,
  Note, Pill, EmptyState, Skeleton, Icon, useAppData, useQuery, money, dateText, toast,
} from '../kit/AppKit';
import { ScanSheet, ProductSheet, PinSheet } from '../stock/Scanner';
import { currentUser } from '@/lib/team';
import { POS_KEYS, load } from '@/lib/posStore';
import { stockAt } from '@/lib/stock';
import { saleSources, findSales, saveReturn, outsideWindow, returnDays, digitsOf, REASONS, REFUND_METHODS, PAY_IN_METHODS } from './returnData';

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };

export default function MReturnScreen() {
  const { ready, tick } = useAppData(['gc:stock', 'gc:ledger']);
  const query = useQuery();
  const [sources, setSources] = useState(null);
  const [q, setQ] = useState('');
  const [key, setKey] = useState('');
  const [picks, setPicks] = useState({});
  const [mode, setMode] = useState('ret');
  const [reason, setReason] = useState('bad');
  const [resellPick, setResellPick] = useState(null);
  const [method, setMethod] = useState('');
  const [refundTo, setRefundTo] = useState('');
  const [item, setItem] = useState(null);          // the item given in exchange: { sku, name, price }
  const [payMethod, setPayMethod] = useState('Cash');
  const [payRef, setPayRef] = useState('');
  const [sheet, setSheet] = useState('');          // '' | 'scan' | 'product' | 'pin'
  const [done, setDone] = useState(null);
  const [fromRef, setFromRef] = useState(false);
  const [refKey, setRefKey] = useState('');        // the sale ?ref= opened: Back on it goes back where the person came from

  useEffect(() => { if (ready) setSources(safe(() => saleSources(), [])); }, [ready, tick]);
  // ?ref= opens a sale straight away (from the POS, an order or a receipt)
  useEffect(() => {
    if (!sources || !query || fromRef) return;
    setFromRef(true);
    const ref = query.get('ref');
    if (!ref) return;
    const hit = sources.find((s) => [s.id, s.ref, s.orderId].some((x) => x && String(x).toLowerCase() === ref.toLowerCase()));
    if (hit) { choose(hit); setRefKey(hit.key); } else { setQ(ref); toast(`No sale ${ref} on this phone. Search by number or mobile.`, { tone: 'error' }); }
  }, [sources, query, fromRef]); // eslint-disable-line react-hooks/exhaustive-deps

  const sale = sources && key ? sources.find((s) => s.key === key) || null : null;
  const matches = useMemo(() => (sources ? findSales(q, sources) : []), [sources, q]);

  function choose(s) {
    setKey(s.key); setPicks({}); setMode('ret'); setReason('bad'); setResellPick(null); setMethod(''); setItem(null); setPayMethod('Cash'); setPayRef('');
    setRefundTo(digitsOf(s.customer.phone));
    // an IMEI scanned to find the sale ticks its line
    const up = q.trim().toUpperCase().replace(/\s+/g, '');
    const line = up.length >= 6 ? s.lines.find((l) => l.serials.includes(up) && l.left > 0) : null;
    if (line) setPicks({ [line.id]: 1 });
  }
  const onCode = (code) => {
    setSheet('');
    setQ(code);
    const hits = findSales(code, sources || []);
    if (hits.length === 1) { setQ(code); choose(hits[0]); } else if (!hits.length) toast(`Nothing found for ${code}`, { tone: 'error' });
  };

  // ---- the return ----------------------------------------------------------------------------------------------------
  const back = sale ? sale.lines.filter((l) => picks[l.id] > 0) : [];
  const pcs = back.reduce((n, l) => n + picks[l.id], 0);
  const credit = r2(back.reduce((a, l) => a + picks[l.id] * l.each, 0));
  const reasonLabel = (REASONS.find((r) => r[0] === reason) || REASONS[0])[1];
  const resell = resellPick == null ? !(reason === 'bad' || reason === 'exp') : resellPick;
  const exch = mode === 'exch';
  const avail = item && sale ? safe(() => stockAt(item.sku, sale.place).available, 0) : 0;
  const diff = exch ? r2((item ? item.price : 0) - credit) : -credit;
  const dir = exch && !item ? 'none' : diff > 0 ? 'in' : diff < 0 ? 'out' : 'even';
  const amt = Math.abs(diff);
  const phone = sale ? digitsOf(sale.customer.phone) : '';
  const methods = [...REFUND_METHODS, ...(phone ? ['Store credit'] : []), ...(sale && sale.due > 0 ? ['Cut from due'] : [])];
  const m = methods.includes(method) ? method : sale && sale.due > 0 ? 'Cut from due' : sale && sale.byWallet && phone ? 'Store credit' : 'Cash';
  const outside = sale ? outsideWindow(sale) : false;

  const setPick = (id, n) => setPicks((p) => { const o = { ...p }; if (n > 0) o[id] = n; else delete o[id]; return o; });
  const confirm = (approver = '') => {
    if (!pcs) { toast('Tick the items coming back first', { tone: 'error' }); return; }
    if (exch && !item) { toast('Pick the item given instead', { tone: 'error' }); return; }
    if (exch && avail < 1) { toast(`${item.name} is out of stock at ${sale.place}`, { tone: 'error' }); return; }
    if (outside && !approver) { setSheet('pin'); return; }
    const me = safe(() => currentUser(), null);
    const res = saveReturn({
      sale, picks, reason: reasonLabel, resell, method: m, refundTo, by: (me && me.name) || 'Staff', approvedBy: approver,
      exchange: exch ? { sku: item.sku, name: item.name, price: item.price, qty: 1 } : null,
      pay: { method: payMethod, ref: payRef }, counter: safe(() => (load(POS_KEYS.shift, null) || {}).counter, ''),
    });
    if (!res.ok) { toast(res.error, { tone: 'error' }); return; }
    setSheet('');
    setDone(res);
    toast(`${res.exchange ? 'Exchange' : 'Return'} ${res.id} saved`);
  };
  const again = () => { setDone(null); setKey(''); setQ(''); setPicks({}); setSources(safe(() => saleSources(), [])); };

  // where Back goes: ?back= (an order page passes its own), else the register
  const backHref = (query && /^\/m-[a-z-]+/.test(query.get('back') || '') ? query.get('back') : '') || '/m-pos';
  const bigText = dir === 'in' ? `Customer pays ${money(amt)}` : dir === 'even' ? 'Even swap' : dir === 'none' ? 'Pick the item given instead'
    : m === 'Cut from due' ? `${money(Math.min(sale ? sale.due : 0, amt))} off the due` : m === 'Store credit' ? `${money(amt)} as store credit` : `Give back ${money(amt)} · ${m}`;

  return (
    <AppScreen name="MReturn" title="Return or exchange" tabs={!(sale && !done)}>
      <AppBar title={done ? 'Saved' : sale ? sale.label : 'Return or exchange'} back={backHref} onBack={sale && !done && sale.key !== refKey ? () => { setKey(''); setPicks({}); } : undefined} />
      <Content top={103} bottom={sale && !done ? 98 : 0}>
        {!sources ? <Skeleton rows={4} /> : done ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '8px 0 20px' }}>
            <Card pad>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ display: 'grid', placeItems: 'center', width: '44px', height: '44px', borderRadius: 'var(--radius-full)', background: 'var(--fill-success-soft)', color: 'var(--text-success)' }}><Icon name="check" size={22} /></span>
                <span><b style={{ display: 'block', fontSize: 'var(--text-lg)' }}>{done.exchange ? 'Exchange saved' : 'Return saved'}</b><span className="mono" style={{ color: 'var(--muted)', fontSize: 'var(--text-xs-plus)' }}>{done.id}</span></span>
              </div>
            </Card>
            <Card>
              <ListRow icon="cash" title={done.moneyText} chevron={false} ellipsis={false} />
              <ListRow icon="box" title={done.stockText} chevron={false} ellipsis={false} />
            </Card>
            <div style={{ display: 'flex', gap: '10px', padding: '0 20px' }}>
              <Button kind="line" onClick={again} style={{ flex: 1 }}>New return</Button>
              <Button href={backHref} style={{ flex: 1 }}>Done</Button>
            </div>
          </div>
        ) : !sale ? (
          <>
            <SearchField value={q} onChange={setQ} placeholder="Memo, order no., mobile or IMEI" onScan={() => setSheet('scan')} autoFocus={false} style={{ margin: '8px 20px 0' }} />
            <Section title={q.trim() ? 'Matching sales' : 'Recent sales'}>
              {matches.length ? (
                <Card>
                  {matches.map((s) => (
                    <ListRow key={s.key} onClick={() => choose(s)} icon={s.kind === 'online' ? 'bag' : 'receipt'}
                      title={s.label} sub={`${s.customer.name || 'Walk-in customer'} · ${dateText(s.at)}`}
                      end={<span style={{ textAlign: 'right' }}><span className="num" style={{ display: 'block', fontWeight: 'var(--weight-semibold)' }}>{money(s.total)}</span>{!s.open ? <Pill tone="grey">Returned</Pill> : null}</span>} />
                  ))}
                </Card>
              ) : <Card><EmptyState icon="search" title="No sale matches. Check the number or the mobile number." /></Card>}
            </Section>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '16px' }}>
            <Card pad>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <span style={{ minWidth: 0 }}>
                  <b className="ell" style={{ display: 'block' }}>{sale.customer.name || 'Walk-in customer'}</b>
                  <span style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{dateText(sale.at)} · {sale.place}</span>
                </span>
                <span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(sale.total)}</span>
              </div>
              {outside ? <Note tone="warn" icon="alert" style={{ marginTop: '10px' }}>{`Sold more than ${returnDays()} days ago. A manager approves this return.`}</Note> : null}
              {sale.due > 0 ? <div className="help" style={{ marginTop: '8px' }}>{money(sale.due)} still due on this sale</div> : null}
            </Card>

            <Section title="What’s coming back" action={pcs ? <Pill tone="nav">{pcs} {pcs === 1 ? 'item' : 'items'} · {money(credit)}</Pill> : null}>
              <Card>
                {sale.lines.map((l) => (
                  <ListRow key={l.id} title={l.name} chevron={false} ellipsis={false}
                    sub={l.left ? `${money(l.each)} each · ${l.left} of ${l.qty} can come back${l.serials.length ? ' · ' + l.serials.slice(0, 2).join(', ') : ''}` : 'Already returned'}
                    end={l.left ? <Stepper value={picks[l.id] || 0} onChange={(n) => setPick(l.id, n)} min={0} max={l.left} label={'Quantity of ' + l.name + ' coming back'} /> : <Pill tone="grey">Done</Pill>} />
                ))}
              </Card>
            </Section>

            <Segmented items={[{ key: 'ret', label: 'Return' }, { key: 'exch', label: 'Exchange' }]} value={mode} onChange={setMode} style={{ margin: '12px 20px 0' }} />

            <Section title="Why">
              <Chips items={REASONS.map(([k, l]) => ({ key: k, label: l }))} value={reason} onChange={(k) => { setReason(k); setResellPick(null); }} />
            </Section>
            <Section title="Condition">
              <Segmented items={[{ key: 'yes', label: 'Can sell again' }, { key: 'no', label: 'Damaged' }]} value={resell ? 'yes' : 'no'} onChange={(k) => setResellPick(k === 'yes')} style={{ margin: '0 20px' }} />
              <div className="help" style={{ margin: '6px 20px 0' }}>{resell ? `Goes back on sale at ${sale.place}` : 'Goes to the damaged bay, not for sale'}</div>
            </Section>

            {exch ? (
              <Section title="Given instead">
                <Card>
                  <ListRow onClick={() => setSheet('product')} icon="box" title={item ? item.name : 'Pick the item'}
                    sub={item ? `${money(item.price)} · ${avail} available at ${sale.place}` : 'From the products at this place'} />
                </Card>
              </Section>
            ) : null}

            {dir === 'out' && !exch ? (
              <Section title="Give the money back by">
                <Chips items={methods.map((x) => ({ key: x, label: x }))} value={m} onChange={setMethod} />
                {m === 'bKash' || m === 'Nagad' ? <div style={{ padding: '10px 20px 0' }}><Field label={`${m} number it goes to`}><TextInput value={refundTo} onChange={setRefundTo} inputMode="tel" placeholder="01XXXXXXXXX" /></Field></div> : null}
                {m === 'bKash' || m === 'Nagad' || m === 'Card' ? <div className="help" style={{ margin: '6px 20px 0' }}>A refund is made and sent from Payments; over the refund limit it waits for approval.</div> : null}
              </Section>
            ) : null}
            {dir === 'out' && exch ? (
              <Section title="Give the difference back by">
                <Chips items={methods.filter((x) => x !== 'Card').map((x) => ({ key: x, label: x }))} value={m} onChange={setMethod} />
              </Section>
            ) : null}
            {dir === 'in' ? (
              <Section title="Customer pays by">
                <Chips items={PAY_IN_METHODS.map((x) => ({ key: x, label: x }))} value={payMethod} onChange={(k) => { setPayMethod(k); setPayRef(''); }} />
                {payMethod !== 'Cash' ? <div style={{ padding: '10px 20px 0' }}><Field label={payMethod === 'Card' ? 'Card slip number' : `${payMethod} transaction ID`}><TextInput value={payRef} onChange={(v) => setPayRef(v.toUpperCase())} placeholder={payMethod === 'Card' ? 'Slip no.' : '8–10 letters and digits'} /></Field></div> : null}
              </Section>
            ) : null}

            {pcs ? <Note tone={dir === 'in' ? 'ok' : dir === 'out' ? 'warn' : 'info'} icon="cash" style={{ margin: '14px 20px 0' }}>{bigText}</Note> : null}
          </div>
        )}
      </Content>
      {sale && !done ? (
        <ActionBar>
          <Button kind="line" onClick={() => { setKey(''); setPicks({}); }}>Cancel</Button>
          <Button onClick={() => confirm()} disabled={!pcs} style={{ flex: 2 }}>{outside ? 'Confirm · manager PIN' : exch ? 'Confirm exchange' : 'Confirm return'}</Button>
        </ActionBar>
      ) : null}

      <ScanSheet open={sheet === 'scan'} onClose={() => setSheet('')} onCode={onCode} title="Scan the receipt or item" hint="The receipt’s barcode, the order number or the item’s IMEI." />
      <ProductSheet open={sheet === 'product'} onClose={() => setSheet('')} title="Item given instead" place={sale ? sale.place : ''}
        onPick={(r) => { setItem({ sku: r.sku, name: r.name, price: Number(r.price) || 0 }); setSheet(''); }} />
      <PinSheet open={sheet === 'pin'} onClose={() => setSheet('')} action="Return outside the window" amount={credit} refId={sale ? sale.ref : ''}
        reason={sale ? `${sale.label} was sold on ${dateText(sale.at)}, more than ${returnDays()} days ago.` : ''} by={safe(() => currentUser().name, 'Staff')} onApprove={(who) => confirm(who)} />
    </AppScreen>
  );
}
