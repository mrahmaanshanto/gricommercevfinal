'use client';
// Grid AI in a conversation (MerchantInbox › Thread):
//   CopilotCard      above the composer when the customer is waiting: GridAI's draft from the shared engine (live prices,
//                    stock, delivery, the order being collected, a lead), with Accept · Edit · Regenerate · Copy · Dismiss
//                    and "Why" (the trace). Accepting sends it as you; nothing is sent by the card itself.
//   AutopilotControl the chat's switch in the header: Autopilot (GridAI answers simple questions by itself) or Copilot
//                    (GridAI drafts, a person sends). Turning Autopilot on needs "Enable auto reply".
//   AiBar            the strip under the header while GridAI is answering, with Take over.
//   AiTag            under a message GridAI sent: "Sent by GridAI" and Rate (correct … unsafe); a wrong answer can be
//                    corrected, and the correction waits for review in Knowledge & training before the AI learns it.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, StatusBadge } from '@/components/ui';
import { currentUser } from '@/lib/team';
import { can, why } from '@/lib/permissions';
import { ME } from '@/lib/inbox';
import { getLeads, saveLead } from '@/lib/leads';
import { customerTurn, INTENT_WORD } from '@/lib/gridai/engine';
import { markRun } from '@/lib/gridai/usage';
import { rate, propose, VERDICTS, VERDICT } from '@/lib/gridai/quality';
import { CATEGORIES } from '@/lib/gridai/knowledge';
import { logAi } from '@/lib/gridai/activity';
import { autopilotOn } from '@/lib/gridai/inboxAi';
import { Trace, RunMeta, ProductCards, OrderSummary, OrderLine, GAI_CSS } from '@/components/gridai/parts';
import { Menu, MenuItem } from './parts';

export const COPILOT_CSS = GAI_CSS + `
.cpl{display:flex;flex-direction:column;gap:var(--space-2);max-height:min(46vh,340px);overflow-y:auto;overscroll-behavior:contain;padding:var(--space-3);border:1px solid color-mix(in srgb,var(--primary) 22%,var(--border-subtle));border-radius:var(--radius-xl);background:linear-gradient(180deg,var(--fill-primary-soft),var(--surface-card) 70%);box-shadow:0 1px 2px rgba(15,23,42,.04)}
.cpl-head{display:flex;align-items:center;gap:var(--space-2);min-width:0}
.cpl-mark{display:grid;flex:none;place-items:center;width:24px;height:24px;border-radius:var(--radius-full);background:var(--primary);color:#fff}
.cpl-head b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap}
.cpl-chip{min-width:0;overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.cpl-head .cpl-x{margin-left:auto}
.cpl-text{margin:0;max-height:96px;overflow-y:auto;font-size:var(--text-sm);line-height:1.5;color:var(--text-heading);white-space:pre-wrap}
.cpl-acts{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.cpl-acts .cpl-why{margin-left:auto}
.cpl-lead{display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap;font-size:var(--text-xs);color:var(--text-body)}
.cpl-why-box{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-card);border:1px solid var(--border-subtle);max-height:260px;overflow-y:auto}
.cpl-note{margin:0;font-size:var(--text-xs);color:var(--text-warning)}
.ai-bar{display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap;padding:var(--space-2) var(--space-4);border-bottom:1px solid var(--border-subtle);background:var(--fill-primary-soft);font-size:var(--text-xs);color:var(--text-body)}
.ai-bar b{font-weight:var(--weight-medium);color:var(--primary)}
.ai-bar>span{flex:1 1 220px;min-width:0}
.ai-bar .ix-btn{margin-left:auto}
.ai-ctl{display:inline-flex;align-items:center;gap:6px}
.ai-ctl.is-auto{border-color:color-mix(in srgb,var(--primary) 40%,transparent);background:var(--fill-primary-soft);color:var(--primary)}
.ai-tag{display:inline-flex;align-items:center;gap:4px;margin-top:2px;font-size:var(--text-xs);color:var(--text-muted)}
.ai-tag button{height:24px;padding:0 6px;border:0;border-radius:var(--radius-full);background:none;font:inherit;font-size:var(--text-xs);color:var(--text-muted);cursor:pointer}
.ai-tag button:hover{background:var(--surface-subtle);color:var(--text-heading)}
.ms-row--out .ai-tag{align-self:flex-end}
@media (max-width:640px){.cpl-acts .cpl-why{margin-left:0}}
`;

const lastIncoming = (conv) => {
  const msgs = conv.messages || [];
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i].from === 'agent') return null;
    if (msgs[i].from === 'customer') return msgs[i];
  }
  return null;
};

