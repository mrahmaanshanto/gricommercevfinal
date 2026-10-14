// emailInbox — the shop's email in the Inbox (Inbox › Email, /email-inbox): mail to the shared addresses (info@,
// sales@, support@, orders@) as conversations (threads). Front end only (browser storage); the live system reads the
// mailboxes made in Settings › Business email (lib/platform/mail.js) from the mail provider, and threads by the mail's
// Message-ID / In-Reply-To headers.
//   thread   { id, box (local part it came to), subject, folder inbox|sent|archive|spam|trash, unread, starred,
//              assignee (staff name or ''), messages [], notes [{ at, by, text }], answer? (demo: the other side
//              writes back a while after the shop's first reply), pending? { at, text, cc } }
//   message  { id, from { name, email }, to [], cc [], bcc [] (addresses; 'info@' = the shop's own address on its
//              domain), at, text, files [{ name, size }], out (sent by the shop), by (staff), kind new|reply|replyAll|
//              forward, replyTo (message id), quote { from, at, text } (forwarded or quoted mail) }
// A reply, a reply to all and a forward stay in the thread they belong to; a customer's answer joins it and makes it
// unread again. Changes fire `gc:inbox` so the menu's Email count follows (lib/liveCounts.js).

import { domainOf } from './platform/mail';

const KEY = 'gc.emailbox';
export const EVENT = 'gc:inbox';
export const DEMO_DOMAIN = 'dazzleshop.com.bd';
export const SHARED = [
  { local: 'info', name: 'General' },
  { local: 'sales', name: 'Sales' },
  { local: 'support', name: 'Support' },
  { local: 'orders', name: 'Orders' },
];
const isBrowser = typeof window !== 'undefined';
const M = 6e4, H = 36e5, D = 864e5;
const EMAIL = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;

/** The shop's mail domain: the Business email domain when it is working, else the demo one. */
export function mailDomain() {
  try { const d = domainOf(); if (d && d.state === 'active') return { domain: d.domain, live: true }; } catch { /* storage blocked */ }
  return { domain: DEMO_DOMAIN, live: false };
}
export const addrOf = (local) => local + '@' + mailDomain().domain;
/** An address as shown: 'info@' (the shop's own) gets the shop's domain. */
export const showAddr = (a) => (/@$/.test(a) ? a + mailDomain().domain : a);
const isShop = (a) => /@$/.test(a) || String(a).toLowerCase().endsWith('@' + mailDomain().domain) || String(a).toLowerCase().endsWith('@' + DEMO_DOMAIN);
/** 'a@x.com, b@y.com; c@z.com' → { list, bad } (duplicates dropped). */
export function parseList(text) {
  const parts = String(text || '').split(/[,;\s]+/).map((x) => x.trim().replace(/^<|>$/g, '')).filter(Boolean);
  const list = [], bad = [];
  parts.forEach((p) => { if (!EMAIL.test(p)) bad.push(p); else if (!list.some((x) => x.toLowerCase() === p.toLowerCase())) list.push(p); });
  return { list, bad };
}

