// notifications — SMS and email messages about an order, sent when something happens to it (event-driven).
//   EVENTS     every order event a message can go out for, with its default templates
//   VARIABLES  the {{placeholders}} a template can use
//   getNotifySettings() / saveNotifySettings()   Settings › Notifications › Order notifications
//   notify(order, event, extra)    sends what the settings turn on, once per order and event (a courier
//                                  webhook that arrives twice sends nothing the second time)
//   notificationLog(order)         the order's log: event, channel, recipient, trigger, time, status, retries
//   retryNotification(id)          sends a failed message again
//   eventClass(key)                the message class of an event (Transactional / Service), messagePolicy.js
// Every customer message passes the shared send layer first (messaging.js › checkSend): an address on the suppression
// list or a customer without consent for the class gets no message (logged as Skipped with the reason).
// Front end only: nothing leaves the browser. A message "goes out" as a log row; an SMS to a bad number fails
// the way the real gateway would refuse it, and a customer with no email address gets no email.
// Orders the demo generates (orders.js, liveOrders.js) get the rows their past events would have sent.

// WhatsApp (review CX-F2): a third channel next to SMS and email, to the customer only. Each event has an approved-template
// style message (name, language, body with {{variables}}, an optional "Track order" button). It goes out through the one
// send layer (messaging.js › send: consent, suppression, caps and quiet hours; a quiet-hours message waits as Queued), so
// its rows live in the shared delivery log with ref = the order id; notificationLog() merges them into the order's log.
// "Fall back to SMS" sends the event's SMS text instead when WhatsApp isn't connected, the template isn't approved, the
// number can't get WhatsApp or the provider refuses it (only when the event's SMS isn't already on).
// Template review is simulated: an edited template is "In review" for two minutes, then Approved (a server would read
// Meta's answer); a utility template that reads like an offer is Rejected the way Meta rejects it.

import { MERCHANT } from './merchant';
import { formatBDT } from './format';
import { checkSend, send as sendMessage, deliveryLog, retry as retryMessage } from './messaging';
import { trackingLink } from './orderStatus';

const SETTINGS_KEY = 'gc.notify.settings';
const LOG_KEY = 'gc.notify.log';
export const NOTIFY_EVENT = 'gc:notify';

const read = (key, fb) => { if (typeof window === 'undefined') return fb; try { const v = JSON.parse(window.localStorage.getItem(key)); return v == null ? fb : v; } catch { return fb; } };
const write = (key, v) => { try { window.localStorage.setItem(key, JSON.stringify(v)); window.dispatchEvent(new CustomEvent(NOTIFY_EVENT)); } catch { /* ignore */ } };

/** The placeholders a template can use, with an example for the preview. */
export const VARIABLES = [
  ['customer_name', 'Customer name', 'Nusrat Jahan'], ['order_id', 'Order number', '#136829'], ['order_total', 'Order total', '৳2,000'],
  ['paid_amount', 'Paid so far', '৳500'], ['advance_amount', 'Advance asked or paid', '৳500'], ['remaining_amount', 'Still to pay', '৳1,500'],
  ['cod_amount', 'Cash to collect on delivery', '৳1,500'], ['courier_name', 'Courier', 'Pathao'], ['tracking_id', 'Tracking ID', 'PT-4480127'],
  ['tracking_url', 'Tracking link', 'https://dazzleshop.com.bd/track/PT-4480127'], ['payment_link', 'Payment link', 'https://dazzleshop.com.bd/pay/136829'],
  ['cancel_reason', 'Why it was cancelled', 'Customer asked to cancel'], ['reject_reason', 'Why the payment was rejected', 'The transaction ID did not match'],
  ['quote_link', 'Quotation link', 'https://dazzleshop.com.bd/quote/Q-1042'], ['store_name', 'Shop name', MERCHANT.name], ['support_phone', 'Support phone', MERCHANT.phone],
  // digital orders (ON-F14): the licence key(s) given and the download link
  ['licence_key', 'Licence key', 'GRID-AV1Y-8PL5-ZC3V-11KM'], ['download_link', 'Download link', 'https://dazzleshop.com.bd/download/D7K2Q9'],
];

