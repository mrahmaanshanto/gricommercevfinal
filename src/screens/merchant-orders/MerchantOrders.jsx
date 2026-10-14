'use client';
// Generated from design/templates/merchant-orders/MerchantOrders.dc.html by scripts/convert-design.mjs.
// MerchantOrders — All orders, laid out like Shopify's order list (components/ui/IndexKit.jsx): title row, today's
// figures, then one card with the status views, search and filters, bulk actions and a compact table. The list shows
// what you act on (order, date, customer, channel, total, payment, status, items); courier, phone and the rest are
// on the order page.
// Brief #4 additions: the views Payment to review (paymentProof.js) and Completed (orderRules.js › completionOf), the
// shop's own sub-statuses as a badge and a filter (orderRules.js), and bulk Send to courier / Print labels running in
// the background with a progress strip and per-order results (orderJobs.js, OrderJobs.jsx).
// Date filter (Today, Yesterday, Last 7 days, This month, custom dates) and sort (newest, oldest, total high / low,
// oldest unconfirmed first) are kept in the address like the other filters (?date=&from=&to=&sort=).
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
import { ORDER_STATUSES, ORDER_TOTAL, orderStatus, ORDER_TABS, tabKeys, NEW_KEYS } from '@/lib/orderStatus';
import { getStockPlaces, onlinePlace } from '@/lib/locations';
import { holdsFor } from '@/lib/stockHolds';
import { demoOrders, getOrders, duplicatesOf, orderHref, invoiceHref, availability, approveOrder, cancelOrder, heldText, CAN_APPROVE, CAN_CANCEL, DEFAULT_HOLD_PLACE } from '@/lib/orders';
import { syncCourier, verifyOf } from '@/lib/orderFlow';
import { holdsStock, wholesaleOn, hasModule } from '@/lib/edition';
import { orderStates } from '@/lib/orderStates';
import { getOrderRules, customStatusOf, completionOf } from '@/lib/orderRules';
import { proofToReview } from '@/lib/paymentProof';
import { startJob } from '@/lib/orderJobs';
import { OrderJobs } from '@/screens/merchant-orders/OrderJobs';
import { sendReceipt } from '@/lib/receipts';
import { invoiceFromOrder } from '@/components/SaleInvoice';
import { saleOfOrder } from '@/lib/customerWarranty';
import { ModuleSetup } from '@/components/ModuleSetup';
import { getDrafts, deleteDraft, draftItems, DRAFTS_EVENT } from '@/lib/orderDrafts';
import { formatDate, formatTime } from '@/lib/format';

// ---- logic (from the design's <script type="text/x-dc">) ----

