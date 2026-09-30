'use client';
// Generated from design/templates/staff-profile/StaffDocs.dc.html by scripts/convert-design.mjs.
// Profile · documents
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
    return {
      t: {
        title: L('Documents', 'কাগজপত্র'), meta: L('5 files · 8.4 MB · visible to owner, manager and HR only', '৫টি ফাইল · ৮.৪ MB · শুধু মালিক, ম্যানেজার ও এইচআর দেখতে পারেন'),
        upload: L('Upload document', 'ডকুমেন্ট আপলোড'), view: L('Preview', 'প্রিভিউ'), download: L('Download', 'ডাউনলোড'),
        verified: L('Verified', 'যাচাইকৃত'), awaiting: L('Awaiting review', 'পর্যালোচনার অপেক্ষায়'),
        doc1: L('Employment contract', 'নিয়োগ চুক্তি'), doc1Meta: L('PDF · 1.2 MB · uploaded 02 Mar 2026 by Ashiq Khan', 'PDF · ১.২ MB · আপলোড ০২ মার্চ ২০২৬, আশিক খান'),
        doc2: L('National ID (NID) copy', 'জাতীয় পরিচয়পত্র (NID)'), doc2Meta: L('JPG · 2.8 MB · uploaded 02 Mar 2026 · NID 19XX XXXX XXXX', 'JPG · ২.৮ MB · আপলোড ০২ মার্চ ২০২৬ · NID 19XX XXXX XXXX'),
        doc3: L('SSC certificate', 'এসএসসি সার্টিফিকেট'), doc3Meta: L('PDF · 900 KB · uploaded 04 Mar 2026', 'PDF · ৯০০ KB · আপলোড ০৪ মার্চ ২০২৬'),
        doc4: L('POS handling training', 'POS প্রশিক্ষণ'), doc4Meta: L('PDF · 1.1 MB · uploaded 18 Mar 2026 · in-house course', 'PDF · ১.১ MB · আপলোড ১৮ মার্চ ২০২৬ · অভ্যন্তরীণ কোর্স'),
        doc5: L('Bank and bKash details form', 'ব্যাংক ও বিকাশ তথ্য ফর্ম'), doc5Meta: L('JPG · 2.4 MB · uploaded 11 Sep 2026 · replaces the March copy', 'JPG · ২.৪ MB · আপলোড ১১ সেপ ২০২৬ · মার্চের কপির বদলে'),
        dropTitle: L('Drop a file here', 'ফাইল এখানে ছাড়ুন'), dropBody: L('PDF, JPG or PNG up to 10 MB', 'PDF, JPG বা PNG সর্বোচ্চ ১০ MB'),
        missingTitle: L('Trade licence copy is missing', 'ট্রেড লাইসেন্সের কপি নেই'),
        missingBody: L('Not required for a cashier, but the shop\u2019s HR checklist marks it pending for staff who handle cash above ৳20,000 a day.', 'ক্যাশিয়ারের জন্য বাধ্যতামূলক নয়, তবে দিনে ৳২০,০০০-এর বেশি ক্যাশ হ্যান্ডেল করলে এইচআর চেকলিস্টে অপেক্ষমাণ দেখায়।'),
        remind: L('Send a reminder', 'স্মারক পাঠান')
      }
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `.dc-h701:hover{background:#002a77 !important}
.dc-h702:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-h703:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-h704:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-h705:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-h706:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-h707:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-h708:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-h709:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-h710:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-h711:hover{background:#f1f5f9 !important;color:#1e293b !important}
.dc-h712:hover{border-color:#003087 !important;background:rgba(0,48,135,.04) !important}
.dc-h713:hover{background:#f1f5f9 !important}`;

// ---- markup ----

export default class StaffDocsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="StaffDocs">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px", fontFamily: "Poppins,'Hind Siliguri',ui-sans-serif,system-ui,sans-serif", color: "#475569" }}>
          <section style={{ display: "flex", flexDirection: "column", gap: "14px", borderRadius: "8px", background: "#fff", padding: "18px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <div style={{ flex: "1", minWidth: "200px" }}>
                <h2 style={{ margin: "0", fontSize: "15px", lineHeight: "22px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b" }}>{v.t?.title}</h2>
                <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748b" }}>{v.t?.meta}</p>
              </div>
              <button className="dc-h701" type="button" style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", border: "none", borderRadius: "8px", background: "#003087", padding: "0 15px", fontFamily: "inherit", fontSize: "14px", fontWeight: "500", letterSpacing: ".025em", color: "#fff", cursor: "pointer" }}><__Icon name="upload" strokeWidth="1.75" width="16" height="16" />{v.t?.upload}</button>
            </div>
            <ul style={{ margin: "0", padding: "0", listStyle: "none", display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "12px" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "13px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "14px 15px" }}>
                <span style={{ display: "grid", placeItems: "center", width: "40px", height: "40px", flex: "none", borderRadius: "8px", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                  <__Icon name="file-text" strokeWidth="1.75" width="19" height="19" />
                </span>
                <div style={{ flex: "1", minWidth: "0" }}>
                  <p style={{ margin: "0", fontSize: "13.5px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b", textWrap: "pretty" }}>{v.t?.doc1}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>{v.t?.doc1Meta}</p>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", marginTop: "6px", height: "22px", borderRadius: "9999px", background: "rgba(16,185,129,.12)", padding: "0 9px", fontSize: "11.5px", fontWeight: "600", color: "#047857" }}><__Icon name="check" strokeWidth="1.75" width="12" height="12" />{v.t?.verified}</span>
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", flex: "none" }}>
                  <button className="dc-h702" type="button" aria-label={`${v.t?.view ?? ""} — ${v.t?.doc1 ?? ""}`} title={v.t?.view} style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#64748b", cursor: "pointer" }}>
                    <__Icon name="eye" strokeWidth="1.75" width="15" height="15" />
                  </button>
                  <button className="dc-h703" type="button" aria-label={`${v.t?.download ?? ""} — ${v.t?.doc1 ?? ""}`} title={v.t?.download} style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#64748b", cursor: "pointer" }}>
                    <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                  </button>
                </span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "13px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "14px 15px" }}>
                <span style={{ display: "grid", placeItems: "center", width: "40px", height: "40px", flex: "none", borderRadius: "8px", background: "rgba(0,156,222,.12)", color: "#0089c3" }}>
                  <__Icon name="id-card" strokeWidth="1.75" width="19" height="19" />
                </span>
                <div style={{ flex: "1", minWidth: "0" }}>
                  <p style={{ margin: "0", fontSize: "13.5px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b", textWrap: "pretty" }}>{v.t?.doc2}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>{v.t?.doc2Meta}</p>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", marginTop: "6px", height: "22px", borderRadius: "9999px", background: "rgba(16,185,129,.12)", padding: "0 9px", fontSize: "11.5px", fontWeight: "600", color: "#047857" }}><__Icon name="check" strokeWidth="1.75" width="12" height="12" />{v.t?.verified}</span>
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", flex: "none" }}>
                  <button className="dc-h704" type="button" aria-label={`${v.t?.view ?? ""} — ${v.t?.doc2 ?? ""}`} title={v.t?.view} style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#64748b", cursor: "pointer" }}>
                    <__Icon name="eye" strokeWidth="1.75" width="15" height="15" />
                  </button>
                  <button className="dc-h705" type="button" aria-label={`${v.t?.download ?? ""} — ${v.t?.doc2 ?? ""}`} title={v.t?.download} style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#64748b", cursor: "pointer" }}>
                    <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                  </button>
                </span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "13px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "14px 15px" }}>
                <span style={{ display: "grid", placeItems: "center", width: "40px", height: "40px", flex: "none", borderRadius: "8px", background: "rgba(16,185,129,.12)", color: "#047857" }}>
                  <__Icon name="graduation-cap" strokeWidth="1.75" width="19" height="19" />
                </span>
                <div style={{ flex: "1", minWidth: "0" }}>
                  <p style={{ margin: "0", fontSize: "13.5px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b", textWrap: "pretty" }}>{v.t?.doc3}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>{v.t?.doc3Meta}</p>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", marginTop: "6px", height: "22px", borderRadius: "9999px", background: "rgba(16,185,129,.12)", padding: "0 9px", fontSize: "11.5px", fontWeight: "600", color: "#047857" }}><__Icon name="check" strokeWidth="1.75" width="12" height="12" />{v.t?.verified}</span>
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", flex: "none" }}>
                  <button className="dc-h706" type="button" aria-label={`${v.t?.view ?? ""} — ${v.t?.doc3 ?? ""}`} title={v.t?.view} style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#64748b", cursor: "pointer" }}>
                    <__Icon name="eye" strokeWidth="1.75" width="15" height="15" />
                  </button>
                  <button className="dc-h707" type="button" aria-label={`${v.t?.download ?? ""} — ${v.t?.doc3 ?? ""}`} title={v.t?.download} style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#64748b", cursor: "pointer" }}>
                    <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                  </button>
                </span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "13px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "14px 15px" }}>
                <span style={{ display: "grid", placeItems: "center", width: "40px", height: "40px", flex: "none", borderRadius: "8px", background: "rgba(240,0,185,.08)", color: "#a21caf" }}>
                  <__Icon name="award" strokeWidth="1.75" width="19" height="19" />
                </span>
                <div style={{ flex: "1", minWidth: "0" }}>
                  <p style={{ margin: "0", fontSize: "13.5px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b", textWrap: "pretty" }}>{v.t?.doc4}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>{v.t?.doc4Meta}</p>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", marginTop: "6px", height: "22px", borderRadius: "9999px", background: "rgba(16,185,129,.12)", padding: "0 9px", fontSize: "11.5px", fontWeight: "600", color: "#047857" }}><__Icon name="check" strokeWidth="1.75" width="12" height="12" />{v.t?.verified}</span>
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", flex: "none" }}>
                  <button className="dc-h708" type="button" aria-label={`${v.t?.view ?? ""} — ${v.t?.doc4 ?? ""}`} title={v.t?.view} style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#64748b", cursor: "pointer" }}>
                    <__Icon name="eye" strokeWidth="1.75" width="15" height="15" />
                  </button>
                  <button className="dc-h709" type="button" aria-label={`${v.t?.download ?? ""} — ${v.t?.doc4 ?? ""}`} title={v.t?.download} style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#64748b", cursor: "pointer" }}>
                    <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                  </button>
                </span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "13px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "14px 15px" }}>
                <span style={{ display: "grid", placeItems: "center", width: "40px", height: "40px", flex: "none", borderRadius: "8px", background: "rgba(255,152,0,.14)", color: "#b45309" }}>
                  <__Icon name="landmark" strokeWidth="1.75" width="19" height="19" />
                </span>
                <div style={{ flex: "1", minWidth: "0" }}>
                  <p style={{ margin: "0", fontSize: "13.5px", fontWeight: "600", letterSpacing: ".025em", color: "#1e293b", textWrap: "pretty" }}>{v.t?.doc5}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>{v.t?.doc5Meta}</p>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", marginTop: "6px", height: "22px", borderRadius: "9999px", background: "rgba(255,152,0,.14)", padding: "0 9px", fontSize: "11.5px", fontWeight: "600", color: "#b45309" }}><__Icon name="clock" strokeWidth="1.75" width="12" height="12" />{v.t?.awaiting}</span>
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", flex: "none" }}>
                  <button className="dc-h710" type="button" aria-label={`${v.t?.view ?? ""} — ${v.t?.doc5 ?? ""}`} title={v.t?.view} style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#64748b", cursor: "pointer" }}>
                    <__Icon name="eye" strokeWidth="1.75" width="15" height="15" />
                  </button>
                  <button className="dc-h711" type="button" aria-label={`${v.t?.download ?? ""} — ${v.t?.doc5 ?? ""}`} title={v.t?.download} style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", color: "#64748b", cursor: "pointer" }}>
                    <__Icon name="download" strokeWidth="1.75" width="15" height="15" />
                  </button>
                </span>
              </li>
              <li>
                <button className="dc-h712" type="button" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "7px", width: "100%", height: "100%", minHeight: "96px", border: "2px dashed #cbd5e1", borderRadius: "8px", background: "#f8fafc", padding: "16px", fontFamily: "inherit", cursor: "pointer" }}>
                  <__Icon name="upload-cloud" strokeWidth="1.75" width="22" height="22" style={{ color: "#64748b" }} />
                  <span style={{ fontSize: "13px", fontWeight: "500", letterSpacing: ".025em", color: "#1e293b" }}>{v.t?.dropTitle}</span>
                  <span style={{ fontSize: "12px", color: "#64748b", textWrap: "pretty" }}>{v.t?.dropBody}</span>
                </button>
              </li>
            </ul>
          </section>
          <section style={{ display: "flex", alignItems: "flex-start", gap: "11px", borderRadius: "8px", background: "#fff", padding: "16px 20px", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)" }}>
            <span style={{ display: "grid", placeItems: "center", width: "32px", height: "32px", flex: "none", borderRadius: "8px", background: "rgba(255,152,0,.12)", color: "#b45309" }}>
              <__Icon name="shield-alert" strokeWidth="1.75" width="17" height="17" />
            </span>
            <div style={{ flex: "1", minWidth: "0" }}>
              <p style={{ margin: "0", fontSize: "13.5px", fontWeight: "600", color: "#1e293b" }}>{v.t?.missingTitle}</p>
              <p style={{ margin: "2px 0 0", fontSize: "12.5px", lineHeight: "19px", color: "#64748b", textWrap: "pretty" }}>{v.t?.missingBody}</p>
            </div>
            <button className="dc-h713" type="button" style={{ flex: "none", height: "32px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", padding: "0 12px", fontFamily: "inherit", fontSize: "12.5px", fontWeight: "500", letterSpacing: ".025em", color: "#475569", cursor: "pointer" }}>{v.t?.remind}</button>
          </section>
        </div>
      </div>
    );
  }
}