// group · key · label · when it fires · customer on · merchant on · SMS · email text
const E = (group, key, label, when, cust, merch, sms, subject, body, note) => ({ group, key, label, when, customer: cust, merchant: merch, sms, subject, body, note: note || '' });
export const EVENTS = [
  E('New order', 'new-order', 'Order received', 'Order placed', true, true,
    '{{store_name}}: Order {{order_id}} received. Total {{order_total}}.',
    'Order {{order_id}} received', 'Hi {{customer_name}},\n\nThanks for your order {{order_id}}. We\'ll call you to confirm it.\n\n{{store_name}}'),
  E('New order', 'on-hold', 'Order on hold', 'COD order waiting for verification', false, false,
    '{{store_name}}: We\'ll call you to confirm order {{order_id}}.',
    'Order {{order_id}} on hold', 'Hi {{customer_name}},\n\nWe\'ll call you to confirm order {{order_id}}.\n\n{{store_name}}'),
  E('New order', 'payment-pending', 'Payment pending', 'Order placed with payment due', true, false,
    '{{store_name}}: Pay {{remaining_amount}} for order {{order_id}}: {{payment_link}}',
    'Payment due for {{order_id}}', 'Hi {{customer_name}},\n\nPay {{remaining_amount}} for order {{order_id}}:\n{{payment_link}}\n\n{{store_name}}'),
  E('New order', 'processing', 'Payment received', 'Order paid in full', true, false,
    '{{store_name}}: Payment of {{paid_amount}} received for order {{order_id}}.',
    'Payment received for {{order_id}}', 'Hi {{customer_name}},\n\nWe received {{paid_amount}} for order {{order_id}}.\n\n{{store_name}}'),
  E('Verification', 'verify-requested', 'Verification call', 'Auto call started', false, false,
    '{{store_name}}: We\'re calling you to confirm order {{order_id}}.', 'Confirming order {{order_id}}', 'Hi {{customer_name}},\n\nWe\'re calling you to confirm order {{order_id}}.\n\n{{store_name}}'),
  E('Verification', 'verified', 'Order verified', 'Customer confirmed on the call', false, false,
    '{{store_name}}: Thanks for confirming order {{order_id}}.', 'Order {{order_id}} confirmed', 'Hi {{customer_name}},\n\nThanks for confirming order {{order_id}}.\n\n{{store_name}}', 'Optional'),
  E('Approval', 'approved', 'Order approved', 'Order approved', true, false,
    '{{store_name}}: Order {{order_id}} confirmed. We\'re preparing it.',
    'Order {{order_id}} confirmed', 'Hi {{customer_name}},\n\nYour order {{order_id}} is confirmed. We\'re preparing it.\n\n{{store_name}}'),
  E('Approval', 'advance-requested', 'Advance requested', 'Advance asked for a COD order', true, false,
    '{{store_name}}: Pay {{advance_amount}} advance for order {{order_id}}: {{payment_link}}. Pay {{remaining_amount}} on delivery.',
    'Advance for order {{order_id}}', 'Hi {{customer_name}},\n\nPay {{advance_amount}} advance to confirm order {{order_id}}:\n{{payment_link}}\n\nOrder total: {{order_total}}\nPay on delivery: {{remaining_amount}}\n\n{{store_name}}'),
  E('Approval', 'advance-received', 'Advance received', 'Advance paid', true, true,
    '{{store_name}}: Advance of {{advance_amount}} received. Remaining: {{remaining_amount}}.',
    'Advance received for {{order_id}}', 'Hi {{customer_name}},\n\nWe received your advance of {{advance_amount}}.\nRemaining: {{remaining_amount}}\n\n{{store_name}}'),
  E('Approval', 'cancelled', 'Order cancelled', 'Order cancelled', true, true,
    '{{store_name}}: Order {{order_id}} cancelled. {{cancel_reason}}',
    'Order {{order_id}} cancelled', 'Hi {{customer_name}},\n\nYour order {{order_id}} was cancelled. {{cancel_reason}}\nQuestions? Call {{support_phone}}.\n\n{{store_name}}'),
  E('Courier', 'ready', 'Ready for courier', 'Parcel packed', false, false,
    '{{store_name}}: Order {{order_id}} is packed and ready to ship.',
    'Order {{order_id}} packed', 'Hi {{customer_name}},\n\nYour order {{order_id}} is packed and ready to ship.\n\n{{store_name}}', 'Usually internal'),
  E('Courier', 'in-transit', 'Sent to courier', 'Handed to the courier', true, false,
    '{{store_name}}: Order {{order_id}} shipped via {{courier_name}}. Track: {{tracking_url}}',
    'Order {{order_id}} is on the way', 'Hi {{customer_name}},\n\nYour order {{order_id}} is on the way.\nCourier: {{courier_name}}\nTracking ID: {{tracking_id}}\n{{tracking_url}}\n\n{{store_name}}'),
  E('Delivery', 'out-for-delivery', 'Out for delivery', 'Courier out for delivery', true, false,
    '{{store_name}}: Order {{order_id}} arrives today. Please keep {{cod_amount}} ready.',
    'Order {{order_id}} arrives today', 'Hi {{customer_name}},\n\nYour order {{order_id}} arrives today.\nPay on delivery: {{cod_amount}}\n\n{{store_name}}', 'If the courier sends it'),
  E('Delivery', 'delivered', 'Delivered', 'Courier confirmed delivery', true, false,
    '{{store_name}}: Order {{order_id}} delivered. Thank you for shopping with us.',
    'Order {{order_id}} delivered', 'Hi {{customer_name}},\n\nYour order {{order_id}} was delivered. Thank you for shopping with us.\n\n{{store_name}}'),
  E('Delivery', 'delivery-failed', 'Delivery failed', 'Courier could not deliver', true, true,
    '{{store_name}}: We couldn\'t deliver order {{order_id}}. Call {{support_phone}}.',
    'Delivery failed for {{order_id}}', 'Hi {{customer_name}},\n\nWe couldn\'t deliver order {{order_id}} today. Call {{support_phone}} to rearrange.\n\n{{store_name}}'),
  E('Returns', 'return-initiated', 'Return started', 'Courier started the return', false, true,
    'Order {{order_id}} is being returned.', 'Order {{order_id}} return started', 'Order {{order_id}} ({{customer_name}}) is being returned by {{courier_name}}.'),
  E('Returns', 'returning', 'Returning', 'Parcel on its way back', false, false,
    'Order {{order_id}} is on its way back.', 'Order {{order_id}} returning', 'Order {{order_id}} is on its way back.'),
  E('Returns', 'returned', 'Returned', 'Parcel back at the shop', false, true,
    'Order {{order_id}} is back. Check it into stock.', 'Order {{order_id}} returned', 'Order {{order_id}} ({{customer_name}}) is back. Check it into stock.'),
  // payments and changes (Agent B, brief #4): proof of payment, a rejected payment, an edited order, a quotation
  E('Payment', 'payment-proof-received', 'Payment proof received', 'Customer sent a payment proof', false, true,
    '{{store_name}}: We got your payment proof for order {{order_id}}. We\'ll check it soon.',
    'Payment proof for {{order_id}}', 'Order {{order_id}} ({{customer_name}}): a payment proof of {{paid_amount}} is waiting for review.', 'To the shop'),
  E('Payment', 'payment-rejected', 'Payment rejected', 'Payment proof rejected', true, false,
    '{{store_name}}: We couldn\'t confirm your payment for order {{order_id}}. {{reject_reason}} Pay: {{payment_link}}',
    'Payment not confirmed for {{order_id}}', 'Hi {{customer_name}},\n\nWe couldn\'t confirm your payment for order {{order_id}}. {{reject_reason}}\nPay here: {{payment_link}}\n\n{{store_name}}'),
  E('Changes', 'order-updated', 'Order updated', 'Items or amounts changed', true, false,
    '{{store_name}}: Order {{order_id}} updated. New total {{order_total}}. Pay on delivery: {{cod_amount}}.',
    'Order {{order_id}} updated', 'Hi {{customer_name}},\n\nYour order {{order_id}} was updated.\nNew total: {{order_total}}\nPay on delivery: {{cod_amount}}\n\n{{store_name}}'),
  E('Changes', 'quote-sent', 'Quotation sent', 'A quotation is sent', true, false,
    '{{store_name}}: Your quotation is ready: {{quote_link}}',
    'Your quotation from {{store_name}}', 'Hi {{customer_name}},\n\nYour quotation is ready:\n{{quote_link}}\n\n{{store_name}}', 'Optional'),
  // digital orders (ON-F14): the key or download link goes out instead of a parcel
  E('Delivery', 'digital-sent', 'Download or key sent', 'Digital order sent', true, false,
    '{{store_name}}: Order {{order_id}}. {{licence_key}} {{download_link}}',
    'Your order {{order_id}} is ready', 'Hi {{customer_name}},\n\nYour order {{order_id}} is ready.\n{{licence_key}}\n{{download_link}}\n\n{{store_name}}'),
];
export const eventBy = (key) => EVENTS.find((e) => e.key === key) || null;

