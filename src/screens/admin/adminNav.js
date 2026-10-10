// The super admin's menu (GridCommerce's own panel, /admin). Laid out like the merchant panel's menu: business areas
// with an icon tile, the open area lists its pages under it. Three layers share one menu: Platform (GridCommerce as a
// SaaS provider), Company (GridCommerce as a business) and Digital (the website and storefront themes), plus Admin.
//
// A page: { id, label, href, phase, how, from }
//   phase  the build step it belongs to (docs/super-admin-plan.md)        built  true once the page exists
//   how    'new' (no merchant screen fits) · 'reuse' (a merchant screen, retitled) · 'adapt' (a merchant screen + admin parts)
//   from   the merchant screen it starts from, when there is one
// A page that is not built yet opens /admin/<path> as a "Planned" page (Planned.jsx) that says what it will hold.
// Page ids never change; area ids are `area-*`. Who sees an area: src/lib/admin/access.js.

export const LAYERS = [
  { id: 'overview', label: 'Overview' },
  { id: 'platform', label: 'Platform' },
  { id: 'company', label: 'Company' },
  { id: 'digital', label: 'Digital' },
  { id: 'admin', label: 'Admin' },
];

const P = (id, label, href, phase, how, from, extra) => ({ id, label, href, phase, how, from: from || '', ...extra });

