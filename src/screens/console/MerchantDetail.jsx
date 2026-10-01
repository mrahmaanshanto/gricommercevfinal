'use client';
// Generated from design/templates/console/MerchantDetail.dc.html by scripts/convert-design.mjs.
// Merchant page · Dhaka Gadget Hub
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
    const s = this.state || {};
    const tab = s.tab ?? 'overview';
    const T = [['overview', 'Overview'], ['billing', 'Billing and payments', '1'], ['modules', 'Modules and trials'], ['onboarding', 'Onboarding'], ['support', 'Support', '1'], ['affiliates', 'Affiliates'], ['activity', 'Activity']];
    const out = {
      tabs: T.map(([id, label, count]) => ({ label, count, hasCount: !!count, cls: id === tab ? 'mt on' : 'mt', sel: id === tab ? 'true' : 'false', pick: () => this.setState({ tab: id }) })),
      goBilling: () => this.setState({ tab: 'billing' }),
      goModules: () => this.setState({ tab: 'modules' }),
      sendReset: () => this.setState({ toast: true, sent: true }),
      hideToast: () => this.setState({ toast: false }),
      toast: !!s.toast,
      resetWhen: s.sent ? 'Just now' : '02 Sep 2026',
      resetBy: s.sent ? 'by you, by SMS' : 'by Farhana, by SMS',
    };
    T.forEach(([id]) => { out['is_' + id] = id === tab; });
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

