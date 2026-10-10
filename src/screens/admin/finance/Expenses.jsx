'use client';
// Expenses (/admin/expenses) — what GridCommerce spends, adapted from the merchant panel's Income & expenses
// (screens/accounts/ExpensesBills.jsx): the month's figures, then one card with the views as tabs (All · Waiting
// approval · To pay · Paid · Drafts · Vendors; counts on the tabs, the amount in the card's foot), search and filters
// (category, vendor, account, month). "Add expense" opens a side panel (category, vendor, account, amount, VAT, date,
// attachment name, note; Save draft or Send for approval). A row opens the expense: Approve (finance or an admin, never
// the person who added it) or Send back, then Mark paid (from an account that covers it). Vendors: details and spend.
// Data: lib/admin/finance (addExpense, submitExpense, approveExpense, returnExpense, markExpensePaid, deleteDraft,
// addVendor). ?tab= ?id= ?cat= ?add=1 are read after mount.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { FilterBar } from '@/components/ui/FilterBar';
import { ShopHeader, IndexTabs, Pager, MetricStrip, KV } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { startOfMonth, addMonths, periodOf } from '@/lib/platform/util';
import { staff } from '@/lib/platform/store';
import {
  CATEGORIES, catBy, vendorBy, vendorName, EXP_STATUS, TERMS, expenseTotal, expensesIn, ledger, balances, periodLabel,
  addExpense, editDraft, submitExpense, approveExpense, returnExpense, markExpensePaid, deleteDraft, addVendor,
} from '@/lib/admin/finance';
import { AdminShell } from '../AdminShell';
import {
  FIN_CSS, useFinance, money, plural, when, dmy, readParams, setParams, rowGo, rowKey, Field, ctl, errOf, FormSheet, AccountSelect,
  accName, Skeleton, ErrorCard, ExpBadge, DetailSheet, useErr, dateInput, fromDateInput,
} from './finShared';

const PAGE = 20;
const TABS = [['all', 'All'], ['waiting', 'Waiting approval'], ['topay', 'To pay'], ['paid', 'Paid'], ['draft', 'Drafts'], ['vendors', 'Vendors']];
const TAB_STATUS = { waiting: 'waiting', topay: 'approved', paid: 'paid', draft: 'draft' };
const NO_FILTERS = { cat: '', vendor: '', account: '', month: '' };
const canApprove = (s) => !!s && (s.role === 'admin' || s.role === 'finance');

