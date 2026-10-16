// smsDesign — ready-made SMS wordings for Communications › Message design › SMS design (Batch C step 4). The SMS
// texts themselves stay where they were (Settings › Notifications, lib/notifications.js › getNotifySettings().events[key]
// .smsText / .merchantText, and the sender name); this file only offers starting points for one event:
//   'short'    the built-in text (notifications.js › defaultTemplate)
//   'friendly' the same news with the customer's name first and the shop's name last
//   'bangla'   a Bangla text, for the order events that have one (70 letters a part instead of 160)
// smsTemplates(key) → [{ id, label, text }]  (only the styles the event has)

import { defaultTemplate } from './notifications';

// Bangla texts for the order events shoppers see most; the {{placeholders}} are the same as in English
export const BN_SMS = {
  'new-order': '{{store_name}}: আপনার অর্ডার {{order_id}} পেয়েছি। মোট {{order_total}}।',
  'on-hold': '{{store_name}}: অর্ডার {{order_id}} নিশ্চিত করতে আমরা আপনাকে কল করব।',
  'payment-pending': '{{store_name}}: অর্ডার {{order_id}}-এর জন্য {{remaining_amount}} পরিশোধ করুন: {{payment_link}}',
  processing: '{{store_name}}: অর্ডার {{order_id}}-এর পেমেন্ট পেয়েছি। ধন্যবাদ!',
  approved: '{{store_name}}: আপনার অর্ডার {{order_id}} কনফার্ম হয়েছে।',
  'advance-requested': '{{store_name}}: অর্ডার {{order_id}} কনফার্ম করতে {{advance_amount}} অগ্রিম দিন: {{payment_link}}',
  'advance-received': '{{store_name}}: অগ্রিম {{advance_amount}} পেয়েছি। ডেলিভারিতে বাকি {{remaining_amount}}।',
  cancelled: '{{store_name}}: অর্ডার {{order_id}} বাতিল হয়েছে। {{cancel_reason}}',
  'in-transit': '{{store_name}}: অর্ডার {{order_id}} {{courier_name}}-এ পাঠানো হয়েছে। ট্র্যাক করুন: {{tracking_url}}',
  'out-for-delivery': '{{store_name}}: অর্ডার {{order_id}} আজ ডেলিভারি হবে। {{cod_amount}} প্রস্তুত রাখুন।',
  delivered: '{{store_name}}: অর্ডার {{order_id}} ডেলিভারি হয়েছে। আমাদের সাথে কেনাকাটার জন্য ধন্যবাদ!',
  'delivery-failed': '{{store_name}}: অর্ডার {{order_id}} ডেলিভারি করা যায়নি। আমরা আপনাকে কল করব।',
  returned: '{{store_name}}: অর্ডার {{order_id}} ফেরত এসেছে।',
};

/** The same news, warmer: "Hi {{customer_name}}, …  – {{store_name}}". */
export function friendlyOf(text) {
  const body = String(text || '').replace(/^\s*\{\{\s*store_name\s*\}\}\s*:\s*/, '').trim();
  if (!body) return '';
  const lower = body.charAt(0).toLowerCase() + body.slice(1);
  return `Hi {{customer_name}}, ${/^(order|your|we|pay|thanks)\b/i.test(body) ? lower : body} – {{store_name}}`;
}

export function smsTemplates(key) {
  const d = defaultTemplate(key);
  if (!d) return [];
  const out = [{ id: 'short', label: 'Short', text: d.smsText || '' }];
  const f = friendlyOf(d.smsText);
  if (f) out.push({ id: 'friendly', label: 'Friendly', text: f });
  if (BN_SMS[key]) out.push({ id: 'bangla', label: 'Bangla', text: BN_SMS[key] });
  return out;
}
