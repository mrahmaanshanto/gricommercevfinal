'use client';
// Messenger pieces shared by the Inbox thread (Thread.jsx), the floating chat windows (ChatDock.jsx) and tickets:
//   VoiceNote       a voice message: play / pause, a waveform that fills as it plays, the time and the speed (1×, 1.5×, 2×).
//                   A message recorded in this browser session plays its real audio (lib/inbox.js › voiceUrl);
//                   older ones play a timed preview.
//   VoiceRecorder   records a voice message from the microphone (MediaRecorder) with a live waveform; when there is
//                   no microphone it still records the length, so the demo works anywhere.
//   CallScreen      a Messenger-style voice call: ringing with pulsing rings, then the timer, mute, speaker and end.
//   ReactPicker     the six reactions (❤️ 😆 😮 😢 😠 👍) that pop up over a message.
//   Mentioned       text with @Name mentions of the team highlighted.
//   MSGR_CSS        styles for all of the above (tokens only; motion is ease-out and stops for reduced motion).

import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { REACTIONS, fmtDur, voiceUrl, channelName, mentionNames } from '@/lib/inbox';
import { Avatar } from './parts';

const hash = (s) => { let h = 7; for (const c of String(s || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
/** A fixed waveform for a message: the same message always draws the same bars. */
export function barsFor(key, n = 28) {
  let h = hash(key) || 1;
  return Array.from({ length: n }, (_, i) => { h = (h * 1103515245 + 12345) >>> 0; const edge = Math.min(i, n - 1 - i) < 3 ? 0.55 : 1; return Math.round((6 + (h % 18)) * edge); });
}
const SPEEDS = [1, 1.5, 2];

export function VoiceNote({ m, out }) {
  const dur = Math.max(1, m.dur || 1);
  const url = voiceUrl(m.vk);
  const [pos, setPos] = useState(0);
  const [on, setOn] = useState(false);
  const [speed, setSpeed] = useState(1);
  const audio = useRef(null);
  const bars = useRef(barsFor(m.id));
  useEffect(() => {
    if (!on || url) return undefined;
    const id = window.setInterval(() => setPos((p) => { const n = p + 0.1 * speed; if (n >= dur) { setOn(false); return 0; } return n; }), 100);
    return () => window.clearInterval(id);
  }, [on, dur, speed, url]);
  useEffect(() => () => { if (audio.current) audio.current.pause(); }, []);
  const toggle = () => {
    if (url) {
      if (!audio.current) {
        const a = new Audio(url);
        a.ontimeupdate = () => setPos(a.currentTime);
        a.onended = () => { setOn(false); setPos(0); };
        audio.current = a;
      }
      audio.current.playbackRate = speed;
      if (on) audio.current.pause(); else audio.current.play().catch(() => setOn(false));
    }
    setOn((v) => !v);
  };
  const nextSpeed = () => { const s = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]; setSpeed(s); if (audio.current) audio.current.playbackRate = s; };
  const done = pos / dur;
  return (
    <div className={'ms-voice' + (out ? ' ms-voice--out' : '') + (on ? ' is-playing' : '')}>
      <button type="button" className="ms-voice__btn" onClick={toggle} aria-label={on ? 'Pause voice message' : 'Play voice message'}><Icon name={on ? 'pause' : 'play'} width="16" height="16" aria-hidden="true" /></button>
      <span className="ms-voice__bars" aria-hidden="true">{bars.current.map((h, i) => <i key={i} style={{ height: h }} className={i / bars.current.length < done ? 'is-on' : ''} />)}</span>
      <span className="ms-voice__time">{fmtDur(on || pos ? pos : dur)}</span>
      {on || pos ? <button type="button" className="ms-voice__speed" onClick={nextSpeed} aria-label={'Playback speed ' + speed + '×'}>{speed}×</button> : null}
    </div>
  );
}

/** Records a voice message. onSend({ dur, url }) · onCancel(). */
export function VoiceRecorder({ onSend, onCancel }) {
  const [sec, setSec] = useState(0);
  const [levels, setLevels] = useState(() => Array(28).fill(4));
  const rec = useRef({ stream: null, mr: null, chunks: [], ctx: null, raf: 0, start: Date.now(), sim: 0, stopped: false });
  useEffect(() => {
    const r = rec.current;
    r.start = Date.now();
    const tick = window.setInterval(() => {
      const s = (Date.now() - r.start) / 1000;
      setSec(s);
      if (s >= 120) finish();
    }, 200);
    const simulate = () => { r.sim = window.setInterval(() => setLevels((l) => [...l.slice(1), 5 + Math.round(Math.random() * 18)]), 110); };
    const md = typeof navigator !== 'undefined' && navigator.mediaDevices;
    if (md && md.getUserMedia && typeof window.MediaRecorder !== 'undefined') {
      md.getUserMedia({ audio: true }).then((stream) => {
        if (r.stopped) { stream.getTracks().forEach((t) => t.stop()); return; }
        r.stream = stream;
        const mr = new window.MediaRecorder(stream);
        mr.ondataavailable = (e) => { if (e.data && e.data.size) r.chunks.push(e.data); };
        mr.start();
        r.mr = mr;
        try {
          const Ctx = window.AudioContext || window.webkitAudioContext;
          const ctx = new Ctx();
          const an = ctx.createAnalyser();
          an.fftSize = 256;
          ctx.createMediaStreamSource(stream).connect(an);
          const buf = new Uint8Array(an.frequencyBinCount);
          r.ctx = ctx;
          let last = 0;
          const loop = (t) => {
            an.getByteTimeDomainData(buf);
            let peak = 0;
            for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i] - 128));
            if (t - last > 90) { last = t; setLevels((l) => [...l.slice(1), Math.max(4, Math.min(24, Math.round(peak / 3)))]); }
            r.raf = window.requestAnimationFrame(loop);
          };
          r.raf = window.requestAnimationFrame(loop);
        } catch { simulate(); }
      }).catch(simulate);
    } else simulate();
    return () => { window.clearInterval(tick); cleanup(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const cleanup = () => {
    const r = rec.current;
    r.stopped = true;
    window.clearInterval(r.sim); window.cancelAnimationFrame(r.raf);
    if (r.stream) r.stream.getTracks().forEach((t) => t.stop());
    if (r.ctx) r.ctx.close().catch(() => {});
  };
  const finish = () => {
    const r = rec.current;
    if (r.stopped) return;
    const dur = Math.max(1, Math.round((Date.now() - r.start) / 1000));
    if (r.mr && r.mr.state !== 'inactive') {
      r.mr.onstop = () => { const blob = new Blob(r.chunks, { type: r.mr.mimeType || 'audio/webm' }); onSend({ dur, url: blob.size ? URL.createObjectURL(blob) : '' }); };
      r.mr.stop();
      cleanup();
    } else { cleanup(); onSend({ dur, url: '' }); }
  };
  const cancel = () => { cleanup(); onCancel(); };
  return (
    <div className="ms-rec" role="group" aria-label="Recording a voice message">
      <button type="button" className="ms-rec__x" onClick={cancel} aria-label="Delete recording"><Icon name="trash-2" width="18" height="18" aria-hidden="true" /></button>
      <span className="ms-rec__pill">
        <i className="ms-rec__dot" aria-hidden="true" />
        <span className="ms-rec__time" aria-live="off">{fmtDur(sec)}</span>
        <span className="ms-rec__wave" aria-hidden="true">{levels.map((h, i) => <i key={i} style={{ height: h }} />)}</span>
      </span>
      <button type="button" className="ms-rec__send" onClick={finish} aria-label="Send voice message"><Icon name="send" width="18" height="18" aria-hidden="true" /></button>
    </div>
  );
}

/** A Messenger-style voice call. onEnd(seconds, answered). */
export function CallScreen({ conv, onEnd }) {
  const [phase, setPhase] = useState('calling');
  const [sec, setSec] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const started = useRef(0);
  const endBtn = useRef(null);
  useEffect(() => {
    if (endBtn.current) endBtn.current.focus();
    // demo: the customer answers after a few rings
    const t = window.setTimeout(() => { setPhase('live'); started.current = Date.now(); }, 2600);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => {
    if (phase !== 'live') return undefined;
    const id = window.setInterval(() => setSec((Date.now() - started.current) / 1000), 500);
    return () => window.clearInterval(id);
  }, [phase]);
  const end = () => onEnd(phase === 'live' ? Math.max(1, Math.round(sec)) : 0, phase === 'live');
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') end(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });
  const via = conv.ch === 'whatsapp' || conv.ch === 'facebook' || conv.ch === 'instagram' || conv.ch === 'telegram' ? channelName(conv.ch) : 'phone';
  return (
    <div className="ms-call" role="dialog" aria-modal="true" aria-label={'Voice call with ' + conv.name}>
      <div className="ms-call__card">
        <div className={'ms-call__av' + (phase === 'calling' ? ' is-ringing' : '')}>
          <i aria-hidden="true" /><i aria-hidden="true" />
          <Avatar name={conv.name} avatar={conv.avatar} pos={conv.pos} size={96} />
        </div>
        <p className="ms-call__name">{conv.name}</p>
        <p className="ms-call__state" aria-live="polite">{phase === 'calling' ? 'Calling on ' + via + '…' : fmtDur(sec)}</p>
        <div className="ms-call__acts">
          <button type="button" className={'ms-call__btn' + (muted ? ' is-on' : '')} aria-pressed={muted} onClick={() => setMuted((v) => !v)} aria-label={muted ? 'Unmute' : 'Mute'}><Icon name={muted ? 'mic-off' : 'mic'} width="20" height="20" aria-hidden="true" /></button>
          <button type="button" className={'ms-call__btn' + (speaker ? ' is-on' : '')} aria-pressed={speaker} onClick={() => setSpeaker((v) => !v)} aria-label="Speaker"><Icon name="volume-2" width="20" height="20" aria-hidden="true" /></button>
          <button ref={endBtn} type="button" className="ms-call__btn ms-call__btn--end" onClick={end} aria-label="End call"><Icon name="phone-off" width="20" height="20" aria-hidden="true" /></button>
        </div>
      </div>
    </div>
  );
}

/** The reaction bar shown over a message. */
export function ReactPicker({ mine, onPick, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const first = ref.current && ref.current.querySelector('button');
    if (first) first.focus();
    const off = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', off); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc); };
  }, [onClose]);
  return (
    <div className="ms-picker" ref={ref} role="menu" aria-label="React">
      {REACTIONS.map((e) => <button key={e} type="button" role="menuitemradio" aria-checked={mine === e} className={mine === e ? 'is-on' : ''} onClick={() => onPick(e)} aria-label={'React ' + e}>{e}</button>)}
    </div>
  );
}

const NAMES = new Set(mentionNames().map((n) => n.toLowerCase()));
/** Text with @mentions of the team highlighted. */
export function Mentioned({ text }) {
  const parts = String(text || '').split(/(@[A-Za-z]+)/g);
  return <>{parts.map((p, i) => (p.startsWith('@') && NAMES.has(p.slice(1).toLowerCase()) ? <span key={i} className="ms-at">{p}</span> : <React.Fragment key={i}>{p}</React.Fragment>))}</>;
}

export const MSGR_CSS = `
.ms-voice{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-1-5) var(--space-3) var(--space-1-5) var(--space-1-5);border-radius:var(--radius-full);background:var(--surface-quiet);color:var(--text-heading)}
.ms-voice--out{background:var(--primary);color:var(--text-inverse)}
.ms-voice__btn{display:grid;place-items:center;flex:none;width:32px;height:32px;border:0;border-radius:var(--radius-full);background:var(--primary);color:var(--text-inverse);cursor:pointer;transition:transform var(--duration-fast) cubic-bezier(.23,1,.32,1)}
.ms-voice__btn:active{transform:scale(.92)}
.ms-voice--out .ms-voice__btn{background:var(--surface-card);color:var(--primary)}
.ms-voice__bars{display:flex;align-items:center;gap:2px;height:26px}
.ms-voice__bars i{display:block;width:3px;border-radius:var(--radius-full);background:color-mix(in srgb,var(--text-muted) 55%,transparent);transition:background-color var(--duration-fast) ease}
.ms-voice__bars i.is-on{background:var(--primary)}
.ms-voice--out .ms-voice__bars i{background:color-mix(in srgb,var(--text-inverse) 45%,transparent)}
.ms-voice--out .ms-voice__bars i.is-on{background:var(--text-inverse)}
.ms-voice__time{font-family:var(--font-data);font-size:var(--text-xs);min-width:30px}
.ms-voice__speed{height:22px;padding:0 6px;border:0;border-radius:var(--radius-full);background:color-mix(in srgb,currentColor 14%,transparent);color:inherit;font-size:var(--text-xs);font-weight:var(--weight-semibold);cursor:pointer}
.ms-rec{display:flex;align-items:center;gap:var(--space-2);width:100%}
.ms-rec__x,.ms-rec__send{display:grid;place-items:center;flex:none;width:40px;height:40px;border:0;border-radius:var(--radius-full);cursor:pointer}
.ms-rec__x{background:none;color:var(--text-danger)}
.ms-rec__x:hover{background:var(--fill-error-soft)}
.ms-rec__send{background:var(--primary);color:var(--text-inverse)}
.ms-rec__pill{flex:1;min-width:0;display:flex;align-items:center;gap:var(--space-2);height:40px;padding:0 var(--space-3);border-radius:var(--radius-full);background:var(--primary);color:var(--text-inverse);overflow:hidden}
.ms-rec__dot{flex:none;width:10px;height:10px;border-radius:var(--radius-full);background:var(--error);box-shadow:0 0 0 3px color-mix(in srgb,var(--text-inverse) 85%,transparent);animation:ms-blink 1.1s ease-in-out infinite}
.ms-rec__time{flex:none;font-family:var(--font-data);font-size:var(--text-xs);min-width:32px}
.ms-rec__wave{flex:1;min-width:0;display:flex;align-items:center;justify-content:flex-end;gap:2px;height:28px;overflow:hidden}
.ms-rec__wave i{flex:none;display:block;width:3px;border-radius:var(--radius-full);background:var(--text-inverse);transition:height 90ms linear}
@keyframes ms-blink{0%,100%{opacity:1}50%{opacity:.35}}
.ms-call{position:fixed;inset:0;z-index:var(--z-modal,1000);display:grid;place-items:center;padding:var(--space-4);background:color-mix(in srgb,var(--navy-950) 55%,transparent);animation:ms-fade var(--duration-base) ease-out}
.ms-call__card{display:flex;flex-direction:column;align-items:center;width:min(320px,100%);padding:var(--space-8) var(--space-5) var(--space-6);border-radius:var(--radius-2xl);background:linear-gradient(180deg,var(--navy-800),var(--navy-950));color:var(--text-inverse);box-shadow:var(--shadow-xl);animation:ms-rise 260ms cubic-bezier(.23,1,.32,1)}
.ms-call__av{position:relative;display:grid;place-items:center;width:96px;height:96px;margin-bottom:var(--space-4)}
.ms-call__av>i{position:absolute;inset:0;border-radius:var(--radius-full);border:2px solid color-mix(in srgb,var(--text-inverse) 55%,transparent);opacity:0}
.ms-call__av.is-ringing>i{animation:ms-ring 1.8s cubic-bezier(.23,1,.32,1) infinite}
.ms-call__av.is-ringing>i+i{animation-delay:.6s}
.ms-call__av .ib-av{position:relative}
@keyframes ms-ring{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.7);opacity:0}}
.ms-call__name{margin:0;font-size:var(--text-lg);font-weight:var(--weight-semibold)}
.ms-call__state{margin:var(--space-1) 0 var(--space-6);font-size:var(--text-sm);opacity:.75;font-variant-numeric:tabular-nums}
.ms-call__acts{display:flex;gap:var(--space-4)}
.ms-call__btn{display:grid;place-items:center;width:52px;height:52px;border:0;border-radius:var(--radius-full);background:color-mix(in srgb,var(--text-inverse) 16%,transparent);color:var(--text-inverse);cursor:pointer;transition:transform var(--duration-fast) cubic-bezier(.23,1,.32,1),background-color var(--duration-fast) ease}
.ms-call__btn:active{transform:scale(.94)}
.ms-call__btn.is-on{background:var(--text-inverse);color:var(--navy-900)}
.ms-call__btn--end{background:var(--error)}
@keyframes ms-fade{from{opacity:0}}
@keyframes ms-rise{from{opacity:0;transform:translateY(12px) scale(.97)}}
.ms-picker{position:absolute;bottom:calc(100% + 4px);z-index:var(--z-dropdown,50);display:flex;gap:2px;padding:4px;border-radius:var(--radius-full);background:var(--surface-card);box-shadow:var(--shadow-lg);transform-origin:bottom center;animation:ms-pop 160ms cubic-bezier(.23,1,.32,1)}
.ms-picker button{display:grid;place-items:center;width:36px;height:36px;border:0;border-radius:var(--radius-full);background:none;font-size:var(--text-xl);line-height:1;cursor:pointer;transition:transform 140ms cubic-bezier(.23,1,.32,1)}
.ms-picker button.is-on{background:var(--fill-primary-soft)}
@media (hover:hover) and (pointer:fine){.ms-picker button:hover{transform:scale(1.25) translateY(-2px)}}
@keyframes ms-pop{from{opacity:0;transform:scale(.9) translateY(4px)}}
.ms-at{padding:0 3px;border-radius:var(--radius-sm);background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-medium)}
@media (prefers-reduced-motion:reduce){
  .ms-rec__dot,.ms-call__av.is-ringing>i{animation:none}
  .ms-call,.ms-call__card,.ms-picker{animation:ms-fade var(--duration-fast) ease-out}
}
`;
