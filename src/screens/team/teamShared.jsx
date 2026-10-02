'use client';
// teamShared — what My dashboard, Tasks, Team chat and Leads share: the page frame (Shopify-style title row,
// components/ui/IndexKit.jsx), the signed-in user, live task and lead lists (re-read on change), user avatars and CSS.

import React, { useEffect, useState } from 'react';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Icon } from '@/runtime/dc';
import { ShopHeader, RecordHeader } from '@/components/ui/IndexKit';
import { USERS, currentUser, userBy, roleOf, SESSION_EVENT } from '@/lib/team';
import { getTasks, TASKS_EVENT } from '@/lib/tasks';
import { getLeads, LEADS_EVENT } from '@/lib/leads';

/** Re-render on these window events; returns a counter that changes with them (first change after mount). */
export function useTick(events) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const on = () => setN((x) => x + 1);
    on();
    events.forEach((e) => window.addEventListener(e, on));
    window.addEventListener('storage', on);
    return () => { events.forEach((e) => window.removeEventListener(e, on)); window.removeEventListener('storage', on); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return n;
}
/** The signed-in user (CEO on the server render, then this browser's). */
export function useMe() {
  const n = useTick([SESSION_EVENT]);
  return { me: n ? currentUser() : USERS[0], ready: n > 0 };
}
export function useTasks() { const n = useTick([TASKS_EVENT]); return { tasks: getTasks(), ready: n > 0 }; }
export function useLeads() { const n = useTick([LEADS_EVENT]); return { leads: getLeads(), ready: n > 0 }; }

const TONES = [['var(--fill-info-soft)', 'var(--text-info)'], ['var(--fill-primary-soft)', 'var(--primary)'], ['var(--fill-warning-soft)', 'var(--text-warning)'], ['var(--fill-success-soft)', 'var(--text-success)'], ['var(--fill-secondary-soft)', 'var(--secondary)'], ['var(--fill-error-soft)', 'var(--text-danger)']];
export function UserAvatar({ id, size = 32 }) {
  const u = userBy(id);
  const i = Math.max(0, USERS.findIndex((x) => x.id === id));
  const [bg, fg] = TONES[i % TONES.length];
  return <span className="tm-av" style={{ width: size, height: size, background: bg, color: fg }} title={u ? `${u.name} · ${roleOf(u).title}` : id} aria-hidden="true">{u ? u.initials : '?'}</span>;
}
export const userName = (id) => (userBy(id) || { name: id || '—' }).name;

export const TEAM_CSS = `
.tm-av{display:inline-grid;place-items:center;flex:none;border-radius:var(--radius-full);font-size:var(--text-2xs);font-weight:var(--weight-semibold)}
.tm-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-2);min-height:44px;padding:var(--space-3) var(--space-4)}
.tm-head h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.tm-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.tm-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.tm-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums;white-space:nowrap}
.tm-warn{color:var(--text-warning)}
.tm-out{color:var(--text-danger)}
.tm-in{color:var(--text-success)}
.tm-bar__g{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.tm-form{display:flex;flex-direction:column;gap:var(--space-4)}
.tm-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.tm-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
.tm-tile{display:grid;place-items:center;width:28px;height:28px;flex:none;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
@media (max-width:640px){.tm-two,.tm-three{grid-template-columns:1fr}}
`;

/**
 * The shell around a team page: menu, top bar and the Shopify-style title row.
 *   title + icon + secondary / more / primary → ShopHeader;  title + back / meta / badges → RecordHeader;
 *   actions (JSX) → the old free-form buttons. No title = the page draws its own h1. narrow = the 1040px column.
 */
export function TeamPage({ screen, active, crumb, page, title, description, about, actions, children, css = '', icon, secondary, more, primary, back, badges, meta, narrow }) {
  const info = about || description;
  let head = null;
  if (title && actions) {
    head = (
      <header className="ix-head">
        <h1 className="ix-head__title">{icon ? <Icon name={icon} width="18" height="18" aria-hidden="true" /> : null}<span>{title}</span></h1>
        {info ? <span className="gc-pagehead__about" hidden>{info}</span> : null}
        <div className="ix-head__actions">{actions}</div>
      </header>
    );
  } else if (title && (back || meta || badges)) {
    head = <RecordHeader back={back} title={title} badges={badges} meta={meta} about={info} secondary={secondary || []} more={more || []} primary={primary} />;
  } else if (title) {
    head = <ShopHeader icon={icon} title={title} about={info} secondary={secondary || []} more={more || []} primary={primary} />;
  }
  return (
    <div className="dc-screen ds" data-screen={screen}>
      <style dangerouslySetInnerHTML={{ __html: TEAM_CSS + css }} />
      <div className="gc-shell">
        <Sidebar sticky="" active={active} />
        <main className="gc-shell__main">
          <Topbar crumb={crumb} page={page} />
          <div className="gc-shell__content">
            <div className={'ix-page' + (narrow ? ' ix-page--narrow' : '')}>
              {head}
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
/** A row click that opens the record, unless the click was on a control inside the row. */
export const rowGo = (fn) => (e) => { if (e.target.closest('a,button,input,label,select,textarea')) return; fn(); };
