'use client';
// Create post — a Shopify-style create form (components/ui/IndexKit.jsx RecordHeader): where to post, the text with
// formatting and language, hashtags, media and link, and the per-platform checks on the left; when, the GridAI
// writer (folded away) and the preview on the right. Save draft / Post now / Schedule sit in the title row.
// Edit freely: this file is the source for the screen.

import React from 'react';
import { DCLogic, Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { toast } from '@/runtime/ui';
import { ChannelIcon, InfoTip, StatusBadge } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';

// ---- logic ----

function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function val(e) { return e && e.target ? e.target.value : e; }

// key, name, short, (colour: unused, the channel icon brings its own), auto?, account, status, supports, note
var PLAT = [
  ['fb', 'Facebook Page', 'FB', '', true, 'Dazzle Shop', 'ok', 'Text, photos, videos, links', 'Posts go out at the scheduled minute.'],
  ['ig', 'Instagram', 'IG', '', true, '@dazzleshop.bd', 'ok', 'Photos, carousels, Reels', 'Needs a photo or video. Business account linked to the Facebook Page.'],
  ['wa', 'WhatsApp broadcast', 'WA', '', true, '+880 1711-482093', 'ok', 'Template message with photo', 'Goes only to customers who opted in. ৳1.10 per message from the wallet.'],
  ['tt', 'TikTok', 'TT', '', true, '@dazzleshop', 'renew', 'Videos, photo posts', 'Access expires in 3 days. Reconnect to keep posting.'],
  ['yt', 'YouTube', 'YT', '', true, 'Dazzle Shop', 'ok', 'Videos and Shorts', 'Needs a video.'],
  ['x', 'X', 'X', '', true, '@dazzleshopbd', 'off', 'Text up to 280 characters, photos', 'How many posts a month depends on the X API plan.'],
  ['pin', 'Pinterest', 'PIN', '', true, 'Not connected', 'off', 'Pins with photo and link', 'Each pin needs a photo and a link.'],
  ['wac', 'WhatsApp Channel', 'WAC', '', false, 'Dazzle Shop Offers', 'manual', 'Reminder with the text ready to copy', 'WhatsApp has no posting API for channels, so a reminder is sent to post by hand.'],
  ['fbg', 'Facebook groups', 'FBG', '', false, '3 groups', 'manual', 'Reminder with the text ready to copy', 'Meta closed group posting by API in 2024, so a reminder is sent to post by hand.'],
  ['li', 'LinkedIn page', 'IN', '', true, 'Dazzle Shop Ltd', 'ok', 'Text, photos, links', 'Company page only, not personal profiles.']
];
var CH = { fb: 'facebook', ig: 'instagram', wa: 'whatsapp', tt: 'tiktok', yt: 'youtube', x: 'x', pin: 'pinterest', wac: 'whatsapp', fbg: 'facebook', li: 'linkedin' };
var CK_ICON = { bad: 'triangle-alert', warn: 'clock', info: 'info', ok: 'check' };
function plat(k) { return PLAT.filter(function (p) { return p[0] === k; })[0]; }

var BASE = { en: 'Puja is here.\nGet 10% off every charger and cable with code PUJA10, until 20 October.\nFree delivery inside Dhaka on orders over ৳1,500.', bn: 'পূজা এসে গেছে!\nPUJA10 কোডে সব চার্জার ও ক্যাবলে ১০% ছাড়, ২০ অক্টোবর পর্যন্ত।\nঢাকার ভেতরে ৳১,৫০০-এর বেশি অর্ডারে ফ্রি ডেলিভারি।', mix: 'Puja offer cholche!\nPUJA10 code diye shob charger ar cable e 10% off, 20 October porjonto.\nDhakar bhitore ৳1,500+ order e free delivery.' };
var SETS = [['Brand', ['#Dazzle Shop', '#Dazzle ShopBD']], ['Puja offer', ['#PujaOffer', '#পূজার_অফার', '#DurgaPuja']], ['Phone care', ['#PhoneAccessoriesBD', '#PhoneCase', '#FastCharger']]];
var SUGG = ['#Dazzle Shop', '#PujaOffer', '#DhakaShopping', '#PhoneAccessoriesBD', '#FastCharger', '#পূজার_অফার', '#OnlineShoppingBD', '#Discount'];
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
  renderVals() {
    var self = this, s = this.state || {};
    var sel = s.sel || { fb: 1, ig: 1, wa: 1, tt: 1, wac: 1 };
    var lang = s.lang || 'en', text = s.text == null ? BASE[lang] : s.text, hist = s.hist || [];
    var tags = s.tags || { '#Dazzle Shop': 1, '#PujaOffer': 1, '#DhakaShopping': 1 };
    var media = s.media || ['photo'], link = s.link == null ? 'https://dazzleshop.com.bd/offers/puja' : s.link;
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
    var checks = chosen.map(function (p) { var i = issue(p); var B = { bad: ['Fix', 'error'], warn: ['Check', 'warning'], info: ['Info', 'info'], ok: ['Ready', 'success'] }[i[1]];
      return { n: p[1], ch: CH[p[0]], bi: CK_ICON[i[1]], m: i[0], b: B[0], tone: B[1], bad: i[1] === 'bad', count: LIM[p[0]] ? len.toLocaleString('en-IN') + ' / ' + LIM[p[0]].toLocaleString('en-IN') : '', over: !!(LIM[p[0]] && len > LIM[p[0]]) }; });
    var bad = checks.filter(function (k) { return k.bad; }).length;
    var d = new Date(date + 'T' + time + ':00'), MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var when = isNaN(d) ? '—' : d.getDate() + ' ' + MON[d.getMonth()] + ', ' + ((d.getHours() % 12) || 12) + ':' + String(d.getMinutes()).padStart(2, '0') + ' ' + (d.getHours() >= 12 ? 'pm' : 'am');
    var pvk = s.pv && sel[s.pv] ? s.pv : (chosen[0] || PLAT[0])[0], pvp = plat(pvk);
    function go(now) { if (!chosen.length) { toast('Pick at least one place to post.', { tone: 'error' }); return; } if (bad) { toast(bad + (bad === 1 ? ' platform needs' : ' platforms need') + ' fixing first. See Ready to publish.', { tone: 'error' }); return; }
      var auto = chosen.filter(function (p) { return p[4]; }).length, man = chosen.length - auto; self.setState({ done: now ? 'now' : 'sched' });
      toast((now ? 'Posting now to ' : 'Scheduled for ' + when + ' on ') + auto + ' platform' + (auto === 1 ? '' : 's') + (man ? ', with ' + man + ' reminder' + (man > 1 ? 's' : '') + ' to post by hand.' : '.')); }
    var firstLine = function (fn) { var ls = text.split('\n'); ls[0] = fn(ls[0]); return ls.join('\n'); };
    var v = {
      status: s.done === 'sched' ? 'Scheduled for ' + when : s.done === 'draft' ? 'Draft saved' : 'Draft · not saved yet',
      plats: PLAT.map(function (p) { var on = !!sel[p[0]]; return { n: p[1], ch: CH[p[0]], short: p[1].replace('WhatsApp broadcast', 'WhatsApp').replace('Facebook Page', 'Facebook').replace('WhatsApp Channel', 'WA Channel').replace('Facebook groups', 'FB groups').replace('LinkedIn page', 'LinkedIn'), on: on, off: p[6] === 'off', pick: function () { var n = assign({}, sel); if (on) delete n[p[0]]; else n[p[0]] = 1; self.setState({ sel: n }); } }; }),
      selNote: chosen.length + ' selected · ' + chosen.filter(function (p) { return !p[4]; }).length + ' by reminder',
      langs: [['en', 'English'], ['bn', 'বাংলা'], ['mix', 'Benglish']].map(function (o) { var on = o[0] === lang; return { l: o[1], on: on, pick: function () { self.setState({ lang: o[0], text: BASE[o[0]], hist: hist.concat([text]) }); } }; }),
      bnCls: lang === 'bn' ? 'bn' : '',
      text: text, onText: function (e) { self.setState({ text: val(e) }); },
      count: len.toLocaleString('en-IN') + ' characters', over: chosen.some(function (p) { return LIM[p[0]] && len > LIM[p[0]]; }),
      fBold: function () { setText(firstLine(function (l) { return styl(l, BOLD_A, BOLD_a, BOLD_0); })); }, fItal: function () { setText(firstLine(function (l) { return styl(l, IT_A, IT_a, 0); })); },
      fList: function () { var ls = text.split('\n'); setText([ls[0]].concat(ls.slice(1).map(function (l) { return l && l.indexOf('• ') !== 0 ? '• ' + l : l; })).join('\n')); },
      emojiOpen: !!s.emo, fEmoji: function () { self.setState({ emo: !s.emo }); },
      emojis: EMO.map(function (e) { return { n: e[0], c: e[1], add: function () { setText(text.replace(/\n?$/, ' ' + e[1])); } }; }),
      fHash: function () { toast('Pick hashtags below. They are added at the end, so the text stays clean.'); },
      fMention: function () { setText(text + ' @dazzleshop.bd'); }, fVar: function () { setText(text + ' {price}'); toast('{price} is filled with the product price when the post goes out.'); },
      undo: function () { if (!hist.length) return; self.setState({ text: hist[hist.length - 1], hist: hist.slice(0, -1), lastRw: '' }); },
      hashNote: tagList.length + ' hashtags · Instagram allows 30, X works best with 1 or 2', hashOver: tagList.length > 30,
      sets: SETS.map(function (g) { return { l: g[0], n: g[1].length, add: function () { var n = assign({}, tags); g[1].forEach(function (t) { n[t] = 1; }); self.setState({ tags: n }); } }; }),
      tags: SUGG.concat(tagList.filter(function (t) { return SUGG.indexOf(t) < 0; })).map(function (t) { var on = !!tags[t]; return { t: t, on: on, cls: on ? 'hash on' : 'hash', toggle: function () { var n = assign({}, tags); if (on) delete n[t]; else n[t] = 1; self.setState({ tags: n }); } }; }),
      mediaList: media.map(function (m) { return m === 'video' ? { l: 'Video · 0:24', k: 'video' } : { l: 'Photo · 1080²', k: 'photo' }; }),
      addMedia: function () { var n = media.slice(); n.push(hasVideo ? 'photo' : 'video'); self.setState({ media: n.slice(0, 4) }); toast(hasVideo ? 'Photo added.' : 'Video added: case drop test, 0:24.'); },
      link: link, onLink: function (e) { self.setState({ link: String(val(e) || '').trim() }); },
      checks: checks,
      aiTabs: [['gen', 'Generate'], ['rew', 'Rewrite']].map(function (t) { var on = t[0] === mode; return { l: t[1], on: on, pick: function () { self.setState({ mode: t[0] }); } }; }),
      genMode: mode === 'gen', rewMode: mode === 'rew',
      about: s.about == null ? '10% off chargers and cables for Puja with code PUJA10, until 20 October' : s.about, onAbout: function (e) { self.setState({ about: val(e) }); },
      tones: TONES.map(function (t) { var on = t[0] === tone; return { l: t[1], on: on, cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ tone: t[0] }); } }; }),
      gLang: [['en', 'EN'], ['bn', 'বাংলা'], ['mix', 'Mix']].map(function (o) { var on = o[0] === gl; return { l: o[1], on: on, pick: function () { self.setState({ gl: o[0] }); } }; }),
      gLen: [['sm', 'Short'], ['md', 'Medium'], ['lg', 'Long']].map(function (o) { var on = o[0] === glen; return { l: o[1], on: on, pick: function () { self.setState({ glen: o[0] }); } }; }),
      generate: function () { if (!(s.about == null ? 'x' : s.about).trim()) { toast('Say what the post is about first.', { tone: 'error' }); return; } self.setState({ gen: { tone: tone, gl: gl, glen: glen } }); },
      variants: s.gen ? GEN[s.gen.tone][s.gen.gl].map(function (t, i) { var tt = s.gen.glen === 'sm' ? t.split('\n')[0] : s.gen.glen === 'lg' ? t + (s.gen.gl === 'bn' ? '\nঢাকার ভেতরে ৳১,৫০০-এর বেশি অর্ডারে ফ্রি ডেলিভারি।' : s.gen.gl === 'mix' ? '\nDhakay ৳1,500+ order e free delivery.' : '\nFree delivery inside Dhaka on orders over ৳1,500.') : t; return { k: 'Version ' + (i + 1), t: tt, bn: s.gen.gl === 'bn' ? 'bn' : '', use: function () { self.setState({ text: tt, hist: hist.concat([text]), lang: s.gen.gl }); toast('Version ' + (i + 1) + ' is in the editor. Edit it freely.'); } }; }) : [],
      rewrites: [['Shorter', function (t) { return t.split('\n').slice(0, 2).join('\n'); }], ['More exciting', function (t) { return t.replace(/^([^\n]*?)\.?(\n|$)/, '$1!$2').replace('Get ', 'Grab '); }], ['Add emojis', function (t) { var ls = t.split('\n'); return ['🎉 ' + ls[0]].concat(ls.slice(1).map(function (l, i) { return l ? (i === 0 ? '🔌 ' : '🚚 ') + l : l; })).join('\n'); }], ['Fix grammar', function (t) { return t.replace(/\s+([.,!])/g, '$1').replace(/ {2,}/g, ' '); }], ['To Bangla', function () { return BASE.bn; }], ['To Benglish', function () { return BASE.mix; }], ['Add a call to action', function (t) { return t + '\nOrder now: link in bio.'; }], ['Fit X (280)', function (t) { var o = Array.from(t.split('\n')[0] + ' Code PUJA10.'); return o.slice(0, 200).join(''); }]].map(function (r) { return { l: r[0], run: function () { var nt = r[1](text); var lg = r[0] === 'To Bangla' ? 'bn' : r[0] === 'To Benglish' ? 'mix' : lang; self.setState({ text: nt, hist: hist.concat([text]), lastRw: r[0] + ' applied', lang: lg }); } }; }),
      lastRw: s.lastRw || '',
      date: date, time: time, onDate: function (e) { self.setState({ date: val(e) }); }, onTime: function (e) { self.setState({ time: val(e) }); },
      best: [['Today 9:00 PM', '2026-09-29', '21:00'], ['Thu 1 Oct, 8:00 PM', '2026-10-01', '20:00'], ['Fri 2 Oct, 3:00 PM', '2026-10-02', '15:00']].map(function (b) { var on = b[1] === date && b[2] === time; return { l: b[0], on: on, cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ date: b[1], time: b[2] }); } }; }),
      pvTabs: chosen.slice(0, 6).map(function (p) { var on = p[0] === pvk; return { l: p[1].replace(' broadcast', ''), ch: CH[p[0]], on: on, cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ pv: p[0] }); } }; }),
      pv: { ch: CH[pvk], n: pvp[1], acc: pvp[5], when: when, text: pvk === 'x' && len > 280 ? Array.from(text).slice(0, 230).join('') + '…' : text, tags: pvk === 'x' ? tagList.slice(0, 2).join(' ') : tagList.join(' '), hasMedia: media.length > 0, media: (media[0] === 'video' ? 'Video · 0:24 · case drop test' : 'Photo · Puja offer banner') + (media.length > 1 ? ' · +' + (media.length - 1) : ''), video: media[0] === 'video', hasLink: !!link && pvk !== 'ig' },
      schedLabel: s.done === 'sched' ? 'Scheduled' : 'Schedule',
      postNow: function () { go(true); }, schedule: function () { go(false); }, saveDraft: function () { self.setState({ done: 'draft' }); toast('Draft saved. It shows in the calendar tray.'); }
    };
    return v;
  }
}

