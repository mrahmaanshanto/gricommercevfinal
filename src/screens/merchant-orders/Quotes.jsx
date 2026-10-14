'use client';
// Quotes — Orders › Quotes (/quotes): quotes (proformas) for business buyers — wholesale buyers while wholesale is on,
// companies and business leads (WH-F4, WH-U2). Its own page in the Orders area (module `commerce`), so every edition
// that takes orders reaches it, not only the Online edition's Order work. A row opens the quote (QuoteDialog): send,
// accept, convert to an order after the same checks as the POS.
//   ?id=QT-… opens a quote · ?new=1 starts one (&lead=LD-… for a lead, &buyer=<phone or customer ID> for a buyer)
// A list page (docs/shopify-style.md): ShopHeader, one card with the state tabs, table / phone list.

import React, { useEffect, useMemo, useState } from 'react';
import { Sidebar, Topbar } from '@/shell/Shell';
import { EmptyState, StatusBadge } from '@/components/ui';
import { ShopHeader, IndexTabs, LearnMore } from '@/components/ui/IndexKit';
import { formatBDT, formatDate } from '@/lib/format';
import { getQuotes, quoteTotals, quoteState, QUOTE_STATE } from '@/lib/quotes';
import { useWholesale } from '@/lib/useWholesale';
import QuoteDialog from '@/screens/merchant-orders/QuoteDialog';

const TABS = [['open', 'Open', ['draft', 'sent', 'accepted']], ['converted', 'Converted', ['converted']], ['closed', 'Expired or declined', ['expired', 'declined']], ['all', 'All', null]];
const KIND = { wholesale: 'Wholesale', company: 'Company', lead: 'Lead', customer: 'Customer' };
const CSS = `.qt-id{font-family:var(--font-data)}`;

export default function Quotes() {
  const ws = useWholesale();
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState('open');
  const [open, setOpen] = useState(null);
  useEffect(() => {
    setReady(true);
    const p = new URLSearchParams(window.location.search);
    if (p.get('id')) setOpen({ id: p.get('id') });
    else if (p.get('new')) setOpen({ id: '', lead: p.get('lead') || '', buyer: p.get('buyer') || '' });
    if (p.get('tab') && TABS.some((t) => t[0] === p.get('tab'))) setTab(p.get('tab'));
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const quotes = useMemo(() => (ready ? getQuotes() : []), [ready, tick, ws]);
  const inTab = (k) => { const st = (TABS.find((t) => t[0] === k) || TABS[3])[2]; return st ? quotes.filter((x) => st.includes(quoteState(x))) : quotes; };
  const rows = inTab(tab);
  const tabs = TABS.map(([k, label]) => ({ key: k, id: 'qt-tab-' + k, label, count: ready ? inTab(k).length : null, on: tab === k, onClick: () => setTab(k) }));
  const close = () => { setOpen(null); window.history.replaceState(null, '', '/quotes'); };
  const done = () => { close(); setTick((n) => n + 1); };

  return (
    <div className="dc-screen ds" data-screen="Quotes">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="orders-quotes" />
        <main className="gc-shell__main">
          <Topbar crumb="Orders" page="Quotes" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="file-text" title="Quotes"
                about="Quotes (proformas) for business buyers: companies, leads and wholesale buyers. Send one, mark it accepted, then convert it to an order with an unpaid invoice."
                more={[{ label: 'All orders', href: '/merchant-orders' }, ...(ws ? [{ label: 'Wholesale orders', href: '/wholesale-orders' }] : []), { label: 'Leads', href: '/sales-leads' }]}
                primary={{ label: 'New quote', onClick: () => setOpen({ id: '' }) }} />

              <section className="ix-card" aria-label="Quotes">
                <div className="ix-bar"><IndexTabs tabs={tabs} label="Quotes by state" /></div>
                {!ready ? <div className="ix-empty" /> : rows.length === 0 ? (
                  <div className="ix-empty"><EmptyState icon="file-text" title={quotes.length ? 'No quote in this group' : 'No quotes yet'} actionLabel={quotes.length ? undefined : 'New quote'} onAction={() => setOpen({ id: '' })} /></div>
                ) : (<>
                  <ul className="ix-plist" aria-label="Quotes">
                    {rows.map((x) => { const st = quoteState(x); return (
                      <li key={x.id}><button type="button" className="ix-pitem" onClick={() => setOpen({ id: x.id })}>
                        <span className="ix-pitem__top"><b>{x.customer.name}</b><span>{formatBDT(quoteTotals(x).total)}</span></span>
                        <span className="ix-pitem__mid"><span className="qt-id">{x.id}</span> · {KIND[x.customer.kind] || 'Buyer'} · {formatDate(x.at)}</span>
                        <span className="ix-pitem__tags"><StatusBadge tone={QUOTE_STATE[st][1]}>{QUOTE_STATE[st][0]}</StatusBadge></span>
                      </button></li>
                    ); })}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table">
                      <caption className="sr-only">Quotes, {rows.length} shown</caption>
                      <thead><tr><th scope="col">Quote</th><th scope="col">Date</th><th scope="col">Buyer</th><th scope="col">Type</th><th scope="col" className="ix-num">Total</th><th scope="col">Valid until</th><th scope="col">Status</th></tr></thead>
                      <tbody>{rows.map((x) => { const st = quoteState(x); return (
                        <tr key={x.id} onClick={() => setOpen({ id: x.id })}>
                          <td><button type="button" className="ix-strong qt-id" onClick={(e) => { e.stopPropagation(); setOpen({ id: x.id }); }}>{x.id}</button></td>
                          <td className="ix-muted">{formatDate(x.at)}</td>
                          <td>{x.customer.name}</td>
                          <td className="ix-muted">{KIND[x.customer.kind] || 'Buyer'}</td>
                          <td className="ix-num">{formatBDT(quoteTotals(x).total)}</td>
                          <td className="ix-muted">{x.validUntil ? formatDate(x.validUntil) : '—'}</td>
                          <td><StatusBadge tone={QUOTE_STATE[st][1]}>{QUOTE_STATE[st][0]}</StatusBadge>{x.orderId ? <span className="ix-muted"> · {x.orderId}</span> : null}</td>
                        </tr>
                      ); })}</tbody>
                    </table>
                  </div>
                </>)}
                <div className="ix-foot"><span>{rows.length === 1 ? '1 quote' : rows.length + ' quotes'}</span></div>
              </section>
              <LearnMore topic="quotes" />
            </div>
          </div>
        </main>
      </div>
      <QuoteDialog open={open} onClose={close} onDone={done} />
    </div>
  );
}
