'use client';
// Merchant app · Create post (/m-post-new, ?id= edits a post, ?day=YYYY-MM-DD starts on that day). The web's Create
// post (src/screens/communication/Composer.jsx) as a phone form, top to bottom:
//   Post to     every place (lib/socialPosts.js › PLATS); places that are not connected are dimmed and fail their check
//   Text        the post, with GridAI (sheet: Generate 3 versions by tone / language / length, or Rewrite: shorter,
//               more exciting, emojis, grammar, Bangla, Benglish, call to action, fit X — the web composer's writer)
//               and Undo for anything GridAI changed
//   Hashtags    the suggested tags as chips
//   Photos      pictures from the phone (file input, resized to 640 px and kept with the post) and videos (by name)
//   Link
//   Checks      per place, the web composer's rules (length limits, video / photo needs, connection)
//   When        Schedule (date, time, best times) or Post now
// Action bar: Save draft · Schedule / Post now. Publishing is simulated (lib/socialPosts.js › publishNow / the scheduled minute).

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppScreen, AppBar, Content, ActionBar, Sheet, Button, Field, TextInput, Segmented, Pill, Icon, Note, Skeleton,
  useAppData, useQuery, toast,
} from '../kit/AppKit';
import { ChannelIcon } from '@/components/ui';
import { clockNow } from '@/lib/settlements';
import {
  PLATS, platBy, platState, postBy, savePost, publishNow, checksFor, lengthOf, SUGGESTED_TAGS, TONES, generate, REWRITES,
  SOCIAL_EVENT,
} from '@/lib/socialPosts';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const pad = (n) => String(n).padStart(2, '0');
const keyOf = (t) => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WDS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const whenText = (t) => { const d = new Date(t); const h = d.getHours(); return `${WDS[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}, ${h % 12 || 12}:${pad(d.getMinutes())} ${h < 12 ? 'AM' : 'PM'}`; };
const CK = { bad: ['err', 'Fix'], warn: ['warn', 'Check'], info: ['nav', 'Info'], ok: ['ok', 'Ready'] };
const MAX_MEDIA = 4;

const CSS = `
[data-screen="MPostNew"] .wrap{display:flex;flex-wrap:wrap;gap:8px}
[data-screen="MPostNew"] .pchip{cursor:pointer}
[data-screen="MPostNew"] .pchip.off{opacity:.55}
[data-screen="MPostNew"] .pchip .gc-channel{width:22px;height:22px}
[data-screen="MPostNew"] .chip{cursor:pointer}
[data-screen="MPostNew"] .chip.tag{border-style:dashed;color:var(--brand)}
[data-screen="MPostNew"] .chip.tag.on{border-style:solid;color:#fff}
[data-screen="MPostNew"] .tbar{display:flex;align-items:center;gap:6px;margin-top:8px}
[data-screen="MPostNew"] .tbar .btn{height:36px;padding:0 12px}
[data-screen="MPostNew"] .tbar .cnt2{margin-left:auto;font-size:var(--text-xs-plus);color:var(--muted);font-variant-numeric:tabular-nums}
[data-screen="MPostNew"] .tbar .cnt2.over{color:var(--err)}
[data-screen="MPostNew"] .inp.ta textarea{min-height:132px}
[data-screen="MPostNew"] .media{display:flex;flex-wrap:wrap;gap:8px}
[data-screen="MPostNew"] .tile2{position:relative;width:72px;height:72px;border-radius:var(--radius-lg);overflow:hidden;display:flex;align-items:flex-end;padding:6px;background:var(--warnbg);color:var(--warn);font-size:var(--text-xs);font-weight:var(--weight-medium);line-height:14px}
[data-screen="MPostNew"] .tile2.video{background:var(--soft);color:var(--brand)}
[data-screen="MPostNew"] .tile2 img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
[data-screen="MPostNew"] .tile2 .ell{position:relative;max-width:100%}
[data-screen="MPostNew"] .tile2 .x{position:absolute;top:4px;right:4px;width:24px;height:24px;border:0;border-radius:var(--radius-full);background:rgba(15,23,42,.6);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}
[data-screen="MPostNew"] .add{width:72px;height:72px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;border:1px dashed #cbd5e1;border-radius:var(--radius-lg);background:var(--card);font-size:var(--text-xs);color:var(--body);cursor:pointer}
[data-screen="MPostNew"] .add input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
[data-screen="MPostNew"] .add:focus-within{outline:2px solid var(--brand);outline-offset:2px}
[data-screen="MPostNew"] .ck{display:flex;align-items:center;gap:12px;padding:10px 14px;border-top:1px solid var(--line)}
[data-screen="MPostNew"] .ck:first-child{border-top:0}
[data-screen="MPostNew"] .ck .m{flex:1;min-width:0}
[data-screen="MPostNew"] .ck .t{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium)}
[data-screen="MPostNew"] .ck .s{display:block;font-size:var(--text-xs);color:var(--muted);line-height:16px}
[data-screen="MPostNew"] .ck .s.bad{color:var(--err)}
[data-screen="MPostNew"] .two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
[data-screen="MPostNew"] .var{display:flex;flex-direction:column;gap:8px;padding:12px 14px;border:1px solid var(--line);border-radius:var(--radius-lg)}
[data-screen="MPostNew"] .var p{margin:0;font-size:var(--text-sm);line-height:20px;white-space:pre-line}
[data-screen="MPostNew"] .var .top{display:flex;align-items:center;justify-content:space-between;font-size:var(--text-xs);color:var(--muted);font-weight:var(--weight-medium)}
[data-screen="MPostNew"] .var .btn{height:36px}
[data-screen="MPostNew"] .rw{display:grid;grid-template-columns:1fr 1fr;gap:8px}
[data-screen="MPostNew"] .rw .btn{justify-content:flex-start;height:44px;padding:0 12px}
`;