// ---- styles ----

const CSS = `
.cmp-body{display:flex;flex-direction:column;gap:var(--space-3)}
.cmp-plat.is-off{opacity:.55}
.cmp-plat{padding-left:4px}
.cmp .ix-chip:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.cmp-tag{border-style:dashed;color:var(--primary)}
.cmp-tag[aria-pressed="true"]{border-style:solid}
.cmp-ed{border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-card)}
.cmp-ed:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px var(--fill-primary-soft)}
.cmp-tbar{display:flex;flex-wrap:wrap;align-items:center;gap:2px;padding:4px;border-bottom:1px solid var(--border-subtle)}
.cmp-tbtn{display:inline-flex;align-items:center;gap:6px;height:28px;min-width:28px;padding:0 8px;border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);white-space:nowrap;cursor:pointer}
.cmp-tbtn:hover{background:var(--surface-subtle);color:var(--text-heading)}
.cmp-tbtn:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.cmp-tsep{width:1px;height:16px;margin:0 4px;background:var(--border-subtle)}
.cmp-count{margin-left:auto;padding-right:6px;font-size:var(--text-xs);color:var(--text-muted);font-variant-numeric:tabular-nums}
.cmp-count.is-over,.cmp-over{color:var(--text-danger)}
.cmp-emo{display:flex;flex-wrap:wrap;gap:2px;padding:4px 6px;border-bottom:1px solid var(--border-subtle)}
.cmp-emo button{width:32px;height:32px;border:0;border-radius:var(--radius-md);background:none;font-size:var(--text-base);cursor:pointer}
.cmp-emo button:hover{background:var(--surface-subtle)}
.cmp-ed textarea{display:block;width:100%;min-height:150px;padding:var(--space-3);border:0;border-radius:0 0 var(--radius-lg) var(--radius-lg);background:none;font:inherit;font-size:var(--text-sm);line-height:22px;color:var(--text-heading);resize:vertical}
.cmp-ed textarea:focus{outline:none}
.cmp-row{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.cmp-row>.cmp-lab{width:74px;font-size:var(--text-xs);color:var(--text-muted)}
.cmp-sub{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.cmp-media{display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-2)}
.cmp-tile{display:flex;align-items:flex-end;width:72px;height:72px;padding:6px;border-radius:var(--radius-lg);background:var(--fill-warning-soft);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-warning)}
.cmp-tile--video{background:var(--fill-primary-soft);color:var(--primary)}
.cmp-add{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;width:72px;height:72px;border:1px dashed var(--border-strong);border-radius:var(--radius-lg);background:var(--surface-subtle);font:inherit;font-size:var(--text-xs);color:var(--text-body);cursor:pointer}
.cmp-link{flex:1 1 220px;min-width:0}
.cmp-link .gc-input{font-family:var(--font-data)}
.cmp-checks{display:flex;flex-direction:column;margin-top:var(--space-3)}
.cmp-check{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:6px var(--space-4);border-top:1px solid var(--border-subtle)}
.cmp-check__text{flex:1;min-width:0;display:flex;flex-direction:column}
.cmp-check__text b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cmp-check__text span{font-size:var(--text-xs);color:var(--text-body)}
.cmp-check__text span.is-bad{color:var(--text-danger)}
.cmp-check__n{font-size:var(--text-xs);color:var(--text-muted);font-variant-numeric:tabular-nums}
.cmp-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.cmp-two .gc-label{margin-bottom:6px}
.cmp-var{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.cmp-var__top{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.cmp-var p{margin:0;font-size:var(--text-xs-plus);line-height:20px;color:var(--text-heading);white-space:pre-line}
.cmp-rw{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.cmp-rw .ix-btn{justify-content:flex-start}
.cmp-done{display:flex;align-items:center;gap:6px;padding:8px 10px;border-radius:var(--radius-lg);background:var(--fill-success-soft);font-size:var(--text-xs-plus);color:var(--text-success)}
.cmp-done button{padding:0;border:0;background:none;font:inherit;font-weight:var(--weight-medium);color:inherit;text-decoration:underline;cursor:pointer}
.cmp-pv{overflow:hidden;border:1px solid var(--border-subtle);border-radius:var(--radius-xl)}
.cmp-pv__head{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--border-subtle)}
.cmp-pv__head b{display:block;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-heading)}
.cmp-pv__head small{font-size:var(--text-xs);color:var(--text-muted)}
.cmp-pv__media{display:flex;align-items:flex-end;height:160px;padding:10px;background:var(--fill-warning-soft);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-warning)}
.cmp-pv__media.is-video{background:var(--fill-primary-soft);color:var(--primary)}
.cmp-pv__body{display:flex;flex-direction:column;gap:6px;padding:10px 12px}
.cmp-pv__body p{margin:0;font-size:var(--text-xs-plus);line-height:20px;color:var(--text-heading);white-space:pre-line}
.cmp-pv__tags{font-size:var(--text-xs-plus);color:var(--text-link)}
.cmp-pv__link{font-family:var(--font-data);font-size:var(--text-xs);color:var(--primary)}
.cmp .gc-disclose>summary{min-height:44px;padding:var(--space-3) var(--space-4)}
.cmp .gc-disclose>:not(summary){margin:0 var(--space-4) var(--space-4)}
.cmp-ai{display:flex;flex-direction:column;gap:var(--space-3)}
@media (max-width:640px){
  .cmp-row>.cmp-lab{width:100%}
  .cmp-two{grid-template-columns:minmax(0,1fr)}
}
`;

