'use client';
// Generated from design/templates/merchant-signin/MobileSignUp.dc.html by scripts/convert-design.mjs.
// Sign up onboarding · mobile
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

var SLIDES = [
  { img: '/assets/cfbbbbd758347fbb3f71590345d24674.webp', alt: 'Fashion boutique owner packing an order', tag: 'Fashion boutique · Dhaka', quote: 'Facebook orders, courier booking and stock used to live in three notebooks. Now it’s one screen.', who: 'Nusrat Jahan', where: 'Nusrat’s Closet · Online fashion' },
  { img: '/assets/99e39eac40a8abf8968649c253b23f9e.webp', alt: 'Phone accessories shop owner at a POS counter', tag: 'Electronics shop · Dhaka', quote: 'The counter and the website share one stock. When a case sells in the shop, it disappears online.', who: 'Rakib Hasan', where: 'Rakib Mobile Corner · Phones & accessories' },
  { img: '/assets/dec2496b57e91a856eaa9f8fd17d9124.webp', alt: 'Skincare seller preparing a live sale', tag: 'Beauty & skincare · Live selling', quote: 'I go live, orders come in, and bKash links go out before the video ends.', who: 'Tania Islam', where: 'Glow by Tania · Skincare' },
  { img: '/assets/901f735d539a8b71fb8e8162bb755ec3.webp', alt: 'Warehouse staff scanning a parcel barcode', tag: 'Warehouse · Scan in, scan out', quote: 'Every parcel is scanned in and out. We know where each piece is.', who: 'Kamal Uddin', where: 'Kamal Traders · Distribution' },
  { img: '/assets/937ca529653ad58861f011f257ebc4df.webp', alt: 'Senior business owner in a Dhaka office', tag: 'Growing brands · Multi-branch', quote: 'Serious retail needs serious systems — built for how Bangladesh buys and sells.', who: 'Farzana Rahman', where: 'Deshi Bazaar Group · Managing director' }
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
    var step = s.step != null ? s.step : 0, slide = s.slide || 0, gen = s.gen || 0;
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
      inFlow: step >= 1 && step <= 5, stepNo: step, stepName: NAMES[step - 1] || '', anim: s.dir === 'back' ? 'stepb' : 'step',
      segs: [1, 2, 3, 4, 5].map(function (n) { return { w: n < step ? '100%' : (n === step ? '50%' : '0%') }; }),
      canBack: step > 1, canSkip: step === 4,
      nextLabel: step === 5 ? 'Create my shop' : (step === 2 ? 'Verify' : 'Continue'),
      next: function () { if (step === 2 && code.length < 6) { set({ code: '482913' }); } set({ step: step + 1, dir: 'fwd' }); },
      back: function () { set({ step: Math.max(0, step - 1), dir: 'back' }); },
      start: function () { set({ step: 1, dir: 'fwd' }); }, s0: step === 0, inApp: step >= 1,
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
        pick: function () { set({ cat: c.k }); } }; }),
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
body{margin:0;font-family:var(--font-sans);background:#ffffff;color:#1e293b;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087;font-weight:var(--weight-medium);text-decoration:none}a:hover{color:#002a77;text-decoration:underline}
.inp{width:100%;height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-sm);color:#1e293b;transition:border-color 200ms cubic-bezier(0,0,.2,1)}
.inp:hover{border-color:#94a3b8}.inp:focus{outline:none;border-color:#003087}.inp::placeholder{color:var(--text-muted)}
.lbl{font-size:var(--text-sm);line-height:18px;font-weight:var(--weight-medium);color:#334155}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:var(--radius-lg);border:0;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:.02em;cursor:pointer;white-space:nowrap;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 200ms,border-color 200ms}
.btn:hover{text-decoration:none}
.btn:focus-visible,.opt:focus-visible,.pick:focus-visible,.ctl:focus-visible,.dot:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.ghost{background:transparent;color:#334155}.ghost:hover{background:#f1f5f9;color:#0f172a}
.line{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.line:hover{background:#f8fafc;border-color:#94a3b8}
.opt{display:flex;flex-direction:column;align-items:flex-start;gap:10px;padding:16px;border-radius:var(--radius-xl);border:1.5px solid #e2e8f0;background:#fff;font:inherit;text-align:left;cursor:pointer;transition:border-color 200ms,background-color 200ms,box-shadow 200ms}
.opt:hover{border-color:#94a3b8}
.opt.on{border-color:#003087;background:rgba(0,48,135,.04);box-shadow:0 0 0 3px rgba(0,48,135,.08)}
.pick{height:44px;padding:0 16px;border-radius:var(--radius-full);border:1.5px solid #e2e8f0;background:#fff;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:8px;transition:border-color 200ms,background-color 200ms,color 200ms}
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
.bar{flex-grow:1;height:3px;border-radius:var(--radius-full);background:rgba(255,255,255,.28);overflow:hidden}
.fill{height:3px;border-radius:var(--radius-full);background:#ffffff;width:0}
.fill.done{width:100%}
.fill.run-a{animation:fillA 6.5s linear forwards}.fill.run-b{animation:fillB 6.5s linear forwards}
@keyframes fillA{from{width:0}to{width:100%}}@keyframes fillB{from{width:0}to{width:100%}}
.paused .fill{animation-play-state:paused}
.ctl{width:44px;height:44px;border-radius:var(--radius-full);border:1px solid rgba(255,255,255,.35);background:rgba(1,33,105,.35);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background-color 200ms}
.ctl:hover{background:rgba(255,255,255,.18)}
.seg{flex-grow:1;height:6px;border-radius:var(--radius-full);background:#e9eef5;overflow:hidden}
.seg>div{height:6px;border-radius:var(--radius-full);background:#003087;transition:width 500ms cubic-bezier(.16,1,.3,1)}
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
.tap{position:absolute;top:90px;bottom:330px;width:50%;border:0;background:transparent;padding:0;cursor:pointer}
.tap:focus-visible{outline:3px solid rgba(255,255,255,.6);outline-offset:-6px}
.wbtn{background:#ffffff;color:#003087}.wbtn:hover{background:#e0f3fb;color:#003087}
/* phone: the story fills the screen, however tall the phone is */
@media (max-width:767px){.msu-hero{height:100dvh!important;min-height:640px}}
`;

// ---- markup ----

export default class MobileSignUpScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="MobileSignUp">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {v.s0 ? (<>
          <div className={(v.carCls || "") + " msu-hero"} role="region" aria-roledescription="carousel" aria-label="Merchant stories" style={{ position: "relative", width: "min(390px, 100%)", height: "844px", overflow: "hidden", background: "#012169" }}>
            {__list(v.slides).map((sl, $index) => (<React.Fragment key={$index}>
                <div className={sl?.cls} aria-hidden={sl?.hidden}>
                  <img src={sl?.img} alt={sl?.alt} />
                </div>
              </React.Fragment>))}
            <div style={{ position: "absolute", inset: "0", background: "linear-gradient(180deg, rgba(1,20,60,.7) 0%, rgba(1,20,60,0) 20%, rgba(1,20,60,0) 38%, rgba(1,20,60,.94) 72%, rgba(1,20,60,.98) 100%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", left: "16px", right: "16px", top: "14px", display: "flex", gap: "6px" }}>
              {__list(v.bars).map((br, $index) => (<React.Fragment key={$index}>
                  <div className="bar">
                    <div className={br?.cls} />
                  </div>
                </React.Fragment>))}
            </div>
            <div style={{ position: "absolute", left: "20px", right: "20px", top: "34px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <img src="/assets/820d4a69b45ed8fa40c9bc6015985c0e.png" alt="GridCommerce" style={{ height: "24px", width: "auto", display: "block" }} />
              <button type="button" className="ctl" aria-label={v.pauseLabel} onClick={v.togglePause} style={{ width: "36px", height: "36px" }}>
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
            </div>
            <button type="button" className="tap" style={{ left: "0" }} aria-label="Previous story" onClick={v.prev} />
            {" "}
            <button type="button" className="tap" style={{ right: "0" }} aria-label="Next story" onClick={v.nextSlide} />
            <div style={{ position: "absolute", left: "20px", right: "20px", bottom: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.16)", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center" }}>{v.cur?.tag}</span>
                <span style={{ height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "#ff9800", color: "#3b1d00", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center" }}>Sample story</span>
              </div>
              {__list(v.curList).map((q, $index) => (<React.Fragment key={$index}>
                  <div className={q?.cls} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <p style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "30px", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-tight)", color: "#ffffff", textWrap: "pretty" }}>“{q?.quote}”</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.16)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "var(--weight-medium)", fontSize: "var(--text-sm)" }}>{q?.initial}</div>
                      <div>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#fff" }}>{q?.who}</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,.78)" }}>{q?.where}</div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>))}
              <button type="button" className="btn wbtn" onClick={v.start} style={{ width: "100%", height: "52px", marginTop: "8px", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>Create my shop — free<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="m12 5 7 7-7 7" />
</svg></button>
              <__Link href="/mobile-sign-in" style={{ alignSelf: "center", color: "#ffffff", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", minHeight: "44px", display: "inline-flex", alignItems: "center" }}>I already have an account</__Link>
            </div>
          </div>
        </>) : null}
        {v.inApp ? (<>
          <div style={{ width: "min(390px, 100%)", height: "844px", background: "#ffffff", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {v.inFlow ? (<>
              <div style={{ flexShrink: "0", padding: "12px 16px 8px 8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <button type="button" className="ctl" aria-label="Back" onClick={v.back} style={{ border: "0", background: "transparent", color: "#0f172a" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <div style={{ flexGrow: "1" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {__list(v.segs).map((g, $index) => (<React.Fragment key={$index}>
                        <div className="seg" style={{ height: "5px" }}>
                          <div style={__sx(`width: ${g?.w ?? ""}; height: 5px;`)} />
                        </div>
                      </React.Fragment>))}
                  </div>
                  <div style={{ marginTop: "6px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Step {v.stepNo} of 5 · {v.stepName}</div>
                </div>
              </div>
            </>) : null}
            {v.s6 ? (<>
              <div style={{ flexShrink: "0", padding: "20px 20px 0" }}>
                <img src="/assets/ff462bc6abaa5d30500a126b259de9d6.png" alt="GridCommerce" style={{ height: "24px", width: "auto", display: "block" }} />
              </div>
            </>) : null}
            <div style={{ flexGrow: "1", overflow: "hidden", padding: "16px 20px" }}>
              {v.s1 ? (<>
                <div className={v.anim} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <h1 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Let’s set up your shop</h1>
                    <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", lineHeight: "22px", color: "#475569" }}>Two minutes. No card needed — start free.</p>
                  </div>
                  <button type="button" className="btn line" style={{ width: "100%", height: "52px" }}><span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087" }}>G</span>Continue with Google</button>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ flexGrow: "1", height: "1px", background: "#e2e8f0" }} />
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>or with mobile number</span>
                    <div style={{ flexGrow: "1", height: "1px", background: "#e2e8f0" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label className="lbl" htmlFor="m-name">Your name</label>
                    <input id="m-name" className="inp" type="text" autoComplete="name" placeholder="e.g. Nusrat Jahan" value={v.name} onChange={v.setName} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label className="lbl" htmlFor="m-phone">Mobile number</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "0", height: "48px", display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-medium)", color: "#334155", pointerEvents: "none" }}>+880<span style={{ width: "1px", height: "22px", background: "#cbd5e1" }} /></span>
                      <input id="m-phone" className="inp" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="1XXX-XXXXXX" value={v.phone} onChange={v.setPhone} style={{ paddingLeft: "78px", fontSize: "var(--text-base)" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label className="lbl" htmlFor="m-pw">Create a password</label>
                    <div style={{ position: "relative" }}>
                      <input id="m-pw" className="inp" type={v.pwType} autoComplete="new-password" placeholder="At least 8 characters" style={{ paddingRight: "52px", fontSize: "var(--text-base)" }} />
                      <button type="button" className="ctl" onClick={v.togglePw} aria-label={v.pwLabel} style={{ position: "absolute", right: "2px", top: "2px", border: "0", background: "transparent", color: "var(--text-muted)" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: "0", fontSize: "var(--text-xs)", lineHeight: "18px", color: "var(--text-muted)" }}>By continuing you agree to the <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.</p>
                </div>
              </>) : null}
              {v.s2 ? (<>
                <div className={v.anim} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <h1 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Check your SMS</h1>
                    <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", lineHeight: "22px", color: "#475569" }}>We sent a 6-digit code to <strong style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>+880 {v.phoneFmt}</strong>.</p>
                  </div>
                  <div className="gc-cols-6" style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "8px" }}>
                    {__list(v.boxes).map((b, $index) => (<React.Fragment key={$index}>
                        <div className="box" style={__sx(`height: 58px; border-radius: var(--radius-xl); border: 1.5px solid ${b?.border ?? ""}; box-shadow: ${b?.ring ?? ""}; display: flex; align-items: center; justify-content: center; font-size: var(--text-2xl); font-weight: var(--weight-semibold); color: #0f172a; background: #fff;`)}>
                          {b?.has ? (<>
                            <span className="digit">{b?.d}</span>
                          </>) : null}
                          {b?.caret ? (<>
                            <span className="caret" />
                          </>) : null}
                        </div>
                      </React.Fragment>))}
                    <input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength="6" aria-label="6-digit code" onInput={v.onCode} onFocus={v.cf} onBlur={v.cb} style={{ position: "absolute", inset: "0", width: "100%", height: "100%", opacity: "0", border: "0", fontSize: "var(--text-base)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "var(--text-sm)", color: "#475569" }}>
                    <span>Resend code in 0:24</span>
                    <div style={{ display: "flex", gap: "16px" }}>
                      <button type="button" onClick={v.back} style={{ border: "0", background: "none", padding: "0", minHeight: "44px", font: "inherit", color: "#003087", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Change number</button>
                      <button type="button" onClick={v.fillCode} style={{ border: "0", background: "none", padding: "0", minHeight: "44px", font: "inherit", color: "#003087", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Use demo code</button>
                    </div>
                  </div>
                </div>
              </>) : null}
              {v.s3 ? (<>
                <div className={v.anim} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <h1 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>What do you sell, {v.first}?</h1>
                    <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", lineHeight: "22px", color: "#475569" }}>We’ll set up the right categories and product fields.</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label className="lbl" htmlFor="m-biz">Business name</label>
                    <input id="m-biz" className="inp" type="text" placeholder="e.g. Nusrat’s Closet" value={v.biz} onChange={v.setBiz} style={{ fontSize: "var(--text-base)" }} />
                  </div>
                  <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
                    {__list(v.cats).map((c, $index) => (<React.Fragment key={$index}>
                        <button type="button" className={c?.cls} aria-pressed={c?.on} onClick={c?.pick} style={{ padding: "14px", gap: "8px", minHeight: "96px" }}>
                          <span style={__sx(`width: 36px; height: 36px; border-radius: var(--radius-lg); background: ${c?.tint ?? ""}; color: ${c?.fg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
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
                          <span style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{c?.label}</span>
                        </button>
                      </React.Fragment>))}
                  </div>
                </div>
              </>) : null}
              {v.s4 ? (<>
                <div className={v.anim} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                  <div>
                    <h1 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>How do you sell today?</h1>
                    <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", lineHeight: "22px", color: "#475569" }}>Pick all that fit.</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Where do customers find you?</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {__list(v.where).map((x, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={x?.cls} aria-pressed={x?.on} onClick={x?.pick}>{x?.label}</button>
                        </React.Fragment>))}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Orders in a month</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {__list(v.size).map((x, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={x?.cls} aria-pressed={x?.on} onClick={x?.pick}>{x?.label}</button>
                        </React.Fragment>))}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>How do customers pay?</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {__list(v.pay).map((x, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={x?.cls} aria-pressed={x?.on} onClick={x?.pick}>{x?.label}</button>
                        </React.Fragment>))}
                    </div>
                  </div>
                </div>
              </>) : null}
              {v.s5 ? (<>
                <div className={v.anim} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <h1 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Pick your shop link</h1>
                    <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", lineHeight: "22px", color: "#475569" }}>Customers order from here. Add your own domain later.</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label className="lbl" htmlFor="m-slug">Shop link</label>
                    <input id="m-slug" className="inp" type="text" value={v.slug} onChange={v.setSlug} style={{ fontSize: "var(--text-base)" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", color: "#047857", fontWeight: "var(--weight-medium)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span>Available</span>
                  </div>
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                    <div style={{ padding: "10px 14px", background: "#f1f5f9", borderBottom: "1px solid #e2e8f0", fontSize: "var(--text-xs)", color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.slug}.[your-platform-domain]</div>
                    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{v.bizOr}</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.catLabel}</span>
                      </div>
                      <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px" }}>
                        <div style={{ height: "60px", borderRadius: "var(--radius-lg)", background: "#e0f3fb" }} />
                        <div style={{ height: "60px", borderRadius: "var(--radius-lg)", background: "#e9eef5" }} />
                        <div style={{ height: "60px", borderRadius: "var(--radius-lg)", background: "#e0f3fb" }} />
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <span style={{ height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center" }}>Order now</span>
                        <span style={{ height: "24px", padding: "0 8px", borderRadius: "var(--radius-full)", background: "#f1f5f9", color: "#334155", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center" }}>{v.payLine}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>) : null}
              {v.s6 ? (<>
                <div className="step" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <svg width="72" height="72" viewBox="0 0 56 56" fill="none">
                    <circle className="ck-c" cx="28" cy="28" r="26" stroke="#10b981" strokeWidth="2" />
                    <path className="ck-m" d="M17 29l7 7 15-15" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="rise" style={{ animationDelay: "400ms" }}>
                    <h1 style={{ margin: "0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>{v.bizOr} is ready</h1>
                    <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", lineHeight: "22px", color: "#475569" }}>Start with these — picked from your answers.</p>
                  </div>
                  <div className="rise" style={{ display: "flex", flexDirection: "column", gap: "8px", animationDelay: "560ms" }}>
                    {__list(v.todo).map((t, $index) => (<React.Fragment key={$index}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)" }}>
                          <span style={{ width: "24px", height: "24px", borderRadius: "var(--radius-full)", border: "2px solid #cbd5e1", flexShrink: "0" }} />
                          <div style={{ flexGrow: "1" }}>
                            <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{t?.title}</div>
                            <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>{t?.sub}</div>
                          </div>
                        </div>
                      </React.Fragment>))}
                  </div>
                </div>
              </>) : null}
            </div>
            <div style={{ flexShrink: "0", padding: "12px 20px 24px", borderTop: "1px solid #eef2f6", display: "flex", gap: "10px" }}>
              {v.canSkip ? (<>
                <button type="button" className="btn ghost" onClick={v.next} style={{ height: "52px" }}>Skip</button>
              </>) : null}
              {v.inFlow ? (<>
                <button type="button" className="btn solid" onClick={v.next} style={{ flexGrow: "1", height: "52px", fontSize: "var(--text-base)" }}>{v.nextLabel}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="m12 5 7 7-7 7" />
</svg></button>
              </>) : null}
              {v.s6 ? (<>
                <__Link href="/merchant-overview" className="btn solid" style={{ flexGrow: "1", height: "56px", fontSize: "var(--text-base)" }}>Go to my dashboard<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="m12 5 7 7-7 7" />
</svg></__Link>
              </>) : null}
            </div>
          </div>
        </>) : null}
      </div>
    );
  }
}