// ---- add or change an expense ----------------------------------------------------------------------------------------
function ExpenseForm({ F, t, bal, draft, preset, close }) {
  const [f, setF] = useState(() => draft ? {
    category: draft.category, vendor: draft.vendor, account: draft.account, amount: String(draft.amount), vat: String(draft.vat || 0),
    date: dateInput(draft.at), attachment: draft.attachment || '', note: draft.note || '',
  } : { category: (preset && preset.category) || '', vendor: (preset && preset.vendor) || '', account: (preset && preset.account) || '', amount: '', vat: '', date: dateInput(t), attachment: '', note: '' });
  const [err, setErr] = useErr();
  const set = (k) => (e) => {
    setErr(null);
    const v = e.target.value;
    if (k === 'vendor') { const vd = vendorBy(F, v); setF({ ...f, vendor: v, category: f.category || (vd ? vd.category : ''), account: f.account || (vd ? vd.account : '') }); return; }
    setF({ ...f, [k]: v });
  };
  const vendors = F.vendors.filter((v) => !f.category || v.category === f.category || v.id === f.vendor).sort((a, b) => a.name.localeCompare(b.name));
  const total = (Number(f.amount) || 0) + (Number(f.vat) || 0);
  const fields = () => ({ category: f.category, vendor: f.vendor, account: f.account, amount: f.amount, vat: f.vat || 0, at: fromDateInput(f.date, 12), attachment: f.attachment, note: f.note });
  const save = (submit) => {
    let r;
    if (draft) {
      r = editDraft(draft.id, { ...fields() });
      if (r.ok && submit) r = submitExpense(draft.id);
    } else r = addExpense(fields(), submit);
    if (!r.ok) { setErr(r); return; }
    toast(submit ? `${money(expenseTotal(r.expense))} sent for approval` : 'Saved as a draft');
    close();
  };
  return (
    <FormSheet id="fn-exp" title={draft ? `Edit draft ${draft.id}` : 'Add expense'} close={close} onSubmit={() => save(true)} submit="Send for approval" err={err}
      extra={<button type="button" className="gc-btn gc-btn--neutral" onClick={() => save(false)}>Save draft</button>}>
      <div className="fn-form__two">
        <Field id="ex-c" label="Category" error={errOf(err, 'category')}>
          <select id="ex-c" {...ctl(errOf(err, 'category'), true)} value={f.category} onChange={set('category')}>
            <option value="">Pick a category</option>
            {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}
          </select>
        </Field>
        <Field id="ex-v" label="Vendor">
          <select id="ex-v" {...ctl(null, true)} value={f.vendor} onChange={set('vendor')}>
            <option value="">No vendor</option>
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </Field>
      </div>
      <div className="fn-form__two">
        <Field id="ex-a" label="Amount before VAT (৳)" error={errOf(err, 'amount')}>
          <input id="ex-a" type="number" inputMode="numeric" min="1" {...ctl(errOf(err, 'amount'))} value={f.amount} onChange={set('amount')} />
        </Field>
        <Field id="ex-vat" label="VAT (৳)" error={errOf(err, 'vat')} hint={Number(f.amount) ? <button type="button" className="gc-btn gc-btn--flat gc-btn--sm" style={{ padding: 0, height: 'auto' }} onClick={() => setF({ ...f, vat: String(Math.round(Number(f.amount) * 0.15)) })}>Use 15%</button> : null}>
          <input id="ex-vat" type="number" inputMode="numeric" min="0" {...ctl(errOf(err, 'vat'))} value={f.vat} onChange={set('vat')} />
        </Field>
      </div>
      <div className="fn-form__two">
        <AccountSelect id="ex-acc" label="Paid from" F={F} bal={bal} value={f.account} onChange={(v) => { setErr(null); setF({ ...f, account: v }); }} error={errOf(err, 'account')} />
        <Field id="ex-d" label="Bill date" error={errOf(err, 'at')}>
          <input id="ex-d" type="date" max={dateInput(t)} {...ctl(errOf(err, 'at'))} value={f.date} onChange={set('date')} />
        </Field>
      </div>
      <Field id="ex-f" label="Attachment" hint="The file name of the bill or receipt (the demo keeps the name only).">
        <input id="ex-f" {...ctl(null)} placeholder="aws-invoice-2026-10.pdf" value={f.attachment} onChange={set('attachment')} />
      </Field>
      <Field id="ex-n" label="Note (optional)"><textarea id="ex-n" rows={2} {...ctl(null)} value={f.note} onChange={set('note')} /></Field>
      {total ? <p className="fn-note">Total <b className="fn-data">{money(total)}</b>{f.account ? ` from ${accName(F, f.account)}` : ''}. It waits for approval by someone other than you.</p> : null}
    </FormSheet>
  );
}

