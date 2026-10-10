// Grid AI in the Inbox — who is handling a conversation and what needs attention.
//   autopilotOn(conv)        GridAI answers this chat by itself: the chat's own switch, else Auto for its channel / the shop
//   VIEWS                    the list's "Show" filter: all · unread · AI handling · people handling · follow-up · high priority
//   inView(conv, view, now)  · isHighPriority(conv, now) · needsFollowUp(conv, now)
// Takeover rule: when a person sends a reply, Autopilot stops for that chat (conv.autopilot = false) and only a person
// can turn it back on; Copilot keeps drafting. Front end only.

import { controlFor, getAiSettings } from '../aiReply';
import { waitingMinutes } from '../inbox';

export function autopilotOn(conv) {
  if (!conv) return false;
  if (conv.autopilot === true) return true;
  if (conv.autopilot === false) return false;
  return controlFor({ conv }, getAiSettings()).mode === 'auto';
}
/** VIP or complaint tags, an unhappy word in the last message, or waiting over an hour. */
export function isHighPriority(conv, now = Date.now()) {
  if (!conv) return false;
  if (conv.priority === 'high') return true;
  if ((conv.tags || []).some((t) => /vip|complaint|urgent|refund/i.test(t))) return true;
  const last = [...(conv.messages || [])].reverse().find((m) => m.from === 'customer' && m.text);
  if (last && /(worst|fraud|refund|vanga|broken|angry|kharap|প্রতারণা|খারাপ)/i.test(last.text)) return true;
  return waitingMinutes(conv, now) >= 60;
}
/** A follow-up set on the chat, or the customer asked about a product and went quiet for a day. */
export function needsFollowUp(conv, now = Date.now()) {
  if (!conv) return false;
  if (conv.followUpAt) return conv.followUpAt <= now + 864e5;
  const msgs = conv.messages || [];
  const lastIn = [...msgs].reverse().find((m) => m.from === 'customer');
  const lastOut = [...msgs].reverse().find((m) => m.from === 'agent');
  if (!lastIn || !lastOut || lastOut.at < lastIn.at) return false;
  return now - lastOut.at > 864e5 && /(price|dam|koto|stock|ache|available|দাম|কত)/i.test(lastIn.text || '');
}
export const VIEWS = [['all', 'All'], ['unread', 'Unread'], ['ai', 'GridAI handling'], ['human', 'People handling'], ['followup', 'Follow-up needed'], ['priority', 'High priority']];
export function inView(conv, view, now = Date.now()) {
  if (view === 'unread') return !!conv.unread;
  if (view === 'ai') return autopilotOn(conv);
  if (view === 'human') return !autopilotOn(conv);
  if (view === 'followup') return needsFollowUp(conv, now);
  if (view === 'priority') return isHighPriority(conv, now);
  return true;
}
