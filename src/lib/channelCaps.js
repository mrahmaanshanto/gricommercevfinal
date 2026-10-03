// channelCaps — what each messaging channel can do, in one table (Nayeem's brief #11, "channel adapters").
// The Inbox, Campaigns, Notifications and Automations read this instead of hard-coding a sentence per channel:
// whether a template is needed, how long the reply window is, media, buttons, which delivery signals the provider sends
// back (delivered / read / clicked; a signal a channel doesn't send is never shown), the address it needs, and its cost.
//
//   CAPS[id]                          the row for one channel
//   capsOf(id)                        the row, or a plain one for an unknown channel
//   replyState(id, lastCustomerAt, { now, connected })
//        → { state: 'open' | 'template' | 'closed' | 'disconnected', label, until }
//          open: a free reply is allowed (until the window closes) · template: only an approved template ·
//          closed: the channel allows no reply now · disconnected: the channel isn't connected
//   windowText(id)                    one plain sentence about the reply window (the Inbox shows it)
//   SEND_CHANNELS                     channels a business message can go out on (campaigns, notifications)
// Front end only: a real adapter would read these from the provider; the demo table matches the providers' rules.

const H = 3600 * 1000;
// templates: 'never' (free text always) · 'outside-window' (template after the window) · 'always'
// afterWindow: what happens when the window has passed: 'template' (approved template only) or 'closed'
export const CAPS = {
  sms: { name: 'SMS', service: 'sms', identity: 'phone', templates: 'never', window: null, media: false, buttons: false, delivered: true, read: false, clicked: true, maxChars: 1000, marketing: true },
  whatsapp: { text: 'Free replies for 24 hours; after that only approved templates', name: 'WhatsApp', service: 'whatsapp', identity: 'phone', templates: 'outside-window', window: 24, afterWindow: 'template', media: true, buttons: true, delivered: true, read: true, clicked: true, maxChars: 4096, marketing: true },
  email: { name: 'Email', service: 'email', identity: 'email', templates: 'never', window: null, media: true, buttons: true, delivered: true, read: true, clicked: true, maxChars: 0, marketing: true, readWord: 'Opened' },
  facebook: { text: 'Messenger allows replies for 24 hours after their last message', name: 'Messenger', service: 'whatsapp', identity: 'page', templates: 'outside-window', window: 24, afterWindow: 'template', media: true, buttons: true, delivered: true, read: true, clicked: false, maxChars: 2000, marketing: false },
  instagram: { text: 'Instagram allows replies for 7 days after their last message', name: 'Instagram', service: 'whatsapp', identity: 'page', templates: 'never', window: 7 * 24, afterWindow: 'closed', media: true, buttons: false, delivered: true, read: true, clicked: false, maxChars: 1000, marketing: false },
  tiktok: { text: 'TikTok allows replies for 48 hours after their last message', name: 'TikTok', service: 'whatsapp', identity: 'page', templates: 'never', window: 48, afterWindow: 'closed', media: true, buttons: false, delivered: true, read: false, clicked: false, maxChars: 1000, marketing: false },
  telegram: { text: 'Telegram messages have no reply window', name: 'Telegram', service: 'whatsapp', identity: 'page', templates: 'never', window: null, media: true, buttons: true, delivered: true, read: true, clicked: false, maxChars: 4096, marketing: false },
  linkedin: { text: 'LinkedIn messages have no reply window', name: 'LinkedIn', service: 'email', identity: 'page', templates: 'never', window: null, media: true, buttons: false, delivered: true, read: false, clicked: false, maxChars: 8000, marketing: false },
  x: { text: 'X allows replies to direct messages at any time', name: 'X', service: 'whatsapp', identity: 'page', templates: 'never', window: null, media: true, buttons: false, delivered: true, read: false, clicked: false, maxChars: 10000, marketing: false },
  voice: { name: 'Call', service: 'voice', identity: 'phone', templates: 'never', window: null, media: false, buttons: false, delivered: true, read: false, clicked: false, maxChars: 0, marketing: false },
};
export const SEND_CHANNELS = ['whatsapp', 'sms', 'email'];
const ALIAS = { messenger: 'facebook', fb: 'facebook', mail: 'email', wa: 'whatsapp', call: 'voice' };
export const capsOf = (id) => { const k = String(id || '').toLowerCase(); return CAPS[ALIAS[k] || k] || { name: id || 'Channel', identity: 'page', templates: 'never', window: null, media: false, buttons: false, delivered: true, read: false, clicked: false, maxChars: 0, marketing: false }; };
export const channelLabel = (id) => capsOf(id).name;

const hoursText = (h) => (h % 24 === 0 ? `${h / 24} ${h / 24 === 1 ? 'day' : 'days'}` : `${h} hours`);
/** One plain sentence about replying on this channel. */
export function windowText(id) {
  const c = capsOf(id);
  if (c.text) return c.text;   // the sentence the Inbox always showed (kept word for word: it is translated)
  if (!c.window) return `${c.name} messages have no reply window`;
  if (c.afterWindow === 'template') return `Free replies for ${hoursText(c.window)}; after that only approved templates`;
  return `${c.name} allows replies for ${hoursText(c.window)} after their last message`;
}

/** Can an agent reply on this channel now? */
export function replyState(id, lastCustomerAt, { now = Date.now(), connected = true } = {}) {
  const c = capsOf(id);
  if (!connected) return { state: 'disconnected', label: 'Channel disconnected', until: null };
  if (!c.window || !lastCustomerAt) return { state: 'open', label: 'Reply available', until: null };
  const until = lastCustomerAt + c.window * H;
  if (now <= until) return { state: 'open', label: 'Reply available', until };
  if (c.afterWindow === 'template') return { state: 'template', label: 'Template required', until };
  return { state: 'closed', label: 'Window closed', until };
}
export const REPLY_TONE = { open: 'success', template: 'warning', closed: 'error', disconnected: 'neutral' };