export const AREAS = [
  // ---- Overview ----
  { id: 'area-dashboard', layer: 'overview', label: 'Dashboard', icon: 'layout-dashboard', pages: [
    P('dashboard', 'Dashboard', '/admin', 1, 'new', 'Merchant Home (layout)', { built: true }),
  ] },
  { id: 'area-analytics', layer: 'overview', label: 'Analytics', icon: 'chart-column', pages: [
    P('analytics', 'Overview', '/admin/analytics', 8, 'adapt', '/reports-centre', { built: true }),
    P('analytics-website', 'Website', '/admin/analytics/website', 8, 'adapt', '/analytics-hub', { built: true }),
    P('analytics-growth', 'Sales & growth', '/admin/analytics/growth', 8, 'new', '', { built: true }),
    P('analytics-attribution', 'Attribution', '/admin/analytics/attribution', 8, 'adapt', '/attribution', { built: true }),
    P('analytics-usage', 'Usage', '/admin/analytics/usage', 8, 'new', '', { built: true }),
    P('reports', 'Reports', '/admin/reports', 8, 'adapt', '/reports-centre + /report', { built: true }),
  ] },

  // ---- Platform: GridCommerce as a SaaS provider ----
  { id: 'area-merchants', layer: 'platform', label: 'Merchants', icon: 'store', pages: [
    P('merchants', 'All merchants', '/admin/merchants', 2, 'new', 'Merchant Orders list (layout)', { built: true }),
    P('onboarding', 'Onboarding', '/admin/onboarding', 2, 'new', '', { built: true }),
  ] },
  { id: 'area-plans', layer: 'platform', label: 'Plans & modules', icon: 'boxes', pages: [
    P('subscriptions', 'Subscriptions', '/admin/subscriptions', 3, 'new', '', { built: true }),
    P('packages', 'Packages', '/admin/packages', 3, 'new', '', { built: true }),
    P('modules', 'Modules', '/admin/modules', 3, 'new', '', { built: true }),
    P('licences', 'Licences', '/admin/licences', 3, 'new', '', { built: true }),
  ] },
  { id: 'area-billing', layer: 'platform', label: 'Billing & credits', icon: 'receipt', pages: [
    P('invoices', 'Invoices', '/admin/invoices', 3, 'adapt', '/sales-invoices', { built: true }),
    P('collections', 'Collections', '/admin/collections', 3, 'new', '', { built: true }),
    P('credits', 'Credits & adjustments', '/admin/credits', 3, 'new', '', { built: true }),
  ] },
  // the Grid AI merchants use (lib/gridai/* in the merchant panel): what plans include, usage and credits, models and cost
  { id: 'area-merchant-ai', layer: 'platform', label: 'Merchant AI', icon: 'bot', pages: [
    P('mai-usage', 'Usage & credits', '/admin/merchant-ai', 6, 'adapt', '/ai-usage', { built: true }),
    P('mai-plans', 'AI plans & limits', '/admin/merchant-ai/plans', 6, 'adapt', '/ai-models', { built: true }),
    P('mai-models', 'Models & cost', '/admin/merchant-ai/models', 6, 'adapt', '/ai-models', { built: true }),
  ] },
  { id: 'area-ops', layer: 'platform', label: 'Platform ops', icon: 'server', pages: [
    P('servers', 'Servers', '/admin/servers', 13, 'new', '', { built: true }),
    P('apis', 'APIs', '/admin/apis', 13, 'new', '', { built: true }),
    P('integrations', 'Integrations', '/admin/integrations', 13, 'adapt', '/connections', { built: true }),
    P('limits', 'Resource limits', '/admin/limits', 13, 'new', '', { built: true }),
    P('incidents', 'Incidents', '/admin/incidents', 13, 'new', '', { built: true }),
  ] },

  // ---- Company: GridCommerce as a business ----
  { id: 'area-crm', layer: 'company', label: 'Sales & CRM', icon: 'handshake', pages: [
    P('leads', 'Leads', '/admin/leads', 4, 'reuse', '/sales-leads', { built: true }),
    P('pipeline', 'Pipeline', '/admin/pipeline', 4, 'adapt', '/sales-leads (board)', { built: true }),
    P('meetings', 'Meetings', '/admin/meetings', 4, 'reuse', '/meetings', { built: true }),
    P('tasks', 'Tasks', '/admin/tasks', 4, 'reuse', '/tasks', { built: true }),
  ] },
  { id: 'area-inbox', layer: 'company', label: 'Inbox', icon: 'inbox', pages: [
    P('inbox', 'Conversations', '/admin/inbox', 5, 'reuse', '/merchant-inbox', { built: true }),
    P('calls', 'Calls', '/admin/calls', 5, 'reuse', '/merchant-calls', { built: true }),
  ] },
  { id: 'area-comms', layer: 'company', label: 'Communications', icon: 'send', pages: [
    P('comms', 'Overview', '/admin/comms', 5, 'adapt', '/campaigns-messaging', { built: true }),
    P('sms', 'SMS', '/admin/sms', 5, 'adapt', '/campaigns-messaging', { built: true }),
    P('email', 'Email', '/admin/email', 5, 'adapt', '/campaigns-messaging', { built: true }),
    P('templates', 'Templates', '/admin/templates', 5, 'adapt', '/set-notifications (templates)', { built: true }),
    P('automations', 'Automations', '/admin/automations', 5, 'reuse', '/automations', { built: true }),
  ] },
  { id: 'area-support', layer: 'company', label: 'Support', icon: 'life-buoy', pages: [
    P('tickets', 'Tickets', '/admin/tickets', 6, 'adapt', '/support-tickets', { built: true }),
    P('support-performance', 'Performance', '/admin/support-performance', 6, 'new', '', { built: true }),
  ] },
  { id: 'area-gridai', layer: 'company', label: 'GridAI', icon: 'sparkles', pages: [
    P('ai-training', 'Training', '/admin/gridai', 6, 'reuse', '/ai-knowledge', { built: true }),
    P('ai-test', 'Test chat', '/admin/gridai/test', 6, 'new', '', { built: true }),
    P('ai-behaviour', 'Behaviour', '/admin/gridai/behaviour', 6, 'reuse', '/ai-behaviour', { built: true }),
    P('ai-performance', 'Performance', '/admin/gridai/performance', 6, 'new', '', { built: true }),
  ] },
  { id: 'area-marketing', layer: 'company', label: 'Marketing', icon: 'megaphone', pages: [
    P('marketing', 'Overview', '/admin/marketing', 7, 'new', '', { built: true }),
    P('campaigns', 'Campaigns', '/admin/campaigns', 7, 'adapt', '/campaigns', { built: true }),
    P('social', 'Social media', '/admin/social', 7, 'reuse', '/calendar + /composer', { built: true }),
    P('ads', 'Ads', '/admin/ads', 7, 'reuse', '/ad-accounts', { built: true }),
    P('affiliates', 'Affiliates', '/admin/affiliates', 7, 'adapt', '/referrals', { built: true }),
    P('utm', 'UTM links', '/admin/utm', 7, 'new', '', { built: true }),
    P('google-business', 'Google Business', '/admin/google-business', 8, 'reuse', '/google-business', { built: true }),
    P('promotions', 'Promotions', '/admin/promotions', 7, 'adapt', '/coupons', { built: true }),
  ] },
  { id: 'area-people', layer: 'company', label: 'People', icon: 'id-card', pages: [
    P('staff', 'Staff', '/admin/staff', 9, 'reuse', '/all-staff', { built: true }),
    P('attendance', 'Attendance', '/admin/attendance', 9, 'reuse', '/attendance', { built: true }),
    P('leave', 'Leave', '/admin/leave', 9, 'reuse', '/leave', { built: true }),
    P('payroll', 'Payroll', '/admin/payroll', 9, 'reuse', '/payroll', { built: true }),
    P('reviews', 'Performance', '/admin/reviews', 9, 'new', '', { built: true }),
  ] },
  { id: 'area-finance', layer: 'company', label: 'Finance', icon: 'landmark', pages: [
    P('finance', 'Overview', '/admin/finance', 12, 'adapt', '/accounts-home', { built: true }),
    P('revenue', 'Revenue', '/admin/revenue', 12, 'new', '', { built: true }),
    P('payments', 'Payments', '/admin/payments', 12, 'adapt', '/money', { built: true }),
    P('expenses', 'Expenses', '/admin/expenses', 12, 'adapt', '/expenses-bills', { built: true }),
    P('accounts', 'Accounts', '/admin/accounts', 12, 'adapt', '/money', { built: true }),
  ] },

  // ---- Digital: the website and storefront themes ----
  { id: 'area-website', layer: 'digital', label: 'Website', icon: 'globe', pages: [
    P('website', 'Overview', '/admin/website', 10, 'new', '', { built: true }),
    P('web-pages', 'Pages', '/admin/website/pages', 10, 'new', '', { built: true }),
    P('web-content', 'Content', '/admin/website/content', 10, 'new', '', { built: true }),
    P('web-blog', 'Blog', '/admin/website/blog', 10, 'reuse', '/blog-posts', { built: true }),
    P('web-media', 'Media', '/admin/website/media', 10, 'adapt', '/set-media', { built: true }),
    P('web-landing', 'Landing pages', '/admin/website/landing-pages', 10, 'adapt', '/landing-page-builder', { built: true }),
    P('web-forms', 'Forms', '/admin/website/forms', 10, 'new', '', { built: true }),
    P('web-seo', 'SEO', '/admin/website/seo', 10, 'adapt', '/set-seo', { built: true }),
  ] },
  { id: 'area-themes', layer: 'digital', label: 'Storefront themes', icon: 'palette', pages: [
    P('themes', 'Theme library', '/admin/themes', 11, 'new', '', { built: true }),
    P('theme-templates', 'Templates', '/admin/themes/templates', 11, 'new', '', { built: true }),
    P('theme-assign', 'Assignments', '/admin/themes/assignments', 11, 'new', '', { built: true }),
    P('theme-releases', 'Releases', '/admin/themes/releases', 11, 'new', '', { built: true }),
  ] },

  // ---- Admin ----
  { id: 'area-admin', layer: 'admin', label: 'Administration', icon: 'shield', pages: [
    P('activity', 'Activity log', '/admin/activity', 14, 'new', '', { built: true }),
    P('roles', 'Roles & permissions', '/admin/roles', 14, 'new', '', { built: true }),
    P('security', 'Security', '/admin/security', 14, 'new', '', { built: true }),
    P('settings', 'Settings', '/admin/settings', 14, 'new', '', { built: true }),
  ] },
];