export default class MerchantDetailScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="MerchantDetail">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={`cs ${v.miniCls ?? ""}`} style={{ width: "1440px", height: "1560px", overflow: "hidden", position: "relative", background: "var(--bg)" }}>
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
                <__Link href="/merchants" className="nav grp open" title="Tenants" aria-expanded="true">
                  <span className="navic">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 9 4.5 4h15L21 9" />
                      <path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9Z" />
                      <path d="M5 12v9h14v-9" />
                    </svg>
                  </span>
                  <span className="navtxt">Tenants</span>
                  <span className="chev open">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>
                </__Link>
                <div className="kids">
                  <__Link href="/merchants" className="nav sub on" aria-current="page">
                    <span className="navtxt">Merchants</span>
                  </__Link>
                  <__Link href="/provisioning" className="nav sub">
                    <span className="navtxt">Provisioning</span>
                  </__Link>
                  <__Link href="/domains" className="nav sub">
                    <span className="navtxt">Domains</span>
                  </__Link>
                  <__Link href="/backups" className="nav sub">
                    <span className="navtxt">Backups</span>
                  </__Link>
                </div>
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
                <__Link href="/support-desk" className="nav grp" title="Support" aria-expanded="false">
                  <span className="navic">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
                      <path d="M21 14v3a2 2 0 0 1-2 2h-2v-7h4M3 14v3a2 2 0 0 0 2 2h2v-7H3" />
                    </svg>
                  </span>
                  <span className="navtxt">Support</span>
                  <span className="badge ">12</span>
                  <span className="chev" style={{ marginLeft: "8px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>
                </__Link>
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
                  <path d="M3 9 4.5 4h15L21 9" />
                  <path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9Z" />
                  <path d="M5 12v9h14v-9" />
                </svg>
              </span>
              <span style={{ color: "var(--muted)" }}>Merchants</span>
              <span style={{ color: "var(--muted)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </span>
              <span style={{ fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Dhaka Gadget Hub</span>
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
            <div style={{ background: "var(--surface)", padding: "14px 24px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)" }}>
                <__Link href="/merchants" style={{ fontWeight: "var(--weight-medium)" }}>← Merchants</__Link>
                <span style={{ color: "var(--muted)" }}>/ Dhaka Gadget Hub</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "60px", height: "60px", borderRadius: "var(--radius-xl)", background: "#003087", color: "#fff", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }}>DG</span>
                <div style={{ minWidth: "0" }}>
                  <h1 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }}>Dhaka Gadget Hub</h1>
                  <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)" }}><span className="mono">tenant 0031</span> · Mobile accessories and gadgets · Elephant Road, Dhaka · owner Arif Hossain</div>
                  <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                    <span className="pill p-navy">Retail · Business plan</span>
                    <span className="pill p-warn"><span className="shp shp-warn" />Grace · day 3 · invoice unpaid</span>
                    <span className="pill p-warn"><span className="shp shp-warn" />Health 54 · Watch</span>
                    <span className="pill p-grey">Account manager: Farhana Akter</span>
                  </div>
                </div>
                <div className="cs-actions" style={{ marginLeft: "auto", display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "560px" }}>
                  <a className="btn btng" href="https://dhakagadgethub.com.bd" target="_blank" rel="noopener" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
</svg>Visit website</a>
                  <__Link href="/tenant-context-bar" className="btn btng" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
  <circle cx="12" cy="12" r="3" />
</svg>View as owner</__Link>
                  <button className="btn btng" type="button" onClick={v.sendReset} style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect x="4" y="11" width="16" height="10" rx="2" />
  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
</svg>Send reset link</button>
                  <button className="btn btng" type="button" onClick={v.goModules} style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Give module trial</button>
                  <button className="btn btnp" type="button" onClick={v.goBilling} style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Record payment</button>
                  <a className="btn btnp" href="#" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
</svg>Call owner</a>
                </div>
              </div>
              <div className="cs-cols2" style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", marginTop: "14px", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", background: "var(--surface2)" }}>
                <div className="fact">
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>Signed up</span>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>05 Aug 2025</span>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>on a field visit</span>
                </div>
                <div className="fact">
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>Last activation</span>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Today 10:02</span>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>owner signed in</span>
                </div>
                <div className="fact">
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>Last updated</span>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Today 09:48</span>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>6 prices, by Sumon</span>
                </div>
                <div className="fact">
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>Reset link sent</span>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>{v.resetWhen}</span>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>{v.resetBy}</span>
                </div>
                <div className="fact">
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>Package</span>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Business ৳2,500</span>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>+ ৳1,600 modules and credits</span>
                </div>
                <div className="fact">
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>Onboarded by</span>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Rakib Hasan</span>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>helper Tania Sultana</span>
                </div>
                <div className="fact">
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>Came from</span>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Physical visit</span>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>Elephant Road campaign</span>
                </div>
              </div>
              <div style={{ height: "14px" }} />
            </div>
            <div role="tablist" aria-label="Merchant sections" className="cs-strip" style={{ display: "flex", gap: "26px", padding: "0 24px", borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
              {__list(v.tabs).map((t, $index) => (<React.Fragment key={$index}>
                  <button className={t?.cls} type="button" role="tab" aria-selected={t?.sel} onClick={t?.pick}>{t?.label}{t?.hasCount ? (<>
  <span className="cnt">{t?.count}</span>
</>) : null}</button>
                </React.Fragment>))}
            </div>
            <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: "14px", minHeight: "0", overflow: "hidden" }}>
              {v.is_overview ? (<>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: "12px" }}>
                    <div className="kpi">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <span className="kl" title="Lifetime sales">Lifetime sales</span>
                        <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                          <path d="M0.0,8.3 L4.3,8.2 L8.5,10.1 L12.8,11.7 L17.1,14.1 L21.3,6.2 L25.6,3.0 L29.9,9.3 L34.1,16.3 L38.4,14.9 L42.7,7.2 L46.9,12.0 L51.2,14.9 L55.5,19.0 L59.7,12.6 L64.0,17.3 L64,22 L0,22 Z" fill="#6683b7" opacity=".10" />
                          <path d="M0.0,8.3 L4.3,8.2 L8.5,10.1 L12.8,11.7 L17.1,14.1 L21.3,6.2 L25.6,3.0 L29.9,9.3 L34.1,16.3 L38.4,14.9 L42.7,7.2 L46.9,12.0 L51.2,14.9 L55.5,19.0 L59.7,12.6 L64.0,17.3" fill="none" stroke="#6683b7" strokeWidth="1.7" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="৳48,62,300">৳48,62,300</span>
                      <div>
                        <span className="dpill d-flat">through GridCommerce since Aug 2025</span>
                      </div>
                    </div>
                    <div className="kpi">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <span className="kl" title="Orders, lifetime">Orders, lifetime</span>
                        <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                          <path d="M0.0,12.1 L4.3,14.2 L8.5,15.6 L12.8,17.5 L17.1,19.0 L21.3,18.5 L25.6,15.7 L29.9,18.1 L34.1,12.9 L38.4,9.0 L42.7,8.7 L46.9,3.0 L51.2,5.9 L55.5,8.3 L59.7,13.1 L64.0,8.7 L64,22 L0,22 Z" fill="#6683b7" opacity=".10" />
                          <path d="M0.0,12.1 L4.3,14.2 L8.5,15.6 L12.8,17.5 L17.1,19.0 L21.3,18.5 L25.6,15.7 L29.9,18.1 L34.1,12.9 L38.4,9.0 L42.7,8.7 L46.9,3.0 L51.2,5.9 L55.5,8.3 L59.7,13.1 L64.0,8.7" fill="none" stroke="#6683b7" strokeWidth="1.7" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="6,412">6,412</span>
                      <div>
                        <span className="dpill d-flat">counter 71% · online 29%</span>
                      </div>
                    </div>
                    <div className="kpi">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <span className="kl" title="This month">This month</span>
                        <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                          <path d="M0.0,19.0 L4.3,18.8 L8.5,16.8 L12.8,13.0 L17.1,12.5 L21.3,11.9 L25.6,8.7 L29.9,9.1 L34.1,10.3 L38.4,9.1 L42.7,9.2 L46.9,8.6 L51.2,6.1 L55.5,5.6 L59.7,7.2 L64.0,3.0 L64,22 L0,22 Z" fill="#ff5724" opacity=".10" />
                          <path d="M0.0,19.0 L4.3,18.8 L8.5,16.8 L12.8,13.0 L17.1,12.5 L21.3,11.9 L25.6,8.7 L29.9,9.1 L34.1,10.3 L38.4,9.1 L42.7,9.2 L46.9,8.6 L51.2,6.1 L55.5,5.6 L59.7,7.2 L64.0,3.0" fill="none" stroke="#ff5724" strokeWidth="1.7" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="৳3,84,200">৳3,84,200</span>
                      <div>
                        <span className="dpill d-bad">960 orders · ▼ 2% vs August</span>
                      </div>
                    </div>
                    <div className="kpi">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <span className="kl" title="Customers">Customers</span>
                        <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                          <path d="M0.0,19.0 L4.3,16.6 L8.5,14.4 L12.8,14.9 L17.1,14.2 L21.3,11.9 L25.6,9.4 L29.9,9.3 L34.1,9.7 L38.4,8.0 L42.7,7.0 L46.9,5.4 L51.2,5.4 L55.5,4.1 L59.7,4.6 L64.0,3.0 L64,22 L0,22 Z" fill="#10b981" opacity=".10" />
                          <path d="M0.0,19.0 L4.3,16.6 L8.5,14.4 L12.8,14.9 L17.1,14.2 L21.3,11.9 L25.6,9.4 L29.9,9.3 L34.1,9.7 L38.4,8.0 L42.7,7.0 L46.9,5.4 L51.2,5.4 L55.5,4.1 L59.7,4.6 L64.0,3.0" fill="none" stroke="#10b981" strokeWidth="1.7" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="3,904">3,904</span>
                      <div>
                        <span className="dpill d-good">1,210 repeat buyers</span>
                      </div>
                    </div>
                    <div className="kpi">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <span className="kl" title="Paid to GridCommerce">Paid to GridCommerce</span>
                        <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                          <path d="M0.0,7.8 L4.3,13.7 L8.5,7.5 L12.8,3.0 L17.1,3.0 L21.3,8.8 L25.6,12.6 L29.9,3.9 L34.1,3.1 L38.4,9.7 L42.7,9.3 L46.9,16.1 L51.2,12.3 L55.5,19.0 L59.7,11.2 L64.0,4.1 L64,22 L0,22 Z" fill="#6683b7" opacity=".10" />
                          <path d="M0.0,7.8 L4.3,13.7 L8.5,7.5 L12.8,3.0 L17.1,3.0 L21.3,8.8 L25.6,12.6 L29.9,3.9 L34.1,3.1 L38.4,9.7 L42.7,9.3 L46.9,16.1 L51.2,12.3 L55.5,19.0 L59.7,11.2 L64.0,4.1" fill="none" stroke="#6683b7" strokeWidth="1.7" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="৳27,500">৳27,500</span>
                      <div>
                        <span className="dpill d-flat">13 months</span>
                      </div>
                    </div>
                    <div className="kpi">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <span className="kl" title="Average order">Average order</span>
                        <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                          <path d="M0.0,19.0 L4.3,15.8 L8.5,13.6 L12.8,12.5 L17.1,11.5 L21.3,12.6 L25.6,10.4 L29.9,9.8 L34.1,10.7 L38.4,8.7 L42.7,8.2 L46.9,4.3 L51.2,4.8 L55.5,5.3 L59.7,5.5 L64.0,3.0 L64,22 L0,22 Z" fill="#10b981" opacity=".10" />
                          <path d="M0.0,19.0 L4.3,15.8 L8.5,13.6 L12.8,12.5 L17.1,11.5 L21.3,12.6 L25.6,10.4 L29.9,9.8 L34.1,10.7 L38.4,8.7 L42.7,8.2 L46.9,4.3 L51.2,4.8 L55.5,5.3 L59.7,5.5 L64.0,3.0" fill="none" stroke="#10b981" strokeWidth="1.7" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="৳758">৳758</span>
                      <div>
                        <span className="dpill d-good">▲ ৳34</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)", gap: "14px", alignItems: "stretch" }}>
                    <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Store sales per month</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }}>৳ thousand</div>
                      </div>
                      <svg className="cs-chart-l" viewBox="0 0 640 200" width="100%" role="img" aria-hidden="true" style={{ display: "block" }}>
                        <line x1="36" x2="640" y1="178.0" y2="178.0" stroke="#eef2f7" />
                        <line x1="36" x2="640" y1="138.0" y2="138.0" stroke="#eef2f7" />
                        <line x1="36" x2="640" y1="98.0" y2="98.0" stroke="#eef2f7" />
                        <line x1="36" x2="640" y1="58.0" y2="58.0" stroke="#eef2f7" />
                        <line x1="36" x2="640" y1="18.0" y2="18.0" stroke="#eef2f7" />
                        <path d="M40.0,162.4 L89.2,145.3 L138.3,129.3 L187.5,117.0 L236.7,107.3 L285.8,98.4 L335.0,84.3 L384.2,67.9 L433.3,59.7 L482.5,45.9 L531.7,39.6 L580.8,32.5 L630.0,35.1 L630.0,178 L40.0,178 Z" fill="#003087" opacity=".08" />
                        <path d="M40.0,162.4 L89.2,145.3 L138.3,129.3 L187.5,117.0 L236.7,107.3 L285.8,98.4 L335.0,84.3 L384.2,67.9 L433.3,59.7 L482.5,45.9 L531.7,39.6 L580.8,32.5 L630.0,35.1" fill="none" stroke="#003087" strokeWidth="2.5" strokeLinejoin="round" />
                        <circle cx="630.0" cy="35.1" r="4.5" fill="#fff" stroke="#003087" strokeWidth="2.5" />
                        <text x="40.0" y="196" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">Aug 25</text>
                        <text x="236.7" y="196" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">Dec</text>
                        <text x="433.3" y="196" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">Apr</text>
                        <text x="630.0" y="196" fontSize="11" fill="#64748b" textAnchor="middle" fontFamily="Poppins">Aug 26</text>
                      </svg>
                      <div className="cs-axis" aria-hidden="true">
                        <span style={{ left: "6.3%" }}>Aug 25</span>
                        <span style={{ left: "37%" }}>Dec</span>
                        <span style={{ left: "67.7%" }}>Apr</span>
                        <span style={{ left: "98.4%" }}>Aug 26</span>
                      </div>
                    </section>
                    <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Health 54 · Watch</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }} />
                      </div>
                      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
                            <circle cx="32.0" cy="32.0" r="28.0" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                            <circle cx="32.0" cy="32.0" r="28.0" fill="none" stroke="#ff9800" strokeWidth="4" strokeLinecap="round" strokeDasharray="95.0 175.9" transform="rotate(-90 32.0 32.0)" />
                          </svg>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>54</span>
                        </span>
                        <span style={{ fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "var(--errt)", fontWeight: "var(--weight-medium)" }}>▼ 21 in 7 days: unpaid invoice and Steadfast failures</span>
                      </div>
                      <div style={{ marginTop: "10px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "96px minmax(0,1fr) 30px", alignItems: "center", gap: "8px", minHeight: "26px" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>Activation</span>
                          <span style={{ height: "8px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                            <span style={{ display: "block", width: "88%", height: "100%", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                          </span>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>88</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "96px minmax(0,1fr) 30px", alignItems: "center", gap: "8px", minHeight: "26px" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>Activity</span>
                          <span style={{ height: "8px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                            <span style={{ display: "block", width: "76%", height: "100%", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                          </span>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>76</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "96px minmax(0,1fr) 30px", alignItems: "center", gap: "8px", minHeight: "26px" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>Billing</span>
                          <span style={{ height: "8px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                            <span style={{ display: "block", width: "20%", height: "100%", borderRadius: "var(--radius-sm)", background: "#ff5724" }} />
                          </span>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--errt)", textAlign: "right" }}>20</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "96px minmax(0,1fr) 30px", alignItems: "center", gap: "8px", minHeight: "26px" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>Integrations</span>
                          <span style={{ height: "8px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                            <span style={{ display: "block", width: "35%", height: "100%", borderRadius: "var(--radius-sm)", background: "#ff5724" }} />
                          </span>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--errt)", textAlign: "right" }}>35</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "96px minmax(0,1fr) 30px", alignItems: "center", gap: "8px", minHeight: "26px" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>Technical</span>
                          <span style={{ height: "8px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                            <span style={{ display: "block", width: "81%", height: "100%", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                          </span>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>81</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "96px minmax(0,1fr) 30px", alignItems: "center", gap: "8px", minHeight: "26px" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>Support</span>
                          <span style={{ height: "8px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                            <span style={{ display: "block", width: "70%", height: "100%", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                          </span>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>70</span>
                        </div>
                      </div>
                    </section>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr) minmax(0,1fr)", gap: "14px", alignItems: "stretch" }}>
                    <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Owner and team · 4 of 5 seats</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "46px", borderTop: "0" }}>
                        <span className="av" style={{ background: "#003087" }}>AH</span>
                        <div style={{ minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Arif Hossain <span style={{ fontWeight: "var(--weight-regular)", color: "var(--muted)" }}>· Owner</span></div>
                          <div className="num" style={{ fontSize: "var(--text-xs)", color: "var(--body)" }}>+880 1711-XXXXXX · 2FA on</div>
                        </div>
                        <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--muted)" }}>Today 10:02</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "46px", borderTop: "1px solid var(--line)" }}>
                        <span className="av" style={{ background: "#7d94bf" }}>SR</span>
                        <div style={{ minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Sumon Roy <span style={{ fontWeight: "var(--weight-regular)", color: "var(--muted)" }}>· Manager</span></div>
                          <div className="num" style={{ fontSize: "var(--text-xs)", color: "var(--body)" }}>+880 1819-XXXXXX</div>
                        </div>
                        <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--muted)" }}>Today 09:48</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "46px", borderTop: "1px solid var(--line)" }}>
                        <span className="av" style={{ background: "#7d94bf" }}>KA</span>
                        <div style={{ minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Kamal Ahmed <span style={{ fontWeight: "var(--weight-regular)", color: "var(--muted)" }}>· Cashier · POS</span></div>
                          <div className="num" style={{ fontSize: "var(--text-xs)", color: "var(--body)" }}>+880 1552-XXXXXX</div>
                        </div>
                        <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--muted)" }}>Yesterday</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "46px", borderTop: "1px solid var(--line)" }}>
                        <span className="av" style={{ background: "#7d94bf" }}>RB</span>
                        <div style={{ minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Rina Begum <span style={{ fontWeight: "var(--weight-regular)", color: "var(--muted)" }}>· Cashier · POS</span></div>
                          <div className="num" style={{ fontSize: "var(--text-xs)", color: "var(--body)" }}>+880 1677-XXXXXX</div>
                        </div>
                        <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--muted)" }}>3 days ago</span>
                      </div>
                    </section>
                    <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Integrations now</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", minHeight: "32px", fontSize: "var(--text-xs-plus)" }}>
                        <span className="shp shp-err" />
                        <span style={{ fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Steadfast</span>
                        <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--errt)", fontWeight: "var(--weight-medium)" }}>Failing since 09:40 · INC-114</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", minHeight: "32px", fontSize: "var(--text-xs-plus)" }}>
                        <span className="shp shp-ok" />
                        <span style={{ fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Pathao</span>
                        <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--body)", fontWeight: "var(--weight-regular)" }}>Healthy</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", minHeight: "32px", fontSize: "var(--text-xs-plus)" }}>
                        <span className="shp shp-ok" />
                        <span style={{ fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>bKash</span>
                        <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--body)", fontWeight: "var(--weight-regular)" }}>Healthy</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", minHeight: "32px", fontSize: "var(--text-xs-plus)" }}>
                        <span className="shp shp-warn" />
                        <span style={{ fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>SMS</span>
                        <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--warnt)", fontWeight: "var(--weight-medium)" }}>48,900 sent · over plan</span>
                      </div>
                    </section>
                    <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Notes and tasks</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }}>
                          <button className="btn btng" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 5v14M5 12h14" />
</svg>Add note</button>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "#fff8e6", border: "1px solid #f5c26b" }}>
                          <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--muted)" }}>Pinned · Rakib Hasan</div>
                          <div style={{ marginTop: "4px", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "var(--ink)" }}>Arif prefers calls after 20:00. Pays by bKash; last two months paid on our call, not from the panel.</div>
                        </div>
                        <div style={{ padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "var(--surface2)", border: "1px solid var(--line)" }}>
                          <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--muted)" }}>Task · Farhana, today</div>
                          <div style={{ marginTop: "4px", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "var(--ink)" }}>Call about INV-2026-0912 after Steadfast is fixed; offer the ৳833 outage credit (ADJ-0042).</div>
                        </div>
                      </div>
                    </section>
                  </div>
                  <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                      <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Store controls</h2>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }} />
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                      <button className="btn btng" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
</svg>Export store data</button>
                      <button className="btn btng" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Pause storefront</button>
                      <button className="btn btng" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Make read-only</button>
                      <button className="btn" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)", background: "#ffece5", color: "#c2410c" }}>Suspend store</button>
                      <button className="btn" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)", background: "#ffece5", color: "#c2410c" }}>Archive store</button>
                      <span style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>Each needs a reason code and is written to the audit log. Data is never deleted.</span>
                    </div>
                  </section>
                </div>
              </>) : null}
              {v.is_billing ? (<>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "12px" }}>
                    <div className="kpi">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <span className="kl" title="Monthly bill from October">Monthly bill from October</span>
                        <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                          <path d="M0.0,19.0 L4.3,14.2 L8.5,14.1 L12.8,15.4 L17.1,10.1 L21.3,6.1 L25.6,5.1 L29.9,3.0 L34.1,5.6 L38.4,10.6 L42.7,14.2 L46.9,14.5 L51.2,10.2 L55.5,13.4 L59.7,17.4 L64.0,15.7 L64,22 L0,22 Z" fill="#6683b7" opacity=".10" />
                          <path d="M0.0,19.0 L4.3,14.2 L8.5,14.1 L12.8,15.4 L17.1,10.1 L21.3,6.1 L25.6,5.1 L29.9,3.0 L34.1,5.6 L38.4,10.6 L42.7,14.2 L46.9,14.5 L51.2,10.2 L55.5,13.4 L59.7,17.4 L64.0,15.7" fill="none" stroke="#6683b7" strokeWidth="1.7" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="৳4,100">৳4,100</span>
                      <div>
                        <span className="dpill d-flat">plan ৳2,500 + modules and credits</span>
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
                      <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="৳2,500">৳2,500</span>
                      <div>
                        <span className="dpill d-bad">INV-2026-0912 · 3 days</span>
                      </div>
                    </div>
                    <div className="kpi">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <span className="kl" title="Usually pays">Usually pays</span>
                        <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                          <path d="M0.0,15.0 L4.3,19.0 L8.5,10.2 L12.8,7.3 L17.1,8.3 L21.3,5.5 L25.6,12.0 L29.9,9.1 L34.1,13.5 L38.4,19.0 L42.7,17.3 L46.9,13.2 L51.2,12.0 L55.5,3.0 L59.7,3.8 L64.0,11.4 L64,22 L0,22 Z" fill="#6683b7" opacity=".10" />
                          <path d="M0.0,15.0 L4.3,19.0 L8.5,10.2 L12.8,7.3 L17.1,8.3 L21.3,5.5 L25.6,12.0 L29.9,9.1 L34.1,13.5 L38.4,19.0 L42.7,17.3 L46.9,13.2 L51.2,12.0 L55.5,3.0 L59.7,3.8 L64.0,11.4" fill="none" stroke="#6683b7" strokeWidth="1.7" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="bKash">bKash</span>
                      <div>
                        <span className="dpill d-flat">last 2 on a call, 4 from panel</span>
                      </div>
                    </div>
                    <div className="kpi">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <span className="kl" title="Paid lifetime">Paid lifetime</span>
                        <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                          <path d="M0.0,19.0 L4.3,16.9 L8.5,16.1 L12.8,14.3 L17.1,14.3 L21.3,12.6 L25.6,10.8 L29.9,9.5 L34.1,9.1 L38.4,9.6 L42.7,8.4 L46.9,6.6 L51.2,5.8 L55.5,4.4 L59.7,4.9 L64.0,3.0 L64,22 L0,22 Z" fill="#10b981" opacity=".10" />
                          <path d="M0.0,19.0 L4.3,16.9 L8.5,16.1 L12.8,14.3 L17.1,14.3 L21.3,12.6 L25.6,10.8 L29.9,9.5 L34.1,9.1 L38.4,9.6 L42.7,8.4 L46.9,6.6 L51.2,5.8 L55.5,4.4 L59.7,4.9 L64.0,3.0" fill="none" stroke="#10b981" strokeWidth="1.7" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="৳27,500">৳27,500</span>
                      <div>
                        <span className="dpill d-good">never missed a month before</span>
                      </div>
                    </div>
                  </div>
                  <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                      <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>What he is billed for</h2>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }}>plan, modules and credits are billed separately</div>
                    </div>
                    <div style={{ margin: "0 -20px -16px" }}>
                      <div className="th" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) 90px 80px 90px minmax(0,1.3fr) 70px 120px", gap: "12px", padding: "10px 18px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>
                        <span>Billed item</span>
                        <span>Type</span>
                        <span style={{ textAlign: "right" }}>Price</span>
                        <span>Period</span>
                        <span>Since</span>
                        <span>Next bill</span>
                        <span />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) 90px 80px 90px minmax(0,1.3fr) 70px 120px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px" }}>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Retail · Business plan</span>
                        <span className="pill p-navy" style={{ justifySelf: "start" }}>Plan</span>
                        <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>৳2,500</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Monthly</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>01 Mar 2026</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>01 Oct</span>
                        <span style={{ display: "flex", gap: "6px" }}>
                          <button className="btn btng" type="button" style={{ minHeight: "34px", padding: "0 10px", fontSize: "var(--text-xs)" }}>Edit</button>
                          <button className="btn btng" type="button" style={{ minHeight: "34px", padding: "0 10px", fontSize: "var(--text-xs)" }}>End</button>
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) 90px 80px 90px minmax(0,1.3fr) 70px 120px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Warehouse (M05)</span>
                        <span className="pill p-sky" style={{ justifySelf: "start" }}>Module</span>
                        <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>৳1,000</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Monthly</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>From 27 Sep, after trial</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>01 Oct</span>
                        <span style={{ display: "flex", gap: "6px" }}>
                          <button className="btn btng" type="button" style={{ minHeight: "34px", padding: "0 10px", fontSize: "var(--text-xs)" }}>Edit</button>
                          <button className="btn btng" type="button" style={{ minHeight: "34px", padding: "0 10px", fontSize: "var(--text-xs)" }}>End</button>
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) 90px 80px 90px minmax(0,1.3fr) 70px 120px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>SMS credits · 10,000 pack</span>
                        <span className="pill p-grey" style={{ justifySelf: "start" }}>Credits</span>
                        <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>৳600</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Monthly</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>05 Apr 2026</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>01 Oct</span>
                        <span style={{ display: "flex", gap: "6px" }}>
                          <button className="btn btng" type="button" style={{ minHeight: "34px", padding: "0 10px", fontSize: "var(--text-xs)" }}>Edit</button>
                          <button className="btn btng" type="button" style={{ minHeight: "34px", padding: "0 10px", fontSize: "var(--text-xs)" }}>End</button>
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) 90px 80px 90px minmax(0,1.3fr) 70px 120px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>5 extra landing pages</span>
                        <span className="pill p-grey" style={{ justifySelf: "start" }}>One-off</span>
                        <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>৳300</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Once</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>12 Jun 2026</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>—</span>
                        <span style={{ display: "flex", gap: "6px" }}>
                          <button className="btn btng" type="button" style={{ minHeight: "34px", padding: "0 10px", fontSize: "var(--text-xs)" }}>Edit</button>
                          <button className="btn btng" type="button" style={{ minHeight: "34px", padding: "0 10px", fontSize: "var(--text-xs)" }}>End</button>
                        </span>
                      </div>
                    </div>
                  </section>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "14px", alignItems: "stretch" }}>
                    <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Record a payment</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }}>no auto-charge</div>
                      </div>
                      <div style={{ padding: "10px 12px", borderRadius: "var(--radius-lg)", background: "#ffece5", fontSize: "var(--text-xs-plus)", color: "#7c2d12", marginBottom: "12px" }}><strong>INV-2026-0912 · ৳2,500</strong> overdue 3 days · promised on the 18 Sep call to pay Sunday</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "12px" }}>
                        <label className="fl" style={{ fontSize: "var(--text-xs)", letterSpacing: "0", color: "var(--ink)" }}>Invoice<select className="sel" style={{ width: "100%" }}>
  <option>INV-2026-0912 · ৳2,500 · overdue</option>
  <option>Advance for October</option>
