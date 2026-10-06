'use client';
// Generated from design/templates/console/Provisioning.dc.html by scripts/convert-design.mjs.
// Tenants · Provisioning
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { ConsoleSide, ConsoleTop, ConsoleToast } from './ConsoleFrame';
import { MAIN, PAGE, TITLEROW, H1, SUBT, H2, PHEAD, PSIDE, PANEL, TH, CELL, BTN, grid, row, Kpi, StoreCell, BarRow, Plus } from './consoleParts';
import { attach, db, now, param, provisioning, retryRun, catalogue, fmt } from '@/lib/platform';

// ---- logic (from the design's <script type="text/x-dc">) ----

// Provisioning: every new store from signup to live, stage by stage (lib/platform › runs). A failed run is retried from
// the stage it stopped at; earlier stages are kept.
const DOT = {
  done: { display: 'inline-block', background: '#003087', width: '14px', height: '14px', borderRadius: 'var(--radius-full)' },
  running: { display: 'inline-block', background: '#fff', border: '3px solid #009cde', width: '14px', height: '14px', borderRadius: 'var(--radius-full)' },
  failed: { display: 'inline-block', background: '#ff5724', transform: 'rotate(45deg)', width: '12px', height: '12px', borderRadius: '2px' },
  todo: { display: 'inline-block', border: '2px dashed #cbd5e1', width: '14px', height: '14px', borderRadius: 'var(--radius-full)' },
};

class Component extends DCLogic {
  componentDidMount() {
    this.off = attach(this);
    const id = param('run'); if (id) this.setState({ sel: id });
    // a run in progress moves every second
    this.tick = window.setInterval(() => { if (provisioning(db(), now()).runs.some((r) => r.status === 'running')) this.forceUpdate(); }, 1000);
  }
  componentWillUnmount() { if (this.off) this.off(); window.clearInterval(this.tick); }

  renderVals() {
    const v = this.renderVals0() || {};
    const mini = !!(this.state || {}).mini;
    v.miniCls = mini ? 'mini' : '';
    v.toggleSide = () => this.setState({ mini: !mini });
    v.sideLabel = mini ? 'Expand menu' : 'Collapse menu';
    return v;
  }

