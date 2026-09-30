'use client';
// Generated from design/templates/staff-profile/StaffProfile.dc.html by scripts/convert-design.mjs.
// Staff profile (full) — One merchant-admin screen for a single staff member: identity, permissions, shift, attendance, leave, salary, activity and documents — with a live Bangla toggle and preview states.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import __StaffAccess from '@/screens/staff-profile/StaffAccess';
import __StaffActivity from '@/screens/staff-profile/StaffActivity';
import __StaffAttendance from '@/screens/staff-profile/StaffAttendance';
import __StaffCreate from '@/screens/staff-profile/StaffCreate';
import __StaffDocs from '@/screens/staff-profile/StaffDocs';
import __StaffLeave from '@/screens/staff-profile/StaffLeave';
import __StaffOverview from '@/screens/staff-profile/StaffOverview';
import __StaffSalary from '@/screens/staff-profile/StaffSalary';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  state = { lang: this.props.lang ?? 'en', tab: 'overview', status: this.props.status ?? 'active', salaryLocked: this.props.salaryLocked ?? false, hrAddon: this.props.hrAddon ?? true, emptyData: this.props.emptyData ?? false, role: 'Cashier', menuOpen: false, panelOpen: true, dialog: null, createOpen: false, toastText: '', overrides: {}, extraChanges: [], dataVis: { phone: 'masked', cost: 'hidden', salary: 'hidden' } };

  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 200); setTimeout(go, 700); setTimeout(go, 2000);
  }
  L(en, bn) { return this.state.lang === 'bn' ? bn : en; }
  toast(text) { this.setState({ toastText: text }); clearTimeout(this._tt); this._tt = setTimeout(() => this.setState({ toastText: '' }), 2600); }

  changeList() {
    const L = (en, bn) => this.L(en, bn);
    const out = Object.keys(this.state.overrides).map(k => {
      const v = this.state.overrides[k];
      return { key: k, label: v.label, detail: v.on ? L('Allowed — override on role', 'অনুমোদিত — রোল ওভাররাইড') : L('Blocked — override on role', 'বন্ধ — রোল ওভাররাইড'), isAllow: v.on, isBlock: !v.on };
    });
    return out.concat(this.state.extraChanges.map(c => ({ key: c.key, label: c.label, detail: c.detail, isEdit: true })));
  }

  dialogFor(key) {
    const L = (en, bn) => this.L(en, bn);
    const n = this.changeList().length;
    const map = {
      save: { title: L('Save ' + n + ' permission changes?', n + 'টি পরিবর্তন সংরক্ষণ করবেন?'), body: L('Sadia Akter takes these on her next page load. Sessions stay signed in.', 'সাদিয়া আক্তারের পরবর্তী লোডে এগুলো চালু হবে। সেশন সাইন-ইন থাকবে।'), icon: 'shield-check', chipNavy: true, verb: L('Save changes', 'সংরক্ষণ করুন'), verbIcon: 'check', verbNavy: true, hasList: true, hasConfirmField: false, act: () => { this.setState({ overrides: {}, extraChanges: [], dialog: null }); this.toast(L(n + ' changes saved', n + 'টি পরিবর্তন সংরক্ষিত')); } },
      suspend: { title: L('Suspend login for Sadia Akter?', 'সাদিয়ার লগইন স্থগিত করবেন?'), body: L('She is signed out of POS Dhanmondi-1 and the admin panel immediately and cannot sign back in. Attendance, leave and payroll records are kept.', 'তিনি সাথে সাথে POS ধানমন্ডি-১ ও অ্যাডমিন থেকে সাইন আউট হবেন এবং আর ঢুকতে পারবেন না। হাজিরা, ছুটি ও বেতনের রেকর্ড থাকবে।'), icon: 'user-x', chipDanger: true, verb: L('Suspend login', 'লগইন স্থগিত করুন'), verbIcon: 'user-x', verbDanger: true, hasList: false, hasConfirmField: false, act: () => { this.setState({ status: 'suspended', dialog: null, menuOpen: false }); this.toast(L('Login suspended', 'লগইন স্থগিত হয়েছে')); } },
      reactivate: { title: L('Reactivate Sadia Akter?', 'সাদিয়াকে পুনরায় সক্রিয় করবেন?'), body: L('Her previous role, branch scope and permission overrides are restored. She can sign in at the next shift.', 'তাঁর আগের রোল, শাখা ও অনুমতি ফিরে আসবে। পরের শিফটে সাইন ইন করতে পারবেন।'), icon: 'user-check', chipGood: true, verb: L('Reactivate staff', 'পুনরায় সক্রিয় করুন'), verbIcon: 'user-check', verbNavy: true, hasList: false, hasConfirmField: false, act: () => { this.setState({ status: 'active', dialog: null, menuOpen: false }); this.toast(L('Sadia Akter reactivated', 'সাদিয়া আক্তার সক্রিয়')); } },
      logout: { title: L('Force logout from all devices?', 'সব ডিভাইস থেকে সাইন আউট করাবেন?'), body: L('Ends 3 sessions: POS Dhanmondi-1, Chrome on Windows, GridCommerce app on Android. Her login stays active.', '৩টি সেশন বন্ধ হবে: POS ধানমন্ডি-১, উইন্ডোজ ক্রোম, অ্যান্ড্রয়েড অ্যাপ। লগইন সক্রিয় থাকবে।'), icon: 'log-out', chipWarn: true, verb: L('Force logout', 'সাইন আউট করান'), verbIcon: 'log-out', verbWarn: true, hasList: false, hasConfirmField: false, act: () => { this.setState({ dialog: null, menuOpen: false }); this.toast(L('3 sessions ended', '৩টি সেশন বন্ধ হয়েছে')); } },
      reset: { title: L('Send a password reset?', 'পাসওয়ার্ড রিসেট পাঠাবেন?'), body: L('A one-time link goes to +880 1712-XXXXXX by SMS and expires in 30 minutes.', 'একটি এককালীন লিংক +880 1712-XXXXXX নম্বরে SMS-এ যাবে, ৩০ মিনিটে শেষ হবে।'), icon: 'key-round', chipNavy: true, verb: L('Send reset link', 'লিংক পাঠান'), verbIcon: 'send', verbNavy: true, hasList: false, hasConfirmField: false, act: () => { this.setState({ dialog: null, menuOpen: false }); this.toast(L('Reset link sent by SMS', 'SMS-এ রিসেট লিংক পাঠানো হয়েছে')); } },
      offboard: { title: L('Offboard Sadia Akter?', 'সাদিয়াকে অফবোর্ড করবেন?'), body: L('Removes her access for good, closes the cash drawer assignment and starts final settlement. Type OFFBOARD to confirm.', 'তাঁর অ্যাক্সেস স্থায়ীভাবে বন্ধ হবে, ক্যাশ ড্রয়ার ছেড়ে দেবে এবং চূড়ান্ত হিসাব শুরু হবে। নিশ্চিত করতে OFFBOARD লিখুন।'), icon: 'user-minus', chipDanger: true, verb: L('Offboard staff', 'অফবোর্ড করুন'), verbIcon: 'user-minus', verbDanger: true, hasList: false, hasConfirmField: true, fieldLabel: L('Type OFFBOARD to confirm', 'নিশ্চিত করতে OFFBOARD লিখুন'), fieldPlaceholder: 'OFFBOARD', act: () => { this.setState({ dialog: null, menuOpen: false }); this.toast(L('Offboarding started', 'অফবোর্ডিং শুরু হয়েছে')); } },
      edit: { title: L('Edit profile', 'প্রোফাইল সম্পাদনা'), body: L('Name, designation, branch, employment type, phone and photo are edited in the staff form. Opening it keeps unsaved permission changes.', 'নাম, পদবি, শাখা, নিয়োগের ধরন, ফোন ও ছবি স্টাফ ফর্মে সম্পাদনা হয়। অসংরক্ষিত অনুমতি পরিবর্তন থাকবে।'), icon: 'pencil', chipNavy: true, verb: L('Open staff form', 'ফর্ম খুলুন'), verbIcon: 'arrow-right', verbNavy: true, hasList: false, hasConfirmField: false, act: () => this.setState({ dialog: null, createOpen: true }) },
      preview: { title: L('Preview the admin as Sadia?', 'সাদিয়া হিসেবে অ্যাডমিন দেখবেন?'), body: L('You see exactly what she sees, read-only, with a banner across the top. Nothing you click is recorded against her account.', 'তিনি যা দেখেন তাই দেখবেন, শুধু পড়ার জন্য, উপরে একটি ব্যানার থাকবে। কোনো ক্লিক তাঁর অ্যাকাউন্টে লেখা হবে না।'), icon: 'eye', chipSky: true, verb: L('Start preview', 'প্রিভিউ শুরু'), verbIcon: 'eye', verbNavy: true, hasList: false, hasConfirmField: false, act: () => { this.setState({ dialog: null, menuOpen: false }); this.toast(L('Previewing as Sadia Akter', 'সাদিয়া হিসেবে প্রিভিউ')); } }
    };
    return map[key] || null;
  }

  renderVals() {
    const s = this.state;
    const L = (en, bn) => this.L(en, bn);
    const suspended = s.status === 'suspended';
    const changes = this.changeList();
    const dirty = changes.length > 0;
    const tabDefs = [
      ['overview', L('Overview', 'সংক্ষিপ্ত'), 'layout-grid', false],
      ['access', L('Access and permissions', 'অ্যাক্সেস ও অনুমতি'), 'shield-check', false],
      ['attendance', L('Shift and attendance', 'শিফট ও হাজিরা'), 'clock', true],
      ['leave', L('Leave', 'ছুটি'), 'palmtree', true],
      ['salary', L('Salary and payroll', 'বেতন ও পে-রোল'), 'wallet', true],
      ['activity', L('Activity log', 'কার্যক্রম'), 'history', false],
      ['docs', L('Documents', 'কাগজপত্র'), 'file-text', false]
    ].filter(d => s.hrAddon || !d[3]);
    const tabs = tabDefs.map(([key, label, icon]) => ({
      key, label, icon,
      sel: s.tab === key, unsel: s.tab !== key,
      dot: key === 'access' && dirty,
      act: () => this.setState({ tab: key, menuOpen: false })
    }));
    const hidden = !s.hrAddon && (s.tab === 'attendance' || s.tab === 'leave' || s.tab === 'salary');
    const menuItems = [
      suspended
        ? { label: L('Reactivate staff', 'পুনরায় সক্রিয় করুন'), icon: 'user-check', good: true, act: () => this.setState({ dialog: 'reactivate' }) }
        : { label: L('Suspend login', 'লগইন স্থগিত করুন'), icon: 'user-x', danger: true, act: () => this.setState({ dialog: 'suspend' }) },
      { label: L('Force logout from all devices', 'সব ডিভাইস থেকে সাইন আউট'), icon: 'log-out', neutral: true, act: () => this.setState({ dialog: 'logout' }) },
      { label: L('Reset password', 'পাসওয়ার্ড রিসেট'), icon: 'key-round', neutral: true, act: () => this.setState({ dialog: 'reset' }) },
      { label: L('Preview admin as this person', 'এই ব্যক্তি হিসেবে দেখুন'), icon: 'eye', neutral: true, act: () => this.setState({ dialog: 'preview' }) },
      { label: L('Offboard', 'অফবোর্ড'), icon: 'user-minus', danger: true, act: () => this.setState({ dialog: 'offboard' }) }
    ];
    const pill = suspended
      ? { text: L('Suspended', 'স্থগিত'), icon: 'ban', bg: 'rgba(255,255,255,.16)', fg: '#fee2e2' }
      : { text: L('Active', 'সক্রিয়'), icon: 'check-circle-2', bg: 'rgba(16,185,129,.2)', fg: '#d1fae5' };
    const today = suspended
      ? { text: L('Not checked in · login suspended 15 Sep', 'চেক-ইন নেই · ১৫ সেপ্টেম্বর স্থগিত'), icon: 'minus-circle', bg: 'rgba(255,255,255,.1)', fg: '#e2e8f0' }
      : { text: L('Checked in 09:56 at POS Dhanmondi-1', 'চেক-ইন ০৯:৫৬ · POS ধানমন্ডি-১'), icon: 'log-in', bg: 'rgba(16,185,129,.18)', fg: '#d1fae5' };
    const demoRows = [
      { label: L('Status', 'স্ট্যাটাস'), value: suspended ? L('Suspended', 'স্থগিত') : L('Active', 'সক্রিয়'), icon: 'user-check', on: suspended, act: () => this.setState({ status: suspended ? 'active' : 'suspended' }) },
      { label: L('Salary card', 'বেতন কার্ড'), value: s.salaryLocked ? L('Locked', 'লকড') : L('Visible', 'দৃশ্যমান'), icon: 'lock', on: s.salaryLocked, act: () => this.setState({ salaryLocked: !s.salaryLocked }) },
      { label: L('HR and Payroll add-on', 'এইচআর অ্যাড-অন'), value: s.hrAddon ? L('On', 'চালু') : L('Off', 'বন্ধ'), icon: 'puzzle', on: !s.hrAddon, act: () => this.setState({ hrAddon: !s.hrAddon, tab: 'overview' }) },
      { label: L('Records', 'রেকর্ড'), value: s.emptyData ? L('Empty', 'খালি') : L('Populated', 'পূর্ণ'), icon: 'inbox', on: s.emptyData, act: () => this.setState({ emptyData: !s.emptyData }) },
      { label: L('Language', 'ভাষা'), value: s.lang === 'bn' ? 'বাংলা' : 'English', icon: 'languages', on: s.lang === 'bn', act: () => this.setState({ lang: s.lang === 'bn' ? 'en' : 'bn' }) },
      { label: L('Create staff flow', 'নতুন স্টাফ'), value: L('Open', 'খুলুন'), icon: 'user-plus', on: false, act: () => this.setState({ createOpen: true }) }
    ].map(d => Object.assign(d, { sel: !!d.on, unsel: !d.on }));
    const dlg = this.dialogFor(s.dialog);
    return {
      lang: s.lang, role: s.role, overrides: s.overrides, dataVis: s.dataVis,
      isEn: s.lang === 'en', isBn: s.lang === 'bn',
      setEn: () => this.setState({ lang: 'en' }), setBn: () => this.setState({ lang: 'bn' }),
      suspended: suspended, active: !suspended,
      pillText: pill.text, todayText: today.text,
      phoneText: s.dataVis.phone === 'visible' ? '+880 1712-660145' : '+880 1712-XXXXXX',
      phoneIcon: s.dataVis.phone === 'visible' ? 'eye' : 'eye-off',
      primaryLabel: suspended ? L('Reactivate', 'পুনরায় সক্রিয়') : L('Edit profile', 'প্রোফাইল সম্পাদনা'),
      openEdit: () => this.setState({ dialog: suspended ? 'reactivate' : 'edit' }),
      menuOpen: s.menuOpen, toggleMenu: () => this.setState({ menuOpen: !s.menuOpen }), menuItems,
      tabs,
      showOverview: s.tab === 'overview', showAccess: s.tab === 'access',
      showAttendance: s.tab === 'attendance' && s.hrAddon, showLeave: s.tab === 'leave' && s.hrAddon,
      showSalary: s.tab === 'salary' && s.hrAddon, showActivity: s.tab === 'activity', showDocs: s.tab === 'docs',
      showUpsell: hidden,
      salaryLocked: s.salaryLocked, emptyData: s.emptyData, hrAddon: s.hrAddon,
      goTab: (k) => this.setState({ tab: k }),
      toggleCell: (key, label, on) => {
        const o = Object.assign({}, s.overrides);
        if (o[key]) delete o[key]; else o[key] = { label, on };
        this.setState({ overrides: o });
      },
      resetCell: (key) => { const o = Object.assign({}, s.overrides); delete o[key]; this.setState({ overrides: o }); },
      setRole: (r) => this.setState({ role: r, extraChanges: s.extraChanges.filter(c => c.key !== 'role').concat([{ key: 'role', label: L('Role changed to ' + r, 'রোল বদলে ' + r), detail: L('Replaces the Cashier permission set', 'ক্যাশিয়ার সেট প্রতিস্থাপন করবে') }]) }),
      noteChange: (key, label, detail) => {
        const rest = s.extraChanges.filter(c => c.key !== key);
        this.setState({ extraChanges: rest.concat([{ key, label, detail }]) });
      },
      dirty, changes,
      dirtyHeadline: L(changes.length + ' unsaved change' + (changes.length === 1 ? '' : 's'), changes.length + 'টি অসংরক্ষিত পরিবর্তন'),
      dirtySummary: changes.map(c => c.label).join(' · '),
      discard: () => { this.setState({ overrides: {}, extraChanges: [] }); this.toast(L('Changes discarded', 'পরিবর্তন বাতিল')); },
      openSave: () => this.setState({ dialog: 'save' }),
      dialog: !!dlg, dlg: dlg || {}, closeDialog: () => this.setState({ dialog: null }), stop: (e) => e.stopPropagation(),
      createOpen: s.createOpen, closeCreate: () => this.setState({ createOpen: false }),
      toast: !!s.toastText, toastText: s.toastText,
      panelOpen: s.panelOpen, togglePanel: () => this.setState({ panelOpen: !s.panelOpen }),
      panelLabel: s.panelOpen ? L('Hide states', 'লুকান') : L('Preview states', 'প্রিভিউ স্টেট'),
      demoRows,
      t: {
        staff: L('Staff', 'স্টাফ'), name: L('Sadia Akter', 'সাদিয়া আক্তার'),
        designation: L('Cashier', 'ক্যাশিয়ার'), branch: L('Dhanmondi branch', 'ধানমন্ডি শাখা'),
        searchStaff: L('Search staff, roles…', 'স্টাফ, রোল খুঁজুন…'), owner: L('Owner', 'মালিক'),
        joined: L('Joined', 'যোগদান'), reportsTo: L('Reports to', 'রিপোর্ট করেন'), branchManager: L('Branch manager', 'শাখা ব্যবস্থাপক'),
        employment: L('Employment', 'নিয়োগ'), fullTime: L('Full time', 'পূর্ণকালীন'), phone: L('Phone', 'ফোন'),
        more: L('More', 'আরও'), discard: L('Discard', 'বাতিল'), saveChanges: L('Save changes', 'সংরক্ষণ করুন'), cancel: L('Cancel', 'বাতিল'),
        upsellTitle: L('HR and Payroll is off for this shop', 'এই দোকানে এইচআর ও পে-রোল বন্ধ'),
        upsellBody: L('Turn it on to set shifts, track check-ins from the POS, approve leave and run monthly payroll for all 14 staff. Access and permissions keep working without it.', 'শিফট ঠিক করা, POS থেকে হাজিরা, ছুটি অনুমোদন ও ১৪ জনের মাসিক পে-রোল চালাতে এটি চালু করুন। অ্যাক্সেস ও অনুমতি এটি ছাড়াই চলে।'),
        upsellCta: L('Add HR and Payroll', 'এইচআর যোগ করুন'), upsellSecondary: L('See what it includes', 'কী কী আছে দেখুন'),
        upsellMeta: L('৳900 per month · billed with your plan · cancel any time', '৳৯০০ প্রতি মাস · প্ল্যানের সাথে বিল · যেকোনো সময় বাতিল')
      }
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `html,body{height:100%;margin:0}*{box-sizing:border-box}:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:1px}@keyframes gcfade{from{opacity:0}to{opacity:1}}@keyframes gcpop{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}@keyframes gcrise{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.dc-h735:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-h736:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-h737:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-h738:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-h739:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-h740:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-h741:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-h742:hover{background:#002a77 !important}
.dc-h743:hover{background:#036049 !important}
.dc-h744:hover{background:rgba(255,255,255,.16) !important}
.dc-h745:hover{background:#f1f5f9 !important}
.dc-h746:hover{background:#fff7ed !important}
.dc-h747:hover{background:#ecfdf5 !important}
.dc-h748:hover{color:#fff !important}
.dc-h749:hover{background:#002a77 !important}
.dc-h750:hover{background:#f1f5f9 !important}
.dc-h751:hover{background:#f1f5f9 !important}
.dc-h752:hover{background:#002a77 !important}
.dc-h753:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-f754:focus,.dc-f754:focus-visible,.dc-f754:focus-within{border-color:#003087 !important}
.dc-h755:hover{background:#f1f5f9 !important}
.dc-h756:hover{background:#002a77 !important}
.dc-h757:hover{background:#9a3412 !important}
.dc-h758:hover{background:#92400e !important}
.dc-h759:hover{background:rgba(255,255,255,.08) !important}`;

// ---- markup ----

export default class StaffProfileScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="StaffProfile">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ position: "relative", width: "100%", minWidth: "1240px", height: "100vh", overflow: "hidden", display: "flex", background: "#f8fafc", fontFamily: "Poppins,'Hind Siliguri',ui-sans-serif,system-ui,sans-serif", color: "#475569" }}>
          <nav aria-label="Admin sections" style={{ width: "68px", flex: "none", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", padding: "10px 0 12px", borderRight: "1px solid #e2e8f0", background: "#fff" }}>
            <__Link href="/site-map" title="GridCommerce" style={{ display: "grid", placeItems: "center", width: "38px", height: "38px", flex: "none", borderRadius: "10px", background: "#003087", fontSize: "16px", fontWeight: "600", color: "#fff", textDecoration: "none" }}>G</__Link>
            <span style={{ height: "10px", flex: "none" }} />
            <__Link className="dc-h735" href="/merchant-overview" title="Dashboard" style={{ width: "44px", height: "42px", flex: "none", display: "grid", placeItems: "center", borderRadius: "10px", textDecoration: "none", color: "#64748b" }}>
              <__Icon name="layout-dashboard" strokeWidth="1.75" width="19" height="19" />
            </__Link>
            <__Link className="dc-h736" href="/merchant-orders" title="Orders" style={{ width: "44px", height: "42px", flex: "none", display: "grid", placeItems: "center", borderRadius: "10px", textDecoration: "none", color: "#64748b" }}>
              <__Icon name="shopping-cart" strokeWidth="1.75" width="19" height="19" />
            </__Link>
            <__Link className="dc-h737" href="/pos-register" title="POS register" style={{ width: "44px", height: "42px", flex: "none", display: "grid", placeItems: "center", borderRadius: "10px", textDecoration: "none", color: "#64748b" }}>
              <__Icon name="scan-line" strokeWidth="1.75" width="19" height="19" />
            </__Link>
            <__Link className="dc-h738" href="/all-products" title="Products and stock" style={{ width: "44px", height: "42px", flex: "none", display: "grid", placeItems: "center", borderRadius: "10px", textDecoration: "none", color: "#64748b" }}>
              <__Icon name="package" strokeWidth="1.75" width="19" height="19" />
            </__Link>
            <__Link href="/hr-dashboard" aria-current="page" title="Staff and payroll" style={{ position: "relative", width: "44px", height: "42px", flex: "none", display: "grid", placeItems: "center", borderRadius: "10px", textDecoration: "none", background: "rgba(0,48,135,.1)", color: "#003087" }}>
              <__Icon name="users" strokeWidth="1.75" width="19" height="19" />
              <span style={{ position: "absolute", left: "-12px", top: "9px", width: "3px", height: "24px", borderRadius: "0 3px 3px 0", background: "#003087" }} />
            </__Link>
            <a className="dc-h739" href="#" title="Reports" style={{ width: "44px", height: "42px", flex: "none", display: "grid", placeItems: "center", borderRadius: "10px", textDecoration: "none", color: "#64748b" }}>
              <__Icon name="bar-chart-3" strokeWidth="1.75" width="19" height="19" />
            </a>
            <__Link className="dc-h740" href="/settings-console" title="Settings" style={{ width: "44px", height: "42px", flex: "none", display: "grid", placeItems: "center", borderRadius: "10px", textDecoration: "none", color: "#64748b" }}>
              <__Icon name="settings" strokeWidth="1.75" width="19" height="19" />
            </__Link>
            <span style={{ flex: "1" }} />
            <a className="dc-h741" href="#" title="Help" style={{ width: "44px", height: "42px", flex: "none", display: "grid", placeItems: "center", borderRadius: "10px", textDecoration: "none", color: "#94a3b8" }}>
              <__Icon name="life-buoy" strokeWidth="1.75" width="19" height="19" />
            </a>
          </nav>
          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb={`${v.t?.staff ?? ""}`} page={`${v.t?.name ?? ""}`} height="56" placeholder={`${v.t?.searchStaff ?? ""}`} />
            <div style={{ flex: "1", minHeight: "0", overflow: "auto" }}>
              <div style={{ padding: "22px 26px 26px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <section aria-label="Staff identity" style={{ position: "relative", borderRadius: "8px", overflow: "hidden", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", background: "#012169" }}>
                  {v.suspended ? (<>
                    <span aria-hidden="true" style={{ position: "absolute", inset: "0", background: "#475569" }} />
                  </>) : null}
                  <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: "20px", padding: "22px 24px 20px" }}>
                    <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: "78px", height: "78px", flex: "none", borderRadius: "9999px", background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.22)", fontSize: "26px", fontWeight: "600", letterSpacing: ".02em", color: "#fff" }}>SA</span>
                    <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <h1 style={{ margin: "0", fontSize: "24px", lineHeight: "30px", fontWeight: "700", letterSpacing: "-.025em", color: "#fff" }}>{v.t?.name}</h1>
                        {v.active ? (<>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", borderRadius: "9999px", padding: "0 10px", fontSize: "12px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(16,185,129,.2)", color: "#d1fae5" }}><__Icon name="check-circle-2" strokeWidth="1.75" width="13" height="13" />{v.pillText}</span>
                        </>) : null}
                        {v.suspended ? (<>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", borderRadius: "9999px", padding: "0 10px", fontSize: "12px", fontWeight: "600", letterSpacing: ".02em", background: "rgba(255,255,255,.18)", color: "#fee2e2" }}><__Icon name="ban" strokeWidth="1.75" width="13" height="13" />{v.pillText}</span>
                        </>) : null}
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", borderRadius: "9999px", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.16)", padding: "0 10px", fontSize: "12px", fontWeight: "500", color: "#dbeafe" }}><__Icon name="hash" strokeWidth="1.75" width="12" height="12" />EMP-0142</span>
                      </div>
                      <p style={{ margin: "0", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#cfe4ff" }}>{v.t?.designation} · {v.t?.branch}</p>
                      {v.active ? (<>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "fit-content", borderRadius: "8px", background: "rgba(16,185,129,.18)", padding: "0 12px", fontSize: "13px", fontWeight: "500", color: "#d1fae5" }}>
                          <__Icon name="log-in" strokeWidth="1.75" width="15" height="15" />
                          <span>{v.todayText}</span>
                        </div>
                      </>) : null}
                      {v.suspended ? (<>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "34px", width: "fit-content", borderRadius: "8px", background: "rgba(255,255,255,.1)", padding: "0 12px", fontSize: "13px", fontWeight: "500", color: "#e2e8f0" }}>
                          <__Icon name="minus-circle" strokeWidth="1.75" width="15" height="15" />
                          <span>{v.todayText}</span>
                        </div>
                      </>) : null}
                      <dl style={{ margin: "0", display: "flex", alignItems: "center", gap: "22px", flexWrap: "wrap", fontSize: "12.5px", color: "#a9c6ea" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <dt style={{ margin: "0" }}>{v.t?.joined}</dt>
                          <dd style={{ margin: "0", fontWeight: "500", color: "#fff" }}>02 Mar 2026</dd>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <dt style={{ margin: "0" }}>{v.t?.reportsTo}</dt>
                          <dd style={{ margin: "0", fontWeight: "500", color: "#fff" }}>Nusrat Jahan · {v.t?.branchManager}</dd>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <dt style={{ margin: "0" }}>{v.t?.employment}</dt>
                          <dd style={{ margin: "0", fontWeight: "500", color: "#fff" }}>{v.t?.fullTime}</dd>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <dt style={{ margin: "0" }}>{v.t?.phone}</dt>
                          <dd style={{ margin: "0", display: "flex", alignItems: "center", gap: "6px", fontWeight: "500", color: "#fff" }}>
                            <span>{v.phoneText}</span>
                            <__Icon name={v.phoneIcon} strokeWidth="1.75" width="13" height="13" style={{ color: "#a9c6ea" }} />
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                      {v.active ? (<>
                        <button className="dc-h742" type="button" onClick={v.openEdit} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", border: "none", borderRadius: "8px", background: "#003087", padding: "0 15px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer" }}><__Icon name="pencil" strokeWidth="1.75" width="16" height="16" />{v.primaryLabel}</button>
                      </>) : null}
                      {v.suspended ? (<>
                        <button className="dc-h743" type="button" onClick={v.openEdit} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", border: "none", borderRadius: "8px", background: "#047857", padding: "0 15px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer" }}><__Icon name="user-check" strokeWidth="1.75" width="16" height="16" />{v.primaryLabel}</button>
                      </>) : null}
                      <div style={{ position: "relative" }}>
                        <button className="dc-h744" type="button" onClick={v.toggleMenu} aria-haspopup="menu" aria-expanded={v.menuOpen} style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "36px", border: "1px solid rgba(255,255,255,.3)", borderRadius: "8px", background: "rgba(255,255,255,.08)", padding: "0 12px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer" }}>{v.t?.more}<__Icon name="chevron-down" strokeWidth="1.75" width="15" height="15" /></button>
                        {v.menuOpen ? (<>
                          <div role="menu" aria-label="More staff actions" style={{ position: "absolute", top: "42px", right: "0", zIndex: "120", width: "268px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "6px", boxShadow: "0 10px 30px -8px rgba(15,23,42,.35)", animation: "gcrise .18s ease-out" }}>
                            {__list(v.menuItems).map((m, $index) => (<React.Fragment key={$index}>
                                {m?.neutral ? (<>
                                  <button className="dc-h745" type="button" role="menuitem" onClick={m?.act} style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", height: "36px", border: "none", borderRadius: "6px", background: "none", padding: "0 10px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", textAlign: "left", cursor: "pointer", color: "#475569" }}><__Icon name={m?.icon} strokeWidth="1.75" width="16" height="16" />{m?.label}</button>
                                </>) : null}
                                {m?.danger ? (<>
                                  <button className="dc-h746" type="button" role="menuitem" onClick={m?.act} style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", height: "36px", border: "none", borderRadius: "6px", background: "none", padding: "0 10px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", textAlign: "left", cursor: "pointer", color: "#c2410c" }}><__Icon name={m?.icon} strokeWidth="1.75" width="16" height="16" />{m?.label}</button>
                                </>) : null}
                                {m?.good ? (<>
                                  <button className="dc-h747" type="button" role="menuitem" onClick={m?.act} style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", height: "36px", border: "none", borderRadius: "6px", background: "none", padding: "0 10px", fontFamily: "inherit", fontSize: "13px", fontWeight: "500", textAlign: "left", cursor: "pointer", color: "#047857" }}><__Icon name={m?.icon} strokeWidth="1.75" width="16" height="16" />{m?.label}</button>
                                </>) : null}
                              </React.Fragment>))}
                          </div>
                        </>) : null}
                      </div>
                    </div>
                  </div>
                  <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "2px", padding: "0 14px", background: "rgba(255,255,255,.06)", borderTop: "1px solid rgba(255,255,255,.1)", overflow: "auto" }}>
                    {__list(v.tabs).map((tb, $index) => (<React.Fragment key={$index}>
                        {tb?.sel ? (<>
                          <button type="button" onClick={tb?.act} aria-current="page" style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "7px", height: "46px", flex: "none", border: "none", background: "none", padding: "0 14px", fontFamily: "inherit", fontSize: "13.5px", fontWeight: "600", letterSpacing: ".025em", cursor: "pointer", color: "#fff", boxShadow: "inset 0 -2px 0 0 #009CDE" }}><__Icon name={tb?.icon} strokeWidth="1.75" width="15" height="15" />{tb?.label}{tb?.dot ? (<>
  <span style={{ width: "6px", height: "6px", borderRadius: "9999px", background: "#ff9800" }} />
</>) : null}</button>
                        </>) : null}
                        {tb?.unsel ? (<>
                          <button className="dc-h748" type="button" onClick={tb?.act} aria-current="false" style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "7px", height: "46px", flex: "none", border: "none", background: "none", padding: "0 14px", fontFamily: "inherit", fontSize: "13.5px", fontWeight: "500", letterSpacing: ".025em", cursor: "pointer", color: "#a9c6ea" }}><__Icon name={tb?.icon} strokeWidth="1.75" width="15" height="15" />{tb?.label}{tb?.dot ? (<>
  <span style={{ width: "6px", height: "6px", borderRadius: "9999px", background: "#ff9800" }} />
</>) : null}</button>
                        </>) : null}
                      </React.Fragment>))}
                  </div>
                </section>
                {v.showOverview ? (<>
                  <div data-dc-import="StaffOverview" style={{ width: "100%" }}><__StaffOverview lang={v.lang} locked={v.salaryLocked} empty={v.emptyData} hr={v.hrAddon} goTab={v.goTab} /></div>
                </>) : null}
                {v.showAccess ? (<>
                  <div data-dc-import="StaffAccess" style={{ width: "100%" }}><__StaffAccess lang={v.lang} role={v.role} overrides={v.overrides} onToggle={v.toggleCell} onReset={v.resetCell} onRole={v.setRole} onChange={v.noteChange} dataVis={v.dataVis} /></div>
                </>) : null}
                {v.showAttendance ? (<>
                  <div data-dc-import="StaffAttendance" style={{ width: "100%" }}><__StaffAttendance lang={v.lang} empty={v.emptyData} /></div>
                </>) : null}
                {v.showLeave ? (<>
                  <div data-dc-import="StaffLeave" style={{ width: "100%" }}><__StaffLeave lang={v.lang} empty={v.emptyData} /></div>
                </>) : null}
                {v.showSalary ? (<>
                  <div data-dc-import="StaffSalary" style={{ width: "100%" }}><__StaffSalary lang={v.lang} locked={v.salaryLocked} /></div>
                </>) : null}
                {v.showActivity ? (<>
                  <div data-dc-import="StaffActivity" style={{ width: "100%" }}><__StaffActivity lang={v.lang} /></div>
                </>) : null}
                {v.showDocs ? (<>
                  <div data-dc-import="StaffDocs" style={{ width: "100%" }}><__StaffDocs lang={v.lang} /></div>
                </>) : null}
                {v.showUpsell ? (<>
                  <div style={{ display: "grid", placeItems: "center", padding: "34px 0" }}>
                    <div style={{ maxWidth: "520px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", borderRadius: "8px", background: "#fff", padding: "32px", textAlign: "center", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                      <span style={{ display: "grid", placeItems: "center", width: "54px", height: "54px", borderRadius: "16px", background: "rgba(0,156,222,.12)", color: "#0089c3" }}>
                        <__Icon name="calendar-clock" strokeWidth="1.75" width="26" height="26" />
                      </span>
                      <h2 style={{ margin: "0", fontSize: "18px", fontWeight: "600", letterSpacing: "-.01em", color: "#1e293b" }}>{v.t?.upsellTitle}</h2>
                      <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "20px", color: "#64748b", textWrap: "pretty" }}>{v.t?.upsellBody}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button className="dc-h749" type="button" style={{ height: "36px", border: "none", borderRadius: "8px", background: "#003087", padding: "0 15px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer" }}>{v.t?.upsellCta}</button>
                        <button className="dc-h750" type="button" style={{ height: "36px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 15px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#475569", cursor: "pointer" }}>{v.t?.upsellSecondary}</button>
                      </div>
                      <p style={{ margin: "0", fontSize: "12px", color: "#94a3b8" }}>{v.t?.upsellMeta}</p>
                    </div>
                  </div>
                </>) : null}
              </div>
            </div>
            {v.dirty ? (<>
              <div role="region" aria-label="Unsaved changes" style={{ flex: "none", display: "flex", alignItems: "center", gap: "14px", height: "64px", padding: "0 26px", borderTop: "1px solid #e2e8f0", background: "#fff", boxShadow: "0 -8px 22px -14px rgba(15,23,42,.25)" }}>
                <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "8px", background: "rgba(255,152,0,.12)", color: "#b45309" }}>
                  <__Icon name="alert-circle" strokeWidth="1.75" width="18" height="18" />
                </span>
                <div style={{ flex: "1", minWidth: "0" }}>
                  <p style={{ margin: "0", fontSize: "13.5px", fontWeight: "600", color: "#1e293b" }}>{v.dirtyHeadline}</p>
                  <p style={{ margin: "0", fontSize: "12.5px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.dirtySummary}</p>
                </div>
                <button className="dc-h751" type="button" onClick={v.discard} style={{ height: "36px", flex: "none", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 15px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#475569", cursor: "pointer" }}>{v.t?.discard}</button>
                <button className="dc-h752" type="button" onClick={v.openSave} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", flex: "none", border: "none", borderRadius: "8px", background: "#003087", padding: "0 16px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer" }}><__Icon name="check" strokeWidth="1.75" width="16" height="16" />{v.t?.saveChanges}</button>
              </div>
            </>) : null}
          </div>
          {v.toast ? (<>
            <div role="status" style={{ position: "fixed", right: "22px", bottom: "22px", zIndex: "250", display: "flex", alignItems: "center", gap: "10px", maxWidth: "360px", borderRadius: "8px", background: "#fff", padding: "12px 14px", boxShadow: "0 14px 34px -10px rgba(15,23,42,.4)", animation: "gcrise .2s ease-out" }}>
              <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "8px", background: "rgba(16,185,129,.12)", color: "#047857" }}>
                <__Icon name="check" strokeWidth="1.75" width="16" height="16" />
              </span>
              <p style={{ margin: "0", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>{v.toastText}</p>
            </div>
          </>) : null}
          {v.dialog ? (<>
            <div role="presentation" onClick={v.closeDialog} style={{ position: "fixed", inset: "0", zIndex: "200", display: "grid", placeItems: "center", background: "rgba(15,23,42,.6)", padding: "24px", animation: "gcfade .16s ease-out" }}>
              <div role="dialog" aria-modal="true" aria-label={v.dlg?.title} onClick={v.stop} style={{ width: "100%", maxWidth: "520px", maxHeight: "82vh", overflow: "auto", borderRadius: "8px", background: "#fff", boxShadow: "0 26px 60px -20px rgba(15,23,42,.5)", animation: "gcpop .18s cubic-bezier(0,0,.2,1)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "20px 22px 0" }}>
                  {v.dlg?.chipNavy ? (<>
                    <span style={{ display: "grid", placeItems: "center", width: "38px", height: "38px", flex: "none", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                      <__Icon name={v.dlg?.icon} strokeWidth="1.75" width="20" height="20" />
                    </span>
                  </>) : null}
                  {v.dlg?.chipDanger ? (<>
                    <span style={{ display: "grid", placeItems: "center", width: "38px", height: "38px", flex: "none", borderRadius: "8px", background: "rgba(255,87,36,.12)", color: "#c2410c" }}>
                      <__Icon name={v.dlg?.icon} strokeWidth="1.75" width="20" height="20" />
                    </span>
                  </>) : null}
                  {v.dlg?.chipWarn ? (<>
                    <span style={{ display: "grid", placeItems: "center", width: "38px", height: "38px", flex: "none", borderRadius: "8px", background: "rgba(255,152,0,.14)", color: "#b45309" }}>
                      <__Icon name={v.dlg?.icon} strokeWidth="1.75" width="20" height="20" />
                    </span>
                  </>) : null}
                  {v.dlg?.chipGood ? (<>
                    <span style={{ display: "grid", placeItems: "center", width: "38px", height: "38px", flex: "none", borderRadius: "8px", background: "rgba(16,185,129,.12)", color: "#047857" }}>
                      <__Icon name={v.dlg?.icon} strokeWidth="1.75" width="20" height="20" />
                    </span>
                  </>) : null}
                  {v.dlg?.chipSky ? (<>
                    <span style={{ display: "grid", placeItems: "center", width: "38px", height: "38px", flex: "none", borderRadius: "8px", background: "rgba(0,156,222,.12)", color: "#0089c3" }}>
                      <__Icon name={v.dlg?.icon} strokeWidth="1.75" width="20" height="20" />
                    </span>
                  </>) : null}
                  <div style={{ flex: "1", minWidth: "0" }}>
                    <h2 style={{ margin: "0", fontSize: "16px", fontWeight: "600", letterSpacing: "-.01em", color: "#1e293b" }}>{v.dlg?.title}</h2>
                    <p style={{ margin: "4px 0 0", fontSize: "13px", lineHeight: "19px", color: "#64748b", textWrap: "pretty" }}>{v.dlg?.body}</p>
                  </div>
                  <button className="dc-h753" type="button" onClick={v.closeDialog} aria-label="Close" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "8px", background: "none", color: "#94a3b8", cursor: "pointer" }}>
                    <__Icon name="x" strokeWidth="1.75" width="17" height="17" />
                  </button>
                </div>
                {v.dlg?.hasList ? (<>
                  <ul style={{ margin: "16px 22px 0", padding: "0", listStyle: "none", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                    {__list(v.changes).map((c, $index) => (<React.Fragment key={$index}>
                        <li style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "11px 14px", borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
                          {c?.isAllow ? (<>
                            <__Icon name="plus-circle" strokeWidth="1.75" width="15" height="15" style={{ marginTop: "2px", flex: "none", color: "#047857" }} />
                          </>) : null}
                          {c?.isBlock ? (<>
                            <__Icon name="minus-circle" strokeWidth="1.75" width="15" height="15" style={{ marginTop: "2px", flex: "none", color: "#c2410c" }} />
                          </>) : null}
                          {c?.isEdit ? (<>
                            <__Icon name="pencil" strokeWidth="1.75" width="15" height="15" style={{ marginTop: "2px", flex: "none", color: "#003087" }} />
                          </>) : null}
                          <div style={{ minWidth: "0" }}>
                            <p style={{ margin: "0", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>{c?.label}</p>
                            <p style={{ margin: "1px 0 0", fontSize: "12px", color: "#64748b" }}>{c?.detail}</p>
                          </div>
                        </li>
                      </React.Fragment>))}
                  </ul>
                </>) : null}
                {v.dlg?.hasConfirmField ? (<>
                  <label style={{ display: "block", margin: "16px 22px 0" }}>
                    <span style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "500", letterSpacing: ".025em", color: "#64748b" }}>{v.dlg?.fieldLabel}</span>
                    {" "}
                    <input className="dc-f754" type="text" placeholder={v.dlg?.fieldPlaceholder} style={{ width: "100%", height: "36px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontFamily: "inherit", fontSize: "13.5px", color: "#1e293b" }} />
                  </label>
                </>) : null}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", marginTop: "20px", padding: "14px 22px", borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
                  <button className="dc-h755" type="button" onClick={v.closeDialog} style={{ height: "36px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 15px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#475569", cursor: "pointer" }}>{v.t?.cancel}</button>
                  {v.dlg?.verbNavy ? (<>
                    <button className="dc-h756" type="button" onClick={v.dlg?.act} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", border: "none", borderRadius: "8px", padding: "0 16px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer", background: "#003087" }}><__Icon name={v.dlg?.verbIcon} strokeWidth="1.75" width="16" height="16" />{v.dlg?.verb}</button>
                  </>) : null}
                  {v.dlg?.verbDanger ? (<>
                    <button className="dc-h757" type="button" onClick={v.dlg?.act} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", border: "none", borderRadius: "8px", padding: "0 16px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer", background: "#c2410c" }}><__Icon name={v.dlg?.verbIcon} strokeWidth="1.75" width="16" height="16" />{v.dlg?.verb}</button>
                  </>) : null}
                  {v.dlg?.verbWarn ? (<>
                    <button className="dc-h758" type="button" onClick={v.dlg?.act} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", border: "none", borderRadius: "8px", padding: "0 16px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer", background: "#b45309" }}><__Icon name={v.dlg?.verbIcon} strokeWidth="1.75" width="16" height="16" />{v.dlg?.verb}</button>
                  </>) : null}
                </div>
              </div>
            </div>
          </>) : null}
          {v.createOpen ? (<>
            <div style={{ position: "fixed", inset: "0", zIndex: "210", background: "#f8fafc", animation: "gcfade .16s ease-out", overflow: "auto" }}>
              <div data-dc-import="StaffCreate" style={{ width: "100%", minHeight: "100vh" }}><__StaffCreate lang={v.lang} onClose={v.closeCreate} /></div>
            </div>
          </>) : null}
          <div style={{ position: "fixed", top: "76px", right: "14px", zIndex: "9998", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
            <button type="button" onClick={v.togglePanel} aria-expanded={v.panelOpen} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "30px", border: "none", borderRadius: "9999px", background: "rgba(15,23,42,.9)", padding: "0 12px", fontFamily: "inherit", fontSize: "11.5px", fontWeight: "500", letterSpacing: ".02em", color: "#e2e8f0", cursor: "pointer", boxShadow: "0 10px 26px -12px rgba(15,23,42,.6)" }}><__Icon name="sliders-horizontal" strokeWidth="1.75" width="13" height="13" />{v.panelLabel}</button>
            {v.panelOpen ? (<>
              <div style={{ width: "250px", borderRadius: "10px", background: "rgba(15,23,42,.94)", padding: "10px", boxShadow: "0 16px 40px -14px rgba(15,23,42,.7)", WebkitBackdropFilter: "blur(6px)", backdropFilter: "blur(6px)", animation: "gcrise .18s ease-out" }}>
                <p style={{ margin: "0 0 8px", padding: "0 4px", fontSize: "10.5px", fontWeight: "600", letterSpacing: ".14em", textTransform: "uppercase", color: "#94a3b8" }}>Preview state</p>
                {__list(v.demoRows).map((d, $index) => (<React.Fragment key={$index}>
                    {d?.sel ? (<>
                      <button type="button" onClick={d?.act} aria-pressed="true" style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", height: "32px", border: "none", borderRadius: "7px", background: "rgba(0,156,222,.22)", padding: "0 8px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", textAlign: "left", color: "#e0f2fe", cursor: "pointer", marginBottom: "2px" }}>
                        <__Icon name={d?.icon} strokeWidth="1.75" width="14" height="14" />
                        <span style={{ flex: "1" }}>{d?.label}</span>
                        <span style={{ fontSize: "10.5px", letterSpacing: ".04em", opacity: ".8" }}>{d?.value}</span>
                      </button>
                    </>) : null}
                    {d?.unsel ? (<>
                      <button className="dc-h759" type="button" onClick={d?.act} aria-pressed="false" style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", height: "32px", border: "none", borderRadius: "7px", background: "transparent", padding: "0 8px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", textAlign: "left", color: "#cbd5e1", cursor: "pointer", marginBottom: "2px" }}>
                        <__Icon name={d?.icon} strokeWidth="1.75" width="14" height="14" />
                        <span style={{ flex: "1" }}>{d?.label}</span>
                        <span style={{ fontSize: "10.5px", letterSpacing: ".04em", opacity: ".8" }}>{d?.value}</span>
                      </button>
                    </>) : null}
                  </React.Fragment>))}
              </div>
            </>) : null}
          </div>
        </div>
      </div>
    );
  }
}
