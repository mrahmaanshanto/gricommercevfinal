'use client';
// AccountSetup — the settings behind Accounts, in plain words for a shop owner. A settings page in the
// Shopify style (docs/shopify-style.md): a back arrow to the Money overview, then one card with a tab per area.
//   Payment partners  each gateway's fee, each courier's COD % and delivery charge per zone, when they pay out,
//                     into which account, and the days they don't pay; a row opens its setup (GatewaySetup)
//   Categories        expense categories (each belongs to a sales channel or is shared by the whole shop, which
//                     Sales & profit uses for profit by channel) and income categories, with this month's money
//                     in each; add, and a click on the name to rename, archive or restore
//   Banks & wallets   the shop's own cash, bank and mobile wallet accounts (add one here; a row opens it in
//                     Money), and the money partners are holding (read-only, handled in Payouts)
//   Holidays          public holidays payouts skip (add, remove, restore the defaults)
//   Evening check     when the app asks whether today's payouts arrived, and browser notifications
//   Approvals         approval limits (by amount, category, account or branch) and each person's finance duties
//                     (setupParts.jsx › ApprovalsPanel)
//   Advanced          chart of accounts, journals, VAT, and resetting the demo money data
// A bank, wallet or cash account opens its properties (currency, branch, roles, matching, archive / restore:
// setupParts.jsx › AccountSheet). ?tab=partners|categories|accounts|holidays|check|approvals|advanced opens a tab;
// ?account=<id> opens that account.
// Front end only: settings are kept in this browser (settlements.js getConfig/saveConfig, ledger.js addAccount,
// categories.js for the categories).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { Dialog, EmptyState, InfoTip, StatusBadge } from '@/components/ui';
import { IndexTabs } from '@/components/ui/IndexKit';
import { BrandLogo } from '@/components/BrandLogo';
import { GatewaySetup } from '@/components/GatewaySetup';
import { OWN_ACCOUNTS, HOLDING_ACCOUNTS, balanceOf, getEntries, addAccount, isArchived, accountProps } from '@/lib/ledger';
import { partnerInEdition, partnerBy, PARTNERS, DEFAULT_CONFIG, getConfig, saveConfig, getAllPartners, ruleText, feeText, weekendText, holidaysOf, HOLIDAYS_2026, COURIER_RATES, heldBy, clockNow, dayKey, fromKey } from '@/lib/settlements';
import { getCategories, addCategory, editCategory, archiveCategory, COST_HOMES, DEFAULT_EXPENSE, DEFAULT_INCOME } from '@/lib/categories';
import { AccPage, useBooks, money, shortDate, accName } from './accShared';
import { AccountSheet, ApprovalsPanel, SETUP_PARTS_CSS } from './setupParts';

const TABS = [['partners', 'Payment partners'], ['categories', 'Categories'], ['accounts', 'Banks & wallets'], ['holidays', 'Holidays'], ['check', 'Evening check'], ['approvals', 'Approvals'], ['advanced', 'Advanced']];
const ZONES = Object.keys(COURIER_RATES);
const HOURS = [17, 18, 19, 20, 21, 22, 23];
const hourText = (h) => `${h > 12 ? h - 12 : h} PM`;
const GRACE = [[0, 'Late the day after it was due'], [1, 'After 1 working day'], [2, 'After 2 working days'], [3, 'After 3 working days']];
const graceText = (g) => (g ? `late after ${g} working day${g === 1 ? '' : 's'}` : 'late the next day');
const GROUPS = [['Cash', 'Cash'], ['Bank', 'Banks'], ['Mobile', 'Mobile wallets']];
const BRAND_OPTIONS = [['', 'No logo'], ['bracbank', 'BRAC Bank'], ['citybank', 'City Bank'], ['dbbl', 'Dutch-Bangla Bank'], ['bkash', 'bKash'], ['nagad', 'Nagad'], ['rocket', 'Rocket'], ['cash', 'Cash'], ['safe', 'Safe']];
const BRAND_FOR_TYPE = { Bank: 'bracbank', Mobile: 'bkash', Cash: 'cash' };
const MONEY_KEYS = ['gc.ledger', 'gc.settle.items', 'gc.settle.payouts', 'gc.settle.config', 'gc.ledger.accounts', 'gc.ledger.props', 'gc.fin.approvals', 'gc.fin.limits', 'gc.fin.duties', 'gc.fin.stmt', 'gc.fin.allocations', 'gc.fin.writeoffs', 'gc.refunds', 'gc.pay.links', 'gc.pay.manual', 'gc.pay.refs', 'gc.pay.locks', 'gc.pay.batches', 'gc.pay.terminals'];
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : NaN; };
const clean = (v) => String(v).replace(/[^\d.]/g, '');
const logoOf = (a) => a.brand || a.name;
const HOME_TEXT = { Shared: 'Shared by the whole shop', Online: 'Counts under Online', Retail: 'Counts under Retail', Wholesale: 'Counts under Wholesale' };
const homeToast = (name, home) => (home === 'Shared' ? `${name} is now shared by the whole shop` : `${name} now counts under ${home}`);
const SPEND_KINDS = ['expense', 'salary'];
/** Money in each category for one month: { expense: { name: ৳ }, income: { name: ৳ } }. */
function monthSums(entries, from, to) {
  const expense = {}, income = {};
  entries.forEach((e) => {
    if (e.at < from || e.at >= to) return;
    if (SPEND_KINDS.includes(e.kind) && e.amount < 0) { const c = e.cat || (e.kind === 'salary' ? 'Salary' : 'Other'); expense[c] = (expense[c] || 0) - e.amount; }
    else if (e.kind === 'income') { const c = e.cat || 'Other income'; income[c] = (income[c] || 0) + e.amount; }
  });
  return { expense, income, any: Object.keys(expense).length + Object.keys(income).length > 0 };
}

