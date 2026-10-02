'use client';
// Generated from design/templates/merchant-orders/MerchantOrders.dc.html by scripts/convert-design.mjs.
// MerchantOrders — All orders, laid out like Shopify's order list (components/ui/IndexKit.jsx): title row, today's
// figures, then one card with the status views, search and filters, bulk actions and a compact table. The list shows
// what you act on (order, date, customer, channel, total, payment, status, items); courier, phone and the rest are
// on the order page.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { toast, confirmDialog } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { formatBDT } from '@/lib/format';
import { Dialog as __Dialog, EmptyState as __EmptyState, StatusBadge as __StatusBadge } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, Pager, LearnMore, Menu } from '@/components/ui/IndexKit';
import { ORDER_STATUSES, ORDER_TOTAL, orderStatus } from '@/lib/orderStatus';
import { getStockPlaces, onlinePlace } from '@/lib/locations';
import { holdsFor } from '@/lib/stockHolds';
import { demoOrders, getOrders, duplicatesOf, orderHref, invoiceHref, availability, approveOrder, cancelOrder, heldText, CAN_APPROVE, CAN_CANCEL, DEFAULT_HOLD_PLACE } from '@/lib/orders';
import { sendToCourier, syncCourier } from '@/lib/orderFlow';
import { holdsStock } from '@/lib/edition';
import { orderStates } from '@/lib/orderStates';

// ---- logic (from the design's <script type="text/x-dc">) ----

const PAGE_SIZE = 20;
// The tabs are the shared status list, so labels, order and counts match the sidebar.
const TABS = [{ key: 'all', label: 'All', count: ORDER_TOTAL }, ...ORDER_STATUSES];
const PAYMENTS = {
  Paid: { tone: 'success', icon: 'check' },
  Unpaid: { tone: 'error', icon: 'circle-alert' },
  Partial: { tone: 'warning', icon: 'circle-dashed' },
  COD: { tone: 'neutral', icon: 'banknote' }
};
const NO_EXTRA = { channel: '', assigned: '', minTotal: '' };
// The orders come from src/lib/orders.js: the demo orders, orders made in this browser and the
// demo wholesale invoices, with status changes kept in this browser applied.
const DEMO_ORDERS = demoOrders();
const digits = (t) => String(t).replace(/[^0-9]/g, '');
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');

