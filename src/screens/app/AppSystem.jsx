'use client';
// Generated from design/templates/app/AppSystem.dc.html by scripts/convert-design.mjs.
// App design system
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
`;

// ---- markup ----

export default class AppSystemScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="AppSystem">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="ph" style={{ width: "1440px", height: "1150px" }}>
          <div style={{ width: "1440px", height: "1000px", background: "#f5f7fa", padding: "56px 64px", fontFamily: "Poppins", color: "#0f172a" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <img src="/assets/9b6f9ad369f1cbde65271a968e6ba1f1.png" alt="GridCommerce" style={{ height: "40px" }} />
              <div>
                <div style={{ fontSize: "13px", color: "#64748b" }}>GridCommerce · Mobile app</div>
                <h1 style={{ margin: "0", fontSize: "32px", letterSpacing: "-.025em" }}>App design system</h1>
              </div>
            </div>
            <p style={{ maxWidth: "760px", fontSize: "15px", color: "#475569", margin: "14px 0 0" }}>Clean, calm and breathable. Built for a merchant working one-handed between customers, and for staff checking the platform on the move. Separate from the web admin design.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr", gap: "24px", marginTop: "32px" }}>
              <div className="card" style={{ padding: "24px" }}>
                <h2 style={{ margin: "0 0 16px", fontSize: "16px" }}>Colour</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#003087", border: "1px solid rgba(15,23,42,.08)" }} />
                    <span>
                      <b style={{ display: "block", fontSize: "14px" }}>Brand navy</b>
                      <span className="mono" style={{ fontSize: "12px", color: "#64748b" }}>#003087</span>
                      <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Primary buttons, active tab</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#012169", border: "1px solid rgba(15,23,42,.08)" }} />
                    <span>
                      <b style={{ display: "block", fontSize: "14px" }}>Deep navy</b>
                      <span className="mono" style={{ fontSize: "12px", color: "#64748b" }}>#012169</span>
                      <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Hero cards</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#009cde", border: "1px solid rgba(15,23,42,.08)" }} />
                    <span>
                      <b style={{ display: "block", fontSize: "14px" }}>Sky</b>
                      <span className="mono" style={{ fontSize: "12px", color: "#64748b" }}>#009cde</span>
                      <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Unread, accents</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#0f172a", border: "1px solid rgba(15,23,42,.08)" }} />
                    <span>
                      <b style={{ display: "block", fontSize: "14px" }}>Ink</b>
                      <span className="mono" style={{ fontSize: "12px", color: "#64748b" }}>#0f172a</span>
                      <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Titles, body</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#475569", border: "1px solid rgba(15,23,42,.08)" }} />
                    <span>
                      <b style={{ display: "block", fontSize: "14px" }}>Body</b>
                      <span className="mono" style={{ fontSize: "12px", color: "#64748b" }}>#475569</span>
                      <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Secondary text</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#64748b", border: "1px solid rgba(15,23,42,.08)" }} />
                    <span>
                      <b style={{ display: "block", fontSize: "14px" }}>Muted</b>
                      <span className="mono" style={{ fontSize: "12px", color: "#64748b" }}>#64748b</span>
                      <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Hints, meta</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#e8edf3", border: "1px solid rgba(15,23,42,.08)" }} />
                    <span>
                      <b style={{ display: "block", fontSize: "14px" }}>Line</b>
                      <span className="mono" style={{ fontSize: "12px", color: "#64748b" }}>#e8edf3</span>
                      <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Dividers</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#f5f7fa", border: "1px solid rgba(15,23,42,.08)" }} />
                    <span>
                      <b style={{ display: "block", fontSize: "14px" }}>Background</b>
                      <span className="mono" style={{ fontSize: "12px", color: "#64748b" }}>#f5f7fa</span>
                      <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Screen</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#eef3fa", border: "1px solid rgba(15,23,42,.08)" }} />
                    <span>
                      <b style={{ display: "block", fontSize: "14px" }}>Soft</b>
                      <span className="mono" style={{ fontSize: "12px", color: "#64748b" }}>#eef3fa</span>
                      <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>Icon wells</span>
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "18px" }}>
                  <span className="pill p-ok"><span className="sh ok" />Paid</span>
                  <span className="pill p-warn"><span className="sh warn" />Low stock</span>
                  <span className="pill p-err"><span className="sh err" />Overdue</span>
                </div>
              </div>
              <div className="card" style={{ padding: "24px" }}>
                <h2 style={{ margin: "0 0 6px", fontSize: "16px" }}>Type · Poppins</h2>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0", borderTop: "1px solid #e8edf3" }}>
                  <span style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-.025em" }}>Screen title</span>
                  <span className="mono" style={{ fontSize: "12px", color: "#64748b" }}>28 / 34 · Bold</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0", borderTop: "1px solid #e8edf3" }}>
                  <span style={{ fontSize: "16px", fontWeight: "600" }}>Section</span>
                  <span className="mono" style={{ fontSize: "12px", color: "#64748b" }}>16 / 22 · SemiBold</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0", borderTop: "1px solid #e8edf3" }}>
                  <span style={{ fontSize: "15px" }}>Body</span>
                  <span className="mono" style={{ fontSize: "12px", color: "#64748b" }}>15 / 22 · Regular</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0", borderTop: "1px solid #e8edf3" }}>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>Meta</span>
                  <span className="mono" style={{ fontSize: "12px", color: "#64748b" }}>13 / 18 · Regular</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0", borderTop: "1px solid #e8edf3" }}>
                  <span style={{ fontFamily: "'Hind Siliguri'", fontSize: "16px" }}>বাংলা লেখা</span>
                  <span className="mono" style={{ fontSize: "12px", color: "#64748b" }}>16 / 24 · Hind Siliguri</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0", borderTop: "1px solid #e8edf3" }}>
                  <span style={{ fontSize: "22px", fontWeight: "700", fontVariantNumeric: "tabular-nums" }}>৳48,250</span>
                  <span className="mono" style={{ fontSize: "12px", color: "#64748b" }}>Numbers · tabular</span>
                </div>
                <h2 style={{ margin: "18px 0 12px", fontSize: "16px" }}>Spacing</h2>
                <div style={{ display: "flex", gap: "14px", alignItems: "flex-end" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "4px", height: "4px", background: "#dbe6f7", borderRadius: "4px" }} />
                    <span className="mono" style={{ fontSize: "12px" }}>4</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "8px", height: "8px", background: "#dbe6f7", borderRadius: "4px" }} />
                    <span className="mono" style={{ fontSize: "12px" }}>8</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "12px", height: "12px", background: "#dbe6f7", borderRadius: "4px" }} />
                    <span className="mono" style={{ fontSize: "12px" }}>12</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "16px", height: "16px", background: "#dbe6f7", borderRadius: "4px" }} />
                    <span className="mono" style={{ fontSize: "12px" }}>16</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "20px", height: "20px", background: "#dbe6f7", borderRadius: "4px" }} />
                    <span className="mono" style={{ fontSize: "12px" }}>20</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "24px", height: "24px", background: "#dbe6f7", borderRadius: "4px" }} />
                    <span className="mono" style={{ fontSize: "12px" }}>24</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "32px", height: "32px", background: "#dbe6f7", borderRadius: "4px" }} />
                    <span className="mono" style={{ fontSize: "12px" }}>32</span>
                  </div>
                </div>
              </div>
              <div className="card" style={{ padding: "24px" }}>
                <h2 style={{ margin: "0 0 14px", fontSize: "16px" }}>Rules</h2>
                <ul style={{ margin: "0", paddingLeft: "18px", fontSize: "14px", lineHeight: "21px", color: "#334155" }}>
                  <li style={{ margin: "0 0 10px" }}>Phone first: 390 × 844 frame, 20 px side margins, 8 px rhythm.</li>
                  <li style={{ margin: "0 0 10px" }}>Bottom tab bar with 5 tabs; screens deeper than a tab use a back arrow.</li>
                  <li style={{ margin: "0 0 10px" }}>Every tap target is at least 44 × 44 px; main buttons are 52 px tall.</li>
                  <li style={{ margin: "0 0 10px" }}>One main action per screen, pinned above the home indicator.</li>
                  <li style={{ margin: "0 0 10px" }}>Tables become cards or rows; filters become chips; choices become sheets.</li>
                  <li style={{ margin: "0 0 10px" }}>Status uses shape and colour together: circle ok, triangle warning, diamond problem.</li>
                  <li style={{ margin: "0 0 10px" }}>Icons are one outline family at 1.8 px stroke; no emoji.</li>
                  <li style={{ margin: "0 0 10px" }}>Body text 15 px, never below 12 px; contrast 4.5:1 or better.</li>
                </ul>
              </div>
            </div>
            <div className="card" style={{ padding: "24px", marginTop: "24px", display: "flex", gap: "28px", alignItems: "center", flexWrap: "wrap" }}>
              <h2 style={{ margin: "0", fontSize: "16px", width: "100%" }}>Components</h2>
              <a className="btn btnp" href="#" style={{ width: "200px" }}>Primary</a>
              <a className="btn btns" href="#" style={{ width: "160px" }}>Secondary</a>
              <a className="btn btnl" href="#" style={{ width: "140px" }}>Outline</a>
              <div className="inp f" style={{ width: "240px" }}>
                <span style={{ color: "#64748b" }}>৳</span>
                <span className="num">1,250</span>
              </div>
              <span className="chip on">Selected</span>
              <span className="chip">Chip</span>
              <div className="seg" style={{ margin: "0", width: "260px" }}>
                <span className="on">Mine</span>
                <span>Team</span>
              </div>
              <span className="step">
                <span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                  </svg>
                </span>
                <b>2</b>
                <span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </span>
              <span className="sw on" />
              <span className="sw" />
              <span className="ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 2h12l1 4H5z" />
                  <path d="M5 6h14v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
                  <path d="M9 11h6M9 15h4" />
                </svg>
              </span>
              <span style={{ position: "relative", width: "390px", height: "110px", borderRadius: "16px", overflow: "hidden", border: "1px solid #e8edf3", background: "#f5f7fa" }}>
                <div className="tabfade" aria-hidden="true" />
                <nav className="tabs" aria-label="Main">
                  <__Link href="/m-home" className=""><span className="tw">
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </svg>
</span>Home</__Link>
                  <__Link href="/m-orders" className="on" aria-current="page"><span className="tw">
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2h12l1 4H5z" />
    <path d="M5 6h14v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
    <path d="M9 11h6M9 15h4" />
  </svg>
  <span className="cnt" aria-label="12 new">12</span>
</span>Orders</__Link>
                  <__Link href="/m-products" className=""><span className="tw">
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
