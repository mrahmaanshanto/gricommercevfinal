'use client';
// Social media › Create / edit post (/admin/social?compose=new | ?compose=SP-1017) — copied from the merchant panel's
// Create post (screens/communication/Composer.jsx) and fed GridCommerce's own pages: where to post, the text with
// formatting, hashtags, media picked by name from the content library and a link, and the per-page checks on the left;
// when, the GridAI writer (canned text) and the preview per page on the right. Save draft / Post now / Schedule sit in
// the title row. Publishing is simulated. Data: lib/admin/marketing2.js › savePost, postChecks, aiWrite, aiRewrite.

import React, { useMemo, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { ChannelIcon, InfoTip, StatusBadge, Sheet } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { DAY, startOfDay, weekday } from '@/lib/platform/util';
import { PLATFORMS, platformBy, SUGGESTED_TAGS, TONES, REWRITES, postChecks, postLength, aiWrite, aiRewrite, savePost, POST_STATUS } from '@/lib/admin/marketing2';
import { toInput, fromInput, dayTime, num, FormError } from './mk2Shared';

const EMO = [['party', '🎉'], ['rocket', '🚀'], ['fire', '🔥'], ['check', '✅'], ['point', '👉'], ['phone', '📱'], ['truck', '🚚'], ['star', '⭐'], ['chart', '📈'], ['heart', '❤️']];
const BOLD = [0x1D5D4, 0x1D5EE, 0x1D7EC];
const ITAL = [0x1D608, 0x1D622, 0];
function styl(s, [A, a, z]) {
  return Array.from(s).map((ch) => {
    const c = ch.charCodeAt(0);
    if (c >= 65 && c <= 90) return String.fromCodePoint(A + c - 65);
    if (c >= 97 && c <= 122) return String.fromCodePoint(a + c - 97);
    if (z && c >= 48 && c <= 57) return String.fromCodePoint(z + c - 48);
    return ch;
  }).join('');
}
const CK = { bad: ['Fix', 'error', 'triangle-alert'], warn: ['Check', 'warning', 'clock'], ok: ['Ready', 'success', 'check'] };

export const COMPOSER_CSS = `
.cmp-body{display:flex;flex-direction:column;gap:var(--space-3)}
.cmp-plat.is-renew{border-style:dashed}
.cmp-ed{border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-card)}
.cmp-ed:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px var(--fill-primary-soft)}
.cmp-tbar{display:flex;flex-wrap:wrap;align-items:center;gap:2px;padding:4px;border-bottom:1px solid var(--border-subtle)}
.cmp-tbtn{display:inline-flex;align-items:center;gap:6px;height:28px;min-width:28px;padding:0 8px;border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);white-space:nowrap;cursor:pointer}
.cmp-tbtn:hover{background:var(--surface-subtle);color:var(--text-heading)}
.cmp-tbtn:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.cmp-tsep{width:1px;height:16px;margin:0 4px;background:var(--border-subtle)}
.cmp-count{margin-left:auto;padding-right:6px;font-size:var(--text-xs);color:var(--text-muted);font-variant-numeric:tabular-nums}
.cmp-emo{display:flex;flex-wrap:wrap;gap:2px;padding:4px 6px;border-bottom:1px solid var(--border-subtle)}
.cmp-emo button{width:32px;height:32px;border:0;border-radius:var(--radius-md);background:none;font-size:var(--text-base);cursor:pointer}
.cmp-emo button:hover{background:var(--surface-subtle)}
.cmp-ed textarea{display:block;width:100%;min-height:150px;padding:var(--space-3);border:0;border-radius:0 0 var(--radius-lg) var(--radius-lg);background:none;font:inherit;font-size:var(--text-sm);line-height:22px;color:var(--text-heading);resize:vertical}
.cmp-ed textarea:focus{outline:none}
.cmp-tag{border-style:dashed;color:var(--primary)}
.cmp-tag[aria-pressed="true"]{border-style:solid}
.cmp-media{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.cmp-tile{position:relative;display:flex;flex-direction:column;justify-content:flex-end;gap:2px;width:132px;height:88px;padding:8px;border-radius:var(--radius-lg);background:var(--fill-warning-soft);font-size:var(--text-xs);color:var(--text-warning);overflow:hidden}
.cmp-tile--video{background:var(--fill-primary-soft);color:var(--primary)}
.cmp-tile b{overflow:hidden;font-weight:var(--weight-medium);text-overflow:ellipsis;white-space:nowrap}
.cmp-tile button{position:absolute;top:4px;right:4px}
.cmp-add{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;width:132px;height:88px;border:1px dashed var(--border-strong);border-radius:var(--radius-lg);background:var(--surface-subtle);font:inherit;font-size:var(--text-xs);color:var(--text-body);cursor:pointer}
.cmp-checks{display:flex;flex-direction:column}
.cmp-check{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:6px var(--space-4);border-top:1px solid var(--border-subtle)}
.cmp-check__text{flex:1;min-width:0;display:flex;flex-direction:column}
.cmp-check__text b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cmp-check__text span{font-size:var(--text-xs);color:var(--text-body)}
.cmp-check__text span.is-bad{color:var(--text-danger)}
.cmp-check__n{font-size:var(--text-xs);color:var(--text-muted);font-variant-numeric:tabular-nums}
.cmp-var{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.cmp-var__top{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.cmp-var p{margin:0;font-size:var(--text-sm);line-height:20px;color:var(--text-heading);white-space:pre-line}
.cmp-rw{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.cmp-rw .ix-btn{justify-content:flex-start}
.cmp-done{display:flex;align-items:center;gap:6px;padding:8px 10px;border-radius:var(--radius-lg);background:var(--fill-success-soft);font-size:var(--text-sm);color:var(--text-success)}
.cmp-done button{padding:0;border:0;background:none;font:inherit;font-weight:var(--weight-medium);color:inherit;text-decoration:underline;cursor:pointer}
.cmp-pv{overflow:hidden;border:1px solid var(--border-subtle);border-radius:var(--radius-xl)}
.cmp-pv__head{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--border-subtle)}
.cmp-pv__head b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cmp-pv__head small{font-size:var(--text-xs);color:var(--text-muted)}
.cmp-pv__media{display:flex;align-items:flex-end;gap:6px;height:160px;padding:10px;background:var(--fill-warning-soft);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-warning)}
.cmp-pv__media.is-video{background:var(--fill-primary-soft);color:var(--primary)}
.cmp-pv__body{display:flex;flex-direction:column;gap:6px;padding:10px 12px}
.cmp-pv__body p{margin:0;font-size:var(--text-sm);line-height:20px;color:var(--text-heading);white-space:pre-line;overflow-wrap:anywhere}
.cmp-pv__tags{font-size:var(--text-sm);color:var(--text-link)}
.cmp-pv__link{font-family:var(--font-data);font-size:var(--text-xs);color:var(--primary);overflow-wrap:anywhere}
.cmp-side .gc-disclose>summary{min-height:44px;padding:var(--space-3) var(--space-4)}
.cmp-side .gc-disclose>:not(summary){margin:0 var(--space-4) var(--space-4)}
.cmp-ai{display:flex;flex-direction:column;gap:var(--space-3)}
.cmp-lib{display:flex;flex-direction:column}
.cmp-lib label{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:var(--space-2) 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);cursor:pointer}
.cmp-lib label:first-child{border-top:0}
.cmp-lib input{width:16px;height:16px;margin:0;accent-color:var(--primary)}
.cmp-lib span{display:flex;flex:1;flex-direction:column;min-width:0}
.cmp-lib b{overflow:hidden;font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.cmp-lib small{font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:640px){.cmp-rw{grid-template-columns:minmax(0,1fr)}.cmp-tile,.cmp-add{width:calc(50% - 4px)}}
`;

function Seg({ items, value, onChange, label }) {
  return (
    <div className="gc-seg" role="radiogroup" aria-label={label}>
      {items.map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={value === k} className={'gc-seg__btn' + (value === k ? ' gc-seg__btn--active' : '')} onClick={() => onChange(k)}>{l}</button>)}
    </div>
  );
}