const CSS = `
.as-body{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-3) var(--space-4) var(--space-4)}
.as-note{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.as-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.as-out{color:var(--text-danger)}
.as-name{display:inline-flex;align-items:center;gap:var(--space-2);min-width:0}
.as-name .gc-badge{flex:none}
.as-cats{list-style:none;margin:0;padding:0}
.as-cat{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);min-height:44px;padding:6px var(--space-4);border-top:1px solid var(--border-subtle)}
.as-cat__name{flex:1 1 180px;min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:0;border:0;background:none;font:inherit;text-align:left;cursor:pointer}
.as-cat__name b{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.as-cat__name:hover b{color:var(--primary);text-decoration:underline}
.as-cat__name small{font-size:var(--text-xs);color:var(--text-muted)}
.as-cat.is-archived .as-cat__name b{color:var(--text-muted)}
.as-cat .ix-pick{max-width:150px}
.as-add{display:grid;grid-template-columns:minmax(0,180px) minmax(0,1fr) auto;gap:var(--space-3);align-items:end}
.as-past td{color:var(--text-muted)}
.as-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:44px;padding:var(--space-2) 0;border-top:1px solid var(--border-subtle)}
.as-row b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.as-row small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.as-links{list-style:none;margin:0;padding:0}
.as-link{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle);color:inherit;text-decoration:none}
.as-link:hover{background:var(--surface-subtle)}
.as-link>span{flex:1;min-width:0}
.as-link b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.as-link small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.as-link>svg{flex:none;color:var(--text-muted)}
.as-danger b{color:var(--text-danger)}
@media (max-width:640px){.as-add{grid-template-columns:1fr}}
`;
const ABOUT = 'Payment partners, expense and income categories, your banks and wallets, holidays and the evening payout check.';

