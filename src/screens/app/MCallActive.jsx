'use client';
// Merchant app · On a call (/m-call-active). The design board's dark call screen (design/templates/app/MCallActive.dc.html)
// running the web's call flow (components/inbox/Messenger.jsx › CallScreen, /merchant-calls):
//   ringing → the timer → End → "How did the call go?" (reason, result, follow-up, order, note) → a call log row
//   (inbox.addCall), the callback it answered marked done, its call task closed, and a call bubble in the chat when the
//   call started from one. Skip saves the row without an outcome.
// The call itself is kept for this tab (messages/msgData.js › getLiveCall), so Minimise goes back to Calls (or the chat)
// and the call keeps going there. Mute, Hold and Speaker are switches; Transfer hands it to a teammate (a log row with
// "Transferred"). The card shows the caller's orders and what they spent, with their chat. Recording follows Call
// settings. Opening this page without a call starts one from ?phone=&name= (or goes back to Calls).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppScreen, Sheet, ListRow, Pill, OrderPill, useAppData, toast, money } from './kit/AppKit';
import { ME, STAFF, AGENT_STATUS, getConvs, fmtDur } from '@/lib/inbox';
import { getOrders } from '@/lib/orders';
import { Face, XIcon } from './messages/msgParts';
import { OutcomeSheet } from './messages/CallParts';
import {
  access, fmtPhone, factsOf, convOfPhone, liveNow, startCall, patchLiveCall, saveCallOutcome, transferCall, getCallSettings,
} from './messages/msgData';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const PHONE = 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z';
const ACT = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs-plus)', color: '#fff', border: 0, background: 'none', padding: 0, font: 'inherit', cursor: 'pointer' };
const DOT = (on) => ({ width: '62px', height: '62px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? '#fff' : 'rgba(255,255,255,.14)', color: on ? '#003087' : '#fff' });

export default function MCallActiveScreen() {
  const router = useRouter();
  const { ready, tick, ctx } = useAppData();
  const [now, setNow] = useState(0);
  const [ended, setEnded] = useState(null);     // { call, dur } after End
  const [xfer, setXfer] = useState(false);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, []);

  // no call on: start one from the address (?phone=&name=&conv=), else back to Calls
  useEffect(() => {
    if (!ready || ended) return;
    if (liveNow()) return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('phone')) { startCall({ phone: p.get('phone'), name: p.get('name') || '', conv: p.get('conv') || '', dir: 'out', back: p.get('back') || '/m-calls' }); return; }
    router.replace('/m-calls');
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const call = ready && now ? liveNow(now) : null;
  const shown = ended ? ended.call : call;
  const data = useMemo(() => {
    if (!ready || !shown) return null;
    const orders = safe(() => getOrders(), []);
    const facts = factsOf(shown.phone, orders);
    const conv = shown.conv ? safe(() => getConvs().find((c) => c.id === shown.conv), null) : convOfPhone(shown.phone);
    return { facts, conv, record: safe(() => getCallSettings().values.record, true) };
  }, [ready, tick, shown && shown.phone]); // eslint-disable-line react-hooks/exhaustive-deps

  const live = shown && shown.state === 'live';
  const secs = live && shown.liveAt ? Math.max(0, Math.round(((ended ? ended.at : now) - shown.liveAt) / 1000)) : 0;
  const back = (shown && shown.back) || '/m-calls';
  const canTicket = ctx ? access('/m-tickets', ctx) : false;
  const name = shown ? shown.name || fmtPhone(shown.phone) : '';

  const toggle = (k) => { if (!call) return; if (k === 'hold' && !live) return; patchLiveCall({ [k]: !call[k] }); };
  const end = () => { if (!call) return; setEnded({ call, dur: live ? Math.max(1, secs) : 0, at: Date.now() }); };
  const save = (o, skip) => {
    saveCallOutcome(ended.call, o, skip);
    toast(skip ? 'Call saved without an outcome' : `Call saved · ${o.result}${o.followUp ? ' · call back ' + o.followUp : ''}`);
    router.replace(back);
  };
  const transfer = (to) => {
    transferCall(call, to, live ? secs : 0);
    setXfer(false);
    toast(`Call transferred to ${STAFF.find((s) => s.id === to).name}`);
    router.replace(back);
  };

  return (
    <AppScreen name="MCallActive" title={'Call with ' + name} statusTone="light">
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', margin: '-1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>{'Call with ' + name}</h1>
      <div style={{ position: 'absolute', inset: '0', background: 'linear-gradient(170deg,#0b1f4d 0%,#012169 45%,#0a1633 100%)' }} />
      <div style={{ position: 'absolute', top: '47px', left: '0', right: '0', display: 'flex', justifyContent: 'space-between', padding: '6px 16px', zIndex: '5' }}>
        <Link href={back} className="ib" aria-label="Minimise" style={{ color: '#fff' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </Link>
        {live && data && data.record ? <span className="pill" style={{ alignSelf: 'center', background: 'rgba(16,185,129,.18)', color: '#9ff0cf' }}><span className="sh ok" />Recording</span>
          : shown && shown.hold ? <span className="pill" style={{ alignSelf: 'center', background: 'rgba(245,158,11,.2)', color: '#fcd9a0' }}>On hold</span> : <span />}
        <span style={{ width: '44px' }} />
      </div>

      <div style={{ position: 'absolute', top: '118px', left: '0', right: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff' }}>
        <span style={{ padding: '5px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,.08)', boxShadow: '0 0 0 12px rgba(255,255,255,.04)' }} className={shown && shown.state === 'ringing' ? 'mca-ring' : undefined}>
          <Face name={name || '?'} avatar={data && data.conv ? data.conv.avatar : ''} pos={data && data.conv ? data.conv.pos : ''} size={96} />
        </span>
        <div className="ell" style={{ maxWidth: '90%', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-semibold)', marginTop: '16px', letterSpacing: 'var(--tracking-tight)' }}>{name || ' '}</div>
        <div className="num" style={{ fontSize: 'var(--text-sm)', opacity: '.75' }}>{shown ? [fmtPhone(shown.phone), shown.reason ? `via “${shown.reason}”` : ''].filter(Boolean).join(' · ') : ' '}</div>
        <div className="num" aria-live="polite" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginTop: '8px', color: '#7fd4f5' }}>
          {!shown ? ' ' : ended ? 'Call ended' : shown.state === 'ringing' ? 'Calling…' : (shown.hold ? 'On hold · ' : '') + fmtDur(secs).padStart(5, '0')}
        </div>
      </div>

      <div style={{ position: 'absolute', top: '356px', left: '20px', right: '20px', borderRadius: 'var(--radius-xl)', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', color: '#fff', zIndex: '4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', padding: '12px 14px 4px', fontSize: 'var(--text-xs-plus)', color: '#cbd8ee' }}>
          <span className="num">{data ? (data.facts.count ? `${data.facts.count} order${data.facts.count === 1 ? '' : 's'} · ${money(data.facts.spent)} spent` : 'No orders yet') : ' '}</span>
          {data && data.conv && ctx && access('/m-inbox', ctx) ? <Link href={'/m-chat?id=' + encodeURIComponent(data.conv.id)} style={{ color: '#7fd4f5', fontWeight: 'var(--weight-medium)' }}>Open chat</Link> : null}
        </div>
        {data && data.facts.orders.length ? data.facts.orders.slice(0, 2).map((o, i) => (
          <Link key={o.id} href={'/m-order-detail?id=' + encodeURIComponent(o.id)} className="lrow" style={{ padding: '12px 14px', borderTopColor: i ? 'rgba(255,255,255,.12)' : undefined }}>
            <span style={{ flex: '1', minWidth: 0 }}>
              <span className="mono" style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: '#cbd8ee' }}>{o.id}</span>
              <span className="num ell" style={{ display: 'block', fontSize: 'var(--text-sm)', color: '#fff' }}>{o.units || 1} item{(o.units || 1) === 1 ? '' : 's'} · {money(o.amount)}</span>
            </span>
            <OrderPill statusKey={o.statusKey} />
          </Link>
        )) : <div className="lrow" style={{ padding: '12px 14px', fontSize: 'var(--text-sm)', color: '#cbd8ee' }}>{data ? 'Not in your customers yet' : ' '}</div>}
      </div>

      <div style={{ position: 'absolute', top: '548px', left: '0', right: '0', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '0 20px', zIndex: '4' }}>
        <button type="button" style={ACT} aria-pressed={!!(shown && shown.muted)} onClick={() => toggle('muted')}>
          <span style={DOT(shown && shown.muted)}><XIcon name="micOff" size={24} stroke={1.9} /></span>{shown && shown.muted ? 'Unmute' : 'Mute'}
        </button>
        <button type="button" style={{ ...ACT, opacity: live ? 1 : 0.5 }} aria-pressed={!!(shown && shown.hold)} disabled={!live} onClick={() => toggle('hold')}>
          <span style={DOT(shown && shown.hold)}><XIcon name="hold" size={24} stroke={1.9} /></span>{shown && shown.hold ? 'Resume' : 'Hold'}
        </button>
        <button type="button" style={ACT} aria-pressed={!!(shown && shown.speaker)} onClick={() => toggle('speaker')}>
          <span style={DOT(shown && shown.speaker)}><XIcon name="speaker" size={24} stroke={1.9} /></span>Speaker
        </button>
        <button type="button" style={{ ...ACT, opacity: live ? 1 : 0.5 }} disabled={!live} onClick={() => setXfer(true)}>
          <span style={DOT(false)}><XIcon name="transfer" size={24} stroke={1.9} /></span>Transfer
        </button>
      </div>

      <div data-pin-bottom="" style={{ position: 'absolute', left: '20px', right: '20px', bottom: '44px', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'flex-end', zIndex: '4' }}>
        {canTicket && shown ? (
          <Link href={`/m-ticket-new?phone=${encodeURIComponent(shown.phone)}&name=${encodeURIComponent(shown.name || '')}`} className="btn" style={{ flex: '1', height: '56px', background: 'rgba(255,255,255,.12)', color: '#fff', fontSize: 'var(--text-sm-plus)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M13 5v2M13 17v2M13 11v2" /></svg>Create ticket
          </Link>
        ) : null}
        <button type="button" aria-label="End call" onClick={end} disabled={!call || !!ended}
          style={{ width: '72px', height: '72px', flex: 'none', border: 0, borderRadius: 'var(--radius-full)', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 12px 24px -8px rgba(239,68,68,.7)', cursor: 'pointer' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(135deg)' }} aria-hidden="true"><path d={PHONE} /></svg>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        [data-screen="MCallActive"] .ph > .hi{background:#fff}
        [data-screen="MCallActive"] .mca-ring{animation:mca-ring 1.6s ease-out infinite}
        @keyframes mca-ring{0%{box-shadow:0 0 0 0 rgba(127,212,245,.35)}100%{box-shadow:0 0 0 22px rgba(127,212,245,0)}}
        @media (prefers-reduced-motion:reduce){[data-screen="MCallActive"] .mca-ring{animation:none}}
      ` }} />

      <Sheet open={xfer} onClose={() => setXfer(false)} title="Transfer to">
        <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
          {STAFF.filter((s) => s.id !== ME).map((s) => {
            const [label, tone] = AGENT_STATUS[s.phone] || ['', 'slate'];
            const free = s.phone === 'available';
            return (
              <ListRow key={s.id} compact onClick={free ? () => transfer(s.id) : undefined} avatar={<Face name={s.name} size={40} />} title={s.name} sub={s.role}
                end={<Pill tone={{ success: 'ok', info: 'nav', warning: 'warn' }[tone] || 'grey'}>{label}</Pill>} chevron={false} />
            );
          })}
        </div>
      </Sheet>

      <OutcomeSheet open={!!ended} call={ended ? ended.call : null} dur={ended ? ended.dur : 0} orders={data ? data.facts.orders : []} onSave={save} />
    </AppScreen>
  );
}
