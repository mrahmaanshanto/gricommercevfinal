'use client';
// Generated from design/templates/staff-profile/StaffLeave.dc.html by scripts/convert-design.mjs.
// Profile · leave
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  state = { filter: 'all', applyOpen: false, decided: {} };
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
    const dec = this.state.decided;
    const base = [
      ['r1', L('24 – 25 Sep 2026', '২৪ – ২৫ সেপ ২০২৬'), L('Casual', 'নৈমিত্তিক'), '2', L('Family wedding in Cumilla', 'কুমিল্লায় পারিবারিক বিয়ে'), 'pending', L('Nusrat Jahan', 'নুসরাত জাহান')],
      ['r2', L('09 Sep 2026', '০৯ সেপ ২০২৬'), L('Casual', 'নৈমিত্তিক'), '1', L('Personal work at the bank', 'ব্যাংকে ব্যক্তিগত কাজ'), 'approved', L('Nusrat Jahan', 'নুসরাত জাহান')],
      ['r3', L('12 – 13 Aug 2026', '১২ – ১৩ আগ ২০২৬'), L('Sick', 'অসুস্থতা'), '2', L('Fever, prescription attached', 'জ্বর, প্রেসক্রিপশন সংযুক্ত'), 'approved', L('Nusrat Jahan', 'নুসরাত জাহান')],
      ['r4', L('28 Jun 2026', '২৮ জুন ২০২৬'), L('Casual', 'নৈমিত্তিক'), '1', L('Applied on the same morning', 'একই সকালে আবেদন'), 'rejected', L('Ashiq Khan', 'আশিক খান')],
      ['r5', L('03 May 2026', '০৩ মে ২০২৬'), L('Casual', 'নৈমিত্তিক'), '1', L('Withdrawn by Sadia', 'সাদিয়া প্রত্যাহার করেছেন'), 'cancelled', '—']
    ];
    const filter = this.state.filter;
    const rows = empty ? [] : base
      .map(([id, dates, type, days, reason, st, approver]) => ({ id, dates, type, days, reason, status: dec[id] || st, approver }))
      .filter(r => filter === 'all' || (filter === 'pending' ? r.status === 'pending' : r.status !== 'pending'))
      .map((r) => {
        return Object.assign({}, r, {
          pending: r.status === 'pending', settled: r.status !== 'pending',
          isApproved: r.status === 'approved', isRejected: r.status === 'rejected', isCancelled: r.status === 'cancelled',
          viewAria: L('View request ' + r.dates, 'আবেদন দেখুন ' + r.dates),
          approve: () => { const d = Object.assign({}, dec); d[r.id] = 'approved'; this.setState({ decided: d }); },
          reject: () => { const d = Object.assign({}, dec); d[r.id] = 'rejected'; this.setState({ decided: d }); }
        });
      });
    return {
      t: {
        policy: L('Standard shop policy 2026', 'স্ট্যান্ডার্ড শপ পলিসি ২০২৬'),
        policyBody: L('Applies to all full-time staff at Dhanmondi. Leave resets on 01 January and up to 5 casual days carry over. Unpaid leave is unlimited but needs owner approval.', 'ধানমন্ডির সব পূর্ণকালীন স্টাফের জন্য প্রযোজ্য। ছুটি ১ জানুয়ারি রিসেট হয়, ৫ দিন পর্যন্ত নৈমিত্তিক ছুটি পরের বছরে যায়। বিনা বেতনের ছুটি সীমাহীন, তবে মালিকের অনুমোদন লাগবে।'),
        allocation: L('Yearly allocation', 'বার্ষিক বরাদ্দ'), taken: L('Taken so far', 'এখন পর্যন্ত নেওয়া'), days: L('days', 'দিন'),
        applyBehalf: L('Apply leave on behalf', 'পক্ষে ছুটির আবেদন'),
        requests: L('Leave requests', 'ছুটির আবেদন'), approve: L('Approve', 'অনুমোদন'), reject: L('Reject', 'নাকচ'),
        reqCaption: L('Leave requests for Sadia Akter, 2026', 'সাদিয়া আক্তারের ছুটির আবেদন, ২০২৬'),
        colDates: L('Dates', 'তারিখ'), colType: L('Type', 'ধরন'), colDays: L('Days', 'দিন'), colReason: L('Reason', 'কারণ'),
        colStatus: L('Status', 'স্ট্যাটাস'), colApprover: L('Approver', 'অনুমোদনকারী'),
        pendingWord: L('Pending', 'অপেক্ষমাণ'), approvedWord: L('Approved', 'অনুমোদিত'), rejectedWord: L('Rejected', 'নাকচ'), cancelledWord: L('Cancelled', 'বাতিল'),
        ofTen: L('of 10 left', '১০-এর মধ্যে বাকি'), ofFourteen: L('of 14 left', '১৪-এর মধ্যে বাকি'), ofTwelve: L('of 12 left', '১২-এর মধ্যে বাকি'),
        takenThisYear: L('taken this year', 'এ বছর নেওয়া'), unpaid: L('Unpaid', 'বিনা বেতন'),
        annualNote: L('Unlocked after 12 months of service', '১২ মাস চাকরির পর খুলবে'), unpaidNote: L('Owner approval required', 'মালিকের অনুমোদন লাগবে'),
        holidays: L('Holiday calendar', 'ছুটির ক্যালেন্ডার'), dhanmondi: L('Dhanmondi', 'ধানমন্ডি'),
        holidayNote: L('Government holidays follow the Bangladesh Bank calendar. Friday is the branch weekly off.', 'সরকারি ছুটি বাংলাদেশ ব্যাংকের ক্যালেন্ডার অনুযায়ী। শুক্রবার শাখার সাপ্তাহিক ছুটি।'),
        emptyTitle: L('No leave requests', 'কোনো ছুটির আবেদন নেই'),
        emptyBody: L('Sadia has not applied for leave this year. Her full 36-day allocation is available — apply on her behalf if she asked in person.', 'এ বছর সাদিয়া ছুটির আবেদন করেননি। পুরো ৩৬ দিন বরাদ্দ আছে — সরাসরি বললে তাঁর পক্ষে আবেদন করুন।'),
        applyTitle: L('Apply leave on behalf of Sadia', 'সাদিয়ার পক্ষে ছুটির আবেদন'),
        applyBody: L('Use this when she asks at the counter. It is recorded as applied by you and approved in the same step.', 'কাউন্টারে বললে এটি ব্যবহার করুন। আপনার নামে আবেদন হবে এবং একই ধাপে অনুমোদিত হবে।'),
        leaveType: L('Leave type', 'ছুটির ধরন'), casual: L('Casual', 'নৈমিত্তিক'), sick: L('Sick', 'অসুস্থতা'), annual: L('Annual', 'বার্ষিক'), unpaid: L('Unpaid', 'বিনা বেতন'),
        from: L('From', 'শুরু'), to: L('To', 'শেষ'), reason: L('Reason', 'কারণ'),
        reasonPlaceholder: L('Family wedding in Cumilla, asked at the counter on 11 Sep', 'কুমিল্লায় পারিবারিক বিয়ে, ১১ সেপ কাউন্টারে বলেছেন'),
        applyMeta: L('Casual balance after this: 4 of 10', 'এরপর নৈমিত্তিক ব্যালেন্স: ১০-এর মধ্যে ৪'),
        applyVerb: L('Apply and approve', 'আবেদন ও অনুমোদন'), cancel: L('Cancel', 'বাতিল')
      },
      takenValue: empty ? L('0 days', '০ দিন') : L('6 days', '৬ দিন'),
      populated: !empty, isEmpty: empty,
      casualLeft: empty ? '10' : '6', sickLeft: empty ? '14' : '12',
      casualNote: empty ? L('Nothing taken yet', 'এখনো কিছু নেওয়া হয়নি') : L('4 taken · 2 more pending approval', '৪ দিন নেওয়া · ২ দিন অনুমোদনের অপেক্ষায়'),
      sickNote: empty ? L('Nothing taken yet', 'এখনো কিছু নেওয়া হয়নি') : L('2 taken in August with a prescription', 'আগস্টে ২ দিন, প্রেসক্রিপশনসহ'),
      filters: [['all', L('All', 'সব')], ['pending', L('Pending', 'অপেক্ষমাণ')], ['settled', L('Settled', 'নিষ্পন্ন')]].map(([key, label]) => ({
        label, on: this.state.filter === key, off: this.state.filter !== key, act: () => this.setState({ filter: key })
      })),
      rows, hasRows: rows.length > 0, noRows: rows.length === 0,
      holidays: [
        ['21', L('SEP', 'সেপ'), L('Shubho Mahalaya', 'শুভ মহালয়া'), L('Branch open · staff optional', 'শাখা খোলা · স্টাফের ইচ্ছাধীন'), false],
        ['01', L('OCT', 'অক্টো'), L('Durga Puja · Bijoya Dashami', 'দুর্গাপূজা · বিজয়া দশমী'), L('Branch closed', 'শাখা বন্ধ'), true],
        ['16', L('DEC', 'ডিসে'), L('Victory Day', 'বিজয় দিবস'), L('Branch closed', 'শাখা বন্ধ'), true],
        ['25', L('DEC', 'ডিসে'), L('Christmas Day', 'বড়দিন'), L('Branch open · half day', 'শাখা খোলা · অর্ধদিবস'), false],
        ['21', L('FEB', 'ফেব'), L('Shaheed Day', 'শহীদ দিবস'), L('Branch closed', 'শাখা বন্ধ'), true]
      ].map(([day, mon, name, meta, closed]) => ({ day, mon, name, meta, closed, isOpen: !closed })),
      applyOpen: this.state.applyOpen,
      openApply: () => this.setState({ applyOpen: true }),
      closeApply: () => this.setState({ applyOpen: false }),
      stop: (e) => e.stopPropagation()
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.dc-h714:hover{background:#002a77 !important}
.dc-h715:hover{color:#1e293b !important}
.dc-h716:hover{background:#002a77 !important}
.dc-h717:hover{background:#f1f5f9 !important}
.dc-h718:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-h719:hover{background:#f1f5f9 !important}
.dc-h720:hover{background:#f1f5f9 !important}
.dc-f721:focus,.dc-f721:focus-visible,.dc-f721:focus-within{border-color:#003087 !important}
.dc-f722:focus,.dc-f722:focus-visible,.dc-f722:focus-within{border-color:#003087 !important}
.dc-f723:focus,.dc-f723:focus-visible,.dc-f723:focus-within{border-color:#003087 !important}
.dc-f724:focus,.dc-f724:focus-visible,.dc-f724:focus-within{border-color:#003087 !important}
.dc-f725:focus,.dc-f725:focus-visible,.dc-f725:focus-within{border-color:#003087 !important}
.dc-h726:hover{background:#f1f5f9 !important}
.dc-h727:hover{background:#002a77 !important}`;

// ---- markup ----

export default class StaffLeaveScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="StaffLeave">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px", fontFamily: "Poppins,'Hind Siliguri',ui-sans-serif,system-ui,sans-serif", color: "#475569" }}>
          <section style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", borderRadius: "8px", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
            <div style={{ flex: "1", minWidth: "240px" }}>
              <h2 style={{ margin: "0", fontSize: "15px", lineHeight: "22px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>{v.t?.policy}</h2>
              <p style={{ margin: "3px 0 0", fontSize: "13px", lineHeight: "20px", color: "#64748b", textWrap: "pretty" }}>{v.t?.policyBody}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
              <div>
                <p style={{ margin: "0", fontSize: "12px", fontWeight: "500", letterSpacing: ".025em", color: "#64748b" }}>{v.t?.allocation}</p>
                <p style={{ margin: "2px 0 0", fontSize: "20px", fontWeight: "700", letterSpacing: "-.02em", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>36 {v.t?.days}</p>
              </div>
              <div>
                <p style={{ margin: "0", fontSize: "12px", fontWeight: "500", letterSpacing: ".025em", color: "#64748b" }}>{v.t?.taken}</p>
                <p style={{ margin: "2px 0 0", fontSize: "20px", fontWeight: "700", letterSpacing: "-.02em", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>{v.takenValue}</p>
              </div>
              <button className="dc-h714" type="button" onClick={v.openApply} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", border: "none", borderRadius: "8px", background: "#003087", padding: "0 15px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer" }}><__Icon name="calendar-plus" strokeWidth="1.75" width="16" height="16" />{v.t?.applyBehalf}</button>
            </div>
          </section>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "16px" }}>
            <section style={{ display: "flex", flexDirection: "column", gap: "11px", borderRadius: "8px", background: "#fff", padding: "16px 18px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <span style={{ display: "grid", placeItems: "center", width: "30px", height: "30px", flex: "none", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                  <__Icon name="coffee" strokeWidth="1.75" width="16" height="16" />
                </span>
                <h3 style={{ margin: "0", flex: "1", fontSize: "13.5px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>{v.t?.casual}</h3>
              </div>
              <p style={{ margin: "0", display: "flex", alignItems: "baseline", gap: "5px" }}>
                <span style={{ fontSize: "26px", fontWeight: "700", letterSpacing: "-.025em", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>{v.casualLeft}</span>
                <span style={{ fontSize: "13px", fontWeight: "500", color: "#64748b" }}>{v.t?.ofTen}</span>
              </p>
              {v.populated ? (<>
                <div style={{ height: "7px", borderRadius: "9999px", background: "#e9eef5", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "60%", borderRadius: "9999px", background: "#003087" }} />
                </div>
              </>) : null}
              {v.isEmpty ? (<>
                <div style={{ height: "7px", borderRadius: "9999px", background: "#e9eef5", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "100%", borderRadius: "9999px", background: "#003087" }} />
                </div>
              </>) : null}
              <p style={{ margin: "0", fontSize: "12px", color: "#64748b", textWrap: "pretty" }}>{v.casualNote}</p>
            </section>
            <section style={{ display: "flex", flexDirection: "column", gap: "11px", borderRadius: "8px", background: "#fff", padding: "16px 18px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <span style={{ display: "grid", placeItems: "center", width: "30px", height: "30px", flex: "none", borderRadius: "8px", background: "rgba(0,156,222,.12)", color: "#0089c3" }}>
                  <__Icon name="thermometer" strokeWidth="1.75" width="16" height="16" />
                </span>
                <h3 style={{ margin: "0", flex: "1", fontSize: "13.5px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>{v.t?.sick}</h3>
              </div>
              <p style={{ margin: "0", display: "flex", alignItems: "baseline", gap: "5px" }}>
                <span style={{ fontSize: "26px", fontWeight: "700", letterSpacing: "-.025em", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>{v.sickLeft}</span>
                <span style={{ fontSize: "13px", fontWeight: "500", color: "#64748b" }}>{v.t?.ofFourteen}</span>
              </p>
              {v.populated ? (<>
                <div style={{ height: "7px", borderRadius: "9999px", background: "#e9eef5", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "86%", borderRadius: "9999px", background: "#009CDE" }} />
                </div>
              </>) : null}
              {v.isEmpty ? (<>
                <div style={{ height: "7px", borderRadius: "9999px", background: "#e9eef5", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "100%", borderRadius: "9999px", background: "#009CDE" }} />
                </div>
              </>) : null}
              <p style={{ margin: "0", fontSize: "12px", color: "#64748b", textWrap: "pretty" }}>{v.sickNote}</p>
            </section>
            <section style={{ display: "flex", flexDirection: "column", gap: "11px", borderRadius: "8px", background: "#fff", padding: "16px 18px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <span style={{ display: "grid", placeItems: "center", width: "30px", height: "30px", flex: "none", borderRadius: "8px", background: "rgba(16,185,129,.12)", color: "#047857" }}>
                  <__Icon name="palmtree" strokeWidth="1.75" width="16" height="16" />
                </span>
                <h3 style={{ margin: "0", flex: "1", fontSize: "13.5px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>{v.t?.annual}</h3>
              </div>
              <p style={{ margin: "0", display: "flex", alignItems: "baseline", gap: "5px" }}>
                <span style={{ fontSize: "26px", fontWeight: "700", letterSpacing: "-.025em", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>12</span>
                <span style={{ fontSize: "13px", fontWeight: "500", color: "#64748b" }}>{v.t?.ofTwelve}</span>
              </p>
              <div style={{ height: "7px", borderRadius: "9999px", background: "#e9eef5", overflow: "hidden" }}>
                <div style={{ height: "100%", width: "100%", borderRadius: "9999px", background: "#047857" }} />
              </div>
              <p style={{ margin: "0", fontSize: "12px", color: "#64748b", textWrap: "pretty" }}>{v.t?.annualNote}</p>
            </section>
            <section style={{ display: "flex", flexDirection: "column", gap: "11px", borderRadius: "8px", background: "#fff", padding: "16px 18px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <span style={{ display: "grid", placeItems: "center", width: "30px", height: "30px", flex: "none", borderRadius: "8px", background: "#e9eef5", color: "#475569" }}>
                  <__Icon name="minus-circle" strokeWidth="1.75" width="16" height="16" />
                </span>
                <h3 style={{ margin: "0", flex: "1", fontSize: "13.5px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>{v.t?.unpaid}</h3>
              </div>
              <p style={{ margin: "0", display: "flex", alignItems: "baseline", gap: "5px" }}>
                <span style={{ fontSize: "26px", fontWeight: "700", letterSpacing: "-.025em", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>0</span>
                <span style={{ fontSize: "13px", fontWeight: "500", color: "#64748b" }}>{v.t?.takenThisYear}</span>
              </p>
              <div style={{ height: "7px", borderRadius: "9999px", background: "#e9eef5", overflow: "hidden" }}>
                <div style={{ height: "100%", width: "0%", borderRadius: "9999px", background: "#475569" }} />
              </div>
              <p style={{ margin: "0", fontSize: "12px", color: "#64748b", textWrap: "pretty" }}>{v.t?.unpaidNote}</p>
            </section>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: "16px", alignItems: "start" }}>
            <section style={{ borderRadius: "8px", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "18px 20px 12px" }}>
                <h2 style={{ margin: "0", flex: "1", fontSize: "15px", lineHeight: "22px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>{v.t?.requests}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: "2px", height: "32px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", padding: "3px" }}>
                  {__list(v.filters).map((f, $index) => (<React.Fragment key={$index}>
                      {f?.on ? (<>
                        <button type="button" onClick={f?.act} aria-pressed="true" style={{ height: "24px", border: "none", borderRadius: "6px", padding: "0 10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "600", cursor: "pointer", background: "#fff", color: "#1e293b", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)" }}>{f?.label}</button>
                      </>) : null}
                      {f?.off ? (<>
                        <button className="dc-h715" type="button" onClick={f?.act} aria-pressed="false" style={{ height: "24px", border: "none", borderRadius: "6px", padding: "0 10px", fontFamily: "inherit", fontSize: "12px", fontWeight: "500", cursor: "pointer", background: "transparent", color: "#64748b" }}>{f?.label}</button>
                      </>) : null}
                    </React.Fragment>))}
                </div>
              </div>
              {v.hasRows ? (<>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <caption style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clipPath: "inset(50%)" }}>{v.t?.reqCaption}</caption>
                  <thead>
                    <tr>
                      <th scope="col" style={{ padding: "8px 16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "11px", fontWeight: "600", letterSpacing: ".025em", textTransform: "uppercase", color: "#64748b", textAlign: "left", whiteSpace: "nowrap" }}>{v.t?.colDates}</th>
                      <th scope="col" style={{ padding: "8px 16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "11px", fontWeight: "600", letterSpacing: ".025em", textTransform: "uppercase", color: "#64748b", textAlign: "left", whiteSpace: "nowrap" }}>{v.t?.colType}</th>
                      <th scope="col" style={{ padding: "8px 16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "11px", fontWeight: "600", letterSpacing: ".025em", textTransform: "uppercase", color: "#64748b", textAlign: "right", whiteSpace: "nowrap" }}>{v.t?.colDays}</th>
                      <th scope="col" style={{ padding: "8px 16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "11px", fontWeight: "600", letterSpacing: ".025em", textTransform: "uppercase", color: "#64748b", textAlign: "left", whiteSpace: "nowrap" }}>{v.t?.colReason}</th>
                      <th scope="col" style={{ padding: "8px 16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "11px", fontWeight: "600", letterSpacing: ".025em", textTransform: "uppercase", color: "#64748b", textAlign: "left", whiteSpace: "nowrap" }}>{v.t?.colStatus}</th>
                      <th scope="col" style={{ padding: "8px 16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "11px", fontWeight: "600", letterSpacing: ".025em", textTransform: "uppercase", color: "#64748b", textAlign: "left", whiteSpace: "nowrap" }}>{v.t?.colApprover}</th>
                      <th scope="col" style={{ padding: "8px 16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }} />
                    </tr>
                  </thead>
                  <tbody>
                    {__list(v.rows).map((r, $index) => (<React.Fragment key={$index}>
                        <tr style={{ background: "#fff" }}>
                          <td style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", fontSize: "13px", fontWeight: "500", color: "#1e293b", whiteSpace: "nowrap" }}>{r?.dates}</td>
                          <td style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", fontSize: "13px", color: "#475569" }}>{r?.type}</td>
                          <td style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontSize: "13px", fontWeight: "600", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>{r?.days}</td>
                          <td style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", fontSize: "12.5px", color: "#64748b", textWrap: "pretty" }}>{r?.reason}</td>
                          <td style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>
                            {r?.pending ? (<>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "24px", borderRadius: "9999px", background: "rgba(255,152,0,.14)", padding: "0 9px", fontSize: "12px", fontWeight: "600", color: "#b45309" }}><__Icon name="clock" strokeWidth="1.75" width="12" height="12" />{v.t?.pendingWord}</span>
                            </>) : null}
                            {r?.isApproved ? (<>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "24px", borderRadius: "9999px", background: "rgba(16,185,129,.12)", padding: "0 9px", fontSize: "12px", fontWeight: "600", color: "#047857" }}><__Icon name="check" strokeWidth="1.75" width="12" height="12" />{v.t?.approvedWord}</span>
                            </>) : null}
                            {r?.isRejected ? (<>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "24px", borderRadius: "9999px", background: "rgba(255,87,36,.1)", padding: "0 9px", fontSize: "12px", fontWeight: "600", color: "#c2410c" }}><__Icon name="x" strokeWidth="1.75" width="12" height="12" />{v.t?.rejectedWord}</span>
                            </>) : null}
                            {r?.isCancelled ? (<>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "24px", borderRadius: "9999px", background: "#e9eef5", padding: "0 9px", fontSize: "12px", fontWeight: "600", color: "#475569" }}><__Icon name="minus" strokeWidth="1.75" width="12" height="12" />{v.t?.cancelledWord}</span>
                            </>) : null}
                          </td>
                          <td style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", fontSize: "12.5px", color: "#475569", whiteSpace: "nowrap" }}>{r?.approver}</td>
                          <td style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", textAlign: "right", whiteSpace: "nowrap" }}>
                            {r?.pending ? (<>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                <button className="dc-h716" type="button" onClick={r?.approve} style={{ height: "30px", border: "none", borderRadius: "8px", background: "#003087", padding: "0 12px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer" }}>{v.t?.approve}</button>
                                <button className="dc-h717" type="button" onClick={r?.reject} style={{ height: "30px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", letterSpacing: ".025em", color: "#475569", cursor: "pointer" }}>{v.t?.reject}</button>
                              </span>
                            </>) : null}
                            {r?.settled ? (<>
                              <button className="dc-h718" type="button" aria-label={r?.viewAria} style={{ width: "30px", height: "30px", display: "grid", placeItems: "center", border: "none", borderRadius: "9999px", background: "none", color: "#94a3b8", cursor: "pointer" }}>
                                <__Icon name="chevron-right" strokeWidth="1.75" width="16" height="16" />
                              </button>
                            </>) : null}
                          </td>
                        </tr>
                      </React.Fragment>))}
                  </tbody>
                </table>
              </>) : null}
              {v.noRows ? (<>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "11px", padding: "48px 20px", textAlign: "center" }}>
                  <span style={{ display: "grid", placeItems: "center", width: "60px", height: "60px", borderRadius: "16px", background: "#f1f5f9", color: "#94a3b8" }}>
                    <__Icon name="inbox" strokeWidth="1.75" width="28" height="28" />
                  </span>
                  <h3 style={{ margin: "0", fontSize: "15px", fontWeight: "600", color: "#1e293b" }}>{v.t?.emptyTitle}</h3>
                  <p style={{ margin: "0", maxWidth: "400px", fontSize: "13.5px", lineHeight: "21px", color: "#64748b", textWrap: "pretty" }}>{v.t?.emptyBody}</p>
                  <button className="dc-h719" type="button" onClick={v.openApply} style={{ height: "36px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 15px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#475569", cursor: "pointer" }}>{v.t?.applyBehalf}</button>
                </div>
              </>) : null}
            </section>
            <section style={{ display: "flex", flexDirection: "column", gap: "12px", borderRadius: "8px", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ margin: "0", flex: "1", fontSize: "15px", lineHeight: "22px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>{v.t?.holidays}</h2>
                <span style={{ fontSize: "12px", fontWeight: "500", color: "#64748b" }}>{v.t?.dhanmondi}</span>
              </div>
              <ol style={{ margin: "0", padding: "0", listStyle: "none", display: "flex", flexDirection: "column" }}>
                {__list(v.holidays).map((h, $index) => (<React.Fragment key={$index}>
                    <li style={{ display: "flex", alignItems: "center", gap: "11px", padding: "9px 0", borderBottom: "1px solid #e2e8f0" }}>
                      {h?.closed ? (<>
                        <span style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "38px", flex: "none", borderRadius: "8px", background: "rgba(240,0,185,.08)", padding: "4px 0" }}>
                          <span style={{ fontSize: "13px", fontWeight: "700", color: "#a21caf", fontVariantNumeric: "tabular-nums" }}>{h?.day}</span>
                          <span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: ".04em", color: "#a21caf" }}>{h?.mon}</span>
                        </span>
                      </>) : null}
                      {h?.isOpen ? (<>
                        <span style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "38px", flex: "none", borderRadius: "8px", background: "#f1f5f9", padding: "4px 0" }}>
                          <span style={{ fontSize: "13px", fontWeight: "700", color: "#475569", fontVariantNumeric: "tabular-nums" }}>{h?.day}</span>
                          <span style={{ fontSize: "10px", fontWeight: "600", letterSpacing: ".04em", color: "#475569" }}>{h?.mon}</span>
                        </span>
                      </>) : null}
                      <span style={{ flex: "1", minWidth: "0" }}>
                        <span style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#1e293b", textWrap: "pretty" }}>{h?.name}</span>
                        <span style={{ display: "block", fontSize: "11.5px", color: "#94a3b8" }}>{h?.meta}</span>
                      </span>
                    </li>
                  </React.Fragment>))}
              </ol>
              <p style={{ margin: "0", fontSize: "12px", color: "#94a3b8", textWrap: "pretty" }}>{v.t?.holidayNote}</p>
            </section>
          </div>
          {v.applyOpen ? (<>
            <div role="presentation" onClick={v.closeApply} style={{ position: "fixed", inset: "0", zIndex: "200", display: "grid", placeItems: "center", background: "rgba(15,23,42,.6)", padding: "24px" }}>
              <div role="dialog" aria-modal="true" aria-label={v.t?.applyBehalf} onClick={v.stop} style={{ width: "100%", maxWidth: "520px", borderRadius: "8px", background: "#fff", boxShadow: "0 26px 60px -20px rgba(15,23,42,.5)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "20px 22px 0" }}>
                  <span style={{ display: "grid", placeItems: "center", width: "38px", height: "38px", flex: "none", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                    <__Icon name="calendar-plus" strokeWidth="1.75" width="20" height="20" />
                  </span>
                  <div style={{ flex: "1", minWidth: "0" }}>
                    <h2 style={{ margin: "0", fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>{v.t?.applyTitle}</h2>
                    <p style={{ margin: "4px 0 0", fontSize: "13px", lineHeight: "19px", color: "#64748b", textWrap: "pretty" }}>{v.t?.applyBody}</p>
                  </div>
                  <button className="dc-h720" type="button" onClick={v.closeApply} aria-label="Close" style={{ width: "30px", height: "30px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "8px", background: "none", color: "#94a3b8", cursor: "pointer" }}>
                    <__Icon name="x" strokeWidth="1.75" width="17" height="17" />
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", padding: "16px 22px 0" }}>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "500", letterSpacing: ".025em", color: "#64748b" }}>{v.t?.leaveType}</span>
                    <select className="dc-f721" style={{ width: "100%", height: "36px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 9px", fontFamily: "inherit", fontSize: "13.5px", color: "#1e293b", cursor: "pointer" }}>
                      <option>{v.t?.casual}</option>
                      <option>{v.t?.sick}</option>
                      <option>{v.t?.annual}</option>
                      <option>{v.t?.unpaid}</option>
                    </select>
                  </label>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "500", letterSpacing: ".025em", color: "#64748b" }}>{v.t?.days}</span>
                    <input className="dc-f722" type="text" defaultValue="2" style={{ width: "100%", height: "36px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontFamily: "inherit", fontSize: "13.5px", color: "#1e293b" }} />
                  </label>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "500", letterSpacing: ".025em", color: "#64748b" }}>{v.t?.from}</span>
                    <input className="dc-f723" type="text" defaultValue="24 Sep 2026" style={{ width: "100%", height: "36px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontFamily: "inherit", fontSize: "13.5px", color: "#1e293b" }} />
                  </label>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "500", letterSpacing: ".025em", color: "#64748b" }}>{v.t?.to}</span>
                    <input className="dc-f724" type="text" defaultValue="25 Sep 2026" style={{ width: "100%", height: "36px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "0 11px", fontFamily: "inherit", fontSize: "13.5px", color: "#1e293b" }} />
                  </label>
                  <label style={{ display: "block", gridColumn: "span 2" }}>
                    <span style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "500", letterSpacing: ".025em", color: "#64748b" }}>{v.t?.reason}</span>
                    <textarea className="dc-f725" rows="2" placeholder={v.t?.reasonPlaceholder} style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "9px 11px", fontFamily: "inherit", fontSize: "13.5px", lineHeight: "20px", color: "#1e293b", resize: "vertical" }} />
                  </label>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginTop: "18px", padding: "14px 22px", borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
                  <p style={{ margin: "0", fontSize: "12px", color: "#64748b" }}>{v.t?.applyMeta}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button className="dc-h726" type="button" onClick={v.closeApply} style={{ height: "36px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 15px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#475569", cursor: "pointer" }}>{v.t?.cancel}</button>
                    <button className="dc-h727" type="button" onClick={v.closeApply} style={{ height: "36px", border: "none", borderRadius: "8px", background: "#003087", padding: "0 16px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer" }}>{v.t?.applyVerb}</button>
                  </div>
                </div>
              </div>
            </div>
          </>) : null}
        </div>
      </div>
    );
  }
}
