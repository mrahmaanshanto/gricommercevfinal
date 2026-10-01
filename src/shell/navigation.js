// The left menu: 12 groups, every item and sub-item, count badges and the screen each opens.
// `to` is the design file (templates/<folder>/<Page>.dc.html); routeOf() turns it into an app route.
// Shared by <gc-sidebar> and anything else that needs the menu (site map, search).
// `q` is an optional query string added to the route (for example the POS / Retail order filter).

import { ORDER_TOTAL } from '../lib/orderStatus';

export const NAV = [
  { label: 'General', items: [
    { id: 'home', icon: 'layout-dashboard', label: 'Home', to: 'merchant-overview/MerchantOverview.dc.html' },
    { id: 'orders', icon: 'shopping-cart', label: 'Orders', to: 'merchant-orders/MerchantOrders.dc.html', children: [
      { id: 'orders-all', icon: 'inbox', label: 'All orders', count: ORDER_TOTAL, to: 'merchant-orders/MerchantOrders.dc.html' },
      { id: 'orders-online', icon: 'globe', label: 'Online orders', to: 'merchant-orders/MerchantOrders.dc.html', q: 'channel=online' },
      { id: 'orders-pos', icon: 'store', label: 'Retail orders', to: 'merchant-orders/MerchantOrders.dc.html', q: 'channel=pos' },
      { id: 'orders-wholesale', icon: 'truck', label: 'Wholesale orders', to: 'sales/WholesaleOrders.dc.html' },
      { id: 'orders-rto', icon: 'package-x', label: 'Courier returns', to: 'merchant-orders/CourierReturns.dc.html' },
    ] },
    { id: 'sales', icon: 'receipt-text', label: 'Sales', to: 'sales/SalesInvoices.dc.html', children: [
      { id: 'sales-new', icon: 'plus-circle', label: 'New sale', to: 'pos-register/Pos.dc.html' },
      { id: 'sales-invoices', icon: 'file-text', label: 'Invoices', to: 'sales/SalesInvoices.dc.html' },
      { id: 'sales-return', icon: 'undo-2', label: 'Return & exchange', to: 'sales/ReturnExchange.dc.html' },
    ] },
    { id: 'products', icon: 'package', label: 'Products', to: 'products/AllProducts.dc.html', children: [
      { id: 'products-all', icon: 'package', label: 'All products', count: 412, to: 'products/AllProducts.dc.html' },
      { id: 'products-add', icon: 'package-plus', label: 'Add product', to: 'products/AddProduct.dc.html' },
      { id: 'products-cats', icon: 'folder-tree', label: 'Categories', to: 'products/Categories.dc.html' },
      { id: 'products-setup', icon: 'sliders-horizontal', label: 'Catalog setup', to: 'products/CatalogSetup.dc.html' },
      { id: 'products-collections', icon: 'layers', label: 'Collections', count: 18, to: 'products/Categories.dc.html' },
      { id: 'products-catalogue', icon: 'book-image', label: 'Customer catalogue', to: 'products/CustomerCatalogue.dc.html' },
      { id: 'products-inventory', icon: 'boxes', label: 'Inventory', to: 'purchase-stock/Stock.dc.html' },
      { id: 'products-low', icon: 'triangle-alert', label: 'Low stock', count: 7, to: 'purchase-stock/Stock.dc.html' },
      { id: 'products-barcodes', icon: 'scan-barcode', label: 'Barcodes', to: 'purchase-stock/BarcodeLabels.dc.html' },
      { id: 'products-media', icon: 'image', label: 'Media library', to: 'settings-console/SetMedia.dc.html' },
    ] },
    { id: 'customers', icon: 'users', label: 'Customers', to: 'customers-crm/AllCustomers.dc.html' },
    { id: 'pos', icon: 'scan-line', label: 'POS register', to: 'pos-register/Pos.dc.html', children: [
      { id: 'pos-register', icon: 'scan-line', label: 'Open register', to: 'pos-register/Pos.dc.html' },
      { id: 'pos-counters', icon: 'store', label: 'Counters', to: 'pos-register/PosManage.dc.html' },
      { id: 'pos-shifts', icon: 'users', label: 'Employees & shifts', to: 'pos-register/PosManage.dc.html', q: 'tab=shifts' },
      { id: 'pos-cash', icon: 'hand-coins', label: 'Cash pickups', to: 'pos-register/PosManage.dc.html', q: 'tab=cash' },
      { id: 'pos-settings', icon: 'settings', label: 'POS settings', to: 'pos-register/PosManage.dc.html', q: 'tab=settings' },
    ] },
  ] },
  { label: 'Purchase', items: [
    { id: 'po-orders', icon: 'file-text', label: 'Purchase orders', count: 2, to: 'purchase-stock/PurchaseOrders.dc.html' },
    { id: 'po-receive', icon: 'truck', label: 'Receive goods', to: 'purchase-stock/ReceiveGoods.dc.html' },
    { id: 'po-requests', icon: 'clipboard-list', label: 'Requests', count: 4, to: 'purchase-stock/Requests.dc.html' },
    { id: 'po-suppliers', icon: 'wallet', label: 'Suppliers & payables', to: 'purchase-stock/Suppliers.dc.html' },
  ] },
  { label: 'Stocks & Inventory', items: [
    { id: 'stock-list', icon: 'boxes', label: 'Stock list', to: 'purchase-stock/Stock.dc.html' },
    { id: 'stock-holds', icon: 'lock', label: 'Stock holds', to: 'purchase-stock/StockHolds.dc.html' },
    { id: 'stock-adjust', icon: 'sliders-horizontal', label: 'Stock adjustments', to: 'purchase-stock/StockAdjustments.dc.html' },
    { id: 'stock-count', icon: 'clipboard-check', label: 'Stock count', to: 'purchase-stock/StockCount.dc.html' },
    { id: 'stock-transfers', icon: 'arrow-left-right', label: 'Transfers', to: 'purchase-stock/Transfers.dc.html' },
    { id: 'stock-expiry', icon: 'calendar-x', label: 'Damaged & expired', count: 6, to: 'purchase-stock/ExpiryDisposal.dc.html' },
    { id: 'stock-wpol', icon: 'shield-check', label: 'Warranty policies', to: 'purchase-stock/WarrantyPolicies.dc.html' },
    { id: 'stock-wclaims', icon: 'wrench', label: 'Warranty claims', count: 5, to: 'purchase-stock/WarrantyClaims.dc.html' },
    { id: 'stock-wh', icon: 'warehouse', label: 'Warehouses', to: 'purchase-stock/Warehouses.dc.html' },
    { id: 'stock-branches', icon: 'store', label: 'Branches', to: 'purchase-stock/Branches.dc.html' },
    { id: 'stock-racks', icon: 'layout-grid', label: 'Racks & bins', to: 'purchase-stock/Racks.dc.html' },
    { id: 'stock-labels', icon: 'scan-barcode', label: 'Barcode labels', to: 'purchase-stock/BarcodeLabels.dc.html' },
  ] },
  { label: 'Accounts', items: [
    { id: 'acc-home', icon: 'layout-dashboard', label: 'Overview', to: 'accounts/AccountsHome.dc.html' },
    { id: 'acc-money', icon: 'wallet', label: 'Money', to: 'accounts/Money.dc.html' },
    { id: 'acc-settle', icon: 'hourglass', label: 'Settlements', to: 'accounts/Settlements.dc.html' },
    { id: 'acc-spend', icon: 'receipt', label: 'Income & expenses', to: 'accounts/ExpensesBills.dc.html' },
    { id: 'acc-dues', icon: 'scale', label: 'Dues', to: 'accounts/Dues.dc.html' },
    { id: 'acc-liab', icon: 'file-clock', label: 'Liabilities', to: 'accounts/Liabilities.dc.html' },
    { id: 'acc-setup', icon: 'sliders-horizontal', label: 'Setup', to: 'accounts/AccountSetup.dc.html' }
  ] },
  // Every report in one place (src/lib/reports/catalogue.js). Report pages from other areas live here too.
  { label: 'Reports', items: [
    { id: 'rep-all', icon: 'file-bar-chart', label: 'All reports', to: 'reports/ReportsCentre.dc.html', children: [
      { id: 'rep-sales', icon: 'chart-column', label: 'Sales', to: 'reports/ReportsCentre.dc.html', q: 'group=sales' },
      { id: 'rep-online', icon: 'truck', label: 'Online & delivery', to: 'reports/ReportsCentre.dc.html', q: 'group=online' },
      { id: 'rep-wholesale', icon: 'warehouse', label: 'Wholesale', to: 'reports/ReportsCentre.dc.html', q: 'group=wholesale' },
      { id: 'rep-customers', icon: 'users', label: 'Customers & loyalty', to: 'reports/ReportsCentre.dc.html', q: 'group=customers' },
      { id: 'rep-inventory', icon: 'boxes', label: 'Inventory', to: 'reports/ReportsCentre.dc.html', q: 'group=inventory' },
      { id: 'rep-purchase', icon: 'shopping-bag', label: 'Purchase & suppliers', to: 'reports/ReportsCentre.dc.html', q: 'group=purchase' },
      { id: 'rep-finance', icon: 'landmark', label: 'Finance', to: 'reports/ReportsCentre.dc.html', q: 'group=finance' },
      { id: 'rep-pos', icon: 'monitor-smartphone', label: 'POS', to: 'reports/ReportsCentre.dc.html', q: 'group=pos' },
      { id: 'rep-hr', icon: 'contact', label: 'Staff & HR', to: 'reports/ReportsCentre.dc.html', q: 'group=hr' },
      { id: 'rep-marketing', icon: 'megaphone', label: 'Marketing & support', to: 'reports/ReportsCentre.dc.html', q: 'group=marketing' },
    ] },
    { id: 'rep-daily', icon: 'sun', label: 'Daily summary', to: 'reports/DailySummary.dc.html' },
  ] },
  { label: 'Staff & HR', items: [
    { id: 'hr-home', icon: 'layout-grid', label: 'HR dashboard', to: 'staff-hr/HrDashboard.dc.html' },
    { id: 'hr-people', icon: 'contact', label: 'Staff', to: 'staff-hr/AllStaff.dc.html', children: [
      { id: 'hr-staff', icon: 'contact', label: 'All staff', to: 'staff-hr/AllStaff.dc.html' },
      { id: 'hr-add', icon: 'user-plus', label: 'Add staff', to: 'staff-profile/StaffCreate.dc.html' },
      { id: 'hr-positions', icon: 'network', label: 'Positions & grades', to: 'staff-hr/Positions.dc.html' },
      { id: 'hr-idcards', icon: 'id-card', label: 'ID cards & QR', to: 'staff-hr/IdCards.dc.html' },
    ] },
    { id: 'hr-time', icon: 'calendar-check', label: 'Time & attendance', to: 'staff-hr/Attendance.dc.html', children: [
      { id: 'hr-attendance', icon: 'calendar-check', label: 'Attendance', to: 'staff-hr/Attendance.dc.html' },
      { id: 'hr-shifts', icon: 'calendar-clock', label: 'Shifts & roster', to: 'staff-hr/Shifts.dc.html' },
      { id: 'hr-leave', icon: 'plane', label: 'Leave', to: 'staff-hr/Leave.dc.html' },
      { id: 'hr-devices', icon: 'fingerprint', label: 'Attendance devices', to: 'staff-hr/AttendanceDevices.dc.html' },
    ] },
    { id: 'hr-pay', icon: 'banknote', label: 'Pay', to: 'staff-hr/Payroll.dc.html', children: [
      { id: 'hr-payroll', icon: 'banknote', label: 'Payroll', to: 'staff-hr/Payroll.dc.html' },
      { id: 'hr-statements', icon: 'file-spreadsheet', label: 'Salary statements', to: 'staff-hr/SalaryStatements.dc.html' },
      { id: 'hr-changes', icon: 'trending-up', label: 'Increments & promotions', to: 'staff-hr/PayChanges.dc.html' },
      { id: 'hr-gratuity', icon: 'award', label: 'Gratuity & leaving', to: 'staff-hr/Gratuity.dc.html' },
      { id: 'hr-loans', icon: 'hand-coins', label: 'Loans & advances', to: 'staff-hr/LoansAdvances.dc.html' },
    ] },
    { id: 'hr-setup', icon: 'settings-2', label: 'HR setup', to: 'staff-hr/HrSetup.dc.html' },
  ] },
  { label: 'Promo', items: [
    { id: 'promo-home', icon: 'megaphone', label: 'Offers & promo', to: 'loyalty-promo/Promo.dc.html' },
    { id: 'promo-coupons', icon: 'ticket-percent', label: 'Discount codes', count: 4, to: 'loyalty-promo/Coupons.dc.html' },
    { id: 'promo-flash', icon: 'zap', label: 'Flash sales', to: 'loyalty-promo/FlashSales.dc.html' },
    { id: 'promo-page', icon: 'newspaper', label: 'Offers page (website)', to: 'storefront/Offers.dc.html' },
  ] },
  { label: 'Recovery', items: [
    { id: 'rec-carts', icon: 'shopping-bag', label: 'Abandoned carts', count: 31, to: 'recovery/AbandonedCarts.dc.html' },
    { id: 'rec-auto', icon: 'refresh-cw', label: 'Auto reminders', to: 'recovery/AutoReminders.dc.html' },
  ] },
  { label: 'Communication', items: [
    { id: 'comm-cal', icon: 'calendar-days', label: 'Post calendar', to: 'communication/Calendar.dc.html' },
    { id: 'comm-new', icon: 'square-pen', label: 'Create post', to: 'communication/Composer.dc.html' },
    { id: 'comm-conn', icon: 'share-2', label: 'Connections', count: 1, to: 'communication/SocialConnections.dc.html' },
    { id: 'comm-ai', icon: 'phone-call', label: 'AI calls', count: 1, to: 'ai-call/AiCalls.dc.html' },
  ] },
  { label: 'Management', items: [
    { id: 'inbox', icon: 'messages-square', label: 'Inbox', count: 12, to: 'merchant-inbox/MerchantInbox.dc.html' },
    { id: 'calls', icon: 'phone', label: 'Calls', to: 'merchant-calls/MerchantCalls.dc.html' },
    { id: 'tickets', icon: 'life-buoy', label: 'Support tickets', count: 5, to: 'support-tickets/SupportTickets.dc.html' },
    { id: 'storefront', icon: 'store', label: 'Storefront', children: [
      { id: 'storefront-pages', icon: 'layout-template', label: 'Landing pages', to: 'landing-page-builder/LandingPageBuilder.dc.html' },
      { id: 'storefront-wp', icon: 'refresh-cw', label: 'WordPress sync', to: 'integrations/WooSync.dc.html' },
      { id: 'storefront-theme', icon: 'palette', label: 'Theme', to: 'landing-page-builder/LandingPageBuilder.dc.html' },
      { id: 'storefront-nav', icon: 'list', label: 'Navigation', to: 'landing-page-builder/LandingPageBuilder.dc.html' },
    ] },
    { id: 'blog', icon: 'newspaper', label: 'Blog', to: 'integrations/BlogPosts.dc.html', children: [
      { id: 'blog-posts', icon: 'newspaper', label: 'Posts', to: 'integrations/BlogPosts.dc.html' },
      { id: 'blog-new', icon: 'square-pen', label: 'New post', to: 'integrations/BlogEditor.dc.html' },
      { id: 'blog-cats', icon: 'folder-tree', label: 'Categories', to: 'integrations/BlogCategories.dc.html' },
      { id: 'blog-authors', icon: 'user-pen', label: 'Authors', to: 'integrations/BlogAuthors.dc.html' },
    ] },
    { id: 'settings', icon: 'settings', label: 'Settings', to: 'settings-console/SetGeneral.dc.html', children: [
      { id: 'set-store', icon: 'sliders-horizontal', label: 'Store settings', to: 'settings-console/SetGeneral.dc.html' },
      { id: 'set-all', icon: 'layout-grid', label: 'All settings at a glance', to: 'settings-console/SettingsConsole.dc.html' },
      { id: 'set-wallet', icon: 'wallet', label: 'Wallet & credits', to: 'billing/CreditWallet.dc.html' },
      { id: 'set-billing', icon: 'receipt', label: 'Subscription & billing', to: 'billing/Subscription.dc.html' },
      { id: 'set-help', icon: 'life-buoy', label: 'Help & support', count: 2, to: 'billing/HelpSupport.dc.html' }
    ] },
  ] },
  { label: 'Automation', items: [
    { id: 'auto-rules', icon: 'zap', label: 'Rules', to: 'automation/Automations.dc.html' },
    { id: 'auto-builder', icon: 'workflow', label: 'Workflow builder', to: 'automation/WorkflowBuilder.dc.html' },
    { id: 'auto-settings', icon: 'settings-2', label: 'Workflow settings', to: 'automation/WorkflowSettings.dc.html' },
    { id: 'auto-reports', icon: 'calendar-clock', label: 'Scheduled reports', to: 'reports/ScheduledReports.dc.html' }
  ] },
  { label: 'Loyalty', items: [
    { id: 'loy-home', icon: 'gift', label: 'Loyalty & rewards', to: 'loyalty-promo/Loyalty.dc.html' },
    { id: 'loy-members', icon: 'crown', label: 'Members', to: 'loyalty-promo/Members.dc.html' },
    { id: 'loy-products', icon: 'star', label: 'Product points', to: 'loyalty-promo/ProductPoints.dc.html' },
    { id: 'loy-wallet', icon: 'wallet', label: 'Customer wallet', count: 5, to: 'loyalty-promo/Wallet.dc.html' },
    { id: 'loy-referrals', icon: 'share-2', label: 'Invite a friend', to: 'loyalty-promo/Referrals.dc.html' },
  ] },
  { label: 'Tracking & analytics', items: [
    { id: 'ta-track', icon: 'radar', label: 'Pixels & events', to: 'tracking-analytics/PixelsEvents.dc.html' },
    { id: 'ta-health', icon: 'activity', label: 'Event health', count: 3, to: 'tracking-analytics/EventHealth.dc.html' },
    { id: 'ta-conn', icon: 'plug', label: 'Connections', count: 2, to: 'tracking-analytics/Connections.dc.html' },
    { id: 'ta-setup', icon: 'list-checks', label: 'Setup guides', to: 'tracking-analytics/SetupGuide.dc.html' },
  ] },
];
