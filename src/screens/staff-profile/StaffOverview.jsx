'use client';
// Generated from design/templates/staff-profile/StaffOverview.dc.html by scripts/convert-design.mjs.
// Profile · overview
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  state = { req: 'open' };
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 200); setTimeout(go, 700); setTimeout(go, 2000);
  }
  renderVals() {
    const bn = (this.props.lang ?? 'en') === 'bn';
    const L = (en, b) => bn ? b : en;
    const empty = !!this.props.empty;
    const locked = !!this.props.locked;
    const go = this.props.goTab || (() => {});
    const req = this.state.req;
    return {
      t: {
        accessTitle: L('Access summary', 'অ্যাক্সেস সংক্ষেপ'), manage: L('Manage', 'পরিচালনা'),
        role: L('Role', 'রোল'), cashier: L('Cashier', 'ক্যাশিয়ার'), branchScope: L('Branch scope', 'শাখা'), oneBranch: L('Dhanmondi only', 'শুধু ধানমন্ডি'),
        twoFactor: L('Two-factor', 'দুই স্তর'), on: L('On', 'চালু'), overrides: L('Overrides', 'ওভাররাইড'), twoOverrides: L('2 on role', 'রোলে ২টি'),
        shiftToday: L('Shift today', 'আজকের শিফট'), morning: L('Morning shift', 'সকালের শিফট'),
        grace: L('Grace time', 'গ্রেস সময়'), tenMin: L('10 minutes', '১০ মিনিট'), weeklyOff: L('Weekly off', 'সাপ্তাহিক ছুটি'), friday: L('Friday', 'শুক্রবার'),
        checkInMethod: L('Check-in method', 'চেক-ইন পদ্ধতি'), posPin: L('POS PIN', 'POS পিন'), breakTime: L('Break', 'বিরতি'), changeShift: L('Change shift', 'শিফট বদলান'),
        attTitle: L('This month\u2019s attendance', 'এ মাসের হাজিরা'),
        present: L('Present', 'উপস্থিত'), late: L('Late', 'দেরি'), absent: L('Absent', 'অনুপস্থিত'), leaveWord: L('Leave', 'ছুটি'),
        overtimeHours: L('Overtime hours', 'ওভারটাইম'), weeklyOffWord: L('Weekly off', 'সাপ্তাহিক ছুটি'),
        leaveTitle: L('Leave balance', 'ছুটির ব্যালেন্স'), pending: L('PENDING REQUESTS', 'অপেক্ষমাণ আবেদন'), approve: L('Approve', 'অনুমোদন'), reject: L('Reject', 'নাকচ'),
        approved: L('Approved', 'অনুমোদিত'), rejected: L('Rejected', 'নাকচ'),
        casual: L('Casual', 'নৈমিত্তিক'), casualLeft: L('6 of 10 left', '১০-এর মধ্যে ৬ বাকি'),
        sick: L('Sick', 'অসুস্থতা'), sickLeft: L('12 of 14 left', '১৪-এর মধ্যে ১২ বাকি'),
        annual: L('Annual', 'বার্ষিক'), annualLeft: L('12 of 12 left', '১২-এর মধ্যে ১২ বাকি'),
        reqDates: L('24 – 25 Sep 2026 · Casual · 2 days', '২৪ – ২৫ সেপ ২০২৬ · নৈমিত্তিক · ২ দিন'),
        reqDetail: L('Family wedding in Cumilla. Applied 11 Sep. Nusrat Jahan is the approver.', 'কুমিল্লায় পারিবারিক বিয়ে। ১১ সেপ আবেদন। অনুমোদনকারী নুসরাত জাহান।'),
        emptyLeave: L('No leave requests. Sadia has not applied for leave this year — apply on her behalf from the Leave tab.', 'কোনো ছুটির আবেদন নেই। এ বছর সাদিয়া ছুটির আবেদন করেননি — ছুটি ট্যাব থেকে তাঁর পক্ষে আবেদন করুন।'),
        emptyAttTitle: L('No attendance recorded yet', 'এখনো হাজিরা নেই'),
        emptyAttBody: L('Check-ins appear here once Sadia has a shift assigned and signs in at the POS register.', 'সাদিয়ার শিফট নির্ধারিত হয়ে POS-এ সাইন ইন করলেই চেক-ইন এখানে দেখাবে।'),
        assignShift: L('Assign a shift', 'শিফট নির্ধারণ'),
        salaryTitle: L('Salary snapshot', 'বেতন সংক্ষেপ'), restricted: L('Restricted', 'সীমাবদ্ধ'),
        gross: L('Gross monthly', 'মাসিক গ্রস'), net: L('Net this month', 'এ মাসের নিট'), nextPay: L('Next pay date', 'পরের বেতন'), method: L('Payment method', 'পেমেন্ট'),
        advance: L('Advance outstanding', 'অগ্রিম বাকি'), mo: L('mo', 'মাস'), openPayroll: L('Open payroll', 'পে-রোল খুলুন'),
        lockTitle: L('Salary data is hidden for you', 'বেতনের তথ্য আপনার জন্য লুকানো'),
        lockBody: L('Your role does not include salary visibility. The shop owner or an accountant can grant it.', 'আপনার রোলে বেতন দেখার অনুমতি নেই। মালিক বা হিসাবরক্ষক অনুমতি দিতে পারেন।'),
        requestAccess: L('Request access', 'অনুমতি চান'),
        perfTitle: L('Performance', 'পারফরম্যান্স'), vsLast: L('Sep vs Aug', 'সেপ vs আগ'),
        ordersConfirmed: L('Orders confirmed', 'অর্ডার নিশ্চিত'), salesValue: L('Sales value', 'বিক্রয় মূল্য'),
        discountsGiven: L('Discounts given', 'ছাড় দেওয়া'), collections: L('Collections', 'আদায়'), returnRate: L('Return rate', 'ফেরতের হার'),
        recentTitle: L('Recent activity', 'সাম্প্রতিক কার্যক্রম'), viewAll: L('View all', 'সব দেখুন'),
        act1: L('Confirmed counter sale #GC-24118 · ৳2,340', 'কাউন্টার বিক্রি #GC-24118 নিশ্চিত · ৳২,৩৪০'), act1When: L('16 Sep, 12:04 PM', '১৬ সেপ, ১২:০৪ PM'),
        act2: L('Applied 5% discount on #GC-24116', '#GC-24116-এ ৫% ছাড়'), act2When: L('16 Sep, 11:41 AM', '১৬ সেপ, ১১:৪১ AM'),
        act3: L('Added customer Rafiq Hasan', 'কাস্টমার রফিক হাসান যোগ'), act3When: L('16 Sep, 10:52 AM', '১৬ সেপ, ১০:৫২ AM'),
        act4: L('Opened cash drawer · ৳5,000 float', 'ক্যাশ ড্রয়ার খোলা · ৳৫,০০০ ফ্লোট'), act4When: L('16 Sep, 9:58 AM', '১৬ সেপ, ৯:৫৮ AM'),
        act5: L('Refund request sent for approval · ৳1,200', 'ফেরতের অনুরোধ অনুমোদনে · ৳১,২০০'), act5When: L('15 Sep, 5:22 PM', '১৫ সেপ, ৫:২২ PM'),
        lastLogin: L('Last login 16 Sep, 9:56 AM · POS Dhanmondi-1 · Android app · IP 103.108.x.x', 'শেষ লগইন ১৬ সেপ, ৯:৫৬ AM · POS ধানমন্ডি-১ · অ্যান্ড্রয়েড অ্যাপ · IP 103.108.x.x')
      },
      toAccess: () => go('access'), toAttendance: () => go('attendance'), toSalary: () => go('salary'), toActivity: () => go('activity'),
      hasData: !empty, noData: empty, locked, unlocked: !locked,
      hasPending: !empty, noPending: empty,
      reqOpen: !empty && req === 'open',
      reqApproved: !empty && req === 'approved',
      reqRejected: !empty && req === 'rejected',
      approve: () => this.setState({ req: 'approved' }),
      reject: () => this.setState({ req: 'rejected' })
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.dc-h728:hover{background:rgba(0,48,135,.2) !important}
.dc-h729:hover{background:#f1f5f9 !important}
.dc-h730:hover{background:#f1f5f9 !important}
.dc-h731:hover{background:#002a77 !important}
.dc-h732:hover{background:#f1f5f9 !important}
.dc-h733:hover{background:rgba(0,48,135,.2) !important}
.dc-h734:hover{background:#f1f5f9 !important}`;

// ---- markup ----

export default class StaffOverviewScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="StaffOverview">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-cols-3" style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "16px", alignItems: "start", fontFamily: "var(--font-sans)", color: "#475569" }}>
          <section style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "14px", borderRadius: "var(--radius-lg)", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ margin: "0", flex: "1", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{v.t?.accessTitle}</h2>
              <button className="dc-h728" type="button" onClick={v.toAccess} style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "28px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", padding: "0 11px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#003087", cursor: "pointer" }}>{v.t?.manage}<__Icon name="arrow-right" strokeWidth="1.75" width="14" height="14" /></button>
            </div>
            <div className="gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "12px" }}>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "11px 12px" }}>
                <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>{v.t?.role}</p>
                <p style={{ margin: "3px 0 0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{v.t?.cashier}</p>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "11px 12px" }}>
                <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>{v.t?.branchScope}</p>
                <p style={{ margin: "3px 0 0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{v.t?.oneBranch}</p>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "11px 12px" }}>
                <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>{v.t?.twoFactor}</p>
                <p style={{ margin: "3px 0 0", display: "flex", alignItems: "center", gap: "5px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#047857" }}><__Icon name="shield-check" strokeWidth="1.75" width="14" height="14" />{v.t?.on}</p>
              </div>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "11px 12px" }}>
                <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>{v.t?.overrides}</p>
                <p style={{ margin: "3px 0 0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{v.t?.twoOverrides}</p>
              </div>
            </div>
          </section>
          <section style={{ display: "flex", flexDirection: "column", gap: "12px", borderRadius: "var(--radius-lg)", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
            <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{v.t?.shiftToday}</h2>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b" }}>10:00 – 18:00</span>
              <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>{v.t?.morning}</span>
            </div>
            <dl style={{ margin: "0", display: "flex", flexDirection: "column", gap: "8px", fontSize: "var(--text-xs-plus)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <dt style={{ margin: "0", flex: "1", color: "var(--text-muted)" }}>{v.t?.grace}</dt>
                <dd style={{ margin: "0", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{v.t?.tenMin}</dd>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <dt style={{ margin: "0", flex: "1", color: "var(--text-muted)" }}>{v.t?.weeklyOff}</dt>
                <dd style={{ margin: "0", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{v.t?.friday}</dd>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <dt style={{ margin: "0", flex: "1", color: "var(--text-muted)" }}>{v.t?.checkInMethod}</dt>
                <dd style={{ margin: "0", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{v.t?.posPin}</dd>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <dt style={{ margin: "0", flex: "1", color: "var(--text-muted)" }}>{v.t?.breakTime}</dt>
                <dd style={{ margin: "0", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>13:30 – 14:00</dd>
              </div>
            </dl>
            <button className="dc-h729" type="button" onClick={v.toAttendance} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px", height: "36px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#475569", cursor: "pointer" }}><__Icon name="repeat" strokeWidth="1.75" width="15" height="15" />{v.t?.changeShift}</button>
          </section>
          <section style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "14px", borderRadius: "var(--radius-lg)", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ margin: "0", flex: "1", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{v.t?.attTitle}</h2>
              <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>01 – 16 Sep 2026</span>
            </div>
            {v.hasData ? (<>
              <div className="gc-cols-5" style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "12px 13px" }}>
                  <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.12)", color: "#047857" }}>
                    <__Icon name="check" strokeWidth="1.75" width="15" height="15" />
                  </span>
                  <span style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>12</span>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>{v.t?.present}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "12px 13px" }}>
                  <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(255,152,0,.14)", color: "#b45309" }}>
                    <__Icon name="clock" strokeWidth="1.75" width="15" height="15" />
                  </span>
                  <span style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>1</span>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>{v.t?.late}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "12px 13px" }}>
                  <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(255,87,36,.1)", color: "#c2410c" }}>
                    <__Icon name="x" strokeWidth="1.75" width="15" height="15" />
                  </span>
                  <span style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>0</span>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>{v.t?.absent}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "12px 13px" }}>
                  <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(0,156,222,.12)", color: "var(--accent-text)" }}>
                    <__Icon name="palmtree" strokeWidth="1.75" width="15" height="15" />
                  </span>
                  <span style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>1</span>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>{v.t?.leaveWord}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "12px 13px" }}>
                  <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                    <__Icon name="timer" strokeWidth="1.75" width="15" height="15" />
                  </span>
                  <span style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "0", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>3.5</span>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>{v.t?.overtimeHours}</span>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", overflow: "auto", paddingBottom: "2px" }}>
                  <div title={`${v.t?.present ?? ""} · 01 Sep`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.08)", padding: "6px 0" }}>
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Tu</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>01</span>
                    <__Icon name="check" strokeWidth="1.75" width="13" height="13" style={{ color: "#047857" }} />
                  </div>
                  <div title={`${v.t?.present ?? ""} · 02 Sep`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.08)", padding: "6px 0" }}>
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>We</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>02</span>
                    <__Icon name="check" strokeWidth="1.75" width="13" height="13" style={{ color: "#047857" }} />
                  </div>
                  <div title={`${v.t?.late ?? ""} · 03 Sep`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(255,152,0,.1)", padding: "6px 0" }}>
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Th</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>03</span>
                    <__Icon name="clock" strokeWidth="1.75" width="13" height="13" style={{ color: "#b45309" }} />
                  </div>
                  <div title={`${v.t?.weeklyOffWord ?? ""} · 04 Sep`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "6px 0" }}>
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Fr</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>04</span>
                    <__Icon name="minus" strokeWidth="1.75" width="13" height="13" style={{ color: "var(--text-muted)" }} />
                  </div>
                  <div title={`${v.t?.present ?? ""} · 05 Sep`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.08)", padding: "6px 0" }}>
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Sa</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>05</span>
                    <__Icon name="check" strokeWidth="1.75" width="13" height="13" style={{ color: "#047857" }} />
                  </div>
                  <div title={`${v.t?.present ?? ""} · 06 Sep`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.08)", padding: "6px 0" }}>
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Su</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>06</span>
                    <__Icon name="check" strokeWidth="1.75" width="13" height="13" style={{ color: "#047857" }} />
                  </div>
                  <div title={`${v.t?.present ?? ""} · 07 Sep`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.08)", padding: "6px 0" }}>
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Mo</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>07</span>
                    <__Icon name="check" strokeWidth="1.75" width="13" height="13" style={{ color: "#047857" }} />
                  </div>
                  <div title={`${v.t?.present ?? ""} · 08 Sep`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.08)", padding: "6px 0" }}>
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Tu</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>08</span>
                    <__Icon name="check" strokeWidth="1.75" width="13" height="13" style={{ color: "#047857" }} />
                  </div>
                  <div title={`${v.t?.leaveWord ?? ""} · 09 Sep`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,156,222,.1)", padding: "6px 0" }}>
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>We</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>09</span>
                    <__Icon name="palmtree" strokeWidth="1.75" width="13" height="13" style={{ color: "var(--accent-text)" }} />
                  </div>
                  <div title={`${v.t?.present ?? ""} · 10 Sep`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.08)", padding: "6px 0" }}>
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Th</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>10</span>
                    <__Icon name="check" strokeWidth="1.75" width="13" height="13" style={{ color: "#047857" }} />
                  </div>
                  <div title={`${v.t?.weeklyOffWord ?? ""} · 11 Sep`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "6px 0" }}>
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Fr</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>11</span>
                    <__Icon name="minus" strokeWidth="1.75" width="13" height="13" style={{ color: "var(--text-muted)" }} />
                  </div>
                  <div title={`${v.t?.present ?? ""} · 12 Sep`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.08)", padding: "6px 0" }}>
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Sa</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>12</span>
                    <__Icon name="check" strokeWidth="1.75" width="13" height="13" style={{ color: "#047857" }} />
                  </div>
                  <div title={`${v.t?.present ?? ""} · 13 Sep`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.08)", padding: "6px 0" }}>
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Su</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>13</span>
                    <__Icon name="check" strokeWidth="1.75" width="13" height="13" style={{ color: "#047857" }} />
                  </div>
                  <div title={`${v.t?.present ?? ""} · 14 Sep`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.08)", padding: "6px 0" }}>
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Mo</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>14</span>
                    <__Icon name="check" strokeWidth="1.75" width="13" height="13" style={{ color: "#047857" }} />
                  </div>
                  <div title={`${v.t?.present ?? ""} · 15 Sep`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.08)", padding: "6px 0" }}>
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>Tu</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>15</span>
                    <__Icon name="check" strokeWidth="1.75" width="13" height="13" style={{ color: "#047857" }} />
                  </div>
                  <div title={`${v.t?.present ?? ""} · 16 Sep`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "34px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.08)", padding: "6px 0" }}>
                    <span style={{ fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>We</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>16</span>
                    <__Icon name="check" strokeWidth="1.75" width="13" height="13" style={{ color: "#047857" }} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", marginTop: "10px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name="check" strokeWidth="1.75" width="13" height="13" style={{ color: "#047857" }} />{v.t?.present}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name="clock" strokeWidth="1.75" width="13" height="13" style={{ color: "#b45309" }} />{v.t?.late}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name="x" strokeWidth="1.75" width="13" height="13" style={{ color: "#c2410c" }} />{v.t?.absent}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name="palmtree" strokeWidth="1.75" width="13" height="13" style={{ color: "var(--accent-text)" }} />{v.t?.leaveWord}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name="minus" strokeWidth="1.75" width="13" height="13" style={{ color: "var(--text-muted)" }} />{v.t?.weeklyOffWord}</span>
                </div>
              </div>
            </>) : null}
            {v.noData ? (<>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "34px 12px", textAlign: "center" }}>
                <span style={{ display: "grid", placeItems: "center", width: "56px", height: "56px", borderRadius: "var(--radius-xl)", background: "#f1f5f9", color: "var(--text-muted)" }}>
                  <__Icon name="calendar-off" strokeWidth="1.75" width="26" height="26" />
                </span>
                <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{v.t?.emptyAttTitle}</p>
                <p style={{ margin: "0", maxWidth: "380px", fontSize: "var(--text-xs-plus)", lineHeight: "20px", color: "var(--text-muted)", textWrap: "pretty" }}>{v.t?.emptyAttBody}</p>
                <button className="dc-h730" type="button" onClick={v.toAttendance} style={{ height: "36px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 14px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#475569", cursor: "pointer" }}>{v.t?.assignShift}</button>
              </div>
            </>) : null}
          </section>
          <section style={{ display: "flex", flexDirection: "column", gap: "14px", borderRadius: "var(--radius-lg)", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ margin: "0", flex: "1", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{v.t?.leaveTitle}</h2>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>2026</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "5px" }}>
                  <span style={{ flex: "1", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{v.t?.casual}</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>{v.t?.casualLeft}</span>
                </div>
                <div style={{ height: "7px", borderRadius: "var(--radius-full)", background: "#e9eef5", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "60%", borderRadius: "var(--radius-full)", background: "#003087" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "5px" }}>
                  <span style={{ flex: "1", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{v.t?.sick}</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>{v.t?.sickLeft}</span>
                </div>
                <div style={{ height: "7px", borderRadius: "var(--radius-full)", background: "#e9eef5", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "86%", borderRadius: "var(--radius-full)", background: "#009CDE" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "5px" }}>
                  <span style={{ flex: "1", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{v.t?.annual}</span>
                  <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>{v.t?.annualLeft}</span>
                </div>
                <div style={{ height: "7px", borderRadius: "var(--radius-full)", background: "#e9eef5", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "100%", borderRadius: "var(--radius-full)", background: "#10b981" }} />
                </div>
              </div>
            </div>
            <div style={{ height: "1px", background: "#e2e8f0" }} />
            <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>{v.t?.pending}</p>
            {v.hasPending ? (<>
              <div style={{ borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "12px 13px" }}>
                <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{v.t?.reqDates}</p>
                <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", textWrap: "pretty" }}>{v.t?.reqDetail}</p>
                {v.reqOpen ? (<>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                    <button className="dc-h731" type="button" onClick={v.approve} style={{ flex: "1", height: "32px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#fff", cursor: "pointer" }}>{v.t?.approve}</button>
                    <button className="dc-h732" type="button" onClick={v.reject} style={{ flex: "1", height: "32px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#475569", cursor: "pointer" }}>{v.t?.reject}</button>
                  </div>
                </>) : null}
                {v.reqApproved ? (<>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", marginTop: "10px", height: "24px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.12)", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#047857" }}><__Icon name="check" strokeWidth="1.75" width="13" height="13" />{v.t?.approved}</span>
                </>) : null}
                {v.reqRejected ? (<>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", marginTop: "10px", height: "24px", borderRadius: "var(--radius-full)", background: "rgba(255,87,36,.1)", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#c2410c" }}><__Icon name="x" strokeWidth="1.75" width="13" height="13" />{v.t?.rejected}</span>
                </>) : null}
              </div>
            </>) : null}
            {v.noPending ? (<>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "14px 13px" }}>
                <__Icon name="inbox" strokeWidth="1.75" width="20" height="20" style={{ flex: "none", color: "var(--text-muted)" }} />
                <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)", textWrap: "pretty" }}>{v.t?.emptyLeave}</p>
              </div>
            </>) : null}
          </section>
          <section style={{ display: "flex", flexDirection: "column", gap: "14px", borderRadius: "var(--radius-lg)", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ margin: "0", flex: "1", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{v.t?.salaryTitle}</h2>
              {v.locked ? (<>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "22px", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}><__Icon name="lock" strokeWidth="1.75" width="12" height="12" />{v.t?.restricted}</span>
              </>) : null}
            </div>
            {v.unlocked ? (<>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "14px" }}>
                  <div>
                    <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>{v.t?.gross}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳22,000</p>
                  </div>
                  <div style={{ paddingBottom: "4px" }}>
                    <p style={{ margin: "0", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>{v.t?.net}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳20,150</p>
                  </div>
                </div>
                <dl style={{ margin: "0", display: "flex", flexDirection: "column", gap: "8px", fontSize: "var(--text-xs-plus)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <dt style={{ margin: "0", flex: "1", color: "var(--text-muted)" }}>{v.t?.nextPay}</dt>
                    <dd style={{ margin: "0", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>01 Oct 2026</dd>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <dt style={{ margin: "0", flex: "1", color: "var(--text-muted)" }}>{v.t?.method}</dt>
                    <dd style={{ margin: "0", display: "flex", alignItems: "center", gap: "6px", fontWeight: "var(--weight-medium)", color: "#1e293b" }}><__Icon name="smartphone" strokeWidth="1.75" width="14" height="14" style={{ color: "var(--text-muted)" }} />bKash · 01712-XXXXXX</dd>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <dt style={{ margin: "0", flex: "1", color: "var(--text-muted)" }}>{v.t?.advance}</dt>
                    <dd style={{ margin: "0", fontWeight: "var(--weight-medium)", color: "#b45309", fontVariantNumeric: "tabular-nums" }}>৳4,000 · ৳1,000/{v.t?.mo}</dd>
                  </div>
                </dl>
                <button className="dc-h733" type="button" onClick={v.toSalary} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px", height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#003087", cursor: "pointer" }}>{v.t?.openPayroll}<__Icon name="arrow-right" strokeWidth="1.75" width="15" height="15" /></button>
              </div>
            </>) : null}
            {v.locked ? (<>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "9px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "26px 16px", textAlign: "center" }}>
                <span style={{ display: "grid", placeItems: "center", width: "44px", height: "44px", borderRadius: "var(--radius-xl)", background: "#e9eef5", color: "var(--text-muted)" }}>
                  <__Icon name="lock" strokeWidth="1.75" width="21" height="21" />
                </span>
                <p style={{ margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{v.t?.lockTitle}</p>
                <p style={{ margin: "0", maxWidth: "260px", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "var(--text-muted)", textWrap: "pretty" }}>{v.t?.lockBody}</p>
                <button className="dc-h734" type="button" style={{ height: "32px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#475569", cursor: "pointer" }}>{v.t?.requestAccess}</button>
              </div>
            </>) : null}
          </section>
          <section style={{ display: "flex", flexDirection: "column", gap: "14px", borderRadius: "var(--radius-lg)", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ margin: "0", flex: "1", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{v.t?.perfTitle}</h2>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>{v.t?.vsLast}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: "1px solid #e2e8f0" }}>
                <span style={{ flex: "1", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.t?.ordersConfirmed}</span>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>184</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", width: "74px", justifyContent: "flex-end", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#047857", fontVariantNumeric: "tabular-nums" }}>▲ 9%<span style={{ fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>169</span></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: "1px solid #e2e8f0" }}>
                <span style={{ flex: "1", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.t?.salesValue}</span>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳3,42,600</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", width: "74px", justifyContent: "flex-end", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#047857", fontVariantNumeric: "tabular-nums" }}>▲ 12%</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: "1px solid #e2e8f0" }}>
                <span style={{ flex: "1", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.t?.discountsGiven}</span>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳8,450</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", width: "74px", justifyContent: "flex-end", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#047857", fontVariantNumeric: "tabular-nums" }}>▼ 4%</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: "1px solid #e2e8f0" }}>
                <span style={{ flex: "1", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.t?.collections}</span>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳3,38,100</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", width: "74px", justifyContent: "flex-end", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#047857", fontVariantNumeric: "tabular-nums" }}>▲ 11%</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: "1px solid #e2e8f0" }}>
                <span style={{ flex: "1", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.t?.returnRate}</span>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>1.6%</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", width: "74px", justifyContent: "flex-end", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#c2410c", fontVariantNumeric: "tabular-nums" }}>▲ 0.3</span>
              </div>
            </div>
          </section>
          <section style={{ display: "flex", flexDirection: "column", gap: "14px", borderRadius: "var(--radius-lg)", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ margin: "0", flex: "1", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{v.t?.recentTitle}</h2>
              <button type="button" onClick={v.toActivity} style={{ border: "none", background: "none", padding: "0", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#003087", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}>{v.t?.viewAll}</button>
            </div>
            <ol style={{ margin: "0", padding: "0", listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                  <__Icon name="receipt" strokeWidth="1.75" width="14" height="14" />
                </span>
                <div style={{ flex: "1", minWidth: "0" }}>
                  <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", textWrap: "pretty" }}>{v.t?.act1}</p>
                  <p style={{ margin: "1px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.t?.act1When}</p>
                </div>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(255,152,0,.14)", color: "#b45309" }}>
                  <__Icon name="percent" strokeWidth="1.75" width="14" height="14" />
                </span>
                <div style={{ flex: "1", minWidth: "0" }}>
                  <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", textWrap: "pretty" }}>{v.t?.act2}</p>
                  <p style={{ margin: "1px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.t?.act2When}</p>
                </div>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,156,222,.12)", color: "var(--accent-text)" }}>
                  <__Icon name="user-plus" strokeWidth="1.75" width="14" height="14" />
                </span>
                <div style={{ flex: "1", minWidth: "0" }}>
                  <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", textWrap: "pretty" }}>{v.t?.act3}</p>
                  <p style={{ margin: "1px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.t?.act3When}</p>
                </div>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.12)", color: "#047857" }}>
                  <__Icon name="wallet" strokeWidth="1.75" width="14" height="14" />
                </span>
                <div style={{ flex: "1", minWidth: "0" }}>
                  <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", textWrap: "pretty" }}>{v.t?.act4}</p>
                  <p style={{ margin: "1px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.t?.act4When}</p>
                </div>
              </li>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <span style={{ display: "grid", placeItems: "center", width: "28px", height: "28px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(240,0,185,.08)", color: "#a21caf" }}>
                  <__Icon name="rotate-ccw" strokeWidth="1.75" width="14" height="14" />
                </span>
                <div style={{ flex: "1", minWidth: "0" }}>
                  <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", textWrap: "pretty" }}>{v.t?.act5}</p>
                  <p style={{ margin: "1px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.t?.act5When}</p>
                </div>
              </li>
            </ol>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "11px 12px" }}>
              <__Icon name="monitor-smartphone" strokeWidth="1.75" width="17" height="17" style={{ flex: "none", color: "var(--text-muted)" }} />
              <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569", textWrap: "pretty" }}>{v.t?.lastLogin}</p>
            </div>
          </section>
        </div>
      </div>
    );
  }
}
