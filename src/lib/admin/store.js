// admin/store — one small browser store per super admin module (leads, tickets, staff, website …), kept apart from the
// platform's store (lib/platform/store.js) and from every merchant lib. Front end only: localStorage `gc.admin.<key>`.
//
//   export const crm = createStore({ key: 'crm', version: 1, seed: (now) => ({ leads: [...] }) });
//   crm.get()            the data (before load: the demo built at the design moment REF, so server and first render agree)
//   crm.commit(fn)       change it: fn(data, now) runs, it is saved, every page using it redraws; returns fn's result
//   const { data, t, live } = useAdminStore(crm)     in a component: loads after mount, redraws on change and every 20 s
//   resetAdminStores()   restart every module's demo (the account menu's "Restart demo data", or ?reset=1 on any page)
// Bump `version` when a module's seed changes shape: saved data from an older version is replaced.
// Dates: seed(now) builds the demo around `now`; anything that depends on today is worked out after `live` is true.

import { useEffect, useReducer, useState } from 'react';
import { REF, clockNow } from '@/lib/platform/store';

const isBrowser = typeof window !== 'undefined';
const STORES = new Map();

export function createStore({ key, version = 1, seed }) {
  if (STORES.has(key)) return STORES.get(key);
  const KEY = 'gc.admin.' + key;
  let live = null;
  let snap = null;
  const subs = new Set();
  const emit = () => { subs.forEach((f) => { try { f(); } catch { /* a page that went away */ } }); };
  const save = () => { try { window.localStorage.setItem(KEY, JSON.stringify(live)); } catch { /* storage full or blocked: keep it in memory */ } };
  const store = {
    key,
    get() {
      if (live) return live;
      if (!snap) snap = { ...seed(REF), v: version };
      return snap;
    },
    isLive: () => !!live,
    now: () => (live ? clockNow() : REF),
    load() {
      if (live || !isBrowser) return;
      let data = null;
      let reset = false;
      try { reset = new URLSearchParams(window.location.search).get('reset') === '1'; } catch { reset = false; }
      try { const raw = reset ? null : window.localStorage.getItem(KEY); if (raw) data = JSON.parse(raw); } catch { data = null; }
      if (!data || data.v !== version) data = { ...seed(clockNow()), v: version };
      live = data;
      save();
    },
    commit(fn) {
      store.load();
      const out = fn(live, clockNow());
      save();
      emit();
      return out;
    },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
    reset() {
      if (!isBrowser) return;
      try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
      live = null;
      store.load();
      emit();
    },
  };
  if (isBrowser) {
    window.addEventListener('storage', (e) => { if (e.key === KEY) { live = null; store.load(); emit(); } });
  }
  STORES.set(key, store);
  return store;
}

/** Restart every module's demo data (also the modules not opened on this page). */
export function resetAdminStores() {
  if (!isBrowser) return;
  try {
    for (let i = window.localStorage.length - 1; i >= 0; i--) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith('gc.admin.') && k !== 'gc.admin.rail') window.localStorage.removeItem(k);
    }
  } catch { /* ignore */ }
  STORES.forEach((s) => s.reset());
}

/** Use a module store in a component: { data, t, live }. */
export function useAdminStore(store) {
  const [, force] = useReducer((x) => x + 1, 0);
  // live only after this component mounted, so the first browser render matches the server render
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    store.load();
    setMounted(true);
    force();
    const off = store.subscribe(force);
    const id = window.setInterval(force, 20000);
    return () => { off(); window.clearInterval(id); };
  }, [store]);
  const live = mounted && store.isLive();
  return { data: store.get(), t: store.now(), live };
}