</select></label>
                        <label className="fl" style={{ fontSize: "var(--text-xs)", letterSpacing: "0", color: "var(--ink)" }}>Amount, ৳<input className="inp" type="text" defaultValue="2,500" placeholder="" style={{ width: "100%", height: "40px", fontSize: "var(--text-sm)" }} /></label>
                        <label className="fl" style={{ fontSize: "var(--text-xs)", letterSpacing: "0", color: "var(--ink)" }}>Method<select className="sel" style={{ width: "100%" }}>
  <option>bKash</option>
  <option>Nagad</option>
  <option>Rocket</option>
  <option>Bank transfer</option>
  <option>Cash at office</option>
  <option>Card</option>
</select></label>
                        <label className="fl" style={{ fontSize: "var(--text-xs)", letterSpacing: "0", color: "var(--ink)" }}>Transaction ID<input className="inp" type="text" defaultValue="" placeholder="e.g. 8KJ21M0QX" style={{ width: "100%", height: "40px", fontSize: "var(--text-sm)" }} /></label>
                        <label className="fl" style={{ fontSize: "var(--text-xs)", letterSpacing: "0", color: "var(--ink)" }}>How it came in<select className="sel" style={{ width: "100%" }}>
  <option>Taken on a call</option>
  <option>Paid from merchant panel</option>
  <option>Bank deposit</option>
  <option>Collected in person</option>
