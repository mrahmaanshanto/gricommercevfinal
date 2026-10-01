'use client';
// Dues — what the shop will get and what it must pay, in one place.
//   You will get  customers with money due on their invoices (wholesale customers, and retail sales
//                 left on credit), grouped by customer with ageing from the invoice date (terms are
//                 not stored), plus the money payment partners (gateways, couriers) still hold.
//                 "Remind" copies a polite reminder to paste into SMS or WhatsApp.
//   You owe       open supplier bills grouped by supplier, aged by due date, and liabilities
//                 (salaries, sales commission, affiliate payouts, promotions) not fully paid, and a
//                 line for what is held for customers (loyalty points + wallet money, loyalty.js),
//                 which is not in the "You owe" total: customers use it rather than being paid.
// ?tab=get|owe picks the tab. Front end only: reads src/lib/invoices.js, supplierBills.js,
// liabilities.js and settlements.js; paying happens on Suppliers and Liabilities.

import React, { Fragment, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';
import { formatDate } from '@/lib/format';
import { MERCHANT } from '@/lib/merchant';
import { getInvoices } from '@/lib/invoices';
import { getBills, billLeft, getSuppliers, findSupplier, dayStart, daysFrom } from '@/lib/supplierBills';
import { getLiabilities, leftOf, liabStatus, LIAB_TYPES, LIAB_TONE } from '@/lib/liabilities';
import { getPartners, heldBy, clockNow } from '@/lib/settlements';
import { getMembers, pointsLiability, walletLiability } from '@/lib/loyalty';
import { AccPage, useBooks, money } from './accShared';

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
  if (d < 0) return <span className="gc-badge gc-badge--error">Overdue {plural(-d, 'day')}</span>;
  if (d === 0) return <span className="gc-badge gc-badge--warning">Due today</span>;
  return <span className="gc-badge gc-badge--slate">Due in {plural(d, 'day')}</span>;
}

const CSS = `
.du-bar{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:var(--space-3);padding:0 var(--space-4);border-bottom:1px solid var(--border-subtle)}
.du-tab b{margin-left:6px;font-weight:var(--weight-medium);color:var(--text-muted);font-family:var(--font-data);font-variant-numeric:tabular-nums}
.du-panel{display:flex;flex-direction:column}
.du-panel > .ac-head{border-top:1px solid var(--border-subtle)}
.du-panel > .ac-head:first-child{border-top:0}
.du-ages{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-3);padding:var(--space-4) var(--space-5)}
.du-age{display:flex;flex-direction:column;gap:6px;min-width:0;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.du-age span{font-size:var(--text-xs);color:var(--text-muted)}
.du-age b{font-family:var(--font-data);font-variant-numeric:tabular-nums;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.du-age i{display:block;height:4px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.du-age i s{display:block;height:100%;border-radius:var(--radius-full);text-decoration:none}
.du-tone-success s{background:var(--text-success)}
.du-tone-info s{background:var(--text-info)}
.du-tone-warning s{background:var(--text-warning)}
.du-tone-error s{background:var(--text-danger)}
.du-partner{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);margin:0 var(--space-5) var(--space-4);padding:var(--space-3) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle);color:inherit;text-decoration:none}
.du-partner:hover{border-color:var(--primary)}
.du-partner .du-logos{display:flex}
.du-partner .du-logos > *{margin-left:-6px;box-shadow:0 0 0 2px var(--surface-subtle);border-radius:var(--radius-lg)}
.du-partner .du-logos > *:first-child{margin-left:0}
.du-partner .du-text{flex:1;min-width:180px}
.du-partner .du-text b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.du-partner .du-text small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.du-partner .du-amt{font-family:var(--font-data);font-variant-numeric:tabular-nums;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.du-chips{display:flex;flex-wrap:wrap;gap:4px}
.du-chips .gc-badge{white-space:nowrap}
.du-exp{display:inline-flex;align-items:center;gap:4px}
.du-exp svg{transition:transform var(--duration-base) var(--ease-out)}
.du-exp[aria-expanded="true"] svg{transform:rotate(90deg)}
.du-sub td{background:var(--surface-subtle)}
.du-sub .ac-mini{margin:0;background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.du-sub .ac-mini tr:last-child td{border-bottom:0}
.du-type{display:flex;align-items:center;gap:var(--space-3);min-width:0}
.du-type > span:first-child{flex:none;display:grid;place-items:center;width:32px;height:32px;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.du-net-pos{color:var(--text-success)}
.du-net-neg{color:var(--text-danger)}
@media (max-width:760px){.du-ages{grid-template-columns:1fr 1fr}}
@media (max-width:640px){
  /* partner / wallet card: logos on their own row, then text · amount · chevron on one row */
  .du-partner .du-logos{flex-basis:100%}
  .du-partner .du-text{flex:1 1 0;min-width:0}
  .du-partner .du-amt{white-space:nowrap}
  .du-partner > svg{flex:none;margin-left:calc(var(--space-2) * -1)}
}
`;

