// adSpend — money paid for ads, one row per campaign payment, so reports can set ad spend against the
// online sales it brought (ROAS, cost per delivered order).
//   { id, at, platform: 'Facebook'|'Instagram'|'Google'|'TikTok'|'Other', campaign, channel: 'Online',
//     amount, account, note, by, ledgerId }
// Adding one also posts the Marketing expense to the ledger (tagged with the ad's id), so the money
// book, expenses and the P&L show it too.
// Demo September: the two Meta payments in the ledger seed (৳15,000 on 7 Sep, ৳12,000 on 18 Sep) split
// into the campaigns they paid for. They are not posted again.
// Front end only: rows added here live in this browser (gc.adspend).

import { LEDGER_SEED } from './ledgerSeed';
import { postEntry } from './ledger';

const KEY = 'gc.adspend';
export const AD_PLATFORMS = ['Facebook', 'Instagram', 'Google', 'TikTok', 'Other'];
/** Where an online order comes from for each platform (order `source`), for attribution. */
export const SOURCE_OF_PLATFORM = { Facebook: 'Facebook', Instagram: 'Facebook', Google: 'Website', TikTok: '', Other: '' };

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const seedPay = (day) => LEDGER_SEED.find((e) => e.cat === 'Marketing' && new Date(e.at).getDate() === day && new Date(e.at).getMonth() === 8) || null;
const S = (id, day, platform, campaign, amount, note) => {
  const pay = seedPay(day);
  return { id, at: pay ? pay.at : new Date(2026, 8, day, 16).getTime(), platform, campaign, channel: 'Online', amount, account: pay ? pay.account : 'citybank', note, by: pay ? pay.by : 'Arif Rahman', ledgerId: pay ? pay.id : '', seed: true };
};
/** Demo September campaigns: they add up to the ledger's Meta payments (৳15,000 + ৳12,000). */
export const AD_SEED = [
  S('AD-0901', 7, 'Facebook', 'Eid phones · Facebook feed', 8000, 'Eid phone offers, Dhaka'),
  S('AD-0902', 7, 'Instagram', 'Eid phones · Instagram reels', 4500, 'Unboxing reels of the new phones'),
  S('AD-0903', 7, 'Facebook', 'Retargeting · cart visitors', 2500, 'People who added to cart and left'),
  S('AD-0904', 18, 'Facebook', 'Weekend Mega Sale · Facebook', 7000, 'Flash sale 18–20 Sep'),
  S('AD-0905', 18, 'Instagram', 'Fast charging guide · Instagram', 5000, 'Charger reel boost'),
];

const read = () => { try { return JSON.parse(window.localStorage.getItem(KEY)) || []; } catch { return []; } };

/** Every ad spend row, newest first: the ones added in this browser, then the demo September ones. */
export function getAdSpend() {
  const mine = typeof window === 'undefined' ? [] : read();
  return [...mine, ...AD_SEED].sort((a, b) => b.at - a.at);
}

/**
 * Record ad spend and post the Marketing expense.
 * { at?, platform, campaign, amount, account, note?, by? } → { row } or { error }.
 */
export function addAdSpend(input) {
  const amount = r2(input.amount);
  const platform = AD_PLATFORMS.includes(input.platform) ? input.platform : 'Other';
  const campaign = String(input.campaign || '').trim();
  if (!campaign) return { error: 'Give the campaign a name.' };
  if (!(amount > 0)) return { error: 'Enter the amount paid.' };
  if (!input.account) return { error: 'Choose the account that paid.' };
  const list = read();
  const n = [...list, ...AD_SEED].reduce((m, x) => Math.max(m, Number(String(x.id).split('-').pop()) || 0), 1000) + 1;
  const id = 'AD-' + n;
  const at = Number(input.at) || Date.now();
  const by = input.by || 'Staff';
  const row = { id, at, platform, campaign, channel: 'Online', amount, account: input.account, note: String(input.note || '').trim(), by, ledgerId: '' };
  // save the row first, so screens that re-read on the ledger event already see it
  try { window.localStorage.setItem(KEY, JSON.stringify([row, ...list])); } catch { /* ignore */ }
  const entry = postEntry({ account: input.account, amount: -amount, kind: 'expense', cat: 'Marketing', party: platform, note: campaign, ref: id, adId: id, by, at });
  if (!entry) {
    try { window.localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ }
    return { error: 'That account could not be used.' };
  }
  const saved = { ...row, ledgerId: entry.id };
  try { window.localStorage.setItem(KEY, JSON.stringify([saved, ...list])); } catch { /* ignore */ }
  return { row: saved };
}
