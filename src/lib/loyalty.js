// loyalty — members, their points, customer wallets and "invite a friend" rewards, and what they
// mean for the books.
//
//   Points    a promise of a discount. Points customers hold × the value of a point (settings) is
//             money the shop owes them until the points are used or expire (pointsLiability). Points
//             used at checkout are a discount on that sale: the POS already takes them off the bill
//             (sale.totals.pointsDisc); profit.js shows them as the channel cost "Loyalty points used".
//   Wallet    money the shop holds for customers (walletLiability): a top-up brings money into one of
//             the shop's accounts (ledger 'wallet top-up', +), paying a balance back takes it out
//             (ledger 'wallet refund', −), spending it on an order moves no money (the liability just
//             goes down). Credit given free (sorry gift, reward, referral credit) moves no money but is
//             a cost of the channel: "Rewards and referral credit" (loyaltyCosts).
//   Referrals a friend's first order earns the customer who invited them a reward. Paid into the
//             wallet it is reward credit (above); paid in cash / bKash / bank it leaves that account
//             (ledger 'referral reward', −). Either way it is a cost of the Online channel.
//
// Nayeem's brief #9 (Oct 2026):
//   Store credit  the wallet is store credit now: issued (return, goodwill, loyalty, referral, promotion, by hand),
//             used on an order, expired, reversed or corrected — never topped up or paid out in cash. The old
//             wallet rows stay readable (top-up / paid back show as they were). storeCredit.js is its API.
//   Members   a member is a CRM customer with a loyalty account: each row carries customerId (customerRef.js:
//             the CRM ID when Customers & CRM has one, else the phone key) and inCrm.
//   Levels    tierHistory(phone): when a member moved between Member, Silver, Gold and Platinum, and why;
//             checkTiers() records a move when it happens (and sends the "new level" message).
//   Referrals a reward waits (pending) until the friend's order is past the return period; a returned order
//             cancels it, or reverses it when already given; monthly and total caps; self-referral checks
//             (same phone blocks; same address or device goes to review). checkReferral() / recordReferral().
//   Messages  loyalty never sends by itself: notifyMember() hands the message to Communications (messaging.js),
//             which checks consent, suppression, quiet hours and caps.
// Points earned and used at the POS register are read from its sales (POS_KEYS.sales), so they
// show here without being saved twice; every points change made here is written back to the
// register's points store (POS_KEYS.points) so the counter sees the same balance.
// Front end only: the demo history (Aug–Sep 2026) lives here; changes are kept in this browser.

import { POS_KEYS, load as loadPos, save as savePos } from './posStore';
import { postEntry, accountBy } from './ledger';
import { getReturns } from './returns';
import { getCustomers, saveCustomerOnce } from './customers';
import { customerKey } from './customerRef';
import { send as sendMessage } from './messaging';

const KEYS = {
  settings: 'gc.loyalty.settings', members: 'gc.loyalty.members', points: 'gc.loyalty.points', wallet: 'gc.loyalty.wallet',
  requests: 'gc.loyalty.requests', referrals: 'gc.loyalty.referrals', products: 'gc.loyalty.productPoints',
  tiers: 'gc.loyalty.tierlog', refAdded: 'gc.loyalty.refAdded', tierSet: 'gc.loyalty.tierSet',
};
const CREDIT_KEY = 'gc.customer.credit';   // advances kept on invoices (invoices.js): phone -> balance

