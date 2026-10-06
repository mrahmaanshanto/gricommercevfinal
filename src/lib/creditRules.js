// creditRules — whether a retail customer may leave money unpaid on a sale (buy "on due"), and on what terms.
// Set in Settings › Customers › Credit & dues (/customer-settings). Off by default: every retail sale is paid in full.
//   allowRetailDue     retail customers may buy on due (the POS "Due" button works)
//   defaultLimit       the most a customer may owe when their own credit limit is not set (৳; 0 = no limit)
//   dueDays            days after the sale the money is due (the invoice's due date; Dues and the customer's
//                      Invoices area count it as overdue after that)
//   needPhone          a customer's mobile number is needed to sell on due
//   managerAboveLimit  over the limit a manager approves with their PIN; off = the sale is refused
// Wholesale invoices follow their own price-list terms and are not limited here.
// Front end only: kept in this browser (localStorage 'gc.credit.rules').

const KEY = 'gc.credit.rules';
export const CREDIT_RULES_EVENT = 'gc:credit-rules';
export const DEFAULT_CREDIT_RULES = { allowRetailDue: false, defaultLimit: 5000, dueDays: 14, needPhone: true, managerAboveLimit: true };
const DAY = 864e5;

/** The rules as saved (the defaults on the server and before anything is saved). */
export function getCreditRules() {
  if (typeof window === 'undefined') return { ...DEFAULT_CREDIT_RULES };
  try { return { ...DEFAULT_CREDIT_RULES, ...(JSON.parse(window.localStorage.getItem(KEY)) || {}) }; } catch { return { ...DEFAULT_CREDIT_RULES }; }
}
/** Save some of the rules. Returns the rules now in force. */
export function saveCreditRules(patch) {
  const next = { ...getCreditRules(), ...patch };
  next.defaultLimit = Math.max(0, Math.round(Number(next.defaultLimit) || 0));
  next.dueDays = Math.min(180, Math.max(1, Math.round(Number(next.dueDays) || DEFAULT_CREDIT_RULES.dueDays)));
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); window.dispatchEvent(new CustomEvent(CREDIT_RULES_EVENT)); } catch { /* ignore */ }
  return next;
}
/** The most this customer may owe: their own credit limit, else the shop's default (0 = no limit). */
export const limitFor = (customer, rules = getCreditRules()) => (customer && Number(customer.creditLimit) > 0 ? Number(customer.creditLimit) : rules.defaultLimit);
/** When money left unpaid on a sale made at `at` is due. */
export const dueDateFor = (at = Date.now(), rules = getCreditRules()) => at + rules.dueDays * DAY;

/**
 * May this sale leave `owedNow` unpaid? `owedBefore` is what the customer owes already.
 * Returns { ok, reason, needPin, limit } — ok false with a reason the cashier can act on; needPin when a manager
 * has to approve going over the limit.
 */
export function checkDue({ phone, customer, owedNow, owedBefore = 0, wholesale = false }, rules = getCreditRules()) {
  if (!(owedNow > 0)) return { ok: true, needPin: false, limit: 0 };
  if (wholesale) return { ok: true, needPin: false, limit: 0 };
  if (!rules.allowRetailDue) return { ok: false, reason: 'Selling on due is off. Turn it on in Settings › Customers › Credit & dues.', needPin: false, limit: 0 };
  if (rules.needPhone && !String(phone || '').replace(/[^0-9]/g, '')) return { ok: false, reason: 'Add the customer’s mobile number to sell on due.', needPin: false, limit: 0 };
  const limit = limitFor(customer, rules);
  const over = limit > 0 && owedBefore + owedNow > limit;
  if (over && !rules.managerAboveLimit) return { ok: false, reason: 'This takes the customer over their credit limit.', needPin: false, limit };
  return { ok: true, needPin: over, limit };
}
