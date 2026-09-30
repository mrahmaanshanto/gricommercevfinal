'use client';
// Generated from design/templates/staff-profile/StaffAttendance.dc.html by scripts/convert-design.mjs.
// Profile · attendance
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  state = { sheet: null };
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
    const labels = { p: L('Present', 'উপস্থিত'), l: L('Late', 'দেরি'), a: L('Absent', 'অনুপস্থিত'), v: L('Leave', 'ছুটি'), h: L('Holiday', 'সরকারি ছুটি'), o: L('Weekly off', 'সাপ্তাহিক ছুটি') };
    const marks = { 1: 'p', 2: 'p', 3: 'l', 4: 'o', 5: 'p', 6: 'p', 7: 'p', 8: 'p', 9: 'v', 10: 'p', 11: 'o', 12: 'p', 13: 'p', 14: 'p', 15: 'p', 16: 'p', 18: 'o', 21: 'h', 25: 'o' };
    const cal = [];
    for (let i = 0; i < 2; i++) cal.push({ num: '', blank: true, title: '' });
    for (let d = 1; d <= 30; d++) {
      const k = marks[d] || null;
      cal.push({
        num: d < 10 ? '0' + d : String(d),
        blank: false,
        isPresent: k === 'p', isLate: k === 'l', isAbsent: k === 'a', isLeave: k === 'v', isHoliday: k === 'h', isOff: k === 'o', isFuture: !k,
        title: (k ? labels[k] : L('Not recorded', 'রেকর্ড নেই')) + ' · ' + d + ' Sep 2026'
      });
    }
    const logRows = [
      ['16 Sep 2026', '09:56', '—', L('POS', 'POS'), 'tablet', '', '—', L('In progress · counter open', 'চলমান · কাউন্টার খোলা')],
      ['15 Sep 2026', '09:58', '18:24', L('POS', 'POS'), 'tablet', '', '0.4 h', ''],
      ['14 Sep 2026', '09:51', '18:02', L('POS', 'POS'), 'tablet', '', '—', ''],
      ['13 Sep 2026', '10:02', '18:40', L('POS', 'POS'), 'tablet', '', '0.7 h', L('Stayed for stock count', 'স্টক গণনার জন্য ছিলেন')],
      ['12 Sep 2026', '09:47', '18:05', L('POS', 'POS'), 'tablet', '', '—', ''],
      ['11 Sep 2026', '—', '—', L('Off', 'ছুটি'), 'minus', '', '—', L('Friday · weekly off', 'শুক্রবার · সাপ্তাহিক ছুটি')],
      ['10 Sep 2026', '09:59', '20:12', L('Phone', 'ফোন'), 'smartphone', '', '2.2 h', L('Eid rush · approved by Nusrat Jahan', 'ঈদের ভিড় · নুসরাত জাহান অনুমোদিত')],
      ['09 Sep 2026', '—', '—', L('Admin', 'অ্যাডমিন'), 'monitor', '', '—', L('Casual leave · approved', 'নৈমিত্তিক ছুটি · অনুমোদিত')],
      ['08 Sep 2026', '10:14', '18:06', L('POS', 'POS'), 'tablet', '14', '—', ''],
      ['07 Sep 2026', '09:52', '18:00', L('Admin', 'অ্যাডমিন'), 'monitor', '', '—', L('Corrected by Nusrat Jahan · POS was offline', 'নুসরাত জাহান সংশোধন করেছেন · POS অফলাইন ছিল')]
    ];
    const sheets = {
      shift: {
        title: L('Change shift', 'শিফট বদলান'),
        body: L('The new shift starts from the date you pick. Attendance already recorded is not changed.', 'নির্বাচিত তারিখ থেকে নতুন শিফট চালু হবে। রেকর্ড হওয়া হাজিরা বদলাবে না।'),
        icon: 'repeat', verb: L('Change shift', 'শিফট বদলান'),
        warning: L('Sadia is notified by SMS in Bangla. A shift change inside a running week needs the branch manager to approve.', 'সাদিয়াকে বাংলায় SMS-এ জানানো হবে। চলতি সপ্তাহে শিফট বদলাতে শাখা ব্যবস্থাপকের অনুমোদন লাগবে।'),
        fields: [
          { label: L('New shift', 'নতুন শিফট'), value: L('Evening shift · 14:00 – 22:00', 'সান্ধ্যকালীন · ১৪:০০ – ২২:০০'), placeholder: '' },
          { label: L('Effective from', 'কার্যকর'), value: '21 Sep 2026', placeholder: '' },
          { label: L('Reason', 'কারণ'), value: '', placeholder: L('Covering for Rumi at the evening counter', 'সন্ধ্যার কাউন্টারে রুমির বদলি') }
        ]
      },
      correction: {
        title: L('Add attendance correction', 'হাজিরা সংশোধন'),
        body: L('Use this when the POS was offline or a check-out was missed. Every correction is logged against your name.', 'POS অফলাইন থাকলে বা চেক-আউট বাদ পড়লে ব্যবহার করুন। প্রতিটি সংশোধন আপনার নামে লেখা থাকবে।'),
        icon: 'pencil-line', verb: L('Send for approval', 'অনুমোদনে পাঠান'),
        warning: L('A reason is required and the branch manager must approve before payroll picks it up.', 'কারণ দেওয়া বাধ্যতামূলক এবং পে-রোলে যাওয়ার আগে শাখা ব্যবস্থাপকের অনুমোদন লাগবে।'),
        fields: [
          { label: L('Date', 'তারিখ'), value: '13 Sep 2026', placeholder: '' },
          { label: L('Check-in / check-out', 'চেক-ইন / চেক-আউট'), value: '10:02 / 18:40', placeholder: '' },
          { label: L('Reason (required)', 'কারণ (বাধ্যতামূলক)'), value: '', placeholder: L('POS tablet was offline during closing', 'বন্ধের সময় POS ট্যাব অফলাইন ছিল') }
        ]
      }
    };
    const sh = sheets[this.state.sheet] || null;
    return {
      t: {
        assigned: L('Assigned shift', 'নির্ধারিত শিফট'), morningShift: L('Morning shift', 'সকালের শিফট'), eightHours: L('8 hours', '৮ ঘণ্টা'),
        grace: L('Grace time', 'গ্রেস সময়'), tenMin: L('10 minutes', '১০ মিনিট'), weeklyOff: L('Weekly off', 'সাপ্তাহিক ছুটি'), friday: L('Friday', 'শুক্রবার'),
        checkInMethod: L('Check-in method', 'চেক-ইন পদ্ধতি'), posPin: L('POS PIN at Dhanmondi-1', 'ধানমন্ডি-১ POS পিন'),
        overtimeRule: L('Overtime counts', 'ওভারটাইম গণনা'), afterThirty: L('After 30 minutes', '৩০ মিনিট পর'), effective: L('Effective from', 'কার্যকর'),
        changeShift: L('Change shift', 'শিফট বদলান'), correction: L('Correction', 'সংশোধন'),
        roster: L('Weekly roster', 'সাপ্তাহিক রোস্টার'), september: L('September 2026', 'সেপ্টেম্বর ২০২৬'),
        prevMonth: L('Previous month', 'আগের মাস'), nextMonth: L('Next month', 'পরের মাস'),
        dailyLog: L('Daily log', 'দৈনিক লগ'), export: L('Export', 'এক্সপোর্ট'),
        logCaption: L('Daily attendance log for Sadia Akter, September 2026', 'সাদিয়া আক্তারের দৈনিক হাজিরা, সেপ্টেম্বর ২০২৬'),
        logMeta: L('Showing 10 of 16 recorded days · 1 correction', '১৬টির মধ্যে ১০ দিন দেখানো হচ্ছে · ১টি সংশোধন'),
        showAll: L('Show all days', 'সব দিন দেখুন'), cancel: L('Cancel', 'বাতিল'),
        colDate: L('Date', 'তারিখ'), colIn: L('Check-in', 'চেক-ইন'), colOut: L('Check-out', 'চেক-আউট'), colSource: L('Source', 'সোর্স'),
        colLate: L('Late (min)', 'দেরি (মিনিট)'), colOt: L('Overtime', 'ওভারটাইম'), colNote: L('Note', 'মন্তব্য'),
        present: L('Present', 'উপস্থিত'), late: L('Late', 'দেরি'), absent: L('Absent', 'অনুপস্থিত'),
        leaveWord: L('Leave', 'ছুটি'), holiday: L('Holiday', 'সরকারি ছুটি'),
        emptyTitle: L('No attendance recorded yet', 'এখনো হাজিরা নেই'),
        emptyBody: L('Sadia has no shift assigned, so the POS register has nothing to check her in against. Assign a shift and her check-ins start appearing here the same day.', 'সাদিয়ার কোনো শিফট নেই, তাই POS-এ চেক-ইন হচ্ছে না। শিফট দিলে সেদিন থেকেই চেক-ইন এখানে দেখাবে।'),
        assignShift: L('Assign a shift', 'শিফট নির্ধারণ'), addManual: L('Add a manual entry', 'ম্যানুয়াল এন্ট্রি')
      },
      hasData: !empty, noData: empty,
      roster: [
        ['Sun', '14 Sep', L('10:00 – 18:00', '১০:০০ – ১৮:০০'), L('Dhanmondi-1', 'ধানমন্ডি-১'), 'scan-line', false],
        ['Mon', '15 Sep', L('10:00 – 18:00', '১০:০০ – ১৮:০০'), L('Dhanmondi-1', 'ধানমন্ডি-১'), 'scan-line', false],
        ['Tue', '16 Sep', L('10:00 – 18:00', '১০:০০ – ১৮:০০'), L('Today · checked in', 'আজ · চেক-ইন'), 'log-in', true],
        ['Wed', '17 Sep', L('10:00 – 18:00', '১০:০০ – ১৮:০০'), L('Dhanmondi-1', 'ধানমন্ডি-১'), 'scan-line', false],
        ['Thu', '18 Sep', L('Off', 'ছুটি'), L('Swapped with Rumi', 'রুমির সাথে বদল'), 'repeat', false],
        ['Fri', '19 Sep', L('Off', 'ছুটি'), L('Weekly off', 'সাপ্তাহিক ছুটি'), 'minus', false],
        ['Sat', '20 Sep', L('10:00 – 18:00', '১০:০০ – ১৮:০০'), L('Dhanmondi-1', 'ধানমন্ডি-১'), 'scan-line', false]
      ].map(([dow, date, shift, note, icon, today]) => {
        const off = shift === L('Off', 'ছুটি');
        return { dow, date, shift, note, icon, today, off: off && !today, working: !off && !today };
      }),
      dows: [L('Sun', 'রবি'), L('Mon', 'সোম'), L('Tue', 'মঙ্গল'), L('Wed', 'বুধ'), L('Thu', 'বৃহ'), L('Fri', 'শুক্র'), L('Sat', 'শনি')].map(label => ({ label })),
      cal,
      log: logRows.map(([date, tin, tout, src, srcIcon, late, ot, note]) => ({
        date, in: tin, out: tout, src, srcIcon, ot, note,
        late: late || '—', isLate: !!late, onTime: !late
      })),
      sheet: !!sh, sheetTitle: sh ? sh.title : '', sheetBody: sh ? sh.body : '', sheetIcon: sh ? sh.icon : 'pencil',
      sheetVerb: sh ? sh.verb : '', sheetWarning: sh ? sh.warning : '', sheetFields: sh ? sh.fields : [],
      openShift: () => this.setState({ sheet: 'shift' }),
      openCorrection: () => this.setState({ sheet: 'correction' }),
      closeSheet: () => this.setState({ sheet: null }),
      stop: (e) => e.stopPropagation()
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.dc-h677:hover{background:#002a77 !important}
.dc-h678:hover{background:#f1f5f9 !important}
.dc-h679:hover{background:#f1f5f9 !important}
.dc-h680:hover{background:#f1f5f9 !important}
.dc-h681:hover{background:#f1f5f9 !important}
.dc-h682:hover{background:#f1f5f9 !important}
.dc-h683:hover{background:#002a77 !important}
.dc-h684:hover{background:#f1f5f9 !important}
.dc-h685:hover{background:#f1f5f9 !important}
.dc-f686:focus,.dc-f686:focus-visible,.dc-f686:focus-within{border-color:#003087 !important}
.dc-h687:hover{background:#f1f5f9 !important}
.dc-h688:hover{background:#002a77 !important}`;

// ---- markup ----

export default class StaffAttendanceScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="StaffAttendance">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px", fontFamily: "var(--font-sans)", color: "#475569" }}>
          <div className="gc-split" style={{ display: "grid", gridTemplateColumns: "340px minmax(0,1fr)", gap: "16px", alignItems: "start" }}>
            <section style={{ display: "flex", flexDirection: "column", gap: "13px", borderRadius: "var(--radius-lg)", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
              <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{v.t?.assigned}</h2>
              <div style={{ borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.06)", padding: "12px 14px" }}>
                <p style={{ margin: "0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)", color: "#1e293b" }}>10:00 – 18:00</p>
                <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>{v.t?.morningShift} · {v.t?.eightHours}</p>
              </div>
              <dl style={{ margin: "0", display: "flex", flexDirection: "column", gap: "9px", fontSize: "var(--text-xs-plus)" }}>
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
                  <dt style={{ margin: "0", flex: "1", color: "var(--text-muted)" }}>{v.t?.overtimeRule}</dt>
                  <dd style={{ margin: "0", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{v.t?.afterThirty}</dd>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <dt style={{ margin: "0", flex: "1", color: "var(--text-muted)" }}>{v.t?.effective}</dt>
                  <dd style={{ margin: "0", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>02 Mar 2026</dd>
                </div>
              </dl>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button className="dc-h677" type="button" onClick={v.openShift} style={{ flex: "1", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px", height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#fff", cursor: "pointer" }}><__Icon name="repeat" strokeWidth="1.75" width="15" height="15" />{v.t?.changeShift}</button>
                <button className="dc-h678" type="button" onClick={v.openCorrection} style={{ flex: "none", display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 13px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#475569", cursor: "pointer" }}><__Icon name="pencil-line" strokeWidth="1.75" width="15" height="15" />{v.t?.correction}</button>
              </div>
            </section>
            <section style={{ display: "flex", flexDirection: "column", gap: "14px", borderRadius: "var(--radius-lg)", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h2 style={{ margin: "0", flex: "1", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{v.t?.roster}</h2>
                <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>14 – 20 Sep 2026</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: "8px" }}>
                {__list(v.roster).map((r, $index) => (<React.Fragment key={$index}>
                    {r?.today ? (<>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", border: "1px solid rgba(0,48,135,.25)", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.06)", padding: "11px 10px" }}>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".04em", color: "var(--text-muted)" }}>{r?.dow}</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{r?.date}</span>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{r?.shift}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name={r?.icon} strokeWidth="1.75" width="12" height="12" />{r?.note}</span>
                      </div>
                    </>) : null}
                    {r?.working ? (<>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "11px 10px" }}>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".04em", color: "var(--text-muted)" }}>{r?.dow}</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{r?.date}</span>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{r?.shift}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name={r?.icon} strokeWidth="1.75" width="12" height="12" />{r?.note}</span>
                      </div>
                    </>) : null}
                    {r?.off ? (<>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "11px 10px" }}>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".04em", color: "var(--text-muted)" }}>{r?.dow}</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{r?.date}</span>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>{r?.shift}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><__Icon name={r?.icon} strokeWidth="1.75" width="12" height="12" />{r?.note}</span>
                      </div>
                    </>) : null}
                  </React.Fragment>))}
              </div>
            </section>
          </div>
          {v.hasData ? (<>
            <div className="gc-split" style={{ display: "grid", gridTemplateColumns: "420px minmax(0,1fr)", gap: "16px", alignItems: "start" }}>
              <section style={{ display: "flex", flexDirection: "column", gap: "12px", borderRadius: "var(--radius-lg)", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h2 style={{ margin: "0", flex: "1", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{v.t?.september}</h2>
                  <button className="dc-h679" type="button" aria-label={v.t?.prevMonth} style={{ width: "28px", height: "28px", display: "grid", placeItems: "center", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", color: "var(--text-muted)", cursor: "pointer" }}>
                    <__Icon name="chevron-left" strokeWidth="1.75" width="15" height="15" />
                  </button>
                  <button className="dc-h680" type="button" aria-label={v.t?.nextMonth} style={{ width: "28px", height: "28px", display: "grid", placeItems: "center", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", color: "var(--text-muted)", cursor: "pointer" }}>
                    <__Icon name="chevron-right" strokeWidth="1.75" width="15" height="15" />
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: "5px" }}>
                  {__list(v.dows).map((d, $index) => (<React.Fragment key={$index}>
                      <span style={{ textAlign: "center", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: ".04em", color: "var(--text-muted)" }}>{d?.label}</span>
                    </React.Fragment>))}
                  {__list(v.cal).map((c, $index) => (<React.Fragment key={$index}>
                      {c?.blank ? (<>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", aspectRatio: "1", borderRadius: "var(--radius-lg)", background: "transparent" }} />
                      </>) : null}
                      {c?.isPresent ? (<>
                        <div title={c?.title} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", aspectRatio: "1", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.12)", color: "#047857" }}>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", fontVariantNumeric: "tabular-nums", color: "#1e293b" }}>{c?.num}</span>
                          <__Icon name="check" strokeWidth="1.75" width="12" height="12" />
                        </div>
                      </>) : null}
                      {c?.isLate ? (<>
                        <div title={c?.title} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", aspectRatio: "1", borderRadius: "var(--radius-lg)", background: "rgba(255,152,0,.16)", color: "#b45309" }}>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", fontVariantNumeric: "tabular-nums", color: "#1e293b" }}>{c?.num}</span>
                          <__Icon name="clock" strokeWidth="1.75" width="12" height="12" />
                        </div>
                      </>) : null}
                      {c?.isLeave ? (<>
                        <div title={c?.title} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", aspectRatio: "1", borderRadius: "var(--radius-lg)", background: "rgba(0,156,222,.14)", color: "var(--accent-text)" }}>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", fontVariantNumeric: "tabular-nums", color: "#1e293b" }}>{c?.num}</span>
                          <__Icon name="palmtree" strokeWidth="1.75" width="12" height="12" />
                        </div>
                      </>) : null}
                      {c?.isHoliday ? (<>
                        <div title={c?.title} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", aspectRatio: "1", borderRadius: "var(--radius-lg)", background: "rgba(240,0,185,.1)", color: "#a21caf" }}>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", fontVariantNumeric: "tabular-nums", color: "#1e293b" }}>{c?.num}</span>
                          <__Icon name="flag" strokeWidth="1.75" width="12" height="12" />
                        </div>
                      </>) : null}
                      {c?.isOff ? (<>
                        <div title={c?.title} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", aspectRatio: "1", borderRadius: "var(--radius-lg)", background: "#f1f5f9", color: "var(--text-muted)" }}>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", fontVariantNumeric: "tabular-nums", color: "#1e293b" }}>{c?.num}</span>
                          <__Icon name="minus" strokeWidth="1.75" width="12" height="12" />
                        </div>
                      </>) : null}
                      {c?.isFuture ? (<>
                        <div title={c?.title} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", aspectRatio: "1", borderRadius: "var(--radius-lg)", background: "#f8fafc", color: "#cbd5e1" }}>
                          <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", fontVariantNumeric: "tabular-nums", color: "var(--text-muted)" }}>{c?.num}</span>
                        </div>
                      </>) : null}
                    </React.Fragment>))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", paddingTop: "2px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><span style={{ display: "grid", placeItems: "center", width: "18px", height: "18px", borderRadius: "var(--radius-sm)", background: "rgba(16,185,129,.12)", color: "#047857" }}>
  <__Icon name="check" strokeWidth="1.75" width="11" height="11" />
</span>{v.t?.present}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><span style={{ display: "grid", placeItems: "center", width: "18px", height: "18px", borderRadius: "var(--radius-sm)", background: "rgba(255,152,0,.16)", color: "#b45309" }}>
  <__Icon name="clock" strokeWidth="1.75" width="11" height="11" />
</span>{v.t?.late}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><span style={{ display: "grid", placeItems: "center", width: "18px", height: "18px", borderRadius: "var(--radius-sm)", background: "rgba(255,87,36,.12)", color: "#c2410c" }}>
  <__Icon name="x" strokeWidth="1.75" width="11" height="11" />
</span>{v.t?.absent}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><span style={{ display: "grid", placeItems: "center", width: "18px", height: "18px", borderRadius: "var(--radius-sm)", background: "rgba(0,156,222,.14)", color: "var(--accent-text)" }}>
  <__Icon name="palmtree" strokeWidth="1.75" width="11" height="11" />
</span>{v.t?.leaveWord}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><span style={{ display: "grid", placeItems: "center", width: "18px", height: "18px", borderRadius: "var(--radius-sm)", background: "rgba(240,0,185,.1)", color: "#a21caf" }}>
  <__Icon name="flag" strokeWidth="1.75" width="11" height="11" />
</span>{v.t?.holiday}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><span style={{ display: "grid", placeItems: "center", width: "18px", height: "18px", borderRadius: "var(--radius-sm)", background: "#f1f5f9", color: "var(--text-muted)" }}>
  <__Icon name="minus" strokeWidth="1.75" width="11" height="11" />
</span>{v.t?.weeklyOff}</span>
                </div>
              </section>
              <section style={{ borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "18px 20px 12px" }}>
                  <h2 style={{ margin: "0", flex: "1", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{v.t?.dailyLog}</h2>
                  <button className="dc-h681" type="button" style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "32px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#475569", cursor: "pointer" }}><__Icon name="download" strokeWidth="1.75" width="14" height="14" />{v.t?.export}</button>
                </div>
                <div className="gc-table-wrap">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <caption style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clipPath: "inset(50%)" }}>{v.t?.logCaption}</caption>
                    <thead>
                      <tr>
                        <th scope="col" style={{ padding: "8px 14px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--text-muted)", textAlign: "left", whiteSpace: "nowrap" }}>{v.t?.colDate}</th>
                        <th scope="col" style={{ padding: "8px 14px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--text-muted)", textAlign: "left", whiteSpace: "nowrap" }}>{v.t?.colIn}</th>
                        <th scope="col" style={{ padding: "8px 14px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--text-muted)", textAlign: "left", whiteSpace: "nowrap" }}>{v.t?.colOut}</th>
                        <th scope="col" style={{ padding: "8px 14px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--text-muted)", textAlign: "left", whiteSpace: "nowrap" }}>{v.t?.colSource}</th>
                        <th scope="col" style={{ padding: "8px 14px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--text-muted)", textAlign: "right", whiteSpace: "nowrap" }}>{v.t?.colLate}</th>
                        <th scope="col" style={{ padding: "8px 14px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--text-muted)", textAlign: "right", whiteSpace: "nowrap" }}>{v.t?.colOt}</th>
                        <th scope="col" style={{ padding: "8px 14px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", textTransform: "uppercase", color: "var(--text-muted)", textAlign: "left", whiteSpace: "nowrap" }}>{v.t?.colNote}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {__list(v.log).map((r, $index) => (<React.Fragment key={$index}>
                          <tr style={{ background: "#fff" }}>
                            <td style={{ padding: "11px 14px", borderBottom: "1px solid #e2e8f0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", whiteSpace: "nowrap" }}>{r?.date}</td>
                            <td style={{ padding: "11px 14px", borderBottom: "1px solid #e2e8f0", fontSize: "var(--text-xs-plus)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>{r?.in}</td>
                            <td style={{ padding: "11px 14px", borderBottom: "1px solid #e2e8f0", fontSize: "var(--text-xs-plus)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>{r?.out}</td>
                            <td style={{ padding: "11px 14px", borderBottom: "1px solid #e2e8f0", fontSize: "var(--text-xs-plus)", color: "#475569", whiteSpace: "nowrap" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><__Icon name={r?.srcIcon} strokeWidth="1.75" width="13" height="13" style={{ color: "var(--text-muted)" }} />{r?.src}</span>
                            </td>
                            {r?.isLate ? (<>
                              <td style={{ padding: "11px 14px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#b45309", fontVariantNumeric: "tabular-nums" }}>{r?.late}</td>
                            </>) : null}
                            {r?.onTime ? (<>
                              <td style={{ padding: "11px 14px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>—</td>
                            </>) : null}
                            <td style={{ padding: "11px 14px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontSize: "var(--text-xs-plus)", color: "#475569", fontVariantNumeric: "tabular-nums" }}>{r?.ot}</td>
                            <td style={{ padding: "11px 14px", borderBottom: "1px solid #e2e8f0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", textWrap: "pretty" }}>{r?.note}</td>
                          </tr>
                        </React.Fragment>))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 20px" }}>
                  <p style={{ margin: "0", flex: "1", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.t?.logMeta}</p>
                  <button className="dc-h682" type="button" style={{ height: "28px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer" }}>{v.t?.showAll}</button>
                </div>
              </section>
            </div>
          </>) : null}
          {v.noData ? (<>
            <section style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "11px", borderRadius: "var(--radius-lg)", background: "#fff", padding: "48px 20px", textAlign: "center", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
              <span style={{ display: "grid", placeItems: "center", width: "60px", height: "60px", borderRadius: "var(--radius-xl)", background: "#f1f5f9", color: "var(--text-muted)" }}>
                <__Icon name="calendar-off" strokeWidth="1.75" width="28" height="28" />
              </span>
              <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#1e293b" }}>{v.t?.emptyTitle}</h2>
              <p style={{ margin: "0", maxWidth: "420px", fontSize: "var(--text-sm)", lineHeight: "21px", color: "var(--text-muted)", textWrap: "pretty" }}>{v.t?.emptyBody}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button className="dc-h683" type="button" onClick={v.openShift} style={{ height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", padding: "0 15px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#fff", cursor: "pointer" }}>{v.t?.assignShift}</button>
                <button className="dc-h684" type="button" onClick={v.openCorrection} style={{ height: "36px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 15px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#475569", cursor: "pointer" }}>{v.t?.addManual}</button>
              </div>
            </section>
          </>) : null}
          {v.sheet ? (<>
            <div role="presentation" onClick={v.closeSheet} style={{ position: "fixed", inset: "0", zIndex: "200", display: "grid", placeItems: "center", background: "rgba(15,23,42,.6)", padding: "24px" }}>
              <div role="dialog" aria-modal="true" aria-label={v.sheetTitle} onClick={v.stop} style={{ width: "100%", maxWidth: "520px", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 26px 60px -20px rgba(15,23,42,.5)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "20px 22px 0" }}>
                  <span style={{ display: "grid", placeItems: "center", width: "38px", height: "38px", flex: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                    <__Icon name={v.sheetIcon} strokeWidth="1.75" width="20" height="20" />
                  </span>
                  <div style={{ flex: "1", minWidth: "0" }}>
                    <h2 style={{ margin: "0", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "#1e293b" }}>{v.sheetTitle}</h2>
                    <p style={{ margin: "4px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "var(--text-muted)", textWrap: "pretty" }}>{v.sheetBody}</p>
                  </div>
                  <button className="dc-h685" type="button" onClick={v.closeSheet} aria-label="Close" style={{ width: "28px", height: "28px", flex: "none", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-lg)", background: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                    <__Icon name="x" strokeWidth="1.75" width="17" height="17" />
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px 22px 0" }}>
                  {__list(v.sheetFields).map((f, $index) => (<React.Fragment key={$index}>
                      <label style={{ display: "block" }}>
                        <span style={{ display: "block", marginBottom: "6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "var(--text-muted)" }}>{f?.label}</span>
                        {" "}
                        <input className="dc-f686" type="text" defaultValue={f?.value} placeholder={f?.placeholder} style={{ width: "100%", height: "36px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 11px", fontFamily: "inherit", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                      </label>
                    </React.Fragment>))}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "9px", borderRadius: "var(--radius-lg)", background: "rgba(255,152,0,.1)", padding: "11px 13px" }}>
                    <__Icon name="shield-alert" strokeWidth="1.75" width="17" height="17" style={{ flex: "none", marginTop: "1px", color: "#b45309" }} />
                    <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "#1e293b", textWrap: "pretty" }}>{v.sheetWarning}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", marginTop: "18px", padding: "14px 22px", borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
                  <button className="dc-h687" type="button" onClick={v.closeSheet} style={{ height: "36px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 15px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#475569", cursor: "pointer" }}>{v.t?.cancel}</button>
                  <button className="dc-h688" type="button" onClick={v.closeSheet} style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", padding: "0 16px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#fff", cursor: "pointer" }}><__Icon name="send" strokeWidth="1.75" width="16" height="16" />{v.sheetVerb}</button>
                </div>
              </div>
            </div>
          </>) : null}
        </div>
      </div>
    );
  }
}
