'use client';
// Tickets (/admin/tickets) — GridCommerce's support desk for its merchants. Adapted from the merchant panel's ticket
// desk (screens/support-tickets/SupportTickets.jsx): the title row (New ticket, Export), then one card with the views
// as tabs (counts on the tabs, no figure cards), search and filters, a bulk bar (assign, change status, merge), a
// compact table (a two-line list on phones) and the pager. A row opens the ticket (/admin/tickets/view?id=).
// Data: lib/admin/support.js (tickets, slaOf, addTicket, assign, setStatus, merge) and the platform's stores (names).
// The view, search and filters live in the address (?view=us&cat=Billing&merchant=0031 …), read after mount;
// ?ticket=T-2291 opens that ticket; ?new=1 (&merchant=0031) opens the New ticket panel.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, EmptyState } from '@/components/ui';
import { FilterBar } from '@/components/ui/FilterBar';
import { ShopHeader, IndexTabs, Pager, Menu } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { dmy, hm } from '@/lib/platform/util';
import { staff as currentStaff } from '@/lib/platform/store';
import { useAdminStore } from '@/lib/admin/store';
import {
  supportStore, VIEWS, CATEGORIES, PRIORITIES, CHANNELS, STATUSES, DESK, TECH, CHANNEL_ICON,
  inView, viewCounts, isActive, slaOf, addTicket, assign, setStatus, merge,
} from '@/lib/admin/support';
import { AdminShell, usePlatform } from '../AdminShell';
import { SUPPORT_CSS, SlaTag, StatusTag, PriorityTag, Who, Field, ctl, when, plural } from './supportShared';

const PAGE = 20;
const NONE = '__none';
const FILTER_KEYS = ['cat', 'pri', 'agent', 'ch'];

const CSS = `
.tk-filters{padding:8px;border-bottom:1px solid var(--border-subtle)}
.tk-filters .gc-filterbar__search{max-width:320px}
.tk-subj{display:flex;flex-direction:column;min-width:0;max-width:320px}
.tk-subj a{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tk-subj small,.tk-mer small{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);color:var(--text-muted)}
.tk-mer{display:flex;flex-direction:column;min-width:0;max-width:200px}
.tk-mer span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tk-mer small{font-family:var(--font-data)}
.ix-table tbody tr:focus-visible td{background:var(--surface-subtle)}
.ix-table tbody tr:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.tk-foot{display:inline-flex;flex-wrap:wrap;gap:4px var(--space-3)}
.tk-foot b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.tk-foot .is-bad b{color:var(--text-danger)}
.tk-shopchip{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3) 0;font-size:var(--text-sm)}
.tk-pick{display:flex;flex-direction:column;gap:6px}
.tk-ids{font-family:var(--font-data);color:var(--text-heading)}
@media (max-width:640px){.tk-filters{padding:6px}}
`;

function fromUrl() {
  const p = new URLSearchParams(window.location.search);
  const view = VIEWS.some(([k]) => k === p.get('view')) ? p.get('view') : 'open';
  const f = {};
  for (const k of FILTER_KEYS) f[k] = p.get(k) || '';
  return { view, q: p.get('q') || '', f, merchant: (p.get('merchant') || '').replace(/\D/g, '').slice(0, 4), ticket: p.get('ticket') || '', newOne: p.get('new') === '1' };
}
function toUrl({ view, q, f, merchant }) {
  const p = new URLSearchParams();
  if (view !== 'open') p.set('view', view);
  if (q.trim()) p.set('q', q.trim());
  for (const k of FILTER_KEYS) if (f[k]) p.set(k, f[k]);
  if (merchant) p.set('merchant', merchant);
  const s = p.toString();
  window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
}

const csvRows = (rows, name, t) => [
  ['Ticket', 'Merchant ID', 'Merchant', 'Subject', 'Category', 'Priority', 'Channel', 'Agent', 'Status', 'Created', 'First reply', 'Solved', 'SLA', 'Rating', 'Incident'],
  ...rows.map((x) => [x.id, '#' + x.shopId, name(x.shopId), x.subject, x.category, x.priority, x.channel, x.agent || '', x.status,
    dmy(x.createdAt) + ' ' + hm(x.createdAt), x.firstReplyAt ? dmy(x.firstReplyAt) + ' ' + hm(x.firstReplyAt) : '', x.solvedAt ? dmy(x.solvedAt) + ' ' + hm(x.solvedAt) : '',
    slaOf(x, t).text, x.rating || '', x.incident || '']),
];

