'use client';
// RoleGuard — when a page is not part of this site's edition (src/lib/edition.js), its module is not in the shop's plan
// (src/lib/plans.js: a locked page is never shown working), or none of the signed-in demo user's roles include it
// (src/lib/team.js › canOpen), the page is covered with a short note and a way back.
// Mounted by the shared Sidebar on every page.
// ?as=<user id> on any page signs in as that demo user first.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { navigate } from '@/runtime/routes';
import { currentUser, roleOf, canOpen, signInAs, userBy, homeOf, managesBilling, SESSION_EVENT } from '@/lib/team';
import { entitled, plansWith, currentPlan, upgradeHref, PLANS, PLAN_EVENT } from '@/lib/plans';
import { routeInEdition, moduleOfRoute, editionsWith, currentEdition, previewEdition, LOCKED, MODULES, EDITIONS, EDITION_EVENT } from '@/lib/edition';

export function RoleGuard() {
  const [state, setState] = useState(null);
  useEffect(() => {
    const check = () => {
      const path = window.location.pathname;
      if (!routeInEdition(path)) { setState({ edition: true, module: moduleOfRoute(path) }); return; }
      // fail closed: a page of a module the plan lacks never opens
      const mod = moduleOfRoute(path);
      if (mod && !entitled(mod)) { setState({ plan: true, module: mod, admin: managesBilling(currentUser()) }); return; }
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
    window.addEventListener(PLAN_EVENT, check);
    return () => { window.removeEventListener('gc:route', check); window.removeEventListener(SESSION_EVENT, check); window.removeEventListener('popstate', check); window.removeEventListener(EDITION_EVENT, check); window.removeEventListener(PLAN_EVENT, check); };
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
  if (state.plan) {
    const mod = MODULES[state.module];
    const plan = currentPlan();
    const where = plansWith(state.module).map((p) => PLANS[p].name);
    return (
      <div className="gc-modal__backdrop" style={{ zIndex: 150 }}>
        <div className="gc-modal" role="alertdialog" aria-modal="true" aria-labelledby="rg-title" style={{ maxWidth: 460, textAlign: 'center' }}>
          <span style={{ display: 'inline-grid', placeItems: 'center', width: 52, height: 52, borderRadius: 'var(--radius-full)', background: 'var(--fill-primary-soft)', color: 'var(--primary)', marginBottom: 'var(--space-3)' }}><Icon name="lock" width="24" height="24" aria-hidden="true" /></span>
          <h2 id="rg-title" className="gc-modal__title">Upgrade to use {mod ? mod.label : 'this page'}</h2>
          <p className="gc-modal__text">
            Your plan is <b>{plan.name}</b>.{where.length ? <> {mod ? mod.label : 'This page'} comes with {where.join(' and ')}.</> : null}
            {state.admin ? null : <> Ask the owner to upgrade.</>}
          </p>
          <div className="gc-modal__foot" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="gc-btn gc-btn--neutral" onClick={() => navigate(homeOf(currentUser()))}>Go back</button>
            {state.admin ? <button type="button" className="gc-btn gc-btn--solid" onClick={() => navigate(upgradeHref(state.module))} data-autofocus>See plans</button> : null}
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
          <button type="button" className="gc-btn gc-btn--solid" onClick={() => navigate(homeOf(state))} data-autofocus>{homeOf(state) === '/my-dashboard' ? 'My dashboard' : 'Start page'}</button>
        </div>
      </div>
    </div>
  );
}