const isBrowser = typeof window !== 'undefined';
const read = (key, fallback) => { if (!isBrowser) return fallback; try { return JSON.parse(window.localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => { try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ } };
const changed = () => { try { window.dispatchEvent(new CustomEvent('gc:loyalty')); } catch { /* ignore */ } };
const r2 = (n) => Math.round(n * 100) / 100;
export const phoneKey = (p) => String(p || '').replace(/[^0-9]/g, '').replace(/^88/, '');
const uid = (p) => p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const at = (y, m, d, h = 12, min = 0) => new Date(y, m - 1, d, h, min).getTime();
const sep = (d, h, min) => at(2026, 9, d, h, min);
const aug = (d, h, min) => at(2026, 8, d, h, min);
export const CHANNELS = ['Online', 'Retail', 'Wholesale'];

// ---- settings -----------------------------------------------------------------------------------
export const TIER_TONE = { member: 'slate', silver: 'info', gold: 'warning', plat: 'primary' };
export const DEFAULT_SETTINGS = {
  earnPer100: 1,        // points for every ৳100 spent (before the level multiplier)
  pointValue: 0.5,      // ৳ one point takes off a bill (the POS register uses ৳0.50 too)
  minUse: 50,           // points a customer must hold before using them
  maxPct: 20,           // points can pay up to this % of a bill
  welcome: 50,          // points on the first delivered order
  birthday: 100,        // points on the birthday
  expireOn: false,      // unused points expire
  expiryMonths: 12,
  referral: { kind: 'comm', pct: 5, points: 100, friendPoints: 100, pendingDays: 7, capMonth: 5, capTotal: 50 },   // comm: % of the friend's first order in ৳; points: points each
  // pendingDays: the reward waits this long after the friend's order is delivered (the return period);
  // capMonth / capTotal: most rewards one customer can earn in a month / ever (0 = no cap)
  creditExpiryMonths: 0,   // store credit expires after this many months (0 = never)
  messages: { tier: true, credit: true, referral: true, birthday: true, expiring: true },   // loyalty messages (sent by Communications)
  on: { points: true, wallet: true, referral: true, pos: true },
  tiers: [
    { k: 'member', name: 'Member', min: 0, mult: 1, pct: 0 },
    { k: 'silver', name: 'Silver', min: 10000, mult: 1.25, pct: 2 },
    { k: 'gold', name: 'Gold', min: 50000, mult: 1.5, pct: 5 },
    { k: 'plat', name: 'Platinum', min: 150000, mult: 2, pct: 8 },
  ],
};
export function getLoyaltySettings() {
  const s = read(KEYS.settings, {});
  return { ...DEFAULT_SETTINGS, ...s, referral: { ...DEFAULT_SETTINGS.referral, ...(s.referral || {}) }, on: { ...DEFAULT_SETTINGS.on, ...(s.on || {}) }, messages: { ...DEFAULT_SETTINGS.messages, ...(s.messages || {}) }, tiers: s.tiers || DEFAULT_SETTINGS.tiers };
}
export function saveLoyaltySettings(next) { write(KEYS.settings, next); changed(); }
export const pointValue = () => getLoyaltySettings().pointValue;
/** The level a customer is at for a total bought. */
export function tierFor(bought, tiers = getLoyaltySettings().tiers) {
  return [...tiers].sort((a, b) => b.min - a.min).find((t) => bought >= t.min) || tiers[0];
}

// ---- members (demo) -----------------------------------------------------------------------------
// open: points held before the history below starts (dated openAt); usedBefore: points used before
// it (for "Used" / "Earned" totals). bought: everything bought before the POS sales in this browser.
const MEMBER_SEED = [
  { phone: '01711245518', name: 'Farzana Akter', joined: at(2024, 3, 2), bought: 186400, open: 5806, usedBefore: 0, openAt: at(2025, 12, 5), last: sep(21), code: 'FARZANA10', birthday: '14 Mar' },
  { phone: '01819072332', name: 'Rakibul Hasan', joined: at(2024, 11, 18), bought: 72850, open: 2307, usedBefore: 400, openAt: at(2025, 10, 20), last: sep(16), code: 'RAKIB250', birthday: '11 Aug' },
  { phone: '01711902244', name: 'Mostafizur Rahman', joined: at(2025, 1, 9), bought: 164300, open: 1096, usedBefore: 880, openAt: at(2026, 2, 1), last: sep(14), code: 'MOSTAFIZ8', birthday: '2 Jan' },
  { phone: '01914622045', name: 'Tanvir Ahmed', joined: at(2025, 4, 22), bought: 24300, open: 699, usedBefore: 150, openAt: at(2026, 1, 10), last: sep(15), code: 'TANVIR7', birthday: '30 Nov' },
  { phone: '01811843300', name: 'Shirin Akter', joined: at(2025, 6, 3), bought: 61200, open: 288, usedBefore: 500, openAt: at(2026, 4, 12), last: sep(25), code: 'SHIRIN12', birthday: '19 Jun' },
  { phone: '01678492281', name: 'Sharmin Sultana', joined: at(2025, 8, 14), bought: 13900, open: 364, usedBefore: 50, openAt: at(2026, 3, 3), last: sep(2), code: 'SHARMIN5', birthday: '8 Feb' },
  { phone: '01553336655', name: 'Nusrat Jahan', joined: at(2025, 9, 1), bought: 21800, open: 106, usedBefore: 200, openAt: at(2026, 5, 20), last: sep(21), code: 'NUSRAT22', birthday: '25 Dec' },
  { phone: '01733808614', name: 'Mahmudul Islam', joined: sep(18, 11, 10), bought: 4650, open: 0, usedBefore: 0, openAt: sep(18), last: sep(18), code: 'MAHMUD3', birthday: '' },
  { phone: '01511537770', name: 'Sabrina Chowdhury', joined: sep(2, 9, 30), bought: 2980, open: 8, usedBefore: 0, openAt: sep(2), last: aug(28), code: 'SABRINA4', birthday: '' },
  { phone: '01890226153', name: 'Arif Rahman', joined: at(2026, 7, 30), bought: 1250, open: 0, usedBefore: 0, openAt: aug(1), last: aug(9), code: 'ARIF1', birthday: '' },
];

// points history (demo). points + / −; value = ৳ taken off a bill when points were used.
// onBill: false = points used without a bill (changed to wallet money): not a discount inside a sale.
const P = (phone, time, kind, points, what, sub, channel, ref, value, extra = {}) => ({ id: 'LP-' + phone.slice(-4) + '-' + time, phone, at: time, kind, points, what, sub, channel, ref: ref || '', ...(value != null ? { value } : {}), by: 'System', ...extra });
const POINTS_SEED = [
  P('01819072332', at(2026, 7, 20), 'earn', 233, 'Order #GC-10044 delivered', '৳18,650 × Silver 1.25x', 'Online', '#GC-10044'),
  P('01819072332', aug(3, 15), 'redeem', -370, 'Used on the website', 'Order #GC-10150', 'Online', '#GC-10150', 185),
  P('01819072332', aug(11, 9), 'birthday', 100, 'Birthday gift', 'Automatic', 'Online'),
  P('01819072332', aug(14, 17), 'return', -45, 'Order #GC-10207 returned', 'Points taken back', 'Online', '#GC-10207'),
  P('01819072332', aug(28, 19), 'earn', 192, 'Order #GC-10311 delivered', '৳12,800 × Gold 1.5x', 'Online', '#GC-10311'),
  P('01819072332', sep(2, 18), 'referral', 100, 'Friend’s first order', 'Invited Sabrina Chowdhury', 'Online', 'RF-0101'),
  P('01819072332', sep(10, 13), 'redeem', -300, 'Used at Dhanmondi branch', 'POS bill ৳3,450', 'Retail', 'Memo #0988', 150),
  P('01819072332', sep(16, 20), 'earn', 93, 'Order #GC-10482 delivered', '৳6,200 × Gold 1.5x', 'Online', '#GC-10482'),
  P('01711245518', sep(4, 16), 'earn', 186, 'Order #GC-10431 delivered', '৳9,300 × Platinum 2x', 'Online', '#GC-10431'),
  P('01711245518', sep(10, 17, 48), 'redeem', -1000, 'Changed points to wallet money', '৳500 added to the wallet', 'Online', 'WL-points', 500, { onBill: false }),
  P('01711245518', sep(17, 12), 'redeem', -420, 'Used at Gulshan-1 branch', 'POS bill ৳5,860', 'Retail', 'Memo #1012', 210),
  P('01711245518', sep(21, 19), 'earn', 248, 'Order #GC-10501 delivered', '৳12,400 × Platinum 2x', 'Online', '#GC-10501'),
  P('01914622045', sep(8, 14), 'redeem', -120, 'Used on the website', 'Order #GC-10447', 'Online', '#GC-10447', 60),
  P('01914622045', sep(15, 18), 'earn', 61, 'Order #GC-10490 delivered', '৳4,900 × Silver 1.25x', 'Online', '#GC-10490'),
  P('01678492281', sep(2, 12), 'earn', 21, 'Order #GC-10420 delivered', '৳1,720 × Silver 1.25x', 'Online', '#GC-10420'),
  P('01733808614', sep(18, 11, 20), 'welcome', 50, 'Welcome gift', 'First order delivered', 'Online', '#GC-10508'),
  P('01733808614', sep(18, 11, 21), 'earn', 42, 'Order #GC-10508 delivered', '৳4,650 × Member 1x', 'Online', '#GC-10508'),
  P('01511537770', sep(2, 18, 5), 'referral', 100, 'Welcome points', 'Invited by Rakibul Hasan', 'Online', 'RF-0101'),
  P('01511537770', sep(12, 16), 'redeem', -50, 'Used on the website', 'Order #GC-10463', 'Online', '#GC-10463', 25),
  P('01890226153', aug(9, 13), 'earn', 12, 'Order #GC-10188 delivered', '৳1,250 × Member 1x', 'Online', '#GC-10188'),
  P('01890226153', aug(22, 11), 'redeem', -12, 'Used on the website', 'Order #GC-10266', 'Online', '#GC-10266', 6),
  P('01553336655', sep(12, 17), 'earn', 34, 'Bought at Dhanmondi branch', 'POS bill ৳3,420', 'Retail', 'Memo #0995'),
  P('01553336655', sep(21, 20), 'redeem', -60, 'Used on the website', 'Order #GC-10499', 'Online', '#GC-10499', 30),
  P('01811843300', sep(19, 15), 'earn', 52, 'Order #GC-10512 delivered', '৳5,200 × Member 1x', 'Online', '#GC-10512'),
  P('01811843300', sep(25, 18), 'redeem', -100, 'Used at Dhanmondi branch', 'POS bill ৳2,180', 'Retail', 'Memo #1040', 50),
  P('01711902244', sep(14, 19), 'earn', 164, 'Bought at Dhanmondi branch', 'POS bill ৳16,400', 'Retail', 'Memo #1003'),
];

// wallet history (demo). amount + in / − out. kind: top-up · spend · refund · reward · points · return
// The demo top-ups and pay-backs that moved money are in the ledger demo month (ledgerSeed.js, ids in
// `ledger`); nothing here posts them again — only new ones made in this browser are posted.
const W = (phone, time, kind, amount, what, sub, extra = {}) => ({ id: 'LW-' + phone.slice(-4) + '-' + time, phone, at: time, kind, amount, what, sub, channel: 'Online', by: 'Shanto', ...extra });
const WALLET_SEED = [
  W('01711245518', sep(2, 10, 15), 'top-up', 2500, 'Added money by bKash', 'TrxID 8QZ4LT2WAK', { account: 'bkash', method: 'bKash', ref: '8QZ4LT2WAK', ledger: 'LS-W01' }),
  W('01711245518', sep(10, 17, 48), 'points', 500, 'Changed 1,000 points to money', 'At ৳0.50 a point', { ref: 'WL-points' }),
  W('01711245518', sep(21, 19, 5), 'spend', -1200, 'Paid for order #GC-10501', 'From wallet', { ref: '#GC-10501' }),
  W('01819072332', aug(30, 12, 10), 'return', 750, 'Refund for returned item', 'Order #GC-10207', { ref: '#GC-10207' }),
  W('01819072332', sep(12, 13, 5), 'top-up', 2000, 'Added money by bKash', 'TrxID 9HX2K7QP1M · approved by Shanto', { account: 'bkash', method: 'bKash', ref: '9HX2K7QP1M', ledger: 'LS-W02' }),
  W('01819072332', sep(15, 14, 20), 'spend', -1500, 'Paid for order #GC-10482', 'From wallet', { ref: '#GC-10482' }),
  W('01914622045', sep(5, 11, 40), 'top-up', 1000, 'Added money by Nagad', 'TrxID 71KD02MZ', { account: 'nagad', method: 'Nagad', ref: '71KD02MZ', ledger: 'LS-W03' }),
  W('01553336655', sep(8, 16), 'reward', 300, 'Sorry gift', 'Late delivery of #GC-10441', { ref: '#GC-10441' }),
  W('01678492281', sep(3, 12, 30), 'return', 800, 'Refund for returned item', 'Order #GC-10266', { ref: '#GC-10266' }),
  W('01733808614', sep(9, 20, 10), 'top-up', 1000, 'Added money by bKash', 'TrxID 5RB8QW3NXE', { account: 'bkash', method: 'bKash', ref: '5RB8QW3NXE', ledger: 'LS-W04' }),
  W('01733808614', sep(14, 18), 'spend', -550, 'Paid for order #GC-10470', 'From wallet', { ref: '#GC-10470' }),
  W('01511537770', aug(30, 12, 10), 'return', 750, 'Refund for returned item', 'Order #GC-10198', { ref: '#GC-10198' }),
  W('01890226153', aug(20, 10), 'top-up', 600, 'Added money by Nagad', 'TrxID 3NQ7HD82', { account: 'nagad', method: 'Nagad', ref: '3NQ7HD82', ledger: 'LS-W05' }),
  W('01890226153', aug(27, 19, 30), 'refund', -600, 'Paid back by Nagad', 'Cash-out sent to 01890-226153', { account: 'nagad', method: 'Nagad', ledger: 'LS-W06' }),
];
export const WALLET_KIND = { 'top-up': 'Top-up', spend: 'Paid for an order', refund: 'Paid back', reward: 'Reward credit', points: 'From points', return: 'Return credit', adjust: 'Correction',
  issue: 'Credit added', redeem: 'Used', expire: 'Expired', reverse: 'Reversed' };

// add-money and cash-out requests customers sent from the website or app (demo)
const REQUEST_SEED = [
  { id: 'RQ-0031', type: 'in', phone: '01711245518', method: 'bKash', ref: '9KT3M2QX7A', refSub: 'Sent from 01711-245518', amount: 5000, at: sep(30, 11, 42), status: 'waiting' },
  { id: 'RQ-0030', type: 'in', phone: '01914622045', method: 'Nagad', ref: '73HD91KZ', refSub: 'Screenshot attached', amount: 1500, at: sep(30, 10, 5), status: 'waiting' },
  { id: 'RQ-0029', type: 'in', phone: '01553336655', method: 'Bank', ref: 'DBBL-448120', refSub: 'Dutch-Bangla Bank deposit', amount: 1000, at: sep(29, 18, 18), status: 'waiting' },
  { id: 'RQ-0028', type: 'out', phone: '01678492281', method: 'bKash', ref: '01678-492281', refSub: 'Send to this bKash', amount: 800, at: sep(29, 16, 40), status: 'waiting' },
  { id: 'RQ-0027', type: 'out', phone: '01733808614', method: 'Nagad', ref: '01733-808614', refSub: 'Send to this Nagad', amount: 450, at: sep(28, 21, 12), status: 'waiting' },
];
/** The shop account a request's money usually comes into / goes out of. */
export const accountForRequest = (method) => ({ bkash: 'bkash', nagad: 'nagad', rocket: 'rocket', bank: 'dbbl', cash: 'cash-shop' }[String(method || '').toLowerCase()] || 'bkash');

// ---- referrals (demo) ---------------------------------------------------------------------------
// before: totals from before September (friends joined, friends who bought, their sales, rewards given).
const REFERRER_SEED = [
  { phone: '01711245518', code: 'FARZANA10', before: { joined: 20, bought: 16, sales: 64000, earned: 4320 } },
  { phone: '01819072332', code: 'RAKIB250', before: { joined: 14, bought: 10, sales: 38450, earned: 1970 } },
  { phone: '01553336655', code: 'NUSRAT22', before: { joined: 10, bought: 9, sales: 32800, earned: 1640 } },
  { phone: '01914622045', code: 'TANVIR7', before: { joined: 7, bought: 4, sales: 12700, earned: 635 } },
  { phone: '01678492281', code: 'SHARMIN5', before: { joined: 6, bought: 4, sales: 12450, earned: 620 } },
];
// each friend who joined with a code in September. reward ৳ (0 = nothing yet); status due · given · waiting
// friendPhone / address / device: what the friend signed up with (for the self-referral check)
const RF = (id, referrer, friend, joined, order, amount, reward, status, extra = {}) => ({ id, referrer, friend, joinedAt: joined, order: order ? { ref: order, amount, at: joined + 3 * 864e5, deliveredAt: joined + 5 * 864e5 } : null, reward, status, channel: 'Online', ...extra });
const REFERRAL_SEED = [
  RF('RF-0101', '01819072332', 'Sabrina Chowdhury', sep(2, 9, 30), '#GC-10421', 2980, 50, 'given', { how: 'points', points: 100, givenAt: sep(2, 18) }),
  RF('RF-0102', '01711245518', 'Sadia Islam', sep(6, 11), '#GC-10466', 9800, 490, 'due'),
  RF('RF-0103', '01711245518', 'Rumana Khatun', sep(11, 15), '#GC-10489', 7200, 360, 'due'),
  RF('RF-0104', '01819072332', 'Imran Hossain', sep(13, 10), '#GC-10477', 12800, 640, 'due'),
  RF('RF-0105', '01914622045', 'Shakil Ahmed', sep(14, 17), '#GC-10493', 6200, 310, 'due'),
  RF('RF-0106', '01711245518', 'Jannatul Ferdous', sep(18, 12), '#GC-10515', 5400, 270, 'due'),
  RF('RF-0107', '01553336655', 'Tahmina Akter', sep(9, 19), '#GC-10458', 4600, 230, 'given', { how: 'wallet', givenAt: sep(15, 12) }),
  RF('RF-0108', '01711245518', 'Fahim Chowdhury', sep(26, 20), null, 0, 0, 'waiting'),
  RF('RF-0109', '01819072332', 'Nadia Rahman', sep(28, 14), null, 0, 0, 'waiting'),
  RF('RF-0110', '01711245518', 'Nasrin Akter', sep(20, 10), '#GC-10521', 3600, 180, 'due', { friendPhone: '01712004411', address: 'House 12, Road 5, Gulshan-1, Dhaka', device: 'dev-7f21' }),
  RF('RF-0111', '01553336655', 'Kamrul Hasan', sep(16, 18), '#GC-10497', 5200, 260, 'due', { returnedAt: sep(24, 15) }),
  RF('RF-0112', '01819072332', 'Mim Akter', sep(26, 12), '#GC-10560', 4400, 220, 'due'),
];
// where each customer who shares a code lives and signs in from (demo; for the self-referral check)
const REFERRER_ID = { '01711245518': { address: 'House 12, Road 5, Gulshan-1, Dhaka', device: 'dev-7f21' }, '01819072332': { address: 'Flat 4B, Road 11, Banani, Dhaka', device: 'dev-21aa' }, '01553336655': { address: 'House 14, Road 7, Sector 4, Uttara, Dhaka', device: 'dev-9c03' }, '01914622045': { address: 'Mirpur 10, Dhaka', device: 'dev-4410' }, '01678492281': { address: 'Dhanmondi 27, Dhaka', device: 'dev-0b77' } };
// the wallet credit behind RF-0107 (given into Nusrat's wallet)
WALLET_SEED.push(W('01553336655', sep(15, 12), 'reward', 230, 'Invite reward', 'Tahmina Akter’s first order #GC-10458', { ref: 'RF-0107', src: 'referral' }));

// ---- product points (demo) ----------------------------------------------------------------------
export const PRODUCT_MODES = [['normal', 'Normal'], ['double', 'Double'], ['off', 'Off']];
const PRODUCT_SEED = { 'SK-SUN-50': 'double', 'CL-JNS-32': 'double', 'GR-RICE-5': 'off', 'GR-SOY-2': 'off' };
export const getProductPoints = () => ({ ...PRODUCT_SEED, ...read(KEYS.products, {}) });
export function setProductPoints(map) { const all = { ...getProductPoints(), ...map }; write(KEYS.products, all); changed(); return all; }
/** Points one piece of a product gives a customer at level `tier` (object from settings). */
export function pointsForProduct(sku, price, tier, s = getLoyaltySettings(), modes = getProductPoints()) {
  const mode = modes[sku] || 'normal';
  if (mode === 'off') return 0;
  return Math.floor(Math.floor((price || 0) / 100) * s.earnPer100 * (tier ? tier.mult : 1) * (mode === 'double' ? 2 : 1));
}

/**
 * Points a sale earns: each item's amount after discounts (items: [{ sku, amount }]) × its product
 * setting (Off 0, Normal 1, Double 2), ÷ 100 × the earn rate × the member's level multiplier.
 */
export function pointsForSale(items, tier, s = getLoyaltySettings(), modes = getProductPoints()) {
  const base = (items || []).reduce((a, it) => { const m = modes[it.sku] || 'normal'; return a + (it.amount || 0) * (m === 'off' ? 0 : m === 'double' ? 2 : 1); }, 0);
  return Math.max(0, Math.floor((base / 100) * s.earnPer100 * (tier ? tier.mult : 1)));
}

// ---- reading the books --------------------------------------------------------------------------
const storedMembers = () => read(KEYS.members, []);
const storedPoints = () => read(KEYS.points, []);
const storedWallet = () => read(KEYS.wallet, []);
const posSales = () => (isBrowser ? loadPos(POS_KEYS.sales, []) : []);

/** Points earned and used at the POS register, from its sales. */
function posPointEntries(sales = posSales()) {
  const out = [];
  sales.forEach((s) => {
    const m = s.member;
    if (!m || !m.phone) return;
    const t = s.totals || {};
    const channel = s.wholesale ? 'Wholesale' : 'Retail';
    if (t.pointsUsed) out.push({ id: s.id + '-PU', phone: phoneKey(m.phone), at: s.at, kind: 'redeem', points: -t.pointsUsed, value: r2(t.pointsDisc || 0), what: 'Used at ' + (s.counter || 'the POS'), sub: 'POS bill ' + '৳' + Math.round(t.total || 0).toLocaleString('en-IN'), channel, ref: s.id, by: s.cashier || 'POS', pos: true });
    if (s.earned) out.push({ id: s.id + '-PE', phone: phoneKey(m.phone), at: s.at + 1, kind: 'earn', points: s.earned, what: 'Bought at ' + (s.counter || 'the POS'), sub: 'POS bill ' + '৳' + Math.round(t.total || 0).toLocaleString('en-IN'), channel, ref: s.id, by: s.cashier || 'POS', pos: true });
  });
  return out;
}
/** Store credit given on returns (Return & exchange) — money kept in the customer's wallet. */
function returnCreditEntries() {
  if (!isBrowser) return [];
  return getReturns().filter((r) => r.method === 'Store credit' && r.phone && r.amount > 0)
    .map((r) => ({ id: 'RC-' + r.id, phone: phoneKey(r.phone), at: r.at, kind: 'return', amount: r.amount, what: 'Store credit for a return', sub: r.ref + (r.items ? ' · ' + r.items : ''), channel: r.channel || 'Retail', ref: r.ref, by: r.by || '' }));
}

/** Every points entry, newest first. */
export const getPointEntries = () => [...storedPoints(), ...posPointEntries(), ...POINTS_SEED].sort((a, b) => b.at - a.at);
/** Every wallet entry, newest first. */
export const getWalletEntries = () => [...storedWallet(), ...returnCreditEntries(), ...WALLET_SEED].sort((a, b) => b.at - a.at);

/**
 * Every member with their numbers:
 * { phone, name, joined, code, birthday, points, value, earned, used, wallet, bought, last, tier, tierObj, expiring }
 * Members come from the demo list, members added here, and anyone with points or wallet history.
 */
export function getMembers({ points = getPointEntries(), wallet = getWalletEntries(), s = getLoyaltySettings(), now = Date.now() } = {}) {
  const base = new Map();
  [...storedMembers(), ...MEMBER_SEED].forEach((m) => { if (!base.has(m.phone)) base.set(m.phone, m); });
  const names = {};
  posSales().forEach((sale) => { if (sale.member && sale.member.phone) names[phoneKey(sale.member.phone)] = sale.member.name; });
  [...points, ...wallet].forEach((e) => { if (!base.has(e.phone)) base.set(e.phone, { phone: e.phone, name: names[e.phone] || 'Customer · ' + e.phone, joined: e.at, bought: 0, open: 0, usedBefore: 0, openAt: e.at, last: e.at, code: '', birthday: '' }); });
  // POS sales of members: what they bought and when they last came
  const posBought = {}, posLast = {};
  posSales().forEach((sale) => { const p = sale.member && phoneKey(sale.member.phone); if (!p) return; posBought[p] = (posBought[p] || 0) + ((sale.totals || {}).total || 0); posLast[p] = Math.max(posLast[p] || 0, sale.at); });
  const cutoff = s.expireOn ? addMonths(now, -(s.expiryMonths - 1)) : 0;   // points earned before this expire within a month
  const crm = new Set(getCustomers().map((c) => c.phone));
  const tierSet = read(KEYS.tierSet, {});
  return [...base.values()].map((m) => {
    const mine = points.filter((e) => e.phone === m.phone);
    const plus = mine.filter((e) => e.points > 0).reduce((a, e) => a + e.points, 0);
    const minus = mine.filter((e) => e.points < 0).reduce((a, e) => a - e.points, 0);
    const balance = Math.max(0, (m.open || 0) + plus - minus);
    const walletBal = r2(wallet.filter((e) => e.phone === m.phone).reduce((a, e) => a + e.amount, 0));
    const bought = r2((m.bought || 0) + (posBought[m.phone] || 0));
    const setTo = (tierSet[m.phone] || {}).tier || m.tier;
    const tierObj = setTo ? s.tiers.find((t) => t.k === setTo) || tierFor(bought, s.tiers) : tierFor(bought, s.tiers);
    // first in, first out: points earned before the cutoff and not used yet expire soon
    let expiring = 0;
    if (s.expireOn) {
      const old = (m.openAt < cutoff ? m.open || 0 : 0) + mine.filter((e) => e.points > 0 && e.at < cutoff).reduce((a, e) => a + e.points, 0);
      expiring = Math.max(0, Math.min(balance, old - minus));
    }
    const lastEarn = mine.filter((e) => e.kind === 'earn' || e.kind === 'redeem').reduce((a, e) => Math.max(a, e.at), 0);
    return {
      phone: m.phone, name: m.name, joined: m.joined, code: m.code || '', birthday: m.birthday || '', added: !!m.added,
      customerId: m.customerId || customerKey({ phone: m.phone }), inCrm: crm.has(m.phone),
      points: balance, value: r2(balance * s.pointValue), earned: (m.open || 0) + (m.usedBefore || 0) + plus, used: (m.usedBefore || 0) + minus,
      wallet: walletBal, bought, last: Math.max(m.last || 0, posLast[m.phone] || 0, lastEarn), tier: tierObj.k, tierObj, expiring,
    };
  }).sort((a, b) => b.points - a.points);
}
export const findMember = (phone, list = getMembers()) => list.find((m) => m.phone === phoneKey(phone)) || null;
export const memberName = (phone) => { const m = findMember(phone); return m ? m.name : phone; };
function addMonths(t, n) { const d = new Date(t); d.setMonth(d.getMonth() + n); return d.getTime(); }

/** Add a member by mobile number (name optional). Returns the member row, or null for a bad number. */
export function addMember({ name, phone }) {
  const p = phoneKey(phone);
  if (!/^01[3-9]\d{8}$/.test(p)) return null;
  if (findMember(p)) return findMember(p);
  const row = { phone: p, name: String(name || '').trim() || 'Customer · ' + p, joined: Date.now(), bought: 0, open: 0, usedBefore: 0, openAt: Date.now(), last: 0, code: '', birthday: '', added: true };
  // a member is a CRM customer with a loyalty account: the customer book gets them too (once, by phone)
  const crm = saveCustomerOnce({ name: row.name, phone: p, types: ['Online'], addedFrom: 'Loyalty' });
  if (crm && crm.id) row.customerId = crm.id;
  write(KEYS.members, [row, ...storedMembers()]);
  changed();
  return row;
}

/** A member's points and wallet history, newest first, each with the balance after it. */
export function memberHistory(phone) {
  const p = phoneKey(phone);
  const m = findMember(p);
  if (!m) return { points: [], wallet: [] };
  const withAfter = (list, bal, field) => { let cur = bal; return list.map((e) => { const row = { ...e, after: cur }; cur = r2(cur - e[field]); return row; }); };
  return {
    points: withAfter(getPointEntries().filter((e) => e.phone === p), m.points, 'points'),
    wallet: withAfter(getWalletEntries().filter((e) => e.phone === p), m.wallet, 'amount'),
  };
}

// ---- points -------------------------------------------------------------------------------------
/** Write a member's balance into the POS register's points store, so the counter sees the same. */
export function syncPosPoints(phone) { syncPos(phone); }
function syncPos(phone) {
  const m = findMember(phone);
  if (!m) return;
  const store = loadPos(POS_KEYS.points, {});
  store[m.phone] = m.points;
  savePos(POS_KEYS.points, store);
}
/**
 * Give (+) or take (−) points by hand, with a reason. Returns the entry, or { error }.
 * A gift is a promise of a discount (it adds to the points customers hold); it costs the shop when used.
 */
export function adjustPoints({ phone, points, reason, note, by = 'Shanto' }) {
  const m = findMember(phone);
  const n = Math.round(Number(points) || 0);
  if (!m) return { error: 'No member with this number' };
  if (!n) return { error: 'Enter the number of points' };
  if (n < 0 && -n > m.points) return { error: `${m.name} has only ${m.points.toLocaleString('en-IN')} points` };
  const row = { id: uid('LP'), phone: m.phone, at: Date.now(), kind: 'adjust', points: n, what: (n > 0 ? 'Gift from the shop' : 'Taken by the shop') + ' — ' + reason, sub: note ? note + ' · by ' + by : 'By ' + by, channel: 'Online', ref: '', by };
  write(KEYS.points, [row, ...storedPoints()]);
  syncPos(m.phone);
  changed();
  return row;
}
/** Remove points older than the expiry period that were never used. Returns { points, value, members }. */
export function expirePoints(now = Date.now()) {
  const s = getLoyaltySettings();
  if (!s.expireOn) return { points: 0, value: 0, members: 0 };
  const cutoff = addMonths(now, -s.expiryMonths);
  const points = getPointEntries();
  const rows = [];
  getMembers({ points, s, now }).forEach((m) => {
    const base = [...storedMembers(), ...MEMBER_SEED].find((x) => x.phone === m.phone) || {};
    const mine = points.filter((e) => e.phone === m.phone);
    const old = (base.openAt < cutoff ? base.open || 0 : 0) + mine.filter((e) => e.points > 0 && e.at < cutoff).reduce((a, e) => a + e.points, 0);
    const gone = mine.filter((e) => e.points < 0).reduce((a, e) => a - e.points, 0);
    const n = Math.min(m.points, Math.max(0, old - gone));
    if (n > 0) rows.push({ id: uid('LP'), phone: m.phone, at: now, kind: 'expire', points: -n, what: 'Points expired', sub: `Not used within ${s.expiryMonths} months`, channel: 'Online', ref: '', by: 'System' });
  });
  if (!rows.length) return { points: 0, value: 0, members: 0 };
  write(KEYS.points, [...rows, ...storedPoints()]);
  rows.forEach((r) => syncPos(r.phone));
  changed();
  const total = rows.reduce((a, r) => a - r.points, 0);
  return { points: total, value: r2(total * s.pointValue), members: rows.length };
}

// ---- wallet -------------------------------------------------------------------------------------
function addWallet(row) { write(KEYS.wallet, [row, ...storedWallet()]); changed(); return row; }
/** Write one store credit row (storeCredit.js uses this; nothing else should). */
export const addCreditRow = (row) => addWallet({ id: uid('LW'), at: Date.now(), channel: 'Online', by: 'Shanto', ...row });
const partyOf = (m) => `${m.name} · ${m.phone}`;
/** Money a customer gives the shop to keep: it lands in `account` (ledger 'wallet top-up', +). */
export function topUpWallet({ phone, amount, account, method = '', ref = '', note = '', by = 'Shanto' }) {
  const m = findMember(phone);
  const a = r2(Number(amount) || 0);
  if (!m) return { error: 'No member with this number' };
  if (!(a > 0)) return { error: 'Enter the amount' };
  const acc = accountBy(account);
  if (!acc) return { error: 'Choose the account the money came into' };
  const entry = postEntry({ account: acc.id, amount: a, kind: 'wallet top-up', ref: ref || 'Wallet', party: partyOf(m), note: note || 'Customer wallet top-up', by });
  return addWallet({ id: uid('LW'), phone: m.phone, at: Date.now(), kind: 'top-up', amount: a, what: 'Added money' + (method ? ' by ' + method : ''), sub: [ref && 'Ref ' + ref, note, 'into ' + acc.name].filter(Boolean).join(' · '), account: acc.id, method, ref, channel: 'Online', by, ledger: entry ? entry.id : '' });
}
/** Pay a wallet balance back to the customer from `account` (ledger 'wallet refund', −). Up to the balance. */
export function refundWallet({ phone, amount, account, method = '', ref = '', note = '', by = 'Shanto' }) {
  const m = findMember(phone);
  const a = r2(Number(amount) || 0);
  if (!m) return { error: 'No member with this number' };
  if (!(a > 0)) return { error: 'Enter the amount' };
  if (a > m.wallet + 0.001) return { error: `${m.name} has only ৳${m.wallet.toLocaleString('en-IN')} in the wallet` };
  const acc = accountBy(account);
  if (!acc) return { error: 'Choose the account that pays it' };
  const entry = postEntry({ account: acc.id, amount: -a, kind: 'wallet refund', ref: ref || 'Wallet', party: partyOf(m), note: note || 'Customer wallet paid back', by });
  return addWallet({ id: uid('LW'), phone: m.phone, at: Date.now(), kind: 'refund', amount: -a, what: 'Paid back' + (method ? ' by ' + method : ''), sub: [note, 'from ' + acc.name].filter(Boolean).join(' · '), account: acc.id, method, ref, channel: 'Online', by, ledger: entry ? entry.id : '' });
}
/** Credit given free (sorry gift, reward): no money moves; it is a cost of `channel`. */
export function rewardWallet({ phone, amount, reason = 'Reward', note = '', channel = 'Online', by = 'Shanto', ref = '', src = '' }) {
  const m = findMember(phone);
  const a = r2(Number(amount) || 0);
  if (!m) return { error: 'No member with this number' };
  if (!(a > 0)) return { error: 'Enter the amount' };
  return addWallet({ id: uid('LW'), phone: m.phone, at: Date.now(), kind: 'reward', amount: a, what: reason, sub: [note, 'given by ' + by].filter(Boolean).join(' · '), channel: CHANNELS.includes(channel) ? channel : 'Online', ref, src, by });
}
/** Pay for an order or sale from the wallet: no money moves, the balance (what the shop holds) goes down. */
export function spendWallet({ phone, amount, ref = '', by = 'System', channel = 'Online', where = '' }) {
  const m = findMember(phone);
  const a = r2(Number(amount) || 0);
  if (!m || !(a > 0)) return { error: 'Nothing to take' };
  if (a > m.wallet + 0.001) return { error: `Only ৳${m.wallet.toLocaleString('en-IN')} in the wallet` };
  return addWallet({ id: uid('LW'), phone: m.phone, at: Date.now(), kind: 'spend', amount: -a, what: 'Paid for ' + (ref || 'an order'), sub: where ? 'From wallet · ' + where : 'From wallet', ref, channel: CHANNELS.includes(channel) ? channel : 'Online', by });
}

/** Add-money and cash-out requests, newest first, with the member's name. */
export function getRequests() {
  const list = read(KEYS.requests, null) || REQUEST_SEED;
  const members = getMembers();
  return list.map((r) => ({ ...r, name: (members.find((m) => m.phone === r.phone) || {}).name || r.phone })).sort((a, b) => b.at - a.at);
}
function setRequest(id, patch) {
  const list = (read(KEYS.requests, null) || REQUEST_SEED).map((r) => (r.id === id ? { ...r, ...patch } : r));
  write(KEYS.requests, list);
  changed();
}
/** Approve an add-money request: the money is in `account`, the wallet goes up. */
export function approveRequest(id, { account, by = 'Shanto' }) {
  const r = getRequests().find((x) => x.id === id);
  if (!r || r.status !== 'waiting') return { error: 'This request is already done' };
  const done = r.type === 'in'
    ? topUpWallet({ phone: r.phone, amount: r.amount, account, method: r.method, ref: r.ref, note: 'Add-money request ' + r.id, by })
    : refundWallet({ phone: r.phone, amount: r.amount, account, method: r.method, ref: r.id, note: 'Cash-out to ' + r.ref, by });
  if (done.error) return done;
  setRequest(id, { status: r.type === 'in' ? 'approved' : 'sent', doneAt: Date.now(), account, by });
  return done;
}
export function rejectRequest(id, by = 'Shanto') { setRequest(id, { status: 'rejected', doneAt: Date.now(), by }); }

// ---- referrals ----------------------------------------------------------------------------------
// A record's status is worked out from what happened (the saved status is only the merchant's decision):
//   waiting    the friend joined, no order yet
//   review     the self-referral check found the same address or device: a person decides (approveReferral)
//   blocked    same phone as the customer who invited them (or rejected after review)
//   pending    the friend's order is delivered but still inside the return period (availableAt)
//   cancelled  the friend's order came back before the reward was given
//   capped     over the customer's monthly or total cap
//   due        ready to give · given · reversed (the friend's order came back after it was given)
const readRefAdded = () => read(KEYS.refAdded, []);
const norm = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]/g, '');
/** The self-referral check for a friend who joins with a customer's code. { verdict: 'ok'|'review'|'block', reasons } */
export function checkReferral({ referrer, friendPhone, address, device }) {
  const ref = phoneKey(referrer);
  const who = REFERRER_ID[ref] || {};
  const reasons = [];
  if (friendPhone && phoneKey(friendPhone) === ref) return { verdict: 'block', reasons: ['Same phone as the customer who invited them'] };
  if (address && who.address && norm(address) === norm(who.address)) reasons.push('Same address as the customer who invited them');
  if (device && who.device && device === who.device) reasons.push('Signed up on the same device');
  // a friend who already bought is not a new customer
  if (friendPhone && findMember(friendPhone) && (findMember(friendPhone).bought || 0) > 0) return { verdict: 'block', reasons: ['Already a customer'] };
  return { verdict: reasons.length ? 'review' : 'ok', reasons };
}
/** A friend joined with a code (called by sign-up or checkout). Returns the record with its check result. */
export function recordReferral({ code, friend = {}, order = null }) {
  const x = REFERRER_SEED.find((r) => r.code.toUpperCase() === String(code || '').trim().toUpperCase());
  if (!x) return { error: 'No customer has this code' };
  const chk = checkReferral({ referrer: x.phone, friendPhone: friend.phone, address: friend.address, device: friend.device });
  const s = getLoyaltySettings();
  const reward = order ? (s.referral.kind === 'comm' ? r2(order.amount * s.referral.pct / 100) : r2(s.referral.points * s.pointValue)) : 0;
  const row = { id: uid('RF'), referrer: x.phone, friend: friend.name || 'Friend', friendPhone: phoneKey(friend.phone), address: friend.address || '', device: friend.device || '', joinedAt: Date.now(), order, reward, status: chk.verdict === 'block' ? 'blocked' : 'due', flags: chk.reasons, channel: 'Online', added: true };
  write(KEYS.refAdded, [row, ...readRefAdded()]);
  changed();
  return { record: row, check: chk };
}
function referralState(r, t, s, returnedRefs) {
  const flags = r.flags || (r.address || r.device ? checkReferral({ referrer: r.referrer, friendPhone: r.friendPhone, address: r.address, device: r.device }).reasons : []);
  if (r.status === 'given' || r.status === 'reversed') {
    const back = r.order && (r.returnedAt || returnedRefs.has(r.order.ref));
    return { status: r.status === 'given' && back && r.reversedAt ? 'reversed' : r.status, flags, returned: !!back };
  }
  if (r.status === 'blocked' || r.status === 'rejected') return { status: 'blocked', flags };
  if (flags.length && !r.approvedAt) return { status: 'review', flags };
  if (!r.order) return { status: 'waiting', flags };
  if (r.returnedAt || returnedRefs.has(r.order.ref)) return { status: 'cancelled', flags, returned: true };
  const availableAt = (r.order.deliveredAt || r.order.at) + (s.referral.pendingDays || 0) * 864e5;
  if (t < availableAt) return { status: 'pending', flags, availableAt };
  return { status: 'due', flags, availableAt };
}
export function getReferralRecords(t = isBrowser ? Date.now() + (Number(read('gc.clock.offset', 0)) || 0) : Date.now()) {
  const edits = read(KEYS.referrals, {});
  const s = getLoyaltySettings();
  const returnedRefs = new Set(isBrowser ? getReturns().map((x) => x.ref).filter(Boolean) : []);
  const list = [...readRefAdded(), ...REFERRAL_SEED].map((r) => ({ ...r, ...(edits[r.id] || {}) }))
    .map((r) => ({ ...r, ...referralState(r, t, s, returnedRefs) }))
    .sort((a, b) => a.joinedAt - b.joinedAt);
  // caps: rewards (pending, due, given) a customer earns in the friend's order month, and in total
  const count = {};
  list.forEach((r) => {
    if (!['pending', 'due', 'given'].includes(r.status)) return;
    const x = REFERRER_SEED.find((y) => y.phone === r.referrer) || { before: { bought: 0 } };
    const mk = r.referrer + '|' + new Date(r.order ? r.order.at : r.joinedAt).getMonth();
    count[mk] = (count[mk] || 0) + 1;
    count[r.referrer] = (count[r.referrer] || x.before.bought) + 1;
    if (r.status !== 'given' && ((s.referral.capMonth && count[mk] > s.referral.capMonth) || (s.referral.capTotal && count[r.referrer] > s.referral.capTotal))) r.status = 'capped';
  });
  return list.sort((a, b) => b.joinedAt - a.joinedAt);
}
/** Let a referral the check flagged go ahead (a person looked at it). */
export function approveReferral(id, by = 'Shanto') { const e = read(KEYS.referrals, {}); e[id] = { ...(e[id] || {}), approvedAt: Date.now(), approvedBy: by, flags: [] }; write(KEYS.referrals, e); changed(); }
/** Refuse a flagged referral: no reward. */
export function rejectReferral(id, reason = 'Self-referral', by = 'Shanto') { const e = read(KEYS.referrals, {}); e[id] = { ...(e[id] || {}), status: 'rejected', rejectedAt: Date.now(), rejectReason: reason, by }; write(KEYS.referrals, e); changed(); }
/**
 * Take a given reward back (the friend's order was returned or cancelled). Store credit and points are taken back up to
 * what the customer still has; a cash payout can't be taken back here.
 */
