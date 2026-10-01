'use client';
// IdCard — a staff ID card, front and back, at the real card size (CR80, 54 × 85.6 mm, portrait).
// The QR holds the employee number (or a link, HR setup › Employee numbers). Printing a page with
// cards prints only the cards (ID_CARD_CSS), several to an A4 page with cut lines.

import React from 'react';
import { MERCHANT } from '@/lib/merchant';
import { QrCode } from '@/components/QrCode';
import { initials, qrTextOf, dayLabel, addDays } from '@/lib/hr';

export const ID_CARD_CSS = `
.idc-pair{display:flex;flex-wrap:wrap;gap:var(--space-3)}
.idc{position:relative;display:flex;flex-direction:column;width:216px;height:342px;flex:none;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);overflow:hidden;box-shadow:var(--shadow-sm);font-family:var(--font-sans)}
.idc__top{display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--primary);color:var(--text-on-primary, #fff)}
.idc__top b{display:block;font-size:var(--text-xs);font-weight:var(--weight-semibold);line-height:1.2}
.idc__top small{display:block;font-size:10px;opacity:.8;line-height:1.2}
.idc__logo{display:grid;place-items:center;width:26px;height:26px;border-radius:var(--radius-md);background:rgba(255,255,255,.16);flex:none}
.idc__body{display:flex;flex-direction:column;align-items:center;gap:2px;padding:14px 12px 0;text-align:center;flex:1}
.idc__photo{display:grid;place-items:center;width:76px;height:76px;margin-bottom:6px;border-radius:var(--radius-full);border:3px solid var(--fill-primary-soft);background:var(--surface-subtle);color:var(--primary);font-size:22px;font-weight:var(--weight-semibold)}
.idc__name{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);line-height:1.25}
.idc__bn{font-family:var(--font-bn);font-size:var(--text-xs);color:var(--text-body);line-height:1.3}
.idc__role{margin-top:2px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--primary)}
.idc__place{font-size:10px;color:var(--text-muted)}
.idc__foot{display:flex;align-items:flex-end;justify-content:space-between;gap:8px;padding:8px 12px 10px}
.idc__no{font-family:var(--font-data);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading);letter-spacing:.04em}
.idc__meta{display:flex;flex-direction:column;gap:1px;text-align:left;font-size:10px;color:var(--text-muted);line-height:1.35}
.idc__meta b{color:var(--text-heading);font-weight:var(--weight-medium)}
.idc__qr{border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:2px;background:#fff;line-height:0}
.idc__band{height:6px;background:linear-gradient(90deg,var(--primary),var(--secondary))}
.idc--back .idc__body{align-items:stretch;text-align:left;gap:8px;padding-top:12px}
.idc__rows{display:flex;flex-direction:column;gap:6px;font-size:10px;color:var(--text-muted);line-height:1.35}
.idc__rows b{display:block;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-heading)}
.idc__note{margin-top:auto;padding:8px 10px;border-radius:var(--radius-md);background:var(--surface-subtle);font-size:10px;line-height:1.4;color:var(--text-body)}
.idc__sign{display:flex;justify-content:space-between;align-items:flex-end;padding:8px 12px 10px;font-size:10px;color:var(--text-muted)}
.idc__sign span{border-top:1px solid var(--text-body);padding-top:2px}
`;
/** Print rules for printNode(): cards at their real size, several to an A4 page, with cut lines. */
export const ID_CARD_PRINT = `
@page{size:A4 portrait;margin:10mm}
.idc-print{display:flex!important;flex-wrap:wrap;gap:5mm}
.idc-print .idc-pair{gap:1mm;break-inside:avoid}
.idc{width:54mm!important;height:85.6mm!important;border:0.2mm dashed var(--text-faint)!important;border-radius:3mm!important;box-shadow:none!important}
`;

const Logo = () => (
  <span className="idc__logo" aria-hidden="true">
    <svg width="16" height="16" viewBox="0 0 52 52"><path d="M35 19a10 10 0 1 0 1 13v-6h-9" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </span>
);

/** Card validity: from the day it is issued, for HR setup's number of years. */
export const cardValidTo = (S, issued) => addDays(issued, Math.round(365.25 * ((S.settings.idCard || {}).validYears || 2)));

export function IdCardFront({ S, st }) {
  const opt = S.settings.idCard || {};
  return (
    <div className="idc" aria-label={`ID card front · ${st.name}`}>
      <div className="idc__top"><Logo /><span><b>{MERCHANT.name}</b><small>{MERCHANT.tagline}</small></span></div>
      <div className="idc__body">
        <span className="idc__photo" aria-hidden="true">{initials(st.name)}</span>
        <span className="idc__name">{st.name}</span>
        {st.nameBn ? <span className="idc__bn" lang="bn">{st.nameBn}</span> : null}
        <span className="idc__role">{st.designation}</span>
        <span className="idc__place">{st.department} · {st.branch}</span>
      </div>
      <div className="idc__foot">
        <div className="idc__meta">
          <span className="idc__no">{st.code}</span>
          {opt.showBlood !== false && st.blood ? <span>Blood <b>{st.blood}</b></span> : null}
          <span>Joined <b>{dayLabel(st.joined, true)}</b></span>
        </div>
        <span className="idc__qr"><QrCode text={qrTextOf(S, st, MERCHANT.web)} size={68} quiet={1} label={`QR code for ${st.code}`} /></span>
      </div>
      <div className="idc__band" />
    </div>
  );
}

export function IdCardBack({ S, st, issued }) {
  const opt = S.settings.idCard || {};
  return (
    <div className="idc idc--back" aria-label={`ID card back · ${st.name}`}>
      <div className="idc__top"><Logo /><span><b>Staff identity card</b><small>{st.code}</small></span></div>
      <div className="idc__body">
        <div className="idc__rows">
          {opt.showPhone !== false ? <span>Mobile<b>{st.phone}</b></span> : null}
          {st.emergency && st.emergency.phone ? <span>In an emergency call<b>{st.emergency.name} ({st.emergency.relation})</b><b>{st.emergency.phone}</b></span> : null}
          <span>Issued · valid to<b>{dayLabel(issued, true)} · {dayLabel(cardValidTo(S, issued), true)}</b></span>
        </div>
        <p className="idc__note">This card belongs to {MERCHANT.name}. If found, please return it to {MERCHANT.address} or call {MERCHANT.phone}.</p>
      </div>
      <div className="idc__sign"><span>Card holder</span><span>Authorised by</span></div>
      <div className="idc__band" />
    </div>
  );
}

/** Front and back side by side. */
export function IdCard({ S, st, issued }) {
  return <div className="idc-pair"><IdCardFront S={S} st={st} /><IdCardBack S={S} st={st} issued={issued} /></div>;
}
