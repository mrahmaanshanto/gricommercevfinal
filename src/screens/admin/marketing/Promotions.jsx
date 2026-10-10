'use client';
// Promotions (/admin/promotions?view=active|scheduled|paused|ended) — GridCommerce's offers to merchants on their
// subscription: coupon codes (LAUNCH50, ANNUAL20 …) that take a percent or an amount off, give free months or a free
// add-on, for some packages and plans, with limits (uses, per store, dates). Laid out like the merchant panel's Coupons
// (screens/loyalty-promo/Coupons.jsx): title row (Export, New promotion), this month's figures, one card with the
// status views (counts on the tabs), search and the table (tap a code to copy it). A row opens the promotion: what it
// gives, a price check, the stores that used it (/admin/merchant?id=) and its history; Edit, Pause / Resume, End.
// Data: lib/admin/marketing2.js › promoRows, promoState, promoPreview, savePromo, setPromoStatus.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, KV } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { DAY, dm, dmy, daysBetween, startOfMonth, startOfDay } from '@/lib/platform/util';
import { LADDERS, PLAN_NAME, ladderLabel } from '@/lib/platform/catalogue';
import { PROMO_TYPES, BILLINGS, PROMO_ADDONS, PLAN_KEYS, promoRows, promoSummary, promoAppliesTo, promoPreview, savePromo, setPromoStatus } from '@/lib/admin/marketing2';
import { AdminShell } from '../AdminShell';
import { MK_CSS, useMk2, Skeleton, Field, ctl, FormError, ReasonDialog, money, num, plural, copyText, toDateInput, fromInput, dayTime } from './mk2Shared';

const VIEWS = [['active', 'Active'], ['scheduled', 'Scheduled'], ['paused', 'Paused'], ['ended', 'Ended']];
const ABOUT = 'Offers GridCommerce gives merchants on their subscription: a code takes a percent or an amount off, gives free months or a free add-on, for the packages and plans you pick, with limits on uses, per store and dates. Merchants type the code at sign-up or renewal. Pause stops it at once; End closes it for good.';

const CSS = `
.pr-code{display:inline-flex;align-items:center;gap:6px;max-width:100%;padding:0;border:0;background:none;font:inherit;font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading);cursor:pointer}
.pr-code svg{flex:none;color:var(--text-muted)}
.pr-code:hover,.pr-code:hover svg{color:var(--primary)}
.pr-code:focus-visible{outline:2px solid var(--primary);outline-offset:2px;border-radius:var(--radius-sm)}
.pr-sum{display:block;max-width:380px;overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.pr-use{display:flex;flex-direction:column;gap:4px;min-width:96px}
.pr-use .gc-progress{display:block;height:4px}
.pr-tools{display:flex;align-items:center;gap:var(--space-2);padding:8px 12px;border-bottom:1px solid var(--border-subtle)}
.pr-tools .ix-search{flex:1 1 220px;max-width:320px}
.pr-calc{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.pr-calc__out{display:flex;flex-wrap:wrap;align-items:baseline;gap:var(--space-2);font-size:var(--text-sm)}
.pr-calc__out s{color:var(--text-muted)}
.pr-calc__out b{font-family:var(--font-data);font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pr-hist{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none;font-size:var(--text-xs);color:var(--text-muted)}
.pr-hist b{font-weight:var(--weight-medium);color:var(--text-heading)}
.pr-red{display:flex;flex-direction:column}
.pr-red>div{display:flex;align-items:center;gap:var(--space-3);min-height:40px;padding:4px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.pr-red>div:first-child{border-top:0}
.pr-red span{display:flex;flex:1;flex-direction:column;min-width:0}
.pr-red small{font-size:var(--text-xs);color:var(--text-muted)}
`;

const datesText = (p, t) => {
  const a = dm(p.start);
  const b = p.end ? dm(p.end) : 'no end';
  return `${a} – ${b}`;
};
const leftText = (p, t) => {
  if (p.state.key === 'scheduled') { const n = daysBetween(t, p.start); return n <= 1 ? 'Starts tomorrow' : `Starts in ${n} days`; }
  if (p.state.key !== 'active' || !p.end) return p.state.key === 'active' ? 'Always on' : p.state.label;
  const n = daysBetween(t, p.end);
  return n <= 0 ? 'Ends today' : n === 1 ? '1 day left' : `${n} days left`;
};
const usesText = (p) => (p.limits.total ? `${num(p.uses)} of ${num(p.limits.total)}` : `${num(p.uses)} uses`);
const typeLabel = (k) => (PROMO_TYPES.find((x) => x[0] === k) || [k, k])[1];

