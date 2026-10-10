// admin/support — GridCommerce's support desk for its merchants (super admin › Support). Front end only: createStore key
// `support` (localStorage gc.admin.support). Never reads the merchant panel's libs (support-tickets, inbox …).
//
//   ticket: { id 'T-2291', shopId '0031', subject, category, priority, channel, status, agent (name | null),
//             team ('Support' | 'Technical'), createdAt, firstReplyAt, solvedAt, closedAt, updatedAt,
//             pausedAt / pausedMs (the resolution clock stops while waiting on the merchant),
//             messages: [{ id, at, from 'merchant'|'agent'|'note'|'system', by, text, files: [names], icon }],
//             escalations: [{ at, by, to, team, reason, backAt, backNote }], resolution, rating (1–5 | null), ratingNote,
//             ratingAskedAt, conv ('conv-12' | null, the Inbox conversation), incident ('INC-114' | null), mergedInto }
//   Reading: tickets(), ticketById(id), isActive(tk), slaOf(tk, t), inView(tk, view, me), viewCounts(list, me),
//            deskSummary(from, to, t) (same shape as lib/admin/company.js › support), performance(from, to, t)
//   Changing (each commits and returns { ok, error?, id? }): addTicket · reply · addNote · assign · setStatus · setField ·
//            escalate · handBack · solve · reopen · merge
// The demo: ~150 tickets over the last 90 days from the platform's stores (lib/platform db().shops, by id). T-2291
// (Dhaka Gadget Hub, Steadfast parcels not syncing) is open, urgent and past its first-reply target, as on the
// merchant's page. SLA: first reply 30 min urgent · 2 h high · 8 h normal · 24 h low; resolution 4 h · 24 h · 48 h · 5 days.

import { createStore } from './store';
import { db as platformDB, staff as currentStaff } from '@/lib/platform/store';
import { rng, DAY, MIN, startOfDay } from '@/lib/platform/util';

const H = 3600e3;

export const CATEGORIES = ['Billing', 'Courier & delivery', 'Payments', 'Orders', 'POS & hardware', 'Storefront & themes', 'Account & access', 'Integrations', 'Feature request', 'Bug'];
export const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'];
export const CHANNELS = ['Phone', 'WhatsApp', 'Email', 'Chat', 'In-app'];
export const STATUSES = ['New', 'Open', 'Waiting on merchant', 'Waiting on us', 'Escalated', 'Solved', 'Closed'];
export const DONE = ['Solved', 'Closed'];
/** The support team; Rakib Hasan (operations) takes technical escalations. */
export const AGENTS = ['Farhana Akter', 'Sadia Rahman', 'Jamil Haque'];
export const TECH = 'Rakib Hasan';
export const DESK = [...AGENTS, TECH];
export const TARGETS = {
  Urgent: { first: 30 * MIN, resolve: 4 * H },
  High: { first: 2 * H, resolve: 24 * H },
  Normal: { first: 8 * H, resolve: 48 * H },
  Low: { first: 24 * H, resolve: 5 * DAY },
};
export const STATUS_TONE = { New: 'info', Open: 'primary', 'Waiting on merchant': 'neutral', 'Waiting on us': 'warning', Escalated: 'error', Solved: 'success', Closed: 'neutral' };
export const PRIORITY_TONE = { Urgent: 'error', High: 'warning', Normal: 'neutral', Low: 'neutral' };
export const CHANNEL_ICON = { Phone: 'phone', WhatsApp: 'message-circle', Email: 'mail', Chat: 'messages-square', 'In-app': 'monitor-smartphone' };
/** The list's views (tabs). */
export const VIEWS = [['unassigned', 'Unassigned'], ['mine', 'Mine'], ['open', 'Open'], ['us', 'Waiting on us'], ['escalated', 'Escalated'], ['solved', 'Solved']];

export const SAVED_REPLIES = [
  { id: 'hello', title: 'Looking into it', text: 'Thanks for letting us know, {name}. I am looking into this now and will update you within the hour.' },
  { id: 'shot', title: 'Ask for a screenshot', text: 'Could you send a screenshot of the screen where you see this, with the order or invoice number? It helps us find it faster.' },
  { id: 'courier', title: 'Courier delay (known issue)', text: 'The courier’s system is sending updates late today. Your orders are safe; they will sync on their own once it recovers. We are watching it.' },
  { id: 'refund', title: 'Refund on the way', text: 'Your refund has been sent to the same number/account. It usually shows within 3 working days.' },
  { id: 'fixed', title: 'Fixed, please check', text: 'This is fixed on our side. Could you check once and tell us if it works for you now?' },
  { id: 'call', title: 'Call back', text: 'I tried calling you about this. When is a good time to call back today?' },
  { id: 'close', title: 'Closing note', text: 'Glad it is sorted. I am closing this ticket; reply here any time if it comes back.' },
];
export const INCIDENTS = ['INC-114', 'INC-109', 'INC-103', 'INC-097'];
export const ESCALATE_REASONS = ['Needs a look at the logs or the webhook queue', 'Data fix needed', 'Payment gateway or courier side', 'Looks like a bug in the latest release', 'Merchant asked for a manager'];

