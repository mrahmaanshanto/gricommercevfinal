'use client';
// The merchant assistant — one chat used everywhere (the floating GridAI panel on every page and the Grid AI ›
// Assistant page). Questions in Bangla or English go to the shared engine (lib/gridai/engine.js › merchantTurn), which
// answers from the shop's own books and only what the signed-in person may open. Answers are blocks (figures, tables,
// lists, links); an action that changes things (bulk follow-ups) is prepared and sent for approval, never done here.
// Each answer has "Why" (the trace: tools, policy, model, cost) and a quick rating.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { currentUser } from '@/lib/team';
import { merchantTurn, MERCHANT_SUGGESTIONS } from '@/lib/gridai/engine';
import { requestApproval } from '@/lib/gridai/aiApprovals';
import { rate } from '@/lib/gridai/quality';
import { Blocks, Trace, RunMeta, GAI_CSS } from './parts';

const CSS = GAI_CSS + `
.as{display:flex;flex-direction:column;min-height:0;flex:1}
.as-log{flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4);overscroll-behavior:contain}
.as-me{align-self:flex-end;max-width:85%;margin:0;padding:var(--space-2) var(--space-3);border-radius:var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-xl);background:var(--primary);color:#fff;font-size:var(--text-sm);line-height:1.5}
.as-ai{display:flex;gap:var(--space-2);align-items:flex-start;max-width:100%}
.as-ai__mark{flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary)}
.as-ai__body{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--space-2)}
.as-foot{display:flex;align-items:center;gap:4px;font-size:var(--text-xs);color:var(--text-muted)}
.as-foot button{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 8px;border:0;border-radius:var(--radius-full);background:none;font:inherit;font-size:var(--text-xs);color:var(--text-muted);cursor:pointer}
.as-foot button:hover{background:var(--surface-subtle);color:var(--text-heading)}
.as-foot button[aria-pressed="true"]{color:var(--primary)}
.as-why{padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-page);display:flex;flex-direction:column;gap:var(--space-3)}
.as-dots{display:inline-flex;gap:4px;padding:10px 12px;border-radius:var(--radius-xl);background:var(--surface-subtle)}
.as-dots i{width:6px;height:6px;border-radius:var(--radius-full);background:var(--text-muted);animation:as-dot 1s infinite ease-in-out}
.as-dots i:nth-child(2){animation-delay:.15s}.as-dots i:nth-child(3){animation-delay:.3s}
@keyframes as-dot{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-2px)}}
.as-empty{display:flex;flex-direction:column;gap:var(--space-3);margin:auto 0}
.as-empty p{margin:0;font-size:var(--text-sm);color:var(--text-muted);text-align:center}
.as-sugs{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.as-sug{display:inline-flex;align-items:center;min-height:32px;padding:4px 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs-plus);color:var(--text-heading);text-align:left;cursor:pointer;transition:var(--transition-colors)}
.as-sug:hover{border-color:var(--primary);color:var(--primary)}
.as-sug.is-bn{font-family:var(--font-bn)}
.as-form{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-3);border-top:1px solid var(--border-subtle)}
.as-input{flex:1;min-width:0;height:44px;padding:0 var(--space-4);border:1px solid var(--border-field);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-sm);color:var(--text-heading)}
.as-input:focus{outline:none;border-color:var(--border-field-focus);box-shadow:0 0 0 3px var(--focus-ring)}
.as-round{flex:none;display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:var(--radius-full);background:var(--surface-subtle);color:var(--text-body);cursor:pointer}
.as-round--send{background:var(--primary);color:#fff}
.as-round:disabled{opacity:.45;cursor:default}
.as-round.is-on{background:var(--fill-error-soft);color:var(--text-danger)}
.as-rec{flex:1;margin:0;font-size:var(--text-sm);color:var(--text-danger)}
@media (prefers-reduced-motion:reduce){.as-dots i{animation:none}}
`;

const VOICE_SAMPLE = 'আজকে কত টাকার সেল হয়েছে?';

