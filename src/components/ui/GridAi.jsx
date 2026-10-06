'use client';
// GridAI — the floating assistant button shown on every merchant page (it is no longer a menu item).
// Opens a small panel: ask by typing or by voice, with today's usage limits always in view.
// Front end only: answers are canned, usage is kept in this browser and resets each day.

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';

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

const ANSWERS = [
  [/sale|sold|revenue|বিক্রি/i, 'Sales today are ৳1,42,330 from 77 orders, up 11% on yesterday. Online brought 38 orders and the shops 39.'],
  [/stock|inventory|low|স্টক/i, '7 products are low on stock. The most urgent is the Anker 20W USB-C Charger with 4 left at the Dhanmondi branch.'],
  [/order|pending|অর্ডার/i, '128 orders are pending and 42 of them have waited more than 6 hours. Want me to open the pending list?'],
  [/customer|গ্রাহক/i, 'You have 2,452 customers. 14 signed up today and 312 are repeat buyers.'],
  [/courier|deliver|ডেলিভারি/i, 'Delivery success is 87.4% this month. Steadfast has 23 parcels waiting for tracking numbers.'],
];
const answer = (q) => (ANSWERS.find(([re]) => re.test(q)) || [null, 'I can help with sales, orders, stock, customers and couriers. This demo answers a few sample questions about those.'])[1];

// the assistant belongs to the merchant's workspace, not to the shopper's pages or sign-in;
// on the POS register it would sit on top of the pay button
const HIDDEN = /^\/($|pos$|offers|offer-detail|checkout|order-link|merchant-sign-in|merchant-onboarding|merchant-inbox|mobile-|dev\/)/;

export function GridAi() {
  const path = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const [usage, setUsage] = useState({ day: '', questions: 0 });
  const [chat, setChat] = useState([]);
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const inputRef = useRef(null);
  const buttonRef = useRef(null);
  const logRef = useRef(null);

  // another part of the page can ask a question: window.dispatchEvent(new CustomEvent('gc:gridai', { detail: { q } }))
  // (Home's "Ask GridAI" box); the panel opens and asks it
  const [pending, setPending] = useState('');
  useEffect(() => {
    setUsage(loadUsage());
    const on = (e) => { setOpen(true); setPending(String((e.detail && e.detail.q) || '')); };
    window.addEventListener('gc:gridai', on);
    return () => window.removeEventListener('gc:gridai', on);
  }, []);
  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [chat]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });
  useEffect(() => {
    if (!listening) return undefined;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [listening]);

  useEffect(() => {
    if (!pending || !usage.day) return;
    ask(pending);
    setPending('');
  });
  if (HIDDEN.test(path)) return null;

  const questionsLeft = Math.max(0, LIMIT - usage.questions);

  function close() {
    setOpen(false);
    setListening(false);
    if (buttonRef.current) buttonRef.current.focus();
  }
  function spend(patch) {
    setUsage((u) => { const next = { ...u, ...patch(u) }; saveUsage(next); return next; });
  }
  function ask(question, byVoice) {
    const q = question.trim();
    if (!q || !questionsLeft) return;
    setChat((c) => [...c, { who: 'me', text: q, voice: byVoice }, { who: 'ai', text: answer(q) }]);
    spend((u) => ({ questions: u.questions + 1 }));
    setText('');
  }
  function toggleVoice() {
    if (!listening) { setSeconds(0); setListening(true); return; }
    // stop: a voice note is sent as one question, the same as a typed one
    setListening(false);
    ask('How many orders are pending right now?', true);
  }

  return (
    <div className="gc-ai">
      {open ? (
        <section className="gc-ai__panel" role="dialog" aria-label="GridAI assistant">
          <header className="gc-ai__head">
            <span className="gc-ai__mark" aria-hidden="true"><Icon name="sparkles" width="16" height="16" /></span>
            <h2 className="gc-ai__title">GridAI</h2>
            <button type="button" className="gc-iconbtn" aria-label="Close GridAI" onClick={close}><Icon name="x" width="18" height="18" /></button>
          </header>

          <div className="gc-ai__limits">
            <span>Today</span>
            <div className="gc-ai__meter" role="progressbar" aria-label="Questions used today" aria-valuemin="0" aria-valuemax={LIMIT} aria-valuenow={usage.questions}><i style={{ width: Math.min(100, Math.round(100 * usage.questions / LIMIT)) + '%' }} /></div>
            <b>{usage.questions} of {LIMIT}</b>
            <Link href="/set-usage" onClick={() => setOpen(false)}>Limits</Link>
          </div>

          <div className="gc-ai__log" ref={logRef} aria-live="polite">
            {chat.length === 0 ? (
              <p className="gc-ai__hint">Ask about sales, orders, stock, customers or couriers. Type your question or hold a voice note.</p>
            ) : chat.map((m, i) => (
              <p key={i} className={'gc-ai__msg gc-ai__msg--' + m.who}>{m.voice ? <Icon name="mic" width="12" height="12" aria-label="Voice question" role="img" /> : null}{m.text}</p>
            ))}
          </div>

          {questionsLeft === 0 ? <p className="gc-ai__stop" role="status">You have used all {LIMIT} questions for today. They reset at midnight.</p> : null}

          <form className="gc-ai__form" onSubmit={(e) => { e.preventDefault(); ask(text, false); }}>
            {listening ? (
              <p className="gc-ai__rec" role="status"><span className="gc-ai__dot" aria-hidden="true" />Listening… {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</p>
            ) : (
              <input ref={inputRef} className="gc-ai__input" type="text" placeholder="Ask GridAI…" aria-label="Your question" value={text} disabled={!questionsLeft} onChange={(e) => setText(e.target.value)} />
            )}
            <button type="button" className={'gc-ai__round' + (listening ? ' is-on' : '')} aria-label={listening ? 'Stop and send voice question' : 'Ask by voice'} aria-pressed={listening} disabled={!questionsLeft} onClick={toggleVoice}><Icon name={listening ? 'square' : 'mic'} width="18" height="18" /></button>
            {listening ? null : <button type="submit" className="gc-ai__round gc-ai__round--send" aria-label="Send question" disabled={!text.trim() || !questionsLeft}><Icon name="send" width="18" height="18" /></button>}
          </form>
        </section>
      ) : null}
      <button ref={buttonRef} type="button" className="gc-ai__fab" aria-expanded={open} aria-haspopup="dialog" onClick={() => (open ? close() : setOpen(true))}>
        <Icon name="sparkles" width="18" height="18" aria-hidden="true" /><span className="gc-ai__label">GridAI</span>
      </button>
    </div>
  );
}