export function reverseReferral(id, reason = 'Friend’s order returned', by = 'System') {
  const r = getReferralRecords().find((x) => x.id === id);
  if (!r || r.status !== 'given') return { error: 'Only a given reward can be reversed' };
  const m = findMember(r.referrer);
  let amount = 0;
  if (r.how === 'wallet' && m) {
    amount = r2(Math.min(r.reward, Math.max(0, m.wallet)));
    if (amount > 0) addWallet({ id: uid('LW'), phone: m.phone, at: Date.now(), kind: 'reverse', amount: -amount, what: 'Invite reward reversed', sub: reason, channel: r.channel || 'Online', ref: r.id, src: 'referral', by });
  } else if (r.how === 'points' && m) {
    const n = Math.min(r.points || 0, m.points);
    if (n > 0) write(KEYS.points, [{ id: uid('LP'), phone: m.phone, at: Date.now(), kind: 'reverse', points: -n, what: 'Invite points reversed', sub: reason, channel: 'Online', ref: r.id, by }, ...storedPoints()]);
    amount = n;
  }
  const e = read(KEYS.referrals, {});
  e[id] = { ...(e[id] || {}), status: 'reversed', reversedAt: Date.now(), reverseReason: reason, reversedAmount: amount, by };
  write(KEYS.referrals, e);
  changed();
  return { amount, how: r.how };
}
/** Reverse every given reward whose friend's order came back (run when returns change; the Referrals page runs it). */
export function checkReferralReturns() {
  return getReferralRecords().filter((r) => r.status === 'given' && r.returned).map((r) => reverseReferral(r.id));
}
/** One row per customer who shares a code: friends joined, bought, their sales, rewards given and due. */
export function getReferrers(records = getReferralRecords(), members = getMembers()) {
  return REFERRER_SEED.map((x) => {
    const mine = records.filter((r) => r.referrer === x.phone);
    const m = members.find((y) => y.phone === x.phone) || { name: x.phone };
    return {
      phone: x.phone, name: m.name, code: x.code,
      joined: x.before.joined + mine.length,
      bought: x.before.bought + mine.filter((r) => r.order).length,
      sales: x.before.sales + mine.reduce((a, r) => a + (r.order ? r.order.amount : 0), 0),
      earned: r2(x.before.earned + mine.filter((r) => r.status === 'given').reduce((a, r) => a + r.reward, 0)),
      due: r2(mine.filter((r) => r.status === 'due').reduce((a, r) => a + r.reward, 0)),
      pending: r2(mine.filter((r) => r.status === 'pending').reduce((a, r) => a + r.reward, 0)),
      review: mine.filter((r) => r.status === 'review').length,
      records: mine,
    };
  }).sort((a, b) => b.joined - a.joined);
}
/**
 * Give a due referral reward. how: 'wallet' (credit into the customer's wallet: a reward cost, no money
 * moves) or 'cash' (paid from `account`: ledger 'referral reward', −). Several records can be paid at once.
 */
