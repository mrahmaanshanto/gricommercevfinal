'use client';
// Merchant app · Orders (/m-orders). The design board's layout (design/templates/app/MOrders.dc.html) with live data
// from the same books as the web Orders list (src/screens/merchant-orders/MerchantOrders.jsx):
//   header      "Orders" ("Sales" in the Retail edition), Filters (channel, payment, date) and Scan
//   search      order no., invoice no., name or phone (digits match any format)
//   chips       the web's tabs (lib/orderStatus.js › ORDER_TABS, with All last) and their counts; Retail keeps its own
//               tabs (All · Payment due · Completed · Cancelled · Returned)
//   list        the board's order cards, newest first (tap the line to turn it round), 20 at a time and more as you
//               scroll; Refresh reads the books again and moves courier parcels on (orderFlow.syncCourier)
//   select      long-press a card (or Select) to pick orders; Actions offers what the web's bulk bar does:
//               Approve (orders.approveOrder, once each), Send to courier and Print slips as background jobs
//               (lib/orderJobs.js, the strip shows progress and Retry), Send receipts (receipts.sendReceipt by SMS)
//               and Cancel (orders.cancelOrder, after a confirm)
//   FAB         New order (/m-new-order); the Retail edition sells at the POS register instead
// Everything is read after mount (Netlify prerenders in UTC) and again when the books change (useAppData).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AppScreen, Content, LargeHeader, TabBar, ActionBar, Fab, Sheet, Chips, SearchField, Card, ListRow, Pill,
  IconButton, Button, EmptyState, Skeleton, Note, Icon, useAppData, money, ago, toast, confirmDialog, refresh,
} from './kit/AppKit';
import { canUse, routeLabel } from './kit/appNav';
import { hasModule } from '@/lib/edition';
import { getOrders, findOrder, approveOrder, cancelOrder, isCounterSale, availability, CAN_APPROVE, CAN_CANCEL } from '@/lib/orders';
import { syncCourier } from '@/lib/orderFlow';
import { holdsFor } from '@/lib/stockHolds';
import { onlinePlace, getStockPlaces } from '@/lib/locations';
import { clockNow } from '@/lib/settlements';
import { startJob, tickJobs, getJobs, jobSummary, retryFailed, dismissJob, labelsPrinted, JOB_LABEL, JOB_EVENT } from '@/lib/orderJobs';
import { sendReceipt } from '@/lib/receipts';
import { invoiceFromOrder } from '@/components/SaleInvoice';
import { saleOfOrder } from '@/lib/customerWarranty';
import { listTabs, inTab, tabFor, payPill, statusPill, areaOf, channelOf, DATE_RANGES, inRange, PAYMENT_FILTERS, digitsOf, plural, byName } from './orders/orderData';

const PAGE = 20;
const NO_FILTERS = { channel: '', payment: '', date: '' };
const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };

const CSS = `
[data-screen="MOrders"] .chips{overflow-x:auto;scrollbar-width:none}
[data-screen="MOrders"] .chips::-webkit-scrollbar{display:none}
[data-screen="MOrders"] .ocard{display:block;margin:0 20px 12px;padding:16px;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;position:relative}
[data-screen="MOrders"] .ocard.sel{box-shadow:0 0 0 2px var(--brand),0 8px 24px -16px rgba(15,23,42,.18)}
[data-screen="MOrders"] .ocheck{width:22px;height:22px;flex:none;border-radius:var(--radius-full);border:2px solid #cbd5e1;display:flex;align-items:center;justify-content:center;color:#fff}
[data-screen="MOrders"] .ocard.sel .ocheck{background:var(--brand);border-color:var(--brand)}
[data-screen="MOrders"] .linkbtn{border:0;background:none;padding:0;font:inherit;font-size:var(--text-xs-plus);color:var(--muted);cursor:pointer}
[data-screen="MOrders"] .fgroup{display:flex;flex-direction:column;gap:8px;margin-bottom:18px}
[data-screen="MOrders"] .fgroup .chips{padding:0;flex-wrap:wrap}
`;

