'use client';
// GridAI — the assistant panel on every merchant page. Opened by the floating button (desktop), the top bar's sparkles
// button (phones) or another part of the page (Home's "Ask GridAI": window.dispatchEvent(new CustomEvent('gc:gridai',
// { detail: { q } }))). The chat itself is components/gridai/Assistant.jsx: real answers from the shop's data through
// the shared Grid AI engine, limited to what the signed-in person may open. Questions a day are counted here.

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { Assistant } from '@/components/gridai/Assistant';

const LIMIT = 50;                                      // questions per day, typed or spoken
const KEY = 'gc.gridai.usage';
const today = () => new Date().toISOString().slice(0, 10);

function loadUsage() {
  try {
    const u = JSON.parse(window.localStorage.getItem(KEY));
    if (u && u.day === today()) return u;
  } catch { /* fall through */ }
  return { day: today(), questions: 18 };                // demo starting point
}
function saveUsage(u) { try { window.localStorage.setItem(KEY, JSON.stringify(u)); } catch { /* ignore */ } }

// the assistant belongs to the merchant's workspace, not to the shopper's pages or sign-in;
// on the POS register it would sit on top of the pay button; the Grid AI › Assistant page has it full size
const HIDDEN = /^\/($|admin|pos$|offers|offer-detail|checkout|order-link|merchant-sign-in|merchant-onboarding|merchant-inbox|mobile-|dev\/|grid-ai$)/;

export function GridAi() {
  const path = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const [usage, setUsage] = useState({ day: '', questions: 0 });
  const [first, setFirst] = useState('');
  const buttonRef = useRef(null);

  useEffect(() => {
    setUsage(loadUsage());
    const on = (e) => { setOpen(true); const q = String((e.detail && e.detail.q) || ''); if (q) setFirst(q); };
    window.addEventListener('gc:gridai', on);
    return () => window.removeEventListener('gc:gridai', on);
  }, []);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });
  if (HIDDEN.test(path)) return null;

  const questionsLeft = Math.max(0, LIMIT - usage.questions);
  function close() {
    setOpen(false);
    setFirst('');
    if (buttonRef.current) buttonRef.current.focus();
  }
  const counted = () => setUsage((u) => { const next = { ...u, questions: u.questions + 1 }; saveUsage(next); return next; });

  return (
    <div className="gc-ai">
      {open ? (
        <section className="gc-ai__panel gc-ai__panel--wide" role="dialog" aria-label="GridAI assistant">
          <header className="gc-ai__head">
            <span className="gc-ai__mark" aria-hidden="true"><Icon name="sparkles" width="16" height="16" /></span>
            <h2 className="gc-ai__title">GridAI</h2>
            <Link href="/grid-ai" className="gc-iconbtn" aria-label="Open the full assistant" title="Open the full assistant" onClick={() => setOpen(false)}><Icon name="maximize-2" width="16" height="16" /></Link>
            <button type="button" className="gc-iconbtn" aria-label="Close GridAI" onClick={close}><Icon name="x" width="18" height="18" /></button>
          </header>
          <div className="gc-ai__limits">
            <span>Today</span>
            <div className="gc-ai__meter" role="progressbar" aria-label="Questions used today" aria-valuemin="0" aria-valuemax={LIMIT} aria-valuenow={usage.questions}><i style={{ width: Math.min(100, Math.round(100 * usage.questions / LIMIT)) + '%' }} /></div>
            <b>{usage.questions} of {LIMIT}</b>
            <Link href="/ai-usage" onClick={() => setOpen(false)}>Limits</Link>
          </div>
          {questionsLeft === 0 ? <p className="gc-ai__stop" role="status">You have used all {LIMIT} questions for today. They reset at midnight.</p> : null}
          <Assistant compact autoFocus first={first} onAsked={counted} disabled={!questionsLeft} />
        </section>
      ) : null}
      <button ref={buttonRef} type="button" className="gc-ai__fab" aria-expanded={open} aria-haspopup="dialog" onClick={() => (open ? close() : setOpen(true))}>
        <Icon name="sparkles" width="18" height="18" aria-hidden="true" /><span className="gc-ai__label">GridAI</span>
      </button>
    </div>
  );
}