</select></label>
                        <label className="fl" style={{ fontSize: "var(--text-xs)", letterSpacing: "0", color: "var(--ink)" }}>Received by<select className="sel" style={{ width: "100%" }}>
  <option>Farhana Akter</option>
  <option>Rakib Hasan</option>
  <option>Mahin Khan</option>
</select></label>
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "12px" }}>
                        <button className="btn btnp" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Record payment</button>
                        <button className="btn btng" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.9-.9L3 21l1.9-5.1A8.4 8.4 0 0 1 3.5 11.5 8.5 8.5 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" />
</svg>Send pay link to panel</button>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>A receipt goes to the owner; the store leaves grace at once.</span>
                      </div>
                    </section>
                    <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Add a module or item to his bill</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "12px" }}>
                        <label className="fl" style={{ fontSize: "var(--text-xs)", letterSpacing: "0", color: "var(--ink)" }}>Module or item<select className="sel" style={{ width: "100%" }}>
  <option>Warehouse (M05)</option>
  <option>HR and payroll (M19)</option>
  <option>AI product creation (G5)</option>
  <option>Inbox and automation (G3)</option>
  <option>SMS credits pack</option>
  <option>Landing pages +5</option>
  <option>Assisted migration (S6)</option>
  <option>Custom item…</option>
</select></label>
                        <label className="fl" style={{ fontSize: "var(--text-xs)", letterSpacing: "0", color: "var(--ink)" }}>Price, ৳<input className="inp" type="text" defaultValue="1,000" placeholder="" style={{ width: "100%", height: "40px", fontSize: "var(--text-sm)" }} /></label>
                        <label className="fl" style={{ fontSize: "var(--text-xs)", letterSpacing: "0", color: "var(--ink)" }}>Billing period<select className="sel" style={{ width: "100%" }}>
  <option>Monthly</option>
  <option>Yearly</option>
  <option>One-off</option>
</select></label>
                        <label className="fl" style={{ fontSize: "var(--text-xs)", letterSpacing: "0", color: "var(--ink)" }}>Starts<input className="inp" type="text" defaultValue="27 Sep 2026" placeholder="" style={{ width: "100%", height: "40px", fontSize: "var(--text-sm)" }} /></label>
                      </div>
                      <label style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "10px", fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}><input type="checkbox" defaultChecked style={{ width: "18px", height: "18px", accentColor: "#003087" }} />Prorate the first month (৳133 for 4 days)</label>
                      {" "}
                      <label style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "6px", fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}><input type="checkbox" defaultChecked style={{ width: "18px", height: "18px", accentColor: "#003087" }} />Tell the owner in the admin and by SMS</label>
                      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                        <button className="btn btnp" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 5v14M5 12h14" />
