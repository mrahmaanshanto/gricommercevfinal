'use client';
// Generated from design/templates/merchant-signin/MerchantSignIn.dc.html by scripts/convert-design.mjs.
// Sign in / sign up · desktop
// Edit freely: this file is now the source for the screen.

import { SystemPicker } from '@/components/SystemPicker';
import { defaultSystem, enterSystem } from '@/lib/systems';
import { navigate } from '@/runtime/routes';
import { EditionTag } from '@/components/EditionCard';
import { currentEditionId, LOCKED } from '@/lib/edition';
import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { getLocale, setLocale } from '@/runtime/ui';

// ---- logic (from the design's <script type="text/x-dc">) ----

// what the brand panel promises follows the site's edition (src/lib/edition.js)
var EDITION_COPY = {
  'retail-wholesale': {
    en: { eyebrowSignin: 'SHOP, POS & STOCK PLATFORM', heroSubSignin: 'Run your shops in one place — counters, stock, customer dues and cash.', fStore: 'POS at every counter', fStoreSub: 'Sell fast, even offline.', fOrders: 'Customer dues', fOrdersSub: 'Invoices and payments due.', fPay: 'Stock in every branch', fPaySub: 'Transfers, counts and purchase.', fStats: 'Money and profit', fStatsSub: 'Cash, bank and dues, daily.' },
    bn: { eyebrowSignin: 'দোকান, POS ও Stock প্ল্যাটফর্ম', heroSubSignin: 'আপনার দোকান এক জায়গায় — Counter, Stock, Customer-এর বাকি আর Cash।', fStore: 'প্রতি Counter-এ POS', fStoreSub: 'দ্রুত বিক্রি, Internet ছাড়াও।', fOrders: 'Customer-এর বাকি', fOrdersSub: 'Invoice আর বাকি টাকা।', fPay: 'প্রতি Branch-এর Stock', fPaySub: 'Transfer, গণনা আর কেনা।', fStats: 'টাকা আর লাভ', fStatsSub: 'Cash, Bank আর Due, প্রতিদিন।' },
  },
  'retail-online': {
    en: { heroSubSignin: 'Your shops and online store on one stock — counters, invoices, orders and couriers.' },
    bn: { heroSubSignin: 'দোকান আর Online store এক Stock-এ — Counter, Invoice, Order আর Courier।' },
  },
  comms: {
    en: { eyebrowSignin: 'COMMUNICATION & CRM', heroSubSignin: 'Every chat, call and customer in one place — and a counter to sell from.', fStore: 'One inbox', fStoreSub: 'Facebook, Instagram, WhatsApp, more.', fOrders: 'Calls and AI calls', fOrdersSub: 'Never miss a customer.', fPay: 'Customers and leads', fPaySub: 'Follow-ups that don’t slip.', fStats: 'POS and automation', fStatsSub: 'Sell at the counter, automate the rest.' },
    bn: { eyebrowSignin: 'যোগাযোগ ও CRM', heroSubSignin: 'সব Chat, Call আর Customer এক জায়গায় — সাথে বিক্রির Counter।', fStore: 'এক Inbox', fStoreSub: 'Facebook, Instagram, WhatsApp আর আরও।', fOrders: 'Call আর AI call', fOrdersSub: 'কোনো Customer মিস হবে না।', fPay: 'Customer আর Lead', fPaySub: 'Follow-up আর ভুলবেন না।', fStats: 'POS আর Automation', fStatsSub: 'Counter-এ বিক্রি, বাকিটা Automation।' },
  },
};

