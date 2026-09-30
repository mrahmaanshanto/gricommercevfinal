'use client';
// Generated from design/templates/core-backend/CoreSteps.dc.html by scripts/convert-design.mjs.
// Build plan · step explorer
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

var STEPS = [{"n": 1, "nn": "01", "title": "Groundwork and the tenancy model", "short": "Groundwork", "sub": "Decide how merchants are separated, map every table, and lock down secrets before a line of tenant code is written.", "builds": ["Tenancy model document: isolation, cost, backup granularity and the path to move a large merchant onto its own database later", "Module registry: a stable key for every module (M01 to M28, S1 to S9, G1 to G6, F1 to F3, B1, B2) and the tables each one owns", "Table inventory sorted into merchant-owned, platform-owned and shared reference data", "Payment and courier credentials moved to encrypted, write-only storage; nothing rendered in readable form", "Development, staging and production environments with a test pipeline on every change"], "tables": ["modules", "module_tables", "secrets vault"], "modules": ["All 48", "S4", "M17", "M08"], "gate": "Registry and table map signed off; no credential readable anywhere in the admin", "depends": "Nothing", "unlocks": "Step 2", "ph": 1, "phname": "Isolate", "c": "#003087", "t": "#003087", "soft": "rgba(0,48,135,.08)", "ring": "rgba(0,48,135,.22)"}, {"n": 2, "nn": "02", "title": "Tenant context on every request", "short": "Tenant context", "sub": "One tenant key on every merchant-owned record, and one resolver that sets it for web, API, jobs, schedules and webhooks.", "builds": ["Tenants table and a tenant resolver: host to tenant for storefronts and custom domains, token to tenant for the API", "Tenant key added to every merchant-owned table across all existing modules, back-filled and indexed first in composite keys", "Automatic query scoping on every tenant model; every write stamped with the tenant", "Queued jobs carry their tenant, scheduled tasks run per tenant, webhook receivers resolve the tenant from the route, console commands require one", "Cache keys, search index and file paths prefixed per tenant", "Isolation test suite: two seeded merchants, every route and job tries to reach the other; runs on every change"], "tables": ["tenants", "tenant_id on all merchant tables", "isolation tests"], "modules": ["F1", "All 48"], "gate": "Isolation suite green: no path returns another merchant's orders, customers, products or files", "depends": "Step 1", "unlocks": "Steps 3 and 4", "ph": 1, "phname": "Isolate", "c": "#003087", "t": "#003087", "soft": "rgba(0,48,135,.08)", "ring": "rgba(0,48,135,.22)"}, {"n": 3, "nn": "03", "title": "Identity, roles and audit", "short": "Identity & audit", "sub": "Two sign-in worlds, tenant-scoped roles, and one audit trail that later feeds support and monitoring.", "builds": ["Separate sign-in for merchant users and for GridCommerce staff on the console", "Roles and permissions scoped to the tenant; ready-made roles seeded for every new store", "One append-only audit log: actor, tenant, action, record, before and after, device and time", "Two-factor sign-in for owners and console staff, session timeout, forced logout and login alerts", "Logged impersonation that needs merchant consent, used later by the console and the support desk", "Rate limits and bot protection on sign-in, checkout and public forms"], "tables": ["users", "memberships", "roles", "permissions", "platform_staff", "audit_logs", "impersonations"], "modules": ["S4", "M24", "S5", "S7"], "gate": "Every write in the merchant admin appears in the audit log with actor and tenant", "depends": "Step 2", "unlocks": "Steps 5 and 8", "ph": 1, "phname": "Isolate", "c": "#003087", "t": "#003087", "soft": "rgba(0,48,135,.08)", "ring": "rgba(0,48,135,.22)"}, {"n": 4, "nn": "04", "title": "Store provisioning and domains", "short": "Provisioning", "sub": "Signup on gridcommerce.com.bd produces a live, isolated store within minutes, with no human touch.", "builds": ["Provisioning as a retry-safe job chain: tenant, owner, default settings, default theme, storage, search index, free subdomain, billing account, segment and entitlements, hand-off to the setup wizard", "Free address at provisioning: storename.gridcommerce.com.bd", "Custom domains with a step-by-step DNS guide and .com.bd support", "Automatic certificate issue and renewal, forced HTTPS, www to non-www redirect", "Domain health view: DNS status, propagation and certificate expiry in plain language", "Per-tenant backup and restore, proven by a restore drill in an isolated environment"], "tables": ["tenant_domains", "provisioning_runs", "tenant_backups"], "modules": ["F1", "B2", "M11", "M12", "S8"], "gate": "Signup to live store runs end to end unattended; one merchant restored without touching any other", "depends": "Step 2", "unlocks": "Steps 6 and 7", "ph": 2, "phname": "Provision & package", "c": "#009cde", "t": "#00709f", "soft": "rgba(0,156,222,.10)", "ring": "rgba(0,156,222,.28)"}, {"n": 5, "nn": "05", "title": "Module switches and the entitlement engine", "short": "Entitlement", "sub": "One service decides what each merchant can see and use. No code ever reads a plan name.", "builds": ["The module registry becomes the feature catalogue, grouped into a core set and shared sets", "One entitlement service answers two questions: is this feature on, and how much of this limit is left", "Checked at the route, the API, the navigation and inside background jobs; the menu shows only held modules", "Limits metered and shown to the merchant: orders per month, products, staff seats, storage, courier connections, landing pages", "Overage path: warn, then block, then offer a top-up or upgrade; locked screens carry a one-click upgrade", "Per-merchant override on top of defaults, single-module trials with an end date, data kept when a module is switched off", "Entitlement audit log"], "tables": ["features", "feature_groups", "tenant_overrides", "usage_counters", "entitlement_log"], "modules": ["F3", "B1", "M01", "S2"], "gate": "Switching a module off hides it, blocks its routes and jobs, and keeps its data for reactivation", "depends": "Step 3", "unlocks": "Step 6", "ph": 2, "phname": "Provision & package", "c": "#009cde", "t": "#00709f", "soft": "rgba(0,156,222,.10)", "ring": "rgba(0,156,222,.28)"}, {"n": 6, "nn": "06", "title": "Plans, segments and packages", "short": "Packaging", "sub": "Package the modules into three ladders, one per segment, from one versioned catalogue.", "builds": ["Segments set at onboarding: online, retail, wholesale or any combination; the segment drives navigation, dashboard, reports and the ladder offered", "Versioned plan builder: a plan is a set of modules, limits and a price", "Grandfathering: every merchant pinned to the plan version they bought", "Custom per-account plans with an approval threshold and a mandatory review date", "Add-ons sold on top: message credits, AI credits, assisted migration", "Pricing page on gridcommerce.com.bd reading the same live catalogue"], "tables": ["segments", "plans", "plan_versions", "plan_features", "plan_limits", "addons"], "modules": ["F3", "B2", "S8", "G3", "G5", "G6", "S6"], "gate": "Pricing page, signup and the entitlement engine all read one catalogue", "depends": "Steps 4 and 5", "unlocks": "Step 7", "ph": 2, "phname": "Provision & package", "c": "#009cde", "t": "#00709f", "soft": "rgba(0,156,222,.10)", "ring": "rgba(0,156,222,.28)"}, {"n": 7, "nn": "07", "title": "Subscription billing and invoicing", "short": "Billing", "sub": "Collect from every merchant every month, automatically, and never delete a store for a missed payment.", "builds": ["Subscription states: trial, active, grace, past due, paused, suspended, cancelled, archived, each with its access and data rule", "15-day trial; the clock starts when the store is published or takes a first real order; one live trial per business", "Recurring charge through bKash, Nagad and card on the same gateways as payments, with a manual path: transaction ID, screenshot, duplicate ID detection", "Dunning by SMS, email and in-app: retry, grace, read-only, suspension", "Upgrade and downgrade at any time with proration shown first; yearly prepay with deferred revenue", "Invoices, receipts and credit notes; edits need a reason code and a second approver above a threshold; immutable billing trail"], "tables": ["billing_accounts", "subscriptions", "invoices", "invoice_lines", "billing_payments", "credit_notes", "dunning_events"], "modules": ["F2", "M17", "S3", "S9"], "gate": "A full monthly cycle, including a failed payment and recovery, runs untouched on test merchants", "depends": "Step 6", "unlocks": "Step 8", "ph": 3, "phname": "Charge & watch", "c": "#10b981", "t": "#047857", "soft": "rgba(16,185,129,.10)", "ring": "rgba(16,185,129,.28)"}, {"n": 8, "nn": "08", "title": "Merchant monitoring and the platform console", "short": "Monitoring", "sub": "The control room on console.gridcommerce.com.bd: every merchant's health, usage, money and integrations in one place.", "builds": ["Merchant directory with plan, status, usage, activation score and health, searchable and filterable", "Churn warnings: no login, no orders, failed payment, failed integration, stalled activation", "Per-merchant resource use and cost to serve beside revenue, with an alert above the plan ceiling", "Subscription dashboard: recurring revenue, new, expansion, contraction, churn, collections, value at risk; trial funnel with stall points", "Technical monitoring: errors, latency per endpoint, real-user speed from Bangladeshi networks, uptime, queues, slow queries by tenant and module", "Integration health across couriers, gateways, SMS, WhatsApp and Meta; alerts routed by severity to a named responder", "Overrides, feature flags, announcements to stores and the support desk opened beside tenant health"], "tables": ["health_snapshots", "usage_daily", "integration_checks", "alerts", "incidents", "notices"], "modules": ["S5", "S7", "S9", "S8", "M08", "M17", "G1", "G3"], "gate": "Every merchant visible with live health; a test alert reaches its named responder", "depends": "Steps 3 and 7", "unlocks": "Step 9", "ph": 3, "phname": "Charge & watch", "c": "#10b981", "t": "#047857", "soft": "rgba(16,185,129,.10)", "ring": "rgba(16,185,129,.28)"}, {"n": 9, "nn": "09", "title": "Wire every module and ship the package", "short": "Wire & ship", "sub": "Bring each developer-built module onto the core in dependency order, then release behind staged flags.", "builds": ["Five-point check on every module: tenant scope proven, entitlement key, usage meters, audit events, health events", "Shared engines first: products, stock ledger, payments, customer record, promotions, notifications, event tracking", "Then each remaining module wave by wave; every module connects only to modules completed before it", "Load tests against targets: storefront under 2.5 s on mid-range Android over 4G, API p95 300 ms read and 800 ms write, admin under 2 s", "Security review, backup restore drill and runbooks: restore, webhook replay, certificate reissue, stuck order, rollback", "Staged rollout through feature flags to pilot merchants, then go-live on gridcommerce.com.bd"], "tables": ["feature_flags", "release_log"], "modules": ["All 48"], "gate": "Pilot merchants trading and billed on the platform; 99.9 percent uptime instrumented", "depends": "Step 8", "unlocks": "Launch", "ph": 4, "phname": "Ship", "c": "#ff9800", "t": "#a45100", "soft": "rgba(255,152,0,.12)", "ring": "rgba(255,152,0,.32)"}];
var MODS = {"F1": "Multi-tenancy and provisioning", "F3": "Plans, segments and entitlement", "F2": "Subscription billing", "B1": "Admin interface and design system", "B2": "gridcommerce.com.bd", "S4": "Users, roles and security", "S5": "Platform console and monitoring", "S8": "Business setup and onboarding", "S9": "Merchant notification centre", "S3": "Transactional notifications", "M01": "Dashboard", "S2": "Reports and profitability", "M07": "Products", "M15": "Stock ledger", "S1": "Customer record", "M17": "Payments and settlement", "M21": "Promotions and offers", "M22": "Customer page and CRM", "M24": "Staff profile and access", "M18": "Returns and exchanges", "M28": "Warranty policies", "M06": "Checkout and accounts", "M02": "Online orders", "M25": "Manual online order", "M23": "Quick order link", "M26": "Bulk order actions", "M08": "Courier, delivery and COD", "M11": "Themes", "M12": "Landing pages", "M10": "SEO", "M09": "Reviews and ratings", "G1": "Server-side tracking", "M04": "POS terminal", "M03": "Counter sales entry", "M16": "Cash and expenses", "M13": "Purchasing and suppliers", "M14": "Wholesale and receivables", "M05": "Warehouses", "M27": "Partners and profit sharing", "M19": "HR, payroll and attendance", "M20": "Loyalty and affiliates", "G2": "Analytics hub", "G4": "Cart recovery", "G3": "Inbox and automation", "G6": "SMS, email, WhatsApp blast", "G5": "AI product creation", "S7": "Support tickets", "S6": "Migration"};
class Component extends DCLogic {
  renderVals() {
    
    var self = this, s = this.state || {};
    var sel = s.sel == null ? 0 : s.sel;
    var cur = STEPS[sel];
    var go = function (i) { return function () { self.setState({ sel: i }); }; };
    var list = STEPS.map(function (x, i) {
      var on = i === sel, done = i < sel;
      return { nn: x.nn, title: x.short, phname: x.phname, cls: on ? 'stepbtn on' : 'stepbtn', pick: go(i), current: on ? 'step' : 'false',
        dotBg: on ? x.c : (done ? x.soft : '#fff'), dotFg: on ? '#fff' : (done ? x.t : '#64748b'), dotBd: on ? x.c : (done ? x.ring : '#cbd5e1'),
        showPhase: i === 0 || STEPS[i - 1].ph !== x.ph, phLabel: 'Phase ' + x.ph + ' · ' + x.phname, phColor: x.t };
    });
    var segs = STEPS.map(function (x, i) { return { bg: i <= sel ? x.c : '#e2e8f0' }; });
    var builds = cur.builds.map(function (b, i) { return { text: b, k: (i + 1 < 10 ? '0' : '') + (i + 1) }; });
    var mods = cur.modules.map(function (m) { return { key: m, name: MODS[m] || 'Every module in the specification' }; });
    return {
      cur: cur, builds: builds, tables: cur.tables.map(function (t) { return { t: t }; }), mods: mods, list: list, segs: segs,
      stepOf: 'Step ' + cur.n + ' of 9',
      hasPrev: sel > 0, hasNext: sel < STEPS.length - 1,
      prev: go(Math.max(0, sel - 1)), next: go(Math.min(STEPS.length - 1, sel + 1)),
      prevLabel: sel > 0 ? STEPS[sel - 1].short : '', nextLabel: sel < STEPS.length - 1 ? STEPS[sel + 1].short : ''
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:'Poppins',system-ui,-apple-system,'Segoe UI',sans-serif;background:#e9eef5;color:#475569;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087;text-decoration:none}a:hover{color:#002a77}
.mono{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;letter-spacing:0}
.num{font-variant-numeric:tabular-nums}
.card{background:#fff;border-radius:16px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 6px 18px -8px rgba(15,23,42,.10)}
.lift{transition:transform 220ms cubic-bezier(.23,1,.32,1),box-shadow 220ms cubic-bezier(.23,1,.32,1)}
.lift:hover{transform:translateY(-2px);box-shadow:0 1px 2px rgba(15,23,42,.05),0 16px 32px -14px rgba(15,23,42,.22)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 18px;border-radius:10px;border:0;font:inherit;font-size:14px;font-weight:500;cursor:pointer;text-decoration:none;transition:background-color 180ms ease,color 180ms ease,transform 160ms cubic-bezier(.23,1,.32,1)}
.btn:active{transform:scale(.97)}
.btn:focus-visible,.stepbtn:focus-visible{outline:3px solid rgba(0,48,135,.45);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.ghost{background:rgba(0,48,135,.08);color:#003087}.ghost:hover{background:rgba(0,48,135,.15);color:#003087}
.stepbtn{display:flex;width:100%;align-items:center;gap:14px;min-height:64px;padding:10px 14px;border:0;border-radius:12px;background:transparent;font:inherit;text-align:left;cursor:pointer;color:#334155;transition:background-color 180ms ease,transform 160ms cubic-bezier(.23,1,.32,1)}
.stepbtn:hover{background:#f1f5f9}
.stepbtn:active{transform:scale(.98)}
.stepbtn.on{background:#fff;box-shadow:0 1px 2px rgba(15,23,42,.05),0 8px 20px -10px rgba(15,23,42,.25)}
@media (prefers-reduced-motion: reduce){.lift,.btn,.stepbtn{transition:none}.lift:hover{transform:none}.btn:active,.stepbtn:active{transform:none}}
`;

// ---- markup ----

export default class CoreStepsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="CoreSteps">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ width: "1440px", height: "1180px", overflow: "hidden", background: "#e9eef5", position: "relative" }}>
          <div style={{ position: "absolute", inset: "0", display: "grid", gridTemplateColumns: "400px minmax(0,1fr)" }}>
            <aside style={{ background: "#012169", color: "#fff", padding: "40px 24px 32px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: "0", background: "repeating-linear-gradient(115deg,rgba(255,255,255,.04) 0 1px,transparent 1px 46px)", pointerEvents: "none" }} />
              <div style={{ position: "relative" }}>
                <__Link href="/core-plan" style={{ display: "inline-flex", alignItems: "center", gap: "6px", minHeight: "44px", fontSize: "13px", color: "#7fd4f5" }}>← Build plan overview</__Link>
                <p style={{ margin: "14px 0 0", padding: "0 12px", fontSize: "12px", fontWeight: "600", letterSpacing: ".2em", textTransform: "uppercase", color: "#7fd4f5" }}>Step explorer</p>
                <h1 style={{ margin: "8px 0 18px", padding: "0 12px", fontSize: "26px", lineHeight: "1.2", fontWeight: "700", letterSpacing: "-.02em", color: "#fff" }}>Platform core, step by step</h1>
                <nav aria-label="Build steps" style={{ display: "grid", gap: "2px", padding: "10px", borderRadius: "16px", background: "#f1f5f9" }}>
                  {__list(v.list).map((it, $index) => (<React.Fragment key={$index}>
                      {it?.showPhase ? (<>
                        <div style={__sx(`padding:12px 12px 4px;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${it?.phColor ?? ""}`)}>{it?.phLabel}</div>
                      </>) : null}
                      <button className={it?.cls} onClick={it?.pick} aria-current={it?.current}>
                        <span className="num" style={__sx(`flex:none;display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:999px;border:1.5px solid ${it?.dotBd ?? ""};background:${it?.dotBg ?? ""};color:${it?.dotFg ?? ""};font-size:13px;font-weight:600`)}>{it?.nn}</span>
                        {" "}
                        <span style={{ fontSize: "14px", fontWeight: "500" }}>{it?.title}</span>
                      </button>
                    </React.Fragment>))}
                </nav>
              </div>
            </aside>
            <main style={{ padding: "40px 56px 40px", display: "flex", flexDirection: "column", minWidth: "0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {__list(v.segs).map((g, $index) => (<React.Fragment key={$index}>
                    <span style={__sx(`flex:1;height:6px;border-radius:6px;background:${g?.bg ?? ""};transition:background-color 240ms cubic-bezier(.23,1,.32,1)`)} />
                  </React.Fragment>))}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px" }}>
                <span className="num" style={{ fontSize: "13px", fontWeight: "500", color: "#64748b" }}>{v.stepOf}</span>
                <span style={__sx(`display:inline-flex;align-items:center;height:28px;padding:0 12px;border-radius:999px;background:${v.cur?.soft ?? ""};color:${v.cur?.t ?? ""};font-size:12px;font-weight:600`)}>Phase {v.cur?.ph} · {v.cur?.phname}</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "24px", marginTop: "22px" }}>
                <span className="num" style={__sx(`flex:none;font-size:96px;line-height:.85;font-weight:700;letter-spacing:-.05em;color:${v.cur?.c ?? ""}`)}>{v.cur?.nn}</span>
                <div style={{ minWidth: "0" }}>
                  <h2 style={{ margin: "0", fontSize: "34px", lineHeight: "1.12", fontWeight: "700", letterSpacing: "-.025em", color: "#0f172a", textWrap: "balance" }}>{v.cur?.title}</h2>
                  <p style={{ margin: "10px 0 0", maxWidth: "760px", fontSize: "16px", lineHeight: "1.6", color: "#475569", textWrap: "pretty" }}>{v.cur?.sub}</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.35fr) minmax(0,1fr)", gap: "20px", marginTop: "30px", flex: "1", minHeight: "0" }}>
                <section className="card" style={{ padding: "26px 28px" }}>
                  <h3 style={{ margin: "0", fontSize: "12px", fontWeight: "600", letterSpacing: ".14em", textTransform: "uppercase", color: "#64748b" }}>What gets built</h3>
                  <ol style={{ listStyle: "none", margin: "16px 0 0", padding: "0", display: "grid", gap: "4px" }}>
                    {__list(v.builds).map((b, $index) => (<React.Fragment key={$index}>
                        <li style={{ display: "grid", gridTemplateColumns: "34px minmax(0,1fr)", gap: "8px", padding: "10px 0", borderTop: "1px solid #eef2f6" }}>
                          <span className="mono num" style={__sx(`padding-top:2px;color:${v.cur?.t ?? ""};font-weight:500`)}>{b?.k}</span>
                          <span style={{ fontSize: "14px", lineHeight: "1.55", color: "#334155" }}>{b?.text}</span>
                        </li>
                      </React.Fragment>))}
                  </ol>
                </section>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", minWidth: "0" }}>
                  <section className="card" style={{ padding: "22px 24px" }}>
                    <h3 style={{ margin: "0", fontSize: "12px", fontWeight: "600", letterSpacing: ".14em", textTransform: "uppercase", color: "#64748b" }}>Tables and services</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
                      {__list(v.tables).map((t, $index) => (<React.Fragment key={$index}>
                          <span className="mono" style={{ display: "inline-flex", alignItems: "center", height: "28px", padding: "0 10px", borderRadius: "7px", background: "#0f172a", color: "#e2e8f0" }}>{t?.t}</span>
                        </React.Fragment>))}
                    </div>
                    <h3 style={{ margin: "22px 0 0", fontSize: "12px", fontWeight: "600", letterSpacing: ".14em", textTransform: "uppercase", color: "#64748b" }}>Modules touched</h3>
                    <div style={{ display: "grid", gap: "6px", marginTop: "12px" }}>
                      {__list(v.mods).map((m, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#334155" }}><span className="mono" style={__sx(`flex:none;min-width:52px;display:inline-flex;justify-content:center;height:24px;align-items:center;padding:0 6px;border-radius:6px;background:${v.cur?.soft ?? ""};color:${v.cur?.t ?? ""};font-weight:500`)}>{m?.key}</span>{m?.name}</div>
                        </React.Fragment>))}
                    </div>
                  </section>
                  <section style={{ padding: "22px 24px", borderRadius: "16px", background: "#012169", color: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#7fd4f5" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
                        <path d="M4 21h16M9 12h.01" />
                      </svg>
                      <span style={{ fontSize: "12px", fontWeight: "600", letterSpacing: ".14em", textTransform: "uppercase" }}>Gate to pass</span>
                    </div>
                    <p style={{ margin: "10px 0 0", fontSize: "16px", lineHeight: "1.5", fontWeight: "500", color: "#fff" }}>{v.cur?.gate}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "12px", marginTop: "18px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,.14)" }}>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: ".1em", textTransform: "uppercase", color: "#99b3d6" }}>Depends on</div>
                        <div style={{ marginTop: "4px", fontSize: "14px", color: "#fff" }}>{v.cur?.depends}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: "600", letterSpacing: ".1em", textTransform: "uppercase", color: "#99b3d6" }}>Unlocks</div>
                        <div style={{ marginTop: "4px", fontSize: "14px", color: "#fff" }}>{v.cur?.unlocks}</div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "22px" }}>
                {v.hasPrev ? (<>
                  <button className="btn ghost" onClick={v.prev}>← {v.prevLabel}</button>
                </>) : null}
                <span style={{ flex: "1" }} />
                {v.hasNext ? (<>
                  <button className="btn solid" onClick={v.next}>{v.nextLabel} →</button>
                </>) : null}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}
