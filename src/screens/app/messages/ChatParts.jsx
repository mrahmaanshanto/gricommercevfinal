'use client';
// ChatParts — a conversation drawn like the MChat board (design/templates/app/MChat.dc.html), with the web thread's
// rules (components/inbox/Thread.jsx › MessageList, Messenger.jsx):
//   Thread { conv, now, orders, typing, onTap(m), onPhoto(src), onCall() }   day pills, bubbles that join into groups
//          (same sender within 5 minutes: tighter corners, the time on the group's last bubble), Seen ticks on our
//          last message, reactions, the message a reply answers, big emoji, photos, voice, product / order / payment /
//          story / call cards, team notes and system lines, "Sent by GridAI" under the AI's replies, typing dots
//   VoiceBubble { m, out }          play / pause (real audio for a recording made in this session: inbox.voiceUrl),
//                                   a waveform that fills, the time, 1× / 1.5× / 2×
//   Recorder { onSend({ dur, url }), onCancel }   MediaRecorder with a live waveform; without a microphone it still
//                                   records the length (the web's VoiceRecorder)

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Pill, OrderPill, Icon, money } from '../kit/AppKit';
import {
  ME, staffName, firstName, dayLabel, sameDay, clock, fmtDur, reactionsOf, bigEmoji, voiceUrl, mentionNames,
} from '@/lib/inbox';
import { productBy, stockAt } from '@/lib/stock';
import { XIcon } from './msgParts';

