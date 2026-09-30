'use client';
// Generated from design/templates/app/MPurchase.dc.html by scripts/convert-design.mjs.
// Merchant app · Purchase
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
body{margin:0;background:#dfe5ee;font-family:'Poppins',system-ui,sans-serif;-webkit-font-smoothing:antialiased;color:#0f172a}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit}
.bn{font-family:'Hind Siliguri','Poppins',sans-serif}
.mono{font-family:'JetBrains Mono',ui-monospace,monospace}
.num{font-variant-numeric:tabular-nums}
.ph{--brand:#003087;--brand2:#0a4bb5;--sky:#009cde;--ink:#0f172a;--body:#475569;--muted:#64748b;--line:#e8edf3;--bg:#f5f7fa;--card:#ffffff;--soft:#eef3fa;
  --ok:#0f9f6e;--okbg:#e7f7f0;--warn:#b45309;--warnbg:#fff4e0;--err:#c2410c;--errbg:#ffece5;
  position:relative;width:390px;height:844px;overflow:hidden;background:var(--bg);font-size:15px;line-height:1.5;font-family:'Poppins','Hind Siliguri',system-ui,sans-serif}
.sb{position:absolute;top:0;left:0;right:0;height:47px;display:flex;align-items:center;justify-content:space-between;padding:0 28px 0 34px;font-size:15px;font-weight:600;z-index:6}
.sb .r{display:flex;gap:6px;align-items:center}
.appbar{position:absolute;top:47px;left:0;right:0;height:56px;display:flex;align-items:center;gap:4px;padding:0 8px;z-index:5;background:var(--bg)}
.appbar h1{flex:1;margin:0;font-size:17px;font-weight:600;text-align:center;letter-spacing:-.01em}
.ib{width:44px;height:44px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:14px;background:transparent;color:var(--ink);position:relative;cursor:pointer}
.ib.soft{background:var(--card);box-shadow:0 1px 2px rgba(15,23,42,.06)}
.dot{position:absolute;top:9px;right:10px;width:8px;height:8px;border-radius:99px;background:#ff5724;border:2px solid var(--card)}
.big{padding:4px 20px 0}
.big .eyebrow{font-size:13px;color:var(--muted)}
.big h1{margin:2px 0 0;font-size:28px;line-height:34px;font-weight:700;letter-spacing:-.025em}
.content{position:absolute;left:0;right:0;overflow:hidden}
.pad{padding:0 20px}
.card{background:var(--card);border-radius:20px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px -16px rgba(15,23,42,.18)}
.sec{display:flex;align-items:baseline;justify-content:space-between;margin:24px 20px 10px}
.sec h2{margin:0;font-size:16px;font-weight:600}
.sec a{font-size:14px;font-weight:500;color:var(--brand)}
.row{display:flex;align-items:center;gap:14px;min-height:64px;padding:12px 16px}
.row + .row{border-top:1px solid var(--line)}
.row .t{font-size:15px;font-weight:600;color:var(--ink);line-height:20px}
.row .s{font-size:13px;color:var(--muted);line-height:18px}
.row .m{min-width:0;flex:1}
.ell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.av{flex:none;width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:15px}
.ico{flex:none;width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:var(--soft);color:var(--brand)}
.pill{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 9px;border-radius:99px;font-size:12px;font-weight:600;white-space:nowrap}
.p-ok{background:var(--okbg);color:var(--ok)}.p-warn{background:var(--warnbg);color:var(--warn)}.p-err{background:var(--errbg);color:var(--err)}.p-nav{background:var(--soft);color:var(--brand)}.p-grey{background:#eef1f5;color:#475569}
.sh{width:8px;height:8px;flex:none}.sh.ok{border-radius:99px;background:currentColor}.sh.warn{width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:8px solid currentColor}.sh.err{transform:rotate(45deg);width:7px;height:7px;background:currentColor;border-radius:1px}
.chips{display:flex;gap:8px;padding:0 20px;overflow:hidden}
.chip{flex:none;display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:99px;border:1px solid var(--line);background:var(--card);font-size:14px;font-weight:500;color:var(--body);white-space:nowrap}
.chip.on{background:var(--ink);border-color:var(--ink);color:#fff}
.chip .n{font-size:12px;font-weight:600;opacity:.7}
.seg{display:flex;margin:0 20px;padding:4px;border-radius:14px;background:#e9eef5}
.seg span{flex:1;height:36px;display:flex;align-items:center;justify-content:center;gap:6px;border-radius:10px;font-size:14px;font-weight:500;color:var(--body)}
.seg span.on{background:var(--card);color:var(--ink);font-weight:600;box-shadow:0 1px 3px rgba(15,23,42,.1)}
.srch{display:flex;align-items:center;gap:10px;height:48px;margin:0 20px;padding:0 6px 0 16px;border-radius:16px;background:var(--card);border:1px solid var(--line);color:var(--muted);font-size:15px}
.srch .sc{margin-left:auto;width:36px;height:36px;border-radius:11px;background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:52px;padding:0 20px;border:0;border-radius:16px;font-size:16px;font-weight:600;cursor:pointer}
.btnp{background:var(--brand);color:#fff}.btns{background:var(--soft);color:var(--brand)}.btnl{background:var(--card);color:var(--ink);border:1px solid var(--line)}
.btnd{background:var(--errbg);color:var(--err)}
.fab{position:absolute;right:20px;bottom:96px;width:56px;height:56px;border-radius:20px;background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 24px -8px rgba(0,48,135,.55);z-index:5}
.tabfade{position:absolute;left:0;right:0;bottom:0;height:108px;background:linear-gradient(to top,var(--bg) 42%,rgba(245,247,250,0));pointer-events:none;z-index:5}
.tabs{position:absolute;left:28px;right:28px;bottom:24px;height:56px;padding:4px;display:flex;gap:2px;border-radius:28px;background:rgba(255,255,255,.78);backdrop-filter:blur(20px) saturate(1.6);-webkit-backdrop-filter:blur(20px) saturate(1.6);border:1px solid rgba(255,255,255,.95);box-shadow:0 14px 34px -12px rgba(15,23,42,.30),0 2px 6px -2px rgba(15,23,42,.08),inset 0 0 0 .5px rgba(15,23,42,.05);z-index:6}
.tabs a{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border-radius:24px;font-size:10px;line-height:12px;font-weight:500;color:#64748b;transition:background-color .2s,color .2s}
.tabs a.on{background:rgba(0,48,135,.08);color:var(--brand);font-weight:600}
.tabs .tw{position:relative;display:flex}
.cnt{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:#ff5724;color:#fff;font-family:'Poppins',system-ui,sans-serif;font-size:11px;line-height:1;font-weight:700;letter-spacing:0;font-variant-numeric:tabular-nums lining-nums;white-space:nowrap}
.tabs .cnt{position:absolute;top:-6px;left:12px;border:2px solid #fff;min-width:19px;height:17px;padding:0 4px;font-size:9.5px;border-radius:9px}
.cnt.nav{background:var(--brand)}
.hi{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:134px;height:5px;border-radius:99px;background:#0f172a;z-index:7}
.actbar{position:absolute;left:0;right:0;bottom:0;padding:12px 20px 34px;display:flex;gap:10px;background:rgba(255,255,255,.96);backdrop-filter:blur(12px);border-top:1px solid var(--line);z-index:6}
.actbar .btn{flex:1}
.field{display:flex;flex-direction:column;gap:6px}
.lab{font-size:13px;font-weight:600;color:var(--ink)}
.inp{height:52px;display:flex;align-items:center;gap:10px;padding:0 16px;border-radius:14px;border:1px solid #dbe2ec;background:var(--card);font-size:16px;color:var(--ink)}
.inp.f{border-color:var(--brand);box-shadow:0 0 0 3px rgba(0,48,135,.12)}
.help{font-size:12.5px;color:var(--muted)}
.step{display:inline-flex;align-items:center;border:1px solid #dbe2ec;border-radius:12px;background:var(--card)}
.step b{min-width:34px;text-align:center;font-size:15px}
.step span{width:36px;height:36px;display:flex;align-items:center;justify-content:center;color:var(--brand)}
.sw{position:relative;flex:none;width:50px;height:30px;border-radius:99px;background:#cbd5e1}.sw::after{content:"";position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:99px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.sw.on{background:var(--brand)}.sw.on::after{left:23px}
.scrim{position:absolute;inset:0;background:rgba(15,23,42,.45);z-index:8}
.sheet{position:absolute;left:0;right:0;bottom:0;background:var(--card);border-radius:28px 28px 0 0;padding:10px 20px 34px;z-index:9}
.grab{width:40px;height:5px;margin:0 auto 14px;border-radius:99px;background:#d5dce6}
.k{font-size:12.5px;color:var(--muted)}.v{font-size:22px;font-weight:700;letter-spacing:-.02em}
.tile{display:flex;flex-direction:column;align-items:center;gap:8px;font-size:12.5px;font-weight:500;color:var(--ink);text-align:center}
.tile .ico{width:56px;height:56px;border-radius:18px}
.note{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-radius:18px;font-size:14px;line-height:20px}

.pav{position:relative;flex:none;width:52px;height:52px}
.pav .face{width:52px;height:52px;border-radius:99px;object-fit:cover;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:16px}
.pav .pb{position:absolute;right:-3px;bottom:-3px;width:22px;height:22px;border-radius:99px;background:#fff;padding:2px;box-shadow:0 1px 3px rgba(15,23,42,.18)}
.pav .pb img{width:18px;height:18px;display:block;border-radius:99px}
.pav .on{position:absolute;right:1px;top:1px;width:12px;height:12px;border-radius:99px;background:#10b981;border:2px solid #fff}
.pchip{flex:none;display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 14px 0 8px;border-radius:99px;border:1px solid var(--line);background:var(--card);font-size:14px;font-weight:500;color:var(--body);white-space:nowrap}
.pchip img{width:22px;height:22px;border-radius:99px}
.pchip.on{background:var(--ink);color:#fff;border-color:var(--ink);padding-left:14px}
.bar{height:6px;border-radius:99px;background:#edf1f6;overflow:hidden}.bar i{display:block;height:100%;border-radius:99px}
.lrow{display:flex;align-items:center;gap:14px;padding:14px 16px}
.lrow + .lrow{border-top:1px solid var(--line)}
`;

// ---- markup ----

export default class MPurchaseScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="MPurchase">
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
              <span style={{ fontSize: "13px", fontWeight: "600" }}>4G</span>
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
            <h1>Purchase</h1>
            <a className="ib" href="#" aria-label="Filters">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 6h18M7 12h10M10 18h4" />
              </svg>
            </a>
          </header>
          <div className="content" style={{ top: "103px", bottom: "0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", margin: "2px 20px 0" }}>
              <div className="card" style={{ padding: "14px 16px" }}>
                <div className="k">Owed to suppliers</div>
                <div className="v num" style={{ color: "var(--err)" }}>৳1,86,400</div>
                <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>3 suppliers · 1 overdue</div>
              </div>
              <div className="card" style={{ padding: "14px 16px" }}>
                <div className="k">Arriving this week</div>
                <div className="v num">2 orders</div>
                <div style={{ fontSize: "12.5px", color: "var(--muted)" }}>420 items</div>
              </div>
            </div>
            <div className="chips" style={{ marginTop: "16px" }}>
              <span className="chip on">Open <span className="n">3</span></span>
              <span className="chip">Draft <span className="n">1</span></span>
              <span className="chip">Received</span>
              <span className="chip">Suppliers</span>
            </div>
            <div style={{ height: "14px" }} />
            <__Link href="/m-purchase-detail" className="card" style={{ display: "block", margin: "0 20px 12px", padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="mono" style={{ fontSize: "12.5px", color: "var(--muted)" }}>PO-0418</span>
                <span style={{ marginLeft: "auto" }}>
                  <span className="pill p-nav">Ordered</span>
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "10px", marginTop: "6px" }}>
                <div style={{ minWidth: "0" }}>
                  <div className="ell" style={{ fontSize: "16px", fontWeight: "600" }}>Seoul Beauty Imports</div>
                  <div style={{ fontSize: "13px", color: "var(--muted)" }}>Ordered 12 Sep · due 25 Sep</div>
                </div>
                <div className="num" style={{ fontSize: "17px", fontWeight: "700", flex: "none" }}>৳2,24,000</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                <span className="bar" style={{ flex: "1" }}>
                  <i style={{ width: "0%", background: "#003087" }} />
                </span>
                <span className="num" style={{ fontSize: "12.5px", color: "var(--muted)", flex: "none" }}>0/240 received</span>
              </div>
            </__Link>
            <__Link href="/m-purchase-detail" className="card" style={{ display: "block", margin: "0 20px 12px", padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="mono" style={{ fontSize: "12.5px", color: "var(--muted)" }}>PO-0417</span>
                <span style={{ marginLeft: "auto" }}>
                  <span className="pill p-warn"><span className="sh warn" aria-hidden="true" />Partly received</span>
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "10px", marginTop: "6px" }}>
                <div style={{ minWidth: "0" }}>
                  <div className="ell" style={{ fontSize: "16px", fontWeight: "600" }}>Dhaka Denim Works</div>
                  <div style={{ fontSize: "13px", color: "var(--muted)" }}>Arrived today</div>
                </div>
                <div className="num" style={{ fontSize: "17px", fontWeight: "700", flex: "none" }}>৳3,12,000</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                <span className="bar" style={{ flex: "1" }}>
                  <i style={{ width: "60%", background: "#003087" }} />
                </span>
                <span className="num" style={{ fontSize: "12.5px", color: "var(--muted)", flex: "none" }}>180/300 received</span>
              </div>
            </__Link>
            <__Link href="/m-purchase-detail" className="card" style={{ display: "block", margin: "0 20px 12px", padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="mono" style={{ fontSize: "12.5px", color: "var(--muted)" }}>PO-0415</span>
                <span style={{ marginLeft: "auto" }}>
                  <span className="pill p-ok"><span className="sh ok" aria-hidden="true" />Received</span>
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "10px", marginTop: "6px" }}>
                <div style={{ minWidth: "0" }}>
                  <div className="ell" style={{ fontSize: "16px", fontWeight: "600" }}>Green Leaf Traders</div>
                  <div style={{ fontSize: "13px", color: "var(--muted)" }}>Received 18 Sep</div>
                </div>
                <div className="num" style={{ fontSize: "17px", fontWeight: "700", flex: "none" }}>৳64,800</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                <span className="bar" style={{ flex: "1" }}>
                  <i style={{ width: "100%", background: "#10b981" }} />
                </span>
                <span className="num" style={{ fontSize: "12.5px", color: "var(--muted)", flex: "none" }}>120/120 received</span>
              </div>
            </__Link>
            <__Link href="/m-purchase-detail" className="card" style={{ display: "block", margin: "0 20px 12px", padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="mono" style={{ fontSize: "12.5px", color: "var(--muted)" }}>PO-0414</span>
                <span style={{ marginLeft: "auto" }}>
                  <span className="pill p-grey">Draft</span>
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "10px", marginTop: "6px" }}>
                <div style={{ minWidth: "0" }}>
                  <div className="ell" style={{ fontSize: "16px", fontWeight: "600" }}>Seoul Beauty Imports</div>
                  <div style={{ fontSize: "13px", color: "var(--muted)" }}>Draft · not sent</div>
                </div>
                <div className="num" style={{ fontSize: "17px", fontWeight: "700", flex: "none" }}>৳81,000</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                <span className="bar" style={{ flex: "1" }}>
                  <i style={{ width: "0%", background: "#003087" }} />
                </span>
                <span className="num" style={{ fontSize: "12.5px", color: "var(--muted)", flex: "none" }}>0/90 received</span>
              </div>
            </__Link>
          </div>
          <__Link href="/m-purchase-new" className="fab" aria-label="New purchase order" style={{ bottom: "44px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </__Link>
          <div className="hi" aria-hidden="true" />
        </div>
      </div>
    );
  }
}