// ---- the demo library: subject, the merchant's words, our answer, the resolution note ----------------------------------
const LIB = {
  Billing: [
    ['Charged twice for the September bill', 'bKash theke duibar taka kete nise September bill er jonno. Transaction IDs attached.', 'I can see both payments. The second one goes back to the same bKash number within 3 working days.', 'Duplicate bKash payment refunded; refund ID shared with the owner.'],
    ['Need the invoice with VAT and BIN for August', 'Our accountant needs the August invoice with your BIN and VAT shown separately.', 'Here is the August invoice with our BIN and 15% VAT on its own line.', 'Sent the VAT invoice PDF by email.'],
    ['Why did my bill go up this month?', 'This month’s bill is ৳1,200 more than last month. What changed?', 'The difference is the SMS add-on turned on on 5 Sep, charged for the days used this month.', 'Explained the add-on proration; merchant is fine with it.'],
    ['Want to switch to yearly billing', 'Can we pay yearly instead of monthly? Is there a discount?', 'Yes: yearly billing starts from your next bill with two months free.', 'Moved to yearly billing from the next bill.'],
  ],
  'Courier & delivery': [
    ['Pathao charge is wrong on COD orders', 'Pathao charge shows ৳130 inside Dhaka, it should be ৳70.', 'The zone was set to outside Dhaka for your pickup point. I have corrected the zone.', 'Fixed the pickup zone; charges now match Pathao’s rate card.'],
    ['RedX tracking numbers not on the order', 'Orders sent to RedX yesterday have no tracking number on the order page.', 'RedX sent the numbers late. I have pulled them in for all 14 orders.', 'Re-synced RedX tracking numbers for the affected orders.'],
    ['Courier pickup request fails', 'When I press Send to courier it says "pickup failed". 6 parcels waiting.', 'Your Steadfast API key had expired. Please paste the new key under Connections; I can stay on the call.', 'New API key added with the merchant on a call; pickups work.'],
    ['Delivered orders still show In transit', 'Customer received the parcel but the order still says In transit.', 'The courier’s delivered update was missed. I have updated the orders and turned the courier sync back on.', 'Courier hook re-enabled; statuses caught up.'],
  ],
  Payments: [
    ['bKash payments not showing on orders', 'Customers paid with bKash but orders still say payment due.', 'The bKash callback URL changed after your domain change. I have updated it.', 'Updated the bKash callback URL; payments now attach to orders.'],
    ['SSLCOMMERZ payout delayed by 3 days', 'SSLCOMMERZ payout was due Sunday, still not in the bank.', 'SSLCOMMERZ held payouts for a bank holiday. It is now released and should reach you today.', 'Payout released by the gateway after the holiday.'],
    ['Change the Nagad merchant number', 'We have a new Nagad merchant number. How to change it?', 'Send the new number from the owner’s phone and I will switch it after the check.', 'Nagad number changed after owner verification.'],
    ['Card payments failing at checkout', 'Three customers said card payment failed today.', 'The gateway was in test mode after the renewal. Live mode is back on.', 'Gateway switched back to live mode.'],
  ],
  Orders: [
    ['Orders stuck in Processing after payment', 'Paid orders are stuck in Processing since morning.', 'A background job was slow this morning. All 23 orders have moved on now.', 'Job queue cleared; orders moved to Approved.'],
    ['Cannot cancel an approved order', 'I need to cancel an approved order but the button is grey.', 'An order that is already with the courier can’t be cancelled. Use Return instead; I have shown how on the call.', 'Explained the return flow; merchant returned the order.'],
    ['Order export missing the phone column', 'The orders CSV has no customer phone column any more.', 'The column was turned off in your export settings. I have turned it back on.', 'Export column re-enabled.'],
    ['Same customer’s orders show twice', 'One customer’s order came in twice from the website.', 'The customer pressed Pay twice. I have cancelled the extra order and refunded it.', 'Duplicate order cancelled and refunded.'],
  ],
  'POS & hardware': [
    ['Receipt printer prints blank pages', 'Receipt printer gives blank paper since yesterday.', 'The thermal roll is in the wrong way round. Please flip it so the shiny side faces the head.', 'Paper roll reversed; printing fine.'],
    ['POS went offline and sales did not sync', 'Internet was down for 2 hours; sales from that time are missing.', 'The sales are saved on the till. Open the register once online and they will send; I can see 9 waiting.', 'Offline queue synced; 9 sales recovered.'],
    ['Cash drawer does not open', 'Cash drawer not opening after a sale.', 'The drawer is connected through the printer. I have turned on "Open drawer after sale" in POS settings.', 'Enabled drawer kick in POS settings.'],
    ['Scale barcode reads the wrong weight', 'Scale stickers show 1.2 kg but the POS adds 12 kg.', 'The weight format was set to 2 decimals. I changed it to 3, matching your scale.', 'Scale barcode format corrected.'],
  ],
  'Storefront & themes': [
    ['Product photos not loading on mobile', 'Product photos are not loading on phones, only on laptop.', 'Some photos were 8 MB each. I have turned on automatic resizing; they load fast now.', 'Image resizing turned on; photos load on mobile.'],
    ['Change the home page banner', 'How do I change the big banner on the home page for Eid?', 'Online Store › Themes › Customise › Banner. I have sent a short video.', 'Sent the how-to video; banner changed.'],
    ['Custom domain not opening the shop', 'Our .com.bd domain shows an error page.', 'The DNS record points to the old server. Please change the A record to the address I sent.', 'DNS fixed by the merchant’s domain provider.'],
    ['Theme menu shows old categories', 'The website menu still shows categories we deleted.', 'The menu is set by hand in the theme. I have rebuilt it from your categories.', 'Rebuilt the theme menu.'],
  ],
  'Account & access': [
    ['Owner locked out after phone change', 'I changed my phone number and can’t sign in now.', 'After checking the owner’s NID I have moved sign-in to the new number.', 'Owner phone updated after identity check.'],
    ['Add a staff login for the branch', 'Need a login for the new branch manager.', 'Settings › Team › Add person. He gets an SMS to set his password.', 'Explained; merchant added the manager.'],
    ['Two-factor code not arriving by SMS', 'The login code SMS is not coming.', 'Your operator was delaying SMS. I have sent the code by WhatsApp this time.', 'Code delivered by WhatsApp; SMS route switched.'],
    ['Remove a former manager’s access', 'Our old manager left. Please make sure he can’t log in.', 'Done: his access is removed and all his sessions are signed out.', 'Access removed and sessions ended.'],
  ],
  Integrations: [
    ['Facebook catalog sync failing', 'Facebook catalog shows 40 products with errors.', 'Those products have no brand. I have filled the brand from your product data and synced again.', 'Brand field filled; catalog sync clean.'],
    ['WooCommerce stock not updating', 'Stock on our WooCommerce site does not change after a sale.', 'The WooCommerce key had read-only rights. Please make a key with read/write; steps sent.', 'New read/write key added; stock syncs.'],
    ['Google Merchant says missing GTIN', 'Google Merchant rejected many products for missing GTIN.', 'For your own-brand items we mark them as having no GTIN. Done for 112 products.', 'Marked own-brand items as no-GTIN.'],
    ['WhatsApp Business number disconnects', 'WhatsApp keeps disconnecting from the inbox every day.', 'The number was also open on WhatsApp Web on another PC. Please log that out.', 'Merchant logged out the other session; stable since.'],
  ],
  'Feature request': [
    ['Print invoices in Bangla', 'Can we print the invoice in Bangla for our customers?', 'Bangla invoices are on our list. I have added your vote and will tell you when it is out.', 'Logged as a feature request (Bangla invoice).'],
    ['Sales report by salesperson', 'We need sales by each salesperson for commission.', 'Analytics › Sales by staff does this. I have pinned it to your reports.', 'Pointed to the existing report.'],
    ['Allow partial delivery on one order', 'Sometimes we send half the order now and half later. Possible?', 'Not yet. I have passed your use case to the product team.', 'Logged as a feature request (split shipment).'],
    ['Loyalty points expiry date', 'Can points expire after 1 year?', 'Yes, Loyalty › Settings › Points expire after. I have set it to 12 months for you.', 'Set points expiry to 12 months.'],
  ],
  Bug: [
    ['Stock goes negative after a return', 'After a customer return, stock shows -1.', 'Found it: a return to a closed branch. A fix is out; I corrected your stock.', 'Bug fixed in release 4.12; stock corrected.'],
    ['Dashboard sales differ from the report', 'Home says ৳84,000 today but the sales report says ৳79,500.', 'Home counts cancelled orders until the evening refresh. A fix is going out this week.', 'Fixed in release 4.13.'],
    ['Product search returns nothing', 'Searching products by SKU shows nothing.', 'The search index for your store was stuck. I rebuilt it.', 'Search index rebuilt.'],
    ['Date picker shows the wrong month', 'The date picker on reports opens on the wrong month.', 'Confirmed; it happened after midnight in Dhaka time. Fixed now.', 'Timezone bug fixed.'],
  ],
};
const FOLLOWUPS = ['Thanks, checking now.', 'Still the same here. Sending a screenshot.', 'Ok bhai, ami try kortesi.', 'Any update? Customers are asking.', 'Kal theke same problem.'];
const NOTES = ['Checked the store’s logs: the errors started after the last update.', 'Called the owner, he will send the screenshot tonight.', 'Same issue as two other stores this week. Watching for a pattern.', 'Owner prefers a call after 8 PM.'];
const THANKS = ['Works now, thank you!', 'Thank you, solved.', 'Dhonnobad, thik hoye gese.', 'Great, thanks for the quick help.'];
const FILES = {
  Billing: ['bkash-receipt.jpg', 'invoice.pdf'], 'Courier & delivery': ['courier-error.png', 'order-list.csv'], Payments: ['bkash-receipt.jpg', 'payout-statement.pdf'],
  Orders: ['order-screenshot.png', 'order-list.csv'], 'POS & hardware': ['till-photo.jpg', 'receipt-test.jpg'], 'Storefront & themes': ['phone-screenshot.png', 'screen-recording.mp4'],
  'Account & access': ['nid-front.jpg'], Integrations: ['sync-errors.csv', 'screenshot.png'], 'Feature request': ['sample.pdf'], Bug: ['screenshot.png', 'screen-recording.mp4'],
};

