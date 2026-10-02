'use client';
// Generated from design/templates/products/AllProducts.dc.html by scripts/convert-design.mjs.
// AllProducts — Products — All products.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { PageHeader as __PageHeader, EmptyState as __EmptyState } from '@/components/ui';
import { MobileFilters as __MobileFilters } from '@/components/ui/FilterBar';
import { toast as __toast } from '@/runtime/ui';
import { useRouter } from 'next/navigation';
import { formatBDT } from '@/lib/format';
import { allProducts, getSavedProducts, DEMO_PRODUCTS, sellLabel } from '@/lib/products';
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
          inv: p.inv === 0 ? 'Out of stock' : p.inv + ' in stock', invSub: p.loc ? 'at ' + p.loc + (p.loc > 1 ? ' places' : ' place') : 'not tracked', invColor: p.inv === 0 ? '#b83210' : p.low ? '#a14f06' : '#0f172a',
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
      importCsv: function () { toast(self, 'Upload a CSV — download the template first to see the columns.'); },
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
.ap-ch{position:relative;display:grid;place-items:center;width:28px;height:28px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);background:var(--surface-card)}
.ap-ch img{display:block}
.ap-chdot{position:absolute;right:-3px;bottom:-3px;width:10px;height:10px;border-radius:var(--radius-full);box-shadow:0 0 0 2px var(--surface-card)}
.ap-chdot--ok{background:var(--success)}.ap-chdot--warn{background:var(--warning)}.ap-chdot--bad{background:var(--error)}.ap-chdot--info{background:var(--info)}.ap-chdot--off{background:var(--slate-300)}
.ap-chmenu{position:relative;display:inline-flex}
.ap-chmenu .gc-dropdown{top:100%;right:0;color:var(--text-body)}

