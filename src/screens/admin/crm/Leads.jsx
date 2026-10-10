'use client';
// Leads (/admin/leads) — GridCommerce's own sales leads (shops that might buy a subscription), laid out like the
// merchant panel's Leads & follow-ups list and the admin's Merchants list: the title row (Import, Export, Add lead),
// one card with the views as tabs (All · Mine · Follow-up · New · Won · Lost, counts on the tabs), search and
// filters (source, stage, salesperson, business type), a bulk bar (assign salesperson, move stage, export), the table
// (a two-line list on phones) and the pager. A row opens the lead (/admin/leads/view?id=).
// Data: lib/admin/crm.js (addLead, bulkAssign, bulkMove, parseImport, importLeads). The view, search and filters live
// in the address (?view=follow&src=Referral …), read after mount.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, EmptyState } from '@/components/ui';
import { FilterBar } from '@/components/ui/FilterBar';
import { ShopHeader, IndexTabs, Pager, Menu } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { dmy, num } from '@/lib/platform/util';
import {
  STAGES, SOURCES, TYPES, SALES_NAMES, stageOf, isOpen, followState, forecast, planLabel, bulkAssign, bulkMove, parseImport, importLeads,
} from '@/lib/admin/crm';
import { AdminShell } from '../AdminShell';
import {
  CRM_CSS, useCrm, money, plural, StageBadge, Who, whenText, nextText, FOLLOW_CLS, dateTime, LeadFormSheet, LostDialog, Field, ctl, STAGE_OPTIONS,
} from './crmShared';

const PAGE = 25;
const FILTER_KEYS = ['src', 'stage', 'owner', 'type'];
const VIEWS = [['all', 'All'], ['mine', 'Mine'], ['follow', 'Follow-up'], ['new', 'New'], ['won', 'Won'], ['lost', 'Lost']];
const SORTS = { created: 'Added', last: 'Last contact', next: 'Next follow-up', value: 'Expected' };

const CSS = `
.ld-filters{padding:8px;border-bottom:1px solid var(--border-subtle)}
.ld-filters .gc-filterbar__search{max-width:320px}
.ld-cell{display:flex;flex-direction:column;min-width:0;max-width:220px}
.ld-cell>a,.ld-cell>b,.ld-cell>span{overflow:hidden;text-overflow:ellipsis}
.ld-email{display:inline-block;max-width:200px;overflow:hidden;text-overflow:ellipsis;vertical-align:middle}
.ld-mods{text-decoration:underline dotted var(--border-strong);text-underline-offset:3px;cursor:help}
.ld-sort{display:inline-flex;align-items:center;gap:4px;padding:0;border:0;background:none;font:inherit;color:inherit;cursor:pointer}
.ld-sort:hover{color:var(--text-heading)}
.ld-sort:focus-visible{outline:2px solid var(--primary);outline-offset:2px;border-radius:var(--radius-sm)}
.ld-sort svg{opacity:.4}
.ld-sort.is-on svg{opacity:1;color:var(--primary)}
th.ix-num .ld-sort{flex-direction:row-reverse}
.ix-table tbody tr:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.ld-foot{display:inline-flex;flex-wrap:wrap;gap:4px var(--space-3)}
.ld-foot b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ld-ids{font-family:var(--font-data);color:var(--text-heading)}
.ld-paste{min-height:160px;font-family:var(--font-data);font-size:var(--text-xs)}
.ld-prev{max-height:340px;overflow:auto;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.ld-prev table{width:100%;border-collapse:collapse;font-size:var(--text-xs)}
.ld-prev th,.ld-prev td{padding:6px 8px;border-bottom:1px solid var(--border-subtle);text-align:left;vertical-align:top}
.ld-prev th{background:var(--surface-subtle);font-weight:var(--weight-medium)}
.ld-prev tr.is-bad td{background:var(--fill-error-soft)}
.ld-prev .ld-why{color:var(--text-danger)}
.ld-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
@media (max-width:640px){.ld-filters{padding:6px}}
`;

