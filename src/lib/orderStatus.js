// The one list of order statuses. The sidebar, the order tabs, status badges and the order
// stepper all read from here, so labels, order and counts cannot drift apart.

export const ORDER_STATUSES = [
  { key: 'pending', label: 'Pending', bn: 'অপেক্ষমাণ', tone: 'warning', icon: 'clock', count: 128 },
  { key: 'approved', label: 'Approved', bn: 'অনুমোদিত', tone: 'info', icon: 'circle-check', count: 74 },
  { key: 'ready', label: 'Ready to ship', bn: 'পাঠানোর জন্য প্রস্তুত', tone: 'info', icon: 'package', count: 61 },
  { key: 'shipped', label: 'Shipped', bn: 'পাঠানো হয়েছে', tone: 'info', icon: 'truck', count: 182 },
  { key: 'delivered', label: 'Delivered', bn: 'ডেলিভারি হয়েছে', tone: 'success', icon: 'package-check', count: 208 },
  { key: 'cancelled', label: 'Cancelled', bn: 'বাতিল', tone: 'neutral', icon: 'circle-x', count: 33 },
  { key: 'returned', label: 'Returned', bn: 'ফেরত', tone: 'error', icon: 'undo-2', count: 10 },
];

export const ORDER_TOTAL = ORDER_STATUSES.reduce((sum, s) => sum + s.count, 0); // 696

export const orderStatus = (key) => ORDER_STATUSES.find((s) => s.key === key) || null;

/** The steps a delivered order walks through, in order (for the order stepper). */
export const ORDER_STEPS = ['pending', 'approved', 'ready', 'shipped', 'delivered'];
