// triggers — the standard trigger catalogue (brief #13, Recovery & customer intelligence › Smart offers).
// Every trigger names the area that owns the event, the window it is judged in and the key that makes it fire
// once: the same event arriving twice must not enrol a customer twice. Recovery steps (cart reminders, payment
// follow-ups, win-back) name the trigger they start from.
// Front end only: enrolments are kept in this browser (gc.recovery.enrolments). A server would hold the
// idempotency keys; the demo behaves as if it did.

export const TRIGGER_FAMILIES = { behaviour: 'Behaviour', order: 'Order', payment: 'Payment', stock: 'Stock', lifecycle: 'Lifecycle', segment: 'Segment', loyalty: 'Loyalty', service: 'Service', date: 'Date' };
export const TRIGGERS = [
  { id: 'cart_abandoned', family: 'behaviour', label: 'Cart left', owner: 'Online store', window: '1 hour with no order', key: 'Cart' },
  { id: 'checkout_abandoned', family: 'behaviour', label: 'Checkout left', owner: 'Online store', window: '30 minutes after checkout started', key: 'Checkout' },
  { id: 'payment_failed', family: 'payment', label: 'Payment failed or pending', owner: 'Payments', window: '15 minutes, after a payment check', key: 'Payment' },
  { id: 'viewed_not_bought', family: 'behaviour', label: 'Viewed, didn’t buy', owner: 'Tracking', window: '3 views in 7 days', key: 'Customer + product + week' },
  { id: 'back_in_stock', family: 'stock', label: 'Item back in stock', owner: 'Inventory', window: 'When stock arrives', key: 'Cart + product' },
  { id: 'first_order_delivered', family: 'order', label: 'First order delivered', owner: 'Orders', window: 'On delivery', key: 'Order' },
  { id: 'late_delivery', family: 'service', label: 'Late delivery', owner: 'Orders', window: '2 days past the promised date', key: 'Order' },
  { id: 'item_returned', family: 'service', label: 'Item returned', owner: 'After-sales', window: 'On return', key: 'Return' },
  { id: 'gone_quiet', family: 'lifecycle', label: 'Gone quiet', owner: 'Customer intelligence', window: 'No order for 60 days', key: 'Customer + month' },
  { id: 'due_to_buy', family: 'lifecycle', label: 'Due to buy again', owner: 'Customer intelligence', window: 'Usual gap between orders', key: 'Customer + month' },
  { id: 'segment_entered', family: 'segment', label: 'Joins a segment', owner: 'Customers', window: 'When the segment is refreshed', key: 'Customer + segment' },
  { id: 'points_expiring', family: 'loyalty', label: 'Points about to expire', owner: 'Loyalty', window: '7 days before expiry', key: 'Customer + expiry date' },
  { id: 'birthday', family: 'date', label: 'Birthday', owner: 'Customers', window: 'On the day', key: 'Customer + year' },
];
export const triggerBy = (id) => TRIGGERS.find((t) => t.id === id) || null;

export const ENROL_KEY = 'gc.recovery.enrolments';
const ssr = () => typeof window === 'undefined';
function read() { if (ssr()) return []; try { return JSON.parse(window.localStorage.getItem(ENROL_KEY)) || []; } catch { return []; } }
function write(list) { try { window.localStorage.setItem(ENROL_KEY, JSON.stringify(list.slice(0, 500))); } catch { /* storage blocked */ } }

/**
 * Enrol one event in a journey, once. eventKey identifies the event (cart id, order id …).
 * → { enrolment, duplicate } — duplicate is true when this event was already enrolled (nothing new happens).
 */
export function enrol(triggerId, eventKey, { customerId = '', journey = 'recovery' } = {}) {
  const key = journey + '|' + triggerId + '|' + eventKey;
  const all = read();
  const hit = all.find((e) => e.key === key);
  if (hit) return { enrolment: hit, duplicate: true };
  const enrolment = { key, triggerId, eventKey, customerId, journey, at: Date.now(), state: 'eligible' };
  write([enrolment, ...all]);
  return { enrolment, duplicate: false };
}
/** Move an enrolment on: eligible → waiting → action queued → action sent → converted / stopped / suppressed. */
export function setEnrolmentState(key, state) { write(read().map((e) => (e.key === key ? { ...e, state, changedAt: Date.now() } : e))); }
export const getEnrolments = () => read();
