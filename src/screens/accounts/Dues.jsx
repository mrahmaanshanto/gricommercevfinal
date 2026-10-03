'use client';
// Dues — what the shop will get and what it must pay, laid out like a Shopify list (docs/shopify-style.md):
//   Figures       net, overdue, what payment partners hold (→ Payouts) and what is held for customers
//                 (loyalty points + wallet money, loyalty.js; not in "You owe": customers use it rather than
//                 being paid; → Customer wallets)
//   You will get  ageing from the invoice date (terms are not stored), then customers with money due on
//                 their invoices (wholesale customers, and retail sales left on credit). A row opens its
//                 invoices, "Record payment" (one payment across several invoices, duesParts.jsx), "Write off" on
//                 a small balance (waits for approval), "Remind" (copies a polite reminder to paste into SMS or
//                 WhatsApp) and the statement.
//   You owe       ageing of supplier bills by due date, open bills by supplier (a row opens Pay on
//                 Suppliers) and liabilities not fully paid (a row opens Pay on Bills to pay).
// ?tab=get|owe picks the tab. Front end only: reads src/lib/invoices.js, supplierBills.js,
// liabilities.js and settlements.js; paying happens on Suppliers and Liabilities.

import React, { Fragment, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { EmptyState, InfoTip, StatusBadge } from '@/components/ui';
import { MetricStrip, IndexTabs, LearnMore } from '@/components/ui/IndexKit';
import { formatDate } from '@/lib/format';
import { MERCHANT } from '@/lib/merchant';
import { getInvoices } from '@/lib/invoices';
import { getBills, billLeft, getSuppliers, findSupplier, dayStart, daysFrom } from '@/lib/supplierBills';
import { getLiabilities, leftOf, liabStatus, LIAB_TYPES, LIAB_TONE } from '@/lib/liabilities';
import { getPartners, heldBy, clockNow } from '@/lib/settlements';
import { getMembers, pointsLiability, walletLiability } from '@/lib/loyalty';
import { WRITE_OFF_MAX, getWriteOffs } from '@/lib/allocations';
import { AccPage, useBooks, money } from './accShared';
import { AllocateDialog, WriteOffDialog } from './duesParts';

const TABS = [['get', 'You will get'], ['owe', 'You owe']];
const r2 = (n) => Math.round(n * 100) / 100;
const digits = (p) => String(p || '').replace(/[^0-9]/g, '').replace(/^88/, '');
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;

// ageing buckets: [key, label, tone]
const GET_AGES = [['0', 'Not due', 'success'], ['30', '1–30 days', 'info'], ['60', '31–60 days', 'warning'], ['90', '60+ days', 'error']];
const OWE_AGES = [['0', 'Not due yet', 'success'], ['30', 'Overdue 1–30 days', 'warning'], ['60', 'Overdue 31–60', 'error'], ['90', 'Overdue 60+', 'error']];
/** Bucket for an age in days (0 or less = not due). */
const bucketOf = (days) => (days <= 0 ? '0' : days <= 30 ? '30' : days <= 60 ? '60' : '90');
const emptyAges = () => ({ 0: 0, 30: 0, 60: 0, 90: 0 });

/** Overdue N days · Due today · Due in N days */
function DueBadge({ due, today }) {
  const d = daysFrom(due, today);
  if (d < 0) return <StatusBadge tone="error">Overdue {plural(-d, 'day')}</StatusBadge>;
  if (d === 0) return <StatusBadge tone="warning">Due today</StatusBadge>;
  return <StatusBadge tone="neutral" icon="clock">Due in {plural(d, 'day')}</StatusBadge>;
}

const CSS = `
.du-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.du-ages{display:flex;overflow-x:auto;border-bottom:1px solid var(--border-subtle);scrollbar-width:none}
.du-ages::-webkit-scrollbar{display:none}
.du-age{display:flex;flex:1 1 0;flex-direction:column;gap:4px;min-width:130px;padding:var(--space-3) var(--space-4);border-left:1px solid var(--border-subtle)}
.du-age:first-child{border-left:0}
.du-age span{font-size:var(--text-xs);color:var(--text-body);white-space:nowrap}
.du-age b{font-family:var(--font-data);font-variant-numeric:tabular-nums;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.du-age i{display:block;height:4px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.du-age i s{display:block;height:100%;border-radius:var(--radius-full);text-decoration:none}
.du-tone-success s{background:var(--text-success)}
.du-tone-info s{background:var(--text-info)}
.du-tone-warning s{background:var(--text-warning)}
.du-tone-error s{background:var(--text-danger)}
.du-detail{display:flex;flex-direction:column;gap:var(--space-3);max-width:720px}
.du-detail .ac-mini{margin:0;background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.du-detail .ac-mini tr:last-child td{border-bottom:0}
.du-acts{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.du-chips{display:flex;flex-wrap:wrap;gap:6px}
.du-chev{color:var(--text-muted);transition:transform var(--duration-base) var(--ease-out)}
tr[aria-expanded="true"] .du-chev{transform:rotate(90deg)}
.du-pos{color:var(--text-success)}
.du-neg{color:var(--text-danger)}
`;
const ABOUT = 'What the shop will get from customers and payment partners, and what it must pay suppliers, staff and others.';

export default function Dues() {
  const tick = useBooks();
  const [tab, setTab] = useState('get');
  const [openRow, setOpenRow] = useState('');
  const [alloc, setAlloc] = useState(null);     // a customer group to record a payment for
  const [writeOff, setWriteOff] = useState(null); // an invoice to write off

  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get('tab');
    if (TABS.some((x) => x[0] === want)) setTab(want);
  }, []);
  const pickTab = (id) => {
    setTab(id);
    const u = new URL(window.location.href); u.searchParams.set('tab', id);
    window.history.replaceState(window.history.state, '', u.pathname + u.search);
  };

  const data = useMemo(() => {
    if (!tick) return null;
    const now = clockNow();
    const today = dayStart(now);

    // ---- customers who owe the shop
    const byCustomer = new Map();
    getInvoices().filter((inv) => inv.due > 0).forEach((inv) => {
      const c = inv.customer || {};
      const key = digits(c.phone) || 'name:' + (c.name || 'Walk-in customer');
      if (!byCustomer.has(key)) byCustomer.set(key, { key, name: c.name || 'Walk-in customer', phone: c.phone || '', digits: digits(c.phone), wholesale: false, invoices: [], due: 0, oldest: Infinity, ages: emptyAges() });
      const g = byCustomer.get(key);
      g.invoices.push(inv);
      g.wholesale = g.wholesale || !!inv.wholesale;
      g.due = r2(g.due + inv.due);
      g.oldest = Math.min(g.oldest, inv.at);
      g.ages[bucketOf(-daysFrom(inv.at, today))] += inv.due;
    });
    const customers = [...byCustomer.values()].map((g) => ({ ...g, invoices: g.invoices.sort((a, b) => a.at - b.at) })).sort((a, b) => b.due - a.due);
    const getAges = emptyAges();
    customers.forEach((g) => Object.keys(getAges).forEach((k) => { getAges[k] += g.ages[k]; }));
    const customerDue = r2(customers.reduce((a, g) => a + g.due, 0));
    const lateInvoices = customers.flatMap((g) => g.invoices).filter((inv) => -daysFrom(inv.at, today) > 30);

    // ---- money partners hold
    const partners = getPartners().map((p) => ({ p, held: heldBy(p.id) })).filter((x) => x.held > 0).sort((a, b) => b.held - a.held);
    const held = r2(partners.reduce((a, x) => a + x.held, 0));

    // ---- suppliers the shop owes
    const suppliers = getSuppliers();
    const bySupplier = new Map();
    getBills().filter((b) => billLeft(b) > 0).forEach((b) => {
      if (!bySupplier.has(b.supplier)) {
        const s = findSupplier(b.supplier, suppliers);
        bySupplier.set(b.supplier, { id: b.supplier, name: s ? s.name : b.supplier, kind: s ? s.kind : '', bills: [], left: 0, next: Infinity, ages: emptyAges() });
      }
      const g = bySupplier.get(b.supplier);
      const left = billLeft(b);
      g.bills.push(b);
      g.left = r2(g.left + left);
      g.next = Math.min(g.next, b.due);
      g.ages[bucketOf(-daysFrom(b.due, today))] += left;
    });
    const supplierRows = [...bySupplier.values()].sort((a, b) => a.next - b.next || b.left - a.left);
    const oweAges = emptyAges();
    supplierRows.forEach((g) => Object.keys(oweAges).forEach((k) => { oweAges[k] += g.ages[k]; }));
    const supplierLeft = r2(supplierRows.reduce((a, g) => a + g.left, 0));
    const lateBills = supplierRows.flatMap((g) => g.bills).filter((b) => daysFrom(b.due, today) < 0);

    // ---- liabilities not fully paid
    const liabs = getLiabilities().filter((l) => leftOf(l) > 0).sort((a, b) => a.due - b.due);
    const liabLeft = r2(liabs.reduce((a, l) => a + leftOf(l), 0));
    const lateLiabs = liabs.filter((l) => liabStatus(l, now) === 'Overdue');

    // ---- held for customers (loyalty points and wallet money): shown, not added to "You owe"
    const loyMembers = getMembers();
    const loyPts = pointsLiability(loyMembers);
    const loyWallet = walletLiability(loyMembers);
    const forCustomers = { points: loyPts.value, wallets: loyWallet.total, total: r2(loyPts.value + loyWallet.total), count: loyWallet.customers.length };

    const woWaiting = new Set(getWriteOffs().filter((w) => w.status === 'waiting').map((w) => w.invoiceId));
    const get = r2(customerDue + held);
    const owe = r2(supplierLeft + liabLeft);
    const overdueGet = r2(lateInvoices.reduce((a, i) => a + i.due, 0));
    const overdueOwe = r2(lateBills.reduce((a, b) => a + billLeft(b), 0) + lateLiabs.reduce((a, l) => a + leftOf(l), 0));
    return {
      now, today, customers, getAges, woWaiting, customerDue, partners, held, supplierRows, oweAges, supplierLeft, liabs, liabLeft, forCustomers,
      get, owe, net: r2(get - owe),
      overdue: { get: overdueGet, owe: overdueOwe, getCount: lateInvoices.length, oweCount: lateBills.length + lateLiabs.length },
    };
  }, [tick]);

  const remind = async (g) => {
    const ids = g.invoices.map((i) => i.id);
    const text = `Dear ${g.name}, ${money(g.due)} is due on ${ids.length === 1 ? 'invoice' : 'invoices'} ${ids.join(', ')}. `
      + `Please pay by bKash 01700-000000 or bank transfer at your earliest convenience. Thank you. — ${MERCHANT.name}`;
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch { /* try the old way */ }
    if (!ok) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); ta.remove();
      } catch { ok = false; }
    }
    if (ok) toast(`Reminder copied · paste it in SMS or WhatsApp to ${g.name}`);
    else toast('Could not copy. Your browser blocked the clipboard.', { tone: 'error' });
  };

  const ages = (list, totals) => {
    const max = Math.max(1, ...Object.values(totals));
    return (
      <div className="du-ages" role="list" aria-label="Ageing">
        {list.map(([k, label, tone]) => (
          <div key={k} className={'du-age du-tone-' + tone} role="listitem">
            <span>{label}</span>
            <b>{money(totals[k])}</b>
            <i aria-hidden="true"><s style={{ width: `${Math.round((totals[k] / max) * 100)}%` }} /></i>
          </div>
        ))}
      </div>
    );
  };
  const go = (href) => (e) => { if (e.target.closest('a,button')) return; navigate(href); };
  const toggle = (key) => setOpenRow(openRow === key ? '' : key);

  // a customer's invoices and the reminder / statement: the row's details, opened by a click on the row
  const customerDetail = (g) => (
    <div className="du-detail">
      <div className="du-chips">{GET_AGES.filter(([k]) => g.ages[k] > 0).map(([k, label, tone]) => <StatusBadge key={k} tone={tone}>{label} · {money(g.ages[k])}</StatusBadge>)}</div>
      <table className="ac-mini">
        <thead><tr><th scope="col">Invoice</th><th scope="col">Date</th><th scope="col" className="ac-num">Total</th><th scope="col" className="ac-num">Paid</th><th scope="col" className="ac-num">Due</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>
          {g.invoices.map((inv) => {
            const waiting = data && data.woWaiting.has(inv.id);
            return (
              <tr key={inv.id}>
                <td><Link href={`/sales-invoice?id=${encodeURIComponent(inv.id)}`} className="ac-fig">{inv.id}</Link></td>
                <td>{formatDate(inv.at)}</td>
                <td className="ac-num ac-fig">{money(inv.totals.total)}</td>
                <td className="ac-num ac-fig">{money(r2(inv.totals.total - inv.due))}</td>
                <td className="ac-num ac-fig ac-strong">{money(inv.due)}</td>
                <td className="ac-num">{waiting ? <StatusBadge tone="warning" icon="hourglass">Write-off waiting</StatusBadge> : inv.due <= WRITE_OFF_MAX ? <button type="button" className="gc-btn gc-btn--xs gc-btn--neutral" onClick={() => setWriteOff(inv)} aria-label={`Write off ${inv.id}`}>Write off</button> : null}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="du-acts">
        <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => setAlloc(g)} aria-label={`Record a payment from ${g.name}`}><Icon name="hand-coins" width="16" height="16" aria-hidden="true" />Record payment</button>
        <button type="button" className="ix-btn ix-btn--sm" onClick={() => remind(g)} aria-label={`Copy a reminder for ${g.name}`}><Icon name="message-square-text" width="16" height="16" aria-hidden="true" />Remind</button>
        {g.digits ? <Link href={`/customer-statement?phone=${g.digits}`} className="ix-btn ix-btn--sm" aria-label={`Statement of ${g.name}`}>Statement</Link> : null}
        <span className="ix-muted du-fig">{g.phone || 'No phone'}</span>
      </div>
    </div>
  );

  const getPanel = data ? (<>
    {ages(GET_AGES, data.getAges)}
    {data.customers.length === 0 ? <div className="ix-empty"><EmptyState icon="circle-check" title="No customer owes you money" body="Every invoice is paid. Sales left on credit show up here." /></div> : (<>
      <ul className="ix-plist" aria-label="Customers who owe you">
        {data.customers.map((g) => (
          <li key={g.key}>
            <button type="button" className="ix-pitem" aria-expanded={openRow === g.key} onClick={() => toggle(g.key)}>
              <span className="ix-pitem__top"><b>{g.name}</b><span className="du-fig">{money(g.due)}</span></span>
              <span className="ix-pitem__mid">{plural(g.invoices.length, 'invoice')} · oldest {formatDate(g.oldest)}</span>
            </button>
            {openRow === g.key ? <div className="ac-pdetail">{customerDetail(g)}</div> : null}
          </li>
        ))}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table gc-table--keep">
          <caption className="sr-only">Customers who owe you, {money(data.customerDue)} due on invoices</caption>
          <thead><tr><th scope="col">Customer</th><th scope="col">Type</th><th scope="col" className="ix-num">Invoices</th><th scope="col">Oldest invoice</th><th scope="col" className="ix-num">Amount due</th></tr></thead>
          <tbody>
            {data.customers.map((g) => {
              const open = openRow === g.key;
              return (
                <Fragment key={g.key}>
                  <tr aria-expanded={open} onClick={(e) => { if (!e.target.closest('a,button')) toggle(g.key); }}>
                    <td><span className="ac-logo"><Icon name="chevron-right" width="14" height="14" className="du-chev" aria-hidden="true" /><span className="ix-strong">{g.name}</span></span></td>
                    <td><StatusBadge tone={g.wholesale ? 'primary' : 'neutral'} icon={g.wholesale ? 'warehouse' : 'store'}>{g.wholesale ? 'Wholesale' : 'Retail credit'}</StatusBadge></td>
                    <td className="ix-num">{g.invoices.length}</td>
                    <td>{formatDate(g.oldest)} <span className="ix-muted">· {plural(-daysFrom(g.oldest, data.today), 'day')} ago</span></td>
                    <td className="ix-num du-fig ix-strong">{money(g.due)}</td>
                  </tr>
                  {open ? <tr className="ac-detail"><td colSpan={5}>{customerDetail(g)}</td></tr> : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>)}
  </>) : null;

  const owePanel = data ? (<>
    {ages(OWE_AGES, data.oweAges)}
    <section aria-labelledby="du-sup-h">
      <header className="ix-card__head"><h2 id="du-sup-h">Suppliers</h2><Link href="/suppliers">All suppliers</Link></header>
      <div style={{ height: 'var(--space-3)' }} />
      {data.supplierRows.length === 0 ? <div className="ix-empty"><EmptyState icon="circle-check" title="No open supplier bills" body="Every bill is paid. Bills from receiving goods show up here." /></div> : (<>
        <ul className="ix-plist" aria-label="Suppliers">
          {data.supplierRows.map((g) => (
            <li key={g.id}>
              <Link href={`/suppliers?pay=${encodeURIComponent(g.id)}`} className="ix-pitem">
                <span className="ix-pitem__top"><b>{g.name}</b><span className="du-fig">{money(g.left)}</span></span>
                <span className="ix-pitem__mid">{plural(g.bills.length, 'open bill')} · next {formatDate(g.next)}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table gc-table--keep">
            <caption className="sr-only">Suppliers, {money(data.supplierLeft)} left on open bills</caption>
            <thead><tr><th scope="col">Supplier</th><th scope="col" className="ix-num">Open bills</th><th scope="col">Next due</th><th scope="col" className="ix-num">Left to pay</th></tr></thead>
            <tbody>
              {data.supplierRows.map((g) => (
                <tr key={g.id} onClick={go(`/suppliers?pay=${encodeURIComponent(g.id)}`)}>
                  <td><Link href={`/suppliers?pay=${encodeURIComponent(g.id)}`} className="ix-strong" aria-label={`Pay ${g.name}`}>{g.name}</Link>{g.kind ? <span className="ix-muted"> · {g.kind}</span> : null}</td>
                  <td className="ix-num">{g.bills.length}</td>
                  <td><DueBadge due={g.next} today={data.today} /> <span className="ix-muted">{formatDate(g.next)}</span></td>
                  <td className="ix-num du-fig ix-strong">{money(g.left)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>)}
    </section>
    <section className="ac-sec" aria-labelledby="du-liab-h">
      <header className="ix-card__head"><h2 id="du-liab-h">Salaries, commission and other liabilities</h2><Link href="/liabilities">Bills to pay</Link></header>
      <div style={{ height: 'var(--space-3)' }} />
      {data.liabs.length === 0 ? <div className="ix-empty"><EmptyState icon="circle-check" title="Nothing left to pay" body="Salaries, commission, affiliate payouts and promotions are all paid." /></div> : (<>
        <ul className="ix-plist" aria-label="Salaries, commission and other liabilities">
          {data.liabs.map((l) => (
            <li key={l.id}>
              <Link href={`/liabilities?id=${encodeURIComponent(l.id)}`} className="ix-pitem">
                <span className="ix-pitem__top"><b>{l.title}</b><span className="du-fig">{money(leftOf(l))}</span></span>
                <span className="ix-pitem__mid">{l.party} · due {formatDate(l.due)}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table gc-table--keep">
            <caption className="sr-only">Salaries, commission and other liabilities, {money(data.liabLeft)} left to pay</caption>
            <thead><tr><th scope="col">What</th><th scope="col">Owed to</th><th scope="col">Due</th><th scope="col" className="ix-num">Left to pay</th></tr></thead>
            <tbody>
              {data.liabs.map((l) => {
                const t = LIAB_TYPES[l.type] || LIAB_TYPES.other;
                const st = liabStatus(l, data.now);
                return (
                  <tr key={l.id} onClick={go(`/liabilities?id=${encodeURIComponent(l.id)}`)} title={`${t.label} · ${l.id}`}>
                    <td><Link href={`/liabilities?id=${encodeURIComponent(l.id)}`} className="ix-strong" aria-label={`Settle ${l.title}`}>{l.title}</Link></td>
                    <td><span className="ac-trunc">{l.party}</span></td>
                    <td><DueBadge due={l.due} today={data.today} />{st === 'Partly paid' ? <> <StatusBadge tone={LIAB_TONE[st]}>{st}</StatusBadge></> : null}</td>
                    <td className="ix-num du-fig ix-strong">{money(leftOf(l))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>)}
    </section>
  </>) : null;

  const tabs = TABS.map(([id, label]) => ({ key: id, id: 'du-tab-' + id, label, count: data ? money(id === 'get' ? data.get : data.owe) : null, on: tab === id, onClick: () => pickTab(id) }));

  return (
    <AccPage screen="Dues" active="acc-dues" page="Dues" title="Dues" css={CSS} icon="scale" about={ABOUT}
      more={[{ label: 'All suppliers', href: '/suppliers' }, { label: 'Bills to pay', href: '/liabilities' }, { label: 'Payouts', href: '/settlements' }, { label: 'Customer wallets', href: '/wallet?tab=wallets' }]}>
      <MetricStrip label="Dues" items={[
        { label: 'Net', value: data ? <span className={data.net >= 0 ? 'du-pos' : 'du-neg'}>{(data.net < 0 ? '−' : '') + money(data.net)}</span> : '—', sub: data ? (data.net >= 0 ? 'more to get than to pay' : 'more to pay than to get') : '' },
        { label: 'Overdue', value: data ? money(data.overdue.get + data.overdue.owe) : '—', sub: data ? `${data.overdue.getCount} to get · ${data.overdue.oweCount} to pay` : '' },
        { label: 'With payment partners', value: data ? money(data.held) : '—', sub: data ? plural(data.partners.length, 'partner') : '', href: '/settlements' },
        { label: 'Customer wallets and points', value: data ? money(data.forCustomers.total) : '—', sub: 'not in You owe', href: '/wallet?tab=wallets' },
      ]} />

      <section className="ix-card" aria-label="Dues">
        <div className="ix-bar">
          <IndexTabs tabs={tabs} label="Dues" />
          <span className="ix-tools">
            <InfoTip text={tab === 'get' ? 'Counted from the invoice date. Payment terms are not stored, so an invoice from today is not due yet. Money with payment partners is in You will get.' : 'Counted from each bill’s due date. Customer wallets and points are not in You owe: customers use them when they buy, or ask for them back.'} />
          </span>
        </div>
        <div role="tabpanel" id={'du-panel-' + tab} aria-labelledby={'du-tab-' + tab}>
          {!data ? <p className="ac-wait">Reading the books…</p> : tab === 'get' ? getPanel : owePanel}
        </div>
      </section>
      <LearnMore topic="dues" />
      {alloc ? <AllocateDialog g={alloc} onClose={() => setAlloc(null)} /> : null}
      {writeOff ? <WriteOffDialog inv={writeOff} onClose={() => setWriteOff(null)} /> : null}
    </AccPage>
  );
}