// ---- seed ---------------------------------------------------------------------------------------------------------
const weighted = (r, pairs) => { let x = r() * pairs.reduce((s, p) => s + p[1], 0); for (const [v, w] of pairs) { x -= w; if (x <= 0) return v; } return pairs[0][0]; };
const ownerName = (shop) => (shop && shop.owner && typeof shop.owner === 'object' ? shop.owner.name : (shop && shop.owner) || 'Owner');

function seed(now) {
  const r = rng('gc-admin-support-1');
  const shops = (platformDB().shops || []).filter((s) => s.id !== '0031');
  const pickShop = () => shops[Math.floor(r() * shops.length)];
  const all = [];
  let m = 0;
  const msg = (at, from, by, text, extra) => ({ id: 'm' + (++m), at, from, by, text, files: [], ...extra });
  const dayTime = (ms) => { const d = startOfDay(ms); return d + r.int(9, 21) * H + r.int(0, 59) * MIN; };

  // One ticket. o: { shop, created, priority, category, item, channel, status, agent, firstAfter, solveAfter, … }
  function make(o) {
    const shop = o.shop;
    const owner = ownerName(shop);
    const [subject, ask, answer, fix] = o.item;
    const tk = {
      id: o.id || null, shopId: shop.id, subject, category: o.category, priority: o.priority, channel: o.channel,
      status: o.status, agent: o.agent || null, team: o.team || 'Support', createdAt: o.created, firstReplyAt: null, solvedAt: null,
      closedAt: null, updatedAt: o.created, pausedAt: null, pausedMs: 0, messages: [], escalations: [], resolution: '', rating: null,
      ratingNote: '', ratingAskedAt: null, conv: null, incident: o.incident || null, mergedInto: null,
    };
    if (o.channel === 'WhatsApp' || o.channel === 'Chat') tk.conv = 'conv-' + r.int(3, 48);
    const via = { Phone: 'Logged from a phone call', WhatsApp: 'Opened from WhatsApp', Email: 'Opened from an email', Chat: 'Opened from the website chat', 'In-app': 'Opened from the merchant panel' }[o.channel];
    tk.messages.push(msg(o.created, 'system', '', via + (o.agent && o.channel === 'Phone' ? ' by ' + o.agent : ''), { icon: 'life-buoy' }));
    const files = FILES[o.category] || ['screenshot.png'];
    // nothing happens after the ticket was solved, or after now
    const cap = (x) => Math.min(x, o.solveAfter != null ? o.created + o.solveAfter - 6 * MIN : x, now - 2 * MIN);
    tk.messages.push(msg(o.created + MIN, 'merchant', owner, ask, r.chance(0.35) ? { files: [r.pick(files)] } : {}));
    if (o.firstAfter != null) {
      tk.firstReplyAt = o.created + o.firstAfter;
      tk.messages.push(msg(tk.firstReplyAt, 'agent', o.firstBy || o.agent || AGENTS[0], answer));
      tk.updatedAt = tk.firstReplyAt;
    }
    if (o.note) tk.messages.push(msg(cap((tk.firstReplyAt || o.created) + 6 * MIN), 'note', o.firstBy || o.agent || AGENTS[0], r.pick(NOTES)));
    if (o.escalate) {
      const at = cap((tk.firstReplyAt || o.created) + r.int(20, 120) * MIN);
      const from = o.firstBy || AGENTS[0];
      tk.escalations.push({ at, by: from, to: TECH, team: 'Technical', reason: o.escalate, backAt: null, backNote: '' });
      tk.messages.push(msg(at, 'system', from, `Escalated to Technical (${TECH}) by ${from}: ${o.escalate}`, { icon: 'arrow-up-right' }));
      if (o.backAfter) {
        const e = tk.escalations[0];
        e.backAt = cap(at + o.backAfter); e.backNote = 'Fixed on our side, back to support to confirm with the merchant.';
        tk.messages.push(msg(e.backAt, 'system', TECH, `Handed back to ${from} by ${TECH}: ${e.backNote}`, { icon: 'corner-down-left' }));
      }
    }
    if (o.followUp) {
      const at = cap(Math.max(tk.updatedAt, o.created) + o.followUp);
      tk.messages.push(msg(at, 'merchant', owner, r.pick(FOLLOWUPS), r.chance(0.4) ? { files: [r.pick(files)] } : {}));
      tk.updatedAt = at;
    }
    if (o.pausedAt) { tk.pausedAt = o.pausedAt; }
    if (o.solveAfter != null) {
      const at = o.created + o.solveAfter;
      tk.messages.push(msg(at - 4 * MIN, 'agent', o.agent, 'This is sorted now. ' + (r.chance(0.5) ? 'Please check once and tell us if anything is off.' : 'Thanks for your patience.')));
      if (r.chance(0.6)) tk.messages.push(msg(at - MIN, 'merchant', owner, r.pick(THANKS)));
      tk.messages.push(msg(at, 'system', o.agent, `Solved by ${o.agent}`, { icon: 'circle-check' }));
      tk.solvedAt = at; tk.updatedAt = at; tk.resolution = fix; tk.ratingAskedAt = at;
      if (o.rating) { tk.rating = o.rating; if (o.rating <= 3) tk.ratingNote = 'Took too long to get an answer.'; }
      if (o.status === 'Closed') tk.closedAt = at + 3 * DAY;
    }
    tk.messages.sort((a, b) => a.at - b.at);
    return tk;
  }

  const PRI = [['Low', 20], ['Normal', 50], ['High', 22], ['Urgent', 8]];
  const CH = [['WhatsApp', 32], ['Phone', 28], ['In-app', 18], ['Email', 12], ['Chat', 10]];
  const WHO = [['Farhana Akter', 40], ['Sadia Rahman', 32], ['Jamil Haque', 28]];
  const RATE = [[5, 55], [4, 28], [3, 10], [2, 5], [1, 2]];
  const pickItem = () => { const c = weighted(r, CATEGORIES.map((x) => [x, x === 'Courier & delivery' || x === 'Payments' ? 16 : x === 'Feature request' ? 6 : 10])); return { category: c, item: r.pick(LIB[c]) }; };

  // history: solved and closed tickets over the last 90 days
  for (let i = 0; i < 120; i++) {
    let created = dayTime(now - r.int(1, 89) * DAY - r.int(0, 3) * H);
    const priority = weighted(r, PRI);
    const tg = TARGETS[priority];
    const fastFirst = r.chance(0.9);
    const fastSolve = r.chance(0.8);
    const pace = { Urgent: 0.3, High: 0.7, Normal: 1.2, Low: 2.5 }[priority];
    const firstAfter = fastFirst ? Math.min(tg.first - MIN, Math.round((3 + r() * r() * 60) * pace) * MIN) : tg.first + r.int(5, 90) * MIN;
    const solveAfter = Math.max(firstAfter + 10 * MIN, Math.round(fastSolve ? tg.resolve * (0.08 + r() * r() * 0.7) : tg.resolve + r.int(1, 12) * H));
    const tech = r.chance(0.12);
    const agent = weighted(r, WHO);
    const { category, item } = pickItem();
    const rated = r.chance(0.65);
    let rating = rated ? weighted(r, RATE) : null;
    if (rating && !fastSolve && rating > 3 && r.chance(0.5)) rating -= 1;
    if (created + solveAfter > now - 10 * MIN) created = now - solveAfter - r.int(10, 300) * MIN;   // solved before now
    const solvedAt = created + solveAfter;
    all.push(make({
      shop: pickShop(), created, priority, category, item, channel: weighted(r, CH), status: solvedAt < now - 3 * DAY ? 'Closed' : 'Solved',
      agent: tech ? TECH : agent, firstBy: agent, team: tech ? 'Technical' : 'Support', firstAfter, solveAfter, rating, note: r.chance(0.25),
      escalate: tech ? r.pick(ESCALATE_REASONS) : null, followUp: r.chance(0.4) ? r.int(10, 90) * MIN : null,
    }));
  }

  // Dhaka Gadget Hub's earlier tickets (the merchant page lists them)
  const dgh = (platformDB().shops || []).find((s) => s.id === '0031') || { id: '0031', name: 'Dhaka Gadget Hub', owner: 'Arif Hossain' };
  const past = [
    ['T-2203', 29, 'POS & hardware', ['Barcode scanner not reading new stickers', 'Scanner beep kore na new stickers e. Old ones work.', 'The new stickers use Code 128. I have turned it on in the scanner set-up; please scan the setup code I sent.', 'Scanner Code 128 enabled.'], 'Normal', 2 * H, 5],
    ['T-2150', 52, 'Account & access', ['How to give a cashier discount rights', 'How can my cashier give a discount without my PIN?', 'POS › Employees › Rafiq › allow discounts up to 10%. Done for you.', 'Cashier discount limit set.'], 'Low', 20 * MIN, 5],
    ['T-2098', 74, 'Billing', ['Invoice for July with VAT', 'Need July invoice with VAT for our accountant.', 'Attached: July invoice with our BIN and VAT on its own line.', 'Sent the VAT invoice.'], 'Low', DAY, 4],
  ];
  for (const [id, ago, category, item, priority, solveAfter, rating] of past) {
    const created = dayTime(now - ago * DAY);
    all.push(make({ id, shop: dgh, created, priority, category, item, channel: 'Phone', status: 'Closed', agent: 'Farhana Akter', firstAfter: Math.min(solveAfter / 2, 12 * MIN), solveAfter, rating }));
  }

  // the desk now: tickets still open
  const live = [
    // [status, agent, priority, hours ago, first reply (min after) | null, extras]
    ['New', null, 'High', 1.4, null, {}], ['New', null, 'Normal', 2.5, null, {}], ['New', null, 'Low', 5, null, {}], ['New', null, 'Urgent', 0.3, null, {}],
    ['Open', null, 'Normal', 7, 40, {}],
    ['Open', 'Farhana Akter', 'High', 3, 25, { note: true }], ['Open', 'Sadia Rahman', 'Normal', 20, 180, {}], ['Open', 'Jamil Haque', 'Normal', 26, 600, {}],
    ['Open', 'Farhana Akter', 'Urgent', 2.2, 12, { note: true }], ['Open', 'Sadia Rahman', 'Low', 30, 300, {}], ['Open', 'Jamil Haque', 'High', 9, 150, {}],
    ['Waiting on merchant', 'Farhana Akter', 'Normal', 28, 35, { pause: 26 }], ['Waiting on merchant', 'Sadia Rahman', 'Low', 52, 90, { pause: 40 }],
    ['Waiting on merchant', 'Jamil Haque', 'Normal', 44, 200, { pause: 30 }], ['Waiting on merchant', 'Sadia Rahman', 'High', 10, 40, { pause: 7 }],
    ['Waiting on merchant', 'Farhana Akter', 'Normal', 70, 60, { pause: 50 }], ['Waiting on merchant', 'Jamil Haque', 'Low', 96, 400, { pause: 80 }],
    ['Waiting on us', 'Farhana Akter', 'High', 6, 30, { follow: 120 }], ['Waiting on us', 'Sadia Rahman', 'Normal', 22, 60, { follow: 300 }],
    ['Waiting on us', 'Jamil Haque', 'Normal', 34, 240, { follow: 600 }], ['Waiting on us', 'Sadia Rahman', 'Urgent', 3.5, 20, { follow: 60 }],
    ['Waiting on us', 'Farhana Akter', 'Low', 48, 500, { follow: 900 }],
    ['Escalated', TECH, 'Urgent', 5, 15, { esc: true, cat: 'Payments' }], ['Escalated', TECH, 'High', 18, 50, { esc: true, cat: 'Bug' }],
    ['Escalated', TECH, 'High', 30, 70, { esc: true, cat: 'Integrations' }], ['Escalated', TECH, 'Normal', 50, 120, { esc: true, cat: 'Orders' }],
  ];
  for (const [status, agent, priority, hoursAgo, first, x] of live) {
    const created = now - Math.round(hoursAgo * H);
    const picked = x.cat ? { category: x.cat, item: r.pick(LIB[x.cat]) } : pickItem();
    const firstBy = agent === TECH ? weighted(r, WHO) : agent || AGENTS[0];
    all.push(make({
      shop: pickShop(), created, priority, category: picked.category, item: picked.item, channel: weighted(r, CH), status, agent, firstBy,
      team: agent === TECH ? 'Technical' : 'Support', firstAfter: first == null ? null : first * MIN, note: !!x.note,
      escalate: x.esc ? r.pick(ESCALATE_REASONS.slice(0, 4)) : null, followUp: x.follow ? x.follow * MIN : null,
      pausedAt: x.pause ? now - x.pause * H : null,
    }));
  }

  // T-2291: Steadfast parcels not syncing at Dhaka Gadget Hub; urgent, open, first reply 25 min late
  const t2291 = make({
    id: 'T-2291', shop: dgh, created: now - 55 * MIN, priority: 'Urgent', category: 'Courier & delivery', channel: 'Phone', status: 'Open',
    agent: 'Farhana Akter', incident: 'INC-114',
    item: ['Steadfast parcels not syncing since this morning', 'Sakal theke Steadfast e parcel jacche na. 18 ta order "Ready for courier" e atke ase, rider 5 tay ashbe.', '', ''],
  });
  t2291.conv = 'conv-12';
  t2291.messages[0].text = 'Logged from a phone call by Farhana Akter';
  t2291.messages[1].files = ['steadfast-error.png'];
  t2291.messages.push({ id: 'm' + (++m), at: now - 48 * MIN, from: 'note', by: 'Farhana Akter', text: 'Same Steadfast webhook delay as INC-114 (38 stores). Owner is on the Elephant Road campaign list, call him back first.', files: [] });
  all.push(t2291);

  // ticket numbers by age, newest highest; the fixed ones keep theirs
  const fixed = new Set(all.filter((x) => x.id).map((x) => x.id));
  all.sort((a, b) => b.createdAt - a.createdAt);
  const newer = all.findIndex((x) => x.id === 'T-2291');
  let n = 2291 + newer;
  for (const tk of all) {
    if (tk.id) continue;
    while (fixed.has('T-' + n) || n === 2291) n -= 1;
    tk.id = 'T-' + n;
    n -= 1;
  }
  return { tickets: all, seq: 2291 + newer + 1, msgSeq: m + 1 };
}

