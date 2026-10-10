'use client';
// All merchants (/admin/merchants) — GridCommerce's stores as one list, laid out like the merchant panel's Orders list:
// the title row (Add merchant, Export), then one card with the views as tabs (counts on the tabs, no figure cards),
// search and filters (FilterBar: a "Filter (n)" sheet on phones), a bulk bar for the selected stores, a compact table
// (a two-line list on phones) and the pager. A row opens the merchant's record (/admin/merchant?id=).
// Data: lib/admin/merchants.js (merchantList, assignManager) and lib/platform (setControl, sendPayLinks).
// The view, search, filters and sort live in the URL (?view=late&pkg=online …) so other pages can link to a view;
// they are read after mount. Rows are worked out once the saved data has loaded (usePlatform().live).

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { FilterBar } from '@/components/ui/FilterBar';
import { ShopHeader, IndexTabs, Pager, Menu } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { formatBDT } from '@/lib/format';
import { dmy, dm } from '@/lib/platform/util';
import { LADDERS, PLAN_IDS, PLAN_NAME, SOURCES, DISTRICTS, STAFF, CONTROL_REASONS } from '@/lib/platform/catalogue';
import { setControl, sendPayLinks } from '@/lib/platform/billing';
import { VIEWS, merchantList, assignManager } from '@/lib/admin/merchants';
import { AdminShell, usePlatform } from '../AdminShell';

const PAGE = 20;
const NONE = '__none';   // the "No account manager" filter value
const MANAGERS = STAFF.filter((s) => !s.invite && !s.inactive).map((s) => s.name);
const FILTER_KEYS = ['pkg', 'plan', 'am', 'src', 'dist'];
const SORTS = { registered: 'Registered', renewal: 'Renewal', monthly: 'Monthly' };

const CSS = `
.mer-filters{padding:8px;border-bottom:1px solid var(--border-subtle)}
.mer-filters .gc-filterbar__search{max-width:320px}
.mer-name{display:flex;flex-direction:column;min-width:0;max-width:260px}
.mer-name a,.mer-name b{overflow:hidden;text-overflow:ellipsis}
.mer-name small,.mer-owner small{overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis}
.mer-owner{display:flex;flex-direction:column;min-width:0;max-width:200px}
.mer-owner small{font-family:var(--font-data)}
.mer-email{max-width:220px;overflow:hidden;text-overflow:ellipsis}
.mer-mods{font-family:var(--font-data);text-decoration:underline dotted var(--border-strong);text-underline-offset:3px;cursor:help}
.mer-money{font-family:var(--font-data);color:var(--text-heading)}
.mer-sort{display:inline-flex;align-items:center;gap:4px;padding:0;border:0;background:none;font:inherit;color:inherit;cursor:pointer}
.mer-sort:hover{color:var(--text-heading)}
.mer-sort:focus-visible{outline:2px solid var(--primary);outline-offset:2px;border-radius:var(--radius-sm)}
.mer-sort svg{opacity:.4}
.mer-sort.is-on svg{opacity:1;color:var(--primary)}
th.ix-num .mer-sort{flex-direction:row-reverse}
.ix-table tbody tr:focus-visible td{background:var(--surface-subtle)}
.ix-table tbody tr:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.mer-foot{display:inline-flex;flex-wrap:wrap;gap:4px var(--space-3)}
.mer-foot b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.mer-form{display:flex;flex-direction:column;gap:var(--space-3)}
.mer-form p{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.mer-ids{font-family:var(--font-data);color:var(--text-heading)}
.mer-skel{height:420px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:mer-sk 1.4s ease infinite}
@keyframes mer-sk{from{background-position:100% 0}to{background-position:-100% 0}}
@media (prefers-reduced-motion:reduce){.mer-skel{animation:none}}
@media (max-width:640px){.mer-filters{padding:6px}}
`;

const money = (n) => formatBDT(Math.round(Number(n) || 0));
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');
const renewalText = (r) => (!r.renewal ? '—' : r.stateKey === 'trial' ? 'Trial ends ' + dm(r.renewal) : dmy(r.renewal));