export function payReferral(ids, { how, account, by = 'Shanto' }) {
  const list = getReferralRecords().filter((r) => ids.includes(r.id) && r.status === 'due');
  if (!list.length) return { error: 'Nothing to pay' };
  const total = r2(list.reduce((a, r) => a + r.reward, 0));
  const referrer = list[0].referrer;
  const m = findMember(referrer);
  if (!m) return { error: 'No member with this number' };
  let ledger = '';
  if (how === 'cash') {
    const acc = accountBy(account);
    if (!acc) return { error: 'Choose the account that pays it' };
    const entry = postEntry({ account: acc.id, amount: -total, kind: 'referral reward', ref: list.map((r) => r.id).join(', '), party: partyOf(m), note: 'Invite a friend reward · ' + list.map((r) => r.friend).join(', '), by });
    ledger = entry ? entry.id : '';
  } else {
    list.forEach((r) => rewardWallet({ phone: referrer, amount: r.reward, reason: 'Invite reward', note: `${r.friend}’s first order ${r.order ? r.order.ref : ''}`.trim(), channel: r.channel || 'Online', by, ref: r.id, src: 'referral' }));
  }
  const edits = read(KEYS.referrals, {});
  const now = Date.now();
  list.forEach((r) => { edits[r.id] = { status: 'given', how, givenAt: now, account: how === 'cash' ? account : '', by, ledger }; });
  write(KEYS.referrals, edits);
  changed();
  if (how !== 'cash') notifyMember('referral', referrer, { amount: '৳' + Math.round(total).toLocaleString('en-IN') }, 'referral|' + list.map((r) => r.id).join(','));
  return { total, count: list.length, name: m.name };
}