export function Assistant({ compact = false, onAsked, disabled = false, autoFocus = false, first = '' }) {
  const [chat, setChat] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [why, setWhy] = useState('');
  const [rated, setRated] = useState({});
  const [listening, setListening] = useState(false);
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [chat, busy, why]);
  useEffect(() => { if (autoFocus && inputRef.current) inputRef.current.focus(); }, [autoFocus]);
  // a question handed over when the assistant opens (Home's "Ask GridAI" box, the top bar)
  const asked = useRef('');
  useEffect(() => { if (first && asked.current !== first) { asked.current = first; ask(first); } });
  // another part of the page can ask (Home's "Ask GridAI" box): window.dispatchEvent(new CustomEvent('gc:gridai', { detail: { q } }))
  useEffect(() => {
    const on = (e) => { const q = String((e.detail && e.detail.q) || ''); if (q) ask(q); };
    window.addEventListener('gc:gridai-ask', on);
    return () => window.removeEventListener('gc:gridai-ask', on);
  });

  function ask(question, voice) {
    const q = String(question || '').trim();
    if (!q || busy || disabled) return;
    setChat((c) => [...c, { who: 'me', text: q, voice }]);
    setText('');
    setBusy(true);
    if (onAsked) onAsked();
    timer.current = window.setTimeout(() => {
      const run = merchantTurn(q, currentUser());
      setChat((c) => [...c, { who: 'ai', run }]);
      setBusy(false);
    }, 650);
  }
  function approve(block) {
    const me = currentUser();
    const r = requestApproval({ kind: block.approval.kind, title: block.approval.title, detail: 'Asked in the assistant by ' + me.name, change: 'Send a personal follow-up to each customer through their chat channel', reason: 'Bulk messages always wait for a person.', from: 'Assistant', customer: block.approval.count + ' customers' });
    toast('Sent for approval: ' + r.title, { tone: 'info' });
  }
  const mark = (run, verdict) => { rate(run, verdict, '', currentUser().name, (run.blocks.find((b) => b.type === 'text') || {}).text || run.kind); setRated((x) => ({ ...x, [run.id]: verdict })); toast(verdict === 'correct' ? 'Thanks. Marked as correct.' : 'Thanks. The team will look at it.'); };
  const toggleVoice = () => {
    if (!listening) { setListening(true); return; }
    setListening(false);
    ask(VOICE_SAMPLE, true);
  };

  return (
    <div className={'as' + (compact ? ' as--compact' : '')}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="as-log" ref={logRef} aria-live="polite">
        {!chat.length ? (
          <div className="as-empty">
            <p>Ask about sales, orders, stock, follow-ups or customers, in Bangla or English.</p>
            <div className="as-sugs">{MERCHANT_SUGGESTIONS.slice(0, compact ? 4 : 8).map(([q, lang]) => <button key={q} type="button" className={'as-sug' + (lang === 'bn' ? ' is-bn' : '')} lang={lang === 'bn' ? 'bn' : undefined} onClick={() => ask(q)} disabled={disabled}>{q}</button>)}</div>
          </div>
        ) : chat.map((m, i) => (m.who === 'me'
          ? <p key={i} className="as-me" lang={/[ঀ-৿]/.test(m.text) ? 'bn' : undefined}>{m.voice ? <Icon name="mic" width="12" height="12" aria-label="Voice question" role="img" style={{ marginRight: 6, verticalAlign: -1 }} /> : null}{m.text}</p>
          : (
            <div key={i} className="as-ai">
              <span className="as-ai__mark" aria-hidden="true"><Icon name="sparkles" width="14" height="14" /></span>
              <div className="as-ai__body">
                <Blocks blocks={m.run.blocks} onAction={approve} />
                <div className="as-foot">
                  <button type="button" aria-expanded={why === m.run.id} onClick={() => setWhy(why === m.run.id ? '' : m.run.id)}><Icon name="git-branch" width="13" height="13" aria-hidden="true" />Why this answer</button>
                  <button type="button" aria-pressed={rated[m.run.id] === 'correct'} aria-label="Good answer" onClick={() => mark(m.run, 'correct')}><Icon name="thumbs-up" width="13" height="13" aria-hidden="true" /></button>
                  <button type="button" aria-pressed={rated[m.run.id] === 'incorrect'} aria-label="Wrong answer" onClick={() => mark(m.run, 'incorrect')}><Icon name="thumbs-down" width="13" height="13" aria-hidden="true" /></button>
                </div>
                {why === m.run.id ? <div className="as-why"><Trace run={m.run} /><RunMeta run={{ ...m.run, agentName: m.run.agent }} /></div> : null}
              </div>
            </div>
          )))}
        {busy ? <div className="as-ai"><span className="as-ai__mark" aria-hidden="true"><Icon name="sparkles" width="14" height="14" /></span><span className="as-dots" role="status" aria-label="GridAI is working"><i /><i /><i /></span></div> : null}
      </div>
      <form className="as-form" onSubmit={(e) => { e.preventDefault(); ask(text); }}>
        {listening ? <p className="as-rec" role="status">Listening… tap stop to ask</p> : (
          <input ref={inputRef} className="as-input" type="text" placeholder="Ask GridAI…" aria-label="Your question" value={text} disabled={disabled} onChange={(e) => setText(e.target.value)} />
        )}
        <button type="button" className={'as-round' + (listening ? ' is-on' : '')} aria-label={listening ? 'Stop and ask' : 'Ask by voice'} aria-pressed={listening} disabled={disabled} onClick={toggleVoice}><Icon name={listening ? 'square' : 'mic'} width="18" height="18" /></button>
        {listening ? null : <button type="submit" className="as-round as-round--send" aria-label="Send question" disabled={!text.trim() || busy || disabled}><Icon name="send" width="18" height="18" /></button>}
      </form>
      {compact ? null : <p className="gx-meta" style={{ margin: 0, padding: '0 var(--space-4) var(--space-3)' }}><span>Answers use only what you can open.</span><Link href="/ai-activity">Activity &amp; approvals</Link></p>}
    </div>
  );
}
