// connections — every outside app and service the shop connects, in one list, with one state. The Connections page
// (/connections) shows them all; every "Connect" button anywhere in the app opens that page or its connect flow
// (/connect?app=). Front end only: sign-ins and keys are simulated in this browser.
//
//   GROUPS                 what a connection is for: Sell online · Inbox & social · Ads & tracking · Payments · Delivery ·
//                          SMS & email · Devices & tools
//   APPS / appBy(id)       every app: group, brand (components/BrandLogo), kind and where it is managed
//       kind 'channel'     product sync and Google Business — the connection lives in lib/channels.js
//       kind 'oauth'       sign in with Meta, Google, TikTok, LinkedIn, X, Pinterest… (social, inbox, ads)
//       kind 'keys'        an address and keys or a provider (SMS, email, Telegram bot)
//       kind 'gateway'     payment gateways and couriers — components/GatewaySetup.jsx and lib/settlements.js
//       kind 'page'        set up on its own page (attendance machines, AI, storage, backups, tracking guides)
//   statusOf(id)           { state: 'connected' | 'attention' | 'off', account, note } from whichever lib owns it
//   connectApp / disconnectApp / reconnectApp
//   inboxApps()            the apps that bring messages, comments or reviews into the Inbox, with their state
// Edition: an app shows only when its module is in the edition (lib/edition.js › hasModule).

import { hasModule } from './edition';
import { getChannels, connect as connectChannel, disconnect as disconnectChannel, gbpLocations, nowMs } from './channels';
import { getAllPartners, getConfig, saveConfig } from './settlements';
import { loadSnapshot } from './hr';

export const CONNECTIONS_EVENT = 'gc:connections';
const KEY = 'gc.connections';
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export const GROUPS = [
  { id: 'sell', label: 'Sell online', sub: 'Send your products, prices and stock to other stores, and bring their orders here.', icon: 'store' },
  { id: 'social', label: 'Inbox & social', sub: 'Messages, comments and reviews come into the Inbox; posts go out from Social posts.', icon: 'messages-square' },
  { id: 'ads', label: 'Ads & tracking', sub: 'Ad accounts and website tracking, for ad spend and sales from ads.', icon: 'radar' },
  { id: 'payments', label: 'Payments', sub: 'Gateways and the card machine. Each one gets its own account in Money.', icon: 'credit-card' },
  { id: 'delivery', label: 'Delivery', sub: 'Couriers that pick up, deliver and collect cash for you.', icon: 'truck' },
  { id: 'messages', label: 'SMS & email', sub: 'Order updates, codes and alerts to customers and staff.', icon: 'mail' },
  { id: 'meetings', label: 'Meetings', sub: 'Video calls with customers and leads. The meeting link is made and sent for you.', icon: 'video' },
  { id: 'tools', label: 'Devices & tools', sub: 'Attendance machines, the AI assistant, file storage and backups.', icon: 'cpu' },
];
export const groupBy = (id) => GROUPS.find((g) => g.id === id) || null;

/**
 * uses: what the app brings or sends. signin: the company whose sign-in window opens (oauth).
 * pick: what to choose after signing in. fields: what a 'keys' app asks for. page: where it is managed.
 */
