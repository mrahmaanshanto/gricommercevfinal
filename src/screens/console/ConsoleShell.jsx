'use client';
// Generated from design/templates/console/ConsoleShell.dc.html by scripts/convert-design.mjs.
// Console shell · light
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

const GROUPS = [{"id": "tenants", "label": "Tenants", "items": [{"id": "merchants", "label": "Merchants", "step": 2, "desc": "Every store with segment, plan, state, health and usage.", "badge": "", "tone": "", "board": "Merchants.dc.html"}, {"id": "provisioning", "label": "Provisioning", "step": 2, "desc": "Each signup moving through the job chain, live.", "badge": "", "tone": "", "board": "Provisioning.dc.html"}, {"id": "domains", "label": "Domains", "step": 2, "desc": "DNS, propagation and certificate expiry for every custom domain.", "badge": "", "tone": "", "board": "Domains.dc.html"}, {"id": "backups", "label": "Backups", "step": 2, "desc": "Per-store snapshots and restore with a dry run first.", "badge": "", "tone": "", "board": "Backups.dc.html"}]}, {"id": "packaging", "label": "Packaging", "items": [{"id": "catalogue", "label": "Module catalogue", "step": 3, "desc": "All 48 modules in nine sets.", "badge": "", "tone": "", "board": "ModuleCatalogue.dc.html"}, {"id": "plans", "label": "Plans", "step": 3, "desc": "Versioned plan builder on three ladders.", "badge": "", "tone": "", "board": "Plans.dc.html"}, {"id": "entitlements", "label": "Entitlements", "step": 3, "desc": "Per-store toggle grid, overrides and one-module trials.", "badge": "", "tone": "", "board": "Entitlements.dc.html"}, {"id": "limits", "label": "Limits and meters", "step": 3, "desc": "Usage across stores against each limit.", "badge": "", "tone": "", "board": "Limits.dc.html"}]}, {"id": "billing", "label": "Billing", "items": [{"id": "subscriptions", "label": "Subscriptions", "step": 4, "desc": "Recurring revenue, movement, collections and value at risk.", "badge": "", "tone": "", "board": "Subscriptions.dc.html"}, {"id": "invoices", "label": "Invoices", "step": 4, "desc": "Invoices, receipts and credit notes.", "badge": "", "tone": "", "board": "Invoices.dc.html"}, {"id": "collections", "label": "Collections", "step": 4, "desc": "Stores with a due or overdue invoice: who to call, and payments taken on a call.", "badge": "4", "tone": "warn", "board": "Collections.dc.html"}, {"id": "adjustments", "label": "Adjustments", "step": 4, "desc": "Bill changes with reason codes and second approval.", "badge": "", "tone": "", "board": "Adjustments.dc.html"}]}, {"id": "monitoring", "label": "Monitoring", "items": [{"id": "health", "label": "Health and risk", "step": 5, "desc": "Stores grouped by warning, with owner and next step.", "badge": "5", "tone": "warn", "board": "HealthRisk.dc.html"}, {"id": "funnel", "label": "Trial funnel", "step": 5, "desc": "Signup to paid, stall points and cohort retention.", "badge": "", "tone": "", "board": "TrialFunnel.dc.html"}, {"id": "cost", "label": "Cost to serve", "step": 5, "desc": "Resource use against revenue for every store.", "badge": "", "tone": "", "board": "CostToServe.dc.html"}]}, {"id": "support", "label": "Support", "items": [{"id": "tickets", "label": "Tickets", "step": 0, "desc": "Every merchant ticket across in-app, WhatsApp, email and phone.", "badge": "12", "tone": "", "board": "SupportDesk.dc.html"}, {"id": "storeaccess", "label": "Store access · PIN", "step": 0, "desc": "Enter a store with the owner's PIN, for a set time.", "badge": "", "tone": "", "board": "StoreAccess.dc.html"}, {"id": "accesslog", "label": "Access log", "step": 0, "desc": "Who entered which store, for how long, and why.", "badge": "", "tone": "", "board": "AccessLog.dc.html"}, {"id": "supportperf", "label": "Performance", "step": 0, "desc": "SLA, volume, categories and agent performance.", "badge": "", "tone": "", "board": "SupportPerformance.dc.html"}]}, {"id": "crm", "label": "Sales CRM", "items": [{"id": "leads", "label": "Leads", "step": 0, "desc": "Every prospect from ads, the website, events, referrals and CSV.", "badge": "18", "tone": "", "board": "Leads.dc.html"}, {"id": "trials", "label": "Trials", "step": 0, "desc": "Every store in trial, how far it has set up, and who follows up.", "badge": "", "tone": "", "board": "Trials.dc.html"}, {"id": "leadimport", "label": "Import leads", "step": 0, "desc": "Bring leads in from a CSV file.", "badge": "", "tone": "", "board": "LeadImport.dc.html"}]}, {"id": "operations", "label": "Operations", "items": [{"id": "opscentre", "label": "Ops centre", "step": 0, "desc": "Every service, job and alert on one screen.", "badge": "", "tone": "", "board": "OpsCentre.dc.html"}, {"id": "platform", "label": "Platform health", "step": 6, "desc": "Uptime, latency and error rate at a glance.", "badge": "", "tone": "", "board": "PlatformHealth.dc.html"}, {"id": "integrations", "label": "Integrations", "step": 6, "desc": "Couriers, gateways, SMS, WhatsApp and Meta across stores.", "badge": "1", "tone": "err", "board": "Integrations.dc.html"}, {"id": "webhooks", "label": "Webhooks", "step": 0, "desc": "Inbound and outbound deliveries, retries and replay.", "badge": "", "tone": "", "board": "Webhooks.dc.html"}, {"id": "queues", "label": "Queues and jobs", "step": 0, "desc": "Depth, lag, failures and dead letters.", "badge": "", "tone": "", "board": "QueuesJobs.dc.html"}, {"id": "incidents", "label": "Incidents", "step": 6, "desc": "Severity, responder, affected stores and runbook.", "badge": "1", "tone": "warn", "board": "Incidents.dc.html"}]}, {"id": "system", "label": "System", "items": [{"id": "releases", "label": "Releases", "step": 0, "desc": "Deploys, canaries and rollbacks.", "badge": "", "tone": "", "board": "Releases.dc.html"}, {"id": "security", "label": "Security", "step": 0, "desc": "Sign-ins, blocked traffic, keys and 2FA.", "badge": "", "tone": "", "board": "Security.dc.html"}, {"id": "messaging", "label": "Messaging", "step": 0, "desc": "SMS, WhatsApp and email delivery and credits.", "badge": "", "tone": "", "board": "Messaging.dc.html"}, {"id": "cron", "label": "Scheduled tasks", "step": 0, "desc": "Every scheduled job, its last run and next run.", "badge": "", "tone": "", "board": "ScheduledTasks.dc.html"}, {"id": "flags", "label": "Flags and notices", "step": 6, "desc": "Staged rollout and broadcast notices.", "badge": "", "tone": "", "board": "FlagsNotices.dc.html"}, {"id": "staff", "label": "Staff and roles", "step": 0, "desc": "Console staff, roles and permissions.", "badge": "", "tone": "", "board": "StaffRoles.dc.html"}, {"id": "audit", "label": "Audit log", "step": 6, "desc": "Every staff and merchant action, filterable.", "badge": "", "tone": "", "board": "AuditLog.dc.html"}]}];
const KPIS = {"1": [{"label": "Active stores", "value": "62", "delta": "+1 today", "toneCls": "tone-good", "d": "M0.0,20.9 L8.7,23.7 L17.4,19.5 L26.1,23.3 L34.8,20.8 L43.5,20.6 L52.2,24.6 L60.9,22.4 L69.6,26.7 L78.3,25.6 L87.0,29.4 L95.7,33.0 L104.3,32.0 L113.0,25.4 L121.7,28.5 L130.4,30.3 L139.1,26.4 L147.8,18.2 L156.5,15.1 L165.2,14.4 L173.9,5.8 L182.6,10.0 L191.3,3.0 L200.0,3.8", "area": "M0.0,20.9 L8.7,23.7 L17.4,19.5 L26.1,23.3 L34.8,20.8 L43.5,20.6 L52.2,24.6 L60.9,22.4 L69.6,26.7 L78.3,25.6 L87.0,29.4 L95.7,33.0 L104.3,32.0 L113.0,25.4 L121.7,28.5 L130.4,30.3 L139.1,26.4 L147.8,18.2 L156.5,15.1 L165.2,14.4 L173.9,5.8 L182.6,10.0 L191.3,3.0 L200.0,3.8 L200,36 L0,36 Z"}, {"label": "Recurring revenue", "value": "৳88,000", "delta": "▲ 0.4% vs yesterday", "toneCls": "tone-good", "d": "M0.0,32.7 L8.7,33.0 L17.4,32.4 L26.1,29.4 L34.8,29.3 L43.5,27.4 L52.2,25.2 L60.9,24.3 L69.6,22.6 L78.3,23.1 L87.0,23.7 L95.7,23.6 L104.3,21.2 L113.0,20.0 L121.7,19.3 L130.4,17.4 L139.1,16.1 L147.8,15.5 L156.5,12.6 L165.2,10.1 L173.9,9.8 L182.6,8.0 L191.3,6.3 L200.0,3.0", "area": "M0.0,32.7 L8.7,33.0 L17.4,32.4 L26.1,29.4 L34.8,29.3 L43.5,27.4 L52.2,25.2 L60.9,24.3 L69.6,22.6 L78.3,23.1 L87.0,23.7 L95.7,23.6 L104.3,21.2 L113.0,20.0 L121.7,19.3 L130.4,17.4 L139.1,16.1 L147.8,15.5 L156.5,12.6 L165.2,10.1 L173.9,9.8 L182.6,8.0 L191.3,6.3 L200.0,3.0 L200,36 L0,36 Z"}, {"label": "Stores at risk", "value": "5", "delta": "▲ 1 since yesterday", "toneCls": "tone-bad", "d": "M0.0,26.5 L8.7,28.8 L17.4,22.3 L26.1,26.8 L34.8,27.4 L43.5,23.7 L52.2,27.8 L60.9,27.5 L69.6,33.0 L78.3,30.5 L87.0,26.7 L95.7,25.3 L104.3,20.2 L113.0,22.1 L121.7,19.2 L130.4,17.6 L139.1,16.2 L147.8,16.4 L156.5,11.6 L165.2,5.6 L173.9,5.5 L182.6,3.0 L191.3,8.2 L200.0,5.2", "area": "M0.0,26.5 L8.7,28.8 L17.4,22.3 L26.1,26.8 L34.8,27.4 L43.5,23.7 L52.2,27.8 L60.9,27.5 L69.6,33.0 L78.3,30.5 L87.0,26.7 L95.7,25.3 L104.3,20.2 L113.0,22.1 L121.7,19.2 L130.4,17.6 L139.1,16.2 L147.8,16.4 L156.5,11.6 L165.2,5.6 L173.9,5.5 L182.6,3.0 L191.3,8.2 L200.0,5.2 L200,36 L0,36 Z"}, {"label": "Open incidents", "value": "1", "delta": "Steadfast webhooks · 4 h", "toneCls": "tone-bad", "d": "M0.0,13.2 L8.7,7.0 L17.4,3.0 L26.1,5.7 L34.8,7.1 L43.5,5.0 L52.2,11.0 L60.9,11.5 L69.6,15.6 L78.3,20.4 L87.0,26.0 L95.7,22.6 L104.3,27.2 L113.0,30.4 L121.7,31.8 L130.4,27.1 L139.1,32.4 L147.8,33.0 L156.5,32.4 L165.2,27.6 L173.9,23.6 L182.6,19.0 L191.3,21.8 L200.0,22.9", "area": "M0.0,13.2 L8.7,7.0 L17.4,3.0 L26.1,5.7 L34.8,7.1 L43.5,5.0 L52.2,11.0 L60.9,11.5 L69.6,15.6 L78.3,20.4 L87.0,26.0 L95.7,22.6 L104.3,27.2 L113.0,30.4 L121.7,31.8 L130.4,27.1 L139.1,32.4 L147.8,33.0 L156.5,32.4 L165.2,27.6 L173.9,23.6 L182.6,19.0 L191.3,21.8 L200.0,22.9 L200,36 L0,36 Z"}], "7": [{"label": "Active stores", "value": "62", "delta": "+3 this week", "toneCls": "tone-good", "d": "M0.0,33.0 L8.7,30.3 L17.4,27.3 L26.1,27.5 L34.8,27.6 L43.5,27.5 L52.2,27.3 L60.9,26.2 L69.6,24.7 L78.3,24.4 L87.0,25.2 L95.7,24.3 L104.3,23.7 L113.0,22.2 L121.7,19.2 L130.4,17.3 L139.1,16.0 L147.8,14.4 L156.5,12.5 L165.2,13.1 L173.9,10.3 L182.6,8.0 L191.3,5.4 L200.0,3.0", "area": "M0.0,33.0 L8.7,30.3 L17.4,27.3 L26.1,27.5 L34.8,27.6 L43.5,27.5 L52.2,27.3 L60.9,26.2 L69.6,24.7 L78.3,24.4 L87.0,25.2 L95.7,24.3 L104.3,23.7 L113.0,22.2 L121.7,19.2 L130.4,17.3 L139.1,16.0 L147.8,14.4 L156.5,12.5 L165.2,13.1 L173.9,10.3 L182.6,8.0 L191.3,5.4 L200.0,3.0 L200,36 L0,36 Z"}, {"label": "Recurring revenue", "value": "৳88,000", "delta": "▲ 1.8% vs last week", "toneCls": "tone-good", "d": "M0.0,33.0 L8.7,31.5 L17.4,30.8 L26.1,28.5 L34.8,28.0 L43.5,27.4 L52.2,26.4 L60.9,25.5 L69.6,24.1 L78.3,23.5 L87.0,23.1 L95.7,22.3 L104.3,21.6 L113.0,20.2 L121.7,19.7 L130.4,16.8 L139.1,14.6 L147.8,13.8 L156.5,12.7 L165.2,11.3 L173.9,9.8 L182.6,9.1 L191.3,6.2 L200.0,3.0", "area": "M0.0,33.0 L8.7,31.5 L17.4,30.8 L26.1,28.5 L34.8,28.0 L43.5,27.4 L52.2,26.4 L60.9,25.5 L69.6,24.1 L78.3,23.5 L87.0,23.1 L95.7,22.3 L104.3,21.6 L113.0,20.2 L121.7,19.7 L130.4,16.8 L139.1,14.6 L147.8,13.8 L156.5,12.7 L165.2,11.3 L173.9,9.8 L182.6,9.1 L191.3,6.2 L200.0,3.0 L200,36 L0,36 Z"}, {"label": "Stores at risk", "value": "5", "delta": "▲ 2 vs last week", "toneCls": "tone-bad", "d": "M0.0,10.0 L8.7,9.2 L17.4,15.9 L26.1,22.2 L34.8,24.0 L43.5,27.3 L52.2,19.9 L60.9,25.1 L69.6,33.0 L78.3,23.2 L87.0,21.5 L95.7,27.0 L104.3,25.0 L113.0,32.8 L121.7,31.1 L130.4,20.8 L139.1,12.7 L147.8,7.8 L156.5,11.2 L165.2,12.5 L173.9,17.7 L182.6,11.3 L191.3,9.5 L200.0,3.0", "area": "M0.0,10.0 L8.7,9.2 L17.4,15.9 L26.1,22.2 L34.8,24.0 L43.5,27.3 L52.2,19.9 L60.9,25.1 L69.6,33.0 L78.3,23.2 L87.0,21.5 L95.7,27.0 L104.3,25.0 L113.0,32.8 L121.7,31.1 L130.4,20.8 L139.1,12.7 L147.8,7.8 L156.5,11.2 L165.2,12.5 L173.9,17.7 L182.6,11.3 L191.3,9.5 L200.0,3.0 L200,36 L0,36 Z"}, {"label": "Open incidents", "value": "1", "delta": "3 closed this week", "toneCls": "tone-flat", "d": "M0.0,29.2 L8.7,33.0 L17.4,28.7 L26.1,22.1 L34.8,17.2 L43.5,13.0 L52.2,8.7 L60.9,5.4 L69.6,9.1 L78.3,8.9 L87.0,10.9 L95.7,17.3 L104.3,23.8 L113.0,26.8 L121.7,30.1 L130.4,27.5 L139.1,21.2 L147.8,21.9 L156.5,15.9 L165.2,9.2 L173.9,3.0 L182.6,4.9 L191.3,8.7 L200.0,12.4", "area": "M0.0,29.2 L8.7,33.0 L17.4,28.7 L26.1,22.1 L34.8,17.2 L43.5,13.0 L52.2,8.7 L60.9,5.4 L69.6,9.1 L78.3,8.9 L87.0,10.9 L95.7,17.3 L104.3,23.8 L113.0,26.8 L121.7,30.1 L130.4,27.5 L139.1,21.2 L147.8,21.9 L156.5,15.9 L165.2,9.2 L173.9,3.0 L182.6,4.9 L191.3,8.7 L200.0,12.4 L200,36 L0,36 Z"}], "30": [{"label": "Active stores", "value": "62", "delta": "+6 this month", "toneCls": "tone-good", "d": "M0.0,33.0 L8.7,32.6 L17.4,31.3 L26.1,29.3 L34.8,27.4 L43.5,26.4 L52.2,25.0 L60.9,23.2 L69.6,23.1 L78.3,21.7 L87.0,19.7 L95.7,17.9 L104.3,16.3 L113.0,15.3 L121.7,15.0 L130.4,13.2 L139.1,12.6 L147.8,10.8 L156.5,8.6 L165.2,7.8 L173.9,7.0 L182.6,4.9 L191.3,3.3 L200.0,3.0", "area": "M0.0,33.0 L8.7,32.6 L17.4,31.3 L26.1,29.3 L34.8,27.4 L43.5,26.4 L52.2,25.0 L60.9,23.2 L69.6,23.1 L78.3,21.7 L87.0,19.7 L95.7,17.9 L104.3,16.3 L113.0,15.3 L121.7,15.0 L130.4,13.2 L139.1,12.6 L147.8,10.8 L156.5,8.6 L165.2,7.8 L173.9,7.0 L182.6,4.9 L191.3,3.3 L200.0,3.0 L200,36 L0,36 Z"}, {"label": "Recurring revenue", "value": "৳88,000", "delta": "▲ 6.2% vs August", "toneCls": "tone-good", "d": "M0.0,33.0 L8.7,32.2 L17.4,30.4 L26.1,28.8 L34.8,28.0 L43.5,26.3 L52.2,24.4 L60.9,22.9 L69.6,21.9 L78.3,20.5 L87.0,19.8 L95.7,19.1 L104.3,17.3 L113.0,15.8 L121.7,14.5 L130.4,12.7 L139.1,11.5 L147.8,9.8 L156.5,8.1 L165.2,7.2 L173.9,6.3 L182.6,5.3 L191.3,4.4 L200.0,3.0", "area": "M0.0,33.0 L8.7,32.2 L17.4,30.4 L26.1,28.8 L34.8,28.0 L43.5,26.3 L52.2,24.4 L60.9,22.9 L69.6,21.9 L78.3,20.5 L87.0,19.8 L95.7,19.1 L104.3,17.3 L113.0,15.8 L121.7,14.5 L130.4,12.7 L139.1,11.5 L147.8,9.8 L156.5,8.1 L165.2,7.2 L173.9,6.3 L182.6,5.3 L191.3,4.4 L200.0,3.0 L200,36 L0,36 Z"}, {"label": "Stores at risk", "value": "5", "delta": "▼ 3 vs August", "toneCls": "tone-good", "d": "M0.0,29.1 L8.7,29.0 L17.4,33.0 L26.1,25.6 L34.8,26.4 L43.5,25.6 L52.2,23.0 L60.9,15.7 L69.6,15.5 L78.3,8.0 L87.0,6.6 L95.7,4.7 L104.3,3.0 L113.0,8.7 L121.7,8.2 L130.4,11.5 L139.1,17.4 L147.8,11.6 L156.5,15.0 L165.2,14.1 L173.9,9.4 L182.6,7.2 L191.3,8.3 L200.0,6.7", "area": "M0.0,29.1 L8.7,29.0 L17.4,33.0 L26.1,25.6 L34.8,26.4 L43.5,25.6 L52.2,23.0 L60.9,15.7 L69.6,15.5 L78.3,8.0 L87.0,6.6 L95.7,4.7 L104.3,3.0 L113.0,8.7 L121.7,8.2 L130.4,11.5 L139.1,17.4 L147.8,11.6 L156.5,15.0 L165.2,14.1 L173.9,9.4 L182.6,7.2 L191.3,8.3 L200.0,6.7 L200,36 L0,36 Z"}, {"label": "Open incidents", "value": "1", "delta": "7 closed this month", "toneCls": "tone-flat", "d": "M0.0,27.2 L8.7,24.0 L17.4,28.4 L26.1,27.7 L34.8,30.5 L43.5,33.0 L52.2,30.0 L60.9,29.9 L69.6,29.2 L78.3,26.3 L87.0,21.7 L95.7,22.4 L104.3,21.1 L113.0,21.1 L121.7,20.9 L130.4,18.8 L139.1,19.3 L147.8,19.0 L156.5,19.2 L165.2,14.3 L173.9,12.1 L182.6,7.9 L191.3,3.0 L200.0,5.7", "area": "M0.0,27.2 L8.7,24.0 L17.4,28.4 L26.1,27.7 L34.8,30.5 L43.5,33.0 L52.2,30.0 L60.9,29.9 L69.6,29.2 L78.3,26.3 L87.0,21.7 L95.7,22.4 L104.3,21.1 L113.0,21.1 L121.7,20.9 L130.4,18.8 L139.1,19.3 L147.8,19.0 L156.5,19.2 L165.2,14.3 L173.9,12.1 L182.6,7.9 L191.3,3.0 L200.0,5.7 L200,36 L0,36 Z"}]};
const STEPNAMES = {"0": "Support and CRM", "2": "Multi-tenancy", "3": "Packaging", "4": "Billing", "5": "Customer monitoring", "6": "Platform operations"};
class Component extends DCLogic {
  renderVals() {
    const v = this.renderVals0() || {};
    const mini = !!(this.state || {}).mini;
    v.miniCls = mini ? 'mini' : '';
    if (typeof v.rootCls === 'string') v.rootCls = v.rootCls + (mini ? ' mini' : '');
    v.toggleSide = () => this.setState({ mini: !mini });
    v.sideLabel = mini ? 'Expand menu' : 'Collapse menu';
    return v;
  }