export default function Promotions() {
  const { data, t, live, db } = useMk2();
  const [view, setView] = useState('active');
  const [s, setS] = useState('');
  const [open, setOpen] = useState(null);     // promo id
  const [form, setForm] = useState(null);     // null | 'new' | promo id
  const [ask, setAsk] = useState(null);       // { id, action }

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (VIEWS.some(([k]) => k === p.get('view'))) setView(p.get('view'));
    if (p.get('id')) setOpen(p.get('id'));
  }, []);
  const pickView = (k) => { setView(k); const p = new URLSearchParams(); if (k !== 'active') p.set('view', k); window.history.replaceState(window.history.state, '', window.location.pathname + (p.toString() ? '?' + p : '')); };

  if (!live) return <AdminShell active="promotions" title="Promotions"><style dangerouslySetInnerHTML={{ __html: MK_CSS + CSS }} /><Skeleton label="Loading promotions" /></AdminShell>;

  const rows = promoRows(data, t);
  const counts = Object.fromEntries(VIEWS.map(([k]) => [k, rows.filter((p) => p.state.key === k).length]));
  const needle = s.trim().toLowerCase();
  const list = rows.filter((p) => p.state.key === view && (!needle || (p.code + ' ' + p.name + ' ' + promoSummary(p)).toLowerCase().includes(needle))).sort((a, b) => b.start - a.start);
  const month = startOfMonth(t);
  const reds = data.redemptions.filter((r) => r.at >= month);
  const tabs = VIEWS.map(([k, label]) => ({ key: k, id: 'pr-tab-' + k, label, count: counts[k], on: view === k, onClick: () => pickView(k) }));
  const exportCsv = () => {
    downloadCsv('gridcommerce-promotions.csv', [
      ['Code', 'Name', 'Type', 'Value', 'Offer', 'Applies to', 'Billing', 'New stores only', 'Limit', 'Per store', 'Start', 'End', 'Status', 'Uses', 'Stores', 'Discount (BDT)', 'Paid by stores (BDT)'],
      ...rows.map((p) => [p.code, p.name, typeLabel(p.type), p.value, promoSummary(p), promoAppliesTo(p), p.billing, p.newOnly ? 'Yes' : 'No', p.limits.total || '', p.limits.perStore, dmy(p.start), p.end ? dmy(p.end) : '', p.state.label, p.uses, p.stores, p.discount, p.revenue]),
    ]);
    toast(plural(rows.length, 'promotion') + ' exported');
  };
  const code = (p) => <button type="button" className="pr-code" onClick={(e) => { e.stopPropagation(); copyText(p.code, `${p.code} copied`); }} aria-label={`Copy code ${p.code}`} title="Copy code">{p.code}<Icon name="copy" width="14" height="14" aria-hidden="true" /></button>;
  const openRow = (id) => setOpen(id);
  const doAsk = (reason) => {
    const r = setPromoStatus(ask.id, ask.action, reason);
    if (!r.ok) return r;
    toast(ask.action === 'pause' ? 'Paused · merchants can’t use the code now' : 'Promotion ended');
    setAsk(null);
    return r;
  };

  return (
    <AdminShell active="promotions" title="Promotions">
      <style dangerouslySetInnerHTML={{ __html: MK_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="ticket-percent" title="Promotions" about={ABOUT}
          secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv }]}
          more={[{ label: 'Affiliates', href: '/admin/affiliates' }]}
          primary={{ label: 'New promotion', icon: 'plus', onClick: () => setForm('new') }} />

        <MetricStrip label="This month" items={[
          { label: 'Codes used this month', value: num(reds.length), sub: plural(new Set(reds.map((r) => r.store)).size, 'store') },
          { label: 'Discount given this month', value: money(reds.reduce((a, r) => a + r.discount, 0)) },
          { label: 'Paid by stores with a code', value: money(reds.reduce((a, r) => a + r.paid, 0)), sub: 'this month' },
          { label: 'Stores that used a code', value: num(new Set(data.redemptions.map((r) => r.store)).size), sub: 'all time', icon: 'store' },
        ]} />

        <section className="ix-card" aria-label="Promotions">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Promotions by status" /></div>
          <div className="pr-tools"><SearchField value={s} onChange={(e) => setS(e.target.value)} placeholder="Search a code or name" /></div>
          {!list.length ? (
            <div className="ix-empty">{needle ? <EmptyState title={`No promotions match “${s.trim()}”.`} actionLabel="Clear search" onAction={() => setS('')} /> : <EmptyState icon="ticket-percent" title={`No ${VIEWS.find(([k]) => k === view)[1].toLowerCase()} promotions.`} actionLabel="New promotion" onAction={() => setForm('new')} />}</div>
          ) : (<>
            <ul className="ix-plist" aria-label="Promotions">
              {list.map((p) => (
                <li key={p.id}><div className="ix-pitem" role="button" tabIndex={0} onClick={() => openRow(p.id)} onKeyDown={(e) => { if (e.key === 'Enter') openRow(p.id); }}>
                  <span className="ix-pitem__top">{code(p)}<StatusBadge tone={p.state.tone}>{p.state.label}</StatusBadge></span>
                  <span className="ix-pitem__mid">{promoSummary(p)}</span>
                  <span className="ix-pitem__mid">{leftText(p, t)} · {usesText(p)} · {money(p.discount)} off</span>
                </div></li>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">Promotions, {VIEWS.find(([k]) => k === view)[1]}</caption>
                <thead><tr><th scope="col">Code</th><th scope="col">Applies to</th><th scope="col">Dates</th><th scope="col">Used</th><th scope="col" className="ix-num">Discount</th><th scope="col" className="ix-num">Paid by stores</th><th scope="col">Status</th></tr></thead>
                <tbody>
                  {list.map((p) => {
                    const pct = p.limits.total ? Math.min(100, Math.round((p.uses / p.limits.total) * 100)) : 0;
                    return (
                      <tr key={p.id} tabIndex={0} onClick={() => openRow(p.id)} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) openRow(p.id); }}>
                        <td>{code(p)}<span className="pr-sum" title={promoSummary(p)}>{promoSummary(p)}</span></td>
                        <td className="ix-muted"><span className="pr-sum" style={{ maxWidth: 200 }} title={promoAppliesTo(p)}>{promoAppliesTo(p)}</span></td>
                        <td style={{ whiteSpace: 'nowrap' }}>{datesText(p, t)}<span className="pr-sum">{leftText(p, t)}</span></td>
                        <td><span className="pr-use"><span className="mk-data">{usesText(p)}</span>{p.limits.total ? <span className="gc-progress" aria-hidden="true"><span className="gc-progress__fill" style={{ display: 'block', width: pct + '%' }} /></span> : null}</span></td>
                        <td className="ix-num mk-fig">{money(p.discount)}</td>
                        <td className="ix-num mk-fig">{money(p.revenue)}</td>
                        <td><StatusBadge tone={p.state.tone}>{p.state.label}</StatusBadge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>)}
          <div className="ix-foot"><span>{plural(list.length, 'promotion')}</span></div>
        </section>
      </div>

      <PromoSheet id={open} rows={rows} db={db} onClose={() => setOpen(null)} onEdit={(id) => { setOpen(null); setForm(id); }} onAsk={(id, action) => { setOpen(null); setAsk({ id, action }); }} />
      {form ? <PromoForm key={form} id={form} data={data} t={t} onClose={(nid) => { setForm(null); if (nid) setOpen(nid); }} /> : null}
      <ReasonDialog open={!!ask} title={ask && ask.action === 'pause' ? 'Pause this promotion?' : 'End this promotion?'}
        body={ask && ask.action === 'pause' ? 'Merchants can’t use the code until you resume it.' : 'It closes for good. Stores that already used it keep their discount.'}
        confirmLabel={ask && ask.action === 'pause' ? 'Pause' : 'End promotion'} danger={ask && ask.action === 'end'} onClose={() => setAsk(null)} onConfirm={doAsk} />
    </AdminShell>
  );
}

// ---- one promotion ----------------------------------------------------------------------------------------------------
function PromoSheet({ id, rows, db, onClose, onEdit, onAsk }) {
  const p = id ? rows.find((x) => x.id === id) : null;
  const [calc, setCalc] = useState({ ladder: 'online', plan: 'business', billing: 'monthly' });
  if (!p) return null;
  const pv = promoPreview(p, calc.ladder, calc.plan, calc.billing);
  const resume = () => { const r = setPromoStatus(p.id, 'resume'); toast(r.ok ? `${p.code} is on again` : r.error, r.ok ? undefined : { tone: 'error' }); };
  const ended = p.status === 'ended';
  return (
    <Sheet open title={p.code} onClose={onClose} footer={<>
      {!ended ? <button type="button" className="gc-btn gc-btn--flat" onClick={() => onAsk(p.id, 'end')}>End</button> : null}
      {p.status === 'paused' ? <button type="button" className="gc-btn gc-btn--neutral" onClick={resume}>Resume</button> : !ended ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => onAsk(p.id, 'pause')}>Pause</button> : null}
      {!ended ? <button type="button" className="gc-btn gc-btn--solid" onClick={() => onEdit(p.id)}>Edit</button> : <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button>}
    </>}>
      <div className="mk-form">
        <span className="mk-row"><StatusBadge tone={p.state.tone}>{p.state.label}</StatusBadge><span className="mk-note">{p.name}</span></span>
        {p.reason && p.status !== 'active' ? <div className="mk-banner mk-banner--warn"><Icon name="info" width="16" height="16" aria-hidden="true" /><p>{p.reason}</p></div> : null}
        <div className="mk-sum">
          <div><span>Used</span><b>{usesText(p)}</b></div>
          <div><span>Discount</span><b>{money(p.discount)}</b></div>
          <div><span>Paid by stores</span><b>{money(p.revenue)}</b></div>
        </div>
        <KV rows={[
          ['Gives', promoSummary(p)], ['Applies to', promoAppliesTo(p)], ['Billing', (BILLINGS.find((b) => b[0] === p.billing) || [0, p.billing])[1]],
          ['Who', p.newOnly ? 'New stores only' : 'New and existing stores'], ['Limits', `${p.limits.total ? num(p.limits.total) + ' uses in all' : 'No total limit'} · ${p.limits.perStore} per store`],
          ['Dates', `${dmy(p.start)} – ${p.end ? dmy(p.end) : 'no end'}`], ['Made by', `${p.createdBy} · ${dmy(p.createdAt)}`], ['ID', <span key="i" className="mk-data">{p.id}</span>],
        ]} />
        <div className="pr-calc" aria-label="Price check">
          <span className="gc-label">What a store pays</span>
          <div className="mk-three">
            <select className="gc-input gc-select" aria-label="Package" value={calc.ladder} onChange={(e) => setCalc({ ...calc, ladder: e.target.value })}>{LADDERS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}</select>
            <select className="gc-input gc-select" aria-label="Plan" value={calc.plan} onChange={(e) => setCalc({ ...calc, plan: e.target.value })}>{PLAN_KEYS.map((k) => <option key={k} value={k}>{PLAN_NAME[k]}</option>)}</select>
            <select className="gc-input gc-select" aria-label="Billing" value={calc.billing} onChange={(e) => setCalc({ ...calc, billing: e.target.value })}><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>
          </div>
          {pv.error ? <p className="mk-note">{pv.error}</p> : (
            <p className="pr-calc__out">
              {p.type === 'addon' ? <><b>{money(pv.list)}</b><span>plus the add-on free ({money(pv.discount)} a month saved) for {pv.bills} months</span></>
                : <><s>{money(pv.list)}</s><b>{money(pv.pay)}</b><span>{calc.billing === 'yearly' ? 'the first year' : pv.bills === 1 ? 'the first bill' : `for ${pv.bills} bills`} · saves {money(pv.saved)}</span></>}
            </p>
          )}
        </div>
        <span className="gc-label">Stores that used it · {p.reds.length}</span>
        {p.reds.length ? (
          <div className="pr-red">
            {p.reds.slice(0, 30).map((r) => (
              <div key={r.id}>
                <span><Link href={'/admin/merchant?id=' + r.store}>{(db.shops.find((x) => x.id === r.store) || { name: 'Store #' + r.store }).name}</Link><small>#{r.store} · {ladderLabel(r.ladder)} · {PLAN_NAME[r.plan]} · {r.billing} · {dm(r.at)}</small></span>
                <span style={{ flex: 'none', alignItems: 'flex-end' }}><b className="mk-fig">−{money(r.discount)}</b><small>paid {money(r.paid)}</small></span>
              </div>
            ))}
          </div>
        ) : <p className="mk-note">Nobody has used it yet.</p>}
        <span className="gc-label">History</span>
        <ul className="pr-hist">{[...p.history].reverse().map((h, i) => <li key={i}><b>{h.text}</b> · {h.by} · {dayTime(h.at)}</li>)}</ul>
      </div>
    </Sheet>
  );
}

// ---- create / edit -------------------------------------------------------------------------------------------------
function PromoForm({ id, data, t, onClose }) {
  const old = id !== 'new' ? data.promos.find((p) => p.id === id) : null;
  const [f, setF] = useState(() => (old
    ? { code: old.code, name: old.name, type: old.type, value: String(old.value), addon: old.addon || PROMO_ADDONS[0].code, bills: String(old.bills || 1), newOnly: old.newOnly, billing: old.billing, ladders: [...old.ladders], plans: [...old.plans], total: old.limits.total ? String(old.limits.total) : '', perStore: String(old.limits.perStore), start: toDateInput(old.start), end: old.end ? toDateInput(old.end) : '' }
    : { code: '', name: '', type: 'percent', value: '20', addon: PROMO_ADDONS[0].code, bills: '1', newOnly: true, billing: 'any', ladders: [], plans: [], total: '100', perStore: '1', start: toDateInput(startOfDay(t)), end: toDateInput(startOfDay(t) + 30 * DAY) }));
  const [err, setErr] = useState(null);
  const set = (patch) => { setF((x) => ({ ...x, ...patch })); setErr(null); };
  const e = (k) => (err && err.field === k ? err.error : '');
  const toggle = (k, v) => set({ [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] });
  const save = () => {
    const r = savePromo({ id: old ? old.id : null, code: f.code, name: f.name, type: f.type, value: Number(f.value), addon: f.addon, bills: Number(f.bills), newOnly: f.newOnly, billing: f.billing, ladders: f.ladders, plans: f.plans, total: Number(f.total) || 0, perStore: Number(f.perStore) || 1, start: fromInput(f.start), end: f.end ? fromInput(f.end, 23) + 59 * 60e3 : null });
    if (!r.ok) { setErr(r); const el = r.field && document.getElementById('pf-' + r.field); if (el) el.focus(); return; }
    toast(old ? `${f.code.toUpperCase()} saved` : `${f.code.toUpperCase()} created`);
    onClose(r.id);
  };
  const valueLabel = f.type === 'percent' ? 'Percent off' : f.type === 'fixed' ? 'Amount off (৳)' : 'Months';
  const draft = { ...f, value: Number(f.value) || 0, bills: Number(f.bills) || 1, limits: { total: Number(f.total) || 0, perStore: Number(f.perStore) || 1 } };
  return (
    <Sheet open title={old ? 'Edit ' + old.code : 'New promotion'} onClose={() => onClose(null)} footer={<>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(null)}>Cancel</button>
      <button type="button" className="gc-btn gc-btn--solid" onClick={save}>{old ? 'Save' : 'Create'}</button>
    </>}>
      <div className="mk-form">
        <div className="mk-two">
          <Field id="pf-code" label="Code" error={e('code')} hint="Capital letters and numbers"><input id="pf-code" data-autofocus {...ctl(e('code'))} className={ctl(e('code')).className + ' mk-data'} value={f.code} placeholder="e.g. WINTER30" onChange={(ev) => set({ code: ev.target.value.toUpperCase().replace(/\s/g, '') })} /></Field>
          <Field id="pf-name" label="Name" optional><input id="pf-name" className="gc-input" value={f.name} placeholder="Shown to staff" onChange={(ev) => set({ name: ev.target.value })} /></Field>
        </div>
        <div className="gc-field">
          <span className="gc-label">Type</span>
          <div className="gc-seg" role="radiogroup" aria-label="Type">{PROMO_TYPES.map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={f.type === k} className={'gc-seg__btn' + (f.type === k ? ' gc-seg__btn--active' : '')} onClick={() => set({ type: k, value: k === 'percent' ? '20' : k === 'fixed' ? '500' : '1' })}>{l}</button>)}</div>
        </div>
        <div className="mk-two">
          <Field id="pf-value" label={valueLabel} error={e('value')}><input id="pf-value" {...ctl(e('value'))} inputMode="numeric" value={f.value} onChange={(ev) => set({ value: ev.target.value.replace(/[^\d.]/g, '') })} /></Field>
          {f.type === 'addon' ? (
            <Field id="pf-addon" label="Add-on" error={e('addon')}><select id="pf-addon" {...ctl(e('addon'), true)} value={f.addon} onChange={(ev) => set({ addon: ev.target.value })}>{PROMO_ADDONS.map((a) => <option key={a.code} value={a.code}>{a.name}</option>)}</select></Field>
          ) : f.type === 'months' ? <div /> : (
            <Field id="pf-bills" label="For how many bills"><select id="pf-bills" className="gc-input gc-select" value={f.bills} onChange={(ev) => set({ bills: ev.target.value })}>{[1, 2, 3, 6, 12].map((n) => <option key={n} value={n}>{n === 1 ? 'The first bill' : n + ' bills'}</option>)}</select></Field>
          )}
        </div>
        <div className="gc-field">
          <span className="gc-label">Packages</span>
          <div className="mk-checks" role="group" aria-label="Packages">{LADDERS.map((l) => <label key={l.id} className="mk-check"><input type="checkbox" checked={f.ladders.includes(l.id)} onChange={() => toggle('ladders', l.id)} />{l.label}</label>)}</div>
          <p className="gc-help">None ticked = every package.</p>
        </div>
        <div className="gc-field">
          <span className="gc-label">Plans</span>
          <div className="mk-checks" role="group" aria-label="Plans">{PLAN_KEYS.map((k) => <label key={k} className="mk-check"><input type="checkbox" checked={f.plans.includes(k)} onChange={() => toggle('plans', k)} />{PLAN_NAME[k]}</label>)}</div>
          <p className="gc-help">None ticked = every plan.</p>
        </div>
        <div className="mk-two">
          <Field id="pf-billing" label="Billing"><select id="pf-billing" className="gc-input gc-select" value={f.billing} onChange={(ev) => set({ billing: ev.target.value })}>{BILLINGS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
          <div className="gc-field"><span className="gc-label">Who</span><label className="mk-check" style={{ alignSelf: 'flex-start' }}><input type="checkbox" checked={f.newOnly} onChange={() => set({ newOnly: !f.newOnly })} />New stores only</label></div>
        </div>
        <p className="mk-sec">Limits</p>
        <div className="mk-two">
          <Field id="pf-total" label="Uses in all" optional error={e('total')} hint="Empty = no limit"><input id="pf-total" {...ctl(e('total'))} inputMode="numeric" value={f.total} onChange={(ev) => set({ total: ev.target.value.replace(/\D/g, '') })} /></Field>
          <Field id="pf-perStore" label="Per store"><input id="pf-perStore" className="gc-input" inputMode="numeric" value={f.perStore} onChange={(ev) => set({ perStore: ev.target.value.replace(/\D/g, '') })} /></Field>
          <Field id="pf-start" label="Starts" error={e('start')}><input id="pf-start" type="date" {...ctl(e('start'))} value={f.start} onChange={(ev) => set({ start: ev.target.value })} /></Field>
          <Field id="pf-end" label="Ends" optional error={e('end')}><input id="pf-end" type="date" {...ctl(e('end'))} value={f.end} onChange={(ev) => set({ end: ev.target.value })} /></Field>
        </div>
        <p className="mk-note">{f.code ? <b className="mk-data">{f.code} · </b> : null}{promoSummary(draft)} · {promoAppliesTo(draft)}</p>
        {err && !err.field ? <FormError error={err.error} /> : null}
      </div>
    </Sheet>
  );
}