var GC_COPY = {
  en: {
    langLabel: 'Language', welcome: 'Welcome back', welcomeSub: 'Sign in to manage your store, orders and payments.',
    google: 'Continue with Google', googleUp: 'Sign up with Google', or: 'or',
    tabEmail: 'Email', tabPhone: 'Phone',
    email: 'Email', emailPh: 'you@yourstore.com', password: 'Password', pwPh: 'Enter your password', pwNewPh: 'At least 8 characters',
    remember: 'Remember me', forgot: 'Forgot password?',
    mobile: 'Mobile number', phoneHelp: 'We’ll text you a 6-digit code.',
    codeLabel: 'Verification code', change: 'Change number', codeErr: 'Enter all 6 digits of the code.',
    resend: 'Resend code', resendIn: 'Resend code in 0:{s}', otpHint: 'Enter the 6-digit code sent to +880 {n}.',
    submitSignin: 'Sign in', signingIn: 'Signing in', sendCode: 'Send code', sending: 'Sending code', verify: 'Verify and sign in', verifying: 'Verifying',
    newHere: 'New to GridCommerce?', newHereSub: 'Start free and go live this week.', createAccount: 'Create an account',
    createTitle: 'Create your store', createSub: 'Start free, invite your team, and go live this week.',
    fullName: 'Full name', namePh: 'Your name', storeName: 'Store name', storePh: 'Your store',
    termsPre: 'I agree to the ', terms: 'Terms of Service', termsMid: ' and ', privacy: 'Privacy Policy', termsPost: '.',
    submitSignup: 'Create account', creating: 'Creating your store',
    haveAccount: 'Already have an account?', signIn: 'Sign in',
    doneSignin: 'You’re signed in', doneSigninText: 'Taking you to your GridCommerce console.',
    doneSignup: 'Your store is ready', doneSignupText: 'We sent a verification link to your email. Confirm it to go live.',
    startOver: 'Start over', showPw: 'Show password', hidePw: 'Hide password',
    strength0: '8+ characters', strength: ['Weak password', 'Fair password', 'Good password', 'Strong password'],
    eyebrowSignin: 'ALL IN ONE ECOMMERCE PLATFORM', heroSigninA: 'Build. Sell.', heroSigninB: 'Grow Together.',
    heroSubSignin: 'Everything you need to launch, manage and scale your online business — without limits.',
    eyebrowSignup: 'FREE TO START', heroSignupA: 'Storefront', heroSignupB: 'in a day.',
    heroSubSignup: 'Payments that fit here — bKash, Nagad, cards and cash on delivery, all in one console.',
    fStore: 'Storefront', fStoreSub: 'Launch your shop in a day.', fOrders: 'Orders & fulfilment', fOrdersSub: 'Every parcel in one queue.',
    fPay: 'Payments', fPaySub: 'bKash, Nagad, cards and COD.', fStats: 'Analytics', fStatsSub: 'Revenue by district, live.',
    selling: 'Already selling with us?', sellingSub: 'Pick up right where you left off.',
    mWelcome: 'Welcome back.', mWelcomeSub: 'Build. Sell. Grow Together.',
    errEmail: 'Enter a valid email address, like you@yourstore.com.', errPw: 'Enter your password.',
    errPhone: 'Enter a valid 10-digit mobile number, like 1712-345678.', errName: 'Enter your full name.', errStore: 'Enter your store name.',
    errPwShort: 'Use at least 8 characters.', errTerms: 'Agree to the terms to create your account.'
  },
  bn: {
    langLabel: 'ভাষা', welcome: 'আবার স্বাগতম', welcomeSub: 'আপনার স্টোর, অর্ডার ও পেমেন্ট ম্যানেজ করতে সাইন ইন করুন।',
    google: 'Google দিয়ে চালিয়ে যান', googleUp: 'Google দিয়ে সাইন আপ করুন', or: 'অথবা',
    tabEmail: 'ইমেইল', tabPhone: 'ফোন',
    email: 'ইমেইল', emailPh: 'you@yourstore.com', password: 'পাসওয়ার্ড', pwPh: 'আপনার পাসওয়ার্ড দিন', pwNewPh: 'কমপক্ষে ৮ অক্ষর',
    remember: 'মনে রাখুন', forgot: 'পাসওয়ার্ড ভুলে গেছেন?',
    mobile: 'মোবাইল নম্বর', phoneHelp: 'আপনার নম্বরে ৬ সংখ্যার একটি কোড পাঠানো হবে।',
    codeLabel: 'ভেরিফিকেশন কোড', change: 'নম্বর পরিবর্তন', codeErr: 'কোডের ৬টি সংখ্যাই দিন।',
    resend: 'আবার কোড পাঠান', resendIn: '{s} সেকেন্ড পর আবার কোড পাঠানো যাবে', otpHint: '+880 {n} নম্বরে পাঠানো ৬ সংখ্যার কোডটি দিন।',
    submitSignin: 'সাইন ইন', signingIn: 'সাইন ইন হচ্ছে', sendCode: 'কোড পাঠান', sending: 'কোড পাঠানো হচ্ছে', verify: 'যাচাই করে সাইন ইন', verifying: 'যাচাই হচ্ছে',
    newHere: 'GridCommerce-এ নতুন?', newHereSub: 'ফ্রিতে শুরু করে এই সপ্তাহেই লাইভে যান।', createAccount: 'অ্যাকাউন্ট খুলুন',
    createTitle: 'আপনার স্টোর তৈরি করুন', createSub: 'ফ্রিতে শুরু করুন, টিমকে যুক্ত করুন, আর এই সপ্তাহেই লাইভে যান।',
    fullName: 'পূর্ণ নাম', namePh: 'আপনার নাম', storeName: 'স্টোরের নাম', storePh: 'আপনার স্টোর',
    termsPre: 'আমি ', terms: 'সেবার শর্তাবলি', termsMid: ' ও ', privacy: 'গোপনীয়তা নীতি', termsPost: '-তে সম্মত।',
    submitSignup: 'অ্যাকাউন্ট খুলুন', creating: 'স্টোর তৈরি হচ্ছে',
    haveAccount: 'আগে থেকেই অ্যাকাউন্ট আছে?', signIn: 'সাইন ইন',
    doneSignin: 'সাইন ইন সম্পন্ন', doneSigninText: 'আপনাকে GridCommerce কনসোলে নিয়ে যাওয়া হচ্ছে।',
    doneSignup: 'আপনার স্টোর প্রস্তুত', doneSignupText: 'আপনার ইমেইলে একটি ভেরিফিকেশন লিংক পাঠানো হয়েছে। লাইভে যেতে সেটি নিশ্চিত করুন।',
    startOver: 'আবার শুরু করুন', showPw: 'পাসওয়ার্ড দেখান', hidePw: 'পাসওয়ার্ড লুকান',
    strength0: '৮+ অক্ষর', strength: ['দুর্বল পাসওয়ার্ড', 'মোটামুটি পাসওয়ার্ড', 'ভালো পাসওয়ার্ড', 'শক্তিশালী পাসওয়ার্ড'],
    eyebrowSignin: 'অল-ইন-ওয়ান ই-কমার্স প্ল্যাটফর্ম', heroSigninA: 'তৈরি করুন। বিক্রি করুন।', heroSigninB: 'একসাথে বড় হোন।',
    heroSubSignin: 'অনলাইন ব্যবসা চালু, পরিচালনা ও বড় করতে যা যা লাগে — সব এক জায়গায়, কোনো সীমা ছাড়াই।',
    eyebrowSignup: 'ফ্রিতে শুরু', heroSignupA: 'এক দিনেই', heroSignupB: 'স্টোরফ্রন্ট।',
    heroSubSignup: 'এখানকার মতো পেমেন্ট — বিকাশ, নগদ, কার্ড আর ক্যাশ অন ডেলিভারি, সব এক কনসোলে।',
    fStore: 'স্টোরফ্রন্ট', fStoreSub: 'এক দিনেই দোকান চালু করুন।', fOrders: 'অর্ডার ও ফুলফিলমেন্ট', fOrdersSub: 'সব পার্সেল এক তালিকায়।',
    fPay: 'পেমেন্ট', fPaySub: 'বিকাশ, নগদ, কার্ড ও COD।', fStats: 'অ্যানালিটিক্স', fStatsSub: 'জেলাভিত্তিক আয়, লাইভ।',
    selling: 'আমাদের সাথে আগে থেকেই বিক্রি করছেন?', sellingSub: 'যেখানে থেমেছিলেন, সেখান থেকেই শুরু করুন।',
    mWelcome: 'আবার স্বাগতম।', mWelcomeSub: 'তৈরি করুন। বিক্রি করুন। একসাথে বড় হোন।',
    errEmail: 'সঠিক ইমেইল দিন, যেমন you@yourstore.com।', errPw: 'আপনার পাসওয়ার্ড দিন।',
    errPhone: '১০ সংখ্যার সঠিক মোবাইল নম্বর দিন, যেমন 1712-345678।', errName: 'আপনার পূর্ণ নাম দিন।', errStore: 'স্টোরের নাম দিন।',
    errPwShort: 'কমপক্ষে ৮ অক্ষর ব্যবহার করুন।', errTerms: 'অ্যাকাউন্ট খুলতে শর্তাবলিতে সম্মতি দিন।'
  }
};
function __Err({ id, msg }) { return msg ? <p id={id} className="au-err" role="alert">{msg}</p> : null; }
var GC_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
var GC_PHONE_RE = /^1[3-9]\d{8}$/;
function gcBnDigits(v) { return String(v).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'.charAt(+d); }); }

class Component extends DCLogic {
  componentDidMount() {
    // Open in the language the merchant chose last time (saved by setLocale).
    var saved = getLocale();
    var cur = (this.state && this.state.lang) || this.props.startLang || 'en';
    if (saved === 'bn' && cur !== 'bn') this.setState({ lang: 'bn' });
    this.setState({ ed: currentEditionId(), system: defaultSystem() });
  }
  componentWillUnmount() { clearTimeout(this.timer); clearInterval(this.tick); }
  go(mode) {
    clearTimeout(this.timer); clearInterval(this.tick);
    this.setState({ mode: mode, status: 'idle', systemBusy: '', pw: '', showPw: false, phone: '', otpSent: false, code: '', codeError: false, resendIn: 0, errs: {} });
  }
  startCountdown() {
    var self = this;
    clearInterval(this.tick);
    this.setState({ resendIn: 30 });
    this.tick = setInterval(function () {
      var n = ((self.state && self.state.resendIn) || 0) - 1;
      self.setState({ resendIn: Math.max(0, n) });
      if (n <= 0) clearInterval(self.tick);
    }, 1000);
  }
  renderVals() {
    var s = this.state || {};
    var self = this;
    var lang = s.lang || this.props.startLang || 'en';
    var bn = lang === 'bn';
    var t = Object.assign({}, GC_COPY[bn ? 'bn' : 'en'], (EDITION_COPY[(this.state && this.state.ed) || (LOCKED ? currentEditionId() : '')] || {})[bn ? 'bn' : 'en'] || {});
    var mode = s.mode || 'signin';
    var method = s.method || 'email';
    var status = s.status || 'idle';
    var pw = s.pw || '';
    var showPw = !!s.showPw;
    var code = s.code || '';
    var otpSent = !!s.otpSent;
    var resendIn = s.resendIn || 0;
    var signup = mode === 'signup';
    var done = status === 'done';
    var phoneMode = !signup && method === 'phone';

    var score = 0;
    if (pw.length >= 8) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (pw.length > 0 && score === 0) score = 1;
    var colors = ['#ff5724', '#ff9800', '#0ea5e9', '#10b981'];
    var segs = [0, 1, 2, 3].map(function (i) { return { bg: i < score ? colors[score - 1] : '#e2e8f0' }; });

    var activeBox = Math.min(code.length, 5);
    var boxes = [0, 1, 2, 3, 4, 5].map(function (i) {
      var on = !!s.codeFocus && i === activeBox;
      var err = !!s.codeError && !code.charAt(i);
      return {
        digit: code.charAt(i), has: !!code.charAt(i), caret: on && !code.charAt(i),
        border: on ? '#003087' : (err ? '#e0582f' : (code.charAt(i) ? '#94a3b8' : '#cbd5e1')),
        ring: on ? '0 0 0 3px rgba(0, 48, 135, 0.12)' : 'none'
      };
    });

    var submitLabel = signup ? t.submitSignup : (phoneMode ? (otpSent ? t.verify : t.sendCode) : t.submitSignin);
    var loadingLabel = signup ? t.creating : (phoneMode ? (otpSent ? t.verifying : t.sending) : t.signingIn);
    var ph = s.phone || '';
    var phFmt = ph.length > 4 ? ph.slice(0, 4) + '-' + ph.slice(4) : ph;
    var nextSwap = s.swap === 'gc-swap-a' ? 'gc-swap-b' : 'gc-swap-a';
    var setLang = function (l) { if (l === lang) return; setLocale(l); self.setState({ lang: l, swap: nextSwap, errs: {} }); };
    var errs = s.errs || {};
    var clear = function (k) { return function () { if ((self.state && self.state.errs || {})[k]) { var n = Object.assign({}, self.state.errs); delete n[k]; self.setState({ errs: n }); } }; };
    var el = function (id) { return typeof document !== 'undefined' ? document.getElementById(id) : null; };
    var val = function (id) { var n = el(id); return n ? String(n.value || '') : ''; };

    return {
      t: t,
      err: errs,
      clr: { email: clear('email'), pw: clear('pw'), name: clear('name'), store: clear('store'), suEmail: clear('suEmail'), terms: clear('terms') },
      brandLine: signup ? (t.heroSignupA + ' ' + t.heroSignupB) : t.mWelcomeSub,
      langCode: lang,
      isEn: !bn, isBn: bn,
      langX: bn ? 'translateX(52px)' : 'translateX(0px)',
      enColor: bn ? '#475569' : '#003087', bnColor: bn ? '#003087' : '#475569',
      enColorD: bn ? '#ffffff' : '#003087', bnColorD: bn ? '#003087' : '#ffffff',
      toEn: function () { setLang('en'); }, toBn: function () { setLang('bn'); },
      swapCls: s.swap || '',
      track: bn ? '0em' : '-0.025em',
      heroTrack: bn ? '0em' : '-0.028em',
      eyebrowTrack: bn ? '0.04em' : '0.22em',

      panelSignin: !signup, panelSignup: signup,
      panelSigninColor: signup ? '#475569' : '#003087',
      panelSignupColor: signup ? '#003087' : '#475569',
      showSignin: !signup && !done,
      showSignup: signup && !done,
      isDone: done,
      doneTitle: signup ? t.doneSignup : t.doneSignin,
      doneText: signup ? t.doneSignupText : t.doneSigninText,

      isEmail: method === 'email', isPhone: method === 'phone',
      tabX: method === 'phone' ? 'translateX(100%)' : 'translateX(0%)',
      emailTabColor: method === 'phone' ? '#64748b' : '#003087',
      phoneTabColor: method === 'phone' ? '#003087' : '#64748b',
      toEmail: function () { clearInterval(self.tick); self.setState({ method: 'email', status: 'idle', otpSent: false, code: '', codeError: false, errs: {} }); },
      toPhone: function () { self.setState({ method: 'phone', status: 'idle', errs: {} }); },
      phoneEntry: method === 'phone' && !otpSent,
      codeEntry: method === 'phone' && otpSent,
      onPhone: function (e) { var v = e.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 10); e.target.value = v; clear('phone')(); self.setState({ phone: v }); },
      otpHint: t.otpHint.replace('{n}', phFmt || '1XXX-XXXXXX'),
      boxes: boxes,
      onCode: function (e) { var v = e.target.value.replace(/\D/g, '').slice(0, 6); e.target.value = v; self.setState({ code: v, codeError: false }); },
      codeFocus: function () { self.setState({ codeFocus: true }); },
      codeBlur: function () { self.setState({ codeFocus: false }); },
      codeError: !!s.codeError,
      changeNumber: function () { clearInterval(self.tick); self.setState({ otpSent: false, code: '', codeError: false, resendIn: 0 }); },
      canResend: otpSent && resendIn === 0,
      waitResend: resendIn > 0,
      resendLabel: t.resendIn.replace('{s}', bn ? gcBnDigits(resendIn) : (resendIn < 10 ? '0' + resendIn : resendIn)),
      resend: function () { self.setState({ code: '', codeError: false }); self.startCountdown(); },

      isLoading: status === 'loading',
      isIdle: status !== 'loading',
      submitLabel: submitLabel,
      loadingLabel: loadingLabel,
      showPw: showPw, hidePw: !showPw,
      pwType: showPw ? 'text' : 'password',
      eyeLabel: showPw ? t.hidePw : t.showPw,
      segs: segs,
      strengthLabel: pw.length === 0 ? t.strength0 : t.strength[score - 1],
      system: s.system || '', systemBusy: s.systemBusy || '',
      // demo: tapping a system signs in straight away (no email or password) and opens it (src/lib/systems.js)
      pickSystem: function (ed) {
        if (s.systemBusy || status !== 'idle') return;
        clearTimeout(self.timer);
        self.setState({ system: ed, systemBusy: ed });
        self.timer = setTimeout(function () {
          self.setState({ status: 'done' });
          self.timer = setTimeout(function () { enterSystem(ed, navigate); }, 600);
        }, 500);
      },
      toSignup: function () { self.go('signup'); },
      toSignin: function () { self.go('signin'); },
      reset: function () { self.go(mode); },
      togglePw: function () { self.setState({ showPw: !showPw }); },
      onPw: function (e) { clear('suPw')(); self.setState({ pw: e.target.value }); },
      submit: function (e) {
        if (e && e.preventDefault) e.preventDefault();
        if (status !== 'idle') return;
        // Validate before anything is sent: error under the field, focus on the first one that is wrong.
        var found = {}, order = [];
        var bad = function (k, id, msg) { found[k] = msg; order.push(id); };
        if (signup) {
          if (!val('su-name').trim()) bad('name', 'su-name', t.errName);
          if (!val('su-store').trim()) bad('store', 'su-store', t.errStore);
          if (!GC_EMAIL_RE.test(val('su-email').trim())) bad('suEmail', 'su-email', t.errEmail);
          if (val('su-pw').length < 8) bad('suPw', 'su-pw', t.errPwShort);
          var terms = el('su-terms');
          if (terms && !terms.checked) bad('terms', 'su-terms', t.errTerms);
        } else if (phoneMode) {
          if (!otpSent && !GC_PHONE_RE.test(ph)) bad('phone', 'si-phone', t.errPhone);
        } else {
          if (!GC_EMAIL_RE.test(val('si-email').trim())) bad('email', 'si-email', t.errEmail);
          if (!val('si-pw')) bad('pw', 'si-pw', t.errPw);
        }
        if (order.length) { self.setState({ errs: found }); var first = el(order[0]); if (first) first.focus(); return; }
        if (Object.keys(errs).length) self.setState({ errs: {} });
        clearTimeout(self.timer);
        if (phoneMode && !otpSent) {
          self.setState({ status: 'loading' });
          self.timer = setTimeout(function () { self.setState({ status: 'idle', otpSent: true, code: '', codeError: false }); self.startCountdown(); }, 900);
          return;
        }
        if (phoneMode && code.length < 6) { self.setState({ codeError: true }); var codeEl = el('si-code'); if (codeEl) codeEl.focus(); return; }
        self.setState({ status: 'loading' });
        self.timer = setTimeout(function () {
          clearInterval(self.tick); self.setState({ status: 'done' });
          // signed in: into the system chosen above (src/lib/systems.js)
          if (!signup) self.timer = setTimeout(function () { enterSystem((self.state && self.state.system) || defaultSystem(), navigate); }, 900);
        }, 1400);
      }
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:var(--font-sans);background:#f8fafc;color:#1e293b;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087;font-weight:var(--weight-medium);text-decoration:none}a:hover{color:#002a77;text-decoration:underline}
.gc-stripes{background-color:#012169;background-image:repeating-linear-gradient(115deg,rgba(255,255,255,.055) 0 1px,transparent 1px 46px);animation:gcDrift 60s linear infinite}
@keyframes gcDrift{from{background-position:0 0}to{background-position:507.55px 0}}
/* ---- auth layout: fluid, brand band on top below 1024px, two columns (about 40/60) from 1024px ---- */
.au-root{position:relative;display:grid;grid-template-columns:minmax(0,1fr);align-content:start;min-height:100vh;min-height:100dvh;background:#f8fafc;overflow-x:clip}
.au-lang{position:absolute;top:16px;right:16px;z-index:3}
.au-brand{order:-1;position:relative;display:flex;min-width:0;overflow:hidden;color:#fff}
/* only the decorative brand panel animates in; the form is visible from the first paint */
.au-brand__in{position:relative;flex:1 1 auto;min-width:0;min-height:120px;padding:18px 20px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;color:#fff;animation:auIn 280ms cubic-bezier(0,0,.2,1) both}
@keyframes auIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.au-brand__logo img{height:28px;width:auto;display:block}
.au-brand__line{margin:0;font-size:var(--text-lg);line-height:26px;font-weight:var(--weight-semibold);color:#fff}
.au-brand__body,.au-brand__foot,.au-rings{display:none}
.au-hero{font-size:clamp(34px,3.5vw,60px);color:#fff;overflow-wrap:anywhere}
.au-root:lang(bn) .au-hero{font-size:clamp(30px,3.1vw,52px)}
.au-feats{margin-top:clamp(28px,3vw,48px);display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:20px 24px}
.au-brand__foot{padding-top:28px;border-top:1px solid rgba(255,255,255,.14)}
.au-form{display:flex;justify-content:center;align-items:flex-start;min-width:0;padding:24px 20px 40px}
.au-card{width:100%;max-width:440px;min-width:0;display:flex;flex-direction:column}
.au-pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.au-err{margin:6px 0 0;font-size:var(--text-xs);line-height:16px;color:var(--text-danger)}
@media (max-width:479px){.au-pair{grid-template-columns:minmax(0,1fr);gap:16px}}
@media (min-width:1024px){
  .au-root{grid-template-columns:minmax(0,2fr) minmax(0,3fr);align-content:stretch}
  .au-lang{top:32px;right:48px}
  .au-brand{margin:16px 0 16px 16px;border-radius:var(--radius-xl);box-shadow:0 24px 60px -24px rgba(1,33,105,.45);min-height:calc(100vh - 32px);min-height:calc(100dvh - 32px)}
  .au-brand__in{padding:clamp(32px,3.6vw,56px);gap:32px}
  .au-brand__logo img{height:36px}
  .au-brand__line{display:none}
  .au-brand__body{display:flex;flex-direction:column}
  .au-brand__foot,.au-rings{display:block}
  .au-form{align-items:center;padding:96px 48px 48px}
  .au-card{max-width:400px}
}
.gc-fade{animation:gcFade 200ms ease-out both}
@keyframes gcFade{from{opacity:0}to{opacity:1}}
.gc-swap-a{animation:gcSwapA 200ms cubic-bezier(0,0,.2,1)}
.gc-swap-b{animation:gcSwapB 200ms cubic-bezier(0,0,.2,1)}
@keyframes gcSwapA{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes gcSwapB{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.gc-field{position:relative}
.gc-ico{position:absolute;left:14px;top:12px;color:var(--text-muted);pointer-events:none;transition:color 200ms cubic-bezier(0,0,.2,1)}
.gc-field:focus-within .gc-ico{color:#003087}
.gc-input{width:100%;height:44px;padding:0 14px 0 44px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-sm);color:#1e293b;transition:border-color 200ms cubic-bezier(0,0,.2,1)}
.gc-input::placeholder{color:var(--text-muted)}
.gc-input:hover{border-color:#94a3b8}
.gc-input:focus{outline:none;border-color:#003087;box-shadow:0 0 0 3px rgba(0,48,135,.16)}
.gc-input[aria-invalid="true"]{border-color:var(--text-danger)}
.gc-input[aria-invalid="true"]:focus{box-shadow:0 0 0 3px rgba(194,65,12,.18)}
.gc-btn{height:44px;border-radius:var(--radius-lg);border:0;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);cursor:pointer;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 200ms cubic-bezier(0,0,.2,1),border-color 200ms cubic-bezier(0,0,.2,1)}
.gc-btn:focus-visible,.gc-link:focus-visible,.gc-eye:focus-visible,.gc-tab:focus-visible,.gc-lang:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.gc-solid{background:#003087;color:#fff}.gc-solid:hover{background:#002a77}.gc-solid:active{background:#00235f}
.gc-outline{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.gc-outline:hover{background:#f1f5f9;border-color:#94a3b8}
.gc-pill{height:52px;padding:0 6px 0 24px;border-radius:var(--radius-full);border:1px solid rgba(255,255,255,.32);background:transparent;color:#fff;font-size:var(--text-sm-plus)}
.gc-pill:hover{background:rgba(255,255,255,.1)}
.gc-pill:focus-visible{outline:3px solid rgba(0,156,222,.5)}
.gc-link{background:none;border:0;padding:0;font:inherit;color:#003087;font-weight:var(--weight-medium);cursor:pointer}
.gc-link:hover{color:#002a77;text-decoration:underline}
.gc-eye{position:absolute;right:2px;top:2px;width:40px;height:36px;border:0;border-radius:var(--radius-full);background:transparent;color:var(--text-muted);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background-color 200ms,color 200ms}
.gc-eye:hover{background:rgba(203,213,225,.35);color:#1e293b}
.gc-tab{flex-grow:1;flex-basis:0;height:44px;border:0;background:transparent;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);cursor:pointer;transition:color 300ms ease-in-out}
.gc-tab:hover{color:#1e293b}
.gc-lang{position:relative;z-index:1;width:52px;height:36px;border:0;border-radius:var(--radius-full);background:transparent;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer;transition:color 300ms ease-in-out}
.gc-seg{transition:background-color 300ms ease-out}
.gc-box{transition:border-color 200ms cubic-bezier(0,0,.2,1),box-shadow 200ms cubic-bezier(0,0,.2,1)}
.gc-digit{animation:gcDigit 220ms cubic-bezier(0,0,.2,1)}
@keyframes gcDigit{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.gc-caret{width:2px;height:22px;background:#003087;animation:gcBlink 1s steps(1) infinite}
@keyframes gcBlink{50%{opacity:0}}
.gc-spin{animation:gcSpin 800ms linear infinite}
@keyframes gcSpin{to{transform:rotate(360deg)}}
.gc-check-circle{stroke-dasharray:164;stroke-dashoffset:164;animation:gcDraw 640ms cubic-bezier(0,0,.2,1) forwards}
.gc-check-mark{stroke-dasharray:40;stroke-dashoffset:40;animation:gcDraw 380ms 460ms cubic-bezier(0,0,.2,1) forwards}
@keyframes gcDraw{to{stroke-dashoffset:0}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-delay:0ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}.gc-stripes{animation:none!important}}
`;

// ---- markup ----

export default class MerchantSignInScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="MerchantSignIn">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div lang={v.langCode} className="au-root">
          <main className="au-form">
            <div className="au-lang">
              <div role="group" aria-label={v.t?.langLabel} style={{ position: "relative", display: "flex", padding: "3px", borderRadius: "var(--radius-full)", background: "#e9eef5" }}>
                <div style={__sx(`position: absolute; left: 3px; top: 3px; width: 52px; height: 36px; border-radius: var(--radius-full); background: #ffffff; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.14); transform: ${v.langX ?? ""}; transition: transform 300ms ease-in-out;`)} />
                <button type="button" className="gc-lang" lang="en" aria-pressed={v.isEn} onClick={v.toEn} style={__sx(`color: ${v.enColor ?? ""};`)}>EN</button>
                <button type="button" className="gc-lang" lang="bn" aria-pressed={v.isBn} onClick={v.toBn} style={__sx(`color: ${v.bnColor ?? ""}; font-family: var(--font-bn); font-size: var(--text-sm);`)}>বাং</button>
              </div>
            </div>
            <div className={`au-card ${v.swapCls}`}>
              {v.showSignin ? (<>
                <form noValidate onSubmit={v.submit} style={{ display: "flex", flexDirection: "column" }}>
                  <div>
                    <h1 style={__sx(`margin: 0; font-size: var(--text-3xl); line-height: 40px; font-weight: var(--weight-semibold); letter-spacing: ${v.track ?? ""}; color: #0f172a;`)}>{v.t?.welcome}</h1>
                  </div>
                  {/* the full site previews a system; an edition site already knows its system and offers one demo button (S2-12) */}
                  {v.system ? <SystemPicker busy={v.systemBusy} onPick={v.pickSystem} /> : null}
                  <button type="button" className="gc-btn gc-outline" style={{ marginTop: "28px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}><span style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>G</span>{v.t?.google}</button>
                  <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ flexGrow: "1", height: "1px", background: "#e2e8f0" }} />
                    <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)", letterSpacing: "var(--tracking-wide)" }}>{v.t?.or}</span>
                    <div style={{ flexGrow: "1", height: "1px", background: "#e2e8f0" }} />
                  </div>
                  <div style={{ marginTop: "16px", position: "relative", display: "flex", borderBottom: "1px solid #e2e8f0" }}>
                    <button type="button" className="gc-tab" aria-pressed={v.isEmail} onClick={v.toEmail} style={__sx(`color: ${v.emailTabColor ?? ""};`)}>{v.t?.tabEmail}</button>
                    <button type="button" className="gc-tab" aria-pressed={v.isPhone} onClick={v.toPhone} style={__sx(`color: ${v.phoneTabColor ?? ""};`)}>{v.t?.tabPhone}</button>
                    <div style={__sx(`position: absolute; left: 0; bottom: -1px; width: 50%; height: 2px; border-radius: 2px; background: #003087; transform: ${v.tabX ?? ""}; transition: transform 300ms ease-in-out;`)} />
                  </div>
                  {v.isEmail ? (<>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label htmlFor="si-email" style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#334155" }}>{v.t?.email}</label>
                        <div className="gc-field">
                          <svg className="gc-ico" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                          </svg>
                          {" "}
                          <input id="si-email" className="gc-input" type="email" placeholder={v.t?.emailPh} autoComplete="email" aria-required="true" aria-invalid={!!v.err?.email} aria-describedby={v.err?.email ? "si-email-err" : undefined} onInput={v.clr?.email} />
                          <__Err id="si-email-err" msg={v.err?.email} />
                        </div>
                      </div>
                      <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label htmlFor="si-pw" style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#334155" }}>{v.t?.password}</label>
                        <div className="gc-field">
                          <svg className="gc-ico" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          {" "}
                          <input id="si-pw" className="gc-input" type={v.pwType} placeholder={v.t?.pwPh} autoComplete="current-password" style={{ paddingRight: "48px" }} aria-required="true" aria-invalid={!!v.err?.pw} aria-describedby={v.err?.pw ? "si-pw-err" : undefined} onInput={v.clr?.pw} />
                          <__Err id="si-pw-err" msg={v.err?.pw} />
                          {" "}
                          <button type="button" className="gc-eye" aria-label={v.eyeLabel} aria-pressed={v.showPw} onClick={v.togglePw}>
                            {v.showPw ? (<>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                                <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                                <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                                <path d="m2 2 20 20" />
                              </svg>
                            </>) : null}
                            {v.hidePw ? (<>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </>) : null}
                          </button>
                        </div>
                      </div>
                      <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0 12px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "44px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569", cursor: "pointer" }}><input type="checkbox" style={{ width: "18px", height: "18px", margin: "0", accentColor: "#003087" }} />{v.t?.remember}</label>
                        <button type="button" className="gc-link" style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", minHeight: "44px" }}>{v.t?.forgot}</button>
                      </div>
                    </div>
                  </>) : null}
                  {v.phoneEntry ? (<>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label htmlFor="si-phone" style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#334155" }}>{v.t?.mobile}</label>
                        <div className="gc-field">
                          <span style={{ position: "absolute", left: "14px", top: "0", height: "44px", display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#334155", pointerEvents: "none" }}>+880<span style={{ width: "1px", height: "20px", background: "#cbd5e1" }} /></span>
                          {" "}
                          <input id="si-phone" className="gc-input" type="tel" inputMode="numeric" placeholder="1XXX-XXXXXX" autoComplete="tel-national" onInput={v.onPhone} style={{ paddingLeft: "74px" }} aria-required="true" aria-invalid={!!v.err?.phone} aria-describedby={v.err?.phone ? "si-phone-err" : undefined} />
                          <__Err id="si-phone-err" msg={v.err?.phone} />
                        </div>
                        <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>{v.t?.phoneHelp}</p>
                      </div>
                    </div>
                  </>) : null}
                  {v.codeEntry ? (<>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ marginTop: "16px", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px" }}>
                        <label htmlFor="si-code" style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#334155" }}>{v.t?.codeLabel}</label>
                        <button type="button" className="gc-link" onClick={v.changeNumber} style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px" }}>{v.t?.change}</button>
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>{v.otpHint}</p>
                      <div className="au-otp" style={{ position: "relative", marginTop: "12px", display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "8px" }}>
                        {__list(v.boxes).map((box, $index) => (<React.Fragment key={$index}>
                            <div className="gc-box" style={__sx(`height: 52px; border-radius: var(--radius-lg); background: #ffffff; border: 1px solid ${box?.border ?? ""}; box-shadow: ${box?.ring ?? ""}; display: flex; align-items: center; justify-content: center; font-size: var(--text-xl); line-height: 28px; font-weight: var(--weight-semibold); color: #0f172a;`)}>
                              {box?.has ? (<>
                                <span className="gc-digit">{box?.digit}</span>
                              </>) : null}
                              {box?.caret ? (<>
                                <span className="gc-caret" />
                              </>) : null}
                            </div>
                          </React.Fragment>))}
                        <input id="si-code" aria-invalid={v.codeError} aria-describedby={v.codeError ? "si-code-err" : undefined} type="text" inputMode="numeric" autoComplete="one-time-code" maxLength="6" autoFocus={true} onInput={v.onCode} onFocus={v.codeFocus} onBlur={v.codeBlur} style={{ position: "absolute", inset: "0", width: "100%", height: "100%", opacity: "0", border: "0", fontSize: "var(--text-base)", cursor: "text" }} />
                      </div>
                      {v.codeError ? (<>
                        <p id="si-code-err" role="alert" className="au-err">{v.t?.codeErr}</p>
                      </>) : null}
                      <div style={{ marginTop: "10px", display: "flex", alignItems: "center", minHeight: "24px" }}>
                        {v.canResend ? (<>
                          <button type="button" className="gc-link" onClick={v.resend} style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", minHeight: "32px" }}>{v.t?.resend}</button>
                        </>) : null}
                        {v.waitResend ? (<>
                          <span style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>{v.resendLabel}</span>
                        </>) : null}
                      </div>
                    </div>
                  </>) : null}
                  <button type="submit" className="gc-btn gc-solid" style={{ marginTop: "20px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    {v.isLoading ? (<>
                      <svg className="gc-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      <span>{v.loadingLabel}</span>
                    </>) : null}
                    {v.isIdle ? (<>
                      <span>{v.submitLabel}</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </>) : null}
                  </button>
                  <p style={{ margin: "28px 0 0", textAlign: "center", fontSize: "var(--text-sm)", lineHeight: "22px", color: "var(--text-muted)" }}>{v.t?.newHere} <__Link href="/merchant-onboarding" className="gc-link">{v.t?.createAccount}</__Link></p>
                </form>
              </>) : null}
              {v.showSignup ? (<>
                <form noValidate onSubmit={v.submit} style={{ display: "flex", flexDirection: "column" }}>
                  <div>
                    <h1 style={__sx(`margin: 0; font-size: var(--text-3xl); line-height: 40px; font-weight: var(--weight-semibold); letter-spacing: ${v.track ?? ""}; color: #0f172a;`)}>{v.t?.createTitle}</h1>
                    <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", lineHeight: "22px", color: "var(--text-muted)" }}>{v.t?.createSub}</p>
                  </div>
                  <button type="button" className="gc-btn gc-outline" style={{ marginTop: "24px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}><span style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }}>G</span>{v.t?.googleUp}</button>
                  <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ flexGrow: "1", height: "1px", background: "#e2e8f0" }} />
                    <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)", letterSpacing: "var(--tracking-wide)" }}>{v.t?.or}</span>
                    <div style={{ flexGrow: "1", height: "1px", background: "#e2e8f0" }} />
                  </div>
                  <div className="au-pair" style={{ marginTop: "16px" }}>
                    <div style={{ marginTop: "0px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label htmlFor="su-name" style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#334155" }}>{v.t?.fullName}</label>
                      <div className="gc-field">
                        <svg className="gc-ico" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        {" "}
                        <input id="su-name" className="gc-input" type="text" placeholder={v.t?.namePh} autoComplete="name" aria-required="true" aria-invalid={!!v.err?.name} aria-describedby={v.err?.name ? "su-name-err" : undefined} onInput={v.clr?.name} />
                          <__Err id="su-name-err" msg={v.err?.name} />
                      </div>
                    </div>
                    <div style={{ marginTop: "0px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label htmlFor="su-store" style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#334155" }}>{v.t?.storeName}</label>
                      <div className="gc-field">
                        <svg className="gc-ico" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                          <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                          <path d="M2 7h20" />
                        </svg>
                        {" "}
                        <input id="su-store" className="gc-input" type="text" placeholder={v.t?.storePh} autoComplete="organization" aria-required="true" aria-invalid={!!v.err?.store} aria-describedby={v.err?.store ? "su-store-err" : undefined} onInput={v.clr?.store} />
                          <__Err id="su-store-err" msg={v.err?.store} />
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label htmlFor="su-email" style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#334155" }}>{v.t?.email}</label>
                    <div className="gc-field">
                      <svg className="gc-ico" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      {" "}
                      <input id="su-email" className="gc-input" type="email" placeholder={v.t?.emailPh} autoComplete="email" aria-required="true" aria-invalid={!!v.err?.suEmail} aria-describedby={v.err?.suEmail ? "su-email-err" : undefined} onInput={v.clr?.suEmail} />
                          <__Err id="su-email-err" msg={v.err?.suEmail} />
                    </div>
                  </div>
                  <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label htmlFor="su-pw" style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", fontWeight: "var(--weight-medium)", color: "#334155" }}>{v.t?.password}</label>
                    <div className="gc-field">
                      <svg className="gc-ico" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      {" "}
                      <input id="su-pw" className="gc-input" type={v.pwType} placeholder={v.t?.pwNewPh} autoComplete="new-password" onInput={v.onPw} style={{ paddingRight: "48px" }} aria-required="true" aria-invalid={!!v.err?.suPw} aria-describedby={v.err?.suPw ? "su-pw-err" : undefined} />
                          <__Err id="su-pw-err" msg={v.err?.suPw} />
                      {" "}
                      <button type="button" className="gc-eye" aria-label={v.eyeLabel} aria-pressed={v.showPw} onClick={v.togglePw}>
                        {v.showPw ? (<>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                            <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                            <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                            <path d="m2 2 20 20" />
                          </svg>
                        </>) : null}
                        {v.hidePw ? (<>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </>) : null}
                      </button>
                    </div>
                    <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ flexGrow: "1", display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "6px" }}>
                        {__list(v.segs).map((seg, $index) => (<React.Fragment key={$index}>
                            <div className="gc-seg" style={__sx(`height: 4px; border-radius: var(--radius-full); background: ${seg?.bg ?? ""};`)} />
                          </React.Fragment>))}
                      </div>
                      <span style={{ minWidth: "88px", textAlign: "right", fontSize: "var(--text-xs)", lineHeight: "16px", fontWeight: "var(--weight-medium)", color: "#475569" }}>{v.strengthLabel}</span>
                    </div>
                  </div>
                  <label style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "10px", minHeight: "44px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569", cursor: "pointer" }}>
                    <input id="su-terms" type="checkbox" aria-required="true" aria-invalid={!!v.err?.terms} aria-describedby={v.err?.terms ? "su-terms-err" : undefined} onChange={v.clr?.terms} style={{ width: "18px", height: "18px", margin: "0", flexShrink: "0", accentColor: "#003087" }} />
                    <span>{v.t?.termsPre}<a href="#">{v.t?.terms}</a>{v.t?.termsMid}<a href="#">{v.t?.privacy}</a>{v.t?.termsPost}</span>
                  </label>
                  <__Err id="su-terms-err" msg={v.err?.terms} />
                  <button type="submit" className="gc-btn gc-solid" style={{ marginTop: "12px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    {v.isLoading ? (<>
                      <svg className="gc-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      <span>{v.loadingLabel}</span>
                    </>) : null}
                    {v.isIdle ? (<>
                      <span>{v.submitLabel}</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </>) : null}
                  </button>
                  <p style={{ margin: "24px 0 0", textAlign: "center", fontSize: "var(--text-sm)", lineHeight: "22px", color: "var(--text-muted)" }}>{v.t?.haveAccount} <button type="button" className="gc-link" onClick={v.toSignin}>{v.t?.signIn}</button></p>
                </form>
              </>) : null}
              {v.isDone ? (<>
                <div style={{ padding: "0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <svg width="96" height="96" viewBox="0 0 56 56" fill="none">
                    <circle className="gc-check-circle" cx="28" cy="28" r="26" stroke="#10b981" strokeWidth="2" />
                    <path className="gc-check-mark" d="M17 29l7 7 15-15" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div style={{ marginTop: "28px" }}>
                    <h2 style={__sx(`margin: 0; font-size: var(--text-3xl); line-height: 1.3; font-weight: var(--weight-semibold); letter-spacing: ${v.track ?? ""}; color: #0f172a;`)}>{v.doneTitle}</h2>
                    <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm)", lineHeight: "22px", color: "var(--text-muted)" }}>{v.doneText}</p>
                  </div>
                  <div style={{ marginTop: "32px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}>
                    <__Link href="/merchant-overview" className="gc-btn gc-solid" style={{ padding: "0 24px", textDecoration: "none" }}>Go to dashboard</__Link>
                    <button type="button" className="gc-btn gc-outline" style={{ padding: "0 24px" }} onClick={v.reset}>{v.t?.startOver}</button>
                  </div>
                </div>
              </>) : null}
            </div>
          </main>
          <aside className="gc-stripes au-brand" aria-label="GridCommerce">
            <svg className="au-rings" aria-hidden="true" width="560" height="560" viewBox="0 0 560 560" fill="none" style={{ position: "absolute", right: "-200px", bottom: "-220px", pointerEvents: "none" }}>
              <circle cx="280" cy="280" r="279" stroke="rgba(0,156,222,0.22)" />
              <circle cx="280" cy="280" r="200" stroke="rgba(0,156,222,0.16)" />
              <circle cx="280" cy="280" r="121" stroke="rgba(0,156,222,0.1)" />
            </svg>
            <div className="au-brand__in">
              <div className="au-brand__logo">
                <img src="/assets/820d4a69b45ed8fa40c9bc6015985c0e.png" alt="GridCommerce" />
              </div>
              <EditionTag dark />
              <p className="au-brand__line">{v.brandLine}</p>
              <div className={`au-brand__body ${v.swapCls}`}>
                {v.panelSignin ? (<>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={__sx(`font-size: var(--text-xs); line-height: 18px; font-weight: var(--weight-medium); letter-spacing: ${v.eyebrowTrack ?? ""}; color: #7fcff0;`)}>{v.t?.eyebrowSignin}</div>
                    <h2 className="au-hero" style={__sx(`margin: 20px 0 0; line-height: 1.1; font-weight: var(--weight-semibold); letter-spacing: ${v.heroTrack ?? ""};`)}>{v.t?.heroSigninA}<br /><span style={{ color: "#7fcff0" }}>{v.t?.heroSigninB}</span></h2>
                    <p style={{ margin: "20px 0 0", maxWidth: "480px", fontSize: "var(--text-base)", lineHeight: "26px", color: "rgba(255, 255, 255, 0.78)" }}>{v.t?.heroSubSignin}</p>
                  </div>
                </>) : null}
                {v.panelSignup ? (<>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={__sx(`font-size: var(--text-xs); line-height: 18px; font-weight: var(--weight-medium); letter-spacing: ${v.eyebrowTrack ?? ""}; color: #7fcff0;`)}>{v.t?.eyebrowSignup}</div>
                    <h2 className="au-hero" style={__sx(`margin: 20px 0 0; line-height: 1.1; font-weight: var(--weight-semibold); letter-spacing: ${v.heroTrack ?? ""};`)}>{v.t?.heroSignupA}<br /><span style={{ color: "#7fcff0" }}>{v.t?.heroSignupB}</span></h2>
                    <p style={{ margin: "20px 0 0", maxWidth: "480px", fontSize: "var(--text-base)", lineHeight: "26px", color: "rgba(255, 255, 255, 0.78)" }}>{v.t?.heroSubSignup}</p>
                  </div>
                </>) : null}
                <div className="au-feats">
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    <div style={{ width: "44px", height: "44px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "rgba(0, 156, 222, 0.16)", color: "#7fcff0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="8" cy="21" r="1" />
                        <circle cx="19" cy="21" r="1" />
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)" }}>{v.t?.fStore}</div>
                      <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "rgba(255, 255, 255, 0.72)" }}>{v.t?.fStoreSub}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    <div style={{ width: "44px", height: "44px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "rgba(0, 156, 222, 0.16)", color: "#7fcff0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
                        <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
                        <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)" }}>{v.t?.fOrders}</div>
                      <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "rgba(255, 255, 255, 0.72)" }}>{v.t?.fOrdersSub}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    <div style={{ width: "44px", height: "44px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "rgba(0, 156, 222, 0.16)", color: "#7fcff0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)" }}>{v.t?.fPay}</div>
                      <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "rgba(255, 255, 255, 0.72)" }}>{v.t?.fPaySub}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    <div style={{ width: "44px", height: "44px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "rgba(0, 156, 222, 0.16)", color: "#7fcff0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3v18h18" />
                        <path d="M18 17V9" />
                        <path d="M13 17V5" />
                        <path d="M8 17v-3" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)" }}>{v.t?.fStats}</div>
                      <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "rgba(255, 255, 255, 0.72)" }}>{v.t?.fStatsSub}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="au-brand__foot">
                <div className={v.swapCls}>
                  {v.panelSignin ? (<>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px 24px" }}>
                      <div>
                        <div style={{ fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)" }}>{v.t?.newHere}</div>
                        <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "rgba(255, 255, 255, 0.72)" }}>{v.t?.newHereSub}</div>
                      </div>
                    </div>
                  </>) : null}
                  {v.panelSignup ? (<>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px 24px" }}>
                      <div>
                        <div style={{ fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)" }}>{v.t?.selling}</div>
                        <div style={{ marginTop: "2px", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "rgba(255, 255, 255, 0.72)" }}>{v.t?.sellingSub}</div>
                      </div>
                      <button type="button" className="gc-btn gc-pill" onClick={v.toSignin} style={{ flexShrink: "0", display: "flex", alignItems: "center", gap: "14px" }}>{v.t?.signIn}<span style={{ width: "40px", height: "40px", borderRadius: "var(--radius-full)", background: "#009cde", display: "flex", alignItems: "center", justifyContent: "center" }}>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
</span></button>
                    </div>
                  </>) : null}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }
}