// ---- one expense ---------------------------------------------------------------------------------------------------------
function ExpenseSheet({ F, t, bal, e, close, edit }) {
  const me = staff();
  const [mode, setMode] = useState('');   // '' · 'back' · 'pay'
  const [why, setWhy] = useState('');
  const [pay, setPay] = useState({ account: e.account, ref: '' });
  const [err, setErr] = useErr();
  const mine = me && me.name === e.createdBy;
  const can = canApprove(me);
  const run = (fn, done) => { const r = fn(); if (!r.ok) { setErr(r); return; } toast(done); close(); };
  const remove = async () => {
    if (!(await confirmDialog({ title: `Delete draft ${e.id}?`, body: 'The draft is removed. Nothing was paid.', confirmLabel: 'Delete draft', tone: 'danger' }))) return;
    run(() => deleteDraft(e.id), 'Draft deleted');
  };
  let footer;
  if (e.status === 'draft') footer = <><button type="button" className="gc-btn gc-btn--neutral" onClick={remove}>Delete</button><button type="button" className="gc-btn gc-btn--neutral" onClick={edit}>Edit</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => run(() => submitExpense(e.id), 'Sent for approval')}>Send for approval</button></>;
  else if (e.status === 'waiting') {
    footer = mode === 'back'
      ? <><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setMode('')}>Back</button><button type="button" className="gc-btn gc-btn--error gc-btn--solid" onClick={() => run(() => returnExpense(e.id, why), 'Sent back to draft')}>Send back</button></>
      : <><button type="button" className="gc-btn gc-btn--neutral" disabled={!can} onClick={() => setMode('back')}>Send back</button><button type="button" className="gc-btn gc-btn--solid" disabled={!can || mine} onClick={() => run(() => approveExpense(e.id), `${e.id} approved · mark it paid when the money goes`)}>Approve</button></>;
  } else if (e.status === 'approved') {
    footer = mode === 'pay'
      ? <><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setMode('')}>Back</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => run(() => markExpensePaid(e.id, pay), `${money(expenseTotal(e))} paid from ${accName(F, pay.account)}`)}>Mark paid</button></>
      : <button type="button" className="gc-btn gc-btn--solid" disabled={!can} onClick={() => setMode('pay')}>Mark paid</button>;
  } else footer = <button type="button" className="gc-btn gc-btn--neutral" onClick={close}>Close</button>;
  const v = vendorBy(F, e.vendor);
  return (
    <DetailSheet title={`Expense ${e.id}`} close={close} footer={footer}>
      <div className="fn-sheet__big"><span><ExpBadge status={e.status} /></span><b>{money(expenseTotal(e))}</b></div>
      <KV rows={[
        ['Category', catBy(e.category).name],
        ['Vendor', v ? v.name : '—'],
        ['Bill date', dmy(e.at)],
        ['Amount', money(e.amount)],
        ['VAT', e.vat ? money(e.vat) : '—'],
        ['Paid from', accName(F, e.account)],
        ['Attachment', e.attachment ? <span key="a" className="fn-attach"><Icon name="paperclip" width="14" height="14" aria-hidden="true" />{e.attachment}</span> : '—'],
        e.ref ? ['Reference', <span key="r" className="fn-data">{e.ref}</span>] : null,
      ]} />
      {e.note ? <p className="fn-note">{e.note}</p> : null}
      <div>
        <h3>History</h3>
        <ul className="fn-trail">
          <li><time>{dmy(e.createdAt || e.at)}</time><span>Added by {e.createdBy}{e.status === 'waiting' && e.approver ? ` · ${e.approver} to approve` : ''}</span></li>
          {e.approvedAt ? <li><time>{dmy(e.approvedAt)}</time><span>Approved by {e.approvedBy}</span></li> : null}
          {e.paidAt ? <li><time>{dmy(e.paidAt)}</time><span>Paid by {e.paidBy} from {accName(F, e.account)}</span></li> : null}
        </ul>
      </div>
      {e.status === 'waiting' && mine ? <p className="fn-note fn-note--warn">You added this expense, so someone else approves it.</p> : null}
      {(e.status === 'waiting' || e.status === 'approved') && !can ? <p className="fn-note">Only finance or an admin can approve and pay expenses.</p> : null}
      {mode === 'back' ? (
        <Field id="xs-why" label="What needs to change">
          <textarea id="xs-why" rows={2} {...ctl(err && !err.field ? err.error : null)} value={why} onChange={(ev) => { setErr(null); setWhy(ev.target.value); }} />
        </Field>
      ) : null}
      {mode === 'pay' ? (
        <>
          <AccountSelect id="xs-acc" label="Paid from" F={F} bal={bal} value={pay.account} onChange={(a) => { setErr(null); setPay({ ...pay, account: a }); }} error={errOf(err, 'account')} />
          <Field id="xs-ref" label="Reference (optional)" hint="Card, cheque or transfer reference.">
            <input id="xs-ref" className="gc-input fn-data" autoComplete="off" value={pay.ref} onChange={(ev) => setPay({ ...pay, ref: ev.target.value })} />
          </Field>
        </>
      ) : null}
      {err && err.error && !err.field ? <p className="fn-formerr" role="alert">{err.error}</p> : null}
    </DetailSheet>
  );
}