// ---- messages beyond orders (review CX-F3) -----------------------------------------------------------------------
// Refunds and returns, store credit and loyalty, invoices and dues, support tickets, warranty and service, the account.
// They sit in the same matrix (SMS · WhatsApp · email · to the customer · to the shop) with the same templates as the
// order events, and go out with notifyCustomer() (end of this file) through the shared send layer. Extra fields:
//   scope 'customer' (not an order) · mod  the module the event belongs to (Settings shows it only in editions with it)
//   vars  its own {{placeholders}} (CUSTOMER_VARIABLES) · source  the area in the delivery log
//   sender  what sends it today ('' = nothing yet: the setting is kept for when that part is built)
//   owner 'loyalty'  Loyalty sends it with its own templates and on / off (Loyalty › Messages, lib/loyalty.js)
const C = (group, key, label, when, cust, merch, sms, subject, body, more = {}) => ({ ...E(group, key, label, when, cust, merch, sms, subject, body, more.note), scope: 'customer', cls: 'Service', source: 'Notifications', mod: 'core', vars: [], sender: '', owner: '', ...more });
export const CUSTOMER_EVENTS = [
  C('Refunds & returns', 'refund-sent', 'Refund sent', 'A refund is sent', true, false,
    '{{store_name}}: Refund of {{refund_amount}} sent to your {{refund_method}}. Ref {{ref_id}}.',
    'Refund sent', 'Hi {{customer_name}},\n\nWe sent your refund of {{refund_amount}} to your {{refund_method}}.\nRef: {{ref_id}}\n\n{{store_name}}', { vars: ['refund_amount', 'refund_method', 'ref_id'], source: 'Orders', sender: 'Refunds (sent step)' }),
  C('Refunds & returns', 'return-received', 'Return received', 'Returned items checked in', true, false,
    '{{store_name}}: We got your return {{ref_id}}. We\'ll update you soon.',
    'Return {{ref_id}} received', 'Hi {{customer_name}},\n\nWe got your return {{ref_id}} and are checking it.\n\n{{store_name}}', { vars: ['ref_id'], source: 'Orders', sender: 'Return & exchange · Return requests' }),
  C('Store credit & loyalty', 'credit-added', 'Store credit added', 'Credit added to their account', true, false,
    '{{store_name}}: {{credit_amount}} store credit added. Balance {{credit_balance}}.',
    'Store credit added', 'Hi {{customer_name}},\n\n{{credit_amount}} store credit was added. Balance: {{credit_balance}}.\n\n{{store_name}}', { vars: ['credit_amount', 'credit_balance'], mod: 'marketing', source: 'Loyalty', owner: 'loyalty', sender: 'Loyalty' }),
  C('Store credit & loyalty', 'level-up', 'New level', 'A member moves up a level', true, false,
    '{{store_name}}: You are now {{level}}. Enjoy your new rewards.',
    'You are now {{level}}', 'Hi {{customer_name}},\n\nYou are now {{level}}. Enjoy your new rewards.\n\n{{store_name}}', { vars: ['level'], mod: 'marketing', source: 'Loyalty', owner: 'loyalty', sender: 'Loyalty' }),
  C('Store credit & loyalty', 'invite-reward', 'Invite reward ready', 'A friend they invited bought', true, false,
    '{{store_name}}: Your invite reward is ready.',
    'Your invite reward is ready', 'Hi {{customer_name}},\n\nA friend you invited made a purchase. Your reward is ready.\n\n{{store_name}}', { mod: 'marketing', source: 'Loyalty', owner: 'loyalty', sender: 'Loyalty' }),
  C('Store credit & loyalty', 'points-expiring', 'Points expiring', 'Points end within a month', true, false,
    '{{store_name}}: {{points}} points end on {{due_date}}. Use them soon.',
    'Your points end soon', 'Hi {{customer_name}},\n\n{{points}} points end on {{due_date}}. Use them soon.\n\n{{store_name}}', { vars: ['points', 'due_date'], mod: 'marketing', source: 'Loyalty', owner: 'loyalty', sender: 'Loyalty' }),
  C('Invoices & dues', 'invoice-sent', 'Invoice sent', 'An invoice is made out', true, false,
    '{{store_name}}: Invoice {{invoice_id}} for {{invoice_total}}. Due {{due_date}}.',
    'Invoice {{invoice_id}}', 'Hi {{customer_name}},\n\nInvoice {{invoice_id}} for {{invoice_total}} is due on {{due_date}}.\n\n{{store_name}}', { vars: ['invoice_id', 'invoice_total', 'due_date'], mod: 'money', source: 'Sales', cls: 'Transactional' }),
  C('Invoices & dues', 'invoice-due', 'Payment reminder', 'Staff send a reminder', true, false,
    '{{store_name}}: {{due_amount}} due on invoice {{invoice_id}} by {{due_date}}. Pay: {{payment_link}}',
    'Payment due: {{invoice_id}}', 'Hi {{customer_name}},\n\n{{due_amount}} is due on invoice {{invoice_id}} by {{due_date}}.\nPay here: {{payment_link}}\n\n{{store_name}}', { vars: ['invoice_id', 'due_amount', 'due_date', 'payment_link'], mod: 'money', source: 'Sales', cls: 'Transactional', sender: 'Customer › Invoices' }),
  C('Invoices & dues', 'invoice-overdue', 'Overdue reminder', 'Reminder after the due date', true, true,
    '{{store_name}}: Invoice {{invoice_id}} is overdue. {{due_amount}} to pay. Call {{support_phone}}.',
    'Invoice {{invoice_id}} is overdue', 'Hi {{customer_name}},\n\nInvoice {{invoice_id}} is overdue. {{due_amount}} is still to pay.\nPay here: {{payment_link}}\n\n{{store_name}}', { vars: ['invoice_id', 'due_amount', 'payment_link'], mod: 'money', source: 'Sales', cls: 'Transactional', sender: 'Customer › Invoices' }),
  C('Support tickets', 'ticket-opened', 'Ticket opened', 'A ticket is made for them', true, false,
    '{{store_name}}: We got your request {{ticket_id}}. We\'ll reply soon.',
    'We got your request {{ticket_id}}', 'Hi {{customer_name}},\n\nWe got your request {{ticket_id}}: {{ticket_subject}}.\nWe\'ll reply soon.\n\n{{store_name}}', { vars: ['ticket_id', 'ticket_subject'], mod: 'comms', source: 'Support', sender: 'Support tickets' }),
  C('Support tickets', 'ticket-replied', 'Ticket replied', 'Staff reply on the ticket', false, false,
    '{{store_name}}: New reply on {{ticket_id}}. Check your messages.',
    'New reply on {{ticket_id}}', 'Hi {{customer_name}},\n\nWe replied to your request {{ticket_id}}:\n\n{{reply_text}}\n\n{{store_name}}', { vars: ['ticket_id', 'ticket_subject', 'reply_text'], mod: 'comms', source: 'Support', sender: 'Support tickets', note: 'The reply itself goes on the ticket\'s channel' }),
  C('Support tickets', 'ticket-solved', 'Ticket solved', 'The ticket is solved', true, false,
    '{{store_name}}: Your request {{ticket_id}} is solved. Reply if you need more help.',
    'Request {{ticket_id}} solved', 'Hi {{customer_name}},\n\nYour request {{ticket_id}} is solved. Reply if you need more help.\n\n{{store_name}}', { vars: ['ticket_id', 'ticket_subject'], mod: 'comms', source: 'Support', sender: 'Support tickets' }),
  C('Warranty & service', 'service-received', 'Service request received', 'A warranty service is logged', true, true,
    '{{store_name}}: Service request {{claim_id}} for {{item_name}} received. We\'ll update you.',
    'Service request {{claim_id}}', 'Hi {{customer_name}},\n\nWe logged service request {{claim_id}} for {{item_name}}. We\'ll update you.\n\n{{store_name}}', { vars: ['claim_id', 'item_name'], mod: 'catalog', source: 'Service', sender: 'Customer › Warranty' }),
  C('Warranty & service', 'service-update', 'Repair update', 'The claim moves a step', true, false,
    '{{store_name}}: {{item_name}} ({{claim_id}}): {{claim_status}}.',
    'Update on {{claim_id}}', 'Hi {{customer_name}},\n\n{{item_name}} ({{claim_id}}): {{claim_status}}.\n\n{{store_name}}', { vars: ['claim_id', 'item_name', 'claim_status'], mod: 'catalog', source: 'Service', sender: 'Products › Warranty claims' }),
  C('Warranty & service', 'service-ready', 'Ready to collect', 'The repaired item is back', true, false,
    '{{store_name}}: {{item_name}} is ready to collect. Bring {{claim_id}}.',
    '{{item_name}} is ready', 'Hi {{customer_name}},\n\n{{item_name}} is ready to collect. Please bring {{claim_id}}.\n\n{{store_name}}', { vars: ['claim_id', 'item_name'], mod: 'catalog', source: 'Service', sender: 'Products › Warranty claims' }),
  C('Account', 'welcome', 'Welcome', 'A customer is added', false, false,
    '{{store_name}}: Welcome, {{customer_name}}! Thanks for shopping with us.',
    'Welcome to {{store_name}}', 'Hi {{customer_name}},\n\nWelcome to {{store_name}}. Thanks for shopping with us.\n\n{{store_name}}', { source: 'Account', sender: 'Customers › Add customer' }),
  C('Account', 'otp', 'Sign-in code', 'They sign in to the online store', true, false,
    '{{otp_code}} is your {{store_name}} code. Don\'t share it.',
    'Your sign-in code', 'Your {{store_name}} code is {{otp_code}}. Don\'t share it.', { vars: ['otp_code'], cls: 'Transactional', source: 'Account', mod: 'online', note: 'Needs the server' }),
  C('Account', 'password-reset', 'Password reset', 'Staff send a reset link', true, false,
    '{{store_name}}: Reset your password: {{reset_link}}',
    'Reset your password', 'Hi {{customer_name}},\n\nReset your password here:\n{{reset_link}}\n\n{{store_name}}', { vars: ['reset_link'], cls: 'Transactional', source: 'Account', mod: 'online', sender: 'Customer profile' }),
];
EVENTS.push(...CUSTOMER_EVENTS);
/** The placeholders of the events beyond orders, with an example for the preview. */
export const CUSTOMER_VARIABLES = [
  ['customer_name', 'Customer name', 'Nusrat Jahan'], ['store_name', 'Shop name', MERCHANT.name], ['support_phone', 'Support phone', MERCHANT.phone],
  ['refund_amount', 'Refund amount', '৳1,450'], ['refund_method', 'Refunded to', 'bKash'], ['ref_id', 'Reference', 'RF-2041'],
  ['credit_amount', 'Credit added', '৳200'], ['credit_balance', 'Credit balance', '৳650'], ['level', 'Loyalty level', 'Gold'], ['points', 'Points', '320'],
  ['invoice_id', 'Invoice number', 'INV-1042'], ['invoice_total', 'Invoice total', '৳12,400'], ['due_amount', 'Amount due', '৳4,400'], ['due_date', 'Due date', '20 Oct 2026'],
  ['payment_link', 'Payment link', 'https://dazzleshop.com.bd/pay/INV-1042'], ['ticket_id', 'Ticket number', 'TKT-2305'], ['ticket_subject', 'Ticket subject', 'Change the delivery address'],
  ['reply_text', 'The reply', 'Done, we changed it.'], ['claim_id', 'Service request', 'WS-118'], ['item_name', 'Item', 'Redmi Note 13'], ['claim_status', 'Repair step', 'Sent to the service centre'],
  ['otp_code', 'Sign-in code', '482913'], ['reset_link', 'Reset link', 'https://dazzleshop.com.bd/reset/8K2Q'],
];
// Nayeem's brief #11: every template and send carries a class. Order-life events are Transactional; delivery
// problems, verification calls and returns are Service.
const SERVICE_EVENTS = ['verify-requested', 'verified', 'delivery-failed', 'return-initiated', 'returning', 'returned'];
export const eventClass = (key) => { const ev = eventBy(key); if (ev && ev.scope === 'customer') return ev.cls; return SERVICE_EVENTS.includes(key) ? 'Service' : 'Transactional'; };
/** The merchant's own message for an event (customers get the event's text; the shop gets this). */
const MERCHANT_SMS = {
  'new-order': 'New order {{order_id}} from {{customer_name}}. {{order_total}}.',
  'advance-received': 'Advance {{advance_amount}} received for {{order_id}}.',
  cancelled: 'Order {{order_id}} cancelled. {{cancel_reason}}',
  'delivery-failed': 'Delivery failed: {{order_id}} ({{courier_name}}).',
  'return-initiated': 'Return started: {{order_id}} ({{courier_name}}).',
  returned: 'Order {{order_id}} is back.',
  'payment-proof-received': 'Payment proof for {{order_id}} ({{paid_amount}}). Review it.',
};

