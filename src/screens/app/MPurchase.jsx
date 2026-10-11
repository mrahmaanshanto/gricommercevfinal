'use client';
// Merchant app · Purchase (/m-purchase). The board's layout (design/templates/app/MPurchase.dc.html) with live data:
//   figures   Owed to suppliers (supplierBills: open bill balances, suppliers, late) and what is still coming on placed
//             orders (purchase orders) — or, in a shop that buys direct only, what was bought this month
//   chips     purchase orders: Open · Draft · Received; Bought (direct purchases) when the shop buys direct too.
//             Direct only (the Online edition, Stock setup › Direct purchase): All · To pay · Overdue · Paid
//   cards     an order: number, status, supplier, when, total, received bar → /m-purchase-detail?id=<PO no>
//             a bill: number, paid / to pay, supplier, bought on, total, paid bar → /m-purchase-detail?id=<bill no>
//   FAB       New purchase (/m-purchase-new). Filters: one supplier.
// Purchase orders made here or on the web come first, then the demo orders (like the web list). Read after mount.

import React, { useMemo, useState } from 'react';
import { AppScreen, Content, AppBar, Fab, Chips, Sheet, Button, IconButton, ListRow, EmptyState, Skeleton, useAppData, money } from './kit/AppKit';
import { routeLabel } from './kit/appNav';
import { PoCard, BillCard } from './stock/PurchaseParts';
import { poRows, billRows, owedSummary, buyingMode } from './stock/purchaseData';
import { allowed, plural } from './stock/stockData';

const OPEN = ['approval', 'approved', 'ordered', 'partial'];
// no tab bar here: the FAB sits low, as on the board (phone-app.css places it on a phone)
const CSS = '[data-screen="MPurchase"] .fab{bottom:44px}';

