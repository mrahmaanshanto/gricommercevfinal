'use client';
// Generated from design/templates/console/AccessLog.dc.html by scripts/convert-design.mjs.
// Support · store access log
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
body{margin:0;font-family:'Poppins',system-ui,-apple-system,'Segoe UI',sans-serif;background:#e9eef5;color:#475569;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087;text-decoration:none}a:hover{color:#002a77}
.mono{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;letter-spacing:0}
.num{font-variant-numeric:tabular-nums}
.card{background:#fff;border-radius:16px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 6px 18px -8px rgba(15,23,42,.10)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 18px;border-radius:10px;border:0;font:inherit;font-size:14px;font-weight:500;cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 160ms ease,color 160ms ease,transform 140ms cubic-bezier(.23,1,.32,1)}
.btn:active{transform:scale(.97)}
.btn:focus-visible,button:focus-visible,a:focus-visible{outline:3px solid rgba(0,48,135,.45);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.ghost{background:rgba(0,48,135,.08);color:#003087}.ghost:hover{background:rgba(0,48,135,.15);color:#003087}
.onnavy{background:rgba(255,255,255,.1);color:#fff}.onnavy:hover{background:rgba(255,255,255,.18);color:#fff}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
.sk{border-radius:6px;background:linear-gradient(90deg,#eef2f7 0,#f7f9fc 40%,#eef2f7 80%);background-size:800px 100%;animation:shimmer 1.4s linear infinite}
@media (prefers-reduced-motion: reduce){.btn,.nav{transition:none}.btn:active{transform:none}.sk{animation:none}}

.cs{--bg:#eef2f7;--surface:#ffffff;--surface2:#f4f7fb;--line:#e2e8f0;--ink:#0f172a;--body:#475569;--muted:#64748b;--rail:#012169;--railink:#b7c6e0;--railicon:#7d94bf;--railhead:#7fd4f5;--railon:rgba(127,212,245,.16);--railhover:rgba(255,255,255,.06);--primary:#003087;--primaryhover:#002a77;--primaryink:#ffffff;--okbg:#e7f8f1;--okt:#047857;--warnbg:#fff4e0;--warnt:#b45309;--errbg:#ffece5;--errt:#c2410c;--track:#eef2f7;--series:#003087;--seriesfill:rgba(0,48,135,.08);--scrim:rgba(1,20,60,.36);--shadow:0 1px 2px rgba(15,23,42,.04),0 6px 18px -8px rgba(15,23,42,.10)}
.cs.dark{--bg:#0a1020;--surface:#111a2e;--surface2:#16213a;--line:#24324f;--ink:#e8eef8;--body:#aebbd2;--muted:#8a9bb8;--rail:#060b17;--railink:#a7b6d0;--railicon:#6c80a5;--railhead:#66c4eb;--railon:rgba(0,156,222,.18);--railhover:rgba(255,255,255,.05);--primary:#009cde;--primaryhover:#2eaee4;--primaryink:#04121f;--okbg:rgba(16,185,129,.14);--okt:#4ade9f;--warnbg:rgba(255,152,0,.14);--warnt:#fbbf24;--errbg:rgba(255,87,36,.16);--errt:#ff8a65;--track:#1d2944;--series:#66c4eb;--seriesfill:rgba(102,196,235,.10);--scrim:rgba(0,0,0,.55);--shadow:0 1px 2px rgba(0,0,0,.3),0 8px 24px -10px rgba(0,0,0,.5)}
.cs{color:var(--body)}
.nav{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:0 12px;border:0;border-radius:10px;background:transparent;color:var(--railink);font:inherit;font-size:14px;font-weight:500;text-align:left;cursor:pointer;transition:background-color 150ms ease,color 150ms ease}
.nav:hover{background:var(--railhover);color:#fff}
.nav.on{background:var(--railon);color:#fff}
.nav.sub{min-height:40px;padding-left:42px;font-size:13.5px}
.nav:focus-visible{outline:3px solid rgba(127,212,245,.6);outline-offset:-3px}
.chev{display:inline-flex;margin-left:auto;color:var(--railicon);transition:transform 160ms cubic-bezier(.23,1,.32,1)}
.chev.open{transform:rotate(90deg)}
.badge{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:20px;padding:0 6px;border-radius:999px;font-size:11px;font-weight:600;background:rgba(255,255,255,.12);color:#fff}
.badge.warn{background:#ff9800;color:#1a1204}.badge.err{background:#ff5724;color:#1c0a04}
.tb{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border:0;border-radius:10px;background:transparent;color:var(--body);cursor:pointer;transition:background-color 150ms ease}
.tb:hover{background:var(--surface2)}
.seg{display:inline-flex;padding:3px;border-radius:10px;background:var(--surface2);border:1px solid var(--line)}
.segb{min-height:36px;padding:0 14px;border:0;border-radius:8px;background:transparent;color:var(--body);font:inherit;font-size:13px;font-weight:500;cursor:pointer;transition:background-color 150ms ease,color 150ms ease}
.segb.on{background:var(--surface);color:var(--ink);box-shadow:0 1px 2px rgba(15,23,42,.12)}
.panel{background:var(--surface);border-radius:14px;box-shadow:var(--shadow)}
.sp{transition:d 200ms cubic-bezier(.23,1,.32,1)}
.searchbtn{display:flex;align-items:center;gap:10px;width:440px;height:44px;padding:0 10px 0 14px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--muted);font:inherit;font-size:14px;cursor:pointer;text-align:left}
.searchbtn:hover{border-color:var(--muted)}
.kbd{margin-left:auto;display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:6px;border:1px solid var(--line);background:var(--surface2);font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--body)}
.pr{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:0 12px;border:0;border-radius:10px;background:transparent;font:inherit;font-size:14px;color:var(--ink);text-align:left;cursor:pointer}
.pr:hover,.pr.on{background:var(--surface2)}
.rowlink{color:var(--primary);font-size:13px;font-weight:600}
.rowlink:hover{color:var(--primaryhover)}
.btnp{background:var(--primary);color:var(--primaryink)}.btnp:hover{background:var(--primaryhover);color:var(--primaryink)}
.btng{background:var(--surface2);color:var(--ink);border:1px solid var(--line)}.btng:hover{border-color:var(--muted)}
.tone-good{color:var(--okt)}.tone-bad{color:var(--errt)}.tone-flat{color:var(--muted)}
@media (prefers-reduced-motion: reduce){.chev,.sp,.segb,.tb{transition:none}}

.bn{font-family:'Hind Siliguri','Poppins',sans-serif}
.shp{display:inline-block;flex:none;width:10px;height:10px}
.shp-ok{border-radius:50%;background:#10b981}
.shp-warn{background:#ff9800;clip-path:polygon(50% 0,100% 100%,0 100%)}
.shp-err{width:9px;height:9px;margin:0 1px;background:#ff5724;transform:rotate(45deg)}
.shp-none{border:2px solid #94a3b8;border-radius:50%}
.shp-hot{width:9px;height:9px;margin:0 1px;background:#ff5724;transform:rotate(45deg)}
.pill{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 9px;border-radius:999px;font-size:11.5px;font-weight:600;white-space:nowrap}
.p-navy{background:#e0e6f1;color:#003087}.p-sky{background:#e0f3fb;color:#00567a}.p-grey{background:#f1f5f9;color:#475569}
.p-ok{background:#e7f8f1;color:#047857}.p-warn{background:#fff4e0;color:#b45309}.p-err{background:#ffece5;color:#c2410c}
.av{display:inline-flex;align-items:center;justify-content:center;flex:none;width:28px;height:28px;border-radius:999px;font-size:11px;font-weight:700;color:#fff}
.tab{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 4px;border:0;border-bottom:2px solid transparent;background:transparent;font:inherit;font-size:13.5px;font-weight:500;color:var(--body);cursor:pointer}
.tab.on{border-bottom-color:var(--primary);color:var(--primary);font-weight:600}
.cnt{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:20px;padding:0 6px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-size:11px;font-weight:600;color:var(--body)}
.tab.on .cnt{background:#003087;border-color:#003087;color:#fff}
.tk{display:flex;flex-direction:column;gap:6px;width:100%;padding:12px 14px;border:0;border-left:3px solid transparent;border-bottom:1px solid var(--line);background:transparent;font:inherit;text-align:left;cursor:pointer;transition:background-color 150ms ease}
.tk:hover{background:var(--surface2)}
.tk.on{background:#f2f5f9;border-left-color:#003087}
.msg{max-width:560px;padding:12px 14px;border-radius:14px;font-size:13.5px;line-height:1.6}
.m-merchant{align-self:flex-start;background:var(--surface2);color:var(--ink);border-top-left-radius:4px}
.m-staff{align-self:flex-end;background:#003087;color:#fff;border-top-right-radius:4px}
.m-note{align-self:stretch;max-width:none;background:#fff8e6;color:#5c3303;border:1px dashed #f5c26b}
.m-system{align-self:center;max-width:none;padding:6px 12px;border-radius:999px;background:transparent;color:var(--muted);font-size:12px}
.mode{min-height:36px;padding:0 12px;border:0;border-radius:8px;background:transparent;font:inherit;font-size:13px;font-weight:500;color:var(--body);cursor:pointer}
.mode.on{background:var(--surface);color:var(--ink);box-shadow:0 1px 2px rgba(15,23,42,.12)}
.lc{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:12px;background:#fff;border:1px solid #e6ebf2;color:inherit;transition:border-color 150ms ease,box-shadow 150ms ease}
.lc:hover{border-color:#99accf;box-shadow:0 8px 20px -14px rgba(15,23,42,.35);color:inherit}
.dot{display:inline-block;width:18px;height:18px;border-radius:6px}
.d-done{background:#003087}
.d-todo{border:2px dashed #cbd5e1}
.d-stuck{background:#fff4e0;border:2px solid #ff9800}
.fchip{display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:0 12px;border:1px solid var(--line);border-radius:999px;background:var(--surface);font:inherit;font-size:13px;font-weight:500;color:var(--body);cursor:pointer}
.fchip.on{background:#003087;border-color:#003087;color:#fff}
.radio{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border:1px solid var(--line);border-radius:12px;background:var(--surface);font:inherit;text-align:left;cursor:pointer;width:100%}
.radio.on{border-color:#003087;background:#f2f5f9;box-shadow:0 0 0 1px #003087}
.rdot{flex:none;width:18px;height:18px;margin-top:2px;border-radius:999px;border:2px solid #94a3b8}
.radio.on .rdot{border:6px solid #003087}
select.sel{height:40px;padding:0 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface);font:inherit;font-size:13px;color:var(--ink)}
@media (prefers-reduced-motion: reduce){.tk,.lc{transition:none}}

.cs{--bg:#f3f6fb;--side:#ffffff;--sideline:#e6ebf3;--sideink:#0f172a;--sidebody:#475569;--sidemuted:#64748b;--sidehover:#f4f7fb;--sideon:#eaf1ff;--sideonink:#003087;--iconbg:#eef3fb;--iconfg:#2e559d;--iconon:linear-gradient(145deg,#1f6fe0 0%,#003087 100%);--guide:#e2e8f0;--topbar:rgba(255,255,255,.86);--card:#ffffff;--cardline:#e8edf5}
.cs.dark{--bg:#0a1020;--side:#0c1426;--sideline:#1c2842;--sideink:#e8eef8;--sidebody:#aebbd2;--sidemuted:#8a9bb8;--sidehover:rgba(255,255,255,.04);--sideon:rgba(0,156,222,.16);--sideonink:#7fd4f5;--iconbg:rgba(255,255,255,.06);--iconfg:#9fb3d6;--iconon:linear-gradient(145deg,#2eaee4 0%,#0070a0 100%);--guide:#24324f;--topbar:rgba(17,26,46,.86);--card:#111a2e;--cardline:#22304d}
.side{position:absolute;left:0;top:0;bottom:0;width:272px;display:flex;flex-direction:column;background:var(--side);border-right:1px solid var(--sideline)}
.nav{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:0 10px;border:0;border-radius:12px;background:transparent;color:var(--sidebody);font:inherit;font-size:14px;font-weight:500;text-align:left;text-decoration:none;cursor:pointer;transition:background-color 150ms ease,color 150ms ease}
.nav:hover{background:var(--sidehover);color:var(--sideink)}
.nav:active{transform:scale(.99)}
.nav:focus-visible{outline:3px solid rgba(0,48,135,.35);outline-offset:-2px}
.navic{flex:none;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:10px;background:var(--iconbg);color:var(--iconfg);transition:background-color 150ms ease,color 150ms ease}
.nav.grp.open{color:var(--sideink);font-weight:600}
.nav.grp.open .navic,.nav.top.on .navic{background:var(--iconon);color:#fff;box-shadow:0 6px 14px -6px rgba(0,48,135,.55)}
.nav.top.on{color:var(--sideink);font-weight:600;background:var(--sidehover)}
.kids{position:relative;display:grid;gap:2px;margin:2px 0 8px 0;padding-left:44px}
.kids:before{content:"";position:absolute;left:25px;top:4px;bottom:4px;width:1.5px;border-radius:2px;background:var(--guide)}
.nav.sub{position:relative;min-height:38px;padding:0 10px;font-size:13.5px;border-radius:10px}
.nav.sub.on{background:var(--sideon);color:var(--sideonink);font-weight:600}
.nav.sub.on:before{content:"";position:absolute;left:-20px;top:9px;bottom:9px;width:3px;border-radius:3px;background:#003087}
.cs.dark .nav.sub.on:before{background:#2eaee4}
.chev{display:inline-flex;margin-left:auto;color:var(--sidemuted);transition:transform 160ms cubic-bezier(.23,1,.32,1)}
.chev.open{transform:rotate(90deg)}
.badge{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:20px;padding:0 7px;border-radius:999px;font-size:11px;font-weight:700;background:#eef2f7;color:#475569}
.badge.warn{background:#fff1d6;color:#9a4a00}.badge.err{background:#ffe3d9;color:#b3340e}
.cs.dark .badge{background:rgba(255,255,255,.08);color:#cbd5e1}.cs.dark .badge.warn{background:rgba(255,152,0,.18);color:#fbbf24}.cs.dark .badge.err{background:rgba(255,87,36,.2);color:#ff8a65}
.topbar{position:absolute;left:272px;right:0;top:0;height:64px;display:flex;align-items:center;gap:12px;padding:0 24px 0 28px;background:var(--topbar);backdrop-filter:saturate(160%) blur(12px);-webkit-backdrop-filter:saturate(160%) blur(12px);border-bottom:1px solid var(--sideline);z-index:3}
.crumbic{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:var(--iconbg);color:var(--iconfg)}
.searchbtn{width:400px;height:40px;border-radius:12px;background:var(--surface2);border:1px solid transparent}
.searchbtn:hover{border-color:var(--line);background:var(--surface)}
.tb{width:40px;height:40px;border-radius:12px}
.panel{background:var(--card);border:1px solid var(--cardline);border-radius:16px;box-shadow:0 1px 2px rgba(15,23,42,.04)}
.kpi{position:relative;display:flex;flex-direction:column;gap:4px;padding:14px 16px 12px;border-radius:16px;background:var(--card);border:1px solid var(--cardline);box-shadow:0 1px 2px rgba(15,23,42,.04);overflow:hidden}
.dpill{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;border-radius:999px;font-size:11.5px;font-weight:600;white-space:nowrap}
.d-good{background:#e7f8f1;color:#047857}.d-bad{background:#ffece5;color:#c2410c}.d-flat{background:transparent;color:var(--muted);padding:0}
.th{background:#f8fafc;border-bottom:1px solid var(--line)}
.cs.dark .th{background:rgba(255,255,255,.03)}
.statuscard{margin:0 14px 10px;padding:12px 14px;border-radius:14px;background:linear-gradient(160deg,#f5f9ff 0%,#eef4fd 100%);border:1px solid #e1eaf7}
.cs.dark .statuscard{background:rgba(255,255,255,.04);border-color:var(--sideline)}
.me{display:flex;align-items:center;gap:10px;margin:0 14px 14px;padding:10px;border-radius:14px;border:1px solid var(--sideline)}
@media (prefers-reduced-motion: reduce){.nav,.navic,.chev{transition:none}.nav:active{transform:none}}

.sidein{display:flex;flex-direction:column;height:min(100%,900px);min-height:0}
.cs{overflow-wrap:break-word}
.cs [style*="display:grid"] > *{min-width:0}
.pill{white-space:normal;height:auto;min-height:24px;padding:3px 9px;line-height:1.3;max-width:100%}
.dpill{white-space:normal;height:auto;min-height:22px;padding:3px 8px;line-height:1.35;max-width:100%}
.d-flat{padding:0}
.kl{font-size:12.5px;font-weight:500;color:var(--body);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
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
.fcard{background:var(--card);border:1px solid var(--cardline);border-radius:16px;box-shadow:0 1px 2px rgba(15,23,42,.04);padding:4px 28px}
.fsec{display:grid;grid-template-columns:250px minmax(0,1fr);gap:32px;padding:24px 0}
.fsec + .fsec{border-top:1px solid var(--line)}
.fsh{font-size:15px;font-weight:600;color:var(--ink);margin:0}
.fsd{margin:6px 0 0;font-size:12.5px;line-height:1.55;color:var(--body)}
.fgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 18px}
.fld{display:flex;flex-direction:column;gap:6px;min-width:0}
.flab{font-size:13px;font-weight:600;color:var(--ink)}
.req{color:#c2410c;margin-left:2px}
.fhelp{font-size:12px;line-height:1.45;color:var(--muted)}
.ferr{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:#c2410c}
.in{width:100%;height:44px;padding:0 12px;border:1px solid #d5dde8;border-radius:10px;background:var(--surface);font:inherit;font-size:14px;color:var(--ink)}
textarea.in{height:auto;padding:10px 12px;line-height:1.5;resize:vertical}
select.in{padding-right:8px}
.in:focus,.affix:focus-within{outline:none;border-color:#003087;box-shadow:0 0 0 3px rgba(0,48,135,.15)}
.in.err,.affix.err{border-color:#ff5724;box-shadow:0 0 0 3px rgba(255,87,36,.12)}
.in.ok{border-color:#10b981}
.in[disabled]{background:var(--surface2);color:var(--muted)}
.affix{display:flex;align-items:stretch;height:44px;border:1px solid #d5dde8;border-radius:10px;overflow:hidden;background:var(--surface)}
.affix > span{display:flex;align-items:center;flex:none;padding:0 12px;background:var(--surface2);color:var(--body);font-size:13px}
.affix > span.pre{border-right:1px solid #d5dde8}.affix > span.post{border-left:1px solid #d5dde8}
.affix input{flex:1;min-width:0;border:0;padding:0 12px;font:inherit;font-size:14px;background:transparent;color:var(--ink);outline:none}
.sw{position:relative;display:inline-flex;flex:none;width:40px;height:24px;border-radius:99px;background:#cbd5e1}
.sw:after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:99px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform 160ms cubic-bezier(.23,1,.32,1)}
.sw.on{background:#003087}.sw.on:after{transform:translateX(16px)}
.swrow{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:12px 0}
.swrow + .swrow{border-top:1px solid var(--line)}
.rgrid{display:grid;gap:10px}
.rc{display:flex;gap:12px;align-items:flex-start;padding:14px;border:1px solid #d5dde8;border-radius:12px;background:var(--surface);min-width:0}
.rc.on{border-color:#003087;background:#f5f8ff;box-shadow:0 0 0 1px #003087}
.rc .rdot{margin-top:1px}
.rc.on .rdot{border:6px solid #003087}
.cb{flex:none;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:5px;border:2px solid #94a3b8;background:#fff}
.cb.on{background:#003087;border-color:#003087;color:#fff}
.cb.dis{background:var(--surface2);border-color:#cbd5e1}
.chk{display:flex;align-items:center;gap:10px;min-height:36px;font-size:13.5px;color:var(--ink);min-width:0}
.tagsel{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;border-radius:999px;border:1px solid #d5dde8;font-size:13px;color:var(--body);background:var(--surface)}
.tagsel.on{background:#003087;border-color:#003087;color:#fff;font-weight:600}
.formbar{position:absolute;left:0;right:0;bottom:0;height:72px;display:flex;align-items:center;gap:10px;padding:0 28px;background:rgba(255,255,255,.92);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-top:1px solid var(--line);z-index:3}
.note{padding:12px 14px;border-radius:12px;font-size:13px;line-height:1.55}
.n-info{background:#f2f5f9;color:var(--ink)}.n-warn{background:#fff4e0;color:#7a3e05}.n-err{background:#ffece5;color:#7c2d12}.n-ok{background:#e7f8f1;color:#065f46}

`;

// ---- markup ----

export default class AccessLogScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="AccessLog">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={`cs ${v.miniCls ?? ""}`} style={{ width: "1440px", height: "1420px", overflow: "hidden", position: "relative", background: "var(--bg)" }}>
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
                <span style={{ display: "inline-flex", alignItems: "center", height: "22px", padding: "0 8px", borderRadius: "6px", background: "var(--iconbg)", color: "var(--iconfg)", fontSize: "11px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase" }}>Console</span>
                <span className="ell" style={{ fontSize: "12px", color: "var(--sidemuted)" }}>Staff only · views logged</span>
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
                <div className="navlabel" style={{ margin: "10px 10px 6px", fontSize: "10.5px", fontWeight: "700", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--sidemuted)" }}>Manage</div>
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
                  <__Link href="/access-log" className="nav sub on" aria-current="page">
                    <span className="navtxt">Access log</span>
                  </__Link>
                  <__Link href="/support-performance" className="nav sub">
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
                  <span style={{ flex: "none", width: "10px", height: "10px", borderRadius: "99px", background: "#ff9800", boxShadow: "0 0 0 3px rgba(255,152,0,.2)" }} />
                  <span className="statustxt" style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--sideink)" }}>1 open incident</span>
                  <span className="num statustxt" style={{ marginLeft: "auto", fontSize: "11.5px", color: "var(--sidemuted)" }}>99.96%</span>
                </div>
                <div className="statustxt ell" style={{ marginTop: "4px", fontSize: "12px", color: "var(--sidebody)" }}>Steadfast webhooks delayed · 38 stores</div>
              </__Link>
              <div className="me">
                <span style={{ position: "relative", display: "inline-flex", flex: "none" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "12px", background: "linear-gradient(145deg,#2eaee4,#003087)", color: "#fff", fontSize: "13px", fontWeight: "700" }}>FA</span>
                  <span style={{ position: "absolute", right: "-2px", bottom: "-2px", width: "11px", height: "11px", borderRadius: "99px", background: "#10b981", border: "2px solid var(--side)" }} />
                </span>
                <div className="metxt" style={{ minWidth: "0" }}>
                  <div className="ell" style={{ fontSize: "13px", fontWeight: "600", color: "var(--sideink)" }}>Farhana Akter</div>
                  <div className="ell" style={{ fontSize: "11.5px", color: "var(--sidemuted)" }}>Support lead · 2FA on</div>
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
            <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", minWidth: "230px" }}>
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
              <span style={{ fontWeight: "600", color: "var(--ink)" }}>Access log</span>
            </nav>
            <button className="searchbtn" type="button"><span style={{ display: "inline-flex" }}>
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
</span>Search stores, phones, invoices, leads<span className="kbd">Ctrl K</span></button>
            {" "}
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "8px", height: "30px", padding: "0 12px", borderRadius: "999px", background: "var(--okbg)", color: "var(--okt)", fontSize: "12px", fontWeight: "600" }}><span style={{ width: "7px", height: "7px", borderRadius: "9px", background: "#10b981", boxShadow: "0 0 0 3px rgba(16,185,129,.18)" }} />Production</span>
            {" "}
            <span className="num" style={{ fontSize: "12.5px", color: "var(--muted)", padding: "0 4px" }}>Sun 20 Sep · 14:32</span>
            {" "}
            <span style={{ width: "1px", height: "24px", background: "var(--line)" }} />
            {" "}
            <button className="tb" type="button" aria-label="Notifications, 3 unread" style={{ position: "relative" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10 21h4" />
              </svg>
              <span style={{ position: "absolute", top: "8px", right: "9px", width: "8px", height: "8px", borderRadius: "9px", background: "#ff5724", border: "2px solid var(--surface)" }} />
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
            <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: "16px", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px" }}>
                <div style={{ minWidth: "0" }}>
                  <h1 style={{ margin: "0", fontSize: "26px", lineHeight: "1.2", fontWeight: "700", letterSpacing: "-.025em", color: "var(--ink)" }}>Store access log</h1>
                  <p style={{ margin: "5px 0 0", fontSize: "13px", color: "var(--muted)" }}>Which member entered which store, for how long, and what they fixed</p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: "none" }}>
                  <__Link href="/store-access" className="btn btnp" style={{ minHeight: "40px", fontSize: "13px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <circle cx="7.5" cy="15.5" r="4.5" />
  <path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3" />
</svg>Enter a store</__Link>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: "12px" }}>
                <div className="kpi">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span className="kl" title="Sessions, September">Sessions, September</span>
                    <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                      <path d="M0.0,7.6 L4.3,12.3 L8.5,7.8 L12.8,6.9 L17.1,3.0 L21.3,5.8 L25.6,7.7 L29.9,12.2 L34.1,13.0 L38.4,13.0 L42.7,16.5 L46.9,19.0 L51.2,14.3 L55.5,15.3 L59.7,17.2 L64.0,11.3 L64,22 L0,22 Z" fill="#6683b7" opacity=".10" />
                      <path d="M0.0,7.6 L4.3,12.3 L8.5,7.8 L12.8,6.9 L17.1,3.0 L21.3,5.8 L25.6,7.7 L29.9,12.2 L34.1,13.0 L38.4,13.0 L42.7,16.5 L46.9,19.0 L51.2,14.3 L55.5,15.3 L59.7,17.2 L64.0,11.3" fill="none" stroke="#6683b7" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="num ell" style={{ fontSize: "24px", lineHeight: "1.2", fontWeight: "700", letterSpacing: "-.02em", color: "var(--ink)" }} title="46">46</span>
                  <div>
                    <span className="dpill d-flat">▲ 9 vs August</span>
                  </div>
                </div>
                <div className="kpi">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span className="kl" title="Median time inside">Median time inside</span>
                    <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                      <path d="M0.0,19.0 L4.3,16.3 L8.5,14.1 L12.8,13.8 L17.1,12.8 L21.3,12.7 L25.6,12.8 L29.9,13.6 L34.1,11.1 L38.4,11.0 L42.7,8.7 L46.9,8.7 L51.2,6.7 L55.5,7.0 L59.7,4.8 L64.0,3.0 L64,22 L0,22 Z" fill="#10b981" opacity=".10" />
                      <path d="M0.0,19.0 L4.3,16.3 L8.5,14.1 L12.8,13.8 L17.1,12.8 L21.3,12.7 L25.6,12.8 L29.9,13.6 L34.1,11.1 L38.4,11.0 L42.7,8.7 L46.9,8.7 L51.2,6.7 L55.5,7.0 L59.7,4.8 L64.0,3.0" fill="none" stroke="#10b981" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="num ell" style={{ fontSize: "24px", lineHeight: "1.2", fontWeight: "700", letterSpacing: "-.02em", color: "var(--ink)" }} title="18 min">18 min</span>
                  <div>
                    <span className="dpill d-good">limit 60 min</span>
                  </div>
                </div>
                <div className="kpi">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span className="kl" title="Stores entered">Stores entered</span>
                    <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                      <path d="M0.0,16.2 L4.3,18.1 L8.5,19.0 L12.8,15.0 L17.1,17.8 L21.3,15.6 L25.6,13.9 L29.9,10.9 L34.1,15.6 L38.4,18.9 L42.7,14.2 L46.9,12.5 L51.2,9.7 L55.5,8.1 L59.7,3.0 L64.0,7.6 L64,22 L0,22 Z" fill="#6683b7" opacity=".10" />
                      <path d="M0.0,16.2 L4.3,18.1 L8.5,19.0 L12.8,15.0 L17.1,17.8 L21.3,15.6 L25.6,13.9 L29.9,10.9 L34.1,15.6 L38.4,18.9 L42.7,14.2 L46.9,12.5 L51.2,9.7 L55.5,8.1 L59.7,3.0 L64.0,7.6" fill="none" stroke="#6683b7" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="num ell" style={{ fontSize: "24px", lineHeight: "1.2", fontWeight: "700", letterSpacing: "-.02em", color: "var(--ink)" }} title="31">31</span>
                  <div>
                    <span className="dpill d-flat">of 62</span>
                  </div>
                </div>
                <div className="kpi">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span className="kl" title="Over 1 hour">Over 1 hour</span>
                    <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                      <path d="M0.0,19.0 L4.3,18.8 L8.5,18.3 L12.8,16.6 L17.1,15.8 L21.3,15.1 L25.6,14.2 L29.9,14.3 L34.1,15.0 L38.4,13.2 L42.7,11.3 L46.9,10.5 L51.2,8.5 L55.5,6.1 L59.7,3.5 L64.0,3.0 L64,22 L0,22 Z" fill="#ff5724" opacity=".10" />
                      <path d="M0.0,19.0 L4.3,18.8 L8.5,18.3 L12.8,16.6 L17.1,15.8 L21.3,15.1 L25.6,14.2 L29.9,14.3 L34.1,15.0 L38.4,13.2 L42.7,11.3 L46.9,10.5 L51.2,8.5 L55.5,6.1 L59.7,3.5 L64.0,3.0" fill="none" stroke="#ff5724" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="num ell" style={{ fontSize: "24px", lineHeight: "1.2", fontWeight: "700", letterSpacing: "-.02em", color: "var(--ink)" }} title="3">3</span>
                  <div>
                    <span className="dpill d-bad">all Wholesale imports</span>
                  </div>
                </div>
                <div className="kpi">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span className="kl" title="Fixed in the session">Fixed in the session</span>
                    <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                      <path d="M0.0,17.4 L4.3,17.5 L8.5,18.1 L12.8,19.0 L17.1,16.7 L21.3,14.9 L25.6,15.6 L29.9,16.5 L34.1,15.3 L38.4,14.6 L42.7,12.6 L46.9,12.8 L51.2,10.0 L55.5,8.0 L59.7,5.9 L64.0,3.0 L64,22 L0,22 Z" fill="#10b981" opacity=".10" />
                      <path d="M0.0,17.4 L4.3,17.5 L8.5,18.1 L12.8,19.0 L17.1,16.7 L21.3,14.9 L25.6,15.6 L29.9,16.5 L34.1,15.3 L38.4,14.6 L42.7,12.6 L46.9,12.8 L51.2,10.0 L55.5,8.0 L59.7,5.9 L64.0,3.0" fill="none" stroke="#10b981" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="num ell" style={{ fontSize: "24px", lineHeight: "1.2", fontWeight: "700", letterSpacing: "-.02em", color: "var(--ink)" }} title="78%">78%</span>
                  <div>
                    <span className="dpill d-good">▲ 6 points</span>
                  </div>
                </div>
                <div className="kpi">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span className="kl" title="PINs expired unused">PINs expired unused</span>
                    <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                      <path d="M0.0,3.0 L4.3,7.7 L8.5,7.8 L12.8,11.0 L17.1,13.4 L21.3,9.9 L25.6,8.8 L29.9,13.6 L34.1,15.0 L38.4,13.5 L42.7,18.3 L46.9,15.9 L51.2,18.4 L55.5,14.2 L59.7,19.0 L64.0,18.5 L64,22 L0,22 Z" fill="#6683b7" opacity=".10" />
                      <path d="M0.0,3.0 L4.3,7.7 L8.5,7.8 L12.8,11.0 L17.1,13.4 L21.3,9.9 L25.6,8.8 L29.9,13.6 L34.1,15.0 L38.4,13.5 L42.7,18.3 L46.9,15.9 L51.2,18.4 L55.5,14.2 L59.7,19.0 L64.0,18.5" fill="none" stroke="#6683b7" strokeWidth="1.7" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="num ell" style={{ fontSize: "24px", lineHeight: "1.2", fontWeight: "700", letterSpacing: "-.02em", color: "var(--ink)" }} title="7">7</span>
                  <div>
                    <span className="dpill d-flat">owner generated, nobody used</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button className="fchip on" type="button" aria-pressed="true">All sessions<span className="num" style={{ opacity: ".8" }}>46</span></button>
                  <button className="fchip" type="button" aria-pressed="false">Online<span className="num" style={{ opacity: ".8" }}>19</span></button>
                  <button className="fchip" type="button" aria-pressed="false">Retail<span className="num" style={{ opacity: ".8" }}>20</span></button>
                  <button className="fchip" type="button" aria-pressed="false">Wholesale<span className="num" style={{ opacity: ".8" }}>11</span></button>
                  <button className="fchip" type="button" aria-pressed="false">Over 1 hour<span className="num" style={{ opacity: ".8" }}>3</span></button>
                </div>
                <span style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                  <button className="btn btng" type="button" style={{ minHeight: "40px", fontSize: "13px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect x="3" y="4" width="18" height="18" rx="2" />
  <path d="M16 2v4M8 2v4M3 10h18" />
</svg>September</button>
                  <button className="btn btng" type="button" style={{ minHeight: "40px", fontSize: "13px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
</svg>Export</button>
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: "14px", alignItems: "stretch" }}>
                <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                    <h2 style={{ margin: "0", fontSize: "15px", fontWeight: "600", letterSpacing: "-.01em", color: "var(--ink)" }}>What we fix, by customer segment</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: "var(--muted)" }}>sessions</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "100px repeat(6,minmax(0,1fr))", gap: "4px" }}>
                    <span />
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--muted)", textAlign: "center", lineHeight: "1.25", paddingBottom: "4px" }}>Courier</span>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--muted)", textAlign: "center", lineHeight: "1.25", paddingBottom: "4px" }}>Payments</span>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--muted)", textAlign: "center", lineHeight: "1.25", paddingBottom: "4px" }}>Products and import</span>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--muted)", textAlign: "center", lineHeight: "1.25", paddingBottom: "4px" }}>POS and hardware</span>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--muted)", textAlign: "center", lineHeight: "1.25", paddingBottom: "4px" }}>Domain</span>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--muted)", textAlign: "center", lineHeight: "1.25", paddingBottom: "4px" }}>Theme and pages</span>
                    <span style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: "600", color: "var(--ink)" }}>Online</span>
                    <span className="num" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "46px", borderRadius: "8px", background: "rgba(0,48,135,0.80)", color: "#fff", fontSize: "14px", fontWeight: "700" }}>9</span>
                    <span className="num" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "46px", borderRadius: "8px", background: "rgba(0,48,135,0.55)", color: "#fff", fontSize: "14px", fontWeight: "700" }}>6</span>
                    <span className="num" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "46px", borderRadius: "8px", background: "rgba(0,48,135,0.47)", color: "#0f172a", fontSize: "14px", fontWeight: "700" }}>5</span>
                    <span className="num" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "46px", borderRadius: "8px", background: "rgba(0,48,135,0.06)", color: "#0f172a", fontSize: "14px", fontWeight: "700" }}>0</span>
                    <span className="num" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "46px", borderRadius: "8px", background: "rgba(0,48,135,0.39)", color: "#0f172a", fontSize: "14px", fontWeight: "700" }}>4</span>
                    <span className="num" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "46px", borderRadius: "8px", background: "rgba(0,48,135,0.47)", color: "#0f172a", fontSize: "14px", fontWeight: "700" }}>5</span>
                    <span style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: "600", color: "var(--ink)" }}>Retail</span>
                    <span className="num" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "46px", borderRadius: "8px", background: "rgba(0,48,135,0.31)", color: "#0f172a", fontSize: "14px", fontWeight: "700" }}>3</span>
                    <span className="num" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "46px", borderRadius: "8px", background: "rgba(0,48,135,0.22)", color: "#0f172a", fontSize: "14px", fontWeight: "700" }}>2</span>
                    <span className="num" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "46px", borderRadius: "8px", background: "rgba(0,48,135,0.22)", color: "#0f172a", fontSize: "14px", fontWeight: "700" }}>2</span>
                    <span className="num" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "46px", borderRadius: "8px", background: "rgba(0,48,135,0.96)", color: "#fff", fontSize: "14px", fontWeight: "700" }}>11</span>
                    <span className="num" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "46px", borderRadius: "8px", background: "rgba(0,48,135,0.14)", color: "#0f172a", fontSize: "14px", fontWeight: "700" }}>1</span>
                    <span className="num" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "46px", borderRadius: "8px", background: "rgba(0,48,135,0.14)", color: "#0f172a", fontSize: "14px", fontWeight: "700" }}>1</span>
                    <span style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: "600", color: "var(--ink)" }}>Wholesale</span>
                    <span className="num" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "46px", borderRadius: "8px", background: "rgba(0,48,135,0.22)", color: "#0f172a", fontSize: "14px", fontWeight: "700" }}>2</span>
                    <span className="num" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "46px", borderRadius: "8px", background: "rgba(0,48,135,0.14)", color: "#0f172a", fontSize: "14px", fontWeight: "700" }}>1</span>
                    <span className="num" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "46px", borderRadius: "8px", background: "rgba(0,48,135,0.63)", color: "#fff", fontSize: "14px", fontWeight: "700" }}>7</span>
                    <span className="num" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "46px", borderRadius: "8px", background: "rgba(0,48,135,0.14)", color: "#0f172a", fontSize: "14px", fontWeight: "700" }}>1</span>
                    <span className="num" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "46px", borderRadius: "8px", background: "rgba(0,48,135,0.06)", color: "#0f172a", fontSize: "14px", fontWeight: "700" }}>0</span>
                    <span className="num" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "46px", borderRadius: "8px", background: "rgba(0,48,135,0.06)", color: "#0f172a", fontSize: "14px", fontWeight: "700" }}>0</span>
                  </div>
                </section>
                <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                    <h2 style={{ margin: "0", fontSize: "15px", fontWeight: "600", letterSpacing: "-.01em", color: "var(--ink)" }}>What this tells us</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: "var(--muted)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div className="note n-warn"><strong>Retail.</strong> POS and barcode scanners are 55% of Retail sessions. A scanner setup video in Bangla would cut most of them.</div>
                    <div className="note n-info"><strong>Online.</strong> Courier fixes spike with courier outages; 7 of 9 were during INC-114.</div>
                    <div className="note n-info"><strong>Wholesale.</strong> Price list imports take the longest: median 34 min. Improve the import template.</div>
                  </div>
                </section>
              </div>
              <div className="panel" style={{ overflow: "hidden" }}>
                <div className="th" style={{ display: "grid", gridTemplateColumns: "110px minmax(0,1.2fr) minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr) 150px 60px 150px", gap: "12px", padding: "10px 18px", fontSize: "11px", fontWeight: "600", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)" }}>
                  <span>When</span>
                  <span>Member</span>
                  <span>Store</span>
                  <span>Issue</span>
                  <span>Scope</span>
                  <span>Time inside</span>
                  <span style={{ textAlign: "right" }}>Changes</span>
                  <span>Outcome</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "110px minmax(0,1.2fr) minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr) 150px 60px 150px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px" }}>
                  <span className="mono" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>20 Sep 14:30</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="av" style={{ width: "24px", height: "24px", background: "#003087" }} title="FA">FA</span>
                    <span className="ell" style={{ fontSize: "13px", color: "var(--ink)" }}>Farhana Akter</span>
                  </span>
                  <span style={{ minWidth: "0" }}>
                    <span className="ell" style={{ fontSize: "13px", fontWeight: "600", color: "var(--ink)" }}>Dhaka Gadget Hub</span>
                    <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>Retail · T-2291</span>
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>Courier</span>
                  <span style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>Fix · courier, orders</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ flexGrow: "1", height: "7px", borderRadius: "4px", background: "var(--track)" }}>
                      <span style={{ display: "block", width: "19%", height: "100%", borderRadius: "4px", background: "#003087" }} />
                    </span>
                    <span className="num" style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--ink)" }}>17 min</span>
                  </span>
                  <span className="num" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)", textAlign: "right" }}>2</span>
                  <span className="pill p-ok" style={{ justifySelf: "start" }}><span className="shp shp-ok" aria-hidden="true" />Fixed</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "110px minmax(0,1.2fr) minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr) 150px 60px 150px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                  <span className="mono" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>20 Sep 13:52</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="av" style={{ width: "24px", height: "24px", background: "#0070a0" }} title="RH">RH</span>
                    <span className="ell" style={{ fontSize: "13px", color: "var(--ink)" }}>Rakib Hasan</span>
                  </span>
                  <span style={{ minWidth: "0" }}>
                    <span className="ell" style={{ fontSize: "13px", fontWeight: "600", color: "var(--ink)" }}>Mohona Traders</span>
                    <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>Wholesale · T-2289</span>
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>Products and import</span>
                  <span style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>Fix · products</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ flexGrow: "1", height: "7px", borderRadius: "4px", background: "var(--track)" }}>
                      <span style={{ display: "block", width: "42%", height: "100%", borderRadius: "4px", background: "#003087" }} />
                    </span>
                    <span className="num" style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--ink)" }}>38 min</span>
                  </span>
                  <span className="num" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)", textAlign: "right" }}>1</span>
                  <span className="pill p-sky" style={{ justifySelf: "start" }}>In progress</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "110px minmax(0,1.2fr) minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr) 150px 60px 150px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                  <span className="mono" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>20 Sep 11:40</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="av" style={{ width: "24px", height: "24px", background: "#2e559d" }} title="TS">TS</span>
                    <span className="ell" style={{ fontSize: "13px", color: "var(--ink)" }}>Tania Sultana</span>
                  </span>
                  <span style={{ minWidth: "0" }}>
                    <span className="ell" style={{ fontSize: "13px", fontWeight: "600", color: "var(--ink)" }}>Kolpo Books</span>
                    <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>Online · T-2288</span>
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>Domain</span>
                  <span style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>View only</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ flexGrow: "1", height: "7px", borderRadius: "4px", background: "var(--track)" }}>
                      <span style={{ display: "block", width: "10%", height: "100%", borderRadius: "4px", background: "#003087" }} />
                    </span>
                    <span className="num" style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--ink)" }}>9 min</span>
                  </span>
                  <span className="num" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)", textAlign: "right" }}>0</span>
                  <span className="pill p-warn" style={{ justifySelf: "start" }}><span className="shp shp-warn" aria-hidden="true" />Owner to act</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "110px minmax(0,1.2fr) minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr) 150px 60px 150px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                  <span className="mono" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>19 Sep 18:05</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="av" style={{ width: "24px", height: "24px", background: "#0070a0" }} title="RH">RH</span>
                    <span className="ell" style={{ fontSize: "13px", color: "var(--ink)" }}>Rakib Hasan</span>
                  </span>
                  <span style={{ minWidth: "0" }}>
                    <span className="ell" style={{ fontSize: "13px", fontWeight: "600", color: "var(--ink)" }}>Tech Zone Uttara</span>
                    <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>Retail · T-2280</span>
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>POS and hardware</span>
                  <span style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>Fix · POS</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ flexGrow: "1", height: "7px", borderRadius: "4px", background: "var(--track)" }}>
                      <span style={{ display: "block", width: "47%", height: "100%", borderRadius: "4px", background: "#003087" }} />
                    </span>
                    <span className="num" style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--ink)" }}>42 min</span>
                  </span>
                  <span className="num" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)", textAlign: "right" }}>3</span>
                  <span className="pill p-ok" style={{ justifySelf: "start" }}><span className="shp shp-ok" aria-hidden="true" />Fixed</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "110px minmax(0,1.2fr) minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr) 150px 60px 150px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                  <span className="mono" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>19 Sep 16:20</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="av" style={{ width: "24px", height: "24px", background: "#003087" }} title="FA">FA</span>
                    <span className="ell" style={{ fontSize: "13px", color: "var(--ink)" }}>Farhana Akter</span>
                  </span>
                  <span style={{ minWidth: "0" }}>
                    <span className="ell" style={{ fontSize: "13px", fontWeight: "600", color: "var(--ink)" }}>Rongdhonu Fashion</span>
                    <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>Online · T-2276</span>
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>Payments</span>
                  <span style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>Fix · payments</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ flexGrow: "1", height: "7px", borderRadius: "4px", background: "var(--track)" }}>
                      <span style={{ display: "block", width: "13%", height: "100%", borderRadius: "4px", background: "#003087" }} />
                    </span>
                    <span className="num" style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--ink)" }}>12 min</span>
                  </span>
                  <span className="num" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)", textAlign: "right" }}>1</span>
                  <span className="pill p-ok" style={{ justifySelf: "start" }}><span className="shp shp-ok" aria-hidden="true" />Fixed</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "110px minmax(0,1.2fr) minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr) 150px 60px 150px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)", background: "#fff8e6" }}>
                  <span className="mono" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>18 Sep 20:40</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="av" style={{ width: "24px", height: "24px", background: "#00567a" }} title="MK">MK</span>
                    <span className="ell" style={{ fontSize: "13px", color: "var(--ink)" }}>Mahin Khan</span>
                  </span>
                  <span style={{ minWidth: "0" }}>
                    <span className="ell" style={{ fontSize: "13px", fontWeight: "600", color: "var(--ink)" }}>Mehedi Traders</span>
                    <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>Wholesale · T-2270</span>
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>Products and import</span>
                  <span style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>Fix · products</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ flexGrow: "1", height: "7px", borderRadius: "4px", background: "var(--track)" }}>
                      <span style={{ display: "block", width: "79%", height: "100%", borderRadius: "4px", background: "#ff9800" }} />
                    </span>
                    <span className="num" style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--ink)" }}>71 min</span>
                  </span>
                  <span className="num" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)", textAlign: "right" }}>4</span>
                  <span className="pill p-err" style={{ justifySelf: "start" }}><span className="shp shp-err" aria-hidden="true" />Needs engineering</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)", gap: "14px", alignItems: "stretch" }}>
                <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                    <h2 style={{ margin: "0", fontSize: "15px", fontWeight: "600", letterSpacing: "-.01em", color: "var(--ink)" }}>By team member</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: "var(--muted)" }} />
                  </div>
                  <div style={{ margin: "0 -20px -16px" }}>
                    <div className="th" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) 70px 100px 80px minmax(0,1.2fr)", gap: "12px", padding: "10px 18px", fontSize: "11px", fontWeight: "600", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)" }}>
                      <span>Member</span>
                      <span style={{ textAlign: "right" }}>Sessions</span>
                      <span style={{ textAlign: "right" }}>Total time</span>
                      <span style={{ textAlign: "right" }}>Median</span>
                      <span>Most common fix</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) 70px 100px 80px minmax(0,1.2fr)", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="av" style={{ width: "26px", height: "26px", background: "#003087" }} title="FA">FA</span>
                        <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--ink)" }}>Farhana Akter</span>
                      </span>
                      <span className="num" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)", textAlign: "right" }}>14</span>
                      <span className="num" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)", textAlign: "right" }}>4 h 10 min</span>
                      <span className="num" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)", textAlign: "right" }}>16 min</span>
                      <span style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>Courier</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) 70px 100px 80px minmax(0,1.2fr)", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="av" style={{ width: "26px", height: "26px", background: "#0070a0" }} title="RH">RH</span>
                        <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--ink)" }}>Rakib Hasan</span>
                      </span>
                      <span className="num" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)", textAlign: "right" }}>16</span>
                      <span className="num" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)", textAlign: "right" }}>7 h 02 min</span>
                      <span className="num" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)", textAlign: "right" }}>24 min</span>
                      <span style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>POS and hardware</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) 70px 100px 80px minmax(0,1.2fr)", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="av" style={{ width: "26px", height: "26px", background: "#2e559d" }} title="TS">TS</span>
                        <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--ink)" }}>Tania Sultana</span>
                      </span>
                      <span className="num" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)", textAlign: "right" }}>11</span>
                      <span className="num" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)", textAlign: "right" }}>3 h 05 min</span>
                      <span className="num" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)", textAlign: "right" }}>15 min</span>
                      <span style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>Domain</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) 70px 100px 80px minmax(0,1.2fr)", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="av" style={{ width: "26px", height: "26px", background: "#00567a" }} title="MK">MK</span>
                        <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--ink)" }}>Mahin Khan</span>
                      </span>
                      <span className="num" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)", textAlign: "right" }}>5</span>
                      <span className="num" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)", textAlign: "right" }}>2 h 48 min</span>
                      <span className="num" style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)", textAlign: "right" }}>34 min</span>
                      <span style={{ fontSize: "13px", fontWeight: "400", color: "var(--body)" }}>Products and import</span>
                    </div>
                  </div>
                </section>
                <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                    <h2 style={{ margin: "0", fontSize: "15px", fontWeight: "600", letterSpacing: "-.01em", color: "var(--ink)" }}>How long sessions last</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: "var(--muted)" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "158px" }}>
                    <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "6px", minWidth: "0" }}>
                      <span className="num" style={{ fontSize: "12px", fontWeight: "600", color: "var(--ink)" }}>14</span>
                      <span style={{ width: "70%", maxWidth: "44px", height: "81px", borderRadius: "6px 6px 2px 2px", background: "#003087" }} />
                      <span style={{ fontSize: "11.5px", color: "var(--body)", textAlign: "center" }}>under 10 min</span>
                    </div>
                    <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "6px", minWidth: "0" }}>
                      <span className="num" style={{ fontSize: "12px", fontWeight: "600", color: "var(--ink)" }}>19</span>
                      <span style={{ width: "70%", maxWidth: "44px", height: "110px", borderRadius: "6px 6px 2px 2px", background: "#003087" }} />
                      <span style={{ fontSize: "11.5px", color: "var(--body)", textAlign: "center" }}>10–30</span>
                    </div>
                    <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "6px", minWidth: "0" }}>
                      <span className="num" style={{ fontSize: "12px", fontWeight: "600", color: "var(--ink)" }}>10</span>
                      <span style={{ width: "70%", maxWidth: "44px", height: "58px", borderRadius: "6px 6px 2px 2px", background: "#2e559d" }} />
                      <span style={{ fontSize: "11.5px", color: "var(--body)", textAlign: "center" }}>30–60</span>
                    </div>
                    <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "6px", minWidth: "0" }}>
                      <span className="num" style={{ fontSize: "12px", fontWeight: "600", color: "var(--ink)" }}>3</span>
                      <span style={{ width: "70%", maxWidth: "44px", height: "17px", borderRadius: "6px 6px 2px 2px", background: "#ff9800" }} />
                      <span style={{ fontSize: "11.5px", color: "var(--body)", textAlign: "center" }}>over 60</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