/** One order as the board's card. */
function OrderCard({ o, now, selecting, selected, onPress, onLong }) {
  const timer = useRef(0);
  const fired = useRef(false);
  const pay = payPill(o);
  const sp = statusPill(o.statusKey);
  const start = () => { fired.current = false; window.clearTimeout(timer.current); timer.current = window.setTimeout(() => { fired.current = true; onLong(o.id); }, 480); };
  const stop = () => window.clearTimeout(timer.current);
  const click = (e) => {
    if (fired.current || selecting) { e.preventDefault(); if (!fired.current) onPress(o.id); fired.current = false; }
  };
  return (
    <Link
      href={'/m-order-detail?id=' + encodeURIComponent(o.id)}
      className={'card ocard' + (selected ? ' sel' : '')}
      onClick={click}
      onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} onPointerMove={(e) => { if (Math.abs(e.movementY) > 4) stop(); }}
      onContextMenu={(e) => e.preventDefault()}
      aria-pressed={selecting ? !!selected : undefined}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {selecting ? <span className="ocheck" aria-hidden="true">{selected ? <Icon name="check" size={14} stroke={3} /> : null}</span> : null}
        <span className="mono" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{o.id}</span>
        <span style={{ marginLeft: 'auto', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{ago(o.at, now)}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', marginTop: '6px' }}>
        <div style={{ minWidth: '0' }}>
          <div className="ell" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)' }}>{o.customer || 'Walk-in customer'}</div>
          <div className="ell" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{plural(o.units || 0, 'item')}{areaOf(o) ? ' · ' + areaOf(o) : ''}</div>
        </div>
        <div className="num" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)' }}>{money(o.amount)}</div>
      </div>
      <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
        <Pill tone={pay.tone}>{pay.text}</Pill>
        <Pill tone={sp.tone}>{sp.label}</Pill>{sp.sub ? <span style={{ alignSelf: 'center', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{sp.sub}</span> : null}
        {o.verify && o.verify.state === 'confirmed' && CAN_APPROVE.includes(o.statusKey) ? <Pill tone="ok">Confirmed</Pill> : null}
      </div>
    </Link>
  );
}

/** Background jobs (courier booking, label printing) with progress and Retry. */
function JobStrip({ jobs }) {
  if (!jobs.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '14px 0 0' }}>
      {jobs.map((job) => {
        const s = jobSummary(job);
        const failedLines = job.items.filter((it) => it.state === 'failed').slice(0, 3);
        return (
          <Card key={job.id} pad="12px 14px">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="ico" style={{ width: '36px', height: '36px' }}><Icon name={job.kind === 'courier' ? 'truck' : 'receipt'} size={18} /></span>
              <div style={{ flex: '1', minWidth: '0' }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>{JOB_LABEL[job.kind]}</div>
                <div style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{s.done} of {s.total} done{s.failed ? ` · ${s.failed} failed` : ''}{s.running ? ' · working…' : ''}</div>
              </div>
              <IconButton icon="x" label="Dismiss" onClick={() => { dismissJob(job.id); refresh(); }} />
            </div>
            <div className="bar" style={{ marginTop: '10px' }}><i style={{ width: Math.round(((s.done + s.failed) / Math.max(1, s.total)) * 100) + '%', background: s.failed ? 'var(--warn)' : 'var(--brand)' }} /></div>
            {failedLines.length ? (
              <div style={{ marginTop: '8px', fontSize: 'var(--text-xs-plus)', color: 'var(--err)' }}>
                {failedLines.map((it) => <div key={it.id} className="ell"><span className="mono">{it.id}</span> · {it.error}</div>)}
              </div>
            ) : null}
            {(!s.running && (s.retryable || (job.kind === 'print' && s.done && !job.printedAt))) ? (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                {s.retryable ? <Button kind="soft" style={{ flex: '1', height: '36px' }} onClick={() => { retryFailed(job.id); refresh(); }}>Retry {s.retryable}</Button> : null}
                {job.kind === 'print' && s.done && !job.printedAt ? <Button kind="primary" style={{ flex: '1', height: '36px' }} onClick={() => { labelsPrinted(job.id); toast(plural(s.done, 'label') + ' sent to the printer'); refresh(); }}>Print {plural(s.done, 'label')}</Button> : null}
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}

export default function MOrdersScreen() {
  const { ready, tick, ctx } = useAppData([JOB_EVENT, 'gc:notify']);
  const [tab, setTab] = useState('');
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState(NO_FILTERS);
  const [draft, setDraft] = useState(NO_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [oldest, setOldest] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [sel, setSel] = useState(null);           // null = not selecting; else { [id]: true }
  const [actions, setActions] = useState(false);
  const [approve, setApprove] = useState(null);   // { ids, place }
  const [spin, setSpin] = useState(false);
  const sentinel = useRef(null);

  const online = ctx ? hasModule('online', ctx.ed) : true;
  // the tab from the address (?status=ready from Home or the web), else the first tab
  useEffect(() => {
    if (!ready || !ctx) return;
    setTab((cur) => cur || tabFor(new URLSearchParams(window.location.search).get('status'), hasModule('online', ctx.ed)));
  }, [ready, ctx]);
  useEffect(() => { if (ready) safe(() => syncCourier(), 0); }, [ready]);

  const all = useMemo(() => (ready ? safe(() => getOrders(), []) : []), [ready, tick]);
  const now = useMemo(() => (ready ? clockNow() : 0), [ready, tick]);
  const jobs = useMemo(() => (ready ? safe(() => getJobs().filter((j) => now - j.at < 6 * 60 * 60 * 1000), []) : []), [ready, tick, now]);
  const running = jobs.some((j) => j.items.some((it) => it.state === 'queued'));
  // background jobs move on while this page is open (the web's jobs strip does the same)
  useEffect(() => {
    if (!running) return undefined;
    const iv = window.setInterval(() => { if (tickJobs()) refresh(); }, 700);
    return () => window.clearInterval(iv);
  }, [running]);

  const tabs = listTabs(online);
  const cur = tab || tabs[0].key;
  // what the filters and search keep (the tab counts ignore the tab itself)
  const kept = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const nd = digitsOf(needle);
    return all.filter((o) => {
      if (filters.channel && channelOf(o) !== filters.channel) return false;
      if (filters.payment && o.payment !== filters.payment) return false;
      if (filters.date && !inRange(o.at || 0, filters.date, now)) return false;
      if (!needle) return true;
      const text = [o.id, o.invoiceId, o.customer, o.phone, o.consignment].join(' ').toLowerCase();
      return text.includes(needle) || (nd.length > 2 && digitsOf(o.id + ' ' + o.phone + ' ' + o.invoiceId).includes(nd));
    });
  }, [all, q, filters, now]);
  const list = useMemo(() => kept.filter((o) => inTab(o, cur)).sort((a, b) => (oldest ? (a.at || 0) - (b.at || 0) : (b.at || 0) - (a.at || 0))), [kept, cur, oldest]);
  const counts = useMemo(() => { const c = {}; tabs.forEach((t) => { c[t.key] = kept.filter((o) => inTab(o, t.key)).length; }); return c; }, [kept, tabs]);
  const rows = list.slice(0, shown);
  const total = list.reduce((a, o) => a + (o.amount || 0), 0);
  const channels = useMemo(() => [...new Set(all.map(channelOf))].sort(), [all]);
  const nFilters = (filters.channel ? 1 : 0) + (filters.payment ? 1 : 0) + (filters.date ? 1 : 0);

  useEffect(() => { setShown(PAGE); }, [cur, q, filters, oldest]);
  // more cards as the end of the list comes into view
  useEffect(() => {
    const el = sentinel.current;
    if (!el || shown >= list.length || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver((ent) => { if (ent.some((e) => e.isIntersecting)) setShown((n) => n + PAGE); }, { root: el.closest('.content'), rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [shown, list.length]);

  const title = ctx ? routeLabel('/m-orders', ctx) : 'Orders';
  const newHref = online ? '/m-new-order' : ctx && canUse('/m-pos', ctx) ? '/m-pos' : '/pos';
  const canNew = ctx ? (online ? canUse('/m-new-order', ctx) : true) : false;

  // ---- selection -------------------------------------------------------------------------------------------
  const chosen = sel ? all.filter((o) => sel[o.id]) : [];
  const toggle = (id) => setSel((s) => { const n = { ...(s || {}) }; if (n[id]) delete n[id]; else n[id] = true; return n; });
  const startSelect = (id) => { try { if (navigator.vibrate) navigator.vibrate(15); } catch { /* ignore */ } setSel((s) => ({ ...(s || {}), [id]: true })); };
  const endSelect = () => { setSel(null); setActions(false); };
  const allOnScreen = rows.length > 0 && rows.every((o) => sel && sel[o.id]);
  const pickAll = () => setSel(() => (allOnScreen ? {} : Object.fromEntries(rows.map((o) => [o.id, true]))));
  const elig = (keys) => chosen.filter((o) => keys.includes(o.statusKey));

  const doRefresh = () => { setSpin(true); safe(() => syncCourier(), 0); refresh(); window.setTimeout(() => setSpin(false), 500); toast('Up to date', { tone: 'info' }); };

  const bulkApprove = () => {
    const ok = elig(CAN_APPROVE);
    if (!ok.length) { toast('Only new orders can be approved', { tone: 'error' }); return; }
    setActions(false);
    setApprove({ ids: ok.map((o) => o.id), place: safe(() => onlinePlace(), 'Central Warehouse') });
  };
  const doApprove = () => {
    const by = byName();
    const done = approve.ids.map((id) => findOrder(id)).filter((o) => o && approveOrder(o, approve.place, by)).length;
    setApprove(null); endSelect(); refresh();
    toast(plural(done, 'order') + ' approved');
  };
  const bulkCourier = () => {
    const ok = elig(['ready']);
    if (!ok.length) { toast('Only Ready for courier orders can be sent', { tone: 'error' }); return; }
    startJob('courier', chosen);
    endSelect(); refresh();
    toast('Booking ' + plural(ok.length, 'order') + ' in the background', { tone: 'info' });
  };
  const bulkPrint = () => {
    if (!chosen.length) return;
    startJob('print', chosen);
    endSelect(); refresh();
    toast('Preparing ' + plural(chosen.length, 'slip') + ' in the background', { tone: 'info' });
  };
  const bulkReceipts = () => {
    const withPhone = chosen.filter((o) => digitsOf(o.phone).length >= 10);
    let sent = 0;
    withPhone.forEach((o) => { if (safe(() => sendReceipt(invoiceFromOrder(o, saleOfOrder(o)), { via: 'sms', to: o.phone, by: byName() }).ok, false)) sent += 1; });
    const skipped = chosen.length - withPhone.length;
    endSelect();
    toast(`Receipts sent by SMS: ${sent}${skipped ? ` · ${skipped} without a mobile number` : ''}`, sent ? undefined : { tone: 'error' });
  };
  const bulkCancel = async () => {
    const ok = elig(CAN_CANCEL).filter((o) => !isCounterSale(o));
    if (!ok.length) { toast('None of these orders can be cancelled', { tone: 'error' }); return; }
    setActions(false);
    const held = ok.flatMap((o) => holdsFor(o.id));
    const yes = await confirmDialog({
      title: 'Cancel ' + plural(ok.length, 'order') + '?',
      body: (chosen.length > ok.length ? `${chosen.length - ok.length} can't be cancelled and are skipped. ` : '') + (held.length ? 'Held stock goes back.' : ''),
      confirmLabel: 'Cancel ' + plural(ok.length, 'order'), cancelLabel: 'Keep', tone: 'danger',
    });
    if (!yes) return;
    const by = byName();
    ok.forEach((o) => { const f = findOrder(o.id); if (f && CAN_CANCEL.includes(f.statusKey)) cancelOrder(f, 'Cancelled', by); });
    endSelect(); refresh();
    toast(plural(ok.length, 'order') + ' cancelled');
  };

  const ACTIONS = [
    online && { key: 'approve', icon: 'check', label: 'Approve', n: elig(CAN_APPROVE).length, run: bulkApprove },
    online && { key: 'courier', icon: 'truck', label: 'Send to courier', n: elig(['ready']).length, run: bulkCourier },
    online && { key: 'print', icon: 'receipt', label: 'Print shipping slips', n: chosen.filter((o) => !isCounterSale(o) && !['cancelled', 'returned', 'delivered'].includes(o.statusKey)).length, run: bulkPrint },
    { key: 'receipts', icon: 'chat', label: 'Send receipts by SMS', n: chosen.filter((o) => digitsOf(o.phone).length >= 10).length, run: bulkReceipts },
    online && { key: 'cancel', icon: 'x', label: 'Cancel orders', n: elig(CAN_CANCEL).filter((o) => !isCounterSale(o)).length, run: bulkCancel },
  ].filter(Boolean);

  // the approve sheet: one place for every selected order, with free stock per product there
  const places = useMemo(() => (ready ? safe(() => getStockPlaces(), []) : []), [ready]);
  const apStock = useMemo(() => {
    if (!approve) return [];
    const need = {};
    all.filter((o) => approve.ids.includes(o.id)).forEach((o) => o.lines.forEach((l) => { need[l.name] = (need[l.name] || 0) + l.qty; }));
    return safe(() => availability(Object.entries(need).map(([name, qty]) => ({ name, qty })), approve.place), []);
  }, [approve, all]);

  const filterChip = (key, label) => ({ key, label });
  return (
    <AppScreen name="MOrders" title={title} css={CSS}>
      <Content top={47} bottom={sel ? 98 : 0}>
        <LargeHeader
          title={sel ? `${chosen.length} selected` : title}
          actions={sel ? (
            <>
              <Button kind="line" style={{ height: '36px', padding: '0 12px' }} onClick={pickAll}>{allOnScreen ? 'None' : 'All'}</Button>
              <IconButton icon="x" label="Stop selecting" soft onClick={endSelect} />
            </>
          ) : (
            <>
              <IconButton icon="refresh" label="Refresh" soft onClick={doRefresh} />
              <IconButton icon="filter" label={nFilters ? `Filters (${nFilters})` : 'Filters'} soft dot={nFilters > 0} onClick={() => { setDraft(filters); setFilterOpen(true); }} />
              {ctx && canUse('/m-scan', ctx) ? <IconButton icon="scan" label="Scan" soft href="/m-scan" /> : null}
            </>
          )}
        />
        <SearchField value={q} onChange={setQ} placeholder="Order ID, phone or name" style={{ marginTop: '14px' }} />
        <Chips style={{ marginTop: '14px' }} value={cur} onChange={(k) => { setTab(k); }} items={tabs.map((t) => ({ key: t.key, label: t.label, n: ready ? counts[t.key] || 0 : undefined }))} />
        {nFilters ? (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', margin: '10px 20px 0' }}>
            {filters.channel ? <Pill tone="nav">{filters.channel}</Pill> : null}
            {filters.payment ? <Pill tone="nav">{(PAYMENT_FILTERS.find((p) => p[0] === filters.payment) || [])[1]}</Pill> : null}
            {filters.date ? <Pill tone="nav">{(DATE_RANGES.find((d) => d[0] === filters.date) || [])[1]}</Pill> : null}
            <button type="button" className="linkbtn" style={{ color: 'var(--brand)', fontWeight: 'var(--weight-medium)' }} onClick={() => setFilters(NO_FILTERS)}>Clear</button>
          </div>
        ) : null}
        <JobStrip jobs={jobs} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '18px 20px 10px', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>
          <button type="button" className="linkbtn" onClick={() => setOldest(!oldest)} aria-label={oldest ? 'Oldest first. Show newest first' : 'Newest first. Show oldest first'}>{oldest ? 'Oldest first' : 'Newest first'}</button>
          <span className="num">{ready ? `${plural(list.length, 'order')} · ${money(total)}` : ' '}</span>
        </div>
        {!ready ? <Skeleton rows={4} /> : rows.length ? (
          <>
            {rows.map((o) => <OrderCard key={o.id} o={o} now={now} selecting={!!sel} selected={!!(sel && sel[o.id])} onPress={toggle} onLong={startSelect} />)}
            {shown < list.length ? (
              <div ref={sentinel} style={{ padding: '0 20px 12px' }}>
                <Button kind="soft" style={{ width: '100%' }} onClick={() => setShown((n) => n + PAGE)}>Show more · {list.length - shown} left</Button>
              </div>
            ) : null}
          </>
        ) : (
          <Card>
            <EmptyState
              icon={q || nFilters ? 'search' : 'check'}
              title={q ? `No orders match “${q.trim()}”` : nFilters ? 'No orders match these filters' : 'No orders here'}
              action={q || nFilters ? { label: 'Clear search and filters', onClick: () => { setQ(''); setFilters(NO_FILTERS); } } : null}
            />
          </Card>
        )}
        <div style={{ height: '8px' }} />
      </Content>

      {sel ? (
        <ActionBar>
          <Button kind="line" onClick={endSelect}>Done</Button>
          <Button kind="primary" style={{ flex: '2' }} disabled={!chosen.length} onClick={() => setActions(true)}>Actions{chosen.length ? ` (${chosen.length})` : ''}</Button>
        </ActionBar>
      ) : (
        <>
          {canNew ? <Fab href={newHref} label={online ? 'New order' : 'New sale'} /> : null}
        </>
      )}

      <Sheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Filters"
        footer={<><Button kind="line" onClick={() => setDraft(NO_FILTERS)}>Clear</Button><Button kind="primary" style={{ flex: '2' }} onClick={() => { setFilters(draft); setFilterOpen(false); }}>Show orders</Button></>}>
        <div className="fgroup">
          <span className="lab">Channel</span>
          <Chips value={draft.channel} onChange={(k) => setDraft({ ...draft, channel: k })} items={[filterChip('', 'All'), ...channels.map((c) => filterChip(c, c))]} />
        </div>
        <div className="fgroup">
          <span className="lab">Payment</span>
          <Chips value={draft.payment} onChange={(k) => setDraft({ ...draft, payment: k })} items={[filterChip('', 'All'), ...PAYMENT_FILTERS.map(([k, l]) => filterChip(k, l))]} />
        </div>
        <div className="fgroup">
          <span className="lab">Date</span>
          <Chips value={draft.date} onChange={(k) => setDraft({ ...draft, date: k })} items={[filterChip('', 'Any time'), ...DATE_RANGES.map(([k, l]) => filterChip(k, l))]} />
        </div>
      </Sheet>

      <Sheet open={actions} onClose={() => setActions(false)} title={plural(chosen.length, 'order') + ' selected'}>
        <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
          {ACTIONS.map((a) => (
            <ListRow key={a.key} icon={a.icon} title={a.label} sub={a.n === chosen.length ? 'All selected' : `${a.n} of ${chosen.length} can`} onClick={a.n ? a.run : () => toast(`None of the selected orders can: ${a.label.toLowerCase()}`, { tone: 'error' })} compact />
          ))}
        </div>
      </Sheet>

      <Sheet open={!!approve} onClose={() => setApprove(null)} title={approve ? 'Approve ' + plural(approve.ids.length, 'order') : ''}
        footer={<><Button kind="line" onClick={() => setApprove(null)}>Cancel</Button><Button kind="primary" style={{ flex: '2' }} icon="check" onClick={doApprove}>Approve</Button></>}>
        {approve ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {places.length > 1 ? (
              <div className="fgroup" style={{ marginBottom: 0 }}>
                <span className="lab">Stock from</span>
                <Chips value={approve.place} onChange={(k) => setApprove({ ...approve, place: k })} items={places.map((p) => ({ key: p, label: p }))} style={{ padding: 0, flexWrap: 'wrap' }} />
              </div>
            ) : null}
            <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
              {apStock.map((x) => (
                <ListRow key={x.name} compact title={x.name} sub={`${x.qty} needed`} chevron={false}
                  end={<span className="num" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: x.short ? 'var(--err)' : 'var(--ok)' }}>{x.known ? `${x.available} free` : '—'}</span>} />
              ))}
            </div>
            {apStock.some((x) => x.short) ? <Note tone="warn" icon="alert">Not enough free stock at {approve.place} for some items.</Note> : null}
          </div>
        ) : null}
      </Sheet>
    </AppScreen>
  );
}