// ---- WhatsApp templates ------------------------------------------------------------------------------------
const TRACK_EVENTS = ['in-transit', 'out-for-delivery', 'delivery-failed'];
export const WA_LANGS = ['English', 'Bangla'];
/** The default WhatsApp template of an event: the SMS text without the shop prefix, greeted and signed. */
const waDefault = (e) => ({
  waName: (e.scope === 'customer' ? '' : 'order_') + e.key.replace(/-/g, '_') + '_v1', waLang: 'English',
  waBody: 'Hi {{customer_name}},\n\n' + String(e.sms).replace(/^\{\{store_name\}\}:\s*/, '') + '\n\n{{store_name}}',
  waButton: TRACK_EVENTS.includes(e.key), waEditedAt: 0,
});
const OFFER_WORDS = /\b(offer|discount|sale|coupon|% off|free gift|cashback)\b/i;
/** A template's review state: { state: 'Approved' | 'In review' | 'Rejected', reason }. */
export function waTemplateState(t, at = Date.now()) {
  if (!t) return { state: 'Rejected', reason: 'No template' };
  const body = String(t.waBody || '');
  if (!body.replace(/\{\{\s*[a-z_]+\s*\}\}/g, '').trim()) return { state: 'Rejected', reason: 'A template needs words besides the variables' };
  if (OFFER_WORDS.test(body)) return { state: 'Rejected', reason: 'Reads like an offer. Order updates can\'t carry offers' };
  if (!/^[a-z0-9_]+$/.test(String(t.waName || ''))) return { state: 'Rejected', reason: 'Name: small letters, numbers and _ only' };
  if (t.waEditedAt && at - t.waEditedAt < 2 * 60 * 1000) return { state: 'In review', reason: 'WhatsApp is checking it. This usually takes a few minutes' };
  return { state: 'Approved', reason: '' };
}
/** Is WhatsApp Business connected (Settings › Connections)? Read straight from its store, so this lib stays light;
 *  a browser that never opened Connections has the demo's connected account (connections.js › seed). */
