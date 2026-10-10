'use client';
// Resource limits (/admin/limits) — what each store may use a month (API requests, storage, orders, AI, SMS, email,
// background jobs) against what it uses. The stores near or over a limit (80%+) come first; views: Near or over · All
// stores · Own limits. A store opens a side panel with a usage bar per resource, its own limits (with the reason and an
// end date) and their history; "Change" sets a store's own limit (reason needed), "Use plan default" removes it.
// The plan defaults are a read-only table from the live plan versions (edited in Packages).
// Data: lib/admin/ops.js › limitRows, limitsOf, planDefaults, setOverride, removeOverride, limitLog (usage from
// lib/admin/merchants.js › usageOf). ?view=, ?q= and ?store= (the panel) live in the address.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, EmptyState } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField, Pager } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { UNLIMITED, ladderLabel } from '@/lib/platform/catalogue';
import { dhaka, startOfMonth, addMonths, dmy, MIN } from '@/lib/platform/util';
import { useAdminStore } from '@/lib/admin/store';
import { ops, LIMITS, limitRows, limitsOf, planDefaults, setOverride, removeOverride, limitLog } from '@/lib/admin/ops';
import { AdminShell, usePlatform } from '../AdminShell';
import { OPS_CSS, Card, Meter, Field, ctl, Skeleton, ErrorCard, when, num, plural } from './opsShared';

const PAGE = 25;
const VIEWS = [['near', 'Near or over'], ['all', 'All stores'], ['own', 'Own limits']];
const CSS = `
.lm-store{display:flex;flex-direction:column;min-width:0;max-width:240px}
.lm-store b{overflow:hidden;font-weight:var(--weight-semibold);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.lm-store small{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.lm-worst{display:grid;grid-template-columns:110px 96px 44px;align-items:center;gap:var(--space-2)}
.lm-worst b{font-family:var(--font-data);font-weight:var(--weight-medium);text-align:right;color:var(--text-heading)}
.lm-worst b.is-warn{color:var(--text-warning)}
.lm-worst b.is-over{color:var(--text-danger)}
.lm-hot{display:flex;flex-wrap:wrap;gap:4px}
.lm-hot .gc-badge{height:20px}
.lm-res{display:flex;flex-direction:column;gap:6px;padding:var(--space-3) 0;border-top:1px solid var(--border-subtle)}
.lm-res:first-of-type{border-top:0;padding-top:0}
.lm-res__top{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-sm)}
.lm-res__top b{font-weight:var(--weight-medium);color:var(--text-heading)}
.lm-res__fig{font-family:var(--font-data);font-size:var(--text-sm);color:var(--text-body);white-space:nowrap}
.lm-res__fig.is-over{color:var(--text-danger)}
.lm-res__fig.is-warn{color:var(--text-warning)}
.lm-res small{font-size:var(--text-xs);color:var(--text-muted)}
.lm-res__own{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.lm-res__acts{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.lm-tag{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 var(--space-2);border-radius:var(--radius-full);background:var(--fill-primary-soft);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--primary)}
.lm-plans th:not(:first-child),.lm-plans td:not(:first-child){text-align:right;font-family:var(--font-data)}
.lm-plans tbody tr{cursor:default}
.lm-plans tbody tr:hover td{background:none}
.lm-sheethead{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-2)}
.lm-cur{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-4);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm)}
.lm-cur b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
`;

const fmtVal = (key, v) => (v >= UNLIMITED ? 'No limit' : key === 'storage' ? (Math.round(v * 10) / 10) + ' GB' : num(v));
const pctTxt = (p) => (p >= 1000 ? '999%+' : Math.round(p) + '%');
const tone = (x) => (x.pct >= 100 ? 'is-over' : x.pct >= x.warnAt ? 'is-warn' : '');
const BLANK = { shopId: '', key: '', limit: '', none: false, until: 'none', date: '', reason: '', errors: {} };

function untilOf(f, t) {
  if (f.until === 'month') return startOfMonth(addMonths(startOfMonth(t), 1)) - MIN;
  if (f.until === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(f.date)) { const [y, m, d] = f.date.split('-').map(Number); return dhaka(y, m - 1, d, 23, 59); }
  return null;
}

