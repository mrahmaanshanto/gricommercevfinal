'use client';
// Generated from design/templates/staff-profile/StaffActivity.dc.html by scripts/convert-design.mjs.
// Profile · activity
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  state = { filter: 'all' };
  componentDidMount() { this.paint(); }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 200); setTimeout(go, 700); setTimeout(go, 2000);
  }
  renderVals() {
    const bn = (this.props.lang ?? 'en') === 'bn';
    const L = (en, b) => bn ? b : en;
    const tone = { login: 'log-in', order: 'shopping-bag', sale: 'receipt', discount: 'percent', refund: 'rotate-ccw', approval: 'check-check', perm: 'shield-check' };
    const ALL = [
      ['sale', L('Confirmed counter sale #GC-24118', 'কাউন্টার বিক্রি #GC-24118 নিশ্চিত'), L('৳2,340 · cash · 4 items · Dhanmondi-1', '৳২,৩৪০ · ক্যাশ · ৪টি পণ্য · ধানমন্ডি-১'), L('16 Sep, 12:04 PM', '১৬ সেপ, ১২:০৪ PM'), [L('POS', 'POS'), L('Cash', 'ক্যাশ')]],
      ['discount', L('Applied 5% discount on #GC-24116', '#GC-24116-এ ৫% ছাড়'), L('৳180 off ৳3,600 · within her 5% limit · no approval needed', '৳৩,৬০০-এ ৳১৮০ ছাড় · ৫% সীমার মধ্যে · অনুমোদন লাগেনি'), L('16 Sep, 11:41 AM', '১৬ সেপ, ১১:৪১ AM'), [L('Within limit', 'সীমার মধ্যে')]],
      ['order', L('Confirmed online order #GC-24109', 'অনলাইন অর্ডার #GC-24109 নিশ্চিত'), L('Facebook order · Mirpur · cash on delivery ৳1,250', 'ফেসবুক অর্ডার · মিরপুর · ক্যাশ অন ডেলিভারি ৳১,২৫০'), L('16 Sep, 10:58 AM', '১৬ সেপ, ১০:৫৮ AM'), [L('Online', 'অনলাইন')]],
      ['login', L('Signed in at POS Dhanmondi-1', 'POS ধানমন্ডি-১-এ সাইন ইন'), L('Android tablet · PIN · IP 103.108.x.x · two-factor passed', 'অ্যান্ড্রয়েড ট্যাব · পিন · IP 103.108.x.x · দুই স্তর সফল'), L('16 Sep, 9:56 AM', '১৬ সেপ, ৯:৫৬ AM'), [L('Two-factor', 'দুই স্তর')]],
      ['refund', L('Requested refund on #GC-24061', '#GC-24061-এ ফেরতের অনুরোধ'), L('৳1,200 · above her ৳2,000 limit? no · sent to Nusrat Jahan anyway (damaged item)', '৳১,২০০ · সীমার মধ্যে · তবু নুসরাত জাহানের কাছে পাঠানো (ক্ষতিগ্রস্ত পণ্য)'), L('15 Sep, 5:22 PM', '১৫ সেপ, ৫:২২ PM'), [L('Pending approval', 'অনুমোদনের অপেক্ষায়')]],
      ['approval', L('Overtime approved by Nusrat Jahan', 'নুসরাত জাহান ওভারটাইম অনুমোদন করেছেন'), L('2.2 hours on 10 Sep · Eid rush at the counter', '১০ সেপ ২.২ ঘণ্টা · ঈদের ভিড়'), L('11 Sep, 10:15 AM', '১১ সেপ, ১০:১৫ AM'), [L('Attendance', 'হাজিরা')]],
      ['perm', L('Ashiq Khan set max discount to 5%', 'আশিক খান সর্বোচ্চ ছাড় ৫% করেছেন'), L('Was 3% · personal override on the Cashier role', 'আগে ৩% · ক্যাশিয়ার রোলে ব্যক্তিগত ওভাররাইড'), L('02 Sep, 4:12 PM', '০২ সেপ, ৪:১২ PM'), [L('Permission change', 'অনুমতি পরিবর্তন'), L('By owner', 'মালিক কর্তৃক')]],
      ['sale', L('Closed cash drawer · ৳18,420 counted', 'ক্যাশ ড্রয়ার বন্ধ · ৳১৮,৪২০ গণনা'), L('Expected ৳18,420 · no variance · deposited to bKash merchant', 'প্রত্যাশিত ৳১৮,৪২০ · কোনো গরমিল নেই · বিকাশ মার্চেন্টে জমা'), L('15 Sep, 6:24 PM', '১৫ সেপ, ৬:২৪ PM'), [L('Cash', 'ক্যাশ')]],
      ['perm', L('Nusrat Jahan blocked POS returns', 'নুসরাত জাহান POS ফেরত বন্ধ করেছেন'), L('Delete on POS turned off for all cashiers after a stock mismatch', 'স্টক গরমিলের পর সব ক্যাশিয়ারের POS ডিলিট বন্ধ'), L('18 Aug, 11:03 AM', '১৮ আগ, ১১:০৩ AM'), [L('Permission change', 'অনুমতি পরিবর্তন')]],
      ['login', L('Signed in from Chrome on Windows', 'উইন্ডোজ ক্রোম থেকে সাইন ইন'), L('New device · SMS code verified · owner alerted', 'নতুন ডিভাইস · SMS কোড যাচাই · মালিককে জানানো হয়েছে'), L('14 Sep, 6:10 PM', '১৪ সেপ, ৬:১০ PM'), [L('New device', 'নতুন ডিভাইস')]]
    ];
    const FILTERS = [
      ['all', L('All', 'সব'), 'list'], ['login', L('Logins', 'লগইন'), 'log-in'], ['order', L('Orders', 'অর্ডার'), 'shopping-bag'],
      ['sale', L('Sales', 'বিক্রয়'), 'receipt'], ['discount', L('Discounts', 'ছাড়'), 'percent'], ['refund', L('Refunds', 'ফেরত'), 'rotate-ccw'],
      ['approval', L('Approvals', 'অনুমোদন'), 'check-check'], ['perm', L('Permission changes', 'অনুমতি পরিবর্তন'), 'shield-check']
    ];
    const f = this.state.filter;
    const shown = ALL.filter(r => f === 'all' || r[0] === f);
    return {
      t: {
        title: L('Activity log', 'কার্যক্রমের লগ'), export: L('Export CSV', 'CSV এক্সপোর্ট'), filterLabel: L('Filter by type', 'ধরন অনুযায়ী ফিল্টার'),
        loadMore: L('Load 30 more entries', 'আরও ৩০টি দেখুন'),
        sessionsTitle: L('Sessions and devices', 'সেশন ও ডিভাইস'),
        countsTitle: L('September so far', 'সেপ্টেম্বর এখন পর্যন্ত'),
        countsNote: L('Counted from her own actions only. Actions taken by a manager on her behalf appear with the manager\u2019s name.', 'শুধু তাঁর নিজের কাজ গণনা করা হয়েছে। ম্যানেজার তাঁর পক্ষে কিছু করলে ম্যানেজারের নামে দেখাবে।')
      },
      meta: L(shown.length + ' of 312 entries · last 30 days · Asia/Dhaka', '৩১২টির মধ্যে ' + shown.length + 'টি · শেষ ৩০ দিন · এশিয়া/ঢাকা'),
      filters: FILTERS.map(([key, label, icon]) => {
        const on = f === key;
        const count = key === 'all' ? ALL.length : ALL.filter(r => r[0] === key).length;
        return { label, icon, count: String(count), on, off: !on, act: () => this.setState({ filter: key }) };
      }),
      items: shown.map(([kind, text, detail, when, tags], i) => ({
        text, detail, when,
        icon: tone[kind],
        notLast: i !== shown.length - 1,
        tags: tags.map(label => ({ label }))
      })),
      sessions: [
        { device: L('POS Dhanmondi-1', 'POS ধানমন্ডি-১'), meta: L('Android tablet · signed in now · since 9:56 AM', 'অ্যান্ড্রয়েড ট্যাব · এখন সাইন-ইন · ৯:৫৬ AM থেকে'), icon: 'tablet' },
        { device: L('GridCommerce app', 'গ্রিডকমার্স অ্যাপ'), meta: L('Redmi Note 12 · last active 16 Sep, 8:40 AM', 'রেডমি নোট ১২ · শেষ সক্রিয় ১৬ সেপ, ৮:৪০ AM'), icon: 'smartphone' },
        { device: L('Chrome on Windows', 'উইন্ডোজ ক্রোম'), meta: L('Shop back office · last active 14 Sep, 6:10 PM', 'দোকানের অফিস · শেষ সক্রিয় ১৪ সেপ, ৬:১০ PM'), icon: 'monitor' }
      ],
      counts: [
        { label: L('Sales entered', 'বিক্রয় এন্ট্রি'), value: '184' },
        { label: L('Online orders confirmed', 'অনলাইন অর্ডার নিশ্চিত'), value: '46' },
        { label: L('Discounts applied', 'ছাড় দেওয়া'), value: '23' },
        { label: L('Refunds requested', 'ফেরতের অনুরোধ'), value: '3' },
        { label: L('Logins', 'লগইন'), value: '19' }
      ]
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.dc-h674:hover{background:#f1f5f9 !important}
.dc-h675:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-h676:hover{background:#f1f5f9 !important}`;

// ---- markup ----

export default class StaffActivityScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="StaffActivity">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-split" style={{ width: "100%", display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: "16px", alignItems: "start", fontFamily: "var(--font-sans)", color: "#475569" }}>
          <section style={{ display: "flex", flexDirection: "column", gap: "16px", borderRadius: "var(--radius-lg)", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <div style={{ flex: "1", minWidth: "180px" }}>
                <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{v.t?.title}</h2>
                <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.meta}</p>
              </div>
              <button className="dc-h674" type="button" style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "32px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#475569", cursor: "pointer" }}><__Icon name="download" strokeWidth="1.75" width="14" height="14" />{v.t?.export}</button>
            </div>
            <div role="group" aria-label={v.t?.filterLabel} style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              {__list(v.filters).map((f, $index) => (<React.Fragment key={$index}>
                  {f?.on ? (<>
                    <button type="button" onClick={f?.act} aria-pressed="true" style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "32px", border: "1px solid rgba(0,48,135,.25)", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer", color: "#003087" }}><__Icon name={f?.icon} strokeWidth="1.75" width="13" height="13" />{f?.label}<span style={{ fontVariantNumeric: "tabular-nums", opacity: ".7" }}>{f?.count}</span></button>
                  </>) : null}
                  {f?.off ? (<>
                    <button className="dc-h675" type="button" onClick={f?.act} aria-pressed="false" style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "32px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-full)", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer", color: "#475569" }}><__Icon name={f?.icon} strokeWidth="1.75" width="13" height="13" />{f?.label}<span style={{ fontVariantNumeric: "tabular-nums", opacity: ".7" }}>{f?.count}</span></button>
                  </>) : null}
                </React.Fragment>))}
            </div>
            <ol style={{ margin: "0", padding: "0", listStyle: "none", display: "flex", flexDirection: "column" }}>
              {__list(v.items).map((a, $index) => (<React.Fragment key={$index}>
                  <li style={{ display: "flex", alignItems: "stretch", gap: "14px" }}>
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none", width: "32px" }}>
                      <span style={{ display: "grid", placeItems: "center", width: "32px", height: "32px", flex: "none", borderRadius: "var(--radius-full)", background: "#f1f5f9", color: "#475569" }}>
                        <__Icon name={a?.icon} strokeWidth="1.75" width="15" height="15" />
                      </span>
                      {a?.notLast ? (<>
                        <span style={{ flex: "1", width: "2px", background: "#e2e8f0" }} />
                      </>) : null}
                    </span>
                    <div style={{ flex: "1", minWidth: "0", paddingBottom: "18px" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                        <p style={{ margin: "0", flex: "1", minWidth: "200px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b", textWrap: "pretty" }}>{a?.text}</p>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{a?.when}</span>
                      </div>
                      <p style={{ margin: "3px 0 0", fontSize: "var(--text-xs-plus)", lineHeight: "19px", color: "var(--text-muted)", textWrap: "pretty" }}>{a?.detail}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "7px", flexWrap: "wrap" }}>
                        {__list(a?.tags).map((g, $index) => (<React.Fragment key={$index}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "22px", borderRadius: "var(--radius-full)", background: "#f1f5f9", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569" }}>{g?.label}</span>
                          </React.Fragment>))}
                      </div>
                    </div>
                  </li>
                </React.Fragment>))}
            </ol>
            <button className="dc-h676" type="button" style={{ alignSelf: "flex-start", height: "36px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 15px", fontFamily: "inherit", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#475569", cursor: "pointer" }}>{v.t?.loadMore}</button>
          </section>
          <aside style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <section style={{ display: "flex", flexDirection: "column", gap: "12px", borderRadius: "var(--radius-lg)", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
              <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{v.t?.sessionsTitle}</h2>
              {__list(v.sessions).map((s, $index) => (<React.Fragment key={$index}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <__Icon name={s?.icon} strokeWidth="1.75" width="17" height="17" style={{ flex: "none", marginTop: "2px", color: "var(--text-muted)" }} />
                    <div style={{ minWidth: "0" }}>
                      <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{s?.device}</p>
                      <p style={{ margin: "1px 0 0", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", textWrap: "pretty" }}>{s?.meta}</p>
                    </div>
                  </div>
                </React.Fragment>))}
            </section>
            <section style={{ display: "flex", flexDirection: "column", gap: "11px", borderRadius: "var(--radius-lg)", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
              <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", lineHeight: "22px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{v.t?.countsTitle}</h2>
              {__list(v.counts).map((c, $index) => (<React.Fragment key={$index}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ flex: "1", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{c?.label}</span>
                    <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>{c?.value}</span>
                  </div>
                </React.Fragment>))}
              <p style={{ margin: "0", fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)", textWrap: "pretty" }}>{v.t?.countsNote}</p>
            </section>
          </aside>
        </div>
      </div>
    );
  }
}
