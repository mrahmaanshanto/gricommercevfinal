'use client';
// GridAI › Test chat (/admin/gridai/test) — try GridAI as a customer before it answers real people. Pick a persona
// (New lead, Trial merchant, Late-paying merchant, Angry merchant, Bangla speaker) and chat. Each answer shows which
// source it came from ("Answered from: Pricing · Online · Business plan"), how sure GridAI is, and whether it would hand
// the conversation to a person or ask for approval (a sensitive action, from Behaviour). "Mark answer wrong" opens the
// FAQ editor with the question filled in. Reset starts again. The chat look is the GridAI panel's
// (components/ui/GridAi.jsx); the answers are canned rules in lib/admin/gridai.js › answer(), reading the Training
// sources, the Behaviour settings and the live plan prices (lib/platform db().plans). Nothing is sent to anyone.

import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { ShopHeader, KV } from '@/components/ui/IndexKit';
import { StatusBadge, InfoTip } from '@/components/ui';
import { PERSONAS, personaBy, answer, channelLabel, LEVELS } from '@/lib/admin/gridai';
import { hm } from '@/lib/platform/util';
import { AdminShell, usePlatform } from '../AdminShell';
import { GA_CSS, useGridAi, Skeleton, Bubble, FaqSheet, pct } from './gridaiShared';

const CSS = `
.tc-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(260px,1fr);gap:var(--space-4);align-items:start}
.tc-chat{display:flex;flex-direction:column;min-height:0}
.tc-personas{display:flex;flex-wrap:wrap;gap:6px;padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.tc-persona{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.tc-persona:hover{border-color:var(--border-strong)}
.tc-persona[aria-checked="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.tc-persona:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.tc-log{height:min(520px,calc(100dvh - 330px));min-height:300px;overflow-y:auto;padding:var(--space-4);background:var(--surface-page)}
.tc-meta{display:flex;flex-wrap:wrap;align-items:center;gap:6px;max-width:100%;font-size:var(--text-xs);color:var(--text-muted)}
.tc-meta b{font-weight:var(--weight-medium);color:var(--text-body)}
.tc-wrong{padding:0 4px;border:0;background:none;font:inherit;font-size:var(--text-xs);color:var(--text-muted);text-decoration:underline;cursor:pointer}
.tc-wrong:hover{color:var(--text-danger)}
.tc-typing{align-self:flex-start;display:inline-flex;gap:4px;padding:10px 12px;border-radius:var(--radius-xl);background:var(--surface-subtle)}
.tc-typing i{width:6px;height:6px;border-radius:var(--radius-full);background:var(--text-muted);animation:tc-dot 1s ease-in-out infinite}
.tc-typing i:nth-child(2){animation-delay:.15s}
.tc-typing i:nth-child(3){animation-delay:.3s}
@keyframes tc-dot{50%{opacity:.3;transform:translateY(-2px)}}
.tc-sugg{display:flex;gap:6px;overflow-x:auto;padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle);scrollbar-width:none}
.tc-sugg::-webkit-scrollbar{display:none}
.tc-sugg button{flex:none;height:32px;padding:0 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);color:var(--text-body);cursor:pointer;white-space:nowrap}
.tc-sugg button:hover{border-color:var(--primary);color:var(--primary)}
.tc-form{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle)}
.tc-form .gc-input{flex:1;min-width:0}
.tc-send{display:grid;place-items:center;flex:none;width:32px;height:32px;border:0;border-radius:var(--radius-full);background:var(--primary);color:#fff;cursor:pointer}
.tc-send:disabled{opacity:.45;cursor:not-allowed}
.tc-side{display:flex;flex-direction:column;gap:var(--space-4)}
.tc-body{padding:var(--space-3) var(--space-4) var(--space-4)}
.tc-meter{height:8px;margin:6px 0 var(--space-3);border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.tc-meter span{display:block;height:100%;border-radius:var(--radius-full);background:var(--success)}
.tc-meter span.is-mid{background:var(--warning)}
.tc-meter span.is-low{background:var(--error)}
.tc-flag{display:flex;gap:var(--space-2);margin-top:var(--space-2);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);font-size:var(--text-sm);line-height:1.45}
.tc-flag>svg{flex:none;margin-top:2px}
.tc-flag--hand{background:var(--fill-warning-soft);color:var(--text-warning)}
.tc-flag--ok{background:var(--fill-primary-soft);color:var(--primary)}
.tc-flag--off{background:var(--surface-subtle);color:var(--text-body)}
.tc-empty{margin:0;font-size:var(--text-sm);color:var(--text-muted)}
.tc-big{margin:0;font-family:var(--font-data);font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
@media (max-width:1023px){.tc-grid{grid-template-columns:minmax(0,1fr)}.tc-log{height:420px}}
@media (max-width:640px){.tc-personas{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}.tc-personas::-webkit-scrollbar{display:none}.tc-persona{flex:none;height:36px}.tc-send{width:44px;height:44px}.tc-log{height:60dvh}}
@media (prefers-reduced-motion:reduce){.tc-typing i{animation:none}}
`;

