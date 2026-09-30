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
.fab{position:absolute;right:20px;bottom:103px;width:60px;height:60px;border-radius:var(--radius-xl);background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 24px -8px rgba(0,48,135,.55);z-index:5}
.tabs{position:absolute;left:0;right:0;bottom:0;height:83px;padding:6px 8px 0;display:flex;background:rgba(255,255,255,.94);backdrop-filter:blur(12px);border-top:1px solid var(--line);z-index:6}
.tabs a{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;height:49px;padding-top:4px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);position:relative}
.tabs a.on{color:var(--brand);font-weight:var(--weight-medium)}
.tabs a .bd{position:absolute;top:0;left:calc(50% + 6px);min-width:18px;height:18px;padding:0 5px;border-radius:var(--radius-full);background:var(--fill-danger);color:#fff;font-size:var(--text-2xs);font-weight:var(--weight-medium);line-height:18px;text-align:center;border:2px solid #fff}
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
              <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>4G</span>
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
              <div style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", marginTop: "8px" }}>Steadfast webhooks delayed</div>
              <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>Rakib responding · Farhana on merchant updates</div>
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
                  <span className="t" style={{ fontWeight: "var(--weight-medium)" }}>Checkout</span>
                </span>
                <span className="num" style={{ fontSize: "var(--text-sm)", color: "var(--muted)", fontWeight: "var(--weight-regular)" }}>100%</span>
              </div>
              <div className="row" style={{ minHeight: "52px" }}>
                <span style={{ color: "#0f9f6e", display: "flex" }}>
                  <span className="sh ok" />
                </span>
                <span className="m">
                  <span className="t" style={{ fontWeight: "var(--weight-medium)" }}>Storefront</span>
                </span>
                <span className="num" style={{ fontSize: "var(--text-sm)", color: "var(--muted)", fontWeight: "var(--weight-regular)" }}>99.99%</span>
              </div>
              <div className="row" style={{ minHeight: "52px" }}>
                <span style={{ color: "#0f9f6e", display: "flex" }}>
                  <span className="sh ok" />
                </span>
                <span className="m">
                  <span className="t" style={{ fontWeight: "var(--weight-medium)" }}>Merchant admin</span>
                </span>
                <span className="num" style={{ fontSize: "var(--text-sm)", color: "var(--muted)", fontWeight: "var(--weight-regular)" }}>99.98%</span>
              </div>
              <div className="row" style={{ minHeight: "52px" }}>
                <span style={{ color: "#b45309", display: "flex" }}>
                  <span className="sh warn" />
                </span>
                <span className="m">
                  <span className="t" style={{ fontWeight: "var(--weight-medium)" }}>Courier queue</span>
                </span>
                <span className="num" style={{ fontSize: "var(--text-sm)", color: "#b45309", fontWeight: "var(--weight-medium)" }}>1,284 waiting</span>
              </div>
              <div className="row" style={{ minHeight: "52px" }}>
                <span style={{ color: "#c2410c", display: "flex" }}>
                  <span className="sh err" />
                </span>
                <span className="m">
                  <span className="t" style={{ fontWeight: "var(--weight-medium)" }}>Steadfast</span>
                </span>
                <span className="num" style={{ fontSize: "var(--text-sm)", color: "#c2410c", fontWeight: "var(--weight-medium)" }}>31% delivered</span>
              </div>
              <div className="row" style={{ minHeight: "52px" }}>
                <span style={{ color: "#0f9f6e", display: "flex" }}>
                  <span className="sh ok" />
                </span>
                <span className="m">
                  <span className="t" style={{ fontWeight: "var(--weight-medium)" }}>bKash</span>
                </span>
                <span className="num" style={{ fontSize: "var(--text-sm)", color: "var(--muted)", fontWeight: "var(--weight-regular)" }}>99.4%</span>
              </div>
            </div>
            <div className="sec">
              <h2>Updates</h2>
              <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>Posted to status page</span>
            </div>
            <div className="card" style={{ margin: "0 20px", padding: "16px 16px 2px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "var(--radius-full)", background: "var(--brand)", marginTop: "6px" }} />
                  <span style={{ flex: "1", width: "2px", background: "#e2e8f0" }} />
                </div>
                <div style={{ paddingBottom: "14px" }}>
                  <div className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>10:40</div>
                  <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px" }}>Replay at 64%. Tracking numbers arriving for most stores.</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "var(--radius-full)", background: "#cbd5e1", marginTop: "6px" }} />
                  <span style={{ flex: "1", width: "2px", background: "#e2e8f0" }} />
                </div>
                <div style={{ paddingBottom: "14px" }}>
                  <div className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>10:05</div>
                  <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px" }}>Courier workers scaled from 3 to 6.</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "var(--radius-full)", background: "#cbd5e1", marginTop: "6px" }} />
                  <span style={{ flex: "1", width: "2px", background: "#e2e8f0" }} />
                </div>
                <div style={{ paddingBottom: "14px" }}>
                  <div className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>09:52</div>
                  <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px" }}>Steadfast confirmed an outage on their side.</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "var(--radius-full)", background: "#cbd5e1", marginTop: "6px" }} />
                </div>
                <div style={{ paddingBottom: "14px" }}>
                  <div className="num" style={{ fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>09:40</div>
                  <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px" }}>Declared Sev 2. 38 stores affected.</div>
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