</svg>Add to next invoice</button>
                        <span style={{ alignSelf: "center", fontSize: "var(--text-xs)", color: "var(--muted)" }}>Custom prices over 20% off list need a second approval.</span>
                      </div>
                    </section>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: "14px", alignItems: "stretch" }}>
                    <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Invoices and payments</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }}>
                          <__Link href="/invoices" className="rowlink">All invoices →</__Link>
                        </div>
                      </div>
                      <div style={{ margin: "0 -20px -16px" }}>
                        <div className="th" style={{ display: "grid", gridTemplateColumns: "140px 50px 80px 150px minmax(0,1.3fr) minmax(0,1fr)", gap: "12px", padding: "10px 18px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>
                          <span>Number</span>
                          <span>Period</span>
                          <span style={{ textAlign: "right" }}>Amount</span>
                          <span>Status</span>
                          <span>Paid via</span>
                          <span>Recorded by</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "140px 50px 80px 150px minmax(0,1.3fr) minmax(0,1fr)", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px" }}>
                          <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>INV-2026-0912</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Sep</span>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>৳2,500</span>
                          <span className="pill p-err" style={{ justifySelf: "start" }}>Overdue · 3 days</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>—</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>—</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "140px 50px 80px 150px minmax(0,1.3fr) minmax(0,1fr)", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                          <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>INV-2026-0861</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Aug</span>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>৳3,100</span>
                          <span className="pill p-ok" style={{ justifySelf: "start" }}>Paid 04 Aug</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>bKash · taken on call</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Rakib Hasan</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "140px 50px 80px 150px minmax(0,1.3fr) minmax(0,1fr)", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                          <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>INV-2026-0802</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Jul</span>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>৳3,100</span>
                          <span className="pill p-ok" style={{ justifySelf: "start" }}>Paid 06 Jul</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>bKash · taken on call</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Rakib Hasan</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "140px 50px 80px 150px minmax(0,1.3fr) minmax(0,1fr)", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                          <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>INV-2026-0744</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Jun</span>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>৳3,400</span>
                          <span className="pill p-ok" style={{ justifySelf: "start" }}>Paid 02 Jun</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>bKash · from panel</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Owner</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "140px 50px 80px 150px minmax(0,1.3fr) minmax(0,1fr)", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                          <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>CN-2026-0015</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Sep</span>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#c2410c", textAlign: "right" }}>−৳833</span>
                          <span className="pill p-warn" style={{ justifySelf: "start" }}>Waiting 2nd approval</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Outage credit</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Farhana Akter</span>
                        </div>
                      </div>
                    </section>
                    <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Collection calls</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }}>
                          <__Link href="/collections" className="rowlink">Collections →</__Link>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "10px", minHeight: "40px", alignItems: "center", borderTop: "0" }}>
                        <span style={{ display: "inline-flex", color: "var(--muted)" }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
                          </svg>
                        </span>
                        <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)", width: "92px" }}>18 Sep 20:15</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Promised to pay by bKash on Sunday</span>
                        <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--muted)" }}>Rakib Hasan</span>
                      </div>
                      <div style={{ display: "flex", gap: "10px", minHeight: "40px", alignItems: "center", borderTop: "1px solid var(--line)" }}>
                        <span style={{ display: "inline-flex", color: "var(--muted)" }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
                          </svg>
                        </span>
                        <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)", width: "92px" }}>17 Sep 16:40</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>No answer · SMS pay link sent</span>
                        <span style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--muted)" }}>Rakib Hasan</span>
                      </div>
                    </section>
                  </div>
                </div>
              </>) : null}
              {v.is_modules ? (<>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span className="mod mod-in" style={{ height: "18px", padding: "0 8px" }} />In plan</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span className="mod mod-add" style={{ height: "18px", padding: "0 8px" }} />Billed separately</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span className="mod mod-trial" style={{ height: "18px", padding: "0 8px" }} />Trial · 6 days left</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span className="mod mod-lock" style={{ height: "18px", padding: "0 8px" }} />Locked</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span className="mod mod-off" style={{ height: "18px", padding: "0 8px" }} />Not in his segment</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.7fr) minmax(0,1fr)", gap: "14px", alignItems: "stretch" }}>
                    <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Modules he has</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }}>48 modules</div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "170px minmax(0,1fr)", gap: "14px", alignItems: "start", padding: "12px 0", borderTop: "1px solid var(--line)" }}>
                        <div>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Platform core</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>Runs in every store</div>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>F1</span>Multi-tenancy</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>F3</span>Plans</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>F2</span>Billing</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>B1</span>Design system</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>S4</span>Roles</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>S8</span>Onboarding</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>S9</span>Merchant notices</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>S3</span>Notifications</span>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "170px minmax(0,1fr)", gap: "14px", alignItems: "start", padding: "12px 0", borderTop: "1px solid var(--line)" }}>
                        <div>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Everyday core</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>Every segment, every plan</div>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M01</span>Dashboard</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>S2</span>Reports</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M07</span>Products</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M15</span>Stock ledger</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>S1</span>Customer record</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M22</span>Customer CRM</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M17</span>Payments</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M24</span>Staff access</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M18</span>Returns</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>S7</span>Support tickets</span>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "170px minmax(0,1fr)", gap: "14px", alignItems: "start", padding: "12px 0", borderTop: "1px solid var(--line)" }}>
                        <div>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Online set</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>Online segment</div>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          <span className="mod mod-off" title="Not in his segment"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M06</span>Checkout</span>
                          <span className="mod mod-off" title="Not in his segment"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M02</span>Online orders</span>
                          <span className="mod mod-off" title="Not in his segment"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M25</span>Manual order</span>
                          <span className="mod mod-off" title="Not in his segment"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M23</span>Quick order link</span>
                          <span className="mod mod-off" title="Not in his segment"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M26</span>Bulk actions</span>
                          <span className="mod mod-add" title="Billed separately"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M08</span>Courier and COD</span>
                          <span className="mod mod-off" title="Not in his segment"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M11</span>Themes</span>
                          <span className="mod mod-add" title="Billed separately"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M12</span>Landing pages</span>
                          <span className="mod mod-off" title="Not in his segment"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M10</span>SEO</span>
                          <span className="mod mod-off" title="Not in his segment"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M09</span>Reviews</span>
                          <span className="mod mod-off" title="Not in his segment"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>G1</span>Server tracking</span>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "170px minmax(0,1fr)", gap: "14px", alignItems: "start", padding: "12px 0", borderTop: "1px solid var(--line)" }}>
                        <div>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Retail set</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>Retail segment</div>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M04</span>POS</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M03</span>Counter sales</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M16</span>Cash and expenses</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M28</span>Warranty</span>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "170px minmax(0,1fr)", gap: "14px", alignItems: "start", padding: "12px 0", borderTop: "1px solid var(--line)" }}>
                        <div>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Wholesale set</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>Wholesale segment</div>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          <span className="mod mod-off" title="Not in his segment"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M13</span>Purchasing</span>
                          <span className="mod mod-off" title="Not in his segment"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M14</span>Wholesale dues</span>
                          <span className="mod mod-off" title="Not in his segment"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M27</span>Partners</span>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "170px minmax(0,1fr)", gap: "14px", alignItems: "start", padding: "12px 0", borderTop: "1px solid var(--line)" }}>
                        <div>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Grow set</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>Offers, loyalty, recovery, analytics</div>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M21</span>Promotions</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M20</span>Loyalty</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>G4</span>Cart recovery</span>
                          <span className="mod mod-in" title="In plan"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>G2</span>Analytics</span>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "170px minmax(0,1fr)", gap: "14px", alignItems: "start", padding: "12px 0", borderTop: "1px solid var(--line)" }}>
                        <div>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Scale set</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>Locations, people, custom plans</div>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          <span className="mod mod-trial" title="Trial · 6 days left"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M05</span>Warehouse · 6 d</span>
                          <span className="mod mod-lock" title="Locked"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>M19</span>HR and payroll<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect x="4" y="11" width="16" height="10" rx="2" />
  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
</svg></span>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "170px minmax(0,1fr)", gap: "14px", alignItems: "start", padding: "12px 0", borderTop: "1px solid var(--line)" }}>
                        <div>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Credit add-ons</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>Bought as credits</div>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          <span className="mod mod-lock" title="Locked"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>G3</span>Inbox<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect x="4" y="11" width="16" height="10" rx="2" />
  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
</svg></span>
                          <span className="mod mod-add" title="Billed separately"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>G6</span>Blasts</span>
                          <span className="mod mod-lock" title="Locked"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>G5</span>AI products<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect x="4" y="11" width="16" height="10" rx="2" />
  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
</svg></span>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "170px minmax(0,1fr)", gap: "14px", alignItems: "start", padding: "12px 0", borderTop: "1px solid var(--line)" }}>
                        <div>
                          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Service add-on</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>Managed service</div>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          <span className="mod mod-off" title="Not in his segment"><span className="mono" style={{ fontSize: "var(--text-2xs)", opacity: ".8" }}>S6</span>Migration</span>
                        </div>
                      </div>
                    </section>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                          <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Give a module trial</h2>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <label className="fl" style={{ fontSize: "var(--text-xs)", letterSpacing: "0", color: "var(--ink)" }}>Module<select className="sel" style={{ width: "100%" }}>
  <option>HR and payroll (M19)</option>
  <option>AI product creation (G5)</option>
  <option>Inbox and automation (G3)</option>
  <option>Warehouse (M05) · extend</option>
  <option>Online set (storefront, checkout, courier)</option>
</select></label>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "12px" }}>
                            <label className="fl" style={{ fontSize: "var(--text-xs)", letterSpacing: "0", color: "var(--ink)" }}>Length<select className="sel" style={{ width: "100%" }}>
  <option>7 days</option>
  <option>14 days</option>
  <option>30 days</option>
</select></label>
                            <label className="fl" style={{ fontSize: "var(--text-xs)", letterSpacing: "0", color: "var(--ink)" }}>Starts<select className="sel" style={{ width: "100%" }}>
  <option>Now</option>
  <option>Choose a date</option>
</select></label>
                          </div>
                          <label className="fl" style={{ fontSize: "var(--text-xs)", letterSpacing: "0", color: "var(--ink)" }}>Reason<select className="sel" style={{ width: "100%" }}>
  <option>Sales evaluation</option>
  <option>Support goodwill</option>
  <option>Upgrade offer</option>
  <option>Beta programme</option>
