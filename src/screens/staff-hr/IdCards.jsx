'use client';
// ID cards & QR (/id-cards) — print staff ID cards (front and back, real card size, several to an A4 page) with a QR
// code holding the employee number (or a link, by the setting here). A scan box checks a card: a USB / Bluetooth QR
// scanner types the code into it, or type the employee number.

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState, InfoTip, StatusBadge } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { fromKey } from '@/lib/settlements';
import { printNode } from '@/lib/printNode';
import { todayKey, saveSettings, statusOf, STAFF_STATUS, cellOf, t12 } from '@/lib/hr';
import { IdCard, ID_CARD_CSS, ID_CARD_PRINT, cardValidTo } from '@/components/hr/IdCard';
import { HrPage, useHr, Avatar, profileHref } from './hrShared';
import { FORM_CSS, Seg } from '@/screens/staff-profile/staffForm';
import Link from 'next/link';

const CSS = `
.ic-wrap{display:grid;grid-template-columns:minmax(240px,300px) minmax(0,1fr);gap:var(--space-4);align-items:start}
.ic-col{display:flex;flex-direction:column;gap:var(--space-4);min-width:0}
.ic-list{display:flex;flex-direction:column;max-height:600px;overflow:auto}
.ic-row{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:4px var(--space-4);border-top:1px solid var(--border-subtle);cursor:pointer}
.ic-row:first-child{border-top:0}
.ic-row:hover{background:var(--surface-subtle)}
.ic-row b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ic-row input{width:16px;height:16px;accent-color:var(--primary)}
.ic-bar{display:flex;align-items:center;gap:var(--space-2);padding:8px 12px;border-bottom:1px solid var(--border-subtle)}
.ic-bar .ix-pick{flex:1;min-width:0}
.ic-preview{display:flex;flex-wrap:wrap;gap:var(--space-4);padding:var(--space-3) var(--space-4) var(--space-4)}
.ic-opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:var(--space-3) var(--space-4);padding:var(--space-3) var(--space-4)}
.ic-scan{display:flex;align-items:flex-end;gap:var(--space-2);padding:var(--space-3) var(--space-4) var(--space-4)}
.ic-scan > div:first-child{flex:1 1 260px;min-width:0}
.ic-hit{display:flex;align-items:center;gap:var(--space-3);margin:0 var(--space-4) var(--space-4);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg)}
.ic-hit .ix-btn{flex:none}
@media (max-width:1023px){.ic-wrap{grid-template-columns:minmax(0,1fr)}.ic-list{max-height:320px}}
@media (max-width:640px){
  .ic-list{max-height:none;overflow:visible}
  .ic-hit{flex-wrap:wrap}
  /* card settings: each choice takes the full width, its options share it equally */
  .ic-opts .sf-seg{display:flex;flex-wrap:nowrap;width:100%}
  .ic-opts .sf-seg button{flex:1 1 0;min-width:0;padding:var(--space-1) var(--space-2);line-height:1.25}
}
`;

