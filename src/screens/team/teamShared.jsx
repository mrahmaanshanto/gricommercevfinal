'use client';
// teamShared — what My dashboard, Tasks and Leads share: the page frame, the signed-in user, live task and lead
// lists (re-read on change), user avatars and small CSS.

import React, { useEffect, useState } from 'react';
import { Sidebar, Topbar } from '@/shell/Shell';
import { PageHeader } from '@/components/ui';
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
.tm-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-4) var(--space-5)}
.tm-head h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.tm-head p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.tm-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.tm-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.tm-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums;white-space:nowrap}
.tm-warn{color:var(--text-warning)}
.tm-out{color:var(--text-danger)}
.tm-in{color:var(--text-success)}
.tm-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-3) var(--space-5);border-bottom:1px solid var(--border-subtle)}
.tm-bar__g{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
@media (max-width:640px){.tm-bar{padding:var(--space-3)}.tm-bar__g:has(.gc-mf__btn){width:100%;flex-wrap:nowrap}.tm-bar__g:has(.gc-mf__btn)>button.gc-btn--flat{display:none}}
.tm-form{display:flex;flex-direction:column;gap:var(--space-4)}
.tm-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.tm-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
.tm-tile{display:grid;place-items:center;width:36px;height:36px;flex:none;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.tm-empty{margin:0;padding:var(--space-4) var(--space-5);font-size:var(--text-sm);color:var(--text-muted)}
@media (max-width:640px){.tm-two,.tm-three{grid-template-columns:1fr}}
`;

export function TeamPage({ screen, active, crumb, page, title, description, actions, children, css = '' }) {
  return (
    <div className="dc-screen ds" data-screen={screen}>
      <style dangerouslySetInnerHTML={{ __html: TEAM_CSS + css }} />
      <div className="gc-shell">
        <Sidebar sticky="" active={active} />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb={crumb} page={page} />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {title ? <PageHeader title={title} description={description} actions={actions} /> : null}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