// ---- the books ----------------------------------------------------------------------------------
/** Points customers hold now and what they are worth as discount (a liability until used or expired). */
export function pointsLiability(members = getMembers(), s = getLoyaltySettings()) {
  const points = members.reduce((a, m) => a + m.points, 0);
  return { points, value: r2(points * s.pointValue), members: members.filter((m) => m.points > 0).length, pointValue: s.pointValue };
}
/**
 * Money the shop holds for customers: loyalty wallets (top-ups, return credit, rewards) and advances
 * kept on invoices (invoices.js customer credit). { total, wallets, advances, customers: [{ phone, name, wallet, advance, total }] }
 */
export function walletLiability(members = getMembers()) {
  const by = new Map();
  members.forEach((m) => { if (m.wallet > 0) by.set(m.phone, { phone: m.phone, name: m.name, wallet: m.wallet, advance: 0 }); });
  const adv = read(CREDIT_KEY, {});
  const customers = getCustomers();
  Object.entries(adv || {}).forEach(([phone, bal]) => {
    const b = r2(Number(bal) || 0);
    if (b <= 0) return;
    const row = by.get(phone) || { phone, name: (customers.find((c) => c.phone === phone) || {}).name || (members.find((m) => m.phone === phone) || {}).name || phone, wallet: 0, advance: 0 };
    row.advance = b;
    by.set(phone, row);
  });
  const list = [...by.values()].map((x) => ({ ...x, total: r2(x.wallet + x.advance) })).sort((a, b) => b.total - a.total);
  const wallets = r2(list.reduce((a, x) => a + x.wallet, 0));
  const advances = r2(list.reduce((a, x) => a + x.advance, 0));
  return { total: r2(wallets + advances), wallets, advances, customers: list };
}
export const LOYALTY_COST = { points: 'Loyalty points used', reward: 'Rewards and referral credit' };
/**
 * What loyalty cost the shop in [from, to), by channel:
 *   Loyalty points used          points used as money off a bill (value in ৳ at the time), or changed
 *                                to wallet money
 *   Rewards and referral credit  wallet credit given free, and referral rewards paid in cash
 * { byChannel: { Online, Retail, Wholesale }, total,
 *   lines: [{ label, amount, channel, kind: 'points'|'reward', onBill }] }
 * onBill = the part already taken off sale prices (points used at checkout): the sales book counts
 * those sales after the discount, so profit.js adds it back to the channel's sales before showing it
 * as a cost (it is not taken off twice).
 */
