'use client';
// Generated from design/templates/app/OnbOtp.dc.html by scripts/convert-design.mjs.
// Merchant app · Step 2 · Verify number
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

export default class OnbOtpScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="OnbOtp">
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
          <header style={{ position: "absolute", top: "47px", left: "0", right: "0", padding: "6px 20px 0 8px", zIndex: "5" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <__Link href="/onb-phone" className="ib" aria-label="Back">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </__Link>
              <span style={{ flex: "1", fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}><b className="num" style={{ color: "var(--ink)" }}>Step 2 of 5</b> · Verify number</span>
            </div>
            <div style={{ display: "flex", gap: "6px", paddingLeft: "12px", marginTop: "4px" }}>
              <span style={{ flex: "1", height: "5px", borderRadius: "var(--radius-full)", background: "#dde4ee", overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", width: "100%", background: "#003087", borderRadius: "var(--radius-full)" }} />
              </span>
              <span style={{ flex: "1", height: "5px", borderRadius: "var(--radius-full)", background: "#dde4ee", overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", width: "50%", background: "#003087", borderRadius: "var(--radius-full)" }} />
              </span>
              <span style={{ flex: "1", height: "5px", borderRadius: "var(--radius-full)", background: "#dde4ee", overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", width: "0%", background: "#003087", borderRadius: "var(--radius-full)" }} />
              </span>
              <span style={{ flex: "1", height: "5px", borderRadius: "var(--radius-full)", background: "#dde4ee", overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", width: "0%", background: "#003087", borderRadius: "var(--radius-full)" }} />
              </span>
              <span style={{ flex: "1", height: "5px", borderRadius: "var(--radius-full)", background: "#dde4ee", overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", width: "0%", background: "#003087", borderRadius: "var(--radius-full)" }} />
              </span>
            </div>
          </header>
          <div className="content" style={{ top: "122px", bottom: "98px", padding: "14px 24px 0" }}>
            <h1 style={{ margin: "0", fontSize: "var(--text-3xl)", lineHeight: "38px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)" }}>Check your SMS</h1>
            <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm-plus)", color: "var(--body)" }}>We sent a 6-digit code to <b className="num" style={{ color: "var(--ink)" }}>+880 1712-345678</b>.</p>
            <div role="group" aria-label="6-digit code" style={{ display: "flex", gap: "8px", marginTop: "26px" }}>
              <span className="num" style={{ flex: "1", height: "60px", borderRadius: "var(--radius-xl)", border: "1.5px solid #94a3b8", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }}>4</span>
              <span className="num" style={{ flex: "1", height: "60px", borderRadius: "var(--radius-xl)", border: "1.5px solid #94a3b8", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }}>8</span>
              <span className="num" style={{ flex: "1", height: "60px", borderRadius: "var(--radius-xl)", border: "1.5px solid #94a3b8", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }}>2</span>
              <span className="num" style={{ flex: "1", height: "60px", borderRadius: "var(--radius-xl)", border: "1.5px solid #94a3b8", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }}>9</span>
              <span className="num" style={{ flex: "1", height: "60px", borderRadius: "var(--radius-xl)", border: "1.5px solid var(--brand)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", boxShadow: "0 0 0 3px rgba(0,48,135,.12)" }} />
              <span className="num" style={{ flex: "1", height: "60px", borderRadius: "var(--radius-xl)", border: "1.5px solid #cbd5e1", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", fontSize: "var(--text-sm)" }}>
              <span className="num" style={{ color: "var(--muted)" }}>Resend code in <b style={{ color: "var(--ink)" }}>0:24</b></span>
              <__Link href="/onb-phone" style={{ color: "var(--brand)", fontWeight: "var(--weight-medium)" }}>Change number</__Link>
            </div>
            <a href="#" style={{ display: "inline-flex", marginTop: "22px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--brand)" }}>Use demo code</a>
          </div>
          <div className="actbar">
            <__Link href="/onb-store" className="btn btnp" style={{ flex: "2" }}>Verify</__Link>
          </div>
        </div>
      </div>
    );
  }
}
