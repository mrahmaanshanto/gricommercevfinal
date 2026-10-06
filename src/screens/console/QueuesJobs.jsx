'use client';
// Generated from design/templates/console/QueuesJobs.dc.html by scripts/convert-design.mjs.
// Operations · Queues and jobs
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { ConsoleSide, ConsoleTop } from './ConsoleFrame';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  renderVals() {
    const v = this.renderVals0() || {};
    const mini = !!(this.state || {}).mini;
    v.miniCls = mini ? 'mini' : '';
    v.toggleSide = () => this.setState({ mini: !mini });
    v.sideLabel = mini ? 'Expand menu' : 'Collapse menu';
    return v;
  }

  renderVals0() {
    return {};
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

export default class QueuesJobsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="QueuesJobs">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={`cs ${v.miniCls ?? ""}`} style={{ width: "1440px", height: "1280px", overflow: "hidden", position: "relative", background: "var(--bg)" }}>
          <ConsoleSide group="operations" item="queues" toggle={v.toggleSide} label={v.sideLabel} />
          <ConsoleTop group="operations" page="Queues and jobs" />
          <main className="mainarea" style={{ position: "absolute", left: "272px", right: "0", top: "64px", bottom: "0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: "16px", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px" }}>
                <div style={{ minWidth: "0" }}>
                  <h1 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }}>Queues and jobs</h1>
                  <p style={{ margin: "5px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>Depth, workers, lag and dead letters for every background queue</p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: "none" }}>
                  <button className="btn btng" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect x="2" y="3" width="20" height="8" rx="2" />
  <rect x="2" y="13" width="20" height="8" rx="2" />
  <path d="M6 7h.01M6 17h.01" />
</svg>Worker settings</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: "12px" }}>
                <div className="kpi">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span className="kl" title="Jobs a minute">Jobs a minute</span>
                    <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                      <path d="M0.0,3.0 L4.3,6.4 L8.5,7.4 L12.8,5.5 L17.1,4.0 L21.3,4.6 L25.6,7.7 L29.9,4.9 L34.1,8.4 L38.4,8.5 L42.7,8.0 L46.9,10.7 L51.2,12.6 L55.5,15.6 L59.7,19.0 L64.0,14.8 L64,22 L0,22 Z" fill="#6683b7" opacity=".10" />
                      <path d="M0.0,3.0 L4.3,6.4 L8.5,7.4 L12.8,5.5 L17.1,4.0 L21.3,4.6 L25.6,7.7 L29.9,4.9 L34.1,8.4 L38.4,8.5 L42.7,8.0 L46.9,10.7 L51.2,12.6 L55.5,15.6 L59.7,19.0 L64.0,14.8" fill="none" stroke="#6683b7" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="3,420">3,420</span>
                  <div />
                </div>
                <div className="kpi">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span className="kl" title="Waiting">Waiting</span>
                    <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                      <path d="M0.0,19.0 L4.3,17.0 L8.5,17.7 L12.8,16.2 L17.1,16.9 L21.3,16.4 L25.6,15.8 L29.9,13.8 L34.1,11.9 L38.4,10.9 L42.7,9.0 L46.9,7.5 L51.2,7.6 L55.5,6.1 L59.7,4.9 L64.0,3.0 L64,22 L0,22 Z" fill="#ff5724" opacity=".10" />
                      <path d="M0.0,19.0 L4.3,17.0 L8.5,17.7 L12.8,16.2 L17.1,16.9 L21.3,16.4 L25.6,15.8 L29.9,13.8 L34.1,11.9 L38.4,10.9 L42.7,9.0 L46.9,7.5 L51.2,7.6 L55.5,6.1 L59.7,4.9 L64.0,3.0" fill="none" stroke="#ff5724" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="1,553">1,553</span>
                  <div>
                    <span className="dpill d-bad">▲ courier</span>
                  </div>
                </div>
                <div className="kpi">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span className="kl" title="Workers">Workers</span>
                    <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                      <path d="M0.0,7.4 L4.3,14.9 L8.5,19.0 L12.8,12.0 L17.1,11.9 L21.3,16.3 L25.6,15.9 L29.9,15.9 L34.1,13.5 L38.4,9.8 L42.7,6.0 L46.9,7.2 L51.2,7.9 L55.5,11.1 L59.7,3.0 L64.0,4.7 L64,22 L0,22 Z" fill="#6683b7" opacity=".10" />
                      <path d="M0.0,7.4 L4.3,14.9 L8.5,19.0 L12.8,12.0 L17.1,11.9 L21.3,16.3 L25.6,15.9 L29.9,15.9 L34.1,13.5 L38.4,9.8 L42.7,6.0 L46.9,7.2 L51.2,7.9 L55.5,11.1 L59.7,3.0 L64.0,4.7" fill="none" stroke="#6683b7" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="20">20</span>
                  <div>
                    <span className="dpill d-flat">auto-scaling on</span>
                  </div>
                </div>
                <div className="kpi">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span className="kl" title="Failed, 1 hour">Failed, 1 hour</span>
                    <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                      <path d="M0.0,18.3 L4.3,19.0 L8.5,18.9 L12.8,18.9 L17.1,17.9 L21.3,17.7 L25.6,17.7 L29.9,15.6 L34.1,13.2 L38.4,10.4 L42.7,10.9 L46.9,9.8 L51.2,6.9 L55.5,5.9 L59.7,3.0 L64.0,3.2 L64,22 L0,22 Z" fill="#10b981" opacity=".10" />
                      <path d="M0.0,18.3 L4.3,19.0 L8.5,18.9 L12.8,18.9 L17.1,17.9 L21.3,17.7 L25.6,17.7 L29.9,15.6 L34.1,13.2 L38.4,10.4 L42.7,10.9 L46.9,9.8 L51.2,6.9 L55.5,5.9 L59.7,3.0 L64.0,3.2" fill="none" stroke="#10b981" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="16">16</span>
                  <div>
                    <span className="dpill d-good">0.08%</span>
                  </div>
                </div>
                <div className="kpi">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span className="kl" title="Dead letters">Dead letters</span>
                    <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                      <path d="M0.0,19.0 L4.3,19.0 L8.5,16.8 L12.8,16.6 L17.1,15.6 L21.3,14.0 L25.6,14.6 L29.9,13.1 L34.1,10.6 L38.4,9.4 L42.7,7.5 L46.9,6.7 L51.2,6.3 L55.5,6.3 L59.7,3.5 L64.0,3.0 L64,22 L0,22 Z" fill="#ff5724" opacity=".10" />
                      <path d="M0.0,19.0 L4.3,19.0 L8.5,16.8 L12.8,16.6 L17.1,15.6 L21.3,14.0 L25.6,14.6 L29.9,13.1 L34.1,10.6 L38.4,9.4 L42.7,7.5 L46.9,6.7 L51.2,6.3 L55.5,6.3 L59.7,3.5 L64.0,3.0" fill="none" stroke="#ff5724" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="3">3</span>
                  <div>
                    <span className="dpill d-bad">need a person</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: "14px", alignItems: "stretch" }}>
                <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                    <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Courier queue, last 2 hours</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }}>jobs waiting</div>
                  </div>
                  <svg className="cs-chart-l" viewBox="0 0 700 170" width="100%" role="img" aria-hidden="true" style={{ display: "block" }}>
                    <line x1="36" x2="700" y1="148.0" y2="148.0" stroke="#eef2f7" />
                    <line x1="36" x2="700" y1="115.5" y2="115.5" stroke="#eef2f7" />
                    <line x1="36" x2="700" y1="83.0" y2="83.0" stroke="#eef2f7" />
                    <line x1="36" x2="700" y1="50.5" y2="50.5" stroke="#eef2f7" />
                    <line x1="36" x2="700" y1="18.0" y2="18.0" stroke="#eef2f7" />
                    <path d="M40.0,144.6 L105.0,144.7 L170.0,143.5 L235.0,142.9 L300.0,137.7 L365.0,106.9 L430.0,70.1 L495.0,41.8 L560.0,29.8 L625.0,35.8 L690.0,38.0 L690.0,148 L40.0,148 Z" fill="#ff9800" opacity=".08" />
                    <path d="M40.0,144.6 L105.0,144.7 L170.0,143.5 L235.0,142.9 L300.0,137.7 L365.0,106.9 L430.0,70.1 L495.0,41.8 L560.0,29.8 L625.0,35.8 L690.0,38.0" fill="none" stroke="#ff9800" strokeWidth="2.5" strokeLinejoin="round" />
                    <circle cx="690.0" cy="38.0" r="4.5" fill="#fff" stroke="#ff9800" strokeWidth="2.5" />
                    <text x="40.0" y="166" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">12:30</text>
                    <text x="365.0" y="166" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">13:30</text>
                    <text x="690.0" y="166" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">14:30</text>
                  </svg>
                  <div className="cs-axis" aria-hidden="true">
                    <span style={{ left: "5.7%" }}>12:30</span>
                    <span style={{ left: "52.1%" }}>13:30</span>
                    <span style={{ left: "98.6%" }}>14:30</span>
                  </div>
                </section>
                <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                    <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Throughput by queue</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "90px minmax(0,1fr) 64px", alignItems: "center", gap: "10px", minHeight: "30px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>courier</span>
                    <span style={{ height: "10px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                      <span style={{ display: "block", width: "100%", height: "100%", borderRadius: "var(--radius-sm)", background: "#ff9800" }} />
                    </span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>1120/min</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "90px minmax(0,1fr) 64px", alignItems: "center", gap: "10px", minHeight: "30px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>webhooks</span>
                    <span style={{ height: "10px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                      <span style={{ display: "block", width: "88%", height: "100%", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                    </span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>980/min</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "90px minmax(0,1fr) 64px", alignItems: "center", gap: "10px", minHeight: "30px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>sms</span>
                    <span style={{ height: "10px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                      <span style={{ display: "block", width: "57%", height: "100%", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                    </span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>640/min</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "90px minmax(0,1fr) 64px", alignItems: "center", gap: "10px", minHeight: "30px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>default</span>
                    <span style={{ height: "10px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                      <span style={{ display: "block", width: "38%", height: "100%", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                    </span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>420/min</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "90px minmax(0,1fr) 64px", alignItems: "center", gap: "10px", minHeight: "30px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>imports</span>
                    <span style={{ height: "10px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                      <span style={{ display: "block", width: "14%", height: "100%", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                    </span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>160/min</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "90px minmax(0,1fr) 64px", alignItems: "center", gap: "10px", minHeight: "30px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>reports</span>
                    <span style={{ height: "10px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                      <span style={{ display: "block", width: "9%", height: "100%", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                    </span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>100/min</span>
                  </div>
                </section>
              </div>
              <div className="panel" style={{ overflow: "hidden" }}>
                <div className="th" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 90px 80px 110px 80px 120px 120px", gap: "12px", padding: "10px 18px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>
                  <span>Queue</span>
                  <span style={{ textAlign: "right" }}>Waiting</span>
                  <span style={{ textAlign: "right" }}>Workers</span>
                  <span style={{ textAlign: "right" }}>Oldest job</span>
                  <span style={{ textAlign: "right" }}>Failed 1 h</span>
                  <span>State</span>
                  <span style={{ textAlign: "right" }}>Actions</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 90px 80px 110px 80px 120px 120px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", background: "#fff8e6" }}>
                  <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>courier</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>1,284</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>6</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>4 min 10 s</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>12</span>
                  <span className="pill p-warn" style={{ justifySelf: "start" }}><span className="shp shp-warn" aria-hidden="true" />Backed up</span>
                  <span style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button className="tb" type="button" aria-label="Pause queue">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7 4h3v16H7zM14 4h3v16h-3z" />
                      </svg>
                    </button>
                    <button className="btn btng" type="button" style={{ minHeight: "32px", padding: "0 10px", fontSize: "var(--text-xs)" }}>Scale</button>
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 90px 80px 110px 80px 120px 120px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                  <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>webhooks</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>212</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>4</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>18 s</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>3</span>
                  <span className="pill p-ok" style={{ justifySelf: "start" }}><span className="shp shp-ok" aria-hidden="true" />Normal</span>
                  <span style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button className="tb" type="button" aria-label="Pause queue">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7 4h3v16H7zM14 4h3v16h-3z" />
                      </svg>
                    </button>
                    <button className="btn btng" type="button" style={{ minHeight: "32px", padding: "0 10px", fontSize: "var(--text-xs)" }}>Scale</button>
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 90px 80px 110px 80px 120px 120px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                  <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>sms</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>38</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>2</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>2 s</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>0</span>
                  <span className="pill p-ok" style={{ justifySelf: "start" }}><span className="shp shp-ok" aria-hidden="true" />Normal</span>
                  <span style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button className="tb" type="button" aria-label="Pause queue">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7 4h3v16H7zM14 4h3v16h-3z" />
                      </svg>
                    </button>
                    <button className="btn btng" type="button" style={{ minHeight: "32px", padding: "0 10px", fontSize: "var(--text-xs)" }}>Scale</button>
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 90px 80px 110px 80px 120px 120px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                  <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>imports</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>3</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>2</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>1 min 40 s</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>1</span>
                  <span className="pill p-ok" style={{ justifySelf: "start" }}><span className="shp shp-ok" aria-hidden="true" />Normal</span>
                  <span style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button className="tb" type="button" aria-label="Pause queue">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7 4h3v16H7zM14 4h3v16h-3z" />
                      </svg>
                    </button>
                    <button className="btn btng" type="button" style={{ minHeight: "32px", padding: "0 10px", fontSize: "var(--text-xs)" }}>Scale</button>
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 90px 80px 110px 80px 120px 120px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                  <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>reports</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>4</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>1</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>12 s</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>0</span>
                  <span className="pill p-ok" style={{ justifySelf: "start" }}><span className="shp shp-ok" aria-hidden="true" />Normal</span>
                  <span style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button className="tb" type="button" aria-label="Pause queue">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7 4h3v16H7zM14 4h3v16h-3z" />
                      </svg>
                    </button>
                    <button className="btn btng" type="button" style={{ minHeight: "32px", padding: "0 10px", fontSize: "var(--text-xs)" }}>Scale</button>
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 90px 80px 110px 80px 120px 120px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                  <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>search-index</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>0</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>2</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>0 s</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>0</span>
                  <span className="pill p-ok" style={{ justifySelf: "start" }}><span className="shp shp-ok" aria-hidden="true" />Normal</span>
                  <span style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button className="tb" type="button" aria-label="Pause queue">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7 4h3v16H7zM14 4h3v16h-3z" />
                      </svg>
                    </button>
                    <button className="btn btng" type="button" style={{ minHeight: "32px", padding: "0 10px", fontSize: "var(--text-xs)" }}>Scale</button>
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 90px 80px 110px 80px 120px 120px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                  <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>default</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>12</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>3</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>1 s</span>
                  <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>0</span>
                  <span className="pill p-ok" style={{ justifySelf: "start" }}><span className="shp shp-ok" aria-hidden="true" />Normal</span>
                  <span style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button className="tb" type="button" aria-label="Pause queue">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7 4h3v16H7zM14 4h3v16h-3z" />
                      </svg>
                    </button>
                    <button className="btn btng" type="button" style={{ minHeight: "32px", padding: "0 10px", fontSize: "var(--text-xs)" }}>Scale</button>
                  </span>
                </div>
              </div>
              <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                  <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Dead letters</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }}>kept 14 days</div>
                </div>
                <div className="cs-tnw" style={{ margin: "0 -20px -16px", "--cs-row-min": "820px" }}>
                  <div className="th" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1.4fr) 60px 170px", gap: "12px", padding: "10px 18px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>
                    <span>Job</span>
                    <span>Store</span>
                    <span>Last error</span>
                    <span style={{ textAlign: "right" }}>Age</span>
                    <span style={{ textAlign: "right" }}>Actions</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1.4fr) 60px 170px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px" }}>
                    <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>courier.book-parcel</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Mehedi Traders</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Steadfast API key invalid</span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>3 h</span>
                    <span style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button className="btn btng" type="button" style={{ minHeight: "32px", padding: "0 10px", fontSize: "var(--text-xs)" }}>Retry</button>
                      <button className="btn btng" type="button" style={{ minHeight: "32px", padding: "0 10px", fontSize: "var(--text-xs)" }}>Discard</button>
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1.4fr) 60px 170px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                    <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>import.products</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Mohona Traders</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Row 412: price is not a number</span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>5 h</span>
                    <span style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button className="btn btng" type="button" style={{ minHeight: "32px", padding: "0 10px", fontSize: "var(--text-xs)" }}>Retry</button>
                      <button className="btn btng" type="button" style={{ minHeight: "32px", padding: "0 10px", fontSize: "var(--text-xs)" }}>Discard</button>
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1.4fr) 60px 170px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                    <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>webhook.outbound</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Kolpo Books</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>URL returns 404</span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>1 d</span>
                    <span style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button className="btn btng" type="button" style={{ minHeight: "32px", padding: "0 10px", fontSize: "var(--text-xs)" }}>Retry</button>
                      <button className="btn btng" type="button" style={{ minHeight: "32px", padding: "0 10px", fontSize: "var(--text-xs)" }}>Discard</button>
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