export default function Limits() {
  const { db, live: plive } = usePlatform();
  const { t, live: olive } = useAdminStore(ops);
  const live = plive && olive;
  const [ready, setReady] = useState(false);
  const [view, setView] = useState('near');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [store, setStore] = useState(null);   // the store open in the panel
  const [form, setForm] = useState(null);     // the Set limit form while open
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setView(VIEWS.some(([k]) => k === p.get('view')) ? p.get('view') : 'near');
    setQ(p.get('q') || '');
    setStore((p.get('store') || '').replace(/\D/g, '').slice(0, 4) || null);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams();
    if (view !== 'near') p.set('view', view);
    if (q.trim()) p.set('q', q.trim());
    if (store) p.set('store', store);
    const s = p.toString();
    window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
  }, [ready, view, q, store]);
  useEffect(() => { setPage(0); }, [view, q]);

  let x = null, error = null;
  if (live) {
    try { x = { rows: limitRows(db, t), plans: planDefaults(db), log: limitLog() }; } catch (e) { error = e; }
  }
  const s = q.trim().toLowerCase();
  const inView = (r) => (view === 'near' ? r.hot.length > 0 : view === 'own' ? r.overrides > 0 : true);
  const counts = x ? Object.fromEntries(VIEWS.map(([k]) => [k, x.rows.filter((r) => (k === 'near' ? r.hot.length > 0 : k === 'own' ? r.overrides > 0 : true)).length])) : {};
  const filtered = x ? x.rows.filter((r) => inView(r) && (!s || (r.name + ' ' + r.id + ' #' + r.id).toLowerCase().includes(s))) : [];
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const rows = filtered.slice(pg * PAGE, pg * PAGE + PAGE);
  const shopName = (id) => ((db.shops || []).find((z) => z.id === id) || {}).name || '#' + id;

  const exportCsv = () => {
    if (!filtered.length) { toast('Nothing to export'); return; }
    downloadCsv(`gridcommerce-limits-${view}.csv`, [
      ['Store ID', 'Store', 'Package', ...LIMITS.flatMap((l) => [l.label + ' used', l.label + ' limit'])],
      ...filtered.map((r) => ['#' + r.id, r.name, ladderLabel(r.ladder) + ' ' + r.plan, ...r.limits.flatMap((l) => [l.used, l.unlimited ? 'No limit' : l.limit])]),
    ]);
    toast(plural(filtered.length, 'store') + ' exported');
  };

  // ---- the form ----
  const openForm = (shopId, key) => {
    const shop = (db.shops || []).find((z) => z.id === shopId);
    const cur = shop && key ? limitsOf(db, shop, t).find((l) => l.key === key) : null;
    setForm({ ...BLANK, shopId: shopId || '', key: key || '', limit: cur ? (cur.unlimited ? '' : String(cur.limit)) : '', none: cur ? cur.unlimited : false });
  };
  const setF = (k) => (e) => { const v = e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e; setForm((f) => ({ ...f, [k]: v, errors: {} })); };
  const submit = () => {
    const errors = {};
    if (!form.shopId) errors.shopId = 'Pick a store.';
    if (!form.key) errors.key = 'Pick a resource.';
    if (form.until === 'date' && !untilOf(form, t)) errors.until = 'Pick the end date.';
    if (Object.keys(errors).length) { setForm({ ...form, errors }); return; }
    const res = setOverride(form.shopId, form.key, form.none ? UNLIMITED : Number(form.limit), form.reason, untilOf(form, t));
    if (!res.ok) { setForm({ ...form, errors: { [res.field || 'form']: res.error } }); return; }
    toast(`${res.label} limit for ${shopName(form.shopId)} set`);
    setStore(form.shopId);
    setForm(null);
  };
  const reset = async (shopId, l) => {
    const ok = await confirmDialog({ title: `Use the plan default for ${l.label}?`, body: `${shopName(shopId)} goes back to ${fmtVal(l.key, l.base)} (now ${fmtVal(l.key, l.limit)}).${l.used > l.base && l.base > 0 ? ' It already uses more than that, so new ' + l.label.toLowerCase() + ' may be blocked.' : ''}`, confirmLabel: 'Use plan default', tone: 'danger' });
    if (!ok) return;
    const res = removeOverride(shopId, l.key, 'Back to the plan default');
    if (!res.ok) { toast(res.error); return; }
    toast(`${res.label} back to the plan default`);
  };

  const header = (
    <ShopHeader icon="gauge" title="Resource limits"
      about="What each store may use a month — API requests, storage, orders, AI, SMS, email and background jobs — against what it has used so far. The package sets the defaults (edit them in Packages); a store can get its own limit for a reason, with an optional end date. Stores at 80% or more of any limit come first. Usage is demo data."
      secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv }]}
      more={[{ label: 'Packages', href: '/admin/packages' }, { label: 'All merchants', href: '/admin/merchants' }]}
      primary={{ label: 'Set a store limit', icon: 'plus', onClick: () => openForm(store || '', '') }} />
  );

  let body;
  if (!live) body = <Skeleton rows={1} />;
  else if (error) body = <ErrorCard onRetry={() => setRetry(retry + 1)} what="Store usage" />;
  else {
    const tabs = VIEWS.map(([k, label]) => ({ key: k, id: 'lm-tab-' + k, label, count: counts[k], on: view === k, onClick: () => setView(k) }));
    body = (
      <>
        <section className="ix-card" aria-label="Stores and their limits">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Views" /></div>
          <div className="ops-filters"><SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search store name or ID" onDone={() => setQ('')} /></div>
          {!filtered.length ? (
            <div className="ix-empty">
              {s ? <EmptyState title="No store matches." actionLabel="Clear search" onAction={() => setQ('')} />
                : view === 'near' ? <EmptyState icon="circle-check" title="No store is near a limit." actionLabel="Show all stores" onAction={() => setView('all')} />
                  : <EmptyState icon="gauge" title="No store has its own limit." actionLabel="Set a store limit" onAction={() => openForm('', '')} />}
            </div>
          ) : (
            <>
              <ul className="ix-plist" aria-label="Stores">
                {rows.map((r) => (
                  <li key={r.id}>
                    <button type="button" className="ix-pitem" style={{ width: '100%', border: 0, background: 'none', textAlign: 'left', font: 'inherit' }} onClick={() => setStore(r.id)}>
                      <span className="ix-pitem__top"><b>{r.name}</b>{r.worst ? <span className={'ops-data ' + (r.worst.pct >= 100 ? 'ops-bad' : r.worst.pct >= r.worst.warnAt ? 'ops-warn' : '')}>{r.worst.label} {pctTxt(r.worst.pct)}</span> : null}</span>
                      <span className="ix-pitem__mid">#{r.id} · {ladderLabel(r.ladder)} {r.plan}{r.overrides ? ` · ${plural(r.overrides, 'own limit')}` : ''}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table gc-table--keep">
                  <caption className="sr-only">Stores and their limits</caption>
                  <thead><tr><th scope="col">Store</th><th scope="col">Package</th><th scope="col">Highest use</th><th scope="col">At 80% or more</th><th scope="col">Own limits</th></tr></thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} tabIndex={0} onClick={() => setStore(r.id)} onKeyDown={(e) => { if (e.key === 'Enter') setStore(r.id); }}>
                        <td><span className="lm-store"><b>{r.name}</b><small>#{r.id}</small></span></td>
                        <td className="ix-muted">{ladderLabel(r.ladder)} {r.plan}</td>
                        <td>{r.worst ? <span className="lm-worst"><span>{r.worst.label}</span><Meter pct={r.worst.pct} warn={r.worst.warnAt} label={r.worst.label + ' used'} /><b className={tone(r.worst)}>{pctTxt(r.worst.pct)}</b></span> : '—'}</td>
                        <td><span className="lm-hot">{r.hot.length ? r.hot.map((h) => <span key={h.key} className={'gc-badge gc-badge--' + (h.pct >= 100 ? 'error' : 'warning')}>{h.label} {pctTxt(h.pct)}</span>) : <span className="ix-muted">—</span>}</span></td>
                        <td>{r.overrides ? <span className="lm-tag">{r.overrides}</span> : <span className="ix-muted">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <Pager label={filtered.length ? `${pg * PAGE + 1}–${pg * PAGE + rows.length} of ${filtered.length}` : '0 stores'} atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
        </section>

        <div className="ops-grid ops-grid--21">
          <Card title="Plan defaults" tip="From each package's live plan version. Email, background jobs and the API cap are platform defaults by plan." action={<Link href="/admin/packages">Edit in Packages</Link>}>
            <div className="ix-table-wrap gc-table--scroll" style={{ display: 'block', overflowX: 'auto' }}>
              <table className="ix-table gc-table--keep gc-table--scroll lm-plans">
                <caption className="sr-only">Default limits by package</caption>
                <thead><tr><th scope="col">Package</th>{LIMITS.map((l) => <th key={l.key} scope="col">{l.label}</th>)}</tr></thead>
                <tbody>
                  {x.plans.map((p) => (
                    <tr key={p.ladder + p.plan}><td>{p.name} <span className="ops-small">v{p.version}</span></td>{LIMITS.map((l) => <td key={l.key}>{fmtVal(l.key, p.limits[l.key])}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card title="Recent changes">
            {x.log.length ? (
              <ul className="ops-list">
                {x.log.slice(0, 5).map((c) => (
                  <li key={c.id}>
                    <span className="ops-list__main">
                      <b><button type="button" className="ops-sortbtn" onClick={() => setStore(c.shopId)}>{shopName(c.shopId)}</button> · {(LIMITS.find((l) => l.key === c.key) || {}).label}</b>
                      <small>{fmtVal(c.key, c.from)} → {fmtVal(c.key, c.to)}{c.action === 'removed' ? ' (plan default)' : ''} · {c.reason}</small>
                      <small>{c.by} · {when(c.at, t)}</small>
                    </span>
                  </li>
                ))}
              </ul>
            ) : <p className="ops-muted" style={{ margin: 0 }}>No changes yet.</p>}
          </Card>
        </div>
      </>
    );
  }

  // the store panel
  const shop = x && store ? (db.shops || []).find((z) => z.id === store) : null;
  const row = shop ? x.rows.find((r) => r.id === shop.id) : null;
  const lims = shop ? limitsOf(db, shop, t) : [];
  const hist = shop ? limitLog(shop.id) : [];
  // the form
  const e = form ? form.errors : {};
  const fShop = form && form.shopId ? (db.shops || []).find((z) => z.id === form.shopId) : null;
  const fCur = fShop && form.key ? limitsOf(db, fShop, t).find((l) => l.key === form.key) : null;
  const billable = x ? x.rows.slice().sort((a, b) => a.name.localeCompare(b.name)) : [];

  return (
    <AdminShell active="limits" title="Resource limits">
      <style dangerouslySetInnerHTML={{ __html: OPS_CSS + CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>

      <Sheet open={!!shop && !form} title={shop ? shop.name : ''} onClose={() => setStore(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setStore(null)}>Close</button>
          {shop ? <button type="button" className="gc-btn gc-btn--solid" onClick={() => openForm(shop.id, '')}><Icon name="plus" width="16" height="16" aria-hidden="true" />Set a limit</button> : null}
        </>}>
        {shop ? (
          <div className="ops-form">
            <div className="lm-sheethead">
              <span className="ops-muted"><span className="ops-data">#{shop.id}</span>{row ? ` · ${ladderLabel(row.ladder)} ${row.plan}` : ' · not billed now'}</span>
              <Link href={'/admin/merchant?id=' + shop.id} className="ix-btn ix-btn--sm">Open merchant</Link>
            </div>
            <div>
              {lims.map((l) => (
                <div key={l.key} className="lm-res">
                  <div className="lm-res__top"><b>{l.label}</b><span className={'lm-res__fig ' + tone(l)}>{fmtVal(l.key, l.used)} of {fmtVal(l.key, l.limit)}{l.unlimited ? '' : ' · ' + pctTxt(l.pct)}</span></div>
                  {l.unlimited ? null : <Meter pct={l.pct} warn={l.warnAt} label={l.label + ' used'} />}
                  {l.override ? (
                    <div className="lm-res__own">
                      <span className="lm-tag">Own limit</span>
                      <small>plan {fmtVal(l.key, l.base)} · {l.override.reason} · {l.override.by}{l.override.until ? ' · until ' + dmy(l.override.until) : ''}</small>
                    </div>
                  ) : <small>Plan default</small>}
                  <div className="lm-res__acts">
                    <button type="button" className="ix-btn ix-btn--sm" onClick={() => openForm(shop.id, l.key)}>Change</button>
                    {l.override ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => reset(shop.id, l)}>Use plan default</button> : null}
                  </div>
                </div>
              ))}
            </div>
            <h3 className="ops-sec">History</h3>
            {hist.length ? (
              <ul className="ops-list">
                {hist.map((c) => (
                  <li key={c.id}><span className="ops-list__main"><b>{(LIMITS.find((l) => l.key === c.key) || {}).label}: {fmtVal(c.key, c.from)} → {fmtVal(c.key, c.to)}{c.action === 'removed' ? ' (plan default)' : ''}</b><small>{c.reason}</small><small>{c.by} · {when(c.at, t)}{c.until ? ' · until ' + dmy(c.until) : ''}</small></span></li>
                ))}
              </ul>
            ) : <p className="ops-muted" style={{ margin: 0 }}>This store has always used its plan's limits.</p>}
          </div>
        ) : null}
      </Sheet>

      <Sheet open={!!form} title="Set a store limit" onClose={() => setForm(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setForm(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={submit}>Save limit</button>
        </>}>
        {form ? (
          <div className="ops-form">
            <Field id="lm-shop" label="Store" error={e.shopId}>
              <select id="lm-shop" {...ctl(e.shopId, true)} value={form.shopId} onChange={setF('shopId')} data-autofocus={!form.shopId || undefined}>
                <option value="">Choose a store</option>
                {billable.map((r) => <option key={r.id} value={r.id}>{r.name} · #{r.id}</option>)}
              </select>
            </Field>
            <Field id="lm-key" label="Resource" error={e.key}>
              <select id="lm-key" {...ctl(e.key, true)} value={form.key} onChange={(ev) => {
                const k = ev.target.value;
                const cur = fShop && k ? limitsOf(db, fShop, t).find((l) => l.key === k) : null;
                setForm((f) => ({ ...f, key: k, limit: cur ? (cur.unlimited ? '' : String(cur.limit)) : f.limit, none: cur ? cur.unlimited : false, errors: {} }));
              }}>
                <option value="">Choose</option>
                {LIMITS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
              </select>
            </Field>
            {fCur ? (
              <div className="lm-cur">
                <span>Used <b>{fmtVal(fCur.key, fCur.used)}</b></span>
                <span>Now <b>{fmtVal(fCur.key, fCur.limit)}</b>{fCur.override ? ' (own)' : ''}</span>
                <span>Plan <b>{fmtVal(fCur.key, fCur.base)}</b></span>
              </div>
            ) : null}
            <Field id="lm-limit" label={'New limit' + (fCur ? ' (' + fCur.unit + ')' : '')} error={e.limit}>
              <input id="lm-limit" {...ctl(e.limit)} type="number" min="0" step={form.key === 'storage' ? '0.5' : '1'} inputMode="decimal" value={form.limit} disabled={form.none} onChange={setF('limit')} data-autofocus={form.shopId && form.key ? true : undefined} />
            </Field>
            <label className="ops-check"><input type="checkbox" checked={form.none} onChange={setF('none')} />No limit for this store</label>
            <div className="ops-form__two">
              <Field id="lm-until" label="Ends" error={e.until}>
                <select id="lm-until" {...ctl(e.until, true)} value={form.until} onChange={setF('until')}>
                  <option value="none">No end date</option>
                  <option value="month">End of this month</option>
                  <option value="date">On a date</option>
                </select>
              </Field>
              {form.until === 'date' ? (
                <Field id="lm-date" label="End date">
                  <input id="lm-date" {...ctl(e.until)} type="date" value={form.date} onChange={setF('date')} />
                </Field>
              ) : null}
            </div>
            <Field id="lm-reason" label="Reason" error={e.reason} hint="Kept in the store's limit history.">
              <textarea id="lm-reason" {...ctl(e.reason)} rows={3} value={form.reason} onChange={setF('reason')} placeholder="e.g. Eid campaign: approved 1,000 more orders this month" maxLength={200} />
            </Field>
            {e.form ? <p className="ops-formerr" role="alert">{e.form}</p> : null}
          </div>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