export function loyaltyCosts(from, to, { points = getPointEntries(), wallet = getWalletEntries(), referrals = getReferralRecords(), s = getLoyaltySettings() } = {}) {
  const lines = {};
  const add = (kind, channel, amount, onBill = false) => {
    if (!amount) return;
    const ch = CHANNELS.includes(channel) ? channel : 'Online';
    const key = kind + '|' + ch;
    lines[key] = lines[key] || { label: LOYALTY_COST[kind], amount: 0, channel: ch, kind, onBill: 0 };
    lines[key].amount = r2(lines[key].amount + amount);
    if (onBill) lines[key].onBill = r2(lines[key].onBill + amount);
  };
  points.filter((e) => e.kind === 'redeem' && e.at >= from && e.at < to).forEach((e) => add('points', e.channel, e.value != null ? e.value : r2(-e.points * s.pointValue), e.onBill !== false));
  wallet.filter((e) => e.kind === 'reward' && e.amount > 0 && e.at >= from && e.at < to).forEach((e) => add('reward', e.channel, e.amount));
  referrals.filter((r) => r.status === 'given' && r.how === 'cash' && r.givenAt >= from && r.givenAt < to).forEach((r) => add('reward', r.channel, r.reward));
  const byChannel = { Online: 0, Retail: 0, Wholesale: 0 };
  Object.values(lines).forEach((l) => { byChannel[l.channel] = r2(byChannel[l.channel] + l.amount); });
  return { byChannel, total: r2(byChannel.Online + byChannel.Retail + byChannel.Wholesale), lines: Object.values(lines).sort((a, b) => b.amount - a.amount) };
}
/** Start of the month of `t`, and of the next one. */
export function monthRange(t, offset = 0) {
  const d = new Date(t);
  return [new Date(d.getFullYear(), d.getMonth() + offset, 1).getTime(), new Date(d.getFullYear(), d.getMonth() + offset + 1, 1).getTime()];
}