// ---- demo mail ---------------------------------------------------------------------------------------------------------------
function seed(t) {
  let n = 0;
  const msg = (from, at, text, extra = {}) => ({ id: 'em' + (++n), from, to: [], cc: [], bcc: [], at, text, files: [], out: false, kind: 'new', replyTo: '', quote: null, ...extra });
  const me = (by, at, text, extra = {}) => msg({ name: by, email: '' }, at, text, { out: true, by, kind: 'reply', ...extra });
  const th = (id, box, subject, messages, extra = {}) => ({ id, box, subject, folder: 'inbox', unread: false, starred: false, assignee: '', notes: [], messages, ...extra });
  const nusrat = { name: 'Nusrat Jahan', email: 'nusrat.jahan@example.com' };
  const farzana = { name: 'Farzana Akter', email: 'farzana.a@example.com' };
  const tanvir = { name: 'Tanvir Hasan', email: 'tanvir.hasan@example.com' };
  const arman = { name: 'Arman Hossain', email: 'arman@hossainbuilders.com.bd' };
  const kabir = { name: 'Humayun Kabir', email: 'kabir@greenfieldagro.com.bd' };
  const steps = [
    msg(kabir, t - 3 * D - 2 * H, 'Hello,\n\nWe want 15 Samsung Galaxy A15 (6/128) for our field officers. Please send your best corporate price with warranty and delivery to Motijheel.\n\nHumayun Kabir\nAdmin, Greenfield Agro', { to: ['sales@'], cc: ['accounts@greenfieldagro.com.bd'] }),
  ];
  steps.push(me('Arafat Hossain', t - 3 * D, 'Hello Mr. Kabir,\n\nOur price for 15 Galaxy A15 (6/128) is ৳19,400 each with a 1-year warranty and free delivery inside Dhaka. We can deliver in two days.\n\nArafat, Dazzle Shop', { to: [kabir.email], cc: ['accounts@greenfieldagro.com.bd'], bcc: ['mehedi@'], kind: 'replyAll', replyTo: steps[0].id }));
  steps.push(msg({ name: 'Greenfield Accounts', email: 'accounts@greenfieldagro.com.bd' }, t - 2 * D - 20 * H, 'Dear Arafat,\n\nThanks. Can you issue the invoice in the name of Greenfield Agro Ltd with our BIN 004512876-0101? We pay by bank transfer within 7 days.\n\nShirin, Accounts', { to: ['sales@'], cc: [kabir.email], kind: 'replyAll', replyTo: steps[1].id }));
  steps.push(me('Arafat Hossain', t - 2 * D - 18 * H, 'Dear Shirin,\n\nYes, the invoice will carry the company name and BIN. Delivery is booked for Thursday morning.\n\nArafat', { to: ['accounts@greenfieldagro.com.bd'], cc: [kabir.email], kind: 'replyAll', replyTo: steps[2].id }));
  steps.push(msg(kabir, t - 4 * H, 'Phones received, thank you. The team is happy. We may order 10 more next month.\n\nKabir', { to: ['sales@'], cc: ['accounts@greenfieldagro.com.bd'], kind: 'replyAll', replyTo: steps[3].id }));
  return {
    v: 3,
    threads: [
      th('ET-1', 'sales', 'Quote for 40 phones for our site engineers', [
        msg(arman, t - 38 * M, 'Hello,\n\nWe need 40 phones for our site engineers: a solid battery, dual SIM, and a rugged case for each. Budget is around ৳18,000 a phone.\n\nCan you send a quote with delivery to Gazipur and the warranty terms? We would like to pay half in advance and half on delivery.\n\nRegards,\nArman Hossain\nProcurement, Hossain Builders', { to: ['sales@'], cc: ['md@hossainbuilders.com.bd'], files: [{ name: 'requirements.pdf', size: 184000 }] }),
      ], { unread: true, starred: true, answer: { text: 'Thank you for the quick quote. Our MD (in copy) agrees. Please send the proforma invoice so we can pay the advance tomorrow.\n\nArman', cc: ['md@hossainbuilders.com.bd'] } }),
      th('ET-2', 'support', 'Where is my charger order #136771?', [
        msg(tanvir, t - 2 * H - 10 * M, 'Hi, I ordered a screen cleaning kit last week (order #136771) and it still says shipped. When will it arrive in Savar?\n\nTanvir', { to: ['support@'] }),
      ], { unread: true, answer: { text: 'Got it, thanks! The rider just called me.\n\nTanvir' } }),
      th('ET-3', 'support', 'Warranty claim: earbuds stopped charging', [
        msg(farzana, t - 5 * H, 'Assalamu alaikum,\n\nThe Wireless Earbuds Pro I bought from your Banani order stopped charging in the left bud. It is 4 months old. How do I claim the warranty? I can bring it to the Dhanmondi branch.\n\nFarzana', { to: ['support@'], files: [{ name: 'earbuds-photo.jpg', size: 912000 }] }),
      ], { unread: true, assignee: 'Lamia Sultana' }),
      th('ET-4', 'info', 'Is the iPhone 15 back in stock?', [
        msg(nusrat, t - 26 * H, 'Hello Dazzle Shop, is the iPhone 15 128GB (black) back in stock? I would like two, one as a wedding gift.', { to: ['info@'] }),
        me('Arafat Hossain', t - 25 * H, 'Hi Nusrat, yes: we have the black 128GB at Central Warehouse and Dhanmondi. Two are on hold for you until tomorrow evening. Shall I send an order link?\n\nArafat, Dazzle Shop', { to: [nusrat.email], replyTo: 'em1' }),
        msg(nusrat, t - 3 * H, 'Yes please send the link. Can you gift-wrap one of them?', { to: ['info@'], kind: 'reply' }),
      ], { unread: true, assignee: 'Arafat Hossain' }),
      th('ET-5', 'orders', 'COD payout for 12 Oct is on its way', [
        msg({ name: 'Steadfast Courier', email: 'payouts@steadfast.com.bd' }, t - 7 * H, 'Dear merchant,\n\nYour COD payout of ৳48,320 for parcels delivered on 12 Oct has been sent to your bank account. The statement is attached.\n\nSteadfast Courier', { to: ['orders@'], files: [{ name: 'steadfast-payout-12oct.csv', size: 22000 }] }),
      ]),
      th('ET-6', 'info', 'Invoice SGD-2291 for September stock', [
        msg({ name: 'Smart Gadget Distribution', email: 'accounts@smartgadget.com.bd' }, t - 28 * H, 'Dear Sir,\n\nPlease find our invoice SGD-2291 for the September delivery (Realme Note 50, Redmi 13C, chargers). Payment terms 15 days.\n\nAccounts, Smart Gadget Distribution', { to: ['info@'], cc: ['rahim@smartgadget.com.bd'], files: [{ name: 'SGD-2291.pdf', size: 238000 }] }),
      ]),
      th('ET-7', 'info', 'Your Google Merchant Center products need attention', [
        msg({ name: 'Google Merchant Center', email: 'no-reply@google.com' }, t - 2 * D, '3 products were disapproved: missing GTIN. Open Merchant Center to fix them.', { to: ['info@'] }),
      ]),
      th('ET-8', 'info', 'Application: sales assistant, Mirpur branch', [
        msg({ name: 'Sumaiya Rahman', email: 'sumaiya.r@example.com' }, t - 2 * D - 4 * H, 'Dear Sir/Madam,\n\nI would like to apply for the sales assistant job at your Mirpur branch. I have one year of experience selling phones. My CV is attached.\n\nSumaiya Rahman', { to: ['info@'], files: [{ name: 'Sumaiya-Rahman-CV.pdf', size: 156000 }] }),
      ]),
      th('ET-9', 'sales', 'Corporate order: 15 Galaxy A15', steps, { assignee: 'Arafat Hossain' }),
      th('ET-10', 'support', 'Thanks for the quick replacement', [
        msg({ name: 'Rafiq Uddin', email: 'rafiq.u@example.com' }, t - 4 * D, 'Got the replacement power bank today. Thank you for sorting it out so fast!', { to: ['support@'] }),
      ], { folder: 'archive' }),
      th('ET-11', 'info', 'Congratulations! You won a ৳5,00,000 prize', [
        msg({ name: 'Prize Desk', email: 'claim@win-prize-now.biz' }, t - 30 * H, 'Click the link and enter your bank details to claim your prize today.', { to: ['info@'] }),
      ], { folder: 'spam' }),
      ...olderMail(t),
    ],
    seq: 900,
  };
}

