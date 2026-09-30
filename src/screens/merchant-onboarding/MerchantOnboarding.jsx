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
var PHONE_RE = /^1[3-9]\d{8}$/;
function __Err({ id, msg }) { return msg ? <p id={id} className="err" role="alert">{msg}</p> : null; }
class Component extends DCLogic {
  componentDidMount() { this.startTimer(); }
  componentWillUnmount() { clearInterval(this.iv); }
  componentDidUpdate(prevProps, prevState) {
    // A new step replaces the form: move focus to its heading so keyboard and screen-reader users land on it.
    var was = (prevState && prevState.step) || 1, now = (this.state && this.state.step) || 1;
    if (was !== now && typeof document !== 'undefined') { var h = document.getElementById('ob-title'); if (h) h.focus(); }
  }
  startTimer() {
    var self = this; clearInterval(this.iv);
    this.iv = setInterval(function () { var s = self.state || {}; if (s.hover || s.paused) return; self.go((((s.slide || 0) + 1) % SLIDES.length), true); }, 6500);
  }
  go(i, auto) { var s = this.state || {}; this.setState({ slide: i, gen: (s.gen || 0) + 1 }); if (!auto) this.startTimer(); }
  renderVals() {
    var self = this, s = this.state || {};
    var step = s.step || 1, slide = s.slide || 0, gen = s.gen || 0;
    var name = s.name != null ? s.name : 'Nusrat Jahan', phone = s.phone != null ? s.phone : '1712345678', biz = s.biz != null ? s.biz : '';
    var pw = s.pw || '', errs = s.errs || {};
    var code = s.code || '', cat = s.cat || '', where = s.where || ['Facebook page'], size = s.size || '', pay = s.pay || ['Cash on delivery', 'bKash'];
    var set = function (p) { self.setState(p); };
    var toggleIn = function (arr, v) { var a = arr.slice(); var i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else a.push(v); return a; };
    var first = (name || 'there').split(' ')[0];
    var slug = s.slug != null ? s.slug : ((biz || first + ' shop').toLowerCase().replace(/[^a-z0-9]+/g, '') || 'myshop');
    var clear = function (k) { if (errs[k]) { var n = Object.assign({}, errs); delete n[k]; return n; } return errs; };
    var focusId = function (id) { if (typeof document === 'undefined') return; var n = document.getElementById(id); if (n) n.focus(); };
    var advance = function () { set({ step: step + 1, dir: 'fwd', errs: {} }); };
    var catObj = CATS.filter(function (c) { return c.k === cat; })[0];
    var todo = [{ title: 'Add your first product', sub: 'Snap a photo, set a price and stock. Scan the barcode if it has one.', time: '2 min' }];
    if (where.indexOf('Facebook page') >= 0 || where.indexOf('Instagram') >= 0) todo.push({ title: 'Connect your Facebook and Instagram', sub: 'Messages and comments become orders in one inbox.', time: '1 min' });
    if (pay.indexOf('Cash on delivery') >= 0) todo.push({ title: 'Set delivery charges and courier', sub: 'Inside Dhaka, outside Dhaka, and COD fee.', time: '2 min' });
    if (pay.indexOf('bKash') >= 0 || pay.indexOf('Nagad') >= 0) todo.push({ title: 'Connect bKash / Nagad payments', sub: 'Customers pay online, money comes to your account.', time: '3 min' });
    var active = Math.min(code.length, 5);
    return {
      s1: step === 1, s2: step === 2, s3: step === 3, s4: step === 4, s5: step === 5, s6: step === 6,
      inFlow: step <= 5, stepNo: step, stepName: NAMES[step - 1] || '', anim: !s.dir ? '' : (s.dir === 'back' ? 'stepb' : 'step'),
      steps: NAMES.map(function (nm, i) { var n = i + 1, done = n < step, cur = n === step; return { n: n, name: nm, done: done, todo: !done, cls: 'ob-step' + (done ? ' is-done' : '') + (cur ? ' is-cur' : ''), current: cur ? 'step' : undefined, sr: nm + (done ? ', done' : (cur ? ', current step' : '')) }; }),
      err: errs,
      canBack: step > 1, canSkip: step === 4,
      nextLabel: step === 5 ? 'Create my shop' : (step === 2 ? 'Verify' : 'Continue'),
      next: function (e) {
        if (e && e.preventDefault) e.preventDefault();
        if (step > 5) return;
        // Required fields for this step: error under the field, focus on the first one, and stay on the step.
        var found = {}, order = [];
        var bad = function (k, id, msg) { found[k] = msg; order.push(id); };
        if (step === 1) {
          if (!name.trim()) bad('name', 'su-name', 'Enter your name.');
          if (!PHONE_RE.test(phone)) bad('phone', 'su-phone', 'Enter a valid 10-digit mobile number, like 1712-345678.');
          if (pw.length < 8) bad('pw', 'su-pw', 'Use at least 8 characters.');
        }
        if (step === 2 && code.length < 6) bad('code', 'su-code', 'Enter all 6 digits of the code.');
        if (step === 3) {
          if (!biz.trim()) bad('biz', 'su-biz', 'Enter your business name.');
          if (!cat) bad('cat', 'ob-cat-0', 'Pick what you sell.');
        }
        if (step === 5 && slug.length < 3) bad('slug', 'su-slug', 'Use at least 3 letters or numbers for your shop link.');
        if (order.length) { set({ errs: found }); focusId(order[0]); return; }
        advance();
      },
      skip: advance,
      back: function () { set({ step: Math.max(1, step - 1), dir: 'back', errs: {} }); },
      name: name, setName: function (e) { set({ name: e.target.value, errs: clear('name') }); },
      phone: phone, setPhone: function (e) { set({ phone: e.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 10), errs: clear('phone') }); },
      pw: pw, setPw: function (e) { set({ pw: e.target.value, errs: clear('pw') }); }, pwShown: !!s.showPw,
      phoneFmt: phone.length > 4 ? phone.slice(0, 4) + '-' + phone.slice(4) : phone,
      pwType: s.showPw ? 'text' : 'password', pwLabel: s.showPw ? 'Hide password' : 'Show password', togglePw: function () { set({ showPw: !s.showPw }); },
      boxes: [0, 1, 2, 3, 4, 5].map(function (i) { var on = !!s.cfoc && i === active; var d = code.charAt(i); return { d: d, has: !!d, caret: on && !d, border: on ? '#003087' : (d ? '#94a3b8' : '#cbd5e1'), ring: on ? '0 0 0 3px rgba(0,48,135,.12)' : 'none' }; }),
      code: code, onCode: function (e) { var v = e.target.value.replace(/\D/g, '').slice(0, 6); set({ code: v, errs: clear('code') }); },
      cf: function () { set({ cfoc: true }); }, cb: function () { set({ cfoc: false }); },
      fillCode: function () { set({ code: '482913', errs: clear('code') }); },
      first: first, biz: biz, setBiz: function (e) { set({ biz: e.target.value, errs: clear('biz') }); },
      bizOr: biz || (first + '’s shop'),
      cats: CATS.map(function (c, i) { var on = c.k === cat; return { id: 'ob-cat-' + i, label: c.label, is_fashion: c.k === 'fashion', is_beauty: c.k === 'beauty', is_elec: c.k === 'elec', is_food: c.k === 'food', is_home: c.k === 'home', is_other: c.k === 'other', on: on, cls: on ? 'opt on' : 'opt', tint: on ? '#003087' : '#e0f3fb', fg: on ? '#ffffff' : '#0089c3',
        pick: function () { set({ cat: c.k, errs: clear('cat') }); self.go(c.slide); } }; }),
      where: WHERE.map(function (w) { var on = where.indexOf(w) >= 0; return { label: w, on: on, cls: on ? 'pick on' : 'pick', pick: function () { set({ where: toggleIn(where, w) }); } }; }),
      size: SIZE.map(function (w) { var on = w === size; return { label: w, on: on, cls: on ? 'pick on' : 'pick', pick: function () { set({ size: w }); } }; }),
      pay: PAY.map(function (w) { var on = pay.indexOf(w) >= 0; return { label: w, on: on, cls: on ? 'pick on' : 'pick', pick: function () { set({ pay: toggleIn(pay, w) }); } }; }),
      slug: slug, slugOk: slug.length >= 3, setSlug: function (e) { set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''), errs: clear('slug') }); },
      catLabel: catObj ? catObj.label : 'Your products', payLine: pay.length ? pay.slice(0, 2).join(' · ') : 'Payment options',
      todo: todo.slice(0, 3),
      slides: SLIDES.map(function (x, i) { return { img: x.img, hasImg: !!x.img, noImg: !x.img, alt: x.alt, n: i + 1, cls: i === slide ? 'slide on' : 'slide', hidden: i !== slide }; }),
      bars: SLIDES.map(function (x, i) { return { cls: i < slide ? 'fill done' : (i === slide ? (gen % 2 ? 'fill run-b' : 'fill run-a') : 'fill') }; }),
      cur: SLIDES[slide],
      curList: [0].map(function () { var x = SLIDES[slide]; return { quote: x.quote, who: x.who, where: x.where, initial: x.who.replace('[', '').charAt(0), cls: gen % 2 ? 'qtb' : 'qt' }; }),
      dots: SLIDES.map(function (x, i) { var on = i === slide; return { n: i + 1, on: on, current: on ? 'true' : undefined, pick: function () { self.go(i); } }; }),
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
.btn:focus-visible,.opt:focus-visible,.pick:focus-visible,.ctl:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.ghost{background:transparent;color:#334155}.ghost:hover{background:#f1f5f9;color:#0f172a}
.line{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.line:hover{background:#f8fafc;border-color:#94a3b8}
.opt{display:flex;flex-direction:column;align-items:flex-start;gap:10px;padding:16px;border-radius:var(--radius-xl);border:1.5px solid #e2e8f0;background:#fff;font:inherit;text-align:left;cursor:pointer;transition:border-color 200ms,background-color 200ms,box-shadow 200ms}
.opt:hover{border-color:#94a3b8}
.opt.on{border-color:#003087;background:rgba(0,48,135,.04);box-shadow:0 0 0 3px rgba(0,48,135,.08)}
.pick{height:44px;padding:0 16px;border-radius:var(--radius-full);border:1.5px solid #e2e8f0;background:#fff;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:8px;transition:border-color 200ms,background-color 200ms,color 200ms}
.pick:hover{border-color:#94a3b8}
.pick.on{border-color:#003087;background:#003087;color:#fff}
.step{animation:stIn 200ms cubic-bezier(.16,1,.3,1) both}
@keyframes stIn{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:none}}
.stepb{animation:stBack 200ms cubic-bezier(.16,1,.3,1) both}
@keyframes stBack{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:none}}
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
/* ---- auth layout: fluid, brand band on top below 1024px, two columns (about 40/60) from 1024px ---- */
.ob-root{display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);min-height:100vh;min-height:100dvh;background:#fff;overflow-x:clip}
.ob-band{display:flex;flex-direction:column;justify-content:space-between;gap:12px;min-height:120px;padding:18px 20px;color:#fff}
.ob-band img{height:28px;width:auto;display:block;align-self:flex-start}
.ob-band p{margin:0;font-size:var(--text-lg);line-height:26px;font-weight:var(--weight-semibold)}
.ob-car{display:none;position:relative;min-width:0;border-radius:var(--radius-xl);overflow:hidden;background:#012169}
.ob-quote{position:absolute;left:clamp(24px,2.8vw,40px);right:clamp(24px,2.8vw,40px);bottom:clamp(24px,2.8vw,40px);display:flex;flex-direction:column;gap:22px}
.ob-q{font-size:clamp(20px,2.1vw,30px);line-height:1.3}
.ob-main{display:flex;min-width:0;padding:20px 20px 24px}
.ob-col{width:100%;max-width:440px;min-width:0;margin:0 auto;display:flex;flex-direction:column}
.ob-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 16px}
.ob-logo{display:none;height:34px;width:auto}
.ob-progress{margin-top:24px}
.ob-form{flex:1 1 auto;display:flex;flex-direction:column;min-width:0}
.ob-body{flex:1 1 auto;display:flex;flex-direction:column;justify-content:flex-start;min-width:0;padding:28px 0}
.ob-h1{font-size:var(--text-2xl);line-height:1.3;overflow-wrap:anywhere}
.ob-h1:focus{outline:none}
.ob-nav{display:flex;flex-wrap:wrap;align-items:center;gap:12px}
.ob-next{flex:1 1 140px;min-width:140px}
.ob-otp{position:relative;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:clamp(6px,2vw,10px)}
.ob-cats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.ob-slug{display:flex;align-items:center;height:44px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;transition:border-color 200ms cubic-bezier(0,0,.2,1)}
.ob-slug:hover{border-color:#94a3b8}
.ob-slug:focus-within{border-color:#003087;box-shadow:0 0 0 3px rgba(0,48,135,.16)}
.ob-slug[data-invalid="true"]{border-color:var(--text-danger)}
.ob-slug input{flex:1 1 0;min-width:0;height:100%;padding:0 4px 0 14px;border:0;background:transparent;font:inherit;font-size:var(--text-sm);color:#1e293b}
.ob-slug input:focus{outline:none}
.ob-slug span{flex:none;padding-right:14px;font-size:var(--text-sm);color:var(--text-muted);white-space:nowrap}
@media (min-width:480px){.ob-cats{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (min-width:1024px){
  .ob-root{grid-template-columns:minmax(0,2fr) minmax(0,3fr);grid-template-rows:minmax(0,1fr)}
  .ob-band{display:none}
  .ob-car{display:block;position:sticky;top:16px;align-self:start;margin:16px 0 16px 16px;height:calc(100vh - 32px);height:calc(100dvh - 32px);min-height:560px}
  .ob-main{padding:36px 48px 32px}
  .ob-col{max-width:480px}
  .ob-logo{display:block}
  .ob-progress{margin-top:44px}
  .ob-body{justify-content:center}
  .ob-h1{font-size:var(--text-3xl);line-height:42px}
  .ob-next{flex:0 0 auto;min-width:180px}
}
/* numbered stepper (28px markers) and numbered story buttons (28px targets) */
.ob-stepper{list-style:none;margin:0;padding:0;display:flex;align-items:center;gap:8px}
.ob-step{display:flex;align-items:center;gap:8px;flex:1 1 0;min-width:0}
.ob-step:last-child{flex:0 0 auto}
.ob-step::after{content:"";flex:1 1 auto;height:2px;border-radius:var(--radius-full);background:#e2e8f0}
.ob-step:last-child::after{display:none}
.ob-step.is-done::after{background:#003087}
.ob-step__n{flex:none;width:28px;height:28px;border-radius:var(--radius-full);display:grid;place-items:center;border:1.5px solid #cbd5e1;background:#fff;color:var(--text-muted);font-family:var(--font-data);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.ob-step.is-done .ob-step__n{background:#003087;border-color:#003087;color:#fff}
.ob-step.is-cur .ob-step__n{border-color:#003087;color:#003087;box-shadow:0 0 0 3px rgba(0,48,135,.12)}
.sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0}
.dot{min-width:28px;height:28px;padding:0 6px;border-radius:var(--radius-full);border:1px solid rgba(255,255,255,.45);background:rgba(1,33,105,.35);color:#fff;font:inherit;font-family:var(--font-data);font-size:var(--text-xs);font-weight:var(--weight-medium);cursor:pointer;transition:background-color 200ms,color 200ms}
.dot:hover{background:rgba(255,255,255,.18)}
.dot[aria-current="true"]{background:#fff;border-color:#fff;color:#012169}
.dot:focus-visible,.ob-car .ctl:focus-visible{outline:3px solid rgba(255,255,255,.85);outline-offset:2px}
.eye{position:absolute;right:4px;top:4px;width:36px;height:36px;border:0;border-radius:var(--radius-full);background:transparent;color:var(--text-muted);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background-color 200ms,color 200ms}
.eye:hover{background:rgba(203,213,225,.35);color:#1e293b}
.eye[aria-pressed="true"]{color:#003087}
.lnk{min-height:24px;border:0;background:none;padding:0;font:inherit;color:#003087;font-weight:var(--weight-medium);cursor:pointer}
.lnk:hover{color:#002a77;text-decoration:underline}
.eye:focus-visible,.lnk:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.rel{position:relative}
.rel>.err{margin-top:6px}
.err{margin:0;font-size:var(--text-xs);line-height:16px;color:var(--text-danger)}
.req{color:var(--text-danger)}
.inp[aria-invalid="true"]{border-color:var(--text-danger)}
.inp:focus{box-shadow:0 0 0 3px rgba(0,48,135,.16)}
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
        <div className="ob-root">
          <div className="ob-band stripes">
            <img src="/assets/820d4a69b45ed8fa40c9bc6015985c0e.png" alt="GridCommerce" />
            <p>Set up your shop in two minutes.</p>
          </div>
          <div role="region" aria-roledescription="carousel" aria-label="Merchant stories" onMouseEnter={v.hoverOn} onMouseLeave={v.hoverOff} className={`ob-car ${v.carCls}`}>
            {__list(v.slides).map((sl, $index) => (<React.Fragment key={$index}>
                <div className={sl?.cls} aria-hidden={sl?.hidden}>
                  {sl?.hasImg ? (<>
                    <img src={sl?.img} alt={sl?.alt} />
                  </>) : null}
                  {sl?.noImg ? (<>
                    <div className="stripes" style={{ position: "absolute", inset: "0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", color: "rgba(255,255,255,.7)", fontSize: "var(--text-xs-plus)" }}>
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
            <div style={{ position: "absolute", left: "32px", right: "32px", top: "52px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ minHeight: "24px", padding: "2px 8px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.16)", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center", gap: "6px", backdropFilter: "blur(8px)" }}>{v.cur?.tag}</span>
              <span style={{ minHeight: "24px", padding: "2px 8px", borderRadius: "var(--radius-full)", background: "#ff9800", color: "#3b1d00", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center" }}>Sample story — replace with a real merchant</span>
            </div>
            <div className="ob-quote">
              {__list(v.curList).map((q, $index) => (<React.Fragment key={$index}>
                  <div className={q?.cls} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                    <svg width="36" height="28" viewBox="0 0 36 28" fill="#009cde" aria-hidden="true">
                      <path d="M0 28V16.6C0 7.4 5 1.8 14.2 0l1.6 3.6C10.6 5 8 8.2 7.6 12.6H14V28H0Zm20 0V16.6C20 7.4 25 1.8 34.2 0l1.6 3.6C30.6 5 28 8.2 27.6 12.6H34V28H20Z" />
                    </svg>
                    <p className="ob-q" style={{ margin: "0", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-tight)", color: "#ffffff", textWrap: "pretty" }}>{q?.quote}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.16)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "var(--weight-medium)" }}>{q?.initial}</div>
                      <div>
                        <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#fff" }}>{q?.who}</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "rgba(255,255,255,.78)" }}>{q?.where}</div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>))}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", paddingTop: "18px", borderTop: "1px solid rgba(255,255,255,.18)" }}>
                <div role="group" aria-label="Choose a story" style={{ display: "flex", gap: "8px" }}>
                  {__list(v.dots).map((d, $index) => (<React.Fragment key={$index}>
                      <button type="button" className="dot" aria-label={`Show story ${d?.n ?? ""} of 5`} aria-current={d?.current} onClick={d?.pick}>{d?.n}</button>
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
          <main className="ob-main">
            <div className="ob-col">
            <div className="ob-head">
              <img className="ob-logo" src="/assets/ff462bc6abaa5d30500a126b259de9d6.png" alt="GridCommerce" />
              <span style={{ marginLeft: "auto", fontSize: "var(--text-sm)", color: "#475569" }}>Have an account? <__Link href="/merchant-sign-in">Sign in</__Link></span>
            </div>
            {v.inFlow ? (<>
              <div className="ob-progress">
                <ol className="ob-stepper" aria-label="Sign-up steps">
                  {__list(v.steps).map((st, $index) => (<li key={$index} className={st?.cls} aria-current={st?.current}>
                      <span className="ob-step__n" aria-hidden="true">
                        {st?.done ? (<__Icon name="check" width="14" height="14" />) : null}
                        {st?.todo ? st?.n : null}
                      </span>
                      <span className="sr">Step {st?.n}: {st?.sr}</span>
                    </li>))}
                </ol>
                <div style={{ marginTop: "10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Step {v.stepNo} of 5 · {v.stepName}</div>
              </div>
            </>) : null}
            <form className="ob-form" noValidate onSubmit={v.next}>
            <div className="ob-body">
              {v.s1 ? (<>
                <div className={v.anim} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                  <div>
                    <h1 id="ob-title" tabIndex={-1} className="ob-h1" style={{ margin: "0", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Let’s set up your shop</h1>
                    <p style={{ margin: "10px 0 0", fontSize: "var(--text-sm-plus)", lineHeight: "24px", color: "#475569" }}>Two minutes, a few taps. No card needed — start free.</p>
                  </div>
                  <button type="button" className="btn line" style={{ width: "100%" }}><span style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#003087" }}>G</span>Continue with Google</button>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ flexGrow: "1", height: "1px", background: "#e2e8f0" }} />
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>or with your mobile number</span>
                    <div style={{ flexGrow: "1", height: "1px", background: "#e2e8f0" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label className="lbl" htmlFor="su-name">Your name <span className="req" aria-hidden="true">*</span></label>
                    <input id="su-name" className="inp" type="text" autoComplete="name" placeholder="e.g. Nusrat Jahan" value={v.name} onChange={v.setName} aria-required="true" aria-invalid={!!v.err?.name} aria-describedby={v.err?.name ? "su-name-err" : undefined} />
                    <__Err id="su-name-err" msg={v.err?.name} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label className="lbl" htmlFor="su-phone">Mobile number <span className="req" aria-hidden="true">*</span></label>
                    <div className="rel">
                      <span style={{ position: "absolute", left: "14px", top: "0", height: "44px", display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#334155", pointerEvents: "none" }}>+880<span style={{ width: "1px", height: "22px", background: "#cbd5e1" }} /></span>
                      <input id="su-phone" className="inp" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="1XXX-XXXXXX" value={v.phone} onChange={v.setPhone} aria-required="true" aria-invalid={!!v.err?.phone} aria-describedby={v.err?.phone ? "su-phone-err" : undefined} style={{ paddingLeft: "78px" }} />
                      <__Err id="su-phone-err" msg={v.err?.phone} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label className="lbl" htmlFor="su-pw">Create a password <span className="req" aria-hidden="true">*</span></label>
                    <div className="rel">
                      <input id="su-pw" className="inp" type={v.pwType} autoComplete="new-password" placeholder="At least 8 characters" value={v.pw} onChange={v.setPw} aria-required="true" aria-invalid={!!v.err?.pw} aria-describedby={v.err?.pw ? "su-pw-err" : undefined} style={{ paddingRight: "48px" }} />
                      <__Err id="su-pw-err" msg={v.err?.pw} />
                      <button type="button" className="eye" onClick={v.togglePw} aria-label={v.pwLabel} aria-pressed={v.pwShown}>
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
                <div className={v.anim} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                  <div>
                    <h1 id="ob-title" tabIndex={-1} className="ob-h1" style={{ margin: "0", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Check your phone</h1>
                    <p style={{ margin: "10px 0 0", fontSize: "var(--text-sm-plus)", lineHeight: "24px", color: "#475569" }}>We sent a 6-digit code by SMS to <strong style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>+880 {v.phoneFmt}</strong>. <button type="button" className="lnk" onClick={v.back}>Change number</button></p>
                  </div>
                  <div className="ob-otp">
                    {__list(v.boxes).map((b, $index) => (<React.Fragment key={$index}>
                        <div className="box" style={__sx(`height: 64px; border-radius: var(--radius-xl); border: 1.5px solid ${b?.border ?? ""}; box-shadow: ${b?.ring ?? ""}; display: flex; align-items: center; justify-content: center; font-size: var(--text-2xl); font-weight: var(--weight-semibold); color: #0f172a; background: #fff;`)}>
                          {b?.has ? (<>
                            <span className="digit">{b?.d}</span>
                          </>) : null}
                          {b?.caret ? (<>
                            <span className="caret" />
                          </>) : null}
                        </div>
                      </React.Fragment>))}
                    <input id="su-code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength="6" aria-label="6-digit code" aria-required="true" aria-invalid={!!v.err?.code} aria-describedby={v.err?.code ? "su-code-err" : undefined} value={v.code} onChange={v.onCode} onFocus={v.cf} onBlur={v.cb} style={{ position: "absolute", inset: "0", width: "100%", height: "100%", opacity: "0", border: "0", fontSize: "var(--text-base)", cursor: "text" }} />
                  </div>
                  <__Err id="su-code-err" msg={v.err?.code} />
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "4px 12px", fontSize: "var(--text-sm)", color: "#475569" }}>
                    <span>Didn’t get it? You can resend in 0:24.</span>
                    <button type="button" className="lnk" onClick={v.fillCode}>Use demo code</button>
                  </div>
                </div>
              </>) : null}
              {v.s3 ? (<>
                <div className={v.anim} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                  <div>
                    <h1 id="ob-title" tabIndex={-1} className="ob-h1" style={{ margin: "0", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Welcome, {v.first}. What do you sell?</h1>
                    <p style={{ margin: "10px 0 0", fontSize: "var(--text-sm-plus)", lineHeight: "24px", color: "#475569" }}>We’ll set up your shop with the right categories, product fields and sample pages.</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label className="lbl" htmlFor="su-biz">Business name <span className="req" aria-hidden="true">*</span></label>
                    <input id="su-biz" className="inp" type="text" autoComplete="organization" placeholder="e.g. Nusrat’s Closet" value={v.biz} onChange={v.setBiz} aria-required="true" aria-invalid={!!v.err?.biz} aria-describedby={v.err?.biz ? "su-biz-err" : undefined} />
                    <__Err id="su-biz-err" msg={v.err?.biz} />
                  </div>
                  <div className="ob-cats" role="group" aria-label="What you sell (required)" aria-describedby={v.err?.cat ? "ob-cat-err" : undefined}>
                    {__list(v.cats).map((c, $index) => (<React.Fragment key={$index}>
                        <button type="button" id={c?.id} className={c?.cls} aria-pressed={c?.on} onClick={c?.pick}>
                          <span style={__sx(`width: 40px; height: 40px; border-radius: var(--radius-lg); background: ${c?.tint ?? ""}; color: ${c?.fg ?? ""}; display: flex; align-items: center; justify-content: center;`)}>
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
                  <__Err id="ob-cat-err" msg={v.err?.cat} />
                </div>
              </>) : null}
              {v.s4 ? (<>
                <div className={v.anim} style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
                  <div>
                    <h1 id="ob-title" tabIndex={-1} className="ob-h1" style={{ margin: "0", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>How do you sell today?</h1>
                    <p style={{ margin: "10px 0 0", fontSize: "var(--text-sm-plus)", lineHeight: "24px", color: "#475569" }}>Pick all that fit. We’ll connect these first.</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span className="lbl" id="ob-g0" style={{ fontSize: "var(--text-sm)", color: "#0f172a", fontWeight: "var(--weight-medium)" }}>Where do customers find you?</span>
                    <div role="group" aria-labelledby="ob-g0" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {__list(v.where).map((x, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={x?.cls} aria-pressed={x?.on} onClick={x?.pick}>{x?.label}</button>
                        </React.Fragment>))}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span className="lbl" id="ob-g1" style={{ fontSize: "var(--text-sm)", color: "#0f172a", fontWeight: "var(--weight-medium)" }}>Orders in a month</span>
                    <div role="group" aria-labelledby="ob-g1" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {__list(v.size).map((x, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={x?.cls} aria-pressed={x?.on} onClick={x?.pick}>{x?.label}</button>
                        </React.Fragment>))}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span className="lbl" id="ob-g2" style={{ fontSize: "var(--text-sm)", color: "#0f172a", fontWeight: "var(--weight-medium)" }}>How do customers pay?</span>
                    <div role="group" aria-labelledby="ob-g2" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
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
                    <h1 id="ob-title" tabIndex={-1} className="ob-h1" style={{ margin: "0", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>Pick your shop link</h1>
                    <p style={{ margin: "10px 0 0", fontSize: "var(--text-sm-plus)", lineHeight: "24px", color: "#475569" }}>This is where customers will order from. You can connect your own domain later.</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label className="lbl" htmlFor="su-slug">Shop link <span className="req" aria-hidden="true">*</span></label>
                    <div className="ob-slug" data-invalid={v.err?.slug ? "true" : undefined}>
                      <input id="su-slug" type="text" autoCapitalize="none" spellCheck={false} value={v.slug} onChange={v.setSlug} aria-required="true" aria-invalid={!!v.err?.slug} aria-describedby={v.err?.slug ? "su-slug-err" : undefined} />
                      <span>.[your-platform-domain]</span>
                    </div>
                    <__Err id="su-slug-err" msg={v.err?.slug} />
                  </div>
                  {v.slugOk ? (
                  <div role="status" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", color: "var(--text-success)", fontWeight: "var(--weight-medium)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span>{v.slug}.[your-platform-domain] is available</span>
                  </div>
                  ) : null}
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "0 12px 30px -18px rgba(1,33,105,.35)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "var(--radius-full)", background: "#cbd5e1" }} />
                      <span style={{ width: "10px", height: "10px", borderRadius: "var(--radius-full)", background: "#cbd5e1" }} />
                      <span style={{ width: "10px", height: "10px", borderRadius: "var(--radius-full)", background: "#cbd5e1" }} />
                      <span style={{ marginLeft: "8px", flexGrow: "1", minWidth: "0", height: "24px", borderRadius: "var(--radius-full)", background: "#fff", display: "flex", alignItems: "center", padding: "0 10px", fontSize: "var(--text-xs)", color: "#475569" }}>
                        <span style={{ marginLeft: "6px", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.slug}.[your-platform-domain]</span>
                      </span>
                    </div>
                    <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "4px 12px" }}>
                        <span style={{ minWidth: "0", overflowWrap: "anywhere", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{v.bizOr}</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.catLabel}</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px" }}>
                        <div style={{ height: "70px", borderRadius: "var(--radius-lg)", background: "#e0f3fb" }} />
                        <div style={{ height: "70px", borderRadius: "var(--radius-lg)", background: "#e9eef5" }} />
                        <div style={{ height: "70px", borderRadius: "var(--radius-lg)", background: "#e0f3fb" }} />
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        <span style={{ height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center" }}>Order now</span>
                        <span style={{ height: "24px", padding: "0 10px", borderRadius: "var(--radius-full)", background: "#f1f5f9", color: "#334155", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", display: "inline-flex", alignItems: "center" }}>{v.payLine}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>) : null}
              {v.s6 ? (<>
                <div className="step" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                  <svg width="88" height="88" viewBox="0 0 56 56" fill="none" aria-hidden="true">
                    <circle className="ck-c" cx="28" cy="28" r="26" stroke="#10b981" strokeWidth="2" />
                    <path className="ck-m" d="M17 29l7 7 15-15" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <h1 id="ob-title" tabIndex={-1} className="ob-h1" style={{ margin: "0", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#0f172a" }}>{v.bizOr} is ready</h1>
                    <p style={{ margin: "10px 0 0", fontSize: "var(--text-sm-plus)", lineHeight: "24px", color: "#475569" }}>Here’s what to do first. We picked these from your answers.</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {__list(v.todo).map((t, $index) => (<React.Fragment key={$index}>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)" }}>
                          <span style={{ width: "28px", height: "28px", borderRadius: "var(--radius-full)", border: "2px solid #cbd5e1", flexShrink: "0" }} />
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{t?.title}</div>
                            <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>{t?.sub}</div>
                          </div>
                          <span style={{ flexShrink: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{t?.time}</span>
                        </div>
                      </React.Fragment>))}
                  </div>
                  <__Link href="/merchant-overview" className="btn solid" style={{ width: "100%" }}>Go to my dashboard<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="m12 5 7 7-7 7" />
</svg></__Link>
                </div>
              </>) : null}
            </div>
            {v.inFlow ? (<>
              <div className="ob-nav">
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
                  <button type="button" className="btn ghost" onClick={v.skip}>Skip for now</button>
                </>) : null}
                <button type="submit" className="btn solid ob-next">{v.nextLabel}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="m12 5 7 7-7 7" />
</svg></button>
              </div>
            </>) : null}
            </form>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
