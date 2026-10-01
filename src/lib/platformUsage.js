// platformUsage — how much of each paid service the shop used in a period, counted from what really happened:
// order SMS and emails delivered (notifications.js log), automatic verification calls (orderFlow.js); WhatsApp,
// GridAI voice and extra call time at the demo month's daily rate. closeMonths() freezes every closed month so its
// expense rows (platformCosts.js) never change; Wallet & credits shows the month so far.

import { getOrders, isCounterSale } from './orders';
import { notificationLog } from './notifications';
import { verifyOf } from './orderFlow';
import { SEPT_USAGE, closedMonths, usageOfMonth, snapshotMonth, costOf } from './platformCosts';
import { clockNow } from './settlements';
import { CREDITS_ACCOUNT } from './platformCosts';
import { balanceOf } from './ledger';

const DAY = 864e5;
let memo = { sig: '', out: null };

/** Usage in [from, to): { 'ai-call', 'ai-extra', sms, whatsapp, email, voice }. */
export function usageBetween(from, to) {
  const end = Math.min(to, clockNow());
  const sig = `${from}|${Math.floor(end / (10 * 60 * 1000))}`;
  if (memo.sig === sig) return memo.out;
  let sms = 0, email = 0, calls = 0;
  (getOrders() || []).filter((o) => !isCounterSale(o) && !o.isInvoice && o.at < end).forEach((o) => {
    notificationLog(o).forEach((r) => {
      if (r.at < from || r.at >= end || r.status !== 'Delivered') return;
      if (r.channel === 'SMS') sms += 1; else if (r.channel === 'Email') email += 1;
    });
    const v = verifyOf(o);
    if (v && v.method === 'auto' && v.at >= from && v.at < end) calls += 1;
  });
  const days = Math.max(0, (end - from) / DAY);
  const rate = (k) => Math.round((SEPT_USAGE[k] / 30) * days);
  const out = { 'ai-call': calls, 'ai-extra': Math.round(calls * 0.3), sms, whatsapp: rate('whatsapp'), email, voice: rate('voice') };
  memo = { sig, out };
  return out;
}

const monthStart = (t) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), 1).getTime(); };
/** This month so far. */
export const usageThisMonth = (now = clockNow()) => usageBetween(monthStart(now), now + 1);

/** Freeze every closed month after September that has no bill yet. */
export function closeMonths(now = clockNow()) {
  closedMonths(now).forEach(({ key, y, m }) => {
    if (usageOfMonth(key)) return;
    snapshotMonth(key, usageBetween(new Date(y, m, 1).getTime(), new Date(y, m + 1, 1).getTime()));
  });
}

/** What is left on the credits balance now: the ledger balance less this month's usage so far. */
export function creditsLeft(now = clockNow()) {
  closeMonths(now);
  return Math.round((balanceOf(CREDITS_ACCOUNT) - costOf(usageThisMonth(now))) * 100) / 100;
}