const SAMPLE = `name,business,mobile,email,source,type,category,orders,modules
Mahfuzur Rahman,Rahman Telecom,01712-404040,mahfuz.telecom@gmail.com,Trade fair,Retail,Mobile & gadgets,900,POS;Warranty;Loyalty
Sanjida Akter,Sanjida's Closet,01933-121212,,Facebook Ads,Online,Fashion,420,Online orders;Courier and COD;Landing pages
Abul Kalam,Kalam Traders,01818-777000,,Direct call,Wholesale,Grocery,150,Purchasing;Wholesale dues`;

function fromUrl() {
  const p = new URLSearchParams(window.location.search);
  const view = VIEWS.some(([k]) => k === p.get('view')) ? p.get('view') : 'all';
  const f = {};
  for (const k of FILTER_KEYS) f[k] = p.get(k) || '';
  const [sk, sd] = String(p.get('sort') || '').split('-');
  const sort = SORTS[sk] ? { key: sk, dir: sd === 'asc' ? 'asc' : 'desc' } : null;
  return { view, q: p.get('q') || '', f, sort };
}
function toUrl({ view, q, f, sort }) {
  const p = new URLSearchParams();
  if (view !== 'all') p.set('view', view);
  if (q.trim()) p.set('q', q.trim());
  for (const k of FILTER_KEYS) if (f[k]) p.set(k, f[k]);
  if (sort) p.set('sort', sort.key + '-' + sort.dir);
  const s = p.toString();
  window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
}

const csvRows = (rows) => [
  ['Lead ID', 'Name', 'Business', 'Mobile', 'Email', 'Source', 'Business type', 'Category', 'District', 'Current software', 'Orders a month', 'Interested modules', 'Package', 'Expected (BDT a month)', 'Salesperson', 'Stage', 'Lost reason', 'Added', 'Last contact', 'Next follow-up', 'Merchant ID'],
  ...rows.map((l) => [l.id, l.name, l.business, l.mobile, l.email, l.source, l.type, l.category, l.district, l.software, l.orders, l.modules.join('; '), planLabel(l.ladder, l.plan), l.value, l.owner, stageOf(l.stage).label, l.lostReason || '', dmy(l.createdAt), l.lastContact ? dateTime(l.lastContact) : '', l.next && isOpen(l) ? dateTime(l.next.at) + ' · ' + l.next.what : '', l.merchantId ? '#' + l.merchantId : '']),
];

