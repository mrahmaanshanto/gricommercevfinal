'use client';
// Generated from design/templates/console/Merchants.dc.html by scripts/convert-design.mjs.
// Merchants · search and filters
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { ConsoleSide, ConsoleTop, ConsoleToast } from './ConsoleFrame';
import { attach, db, now, merchants, catalogue } from '@/lib/platform';

// ---- logic (from the design's <script type="text/x-dc">) ----

// stores come from the platform data (lib/platform): every store with its plan, state, health and billing
const FILTERS = [["plan", "Plan", ["All plans", "Growth", "Business", "Enterprise"]], ["module", "Module in use", ["Any module", "POS", "Warehouse", "Wholesale dues", "Landing pages", "Loyalty", "Cart recovery", "Inbox", "Blasts", "AI products", "Payroll"]], ["trial", "Trial", ["Any", "Store in trial", "Trial ends in 3 days", "Module trial running", "Not in trial"]], ["activity", "Activity", ["Any", "Active in last 7 days", "Inactive 7+ days", "Inactive 30+ days"]], ["health", "Health", ["Any score", "Healthy · 75+", "Watch · 50–74", "At risk · under 50"]], ["billing", "Billing", ["Any", "Paid", "Due", "Overdue", "In trial"]], ["segment", "Segment", ["Any", "Online", "Retail", "Wholesale"]], ["source", "Came from", ["Any source", "Physical visit", "Meta ads", "YouTube ads", "Reference", "Affiliate", "Website", "Event"]], ["by", "Onboarded by", ["Anyone", ...catalogue.ONBOARDERS]], ["dist", "District", ["All districts", ...catalogue.DISTRICTS]]];
const VIEW_KEY = 'gc.platform.view.merchants';
const AVC = {"FA": "#003087", "RH": "#0070a0", "TS": "#2e559d", "MK": "#00567a", "NI": "#7d94bf"};
const COL = { ok: '#10b981', warn: '#ff9800', err: '#ff5724', none: '#94a3b8' };
const PILL = { ok: 'pill p-ok', warn: 'pill p-warn', err: 'pill p-err', none: 'pill p-grey' };
const BILL = { Paid: 'pill p-ok', Due: 'pill p-warn', Overdue: 'pill p-err', Trial: 'pill p-grey' };
class Component extends DCLogic {
  componentDidMount() {
    this.off = attach(this);
    // a saved view (filters and sort) comes back; ?billing= / ?trial= open a filtered list
    try { const v = JSON.parse(window.localStorage.getItem(VIEW_KEY) || 'null'); if (v) this.setState(v); } catch { /* none */ }
    const q = new URLSearchParams(window.location.search);
    if (q.get('billing')) this.setState({ f_billing: q.get('billing') });
    if (q.get('trial')) this.setState({ f_trial: q.get('trial') });
  }
  componentWillUnmount() { if (this.off) this.off(); }

  renderVals() {
    const v = this.renderVals0() || {};
    const mini = !!(this.state || {}).mini;
    v.miniCls = mini ? 'mini' : '';
    if (typeof v.rootCls === 'string') v.rootCls = v.rootCls + (mini ? ' mini' : '');
    v.toggleSide = () => this.setState({ mini: !mini });
    v.sideLabel = mini ? 'Expand menu' : 'Collapse menu';
    return v;
  }