</select></label>
                          <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>
                            <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px", marginTop: "2px", accentColor: "#003087" }} />
                            <span>When the trial ends, add it to his bill at ৳1,500 a month unless he says no</span>
                          </label>
                          <label style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}><input type="checkbox" defaultChecked style={{ width: "18px", height: "18px", accentColor: "#003087" }} />Tell the owner in the admin and by SMS</label>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button className="btn btnp" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Start trial</button>
                            <span style={{ alignSelf: "center", fontSize: "var(--text-xs)", color: "var(--muted)" }}>One trial per module per store. His data stays if it ends.</span>
                          </div>
                        </div>
                      </section>
                      <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                          <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Locked features he tried, 30 days</h2>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "140px minmax(0,1fr) 64px", alignItems: "center", gap: "10px", minHeight: "30px" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>HR and payroll</span>
                          <span style={{ height: "10px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                            <span style={{ display: "block", width: "100%", height: "100%", borderRadius: "var(--radius-sm)", background: "#003087" }} />
                          </span>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>12 clicks</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "140px minmax(0,1fr) 64px", alignItems: "center", gap: "10px", minHeight: "30px" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>AI product creation</span>
                          <span style={{ height: "10px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                            <span style={{ display: "block", width: "42%", height: "100%", borderRadius: "var(--radius-sm)", background: "#2e559d" }} />
                          </span>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>5 clicks</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "140px minmax(0,1fr) 64px", alignItems: "center", gap: "10px", minHeight: "30px" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Inbox</span>
                          <span style={{ height: "10px", borderRadius: "var(--radius-sm)", background: "var(--track)" }}>
                            <span style={{ display: "block", width: "25%", height: "100%", borderRadius: "var(--radius-sm)", background: "#0070a0" }} />
                          </span>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>3 clicks</span>
                        </div>
                      </section>
                    </div>
                  </div>
                  <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                      <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Trial history</h2>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }} />
                    </div>
                    <div style={{ margin: "0 -20px -16px" }}>
                      <div className="th" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1.2fr) minmax(0,1.2fr) 190px minmax(0,1fr)", gap: "12px", padding: "10px 18px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>
                        <span>Module</span>
                        <span>Trial</span>
                        <span>Use during trial</span>
                        <span>Result</span>
                        <span>Given by</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1.2fr) minmax(0,1.2fr) 190px minmax(0,1fr)", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px" }}>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Warehouse (M05)</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>14 days · 12 to 26 Sep</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>2 warehouses · 38 transfers</span>
                        <span className="pill p-sky" style={{ justifySelf: "start" }}>Running · 6 days left</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Farhana Akter</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1.2fr) minmax(0,1.2fr) 190px minmax(0,1fr)", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Analytics hub (G2)</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>7 days · 20 to 27 Feb</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Opened 19 times</span>
                        <span className="pill p-ok" style={{ justifySelf: "start" }}><span className="shp shp-ok" aria-hidden="true" />Converted with Business</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Rakib Hasan</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1.2fr) minmax(0,1.2fr) 190px minmax(0,1fr)", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Landing pages (M12)</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>7 days · 02 to 09 Jun</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>2 pages published</span>
                        <span className="pill p-ok" style={{ justifySelf: "start" }}><span className="shp shp-ok" aria-hidden="true" />Became add-on</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Tania Sultana</span>
                      </div>
                    </div>
                  </section>
                </div>
              </>) : null}
              {v.is_onboarding ? (<>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                      <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>How he came to GridCommerce</h2>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }}>
                        <button className="btn btng" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Edit attribution</button>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
                      <span className="src on">Physical visit</span>
                      <span className="src">Meta ads</span>
                      <span className="src">YouTube ads</span>
                      <span className="src">Reference</span>
                      <span className="src">Affiliate</span>
                      <span className="src">Website</span>
                      <span className="src">Event</span>
                      <span className="src">CSV import</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "14px" }}>
                      <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "var(--surface2)" }}>
                        <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>Onboarded by</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                          <span className="av" style={{ width: "28px", height: "28px", background: "#0070a0" }} title="RH">RH</span>
                          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Rakib Hasan</span>
                        </div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)", marginTop: "4px" }}>Sales · field team</div>
                      </div>
                      <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "var(--surface2)" }}>
                        <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>Onboarding helper</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                          <span className="av" style={{ width: "28px", height: "28px", background: "#2e559d" }} title="TS">TS</span>
                          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Tania Sultana</span>
                        </div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)", marginTop: "4px" }}>3 sessions · 1 h 25 min</div>
                      </div>
                      <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "var(--surface2)" }}>
                        <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>Campaign</div>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)", marginTop: "6px" }}>Elephant Road gadget cluster</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)", marginTop: "4px" }}>Field visits, Aug 2025 · 11 stores signed</div>
                      </div>
                      <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "var(--surface2)" }}>
                        <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>Onboarding method</div>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--ink)", marginTop: "6px" }}>In person, then video call</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)", marginTop: "4px" }}>Fully set up in 7 days</div>
                      </div>
                    </div>
                  </section>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)", gap: "14px", alignItems: "stretch" }}>
                    <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Setup steps · activation 100% on day 7</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "22px minmax(0,1fr) 90px minmax(0,1fr)", gap: "10px", alignItems: "center", minHeight: "40px", borderTop: "0" }}>
                        <span className="dot d-done" style={{ width: "18px", height: "18px" }} />
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Store created</span>
                        <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>05 Aug 2025</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>Self · on the visit</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "22px minmax(0,1fr) 90px minmax(0,1fr)", gap: "10px", alignItems: "center", minHeight: "40px", borderTop: "1px solid var(--line)" }}>
                        <span className="dot d-done" style={{ width: "18px", height: "18px" }} />
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>412 products imported by CSV</span>
                        <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>06 Aug</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>Tania Sultana, helper</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "22px minmax(0,1fr) 90px minmax(0,1fr)", gap: "10px", alignItems: "center", minHeight: "40px", borderTop: "1px solid var(--line)" }}>
                        <span className="dot d-done" style={{ width: "18px", height: "18px" }} />
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>POS and 2 barcode scanners set up</span>
                        <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>07 Aug</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>In person</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "22px minmax(0,1fr) 90px minmax(0,1fr)", gap: "10px", alignItems: "center", minHeight: "40px", borderTop: "1px solid var(--line)" }}>
                        <span className="dot d-done" style={{ width: "18px", height: "18px" }} />
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>First counter sale</span>
                        <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>07 Aug</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>৳3,450 · Samsung charger</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "22px minmax(0,1fr) 90px minmax(0,1fr)", gap: "10px", alignItems: "center", minHeight: "40px", borderTop: "1px solid var(--line)" }}>
                        <span className="dot d-done" style={{ width: "18px", height: "18px" }} />
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Steadfast and Pathao connected</span>
                        <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>08 Aug</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>Video call</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "22px minmax(0,1fr) 90px minmax(0,1fr)", gap: "10px", alignItems: "center", minHeight: "40px", borderTop: "1px solid var(--line)" }}>
                        <span className="dot d-done" style={{ width: "18px", height: "18px" }} />
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Domain dhakagadgethub.com.bd live</span>
                        <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>10 Aug</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>Tania Sultana</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "22px minmax(0,1fr) 90px minmax(0,1fr)", gap: "10px", alignItems: "center", minHeight: "40px", borderTop: "1px solid var(--line)" }}>
                        <span className="dot d-done" style={{ width: "18px", height: "18px" }} />
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Staff invited · 3 cashiers</span>
                        <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>12 Aug</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>Owner</span>
                      </div>
                    </section>
                    <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Onboarding sessions</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }}>
                          <button className="btn btng" type="button" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 5v14M5 12h14" />