export const PAGES = AREAS.flatMap((a) => a.pages.map((p) => ({ ...p, area: a.id, areaLabel: a.label })));
export const pageById = (id) => PAGES.find((p) => p.id === id) || null;
export const pageByPath = (path) => PAGES.find((p) => p.href === path) || null;
export const areaOf = (pageId) => AREAS.find((a) => a.pages.some((p) => p.id === pageId)) || null;

/** Records and forms that are not menu pages: each lights up the menu page it belongs to (ALIAS). */
export const RECORDS = [
  { id: 'merchant', label: 'Merchant profile', href: '/admin/merchant', phase: 2, how: 'new', from: '', area: 'area-merchants', under: 'merchants', built: true },
  { id: 'merchant-new', label: 'New merchant', href: '/admin/merchants/new', phase: 2, how: 'new', from: '', area: 'area-merchants', under: 'merchants', built: true },
];
export const ALIAS = Object.fromEntries(RECORDS.map((r) => [r.id, r.under]));

export const PHASES = [
  [1, 'Shell and dashboard'], [2, 'Merchants'], [3, 'Plans, modules, billing'], [4, 'Sales & CRM'], [5, 'Inbox and communications'],
  [6, 'Support and GridAI'], [7, 'Marketing'], [8, 'Analytics and Google Business'], [9, 'People'], [10, 'Website'],
  [11, 'Storefront themes'], [12, 'Finance'], [13, 'Platform ops'], [14, 'Administration'], [15, 'UI/UX audit'],
];
