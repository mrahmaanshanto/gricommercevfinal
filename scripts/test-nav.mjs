// Navigation tests (brief #21): node scripts/test-nav.mjs
// Resolves the side menu (src/lib/team.js › navFor) for every edition × role × plan — plus the people who hold two
// roles and the "Set up" states — and checks what the menu promises:
//   - every item shown has a route, and the route has a page (src/app/**/<route>/page.jsx);
//   - no empty areas, no empty groups, no duplicate ids;
//   - a module the plan lacks is never a working page: locked (with "Upgrade") for people who manage billing, hidden
//     for everyone else; a locked area never also shows open pages;
//   - several roles = the union of those roles, without duplicates;
//   - "Set up" badges only on areas the person can see, for modules the edition uses and the plan pays for;
//   - pins and the start page only ever point at pages the person can open;
//   - the menu data itself: NAV_ALIAS targets resolve, every role's ids and every module's ids exist, every page id
//     belongs to exactly one module.
// Exits 1 on the first run with failures (all failures are listed). No test runner needed.

import { registerHooks } from 'node:module';
import { existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');

// The app's modules import without file extensions and with the @/ alias (Next resolves those); do the same here.
registerHooks({
  resolve(specifier, context, next) {
    let spec = specifier.startsWith('@/') ? pathToFileURL(join(SRC, specifier.slice(2))).href : specifier;
    try { return next(spec, context); } catch (e) {
      if (/^(\.|\/|file:)/.test(spec) && !/\.[mc]?jsx?$/.test(spec)) return next(spec + '.js', context);
      throw e;
    }
  },
  load(url, context, next) {
    // the app's .js files are ES modules (package.json has no "type")
    if (url.startsWith(pathToFileURL(SRC).href) && url.endsWith('.js')) return { ...next(url, { ...context, format: 'module' }), format: 'module' };
    return next(url, context);
  },
});

const { NAV, NAV_ALIAS } = await import(pathToFileURL(join(SRC, 'shell/navigation.js')).href);
const { MODULES, EDITIONS, EDITION_IDS, moduleOfNav } = await import(pathToFileURL(join(SRC, 'lib/edition.js')).href);
const { PLANS, PLAN_IDS, entitled } = await import(pathToFileURL(join(SRC, 'lib/plans.js')).href);
const team = await import(pathToFileURL(join(SRC, 'lib/team.js')).href);
const { USERS, ROLES, navFor, canSee, managesBilling, rolesOf, pinsFor, landingChoices } = team;
const { routeOf } = await import(pathToFileURL(join(SRC, 'runtime/routes.js')).href);

// ---- every route the app serves (src/app/<group>/<route>/page.jsx) ------------------------------------------
const ROUTES = new Set();
(function walk(dir, parts) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) walk(join(dir, e.name), /^\(.*\)$/.test(e.name) ? parts : [...parts, e.name]);
    else if (/^page\.(jsx?|tsx?)$/.test(e.name)) ROUTES.add('/' + parts.join('/'));
  }
})(join(SRC, 'app'), []);
const hasRoute = (href) => ROUTES.has(href.split('?')[0].replace(/\/$/, '') || '/');

const fails = [];
const fail = (where, msg) => fails.push(`${where}: ${msg}`);
let checked = 0;

// ---- the menu data ------------------------------------------------------------------------------------------
const ALL = NAV.flatMap((g) => g.items.flatMap((it) => [it, ...(it.children || [])]));
const IDS = new Set(ALL.map((x) => x.id));
const seen = new Set();
ALL.forEach((x) => { if (seen.has(x.id)) fail('navigation.js', `duplicate id ${x.id}`); seen.add(x.id); });
const resolveAlias = (id) => { let k = id, n = 0; while (NAV_ALIAS[k] && !IDS.has(k) && n++ < 10) k = NAV_ALIAS[k]; return k; };
for (const [from, to] of Object.entries(NAV_ALIAS)) {
  if (!IDS.has(resolveAlias(to))) fail('NAV_ALIAS', `${from} → ${to} does not resolve to a menu item`);
  if (IDS.has(from)) fail('NAV_ALIAS', `${from} is both a menu id and an alias`);
}
const known = (id) => IDS.has(id) || IDS.has(resolveAlias(id));
for (const [k, r] of Object.entries(ROLES)) if (r.access !== '*') r.access.forEach((id) => { if (!known(id)) fail(`role ${k}`, `unknown menu id ${id}`); });
for (const [k, m] of Object.entries(MODULES)) m.nav.forEach((id) => { if (!known(id)) fail(`module ${k}`, `unknown menu id ${id}`); });
ALL.filter((x) => !x.children).forEach((x) => {
  const owners = Object.keys(MODULES).filter((k) => MODULES[k].nav.includes(x.id));
  if (owners.length !== 1) fail('MODULES', `${x.id} belongs to ${owners.length ? owners.join(', ') : 'no module'} (must be exactly one)`);
  if (!x.to) fail('navigation.js', `${x.id} has no page`);
  else if (!hasRoute(routeOf(x.to))) fail('navigation.js', `${x.id} → ${routeOf(x.to)} has no page.jsx`);
});
USERS.forEach((u) => rolesOf(u).length !== (u.roles || []).length && fail(`user ${u.id}`, 'unknown role'));
// a locked page opens Upgrade (lib/plans.js › upgradeHref)
const { upgradeHref } = await import(pathToFileURL(join(SRC, 'lib/plans.js')).href);
if (!hasRoute(upgradeHref('hr'))) fail('plans', `${upgradeHref('hr')} has no page`);

