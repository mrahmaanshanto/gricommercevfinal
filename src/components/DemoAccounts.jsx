'use client';
// DemoAccounts — Settings › Profile type: switch to any of the 13 staff profiles (owner / CEO, HR, warehouse, shop …;
// no password in the demo) and land on that person's dashboard with their own menu (src/lib/team.js).

import React from 'react';
import { Icon } from '@/runtime/dc';
import { navigate } from '@/runtime/routes';
import { USERS, ROLES, signInAs, currentUser, hasWorkInEdition } from '@/lib/team';

const CSS = `
.da{margin-top:28px;padding-top:20px;border-top:1px solid #e2e8f0}
.da--plain{margin:0;padding:0;border:0}
.da h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:#0f172a}
.da p{margin:4px 0 12px;font-size:var(--text-xs);color:var(--text-muted)}
.da__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px}
.da__btn{display:flex;align-items:center;gap:10px;min-height:52px;padding:8px 10px;border:1px solid #e2e8f0;border-radius:var(--radius-lg);background:#fff;font:inherit;text-align:left;cursor:pointer}
.da__btn:hover{border-color:#003087;background:#f5f8fd}
.da__btn:focus-visible{outline:3px solid rgba(0,48,135,.4);outline-offset:2px}
.da__btn[aria-current="true"]{border-color:#003087}
.da__ic{display:grid;place-items:center;width:32px;height:32px;flex:none;border-radius:var(--radius-full);background:#eef3fb;color:#003087}
.da__btn b{display:block;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:#0f172a;line-height:1.3}
.da__btn small{display:block;font-size:var(--text-xs);color:var(--text-muted);line-height:1.3}
`;

export function DemoAccounts({ title = 'Profile type', sub = 'Switch to a team member’s profile to see their dashboard, tasks and menu.', plain = false }) {
  const [me, setMe] = React.useState('');
  // only the roles that have work in this site's edition (the list is worked out after mount, so a preview
  // picked on the full site never changes the server HTML)
  const [list, setList] = React.useState(USERS);
  React.useEffect(() => { setMe(currentUser().id); setList(USERS.filter(hasWorkInEdition)); }, []);
  const go = (id) => { signInAs(id); navigate('/my-dashboard'); };
  return (
    <section className={'da' + (plain ? ' da--plain' : '')} aria-labelledby="da-title">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <h2 id="da-title">{title}</h2>
      {sub ? <p>{sub}</p> : null}
      <div className="da__grid">
        {list.map((u) => (
          <button key={u.id} type="button" className="da__btn" aria-current={me === u.id} onClick={() => go(u.id)}>
            <span className="da__ic"><Icon name={ROLES[u.role].icon} width="16" height="16" aria-hidden="true" /></span>
            <span style={{ minWidth: 0 }}><b>{ROLES[u.role].title}</b><small>{u.name}</small></span>
          </button>
        ))}
      </div>
    </section>
  );
}
