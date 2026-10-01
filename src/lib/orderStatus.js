// The one list of order statuses. The sidebar, the order tabs, status badges and the order
// stepper all read from here, so labels, order and counts cannot drift apart.
//
// The order's life (what the merchant sees):
//   New order: On hold (cash on delivery) · Processing (paid in full) · Pending (payment due or part paid)
//   → Verification (a manual or an automatic call; a step, not a status)
//   → Approved (or Cancelled; "Take advance + approve" collects part of a COD order first)
//   → Ready for courier (packed, shipping slip printed and attached)
//   → In transit (sent to the courier: the courier accepted the parcel)
//   → Delivered   (Returned when the courier brings it back)
// Courier scans (picked up, at the hub, out for delivery …) show in the order's tracking timeline only.

export const ORDER_STATUSES = [
  { key: 'onhold', label: 'On hold', bn: 'হোল্ডে', tone: 'warning', icon: 'pause', hint: 'COD · to verify', count: 82 },
  { key: 'processing', label: 'Processing', bn: 'প্রসেসিং', tone: 'info', icon: 'loader', hint: 'Paid · to verify', count: 27 },
  { key: 'pending', label: 'Pending', bn: 'Pending', tone: 'warning', icon: 'clock', hint: 'Payment due', count: 19 },
  { key: 'approved', label: 'Approved', bn: 'Approved', tone: 'info', icon: 'circle-check', hint: 'Preparing', count: 74 },
  { key: 'ready', label: 'Ready for courier', bn: 'কুরিয়ারের জন্য প্রস্তুত', tone: 'info', icon: 'package', hint: 'Packed', count: 61 },
  { key: 'shipped', label: 'In transit', bn: 'পথে আছে', tone: 'info', icon: 'truck', hint: 'With courier', count: 182 },
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
const OLD_LABELS = { 'Ready to ship': 'ready', Shipped: 'shipped', 'Sent to courier': 'shipped', 'On the way': 'shipped' };
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
export const STEP_LABEL = { new: 'New order', verified: 'Verification', approved: 'Approved', ready: 'Ready for courier', shipped: 'In transit', delivered: 'Delivered' };