export default function IdCards() {
  const { S } = useHr();
  const today = todayKey(S);
  const opt = S.settings.idCard || {};
  const active = S.staff.filter((s) => s.status !== 'left');
  const [place, setPlace] = useState('');
  const [sel, setSel] = useState(['EMP-0142', 'EMP-0151']);
  const [scan, setScan] = useState('');
  const [hit, setHit] = useState(null);
  const places = [...new Set(active.map((s) => s.branch))];
  const list = active.filter((s) => !place || s.branch === place);
  const chosen = active.filter((s) => sel.includes(s.code));
  const setOpt = (patch) => { saveSettings({ idCard: { ...opt, ...patch } }); toast('Card settings saved.'); };
  const print = () => { if (!chosen.length) { toast('Choose whose cards to print', { tone: 'error' }); return; } printNode(document.querySelector('.ic-print'), { title: `ID cards - ${chosen.length} staff`, css: ID_CARD_CSS + ID_CARD_PRINT }); };
  const check = (e) => {
    e.preventDefault();
    const raw = scan.trim();
    if (!raw) return;
    const code = (raw.match(/[A-Z]{2,5}-?\d{3,6}/i) || [raw])[0].toUpperCase();
    const st = S.staff.find((s) => s.code.toUpperCase() === code);
    setHit(st ? { st } : { miss: raw });
    setScan('');
  };
  const hitInfo = hit && hit.st ? (() => { const s = hit.st; const k = statusOf(S, s); const c = cellOf(S, s.code, today); return { s, ok: s.status !== 'left' && s.status !== 'suspended', k, c }; })() : null;

  const allShown = list.length > 0 && list.every((s) => sel.includes(s.code));

  return (
    <HrPage screen="IdCards" active="hr-idcards" page="ID cards & QR" title="ID cards & QR" icon="id-card" css={FORM_CSS + ID_CARD_CSS + CSS}
      about="Print staff ID cards with a QR code, and check a card by scanning it. A USB or Bluetooth QR scanner types the code into the Check box, or type the employee number."
      more={[{ label: 'Employee numbers & ID cards', href: '/hr-setup?sec=ids' }]}
      primary={{ label: chosen.length ? `Print ${chosen.length} card${chosen.length === 1 ? '' : 's'}` : 'Print cards', onClick: print, disabled: !chosen.length }}>
      <section className="ix-card" aria-labelledby="ic-check">
        <header className="ix-card__head"><h2 id="ic-check">Check a card <InfoTip text="Scan the QR with a scanner (it types into the box) or type the employee number." /></h2></header>
        <form className="ic-scan" onSubmit={check}>
          <div><label className="gc-label" htmlFor="ic-scan">Code</label><input id="ic-scan" className="gc-input hr-fig" value={scan} onChange={(e) => setScan(e.target.value)} placeholder="EMP-0142" autoComplete="off" /></div>
          <button type="submit" className="ix-btn"><Icon name="scan-line" width="16" height="16" aria-hidden="true" />Check</button>
        </form>
        {hitInfo ? (
          <div className={'ic-hit hr-note--' + (hitInfo.ok ? 'ok' : 'error')}>
            <Avatar st={hitInfo.s} />
            <div style={{ flex: 1, minWidth: 0 }}><b className="hr-strong">{hitInfo.s.name} · {hitInfo.s.code}</b><span className="hr-sub">{hitInfo.s.designation} · {hitInfo.s.branch} · {STAFF_STATUS[hitInfo.k][0]}{hitInfo.c.rec && hitInfo.c.rec.in ? ` · in at ${t12(hitInfo.c.rec.in)} today` : ''}</span></div>
            <StatusBadge tone={hitInfo.ok ? 'success' : 'error'}>{hitInfo.ok ? 'Valid card' : hitInfo.s.status === 'left' ? 'Left — take the card back' : 'Suspended'}</StatusBadge>
            <Link href={profileHref(hitInfo.s.code)} className="ix-btn ix-btn--sm">Profile</Link>
          </div>
        ) : hit && hit.miss ? <div className="ic-hit hr-note--error"><Icon name="circle-x" width="16" height="16" aria-hidden="true" /><span>No staff with “{hit.miss}”. The card may be from another shop or damaged.</span></div> : null}
      </section>

      <div className="ic-wrap">
        <section className="ix-card" aria-label="Staff">
          <div className="ic-bar">
            <select className="ix-pick" aria-label="Place" value={place} onChange={(e) => setPlace(e.target.value)}><option value="">All places</option>{places.map((p) => <option key={p}>{p}</option>)}</select>
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setSel(allShown ? sel.filter((c) => !list.some((s) => s.code === c)) : [...new Set([...sel, ...list.map((s) => s.code)])])}>{allShown ? 'Clear selection' : 'Select all'}</button>
          </div>
          <div className="ic-list" role="group" aria-label="Staff">
            {list.map((s) => (
              <label key={s.code} className="ic-row">
                <input type="checkbox" checked={sel.includes(s.code)} onChange={() => setSel(sel.includes(s.code) ? sel.filter((c) => c !== s.code) : [...sel, s.code])} />
                <Avatar st={s} />
                <span style={{ minWidth: 0 }}><b>{s.name}</b><span className="hr-sub">{s.code} · {s.designation}</span></span>
              </label>
            ))}
          </div>
        </section>
        <div className="ic-col">
          <section className="ix-card" aria-labelledby="ic-prev">
            <header className="ix-card__head"><h2 id="ic-prev">Preview · {chosen.length} card{chosen.length === 1 ? '' : 's'} <InfoTip text="Front and back at real size. They print 54 × 86 mm with cut lines, four people to an A4 page." /></h2></header>
            {chosen.length ? <div className="ic-preview ic-print">{chosen.map((s) => <IdCard key={s.code} S={S} st={s} issued={today} />)}</div> : <div className="ix-empty"><EmptyState icon="id-card" title="No one chosen" /></div>}
          </section>
          <section className="ix-card" aria-labelledby="ic-set">
            <header className="ix-card__head"><h2 id="ic-set">Card settings <InfoTip text={`Every card and profile QR follows these. Cards printed today are valid to ${formatDate(fromKey(cardValidTo(S, today)))}. The employee number in the QR also clocks people in where the check-in method is QR card.`} /></h2></header>
            <div className="ic-opts">
              <div><span className="gc-label">The QR holds</span><Seg label="QR content" value={opt.qr || 'code'} options={[['code', 'Employee number'], ['link', 'Link to check the card']]} onChange={(v) => setOpt({ qr: v })} /></div>
              <div><span className="gc-label">Valid for</span><Seg label="Valid for" value={opt.validYears || 2} options={[[1, '1 year'], [2, '2 years'], [3, '3 years']]} onChange={(v) => setOpt({ validYears: v })} /></div>
              <div><span className="gc-label">Blood group</span><Seg label="Blood group" value={opt.showBlood !== false} options={[[true, 'Show'], [false, 'Hide']]} onChange={(v) => setOpt({ showBlood: v })} /></div>
              <div><span className="gc-label">Mobile number</span><Seg label="Mobile on the back" value={opt.showPhone !== false} options={[[true, 'Show'], [false, 'Hide']]} onChange={(v) => setOpt({ showPhone: v })} /></div>
            </div>
          </section>
        </div>
      </div>
    </HrPage>
  );
}