const GAP = 5 * 60 * 1000;
const R = { xl: 'var(--radius-xl)', md: 'var(--radius-md)' };
const IN_BG = 'var(--card)';
const OUT_BG = 'linear-gradient(160deg,#0a4bb5,#003087)';
const BUBBLE = { maxWidth: '76%', padding: '10px 14px 7px', fontSize: 'var(--text-sm-plus)', lineHeight: '21px', boxShadow: '0 1px 2px rgba(15,23,42,.06)', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' };
const visible = (m) => m.from === 'customer' || m.from === 'agent';
const joins = (a, b) => a && b && visible(a) && visible(b) && a.from === b.from && (a.from === 'customer' || a.by === b.by) && Math.abs(b.at - a.at) < GAP && sameDay(a.at, b.at);
const METHOD = { bkash: 'bKash', nagad: 'Nagad', sslcommerz: 'Card or bank' };

/** @Name mentions of the team in bold. */
function Mentioned({ text }) {
  const names = mentionNames();
  const re = new RegExp('(@(?:' + names.join('|') + ')\\b)', 'gi');
  const one = new RegExp('^@(?:' + names.join('|') + ')$', 'i');
  return <>{String(text || '').split(re).map((p, i) => (one.test(p) ? <b key={i} style={{ color: 'var(--brand)', fontWeight: 'var(--weight-semibold)' }}>{p}</b> : <React.Fragment key={i}>{p}</React.Fragment>))}</>;
}

function Ticks({ status }) {
  if (status === 'read') return <svg width="16" height="10" viewBox="0 0 16 10" aria-label="Seen" role="img" style={{ marginLeft: '4px' }}><path d="M1 5l3 3 6-7M6 8l1 1 7-8" fill="none" stroke="#7fd4f5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (status === 'delivered') return <svg width="16" height="10" viewBox="0 0 16 10" aria-label="Delivered" role="img" style={{ marginLeft: '4px' }}><path d="M1 5l3 3 6-7M6 8l1 1 7-8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  return <svg width="12" height="10" viewBox="0 0 12 10" aria-label="Sent" role="img" style={{ marginLeft: '4px' }}><path d="M1 5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

const hash = (s) => { let h = 7; for (const c of String(s || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
function barsFor(key, n = 26) {
  let h = hash(key) || 1;
  return Array.from({ length: n }, (_, i) => { h = (h * 1103515245 + 12345) >>> 0; const edge = Math.min(i, n - 1 - i) < 3 ? 0.55 : 1; return Math.round((6 + (h % 16)) * edge); });
}
const SPEEDS = [1, 1.5, 2];
export function VoiceBubble({ m, out }) {
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
  const toggle = (e) => {
    e.stopPropagation();
    if (url) {
      if (!audio.current) { const a = new Audio(url); a.ontimeupdate = () => setPos(a.currentTime); a.onended = () => { setOn(false); setPos(0); }; audio.current = a; }
      audio.current.playbackRate = speed;
      if (on) audio.current.pause(); else audio.current.play().catch(() => setOn(false));
    }
    setOn((v) => !v);
  };
  const next = (e) => { e.stopPropagation(); const s = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]; setSpeed(s); if (audio.current) audio.current.playbackRate = s; };
  const done = pos / dur;
  const fg = out ? '#fff' : 'var(--brand)';
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '190px' }}>
      <button type="button" onClick={toggle} aria-label={on ? 'Pause voice message' : 'Play voice message'} style={{ width: '34px', height: '34px', flex: 'none', border: 0, borderRadius: 'var(--radius-full)', background: out ? 'rgba(255,255,255,.18)' : 'var(--soft)', color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <XIcon name={on ? 'pause' : 'play'} size={14} fill="currentColor" stroke={0} />
      </button>
      <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1, height: '24px' }}>
        {bars.current.map((h, i) => <i key={i} style={{ width: '3px', height: h + 'px', borderRadius: 'var(--radius-full)', background: i / bars.current.length < done ? fg : out ? 'rgba(255,255,255,.4)' : '#c7d3e6' }} />)}
      </span>
      <span className="num" style={{ fontSize: 'var(--text-xs)', opacity: '.8', flex: 'none' }}>{fmtDur(on || pos ? pos : dur)}</span>
      {on || pos ? <button type="button" onClick={next} aria-label={'Playback speed ' + speed + '×'} style={{ flex: 'none', border: 0, borderRadius: 'var(--radius-full)', padding: '1px 6px', background: out ? 'rgba(255,255,255,.18)' : 'var(--soft)', color: fg, font: 'inherit', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>{speed}×</button> : null}
    </span>
  );
}

/** Records a voice message (MediaRecorder; a timed demo without a microphone). */
export function Recorder({ onSend, onCancel }) {
  const [sec, setSec] = useState(0);
  const [levels, setLevels] = useState(() => Array(24).fill(4));
  const rec = useRef({ stream: null, mr: null, chunks: [], ctx: null, raf: 0, start: 0, sim: 0, stopped: false });
  useEffect(() => {
    const r = rec.current;
    r.start = Date.now();
    const tick = window.setInterval(() => { const s = (Date.now() - r.start) / 1000; setSec(s); if (s >= 120) finish(); }, 200);
    const simulate = () => { r.sim = window.setInterval(() => setLevels((l) => [...l.slice(1), 5 + Math.round(Math.random() * 16)]), 110); };
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
            for (let i = 0; i < buf.length; i += 1) peak = Math.max(peak, Math.abs(buf[i] - 128));
            if (t - last > 90) { last = t; setLevels((l) => [...l.slice(1), Math.max(4, Math.min(22, Math.round(peak / 3)))]); }
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
  return (
    <>
      <button type="button" className="ib" aria-label="Delete recording" onClick={() => { cleanup(); onCancel(); }} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: 'var(--errbg)', color: 'var(--err)' }}><XIcon name="trash" size={18} /></button>
      <span role="status" aria-label="Recording a voice message" style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '4px' }}>
        <i aria-hidden="true" className="mc-recdot" style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', background: '#ef4444', flex: 'none' }} />
        <span className="num" style={{ fontSize: 'var(--text-sm)', color: 'var(--ink)', flex: 'none' }}>{fmtDur(sec)}</span>
        <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1, height: '24px', overflow: 'hidden' }}>
          {levels.map((h, i) => <i key={i} style={{ width: '3px', height: h + 'px', borderRadius: 'var(--radius-full)', background: 'var(--brand)', flex: 'none' }} />)}
        </span>
      </span>
      <button type="button" className="ib" aria-label="Send voice message" onClick={finish} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: 'var(--brand)', color: '#fff' }}><XIcon name="send" size={18} /></button>
    </>
  );
}