body{margin:0;font-family:var(--font-sans);background:#e9eef5;color:#1e293b;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087}a:hover{color:#002a77}
.card{background:#ffffff;border-radius:var(--radius-xl);box-shadow:0 3px 10px 0 rgba(48,46,56,.06)}
.nav{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:var(--radius-lg);color:#475569;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:.01em;text-decoration:none;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 300ms ease-in-out}
.nav:hover{background:#f1f5f9;color:#0f172a;text-decoration:none}
.nav.on{background:rgba(0,48,135,.08);color:#003087}
.navh{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);color:var(--text-muted);padding:18px 12px 6px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:var(--radius-lg);border:0;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 200ms,border-color 200ms}
.btn:hover{text-decoration:none}
.btn:focus-visible,.nav:focus-visible,.ib:focus-visible,.tab:focus-visible,.chip:focus-visible,.step:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.soft{background:rgba(0,48,135,.08);color:#003087}.soft:hover{background:rgba(0,48,135,.16);color:#003087}
.line{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.line:hover{background:#f1f5f9;color:#1e293b}
.warnbtn{background:#b45309;color:#fff}.warnbtn:hover{background:#92400e;color:#fff}
.big{height:52px;padding:0 24px;font-size:var(--text-sm-plus)}
.sm{height:36px;padding:0 12px;font-size:var(--text-xs-plus)}
.ib{width:36px;height:36px;border-radius:var(--radius-full);border:0;background:transparent;color:#475569;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.ib:hover{background:rgba(203,213,225,.35);color:#0f172a}
.inp{width:100%;height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-sm);color:#1e293b;transition:border-color 200ms}
.inp:hover{border-color:#94a3b8}.inp:focus{outline:none;border-color:#003087}
.inp::placeholder{color:var(--text-muted)}
.lbl{font-size:var(--text-sm);line-height:18px;font-weight:var(--weight-medium);color:#334155}
.tab{height:36px;padding:0 14px;border-radius:var(--radius-full);border:0;background:transparent;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#475569;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,color 200ms}
.tab:hover{background:#f1f5f9;color:#0f172a}
.tab.on{background:#003087;color:#fff}
.chip{height:36px;padding:0 14px;border-radius:var(--radius-full);border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,border-color 200ms,color 200ms}
.chip:hover{border-color:#94a3b8}
.chip.on{border-color:#003087;background:rgba(0,48,135,.08);color:#003087}
.th{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);text-transform:uppercase;color:var(--text-muted);text-align:left;padding:12px 12px;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.td{padding:14px 12px;border-bottom:1px solid #eef2f6;font-size:var(--text-sm);line-height:20px;vertical-align:middle}
.row{transition:background-color 200ms}.row:hover{background:#f8fafc}
.badge{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.badge::before{content:"";width:6px;height:6px;border-radius:var(--radius-full);background:currentColor}
.b-draft{background:#eef2f6;color:#475569}.b-approval{background:#fff4e0;color:#a14f06}.b-approved{background:#e0f2fe;color:#075985}
.b-ordered{background:rgba(0,48,135,.08);color:#003087}.b-partial{background:#fff1e6;color:#b4410c}.b-received{background:#e7f8f1;color:#047857}
.b-closed{background:#e2e8f0;color:#334155}.b-cancelled{background:#ffece6;color:#b83210}.b-over{background:#ffece6;color:#b83210}
.mono{font-family:var(--font-data);letter-spacing:.02em}
.fade{animation:gcFade 260ms cubic-bezier(0,0,.2,1)}
@keyframes gcFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.flash{animation:gcFlash 900ms ease-out}
@keyframes gcFlash{from{background:#e7f8f1}to{background:transparent}}
.scanline{animation:gcScan 1.8s ease-in-out infinite alternate}
@keyframes gcScan{from{transform:translateY(0)}to{transform:translateY(150px)}}

.sw{position:relative;width:48px;height:28px;border-radius:var(--radius-full);border:0;background:#cbd5e1;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:var(--radius-full);background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.25);transition:transform 200ms cubic-bezier(0,0,.2,1)}
.sw.on{background:#003087}.sw.on::after{transform:translateX(20px)}
.sw:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.b-live{background:#e7f8f1;color:#047857}.b-sched{background:#e0f2fe;color:#075985}.b-ended{background:#eef2f6;color:#475569}.b-paused{background:#fff4e0;color:#a14f06}
.t-member{background:#eef2f6;color:#475569}.t-silver{background:#e2e8f0;color:#334155}.t-gold{background:#fff4e0;color:#a14f06}.t-plat{background:rgba(0,48,135,.08);color:#003087}
.actc{border:1px solid transparent;transition:border-color 200ms,box-shadow 200ms}.actc:hover{border-color:#003087;box-shadow:0 6px 18px rgba(0,48,135,.12)}
.bn{font-family:var(--font-bn)}
.pulse{animation:gcPulse 1.6s ease-in-out infinite}
@keyframes gcPulse{0%,100%{opacity:1}50%{opacity:.45}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
.pcard{background:#fff;border:1px solid #e6eaf0;border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px -14px rgba(15,23,42,.10)}
.psec{font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.num{font-variant-numeric:tabular-nums}
.ai{height:28px;padding:0 10px;border-radius:var(--radius-lg);border:1px solid #d9d2fb;background:linear-gradient(135deg,#f5f3ff,#eef6ff);color:#5b21b6;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);display:inline-flex;align-items:center;gap:6px;cursor:pointer;transition:box-shadow 200ms,border-color 200ms}
.ai:hover{border-color:#a78bfa;box-shadow:0 4px 12px -6px rgba(91,33,182,.5)}
.ai:focus-visible{outline:3px solid rgba(124,58,237,.4);outline-offset:2px}
.abtn{height:32px;padding:0 12px;border-radius:var(--radius-lg);border:1px solid #e2e8f0;background:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.abtn:hover{background:#f1f5f9}
.ptabs{display:flex;gap:2px;padding:0 16px;border-bottom:1px solid #e6eaf0;overflow-x:auto;scrollbar-width:none}
.ptabs::-webkit-scrollbar{display:none}
.ptab:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:-3px}
.ptab{position:relative;height:52px;padding:0 12px;border:0;background:transparent;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-muted);cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.ptab:hover{color:#0f172a}.ptab.on{color:#003087;font-weight:var(--weight-medium)}
.ptab.on::after{content:"";position:absolute;left:8px;right:8px;bottom:-1px;height:2.5px;border-radius:3px 3px 0 0;background:#003087}
.pcnt{min-width:20px;height:20px;padding:0 6px;border-radius:var(--radius-full);background:#eef2f6;color:#475569;font-size:var(--text-xs);font-weight:var(--weight-medium);display:inline-flex;align-items:center;justify-content:center}
.ptab.on .pcnt{background:rgba(0,48,135,.1);color:#003087}
.thumb{width:44px;height:44px;flex-shrink:0;border-radius:var(--radius-lg);border:1px solid #e6eaf0;display:flex;align-items:center;justify-content:center;font-weight:var(--weight-semibold);color:#003087}

/* phones: the search box takes its own row; Filter and Export share the row below */
@media (max-width:640px){
  .ap-toolbar{gap:8px!important;padding:12px!important}
  .ap-toolbar>label.ap-search.ap-search{flex:1 1 100%!important;max-width:none!important;width:100%!important}
  .ap-toolbar>span:empty{display:none}
  .ap-toolbar>.gc-mf__btn,.ap-toolbar>.abtn{flex:1 1 0;height:44px;justify-content:center}
}
`;

// ---- markup ----

class AllProductsView extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="AllProducts">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="products-all" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Products" page="All products" placeholder="Search products, SKU or barcode" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <__PageHeader title="All products" description="Every product you sell, with price, stock and photos." actions={<>
                <__Link href="/catalog-setup" className="gc-btn gc-btn--neutral"><__Icon name="sliders-horizontal" width="18" height="18" aria-hidden="true" /> Catalog setup</__Link>
                <button type="button" className="gc-btn gc-btn--neutral" onClick={v.importCsv}><__Icon name="upload" width="18" height="18" aria-hidden="true" /> Import CSV</button>
                <__Link href="/add-product" className="gc-btn gc-btn--solid"><__Icon name="plus" width="18" height="18" aria-hidden="true" /> Add product</__Link>
              </>} />
              <div className="gc-cardrow" style={{ display: "flex", gap: "16px" }}>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m7.5 4.27 9 5.15" />
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                      <path d="m3.3 7 8.7 5 8.7-5" />
                      <path d="M12 22V12" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>386</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Active products</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>412 in total</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#fff4e0", color: "#a14f06", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                      <path d="M12 9v4" />
                      <path d="M12 17h.01" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#a14f06" }}>23</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Low or out of stock</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>7 out of stock</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#f3e8ff", color: "#6d28d9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
                      <path d="m14 7 3 3" />
                      <path d="M5 6v4" />
                      <path d="M19 14v4" />
                      <path d="M10 2v2" />
                      <path d="M7 8H3" />
                      <path d="M21 16h-4" />
                      <path d="M11 3H9" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#6d28d9" }}>34</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Missing information</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>no short description or photo</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#047857" }}>৳18,64,200</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Stock value</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>at buying price</div>
                  </div>
                </div>
              </div>
              <section className="pcard" style={{ overflow: "hidden" }}>
                <div className="ptabs" role="tablist" aria-label="Product status" onKeyDown={v.tabKey}>
                  {__list(v.tabs).map((tb, $index) => (<React.Fragment key={$index}>
                      <button type="button" role="tab" id={tb?.id} className={tb?.pcls} aria-selected={tb?.on} aria-controls="products-panel" tabIndex={tb?.tabIndex} onClick={tb?.pick}>{tb?.label}{tb?.hasCount ? (<>
  <span className="pcnt">{tb?.count}</span>
</>) : null}</button>
                    </React.Fragment>))}
                </div>
                <div className="ap-toolbar" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px", padding: "12px 16px", borderBottom: "1px solid #e6eaf0" }}>
                  <label className="ap-search" style={{ position: "relative", flex: "1 1 240px", maxWidth: "340px" }}>
                    <span style={{ position: "absolute", left: "14px", top: "12px", color: "var(--text-muted)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                    </span>
                    <input className="inp" type="search" placeholder="Name, SKU, barcode or IMEI" aria-label="Search products" value={v.q} onChange={v.typeQ} style={{ paddingLeft: "44px" }} />
                  </label>
                  <__MobileFilters label="Filter products" count={v.filterCount} onClear={v.clearFilters}>
                  <select className="inp" aria-label="Category" value={v.fCat} onChange={v.setCat} style={{ width: "190px" }}>
                    <option value="">All categories</option>
                    {__list(v.catOpts).map((c) => (<option key={c.v} value={c.v}>{c.l}</option>))}
                  </select>
                  <select className="inp" aria-label="Brand" value={v.fBrand} onChange={v.setBrand} style={{ width: "160px" }}>
                    <option value="">All brands</option>
                    {__list(v.brandOpts).map((b) => (<option key={b} value={b}>{b}</option>))}
                  </select>
                  <select className="inp" aria-label="Missing details" value={v.fTag} onChange={v.setTag} style={{ width: "180px" }}>
                    {__list(v.tagOpts).map((o) => (<option key={o.v} value={o.v}>{o.l}</option>))}
                  </select>
                  {v.wsOn ? <select className="inp" aria-label="Sell to" value={v.fSell} onChange={v.setSell} style={{ width: "180px" }}>
                    {__list(v.sellOpts).map((o) => (<option key={o.v} value={o.v}>{o.l}</option>))}
                  </select> : null}
                  {v.chOn ? <select className="inp" aria-label="Channels" value={v.fCh} onChange={v.setCh} style={{ width: "200px" }}>
                    {__list(v.chOpts).map((o) => (<option key={o.v} value={o.v}>{o.l}</option>))}
                  </select> : null}
                  </__MobileFilters>
                  {v.filtered ? (<button type="button" className="abtn" onClick={v.clearFilters}><__Icon name="x" width="14" height="14" aria-hidden="true" />Clear filters</button>) : null}
                  <span style={{ flexGrow: "1" }} />
                  <button type="button" className="abtn" onClick={v.exportCsv}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <path d="m7 10 5 5 5-5" />
  <path d="M12 15V3" />
</svg>Export</button>
                </div>
                {v.hasSel ? (<>
                  <div className="fade gc-on-dark" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", background: "#0b1733", color: "#fff", fontSize: "var(--text-sm)" }}>
                    <b>{v.selCount} selected</b>
                    <span style={{ flexGrow: "1" }} />
                    <button type="button" className="ai" onClick={v.openAi}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>Fill with AI</button>
                    {v.chOn && v.chActs.length ? (
                      <span className="ap-chmenu">
                        <button type="button" className="btn sm" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }} aria-haspopup="menu" aria-expanded={v.chMenu} onClick={v.toggleChMenu}>
                          <__Icon name="radio-tower" width="15" height="15" aria-hidden="true" /><span>Channels</span><__Icon name="chevron-down" width="14" height="14" aria-hidden="true" />
                        </button>
                        {v.chMenu ? (
                          <div className="gc-dropdown" role="menu">
                            {__list(v.chActs).map((a) => (<button key={a.l} type="button" role="menuitem" className="gc-dropdown__item" onClick={a.run}>{a.l}</button>))}
                          </div>
                        ) : null}
                      </span>
                    ) : null}
                    <button type="button" className="btn sm" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }} onClick={v.bulkCat}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                      </svg>
                      <span>Change category</span>
                    </button>
                    <button type="button" className="btn sm" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }} onClick={v.bulkLbl}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                        <path d="M8 7v10" />
                        <path d="M12 7v10" />
                        <path d="M17 7v10" />
                      </svg>
                      <span>Print labels</span>
                    </button>
                    <button type="button" className="btn sm" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }} onClick={v.bulkArchive}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                        <path d="m3.3 7 8.7 5 8.7-5" />
                        <path d="M12 22V12" />
                      </svg>
                      <span>Archive</span>
                    </button>
                    <button type="button" className="btn sm" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }} onClick={v.bulkDelete}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>
                </>) : null}
                {v.aiOpen ? (<>
                  <div className="fade" style={{ margin: "14px 16px", padding: "18px", borderRadius: "var(--radius-xl)", border: "1px solid #d9d2fb", background: "linear-gradient(135deg, #faf8ff, #f3f8ff)", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ width: "34px", height: "34px", borderRadius: "var(--radius-lg)", background: "#7c3aed", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>Fill with AI for {v.selCount} products</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Pick the columns. AI only fills empty fields unless you tick “Replace”. You check everything before it goes live.</div>
                      </div>
                      <button type="button" className="ib" aria-label="Close" onClick={v.closeAi}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {__list(v.aiCols).map((c, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={c?.cls} aria-pressed={c?.on} onClick={c?.pick} style={{ height: "36px" }}>{c?.on ? (<>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
</>) : null}{c?.label}</button>
                        </React.Fragment>))}
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <select className="inp" aria-label="Language" style={{ width: "200px" }}>
                        <option>English</option>
                        <option>বাংলা</option>
                        <option>English + বাংলা</option>
                      </select>
                      <select className="inp" aria-label="Tone" style={{ width: "200px" }}>
                        <option>Friendly</option>
                        <option>Premium</option>
                        <option>Simple and short</option>
                      </select>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)" }}><input type="checkbox" style={{ width: "16px", height: "16px" }} />Replace existing text</label>
                      <span style={{ flexGrow: "1" }} />
                      <button type="button" className="btn solid" onClick={v.runAi} style={{ background: "#6d28d9" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                        </svg>
                        <span>Generate {v.aiTotal} fields</span>
                      </button>
                    </div>
                  </div>
                </>) : null}
                <div className="gc-table-wrap" role="tabpanel" id="products-panel" aria-labelledby={v.activeTabId}>
                  {v.empty ? (
                    <__EmptyState title={v.emptyTitle} body={v.emptyBody} actionLabel={v.emptyAction} onAction={v.clearEmpty} />
                  ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th className="th" style={{ width: "44px" }}>
                          <input type="checkbox" aria-label="Select all" checked={v.allSel} onChange={v.toggleAll} style={{ width: "18px", height: "18px" }} />
                        </th>
                        <th className="th">Product</th>
                        <th className="th">Status</th>
                        {v.chOn ? <th className="th">Channels</th> : null}
                        <th className="th">Stock</th>
                        <th className="th">Category</th>
                        <th className="th">Brand</th>
                        {v.wsOn ? <th className="th">Sell to</th> : null}
                        <th className="th" style={{ textAlign: "right" }}>Price</th>
                        <th className="th">Info</th>
                        <th className="th" style={{ width: "52px" }}><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {__list(v.rows).map((r) => (<React.Fragment key={r.id}>
                          <tr className="row" onClick={r?.open} style={__sx(`background: ${r?.bg ?? ""}; cursor: pointer;`)}>
                            <td className="td">
                              <input type="checkbox" aria-label={`Select ${r?.name ?? ""}`} checked={r?.sel} onChange={r?.toggle} style={{ width: "18px", height: "18px" }} />
                            </td>
                            <td className="td">
                              <__Link href={r?.href} style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
                                <span className="thumb" style={__sx(`background: ${r?.tbg ?? ""};`)}>{r?.initial}</span>
                                <span style={{ minWidth: "180px" }}>
                                  <span style={{ display: "block", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{r?.name}</span>
                                  <span className="mono" style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap" }}><span style={__sx(`color: ${r?.skuColor ?? ""};`)}>{r?.sku}</span> · {r?.vars}</span>
                                </span>
                              </__Link>
                            </td>
                            <td className="td">
                              <span className={r?.stCls}>{r?.st}</span>
                            </td>
                            {v.chOn ? <td className="td">
                              {r?.chMarks.length ? (
                                <span className="ap-chs">
                                  {r.chMarks.map((m) => (<span key={m.k} className="ap-ch" title={m.label}>{m.logo ? <img src={m.logo} alt="" width="14" height="14" /> : <__BrandLogo brand={m.brand} size={20} decorative style={{ border: 0, borderRadius: 'var(--radius-sm)' }} />}<i className={'ap-chdot ap-chdot--' + m.tone} /><span className="sr-only">{m.label}</span></span>))}
                                </span>
                              ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                            </td> : null}
                            <td className="td">
                              <span style={__sx(`font-weight: var(--weight-medium); white-space: nowrap; color: ${r?.invColor ?? ""};`)}>{r?.inv}</span>
                              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{r?.invSub}</div>
                            </td>
                            <td className="td" style={__sx(`color: ${r?.catColor ?? ""};`)}>{r?.cat}</td>
                            <td className="td" style={{ color: "#475569" }}>{r?.brand}</td>
                            {v.wsOn ? <td className="td">
                              <span className={r?.sellCls}>{r?.sell}</span>
                            </td> : null}
                            <td className="td num" style={{ textAlign: "right" }}>
                              <span style={{ display: "block", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>{r?.price}</span>
                              {v.wsOn ? <span style={__sx(`display: block; font-size: var(--text-xs); color: ${r?.wsColor ?? ""};`)}>{r?.ws}</span> : null}
                            </td>
                            <td className="td">
                              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                {__list(r?.flags).map((f, $index) => (<React.Fragment key={$index}>
                                    <span title={f?.t} style={__sx(`height: 22px; padding: 0 7px; border-radius: var(--radius-md); background: ${f?.bg ?? ""}; color: ${f?.fg ?? ""}; font-size: var(--text-xs); font-weight: var(--weight-medium); display: inline-flex; align-items: center; white-space: nowrap;`)}>{f?.l}</span>
                                  </React.Fragment>))}
                              </div>
                            </td>
                            <td className="td" style={{ textAlign: "right" }}>
                              <__Link href={r?.href} className="ib" aria-label={`Edit ${r?.name ?? ""}`} title="Edit"><__Icon name="pencil" width="16" height="16" aria-hidden="true" /></__Link>
                            </td>
                          </tr>
                        </React.Fragment>))}
                    </tbody>
                  </table>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>
                  <span style={{ flexGrow: "1" }}>Showing {v.shown} of {v.total}</span>
                  <button type="button" className="abtn" aria-label="Previous page">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  <button type="button" className="abtn" aria-label="Next page" style={{ marginLeft: "6px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}

// The row click opens the product with the app router, so the class view gets it as a prop.
export default function AllProductsScreen() {
  const router = useRouter();
  return <AllProductsView router={router} />;
}
