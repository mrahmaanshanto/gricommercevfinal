'use client';
// Collections — what to collect from buyers, by due date and by area (Wholesale review WH-F7). One row per buyer with
// money due: invoices due, how late, the amount, phone. Take payment spreads one payment across their invoices, oldest
// first, and gives a money receipt (TakePayment.jsx); Remind sends what is due on WhatsApp; Print list is the day's
// collection sheet for whoever goes out. Received lists every money receipt taken here (reprint, send again).
// Tabs: Overdue · Due in 7 days · Later · All · Received. Area (from the buyer's address) stands in for the route until
// reps and beats exist (WH-F10).
// Front end only: lib/collections.js (invoices + customer book), lib/allocations.js (receipts).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, EmptyState, StatusBadge } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField } from '@/components/ui/IndexKit';
import { formatBDT, formatDate } from '@/lib/format';
import { collectionRows } from '@/lib/collections';
import { getAllocations } from '@/lib/allocations';
import { MSG_EVENT } from '@/lib/messaging';
import { shareWhatsApp, printDoc, docLink } from '@/lib/shareDoc';
import { demoNow } from '@/lib/demoClock';
import { useWholesale } from '@/lib/useWholesale';
import { ReceiptView } from '@/components/docs/MoneyReceipt';
import { DocHead, OffScreen, S } from '@/components/docs/DocPaper';
import TakePayment from './TakePayment';

const money = (n) => formatBDT(n, { decimals: Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2 });
const TABS = [['overdue', 'Overdue'], ['week', 'Due in 7 days'], ['later', 'Later'], ['all', 'All'], ['received', 'Received']];
const DAY = 864e5;

const CSS = `
.co-id{font-family:var(--font-data)}
.co-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.co-late{color:var(--text-danger);font-weight:var(--weight-medium)}
.co-acts{display:flex;justify-content:flex-end;gap:var(--space-2);flex-wrap:wrap}
.co-area td{padding-top:var(--space-3);background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.co-group{display:flex;align-items:center;gap:var(--space-2)}
.co-pitem-acts{display:flex;gap:var(--space-2);flex-wrap:wrap;padding:0 var(--space-4) var(--space-3)}
.co-li>.ix-pitem{border-bottom:0}
.co-li{border-bottom:1px solid var(--border-subtle)}
`;

