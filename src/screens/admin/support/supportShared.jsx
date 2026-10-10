'use client';
// Support (super admin) — the parts the Tickets list, the ticket page and Performance share: the CSS, time text, the
// SLA badge, a person's initials, a form field and the conversation. The conversation copies the look of the merchant
// Inbox (components/inbox/Thread.jsx › MessageList: grouped bubbles, the time between groups, internal notes on a
// dashed yellow card, system lines in the middle) without importing it, because Thread reads the merchant's libs.

import React from 'react';
import { Icon } from '@/runtime/dc';
import { StatusBadge } from '@/components/ui';
import { dm, dmy, hm, daysBetween, yearOf, initials } from '@/lib/platform/util';
import { staffColor } from '@/lib/platform/catalogue';
import { slaOf, STATUS_TONE, PRIORITY_TONE } from '@/lib/admin/support';

/** "Today 10:02" · "Yesterday 18:40" · "Mon 09:12" · "02 Sep" · "02 Sep 2025" */
export function when(ms, t) {
  if (!ms) return '—';
  const n = daysBetween(ms, t);
  if (n <= 0) return 'Today ' + hm(ms);
  if (n === 1) return 'Yesterday ' + hm(ms);
  if (n < 7) return n + ' days ago';
  return yearOf(ms) === yearOf(t) ? dm(ms) : dmy(ms);
}
/** A day label for the conversation's separators. */
function dayLabel(ms, t) {
  const n = daysBetween(ms, t);
  if (n <= 0) return 'Today';
  if (n === 1) return 'Yesterday';
  return yearOf(ms) === yearOf(t) ? dm(ms) : dmy(ms);
}
export const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');
export const StatusTag = ({ s }) => <StatusBadge tone={STATUS_TONE[s] || 'neutral'}>{s}</StatusBadge>;
export const PriorityTag = ({ p }) => <StatusBadge tone={PRIORITY_TONE[p] || 'neutral'}>{p}</StatusBadge>;

/** The SLA as a badge (breached / paused / met) or quiet text with the time left. */
export function SlaTag({ tk, t }) {
  const s = slaOf(tk, t);
  if (s.stage === 'done') return <span className={s.breached ? 'sp-sla is-miss' : 'sp-sla is-met'}>{s.breached ? 'Missed' : 'Met'}</span>;
  if (s.breached) return <StatusBadge tone="error" icon="clock-alert">{s.text}</StatusBadge>;
  if (s.paused) return <span className="sp-sla">Paused</span>;
  return <span className={'sp-sla' + (s.tone === 'warning' ? ' is-soon' : '')}>{s.text}</span>;
}

/** A person's initials in a small circle, in their staff colour (merchants get the neutral one). */
export function Who({ name, size = 24, merchant }) {
  if (!name) return <span className="sp-av sp-av--none" style={{ width: size, height: size }} aria-hidden="true"><Icon name="user-round" width="14" height="14" /></span>;
  return <span className={'sp-av' + (merchant ? ' sp-av--m' : '')} style={{ width: size, height: size, background: merchant ? undefined : staffColor(name) }} aria-hidden="true">{initials(name)}</span>;
}

/** A label, the control, and its error (or a hint) under it. */
export function Field({ id, label, error, hint, children }) {
  return (
    <div className="gc-field">
      <label className="gc-label" htmlFor={id}>{label}</label>
      {children}
      {error ? <p className="gc-help gc-help--error" id={id + '-err'} role="alert">{error}</p> : hint ? <p className="gc-help">{hint}</p> : null}
    </div>
  );
}
export const ctl = (error, select) => ({ className: 'gc-input' + (select ? ' gc-select' : '') + (error ? ' gc-input--error' : ''), 'aria-invalid': error ? true : undefined });

const GAP = 5 * 60 * 1000;
const joins = (a, b) => a && b && a.from === b.from && a.by === b.by && (a.from === 'merchant' || a.from === 'agent') && b.at - a.at <= GAP;

