'use client';
// RoleGuard — when the signed-in demo user opens a menu page their role does not include, the page is covered
// with a short note and a way back (src/lib/team.js › canOpen). Mounted by the shared Sidebar on every page.
// ?as=<user id> on any page signs in as that demo user first.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { navigate } from '@/runtime/routes';
import { currentUser, roleOf, canOpen, signInAs, userBy, SESSION_EVENT } from '@/lib/team';

export function RoleGuard() {
  const [state, setState] = useState(null);
  useEffect(() => {
    const check = () => { const u = currentUser(); setState(canOpen(u, window.location.pathname) ? null : u); };
    // ?as=<user id> signs in as that demo user (links to a person's dashboard)
    const as = new URLSearchParams(window.location.search).get('as');
    if (as && userBy(as) && currentUser().id !== as) signInAs(as);
    check();
    window.addEventListener('gc:route', check);
    window.addEventListener(SESSION_EVENT, check);
    window.addEventListener('popstate', check);
    return () => { window.removeEventListener('gc:route', check); window.removeEventListener(SESSION_EVENT, check); window.removeEventListener('popstate', check); };
  }, []);
  if (!state) return null;
  const r = roleOf(state);
  return (
    <div className="gc-modal__backdrop" style={{ zIndex: 150 }}>
      <div className="gc-modal" role="alertdialog" aria-modal="true" aria-labelledby="rg-title" style={{ maxWidth: 440, textAlign: 'center' }}>
        <span style={{ display: 'inline-grid', placeItems: 'center', width: 52, height: 52, borderRadius: 'var(--radius-full)', background: 'var(--fill-warning-soft)', color: 'var(--text-warning)', marginBottom: 'var(--space-3)' }}><Icon name="lock" width="24" height="24" aria-hidden="true" /></span>
        <h2 id="rg-title" className="gc-modal__title">Not part of your job</h2>
        <p className="gc-modal__text">{state.name} is signed in as <b>{r.title}</b>. This page belongs to another role. Ask the owner if you need it.</p>
        <div className="gc-modal__foot" style={{ justifyContent: 'center' }}>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => navigate('/merchant-sign-in')}>Switch account</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={() => navigate('/my-dashboard')} data-autofocus>My dashboard</button>
        </div>
      </div>
    </div>
  );
}