export default function Dues() {
  const tick = useBooks();
  const [tab, setTab] = useState('get');
  const [openRow, setOpenRow] = useState('');

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

    const get = r2(customerDue + held);
    const owe = r2(supplierLeft + liabLeft);
    const overdueGet = r2(lateInvoices.reduce((a, i) => a + i.due, 0));
    const overdueOwe = r2(lateBills.reduce((a, b) => a + billLeft(b), 0) + lateLiabs.reduce((a, l) => a + leftOf(l), 0));
    return {
      now, today, customers, getAges, customerDue, partners, held, supplierRows, oweAges, supplierLeft, liabs, liabLeft, forCustomers,
      get, owe, net: r2(get - owe),
      overdue: { get: overdueGet, owe: overdueOwe, getCount: lateInvoices.length, oweCount: lateBills.length + lateLiabs.length },
    };
  }, [tick]);

  const fig = (n) => (data ? money(n) : '—');

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

  const counts = data ? { get: data.customers.length + (data.held > 0 ? 1 : 0), owe: data.supplierRows.length + data.liabs.length } : { get: 0, owe: 0 };

  const getPanel = data ? (
    <>
      <div className="ac-head"><div><h2>Ageing of what customers owe</h2><p>Counted from the invoice date. Payment terms are not stored, so an invoice from today is not due yet.</p></div></div>
      {ages(GET_AGES, data.getAges)}
      <Link href="/settlements" className="du-partner">
        <span className="du-logos" aria-hidden="true">{data.partners.slice(0, 4).map((x) => <BrandLogo key={x.p.id} brand={x.p.brand} size={32} decorative />)}</span>
        <span className="du-text"><b>With payment partners</b><small>{data.partners.length ? `${data.partners.map((x) => x.p.short).join(', ')} · gateways and couriers will pay this out` : 'Nothing waiting with gateways or couriers'}</small></span>
        <span className="du-amt">{money(data.held)}</span>
        <Icon name="chevron-right" width="18" height="18" aria-hidden="true" />
      </Link>
      <div className="ac-head"><div><h2>Customers who owe you</h2><p>{plural(data.customers.length, 'customer')} · {money(data.customerDue)} due on invoices</p></div></div>
      {data.customers.length === 0 ? <EmptyState icon="circle-check" title="No customer owes you money" body="Every invoice is paid. Sales left on credit show up here." /> : (
        <div className="gc-table-wrap">
          <table className="gc-table gc-table--compact gc-table--hoverable">
            <thead><tr><th scope="col">Customer</th><th scope="col" className="ac-num">Invoices</th><th scope="col">Oldest invoice</th><th scope="col">Age</th><th scope="col" className="ac-num">Amount due</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {data.customers.map((g) => {
                const open = openRow === g.key;
                const subId = 'du-inv-' + g.key.replace(/[^a-z0-9]/gi, '');
                return (
                  <Fragment key={g.key}>
                    <tr>
                      <td>
                        <span className="ac-strong">{g.name}</span>{' '}
                        <span className={'gc-badge gc-badge--' + (g.wholesale ? 'primary' : 'slate')}>{g.wholesale ? 'Wholesale' : 'Retail credit'}</span>
                        <span className="ac-sub ac-fig">{g.phone || 'No phone'}</span>
                      </td>
                      <td className="ac-num">
                        <button type="button" className="gc-btn gc-btn--xs gc-btn--neutral du-exp" aria-expanded={open} aria-controls={subId} onClick={() => setOpenRow(open ? '' : g.key)}>
                          <Icon name="chevron-right" width="14" height="14" aria-hidden="true" />{g.invoices.length}<span className="sr-only"> invoices of {g.name}</span>
                        </button>
                      </td>
                      <td>{formatDate(g.oldest)}<span className="ac-sub">{plural(-daysFrom(g.oldest, data.today), 'day')} ago</span></td>
                      <td><span className="du-chips">{GET_AGES.filter(([k]) => g.ages[k] > 0).map(([k, label, tone]) => <span key={k} className={'gc-badge gc-badge--' + tone}>{label} · {money(g.ages[k])}</span>)}</span></td>
                      <td className="ac-num ac-fig ac-strong">{money(g.due)}</td>
                      <td>
                        <div className="ac-row-actions">
                          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => remind(g)} aria-label={`Copy a reminder for ${g.name}`}><Icon name="message-square-text" width="16" height="16" aria-hidden="true" /> Remind</button>
                          {g.digits ? <Link href={`/customer-statement?phone=${g.digits}`} className="gc-btn gc-btn--sm gc-btn--soft" aria-label={`Statement of ${g.name}`}>Statement</Link> : null}
                        </div>
                      </td>
                    </tr>
                    {open ? (
                      <tr className="du-sub" id={subId}>
                        <td colSpan={6}>
                          <table className="ac-mini">
                            <thead><tr><th scope="col">Invoice</th><th scope="col">Date</th><th scope="col" className="ac-num">Total</th><th scope="col" className="ac-num">Paid</th><th scope="col" className="ac-num">Due</th></tr></thead>
                            <tbody>
                              {g.invoices.map((inv) => (
                                <tr key={inv.id}>
                                  <td><Link href={`/sales-invoice?id=${encodeURIComponent(inv.id)}`} className="ac-fig">{inv.id}</Link></td>
                                  <td>{formatDate(inv.at)}</td>
                                  <td className="ac-num ac-fig">{money(inv.totals.total)}</td>
                                  <td className="ac-num ac-fig">{money(r2(inv.totals.total - inv.due))}</td>
                                  <td className="ac-num ac-fig ac-strong">{money(inv.due)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  ) : null;

  const owePanel = data ? (
    <>
      <div className="ac-head"><div><h2>Ageing of supplier bills</h2><p>Counted from each bill’s due date.</p></div></div>
      {ages(OWE_AGES, data.oweAges)}
      <div className="ac-head"><div><h2>Suppliers</h2><p>{plural(data.supplierRows.length, 'supplier')} · {money(data.supplierLeft)} left on open bills</p></div><Link href="/suppliers" className="gc-btn gc-btn--sm gc-btn--neutral">All suppliers</Link></div>
      {data.supplierRows.length === 0 ? <EmptyState icon="circle-check" title="No open supplier bills" body="Every bill is paid. Bills from receiving goods show up here." /> : (
        <div className="gc-table-wrap">
          <table className="gc-table gc-table--compact gc-table--hoverable">
            <thead><tr><th scope="col">Supplier</th><th scope="col" className="ac-num">Open bills</th><th scope="col">Next due</th><th scope="col" className="ac-num">Left to pay</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {data.supplierRows.map((g) => (
                <tr key={g.id}>
                  <td><span className="ac-strong">{g.name}</span>{g.kind ? <span className="ac-sub">{g.kind}</span> : null}</td>
                  <td className="ac-num ac-fig">{g.bills.length}</td>
                  <td><DueBadge due={g.next} today={data.today} /><span className="ac-sub">{formatDate(g.next)}</span></td>
                  <td className="ac-num ac-fig ac-strong">{money(g.left)}</td>
                  <td><div className="ac-row-actions"><Link href={`/suppliers?pay=${encodeURIComponent(g.id)}`} className="gc-btn gc-btn--sm gc-btn--solid" aria-label={`Pay ${g.name}`}>Pay</Link></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="ac-head"><div><h2>Salaries, commission and other liabilities</h2><p>{plural(data.liabs.length, 'liability', 'liabilities')} · {money(data.liabLeft)} left to pay</p></div><Link href="/liabilities" className="gc-btn gc-btn--sm gc-btn--neutral">All liabilities</Link></div>
      {data.liabs.length === 0 ? <EmptyState icon="circle-check" title="Nothing left to pay" body="Salaries, commission, affiliate payouts and promotions are all paid." /> : (
        <div className="gc-table-wrap">
          <table className="gc-table gc-table--compact gc-table--hoverable">
            <thead><tr><th scope="col">What</th><th scope="col">Owed to</th><th scope="col">Due</th><th scope="col" className="ac-num">Left to pay</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {data.liabs.map((l) => {
                const t = LIAB_TYPES[l.type] || LIAB_TYPES.other;
                const st = liabStatus(l, data.now);
                return (
                  <tr key={l.id}>
                    <td><div className="du-type"><span aria-hidden="true"><Icon name={t.icon} width="16" height="16" /></span><span><span className="ac-strong">{l.title}</span><span className="ac-sub">{t.label} · <span className="ac-fig">{l.id}</span></span></span></div></td>
                    <td>{l.party}</td>
                    <td><DueBadge due={l.due} today={data.today} />{st === 'Partly paid' ? <> <span className={'gc-badge gc-badge--' + LIAB_TONE[st]}>{st}</span></> : null}<span className="ac-sub">{formatDate(l.due)}</span></td>
                    <td className="ac-num ac-fig ac-strong">{money(leftOf(l))}</td>
                    <td><div className="ac-row-actions"><Link href={`/liabilities?id=${encodeURIComponent(l.id)}`} className="gc-btn gc-btn--sm gc-btn--solid" aria-label={`Settle ${l.title}`}>Settle</Link></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Link href="/wallet?tab=wallets" className="du-partner" style={{ marginTop: 'var(--space-4)' }}>
        <span className="du-type" aria-hidden="true"><span><Icon name="wallet" width="16" height="16" /></span></span>
        <span className="du-text"><b>Customer wallets and points</b><small>{money(data.forCustomers.wallets)} wallet money and advances · {money(data.forCustomers.points)} in loyalty points · not in the total above: customers use it when they buy, or ask for it back</small></span>
        <span className="du-amt">{money(data.forCustomers.total)}</span>
        <Icon name="chevron-right" width="18" height="18" aria-hidden="true" />
      </Link>
    </>
  ) : null;

  return (
    <AccPage screen="Dues" active="acc-dues" page="Dues" title="Dues" css={CSS}
      description="What the shop will get from customers and payment partners, and what it must pay suppliers, staff and others.">
      <div className="gc-kpis gc-kpis--tight">
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-success-soft)', color: 'var(--text-success)' }}><Icon name="arrow-down-left" width="22" height="22" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">You will get</p><p className="gc-kpi__value">{fig(data?.get)}<small>{data ? `${money(data.customerDue)} customers · ${money(data.held)} partners` : ''}</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-error-soft)', color: 'var(--text-danger)' }}><Icon name="arrow-up-right" width="22" height="22" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">You owe</p><p className="gc-kpi__value">{fig(data?.owe)}<small>{data ? `${money(data.supplierLeft)} suppliers · ${money(data.liabLeft)} other` : ''}</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="scale" width="22" height="22" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Net</p><p className="gc-kpi__value"><span className={data ? (data.net >= 0 ? 'du-net-pos' : 'du-net-neg') : ''}>{data ? (data.net < 0 ? '−' : '') + money(data.net) : '—'}</span><small>{data ? (data.net >= 0 ? 'more to get than to pay' : 'more to pay than to get') : ''}</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-warning-soft)', color: 'var(--text-warning)' }}><Icon name="clock-alert" width="22" height="22" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Overdue</p><p className="gc-kpi__value">{fig(data ? data.overdue.get + data.overdue.owe : 0)}<small>{data ? `${data.overdue.getCount} to get · ${data.overdue.oweCount} to pay` : ''}</small></p></div></div>
      </div>

      <section className="gc-card ac-card">
        <div className="du-bar">
          <div className="gc-tabs" role="tablist" aria-label="Dues" style={{ borderBottom: 0, overflow: 'visible', flexWrap: 'wrap' }}>
            {TABS.map(([id, label]) => (
              <button key={id} id={'du-tab-' + id} type="button" role="tab" aria-selected={tab === id} aria-controls={'du-panel-' + id} className={'gc-tab du-tab' + (tab === id ? ' gc-tab--active' : '')} onClick={() => pickTab(id)}>
                {label}<b>{data ? money(id === 'get' ? data.get : data.owe) : ''}</b><span className="sr-only"> · {counts[id]} rows</span>
              </button>
            ))}
          </div>
        </div>
        <div className="du-panel" role="tabpanel" id={'du-panel-' + tab} aria-labelledby={'du-tab-' + tab}>
          {!data ? <EmptyState icon="loader" title="Reading the books" /> : tab === 'get' ? getPanel : owePanel}
        </div>
      </section>
    </AccPage>
  );
}
