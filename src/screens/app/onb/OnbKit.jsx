'use client';
// OnbKit — the pieces the app's sign-up and sign-in screens share (src/screens/app/Onb*.jsx), drawn with the app kit so
// they scroll like every other app page (no fixed-height board): the step header (back, "Step n of 5 · label", the
// progress bars from the onboarding boards), the page title, choice cards, chips and the 6-box code field.
// Answers live in lib/shopOnboarding.js (useDraft reads them after mount: Netlify prerenders in UTC with no storage).

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AppScreen, Content, ActionBar, Icon } from '../kit/AppKit';
import { getDraft, saveDraft, ONB_EVENT } from '@/lib/shopOnboarding';

export const ONB_CSS = `
.onbhead{position:absolute;top:47px;left:0;right:0;padding:6px 20px 8px 8px;z-index:5;background:var(--bg)}
.onbhead .r1{display:flex;align-items:center;gap:6px;min-height:36px}
.onbhead .lbl{flex:1;font-size:var(--text-xs-plus);color:var(--muted)}
.onbhead .lbl b{color:var(--ink);font-weight:var(--weight-semibold)}
.onbbars{display:flex;gap:6px;padding-left:12px;margin-top:4px}
.onbbars span{flex:1;height:5px;border-radius:var(--radius-full);background:#dde4ee;overflow:hidden}
.onbbars i{display:block;height:100%;background:var(--brand);border-radius:var(--radius-full)}
.onbt{margin:0;font-size:var(--text-3xl);line-height:30px;font-weight:var(--weight-semibold);letter-spacing:var(--tracking-tight)}
.onbs{margin:6px 0 0;font-size:var(--text-sm-plus);color:var(--body)}
.onbgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.onbcard{display:flex;flex-direction:column;gap:10px;padding:14px;border-radius:var(--radius-xl);background:var(--card);border:1px solid var(--line);text-align:left;cursor:pointer;font:inherit;color:inherit}
.onbcard.on{border:2px solid var(--brand);padding:13px;box-shadow:0 0 0 3px rgba(0,48,135,.08)}
.onbcard .top{display:flex;justify-content:space-between;align-items:flex-start}
.onbcard .ico{width:42px;height:42px;background:#e0f3fb;color:var(--accent-text,#0369a1)}
.onbcard.on .ico{background:var(--brand);color:#fff}
.onbcard .tick{width:22px;height:22px;border-radius:var(--radius-full);background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center}
.onbcard .nm{font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);line-height:20px}
.onbcard .sb2{font-size:var(--text-xs-plus);color:var(--muted);line-height:17px}
.onbrow{flex-direction:row;align-items:center;gap:12px}
.onbrow .m{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.onbchips{display:flex;gap:8px;flex-wrap:wrap}
.onbchips button{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 14px 0 10px;border-radius:var(--radius-full);border:1px solid var(--line);background:var(--card);font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--body);cursor:pointer}
.onbchips button .bx{width:18px;height:18px;border-radius:var(--radius-md);border:1.5px solid #cbd5e1;display:flex;align-items:center;justify-content:center;flex:none}
.onbchips button.on{background:var(--brand);border-color:var(--brand);color:#fff}
.onbchips button.on .bx{background:#fff;border-color:#fff;color:var(--brand)}
.onbcode{position:relative;display:flex;gap:8px}
.onbcode span{flex:1;height:56px;border-radius:var(--radius-xl);border:1.5px solid #cbd5e1;background:#fff;display:flex;align-items:center;justify-content:center;font-size:var(--text-2xl);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.onbcode span.fill{border-color:var(--text-muted)}
.onbcode span.cur{border-color:var(--brand);box-shadow:0 0 0 3px rgba(0,48,135,.12)}
.onbcode.bad span{border-color:var(--err)}
.onbcode input{position:absolute;inset:0;width:100%;height:100%;opacity:0;border:0;font-size:16px;color:transparent;background:transparent;caret-color:transparent}
.onblink{border:0;background:none;padding:8px 0;min-height:36px;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--brand);cursor:pointer}
.onblink[disabled]{color:var(--muted);cursor:default}
.onbdemo{display:flex;align-items:center;gap:10px;justify-content:space-between}
.onbdemo b{font-family:var(--font-data);letter-spacing:.12em;white-space:nowrap}
.onbdemo .onblink{flex:none;white-space:nowrap}
.onbmuted{font-size:var(--text-xs-plus);color:var(--muted);line-height:18px}
`;

/** The answers so far (null until mounted) and a setter that saves them. */
export function useDraft() {
  const [d, setD] = useState(null);
  useEffect(() => {
    setD(getDraft());
    const on = () => setD(getDraft());
    window.addEventListener(ONB_EVENT, on);
    return () => window.removeEventListener(ONB_EVENT, on);
  }, []);
  const set = (patch) => setD(saveDraft(patch));
  return [d, set];
}

