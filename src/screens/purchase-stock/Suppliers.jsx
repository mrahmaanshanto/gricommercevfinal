'use client';
// Suppliers — who the shop owes, how much and when it is due.
// Compact cards on top double as filters, and each supplier row can be paid (one bill, several,
// or part of one, from a chosen account) or opened as a ledger.
// Front end only: suppliers, bills and payments come from src/lib/supplierBills.js; paying takes the
// money out of a ledger account (src/lib/ledger.js), so its balance really goes down.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, PageHeader, EmptyState } from '@/components/ui';
import { PaymentLogo } from '@/components/PaymentLogo';
import { formatBDT } from '@/lib/format';
import { EMPLOYEES } from '@/lib/posStore';
import { accountBy, accountsForMethod, balanceOf, getEntries } from '@/lib/ledger';
import { getDb, demoDb, addSupplier as saveSupplier, paySupplier, billLeft, lastPaymentOf, boughtThisYear, dayStart } from '@/lib/supplierBills';

const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DEMO_TODAY = new Date(2026, 8, 29).getTime();   // first render, before the browser's date is read
const dm = (ms) => { const d = new Date(ms); return d.getDate() + ' ' + MONTH[d.getMonth()]; };
const money = (n) => formatBDT(n);
const num = (v) => Math.max(0, Math.round(Number(v) || 0));
const plural = (n) => n + (n === 1 ? ' supplier' : ' suppliers');

const METHODS = [['Cash', 'banknote'], ['bKash', null, 'bkash'], ['Nagad', null, 'nagad'], ['Bank', 'landmark']];
const TERM_DAYS = { 'On delivery': 0, '7 days': 7, '15 days': 15, '30 days': 30 };
const FILTERS = [['all', 'All'], ['today', 'Due today'], ['week', 'This week'], ['over', 'Overdue'], ['clear', 'Nothing due']];
const dueLabel = (off) => (off === 0 ? 'Today' : off === 1 ? 'Tomorrow' : off > 0 ? off + ' days left' : -off + ' days overdue');
const dueTone = (off) => (off < 0 ? 'error' : off === 0 ? 'warning' : 'slate');

const CSS = `
.sp-kpi{width:100%;font:inherit;text-align:left;cursor:pointer}
.sp-kpi.is-on{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary)}
.sp-card{overflow:hidden}
.sp-bar{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:var(--space-3);padding:0 var(--space-4)}
.sp-tab b{margin-left:6px;font-weight:var(--weight-medium);color:var(--text-muted);font-variant-numeric:tabular-nums}
.sp-search{position:relative;flex:0 1 260px;margin-bottom:var(--space-2)}
.sp-search svg{position:absolute;left:12px;top:13px;color:var(--text-muted);pointer-events:none}
.sp-search input{padding-left:38px}
.sp-card .gc-table th,.sp-card .gc-table td{padding-left:var(--space-2);padding-right:var(--space-2);white-space:normal}
.sp-card .gc-table th:first-child,.sp-card .gc-table td:first-child{padding-left:var(--space-4)}
.sp-card .gc-table th:last-child,.sp-card .gc-table td:last-child{padding-right:var(--space-4)}
.sp-card .gc-badge,.sp-card .gc-btn,.sp-num{white-space:nowrap}
.sp-who{display:flex;align-items:center;gap:var(--space-3)}
.sp-avatar{display:grid;place-items:center;width:36px;height:36px;flex:none;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-medium)}
.sp-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sp-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.sp-num{text-align:right;font-variant-numeric:tabular-nums}
.sp-owe{font-weight:var(--weight-semibold);color:var(--text-danger)}
.sp-actions{display:flex;justify-content:flex-end;gap:var(--space-2)}
.sp-form{display:flex;flex-direction:column;gap:var(--space-4)}
.sp-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.sp-bills{margin:0;padding:0;list-style:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden}
.sp-bills li{border-top:1px solid var(--border-subtle)}
.sp-bills li:first-child{border-top:0}
.sp-bills label{display:flex;align-items:center;gap:var(--space-3);min-height:52px;padding:6px var(--space-3);cursor:pointer}
.sp-bills label>span:nth-child(2){flex:1;min-width:0}
.sp-methods{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-2)}
.sp-method{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;height:60px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-heading);cursor:pointer}
.sp-method.is-on{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.sp-total{display:flex;align-items:baseline;justify-content:space-between;padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.sp-total b{font-size:var(--text-xl);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
@media (max-width:599px){.sp-two{grid-template-columns:1fr}.sp-methods{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:640px){.sp-search{flex:1 1 100%}}
`;