export const supportStore = createStore({ key: 'support', version: 2, seed });

// ---- reads --------------------------------------------------------------------------------------------------------
export const tickets = () => supportStore.get().tickets;
export const ticketById = (id) => tickets().find((x) => x.id === String(id || '').trim().toUpperCase()) || null;
export const ticketsOf = (shopId) => tickets().filter((x) => x.shopId === shopId && !x.mergedInto);
export const isActive = (tk) => !DONE.includes(tk.status);
const me = () => { try { return currentStaff().name; } catch { return 'Mahin Khan'; } };

/** The SLA clock of a ticket now.
 *  { stage 'first'|'resolve'|'done', due, left (ms, < 0 = past), breached, paused, firstMet, resolveMet, text, tone } */
export function slaOf(tk, t) {
  const tg = TARGETS[tk.priority] || TARGETS.Normal;
  const firstDue = tk.createdAt + tg.first;
  const paused = tk.status === 'Waiting on merchant' && tk.pausedAt;
  const pausedMs = (tk.pausedMs || 0) + (paused ? Math.max(0, t - tk.pausedAt) : 0);
  const resolveDue = tk.createdAt + tg.resolve + pausedMs;
  const firstMet = tk.firstReplyAt ? tk.firstReplyAt <= firstDue : t > firstDue ? false : null;
  const resolveMet = tk.solvedAt ? tk.solvedAt <= resolveDue : t > resolveDue ? false : null;
  const base = { firstDue, resolveDue, firstMet, resolveMet, paused: !!paused };
  if (!isActive(tk)) {
    const ok = firstMet !== false && resolveMet !== false;
    return { ...base, stage: 'done', due: null, left: 0, breached: !ok, text: ok ? 'Met' : 'Missed', tone: ok ? 'success' : 'neutral' };
  }
  if (!tk.firstReplyAt) {
    const left = firstDue - t;
    return { ...base, stage: 'first', due: firstDue, left, breached: left < 0, text: left < 0 ? 'Reply overdue ' + span(-left) : 'Reply in ' + span(left), tone: left < 0 ? 'error' : left < 0.25 * tg.first ? 'warning' : 'neutral' };
  }
  if (paused) return { ...base, stage: 'resolve', due: null, left: resolveDue - t, breached: false, text: 'Paused', tone: 'neutral' };
  const left = resolveDue - t;
  return { ...base, stage: 'resolve', due: resolveDue, left, breached: left < 0, text: left < 0 ? 'Overdue ' + span(-left) : span(left) + ' left', tone: left < 0 ? 'error' : left < 0.2 * tg.resolve ? 'warning' : 'neutral' };
}
/** "25 min" · "3 h" · "3 h 20 min" · "2 days" */
export function span(ms) {
  const mins = Math.max(1, Math.round(ms / MIN));
  if (mins < 60) return mins + ' min';
  const h = Math.floor(mins / 60);
  if (h < 24) return h + ' h' + (mins % 60 && h < 10 ? ' ' + (mins % 60) + ' min' : '');
  const d = Math.round(h / 24);
  return d + (d === 1 ? ' day' : ' days');
}