const greet = (p) => (p.lang === 'bn'
  ? `আসসালামু আলাইকুম ${p.name.split(' ')[0]}! আমি GridAI, GridCommerce-এর সহকারী। কীভাবে সাহায্য করতে পারি?`
  : `Hi ${p.name.split(' ')[0]}, I am GridAI, GridCommerce’s assistant. How can I help?`);
const start = (p, t) => [{ id: 1, r: 'ai', text: greet(p), at: t, greet: true }];

export default function TestChat() {
  const { data: d, t, live } = useGridAi();
  const { db } = usePlatform();
  const [pid, setPid] = useState(PERSONAS[0].id);
  const [log, setLog] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [faq, setFaq] = useState(null);
  const logRef = useRef(null);
  const timer = useRef(null);
  const persona = personaBy(pid);

  useEffect(() => { if (live && !log.length) setLog(start(persona, t)); }, [live]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log, typing]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const reset = (p = persona) => { window.clearTimeout(timer.current); setTyping(false); setText(''); setLog(start(p, t)); };
  const choose = (p) => { if (p.id === pid) return; setPid(p.id); reset(p); };
  const send = (raw) => {
    const q = String(raw || '').trim();
    if (!q || typing) return;
    const asked = log.filter((m) => m.r === 'user');
    const user = { id: log.length + 1, r: 'user', text: q, at: t };
    setLog((l) => [...l, user]);
    setText('');
    setTyping(true);
    timer.current = window.setTimeout(() => {
      const a = answer(q, { persona: pid, d, plans: db.plans, t, turn: log.filter((m) => m.r === 'ai' && !m.greet).length + 1, last: asked.length ? asked[asked.length - 1].text : '' });
      setLog((l) => [...l, { id: l.length + 1, r: 'ai', text: a.text, at: t, q, a }]);
      setTyping(false);
    }, 650);
  };
  const markWrong = (m) => {
    setLog((l) => l.map((x) => (x.id === m.id ? { ...x, wrong: true } : x)));
    setFaq({ q: m.a.bangla ? '' : m.q, qBn: m.a.bangla ? m.q : '', a: '', aBn: '', topic: 'Other', msgId: m.id });
  };

  const answers = log.filter((m) => m.r === 'ai' && m.a);
  const last = answers[answers.length - 1] || null;
  const handed = answers.filter((m) => m.a.handoff).length;
  const approvals = answers.filter((m) => m.a.approval).length;
  const level = live ? LEVELS.find((l) => l[0] === d.behaviour.level) : null;
  const conf = last ? last.a.confidence : null;

  return (
    <AdminShell active="ai-test">
      <style dangerouslySetInnerHTML={{ __html: GA_CSS + CSS }} />
      {!live ? <Skeleton label="Loading the test chat" /> : (
        <div className="ix-page">
          <ShopHeader icon="message-square-text" title="Test chat"
            about="Chat with GridAI as a lead or a merchant would, before it answers real people. Each answer shows its source, how sure GridAI is, and whether it would hand the conversation to a person or ask for approval. Nothing here is sent to anyone."
            secondary={[{ label: 'Reset', icon: 'rotate-ccw', onClick: () => reset() }]}
            more={[{ label: 'Training', href: '/admin/gridai' }, { label: 'Behaviour', href: '/admin/gridai/behaviour' }]} />

          <div className="tc-grid">
            <section className="ix-card tc-chat" aria-label="Test chat">
              <div className="tc-personas" role="radiogroup" aria-label="Chat as">
                {PERSONAS.map((p) => <button key={p.id} type="button" role="radio" aria-checked={p.id === pid} className="tc-persona" onClick={() => choose(p)}>{p.label}</button>)}
              </div>
              <div className="tc-log ga-log" ref={logRef} aria-live="polite">
                {log.map((m) => (
                  <Bubble key={m.id} m={m} name={m.r === 'ai' ? 'GridAI' : persona.name} time={hm(m.at)} wrong={m.wrong}>
                    {m.a ? (
                      <span className="tc-meta">
                        <span>{m.a.sources.length ? <>Answered from: <b>{m.a.sources.join(' · ')}</b></> : <b>No source found</b>}</span>
                        <span>· {pct(m.a.confidence)} sure</span>
                        {m.a.draft ? <StatusBadge tone="neutral">Draft for a person</StatusBadge> : null}
                        {m.a.handoff ? <StatusBadge tone="warning" icon="user-round">Hands to a person</StatusBadge> : null}
                        {m.a.approval ? <StatusBadge tone="primary" icon="shield-check">Needs approval</StatusBadge> : null}
                        {m.wrong ? <StatusBadge tone="error">Marked wrong</StatusBadge> : <button type="button" className="tc-wrong" onClick={() => markWrong(m)}>{m.a.unanswered ? 'Add as FAQ' : 'Mark answer wrong'}</button>}
                      </span>
                    ) : null}
                  </Bubble>
                ))}
                {typing ? <span className="tc-typing" role="status" aria-label="GridAI is typing"><i /><i /><i /></span> : null}
              </div>
              <div className="tc-sugg" aria-label="Try asking">
                {persona.ask.map((s) => <button key={s} type="button" lang={/[ঀ-৿]/.test(s) ? 'bn' : undefined} className={/[ঀ-৿]/.test(s) ? 'ga-bn' : ''} disabled={typing} onClick={() => send(s)}>{s}</button>)}
              </div>
              <form className="tc-form" onSubmit={(e) => { e.preventDefault(); send(text); }}>
                <input className="gc-input" value={text} onChange={(e) => setText(e.target.value)} placeholder={persona.lang === 'bn' ? 'বাংলায় বা ইংরেজিতে লিখুন…' : 'Write as ' + persona.name.split(' ')[0] + '…'} aria-label={'Message as ' + persona.name} />
                <button type="submit" className="tc-send" aria-label="Send" disabled={!text.trim() || typing}><Icon name="send" width="16" height="16" aria-hidden="true" /></button>
              </form>
            </section>

            <div className="tc-side">
              <section className="ix-card" aria-label="Who you are">
                <div className="ix-card__head"><h2>{persona.name}</h2><StatusBadge tone="neutral">{channelLabel(persona.channel)}</StatusBadge></div>
                <div className="tc-body">
                  <p className="tc-empty" style={{ marginBottom: 'var(--space-3)' }}>{persona.who}</p>
                  <KV rows={persona.facts} />
                </div>
              </section>

              <section className="ix-card" aria-label="Last answer">
                <div className="ix-card__head"><h2>Last answer <InfoTip text="How sure GridAI was, where the answer came from, and what would happen next in a real conversation. Change the rules in Behaviour." /></h2></div>
                <div className="tc-body">
                  {!last ? <p className="tc-empty">Ask something to see how GridAI decides.</p> : (<>
                    <span className="ga-sub">Confidence</span>
                    <p className="tc-big">{pct(conf)}</p>
                    <div className="tc-meter" role="meter" aria-label="Confidence" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(conf * 100)}>
                      <span className={conf * 100 < d.behaviour.confidence ? 'is-low' : conf < 0.85 ? 'is-mid' : ''} style={{ width: Math.round(conf * 100) + '%' }} />
                    </div>
                    <KV rows={[['Source', last.a.sources.length ? last.a.sources.join(', ') : 'None found'], ['Reply mode', level ? level[1] : '—'], ['Language', last.a.bangla ? 'বাংলা' : 'English']]} />
                    {last.a.handoff ? <p className="tc-flag tc-flag--hand"><Icon name="user-round" width="16" height="16" aria-hidden="true" /><span><b>Would hand to a person.</b> {last.a.handoff}.</span></p> : null}
                    {last.a.approval ? <p className="tc-flag tc-flag--ok"><Icon name="shield-check" width="16" height="16" aria-hidden="true" /><span><b>Asks for approval:</b> {last.a.approval.action}. {last.a.approval.approver} decides; after {last.a.approval.wait} min it {d.behaviour.approvals.onTimeout === 'person' ? 'goes to a person' : 'tells the person to wait'}.</span></p> : null}
                    {last.a.draft ? <p className="tc-flag tc-flag--off"><Icon name="pencil-line" width="16" height="16" aria-hidden="true" /><span>Reply mode is Assist: a person reads and sends this draft.</span></p> : null}
                    {!last.a.handoff && !last.a.approval && !last.a.draft ? <p className="tc-flag tc-flag--ok"><Icon name="circle-check" width="16" height="16" aria-hidden="true" /><span>GridAI would send this by itself.</span></p> : null}
                  </>)}
                </div>
                <div className="ix-foot"><span>{answers.length} answers · {handed} handed over · {approvals} approvals</span></div>
              </section>
            </div>
          </div>
        </div>
      )}
      <FaqSheet faq={faq} title="Add the right answer as an FAQ" onClose={() => setFaq(null)} />
    </AdminShell>
  );
}
