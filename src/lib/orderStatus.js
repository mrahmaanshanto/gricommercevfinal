// The one list of order statuses. The sidebar, the order tabs, status badges and the order
// stepper all read from here, so labels, order and counts cannot drift apart.
//
// The order's life (what the merchant sees):
//   New order: On hold (cash on delivery) · Processing (paid in full) · Pending (payment due or part paid)
//   → Verification (a manual or an automatic call; a step, not a status)
//   → Approved (or Cancelled; "Take advance + approve" collects part of a COD order first)
//   → Ready for courier (packed, shipping slip printed and attached)
//   → Sent to courier (the courier accepted the parcel; it was called "In transit" before)
//   → Delivered   (Returned when the courier brings it back)
// Courier scans (picked up, at the hub, out for delivery …) show in the order's tracking timeline only.

export const ORDER_STATUSES = [
  { key: 'onhold', label: 'On hold', bn: 'হোল্ডে', tone: 'warning', icon: 'pause', hint: 'COD · to verify', count: 82 },
  { key: 'processing', label: 'Processing', bn: 'প্রসেসিং', tone: 'info', icon: 'loader', hint: 'Paid · to verify', count: 27 },
  { key: 'pending', label: 'Pending', bn: 'Pending', tone: 'warning', icon: 'clock', hint: 'Payment due', count: 19 },
  { key: 'approved', label: 'Approved', bn: 'Approved', tone: 'info', icon: 'circle-check', hint: 'Preparing', count: 74 },
  { key: 'ready', label: 'Ready for courier', bn: 'কুরিয়ারের জন্য প্রস্তুত', tone: 'info', icon: 'package', hint: 'Packed', count: 61 },
  { key: 'shipped', label: 'Sent to courier', bn: 'Courier-এ পাঠানো', tone: 'info', icon: 'truck', hint: 'With courier', count: 182 },
  { key: 'delivered', label: 'Delivered', bn: 'Delivered', tone: 'success', icon: 'package-check', hint: 'Done', count: 208 },
  { key: 'cancelled', label: 'Cancelled', bn: 'Cancelled', tone: 'neutral', icon: 'circle-x', hint: 'Stopped', count: 33 },
  { key: 'returned', label: 'Returned', bn: 'Returned', tone: 'error', icon: 'undo-2', hint: 'Came back', count: 10 },
];

export const ORDER_TOTAL = ORDER_STATUSES.reduce((sum, s) => sum + s.count, 0); // 696

export const orderStatus = (key) => ORDER_STATUSES.find((s) => s.key === key) || null;

/** The three statuses a new order starts in (by how it is paid); all wait for verification and approval. */
export const NEW_KEYS = ['onhold', 'processing', 'pending'];
export const isNewOrder = (key) => NEW_KEYS.includes(key);

/** The status a new order starts in: COD → On hold, paid in full → Processing, due or part paid → Pending. */
export function initialStatusKey(payment) {
  const p = String(payment || '').toLowerCase();
  if (p === 'paid' || p === 'full') return 'processing';
  if (p === 'cod') return 'onhold';
  return 'pending';
}

// labels orders were saved with before (and in demo data) → today's key
const OLD_LABELS = { 'Ready to ship': 'ready', Shipped: 'shipped', 'In transit': 'shipped', 'On the way': 'shipped' };
/**
 * The status key of an order from its saved label and payment. 'New' (and the old 'Pending', which meant
 * "waiting for confirmation") become On hold, Processing or Pending by how the order is paid.
 */
export function statusKeyOf(label, payment) {
  if (!label || label === 'New' || label === 'Pending' || label === 'On hold' || label === 'Processing') {
    return label === 'On hold' ? 'onhold' : label === 'Processing' ? 'processing' : initialStatusKey(payment);
  }
  const s = ORDER_STATUSES.find((x) => x.label === label);
  return s ? s.key : OLD_LABELS[label] || String(label).toLowerCase();
}

/** The steps the order stepper shows, in order. 'new' is On hold / Processing / Pending. */
export const ORDER_STEPS = ['new', 'verified', 'approved', 'ready', 'shipped', 'delivered'];
export const STEP_LABEL = { new: 'New order', verified: 'Verification', approved: 'Approved', ready: 'Ready for courier', shipped: 'Sent to courier', delivered: 'Delivered' };

/** The Orders tabs: the shop's standard statuses. A tab lists one or more saved statuses, so the stepper, badges and
 *  automation keep their detail while the tab row stays short. Digital orders never reach Sent to courier. */
export const ORDER_TABS = [
  { key: 'onhold', label: 'On hold', keys: ['onhold', 'pending'] },
  { key: 'processing', label: 'Processing', keys: ['processing', 'approved', 'ready'] },
  { key: 'shipped', label: 'Sent to courier', keys: ['shipped'] },
  { key: 'delivered', label: 'Delivered', keys: ['delivered'] },
  { key: 'returned', label: 'Returned', keys: ['returned'] },
  { key: 'cancelled', label: 'Cancelled', keys: ['cancelled'] },
];
/** The saved statuses a tab (or a single status, e.g. ?status=ready from Home) shows. */
export const tabKeys = (tab) => (ORDER_TABS.find((t) => t.key === tab) || { keys: [tab] }).keys;