/** Is a ticket in a list view? me: the signed-in staff member's name. */
export function inView(tk, view, who) {
  if (tk.mergedInto) return view === 'solved';
  const act = isActive(tk);
  if (view === 'unassigned') return act && !tk.agent;
  if (view === 'mine') return act && tk.agent === who;
  if (view === 'open') return act;
  if (view === 'us') return tk.status === 'Waiting on us';
  if (view === 'escalated') return tk.status === 'Escalated';
  if (view === 'solved') return !act;
  return true;
}
export function viewCounts(list, who) {
  const out = {};
  for (const [k] of VIEWS) out[k] = list.filter((tk) => inView(tk, k, who)).length;
  return out;
}

const avg = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);

/** The desk now and the period's averages, the same shape as lib/admin/company.js › support (the dashboard can switch). */
export function deskSummary(from, to, t) {
  const all = tickets().filter((x) => !x.mergedInto);
  const act = all.filter(isActive);
  const created = all.filter((x) => x.createdAt >= from && x.createdAt < to && x.firstReplyAt);
  const solved = all.filter((x) => x.solvedAt && x.solvedAt >= from && x.solvedAt < to);
  return {
    open: act.length,
    pending: act.filter((x) => x.status === 'Waiting on merchant').length,
    critical: act.filter((x) => x.priority === 'Urgent').length,
    unassigned: act.filter((x) => !x.agent).length,
    resolved: solved.length,
    firstReply: Math.round(avg(created.map((x) => (x.firstReplyAt - x.createdAt) / MIN))),
    resolveHours: Math.round(avg(solved.map((x) => (x.solvedAt - x.createdAt) / H)) * 10) / 10,
    load: DESK.map((name) => ({ name, open: act.filter((x) => x.agent === name).length })),
    breached: act.filter((x) => slaOf(x, t).breached).length,
  };
}

