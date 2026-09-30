'use client';
// Generated from design/templates/merchant-orders/MerchantOrders.dc.html by scripts/convert-design.mjs.
// MerchantOrders — All-orders workspace — status tabs with live counts, filter bar, bulk actions, dense order table with courier and payment columns, pagination.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { toast, confirmDialog } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { Dialog as __Dialog, EmptyState as __EmptyState, StatusBadge as __StatusBadge } from '@/components/ui';
import { ORDER_STATUSES, ORDER_TOTAL, orderStatus } from '@/lib/orderStatus';
import { STOCK_PLACES } from '@/lib/locations';
import { holdsFor } from '@/lib/stockHolds';
import { demoOrders, getOrders, duplicatesOf, orderHref, invoiceHref, availability, approveOrder, cancelOrder, heldText, CAN_APPROVE, CAN_CANCEL, DEFAULT_HOLD_PLACE } from '@/lib/orders';

// ---- logic (from the design's <script type="text/x-dc">) ----

const PAGE_SIZE = 5;
const RANGES = ['Today', 'Last 7 days', 'Last 30 days', 'This month'];
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
  state = { all: DEMO_ORDERS, status: 'all', q: '', courier: '', payment: '', zone: '', page: 1, sel: {}, range: 'Last 30 days', rangeOpen: false, filtersOpen: false, extra: NO_EXTRA, draft: NO_EXTRA, approve: null };
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
  reload() { this.setState({ all: getOrders() }); }
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
    if (!valid.length) { toast('None of the selected orders is Pending, so none can be approved. ' + this.skippedText(skipped, 'approved'), { tone: 'error' }); return; }
    this.setState({ approve: { ids: valid.map(o => o.id), skipped: skipped.map(o => o.id), place: DEFAULT_HOLD_PLACE } });
  }
  doApprove() {
    const { ids, place } = this.state.approve;
    const list = this.state.all.filter(o => ids.includes(o.id));
    list.forEach(o => approveOrder(o, place));
    this.setState({ approve: null, sel: {} });
    this.reload();
    toast(plural(list.length, 'order') + ' approved · stock held at ' + place);
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
    toast(plural(valid.length, 'order') + ' cancelled' + (held.length ? ' · ' + held.reduce((a, h) => a + h.qty, 0) + ' pcs back in stock' : ''));
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
    const head = ['Order', 'Placed', 'Channel', 'Customer', 'Phone', 'Zone', 'Items', 'Courier', 'Tracking', 'Status', 'Payment', 'Total (BDT)'];
    const cell = (c) => '"' + String(c).replace(/"/g, '""') + '"';
    const lines = [head, ...rows.map(o => [o.id, o.placed, o.channel, o.customer, o.phone, o.zone, o.itemTitle + ' (' + o.itemMeta + ')', o.courier, o.consignment, o.status, o.payment, o.amount])];
    const blob = new Blob(['﻿' + lines.map(l => l.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'orders-' + this.state.status + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Exported ' + rows.length + (rows.length === 1 ? ' order' : ' orders') + ' to ' + a.download);
  }
  closeRange(refocus) {
    this.setState({ rangeOpen: false }, () => { if (refocus) { const b = document.getElementById('orders-range-btn'); if (b) b.focus(); } });
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
    const extraCount = (st.extra.channel ? 1 : 0) + (st.extra.assigned ? 1 : 0) + (Number(st.extra.minTotal) > 0 ? 1 : 0);
    const hasFilters = !!(st.q || st.courier || st.payment || st.zone || extraCount);
    const focusTab = (key) => setTimeout(() => { const el = document.getElementById('orders-tab-' + key); if (el) el.focus(); }, 0);
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
      tabs: TABS.map(t => ({ ...t, id: 'orders-tab-' + t.key, on: st.status === t.key, onClick: () => this.view({ status: t.key }) })),
      activeTabId: 'orders-tab-' + st.status,
      onTabKey: (e) => {
        const i = TABS.findIndex(t => t.key === st.status);
        const next = e.key === 'ArrowRight' ? (i + 1) % TABS.length : e.key === 'ArrowLeft' ? (i - 1 + TABS.length) % TABS.length : e.key === 'Home' ? 0 : e.key === 'End' ? TABS.length - 1 : -1;
        if (next < 0) return;
        e.preventDefault();
        this.view({ status: TABS[next].key });
        focusTab(TABS[next].key);
      },
      tabLabel,
      kpiPending: orderStatus('pending').count,
      pageTitle: { pos: 'Retail orders', online: 'Online orders', wholesale: 'Wholesale orders' }[st.extra.channel] || 'All orders',
      newOrderHref: st.extra.channel === 'pos' || st.extra.channel === 'wholesale' ? '/pos' : '/new-order',
      kpiToday: 77, // demo figure, same as the Home sales strip
      kpiApproved: orderStatus('approved').count,
      kpiDispatched: 58, // demo figure: parcels handed to couriers today
      kpiShipped: orderStatus('shipped').count,
      kpiCourier: orderStatus('ready').count + orderStatus('shipped').count,
      total: ORDER_TOTAL,
      q: st.q, courier: st.courier, payment: st.payment, zone: st.zone,
      onSearch: (e) => this.view({ q: e.target.value }),
      onCourier: (e) => this.view({ courier: e.target.value }),
      onPayment: (e) => this.view({ payment: e.target.value }),
      onZone: (e) => this.view({ zone: e.target.value }),
      // date range menu
      range: st.range, rangeOpen: st.rangeOpen,
      ranges: RANGES.map(r => ({ label: r, on: r === st.range, onClick: () => { this.setState({ range: r }); this.closeRange(true); toast('Showing orders for: ' + r.toLowerCase(), { tone: 'info' }); } })),
      toggleRange: () => this.setState(s => ({ rangeOpen: !s.rangeOpen }), () => {
        if (this.state.rangeOpen) { const el = document.querySelector('#orders-range-menu [aria-checked="true"]'); if (el) el.focus(); }
      }),
      closeRange: () => this.closeRange(false),
      onRangeKey: (e) => {
        if (e.key === 'Escape') { e.preventDefault(); this.closeRange(true); return; }
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        const items = Array.from(document.querySelectorAll('#orders-range-menu [role="menuitemradio"]'));
        const i = items.indexOf(document.activeElement);
        const el = items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length];
        if (el) el.focus();
      },
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
      hasFilters,
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
      sendToCourier: () => { toast(selCount + (selCount === 1 ? ' order' : ' orders') + ' sent to courier'); this.setState({ sel: {} }); },
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
        onMore: () => toast('Approve, cancel, hold and return ' + o.id + ' from its order page', { tone: 'info' }),
        statusInfo: orderStatus(o.statusKey),
        pay: PAYMENTS[o.payment] || PAYMENTS.COD,
        tracked: o.consignment !== '—',
        checked: !!sel[o.id],
        onToggle: () => this.setState(s => ({ sel: { ...s.sel, [o.id]: !s.sel[o.id] } }))
      }))
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `/* order KPI strip: icon tile + label over value, two lines, compact */
.mo-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}
.mo-kpi{display:flex;align-items:center;gap:12px;padding:12px 16px;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.mo-kpi__icon{flex:none;display:grid;place-items:center;width:44px;height:44px;border-radius:var(--radius-lg)}
.mo-kpi__text{min-width:0}
.mo-kpi__label{margin:0;font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mo-kpi__value{margin:2px 0 0;font-size:var(--text-xl);line-height:26px;font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
body{margin:0;background:#eef2f7;font-family:var(--font-sans);color:#475569}a{color:#003087;text-decoration:none}a:hover{color:#002a77}table{border-collapse:collapse}
.dc-h213:hover{background:#002a77 !important}
.dc-h214:hover{border-color:#94a3b8 !important}
.dc-h215:hover{border-color:#94a3b8 !important}
.dc-h216:hover{background:rgba(203,213,225,.25) !important}
.dc-h217:hover{border-color:#94a3b8 !important}
.dc-h218:hover{background:#f1f5f9 !important}
.dc-h219:hover{background:rgba(203,213,225,.3) !important;color:#003087 !important}
.dc-h220:hover{background:rgba(203,213,225,.3) !important;color:#475569 !important}
.mo-menuitem:hover,.mo-menuitem:focus-visible{background:#f1f5f9 !important}
.mo-page[disabled]{opacity:.5;cursor:not-allowed !important}
.mo-items{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.mo-bulk{min-width:380px;flex-wrap:wrap}
.mo-row{cursor:pointer}
.mo-inv{display:block;margin-top:2px;font-family:var(--font-data);font-size:var(--text-xs);color:var(--primary)}
.mo-inv--none{color:var(--text-muted);font-family:var(--font-sans)}
.mo-dup{margin-top:4px;cursor:help}
.mo-stock{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.mo-stock th{padding:0 0 var(--space-2);border-bottom:1px solid var(--border-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:left}
.mo-stock td{padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle);white-space:normal}
.mo-stock .r{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.mo-short{color:var(--text-danger);font-weight:var(--weight-medium)}
@media (max-width:640px){.mo-bulk{min-width:0;width:100%;justify-content:flex-start !important}}`;

const TH = { background: "#e2e8f0", padding: "10px 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", color: "#1e293b", whiteSpace: "nowrap" };
const TD = { padding: "14px 12px", borderBottom: "1px solid #e2e8f0" };
const OUTLINE_BTN = { display: "inline-flex", height: "36px", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer", whiteSpace: "nowrap" };
const FILTER_SELECT = { height: "36px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", color: "#475569" };
const PAGE_BTN = { minWidth: "32px", height: "32px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer" };

// ---- markup ----

export default class MerchantOrdersScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="MerchantOrders">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ display: "flex", gap: "12px", padding: "12px", background: "#eef2f7" }}>
          <__Sidebar sticky="" active="orders-all" />
          <div className="gc-shell__main" style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#f8fafc" }}>
            <__Topbar crumb="Orders" page="All orders" />
            <main style={{ padding: "28px 32px 40px", display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: "16px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "16px", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
                    <h1 style={{ margin: "0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>{v.pageTitle}</h1>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.1)", padding: "5px 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-success)" }}><span aria-hidden="true" style={{ width: "7px", height: "7px", borderRadius: "var(--radius-full)", background: "#10b981" }} />Live</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
                  <span style={{ position: "relative", display: "inline-block" }}>
                    <button id="orders-range-btn" type="button" className="dc-h214" aria-haspopup="menu" aria-expanded={v.rangeOpen ? "true" : "false"} aria-controls="orders-range-menu" onClick={v.toggleRange} style={OUTLINE_BTN}><__Icon name="calendar" strokeWidth="1.75" width="18" height="18" aria-hidden="true" /><span className="sr-only">Date range: </span>{v.range}<__Icon name="chevron-down" strokeWidth="1.75" width="16" height="16" aria-hidden="true" /></button>
                    {v.rangeOpen ? (<>
                      <span aria-hidden="true" onClick={v.closeRange} style={{ position: "fixed", inset: "0", zIndex: "95" }} />
                      <div id="orders-range-menu" role="menu" aria-label="Date range" onKeyDown={v.onRangeKey} style={{ position: "absolute", top: "calc(100% + 6px)", left: "0", zIndex: "96", minWidth: "190px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 10px 30px rgba(15,23,42,.14)", padding: "6px" }}>
                        {__list(v.ranges).map((r) => (
                          <button key={r.label} type="button" role="menuitemradio" aria-checked={r.on ? "true" : "false"} className="mo-menuitem" onClick={r.onClick} style={{ display: "flex", width: "100%", height: "36px", alignItems: "center", justifyContent: "space-between", gap: "12px", border: "none", borderRadius: "var(--radius-md)", background: "none", padding: "0 10px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: r.on ? "var(--weight-semibold)" : "var(--weight-regular)", color: r.on ? "#003087" : "#475569", cursor: "pointer", textAlign: "left" }}>{r.label}{r.on ? <__Icon name="check" strokeWidth="2" width="16" height="16" aria-hidden="true" /> : null}</button>
                        ))}
                      </div>
                    </>) : null}
                  </span>
                  <button type="button" className="dc-h215" onClick={v.exportCsv} style={OUTLINE_BTN}><__Icon name="download" strokeWidth="1.75" width="18" height="18" aria-hidden="true" />Export CSV</button>
                  <__Link href="/courier-returns" className="dc-h215" style={{ ...OUTLINE_BTN, textDecoration: "none" }}><__Icon name="package-x" strokeWidth="1.75" width="18" height="18" aria-hidden="true" />Courier returns</__Link>
                  <__Link href={v.newOrderHref} className="dc-h213" style={{ display: "inline-flex", height: "36px", alignItems: "center", gap: "8px", border: "none", textDecoration: "none", borderRadius: "var(--radius-lg)", background: "#003087", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}><__Icon name="plus" strokeWidth="1.75" width="18" height="18" aria-hidden="true" />New order</__Link>
                </div>
              </div>
              <div className="mo-kpis">
                <div className="mo-kpi">
                  <span className="mo-kpi__icon" style={{ background: "var(--fill-primary-soft)", color: "var(--primary)" }}>
                    <__Icon name="shopping-cart" strokeWidth="1.75" width="24" height="24" aria-hidden="true" />
                  </span>
                  <div className="mo-kpi__text">
                    <p className="mo-kpi__label">Total orders today</p>
                    <p className="mo-kpi__value">{v.kpiToday}</p>
                  </div>
                </div>
                <div className="mo-kpi">
                  <span className="mo-kpi__icon" style={{ background: "var(--fill-success-soft)", color: "var(--text-success)" }}>
                    <__Icon name="circle-check" strokeWidth="1.75" width="24" height="24" aria-hidden="true" />
                  </span>
                  <div className="mo-kpi__text">
                    <p className="mo-kpi__label">Approved orders</p>
                    <p className="mo-kpi__value">{v.kpiApproved}</p>
                  </div>
                </div>
                <div className="mo-kpi">
                  <span className="mo-kpi__icon" style={{ background: "var(--fill-accent-soft)", color: "var(--accent-text)" }}>
                    <__Icon name="truck" strokeWidth="1.75" width="24" height="24" aria-hidden="true" />
                  </span>
                  <div className="mo-kpi__text">
                    <p className="mo-kpi__label">Courier dispatched</p>
                    <p className="mo-kpi__value">{v.kpiDispatched}</p>
                  </div>
                </div>
                <div className="mo-kpi">
                  <span className="mo-kpi__icon" style={{ background: "var(--fill-warning-soft)", color: "var(--text-warning)" }}>
                    <__Icon name="send" strokeWidth="1.75" width="24" height="24" aria-hidden="true" />
                  </span>
                  <div className="mo-kpi__text">
                    <p className="mo-kpi__label">Shipped</p>
                    <p className="mo-kpi__value">{v.kpiShipped}</p>
                  </div>
                </div>
              </div>
              <div style={{ borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                <div role="tablist" aria-label="Order status" onKeyDown={v.onTabKey} style={{ display: "flex", flexWrap: "wrap", gap: "4px", padding: "10px 16px", borderBottom: "1px solid #e2e8f0" }}>
                  {__list(v.tabs).map((t) => (
                    <button key={t.key} id={t.id} type="button" role="tab" aria-selected={t.on ? "true" : "false"} aria-controls="orders-panel" tabIndex={t.on ? 0 : -1} className={t.on ? undefined : "dc-h216"} onClick={t.onClick} style={{ display: "inline-flex", height: "36px", alignItems: "center", gap: "8px", border: "none", borderRadius: "var(--radius-full)", background: t.on ? "rgba(0,48,135,.1)" : "none", boxShadow: t.on ? "inset 0 0 0 1.5px #003087" : "none", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: t.on ? "var(--weight-semibold)" : "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: t.on ? "#003087" : "#475569", cursor: "pointer", whiteSpace: "nowrap" }}>{t.on ? <__Icon name="check" strokeWidth="2" width="14" height="14" aria-hidden="true" /> : null}{t.label}<span style={{ fontVariantNumeric: "tabular-nums", color: t.on ? "#003087" : "var(--text-muted)" }}>{t.count}</span></button>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", flex: "1 1 320px", minWidth: "0" }}>
                    <span style={{ position: "relative", display: "inline-block", flex: "1 1 220px", minWidth: "0", maxWidth: "320px" }}>
                      <input aria-label="Search orders by ID, phone or customer" type="search" value={v.q} onChange={v.onSearch} placeholder="Search order ID, phone, customer…" style={{ width: "100%", boxSizing: "border-box", height: "36px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px 0 36px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", color: "#1e293b" }} />
                      <span aria-hidden="true" style={{ position: "absolute", left: "0", top: "0", display: "flex", width: "36px", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", pointerEvents: "none" }}>
                        <__Icon name="search" strokeWidth="1.75" width="16" height="16" />
                      </span>
                    </span>
                    <select aria-label="Filter by courier" value={v.courier} onChange={v.onCourier} style={FILTER_SELECT}>
                      <option value="">All couriers</option>
                      <option>Steadfast</option>
                      <option>Pathao</option>
                      <option>Carrybee</option>
                      <option>RedX</option>
                    </select>
                    <select aria-label="Filter by payment" value={v.payment} onChange={v.onPayment} style={FILTER_SELECT}>
                      <option value="">Any payment</option>
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Partial">Partially paid</option>
                      <option value="COD">Cash on delivery</option>
                    </select>
                    <select aria-label="Filter by delivery zone" value={v.zone} onChange={v.onZone} style={FILTER_SELECT}>
                      <option value="">All zones</option>
                      <option>Inside Dhaka</option>
                      <option>Sub-Dhaka</option>
                      <option>Outside Dhaka</option>
                    </select>
                    <button type="button" className="dc-h217" onClick={v.openFilters} aria-haspopup="dialog" style={{ ...OUTLINE_BTN, padding: "0 12px", fontSize: "var(--text-xs-plus)" }}><__Icon name="sliders-horizontal" strokeWidth="1.75" width="15" height="15" aria-hidden="true" />More filters{v.extraCount ? <span style={{ display: "inline-grid", minWidth: "18px", height: "18px", placeItems: "center", borderRadius: "var(--radius-full)", background: "#003087", padding: "0 5px", fontSize: "var(--text-xs)", color: "#fff" }}><span className="sr-only">active: </span>{v.extraCount}</span> : null}</button>
                  </div>
                  <div className="mo-bulk" aria-live="polite" style={{ marginLeft: "auto", display: "flex", minHeight: "36px", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                    {v.hasSelection ? (<>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155", whiteSpace: "nowrap" }}>{v.selectionLabel}</span>
                      <button type="button" onClick={v.bulkApprove} style={{ height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "var(--primary)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}>Approve</button>
                      <button type="button" onClick={v.bulkCancel} style={{ height: "36px", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", background: "var(--surface-card)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-danger)", cursor: "pointer", whiteSpace: "nowrap" }}>Cancel orders</button>
                      <button type="button" onClick={v.sendToCourier} style={{ height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087", cursor: "pointer", whiteSpace: "nowrap" }}>Send to courier</button>
                      <button type="button" onClick={v.printLabels} style={{ height: "36px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer", whiteSpace: "nowrap" }}>Print labels</button>
                      <button type="button" onClick={v.clearSelection} aria-label="Clear selection" style={{ height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "none", padding: "0 8px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", cursor: "pointer" }}>Clear</button>
                    </>) : (
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Select rows for bulk actions</span>
                    )}
                  </div>
                </div>
                <div id="orders-panel" role="tabpanel" aria-labelledby={v.activeTabId}>
                  {v.empty ? (
                    <__EmptyState title={v.emptyTitle} body={v.emptyBody} actionLabel={v.hasFilters ? "Clear filters" : undefined} onAction={v.clearFilters} />
                  ) : (
                    <div className="gc-table-wrap" style={{ minWidth: "0", overflowX: "auto" }}>
                      <table style={{ width: "100%", minWidth: "1100px", textAlign: "left", fontSize: "var(--text-sm)" }}>
                        <caption className="sr-only">{v.caption}</caption>
                        <thead>
                          <tr>
                            <th scope="col" style={{ ...TH, width: "36px" }}>
                              <input aria-label="Select all orders" type="checkbox" checked={v.allChecked} onChange={v.toggleAll} style={{ width: "15px", height: "15px", accentColor: "#003087" }} />
                            </th>
                            <th scope="col" style={{ ...TH, minWidth: "150px" }}>Order</th>
                            <th scope="col" style={{ ...TH, minWidth: "200px" }}>Customer</th>
                            <th scope="col" style={{ ...TH, minWidth: "200px" }}>Items</th>
                            <th scope="col" style={{ ...TH, minWidth: "130px" }}>Courier</th>
                            <th scope="col" style={{ ...TH, minWidth: "130px" }}>Status</th>
                            <th scope="col" style={{ ...TH, minWidth: "100px" }}>Payment</th>
                            <th scope="col" style={{ ...TH, minWidth: "100px", textAlign: "right" }}>Total</th>
                            <th scope="col" style={{ ...TH, width: "64px" }}><span className="sr-only">Actions</span></th>
                          </tr>
                        </thead>
                        <tbody>
                          {__list(v.rows).map((o) => (
                            <tr key={o.id} className="dc-h218 mo-row" onClick={o.onRowClick}>
                              <td className="mo-sel" style={TD}>
                                <input aria-label={"Select order " + o.id} type="checkbox" checked={o.checked} onChange={o.onToggle} style={{ width: "15px", height: "15px", accentColor: "#003087" }} />
                              </td>
                              <td style={{ ...TD, whiteSpace: "nowrap" }}>
                                <__Link href={o.href} style={{ fontFamily: "var(--font-data)", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}>{o.id}</__Link>
                                {o.invoiceHref
                                  ? <__Link href={o.invoiceHref} className="mo-inv" aria-label={o.invoiceKind + " " + o.invoiceId + " for order " + o.id}>{o.invoiceKind} {o.invoiceId}</__Link>
                                  : <span className="mo-inv mo-inv--none">No invoice yet</span>}
                                <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{o.placed} · {o.channel}</p>
                                {o.dups.length ? <span className="gc-badge gc-badge--warning mo-dup" title={"Same phone and product as " + o.dups.join(", ") + " within 48 hours"}><__Icon name="copy" strokeWidth="1.75" width="12" height="12" aria-hidden="true" />Possible duplicate<span className="sr-only"> of {o.dups.join(", ")}</span></span> : null}
                              </td>
                              <td style={TD}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                                  <span aria-hidden="true" style={{ width: "30px", height: "30px", flex: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>{o.initials}</span>
                                  <span>
                                    <span style={{ display: "block", color: "#1e293b", whiteSpace: "nowrap" }}>{o.customer}</span>
                                    <span style={{ display: "block", fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{o.phone} · {o.zone}</span>
                                  </span>
                                </span>
                              </td>
                              <td style={{ ...TD, maxWidth: "280px" }}>
                                <span className="mo-items" title={o.itemTitle} style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>{o.itemTitle}</span>
                                <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{o.itemMeta}</span>
                              </td>
                              <td style={{ ...TD, whiteSpace: "nowrap" }}>
                                <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "#475569" }}>{o.courier}</span>
                                {o.tracked
                                  ? <span style={{ display: "block", fontFamily: "var(--font-data)", fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{o.consignment}</span>
                                  : <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>No tracking ID</span>}
                              </td>
                              <td style={{ ...TD, whiteSpace: "nowrap" }}>
                                <__StatusBadge tone={o.statusInfo ? o.statusInfo.tone : "neutral"} icon={o.statusInfo ? o.statusInfo.icon : undefined}>{o.status}</__StatusBadge>
                              </td>
                              <td style={{ ...TD, whiteSpace: "nowrap" }}>
                                <__StatusBadge tone={o.pay.tone} icon={o.pay.icon}>{o.payment}</__StatusBadge>
                              </td>
                              <td style={{ ...TD, textAlign: "right", fontWeight: "var(--weight-medium)", color: "#334155", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{o.total}</td>
                              <td style={{ ...TD, textAlign: "right" }}>
                                <span style={{ display: "inline-flex", gap: "2px" }}>
                                  <__Link className="dc-h219" href={o.href} style={{ width: "28px", height: "28px", display: "grid", placeItems: "center", borderRadius: "var(--radius-lg)", color: "var(--text-muted)" }} aria-label={"Open order " + o.id}>
                                    <__Icon name="eye" strokeWidth="1.75" width="16" height="16" aria-hidden="true" />
                                  </__Link>
                                  <button type="button" className="dc-h220" onClick={o.onMore} style={{ width: "28px", height: "28px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-lg)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label={"More actions for order " + o.id}>
                                    <__Icon name="more-vertical" strokeWidth="1.75" width="16" height="16" aria-hidden="true" />
                                  </button>
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "14px 16px" }}>
                    <span role="status" style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.countLabel}<span> · tab counts are store totals</span></span>
                    <nav aria-label="Orders pages" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <button type="button" className="mo-page" onClick={v.prev} disabled={v.atStart} style={PAGE_BTN}>Previous</button>
                      {__list(v.pageList).map((p) => (
                        <button key={p.n} type="button" onClick={p.onClick} aria-label={"Page " + p.n} aria-current={p.on ? "page" : undefined} style={p.on ? { ...PAGE_BTN, border: "1px solid #003087", background: "#003087", color: "#fff", textDecoration: "underline" } : PAGE_BTN}>{p.n}</button>
                      ))}
                      <button type="button" className="mo-page" onClick={v.next} disabled={v.atEnd} style={PAGE_BTN}>Next</button>
                    </nav>
                  </div>
                </div>
              </div>
              <p style={{ margin: "0", textAlign: "center", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>GridCommerce · All Together. More Commerce.</p>
            </main>
          </div>
        </div>
        <__Dialog open={!!v.approve} title={v.approve ? "Approve " + (v.approve.count === 1 ? "1 order" : v.approve.count + " orders") : "Approve orders"} onClose={v.approve ? v.approve.close : () => {}} width={520} footer={v.approve ? <>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.approve.close}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.approve.confirm}>Approve and hold stock</button>
        </> : null}>
          {v.approve ? (
            <div style={{ display: "grid", gap: "16px" }}>
              {v.approve.skipped ? <div className="gc-alert gc-alert--soft gc-alert--warning" role="alert"><__Icon name="triangle-alert" strokeWidth="1.75" width="18" height="18" aria-hidden="true" /><span>{v.approve.skipped} Only Pending orders can be approved.</span></div> : null}
              <p style={{ margin: "0", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>Approving <span style={{ fontFamily: "var(--font-data)" }}>{v.approve.ids}</span>. Their items are held at one place until they are delivered or come back.</p>
              <div>
                <label className="gc-label" htmlFor="mo-hold-place">Hold stock from</label>
                <select id="mo-hold-place" className="gc-input gc-select" data-autofocus value={v.approve.place} onChange={v.approve.setPlace}>
                  {STOCK_PLACES.map((x) => <option key={x}>{x}</option>)}
                </select>
              </div>
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
              {v.approve.short ? <p className="gc-help gc-help--error" style={{ margin: "0" }}>{v.approve.short === 1 ? "1 product is" : v.approve.short + " products are"} short at {v.approve.place}. Pick another place, or approve anyway and restock before packing.</p> : <p className="gc-help" style={{ margin: "0" }}>Every item is free to hold at {v.approve.place}.</p>}
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