/** The ticket's conversation: merchant on the left, GridCommerce on the right, notes and system lines between. */
export function Conversation({ tk, t, me }) {
  const msgs = tk.messages;
  return (
    <div className="sp-thread" role="log" aria-label={'Conversation on ' + tk.id}>
      {msgs.map((m, i) => {
        const prev = msgs[i - 1], next = msgs[i + 1];
        const newDay = !prev || daysBetween(prev.at, m.at) !== 0;
        const gap = !newDay && prev && m.at - prev.at > GAP;
        const sep = newDay ? <div className="sp-time" role="separator"><span>{dayLabel(m.at, t)} · {hm(m.at)}</span></div>
          : gap ? <div className="sp-time" role="separator"><span>{hm(m.at)}</span></div> : null;
        const files = m.files && m.files.length ? (
          <span className="sp-files">{m.files.map((f) => <span key={f} className="sp-file"><Icon name="paperclip" width="12" height="12" aria-hidden="true" />{f}</span>)}</span>
        ) : null;
        if (m.from === 'system') {
          return <React.Fragment key={m.id}>{sep}<div className="sp-sys"><Icon name={m.icon || 'info'} width="14" height="14" aria-hidden="true" /><span>{m.text}</span><span className="sp-sys__time">{hm(m.at)}</span></div></React.Fragment>;
        }
        if (m.from === 'note') {
          return (
            <React.Fragment key={m.id}>{sep}
              <div className="sp-note">
                <p className="sp-note__label"><Icon name="lock" width="12" height="12" aria-hidden="true" />Internal note · only GridCommerce staff see this</p>
                {m.text ? <p className="sp-note__text">{m.text}</p> : null}
                {files}
                <p className="sp-meta">{m.by} · {hm(m.at)}</p>
              </div>
            </React.Fragment>
          );
        }
        const out = m.from === 'agent';
        const first = newDay || gap || !joins(prev, m);
        const last = !joins(m, next);
        const pos = first && last ? 'g-single' : first ? 'g-first' : last ? 'g-last' : 'g-mid';
        return (
          <React.Fragment key={m.id}>{sep}
            <div className={'sp-row sp-row--' + (out ? 'out' : 'in') + ' ' + pos}>
              {last ? <Who name={m.by} size={28} merchant={!out} /> : <span className="sp-spacer" aria-hidden="true" />}
              <div className="sp-col">
                {first ? <span className="sp-who">{out ? (m.by === me ? 'You' : m.by) : m.by}</span> : null}
                {m.text ? <p className="sp-bubble" title={hm(m.at)}>{m.text}</p> : null}
                {files}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export const SUPPORT_CSS = `
.sp-skel{height:420px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:sp-sk 1.4s ease infinite}
.sp-skel--head{height:56px}
@keyframes sp-sk{from{background-position:100% 0}to{background-position:-100% 0}}
.sp-err{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);padding:var(--space-8) var(--space-4);text-align:center;font-size:var(--text-sm)}
.sp-id{font-family:var(--font-data);font-variant-numeric:tabular-nums;color:var(--text-heading)}
.sp-data{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.sp-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums;font-weight:var(--weight-semibold);color:var(--text-heading)}
.sp-muted{color:var(--text-muted)}
.sp-sla{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.sp-sla.is-soon{color:var(--text-warning);font-weight:var(--weight-medium)}
.sp-sla.is-met{color:var(--text-success)}
.sp-sla.is-miss{color:var(--text-danger)}
.sp-av{display:inline-grid;flex:none;place-items:center;border-radius:var(--radius-full);background:var(--primary);color:var(--text-inverse);font-size:var(--text-xs);font-weight:var(--weight-medium);line-height:1}
.sp-av--m{background:var(--fill-primary-soft);color:var(--primary)}
.sp-av--none{background:var(--surface-subtle);color:var(--text-muted)}
.sp-person{display:inline-flex;align-items:center;gap:var(--space-2);min-width:0;white-space:nowrap}
.sp-form{display:flex;flex-direction:column;gap:var(--space-3)}
.sp-form p{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.sp-form__two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.sp-form textarea.gc-input,.tv-compose textarea.gc-input{height:auto;min-height:96px;padding:var(--space-2) var(--space-3);resize:vertical;line-height:1.5}
.sp-formerr{margin:0;font-size:var(--text-sm);color:var(--text-danger)}
.sp-check{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-body)}
/* the conversation (the look of components/inbox/Thread.jsx) */
.sp-thread{display:flex;flex-direction:column;gap:2px;max-height:560px;overflow-y:auto;overflow-x:hidden;padding:var(--space-3) var(--space-4);background:var(--surface-page)}
.sp-time{align-self:center;margin:var(--space-3) 0 var(--space-1);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.sp-time:first-child{margin-top:0}
.sp-sys{align-self:center;display:inline-flex;align-items:center;gap:6px;max-width:92%;margin:var(--space-2) 0 var(--space-1);padding:4px var(--space-3);border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body);text-align:center}
.sp-sys svg{flex:none;color:var(--text-muted)}
.sp-sys__time{flex:none;color:var(--text-muted)}
.sp-note{align-self:flex-end;max-width:min(80%,560px);margin:var(--space-2) 0;padding:var(--space-2) var(--space-3);border:1px dashed color-mix(in srgb,var(--warning) 60%,transparent);border-radius:var(--radius-xl);background:var(--fill-warning-soft)}
.sp-note__label{display:flex;align-items:center;gap:4px;margin:0 0 4px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-warning)}
.sp-note__text{margin:0 0 4px;font-size:var(--text-sm);color:var(--text-heading);white-space:pre-wrap;overflow-wrap:anywhere}
.sp-meta{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.sp-row{display:flex;align-items:flex-end;gap:var(--space-2);max-width:min(78%,560px)}
.sp-row.g-first,.sp-row.g-single{margin-top:var(--space-2)}
.sp-row--out{align-self:flex-end;flex-direction:row-reverse}
.sp-spacer{flex:none;width:28px}
.sp-col{min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:2px}
.sp-row--out .sp-col{align-items:flex-end}
.sp-who{margin:0 var(--space-3) 2px;font-size:var(--text-xs);color:var(--text-muted)}
.sp-bubble{margin:0;padding:var(--space-2) var(--space-3);border-radius:var(--radius-2xl);font-size:var(--text-sm);white-space:pre-wrap;overflow-wrap:anywhere}
.sp-row--in .sp-bubble{background:var(--surface-card);color:var(--text-heading);box-shadow:var(--shadow-xs)}
.sp-row--out .sp-bubble{background:var(--primary);color:var(--text-inverse)}
.sp-row--in.g-first .sp-bubble{border-bottom-left-radius:var(--radius-sm)}
.sp-row--in.g-mid .sp-bubble{border-top-left-radius:var(--radius-sm);border-bottom-left-radius:var(--radius-sm)}
.sp-row--in.g-last .sp-bubble{border-top-left-radius:var(--radius-sm)}
.sp-row--out.g-first .sp-bubble{border-bottom-right-radius:var(--radius-sm)}
.sp-row--out.g-mid .sp-bubble{border-top-right-radius:var(--radius-sm);border-bottom-right-radius:var(--radius-sm)}
.sp-row--out.g-last .sp-bubble{border-top-right-radius:var(--radius-sm)}
.sp-files{display:flex;flex-wrap:wrap;gap:4px;margin-top:2px}
.sp-file{display:inline-flex;align-items:center;gap:4px;max-width:220px;height:24px;padding:0 var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font-size:var(--text-xs);color:var(--text-body);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sp-file button{display:grid;place-items:center;width:18px;height:18px;margin-right:-4px;padding:0;border:0;border-radius:var(--radius-full);background:none;color:var(--text-muted);cursor:pointer}
.sp-file button:hover{background:var(--surface-subtle);color:var(--text-heading)}
@media (max-width:640px){
  .sp-thread{max-height:none;padding:var(--space-3)}
  .sp-row{max-width:92%}
  .sp-note{max-width:96%}
  .sp-form__two{grid-template-columns:minmax(0,1fr)}
}
@media (prefers-reduced-motion:reduce){.sp-skel{animation:none}}
`;