/** Read the list's state from the address (after mount). */
function fromUrl() {
  const p = new URLSearchParams(window.location.search);
  const view = VIEWS.some(([k]) => k === p.get('view')) ? p.get('view') : 'all';
  const f = {};
  for (const k of FILTER_KEYS) f[k] = p.get(k) || '';
  const [sk, sd] = String(p.get('sort') || '').split('-');
  const sort = SORTS[sk] ? { key: sk, dir: sd === 'asc' ? 'asc' : 'desc' } : { key: 'registered', dir: 'desc' };
  return { view, q: p.get('q') || '', f, sort };
}
function toUrl({ view, q, f, sort }) {
  const p = new URLSearchParams();
  if (view !== 'all') p.set('view', view);
  if (q.trim()) p.set('q', q.trim());
  for (const k of FILTER_KEYS) if (f[k]) p.set(k, f[k]);
  if (sort.key !== 'registered' || sort.dir !== 'desc') p.set('sort', sort.key + '-' + sort.dir);
  const s = p.toString();
  window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
}

const csvRows = (rows) => [
  ['Merchant ID', 'Business name', 'Domain', 'Owner', 'Phone', 'Email', 'Package', 'Active modules', 'Registered', 'Renewal', 'Status', 'Monthly (BDT)', 'Owed (BDT)', 'Account manager', 'Source', 'District'],
  ...rows.map((r) => ['#' + r.id, r.name, r.domain, r.owner, r.phone, r.email, r.packageName, r.modules.join('; '), dmy(r.registered), renewalText(r), r.stateLabel, Math.round(r.monthly), Math.round(r.owed), r.am || '', r.src || '', r.dist || '']),
];

