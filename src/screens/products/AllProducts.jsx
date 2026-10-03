'use client';
// Generated from design/templates/products/AllProducts.dc.html by scripts/convert-design.mjs.
// AllProducts — Products — All products.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, list as __list } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { EmptyState as __EmptyState, StatusBadge as __StatusBadge, Dialog as __Dialog } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField, LearnMore, Menu } from '@/components/ui/IndexKit';
import { toast as __toast } from '@/runtime/ui';
import { useRouter } from 'next/navigation';
import { formatBDT } from '@/lib/format';
import { allProducts, getSavedProducts, DEMO_PRODUCTS, sellLabel, duplicateProduct } from '@/lib/products';
import ImportProducts from './ImportProducts';
import { freeKeys } from '@/lib/licenceKeys';
import { stockAt } from '@/lib/stock';
import { getStockSetup } from '@/lib/stockSetup';
import { hasModule } from '@/lib/edition';
import { CHANNELS_EVENT, channelMap, getChannels, setPublished, retryMany, STATUS, ISSUES, channelBy, PRODUCT_CHS } from '@/lib/channels';
import { BrandLogo as __BrandLogo } from '@/components/BrandLogo';

// Sales channels on the product list (src/lib/channels.js): a filter, a small Meta / Google mark per row and the
// channel actions for the selected products. Shown when the edition sells on channels.
var CH_FILTERS = [['', 'All channels'], ['meta-on', 'Published to Meta'], ['meta-off', 'Not published to Meta'], ['gmc-ok', 'Google approved'], ['gmc-bad', 'Google disapproved'], ['attention', 'Needs attention']];
var CH_TONE = { synced: 'ok', approved: 'ok', attention: 'warn', limited: 'warn', failed: 'bad', disapproved: 'bad', processing: 'info', unpublished: 'off' };

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function pTabs(self, list, cur, key, counts) { return mkTabs(self, list, cur, key, counts).map(function (x) { x.pcls = x.on ? 'ptab on' : 'ptab'; return x; }); }
var CHN = { sms: ['SMS', '#e7f8f1', '#047857'], wa: ['WhatsApp', '#dcfce7', '#166534'], email: ['Email', '#e0f2fe', '#075985'] };
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { __toast(m, bad ? { tone: 'info' } : undefined); }
function msgV(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#fff4e0' : '#e7f8f1', msgFg: s.bad ? '#7a3b04' : '#065f46' }; }
var FL = { 'IMEI': ['#e0f2fe', '#075985', 'Tracked by IMEI'], 'Serial': ['#e0f2fe', '#075985', 'Tracked by serial number'], 'Warranty': ['#e7f8f1', '#047857', 'Has a warranty policy'], 'Expiry': ['#fff4e0', '#a14f06', 'Has an expiry date'], 'Size guide': ['#eef2f6', '#334155', 'Has a size guide'], 'No description': ['#f3e8ff', '#6d28d9', 'Missing — fill with AI'], 'No photo': ['#ffece6', '#b83210', 'Missing photo'] };
var ST = { active: ['Active', 'badge b-received'], draft: ['Draft', 'badge b-draft'], archived: ['Archived', 'badge b-closed'], deleted: ['Deleted', 'badge b-cancelled'] };
var TABS = [{ k: 'all', label: 'All' }, { k: 'active', label: 'Active' }, { k: 'draft', label: 'Draft' }, { k: 'archived', label: 'Archived' }, { k: 'missing', label: 'Missing info' }, { k: 'deleted', label: 'Deleted' }];
var AIC = ['Short description', 'Long description', 'SEO title', 'SEO description', 'Tags', 'Product FAQ', 'Image alt text'];
var UNTAGGED = [['', 'All tags'], ['nosku', 'No SKU'], ['nobarcode', 'No barcode'], ['nocat', 'No category'], ['nows', 'No wholesale price']];
var UNTAGGED_RETAIL = UNTAGGED.filter(function (x) { return x[0] !== 'nows'; });
var UNTAGGED_TEST = { nosku: function (p) { return !p.sku; }, nobarcode: function (p) { return !p.barcode; }, nocat: function (p) { return !p.cat; }, nows: function (p) { return p.wholesale == null || p.wholesale === ''; } };
var SELLS = [['', 'Sell to: any'], ['retail', 'Retail only'], ['wholesale', 'Wholesale only'], ['both', 'Retail and wholesale']];
var SELL_CLS = { retail: 'badge b-draft', wholesale: 'badge b-approved', both: 'badge b-ordered' };
function uniq(list) { var o = []; list.forEach(function (x) { if (x && o.indexOf(x) < 0) o.push(x); }); return o.sort(); }
function editHref(p) { return p.sku ? '/add-product?sku=' + encodeURIComponent(p.sku) : '/add-product?id=' + encodeURIComponent(p.id); }
function priceText(p) {
  if (p.sell === 'wholesale') return p.wholesale != null ? formatBDT(p.wholesale) : '—';
  var ps = (p.variants && p.variants.length ? p.variants.map(function (x) { return x.price; }) : [p.price]).filter(function (x) { return x != null && x !== ''; }).map(Number);
  if (!ps.length) return '—';
  var lo = Math.min.apply(null, ps), hi = Math.max.apply(null, ps);
  return lo === hi ? formatBDT(lo) : formatBDT(lo) + ' – ' + formatBDT(hi);
}
function wsText(p) {
  if (p.sell === 'retail') return 'Retail only';
  if (p.wholesale == null || p.wholesale === '') return 'No wholesale price';
  return (p.sell === 'wholesale' ? 'Wholesale · ' : 'Wholesale ' + formatBDT(p.wholesale) + ' · ') + 'min ' + (p.moq || 1) + ' pcs';
}
function csvCell(c) { var t = c == null ? '' : String(c); return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; }
function downloadCsv(name, rows) {
  var blob = new Blob(['﻿' + rows.map(function (r) { return r.map(csvCell).join(','); }).join('\n')], { type: 'text/csv;charset=utf-8' });
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
}
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); if (this.onCh) window.removeEventListener(CHANNELS_EVENT, this.onCh); clearInterval(this.chTick); }
  // The status tab lives in the URL (?status=draft), so a reload or Back keeps the same list.
  // Products added or edited in this browser are read after mount (localStorage).
  componentDidMount() {
    var st = new URLSearchParams(window.location.search).get('status');
    // an online-only shop has no wholesale prices: no "sell to", no wholesale column or filter (stockSetup.js)
    var p = { saved: getSavedProducts(), wsOn: getStockSetup().wholesale };
    // channel status of every product (and again whenever a channel changes, or a retry lands)
    var self = this;
    if (hasModule('channels')) {
      p.chm = channelMap(); p.chConn = getChannels().conn;
      this.onCh = function () { self.setState({ chm: channelMap(), chConn: getChannels().conn }); };
      window.addEventListener(CHANNELS_EVENT, this.onCh);
      this.chTick = setInterval(this.onCh, 4000);
    }
    if (st && TABS.some(function (t) { return t.k === st; })) p.tab = st;
    this.setState(p);
  }
  setTab(k) {
    var url = new URL(window.location.href);
    if (k === 'all') url.searchParams.delete('status'); else url.searchParams.set('status', k);
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    this.setState({ tab: k, sel: {}, aiOpen: false });
  }
  // Channel actions for the selected products (publish / remove on Meta or Google, or retry the failed ones).
  bulkCh(ch, on) {
    var s = this.state || {}, sel = s.sel || {}, all = s.saved ? allProducts(s.saved) : DEMO_PRODUCTS;
    var keys = all.filter(function (p) { return sel[p.id]; }).map(function (p) { return p.sku || p.id; });
    var msg;
    if (ch === 'retry') {
      var m = channelMap(), list = [];
      keys.forEach(function (k) { PRODUCT_CHS.forEach(function (c) { var r = (m[k] || {})[c]; if (r && r.issue && ISSUES[r.issue].kind === 'retry') list.push([c, k]); }); });
      retryMany(list);
      msg = list.length ? 'Retrying ' + list.length + (list.length === 1 ? ' failed sync' : ' failed syncs') : 'Nothing failed. Problems that need a fix are in Sync issues.';
    } else {
      var n = setPublished(ch, keys, on), name = ch === 'gmc' ? 'Google' : channelBy(ch).short;
      msg = n ? (on ? 'Publishing ' + n + ' to ' + name + '…' : 'Removed ' + n + ' from ' + name) : (on ? 'Already on ' + name + ' (drafts are not sent)' : 'None of these are on ' + name);
    }
    this.setState({ chMenu: false, sel: {}, chm: channelMap() });
    toast(this, msg);
  }
  renderVals() {
    var self = this, s = this.state || {}, tab = s.tab || 'all', sel = s.sel || {}, aic = s.aic || { 'Short description': true, 'Long description': true };
    var q = (s.q || '').trim().toLowerCase();
    var wsOn = s.wsOn !== false;
    var fCat = s.fCat || '', fBrand = s.fBrand || '', fTag = s.fTag || '', fSell = wsOn ? s.fSell || '' : '';
    var chOn = !!s.chm, chm = s.chm || {}, conn = s.chConn || {}, fCh = chOn ? s.fCh || '' : '';
    var chOf = function (p) { return chm[p.sku || p.id] || {}; };
    var CH_TEST = {
      'meta-on': function (p) { var r = chOf(p).meta; return !!r && r.st !== 'unpublished'; },
      'meta-off': function (p) { var r = chOf(p).meta; return !r || r.st === 'unpublished'; },
      'gmc-ok': function (p) { var r = chOf(p).gmc; return !!r && r.st === 'approved'; },
      'gmc-bad': function (p) { var r = chOf(p).gmc; return !!r && r.st === 'disapproved'; },
      attention: function (p) { var x = chOf(p); return PRODUCT_CHS.some(function (k) { return conn[k] && x[k] && !!x[k].issue; }); },
    };
    var filtered = !!(fCat || fBrand || fTag || fSell || fCh);
    var tabLabel = TABS.filter(function (t) { return t.k === tab; })[0].label;
    var all = s.saved ? allProducts(s.saved) : DEMO_PRODUCTS;
    var list = all.filter(function (p) { return wsOn || p.sell !== 'wholesale'; }).filter(function (p) { return tab === 'all' ? p.st !== 'deleted' : tab === 'missing' ? p.missing : p.st === tab; })
      .filter(function (p) { return !q || (p.name + ' ' + p.sku + ' ' + p.barcode + ' ' + p.brand + ' ' + p.cat).toLowerCase().indexOf(q) >= 0; })
      .filter(function (p) { return (!fCat || p.cat === fCat || p.cat.indexOf(fCat + ' ›') === 0) && (!fBrand || p.brand === fBrand) && (!fTag || UNTAGGED_TEST[fTag](p)) && (!fSell || p.sell === fSell) && (!fCh || CH_TEST[fCh](p)); });
    var n = list.filter(function (p) { return sel[p.id]; }).length;
    var cnt = { all: 412, active: 386, draft: 14, archived: 12, missing: 34, deleted: 9 };
    // Products added in this browser come on top of the shop's counts.
    all.filter(function (p) { return !DEMO_PRODUCTS.some(function (d) { return d.id === p.id; }); }).forEach(function (p) { if (p.st !== 'deleted') cnt.all++; if (cnt[p.st] != null) cnt[p.st]++; });
    var cats = uniq(all.map(function (p) { return p.cat.split(' › ')[0]; }).concat(all.map(function (p) { return p.cat; })));
    return assign({
      tabs: pTabs(this, TABS, tab, 'tab', cnt).map(function (x, i) { x.k = TABS[i].k; x.id = 'ptab-' + TABS[i].k; x.tabIndex = x.on ? 0 : -1; x.pick = function () { self.setTab(TABS[i].k); }; return x; }),
      tabKey: function (e) {
        var i = TABS.map(function (t) { return t.k; }).indexOf(tab), n2 = i;
        if (e.key === 'ArrowRight') n2 = (i + 1) % TABS.length; else if (e.key === 'ArrowLeft') n2 = (i + TABS.length - 1) % TABS.length; else if (e.key === 'Home') n2 = 0; else if (e.key === 'End') n2 = TABS.length - 1; else return;
        e.preventDefault(); self.setTab(TABS[n2].k);
        var id = 'ptab-' + TABS[n2].k; setTimeout(function () { var el = document.getElementById(id); if (el) el.focus(); }, 0);
      },
      activeTabId: 'ptab-' + tab,
      q: s.q || '', typeQ: function (e) { self.setState({ q: e.target.value }); },
      catOpts: cats.map(function (c) { return { v: c, l: c.indexOf(' › ') > 0 ? '  ' + c : c }; }), fCat: fCat, setCat: function (e) { self.setState({ fCat: e.target.value, sel: {} }); },
      brandOpts: uniq(all.map(function (p) { return p.brand; })), fBrand: fBrand, setBrand: function (e) { self.setState({ fBrand: e.target.value, sel: {} }); },
      tagOpts: (wsOn ? UNTAGGED : UNTAGGED_RETAIL).map(function (x) { return { v: x[0], l: x[1] }; }), fTag: fTag, setTag: function (e) { self.setState({ fTag: e.target.value, sel: {} }); },
      wsOn: wsOn, sellOpts: SELLS.map(function (x) { return { v: x[0], l: x[1] }; }), fSell: fSell, setSell: function (e) { self.setState({ fSell: e.target.value, sel: {} }); },
      chOn: chOn, chOpts: CH_FILTERS.filter(function (x) { return !x[0] || (x[0].indexOf('meta') === 0 ? conn.meta : x[0].indexOf('gmc') === 0 ? conn.gmc : conn.meta || conn.gmc); }).map(function (x) { return { v: x[0], l: x[1] }; }), fCh: fCh, setCh: function (e) { self.setState({ fCh: e.target.value, sel: {} }); },
      chMenu: !!s.chMenu && n > 0, toggleChMenu: function () { self.setState({ chMenu: !s.chMenu }); },
      chActs: PRODUCT_CHS.filter(function (k) { return conn[k]; }).reduce(function (out, k) {
        var nm = k === 'gmc' ? 'Google' : channelBy(k).short;
        return out.concat([{ l: 'Publish to ' + nm, run: function () { self.bulkCh(k, true); } }, { l: 'Remove from ' + nm, run: function () { self.bulkCh(k, false); } }]);
      }, []).concat(PRODUCT_CHS.some(function (k) { return conn[k]; }) ? [{ l: 'Retry sync', run: function () { self.bulkCh('retry'); } }] : []),
      filtered: filtered, filterCount: [fCat, fBrand, fTag, fSell, fCh].filter(Boolean).length, clearFilters: function () { self.setState({ fCat: '', fBrand: '', fTag: '', fSell: '', fCh: '' }); },
      emptyTitle: q ? 'No products match “' + (s.q || '').trim() + '”' : filtered ? 'No products match these filters' : 'No ' + (tab === 'all' ? '' : tabLabel.toLowerCase() + ' ') + 'products',
      emptyBody: q ? 'Check the spelling, or clear the search to see every product in this tab.' : filtered ? 'Clear the filters to see every product in this tab.' : 'Nothing has this status yet. Show all products instead.',
      emptyAction: q ? 'Clear search' : filtered ? 'Clear filters' : 'Show all products',
      clearEmpty: function () { if (q) self.setState({ q: '' }); else if (filtered) self.setState({ fCat: '', fBrand: '', fTag: '', fSell: '', fCh: '' }); else self.setTab('all'); },
      rows: list.map(function (p) { var on = !!sel[p.id], href = editHref(p);
        return { id: p.id, name: p.name, sku: p.sku || 'No SKU', skuColor: p.sku ? 'var(--text-muted)' : 'var(--text-warning)', vars: p.vars, initial: p.name.charAt(0), tbg: p.tbg, sel: on, bg: on ? '#f2f6fc' : 'transparent', st: ST[p.st][0], stCls: ST[p.st][1],
          inv: p.format === 'digital' || p.format === 'service' ? 'Not tracked' : p.format === 'licence' ? freeKeys(p.sku) + ' keys free' : p.bundle && p.bundle.type !== 'kit' ? (s.saved ? stockAt(p.sku, '').available : 0) + ' from parts' : p.inv === 0 ? 'Out of stock' : p.inv + ' in stock', invSub: p.loc ? 'at ' + p.loc + (p.loc > 1 ? ' places' : ' place') : 'not tracked', invColor: p.inv === 0 ? '#b83210' : p.low ? '#a14f06' : '#0f172a',
          cat: p.cat || 'No category', catColor: p.cat ? '#334155' : 'var(--text-warning)', brand: p.brand || '—',
          sell: sellLabel(p.sell), sellCls: SELL_CLS[p.sell] || SELL_CLS.retail, price: priceText(p), ws: wsText(p), wsColor: p.sell !== 'retail' && (p.wholesale == null || p.wholesale === '') ? 'var(--text-warning)' : 'var(--text-muted)',
          flags: p.flags.filter(function (f) { return FL[f]; }).map(function (f) { return { l: f, bg: FL[f][0], fg: FL[f][1], t: FL[f][2] }; }),
          href: href,
          // Meta and Google marks: the channel logo with a status dot (title and screen-reader text say the status)
          chMarks: !chOn ? [] : PRODUCT_CHS.filter(function (k) { return conn[k]; }).map(function (k) {
            var r = chOf(p)[k], st = r ? r.st : null, issue = r && r.issue ? ISSUES[r.issue].title : '';
            return { k: k, logo: channelBy(k).logo, brand: channelBy(k).brand, tone: st ? CH_TONE[st] : 'off', label: (k === 'gmc' ? 'Google' : channelBy(k).short) + ': ' + (st ? STATUS[st].label : 'Not sold online') + (issue ? ' · ' + issue : '') };
          }),
          // A click anywhere on the row opens the product, except on its own controls.
          open: function (e) { if (e.target.closest && e.target.closest('a,button,input,select,label')) return; if (self.props.router) self.props.router.push(href); else window.location.href = href; },
          toggle: function () { var o = assign({}, sel); o[p.id] = !on; self.setState({ sel: o }); } }; }),
      empty: !list.length, shown: list.length, total: q || filtered ? list.length : cnt[tab],
      allSel: list.length > 0 && n === list.length, toggleAll: function () { var o = {}; if (n !== list.length) list.forEach(function (p) { o[p.id] = true; }); self.setState({ sel: o }); },
      hasSel: n > 0, selCount: n,
      aiOpen: !!s.aiOpen && n > 0, openAi: function () { self.setState({ aiOpen: true }); }, closeAi: function () { self.setState({ aiOpen: false }); },
      aiCols: AIC.map(function (c) { var on = !!aic[c]; return { label: c, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var o = assign({}, aic); o[c] = !on; self.setState({ aic: o }); } }; }),
      aiTotal: n * AIC.filter(function (c) { return aic[c]; }).length,
      runAi: function () { self.setState({ aiOpen: false }); toast(self, 'AI is writing ' + n * AIC.filter(function (c) { return aic[c]; }).length + ' fields. They will wait in “Review AI text” before going live.'); },
      // Import: upload a CSV, match the columns, check every row (dry run), import the good ones (ImportProducts.jsx)
      importCsv: function () { self.setState({ impOpen: true }); },
      closeImport: function () { self.setState({ impOpen: false }); },
      imported: function () { self.setState({ saved: getSavedProducts() }); },
      // the spreadsheet bulk editor (/bulk-edit) with the selected products, or every product in the list
      bulkEdit: function () { var ids = list.filter(function (p) { return sel[p.id]; }).map(function (p) { return p.id; }); var href = '/bulk-edit' + (ids.length ? '?ids=' + encodeURIComponent(ids.join(',')) : ''); if (self.props.router) self.props.router.push(href); else window.location.href = href; },
      // copy one product as a new draft and open it
      duplicate: function () {
        var one = list.filter(function (p) { return sel[p.id]; });
        if (one.length !== 1) { toast(self, 'Select one product to duplicate.', true); return; }
        var rec = duplicateProduct(one[0].id);
        if (!rec) return;
        self.setState({ saved: getSavedProducts(), sel: {} });
        toast(self, 'Copied as a draft: ' + rec.name);
        var href = '/add-product?id=' + encodeURIComponent(rec.id);
        if (self.props.router) self.props.router.push(href); else window.location.href = href;
      },
      exportCsv: function () {
        if (!list.length) { toast(self, 'Nothing to export. Change the filters first.', true); return; }
        var rows = [['Name', 'SKU', 'Barcode', 'Status', 'Stock', 'Category', 'Brand', 'Sell to', 'Retail price', 'Wholesale price', 'Wholesale MOQ', 'Variants']].concat(list.map(function (p) {
          return [p.name, p.sku, p.barcode, ST[p.st][0], p.inv, p.cat, p.brand, sellLabel(p.sell), p.sell === 'wholesale' ? '' : p.price, p.wholesale == null ? '' : p.wholesale, p.moq == null ? '' : p.moq, p.variants.length || 1];
        }));
        downloadCsv('products-' + tab + '.csv', rows);
        toast(self, 'Exported ' + list.length + (list.length === 1 ? ' product' : ' products') + ' as CSV.');
      },
      bulkCat: function () { toast(self, 'Pick a new category for ' + n + ' products.'); }, bulkLbl: function () { toast(self, 'Barcode labels ready to print for ' + n + ' products.'); },
      bulkArchive: function () { toast(self, n + ' products archived.'); }, bulkDelete: function () { toast(self, n + ' products moved to Deleted. You can restore them for 30 days.', true); }
    }, msgV(s));
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
.ap-chs{display:inline-flex;gap:6px}
.ap-ch{position:relative;display:grid;place-items:center;width:24px;height:24px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);background:var(--surface-card)}
.ap-ch img{display:block}
.ap-chdot{position:absolute;right:-3px;bottom:-3px;width:10px;height:10px;border-radius:var(--radius-full);box-shadow:0 0 0 2px var(--surface-card)}
.ap-chdot--ok{background:var(--success)}.ap-chdot--warn{background:var(--warning)}.ap-chdot--bad{background:var(--error)}.ap-chdot--info{background:var(--info)}.ap-chdot--off{background:var(--slate-300)}
.ap-chmenu{position:relative;display:inline-flex}
.ap-chmenu .gc-dropdown{top:100%;right:0;color:var(--text-body)}
`;

// ---- markup ----

// Shopify's product list (components/ui/IndexKit.jsx): one card with the status views, search and filters, bulk
// actions and a compact table of what you act on (product, status, stock, category, channels). Price, brand, sell-to
// and the rest are on the product page.
const STATUS_TONE = { Active: 'success', Draft: 'info', Archived: 'neutral', Deleted: 'error' };

class AllProductsView extends Component {
  render() {
    const v = this.renderVals() || {};
    const s = this.state || {};
    const find = !!(s.find || v.q || v.filtered);
    const openFind = () => this.setState({ find: true });
    const closeFind = () => this.setState({ find: false, q: '', fCat: '', fBrand: '', fTag: '', fSell: '', fCh: '' });
    const tabs = v.tabs.map((t) => ({ key: t.k, id: t.id, label: t.label, on: t.on, onClick: t.pick }));
    return (
      <div className="dc-screen ds" data-screen="AllProducts">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="products-all" />
          <main className="gc-shell__main">
            <__Topbar crumb="Products" page="All products" placeholder="Search products, SKU or barcode" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <ShopHeader icon="package" title="Products" about="Every product you sell, with price, stock and photos. Open a product to change it."
                  secondary={[{ label: 'Export', onClick: v.exportCsv }, { label: 'Import', onClick: v.importCsv }]}
                  more={[{ label: 'Bulk edit', onClick: v.bulkEdit }, { label: 'Categories', href: '/categories' }, { label: 'Catalog setup', href: '/catalog-setup' }, { label: 'Barcode labels', href: '/barcode-labels' }]}
                  primary={{ label: 'Add product', href: '/add-product' }} />
                {v.hasMsg ? <div className="gc-alert gc-alert--soft" role="status">{v.msg}</div> : null}

                <section className="ix-card" aria-label="Products">
                  {v.hasSel ? (
                    <div className="ix-bulk" role="toolbar" aria-label="Selected products">
                      <input type="checkbox" checked={v.allSel} onChange={v.toggleAll} aria-label="Select every product" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
                      <span className="ix-bulk__n">{v.selCount} selected</span>
                      <button type="button" className="ix-btn ix-btn--sm" onClick={v.bulkEdit}><__Icon name="table" width="16" height="16" aria-hidden="true" />Bulk edit</button>
                      <button type="button" className="ix-btn ix-btn--sm" onClick={v.bulkCat}><__Icon name="folder" width="16" height="16" aria-hidden="true" />Change category</button>
                      <button type="button" className="ix-btn ix-btn--sm" onClick={v.bulkLbl}><__Icon name="scan-barcode" width="16" height="16" aria-hidden="true" />Print labels</button>
                      <button type="button" className="ix-btn ix-btn--sm" onClick={v.openAi}><__Icon name="sparkles" width="16" height="16" aria-hidden="true" />Fill with AI</button>
                      {v.chOn && v.chActs.length ? <Menu label="Channels" icon="radio-tower" cls="ix-btn ix-btn--sm" align="start" items={v.chActs.map((a) => ({ label: a.l, onClick: a.run }))} /> : null}
                      <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" align="start" items={[v.selCount === 1 ? { label: 'Duplicate', onClick: v.duplicate } : null, { label: 'Archive', onClick: v.bulkArchive }, { label: 'Delete', onClick: v.bulkDelete, tone: 'danger' }].filter(Boolean)} />
                    </div>
                  ) : (
                    <div className="ix-bar">
                      {find ? (<>
                        <SearchField value={v.q} onChange={v.typeQ} placeholder="Search name, SKU, barcode or IMEI" onDone={closeFind} autoFocus />
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
                      </>) : (<>
                        <IndexTabs tabs={tabs} label="Product status" />
                        <span className="ix-tools">
                          <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={openFind}><__Icon name="search" width="16" height="16" aria-hidden="true" /></button>
                        </span>
                      </>)}
                    </div>
                  )}
                  {find && !v.hasSel ? (
                    <div className="ix-filters" role="group" aria-label="Filters">
                      <select aria-label="Category" className={'ix-filter' + (v.fCat ? ' is-set' : '')} value={v.fCat} onChange={v.setCat}>
                        <option value="">Category</option>
                        {__list(v.catOpts).map((c) => (<option key={c.v} value={c.v}>{c.l}</option>))}
                      </select>
                      <select aria-label="Brand" className={'ix-filter' + (v.fBrand ? ' is-set' : '')} value={v.fBrand} onChange={v.setBrand}>
                        <option value="">Brand</option>
                        {__list(v.brandOpts).map((b) => (<option key={b} value={b}>{b}</option>))}
                      </select>
                      <select aria-label="Missing details" className={'ix-filter' + (v.fTag ? ' is-set' : '')} value={v.fTag} onChange={v.setTag}>
                        {__list(v.tagOpts).map((o) => (<option key={o.v} value={o.v}>{o.v ? o.l : 'Missing details'}</option>))}
                      </select>
                      {v.wsOn ? <select aria-label="Sell to" className={'ix-filter' + (v.fSell ? ' is-set' : '')} value={v.fSell} onChange={v.setSell}>
                        {__list(v.sellOpts).map((o) => (<option key={o.v} value={o.v}>{o.v ? o.l : 'Sell to'}</option>))}
                      </select> : null}
                      {v.chOn ? <select aria-label="Channels" className={'ix-filter' + (v.fCh ? ' is-set' : '')} value={v.fCh} onChange={v.setCh}>
                        {__list(v.chOpts).map((o) => (<option key={o.v} value={o.v}>{o.v ? o.l : 'Channels'}</option>))}
                      </select> : null}
                      {v.filtered ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.clearFilters}>Clear all</button> : null}
                    </div>
                  ) : null}

                  {v.empty ? (
                    <div className="ix-empty"><__EmptyState title={v.emptyTitle} body={v.emptyBody} actionLabel={v.emptyAction} onAction={v.clearEmpty} /></div>
                  ) : (
                    <>
                    <ul className="ix-plist" aria-label="Products">
                      {v.rows.map((r) => (
                        <li key={r.id}>
                          <__Link href={r.href} className="ix-pitem ix-pitem--thumb">
                            <span className="ix-thumb" style={{ background: r.tbg }} aria-hidden="true">{r.initial}</span>
                            <span className="ix-pitem__top"><b>{r.name}</b><__StatusBadge tone={STATUS_TONE[r.st] || 'neutral'} icon="circle">{r.st}</__StatusBadge></span>
                            <span className="ix-pitem__mid"><span className={r.inv === 'Out of stock' ? 'ix-bad' : ''}>{r.inv}</span> · {r.cat}</span>
                          </__Link>
                        </li>
                      ))}
                    </ul>
                    <div className="ix-table-wrap">
                      <table className="ix-table gc-table--keep">
                        <caption className="sr-only">Products, {v.shown} shown</caption>
                        <thead>
                          <tr>
                            <th scope="col" className="ix-check"><input type="checkbox" aria-label="Select all" checked={v.allSel} onChange={v.toggleAll} /></th>
                            <th scope="col">Product</th>
                            <th scope="col">Status</th>
                            <th scope="col">Inventory</th>
                            <th scope="col">Category</th>
                            {v.chOn ? <th scope="col">Channels</th> : null}
                          </tr>
                        </thead>
                        <tbody>
                          {v.rows.map((r) => (
                            <tr key={r.id} className={r.sel ? 'is-sel' : ''} onClick={r.open}>
                              <td className="ix-check"><input type="checkbox" checked={r.sel} onChange={r.toggle} aria-label={'Select ' + r.name} /></td>
                              <td>
                                <span className="ix-prod">
                                  <span className="ix-thumb" style={{ background: r.tbg }} aria-hidden="true">{r.initial}</span>
                                  <__Link href={r.href} className="ix-strong">{r.name}</__Link>
                                </span>
                              </td>
                              <td><__StatusBadge tone={STATUS_TONE[r.st] || 'neutral'} icon="circle">{r.st}</__StatusBadge></td>
                              <td className={r.inv === 'Out of stock' ? 'ix-bad' : r.invColor === '#a14f06' ? 'ix-warn' : ''}>{r.inv}{r.vars > 1 ? <span className="ix-muted"> for {r.vars} variants</span> : null}</td>
                              <td className={r.cat === 'No category' ? 'ix-warn' : 'ix-muted'}>{r.cat}</td>
                              {v.chOn ? (
                                <td>
                                  <span className="ap-chs">
                                    {r.chMarks.map((m) => (
                                      <span key={m.k} className="ap-ch" title={m.label}>
                                        {m.logo ? <img src={m.logo} alt="" width="14" height="14" /> : <__BrandLogo brand={m.brand} size={14} decorative />}
                                        <span className={'ap-chdot ap-chdot--' + m.tone} aria-hidden="true" />
                                        <span className="sr-only">{m.label}</span>
                                      </span>
                                    ))}
                                  </span>
                                </td>
                              ) : null}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    </>
                  )}
                  <div className="ix-foot"><span>{v.shown === 1 ? "1 product" : v.shown + " products"}</span></div>
                </section>
                <LearnMore topic="products" />
              </div>
            </div>
          </main>
        </div>

        <ImportProducts open={!!s.impOpen} onClose={v.closeImport} onDone={v.imported} />

        <__Dialog open={!!v.aiOpen} title={'Fill with AI for ' + v.selCount + ' products'} onClose={v.closeAi} width={520} footer={<>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.closeAi}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.runAi}><__Icon name="sparkles" width="16" height="16" aria-hidden="true" />Generate {v.aiTotal} fields</button>
        </>}>
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <p className="gc-help" style={{ margin: 0 }}>AI fills only empty fields unless you tick Replace. You check everything before it goes live.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {__list(v.aiCols).map((c) => (
                <button key={c.label} type="button" className={'ix-filter' + (c.on ? ' is-set' : '')} aria-pressed={c.on} onClick={c.pick} style={{ backgroundImage: 'none', paddingRight: 10 }}>{c.label}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-2)' }}>
              <select className="ix-pick" aria-label="Language"><option>English</option><option>বাংলা</option><option>English + বাংলা</option></select>
              <select className="ix-pick" aria-label="Tone"><option>Friendly</option><option>Premium</option><option>Simple and short</option></select>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}><input type="checkbox" style={{ width: 16, height: 16 }} />Replace existing text</label>
            </div>
          </div>
        </__Dialog>
      </div>
    );
  }
}

// The row click opens the product with the app router, so the class view gets it as a prop.
export default function AllProductsScreen() {
  const router = useRouter();
  return <AllProductsView router={router} />;
}
