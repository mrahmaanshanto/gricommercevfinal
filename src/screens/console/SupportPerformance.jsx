'use client';
// Generated from design/templates/console/SupportPerformance.dc.html by scripts/convert-design.mjs.
// Support · performance
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

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

export default class SupportPerformanceScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="SupportPerformance">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={`cs ${v.miniCls ?? ""}`} style={{ width: "1440px", height: "1180px", overflow: "hidden", position: "relative", background: "var(--bg)" }}>
          <aside className="side" aria-label="Console navigation">
            <div className="sidein">
              <div className="sidehead" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "18px 12px 6px 20px" }}>
                <span className="logo-full">
                  <img src="/assets/62dadbbb3f365aebdd41bb9975f5931f.png" alt="GridCommerce" style={{ height: "28px", width: "auto", display: "block" }} />
                </span>
                <img className="logo-mini" src="/assets/9b6f9ad369f1cbde65271a968e6ba1f1.png" alt="GridCommerce" style={{ height: "32px", width: "auto" }} />
                <button className="tb sidetoggle" type="button" onClick={v.toggleSide} aria-label={v.sideLabel} title={v.sideLabel}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <path d="M9 3v18" />
                  </svg>
                </button>
              </div>
              <div className="sidemeta" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 20px 12px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: "22px", padding: "0 8px", borderRadius: "var(--radius-md)", background: "var(--iconbg)", color: "var(--iconfg)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" }}>Console</span>
                <span className="ell" style={{ fontSize: "var(--text-xs)", color: "var(--sidemuted)" }}>Staff only · views logged</span>
              </div>
              <nav aria-label="Console" className="sidenav">
                <__Link href="/console-shell" className="nav top" title="Overview">
                  <span className="navic">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
                    </svg>
                  </span>
                  <span className="navtxt">Overview</span>
                </__Link>
                <div className="navlabel" style={{ margin: "10px 10px 6px", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--sidemuted)" }}>Manage</div>
                <__Link href="/merchants" className="nav grp" title="Tenants" aria-expanded="false">
                  <span className="navic">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 9 4.5 4h15L21 9" />
                      <path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9Z" />
                      <path d="M5 12v9h14v-9" />
                    </svg>
                  </span>
                  <span className="navtxt">Tenants</span>
                  <span className="chev">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>
                </__Link>
                <__Link href="/module-catalogue" className="nav grp" title="Packaging" aria-expanded="false">
                  <span className="navic">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" />
                      <path d="m3 7 9 5 9-5M12 12v10" />
                    </svg>
                  </span>
                  <span className="navtxt">Packaging</span>
                  <span className="chev">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>
                </__Link>
                <__Link href="/subscriptions" className="nav grp" title="Billing" aria-expanded="false">
                  <span className="navic">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20M6 15h4" />
                    </svg>
                  </span>
                  <span className="navtxt">Billing</span>
                  <span className="badge warn">4</span>
                  <span className="chev" style={{ marginLeft: "8px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>
                </__Link>
                <__Link href="/health-risk" className="nav grp" title="Monitoring" aria-expanded="false">
                  <span className="navic">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 12h4l3-8 4 16 3-8h4" />
                    </svg>
                  </span>
                  <span className="navtxt">Monitoring</span>
                  <span className="badge warn">5</span>
                  <span className="chev" style={{ marginLeft: "8px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>
                </__Link>
                <__Link href="/support-desk" className="nav grp open" title="Support" aria-expanded="true">
                  <span className="navic">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
                      <path d="M21 14v3a2 2 0 0 1-2 2h-2v-7h4M3 14v3a2 2 0 0 0 2 2h2v-7H3" />
                    </svg>
                  </span>
                  <span className="navtxt">Support</span>
                  <span className="chev open">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>
                </__Link>
                <div className="kids">
                  <__Link href="/support-desk" className="nav sub">
                    <span className="navtxt">Tickets</span>
                    <span className="badge ">12</span>
                  </__Link>
                  <__Link href="/store-access" className="nav sub">
                    <span className="navtxt">Store access · PIN</span>
                  </__Link>
                  <__Link href="/access-log" className="nav sub">
                    <span className="navtxt">Access log</span>
                  </__Link>
                  <__Link href="/support-performance" className="nav sub on" aria-current="page">
                    <span className="navtxt">Performance</span>
                  </__Link>
                </div>
                <__Link href="/leads" className="nav grp" title="Sales CRM" aria-expanded="false">
                  <span className="navic">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
                    </svg>
                  </span>
                  <span className="navtxt">Sales CRM</span>
                  <span className="badge ">18</span>
                  <span className="chev" style={{ marginLeft: "8px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>
                </__Link>
                <__Link href="/ops-centre" className="nav grp" title="Operations" aria-expanded="false">
                  <span className="navic">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
                    </svg>
                  </span>
                  <span className="navtxt">Operations</span>
                  <span className="badge err">2</span>
                  <span className="chev" style={{ marginLeft: "8px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>
                </__Link>
                <__Link href="/releases" className="nav grp" title="System" aria-expanded="false">
                  <span className="navic">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="4" y="11" width="16" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                  </span>
                  <span className="navtxt">System</span>
                  <span className="chev">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>
                </__Link>
              </nav>
              <__Link href="/ops-centre" className="statuscard" title="1 open incident" style={{ display: "block", color: "inherit", textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ flex: "none", width: "10px", height: "10px", borderRadius: "var(--radius-full)", background: "#ff9800", boxShadow: "0 0 0 3px rgba(255,152,0,.2)" }} />
                  <span className="statustxt" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--sideink)" }}>1 open incident</span>
                  <span className="num statustxt" style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--sidemuted)" }}>99.96%</span>
                </div>
                <div className="statustxt ell" style={{ marginTop: "4px", fontSize: "var(--text-xs)", color: "var(--sidebody)" }}>Steadfast webhooks delayed · 38 stores</div>
              </__Link>
              <div className="me">
                <span style={{ position: "relative", display: "inline-flex", flex: "none" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "var(--radius-xl)", background: "linear-gradient(145deg,#2eaee4,#003087)", color: "#fff", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)" }}>FA</span>
                  <span style={{ position: "absolute", right: "-2px", bottom: "-2px", width: "11px", height: "11px", borderRadius: "var(--radius-full)", background: "#10b981", border: "2px solid var(--side)" }} />
                </span>
                <div className="metxt" style={{ minWidth: "0" }}>
                  <div className="ell" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--sideink)" }}>Farhana Akter</div>
                  <div className="ell" style={{ fontSize: "var(--text-xs)", color: "var(--sidemuted)" }}>Support lead · 2FA on</div>
                </div>
                <__Link href="/staff-roles" className="tb mebtn" aria-label="Account and roles" style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--sidemuted)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21a8 8 0 0 1 16 0" />
                  </svg>
                </__Link>
              </div>
            </div>
          </aside>
          <header className="topbar">
            <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs-plus)", minWidth: "230px" }}>
              <span className="crumbic">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
                  <path d="M21 14v3a2 2 0 0 1-2 2h-2v-7h4M3 14v3a2 2 0 0 0 2 2h2v-7H3" />
                </svg>
              </span>
              <span style={{ color: "var(--muted)" }}>Support</span>
              <span style={{ color: "var(--muted)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </span>
              <span style={{ fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Performance</span>
            </nav>
            <button className="searchbtn" type="button"><span style={{ display: "inline-flex" }}>
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
</span>Search stores, phones, invoices, leads<span className="kbd">Ctrl K</span></button>
            {" "}
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "8px", height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "var(--okbg)", color: "var(--okt)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}><span style={{ width: "7px", height: "7px", borderRadius: "var(--radius-lg)", background: "#10b981", boxShadow: "0 0 0 3px rgba(16,185,129,.18)" }} />Production</span>
            {" "}
            <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)", padding: "0 4px" }}>Sun 20 Sep · 14:32</span>
            {" "}
            <span style={{ width: "1px", height: "24px", background: "var(--line)" }} />
            {" "}
            <button className="tb" type="button" aria-label="Notifications, 3 unread" style={{ position: "relative" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10 21h4" />
              </svg>
              <span style={{ position: "absolute", top: "8px", right: "9px", width: "8px", height: "8px", borderRadius: "var(--radius-lg)", background: "#ff5724", border: "2px solid var(--surface)" }} />
            </button>
            {" "}
            <button className="tb" type="button" aria-label="Help and runbooks">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" />
              </svg>
            </button>
          </header>
          <main className="mainarea" style={{ position: "absolute", left: "272px", right: "0", top: "64px", bottom: "0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px" }}>
                <div style={{ minWidth: "0" }}>
                  <h1 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }}>Support performance</h1>
                  <p style={{ margin: "5px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>21 Aug to 19 Sep 2026 · 612 tickets · Dhaka working hours 09:00 to 22:00</p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: "none" }}>
                  <div className="seg" role="group" aria-label="Period">
                    <button className="segb" type="button">7 days</button>
                    <button className="segb on" type="button" aria-pressed="true">30 days</button>
                    <button className="segb" type="button">90 days</button>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: "12px" }}>
                <div className="kpi">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span className="kl" title="Open now">Open now</span>
                    <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                      <path d="M0.0,18.9 L4.3,19.0 L8.5,17.4 L12.8,15.9 L17.1,16.0 L21.3,14.0 L25.6,12.1 L29.9,11.4 L34.1,10.7 L38.4,8.0 L42.7,8.7 L46.9,6.4 L51.2,6.9 L55.5,3.8 L59.7,4.6 L64.0,3.0 L64,22 L0,22 Z" fill="#10b981" opacity=".10" />
                      <path d="M0.0,18.9 L4.3,19.0 L8.5,17.4 L12.8,15.9 L17.1,16.0 L21.3,14.0 L25.6,12.1 L29.9,11.4 L34.1,10.7 L38.4,8.0 L42.7,8.7 L46.9,6.4 L51.2,6.9 L55.5,3.8 L59.7,4.6 L64.0,3.0" fill="none" stroke="#10b981" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="38">38</span>
                  <div>
                    <span className="dpill d-good">▼ 6 vs last week</span>
                  </div>
                </div>
                <div className="kpi">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span className="kl" title="First reply, median">First reply, median</span>
                    <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                      <path d="M0.0,19.0 L4.3,17.5 L8.5,17.8 L12.8,15.5 L17.1,14.4 L21.3,14.0 L25.6,14.7 L29.9,13.6 L34.1,11.3 L38.4,12.1 L42.7,10.6 L46.9,10.7 L51.2,8.3 L55.5,5.7 L59.7,3.6 L64.0,3.0 L64,22 L0,22 Z" fill="#10b981" opacity=".10" />
                      <path d="M0.0,19.0 L4.3,17.5 L8.5,17.8 L12.8,15.5 L17.1,14.4 L21.3,14.0 L25.6,14.7 L29.9,13.6 L34.1,11.3 L38.4,12.1 L42.7,10.6 L46.9,10.7 L51.2,8.3 L55.5,5.7 L59.7,3.6 L64.0,3.0" fill="none" stroke="#10b981" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="14 min">14 min</span>
                  <div>
                    <span className="dpill d-good">Target 30 min</span>
                  </div>
                </div>
                <div className="kpi">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span className="kl" title="Resolution, median">Resolution, median</span>
                    <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                      <path d="M0.0,18.6 L4.3,19.0 L8.5,17.0 L12.8,17.4 L17.1,14.1 L21.3,15.3 L25.6,16.0 L29.9,12.8 L34.1,14.1 L38.4,11.1 L42.7,9.2 L46.9,7.6 L51.2,6.6 L55.5,6.2 L59.7,6.0 L64.0,3.0 L64,22 L0,22 Z" fill="#ff5724" opacity=".10" />
                      <path d="M0.0,18.6 L4.3,19.0 L8.5,17.0 L12.8,17.4 L17.1,14.1 L21.3,15.3 L25.6,16.0 L29.9,12.8 L34.1,14.1 L38.4,11.1 L42.7,9.2 L46.9,7.6 L51.2,6.6 L55.5,6.2 L59.7,6.0 L64.0,3.0" fill="none" stroke="#ff5724" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="5.2 h">5.2 h</span>
                  <div>
                    <span className="dpill d-bad">▲ 0.8 h vs August</span>
                  </div>
                </div>
                <div className="kpi">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span className="kl" title="Satisfaction">Satisfaction</span>
                    <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                      <path d="M0.0,19.0 L4.3,15.4 L8.5,13.9 L12.8,13.4 L17.1,13.8 L21.3,10.5 L25.6,11.3 L29.9,10.5 L34.1,9.3 L38.4,9.6 L42.7,9.3 L46.9,8.6 L51.2,7.0 L55.5,4.5 L59.7,3.0 L64.0,3.9 L64,22 L0,22 Z" fill="#10b981" opacity=".10" />
                      <path d="M0.0,19.0 L4.3,15.4 L8.5,13.9 L12.8,13.4 L17.1,13.8 L21.3,10.5 L25.6,11.3 L29.9,10.5 L34.1,9.3 L38.4,9.6 L42.7,9.3 L46.9,8.6 L51.2,7.0 L55.5,4.5 L59.7,3.0 L64.0,3.9" fill="none" stroke="#10b981" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="4.6 / 5">4.6 / 5</span>
                  <div>
                    <span className="dpill d-good">92% rated 4 or 5</span>
                  </div>
                </div>
                <div className="kpi">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span className="kl" title="SLA met">SLA met</span>
                    <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                      <path d="M0.0,18.2 L4.3,19.0 L8.5,17.5 L12.8,18.3 L17.1,16.2 L21.3,16.0 L25.6,14.4 L29.9,12.0 L34.1,12.0 L38.4,10.2 L42.7,7.5 L46.9,4.8 L51.2,3.0 L55.5,3.7 L59.7,3.1 L64.0,4.2 L64,22 L0,22 Z" fill="#10b981" opacity=".10" />
                      <path d="M0.0,18.2 L4.3,19.0 L8.5,17.5 L12.8,18.3 L17.1,16.2 L21.3,16.0 L25.6,14.4 L29.9,12.0 L34.1,12.0 L38.4,10.2 L42.7,7.5 L46.9,4.8 L51.2,3.0 L55.5,3.7 L59.7,3.1 L64.0,4.2" fill="none" stroke="#10b981" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="94%">94%</span>
                  <div>
                    <span className="dpill d-good">▲ 3 points</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)", gap: "16px" }}>
                <section className="panel" style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "var(--ink)" }}>Tickets per day, by channel</h2>
                    <div style={{ display: "flex", gap: "14px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--body)" }}><span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#003087" }} />In-app</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--body)" }}><span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#009cde" }} />WhatsApp</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--body)" }}><span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#99d7f2" }} />Email</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--body)" }}><span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#94a3b8" }} />Phone</span>
                    </div>
                  </div>
                  <svg className="cs-chart-l cs-chart-fit" viewBox="0 0 680 214" width="100%" height="214" role="img" aria-label="Tickets per day by channel, last 30 days">
                    <line x1="36" x2="670" y1="190" y2="190" stroke="#eef2f7" />
                    <text x="30" y="194" fontSize="11" fill="#64748b" textAnchor="end" fontFamily="Poppins">0</text>
                    <line x1="36" x2="670" y1="138" y2="138" stroke="#eef2f7" />
                    <text x="30" y="142" fontSize="11" fill="#64748b" textAnchor="end" fontFamily="Poppins">10</text>
                    <line x1="36" x2="670" y1="86" y2="86" stroke="#eef2f7" />
                    <text x="30" y="90" fontSize="11" fill="#64748b" textAnchor="end" fontFamily="Poppins">20</text>
                    <line x1="36" x2="670" y1="34" y2="34" stroke="#eef2f7" />
                    <text x="30" y="38" fontSize="11" fill="#64748b" textAnchor="end" fontFamily="Poppins">30</text>
                    <rect x="40" y="158.8" width="15" height="31.2" fill="#003087" />
                    <rect x="40" y="122.4" width="15" height="36.4" fill="#009cde" />
                    <rect x="40" y="101.6" width="15" height="20.8" fill="#99d7f2" />
                    <rect x="40" y="91.2" width="15" height="10.4" fill="#94a3b8" />
                    <rect x="61" y="148.4" width="15" height="41.6" fill="#003087" />
                    <rect x="61" y="96.4" width="15" height="52.0" fill="#009cde" />
                    <rect x="61" y="86.0" width="15" height="10.4" fill="#99d7f2" />
                    <rect x="61" y="70.4" width="15" height="15.6" fill="#94a3b8" />
                    <rect x="82" y="132.8" width="15" height="57.2" fill="#003087" />
                    <rect x="82" y="91.2" width="15" height="41.6" fill="#009cde" />
                    <rect x="82" y="80.8" width="15" height="10.4" fill="#99d7f2" />
                    <rect x="82" y="75.6" width="15" height="5.2" fill="#94a3b8" />
                    <rect x="103" y="132.8" width="15" height="57.2" fill="#003087" />
                    <rect x="103" y="112.0" width="15" height="20.8" fill="#009cde" />
                    <rect x="103" y="106.8" width="15" height="5.2" fill="#99d7f2" />
                    <rect x="103" y="96.4" width="15" height="10.4" fill="#94a3b8" />
                    <rect x="124" y="169.2" width="15" height="20.8" fill="#003087" />
                    <rect x="124" y="153.6" width="15" height="15.6" fill="#009cde" />
                    <rect x="124" y="148.4" width="15" height="5.2" fill="#99d7f2" />
                    <rect x="124" y="143.2" width="15" height="5.2" fill="#94a3b8" />
                    <rect x="145" y="132.8" width="15" height="57.2" fill="#003087" />
                    <rect x="145" y="80.8" width="15" height="52.0" fill="#009cde" />
                    <rect x="145" y="70.4" width="15" height="10.4" fill="#99d7f2" />
                    <rect x="145" y="65.2" width="15" height="5.2" fill="#94a3b8" />
                    <rect x="166" y="138.0" width="15" height="52.0" fill="#003087" />
                    <rect x="166" y="117.2" width="15" height="20.8" fill="#009cde" />
                    <rect x="166" y="96.4" width="15" height="20.8" fill="#99d7f2" />
                    <rect x="166" y="80.8" width="15" height="15.6" fill="#94a3b8" />
                    <rect x="187" y="143.2" width="15" height="46.8" fill="#003087" />
                    <rect x="187" y="106.8" width="15" height="36.4" fill="#009cde" />
                    <rect x="187" y="101.6" width="15" height="5.2" fill="#99d7f2" />
                    <rect x="187" y="91.2" width="15" height="10.4" fill="#94a3b8" />
                    <rect x="208" y="143.2" width="15" height="46.8" fill="#003087" />
                    <rect x="208" y="106.8" width="15" height="36.4" fill="#009cde" />
                    <rect x="208" y="101.6" width="15" height="5.2" fill="#99d7f2" />
                    <rect x="208" y="91.2" width="15" height="10.4" fill="#94a3b8" />
                    <rect x="229" y="164.0" width="15" height="26.0" fill="#003087" />
                    <rect x="229" y="138.0" width="15" height="26.0" fill="#009cde" />
                    <rect x="229" y="132.8" width="15" height="5.2" fill="#99d7f2" />
                    <rect x="229" y="132.8" width="15" height="0.0" fill="#94a3b8" />
                    <rect x="250" y="132.8" width="15" height="57.2" fill="#003087" />
                    <rect x="250" y="112.0" width="15" height="20.8" fill="#009cde" />
                    <rect x="250" y="91.2" width="15" height="20.8" fill="#99d7f2" />
                    <rect x="250" y="86.0" width="15" height="5.2" fill="#94a3b8" />
                    <rect x="271" y="169.2" width="15" height="20.8" fill="#003087" />
                    <rect x="271" y="148.4" width="15" height="20.8" fill="#009cde" />
                    <rect x="271" y="143.2" width="15" height="5.2" fill="#99d7f2" />
                    <rect x="271" y="138.0" width="15" height="5.2" fill="#94a3b8" />
                    <rect x="292" y="148.4" width="15" height="41.6" fill="#003087" />
                    <rect x="292" y="122.4" width="15" height="26.0" fill="#009cde" />
                    <rect x="292" y="112.0" width="15" height="10.4" fill="#99d7f2" />
                    <rect x="292" y="112.0" width="15" height="0.0" fill="#94a3b8" />
                    <rect x="313" y="148.4" width="15" height="41.6" fill="#003087" />
                    <rect x="313" y="96.4" width="15" height="52.0" fill="#009cde" />
                    <rect x="313" y="86.0" width="15" height="10.4" fill="#99d7f2" />
                    <rect x="313" y="86.0" width="15" height="0.0" fill="#94a3b8" />
                    <rect x="334" y="132.8" width="15" height="57.2" fill="#003087" />
                    <rect x="334" y="106.8" width="15" height="26.0" fill="#009cde" />
                    <rect x="334" y="96.4" width="15" height="10.4" fill="#99d7f2" />
                    <rect x="334" y="96.4" width="15" height="0.0" fill="#94a3b8" />
                    <rect x="355" y="164.0" width="15" height="26.0" fill="#003087" />
                    <rect x="355" y="122.4" width="15" height="41.6" fill="#009cde" />
                    <rect x="355" y="101.6" width="15" height="20.8" fill="#99d7f2" />
                    <rect x="355" y="86.0" width="15" height="15.6" fill="#94a3b8" />
                    <rect x="376" y="158.8" width="15" height="31.2" fill="#003087" />
                    <rect x="376" y="127.6" width="15" height="31.2" fill="#009cde" />
                    <rect x="376" y="117.2" width="15" height="10.4" fill="#99d7f2" />
                    <rect x="376" y="101.6" width="15" height="15.6" fill="#94a3b8" />
                    <rect x="397" y="153.6" width="15" height="36.4" fill="#003087" />
                    <rect x="397" y="122.4" width="15" height="31.2" fill="#009cde" />
                    <rect x="397" y="101.6" width="15" height="20.8" fill="#99d7f2" />
                    <rect x="397" y="86.0" width="15" height="15.6" fill="#94a3b8" />
                    <rect x="418" y="174.4" width="15" height="15.6" fill="#003087" />
                    <rect x="418" y="158.8" width="15" height="15.6" fill="#009cde" />
                    <rect x="418" y="148.4" width="15" height="10.4" fill="#99d7f2" />
                    <rect x="418" y="143.2" width="15" height="5.2" fill="#94a3b8" />
                    <rect x="439" y="164.0" width="15" height="26.0" fill="#003087" />
                    <rect x="439" y="112.0" width="15" height="52.0" fill="#009cde" />
                    <rect x="439" y="106.8" width="15" height="5.2" fill="#99d7f2" />
                    <rect x="439" y="101.6" width="15" height="5.2" fill="#94a3b8" />
                    <rect x="460" y="138.0" width="15" height="52.0" fill="#003087" />
                    <rect x="460" y="91.2" width="15" height="46.8" fill="#009cde" />
                    <rect x="460" y="70.4" width="15" height="20.8" fill="#99d7f2" />
                    <rect x="460" y="70.4" width="15" height="0.0" fill="#94a3b8" />
                    <rect x="481" y="117.2" width="15" height="72.8" fill="#003087" />
                    <rect x="481" y="34.0" width="15" height="83.2" fill="#009cde" />
                    <rect x="481" y="18.4" width="15" height="15.6" fill="#99d7f2" />
                    <rect x="481" y="-2.4" width="15" height="20.8" fill="#94a3b8" />
                    <rect x="502" y="143.2" width="15" height="46.8" fill="#003087" />
                    <rect x="502" y="101.6" width="15" height="41.6" fill="#009cde" />
                    <rect x="502" y="96.4" width="15" height="5.2" fill="#99d7f2" />
                    <rect x="502" y="91.2" width="15" height="5.2" fill="#94a3b8" />
                    <rect x="523" y="138.0" width="15" height="52.0" fill="#003087" />
                    <rect x="523" y="112.0" width="15" height="26.0" fill="#009cde" />
                    <rect x="523" y="96.4" width="15" height="15.6" fill="#99d7f2" />
                    <rect x="523" y="86.0" width="15" height="10.4" fill="#94a3b8" />
                    <rect x="544" y="153.6" width="15" height="36.4" fill="#003087" />
                    <rect x="544" y="101.6" width="15" height="52.0" fill="#009cde" />
                    <rect x="544" y="86.0" width="15" height="15.6" fill="#99d7f2" />
                    <rect x="544" y="80.8" width="15" height="5.2" fill="#94a3b8" />
                    <rect x="565" y="179.6" width="15" height="10.4" fill="#003087" />
                    <rect x="565" y="169.2" width="15" height="10.4" fill="#009cde" />
                    <rect x="565" y="164.0" width="15" height="5.2" fill="#99d7f2" />
                    <rect x="565" y="158.8" width="15" height="5.2" fill="#94a3b8" />
                    <rect x="586" y="132.8" width="15" height="57.2" fill="#003087" />
                    <rect x="586" y="96.4" width="15" height="36.4" fill="#009cde" />
                    <rect x="586" y="80.8" width="15" height="15.6" fill="#99d7f2" />
                    <rect x="586" y="75.6" width="15" height="5.2" fill="#94a3b8" />
                    <rect x="607" y="138.0" width="15" height="52.0" fill="#003087" />
                    <rect x="607" y="117.2" width="15" height="20.8" fill="#009cde" />
                    <rect x="607" y="106.8" width="15" height="10.4" fill="#99d7f2" />
                    <rect x="607" y="91.2" width="15" height="15.6" fill="#94a3b8" />
                    <rect x="628" y="158.8" width="15" height="31.2" fill="#003087" />
                    <rect x="628" y="112.0" width="15" height="46.8" fill="#009cde" />
                    <rect x="628" y="106.8" width="15" height="5.2" fill="#99d7f2" />
                    <rect x="628" y="96.4" width="15" height="10.4" fill="#94a3b8" />
                    <rect x="649" y="148.4" width="15" height="41.6" fill="#003087" />
                    <rect x="649" y="106.8" width="15" height="41.6" fill="#009cde" />
                    <rect x="649" y="86.0" width="15" height="20.8" fill="#99d7f2" />
                    <rect x="649" y="80.8" width="15" height="5.2" fill="#94a3b8" />
                    <line x1="488" x2="488" y1="20" y2="190" stroke="#c2410c" strokeDasharray="3 3" />
                    <text x="494" y="30" fontSize="11" fill="#c2410c" fontWeight="600" fontFamily="Poppins">12 Aug · Steadfast incident</text>
                    <text x="47" y="208" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">21 Aug</text>
                    <text x="257" y="208" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">31 Aug</text>
                    <text x="467" y="208" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">10 Sep</text>
                    <text x="656" y="208" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">19 Sep</text>
                  </svg>
                  <div className="cs-axis" aria-hidden="true">
                    <span style={{ left: "6.9%" }}>21 Aug</span>
                    <span style={{ left: "37.8%" }}>31 Aug</span>
                    <span style={{ left: "68.7%" }}>10 Sep</span>
                    <span style={{ left: "96.5%" }}>19 Sep</span>
                  </div>
                  <div className="cs-chart-note" aria-hidden="true">Up to 30 tickets a day · <span style={{ color: "#c2410c" }}>12 Aug · Steadfast incident</span></div>
                </section>
                <section className="panel" style={{ padding: "16px 20px" }}>
                  <h2 style={{ margin: "0 0 10px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "var(--ink)" }}>What merchants ask about</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr) 40px", alignItems: "center", gap: "10px", minHeight: "30px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Courier and delivery</span>
                    <span style={{ height: "12px", borderRadius: "var(--radius-md)", background: "var(--track)" }}>
                      <span style={{ display: "block", width: "100%", height: "100%", borderRadius: "var(--radius-md)", background: "#009cde" }} />
                    </span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>31%</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr) 40px", alignItems: "center", gap: "10px", minHeight: "30px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Payments and COD</span>
                    <span style={{ height: "12px", borderRadius: "var(--radius-md)", background: "var(--track)" }}>
                      <span style={{ display: "block", width: "71%", height: "100%", borderRadius: "var(--radius-md)", background: "#003087" }} />
                    </span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>22%</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr) 40px", alignItems: "center", gap: "10px", minHeight: "30px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Domain and setup</span>
                    <span style={{ height: "12px", borderRadius: "var(--radius-md)", background: "var(--track)" }}>
                      <span style={{ display: "block", width: "45%", height: "100%", borderRadius: "var(--radius-md)", background: "#003087" }} />
                    </span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>14%</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr) 40px", alignItems: "center", gap: "10px", minHeight: "30px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Billing and invoices</span>
                    <span style={{ height: "12px", borderRadius: "var(--radius-md)", background: "var(--track)" }}>
                      <span style={{ display: "block", width: "39%", height: "100%", borderRadius: "var(--radius-md)", background: "#003087" }} />
                    </span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>12%</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr) 40px", alignItems: "center", gap: "10px", minHeight: "30px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>How-to</span>
                    <span style={{ height: "12px", borderRadius: "var(--radius-md)", background: "var(--track)" }}>
                      <span style={{ display: "block", width: "35%", height: "100%", borderRadius: "var(--radius-md)", background: "#003087" }} />
                    </span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>11%</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr) 40px", alignItems: "center", gap: "10px", minHeight: "30px" }}>
                    <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Bugs</span>
                    <span style={{ height: "12px", borderRadius: "var(--radius-md)", background: "var(--track)" }}>
                      <span style={{ display: "block", width: "32%", height: "100%", borderRadius: "var(--radius-md)", background: "#003087" }} />
                    </span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>10%</span>
                  </div>
                  <p style={{ margin: "10px 0 0", fontSize: "var(--text-xs)", color: "var(--muted)" }}>Courier issues doubled in the week of the Steadfast incident.</p>
                </section>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.15fr) minmax(0,1.3fr)", gap: "16px" }}>
                <section className="panel" style={{ padding: "16px 20px" }}>
                  <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "var(--ink)" }}>Open tickets by age</h2>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "210px", paddingTop: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: "1" }}>
                      <span className="num" style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--ink)" }}>19</span>
                      <span style={{ width: "44px", height: "133px", borderRadius: "var(--radius-md) var(--radius-md) 2px 2px", background: "#003087" }} />
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--body)", textAlign: "center" }}><span className="shp shp-ok" aria-hidden="true" />Under 4 h</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: "1" }}>
                      <span className="num" style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--ink)" }}>11</span>
                      <span style={{ width: "44px", height: "77px", borderRadius: "var(--radius-md) var(--radius-md) 2px 2px", background: "#003087" }} />
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--body)", textAlign: "center" }}><span className="shp shp-ok" aria-hidden="true" />4 to 24 h</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: "1" }}>
                      <span className="num" style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--ink)" }}>6</span>
                      <span style={{ width: "44px", height: "42px", borderRadius: "var(--radius-md) var(--radius-md) 2px 2px", background: "#ff9800" }} />
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--body)", textAlign: "center" }}><span className="shp shp-warn" aria-hidden="true" />1 to 3 days</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: "1" }}>
                      <span className="num" style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--ink)" }}>2</span>
                      <span style={{ width: "44px", height: "14px", borderRadius: "var(--radius-md) var(--radius-md) 2px 2px", background: "#ff5724" }} />
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--body)", textAlign: "center" }}><span className="shp shp-err" aria-hidden="true" />Over 3 days</span>
                    </div>
                  </div>
                </section>
                <section className="panel" style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "var(--ink)" }}>When tickets arrive</h2>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>Dhaka time</span>
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <svg className="cs-chart-s cs-chart-fit" viewBox="0 0 430 178" width="100%" height="178" role="img" style={{ "--cs-fs": "16px" }} aria-label="Tickets by hour and weekday">
                      <text x="0" y="16" fontSize="11" fill="#64748b" fontFamily="Poppins">Sat</text>
                      <rect x="38" y="4" width="21" height="18" rx="3" fill="#003087" opacity="0.38" />
                      <rect x="62" y="4" width="21" height="18" rx="3" fill="#003087" opacity="0.44" />
                      <rect x="86" y="4" width="21" height="18" rx="3" fill="#003087" opacity="0.65" />
                      <rect x="110" y="4" width="21" height="18" rx="3" fill="#003087" opacity="0.77" />
                      <rect x="134" y="4" width="21" height="18" rx="3" fill="#003087" opacity="0.82" />
                      <rect x="158" y="4" width="21" height="18" rx="3" fill="#003087" opacity="0.81" />
                      <rect x="182" y="4" width="21" height="18" rx="3" fill="#003087" opacity="0.58" />
                      <rect x="206" y="4" width="21" height="18" rx="3" fill="#003087" opacity="0.45" />
                      <rect x="230" y="4" width="21" height="18" rx="3" fill="#003087" opacity="0.38" />
                      <rect x="254" y="4" width="21" height="18" rx="3" fill="#003087" opacity="0.29" />
                      <rect x="278" y="4" width="21" height="18" rx="3" fill="#003087" opacity="0.26" />
                      <rect x="302" y="4" width="21" height="18" rx="3" fill="#003087" opacity="0.50" />
                      <rect x="326" y="4" width="21" height="18" rx="3" fill="#003087" opacity="0.79" />
                      <rect x="350" y="4" width="21" height="18" rx="3" fill="#003087" opacity="0.93" />
                      <rect x="374" y="4" width="21" height="18" rx="3" fill="#003087" opacity="0.81" />
                      <rect x="398" y="4" width="21" height="18" rx="3" fill="#003087" opacity="0.46" />
                      <text x="0" y="38" fontSize="11" fill="#64748b" fontFamily="Poppins">Sun</text>
                      <rect x="38" y="26" width="21" height="18" rx="3" fill="#003087" opacity="0.27" />
                      <rect x="62" y="26" width="21" height="18" rx="3" fill="#003087" opacity="0.50" />
                      <rect x="86" y="26" width="21" height="18" rx="3" fill="#003087" opacity="0.58" />
                      <rect x="110" y="26" width="21" height="18" rx="3" fill="#003087" opacity="0.73" />
                      <rect x="134" y="26" width="21" height="18" rx="3" fill="#003087" opacity="0.85" />
                      <rect x="158" y="26" width="21" height="18" rx="3" fill="#003087" opacity="0.83" />
                      <rect x="182" y="26" width="21" height="18" rx="3" fill="#003087" opacity="0.64" />
                      <rect x="206" y="26" width="21" height="18" rx="3" fill="#003087" opacity="0.54" />
                      <rect x="230" y="26" width="21" height="18" rx="3" fill="#003087" opacity="0.39" />
                      <rect x="254" y="26" width="21" height="18" rx="3" fill="#003087" opacity="0.25" />
                      <rect x="278" y="26" width="21" height="18" rx="3" fill="#003087" opacity="0.28" />
                      <rect x="302" y="26" width="21" height="18" rx="3" fill="#003087" opacity="0.52" />
                      <rect x="326" y="26" width="21" height="18" rx="3" fill="#003087" opacity="0.84" />
                      <rect x="350" y="26" width="21" height="18" rx="3" fill="#003087" opacity="0.92" />
                      <rect x="374" y="26" width="21" height="18" rx="3" fill="#003087" opacity="0.85" />
                      <rect x="398" y="26" width="21" height="18" rx="3" fill="#003087" opacity="0.51" />
                      <text x="0" y="60" fontSize="11" fill="#64748b" fontFamily="Poppins">Mon</text>
                      <rect x="38" y="48" width="21" height="18" rx="3" fill="#003087" opacity="0.25" />
                      <rect x="62" y="48" width="21" height="18" rx="3" fill="#003087" opacity="0.45" />
                      <rect x="86" y="48" width="21" height="18" rx="3" fill="#003087" opacity="0.54" />
                      <rect x="110" y="48" width="21" height="18" rx="3" fill="#003087" opacity="0.74" />
                      <rect x="134" y="48" width="21" height="18" rx="3" fill="#003087" opacity="0.74" />
                      <rect x="158" y="48" width="21" height="18" rx="3" fill="#003087" opacity="0.66" />
                      <rect x="182" y="48" width="21" height="18" rx="3" fill="#003087" opacity="0.62" />
                      <rect x="206" y="48" width="21" height="18" rx="3" fill="#003087" opacity="0.41" />
                      <rect x="230" y="48" width="21" height="18" rx="3" fill="#003087" opacity="0.29" />
                      <rect x="254" y="48" width="21" height="18" rx="3" fill="#003087" opacity="0.21" />
                      <rect x="278" y="48" width="21" height="18" rx="3" fill="#003087" opacity="0.36" />
                      <rect x="302" y="48" width="21" height="18" rx="3" fill="#003087" opacity="0.48" />
                      <rect x="326" y="48" width="21" height="18" rx="3" fill="#003087" opacity="0.76" />
                      <rect x="350" y="48" width="21" height="18" rx="3" fill="#003087" opacity="0.88" />
                      <rect x="374" y="48" width="21" height="18" rx="3" fill="#003087" opacity="0.77" />
                      <rect x="398" y="48" width="21" height="18" rx="3" fill="#003087" opacity="0.42" />
                      <text x="0" y="82" fontSize="11" fill="#64748b" fontFamily="Poppins">Tue</text>
                      <rect x="38" y="70" width="21" height="18" rx="3" fill="#003087" opacity="0.25" />
                      <rect x="62" y="70" width="21" height="18" rx="3" fill="#003087" opacity="0.42" />
                      <rect x="86" y="70" width="21" height="18" rx="3" fill="#003087" opacity="0.55" />
                      <rect x="110" y="70" width="21" height="18" rx="3" fill="#003087" opacity="0.73" />
                      <rect x="134" y="70" width="21" height="18" rx="3" fill="#003087" opacity="0.80" />
                      <rect x="158" y="70" width="21" height="18" rx="3" fill="#003087" opacity="0.65" />
                      <rect x="182" y="70" width="21" height="18" rx="3" fill="#003087" opacity="0.54" />
                      <rect x="206" y="70" width="21" height="18" rx="3" fill="#003087" opacity="0.41" />
                      <rect x="230" y="70" width="21" height="18" rx="3" fill="#003087" opacity="0.28" />
                      <rect x="254" y="70" width="21" height="18" rx="3" fill="#003087" opacity="0.31" />
                      <rect x="278" y="70" width="21" height="18" rx="3" fill="#003087" opacity="0.29" />
                      <rect x="302" y="70" width="21" height="18" rx="3" fill="#003087" opacity="0.55" />
                      <rect x="326" y="70" width="21" height="18" rx="3" fill="#003087" opacity="0.75" />
                      <rect x="350" y="70" width="21" height="18" rx="3" fill="#003087" opacity="0.80" />
                      <rect x="374" y="70" width="21" height="18" rx="3" fill="#003087" opacity="0.78" />
                      <rect x="398" y="70" width="21" height="18" rx="3" fill="#003087" opacity="0.43" />
                      <text x="0" y="104" fontSize="11" fill="#64748b" fontFamily="Poppins">Wed</text>
                      <rect x="38" y="92" width="21" height="18" rx="3" fill="#003087" opacity="0.33" />
                      <rect x="62" y="92" width="21" height="18" rx="3" fill="#003087" opacity="0.47" />
                      <rect x="86" y="92" width="21" height="18" rx="3" fill="#003087" opacity="0.61" />
                      <rect x="110" y="92" width="21" height="18" rx="3" fill="#003087" opacity="0.71" />
                      <rect x="134" y="92" width="21" height="18" rx="3" fill="#003087" opacity="0.79" />
                      <rect x="158" y="92" width="21" height="18" rx="3" fill="#003087" opacity="0.65" />
                      <rect x="182" y="92" width="21" height="18" rx="3" fill="#003087" opacity="0.65" />
                      <rect x="206" y="92" width="21" height="18" rx="3" fill="#003087" opacity="0.42" />
                      <rect x="230" y="92" width="21" height="18" rx="3" fill="#003087" opacity="0.36" />
                      <rect x="254" y="92" width="21" height="18" rx="3" fill="#003087" opacity="0.23" />
                      <rect x="278" y="92" width="21" height="18" rx="3" fill="#003087" opacity="0.31" />
                      <rect x="302" y="92" width="21" height="18" rx="3" fill="#003087" opacity="0.54" />
                      <rect x="326" y="92" width="21" height="18" rx="3" fill="#003087" opacity="0.70" />
                      <rect x="350" y="92" width="21" height="18" rx="3" fill="#003087" opacity="0.91" />
                      <rect x="374" y="92" width="21" height="18" rx="3" fill="#003087" opacity="0.74" />
                      <rect x="398" y="92" width="21" height="18" rx="3" fill="#003087" opacity="0.51" />
                      <text x="0" y="126" fontSize="11" fill="#64748b" fontFamily="Poppins">Thu</text>
                      <rect x="38" y="114" width="21" height="18" rx="3" fill="#003087" opacity="0.26" />
                      <rect x="62" y="114" width="21" height="18" rx="3" fill="#003087" opacity="0.39" />
                      <rect x="86" y="114" width="21" height="18" rx="3" fill="#003087" opacity="0.62" />
                      <rect x="110" y="114" width="21" height="18" rx="3" fill="#003087" opacity="0.78" />
                      <rect x="134" y="114" width="21" height="18" rx="3" fill="#003087" opacity="0.80" />
                      <rect x="158" y="114" width="21" height="18" rx="3" fill="#003087" opacity="0.75" />
                      <rect x="182" y="114" width="21" height="18" rx="3" fill="#003087" opacity="0.59" />
                      <rect x="206" y="114" width="21" height="18" rx="3" fill="#003087" opacity="0.45" />
                      <rect x="230" y="114" width="21" height="18" rx="3" fill="#003087" opacity="0.31" />
                      <rect x="254" y="114" width="21" height="18" rx="3" fill="#003087" opacity="0.19" />
                      <rect x="278" y="114" width="21" height="18" rx="3" fill="#003087" opacity="0.32" />
                      <rect x="302" y="114" width="21" height="18" rx="3" fill="#003087" opacity="0.47" />
                      <rect x="326" y="114" width="21" height="18" rx="3" fill="#003087" opacity="0.74" />
                      <rect x="350" y="114" width="21" height="18" rx="3" fill="#003087" opacity="0.82" />
                      <rect x="374" y="114" width="21" height="18" rx="3" fill="#003087" opacity="0.75" />
                      <rect x="398" y="114" width="21" height="18" rx="3" fill="#003087" opacity="0.51" />
                      <text x="0" y="148" fontSize="11" fill="#64748b" fontFamily="Poppins">Fri</text>
                      <rect x="38" y="136" width="21" height="18" rx="3" fill="#003087" opacity="0.14" />
                      <rect x="62" y="136" width="21" height="18" rx="3" fill="#003087" opacity="0.26" />
                      <rect x="86" y="136" width="21" height="18" rx="3" fill="#003087" opacity="0.29" />
                      <rect x="110" y="136" width="21" height="18" rx="3" fill="#003087" opacity="0.32" />
                      <rect x="134" y="136" width="21" height="18" rx="3" fill="#003087" opacity="0.33" />
                      <rect x="158" y="136" width="21" height="18" rx="3" fill="#003087" opacity="0.39" />
                      <rect x="182" y="136" width="21" height="18" rx="3" fill="#003087" opacity="0.30" />
                      <rect x="206" y="136" width="21" height="18" rx="3" fill="#003087" opacity="0.29" />
                      <rect x="230" y="136" width="21" height="18" rx="3" fill="#003087" opacity="0.20" />
                      <rect x="254" y="136" width="21" height="18" rx="3" fill="#003087" opacity="0.17" />
                      <rect x="278" y="136" width="21" height="18" rx="3" fill="#003087" opacity="0.22" />
                      <rect x="302" y="136" width="21" height="18" rx="3" fill="#003087" opacity="0.33" />
                      <rect x="326" y="136" width="21" height="18" rx="3" fill="#003087" opacity="0.38" />
                      <rect x="350" y="136" width="21" height="18" rx="3" fill="#003087" opacity="0.49" />
                      <rect x="374" y="136" width="21" height="18" rx="3" fill="#003087" opacity="0.40" />
                      <rect x="398" y="136" width="21" height="18" rx="3" fill="#003087" opacity="0.28" />
                      <text x="48" y="172" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">08</text>
                      <text x="96" y="172" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">10</text>
                      <text x="144" y="172" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">12</text>
                      <text x="192" y="172" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">14</text>
                      <text x="240" y="172" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">16</text>
                      <text x="288" y="172" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">18</text>
                      <text x="336" y="172" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">20</text>
                      <text x="384" y="172" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">22</text>
                    </svg>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "var(--text-xs)", color: "var(--muted)" }}>Two peaks: lunch and after 20:00, when owners pack orders.</p>
                </section>
                <section className="panel" style={{ padding: "16px 20px" }}>
                  <h2 style={{ margin: "0 0 10px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "var(--ink)" }}>Agents</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) 60px 90px 60px minmax(0,1.2fr)", gap: "12px", paddingBottom: "6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>
                    <span>Agent</span>
                    <span style={{ textAlign: "right" }}>Open</span>
                    <span style={{ textAlign: "right" }}>1st reply</span>
                    <span style={{ textAlign: "right" }}>CSAT</span>
                    <span>SLA met</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) 60px 90px 60px minmax(0,1.2fr)", alignItems: "center", gap: "12px", minHeight: "48px", borderTop: "1px solid var(--line)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}><span className="av" style={{ width: "28px", height: "28px", background: "#003087" }} title="FA">FA</span>Farhana Akter</span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)", textAlign: "right" }}>9</span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)", textAlign: "right", fontWeight: "var(--weight-regular)" }}>11 min</span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)", textAlign: "right" }}>4.8</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ flexGrow: "1", height: "8px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                        <span style={{ display: "block", width: "97%", height: "100%", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                      </span>
                      <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>97%</span>
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) 60px 90px 60px minmax(0,1.2fr)", alignItems: "center", gap: "12px", minHeight: "48px", borderTop: "1px solid var(--line)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}><span className="av" style={{ width: "28px", height: "28px", background: "#0070a0" }} title="RH">RH</span>Rakib Hasan</span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)", textAlign: "right" }}>12</span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)", textAlign: "right", fontWeight: "var(--weight-regular)" }}>18 min</span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)", textAlign: "right" }}>4.5</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ flexGrow: "1", height: "8px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                        <span style={{ display: "block", width: "93%", height: "100%", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                      </span>
                      <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>93%</span>
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) 60px 90px 60px minmax(0,1.2fr)", alignItems: "center", gap: "12px", minHeight: "48px", borderTop: "1px solid var(--line)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}><span className="av" style={{ width: "28px", height: "28px", background: "#2e559d" }} title="TS">TS</span>Tania Sultana</span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)", textAlign: "right" }}>8</span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)", textAlign: "right", fontWeight: "var(--weight-regular)" }}>9 min</span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)", textAlign: "right" }}>4.7</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ flexGrow: "1", height: "8px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                        <span style={{ display: "block", width: "98%", height: "100%", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                      </span>
                      <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>98%</span>
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) 60px 90px 60px minmax(0,1.2fr)", alignItems: "center", gap: "12px", minHeight: "48px", borderTop: "1px solid var(--line)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}><span className="av" style={{ width: "28px", height: "28px", background: "#00567a" }} title="MK">MK</span>Mahin Khan</span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)", textAlign: "right" }}>9</span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--errt)", textAlign: "right", fontWeight: "var(--weight-medium)" }}>34 min</span>
                    <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)", textAlign: "right" }}>4.2</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ flexGrow: "1", height: "8px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                        <span style={{ display: "block", width: "81%", height: "100%", borderRadius: "var(--radius-sm)", background: "#ff9800" }} />
                      </span>
                      <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--warnt)" }}>81%</span>
                    </span>
                  </div>
                </section>
              </div>
              <section className="panel" style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr)", gap: "28px", alignItems: "center" }}>
                <div>
                  <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "var(--ink)" }}>Stores that ask most</h2>
                  <p style={{ margin: "4px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "var(--body)" }}>Frequent tickets are an early churn signal. These stores feed the churn-risk queue in Monitoring.</p>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "40px", borderTop: "0" }}>
                    <span className="shp shp-err" aria-hidden="true" />
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Bindu Beauty</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>health 33</span>
                    <span className="num" style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>6 tickets</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "40px", borderTop: "1px solid var(--line)" }}>
                    <span className="shp shp-warn" aria-hidden="true" />
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Dhaka Gadget Hub</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>health 54</span>
                    <span className="num" style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>4 tickets</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "40px", borderTop: "1px solid var(--line)" }}>
                    <span className="shp shp-err" aria-hidden="true" />
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Nodi Organic</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>health 41</span>
                    <span className="num" style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>4 tickets</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "40px", borderTop: "1px solid var(--line)" }}>
                    <span className="shp shp-ok" aria-hidden="true" />
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Shonali Crafts</span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>health 78</span>
                    <span className="num" style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>3 tickets</span>
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