export default function Merchants() {
  const router = useRouter();
  const { db, t, live } = usePlatform();
  const [ready, setReady] = useState(false);       // the address has been read
  const [view, setView] = useState('all');
  const [q, setQ] = useState('');
  const [f, setF] = useState({ pkg: '', plan: '', am: '', src: '', dist: '' });
  const [sort, setSort] = useState({ key: 'registered', dir: 'desc' });
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState(() => new Set());
  const [assign, setAssign] = useState(null);      // { name } while the Assign sheet is open
  const [suspend, setSuspend] = useState(null);    // { reason, error } while the Suspend dialog is open
  const first = useRef(true);

  useEffect(() => { const s = fromUrl(); setView(s.view); setQ(s.q); setF(s.f); setSort(s.sort); setReady(true); }, []);
  useEffect(() => {
    if (!ready) return;
    toUrl({ view, q, f, sort });
    if (first.current) { first.current = false; return; }
    setPage(0);
  }, [ready, view, q, f, sort]);

  // every row is worked out on each redraw (the data changes in place; usePlatform redraws on each change)
  const list = live ? merchantList(db, t) : null;
  const all = list ? list.rows : [];
  const counts = list ? list.counts : {};

  const s = q.trim().toLowerCase();
  const digits = s.replace(/\D/g, '');
  const filtered = (() => {
    const out = all.filter((r) => {
      if (view !== 'all' && r.view !== view) return false;
      if (f.pkg && r.ladder !== f.pkg) return false;
      if (f.plan && r.plan !== f.plan) return false;
      if (f.am && (f.am === NONE ? r.am : r.am !== f.am)) return false;
      if (f.src && r.src !== f.src) return false;
      if (f.dist && r.dist !== f.dist) return false;
      if (!s) return true;
      const hay = [r.name, r.id, '#' + r.id, r.owner, r.email, r.domain].join(' ').toLowerCase();
      if (hay.includes(s)) return true;
      return digits.length >= 3 && r.phone.replace(/\D/g, '').includes(digits);
    });
    const dir = sort.dir === 'asc' ? 1 : -1;
    const val = (r) => (sort.key === 'renewal' ? (r.renewal == null ? null : r.renewal) : r[sort.key]);
    return out.sort((a, b) => {
      const x = val(a), y = val(b);
      if (x == null && y == null) return b.registered - a.registered;
      if (x == null) return 1;   // stores without a renewal go last either way
      if (y == null) return -1;
      return (x - y) * dir || b.registered - a.registered;
    });
  })();

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const rows = filtered.slice(pg * PAGE, pg * PAGE + PAGE);
  const monthlyTotal = filtered.reduce((a, r) => a + r.monthly, 0);
  const owedTotal = filtered.reduce((a, r) => a + r.owed, 0);

  // selection: only stores still in the filtered list count
  const selRows = filtered.filter((r) => sel.has(r.id));
  const allOnPage = rows.length > 0 && rows.every((r) => sel.has(r.id));
  const toggle = (id) => setSel((old) => { const n = new Set(old); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAll = () => setSel((old) => { const n = new Set(old); if (allOnPage) rows.forEach((r) => n.delete(r.id)); else rows.forEach((r) => n.add(r.id)); return n; });
  const clearSel = () => setSel(new Set());

  const filtersOn = !!s || FILTER_KEYS.some((k) => f[k]);
  const clearFilters = () => { setQ(''); setF({ pkg: '', plan: '', am: '', src: '', dist: '' }); };
  const setFilter = (k) => (v) => setF((old) => ({ ...old, [k]: v }));
  const open = (id) => router.push('/admin/merchant?id=' + id);

  const sortBy = (key) => setSort((old) => (old.key === key ? { key, dir: old.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'renewal' ? 'asc' : 'desc' }));
  const sortHead = (k, num) => {
    const on = sort.key === k;
    return (
      <th scope="col" className={num ? 'ix-num' : undefined} aria-sort={on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
        <button type="button" className={'mer-sort' + (on ? ' is-on' : '')} onClick={() => sortBy(k)} aria-label={`Sort by ${SORTS[k].toLowerCase()}`}>
          {SORTS[k]}<Icon name={on && sort.dir === 'asc' ? 'arrow-up' : 'arrow-down'} width="14" height="14" aria-hidden="true" />
        </button>
      </th>
    );
  };

  // ---- actions ----
  const exportCsv = (which, name) => {
    if (!which.length) { toast('Nothing to export'); return; }
    downloadCsv(name, csvRows(which));
    toast(plural(which.length, 'merchant') + ' exported');
  };
  const viewLabel = (VIEWS.find(([k]) => k === view) || [])[1] || 'All';
  const exportAll = () => exportCsv(filtered, `gridcommerce-merchants-${view}.csv`);

  const doAssign = () => {
    if (!assign.name) { setAssign({ ...assign, error: 'Pick a person.' }); return; }
    const ids = selRows.map((r) => r.id);
    const res = assignManager(ids, assign.name === NONE ? null : assign.name);
    setAssign(null);
    clearSel();
    toast(res.n ? (assign.name === NONE ? `Account manager removed from ${plural(res.n, 'store')}` : `${assign.name} now looks after ${plural(res.n, 'store')}`) : 'Nothing changed');
  };
  const doPayLinks = () => {
    const late = selRows.filter((r) => r.owed > 0);
    if (!late.length) { toast('None of the selected stores owes anything'); return; }
    let n = 0;
    for (const r of late) if (((sendPayLinks(r.id) || {}).count || 0) > 0) n++;
    toast(n ? `Payment links sent to ${plural(n, 'store')}` : 'No bill is due yet, so no link was sent');
  };
  const doSuspend = () => {
    if (!suspend.reason) { setSuspend({ ...suspend, error: 'Pick a reason.' }); return; }
    const targets = selRows.filter((r) => r.stateKey !== 'suspended');
    let n = 0;
    for (const r of targets) if ((setControl(r.id, 'suspended', suspend.reason) || {}).ok) n++;
    setSuspend(null);
    clearSel();
    toast(n ? `${plural(n, 'store')} suspended` : 'The selected stores were already suspended');
  };

  const tabs = VIEWS.map(([k, label]) => ({ key: k, id: 'mer-tab-' + k, label, count: live ? counts[k] || 0 : null, on: view === k, onClick: () => { setView(k); } }));

  const filters = [
    { key: 'pkg', label: 'Package', all: 'All packages', value: f.pkg, options: LADDERS.map((l) => [l.id, l.label]), onChange: setFilter('pkg') },
    { key: 'plan', label: 'Plan', all: 'All plans', value: f.plan, options: PLAN_IDS.map((p) => [p, PLAN_NAME[p]]), onChange: setFilter('plan') },
    { key: 'am', label: 'Account manager', all: 'All managers', value: f.am, options: [...MANAGERS.map((n) => [n, n]), [NONE, 'No account manager']], onChange: setFilter('am') },
    { key: 'src', label: 'Source', all: 'All sources', value: f.src, options: SOURCES.map((x) => [x, x]), onChange: setFilter('src') },
    { key: 'dist', label: 'District', all: 'All districts', value: f.dist, options: DISTRICTS.map((x) => [x, x]), onChange: setFilter('dist') },
  ];

  const header = (
    <ShopHeader icon="store" title="Merchants"
      about="Every GridCommerce store in one list: who owns it, its package and modules, when it renews and whether it pays. Open a store to change its plan, modules, billing or access."
      secondary={[{ label: 'Export', icon: 'download', onClick: exportAll }]}
      primary={{ label: 'Add merchant', icon: 'plus', href: '/admin/merchants/new' }} />
  );

  let body;
  if (!live) {
    body = <div className="mer-skel" aria-busy="true" aria-label="Loading merchants" />;
  } else {
    const footLabel = (
      <span className="mer-foot">
        <span>{filtered.length ? `${pg * PAGE + 1}–${pg * PAGE + rows.length} of ${filtered.length}` : '0 merchants'}</span>
        {monthlyTotal ? <span>Monthly <b>{money(monthlyTotal)}</b></span> : null}
        {owedTotal ? <span>Owed <b>{money(owedTotal)}</b></span> : null}
      </span>
    );
    body = (
      <section className="ix-card" aria-label={viewLabel + ' merchants'}>
        {selRows.length ? (
          <div className="ix-bulk" role="toolbar" aria-label="Selected merchants">
            <input type="checkbox" checked={allOnPage} onChange={toggleAll} aria-label="Select every merchant on this page" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
            <span className="ix-bulk__n">{selRows.length} selected</span>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => setAssign({ name: '' })}><Icon name="user-round-check" width="16" height="16" aria-hidden="true" />Assign account manager</button>
            <button type="button" className="ix-btn ix-btn--sm" onClick={doPayLinks}><Icon name="send" width="16" height="16" aria-hidden="true" />Send payment links</button>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => exportCsv(selRows, 'gridcommerce-merchants-selected.csv')}><Icon name="download" width="16" height="16" aria-hidden="true" />Export selected</button>
            <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" align="start" items={[
              { label: 'Suspend stores', onClick: () => setSuspend({ reason: '' }), tone: 'danger' },
              { label: 'Clear selection', onClick: clearSel },
            ]} />
          </div>
        ) : (
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Merchant views" /></div>
        )}
        <div className="mer-filters">
          <FilterBar label="Filter merchants" filters={filters} onClear={() => setQ('')}
            search={{ value: q, onChange: setQ, placeholder: 'Search name, ID, owner, phone, email or domain' }} />
        </div>

        {!filtered.length ? (
          <div className="ix-empty">
            {filtersOn
              ? <EmptyState title="No merchants match these filters." actionLabel="Clear filters" onAction={clearFilters} />
              : <EmptyState icon="store" title={`No merchants in ${viewLabel}.`} actionLabel="Show all merchants" onAction={() => setView('all')} />}
          </div>
        ) : (
          <>
            <ul className="ix-plist" aria-label={viewLabel + ' merchants'}>
              {rows.map((r) => (
                <li key={r.id}>
                  <Link href={'/admin/merchant?id=' + r.id} className="ix-pitem">
                    <span className="ix-pitem__top"><b>{r.name}</b><span className="mer-money">{r.monthly ? money(r.monthly) : '—'}</span></span>
                    <span className="ix-pitem__mid"><span className="ix-id">#{r.id}</span> · {r.owner} · {r.packageName}</span>
                    <span className="ix-pitem__tags">
                      <StatusBadge tone={r.tone}>{r.stateLabel}</StatusBadge>
                      {r.renewal ? <span className="ix-pitem__mid">{r.stateKey === 'trial' ? renewalText(r) : 'Renews ' + dm(r.renewal)}</span> : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">{viewLabel} merchants</caption>
                <thead>
                  <tr>
                    <th scope="col" className="ix-check"><input type="checkbox" checked={allOnPage} onChange={toggleAll} aria-label="Select every merchant on this page" /></th>
                    <th scope="col">ID</th>
                    <th scope="col">Business</th>
                    <th scope="col">Owner</th>
                    <th scope="col">Email</th>
                    <th scope="col">Package</th>
                    <th scope="col" className="ix-num">Modules</th>
                    {sortHead('registered')}
                    {sortHead('renewal')}
                    <th scope="col">Status</th>
                    {sortHead('monthly', true)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className={sel.has(r.id) ? 'is-sel' : ''} tabIndex={0}
                      onClick={() => open(r.id)} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) open(r.id); }}>
                      <td className="ix-check" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={sel.has(r.id)} onChange={() => toggle(r.id)} aria-label={'Select ' + r.name} /></td>
                      <td><span className="ix-id ix-muted">#{r.id}</span></td>
                      <td>
                        <span className="mer-name">
                          <Link href={'/admin/merchant?id=' + r.id} className="ix-strong" onClick={(e) => e.stopPropagation()}>{r.name}</Link>
                          <small>{r.domain}</small>
                        </span>
                      </td>
                      <td><span className="mer-owner"><span>{r.owner || '—'}</span>{r.phone ? <small>{r.phone}</small> : null}</span></td>
                      <td className="ix-muted"><span className="mer-email" title={r.email || undefined}>{r.email || '—'}</span></td>
                      <td>{r.packageName}</td>
                      <td className="ix-num"><span className="mer-mods" title={r.modules.length ? r.modules.join(', ') : 'Only the everyday core'}>{r.moduleCount}</span></td>
                      <td className="ix-muted">{dmy(r.registered)}</td>
                      <td className={r.stateKey === 'trial' && r.trialLeft != null && r.trialLeft <= 3 ? 'ix-warn' : 'ix-muted'}>{renewalText(r)}</td>
                      <td><StatusBadge tone={r.tone}>{r.stateLabel}</StatusBadge></td>
                      <td className="ix-num"><span className="mer-money">{r.monthly ? money(r.monthly) : '—'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <Pager label={footLabel} atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
      </section>
    );
  }

  return (
    <AdminShell active="merchants" title="All merchants">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>

      <Sheet open={!!assign} title="Assign account manager" onClose={() => setAssign(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setAssign(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={doAssign}>Assign</button>
        </>}>
        {assign ? (
          <div className="mer-form">
            <p>{plural(selRows.length, 'store')}: <span className="mer-ids">{selRows.slice(0, 6).map((r) => '#' + r.id).join(', ')}{selRows.length > 6 ? ' …' : ''}</span></p>
            <div>
              <label className="gc-label" htmlFor="mer-am">Account manager</label>
              <select id="mer-am" className={'gc-input gc-select' + (assign.error ? ' gc-input--error' : '')} data-autofocus value={assign.name}
                aria-invalid={assign.error ? 'true' : undefined} onChange={(e) => setAssign({ name: e.target.value })}>
                <option value="">Choose a person</option>
                {MANAGERS.map((n) => <option key={n} value={n}>{n}</option>)}
                <option value={NONE}>Nobody (remove)</option>
              </select>
              {assign.error ? <p className="gc-help gc-help--error" role="alert">{assign.error}</p> : null}
            </div>
          </div>
        ) : null}
      </Sheet>

      <Dialog open={!!suspend} title={'Suspend ' + plural(selRows.length, 'store')} onClose={() => setSuspend(null)} width={480}
        footer={<>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setSuspend(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid gc-btn--error" onClick={doSuspend}>Suspend</button>
        </>}>
        {suspend ? (
          <div className="mer-form">
            <div className="gc-alert gc-alert--soft gc-alert--error" role="alert">
              <Icon name="triangle-alert" width="18" height="18" aria-hidden="true" />
              <span>These stores go offline: shoppers can’t open them and the owners can’t sign in until access is restored on each store’s page.</span>
            </div>
            <p className="mer-ids">{selRows.slice(0, 8).map((r) => '#' + r.id + ' ' + r.name).join(', ')}{selRows.length > 8 ? ' …' : ''}</p>
            <div>
              <label className="gc-label" htmlFor="mer-reason">Reason</label>
              <select id="mer-reason" className={'gc-input gc-select' + (suspend.error ? ' gc-input--error' : '')} data-autofocus value={suspend.reason}
                aria-invalid={suspend.error ? 'true' : undefined} onChange={(e) => setSuspend({ reason: e.target.value })}>
                <option value="">Choose a reason</option>
                {CONTROL_REASONS.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
              {suspend.error ? <p className="gc-help gc-help--error" role="alert">{suspend.error}</p> : null}
            </div>
          </div>
        ) : null}
      </Dialog>
    </AdminShell>
  );
}