// ---- vendors -------------------------------------------------------------------------------------------------------------
function VendorForm({ F, close }) {
  const [f, setF] = useState({ name: '', category: '', contact: '', phone: '', email: '', terms: 'On receipt', account: 'city' });
  const [err, setErr] = useErr();
  const set = (k) => (e) => { setErr(null); setF({ ...f, [k]: e.target.value }); };
  const submit = () => { const r = addVendor(f); if (!r.ok) { setErr(r); return; } toast(`${r.vendor.name} added`); close(); };
  return (
    <FormSheet id="fn-ven" title="Add vendor" close={close} onSubmit={submit} submit="Add vendor" err={err}>
      <Field id="vn-n" label="Name" error={errOf(err, 'name')}><input id="vn-n" {...ctl(errOf(err, 'name'))} value={f.name} onChange={set('name')} /></Field>
      <Field id="vn-c" label="Category" error={errOf(err, 'category')}>
        <select id="vn-c" {...ctl(errOf(err, 'category'), true)} value={f.category} onChange={set('category')}><option value="">Pick a category</option>{CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}</select>
      </Field>
      <div className="fn-form__two">
        <Field id="vn-p" label="Contact person"><input id="vn-p" {...ctl(null)} value={f.contact} onChange={set('contact')} /></Field>
        <Field id="vn-ph" label="Phone"><input id="vn-ph" type="tel" {...ctl(null)} value={f.phone} onChange={set('phone')} /></Field>
      </div>
      <Field id="vn-e" label="Email"><input id="vn-e" type="email" {...ctl(null)} value={f.email} onChange={set('email')} /></Field>
      <div className="fn-form__two">
        <Field id="vn-t" label="Payment terms"><select id="vn-t" {...ctl(null, true)} value={f.terms} onChange={set('terms')}>{TERMS.map((x) => <option key={x}>{x}</option>)}</select></Field>
        <AccountSelect id="vn-a" label="Usually paid from" F={F} value={f.account} onChange={(v) => setF({ ...f, account: v })} />
      </div>
    </FormSheet>
  );
}
function VendorSheet({ F, t, v, close, addFor, openExpense }) {
  const list = F.expenses.filter((e) => e.vendor === v.id).sort((a, b) => b.at - a.at);
  const year = list.filter((e) => e.status !== 'draft' && e.at >= addMonths(startOfMonth(t), -11, 1)).reduce((s, e) => s + expenseTotal(e), 0);
  return (
    <DetailSheet title={v.name} close={close} footer={<button type="button" className="gc-btn gc-btn--solid" onClick={addFor}>Add expense</button>}>
      <div className="fn-sheet__big"><span>Last 12 months</span><b>{money(year)}</b></div>
      <KV rows={[
        ['Category', catBy(v.category).name], ['Contact', v.contact], ['Phone', v.phone !== '—' ? <a key="p" href={'tel:' + v.phone.replace(/[^0-9+]/g, '')}>{v.phone}</a> : '—'],
        ['Email', v.email !== '—' ? <a key="e" href={'mailto:' + v.email}>{v.email}</a> : '—'], ['Payment terms', v.terms], ['Usually paid from', accName(F, v.account)],
      ]} />
      <div>
        <h3>Latest expenses</h3>
        {list.length ? (
          <div className="fn-rows">
            {list.slice(0, 6).map((e) => <button key={e.id} type="button" className="fn-row fn-row--btn" onClick={() => openExpense(e.id)}><span>{dmy(e.at)} · {EXP_STATUS[e.status].label}</span><b>{money(expenseTotal(e))}</b></button>)}
          </div>
        ) : <p className="fn-empty">Nothing booked with this vendor yet.</p>}
      </div>
    </DetailSheet>
  );
}

