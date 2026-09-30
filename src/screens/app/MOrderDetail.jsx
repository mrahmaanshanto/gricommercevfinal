'use client';
// Generated from design/templates/app/MOrderDetail.dc.html by scripts/convert-design.mjs.
// Merchant app · Order details
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
.fab{position:absolute;right:20px;bottom:103px;width:60px;height:60px;border-radius:20px;background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 24px -8px rgba(0,48,135,.55);z-index:5}
.tabs{position:absolute;left:0;right:0;bottom:0;height:83px;padding:6px 8px 0;display:flex;background:rgba(255,255,255,.94);backdrop-filter:blur(12px);border-top:1px solid var(--line);z-index:6}
.tabs a{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;height:49px;padding-top:4px;font-size:11px;font-weight:500;color:#94a3b8;position:relative}
.tabs a.on{color:var(--brand);font-weight:600}
.tabs a .bd{position:absolute;top:0;left:calc(50% + 6px);min-width:18px;height:18px;padding:0 5px;border-radius:99px;background:#ff5724;color:#fff;font-size:10.5px;font-weight:700;line-height:18px;text-align:center;border:2px solid #fff}
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
`;

// ---- markup ----

export default class MOrderDetailScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="MOrderDetail">
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
            <__Link href="/m-orders" className="ib" aria-label="Back">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </__Link>
            <h1>Order #136812</h1>
            <a className="ib" href="#" aria-label="More actions">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="5" cy="12" r="1.6" />
                <circle cx="12" cy="12" r="1.6" />
                <circle cx="19" cy="12" r="1.6" />
              </svg>
            </a>
          </header>
          <div className="content" style={{ top: "103px", bottom: "98px" }}>
            <div className="card" style={{ margin: "4px 20px 0", padding: "14px 16px 10px" }}>
              <div style={{ display: "flex" }}>
                <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", position: "relative" }}>
                  <span style={{ position: "relative", width: "24px", height: "24px", borderRadius: "99px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--brand)", color: "#fff" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--ink)" }}>Placed</span>
                </div>
                <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", position: "relative" }}>
                  <span style={{ position: "absolute", top: "11px", right: "50%", width: "100%", height: "2px", background: "#e2e8f0" }} />
                  <span style={{ position: "relative", width: "24px", height: "24px", borderRadius: "99px", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", border: "2px solid #cbd5e1" }} />
                  <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--muted)" }}>Confirmed</span>
                </div>
                <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", position: "relative" }}>
                  <span style={{ position: "absolute", top: "11px", right: "50%", width: "100%", height: "2px", background: "#e2e8f0" }} />
                  <span style={{ position: "relative", width: "24px", height: "24px", borderRadius: "99px", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", border: "2px solid #cbd5e1" }} />
                  <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--muted)" }}>Packed</span>
                </div>
                <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", position: "relative" }}>
                  <span style={{ position: "absolute", top: "11px", right: "50%", width: "100%", height: "2px", background: "#e2e8f0" }} />
                  <span style={{ position: "relative", width: "24px", height: "24px", borderRadius: "99px", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", border: "2px solid #cbd5e1" }} />
                  <span style={{ fontSize: "12px", fontWeight: "500", color: "var(--muted)" }}>Shipped</span>
                </div>
              </div>
            </div>
            <div className="card" style={{ margin: "12px 20px 0", padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className="av" style={{ background: "#e0f3fb", color: "#003087" }}>NJ</span>
                <div style={{ flex: "1", minWidth: "0" }}>
                  <div style={{ fontSize: "16px", fontWeight: "600" }}>Nusrat Jahan</div>
                  <div className="num" style={{ fontSize: "13px", color: "var(--muted)" }}>01711-234567 · 6th order</div>
                </div>
              </div>
              <div style={{ fontSize: "14px", color: "var(--body)", marginTop: "12px", lineHeight: "21px" }}>House 12, Road 5, Dhanmondi, Dhaka 1205</div>
              <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                <a className="btn btns" href="#" style={{ flex: "1", height: "44px", fontSize: "15px" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
</svg>Call</a>
                <a className="btn btns" href="#" style={{ flex: "1", height: "44px", fontSize: "15px", background: "#e7f7f0", color: "#0f7a55" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.4Z" />
  <path d="M9 10c0 3 2 5 5 5l1-1.5-2-1-1 1c-1-.5-1.5-1-2-2l1-1-1-2Z" />
</svg>WhatsApp</a>
              </div>
            </div>
            <div className="sec" style={{ marginTop: "16px" }}>
              <h2>3 items</h2>
              <span style={{ fontSize: "13px", color: "var(--muted)" }}>Online store</span>
            </div>
            <div className="card" style={{ margin: "0 20px" }}>
              <div className="row" style={{ minHeight: "56px", padding: "9px 16px" }}>
                <span className="av" style={{ width: "40px", height: "40px", background: "#fff4e0", color: "#003087" }}>S</span>
                <span className="m">
                  <span className="t ell" style={{ display: "block", fontWeight: "500" }}>Sunscreen SPF 50 · 50ml</span>
                  <span className="s">×1</span>
                </span>
                <span className="num" style={{ fontWeight: "600" }}>৳940</span>
              </div>
              <div className="row" style={{ minHeight: "56px", padding: "9px 16px" }}>
                <span className="av" style={{ width: "40px", height: "40px", background: "#fff4e0", color: "#003087" }}>R</span>
                <span className="m">
                  <span className="t ell" style={{ display: "block", fontWeight: "500" }}>Rice Water Cleanser 150ml</span>
                  <span className="s">×1</span>
                </span>
                <span className="num" style={{ fontWeight: "600" }}>৳670</span>
              </div>
              <div className="row" style={{ minHeight: "56px", padding: "9px 16px" }}>
                <span className="av" style={{ width: "40px", height: "40px", background: "#fff4e0", color: "#003087" }}>A</span>
                <span className="m">
                  <span className="t ell" style={{ display: "block", fontWeight: "500" }}>Aloe Soothing Gel 300ml</span>
                  <span className="s">×1</span>
                </span>
                <span className="num" style={{ fontWeight: "600" }}>৳520</span>
              </div>
              <div style={{ padding: "12px 16px 16px", borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--body)" }}>
                  <span>Delivery · inside Dhaka</span>
                  <span className="num">৳70</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--body)" }}>
                  <span>Discount · SKIN15</span>
                  <span className="num">−৳250</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "17px", fontWeight: "700", marginTop: "4px" }}>
                  <span>Total</span>
                  <span className="num">৳2,450</span>
                </div>
                <div>
                  <span className="pill p-ok"><span className="sh ok" aria-hidden="true" />Paid by bKash · TrxID 9J7K2L</span>
                </div>
              </div>
            </div>
          </div>
          <div className="actbar">
            <a className="btn btnl" href="#">Cancel</a>
            <__Link href="/m-orders" className="btn btnp" style={{ flex: "2" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" />
</svg>Confirm order</__Link>
          </div>
        </div>
      </div>
    );
  }
}