function StepHeader({ step, of = 5, label, back }) {
  const bars = Array.from({ length: of }, (_, i) => (i + 1 < step ? 100 : i + 1 === step ? 50 : 0));
  return (
    <header className="onbhead">
      <div className="r1">
        {back ? <Link href={back} className="ib" aria-label="Back"><Icon name="back" size={24} stroke={2} /></Link> : <span style={{ width: '36px' }} />}
        <span className="lbl">{step ? <><b className="num">{`Step ${step} of ${of}`}</b> · </> : null}{label}</span>
      </div>
      {step ? <div className="onbbars" aria-hidden="true">{bars.map((w, i) => <span key={i}><i style={{ width: w + '%' }} /></span>)}</div> : null}
    </header>
  );
}

/** A sign-up or sign-in page: header, scrolling body, bottom buttons. */
export function OnbScreen({ name, title, step, of, label, back, actions, children }) {
  return (
    <AppScreen name={name} title={title} tabs={false} css={ONB_CSS}>
      <StepHeader step={step} of={of} label={label} back={back} />
      <Content top={step ? 116 : 96} bottom={actions ? 98 : 0} style={{ padding: '14px 24px 0' }}>{children}</Content>
      {actions ? <ActionBar>{actions}</ActionBar> : null}
    </AppScreen>
  );
}

export function OnbTitle({ title, sub }) {
  return <><h1 className="onbt">{title}</h1>{sub ? <p className="onbs">{sub}</p> : null}</>;
}

/** A selectable card (radio). */
export function ChoiceCard({ on, onClick, icon, label, sub, row }) {
  return (
    <button type="button" role="radio" aria-checked={!!on} className={'onbcard' + (on ? ' on' : '') + (row ? ' onbrow' : '')} onClick={onClick}>
      {row ? (
        <>
          <span className="ico"><Icon name={icon} size={21} /></span>
          <span className="m"><span className="nm">{label}</span>{sub ? <span className="sb2">{sub}</span> : null}</span>
          {on ? <span className="tick"><Icon name="check" size={13} stroke={3} /></span> : <span style={{ width: '22px', height: '22px', borderRadius: 'var(--radius-full)', border: '2px solid #cbd5e1', flex: 'none' }} />}
        </>
      ) : (
        <>
          <span className="top"><span className="ico"><Icon name={icon} size={21} /></span>{on ? <span className="tick"><Icon name="check" size={13} stroke={3} /></span> : null}</span>
          <span className="nm">{label}</span>
        </>
      )}
    </button>
  );
}

/** Chips you can tick (several). */
export function TickChips({ items, value = [], onChange, label }) {
  const flip = (it) => onChange(value.includes(it) ? value.filter((x) => x !== it) : [...value, it]);
  return (
    <div className="onbchips" role="group" aria-label={label}>
      {items.map((it) => {
        const on = value.includes(it);
        return (
          <button key={it} type="button" aria-pressed={on} className={on ? 'on' : ''} onClick={() => flip(it)}>
            <span className="bx">{on ? <Icon name="check" size={12} stroke={3} /> : null}</span>{it}
          </button>
        );
      })}
    </div>
  );
}

/** Six boxes over one real input (paste, SMS autofill and the keyboard all work). */
export function CodeBoxes({ value, onChange, bad, label = '6-digit code', onDone }) {
  const ref = useRef(null);
  const [focus, setFocus] = useState(false);
  useEffect(() => { if (ref.current) ref.current.focus(); }, []);
  const v = String(value || '');
  return (
    <div className={'onbcode' + (bad ? ' bad' : '')} onClick={() => ref.current && ref.current.focus()}>
      {Array.from({ length: 6 }, (_, i) => <span key={i} aria-hidden="true" className={(v[i] ? 'fill' : '') + (focus && i === Math.min(v.length, 5) ? ' cur' : '')}>{v[i] || ''}</span>)}
      <input ref={ref} value={v} inputMode="numeric" autoComplete="one-time-code" aria-label={label} maxLength={6} aria-invalid={bad ? true : undefined}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        onChange={(e) => { const n = e.target.value.replace(/\D/g, '').slice(0, 6); onChange(n); if (n.length === 6 && onDone) onDone(n); }} />
    </div>
  );
}

/** Seconds left before a code can be sent again (counts down once a second). */
export function useCountdown(sentAt, wait) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const iv = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(iv);
  }, []);
  if (!now || !sentAt) return 0;
  return Math.max(0, wait - Math.floor((now - sentAt) / 1000));
}
export const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