// ---- levels: history -----------------------------------------------------------------------------
// The demo members' moves are worked out from what they bought since they joined (spend grew evenly from
// joining to their last visit); moves after that are recorded by checkTiers() and setTier().
const readTierLog = () => read(KEYS.tiers, []);
function seedTierMoves(m, s) {
  const base = [...storedMembers(), ...MEMBER_SEED].find((x) => x.phone === m.phone);
  if (!base) return [];
  const tiers = [...s.tiers].sort((a, b) => a.min - b.min);
  const start = base.joined, end = Math.max(base.last || start, start + 864e5), total = base.bought || 0;
  const out = [{ phone: m.phone, at: start, from: '', to: tiers[0].k, reason: 'Joined', by: 'System', seed: true }];
  tiers.slice(1).forEach((t, i) => { if (total >= t.min && total > 0) out.push({ phone: m.phone, at: Math.round(start + (end - start) * (t.min / total)), from: tiers[i].k, to: t.k, reason: `Spent ৳${t.min.toLocaleString('en-IN')} in total`, by: 'System', seed: true }); });
  return out;
}
/** When a member moved between levels, and why. Newest first: { at, from, to, reason, by, up } */
export function tierHistory(phone, s = getLoyaltySettings()) {
  const m = findMember(phone);
  if (!m) return [];
  const order = Object.fromEntries(s.tiers.map((t, i) => [t.k, i]));
  return [...seedTierMoves(m, s), ...readTierLog().filter((e) => e.phone === m.phone)]
    .sort((a, b) => b.at - a.at)
    .map((e) => ({ ...e, up: !e.from || (order[e.to] ?? 0) > (order[e.from] ?? 0), toName: (s.tiers.find((t) => t.k === e.to) || { name: e.to }).name, fromName: e.from ? (s.tiers.find((t) => t.k === e.from) || { name: e.from }).name : '' }));
}
const lastTier = (m, s) => { const h = tierHistory(m.phone, s); return h.length ? h[0].to : ''; };
/** Record every member whose level changed since the last move on record (and tell them). Returns the moves. */
export function checkTiers(members = getMembers(), s = getLoyaltySettings()) {
  const moves = [];
  const order = Object.fromEntries(s.tiers.map((t, i) => [t.k, i]));
  members.forEach((m) => {
    const was = lastTier(m, s);
    if (!was || was === m.tier) return;
    const up = (order[m.tier] ?? 0) > (order[was] ?? 0);
    moves.push({ phone: m.phone, at: Date.now(), from: was, to: m.tier, by: 'System',
      reason: up ? `Spent ৳${m.tierObj.min.toLocaleString('en-IN')} in total` : `Level rules changed: ${m.tierObj.name} needs ৳${(s.tiers.find((t) => t.k === was) || { min: 0 }).min.toLocaleString('en-IN')}+` });
  });
  if (moves.length) {
    write(KEYS.tiers, [...moves, ...readTierLog()]);
    moves.filter((x) => (order[x.to] ?? 0) > (order[x.from] ?? 0)).forEach((x) => { const t = s.tiers.find((y) => y.k === x.to); notifyMember('tier', x.phone, { tier: t.name, mult: t.mult + 'x' }, `tier|${x.phone}|${x.to}`); });
    changed();
  }
  return moves;
}
/** Put a member on a level by hand (with a reason), or back to automatic (tier ''). */
export function setTier(phone, tier, reason, by = 'Shanto') {
  const m = findMember(phone);
  if (!m) return { error: 'No member with this number' };
  if (!String(reason || '').trim()) return { error: 'Give a reason' };
  const all = read(KEYS.tierSet, {});
  if (tier) all[m.phone] = { tier, reason, by, at: Date.now() }; else delete all[m.phone];
  write(KEYS.tierSet, all);
  const after = findMember(m.phone);
  if (after.tier !== m.tier) write(KEYS.tiers, [{ phone: m.phone, at: Date.now(), from: m.tier, to: after.tier, reason: (tier ? 'Set by hand: ' : 'Back to automatic: ') + reason, by }, ...readTierLog()]);
  changed();
  return { member: after };
}

