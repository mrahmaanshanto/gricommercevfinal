'use client';
// Generated from design/templates/merchant-onboarding/MerchantOnboarding.dc.html by scripts/convert-design.mjs.
// MerchantOnboarding — Sign-up onboarding journey — five steps (account, verify, business, how you sell, shop link) beside a merchant-story slider.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

var SLIDES = [
  { img: '/assets/cfbbbbd758347fbb3f71590345d24674.webp', alt: 'Fashion boutique owner packing an order', tag: 'Fashion boutique · Dhaka', quote: 'Facebook orders, courier booking and stock used to live in three notebooks. Now it’s one screen.', who: '[Merchant name]', where: '[Shop name] · Online fashion' },
  { img: '/assets/99e39eac40a8abf8968649c253b23f9e.webp', alt: 'Phone accessories shop owner at a POS counter', tag: 'Electronics shop · Dhaka', quote: 'The counter and the website share one stock. When a case sells in the shop, it disappears online.', who: '[Merchant name]', where: '[Shop name] · Phones & accessories' },
  { img: '/assets/dec2496b57e91a856eaa9f8fd17d9124.webp', alt: 'Skincare seller preparing a live sale', tag: 'Beauty & skincare · Live selling', quote: 'I go live, orders come in, and bKash links go out before the video ends.', who: '[Merchant name]', where: '[Shop name] · Skincare' },
  { img: '/assets/901f735d539a8b71fb8e8162bb755ec3.webp', alt: 'Warehouse staff scanning a parcel barcode', tag: 'Warehouse · Scan in, scan out', quote: 'Every parcel is scanned in and out. We know where each piece is.', who: '[Merchant name]', where: '[Company name] · Distribution' },
  { img: '/assets/937ca529653ad58861f011f257ebc4df.webp', alt: 'Senior business owner in a Dhaka office', tag: 'Growing brands · Multi-branch', quote: 'Serious retail needs serious systems — built for how Bangladesh buys and sells.', who: '[Business leader name]', where: '[Company name] · [Title]' }
];
var CATS = [
  { k: 'fashion', label: 'Fashion & clothing', slide: 0 }, { k: 'beauty', label: 'Beauty & skincare', slide: 2 }, { k: 'elec', label: 'Phones & electronics', slide: 1 },
  { k: 'food', label: 'Food & grocery', slide: 3 }, { k: 'home', label: 'Home & living', slide: 3 }, { k: 'other', label: 'Something else', slide: 4 }
];
var WHERE = ['Facebook page', 'Instagram', 'WhatsApp', 'Physical shop', 'Marketplace', 'Not selling yet'];
var SIZE = ['Just starting', 'Under 100', '100–500', '500–2,000', '2,000+'];
var PAY = ['Cash on delivery', 'bKash', 'Nagad', 'Card'];
var NAMES = ['Create account', 'Verify number', 'Your business', 'How you sell', 'Shop link'];
class Component extends DCLogic {
  componentDidMount() { this.startTimer(); }
  componentWillUnmount() { clearInterval(this.iv); }
  startTimer() {
    var self = this; clearInterval(this.iv);
    this.iv = setInterval(function () { var s = self.state || {}; if (s.hover || s.paused) return; self.go((((s.slide || 0) + 1) % SLIDES.length), true); }, 6500);
  }
  go(i, auto) { var s = this.state || {}; this.setState({ slide: i, gen: (s.gen || 0) + 1 }); if (!auto) this.startTimer(); }
  renderVals() {
    var self = this, s = this.state || {};
    var step = s.step || 1, slide = s.slide || 0, gen = s.gen || 0;
    var name = s.name != null ? s.name : 'Nusrat Jahan', phone = s.phone != null ? s.phone : '1712345678', biz = s.biz != null ? s.biz : '';
    var code = s.code || '', cat = s.cat || '', where = s.where || ['Facebook page'], size = s.size || '', pay = s.pay || ['Cash on delivery', 'bKash'];
    var set = function (p) { self.setState(p); };
    var toggleIn = function (arr, v) { var a = arr.slice(); var i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else a.push(v); return a; };
    var first = (name || 'there').split(' ')[0];
    var slug = s.slug || ((biz || first + ' shop').toLowerCase().replace(/[^a-z0-9]+/g, '') || 'myshop');
    var catObj = CATS.filter(function (c) { return c.k === cat; })[0];
    var todo = [{ title: 'Add your first product', sub: 'Snap a photo, set a price and stock. Scan the barcode if it has one.', time: '2 min' }];
    if (where.indexOf('Facebook page') >= 0 || where.indexOf('Instagram') >= 0) todo.push({ title: 'Connect your Facebook and Instagram', sub: 'Messages and comments become orders in one inbox.', time: '1 min' });
    if (pay.indexOf('Cash on delivery') >= 0) todo.push({ title: 'Set delivery charges and courier', sub: 'Inside Dhaka, outside Dhaka, and COD fee.', time: '2 min' });
    if (pay.indexOf('bKash') >= 0 || pay.indexOf('Nagad') >= 0) todo.push({ title: 'Connect bKash / Nagad payments', sub: 'Customers pay online, money comes to your account.', time: '3 min' });
    var active = Math.min(code.length, 5);
    return {
      s1: step === 1, s2: step === 2, s3: step === 3, s4: step === 4, s5: step === 5, s6: step === 6,
      inFlow: step <= 5, stepNo: step, stepName: NAMES[step - 1] || '', anim: s.dir === 'back' ? 'stepb' : 'step',
      segs: [1, 2, 3, 4, 5].map(function (n) { return { w: n < step ? '100%' : (n === step ? '50%' : '0%') }; }),
      canBack: step > 1, canSkip: step === 4,
      nextLabel: step === 5 ? 'Create my shop' : (step === 2 ? 'Verify' : 'Continue'),
      next: function () { if (step === 2 && code.length < 6) { set({ code: '482913' }); } set({ step: step + 1, dir: 'fwd' }); },
      back: function () { set({ step: Math.max(1, step - 1), dir: 'back' }); },
      name: name, setName: function (e) { set({ name: e.target.value }); },
      phone: phone, setPhone: function (e) { set({ phone: e.target.value.replace(/\D/g, '').slice(0, 10) }); },
      phoneFmt: phone.length > 4 ? phone.slice(0, 4) + '-' + phone.slice(4) : phone,
      pwType: s.showPw ? 'text' : 'password', pwLabel: s.showPw ? 'Hide password' : 'Show password', togglePw: function () { set({ showPw: !s.showPw }); },
      boxes: [0, 1, 2, 3, 4, 5].map(function (i) { var on = !!s.cfoc && i === active; var d = code.charAt(i); return { d: d, has: !!d, caret: on && !d, border: on ? '#003087' : (d ? '#94a3b8' : '#cbd5e1'), ring: on ? '0 0 0 3px rgba(0,48,135,.12)' : 'none' }; }),
      onCode: function (e) { var v = e.target.value.replace(/\D/g, '').slice(0, 6); e.target.value = v; set({ code: v }); },
      cf: function () { set({ cfoc: true }); }, cb: function () { set({ cfoc: false }); },
      fillCode: function () { set({ code: '482913' }); },
      first: first, biz: biz, setBiz: function (e) { set({ biz: e.target.value }); },
      bizOr: biz || (first + '’s shop'),
      cats: CATS.map(function (c, i) { var on = c.k === cat; return { label: c.label, is_fashion: c.k === 'fashion', is_beauty: c.k === 'beauty', is_elec: c.k === 'elec', is_food: c.k === 'food', is_home: c.k === 'home', is_other: c.k === 'other', on: on, cls: on ? 'opt on' : 'opt', tint: on ? '#003087' : '#e0f3fb', fg: on ? '#ffffff' : '#0089c3',
        pick: function () { set({ cat: c.k }); self.go(c.slide); } }; }),
      where: WHERE.map(function (w) { var on = where.indexOf(w) >= 0; return { label: w, on: on, cls: on ? 'pick on' : 'pick', pick: function () { set({ where: toggleIn(where, w) }); } }; }),
      size: SIZE.map(function (w) { var on = w === size; return { label: w, on: on, cls: on ? 'pick on' : 'pick', pick: function () { set({ size: w }); } }; }),
      pay: PAY.map(function (w) { var on = pay.indexOf(w) >= 0; return { label: w, on: on, cls: on ? 'pick on' : 'pick', pick: function () { set({ pay: toggleIn(pay, w) }); } }; }),
      slug: slug, setSlug: function (e) { set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }); },
      catLabel: catObj ? catObj.label : 'Your products', payLine: pay.length ? pay.slice(0, 2).join(' · ') : 'Payment options',
      todo: todo.slice(0, 3),
      slides: SLIDES.map(function (x, i) { return { img: x.img, hasImg: !!x.img, noImg: !x.img, alt: x.alt, n: i + 1, cls: i === slide ? 'slide on' : 'slide', hidden: i !== slide }; }),
      bars: SLIDES.map(function (x, i) { return { cls: i < slide ? 'fill done' : (i === slide ? (gen % 2 ? 'fill run-b' : 'fill run-a') : 'fill') }; }),
      cur: SLIDES[slide],
      curList: [0].map(function () { var x = SLIDES[slide]; return { quote: x.quote, who: x.who, where: x.where, initial: x.who.replace('[', '').charAt(0), cls: gen % 2 ? 'qtb' : 'qt' }; }),
      dots: SLIDES.map(function (x, i) { var on = i === slide; return { n: i + 1, on: on, w: on ? '28px' : '8px', bg: on ? '#ffffff' : 'rgba(255,255,255,.4)', pick: function () { self.go(i); } }; }),
      prev: function () { self.go((slide + SLIDES.length - 1) % SLIDES.length); }, nextSlide: function () { self.go((slide + 1) % SLIDES.length); },
      hoverOn: function () { set({ hover: true }); }, hoverOff: function () { set({ hover: false }); },
      togglePause: function () { set({ paused: !s.paused }); }, pauseLabel: s.paused ? 'Play stories' : 'Pause stories', isPaused: !!s.paused, isPlaying: !s.paused,
      carCls: (s.hover || s.paused) ? 'paused' : ''
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:'Poppins',system-ui,-apple-system,'Segoe UI',sans-serif;background:#ffffff;color:#1e293b;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087;font-weight:500;text-decoration:none}a:hover{color:#002a77;text-decoration:underline}
.inp{width:100%;height:48px;padding:0 14px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;font:inherit;font-size:15px;color:#1e293b;transition:border-color 200ms cubic-bezier(0,0,.2,1)}
.inp:hover{border-color:#94a3b8}.inp:focus{outline:none;border-color:#003087}.inp::placeholder{color:#64748b}
.lbl{font-size:13px;line-height:18px;font-weight:500;color:#334155}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:52px;padding:0 24px;border-radius:10px;border:0;font:inherit;font-size:15px;font-weight:500;letter-spacing:.02em;cursor:pointer;white-space:nowrap;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 200ms,border-color 200ms}
.btn:hover{text-decoration:none}
.btn:focus-visible,.opt:focus-visible,.pick:focus-visible,.ctl:focus-visible,.dot:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.ghost{background:transparent;color:#334155}.ghost:hover{background:#f1f5f9;color:#0f172a}
.line{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.line:hover{background:#f8fafc;border-color:#94a3b8}
.opt{display:flex;flex-direction:column;align-items:flex-start;gap:10px;padding:16px;border-radius:14px;border:1.5px solid #e2e8f0;background:#fff;font:inherit;text-align:left;cursor:pointer;transition:border-color 200ms,background-color 200ms,box-shadow 200ms}
.opt:hover{border-color:#94a3b8}
.opt.on{border-color:#003087;background:rgba(0,48,135,.04);box-shadow:0 0 0 3px rgba(0,48,135,.08)}
.pick{height:42px;padding:0 16px;border-radius:999px;border:1.5px solid #e2e8f0;background:#fff;font:inherit;font-size:14px;font-weight:500;color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:8px;transition:border-color 200ms,background-color 200ms,color 200ms}
.pick:hover{border-color:#94a3b8}
.pick.on{border-color:#003087;background:#003087;color:#fff}
.step{animation:stIn 460ms cubic-bezier(.16,1,.3,1) both}
@keyframes stIn{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:none}}
.stepb{animation:stBack 460ms cubic-bezier(.16,1,.3,1) both}
@keyframes stBack{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:none}}
.rise{opacity:0;animation:rise 520ms cubic-bezier(0,0,.2,1) forwards}
@keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.slide{position:absolute;inset:0;opacity:0;transition:opacity 900ms ease-in-out}
.slide.on{opacity:1}
.slide img{width:100%;height:100%;object-fit:cover;object-position:50% 20%;display:block;transform:scale(1.08)}
.slide.on img{animation:kb 7s ease-out forwards}
@keyframes kb{from{transform:scale(1.08)}to{transform:scale(1)}}
.qt{animation:qt 700ms cubic-bezier(.16,1,.3,1) both}
@keyframes qt{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.qtb{animation:qtb 700ms cubic-bezier(.16,1,.3,1) both}
@keyframes qtb{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.bar{flex-grow:1;height:3px;border-radius:999px;background:rgba(255,255,255,.28);overflow:hidden}
.fill{height:3px;border-radius:999px;background:#ffffff;width:0}
.fill.done{width:100%}
.fill.run-a{animation:fillA 6.5s linear forwards}.fill.run-b{animation:fillB 6.5s linear forwards}
@keyframes fillA{from{width:0}to{width:100%}}@keyframes fillB{from{width:0}to{width:100%}}
.paused .fill{animation-play-state:paused}
.ctl{width:44px;height:44px;border-radius:999px;border:1px solid rgba(255,255,255,.35);background:rgba(1,33,105,.35);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background-color 200ms}
.ctl:hover{background:rgba(255,255,255,.18)}
.seg{flex-grow:1;height:6px;border-radius:999px;background:#e9eef5;overflow:hidden}
.seg>div{height:6px;border-radius:999px;background:#003087;transition:width 500ms cubic-bezier(.16,1,.3,1)}
.box{transition:border-color 200ms,box-shadow 200ms}
.digit{animation:dg 220ms cubic-bezier(0,0,.2,1)}
@keyframes dg{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.caret{width:2px;height:24px;background:#003087;animation:blink 1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.ck-c{stroke-dasharray:164;stroke-dashoffset:164;animation:draw 640ms cubic-bezier(0,0,.2,1) forwards}
.ck-m{stroke-dasharray:40;stroke-dashoffset:40;animation:draw 380ms 460ms cubic-bezier(0,0,.2,1) forwards}
@keyframes draw{to{stroke-dashoffset:0}}
.stripes{background-color:#0b2a66;background-image:repeating-linear-gradient(115deg,rgba(255,255,255,.05) 0 1px,transparent 1px 46px)}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-delay:0ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}.slide.on img{animation:none;transform:none}}
`;

// ---- markup ----

export default class MerchantOnboardingScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="MerchantOnboarding">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "900px", display: "flex", background: "#ffffff", overflow: "hidden" }}>
          <div role="region" aria-roledescription="carousel" aria-label="Merchant stories" onMouseEnter={v.hoverOn} onMouseLeave={v.hoverOff} className={v.carCls} style={{ position: "relative", flexGrow: "1", margin: "16px 0 16px 16px", borderRadius: "24px", overflow: "hidden", background: "#012169" }}>
            {__list(v.slides).map((sl, $index) => (<React.Fragment key={$index}>
                <div className={sl?.cls} aria-hidden={sl?.hidden}>
                  {sl?.hasImg ? (<>
                    <img src={sl?.img} alt={sl?.alt} />
                  </>) : null}
                  {sl?.noImg ? (<>
                    <div className="stripes" style={{ position: "absolute", inset: "0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", color: "rgba(255,255,255,.7)", fontSize: "13px" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                        <circle cx="12" cy="13" r="3" />
                      </svg>
                      <span>Photo {sl?.n} · {sl?.alt}</span>
                    </div>
                  </>) : null}
                </div>
              </React.Fragment>))}
            <div style={{ position: "absolute", inset: "0", background: "linear-gradient(180deg, rgba(1,20,60,.45) 0%, rgba(1,20,60,0) 22%, rgba(1,20,60,0) 42%, rgba(1,20,60,.92) 100%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", left: "32px", right: "32px", top: "28px", display: "flex", gap: "8px" }}>
              {__list(v.bars).map((br, $index) => (<React.Fragment key={$index}>
                  <div className="bar">
                    <div className={br?.cls} />
                  </div>
                </React.Fragment>))}
            </div>
            <div style={{ position: "absolute", left: "32px", top: "52px", display: "flex", gap: "8px" }}>
              <span style={{ height: "30px", padding: "0 12px", borderRadius: "999px", background: "rgba(255,255,255,.16)", color: "#fff", fontSize: "12px", fontWeight: "500", display: "inline-flex", alignItems: "center", gap: "6px", backdropFilter: "blur(8px)" }}>{v.cur?.tag}</span>
              <span style={{ height: "30px", padding: "0 12px", borderRadius: "999px", background: "#ff9800", color: "#3b1d00", fontSize: "12px", fontWeight: "600", display: "inline-flex", alignItems: "center" }}>Sample story — replace with a real merchant</span>
            </div>
            <div style={{ position: "absolute", left: "40px", right: "40px", bottom: "40px", display: "flex", flexDirection: "column", gap: "22px" }}>
              {__list(v.curList).map((q, $index) => (<React.Fragment key={$index}>
                  <div className={q?.cls} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                    <svg width="36" height="28" viewBox="0 0 36 28" fill="#009cde" aria-hidden="true">
                      <path d="M0 28V16.6C0 7.4 5 1.8 14.2 0l1.6 3.6C10.6 5 8 8.2 7.6 12.6H14V28H0Zm20 0V16.6C20 7.4 25 1.8 34.2 0l1.6 3.6C30.6 5 28 8.2 27.6 12.6H34V28H20Z" />
                    </svg>
                    <p style={{ margin: "0", fontSize: "28px", lineHeight: "38px", fontWeight: "500", letterSpacing: "-0.015em", color: "#ffffff", textWrap: "pretty" }}>{q?.quote}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "999px", background: "rgba(255,255,255,.16)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600" }}>{q?.initial}</div>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: "600", color: "#fff" }}>{q?.who}</div>
                        <div style={{ fontSize: "13px", color: "rgba(255,255,255,.78)" }}>{q?.where}</div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>))}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "18px", borderTop: "1px solid rgba(255,255,255,.18)" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  {__list(v.dots).map((d, $index) => (<React.Fragment key={$index}>
                      <button type="button" className="dot" aria-label={`Show story ${d?.n ?? ""}`} aria-current={d?.on} onClick={d?.pick} style={__sx(`width: ${d?.w ?? ""}; height: 8px; border-radius: 999px; border: 0; padding: 0; background: ${d?.bg ?? ""}; cursor: pointer; transition: width 400ms cubic-bezier(.16,1,.3,1), background-color 300ms;`)} />
                    </React.Fragment>))}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="button" className="ctl" aria-label="Previous story" onClick={v.prev}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  <button type="button" className="ctl" aria-label={v.pauseLabel} onClick={v.togglePause}>
                    {v.isPaused ? (<>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polygon points="6 3 20 12 6 21 6 3" />
                      </svg>
                    </>) : null}
                    {v.isPlaying ? (<>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                      </svg>
                    </>) : null}
                  </button>
                  <button type="button" className="ctl" aria-label="Next story" onClick={v.nextSlide}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div style={{ width: "640px", flexShrink: "0", height: "900px", padding: "36px 64px 32px 72px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <img src="/assets/ff462bc6abaa5d30500a126b259de9d6.png" alt="GridCommerce" style={{ height: "34px", width: "auto", display: "block" }} />
              <span style={{ fontSize: "14px", color: "#475569" }}>Have an account? <__Link href="/merchant-sign-in">Sign in</__Link></span>
            </div>
            {v.inFlow ? (<>
              <div style={{ marginTop: "44px" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  {__list(v.segs).map((g, $index) => (<React.Fragment key={$index}>
                      <div className="seg">
                        <div style={__sx(`width: ${g?.w ?? ""};`)} />
                      </div>
                    </React.Fragment>))}
                </div>
                <div style={{ marginTop: "10px", fontSize: "13px", color: "#64748b" }}>Step {v.stepNo} of 5 · {v.stepName}</div>
              </div>
            </>) : null}
            <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: "480px" }}>
              {v.s1 ? (<>
                <div className={v.anim} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                  <div>
                    <h1 style={{ margin: "0", fontSize: "34px", lineHeight: "42px", fontWeight: "700", letterSpacing: "-0.028em", color: "#0f172a" }}>Let’s set up your shop</h1>
                    <p style={{ margin: "10px 0 0", fontSize: "15px", lineHeight: "24px", color: "#475569" }}>Two minutes, a few taps. No card needed — start free.</p>
                  </div>
                  <button type="button" className="btn line" style={{ width: "100%" }}><span style={{ fontSize: "17px", fontWeight: "700", color: "#003087" }}>G</span>Continue with Google</button>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ flexGrow: "1", height: "1px", background: "#e2e8f0" }} />
                    <span style={{ fontSize: "12px", color: "#64748b" }}>or with your mobile number</span>
                    <div style={{ flexGrow: "1", height: "1px", background: "#e2e8f0" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label className="lbl" htmlFor="su-name">Your name</label>
                    <input id="su-name" className="inp" type="text" autoComplete="name" placeholder="e.g. Nusrat Jahan" value={v.name} onChange={v.setName} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label className="lbl" htmlFor="su-phone">Mobile number</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "0", height: "48px", display: "flex", alignItems: "center", gap: "10px", fontSize: "15px", fontWeight: "500", color: "#334155", pointerEvents: "none" }}>+880<span style={{ width: "1px", height: "22px", background: "#cbd5e1" }} /></span>
                      <input id="su-phone" className="inp" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="1XXX-XXXXXX" value={v.phone} onChange={v.setPhone} style={{ paddingLeft: "78px" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label className="lbl" htmlFor="su-pw">Create a password</label>
                    <div style={{ position: "relative" }}>
                      <input id="su-pw" className="inp" type={v.pwType} autoComplete="new-password" placeholder="At least 8 characters" style={{ paddingRight: "52px" }} />
                      <button type="button" className="ctl" onClick={v.togglePw} aria-label={v.pwLabel} style={{ position: "absolute", right: "2px", top: "2px", border: "0", background: "transparent", color: "#64748b" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: "0", fontSize: "12px", lineHeight: "18px", color: "#64748b" }}>By continuing you agree to the <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.</p>
                </div>
              </>) : null}
              {v.s2 ? (<>
                <div className={v.anim} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                  <div>
                    <h1 style={{ margin: "0", fontSize: "34px", lineHeight: "42px", fontWeight: "700", letterSpacing: "-0.028em", color: "#0f172a" }}>Check your phone</h1>
                    <p style={{ margin: "10px 0 0", fontSize: "15px", lineHeight: "24px", color: "#475569" }}>We sent a 6-digit code by SMS to <strong style={{ fontWeight: "600", color: "#0f172a" }}>+880 {v.phoneFmt}</strong>. <button type="button" onClick={v.back} style={{ border: "0", background: "none", padding: "0", font: "inherit", color: "#003087", fontWeight: "500", cursor: "pointer" }}>Change</button></p>
                  </div>
                  <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "10px" }}>
                    {__list(v.boxes).map((b, $index) => (<React.Fragment key={$index}>
                        <div className="box" style={__sx(`height: 64px; border-radius: 12px; border: 1.5px solid ${b?.border ?? ""}; box-shadow: ${b?.ring ?? ""}; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 600; color: #0f172a; background: #fff;`)}>
                          {b?.has ? (<>
                            <span className="digit">{b?.d}</span>
                          </>) : null}
                          {b?.caret ? (<>
                            <span className="caret" />
                          </>) : null}
                        </div>
                      </React.Fragment>))}
                    <input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength="6" aria-label="6-digit code" onInput={v.onCode} onFocus={v.cf} onBlur={v.cb} style={{ position: "absolute", inset: "0", width: "100%", height: "100%", opacity: "0", border: "0", fontSize: "16px", cursor: "text" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "14px", color: "#475569" }}>
                    <span>Didn’t get it? You can resend in 0:24.</span>
                    <button type="button" onClick={v.fillCode} style={{ border: "0", background: "none", padding: "0", font: "inherit", color: "#003087", fontWeight: "500", cursor: "pointer" }}>Use demo code</button>
                  </div>
                </div>
              </>) : null}
              {v.s3 ? (<>
                <div className={v.anim} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                  <div>
                    <h1 style={{ margin: "0", fontSize: "34px", lineHeight: "42px", fontWeight: "700", letterSpacing: "-0.028em", color: "#0f172a" }}>Welcome, {v.first}. What do you sell?</h1>
                    <p style={{ margin: "10px 0 0", fontSize: "15px", lineHeight: "24px", color: "#475569" }}>We’ll set up your shop with the right categories, product fields and sample pages.</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label className="lbl" htmlFor="su-biz">Business name</label>
                    <input id="su-biz" className="inp" type="text" placeholder="e.g. Nusrat’s Closet" value={v.biz} onChange={v.setBiz} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }}>
                    {__list(v.cats).map((c, $index) => (<React.Fragment key={$index}>
                        <button type="button" className={c?.cls} aria-pressed={c?.on} onClick={c?.pick}>
                          <span style={__sx(`width: 40px; height: 40px; border-radius: 10px; background: ${c?.tint ?? ""}; color: ${c?.fg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
                            {c?.is_fashion ? (<>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                              </svg>
                            </>) : null}
                            {c?.is_beauty ? (<>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                              </svg>
                            </>) : null}
                            {c?.is_elec ? (<>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect width="14" height="20" x="5" y="2" rx="2" />
                                <path d="M12 18h.01" />
                              </svg>
                            </>) : null}
                            {c?.is_food ? (<>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                                <path d="M10 2c1 .5 2 2 2 5" />
                              </svg>
                            </>) : null}
                            {c?.is_home ? (<>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                                <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                              </svg>
                            </>) : null}
                            {c?.is_other ? (<>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                                <path d="M2 7h20" />
                              </svg>
                            </>) : null}
                          </span>
                          <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "600", color: "#0f172a" }}>{c?.label}</span>
                        </button>
                      </React.Fragment>))}
                  </div>
                </div>
              </>) : null}
              {v.s4 ? (<>
                <div className={v.anim} style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
                  <div>
                    <h1 style={{ margin: "0", fontSize: "34px", lineHeight: "42px", fontWeight: "700", letterSpacing: "-0.028em", color: "#0f172a" }}>How do you sell today?</h1>
                    <p style={{ margin: "10px 0 0", fontSize: "15px", lineHeight: "24px", color: "#475569" }}>Pick all that fit. We’ll connect these first.</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span className="lbl" style={{ fontSize: "14px", color: "#0f172a", fontWeight: "600" }}>Where do customers find you?</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {__list(v.where).map((x, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={x?.cls} aria-pressed={x?.on} onClick={x?.pick}>{x?.label}</button>
                        </React.Fragment>))}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span className="lbl" style={{ fontSize: "14px", color: "#0f172a", fontWeight: "600" }}>Orders in a month</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {__list(v.size).map((x, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={x?.cls} aria-pressed={x?.on} onClick={x?.pick}>{x?.label}</button>
                        </React.Fragment>))}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span className="lbl" style={{ fontSize: "14px", color: "#0f172a", fontWeight: "600" }}>How do customers pay?</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {__list(v.pay).map((x, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={x?.cls} aria-pressed={x?.on} onClick={x?.pick}>{x?.label}</button>
                        </React.Fragment>))}
                    </div>
                  </div>
                </div>
              </>) : null}
              {v.s5 ? (<>
                <div className={v.anim} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                  <div>
                    <h1 style={{ margin: "0", fontSize: "34px", lineHeight: "42px", fontWeight: "700", letterSpacing: "-0.028em", color: "#0f172a" }}>Pick your shop link</h1>
                    <p style={{ margin: "10px 0 0", fontSize: "15px", lineHeight: "24px", color: "#475569" }}>This is where customers will order from. You can connect your own domain later.</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label className="lbl" htmlFor="su-slug">Shop link</label>
                    <div style={{ position: "relative" }}>
                      <input id="su-slug" className="inp" type="text" value={v.slug} onChange={v.setSlug} style={{ paddingRight: "200px" }} />
                      <span style={{ position: "absolute", right: "14px", top: "14px", fontSize: "14px", color: "#64748b" }}>.[your-platform-domain]</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#047857", fontWeight: "500" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span>{v.slug}.[your-platform-domain] is available</span>
                  </div>
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 12px 30px -18px rgba(1,33,105,.35)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "999px", background: "#cbd5e1" }} />
                      <span style={{ width: "10px", height: "10px", borderRadius: "999px", background: "#cbd5e1" }} />
                      <span style={{ width: "10px", height: "10px", borderRadius: "999px", background: "#cbd5e1" }} />
                      <span style={{ marginLeft: "8px", flexGrow: "1", height: "26px", borderRadius: "999px", background: "#fff", display: "flex", alignItems: "center", padding: "0 12px", fontSize: "12px", color: "#475569" }}>
                        <span style={{ marginLeft: "6px" }}>{v.slug}.[your-platform-domain]</span>
                      </span>
                    </div>
                    <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>{v.bizOr}</span>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>{v.catLabel}</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px" }}>
                        <div style={{ height: "70px", borderRadius: "8px", background: "#e0f3fb" }} />
                        <div style={{ height: "70px", borderRadius: "8px", background: "#e9eef5" }} />
                        <div style={{ height: "70px", borderRadius: "8px", background: "#e0f3fb" }} />
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <span style={{ height: "28px", padding: "0 12px", borderRadius: "999px", background: "#003087", color: "#fff", fontSize: "12px", fontWeight: "500", display: "inline-flex", alignItems: "center" }}>Order now</span>
                        <span style={{ height: "28px", padding: "0 12px", borderRadius: "999px", background: "#f1f5f9", color: "#334155", fontSize: "12px", fontWeight: "500", display: "inline-flex", alignItems: "center" }}>{v.payLine}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>) : null}
              {v.s6 ? (<>
                <div className="step" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                  <svg width="88" height="88" viewBox="0 0 56 56" fill="none">
                    <circle className="ck-c" cx="28" cy="28" r="26" stroke="#10b981" strokeWidth="2" />
                    <path className="ck-m" d="M17 29l7 7 15-15" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="rise" style={{ animationDelay: "400ms" }}>
                    <h1 style={{ margin: "0", fontSize: "34px", lineHeight: "42px", fontWeight: "700", letterSpacing: "-0.028em", color: "#0f172a" }}>{v.bizOr} is ready</h1>
                    <p style={{ margin: "10px 0 0", fontSize: "15px", lineHeight: "24px", color: "#475569" }}>Here’s what to do first. We picked these from your answers.</p>
                  </div>
                  <div className="rise" style={{ display: "flex", flexDirection: "column", gap: "10px", animationDelay: "560ms" }}>
                    {__list(v.todo).map((t, $index) => (<React.Fragment key={$index}>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
                          <span style={{ width: "28px", height: "28px", borderRadius: "999px", border: "2px solid #cbd5e1", flexShrink: "0" }} />
                          <div style={{ flexGrow: "1" }}>
                            <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>{t?.title}</div>
                            <div style={{ fontSize: "12px", lineHeight: "17px", color: "#64748b" }}>{t?.sub}</div>
                          </div>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>{t?.time}</span>
                        </div>
                      </React.Fragment>))}
                  </div>
                  <__Link href="/merchant-overview" className="btn solid rise" style={{ width: "100%", animationDelay: "700ms" }}>Go to my dashboard<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="m12 5 7 7-7 7" />
</svg></__Link>
                </div>
              </>) : null}
            </div>
            {v.inFlow ? (<>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", maxWidth: "480px" }}>
                {v.canBack ? (<>
                  <button type="button" className="btn ghost" onClick={v.back}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                    <span>Back</span>
                  </button>
                </>) : null}
                <div style={{ flexGrow: "1" }} />
                {v.canSkip ? (<>
                  <button type="button" className="btn ghost" onClick={v.next}>Skip for now</button>
                </>) : null}
                <button type="button" className="btn solid" onClick={v.next} style={{ minWidth: "180px" }}>{v.nextLabel}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="m12 5 7 7-7 7" />
</svg></button>
              </div>
            </>) : null}
          </div>
        </div>
      </div>
    );
  }
}