export default function Leads() {
  const router = useRouter();
  const { leads, t, live, me } = useCrm();
  const [ready, setReady] = useState(false);
  const [view, setView] = useState('all');
  const [q, setQ] = useState('');
  const [f, setF] = useState({ src: '', stage: '', owner: '', type: '' });
  const [sort, setSort] = useState(null);           // null = the view's own order
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState(() => new Set());
  const [adding, setAdding] = useState(false);
  const [assign, setAssign] = useState(null);       // { owner, error }
  const [move, setMove] = useState(null);           // { stage, error }
  const [lostAsk, setLostAsk] = useState(false);
  const [imp, setImp] = useState(null);             // { text, owner, parsed, error }
  const first = useRef(true);

  useEffect(() => { const s = fromUrl(); setView(s.view); setQ(s.q); setF(s.f); setSort(s.sort); setReady(true); }, []);
  useEffect(() => {
    if (!ready) return;
    toUrl({ view, q, f, sort });
    if (first.current) { first.current = false; return; }
    setPage(0);
  }, [ready, view, q, f, sort]);

  const inView = (l, v) => {
    if (v === 'mine') return l.owner === me;
    if (v === 'follow') { const s = followState(l, t); return s === 'overdue' || s === 'today'; }
    if (v === 'new') return l.stage === 'new';
    if (v === 'won') return l.stage === 'won';
    if (v === 'lost') return l.stage === 'lost';
    return true;
  };
  const counts = {};
  for (const [k] of VIEWS) counts[k] = live ? leads.filter((l) => inView(l, k)).length : null;

  const s = q.trim().toLowerCase();
  const dg = s.replace(/\D/g, '');
  const filtered = (() => {
    const out = leads.filter((l) => {
      if (!inView(l, view)) return false;
      if (f.src && l.source !== f.src) return false;
      if (f.stage && l.stage !== f.stage) return false;
      if (f.owner && l.owner !== f.owner) return false;
      if (f.type && l.type !== f.type) return false;
      if (!s) return true;
      if ([l.name, l.business, l.id, l.email, l.district, l.category].join(' ').toLowerCase().includes(s)) return true;
      return dg.length >= 3 && l.mobile.replace(/\D/g, '').includes(dg);
    });
    const key = sort ? sort.key : view === 'follow' ? 'next' : 'created';
    const dir = sort ? (sort.dir === 'asc' ? 1 : -1) : view === 'follow' ? 1 : -1;
    const val = (l) => (key === 'last' ? l.lastContact : key === 'next' ? (l.next && isOpen(l) ? l.next.at : null) : key === 'value' ? l.value : l.createdAt);
    return out.sort((a, b) => {
      const x = val(a), y = val(b);
      if (x == null && y == null) return b.createdAt - a.createdAt;
      if (x == null) return 1;
      if (y == null) return -1;
      return (x - y) * dir || b.createdAt - a.createdAt;
    });
  })();

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const rows = filtered.slice(pg * PAGE, pg * PAGE + PAGE);
  const fc = forecast(filtered);

  const selRows = filtered.filter((l) => sel.has(l.id));
  const allOnPage = rows.length > 0 && rows.every((l) => sel.has(l.id));
  const toggle = (id) => setSel((o) => { const n = new Set(o); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAll = () => setSel((o) => { const n = new Set(o); if (allOnPage) rows.forEach((l) => n.delete(l.id)); else rows.forEach((l) => n.add(l.id)); return n; });
  const clearSel = () => setSel(new Set());

  const filtersOn = !!s || FILTER_KEYS.some((k) => f[k]);
  const clearFilters = () => { setQ(''); setF({ src: '', stage: '', owner: '', type: '' }); };
  const setFilter = (k) => (v) => setF((o) => ({ ...o, [k]: v }));
  const open = (id) => router.push('/admin/leads/view?id=' + id);
  const viewLabel = (VIEWS.find(([k]) => k === view) || [])[1] || 'All';

  const sortBy = (key) => setSort((o) => (o && o.key === key ? { key, dir: o.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'next' ? 'asc' : 'desc' }));
  const sortHead = (k, num2) => {
    const on = sort ? sort.key === k : (view === 'follow' ? k === 'next' : false);
    const dir = sort ? sort.dir : 'asc';
    return (
      <th scope="col" className={num2 ? 'ix-num' : undefined} aria-sort={on ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
        <button type="button" className={'ld-sort' + (on ? ' is-on' : '')} onClick={() => sortBy(k)} aria-label={`Sort by ${SORTS[k].toLowerCase()}`}>
          {SORTS[k]}<Icon name={on && dir === 'asc' ? 'arrow-up' : 'arrow-down'} width="14" height="14" aria-hidden="true" />
        </button>
      </th>
    );
  };

  // ---- actions ----
  const exportCsv = (which, name) => {
    if (!which.length) { toast('Nothing to export'); return; }
    downloadCsv(name, csvRows(which));
    toast(plural(which.length, 'lead') + ' exported');
  };
  const doAssign = () => {
    const res = bulkAssign(selRows.map((l) => l.id), assign.owner);
    if (!res.ok) { setAssign({ ...assign, error: res.error }); return; }
    setAssign(null); clearSel();
    toast(res.n ? `${assign.owner} now has ${plural(res.n, 'more lead')}` : 'They already had these leads');
  };
  const doMove = (reason) => {
    const stage = move.stage;
    if (!stage) { setMove({ ...move, error: 'Pick a stage.' }); return; }
    if (stage === 'lost' && !reason) { setLostAsk(true); return; }
    const res = bulkMove(selRows.map((l) => l.id), stage, reason);
    if (!res.ok) { setMove({ ...move, error: res.error }); return; }
    setMove(null); setLostAsk(false); clearSel();
    toast(`${plural(res.n, 'lead')} moved to ${stageOf(stage).label}${res.skipped ? ` · ${res.skipped} skipped (already there or already a store)` : ''}`);
  };
  const preview = () => {
    const parsed = parseImport(imp.text, leads);
    setImp({ ...imp, parsed: parsed.error ? null : parsed.rows, error: parsed.error });
  };
  const doImport = () => {
    const good = (imp.parsed || []).filter((r) => !r.error);
    if (!good.length) { setImp({ ...imp, error: 'No row is ready to add. Fix the rows in red, or paste again.' }); return; }
    const res = importLeads(good, { owner: imp.owner });
    if (!res.ok) { setImp({ ...imp, error: res.error }); return; }
    setImp(null);
    setView('new');
    toast(`${plural(res.added, 'lead')} imported for ${imp.owner}${res.skipped.length ? ` · ${res.skipped.length} skipped` : ''}`);
  };

  const tabs = VIEWS.map(([k, label]) => ({ key: k, id: 'ld-tab-' + k, label, count: counts[k], on: view === k, onClick: () => setView(k) }));
  const filters = [
    { key: 'src', label: 'Source', all: 'All sources', value: f.src, options: SOURCES.map((x) => [x, x]), onChange: setFilter('src') },
    { key: 'stage', label: 'Stage', all: 'All stages', value: f.stage, options: STAGE_OPTIONS, onChange: setFilter('stage') },
    { key: 'owner', label: 'Salesperson', all: 'All salespeople', value: f.owner, options: SALES_NAMES.map((x) => [x, x]), onChange: setFilter('owner') },
    { key: 'type', label: 'Business type', all: 'All types', value: f.type, options: TYPES.map((x) => [x, x]), onChange: setFilter('type') },
  ];

  let body;
  if (!live) {
    body = <div className="crm-skel" aria-busy="true" aria-label="Loading leads" />;
  } else {
    const footLabel = (
      <span className="ld-foot">
        <span>{filtered.length ? `${pg * PAGE + 1}–${pg * PAGE + rows.length} of ${filtered.length}` : '0 leads'}</span>
        {fc.count ? <span>Open <b>{money(fc.value)}</b>/mo</span> : null}
        {fc.count ? <span>Weighted <b>{money(fc.weighted)}</b>/mo</span> : null}
      </span>
    );
    body = (
      <section className="ix-card" aria-label={viewLabel + ' leads'}>
        {selRows.length ? (
          <div className="ix-bulk" role="toolbar" aria-label="Selected leads">
            <input type="checkbox" checked={allOnPage} onChange={toggleAll} aria-label="Select every lead on this page" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
            <span className="ix-bulk__n">{selRows.length} selected</span>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => setAssign({ owner: '' })}><Icon name="user-round-check" width="16" height="16" aria-hidden="true" />Assign salesperson</button>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => setMove({ stage: '' })}><Icon name="arrow-right-left" width="16" height="16" aria-hidden="true" />Move stage</button>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => exportCsv(selRows, 'gridcommerce-leads-selected.csv')}><Icon name="download" width="16" height="16" aria-hidden="true" />Export</button>
            <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" align="start" items={[{ label: 'Clear selection', onClick: clearSel }]} />
          </div>
        ) : (
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Lead views" /></div>
        )}
        <div className="ld-filters">
          <FilterBar label="Filter leads" filters={filters} onClear={() => setQ('')}
            search={{ value: q, onChange: setQ, placeholder: 'Search name, business, ID, mobile or email' }} />
        </div>

        {!filtered.length ? (
          <div className="ix-empty">
            {filtersOn
              ? <EmptyState title="No leads match these filters." actionLabel="Clear filters" onAction={clearFilters} />
              : view === 'follow' ? <EmptyState icon="calendar-check" title="No follow-ups due today." actionLabel="Show all leads" onAction={() => setView('all')} />
                : <EmptyState icon="target" title={`No leads in ${viewLabel}.`} actionLabel="Add lead" onAction={() => setAdding(true)} />}
          </div>
        ) : (
          <>
            <ul className="ix-plist" aria-label={viewLabel + ' leads'}>
              {rows.map((l) => {
                const fs = followState(l, t);
                return (
                  <li key={l.id}>
                    <Link href={'/admin/leads/view?id=' + l.id} className="ix-pitem">
                      <span className="ix-pitem__top"><b>{l.business}</b><span className="crm-fig">{money(l.value)}/mo</span></span>
                      <span className="ix-pitem__mid">{l.name} · {l.mobile} · {l.owner.split(' ')[0]}</span>
                      <span className="ix-pitem__tags">
                        <StageBadge stage={l.stage} />
                        {l.next && isOpen(l) ? <span className={'ix-pitem__mid ' + (FOLLOW_CLS[fs] || '')}>Next {nextText(l, t)}</span> : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">{viewLabel} leads</caption>
                <thead>
                  <tr>
                    <th scope="col" className="ix-check"><input type="checkbox" checked={allOnPage} onChange={toggleAll} aria-label="Select every lead on this page" /></th>
                    <th scope="col">Lead</th>
                    <th scope="col">Business</th>
                    <th scope="col">Mobile</th>
                    <th scope="col">Email</th>
                    <th scope="col">Source</th>
                    <th scope="col">Business type</th>
                    <th scope="col">Current software</th>
                    <th scope="col" className="ix-num">Orders/mo</th>
                    <th scope="col" className="ix-num">Modules</th>
                    {sortHead('value', true)}
                    <th scope="col">Salesperson</th>
                    <th scope="col">Status</th>
                    {sortHead('last')}
                    {sortHead('next')}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((l) => {
                    const fs = followState(l, t);
                    return (
                      <tr key={l.id} className={sel.has(l.id) ? 'is-sel' : ''} tabIndex={0}
                        onClick={() => open(l.id)} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) open(l.id); }}>
                        <td className="ix-check" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={sel.has(l.id)} onChange={() => toggle(l.id)} aria-label={'Select ' + l.business} /></td>
                        <td><span className="ld-cell"><Link href={'/admin/leads/view?id=' + l.id} className="ix-strong" onClick={(e) => e.stopPropagation()}>{l.name}</Link><span className="crm-sub ix-id">{l.id}</span></span></td>
                        <td><span className="ld-cell"><span>{l.business}</span><span className="crm-sub">{l.district}</span></span></td>
                        <td className="crm-data">{l.mobile}</td>
                        <td className="ix-muted"><span className="ld-email" title={l.email || undefined}>{l.email || '—'}</span></td>
                        <td className="ix-muted">{l.source}</td>
                        <td><span className="ld-cell"><span>{l.type}</span><span className="crm-sub">{l.category}</span></span></td>
                        <td className="ix-muted">{l.software}</td>
                        <td className="ix-num crm-data">{num(l.orders)}</td>
                        <td className="ix-num"><span className="ld-mods crm-data" title={l.modules.join(', ') || 'None picked'}>{l.modules.length}</span></td>
                        <td className="ix-num"><span className="ld-cell" style={{ alignItems: 'flex-end' }}><span className="crm-fig">{money(l.value)}</span><span className="crm-sub">{planLabel(l.ladder, l.plan)}</span></span></td>
                        <td><Who name={l.owner} /></td>
                        <td><StageBadge stage={l.stage} /></td>
                        <td className="ix-muted">{whenText(l.lastContact, t)}</td>
                        <td className={FOLLOW_CLS[fs] || 'ix-muted'}>{l.next && isOpen(l) ? nextText(l, t) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        <Pager label={footLabel} atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
      </section>
    );
  }

  const good = imp && imp.parsed ? imp.parsed.filter((r) => !r.error).length : 0;

  return (
    <AdminShell active="leads" title="Leads">
      <style dangerouslySetInnerHTML={{ __html: CRM_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="target" title="Leads"
          about="Shops and businesses that might buy GridCommerce: where they came from, what they need, the package they would take and who is selling to them. Open a lead to log a call, book a demo, send a quotation or convert it into a merchant."
          secondary={[{ label: 'Import', icon: 'upload', onClick: () => setImp({ text: '', owner: SALES_NAMES.includes(me) ? me : SALES_NAMES[0], parsed: null, error: null }) }, { label: 'Export', icon: 'download', onClick: () => exportCsv(filtered, `gridcommerce-leads-${view}.csv`) }]}
          more={[{ label: 'Pipeline board', href: '/admin/pipeline' }]}
          primary={{ label: 'Add lead', icon: 'plus', onClick: () => setAdding(true) }} />
        {body}
      </div>

      <LeadFormSheet open={adding} me={me} t={t} onClose={() => setAdding(false)} onDone={(l) => router.push('/admin/leads/view?id=' + l.id)} />

      <Sheet open={!!assign} title="Assign salesperson" onClose={() => setAssign(null)} footer={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setAssign(null)}>Cancel</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={doAssign}>Assign</button>
      </>}>
        {assign ? (
          <div className="crm-form">
            <p style={{ margin: 0 }}>{plural(selRows.length, 'lead')}: <span className="ld-ids">{selRows.slice(0, 6).map((l) => l.id).join(', ')}{selRows.length > 6 ? ' …' : ''}</span></p>
            <Field id="ld-assign" label="Salesperson" error={assign.error}>
              <select id="ld-assign" {...ctl(assign.error, true)} data-autofocus value={assign.owner} onChange={(e) => setAssign({ owner: e.target.value })}>
                <option value="">Choose a person</option>
                {SALES_NAMES.map((n) => <option key={n}>{n}</option>)}
              </select>
            </Field>
          </div>
        ) : null}
      </Sheet>

      <Sheet open={!!move && !lostAsk} title="Move stage" onClose={() => setMove(null)} footer={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setMove(null)}>Cancel</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={() => doMove()}>Move</button>
      </>}>
        {move ? (
          <div className="crm-form">
            <p style={{ margin: 0 }}>{plural(selRows.length, 'lead')}: <span className="ld-ids">{selRows.slice(0, 6).map((l) => l.id).join(', ')}{selRows.length > 6 ? ' …' : ''}</span></p>
            <Field id="ld-move" label="Move to" error={move.error} hint="Leads that are already stores stay Won.">
              <select id="ld-move" {...ctl(move.error, true)} data-autofocus value={move.stage} onChange={(e) => setMove({ stage: e.target.value })}>
                <option value="">Choose a stage</option>
                {STAGES.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
              </select>
            </Field>
          </div>
        ) : null}
      </Sheet>
      <LostDialog open={lostAsk} title={'Mark ' + plural(selRows.length, 'lead') + ' lost'} onClose={() => setLostAsk(false)} onConfirm={(reason) => doMove(reason)} />

      <Sheet open={!!imp} title="Import leads" onClose={() => setImp(null)} footer={imp && imp.parsed ? <>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setImp({ ...imp, parsed: null, error: null })}>Back</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={doImport} disabled={!good}>{good ? `Add ${plural(good, 'lead')}` : 'Nothing to add'}</button>
      </> : <>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setImp(null)}>Cancel</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={preview}>Preview</button>
      </>}>
        {imp ? (
          imp.parsed ? (
            <div className="crm-form">
              <p style={{ margin: 0 }}>{good} of {imp.parsed.length} rows are ready{imp.parsed.length > good ? '; the rows in red are skipped' : ''}. They go to <b>{imp.owner}</b> with a first call tomorrow.</p>
              <div className="ld-prev">
                <table>
                  <thead><tr><th scope="col">Line</th><th scope="col">Name</th><th scope="col">Business</th><th scope="col">Mobile</th><th scope="col">Source</th></tr></thead>
                  <tbody>
                    {imp.parsed.map((r) => (
                      <React.Fragment key={r.line}>
                        <tr className={r.error ? 'is-bad' : ''}>
                          <td className="crm-data">{r.line}</td><td>{r.data.name || '—'}</td><td>{r.data.business || '—'}</td><td className="crm-data">{r.data.mobile || '—'}</td><td>{r.data.source}</td>
                        </tr>
                        {r.error ? <tr className="is-bad"><td /><td colSpan={4} className="ld-why">{r.error}</td></tr> : null}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
              {imp.error ? <p className="crm-formerr" role="alert">{imp.error}</p> : null}
            </div>
          ) : (
            <div className="crm-form">
              <Field id="ld-imp" label="Paste rows from a sheet (CSV)" error={imp.error} hint="First line: the column names. Needs name, business and mobile; can add email, source, type, category, district, software, orders, modules (separated by ;).">
                <textarea id="ld-imp" className={'gc-input ld-paste' + (imp.error ? ' gc-input--error' : '')} data-autofocus value={imp.text} onChange={(e) => setImp({ ...imp, text: e.target.value, error: null })} spellCheck={false} />
              </Field>
              <div className="ld-row"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setImp({ ...imp, text: SAMPLE, error: null })}>Use a sample</button></div>
              <Field id="ld-imp-owner" label="Give them to">
                <select id="ld-imp-owner" className="gc-input gc-select" value={imp.owner} onChange={(e) => setImp({ ...imp, owner: e.target.value })}>{SALES_NAMES.map((n) => <option key={n}>{n}</option>)}</select>
              </Field>
            </div>
          )
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