/** Everything the Performance page shows for [from, to). */
export function performance(from, to, t) {
  const all = tickets().filter((x) => !x.mergedInto);
  const act = all.filter(isActive);
  const created = all.filter((x) => x.createdAt >= from && x.createdAt < to);
  const solved = all.filter((x) => x.solvedAt && x.solvedAt >= from && x.solvedAt < to);
  const days = [];
  for (let d = startOfDay(from); d < to; d += DAY) {
    days.push({ day: d, created: created.filter((x) => x.createdAt >= d && x.createdAt < d + DAY).length, solved: solved.filter((x) => x.solvedAt >= d && x.solvedAt < d + DAY).length });
  }
  const byCategory = CATEGORIES.map((c) => ({ name: c, value: created.filter((x) => x.category === c).length })).sort((a, b) => b.value - a.value);
  const firstKnown = created.map((x) => slaOf(x, t).firstMet).filter((v) => v != null);
  const resolveKnown = solved.map((x) => slaOf(x, t).resolveMet).filter((v) => v != null);
  const pct = (xs) => (xs.length ? Math.round((xs.filter(Boolean).length / xs.length) * 100) : null);
  const byPriority = PRIORITIES.slice().reverse().map((p) => ({
    name: p,
    first: pct(created.filter((x) => x.priority === p).map((x) => slaOf(x, t).firstMet).filter((v) => v != null)),
    resolve: pct(solved.filter((x) => x.priority === p).map((x) => slaOf(x, t).resolveMet).filter((v) => v != null)),
    count: created.filter((x) => x.priority === p).length,
  }));
  const agents = DESK.map((name) => {
    const mine = created.filter((x) => x.agent === name || (x.escalations.length && x.escalations[0].by === name));
    const done = solved.filter((x) => x.agent === name);
    const firsts = created.filter((x) => x.firstReplyAt && x.messages.some((mm) => mm.from === 'agent' && mm.by === name && mm.at === x.firstReplyAt));
    const rated = done.filter((x) => x.rating);
    return {
      name, assigned: mine.length, solved: done.length, openNow: act.filter((x) => x.agent === name).length,
      firstReply: firsts.length ? Math.round(avg(firsts.map((x) => (x.firstReplyAt - x.createdAt) / MIN))) : null,
      resolveHours: done.length ? Math.round(avg(done.map((x) => (x.solvedAt - x.createdAt) / H)) * 10) / 10 : null,
      rating: rated.length ? Math.round(avg(rated.map((x) => x.rating)) * 10) / 10 : null, ratings: rated.length,
    };
  });
  // CSAT by week (Saturday starts the week in Bangladesh; weeks here simply count back from today)
  const weeks = [];
  const end = startOfDay(t) + DAY;
  const span7 = Math.max(1, Math.ceil((to - from) / (7 * DAY)));
  for (let i = Math.min(13, Math.max(4, span7)) - 1; i >= 0; i--) {
    const a = end - (i + 1) * 7 * DAY, b = end - i * 7 * DAY;
    const rated = all.filter((x) => x.rating && x.solvedAt >= a && x.solvedAt < b);
    weeks.push({ from: a, to: b, rating: rated.length ? Math.round(avg(rated.map((x) => x.rating)) * 100) / 100 : null, count: rated.length });
  }
  const rated = solved.filter((x) => x.rating);
  const firstTimes = created.filter((x) => x.firstReplyAt).map((x) => (x.firstReplyAt - x.createdAt) / MIN);
  return {
    open: act.length,
    pending: act.filter((x) => x.status === 'Waiting on merchant').length,
    high: act.filter((x) => x.priority === 'High' || x.priority === 'Urgent').length,
    firstReply: firstTimes.length ? Math.round(avg(firstTimes)) : null,
    resolveHours: solved.length ? Math.round(avg(solved.map((x) => (x.solvedAt - x.createdAt) / H)) * 10) / 10 : null,
    createdCount: created.length, solvedCount: solved.length,
    csat: rated.length ? Math.round(avg(rated.map((x) => x.rating)) * 10) / 10 : null, csatCount: rated.length,
    satisfied: rated.length ? Math.round((rated.filter((x) => x.rating >= 4).length / rated.length) * 100) : null,
    firstMet: pct(firstKnown), resolveMet: pct(resolveKnown), byPriority, days, byCategory, agents, weeks,
  };
}