export const APPS = [
  // ---- sell online (product sync) ----
  { id: 'meta-catalog', group: 'sell', name: 'Meta catalog', sub: 'Facebook & Instagram shop', brand: 'meta', kind: 'channel', ch: 'meta', module: 'channels', page: '/meta-commerce', uses: ['Products', 'Stock', 'Prices'] },
  { id: 'gmc', group: 'sell', name: 'Google Merchant Center', sub: 'Google Shopping', brand: 'google', kind: 'channel', ch: 'gmc', module: 'channels', page: '/google-merchant', uses: ['Products', 'Stock', 'Prices'] },
  { id: 'woocommerce', group: 'sell', name: 'WooCommerce', sub: 'Your WordPress store', brand: 'woocommerce', kind: 'channel', ch: 'woo', module: 'channels', page: '/woocommerce', uses: ['Products', 'Stock', 'Orders'] },
  { id: 'shopify', group: 'sell', name: 'Shopify', sub: 'Your Shopify store', brand: 'shopify', kind: 'channel', ch: 'shopify', module: 'channels', page: '/shopify', uses: ['Products', 'Stock', 'Orders'] },
  // ---- inbox & social ----
  { id: 'facebook', group: 'social', name: 'Facebook Page', sub: 'Messenger, comments and posts', brand: 'facebook', kind: 'oauth', signin: 'Facebook', company: 'Meta', module: 'comms', inbox: 'facebook', uses: ['Messages', 'Comments', 'Posts'],
    pick: { label: 'Facebook Page', items: [['Dazzle Shop', 'Page · 48K followers'], ['Dazzle Shop Wholesale', 'Page · 2.1K followers']] } },
  { id: 'instagram', group: 'social', name: 'Instagram', sub: 'Direct messages, comments and posts', brand: 'instagram', kind: 'oauth', signin: 'Facebook', company: 'Meta', module: 'comms', inbox: 'instagram', uses: ['Messages', 'Comments', 'Posts'],
    pick: { label: 'Instagram business account', items: [['@dazzleshop.bd', 'Business account · 31K followers']] } },
  { id: 'whatsapp', group: 'social', name: 'WhatsApp Business', sub: 'Chats and broadcasts', brand: 'whatsapp', kind: 'oauth', signin: 'Facebook', company: 'Meta', module: 'comms', inbox: 'whatsapp', uses: ['Messages', 'Broadcasts'],
    pick: { label: 'WhatsApp number', items: [['+880 1711-000123', 'Dazzle Shop · verified business'], ['+880 1819-000004', 'Order desk']] } },
  { id: 'tiktok', group: 'social', name: 'TikTok', sub: 'Messages, comments and videos', brand: 'tiktok', kind: 'oauth', signin: 'TikTok', company: 'TikTok', module: 'comms', inbox: 'tiktok', uses: ['Messages', 'Comments', 'Posts'],
    pick: { label: 'TikTok account', items: [['@dazzleshop.bd', 'Business account · 64K followers']] } },
  { id: 'youtube', group: 'social', name: 'YouTube', sub: 'Comments and videos', brand: 'youtube', kind: 'oauth', signin: 'Google', company: 'Google', module: 'comms', inbox: 'youtube', uses: ['Comments', 'Posts'],
    pick: { label: 'YouTube channel', items: [['Dazzle Shop', 'Channel · 12K subscribers']] } },
  { id: 'gbp', group: 'social', name: 'Google Business Profile', sub: 'Reviews, hours, photos and posts', brand: 'google-business', kind: 'channel', ch: 'gbp', module: 'marketing', page: '/google-business', inbox: 'gbp', uses: ['Reviews', 'Posts'] },
  { id: 'linkedin', group: 'social', name: 'LinkedIn', sub: 'Page messages, comments and posts', brand: 'linkedin', kind: 'oauth', signin: 'LinkedIn', company: 'LinkedIn', module: 'comms', inbox: 'linkedin', uses: ['Messages', 'Comments', 'Posts'],
    pick: { label: 'LinkedIn page', items: [['Dazzle Shop Bangladesh', 'Company page · 3.4K followers']] } },
  { id: 'x', group: 'social', name: 'X (Twitter)', sub: 'Direct messages, replies and posts', brand: 'x', kind: 'oauth', signin: 'X', company: 'X', module: 'comms', inbox: 'x', uses: ['Messages', 'Comments', 'Posts'],
    pick: { label: 'X account', items: [['@dazzleshopbd', 'Account · 5.2K followers']] } },
  { id: 'pinterest', group: 'social', name: 'Pinterest', sub: 'Comments and pins', brand: 'pinterest', kind: 'oauth', signin: 'Pinterest', company: 'Pinterest', module: 'comms', inbox: 'pinterest', uses: ['Comments', 'Posts'],
    pick: { label: 'Pinterest business account', items: [['Dazzle Shop', 'Business account · 1.8K followers']] } },
  { id: 'threads', group: 'social', name: 'Threads', sub: 'Replies and posts', brand: 'threads', kind: 'oauth', signin: 'Instagram', company: 'Meta', module: 'comms', inbox: 'threads', uses: ['Comments', 'Posts'],
    pick: { label: 'Threads profile', items: [['@dazzleshop.bd', 'Linked to your Instagram']] } },
  { id: 'telegram', group: 'social', name: 'Telegram', sub: 'Chats with your bot', brand: 'telegram', kind: 'keys', module: 'comms', inbox: 'telegram', uses: ['Messages'],
    fields: [['bot_token', 'Bot token', true, 'From @BotFather in Telegram']] },
  // ---- ads & tracking ----
  { id: 'meta-ads', group: 'ads', name: 'Meta ads & Pixel', sub: 'Ad spend and sales from Facebook and Instagram ads', brand: 'meta', kind: 'oauth', signin: 'Facebook', company: 'Meta', module: 'online', page: '/pixels-events', uses: ['Ad spend', 'Sales from ads'],
    pick: { label: 'Ad account', multi: true, items: [['Dazzle Shop — Main', 'Ad account · BDT'], ['Dazzle Shop — Retargeting', 'Ad account · BDT']] } },
  { id: 'google-ads', group: 'ads', name: 'Google Ads', sub: 'Ad spend and conversions', brand: 'google', kind: 'oauth', signin: 'Google', company: 'Google', module: 'online', page: '/setup-google-ads', uses: ['Ad spend', 'Sales from ads'],
    pick: { label: 'Google Ads account', items: [['Dazzle Shop', '512-889-1043 · BDT']] } },
  { id: 'ga4', group: 'ads', name: 'Google Analytics 4', sub: 'Website visitors and where they come from', brand: 'google', kind: 'oauth', signin: 'Google', company: 'Google', module: 'online', page: '/setup-ga4', uses: ['Visitors'],
    pick: { label: 'GA4 property', items: [['dazzleshop.com.bd', 'Property G-8XK21PZ4QM']] } },
  { id: 'gtm', group: 'ads', name: 'Google Tag Manager', sub: 'Tags on your website', brand: 'google', kind: 'oauth', signin: 'Google', company: 'Google', module: 'online', page: '/setup-gtm', uses: ['Tags'],
    pick: { label: 'Container', items: [['dazzleshop.com.bd', 'GTM-W7K3PQ9']] } },
  { id: 'search-console', group: 'ads', name: 'Google Search Console', sub: 'How people find you on Google', brand: 'google', kind: 'oauth', signin: 'Google', company: 'Google', module: 'online', page: '/set-seo', uses: ['Search'],
    pick: { label: 'Website', items: [['dazzleshop.com.bd', 'Verified']] } },
  { id: 'tiktok-ads', group: 'ads', name: 'TikTok ads & Pixel', sub: 'Ad spend and sales from TikTok ads', brand: 'tiktok', kind: 'oauth', signin: 'TikTok', company: 'TikTok', module: 'online', page: '/setup-tik-tok', uses: ['Ad spend', 'Sales from ads'],
    pick: { label: 'TikTok ad account', items: [['Dazzle Shop', 'Ad account · BDT']] } },
  { id: 'clarity', group: 'ads', name: 'Microsoft Clarity', sub: 'Screen recordings and heatmaps', brand: 'clarity', kind: 'page', module: 'online', page: '/setup-clarity', uses: ['Recordings'] },
  // ---- payments and delivery: lib/settlements.js (GatewaySetup) ----
  { id: 'bkash-pgw', group: 'payments', name: 'bKash', sub: 'Payment gateway', brand: 'bkash', kind: 'gateway', module: 'commerce', uses: ['Payments'] },
  { id: 'nagad-pgw', group: 'payments', name: 'Nagad', sub: 'Payment gateway', brand: 'nagad', kind: 'gateway', module: 'commerce', uses: ['Payments'] },
  { id: 'sslcommerz', group: 'payments', name: 'SSLCOMMERZ', sub: 'Cards, wallets and net banking', brand: 'sslcommerz', kind: 'gateway', module: 'commerce', uses: ['Payments'] },
  { id: 'eps', group: 'payments', name: 'EPS', sub: 'Payment gateway', brand: 'eps', kind: 'gateway', module: 'commerce', uses: ['Payments'] },
  { id: 'rocket-pgw', group: 'payments', name: 'Rocket', sub: 'Payment gateway', brand: 'rocket', kind: 'gateway', module: 'commerce', uses: ['Payments'] },
  { id: 'card', group: 'payments', name: 'Card machine', sub: 'Card payments at the counter', brand: 'card', kind: 'gateway', module: 'pos', uses: ['Payments'] },
  { id: 'pathao', group: 'delivery', name: 'Pathao', sub: 'Courier · cash on delivery', brand: 'pathao', kind: 'gateway', module: 'online', uses: ['Delivery', 'Cash collection'] },
  { id: 'steadfast', group: 'delivery', name: 'Steadfast', sub: 'Courier · cash on delivery', brand: 'steadfast', kind: 'gateway', module: 'online', uses: ['Delivery', 'Cash collection'] },
  { id: 'redx', group: 'delivery', name: 'RedX', sub: 'Courier · cash on delivery', brand: 'redx', kind: 'gateway', module: 'online', uses: ['Delivery', 'Cash collection'] },
  { id: 'carrybee', group: 'delivery', name: 'Carrybee', sub: 'Courier · cash on delivery', brand: 'carrybee', kind: 'gateway', module: 'online', uses: ['Delivery', 'Cash collection'] },
  // ---- SMS and email ----
  { id: 'sms', group: 'messages', name: 'SMS gateway', sub: 'Order updates and codes by SMS', brand: 'sms', kind: 'keys', module: 'core', page: '/set-notifications', uses: ['SMS'],
    providers: ['SSL Wireless', 'BulkSMSBD', 'Alpha SMS', 'Infobip'], fields: [['api_key', 'API key', true], ['sender_id', 'Sender ID (masking)', false, 'The name customers see, e.g. DAZZLE SHOP']] },
  { id: 'email', group: 'messages', name: 'Email sending', sub: 'Receipts and order emails', brand: 'email', kind: 'keys', module: 'core', page: '/set-notifications', uses: ['Email'],
    providers: ['Amazon SES', 'SendGrid', 'Mailgun', 'Your own SMTP'], fields: [['api_key', 'API key or SMTP password', true], ['from', 'Send from', false, 'e.g. orders@dazzleshop.com.bd']] },
  // ---- meetings (lib/meetings.js) ----
  { id: 'zoom', group: 'meetings', name: 'Zoom', sub: 'Video meetings with a link for each one', brand: 'zoom', kind: 'oauth', signin: 'Zoom', company: 'Zoom', module: 'comms', page: '/meetings', uses: ['Meetings'],
    pick: { label: 'Zoom account', items: [['Dazzle Shop', 'Pro · mehedi@dazzleshop.com.bd']] } },
  { id: 'google-meet', group: 'meetings', name: 'Google Meet & Calendar', sub: 'Meet links and calendar invites', brand: 'google-meet', kind: 'oauth', signin: 'Google', company: 'Google', module: 'comms', page: '/meetings', uses: ['Meetings', 'Calendar'],
    pick: { label: 'Google calendar', items: [['mehedi@dazzleshop.com.bd', 'Primary calendar']] } },
  // ---- devices and tools ----
  { id: 'attendance', group: 'tools', name: 'Attendance machines', sub: 'Fingerprint and face machines', brand: 'attendance', kind: 'page', module: 'hr', page: '/attendance-devices', add: '/attendance-devices?add=1', uses: ['Attendance'] },
  { id: 'ai', group: 'tools', name: 'AI assistant', sub: 'Auto-replies, writing and AI calls', brand: 'ai', kind: 'page', module: 'core', page: '/set-ai', uses: ['AI'] },
  { id: 'storage', group: 'tools', name: 'File storage', sub: 'Product photos and documents', brand: 'storage', kind: 'page', module: 'core', page: '/set-storage', uses: ['Files'] },
  { id: 'backup', group: 'tools', name: 'Google Drive backup', sub: 'Nightly copies of your data', brand: 'google', kind: 'page', module: 'core', page: '/set-security#s1', uses: ['Backups'] },
];
export const appBy = (id) => APPS.find((a) => a.id === id) || null;
/** Apps in this edition. */
export const editionApps = () => APPS.filter((a) => hasModule(a.module));