class Component extends DCLogic {
  state = { all: DEMO_ORDERS, status: 'all', q: '', courier: '', payment: '', zone: '', page: 1, sel: {}, find: false, filtersOpen: false, extra: NO_EXTRA, draft: NO_EXTRA, approve: null };
  componentDidMount() {
    this.paint();
    this.readUrl();
    // wholesale demo invoices show in All orders too, next to the orders made in this browser
    this.reload();
    // The sidebar's status links change only the query string, so watch it (Back/Forward included).
    this._onPop = () => this.readUrl();
    window.addEventListener('popstate', this._onPop);
    this._watch = setInterval(() => { if (window.location.search !== this._search) this.readUrl(); }, 400);
  }
  reload() { syncCourier(); this.setState({ all: getOrders() }); }
  /** Selected orders split into the ones the action applies to and the ones it skips. */
  pick(allowed) {
    const chosen = this.filtered().filter(o => this.state.sel[o.id]);
    return { valid: chosen.filter(o => allowed.includes(o.statusKey)), skipped: chosen.filter(o => !allowed.includes(o.statusKey)) };
  }
  skippedText(skipped, verb) {
    return plural(skipped.length, 'order') + ' cannot be ' + verb + ' and ' + (skipped.length === 1 ? 'is' : 'are') + ' skipped: ' + skipped.map(o => o.id + ' (' + o.status + ')').join(', ') + '.';
  }
  startApprove() {
    const { valid, skipped } = this.pick(CAN_APPROVE);
    if (!valid.length) { toast('Only new orders can be approved. ' + this.skippedText(skipped, 'approved'), { tone: 'error' }); return; }
    this.setState({ approve: { ids: valid.map(o => o.id), skipped: skipped.map(o => o.id), place: onlinePlace() } });
  }
  doApprove() {
    const { ids, place } = this.state.approve;
    const list = this.state.all.filter(o => ids.includes(o.id));
    const done = list.filter(o => approveOrder(o, place)).length;
    this.setState({ approve: null, sel: {} });
    this.reload();
    toast(plural(done, 'order') + ' approved');
  }
  async bulkCancel() {
    const { valid, skipped } = this.pick(CAN_CANCEL);
    if (!valid.length) { toast('None of the selected orders can be cancelled. ' + this.skippedText(skipped, 'cancelled'), { tone: 'error' }); return; }
    const held = valid.flatMap(o => holdsFor(o.id));
    const ok = await confirmDialog({
      title: 'Cancel ' + plural(valid.length, 'order') + '?',
      body: (skipped.length ? 'Warning: ' + this.skippedText(skipped, 'cancelled') + ' ' : '')
        + 'Cancelling ' + valid.map(o => o.id).join(', ') + '. '
        + (held.length ? 'These held items go back to stock: ' + heldText(held) + '.' : 'No stock is held for these orders.'),
      confirmLabel: 'Cancel ' + plural(valid.length, 'order'), tone: 'danger'
    });
    if (!ok) return;
    valid.forEach(o => cancelOrder(o));
    this.setState({ sel: {} });
    this.reload();
    toast(plural(valid.length, 'order') + ' cancelled');
  }
  /** Send every selected Ready for courier order; the courier's API may refuse some. */
  bulkSend() {
    const { valid, skipped } = this.pick(['ready']);
    if (!valid.length) { toast('Only Ready for courier orders can be sent. ' + this.skippedText(skipped, 'sent'), { tone: 'error' }); return; }
    const res = valid.map(o => ({ o, r: sendToCourier(o) }));
    const ok = res.filter(x => x.r.ok), bad = res.filter(x => !x.r.ok);
    this.setState({ sel: {} });
    this.reload();
    if (ok.length) toast(plural(ok.length, 'order') + ' sent to courier');
    if (bad.length) toast(bad.map(x => x.o.id + ': ' + x.r.error).join(' '), { tone: 'error' });
    if (skipped.length) toast(this.skippedText(skipped, 'sent'), { tone: 'info' });
  }
  componentWillUnmount() {
    window.removeEventListener('popstate', this._onPop);
    clearInterval(this._watch);
  }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { width: 20, height: 20, 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 400); setTimeout(go, 1200);
  }
  readUrl() {
    const p = new URLSearchParams(window.location.search);
    this._search = window.location.search;
    const status = p.get('status');
    this.setState({
      status: orderStatus(status) ? status : 'all',
      q: p.get('q') || '', courier: p.get('courier') || '', payment: p.get('payment') || '', zone: p.get('zone') || '',
      page: Math.max(1, parseInt(p.get('page'), 10) || 1),
      // ?channel=pos is the sidebar's "POS / Retail orders" view
      extra: { ...this.state.extra, channel: ['pos', 'online', 'wholesale'].includes(p.get('channel')) ? p.get('channel') : '' }
    });
  }
  /** The list view as a URL: what the address bar holds and what the detail page returns to. */
  listUrl(st = this.state, page = st.page) {
    const p = new URLSearchParams();
    if (st.status !== 'all') p.set('status', st.status);
    if (st.q) p.set('q', st.q);
    if (st.courier) p.set('courier', st.courier);
    if (st.payment) p.set('payment', st.payment);
    if (st.zone) p.set('zone', st.zone);
    if (st.extra && st.extra.channel) p.set('channel', st.extra.channel);
    if (page > 1) p.set('page', String(page));
    const qs = p.toString();
    return '/merchant-orders' + (qs ? '?' + qs : '');
  }
  /** Change the view (tab, filter, search or page) and keep the URL and the sidebar in step. */
  view(patch) {
    this.setState({ page: 1, ...patch }, () => {
      const url = this.listUrl();
      if (url === window.location.pathname + window.location.search) return;
      window.history.replaceState(null, '', url);
      this._search = window.location.search;
      window.dispatchEvent(new CustomEvent('gc:route'));
    });
  }
  filtered() {
    const { status, q, courier, payment, zone, extra } = this.state;
    const needle = q.trim().toLowerCase();
    const needleDigits = digits(needle);
    const min = Number(extra.minTotal) || 0;
    // orders made on the Create order page or sent in through an order link come first
    return this.state.all.filter(o => {
      if (status !== 'all' && o.statusKey !== status) return false;
      if (courier && o.courier !== courier) return false;
      if (payment && o.payment !== payment) return false;
      if (zone && o.zone !== zone) return false;
      // online = everything that is not a counter sale or a wholesale order
      if (extra.channel === 'online' && /^(POS|Wholesale)/.test(o.channel)) return false;
      if (extra.channel === 'pos' && !o.channel.startsWith('POS')) return false;
      if (extra.channel === 'wholesale' && !o.channel.startsWith('Wholesale')) return false;
      if (extra.assigned === 'yes' && !/^[A-Z]{2}-/.test(o.consignment)) return false;
      if (extra.assigned === 'no' && /^[A-Z]{2}-/.test(o.consignment)) return false;
      if (min && o.amount < min) return false;
      if (!needle) return true;
      const text = [o.id, o.invoiceId, o.customer, o.phone, o.itemTitle, o.courier, o.consignment].join(' ').toLowerCase();
      return text.includes(needle) || (needleDigits.length > 2 && digits(o.id + ' ' + o.phone + ' ' + o.consignment).includes(needleDigits));
    });
  }
  exportCsv(rows) {
    if (!rows.length) { toast('Nothing to export: no orders match these filters', { tone: 'info' }); return; }
    // the order's separate states (orderStates.js) go out with it, so a sheet can filter by what is waiting
    const head = ['Order', 'Placed', 'Channel', 'Customer', 'Phone', 'Zone', 'Items', 'Courier', 'Tracking', 'Status', 'Payment', 'Total (BDT)', 'Confirmation', 'Payment state', 'Fulfilment', 'Delivery', 'Due (BDT)', 'Next step'];
    const cell = (c) => '"' + String(c).replace(/"/g, '""') + '"';
    const lines = [head, ...rows.map(o => { const st = orderStates(o, { held: holdsFor(o.id).length > 0 }) || {}; return [o.id, o.placed, o.channel, o.customer, o.phone, o.zone, o.itemTitle + ' (' + o.itemMeta + ')', o.courier, o.consignment, o.status, o.payment, o.amount, st.confirmation, st.payment, st.fulfilment, st.delivery, st.due, (st.next || {}).label]; })];
    const blob = new Blob(['﻿' + lines.map(l => l.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'orders-' + this.state.status + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Exported ' + rows.length + (rows.length === 1 ? ' order' : ' orders') + ' to ' + a.download);
  }
  renderVals() {
    const st = this.state;
    const found = this.filtered();
    const pages = Math.max(1, Math.ceil(found.length / PAGE_SIZE));
    const page = Math.min(st.page, pages);
    const first = (page - 1) * PAGE_SIZE;
    const rows = found.slice(first, first + PAGE_SIZE);
    const sel = st.sel;
    const selCount = found.filter(o => sel[o.id]).length;
    const pageAllChecked = rows.length > 0 && rows.every(o => sel[o.id]);
    const from = encodeURIComponent(this.listUrl(st, page));
    const tabLabel = st.status === 'all' ? 'All orders' : orderStatus(st.status).label + ' orders';
    // tab and card counts come from the orders themselves (channel view applied, search and filters not)
    const inView = st.all.filter(o => st.extra.channel === 'online' ? !/^(POS|Wholesale)/.test(o.channel) : st.extra.channel === 'pos' ? o.channel.startsWith('POS') : st.extra.channel === 'wholesale' ? o.channel.startsWith('Wholesale') : true);
    const counts = { all: inView.length };
    ORDER_STATUSES.forEach(x => { counts[x.key] = inView.filter(o => o.statusKey === x.key).length; });
    const dayFrom = new Date(); dayFrom.setHours(0, 0, 0, 0);
    const extraCount = (st.extra.channel ? 1 : 0) + (st.extra.assigned ? 1 : 0) + (Number(st.extra.minTotal) > 0 ? 1 : 0);
    const hasFilters = !!(st.q || st.courier || st.payment || st.zone || extraCount);
    const setDraft = (k) => (e) => { const value = e.target.value; this.setState(s => ({ draft: { ...s.draft, [k]: value } })); };
    // bulk approve: one hold place for every selected Pending order, with free stock per product there
    let approveVals = null;
    if (st.approve) {
      const ap = st.approve;
      const list = st.all.filter(o => ap.ids.includes(o.id));
      const need = {};
      list.forEach(o => o.lines.forEach(l => { need[l.name] = (need[l.name] || 0) + l.qty; }));
      const stock = availability(Object.entries(need).map(([name, qty]) => ({ name, qty })), ap.place);
      approveVals = {
        place: ap.place, count: list.length, ids: list.map(o => o.id).join(', '),
        skipped: ap.skipped.length ? this.skippedText(st.all.filter(o => ap.skipped.includes(o.id)), 'approved') : '',
        stock, short: stock.filter(x => x.short).length,
        setPlace: (e) => { const place = e.target.value; this.setState(s => ({ approve: { ...s.approve, place } })); },
        close: () => this.setState({ approve: null }),
        confirm: () => this.doApprove()
      };
    }
    return {
      tabs: TABS.map(t => ({ ...t, count: counts[t.key] || 0, id: 'orders-tab-' + t.key, on: st.status === t.key, onClick: () => this.view({ status: t.key }) })),
      tabLabel,
      kpiPending: counts.pending,
      pageTitle: { pos: 'Retail orders', online: 'Online orders', wholesale: 'Wholesale orders' }[st.extra.channel] || 'Orders',
      newOrderHref: st.extra.channel === 'pos' || st.extra.channel === 'wholesale' ? '/pos' : '/new-order',
      sparkOrders: Array.from({ length: 7 }, (_, i) => { const a = dayFrom.getTime() - (6 - i) * 864e5; return inView.filter(o => (o.at || 0) >= a && (o.at || 0) < a + 864e5).length; }),
      sparkValue: Array.from({ length: 7 }, (_, i) => { const a = dayFrom.getTime() - (6 - i) * 864e5; return inView.filter(o => (o.at || 0) >= a && (o.at || 0) < a + 864e5).reduce((n, o) => n + (o.amount || 0), 0); }),
      find: !!(st.find || st.q || st.courier || st.payment || st.zone || extraCount),
      openFind: () => this.setState({ find: true }),
      closeFind: () => { this.setState({ find: false, extra: NO_EXTRA, draft: NO_EXTRA }); this.view({ q: '', courier: '', payment: '', zone: '' }); },
      kpiToday: inView.filter(o => (o.at || 0) >= dayFrom.getTime()).length,
      kpiTodayValue: formatBDT(inView.filter(o => (o.at || 0) >= dayFrom.getTime()).reduce((a, o) => a + (o.amount || 0), 0)),
      kpiCod: formatBDT(inView.filter(o => o.payment === 'COD' && ['approved', 'ready', 'shipped'].includes(o.statusKey)).reduce((a, o) => a + (o.amount || 0), 0)),
      kpiCodCount: inView.filter(o => o.payment === 'COD' && ['approved', 'ready', 'shipped'].includes(o.statusKey)).length,
      kpiReturnRate: (counts.delivered + counts.returned) ? Math.round((counts.returned / (counts.delivered + counts.returned)) * 100) + '%' : '—',
      kpiCourier: counts.ready + counts.shipped,
      total: counts.all,
      q: st.q, courier: st.courier, payment: st.payment, zone: st.zone,
      onSearch: (e) => this.view({ q: e.target.value }),
      onCourier: (e) => this.view({ courier: e.target.value }),
      onPayment: (e) => this.view({ payment: e.target.value }),
      onZone: (e) => this.view({ zone: e.target.value }),
      exportCsv: () => this.exportCsv(found),
      // more filters
      filtersOpen: st.filtersOpen, draft: st.draft, extraCount,
      openFilters: () => this.setState(s => ({ filtersOpen: true, draft: s.extra })),
      closeFilters: () => this.setState({ filtersOpen: false }),
      setChannel: setDraft('channel'), setAssigned: setDraft('assigned'), setMinTotal: setDraft('minTotal'),
      applyFilters: () => { this.setState(s => ({ extra: s.draft, filtersOpen: false, page: 1 })); toast('Filters applied'); },
      resetFilters: () => this.setState({ extra: NO_EXTRA, draft: NO_EXTRA, filtersOpen: false, page: 1 }),
      // table
      empty: found.length === 0,
      emptyTitle: st.q.trim() ? 'No orders match “' + st.q.trim() + '”' : 'No demo orders match these filters',
      emptyBody: 'The demo carries ' + st.all.length + ' orders. ' + (hasFilters ? 'Clear the search and filters to see the ones in this tab.' : 'Pick another status tab.'),
      hasFilters, filterCount: (st.courier ? 1 : 0) + (st.payment ? 1 : 0) + (st.zone ? 1 : 0) + extraCount,
      clearFilters: () => { this.setState({ extra: NO_EXTRA, draft: NO_EXTRA }); this.view({ q: '', courier: '', payment: '', zone: '' }); },
      caption: tabLabel + ', page ' + page + ' of ' + pages + ', ' + found.length + ' demo orders',
      countLabel: found.length === 0 ? 'No orders to show'
        : 'Showing ' + (first + 1) + '–' + (first + rows.length) + ' of ' + found.length + (found.length === 1 ? ' demo order' : ' demo orders'),
      // bulk selection
      selectionLabel: selCount + ' selected',
      hasSelection: selCount > 0,
      allChecked: pageAllChecked,
      toggleAll: () => {
        const next = { ...sel };
        rows.forEach(o => { next[o.id] = !pageAllChecked; });
        this.setState({ sel: next });
      },
      clearSelection: () => this.setState({ sel: {} }),
      sendToCourier: () => this.bulkSend(),
      printLabels: () => toast('Printing ' + selCount + (selCount === 1 ? ' label' : ' labels'), { tone: 'info' }),
      bulkApprove: () => this.startApprove(),
      bulkCancel: () => this.bulkCancel(),
      approve: approveVals,
      // pagination
      page, pages,
      pageList: Array.from({ length: pages }, (_, i) => ({ n: i + 1, on: i + 1 === page, onClick: () => this.view({ page: i + 1 }) })),
      atStart: page <= 1, atEnd: page >= pages,
      prev: () => { if (page > 1) this.view({ page: page - 1 }); },
      next: () => { if (page < pages) this.view({ page: page + 1 }); },
      rows: rows.map(o => ({
        ...o,
        href: orderHref(o.id, from),
        invoiceHref: o.invoiceId ? invoiceHref(o.invoiceId) : '',
        dups: duplicatesOf(o, st.all).map(d => d.id),
        onRowClick: (e) => { if (e.target.closest('a,button,input,label,select,.mo-sel')) return; navigate(orderHref(o.id, from)); },
        onMore: () => toast('Open ' + o.id + ' to verify, approve or ship it', { tone: 'info' }),
        statusInfo: orderStatus(o.statusKey),
        pay: PAYMENTS[o.payment] || PAYMENTS.COD,
        tracked: o.consignment !== '—',
        checked: !!sel[o.id],
        onToggle: () => this.setState(s => ({ sel: { ...s.sel, [o.id]: !s.sel[o.id] } }))
      }))
    };
  }
}

// ---- styles ----

const CSS = `
.mo-id{font-family:var(--font-data)}
.mo-dup{margin-left:6px;vertical-align:middle;cursor:help}
.mo-cust{display:block;max-width:220px;overflow:hidden;text-overflow:ellipsis}
.mo-stock{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.mo-stock th{padding:0 0 var(--space-2);border-bottom:1px solid var(--border-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:left}
.mo-stock td{padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle);white-space:normal}
.mo-stock .r{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.mo-short{color:var(--text-danger);font-weight:var(--weight-medium)}
.mo-today{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap}
.mo-today svg{color:var(--text-muted)}
`;

// ---- markup ----

const items = (o) => String(o.itemMeta || '').split(' · ')[0];

export default class MerchantOrdersScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const bulk = [
      { label: 'Approve', icon: 'check', onClick: v.bulkApprove },
      { label: 'Send to courier', icon: 'truck', onClick: v.sendToCourier },
      { label: 'Print labels', icon: 'printer', onClick: v.printLabels },
    ];
    return (
      <div className="dc-screen ds" data-screen="MerchantOrders">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="orders-all" />
          <div className="gc-shell__main">
            <__Topbar crumb="Orders" page={v.pageTitle} />
            <main className="gc-shell__content">
              <div className="ix-page">
                <ShopHeader icon="inbox" title={v.pageTitle}
                  about="Every order in one list: online, counter and wholesale. Open an order to verify, approve, pack and send it."
                  secondary={[{ label: 'Export', onClick: v.exportCsv }]}
                  more={[{ label: 'Courier returns', href: '/courier-returns' }, { label: 'Wholesale orders', href: '/wholesale-orders' }, { label: 'Order notifications', href: '/set-notifications' }]}
                  primary={{ label: 'Create order', href: v.newOrderHref }} />

                <MetricStrip label="Today's orders"
                  lead={<span className="mo-today"><__Icon name="calendar" width="16" height="16" aria-hidden="true" />Today</span>}
                  items={[
                    { label: 'Orders', value: String(v.kpiToday), spark: v.sparkOrders },
                    { label: 'Order value', value: v.kpiTodayValue, spark: v.sparkValue },
                    { label: 'COD to collect', value: v.kpiCod, sub: v.kpiCodCount + ' orders' },
                    { label: 'With courier', value: String(v.kpiCourier), href: '/merchant-orders?status=shipped' },
                    { label: 'Return rate', value: v.kpiReturnRate },
                  ]} />

                <section className="ix-card" aria-label={v.tabLabel}>
                  {v.hasSelection ? (
                    <div className="ix-bulk" role="toolbar" aria-label="Selected orders">
                      <input type="checkbox" checked={v.allChecked} onChange={v.toggleAll} aria-label="Select every order on this page" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
                      <span className="ix-bulk__n">{v.selectionLabel}</span>
                      {bulk.map((a) => <button key={a.label} type="button" className="ix-btn ix-btn--sm" onClick={a.onClick}><__Icon name={a.icon} width="16" height="16" aria-hidden="true" />{a.label}</button>)}
                      <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" align="start" items={[{ label: 'Cancel orders', onClick: v.bulkCancel, tone: 'danger' }, { label: 'Clear selection', onClick: v.clearSelection }]} />
                    </div>
                  ) : (
                    <div className="ix-bar">
                      {v.find ? (<>
                        <SearchField value={v.q} onChange={v.onSearch} placeholder="Search order, customer, phone or tracking ID" onDone={v.closeFind} autoFocus />
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.closeFind}>Cancel</button>
                      </>) : (<>
                        <IndexTabs tabs={v.tabs.map((t) => ({ ...t, onClick: t.onClick }))} label="Order status" />
                        <span className="ix-tools">
                          <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={v.openFind}><__Icon name="search" width="16" height="16" aria-hidden="true" /></button>
                        </span>
                      </>)}
                    </div>
                  )}
                  {v.find && !v.hasSelection ? (
                    <div className="ix-filters" role="group" aria-label="Filters">
                      <select aria-label="Courier" className={'ix-filter' + (v.courier ? ' is-set' : '')} value={v.courier} onChange={v.onCourier}>
                        <option value="">Courier</option><option>Steadfast</option><option>Pathao</option><option>Carrybee</option><option>RedX</option>
                      </select>
                      <select aria-label="Payment" className={'ix-filter' + (v.payment ? ' is-set' : '')} value={v.payment} onChange={v.onPayment}>
                        <option value="">Payment</option><option value="Paid">Paid</option><option value="Unpaid">Unpaid</option><option value="Partial">Partly paid</option><option value="COD">Cash on delivery</option>
                      </select>
                      <select aria-label="Delivery zone" className={'ix-filter' + (v.zone ? ' is-set' : '')} value={v.zone} onChange={v.onZone}>
                        <option value="">Delivery zone</option><option>Inside Dhaka</option><option>Sub-Dhaka</option><option>Outside Dhaka</option>
                      </select>
                      <button type="button" className={'ix-filter' + (v.extraCount ? ' is-set' : '')} onClick={v.openFilters} aria-haspopup="dialog" style={{ backgroundImage: 'none', paddingRight: 10 }}>{v.extraCount ? 'More filters · ' + v.extraCount : 'More filters'}</button>
                      {v.hasFilters ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.clearFilters}>Clear all</button> : null}
                    </div>
                  ) : null}

                  {v.empty ? (
                    <div className="ix-empty"><__EmptyState icon="inbox" title={v.emptyTitle} actionLabel={v.hasFilters ? 'Clear filters' : undefined} onAction={v.hasFilters ? v.clearFilters : undefined} /></div>
                  ) : (
                    <>
                    <ul className="ix-plist" aria-label={v.caption}>
                      {v.rows.map((o) => (
                        <li key={o.id}>
                          <__Link href={o.href} className="ix-pitem">
                            <span className="ix-pitem__top"><b className="mo-id">{o.id}</b><span>{o.total}</span></span>
                            <span className="ix-pitem__mid">{o.customer} · {o.placed}</span>
                            <span className="ix-pitem__tags">
                              <__StatusBadge tone={o.statusInfo ? o.statusInfo.tone : 'neutral'}>{o.statusInfo ? o.statusInfo.label : o.status}</__StatusBadge>
                              <__StatusBadge tone={o.pay.tone} icon={o.pay.icon}>{o.payment === 'Partial' ? 'Partly paid' : o.payment}</__StatusBadge>
                            </span>
                          </__Link>
                        </li>
                      ))}
                    </ul>
                    <div className="ix-table-wrap">
                      <table className="ix-table gc-table--keep">
                        <caption className="sr-only">{v.caption}</caption>
                        <thead>
                          <tr>
                            <th scope="col" className="ix-check"><input type="checkbox" checked={v.allChecked} onChange={v.toggleAll} aria-label="Select every order on this page" /></th>
                            <th scope="col">Order</th>
                            <th scope="col">Date</th>
                            <th scope="col">Customer</th>
                            <th scope="col">Channel</th>
                            <th scope="col" className="ix-num">Total</th>
                            <th scope="col">Payment</th>
                            <th scope="col">Status</th>
                            <th scope="col">Items</th>
                          </tr>
                        </thead>
                        <tbody>
                          {v.rows.map((o) => (
                            <tr key={o.id} className={o.checked ? 'is-sel' : ''} onClick={o.onRowClick}>
                              <td className="ix-check"><input type="checkbox" checked={o.checked} onChange={o.onToggle} aria-label={'Select ' + o.id} /></td>
                              <td>
                                <__Link href={o.href} className="ix-strong mo-id">{o.id}</__Link>
                                {o.dups.length ? <span className="gc-badge gc-badge--warning mo-dup" title={'Possible duplicate of ' + o.dups.join(', ')}>Duplicate?</span> : null}
                              </td>
                              <td className="ix-muted">{o.placed}</td>
                              <td><span className="mo-cust">{o.customer}</span></td>
                              <td className="ix-muted">{o.channel}</td>
                              <td className="ix-num">{o.total}</td>
                              <td><__StatusBadge tone={o.pay.tone} icon={o.pay.icon}>{o.payment === 'Partial' ? 'Partly paid' : o.payment}</__StatusBadge></td>
                              <td><__StatusBadge tone={o.statusInfo ? o.statusInfo.tone : 'neutral'}>{o.statusInfo ? o.statusInfo.label : o.status}</__StatusBadge></td>
                              <td className="ix-muted">{items(o)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    </>
                  )}
                  <Pager label={v.countLabel} atStart={v.atStart} atEnd={v.atEnd} prev={v.prev} next={v.next} />
                </section>
                <LearnMore topic="orders" />
              </div>
            </main>
          </div>
        </div>
        <__Dialog open={!!v.approve} title={v.approve ? "Approve " + (v.approve.count === 1 ? "1 order" : v.approve.count + " orders") : "Approve orders"} onClose={v.approve ? v.approve.close : () => {}} width={520} footer={v.approve ? <>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.approve.close}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.approve.confirm}>Approve</button>
        </> : null}>
          {v.approve ? (
            <div style={{ display: "grid", gap: "16px" }}>
              {v.approve.skipped ? <div className="gc-alert gc-alert--soft gc-alert--warning" role="alert"><__Icon name="triangle-alert" strokeWidth="1.75" width="18" height="18" aria-hidden="true" /><span>{v.approve.skipped} Only Pending orders can be approved.</span></div> : null}
              <p style={{ margin: "0", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>Approving <span style={{ fontFamily: "var(--font-data)" }}>{v.approve.ids}</span>.</p>
              {getStockPlaces().length > 1 ? <div>
                <label className="gc-label" htmlFor="mo-hold-place">{holdsStock() ? 'Hold stock at' : 'Take stock from'}</label>
                <select id="mo-hold-place" className="gc-input gc-select" data-autofocus value={v.approve.place} onChange={v.approve.setPlace}>
                  {getStockPlaces().map((x) => <option key={x}>{x}</option>)}
                </select>
              </div> : null}
              <table className="mo-stock">
                <caption className="sr-only">Free stock at {v.approve.place}</caption>
                <thead><tr><th scope="col">Product</th><th scope="col" className="r">Needed</th><th scope="col" className="r">Free here</th></tr></thead>
                <tbody>
                  {v.approve.stock.map((x) => (
                    <tr key={x.name}>
                      <td>{x.name}{!x.known ? <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Not in the stock list</span> : null}</td>
                      <td className="r">{x.qty}</td>
                      <td className={"r" + (x.short ? " mo-short" : "")}>{x.known ? x.available : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {v.approve.short ? <p className={"gc-help" + (holdsStock() ? " gc-help--error" : "")} style={{ margin: "0" }}>{holdsStock() ? (v.approve.short === 1 ? "1 product is" : v.approve.short + " products are") + " short at " + v.approve.place + "." : "Stock will go below zero."}</p> : <p className="gc-help" style={{ margin: "0" }}>In stock at {v.approve.place}.</p>}
            </div>
          ) : null}
        </__Dialog>
        <__Dialog open={!!v.filtersOpen} title="More filters" onClose={v.closeFilters} width={420} footer={<>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={v.resetFilters}>Reset</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.applyFilters}>Apply filters</button>
        </>}>
          <div style={{ display: "grid", gap: "16px" }}>
            <div>
              <label className="gc-label" htmlFor="mo-f-channel">Sales channel</label>
              <select id="mo-f-channel" className="gc-input" value={v.draft ? v.draft.channel : ""} onChange={v.setChannel}>
                <option value="">All channels</option>
                <option value="online">Online store</option>
                <option value="pos">Retail (POS)</option>
                <option value="wholesale">Wholesale</option>
              </select>
            </div>
            <div>
              <label className="gc-label" htmlFor="mo-f-assigned">Courier tracking</label>
              <select id="mo-f-assigned" className="gc-input" value={v.draft ? v.draft.assigned : ""} onChange={v.setAssigned}>
                <option value="">Any</option>
                <option value="yes">Has a tracking ID</option>
                <option value="no">No tracking ID yet</option>
              </select>
            </div>
            <div>
              <label className="gc-label" htmlFor="mo-f-min">Minimum order total (৳)</label>
              <input id="mo-f-min" className="gc-input" type="number" min="0" step="100" inputMode="numeric" placeholder="0" value={v.draft ? v.draft.minTotal : ""} onChange={v.setMinTotal} />
            </div>
          </div>
        </__Dialog>
      </div>
    );
  }
}
