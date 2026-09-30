'use client';
// CustomerStatement — the statement of account of one customer (?phone=<mobile number>): who they
// are, what they were invoiced, paid and still owe, their advance credit, and a running-balance
// ledger of every invoice, payment (voided ones struck through), credit change and return, in date
// order. The ledger can be limited to a date range and printed (only the statement sheet prints).
// Front end only: built from the customer book, the invoices, customer credit and the return history.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { EmptyState } from '@/components/ui';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { MERCHANT } from '@/lib/merchant';
import { getCustomers, findCustomer, tierOf, phoneDigits } from '@/lib/customers';
import { getInvoices, paymentLog, creditOf, creditLog, CREDIT_METHOD } from '@/lib/invoices';
import { getReturns } from '@/lib/returns';

const r2 = (n) => Math.round(n * 100) / 100;
const money = (n) => formatBDT(n, { decimals: Number.isInteger(r2(n)) ? 0 : 2 });
/** Balance in words: what the customer owes, or what the shop holds for them. */
const balanceText = (n) => (n > 0 ? `${money(n)} due` : n < 0 ? `${money(-n)} advance` : 'Settled');
const ORDER = { invoice: 0, payment: 1, credit: 2, return: 3 };
const KIND = { invoice: ['Invoice', 'primary'], payment: ['Payment', 'success'], credit: ['Credit', 'info'], return: ['Return', 'warning'] };

const CSS = `
.cs-head{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3)}
.cs-back{display:grid;place-items:center;width:44px;height:44px;flex:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);color:var(--text-body)}
.cs-title{margin:0;font-size:var(--text-2xl);line-height:var(--text-2xl-lh);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cs-meta{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.cs-actions{margin-left:auto;display:flex;flex-wrap:wrap;gap:var(--space-2)}
.cs-card{overflow:hidden}
.cs-card__head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:var(--space-3);padding:var(--space-4) var(--space-5) var(--space-3)}
.cs-card__head h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cs-who{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--space-4) var(--space-5);margin:0;padding:var(--space-4) var(--space-5)}
.cs-who div{min-width:0}
.cs-who dt{font-size:var(--text-xs);color:var(--text-muted)}
.cs-who dd{margin:2px 0 0;font-size:var(--text-sm);color:var(--text-heading);overflow-wrap:anywhere}
.cs-range{display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-3)}
.cs-range .gc-input{width:170px}
.cs-card .gc-table th,.cs-card .gc-table td{padding-left:var(--space-2);padding-right:var(--space-2);white-space:normal}
.cs-card .gc-table th:first-child,.cs-card .gc-table td:first-child{padding-left:var(--space-5)}
.cs-card .gc-table th:last-child,.cs-card .gc-table td:last-child{padding-right:var(--space-5)}
.cs-card .gc-badge,.cs-num,.cs-id{white-space:nowrap}
.cs-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.cs-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.cs-id{font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--primary)}
.cs-num{text-align:right;font-variant-numeric:tabular-nums}
.cs-due{color:var(--text-danger)}
.cs-adv{color:var(--text-success)}
.cs-void td{color:var(--text-muted)}
.cs-void .cs-strike{text-decoration:line-through}
.cs-open td{background:var(--surface-subtle);font-weight:var(--weight-medium);color:var(--text-heading)}
.cs-close td{border-top:1px solid var(--border-strong);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cs-sheet{display:none}
@media print{
  body *{visibility:hidden!important}
  .cs-sheet,.cs-sheet *{visibility:visible!important}
  .cs-sheet{display:flex;flex-direction:column;gap:16px;position:absolute;left:0;top:0;width:100%;padding:24px;background:#fff;color:var(--text-body);font-size:var(--text-xs)}
}
.cs-sheet__head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding-bottom:12px;border-bottom:2px solid var(--primary)}
.cs-sheet__head b{display:block;font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cs-sheet__title{text-align:right}
.cs-sheet__title b{color:var(--primary);letter-spacing:var(--tracking-wide)}
.cs-sheet__meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.cs-sheet__meta div{display:flex;flex-direction:column;gap:2px}
.cs-sheet__meta b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cs-sheet__cap{font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.cs-sheet table{width:100%;border-collapse:collapse}
.cs-sheet th{padding:6px 8px;background:var(--surface-subtle);font-weight:var(--weight-medium);text-align:left;color:var(--text-heading)}
.cs-sheet td{padding:6px 8px;border-bottom:1px solid var(--border-subtle);vertical-align:top}
.cs-sheet .cs-num{text-align:right}
.cs-sheet__end{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;padding-top:12px;border-top:1px solid var(--border-subtle);color:var(--text-muted)}
.cs-sheet__sign{min-width:180px;padding-top:6px;margin-top:40px;border-top:1px solid var(--border-strong);text-align:center}
@media (max-width:599px){.cs-range .gc-input{width:100%}.cs-range>div{flex:1 1 140px}}
`;