/** A saved reply with the merchant's name filled in. */
export const fillReply = (text, name) => String(text).replace(/\{name\}/g, String(name || '').split(' ')[0] || 'there');

// ---- changes ------------------------------------------------------------------------------------------------------
function findIn(d, id) { return d.tickets.find((x) => x.id === id) || null; }
function push(d, tk, at, from, by, text, extra) {
  tk.messages.push({ id: 'm' + d.msgSeq++, at, from, by, text, files: [], ...extra });
  tk.updatedAt = at;
}
function moveStatus(tk, status, at) {
  if (tk.status === status) return;
  if (tk.status === 'Waiting on merchant' && tk.pausedAt) { tk.pausedMs = (tk.pausedMs || 0) + Math.max(0, at - tk.pausedAt); tk.pausedAt = null; }
  if (status === 'Waiting on merchant') tk.pausedAt = at;
  if (!DONE.includes(status)) tk.closedAt = null;
  if (status === 'Closed') tk.closedAt = at;
  tk.status = status;
}

/** A new ticket. input: { shopId, subject, category, priority, channel, message, agent } */
export function addTicket(input, by = me()) {
  const subject = String(input.subject || '').trim();
  const message = String(input.message || '').trim();
  const shops = platformDB().shops || [];
  const shop = shops.find((s) => s.id === input.shopId);
  if (!shop) return { ok: false, error: 'Pick the merchant.', field: 'shopId' };
  if (!subject) return { ok: false, error: 'Write a subject.', field: 'subject' };
  if (!CATEGORIES.includes(input.category)) return { ok: false, error: 'Pick a category.', field: 'category' };
  if (!message) return { ok: false, error: 'Write what the merchant said.', field: 'message' };
  return supportStore.commit((d, now) => {
    const id = 'T-' + d.seq++;
    const agent = DESK.includes(input.agent) ? input.agent : null;
    const channel = CHANNELS.includes(input.channel) ? input.channel : 'Phone';
    const tk = {
      id, shopId: shop.id, subject, category: input.category, priority: PRIORITIES.includes(input.priority) ? input.priority : 'Normal', channel,
      status: agent ? 'Open' : 'New', agent, team: agent === TECH ? 'Technical' : 'Support', createdAt: now, firstReplyAt: null, solvedAt: null,
      closedAt: null, updatedAt: now, pausedAt: null, pausedMs: 0, messages: [], escalations: [], resolution: '', rating: null, ratingNote: '',
      ratingAskedAt: null, conv: null, incident: null, mergedInto: null,
    };
    push(d, tk, now, 'system', by, `Ticket opened by ${by} (${channel})`, { icon: 'life-buoy' });
    push(d, tk, now, 'merchant', ownerName(shop), message, { files: (input.files || []).slice(0, 5) });
    d.tickets.unshift(tk);
    return { ok: true, id };
  });
}

/** A reply to the merchant. The ticket then waits on the merchant (an escalated ticket stays escalated). */
export function reply(id, text, files = [], by = me()) {
  const body = String(text || '').trim();
  if (!body && !files.length) return { ok: false, error: 'Write the reply first.' };
  return supportStore.commit((d, now) => {
    const tk = findIn(d, id);
    if (!tk) return { ok: false, error: 'That ticket is gone.' };
    if (!isActive(tk)) return { ok: false, error: 'Reopen the ticket to reply.' };
    push(d, tk, now, 'agent', by, body, { files: files.slice(0, 5) });
    if (!tk.firstReplyAt) tk.firstReplyAt = now;
    if (!tk.agent && DESK.includes(by)) tk.agent = by;
    if (tk.status === 'New') moveStatus(tk, 'Open', now);
    if (tk.status !== 'Escalated') moveStatus(tk, 'Waiting on merchant', now);
    return { ok: true };
  });
}

/** An internal note: only GridCommerce staff see it. */
export function addNote(id, text, files = [], by = me()) {
  const body = String(text || '').trim();
  if (!body && !files.length) return { ok: false, error: 'Write the note first.' };
  return supportStore.commit((d, now) => {
    const tk = findIn(d, id);
    if (!tk) return { ok: false, error: 'That ticket is gone.' };
    push(d, tk, now, 'note', by, body, { files: files.slice(0, 5) });
    return { ok: true };
  });
}

/** Give tickets to an agent (null: unassign). A new ticket opens when someone takes it. */
export function assign(ids, agent, by = me()) {
  if (agent && !DESK.includes(agent)) return { ok: false, error: 'Pick someone from the desk.' };
  return supportStore.commit((d, now) => {
    let n = 0;
    for (const id of [].concat(ids)) {
      const tk = findIn(d, id);
      if (!tk || tk.agent === agent) continue;
      tk.agent = agent || null;
      if (agent && tk.status === 'New') moveStatus(tk, 'Open', now);
      push(d, tk, now, 'system', by, agent ? `Assigned to ${agent} by ${by}` : `Unassigned by ${by}`, { icon: 'user-round-check' });
      n++;
    }
    return { ok: true, n };
  });
}

/** Change the status of tickets. Solving needs a resolution note (note). */
export function setStatus(ids, status, note = '', by = me()) {
  if (!STATUSES.includes(status)) return { ok: false, error: 'Pick a status.' };
  if (status === 'Solved' && !String(note).trim()) return { ok: false, error: 'Write how it was solved.' };
  return supportStore.commit((d, now) => {
    let n = 0;
    for (const id of [].concat(ids)) {
      const tk = findIn(d, id);
      if (!tk || tk.status === status) continue;
      if (status === 'Solved') { solveIn(d, tk, note, now, by, false); n++; continue; }
      const was = tk.status;
      moveStatus(tk, status, now);
      if (status === 'Closed' && !tk.solvedAt) tk.solvedAt = now;
      if (!DONE.includes(status) && DONE.includes(was)) tk.solvedAt = null;
      push(d, tk, now, 'system', by, `Status ${was} → ${status} by ${by}`, { icon: 'refresh-cw' });
      n++;
    }
    return { ok: true, n };
  });
}

