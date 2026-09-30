'use client';
// Generated from design/templates/app/MStock.dc.html by scripts/convert-design.mjs.
// Merchant app · Stock
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

.pav{position:relative;flex:none;width:52px;height:52px}
.pav .face{width:52px;height:52px;border-radius:var(--radius-full);object-fit:cover;display:flex;align-items:center;justify-content:center;font-weight:var(--weight-semibold);font-size:var(--text-base)}
.pav .pb{position:absolute;right:-3px;bottom:-3px;width:22px;height:22px;border-radius:var(--radius-full);background:#fff;padding:2px;box-shadow:0 1px 3px rgba(15,23,42,.18)}
.pav .pb img{width:18px;height:18px;display:block;border-radius:var(--radius-full)}
.pav .on{position:absolute;right:1px;top:1px;width:12px;height:12px;border-radius:var(--radius-full);background:#10b981;border:2px solid #fff}
.pchip{flex:none;display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 14px 0 8px;border-radius:var(--radius-full);border:1px solid var(--line);background:var(--card);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--body);white-space:nowrap}
.pchip img{width:22px;height:22px;border-radius:var(--radius-full)}
.pchip.on{background:var(--ink);color:#fff;border-color:var(--ink);padding-left:14px}
.bar{height:6px;border-radius:var(--radius-full);background:#edf1f6;overflow:hidden}.bar i{display:block;height:100%;border-radius:var(--radius-full)}
.lrow{display:flex;align-items:center;gap:14px;padding:14px 16px}
.lrow + .lrow{border-top:1px solid var(--line)}
`;

// ---- markup ----

export default class MStockScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="MStock">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="ph" style={{ height: "960px" }}>
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
          <header className="appbar">
            <__Link href="/m-more" className="ib" aria-label="Back">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </__Link>
            <h1>Stock</h1>
            <__Link href="/m-scan" className="ib" aria-label="Scan">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8v8M10 8v8M14 8v8M17 8v8" />
              </svg>
            </__Link>
          </header>
          <div className="content" style={{ top: "103px", bottom: "0" }}>
            <div className="chips" style={{ marginTop: "2px" }}>
              <span className="chip on">All branches</span>
              <span className="chip">Dhanmondi</span>
              <span className="chip">Gulshan</span>
              <span className="chip">Mirpur godown</span>
            </div>
            <div className="card" style={{ margin: "16px 20px 0", padding: "18px 18px 16px" }}>
              <div className="k">Stock value · at cost</div>
              <div className="v num" style={{ fontSize: "var(--text-3xl)" }}>৳18,42,600</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", marginTop: "14px" }}>
                <a href="#" style={{ padding: "10px 12px", borderRadius: "var(--radius-xl)", background: "var(--errbg)" }}>
                  <div className="num" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "var(--err)" }}>7</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "#8a3510" }}>Out of stock</div>
                </a>
                <a href="#" style={{ padding: "10px 12px", borderRadius: "var(--radius-xl)", background: "var(--warnbg)" }}>
                  <div className="num" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "var(--warn)" }}>23</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "#7a3e05" }}>Low stock</div>
                </a>
                <a href="#" style={{ padding: "10px 12px", borderRadius: "var(--radius-xl)", background: "var(--soft)" }}>
                  <div className="num" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "var(--brand)" }}>11</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "#1e3a6e" }}>Expiring</div>
                </a>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", padding: "18px 20px 0" }}>
              <a className="tile" href="#"><span className="ico">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62L18.3 9.38a1 1 0 0 0-.78-.38H14" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </svg>
</span>Transfer</a>
              <a className="tile" href="#"><span className="ico">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2h12l1 4H5z" />
    <path d="M5 6h14v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
    <path d="M9 11h6M9 15h4" />
  </svg>
</span>Count</a>
              <a className="tile" href="#"><span className="ico">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
</span>Adjust</a>
              <a className="tile" href="#"><span className="ico">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
</span>Damage</a>
            </div>
            <div className="seg" style={{ marginTop: "20px" }}>
              <span className="on">Needs action</span>
              <span>All items</span>
              <span>Expiring</span>
            </div>
            <div className="card" style={{ margin: "14px 20px 0" }}>
              <div className="lrow">
                <span className="av" style={{ width: "48px", height: "48px", background: "#fff4e0", color: "#003087", fontSize: "var(--text-lg)" }}>S</span>
                <span style={{ flex: "1", minWidth: "0" }}>
                  <span className="ell" style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-medium)" }}>Sunscreen SPF 50 · 50ml</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "var(--err)", marginTop: "2px" }}><span className="sh err" style={{ color: "var(--text-danger)" }} />4 left · reorder at 20</span>
                  <span className="bar" style={{ display: "block", marginTop: "8px" }}>
                    <i style={{ width: "10%", background: "#ff5724" }} />
                  </span>
                </span>
                <__Link href="/m-purchase-new" className="btn btns" style={{ flex: "none", height: "36px", padding: "0 12px", fontSize: "var(--text-xs-plus)", borderRadius: "var(--radius-lg)" }}>Reorder</__Link>
              </div>
              <div className="lrow">
                <span className="av" style={{ width: "48px", height: "48px", background: "#e7f7f0", color: "#003087", fontSize: "var(--text-lg)" }}>R</span>
                <span style={{ flex: "1", minWidth: "0" }}>
                  <span className="ell" style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-medium)" }}>Rice Water Cleanser 150ml</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "var(--warn)", marginTop: "2px" }}><span className="sh warn" style={{ color: "var(--text-warning)" }} />8 left · reorder at 15</span>
                  <span className="bar" style={{ display: "block", marginTop: "8px" }}>
                    <i style={{ width: "27%", background: "#ff9800" }} />
                  </span>
                </span>
                <__Link href="/m-purchase-new" className="btn btns" style={{ flex: "none", height: "36px", padding: "0 12px", fontSize: "var(--text-xs-plus)", borderRadius: "var(--radius-lg)" }}>Reorder</__Link>
              </div>
              <div className="lrow">
                <span className="av" style={{ width: "48px", height: "48px", background: "#fde7ef", color: "#003087", fontSize: "var(--text-lg)" }}>V</span>
                <span style={{ flex: "1", minWidth: "0" }}>
                  <span className="ell" style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-medium)" }}>Vitamin C Serum 30ml</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "var(--err)", marginTop: "2px" }}><span className="sh err" style={{ color: "var(--text-danger)" }} />Out of stock · 14 on order</span>
                  <span className="bar" style={{ display: "block", marginTop: "8px" }}>
                    <i style={{ width: "0%", background: "#ff5724" }} />
                  </span>
                </span>
                <__Link href="/m-purchase-new" className="btn btns" style={{ flex: "none", height: "36px", padding: "0 12px", fontSize: "var(--text-xs-plus)", borderRadius: "var(--radius-lg)" }}>Track</__Link>
              </div>
              <div className="lrow">
                <span className="av" style={{ width: "48px", height: "48px", background: "#e0f3fb", color: "#003087", fontSize: "var(--text-lg)" }}>D</span>
                <span style={{ flex: "1", minWidth: "0" }}>
                  <span className="ell" style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-medium)" }}>Denim Jeans · Blue · 32</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "var(--muted)", marginTop: "2px" }}><span className="sh ok" style={{ color: "var(--text-success)" }} />40 in stock · 3 weeks left</span>
                  <span className="bar" style={{ display: "block", marginTop: "8px" }}>
                    <i style={{ width: "100%", background: "#10b981" }} />
                  </span>
                </span>
              </div>
              <div className="lrow">
                <span className="av" style={{ width: "48px", height: "48px", background: "#e7f7f0", color: "#003087", fontSize: "var(--text-lg)" }}>A</span>
                <span style={{ flex: "1", minWidth: "0" }}>
                  <span className="ell" style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-medium)" }}>Aloe Soothing Gel 300ml</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "var(--muted)", marginTop: "2px" }}><span className="sh ok" style={{ color: "var(--text-success)" }} />120 in stock · expires Mar 2027</span>
                  <span className="bar" style={{ display: "block", marginTop: "8px" }}>
                    <i style={{ width: "100%", background: "#10b981" }} />
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div className="hi" aria-hidden="true" />
        </div>
      </div>
    );
  }
}