/** A photo from the phone as a small JPEG data URL (640 px on the long side). */
function resizePhoto(file, max = 640) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        try { c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); resolve(c.toDataURL('image/jpeg', 0.8)); } catch { resolve(''); }
      };
      img.onerror = () => resolve('');
      img.src = r.result;
    };
    r.onerror = () => resolve('');
    r.readAsDataURL(file);
  });
}

function blankForm(dayKey) {
  const t = safe(() => clockNow(), Date.now());
  const day = dayKey || keyOf(t + 864e5);
  const plats = PLATS.filter((p) => ['fb', 'ig'].includes(p.key) && platState(p.key).state !== 'off').map((p) => p.key);
  return { id: '', text: '', plats, tags: ['#DazzleShop'], media: [], link: '', when: 'sched', date: day, time: '20:00', status: 'draft' };
}

export default function MPostNewScreen() {
  const router = useRouter();
  const { ready } = useAppData([SOCIAL_EVENT, 'gc:connections']);
  const q = useQuery();
  const [f, setF] = useState(null);
  const [hist, setHist] = useState([]);
  const [ai, setAi] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ready || !q || f) return;
    const id = q.get('id');
    const p = id ? postBy(id) : null;
    if (p) {
      const at = p.at && p.status !== 'done' ? p.at : null;
      setF({ id: p.id, text: p.text || '', plats: [...p.plats], tags: [...(p.tags || [])], media: [...(p.media || [])], link: p.link || '', when: 'sched',
        date: at ? keyOf(at) : blankForm().date, time: at ? `${pad(new Date(at).getHours())}:${pad(new Date(at).getMinutes())}` : '20:00', status: p.status });
    } else setF(blankForm(q.get('day')));
  }, [ready, q, f]);

  const set = (patch) => setF((x) => ({ ...x, ...patch }));
  const setText = (t) => { setHist((h) => [...h, f.text].slice(-20)); set({ text: t }); };
  const states = useMemo(() => (ready ? Object.fromEntries(PLATS.map((p) => [p.key, platState(p.key)])) : {}), [ready]);
  const at = f ? new Date(`${f.date}T${f.time || '20:00'}:00`).getTime() : 0;
  const draft = f ? { ...f, at } : null;
  const checks = draft ? checksFor(draft) : [];
  const bad = checks.filter((c) => c.tone === 'bad');
  const len = draft ? lengthOf(draft) : 0;
  const over = checks.some((c) => c.over);
  const manual = f ? f.plats.filter((k) => !(platBy(k) || {}).auto).length : 0;

  const togglePlat = (k) => set({ plats: f.plats.includes(k) ? f.plats.filter((x) => x !== k) : [...f.plats, k] });
  const toggleTag = (t) => set({ tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t] });
  const addFiles = async (files) => {
    const list = Array.from(files || []).slice(0, MAX_MEDIA - f.media.length);
    if (!list.length) { toast(`Up to ${MAX_MEDIA} photos or videos.`, { tone: 'error' }); return; }
    const out = [];
    for (const file of list) {
      if (String(file.type).startsWith('video/')) out.push({ kind: 'video', name: file.name });
      else if (String(file.type).startsWith('image/')) { const src = await resizePhoto(file); out.push({ kind: 'photo', name: file.name, src }); }
    }
    setF((x) => ({ ...x, media: [...x.media, ...out].slice(0, MAX_MEDIA) }));
    if (out.length) toast(out.length === 1 ? `${out[0].kind === 'video' ? 'Video' : 'Photo'} added.` : `${out.length} added.`);
  };
  const removeMedia = (i) => set({ media: f.media.filter((_, j) => j !== i) });

  const base = () => ({ id: f.id || undefined, text: f.text.trim(), plats: f.plats, tags: f.tags, media: f.media, link: f.link.trim() });
  const saveDraft = () => {
    if (!f.text.trim() && !f.media.length) { toast('Write something or add a photo first.', { tone: 'error' }); return; }
    const p = savePost({ ...base(), status: 'draft', at: f.when === 'sched' && at > Date.now() ? at : null });
    toast('Draft saved. It shows under Drafts.');
    router.push(`/m-social?view=drafts&id=${encodeURIComponent(p.id)}`);
  };
  const go = () => {
    if (busy) return;
    if (!f.plats.length) { toast('Pick at least one place to post.', { tone: 'error' }); return; }
    if (!f.text.trim() && !f.media.length) { toast('Write the post first.', { tone: 'error' }); return; }
    if (bad.length) { toast(`${bad.length} ${bad.length === 1 ? 'place needs' : 'places need'} fixing first. See Checks.`, { tone: 'error' }); return; }
    const auto = f.plats.length - manual;
    const tail = manual ? `, with ${manual} ${manual === 1 ? 'reminder' : 'reminders'} to post by hand.` : '.';
    if (f.when === 'now') {
      setBusy(true);
      const p = savePost({ ...base(), status: 'draft', at: null });
      const r = publishNow(p.id);
      if (!r.ok && r.bad && r.bad.length) { setBusy(false); toast(`${r.bad.map((b) => b.name).join(', ')}: ${r.bad[0].msg}`, { tone: 'error' }); return; }
      toast(`Posting now to ${auto} ${auto === 1 ? 'place' : 'places'}${tail}`);
      router.push(`/m-social?view=published&id=${encodeURIComponent(p.id)}`);
      return;
    }
    if (!f.date || Number.isNaN(at)) { toast('Pick a date and time.', { tone: 'error' }); return; }
    if (at <= safe(() => clockNow(), Date.now())) { toast('That time has passed. Pick a later time or Post now.', { tone: 'error' }); return; }
    const p = savePost({ ...base(), status: 'sched', at });
    toast(`Scheduled for ${whenText(at)} on ${auto} ${auto === 1 ? 'place' : 'places'}${tail}`);
    router.push(`/m-social?day=${f.date}&id=${encodeURIComponent(p.id)}`);
  };

  // best times (the web's: evenings, Thursday and Friday at 8 PM)
  const best = useMemo(() => {
    if (!ready) return [];
    const t = safe(() => clockNow(), Date.now());
    const d = new Date(t);
    const out = [];
    if (d.getHours() < 21) out.push(['Today 9 PM', keyOf(t), '21:00']);
    for (let i = 1; i <= 7 && out.length < 3; i += 1) {
      const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
      if (x.getDay() === 4 || x.getDay() === 5) out.push([`${WDS[x.getDay()]} ${x.getDate()} ${MON[x.getMonth()]}, 8 PM`, keyOf(x.getTime()), '20:00']);
    }
    if (out.length < 3) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1); out.push([`Tomorrow 3 PM`, keyOf(x.getTime()), '15:00']); }
    return out.slice(0, 3);
  }, [ready]);

  const editing = !!(f && f.id);
  return (
    <AppScreen name="MPostNew" title={editing ? 'Edit post' : 'Create post'} css={CSS}>
      <AppBar title={editing ? 'Edit post' : 'Create post'} back="/m-social" />
      <Content top={103} bottom={98} pad gap={18}>
        {!f ? <div style={{ margin: '0 -20px' }}><Skeleton rows={4} /></div> : (<>
          <div className="field">
            <span className="lab">Post to</span>
            <div className="wrap" role="group" aria-label="Post to">
              {PLATS.map((p) => {
                const on = f.plats.includes(p.key);
                const off = (states[p.key] || {}).state === 'off';
                return (
                  <button key={p.key} type="button" className={'pchip' + (on ? ' on' : '') + (off ? ' off' : '')} aria-pressed={on} onClick={() => togglePlat(p.key)} title={off ? `${p.name} · not connected` : p.name}>
                    <ChannelIcon channel={p.ch} size={22} decorative />{p.short}
                  </button>
                );
              })}
            </div>
            <span className="help">{f.plats.length} selected{manual ? ` · ${manual} by reminder` : ''}. Dimmed places are not connected.</span>
          </div>

          <div className="field">
            <span className="lab">Text</span>
            <TextInput multiline value={f.text} onChange={(t) => set({ text: t })} placeholder="What do you want to tell customers?" />
            <div className="tbar">
              <Button kind="soft" icon="sparkles" onClick={() => setAi(true)}>Write with GridAI</Button>
              {hist.length ? <Button kind="line" icon="undo" onClick={() => { set({ text: hist[hist.length - 1] }); setHist((h) => h.slice(0, -1)); }}>Undo</Button> : null}
              <span className={'cnt2' + (over ? ' over' : '')}>{len.toLocaleString('en-IN')} characters</span>
            </div>
          </div>

          <div className="field">
            <span className="lab">Hashtags</span>
            <div className="wrap">
              {[...SUGGESTED_TAGS, ...f.tags.filter((t) => !SUGGESTED_TAGS.includes(t))].map((t) => (
                <button key={t} type="button" className={'chip tag' + (f.tags.includes(t) ? ' on' : '')} aria-pressed={f.tags.includes(t)} onClick={() => toggleTag(t)}>{t}</button>
              ))}
            </div>
            <span className="help">{f.tags.length} hashtags · Instagram allows 30, X works best with 1 or 2</span>
          </div>

          <div className="field">
            <span className="lab">Photos and video</span>
            <div className="media">
              {f.media.map((m, i) => (
                <div key={i} className={'tile2' + (m.kind === 'video' ? ' video' : '')}>
                  {m.src ? <img src={m.src} alt="" /> : <span className="ell">{m.kind === 'video' ? 'Video' : 'Photo'} · {m.name}</span>}
                  <button type="button" className="x" aria-label={`Remove ${m.name}`} onClick={() => removeMedia(i)}><Icon name="x" size={14} stroke={2.2} /></button>
                </div>
              ))}
              {f.media.length < MAX_MEDIA ? (
                <label className="add">
                  <Icon name="plus" size={22} />Add
                  <input type="file" accept="image/*,video/*" multiple onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
                </label>
              ) : null}
            </div>
            <span className="help">TikTok and YouTube need a video; Instagram a photo or video.</span>
          </div>

          <Field label="Link (optional)">
            <TextInput value={f.link} onChange={(v) => set({ link: v })} placeholder="https://dazzleshop.com.bd/…" type="url" inputMode="url" />
          </Field>

          {checks.length ? (
            <div className="field">
              <span className="lab">Checks{bad.length ? ` · ${bad.length} to fix` : ' · ready'}</span>
              <div className="card">
                {checks.map((c) => {
                  const [tone, word] = CK[c.tone];
                  return (
                    <div key={c.key} className="ck">
                      <ChannelIcon channel={c.ch} size={28} decorative />
                      <span className="m"><span className="t">{c.name}{c.count ? <span style={{ fontWeight: 'var(--weight-regular)', color: c.over ? 'var(--err)' : 'var(--muted)' }}> · {c.count}</span> : null}</span><span className={'s' + (c.tone === 'bad' ? ' bad' : '')}>{c.msg}</span></span>
                      <Pill tone={tone}>{word}</Pill>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="field">
            <span className="lab">When</span>
            <Segmented style={{ margin: 0 }} value={f.when} onChange={(v) => set({ when: v })} items={[{ key: 'sched', label: 'Schedule' }, { key: 'now', label: 'Post now' }]} />
          </div>
          {f.when === 'sched' ? (<>
            <div className="two">
              <Field label="Date"><TextInput type="date" value={f.date} onChange={(v) => set({ date: v })} /></Field>
              <Field label="Time"><TextInput type="time" value={f.time} onChange={(v) => set({ time: v })} /></Field>
            </div>
            {best.length ? (
              <div className="field">
                <span className="help">Best times</span>
                <div className="wrap">
                  {best.map(([l, d, t]) => <button key={l} type="button" className={'chip' + (f.date === d && f.time === t ? ' on' : '')} onClick={() => set({ date: d, time: t })}>{l}</button>)}
                </div>
              </div>
            ) : null}
          </>) : (
            <Note tone="info" icon="zap">Goes out as soon as you tap Post now{manual ? '; reminder places get a reminder to post by hand' : ''}.</Note>
          )}
        </>)}
      </Content>
      <ActionBar>
        <Button kind="line" onClick={saveDraft} disabled={!f}>Save draft</Button>
        <Button onClick={go} disabled={!f || busy} style={{ flex: 2 }}>{f && f.when === 'now' ? 'Post now' : 'Schedule'}</Button>
      </ActionBar>
      {f ? <AiSheet open={ai} onClose={() => setAi(false)} text={f.text} onUse={(t, msg) => { setText(t); setAi(false); toast(msg); }} /> : null}
    </AppScreen>
  );
}

/** GridAI writer: Generate three versions, or Rewrite the text (the web composer's writer). */
function AiSheet({ open, onClose, text, onUse }) {
  const [mode, setMode] = useState('gen');
  const [about, setAbout] = useState('10% off chargers and cables for Puja with code PUJA10, until 20 October');
  const [tone, setTone] = useState('friendly');
  const [lang, setLang] = useState('en');
  const [len, setLen] = useState('md');
  const [out, setOut] = useState(null);
  const run = () => {
    if (!about.trim()) { toast('Say what the post is about first.', { tone: 'error' }); return; }
    setOut({ lang, list: generate(tone, lang, len) });
  };
  return (
    <Sheet open={open} onClose={onClose} title="Write with GridAI">
      <Segmented style={{ margin: '0 0 14px' }} value={mode} onChange={setMode} items={[{ key: 'gen', label: 'Generate' }, { key: 'rew', label: 'Rewrite' }]} />
      {mode === 'gen' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label="What is it about?"><TextInput multiline value={about} onChange={setAbout} /></Field>
          <div className="field">
            <span className="lab">Tone</span>
            <div className="wrap">{TONES.map(([k, l]) => <button key={k} type="button" className={'chip' + (tone === k ? ' on' : '')} aria-pressed={tone === k} onClick={() => setTone(k)}>{l}</button>)}</div>
          </div>
          <div className="two">
            <div className="field"><span className="lab">Language</span><Segmented style={{ margin: 0 }} value={lang} onChange={setLang} items={[{ key: 'en', label: 'EN' }, { key: 'bn', label: 'বাংলা' }, { key: 'mix', label: 'Mix' }]} /></div>
            <div className="field"><span className="lab">Length</span><Segmented style={{ margin: 0 }} value={len} onChange={setLen} items={[{ key: 'sm', label: 'S' }, { key: 'md', label: 'M' }, { key: 'lg', label: 'L' }]} /></div>
          </div>
          <Button icon="sparkles" onClick={run}>{out ? 'Write again' : 'Write 3 versions'}</Button>
          {out ? out.list.map((t, i) => (
            <div key={i} className="var">
              <span className="top">Version {i + 1}</span>
              <p className={out.lang === 'bn' ? 'bn' : undefined} lang={out.lang === 'bn' ? 'bn' : undefined}>{t}</p>
              <Button kind="soft" onClick={() => onUse(t, `Version ${i + 1} is in the text. Edit it freely.`)}>Use this</Button>
            </div>
          )) : null}
        </div>
      ) : (
        <>
          {!String(text || '').trim() ? <Note tone="info" icon="edit" style={{ marginBottom: '12px' }}>Write something first, or use Generate.</Note> : null}
          <div className="rw">
            {REWRITES.map(([l, fn]) => (
              <Button key={l} kind="line" disabled={!String(text || '').trim() && !/^To /.test(l)} onClick={() => onUse(fn(text || ''), `${l} applied. Undo puts it back.`)}>{l}</Button>
            ))}
          </div>
        </>
      )}
    </Sheet>
  );
}
