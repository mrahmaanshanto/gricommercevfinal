'use client';
// Generated from design/templates/console/MerchantPinAccess.dc.html by scripts/convert-design.mjs.
// Merchant admin · support access PIN
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  renderVals() {
    const stage = (this.state || {}).stage ?? 'none';
    const go = (x) => () => this.setState({ stage: x });
    const list = [["none", "Choose access"], ["pin", "PIN shown"], ["in", "Support inside"], ["done", "Access ended"]];
    const stages = list.map(([id, label], i) => ({ n: i + 1, label, cls: id === stage ? 'stg on' : 'stg', pressed: id === stage ? 'true' : 'false', pick: go(id) }));
    return { stages, isNone: stage === 'none', isPin: stage === 'pin', isIn: stage === 'in', isDone: stage === 'done',
      generate: go('pin'), cancel: go('none'), used: go('in'), stop: go('done'), again: go('none'), miniCls: '' };
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

.pinbox{display:inline-flex;align-items:center;justify-content:center;width:56px;height:64px;border:1.5px solid #d5dde8;border-radius:var(--radius-xl);background:var(--surface);font-family:var(--font-data);font-size:var(--text-3xl);font-weight:var(--weight-medium);color:var(--ink)}
.pinbox.f{border-color:#003087;box-shadow:0 0 0 3px rgba(0,48,135,.12)}
.bigpin{font-family:var(--font-data);font-size:var(--text-4xl);font-weight:var(--weight-medium);letter-spacing:var(--tracking-caps);color:#0f172a}
.stg{display:flex;align-items:center;gap:10px;min-height:44px;padding:0 14px;border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--surface);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--body);cursor:pointer}
.stg.on{border-color:#003087;background:#f2f5f9;color:#003087}
.stgn{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:var(--radius-full);background:#e2e8f0;color:#475569;font-size:var(--text-xs);font-weight:var(--weight-medium)}
.stg.on .stgn{background:#003087;color:#fff}
.banner-fix{display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:var(--radius-xl);background:linear-gradient(90deg,#012169,#003087);color:#fff}

`;

// ---- markup ----

export default class MerchantPinAccessScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="MerchantPinAccess">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="cs-boardscroll">
          <div data-board="" className={`cs ${v.miniCls ?? ""}`} style={{ width: "1440px", height: "1000px", position: "relative", overflow: "hidden", background: "#f4f7fb" }}>
            <aside style={{ position: "absolute", left: "0", top: "0", bottom: "0", width: "240px", background: "#fff", borderRight: "1px solid #e6ebf3", padding: "18px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 6px 16px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)" }}>DG</span>
                <div>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Dhaka Gadget Hub</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Merchant admin</div>
                </div>
              </div>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "40px", padding: "0 12px", borderRadius: "var(--radius-lg)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", background: "transparent" }}>Dashboard</a>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "40px", padding: "0 12px", borderRadius: "var(--radius-lg)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", background: "transparent" }}>Orders</a>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "40px", padding: "0 12px", borderRadius: "var(--radius-lg)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", background: "transparent" }}>Products</a>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "40px", padding: "0 12px", borderRadius: "var(--radius-lg)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", background: "transparent" }}>Customers</a>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "40px", padding: "0 12px", borderRadius: "var(--radius-lg)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", background: "transparent" }}>Marketing</a>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "40px", padding: "0 12px", borderRadius: "var(--radius-lg)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569", background: "transparent" }}>Reports</a>
              <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "40px", padding: "0 12px", borderRadius: "var(--radius-lg)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#003087", background: "#eaf1ff" }}>Settings</a>
              <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "8px", padding: "10px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Powered by <img src="/assets/62dadbbb3f365aebdd41bb9975f5931f.png" alt="GridCommerce" style={{ height: "14px", width: "auto" }} /></div>
            </aside>
            <main style={{ position: "absolute", left: "240px", right: "0", top: "0", bottom: "0", padding: "24px 32px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Settings / Support access</div>
              <div style={{ display: "grid", gridTemplateColumns: "200px minmax(0,1fr)", gap: "24px" }}>
                <nav aria-label="Settings" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <a href="#" style={{ display: "block", padding: "8px 12px", fontSize: "var(--text-xs-plus)", borderRadius: "var(--radius-lg)", color: "#475569", fontWeight: "var(--weight-regular)", background: "transparent" }}>General</a>
                  <a href="#" style={{ display: "block", padding: "8px 12px", fontSize: "var(--text-xs-plus)", borderRadius: "var(--radius-lg)", color: "#475569", fontWeight: "var(--weight-regular)", background: "transparent" }}>Payments</a>
                  <a href="#" style={{ display: "block", padding: "8px 12px", fontSize: "var(--text-xs-plus)", borderRadius: "var(--radius-lg)", color: "#475569", fontWeight: "var(--weight-regular)", background: "transparent" }}>Delivery</a>
                  <a href="#" style={{ display: "block", padding: "8px 12px", fontSize: "var(--text-xs-plus)", borderRadius: "var(--radius-lg)", color: "#475569", fontWeight: "var(--weight-regular)", background: "transparent" }}>Staff</a>
                  <a href="#" style={{ display: "block", padding: "8px 12px", fontSize: "var(--text-xs-plus)", borderRadius: "var(--radius-lg)", color: "#003087", fontWeight: "var(--weight-medium)", background: "#f2f5f9" }}>Support access</a>
                  <a href="#" style={{ display: "block", padding: "8px 12px", fontSize: "var(--text-xs-plus)", borderRadius: "var(--radius-lg)", color: "#475569", fontWeight: "var(--weight-regular)", background: "transparent" }}>Billing</a>
                </nav>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <div>
                    <h1 style={{ margin: "0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Support access</h1>
                    <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "#475569" }}>Let GridCommerce support into your store for a short time to fix a problem. <span className="bn">সমস্যা ঠিক করতে সাপোর্টকে অল্প সময়ের জন্য আপনার স্টোরে ঢুকতে দিন।</span></p>
                  </div>
                  <div role="group" aria-label="Prototype flow, owner side" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {__list(v.stages).map((s, $index) => (<React.Fragment key={$index}>
                        <button className={s?.cls} type="button" onClick={s?.pick} aria-pressed={s?.pressed}><span className="stgn">{s?.n}</span>{s?.label}</button>
                      </React.Fragment>))}
                  </div>
                  <section className="panel" style={{ padding: "22px 24px" }}>
                    {v.isNone ? (<>
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div className="fld">
                          <span className="flab">What can support change?</span>
                          <div className="rgrid" role="radiogroup" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
                            <div className="rc" role="radio" aria-checked="false" tabIndex="0">
                              <span className="rdot" aria-hidden="true" />
                              <div style={{ minWidth: "0" }}>
                                <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>View only</div>
                                <div className="fhelp" style={{ marginTop: "2px" }}>They can look, but not change anything.</div>
                              </div>
                            </div>
                            <div className="rc on" role="radio" aria-checked="true" tabIndex="0">
                              <span className="rdot" aria-hidden="true" />
                              <div style={{ minWidth: "0" }}>
                                <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Fix only these areas</div>
                                <div className="fhelp" style={{ marginTop: "2px" }}>Pick the areas below. Everything else stays view-only.</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="fld">
                          <span className="flab">Areas</span>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "2px 16px" }}>
                            <div className="chk" role="checkbox" aria-checked="true" tabIndex="0">
                              <span className="cb on">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M20 6 9 17l-5-5" />
                                </svg>
                              </span>
                              <span className="ell">Courier and delivery</span>
                            </div>
                            <div className="chk" role="checkbox" aria-checked="true" tabIndex="0">
                              <span className="cb on">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M20 6 9 17l-5-5" />
                                </svg>
                              </span>
                              <span className="ell">Orders</span>
                            </div>
                            <div className="chk" role="checkbox" aria-checked="false" tabIndex="0">
                              <span className="cb" />
                              <span className="ell">Payments</span>
                            </div>
                            <div className="chk" role="checkbox" aria-checked="false" tabIndex="0">
                              <span className="cb" />
                              <span className="ell">Products</span>
                            </div>
                            <div className="chk" role="checkbox" aria-checked="false" tabIndex="0">
                              <span className="cb" />
                              <span className="ell">Theme and pages</span>
                            </div>
                            <div className="chk" role="checkbox" aria-checked="false" tabIndex="0">
                              <span className="cb" />
                              <span className="ell">Settings</span>
                            </div>
                          </div>
                        </div>
                        <div className="fgrid" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
                          <label className="fld">
                            <span className="flab">For how long</span>
                            <select defaultValue="60 minutes" className="in">
                              <option>60 minutes</option>
                              <option>30 minutes</option>
                              <option>2 hours</option>
                            </select>
                          </label>
                          <label className="fld">
                            <span className="flab">About ticket</span>
                            <select defaultValue="T-2291 · Steadfast parcels not syncing" className="in">
                              <option>T-2291 · Steadfast parcels not syncing</option>
                              <option>No ticket</option>
                            </select>
                          </label>
                        </div>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <button className="btn btnp" type="button" onClick={v.generate} style={{ minHeight: "44px", fontSize: "var(--text-sm)" }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <circle cx="7.5" cy="15.5" r="4.5" />
  <path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3" />
</svg>Generate PIN</button>
                          <span className="bn" style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>পিন শুধু গ্রিডকমার্স সাপোর্টকে দিন, অন্য কাউকে নয়।</span>
                        </div>
                      </div>
                    </>) : null}
                    {v.isPin ? (<>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "12px 0", textAlign: "center" }}>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Read this PIN to the GridCommerce support person on the phone</div>
                        <div className="bigpin">482 719</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#b45309" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="10" />
  <path d="M12 6v6l4 2" />
</svg>Use within <span className="num">9:48</span> · works once</div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button className="btn btng" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect x="9" y="9" width="13" height="13" rx="2" />
  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
</svg>Copy</button>
                          <button className="btn btng" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.9-.9L3 21l1.9-5.1A8.4 8.4 0 0 1 3.5 11.5 8.5 8.5 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" />
</svg>Send on WhatsApp</button>
                          <button className="btn btng" type="button" onClick={v.cancel} style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Cancel PIN</button>
                        </div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Fix mode: Courier and delivery, Orders · 60 minutes · T-2291</div>
                        <button className="btn" type="button" onClick={v.used} style={{ minHeight: "36px", fontSize: "var(--text-xs-plus)", border: "1px dashed #0070a0", background: "#f2fafd", color: "#00567a" }}>Prototype: support enters the PIN</button>
                      </div>
                    </>) : null}
                    {v.isIn ? (<>
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div className="banner-fix">
                          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "var(--radius-xl)", background: "rgba(255,255,255,.14)" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="12" cy="8" r="4" />
                              <path d="M4 21a8 8 0 0 1 16 0" />
                            </svg>
                          </span>
                          <div style={{ minWidth: "0" }}>
                            <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>Farhana from GridCommerce is in your store</div>
                            <div style={{ fontSize: "var(--text-xs-plus)", color: "#cbd8ee" }}>Can change: Courier and delivery, Orders · since 14:30</div>
                          </div>
                          <div style={{ marginLeft: "auto", textAlign: "right" }}>
                            <div className="num" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }}>54:12</div>
                            <div style={{ fontSize: "var(--text-xs)", color: "#cbd8ee" }}>left</div>
                          </div>
                        </div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>What she has done so far</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "var(--text-xs-plus)", color: "#0f172a" }}>
                          <span>14:32 · Replaced the Steadfast API key</span>
                          <span>14:35 · Re-synced 23 stuck orders</span>
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button className="btn" type="button" onClick={v.stop} style={{ minHeight: "44px", fontSize: "var(--text-sm)", background: "#c2410c", color: "#fff" }}>End access now</button>
                          <button className="btn btng" type="button" style={{ minHeight: "44px", fontSize: "var(--text-sm)" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
</svg>Call support</button>
                        </div>
                      </div>
                    </>) : null}
                    {v.isDone ? (<>
                      <div className="note n-ok"><strong>Access ended.</strong> Farhana was in your store for 17 minutes and made 2 changes. A summary was sent to you by SMS.</div>
                      <div style={{ marginTop: "12px" }}>
                        <button className="btn btnp" type="button" onClick={v.again} style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Done</button>
                      </div>
                    </>) : null}
                  </section>
                  <section className="panel" style={{ overflow: "hidden" }}>
                    <div style={{ padding: "14px 18px 6px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>Every time support entered your store</div>
                    <div className="th" style={{ display: "grid", gridTemplateColumns: "120px minmax(0,1fr) 80px minmax(0,1fr) minmax(0,1.8fr)", gap: "12px", padding: "10px 18px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>
                      <span>When</span>
                      <span>Who</span>
                      <span style={{ textAlign: "right" }}>Time</span>
                      <span>Could change</span>
                      <span>What they did</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "120px minmax(0,1fr) 80px minmax(0,1fr) minmax(0,1.8fr)", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px" }}>
                      <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>20 Sep 14:30</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Farhana Akter</span>
                      <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>17 min</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Courier, Orders</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Replaced Steadfast key; re-synced 23 orders</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "120px minmax(0,1fr) 80px minmax(0,1fr) minmax(0,1.8fr)", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                      <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>22 Aug 11:10</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Rakib Hasan</span>
                      <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>25 min</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>POS</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Paired 2 new barcode scanners</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "120px minmax(0,1fr) 80px minmax(0,1fr) minmax(0,1.8fr)", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                      <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>06 Aug 2025</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Tania Sultana</span>
                      <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)", textAlign: "right" }}>48 min</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Products</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Imported 412 products</span>
                    </div>
                  </section>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}
