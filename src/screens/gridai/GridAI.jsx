'use client';
// Grid AI › Assistant — the merchant assistant full size (the same chat as the floating GridAI panel,
// components/gridai/Assistant.jsx). Beside it: what it can answer and whether this person may see each area (answers
// follow the person's access, lib/team.js › canSee), and what it never does by itself.

import React from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { ShopHeader } from '@/components/ui/IndexKit';
import { Assistant } from '@/components/gridai/Assistant';
import { currentUser, canSee, roleOf, SESSION_EVENT } from '@/lib/team';
import { GaFrame, useLive } from './gaShared';

const CSS = `
.gas{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:var(--space-4);align-items:start}
.gas-chat{display:flex;flex-direction:column;height:calc(100dvh - 210px);min-height:480px;overflow:hidden}
.gas-side{display:flex;flex-direction:column;gap:var(--space-4)}
.gas-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.gas-list li{display:flex;align-items:flex-start;gap:var(--space-2);padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.gas-list li:first-child{border-top:0}
.gas-list li>svg{flex:none;margin-top:3px}
.gas-list b{display:block;font-weight:var(--weight-medium);color:var(--text-heading)}
.gas-list small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.gas-yes{color:var(--text-success)}.gas-no{color:var(--text-muted)}
@media (max-width:1023px){.gas{grid-template-columns:minmax(0,1fr)}.gas-chat{height:70dvh}}
`;
const AREAS = [
  ['Sales and reports', 'Today, this week, last month, by channel, best sellers', ['rep-all', 'acc-home', 'rep-daily']],
  ['Orders', 'Waiting to approve, not yet with the courier, cancelled and why', ['orders-all', 'orders']],
  ['Stock', 'Low stock, what to reorder', ['stock-list', 'products-low', 'products-all']],
  ['Leads and follow-ups', 'Who to follow up today, who asked but didn’t order', ['leads']],
  ['Inbox', 'Interested customers from chats and comments', ['inbox']],
];

export default function GridAIAssistant() {
  const me = useLive(() => currentUser(), [SESSION_EVENT]);
  return (
    <GaFrame screen="GridAI" active="ai-assistant" page="Assistant" css={CSS}>
      <ShopHeader icon="message-square-text" title="Assistant"
        about="Ask Grid AI about the business in Bangla or English. It answers from the shop’s own books (sales, orders, stock, leads, the Inbox) and only what the person asking may open. When an answer needs action, like sending follow-ups to many customers, it prepares it and asks for approval."
        more={[{ label: 'Activity & approvals', href: '/ai-activity' }, { label: 'Agents', href: '/ai-agents' }]} />
      <div className="gas">
        <section className="ix-card gas-chat" aria-label="Chat with GridAI"><Assistant autoFocus /></section>
        <div className="gas-side">
          <section className="ix-card" aria-labelledby="gas-can-h">
            <div className="ix-card__head"><h2 id="gas-can-h">What {me ? me.name.split(' ')[0] : 'you'} can ask</h2></div>
            <ul className="gas-list">{AREAS.map(([t, sub, ids]) => {
              const ok = me ? ids.some((id) => canSee(me, id)) : true;
              return <li key={t}><Icon name={ok ? 'circle-check' : 'lock'} width="16" height="16" className={ok ? 'gas-yes' : 'gas-no'} aria-hidden="true" /><span><b>{t}</b><small>{ok ? sub : 'Not open to ' + (me ? roleOf(me).title : 'this role')}</small></span></li>;
            })}</ul>
          </section>
          <section className="ix-card" aria-labelledby="gas-never-h">
            <div className="ix-card__head"><h2 id="gas-never-h">It never does by itself</h2></div>
            <ul className="gas-list">
              {['Refunds and payment changes', 'Discounts above your limit', 'Stock changes', 'Messages to many customers', 'Deleting customer data'].map((t) => <li key={t}><Icon name="shield-check" width="16" height="16" aria-hidden="true" /><span>{t}</span></li>)}
              <li><span><small>These wait in <Link href="/ai-activity">Activity &amp; approvals</Link>.</small></span></li>
            </ul>
          </section>
        </div>
      </div>
    </GaFrame>
  );
}
