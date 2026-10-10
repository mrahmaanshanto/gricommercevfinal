'use client';
// Activity log (/admin/activity) — one searchable log of everything that happened: every store's history from the
// platform (staff actions, billing, system, owner and team events), payments, credit adjustments, collection calls and
// plan drafts, merged with the super admin's own activity (sign-ins, role changes, settings changes, exports, PIN
// access) and security events. Tabs by category (counts on the tabs), filters (who, store, date range), CSV export
// (written to the log as an export) and a detail Sheet per row.
// Data: lib/admin/admin.js › activityLog(platform db, admin store) — categories from each event's kind and text.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState, InfoTip } from '@/components/ui';
import { FilterBar } from '@/components/ui/FilterBar';
import { ShopHeader, IndexTabs, Pager, KV } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { dmy, hm, dm, ago, startOfDay, dhaka, DAY } from '@/lib/platform/util';
import { CATS, CAT_LABEL, CAT_TONE, PEOPLE, activityLog, recordExport } from '@/lib/admin/admin';
import { AdminShell } from '../AdminShell';
import { ADX_CSS, useAdmin, Skeleton, plural } from './admShared';

const PAGE = 25;
const OWNERS = '__owners';
const RANGES = [['today', 'Today'], ['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 90 days'], ['all', 'Any date'], ['custom', 'Pick dates']];
const KEYS = ['tab', 'q', 'who', 'store', 'range', 'from', 'to'];

const CSS = `
.al-filters{padding:8px;border-bottom:1px solid var(--border-subtle)}
.al-filters .gc-filterbar__search{max-width:340px}
.al-dates{display:inline-flex;align-items:center;gap:6px}
.al-dates .gc-input{width:150px}
.al-what{display:block;max-width:520px;overflow:hidden;color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.al-time{white-space:nowrap;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.al-who{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.al-store{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.al-text{margin:0;font-size:var(--text-sm);line-height:1.5;color:var(--text-heading)}
@media (max-width:640px){.al-filters{padding:6px}.al-dates{flex-wrap:wrap}.al-dates .gc-input{width:100%}}
`;

const dateMs = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? dhaka(+m[1], +m[2] - 1, +m[3]) : null; };

