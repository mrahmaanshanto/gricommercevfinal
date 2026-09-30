'use client';
// Generated from design/templates/app/MProducts.dc.html by scripts/convert-design.mjs.
// Merchant app · Products
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
  position:relative;width:min(390px,100%);height:844px;overflow:hidden;background:var(--bg);font-size:var(--text-sm-plus);line-height:1.5;font-family:var(--font-sans)}
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

export default class MProductsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="MProducts">
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
              <h1 style={{ flex: "1", margin: "0", fontSize: "var(--text-3xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)" }}>Products</h1>
              <a className="ib soft" href="#" aria-label="Filters">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 6h18M7 12h10M10 18h4" />
                </svg>
              </a>
            </div>
            <__Link href="/m-scan" className="srch" style={{ marginTop: "14px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <span>Name, SKU or barcode</span>
              <span className="sc">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8v8M10 8v8M14 8v8M17 8v8" />
                </svg>
              </span>
            </__Link>
            <div className="chips" style={{ marginTop: "14px" }}>
              <span className="chip on">All <span className="n">412</span></span>
              <span className="chip">Low stock <span className="n">23</span></span>
              <span className="chip">Skin care</span>
              <span className="chip">Clothing</span>
            </div>
            <div className="card" style={{ margin: "16px 20px 0" }}>
              <__Link href="/m-product-edit" className="row">
                <span className="av" style={{ width: "52px", height: "52px", background: "#fff4e0", color: "#003087", fontSize: "var(--text-lg)" }}>S</span>
                <span className="m">
                  <span style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
                    <span className="t ell" style={{ fontWeight: "var(--weight-medium)", flex: "1" }}>Sunscreen SPF 50 · 50ml</span>
                    <span className="num" style={{ fontWeight: "var(--weight-medium)", flex: "none" }}>৳1,250</span>
                  </span>
                  <span style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                    <span className="pill p-err"><span className="sh err" aria-hidden="true" />4 left</span>
                    <span className="s mono ell" style={{ fontSize: "var(--text-xs)" }}>8941100500235</span>
                  </span>
                </span>
              </__Link>
              <__Link href="/m-product-edit" className="row">
                <span className="av" style={{ width: "52px", height: "52px", background: "#e0f3fb", color: "#003087", fontSize: "var(--text-lg)" }}>D</span>
                <span className="m">
                  <span style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
                    <span className="t ell" style={{ fontWeight: "var(--weight-medium)", flex: "1" }}>Denim Jeans · Blue · 32</span>
                    <span className="num" style={{ fontWeight: "var(--weight-medium)", flex: "none" }}>৳1,890</span>
                  </span>
                  <span style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                    <span className="pill p-ok"><span className="sh ok" aria-hidden="true" />40 in stock</span>
                    <span className="s mono ell" style={{ fontSize: "var(--text-xs)" }}>8941200200214</span>
                  </span>
                </span>
              </__Link>
              <__Link href="/m-product-edit" className="row">
                <span className="av" style={{ width: "52px", height: "52px", background: "#eef2f6", color: "#003087", fontSize: "var(--text-lg)" }}>M</span>
                <span className="m">
                  <span style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
                    <span className="t ell" style={{ fontWeight: "var(--weight-medium)", flex: "1" }}>Men’s Polo · Navy · M</span>
                    <span className="num" style={{ fontWeight: "var(--weight-medium)", flex: "none" }}>৳1,450</span>
                  </span>
                  <span style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                    <span className="pill p-ok"><span className="sh ok" aria-hidden="true" />60 in stock</span>
                    <span className="s mono ell" style={{ fontSize: "var(--text-xs)" }}>8941200100118</span>
                  </span>
                </span>
              </__Link>
              <__Link href="/m-product-edit" className="row">
                <span className="av" style={{ width: "52px", height: "52px", background: "#e7f7f0", color: "#003087", fontSize: "var(--text-lg)" }}>R</span>
                <span className="m">
                  <span style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
                    <span className="t ell" style={{ fontWeight: "var(--weight-medium)", flex: "1" }}>Rice Water Cleanser 150ml</span>
                    <span className="num" style={{ fontWeight: "var(--weight-medium)", flex: "none" }}>৳890</span>
                  </span>
                  <span style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                    <span className="pill p-warn"><span className="sh warn" aria-hidden="true" />8 left</span>
                    <span className="s mono ell" style={{ fontSize: "var(--text-xs)" }}>8941100500341</span>
                  </span>
                </span>
              </__Link>
              <__Link href="/m-product-edit" className="row">
                <span className="av" style={{ width: "52px", height: "52px", background: "#eef2f6", color: "#003087", fontSize: "var(--text-lg)" }}>C</span>
                <span className="m">
                  <span style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
                    <span className="t ell" style={{ fontWeight: "var(--weight-medium)", flex: "1" }}>Cotton T-shirt · Black · M</span>
                    <span className="num" style={{ fontWeight: "var(--weight-medium)", flex: "none" }}>৳590</span>
                  </span>
                  <span style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                    <span className="pill p-ok"><span className="sh ok" aria-hidden="true" />80 in stock</span>
                    <span className="s mono ell" style={{ fontSize: "var(--text-xs)" }}>8941200300311</span>
                  </span>
                </span>
              </__Link>
              <__Link href="/m-product-edit" className="row">
                <span className="av" style={{ width: "52px", height: "52px", background: "#e0f3fb", color: "#003087", fontSize: "var(--text-lg)" }}>A</span>
                <span className="m">
                  <span style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
                    <span className="t ell" style={{ fontWeight: "var(--weight-medium)", flex: "1" }}>Aloe Soothing Gel 300ml</span>
                    <span className="num" style={{ fontWeight: "var(--weight-medium)", flex: "none" }}>৳690</span>
                  </span>
                  <span style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                    <span className="pill p-ok"><span className="sh ok" aria-hidden="true" />120 in stock</span>
                    <span className="s mono ell" style={{ fontSize: "var(--text-xs)" }}>8941100500433</span>
                  </span>
                </span>
              </__Link>
            </div>
          </div>
          <__Link href="/m-product-edit" className="fab" aria-label="Add product">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </__Link>
          <div className="tabfade" aria-hidden="true" />
          <nav className="tabs" aria-label="Main">
            <__Link href="/m-home" className=""><span className="tw">
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </svg>
</span>Home</__Link>
            <__Link href="/m-orders" className=""><span className="tw">
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2h12l1 4H5z" />
    <path d="M5 6h14v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
    <path d="M9 11h6M9 15h4" />
  </svg>
  <span className="cnt" aria-label="12 new">12</span>
</span>Orders</__Link>
            <__Link href="/m-products" className="on" aria-current="page"><span className="tw">
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
  </svg>
</span>Products</__Link>
            <__Link href="/m-inbox" className=""><span className="tw">
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z" />
  </svg>
  <span className="cnt" aria-label="3 new">3</span>
</span>Inbox</__Link>
            <__Link href="/m-more" className=""><span className="tw">
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
