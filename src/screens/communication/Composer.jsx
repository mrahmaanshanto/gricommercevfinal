'use client';
// Generated from design/templates/communication/Composer.dc.html by scripts/convert-design.mjs.
// Create post — Communication — create a post with formatting, hashtags, AI generate and rewrite, per-platform checks, preview and scheduling.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { ChannelIcon as __ChannelIcon } from '@/components/ui';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function pTabs(self, list, cur, key, counts) { return mkTabs(self, list, cur, key, counts).map(function (x) { x.pcls = x.on ? 'ptab on' : 'ptab'; return x; }); }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function stepN(self, key, def, step, min, max) { var s = self.state || {}; var v = s[key] == null ? def : s[key]; return { v: v, dec: function () { var p = {}; p[key] = Math.max(min, +(v - step).toFixed(2)); self.setState(p); }, inc: function () { var p = {}; p[key] = Math.min(max, +(v + step).toFixed(2)); self.setState(p); } }; }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { clearTimeout(self.t); self.setState({ msg: m, bad: !!bad }); self.t = setTimeout(function () { self.setState({ msg: '' }); }, 2800); }
function msgV(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#fff4e0' : '#e7f8f1', msgFg: s.bad ? '#7a3b04' : '#065f46' }; }
function segv(self, opts, cur, key) { return opts.map(function (o) { var on = o[0] === cur; return { l: o[1], on: on, bg: on ? '#0b1733' : 'transparent', fg: on ? '#fff' : '#475569', pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
function lseg(self, opts, cur, key) { return opts.map(function (o) { var on = o[0] === cur; return { l: o[1], on: on, bg: on ? '#fff' : 'transparent', fg: on ? 'var(--text-heading)' : 'var(--text-body)', sh: on ? '0 1px 2px rgba(15,23,42,.08), 0 1px 1px rgba(15,23,42,.04)' : 'none', pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
function ring(pctv, r) { var C = 2 * Math.PI * r; return { da: (C * pctv / 100).toFixed(1) + ' ' + C.toFixed(1) }; }
function curve(pts) { if (!pts.length) return ''; var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1); for (var i = 0; i < pts.length - 1; i++) { var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6, c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6; d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1); } return d; }
function pts(vals, w, h, max, min, padT, padB) { padT = padT || 2; padB = padB || 2; min = min == null ? 0 : min; max = max || Math.max.apply(null, vals) || 1; var n = vals.length; return vals.map(function (v, i) { return [n === 1 ? w / 2 : i * w / (n - 1), padT + (h - padT - padB) * (1 - (v - min) / (max - min || 1))]; }); }
function sparkP(vals, w, h) { w = w || 160; h = h || 30; var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals); var p = pts(vals, w, h, mx + (mx - mn) * .1, mn - (mx - mn) * .15, 3, 2); var l = curve(p); return { line: l, area: l + ' L' + w + ' ' + h + ' L0 ' + h + ' Z' }; }
function series(n, base, amp, seed, trend) { var out = []; for (var i = 0; i < n; i++) { var s = Math.sin((i + seed) * 1.7) * .5 + Math.sin((i * 3 + seed) * .9) * .3 + Math.cos(i * .45 + seed) * .2; out.push(Math.max(0, base * (1 + (trend || 0) * (i / n - .5)) + amp * s)); } return out; }

function val(e) { return e && e.target ? e.target.value : e; }

// key, name, short, color, auto?, account, status, supports, note
var PLAT = [
  ['fb', 'Facebook Page', 'FB', '#1d4ed8', true, 'GridShop', 'ok', 'Text, photos, videos, links', 'Posts go out at the scheduled minute.'],
  ['ig', 'Instagram', 'IG', '#be185d', true, '@gridshop.bd', 'ok', 'Photos, carousels, Reels', 'Needs a photo or video. Business account linked to the Facebook Page.'],
  ['wa', 'WhatsApp broadcast', 'WA', '#15803d', true, '+880 1711-482093', 'ok', 'Template message with photo', 'Goes only to customers who opted in. ৳1.10 per message from the wallet.'],
  ['tt', 'TikTok', 'TT', '#0f172a', true, '@gridshop', 'renew', 'Videos, photo posts', 'Access expires in 3 days. Reconnect to keep posting.'],
  ['yt', 'YouTube', 'YT', '#b91c1c', true, 'GridShop BD', 'ok', 'Videos and Shorts', 'Needs a video.'],
  ['x', 'X', 'X', '#334155', true, '@gridshopbd', 'off', 'Text up to 280 characters, photos', 'How many posts a month depends on the X API plan.'],
  ['pin', 'Pinterest', 'PIN', '#9f1239', true, 'Not connected', 'off', 'Pins with photo and link', 'Each pin needs a photo and a link.'],
  ['wac', 'WhatsApp Channel', 'WAC', '#166534', false, 'GridShop Offers', 'manual', 'Reminder with the text ready to copy', 'WhatsApp has no posting API for channels, so a reminder is sent to post by hand.'],
  ['fbg', 'Facebook groups', 'FBG', '#1e40af', false, '3 groups', 'manual', 'Reminder with the text ready to copy', 'Meta closed group posting by API in 2024, so a reminder is sent to post by hand.'],
  ['li', 'LinkedIn page', 'IN', '#075985', true, 'GridShop Ltd', 'ok', 'Text, photos, links', 'Company page only, not personal profiles.']
];
var PST = { ok: ['Connected', '#e7f8f1', '#047857'], renew: ['Reconnect soon', '#fff4e0', '#a14f06'], off: ['Not connected', '#f1f5f9', '#475569'], manual: ['Reminder only', 'rgba(0,48,135,.08)', '#003087'] };
var CH = { fb: 'facebook', ig: 'instagram', wa: 'whatsapp', tt: 'tiktok', yt: 'youtube', x: 'x', pin: 'pinterest', wac: 'whatsapp', fbg: 'facebook', li: 'linkedin' };
var CK_ICON = { bad: 'triangle-alert', warn: 'clock', info: 'info', ok: 'check' };
function plat(k) { return PLAT.filter(function (p) { return p[0] === k; })[0]; }

var BASE = { en: 'Puja is here.\nGet 10% off every charger and cable with code PUJA10, until 20 October.\nFree delivery inside Dhaka on orders over ৳1,500.', bn: 'পূজা এসে গেছে!\nPUJA10 কোডে সব চার্জার ও ক্যাবলে ১০% ছাড়, ২০ অক্টোবর পর্যন্ত।\nঢাকার ভেতরে ৳১,৫০০-এর বেশি অর্ডারে ফ্রি ডেলিভারি।', mix: 'Puja offer cholche!\nPUJA10 code diye shob charger ar cable e 10% off, 20 October porjonto.\nDhakar bhitore ৳1,500+ order e free delivery.' };
var SETS = [['Brand', ['#GridShop', '#GridShopBD']], ['Puja offer', ['#PujaOffer', '#পূজার_অফার', '#DurgaPuja']], ['Phone care', ['#PhoneAccessoriesBD', '#PhoneCase', '#FastCharger']]];
var SUGG = ['#GridShop', '#PujaOffer', '#DhakaShopping', '#PhoneAccessoriesBD', '#FastCharger', '#পূজার_অফার', '#OnlineShoppingBD', '#Discount'];
var EMO = [['party', '🎉'], ['gift', '🎁'], ['fire', '🔥'], ['truck', '🚚'], ['check', '✅'], ['clock', '⏰'], ['phone', '📱'], ['star', '⭐'], ['heart', '❤️'], ['point', '👉']];
var TONES = [['friendly', 'Friendly'], ['urgent', 'Urgent'], ['premium', 'Premium'], ['fun', 'Playful']];
var GEN = {
  friendly: { en: ['Puja is almost here, and so is our gift to you.\nUse PUJA10 for 10% off chargers and cables until 20 October.', 'Getting ready for Puja? Charge up for less.\n10% off every charger and cable with PUJA10. Free delivery in Dhaka over ৳1,500.', 'Puja plans sorted? Your phone is next.\nPUJA10 takes 10% off chargers and cables, this month only.'],
    bn: ['পূজা আসছে, আর আপনার জন্য আছে ছোট্ট উপহার।\nPUJA10 কোডে চার্জার ও ক্যাবলে ১০% ছাড়, ২০ অক্টোবর পর্যন্ত।', 'পূজার প্রস্তুতি চলছে? ফোনের চার্জ নিয়ে আর চিন্তা নয়।\nPUJA10 কোডে ১০% ছাড়, ঢাকায় ৳১,৫০০+ অর্ডারে ফ্রি ডেলিভারি।', 'পূজার কেনাকাটায় ফোনটাও বাদ যাবে কেন?\nসব চার্জার ও ক্যাবলে ১০% ছাড়, কোড PUJA10।'],
    mix: ['Puja ashche, tai ekta choto gift!\nPUJA10 code e charger ar cable e 10% off.', 'Puja shopping cholche? Phone er charger ta update koren.\n10% off with PUJA10, Dhakay ৳1,500+ e free delivery.', 'Puja te phone o chai notun look!\nPUJA10 code e 10% off, 20 October porjonto.'] },
  urgent: { en: ['Only until 20 October: 10% off every charger and cable.\nCode PUJA10. Stock is moving fast.', 'Last call for Puja deals.\nPUJA10 = 10% off chargers and cables. Ends 20 October.', 'Do not miss it: PUJA10 saves 10% on chargers and cables.\nOrder today, delivered before Puja.'], bn: ['শুধু ২০ অক্টোবর পর্যন্ত!\nPUJA10 কোডে সব চার্জার ও ক্যাবলে ১০% ছাড়।', 'পূজার অফার শেষ হচ্ছে শিগগিরই।\nএখনই অর্ডার করুন, কোড PUJA10।', 'স্টক সীমিত! PUJA10 কোডে ১০% ছাড়।\nআজ অর্ডার করলে পূজার আগেই ডেলিভারি।'], mix: ['Shudhu 20 October porjonto!\nPUJA10 code e 10% off.', 'Offer shesh hocche!\nAjkei order koren, code PUJA10.', 'Stock limited! PUJA10 e 10% off, Puja r agei delivery.'] },
  premium: { en: ['Power, beautifully made.\nThis Puja, 10% off our charger and cable collection with PUJA10.', 'Chargers built to last, now 10% less.\nUse PUJA10 until 20 October.', 'Crafted for every day, priced for the festival.\nPUJA10 · 10% off chargers and cables.'], bn: ['মানসম্পন্ন চার্জার, এবার পূজায় আরও সাশ্রয়ী।\nPUJA10 কোডে ১০% ছাড়।', 'দীর্ঘস্থায়ী চার্জার ও ক্যাবল, এখন ১০% কমে।\nকোড PUJA10।', 'প্রতিদিনের জন্য তৈরি, উৎসবের দামে।\nPUJA10 · ১০% ছাড়।'], mix: ['Quality charger, ebar Puja te aro affordable.\nPUJA10 e 10% off.', 'Long-lasting charger ar cable, ekhon 10% kom e.\nCode PUJA10.', 'Everyday quality, festival price.\nPUJA10 · 10% off.'] },
  fun: { en: ['Your phone wants a Puja gift too.\n10% off chargers and cables with PUJA10.', 'Battery at 1%? Not this Puja.\nPUJA10 gets you 10% off.', 'New outfit: done. New charger: PUJA10.\n10% off until 20 October.'], bn: ['ফোনটাও পূজায় উপহার চায়!\nPUJA10 কোডে ১০% ছাড়।', 'ব্যাটারি ১%? এই পূজায় আর না।\nPUJA10 কোডে ১০% ছাড়।', 'নতুন জামা হলো, এবার নতুন চার্জার।\nPUJA10 কোডে ১০% ছাড়।'], mix: ['Phone tao Puja gift chay!\nPUJA10 e 10% off.', 'Battery 1%? Ei Puja te ar na!\nPUJA10 e 10% off.', 'Notun jama done, ebar notun charger.\nPUJA10 e 10% off.'] }
};
var LIM = { x: 280, ig: 2200, li: 3000, pin: 500 };
var BOLD_A = 0x1D5D4, BOLD_a = 0x1D5EE, BOLD_0 = 0x1D7EC, IT_A = 0x1D608, IT_a = 0x1D622;
function styl(s, A, a, z) { return Array.from(s).map(function (ch) { var c = ch.charCodeAt(0); if (c >= 65 && c <= 90) return String.fromCodePoint(A + c - 65); if (c >= 97 && c <= 122) return String.fromCodePoint(a + c - 97); if (z && c >= 48 && c <= 57) return String.fromCodePoint(z + c - 48); return ch; }).join(''); }
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var sel = s.sel || { fb: 1, ig: 1, wa: 1, tt: 1, wac: 1 };
    var lang = s.lang || 'en', text = s.text == null ? BASE[lang] : s.text, hist = s.hist || [];
    var tags = s.tags || { '#GridShop': 1, '#PujaOffer': 1, '#DhakaShopping': 1 };
    var media = s.media || ['photo'], link = s.link == null ? 'https://gridshop.com.bd/offers/puja' : s.link;
    var date = s.date || '2026-10-01', time = s.time || '20:00';
    var mode = s.mode || 'gen', tone = s.tone || 'friendly', gl = s.gl || 'en', glen = s.glen || 'md';
    function setText(t, note) { self.setState({ text: t, hist: hist.concat([text]).slice(-20), lastRw: note || '' }); }
    var tagList = Object.keys(tags);
    var full = text + (tagList.length ? '\n\n' + tagList.join(' ') : '');
    var len = Array.from(full).length + (link ? link.length + 1 : 0);
    var chosen = PLAT.filter(function (p) { return sel[p[0]]; });
    var hasVideo = media.indexOf('video') >= 0, hasPhoto = media.indexOf('photo') >= 0;
    function issue(p) { var k = p[0];
      if (p[6] === 'off') return ['Not connected. Connect it, or it is skipped.', 'bad'];
      if (k === 'x' && len > 280) return ['Too long by ' + (len - 280) + ' characters. Use AI rewrite: Shorter.', 'bad'];
      if (k === 'ig' && tagList.length > 30) return ['Instagram allows up to 30 hashtags.', 'bad'];
      if ((k === 'tt' || k === 'yt') && !hasVideo) return [p[1] + ' needs a video. Add one under Media.', 'bad'];
      if (k === 'ig' && !media.length) return ['Instagram needs a photo or video.', 'bad'];
      if (k === 'pin' && (!hasPhoto || !link)) return ['Pinterest needs a photo and a link.', 'bad'];
      if (p[6] === 'renew') return ['Access expires in 3 days. It will post, but reconnect soon.', 'warn'];
      if (!p[4]) return ['A reminder with this text goes to the store phone at the set time.', 'info'];
      if (k === 'wa') return ['Goes to 1,860 opted-in customers · about ৳2,046 from the wallet.', 'info'];
      return ['Ready.', 'ok']; }
    var checks = chosen.map(function (p) { var i = issue(p); var B = { bad: ['Fix', '#ffece6', '#b83210', '#b83210'], warn: ['Check', '#fff4e0', '#a14f06', '#475569'], info: ['Info', 'rgba(0,48,135,.08)', '#003087', '#475569'], ok: ['Ready', '#e7f8f1', '#047857', '#475569'] }[i[1]];
      return { n: p[1], ch: CH[p[0]], bi: CK_ICON[i[1]], m: i[0], mc: B[3], b: B[0], bb: B[1], bf: B[2], bad: i[1] === 'bad', count: LIM[p[0]] ? len.toLocaleString('en-IN') + ' / ' + LIM[p[0]].toLocaleString('en-IN') : '', cc: LIM[p[0]] && len > LIM[p[0]] ? 'var(--text-danger)' : 'var(--text-muted)' }; });
    var bad = checks.filter(function (k) { return k.bad; }).length;
    var d = new Date(date + 'T' + time + ':00'), MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var when = isNaN(d) ? '—' : d.getDate() + ' ' + MON[d.getMonth()] + ', ' + ((d.getHours() % 12) || 12) + ':' + String(d.getMinutes()).padStart(2, '0') + ' ' + (d.getHours() >= 12 ? 'pm' : 'am');
    var pvk = s.pv && sel[s.pv] ? s.pv : (chosen[0] || PLAT[0])[0], pvp = plat(pvk);
    function go(now) { if (!chosen.length) { toast(self, 'Pick at least one place to post.', true); return; } if (bad) { toast(self, bad + (bad === 1 ? ' platform needs' : ' platforms need') + ' fixing first. See Ready to publish.', true); return; }
      var auto = chosen.filter(function (p) { return p[4]; }).length, man = chosen.length - auto; self.setState({ done: now ? 'now' : 'sched' });
      toast(self, (now ? 'Posting now to ' : 'Scheduled for ' + when + ' on ') + auto + ' platform' + (auto === 1 ? '' : 's') + (man ? ', with ' + man + ' reminder' + (man > 1 ? 's' : '') + ' to post by hand.' : '.')); }
    var firstLine = function (fn) { var ls = text.split('\n'); ls[0] = fn(ls[0]); return ls.join('\n'); };
    var v = {
      status: s.done === 'sched' ? 'Scheduled for ' + when : s.done === 'draft' ? 'Draft saved' : 'Draft · not saved yet',
      plats: PLAT.map(function (p) { var on = !!sel[p[0]]; return { n: p[1], ch: CH[p[0]], short: p[1].replace('WhatsApp broadcast', 'WhatsApp').replace('Facebook Page', 'Facebook').replace('WhatsApp Channel', 'WA Channel').replace('Facebook groups', 'FB groups').replace('LinkedIn page', 'LinkedIn'), on: on, cls: on ? 'av on' : 'av', op: p[6] === 'off' ? .45 : 1, pick: function () { var n = assign({}, sel); if (on) delete n[p[0]]; else n[p[0]] = 1; self.setState({ sel: n }); } }; }),
      selNote: chosen.length + ' selected · ' + chosen.filter(function (p) { return !p[4]; }).length + ' by reminder',
      langs: [['en', 'English'], ['bn', 'বাংলা'], ['mix', 'Benglish']].map(function (o) { var on = o[0] === lang; return { l: o[1], on: on, bg: on ? '#fff' : 'transparent', fg: on ? 'var(--text-heading)' : 'var(--text-body)', sh: on ? '0 1px 2px rgba(15,23,42,.08)' : 'none', pick: function () { self.setState({ lang: o[0], text: BASE[o[0]], hist: hist.concat([text]) }); } }; }),
      bnCls: lang === 'bn' ? 'bn' : '',
      text: text, onText: function (e) { self.setState({ text: val(e) }); },
      count: len.toLocaleString('en-IN') + ' characters', countC: chosen.some(function (p) { return LIM[p[0]] && len > LIM[p[0]]; }) ? 'var(--text-danger)' : 'var(--text-muted)',
      fBold: function () { setText(firstLine(function (l) { return styl(l, BOLD_A, BOLD_a, BOLD_0); })); }, fItal: function () { setText(firstLine(function (l) { return styl(l, IT_A, IT_a, 0); })); },
      fList: function () { var ls = text.split('\n'); setText([ls[0]].concat(ls.slice(1).map(function (l) { return l && l.indexOf('• ') !== 0 ? '• ' + l : l; })).join('\n')); },
      emojiOpen: !!s.emo, fEmoji: function () { self.setState({ emo: !s.emo }); },
      emojis: EMO.map(function (e) { return { n: e[0], c: e[1], add: function () { setText(text.replace(/\n?$/, ' ' + e[1])); } }; }),
      fHash: function () { toast(self, 'Pick hashtags below. They are added at the end, so the text stays clean.'); },
      fMention: function () { setText(text + ' @gridshop.bd'); }, fVar: function () { setText(text + ' {price}'); toast(self, '{price} is filled with the product price when the post goes out.'); },
      undo: function () { if (!hist.length) return; self.setState({ text: hist[hist.length - 1], hist: hist.slice(0, -1), lastRw: '' }); },
      hashNote: tagList.length + ' hashtags · Instagram allows 30, X works best with 1 or 2', hashC: tagList.length > 30 ? 'var(--text-danger)' : 'var(--text-muted)',
      sets: SETS.map(function (g) { return { l: g[0], n: g[1].length, add: function () { var n = assign({}, tags); g[1].forEach(function (t) { n[t] = 1; }); self.setState({ tags: n }); } }; }),
      tags: SUGG.concat(tagList.filter(function (t) { return SUGG.indexOf(t) < 0; })).map(function (t) { var on = !!tags[t]; return { t: t, on: on, cls: on ? 'hash on' : 'hash', toggle: function () { var n = assign({}, tags); if (on) delete n[t]; else n[t] = 1; self.setState({ tags: n }); } }; }),
      mediaList: media.map(function (m) { return m === 'video' ? { l: 'Video · 0:24', bg: 'linear-gradient(135deg, #1e3a8a, #0f172a)' } : { l: 'Photo · 1080²', bg: 'linear-gradient(135deg, #b45309, #7c2d12)' }; }),
      addMedia: function () { var n = media.slice(); n.push(hasVideo ? 'photo' : 'video'); self.setState({ media: n.slice(0, 4) }); toast(self, hasVideo ? 'Photo added.' : 'Video added: case drop test, 0:24.'); },
      link: link, onLink: function (e) { self.setState({ link: String(val(e) || '').trim() }); },
      checks: checks,
      aiTabs: [['gen', 'Generate'], ['rew', 'Rewrite']].map(function (t) { var on = t[0] === mode; return { l: t[1], on: on, bg: on ? '#fff' : 'transparent', fg: on ? 'var(--text-heading)' : 'var(--text-body)', pick: function () { self.setState({ mode: t[0] }); } }; }),
      genMode: mode === 'gen', rewMode: mode === 'rew',
      about: s.about == null ? '10% off chargers and cables for Puja with code PUJA10, until 20 October' : s.about, onAbout: function (e) { self.setState({ about: val(e) }); },
      tones: TONES.map(function (t) { var on = t[0] === tone; return { l: t[1], on: on, cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ tone: t[0] }); } }; }),
      gLang: [['en', 'EN'], ['bn', 'বাংলা'], ['mix', 'Mix']].map(function (o) { var on = o[0] === gl; return { l: o[1], on: on, bg: on ? '#fff' : 'transparent', fg: on ? 'var(--text-heading)' : 'var(--text-body)', sh: on ? '0 1px 2px rgba(15,23,42,.08)' : 'none', pick: function () { self.setState({ gl: o[0] }); } }; }),
      gLen: [['sm', 'Short'], ['md', 'Medium'], ['lg', 'Long']].map(function (o) { var on = o[0] === glen; return { l: o[1], on: on, bg: on ? '#fff' : 'transparent', fg: on ? 'var(--text-heading)' : 'var(--text-body)', sh: on ? '0 1px 2px rgba(15,23,42,.08)' : 'none', pick: function () { self.setState({ glen: o[0] }); } }; }),
      generate: function () { if (!(s.about == null ? 'x' : s.about).trim()) { toast(self, 'Say what the post is about first.', true); return; } self.setState({ gen: { tone: tone, gl: gl, glen: glen } }); },
      variants: s.gen ? GEN[s.gen.tone][s.gen.gl].map(function (t, i) { var tt = s.gen.glen === 'sm' ? t.split('\n')[0] : s.gen.glen === 'lg' ? t + (s.gen.gl === 'bn' ? '\nঢাকার ভেতরে ৳১,৫০০-এর বেশি অর্ডারে ফ্রি ডেলিভারি।' : s.gen.gl === 'mix' ? '\nDhakay ৳1,500+ order e free delivery.' : '\nFree delivery inside Dhaka on orders over ৳1,500.') : t; return { k: 'Version ' + (i + 1), t: tt, bn: s.gen.gl === 'bn' ? 'bn' : '', use: function () { self.setState({ text: tt, hist: hist.concat([text]), lang: s.gen.gl }); toast(self, 'Version ' + (i + 1) + ' is in the editor. Edit it freely.'); } }; }) : [],
      rewrites: [['Shorter', function (t) { return t.split('\n').slice(0, 2).join('\n'); }], ['More exciting', function (t) { return t.replace(/^([^\n]*?)\.?(\n|$)/, '$1!$2').replace('Get ', 'Grab '); }], ['Add emojis', function (t) { var ls = t.split('\n'); return ['🎉 ' + ls[0]].concat(ls.slice(1).map(function (l, i) { return l ? (i === 0 ? '🔌 ' : '🚚 ') + l : l; })).join('\n'); }], ['Fix grammar', function (t) { return t.replace(/\s+([.,!])/g, '$1').replace(/ {2,}/g, ' '); }], ['To Bangla', function () { return BASE.bn; }], ['To Benglish', function () { return BASE.mix; }], ['Add a call to action', function (t) { return t + '\nOrder now: link in bio.'; }], ['Fit X (280)', function (t) { var o = Array.from(t.split('\n')[0] + ' Code PUJA10.'); return o.slice(0, 200).join(''); }]].map(function (r) { return { l: r[0], run: function () { var nt = r[1](text); var lg = r[0] === 'To Bangla' ? 'bn' : r[0] === 'To Benglish' ? 'mix' : lang; self.setState({ text: nt, hist: hist.concat([text]), lastRw: r[0] + ' applied', lang: lg }); } }; }),
      lastRw: s.lastRw || '',
      date: date, time: time, onDate: function (e) { self.setState({ date: val(e) }); }, onTime: function (e) { self.setState({ time: val(e) }); },
      best: [['Today 9:00 PM', '2026-09-29', '21:00'], ['Thu 1 Oct, 8:00 PM', '2026-10-01', '20:00'], ['Fri 2 Oct, 3:00 PM', '2026-10-02', '15:00']].map(function (b) { var on = b[1] === date && b[2] === time; return { l: b[0], on: on, cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ date: b[1], time: b[2] }); } }; }),
      pvTabs: chosen.slice(0, 6).map(function (p) { var on = p[0] === pvk; return { l: p[1].replace(' broadcast', ''), ch: CH[p[0]], on: on, cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ pv: p[0] }); } }; }),
      pv: { ch: CH[pvk], n: pvp[1], acc: pvp[5], when: when, text: pvk === 'x' && len > 280 ? Array.from(text).slice(0, 230).join('') + '…' : text, tags: pvk === 'x' ? tagList.slice(0, 2).join(' ') : tagList.join(' '), hasMedia: media.length > 0, media: (media[0] === 'video' ? 'Video · 0:24 · case drop test' : 'Photo · Puja offer banner') + (media.length > 1 ? ' · +' + (media.length - 1) : ''), mbg: media[0] === 'video' ? 'linear-gradient(135deg, #1e3a8a, #0f172a)' : 'linear-gradient(135deg, #b45309, #7c2d12)', hasLink: !!link && pvk !== 'ig' },
      schedLabel: s.done === 'sched' ? 'Scheduled' : 'Schedule',
      postNow: function () { go(true); }, schedule: function () { go(false); }, saveDraft: function () { self.setState({ done: 'draft' }); toast(self, 'Draft saved. It shows in the calendar tray.'); }
    };
    return assign(v, msgV(s));
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:var(--font-sans);background:#e9eef5;color:#1e293b;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087}a:hover{color:#002a77}
.card{background:#ffffff;border-radius:var(--radius-xl);box-shadow:0 3px 10px 0 rgba(48,46,56,.06)}
.nav{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:var(--radius-lg);color:#475569;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:.01em;text-decoration:none;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 300ms ease-in-out}
.nav:hover{background:#f1f5f9;color:#0f172a;text-decoration:none}
.nav.on{background:rgba(0,48,135,.08);color:#003087}
.navh{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);color:var(--text-muted);padding:18px 12px 6px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:var(--radius-lg);border:0;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 200ms,border-color 200ms}
.btn:hover{text-decoration:none}
.btn:focus-visible,.nav:focus-visible,.ib:focus-visible,.tab:focus-visible,.chip:focus-visible,.step:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.soft{background:rgba(0,48,135,.08);color:#003087}.soft:hover{background:rgba(0,48,135,.16);color:#003087}
.line{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.line:hover{background:#f1f5f9;color:#1e293b}
.warnbtn{background:#b45309;color:#fff}.warnbtn:hover{background:#92400e;color:#fff}
.big{height:52px;padding:0 24px;font-size:var(--text-sm-plus)}
.sm{height:36px;padding:0 12px;font-size:var(--text-xs-plus)}
.ib{width:36px;height:36px;border-radius:var(--radius-full);border:0;background:transparent;color:#475569;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.ib:hover{background:rgba(203,213,225,.35);color:#0f172a}
.inp{width:100%;height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-sm);color:#1e293b;transition:border-color 200ms}
.inp:hover{border-color:#94a3b8}.inp:focus{outline:none;border-color:#003087}
.inp::placeholder{color:var(--text-muted)}
.lbl{font-size:var(--text-sm);line-height:18px;font-weight:var(--weight-medium);color:#334155}
.tab{height:36px;padding:0 14px;border-radius:var(--radius-full);border:0;background:transparent;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#475569;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,color 200ms}
.tab:hover{background:#f1f5f9;color:#0f172a}
.tab.on{background:#003087;color:#fff}
.chip{height:36px;padding:0 14px;border-radius:var(--radius-full);border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,border-color 200ms,color 200ms}
.chip:hover{border-color:#94a3b8}
.chip.on{border-color:#003087;background:rgba(0,48,135,.08);color:#003087}
.th{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);text-transform:uppercase;color:var(--text-muted);text-align:left;padding:12px 16px;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.td{padding:14px 16px;border-bottom:1px solid #eef2f6;font-size:var(--text-sm);line-height:20px;vertical-align:middle}
.row{transition:background-color 200ms}.row:hover{background:#f8fafc}
.badge{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.badge::before{content:"";width:6px;height:6px;border-radius:var(--radius-full);background:currentColor}.badge.sb::before{display:none}
.b-draft{background:#eef2f6;color:#475569}.b-approval{background:#fff4e0;color:#a14f06}.b-approved{background:#e0f2fe;color:#075985}
.b-ordered{background:rgba(0,48,135,.08);color:#003087}.b-partial{background:#fff1e6;color:#b4410c}.b-received{background:#e7f8f1;color:#047857}
.b-closed{background:#e2e8f0;color:#334155}.b-cancelled{background:#ffece6;color:#b83210}.b-over{background:#ffece6;color:#b83210}
.mono{font-family:var(--font-data);letter-spacing:.02em}
.fade{animation:gcFade 260ms cubic-bezier(0,0,.2,1)}
@keyframes gcFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.flash{animation:gcFlash 900ms ease-out}
@keyframes gcFlash{from{background:#e7f8f1}to{background:transparent}}
.scanline{animation:gcScan 1.8s ease-in-out infinite alternate}
@keyframes gcScan{from{transform:translateY(0)}to{transform:translateY(150px)}}

.sw{position:relative;width:48px;height:28px;border-radius:var(--radius-full);border:0;background:#cbd5e1;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:var(--radius-full);background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.25);transition:transform 200ms cubic-bezier(0,0,.2,1)}
.sw.on{background:#003087}.sw.on::after{transform:translateX(20px)}
.sw:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.b-live{background:#e7f8f1;color:#047857}.b-sched{background:#e0f2fe;color:#075985}.b-ended{background:#eef2f6;color:#475569}.b-paused{background:#fff4e0;color:#a14f06}
.t-member{background:#eef2f6;color:#475569}.t-silver{background:#e2e8f0;color:#334155}.t-gold{background:#fff4e0;color:#a14f06}.t-plat{background:rgba(0,48,135,.08);color:#003087}
.actc{border:1px solid transparent;transition:border-color 200ms,box-shadow 200ms}.actc:hover{border-color:#003087;box-shadow:0 6px 18px rgba(0,48,135,.12)}
.bn{font-family:var(--font-bn)}
.pulse{animation:gcPulse 1.6s ease-in-out infinite}
@keyframes gcPulse{0%,100%{opacity:1}50%{opacity:.45}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
.pcard{background:#fff;border:1px solid #e6eaf0;border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px -14px rgba(15,23,42,.10)}
.psec{font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.num{font-variant-numeric:tabular-nums}
.ai{height:28px;padding:0 10px;border-radius:var(--radius-lg);border:1px solid #d9d2fb;background:linear-gradient(135deg,#f5f3ff,#eef6ff);color:#5b21b6;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);display:inline-flex;align-items:center;gap:6px;cursor:pointer;transition:box-shadow 200ms,border-color 200ms}
.ai:hover{border-color:#a78bfa;box-shadow:0 4px 12px -6px rgba(91,33,182,.5)}
.ai:focus-visible{outline:3px solid rgba(124,58,237,.4);outline-offset:2px}
.abtn{height:32px;padding:0 12px;border-radius:var(--radius-lg);border:1px solid #e2e8f0;background:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.abtn:hover{background:#f1f5f9}
.ptabs{display:flex;gap:2px;padding:0 16px;border-bottom:1px solid #e6eaf0}
.ptab{position:relative;height:52px;padding:0 12px;border:0;background:transparent;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-muted);cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.ptab:hover{color:#0f172a}.ptab.on{color:#003087;font-weight:var(--weight-medium)}
.ptab.on::after{content:"";position:absolute;left:8px;right:8px;bottom:-1px;height:2.5px;border-radius:3px 3px 0 0;background:#003087}
.pcnt{min-width:20px;height:20px;padding:0 6px;border-radius:var(--radius-full);background:#eef2f6;color:#475569;font-size:var(--text-xs);font-weight:var(--weight-medium);display:inline-flex;align-items:center;justify-content:center}
.ptab.on .pcnt{background:rgba(0,48,135,.1);color:#003087}
.thumb{width:44px;height:44px;flex-shrink:0;border-radius:var(--radius-lg);border:1px solid #e6eaf0;display:flex;align-items:center;justify-content:center;font-weight:var(--weight-semibold);color:#003087}

.tc{background:#fff;border:1px solid #e7ebf2;border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04),0 12px 32px -20px rgba(15,23,42,.18)}
.ey{font-size:var(--text-xs);line-height:17px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.ey-d{color:rgba(203,216,238,.7)}
.tn{font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1;letter-spacing:0}
.dl{display:inline-flex;align-items:center;gap:3px;height:22px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);font-variant-numeric:tabular-nums}
.hero{position:relative;overflow:hidden;border-radius:var(--radius-xl);background:#0b1733;color:#fff;padding:24px 26px;--accent-text:#7fcff0;--text-success:#6ee7b7;--text-warning:#fcd34d;--text-danger:#fda4af;--text-info:#7dd3fc}
.hero::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:32px 32px;pointer-events:none}
.hero>*{position:relative}
.ht{border-radius:var(--radius-xl);background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.09);padding:14px 16px;display:flex;flex-direction:column;gap:6px;min-width:0}
.dseg{display:inline-flex;padding:3px;border-radius:var(--radius-full);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1)}
.dseg button{height:32px;padding:0 14px;border:0;border-radius:var(--radius-full);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer;transition:transform 160ms cubic-bezier(.23,1,.32,1),background-color 200ms ease}
.lseg{display:inline-flex;padding:3px;border-radius:var(--radius-xl);background:#f1f4f9;border:1px solid #e7ebf2}
.lseg button{height:32px;padding:0 13px;border:0;border-radius:var(--radius-lg);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer;transition:transform 160ms cubic-bezier(.23,1,.32,1),background-color 200ms ease,box-shadow 200ms ease}
button:active,.btn:active,.abtn:active{transform:scale(.97)}
.btn,.abtn{transition:transform 160ms cubic-bezier(.23,1,.32,1),background-color 200ms ease}
.st>*{animation:taUp 420ms cubic-bezier(.23,1,.32,1) both}
.st>*:nth-child(2){animation-delay:40ms}.st>*:nth-child(3){animation-delay:80ms}.st>*:nth-child(4){animation-delay:120ms}.st>*:nth-child(5){animation-delay:160ms}.st>*:nth-child(6){animation-delay:200ms}.st>*:nth-child(7){animation-delay:240ms}.st>*:nth-child(8){animation-delay:280ms}
@keyframes taUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.gr{transform-origin:left center;animation:taGrow 700ms cubic-bezier(.23,1,.32,1) both}
@keyframes taGrow{from{transform:scaleX(.35);opacity:0}to{transform:none;opacity:1}}
.draw{stroke-dasharray:1600;stroke-dashoffset:0;animation:taDraw 1100ms cubic-bezier(.77,0,.175,1) both}
@keyframes taDraw{from{stroke-dashoffset:1600}to{stroke-dashoffset:0}}
.fadein{animation:taFade 600ms ease both 200ms}@keyframes taFade{from{opacity:0}to{opacity:1}}
.tt{position:relative}
.tt .tip{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translate(-50%,4px) scale(.97);transform-origin:bottom center;opacity:0;pointer-events:none;transition:opacity 125ms ease-out,transform 125ms ease-out;background:#0b1733;color:#fff;border-radius:var(--radius-lg);padding:8px 10px;font-size:var(--text-xs);white-space:nowrap;box-shadow:0 10px 24px -8px rgba(15,23,42,.45);z-index:5}
.col{position:relative;flex:1;height:100%;border-radius:var(--radius-md);transition:background-color 150ms ease}
.col .tip{bottom:auto;top:6px}
.col .cl{position:absolute;top:0;bottom:0;left:50%;width:1px;background:rgba(15,23,42,.18);opacity:0;transition:opacity 125ms ease}
@media (hover:hover) and (pointer:fine){.tt:hover .tip,.col:hover .tip{opacity:1;transform:translate(-50%,0) scale(1)}.col:hover .cl{opacity:1}.row:hover{background:#f7f9fd}.tc.lift{transition:box-shadow 200ms ease,transform 200ms cubic-bezier(.23,1,.32,1)}.tc.lift:hover{box-shadow:0 1px 2px rgba(15,23,42,.05),0 18px 40px -20px rgba(15,23,42,.3)}}
.tb{width:100%;border-collapse:separate;border-spacing:0}
.tb th{font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted);text-align:left;padding:12px 16px;border-bottom:1px solid #eef1f6;background:#fbfcfe;white-space:nowrap}
.tb td{padding:13px 16px;border-bottom:1px solid #f1f4f8;font-size:var(--text-sm);vertical-align:middle}
.tb tr:last-child td{border-bottom:0}
.tb .r{text-align:right}
@media (prefers-reduced-motion:reduce){.st>*,.gr,.draw,.fadein{animation:none}}

.pgc>*{flex-shrink:0}.tb th{white-space:normal}.stp2{flex-shrink:0}.pgc>.fill{flex-shrink:1;min-height:0}
.sec{display:flex;flex-direction:column;gap:14px;padding:20px 22px}
.h2{margin:0;font-size:var(--text-base);line-height:22px;font-weight:var(--weight-semibold);color:#0f172a;letter-spacing:0}
.sub{margin:2px 0 0;font-size:var(--text-xs-plus);line-height:18px;color:var(--text-muted)}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.chk{display:flex;align-items:center;gap:14px;padding:12px 16px;border-bottom:1px solid #f1f4f8}
.chk:last-child{border-bottom:0}
.pill{display:inline-flex;align-items:center;height:24px;padding:0 9px;border-radius:var(--radius-full);background:#f1f4f9;font-size:var(--text-xs);color:#334155;white-space:nowrap}
.amt{height:36px;padding:0 16px;border-radius:var(--radius-lg);border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:#1e293b;cursor:pointer;font-variant-numeric:tabular-nums}
.amt.on{border-color:#003087;background:rgba(0,48,135,.06);color:#003087}
.amt:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.stp2{display:inline-flex;align-items:center;border:1px solid #cbd5e1;border-radius:var(--radius-lg);overflow:hidden;height:40px}
.stp2 button{width:38px;height:100%;border:0;background:#f8fafc;font:inherit;font-size:var(--text-base);cursor:pointer;color:#334155}
.stp2 span{min-width:64px;text-align:center;font-size:var(--text-sm);font-weight:var(--weight-medium);font-variant-numeric:tabular-nums}
.sel{height:44px;padding:0 12px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-sm);color:#1e293b;width:100%}
.msgb{max-width:78%;padding:10px 14px;border-radius:var(--radius-xl);font-size:var(--text-sm);line-height:20px}
.code{margin:0;padding:12px 14px;border-radius:var(--radius-lg);background:#0b1733;color:#cbd8ee;font-size:var(--text-xs);line-height:18px;white-space:pre-wrap;--text-muted:#94a3b8}
.lrow{display:flex;align-items:center;gap:12px;width:100%;padding:12px 16px;border:0;border-bottom:1px solid #f1f4f8;background:transparent;font:inherit;text-align:left;cursor:pointer}
.lrow:hover{background:#f7f9fd}.lrow.on{background:rgba(0,48,135,.05)}
.lrow:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:-3px}
.lseg{display:inline-flex;padding:3px;border-radius:var(--radius-xl);background:#f1f4f9;border:1px solid #e7ebf2}.lseg button{height:32px;padding:0 12px;border:0;border-radius:var(--radius-lg);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer}
.av{position:relative;width:46px;height:46px;border-radius:var(--radius-full);border:2px solid transparent;background:none;padding:2px;cursor:pointer;flex-shrink:0}
.av.on{border-color:#003087}.av .ck{position:absolute;right:-2px;bottom:-2px;width:18px;height:18px;border-radius:var(--radius-full);background:#003087;color:#fff;display:flex;align-items:center;justify-content:center;border:2px solid #fff}
.av:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.tbar{display:flex;flex-wrap:wrap;align-items:center;gap:2px;padding:6px;border-bottom:1px solid #e7ebf2;background:#fbfcfe;border-radius:var(--radius-xl) var(--radius-xl) 0 0}
.tbtn{white-space:nowrap;height:36px;min-width:34px;padding:0 9px;border:0;border-radius:var(--radius-lg);background:transparent;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.tbtn:hover{background:#eef2f7}.tbtn:focus-visible{outline:3px solid rgba(0,48,135,.5)}
.tsep{width:1px;height:20px;background:#e2e8f0;margin:0 4px}
.ed{border:1px solid #cbd5e1;border-radius:var(--radius-xl);background:#fff}
.ed textarea{width:100%;border:0;border-radius:0 0 var(--radius-xl) var(--radius-xl);padding:14px 16px;font:inherit;font-size:var(--text-sm-plus);line-height:23px;color:#0f172a;resize:vertical;min-height:170px}
.ed textarea:focus{outline:none}
.hash{height:28px;padding:0 11px;border-radius:var(--radius-full);border:1px dashed #b7c4dc;background:#fff;font:inherit;font-size:var(--text-xs-plus);color:#003087;cursor:pointer}
.hash.on{border-style:solid;background:rgba(0,48,135,.07)}
.hash:focus-visible{outline:3px solid rgba(0,48,135,.5)}
.media{width:92px;height:92px;border-radius:var(--radius-xl);display:flex;align-items:flex-end;padding:8px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:#fff;flex-shrink:0}
.aitab{flex:1;height:36px;border:0;border-radius:var(--radius-lg);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer}
.var{display:flex;flex-direction:column;gap:8px;padding:12px 14px;border-radius:var(--radius-xl);border:1px solid #e2e8f0;background:#fff}
.phone{border-radius:28px;border:8px solid #0f172a;background:#fff;overflow:hidden}
.emo{width:34px;height:36px;border:0;border-radius:var(--radius-lg);background:transparent;font-size:var(--text-lg);cursor:pointer}.emo:hover{background:#eef2f7}
`;

// ---- markup ----

export default class ComposerScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Composer">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="comm-new" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Communication" page="Create post" placeholder="Search" />
            <div className="pgc gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <__Link href="/calendar" className="abtn" style={{ textDecoration: "none" }}>Calendar</__Link>
                <div style={{ flexGrow: "1" }}>
                  <h1 style={{ margin: "0", fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a", letterSpacing: "var(--tracking-tight)" }}>Create post</h1>
                  <p className="sub">{v.status}</p>
                </div>
                <button type="button" className="btn line sm" onClick={v.saveDraft}>Save draft</button>
                <button type="button" className="btn line sm" onClick={v.postNow}>Post now</button>
                <button type="button" className="btn solid sm" onClick={v.schedule}>{v.schedLabel}</button>
              </div>
              {v.hasMsg ? (<>
                <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-lg); background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: var(--text-sm); font-weight: var(--weight-medium);`)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{v.msg}</span>
                </div>
              </>) : null}
              <div className="gc-split" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 380px", gap: "16px", alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <section className="tc sec">
                    <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                      <h2 className="h2" style={{ flexGrow: "1" }}>Post to</h2>
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.selNote}</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                      {__list(v.plats).map((p, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "68px" }}>
                            <button type="button" className={p?.cls} aria-pressed={p?.on} aria-label={p?.n} onClick={p?.pick} style={__sx(`opacity: ${p?.op ?? ""};`)}>
                              <__ChannelIcon channel={p?.ch} size={38} label={p?.n} />
                              {p?.on ? (<>
                                <span className="ck" aria-hidden="true"><__Icon name="check" width="12" height="12" /></span>
                              </>) : null}
                            </button>
                            <span style={{ fontSize: "var(--text-2xs)", lineHeight: "15px", textAlign: "center", color: "#475569" }}>{p?.short}</span>
                          </div>
                        </React.Fragment>))}
                    </div>
                  </section>
                  <section className="tc sec">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h2 className="h2" style={{ flexGrow: "1" }}>Write</h2>
                      <div className="lseg" role="radiogroup" aria-label="Language">
                        {__list(v.langs).map((m, $index) => (<React.Fragment key={$index}>
                            <button type="button" role="radio" aria-checked={m?.on} onClick={m?.pick} style={__sx(`background: ${m?.bg ?? ""}; color: ${m?.fg ?? ""}; box-shadow: ${m?.sh ?? ""};`)}>{m?.l}</button>
                          </React.Fragment>))}
                      </div>
                    </div>
                    <div className="ed">
                      <div className="tbar" role="toolbar" aria-label="Formatting">
                        <button type="button" className="tbtn" onClick={v.fBold} title="Bold headline" aria-label="Bold the first line">
                          <__Icon name="bold" width="16" height="16" aria-hidden="true" />
                        </button>
                        <button type="button" className="tbtn" onClick={v.fItal} aria-label="Italic the first line">
                          <__Icon name="italic" width="16" height="16" aria-hidden="true" />
                        </button>
                        <button type="button" className="tbtn" onClick={v.fList} aria-label="Bullet list"><__Icon name="list" width="16" height="16" aria-hidden="true" />List</button>
                        <span className="tsep" />
                        <button type="button" className="tbtn" onClick={v.fEmoji} aria-expanded={v.emojiOpen}><__Icon name="smile" width="16" height="16" aria-hidden="true" />Emoji</button>
                        <button type="button" className="tbtn" onClick={v.fHash}><__Icon name="hash" width="16" height="16" aria-hidden="true" />Hashtag</button>
                        <button type="button" className="tbtn" onClick={v.fMention}><__Icon name="at-sign" width="16" height="16" aria-hidden="true" />Mention</button>
                        <button type="button" className="tbtn" onClick={v.fVar}><__Icon name="braces" width="16" height="16" aria-hidden="true" />Price</button>
                        <span className="tsep" />
                        <button type="button" className="tbtn" onClick={v.undo} aria-label="Undo"><__Icon name="undo-2" width="16" height="16" aria-hidden="true" />Undo</button>
                        <span style={{ flexGrow: "1" }} />
                        <span className="tn" style={__sx(`font-size: var(--text-xs); color: ${v.countC ?? ""}; padding-right: 6px;`)}>{v.count}</span>
                      </div>
                      {v.emojiOpen ? (<>
                        <div style={{ display: "flex", gap: "2px", padding: "6px 8px", borderBottom: "1px solid #eef1f6" }}>
                          {__list(v.emojis).map((e, $index) => (<React.Fragment key={$index}>
                              <button type="button" className="emo" onClick={e?.add} aria-label={`Add ${e?.n ?? ""}`}>{e?.c}</button>
                            </React.Fragment>))}
                        </div>
                      </>) : null}
                      <textarea className={v.bnCls} aria-label="Post text" rows="8" onChange={v.onText} defaultValue={`${v.text ?? ""}`} />
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Bold and italic use Unicode letters, so they show on every platform. They work on English letters and numbers, not Bangla.</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                        <span className="lbl" style={{ flexGrow: "1" }}>Hashtags</span>
                        <span style={__sx(`font-size: var(--text-xs); color: ${v.hashC ?? ""};`)}>{v.hashNote}</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", width: "74px" }}>Saved sets</span>
                        {__list(v.sets).map((g, $index) => (<React.Fragment key={$index}>
                            <button type="button" className="chip" onClick={g?.add} style={{ height: "28px", fontSize: "var(--text-xs-plus)" }}>{g?.l} · {g?.n}</button>
                          </React.Fragment>))}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", width: "74px" }}>Suggested</span>
                        {__list(v.tags).map((h, $index) => (<React.Fragment key={$index}>
                            <button type="button" className={h?.cls} aria-pressed={h?.on} onClick={h?.toggle}>{h?.t}</button>
                          </React.Fragment>))}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <span className="lbl">Media</span>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        {__list(v.mediaList).map((m, $index) => (<React.Fragment key={$index}>
                            <div className="media" style={__sx(`background: ${m?.bg ?? ""};`)}>{m?.l}</div>
                          </React.Fragment>))}
                        <button type="button" onClick={v.addMedia} style={{ width: "92px", height: "92px", borderRadius: "var(--radius-lg)", border: "1.5px dashed #cbd5e1", background: "#f7f9fc", font: "inherit", fontSize: "var(--text-xs-plus)", color: "var(--text-body)", cursor: "pointer", display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px" }}><__Icon name="plus" width="16" height="16" aria-hidden="true" />Photo or video</button>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexGrow: "1", minWidth: "0" }}>
                          <label className="lbl" htmlFor="lnk">Link</label>
                          <input id="lnk" className="inp mono" value={v.link} onChange={v.onLink} placeholder="https://" />
                        </div>
                      </div>
                    </div>
                  </section>
                  <section className="tc" style={{ overflow: "hidden" }}>
                    <div style={{ padding: "18px 20px 12px" }}>
                      <h2 className="h2">Ready to publish?</h2>
                      <p className="sub">Each platform’s own limits, checked as you type.</p>
                    </div>
                    {__list(v.checks).map((k, $index) => (<React.Fragment key={$index}>
                        <div className="chk">
                          <__ChannelIcon channel={k?.ch} size={30} label={k?.n} />
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{k?.n}</div>
                            <div style={__sx(`font-size: var(--text-xs-plus); color: ${k?.mc ?? ""};`)}>{k?.m}</div>
                          </div>
                          <span className="tn" style={__sx(`font-size: var(--text-xs); color: ${k?.cc ?? ""};`)}>{k?.count}</span>
                          <span className="badge sb" style={__sx(`background: ${k?.bb ?? ""}; color: ${k?.bf ?? ""};`)}><__Icon name={k?.bi} width="12" height="12" aria-hidden="true" />{k?.b}</span>
                        </div>
                      </React.Fragment>))}
                  </section>
                </div>
                <aside style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <section className="tc sec" style={{ background: "linear-gradient(180deg, #f5f8ff, #fff 140px)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ width: "32px", height: "32px", borderRadius: "var(--radius-lg)", background: "#0b1733", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <h2 className="h2">GridAI writer</h2>
                        <p className="sub" style={{ margin: "0" }}>Free during the GridAI trial.</p>
                      </div>
                    </div>
                    <div role="tablist" aria-label="GridAI writer mode" style={{ display: "flex", gap: "4px", padding: "3px", borderRadius: "var(--radius-xl)", background: "#eef2f7" }}>
                      {__list(v.aiTabs).map((t, $index) => (<React.Fragment key={$index}>
                          <button type="button" className="aitab" role="tab" aria-selected={t?.on} onClick={t?.pick} style={__sx(`background: ${t?.bg ?? ""}; color: ${t?.fg ?? ""};`)}>{t?.l}</button>
                        </React.Fragment>))}
                    </div>
                    {v.genMode ? (<>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label className="lbl" htmlFor="about">What is the post about?</label>
                          <textarea id="about" className="inp" rows="2" onChange={v.onAbout} style={{ height: "auto", padding: "10px 12px", fontSize: "var(--text-sm)" }} defaultValue={`${v.about ?? ""}`} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className="lbl">Tone</span>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {__list(v.tones).map((t, $index) => (<React.Fragment key={$index}>
                                <button type="button" className={t?.cls} aria-pressed={t?.on} onClick={t?.pick} style={{ height: "32px", fontSize: "var(--text-xs-plus)" }}>{t?.l}</button>
                              </React.Fragment>))}
                          </div>
                        </div>
                        <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Language</span>
                            <div className="lseg" role="group" aria-label="Language">
                              {__list(v.gLang).map((m, $index) => (<React.Fragment key={$index}>
                                  <button type="button" aria-pressed={m?.on} onClick={m?.pick} style={__sx(`background: ${m?.bg ?? ""}; color: ${m?.fg ?? ""}; box-shadow: ${m?.sh ?? ""}; padding: 0 9px;`)}>{m?.l}</button>
                                </React.Fragment>))}
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span className="lbl">Length</span>
                            <div className="lseg" role="group" aria-label="Length">
                              {__list(v.gLen).map((m, $index) => (<React.Fragment key={$index}>
                                  <button type="button" aria-pressed={m?.on} onClick={m?.pick} style={__sx(`background: ${m?.bg ?? ""}; color: ${m?.fg ?? ""}; box-shadow: ${m?.sh ?? ""}; padding: 0 9px;`)}>{m?.l}</button>
                                </React.Fragment>))}
                            </div>
                          </div>
                        </div>
                        <button type="button" className="btn solid" onClick={v.generate}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
</svg> Generate 3 versions</button>
                        {__list(v.variants).map((v, $index) => (<React.Fragment key={$index}>
                            <div className="var">
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span className="pill">{v?.k}</span>
                                <span style={{ flexGrow: "1" }} />
                                <button type="button" className="abtn" onClick={v?.use}>Use this</button>
                              </div>
                              <div className={v?.bn} style={{ fontSize: "var(--text-xs-plus)", lineHeight: "20px", color: "#0f172a", whiteSpace: "pre-line" }}>{v?.t}</div>
                            </div>
                          </React.Fragment>))}
                      </div>
                    </>) : null}
                    {v.rewMode ? (<>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Rewrites the text in the editor. Undo brings it back.</span>
                        <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                          {__list(v.rewrites).map((r, $index) => (<React.Fragment key={$index}>
                              <button type="button" className="btn line sm" onClick={r?.run} style={{ justifyContent: "flex-start", height: "36px" }}>{r?.l}</button>
                            </React.Fragment>))}
                        </div>
                        {v.lastRw ? (<>
                          <div style={{ padding: "10px 12px", borderRadius: "var(--radius-lg)", background: "#e7f8f1", fontSize: "var(--text-xs-plus)", color: "#065f46" }}>{v.lastRw} · <button type="button" onClick={v.undo} style={{ border: "0", background: "none", padding: "0", font: "inherit", fontWeight: "var(--weight-medium)", color: "#065f46", textDecoration: "underline", cursor: "pointer" }}>Undo</button></div>
                        </>) : null}
                      </div>
                    </>) : null}
                  </section>
                  <section className="tc sec">
                    <div>
                      <h2 className="h2">When</h2>
                      <p className="sub">Dhaka time. Suggested times are when your followers were most active last month.</p>
                    </div>
                    <div className="row2">
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label className="lbl" htmlFor="dt">Date</label>
                        <input id="dt" className="inp" type="date" value={v.date} onChange={v.onDate} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label className="lbl" htmlFor="tm">Time</label>
                        <input id="tm" className="inp" type="time" value={v.time} onChange={v.onTime} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {__list(v.best).map((b, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={b?.cls} aria-pressed={b?.on} onClick={b?.pick} style={{ height: "32px", fontSize: "var(--text-xs-plus)" }}>{b?.l}</button>
                        </React.Fragment>))}
                    </div>
                  </section>
                  <section className="tc sec">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h2 className="h2" style={{ flexGrow: "1" }}>Preview</h2>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {__list(v.pvTabs).map((t, $index) => (<React.Fragment key={$index}>
                          <button type="button" className={t?.cls} aria-pressed={t?.on} onClick={t?.pick} style={{ height: "32px", fontSize: "var(--text-xs)", paddingLeft: "6px" }}><__ChannelIcon channel={t?.ch} size={20} label="" />{t?.l}</button>
                        </React.Fragment>))}
                    </div>
                    <div className="phone">
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderBottom: "1px solid #eef1f6" }}>
                        <__ChannelIcon channel={v.pv?.ch} size={32} label={v.pv?.n} />
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{v.pv?.acc}</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.pv?.when}</div>
                        </div>
                      </div>
                      {v.pv?.hasMedia ? (<>
                        <div style={__sx(`height: 210px; background: ${v.pv?.mbg ?? ""}; display: flex; align-items: flex-end; padding: 12px; font-size: var(--text-xs); font-weight: var(--weight-medium); color: #fff;`)}>{v.pv?.media}</div>
                      </>) : null}
                      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <p className={v.bnCls} style={{ margin: "0", fontSize: "var(--text-xs-plus)", lineHeight: "20px", color: "#0f172a", whiteSpace: "pre-line" }}>{v.pv?.text}</p>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "#1d4ed8" }}>{v.pv?.tags}</span>
                        {v.pv?.hasLink ? (<>
                          <span className="mono" style={{ fontSize: "var(--text-xs)", color: "#003087" }}>{v.link}</span>
                        </>) : null}
                      </div>
                    </div>
                  </section>
                </aside>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
