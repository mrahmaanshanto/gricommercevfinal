// liveCounts — the numbers the menu and the top bar show next to the Inbox pages, read from the inbox data
// (lib/inbox.js) instead of being written into the menu. Menu items name theirs with `live` (navigation.js).
//   chats     chats with unread messages that aren't closed
//   comments  public comments not answered yet
//   mentions  new story / post mentions of the shop and notes that @mention you
//   email     unread email in the Inbox folder (lib/emailInbox.js)
//   inbox     the area: chats + comments + mentions + email
//   meetings  today's meetings still to happen plus meetings waiting for a note (lib/meetings.js)
//   tickets   support tickets waiting on the shop: open and not waiting on the customer (lib/supportTickets.js)
//   aicalls   orders whose automatic confirmation call needs a person: no answer or wrong number, not yet decided
//   coupons   coupon codes running now (lib/promotions.js, the Coupons page's Running tab)
//   carts     abandoned carts and checkouts still open (lib/recovery.js, the Abandoned carts page's open ones)
//   warranty-claims  warranty claims not handed back or rejected yet (lib/customerWarranty.js)
// They change with the `gc:inbox` event; the tickets, recovery, promotions and order-message events are passed on as it
// (LIVE_SOURCES below), so the menu re-reads when those books change.

import { getConvs, unreadCount, getComments, getMentions, openMentions, teamMentions, ME } from './inbox';
import { getMeetings, needsNote, isToday } from './meetings';
import { unreadEmail } from './emailInbox';
import { getTickets, isOpen as ticketOpen, TICKETS_EVENT } from './supportTickets';
import { listOffers, PROMO_EVENT } from './promotions';
import { getOpportunities, OPEN_STATES, RECOVERY_EVENT } from './recovery';
import { getOrders } from './orders';
import { NOTIFY_EVENT } from './notifications';
import { verifyOf } from './orderFlow';
import { isNewOrder, statusKeyOf } from './orderStatus';
import { openClaims, CLAIMS_EVENT } from './customerWarranty';

export const LIVE_EVENT = 'gc:inbox';
export function liveCount(key) {
  if (typeof window === 'undefined') return null;
  try {
    if (key === 'chats') return unreadCount(getConvs());
    if (key === 'comments') return getComments().filter((c) => c.status === 'open').length;
    if (key === 'mentions') return openMentions(getMentions()) + teamMentions(ME).length;
    if (key === 'email') return unreadEmail();
    if (key === 'meetings') { const now = Date.now(); return getMeetings().filter((m) => needsNote(m, now) || (m.status === 'scheduled' && isToday(m, now) && m.at >= now)).length; }
    if (key === 'inbox') return liveCount('chats') + liveCount('comments') + liveCount('mentions') + liveCount('email');
    if (key === 'tickets') return getTickets().filter((t) => ticketOpen(t) && t.status !== 'Waiting on customer').length;
    if (key === 'coupons') return listOffers('coupons').filter((o) => o.life === 'Active').length;
    if (key === 'carts') return getOpportunities().filter((o) => o.type !== 'payment' && OPEN_STATES.includes(o.state)).length;
    if (key === 'warranty-claims') return openClaims().length;
    if (key === 'aicalls') return getOrders().filter((o) => { const v = o.verify ? verifyOf(o) : null; return v && v.method === 'auto' && (v.state === 'no-answer' || v.state === 'wrong-number') && isNewOrder(statusKeyOf(o.status, o.payment)); }).length;
  } catch { /* storage blocked */ }
  return null;
}

// the books behind the counts above announce their changes with their own events: pass them on as gc:inbox
const LIVE_SOURCES = [TICKETS_EVENT, PROMO_EVENT, RECOVERY_EVENT, NOTIFY_EVENT, CLAIMS_EVENT];   // NOTIFY_EVENT: an order's call or step was sent
if (typeof window !== 'undefined' && !window.__gcLiveSources) {
  window.__gcLiveSources = true;
  // passed on a moment later (once for a burst): a book may save its first copy while a page renders, and listeners
  // that set React state must not run inside another component's render
  let queued = false;
  const relay = () => { if (queued) return; queued = true; window.setTimeout(() => { queued = false; window.dispatchEvent(new CustomEvent(LIVE_EVENT)); }, 0); };
  LIVE_SOURCES.forEach((e) => window.addEventListener(e, relay));
}
