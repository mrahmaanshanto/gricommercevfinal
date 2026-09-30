'use client';
// Generated from design/templates/app/MCalls.dc.html by scripts/convert-design.mjs.
// Merchant app · Calls
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

export default class MCallsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="MCalls">
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
            <h1>Calls</h1>
            <__Link href="/m-call-settings" className="ib" aria-label="Call settings">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
              </svg>
            </__Link>
          </header>
          <div className="content" style={{ top: "103px", bottom: "0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "2px 20px 0", padding: "6px 6px 6px 14px", borderRadius: "16px", background: "var(--card)", boxShadow: "0 1px 2px rgba(15,23,42,.05)" }}>
              <span style={{ width: "9px", height: "9px", borderRadius: "99px", background: "#10b981" }} />
              <span style={{ flex: "1", fontSize: "14px", fontWeight: "500" }}>You are available</span>
              <span className="seg" style={{ margin: "0", padding: "3px", width: "170px" }}>
                <span className="on" style={{ height: "32px", fontSize: "13px" }}>Available</span>
                <span style={{ height: "32px", fontSize: "13px" }}>Break</span>
              </span>
            </div>
            <div className="card" style={{ margin: "16px 20px 0", padding: "16px", background: "linear-gradient(150deg,#012169,#0a4bb5)", color: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", opacity: ".85" }}><span style={{ width: "8px", height: "8px", borderRadius: "99px", background: "#7fd4f5", boxShadow: "0 0 0 4px rgba(127,212,245,.25)" }} />Ringing now · via welcome menu “Order status”</div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px" }}>
                <span className="pav" style={{ width: "48px", height: "48px" }}>
                  <img className="face" src="data:image/jpeg;base64,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" alt="" style={{ width: "48px", height: "48px" }} />
                </span>
                <div style={{ flex: "1", minWidth: "0" }}>
                  <div style={{ fontSize: "17px", fontWeight: "600" }}>Nusrat Jahan</div>
                  <div className="num" style={{ fontSize: "13px", opacity: ".8" }}>01711-234567 · 6 orders · VIP</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                <a className="btn" href="#" style={{ flex: "1", height: "46px", fontSize: "15px", background: "rgba(255,255,255,.14)", color: "#fff" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M18 6 6 18M6 6l12 12" />
</svg>Decline</a>
                <__Link href="/m-call-active" className="btn" style={{ flex: "2", height: "46px", fontSize: "15px", background: "#10b981", color: "#fff" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
</svg>Answer</__Link>
              </div>
            </div>
            <div className="sec">
              <h2>Call back</h2>
              <span style={{ fontSize: "13px", color: "var(--muted)" }}>2 waiting</span>
            </div>
            <div className="card" style={{ margin: "0 20px" }}>
              <div className="lrow">
                <span className="pav" style={{ width: "44px", height: "44px" }}>
                  <span className="face" style={{ width: "44px", height: "44px", background: "#e7f7f0", color: "#003087", fontSize: "15px" }}>RA</span>
                  <span className="pb" style={{ width: "18px", height: "18px", right: "-3px", bottom: "-3px" }}>
                    <img src="data:image/png;base64,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" alt="WhatsApp" style={{ width: "14px", height: "14px" }} />
                  </span>
                </span>
                <span style={{ flex: "1", minWidth: "0" }}>
                  <span className="ell" style={{ display: "block", fontSize: "15px", fontWeight: "500" }}>Rafiq Ahmed</span>
                  <span className="ell" style={{ display: "block", fontSize: "12.5px", color: "var(--muted)" }}>Missed · 22 min ago</span>
                </span>
                <__Link href="/m-call-active" className="ib" aria-label="Call Rafiq Ahmed" style={{ width: "40px", height: "40px", borderRadius: "99px", background: "var(--okbg)", color: "var(--ok)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
                  </svg>
                </__Link>
              </div>
              <div className="lrow">
                <span className="pav" style={{ width: "44px", height: "44px" }}>
                  <img className="face" src="data:image/jpeg;base64,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" alt="" style={{ width: "44px", height: "44px" }} />
                  <span className="pb" style={{ width: "18px", height: "18px", right: "-3px", bottom: "-3px" }}>
                    <img src="data:image/png;base64,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" alt="Instagram" style={{ width: "14px", height: "14px" }} />
                  </span>
                </span>
                <span style={{ flex: "1", minWidth: "0" }}>
                  <span className="ell" style={{ display: "block", fontSize: "15px", fontWeight: "500" }}>Sumaiya Binte</span>
                  <span className="ell" style={{ display: "block", fontSize: "12.5px", color: "var(--muted)" }}>Asked for COD confirmation</span>
                </span>
                <__Link href="/m-call-active" className="ib" aria-label="Call Sumaiya Binte" style={{ width: "40px", height: "40px", borderRadius: "99px", background: "var(--okbg)", color: "var(--ok)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
                  </svg>
                </__Link>
              </div>
            </div>
            <div className="sec">
              <h2>Recent</h2>
              <a href="#">See all</a>
            </div>
            <div className="card" style={{ margin: "0 20px" }}>
              <div className="lrow">
                <span className="ico" style={{ width: "40px", height: "40px", borderRadius: "99px", background: "var(--soft)", color: "#0f9f6e" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Incoming">
                    <path d="M17 7 7 17M7 8v9h9" />
                  </svg>
                </span>
                <span style={{ flex: "1", minWidth: "0" }}>
                  <span className="ell" style={{ display: "block", fontSize: "15px", fontWeight: "500", color: "var(--ink)" }}>Nusrat Jahan</span>
                  <span className="num" style={{ display: "block", fontSize: "12.5px", color: "var(--muted)" }}>Today 11:04 · 2:14</span>
                </span>
                <span className="pill p-ok">Order changed</span>
              </div>
              <div className="lrow">
                <span className="ico" style={{ width: "40px", height: "40px", borderRadius: "99px", background: "var(--soft)", color: "#003087" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Outgoing">
                    <path d="M7 17 17 7M8 7h9v9" />
                  </svg>
                </span>
                <span style={{ flex: "1", minWidth: "0" }}>
                  <span className="ell" style={{ display: "block", fontSize: "15px", fontWeight: "500", color: "var(--ink)" }}>Tania Islam</span>
                  <span className="num" style={{ display: "block", fontSize: "12.5px", color: "var(--muted)" }}>Today 10:38 · 1:02</span>
                </span>
                <span className="pill p-ok">Payment checked</span>
              </div>
              <div className="lrow">
                <span className="ico" style={{ width: "40px", height: "40px", borderRadius: "99px", background: "#ffece5", color: "#c2410c" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Missed">
                    <path d="m3 7 7 7 4-4 7 7" />
                  </svg>
                </span>
                <span style={{ flex: "1", minWidth: "0" }}>
                  <span className="ell" style={{ display: "block", fontSize: "15px", fontWeight: "600", color: "var(--err)" }}>Arif Karim</span>
                  <span className="num" style={{ display: "block", fontSize: "12.5px", color: "var(--muted)" }}>Today 9:52</span>
                </span>
                <span className="pill p-warn">Call back</span>
              </div>
              <div className="lrow">
                <span className="ico" style={{ width: "40px", height: "40px", borderRadius: "99px", background: "var(--soft)", color: "#0f9f6e" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Incoming">
                    <path d="M17 7 7 17M7 8v9h9" />
                  </svg>
                </span>
                <span style={{ flex: "1", minWidth: "0" }}>
                  <span className="ell" style={{ display: "block", fontSize: "15px", fontWeight: "500", color: "var(--ink)" }}>Mitu Khan</span>
                  <span className="num" style={{ display: "block", fontSize: "12.5px", color: "var(--muted)" }}>Yesterday · 4:31</span>
                </span>
                <span className="pill p-nav">New order ৳3,200</span>
              </div>
            </div>
          </div>
          <a className="fab" href="#" aria-label="Open dial pad" style={{ bottom: "44px", background: "#10b981", boxShadow: "0 12px 24px -8px rgba(16,185,129,.6)" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="6" cy="5" r="1.8" />
              <circle cx="12" cy="5" r="1.8" />
              <circle cx="18" cy="5" r="1.8" />
              <circle cx="6" cy="11" r="1.8" />
              <circle cx="12" cy="11" r="1.8" />
              <circle cx="18" cy="11" r="1.8" />
              <circle cx="6" cy="17" r="1.8" />
              <circle cx="12" cy="17" r="1.8" />
              <circle cx="18" cy="17" r="1.8" />
              <circle cx="12" cy="22" r="1.6" />
            </svg>
          </a>
          <div className="hi" aria-hidden="true" />
        </div>
      </div>
    );
  }
}
