'use client';
// Generated from design/templates/app/CHome.dc.html by scripts/convert-design.mjs.
// Staff app · Home
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  renderVals() { return {}; }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
*{box-sizing:border-box}
body{margin:0;background:#dfe5ee;font-family:var(--font-sans);-webkit-font-smoothing:antialiased;color:#0f172a}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit}
.bn{font-family:var(--font-bn)}
.mono{font-family:var(--font-data)}
.num{font-variant-numeric:tabular-nums}
.ph{--brand:#003087;--brand2:#0a4bb5;--sky:#009cde;--ink:#0f172a;--body:#475569;--muted:var(--text-muted);--line:#e8edf3;--bg:#f5f7fa;--card:#ffffff;--soft:#eef3fa;
  --ok:#0f9f6e;--okbg:#e7f7f0;--warn:#b45309;--warnbg:#fff4e0;--err:#c2410c;--errbg:#ffece5;
  position:relative;width:390px;height:844px;overflow:hidden;background:var(--bg);font-size:var(--text-sm-plus);line-height:1.5;font-family:var(--font-sans)}
.sb{position:absolute;top:0;left:0;right:0;height:47px;display:flex;align-items:center;justify-content:space-between;padding:0 28px 0 34px;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);z-index:6}
.sb .r{display:flex;gap:6px;align-items:center}
.appbar{position:absolute;top:47px;left:0;right:0;height:56px;display:flex;align-items:center;gap:4px;padding:0 8px;z-index:5;background:var(--bg)}
.appbar h1{flex:1;margin:0;font-size:var(--text-lg);font-weight:var(--weight-semibold);text-align:center;letter-spacing:0}
.ib{width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:var(--radius-full);background:transparent;color:var(--ink);position:relative;cursor:pointer}
.ib.soft{background:var(--card);box-shadow:0 1px 2px rgba(15,23,42,.06)}
.dot{position:absolute;top:9px;right:10px;width:8px;height:8px;border-radius:var(--radius-full);background:#ff5724;border:2px solid var(--card)}
.big{padding:4px 20px 0}
.big .eyebrow{font-size:var(--text-xs-plus);color:var(--muted)}
.big h1{margin:2px 0 0;font-size:var(--text-3xl);line-height:38px;font-weight:var(--weight-semibold);letter-spacing:var(--tracking-tight)}
.content{position:absolute;left:0;right:0;overflow:hidden}
.pad{padding:0 20px}
.card{background:var(--card);border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px -16px rgba(15,23,42,.18)}
.sec{display:flex;align-items:baseline;justify-content:space-between;margin:24px 20px 10px}
.sec h2{margin:0;font-size:var(--text-base);font-weight:var(--weight-semibold)}
.sec a{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--brand)}
.row{display:flex;align-items:center;gap:14px;min-height:64px;padding:12px 16px}
.row + .row{border-top:1px solid var(--line)}
.row .t{font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--ink);line-height:20px}
.row .s{font-size:var(--text-xs-plus);color:var(--muted);line-height:18px}
.row .m{min-width:0;flex:1}
.ell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.av{flex:none;width:44px;height:44px;border-radius:var(--radius-xl);display:flex;align-items:center;justify-content:center;font-weight:var(--weight-semibold);font-size:var(--text-sm-plus)}
.ico{flex:none;width:44px;height:44px;border-radius:var(--radius-xl);display:flex;align-items:center;justify-content:center;background:var(--soft);color:var(--brand)}
.pill{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 9px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.p-ok{background:var(--okbg);color:var(--ok)}.p-warn{background:var(--warnbg);color:var(--warn)}.p-err{background:var(--errbg);color:var(--err)}.p-nav{background:var(--soft);color:var(--brand)}.p-grey{background:#eef1f5;color:#475569}
.sh{width:8px;height:8px;flex:none}.sh.ok{border-radius:var(--radius-full);background:currentColor}.sh.warn{width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:8px solid currentColor}.sh.err{transform:rotate(45deg);width:7px;height:7px;background:currentColor;border-radius:1px}
.chips{display:flex;gap:8px;padding:0 20px;overflow:hidden}
.chip{flex:none;display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:var(--radius-full);border:1px solid var(--line);background:var(--card);font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--body);white-space:nowrap}
.chip.on{background:var(--ink);border-color:var(--ink);color:#fff}
.chip .n{font-size:var(--text-xs);font-weight:var(--weight-medium);opacity:.7}
.seg{display:flex;margin:0 20px;padding:4px;border-radius:var(--radius-xl);background:#e9eef5}
.seg span{flex:1;height:36px;display:flex;align-items:center;justify-content:center;gap:6px;border-radius:var(--radius-lg);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--body)}
.seg span.on{background:var(--card);color:var(--ink);font-weight:var(--weight-medium);box-shadow:0 1px 3px rgba(15,23,42,.1)}
.srch{display:flex;align-items:center;gap:10px;height:48px;margin:0 20px;padding:0 6px 0 16px;border-radius:var(--radius-xl);background:var(--card);border:1px solid var(--line);color:var(--muted);font-size:var(--text-sm-plus)}
.srch .sc{margin-left:auto;width:36px;height:36px;border-radius:var(--radius-lg);background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border:0;border-radius:var(--radius-lg);font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer}
.btnp{background:var(--brand);color:#fff}.btns{background:var(--soft);color:var(--brand)}.btnl{background:var(--card);color:var(--ink);border:1px solid var(--line)}
.btnd{background:var(--errbg);color:var(--err)}
.fab{position:absolute;right:20px;bottom:96px;width:56px;height:56px;border-radius:var(--radius-xl);background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 24px -8px rgba(0,48,135,.55);z-index:5}
.tabfade{position:absolute;left:0;right:0;bottom:0;height:108px;background:linear-gradient(to top,var(--bg) 42%,rgba(245,247,250,0));pointer-events:none;z-index:5}
.tabs{position:absolute;left:28px;right:28px;bottom:24px;height:56px;padding:4px;display:flex;gap:2px;border-radius:28px;background:rgba(255,255,255,.78);backdrop-filter:blur(20px) saturate(1.6);-webkit-backdrop-filter:blur(20px) saturate(1.6);border:1px solid rgba(255,255,255,.95);box-shadow:0 14px 34px -12px rgba(15,23,42,.30),0 2px 6px -2px rgba(15,23,42,.08),inset 0 0 0 .5px rgba(15,23,42,.05);z-index:6}
.tabs a{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border-radius:var(--radius-xl);font-size:var(--text-2xs);line-height:15px;font-weight:var(--weight-medium);color:var(--text-muted);transition:background-color .2s,color .2s}
.tabs a.on{background:rgba(0,48,135,.08);color:var(--brand);font-weight:var(--weight-medium)}
.tabs .tw{position:relative;display:flex}
.cnt{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;border-radius:var(--radius-lg);background:var(--fill-danger);color:#fff;font-family:var(--font-sans);font-size:var(--text-xs);line-height:1;font-weight:var(--weight-medium);letter-spacing:0;font-variant-numeric:tabular-nums lining-nums;white-space:nowrap}
.tabs .cnt{position:absolute;top:-6px;left:12px;border:2px solid #fff;min-width:19px;height:17px;padding:0 4px;font-size:var(--text-2xs);border-radius:var(--radius-lg)}
.cnt.nav{background:var(--brand)}
.hi{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:134px;height:5px;border-radius:var(--radius-full);background:#0f172a;z-index:7}
.actbar{position:absolute;left:0;right:0;bottom:0;padding:12px 20px 34px;display:flex;gap:10px;background:rgba(255,255,255,.96);backdrop-filter:blur(12px);border-top:1px solid var(--line);z-index:6}
.actbar .btn{flex:1}
.field{display:flex;flex-direction:column;gap:6px}
.lab{font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--ink)}
.inp{height:44px;display:flex;align-items:center;gap:10px;padding:0 14px;border-radius:var(--radius-lg);border:1px solid #dbe2ec;background:var(--card);font-size:var(--text-sm);color:var(--ink)}
.inp.f{border-color:var(--brand);box-shadow:0 0 0 3px rgba(0,48,135,.12)}
.help{font-size:var(--text-xs-plus);color:var(--muted)}
.step{display:inline-flex;align-items:center;border:1px solid #dbe2ec;border-radius:var(--radius-xl);background:var(--card)}
.step b{min-width:34px;text-align:center;font-size:var(--text-sm-plus)}
.step span{width:36px;height:36px;display:flex;align-items:center;justify-content:center;color:var(--brand)}
.sw{position:relative;flex:none;width:50px;height:30px;border-radius:var(--radius-full);background:#cbd5e1}.sw::after{content:"";position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:var(--radius-full);background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.sw.on{background:var(--brand)}.sw.on::after{left:23px}
.scrim{position:absolute;inset:0;background:rgba(15,23,42,.45);z-index:8}
.sheet{position:absolute;left:0;right:0;bottom:0;background:var(--card);border-radius:28px 28px 0 0;padding:10px 20px 34px;z-index:9}
.grab{width:40px;height:5px;margin:0 auto 14px;border-radius:var(--radius-full);background:#d5dce6}
.k{font-size:var(--text-xs-plus);color:var(--muted)}.v{font-size:var(--text-2xl);font-weight:var(--weight-semibold);letter-spacing:var(--tracking-tight)}
.tile{display:flex;flex-direction:column;align-items:center;gap:8px;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--ink);text-align:center}
.tile .ico{width:56px;height:56px;border-radius:var(--radius-xl)}
.note{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-radius:var(--radius-xl);font-size:var(--text-sm);line-height:20px}
`;

// ---- markup ----

export default class CHomeScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="CHome">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="ph">
          <div className="sb" style={{ color: "#0f172a" }}>
            <span className="num">2:32</span>
            <span className="r">
              <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true" fill="#0f172a">
                <rect x="0" y="8" width="3" height="4" rx="1" />
                <rect x="5" y="5" width="3" height="7" rx="1" />
                <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
                <rect x="15" y="0" width="3" height="12" rx="1" />
              </svg>
              <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>4G</span>
              <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true">
                <rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="#0f172a" opacity=".4" />
                <rect x="2" y="2" width="17" height="9" rx="2" fill="#0f172a" />
                <path d="M25 4.5v4" stroke="#0f172a" strokeWidth="1.5" opacity=".5" />
              </svg>
            </span>
          </div>
          <div className="content" style={{ top: "47px", bottom: "0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 16px 0 20px" }}>
              <span className="av" style={{ width: "40px", height: "40px", borderRadius: "var(--radius-xl)", background: "#012169", color: "#fff", fontSize: "var(--text-xs-plus)" }}>FA</span>
              <span style={{ flex: "1", minWidth: "0" }}>
                <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--muted)" }}>Console · Support lead</span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}><span style={{ width: "8px", height: "8px", borderRadius: "var(--radius-full)", background: "#10b981" }} />Production</span>
              </span>
              <a className="ib soft" href="#" aria-label="Search">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </a>
              <a className="ib soft" href="#" aria-label="Notifications, 5 unread">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                <span className="dot" />
              </a>
            </div>
            <div className="big" style={{ paddingTop: "16px" }}>
              <h1>Overview</h1>
            </div>
            <__Link href="/c-ops" className="note" style={{ margin: "16px 20px 0", background: "var(--warnbg)", color: "#7a3e05" }}>
              <span style={{ flex: "none", marginTop: "1px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                  <path d="M12 9v4M12 17h.01" />
                </svg>
              </span>
              <span style={{ flex: "1" }}><b style={{ display: "block" }}>Steadfast webhooks delayed</b>38 stores affected · INC-114 · Rakib responding</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </__Link>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", margin: "14px 20px 0" }}>
              <div className="card" style={{ padding: "14px 16px" }}>
                <div className="k">Active stores</div>
                <div className="v num" style={{ marginTop: "2px" }}>62</div>
                <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>+3 this week</div>
              </div>
              <div className="card" style={{ padding: "14px 16px" }}>
                <div className="k">Recurring revenue</div>
                <div className="v num" style={{ marginTop: "2px" }}>৳88,000</div>
                <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>▲ 1.8%</div>
              </div>
              <div className="card" style={{ padding: "14px 16px" }}>
                <div className="k">Stores at risk</div>
                <div className="v num" style={{ marginTop: "2px" }}>5</div>
                <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>2 new</div>
              </div>
              <div className="card" style={{ padding: "14px 16px" }}>
                <div className="k">Open tickets</div>
                <div className="v num" style={{ marginTop: "2px" }}>12</div>
                <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>3 breaching</div>
              </div>
            </div>
            <div className="sec">
              <h2>Needs attention</h2>
              <__Link href="/c-merchants">All 9</__Link>
            </div>
            <div className="card" style={{ margin: "0 20px" }}>
              <__Link href="/c-merchant-detail" className="row">
                <span className="av" style={{ background: "#003087", color: "#fff", fontSize: "var(--text-xs-plus)" }}>DG</span>
                <span className="m">
                  <span className="t ell" style={{ display: "block" }}>Dhaka Gadget Hub</span>
                  <span className="s ell" style={{ display: "block" }}>Invoice unpaid · courier failing</span>
                </span>
                <span className="pill p-err"><span className="sh err" aria-hidden="true" />At risk</span>
              </__Link>
              <__Link href="/c-merchant-detail" className="row">
                <span className="av" style={{ background: "#003087", color: "#fff", fontSize: "var(--text-xs-plus)" }}>BB</span>
                <span className="m">
                  <span className="t ell" style={{ display: "block" }}>Bindu Beauty</span>
                  <span className="s ell" style={{ display: "block" }}>Read-only · no login 9 days</span>
                </span>
                <span className="pill p-err"><span className="sh err" aria-hidden="true" />At risk</span>
              </__Link>
              <__Link href="/c-merchant-detail" className="row">
                <span className="av" style={{ background: "#003087", color: "#fff", fontSize: "var(--text-xs-plus)" }}>NO</span>
                <span className="m">
                  <span className="t ell" style={{ display: "block" }}>Nodi Organic</span>
                  <span className="s ell" style={{ display: "block" }}>Setup stalled · no orders 6 days</span>
                </span>
                <span className="pill p-warn"><span className="sh warn" aria-hidden="true" />Watch</span>
              </__Link>
            </div>
            <div className="sec">
              <h2>Platform</h2>
              <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>99.96% uptime</span>
            </div>
            <div className="card" style={{ margin: "0 20px", padding: "14px 16px" }}>
              <div style={{ display: "flex", gap: "2px" }} aria-hidden="true">
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#ff9800" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
                <span style={{ flex: "1", height: "22px", borderRadius: "3px", background: "#10b981" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "var(--text-xs)", color: "var(--muted)" }}>
                <span>30 days ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>
          <div className="tabfade" aria-hidden="true" />
          <nav className="tabs" aria-label="Main">
            <__Link href="/c-home" className="on" aria-current="page"><span className="tw">
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </svg>
</span>Home</__Link>
            <__Link href="/c-merchants" className=""><span className="tw">
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9 5 3h14l2 6" />
    <path d="M4 9v11h16V9" />
    <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
    <path d="M10 20v-5h4v5" />
  </svg>
</span>Merchants</__Link>
            <__Link href="/c-tickets" className=""><span className="tw">
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2M13 17v2M13 11v2" />
  </svg>
  <span className="cnt" aria-label="12 new">12</span>
</span>Tickets</__Link>
            <__Link href="/c-collections" className=""><span className="tw">
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20M6 15h4" />
  </svg>
  <span className="cnt" aria-label="4 new">4</span>
</span>Billing</__Link>
            <__Link href="/c-more" className=""><span className="tw">
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" />
  </svg>
</span>More</__Link>
          </nav>
          <div className="hi" aria-hidden="true" />
        </div>
      </div>
    );
  }
}
