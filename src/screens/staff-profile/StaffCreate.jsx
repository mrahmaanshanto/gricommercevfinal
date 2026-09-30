'use client';
// Generated from design/templates/staff-profile/StaffCreate.dc.html by scripts/convert-design.mjs.
// Add staff form
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  state = { step: 0, invite: 'sms', drafted: false, done: false, segs: { nameLang: 'en', employment: 'full', login: 'phone', twoFactor: 'on', checkIn: 'pin', payMethod: 'bkash', carry: 'yes' } };
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 200); setTimeout(go, 700); setTimeout(go, 2000);
  }
  seg(key, opts) {
    return opts.map(([val, label]) => {
      const on = this.state.segs[key] === val;
      return {
        label, on, off: !on,
        act: () => { const s = Object.assign({}, this.state.segs); s[key] = val; this.setState({ segs: s }); }
      };
    });
  }
  renderVals() {
    const bn = (this.props.lang ?? 'en') === 'bn';
    const L = (en, b) => bn ? b : en;
    const step = this.state.step;
    const close = this.props.onClose || (() => {});
    const F = (label, value, opts) => Object.assign({
      label, value: value || '', placeholder: '', help: '', wide: false, req: '',
      isText: true, isSelect: false, isSeg: false, options: [], segs: [], hasHelp: false
    }, opts || {}, { label, value: value || '' });
    const fix = (f) => {
      const out = Object.assign({}, f);
      out.hasHelp = !!out.help;
      out.narrow = !out.wide;
      out.options = (out.options || []).map(label => ({ label }));
      return out;
    };
    const STEP_DEFS = [
      { key: 'personal', label: L('Personal', 'ব্যক্তিগত'), icon: 'user' },
      { key: 'job', label: L('Job', 'চাকরি'), icon: 'briefcase' },
      { key: 'access', label: L('Login and access', 'লগইন ও অ্যাক্সেস'), icon: 'shield-check' },
      { key: 'shift', label: L('Shift and attendance', 'শিফট ও হাজিরা'), icon: 'clock' },
      { key: 'salary', label: L('Salary', 'বেতন'), icon: 'wallet' },
      { key: 'leave', label: L('Leave', 'ছুটি'), icon: 'palmtree' },
      { key: 'review', label: L('Review', 'পর্যালোচনা'), icon: 'check-check' }
    ];
    const SECTIONS = {
      personal: [
        { title: L('Who is joining?', 'কে যোগ দিচ্ছেন?'), help: L('The name goes on receipts, the roster and payslips. Bangla name is used for SMS.', 'নাম রশিদ, রোস্টার ও পে-স্লিপে যাবে। SMS-এ বাংলা নাম ব্যবহার হবে।'), fields: [
          F(L('Full name (English)', 'পুরো নাম (ইংরেজি)'), 'Sadia Akter', { req: L('required', 'আবশ্যক') }),
          F(L('Full name (Bangla)', 'পুরো নাম (বাংলা)'), 'সাদিয়া আক্তার', { help: L('Allow extra width — Bangla runs about 25% longer.', 'বাংলা প্রায় ২৫% বেশি জায়গা নেয়।') }),
          F(L('Mobile number', 'মোবাইল নম্বর'), '+880 1712-660145', { req: L('required', 'আবশ্যক'), help: L('Used for login, OTP and payslip links.', 'লগইন, OTP ও পে-স্লিপ লিংকে ব্যবহৃত।') }),
          F(L('Email', 'ইমেইল'), 'sadia.akter@gmail.com'),
          F(L('Date of birth', 'জন্ম তারিখ'), '14 Nov 2001'),
          F(L('National ID (NID)', 'জাতীয় পরিচয়পত্র'), '19XX XXXX XXXX'),
          F(L('Address', 'ঠিকানা'), 'House 42, Road 8, Dhanmondi, Dhaka 1209', { wide: true }),
          F(L('Emergency contact', 'জরুরি যোগাযোগ'), 'Rahim Akter · +880 1911-XXXXXX', { wide: true, help: L('Name and number of someone the shop can call.', 'দোকান থেকে ফোন করা যাবে এমন কারো নাম ও নম্বর।') })
        ] }
      ],
      job: [
        { title: L('Role in the shop', 'দোকানে ভূমিকা'), help: L('Designation is what customers and staff see. The employee ID is generated for you.', 'পদবি কাস্টমার ও স্টাফ দেখতে পান। কর্মী আইডি স্বয়ংক্রিয়ভাবে তৈরি হয়।'), fields: [
          F(L('Designation', 'পদবি'), 'Cashier', { isText: false, isSelect: true, options: [L('Cashier', 'ক্যাশিয়ার'), L('Sales associate', 'সেলস অ্যাসোসিয়েট'), L('Packer', 'প্যাকার'), L('Branch manager', 'শাখা ব্যবস্থাপক'), L('Accountant', 'হিসাবরক্ষক')] }),
          F(L('Employee ID', 'কর্মী আইডি'), 'EMP-0142', { help: L('Auto-generated · editable before you create the account.', 'স্বয়ংক্রিয় · অ্যাকাউন্ট তৈরির আগে বদলানো যাবে।') }),
          F(L('Branch', 'শাখা'), '', { isText: false, isSelect: true, options: [L('Dhanmondi', 'ধানমন্ডি'), L('Uttara', 'উত্তরা'), L('Chattogram', 'চট্টগ্রাম')] }),
          F(L('Reporting manager', 'রিপোর্টিং ম্যানেজার'), '', { isText: false, isSelect: true, options: [L('Nusrat Jahan · Branch manager', 'নুসরাত জাহান · শাখা ব্যবস্থাপক'), L('Ashiq Khan · Owner', 'আশিক খান · মালিক')] }),
          F(L('Employment type', 'নিয়োগের ধরন'), '', { isText: false, isSeg: true, segKey: 'employment' }),
          F(L('Joining date', 'যোগদানের তারিখ'), '02 Mar 2026', { req: L('required', 'আবশ্যক') })
        ] }
      ],
      access: [
        { title: L('How will she sign in?', 'তিনি কীভাবে সাইন ইন করবেন?'), help: L('Staff sign in to the admin panel and the POS register with the same account.', 'স্টাফ একই অ্যাকাউন্টে অ্যাডমিন ও POS-এ সাইন ইন করেন।'), fields: [
          F(L('Login with', 'লগইন করবেন'), '', { isText: false, isSeg: true, segKey: 'login' }),
          F(L('Two-factor authentication', 'দুই স্তরের যাচাই'), '', { isText: false, isSeg: true, segKey: 'twoFactor', help: L('SMS code on every new device. Recommended for cash handling.', 'নতুন ডিভাইসে SMS কোড। ক্যাশ হ্যান্ডলিংয়ে পরামর্শ দেওয়া হয়।') }),
          F(L('Role', 'রোল'), '', { isText: false, isSelect: true, options: [L('Cashier', 'ক্যাশিয়ার'), L('Order confirmer', 'অর্ডার নিশ্চিতকারী'), L('Packer', 'প্যাকার'), L('Manager', 'ম্যানেজার'), L('Accountant', 'হিসাবরক্ষক'), L('Custom role', 'কাস্টম রোল')], help: L('You can override single permissions after the account exists.', 'অ্যাকাউন্ট তৈরির পর একক অনুমতি বদলানো যাবে।') }),
          F(L('Branch scope', 'শাখার পরিধি'), '', { isText: false, isSelect: true, options: [L('Dhanmondi only', 'শুধু ধানমন্ডি'), L('Dhanmondi + Uttara', 'ধানমন্ডি + উত্তরা'), L('All branches', 'সব শাখা')] }),
          F(L('Max discount without approval', 'অনুমোদন ছাড়া সর্বোচ্চ ছাড়'), '5%'),
          F(L('Max refund', 'সর্বোচ্চ ফেরত'), '৳2,000'),
          F(L('Customer phone', 'কাস্টমার ফোন'), '', { isText: false, isSelect: true, options: [L('Masked', 'মাস্কড'), L('Visible', 'দৃশ্যমান')] }),
          F(L('Cost price', 'ক্রয়মূল্য'), '', { isText: false, isSelect: true, options: [L('Hidden', 'লুকানো'), L('Visible', 'দৃশ্যমান')] })
        ] }
      ],
      shift: [
        { title: L('When does she work?', 'তিনি কখন কাজ করবেন?'), help: L('The shift drives attendance, late minutes and overtime. Everything here can change later.', 'শিফট থেকে হাজিরা, দেরি ও ওভারটাইম হিসাব হয়। পরে বদলানো যাবে।'), fields: [
          F(L('Shift', 'শিফট'), '', { isText: false, isSelect: true, options: [L('Morning · 10:00 – 18:00', 'সকাল · ১০:০০ – ১৮:০০'), L('Evening · 14:00 – 22:00', 'সন্ধ্যা · ১৪:০০ – ২২:০০'), L('Split · 10:00 – 14:00, 17:00 – 21:00', 'বিভক্ত · ১০:০০ – ১৪:০০, ১৭:০০ – ২১:০০')] }),
          F(L('Grace time', 'গ্রেস সময়'), '10', { help: L('Minutes after shift start before a late mark.', 'শিফট শুরুর পর কত মিনিট পর্যন্ত দেরি গণনা হবে না।') }),
          F(L('Weekly off', 'সাপ্তাহিক ছুটি'), '', { isText: false, isSelect: true, options: [L('Friday', 'শুক্রবার'), L('Saturday', 'শনিবার'), L('Friday and Saturday', 'শুক্র ও শনিবার')] }),
          F(L('Check-in method', 'চেক-ইন পদ্ধতি'), '', { isText: false, isSeg: true, segKey: 'checkIn' }),
          F(L('Overtime counts after', 'ওভারটাইম গণনা শুরু'), '30', { help: L('Minutes past shift end. Paid at ৳100 per hour.', 'শিফট শেষের কত মিনিট পর। ঘণ্টায় ৳১০০ হারে।') }),
          F(L('Assign POS register', 'POS রেজিস্টার'), '', { isText: false, isSelect: true, options: [L('POS Dhanmondi-1', 'POS ধানমন্ডি-১'), L('POS Dhanmondi-2', 'POS ধানমন্ডি-২')] })
        ] }
      ],
      salary: [
        { title: L('What is she paid?', 'তাঁর বেতন কত?'), help: L('Gross is split into the shop\u2019s standard structure. You can fine-tune each component after creating the account.', 'গ্রস দোকানের স্ট্যান্ডার্ড কাঠামোয় ভাগ হয়। অ্যাকাউন্ট তৈরির পর প্রতিটি অংশ ঠিক করা যাবে।'), fields: [
          F(L('Gross monthly salary', 'মাসিক গ্রস বেতন'), '৳22,000', { req: L('required', 'আবশ্যক') }),
          F(L('Structure preset', 'কাঠামো প্রিসেট'), '', { isText: false, isSelect: true, options: [L('Standard · 60% basic, 25% house rent', 'স্ট্যান্ডার্ড · ৬০% মূল, ২৫% বাড়ি ভাড়া'), L('Basic only', 'শুধু মূল বেতন'), L('Custom', 'কাস্টম')] }),
          F(L('Payment method', 'পেমেন্ট পদ্ধতি'), '', { isText: false, isSeg: true, segKey: 'payMethod' }),
          F(L('bKash number', 'বিকাশ নম্বর'), '01712-660145'),
          F(L('Pay day', 'বেতনের দিন'), '', { isText: false, isSelect: true, options: [L('1st of each month', 'প্রতি মাসের ১ তারিখ'), L('7th of each month', 'প্রতি মাসের ৭ তারিখ'), L('Last working day', 'শেষ কর্মদিবস')] }),
          F(L('Commission', 'কমিশন'), '0.5%', { help: L('Percentage of her own counter sales, capped at ৳2,500 a month.', 'নিজের কাউন্টার বিক্রির শতাংশ, মাসে সর্বোচ্চ ৳২,৫০০।') })
        ] }
      ],
      leave: [
        { title: L('Leave policy', 'ছুটির নীতি'), help: L('Balances start from the joining date and are pro-rated for the first year.', 'যোগদানের তারিখ থেকে ব্যালেন্স শুরু, প্রথম বছরে আনুপাতিক।'), fields: [
          F(L('Policy', 'নীতি'), '', { isText: false, isSelect: true, options: [L('Standard shop policy 2026', 'স্ট্যান্ডার্ড শপ পলিসি ২০২৬'), L('Part-time policy 2026', 'খণ্ডকালীন পলিসি ২০২৬'), L('Custom', 'কাস্টম')] }),
          F(L('Carry over unused casual leave', 'অব্যবহৃত নৈমিত্তিক ছুটি পরের বছরে'), '', { isText: false, isSeg: true, segKey: 'carry' }),
          F(L('Casual leave (days)', 'নৈমিত্তিক ছুটি (দিন)'), '10'),
          F(L('Sick leave (days)', 'অসুস্থতার ছুটি (দিন)'), '14'),
          F(L('Annual leave (days)', 'বার্ষিক ছুটি (দিন)'), '12', { help: L('Unlocks after 12 months of service.', '১২ মাস চাকরির পর খুলবে।') }),
          F(L('Holiday calendar', 'ছুটির ক্যালেন্ডার'), '', { isText: false, isSelect: true, options: [L('Dhanmondi branch', 'ধানমন্ডি শাখা'), L('Company-wide', 'পুরো কোম্পানি')] })
        ] }
      ]
    };
    const segLabels = {
      employment: [['full', L('Full time', 'পূর্ণকালীন')], ['part', L('Part time', 'খণ্ডকালীন')], ['contract', L('Contract', 'চুক্তি')]],
      login: [['phone', L('Mobile number', 'মোবাইল নম্বর')], ['email', L('Email', 'ইমেইল')]],
      twoFactor: [['on', L('On', 'চালু')], ['off', L('Off', 'বন্ধ')]],
      checkIn: [['pin', L('POS PIN', 'POS পিন')], ['app', L('Phone app', 'ফোন অ্যাপ')], ['admin', L('Admin only', 'শুধু অ্যাডমিন')]],
      payMethod: [['bkash', 'bKash'], ['bank', L('Bank transfer', 'ব্যাংক ট্রান্সফার')], ['cash', L('Cash', 'ক্যাশ')]],
      carry: [['yes', L('Up to 5 days', '৫ দিন পর্যন্ত')], ['no', L('No carry over', 'পরের বছরে নয়')]]
    };
    const key = STEP_DEFS[step].key;
    const sections = (SECTIONS[key] || []).map(sec => ({
      title: sec.title, help: sec.help,
      fields: sec.fields.map(f => {
        const o = fix(f);
        if (o.isSeg) o.segs = this.seg(f.segKey, segLabels[f.segKey] || []);
        return o;
      })
    }));
    const segVal = (k) => {
      const list = segLabels[k] || [];
      const found = list.filter(x => x[0] === this.state.segs[k])[0];
      return found ? found[1] : '';
    };
    const review = [
      { title: L('Personal', 'ব্যক্তিগত'), icon: 'user', step: 0, rows: [
        [L('Name', 'নাম'), 'Sadia Akter · সাদিয়া আক্তার'], [L('Mobile', 'মোবাইল'), '+880 1712-660145'],
        [L('Email', 'ইমেইল'), 'sadia.akter@gmail.com'], [L('NID', 'এনআইডি'), '19XX XXXX XXXX']
      ] },
      { title: L('Job', 'চাকরি'), icon: 'briefcase', step: 1, rows: [
        [L('Designation', 'পদবি'), L('Cashier · EMP-0142', 'ক্যাশিয়ার · EMP-0142')], [L('Branch', 'শাখা'), L('Dhanmondi', 'ধানমন্ডি')],
        [L('Manager', 'ম্যানেজার'), L('Nusrat Jahan', 'নুসরাত জাহান')], [L('Type', 'ধরন'), segVal('employment') + ' · 02 Mar 2026']
      ] },
      { title: L('Login and access', 'লগইন ও অ্যাক্সেস'), icon: 'shield-check', step: 2, rows: [
        [L('Login with', 'লগইন'), segVal('login')], [L('Two-factor', 'দুই স্তর'), segVal('twoFactor')],
        [L('Role and scope', 'রোল ও পরিধি'), L('Cashier · Dhanmondi only', 'ক্যাশিয়ার · শুধু ধানমন্ডি')],
        [L('Limits', 'সীমা'), L('5% discount · ৳2,000 refund · phone masked · cost price hidden', '৫% ছাড় · ৳২,০০০ ফেরত · ফোন মাস্কড · ক্রয়মূল্য লুকানো')]
      ] },
      { title: L('Shift and attendance', 'শিফট ও হাজিরা'), icon: 'clock', step: 3, rows: [
        [L('Shift', 'শিফট'), L('Morning · 10:00 – 18:00', 'সকাল · ১০:০০ – ১৮:০০')], [L('Grace', 'গ্রেস'), L('10 minutes', '১০ মিনিট')],
        [L('Weekly off', 'সাপ্তাহিক ছুটি'), L('Friday', 'শুক্রবার')], [L('Check-in', 'চেক-ইন'), segVal('checkIn') + ' · POS Dhanmondi-1']
      ] },
      { title: L('Salary', 'বেতন'), icon: 'wallet', step: 4, rows: [
        [L('Gross', 'গ্রস'), '৳22,000 ' + L('per month', 'প্রতি মাস')], [L('Structure', 'কাঠামো'), L('Standard · 60% basic, 25% house rent', 'স্ট্যান্ডার্ড · ৬০% মূল, ২৫% বাড়ি ভাড়া')],
        [L('Payment', 'পেমেন্ট'), segVal('payMethod') + ' · 01712-660145'], [L('Pay day', 'বেতনের দিন'), L('1st of each month', 'প্রতি মাসের ১ তারিখ')]
      ] },
      { title: L('Leave', 'ছুটি'), icon: 'palmtree', step: 5, rows: [
        [L('Policy', 'নীতি'), L('Standard shop policy 2026', 'স্ট্যান্ডার্ড শপ পলিসি ২০২৬')],
        [L('Allocation', 'বরাদ্দ'), L('Casual 10 · Sick 14 · Annual 12', 'নৈমিত্তিক ১০ · অসুস্থতা ১৪ · বার্ষিক ১২')],
        [L('Carry over', 'পরের বছরে'), segVal('carry')], [L('Holidays', 'ছুটি'), L('Dhanmondi branch calendar', 'ধানমন্ডি শাখার ক্যালেন্ডার')]
      ] }
    ].map(g => ({ title: g.title, icon: g.icon, rows: g.rows.map(([label, value]) => ({ label, value })), act: () => this.setState({ step: g.step }) }));
    return {
      t: {
        title: L('Add staff', 'স্টাফ যোগ করুন'), close: L('Close', 'বন্ধ'), continue: L('Continue', 'পরবর্তী'),
        edit: L('Edit', 'সম্পাদনা'), createVerb: L('Create and send invitation', 'তৈরি ও আমন্ত্রণ পাঠান'),
        reviewTitle: L('Everything in one place', 'সব এক জায়গায়'),
        reviewBody: L('Check each group before the account is created. Nothing is sent to Sadia until you press Create.', 'অ্যাকাউন্ট তৈরির আগে প্রতিটি অংশ দেখে নিন। তৈরি চাপার আগে সাদিয়াকে কিছু পাঠানো হবে না।'),
        inviteTitle: L('Send the invitation', 'আমন্ত্রণ পাঠান'),
        inviteBody: L('She sets her own password from the invitation. It expires in 48 hours and can be resent.', 'আমন্ত্রণ থেকে তিনি নিজের পাসওয়ার্ড দেবেন। ৪৮ ঘণ্টায় শেষ হবে, আবার পাঠানো যাবে।'),
        inviteNote: L('Until she accepts, the account shows as Invited and cannot sign in to the POS register.', 'গ্রহণ করার আগে অ্যাকাউন্ট আমন্ত্রিত দেখাবে এবং POS-এ সাইন ইন করা যাবে না।'),
        doneTitle: L('Sadia Akter added', 'সাদিয়া আক্তার যোগ হয়েছে'),
        doneBody: L('Invitation sent by SMS in Bangla to +880 1712-660145. Her profile is ready and her shift starts on 02 Mar 2026.', '+880 1712-660145 নম্বরে বাংলায় SMS-এ আমন্ত্রণ পাঠানো হয়েছে। প্রোফাইল তৈরি, শিফট শুরু ০২ মার্চ ২০২৬।'),
        doneCta: L('Open her profile', 'প্রোফাইল খুলুন'), addAnother: L('Add another', 'আরেকজন যোগ করুন')
      },
      steps: STEP_DEFS.map((s, i) => {
        const doneStep = i < step, current = i === step;
        return {
          n: String(i + 1), label: s.label,
          current: current ? 'step' : 'false',
          done: doneStep, active: current, todo: !doneStep && !current,
          lineDone: doneStep && i !== STEP_DEFS.length - 1,
          lineTodo: !doneStep && i !== STEP_DEFS.length - 1,
          act: () => this.setState({ step: i })
        };
      }),
      stepMeta: L('Step ' + (step + 1) + ' of 7 · ' + STEP_DEFS[step].label, 'ধাপ ' + (step + 1) + '/৭ · ' + STEP_DEFS[step].label),
      isForm: key !== 'review', isReview: key === 'review',
      sections, review,
      invites: [
        ['sms', L('SMS to +880 1712-660145', 'SMS · +880 1712-660145'), L('Bangla message with a link. Best for staff without email.', 'লিংকসহ বাংলা মেসেজ। ইমেইল না থাকলে সবচেয়ে ভালো।'), 'message-square'],
        ['email', L('Email to sadia.akter@gmail.com', 'ইমেইল · sadia.akter@gmail.com'), L('English message with a link and a short guide.', 'লিংক ও সংক্ষিপ্ত গাইডসহ ইংরেজি মেসেজ।'), 'mail']
      ].map(([val, label, help, icon]) => {
        const on = this.state.invite === val;
        return { label, help, icon, on, off: !on, act: () => this.setState({ invite: val }) };
      }),
      backLabel: step === 0 ? L('Cancel', 'বাতিল') : L('Back', 'পেছনে'),
      back: () => step === 0 ? close() : this.setState({ step: step - 1 }),
      next: () => this.setState({ step: Math.min(6, step + 1) }),
      create: () => this.setState({ done: true }),
      done: this.state.done,
      restart: () => this.setState({ done: false, step: 0 }),
      close: () => close(),
      draft: () => this.setState({ drafted: true }),
      draftLabel: this.state.drafted ? L('Draft saved', 'ড্রাফট সংরক্ষিত') : L('Save as draft', 'ড্রাফট সংরক্ষণ'),
      footNote: key === 'review' ? L('Nothing is sent until you press Create and send invitation.', 'তৈরি ও আমন্ত্রণ চাপার আগে কিছু পাঠানো হবে না।') : L('You can leave at any step — a draft keeps everything you have entered.', 'যেকোনো ধাপে বেরিয়ে যেতে পারেন — ড্রাফটে সব তথ্য থাকবে।')
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.dc-h689:hover{background:#f1f5f9 !important}
.dc-h690:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-f691:focus,.dc-f691:focus-visible,.dc-f691:focus-within{border-color:#003087 !important}
.dc-f692:focus,.dc-f692:focus-visible,.dc-f692:focus-within{border-color:#003087 !important}
.dc-f693:focus,.dc-f693:focus-visible,.dc-f693:focus-within{border-color:#003087 !important}
.dc-h694:hover{color:#1e293b !important}
.dc-h695:hover{background:#f8fafc !important}
.dc-h696:hover{background:#f1f5f9 !important}
.dc-h697:hover{background:#002a77 !important}
.dc-h698:hover{background:#002a77 !important}
.dc-h699:hover{background:#002a77 !important}
.dc-h700:hover{background:#f1f5f9 !important}`;

// ---- markup ----

export default class StaffCreateScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="StaffCreate">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc", fontFamily: "var(--font-sans)", color: "#475569" }}>
          <header style={{ flex: "none", display: "flex", alignItems: "center", gap: "14px", height: "56px", padding: "0 24px", borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
            <span style={{ display: "grid", placeItems: "center", width: "32px", height: "32px", flex: "none", borderRadius: "var(--radius-lg)", background: "#003087", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#fff" }}>G</span>
            <div style={{ flex: "1", minWidth: "0" }}>
              <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{v.t?.title}</p>
              <p style={{ margin: "0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.stepMeta}</p>
            </div>
            <button className="dc-h689" type="button" onClick={v.draft} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", flex: "none", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#475569", cursor: "pointer" }}><__Icon name="save" strokeWidth="1.75" width="15" height="15" />{v.draftLabel}</button>
            <button className="dc-h690" type="button" onClick={v.close} aria-label={v.t?.close} style={{ width: "36px", height: "36px", flex: "none", display: "grid", placeItems: "center", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", color: "var(--text-muted)", cursor: "pointer" }}>
              <__Icon name="x" strokeWidth="1.75" width="17" height="17" />
            </button>
          </header>
          <div style={{ flex: "none", background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "14px 24px" }}>
            <ol style={{ margin: "0 auto", padding: "0", listStyle: "none", maxWidth: "1000px", display: "flex", alignItems: "center", gap: "0" }}>
              {__list(v.steps).map((s, $index) => (<React.Fragment key={$index}>
                  <li style={{ flex: "1", minWidth: "0", display: "flex", alignItems: "center", gap: "8px" }}>
                    <button type="button" onClick={s?.act} aria-current={s?.current} style={{ display: "flex", alignItems: "center", gap: "9px", minWidth: "0", border: "none", background: "none", padding: "0", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
                      {s?.done ? (<>
                        <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-full)", border: "1px solid #003087", background: "#003087", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#fff" }}>
                          <__Icon name="check" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        {" "}
                        <span style={{ minWidth: "0", display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s?.label}</span>
                        </span>
                      </>) : null}
                      {s?.active ? (<>
                        <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-full)", border: "1px solid rgba(0,48,135,.25)", background: "rgba(0,48,135,.1)", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087" }}>{s?.n}</span>
                        {" "}
                        <span style={{ minWidth: "0", display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s?.label}</span>
                        </span>
                      </>) : null}
                      {s?.todo ? (<>
                        <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-full)", border: "1px solid #e2e8f0", background: "#fff", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>{s?.n}</span>
                        {" "}
                        <span style={{ minWidth: "0", display: "block" }}>
                          <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s?.label}</span>
                        </span>
                      </>) : null}
                    </button>
                    {s?.lineDone ? (<>
                      <span style={{ flex: "1", minWidth: "8px", height: "2px", borderRadius: "2px", background: "#003087" }} />
                    </>) : null}
                    {s?.lineTodo ? (<>
                      <span style={{ flex: "1", minWidth: "8px", height: "2px", borderRadius: "2px", background: "#e2e8f0" }} />
                    </>) : null}
                  </li>
                </React.Fragment>))}
            </ol>
          </div>
          <div style={{ flex: "1", minHeight: "0", overflow: "auto", padding: "24px" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>
              {v.isForm ? (<>
                {__list(v.sections).map((sec, $index) => (<React.Fragment key={$index}>
                    <section style={{ display: "flex", flexDirection: "column", gap: "16px", borderRadius: "var(--radius-lg)", background: "#fff", padding: "20px 22px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                      <div>
                        <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{sec?.title}</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "var(--text-muted)", textWrap: "pretty" }}>{sec?.help}</p>
                      </div>
                      <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "16px" }}>
                        {__list(sec?.fields).map((f, $index) => (<React.Fragment key={$index}>
                            {f?.wide ? (<>
                              <label style={{ display: "block", gridColumn: "span 2" }}>
                                <span style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "6px" }}>
                                  <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{f?.label}</span>
                                  <span style={{ fontSize: "var(--text-xs)", color: "#c2410c" }}>{f?.req}</span>
                                </span>
                                {" "}
                                <input className="dc-f691" type="text" defaultValue={f?.value} placeholder={f?.placeholder} style={{ width: "100%", height: "36px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                                {f?.hasHelp ? (<>
                                  <span style={{ display: "block", marginTop: "5px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", textWrap: "pretty" }}>{f?.help}</span>
                                </>) : null}
                              </label>
                            </>) : null}
                            {f?.narrow ? (<>
                              <label style={{ display: "block" }}>
                                <span style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "6px" }}>
                                  <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{f?.label}</span>
                                  <span style={{ fontSize: "var(--text-xs)", color: "#c2410c" }}>{f?.req}</span>
                                </span>
                                {f?.isText ? (<>
                                  <input className="dc-f692" type="text" defaultValue={f?.value} placeholder={f?.placeholder} style={{ width: "100%", height: "36px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                                </>) : null}
                                {f?.isSelect ? (<>
                                  <select className="dc-f693" style={{ width: "100%", height: "36px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 9px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b", cursor: "pointer" }}>
                                    {__list(f?.options).map((o, $index) => (<React.Fragment key={$index}>
                                        <option>{o?.label}</option>
                                      </React.Fragment>))}
                                  </select>
                                </>) : null}
                                {f?.isSeg ? (<>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", height: "36px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "3px" }}>
                                    {__list(f?.segs).map((g, $index) => (<React.Fragment key={$index}>
                                        {g?.on ? (<>
                                          <button type="button" onClick={g?.act} aria-pressed="true" style={{ height: "28px", border: "none", borderRadius: "var(--radius-md)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "#fff", color: "#1e293b", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)" }}>{g?.label}</button>
                                        </>) : null}
                                        {g?.off ? (<>
                                          <button className="dc-h694" type="button" onClick={g?.act} aria-pressed="false" style={{ height: "28px", border: "none", borderRadius: "var(--radius-md)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "transparent", color: "var(--text-muted)" }}>{g?.label}</button>
                                        </>) : null}
                                      </React.Fragment>))}
                                  </span>
                                </>) : null}
                                {f?.hasHelp ? (<>
                                  <span style={{ display: "block", marginTop: "5px", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", textWrap: "pretty" }}>{f?.help}</span>
                                </>) : null}
                              </label>
                            </>) : null}
                          </React.Fragment>))}
                      </div>
                    </section>
                  </React.Fragment>))}
              </>) : null}
              {v.isReview ? (<>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.06)", padding: "16px 18px" }}>
                  <span style={{ display: "grid", placeItems: "center", width: "38px", height: "38px", flex: "none", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff" }}>
                    <__Icon name="check-check" strokeWidth="1.75" width="19" height="19" />
                  </span>
                  <div style={{ flex: "1", minWidth: "0" }}>
                    <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{v.t?.reviewTitle}</p>
                    <p style={{ margin: "1px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#475569", textWrap: "pretty" }}>{v.t?.reviewBody}</p>
                  </div>
                </div>
                <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "16px" }}>
                  {__list(v.review).map((g, $index) => (<React.Fragment key={$index}>
                      <section style={{ display: "flex", flexDirection: "column", gap: "11px", borderRadius: "var(--radius-lg)", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-lg)", background: "#f1f5f9", color: "#475569" }}>
                            <__Icon name={g?.icon} strokeWidth="1.75" width="15" height="15" />
                          </span>
                          <h2 style={{ margin: "0", flex: "1", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{g?.title}</h2>
                          <button type="button" onClick={g?.act} style={{ border: "none", background: "none", padding: "0", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#003087", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}>{v.t?.edit}</button>
                        </div>
                        <dl style={{ margin: "0", display: "flex", flexDirection: "column", gap: "7px" }}>
                          {__list(g?.rows).map((r, $index) => (<React.Fragment key={$index}>
                              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", fontSize: "var(--text-xs-plus)" }}>
                                <dt style={{ margin: "0", flex: "none", width: "44%", color: "var(--text-muted)" }}>{r?.label}</dt>
                                <dd style={{ margin: "0", flex: "1", minWidth: "0", fontWeight: "var(--weight-medium)", color: "#1e293b", textWrap: "pretty" }}>{r?.value}</dd>
                              </div>
                            </React.Fragment>))}
                        </dl>
                      </section>
                    </React.Fragment>))}
                </div>
                <section style={{ display: "flex", flexDirection: "column", gap: "14px", borderRadius: "var(--radius-lg)", background: "#fff", padding: "20px 22px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                  <div>
                    <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{v.t?.inviteTitle}</h2>
                    <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "var(--text-muted)", textWrap: "pretty" }}>{v.t?.inviteBody}</p>
                  </div>
                  <div role="radiogroup" aria-label={v.t?.inviteTitle} className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "12px" }}>
                    {__list(v.invites).map((i, $index) => (<React.Fragment key={$index}>
                        {i?.on ? (<>
                          <button type="button" role="radio" aria-checked="true" onClick={i?.act} style={{ display: "flex", alignItems: "flex-start", gap: "11px", border: "1px solid rgba(0,48,135,.25)", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.06)", padding: "14px 15px", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
                            <span style={{ display: "grid", placeItems: "center", width: "18px", height: "18px", flex: "none", marginTop: "1px", border: "1px solid #003087", borderRadius: "var(--radius-full)", background: "#fff" }}>
                              <span style={{ width: "9px", height: "9px", borderRadius: "var(--radius-full)", background: "#003087" }} />
                            </span>
                            <span style={{ flex: "1", minWidth: "0" }}>
                              <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{i?.label}</span>
                              <span style={{ display: "block", marginTop: "2px", fontSize: "var(--text-xs)", lineHeight: "18px", color: "var(--text-muted)", textWrap: "pretty" }}>{i?.help}</span>
                            </span>
                            <__Icon name={i?.icon} strokeWidth="1.75" width="17" height="17" style={{ flex: "none", color: "var(--text-muted)" }} />
                          </button>
                        </>) : null}
                        {i?.off ? (<>
                          <button className="dc-h695" type="button" role="radio" aria-checked="false" onClick={i?.act} style={{ display: "flex", alignItems: "flex-start", gap: "11px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "14px 15px", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
                            <span style={{ display: "grid", placeItems: "center", width: "18px", height: "18px", flex: "none", marginTop: "1px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-full)", background: "#fff" }}>
                              <span style={{ width: "9px", height: "9px", borderRadius: "var(--radius-full)", background: "transparent" }} />
                            </span>
                            <span style={{ flex: "1", minWidth: "0" }}>
                              <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{i?.label}</span>
                              <span style={{ display: "block", marginTop: "2px", fontSize: "var(--text-xs)", lineHeight: "18px", color: "var(--text-muted)", textWrap: "pretty" }}>{i?.help}</span>
                            </span>
                            <__Icon name={i?.icon} strokeWidth="1.75" width="17" height="17" style={{ flex: "none", color: "var(--text-muted)" }} />
                          </button>
                        </>) : null}
                      </React.Fragment>))}
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "9px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "12px 14px" }}>
                    <__Icon name="info" strokeWidth="1.75" width="17" height="17" style={{ flex: "none", marginTop: "1px", color: "var(--text-muted)" }} />
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#475569", textWrap: "pretty" }}>{v.t?.inviteNote}</p>
                  </div>
                </section>
              </>) : null}
            </div>
          </div>
          <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "12px", height: "68px", padding: "0 24px", borderTop: "1px solid #e2e8f0", background: "#fff", boxShadow: "0 -8px 22px -14px rgba(15,23,42,.25)" }}>
            <div style={{ maxWidth: "1000px", width: "100%", margin: "0 auto", display: "flex", alignItems: "center", gap: "12px" }}>
              <button className="dc-h696" type="button" onClick={v.back} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", flex: "none", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#475569", cursor: "pointer" }}><__Icon name="arrow-left" strokeWidth="1.75" width="16" height="16" />{v.backLabel}</button>
              <p style={{ margin: "0", flex: "1", minWidth: "0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", textWrap: "pretty" }}>{v.footNote}</p>
              {v.isForm ? (<>
                <button className="dc-h697" type="button" onClick={v.next} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", flex: "none", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", padding: "0 16px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#fff", cursor: "pointer" }}>{v.t?.continue}<__Icon name="arrow-right" strokeWidth="1.75" width="16" height="16" /></button>
              </>) : null}
              {v.isReview ? (<>
                <button className="dc-h698" type="button" onClick={v.create} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", flex: "none", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", padding: "0 16px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#fff", cursor: "pointer" }}><__Icon name="send" strokeWidth="1.75" width="16" height="16" />{v.t?.createVerb}</button>
              </>) : null}
            </div>
          </div>
          {v.done ? (<>
            <div style={{ position: "fixed", inset: "0", zIndex: "220", display: "grid", placeItems: "center", background: "rgba(15,23,42,.6)", padding: "24px" }}>
              <div role="dialog" aria-modal="true" aria-label={v.t?.doneTitle} style={{ width: "100%", maxWidth: "460px", borderRadius: "var(--radius-lg)", background: "#fff", padding: "26px", textAlign: "center", boxShadow: "0 26px 60px -20px rgba(15,23,42,.5)" }}>
                <span style={{ display: "grid", placeItems: "center", width: "56px", height: "56px", margin: "0 auto 14px", borderRadius: "var(--radius-xl)", background: "rgba(16,185,129,.12)", color: "#047857" }}>
                  <__Icon name="check" strokeWidth="1.75" width="28" height="28" />
                </span>
                <h2 style={{ margin: "0", fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#1e293b" }}>{v.t?.doneTitle}</h2>
                <p style={{ margin: "7px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "20px", color: "var(--text-muted)", textWrap: "pretty" }}>{v.t?.doneBody}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "18px" }}>
                  <button className="dc-h699" type="button" onClick={v.close} style={{ height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", padding: "0 16px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#fff", cursor: "pointer" }}>{v.t?.doneCta}</button>
                  <button className="dc-h700" type="button" onClick={v.restart} style={{ height: "36px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 15px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#475569", cursor: "pointer" }}>{v.t?.addAnother}</button>
                </div>
              </div>
            </div>
          </>) : null}
        </div>
      </div>
    );
  }
}
