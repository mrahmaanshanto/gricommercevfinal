'use client';
// Merchant app · One purchase (/m-purchase-detail?id=<PO no | bill no>). The board's layout
// (design/templates/app/MPurchaseDetail.dc.html) with live data.
//   an order    status and place, supplier, ordered / expected; Total · Paid · Due (bills made when goods arrived,
//               supplierBills.js; a demo order's own figures); "n of m received" and each line's progress; Record a
//               payment (PaySheet → supplierBills.paySupplier). Action bar: Call the supplier · Receive items
//               (/m-receive?po=) — or, for a draft, Send to supplier (purchaseOrders.updatePO → Sent); an order waiting
//               for approval is approved and sent by an admin (lib/team role with full access).
//   a bill      a direct purchase or a received delivery: bought on, due, Total · Paid · Due, its lines, Pay.
// Everything else (files, extra costs, history) is on the web (/po-detail?no=, /purchases).

import React, { useMemo, useState } from 'react';
import { AppScreen, Content, AppBar, ActionBar, Button, IconButton, Pill, Sheet, ListRow, Icon, EmptyState, Skeleton, Note, useAppData, useQuery, money, toast, refresh } from './kit/AppKit';
import { updatePO } from '@/lib/purchaseOrders';
import { termsLabel } from '@/lib/supplierBills';
import { PaySheet } from './stock/PurchaseParts';
import { poBy, billRows } from './stock/purchaseData';
import { rowBy, allowed, isAdmin, me, dayText, plural, safe } from './stock/stockData';
import { Thumb } from './stock/Scanner';

const CSS = '[data-screen="MPurchaseDetail"] .po-end{flex:none;width:72px;display:flex;justify-content:flex-end}';

