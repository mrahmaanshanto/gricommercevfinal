'use client';
// AccountSetup — the settings behind Accounts, in plain words for a shop owner:
//   Payment partners  each gateway's fee, each courier's COD % and delivery charge per zone, when
//                     they pay out, into which account, and the days they don't pay
//   Categories        expense categories (each belongs to a sales channel or is shared by the whole
//                     shop, which Sales & profit uses for profit by channel) and income categories;
//                     add, rename, archive / restore, with this month's money in each
//   Banks & wallets   the shop's own cash, bank and mobile wallet accounts (add one here), and the
//                     money partners are holding (read-only, handled in Settlements)
//   Holidays          public holidays payouts skip (add, remove, restore the defaults)
//   Evening check     when the app asks whether today's payouts arrived, and browser notifications
//   Advanced          chart of accounts, journals, VAT, and resetting the demo money data
// ?tab=partners|categories|accounts|holidays|check|advanced opens a tab.
// Front end only: settings are kept in this browser (settlements.js getConfig/saveConfig, ledger.js addAccount,
// categories.js for the categories).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Dialog, EmptyState } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';
import { GatewaySetup } from '@/components/GatewaySetup';
import { OWN_ACCOUNTS, HOLDING_ACCOUNTS, balanceOf, getEntries, addAccount } from '@/lib/ledger';
import { PARTNERS, DEFAULT_CONFIG, getConfig, saveConfig, getPartners, getAllPartners, ruleText, feeText, weekendText, holidaysOf, HOLIDAYS_2026, WEEKDAYS, DEFAULT_WEEKEND, COURIER_RATES, heldBy, clockNow, dayKey, fromKey } from '@/lib/settlements';
import { getCategories, addCategory, editCategory, archiveCategory, COST_HOMES, DEFAULT_EXPENSE, DEFAULT_INCOME } from '@/lib/categories';
import { AccPage, AccountSelect, useBooks, money, shortDate, accName, accBrand } from './accShared';