/** Active tickets by how soon their SLA runs out (breached first, paused last); solved ones newest first. */
function order(list, t) {
  return list.slice().sort((a, b) => {
    const aa = isActive(a), ba = isActive(b);
    if (aa !== ba) return aa ? -1 : 1;
    if (!aa) return (b.solvedAt || b.updatedAt) - (a.solvedAt || a.updatedAt);
    const sa = slaOf(a, t), sb = slaOf(b, t);
    if (sa.paused !== sb.paused) return sa.paused ? 1 : -1;
    return sa.left - sb.left;
  });
}

const BLANK = { shopId: '', shopQ: '', subject: '', category: '', priority: 'Normal', channel: 'Phone', agent: '', message: '', files: [], errors: {} };

export default function Tickets() {
  const router = useRouter();
  const { db, live: plive } = usePlatform();
  const { data, t, live: slive } = useAdminStore(supportStore);
  const live = plive && slive;
  const me = currentStaff().name;
  const [ready, setReady] = useState(false);
  const [view, setView] = useState('open');
  const [q, setQ] = useState('');
  const [f, setF] = useState({ cat: '', pri: '', agent: '', ch: '' });
  const [merchant, setMerchant] = useState('');
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState(() => new Set());
  const [create, setCreate] = useState(null);   // the New ticket form while open
  const [bulk, setBulk] = useState(null);       // { kind: 'assign'|'status'|'merge', … }
  const first = useRef(true);

  useEffect(() => {
    const s = fromUrl();
    if (s.ticket) { router.replace('/admin/tickets/view?id=' + encodeURIComponent(s.ticket.toUpperCase())); return; }
    setView(s.view); setQ(s.q); setF(s.f); setMerchant(s.merchant); setReady(true);
    if (s.newOne) setCreate({ ...BLANK, shopId: s.merchant || '' });
  }, [router]);
  useEffect(() => {
    if (!ready) return;
    toUrl({ view, q, f, merchant });
    if (first.current) { first.current = false; return; }
    setPage(0);
  }, [ready, view, q, f, merchant]);

  const shops = db.shops || [];
  const shopName = (id) => (shops.find((s) => s.id === id) || {}).name || '#' + id;
  const all = live ? data.tickets.filter((x) => !merchant || x.shopId === merchant) : [];
  const counts = live ? viewCounts(all, me) : {};

  const s = q.trim().toLowerCase();
  const filtered = order(all.filter((x) => {
    if (!inView(x, view, me)) return false;
    if (f.cat && x.category !== f.cat) return false;
    if (f.pri && x.priority !== f.pri) return false;
    if (f.agent && (f.agent === NONE ? x.agent : x.agent !== f.agent)) return false;
    if (f.ch && x.channel !== f.ch) return false;
    if (!s) return true;
    return [x.id, x.subject, x.shopId, '#' + x.shopId, shopName(x.shopId), x.category, x.agent || '', x.incident || ''].join(' ').toLowerCase().includes(s);
  }), t);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const rows = filtered.slice(pg * PAGE, pg * PAGE + PAGE);
  const breached = filtered.filter((x) => isActive(x) && slaOf(x, t).breached).length;

  const selRows = filtered.filter((x) => sel.has(x.id));
  const allOnPage = rows.length > 0 && rows.every((x) => sel.has(x.id));
  const toggle = (id) => setSel((old) => { const n = new Set(old); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAll = () => setSel((old) => { const n = new Set(old); if (allOnPage) rows.forEach((x) => n.delete(x.id)); else rows.forEach((x) => n.add(x.id)); return n; });
  const clearSel = () => setSel(new Set());

  const filtersOn = !!s || FILTER_KEYS.some((k) => f[k]);
  const clearFilters = () => { setQ(''); setF({ cat: '', pri: '', agent: '', ch: '' }); };
  const setFilter = (k) => (v) => setF((old) => ({ ...old, [k]: v }));
  const open = (id) => router.push('/admin/tickets/view?id=' + id);
  const viewLabel = (VIEWS.find(([k]) => k === view) || [])[1] || 'Open';

  // ---- actions ----
  const exportCsv = (which, name) => {
    if (!which.length) { toast('Nothing to export'); return; }
    downloadCsv(name, csvRows(which, shopName, t));
    toast(plural(which.length, 'ticket') + ' exported');
  };
  const doCreate = () => {
    const res = addTicket({ ...create, agent: create.agent === NONE ? '' : create.agent });
    if (!res.ok) { setCreate({ ...create, errors: { [res.field || 'form']: res.error } }); return; }
    setCreate(null);
    toast(res.id + ' opened');
    router.push('/admin/tickets/view?id=' + res.id);
  };
  const doBulk = () => {
    const ids = selRows.map((x) => x.id);
    if (bulk.kind === 'assign') {
      if (!bulk.agent) { setBulk({ ...bulk, error: 'Pick a person.' }); return; }
      const res = assign(ids, bulk.agent === NONE ? null : bulk.agent);
      if (!res.ok) { setBulk({ ...bulk, error: res.error }); return; }
      toast(res.n ? (bulk.agent === NONE ? `${plural(res.n, 'ticket')} unassigned` : `${plural(res.n, 'ticket')} assigned to ${bulk.agent}`) : 'Nothing changed');
    } else if (bulk.kind === 'status') {
      if (!bulk.status) { setBulk({ ...bulk, error: 'Pick a status.' }); return; }
      const res = setStatus(ids, bulk.status, bulk.note);
      if (!res.ok) { setBulk({ ...bulk, error: res.error }); return; }
      toast(res.n ? `${plural(res.n, 'ticket')} moved to ${bulk.status}` : 'Nothing changed');
    } else {
      const res = merge(ids, bulk.into);
      if (!res.ok) { setBulk({ ...bulk, error: res.error }); return; }
      toast(`${plural(res.n, 'ticket')} merged into ${bulk.into}`);
    }
    setBulk(null);
    clearSel();
  };
  const startMerge = () => {
    if (selRows.length < 2) { toast('Pick at least two tickets to merge'); return; }
    if (new Set(selRows.map((x) => x.shopId)).size > 1) { toast('Only tickets from the same merchant can be merged'); return; }
    const oldest = selRows.slice().sort((a, b) => a.createdAt - b.createdAt)[0];
    setBulk({ kind: 'merge', into: oldest.id });
  };

  const tabs = VIEWS.map(([k, label]) => ({ key: k, id: 'tk-tab-' + k, label, count: live ? counts[k] || 0 : null, on: view === k, onClick: () => setView(k) }));
  const filters = [
    { key: 'cat', label: 'Category', all: 'All categories', value: f.cat, options: CATEGORIES.map((x) => [x, x]), onChange: setFilter('cat') },
    { key: 'pri', label: 'Priority', all: 'All priorities', value: f.pri, options: PRIORITIES.slice().reverse().map((x) => [x, x]), onChange: setFilter('pri') },
    { key: 'agent', label: 'Agent', all: 'All agents', value: f.agent, options: [...DESK.map((x) => [x, x]), [NONE, 'Unassigned']], onChange: setFilter('agent') },
    { key: 'ch', label: 'Channel', all: 'All channels', value: f.ch, options: CHANNELS.map((x) => [x, x]), onChange: setFilter('ch') },
  ];

  const header = (
    <ShopHeader icon="life-buoy" title="Tickets"
      about="Every support ticket from GridCommerce's merchants. Tabs split the desk by who has to act; the SLA column shows the time left for the first reply (urgent 30 min, high 2 h, normal 8 h, low 24 h) and then for solving it. Open a ticket to reply, add an internal note, escalate to Technical or solve it."
      secondary={[{ label: 'Export', icon: 'download', onClick: () => exportCsv(filtered, `gridcommerce-tickets-${view}.csv`) }]}
      more={[{ label: 'Support performance', href: '/admin/support-performance' }]}
      primary={{ label: 'New ticket', icon: 'plus', onClick: () => setCreate({ ...BLANK, shopId: merchant || '' }) }} />
  );

  let body;
  if (!live) {
    body = <div className="sp-skel" aria-busy="true" aria-label="Loading tickets" />;
  } else {
    const footLabel = (
      <span className="tk-foot">
        <span>{filtered.length ? `${pg * PAGE + 1}–${pg * PAGE + rows.length} of ${filtered.length}` : '0 tickets'}</span>
        {breached ? <span className="is-bad">Past SLA <b>{breached}</b></span> : null}
      </span>
    );
    body = (
      <section className="ix-card" aria-label={viewLabel + ' tickets'}>
        {selRows.length ? (
          <div className="ix-bulk" role="toolbar" aria-label="Selected tickets">
            <input type="checkbox" checked={allOnPage} onChange={toggleAll} aria-label="Select every ticket on this page" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
            <span className="ix-bulk__n">{selRows.length} selected</span>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => setBulk({ kind: 'assign', agent: '' })}><Icon name="user-round-check" width="16" height="16" aria-hidden="true" />Assign</button>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => setBulk({ kind: 'status', status: '', note: '' })}><Icon name="refresh-cw" width="16" height="16" aria-hidden="true" />Change status</button>
            <button type="button" className="ix-btn ix-btn--sm" onClick={startMerge}><Icon name="merge" width="16" height="16" aria-hidden="true" />Merge</button>
            <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" align="start" items={[
              { label: 'Export selected', onClick: () => exportCsv(selRows, 'gridcommerce-tickets-selected.csv') },
              { label: 'Clear selection', onClick: clearSel },
            ]} />
          </div>
        ) : (
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Ticket views" /></div>
        )}
        {merchant ? (
          <div className="tk-shopchip">
            <span>Merchant: <Link href={'/admin/merchant?id=' + merchant + '&tab=support'} className="ix-strong">{shopName(merchant)}</Link> <span className="sp-data sp-muted">#{merchant}</span></span>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => setMerchant('')}><Icon name="x" width="14" height="14" aria-hidden="true" />All merchants</button>
          </div>
        ) : null}
        <div className="tk-filters">
          <FilterBar label="Filter tickets" filters={filters} onClear={() => setQ('')}
            search={{ value: q, onChange: setQ, placeholder: 'Search ticket, subject, merchant or incident' }} />
        </div>

        {!filtered.length ? (
          <div className="ix-empty">
            {filtersOn
              ? <EmptyState title="No tickets match these filters." actionLabel="Clear filters" onAction={clearFilters} />
              : view === 'mine'
                ? <EmptyState icon="inbox" title="Nothing is assigned to you." actionLabel="Show unassigned" onAction={() => setView('unassigned')} />
                : <EmptyState icon="life-buoy" title={`No tickets in ${viewLabel}.`} actionLabel="Show open tickets" onAction={() => setView('open')} />}
          </div>
        ) : (
          <>
            <ul className="ix-plist" aria-label={viewLabel + ' tickets'}>
              {rows.map((x) => (
                <li key={x.id}>
                  <Link href={'/admin/tickets/view?id=' + x.id} className="ix-pitem">
                    <span className="ix-pitem__top"><b>{x.subject}</b><SlaTag tk={x} t={t} /></span>
                    <span className="ix-pitem__mid"><span className="ix-id">{x.id}</span> · {shopName(x.shopId)} · {x.agent || 'Unassigned'}</span>
                    <span className="ix-pitem__tags"><StatusTag s={x.status} />{x.priority === 'Urgent' || x.priority === 'High' ? <PriorityTag p={x.priority} /> : null}<span className="ix-pitem__mid">{when(x.createdAt, t)}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">{viewLabel} tickets</caption>
                <thead>
                  <tr>
                    <th scope="col" className="ix-check"><input type="checkbox" checked={allOnPage} onChange={toggleAll} aria-label="Select every ticket on this page" /></th>
                    <th scope="col">Ticket</th>
                    <th scope="col">Merchant</th>
                    <th scope="col">Subject</th>
                    <th scope="col">Category</th>
                    <th scope="col">Priority</th>
                    <th scope="col">Agent</th>
                    <th scope="col">Status</th>
                    <th scope="col">Created</th>
                    <th scope="col">SLA</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((x) => (
                    <tr key={x.id} className={sel.has(x.id) ? 'is-sel' : ''} tabIndex={0}
                      onClick={() => open(x.id)} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) open(x.id); }}>
                      <td className="ix-check" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={sel.has(x.id)} onChange={() => toggle(x.id)} aria-label={'Select ' + x.id} /></td>
                      <td><span className="ix-id">{x.id}</span></td>
                      <td><span className="tk-mer"><span>{shopName(x.shopId)}</span><small>#{x.shopId}</small></span></td>
                      <td>
                        <span className="tk-subj">
                          <Link href={'/admin/tickets/view?id=' + x.id} className="ix-strong" onClick={(e) => e.stopPropagation()} title={x.subject}>{x.subject}</Link>
                          <small><Icon name={CHANNEL_ICON[x.channel] || 'message-square'} width="12" height="12" aria-hidden="true" />{x.channel}{x.mergedInto ? ' · merged into ' + x.mergedInto : ''}</small>
                        </span>
                      </td>
                      <td className="ix-muted">{x.category}</td>
                      <td><PriorityTag p={x.priority} /></td>
                      <td>{x.agent ? <span className="sp-person"><Who name={x.agent} size={22} />{x.agent}</span> : <span className="ix-muted">Unassigned</span>}</td>
                      <td><StatusTag s={x.status} /></td>
                      <td className="ix-muted ix-nowrap">{when(x.createdAt, t)}</td>
                      <td><SlaTag tk={x} t={t} /></td>
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

  // the New ticket form
  const e = create ? create.errors : {};
  const shopQ = create ? create.shopQ.trim().toLowerCase() : '';
  const shopOptions = shops.slice().sort((a, b) => a.name.localeCompare(b.name))
    .filter((x) => !shopQ || x.id === create.shopId || (x.name + ' ' + x.id).toLowerCase().includes(shopQ));
  const setC = (k) => (ev) => setCreate((c) => ({ ...c, [k]: ev.target.value, errors: {} }));

  return (
    <AdminShell active="tickets" title="Tickets">
      <style dangerouslySetInnerHTML={{ __html: SUPPORT_CSS + CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>

      <Sheet open={!!create} title="New ticket" onClose={() => setCreate(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setCreate(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={doCreate}>Open ticket</button>
        </>}>
        {create ? (
          <div className="sp-form">
            <div className="gc-field">
              <label className="gc-label" htmlFor="nt-shop">Merchant</label>
              <div className="tk-pick">
                <input className="gc-input" type="search" placeholder="Search store name or ID" aria-label="Search merchants" value={create.shopQ} onChange={setC('shopQ')} data-autofocus />
                <select id="nt-shop" {...ctl(e.shopId, true)} value={create.shopId} onChange={setC('shopId')}>
                  <option value="">{shopOptions.length ? 'Choose a merchant' : 'No store matches'}</option>
                  {shopOptions.map((x) => <option key={x.id} value={x.id}>{x.name} · #{x.id}</option>)}
                </select>
              </div>
              {e.shopId ? <p className="gc-help gc-help--error" role="alert">{e.shopId}</p> : null}
            </div>
            <Field id="nt-subj" label="Subject" error={e.subject}>
              <input id="nt-subj" {...ctl(e.subject)} value={create.subject} onChange={setC('subject')} placeholder="e.g. bKash payments not showing on orders" maxLength={120} />
            </Field>
            <div className="sp-form__two">
              <Field id="nt-cat" label="Category" error={e.category}>
                <select id="nt-cat" {...ctl(e.category, true)} value={create.category} onChange={setC('category')}>
                  <option value="">Choose</option>
                  {CATEGORIES.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </Field>
              <Field id="nt-pri" label="Priority">
                <select id="nt-pri" {...ctl(false, true)} value={create.priority} onChange={setC('priority')}>
                  {PRIORITIES.slice().reverse().map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </Field>
              <Field id="nt-ch" label="Came in by">
                <select id="nt-ch" {...ctl(false, true)} value={create.channel} onChange={setC('channel')}>
                  {CHANNELS.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </Field>
              <Field id="nt-agent" label="Assign to">
                <select id="nt-agent" {...ctl(false, true)} value={create.agent} onChange={setC('agent')}>
                  <option value="">Unassigned</option>
                  {DESK.map((x) => <option key={x} value={x}>{x}{x === me ? ' (you)' : x === TECH ? ' (Technical)' : ''}</option>)}
                </select>
              </Field>
            </div>
            <Field id="nt-msg" label="What the merchant said" error={e.message}>
              <textarea id="nt-msg" {...ctl(e.message)} rows={4} value={create.message} onChange={setC('message')} placeholder="Their words, as they said them" />
            </Field>
            <div className="gc-field">
              <span className="gc-label">Attachments</span>
              <span className="sp-files">
                {create.files.map((n) => <span key={n} className="sp-file">{n}<button type="button" aria-label={'Remove ' + n} onClick={() => setCreate((c) => ({ ...c, files: c.files.filter((x) => x !== n) }))}><Icon name="x" width="12" height="12" aria-hidden="true" /></button></span>)}
                <label className="ix-btn ix-btn--sm"><Icon name="paperclip" width="16" height="16" aria-hidden="true" />Add file
                  <input type="file" multiple hidden onChange={(ev) => { const names = Array.from(ev.target.files || []).map((x) => x.name); ev.target.value = ''; setCreate((c) => ({ ...c, files: [...new Set([...c.files, ...names])].slice(0, 5) })); }} />
                </label>
              </span>
            </div>
            {e.form ? <p className="sp-formerr" role="alert">{e.form}</p> : null}
          </div>
        ) : null}
      </Sheet>

      <Sheet open={!!bulk} title={bulk ? (bulk.kind === 'assign' ? 'Assign tickets' : bulk.kind === 'status' ? 'Change status' : 'Merge tickets') : ''} onClose={() => setBulk(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setBulk(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={doBulk}>{bulk && bulk.kind === 'merge' ? 'Merge' : bulk && bulk.kind === 'status' ? 'Change status' : 'Assign'}</button>
        </>}>
        {bulk ? (
          <div className="sp-form">
            <p>{plural(selRows.length, 'ticket')}: <span className="tk-ids">{selRows.slice(0, 8).map((x) => x.id).join(', ')}{selRows.length > 8 ? ' …' : ''}</span></p>
            {bulk.kind === 'assign' ? (
              <Field id="bk-agent" label="Assign to" error={bulk.error}>
                <select id="bk-agent" {...ctl(bulk.error, true)} data-autofocus value={bulk.agent} onChange={(ev) => setBulk({ ...bulk, agent: ev.target.value, error: '' })}>
                  <option value="">Choose a person</option>
                  {DESK.map((x) => <option key={x} value={x}>{x}{x === TECH ? ' (Technical)' : ''}</option>)}
                  <option value={NONE}>Nobody (unassign)</option>
                </select>
              </Field>
            ) : null}
            {bulk.kind === 'status' ? (
              <>
                <Field id="bk-status" label="New status" error={bulk.error && !bulk.status ? bulk.error : ''}>
                  <select id="bk-status" {...ctl(bulk.error && !bulk.status, true)} data-autofocus value={bulk.status} onChange={(ev) => setBulk({ ...bulk, status: ev.target.value, error: '' })}>
                    <option value="">Choose a status</option>
                    {STATUSES.filter((x) => x !== 'New' && x !== 'Escalated').map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </Field>
                {bulk.status === 'Solved' ? (
                  <Field id="bk-note" label="Resolution note" error={bulk.error && bulk.status ? bulk.error : ''} hint="Saved on each ticket.">
                    <textarea id="bk-note" {...ctl(bulk.error && bulk.status)} rows={3} value={bulk.note} onChange={(ev) => setBulk({ ...bulk, note: ev.target.value, error: '' })} />
                  </Field>
                ) : null}
                <p className="sp-muted">Escalating needs a reason: open the ticket to escalate it.</p>
              </>
            ) : null}
            {bulk.kind === 'merge' ? (
              <>
                <Field id="bk-into" label="Keep this ticket" error={bulk.error} hint="The others close and their messages move into it.">
                  <select id="bk-into" {...ctl(bulk.error, true)} data-autofocus value={bulk.into} onChange={(ev) => setBulk({ ...bulk, into: ev.target.value, error: '' })}>
                    {selRows.map((x) => <option key={x.id} value={x.id}>{x.id} · {x.subject}</option>)}
                  </select>
                </Field>
              </>
            ) : null}
          </div>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