// ---- markup ----

function Seg({ items, label, role = 'radiogroup' }) {
  return (
    <div className="gc-seg" role={role} aria-label={label}>
      {items.map((m) => <button key={m.l} type="button" role={role === 'radiogroup' ? 'radio' : undefined} aria-checked={role === 'radiogroup' ? m.on : undefined} aria-pressed={role === 'radiogroup' ? undefined : m.on} className={'gc-seg__btn' + (m.on ? ' gc-seg__btn--active' : '')} onClick={m.pick}>{m.l}</button>)}
    </div>
  );
}

export default class ComposerScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const st = this.state || {};
    const badge = st.done === 'sched' ? <StatusBadge tone="info" icon="clock">Scheduled</StatusBadge> : <StatusBadge tone="neutral" icon="pencil">Draft</StatusBadge>;
    return (
      <div className="dc-screen ds cmp" data-screen="Composer">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <Sidebar sticky="" active="comm-new" />
          <main className="gc-shell__main">
            <Topbar crumb="Communication" page="Create post" />
            <div className="gc-shell__content">
              <div className="ix-page ix-page--narrow">
                <RecordHeader back="/calendar" backLabel="Post calendar" title="Create post" badges={badge} meta={v.status}
                  about="Write one post and send it to several places at once: Facebook, Instagram, WhatsApp, TikTok and more. Each place's limits are checked as you type; GridAI can write or rewrite the text."
                  secondary={[{ label: 'Save draft', onClick: v.saveDraft }, { label: 'Post now', onClick: v.postNow }]}
                  primary={{ label: v.schedLabel, onClick: v.schedule }} />

                <div className="ix-record">
                  <div className="ix-main">
                    <section className="ix-card" aria-labelledby="cmp-to">
                      <header className="ix-card__head"><div><h2 id="cmp-to">Post to</h2><p className="ix-card__sub">{v.selNote}</p></div></header>
                      <div className="ix-card__body">
                        <div className="ix-chips">
                          {v.plats.map((p) => (
                            <button key={p.n} type="button" className={'ix-chip cmp-plat' + (p.off ? ' is-off' : '')} aria-pressed={p.on} aria-label={p.n} title={p.n} onClick={p.pick}>
                              <ChannelIcon channel={p.ch} size={20} decorative />{p.short}
                            </button>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section className="ix-card ix-card--open" aria-labelledby="cmp-write">
                      <header className="ix-card__head"><h2 id="cmp-write">Write <InfoTip text="Bold and italic use Unicode letters, so they show on every platform. They work on English letters and numbers, not Bangla." /></h2><Seg label="Language" items={v.langs} /></header>
                      <div className="ix-card__body cmp-body">
                        <div className="cmp-ed">
                          <div className="cmp-tbar" role="toolbar" aria-label="Formatting">
                            <button type="button" className="cmp-tbtn" onClick={v.fBold} title="Bold headline" aria-label="Bold the first line"><Icon name="bold" width="16" height="16" aria-hidden="true" /></button>
                            <button type="button" className="cmp-tbtn" onClick={v.fItal} aria-label="Italic the first line"><Icon name="italic" width="16" height="16" aria-hidden="true" /></button>
                            <button type="button" className="cmp-tbtn" onClick={v.fList} aria-label="Bullet list"><Icon name="list" width="16" height="16" aria-hidden="true" />List</button>
                            <span className="cmp-tsep" />
                            <button type="button" className="cmp-tbtn" onClick={v.fEmoji} aria-expanded={v.emojiOpen}><Icon name="smile" width="16" height="16" aria-hidden="true" />Emoji</button>
                            <button type="button" className="cmp-tbtn" onClick={v.fHash}><Icon name="hash" width="16" height="16" aria-hidden="true" />Hashtag</button>
                            <button type="button" className="cmp-tbtn" onClick={v.fMention}><Icon name="at-sign" width="16" height="16" aria-hidden="true" />Mention</button>
                            <button type="button" className="cmp-tbtn" onClick={v.fVar}><Icon name="braces" width="16" height="16" aria-hidden="true" />Price</button>
                            <span className="cmp-tsep" />
                            <button type="button" className="cmp-tbtn" onClick={v.undo} aria-label="Undo"><Icon name="undo-2" width="16" height="16" aria-hidden="true" />Undo</button>
                            <span className={'cmp-count' + (v.over ? ' is-over' : '')}>{v.count}</span>
                          </div>
                          {v.emojiOpen ? (
                            <div className="cmp-emo">{v.emojis.map((e) => <button key={e.n} type="button" onClick={e.add} aria-label={'Add ' + e.n}>{e.c}</button>)}</div>
                          ) : null}
                          <textarea className={v.bnCls} aria-label="Post text" rows="7" onChange={v.onText} value={v.text} />
                        </div>
                      </div>
                    </section>

                    <section className="ix-card" aria-labelledby="cmp-tags">
                      <header className="ix-card__head"><div><h2 id="cmp-tags">Hashtags</h2><p className={'ix-card__sub' + (v.hashOver ? ' cmp-over' : '')}>{v.hashNote}</p></div></header>
                      <div className="ix-card__body cmp-body">
                        <div className="cmp-row"><span className="cmp-lab">Saved sets</span>{v.sets.map((g) => <button key={g.l} type="button" className="ix-chip" onClick={g.add}>{g.l} · {g.n}</button>)}</div>
                        <div className="cmp-row"><span className="cmp-lab">Suggested</span>{v.tags.map((h) => <button key={h.t} type="button" className="ix-chip cmp-tag" aria-pressed={h.on} onClick={h.toggle}>{h.t}</button>)}</div>
                      </div>
                    </section>

                    <section className="ix-card" aria-labelledby="cmp-media">
                      <header className="ix-card__head"><h2 id="cmp-media">Media and link</h2></header>
                      <div className="ix-card__body">
                        <div className="cmp-media">
                          {v.mediaList.map((m, i) => <div key={i} className={'cmp-tile' + (m.k === 'video' ? ' cmp-tile--video' : '')}>{m.l}</div>)}
                          <button type="button" className="cmp-add" onClick={v.addMedia}><Icon name="plus" width="16" height="16" aria-hidden="true" />Photo or video</button>
                          <div className="cmp-link"><label className="gc-label" htmlFor="lnk">Link</label><input id="lnk" className="gc-input" value={v.link} onChange={v.onLink} placeholder="https://" /></div>
                        </div>
                      </div>
                    </section>

                    <section className="ix-card" aria-labelledby="cmp-ready">
                      <header className="ix-card__head"><h2 id="cmp-ready">Ready to publish?</h2></header>
                      <div className="cmp-checks">
                        {v.checks.map((k) => (
                          <div key={k.n} className="cmp-check">
                            <ChannelIcon channel={k.ch} size={20} label={k.n} />
                            <span className="cmp-check__text"><b>{k.n}</b><span className={k.bad ? 'is-bad' : ''}>{k.m}</span></span>
                            {k.count ? <span className={'cmp-check__n' + (k.over ? ' cmp-over' : '')}>{k.count}</span> : null}
                            <StatusBadge tone={k.tone} icon={k.bi}>{k.b}</StatusBadge>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="ix-side">
                    <section className="ix-card ix-card--open" aria-labelledby="cmp-when">
                      <header className="ix-card__head"><h2 id="cmp-when">When <InfoTip text="Dhaka time. Suggested times are when your followers were most active last month." /></h2></header>
                      <div className="ix-card__body cmp-body">
                        <div className="cmp-two">
                          <div><label className="gc-label" htmlFor="dt">Date</label><input id="dt" className="gc-input" type="date" value={v.date} onChange={v.onDate} /></div>
                          <div><label className="gc-label" htmlFor="tm">Time</label><input id="tm" className="gc-input" type="time" value={v.time} onChange={v.onTime} /></div>
                        </div>
                        <div className="ix-chips">{v.best.map((b) => <button key={b.l} type="button" className="ix-chip" aria-pressed={b.on} onClick={b.pick}>{b.l}</button>)}</div>
                      </div>
                    </section>

                    <details className="ix-card gc-disclose">
                      <summary><Icon name="sparkles" width="16" height="16" aria-hidden="true" />GridAI writer</summary>
                      <div className="cmp-ai">
                        <Seg label="GridAI writer mode" items={v.aiTabs} />
                        {v.genMode ? (<>
                          <div><label className="gc-label" htmlFor="about">What is the post about?</label><textarea id="about" className="gc-input" rows="2" onChange={v.onAbout} value={v.about} /></div>
                          <div><span className="gc-label">Tone</span><div className="ix-chips">{v.tones.map((t) => <button key={t.l} type="button" className="ix-chip" aria-pressed={t.on} onClick={t.pick}>{t.l}</button>)}</div></div>
                          <div className="cmp-two">
                            <div><span className="gc-label">Language</span><Seg label="Language" role="group" items={v.gLang} /></div>
                            <div><span className="gc-label">Length</span><Seg label="Length" role="group" items={v.gLen} /></div>
                          </div>
                          <button type="button" className="ix-btn ix-btn--primary" onClick={v.generate}><Icon name="sparkles" width="16" height="16" aria-hidden="true" />Generate 3 versions</button>
                          {v.variants.map((x) => (
                            <div key={x.k} className="cmp-var">
                              <span className="cmp-var__top">{x.k}<button type="button" className="ix-btn ix-btn--sm" onClick={x.use}>Use this</button></span>
                              <p className={x.bn}>{x.t}</p>
                            </div>
                          ))}
                        </>) : null}
                        {v.rewMode ? (<>
                          <p className="cmp-sub">Rewrites the text in the editor. Undo brings it back.</p>
                          <div className="cmp-rw">{v.rewrites.map((r) => <button key={r.l} type="button" className="ix-btn ix-btn--sm" onClick={r.run}>{r.l}</button>)}</div>
                          {v.lastRw ? <div className="cmp-done">{v.lastRw} · <button type="button" onClick={v.undo}>Undo</button></div> : null}
                        </>) : null}
                        <p className="cmp-sub">Free during the GridAI trial.</p>
                      </div>
                    </details>

                    <section className="ix-card" aria-labelledby="cmp-pv">
                      <header className="ix-card__head"><h2 id="cmp-pv">Preview</h2></header>
                      <div className="ix-card__body cmp-body">
                        <div className="ix-chips">{v.pvTabs.map((t) => <button key={t.l} type="button" className="ix-chip" aria-pressed={t.on} onClick={t.pick}><ChannelIcon channel={t.ch} size={16} decorative />{t.l}</button>)}</div>
                        <div className="cmp-pv">
                          <div className="cmp-pv__head"><ChannelIcon channel={v.pv.ch} size={28} label={v.pv.n} /><span><b>{v.pv.acc}</b><small>{v.pv.when}</small></span></div>
                          {v.pv.hasMedia ? <div className={'cmp-pv__media' + (v.pv.video ? ' is-video' : '')}>{v.pv.media}</div> : null}
                          <div className="cmp-pv__body">
                            <p className={v.bnCls}>{v.pv.text}</p>
                            <span className="cmp-pv__tags">{v.pv.tags}</span>
                            {v.pv.hasLink ? <span className="cmp-pv__link">{v.link}</span> : null}
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
