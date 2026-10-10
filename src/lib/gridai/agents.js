// Grid AI agents — one shared engine (engine.js), nine jobs. An agent is a setting, not a separate AI: its purpose,
// the knowledge it may read, the tools it may use, how it answers, when it hands over, its risk level, its model
// tier and its limits. The engine picks the agent from what the message is about.
//   AGENTS            the nine, with their defaults
//   getAgents()       with the merchant's changes          saveAgent(id, patch, by)      setAgentOn(id, on, by)
//   agentBy(id)       one agent
// Customer agents answer customers (Inbox); merchant agents answer the shop team (the assistant).
// Front end only: changes kept in this browser (gc.gridai.agents).

import { logAi } from './activity';

export const AGENTS_EVENT = 'gc:gridai-agents';
const KEY = 'gc.gridai.agents';

// tools (engine.js › TOOLS): what each agent may call
const A = (id, name, surface, icon, purpose, tools, knowledge, more = {}) => ({
  id, name, surface, icon, purpose, tools, knowledge, on: true, risk: 'low', tier: 2, maxReplies: 0, monthly: 0,
  instructions: '', escalate: 'Hand to a person when the customer is upset, asks for a refund, or the AI is not sure.', ...more,
});
export const AGENTS = [
  A('support', 'Customer support', 'customer', 'life-buoy', 'Answers questions about delivery, payment, returns, warranty and the shop.',
    ['get_product_details', 'check_stock', 'get_order_status', 'calculate_order_total', 'request_human'], ['company', 'policies', 'delivery', 'payments', 'returns', 'warranty', 'faq', 'custom'], { tier: 1 }),
  A('sales', 'AI sales', 'customer', 'sparkles', 'Suggests products within the customer’s budget, compares them and guides to a purchase. Never offers a discount above the shop’s limit.',
    ['search_products', 'get_product_details', 'check_stock', 'calculate_order_total', 'create_lead'], ['products', 'sales', 'campaign', 'faq', 'custom']),
  A('order', 'Orders', 'customer', 'shopping-bag', 'Collects name, phone, address, product and payment, shows a summary and places the order after the customer says yes.',
    ['search_products', 'check_stock', 'calculate_order_total', 'create_order_draft', 'submit_confirmed_order', 'get_order_status'], ['delivery', 'payments', 'policies'], { risk: 'medium' }),
  A('lead', 'Leads', 'customer', 'target', 'Spots buying interest (price, stock, delivery questions) and adds the person to Leads with the product and value.',
    ['create_lead', 'update_lead'], ['products', 'sales'], { tier: 1 }),
  A('followup', 'Follow-ups', 'customer', 'alarm-clock', 'Reminds customers who asked but didn’t order, within working hours, and stops when they reply, buy or opt out.',
    ['schedule_followup', 'search_products', 'check_stock'], ['products', 'campaign', 'faq'], { tier: 1, maxReplies: 3 }),
  A('marketing', 'Marketing', 'merchant', 'megaphone', 'Drafts campaign messages, suggests audiences and sums up how a campaign did. Bulk sends always wait for approval.',
    ['prepare_campaign', 'get_sales_summary', 'request_approval'], ['campaign', 'sales', 'products'], { risk: 'high' }),
  A('inventory', 'Inventory', 'merchant', 'boxes', 'Low stock, what is selling fast, what to reorder and where stock sits.',
    ['get_low_stock_products', 'check_stock', 'get_top_products'], ['products'], { tier: 2 }),
  A('analytics', 'Analytics', 'merchant', 'chart-column', 'Sales, orders, customers and courier figures from the shop’s own reports.',
    ['get_sales_summary', 'get_top_products', 'get_orders_waiting', 'get_cancelled_orders'], [], { tier: 3 }),
  A('operations', 'Shop operations', 'merchant', 'briefcase-business', 'Answers questions that cross areas and prepares actions (follow-ups, order changes) for approval.',
    ['get_orders_waiting', 'get_followups_due', 'get_interested_not_ordered', 'get_low_stock_products', 'request_approval'], ['policies', 'custom'], { tier: 3, risk: 'medium' }),
];

const read = () => { if (typeof window === 'undefined') return {}; try { return JSON.parse(window.localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const write = (v) => { try { window.localStorage.setItem(KEY, JSON.stringify(v)); window.dispatchEvent(new CustomEvent(AGENTS_EVENT)); } catch { /* ignore */ } };

export function getAgents() {
  const e = read();
  return AGENTS.map((a) => ({ ...a, ...(e[a.id] || {}) }));
}
export const agentBy = (id) => getAgents().find((a) => a.id === id) || null;
export function saveAgent(id, patch, by = 'You') {
  const e = read();
  e[id] = { ...(e[id] || {}), ...patch };
  write(e);
  const a = AGENTS.find((x) => x.id === id);
  logAi({ kind: 'settings', title: (a ? a.name : id) + ' agent changed', detail: Object.keys(patch).join(', '), by });
}
export function setAgentOn(id, on, by = 'You') { saveAgent(id, { on }, by); }
export function resetAgent(id) { const e = read(); delete e[id]; write(e); }
export const RISK_WORD = { low: ['Low', 'success'], medium: ['Medium', 'warning'], high: ['High', 'error'] };