const PAGE_SIZE = 20;
// The tabs are the shop's standard statuses (orderStatus.js › ORDER_TABS): each groups one or more saved statuses.
// Two more views are worked out, not saved statuses: a payment proof waiting, and Completed by the shop's rule.
const VIEWS = [{ key: 'review', label: 'Payment to review' }, { key: 'completed', label: 'Completed' }];
const TABS = [{ key: 'all', label: 'All', count: ORDER_TOTAL }, ...ORDER_TABS, ...VIEWS];
// Retail (no online module): every order is a counter sale, finished or on due, so the courier steps don't apply.
const RETAIL_TABS = [{ key: 'all', label: 'All' }, { key: 'pending', label: 'Payment due' }, { key: 'delivered', label: 'Completed' }, orderStatus('cancelled'), orderStatus('returned')];
// Drafts (orderDrafts.js): orders saved half-made from Create order; a tab only while there are some.
const isView = (k) => VIEWS.some((v) => v.key === k) || k === 'drafts';
/** The worked-out facts the list filters on: proof to review, completed, sub-status (read in the browser only). */
const annotate = (list) => { const rules = getOrderRules(); return list.map((o) => ({ ...o, toReview: !!proofToReview(o), done: completionOf(o, { rules }).done, sub2: customStatusOf(o, rules) })); };
const PAYMENTS = {
  Paid: { tone: 'success', icon: 'check' },
  Unpaid: { tone: 'error', icon: 'circle-alert' },
  Partial: { tone: 'warning', icon: 'circle-dashed' },
  COD: { tone: 'neutral', icon: 'banknote' }
};
const NO_EXTRA = { channel: '', assigned: '', minTotal: '' };
// placed-date filter and sort (?date=&from=&to=&sort=)
const DATES = [['', 'Any date'], ['today', 'Today'], ['yesterday', 'Yesterday'], ['7d', 'Last 7 days'], ['month', 'This month'], ['custom', 'Custom dates']];
const SORTS = [['', 'Newest first'], ['oldest', 'Oldest first'], ['total-desc', 'Total: high to low'], ['total-asc', 'Total: low to high'], ['unconfirmed', 'Oldest unconfirmed']];
const isDay = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d || '');
/** [from, to) in ms for a date filter, or null for any date. Today follows the browser's clock (read after mount). */
function dateRange(key, from, to, now = Date.now()) {
  const d = new Date(now); d.setHours(0, 0, 0, 0);
  const day = (n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x.getTime(); };
  if (key === 'today') return [day(0), Infinity];
  if (key === 'yesterday') return [day(-1), day(0)];
  if (key === '7d') return [day(-6), Infinity];
  if (key === 'month') { const x = new Date(d); x.setDate(1); return [x.getTime(), Infinity]; }
  if (key === 'custom') {
    const end = isDay(to) ? new Date(to + 'T00:00:00') : null;
    if (end) end.setDate(end.getDate() + 1);
    return [isDay(from) ? new Date(from + 'T00:00:00').getTime() : -Infinity, end ? end.getTime() : Infinity];
  }
  return null;
}
/** Waiting for the confirmation call: a new order whose call hasn't confirmed it yet. */
const unconfirmed = (o) => NEW_KEYS.includes(o.statusKey) && !/^(POS|Wholesale)/.test(o.channel) && !o.isInvoice && (verifyOf(o) || {}).state !== 'confirmed';
const SORT_BY = {
  '': (a, b) => (b.at || 0) - (a.at || 0),
  oldest: (a, b) => (a.at || 0) - (b.at || 0),
  'total-desc': (a, b) => (b.amount || 0) - (a.amount || 0) || (b.at || 0) - (a.at || 0),
  'total-asc': (a, b) => (a.amount || 0) - (b.amount || 0) || (b.at || 0) - (a.at || 0),
  unconfirmed: (a, b) => { const x = a._u ? 0 : 1, y = b._u ? 0 : 1; return x - y || (x === 0 ? (a.at || 0) - (b.at || 0) : (b.at || 0) - (a.at || 0)); },
};
// The orders come from src/lib/orders.js: the demo orders, orders made in this browser and the
// demo wholesale invoices, with status changes kept in this browser applied.
const DEMO_ORDERS = demoOrders();
const digits = (t) => String(t).replace(/[^0-9]/g, '');
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');