// ---- resolve the menu for every edition × person × plan ------------------------------------------------------
// one person per role, the people with two roles, and the "Set up" checks all pending (lib/navSetup.js shape)
const SETUP = [
  { id: 'courier', module: 'online', area: 'area-orders', fix: 'connections', label: 'Set up', href: '/connections?group=delivery' },
  { id: 'counter', module: 'pos', area: 'area-pos', fix: 'pos-counters', label: 'Set up', href: '/pos-manage' },
  { id: 'payment', module: 'commerce', area: 'area-payments', fix: 'pay-setup', label: 'Set up', href: '/set-payments' },
];
const people = [...Object.keys(ROLES).map((r) => ({ id: 't-' + r, name: r, role: r, roles: [r] })), ...USERS.filter((u) => u.roles.length > 1)];

function checkMenu(where, u, ed, plan, nav, setup) {
  checked += 1;
  const ids = new Set();
  const mods = EDITIONS[ed].modules;
  nav.forEach((g) => {
    if (!g.items.length) fail(where, `empty group ${g.label}`);
    g.items.forEach((it) => {
      if (ids.has(it.id)) fail(where, `duplicate ${it.id}`); ids.add(it.id);
      const kids = it.children || [];
      const listed = kids.filter((c) => !c.hidden);
      if (!listed.length && !it.to) fail(where, `empty area ${it.id}`);
      kids.forEach((c) => {
        if (ids.has(c.id)) fail(where, `duplicate ${c.id}`); ids.add(c.id);
        if (!c.to || !hasRoute(routeOf(c.to))) fail(where, `${c.id} has no route`);
        if (!canSee(u, c.id)) fail(where, `${c.id} shown to a role that cannot see it`);
        const m = moduleOfNav(c.id);
        if (ed !== 'full' && m && !mods.includes(m)) fail(where, `${c.id} is outside the edition (${m})`);
        if (m && !entitled(m, plan) && !c.locked && !c.hidden) fail(where, `${c.id} works without the plan paying for ${m}`);
        if (c.locked && entitled(c.locked, plan)) fail(where, `${c.id} locked although the plan has ${c.locked}`);
        if (c.locked && !managesBilling(u)) fail(where, `${c.id} locked page shown to someone who does not manage billing`);
      });
      if (it.locked && listed.some((c) => !c.locked)) fail(where, `area ${it.id} locked but has open pages`);
      if (it.setup) {
        if (!mods.includes(it.setup.module) || !entitled(it.setup.module, plan)) fail(where, `"Set up" on ${it.id} for a module not in use`);
        if (!canSee(u, it.setup.fix)) fail(where, `"Set up" on ${it.id} for someone who cannot open ${it.setup.fix}`);
        if (!hasRoute(it.setup.href)) fail(where, `"Set up" link ${it.setup.href} has no page`);
      }
    });
  });
  // the shortcuts only point at pages the person can open
  const open = new Set(nav.flatMap((g) => g.items.flatMap((it) => (it.children || []).filter((c) => !c.hidden && !c.locked).map((c) => c.id))));
  pinsFor(u, nav).forEach((p) => { if (!open.has(p.id)) fail(where, `pin ${p.id} not open`); });
  landingChoices(u, nav).forEach((a) => a.items.forEach((x) => { if (!hasRoute(x.href)) fail(where, `start page ${x.href} has no page`); }));
  // several roles: the union of each role's own menu
  if (rolesOf(u).length > 1) {
    const one = new Set(rolesOf(u).flatMap((r) => navFor({ id: 'x', role: r, roles: [r] }, { ed, plan, setup }).flatMap((g) => g.items.flatMap((it) => [it.id, ...(it.children || []).map((c) => c.id)]))));
    const both = new Set([...ids]);
    [...one].forEach((id) => { if (!both.has(id)) fail(where, `union misses ${id}`); });
    [...both].forEach((id) => { if (!one.has(id)) fail(where, `union adds ${id} that no role has`); });
  }
  void setup;
}

for (const ed of EDITION_IDS) {
  for (const plan of PLAN_IDS) {
    for (const u of people) {
      for (const setup of [[], SETUP]) {
        const where = `${ed} · ${plan} · ${rolesOf(u).join('+')}${setup.length ? ' · setup pending' : ''}`;
        let nav;
        try { nav = navFor(u, { ed, plan, setup }); } catch (e) { fail(where, 'navFor threw ' + e.message); continue; }
        checkMenu(where, u, ed, plan, nav, setup);
      }
    }
  }
}

// the owner on the smallest plan sees what is locked; a seller never does
const owner = USERS.find((u) => u.role === 'ceo');
const locked = navFor(owner, { ed: 'full', plan: 'starter' }).flatMap((g) => g.items.filter((it) => it.locked || (it.children || []).some((c) => c.locked)));
if (!locked.length) fail('plans', 'the owner on Starter sees no locked module');
const seller = USERS.find((u) => u.role === 'seller');
if (navFor(seller, { ed: 'full', plan: 'starter' }).some((g) => g.items.some((it) => it.locked || (it.children || []).some((c) => c.locked)))) fail('plans', 'a seller sees locked modules');
if (!navFor(owner, { ed: 'full', plan: 'business', setup: SETUP }).some((g) => g.items.some((it) => it.setup))) fail('setup', 'the owner sees no "Set up" badge with setup pending');
void PLANS;

if (fails.length) {
  console.log(`test-nav: ${fails.length} failure${fails.length === 1 ? '' : 's'} in ${checked} menus`);
  [...new Set(fails)].slice(0, 200).forEach((f) => console.log('  FAIL ' + f));
  process.exit(1);
}
console.log(`test-nav: ok · ${checked} menus (${EDITION_IDS.length} editions × ${PLAN_IDS.length} plans × ${people.length} people × 2 setup states) · ${ROUTES.size} routes`);