// About three months of everyday mail before the threads above (payouts, settlements, questions, supplier bills,
// notices), so the list has pages and dates to search. Fixed by a seeded random, so every browser gets the same mail.
function olderMail(t) {
  let r = 7;
  const rnd = () => { r = (r * 9301 + 49297) % 233280; return r / 233280; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const people = [['Sabbir Ahmed', 'sabbir.a'], ['Tasnim Haque', 'tasnim.h'], ['Rumana Akter', 'rumana.a'], ['Imran Khan', 'imran.k'], ['Maliha Chowdhury', 'maliha.c'], ['Fahim Reza', 'fahim.r'], ['Nadia Islam', 'nadia.i'], ['Jubayer Hasan', 'jubayer.h'], ['Sharmin Sultana', 'sharmin.s'], ['Rafiq Uddin', 'rafiq.u'], ['Farzana Akter', 'farzana.a'], ['Nusrat Jahan', 'nusrat.jahan']];
  const products = ['iPhone 15', 'Galaxy A15', 'Redmi Note 13', 'Realme Note 50', 'Wireless Earbuds Pro', '20,000 mAh power bank', 'Smart Watch S8', '65W charger'];
  const questions = [
    ['Do you have the {p} in stock?', 'Hi, is the {p} available at the Mirpur branch? I can come this weekend.'],
    ['EMI on the {p}?', 'Hello, can I buy the {p} on EMI with a City Bank card? For how many months?'],
    ['Warranty on the {p}', 'What warranty comes with the {p}, and where do I claim it?'],
    ['Exchange offer for my old phone', 'Do you take old phones in exchange? I want to upgrade to the {p}.'],
    ['Delivery to Chattogram', 'How long does delivery to Chattogram take for the {p}, and is COD available?'],
    ['Wrong colour received', 'I ordered the {p} in black but got blue. Can I exchange it?'],
  ];
  const list = [];
  let n = 0;
  for (let day = 5; day <= 95; day++) {
    const base = t - day * D;
    const k = Math.floor(rnd() * 3);   // 0–2 emails a day
    for (let j = 0; j < k; j++) {
      const at = base - Math.floor(rnd() * 10) * H - Math.floor(rnd() * 60) * M;
      const id = 'EO-' + (++n);
      const mk = (box, subject, from, text, extra = {}) => list.push({ id, box, subject, folder: day > 30 ? 'archive' : 'inbox', unread: false, starred: false, assignee: '', notes: [],
        messages: [{ id: id + '-1', from, to: [box + '@'], cc: [], bcc: [], at, text, files: [], out: false, kind: 'new', replyTo: '', quote: null, ...extra }] });
      const kind = rnd();
      if (kind < 0.18) {
        const c = pick([['Steadfast Courier', 'payouts@steadfast.com.bd'], ['Pathao Courier', 'merchant@pathao.com'], ['RedX', 'payments@redx.com.bd']]);
        const amt = (18 + Math.floor(rnd() * 40)) * 1000 + Math.floor(rnd() * 900);
        mk('orders', 'COD payout of ৳' + amt.toLocaleString('en-IN') + ' sent', { name: c[0], email: c[1] }, 'Dear merchant,\n\nYour COD payout of ৳' + amt.toLocaleString('en-IN') + ' has been sent to your bank account. The statement is attached.\n\n' + c[0], { files: [{ name: 'payout-statement.csv', size: 18000 + Math.floor(rnd() * 9000) }] });
      } else if (kind < 0.3) {
        mk('info', 'bKash merchant settlement report', { name: 'bKash Merchant', email: 'merchant@bkash.com' }, 'Your daily settlement report is ready. Settled to your bank: ৳' + ((8 + Math.floor(rnd() * 30)) * 1000).toLocaleString('en-IN') + '.', { files: [{ name: 'settlement.pdf', size: 64000 }] });
      } else if (kind < 0.72) {
        const pp = pick(people), qq = pick(questions), pr = pick(products);
        const from = { name: pp[0], email: pp[1] + '@example.com' };
        const qb = rnd() < 0.5 ? 'info' : 'support';
        list.push({ id, box: qb, subject: qq[0].replace('{p}', pr), folder: day > 30 ? 'archive' : 'inbox', unread: false, starred: rnd() < 0.08, assignee: pick(['', 'Arafat Hossain', 'Lamia Sultana']), notes: [],
          messages: [
            { id: id + '-1', from, to: [qb + '@'], cc: [], bcc: [], at, text: qq[1].replace('{p}', pr) + '\n\n' + pp[0].split(' ')[0], files: [], out: false, kind: 'new', replyTo: '', quote: null },
            { id: id + '-2', from: { name: 'Lamia Sultana', email: '' }, to: [from.email], cc: [], bcc: [], at: at + (1 + Math.floor(rnd() * 5)) * H, text: 'Hi ' + pp[0].split(' ')[0] + ', thanks for writing. ' + pick(['Yes, it is in stock at all branches.', 'Our team will call you today with the details.', 'You can visit any branch with the box and receipt.', 'Delivery takes 2–3 days and COD is available.']) + '\n\nLamia, Dazzle Shop', files: [], out: true, by: 'Lamia Sultana', kind: 'reply', replyTo: id + '-1', quote: null },
          ] });
      } else if (kind < 0.85) {
        const no = 'SGD-' + (2100 + n);
        mk('info', 'Invoice ' + no + ' for your stock', { name: 'Smart Gadget Distribution', email: 'accounts@smartgadget.com.bd' }, 'Dear Sir,\n\nPlease find invoice ' + no + '. Payment terms 15 days.\n\nAccounts', { cc: ['rahim@smartgadget.com.bd'], files: [{ name: no + '.pdf', size: 210000 }] });
      } else {
        const notice = pick([['Google Merchant Center', 'no-reply@google.com', 'Weekly product status: all products approved'], ['Meta for Business', 'notification@facebookmail.com', 'Your catalog synced 214 products'], ['GridCommerce', 'hello@gridcommerce.net', 'Your monthly summary is ready']]);
        mk('info', notice[2], { name: notice[0], email: notice[1] }, notice[2] + '. Open your dashboard for the details.');
      }
    }
  }
  return list;
}

// ---- storage ------------------------------------------------------------------------------------------------------------------
let cache = { raw: undefined, db: null };
function save(db) {
  try { const raw = JSON.stringify(db); window.localStorage.setItem(KEY, raw); cache = { raw, db }; } catch { /* ignore */ }
}
export function read() {
  if (!isBrowser) return { v: 3, threads: [], seq: 0 };
  let raw = null;
  try { raw = window.localStorage.getItem(KEY); } catch { /* ignore */ }
  let db = raw && raw === cache.raw && cache.db ? cache.db : null;
  if (!db) {
    try { db = raw ? JSON.parse(raw) : null; } catch { db = null; }
    if (!db || db.v !== 3) { db = seed(Date.now()); save(db); } else cache = { raw, db };
  }
  // the other side's answer arrives once its time has come: it joins the thread and makes it unread
  const t = Date.now();
  if (db.threads.some((x) => x.pending && x.pending.at <= t)) {
    db = JSON.parse(JSON.stringify(db));
    db.threads.forEach((x) => {
      if (!x.pending || x.pending.at > t) return;
      const last = x.messages[x.messages.length - 1];
      const who = otherOf(x);
      x.messages.push({ id: 'em' + (++db.seq), from: who, to: [x.box + '@'], cc: x.pending.cc || [], bcc: [], at: x.pending.at, text: x.pending.text, files: [], out: false, kind: (x.pending.cc || []).length ? 'replyAll' : 'reply', replyTo: last.id, quote: null });
      x.unread = true; x.folder = 'inbox'; x.pending = null;
    });
    save(db);
    window.setTimeout(() => window.dispatchEvent(new CustomEvent(EVENT)), 0);
  }
  return db;
}
function change(fn) {
  const db = JSON.parse(JSON.stringify(read()));
  const res = fn(db, Date.now());
  if (res && res.ok === false) return res;
  save(db);
  window.dispatchEvent(new CustomEvent(EVENT));
  return res || { ok: true };
}
const withThread = (id, fn) => change((db, t) => { const th = db.threads.find((x) => x.id === id); if (!th) return { ok: false, error: 'This email is gone' }; return fn(th, t, db); });

// ---- reads -------------------------------------------------------------------------------------------------------------------
export const lastAt = (th) => th.messages[th.messages.length - 1].at;
export const lastOf = (th) => th.messages[th.messages.length - 1];
/** The person on the other side of the thread (the first sender who isn't the shop). */
export function otherOf(th) {
  const m = th.messages.find((x) => !x.out);
  if (m) return m.from;
  const first = th.messages[0] || {};
  const a = (first.to || [])[0] || '';
  return { name: a, email: a };
}
/** Everyone in the thread for the list row: "Kabir, Greenfield Accounts, me". */
export function peopleOf(th) {
  const full = [];
  th.messages.forEach((m) => { const n = m.out ? 'me' : String(m.from.name || m.from.email); if (!full.includes(n)) full.push(n); });
  // one person (with or without the shop): their full name; several: first names
  return full.filter((n) => n !== 'me').length > 1 ? full.map((n) => n.split(' ')[0]) : full;
}
export const getThreads = () => read().threads.slice().sort((a, b) => lastAt(b) - lastAt(a));
export const threadById = (id) => read().threads.find((x) => x.id === id) || null;
/** Unread threads in the Inbox folder: the menu's Email count. */
export const unreadEmail = () => read().threads.filter((x) => x.folder === 'inbox' && x.unread).length;
/** Order numbers written in the thread (#136771), so the reader can open them. */
export const ordersIn = (th) => [...new Set(th.messages.flatMap((m) => (String(th.subject) + ' ' + m.text).match(/#1\d{5}/g) || []))];

/**
 * Who a reply goes to, from the message it answers: reply → the sender (or, on the shop's own message, its To);
 * reply all → also everyone else on To and Cc, without the shop's own addresses. Forward → nobody yet.
 */
export function recipientsFor(th, msg, kind) {
  if (kind === 'forward') return { to: [], cc: [] };
  const from = msg.out ? (msg.to || []).filter((a) => !isShop(a)) : [msg.from.email].filter(Boolean);
  const to = from.length ? [from[0]] : [];
  if (kind !== 'replyAll') return { to, cc: [] };
  const rest = [...from.slice(1), ...(msg.to || []), ...(msg.cc || [])].filter((a) => !isShop(a) && !to.some((x) => x.toLowerCase() === a.toLowerCase()));
  return { to, cc: [...new Set(rest)] };
}
/** True when "Reply all" would reach more than one person. */
export const hasOthers = (th, msg) => recipientsFor(th, msg, 'replyAll').cc.length > 0;
export const subjectFor = (subject, kind) => (kind === 'forward' ? (/^fwd:/i.test(subject) ? subject : 'Fwd: ' + subject) : /^re:/i.test(subject) ? subject : 'Re: ' + subject);

// ---- changes -----------------------------------------------------------------------------------------------------------------
export const markRead = (id, isRead = true) => withThread(id, (th) => { th.unread = !isRead; });
export const star = (id) => withThread(id, (th) => { th.starred = !th.starred; });
export const moveTo = (id, folder) => withThread(id, (th) => { th.folder = folder; th.unread = false; });
export const assign = (id, who) => withThread(id, (th) => { th.assignee = who || ''; });
export function addNote(id, text, by) {
  const s = String(text || '').trim();
  if (!s) return { ok: false, error: 'Write the note first' };
  return withThread(id, (th, t) => { th.notes.push({ at: t, by, text: s }); });
}
function checkAddresses(to, cc, bcc) {
  const T = parseList(to), C = parseList(cc), B = parseList(bcc);
  const bad = [...T.bad, ...C.bad, ...B.bad];
  if (bad.length) return { ok: false, error: 'Check this address: ' + bad[0], field: T.bad.length ? 'to' : C.bad.length ? 'cc' : 'bcc' };
  if (!T.list.length) return { ok: false, error: 'Add at least one address in To', field: 'to' };
  if (T.list.length + C.list.length + B.list.length > 50) return { ok: false, error: 'An email can go to 50 people at most', field: 'to' };
  return { ok: true, to: T.list, cc: C.list, bcc: B.list };
}
/**
 * Reply, reply to all or forward inside the thread: { kind, replyTo (message id), to, cc, bcc (text lists), text, by }.
 * A forward carries the message it forwards as a quote.
 */
export function respond(id, { kind = 'reply', replyTo, to, cc, bcc, text, by }) {
  const s = String(text || '').trim();
  if (!s && kind !== 'forward') return { ok: false, error: 'Write the reply first', field: 'text' };
  const a = checkAddresses(to, cc, bcc);
  if (!a.ok) return a;
  return change((db, t) => {
    const th = db.threads.find((x) => x.id === id);
    if (!th) return { ok: false, error: 'This email is gone' };
    const target = th.messages.find((m) => m.id === replyTo) || th.messages[th.messages.length - 1];
    const quote = kind === 'forward' ? { from: target.out ? target.by + ' <' + showAddr(th.box + '@') + '>' : target.from.name + ' <' + target.from.email + '>', at: target.at, text: target.text, files: target.files || [] } : null;
    const firstReply = !th.messages.some((m) => m.out);
    th.messages.push({ id: 'em' + (++db.seq), from: { name: by, email: '' }, to: a.to, cc: a.cc, bcc: a.bcc, at: t, text: s, files: kind === 'forward' ? target.files || [] : [], out: true, by, kind, replyTo: target.id, quote });
    th.unread = false;
    if (th.folder === 'spam' || th.folder === 'trash') th.folder = 'inbox';
    if (!th.assignee) th.assignee = by;
    // demo: the other side writes back a little later (only to the shop's first reply, not to a forward)
    if (firstReply && th.answer && kind !== 'forward') { th.pending = { at: t + 45000, text: th.answer.text, cc: th.answer.cc || [] }; th.answer = null; }
    return { ok: true, to: a.to, cc: a.cc, bcc: a.bcc };
  });
}
/** A new email from one of the shop's addresses: a new thread in Sent. */
export function compose({ box, to, cc, bcc, subject, text, by }) {
  const a = checkAddresses(to, cc, bcc);
  if (!a.ok) return a;
  if (!String(subject || '').trim()) return { ok: false, error: 'Add a subject', field: 'subject' };
  if (!String(text || '').trim()) return { ok: false, error: 'Write the message', field: 'text' };
  return change((db, t) => {
    const id = 'ET-' + (++db.seq);
    db.threads.push({ id, box, subject: String(subject).trim(), folder: 'sent', unread: false, starred: false, assignee: by, notes: [],
      messages: [{ id: 'em' + (++db.seq), from: { name: by, email: '' }, to: a.to, cc: a.cc, bcc: a.bcc, at: t, text: String(text).trim(), files: [], out: true, by, kind: 'new', replyTo: '', quote: null }] });
    return { ok: true, id };
  });
}