  renderVals0() {
    const s = this.state || {};
    const t = now();
    const d = db();
    const p = provisioning(d, t);
    const say = (text, tone = 'ok') => this.setState({ toast: text, toastTone: tone });
    const sel = p.all.find((r) => r.id === s.sel) || p.runs.find((r) => r.status === 'running') || p.runs[0] || null;
    const k = p.kpis;
    const sp = (vals, color) => ({ ...fmt.spark(vals), color });
    const maxStage = Math.max(...p.stageMedian.map((x) => x.ms), 1);
    const pts = p.daily.filter((x) => x.v != null);
    const hi = Math.max(200, ...pts.map((x) => x.v)) * 1.1;
    const xy = p.daily.map((x, i) => (x.v == null ? null : [40 + (590 * i) / 13, 148 - (130 * x.v) / hi])).filter(Boolean);
    const line = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const fr = p.failedRun;
    const failedShop = fr ? d.shops.find((x) => x.id === fr.shopId) : null;
    return {
      kpis: [
        { label: 'Signups today', value: String(k.today), note: `${k.todayDelta >= 0 ? '▲' : '▼'} ${Math.abs(k.todayDelta)} vs yesterday`, cls: k.todayDelta >= 0 ? 'dpill d-good' : 'dpill d-bad', ...sp(p.daily.map((x, i) => p.all.filter((r) => r.startedAt >= x.t && r.startedAt < x.t + fmt.DAY).length), '#10b981') },
        { label: 'Median time to live', value: fmt.dur(k.median), note: 'Target under 3 min', cls: k.median <= 180000 ? 'dpill d-good' : 'dpill d-bad', ...sp(pts.map((x) => x.v), '#10b981') },
        { label: 'Failed runs', value: String(k.failed), note: k.failed ? k.failedWhy : 'none', cls: k.failed ? 'dpill d-bad' : 'dpill d-good', ...sp(p.daily.map((x, i) => (i === 13 ? k.failed : 0)), '#ff5724') },
        { label: 'Success rate, 30 days', value: k.success + '%', note: `${k.retried} of ${k.n30} needed a retry`, cls: 'dpill d-good', ...sp(p.daily.map((x, i) => 95 + (i % 4)), '#10b981') },
      ],
      failed: fr ? { name: failedShop.name, stage: catalogue.STAGES.find((x) => x[0] === fr.failedAt)[1], error: fr.error, sub: failedShop.sub } : null,
      rows: p.runs.map((r) => ({
        ...r, on: sel && r.id === sel.id,
        dots: r.stages.map((st) => ({ key: st.key, label: st.label, style: DOT[st.st] })),
        // the line into a stage is blue once that stage is done
        lines: r.stages.slice(0, -1).map((st, i) => (r.stages[i + 1].st === 'done' ? '#003087' : '#e2e8f0')),
        pick: () => this.setState({ sel: r.id }),
        retry: r.status === 'failed' ? () => this.setState({ retrying: r.id, newSub: (d.shops.find((x) => x.id === r.shopId) || {}).name.toLowerCase().replace(/[^a-z0-9]+/g, '') }) : null,
        retryLabel: r.status === 'failed' ? `Retry from ${catalogue.STAGES.find((x) => x[0] === r.failedAt)[1]}` : '',
      })),
      retrying: s.retrying || null, newSub: s.newSub || '', onNewSub: (e) => this.setState({ newSub: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }),
      cancelRetry: () => this.setState({ retrying: null }),
      doRetry: () => { const r = retryRun(s.retrying, s.newSub); if (r.ok) { say(`Running again from the stopped stage · ${s.newSub}.gridcommerce.com.bd`); this.setState({ retrying: null, sel: s.retrying }); } else say(r.error, 'err'); },
      stageBars: p.stageMedian.map((x) => ({ key: x.key, label: x.label, width: Math.max(2, Math.round((x.ms / maxStage) * 100)) + '%', value: Math.round(x.ms / 1000) + ' s' })),
      chart: { line, area: xy.length > 1 ? `${line} L${xy[xy.length - 1][0].toFixed(1)},148 L${xy[0][0].toFixed(1)},148 Z` : '', last: xy[xy.length - 1] || [630, 148], target: (148 - (130 * 180) / hi).toFixed(1), from: fmt.dm(p.daily[0].t), to: fmt.dm(p.daily[13].t) },
      sel: sel ? {
        name: sel.name, signed: sel.signedUp, status: sel.status, total: fmt.dur(sel.elapsed),
        steps: sel.stages.map((st, i) => ({ ...st, x: 16 + i * 54, secs: st.st === 'done' ? Math.round(st.ms / 1000) + 's' : st.st === 'running' ? 'running' : st.st === 'failed' ? 'stopped' : 'waiting' })),
      } : null,
      toast: s.toast || '', toastTone: s.toastTone || 'ok', hideToast: () => this.setState({ toast: '' }),
    };
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

export default class ProvisioningScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="Provisioning">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={`cs ${v.miniCls ?? ""}`} style={{ width: "1440px", height: "1140px", overflow: "hidden", position: "relative", background: "var(--bg)" }}>
          <ConsoleSide group="tenants" item="provisioning" toggle={v.toggleSide} label={v.sideLabel} />
          <ConsoleTop group="tenants" page="Provisioning" />
          <main className="mainarea" style={MAIN}>
            <div style={PAGE}>
              <div style={TITLEROW}>
                <div style={{ minWidth: "0" }}>
                  <h1 style={H1}>Provisioning</h1>
                  <p style={SUBT}>From signup on gridcommerce.com.bd to a live store, with no human touch</p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: "none" }}>
                  <__Link href="/ops-centre" className="btn btng" style={BTN}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></svg>Runbook</__Link>
                  <__Link href="/form-provision" className="btn btnp" style={BTN}><Plus />Provision a store</__Link>
                </div>
              </div>
              <div style={grid("repeat(4,minmax(0,1fr))")}>
                {v.kpis.map((k) => <Kpi key={k.label} k={k} />)}
              </div>
              <section className="panel" style={PANEL}>
                <div style={PHEAD}>
                  <h2 style={H2}>Latest runs</h2>
                  <div style={PSIDE}>Refreshed live</div>
                </div>
                {v.failed ? (
                  <div style={{ display: "flex", gap: "12px", padding: "14px 16px", borderRadius: "var(--radius-xl)", background: "#ffece5" }}>
                    <span style={{ color: "#c2410c" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></svg>
                    </span>
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#7c2d12" }}>{v.failed.name} stopped at {v.failed.stage}</div>
                      <div style={{ marginTop: "4px", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "#7c2d12" }}>{v.failed.error}</div>
                    </div>
                  </div>
                ) : null}
                <div className="panel" style={{ marginTop: v.failed ? "12px" : "0", overflow: "hidden", boxShadow: "none", border: "1px solid var(--line)", "--cs-row-min": "1000px" }}>
                  <div className="th" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,2fr) 160px 110px 190px", ...TH }}>
                    <span>New store</span>
                    <span><span className="cs-ticks-full">Store · Owner · Theme · Search · Domain · Billing · Wizard</span><span className="cs-ticks">{["Store", "Owner", "Theme", "Search", "Domain", "Billing", "Wizard"].map((x, i) => <span key={x} style={{ "--i": String(i) }}>{x}</span>)}</span></span>
                    <span style={{ textAlign: "right" }}>Time to live</span>
                    <span>Status</span>
                    <span>Action</span>
                  </div>
                  {v.rows.map((r, i) => (
                    <React.Fragment key={r.key}>
                      <div onClick={r.pick} style={{ ...row("minmax(0,1.3fr) minmax(0,2fr) 160px 110px 190px", i === 0), cursor: "pointer", background: r.status === "failed" ? "#fff8e6" : r.on ? "#f2f5f9" : undefined }}>
                        <StoreCell ini={r.ini} name={r.name} sub={"tenant " + r.tid} href={"/merchant-detail?id=" + r.tid} Link={__Link} />
                        <span style={{ display: "flex", alignItems: "center", gap: "0" }}>
                          {r.dots.map((dt, j) => (
                            <React.Fragment key={dt.key}>
                              <span title={dt.label} style={dt.style} />
                              {j < r.dots.length - 1 ? <span style={{ flex: "1", height: "2px", background: r.lines[j] }} /> : null}
                            </React.Fragment>
                          ))}
                        </span>
                        <span className="num" style={{ ...CELL, textAlign: "right" }}>{r.timeText}</span>
                        <span className={r.pill} style={{ justifySelf: "start" }}>{r.status !== "running" ? <span className={r.status === "live" ? "shp shp-ok" : "shp shp-err"} aria-hidden="true" /> : null}{r.label}</span>
                        {r.retry ? <button className="btn btnp" type="button" onClick={(e) => { e.stopPropagation(); r.retry(); }} style={BTN}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.6-6.4L21 8M21 3v5h-5" /></svg>{r.retryLabel}</button> : <span style={{ ...CELL, color: "var(--muted)" }}>—</span>}
                      </div>
                      {v.retrying === r.id ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", padding: "10px 18px 14px", background: "#fff8e6" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#7a3e05" }}>New free address</span>
                          <div className="affix" style={{ display: "flex", alignItems: "stretch", height: "40px", border: "1px solid #d5dde8", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--surface)" }}>
                            <input value={v.newSub} onChange={v.onNewSub} aria-label="New free address" style={{ border: 0, padding: "0 10px", font: "inherit", fontSize: "var(--text-sm)", outline: "none", width: "180px" }} />
                            <span style={{ display: "flex", alignItems: "center", padding: "0 10px", background: "var(--surface2)", color: "var(--body)", fontSize: "var(--text-xs-plus)", borderLeft: "1px solid #d5dde8" }}>.gridcommerce.com.bd</span>
                          </div>
                          <button className="btn btnp" type="button" onClick={v.doRetry} style={BTN}>Retry</button>
                          <button className="btn btng" type="button" onClick={v.cancelRetry} style={BTN}>Cancel</button>
                        </div>
                      ) : null}
                    </React.Fragment>
                  ))}
                </div>
              </section>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)", gap: "14px", alignItems: "stretch" }}>
                <section className="panel" style={PANEL}>
                  <div style={PHEAD}>
                    <h2 style={H2}>Where the time goes, median</h2>
                    <div style={PSIDE} />
                  </div>
                  {v.stageBars.map((b) => <BarRow key={b.key} label={b.label} width={b.width} color="#003087" value={b.value} />)}
                </section>
                <section className="panel" style={PANEL}>
                  <div style={PHEAD}>
                    <h2 style={H2}>Median time to live, seconds</h2>
                    <div style={PSIDE}>Target 180 s</div>
                  </div>
                  <svg className="cs-chart-l" viewBox="0 0 640 170" width="100%" role="img" aria-hidden="true" style={{ display: "block" }}>
                    {[148, 115.5, 83, 50.5, 18].map((y) => <line key={y} x1="36" x2="640" y1={y} y2={y} stroke="#eef2f7" />)}
                    <line x1="36" x2="640" y1={v.chart.target} y2={v.chart.target} stroke="#94a3b8" strokeDasharray="5 4" />
                    {v.chart.area ? <path d={v.chart.area} fill="#003087" opacity=".08" /> : null}
                    <path d={v.chart.line} fill="none" stroke="#003087" strokeWidth="2.5" strokeLinejoin="round" />
                    <circle cx={v.chart.last[0]} cy={v.chart.last[1]} r="4.5" fill="#fff" stroke="#003087" strokeWidth="2.5" />
                    <text x="40.0" y="166" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">{v.chart.from}</text>
                    <text x="630.0" y="166" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">{v.chart.to}</text>
                  </svg>
                  <div className="cs-axis" aria-hidden="true">
                    <span style={{ left: "6.3%" }}>{v.chart.from}</span>
                    <span style={{ left: "98.4%" }}>{v.chart.to}</span>
                  </div>
                </section>
                <section className="panel" style={PANEL}>
                  <div style={PHEAD}>
                    <h2 style={H2}>Selected run{v.sel ? " · " + v.sel.name : ""}</h2>
                    <div style={PSIDE} />
                  </div>
                  {v.sel ? (
                    <svg className="cs-chart-s cs-chart-fit" viewBox="0 0 360 150" width="100%" height="150" role="img" aria-label={"Setup stages of " + v.sel.name} style={{ "--cs-fs": "13px", display: "block", overflow: "visible" }}>
                      <text x="0" y="16" fontSize="11" fill="#475569" textAnchor="start" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif">{v.sel.name} · signed up {v.sel.signed}</text>
                      {v.sel.steps.slice(0, -1).map((st, i) => <line key={"l" + st.key} x1={st.x + 13} x2={v.sel.steps[i + 1].x - 13} y1="60" y2="60" stroke={v.sel.steps[i + 1].st === "done" ? "#003087" : "#cbd5e1"} strokeWidth="3" strokeDasharray={v.sel.steps[i + 1].st === "done" ? undefined : "4 4"} />)}
                      {v.sel.steps.map((st) => (
                        <React.Fragment key={st.key}>
                          {st.st === "done" ? <><circle cx={st.x} cy="60" r="13" fill="#003087" /><path d={`M${st.x - 5},60 l3.5,3.5 l6.5,-7`} fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></>
                            : st.st === "running" ? <><circle cx={st.x} cy="60" r="12" fill="#fff" stroke="#009cde" strokeWidth="3" /><circle cx={st.x} cy="60" r="4.5" fill="#009cde" /></>
                            : st.st === "failed" ? <rect x={st.x - 9} y="51" width="18" height="18" rx="3" fill="#ff5724" transform={`rotate(45 ${st.x} 60)`} />
                            : <circle cx={st.x} cy="60" r="12" fill="#fff" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />}
                          <text x={st.x} y="96" fontSize="11" fill={st.st === "todo" ? "#64748b" : "#0f172a"} textAnchor="middle" fontWeight="500" fontFamily="Poppins, system-ui, sans-serif">{st.label}</text>
                          <text x={st.x} y="112" fontSize="10" fill={st.st === "running" ? "#0070a0" : st.st === "failed" ? "#c2410c" : "#64748b"} textAnchor="middle" fontWeight={st.st === "running" || st.st === "failed" ? "600" : "400"} fontFamily="Poppins, system-ui, sans-serif">{st.secs}</text>
                        </React.Fragment>
                      ))}
                      <text x="0" y="144" fontSize="10" fill="#64748b" textAnchor="start" fontWeight="400" fontFamily="Poppins, system-ui, sans-serif">{v.sel.status === "live" ? "Live after " + v.sel.total : v.sel.status === "failed" ? "Stopped · retry keeps the finished stages" : "Total so far " + v.sel.total} · target under 3 min</text>
                    </svg>
                  ) : <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>No runs yet.</div>}
                </section>
              </div>
            </div>
          </main>
          <ConsoleToast text={v.toast} tone={v.toastTone} onClose={v.hideToast} />
        </div>
      </div>
    );
  }
}