export default function Collections() {
  const ws = useWholesale();
  const [rows, setRows] = useState([]);
  const [paid, setPaid] = useState([]);
  const [now, setNow] = useState(0);
  const [tab, setTab] = useState('overdue');
  const [area, setArea] = useState('');
  const [group, setGroup] = useState('date');   // date | area
  const [find, setFind] = useState(false);
  const [q, setQ] = useState('');
  const [taking, setTaking] = useState(null);   // the buyer a payment is being taken from
  const [receipt, setReceipt] = useState(null);
  const sheet = useRef(null);

  const load = () => { setNow(demoNow()); setRows(collectionRows()); setPaid(getAllocations()); };
  useEffect(() => {
    load();
    const qs = new URLSearchParams(window.location.search);
    if (qs.get('tab') && TABS.some(([k]) => k === qs.get('tab'))) setTab(qs.get('tab'));
    window.addEventListener('gc:ledger', load);
    return () => window.removeEventListener('gc:ledger', load);
  }, [ws]);
  // the first tab with something in it, when the page opens on an empty Overdue
  useEffect(() => { if (tab === 'overdue' && rows.length && !rows.some((r) => r.bucket === 'overdue')) setTab('all'); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [rows.length]);

  const areas = useMemo(() => [...new Set(rows.map((r) => r.area))].sort(), [rows]);
  const counts = { overdue: 0, week: 0, later: 0, all: rows.length, received: paid.length };
  rows.forEach((r) => { counts[r.bucket] += 1; });
  const text = q.trim().toLowerCase();
  const shown = rows.filter((r) => (tab === 'all' || r.bucket === tab) && (!area || r.area === area)
    && (!text || [r.name, r.phone, r.area, ...r.invoices.map((i) => i.id)].join(' ').toLowerCase().includes(text)));
  const ordered = group === 'area' ? shown.slice().sort((a, b) => a.area.localeCompare(b.area) || b.late - a.late) : shown;
  const shownPaid = paid.filter((a) => !text || [a.customer, a.id, a.ref, ...a.lines.map((l) => l.id)].join(' ').toLowerCase().includes(text));
  const total = shown.reduce((a, r) => a + r.due, 0);
  const tabs = TABS.map(([k, label]) => ({ key: k, id: 'co-tab-' + k, label, count: counts[k], on: tab === k, onClick: () => setTab(k) }));
  const searching = find || !!q || !!area;
  const closeFind = () => { setFind(false); setQ(''); setArea(''); };

  const remind = (r) => {
    const late = r.overdueCount ? `${r.overdueCount} invoice${r.overdueCount > 1 ? 's' : ''} overdue (${money(r.overdue)}, ${r.late} days late)` : '';
    const res = shareWhatsApp({ kind: 'statement', id: '', to: { name: r.name, phone: r.phone }, total: r.due, dueAt: r.overdueCount ? 0 : r.nextDueAt,
      link: r.phone ? docLink('statement', r.phone) : undefined,
      lines: [`Invoices due: ${r.invoices.map((i) => i.id).join(', ')}`, late] });
    toast(res.toNumber ? `WhatsApp opened with the reminder for ${r.name}` : `WhatsApp opened. ${r.name} has no mobile number on file: choose the chat.`);
  };
  const printList = () => printDoc(sheet.current, 'Collections ' + formatDate(now || Date.now()));
  const late = (r) => (r.late > 0 ? <span className="co-late">{r.late} day{r.late === 1 ? '' : 's'} late</span> : <span>Due {formatDate(r.nextDueAt)}</span>);
  const buyerHref = (r) => (r.wholesale && ws ? '/wholesale-customer?phone=' : '/customer-statement?phone=') + encodeURIComponent(r.phone);

  const acts = (r) => (
    <>
      {r.phone ? <a className="ix-btn ix-btn--sm ix-btn--icon" href={'tel:' + r.phone} aria-label={'Call ' + r.name}><Icon name="phone" width="16" height="16" aria-hidden="true" /></a> : null}
      <button type="button" className="ix-btn ix-btn--sm" onClick={() => remind(r)}><Icon name="send" width="16" height="16" aria-hidden="true" />Remind</button>
      <button type="button" className="ix-btn ix-btn--sm" onClick={() => setTaking({ name: r.name, phone: r.phone, address: r.address })}>Take payment</button>
    </>
  );

  return (
    <div className="dc-screen ds" data-screen="Collections">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="orders-collections" />
        <main className="gc-shell__main">
          <Topbar crumb="Orders" page="Collections" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="hand-coins" title="Collections"
                about="What buyers owe, by due date and by area. Take one payment across several invoices, oldest first, and give a money receipt. Print the list for whoever goes out to collect."
                more={[{ label: 'Dues', href: '/dues' }, { label: 'Invoices', href: '/sales-invoices' }]}
                primary={{ label: 'Print list', onClick: printList }} />

              <section className="ix-card" aria-label="Collections">
                <div className="ix-bar">
                  {searching ? (<>
                    <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search buyer, phone or invoice no." onDone={closeFind} autoFocus />
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
                  </>) : (<>
                    <IndexTabs tabs={tabs} label="Collections by due date" />
                    <span className="ix-tools">
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
                    </span>
                  </>)}
                </div>
                {searching || tab !== 'received' ? (
                  <div className="ix-filters" role="group" aria-label="Filters">
                    {tab !== 'received' ? <select aria-label="Area" className={'ix-filter' + (area ? ' is-set' : '')} value={area} onChange={(e) => setArea(e.target.value)}><option value="">Area</option>{areas.map((a) => <option key={a}>{a}</option>)}</select> : null}
                    {tab !== 'received' ? <select aria-label="Group by" className={'ix-filter' + (group === 'area' ? ' is-set' : '')} value={group} onChange={(e) => setGroup(e.target.value)}><option value="date">By due date</option><option value="area">By area</option></select> : null}
                    {q || area ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setQ(''); setArea(''); }}>Clear all</button> : null}
                  </div>
                ) : null}

                {tab === 'received' ? (
                  shownPaid.length === 0 ? <div className="ix-empty"><EmptyState icon="receipt" title={q ? 'No receipt matches that search' : 'No payment taken here yet'} /></div> : (
                    <div className="ix-table-wrap">
                      <table className="ix-table">
                        <caption className="sr-only">Money receipts, {shownPaid.length} shown</caption>
                        <thead><tr><th scope="col">Receipt</th><th scope="col">Date</th><th scope="col">Buyer</th><th scope="col">Paid by</th><th scope="col">Invoices</th><th scope="col">Received by</th><th scope="col" className="ix-num">Amount</th></tr></thead>
                        <tbody>{shownPaid.map((a) => (
                          <tr key={a.id} onClick={(e) => { if (!e.target.closest('a,button')) setReceipt(a); }}>
                            <td><button type="button" className="ix-strong co-id" onClick={() => setReceipt(a)}>{a.id}</button></td>
                            <td className="ix-muted">{formatDate(a.at)}</td>
                            <td>{a.customer}</td>
                            <td>{a.method}{a.ref ? <span className="co-sub">{a.ref}</span> : null}</td>
                            <td className="co-id">{a.lines.map((l) => l.id).join(', ')}</td>
                            <td>{a.by}</td>
                            <td className="ix-num">{money(a.amount)}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )
                ) : ordered.length === 0 ? (
                  <div className="ix-empty"><EmptyState icon="hand-coins" title={q || area ? 'No buyer matches that search' : rows.length ? 'Nothing in this group' : 'Nobody owes you money'} /></div>
                ) : (<>
                  <ul className="ix-plist" aria-label="Buyers to collect from">
                    {ordered.map((r) => (
                      <li key={r.key} className="co-li">
                        <Link href={buyerHref(r)} className="ix-pitem">
                          <span className="ix-pitem__top"><b>{r.name}</b><span>{money(r.due)}</span></span>
                          <span className="ix-pitem__mid">{r.area} · {r.invoices.length} invoice{r.invoices.length === 1 ? '' : 's'} · {r.late > 0 ? `${r.late} day${r.late === 1 ? '' : 's'} late` : 'due ' + formatDate(r.nextDueAt)}</span>
                        </Link>
                        <div className="co-pitem-acts">{acts(r)}</div>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table gc-table--keep">
                      <caption className="sr-only">Buyers to collect from, {ordered.length} shown</caption>
                      <thead><tr><th scope="col">Buyer</th><th scope="col">Area</th><th scope="col">Invoices due</th><th scope="col">When</th><th scope="col" className="ix-num">Amount</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                      <tbody>
                        {ordered.map((r, i) => (
                          <React.Fragment key={r.key}>
                            {group === 'area' && (i === 0 || ordered[i - 1].area !== r.area) ? (
                              <tr className="co-area"><td colSpan={6}><span className="co-group"><Icon name="map-pin" width="14" height="14" aria-hidden="true" />{r.area} · {money(ordered.filter((x) => x.area === r.area).reduce((a, x) => a + x.due, 0))}</span></td></tr>
                            ) : null}
                            <tr>
                              <td><Link href={buyerHref(r)} className="ix-strong">{r.name}</Link><span className="co-sub">{r.phone || 'No mobile number'}{r.terms ? ' · ' + r.terms : ''}</span></td>
                              <td>{r.area}</td>
                              <td><span className="co-id">{r.invoices.map((x) => x.id).join(', ')}</span>{r.overdueCount ? <span className="co-sub">{r.overdueCount} overdue · {money(r.overdue)}</span> : null}</td>
                              <td>{late(r)}{r.bucket === 'overdue' ? null : <span className="co-sub">{Math.max(0, Math.ceil((r.nextDueAt - now) / DAY))} days left</span>}</td>
                              <td className="ix-num ix-strong">{money(r.due)}</td>
                              <td><div className="co-acts">{acts(r)}</div></td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>)}
                <div className="ix-foot"><span>{tab === 'received' ? `${shownPaid.length} receipt${shownPaid.length === 1 ? '' : 's'} · ${money(shownPaid.reduce((a, x) => a + x.amount, 0))}` : `${ordered.length} buyer${ordered.length === 1 ? '' : 's'} · ${money(total)} to collect`}</span></div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* the collection sheet, printed with the letterhead */}
      <OffScreen innerRef={sheet}>
        <DocHead title="Collection list" date={now || undefined} sub={[TABS.find(([k]) => k === tab)[1], area].filter(Boolean).join(' · ')} />
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Buyer', 'Area', 'Invoices', 'When', 'Amount', 'Collected'].map((h, i) => <th key={h} style={{ ...S.th, ...(i >= 4 ? S.num : {}) }}>{h}</th>)}</tr></thead>
          <tbody>{(tab === 'received' ? [] : ordered).map((r) => (
            <tr key={r.key}>
              <td style={S.td}><b style={{ fontWeight: 'var(--weight-medium)' }}>{r.name}</b><div style={S.muted}>{r.phone}</div><div style={S.muted}>{r.address}</div></td>
              <td style={S.td}>{r.area}</td>
              <td style={{ ...S.td, fontFamily: 'var(--font-data)' }}>{r.invoices.map((x) => x.id).join(', ')}</td>
              <td style={S.td}>{r.late > 0 ? `${r.late} day${r.late === 1 ? '' : 's'} late` : 'Due ' + formatDate(r.nextDueAt)}</td>
              <td style={{ ...S.td, ...S.num }}>{money(r.due)}</td>
              <td style={{ ...S.td, ...S.num, color: 'var(--text-muted)' }}>৳ ________</td>
            </tr>
          ))}</tbody>
        </table>
        <div style={{ ...S.row, fontWeight: 'var(--weight-semibold)' }}><span>Total to collect</span><span style={S.num}>{money(total)}</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '12mm', marginTop: '10mm' }}>
          <div style={{ borderTop: '1px solid var(--border-strong)', paddingTop: '1mm', ...S.muted }}>Collected by</div>
          <div style={{ borderTop: '1px solid var(--border-strong)', paddingTop: '1mm', ...S.muted }}>Cash handed to (cashier)</div>
        </div>
      </OffScreen>

      <TakePayment buyer={taking} onClose={(saved) => { setTaking(null); if (saved) load(); }} />
      <Dialog open={!!receipt} title={receipt ? `Money receipt · ${receipt.id}` : ''} onClose={() => setReceipt(null)} width={720}
        footer={<button type="button" className="gc-btn gc-btn--solid" onClick={() => setReceipt(null)}>Done</button>}>
        <ReceiptView alloc={receipt} />
      </Dialog>
    </div>
  );
}
