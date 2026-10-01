'use client';
// RoleGuard — when a page is not part of this site's edition (src/lib/edition.js), or the signed-in demo user's role
// does not include it (src/lib/team.js › canOpen), the page is covered with a short note and a way back.
// Mounted by the shared Sidebar on every page.
// ?as=<user id> on any page signs in as that demo user first.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { navigate } from '@/runtime/routes';
import { currentUser, roleOf, canOpen, signInAs, userBy, SESSION_EVENT } from '@/lib/team';
import { routeInEdition, moduleOfRoute, editionsWith, currentEdition, previewEdition, LOCKED, MODULES, EDITIONS, EDITION_EVENT } from '@/lib/edition';

export function RoleGuard() {
  const [state, setState] = useState(null);
  useEffect(() => {
    const check = () => {
      const path = window.location.pathname;
      if (!routeInEdition(path)) { setState({ edition: true, module: moduleOfRoute(path) }); return; }
      const u = currentUser(); setState(canOpen(u, path) ? null : u);
    };
    // ?as=<user id> signs in as that demo user (links to a person's dashboard)
    const as = new URLSearchParams(window.location.search).get('as');
    if (as && userBy(as) && currentUser().id !== as) signInAs(as);
    check();
    window.addEventListener('gc:route', check);
    window.addEventListener(SESSION_EVENT, check);
    window.addEventListener('popstate', check);
    window.addEventListener(EDITION_EVENT, check);
    return () => { window.removeEventListener('gc:route', check); window.removeEventListener(SESSION_EVENT, check); window.removeEventListener('popstate', check); window.removeEventListener(EDITION_EVENT, check); };
  }, []);
  if (!state) return null;
  if (state.edition) {
    const ed = currentEdition();
    const mod = state.module ? MODULES[state.module] : null;
    const where = state.module ? editionsWith(state.module).map((e) => EDITIONS[e].short) : [];
    return (
      <div className="gc-modal__backdrop" style={{ zIndex: 150 }}>
        <div className="gc-modal" role="alertdialog" aria-modal="true" aria-labelledby="rg-title" style={{ maxWidth: 460, textAlign: 'center' }}>
          <span style={{ display: 'inline-grid', placeItems: 'center', width: 52, height: 52, borderRadius: 'var(--radius-full)', background: 'var(--fill-primary-soft)', color: 'var(--primary)', marginBottom: 'var(--space-3)' }}><Icon name="package-plus" width="24" height="24" aria-hidden="true" /></span>
          <h2 id="rg-title" className="gc-modal__title">Not in {ed.short}</h2>
          <p className="gc-modal__text">
            {mod ? <>This page is part of <b>{mod.label}</b>{where.length ? <>, which comes with {where.join(', ')}</> : null}. </> : null}
            Your shop uses <b>{ed.name}</b>.
          </p>
          <div className="gc-modal__foot" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            {!LOCKED ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => previewEdition('full')}>Show all modules</button> : null}
            <button type="button" className="gc-btn gc-btn--solid" onClick={() => navigate('/merchant-overview')} data-autofocus>Go to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }
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
