'use client';
// Generated from design/templates/storefront/OfferDetail.dc.html by scripts/convert-design.mjs.
// OfferDetail — Customer storefront — Offer detail.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

var NOW0 = Date.UTC(2026, 8, 18, 12, 14, 0); // 18 Sep 2026, 6:14 PM Dhaka
function T(d, h, m) { return Date.UTC(2026, d[1] - 1, d[0], (h || 0) - 6, m || 0, 0); }
function pad(n) { return (n < 10 ? '0' : '') + n; }
function parts(ms) { if (ms < 0) ms = 0; var s = Math.floor(ms / 1000); return { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 }; }
function dk(t) { return Math.floor((t + 6 * 3600000) / 86400000); }
function dayOf(o, now) { var tot = dk(o.end) - dk(o.start) + 1; var d = Math.max(1, Math.min(tot, dk(now) - dk(o.start) + 1)); return { d: d, tot: tot, pct: +Math.max(0, Math.min(100, (now - o.start) / (o.end - o.start) * 100)).toFixed(1) }; }
var OFF = { start: T([10, 9]), end: T([30, 9], 23, 59) };
class Component extends DCLogic {
  componentDidMount() { var self = this; this.iv = setInterval(function () { self.setState({ tick: ((self.state && self.state.tick) || 0) + 1 }); }, 1000); }
  componentWillUnmount() { clearInterval(this.iv); clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var ended = (this.props.offerState ?? 'running') === 'ended';
    var now = ended ? T([1, 10], 9) : NOW0 + (s.tick || 0) * 1000;
    var p = parts(OFF.end - now), dd = dayOf(OFF, now);
    var fg = ended ? '#94a3b8' : '#0f172a', bg = ended ? '#f1f5f9' : '#f2f6fc';
    return {
      ended: ended, live: !ended, status: ended ? 'INACTIVE' : 'ACTIVE', sBg: ended ? '#e2e8f0' : '#e7f8f1', sFg: ended ? '#475569' : '#047857',
      cover: ended ? 'linear-gradient(135deg, #475569, #94a3b8)' : 'linear-gradient(135deg, #b0145a, #e2136e)',
      clockTitle: ended ? 'Offer ended' : 'Offer ends in', dayText: ended ? 'Ran 21 days' : 'Day ' + dd.d + ' of ' + dd.tot,
      clock: [{ v: pad(p.d), l: 'Days' }, { v: pad(p.h), l: 'Hours' }, { v: pad(p.m), l: 'Minutes' }, { v: pad(p.s), l: 'Seconds' }].map(function (k) { k.fg = fg; k.bg = bg; return k; }),
      pct: (ended ? 100 : dd.pct) + '%', barColor: ended ? '#cbd5e1' : '#e2136e',
      codeBorder: ended ? '#cbd5e1' : '#003087', codeColor: ended ? '#94a3b8' : '#003087', codeDeco: ended ? 'line-through' : 'none',
      copied: !!s.copied, copy: function () { clearTimeout(self.t); self.setState({ copied: true }); self.t = setTimeout(function () { self.setState({ copied: false }); }, 2400); },
      more: [
        { big: '৳300 OFF', title: '৳300 off on ৳2,000 or more', left: '2 days left', lc: '#b83210', cover: 'linear-gradient(135deg, #012169, #0a5bd0)' },
        { big: '40% OFF', title: 'Weekend Mega Sale', left: 'Ends Sunday night', lc: '#b83210', cover: 'linear-gradient(135deg, #b83210, #f59e0b)' },
        { big: '15% OFF', title: '15% off all skin care', left: '7 days left', lc: '#047857', cover: 'linear-gradient(135deg, #047857, #10b981)' }
      ]
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:var(--font-sans);background:#e9eef5;color:#1e293b;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087}a:hover{color:#002a77}
.card{background:#ffffff;border-radius:var(--radius-xl);box-shadow:0 3px 10px 0 rgba(48,46,56,.06)}
.nav{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:var(--radius-lg);color:#475569;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:.01em;text-decoration:none;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 300ms ease-in-out}
.nav:hover{background:#f1f5f9;color:#0f172a;text-decoration:none}
.nav.on{background:rgba(0,48,135,.08);color:#003087}
.navh{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);color:var(--text-muted);padding:18px 12px 6px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:var(--radius-lg);border:0;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 200ms,border-color 200ms}
.btn:hover{text-decoration:none}
.btn:focus-visible,.nav:focus-visible,.ib:focus-visible,.tab:focus-visible,.chip:focus-visible,.step:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.soft{background:rgba(0,48,135,.08);color:#003087}.soft:hover{background:rgba(0,48,135,.16);color:#003087}
.line{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.line:hover{background:#f1f5f9;color:#1e293b}
.warnbtn{background:#b45309;color:#fff}.warnbtn:hover{background:#92400e;color:#fff}
.big{height:52px;padding:0 24px;font-size:var(--text-sm-plus)}
.sm{height:36px;padding:0 12px;font-size:var(--text-xs-plus)}
.ib{width:36px;height:36px;border-radius:var(--radius-full);border:0;background:transparent;color:#475569;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.ib:hover{background:rgba(203,213,225,.35);color:#0f172a}
.inp{width:100%;height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-sm);color:#1e293b;transition:border-color 200ms}
.inp:hover{border-color:#94a3b8}.inp:focus{outline:none;border-color:#003087}
.inp::placeholder{color:var(--text-muted)}
.lbl{font-size:var(--text-sm);line-height:20px;font-weight:var(--weight-medium);color:#334155}
.tab{height:36px;padding:0 14px;border-radius:var(--radius-full);border:0;background:transparent;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:#475569;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,color 200ms}
.tab:hover{background:#f1f5f9;color:#0f172a}
.tab.on{background:#003087;color:#fff}
.chip{height:36px;padding:0 14px;border-radius:var(--radius-full);border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,border-color 200ms,color 200ms}
.chip:hover{border-color:#94a3b8}
.chip.on{border-color:#003087;background:rgba(0,48,135,.08);color:#003087}
.th{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);text-transform:uppercase;color:var(--text-muted);text-align:left;padding:12px 16px;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.td{padding:14px 16px;border-bottom:1px solid #eef2f6;font-size:var(--text-sm);line-height:20px;vertical-align:middle}
.row{transition:background-color 200ms}.row:hover{background:#f8fafc}
.badge{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.badge::before{content:"";width:6px;height:6px;border-radius:var(--radius-full);background:currentColor}
.b-draft{background:#eef2f6;color:#475569}.b-approval{background:#fff4e0;color:#a14f06}.b-approved{background:#e0f2fe;color:#075985}
.b-ordered{background:rgba(0,48,135,.08);color:#003087}.b-partial{background:#fff1e6;color:#b4410c}.b-received{background:#e7f8f1;color:#047857}
.b-closed{background:#e2e8f0;color:#334155}.b-cancelled{background:#ffece6;color:#b83210}.b-over{background:#ffece6;color:#b83210}
.mono{font-family:var(--font-data);letter-spacing:.02em}
.fade{animation:gcFade 260ms cubic-bezier(0,0,.2,1)}
@keyframes gcFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.flash{animation:gcFlash 900ms ease-out}
@keyframes gcFlash{from{background:#e7f8f1}to{background:transparent}}
.scanline{animation:gcScan 1.8s ease-in-out infinite alternate}
@keyframes gcScan{from{transform:translateY(0)}to{transform:translateY(150px)}}

.sw{position:relative;width:48px;height:28px;border-radius:var(--radius-full);border:0;background:#cbd5e1;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:var(--radius-full);background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.25);transition:transform 200ms cubic-bezier(0,0,.2,1)}
.sw.on{background:#003087}.sw.on::after{transform:translateX(20px)}
.sw:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.b-live{background:#e7f8f1;color:#047857}.b-sched{background:#e0f2fe;color:#075985}.b-ended{background:#eef2f6;color:#475569}.b-paused{background:#fff4e0;color:#a14f06}
.t-member{background:#eef2f6;color:#475569}.t-silver{background:#e2e8f0;color:#334155}.t-gold{background:#fff4e0;color:#a14f06}.t-plat{background:rgba(0,48,135,.08);color:#003087}
.actc{border:1px solid transparent;transition:border-color 200ms,box-shadow 200ms}.actc:hover{border-color:#003087;box-shadow:0 6px 18px rgba(0,48,135,.12)}
.bn{font-family:var(--font-bn)}
.pulse{animation:gcPulse 1.6s ease-in-out infinite}
@keyframes gcPulse{0%,100%{opacity:1}50%{opacity:.45}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
.sf-nav{font-size:var(--text-sm);font-weight:var(--weight-medium);color:#334155;text-decoration:none;padding:8px 2px;border-bottom:2px solid transparent}
.sf-nav:hover{color:#003087;text-decoration:none}
.sf-nav.on{color:#003087;border-bottom-color:#003087}
.post{transition:box-shadow 200ms,transform 200ms}.post:hover{box-shadow:0 12px 28px -10px rgba(15,23,42,.25);transform:translateY(-2px)}
.copyb{height:36px;padding:0 12px;border-radius:var(--radius-lg);border:0;background:#003087;color:#fff;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.copyb:hover{background:#002a77}
`;

// ---- markup ----

export default class OfferDetailScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="OfferDetail">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="sf-root" style={{ width: "100%", maxWidth: "1440px", margin: "0 auto", minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
          <div className="bn" style={{ minHeight: "36px", padding: "6px 16px", textAlign: "center", background: "#b83210", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
            </svg>
            <span>উইকেন্ড মেগা সেল — ৪০% পর্যন্ত ছাড়! কোড: EID300</span>
          </div>
          <header className="sf-header sf-pad" style={{ minHeight: "76px", background: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "32px", padding: "0 64px" }}>
            <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <span style={{ width: "38px", height: "38px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>G</span>
              <span style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>GridShop</span>
            </a>
            <nav aria-label="Shop" className="sf-navrow" style={{ display: "flex", gap: "26px" }}>
              <a className="sf-nav" href="#">Home</a>
              <a className="sf-nav" href="#">Skin care</a>
              <a className="sf-nav" href="#">Clothing</a>
              <a className="sf-nav" href="#">Grocery</a>
              <__Link href="/offers" className="sf-nav on">Offers</__Link>
            </nav>
            <label className="sf-search" style={{ position: "relative", flexGrow: "1", maxWidth: "420px", marginLeft: "auto" }}>
              <span style={{ position: "absolute", left: "14px", top: "12px", color: "var(--text-muted)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </span>
              <input className="inp" type="search" placeholder="Search products" aria-label="Search products" style={{ paddingLeft: "44px", background: "#f8fafc" }} />
            </label>
            <a className="ib sf-acct" href="#" aria-label="My account">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </a>
            <__Link href="/checkout" aria-label="Cart, 3 items" style={{ position: "relative", display: "inline-flex", width: "40px", height: "40px", alignItems: "center", justifyContent: "center", color: "#334155" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <span style={{ position: "absolute", top: "0", right: "-2px", minWidth: "18px", height: "18px", borderRadius: "var(--radius-full)", background: "#b83210", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "flex", alignItems: "center", justifyContent: "center" }}>3</span>
            </__Link>
          </header>
          <section className="sf-pad sf-split" style={{ padding: "32px 64px 56px", display: "flex", gap: "32px", alignItems: "flex-start" }}>
            <article style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "22px" }}>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}><a href="#" style={{ color: "var(--text-muted)" }}>Home</a> / <__Link href="/offers" style={{ color: "var(--text-muted)" }}>{"Offers & Promotions"}</__Link> / BKASH10</div>
              {v.ended ? (<>
                <div role="status" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", borderRadius: "var(--radius-xl)", background: "#eef2f6", color: "#334155", fontSize: "var(--text-sm)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  <span style={{ flexGrow: "1" }}><b>This offer has ended</b> on 30 Sep 2026. The code BKASH10 no longer works.</span>
                  <__Link href="/offers" className="btn solid sm">See running offers</__Link>
                </div>
              </>) : null}
              <div className="sf-hero" style={__sx(`height: 280px; border-radius: var(--radius-xl); background: ${v.cover ?? ""}; color: #fff; padding: 36px; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden;`)}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.22)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", display: "inline-flex", alignItems: "center" }}>BKASH OFFER</span>
                  <span style={__sx(`height: 28px; padding: 0 12px; border-radius: var(--radius-full); background: ${v.sBg ?? ""}; color: ${v.sFg ?? ""}; font-size: var(--text-xs); font-weight: var(--weight-medium); display: inline-flex; align-items: center;`)}>{v.status}</span>
                </div>
                <div>
                  <div style={{ fontSize: "var(--text-5xl)", lineHeight: "1.12", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)" }}>10% OFF</div>
                  <div style={{ fontSize: "var(--text-lg)", opacity: ".92", marginTop: "8px" }}>when you pay with bKash · up to ৳150</div>
                </div>
                <span style={{ position: "absolute", right: "-40px", bottom: "-60px", width: "260px", height: "260px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.08)" }} />
              </div>
              <div>
                <h1 style={{ margin: "0", fontSize: "var(--text-3xl)", lineHeight: "42px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Pay with bKash, get 10% off</h1>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px", marginTop: "10px", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect width="18" height="18" x="3" y="4" rx="2" />
  <path d="M16 2v4" />
  <path d="M8 2v4" />
  <path d="M3 10h18" />
</svg>Posted 10 Sep 2026</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="10" />
  <path d="M12 6v6l4 2" />
</svg>Runs 10 – 30 Sep · 21 days</span>
                </div>
              </div>
              <p style={{ margin: "0", fontSize: "var(--text-base)", lineHeight: "27px", color: "#334155" }}>Paying online is faster and safer — so we are giving back. Pay for your order with bKash and get 10% off your bill, up to ৳150. Works on the website and at our Dhanmondi branch counter.</p>
              <p className="bn" style={{ margin: "0", fontSize: "var(--text-base)", lineHeight: "28px", color: "#334155" }}>বিকাশে পেমেন্ট করলেই পাচ্ছেন ১০% ছাড়, সর্বোচ্চ ৳১৫০। ৳৫০০ বা তার বেশি কেনাকাটায় প্রযোজ্য।</p>
              <section style={{ borderRadius: "var(--radius-xl)", background: "#ffffff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <h2 style={{ margin: "0", flexGrow: "1", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>{v.clockTitle}</h2>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569" }}>{v.dayText}</span>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  {__list(v.clock).map((k, $index) => (<React.Fragment key={$index}>
                      <div style={__sx(`flex: 1 1 0; padding: 14px 0; border-radius: var(--radius-xl); background: ${k?.bg ?? ""}; text-align: center;`)}>
                        <div className="mono" style={__sx(`font-size: var(--text-4xl); line-height: 1.2; font-weight: var(--weight-semibold); color: ${k?.fg ?? ""};`)}>{k?.v}</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{k?.l}</div>
                      </div>
                    </React.Fragment>))}
                </div>
                <div style={{ height: "10px", borderRadius: "var(--radius-full)", background: "#eef2f6", overflow: "hidden" }}>
                  <div style={__sx(`width: ${v.pct ?? ""}; height: 100%; border-radius: var(--radius-full); background: ${v.barColor ?? ""};`)} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                  <span>Started 10 Sep</span>
                  <span>Ends 30 Sep, 11:59 PM</span>
                </div>
              </section>
              <section style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <h2 style={{ margin: "0", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }}>How to use it</h2>
                <div className="sf-grid3 gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px" }}>
                  <div style={{ padding: "18px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--accent-text)" }}>STEP 1</div>
                    <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", marginTop: "4px" }}>Add items worth ৳500 or more</div>
                  </div>
                  <div style={{ padding: "18px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--accent-text)" }}>STEP 2</div>
                    <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", marginTop: "4px" }}>Pick bKash as payment</div>
                  </div>
                  <div style={{ padding: "18px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--accent-text)" }}>STEP 3</div>
                    <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", marginTop: "4px" }}>Tap BKASH10 in “Offers for you”</div>
                  </div>
                </div>
              </section>
              <section style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <h2 style={{ margin: "0", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }}>Terms</h2>
                <ul style={{ margin: "0", paddingLeft: "22px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "var(--text-base)", lineHeight: "24px", color: "#334155" }}>
                  <li>10% off your bill, up to ৳150.</li>
                  <li>Bill must be ৳500 or more (before delivery charge).</li>
                  <li>Pay online with bKash. Not for cash on delivery.</li>
                  <li>Use on the website or at the shop counter.</li>
                  <li>Valid 10 – 30 Sep 2026.</li>
                  <li>One time per customer (checked by phone number).</li>
                  <li>Cannot be used with other codes or flash sale prices.</li>
                  <li>If you return the item, the discount is taken back from the refund.</li>
                </ul>
              </section>
            </article>
            <aside className="sf-aside gc-side" style={{ width: "360px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "0", marginTop: "36px" }}>
              <section style={{ borderRadius: "var(--radius-xl)", background: "#ffffff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="lbl">Your code</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span className="mono" style={__sx(`flex-grow: 1; height: 48px; padding: 0 14px; border-radius: var(--radius-lg); border: 2px dashed ${v.codeBorder ?? ""}; background: #f8fafc; color: ${v.codeColor ?? ""}; font-size: var(--text-xl); font-weight: var(--weight-semibold); letter-spacing: var(--tracking-label); display: flex; align-items: center; text-decoration: ${v.codeDeco ?? ""};`)}>BKASH10</span>
                  {v.live ? (<>
                    <button type="button" className="copyb" style={{ height: "52px" }} onClick={v.copy}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect width="14" height="14" x="8" y="8" rx="2" />
  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
</svg> Copy</button>
                  </>) : null}
                </div>
                {v.copied ? (<>
                  <div className="fade" role="status" style={{ fontSize: "var(--text-sm)", color: "#065f46" }}>Copied. You can also just pick it at checkout.</div>
                </>) : null}
                {v.live ? (<>
                  <__Link href="/checkout" className="btn solid big">Shop now and save <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="m12 5 7 7-7 7" />
</svg></__Link>
                </>) : null}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="button" className="btn line sm" style={{ flexGrow: "1" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                    </svg>
                    <span>Share</span>
                  </button>
                  <button type="button" className="btn line sm" style={{ flexGrow: "1" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    <span>Copy link</span>
                  </button>
                </div>
              </section>
              <section style={{ borderRadius: "var(--radius-xl)", background: "#ffffff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <h2 style={{ margin: "0", flexGrow: "1", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>More running offers</h2>
                  <__Link href="/offers" style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>See all</__Link>
                </div>
                {__list(v.more).map((m, $index) => (<React.Fragment key={$index}>
                    <__Link href="/offers" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "#0f172a", padding: "8px", borderRadius: "var(--radius-lg)" }}>
                      <span style={__sx(`width: 56px; height: 56px; flex-shrink: 0; border-radius: var(--radius-xl); background: ${m?.cover ?? ""}; color: #fff; font-size: var(--text-sm); font-weight: var(--weight-semibold); display: flex; align-items: center; justify-content: center; text-align: center; line-height: 20px;`)}>{m?.big}</span>
                      <span style={{ flexGrow: "1" }}>
                        <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", lineHeight: "20px" }}>{m?.title}</span>
                        <span style={__sx(`display: block; font-size: var(--text-xs); color: ${m?.lc ?? ""};`)}>{m?.left}</span>
                      </span>
                    </__Link>
                  </React.Fragment>))}
              </section>
            </aside>
          </section>
          <footer className="sf-footer sf-pad" style={{ marginTop: "auto", background: "#0f172a", color: "#cbd5e1", padding: "36px 64px", display: "flex", alignItems: "center", gap: "24px", fontSize: "var(--text-sm)" }}>
            <span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#fff" }}>GridShop</span>
            <span>House 12, Road 5, Dhanmondi, Dhaka</span>
            <span>Call 09610-XXXXXX</span>
            <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>Powered by <img src="/assets/820d4a69b45ed8fa40c9bc6015985c0e.png" alt="GridCommerce" style={{ height: "18px", objectFit: "contain" }} /></span>
          </footer>
        </div>
      </div>
    );
  }
}
