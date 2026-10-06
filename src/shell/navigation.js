// The left menu: business areas, each with its pages (Shopify's admin pattern, docs/reference-ux.md). The sidebar
// lists the areas; the open area (the one this page belongs to) lists its pages under it, and tapping an area opens
// its first page the role can open. `hidden` pages (create flows) are not listed: they light up the page named in
// `under`. `tab` is a shorter name for the page under its area. Records (an order, a staff profile) are not in the menu.
// `to` is the design file (templates/<folder>/<Page>.dc.html); routeOf() turns it into an app route.
// Shared by <gc-sidebar> and anything else that needs the menu (site map, search, Help).
// `q` is an optional query string added to the route (for example the POS / Retail order filter).
// Page ids never change: role access (lib/team.js), editions (lib/edition.js) and screens' `active` read them.


export const NAV = [
  { label: 'Commerce', items: [
    { id: 'area-home', icon: 'house', label: 'Home', children: [
      { id: 'home', icon: 'layout-dashboard', label: 'Dashboard', to: 'merchant-overview/MerchantOverview.dc.html' },
      { id: 'my-dash', icon: 'user-round', label: 'My dashboard', to: 'team/MyDashboard.dc.html', hidden: true, under: 'home' },   // opened from the person's card at the bottom of the menu
    ] },
    { id: 'area-inbox', icon: 'message-circle', label: 'Inbox', live: 'inbox', children: [
      { id: 'inbox', icon: 'message-circle', label: 'Chats', live: 'chats', to: 'merchant-inbox/MerchantInbox.dc.html' },
      { id: 'inbox-comments', icon: 'messages-square', label: 'Comments', live: 'comments', to: 'merchant-inbox/MerchantInbox.dc.html', q: 'view=comments' },
      { id: 'inbox-mentions', icon: 'at-sign', label: 'Mentions', live: 'mentions', to: 'merchant-inbox/MerchantInbox.dc.html', q: 'view=mentions' },
      { id: 'tickets', icon: 'life-buoy', label: 'Support tickets', tab: 'Tickets', count: 5, to: 'support-tickets/SupportTickets.dc.html' },
      { id: 'calls', icon: 'phone', label: 'Calls', to: 'merchant-calls/MerchantCalls.dc.html' },
      { id: 'comm-ai', icon: 'phone-call', label: 'AI calls', count: 1, to: 'ai-call/AiCalls.dc.html' },
    ] },
    // Grid AI: what the AI knows, how it behaves, testing it, approvals for risky actions and its activity log
    { id: 'area-gridai', icon: 'sparkles', label: 'Grid AI', children: [
      { id: 'ai-knowledge', icon: 'book-open', label: 'Knowledge', to: 'gridai/Knowledge.dc.html' },
      { id: 'ai-behaviour', icon: 'sliders-horizontal', label: 'Behaviour', to: 'gridai/Behaviour.dc.html' },
    ] },
    { id: 'area-orders', icon: 'shopping-cart', label: 'Orders', children: [
      { id: 'orders-all', icon: 'inbox', label: 'All orders', to: 'merchant-orders/MerchantOrders.dc.html' },
      { id: 'orders-wholesale', icon: 'truck', label: 'Wholesale orders', to: 'sales/WholesaleOrders.dc.html' },
      { id: 'sales-invoices', icon: 'file-text', label: 'Invoices', to: 'sales/SalesInvoices.dc.html' },
      { id: 'sales-return', icon: 'undo-2', label: 'Returns & exchanges', to: 'sales/ReturnExchange.dc.html' },
      { id: 'orders-rto', icon: 'package-x', label: 'Courier returns', to: 'merchant-orders/CourierReturns.dc.html' },
      { id: 'orders-courier', icon: 'truck', label: 'Courier statement', to: 'merchant-orders/CourierStatement.dc.html' },
      { id: 'orders-work', icon: 'list-checks', label: 'Order work', to: 'merchant-orders/OrderWork.dc.html' },
      { id: 'orders-settings', icon: 'sliders-horizontal', label: 'Order settings', to: 'merchant-orders/OrderSettings.dc.html' },
    ] },
    { id: 'area-products', icon: 'package', label: 'Products', children: [
      { id: 'products-all', icon: 'package', label: 'All products', count: 412, to: 'products/AllProducts.dc.html' },
      { id: 'products-add', icon: 'package-plus', label: 'Add product', to: 'products/AddProduct.dc.html' },
      { id: 'products-cats', icon: 'folder-tree', label: 'Categories', to: 'products/Categories.dc.html' },
      { id: 'products-brands', icon: 'tag', label: 'Brands', to: 'products/Brands.dc.html' },
      { id: 'products-setup', icon: 'sliders-horizontal', label: 'Catalog setup', to: 'products/CatalogSetup.dc.html' },
      { id: 'products-catalogue', icon: 'book-image', label: 'Customer catalogue', to: 'products/CustomerCatalogue.dc.html' },
      { id: 'products-media', icon: 'image', label: 'Media library', to: 'settings-console/SetMedia.dc.html' },
    ] },
    // Inventory: the stock pages of the menu before the areas (build 7c766c0), in its order, with its "More stock
    // tools" listed openly. Pages that share a `sub` fold into one row under the area (`subs`).
    { id: 'area-inventory', icon: 'boxes', label: 'Inventory', subs: {
      'stock-places': { label: 'Warehouses & branches' },
    }, children: [
      { id: 'stock-list', icon: 'boxes', label: 'Stock', to: 'purchase-stock/Stock.dc.html' },
      { id: 'stock-activity', icon: 'history', label: 'Stock activity', to: 'purchase-stock/StockActivity.dc.html', hidden: true, under: 'stock-list' },   // opened from Stock
      { id: 'po-buy', icon: 'shopping-bag', label: 'Purchases', to: 'purchase-stock/Purchases.dc.html' },
      { id: 'po-receive', icon: 'package-open', label: 'Receive goods', to: 'purchase-stock/ReceiveGoods.dc.html' },
      { id: 'stock-transfers', icon: 'arrow-left-right', label: 'Transfers', to: 'purchase-stock/Transfers.dc.html' },
      { id: 'po-orders', icon: 'clipboard-list', label: 'Purchase orders', count: 2, to: 'purchase-stock/PurchaseOrders.dc.html' },
      { id: 'po-suppliers', icon: 'truck', label: 'Suppliers', to: 'purchase-stock/Suppliers.dc.html' },
      { id: 'stock-adjust', icon: 'sliders-horizontal', label: 'Stock adjustments', to: 'purchase-stock/StockAdjustments.dc.html' },
      { id: 'stock-count', icon: 'clipboard-check', label: 'Stock count', to: 'purchase-stock/StockCount.dc.html' },
      { id: 'stock-holds', icon: 'lock', label: 'Stock holds', to: 'purchase-stock/StockHolds.dc.html' },
      { id: 'stock-expiry', icon: 'calendar-x', label: 'Damaged & expired', count: 6, to: 'purchase-stock/ExpiryDisposal.dc.html' },
      { id: 'po-requests', icon: 'clipboard-list', label: 'Purchase requests', count: 4, to: 'purchase-stock/Requests.dc.html' },
      { id: 'stock-labels', icon: 'scan-barcode', label: 'Barcode labels', to: 'purchase-stock/BarcodeLabels.dc.html' },
      { id: 'stock-wpol', icon: 'shield-check', label: 'Warranty policies', to: 'purchase-stock/WarrantyPolicies.dc.html' },
      { id: 'stock-wclaims', icon: 'wrench', label: 'Warranty claims', count: 5, to: 'purchase-stock/WarrantyClaims.dc.html' },
      { id: 'stock-wh', icon: 'warehouse', label: 'Warehouses', sub: 'stock-places', to: 'purchase-stock/Warehouses.dc.html' },
      { id: 'stock-branches', icon: 'store', label: 'Branches', sub: 'stock-places', to: 'purchase-stock/Branches.dc.html' },
      { id: 'stock-racks', icon: 'layout-grid', label: 'Racks & bins', sub: 'stock-places', to: 'purchase-stock/Racks.dc.html' },
    ] },
    { id: 'area-payments', icon: 'credit-card', label: 'Payments', children: [
      { id: 'acc-payments', icon: 'credit-card', label: 'Payment operations', tab: 'Operations', to: 'payments/PaymentOps.dc.html' },
      { id: 'acc-settle', icon: 'hourglass', label: 'Payouts', to: 'accounts/Settlements.dc.html' },
      { id: 'pay-setup', icon: 'sliders-horizontal', label: 'Payment setup', to: 'settings-console/SetPayments.dc.html' },
    ] },
    { id: 'area-customers', icon: 'users', label: 'Customers', children: [
      { id: 'customers', icon: 'users', label: 'All customers', to: 'customers-crm/AllCustomers.dc.html' },
      { id: 'leads', icon: 'target', label: 'Leads & follow-ups', to: 'team/SalesLeads.dc.html' },
      { id: 'meetings', icon: 'video', label: 'Meetings', live: 'meetings', to: 'customers-crm/Meetings.dc.html' },
      { id: 'cust-settings', icon: 'sliders-horizontal', label: 'Customer settings', tab: 'Settings', to: 'customers-crm/CustomerSettings.dc.html' },
    ] },
    { id: 'area-comms', icon: 'messages-square', label: 'Communications', children: [
      { id: 'comm-cal', icon: 'calendar-days', label: 'Social posts', to: 'communication/Calendar.dc.html' },
      { id: 'comm-new', icon: 'square-pen', label: 'Create post', to: 'communication/Composer.dc.html', hidden: true, under: 'comm-cal' },
      { id: 'msg-campaigns', icon: 'send', label: 'Campaigns', to: 'communication/CampaignsMessaging.dc.html' },
      { id: 'auto-rules', icon: 'zap', label: 'Automations', to: 'automation/Automations.dc.html' },
      { id: 'auto-builder', icon: 'workflow', label: 'Workflow builder', to: 'automation/WorkflowBuilder.dc.html' },
      { id: 'auto-settings', icon: 'settings-2', label: 'Communications settings', tab: 'Settings', to: 'automation/WorkflowSettings.dc.html' },
    ] },
    { id: 'area-finances', icon: 'wallet', label: 'Finances', children: [
      { id: 'acc-home', icon: 'layout-dashboard', label: 'Overview', to: 'accounts/AccountsHome.dc.html' },
      { id: 'acc-money', icon: 'wallet', label: 'Cash, bank & wallets', tab: 'Cash & bank', to: 'accounts/Money.dc.html' },
      { id: 'acc-spend', icon: 'receipt', label: 'Income & expenses', to: 'accounts/ExpensesBills.dc.html' },
      { id: 'acc-dues', icon: 'scale', label: 'Dues', to: 'accounts/Dues.dc.html' },
      { id: 'acc-liab', icon: 'file-clock', label: 'Bills to pay', to: 'accounts/Liabilities.dc.html' },
      { id: 'acc-approvals', icon: 'badge-check', label: 'Approvals', to: 'accounts/MoneyApprovals.dc.html' },
      { id: 'acc-match', icon: 'file-check-2', label: 'Match statements', to: 'accounts/StatementMatch.dc.html' },
      { id: 'acc-setup', icon: 'sliders-horizontal', label: 'Money setup', to: 'accounts/AccountSetup.dc.html' },
    ] },
    // every report in one place (src/lib/reports/catalogue.js); report groups are chips on the page
    { id: 'area-analytics', icon: 'chart-column', label: 'Analytics', children: [
      { id: 'rep-all', icon: 'file-bar-chart', label: 'Reports', to: 'reports/ReportsCentre.dc.html' },
      { id: 'rep-daily', icon: 'sun', label: 'Daily summary', to: 'reports/DailySummary.dc.html' },
      { id: 'auto-reports', icon: 'calendar-clock', label: 'Scheduled reports', to: 'reports/ScheduledReports.dc.html' },
      { id: 'ta-track', icon: 'radar', label: 'Pixels & events', to: 'tracking-analytics/PixelsEvents.dc.html' },
      { id: 'ta-health', icon: 'activity', label: 'Event health', count: 3, to: 'tracking-analytics/EventHealth.dc.html' },
      { id: 'ta-setup', icon: 'list-checks', label: 'Setup guides', to: 'tracking-analytics/SetupGuide.dc.html' },
    ] },
    { id: 'area-marketing', icon: 'megaphone', label: 'Marketing', children: [
      { id: 'promo-home', icon: 'megaphone', label: 'Offers', to: 'loyalty-promo/Promo.dc.html' },
      { id: 'promo-coupons', icon: 'ticket-percent', label: 'Coupons', count: 4, to: 'loyalty-promo/Coupons.dc.html' },
      { id: 'promo-flash', icon: 'zap', label: 'Flash sales', to: 'loyalty-promo/FlashSales.dc.html' },
      { id: 'loy-home', icon: 'gift', label: 'Loyalty & rewards', tab: 'Loyalty', to: 'loyalty-promo/Loyalty.dc.html' },
      { id: 'loy-members', icon: 'crown', label: 'Members', to: 'loyalty-promo/Members.dc.html' },
      { id: 'loy-products', icon: 'star', label: 'Product points', to: 'loyalty-promo/ProductPoints.dc.html' },
      { id: 'loy-wallet', icon: 'wallet', label: 'Store credit', to: 'loyalty-promo/Wallet.dc.html' },
      { id: 'loy-referrals', icon: 'share-2', label: 'Invite a friend', to: 'loyalty-promo/Referrals.dc.html' },
      { id: 'rec-carts', icon: 'shopping-bag', label: 'Abandoned carts', count: 31, to: 'recovery/AbandonedCarts.dc.html' },
      { id: 'rec-auto', icon: 'refresh-cw', label: 'Auto reminders', tab: 'Reminders', to: 'recovery/AutoReminders.dc.html' },
      { id: 'rec-offers', icon: 'sparkles', label: 'Smart offers', to: 'recovery/SmartOffers.dc.html' },
      { id: 'rec-audiences', icon: 'users-round', label: 'Ad audiences', to: 'recovery/AdAudiences.dc.html' },
      { id: 'ch-gbp', icon: 'map-pin', label: 'Google Business', to: 'channels/GoogleBusiness.dc.html' },
    ] },
    { id: 'area-store', icon: 'store', label: 'Online Store', children: [
      { id: 'storefront', icon: 'store', label: 'Online store', to: 'landing-page-builder/LandingPageBuilder.dc.html' },
      { id: 'promo-page', icon: 'newspaper', label: 'Offers page', to: 'storefront/Offers.dc.html' },
      { id: 'blog-posts', icon: 'newspaper', label: 'Blog posts', to: 'integrations/BlogPosts.dc.html' },
      { id: 'blog-new', icon: 'square-pen', label: 'New post', to: 'integrations/BlogEditor.dc.html', hidden: true, under: 'blog-posts' },
      { id: 'blog-cats', icon: 'folder-tree', label: 'Blog categories', to: 'integrations/BlogCategories.dc.html' },
      { id: 'blog-authors', icon: 'user-pen', label: 'Authors', to: 'integrations/BlogAuthors.dc.html' },
    ] },
    // Sales channels: product sync to Meta, Google Merchant Center, WooCommerce and Shopify (src/lib/channels.js).
    // Every connection is made in Settings › Connections.
    { id: 'area-channels', icon: 'radio-tower', label: 'Sales channels', children: [
      { id: 'ch-home', icon: 'radio-tower', label: 'Overview', to: 'channels/Channels.dc.html' },
      { id: 'ch-meta', icon: 'store', label: 'Meta Commerce', to: 'channels/MetaCommerce.dc.html' },
      { id: 'ch-gmc', icon: 'shopping-bag', label: 'Google Merchant Center', tab: 'Google Merchant', to: 'channels/GoogleMerchant.dc.html' },
      { id: 'ch-woo', icon: 'shopping-cart', label: 'WooCommerce', to: 'channels/WooCommerce.dc.html' },
      { id: 'ch-shopify', icon: 'shopping-bag', label: 'Shopify', to: 'channels/Shopify.dc.html' },
      { id: 'ch-issues', icon: 'triangle-alert', label: 'Sync issues', to: 'channels/SyncIssues.dc.html' },
      { id: 'ch-settings', icon: 'sliders-horizontal', label: 'Channel settings', to: 'channels/ChannelSettings.dc.html' },
    ] },
    { id: 'area-pos', icon: 'scan-line', label: 'POS', children: [
      { id: 'pos-register', icon: 'scan-line', label: 'New sale', to: 'pos-register/Pos.dc.html' },
      { id: 'pos-counters', icon: 'store', label: 'POS manage', to: 'pos-register/PosManage.dc.html' },
    ] },
  ] },
  { label: 'Team & settings', items: [
    { id: 'area-hr', icon: 'contact', label: 'Staff & HR', children: [
      { id: 'hr-home', icon: 'layout-grid', label: 'HR dashboard', tab: 'Dashboard', to: 'staff-hr/HrDashboard.dc.html' },
      { id: 'hr-staff', icon: 'contact', label: 'All staff', tab: 'Staff', to: 'staff-hr/AllStaff.dc.html' },
      { id: 'hr-add', icon: 'user-plus', label: 'Add staff', to: 'staff-profile/StaffCreate.dc.html', hidden: true, under: 'hr-staff' },
      { id: 'hr-attendance', icon: 'calendar-check', label: 'Attendance', to: 'staff-hr/Attendance.dc.html' },
      { id: 'hr-shifts', icon: 'calendar-clock', label: 'Shifts & roster', tab: 'Shifts', to: 'staff-hr/Shifts.dc.html' },
      { id: 'hr-leave', icon: 'plane', label: 'Leave', to: 'staff-hr/Leave.dc.html' },
      { id: 'hr-payroll', icon: 'banknote', label: 'Payroll', to: 'staff-hr/Payroll.dc.html' },
      { id: 'hr-statements', icon: 'file-spreadsheet', label: 'Salary statements', tab: 'Statements', to: 'staff-hr/SalaryStatements.dc.html' },
      { id: 'hr-changes', icon: 'trending-up', label: 'Increments & promotions', tab: 'Increments', to: 'staff-hr/PayChanges.dc.html' },
      { id: 'hr-loans', icon: 'hand-coins', label: 'Loans & advances', tab: 'Loans', to: 'staff-hr/LoansAdvances.dc.html' },
      { id: 'hr-gratuity', icon: 'award', label: 'Gratuity & leaving', tab: 'Gratuity', to: 'staff-hr/Gratuity.dc.html' },
      { id: 'hr-positions', icon: 'network', label: 'Positions & grades', tab: 'Positions', to: 'staff-hr/Positions.dc.html' },
      { id: 'hr-idcards', icon: 'id-card', label: 'ID cards & QR', tab: 'ID cards', to: 'staff-hr/IdCards.dc.html' },
      { id: 'hr-devices', icon: 'fingerprint', label: 'Attendance devices', tab: 'Devices', to: 'staff-hr/AttendanceDevices.dc.html' },
      { id: 'hr-setup', icon: 'settings-2', label: 'HR setup', tab: 'Setup', to: 'staff-hr/HrSetup.dc.html' },
    ] },
    { id: 'area-team', icon: 'list-checks', label: 'Team', children: [
      { id: 'tasks', icon: 'list-checks', label: 'Tasks', to: 'team/Tasks.dc.html' },
      { id: 'team-chat', icon: 'messages-square', label: 'Team chat', to: 'team/TeamChat.dc.html' },
    ] },
    // every outside app and service, connected from one place (src/lib/connections.js)
    { id: 'area-settings', icon: 'settings', label: 'Settings', children: [
      { id: 'set-store', icon: 'sliders-horizontal', label: 'Store settings', to: 'settings-console/SetGeneral.dc.html' },
      { id: 'connections', icon: 'plug', label: 'Connections', to: 'connections/Connections.dc.html' },
      { id: 'set-wallet', icon: 'wallet', label: 'Wallet & credits', to: 'billing/CreditWallet.dc.html' },
      { id: 'set-billing', icon: 'receipt', label: 'Subscription & billing', to: 'billing/Subscription.dc.html' },
      { id: 'set-help', icon: 'life-buoy', label: 'Help & support', count: 2, to: 'billing/HelpSupport.dc.html' },
    ] },
  ] },
];