export function waConnected() {
  if (typeof window === 'undefined') return true;
  try { const s = JSON.parse(window.localStorage.getItem('gc.connections')); if (!s || s.v !== 1) return true; return !!(s.apps && s.apps.whatsapp); } catch { return true; }
}

// ---- settings --------------------------------------------------------------------------------------------
const defaults = () => ({
  senderName: MERCHANT.name, emailFrom: MERCHANT.name, replyTo: 'support@dazzleshop.com.bd',
  adminPhone: '01700-000000', adminEmail: 'orders@dazzleshop.com.bd', waFallback: true,
  events: Object.fromEntries(EVENTS.map((e) => [e.key, { sms: e.customer || e.merchant, email: e.customer || e.merchant, whatsapp: false, customer: e.customer, merchant: e.merchant, smsText: e.sms, subject: e.subject, body: e.body, merchantText: MERCHANT_SMS[e.key] || '', ...waDefault(e) }])),
});
export function getNotifySettings() {
  const d = defaults();
  const s = read(SETTINGS_KEY, {});
  return { ...d, ...s, events: Object.fromEntries(EVENTS.map((e) => [e.key, { ...d.events[e.key], ...((s.events || {})[e.key] || {}) }])) };
}
export const saveNotifySettings = (s) => write(SETTINGS_KEY, s);
export const defaultTemplate = (key) => defaults().events[key];