export default function AccountSetup() {
  const tick = useBooks();
  const [tab, setTab] = useState('partners');
  const [wizard, setWizard] = useState(null);  // gateway setup: { partner } or { add: true }
  const [acc, setAcc] = useState(null);        // new account form
  const [hol, setHol] = useState({ date: '', name: '' });
  const [perm, setPerm] = useState('');
  const [catForm, setCatForm] = useState(null);   // add / rename a category: { mode, kind, id, name, home, help, archived }
  const [sheet, setSheet] = useState('');         // an account whose properties are open

  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get('tab');
    if (TABS.some((x) => x[0] === want)) setTab(want);
    const accId = new URLSearchParams(window.location.search).get('account');
    if (accId) { setTab('accounts'); setSheet(accId); }
    setPerm(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);
  }, []);
  const pickTab = (id) => {
    setTab(id);
    try { const u = new URL(window.location.href); u.searchParams.set('tab', id); window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash); } catch { /* ignore */ }
  };

  // everything below reads this browser's storage, so it waits for the first tick after mount
  const data = useMemo(() => {
    const cfg = tick ? getConfig() : DEFAULT_CONFIG;
    const entries = getEntries();
    const own = tick ? OWN_ACCOUNTS() : [];
    const now = tick ? clockNow() : 0;
    const holidays = holidaysOf(cfg);
    const today = tick ? dayKey(now) : '';
    return {
      cfg, now, today, holidays,
      partners: tick ? getAllPartners(cfg) : [],
      own: own.map((a) => ({ ...a, balance: balanceOf(a.id, entries), archived: isArchived(a.id), branch: accountProps(a.id).branch })),
      holding: tick ? HOLDING_ACCOUNTS().filter((a) => !a.partner || partnerInEdition(partnerBy(a.partner))).map((a) => ({ ...a, held: heldBy(a.partner) })) : [],
    };
  }, [tick]);

  // categories with this month's money in each (last month's on a month that has just started)
  const cats = useMemo(() => {
    if (!tick) return { expense: [], income: [], when: '' };
    const d = new Date(clockNow());
    const start = (back) => new Date(d.getFullYear(), d.getMonth() + back, 1).getTime();
    const entries = getEntries();
    let sums = monthSums(entries, start(0), start(1)), when = 'this month';
    if (!sums.any) { sums = monthSums(entries, start(-1), start(0)); when = 'in ' + new Date(start(-1)).toLocaleString('en', { month: 'long' }); }
    // entries keep the name they were saved with, so a renamed built-in also counts its original name
    const withSum = (kind, defaults) => getCategories(kind, { withArchived: true }).map((c) => {
      const names = [...new Set([c.name, c.builtIn ? (defaults.find((x) => x.id === c.id) || {}).name : ''].filter(Boolean))];
      return { ...c, sum: Math.round(names.reduce((a, n) => a + (sums[kind][n] || 0), 0) * 100) / 100 };
    }).sort((a, b) => Number(a.archived) - Number(b.archived));
    return { expense: withSum('expense', DEFAULT_EXPENSE), income: withSum('income', DEFAULT_INCOME), when };
  }, [tick]);
  const { cfg } = data;
  const changed = Object.keys(cfg.partners || {}).filter((id) => PARTNERS.some((p) => p.id === id));
  const holidaysChanged = (cfg.holidaysAdded || []).length + (cfg.holidaysRemoved || []).length > 0;

  // ---- banks & wallets ---------------------------------------------------------------------------
  const saveAccount = (e) => {
    e.preventDefault();
    const name = acc.name.trim();
    if (!name) { toast('Give the account a name', { tone: 'error' }); return; }
    if (data.own.some((a) => a.name.toLowerCase() === name.toLowerCase())) { toast('An account with this name already exists', { tone: 'error' }); return; }
    const opening = acc.opening === '' ? 0 : num(acc.opening);
    if (Number.isNaN(opening)) { toast('Enter the opening balance as a number', { tone: 'error' }); return; }
    const row = addAccount({ name, type: acc.type, brand: acc.brand || undefined, opening });
    toast(`${row.name} added with ${money(row.opening)}`);
    setAcc(null);
  };

  // ---- holidays ----------------------------------------------------------------------------------
  const addHoliday = (e) => {
    e.preventDefault();
    const name = hol.name.trim();
    if (!hol.date) { toast('Pick the date of the holiday', { tone: 'error' }); return; }
    if (!name) { toast('Give the holiday a name', { tone: 'error' }); return; }
    if (data.holidays.some(([k]) => k === hol.date)) { toast(`${shortDate(fromKey(hol.date))} is already a holiday`, { tone: 'error' }); return; }
    const fresh = getConfig();
    const isDefault = HOLIDAYS_2026.some(([k]) => k === hol.date);
    saveConfig({ ...fresh, holidaysAdded: [...(fresh.holidaysAdded || []), [hol.date, name]], holidaysRemoved: isDefault ? (fresh.holidaysRemoved || []).filter((k) => k !== hol.date) : fresh.holidaysRemoved || [] });
    toast(`${name} added · payouts due on ${shortDate(fromKey(hol.date))} move to the next working day`);
    setHol({ date: '', name: '' });
  };
  const removeHoliday = async ([key, name]) => {
    const ok = await confirmDialog({ title: `Remove ${name}?`, body: `Payouts can be expected on ${shortDate(fromKey(key))} again.`, confirmLabel: 'Remove', tone: 'danger' });
    if (!ok) return;
    const fresh = getConfig();
    const added = fresh.holidaysAdded || [];
    const next = { ...fresh, holidaysAdded: added.filter(([k]) => k !== key) };
    if (HOLIDAYS_2026.some(([k]) => k === key)) next.holidaysRemoved = [...new Set([...(fresh.holidaysRemoved || []), key])];
    saveConfig(next);
    toast(`${name} removed`);
  };
  const restoreHolidays = async () => {
    const ok = await confirmDialog({ title: 'Restore the default holidays?', body: 'Holidays you added are removed and the ones you removed come back.', confirmLabel: 'Restore', tone: 'danger' });
    if (!ok) return;
    saveConfig({ ...getConfig(), holidaysAdded: [], holidaysRemoved: [] });
    toast('Default holidays restored');
  };

  // ---- categories --------------------------------------------------------------------------------
  const setHome = (c, home) => { editCategory('expense', c.id, { home }); toast(homeToast(c.name, home)); };
  const openAddCat = (kind) => setCatForm({ mode: 'add', kind, id: '', name: '', home: 'Shared', help: '' });
  const openRename = (kind, c) => setCatForm({ mode: 'rename', kind, id: c.id, name: c.name, home: c.home || 'Shared', help: c.help || '', archived: !!c.archived });
  const saveCat = (e) => {
    e.preventDefault();
    const { mode, kind, id } = catForm;
    const name = catForm.name.trim();
    if (!name) { toast('Give the category a name', { tone: 'error' }); return; }
    const clash = getCategories(kind, { withArchived: true }).find((c) => c.id !== id && c.name.toLowerCase() === name.toLowerCase());
    if (clash) { toast(clash.archived ? `${clash.name} already exists and is archived. Restore it instead.` : `There is already a category called ${clash.name}`, { tone: 'error' }); return; }
    if (mode === 'add') {
      addCategory(kind, { name, home: catForm.home, help: catForm.help.trim() });
      toast(kind === 'expense' ? `${name} added · ${HOME_TEXT[catForm.home].toLowerCase()}` : `${name} added to income categories`);
    } else {
      const old = (getCategories(kind, { withArchived: true }).find((c) => c.id === id) || {}).name;
      if (old === name) { setCatForm(null); return; }
      editCategory(kind, id, { name });
      toast(`${old} renamed to ${name} · entries already recorded keep the old name`);
    }
    setCatForm(null);
  };
  const toggleArchive = (kind, c) => {
    const on = !c.archived;
    archiveCategory(kind, c.id, on);
    toast(on ? `${c.name} archived · it is hidden from the lists, past entries keep it` : `${c.name} restored`, { undo: () => archiveCategory(kind, c.id, !on) });
  };

  // ---- evening check -----------------------------------------------------------------------------
  const setCheck = (patch, msg) => { saveConfig({ ...getConfig(), ...patch }); toast(msg); };
  const allowNotes = async () => {
    if (typeof Notification === 'undefined') { toast('This browser does not support notifications', { tone: 'error' }); return; }
    if (Notification.permission === 'denied') { toast('Notifications are blocked. Allow them for this site in the browser settings.', { tone: 'info' }); return; }
    try {
      const res = await Notification.requestPermission();
      setPerm(res);
      toast(res === 'granted' ? 'Notifications allowed · you get a note at the evening check' : 'Notifications were not allowed', { tone: res === 'granted' ? 'success' : 'info' });
    } catch { toast('The browser did not ask. Allow notifications in the browser settings.', { tone: 'info' }); }
  };
  const PERM = { granted: ['Allowed', 'success'], denied: ['Blocked', 'error'], default: ['Not asked yet', 'neutral'], unsupported: ['Not supported', 'neutral'], '': ['Checking…', 'neutral'] };
  const hour = cfg.promptHour ?? 20;
  const nextCheck = data.now ? (new Date(data.now).getHours() >= hour ? 'Tomorrow' : 'Today') + ' at ' + hourText(hour) : hourText(hour);

  // ---- advanced ----------------------------------------------------------------------------------
  const resetMoney = async () => {
    const ok = await confirmDialog({ title: 'Reset demo money data?', body: 'Every payment, payout, transfer, added account and Accounts setting made in this browser is removed. The demo month comes back.', confirmLabel: 'Reset', tone: 'danger' });
    if (!ok) return;
    MONEY_KEYS.forEach((k) => { try { window.localStorage.removeItem(k); } catch { /* ignore */ } });
    toast('Demo money data reset');
    setTimeout(() => window.location.reload(), 400);
  };

  const tabs = TABS.map(([id, label]) => ({ key: id, id: 'as-tab-' + id, label, on: tab === id, onClick: () => pickTab(id) }));
  const ownGroups = GROUPS.map(([type, label]) => ({ type, label, list: data.own.filter((a) => a.type === type) })).filter((g) => g.list.length);

  return (
    <AccPage screen="AccountSetup" active="acc-setup" page="Setup" title="Accounts setup" css={CSS + SETUP_PARTS_CSS} back="/accounts-home" backLabel="Money overview" narrow about={ABOUT}>
      <section className="ix-card" aria-label="Accounts setup">
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Accounts setup" /></div>

        <div id="as-panel" role="tabpanel" aria-labelledby={'as-tab-' + tab}>
          {tab === 'partners' ? (<>
            <header className="ix-card__head">
              <h2>Payment partners <InfoTip text="Gateways, the card machine and couriers: how their money reaches you, how it is settled, and their keys." /></h2>
              <button type="button" className="ix-btn ix-btn--sm" onClick={() => setWizard({ add: true })}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add payment partner</button>
            </header>
            <div className="as-body"><p className="as-note">These are common rates in Bangladesh. Check them against your own agreement.</p></div>
            <ul className="ix-plist" aria-label="Payment partners">
              {data.partners.map((p) => (
                <li key={p.id}>
                  <button type="button" className="ix-pitem" onClick={() => setWizard({ partner: p })}>
                    <span className="ix-pitem__top"><b>{p.name}</b><span className="ix-muted">{p.kind}</span></span>
                    <span className="ix-pitem__mid">{feeText(p)} · {ruleText(p)}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">Payment partners</caption>
                <thead><tr><th scope="col">Partner</th><th scope="col">Fee</th><th scope="col">Pays out</th><th scope="col">Pays into</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {data.partners.map((p) => {
                    const rates = p.kind === 'Courier' ? 'Delivery charge ' + ZONES.map((z) => `${z} ${money({ ...COURIER_RATES, ...(p.rates || {}) }[z])}`).join(' · ') : '';
                    return (
                      <tr key={p.id} onClick={(e) => { if (!e.target.closest('button')) setWizard({ partner: p }); }} title={p.note || undefined}>
                        <td title={p.kind}><span className="as-name"><BrandLogo brand={p.brand} size={24} decorative /><span className="ix-strong">{p.name}</span>{changed.includes(p.id) ? <StatusBadge tone="neutral" icon="pencil">Changed by you</StatusBadge> : null}</span></td>
                        <td className="ix-muted" title={rates || undefined}>{feeText(p)}</td>
                        <td title={p.mode === 'direct' ? undefined : p.weekend && p.weekend.length ? `Doesn’t pay on ${weekendText(p.weekend)}` : 'Pays every day'}>{ruleText(p)}</td>
                        <td className="ix-muted">{p.mode === 'direct' ? 'Straight into your account' : accName(p.to)}</td>
                        <td className="ac-act"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setWizard({ partner: p })} aria-label={`Set up ${p.name}`}>Set up</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>) : null}

          {tab === 'categories' ? (<>
            <CategoryList kind="expense" title="Expense categories" when={cats.when} list={cats.expense} ready={!!tick}
              help="What money is spent on, and which channel carries the cost. Each expense category belongs to a sales channel or is shared by the whole shop; Sales & profit uses this to work out each channel’s profit. Archived categories are hidden when you record money; entries already filed under them keep their name. Built-in categories can be archived but not deleted."
              onAdd={() => openAddCat('expense')} onRename={(c) => openRename('expense', c)} onHome={setHome} />
            <CategoryList kind="income" title="Income categories" when={cats.when} list={cats.income} ready={!!tick}
              help="Money that comes in and is not a sale."
              onAdd={() => openAddCat('income')} onRename={(c) => openRename('income', c)} />
          </>) : null}

          {tab === 'accounts' ? (<>
            <header className="ix-card__head">
              <h2>Your banks and wallets <InfoTip text="Where the shop’s own money sits. Balances are the opening balance plus every payment in and out." /></h2>
              <button type="button" className="ix-btn ix-btn--sm" onClick={() => setAcc({ type: 'Bank', name: '', brand: BRAND_FOR_TYPE.Bank, opening: '' })}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add account</button>
            </header>
            <div style={{ height: 'var(--space-3)' }} />
            {!tick ? null : (<>
              <ul className="ix-plist" aria-label="Your banks and wallets">
                {ownGroups.map((g) => (
                  <React.Fragment key={g.type}>
                    <li className="ac-plh">{g.label}<small>{money(g.list.reduce((s, a) => s + a.balance, 0))}</small></li>
                    {g.list.map((a) => (
                      <li key={a.id}>
                        <button type="button" className="ix-pitem" onClick={() => setSheet(a.id)}>
                          <span className="ix-pitem__top"><b>{accName(a.id)}</b><span className={'as-fig' + (a.balance < 0 ? ' as-out' : '')}>{a.balance < 0 ? '−' : ''}{money(a.balance)}</span></span>
                          <span className="ix-pitem__mid">Opening {money(a.opening)}{a.custom ? ' · Added by you' : ''}{a.archived ? ' · Archived' : ''}</span>
                        </button>
                      </li>
                    ))}
                  </React.Fragment>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table gc-table--keep">
                  <caption className="sr-only">Your banks and wallets</caption>
                  <thead><tr><th scope="col">Account</th><th scope="col">Branch</th><th scope="col">Status</th><th scope="col" className="ix-num">Opening balance</th><th scope="col" className="ix-num">Balance now</th></tr></thead>
                  {ownGroups.map((g) => (
                    <tbody key={g.type}>
                      <tr className="ac-grp"><th scope="rowgroup" colSpan={4}>{g.label}<small>{g.list.length}</small></th><td className="ix-num as-fig">{money(g.list.reduce((s, a) => s + a.balance, 0))}</td></tr>
                      {g.list.map((a) => (
                        <tr key={a.id} onClick={(e) => { if (!e.target.closest('a')) setSheet(a.id); }}>
                          <td><span className="as-name"><BrandLogo brand={logoOf(a)} size={24} decorative /><Link href={`/money?account=${encodeURIComponent(a.id)}`} className="ix-strong" aria-label={`Open ${accName(a.id)} in Money`}>{accName(a.id)}</Link><span className="ix-muted">{a.custom ? 'Added by you' : g.type === 'Mobile' ? 'Mobile wallet' : g.type}</span></span></td>
                          <td className="ix-muted">{a.branch || 'Whole shop'}</td>
                          <td>{a.archived ? <StatusBadge tone="neutral" icon="archive">Archived</StatusBadge> : <StatusBadge tone="success">Active</StatusBadge>}</td>
                          <td className="ix-num as-fig ix-muted">{money(a.opening)}</td>
                          <td className={'ix-num as-fig ix-strong' + (a.balance < 0 ? ' as-out' : '')}>{a.balance < 0 ? '−' : ''}{money(a.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  ))}
                </table>
              </div>
            </>)}

            <section className="ac-sec" aria-labelledby="as-held">
              <header className="ix-card__head"><h2 id="as-held">Held by partners <InfoTip text="Money gateways and couriers collected for you and have not paid out yet. It changes by itself as payouts arrive." /></h2><Link href="/settlements">Payouts</Link></header>
              {!tick ? null : (<>
                <ul className="ix-plist" aria-label="Held by partners">
                  {data.holding.map((a) => (
                    <li key={a.id}><Link href="/settlements" className="ix-pitem"><span className="ix-pitem__top"><b>{a.name.replace(/ \(.*\)$/, '')}</b><span className="as-fig">{money(a.held)}</span></span></Link></li>
                  ))}
                </ul>
                <div className="ix-table-wrap" style={{ marginTop: 'var(--space-3)' }}>
                  <table className="ix-table gc-table--keep">
                    <caption className="sr-only">Held by partners</caption>
                    <thead><tr><th scope="col">Partner</th><th scope="col" className="ix-num">Holding now</th></tr></thead>
                    <tbody>
                      {data.holding.map((a) => (
                        <tr key={a.id} onClick={() => navigate('/settlements')}>
                          <td><span className="as-name"><BrandLogo brand={a.brand} size={24} decorative /><span className="ix-strong">{a.name.replace(/ \(.*\)$/, '')}</span><span className="ix-muted">{/withdraw/i.test(a.name) ? 'Withdraw it yourself' : 'Paid out by the partner'}</span></span></td>
                          <td className="ix-num as-fig ix-strong">{money(a.held)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>)}
            </section>
          </>) : null}

          {tab === 'holidays' ? (<>
            <header className="ix-card__head">
              <h2>Public holidays <InfoTip text="Payouts skip each partner’s days off and these holidays; the expected date moves to the next working day. Moon-based dates (Eid, Ashura, Eid-e-Miladunnabi) can move a day or two. Correct them here when they are announced." /></h2>
              <button type="button" className="ix-btn ix-btn--sm" onClick={restoreHolidays} disabled={!holidaysChanged}><Icon name="rotate-ccw" width="16" height="16" aria-hidden="true" />Restore defaults</button>
            </header>
            <form className="as-body as-add" onSubmit={addHoliday}>
              <div><label className="gc-label" htmlFor="as-hol-date">Date</label><input id="as-hol-date" type="date" className="gc-input" value={hol.date} onChange={(e) => setHol({ ...hol, date: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="as-hol-name">Holiday</label><input id="as-hol-name" className="gc-input" placeholder="For example: Shab-e-Barat" value={hol.name} onChange={(e) => setHol({ ...hol, name: e.target.value })} /></div>
              <button type="submit" className="gc-btn gc-btn--neutral"><Icon name="calendar-plus" width="16" height="16" aria-hidden="true" /> Add holiday</button>
            </form>
            {data.holidays.length === 0 ? <div className="ix-empty"><EmptyState icon="calendar-off" title="No holidays" actionLabel="Restore defaults" onAction={restoreHolidays} /></div> : (
              <div className="ix-table-wrap ix-table-wrap--show ac-sec">
                <table className="ix-table ix-table--static gc-table--keep">
                  <caption className="sr-only">Public holidays</caption>
                  <thead><tr><th scope="col">Date</th><th scope="col">Holiday</th><th scope="col">From</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                  <tbody>
                    {data.holidays.map(([k, name]) => {
                      const past = !!data.today && k < data.today;
                      const added = (cfg.holidaysAdded || []).some(([x]) => x === k);
                      return (
                        <tr key={k} className={past ? 'as-past' : undefined}>
                          <td className="as-fig ix-nowrap">{shortDate(fromKey(k))}{k.slice(0, 4) !== '2026' ? ` ${k.slice(0, 4)}` : ''}{past ? <span className="ix-muted"> · Passed</span> : null}</td>
                          <td className={past ? undefined : 'ix-strong'}>{name}</td>
                          <td><StatusBadge tone={added ? 'primary' : 'neutral'} icon={added ? 'pencil' : 'calendar'}>{added ? 'Added by you' : 'Default'}</StatusBadge></td>
                          <td className="ac-act"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Remove ${name}`} title="Remove" onClick={() => removeHoliday([k, name])}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>) : null}

          {tab === 'check' ? (<>
            <header className="ix-card__head">
              <h2>Evening payout check <InfoTip text="Every evening the app asks whether the payouts expected that day arrived. The check runs while the app is open. If it was closed at that time, you are asked the next time you open it." /></h2>
              <button type="button" className="ix-btn ix-btn--sm" onClick={() => window.dispatchEvent(new CustomEvent('gc:check'))}><Icon name="list-checks" width="16" height="16" aria-hidden="true" />Try it now</button>
            </header>
            <div className="as-body">
              <p className="as-note">Next check: {nextCheck}</p>
              <div className="ac-two">
                <div>
                  <label className="gc-label" htmlFor="as-hour">Ask me at</label>
                  <select id="as-hour" className="gc-input gc-select" value={hour} onChange={(e) => { const h = Number(e.target.value); setCheck({ promptHour: h }, `Evening check set to ${hourText(h)}`); }}>
                    {HOURS.map((h) => <option key={h} value={h}>{hourText(h)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="gc-label" htmlFor="as-grace">Mark a payout late <InfoTip text="How long to wait after the expected day before a payout shows as late." /></label>
                  <select id="as-grace" className="gc-input gc-select" value={cfg.grace ?? 1} onChange={(e) => { const g = Number(e.target.value); setCheck({ grace: g }, `Payouts are now ${graceText(g)}`); }}>
                    {GRACE.map(([g, l]) => <option key={g} value={g}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="as-row">
                <span><b>Browser notification</b><small>A note on screen at check time, even when another tab is open.</small></span>
                <span className="ac-row-actions" style={{ alignItems: 'center' }}>
                  <StatusBadge tone={PERM[perm][1]}>{PERM[perm][0]}</StatusBadge>
                  {perm !== 'granted' && perm !== 'unsupported' ? <button type="button" className="ix-btn ix-btn--sm" onClick={allowNotes}>Allow notifications</button> : null}
                </span>
              </div>
            </div>
          </>) : null}

          {tab === 'approvals' ? <ApprovalsPanel tick={tick} /> : null}

          {tab === 'advanced' ? (<>
            <header className="ix-card__head"><h2>For your accountant <InfoTip text="The books behind the simple pages. You don’t need these to run the shop." /></h2></header>
            <ul className="as-links" style={{ marginTop: 'var(--space-3)' }}>
              {[['/chart-of-accounts', 'Chart of accounts', 'Every account the books use, grouped as assets, liabilities, income and costs.'],
                ['/journals', 'Journals', 'Manual journal entries for corrections and year-end adjustments.'],
                ['/vat', 'VAT rates by category', 'The VAT charged on each product category.']].map(([href, title, text]) => (
                <li key={href}><Link href={href} className="as-link"><span><b>{title}</b><small>{text}</small></span><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></Link></li>
              ))}
            </ul>
            <div className="as-body ac-sec">
              <div className="as-row as-danger" style={{ borderTop: 0 }}>
                <span><b>Reset demo money data</b><small>Removes every payment, payout, added account and setting made in this browser. The demo month comes back.</small></span>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--danger" onClick={resetMoney}><Icon name="rotate-ccw" width="16" height="16" aria-hidden="true" />Reset</button>
              </div>
            </div>
          </>) : null}
        </div>
      </section>

      {wizard ? <GatewaySetup partner={wizard.partner} onClose={() => setWizard(null)} /> : null}
      {sheet ? <AccountSheet key={sheet} id={sheet} onClose={() => { setSheet(''); try { const u = new URL(window.location.href); if (u.searchParams.has('account')) { u.searchParams.delete('account'); window.history.replaceState(window.history.state, '', u.pathname + u.search); } } catch { /* ignore */ } }} /> : null}

      {/* add a bank, wallet or cash account */}
      <Dialog open={!!acc} title="Add account" onClose={() => setAcc(null)} width={520}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setAcc(null)}>Cancel</button><button type="submit" form="as-acc-form" className="gc-btn gc-btn--solid">Add account</button></>}>
        {acc ? (
          <form id="as-acc-form" className="ac-form" onSubmit={saveAccount}>
            <div className="ac-seg" role="group" aria-label="Type of account">
              {[['Bank', 'Bank'], ['Mobile', 'Mobile wallet'], ['Cash', 'Cash']].map(([t, l]) => (
                <button key={t} type="button" aria-pressed={acc.type === t} onClick={() => setAcc({ ...acc, type: t, brand: BRAND_FOR_TYPE[t] })}>{l}</button>
              ))}
            </div>
            <div><label className="gc-label" htmlFor="as-acc-name">Name *</label><input id="as-acc-name" className="gc-input" aria-required="true" data-autofocus placeholder={acc.type === 'Bank' ? 'For example: BRAC Bank savings' : acc.type === 'Mobile' ? 'For example: bKash personal · 01711-000000' : 'For example: Branch cash box'} value={acc.name} onChange={(e) => setAcc({ ...acc, name: e.target.value })} /></div>
            <div className="ac-two">
              <div>
                <label className="gc-label" htmlFor="as-acc-brand">Logo</label>
                <div className="ac-logo-line">
                  <BrandLogo brand={acc.brand || acc.name || acc.type} size={44} decorative />
                  <select id="as-acc-brand" className="gc-input gc-select" value={acc.brand} onChange={(e) => setAcc({ ...acc, brand: e.target.value })}>
                    {BRAND_OPTIONS.map(([v, l]) => <option key={v || 'none'} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="gc-label" htmlFor="as-acc-open">Opening balance (৳)</label><input id="as-acc-open" className="gc-input ac-fig" inputMode="decimal" placeholder="0" value={acc.opening} onChange={(e) => setAcc({ ...acc, opening: clean(e.target.value) })} aria-describedby="as-acc-help" /></div>
            </div>
            <p id="as-acc-help" className="gc-help" style={{ margin: 0 }}>What is in the account today. From now on payments in and out change it.</p>
          </form>
        ) : null}
      </Dialog>

      {/* add or rename a category (archive / restore it from here too) */}
      <Dialog open={!!catForm} title={catForm ? (catForm.mode === 'add' ? (catForm.kind === 'expense' ? 'Add expense category' : 'Add income category') : 'Rename category') : 'Category'} onClose={() => setCatForm(null)} width={480}
        footer={<>
          {catForm && catForm.mode === 'rename' ? <button type="button" className="gc-btn gc-btn--flat" style={{ marginRight: 'auto' }} onClick={() => { const c = (cats[catForm.kind] || []).find((x) => x.id === catForm.id); if (c) toggleArchive(catForm.kind, c); setCatForm(null); }}>{catForm.archived ? 'Restore' : 'Archive'}</button> : null}
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setCatForm(null)}>Cancel</button>
          <button type="submit" form="as-cat-form" className="gc-btn gc-btn--solid">{catForm && catForm.mode === 'rename' ? 'Save name' : 'Add category'}</button>
        </>}>
        {catForm ? (
          <form id="as-cat-form" className="ac-form" onSubmit={saveCat}>
            <div><label className="gc-label" htmlFor="as-cat-name">Name *</label><input id="as-cat-name" className="gc-input" aria-required="true" data-autofocus placeholder={catForm.kind === 'expense' ? 'For example: Cleaning' : 'For example: Display rent from brands'} value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} /></div>
            {catForm.mode === 'add' && catForm.kind === 'expense' ? (
              <div>
                <label className="gc-label" htmlFor="as-cat-home">Belongs to</label>
                <select id="as-cat-home" className="gc-input gc-select" value={catForm.home} onChange={(e) => setCatForm({ ...catForm, home: e.target.value })} aria-describedby="as-cat-home-help">
                  {COST_HOMES.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
                <p id="as-cat-home-help" className="gc-help" style={{ margin: 'var(--space-2) 0 0' }}>Pick a channel when only that channel causes the cost (packaging for online orders). Pick Shared for costs of the whole shop.</p>
              </div>
            ) : null}
            {catForm.mode === 'add' && catForm.kind === 'income' ? (
              <div><label className="gc-label" htmlFor="as-cat-help">What it is for</label><input id="as-cat-help" className="gc-input" placeholder="Optional, shown when you record income" value={catForm.help} onChange={(e) => setCatForm({ ...catForm, help: e.target.value })} /></div>
            ) : null}
            {catForm.mode === 'rename' ? <p className="gc-help" style={{ margin: 0 }}>Money already recorded keeps the old name; new entries use the new one.</p> : null}
          </form>
        ) : null}
      </Dialog>
    </AccPage>
  );
}

/** One kind of categories: a row each with its money this month, the channel it belongs to (expenses), and a
 *  click on the name to rename, archive or restore it. */
function CategoryList({ kind, title, help, when, list, ready, onAdd, onRename, onHome }) {
  const live = list.filter((c) => !c.archived).length;
  const archived = list.length - live;
  return (
    <section className={kind === 'income' ? 'ac-sec' : undefined} aria-labelledby={'as-cat-' + kind}>
      <header className="ix-card__head">
        <h2 id={'as-cat-' + kind}>{title} <InfoTip text={help} /></h2>
        <button type="button" className="ix-btn ix-btn--sm" onClick={onAdd}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add category</button>
      </header>
      <div className="as-body"><p className="as-note">{ready ? `${live} in use${archived ? ` · ${archived} archived` : ''}` : ''}</p></div>
      {!ready ? null : (
        <ul className="as-cats">
          {list.map((c) => (
            <li key={c.id} className={'as-cat' + (c.archived ? ' is-archived' : '')}>
              <button type="button" className="as-cat__name" onClick={() => onRename(c)} aria-label={`Rename ${c.name}`}>
                <b>{c.name}{c.archived ? <StatusBadge tone="neutral" icon="archive">Archived</StatusBadge> : null}{c.builtIn ? null : <StatusBadge tone="primary" icon="pencil">Added by you</StatusBadge>}</b>
                {kind === 'income' && c.help ? <small>{c.help}</small> : null}
                <small>{c.sum ? <><span className="as-fig">{money(c.sum)}</span> {kind === 'income' ? 'came in' : 'spent'} {when}</> : `Nothing ${when}`}</small>
              </button>
              {kind === 'expense' ? (
                <select className="ix-pick" aria-label={`${c.name} belongs to`} value={c.home || 'Shared'} disabled={c.archived} onChange={(e) => onHome(c, e.target.value)} title="Belongs to">
                  {COST_HOMES.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