// ---- stored state (oauth, keys and page apps) -------------------------------------------------------------
function seed(now) {
  return {
    v: 1,
    apps: {
      facebook: { account: 'Dazzle Shop', at: now - 200 * DAY, lastSync: now - 2 * MIN },
      instagram: { account: '@dazzleshop.bd', at: now - 200 * DAY, lastSync: now - 2 * MIN },
      whatsapp: { account: '+880 1711-000123', at: now - 160 * DAY, lastSync: now - 1 * MIN },
      tiktok: { account: '@dazzleshop.bd', at: now - 90 * DAY, lastSync: now - 6 * MIN, attention: 'Sign-in expires in 3 days. Reconnect to keep messages coming.' },
      linkedin: { account: 'Dazzle Shop Bangladesh', at: now - 60 * DAY, lastSync: now - 30 * MIN },
      telegram: { account: '@dazzleshop_bot', at: now - 45 * DAY, lastSync: now - 4 * MIN },
      'meta-ads': { account: '2 ad accounts', at: now - 120 * DAY, lastSync: now - 15 * MIN },
      'google-ads': { account: '512-889-1043', at: now - 100 * DAY, lastSync: now - 40 * MIN },
      ga4: { account: 'G-8XK21PZ4QM', at: now - 300 * DAY, lastSync: now - 10 * MIN },
      gtm: { account: 'GTM-W7K3PQ9', at: now - 300 * DAY, lastSync: now - 3 * HOUR },
      'search-console': { account: 'dazzleshop.com.bd', at: now - 280 * DAY, lastSync: now - 6 * HOUR },
      'tiktok-ads': { account: 'Dazzle Shop', at: now - 80 * DAY, lastSync: now - 20 * MIN, attention: 'Sign-in expires in 3 days. Reconnect to keep ad data coming.' },
      sms: { account: 'SSL Wireless · DAZZLE SHOP', at: now - 210 * DAY, lastSync: now - 5 * MIN },
      email: { account: 'Amazon SES · orders@dazzleshop.com.bd', at: now - 210 * DAY, lastSync: now - 25 * MIN },
      zoom: { account: 'Zoom Pro · mehedi@dazzleshop.com.bd', at: now - 30 * DAY, lastSync: now - 12 * MIN },
      'google-meet': { account: 'mehedi@dazzleshop.com.bd', at: now - 30 * DAY, lastSync: now - 8 * MIN },
      ai: { account: 'Anthropic · Claude', at: now - 50 * DAY },
      storage: { account: 'Cloudflare R2 · 6.2 GB of 50 GB', at: now - 400 * DAY },
      backup: { account: 'Google Drive · last copy 2:00 AM', at: now - 400 * DAY, attention: 'Last night’s file backup failed. Check the Drive folder.' },
    },
  };
}
function read() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(window.localStorage.getItem(KEY)) || null; } catch { return null; }
}
function state() {
  let s = read();
  if (!s || s.v !== 1) { s = seed(nowMs()); try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ } }
  return s;
}
function save(mut) {
  const s = state();
  mut(s);
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); window.dispatchEvent(new CustomEvent(CONNECTIONS_EVENT)); } catch { /* ignore */ }
}