// ---- templates ------------------------------------------------------------------------------------------
const money = (n) => formatBDT(Math.round(Number(n) || 0));
/** The values the placeholders take for an order (and the event's extras). */
export function varsOf(o, extra = {}) {
  const paid = Number(o.paid) || 0;
  const remaining = Math.max(0, (Number(o.amount) || 0) - paid);
  const id = String(o.consignment && o.consignment !== '—' ? o.consignment : extra.trackingId || '');
  return {
    customer_name: o.customer || 'Customer', order_id: o.id, order_total: money(o.amount), paid_amount: money(paid),
    advance_amount: money(extra.advance != null ? extra.advance : (o.advance && o.advance.amount) || 0),
    remaining_amount: money(extra.remaining != null ? extra.remaining : remaining), cod_amount: money(o.codAmount != null ? o.codAmount : remaining),
    courier_name: (o.courier && o.courier !== 'Not assigned' ? o.courier : extra.courier) || 'the courier', tracking_id: id || '—',
    tracking_url: o.trackingUrl || trackingLink(o.id), payment_link: 'https://dazzleshop.com.bd/pay/' + String(o.id).replace('#', ''),
    cancel_reason: extra.reason ? `${extra.reason}.` : '', reject_reason: extra.rejectReason || extra.reason ? `${extra.rejectReason || extra.reason}.` : '',
    quote_link: extra.quoteLink || 'https://dazzleshop.com.bd/quote/' + String(o.id).replace('#', ''), store_name: MERCHANT.name, support_phone: MERCHANT.phone,
    licence_key: extra.keys != null ? (extra.keys.length ? 'Key: ' + extra.keys.join(', ') : '') : '', download_link: extra.download || '',
    ...(extra.vars || {}),
  };
}
/** Fill a template's {{placeholders}}; an unknown one stays as it is. */
export const fill = (text, vars) => String(text || '').replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
/** SMS parts: 160 characters a part in English, 70 when the text has Bangla (or other non-GSM) letters. */
export function smsParts(text) {
  const t = String(text || '');
  const unicode = /[^\x00-\x7F৳]/.test(t.replace(/৳/g, ''));
  const per = unicode ? 70 : 160;
  return { chars: t.length, parts: Math.max(1, Math.ceil(t.length / per)), per, unicode };
}

// ---- sending ------------------------------------------------------------------------------------------------
const digits = (p) => String(p || '').replace(/\D/g, '').replace(/^88/, '');
const hash = (s) => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 1000003; return h; };
/** What a gateway does with one message: delivered, refused (bad number) or not sent (no address). */
function outcome(channel, to, key) {
  if (channel === 'SMS') {
    if (!/^01[3-9]\d{8}$/.test(digits(to))) return { status: 'Failed', error: 'Not a Bangladeshi mobile number' };
    return hash(key) % 17 === 0 ? { status: 'Failed', error: 'The SMS gateway did not accept the message' } : { status: 'Delivered' };
  }
  if (!to) return { status: 'Skipped', error: 'No email address' };
  return { status: 'Delivered' };
}
const getLog = () => read(LOG_KEY, []);

/**
 * Send what the settings turn on for this event. Each order gets one round per event (and `extra.once`,
 * e.g. a courier's event id): repeating the same event — a webhook delivered twice — sends nothing.
 * Returns { sent: n, duplicate: bool }.
 */
