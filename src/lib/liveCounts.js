// liveCounts — the numbers the menu and the top bar show next to the Inbox pages, read from the inbox data
// (lib/inbox.js) instead of being written into the menu. Menu items name theirs with `live` (navigation.js).
//   chats     chats with unread messages that aren't closed
//   comments  public comments not answered yet
//   mentions  new story / post mentions of the shop and notes that @mention you
//   inbox     the area: chats + comments + mentions
//   meetings  today's meetings still to happen plus meetings waiting for a note (lib/meetings.js)
// They change with the `gc:inbox` event.

import { getConvs, unreadCount, getComments, getMentions, openMentions, teamMentions, ME } from './inbox';
import { getMeetings, needsNote, isToday } from './meetings';

export const LIVE_EVENT = 'gc:inbox';
export function liveCount(key) {
  if (typeof window === 'undefined') return null;
  try {
    if (key === 'chats') return unreadCount(getConvs());
    if (key === 'comments') return getComments().filter((c) => c.status === 'open').length;
    if (key === 'mentions') return openMentions(getMentions()) + teamMentions(ME).length;
    if (key === 'meetings') { const now = Date.now(); return getMeetings().filter((m) => needsNote(m, now) || (m.status === 'scheduled' && isToday(m, now) && m.at >= now)).length; }
    if (key === 'inbox') return liveCount('chats') + liveCount('comments') + liveCount('mentions');
  } catch { /* storage blocked */ }
  return null;
}
