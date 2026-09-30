'use client';
// Generated from design/templates/staff-profile/StaffAccess.dc.html by scripts/convert-design.mjs.
// Profile · access
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  state = { open: { pos: true, sales: true }, allOpen: false, vis: { phone: 'masked', cost: 'hidden', salary: 'hidden' }, twoFactor: true, alerts: true, signedOut: {} };
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 200); setTimeout(go, 700); setTimeout(go, 2000);
  }
  renderVals() {
    const bn = (this.props.lang ?? 'en') === 'bn';
    const L = (en, b) => bn ? b : en;
    const ov = this.props.overrides || {};
    const onToggle = this.props.onToggle || (() => {});
    const onReset = this.props.onReset || (() => {});
    const onRole = this.props.onRole || (() => {});
    const onChange = this.props.onChange || (() => {});
    const role = this.props.role || 'Cashier';
    const ACTIONS = [['view', L('View', 'দেখা')], ['create', L('Create', 'তৈরি')], ['edit', L('Edit', 'সম্পাদনা')], ['delete', L('Delete', 'মুছুন')], ['approve', L('Approve', 'অনুমোদন')], ['export', L('Export', 'এক্সপোর্ট')]];
    const AREAS = [
      ['dash', L('Dashboard', 'ড্যাশবোর্ড'), 'layout-dashboard', 'v.....', L('Branch figures only — no company-wide revenue.', 'শুধু শাখার হিসাব — পুরো কোম্পানির আয় নয়।')],
      ['online', L('Online orders', 'অনলাইন অর্ডার'), 'shopping-bag', 'vce...', L('Can confirm and pack online orders, cannot cancel after dispatch.', 'অনলাইন অর্ডার নিশ্চিত ও প্যাক করতে পারেন, ডিসপ্যাচের পর বাতিল নয়।')],
      ['sales', L('Sales entry', 'বিক্রয় এন্ট্রি'), 'file-plus', 'vce...', L('Manual sales entry for phone and Facebook orders.', 'ফোন ও ফেসবুক অর্ডারের জন্য ম্যানুয়াল এন্ট্রি।')],
      ['pos', L('POS', 'পিওএস'), 'scan-line', 'vc....', L('Counter sales at Dhanmondi-1 only. Returns need a manager.', 'শুধু ধানমন্ডি-১ কাউন্টার বিক্রি। ফেরতের জন্য ম্যানেজার লাগবে।')],
      ['stock', L('Products and stock', 'প্রোডাক্ট ও স্টক'), 'package', 'v.....', L('Sees stock counts, not cost price or supplier rates.', 'স্টক দেখেন, ক্রয়মূল্য বা সরবরাহকারীর রেট নয়।')],
      ['cust', L('Customers', 'কাস্টমার'), 'users', 'vce...', L('Phone numbers stay masked while data visibility is masked.', 'ডেটা দৃশ্যমানতা মাস্কড থাকলে ফোন নম্বর লুকানো থাকবে।')],
      ['promo', L('Promotions', 'প্রোমোশন'), 'percent', 'v.....', L('Can apply live promos, cannot create or change them.', 'চালু প্রোমো দিতে পারেন, তৈরি বা বদল নয়।')],
      ['purch', L('Purchases and suppliers', 'ক্রয় ও সরবরাহকারী'), 'truck', '......', L('Closed for cashiers — purchase prices reveal margin.', 'ক্যাশিয়ারের জন্য বন্ধ — ক্রয়মূল্যে মার্জিন বোঝা যায়।')],
      ['cash', L('Cash and expenses', 'ক্যাশ ও খরচ'), 'wallet', 'vc....', L('Opens and closes her own drawer; expenses need approval.', 'নিজের ড্রয়ার খোলা ও বন্ধ; খরচে অনুমোদন লাগবে।')],
      ['rep', L('Reports', 'রিপোর্ট'), 'bar-chart-3', 'v.....', L('Daily sales and her own performance report.', 'দৈনিক বিক্রয় ও নিজের পারফরম্যান্স রিপোর্ট।')],
      ['msg', L('Messaging', 'মেসেজিং'), 'message-square', 'vc....', L('Replies to customer chats, cannot send bulk SMS.', 'কাস্টমার চ্যাটের উত্তর দেন, বাল্ক SMS নয়।')],
      ['staff', L('Staff and payroll', 'স্টাফ ও পে-রোল'), 'id-card', '......', L('Owner, manager and accountant only.', 'শুধু মালিক, ম্যানেজার ও হিসাবরক্ষক।')],
      ['set', L('Settings and billing', 'সেটিংস ও বিলিং'), 'settings', '......', L('Owner only. Includes plan, domains and payment gateways.', 'শুধু মালিক। প্ল্যান, ডোমেইন ও পেমেন্ট গেটওয়ে অন্তর্ভুক্ত।')]
    ];
    const CODES = { v: 'view', c: 'create', e: 'edit', d: 'delete', a: 'approve', x: 'export' };
    const baseOf = (pat) => {
      const set = {};
      pat.split('').forEach(ch => { if (CODES[ch]) set[CODES[ch]] = true; });
      return set;
    };
    const ICONS = { view: 'eye', create: 'plus', edit: 'pencil', delete: 'trash-2', approve: 'check-check', export: 'download' };
    const areas = AREAS.map(([key, label, icon, pat, note]) => {
      const base = baseOf(pat);
      const open = this.state.allOpen || !!this.state.open[key];
      let ovCount = 0;
      const cells = ACTIONS.map(([act, actLabel]) => {
        const k = key + ':' + act;
        const has = !!ov[k];
        if (has) ovCount++;
        const on = has ? ov[k].on : !!base[act];
        return {
          label: actLabel, icon: on ? ICONS[act] : 'minus',
          on: on ? 'true' : 'false',
          aria: actLabel + ' — ' + label + (on ? ' (allowed)' : ' (blocked)'),
          ovOn: has && on, ovOff: has && !on, plainOn: !has && on, plainOff: !has && !on,
          isOv: has,
          resetAria: L('Reset ' + actLabel + ' on ' + label + ' to the role default', actLabel + ' রোল ডিফল্টে ফেরান'),
          act: () => onToggle(k, label + ' · ' + actLabel, !on),
          reset: (e) => { e.stopPropagation(); onReset(k); }
        };
      });
      const granted = cells.filter(c => c.on === 'true');
      return {
        label, icon, note, open,
        chev: open ? 'chevron-up' : 'chevron-down',
        summary: granted.length ? L('Can ', 'পারেন: ') + granted.map(c => c.label.toLowerCase()).join(', ') : L('No access', 'কোনো অ্যাক্সেস নেই'),
        hasOv: ovCount > 0,
        tagText: L(ovCount + ' override' + (ovCount === 1 ? '' : 's'), ovCount + 'টি ওভাররাইড'),
        dots: cells.map(c => ({ title: c.label, isOv: c.on === 'true' && c.isOv, isOn: c.on === 'true' && !c.isOv, isOff: c.on !== 'true' })),
        cells,
        toggleOpen: () => { const o = Object.assign({}, this.state.open); o[key] = !open; this.setState({ open: o, allOpen: false }); }
      };
    });
    const ovCountAll = Object.keys(ov).length;
    const ROLES = [['Owner', L('Owner', 'মালিক'), 'crown'], ['Manager', L('Manager', 'ম্যানেজার'), 'user-cog'], ['Order confirmer', L('Order confirmer', 'অর্ডার নিশ্চিতকারী'), 'check-check'], ['Packer', L('Packer', 'প্যাকার'), 'package'], ['Cashier', L('Cashier', 'ক্যাশিয়ার'), 'scan-line'], ['Marketer', L('Marketer', 'মার্কেটার'), 'megaphone'], ['Accountant', L('Accountant', 'হিসাবরক্ষক'), 'calculator'], ['Custom role', L('Custom role', 'কাস্টম রোল'), 'sliders-horizontal']];
    const visRow = (key, label, help, offLabel, onLabel, offVal, onVal) => {
      const v = this.state.vis[key];
      return {
        label, help, offLabel, onLabel,
        offSel: v === offVal, offUnsel: v !== offVal, onSel: v === onVal, onUnsel: v !== onVal,
        setOff: () => { const n = Object.assign({}, this.state.vis); n[key] = offVal; this.setState({ vis: n }); onChange('vis:' + key, label + ' · ' + offLabel, L('Data visibility changed', 'ডেটা দৃশ্যমানতা বদলেছে')); },
        setOn: () => { const n = Object.assign({}, this.state.vis); n[key] = onVal; this.setState({ vis: n }); onChange('vis:' + key, label + ' · ' + onLabel, L('Data visibility changed', 'ডেটা দৃশ্যমানতা বদলেছে')); }
      };
    };
    return {
      t: {
        roleTitle: L('Role', 'রোল'), createRole: L('Create custom role', 'কাস্টম রোল তৈরি'),
        matrixTitle: L('Permission matrix', 'অনুমতির ম্যাট্রিক্স'), resetToRole: L('Reset to role', 'রোলে ফেরান'), override: L('OVERRIDE', 'ওভাররাইড'),
        scopeTitle: L('Branches and warehouses', 'শাখা ও গুদাম'),
        visTitle: L('Data visibility', 'ডেটা দৃশ্যমানতা'), limitsTitle: L('Limits', 'সীমা'),
        securityTitle: L('Security', 'নিরাপত্তা'), trusted: L('TRUSTED DEVICES', 'নির্ভরযোগ্য ডিভাইস'),
        sessionTimeout: L('Session timeout', 'সেশন টাইমআউট'), sessionHelp: L('Signs out after inactivity', 'নিষ্ক্রিয় থাকলে সাইন আউট'),
        min30: L('30 minutes', '৩০ মিনিট'), hr2: L('2 hours', '২ ঘণ্টা'), hr8: L('8 hours', '৮ ঘণ্টা'), shiftEnd: L('End of shift', 'শিফট শেষে'),
        historyTitle: L('Permission history', 'অনুমতির ইতিহাস')
      },
      roles: ROLES.map(([key, label, icon]) => {
        const on = role === key;
        return { label, icon, sel: on, unsel: !on, act: () => onRole(key) };
      }),
      roleNote: L('The Cashier role is shared by 4 staff. Changing a cell here only affects Sadia — it becomes a personal override, and the role itself is untouched.', 'ক্যাশিয়ার রোল ৪ জন ব্যবহার করেন। এখানে কোনো ঘর বদলালে শুধু সাদিয়ার ক্ষেত্রে প্রযোজ্য হবে — এটি ব্যক্তিগত ওভাররাইড, রোল অপরিবর্তিত থাকে।'),
      matrixMeta: L('13 areas · 6 actions · ' + ovCountAll + ' personal override' + (ovCountAll === 1 ? '' : 's'), '১৩টি এলাকা · ৬টি কাজ · ' + ovCountAll + 'টি ব্যক্তিগত ওভাররাইড'),
      areas,
      expandAll: () => this.setState({ allOpen: !this.state.allOpen, open: {} }),
      expandLabel: this.state.allOpen ? L('Collapse all', 'সব বন্ধ') : L('Expand all areas', 'সব খুলুন'),
      resetAll: () => Object.keys(ov).forEach(k => onReset(k)),
      scopes: [
        ['dhanmondi', L('Dhanmondi branch', 'ধানমন্ডি শাখা'), L('POS Dhanmondi-1 · primary', 'POS ধানমন্ডি-১ · প্রধান'), true],
        ['uttara', L('Uttara branch', 'উত্তরা শাখা'), L('POS Uttara-1, Uttara-2', 'POS উত্তরা-১, উত্তরা-২'), false],
        ['ctg', L('Chattogram branch', 'চট্টগ্রাম শাখা'), L('POS Agrabad-1', 'POS আগ্রাবাদ-১'), false],
        ['wh', L('Tejgaon warehouse', 'তেজগাঁও গুদাম'), L('Stock transfers and packing', 'স্টক ট্রান্সফার ও প্যাকিং'), false]
      ].map(([key, label, meta, on]) => ({
        label, meta, sel: on, unsel: !on,
        act: () => onChange('scope:' + key, label + ' · ' + (on ? L('removed from scope', 'বাদ') : L('added to scope', 'যোগ')), L('Branch scope changed', 'শাখার পরিধি বদলেছে'))
      })),
      vis: [
        visRow('phone', L('Customer phone', 'কাস্টমার ফোন'), L('Masked shows +880 1712-XXXXXX on orders and chats.', 'মাস্কড হলে অর্ডার ও চ্যাটে +880 1712-XXXXXX দেখাবে।'), L('Masked', 'মাস্কড'), L('Visible', 'দৃশ্যমান'), 'masked', 'visible'),
        visRow('cost', L('Cost price', 'ক্রয়মূল্য'), L('Hidden keeps purchase price and margin out of product pages.', 'লুকানো থাকলে ক্রয়মূল্য ও মার্জিন দেখা যাবে না।'), L('Hidden', 'লুকানো'), L('Visible', 'দৃশ্যমান'), 'hidden', 'visible'),
        visRow('salary', L('Salary data', 'বেতনের তথ্য'), L('Controls her own payslips and other staff salary cards.', 'নিজের পে-স্লিপ ও অন্য স্টাফের বেতন কার্ড নিয়ন্ত্রণ করে।'), L('Hidden', 'লুকানো'), L('Visible', 'দৃশ্যমান'), 'hidden', 'visible')
      ],
      limits: [
        { label: L('Max discount without approval', 'অনুমোদন ছাড়া সর্বোচ্চ ছাড়'), help: L('Anything higher goes to the branch manager.', 'এর বেশি হলে শাখা ব্যবস্থাপকের কাছে যাবে।'), prefix: '', suffix: '%', value: '5', act: () => onChange('limit:discount', L('Max discount changed', 'সর্বোচ্চ ছাড় বদলেছে'), L('Was 5%', 'আগে ছিল ৫%')) },
        { label: L('Max refund', 'সর্বোচ্চ ফেরত'), help: L('Per order, cash or bKash.', 'প্রতি অর্ডারে, ক্যাশ বা বিকাশ।'), prefix: '৳', suffix: '', value: '2,000', act: () => onChange('limit:refund', L('Max refund changed', 'সর্বোচ্চ ফেরত বদলেছে'), L('Was ৳2,000', 'আগে ছিল ৳২,০০০')) },
        { label: L('Cash handling limit', 'ক্যাশ হ্যান্ডলিং সীমা'), help: L('Drawer total before a deposit is required.', 'জমা দেওয়ার আগে ড্রয়ারের সর্বোচ্চ পরিমাণ।'), prefix: '৳', suffix: '', value: '25,000', act: () => onChange('limit:cash', L('Cash limit changed', 'ক্যাশ সীমা বদলেছে'), L('Was ৳25,000', 'আগে ছিল ৳২৫,০০০')) }
      ],
      security: [
        { label: L('Two-factor authentication', 'দুই স্তরের যাচাই'), help: L('SMS code on every new device.', 'নতুন ডিভাইসে SMS কোড।'), isOn: this.state.twoFactor, isOff: !this.state.twoFactor, act: () => { const v = !this.state.twoFactor; this.setState({ twoFactor: v }); onChange('sec:2fa', L('Two-factor ' + (v ? 'on' : 'off'), 'দুই স্তর ' + (v ? 'চালু' : 'বন্ধ')), L('Security setting', 'নিরাপত্তা সেটিং')); } },
        { label: L('Login alerts', 'লগইন সতর্কতা'), help: L('SMS to the owner on a new device sign-in.', 'নতুন ডিভাইসে সাইন-ইনে মালিককে SMS।'), isOn: this.state.alerts, isOff: !this.state.alerts, act: () => { const v = !this.state.alerts; this.setState({ alerts: v }); onChange('sec:alerts', L('Login alerts ' + (v ? 'on' : 'off'), 'লগইন সতর্কতা ' + (v ? 'চালু' : 'বন্ধ')), L('Security setting', 'নিরাপত্তা সেটিং')); } }
      ],
      setTimeout2: () => onChange('sec:timeout', L('Session timeout changed', 'সেশন টাইমআউট বদলেছে'), L('Was end of shift', 'আগে ছিল শিফট শেষে')),
      devices: [
        ['pos', L('POS Dhanmondi-1', 'POS ধানমন্ডি-১'), L('Android tablet · in use now', 'অ্যান্ড্রয়েড ট্যাব · এখন ব্যবহৃত'), 'tablet'],
        ['win', L('Chrome on Windows', 'উইন্ডোজ ক্রোম'), L('Last used 14 Sep, 6:10 PM', 'শেষ ব্যবহার ১৪ সেপ, ৬:১০ PM'), 'monitor'],
        ['app', L('GridCommerce app', 'গ্রিডকমার্স অ্যাপ'), L('Redmi Note 12 · 16 Sep', 'রেডমি নোট ১২ · ১৬ সেপ'), 'smartphone']
      ].map(([key, name, meta, icon]) => {
        const out = !!this.state.signedOut[key];
        return { name, meta: out ? L('Signed out just now', 'এইমাত্র সাইন আউট') : meta, icon, btn: out ? L('Signed out', 'সাইন আউট') : L('Sign out', 'সাইন আউট'), out: out, live: !out, act: () => { const s = Object.assign({}, this.state.signedOut); s[key] = true; this.setState({ signedOut: s }); } };
      }),
      history: [
        { text: L('Ashiq Khan set max discount to 5%', 'আশিক খান সর্বোচ্চ ছাড় ৫% করেছেন'), when: L('02 Sep 2026, 4:12 PM', '০২ সেপ ২০২৬, ৪:১২ PM'), icon: 'percent' },
        { text: L('Nusrat Jahan blocked POS returns', 'নুসরাত জাহান POS ফেরত বন্ধ করেছেন'), when: L('18 Aug 2026, 11:03 AM', '১৮ আগ ২০২৬, ১১:০৩ AM'), icon: 'rotate-ccw' },
        { text: L('Ashiq Khan assigned the Cashier role', 'আশিক খান ক্যাশিয়ার রোল দিয়েছেন'), when: L('02 Mar 2026, 9:40 AM', '০২ মার্চ ২০২৬, ৯:৪০ AM'), icon: 'shield-check' }
      ]
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.dc-h665:hover{background:#f8fafc !important;border-color:#cbd5e1 !important}
.dc-h666:hover{background:#f1f5f9 !important}
.dc-h667:hover{background:#f1f5f9 !important}
.dc-h668:hover{background:#f8fafc !important}
.dc-h669:hover{border-color:#cbd5e1 !important;color:#64748b !important}
.dc-h670:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-f671:focus,.dc-f671:focus-visible,.dc-f671:focus-within{border-color:#003087 !important}
.dc-f672:focus,.dc-f672:focus-visible,.dc-f672:focus-within{border-color:#003087 !important}
.dc-h673:hover{background:#fff7ed !important}`;

// ---- markup ----

export default class StaffAccessScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="StaffAccess">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: "16px", alignItems: "start", fontFamily: "Poppins,'Hind Siliguri',ui-sans-serif,system-ui,sans-serif", color: "#475569" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
            <section style={{ display: "flex", flexDirection: "column", gap: "14px", borderRadius: "8px", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h2 style={{ margin: "0", flex: "1", minWidth: "160px", fontSize: "15px", lineHeight: "22px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>{v.t?.roleTitle}</h2>
                <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: "500", letterSpacing: ".025em", color: "#003087", textDecoration: "underline", textUnderlineOffset: "3px" }}><__Icon name="plus" strokeWidth="1.75" width="14" height="14" />{v.t?.createRole}</a>
              </div>
              <div role="radiogroup" aria-label={v.t?.roleTitle} style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                {__list(v.roles).map((r, $index) => (<React.Fragment key={$index}>
                    {r?.sel ? (<>
                      <button type="button" role="radio" aria-checked="true" onClick={r?.act} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", border: "1px solid rgba(0,48,135,.25)", borderRadius: "8px", background: "rgba(0,48,135,.1)", padding: "0 13px", fontFamily: "inherit", fontSize: "13.5px", fontWeight: "600", letterSpacing: ".025em", cursor: "pointer", color: "#003087" }}><__Icon name={r?.icon} strokeWidth="1.75" width="15" height="15" />{r?.label}</button>
                    </>) : null}
                    {r?.unsel ? (<>
                      <button className="dc-h665" type="button" role="radio" aria-checked="false" onClick={r?.act} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 13px", fontFamily: "inherit", fontSize: "13.5px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer", color: "#475569" }}><__Icon name={r?.icon} strokeWidth="1.75" width="15" height="15" />{r?.label}</button>
                    </>) : null}
                  </React.Fragment>))}
              </div>
              <p style={{ margin: "0", fontSize: "13px", lineHeight: "20px", color: "#64748b", textWrap: "pretty" }}>{v.roleNote}</p>
            </section>
            <section style={{ borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "18px 20px 14px", flexWrap: "wrap" }}>
                <div style={{ flex: "1", minWidth: "200px" }}>
                  <h2 style={{ margin: "0", fontSize: "15px", lineHeight: "22px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>{v.t?.matrixTitle}</h2>
                  <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748b" }}>{v.matrixMeta}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button className="dc-h666" type="button" onClick={v.expandAll} style={{ height: "32px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", letterSpacing: ".025em", color: "#475569", cursor: "pointer" }}>{v.expandLabel}</button>
                  <button className="dc-h667" type="button" onClick={v.resetAll} style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "32px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", letterSpacing: ".025em", color: "#475569", cursor: "pointer" }}><__Icon name="rotate-ccw" strokeWidth="1.75" width="14" height="14" />{v.t?.resetToRole}</button>
                </div>
              </div>
              {__list(v.areas).map((a, $index) => (<React.Fragment key={$index}>
                  <div style={{ borderTop: "1px solid #e2e8f0" }}>
                    <button className="dc-h668" type="button" onClick={a?.toggleOpen} aria-expanded={a?.open} style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", border: "none", background: "#fff", padding: "12px 20px", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
                      <span style={{ display: "grid", placeItems: "center", width: "30px", height: "30px", flex: "none", borderRadius: "8px", background: "#f1f5f9", color: "#475569" }}>
                        <__Icon name={a?.icon} strokeWidth="1.75" width="16" height="16" />
                      </span>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <span style={{ display: "block", fontSize: "13.5px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>{a?.label}</span>
                        {" "}
                        <span style={{ display: "block", marginTop: "1px", fontSize: "12px", color: "#64748b" }}>{a?.summary}</span>
                      </span>
                      {a?.hasOv ? (<>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "22px", flex: "none", borderRadius: "9999px", background: "rgba(255,152,0,.14)", padding: "0 9px", fontSize: "11.5px", fontWeight: "600", color: "#b45309" }}><__Icon name="pencil" strokeWidth="1.75" width="12" height="12" />{a?.tagText}</span>
                      </>) : null}
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", flex: "none" }}>
                        {__list(a?.dots).map((d, $index) => (<React.Fragment key={$index}>
                            {d?.isOv ? (<>
                              <span title={d?.title} style={{ width: "7px", height: "7px", borderRadius: "2px", background: "#f4b740" }} />
                            </>) : null}
                            {d?.isOn ? (<>
                              <span title={d?.title} style={{ width: "7px", height: "7px", borderRadius: "2px", background: "#003087" }} />
                            </>) : null}
                            {d?.isOff ? (<>
                              <span title={d?.title} style={{ width: "7px", height: "7px", borderRadius: "2px", background: "#e2e8f0" }} />
                            </>) : null}
                          </React.Fragment>))}
                      </span>
                      <__Icon name={a?.chev} strokeWidth="1.75" width="17" height="17" style={{ flex: "none", color: "#94a3b8" }} />
                    </button>
                    {a?.open ? (<>
                      <div style={{ padding: "4px 20px 16px 62px", background: "#fff" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: "8px" }}>
                          {__list(a?.cells).map((c, $index) => (<React.Fragment key={$index}>
                              <div style={{ position: "relative" }}>
                                {c?.plainOn ? (<>
                                  <button type="button" onClick={c?.act} aria-pressed="true" aria-label={c?.aria} style={{ display: "flex", alignItems: "center", gap: "7px", width: "100%", height: "44px", border: "1px solid rgba(0,48,135,.18)", borderRadius: "8px", background: "rgba(0,48,135,.08)", padding: "0 10px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "600", letterSpacing: ".025em", textAlign: "left", cursor: "pointer", color: "#003087" }}>
                                    <__Icon name={c?.icon} strokeWidth="1.75" width="15" height="15" style={{ flex: "none" }} />
                                    <span style={{ flex: "1", minWidth: "0" }}>{c?.label}</span>
                                  </button>
                                </>) : null}
                                {c?.plainOff ? (<>
                                  <button className="dc-h669" type="button" onClick={c?.act} aria-pressed="false" aria-label={c?.aria} style={{ display: "flex", alignItems: "center", gap: "7px", width: "100%", height: "44px", border: "1px solid #e9eef5", borderRadius: "8px", background: "#f8fafc", padding: "0 10px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", letterSpacing: ".025em", textAlign: "left", cursor: "pointer", color: "#94a3b8" }}>
                                    <__Icon name={c?.icon} strokeWidth="1.75" width="15" height="15" style={{ flex: "none" }} />
                                    <span style={{ flex: "1", minWidth: "0" }}>{c?.label}</span>
                                  </button>
                                </>) : null}
                                {c?.ovOn ? (<>
                                  <button type="button" onClick={c?.act} aria-pressed="true" aria-label={c?.aria} style={{ display: "flex", alignItems: "center", gap: "7px", width: "100%", height: "44px", border: "1px solid #f4b740", borderRadius: "8px", background: "rgba(255,152,0,.1)", padding: "0 10px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "600", letterSpacing: ".025em", textAlign: "left", cursor: "pointer", color: "#9a3412" }}>
                                    <__Icon name={c?.icon} strokeWidth="1.75" width="15" height="15" style={{ flex: "none" }} />
                                    <span style={{ flex: "1", minWidth: "0" }}>{c?.label}</span>
                                    <span style={{ fontSize: "10px", fontWeight: "700", letterSpacing: ".06em", color: "#b45309" }}>{v.t?.override}</span>
                                  </button>
                                </>) : null}
                                {c?.ovOff ? (<>
                                  <button type="button" onClick={c?.act} aria-pressed="false" aria-label={c?.aria} style={{ display: "flex", alignItems: "center", gap: "7px", width: "100%", height: "44px", border: "1px solid #f4b740", borderRadius: "8px", background: "#fff7ed", padding: "0 10px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", letterSpacing: ".025em", textAlign: "left", cursor: "pointer", color: "#9a3412" }}>
                                    <__Icon name={c?.icon} strokeWidth="1.75" width="15" height="15" style={{ flex: "none" }} />
                                    <span style={{ flex: "1", minWidth: "0" }}>{c?.label}</span>
                                    <span style={{ fontSize: "10px", fontWeight: "700", letterSpacing: ".06em", color: "#b45309" }}>{v.t?.override}</span>
                                  </button>
                                </>) : null}
                                {c?.isOv ? (<>
                                  <button type="button" onClick={c?.reset} aria-label={c?.resetAria} title={c?.resetAria} style={{ position: "absolute", top: "-7px", right: "-7px", width: "22px", height: "22px", display: "grid", placeItems: "center", border: "1px solid #e2e8f0", borderRadius: "9999px", background: "#fff", color: "#b45309", cursor: "pointer", boxShadow: "0 1px 3px 0 rgba(48,46,56,.12)" }}>
                                    <__Icon name="rotate-ccw" strokeWidth="1.75" width="12" height="12" />
                                  </button>
                                </>) : null}
                              </div>
                            </React.Fragment>))}
                        </div>
                        <p style={{ margin: "10px 0 0", fontSize: "12px", lineHeight: "18px", color: "#94a3b8", textWrap: "pretty" }}>{a?.note}</p>
                      </div>
                    </>) : null}
                  </div>
                </React.Fragment>))}
            </section>
            <section style={{ display: "flex", flexDirection: "column", gap: "14px", borderRadius: "8px", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
              <h2 style={{ margin: "0", fontSize: "15px", lineHeight: "22px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>{v.t?.scopeTitle}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "10px" }}>
                {__list(v.scopes).map((s, $index) => (<React.Fragment key={$index}>
                    {s?.sel ? (<>
                      <button type="button" onClick={s?.act} aria-pressed="true" style={{ display: "flex", alignItems: "center", gap: "11px", border: "1px solid rgba(0,48,135,.22)", borderRadius: "8px", background: "rgba(0,48,135,.06)", padding: "12px 13px", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
                        <span style={{ display: "grid", placeItems: "center", width: "20px", height: "20px", flex: "none", border: "1px solid #003087", borderRadius: "6px", background: "#003087", color: "#fff" }}>
                          <__Icon name="check" strokeWidth="1.75" width="13" height="13" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>{s?.label}</span>
                          <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>{s?.meta}</span>
                        </span>
                      </button>
                    </>) : null}
                    {s?.unsel ? (<>
                      <button className="dc-h670" type="button" onClick={s?.act} aria-pressed="false" style={{ display: "flex", alignItems: "center", gap: "11px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "12px 13px", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
                        <span style={{ display: "grid", placeItems: "center", width: "20px", height: "20px", flex: "none", border: "1px solid #cbd5e1", borderRadius: "6px", background: "#fff", color: "#94a3b8" }}>
                          <__Icon name="minus" strokeWidth="1.75" width="13" height="13" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>{s?.label}</span>
                          <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>{s?.meta}</span>
                        </span>
                      </button>
                    </>) : null}
                  </React.Fragment>))}
              </div>
            </section>
            <section style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", borderRadius: "8px", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                <h2 style={{ margin: "0", fontSize: "15px", lineHeight: "22px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>{v.t?.visTitle}</h2>
                {__list(v.vis).map((v, $index) => (<React.Fragment key={$index}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ flex: "1", minWidth: "0" }}>
                        <p style={{ margin: "0", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>{v?.label}</p>
                        <p style={{ margin: "1px 0 0", fontSize: "12px", color: "#64748b", textWrap: "pretty" }}>{v?.help}</p>
                      </div>
                      <div role="group" aria-label={v?.label} style={{ display: "flex", alignItems: "center", gap: "2px", height: "34px", flex: "none", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", padding: "3px" }}>
                        {v?.offSel ? (<>
                          <button type="button" onClick={v?.setOff} aria-pressed="true" style={{ height: "26px", border: "none", borderRadius: "6px", padding: "0 10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "600", cursor: "pointer", background: "#fff", color: "#1e293b", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)" }}>{v?.offLabel}</button>
                        </>) : null}
                        {v?.offUnsel ? (<>
                          <button type="button" onClick={v?.setOff} aria-pressed="false" style={{ height: "26px", border: "none", borderRadius: "6px", padding: "0 10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer", background: "transparent", color: "#64748b" }}>{v?.offLabel}</button>
                        </>) : null}
                        {v?.onSel ? (<>
                          <button type="button" onClick={v?.setOn} aria-pressed="true" style={{ height: "26px", border: "none", borderRadius: "6px", padding: "0 10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "600", cursor: "pointer", background: "#fff", color: "#1e293b", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)" }}>{v?.onLabel}</button>
                        </>) : null}
                        {v?.onUnsel ? (<>
                          <button type="button" onClick={v?.setOn} aria-pressed="false" style={{ height: "26px", border: "none", borderRadius: "6px", padding: "0 10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer", background: "transparent", color: "#64748b" }}>{v?.onLabel}</button>
                        </>) : null}
                      </div>
                    </div>
                  </React.Fragment>))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", borderRadius: "8px", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                <h2 style={{ margin: "0", fontSize: "15px", lineHeight: "22px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>{v.t?.limitsTitle}</h2>
                {__list(v.limits).map((l, $index) => (<React.Fragment key={$index}>
                    <label style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>{l?.label}</span>
                        <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>{l?.help}</span>
                      </span>
                      <span className="dc-f671" style={{ display: "flex", alignItems: "center", height: "36px", flex: "none", width: "122px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 10px", gap: "6px" }}>
                        <span style={{ fontSize: "13px", color: "#64748b" }}>{l?.prefix}</span>
                        <input type="text" value={l?.value} onChange={l?.act} aria-label={l?.label} style={{ width: "100%", minWidth: "0", border: "none", outline: "none", background: "none", fontFamily: "inherit", fontSize: "13.5px", fontWeight: "600", color: "#1e293b", textAlign: "right", fontVariantNumeric: "tabular-nums" }} />
                        <span style={{ fontSize: "13px", color: "#64748b" }}>{l?.suffix}</span>
                      </span>
                    </label>
                  </React.Fragment>))}
              </div>
            </section>
            <section style={{ display: "flex", flexDirection: "column", gap: "14px", borderRadius: "8px", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
              <h2 style={{ margin: "0", fontSize: "15px", lineHeight: "22px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>{v.t?.securityTitle}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "14px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {__list(v.security).map((sw, $index) => (<React.Fragment key={$index}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ flex: "1", minWidth: "0" }}>
                          <p style={{ margin: "0", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>{sw?.label}</p>
                          <p style={{ margin: "1px 0 0", fontSize: "12px", color: "#64748b", textWrap: "pretty" }}>{sw?.help}</p>
                        </div>
                        {sw?.isOn ? (<>
                          <button type="button" onClick={sw?.act} role="switch" aria-checked="true" aria-label={sw?.label} style={{ position: "relative", width: "44px", height: "26px", flex: "none", border: "none", borderRadius: "9999px", cursor: "pointer", background: "#003087" }}>
                            <span style={{ position: "absolute", top: "3px", left: "21px", width: "20px", height: "20px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 3px 0 rgba(48,46,56,.3)", transition: "left .2s cubic-bezier(0,0,.2,1)" }} />
                          </button>
                        </>) : null}
                        {sw?.isOff ? (<>
                          <button type="button" onClick={sw?.act} role="switch" aria-checked="false" aria-label={sw?.label} style={{ position: "relative", width: "44px", height: "26px", flex: "none", border: "none", borderRadius: "9999px", cursor: "pointer", background: "#cbd5e1" }}>
                            <span style={{ position: "absolute", top: "3px", left: "3px", width: "20px", height: "20px", borderRadius: "9999px", background: "#fff", boxShadow: "0 1px 3px 0 rgba(48,46,56,.3)", transition: "left .2s cubic-bezier(0,0,.2,1)" }} />
                          </button>
                        </>) : null}
                      </div>
                    </React.Fragment>))}
                  <label style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ flex: "1", minWidth: "0" }}>
                      <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>{v.t?.sessionTimeout}</span>
                      <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>{v.t?.sessionHelp}</span>
                    </span>
                    <select className="dc-f672" onChange={v.setTimeout2} aria-label={v.t?.sessionTimeout} style={{ height: "36px", flex: "none", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 9px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", color: "#1e293b", cursor: "pointer" }}>
                      <option>{v.t?.min30}</option>
                      <option>{v.t?.hr2}</option>
                      <option>{v.t?.hr8}</option>
                      <option>{v.t?.shiftEnd}</option>
                    </select>
                  </label>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <p style={{ margin: "0", fontSize: "12px", fontWeight: "600", letterSpacing: ".025em", color: "#64748b" }}>{v.t?.trusted}</p>
                  {__list(v.devices).map((d, $index) => (<React.Fragment key={$index}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "8px", background: "#f8fafc", padding: "9px 11px" }}>
                        <__Icon name={d?.icon} strokeWidth="1.75" width="17" height="17" style={{ flex: "none", color: "#64748b" }} />
                        <div style={{ flex: "1", minWidth: "0" }}>
                          <p style={{ margin: "0", fontSize: "12.5px", fontWeight: "500", color: "#1e293b" }}>{d?.name}</p>
                          <p style={{ margin: "0", fontSize: "11.5px", color: "#94a3b8" }}>{d?.meta}</p>
                        </div>
                        {d?.live ? (<>
                          <button className="dc-h673" type="button" onClick={d?.act} style={{ height: "28px", flex: "none", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", color: "#c2410c", cursor: "pointer" }}>{d?.btn}</button>
                        </>) : null}
                        {d?.out ? (<>
                          <span style={{ display: "inline-flex", alignItems: "center", height: "28px", flex: "none", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", padding: "0 10px", fontSize: "12px", fontWeight: "500", color: "#94a3b8" }}>{d?.btn}</span>
                        </>) : null}
                      </div>
                    </React.Fragment>))}
                </div>
              </div>
            </section>
          </div>
          <aside style={{ display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "0" }}>
            <section style={{ display: "flex", flexDirection: "column", gap: "10px", borderRadius: "8px", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
              <h2 style={{ margin: "0", fontSize: "15px", lineHeight: "22px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>{v.t?.historyTitle}</h2>
              <ol style={{ margin: "0", padding: "0", listStyle: "none", display: "flex", flexDirection: "column", gap: "11px" }}>
                {__list(v.history).map((h, $index) => (<React.Fragment key={$index}>
                    <li style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
                      <span style={{ display: "grid", placeItems: "center", width: "26px", height: "26px", flex: "none", borderRadius: "8px", background: "#f1f5f9", color: "#475569" }}>
                        <__Icon name={h?.icon} strokeWidth="1.75" width="13" height="13" />
                      </span>
                      <div style={{ minWidth: "0" }}>
                        <p style={{ margin: "0", fontSize: "12.5px", fontWeight: "500", color: "#1e293b", textWrap: "pretty" }}>{h?.text}</p>
                        <p style={{ margin: "1px 0 0", fontSize: "11.5px", color: "#94a3b8" }}>{h?.when}</p>
                      </div>
                    </li>
                  </React.Fragment>))}
              </ol>
            </section>
          </aside>
        </div>
      </div>
    );
  }
}