export default function ActivityLog() {
  const { pdb, d, t, live } = useAdmin();
  const [ready, setReady] = useState(false);
  const [f, setF] = useState({ tab: 'all', q: '', who: '', store: '', range: '30', from: '', to: '' });
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(null);   // the row in the Sheet
  const first = useRef(true);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const next = { tab: 'all', q: '', who: '', store: '', range: '30', from: '', to: '' };
    for (const k of KEYS) if (p.get(k) != null) next[k] = p.get(k);
    if (next.tab !== 'all' && !CAT_LABEL[next.tab]) next.tab = 'all';
    setF(next); setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams();
    for (const k of KEYS) if (f[k] && !(k === 'tab' && f[k] === 'all') && !(k === 'range' && f[k] === '30')) p.set(k, f[k]);
    const s = p.toString();
    window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
    if (first.current) { first.current = false; return; }
    setPage(0);
  }, [ready, f]);
  const set = (k) => (v) => setF((o) => ({ ...o, [k]: v }));

  const all = live ? activityLog(pdb, d) : [];
  // date range
  const day0 = startOfDay(t);
  const [lo, hi] = f.range === 'today' ? [day0, Infinity] : f.range === '7' ? [day0 - 6 * DAY, Infinity] : f.range === '90' ? [day0 - 89 * DAY, Infinity]
    : f.range === 'custom' ? [dateMs(f.from) ?? -Infinity, dateMs(f.to) != null ? dateMs(f.to) + DAY : Infinity] : f.range === '30' ? [day0 - 29 * DAY, Infinity] : [-Infinity, Infinity];
  const s = f.q.trim().toLowerCase();
  const staffNames = new Set(PEOPLE.map((p) => p.name));
  const base = all.filter((r) => {
    if (r.at < lo || r.at >= hi) return false;
    if (f.who === OWNERS ? (staffNames.has(r.who) || r.who === 'System') : f.who && r.who !== f.who) return false;
    if (f.store && r.shopId !== f.store) return false;
    if (!s) return true;
    return [r.text, r.who, r.shopName || '', r.shopId ? '#' + r.shopId : '', r.ref || '', r.ip || ''].join(' ').toLowerCase().includes(s);
  });
  const counts = {};
  for (const r of base) counts[r.cat] = (counts[r.cat] || 0) + 1;
  const filtered = f.tab === 'all' ? base : base.filter((r) => r.cat === f.tab);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const rows = filtered.slice(pg * PAGE, pg * PAGE + PAGE);

  const tabs = [{ key: 'all', label: 'All', count: live ? base.length : null }, ...CATS.map(([k, l]) => ({ key: k, label: l, count: live ? counts[k] || 0 : null }))]
    .map((x) => ({ ...x, id: 'al-tab-' + x.key, on: f.tab === x.key, onClick: () => set('tab')(x.key) }));

  const whoNames = live ? [...new Set(all.map((r) => r.who))] : [];
  const whoOpts = [...PEOPLE.filter((p) => whoNames.includes(p.name)).map((p) => [p.name, p.name]), ['System', 'System'], [OWNERS, 'Merchant owners and teams']];
  const storeOpts = live ? pdb.shops.slice().sort((a, b) => a.name.localeCompare(b.name)).map((x) => [x.id, `${x.name} · #${x.id}`]) : [];
  const filters = [
    { key: 'who', label: 'Who', all: 'Anyone', value: f.who, options: whoOpts, onChange: set('who') },
    { key: 'store', label: 'Store', all: 'All stores', value: f.store, options: storeOpts, onChange: set('store') },
    { key: 'range', label: 'Date', value: f.range, empty: '30', options: RANGES, onChange: set('range') },
  ];
  const dates = f.range === 'custom' ? (
    <span className="al-dates">
      <input type="date" className="gc-input" aria-label="From" value={f.from} onChange={(e) => set('from')(e.target.value)} />
      <span className="ix-muted">to</span>
      <input type="date" className="gc-input" aria-label="To" value={f.to} onChange={(e) => set('to')(e.target.value)} />
    </span>
  ) : null;
  const filtersOn = !!s || !!f.who || !!f.store || f.range !== '30';
  const clear = () => setF((o) => ({ ...o, q: '', who: '', store: '', range: '30', from: '', to: '' }));

  const exportCsv = () => {
    if (!filtered.length) { toast('Nothing to export'); return; }
    downloadCsv(`gridcommerce-activity-${f.tab}.csv`, [
      ['Time', 'Who', 'What', 'Category', 'Store ID', 'Store', 'Source', 'Reference', 'IP', 'Device', 'Location'],
      ...filtered.map((r) => [dmy(r.at) + ' ' + hm(r.at), r.who, r.text, CAT_LABEL[r.cat], r.shopId ? '#' + r.shopId : '', r.shopName || '', r.src, r.ref || '', r.ip || '', r.device || '', r.city || '']),
    ]);
    recordExport(`activity log (${plural(filtered.length, 'row')}, CSV)`);
    toast(plural(filtered.length, 'row') + ' exported');
  };

  const tabLabel = f.tab === 'all' ? 'All activity' : CAT_LABEL[f.tab];
  const storeLink = (r) => (r.shopId ? <Link href={'/admin/merchant?id=' + r.shopId + '&tab=activity'} onClick={(e) => e.stopPropagation()}>{r.shopName || '#' + r.shopId}</Link> : <span className="ix-muted">—</span>);

  let body;
  if (!live) body = <Skeleton label="Loading the activity log" />;
  else body = (
    <section className="ix-card" aria-label={tabLabel}>
      <div className="ix-bar"><IndexTabs tabs={tabs} label="Activity categories" /></div>
      <div className="al-filters">
        <FilterBar label="Filter activity" filters={filters} more={dates} onClear={() => set('q')('')}
          search={{ value: f.q, onChange: set('q'), placeholder: 'Search what happened, who, store, reference or IP' }} />
      </div>
      {!filtered.length ? (
        <div className="ix-empty">
          {filtersOn ? <EmptyState title="Nothing matches these filters." actionLabel="Clear filters" onAction={clear} />
            : <EmptyState icon="history" title={`No ${tabLabel.toLowerCase()} in the last 30 days.`} actionLabel="Show any date" onAction={() => set('range')('all')} />}
        </div>
      ) : (
        <>
          <ul className="ix-plist" aria-label={tabLabel}>
            {rows.map((r) => (
              <li key={r.key}>
                <button type="button" className="ix-pitem" style={{ width: '100%', border: 0, background: 'none', textAlign: 'left', font: 'inherit' }} onClick={() => setOpen(r)}>
                  <span className="ix-pitem__top"><b>{r.who}</b><span className="al-time">{ago(r.at, t)}</span></span>
                  <span className="ix-pitem__mid">{r.text}</span>
                  <span className="ix-pitem__tags"><StatusBadge tone={CAT_TONE[r.cat]}>{CAT_LABEL[r.cat]}</StatusBadge>{r.shopName ? <span className="ix-pitem__mid">{r.shopName}</span> : null}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table gc-table--keep">
              <caption className="sr-only">{tabLabel}</caption>
              <thead><tr><th scope="col">Time</th><th scope="col">Who</th><th scope="col">What</th><th scope="col">Store</th><th scope="col">Category</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key} className="adx-click" tabIndex={0} onClick={() => setOpen(r)} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) setOpen(r); }}>
                    <td><span className="al-time" title={dmy(r.at) + ' ' + hm(r.at)}>{dm(r.at)} {hm(r.at)}</span></td>
                    <td><span className="al-who" title={r.who}>{r.who}</span></td>
                    <td><span className="al-what" title={r.text}>{r.text}</span></td>
                    <td><span className="al-store">{storeLink(r)}</span></td>
                    <td><StatusBadge tone={CAT_TONE[r.cat]}>{CAT_LABEL[r.cat]}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <Pager label={filtered.length ? `${pg * PAGE + 1}–${pg * PAGE + rows.length} of ${filtered.length}` : '0 entries'} atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
    </section>
  );

  const o = open;
  const ex = (o && o.extra) || {};
  return (
    <AdminShell active="activity" title="Activity log">
      <style dangerouslySetInnerHTML={{ __html: ADX_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="history" title="Activity log"
          about="Everything that happened on the platform and in the super admin, in one list: what merchants and their teams did, every change to a subscription, payment, credit, module or licence, what GridCommerce staff did, administrator sign-ins, role and settings changes, exports, PIN access to stores and security events."
          primary={{ label: 'Export', icon: 'download', onClick: exportCsv }} />
        {body}
      </div>

      <Sheet open={!!o} title="Activity" onClose={() => setOpen(null)}
        footer={<>
          {o && o.shopId ? <Link className="gc-btn gc-btn--neutral" href={'/admin/merchant?id=' + o.shopId + '&tab=activity'}>Open the store</Link> : null}
          <button type="button" className="gc-btn gc-btn--solid" onClick={() => setOpen(null)}>Done</button>
        </>}>
        {o ? (
          <div className="adx-form">
            <p className="al-text">{o.text}</p>
            <KV rows={[
              ['When', <span key="w" className="adx-fig">{dmy(o.at)} · {hm(o.at)}</span>],
              ['Who', o.who],
              ['Category', <StatusBadge key="c" tone={CAT_TONE[o.cat]}>{CAT_LABEL[o.cat]}</StatusBadge>],
              o.shopId ? ['Store', <Link key="s" href={'/admin/merchant?id=' + o.shopId}>{(o.shopName || 'Store') + ' · #' + o.shopId}</Link>] : null,
              ['Source', <span key="src">{o.src}{o.ref ? <> · <span className="adx-id">{o.ref}</span></> : null}</span>],
              ex.invoiceId ? ['Invoice', <Link key="i" href={'/admin/invoices/view?id=' + ex.invoiceId}>{ex.invoiceId}</Link>] : null,
              ex.adjId ? ['Adjustment', <Link key="a" href={'/admin/credits?id=' + ex.adjId}>{ex.adjId}</Link>] : null,
              o.ip ? ['IP address', <span key="ip" className="adx-fig">{o.ip}</span>] : null,
              o.device ? ['Device', o.device] : null,
              o.city ? ['Location', o.city + ', Bangladesh'] : null,
              ex.status ? ['Status', <StatusBadge key="st" tone={ex.status === 'open' ? 'warning' : 'success'}>{ex.status === 'open' ? 'Open' : 'Reviewed'}</StatusBadge>] : null,
            ]} />
            {o.cat === 'security' ? <p className="ix-muted" style={{ margin: 0, fontSize: 'var(--text-xs)' }}>Review or act on it in <Link href="/admin/security?tab=events">Security</Link>.</p> : null}
            {o.src === 'Platform event' ? <p className="ix-muted" style={{ margin: 0, fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 4 }}>Category worked out from the event’s text <InfoTip text="Platform events carry a kind (staff, owner, team, system, billing). The log sorts them into categories by what the text says; a real build stores the category with the event." /></p> : null}
          </div>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