  renderVals0() {
    const s = this.state || {};
    const f = {};
    FILTERS.forEach(([k, , opts]) => { f[k] = s['f_' + k] ?? opts[0]; });
    const q = (s.q || '').trim().toLowerCase();
    const hk = (h) => h >= 75 ? 'ok' : h >= 50 ? 'warn' : 'err';
    const data = merchants(db(), now());
    const owners = Object.fromEntries(db().shops.map((x) => [x.id, x.owner.name + ' ' + x.owner.phone]));
    let list = data.rows.filter((m) => {
      if (q && !(m.n + ' ' + m.dom + ' ' + m.tid + ' ' + m.by + ' ' + owners[m.tid]).toLowerCase().includes(q)) return false;
      if (f.plan !== 'All plans' && m.plan !== f.plan) return false;
      if (f.module !== 'Any module' && !m.mods.includes(f.module)) return false;
      if (f.trial === 'Store in trial' && !(m.trial === 'trial' || m.trial === 'ending')) return false;
      if (f.trial === 'Trial ends in 3 days' && m.trial !== 'ending') return false;
      if (f.trial === 'Module trial running' && m.trial !== 'module') return false;
      if (f.trial === 'Not in trial' && m.trial !== 'none') return false;
      if (f.activity === 'Active in last 7 days' && m.last >= 7) return false;
      if (f.activity === 'Inactive 7+ days' && m.last < 7) return false;
      if (f.activity === 'Inactive 30+ days' && m.last < 30) return false;
      if (f.health === 'Healthy · 75+' && m.h < 75) return false;
      if (f.health === 'Watch · 50–74' && (m.h < 50 || m.h >= 75)) return false;
      if (f.health === 'At risk · under 50' && m.h >= 50) return false;
      if (f.billing !== 'Any' && m.bill !== (f.billing === 'In trial' ? 'Trial' : f.billing)) return false;
      if (f.segment !== 'Any' && !m.seg.includes(f.segment)) return false;
      if (f.source !== 'Any source' && m.src !== f.source) return false;
      if (f.by !== 'Anyone' && m.by !== f.by) return false;
      if (f.dist !== 'All districts' && m.dist !== f.dist) return false;
      return true;
    });
    const sort = s.sort ?? 'Last active';
    if (sort === 'Last active') list = list.slice().sort((a, b) => a.last - b.last);
    if (sort === 'Health, lowest first') list = list.slice().sort((a, b) => a.h - b.h);
    if (sort === 'Monthly value, highest first') list = list.slice().sort((a, b) => b.mrr - a.mrr);
    if (sort === 'Name') list = list.slice().sort((a, b) => a.n.localeCompare(b.n));
    const C = 2 * Math.PI * 11;
    const active = FILTERS.filter(([k, , opts]) => f[k] !== opts[0]).length + (q ? 1 : 0);
    const out = {
      kpi: data.kpis, total: data.total,
      toast: s.toast || '', hideToast: () => this.setState({ toast: '' }),
      exportCsv: () => {
        const head = ['Tenant', 'Store', 'Domain', 'Segment', 'Plan', 'State', 'Health', 'Orders this month', 'Order limit', 'Came from', 'Onboarded by', 'District', 'Billing', 'Last active (days)', 'Monthly value'];
        const esc = (x) => `"${String(x ?? '').replace(/"/g, '""')}"`;
        const csv = [head, ...list.map((r) => [r.tid, r.n, r.dom, r.seg, r.plan, r.st, r.h, r.orders, r.lim, r.src, r.by, r.dist, r.bill, r.last, r.mrr])].map((row) => row.map(esc).join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        a.download = 'gridcommerce-stores.csv';
        a.click();
        this.setState({ toast: `${list.length} stores exported to gridcommerce-stores.csv` });
      },
      saveView: () => {
        const view = { q: s.q || '', sort: s.sort };
        FILTERS.forEach(([key]) => { view['f_' + key] = s['f_' + key]; });
        try { window.localStorage.setItem(VIEW_KEY, JSON.stringify(view)); } catch { /* ignore */ }
        this.setState({ toast: 'View saved · the list opens like this next time' });
      },
      onSearch: (ev) => this.setState({ q: ev.target.value }),
      sort, onSort: (ev) => this.setState({ sort: ev.target.value }),
      more: !!s.more, moreLabel: s.more ? 'Fewer filters' : <>More filters<span className="cs-desk-only"> · segment, source, onboarded by, district</span></>,
      toggleMore: () => this.setState({ more: !s.more }),
      clearAll: () => { const r = { q: '' }; FILTERS.forEach(([key]) => { r['f_' + key] = undefined; }); this.setState(r); try { window.localStorage.removeItem(VIEW_KEY); } catch { /* ignore */ } },
      count: list.length, none: list.length === 0,
      activeText: active ? active + (active === 1 ? ' filter on' : ' filters on') : 'no filters',
      rows: list.map((m) => {
        const p = Math.min(1, m.orders / m.lim);
        return Object.assign({}, m, {
          ini: m.n.split(' ').map((w) => w[0]).slice(0, 2).join(''),
          stPill: PILL[m.sk], stShp: 'shp shp-' + m.sk,
          modsText: m.mods.join(', '),
          hCol: COL[hk(m.h)], hDash: (C * m.h / 100).toFixed(1) + ' ' + C.toFixed(1),
          ordersText: m.orders.toLocaleString('en-IN') + ' / ' + m.lim.toLocaleString('en-IN'),
          pct: (p * 100).toFixed(0) + '%', barCol: p >= 1 ? '#ff5724' : p >= .8 ? '#ff9800' : '#003087',
          billPill: BILL[m.bill],
          href: '/merchant-detail?id=' + m.tid,
          lastText: m.last === 0 ? 'Today' : m.last === 1 ? 'Yesterday' : m.last + ' days ago',
          lastCol: m.last >= 7 ? 'var(--errt)' : 'var(--body)', lastW: m.last >= 7 ? 600 : 400,
          avc: m.ownColor || AVC[m.own] || '#64748b',
        });
      }),
    };
    FILTERS.forEach(([k, , opts]) => {
      out['f_' + k] = f[k];
      out['o_' + k] = opts;
      out['on_' + k] = (ev) => this.setState({ ['f_' + k]: ev.target.value });
    });
    return out;
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:var(--font-sans);background:#e9eef5;color:#475569;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087;text-decoration:none}a:hover{color:#002a77}
.mono{font-family:var(--font-data);font-size:var(--text-xs);letter-spacing:0}
.num{font-variant-numeric:tabular-nums}
.card{background:#fff;border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04),0 6px 18px -8px rgba(15,23,42,.10)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 18px;border-radius:var(--radius-lg);border:0;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 160ms ease,color 160ms ease,transform 140ms cubic-bezier(.23,1,.32,1)}
.btn:active{transform:scale(.97)}
.btn:focus-visible,button:focus-visible,a:focus-visible{outline:3px solid rgba(0,48,135,.45);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.ghost{background:rgba(0,48,135,.08);color:#003087}.ghost:hover{background:rgba(0,48,135,.15);color:#003087}
.onnavy{background:rgba(255,255,255,.1);color:#fff}.onnavy:hover{background:rgba(255,255,255,.18);color:#fff}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
.sk{border-radius:var(--radius-md);background:linear-gradient(90deg,#eef2f7 0,#f7f9fc 40%,#eef2f7 80%);background-size:800px 100%;animation:shimmer 1.4s linear infinite}
@media (prefers-reduced-motion: reduce){.btn,.nav{transition:none}.btn:active{transform:none}.sk{animation:none}}

.cs{--bg:#eef2f7;--surface:#ffffff;--surface2:#f4f7fb;--line:#e2e8f0;--ink:#0f172a;--body:#475569;--muted:var(--text-muted);--rail:#012169;--railink:#b7c6e0;--railicon:#7d94bf;--railhead:#7fd4f5;--railon:rgba(127,212,245,.16);--railhover:rgba(255,255,255,.06);--primary:#003087;--primaryhover:#002a77;--primaryink:#ffffff;--okbg:#e7f8f1;--okt:#047857;--warnbg:#fff4e0;--warnt:#b45309;--errbg:#ffece5;--errt:#c2410c;--track:#eef2f7;--series:#003087;--seriesfill:rgba(0,48,135,.08);--scrim:rgba(1,20,60,.36);--shadow:0 1px 2px rgba(15,23,42,.04),0 6px 18px -8px rgba(15,23,42,.10)}
.cs.dark{--bg:#0a1020;--surface:#111a2e;--surface2:#16213a;--line:#24324f;--ink:#e8eef8;--body:#aebbd2;--muted:#8a9bb8;--rail:#060b17;--railink:#a7b6d0;--railicon:#6c80a5;--railhead:#66c4eb;--railon:rgba(0,156,222,.18);--railhover:rgba(255,255,255,.05);--primary:#009cde;--primaryhover:#2eaee4;--primaryink:#04121f;--okbg:rgba(16,185,129,.14);--okt:#4ade9f;--warnbg:rgba(255,152,0,.14);--warnt:#fbbf24;--errbg:rgba(255,87,36,.16);--errt:#ff8a65;--track:#1d2944;--series:#66c4eb;--seriesfill:rgba(102,196,235,.10);--scrim:rgba(0,0,0,.55);--shadow:0 1px 2px rgba(0,0,0,.3),0 8px 24px -10px rgba(0,0,0,.5)}
.cs{color:var(--body)}
.nav{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:0 12px;border:0;border-radius:var(--radius-lg);background:transparent;color:var(--railink);font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);text-align:left;cursor:pointer;transition:background-color 150ms ease,color 150ms ease}
.nav:hover{background:var(--railhover);color:#fff}
.nav.on{background:var(--railon);color:#fff}
.nav.sub{min-height:40px;padding-left:42px;font-size:var(--text-sm)}
.nav:focus-visible{outline:3px solid rgba(127,212,245,.6);outline-offset:-3px}
.chev{display:inline-flex;margin-left:auto;color:var(--railicon);transition:transform 160ms cubic-bezier(.23,1,.32,1)}
.chev.open{transform:rotate(90deg)}
.badge{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:20px;padding:0 6px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);background:rgba(255,255,255,.12);color:#fff}
.badge.warn{background:#ff9800;color:#1a1204}.badge.err{background:#ff5724;color:#1c0a04}
.tb{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border:0;border-radius:var(--radius-lg);background:transparent;color:var(--body);cursor:pointer;transition:background-color 150ms ease}
.tb:hover{background:var(--surface2)}
.seg{display:inline-flex;padding:3px;border-radius:var(--radius-lg);background:var(--surface2);border:1px solid var(--line)}
.segb{min-height:36px;padding:0 14px;border:0;border-radius:var(--radius-lg);background:transparent;color:var(--body);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer;transition:background-color 150ms ease,color 150ms ease}
.segb.on{background:var(--surface);color:var(--ink);box-shadow:0 1px 2px rgba(15,23,42,.12)}
.panel{background:var(--surface);border-radius:var(--radius-xl);box-shadow:var(--shadow)}
.sp{transition:d 200ms cubic-bezier(.23,1,.32,1)}
.searchbtn{display:flex;align-items:center;gap:10px;width:440px;height:44px;padding:0 10px 0 14px;border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--surface);color:var(--muted);font:inherit;font-size:var(--text-sm);cursor:pointer;text-align:left}
.searchbtn:hover{border-color:var(--muted)}
.kbd{margin-left:auto;display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:var(--radius-md);border:1px solid var(--line);background:var(--surface2);font-family:var(--font-data);font-size:var(--text-xs);color:var(--body)}
.pr{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:0 12px;border:0;border-radius:var(--radius-lg);background:transparent;font:inherit;font-size:var(--text-sm);color:var(--ink);text-align:left;cursor:pointer}
.pr:hover,.pr.on{background:var(--surface2)}
.rowlink{color:var(--primary);font-size:var(--text-xs-plus);font-weight:var(--weight-medium)}
.rowlink:hover{color:var(--primaryhover)}
.btnp{background:var(--primary);color:var(--primaryink)}.btnp:hover{background:var(--primaryhover);color:var(--primaryink)}
.btng{background:var(--surface2);color:var(--ink);border:1px solid var(--line)}.btng:hover{border-color:var(--muted)}
.tone-good{color:var(--okt)}.tone-bad{color:var(--errt)}.tone-flat{color:var(--muted)}
@media (prefers-reduced-motion: reduce){.chev,.sp,.segb,.tb{transition:none}}

.bn{font-family:var(--font-bn)}
.shp{display:inline-block;flex:none;width:10px;height:10px}
.shp-ok{border-radius:50%;background:#10b981}
.shp-warn{background:#ff9800;clip-path:polygon(50% 0,100% 100%,0 100%)}
.shp-err{width:9px;height:9px;margin:0 1px;background:#ff5724;transform:rotate(45deg)}
.shp-none{border:2px solid #94a3b8;border-radius:50%}
.shp-hot{width:9px;height:9px;margin:0 1px;background:#ff5724;transform:rotate(45deg)}
.pill{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 9px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.p-navy{background:#e0e6f1;color:#003087}.p-sky{background:#e0f3fb;color:#00567a}.p-grey{background:#f1f5f9;color:#475569}
.p-ok{background:#e7f8f1;color:#047857}.p-warn{background:#fff4e0;color:#b45309}.p-err{background:#ffece5;color:#c2410c}
.av{display:inline-flex;align-items:center;justify-content:center;flex:none;width:28px;height:28px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);color:#fff}
.tab{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 4px;border:0;border-bottom:2px solid transparent;background:transparent;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--body);cursor:pointer}
.tab.on{border-bottom-color:var(--primary);color:var(--primary);font-weight:var(--weight-medium)}
.cnt{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:20px;padding:0 6px;border-radius:var(--radius-full);background:var(--surface2);border:1px solid var(--line);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--body)}
.tab.on .cnt{background:#003087;border-color:#003087;color:#fff}
.tk{display:flex;flex-direction:column;gap:6px;width:100%;padding:12px 14px;border:0;border-left:3px solid transparent;border-bottom:1px solid var(--line);background:transparent;font:inherit;text-align:left;cursor:pointer;transition:background-color 150ms ease}
.tk:hover{background:var(--surface2)}
.tk.on{background:#f2f5f9;border-left-color:#003087}
.msg{max-width:560px;padding:12px 14px;border-radius:var(--radius-xl);font-size:var(--text-sm);line-height:1.6}
.m-merchant{align-self:flex-start;background:var(--surface2);color:var(--ink);border-top-left-radius:4px}
.m-staff{align-self:flex-end;background:#003087;color:#fff;border-top-right-radius:4px}
.m-note{align-self:stretch;max-width:none;background:#fff8e6;color:#5c3303;border:1px dashed #f5c26b}
.m-system{align-self:center;max-width:none;padding:6px 12px;border-radius:var(--radius-full);background:transparent;color:var(--muted);font-size:var(--text-xs)}
.mode{min-height:36px;padding:0 12px;border:0;border-radius:var(--radius-lg);background:transparent;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--body);cursor:pointer}
.mode.on{background:var(--surface);color:var(--ink);box-shadow:0 1px 2px rgba(15,23,42,.12)}
.lc{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:var(--radius-xl);background:#fff;border:1px solid #e6ebf2;color:inherit;transition:border-color 150ms ease,box-shadow 150ms ease}
.lc:hover{border-color:#99accf;box-shadow:0 8px 20px -14px rgba(15,23,42,.35);color:inherit}
.dot{display:inline-block;width:18px;height:18px;border-radius:var(--radius-md)}
.d-done{background:#003087}
.d-todo{border:2px dashed #cbd5e1}
.d-stuck{background:#fff4e0;border:2px solid #ff9800}
.fchip{display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:0 12px;border:1px solid var(--line);border-radius:var(--radius-full);background:var(--surface);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--body);cursor:pointer}
.fchip.on{background:#003087;border-color:#003087;color:#fff}
.radio{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border:1px solid var(--line);border-radius:var(--radius-xl);background:var(--surface);font:inherit;text-align:left;cursor:pointer;width:100%}
.radio.on{border-color:#003087;background:#f2f5f9;box-shadow:0 0 0 1px #003087}
.rdot{flex:none;width:18px;height:18px;margin-top:2px;border-radius:var(--radius-full);border:2px solid #94a3b8}
.radio.on .rdot{border:6px solid #003087}
select.sel{height:40px;padding:0 10px;border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--surface);font:inherit;font-size:var(--text-xs-plus);color:var(--ink)}
@media (prefers-reduced-motion: reduce){.tk,.lc{transition:none}}

.inp{height:44px;padding:0 14px;border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--surface);font:inherit;font-size:var(--text-sm);color:var(--ink)}
.fl{display:flex;flex-direction:column;gap:5px;font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:.04em;color:var(--muted);min-width:0}
.fl select{width:100%}
.mrow{display:grid;grid-template-columns:minmax(0,2fr) 150px minmax(0,1.3fr) 76px 130px minmax(0,1fr) 110px 110px 34px;align-items:center;gap:12px;min-height:56px;padding:0 18px;border-top:1px solid var(--line);color:inherit;transition:background-color 150ms ease}
.mrow:hover{background:var(--surface2);color:inherit}
.mt{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 2px;border:0;border-bottom:2px solid transparent;background:transparent;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--body);cursor:pointer;white-space:nowrap}
.mt.on{border-bottom-color:#003087;color:#003087;font-weight:var(--weight-medium)}
.fact{display:flex;flex-direction:column;gap:3px;padding:12px 16px;min-width:0}
.fact + .fact{border-left:1px solid var(--line)}
.mod{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;border-radius:var(--radius-lg);font-size:var(--text-xs);white-space:nowrap}
.mod-in{background:#003087;color:#fff}.mod-add{background:#e0f3fb;color:#00567a;border:1px solid #99d7f2}.mod-trial{background:#fff;color:#0070a0;border:2px dashed #009cde}
.mod-lock{background:var(--surface2);color:var(--muted);border:1px solid var(--line)}.mod-off{background:transparent;color:var(--text-muted);border:1px dashed #e2e8f0}
.src{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 14px;border-radius:var(--radius-full);border:1px solid var(--line);font-size:var(--text-xs-plus);color:var(--body);background:var(--surface)}
.src.on{background:#003087;border-color:#003087;color:#fff;font-weight:var(--weight-medium)}
.toast{position:absolute;right:24px;bottom:24px;display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:var(--radius-xl);background:#0f172a;color:#fff;box-shadow:0 16px 36px -16px rgba(0,0,0,.55);font-size:var(--text-sm);z-index:5}
@media (prefers-reduced-motion: reduce){.mrow{transition:none}}


.cs{--bg:#f3f6fb;--side:#ffffff;--sideline:#e6ebf3;--sideink:#0f172a;--sidebody:#475569;--sidemuted:#64748b;--sidehover:#f4f7fb;--sideon:#eaf1ff;--sideonink:#003087;--iconbg:#eef3fb;--iconfg:#2e559d;--iconon:linear-gradient(145deg,#1f6fe0 0%,#003087 100%);--guide:#e2e8f0;--topbar:rgba(255,255,255,.86);--card:#ffffff;--cardline:#e8edf5}
.cs.dark{--bg:#0a1020;--side:#0c1426;--sideline:#1c2842;--sideink:#e8eef8;--sidebody:#aebbd2;--sidemuted:#8a9bb8;--sidehover:rgba(255,255,255,.04);--sideon:rgba(0,156,222,.16);--sideonink:#7fd4f5;--iconbg:rgba(255,255,255,.06);--iconfg:#9fb3d6;--iconon:linear-gradient(145deg,#2eaee4 0%,#0070a0 100%);--guide:#24324f;--topbar:rgba(17,26,46,.86);--card:#111a2e;--cardline:#22304d}
.side{position:absolute;left:0;top:0;bottom:0;width:272px;display:flex;flex-direction:column;background:var(--side);border-right:1px solid var(--sideline)}
.nav{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:0 10px;border:0;border-radius:var(--radius-xl);background:transparent;color:var(--sidebody);font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);text-align:left;text-decoration:none;cursor:pointer;transition:background-color 150ms ease,color 150ms ease}
.nav:hover{background:var(--sidehover);color:var(--sideink)}
.nav:active{transform:scale(.99)}
.nav:focus-visible{outline:3px solid rgba(0,48,135,.35);outline-offset:-2px}
.navic{flex:none;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:var(--radius-lg);background:var(--iconbg);color:var(--iconfg);transition:background-color 150ms ease,color 150ms ease}
.nav.grp.open{color:var(--sideink);font-weight:var(--weight-medium)}
.nav.grp.open .navic,.nav.top.on .navic{background:var(--iconon);color:#fff;box-shadow:0 6px 14px -6px rgba(0,48,135,.55)}
.nav.top.on{color:var(--sideink);font-weight:var(--weight-medium);background:var(--sidehover)}
.kids{position:relative;display:grid;gap:2px;margin:2px 0 8px 0;padding-left:44px}
.kids:before{content:"";position:absolute;left:25px;top:4px;bottom:4px;width:1.5px;border-radius:2px;background:var(--guide)}
.nav.sub{position:relative;min-height:38px;padding:0 10px;font-size:var(--text-sm);border-radius:var(--radius-lg)}
.nav.sub.on{background:var(--sideon);color:var(--sideonink);font-weight:var(--weight-medium)}
.nav.sub.on:before{content:"";position:absolute;left:-20px;top:9px;bottom:9px;width:3px;border-radius:3px;background:#003087}
.cs.dark .nav.sub.on:before{background:#2eaee4}
.chev{display:inline-flex;margin-left:auto;color:var(--sidemuted);transition:transform 160ms cubic-bezier(.23,1,.32,1)}
.chev.open{transform:rotate(90deg)}
.badge{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:20px;padding:0 7px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);background:#eef2f7;color:#475569}
.badge.warn{background:#fff1d6;color:#9a4a00}.badge.err{background:#ffe3d9;color:#b3340e}
.cs.dark .badge{background:rgba(255,255,255,.08);color:#cbd5e1}.cs.dark .badge.warn{background:rgba(255,152,0,.18);color:#fbbf24}.cs.dark .badge.err{background:rgba(255,87,36,.2);color:#ff8a65}
.topbar{position:absolute;left:272px;right:0;top:0;height:64px;display:flex;align-items:center;gap:12px;padding:0 24px 0 28px;background:var(--topbar);backdrop-filter:saturate(160%) blur(12px);-webkit-backdrop-filter:saturate(160%) blur(12px);border-bottom:1px solid var(--sideline);z-index:3}
.crumbic{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:var(--radius-lg);background:var(--iconbg);color:var(--iconfg)}
.searchbtn{width:400px;height:40px;border-radius:var(--radius-xl);background:var(--surface2);border:1px solid transparent}
.searchbtn:hover{border-color:var(--line);background:var(--surface)}
.tb{width:40px;height:40px;border-radius:var(--radius-xl)}
.panel{background:var(--card);border:1px solid var(--cardline);border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04)}
.kpi{position:relative;display:flex;flex-direction:column;gap:4px;padding:14px 16px 12px;border-radius:var(--radius-xl);background:var(--card);border:1px solid var(--cardline);box-shadow:0 1px 2px rgba(15,23,42,.04);overflow:hidden}
.dpill{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.d-good{background:#e7f8f1;color:#047857}.d-bad{background:#ffece5;color:#c2410c}.d-flat{background:transparent;color:var(--muted);padding:0}
.th{background:#f8fafc;border-bottom:1px solid var(--line)}
.cs.dark .th{background:rgba(255,255,255,.03)}
.statuscard{margin:0 14px 10px;padding:12px 14px;border-radius:var(--radius-xl);background:linear-gradient(160deg,#f5f9ff 0%,#eef4fd 100%);border:1px solid #e1eaf7}
.cs.dark .statuscard{background:rgba(255,255,255,.04);border-color:var(--sideline)}
.me{display:flex;align-items:center;gap:10px;margin:0 14px 14px;padding:10px;border-radius:var(--radius-xl);border:1px solid var(--sideline)}
@media (prefers-reduced-motion: reduce){.nav,.navic,.chev{transition:none}.nav:active{transform:none}}

.sidein{display:flex;flex-direction:column;height:min(100%,900px);min-height:0}
.cs{overflow-wrap:break-word}
.cs [style*="display:grid"] > *{min-width:0}
.pill{white-space:normal;height:auto;min-height:24px;padding:3px 9px;line-height:1.3;max-width:100%}
.dpill{white-space:normal;height:auto;min-height:22px;padding:3px 8px;line-height:1.35;max-width:100%}
.d-flat{padding:0}
.kl{font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--body);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.ell{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.nav{position:relative;min-height:38px}
.navlabel{margin:6px 10px 4px !important}
.sidemeta{padding-bottom:8px !important}
.nav.sub{min-height:34px}
.kids{margin:2px 0 4px 0}
.statuscard{padding:10px 12px}
.me{padding:8px 10px}
.sidehead{padding-top:14px !important}
.sidenav{flex-grow:1;display:flex;flex-direction:column;gap:2px;padding:0 12px 8px;overflow-y:auto;scrollbar-width:thin}
.navtxt{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.side{transition:width 220ms cubic-bezier(.23,1,.32,1)}
.topbar,.mainarea,.formbar{transition:left 220ms cubic-bezier(.23,1,.32,1)}
.sidetoggle{margin-left:auto;flex:none;color:var(--sidemuted)}
.logo-mini{display:none}
.cs.mini .side{width:76px}
.cs.mini .topbar{left:76px}
.cs.mini .mainarea{left:76px !important}
.cs.mini .navtxt,.cs.mini .chev,.cs.mini .kids,.cs.mini .sidemeta,.cs.mini .logo-full,.cs.mini .statustxt,.cs.mini .metxt,.cs.mini .mebtn,.cs.mini .navlabel{display:none !important}
.cs.mini .logo-mini{display:block}
.cs.mini .sidehead{flex-direction:column;align-items:center;padding:16px 0 10px;gap:10px}
.cs.mini .sidetoggle{margin-left:0}
.cs.mini .sidenav{padding:0 12px 8px}
.cs.mini .nav{justify-content:center;padding:0}
.cs.mini .nav .badge{position:absolute;top:5px;right:8px;min-width:9px;width:9px;height:9px;padding:0;font-size:0;border:2px solid var(--side);background:#ff9800}
.cs.mini .nav .badge.err{background:#ff5724}
.cs.mini .statuscard{margin:0 12px 10px;padding:12px 0;display:flex;justify-content:center}
.cs.mini .me{justify-content:center;margin:0 12px 12px;padding:8px 0}
@media (prefers-reduced-motion: reduce){.side,.topbar,.mainarea,.formbar{transition:none}}
.fcard{background:var(--card);border:1px solid var(--cardline);border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04);padding:4px 28px}
.fsec{display:grid;grid-template-columns:250px minmax(0,1fr);gap:32px;padding:24px 0}
.fsec + .fsec{border-top:1px solid var(--line)}
.fsh{font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--ink);margin:0}
.fsd{margin:6px 0 0;font-size:var(--text-xs-plus);line-height:1.55;color:var(--body)}
.fgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 18px}
.fld{display:flex;flex-direction:column;gap:6px;min-width:0}
.flab{font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--ink)}
.req{color:#c2410c;margin-left:2px}
.fhelp{font-size:var(--text-xs);line-height:1.45;color:var(--muted)}
.ferr{display:flex;align-items:center;gap:6px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:#c2410c}
.in{width:100%;height:44px;padding:0 12px;border:1px solid #d5dde8;border-radius:var(--radius-lg);background:var(--surface);font:inherit;font-size:var(--text-sm);color:var(--ink)}
textarea.in{height:auto;padding:10px 12px;line-height:1.5;resize:vertical}
select.in{padding-right:8px}
.in:focus,.affix:focus-within{outline:none;border-color:#003087;box-shadow:0 0 0 3px rgba(0,48,135,.15)}
.in.err,.affix.err{border-color:#ff5724;box-shadow:0 0 0 3px rgba(255,87,36,.12)}
.in.ok{border-color:#10b981}
.in[disabled]{background:var(--surface2);color:var(--muted)}
.affix{display:flex;align-items:stretch;height:44px;border:1px solid #d5dde8;border-radius:var(--radius-lg);overflow:hidden;background:var(--surface)}
.affix > span{display:flex;align-items:center;flex:none;padding:0 12px;background:var(--surface2);color:var(--body);font-size:var(--text-xs-plus)}
.affix > span.pre{border-right:1px solid #d5dde8}.affix > span.post{border-left:1px solid #d5dde8}
.affix input{flex:1;min-width:0;border:0;padding:0 12px;font:inherit;font-size:var(--text-sm);background:transparent;color:var(--ink);outline:none}
.sw{position:relative;display:inline-flex;flex:none;width:40px;height:24px;border-radius:var(--radius-full);background:#cbd5e1}
.sw:after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:var(--radius-full);background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform 160ms cubic-bezier(.23,1,.32,1)}
.sw.on{background:#003087}.sw.on:after{transform:translateX(16px)}
.swrow{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:12px 0}
.swrow + .swrow{border-top:1px solid var(--line)}
.rgrid{display:grid;gap:10px}
.rc{display:flex;gap:12px;align-items:flex-start;padding:14px;border:1px solid #d5dde8;border-radius:var(--radius-xl);background:var(--surface);min-width:0}
.rc.on{border-color:#003087;background:#f5f8ff;box-shadow:0 0 0 1px #003087}
.rc .rdot{margin-top:1px}
.rc.on .rdot{border:6px solid #003087}
.cb{flex:none;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:var(--radius-sm);border:2px solid #94a3b8;background:#fff}
.cb.on{background:#003087;border-color:#003087;color:#fff}
.cb.dis{background:var(--surface2);border-color:#cbd5e1}
.chk{display:flex;align-items:center;gap:10px;min-height:36px;font-size:var(--text-sm);color:var(--ink);min-width:0}
.tagsel{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;border-radius:var(--radius-full);border:1px solid #d5dde8;font-size:var(--text-xs-plus);color:var(--body);background:var(--surface)}
.tagsel.on{background:#003087;border-color:#003087;color:#fff;font-weight:var(--weight-medium)}
.formbar{position:absolute;left:0;right:0;bottom:0;height:72px;display:flex;align-items:center;gap:10px;padding:0 28px;background:rgba(255,255,255,.92);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-top:1px solid var(--line);z-index:3}
.note{padding:12px 14px;border-radius:var(--radius-xl);font-size:var(--text-xs-plus);line-height:1.55}
.n-info{background:#f2f5f9;color:var(--ink)}.n-warn{background:#fff4e0;color:#7a3e05}.n-err{background:#ffece5;color:#7c2d12}.n-ok{background:#e7f8f1;color:#065f46}
`;

// ---- markup ----

export default class MerchantsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="Merchants">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={`cs ${v.miniCls ?? ""}`} style={{ width: "1440px", height: "1400px", overflow: "hidden", position: "relative", background: "var(--bg)" }}>
          <ConsoleSide group="tenants" item="merchants" toggle={v.toggleSide} label={v.sideLabel} />
          <ConsoleTop group="tenants" page="Merchants" />
          <main className="mainarea" style={{ position: "absolute", left: "272px", right: "0", top: "64px", bottom: "0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px" }}>
                <div style={{ minWidth: "0" }}>
                  <h1 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }}>Merchants</h1>
                  <p style={{ margin: "5px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>Every store on GridCommerce · click a store to open its full merchant page</p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: "none" }}>
                  <button className="btn btng" type="button" onClick={v.exportCsv} style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
</svg>Export CSV</button>
                  <__Link href="/form-provision" className="btn btnp" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 5v14M5 12h14" />
</svg>Provision a store</__Link>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: "12px" }}>
                <div className="kpi">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span className="kl" title="Stores">Stores</span>
                    <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                      <path d="M0.0,19.0 L4.3,18.6 L8.5,16.5 L12.8,16.2 L17.1,15.3 L21.3,13.6 L25.6,11.4 L29.9,9.3 L34.1,7.3 L38.4,7.3 L42.7,5.9 L46.9,4.5 L51.2,4.1 L55.5,4.5 L59.7,3.6 L64.0,3.0 L64,22 L0,22 Z" fill="#10b981" opacity=".10" />
                      <path d="M0.0,19.0 L4.3,18.6 L8.5,16.5 L12.8,16.2 L17.1,15.3 L21.3,13.6 L25.6,11.4 L29.9,9.3 L34.1,7.3 L38.4,7.3 L42.7,5.9 L46.9,4.5 L51.2,4.1 L55.5,4.5 L59.7,3.6 L64.0,3.0" fill="none" stroke="#10b981" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title={v.kpi.stores}>{v.kpi.stores}</span>
                  <div>
                    <span className="dpill d-good">{v.kpi.storesNote}</span>
                  </div>
                </div>
                <div className="kpi">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span className="kl" title="Paying">Paying</span>
                    <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                      <path d="M0.0,13.3 L4.3,15.3 L8.5,16.6 L12.8,15.9 L17.1,10.6 L21.3,4.6 L25.6,10.5 L29.9,6.6 L34.1,11.1 L38.4,16.0 L42.7,17.0 L46.9,19.0 L51.2,12.8 L55.5,7.5 L59.7,3.0 L64.0,9.1 L64,22 L0,22 Z" fill="#6683b7" opacity=".10" />
                      <path d="M0.0,13.3 L4.3,15.3 L8.5,16.6 L12.8,15.9 L17.1,10.6 L21.3,4.6 L25.6,10.5 L29.9,6.6 L34.1,11.1 L38.4,16.0 L42.7,17.0 L46.9,19.0 L51.2,12.8 L55.5,7.5 L59.7,3.0 L64.0,9.1" fill="none" stroke="#6683b7" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title={v.kpi.paying}>{v.kpi.paying}</span>
                  <div>
                    <span className="dpill d-flat">{v.kpi.payingNote}</span>
                  </div>
                </div>
                <div className="kpi">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span className="kl" title="In trial">In trial</span>
                    <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                      <path d="M0.0,19.0 L4.3,16.2 L8.5,11.6 L12.8,8.3 L17.1,10.9 L21.3,11.9 L25.6,7.3 L29.9,11.0 L34.1,10.3 L38.4,4.6 L42.7,6.3 L46.9,8.6 L51.2,6.8 L55.5,7.2 L59.7,3.0 L64.0,5.2 L64,22 L0,22 Z" fill="#6683b7" opacity=".10" />
                      <path d="M0.0,19.0 L4.3,16.2 L8.5,11.6 L12.8,8.3 L17.1,10.9 L21.3,11.9 L25.6,7.3 L29.9,11.0 L34.1,10.3 L38.4,4.6 L42.7,6.3 L46.9,8.6 L51.2,6.8 L55.5,7.2 L59.7,3.0 L64.0,5.2" fill="none" stroke="#6683b7" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title={v.kpi.trial}>{v.kpi.trial}</span>
                  <div>
                    <span className="dpill d-flat">{v.kpi.trialNote}</span>
                  </div>
                </div>
                <div className="kpi">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span className="kl" title="Overdue">Overdue</span>
                    <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                      <path d="M0.0,19.0 L4.3,17.4 L8.5,15.8 L12.8,16.1 L17.1,15.9 L21.3,14.0 L25.6,13.0 L29.9,10.8 L34.1,10.6 L38.4,8.0 L42.7,6.9 L46.9,7.6 L51.2,6.2 L55.5,5.8 L59.7,5.6 L64.0,3.0 L64,22 L0,22 Z" fill="#ff5724" opacity=".10" />
                      <path d="M0.0,19.0 L4.3,17.4 L8.5,15.8 L12.8,16.1 L17.1,15.9 L21.3,14.0 L25.6,13.0 L29.9,10.8 L34.1,10.6 L38.4,8.0 L42.7,6.9 L46.9,7.6 L51.2,6.2 L55.5,5.8 L59.7,5.6 L64.0,3.0" fill="none" stroke="#ff5724" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title={v.kpi.overdue}>{v.kpi.overdue}</span>
                  <div>
                    <span className="dpill d-bad">{v.kpi.overdueNote}</span>
                  </div>
                </div>
                <div className="kpi">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span className="kl" title="Inactive 7+ days">Inactive 7+ days</span>
                    <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                      <path d="M0.0,17.8 L4.3,18.3 L8.5,17.9 L12.8,19.0 L17.1,16.0 L21.3,17.4 L25.6,14.0 L29.9,11.4 L34.1,9.5 L38.4,9.4 L42.7,7.6 L46.9,7.5 L51.2,3.2 L55.5,3.0 L59.7,3.2 L64.0,3.1 L64,22 L0,22 Z" fill="#ff5724" opacity=".10" />
                      <path d="M0.0,17.8 L4.3,18.3 L8.5,17.9 L12.8,19.0 L17.1,16.0 L21.3,17.4 L25.6,14.0 L29.9,11.4 L34.1,9.5 L38.4,9.4 L42.7,7.6 L46.9,7.5 L51.2,3.2 L55.5,3.0 L59.7,3.2 L64.0,3.1" fill="none" stroke="#ff5724" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title={v.kpi.inactive}>{v.kpi.inactive}</span>
                  <div>
                    <span className="dpill d-bad">{v.kpi.inactiveNote}</span>
                  </div>
                </div>
              </div>
              <div className="panel" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <label style={{ position: "relative", flexGrow: "1" }}>
                    <span style={{ position: "absolute", left: "14px", top: "13px", color: "var(--muted)" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                      </svg>
                    </span>
                    <span style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>Search merchants</span>
                    <input aria-label="Search by store, owner, phone, domain or tenant number" className="inp" type="search" placeholder="Search by store, owner, phone, domain or tenant number" onInput={v.onSearch} style={{ width: "100%", paddingLeft: "42px", height: "48px", fontSize: "var(--text-sm-plus)" }} />
                  </label>
                  <label className="fl" style={{ flexDirection: "row", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", letterSpacing: "0" }}>Sort<select className="sel" value={v.sort} onChange={v.onSort}>
  <option>Last active</option>
  <option>Health, lowest first</option>
  <option>Monthly value, highest first</option>
  <option>Name</option>
</select></label>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: "12px" }}>
                  <label className="fl">Plan<select className="sel" value={v.f_plan} onChange={v.on_plan}>
  {__list(v.o_plan).map((op, $index) => (<React.Fragment key={$index}>
      <option value={op}>{op}</option>
    </React.Fragment>))}
</select></label>
                  <label className="fl">Module in use<select className="sel" value={v.f_module} onChange={v.on_module}>
  {__list(v.o_module).map((op, $index) => (<React.Fragment key={$index}>
      <option value={op}>{op}</option>
    </React.Fragment>))}
</select></label>
                  <label className="fl">Trial<select className="sel" value={v.f_trial} onChange={v.on_trial}>
  {__list(v.o_trial).map((op, $index) => (<React.Fragment key={$index}>
      <option value={op}>{op}</option>
    </React.Fragment>))}
</select></label>
                  <label className="fl">Activity<select className="sel" value={v.f_activity} onChange={v.on_activity}>
  {__list(v.o_activity).map((op, $index) => (<React.Fragment key={$index}>
      <option value={op}>{op}</option>
    </React.Fragment>))}
</select></label>
                  <label className="fl">Health<select className="sel" value={v.f_health} onChange={v.on_health}>
  {__list(v.o_health).map((op, $index) => (<React.Fragment key={$index}>
      <option value={op}>{op}</option>
    </React.Fragment>))}
</select></label>
                  <label className="fl">Billing<select className="sel" value={v.f_billing} onChange={v.on_billing}>
  {__list(v.o_billing).map((op, $index) => (<React.Fragment key={$index}>
      <option value={op}>{op}</option>
    </React.Fragment>))}
</select></label>
                </div>
                {v.more ? (<>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: "12px" }}>
                    <label className="fl">Segment<select className="sel" value={v.f_segment} onChange={v.on_segment}>
  {__list(v.o_segment).map((op, $index) => (<React.Fragment key={$index}>
      <option value={op}>{op}</option>
    </React.Fragment>))}
</select></label>
                    <label className="fl">Came from<select className="sel" value={v.f_source} onChange={v.on_source}>
  {__list(v.o_source).map((op, $index) => (<React.Fragment key={$index}>
      <option value={op}>{op}</option>
    </React.Fragment>))}
</select></label>
                    <label className="fl">Onboarded by<select className="sel" value={v.f_by} onChange={v.on_by}>
  {__list(v.o_by).map((op, $index) => (<React.Fragment key={$index}>
      <option value={op}>{op}</option>
    </React.Fragment>))}
</select></label>
                    <label className="fl">District<select className="sel" value={v.f_dist} onChange={v.on_dist}>
  {__list(v.o_dist).map((op, $index) => (<React.Fragment key={$index}>
      <option value={op}>{op}</option>
    </React.Fragment>))}
</select></label>
                  </div>
                </>) : null}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "var(--text-xs-plus)" }}>
                  <button className="btn btng" type="button" onClick={v.toggleMore} style={{ minHeight: "36px", padding: "0 12px", fontSize: "var(--text-xs-plus)" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3Z" />
</svg>{v.moreLabel}</button>
                  <span style={{ color: "var(--body)" }}><strong className="num" style={{ color: "var(--ink)" }}>{v.count}</strong> of {v.total} shown here · {v.activeText}</span>
                  <button className="btn" type="button" onClick={v.clearAll} style={{ marginLeft: "auto", minHeight: "36px", padding: "0 12px", fontSize: "var(--text-xs-plus)", background: "transparent", color: "#003087" }}>Clear all</button>
                  <button className="btn btng" type="button" onClick={v.saveView} style={{ minHeight: "36px", padding: "0 12px", fontSize: "var(--text-xs-plus)" }}>Save this view</button>
                </div>
              </div>
              <div className="panel" style={{ overflow: "hidden", "--cs-row-min": "1180px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) 150px minmax(0,1.3fr) 76px 130px minmax(0,1fr) 110px 110px 34px", gap: "12px", padding: "10px 18px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>
                  <span>Store</span>
                  <span>Plan</span>
                  <span>State · modules</span>
                  <span>Health</span>
                  <span>Orders this month</span>
                  <span>Came from</span>
                  <span>Billing</span>
                  <span>Last active</span>
                  <span />
                </div>
                {__list(v.rows).map((r) => (<React.Fragment key={r.tid}>
                    <__Link href={r.href} className="mrow">
                      <span style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "0" }}>
                        <span style={{ flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>{r?.ini}</span>
                        <span style={{ minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r?.n}</span>
                          <span className="mono" style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r?.tid} · {r?.dom}</span>
                        </span>
                      </span>
                      {" "}
                      <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span className="pill p-navy" style={{ alignSelf: "flex-start" }}>{r?.plan}</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>{r?.seg}</span>
                      </span>
                      {" "}
                      <span style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: "0" }}>
                        <span className={r?.stPill} style={{ alignSelf: "flex-start" }}><span className={r?.stShp} />{r?.st}</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r?.modsText}</span>
                      </span>
                      {" "}
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
                          <circle cx="15" cy="15" r="11" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                          <circle cx="15" cy="15" r="11" fill="none" stroke={r?.hCol} strokeWidth="4" strokeLinecap="round" strokeDasharray={r?.hDash} transform="rotate(-90 15 15)" />
                        </svg>
                        <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>{r?.h}</span>
                      </span>
                      {" "}
                      <span style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span className="num" style={{ fontSize: "var(--text-xs)", color: "var(--body)" }}>{r?.ordersText}</span>
                        <span style={{ display: "block", height: "7px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                          <span style={__sx(`display:block;width:${r?.pct ?? ""};height:100%;border-radius:var(--radius-sm);background:${r?.barCol ?? ""}`)} />
                        </span>
                      </span>
                      {" "}
                      <span style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: "0" }}>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>{r?.src}</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>by {r?.by}</span>
                      </span>
                      {" "}
                      <span className={r?.billPill} style={{ justifySelf: "start" }}>{r?.bill}</span>
                      {" "}
                      <span style={__sx(`font-size:var(--text-xs-plus);color:${r?.lastCol ?? ""};font-weight:${r?.lastW ?? ""}`)}>{r?.lastText}</span>
                      {" "}
                      <span className="av" style={__sx(`width:28px;height:28px;background:${r?.avc ?? ""}`)}>{r?.own}</span>
                    </__Link>
                  </React.Fragment>))}
                {v.none ? (<>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "48px 20px", textAlign: "center" }}>
                    <span style={{ color: "var(--text-muted)" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                      </svg>
                    </span>
                    <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "var(--ink)" }}>No stores match</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>Try fewer filters or a shorter search.</div>
                    <button className="btn btng" type="button" onClick={v.clearAll} style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Clear filters</button>
                  </div>
                </>) : null}
              </div>
            </div>
          </main>
          <ConsoleToast text={v.toast} onClose={v.hideToast} />
        </div>
      </div>
    );
  }
}