export default function MPurchaseScreen() {
  const { ready, tick, ctx } = useAppData(['gc:stock']);
  const [chip, setChip] = useState('');
  const [sup, setSup] = useState('');
  const [filters, setFilters] = useState(false);

  const data = useMemo(() => {
    if (!ready) return null;
    const mode = buyingMode();
    const pos = mode.orders ? poRows() : [];
    const bills = billRows();
    const direct = bills.filter((b) => b.direct);
    const owed = owedSummary();
    const placed = pos.filter((p) => OPEN.includes(p.s) && p.s !== 'approval');
    const now = Date.now();
    const soon = placed.filter((p) => p.s !== 'approval');
    const month = new Date(now); month.setDate(1); month.setHours(0, 0, 0, 0);
    const boughtMonth = bills.filter((b) => b.at >= month.getTime());
    return { mode, pos, bills, direct, owed, coming: soon.reduce((a, p) => a + Math.max(0, p.of - p.got), 0), comingN: soon.length, boughtMonth, now };
  }, [ready, tick]);

  const ordersMode = data ? data.mode.orders : true;
  const chips = !data ? [] : ordersMode ? [
    { key: 'open', label: 'Open', n: data.pos.filter((p) => OPEN.includes(p.s)).length },
    { key: 'draft', label: 'Draft', n: data.pos.filter((p) => p.s === 'draft').length },
    { key: 'received', label: 'Received' },
    ...(data.mode.direct ? [{ key: 'bought', label: 'Bought' }] : []),
    { key: 'topay', label: 'To pay', n: data.bills.filter((b) => b.left > 0).length },
  ] : [
    { key: 'all', label: 'All', n: data.bills.length },
    { key: 'topay', label: 'To pay', n: data.bills.filter((b) => b.left > 0).length },
    { key: 'overdue', label: 'Overdue', n: data.bills.filter((b) => b.status === 'Overdue').length },
    { key: 'paid', label: 'Paid' },
  ];
  const cur = chip || (ordersMode ? 'open' : 'all');
  const bySup = (name) => !sup || name === sup;
  let cards = [];
  if (data) {
    if (['open', 'draft', 'received'].includes(cur)) {
      cards = data.pos.filter((p) => bySup(p.supplier) && (cur === 'open' ? OPEN.includes(p.s) : cur === 'draft' ? p.s === 'draft' : ['received', 'closed'].includes(p.s))).map((p) => ({ k: p.no, po: p }));
    } else {
      cards = data.bills.filter((b) => bySup(b.supplierName) && (cur === 'bought' ? b.direct : cur === 'topay' ? b.left > 0 : cur === 'overdue' ? b.status === 'Overdue' : cur === 'paid' ? b.left <= 0 : true)).map((b) => ({ k: b.no, bill: b }));
    }
  }
  const supNames = data ? [...new Set([...data.pos.map((p) => p.supplier), ...data.bills.map((b) => b.supplierName)])].sort() : [];
  const title = ctx ? routeLabel('/m-purchase', ctx) : 'Purchase';
  const canNew = ctx && allowed('/m-purchase-new', ctx);

  return (
    <AppScreen name="MPurchase" title={title} css={CSS}>
      <AppBar title={title} back="/m-more" actions={<IconButton icon="filter" label="Filters" dot={!!sup} onClick={() => setFilters(true)} />} />
      <Content top={103} bottom={0}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '2px 20px 0' }}>
          <button type="button" className="card" onClick={() => setChip('topay')} style={{ padding: '14px 16px', border: 0, textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer' }}>
            <div className="k">Owed to suppliers</div>
            <div className="v num" style={{ color: data && data.owed.total ? 'var(--err)' : undefined }}>{data ? money(data.owed.total) : '—'}</div>
            <div className="ell" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{data ? <>{plural(data.owed.suppliers, 'supplier')}{data.owed.late ? <> · <span style={{ color: 'var(--err)' }}>{data.owed.late} late</span></> : null}</> : ' '}</div>
          </button>
          {ordersMode ? (
            <div className="card" style={{ padding: '14px 16px' }}>
              <div className="k">Still coming</div>
              <div className="v num">{data ? plural(data.comingN, 'order') : '—'}</div>
              <div style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{data ? plural(data.coming, 'item') : ' '}</div>
            </div>
          ) : (
            <div className="card" style={{ padding: '14px 16px' }}>
              <div className="k">Bought this month</div>
              <div className="v num">{data ? money(data.boughtMonth.reduce((a, b) => a + b.amount, 0)) : '—'}</div>
              <div style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{data ? plural(data.boughtMonth.length, 'purchase') : ' '}</div>
            </div>
          )}
        </div>
        <Chips items={chips} value={cur} onChange={setChip} style={{ marginTop: '16px', overflowX: 'auto' }} />
        <div style={{ height: '14px' }} />
        {!data ? <Skeleton rows={3} /> : cards.length ? cards.map((c) => (c.po
          ? <PoCard key={c.k} po={c.po} href={'/m-purchase-detail?id=' + encodeURIComponent(c.po.no)} />
          : <BillCard key={c.k} bill={c.bill} href={'/m-purchase-detail?id=' + encodeURIComponent(c.bill.no)} />))
          : <div className="card" style={{ margin: '0 20px' }}><EmptyState icon="clipboard" title={sup ? `Nothing from ${sup} here` : 'Nothing here'} action={canNew ? { label: 'New purchase', href: '/m-purchase-new' } : null} /></div>}
      </Content>
      {canNew ? <Fab href="/m-purchase-new" label="New purchase" /> : null}
      <Sheet open={filters} onClose={() => setFilters(false)} title="Supplier" footer={sup ? <Button kind="line" onClick={() => { setSup(''); setFilters(false); }}>Show every supplier</Button> : null}>
        <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
          {supNames.map((n) => <ListRow key={n} compact title={n} onClick={() => { setSup(n); setFilters(false); }} end={sup === n ? <span className="pill p-nav">On</span> : null} chevron={false} />)}
        </div>
      </Sheet>
    </AppScreen>
  );
}