export default function Suppliers() {
  const [db, setDb] = useState(demoDb);
  const [entries, setEntries] = useState([]);     // ledger entries, for account balances
  const [today, setToday] = useState(DEMO_TODAY);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [pay, setPay] = useState(null);         // { sup, ticks, amount, method, account, by, ref }
  const [form, setForm] = useState(null);       // new supplier

  const reload = () => { setDb(getDb()); setEntries(getEntries()); };
  useEffect(() => { reload(); setToday(dayStart()); }, []);
  const offOf = (ms) => Math.round((dayStart(ms) - today) / 864e5);

  const all = db.suppliers;
  const bills = db.bills.map((b) => ({ ...b, sup: b.supplier, bought: b.at, left: billLeft(b) })).filter((b) => b.left > 0);
  const billsOf = (id) => bills.filter((b) => b.sup === id).sort((a, b) => a.due - b.due);
  const unusedOf = (id) => db.credits.filter((c) => c.supplier === id).reduce((a, c) => a + (c.unused || 0), 0);
  const rows = all.map((s) => {
    const mine = billsOf(s.id); const next = mine[0]; const lp = lastPaymentOf(s.id, db);
    const acc = lp ? accountBy(lp.account) : null;
    return { ...s, year: boughtThisYear(s, db), last: lp ? { at: lp.at, amount: lp.amount, method: lp.method, account: acc ? acc.name : '' } : null, owe: Math.max(0, mine.reduce((a, b) => a + b.left, 0) - unusedOf(s.id)), next, off: next ? offOf(next.due) : null, bills: mine.length };
  });
  const inGroup = (r, f) => f === 'all' || (f === 'clear' ? !r.owe : r.off != null && (f === 'today' ? r.off === 0 : f === 'week' ? r.off >= 0 && r.off <= 6 : r.off < 0));
  const sumBills = (test) => bills.filter((b) => test(offOf(b.due))).reduce((a, b) => a + b.left, 0);
  const counts = Object.fromEntries(FILTERS.map(([k]) => [k, rows.filter((r) => inGroup(r, k)).length]));
  const shown = rows.filter((r) => inGroup(r, filter) && (!q.trim() || (r.name + ' ' + r.phone + ' ' + r.goods).toLowerCase().includes(q.trim().toLowerCase())))
    .sort((a, b) => (a.off == null ? 999 : a.off) - (b.off == null ? 999 : b.off));
  const total = rows.reduce((a, r) => a + r.owe, 0);

  // the shop's own accounts a payment can leave from, with what each holds now (src/lib/ledger.js)
  const accountsFor = (method) => accountsForMethod(method).map((a) => ({ ...a, balance: balanceOf(a.id, entries) }));
  const openPay = (r, only) => {
    const mine = billsOf(r.id);
    const ticks = Object.fromEntries((only ? mine.filter(only) : mine.slice(0, 1)).map((b) => [b.no, true]));
    setPay({ sup: r, ticks, amount: '', method: 'Cash', account: accountsFor('Cash')[0].id, by: EMPLOYEES[2].name, ref: '' });
  };
  // ?pay=<supplier id> (from Accounts) opens the pay window for that supplier once the books are read
  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get('pay');
    if (!want || !entries.length) return;
    const r = rows.find((x) => x.id === want);
    const u = new URL(window.location.href); u.searchParams.delete('pay');
    window.history.replaceState(window.history.state, '', u.pathname + u.search);
    if (r && r.owe) openPay(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);
  const payBills = pay ? billsOf(pay.sup.id) : [];
  const ticked = payBills.filter((b) => pay.ticks[b.no]);
  const tickSum = ticked.reduce((a, b) => a + b.left, 0);
  const amount = pay ? (pay.amount === '' ? tickSum : Math.min(num(pay.amount), tickSum)) : 0;
  const payAccounts = pay ? accountsFor(pay.method) : [];
  const payAccount = payAccounts.find((a) => a.id === (pay && pay.account)) || payAccounts[0] || null;
  const accountBalance = payAccount ? payAccount.balance : 0;
  const accountShort = payAccount ? payAccount.name.split(' · ')[0] : '';
  const confirmPay = (e) => {
    e.preventDefault();
    if (!amount) { toast('Tick a bill and enter the amount', { tone: 'error' }); return; }
    if (!payAccount) { toast('Choose the account the money leaves from', { tone: 'error' }); return; }
    if (amount > accountBalance) { toast(`${accountShort} does not hold ${money(amount)}. Choose another account or pay less.`, { tone: 'error' }); return; }
    // the money clears the ticked bills oldest first; anything short stays on the last one
    const done = paySupplier({ supplier: pay.sup.id, bills: ticked.map((b) => b.no), amount, method: pay.method, account: payAccount.id, by: pay.by, ref: pay.ref.trim() });
    reload();
    toast(`${money(done.amount)} paid to ${pay.sup.name} from ${accountShort}${done.amount < tickSum ? ` · ${money(tickSum - done.amount)} still owed on the ticked bills` : ''}`);
    setPay(null);
  };
  const addSupplier = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) { toast('Enter the supplier’s name', { tone: 'error' }); return; }
    if (all.some((s) => s.name.toLowerCase() === name.toLowerCase())) { toast('A supplier with this name already exists', { tone: 'error' }); return; }
    saveSupplier({ name, phone: form.phone.trim() || '—', kind: form.kind.trim() || 'Supplier', goods: form.goods.trim() || '—', terms: TERM_DAYS[form.terms] ?? 15 });
    reload();
    setForm(null); setFilter('all'); toast(`${name} added. Order from them with a purchase order.`);
  };
  const kpi = (id, icon, bg, fg, label, value, note) => (
    <button type="button" className={'gc-kpi sp-kpi' + (filter === id ? ' is-on' : '')} aria-pressed={filter === id} onClick={() => setFilter(filter === id ? 'all' : id)}>
      <span className="gc-kpi__icon" style={{ background: bg, color: fg }}><Icon name={icon} width="24" height="24" aria-hidden="true" /></span>
      <span className="gc-kpi__text"><span className="gc-kpi__label" style={{ display: 'block' }}>{label}</span><span className="gc-kpi__value">{value}<small title={note}>{note}</small></span></span>
    </button>
  );

  return (
    <div className="dc-screen ds" data-screen="Suppliers">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="po-suppliers" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Purchase" page="Suppliers & payables" placeholder="Search products, customers or memo no." />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <PageHeader
              title="Suppliers & payables"
              description="Who you owe, how much, and when it is due."
              actions={<>
                <Link href="/supplier-return" className="gc-btn gc-btn--neutral"><Icon name="undo-2" width="18" height="18" aria-hidden="true" /> Return goods</Link>
                <Link href="/new-po" className="gc-btn gc-btn--neutral"><Icon name="file-plus" width="18" height="18" aria-hidden="true" /> New purchase order</Link>
                <button type="button" className="gc-btn gc-btn--solid" onClick={() => setForm({ name: '', phone: '', kind: '', goods: '', terms: '15 days' })}><Icon name="plus" width="18" height="18" aria-hidden="true" /> New supplier</button>
              </>}
            />

            <div className="gc-kpis">
              {kpi('all', 'wallet', 'var(--fill-primary-soft)', 'var(--primary)', 'Total payable', money(total), plural(rows.filter((r) => r.owe).length))}
              {kpi('today', 'calendar-check', 'var(--fill-warning-soft)', 'var(--text-warning)', 'Due today', money(sumBills((o) => o === 0)), plural(counts.today))}
              {kpi('week', 'calendar-clock', 'var(--fill-info-soft)', 'var(--text-info)', 'Due this week', money(sumBills((o) => o >= 0 && o <= 6)), `to ${dm(today + 6 * 864e5)}`)}
              {kpi('over', 'bell-ring', 'var(--fill-error-soft)', 'var(--text-danger)', 'Overdue', money(sumBills((o) => o < 0)), plural(counts.over))}
            </div>

            <section className="gc-card sp-card">
              <div className="sp-bar">
                <div className="gc-tabs" role="tablist" aria-label="Suppliers by due date" style={{ borderBottom: 0, overflow: 'visible', flexWrap: 'wrap' }}>
                  {FILTERS.map(([k, label]) => <button key={k} type="button" role="tab" aria-selected={filter === k} className={'gc-tab sp-tab' + (filter === k ? ' gc-tab--active' : '')} onClick={() => setFilter(k)}>{label}<b>{counts[k]}</b></button>)}
                </div>
                <label className="sp-search"><Icon name="search" width="18" height="18" aria-hidden="true" /><input className="gc-input" type="search" placeholder="Search supplier, mobile or goods" aria-label="Search supplier, mobile or goods" value={q} onChange={(e) => setQ(e.target.value)} /></label>
              </div>
              {shown.length === 0 ? <EmptyState icon="truck" title={q ? 'No supplier matches that search' : 'No supplier in this group'} body={filter === 'over' ? 'Nothing is overdue.' : 'Try another group or clear the search.'} /> : (
                <div className="gc-table-wrap">
                  <table className="gc-table gc-table--compact gc-table--hoverable">
                    <thead><tr><th scope="col">Supplier</th><th scope="col">Supplies</th><th scope="col" className="sp-num">Bought this year</th><th scope="col" className="sp-num">Payable</th><th scope="col">Next due</th><th scope="col">Last payment</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                    <tbody>
                      {shown.map((r) => (
                        <tr key={r.id}>
                          <td><div className="sp-who"><span className="sp-avatar" aria-hidden="true">{r.name[0]}</span><div><span className="sp-strong">{r.name}</span><span className="sp-sub">{r.phone} · {r.kind}</span></div></div></td>
                          <td>{r.goods}</td>
                          <td className="sp-num">{r.year ? money(r.year) : '—'}</td>
                          <td className={'sp-num' + (r.owe ? ' sp-owe' : '')}>{r.owe ? money(r.owe) : 'Nothing due'}{r.bills > 1 ? <span className="sp-sub">{r.bills} bills</span> : null}</td>
                          <td>{r.next ? <><span className={'gc-badge gc-badge--' + dueTone(r.off)}>{dueLabel(r.off)}</span><span className="sp-sub">{dm(r.next.due)} · {money(r.next.left)}</span></> : '—'}</td>
                          <td>{r.last ? <>{dm(r.last.at)}<span className="sp-sub">{money(r.last.amount)} · {r.last.account ? r.last.account.split(' · ')[0] : r.last.method}</span></> : <span className="sp-sub">No payment yet</span>}</td>
                          <td><div className="sp-actions">
                            {r.owe ? <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => openPay(r)}><Icon name="hand-coins" width="16" height="16" aria-hidden="true" /> Pay</button> : <Link href="/new-po" className="gc-btn gc-btn--sm gc-btn--soft">Order</Link>}
                            <Link href={`/supplier-detail?id=${encodeURIComponent(r.id)}`} className="gc-btn gc-btn--sm gc-btn--neutral" aria-label={`Open the ledger of ${r.name}`}>Ledger</Link>
                          </div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* pay a supplier */}
      <Dialog open={!!pay} title={pay ? `Pay ${pay.sup.name}` : 'Pay supplier'} onClose={() => setPay(null)} width={540}>
        {pay ? (
          <form className="sp-form" onSubmit={confirmPay}>
            <ul className="sp-bills" aria-label="Open bills">
              {payBills.map((b) => (
                <li key={b.no}><label>
                  <input type="checkbox" className="gc-check" checked={!!pay.ticks[b.no]} onChange={(e) => setPay({ ...pay, ticks: { ...pay.ticks, [b.no]: e.target.checked }, amount: '' })} />
                  <span><span className="sp-strong">{b.no}</span><span className="sp-sub">Bought {dm(b.bought)} · due {dm(b.due)}</span></span>
                  <span className={'gc-badge gc-badge--' + dueTone(offOf(b.due))}>{dueLabel(offOf(b.due))}</span>
                  <span className="sp-num sp-strong">{money(b.left)}</span>
                </label></li>
              ))}
            </ul>
            <div className="sp-methods" role="group" aria-label="Pay by">
              {METHODS.map(([m, icon, logo]) => <button key={m} type="button" className={'sp-method' + (pay.method === m ? ' is-on' : '')} aria-pressed={pay.method === m} onClick={() => setPay({ ...pay, method: m, account: (accountsFor(m)[0] || {}).id || '' })}>{logo ? <PaymentLogo provider={logo} size={22} radius={6} decorative /> : <Icon name={icon} width="20" height="20" aria-hidden="true" />}{m}</button>)}
            </div>
            <div><label className="gc-label" htmlFor="sp-acc">Pay from account *</label><select id="sp-acc" className="gc-input gc-select" aria-required="true" value={payAccount ? payAccount.id : ''} onChange={(e) => setPay({ ...pay, account: e.target.value })}>{payAccounts.map((a) => <option key={a.id} value={a.id}>{a.name} · {money(a.balance)} available</option>)}</select>{amount > accountBalance ? <p className="gc-help gc-help--error" role="alert">This account holds {money(accountBalance)}, less than the {money(amount)} you are paying.</p> : <p className="gc-help">{money(accountBalance - amount)} will be left in this account.</p>}</div>
            <div className="sp-two">
              <div><label className="gc-label" htmlFor="sp-amt">Amount to pay (৳)</label><input id="sp-amt" className="gc-input" type="number" min="0" max={tickSum} inputMode="numeric" placeholder={String(tickSum)} value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} /><p className="gc-help">{amount < tickSum && amount ? `Part payment: ${money(tickSum - amount)} stays owed.` : 'Pays the ticked bills in full.'}</p></div>
              <div><label className="gc-label" htmlFor="sp-by">Paid by</label><select id="sp-by" className="gc-input gc-select" value={pay.by} onChange={(e) => setPay({ ...pay, by: e.target.value })}>{EMPLOYEES.map((m) => <option key={m.name}>{m.name}</option>)}</select></div>
            </div>
            {pay.method !== 'Cash' ? <div><label className="gc-label" htmlFor="sp-ref">{pay.method === 'Bank' ? 'Cheque or transfer no.' : 'Transaction ID'}</label><input id="sp-ref" className="gc-input" placeholder="Optional" value={pay.ref} onChange={(e) => setPay({ ...pay, ref: e.target.value })} /></div> : null}
            <div className="sp-total" role="status"><span>Paying now · still owed after {money(pay.sup.owe - amount)}</span><b>{money(amount)}</b></div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setPay(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={!amount || amount > accountBalance}>Pay {money(amount)}</button></div>
          </form>
        ) : null}
      </Dialog>

      {/* new supplier */}
      <Dialog open={!!form} title="New supplier" onClose={() => setForm(null)} width={500}>
        {form ? (
          <form className="sp-form" onSubmit={addSupplier}>
            <div><label className="gc-label" htmlFor="sp-name">Supplier name *</label><input id="sp-name" className="gc-input" aria-required="true" data-autofocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="sp-two">
              <div><label className="gc-label" htmlFor="sp-phone">Mobile number</label><input id="sp-phone" className="gc-input" inputMode="tel" placeholder="01XXXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="sp-kind">Type or area</label><input id="sp-kind" className="gc-input" placeholder="For example: Importer · Motijheel" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} /></div>
            </div>
            <div><label className="gc-label" htmlFor="sp-goods">What they supply</label><input id="sp-goods" className="gc-input" placeholder="For example: cables, chargers" value={form.goods} onChange={(e) => setForm({ ...form, goods: e.target.value })} /></div>
            <div><label className="gc-label" htmlFor="sp-terms">Bills are usually due in</label><select id="sp-terms" className="gc-input gc-select" value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })}>{['On delivery', '7 days', '15 days', '30 days'].map((x) => <option key={x}>{x}</option>)}</select></div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setForm(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">Add supplier</button></div>
          </form>
        ) : null}
      </Dialog>
    </div>
  );
}