function ProductCard({ sku }) {
  const p = productBy(sku);
  if (!p) return <div style={{ ...BUBBLE, background: IN_BG, borderRadius: R.xl }}>Product {sku} is no longer in the catalogue.</div>;
  const free = stockAt(p.sku, '').available;
  return (
    <div className="card" style={{ width: '76%', overflow: 'hidden', borderRadius: `${R.xl} ${R.xl} ${R.md} ${R.xl}` }}>
      <div role="img" aria-label={p.name} style={{ height: '76px', background: 'linear-gradient(135deg,#fff4e0,#ffe0b8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
        <Icon name="box" size={30} stroke={1.6} />
      </div>
      <div style={{ padding: '10px 14px 12px' }}>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--ink)' }}>{p.name}{p.variant ? ' · ' + p.variant : ''}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <span className="num" style={{ fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-semibold)', color: 'var(--ink)' }}>{money(p.price)}{p.mrp && p.mrp > p.price ? <> <s style={{ fontWeight: 'var(--weight-regular)', color: 'var(--muted)', fontSize: 'var(--text-xs-plus)' }}>{money(p.mrp)}</s></> : null}</span>
          {free > 0 ? (free <= 12 ? <Pill tone="warn" shape>{free} left</Pill> : <Pill tone="ok" shape>In stock</Pill>) : <Pill tone="err" shape>Out of stock</Pill>}
        </div>
      </div>
    </div>
  );
}