// ---- messages (sent by Communications) -------------------------------------------------------------
// Loyalty decides that a member should hear about something; messaging.js decides whether, when and how.
export const LOYALTY_MESSAGES = {
  tier: { template: 'T-TIER', cls: 'Service', label: 'New level' },
  credit: { template: 'T-CREDIT', cls: 'Service', label: 'Store credit added' },
  referral: { template: 'T-REFERRAL', cls: 'Service', label: 'Invite reward ready' },
  birthday: { template: 'T-BIRTHDAY', cls: 'Marketing', label: 'Birthday gift' },
  expiring: { template: 'T-POINTS-EXP', cls: 'Marketing', label: 'Points expiring' },
};
/** Hand a loyalty message to Communications. Returns its send result, or null when the message is turned off. */
export function notifyMember(event, phone, vars = {}, once = '') {
  const def = LOYALTY_MESSAGES[event];
  const s = getLoyaltySettings();
  if (!def || !isBrowser || s.messages[event] === false) return null;
  const m = findMember(phone);
  if (!m) return null;
  return sendMessage({ source: 'Loyalty', event: def.label, cls: def.cls, channels: ['sms', 'whatsapp'], to: { name: m.name, phone: m.phone, customerId: m.customerId }, template: def.template, vars, once, ref: m.phone });
}
/** Remind members whose points expire within a month (once per member per month). Returns how many were handed over. */
export function remindExpiring(now = Date.now()) {
  const s = getLoyaltySettings();
  if (!s.expireOn) return 0;
  const d = new Date(now); const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const date = `${end.getDate()} ${end.toLocaleString('en', { month: 'short' })}`;
  return getMembers({ now }).filter((m) => m.expiring > 0).map((m) => notifyMember('expiring', m.phone, { points: m.expiring.toLocaleString('en-IN'), date }, `expiring|${m.phone}|${d.getFullYear()}-${d.getMonth()}`)).filter(Boolean).length;
}
