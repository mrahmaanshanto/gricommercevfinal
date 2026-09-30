'use client';
// Generated from design/templates/staff-profile/StaffSalary.dc.html by scripts/convert-design.mjs.
// Profile · salary
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 200); setTimeout(go, 700); setTimeout(go, 2000);
  }
  renderVals() {
    const bn = (this.props.lang ?? 'en') === 'bn';
    const L = (en, b) => bn ? b : en;
    const locked = !!this.props.locked;
    const row = (label, basis, amount, kind) => ({
      label, basis, amount,
      isTotal: kind === 'total', isDeduct: kind === 'deduct', isPlain: !kind
    });
    return {
      locked, unlocked: !locked,
      t: {
        lockTitle: L('Salary and payroll are hidden for you', 'বেতন ও পে-রোল আপনার জন্য লুকানো'),
        lockBody: L('Your role does not include salary visibility, so this tab shows nothing about Sadia\u2019s pay, advances or payslips. Everything else on her profile stays available.', 'আপনার রোলে বেতন দেখার অনুমতি নেই, তাই এই ট্যাবে সাদিয়ার বেতন, অগ্রিম বা পে-স্লিপ দেখাবে না। প্রোফাইলের বাকি সব দেখা যাবে।'),
        requestAccess: L('Request salary access', 'বেতন দেখার অনুমতি চান'), whoCanSee: L('Who can see salary?', 'কারা বেতন দেখতে পারেন?'),
        lockNote: L('The shop owner and the accountant can see salary data. An owner can grant it per person under Access and permissions › Data visibility.', 'মালিক ও হিসাবরক্ষক বেতনের তথ্য দেখতে পারেন। মালিক অ্যাক্সেস ও অনুমতি › ডেটা দৃশ্যমানতা থেকে ব্যক্তিভিত্তিক অনুমতি দিতে পারেন।'),
        structure: L('Salary structure', 'বেতন কাঠামো'), structureMeta: L('Monthly · effective 01 Jul 2026', 'মাসিক · ০১ জুলাই ২০২৬ থেকে'),
        editStructure: L('Edit structure', 'কাঠামো সম্পাদনা'),
        structureCaption: L('Monthly salary structure for Sadia Akter', 'সাদিয়া আক্তারের মাসিক বেতন কাঠামো'),
        component: L('Component', 'উপাদান'), basis: L('Basis', 'ভিত্তি'), amount: L('Amount', 'পরিমাণ'),
        payment: L('Payment', 'পেমেন্ট'), verified: L('verified 04 Mar 2026', 'যাচাই ০৪ মার্চ ২০২৬'), changeMethod: L('Change payment method', 'পেমেন্ট পদ্ধতি বদলান'),
        payDay: L('Pay day', 'বেতনের দিন'), firstOfMonth: L('1st of each month', 'প্রতি মাসের ১ তারিখ'), nextPay: L('Next pay date', 'পরের বেতন'),
        payrollGroup: L('Payroll group', 'পে-রোল গ্রুপ'), dhanmondiMonthly: L('Dhanmondi · monthly', 'ধানমন্ডি · মাসিক'),
        commission: L('Commission this month', 'এ মাসের কমিশন'),
        commissionBody: L('0.5% of her own counter sales of ৳3,42,600, paid with September salary.', 'নিজের কাউন্টার বিক্রি ৳৩,৪২,৬০০-এর ০.৫%, সেপ্টেম্বরের বেতনের সাথে।'),
        commissionTarget: L('68% of the ৳2,500 monthly commission ceiling', 'মাসিক ৳২,৫০০ কমিশন সীমার ৬৮%'),
        loans: L('Loans and advances', 'ঋণ ও অগ্রিম'), addAdvance: L('Add advance', 'অগ্রিম যোগ'),
        advanceTaken: L('ADVANCE TAKEN 05 AUG 2026', 'অগ্রিম নেওয়া ০৫ আগ ২০২৬'),
        advanceBody: L('৳6,000 for a family medical bill · recovered at ৳1,000 a month', '৳৬,০০০ পারিবারিক চিকিৎসার জন্য · মাসে ৳১,০০০ কেটে আদায়'),
        outstanding: L('Outstanding', 'বাকি'),
        instalmentCaption: L('Advance recovery schedule', 'অগ্রিম আদায়ের সূচি'),
        instalment: L('No.', 'নং'), month: L('Month', 'মাস'), status: L('Status', 'স্ট্যাটাস'),
        recovered: L('Recovered', 'আদায়'), thisMonth: L('This month', 'এ মাসে'), scheduled: L('Scheduled', 'নির্ধারিত'),
        payslips: L('Payslip history', 'পে-স্লিপ ইতিহাস'), since: L('since', 'থেকে'),
        download: L('Download payslip', 'পে-স্লিপ ডাউনলোড'), share: L('Share by SMS or email', 'SMS বা ইমেইলে পাঠান'),
        payslipNote: L('Payslips are generated on the 1st and shared to her bKash number as a PDF link.', 'পে-স্লিপ ১ তারিখে তৈরি হয় এবং তাঁর বিকাশ নম্বরে PDF লিংক পাঠানো হয়।')
      },
      structure: [
        row(L('Basic', 'মূল বেতন'), L('60% of gross', 'গ্রসের ৬০%'), '৳13,200'),
        row(L('House rent', 'বাড়ি ভাড়া'), L('25% of gross', 'গ্রসের ২৫%'), '৳5,500'),
        row(L('Medical', 'চিকিৎসা'), L('Fixed', 'নির্দিষ্ট'), '৳1,500'),
        row(L('Conveyance', 'যাতায়াত'), L('Fixed', 'নির্দিষ্ট'), '৳1,200'),
        row(L('Mobile allowance', 'মোবাইল ভাতা'), L('Fixed', 'নির্দিষ্ট'), '৳600'),
        row(L('Gross', 'গ্রস'), L('Sum of earnings', 'আয়ের যোগফল'), '৳22,000', 'total'),
        row(L('Advance recovery', 'অগ্রিম কেটে নেওয়া'), L('৳1,000 × 6 months', '৳১,০০০ × ৬ মাস'), '− ৳1,000', 'deduct'),
        row(L('Late deduction', 'দেরির কাটা'), L('1 late over grace · 14 min', 'গ্রেসের বেশি ১ দিন · ১৪ মিনিট'), '− ৳150', 'deduct'),
        row(L('Overtime', 'ওভারটাইম'), L('3.5 h × ৳100', '৩.৫ ঘণ্টা × ৳১০০'), '+ ৳350'),
        row(L('Commission', 'কমিশন'), L('0.5% of own sales', 'নিজের বিক্রির ০.৫%'), '+ ৳1,713'),
        row(L('Net payable', 'নিট প্রদেয়'), L('September 2026', 'সেপ্টেম্বর ২০২৬'), '৳22,913', 'total')
      ],
      instalments: [
        ['1', L('Aug 2026', 'আগ ২০২৬'), '৳1,000', 'paid'], ['2', L('Sep 2026', 'সেপ ২০২৬'), '৳1,000', 'due'],
        ['3', L('Oct 2026', 'অক্টো ২০২৬'), '৳1,000', 'sched'], ['4', L('Nov 2026', 'নভে ২০২৬'), '৳1,000', 'sched'],
        ['5', L('Dec 2026', 'ডিসে ২০২৬'), '৳1,000', 'sched'], ['6', L('Jan 2027', 'জানু ২০২৭'), '৳1,000', 'sched']
      ].map(([n, month, amount, st]) => ({ n, month, amount, isPaid: st === 'paid', isDue: st === 'due', isSched: st === 'sched' })),
      payslips: [
        [L('August 2026', 'আগস্ট ২০২৬'), L('Paid 01 Sep · bKash', 'পরিশোধ ০১ সেপ · বিকাশ'), '৳21,340'],
        [L('July 2026', 'জুলাই ২০২৬'), L('Paid 01 Aug · bKash', 'পরিশোধ ০১ আগ · বিকাশ'), '৳20,900'],
        [L('June 2026', 'জুন ২০২৬'), L('Paid 01 Jul · bKash · Eid bonus', 'পরিশোধ ০১ জুলাই · বিকাশ · ঈদ বোনাস'), '৳32,000'],
        [L('May 2026', 'মে ২০২৬'), L('Paid 01 Jun · bKash', 'পরিশোধ ০১ জুন · বিকাশ'), '৳20,150'],
        [L('April 2026', 'এপ্রিল ২০২৬'), L('Paid 01 May · bKash', 'পরিশোধ ০১ মে · বিকাশ'), '৳20,150'],
        [L('March 2026', 'মার্চ ২০২৬'), L('Paid 01 Apr · pro-rata from 02 Mar', 'পরিশোধ ০১ এপ্রিল · ০২ মার্চ থেকে আনুপাতিক'), '৳19,400']
      ].map(([month, meta, net]) => ({ month, meta, net, dlAria: L('Download payslip for ' + month, month + ' পে-স্লিপ ডাউনলোড'), shAria: L('Share payslip for ' + month, month + ' পে-স্লিপ শেয়ার') }))
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.dc-h760:hover{background:#002a77 !important}
.dc-h761:hover{background:#f1f5f9 !important}
.dc-h762:hover{background:#f1f5f9 !important}
.dc-h763:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-h764:hover{background:#f1f5f9 !important}
.dc-h765:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-h766:hover{background:#f1f5f9 !important;color:#1e293b !important}`;

// ---- markup ----

export default class StaffSalaryScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="StaffSalary">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "100%", fontFamily: "Poppins,'Hind Siliguri',ui-sans-serif,system-ui,sans-serif", color: "#475569" }}>
          {v.locked ? (<>
            <section style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "13px", borderRadius: "8px", background: "#fff", padding: "64px 24px", textAlign: "center", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
              <span style={{ display: "grid", placeItems: "center", width: "64px", height: "64px", borderRadius: "16px", background: "#e9eef5", color: "#475569" }}>
                <__Icon name="lock" strokeWidth="1.75" width="30" height="30" />
              </span>
              <h2 style={{ margin: "0", fontSize: "18px", fontWeight: "600", letterSpacing: "-.01em", color: "#1e293b" }}>{v.t?.lockTitle}</h2>
              <p style={{ margin: "0", maxWidth: "440px", fontSize: "13.5px", lineHeight: "21px", color: "#64748b", textWrap: "pretty" }}>{v.t?.lockBody}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button className="dc-h760" type="button" style={{ height: "36px", border: "none", borderRadius: "8px", background: "#003087", padding: "0 15px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer" }}>{v.t?.requestAccess}</button>
                <button className="dc-h761" type="button" style={{ height: "36px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 15px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#475569", cursor: "pointer" }}>{v.t?.whoCanSee}</button>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "9px", maxWidth: "460px", borderRadius: "8px", background: "#f8fafc", padding: "12px 14px", textAlign: "left" }}>
                <__Icon name="info" strokeWidth="1.75" width="17" height="17" style={{ flex: "none", marginTop: "1px", color: "#64748b" }} />
                <p style={{ margin: "0", fontSize: "12.5px", lineHeight: "19px", color: "#475569", textWrap: "pretty" }}>{v.t?.lockNote}</p>
              </div>
            </section>
          </>) : null}
          {v.unlocked ? (<>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: "16px", alignItems: "start" }}>
                <section style={{ borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "18px 20px 12px" }}>
                    <div style={{ flex: "1" }}>
                      <h2 style={{ margin: "0", fontSize: "15px", lineHeight: "22px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>{v.t?.structure}</h2>
                      <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748b" }}>{v.t?.structureMeta}</p>
                    </div>
                    <button className="dc-h762" type="button" style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "32px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", letterSpacing: ".025em", color: "#475569", cursor: "pointer" }}><__Icon name="pencil" strokeWidth="1.75" width="14" height="14" />{v.t?.editStructure}</button>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <caption style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clipPath: "inset(50%)" }}>{v.t?.structureCaption}</caption>
                    <thead>
                      <tr>
                        <th scope="col" style={{ padding: "8px 20px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "11px", fontWeight: "600", letterSpacing: ".025em", textTransform: "uppercase", color: "#64748b", textAlign: "left" }}>{v.t?.component}</th>
                        <th scope="col" style={{ padding: "8px 20px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "11px", fontWeight: "600", letterSpacing: ".025em", textTransform: "uppercase", color: "#64748b", textAlign: "left" }}>{v.t?.basis}</th>
                        <th scope="col" style={{ padding: "8px 20px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "11px", fontWeight: "600", letterSpacing: ".025em", textTransform: "uppercase", color: "#64748b", textAlign: "right" }}>{v.t?.amount}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {__list(v.structure).map((s, $index) => (<React.Fragment key={$index}>
                          {s?.isTotal ? (<>
                            <tr style={{ background: "#f8fafc" }}>
                              <td style={{ padding: "11px 20px", borderBottom: "1px solid #e2e8f0", fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>{s?.label}</td>
                              <td style={{ padding: "11px 20px", borderBottom: "1px solid #e2e8f0", fontSize: "12.5px", color: "#64748b" }}>{s?.basis}</td>
                              <td style={{ padding: "11px 20px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontSize: "13.5px", fontWeight: "700", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>{s?.amount}</td>
                            </tr>
                          </>) : null}
                          {s?.isDeduct ? (<>
                            <tr style={{ background: "#fff" }}>
                              <td style={{ padding: "11px 20px", borderBottom: "1px solid #e2e8f0", fontSize: "13px", fontWeight: "500", color: "#475569" }}>{s?.label}</td>
                              <td style={{ padding: "11px 20px", borderBottom: "1px solid #e2e8f0", fontSize: "12.5px", color: "#64748b" }}>{s?.basis}</td>
                              <td style={{ padding: "11px 20px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontSize: "13.5px", fontWeight: "500", color: "#c2410c", fontVariantNumeric: "tabular-nums" }}>{s?.amount}</td>
                            </tr>
                          </>) : null}
                          {s?.isPlain ? (<>
                            <tr style={{ background: "#fff" }}>
                              <td style={{ padding: "11px 20px", borderBottom: "1px solid #e2e8f0", fontSize: "13px", fontWeight: "500", color: "#475569" }}>{s?.label}</td>
                              <td style={{ padding: "11px 20px", borderBottom: "1px solid #e2e8f0", fontSize: "12.5px", color: "#64748b" }}>{s?.basis}</td>
                              <td style={{ padding: "11px 20px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontSize: "13.5px", fontWeight: "500", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>{s?.amount}</td>
                            </tr>
                          </>) : null}
                        </React.Fragment>))}
                    </tbody>
                  </table>
                </section>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <section style={{ display: "flex", flexDirection: "column", gap: "12px", borderRadius: "8px", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <h2 style={{ margin: "0", fontSize: "15px", lineHeight: "22px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>{v.t?.payment}</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "11px", borderRadius: "8px", background: "#f8fafc", padding: "12px 13px" }}>
                      <span style={{ display: "grid", placeItems: "center", width: "34px", height: "34px", flex: "none", borderRadius: "8px", background: "rgba(240,0,185,.08)", color: "#a21caf" }}>
                        <__Icon name="smartphone" strokeWidth="1.75" width="18" height="18" />
                      </span>
                      <div style={{ flex: "1", minWidth: "0" }}>
                        <p style={{ margin: "0", fontSize: "13.5px", fontWeight: "600", color: "#1e293b" }}>bKash</p>
                        <p style={{ margin: "1px 0 0", fontSize: "12.5px", color: "#64748b" }}>01712-XXXXXX · {v.t?.verified}</p>
                      </div>
                      <button className="dc-h763" type="button" aria-label={v.t?.changeMethod} title={v.t?.changeMethod} style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#64748b", cursor: "pointer" }}>
                        <__Icon name="pencil" strokeWidth="1.75" width="15" height="15" />
                      </button>
                    </div>
                    <dl style={{ margin: "0", display: "flex", flexDirection: "column", gap: "9px", fontSize: "13px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <dt style={{ margin: "0", flex: "1", color: "#64748b" }}>{v.t?.payDay}</dt>
                        <dd style={{ margin: "0", fontWeight: "500", color: "#1e293b" }}>{v.t?.firstOfMonth}</dd>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <dt style={{ margin: "0", flex: "1", color: "#64748b" }}>{v.t?.nextPay}</dt>
                        <dd style={{ margin: "0", fontWeight: "500", color: "#1e293b" }}>01 Oct 2026</dd>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <dt style={{ margin: "0", flex: "1", color: "#64748b" }}>{v.t?.payrollGroup}</dt>
                        <dd style={{ margin: "0", fontWeight: "500", color: "#1e293b" }}>{v.t?.dhanmondiMonthly}</dd>
                      </div>
                    </dl>
                  </section>
                  <section style={{ display: "flex", flexDirection: "column", gap: "12px", borderRadius: "8px", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                    <h2 style={{ margin: "0", fontSize: "15px", lineHeight: "22px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>{v.t?.commission}</h2>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                      <span style={{ fontSize: "24px", fontWeight: "700", letterSpacing: "-.025em", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳1,713</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "12.5px", fontWeight: "600", color: "#047857" }}>▲ 9%</span>
                    </div>
                    <p style={{ margin: "0", fontSize: "12.5px", lineHeight: "19px", color: "#64748b", textWrap: "pretty" }}>{v.t?.commissionBody}</p>
                    <div style={{ height: "7px", borderRadius: "9999px", background: "#e9eef5", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: "68%", borderRadius: "9999px", background: "#009CDE" }} />
                    </div>
                    <p style={{ margin: "0", fontSize: "12px", color: "#94a3b8" }}>{v.t?.commissionTarget}</p>
                  </section>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "16px", alignItems: "start" }}>
                <section style={{ display: "flex", flexDirection: "column", gap: "13px", borderRadius: "8px", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h2 style={{ margin: "0", flex: "1", fontSize: "15px", lineHeight: "22px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>{v.t?.loans}</h2>
                    <button className="dc-h764" type="button" style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "32px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", letterSpacing: ".025em", color: "#475569", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="14" height="14" />{v.t?.addAdvance}</button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", borderRadius: "8px", background: "rgba(255,152,0,.1)", padding: "13px 14px" }}>
                    <div style={{ flex: "1", minWidth: "0" }}>
                      <p style={{ margin: "0", fontSize: "12px", fontWeight: "500", letterSpacing: ".025em", color: "#b45309" }}>{v.t?.advanceTaken}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: "500", color: "#1e293b", textWrap: "pretty" }}>{v.t?.advanceBody}</p>
                    </div>
                    <div style={{ textAlign: "right", flex: "none" }}>
                      <p style={{ margin: "0", fontSize: "12px", fontWeight: "500", color: "#b45309" }}>{v.t?.outstanding}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "20px", fontWeight: "700", letterSpacing: "-.02em", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>৳4,000</p>
                    </div>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <caption style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clipPath: "inset(50%)" }}>{v.t?.instalmentCaption}</caption>
                    <thead>
                      <tr>
                        <th scope="col" style={{ padding: "7px 10px 7px 0", borderBottom: "1px solid #e2e8f0", fontSize: "11px", fontWeight: "600", letterSpacing: ".025em", textTransform: "uppercase", color: "#64748b", textAlign: "left" }}>{v.t?.instalment}</th>
                        <th scope="col" style={{ padding: "7px 10px", borderBottom: "1px solid #e2e8f0", fontSize: "11px", fontWeight: "600", letterSpacing: ".025em", textTransform: "uppercase", color: "#64748b", textAlign: "left" }}>{v.t?.month}</th>
                        <th scope="col" style={{ padding: "7px 10px", borderBottom: "1px solid #e2e8f0", fontSize: "11px", fontWeight: "600", letterSpacing: ".025em", textTransform: "uppercase", color: "#64748b", textAlign: "right" }}>{v.t?.amount}</th>
                        <th scope="col" style={{ padding: "7px 0 7px 10px", borderBottom: "1px solid #e2e8f0", fontSize: "11px", fontWeight: "600", letterSpacing: ".025em", textTransform: "uppercase", color: "#64748b", textAlign: "left" }}>{v.t?.status}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {__list(v.instalments).map((i, $index) => (<React.Fragment key={$index}>
                          <tr>
                            <td style={{ padding: "10px 10px 10px 0", borderBottom: "1px solid #e2e8f0", fontSize: "13px", fontWeight: "500", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>{i?.n}</td>
                            <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", fontSize: "13px", color: "#475569" }}>{i?.month}</td>
                            <td style={{ padding: "10px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontSize: "13px", color: "#475569", fontVariantNumeric: "tabular-nums" }}>{i?.amount}</td>
                            <td style={{ padding: "10px 0 10px 10px", borderBottom: "1px solid #e2e8f0" }}>
                              {i?.isPaid ? (<>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "22px", borderRadius: "9999px", padding: "0 9px", fontSize: "11.5px", fontWeight: "600", background: "rgba(16,185,129,.12)", color: "#047857" }}><__Icon name="check" strokeWidth="1.75" width="12" height="12" />{v.t?.recovered}</span>
                              </>) : null}
                              {i?.isDue ? (<>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "22px", borderRadius: "9999px", padding: "0 9px", fontSize: "11.5px", fontWeight: "600", background: "rgba(255,152,0,.14)", color: "#b45309" }}><__Icon name="clock" strokeWidth="1.75" width="12" height="12" />{v.t?.thisMonth}</span>
                              </>) : null}
                              {i?.isSched ? (<>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "22px", borderRadius: "9999px", padding: "0 9px", fontSize: "11.5px", fontWeight: "600", background: "#e9eef5", color: "#475569" }}><__Icon name="calendar" strokeWidth="1.75" width="12" height="12" />{v.t?.scheduled}</span>
                              </>) : null}
                            </td>
                          </tr>
                        </React.Fragment>))}
                    </tbody>
                  </table>
                </section>
                <section style={{ display: "flex", flexDirection: "column", gap: "13px", borderRadius: "8px", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h2 style={{ margin: "0", flex: "1", fontSize: "15px", lineHeight: "22px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>{v.t?.payslips}</h2>
                    <span style={{ fontSize: "12.5px", fontWeight: "500", color: "#64748b" }}>{v.t?.since} Mar 2026</span>
                  </div>
                  <ul style={{ margin: "0", padding: "0", listStyle: "none", display: "flex", flexDirection: "column" }}>
                    {__list(v.payslips).map((p, $index) => (<React.Fragment key={$index}>
                        <li style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #e2e8f0" }}>
                          <span style={{ display: "grid", placeItems: "center", width: "32px", height: "32px", flex: "none", borderRadius: "8px", background: "#f1f5f9", color: "#475569" }}>
                            <__Icon name="file-text" strokeWidth="1.75" width="16" height="16" />
                          </span>
                          <div style={{ flex: "1", minWidth: "0" }}>
                            <p style={{ margin: "0", fontSize: "13px", fontWeight: "500", color: "#1e293b" }}>{p?.month}</p>
                            <p style={{ margin: "1px 0 0", fontSize: "11.5px", color: "#94a3b8" }}>{p?.meta}</p>
                          </div>
                          <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>{p?.net}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px", flex: "none" }}>
                            <button className="dc-h765" type="button" aria-label={p?.dlAria} title={v.t?.download} style={{ width: "30px", height: "30px", display: "grid", placeItems: "center", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#64748b", cursor: "pointer" }}>
                              <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                            </button>
                            <button className="dc-h766" type="button" aria-label={p?.shAria} title={v.t?.share} style={{ width: "30px", height: "30px", display: "grid", placeItems: "center", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#64748b", cursor: "pointer" }}>
                              <__Icon name="share-2" strokeWidth="1.75" width="15" height="15" />
                            </button>
                          </span>
                        </li>
                      </React.Fragment>))}
                  </ul>
                  <p style={{ margin: "0", fontSize: "12px", color: "#94a3b8", textWrap: "pretty" }}>{v.t?.payslipNote}</p>
                </section>
              </div>
            </div>
          </>) : null}
        </div>
      </div>
    );
  }
}