const TABS = [['partners', 'Payment partners'], ['categories', 'Categories'], ['accounts', 'Banks & wallets'], ['holidays', 'Holidays'], ['check', 'Evening check'], ['advanced', 'Advanced']];
const ZONES = Object.keys(COURIER_RATES);
const HOURS = [17, 18, 19, 20, 21, 22, 23];
const hourText = (h) => `${h > 12 ? h - 12 : h} PM`;
const GRACE = [[0, 'Late the day after it was due'], [1, 'After 1 working day'], [2, 'After 2 working days'], [3, 'After 3 working days']];
const graceText = (g) => (g ? `late after ${g} working day${g === 1 ? '' : 's'}` : 'late the next day');
const GROUPS = [['Cash', 'Cash'], ['Bank', 'Banks'], ['Mobile', 'Mobile wallets']];
const BRAND_OPTIONS = [['', 'No logo'], ['bracbank', 'BRAC Bank'], ['citybank', 'City Bank'], ['dbbl', 'Dutch-Bangla Bank'], ['bkash', 'bKash'], ['nagad', 'Nagad'], ['rocket', 'Rocket'], ['cash', 'Cash'], ['safe', 'Safe']];
const BRAND_FOR_TYPE = { Bank: 'bracbank', Mobile: 'bkash', Cash: 'cash' };
const MONEY_KEYS = ['gc.ledger', 'gc.settle.items', 'gc.settle.payouts', 'gc.settle.config', 'gc.ledger.accounts'];
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
.as-bar{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:var(--space-3);padding:0 var(--space-4);border-bottom:1px solid var(--border-subtle)}
.as-body{display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-4) var(--space-5) var(--space-5)}
.as-body > .ac-head{padding:0}
.as-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.as-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
.as-pcard{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);min-width:0}
.as-pcard.is-changed{border-color:var(--primary)}
.as-ptop{display:flex;align-items:center;gap:var(--space-3);min-width:0}
.as-ptop > span{flex:1;min-width:0}
.as-ptop b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.as-ptop small{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.as-pcard dl{display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px var(--space-3);margin:0;font-size:var(--text-xs)}
.as-pcard dt{color:var(--text-muted)}
.as-pcard dd{margin:0;display:flex;align-items:center;justify-content:flex-end;gap:6px;text-align:right;color:var(--text-heading);font-weight:var(--weight-medium);min-width:0}
.as-pnote{margin:0;font-size:var(--text-xs);color:var(--text-muted);line-height:1.5}
.as-pfoot{display:flex;justify-content:flex-end;gap:var(--space-2);margin-top:auto}
.as-group th{background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.as-group .ac-num{font-family:var(--font-data)}
.as-days{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.as-day{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer;background:var(--surface-card)}
.as-day input{margin:0;accent-color:var(--primary)}
.as-day.is-on{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.as-fieldset{border:0;margin:0;padding:0;min-width:0}
.as-fieldset legend{padding:0;margin-bottom:var(--space-2)}
.as-inline{display:flex;align-items:center;gap:var(--space-2);margin-top:var(--space-2)}
.as-inline .gc-input{max-width:96px}
.as-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
.as-add{display:grid;grid-template-columns:minmax(0,180px) minmax(0,1fr) auto;gap:var(--space-3);align-items:end}
.as-past td{color:var(--text-muted)}
.as-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl)}
.as-row b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.as-row small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.as-link{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-4);text-decoration:none;color:inherit;border-radius:var(--radius-xl);min-width:0}
.as-link:hover,.as-link:focus-visible{border-color:var(--primary)}
.as-link > span:nth-child(2){flex:1;min-width:0}
.as-link b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.as-link small{display:block;margin-top:2px;font-size:var(--text-xs);color:var(--text-muted);line-height:1.5}
.as-ico{display:grid;place-items:center;width:40px;height:40px;flex:none;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.as-danger{border:1px solid var(--fill-error-soft)}
.as-danger .as-ico{background:var(--fill-error-soft);color:var(--text-danger)}
.as-catgrid{align-items:start}
.as-catcard{border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);min-width:0;overflow:hidden}
.as-catcard > .ac-head{border-bottom:1px solid var(--border-subtle)}
.as-cats{list-style:none;margin:0;padding:0}
.as-cat{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);padding:var(--space-3) var(--space-5);border-top:1px solid var(--border-subtle)}
.as-cat:first-child{border-top:0}
.as-cat .as-ico{width:36px;height:36px}
.as-cat__name{flex:1 1 150px;min-width:0}
.as-cat__name b{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.as-cat__name small{display:block;margin-top:2px;font-size:var(--text-xs);color:var(--text-muted);line-height:1.5}
.as-cat__tools{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:var(--space-2);margin-left:auto}
.as-cat__tools .gc-select{width:auto;min-width:132px}
.as-cat.is-archived .as-cat__name b{color:var(--text-muted)}
.as-cat.is-archived .as-ico{background:var(--surface-subtle);color:var(--text-muted)}
.as-inlink{color:inherit;font-weight:var(--weight-semibold);text-decoration:underline}
@media (max-width:900px){.as-grid3{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.as-three{grid-template-columns:1fr}.as-add{grid-template-columns:1fr}.as-inline .gc-input{max-width:none}}
`;

function WeekdayPicks({ name, value, onChange, legend, help }) {
  const toggle = (d) => onChange(value.includes(d) ? value.filter((x) => x !== d) : [...value, d].sort((a, b) => a - b));
  return (
    <fieldset className="as-fieldset">
      <legend className="gc-label">{legend}</legend>
      <div className="as-days">
        {WEEKDAYS.map((w, d) => (
          <label key={w} className={'as-day' + (value.includes(d) ? ' is-on' : '')}>
            <input type="checkbox" name={name} checked={value.includes(d)} onChange={() => toggle(d)} />{w.slice(0, 3)}
          </label>
        ))}
      </div>
      {help ? <p className="gc-help" style={{ margin: 'var(--space-2) 0 0' }}>{help}</p> : null}
    </fieldset>
  );
}

export default function AccountSetup() {
  const tick = useBooks();
  const [tab, setTab] = useState('partners');
  const [edit, setEdit] = useState(null);      // partner form
  const [wizard, setWizard] = useState(null);  // gateway setup: { partner } or { add: true }
  const [acc, setAcc] = useState(null);        // new account form
  const [hol, setHol] = useState({ date: '', name: '' });
  const [perm, setPerm] = useState('');
  const [catForm, setCatForm] = useState(null);   // add / rename a category: { mode, kind, id, name, home, help }

  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get('tab');
    if (TABS.some((x) => x[0] === want)) setTab(want);
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
      partners: getAllPartners(cfg),
      own: own.map((a) => ({ ...a, balance: balanceOf(a.id, entries) })),
      holding: tick ? HOLDING_ACCOUNTS().map((a) => ({ ...a, held: heldBy(a.partner) })) : [],
      nextHoliday: tick ? holidays.find(([k]) => k >= today) : null,
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
  const ownTotal = data.own.reduce((a, x) => a + x.balance, 0);
  const holidaysChanged = (cfg.holidaysAdded || []).length + (cfg.holidaysRemoved || []).length > 0;

  // ---- payment partners ------------------------------------------------------------------------
  const openPartner = (p) => {
    const r = p.rule || {};
    setEdit({
      p, fee: String(p.fee ?? ''), cod: String(p.cod ?? ''), codDhaka: String(p.codDhaka ?? ''),
      rates: Object.fromEntries(ZONES.map((z) => [z, String({ ...COURIER_RATES, ...(p.rates || {}) }[z])])),
      ruleType: r.type || 'auto', days: String(r.type === 'auto' ? r.days || 1 : 1),
      payDays: r.type === 'weekday' ? [...(r.days || [])] : [0],
      to: p.to, weekend: [...(p.weekend || DEFAULT_WEEKEND)],
    });
  };
  const savePartner = (e) => {
    e.preventDefault();
    const { p } = edit;
    const pct = (v, label) => { const n = num(v); if (v === '' || Number.isNaN(n) || n < 0 || n > 100) { toast(`${label}: enter a % from 0 to 100`, { tone: 'error' }); return null; } return n; };
    const over = {};
    if (p.kind === 'Courier') {
      const cod = pct(edit.cod, 'COD outside Dhaka'); if (cod === null) return;
      const codDhaka = pct(edit.codDhaka, 'COD inside Dhaka'); if (codDhaka === null) return;
      const rates = {};
      for (const z of ZONES) { const n = num(edit.rates[z]); if (edit.rates[z] === '' || Number.isNaN(n) || n < 0) { toast(`Enter the delivery charge for ${z}`, { tone: 'error' }); return; } rates[z] = n; }
      Object.assign(over, { cod, codDhaka, rates });
    } else {
      const fee = pct(edit.fee, 'Fee'); if (fee === null) return;
      over.fee = fee;
    }
    if (edit.weekend.length > 6) { toast('Leave at least one day they pay', { tone: 'error' }); return; }
    let rule;
    if (edit.ruleType === 'auto') {
      const d = Math.round(num(edit.days));
      if (!(d >= 1 && d <= 7)) { toast('Working days: enter 1 to 7', { tone: 'error' }); return; }
      rule = { type: 'auto', days: d };
    } else if (edit.ruleType === 'weekday') {
      if (!edit.payDays.length) { toast('Pick at least one weekday they pay', { tone: 'error' }); return; }
      if (edit.payDays.every((d) => edit.weekend.includes(d))) { toast('The days they pay are all days they don’t pay. Change one of them.', { tone: 'error' }); return; }
      rule = { type: 'weekday', days: edit.payDays };
    } else rule = { type: 'withdraw' };
    const fresh = getConfig();
    saveConfig({ ...fresh, partners: { ...fresh.partners, [p.id]: { ...over, rule, to: edit.to, weekend: edit.weekend } } });
    toast(`${p.short} saved · expected payouts now use the new rule`);
    setEdit(null);
  };
  const resetPartner = (p) => {
    const fresh = getConfig();
    const prev = fresh.partners[p.id];
    const { [p.id]: _drop, ...rest } = fresh.partners;
    saveConfig({ ...fresh, partners: rest });
    setEdit(null);
    toast(`${p.short} is back to the default rate and rule`, { undo: () => { const c = getConfig(); saveConfig({ ...c, partners: { ...c.partners, [p.id]: prev } }); } });
  };

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
  const openRename = (kind, c) => setCatForm({ mode: 'rename', kind, id: c.id, name: c.name, home: c.home || 'Shared', help: c.help || '' });
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
  const PERM = { granted: ['Allowed', 'success'], denied: ['Blocked', 'error'], default: ['Not asked yet', 'slate'], unsupported: ['Not supported', 'slate'], '': ['Checking…', 'slate'] };
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

  const ep = edit && edit.p;
  return (
    <AccPage screen="AccountSetup" active="acc-setup" page="Setup" title="Accounts setup" css={CSS}
      description="Payment partners, expense and income categories, your banks and wallets, holidays and the evening payout check.">
      <div className="gc-kpis gc-kpis--tight">
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="handshake" width="22" height="22" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Payment partners</p><p className="gc-kpi__value">{data.partners.length}<small>{changed.length ? `${changed.length} changed by you` : 'default rates'}</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-success-soft)', color: 'var(--text-success)' }}><Icon name="landmark" width="22" height="22" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Banks & wallets</p><p className="gc-kpi__value">{data.own.length}<small>{tick ? money(ownTotal) + ' in total' : ''}</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-warning-soft)', color: 'var(--text-warning)' }}><Icon name="calendar-off" width="22" height="22" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Next holiday</p><p className="gc-kpi__value">{data.nextHoliday ? shortDate(fromKey(data.nextHoliday[0])) : '—'}<small>{data.nextHoliday ? data.nextHoliday[1] : 'None left this year'}</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-info-soft)', color: 'var(--text-info)' }}><Icon name="bell-ring" width="22" height="22" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Evening check</p><p className="gc-kpi__value">{hourText(hour)}<small>{graceText(cfg.grace ?? 1)}</small></p></div></div>
      </div>

      <section className="gc-card ac-card">
        <div className="as-bar">
          <div className="gc-tabs" role="tablist" aria-label="Accounts setup" style={{ borderBottom: 0, flexWrap: 'wrap' }}>
            {TABS.map(([id, label]) => <button key={id} type="button" role="tab" id={'as-tab-' + id} aria-controls="as-panel" aria-selected={tab === id} className={'gc-tab' + (tab === id ? ' gc-tab--active' : '')} onClick={() => pickTab(id)}>{label}</button>)}
          </div>
        </div>

        <div id="as-panel" role="tabpanel" aria-labelledby={'as-tab-' + tab}>
          {tab === 'partners' ? (
            <div className="as-body">
              <div className="ac-head"><div><h2>Payment partners</h2><p>Gateways, the card machine and couriers: how their money reaches you, how it is settled, and their keys.</p></div><button type="button" className="gc-btn gc-btn--solid" onClick={() => setWizard({ add: true })}><Icon name="plus" width="18" height="18" aria-hidden="true" /> Add gateway or courier</button></div>
              <div className="ac-note ac-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>These are common rates in Bangladesh. Check them against your own agreement.</span></div>
              <div className="as-grid gc-cols-2">
                {data.partners.map((p) => {
                  const own = changed.includes(p.id);
                  return (
                    <article key={p.id} className={'as-pcard' + (own ? ' is-changed' : '')}>
                      <div className="as-ptop">
                        <BrandLogo brand={p.brand} size={40} />
                        <span><b>{p.name}</b><small><span className={'gc-badge gc-badge--' + (p.kind === 'Courier' ? 'info' : 'primary')}>{p.kind}</span>{own ? <span className="gc-badge gc-badge--slate">Changed by you</span> : null}</small></span>
                      </div>
                      <dl>
                        <dt>Fee</dt><dd>{feeText(p)}</dd>
                        <dt>Pays out</dt><dd>{ruleText(p)}</dd>
                        <dt>Money</dt><dd>{p.mode === 'direct' ? 'Straight into your account' : 'Settled later'}</dd>
                        {p.mode === 'direct' ? null : <><dt>Pays into</dt><dd><BrandLogo brand={accBrand(p.to) || accName(p.to)} size={20} decorative /><span>{accName(p.to)}</span></dd>
                        <dt>Doesn’t pay on</dt><dd>{p.weekend && p.weekend.length ? weekendText(p.weekend) : 'Pays every day'}</dd></>}
                        {p.kind === 'Courier' ? <><dt>Delivery charge</dt><dd className="ac-fig">{ZONES.map((z) => money({ ...COURIER_RATES, ...(p.rates || {}) }[z])).join(' · ')}</dd></> : null}
                      </dl>
                      {p.note ? <p className="as-pnote">{p.note}</p> : null}
                      <div className="as-pfoot"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setWizard({ partner: p })} aria-label={`Set up ${p.name}`}><Icon name="settings-2" width="16" height="16" aria-hidden="true" /> Set up</button></div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}

          {tab === 'categories' ? (
            <div className="as-body">
              <div className="ac-note ac-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>Each expense category belongs to a sales channel or is shared by the whole shop. Sales & profit uses this to work out each channel’s profit. <Link href="/sales-profit" className="as-inlink">Open Sales & profit</Link></span></div>
              <div className="as-grid gc-cols-2 as-catgrid">
                <CategoryCard kind="expense" title="Expense categories" when={cats.when} list={cats.expense} ready={!!tick}
                  help="What money is spent on, and which channel carries the cost."
                  onAdd={() => openAddCat('expense')} onRename={(c) => openRename('expense', c)} onArchive={(c) => toggleArchive('expense', c)} onHome={setHome} />
                <CategoryCard kind="income" title="Income categories" when={cats.when} list={cats.income} ready={!!tick}
                  help="Money that comes in and is not a sale."
                  onAdd={() => openAddCat('income')} onRename={(c) => openRename('income', c)} onArchive={(c) => toggleArchive('income', c)} />
              </div>
              <p className="gc-help" style={{ margin: 0 }}>Archived categories are hidden when you record money; entries already filed under them keep their name. Built-in categories can be archived but not deleted.</p>
            </div>
          ) : null}

          {tab === 'accounts' ? (
            <div className="as-body">
              <div className="ac-head">
                <div><h2>Your banks and wallets</h2><p>Where the shop’s own money sits. Balances are the opening balance plus every payment in and out.</p></div>
                <button type="button" className="gc-btn gc-btn--solid" onClick={() => setAcc({ type: 'Bank', name: '', brand: BRAND_FOR_TYPE.Bank, opening: '' })}><Icon name="plus" width="18" height="18" aria-hidden="true" /> Add account</button>
              </div>
              {!tick ? null : (
                <div className="gc-table-wrap">
                  <table className="gc-table gc-table--compact gc-table--hoverable">
                    <thead><tr><th scope="col">Account</th><th scope="col" className="ac-num">Opening balance</th><th scope="col" className="ac-num">Balance now</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                    {GROUPS.map(([type, label]) => {
                      const list = data.own.filter((a) => a.type === type);
                      if (!list.length) return null;
                      return (
                        <tbody key={type}>
                          <tr className="as-group"><th scope="colgroup" colSpan={2}>{label} · {list.length}</th><td className="ac-num">{money(list.reduce((s, a) => s + a.balance, 0))}</td><td /></tr>
                          {list.map((a) => (
                            <tr key={a.id}>
                              <td><span className="ac-who"><BrandLogo brand={logoOf(a)} size={32} /><span><span className="ac-strong">{accName(a.id)}</span><span className="ac-sub">{a.custom ? 'Added by you' : type === 'Mobile' ? 'Mobile wallet' : type}</span></span></span></td>
                              <td className="ac-num ac-fig">{money(a.opening)}</td>
                              <td className={'ac-num ac-fig ac-strong' + (a.balance < 0 ? ' ac-out' : '')}>{a.balance < 0 ? '−' : ''}{money(a.balance)}</td>
                              <td><div className="ac-row-actions"><Link href={`/money?account=${encodeURIComponent(a.id)}`} className="gc-btn gc-btn--xs gc-btn--neutral" aria-label={`Open ${accName(a.id)} in Money`}>Open</Link></div></td>
                            </tr>
                          ))}
                        </tbody>
                      );
                    })}
                  </table>
                </div>
              )}

              <div className="ac-head" style={{ marginTop: 'var(--space-2)' }}>
                <div><h2>Held by partners</h2><p>Money gateways and couriers collected for you and have not paid out yet. It changes by itself as payouts arrive.</p></div>
                <Link href="/settlements" className="gc-btn gc-btn--neutral"><Icon name="arrow-up-right" width="18" height="18" aria-hidden="true" /> Settlements</Link>
              </div>
              {!tick ? null : (
                <div className="gc-table-wrap">
                  <table className="gc-table gc-table--compact gc-table--hoverable">
                    <thead><tr><th scope="col">Partner</th><th scope="col" className="ac-num">Holding now</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                    <tbody>
                      {data.holding.map((a) => (
                        <tr key={a.id}>
                          <td><span className="ac-who"><BrandLogo brand={a.brand} size={32} /><span><span className="ac-strong">{a.name.replace(/ \(.*\)$/, '')}</span><span className="ac-sub">{/withdraw/i.test(a.name) ? 'Withdraw it yourself' : 'Paid out by the partner'}</span></span></span></td>
                          <td className="ac-num ac-fig ac-strong">{money(a.held)}</td>
                          <td><div className="ac-row-actions"><Link href="/settlements" className="gc-btn gc-btn--xs gc-btn--neutral" aria-label={`See ${a.name} in Settlements`}>See payouts</Link></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}

          {tab === 'holidays' ? (
            <div className="as-body">
              <div className="ac-head">
                <div><h2>Public holidays</h2><p>Payouts skip each partner’s days off and these holidays; the expected date moves to the next working day.</p></div>
                <button type="button" className="gc-btn gc-btn--neutral" onClick={restoreHolidays} disabled={!holidaysChanged}><Icon name="rotate-ccw" width="18" height="18" aria-hidden="true" /> Restore defaults</button>
              </div>
              <form className="as-add" onSubmit={addHoliday}>
                <div><label className="gc-label" htmlFor="as-hol-date">Date</label><input id="as-hol-date" type="date" className="gc-input" value={hol.date} onChange={(e) => setHol({ ...hol, date: e.target.value })} /></div>
                <div><label className="gc-label" htmlFor="as-hol-name">Holiday</label><input id="as-hol-name" className="gc-input" placeholder="For example: Shab-e-Barat" value={hol.name} onChange={(e) => setHol({ ...hol, name: e.target.value })} /></div>
                <button type="submit" className="gc-btn gc-btn--soft"><Icon name="calendar-plus" width="18" height="18" aria-hidden="true" /> Add holiday</button>
              </form>
              {data.holidays.length === 0 ? <EmptyState icon="calendar-off" title="No holidays" body="Payouts only skip each partner’s days off." actionLabel="Restore defaults" onAction={restoreHolidays} /> : (
                <div className="gc-table-wrap">
                  <table className="gc-table gc-table--compact gc-table--hoverable">
                    <thead><tr><th scope="col">Date</th><th scope="col">Holiday</th><th scope="col">From</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                    <tbody>
                      {data.holidays.map(([k, name]) => {
                        const past = !!data.today && k < data.today;
                        const added = (cfg.holidaysAdded || []).some(([x]) => x === k);
                        return (
                          <tr key={k} className={past ? 'as-past' : undefined}>
                            <td className="ac-fig">{shortDate(fromKey(k))}{k.slice(0, 4) !== '2026' ? ` ${k.slice(0, 4)}` : ''}{past ? <span className="ac-sub">Passed</span> : null}</td>
                            <td className={past ? undefined : 'ac-strong'}>{name}</td>
                            <td><span className={'gc-badge gc-badge--' + (added ? 'primary' : 'slate')}>{added ? 'Added by you' : 'Default'}</span></td>
                            <td><div className="ac-row-actions"><button type="button" className="gc-iconbtn" aria-label={`Remove ${name}`} title="Remove" onClick={() => removeHoliday([k, name])}><Icon name="trash-2" width="18" height="18" aria-hidden="true" /></button></div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="gc-help" style={{ margin: 0 }}>Moon-based dates (Eid, Ashura, Eid-e-Miladunnabi) can move a day or two. Correct them here when they are announced.</p>
            </div>
          ) : null}

          {tab === 'check' ? (
            <div className="as-body">
              <div className="ac-head">
                <div><h2>Evening payout check</h2><p>Every evening the app asks whether the payouts expected that day arrived. Next check: {nextCheck}.</p></div>
                <button type="button" className="gc-btn gc-btn--solid" onClick={() => window.dispatchEvent(new CustomEvent('gc:check'))}><Icon name="list-checks" width="18" height="18" aria-hidden="true" /> Try it now</button>
              </div>
              <div className="ac-two">
                <div>
                  <label className="gc-label" htmlFor="as-hour">Ask me at</label>
                  <select id="as-hour" className="gc-input gc-select" value={hour} onChange={(e) => { const h = Number(e.target.value); setCheck({ promptHour: h }, `Evening check set to ${hourText(h)}`); }}>
                    {HOURS.map((h) => <option key={h} value={h}>{hourText(h)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="gc-label" htmlFor="as-grace">Mark a payout late</label>
                  <select id="as-grace" className="gc-input gc-select" value={cfg.grace ?? 1} onChange={(e) => { const g = Number(e.target.value); setCheck({ grace: g }, `Payouts are now ${graceText(g)}`); }} aria-describedby="as-grace-help">
                    {GRACE.map(([g, l]) => <option key={g} value={g}>{l}</option>)}
                  </select>
                  <p id="as-grace-help" className="gc-help" style={{ margin: 'var(--space-2) 0 0' }}>How long to wait after the expected day before a payout shows as late.</p>
                </div>
              </div>
              <div className="as-row">
                <span className="ac-who">
                  <span className="as-ico"><Icon name="bell" width="20" height="20" aria-hidden="true" /></span>
                  <span><b>Browser notification</b><small>A note on screen at check time, even when another tab is open.</small></span>
                </span>
                <span className="ac-row-actions" style={{ alignItems: 'center' }}>
                  <span className={'gc-badge gc-badge--' + PERM[perm][1]}>{PERM[perm][0]}</span>
                  {perm !== 'granted' && perm !== 'unsupported' ? <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={allowNotes}>Allow notifications</button> : null}
                </span>
              </div>
              <div className="ac-note ac-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>The check runs while the app is open. If it was closed at that time, you are asked the next time you open it.</span></div>
            </div>
          ) : null}

          {tab === 'advanced' ? (
            <div className="as-body">
              <div className="ac-head"><div><h2>For your accountant</h2><p>The books behind the simple pages. You don’t need these to run the shop.</p></div></div>
              <div className="as-grid3 gc-cols-3">
                {[['/chart-of-accounts', 'book-open-text', 'Chart of accounts', 'Every account the books use, grouped as assets, liabilities, income and costs.'],
                  ['/journals', 'notebook-pen', 'Journals', 'Manual journal entries for corrections and year-end adjustments.'],
                  ['/vat', 'percent', 'VAT rates by category', 'The VAT charged on each product category.']].map(([href, icon, title, text]) => (
                  <Link key={href} href={href} className="gc-card as-link">
                    <span className="as-ico"><Icon name={icon} width="20" height="20" aria-hidden="true" /></span>
                    <span><b>{title}</b><small>{text}</small></span>
                    <Icon name="chevron-right" width="18" height="18" aria-hidden="true" style={{ color: 'var(--text-muted)', flex: 'none' }} />
                  </Link>
                ))}
              </div>
              <div className="as-row as-danger">
                <span className="ac-who">
                  <span className="as-ico"><Icon name="database-zap" width="20" height="20" aria-hidden="true" /></span>
                  <span><b>Reset demo money data</b><small>Removes every payment, payout, added account and setting made in this browser. The demo month comes back.</small></span>
                </span>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--error gc-btn--outlined" onClick={resetMoney}><Icon name="rotate-ccw" width="16" height="16" aria-hidden="true" /> Reset</button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* edit a payment partner */}
      {wizard ? <GatewaySetup partner={wizard.partner} onClose={() => setWizard(null)} /> : null}
      <Dialog open={!!edit} title={ep ? `Edit ${ep.short}` : 'Edit partner'} onClose={() => setEdit(null)} width={640}
        footer={ep ? <>
          {changed.includes(ep.id) ? <button type="button" className="gc-btn gc-btn--flat" style={{ marginRight: 'auto' }} onClick={() => resetPartner(ep)}><Icon name="undo-2" width="18" height="18" aria-hidden="true" /> Reset to default</button> : null}
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit(null)}>Cancel</button>
          <button type="submit" form="as-partner-form" className="gc-btn gc-btn--solid">Save</button>
        </> : null}>
        {ep ? (
          <form id="as-partner-form" className="ac-form" onSubmit={savePartner}>
            <div className="ac-logo-line"><BrandLogo brand={ep.brand} size={44} /><span><b>{ep.name}</b><small>{ep.kind} · now {feeText(ep)} · {ruleText(ep).toLowerCase()}</small></span></div>
            {ep.note ? <div className="ac-note ac-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>{ep.note}</span></div> : null}

            {ep.kind === 'Courier' ? (
              <>
                <div className="ac-two">
                  <div><label className="gc-label" htmlFor="as-cod">COD fee outside Dhaka (%)</label><input id="as-cod" className="gc-input ac-fig" inputMode="decimal" value={edit.cod} onChange={(e) => setEdit({ ...edit, cod: clean(e.target.value) })} data-autofocus /></div>
                  <div><label className="gc-label" htmlFor="as-cod-dhaka">COD fee inside Dhaka (%)</label><input id="as-cod-dhaka" className="gc-input ac-fig" inputMode="decimal" value={edit.codDhaka} onChange={(e) => setEdit({ ...edit, codDhaka: clean(e.target.value) })} /></div>
                </div>
                <fieldset className="as-fieldset">
                  <legend className="gc-label">Delivery charge per parcel (৳)</legend>
                  <div className="as-three">
                    {ZONES.map((z, i) => (
                      <div key={z}><label className="gc-help" style={{ display: 'block', margin: '0 0 4px' }} htmlFor={'as-rate-' + i}>{z}</label><input id={'as-rate-' + i} className="gc-input ac-fig" inputMode="decimal" value={edit.rates[z]} onChange={(e) => setEdit({ ...edit, rates: { ...edit.rates, [z]: clean(e.target.value) } })} /></div>
                    ))}
                  </div>
                </fieldset>
              </>
            ) : (
              <div className="ac-two">
                <div><label className="gc-label" htmlFor="as-fee">Fee per payment (%)</label><input id="as-fee" className="gc-input ac-fig" inputMode="decimal" value={edit.fee} onChange={(e) => setEdit({ ...edit, fee: clean(e.target.value) })} data-autofocus /></div>
              </div>
            )}

            <fieldset className="as-fieldset">
              <legend className="gc-label">When do they pay out?</legend>
              <div className="ac-opts">
                <label className={'ac-opt' + (edit.ruleType === 'auto' ? ' is-on' : '')}>
                  <input type="radio" name="as-rule" checked={edit.ruleType === 'auto'} onChange={() => setEdit({ ...edit, ruleType: 'auto' })} />
                  <span style={{ flex: 1, minWidth: 0 }}><b>Next working day(s)</b><small>Paid by itself a set number of working days after the payment.</small>
                    {edit.ruleType === 'auto' ? <span className="as-inline"><input className="gc-input ac-fig" type="number" min="1" max="7" inputMode="numeric" aria-label="Working days after the payment" value={edit.days} onChange={(e) => setEdit({ ...edit, days: e.target.value })} /><small>working day{edit.days === '1' ? '' : 's'} later</small></span> : null}
                  </span>
                </label>
                <label className={'ac-opt' + (edit.ruleType === 'weekday' ? ' is-on' : '')}>
                  <input type="radio" name="as-rule" checked={edit.ruleType === 'weekday'} onChange={() => setEdit({ ...edit, ruleType: 'weekday' })} />
                  <span style={{ flex: 1, minWidth: 0 }}><b>On set weekdays</b><small>Everything collected so far is paid on these days.</small></span>
                </label>
                {edit.ruleType === 'weekday' ? <WeekdayPicks name="as-paydays" legend="They pay on" value={edit.payDays} onChange={(v) => setEdit({ ...edit, payDays: v })} /> : null}
                <label className={'ac-opt' + (edit.ruleType === 'withdraw' ? ' is-on' : '')}>
                  <input type="radio" name="as-rule" checked={edit.ruleType === 'withdraw'} onChange={() => setEdit({ ...edit, ruleType: 'withdraw' })} />
                  <span><b>Stays until I withdraw</b><small>The money waits in their wallet; you record it when you withdraw.</small></span>
                </label>
              </div>
            </fieldset>

            <AccountSelect id="as-to" label="Pays into" value={edit.to} onChange={(v) => setEdit({ ...edit, to: v })} types={['Bank', 'Mobile']} />
            <WeekdayPicks name="as-weekend" legend="Days they don’t pay" value={edit.weekend} onChange={(v) => setEdit({ ...edit, weekend: v })} help="Most partners don’t pay on Friday and Saturday. Public holidays are skipped too." />
          </form>
        ) : null}
      </Dialog>

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

      {/* add or rename a category */}
      <Dialog open={!!catForm} title={catForm ? (catForm.mode === 'add' ? (catForm.kind === 'expense' ? 'Add expense category' : 'Add income category') : 'Rename category') : 'Category'} onClose={() => setCatForm(null)} width={480}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setCatForm(null)}>Cancel</button><button type="submit" form="as-cat-form" className="gc-btn gc-btn--solid">{catForm && catForm.mode === 'rename' ? 'Save name' : 'Add category'}</button></>}>
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

/** One card of categories: a row each with its icon, money this month and actions. */
function CategoryCard({ kind, title, help, when, list, ready, onAdd, onRename, onArchive, onHome }) {
  const live = list.filter((c) => !c.archived).length;
  const archived = list.length - live;
  const total = list.reduce((a, c) => a + c.sum, 0);
  return (
    <section className="as-catcard" aria-labelledby={'as-cat-' + kind}>
      <div className="ac-head">
        <div><h2 id={'as-cat-' + kind}>{title}</h2><p>{help} {ready ? `${live} in use${archived ? ` · ${archived} archived` : ''} · ${money(total)} ${when}` : ''}</p></div>
        <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={onAdd}><Icon name="plus" width="16" height="16" aria-hidden="true" /> Add category</button>
      </div>
      {!ready ? null : (
        <ul className="as-cats">
          {list.map((c) => (
            <li key={c.id} className={'as-cat' + (c.archived ? ' is-archived' : '')}>
              <span className="as-ico" aria-hidden="true"><Icon name={c.icon || 'tag'} width="18" height="18" /></span>
              <span className="as-cat__name">
                <b>{c.name}{c.archived ? <span className="gc-badge gc-badge--slate">Archived</span> : null}{c.builtIn ? null : <span className="gc-badge gc-badge--primary">Added by you</span>}</b>
                {kind === 'income' && c.help ? <small>{c.help}</small> : null}
                <small>{c.sum ? <><span className="ac-fig">{money(c.sum)}</span> {kind === 'income' ? 'came in' : 'spent'} {when}</> : `Nothing ${when}`}</small>
              </span>
              <span className="as-cat__tools">
                {kind === 'expense' ? (
                  <>
                    <label className="sr-only" htmlFor={'as-home-' + c.id}>{c.name} belongs to</label>
                    <select id={'as-home-' + c.id} className="gc-input gc-select" value={c.home || 'Shared'} disabled={c.archived} onChange={(e) => onHome(c, e.target.value)} title="Belongs to">
                      {COST_HOMES.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </>
                ) : null}
                <button type="button" className="gc-btn gc-btn--xs gc-btn--neutral" onClick={() => onRename(c)} aria-label={`Rename ${c.name}`}>Rename</button>
                <button type="button" className="gc-btn gc-btn--xs gc-btn--neutral" onClick={() => onArchive(c)} aria-label={`${c.archived ? 'Restore' : 'Archive'} ${c.name}`}>{c.archived ? 'Restore' : 'Archive'}</button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
