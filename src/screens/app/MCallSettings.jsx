'use client';
// Merchant app · Call settings (/m-call-settings). The design board's layout (design/templates/app/MCallSettings.dc.html)
// with only what matters on a phone; the call menus, scripts and voices stay on the web (/auto-call-settings).
//   number          the line that rings on this phone (inbox.LINES), shown on the board's blue card
//   Answering       opening hours (read from GridAI's office hours, lib/aiReply.js; changed on the web), after hours
//                   (voicemail + SMS · GridAI answers · forward), forward calls to my mobile (+ the number)
//   Who picks up    the team on the phones with their status now (inbox.STAFF / AGENT_STATUS; you: getMyStatus)
//   Automatic calls confirm cash-on-delivery orders (AI call), GridAI answers calls nobody picks up, missed call
//                   reply, record calls
// Saved with Save into the shared settings store (lib/settingsStore.js, form 'calls'), so the web reads the same values;
// a field someone else saved after this page opened is reported instead of overwritten.

import React, { useEffect, useState } from 'react';
import {
  AppScreen, AppBar, Content, ActionBar, Button, Switch, Sheet, Pill, TextInput, Note, useAppData, toast,
} from './kit/AppKit';
import { ME, STAFF, AGENT_STATUS, LINES, getMyStatus, phoneDigits } from '@/lib/inbox';
import { getAiSettings } from '@/lib/aiReply';
import { currentUser } from '@/lib/team';
import { SectionLabel, NoAccess } from './messages/msgParts';
import { access, getCallSettings, saveCallSettings, dialable, fmtPhone } from './messages/msgData';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const AFTER = [['voicemail', 'Voicemail + SMS', 'Callers leave a message; they get an SMS that you will call back.'], ['ai', 'GridAI answers', 'GridAI answers simple questions and takes a message for the rest.'], ['forward', 'Forward to my phone', 'Calls ring on your mobile number.']];
const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ROW_T = { display: 'block', fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-medium)' };
const ROW_S = { display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)', lineHeight: '18px' };
const tone = (t) => ({ success: 'ok', info: 'nav', warning: 'warn' })[t] || 'grey';
const hm = (s) => { const [h, m] = String(s || '0:0').split(':').map(Number); return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''} ${h < 12 ? 'AM' : 'PM'}`; };
function daysText(days) {
  const d = [...(days || [])].sort((a, b) => ((a + 1) % 7) - ((b + 1) % 7));   // Saturday first, as the shop's week runs
  if (d.length === 7) return 'Every day';
  if (d.length === 6 && !d.includes(5)) return 'Sat–Thu';
  return d.map((x) => DAY[x]).join(', ');
}
const Chev = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none' }}><path d="m9 18 6-6-6-6" /></svg>;
const rowBtn = { width: '100%', border: 0, background: 'none', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer' };

export default function MCallSettingsScreen() {
  const { ready, tick, ctx } = useAppData(['gc:settings', 'gc:comms']);
  const [v, setV] = useState(null);
  const [base, setBase] = useState(0);
  const [sheet, setSheet] = useState('');
  useEffect(() => {
    if (!ready || v) return;
    const s = getCallSettings();
    setV(s.values); setBase(s.version);
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const hours = ready ? safe(() => getAiSettings().hours, null) : null;
  const myStatus = ready ? safe(() => getMyStatus(), 'available') : 'available';
  void tick;

  if (ctx && !access('/m-calls', ctx)) {
    return (
      <AppScreen name="MCallSettings" title="Call settings">
        <AppBar title="Call settings" back="/m-more" />
        <Content top={103}><NoAccess title="Calls aren’t part of your access in this edition." /></Content>
      </AppScreen>
    );
  }

  const set = (k) => (x) => setV((cur) => ({ ...cur, [k]: x }));
  const line = v ? LINES.find((l) => l[0] === v.line) || LINES[0] : LINES[0];
  const [num, lineName] = line[1].split(' · ');
  const save = () => {
    if (v.forward && !dialable(v.forwardTo)) { toast('Enter the mobile number calls are forwarded to', { tone: 'error' }); setSheet('forward'); return; }
    const user = safe(() => currentUser(), null);
    const r = saveCallSettings({ ...v, forwardTo: phoneDigits(v.forwardTo) }, base, user ? user.name : 'You');
    if (r.conflict) {
      toast(`${r.conflict.savedBy || 'Someone'} changed these settings a moment ago. Their values are shown now; check and save again.`, { tone: 'error' });
      const s = getCallSettings(); setV(s.values); setBase(s.version);
      return;
    }
    if (r.version) setBase(r.version);
    toast(r.same ? 'Nothing to save' : 'Call settings saved');
  };

  return (
    <AppScreen name="MCallSettings" title="Call settings">
      <AppBar title="Call settings" back="/m-calls" />
      <Content top={103} bottom={98}>
        <button type="button" onClick={() => setSheet('line')} className="card" style={{ ...rowBtn, margin: '2px 20px 0', width: 'calc(100% - 40px)', padding: '16px', background: 'linear-gradient(150deg,#012169,#0a4bb5)', color: '#fff', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-xl)', background: 'rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" /></svg>
          </span>
          <span style={{ flex: '1', minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 'var(--text-xs-plus)', opacity: '.8' }}>{lineName ? `Rings on this phone · ${lineName}` : 'Rings on this phone'}</span>
            <span className="num ell" style={{ display: 'block', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)' }}>{num}</span>
          </span>
          <span className="pill" style={{ background: 'rgba(16,185,129,.2)', color: '#9ff0cf' }}><span className="sh ok" />Live</span>
        </button>

        <SectionLabel>Answering</SectionLabel>
        <div className="card" style={{ margin: '0 20px' }}>
          <button type="button" className="lrow" style={rowBtn} onClick={() => setSheet('hours')}>
            <span style={{ flex: '1', fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-medium)' }}>Opening hours</span>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{hours ? `${daysText(hours.days)} · ${hm(hours.from)}–${hm(hours.to)}` : ' '}</span>
          </button>
          <button type="button" className="lrow" style={rowBtn} onClick={() => setSheet('after')}>
            <span style={{ flex: '1', fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-medium)' }}>After hours</span>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>{v ? (AFTER.find((a) => a[0] === v.afterHours) || AFTER[0])[1] : ' '}</span>
            <Chev />
          </button>
          <div className="lrow">
            <span style={{ flex: '1', minWidth: '0' }}>
              <span style={ROW_T}>Forward calls to my phone</span>
              <span style={ROW_S}>{v && v.forward && v.forwardTo ? <>When the shop line isn’t answered · <button type="button" onClick={() => setSheet('forward')} className="num" style={{ border: 0, background: 'none', padding: 0, font: 'inherit', color: 'var(--brand)', cursor: 'pointer' }}>{fmtPhone(v.forwardTo)}</button></> : 'When the shop line isn’t answered'}</span>
            </span>
            <Switch on={!!(v && v.forward)} label="Forward calls to my phone" onChange={(on) => { set('forward')(on); if (on && v && !v.forwardTo) setSheet('forward'); }} />
          </div>
        </div>

        <SectionLabel>Who picks up</SectionLabel>
        <div className="card" style={{ margin: '0 20px' }}>
          {STAFF.map((s, i) => {
            const st = s.id === ME ? myStatus : s.phone;
            const [label, t] = AGENT_STATUS[st] || ['Offline', 'slate'];
            const BG = ['#003087', '#0a8a63', '#b45309', '#475569', '#7c3aed'];
            return (
              <div key={s.id} className="lrow">
                <span className="av" style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: BG[i % BG.length], color: '#fff', fontSize: 'var(--text-xs-plus)' }}>{s.initials}</span>
                <span style={{ flex: '1', minWidth: '0' }}>
                  <span className="ell" style={ROW_T}>{s.name}{s.id === ME ? ' (you)' : ''}</span>
                  <span className="ell" style={ROW_S}>{s.role}</span>
                </span>
                <Pill tone={tone(t)}>{label}</Pill>
              </div>
            );
          })}
        </div>

        <SectionLabel>Automatic calls</SectionLabel>
        <div className="card" style={{ margin: '0 20px' }}>
          {[
            ['codConfirm', 'Confirm cash-on-delivery orders', 'Robot call in Bangla. Press 1 to confirm, 2 to cancel.'],
            ['aiAnswer', 'GridAI answers missed calls', 'When nobody picks up, GridAI answers simple questions and takes a message.'],
            ['missedReply', 'Missed call reply', 'Send a WhatsApp message within 1 minute'],
            ['record', 'Record calls', 'Kept 90 days · customers hear a notice'],
          ].map(([k, t, s]) => (
            <div key={k} className="lrow">
              <span style={{ flex: '1', minWidth: '0' }}>
                <span style={ROW_T}>{t}</span>
                <span style={ROW_S}>{s}</span>
              </span>
              <Switch on={!!(v && v[k])} label={t} onChange={set(k)} />
            </div>
          ))}
        </div>
        <div style={{ height: '8px' }} />
      </Content>
      <ActionBar>
        <Button kind="primary" onClick={save} disabled={!v}>Save</Button>
      </ActionBar>

      <Sheet open={sheet === 'line'} onClose={() => setSheet('')} title="Line on this phone">
        <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
          {LINES.map(([k, l]) => (
            <button key={k} type="button" className="lrow" style={rowBtn} aria-pressed={v && v.line === k} onClick={() => { set('line')(k); setSheet(''); }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="num" style={ROW_T}>{l.split(' · ')[0]}</span>
                <span style={ROW_S}>{l.split(' · ')[1] || 'Voice calls on WhatsApp'}</span>
              </span>
              {v && v.line === k ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg> : null}
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet open={sheet === 'after'} onClose={() => setSheet('')} title="After hours">
        <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
          {AFTER.map(([k, l, s]) => (
            <button key={k} type="button" className="lrow" style={rowBtn} aria-pressed={v && v.afterHours === k} onClick={() => { set('afterHours')(k); if (k === 'forward') set('forward')(true); setSheet(k === 'forward' && !(v && v.forwardTo) ? 'forward' : ''); }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={ROW_T}>{l}</span>
                <span style={ROW_S}>{s}</span>
              </span>
              {v && v.afterHours === k ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg> : null}
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet open={sheet === 'forward'} onClose={() => setSheet('')} title="Forward to"
        footer={<Button kind="primary" onClick={() => { if (!dialable(v.forwardTo)) { toast('Enter an 11-digit mobile number, for example 01712345678', { tone: 'error' }); return; } setSheet(''); }}>Done</Button>}>
        <TextInput value={v ? v.forwardTo : ''} onChange={set('forwardTo')} placeholder="01XXXXXXXXX" type="tel" inputMode="tel" autoFocus />
        <div className="help" style={{ marginTop: '8px' }}>Calls the team doesn’t answer ring on this number.</div>
      </Sheet>

      <Sheet open={sheet === 'hours'} onClose={() => setSheet('')} title="Opening hours"
        footer={<Button kind="soft" href="/ai-behaviour">Change on the web</Button>}>
        <Note tone="info" icon="clock">{hours ? `${daysText(hours.days)} · ${hm(hours.from)}–${hm(hours.to)}` : ''}. The shop’s hours are set once on the web (Grid AI › Behaviour) and used by calls, chats and GridAI.</Note>
      </Sheet>
    </AppScreen>
  );
}
