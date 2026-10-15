'use client';
// Generated from design/templates/storefront/OfferDetail.dc.html by scripts/convert-design.mjs.
// OfferDetail — Customer storefront — Offer detail.
// Edit freely: this file is now the source for the screen.

import { ThemeChrome } from './storeChrome';
import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { getLocale } from '@/runtime/ui';
import { websiteOffers, websiteOffer, promoLine } from '@/lib/storeOffers';
import { PROMO_EVENT } from '@/lib/promotions';
import { clockNow } from '@/lib/settlements';

// The promo bar follows the shopper's language (Bangla only when it is chosen) and the offers running now.
function PromoText({ promo }) {
  var st = React.useState('en'), loc = st[0], setLoc = st[1];
  React.useEffect(function () {
    var on = function () { setLoc(getLocale()); };
    on();
    window.addEventListener('gc:locale', on);
    return function () { window.removeEventListener('gc:locale', on); };
  }, []);
  if (!promo) return <span>&nbsp;</span>;
  return <span className={loc === 'bn' ? 'bn' : undefined} lang={loc}>{promo[loc] || promo.en}</span>;
}

// ---- logic ----
// /offer-detail?id=<offer id>: one offer of the promotion engine (lib/promotions.js through lib/storeOffers.js) with the
// real clock: its figure, dates, countdown, how to use it and its terms. Read after mount (?id= and the clock).