</svg>Log a session</button>
                        </div>
                      </div>
                      <div style={{ padding: "10px 0", borderTop: "0" }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>In person · Elephant Road shop</span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>03 Aug 2025 · Rakib Hasan</span>
                        </div>
                        <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "var(--body)" }}>Demo on the counter; signed up on the spot, Growth plan.</div>
                      </div>
                      <div style={{ padding: "10px 0", borderTop: "1px solid var(--line)" }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Video call · 50 min</span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>06 Aug 2025 · Tania Sultana</span>
                        </div>
                        <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "var(--body)" }}>Imported products from his Excel sheet; set up two price lists.</div>
                      </div>
                      <div style={{ padding: "10px 0", borderTop: "1px solid var(--line)" }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Phone · 20 min</span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>27 Feb 2026 · Rakib Hasan</span>
                        </div>
                        <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", lineHeight: "1.5", color: "var(--body)" }}>Upgrade to Business after the Analytics trial.</div>
                      </div>
                    </section>
                  </div>
                </div>
              </>) : null}
              {v.is_support ? (<>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "12px" }}>
                    <div className="kpi">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <span className="kl" title="Open tickets">Open tickets</span>
                        <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                          <path d="M0.0,19.0 L4.3,18.7 L8.5,17.4 L12.8,17.3 L17.1,17.5 L21.3,17.2 L25.6,15.5 L29.9,14.8 L34.1,14.1 L38.4,11.8 L42.7,10.5 L46.9,8.5 L51.2,6.4 L55.5,4.8 L59.7,3.0 L64.0,3.4 L64,22 L0,22 Z" fill="#ff5724" opacity=".10" />
                          <path d="M0.0,19.0 L4.3,18.7 L8.5,17.4 L12.8,17.3 L17.1,17.5 L21.3,17.2 L25.6,15.5 L29.9,14.8 L34.1,14.1 L38.4,11.8 L42.7,10.5 L46.9,8.5 L51.2,6.4 L55.5,4.8 L59.7,3.0 L64.0,3.4" fill="none" stroke="#ff5724" strokeWidth="1.7" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="1">1</span>
                      <div>
                        <span className="dpill d-bad">urgent · courier</span>
                      </div>
                    </div>
                    <div className="kpi">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <span className="kl" title="Tickets, 90 days">Tickets, 90 days</span>
                        <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                          <path d="M0.0,19.0 L4.3,18.9 L8.5,17.3 L12.8,16.3 L17.1,16.6 L21.3,14.8 L25.6,13.3 L29.9,12.3 L34.1,10.5 L38.4,10.0 L42.7,9.2 L46.9,9.7 L51.2,8.3 L55.5,6.5 L59.7,4.9 L64.0,3.0 L64,22 L0,22 Z" fill="#10b981" opacity=".10" />
                          <path d="M0.0,19.0 L4.3,18.9 L8.5,17.3 L12.8,16.3 L17.1,16.6 L21.3,14.8 L25.6,13.3 L29.9,12.3 L34.1,10.5 L38.4,10.0 L42.7,9.2 L46.9,9.7 L51.2,8.3 L55.5,6.5 L59.7,4.9 L64.0,3.0" fill="none" stroke="#10b981" strokeWidth="1.7" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="4">4</span>
                      <div>
                        <span className="dpill d-good">below the average of 6</span>
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
                      <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="4.7 / 5">4.7 / 5</span>
                      <div>
                        <span className="dpill d-good">3 ratings</span>
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
                      <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="12 min">12 min</span>
                      <div>
                        <span className="dpill d-good">target 30 min</span>
                      </div>
                    </div>
                  </div>
                  <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                      <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Tickets</h2>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }}>
                        <__Link href="/support-desk" className="rowlink">Open in support desk →</__Link>
                      </div>
                    </div>
                    <div style={{ margin: "0 -20px -16px" }}>
                      <div className="th" style={{ display: "grid", gridTemplateColumns: "90px minmax(0,1.8fr) 90px 220px 70px", gap: "12px", padding: "10px 18px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>
                        <span>Ticket</span>
                        <span>Subject</span>
                        <span>Priority</span>
                        <span>Status</span>
                        <span>Opened</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "90px minmax(0,1.8fr) 90px 220px 70px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", background: "#fff8e6" }}>
                        <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>T-2291</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Steadfast parcels not syncing since this morning</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "var(--body)" }}><span className="shp shp-err" />Urgent</span>
                        <span className="pill p-err" style={{ justifySelf: "start" }}>Open · reply overdue 25 min</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>Today</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "90px minmax(0,1.8fr) 90px 220px 70px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                        <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>T-2203</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Barcode scanner not reading new stickers</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "var(--body)" }}><span className="shp shp-none" />Normal</span>
                        <span className="pill p-ok" style={{ justifySelf: "start" }}>Solved in 2 h · rated 5</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>22 Aug</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "90px minmax(0,1.8fr) 90px 220px 70px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                        <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>T-2150</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>How to give a cashier discount rights</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "var(--body)" }}><span className="shp shp-ok" />Low</span>
                        <span className="pill p-ok" style={{ justifySelf: "start" }}>Solved in 20 min · rated 5</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>30 Jul</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "90px minmax(0,1.8fr) 90px 220px 70px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                        <span className="mono" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>T-2098</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Invoice for July with VAT</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "var(--body)" }}><span className="shp shp-ok" />Low</span>
                        <span className="pill p-ok" style={{ justifySelf: "start" }}>Solved in 1 day · rated 4</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>08 Jul</span>
                      </div>
                    </div>
                  </section>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)", gap: "14px", alignItems: "stretch" }}>
                    <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Sign-in and access</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }}>
                          <button className="btn btng" type="button" onClick={v.sendReset} style={{ minHeight: "36px", padding: "0 12px", fontSize: "var(--text-xs-plus)" }}>Send reset link</button>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "130px minmax(0,1fr) 110px", gap: "10px", alignItems: "center", minHeight: "42px", borderTop: "0" }}>
                        <span className="num" style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>02 Sep 2026 14:10</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Password reset link sent to the owner by SMS</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--body)", textAlign: "right" }}>Farhana Akter</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "130px minmax(0,1fr) 110px", gap: "10px", alignItems: "center", minHeight: "42px", borderTop: "1px solid var(--line)" }}>
                        <span className="num" style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>14 Jun 2026 21:32</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Owner asked for a reset link himself</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--body)", textAlign: "right" }}>Self</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "130px minmax(0,1fr) 110px", gap: "10px", alignItems: "center", minHeight: "42px", borderTop: "1px solid var(--line)" }}>
                        <span className="num" style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>19 Sep 2026 14:33</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Store viewed as owner, with consent · 6 min</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--body)", textAlign: "right" }}>Farhana Akter</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "130px minmax(0,1fr) 110px", gap: "10px", alignItems: "center", minHeight: "42px", borderTop: "1px solid var(--line)" }}>
                        <span className="num" style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>12 Aug 2025 11:05</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Two-factor sign-in turned on for the owner</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--body)", textAlign: "right" }}>Owner</span>
                      </div>
                    </section>
                    <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Before you call</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "var(--text-xs-plus)", lineHeight: "1.55", color: "var(--ink)" }}>
                        <div style={{ padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "var(--surface2)" }}>Best time: after 20:00. Speaks Bangla; prefers WhatsApp for screenshots.</div>
                        <div style={{ padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "var(--surface2)" }}>Open issues: Steadfast outage (not his fault), September invoice overdue, outage credit waiting for approval.</div>
                      </div>
                    </section>
                  </div>
                </div>
              </>) : null}
              {v.is_affiliates ? (<>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "14px", alignItems: "stretch" }}>
                    <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>Referral partner with GridCommerce</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }}>10% of each referred store's payments for 12 months · bKash payout</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "var(--radius-xl)", background: "var(--surface2)" }}>
                        <div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>His referral link</div>
                          <div className="mono" style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>gridcommerce.com.bd/r/dgh-arif</div>
                        </div>
                        <button className="btn btng" type="button" style={{ marginLeft: "auto", minHeight: "36px", padding: "0 12px", fontSize: "var(--text-xs-plus)" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect x="9" y="9" width="13" height="13" rx="2" />
  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
</svg>Copy</button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "10px", margin: "12px 0" }}>
                        <div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--body)" }}>Stores referred</div>
                          <div className="num" style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "var(--ink)" }}>5</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--body)" }}>Now paying</div>
                          <div className="num" style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "var(--ink)" }}>3</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--body)" }}>Earned</div>
                          <div className="num" style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "var(--ink)" }}>৳4,500</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--body)" }}>Paid out</div>
                          <div className="num" style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "var(--ink)" }}>৳3,250</div>
                        </div>
                      </div>
                      <div style={{ margin: "0 -20px -16px" }}>
                        <div className="th" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) 110px minmax(0,1fr) 90px", gap: "12px", padding: "10px 18px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--muted)" }}>
                          <span>Store he referred</span>
                          <span>Signed up</span>
                          <span>Status</span>
                          <span style={{ textAlign: "right" }}>Commission</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) 110px minmax(0,1fr) 90px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Tech Zone Uttara</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>11 Nov 2025</span>
                          <span className="pill p-ok" style={{ justifySelf: "start" }}>Paying · Growth</span>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>৳1,200</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) 110px minmax(0,1fr) 90px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Mobile Bari</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>04 Jan 2026</span>
                          <span className="pill p-ok" style={{ justifySelf: "start" }}>Paying · Business</span>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>৳2,250</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) 110px minmax(0,1fr) 90px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Gadget Corner Mirpur</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>19 Mar 2026</span>
                          <span className="pill p-ok" style={{ justifySelf: "start" }}>Paying · Growth</span>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>৳1,050</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) 110px minmax(0,1fr) 90px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Smart Shop BD</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>02 Sep 2026</span>
                          <span className="pill p-grey" style={{ justifySelf: "start" }}>Trial · day 14</span>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>Pending</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) 110px minmax(0,1fr) 90px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 18px", borderTop: "1px solid var(--line)" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Phone Point</span>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-regular)", color: "var(--body)" }}>15 Sep 2026</span>
                          <span className="pill p-grey" style={{ justifySelf: "start" }}>Trial · day 4</span>
                          <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)", textAlign: "right" }}>Pending</span>
                        </div>
                      </div>
                    </section>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                          <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>His store's own affiliate programme</h2>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }}>৳ thousand of sales through affiliates</div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "12px" }}>
                          <div className="kpi">
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                              <span className="kl" title="Active affiliates">Active affiliates</span>
                              <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                                <path d="M0.0,19.0 L4.3,17.3 L8.5,15.4 L12.8,14.5 L17.1,13.9 L21.3,12.1 L25.6,10.0 L29.9,10.6 L34.1,9.3 L38.4,8.1 L42.7,6.9 L46.9,5.7 L51.2,3.8 L55.5,3.0 L59.7,3.3 L64.0,3.2 L64,22 L0,22 Z" fill="#10b981" opacity=".10" />
                                <path d="M0.0,19.0 L4.3,17.3 L8.5,15.4 L12.8,14.5 L17.1,13.9 L21.3,12.1 L25.6,10.0 L29.9,10.6 L34.1,9.3 L38.4,8.1 L42.7,6.9 L46.9,5.7 L51.2,3.8 L55.5,3.0 L59.7,3.3 L64.0,3.2" fill="none" stroke="#10b981" strokeWidth="1.7" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="42">42</span>
                            <div>
                              <span className="dpill d-good">+6 this month</span>
                            </div>
                          </div>
                          <div className="kpi">
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                              <span className="kl" title="Affiliate sales, Sep">Affiliate sales, Sep</span>
                              <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                                <path d="M0.0,19.0 L4.3,18.3 L8.5,16.5 L12.8,15.7 L17.1,14.7 L21.3,12.8 L25.6,11.7 L29.9,10.5 L34.1,9.5 L38.4,8.1 L42.7,6.5 L46.9,5.9 L51.2,4.7 L55.5,4.7 L59.7,3.1 L64.0,3.0 L64,22 L0,22 Z" fill="#10b981" opacity=".10" />
                                <path d="M0.0,19.0 L4.3,18.3 L8.5,16.5 L12.8,15.7 L17.1,14.7 L21.3,12.8 L25.6,11.7 L29.9,10.5 L34.1,9.5 L38.4,8.1 L42.7,6.5 L46.9,5.9 L51.2,4.7 L55.5,4.7 L59.7,3.1 L64.0,3.0" fill="none" stroke="#10b981" strokeWidth="1.7" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="৳62,400">৳62,400</span>
                            <div>
                              <span className="dpill d-good">16% of his online sales</span>
                            </div>
                          </div>
                          <div className="kpi">
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                              <span className="kl" title="Commission he owes">Commission he owes</span>
                              <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: "none" }}>
                                <path d="M0.0,19.0 L4.3,17.5 L8.5,16.0 L12.8,16.1 L17.1,13.5 L21.3,12.7 L25.6,12.5 L29.9,9.1 L34.1,12.8 L38.4,9.6 L42.7,7.5 L46.9,5.1 L51.2,4.3 L55.5,3.0 L59.7,6.9 L64.0,6.5 L64,22 L0,22 Z" fill="#6683b7" opacity=".10" />
                                <path d="M0.0,19.0 L4.3,17.5 L8.5,16.0 L12.8,16.1 L17.1,13.5 L21.3,12.7 L25.6,12.5 L29.9,9.1 L34.1,12.8 L38.4,9.6 L42.7,7.5 L46.9,5.1 L51.2,4.3 L55.5,3.0 L59.7,6.9 L64.0,6.5" fill="none" stroke="#6683b7" strokeWidth="1.7" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <span className="num ell" style={{ fontSize: "var(--text-2xl)", lineHeight: "1.2", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "var(--ink)" }} title="৳3,120">৳3,120</span>
                            <div>
                              <span className="dpill d-flat">pays on the 5th</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ marginTop: "12px" }}>
                          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "158px" }}>
                            <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "6px", minWidth: "0" }}>
                              <span className="num" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>31</span>
                              <span style={{ width: "70%", maxWidth: "44px", height: "55px", borderRadius: "var(--radius-md) var(--radius-md) 2px 2px", background: "#003087" }} />
                              <span style={{ fontSize: "var(--text-xs)", color: "var(--body)", textAlign: "center" }}>Apr</span>
                            </div>
                            <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "6px", minWidth: "0" }}>
                              <span className="num" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>38</span>
                              <span style={{ width: "70%", maxWidth: "44px", height: "67px", borderRadius: "var(--radius-md) var(--radius-md) 2px 2px", background: "#003087" }} />
                              <span style={{ fontSize: "var(--text-xs)", color: "var(--body)", textAlign: "center" }}>May</span>
                            </div>
                            <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "6px", minWidth: "0" }}>
                              <span className="num" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>44</span>
                              <span style={{ width: "70%", maxWidth: "44px", height: "78px", borderRadius: "var(--radius-md) var(--radius-md) 2px 2px", background: "#003087" }} />
                              <span style={{ fontSize: "var(--text-xs)", color: "var(--body)", textAlign: "center" }}>Jun</span>
                            </div>
                            <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "6px", minWidth: "0" }}>
                              <span className="num" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>52</span>
                              <span style={{ width: "70%", maxWidth: "44px", height: "92px", borderRadius: "var(--radius-md) var(--radius-md) 2px 2px", background: "#003087" }} />
                              <span style={{ fontSize: "var(--text-xs)", color: "var(--body)", textAlign: "center" }}>Jul</span>
                            </div>
                            <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "6px", minWidth: "0" }}>
                              <span className="num" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>58</span>
                              <span style={{ width: "70%", maxWidth: "44px", height: "103px", borderRadius: "var(--radius-md) var(--radius-md) 2px 2px", background: "#003087" }} />
                              <span style={{ fontSize: "var(--text-xs)", color: "var(--body)", textAlign: "center" }}>Aug</span>
                            </div>
                            <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "6px", minWidth: "0" }}>
                              <span className="num" style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>62</span>
                              <span style={{ width: "70%", maxWidth: "44px", height: "110px", borderRadius: "var(--radius-md) var(--radius-md) 2px 2px", background: "#003087" }} />
                              <span style={{ fontSize: "var(--text-xs)", color: "var(--body)", textAlign: "center" }}>Sep</span>
                            </div>
                          </div>
                        </div>
                      </section>
                      <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                          <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "var(--ink)" }}>His top affiliates</h2>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-xs)", color: "var(--muted)" }} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "40px", borderTop: "0" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Tanvir Tech Reviews</span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>YouTube</span>
                          <span className="num" style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>৳21,300</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "40px", borderTop: "1px solid var(--line)" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Mirpur Gadget Group</span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>Facebook group</span>
                          <span className="num" style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>৳14,800</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "40px", borderTop: "1px solid var(--line)" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>Nabil · campus rep</span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--muted)" }}>Referral code</span>
                          <span className="num" style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--ink)" }}>৳8,900</span>
                        </div>
                      </section>
                    </div>
                  </div>
                  <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--body)" }}>He was not referred by anyone: he came from a field visit.</div>
                </div>
              </>) : null}
              {v.is_activity ? (<>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button className="fchip on" type="button" aria-pressed="true">Everything</button>
                      <button className="fchip" type="button" aria-pressed="false">Owner and team</button>
                      <button className="fchip" type="button" aria-pressed="false">Staff</button>
                      <button className="fchip" type="button" aria-pressed="false">Billing</button>
                      <button className="fchip" type="button" aria-pressed="false">System</button>
                    </div>
                    <span style={{ marginLeft: "auto" }}>
                      <__Link href="/audit-log" className="btn btng" style={{ minHeight: "40px", fontSize: "var(--text-xs-plus)" }}>Full audit log</__Link>
                    </span>
                  </div>
                  <section className="panel" style={{ padding: "16px 20px", minWidth: "0" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "110px 90px minmax(0,1fr)", gap: "12px", alignItems: "center", minHeight: "44px", borderTop: "0" }}>
                      <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>Today 10:07</span>
                      <span className="pill p-navy" style={{ justifySelf: "start" }}>Staff</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Farhana Akter replied on ticket T-2291</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "110px 90px minmax(0,1fr)", gap: "12px", alignItems: "center", minHeight: "44px", borderTop: "1px solid var(--line)" }}>
                      <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>Today 10:02</span>
                      <span className="pill p-sky" style={{ justifySelf: "start" }}>Owner</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Arif Hossain signed in from Dhaka · Chrome on Android</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "110px 90px minmax(0,1fr)", gap: "12px", alignItems: "center", minHeight: "44px", borderTop: "1px solid var(--line)" }}>
                      <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>Today 09:48</span>
                      <span className="pill p-sky" style={{ justifySelf: "start" }}>Manager</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Sumon Roy updated prices on 6 products</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "110px 90px minmax(0,1fr)", gap: "12px", alignItems: "center", minHeight: "44px", borderTop: "1px solid var(--line)" }}>
                      <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>19 Sep 14:33</span>
                      <span className="pill p-warn" style={{ justifySelf: "start" }}>Staff</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Store viewed as owner, with consent, 6 min</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "110px 90px minmax(0,1fr)", gap: "12px", alignItems: "center", minHeight: "44px", borderTop: "1px solid var(--line)" }}>
                      <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>18 Sep 20:15</span>
                      <span className="pill p-navy" style={{ justifySelf: "start" }}>Staff</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Collection call: promised to pay Sunday</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "110px 90px minmax(0,1fr)", gap: "12px", alignItems: "center", minHeight: "44px", borderTop: "1px solid var(--line)" }}>
                      <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>17 Sep 00:00</span>
                      <span className="pill p-grey" style={{ justifySelf: "start" }}>System</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>INV-2026-0912 became overdue; store entered grace</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "110px 90px minmax(0,1fr)", gap: "12px", alignItems: "center", minHeight: "44px", borderTop: "1px solid var(--line)" }}>
                      <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>12 Sep 11:30</span>
                      <span className="pill p-navy" style={{ justifySelf: "start" }}>Staff</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Warehouse trial started for 14 days, by Farhana Akter</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "110px 90px minmax(0,1fr)", gap: "12px", alignItems: "center", minHeight: "44px", borderTop: "1px solid var(--line)" }}>
                      <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>02 Sep 14:10</span>
                      <span className="pill p-navy" style={{ justifySelf: "start" }}>Staff</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Password reset link sent by SMS, by Farhana Akter</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "110px 90px minmax(0,1fr)", gap: "12px", alignItems: "center", minHeight: "44px", borderTop: "1px solid var(--line)" }}>
                      <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>27 Feb 2026</span>
                      <span className="pill p-navy" style={{ justifySelf: "start" }}>Staff</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Plan changed Growth → Business, prorated ৳1,050</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "110px 90px minmax(0,1fr)", gap: "12px", alignItems: "center", minHeight: "44px", borderTop: "1px solid var(--line)" }}>
                      <span className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>05 Aug 2025</span>
                      <span className="pill p-sky" style={{ justifySelf: "start" }}>Owner</span>
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--ink)" }}>Store created on a field visit</span>
                    </div>
                  </section>
                </div>
              </>) : null}
            </div>
            {v.toast ? (<>
              <div role="status" className="toast"><span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "var(--radius-full)", background: "#10b981", color: "#04121f" }}>
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
</span>Reset link sent to +880 1711-XXXXXX by SMS · written to the audit log<button type="button" onClick={v.hideToast} aria-label="Dismiss" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", border: "0", borderRadius: "var(--radius-lg)", background: "rgba(255,255,255,.1)", color: "#fff", cursor: "pointer" }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
</button></div>
            </>) : null}
          </main>
        </div>
      </div>
    );
  }
}