// ---- status ----------------------------------------------------------------------------------------------
/** { state: 'connected' | 'attention' | 'off', account, note, at, lastSync } */
export function statusOf(id, ctx = {}) {
  const a = appBy(id);
  if (!a) return { state: 'off' };
  if (a.kind === 'channel') {
    const c = ctx.ch || getChannels();
    const conn = c.conn[a.ch];
    if (!conn) return { state: 'off' };
    if (a.ch === 'gbp') {
      const locs = gbpLocations();
      const att = locs.filter((l) => l.st === 'attention').length;
      return { state: att ? 'attention' : 'connected', account: `${conn.account} · ${locs.length} ${locs.length === 1 ? 'location' : 'locations'}`, note: att ? `${att} ${att === 1 ? 'location needs' : 'locations need'} attention: confirm opening hours.` : '', lastSync: conn.lastSync };
    }
    const account = a.ch === 'meta' ? conn.catalog : a.ch === 'gmc' ? `${conn.account} · ID ${conn.merchantId}` : conn.store || conn.account;
    return { state: 'connected', account, lastSync: conn.lastSync, at: conn.at };
  }
  if (a.kind === 'gateway') {
    const cfg = ctx.cfg || getConfig();
    const p = getAllPartners(cfg).find((x) => x.id === id);
    if (!p) return { state: 'off' };
    return { state: 'connected', account: p.mode === 'direct' ? 'Money comes straight to you' : 'Paid out to you later', at: (cfg.setup || {})[id] ? cfg.setup[id].at : null };
  }
  if (id === 'attendance') {
    const S = ctx.hr || loadSnapshot();
    const devs = S.devices || [];
    if (!devs.length) return { state: 'off' };
    const off = devs.filter((d) => d.status !== 'online').length;
    return { state: off ? 'attention' : 'connected', account: `${devs.length} ${devs.length === 1 ? 'machine' : 'machines'}`, note: off ? `${off} ${off === 1 ? 'machine is' : 'machines are'} offline.` : '' };
  }
  const st = (ctx.s || state()).apps[id];
  if (!st) return { state: 'off' };
  return { state: st.attention ? 'attention' : 'connected', account: st.account, note: st.attention || '', at: st.at, lastSync: st.lastSync };
}
/** Every app in the edition with its status. */
export function allStatuses() {
  const ctx = { ch: getChannels(), cfg: getConfig(), s: state() };
  try { ctx.hr = loadSnapshot(); } catch { ctx.hr = { devices: [] }; }
  return editionApps().map((a) => ({ ...a, status: statusOf(a.id, ctx) }));
}