export function CopilotCard({ conv, onSend, onUse, focus }) {
  const waiting = lastIncoming(conv);
  const [variant, setVariant] = useState(0);
  const [run, setRun] = useState(null);
  const [why, setWhy] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [hidden, setHidden] = useState('');
  const key = conv.id + ':' + (waiting ? waiting.id : '');
  const auto = autopilotOn(conv);
  useEffect(() => { setVariant(0); setWhy(false); }, [key]);
  useEffect(() => {
    if (!waiting || conv.blocked) { setRun(null); return; }
    // with Autopilot on, the card shows only when GridAI didn't answer by itself (it drafted or handed over)
    const r = customerTurn(conv, { variant });
    setRun(auto && r.decision.act === 'auto' ? null : r);
  }, [key, variant, auto]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!run || hidden === key || conv.blocked) return null;
  const me = currentUser();
  const accept = () => {
    onSend([{ from: 'agent', by: ME, type: 'text', text: run.reply, status: 'sent', aiDraft: run.id }]);
    markRun(run.id, 'accepted');
    logAi({ kind: 'suggestion', title: 'Draft sent as written', detail: run.reply.slice(0, 90), channel: conv.ch, customer: conv.name, conv: conv.id, by: me.name });
  };
  const edit = () => { onUse(run.reply); markRun(run.id, 'edited'); if (focus) focus(); };
  const copy = () => { try { navigator.clipboard.writeText(run.reply).then(() => toast('Copied'), () => toast('Select the text to copy it', { tone: 'info' })); } catch { toast('Select the text to copy it', { tone: 'info' }); } };
  const dismiss = () => { setHidden(key); markRun(run.id, 'dismissed'); };
  const addLead = () => {
    if (getLeads().some((l) => l.phone && run.lead.phone && String(l.phone).replace(/\D/g, '').endsWith(String(run.lead.phone).replace(/\D/g, '').slice(-10)))) { toast('Already in Leads.', { tone: 'info' }); return; }
    saveLead({ name: run.lead.name, phone: run.lead.phone, source: run.lead.source, kind: 'Retail', interest: run.lead.interest, value: run.lead.value, stage: 'new', owner: me.id, next: { at: Date.now() + 864e5, what: 'Follow up on ' + run.lead.interest }, log: [{ at: Date.now(), by: me.id, kind: 'note', text: 'Spotted by GridAI in a ' + conv.ch + ' chat' }] }, me.id);
    logAi({ kind: 'action', title: 'Lead added from a chat', detail: run.lead.interest, channel: conv.ch, customer: conv.name, by: me.name });
    toast(conv.name + ' added to Leads.');
  };
  const person = run.decision.act === 'person';
  return (
    <section className="cpl" aria-label="GridAI suggestion">
      <div className="cpl-head">
        <span className="cpl-mark" aria-hidden="true"><Icon name="sparkles" width="13" height="13" /></span>
        <b>GridAI suggests</b>
        <span className="cpl-chip">{run.agentName} · {run.intents.map((k) => INTENT_WORD[k] || k).join(', ') || 'Reply'}</span>
        {person ? <StatusBadge tone="warning">Needs a person</StatusBadge> : null}
        <button type="button" className="gc-iconbtn cpl-x" aria-label="Dismiss the suggestion" onClick={dismiss}><Icon name="x" width="16" height="16" /></button>
      </div>
      <p className="cpl-text">{run.reply}</p>
      {person ? <p className="cpl-note">{run.decision.reason}. Check before you send.</p> : null}
      {run.products.length ? <ProductCards mini products={run.products} onSend={(p) => { onSend([{ from: 'agent', by: ME, type: 'product', sku: p.sku, status: 'sent', aiDraft: run.id }]); toast(p.name + ' card sent'); }} /> : null}
      {run.order ? <><OrderLine order={run.order} open={orderOpen} onToggle={() => setOrderOpen((o) => !o)} />{orderOpen ? <OrderSummary order={run.order} /> : null}{orderOpen && !run.order.missing.length ? <Link className="ix-btn ix-btn--sm" style={{ alignSelf: 'flex-start' }} href={'/new-order?phone=' + encodeURIComponent(run.order.phone) + '&name=' + encodeURIComponent(run.order.name)}>Open as an order</Link> : null}</> : null}
      {run.lead ? <div className="cpl-lead"><Icon name="target" width="14" height="14" aria-hidden="true" /><span>Buying interest: {run.lead.interest}{run.lead.value ? ' · ৳' + run.lead.value.toLocaleString('en-IN') : ''}</span><button type="button" className="ix-btn ix-btn--sm" onClick={addLead}>Add to Leads</button></div> : null}
      {why ? <div className="cpl-why-box"><Trace run={run} /><RunMeta run={run} /></div> : null}
      <div className="cpl-acts">
        <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={accept}><Icon name="send" width="14" height="14" aria-hidden="true" />Accept</button>
        <button type="button" className="ix-btn ix-btn--sm" onClick={edit}><Icon name="pencil" width="14" height="14" aria-hidden="true" />Edit</button>
        <button type="button" className="ix-btn ix-btn--sm" onClick={() => setVariant((v) => v + 1)}><Icon name="refresh-cw" width="14" height="14" aria-hidden="true" />Regenerate</button>
        <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Copy the suggestion" onClick={copy}><Icon name="copy" width="14" height="14" /></button>
        <button type="button" className="ix-btn ix-btn--sm ix-btn--plain cpl-why" aria-expanded={why} onClick={() => setWhy((w) => !w)}><Icon name="git-branch" width="14" height="14" aria-hidden="true" />Why</button>
      </div>
    </section>
  );
}