/** Change priority, category or channel. */
export function setField(id, key, value, by = me()) {
  const lists = { priority: PRIORITIES, category: CATEGORIES, channel: CHANNELS };
  if (!lists[key] || !lists[key].includes(value)) return { ok: false, error: 'Pick a value from the list.' };
  return supportStore.commit((d, now) => {
    const tk = findIn(d, id);
    if (!tk) return { ok: false, error: 'That ticket is gone.' };
    if (tk[key] === value) return { ok: true };
    const was = tk[key];
    tk[key] = value;
    push(d, tk, now, 'system', by, `${key[0].toUpperCase() + key.slice(1)} ${was} → ${value} by ${by}`, { icon: 'pencil' });
    return { ok: true };
  });
}

/** Escalate to Technical (Rakib Hasan) with a reason; incident optional. */
export function escalate(id, reason, incident = '', by = me()) {
  const why = String(reason || '').trim();
  if (!why) return { ok: false, error: 'Say why it needs Technical.' };
  const inc = String(incident || '').trim().toUpperCase();
  if (inc && !/^INC-\d{2,4}$/.test(inc)) return { ok: false, error: 'An incident ID looks like INC-114.' };
  return supportStore.commit((d, now) => {
    const tk = findIn(d, id);
    if (!tk) return { ok: false, error: 'That ticket is gone.' };
    if (tk.status === 'Escalated') return { ok: false, error: 'This ticket is already with Technical.' };
    tk.escalations.push({ at: now, by, to: TECH, team: 'Technical', reason: why, backAt: null, backNote: '', from: tk.agent });
    if (inc) tk.incident = inc;
    tk.team = 'Technical';
    tk.agent = TECH;
    moveStatus(tk, 'Escalated', now);
    push(d, tk, now, 'system', by, `Escalated to Technical (${TECH}) by ${by}: ${why}`, { icon: 'arrow-up-right' });
    return { ok: true };
  });
}

/** Technical hands the ticket back to support (to whoever escalated it). */
export function handBack(id, note, by = me()) {
  const text = String(note || '').trim();
  if (!text) return { ok: false, error: 'Say what Technical found or did.' };
  return supportStore.commit((d, now) => {
    const tk = findIn(d, id);
    if (!tk) return { ok: false, error: 'That ticket is gone.' };
    const e = tk.escalations[tk.escalations.length - 1];
    if (!e || tk.status !== 'Escalated') return { ok: false, error: 'This ticket is not escalated.' };
    e.backAt = now; e.backNote = text;
    tk.team = 'Support';
    tk.agent = e.from && e.from !== TECH ? e.from : AGENTS.includes(e.by) ? e.by : null;
    moveStatus(tk, 'Waiting on us', now);
    push(d, tk, now, 'system', by, `Handed back to ${tk.agent || 'support'} by ${by}: ${text}`, { icon: 'corner-down-left' });
    return { ok: true };
  });
}

function solveIn(d, tk, note, now, by, ask) {
  moveStatus(tk, 'Solved', now);
  tk.solvedAt = now;
  tk.resolution = String(note).trim();
  if (!tk.agent && DESK.includes(by)) tk.agent = by;
  push(d, tk, now, 'system', by, `Solved by ${by}`, { icon: 'circle-check' });
  if (ask) { tk.ratingAskedAt = now; push(d, tk, now, 'system', by, 'Rating request sent to the merchant', { icon: 'star' }); }
}
/** Solve with a resolution note; ask: send the merchant a rating request. */
export function solve(id, note, ask = true, by = me()) {
  if (!String(note || '').trim()) return { ok: false, error: 'Write how it was solved.' };
  return supportStore.commit((d, now) => {
    const tk = findIn(d, id);
    if (!tk) return { ok: false, error: 'That ticket is gone.' };
    if (!isActive(tk)) return { ok: false, error: 'This ticket is already solved.' };
    solveIn(d, tk, note, now, by, ask);
    return { ok: true };
  });
}

export function reopen(id, by = me()) {
  return supportStore.commit((d, now) => {
    const tk = findIn(d, id);
    if (!tk) return { ok: false, error: 'That ticket is gone.' };
    if (isActive(tk)) return { ok: false, error: 'This ticket is already open.' };
    if (tk.mergedInto) return { ok: false, error: `This ticket was merged into ${tk.mergedInto}.` };
    moveStatus(tk, 'Open', now);
    tk.solvedAt = null;
    push(d, tk, now, 'system', by, `Reopened by ${by}`, { icon: 'rotate-ccw' });
    return { ok: true };
  });
}

/** Merge tickets into one (demo): the others close and their messages are copied into the one kept. */
export function merge(ids, intoId, by = me()) {
  const others = [].concat(ids).filter((x) => x !== intoId);
  if (!others.length) return { ok: false, error: 'Pick at least two tickets.' };
  return supportStore.commit((d, now) => {
    const into = findIn(d, intoId);
    if (!into) return { ok: false, error: 'That ticket is gone.' };
    if (others.some((id) => { const x = findIn(d, id); return x && x.shopId !== into.shopId; })) return { ok: false, error: 'Only tickets from the same merchant can be merged.' };
    let n = 0;
    for (const id of others) {
      const tk = findIn(d, id);
      if (!tk || tk.mergedInto) continue;
      for (const mm of tk.messages.filter((x) => x.from === 'merchant' || x.from === 'agent' || x.from === 'note')) {
        into.messages.push({ ...mm, id: 'm' + d.msgSeq++ });
      }
      into.messages.sort((a, b) => a.at - b.at);
      push(d, into, now, 'system', by, `${tk.id} (“${tk.subject}”) merged into this ticket by ${by}`, { icon: 'merge' });
      tk.mergedInto = into.id;
      moveStatus(tk, 'Closed', now);
      if (!tk.solvedAt) tk.solvedAt = now;
      tk.resolution = `Merged into ${into.id}`;
      push(d, tk, now, 'system', by, `Merged into ${into.id} by ${by}`, { icon: 'merge' });
      n++;
    }
    return { ok: true, n };
  });
}