function OrderCard({ id, orders, out }) {
  const o = (orders || []).find((x) => x.id === id);
  return (
    <Link href={'/m-order-detail?id=' + encodeURIComponent(id)} className="card" style={{ width: '76%', display: 'block', borderRadius: out ? `${R.xl} ${R.xl} ${R.md} ${R.xl}` : `${R.xl} ${R.xl} ${R.xl} ${R.md}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px' }}>
        <span className="ico" style={{ width: '40px', height: '40px' }}><Icon name="bag" size={20} /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--ink)' }}>Order <span className="mono">{id}</span></span>
          <span className="ell" style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{o ? `${o.itemTitle || 'Items'} · ${o.units || 1} item${(o.units || 1) === 1 ? '' : 's'}` : 'Details on the order page'}</span>
        </span>
      </div>
      {o ? <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 14px 12px' }}><span className="num" style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--ink)' }}>{money(o.amount)}</span><OrderPill statusKey={o.statusKey} /></div> : null}
    </Link>
  );
}

function PaymentCard({ m }) {
  return (
    <div className="card" style={{ width: '76%', borderRadius: `${R.xl} ${R.xl} ${R.md} ${R.xl}`, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className="ico" style={{ width: '40px', height: '40px' }}><Icon name="wallet" size={20} /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--ink)' }}>Payment request{m.order ? ' · ' + m.order : ''}</span>
          <span className="ell mono" style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{m.link}</span>
        </span>
      </div>
      {m.note ? <div style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--body)', marginTop: '8px' }}>{m.note}</div> : null}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <span className="num" style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--ink)' }}>{money(m.amount)}</span>
        <Pill tone={m.paid ? 'ok' : 'warn'}>{m.paid ? 'Paid' : 'Waiting · ' + (METHOD[m.method] || 'Online')}</Pill>
      </div>
    </div>
  );
}

function StoryCard({ m }) {
  return (
    <div className="card" style={{ width: '62%', overflow: 'hidden', borderRadius: `${R.xl} ${R.xl} ${R.xl} ${R.md}` }}>
      {m.img ? <img src={m.img} alt="" style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }} /> : null}
      <div style={{ padding: '8px 12px 10px' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{m.story === 'mention' ? 'Mentioned you in their story' : 'Shared a post'}</div>
        {m.text ? <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink)', marginTop: '2px' }}>{m.text}</div> : null}
      </div>
    </div>
  );
}

/** Every message of a conversation, board style. */
export function Thread({ conv, now, orders, typing, onTap, onPhoto, onCall }) {
  const msgs = conv.messages || [];
  const byId = new Map(msgs.map((m) => [m.id, m]));
  const lastOut = [...msgs].reverse().find((m) => m.from === 'agent');
  const out = [];
  msgs.forEach((m, i) => {
    const prev = msgs[i - 1];
    const next = msgs[i + 1];
    if (!prev || !sameDay(prev.at, m.at)) {
      out.push(<div key={'d' + m.id} style={{ alignSelf: 'center', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', color: 'var(--muted)', background: '#e9eef5', padding: '3px 10px', borderRadius: 'var(--radius-full)', margin: '4px 0' }}>{dayLabel(m.at, now)}</div>);
    }
    if (m.from === 'system') {
      out.push(<div key={m.id} style={{ alignSelf: 'center', maxWidth: '88%', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: '17px', padding: '2px 0' }}>{m.text} · {clock(m.at)}</div>);
      return;
    }
    if (m.from === 'note') {
      out.push(
        <div key={m.id} style={{ alignSelf: 'stretch', padding: '10px 14px', borderRadius: 'var(--radius-xl)', background: 'var(--warnbg)', color: '#7a3e05', fontSize: 'var(--text-sm)', lineHeight: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', marginBottom: '2px' }}><XIcon name="note" size={13} />Note · {m.by === ME ? 'You' : staffName(m.by)} · {clock(m.at)}</div>
          <Mentioned text={m.text} />
        </div>,
      );
      return;
    }
    const mine = m.from === 'agent';
    const first = !joins(prev, m);
    const last = !joins(m, next);
    const side = mine ? 'flex-end' : 'flex-start';
    // corners: the board's tail on the group's last bubble; joined bubbles get a tighter corner on their side
    const rad = mine
      ? `${R.xl} ${first ? R.xl : R.md} ${R.md} ${R.xl}`
      : `${first ? R.xl : R.md} ${R.xl} ${R.xl} ${R.md}`;
    const reacts = reactionsOf(m);
    const quoted = m.replyTo ? byId.get(m.replyTo) : null;
    const time = last ? (
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: 'var(--text-xs)', opacity: '.7', marginTop: '2px' }}>
        {clock(m.at)}{mine && lastOut && lastOut.id === m.id ? <Ticks status={m.status} /> : null}
      </div>
    ) : null;
    const quote = quoted ? (
      <div style={{ margin: '0 0 6px', padding: '4px 8px', borderLeft: '3px solid ' + (mine ? 'rgba(255,255,255,.6)' : 'var(--brand)'), borderRadius: 'var(--radius-md)', background: mine ? 'rgba(255,255,255,.12)' : 'var(--soft)', fontSize: 'var(--text-xs-plus)', lineHeight: '17px', opacity: '.9' }}>
        <b style={{ fontWeight: 'var(--weight-medium)' }}>{quoted.from === 'customer' ? firstName(conv.name) : quoted.by === ME ? 'You' : quoted.ai ? 'GridAI' : firstName(staffName(quoted.by))}</b>
        <span className="ell" style={{ display: 'block' }}>{quoted.text || (quoted.type === 'voice' ? 'Voice message' : quoted.type === 'image' ? 'Photo' : 'Message')}</span>
      </div>
    ) : null;
    let body;
    const bubble = (children, extra) => (
      <div style={{ ...BUBBLE, borderRadius: rad, background: mine ? OUT_BG : IN_BG, color: mine ? '#fff' : 'var(--ink)', ...extra }}>{quote}{children}{time}</div>
    );
    if (m.type === 'product') body = <ProductCard sku={m.sku} />;
    else if (m.type === 'order') body = <OrderCard id={m.order} orders={orders} out={mine} />;
    else if (m.type === 'payment') body = <PaymentCard m={m} />;
    else if (m.type === 'story') body = <StoryCard m={m} />;
    else if (m.type === 'voice') body = bubble(<VoiceBubble m={m} out={mine} />);
    else if (m.type === 'image') {
      body = bubble(<>
        <button type="button" onClick={(e) => { e.stopPropagation(); onPhoto(m.img); }} aria-label="Open the photo" style={{ display: 'block', padding: 0, border: 0, background: 'none', cursor: 'zoom-in', margin: '-4px -8px 4px' }}>
          <img src={m.img} alt="" style={{ display: 'block', width: '100%', maxWidth: '230px', maxHeight: '260px', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} />
        </button>
        {m.text ? <Mentioned text={m.text} /> : null}
      </>);
    } else if (m.type === 'call') {
      const missed = m.dir === 'missed';
      body = bubble(
        <button type="button" onClick={(e) => { e.stopPropagation(); onCall(); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: 0, border: 0, background: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', textAlign: 'left' }}>
          <span style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: mine ? 'rgba(255,255,255,.18)' : missed ? 'var(--errbg)' : 'var(--soft)', color: mine ? '#fff' : missed ? 'var(--err)' : 'var(--brand)', flex: 'none' }}>
            <XIcon name={missed ? 'missed' : m.dir === 'in' ? 'incoming' : 'outgoing'} size={16} stroke={2} />
          </span>
          <span>
            <span style={{ display: 'block', fontWeight: 'var(--weight-medium)' }}>{missed ? 'Missed call' : 'Voice call'}</span>
            <span style={{ display: 'block', fontSize: 'var(--text-xs)', opacity: '.8' }}>{missed ? 'Tap to call back' : fmtDur(m.dur)}</span>
          </span>
        </button>,
      );
    } else if (m.type === 'text' && bigEmoji(m.text)) {
      body = <div style={{ fontSize: '40px', lineHeight: '48px', padding: '0 2px' }} aria-label={m.text}>{m.text}{time ? <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textAlign: mine ? 'right' : 'left', lineHeight: '16px' }}>{clock(m.at)}</div> : null}</div>;
    } else body = bubble(<Mentioned text={m.text} />);
    out.push(
      <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: side, marginTop: first ? '4px' : '-4px' }}>
        <div role="button" tabIndex={0} aria-label={`Message from ${mine ? (m.ai ? 'GridAI' : m.by === ME ? 'you' : staffName(m.by)) : conv.name}. Tap to react or reply`}
          onClick={() => onTap(m)} onKeyDown={(e) => { if (e.key === 'Enter') onTap(m); }}
          style={{ display: 'flex', justifyContent: side, width: '100%', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
          {body}
        </div>
        {reacts.length ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', marginTop: '-8px', padding: '1px 6px', borderRadius: 'var(--radius-full)', background: 'var(--card)', boxShadow: '0 1px 3px rgba(15,23,42,.15)', fontSize: 'var(--text-xs)', position: 'relative', zIndex: 1, marginRight: mine ? '8px' : 0, marginLeft: mine ? 0 : '8px' }}>
            {reacts.map(([e, n]) => <span key={e}>{e}{n > 1 ? <span className="num" style={{ color: 'var(--muted)', marginLeft: '1px' }}>{n}</span> : null}</span>)}
          </span>
        ) : null}
        {m.ai && last ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '2px' }}><Icon name="sparkles" size={12} />Sent by GridAI</span> : null}
        {mine && !m.ai && last && m.by && m.by !== ME ? <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '2px' }}>{staffName(m.by)}</span> : null}
      </div>,
    );
  });
  if (typing) {
    out.push(
      <div key="typing" style={{ display: 'flex', gap: '4px', padding: '10px 14px', borderRadius: 'var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-md)', background: 'var(--card)', alignSelf: 'flex-start' }} aria-label="Typing" role="status">
        <span className="mc-dot" style={{ width: '7px', height: '7px', borderRadius: 'var(--radius-full)', background: '#94a3b8' }} />
        <span className="mc-dot" style={{ width: '7px', height: '7px', borderRadius: 'var(--radius-full)', background: '#b8c2d0' }} />
        <span className="mc-dot" style={{ width: '7px', height: '7px', borderRadius: 'var(--radius-full)', background: '#d5dce6' }} />
      </div>,
    );
  }
  return out;
}