/** Every ledger entry of the customer, oldest first. `effect` moves the balance (+ owes more, − owes less). */
function ledgerOf(invoices, returns, credits) {
  const rows = [];
  invoices.forEach((inv) => {
    const units = inv.lines.reduce((a, l) => a + l.qty, 0);
    rows.push({ at: inv.at, kind: 'invoice', ref: inv.id, text: inv.lines[0].name + (inv.lines.length > 1 ? ` + ${inv.lines.length - 1} more` : ''), note: `${units} pcs${inv.rev > 1 ? ` · revision ${inv.rev}` : ''}`, debit: inv.totals.total, credit: 0 });
    paymentLog(inv).forEach((p) => {
      const fromCredit = p.method === CREDIT_METHOD;
      const got = r2(p.amount + (p.extra || 0));
      const note = [p.withSale ? 'Paid with the sale' : null, p.by ? `received by ${p.by}` : null, p.ref || null, p.extra ? `${money(p.extra)} kept as advance` : null, fromCredit ? `${money(p.amount)} taken from advance credit` : null].filter(Boolean).join(' · ');
      if (p.void) rows.push({ at: p.at, kind: 'payment', ref: inv.id, text: `${p.method} payment · voided`, note: `Reason: ${p.void.reason} · voided by ${p.void.by} on ${formatDate(p.void.at)}`, debit: 0, credit: 0, struck: fromCredit ? p.amount : got, void: true });
      else rows.push({ at: p.at, kind: 'payment', ref: inv.id, text: fromCredit ? 'Paid from advance credit' : `Payment · ${p.method}`, note, debit: 0, credit: fromCredit ? 0 : got, info: fromCredit });
    });
  });
  credits.filter((c) => c.kind !== 'used').forEach((c) => rows.push({ at: c.at, kind: 'credit', ref: c.ref || '', text: c.amount >= 0 ? `Advance credit +${money(c.amount)}` : `Advance credit −${money(-c.amount)}`, note: c.note, debit: 0, credit: 0, info: true }));
  returns.forEach((r) => {
    const cut = r.money === 'credited';
    const how = cut ? 'Cut from the due' : r.money === 'refunded' ? `Refunded${r.method ? ' by ' + r.method : ''}` : r.money === 'collected' ? `Customer paid ${money(r.amount || 0)} more${r.method ? ' by ' + r.method : ''}` : 'Even exchange';
    rows.push({ at: r.at, kind: 'return', ref: r.ref, text: `${r.type === 'exchange' ? 'Exchange' : 'Return'} ${r.id}`, note: `${r.items} · ${how}${r.reason ? ' · ' + r.reason : ''}`, debit: 0, credit: cut ? r.amount || 0 : 0, info: !cut });
  });
  return rows.sort((a, b) => a.at - b.at || ORDER[a.kind] - ORDER[b.kind]);
}