// ---- connect, disconnect -----------------------------------------------------------------------------------
/** Save a new connection (the connect flow's answers). Channel apps start their first sync. */
export function connectApp(id, info = {}) {
  const a = appBy(id);
  if (!a) return null;
  const now = nowMs();
  if (a.kind === 'channel') return connectChannel(a.ch, info);
  save((s) => { s.apps[id] = { account: info.account || '', at: now, lastSync: now, ...info }; delete s.apps[id].attention; });
  return null;
}
export function reconnectApp(id) {
  save((s) => { if (s.apps[id]) { delete s.apps[id].attention; s.apps[id].lastSync = nowMs(); } });
}
export function disconnectApp(id) {
  const a = appBy(id);
  if (!a) return;
  if (a.kind === 'channel') { disconnectChannel(a.ch); return; }
  if (a.kind === 'gateway') { const cfg = getConfig(); saveConfig({ ...cfg, removed: [...new Set([...(cfg.removed || []), id])] }); try { window.dispatchEvent(new CustomEvent(CONNECTIONS_EVENT)); } catch { /* ignore */ } return; }
  save((s) => { delete s.apps[id]; });
}

// ---- the Inbox ---------------------------------------------------------------------------------------------
/** Apps that bring messages, comments or reviews into the Inbox, with their state (for its Channels panel). */
export function inboxApps() {
  return allStatuses().filter((a) => a.inbox);
}
/** Inbox channel ids that are connected and bring this kind ('Messages' | 'Comments' | 'Reviews'). */
export function connectedInbox(use) {
  return inboxApps().filter((a) => a.status.state !== 'off' && a.uses.includes(use)).map((a) => a.inbox);
}