class Component extends DCLogic {
  state = { online: true, all: DEMO_ORDERS, status: 'all', q: '', courier: '', payment: '', zone: '', sub: '', date: '', from: '', to: '', sort: '', page: 1, sel: {}, find: false, filtersOpen: false, extra: NO_EXTRA, draft: NO_EXTRA, approve: null, drafts: [] };
  componentDidMount() {
    this.paint();
    this.readUrl();
    // wholesale demo invoices show in All orders too, next to the orders made in this browser
    this.reload();
    // The sidebar's status links change only the query string, so watch it (Back/Forward included).
    this._onPop = () => this.readUrl();
    window.addEventListener('popstate', this._onPop);
    this._watch = setInterval(() => { if (window.location.search !== this._search) this.readUrl(); }, 400);
    this._onDrafts = () => this.setState({ drafts: getDrafts() });
    window.addEventListener(DRAFTS_EVENT, this._onDrafts);
  }
  reload() { syncCourier(); this.setState({ ready: true, online: hasModule('online'), all: annotate(getOrders()), rules: getOrderRules(), drafts: getDrafts() }); }
  async removeDraft(d) {
    const ok = await confirmDialog({ title: 'Delete draft ' + d.id + '?', body: 'The products, customer and notes saved in it are lost.', confirmLabel: 'Delete draft', tone: 'danger' });
    if (!ok) return;
    deleteDraft(d.id);
    this.setState({ drafts: getDrafts() });
    toast('Draft ' + d.id + ' deleted');
  }
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
  /** Book every selected order with its courier in the background (orderJobs.js): orders that aren't Ready for
   *  courier show as failed with the reason; the courier's API may refuse some, each with Retry. */
  bulkSend() {
    const { valid, skipped } = this.pick(['ready']);
    if (!valid.length) { toast('Only Ready for courier orders can be sent. ' + this.skippedText(skipped, 'sent'), { tone: 'error' }); return; }
    startJob('courier', [...valid, ...skipped]);
    this.setState({ sel: {} });
    toast('Booking ' + plural(valid.length, 'order') + ' in the background', { tone: 'info' });
  }
  /** Make the labels of the selected orders in the background; they print together when ready. */
  /** Send the receipt by SMS to every selected order that has a mobile number. */
  bulkReceipts() {
    const list = this.state.all.filter((o) => this.state.sel[o.id]);
    const ok = list.filter((o) => digits(o.phone).length >= 10);
    let sent = 0;
    ok.forEach((o) => { if (sendReceipt(invoiceFromOrder(o, saleOfOrder(o)), { via: 'sms', to: o.phone }).ok) sent += 1; });
    const skipped = list.length - ok.length;
    toast(`Receipts sent by SMS: ${sent}${skipped ? ` · ${skipped} without a mobile number` : ''}`, sent ? undefined : { tone: 'error' });
  }
  bulkPrint() {
    const chosen = this.filtered().filter(o => this.state.sel[o.id]);
    if (!chosen.length) return;
    startJob('print', chosen);
    this.setState({ sel: {} });
    toast('Preparing ' + plural(chosen.length, 'label') + ' in the background', { tone: 'info' });
  }
  componentWillUnmount() {
    window.removeEventListener('popstate', this._onPop);
    window.removeEventListener(DRAFTS_EVENT, this._onDrafts);
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
      status: orderStatus(status) || isView(status) ? status : 'all',
      q: p.get('q') || '', courier: p.get('courier') || '', payment: p.get('payment') || '', zone: p.get('zone') || '', sub: p.get('sub') || '',
      date: DATES.some((d) => d[0] && d[0] === p.get('date')) ? p.get('date') : '', from: isDay(p.get('from')) ? p.get('from') : '', to: isDay(p.get('to')) ? p.get('to') : '',
      sort: SORTS.some((x) => x[0] && x[0] === p.get('sort')) ? p.get('sort') : '',
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
    if (st.sub) p.set('sub', st.sub);
    if (st.date) p.set('date', st.date);
    if (st.date === 'custom' && st.from) p.set('from', st.from);
    if (st.date === 'custom' && st.to) p.set('to', st.to);
    if (st.sort) p.set('sort', st.sort);
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
    const { status, q, courier, payment, zone, sub, extra, date, from, to, sort } = this.state;
    if (status === 'drafts') return [];
    const needle = q.trim().toLowerCase();
    const needleDigits = digits(needle);
    const min = Number(extra.minTotal) || 0;
    const range = this.state.ready ? dateRange(date, from, to) : null;
    const found = this.state.all.filter(o => {
      if (range && !((o.at || 0) >= range[0] && (o.at || 0) < range[1])) return false;
      if (status === 'review' ? !o.toReview : status === 'completed' ? !o.done : status !== 'all' && !tabKeys(status).includes(o.statusKey)) return false;
      if (sub && !(o.sub2 && o.sub2.id === sub)) return false;
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
    // newest first unless another order is chosen (the unconfirmed check is worked out once per order)
    if (sort === 'unconfirmed') return found.map(o => ({ o, _u: unconfirmed(o), at: o.at })).sort(SORT_BY.unconfirmed).map(x => x.o);
    return found.slice().sort(SORT_BY[sort] || SORT_BY['']);
  }
  exportCsv(rows) {
    if (!rows.length) { toast('Nothing to export: no orders match these filters', { tone: 'info' }); return; }
    // the order's separate states (orderStates.js) go out with it, so a sheet can filter by what is waiting
    const head = ['Order', 'Placed', 'Channel', 'Customer', 'Phone', 'Zone', 'Items', 'Courier', 'Tracking', 'Status', 'Payment', 'Total (BDT)', 'Confirmation', 'Payment state', 'Fulfilment', 'Delivery', 'Due (BDT)', 'Next step', 'Sub-status', 'Completed'];
    const cell = (c) => '"' + String(c).replace(/"/g, '""') + '"';
    const lines = [head, ...rows.map(o => { const st = orderStates(o, { held: holdsFor(o.id).length > 0 }) || {}; return [o.id, o.placed, o.channel, o.customer, o.phone, o.zone, o.itemTitle + ' (' + o.itemMeta + ')', o.courier, o.consignment, o.status, o.payment, o.amount, st.confirmation, st.payment, st.fulfilment, st.delivery, st.due, (st.next || {}).label, st.custom, st.completed ? 'Yes' : 'No']; })];
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
    const tabLabel = st.status === 'all' ? 'All orders' : st.status === 'drafts' ? 'Draft orders' : isView(st.status) ? VIEWS.find(x => x.key === st.status).label : ((st.online && ORDER_TABS.find(x => x.key === st.status)) || orderStatus(st.status) || { label: 'Matching' }).label + ' orders';
    // tab and card counts come from the orders themselves (channel view applied, search and filters not)
    const inView = st.all.filter(o => st.extra.channel === 'online' ? !/^(POS|Wholesale)/.test(o.channel) : st.extra.channel === 'pos' ? o.channel.startsWith('POS') : st.extra.channel === 'wholesale' ? o.channel.startsWith('Wholesale') : true);
    const counts = { all: inView.length };
    ORDER_STATUSES.forEach(x => { counts[x.key] = inView.filter(o => o.statusKey === x.key).length; });
    // a grouped tab counts every status in it (Retail's own tabs are single statuses)
    if (st.online) ORDER_TABS.forEach(t => { counts[t.key] = t.keys.reduce((n, k) => n + inView.filter(o => o.statusKey === k).length, 0); });
    counts.review = inView.filter(o => o.toReview).length;
    counts.completed = inView.filter(o => o.done).length;
    counts.drafts = st.drafts.length;
    const showDrafts = st.online && (st.drafts.length > 0 || st.status === 'drafts');
    const dayFrom = new Date(); dayFrom.setHours(0, 0, 0, 0);
    const extraCount = (st.extra.channel ? 1 : 0) + (st.extra.assigned ? 1 : 0) + (Number(st.extra.minTotal) > 0 ? 1 : 0);
    const hasFilters = !!(st.q || st.courier || st.payment || st.zone || st.sub || st.date || extraCount);
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
      online: st.online, ready: !!st.ready,
      isDrafts: st.status === 'drafts',
      drafts: st.drafts.map(d => ({
        ...d, href: '/new-order?draft=' + encodeURIComponent(d.id),
        who: d.customer ? d.customer.name : 'No customer yet', items: draftItems(d), totalText: formatBDT(d.total || 0),
        saved: formatDate(d.savedAt) + ', ' + formatTime(d.savedAt),
        onRowClick: (e) => { if (e.target.closest('a,button')) return; navigate('/new-order?draft=' + encodeURIComponent(d.id)); },
        onDelete: () => this.removeDraft(d)
      })),
      tabs: (st.online ? TABS.concat(showDrafts ? [{ key: 'drafts', label: 'Drafts' }] : []) : RETAIL_TABS).map(t => ({ ...t, count: counts[t.key] || 0, id: 'orders-tab-' + t.key, on: st.status === t.key, onClick: () => this.view({ status: t.key }) })),
      tabLabel,
      kpiPending: counts.pending,
      pageTitle: { pos: 'Retail orders', online: 'Online orders', wholesale: 'Wholesale orders' }[st.extra.channel] || 'Orders',
      newOrderHref: !st.online || st.extra.channel === 'pos' || st.extra.channel === 'wholesale' ? '/pos' : '/new-order',
      sparkOrders: Array.from({ length: 7 }, (_, i) => { const a = dayFrom.getTime() - (6 - i) * 864e5; return inView.filter(o => (o.at || 0) >= a && (o.at || 0) < a + 864e5).length; }),
      sparkValue: Array.from({ length: 7 }, (_, i) => { const a = dayFrom.getTime() - (6 - i) * 864e5; return inView.filter(o => (o.at || 0) >= a && (o.at || 0) < a + 864e5).reduce((n, o) => n + (o.amount || 0), 0); }),
      find: !!(st.find || st.q || st.courier || st.payment || st.zone || st.sub || st.date || extraCount),
      openFind: () => this.setState({ find: true }),
      closeFind: () => { this.setState({ find: false, extra: NO_EXTRA, draft: NO_EXTRA }); this.view({ q: '', courier: '', payment: '', zone: '', sub: '', date: '', from: '', to: '' }); },
      kpiToday: inView.filter(o => (o.at || 0) >= dayFrom.getTime()).length,
      kpiTodayValue: formatBDT(inView.filter(o => (o.at || 0) >= dayFrom.getTime()).reduce((a, o) => a + (o.amount || 0), 0)),
      kpiCod: formatBDT(inView.filter(o => o.payment === 'COD' && ['approved', 'ready', 'shipped'].includes(o.statusKey)).reduce((a, o) => a + (o.amount || 0), 0)),
      kpiCodCount: inView.filter(o => o.payment === 'COD' && ['approved', 'ready', 'shipped'].includes(o.statusKey)).length,
      kpiReturnRate: (counts.delivered + counts.returned) ? Math.round((counts.returned / (counts.delivered + counts.returned)) * 100) + '%' : '—',
      kpiCourier: counts.ready + counts.shipped,
      kpiDue: formatBDT(inView.filter(o => o.statusKey === 'pending').reduce((a, o) => a + Math.max(0, (o.amount || 0) - (o.paid || 0)), 0)),
      kpiDueCount: counts.pending,
      total: counts.all,
      q: st.q, courier: st.courier, payment: st.payment, zone: st.zone, sub: st.sub, date: st.date, from: st.from, to: st.to, sort: st.sort,
      onDate: (e) => this.view({ date: e.target.value, ...(e.target.value === 'custom' ? {} : { from: '', to: '' }) }),
      onFrom: (e) => this.view({ from: e.target.value }),
      onTo: (e) => this.view({ to: e.target.value }),
      onSort: (e) => this.view({ sort: e.target.value }),
      sortLabel: (SORTS.find((x) => x[0] === st.sort) || SORTS[0])[1],
      subs: (st.rules || { custom: [] }).custom.map(c => ({ ...c, base: (orderStatus(c.base) || {}).label || c.base })),
      onSub: (e) => this.view({ sub: e.target.value }),
      reload: () => this.reload(),
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
      hasFilters, filterCount: (st.courier ? 1 : 0) + (st.payment ? 1 : 0) + (st.zone ? 1 : 0) + (st.sub ? 1 : 0) + (st.date ? 1 : 0) + extraCount,
      clearFilters: () => { this.setState({ extra: NO_EXTRA, draft: NO_EXTRA }); this.view({ q: '', courier: '', payment: '', zone: '', sub: '', date: '', from: '', to: '' }); },
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
      printLabels: () => this.bulkPrint(),
      sendReceipts: () => this.bulkReceipts(),
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
        statusInfo: o.done ? { label: 'Completed', tone: 'success' } : orderStatus(o.statusKey),
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
.mo-badges{display:inline-flex;flex-wrap:wrap;gap:4px}
.mo-sort{position:relative}
.mo-sort select{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;font:inherit}
.mo-sort.is-set{color:var(--primary);border-color:var(--primary);background:var(--fill-primary-soft)}
.mo-sort:focus-within{outline:2px solid var(--primary);outline-offset:2px}
.mo-day{background-image:none;padding-right:10px}
`;

// ---- markup ----

const items = (o) => String(o.itemMeta || '').split(' · ')[0];

export default class MerchantOrdersScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const bulk = v.online ? [
      { label: 'Approve', icon: 'check', onClick: v.bulkApprove },
      { label: 'Send to courier', icon: 'truck', onClick: v.sendToCourier },
      { label: 'Print labels', icon: 'printer', onClick: v.printLabels },
      { label: 'Send receipts', icon: 'send', onClick: v.sendReceipts },
    ] : [{ label: 'Send receipts', icon: 'send', onClick: v.sendReceipts }];
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
                  more={!v.online ? [{ label: 'Quotes', href: '/quotes' }, { label: 'Return history', href: '/return-history' }] : [{ label: 'Order work', href: '/order-work' }, { label: 'Quotes', href: '/quotes' }, { label: 'Courier returns', href: '/courier-returns' }, ...(wholesaleOn() ? [{ label: 'Wholesale orders', href: '/wholesale-orders' }] : []), { label: 'Order settings', href: '/order-settings' }, { label: 'Order notifications', href: '/set-notifications' }]}
                  primary={{ label: 'Create order', href: v.newOrderHref }} />

                <ModuleSetup area="area-orders" />
                <MetricStrip label="Today's orders"
                  lead={<span className="mo-today"><__Icon name="calendar" width="16" height="16" aria-hidden="true" />Today</span>}
                  items={[
                    // today's figures follow the browser's clock and time zone: worked out after mount (the page is prerendered in UTC)
                    { label: 'Orders', value: v.ready ? String(v.kpiToday) : '—', spark: v.ready ? v.sparkOrders : undefined },
                    { label: 'Order value', value: v.ready ? v.kpiTodayValue : '—', spark: v.ready ? v.sparkValue : undefined },
                    ...(v.online ? [
                      { label: 'COD to collect', value: v.kpiCod, sub: v.kpiCodCount + ' orders' },
                      { label: 'With courier', value: String(v.kpiCourier), href: '/merchant-orders?status=shipped' },
                    ] : [{ label: 'Payment due', value: v.kpiDue, sub: v.kpiDueCount + ' orders', href: '/dues' }]),
                    { label: 'Return rate', value: v.kpiReturnRate },
                  ]} />

                <OrderJobs onChange={v.reload} />

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
                          {v.isDrafts ? null : <span className={'ix-btn ix-btn--sm ix-btn--icon mo-sort' + (v.sort ? ' is-set' : '')} title={'Sort: ' + v.sortLabel}>
                            <__Icon name="arrow-up-down" width="16" height="16" aria-hidden="true" />
                            <select aria-label="Sort orders" value={v.sort} onChange={v.onSort}>{SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                          </span>}
                        </span>
                      </>)}
                    </div>
                  )}
                  {v.find && !v.hasSelection ? (
                    <div className="ix-filters" role="group" aria-label="Filters">
                      <select aria-label="Date placed" className={'ix-filter' + (v.date ? ' is-set' : '')} value={v.date} onChange={v.onDate}>
                        {DATES.map(([k, l]) => <option key={k} value={k}>{k ? l : 'Date'}</option>)}
                      </select>
                      {v.date === 'custom' ? (<>
                        <input type="date" aria-label="From" className={'ix-filter mo-day' + (v.from ? ' is-set' : '')} value={v.from} max={v.to || undefined} onChange={v.onFrom} />
                        <input type="date" aria-label="To" className={'ix-filter mo-day' + (v.to ? ' is-set' : '')} value={v.to} min={v.from || undefined} onChange={v.onTo} />
                      </>) : null}
                      {v.online ? <select aria-label="Courier" className={'ix-filter' + (v.courier ? ' is-set' : '')} value={v.courier} onChange={v.onCourier}>
                        <option value="">Courier</option><option>Steadfast</option><option>Pathao</option><option>Carrybee</option><option>RedX</option>
                      </select> : null}
                      <select aria-label="Payment" className={'ix-filter' + (v.payment ? ' is-set' : '')} value={v.payment} onChange={v.onPayment}>
                        <option value="">Payment</option><option value="Paid">Paid</option><option value="Unpaid">Unpaid</option><option value="Partial">Partly paid</option>{v.online ? <option value="COD">Cash on delivery</option> : null}
                      </select>
                      {v.online ? <select aria-label="Delivery zone" className={'ix-filter' + (v.zone ? ' is-set' : '')} value={v.zone} onChange={v.onZone}>
                        <option value="">Delivery zone</option><option>Inside Dhaka</option><option>Sub-Dhaka</option><option>Outside Dhaka</option>
                      </select> : null}
                      {v.subs.length ? <select aria-label="Sub-status" className={'ix-filter' + (v.sub ? ' is-set' : '')} value={v.sub} onChange={v.onSub}>
                        <option value="">Sub-status</option>{v.subs.map((c) => <option key={c.id} value={c.id}>{c.label} · {c.base}</option>)}
                      </select> : null}
                      <button type="button" className={'ix-filter' + (v.extraCount ? ' is-set' : '')} onClick={v.openFilters} aria-haspopup="dialog" style={{ backgroundImage: 'none', paddingRight: 10 }}>{v.extraCount ? 'More filters · ' + v.extraCount : 'More filters'}</button>
                      {v.isDrafts ? null : <select aria-label="Sort orders" className={'ix-filter' + (v.sort ? ' is-set' : '')} style={{ maxWidth: 'none' }} value={v.sort} onChange={v.onSort}>{SORTS.map(([k, l]) => <option key={k} value={k}>{'Sort: ' + l}</option>)}</select>}
                      {v.hasFilters ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.clearFilters}>Clear all</button> : null}
                    </div>
                  ) : null}

                  {v.isDrafts ? (
                    v.drafts.length === 0 ? (
                      <div className="ix-empty"><__EmptyState icon="file-pen-line" title="No draft orders" actionLabel="Create order" onAction={() => navigate('/new-order')} /></div>
                    ) : (<>
                      <ul className="ix-plist" aria-label="Draft orders">
                        {v.drafts.map((d) => (
                          <li key={d.id}>
                            <__Link href={d.href} className="ix-pitem">
                              <span className="ix-pitem__top"><b className="mo-id">{d.id}</b><span>{d.totalText}</span></span>
                              <span className="ix-pitem__mid">{d.who} · {d.items}</span>
                              <span className="ix-pitem__tags"><__StatusBadge tone="neutral" icon="file-pen-line">Saved {d.saved}</__StatusBadge></span>
                            </__Link>
                          </li>
                        ))}
                      </ul>
                      <div className="ix-table-wrap">
                        <table className="ix-table gc-table--keep">
                          <caption className="sr-only">Draft orders</caption>
                          <thead><tr><th scope="col">Draft</th><th scope="col">Saved</th><th scope="col">Customer</th><th scope="col">Items</th><th scope="col" className="ix-num">Total</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                          <tbody>
                            {v.drafts.map((d) => (
                              <tr key={d.id} onClick={d.onRowClick}>
                                <td><__Link href={d.href} className="ix-strong mo-id">{d.id}</__Link></td>
                                <td className="ix-muted">{d.saved}</td>
                                <td><span className="mo-cust">{d.who}</span></td>
                                <td className="ix-muted">{d.items}</td>
                                <td className="ix-num">{d.totalText}</td>
                                <td className="ix-num"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Delete draft ' + d.id} title="Delete draft" onClick={d.onDelete}><__Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>)
                  ) : v.empty ? (
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
                              {o.sub2 ? <__StatusBadge tone={o.sub2.tone} icon="tag">{o.sub2.label}</__StatusBadge> : null}
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
                              <td><span className="mo-badges"><__StatusBadge tone={o.statusInfo ? o.statusInfo.tone : 'neutral'}>{o.statusInfo ? o.statusInfo.label : o.status}</__StatusBadge>{o.sub2 ? <__StatusBadge tone={o.sub2.tone} icon="tag">{o.sub2.label}</__StatusBadge> : o.toReview ? <__StatusBadge tone="warning" icon="receipt">Payment to review</__StatusBadge> : null}</span></td>
                              <td className="ix-muted">{items(o)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    </>
                  )}
                  {v.isDrafts ? null : <Pager label={v.countLabel} atStart={v.atStart} atEnd={v.atEnd} prev={v.prev} next={v.next} />}
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
                {wholesaleOn() ? <option value="wholesale">Wholesale</option> : null}
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