export default function CustomerStatement() {
  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState('');
  const [data, setData] = useState({ book: [], invoices: [], returns: [], credits: [], credit: 0 });
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    const p = phoneDigits(new URLSearchParams(window.location.search).get('phone'));
    setPhone(p);
    setData({ book: getCustomers(), invoices: getInvoices(), returns: getReturns(), credits: creditLog(p), credit: creditOf(p) });
    setReady(true);
  }, []);

  const cust = findCustomer(data.book, phone);
  const invoices = data.invoices.filter((r) => phone && r.customer.phone === phone);
  const name = (cust && cust.name) || (invoices[0] && invoices[0].customer.name) || '';
  const shell = (body, title) => (
    <div className="dc-screen ds" data-screen="CustomerStatement">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="customers" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Customers" page={title} />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>{body}</div>
        </main>
      </div>
    </div>
  );
  if (!ready) return shell(null, 'Statement');
  if (!name) {
    return shell(<>
      <h1 className="sr-only">Customer statement</h1>
      <EmptyState icon="scroll-text" title="No customer to show" body={phone ? `There is no customer or invoice with the number ${phone} in this browser.` : 'Open a statement from a customer’s page or an invoice.'} />
      <p style={{ textAlign: 'center' }}><Link href="/all-customers" className="gc-btn gc-btn--soft">Go to Customers</Link></p>
    </>, 'Statement');
  }

  const tier = tierOf(cust);
  const returns = data.returns.filter((r) => r.customer === name);
  const all = ledgerOf(invoices, returns, data.credits);
  // running balance over everything; the date range picks which rows are shown
  let bal = 0;
  all.forEach((x) => { bal = r2(bal + x.debit - x.credit); x.balance = bal; });
  const start = from ? new Date(from + 'T00:00:00').getTime() : -Infinity;
  const end = to ? new Date(to + 'T23:59:59.999').getTime() : Infinity;
  const shown = all.filter((x) => x.at >= start && x.at <= end);
  const before = all.filter((x) => x.at < start);
  const opening = before.length ? before[before.length - 1].balance : 0;
  const closing = shown.length ? shown[shown.length - 1].balance : opening;
  const period = from || to ? `${from ? formatDate(start) : 'the first entry'} to ${to ? formatDate(end) : 'today'}` : 'All time';
  const inRange = { debit: r2(shown.reduce((a, x) => a + x.debit, 0)), credit: r2(shown.reduce((a, x) => a + x.credit, 0)) };

  const invoiced = r2(invoices.reduce((a, r) => a + r.totals.total, 0));
  const paid = r2(invoices.reduce((a, r) => a + paymentLog(r).filter((p) => !p.void && p.method !== CREDIT_METHOD).reduce((s, p) => s + p.amount + (p.extra || 0), 0), 0));
  const due = r2(invoices.reduce((a, r) => a + Math.max(0, r.due), 0));
  const limit = (cust && cust.creditLimit) || 0;
  const back = cust && cust.types && cust.types.includes('Wholesale') ? '/wholesale-customer?phone=' + phone : '/all-customers';
  const address = (cust && cust.address) || 'Not on file';

  const cells = (x) => (
    <>
      <td className="cs-num" style={{ whiteSpace: 'nowrap' }}>{x.debit ? money(x.debit) : '—'}</td>
      <td className="cs-num" style={{ whiteSpace: 'nowrap' }}>{x.struck ? <span className="cs-strike">{money(x.struck)}</span> : x.credit ? money(x.credit) : '—'}</td>
      <td className={'cs-num ' + (x.balance > 0 ? 'cs-due' : x.balance < 0 ? 'cs-adv' : '')} style={{ whiteSpace: 'nowrap' }}>{balanceText(x.balance)}</td>
    </>
  );

  return shell(<>
    <div className="cs-head">
      <Link href={back} className="cs-back" aria-label="Back to the customer"><Icon name="arrow-left" width="18" height="18" /></Link>
      <div>
        <h1 className="cs-title">Statement · {name}</h1>
        <p className="cs-meta">{phone} · {period} · {shown.length} entr{shown.length === 1 ? 'y' : 'ies'}</p>
      </div>
      <div className="cs-actions">
        <button type="button" className="gc-btn gc-btn--solid" onClick={() => window.print()}><Icon name="printer" width="18" height="18" aria-hidden="true" /> Print statement</button>
      </div>
    </div>

    <section className="gc-card cs-card" aria-label="Customer">
      <dl className="cs-who">
        <div><dt>Customer</dt><dd className="cs-strong">{name}</dd></div>
        <div><dt>Mobile</dt><dd>{phone}</dd></div>
        <div><dt>Address</dt><dd>{address}</dd></div>
        <div><dt>Price list</dt><dd>{tier ? `${tier.label} · ${tier.off}% below retail` : 'Retail prices'}</dd></div>
        <div><dt>Credit limit</dt><dd>{limit ? `${formatBDT(limit)} · ${formatBDT(Math.max(0, limit - due))} left` : 'No credit limit'}</dd></div>
      </dl>
    </section>

    <div className="gc-kpis">
      <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="files" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Invoiced</p><p className="gc-kpi__value">{money(invoiced)}<small>{invoices.length} invoice{invoices.length === 1 ? '' : 's'}</small></p></div></div>
      <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-success-soft)', color: 'var(--text-success)' }}><Icon name="banknote" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Paid</p><p className="gc-kpi__value">{money(paid)}<small>money received</small></p></div></div>
      <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-error-soft)', color: 'var(--text-danger)' }}><Icon name="file-clock" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Due</p><p className="gc-kpi__value">{money(due)}<small>{invoices.filter((r) => r.due > 0).length} open invoice{invoices.filter((r) => r.due > 0).length === 1 ? '' : 's'}</small></p></div></div>
      <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-info-soft)', color: 'var(--text-info)' }}><Icon name="wallet" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Advance credit</p><p className="gc-kpi__value">{money(data.credit)}<small>for the next invoice</small></p></div></div>
    </div>

    <section className="gc-card cs-card">
      <div className="cs-card__head">
        <div><h2>Ledger</h2><span className="cs-sub">Every invoice, payment, credit and return, oldest first. The balance runs over all of them.</span></div>
        <div className="cs-range">
          <div><label className="gc-label" htmlFor="cs-from">From</label><input id="cs-from" className="gc-input" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} /></div>
          <div><label className="gc-label" htmlFor="cs-to">To</label><input id="cs-to" className="gc-input" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} /></div>
          {from || to ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => { setFrom(''); setTo(''); }}>All dates</button> : null}
        </div>
      </div>
      {all.length === 0 ? <EmptyState icon="scroll-text" title="Nothing on this account yet" body={`${name} has no invoice, payment or return in this browser.`} /> : (
        <div className="gc-table-wrap">
          <table className="gc-table gc-table--compact">
            <thead><tr><th scope="col">Date</th><th scope="col">Entry</th><th scope="col">Details</th><th scope="col" className="cs-num">Debit</th><th scope="col" className="cs-num">Credit</th><th scope="col" className="cs-num">Balance</th></tr></thead>
            <tbody>
              {from ? <tr className="cs-open"><td>{formatDate(start)}</td><td colSpan={4}>Opening balance</td><td className="cs-num" style={{ whiteSpace: 'nowrap' }}>{balanceText(opening)}</td></tr> : null}
              {shown.length === 0 ? <tr><td colSpan={6} className="cs-sub">No entry between these dates.</td></tr> : shown.map((x, i) => (
                <tr key={i} className={x.void ? 'cs-void' : ''}>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(x.at)}<span className="cs-sub">{formatTime(x.at)}</span></td>
                  <td><span className={'gc-badge gc-badge--' + (x.void ? 'error' : KIND[x.kind][1])}>{x.void ? 'Voided' : KIND[x.kind][0]}</span><span className="cs-strong cs-strike" style={{ display: 'block', marginTop: 4 }}>{x.text}</span></td>
                  <td>{x.ref && x.ref.startsWith('INV') ? <Link href={'/sales-invoice?id=' + encodeURIComponent(x.ref)} className="cs-id">{x.ref}</Link> : x.ref ? <span className="cs-id">{x.ref}</span> : null}<span className="cs-sub">{x.note}{x.info && !x.void ? ' · does not change the balance' : ''}</span></td>
                  {cells(x)}
                </tr>
              ))}
              <tr className="cs-close"><td colSpan={3}>Closing balance{from || to ? ` · ${period}` : ''}</td><td className="cs-num">{money(inRange.debit)}</td><td className="cs-num">{money(inRange.credit)}</td><td className={'cs-num ' + (closing > 0 ? 'cs-due' : closing < 0 ? 'cs-adv' : '')} style={{ whiteSpace: 'nowrap' }}>{balanceText(closing)}</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </section>

    {/* the sheet that prints; hidden on screen */}
    <article className="cs-sheet" aria-hidden="true">
      <header className="cs-sheet__head">
        <div><b>{MERCHANT.name}</b><span>{MERCHANT.address}</span><br /><span>{MERCHANT.phone} · {MERCHANT.email} · BIN {MERCHANT.bin}</span></div>
        <div className="cs-sheet__title"><b>STATEMENT OF ACCOUNT</b><span>{period}</span><br /><span>Printed {formatDate(Date.now())}</span></div>
      </header>
      <div className="cs-sheet__meta">
        <div><span className="cs-sheet__cap">Customer</span><b>{name}</b><span>{address}</span><span>{phone}</span></div>
        <div><span className="cs-sheet__cap">Terms</span><span>{tier ? tier.label : 'Retail prices'}</span><span>Credit limit: {limit ? formatBDT(limit) : 'none'}</span></div>
        <div><span className="cs-sheet__cap">Summary</span><span>Invoiced {money(invoiced)} · Paid {money(paid)}</span><span>Due {money(due)} · Advance {money(data.credit)}</span><b>Balance: {balanceText(closing)}</b></div>
      </div>
      <table>
        <thead><tr><th>Date</th><th>Entry</th><th>Details</th><th className="cs-num">Debit</th><th className="cs-num">Credit</th><th className="cs-num">Balance</th></tr></thead>
        <tbody>
          {from ? <tr><td>{formatDate(start)}</td><td colSpan={4}>Opening balance</td><td className="cs-num">{balanceText(opening)}</td></tr> : null}
          {shown.map((x, i) => (
            <tr key={i} className={x.void ? 'cs-void' : ''}>
              <td>{formatDate(x.at)}</td>
              <td className="cs-strike">{x.text}</td>
              <td>{x.ref}{x.note ? ` · ${x.note}` : ''}</td>
              {cells(x)}
            </tr>
          ))}
          <tr><td colSpan={3}><b>Closing balance</b></td><td className="cs-num">{money(inRange.debit)}</td><td className="cs-num">{money(inRange.credit)}</td><td className="cs-num"><b>{balanceText(closing)}</b></td></tr>
        </tbody>
      </table>
      <footer className="cs-sheet__end">
        <span>Please report any difference within 7 days. Pay by {MERCHANT.bank} or bKash {MERCHANT.bkash}.</span>
        <span className="cs-sheet__sign">Authorised signature</span>
      </footer>
    </article>
  </>, 'Statement');
}