// ---- the page ----------------------------------------------------------------------------------------------------------------
export default function Expenses() {
  const { db, F, t, ready } = useFinance();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [f, setF] = useState(NO_FILTERS);
  const [page, setPage] = useState(0);
  const [sheet, setSheet] = useState(null);   // { kind: 'add' | 'edit' | 'exp' | 'vendor' | 'addVendor', id?, preset? }

  useEffect(() => {
    const p = readParams();
    if (TABS.some(([k]) => k === p.get('tab'))) setTab(p.get('tab'));
    if (p.get('cat') && CATEGORIES.some((c) => c.key === p.get('cat'))) setF((o) => ({ ...o, cat: p.get('cat'), month: '' }));
    if (p.get('add') === '1') setSheet({ kind: 'add' });
    if (p.get('id')) setSheet({ kind: 'exp', id: p.get('id') });
  }, []);
  const go = (k) => { setTab(k); setPage(0); setParams({ tab: k === 'all' ? '' : k, id: '' }); };
  const setFilter = (k) => (v) => { setF((o) => ({ ...o, [k]: v })); setPage(0); };
  const openExp = (id) => { setSheet({ kind: 'exp', id }); setParams({ id }); };
  const closeSheet = () => { setSheet(null); setParams({ id: '', add: '' }); };

  let d = null, error = null;
  if (ready) {
    try {
      const rows = ledger(db, F, t);
      const bal = balances(db, F, t, t, rows);
      const m0 = startOfMonth(t), m1 = addMonths(m0, -1, 1), m7 = addMonths(m0, -6, 1);
      const thisM = expensesIn(F, m0, t + 1), lastM = expensesIn(F, m1, m0), six = expensesIn(F, m7, m0);
      d = {
        bal, lastName: periodLabel(periodOf(m1 + 3600e3)),
        spent: thisM.reduce((s, e) => s + expenseTotal(e), 0), last: lastM.reduce((s, e) => s + expenseTotal(e), 0),
        avg: Math.round(six.reduce((s, e) => s + expenseTotal(e), 0) / 6), vat: thisM.reduce((s, e) => s + (e.vat || 0), 0),
        all: [...F.expenses].sort((a, b) => b.at - a.at || b.id.localeCompare(a.id)),
      };
    } catch (e) { error = e; }
  }
  const counts = d ? { all: d.all.length, waiting: 0, topay: 0, paid: 0, draft: 0, vendors: F.vendors.length } : {};
  if (d) for (const e of d.all) { const k = Object.keys(TAB_STATUS).find((x) => TAB_STATUS[x] === e.status); if (k) counts[k]++; }
  const months = d ? [...new Set(d.all.map((e) => periodOf(e.at)))].sort().reverse() : [];
  const s = q.trim().toLowerCase();
  const filtered = d && tab !== 'vendors' ? d.all.filter((e) => {
    if (TAB_STATUS[tab] && e.status !== TAB_STATUS[tab]) return false;
    if (f.cat && e.category !== f.cat) return false;
    if (f.vendor && e.vendor !== f.vendor) return false;
    if (f.account && e.account !== f.account) return false;
    if (f.month && periodOf(e.at) !== f.month) return false;
    if (!s) return true;
    return [e.id, vendorName(F, e.vendor), catBy(e.category).name, e.note, e.createdBy, e.attachment, e.ref].join(' ').toLowerCase().includes(s);
  }) : [];
  const vendorsShown = d && tab === 'vendors' ? F.vendors.filter((v) => (!f.cat || v.category === f.cat) && (!s || [v.name, v.contact, v.email, v.phone].join(' ').toLowerCase().includes(s))).sort((a, b) => a.name.localeCompare(b.name)) : [];
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const shown = filtered.slice(pg * PAGE, pg * PAGE + PAGE);
  const sum = filtered.reduce((a, e) => a + expenseTotal(e), 0);
  const filtersOn = !!s || Object.values(f).some(Boolean);

  const exportCsv = () => {
    if (!d) return;
    if (tab === 'vendors') {
      downloadCsv('gridcommerce-vendors.csv', [['Vendor', 'Category', 'Contact', 'Phone', 'Email', 'Terms', 'Paid from'], ...vendorsShown.map((v) => [v.name, catBy(v.category).name, v.contact, v.phone, v.email, v.terms, accName(F, v.account)])]);
    } else {
      downloadCsv(`gridcommerce-expenses-${tab}.csv`, [['Expense', 'Bill date', 'Category', 'Vendor', 'Amount (BDT)', 'VAT (BDT)', 'Total (BDT)', 'Paid from', 'Status', 'Added by', 'Approved by', 'Paid on', 'Reference', 'Attachment', 'Note'],
        ...filtered.map((e) => [e.id, dmy(e.at), catBy(e.category).name, vendorName(F, e.vendor), e.amount, e.vat || 0, expenseTotal(e), accName(F, e.account), EXP_STATUS[e.status].label, e.createdBy, e.approvedBy || '', e.paidAt ? dmy(e.paidAt) : '', e.ref || '', e.attachment || '', e.note || ''])]);
    }
    toast('Exported');
  };

  const header = (
    <ShopHeader icon="receipt" title="Expenses"
      about="Everything GridCommerce spends: salaries, servers and hosting, the SMS, email and AI providers behind the credits stores buy, marketing, the office, software, legal and accounts, travel. An expense is added (or saved as a draft), approved by finance or an admin who did not add it, then marked paid from an account. Monthly bills arrive by themselves on their day and wait for approval."
      secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv }]}
      more={[{ label: 'Add vendor', onClick: () => setSheet({ kind: 'addVendor' }) }, { label: 'Accounts', href: '/admin/accounts' }, { label: 'Financial reports', href: '/admin/accounts?tab=reports' }]}
      primary={{ label: 'Add expense', icon: 'plus', onClick: () => setSheet({ kind: 'add' }) }} />
  );

  let body;
  if (!ready) body = <Skeleton label="Loading expenses" />;
  else if (error) body = <ErrorCard what="The expenses" />;
  else {
    const tabs = TABS.map(([k, label]) => ({ key: k, id: 'exp-tab-' + k, label, count: counts[k], on: tab === k, onClick: () => go(k) }));
    const filters = tab === 'vendors'
      ? [{ key: 'cat', label: 'Category', all: 'All categories', value: f.cat, options: CATEGORIES.map((c) => [c.key, c.name]), onChange: setFilter('cat') }]
      : [
        { key: 'cat', label: 'Category', all: 'All categories', value: f.cat, options: CATEGORIES.map((c) => [c.key, c.name]), onChange: setFilter('cat') },
        { key: 'vendor', label: 'Vendor', all: 'All vendors', value: f.vendor, options: [...F.vendors].sort((a, b) => a.name.localeCompare(b.name)).map((v) => [v.id, v.name]), onChange: setFilter('vendor') },
        { key: 'account', label: 'Paid from', all: 'All accounts', value: f.account, options: F.accounts.map((a) => [a.id, a.name]), onChange: setFilter('account') },
        { key: 'month', label: 'Month', all: 'All months', value: f.month, options: months.map((m) => [m, periodLabel(m)]), onChange: setFilter('month') },
      ];
    let list;
    if (tab === 'vendors') {
      const year0 = addMonths(startOfMonth(t), -11, 1);
      const spentBy = {};
      for (const e of F.expenses) if (e.status !== 'draft' && e.at >= year0) spentBy[e.vendor] = (spentBy[e.vendor] || 0) + expenseTotal(e);
      const openV = (v) => setSheet({ kind: 'vendor', id: v.id });
      list = !vendorsShown.length ? (
        <div className="ix-empty"><EmptyState title="No vendors match." actionLabel="Add vendor" onAction={() => setSheet({ kind: 'addVendor' })} /></div>
      ) : (
        <>
          <ul className="ix-plist" aria-label="Vendors">
            {vendorsShown.map((v) => (
              <li key={v.id}><button type="button" className="ix-pitem" onClick={() => openV(v)}>
                <span className="ix-pitem__top"><b>{v.name}</b><span className="fn-fig">{money(spentBy[v.id] || 0)}</span></span>
                <span className="ix-pitem__mid">{catBy(v.category).name} · {v.terms}</span>
              </button></li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table">
              <caption className="sr-only">Vendors</caption>
              <thead><tr><th scope="col">Vendor</th><th scope="col">Category</th><th scope="col">Contact</th><th scope="col">Terms</th><th scope="col">Paid from</th><th scope="col" className="ix-num">Last 12 months</th></tr></thead>
              <tbody>
                {vendorsShown.map((v) => (
                  <tr key={v.id} tabIndex={0} onClick={rowGo(() => openV(v))} onKeyDown={rowKey(() => openV(v))}>
                    <td><span className="fn-name"><b>{v.name}</b></span></td>
                    <td className="ix-nowrap">{catBy(v.category).name}</td>
                    <td><span className="fn-name"><span>{v.contact}</span><small>{v.phone !== '—' ? v.phone : v.email}</small></span></td>
                    <td className="ix-nowrap ix-muted">{v.terms}</td>
                    <td className="ix-nowrap ix-muted">{accName(F, v.account)}</td>
                    <td className="ix-num"><span className={'fn-fig' + (spentBy[v.id] ? '' : ' fn-muted')}>{money(spentBy[v.id] || 0)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    } else if (!filtered.length) {
      const tabLabel = (TABS.find(([k]) => k === tab) || [])[1];
      list = (
        <div className="ix-empty">
          {filtersOn
            ? <EmptyState title="No expenses match these filters." actionLabel="Clear filters" onAction={() => { setQ(''); setF(NO_FILTERS); }} />
            : <EmptyState icon="receipt" title={tab === 'all' ? 'No expenses yet.' : `Nothing in ${tabLabel.toLowerCase()}.`} actionLabel="Add expense" onAction={() => setSheet({ kind: 'add' })} />}
        </div>
      );
    } else {
      list = (
        <>
          <ul className="ix-plist" aria-label="Expenses">
            {shown.map((e) => (
              <li key={e.id}><button type="button" className="ix-pitem" onClick={() => openExp(e.id)}>
                <span className="ix-pitem__top"><b>{vendorName(F, e.vendor) === '—' ? catBy(e.category).name : vendorName(F, e.vendor)}</b><span className="fn-fig">{money(expenseTotal(e))}</span></span>
                <span className="ix-pitem__mid">{dmy(e.at)} · {catBy(e.category).name} · {accName(F, e.account)}</span>
                <span className="ix-pitem__tags"><ExpBadge status={e.status} /></span>
              </button></li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table">
              <caption className="sr-only">Expenses</caption>
              <thead><tr><th scope="col">Date</th><th scope="col">Expense</th><th scope="col">Category</th><th scope="col">Paid from</th><th scope="col">Status</th><th scope="col" className="ix-num">Total</th></tr></thead>
              <tbody>
                {shown.map((e) => (
                  <tr key={e.id} tabIndex={0} onClick={rowGo(() => openExp(e.id))} onKeyDown={rowKey(() => openExp(e.id))}>
                    <td className="ix-nowrap ix-muted">{when(e.at, t)}</td>
                    <td><span className="fn-name"><b>{vendorName(F, e.vendor) === '—' ? e.note || catBy(e.category).name : vendorName(F, e.vendor)}</b><small><span className="fn-data">{e.id}</span>{e.note ? ' · ' + e.note : ''}</small></span></td>
                    <td className="ix-nowrap">{catBy(e.category).name}</td>
                    <td className="ix-nowrap ix-muted">{accName(F, e.account)}</td>
                    <td><ExpBadge status={e.status} /></td>
                    <td className="ix-num"><span className="fn-fig">{money(expenseTotal(e))}</span>{e.vat ? <small className="ix-muted" style={{ display: 'block', fontSize: 'var(--text-xs)' }}>VAT {money(e.vat)}</small> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    }
    body = (
      <>
        <MetricStrip label="Spending" items={[
          { label: 'Spent this month', value: money(d.spent), sub: 'so far' },
          { label: 'Last month', value: money(d.last), sub: d.lastName, icon: 'calendar' },
          { label: 'Average a month', value: money(d.avg), sub: 'last 6 months', icon: 'chart-column' },
          { label: 'VAT this month', value: money(d.vat), sub: 'on bills', icon: 'percent' },
        ]} />
        <section className="ix-card" aria-label="Expenses">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Expense views" /></div>
          <div className="fn-filters"><FilterBar label={tab === 'vendors' ? 'Filter vendors' : 'Filter expenses'} filters={filters} onClear={() => setQ('')}
            search={{ value: q, onChange: (v) => { setQ(v); setPage(0); }, placeholder: tab === 'vendors' ? 'Search vendor or contact' : 'Search vendor, note, person or ID' }}
            right={tab === 'vendors' ? <button type="button" className="ix-btn" onClick={() => setSheet({ kind: 'addVendor' })}><Icon name="plus" width="16" height="16" aria-hidden="true" /><span>Add vendor</span></button> : null} /></div>
          {list}
          {tab === 'vendors'
            ? <div className="ix-foot"><span>{plural(vendorsShown.length, 'vendor')}</span></div>
            : <Pager label={<span className="fn-tfoot"><span>{filtered.length ? `${pg * PAGE + 1}–${pg * PAGE + shown.length} of ${filtered.length}` : '0 expenses'}</span>{sum ? <span>Total <b>{money(sum)}</b></span> : null}</span>}
              atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />}
        </section>
      </>
    );
  }

  const sheetEl = (() => {
    if (!sheet || !d) return null;
    if (sheet.kind === 'add') return <ExpenseForm F={F} t={t} bal={d.bal} preset={sheet.preset} close={closeSheet} />;
    if (sheet.kind === 'edit') { const e = F.expenses.find((x) => x.id === sheet.id); return e ? <ExpenseForm F={F} t={t} bal={d.bal} draft={e} close={closeSheet} /> : null; }
    if (sheet.kind === 'exp') { const e = F.expenses.find((x) => x.id === sheet.id); return e ? <ExpenseSheet key={e.id + e.status} F={F} t={t} bal={d.bal} e={e} close={closeSheet} edit={() => setSheet({ kind: 'edit', id: e.id })} /> : null; }
    if (sheet.kind === 'addVendor') return <VendorForm F={F} close={closeSheet} />;
    if (sheet.kind === 'vendor') {
      const v = F.vendors.find((x) => x.id === sheet.id);
      return v ? <VendorSheet F={F} t={t} v={v} close={closeSheet} openExpense={openExp} addFor={() => setSheet({ kind: 'add', preset: { vendor: v.id, category: v.category, account: v.account } })} /> : null;
    }
    return null;
  })();

  return (
    <AdminShell active="expenses" title="Expenses">
      <style dangerouslySetInnerHTML={{ __html: FIN_CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>
      {sheetEl}
    </AdminShell>
  );
}