export function notify(o, event, extra = {}) {
  if (typeof window === 'undefined' || !o) return { sent: 0, duplicate: false };
  const ev = eventBy(event);
  if (!ev || ev.scope === 'customer') return { sent: 0, duplicate: false };   // events beyond orders: notifyCustomer()
  const once = `${o.id}|${event}|${extra.once || ''}`;
  const log = getLog();
  if (log.some((r) => r.once === once) || synthLog(o).some((r) => r.event === event)) return { sent: 0, duplicate: true };
  const s = getNotifySettings();
  const t = s.events[event];
  const vars = varsOf(o, extra);
  const at = extra.at || Date.now();
  const rows = [];
  const add = (recipient, channel, to, text, subject) => {
    const id = 'NT-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const cls = eventClass(event);
    // the shared send layer: suppression and consent are checked at the moment it goes out (shop copies are internal)
    const chk = recipient === 'Customer' ? checkSend({ to: { name: o.customer, phone: channel === 'SMS' ? to : o.phone, email: channel === 'Email' ? to : o.email }, channel: channel.toLowerCase(), cls, at }) : { ok: true };
    const blocked = !chk.ok && (chk.code === 'suppressed' || chk.code === 'consent');
    rows.push({ id, once, order: o.id, event, label: ev.label, trigger: extra.trigger || ev.when, recipient, channel, to, text, subject: subject || '', at, retries: 0, cls, ...(blocked ? { status: 'Skipped', error: chk.reason } : outcome(channel, to, id + to)) });
  };
  const toCustomer = t.customer && !extra.noCustomer;
  if (toCustomer && t.sms) add('Customer', 'SMS', o.phone, fill(t.smsText, vars));
  if (toCustomer && t.email && o.email) add('Customer', 'Email', o.email, fill(t.body, vars), fill(t.subject, vars));   // most orders have a phone only
  if (t.merchant && t.sms) add('Shop', 'SMS', s.adminPhone, fill(t.merchantText || t.smsText, vars));
  if (t.merchant && t.email) add('Shop', 'Email', s.adminEmail, fill(t.merchantText || t.body, vars), fill(t.subject, vars));
  // WhatsApp to the customer, through the shared send layer (its rows go to the shared delivery log, ref = order id)
  let waSent = 0;
  if (toCustomer && t.whatsapp) {
    const cls = eventClass(event);
    const person = { name: o.customer, phone: o.phone, email: o.email };
    const fb = s.waFallback !== false && !t.sms;
    const smsInstead = () => { if (!fb) return; sendMessage({ source: 'Orders', event: ev.label + ' · SMS instead of WhatsApp', cls, channel: 'sms', to: person, text: fill(t.smsText, vars), once: `${once}|wa-sms`, ref: o.id, at }); waSent += 1; };
    const tpl = waTemplateState(t, Date.now());
    const block = !waConnected() ? 'WhatsApp isn\'t connected' : tpl.state !== 'Approved' ? `WhatsApp template ${tpl.state.toLowerCase()}` : '';
    if (block) {
      rows.push({ id: 'NT-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), once, order: o.id, event, label: ev.label, trigger: extra.trigger || ev.when, recipient: 'Customer', channel: 'WhatsApp', to: o.phone, text: fill(t.waBody, vars), at, retries: 0, cls, status: 'Skipped', error: block + (fb ? '. Sent by SMS instead' : '') });
      smsInstead();
    } else {
      const r = sendMessage({ source: 'Orders', event: ev.label, cls, channel: 'whatsapp', to: person, text: fill(t.waBody, vars) + (t.waButton && vars.tracking_url ? `\n\n[Track order] ${vars.tracking_url}` : ''), once: `${once}|wa`, ref: o.id, at });
      waSent += 1;
      const st = r.row ? r.row.status : '';
      if (st === 'Failed' || (st === 'Suppressed' && r.row.block !== 'capped')) smsInstead();
    }
  }
  // nothing turned on: the event is still marked, so a repeat stays a repeat
  write(LOG_KEY, [...(rows.length ? rows : [{ id: 'NT-' + Date.now().toString(36), once, order: o.id, event, label: ev.label, trigger: extra.trigger || ev.when, recipient: '', channel: '', to: '', text: '', at, retries: 0, status: 'Off', quiet: true }]), ...log].slice(0, 3000));
  return { sent: rows.length + waSent, duplicate: false };
}

/** Send a failed message again (the demo gateway takes it the second time). */
export function retryNotification(id) {
  const log = getLog();
  const row = log.find((r) => r.id === id);
  if (!row) {
    // a WhatsApp row (or its SMS instead) lives in the shared delivery log
    const m = retryMessage(id);
    try { window.dispatchEvent(new CustomEvent(NOTIFY_EVENT)); } catch { /* ignore */ }
    return m ? { ...m, status: m.status } : null;
  }
  const next = { ...row, retries: (row.retries || 0) + 1, lastTry: Date.now(), ...(row.channel === 'SMS' && /^01[3-9]\d{8}$/.test(digits(row.to)) ? { status: 'Delivered', error: '' } : {}) };
  write(LOG_KEY, log.map((r) => (r.id === id ? next : r)));
  return next;
}

// ---- the log ------------------------------------------------------------------------------------------------
// what the demo's own orders would have sent, from the times their events happened
const TIME_EVENTS = [['placed', 'new-order'], ['approved', 'approved'], ['shipped', 'in-transit'], ['delivered', 'delivered'], ['returned', 'returned'], ['cancelled', 'cancelled']];
function synthLog(o) {
  if (!o || o.made || !o.times || /^(POS|Wholesale)/.test(String(o.channel || '')) || o.isInvoice) return [];
  const s = getNotifySettings();
  const out = [];
  TIME_EVENTS.forEach(([k, event]) => {
    const at = o.times[k];
    if (!at) return;
    const t = s.events[event];
    const ev = eventBy(event);
    const vars = varsOf(o);
    const base = { order: o.id, event, label: ev.label, trigger: ev.when, at: at + 60 * 1000, retries: 0, demo: true };
    if (t.customer && t.sms) out.push({ ...base, id: `${o.id}-${event}-cs`, recipient: 'Customer', channel: 'SMS', to: o.phone, text: fill(t.smsText, vars), ...outcome('SMS', o.phone, o.id + event) });
    if (t.customer && t.email && o.email) out.push({ ...base, id: `${o.id}-${event}-ce`, recipient: 'Customer', channel: 'Email', to: o.email, text: fill(t.body, vars), subject: fill(t.subject, vars), ...outcome('Email', o.email, '') });
    if (t.merchant && t.sms) out.push({ ...base, id: `${o.id}-${event}-ms`, recipient: 'Shop', channel: 'SMS', to: s.adminPhone, text: fill(t.merchantText || t.smsText, vars), status: 'Delivered' });
    if (t.customer && t.whatsapp && o.phone) out.push({ ...base, id: `${o.id}-${event}-cw`, recipient: 'Customer', channel: 'WhatsApp', to: o.phone, text: fill(t.waBody, vars), status: hash(o.id + event) % 3 ? 'Read' : 'Delivered' });
  });
  return out;
}
const WORD = { whatsapp: 'WhatsApp', sms: 'SMS', email: 'Email' };
/** The order's WhatsApp messages (and SMS sent instead) from the shared delivery log, in this log's shape. */
function sharedRows(o) {
  return deliveryLog({ source: 'Orders', ref: o.id }).filter((r) => !r.fromNotify && !r.demo).map((r) => ({
    id: r.id, order: o.id, event: String(r.once || '').split('|')[1] || '', label: r.event, recipient: 'Customer', channel: WORD[r.channel] || r.channel,
    to: r.address, text: r.text, at: r.at, retries: r.retries || 0, cls: r.cls,
    status: r.status === 'Suppressed' ? 'Skipped' : r.status,
    error: r.status === 'Queued' ? `${r.reason || 'Quiet hours'}. Goes out when they end` : r.reason || '',
  }));
}
/** Every message for an order, newest first. */
export function notificationLog(o) {
  if (!o) return [];
  const mine = [...getLog().filter((r) => r.order === o.id && !r.quiet), ...sharedRows(o)];
  const done = new Set(mine.map((r) => r.event));
  return [...mine, ...synthLog(o).filter((r) => !done.has(r.event))].sort((a, b) => b.at - a.at);
}

// ---- sending beyond orders (review CX-F3) --------------------------------------------------------------------------
/**
 * Send an event beyond orders (CUSTOMER_EVENTS) to one person, as the matrix in Settings › Notifications turns it on:
 * SMS / WhatsApp / email to the customer, SMS / email to the shop. Everything goes through the shared send layer
 * (messaging.js › send: consent, suppression, caps and quiet hours), so the rows are in the one delivery log
 * (ref = the record, e.g. a ticket or invoice). `once` (default ref + event) sends a round once.
 *   to   { name, phone, email }      vars  the event's placeholders
 * Returns { sent, rows, off } — off: true when nothing is turned on for the event. Loyalty's own events
 * (owner 'loyalty') are sent by lib/loyalty.js and are refused here so a member never gets them twice.
 */
export function notifyCustomer(event, to = {}, vars = {}, { ref = '', once = '', at } = {}) {
  if (typeof window === 'undefined') return { sent: 0, rows: [], off: true };
  const ev = eventBy(event);
  if (!ev || ev.scope !== 'customer' || ev.owner) return { sent: 0, rows: [], off: true };
  const s = getNotifySettings();
  const t = s.events[event];
  const all = { store_name: MERCHANT.name, support_phone: MERCHANT.phone, customer_name: to.name || 'Customer', ...vars };
  const key = once || `${ref || to.phone || to.email || ''}|${event}`;
  const base = { source: ev.source, event: ev.label, cls: ev.cls, ref, at };
  const rows = [];
  const go = (args) => { const r = sendMessage({ ...base, ...args }); if (r.row && !r.duplicate) rows.push(r.row); };
  if (t.customer) {
    if (t.sms && to.phone) go({ channel: 'sms', to, text: fill(t.smsText, all), once: key + '|c-sms' });
    if (t.whatsapp && to.phone && waConnected() && waTemplateState(t).state === 'Approved') go({ channel: 'whatsapp', to, text: fill(t.waBody, all), once: key + '|c-wa' });
    if (t.email && to.email) go({ channel: 'email', to, text: fill(t.body, all), subject: fill(t.subject, all), once: key + '|c-email' });
  }
  if (t.merchant) {
    const shop = { name: s.senderName || MERCHANT.name, phone: s.adminPhone, email: s.adminEmail };
    if (t.sms) go({ channel: 'sms', to: shop, text: fill(t.merchantText || t.smsText, all), once: key + '|m-sms', internal: true });
    if (t.email) go({ channel: 'email', to: shop, text: fill(t.merchantText || t.body, all), subject: fill(t.subject, all), once: key + '|m-email', internal: true });
  }
  if (rows.length) { try { window.dispatchEvent(new CustomEvent(NOTIFY_EVENT)); } catch { /* ignore */ } }
  return { sent: rows.length, rows, off: !((t.customer && (t.sms || t.email || t.whatsapp)) || (t.merchant && (t.sms || t.email))) };
}
/** Words for a toast after notifyCustomer: "SMS sent to …", or why nothing went. */
export function notifyWords(res, who = 'the customer') {
  if (!res || res.off) return 'Message is off in Settings › Notifications';
  const mine = res.rows.filter((r) => !r.internal);
  if (!mine.length) return res.rows.length ? 'Shop alert sent' : 'Nothing sent: no number or email on file';
  const ok = mine.filter((r) => ['Delivered', 'Read', 'Sent', 'Queued'].includes(r.status));
  if (!ok.length) return 'Not sent to ' + who + ': ' + (mine[0].reason || mine[0].status);
  const chans = [...new Set(ok.map((r) => ({ sms: 'SMS', whatsapp: 'WhatsApp', email: 'Email' }[r.channel] || r.channel)))].join(' and ');
  return chans + (ok.some((r) => r.status === 'Queued') ? ' queued for ' : ' sent to ') + who;
}