/** Menu items that were merged into another one: screens may still pass these ids as `active`. */
export const NAV_ALIAS = {
  // connections now live in Connections; WordPress sync is the WooCommerce channel's settings
  'comm-conn': 'connections', 'ta-conn': 'connections', 'storefront-wp': 'ch-woo', 'storefront-pages': 'storefront',
  'orders-online': 'orders-all', 'orders-pos': 'orders-all', sales: 'sales-invoices', 'sales-new': 'pos-register', pos: 'pos-register',
  'pos-shifts': 'pos-counters', 'pos-cash': 'pos-counters', 'pos-settings': 'pos-counters',
  'products-collections': 'products-cats', 'products-inventory': 'stock-list', 'products-low': 'stock-list', 'products-barcodes': 'stock-labels',
  'rep-sales': 'rep-all', 'rep-online': 'rep-all', 'rep-wholesale': 'rep-all', 'rep-customers': 'rep-all', 'rep-inventory': 'rep-all',
  'rep-purchase': 'rep-all', 'rep-finance': 'rep-all', 'rep-pos': 'rep-all', 'rep-hr': 'rep-all', 'rep-marketing': 'rep-all',
  'storefront-theme': 'storefront-pages', 'storefront-nav': 'storefront-pages', 'set-all': 'set-store',
  // the old menu's parents (Oct 2026, areas with page tabs): each opens its first page
  orders: 'orders-all', products: 'products-all', 'stock-more': 'stock-adjust', 'stock-places': 'stock-wh',
  'hr-people': 'hr-staff', 'hr-time': 'hr-attendance', 'hr-pay': 'hr-payroll', 'promo-offers': 'promo-home', loyalty: 'loy-home',
  social: 'comm-cal', tracking: 'ta-track', blog: 'blog-posts', automation: 'auto-rules', settings: 'set-store',
};