export function AutopilotControl({ conv, onSet }) {
  const on = autopilotOn(conv);
  const set = (auto, close) => {
    close();
    if (auto === on) return;
    if (auto && !can(currentUser(), 'ai-autoreply')) { toast(why('ai-autoreply'), { tone: 'info' }); return; }
    onSet(auto);
  };
  return (
    <Menu label="GridAI for this chat" wide button={({ toggle, open }) => (
      <button type="button" className={'gc-btn gc-btn--sm gc-btn--neutral ai-ctl' + (on ? ' is-auto' : '')} aria-expanded={open} onClick={toggle} aria-label={'GridAI: ' + (on ? 'Autopilot' : 'Copilot') + '. Change'}>
        <Icon name="sparkles" width="16" height="16" aria-hidden="true" /><span className="th-lbl">{on ? 'Autopilot' : 'Copilot'}</span><Icon name="chevron-down" width="14" height="14" aria-hidden="true" />
      </button>
    )}>
      {(close) => (
        <>
          <p className="ib-menu__head">GridAI for this chat</p>
          <MenuItem checked={on} onClick={() => set(true, close)} hint="Replies by itself">Autopilot</MenuItem>
          <MenuItem checked={!on} onClick={() => set(false, close)} hint="You send">Copilot</MenuItem>
        </>
      )}
    </Menu>
  );
}

export function AiBar({ conv, onTakeOver }) {
  if (!autopilotOn(conv)) return null;
  return (
    <div className="ai-bar" role="status">
      <span><Icon name="sparkles" width="14" height="14" aria-hidden="true" style={{ verticalAlign: -2, marginRight: 6, color: 'var(--primary)' }} /><b>GridAI Autopilot is answering this chat.</b> Simple questions only; anything else is handed to a person.</span>
      <button type="button" className="ix-btn ix-btn--sm" onClick={onTakeOver}><Icon name="hand" width="14" height="14" aria-hidden="true" />Take over</button>
    </div>
  );
}

/** Under a message GridAI sent by itself. */
export function AiTag({ m, conv }) {
  const [fix, setFix] = useState(null);
  const question = (() => { const msgs = conv.messages || []; const i = msgs.findIndex((x) => x.id === m.id); for (let k = i - 1; k >= 0; k--) if (msgs[k].from === 'customer' && msgs[k].text) return msgs[k].text; return ''; })();
  const pick = (v, close) => {
    close();
    const me = currentUser();
    rate(m.run || '', v, '', me.name, m.text || '');
    if (v === 'correct') { toast('Thanks. Marked as correct.'); return; }
    setFix({ verdict: v, right: '', category: 'faq' });
  };
  return (
    <span className="ai-tag">
      <Icon name="sparkles" width="12" height="12" aria-hidden="true" />Sent by GridAI
      <Menu label="Rate this answer" button={({ toggle, open }) => <button type="button" aria-expanded={open} onClick={toggle}>Rate</button>}>
        {(close) => <>{VERDICTS.map(([k, l]) => <MenuItem key={k} icon={VERDICT[k].icon} onClick={() => pick(k, close)}>{l}</MenuItem>)}</>}
      </Menu>
      <Sheet open={!!fix} title="Correct the answer" onClose={() => setFix(null)}
        footer={fix ? <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', width: '100%' }}><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setFix(null)}>Skip</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => { const r = propose({ question, wrong: m.text || '', right: fix.right, category: fix.category, conv: conv.id }, currentUser().name); if (r.error) { toast(r.error, { tone: 'error' }); return; } setFix(null); toast('Sent for review. It becomes knowledge once approved.'); }}>Send for review</button></div> : null}>
        {fix ? (
          <div className="ga-body" style={{ padding: 0, display: 'grid', gap: 'var(--space-4)' }}>
            <p className="gc-help" style={{ margin: 0 }}>Marked {VERDICT[fix.verdict].label.toLowerCase()}. Write the right answer; someone who manages knowledge approves it before GridAI uses it.</p>
            {question ? <p className="gx-text" style={{ margin: 0 }}><b>Customer asked:</b> {question}</p> : null}
            <p className="gx-text" style={{ margin: 0, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{m.text}</p>
            <label className="gc-label" htmlFor="ai-fix-right">The right answer</label>
            <textarea id="ai-fix-right" className="gc-input" rows={4} style={{ minHeight: 96, paddingTop: 10 }} value={fix.right} onChange={(e) => setFix({ ...fix, right: e.target.value })} autoFocus />
            <label className="gc-label" htmlFor="ai-fix-cat">Knowledge category</label>
            <select id="ai-fix-cat" className="gc-input gc-select" value={fix.category} onChange={(e) => setFix({ ...fix, category: e.target.value })}>{CATEGORIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          </div>
        ) : null}
      </Sheet>
    </span>
  );
}