  renderVals0() {
    const s = this.state || {};
    const active = s.active ?? 'overview';
    const open = s.open ?? 'monitoring';
    const range = s.range ?? '7';
    const dark = s.dark ?? (this.props.dark === true);
    const g = {};
    let cur = { label: 'Overview', group: 'Console', desc: '', step: 1, stepName: '', href: '', hasBoard: false, noBoard: true };
    GROUPS.forEach((gr) => {
      const isOpen = open === gr.id;
      g[gr.id] = {
        open: isOpen,
        expanded: isOpen ? 'true' : 'false',
        chev: isOpen ? 'chev open' : 'chev',
        hcls: isOpen ? 'nav grp open' : 'nav grp',
        toggle: () => this.setState({ open: isOpen ? '' : gr.id }),
        items: gr.items.map((it) => {
          if (it.id === active) cur = { label: it.label, group: gr.label, desc: it.desc, step: it.step, stepName: STEPNAMES[it.step], href: it.board, hasBoard: !!it.board, noBoard: !it.board };
          return {
            label: it.label,
            cls: it.id === active ? 'nav sub on' : 'nav sub',
            current: it.id === active ? 'page' : 'false',
            pick: () => this.setState({ active: it.id }),
            hasBadge: !!it.badge,
            badge: it.badge,
            badgeCls: 'badge ' + it.tone,
            badgeLabel: it.badge + ' need attention',
          };
        }),
      };
    });
    const labels = { '1': 'Today', '7': '7 days', '30': '30 days' };
    return {
      rootCls: dark ? 'cs dark' : 'cs',
      dark, light: !dark,
      themeLabel: dark ? 'Switch to light theme' : 'Switch to dark theme',
      toggleTheme: () => this.setState({ dark: !dark }),
      g,
      overviewCls: active === 'overview' ? 'nav top on' : 'nav top',
      overviewCurrent: active === 'overview' ? 'page' : 'false',
      pickOverview: () => this.setState({ active: 'overview' }),
      isOverview: active === 'overview',
      notOverview: active !== 'overview',
      cur,
      crumbGroup: active === 'overview' ? 'Console' : cur.group,
      crumbPage: cur.label,
      ranges: ['1', '7', '30'].map((r) => ({ label: labels[r], cls: r === range ? 'segb on' : 'segb', pressed: r === range ? 'true' : 'false', pick: () => this.setState({ range: r }) })),
      rangeLabel: labels[range],
      kpis: KPIS[range],
      palette: !!s.palette,
      openPalette: () => this.setState({ palette: true }),
      closePalette: () => this.setState({ palette: false }),
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
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 18px;border-radius:10px;border:0;font:inherit;font-size:14px;font-weight:500;cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 160ms ease,color 160ms ease,transform 140ms cubic-bezier(.23,1,.32,1)}
.btn:active{transform:scale(.97)}
.btn:focus-visible,button:focus-visible,a:focus-visible{outline:3px solid rgba(0,48,135,.45);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.ghost{background:rgba(0,48,135,.08);color:#003087}.ghost:hover{background:rgba(0,48,135,.15);color:#003087}
.onnavy{background:rgba(255,255,255,.1);color:#fff}.onnavy:hover{background:rgba(255,255,255,.18);color:#fff}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
.sk{border-radius:6px;background:linear-gradient(90deg,#eef2f7 0,#f7f9fc 40%,#eef2f7 80%);background-size:800px 100%;animation:shimmer 1.4s linear infinite}
@media (prefers-reduced-motion: reduce){.btn,.nav{transition:none}.btn:active{transform:none}.sk{animation:none}}

.cs{--bg:#eef2f7;--surface:#ffffff;--surface2:#f4f7fb;--line:#e2e8f0;--ink:#0f172a;--body:#475569;--muted:#64748b;--rail:#012169;--railink:#b7c6e0;--railicon:#7d94bf;--railhead:#7fd4f5;--railon:rgba(127,212,245,.16);--railhover:rgba(255,255,255,.06);--primary:#003087;--primaryhover:#002a77;--primaryink:#ffffff;--okbg:#e7f8f1;--okt:#047857;--warnbg:#fff4e0;--warnt:#b45309;--errbg:#ffece5;--errt:#c2410c;--track:#eef2f7;--series:#003087;--seriesfill:rgba(0,48,135,.08);--scrim:rgba(1,20,60,.36);--shadow:0 1px 2px rgba(15,23,42,.04),0 6px 18px -8px rgba(15,23,42,.10)}
.cs.dark{--bg:#0a1020;--surface:#111a2e;--surface2:#16213a;--line:#24324f;--ink:#e8eef8;--body:#aebbd2;--muted:#8a9bb8;--rail:#060b17;--railink:#a7b6d0;--railicon:#6c80a5;--railhead:#66c4eb;--railon:rgba(0,156,222,.18);--railhover:rgba(255,255,255,.05);--primary:#009cde;--primaryhover:#2eaee4;--primaryink:#04121f;--okbg:rgba(16,185,129,.14);--okt:#4ade9f;--warnbg:rgba(255,152,0,.14);--warnt:#fbbf24;--errbg:rgba(255,87,36,.16);--errt:#ff8a65;--track:#1d2944;--series:#66c4eb;--seriesfill:rgba(102,196,235,.10);--scrim:rgba(0,0,0,.55);--shadow:0 1px 2px rgba(0,0,0,.3),0 8px 24px -10px rgba(0,0,0,.5)}
.cs{color:var(--body)}
.nav{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:0 12px;border:0;border-radius:10px;background:transparent;color:var(--railink);font:inherit;font-size:14px;font-weight:500;text-align:left;cursor:pointer;transition:background-color 150ms ease,color 150ms ease}
.nav:hover{background:var(--railhover);color:#fff}
.nav.on{background:var(--railon);color:#fff}
.nav.sub{min-height:40px;padding-left:42px;font-size:13.5px}
.nav:focus-visible{outline:3px solid rgba(127,212,245,.6);outline-offset:-3px}
.chev{display:inline-flex;margin-left:auto;color:var(--railicon);transition:transform 160ms cubic-bezier(.23,1,.32,1)}
.chev.open{transform:rotate(90deg)}
.badge{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:20px;padding:0 6px;border-radius:999px;font-size:11px;font-weight:600;background:rgba(255,255,255,.12);color:#fff}
.badge.warn{background:#ff9800;color:#1a1204}.badge.err{background:#ff5724;color:#1c0a04}
.tb{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border:0;border-radius:10px;background:transparent;color:var(--body);cursor:pointer;transition:background-color 150ms ease}
.tb:hover{background:var(--surface2)}
.seg{display:inline-flex;padding:3px;border-radius:10px;background:var(--surface2);border:1px solid var(--line)}
.segb{min-height:36px;padding:0 14px;border:0;border-radius:8px;background:transparent;color:var(--body);font:inherit;font-size:13px;font-weight:500;cursor:pointer;transition:background-color 150ms ease,color 150ms ease}
.segb.on{background:var(--surface);color:var(--ink);box-shadow:0 1px 2px rgba(15,23,42,.12)}

.sp{transition:d 200ms cubic-bezier(.23,1,.32,1)}
.searchbtn{display:flex;align-items:center;gap:10px;width:440px;height:44px;padding:0 10px 0 14px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--muted);font:inherit;font-size:14px;cursor:pointer;text-align:left}
.searchbtn:hover{border-color:var(--muted)}
.kbd{margin-left:auto;display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:6px;border:1px solid var(--line);background:var(--surface2);font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--body)}
.pr{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:0 12px;border:0;border-radius:10px;background:transparent;font:inherit;font-size:14px;color:var(--ink);text-align:left;cursor:pointer}
.pr:hover,.pr.on{background:var(--surface2)}
.rowlink{color:var(--primary);font-size:13px;font-weight:600}
.rowlink:hover{color:var(--primaryhover)}
.btnp{background:var(--primary);color:var(--primaryink)}.btnp:hover{background:var(--primaryhover);color:var(--primaryink)}
.btng{background:var(--surface2);color:var(--ink);border:1px solid var(--line)}.btng:hover{border-color:var(--muted)}
.tone-good{color:var(--okt)}.tone-bad{color:var(--errt)}.tone-flat{color:var(--muted)}
@media (prefers-reduced-motion: reduce){.chev,.sp,.segb,.tb{transition:none}}


.cs{--bg:#f3f6fb;--side:#ffffff;--sideline:#e6ebf3;--sideink:#0f172a;--sidebody:#475569;--sidemuted:#64748b;--sidehover:#f4f7fb;--sideon:#eaf1ff;--sideonink:#003087;--iconbg:#eef3fb;--iconfg:#2e559d;--iconon:linear-gradient(145deg,#1f6fe0 0%,#003087 100%);--guide:#e2e8f0;--topbar:rgba(255,255,255,.86);--card:#ffffff;--cardline:#e8edf5}
.cs.dark{--bg:#0a1020;--side:#0c1426;--sideline:#1c2842;--sideink:#e8eef8;--sidebody:#aebbd2;--sidemuted:#8a9bb8;--sidehover:rgba(255,255,255,.04);--sideon:rgba(0,156,222,.16);--sideonink:#7fd4f5;--iconbg:rgba(255,255,255,.06);--iconfg:#9fb3d6;--iconon:linear-gradient(145deg,#2eaee4 0%,#0070a0 100%);--guide:#24324f;--topbar:rgba(17,26,46,.86);--card:#111a2e;--cardline:#22304d}
.side{position:absolute;left:0;top:0;bottom:0;width:272px;display:flex;flex-direction:column;background:var(--side);border-right:1px solid var(--sideline)}
.nav{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:0 10px;border:0;border-radius:12px;background:transparent;color:var(--sidebody);font:inherit;font-size:14px;font-weight:500;text-align:left;text-decoration:none;cursor:pointer;transition:background-color 150ms ease,color 150ms ease}
.nav:hover{background:var(--sidehover);color:var(--sideink)}
.nav:active{transform:scale(.99)}
.nav:focus-visible{outline:3px solid rgba(0,48,135,.35);outline-offset:-2px}
.navic{flex:none;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:10px;background:var(--iconbg);color:var(--iconfg);transition:background-color 150ms ease,color 150ms ease}
.nav.grp.open{color:var(--sideink);font-weight:600}
.nav.grp.open .navic,.nav.top.on .navic{background:var(--iconon);color:#fff;box-shadow:0 6px 14px -6px rgba(0,48,135,.55)}
.nav.top.on{color:var(--sideink);font-weight:600;background:var(--sidehover)}
.kids{position:relative;display:grid;gap:2px;margin:2px 0 8px 0;padding-left:44px}
.kids:before{content:"";position:absolute;left:25px;top:4px;bottom:4px;width:1.5px;border-radius:2px;background:var(--guide)}
.nav.sub{position:relative;min-height:38px;padding:0 10px;font-size:13.5px;border-radius:10px}
.nav.sub.on{background:var(--sideon);color:var(--sideonink);font-weight:600}
.nav.sub.on:before{content:"";position:absolute;left:-20px;top:9px;bottom:9px;width:3px;border-radius:3px;background:#003087}
.cs.dark .nav.sub.on:before{background:#2eaee4}
.chev{display:inline-flex;margin-left:auto;color:var(--sidemuted);transition:transform 160ms cubic-bezier(.23,1,.32,1)}
.chev.open{transform:rotate(90deg)}
.badge{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:20px;padding:0 7px;border-radius:999px;font-size:11px;font-weight:700;background:#eef2f7;color:#475569}
.badge.warn{background:#fff1d6;color:#9a4a00}.badge.err{background:#ffe3d9;color:#b3340e}
.cs.dark .badge{background:rgba(255,255,255,.08);color:#cbd5e1}.cs.dark .badge.warn{background:rgba(255,152,0,.18);color:#fbbf24}.cs.dark .badge.err{background:rgba(255,87,36,.2);color:#ff8a65}
.topbar{position:absolute;left:272px;right:0;top:0;height:64px;display:flex;align-items:center;gap:12px;padding:0 24px 0 28px;background:var(--topbar);backdrop-filter:saturate(160%) blur(12px);-webkit-backdrop-filter:saturate(160%) blur(12px);border-bottom:1px solid var(--sideline);z-index:3}
.crumbic{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:var(--iconbg);color:var(--iconfg)}
.searchbtn{width:400px;height:40px;border-radius:12px;background:var(--surface2);border:1px solid transparent}
.searchbtn:hover{border-color:var(--line);background:var(--surface)}
.tb{width:40px;height:40px;border-radius:12px}
.panel{background:var(--card);border:1px solid var(--cardline);border-radius:16px;box-shadow:0 1px 2px rgba(15,23,42,.04)}
.kpi{position:relative;display:flex;flex-direction:column;gap:4px;padding:14px 16px 12px;border-radius:16px;background:var(--card);border:1px solid var(--cardline);box-shadow:0 1px 2px rgba(15,23,42,.04);overflow:hidden}
.dpill{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;border-radius:999px;font-size:11.5px;font-weight:600;white-space:nowrap}
.d-good{background:#e7f8f1;color:#047857}.d-bad{background:#ffece5;color:#c2410c}.d-flat{background:transparent;color:var(--muted);padding:0}
.th{background:#f8fafc;border-bottom:1px solid var(--line)}
.cs.dark .th{background:rgba(255,255,255,.03)}
.statuscard{margin:0 14px 10px;padding:12px 14px;border-radius:14px;background:linear-gradient(160deg,#f5f9ff 0%,#eef4fd 100%);border:1px solid #e1eaf7}
.cs.dark .statuscard{background:rgba(255,255,255,.04);border-color:var(--sideline)}
.me{display:flex;align-items:center;gap:10px;margin:0 14px 14px;padding:10px;border-radius:14px;border:1px solid var(--sideline)}
@media (prefers-reduced-motion: reduce){.nav,.navic,.chev{transition:none}.nav:active{transform:none}}

.sidein{display:flex;flex-direction:column;height:min(100%,900px);min-height:0}
.cs{overflow-wrap:break-word}
.cs [style*="display:grid"] > *{min-width:0}
.pill{white-space:normal;height:auto;min-height:24px;padding:3px 9px;line-height:1.3;max-width:100%}
.dpill{white-space:normal;height:auto;min-height:22px;padding:3px 8px;line-height:1.35;max-width:100%}
.d-flat{padding:0}
.kl{font-size:12.5px;font-weight:500;color:var(--body);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.ell{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.nav{position:relative;min-height:38px}
.navlabel{margin:6px 10px 4px !important}
.sidemeta{padding-bottom:8px !important}
.nav.sub{min-height:34px}
.kids{margin:2px 0 4px 0}
.statuscard{padding:10px 12px}
.me{padding:8px 10px}
.sidehead{padding-top:14px !important}
.sidenav{flex-grow:1;display:flex;flex-direction:column;gap:2px;padding:0 12px 8px;overflow-y:auto;scrollbar-width:thin}
.navtxt{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.side{transition:width 220ms cubic-bezier(.23,1,.32,1)}
.topbar,.mainarea,.formbar{transition:left 220ms cubic-bezier(.23,1,.32,1)}
.sidetoggle{margin-left:auto;flex:none;color:var(--sidemuted)}
.logo-mini{display:none}
.cs.mini .side{width:76px}
.cs.mini .topbar{left:76px}
.cs.mini .mainarea{left:76px !important}
.cs.mini .navtxt,.cs.mini .chev,.cs.mini .kids,.cs.mini .sidemeta,.cs.mini .logo-full,.cs.mini .statustxt,.cs.mini .metxt,.cs.mini .mebtn,.cs.mini .navlabel{display:none !important}
.cs.mini .logo-mini{display:block}
.cs.mini .sidehead{flex-direction:column;align-items:center;padding:16px 0 10px;gap:10px}
.cs.mini .sidetoggle{margin-left:0}
.cs.mini .sidenav{padding:0 12px 8px}
.cs.mini .nav{justify-content:center;padding:0}
.cs.mini .nav .badge{position:absolute;top:5px;right:8px;min-width:9px;width:9px;height:9px;padding:0;font-size:0;border:2px solid var(--side);background:#ff9800}
.cs.mini .nav .badge.err{background:#ff5724}
.cs.mini .statuscard{margin:0 12px 10px;padding:12px 0;display:flex;justify-content:center}
.cs.mini .me{justify-content:center;margin:0 12px 12px;padding:8px 0}
@media (prefers-reduced-motion: reduce){.side,.topbar,.mainarea,.formbar{transition:none}}
.fcard{background:var(--card);border:1px solid var(--cardline);border-radius:16px;box-shadow:0 1px 2px rgba(15,23,42,.04);padding:4px 28px}
.fsec{display:grid;grid-template-columns:250px minmax(0,1fr);gap:32px;padding:24px 0}
.fsec + .fsec{border-top:1px solid var(--line)}
.fsh{font-size:15px;font-weight:600;color:var(--ink);margin:0}
.fsd{margin:6px 0 0;font-size:12.5px;line-height:1.55;color:var(--body)}
.fgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 18px}
.fld{display:flex;flex-direction:column;gap:6px;min-width:0}
.flab{font-size:13px;font-weight:600;color:var(--ink)}
.req{color:#c2410c;margin-left:2px}
.fhelp{font-size:12px;line-height:1.45;color:var(--muted)}
.ferr{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:#c2410c}
.in{width:100%;height:44px;padding:0 12px;border:1px solid #d5dde8;border-radius:10px;background:var(--surface);font:inherit;font-size:14px;color:var(--ink)}
textarea.in{height:auto;padding:10px 12px;line-height:1.5;resize:vertical}
select.in{padding-right:8px}
.in:focus,.affix:focus-within{outline:none;border-color:#003087;box-shadow:0 0 0 3px rgba(0,48,135,.15)}
.in.err,.affix.err{border-color:#ff5724;box-shadow:0 0 0 3px rgba(255,87,36,.12)}
.in.ok{border-color:#10b981}
.in[disabled]{background:var(--surface2);color:var(--muted)}
.affix{display:flex;align-items:stretch;height:44px;border:1px solid #d5dde8;border-radius:10px;overflow:hidden;background:var(--surface)}
.affix > span{display:flex;align-items:center;flex:none;padding:0 12px;background:var(--surface2);color:var(--body);font-size:13px}
.affix > span.pre{border-right:1px solid #d5dde8}.affix > span.post{border-left:1px solid #d5dde8}
.affix input{flex:1;min-width:0;border:0;padding:0 12px;font:inherit;font-size:14px;background:transparent;color:var(--ink);outline:none}
.sw{position:relative;display:inline-flex;flex:none;width:40px;height:24px;border-radius:99px;background:#cbd5e1}
.sw:after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:99px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform 160ms cubic-bezier(.23,1,.32,1)}
.sw.on{background:#003087}.sw.on:after{transform:translateX(16px)}
.swrow{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:12px 0}
.swrow + .swrow{border-top:1px solid var(--line)}
.rgrid{display:grid;gap:10px}
.rc{display:flex;gap:12px;align-items:flex-start;padding:14px;border:1px solid #d5dde8;border-radius:12px;background:var(--surface);min-width:0}
.rc.on{border-color:#003087;background:#f5f8ff;box-shadow:0 0 0 1px #003087}
.rc .rdot{margin-top:1px}
.rc.on .rdot{border:6px solid #003087}
.cb{flex:none;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:5px;border:2px solid #94a3b8;background:#fff}
.cb.on{background:#003087;border-color:#003087;color:#fff}
.cb.dis{background:var(--surface2);border-color:#cbd5e1}
.chk{display:flex;align-items:center;gap:10px;min-height:36px;font-size:13.5px;color:var(--ink);min-width:0}
.tagsel{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;border-radius:999px;border:1px solid #d5dde8;font-size:13px;color:var(--body);background:var(--surface)}
.tagsel.on{background:#003087;border-color:#003087;color:#fff;font-weight:600}
.formbar{position:absolute;left:0;right:0;bottom:0;height:72px;display:flex;align-items:center;gap:10px;padding:0 28px;background:rgba(255,255,255,.92);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-top:1px solid var(--line);z-index:3}
.note{padding:12px 14px;border-radius:12px;font-size:13px;line-height:1.55}
.n-info{background:#f2f5f9;color:var(--ink)}.n-warn{background:#fff4e0;color:#7a3e05}.n-err{background:#ffece5;color:#7c2d12}.n-ok{background:#e7f8f1;color:#065f46}
`;

// ---- markup ----

export default class ConsoleShellScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="ConsoleShell">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className={v.rootCls} style={{ width: "1440px", height: "900px", overflow: "hidden", position: "relative", background: "var(--bg)", fontFamily: "'Poppins',system-ui,sans-serif" }}>
          <aside className="side" aria-label="Console navigation">
            <div className="sidehead" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "18px 12px 6px 20px" }}>
              <span className="logo-full">
                {v.light ? (<>
                  <img src="/assets/62dadbbb3f365aebdd41bb9975f5931f.png" alt="GridCommerce" style={{ height: "28px", width: "auto", display: "block" }} />
                </>) : null}
                {v.dark ? (<>
                  <img src="/assets/2cdd11de6454f32fc6bb856d35bf4f3e.png" alt="GridCommerce" style={{ height: "28px", width: "auto", display: "block" }} />
                </>) : null}
              </span>
              <img className="logo-mini" src="/assets/9b6f9ad369f1cbde65271a968e6ba1f1.png" alt="GridCommerce" style={{ height: "32px", width: "auto" }} />
              <button className="tb sidetoggle" type="button" onClick={v.toggleSide} aria-label={v.sideLabel} title={v.sideLabel}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M9 3v18" />
                </svg>
              </button>
            </div>
            <div className="sidemeta" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 20px 12px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", height: "22px", padding: "0 8px", borderRadius: "6px", background: "var(--iconbg)", color: "var(--iconfg)", fontSize: "11px", fontWeight: "600", letterSpacing: ".06em", textTransform: "uppercase" }}>Console</span>
              <span className="ell" style={{ fontSize: "12px", color: "var(--sidemuted)" }}>Staff only · views logged</span>
            </div>
            <nav aria-label="Console" className="sidenav">
              <button className={v.overviewCls} type="button" onClick={v.pickOverview} aria-current={v.overviewCurrent}>
                <span className="navic">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
                  </svg>
                </span>
                <span className="navtxt">Overview</span>
              </button>
              <div className="navlabel" style={{ margin: "10px 10px 6px", fontSize: "10.5px", fontWeight: "700", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--sidemuted)" }}>Manage</div>
              <button className={v.g?.tenants?.hcls} type="button" onClick={v.g?.tenants?.toggle} title="Tenants" aria-expanded={v.g?.tenants?.expanded}>
                <span className="navic">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 9 4.5 4h15L21 9" />
                    <path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9Z" />
                    <path d="M5 12v9h14v-9" />
                  </svg>
                </span>
                <span className="navtxt">Tenants</span>
                <span className={v.g?.tenants?.chev}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </span>
              </button>
              {v.g?.tenants?.open ? (<>
                <div className="kids">
                  {__list(v.g?.tenants?.items).map((it, $index) => (<React.Fragment key={$index}>
                      <button className={it?.cls} type="button" onClick={it?.pick} aria-current={it?.current}>{it?.label}{it?.hasBadge ? (<>
  <span className={it?.badgeCls} aria-label={it?.badgeLabel}>{it?.badge}</span>
</>) : null}</button>
                    </React.Fragment>))}
                </div>
              </>) : null}
              <button className={v.g?.packaging?.hcls} type="button" onClick={v.g?.packaging?.toggle} title="Packaging" aria-expanded={v.g?.packaging?.expanded}>
                <span className="navic">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" />
                    <path d="m3 7 9 5 9-5M12 12v10" />
                  </svg>
                </span>
                <span className="navtxt">Packaging</span>
                <span className={v.g?.packaging?.chev}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </span>
              </button>
              {v.g?.packaging?.open ? (<>
                <div className="kids">
                  {__list(v.g?.packaging?.items).map((it, $index) => (<React.Fragment key={$index}>
                      <button className={it?.cls} type="button" onClick={it?.pick} aria-current={it?.current}>{it?.label}{it?.hasBadge ? (<>
  <span className={it?.badgeCls} aria-label={it?.badgeLabel}>{it?.badge}</span>
</>) : null}</button>
                    </React.Fragment>))}
                </div>
              </>) : null}
              <button className={v.g?.billing?.hcls} type="button" onClick={v.g?.billing?.toggle} title="Billing" aria-expanded={v.g?.billing?.expanded}>
                <span className="navic">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20M6 15h4" />
                  </svg>
                </span>
                <span className="navtxt">Billing</span>
                <span className={v.g?.billing?.chev}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </span>
              </button>
              {v.g?.billing?.open ? (<>
                <div className="kids">
                  {__list(v.g?.billing?.items).map((it, $index) => (<React.Fragment key={$index}>
                      <button className={it?.cls} type="button" onClick={it?.pick} aria-current={it?.current}>{it?.label}{it?.hasBadge ? (<>
  <span className={it?.badgeCls} aria-label={it?.badgeLabel}>{it?.badge}</span>
</>) : null}</button>
                    </React.Fragment>))}
                </div>
              </>) : null}
              <button className={v.g?.monitoring?.hcls} type="button" onClick={v.g?.monitoring?.toggle} title="Monitoring" aria-expanded={v.g?.monitoring?.expanded}>
                <span className="navic">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 12h4l3-8 4 16 3-8h4" />
                  </svg>
                </span>
                <span className="navtxt">Monitoring</span>
                <span className={v.g?.monitoring?.chev}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </span>
              </button>
              {v.g?.monitoring?.open ? (<>
                <div className="kids">
                  {__list(v.g?.monitoring?.items).map((it, $index) => (<React.Fragment key={$index}>
                      <button className={it?.cls} type="button" onClick={it?.pick} aria-current={it?.current}>{it?.label}{it?.hasBadge ? (<>
  <span className={it?.badgeCls} aria-label={it?.badgeLabel}>{it?.badge}</span>
</>) : null}</button>
                    </React.Fragment>))}
                </div>
              </>) : null}
              <button className={v.g?.support?.hcls} type="button" onClick={v.g?.support?.toggle} title="Support" aria-expanded={v.g?.support?.expanded}>
                <span className="navic">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
                    <path d="M21 14v3a2 2 0 0 1-2 2h-2v-7h4M3 14v3a2 2 0 0 0 2 2h2v-7H3" />
                  </svg>
                </span>
                <span className="navtxt">Support</span>
                <span className={v.g?.support?.chev}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </span>
              </button>
              {v.g?.support?.open ? (<>
                <div className="kids">
                  {__list(v.g?.support?.items).map((it, $index) => (<React.Fragment key={$index}>
                      <button className={it?.cls} type="button" onClick={it?.pick} aria-current={it?.current}>{it?.label}{it?.hasBadge ? (<>
  <span className={it?.badgeCls} aria-label={it?.badgeLabel}>{it?.badge}</span>
</>) : null}</button>
                    </React.Fragment>))}
                </div>
              </>) : null}
              <button className={v.g?.crm?.hcls} type="button" onClick={v.g?.crm?.toggle} title="Sales CRM" aria-expanded={v.g?.crm?.expanded}>
                <span className="navic">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
                  </svg>
                </span>
                <span className="navtxt">Sales CRM</span>
                <span className={v.g?.crm?.chev}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </span>
              </button>
              {v.g?.crm?.open ? (<>
                <div className="kids">
                  {__list(v.g?.crm?.items).map((it, $index) => (<React.Fragment key={$index}>
                      <button className={it?.cls} type="button" onClick={it?.pick} aria-current={it?.current}>{it?.label}{it?.hasBadge ? (<>
  <span className={it?.badgeCls} aria-label={it?.badgeLabel}>{it?.badge}</span>
</>) : null}</button>
                    </React.Fragment>))}
                </div>
              </>) : null}
              <button className={v.g?.operations?.hcls} type="button" onClick={v.g?.operations?.toggle} title="Operations" aria-expanded={v.g?.operations?.expanded}>
                <span className="navic">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
                  </svg>
                </span>
                <span className="navtxt">Operations</span>
                <span className={v.g?.operations?.chev}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </span>
              </button>
              {v.g?.operations?.open ? (<>
                <div className="kids">
                  {__list(v.g?.operations?.items).map((it, $index) => (<React.Fragment key={$index}>
                      <button className={it?.cls} type="button" onClick={it?.pick} aria-current={it?.current}>{it?.label}{it?.hasBadge ? (<>
  <span className={it?.badgeCls} aria-label={it?.badgeLabel}>{it?.badge}</span>
</>) : null}</button>
                    </React.Fragment>))}
                </div>
              </>) : null}
              <button className={v.g?.system?.hcls} type="button" onClick={v.g?.system?.toggle} title="System" aria-expanded={v.g?.system?.expanded}>
                <span className="navic">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                </span>
                <span className="navtxt">System</span>
                <span className={v.g?.system?.chev}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </span>
              </button>
              {v.g?.system?.open ? (<>
                <div className="kids">
                  {__list(v.g?.system?.items).map((it, $index) => (<React.Fragment key={$index}>
                      <button className={it?.cls} type="button" onClick={it?.pick} aria-current={it?.current}>{it?.label}{it?.hasBadge ? (<>
  <span className={it?.badgeCls} aria-label={it?.badgeLabel}>{it?.badge}</span>
</>) : null}</button>
                    </React.Fragment>))}
                </div>
              </>) : null}
            </nav>
            <__Link href="/ops-centre" className="statuscard" title="1 open incident" style={{ display: "block", color: "inherit", textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ flex: "none", width: "10px", height: "10px", borderRadius: "99px", background: "#ff9800", boxShadow: "0 0 0 3px rgba(255,152,0,.2)" }} />
                <span className="statustxt" style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--sideink)" }}>1 open incident</span>
                <span className="num statustxt" style={{ marginLeft: "auto", fontSize: "11.5px", color: "var(--sidemuted)" }}>99.96%</span>
              </div>
              <div className="statustxt ell" style={{ marginTop: "4px", fontSize: "12px", color: "var(--sidebody)" }}>Steadfast webhooks delayed · 38 stores</div>
            </__Link>
            <div className="me">
              <span style={{ position: "relative", display: "inline-flex", flex: "none" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "12px", background: "linear-gradient(145deg,#2eaee4,#003087)", color: "#fff", fontSize: "13px", fontWeight: "700" }}>FA</span>
                <span style={{ position: "absolute", right: "-2px", bottom: "-2px", width: "11px", height: "11px", borderRadius: "99px", background: "#10b981", border: "2px solid var(--side)" }} />
              </span>
              <div className="metxt" style={{ minWidth: "0" }}>
                <div className="ell" style={{ fontSize: "13px", fontWeight: "600", color: "var(--sideink)" }}>Farhana Akter</div>
                <div className="ell" style={{ fontSize: "11.5px", color: "var(--sidemuted)" }}>Support lead · 2FA on</div>
              </div>
              <__Link href="/staff-roles" className="tb mebtn" aria-label="Account and roles" style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--sidemuted)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
              </__Link>
            </div>
          </aside>
          <header className="topbar">
            <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", minWidth: "230px" }}>
              <span className="crumbic">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
                </svg>
              </span>
              <span style={{ color: "var(--muted)" }}>{v.crumbGroup}</span>
              <span style={{ color: "var(--muted)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </span>
              <span style={{ fontWeight: "600", color: "var(--ink)" }}>{v.crumbPage}</span>
            </nav>
            <button className="searchbtn" type="button" onClick={v.openPalette} aria-haspopup="dialog"><span style={{ display: "inline-flex" }}>
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
</span>Search stores, phones, invoices, leads<span className="kbd">Ctrl K</span></button>
            {" "}
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "8px", height: "30px", padding: "0 12px", borderRadius: "999px", background: "var(--okbg)", color: "var(--okt)", fontSize: "12px", fontWeight: "600" }}><span style={{ width: "7px", height: "7px", borderRadius: "9px", background: "#10b981", boxShadow: "0 0 0 3px rgba(16,185,129,.18)" }} />Production</span>
            {" "}
            <span className="num" style={{ fontSize: "12.5px", color: "var(--muted)", padding: "0 4px" }}>Sun 20 Sep · 14:32</span>
            {" "}
            <span style={{ width: "1px", height: "24px", background: "var(--line)" }} />
            {" "}
            <button className="tb" type="button" aria-label="Notifications, 3 unread" style={{ position: "relative" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10 21h4" />
              </svg>
              <span style={{ position: "absolute", top: "8px", right: "9px", width: "8px", height: "8px", borderRadius: "9px", background: "#ff5724", border: "2px solid var(--surface)" }} />
            </button>
            {" "}
            <button className="tb" type="button" onClick={v.toggleTheme} aria-label={v.themeLabel}>
              {v.dark ? (<>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              </>) : null}
              {v.light ? (<>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
                </svg>
              </>) : null}
            </button>
            {" "}
            <button className="tb" type="button" aria-label="Help and runbooks">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" />
              </svg>
            </button>
          </header>
          <main className="mainarea" style={{ position: "absolute", left: "272px", right: "0", top: "64px", bottom: "0", padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: "18px", overflow: "hidden" }}>
            {v.isOverview ? (<>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px" }}>
                <div>
                  <h1 style={{ margin: "0", fontSize: "24px", lineHeight: "1.2", fontWeight: "700", letterSpacing: "-.02em", color: "var(--ink)" }}>Overview</h1>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--muted)" }}>All 62 stores · refreshed 2 min ago</p>
                </div>
                <div className="seg" role="group" aria-label="Period">
                  {__list(v.ranges).map((r, $index) => (<React.Fragment key={$index}>
                      <button className={r?.cls} type="button" onClick={r?.pick} aria-pressed={r?.pressed}>{r?.label}</button>
                    </React.Fragment>))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "16px" }}>
                {__list(v.kpis).map((k, $index) => (<React.Fragment key={$index}>
                    <div className="kpi" style={{ gap: "6px", padding: "16px 18px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--body)" }}>{k?.label}</span>
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}>{v.rangeLabel}</span>
                      </div>
                      <div className="num" style={{ fontSize: "30px", lineHeight: "1.15", fontWeight: "700", letterSpacing: "-.02em", color: "var(--ink)" }}>{k?.value}</div>
                      <div className={k?.toneCls} style={{ fontSize: "12.5px", fontWeight: "600" }}>{k?.delta}</div>
                      <svg viewBox="0 0 200 36" width="100%" height="36" aria-hidden="true" preserveAspectRatio="none" style={{ display: "block", marginTop: "4px" }}>
                        <path className="sp" d={k?.area} fill="var(--seriesfill)" />
                        <path className="sp" d={k?.d} fill="none" stroke="var(--series)" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                      </svg>
                    </div>
                  </React.Fragment>))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2.1fr) minmax(0,1fr)", gap: "16px", minHeight: "0" }}>
                <section className="panel" aria-labelledby="na" style={{ overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px" }}>
                    <h2 id="na" style={{ margin: "0", fontSize: "16px", fontWeight: "600", color: "var(--ink)" }}>Needs attention today</h2>
                    <a className="rowlink" href="#">All 9 in Health and risk →</a>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1.6fr) 110px 110px 110px", gap: "12px", padding: "0 20px 8px", fontSize: "11px", fontWeight: "600", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)" }}>
                    <span>Store</span>
                    <span>Reason</span>
                    <span>Band</span>
                    <span>Owner</span>
                    <span style={{ textAlign: "right" }}>Next step</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1.6fr) 110px 110px 110px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 20px", borderTop: "1px solid var(--line)" }}>
                    <div style={{ minWidth: "0" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--ink)" }}>Dhaka Gadget Hub</div>
                      <div className="mono" style={{ color: "var(--muted)" }}>tenant 0031</div>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--body)" }}>Invoice unpaid · courier failing</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", color: "var(--errt)" }}><svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
  <rect x="4" y="4" width="12" height="12" fill="#ff5724" transform="rotate(45 10 10)" />
</svg>At risk</div>
                    <div style={{ fontSize: "13px", color: "var(--body)" }}>Farhana A.</div>
                    <a className="rowlink" href="#" style={{ textAlign: "right" }}>Call today →</a>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1.6fr) 110px 110px 110px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 20px", borderTop: "1px solid var(--line)" }}>
                    <div style={{ minWidth: "0" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--ink)" }}>Bindu Beauty</div>
                      <div className="mono" style={{ color: "var(--muted)" }}>tenant 0044</div>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--body)" }}>Read-only · no login 9 days</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", color: "var(--errt)" }}><svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
  <rect x="4" y="4" width="12" height="12" fill="#ff5724" transform="rotate(45 10 10)" />
</svg>At risk</div>
                    <div style={{ fontSize: "13px", color: "var(--body)" }}>Rakib H.</div>
                    <a className="rowlink" href="#" style={{ textAlign: "right" }}>Call today →</a>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1.6fr) 110px 110px 110px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 20px", borderTop: "1px solid var(--line)" }}>
                    <div style={{ minWidth: "0" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--ink)" }}>Nodi Organic</div>
                      <div className="mono" style={{ color: "var(--muted)" }}>tenant 0058</div>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--body)" }}>Setup stalled · no orders 6 days</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", color: "var(--warnt)" }}><svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
  <path d="M10,2 L18,17 L2,17 Z" fill="#ff9800" />
</svg>Watch</div>
                    <div style={{ fontSize: "13px", color: "var(--body)" }}>Unassigned</div>
                    <a className="rowlink" href="#" style={{ textAlign: "right" }}>Assign →</a>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1.6fr) 110px 110px 110px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 20px", borderTop: "1px solid var(--line)" }}>
                    <div style={{ minWidth: "0" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--ink)" }}>Shonali Crafts</div>
                      <div className="mono" style={{ color: "var(--muted)" }}>tenant 0017</div>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--body)" }}>82% of order limit</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", color: "var(--warnt)" }}><svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
  <path d="M10,2 L18,17 L2,17 Z" fill="#ff9800" />
</svg>Watch</div>
                    <div style={{ fontSize: "13px", color: "var(--body)" }}>Tania S.</div>
                    <a className="rowlink" href="#" style={{ textAlign: "right" }}>Offer upgrade →</a>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1.6fr) 110px 110px 110px", alignItems: "center", gap: "12px", minHeight: "52px", padding: "0 20px", borderTop: "1px solid var(--line)" }}>
                    <div style={{ minWidth: "0" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--ink)" }}>Kolpo Books</div>
                      <div className="mono" style={{ color: "var(--muted)" }}>tenant 0061</div>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--body)" }}>Trial day 12 · domain not verified</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", color: "var(--warnt)" }}><svg width="12" height="12" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
  <path d="M10,2 L18,17 L2,17 Z" fill="#ff9800" />
</svg>Watch</div>
                    <div style={{ fontSize: "13px", color: "var(--body)" }}>Tania S.</div>
                    <a className="rowlink" href="#" style={{ textAlign: "right" }}>Send guide →</a>
                  </div>
                </section>
                <section className="panel" aria-labelledby="pl" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h2 id="pl" style={{ margin: "0", fontSize: "16px", fontWeight: "600", color: "var(--ink)" }}>Platform</h2>
                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>30 days</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                    <span className="num" style={{ fontSize: "26px", fontWeight: "700", color: "var(--ink)" }}>99.96%</span>
                    <span style={{ fontSize: "12.5px", color: "var(--muted)" }}>uptime · target 99.9</span>
                  </div>
                  <div style={{ display: "flex", gap: "2px" }} aria-label="Uptime by day, one degraded day">
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#ff9800" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                    <span style={{ flex: "1", height: "32px", borderRadius: "2px", background: "#10b981" }} />
                  </div>
                  <div style={{ height: "1px", background: "var(--line)", margin: "4px 0" }} />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "36px", fontSize: "13px" }}>
                      <span style={{ display: "inline-flex" }}>
                        <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
                          <circle cx="10" cy="10" r="7" fill="#10b981" />
                        </svg>
                      </span>
                      <span style={{ color: "var(--ink)", fontWeight: "500" }}>Pathao</span>
                      <span style={{ marginLeft: "auto", color: "var(--okt)", fontWeight: "400" }}>Healthy</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "36px", fontSize: "13px" }}>
                      <span style={{ display: "inline-flex" }}>
                        <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
                          <rect x="4" y="4" width="12" height="12" fill="#ff5724" transform="rotate(45 10 10)" />
                        </svg>
                      </span>
                      <span style={{ color: "var(--ink)", fontWeight: "500" }}>Steadfast</span>
                      <span style={{ marginLeft: "auto", color: "var(--errt)", fontWeight: "600" }}>Failing since 09:40</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "36px", fontSize: "13px" }}>
                      <span style={{ display: "inline-flex" }}>
                        <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
                          <circle cx="10" cy="10" r="7" fill="#10b981" />
                        </svg>
                      </span>
                      <span style={{ color: "var(--ink)", fontWeight: "500" }}>bKash</span>
                      <span style={{ marginLeft: "auto", color: "var(--okt)", fontWeight: "400" }}>Healthy</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "36px", fontSize: "13px" }}>
                      <span style={{ display: "inline-flex" }}>
                        <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
                          <circle cx="10" cy="10" r="7" fill="#10b981" />
                        </svg>
                      </span>
                      <span style={{ color: "var(--ink)", fontWeight: "500" }}>Nagad</span>
                      <span style={{ marginLeft: "auto", color: "var(--okt)", fontWeight: "400" }}>Healthy</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minHeight: "36px", fontSize: "13px" }}>
                      <span style={{ display: "inline-flex" }}>
                        <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
                          <path d="M10,2 L18,17 L2,17 Z" fill="#ff9800" />
                        </svg>
                      </span>
                      <span style={{ color: "var(--ink)", fontWeight: "500" }}>Meta CAPI</span>
                      <span style={{ marginLeft: "auto", color: "var(--warnt)", fontWeight: "600" }}>Delayed events</span>
                    </div>
                  </div>
                </section>
              </div>
            </>) : null}
            {v.notOverview ? (<>
              <div>
                <h1 style={{ margin: "0", fontSize: "24px", lineHeight: "1.2", fontWeight: "700", letterSpacing: "-.02em", color: "var(--ink)" }}>{v.crumbPage}</h1>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--muted)" }}>{v.cur?.desc}</p>
              </div>
              <div className="panel" style={{ flexGrow: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", textAlign: "center", border: "2px dashed var(--line)", boxShadow: "none", background: "transparent" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "56px", height: "56px", borderRadius: "16px", background: "var(--surface)", color: "var(--primary)", boxShadow: "var(--shadow)" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" />
                    <path d="m3 7 9 5 9-5M12 12v10" />
                  </svg>
                </span>
                {v.cur?.noBoard ? (<>
                  <div style={{ fontSize: "12px", fontWeight: "600", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)" }}>Designed in step {v.cur?.step} · {v.cur?.stepName}</div>
                  <div style={{ maxWidth: "460px", fontSize: "15px", lineHeight: "1.6", color: "var(--body)" }}>This slot in the shell is reserved for the {v.crumbPage} screen. The shell, search, tenant context bar and states around it are final.</div>
                  <button className="btn btng" type="button" onClick={v.pickOverview}>Back to Overview</button>
                </>) : null}
                {v.cur?.hasBoard ? (<>
                  <div style={{ fontSize: "12px", fontWeight: "600", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)" }}>Built · full screen board</div>
                  <div style={{ maxWidth: "460px", fontSize: "15px", lineHeight: "1.6", color: "var(--body)" }}>The {v.crumbPage} screen is built as its own board, with the same shell. Open it to see and click through it.</div>
                  <__A className="btn btnp" href={v.cur?.href}>Open {v.crumbPage}</__A>
                </>) : null}
              </div>
            </>) : null}
          </main>
          {v.palette ? (<>
            <div style={{ position: "absolute", inset: "0", background: "var(--scrim)" }} />
            <div role="dialog" aria-modal="true" aria-label="Search the console" style={{ position: "absolute", left: "50%", top: "80px", width: "680px", marginLeft: "-204px", borderRadius: "16px", background: "var(--surface)", boxShadow: "0 24px 60px -16px rgba(0,0,0,.45)", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", height: "60px", padding: "0 16px 0 20px", borderBottom: "1px solid var(--line)" }}>
                <span style={{ display: "inline-flex", color: "var(--muted)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </span>
                <label style={{ flexGrow: "1" }}>
                  <span style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>Search</span>
                  <input type="search" defaultValue="dhaka" style={{ width: "100%", height: "44px", border: "0", outline: "0", background: "transparent", font: "inherit", fontSize: "16px", color: "var(--ink)" }} />
                </label>
                <button className="btn btng" type="button" onClick={v.closePalette} style={{ minHeight: "32px", padding: "0 10px", fontSize: "12px" }}>Esc</button>
              </div>
              <div style={{ padding: "10px 10px 6px" }}>
                <div style={{ padding: "6px 12px", fontSize: "11px", fontWeight: "600", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>Stores</div>
                <button className="pr on" type="button">
                  <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
                    <path d="M10,2 L18,17 L2,17 Z" fill="#ff9800" />
                  </svg>
                  <span style={{ fontWeight: "600" }}>Dhaka Gadget Hub</span>
                  <span className="mono" style={{ color: "var(--muted)" }}>tenant 0031 · dhakagadgethub.com.bd</span>
                  <span style={{ marginLeft: "auto", fontSize: "12px", fontWeight: "600", color: "var(--warnt)" }}>Grace · day 3</span>
                </button>
                {" "}
                <button className="pr" type="button">
                  <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: "none" }}>
                    <circle cx="10" cy="10" r="7" fill="#10b981" />
                  </svg>
                  <span style={{ fontWeight: "600" }}>Dhaka Shoe Corner</span>
                  <span className="mono" style={{ color: "var(--muted)" }}>tenant 0009 · dhakashoe.gridcommerce.com.bd</span>
                  <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--okt)" }}>Active</span>
                </button>
                <div style={{ padding: "10px 12px 6px", fontSize: "11px", fontWeight: "600", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>Invoices and payments</div>
                <button className="pr" type="button">
                  <span style={{ display: "inline-flex", color: "var(--muted)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20M6 15h4" />
                    </svg>
                  </span>
                  <span className="mono" style={{ color: "var(--ink)" }}>INV-2026-0912</span>
                  <span style={{ color: "var(--muted)", fontSize: "13px" }}>Dhaka Gadget Hub · ৳2,500 · unpaid since 17 Sep</span>
                </button>
                <div style={{ padding: "10px 12px 6px", fontSize: "11px", fontWeight: "600", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>Actions</div>
                <button className="pr" type="button"><span style={{ display: "inline-flex", color: "var(--muted)" }}>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10 21h4" />
  </svg>
</span>Compose a notice to Dhaka stores</button>
              </div>
              <div style={{ display: "flex", gap: "18px", padding: "12px 20px", borderTop: "1px solid var(--line)", fontSize: "12px", color: "var(--muted)" }}>
                <span><span className="kbd" style={{ margin: "0 4px 0 0" }}>↑↓</span>move</span>
                <span><span className="kbd" style={{ margin: "0 4px 0 0" }}>Enter</span>open</span>
                <span>Opens without animation: it is used many times a day.</span>
              </div>
            </div>
          </>) : null}
        </div>
      </div>
    );
  }
}
