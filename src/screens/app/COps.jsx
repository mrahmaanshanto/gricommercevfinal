'use client';
// Generated from design/templates/app/COps.dc.html by scripts/convert-design.mjs.
// Staff app · Incident
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

export default class COpsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="COps">
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
            <__Link href="/c-home" className="ib" aria-label="Back">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </__Link>
            <h1>Incident INC-114</h1>
            <span style={{ width: "44px" }} />
          </header>
          <div className="content" style={{ top: "103px", bottom: "98px" }}>
            <div style={{ padding: "4px 20px 0" }}>
              <div style={{ display: "flex", gap: "6px" }}>
                <span className="pill p-warn"><span className="sh warn" aria-hidden="true" />Sev 2</span>
                <span className="pill p-grey">Open 58 min</span>
              </div>
              <div style={{ fontSize: "20px", fontWeight: "700", letterSpacing: "-.02em", marginTop: "8px" }}>Steadfast webhooks delayed</div>
              <div style={{ fontSize: "13px", color: "var(--muted)" }}>Rakib responding · Farhana on merchant updates</div>
            </div>
            <div className="sec">
              <h2>Services</h2>
            </div>
            <div className="card" style={{ margin: "0 20px" }}>
              <div className="row" style={{ minHeight: "52px" }}>
                <span style={{ color: "#0f9f6e", display: "flex" }}>
                  <span className="sh ok" />
                </span>
                <span className="m">
                  <span className="t" style={{ fontWeight: "500" }}>Checkout</span>
                </span>
                <span className="num" style={{ fontSize: "14px", color: "var(--muted)", fontWeight: "400" }}>100%</span>
              </div>
              <div className="row" style={{ minHeight: "52px" }}>
                <span style={{ color: "#0f9f6e", display: "flex" }}>
                  <span className="sh ok" />
                </span>
                <span className="m">
                  <span className="t" style={{ fontWeight: "500" }}>Storefront</span>
                </span>
                <span className="num" style={{ fontSize: "14px", color: "var(--muted)", fontWeight: "400" }}>99.99%</span>
              </div>
              <div className="row" style={{ minHeight: "52px" }}>
                <span style={{ color: "#0f9f6e", display: "flex" }}>
                  <span className="sh ok" />
                </span>
                <span className="m">
                  <span className="t" style={{ fontWeight: "500" }}>Merchant admin</span>
                </span>
                <span className="num" style={{ fontSize: "14px", color: "var(--muted)", fontWeight: "400" }}>99.98%</span>
              </div>
              <div className="row" style={{ minHeight: "52px" }}>
                <span style={{ color: "#b45309", display: "flex" }}>
                  <span className="sh warn" />
                </span>
                <span className="m">
                  <span className="t" style={{ fontWeight: "500" }}>Courier queue</span>
                </span>
                <span className="num" style={{ fontSize: "14px", color: "#b45309", fontWeight: "600" }}>1,284 waiting</span>
              </div>
              <div className="row" style={{ minHeight: "52px" }}>
                <span style={{ color: "#c2410c", display: "flex" }}>
                  <span className="sh err" />
                </span>
                <span className="m">
                  <span className="t" style={{ fontWeight: "500" }}>Steadfast</span>
                </span>
                <span className="num" style={{ fontSize: "14px", color: "#c2410c", fontWeight: "600" }}>31% delivered</span>
              </div>
              <div className="row" style={{ minHeight: "52px" }}>
                <span style={{ color: "#0f9f6e", display: "flex" }}>
                  <span className="sh ok" />
                </span>
                <span className="m">
                  <span className="t" style={{ fontWeight: "500" }}>bKash</span>
                </span>
                <span className="num" style={{ fontSize: "14px", color: "var(--muted)", fontWeight: "400" }}>99.4%</span>
              </div>
            </div>
            <div className="sec">
              <h2>Updates</h2>
              <span style={{ fontSize: "13px", color: "var(--muted)" }}>Posted to status page</span>
            </div>
            <div className="card" style={{ margin: "0 20px", padding: "16px 16px 2px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "99px", background: "var(--brand)", marginTop: "6px" }} />
                  <span style={{ flex: "1", width: "2px", background: "#e2e8f0" }} />
                </div>
                <div style={{ paddingBottom: "14px" }}>
                  <div className="num" style={{ fontSize: "12.5px", color: "var(--muted)" }}>10:40</div>
                  <div style={{ fontSize: "14px", lineHeight: "20px" }}>Replay at 64%. Tracking numbers arriving for most stores.</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "99px", background: "#cbd5e1", marginTop: "6px" }} />
                  <span style={{ flex: "1", width: "2px", background: "#e2e8f0" }} />
                </div>
                <div style={{ paddingBottom: "14px" }}>
                  <div className="num" style={{ fontSize: "12.5px", color: "var(--muted)" }}>10:05</div>
                  <div style={{ fontSize: "14px", lineHeight: "20px" }}>Courier workers scaled from 3 to 6.</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "99px", background: "#cbd5e1", marginTop: "6px" }} />
                  <span style={{ flex: "1", width: "2px", background: "#e2e8f0" }} />
                </div>
                <div style={{ paddingBottom: "14px" }}>
                  <div className="num" style={{ fontSize: "12.5px", color: "var(--muted)" }}>09:52</div>
                  <div style={{ fontSize: "14px", lineHeight: "20px" }}>Steadfast confirmed an outage on their side.</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "99px", background: "#cbd5e1", marginTop: "6px" }} />
                </div>
                <div style={{ paddingBottom: "14px" }}>
                  <div className="num" style={{ fontSize: "12.5px", color: "var(--muted)" }}>09:40</div>
                  <div style={{ fontSize: "14px", lineHeight: "20px" }}>Declared Sev 2. 38 stores affected.</div>
                </div>
              </div>
            </div>
          </div>
          <div className="actbar">
            <a className="btn btnl" href="#">Resolve</a>
            <a className="btn btnp" href="#" style={{ flex: "2" }}>Post update</a>
          </div>
        </div>
      </div>
    );
  }
}