function pad(n) { return (n < 10 ? '0' : '') + n; }
function parts(ms) { if (ms < 0) ms = 0; var s = Math.floor(ms / 1000); return { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 }; }
function dk(t) { var d = new Date(t); d.setHours(0, 0, 0, 0); return Math.round(d.getTime() / 86400000); }
var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function dstr(t, y) { var d = new Date(t); return d.getDate() + ' ' + MON[d.getMonth()] + (y ? ' ' + d.getFullYear() : ''); }
function tstr(t) { var d = new Date(t), h = d.getHours(), m = d.getMinutes(); return (h % 12 || 12) + ':' + pad(m) + ' ' + (h < 12 ? 'AM' : 'PM'); }
class Component extends DCLogic {
  componentDidMount() {
    var self = this;
    var load = function () {
      var now = clockNow(), list = websiteOffers(now);
      var id = new URLSearchParams(window.location.search).get('id') || '';
      self.setState({ list: list, offer: id ? websiteOffer(id, now, list) : null, asked: id, promo: promoLine(list), ready: true, now: now });
    };
    this.load = load;
    load();
    window.addEventListener(PROMO_EVENT, load);
    this.iv = setInterval(function () { self.setState({ now: clockNow() }); }, 1000);
  }
  componentWillUnmount() { clearInterval(this.iv); clearTimeout(this.t); window.removeEventListener(PROMO_EVENT, this.load); }
  renderVals() {
    var self = this, s = this.state || {}, o = s.offer, now = s.now || 0;
    if (!o) return { ready: !!s.ready, missing: !!s.ready, promo: s.promo || null };
    var end = o.end || now + 365 * 86400000;
    var ended = o.state === 'ended' || (o.end && now > o.end), soon = !ended && now < o.start, live = !ended && !soon;
    var tot = dk(end) - dk(o.start) + 1, day = Math.max(1, Math.min(tot, dk(now) - dk(o.start) + 1));
    var pct = Math.max(0, Math.min(100, (now - o.start) / (end - o.start) * 100));
    var p = parts(soon ? o.start - now : end - now);
    var fg = ended ? 'var(--text-muted)' : '#0f172a', bg = ended ? '#f1f5f9' : '#f2f6fc';
    var flash = function (msg) { clearTimeout(self.t); self.setState({ note: msg }); self.t = setTimeout(function () { self.setState({ note: '' }); }, 2400); };
    var copyText = function (text, msg) { try { if (navigator.clipboard) navigator.clipboard.writeText(text); } catch (e) { /* ignore */ } flash(msg); };
    var more = (s.list || []).filter(function (x) { return x.id !== o.id && x.state !== 'ended' && (!x.end || x.end > now) && x.start <= now; }).slice(0, 3);
    return {
      ready: true, missing: false, promo: s.promo || null, title: o.title, sub: o.kind === 'flash' ? o.blurb : o.sub, blurb: o.blurb, big: o.big, type: o.type, code: o.code, hasCode: !!o.code,
      crumb: o.code || o.title,
      ended: !!ended, live: live, soon: soon, status: ended ? 'INACTIVE' : soon ? 'COMING SOON' : 'ACTIVE', sBg: ended ? '#e2e8f0' : soon ? '#e0f2fe' : '#e7f8f1', sFg: ended ? '#475569' : soon ? '#075985' : '#047857',
      endedLine: o.endedHow === 'used' ? 'All uses of this offer are taken.' : 'This offer ended on ' + dstr(o.end || now, true) + '.',
      cover: ended ? 'linear-gradient(135deg, #475569, #94a3b8)' : o.cover,
      posted: o.posted, runs: o.end ? 'Runs ' + dstr(o.start) + ' – ' + dstr(o.end) + ' · ' + tot + (tot === 1 ? ' day' : ' days') : 'From ' + dstr(o.start) + ' · no end date',
      clockTitle: ended ? 'Offer ended' : soon ? 'Offer starts in' : o.end ? 'Offer ends in' : 'Running now', showClock: !ended && (soon || !!o.end),
      dayText: ended ? 'Ran ' + tot + ' days' : soon ? (o.end ? 'Runs ' + tot + ' days' : '') : o.end ? 'Day ' + day + ' of ' + tot : 'No end date',
      clock: [{ v: pad(p.d), l: 'Days' }, { v: pad(p.h), l: 'Hours' }, { v: pad(p.m), l: 'Minutes' }, { v: pad(p.s), l: 'Seconds' }].map(function (k) { k.fg = fg; k.bg = bg; return k; }),
      pct: (ended ? 100 : soon || !o.end ? 0 : +pct.toFixed(1)) + '%', barColor: ended ? '#cbd5e1' : '#e2136e',
      startedLine: (soon ? 'Starts ' : 'Started ') + dstr(o.start), endsLine: o.end ? (ended ? 'Ended ' : 'Ends ') + dstr(o.end) + ', ' + tstr(o.end) : 'No end date',
      steps: o.steps, terms: o.terms,
      codeBorder: ended ? '#cbd5e1' : 'var(--sf-primary)', codeColor: ended ? 'var(--text-muted)' : 'var(--sf-primary)', codeDeco: ended ? 'line-through' : 'none',
      noCodeText: o.kind === 'flash' ? 'No code needed — sale prices are on the products.' : 'No code needed — it is taken off at checkout.',
      note: s.note || '',
      copy: function () { copyText(o.code, 'Copied. You can also just pick it at checkout.'); },
      copyLink: function () { copyText(window.location.href, 'Link copied.'); },
      share: function () {
        if (navigator.share) { navigator.share({ title: o.title, url: window.location.href }).catch(function () { /* closed */ }); return; }
        copyText(window.location.href, 'Link copied. Paste it in Messenger or WhatsApp.');
      },
      more: more.map(function (m) { var q = parts((m.end || now) - now); return { href: '/offer-detail?id=' + encodeURIComponent(m.id), big: m.big, title: m.title, left: !m.end ? 'No end date' : q.d >= 1 ? q.d + (q.d > 1 ? ' days left' : ' day left') : 'Ends today', lc: m.end && q.d < 3 ? '#b83210' : '#047857', cover: m.cover }; }),
      hasMore: more.length > 0
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:var(--font-sans);background:#e9eef5;color:#1e293b;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:var(--sf-primary)}a:hover{color:color-mix(in srgb,var(--sf-primary) 82%,#000)}
.card{background:#ffffff;border-radius:var(--radius-xl);box-shadow:0 3px 10px 0 rgba(48,46,56,.06)}
.nav{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:var(--radius-lg);color:#475569;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:.01em;text-decoration:none;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 300ms ease-in-out}
.nav:hover{background:#f1f5f9;color:#0f172a;text-decoration:none}
.nav.on{background:color-mix(in srgb,var(--sf-primary) 8%,transparent);color:var(--sf-primary)}
.navh{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);color:var(--text-muted);padding:18px 12px 6px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:var(--radius-lg);border:0;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 200ms,border-color 200ms}
.btn:hover{text-decoration:none}
.btn:focus-visible,.nav:focus-visible,.ib:focus-visible,.tab:focus-visible,.chip:focus-visible,.step:focus-visible{outline:3px solid color-mix(in srgb,var(--sf-primary) 50%,transparent);outline-offset:2px}
.solid{background:var(--sf-primary);color:var(--sf-on-primary)}.solid:hover{background:color-mix(in srgb,var(--sf-primary) 82%,#000);color:#fff}
.soft{background:color-mix(in srgb,var(--sf-primary) 8%,transparent);color:var(--sf-primary)}.soft:hover{background:color-mix(in srgb,var(--sf-primary) 16%,transparent);color:var(--sf-primary)}
.line{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.line:hover{background:#f1f5f9;color:#1e293b}
.warnbtn{background:#b45309;color:#fff}.warnbtn:hover{background:#92400e;color:#fff}
.big{height:52px;padding:0 24px;font-size:var(--text-sm-plus)}
.sm{height:36px;padding:0 12px;font-size:var(--text-xs-plus)}
.ib{width:36px;height:36px;border-radius:var(--radius-full);border:0;background:transparent;color:#475569;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.ib:hover{background:rgba(203,213,225,.35);color:#0f172a}
.inp{width:100%;height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-sm);color:#1e293b;transition:border-color 200ms}
.inp:hover{border-color:#94a3b8}.inp:focus{outline:none;border-color:var(--sf-primary)}
.inp::placeholder{color:var(--text-muted)}
.lbl{font-size:var(--text-sm);line-height:20px;font-weight:var(--weight-medium);color:#334155}
.tab{height:36px;padding:0 14px;border-radius:var(--radius-full);border:0;background:transparent;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:#475569;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,color 200ms}
.tab:hover{background:#f1f5f9;color:#0f172a}
.tab.on{background:var(--sf-primary);color:var(--sf-on-primary)}
.chip{height:36px;padding:0 14px;border-radius:var(--radius-full);border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,border-color 200ms,color 200ms}
.chip:hover{border-color:#94a3b8}
.chip.on{border-color:var(--sf-primary);background:color-mix(in srgb,var(--sf-primary) 8%,transparent);color:var(--sf-primary)}
.th{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);text-transform:uppercase;color:var(--text-muted);text-align:left;padding:12px 16px;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.td{padding:14px 16px;border-bottom:1px solid #eef2f6;font-size:var(--text-sm);line-height:20px;vertical-align:middle}
.row{transition:background-color 200ms}.row:hover{background:#f8fafc}
.badge{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.badge::before{content:"";width:6px;height:6px;border-radius:var(--radius-full);background:currentColor}
.b-draft{background:#eef2f6;color:#475569}.b-approval{background:#fff4e0;color:#a14f06}.b-approved{background:#e0f2fe;color:#075985}
.b-ordered{background:color-mix(in srgb,var(--sf-primary) 8%,transparent);color:var(--sf-primary)}.b-partial{background:#fff1e6;color:#b4410c}.b-received{background:#e7f8f1;color:#047857}
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
.sw.on{background:var(--sf-primary)}.sw.on::after{transform:translateX(20px)}
.sw:focus-visible{outline:3px solid color-mix(in srgb,var(--sf-primary) 50%,transparent);outline-offset:2px}
.b-live{background:#e7f8f1;color:#047857}.b-sched{background:#e0f2fe;color:#075985}.b-ended{background:#eef2f6;color:#475569}.b-paused{background:#fff4e0;color:#a14f06}
.t-member{background:#eef2f6;color:#475569}.t-silver{background:#e2e8f0;color:#334155}.t-gold{background:#fff4e0;color:#a14f06}.t-plat{background:color-mix(in srgb,var(--sf-primary) 8%,transparent);color:var(--sf-primary)}
.actc{border:1px solid transparent;transition:border-color 200ms,box-shadow 200ms}.actc:hover{border-color:var(--sf-primary);box-shadow:0 6px 18px color-mix(in srgb,var(--sf-primary) 12%,transparent)}
.bn{font-family:var(--font-bn)}
.pulse{animation:gcPulse 1.6s ease-in-out infinite}
@keyframes gcPulse{0%,100%{opacity:1}50%{opacity:.45}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
.sf-nav{font-size:var(--text-sm);font-weight:var(--weight-medium);color:#334155;text-decoration:none;padding:8px 2px;border-bottom:2px solid transparent}
.sf-nav:hover{color:var(--sf-primary);text-decoration:none}
.sf-nav.on{color:var(--sf-primary);border-bottom-color:var(--sf-primary)}
.post{transition:box-shadow 200ms,transform 200ms}.post:hover{box-shadow:0 12px 28px -10px rgba(15,23,42,.25);transform:translateY(-2px)}
.copyb{height:36px;padding:0 12px;border-radius:var(--radius-lg);border:0;background:var(--sf-primary);color:#fff;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.copyb:hover{background:color-mix(in srgb,var(--sf-primary) 82%,#000)}
`;

// ---- markup ----

export default class OfferDetailScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <ThemeChrome screen="OfferDetail" kind="offers" title="Offer">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="sf-root" style={{ width: "100%", flex: "1", display: "flex", flexDirection: "column" }}>
          {!v.ready ? <section className="sf-pad" style={{ padding: "32px 64px 56px", minHeight: "60vh" }} aria-busy="true" /> : null}
          {v.missing ? (
            <section className="sf-pad" style={{ padding: "48px 64px 64px", minHeight: "50vh" }}>
              <div role="status" style={{ maxWidth: "560px", padding: "28px", borderRadius: "var(--radius-xl)", background: "#ffffff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <h1 style={{ margin: "0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>This offer is not available</h1>
                <p style={{ margin: "0", fontSize: "var(--text-base)", color: "#475569" }}>It may have been removed, or the link is not complete.</p>
                <__Link href="/offers" className="btn solid" style={{ alignSelf: "flex-start" }}>See running offers</__Link>
              </div>
            </section>
          ) : null}
          {v.ready && !v.missing ? (<>
          <section className="sf-pad sf-split" style={{ padding: "32px 64px 56px", display: "flex", gap: "32px", alignItems: "flex-start" }}>
            <article style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "22px" }}>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}><a href="#" style={{ color: "var(--text-muted)" }}>Home</a> / <__Link href="/offers" style={{ color: "var(--text-muted)" }}>{"Offers & Promotions"}</__Link> / {v.crumb}</div>
              {v.ended ? (<>
                <div role="status" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", borderRadius: "var(--radius-xl)", background: "#eef2f6", color: "#334155", fontSize: "var(--text-sm)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  <span style={{ flexGrow: "1" }}><b>This offer has ended.</b> {v.endedLine}{v.hasCode ? ' The code ' + v.code + ' no longer works.' : ''}</span>
                  <__Link href="/offers" className="btn solid sm">See running offers</__Link>
                </div>
              </>) : null}
              <div className="sf-hero" style={__sx(`height: 280px; border-radius: var(--radius-xl); background: ${v.cover ?? ""}; color: #fff; padding: 36px; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden;`)}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.22)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", display: "inline-flex", alignItems: "center" }}>{v.type}</span>
                  <span style={__sx(`height: 28px; padding: 0 12px; border-radius: var(--radius-full); background: ${v.sBg ?? ""}; color: ${v.sFg ?? ""}; font-size: var(--text-xs); font-weight: var(--weight-medium); display: inline-flex; align-items: center;`)}>{v.status}</span>
                </div>
                <div>
                  <div style={{ fontSize: "var(--text-5xl)", lineHeight: "1.12", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)" }}>{v.big}</div>
                  <div style={{ fontSize: "var(--text-lg)", opacity: ".92", marginTop: "8px" }}>{v.sub}</div>
                </div>
                <span style={{ position: "absolute", right: "-40px", bottom: "-60px", width: "260px", height: "260px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.08)" }} />
              </div>
              <div>
                <h1 style={{ margin: "0", fontSize: "var(--text-3xl)", lineHeight: "42px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>{v.title}</h1>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px", marginTop: "10px", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect width="18" height="18" x="3" y="4" rx="2" />
  <path d="M16 2v4" />
  <path d="M8 2v4" />
  <path d="M3 10h18" />
</svg>{v.posted}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="10" />
  <path d="M12 6v6l4 2" />
</svg>{v.runs}</span>
                </div>
              </div>
              <p style={{ margin: "0", fontSize: "var(--text-base)", lineHeight: "27px", color: "#334155" }}>{v.blurb}</p>
              <section style={{ borderRadius: "var(--radius-xl)", background: "#ffffff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <h2 style={{ margin: "0", flexGrow: "1", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>{v.clockTitle}</h2>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#475569" }}>{v.dayText}</span>
                </div>
                {v.showClock ? <div style={{ display: "flex", gap: "12px" }}>
                  {__list(v.clock).map((k, $index) => (<React.Fragment key={$index}>
                      <div style={__sx(`flex: 1 1 0; padding: 14px 0; border-radius: var(--radius-xl); background: ${k?.bg ?? ""}; text-align: center;`)}>
                        <div className="mono" style={__sx(`font-size: var(--text-4xl); line-height: 1.2; font-weight: var(--weight-semibold); color: ${k?.fg ?? ""};`)}>{k?.v}</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{k?.l}</div>
                      </div>
                    </React.Fragment>))}
                </div> : null}
                <div style={{ height: "10px", borderRadius: "var(--radius-full)", background: "#eef2f6", overflow: "hidden" }}>
                  <div style={__sx(`width: ${v.pct ?? ""}; height: 100%; border-radius: var(--radius-full); background: ${v.barColor ?? ""};`)} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                  <span>{v.startedLine}</span>
                  <span>{v.endsLine}</span>
                </div>
              </section>
              <section style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <h2 style={{ margin: "0", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }}>How to use it</h2>
                <div className="sf-grid3 gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px" }}>
                  {__list(v.steps).map((t, i) => (
                    <div key={i} style={{ padding: "18px", borderRadius: "var(--radius-xl)", background: "#fff", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--accent-text)" }}>{'STEP ' + (i + 1)}</div>
                      <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", marginTop: "4px" }}>{t}</div>
                    </div>
                  ))}
                </div>
              </section>
              <section style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <h2 style={{ margin: "0", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }}>Terms</h2>
                <ul style={{ margin: "0", paddingLeft: "22px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "var(--text-base)", lineHeight: "24px", color: "#334155" }}>
                  {__list(v.terms).map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </section>
            </article>
            <aside className="sf-aside gc-side" style={{ width: "360px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "0", marginTop: "36px" }}>
              <section style={{ borderRadius: "var(--radius-xl)", background: "#ffffff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="lbl">{v.hasCode ? "Your code" : "How you get it"}</div>
                {v.hasCode ? <div style={{ display: "flex", gap: "8px" }}>
                  <span className="mono" style={__sx(`flex-grow: 1; height: 48px; padding: 0 14px; border-radius: var(--radius-lg); border: 2px dashed ${v.codeBorder ?? ""}; background: #f8fafc; color: ${v.codeColor ?? ""}; font-size: var(--text-xl); font-weight: var(--weight-semibold); letter-spacing: var(--tracking-label); display: flex; align-items: center; text-decoration: ${v.codeDeco ?? ""};`)}>{v.code}</span>
                  {v.live ? (<>
                    <button type="button" className="copyb" style={{ height: "52px" }} onClick={v.copy}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <rect width="14" height="14" x="8" y="8" rx="2" />
  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
</svg> Copy</button>
                  </>) : null}
                </div> : <p style={{ margin: "0", fontSize: "var(--text-sm)", color: "#475569" }}>{v.noCodeText}</p>}
                {v.note ? (<>
                  <div className="fade" role="status" style={{ fontSize: "var(--text-sm)", color: "#065f46" }}>{v.note}</div>
                </>) : null}
                {v.live ? (<>
                  <__Link href="/checkout" className="btn solid big">Shop now and save <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="m12 5 7 7-7 7" />
</svg></__Link>
                </>) : null}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="button" className="btn line sm" style={{ flexGrow: "1" }} onClick={v.share}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                    </svg>
                    <span>Share</span>
                  </button>
                  <button type="button" className="btn line sm" style={{ flexGrow: "1" }} onClick={v.copyLink}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    <span>Copy link</span>
                  </button>
                </div>
              </section>
              {v.hasMore ? (
              <section style={{ borderRadius: "var(--radius-xl)", background: "#ffffff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "22px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <h2 style={{ margin: "0", flexGrow: "1", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>More running offers</h2>
                  <__Link href="/offers" style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>See all</__Link>
                </div>
                {__list(v.more).map((m, $index) => (<React.Fragment key={$index}>
                    <__Link href={m?.href} style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "#0f172a", padding: "8px", borderRadius: "var(--radius-lg)" }}>
                      <span style={__sx(`width: 56px; height: 56px; flex-shrink: 0; border-radius: var(--radius-xl); background: ${m?.cover ?? ""}; color: #fff; font-size: var(--text-sm); font-weight: var(--weight-semibold); display: flex; align-items: center; justify-content: center; text-align: center; line-height: 20px;`)}>{m?.big}</span>
                      <span style={{ flexGrow: "1" }}>
                        <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", lineHeight: "20px" }}>{m?.title}</span>
                        <span style={__sx(`display: block; font-size: var(--text-xs); color: ${m?.lc ?? ""};`)}>{m?.left}</span>
                      </span>
                    </__Link>
                  </React.Fragment>))}
              </section>
              ) : null}
            </aside>
          </section>
          </>) : null}
        </div>
      </ThemeChrome>
    );
  }
}