function Lines({ lines, received }) {
  return (
    <div className="card" style={{ margin: '0 20px' }}>
      {lines.map((l, i) => {
        const row = rowBy(l.sku || l.name) || rowBy(l.code);
        const got = received ? l.received || 0 : l.qty;
        const done = got >= l.qty;
        const pct = l.qty ? Math.round((got / l.qty) * 100) : 0;
        return (
          <div key={i} className="lrow">
            {row ? <Thumb row={row} size={44} /> : <span className="av" style={{ width: '44px', height: '44px', background: '#e0f3fb', color: '#003087' }}>{String(l.name || '?').charAt(0)}</span>}
            <span style={{ flex: '1', minWidth: '0' }}>
              <span className="ell" style={{ display: 'block', fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-medium)' }}>{l.name}</span>
              <span className="num" style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{received ? `${got} of ${l.qty} in · ` : `${l.qty} × `}{money(l.cost)} each</span>
              {received ? <span className="bar" style={{ display: 'block', marginTop: '7px' }}><i style={{ width: pct + '%', background: done ? '#10b981' : '#003087' }} /></span> : null}
            </span>
            {received ? <span className="po-end">{done ? <span style={{ color: '#10b981', display: 'flex' }} role="img" aria-label="All received"><Icon name="check" size={20} stroke={2.4} /></span> : <Pill tone="warn">{l.qty - got} due</Pill>}</span> : <span className="num" style={{ fontWeight: 'var(--weight-medium)' }}>{money(l.qty * l.cost)}</span>}
          </div>
        );
      })}
    </div>
  );
}

export default function MPurchaseDetailScreen() {
  const q = useQuery();
  const { ready, tick, ctx } = useAppData(['gc:stock']);
  const [pay, setPay] = useState(false);
  const [more, setMore] = useState(false);
  const id = q ? q.get('id') || q.get('no') || '' : '';

  const data = useMemo(() => {
    if (!ready || !q) return undefined;
    const bills = billRows();
    const bill = bills.find((b) => b.no === id);
    if (bill) return { kind: 'bill', bill, bills: bill.left > 0 ? [bill] : [] };
    const po = poBy(id);
    if (!po) return null;
    return { kind: 'po', po, bills: bills.filter((b) => b.po === po.no && b.left > 0) };
  }, [ready, tick, q, id]);

  const title = data && data.kind === 'bill' ? data.bill.no : data && data.po ? data.po.no : id || 'Purchase';
  const call = (phone) => { if (phone) window.location.href = 'tel:' + String(phone).replace(/[^\d+]/g, ''); else toast('No phone number for this supplier', { tone: 'error' }); };

  if (data === null) {
    return (
      <AppScreen name="MPurchaseDetail" title="Purchase" css={CSS}>
        <AppBar title={id || 'Purchase'} back="/m-purchase" />
        <Content top={103}><div className="card" style={{ margin: '4px 20px 0' }}><EmptyState icon="clipboard" title="This purchase is not here" action={{ label: 'All purchases', href: '/m-purchase' }} /></div></Content>
      </AppScreen>
    );
  }

  let head = null, figures = null, sec = null, lines = null, act = null, payBills = [], supplier = '', phone = '';
  if (data && data.kind === 'po') {
    const po = data.po;
    supplier = po.supplier; phone = po.phone;
    const sent = () => {
      updatePO(po.no, (p) => ({ status: 'Sent', sentAt: Date.now(), approval: p.approval === 'waiting' ? 'approved' : p.approval, ...(p.approval === 'waiting' ? { approvedBy: me() } : {}) }));
      refresh();
      toast(`${po.no} sent to ${po.supplier}`);
    };
    head = (
      <>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}><Pill tone={po.tone} shape={po.shape}>{po.label}</Pill><Pill tone="grey">{po.place}</Pill></div>
        <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', letterSpacing: '0', marginTop: '8px' }}>{po.supplier}</div>
        <div style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{`Ordered ${dayText(po.at)}${po.by ? ' by ' + po.by : ''}${po.expected ? ' · expected ' + po.expected : po.due ? ' · ' + po.due.replace(/^Due /, 'due ') : ''}`}{po.terms != null ? ' · ' + termsLabel(po.terms) : ''}</div>
      </>
    );
    const paid = po.stored ? po.paid : po.paid;
    const due = po.stored ? po.left : po.left;
    figures = [['Total', money(po.total)], ['Paid', money(paid), 'var(--ok)'], ['Due', money(due), due > 0 ? 'var(--err)' : undefined]];
    if (po.stored && !po.billed) figures[2] = ['Billed', money(0)];
    sec = { title: `${po.got} of ${po.of} received`, action: { label: 'Open on the web', href: '/po-detail?no=' + encodeURIComponent(po.no) } };
    lines = <Lines lines={po.lines} received />;
    payBills = data.bills;
    const recv = ctx && allowed('/m-receive', ctx);
    if (po.s === 'draft' && po.stored) act = <><Button kind="line" icon="phone" onClick={() => call(phone)}>Call</Button><Button onClick={sent} style={{ flex: 2 }}>Send to supplier</Button></>;
    else if (po.s === 'approval' && po.stored) act = isAdmin() ? <><Button kind="line" icon="phone" onClick={() => call(phone)}>Call</Button><Button onClick={sent} style={{ flex: 2 }}>Approve and send</Button></> : <Button kind="line" icon="phone" onClick={() => call(phone)}>Call supplier</Button>;
    else if (po.receivable && recv) act = <><Button kind="line" icon="phone" onClick={() => call(phone)}>Call</Button><Button icon="scan" href={'/m-receive?po=' + encodeURIComponent(po.no)} style={{ flex: 2 }}>Receive items</Button></>;
    else if (['approved', 'ordered', 'partial'].includes(po.s) && recv) act = <><Button kind="line" icon="phone" onClick={() => call(phone)}>Call</Button><Button kind="soft" onClick={() => toast('This demo order can’t be received. Open PO-2609-0020 or an order you made.', { tone: 'info' })} style={{ flex: 2 }}>Receive items</Button></>;
    else act = <Button kind="line" icon="phone" onClick={() => call(phone)}>Call supplier</Button>;
  } else if (data && data.kind === 'bill') {
    const b = data.bill;
    supplier = b.supplier; phone = b.phone;
    head = (
      <>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}><Pill tone={b.tone} shape={b.shape}>{b.status}</Pill>{b.place ? <Pill tone="grey">{b.place}</Pill> : null}{b.po ? <Pill tone="nav">{b.po}</Pill> : null}</div>
        <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', letterSpacing: '0', marginTop: '8px' }}>{b.supplierName}</div>
        <div style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{`${b.direct ? 'Bought' : 'Billed'} ${dayText(b.at)}${b.left > 0 ? ' · due ' + dayText(b.due) : ''}${b.ref ? ' · invoice ' + b.ref : ''}`}</div>
      </>
    );
    figures = [['Total', money(b.amount)], ['Paid', money((b.paid || 0) + (b.credited || 0)), 'var(--ok)'], ['Due', money(b.left), b.left > 0 ? 'var(--err)' : undefined]];
    const pcs = (b.lines || []).reduce((a, l) => a + (Number(l.qty) || 0), 0);
    sec = { title: (b.lines || []).length ? plural(pcs, 'piece') : 'Items', action: { label: 'Open on the web', href: '/purchases' } };
    lines = (b.lines || []).length ? <Lines lines={b.lines} /> : <div className="card" style={{ margin: '0 20px' }}><EmptyState icon="receipt" title="No item lines on this bill" /></div>;
    payBills = data.bills;
    act = <><Button kind="line" icon="phone" onClick={() => call(phone)}>Call</Button>{b.left > 0 ? <Button onClick={() => setPay(true)} style={{ flex: 2 }}>Pay {money(b.left)}</Button> : <Button kind="soft" disabled style={{ flex: 2 }}>Paid</Button>}</>;
  }
  const payLeft = payBills.reduce((a, b) => a + b.left, 0);

  return (
    <AppScreen name="MPurchaseDetail" title={title} css={CSS}>
      <AppBar title={title} back="/m-purchase" actions={<IconButton icon="dots" label="More" onClick={() => setMore(true)} />} />
      <Content top={103} bottom={98}>
        {!data ? <div style={{ marginTop: '4px' }}><Skeleton rows={4} /></div> : (
          <>
            <div style={{ padding: '2px 20px 0' }}>{head}</div>
            <div className="card" style={{ margin: '16px 20px 0', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
              {figures.map(([k, v, c]) => <div key={k}><div className="k">{k}</div><div className="num" style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-base)', color: c }}>{v}</div></div>)}
            </div>
            <div className="sec"><h2>{sec.title}</h2><a href={sec.action.href} className="tap">{sec.action.label}</a></div>
            {lines}
            {data.kind === 'po' ? (
              payLeft > 0 ? (
                <button type="button" className="card" onClick={() => setPay(true)} style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 20px 0', padding: '14px 16px', width: 'calc(100% - 40px)', border: 0, font: 'inherit', color: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
                  <span className="ico" style={{ width: '40px', height: '40px' }}><Icon name="cash" /></span>
                  <span style={{ flex: '1', fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-medium)' }}>Record a payment to supplier</span>
                  <span className="num" style={{ color: 'var(--err)', fontWeight: 'var(--weight-medium)' }}>{money(payLeft)}</span>
                </button>
              ) : data.po.stored && !data.po.billed ? <Note tone="info" icon="receipt" style={{ margin: '12px 20px 0' }}>The bill is made when the goods arrive.</Note> : null
            ) : null}
            <div style={{ height: '8px' }} />
          </>
        )}
      </Content>
      <ActionBar>{act}</ActionBar>
      <PaySheet open={pay} onClose={() => setPay(false)} supplier={payBills[0] ? payBills[0].supplier : supplier} bills={payBills} onPaid={() => { setPay(false); refresh(); }} />
      <Sheet open={more} onClose={() => setMore(false)} title={title}>
        <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
          <ListRow href={data && data.kind === 'po' ? '/po-detail?no=' + encodeURIComponent(id) : '/purchases'} icon="globe" title="Open on the web" sub="Files, extra costs and history" />
          <ListRow href={'/supplier-return' + (data && data.kind === 'bill' ? '?bill=' + encodeURIComponent(id) : '')} icon="undo" title="Return to supplier" sub="On the web" />
          <ListRow onClick={() => { setMore(false); toast(`${title} sent to the printer`); }} icon="receipt" title="Print" />
        </div>
      </Sheet>
    </AppScreen>
  );
}