/** The composer. id: 'new' or a post id. onDone(status) goes back to the list. */
export default function SocialComposer({ id, data, t, onDone }) {
  const old = id !== 'new' ? data.social.posts.find((p) => p.id === id) : null;
  const [f, setF] = useState(() => (old
    ? { text: old.text, platforms: [...old.platforms], media: [...old.media], tags: [...old.tags], link: old.link || '', at: old.status === 'scheduled' ? old.at : null }
    : { text: '', platforms: ['fb', 'ig', 'li'], media: [], tags: ['#GridCommerce'], link: 'https://gridcommerce.net/', at: null }));
  const [hist, setHist] = useState([]);
  const [emo, setEmo] = useState(false);
  const [err, setErr] = useState('');
  const [dirty, setDirty] = useState(false);
  const [pv, setPv] = useState(null);
  const [lib, setLib] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [ai, setAi] = useState({ mode: 'gen', about: 'POS that keeps selling offline', tone: 'friendly', lang: 'en', out: null, last: '' });
  const box = useRef(null);
  const set = (patch) => { setF((x) => ({ ...x, ...patch })); setDirty(true); setErr(''); };
  const setText = (text, note) => { setHist((h) => [...h, f.text].slice(-20)); set({ text }); if (note) setAi((a) => ({ ...a, last: note })); };
  const undo = () => { if (!hist.length) return; setF((x) => ({ ...x, text: hist[hist.length - 1] })); setHist((h) => h.slice(0, -1)); setAi((a) => ({ ...a, last: '' })); };
  const firstLine = (fn) => { const ls = f.text.split('\n'); ls[0] = fn(ls[0]); return ls.join('\n'); };

  const checks = postChecks(f, data);
  const bad = checks.filter((c) => c.level === 'bad');
  const len = postLength(f);
  const media = f.media.map((m) => data.social.library.find((x) => x.id === m)).filter(Boolean);
  const pages = data.social.pages;
  const pvKey = pv && f.platforms.includes(pv) ? pv : f.platforms[0];
  const pvPlat = pvKey ? platformBy(pvKey) : null;
  const pvPage = pvKey ? pages.find((p) => p.key === pvKey) : null;
  const suggestions = useMemo(() => {
    const base = startOfDay(t);
    return [[0, 20], [1, 20], [3, 20], [6, 15]].map(([dd, h]) => base + dd * DAY + h * 3600e3).filter((x) => x > t + 10 * 60e3).slice(0, 3);
  }, [t]);
  const sugLabel = (ms) => (startOfDay(ms) === startOfDay(t) ? 'Today' : startOfDay(ms) === startOfDay(t) + DAY ? 'Tomorrow' : weekday(ms)) + ' ' + dayTime(ms).split(', ')[1];

  const back = async () => {
    if (dirty && !(await confirmDialog({ title: 'Leave without saving?', body: 'Your changes to this post are lost.', confirmLabel: 'Leave', tone: 'danger' }))) return;
    onDone(null);
  };
  const go = async (mode) => {
    if (mode === 'now' && !(await confirmDialog({ title: `Post now to ${f.platforms.length} page${f.platforms.length === 1 ? '' : 's'}?`, body: 'It goes out on GridCommerce’s pages straight away (simulated in this demo).', confirmLabel: 'Post now' }))) return;
    const res = savePost({ id: old ? old.id : null, text: f.text, platforms: f.platforms, media: f.media, tags: f.tags, link: f.link, mode, at: f.at });
    if (!res.ok) { setErr(res.error); return; }
    toast(mode === 'now' ? `Posted to ${f.platforms.map((k) => platformBy(k).name).join(', ')}` : mode === 'schedule' ? `Scheduled for ${dayTime(f.at)}` : 'Draft saved');
    onDone(res.status);
  };
  const schedule = () => {
    if (!f.at) { setErr('Pick a date and time under When.'); const el = document.getElementById('cmp-at'); if (el) el.focus(); return; }
    go('schedule');
  };

  const status = old ? old.status : 'draft';
  const badge = <StatusBadge tone={POST_STATUS[status][1]} icon={status === 'scheduled' ? 'clock' : 'pencil'}>{POST_STATUS[status][0]}</StatusBadge>;
  const togglePlat = (k) => set({ platforms: f.platforms.includes(k) ? f.platforms.filter((x) => x !== k) : [...f.platforms, k] });
  const toggleTag = (tag) => set({ tags: f.tags.includes(tag) ? f.tags.filter((x) => x !== tag) : [...f.tags, tag] });
  const addTag = () => {
    const v = '#' + newTag.trim().replace(/^#+/, '').replace(/\s+/g, '');
    if (v.length < 2) return;
    if (!f.tags.includes(v)) set({ tags: [...f.tags, v] });
    setNewTag('');
  };
  const variants = ai.out ? aiWrite(ai.out.about, ai.out.tone, ai.out.lang) : [];

  return (
    <div className="ix-page ix-page--narrow">
      <style dangerouslySetInnerHTML={{ __html: COMPOSER_CSS }} />
      <RecordHeader onBack={back} backLabel="Back to social media" title={old ? 'Edit post' : 'Create post'} badges={badge}
        meta={old ? <><span className="mk-data">{old.id}</span> · {old.by}{old.status === 'scheduled' ? ' · goes out ' + dayTime(old.at) : ''}</> : 'GridCommerce’s pages'}
        about="Write one post for GridCommerce’s Facebook, Instagram, LinkedIn, YouTube and TikTok. Each page’s rules are checked as you type; GridAI can write or rewrite the text. Publishing is simulated in this demo."
        secondary={[{ label: 'Save draft', onClick: () => go('draft') }, { label: 'Post now', onClick: () => go('now') }]}
        primary={{ label: 'Schedule', icon: 'clock', onClick: schedule }} />
      <FormError error={err} />

      <div className="ix-record">
        <div className="ix-main">
          <section className="ix-card" aria-labelledby="cmp-to">
            <header className="ix-card__head"><div><h2 id="cmp-to">Post to</h2><p className="ix-card__sub">{f.platforms.length} of {PLATFORMS.length} pages</p></div></header>
            <div className="ix-card__body">
              <div className="ix-chips">
                {PLATFORMS.map((p) => {
                  const pg = pages.find((x) => x.key === p.key) || {};
                  return (
                    <button key={p.key} type="button" className={'ix-chip cmp-plat' + (pg.status === 'renew' ? ' is-renew' : '')} aria-pressed={f.platforms.includes(p.key)} title={pg.handle} onClick={() => togglePlat(p.key)}>
                      <ChannelIcon channel={p.channel} size={20} decorative />{p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="ix-card" aria-labelledby="cmp-write">
            <header className="ix-card__head"><h2 id="cmp-write">Write <InfoTip text="Bold and italic use Unicode letters, so they show on every page. They work on English letters and numbers, not Bangla." /></h2></header>
            <div className="ix-card__body cmp-body">
              <div className="cmp-ed">
                <div className="cmp-tbar" role="toolbar" aria-label="Formatting">
                  <button type="button" className="cmp-tbtn" onClick={() => setText(firstLine((l) => styl(l, BOLD)))} aria-label="Bold the first line"><Icon name="bold" width="16" height="16" aria-hidden="true" /></button>
                  <button type="button" className="cmp-tbtn" onClick={() => setText(firstLine((l) => styl(l, ITAL)))} aria-label="Italic the first line"><Icon name="italic" width="16" height="16" aria-hidden="true" /></button>
                  <button type="button" className="cmp-tbtn" onClick={() => { const ls = f.text.split('\n'); setText([ls[0], ...ls.slice(1).map((l) => (l && !l.startsWith('• ') ? '• ' + l : l))].join('\n')); }}><Icon name="list" width="16" height="16" aria-hidden="true" />List</button>
                  <span className="cmp-tsep" />
                  <button type="button" className="cmp-tbtn" onClick={() => setEmo(!emo)} aria-expanded={emo}><Icon name="smile" width="16" height="16" aria-hidden="true" />Emoji</button>
                  <button type="button" className="cmp-tbtn" onClick={() => { const el = document.getElementById('cmp-newtag'); if (el) el.focus(); }}><Icon name="hash" width="16" height="16" aria-hidden="true" />Hashtag</button>
                  <button type="button" className="cmp-tbtn" onClick={() => setText(f.text + (f.text ? ' ' : '') + '@gridcommerce')}><Icon name="at-sign" width="16" height="16" aria-hidden="true" />Mention</button>
                  <span className="cmp-tsep" />
                  <button type="button" className="cmp-tbtn" onClick={undo} disabled={!hist.length}><Icon name="undo-2" width="16" height="16" aria-hidden="true" />Undo</button>
                  <span className="cmp-count">{num(len)} characters</span>
                </div>
                {emo ? <div className="cmp-emo">{EMO.map(([n, c]) => <button key={n} type="button" onClick={() => setText(f.text.replace(/\n?$/, ' ' + c))} aria-label={'Add ' + n}>{c}</button>)}</div> : null}
                <textarea ref={box} aria-label="Post text" rows={7} value={f.text} placeholder="What do you want to tell merchants?" onChange={(e) => set({ text: e.target.value })} />
              </div>
            </div>
          </section>

          <section className="ix-card" aria-labelledby="cmp-tags">
            <header className="ix-card__head"><div><h2 id="cmp-tags">Hashtags</h2><p className="ix-card__sub">{f.tags.length} hashtags · Instagram allows 30</p></div></header>
            <div className="ix-card__body cmp-body">
              <div className="ix-chips">{[...new Set([...SUGGESTED_TAGS, ...f.tags])].map((h) => <button key={h} type="button" className="ix-chip cmp-tag" aria-pressed={f.tags.includes(h)} onClick={() => toggleTag(h)}>{h}</button>)}</div>
              <div className="mk-row">
                <input id="cmp-newtag" className="gc-input" style={{ maxWidth: 240 }} value={newTag} placeholder="Add a hashtag" aria-label="Add a hashtag" onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
                <button type="button" className="ix-btn ix-btn--sm" onClick={addTag}>Add</button>
              </div>
            </div>
          </section>

          <section className="ix-card" aria-labelledby="cmp-media">
            <header className="ix-card__head"><h2 id="cmp-media">Media and link</h2></header>
            <div className="ix-card__body cmp-body">
              <div className="cmp-media">
                {media.map((m) => (
                  <div key={m.id} className={'cmp-tile' + (m.kind === 'video' ? ' cmp-tile--video' : '')}>
                    <Icon name={m.kind === 'video' ? 'film' : 'image'} width="16" height="16" aria-hidden="true" />
                    <b title={m.name}>{m.name}</b><span>{m.dims}</span>
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove ' + m.name} onClick={() => set({ media: f.media.filter((x) => x !== m.id) })}><Icon name="x" width="14" height="14" aria-hidden="true" /></button>
                  </div>
                ))}
                {f.media.length < 10 ? <button type="button" className="cmp-add" onClick={() => setLib(true)}><Icon name="plus" width="16" height="16" aria-hidden="true" />From the library</button> : null}
              </div>
              <div className="gc-field">
                <label className="gc-label" htmlFor="cmp-link">Link <span className="mk-opt">(optional)</span></label>
                <input id="cmp-link" className="gc-input mk-data" value={f.link} placeholder="https://gridcommerce.net/…" onChange={(e) => set({ link: e.target.value.trim() })} />
              </div>
            </div>
          </section>

          <section className="ix-card" aria-labelledby="cmp-ready">
            <header className="ix-card__head"><div><h2 id="cmp-ready">Ready to publish?</h2><p className="ix-card__sub">{bad.length ? `${bad.length} page${bad.length === 1 ? ' needs' : 's need'} a fix` : f.platforms.length ? 'Every page is ready' : 'Pick a page'}</p></div></header>
            <div className="cmp-checks">
              {checks.map((k) => (
                <div key={k.key} className="cmp-check">
                  <ChannelIcon channel={k.channel} size={20} label={k.name} />
                  <span className="cmp-check__text"><b>{k.name}</b><span className={k.level === 'bad' ? 'is-bad' : ''}>{k.text}</span></span>
                  <span className="cmp-check__n">{num(k.count)} / {num(k.limit)}</span>
                  <StatusBadge tone={CK[k.level][1]} icon={CK[k.level][2]}>{CK[k.level][0]}</StatusBadge>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="ix-side cmp-side">
          <section className="ix-card" aria-labelledby="cmp-when">
            <header className="ix-card__head"><h2 id="cmp-when">When <InfoTip text="Dhaka time. Suggested times are when GridCommerce’s followers were most active last month." /></h2></header>
            <div className="ix-card__body cmp-body">
              <div className="gc-field">
                <label className="gc-label" htmlFor="cmp-at">Date and time</label>
                <input id="cmp-at" className="gc-input" type="datetime-local" value={toInput(f.at)} onChange={(e) => set({ at: fromInput(e.target.value) })} />
              </div>
              <div className="ix-chips">{suggestions.map((ms) => <button key={ms} type="button" className="ix-chip" aria-pressed={f.at === ms} onClick={() => set({ at: ms })}>{sugLabel(ms)}</button>)}</div>
            </div>
          </section>

          <details className="ix-card gc-disclose">
            <summary><Icon name="sparkles" width="16" height="16" aria-hidden="true" />GridAI writer</summary>
            <div className="cmp-ai">
              <Seg label="GridAI writer mode" items={[['gen', 'Generate'], ['rew', 'Rewrite']]} value={ai.mode} onChange={(mode) => setAi({ ...ai, mode })} />
              {ai.mode === 'gen' ? (<>
                <div className="gc-field"><label className="gc-label" htmlFor="cmp-about">What is the post about?</label><textarea id="cmp-about" className="gc-input" rows={2} value={ai.about} onChange={(e) => setAi({ ...ai, about: e.target.value })} /></div>
                <div><span className="gc-label">Tone</span><div className="ix-chips">{TONES.map(([k, l]) => <button key={k} type="button" className="ix-chip" aria-pressed={ai.tone === k} onClick={() => setAi({ ...ai, tone: k })}>{l}</button>)}</div></div>
                <div><span className="gc-label">Language</span><Seg label="Language" items={[['en', 'English'], ['bn', 'বাংলা']]} value={ai.lang} onChange={(lang) => setAi({ ...ai, lang })} /></div>
                <button type="button" className="ix-btn ix-btn--primary" onClick={() => { if (!ai.about.trim()) { toast('Say what the post is about first.', { tone: 'error' }); return; } setAi({ ...ai, out: { about: ai.about, tone: ai.tone, lang: ai.lang } }); }}><Icon name="sparkles" width="16" height="16" aria-hidden="true" />Generate 3 versions</button>
                {variants.map((v, i) => (
                  <div key={i} className="cmp-var">
                    <span className="cmp-var__top">Version {i + 1}<button type="button" className="ix-btn ix-btn--sm" onClick={() => setText(v, 'Version ' + (i + 1) + ' used')}>Use this</button></span>
                    <p>{v}</p>
                  </div>
                ))}
              </>) : (<>
                <p className="mk-note">Rewrites the text in the editor. Undo brings it back.</p>
                <div className="cmp-rw">{REWRITES.map(([k, l]) => <button key={k} type="button" className="ix-btn ix-btn--sm" disabled={!f.text.trim()} onClick={() => setText(aiRewrite(f.text, k), l + ' applied')}>{l}</button>)}</div>
              </>)}
              {ai.last ? <div className="cmp-done">{ai.last} · <button type="button" onClick={undo}>Undo</button></div> : null}
              <p className="mk-note">Demo: GridAI answers with ready-made text.</p>
            </div>
          </details>

          <section className="ix-card" aria-labelledby="cmp-pv">
            <header className="ix-card__head"><h2 id="cmp-pv">Preview</h2></header>
            <div className="ix-card__body cmp-body">
              {pvPlat ? (<>
                <div className="ix-chips">{f.platforms.map((k) => <button key={k} type="button" className="ix-chip" aria-pressed={k === pvKey} onClick={() => setPv(k)}><ChannelIcon channel={platformBy(k).channel} size={16} decorative />{platformBy(k).name}</button>)}</div>
                <div className="cmp-pv">
                  <div className="cmp-pv__head"><ChannelIcon channel={pvPlat.channel} size={28} label={pvPlat.name} /><span><b>{pvPage.handle}</b><small>{f.at ? dayTime(f.at) : 'Just now'}</small></span></div>
                  {media.length ? <div className={'cmp-pv__media' + (media[0].kind === 'video' ? ' is-video' : '')}><Icon name={media[0].kind === 'video' ? 'circle-play' : 'image'} width="16" height="16" aria-hidden="true" />{media[0].name}{media.length > 1 ? ' · +' + (media.length - 1) : ''}</div> : null}
                  <div className="cmp-pv__body">
                    <p>{f.text || 'Your text shows here.'}</p>
                    {f.tags.length ? <span className="cmp-pv__tags">{f.tags.join(' ')}</span> : null}
                    {f.link ? <span className="cmp-pv__link">{f.link}</span> : null}
                  </div>
                </div>
              </>) : <p className="mk-note">Pick a page to see the preview.</p>}
            </div>
          </section>
        </div>
      </div>

      <Sheet open={lib} title="Add from the library" onClose={() => setLib(false)} footer={<button type="button" className="gc-btn gc-btn--solid" onClick={() => setLib(false)}>Done</button>}>
        <div className="cmp-lib">
          {data.social.library.map((m) => (
            <label key={m.id}>
              <input type="checkbox" checked={f.media.includes(m.id)} onChange={() => set({ media: f.media.includes(m.id) ? f.media.filter((x) => x !== m.id) : [...f.media, m.id].slice(0, 10) })} />
              <Icon name={m.kind === 'video' ? 'film' : 'image'} width="16" height="16" aria-hidden="true" />
              <span><b>{m.name}</b><small>{m.kind === 'video' ? 'Video' : 'Image'} · {m.dims} · {m.tags.map((x) => '#' + x).join(' ')}</small></span>
            </label>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
