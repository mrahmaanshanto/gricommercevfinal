/* <gc-sidebar> — framework-free twin of the design system's Sidebar component.
   Same markup, same gc-* classes, same behaviour (grouped links, collapsible group headers,
   count chips, drill-in sub-nav, collapse to a 76px rail). Used by every template so a
   template renders its nav without waiting on React or the compiled bundle.
   Renders into a shadow root so React templates never try to reconcile its children.
   Keep in step with components/navigation/Sidebar.jsx — that file is the source of truth. */
(() => {
  if (customElements.get('gc-sidebar')) return;
  const SELF = (document.currentScript && document.currentScript.src) || '';
  const asset = (f) => (SELF ? new URL('../../assets/' + f, SELF).href : '../../assets/' + f);
  // Mirror of the .gc-sidebar / .gc-navitem rules in css/surfaces.css. Inlined rather than
  // <link>ed so the panel is styled on first paint; tokens inherit from the document :root.
  const CSS = `*,*::before,*::after{box-sizing:border-box}
:host{display:contents}
.gc-sidebar{width:var(--sidebar-panel-width,280px);flex:none;display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--border-subtle,#e2e8f0);border-radius:var(--radius-2xl,16px);background:var(--surface-card,#fff);font-family:var(--font-sans,Poppins,ui-sans-serif,system-ui,sans-serif);transition:width .3s cubic-bezier(.4,0,.2,1)}
.gc-sidebar--collapsed{width:var(--main-sidebar-width,76px)}
.gc-sidebar--fill{height:100%}
.gc-sidebar--sticky{position:sticky;top:var(--shell-inset,12px);align-self:flex-start;height:calc(100vh - var(--shell-inset,12px)*2)}
.gc-sidebar__head{display:flex;height:var(--header-height,72px);flex:none;align-items:center;justify-content:space-between;gap:8px;padding:0 var(--nav-pad-x,12px) 0 20px}
.gc-sidebar--collapsed .gc-sidebar__head{justify-content:center;padding:0}
.gc-sidebar__body{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;padding:8px 8px 24px 12px}
.gc-sidebar__body::-webkit-scrollbar{width:6px}
.gc-sidebar__body::-webkit-scrollbar-track{background:transparent}
.gc-sidebar__body::-webkit-scrollbar-thumb{border-radius:9999px;background:var(--slate-300,#cbd5e1)}
.gc-sidebar__group+.gc-sidebar__group{margin-top:var(--nav-group-gap,28px)}
.gc-sidebar__grouphead{display:flex;width:100%;height:32px;align-items:center;justify-content:space-between;border:none;background:none;padding:0 10px;color:var(--text-muted,#94a3b8);font-family:inherit;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:color .2s cubic-bezier(0,0,.2,1)}
.gc-sidebar__grouphead:hover{color:var(--text-body,#475569)}
.gc-sidebar__items{display:flex;flex-direction:column;gap:var(--nav-row-gap,2px);margin-top:4px}
.gc-sidebar__eyebrow{margin:0;padding:16px 10px 4px;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted,#94a3b8)}
.gc-sidebar__back{display:inline-flex;height:36px;align-items:center;gap:6px;border:none;border-radius:9999px;background:var(--primary,#003087);padding:0 16px 0 12px;color:#fff;font-family:inherit;font-size:13px;font-weight:500;letter-spacing:.025em;cursor:pointer;transition:background .2s cubic-bezier(0,0,.2,1)}
.gc-sidebar__back:hover{background:var(--primary-focus,#002a77)}
.gc-sidebar__rule{margin:16px 10px;height:1px;background:var(--border-subtle,#e2e8f0);border:none}
.gc-navitem{display:flex;width:100%;height:var(--nav-row-height,40px);align-items:center;gap:12px;border:none;border-radius:var(--radius-xl,12px);background:none;padding:0 10px;color:var(--text-body,#475569);font-family:inherit;font-size:13px;font-weight:500;letter-spacing:.025em;text-align:left;text-decoration:none;cursor:pointer;transition:background-color .2s cubic-bezier(0,0,.2,1),color .2s cubic-bezier(0,0,.2,1)}
.gc-navitem:hover{background:var(--surface-subtle,#f1f5f9);color:var(--text-heading,#1e293b)}
.gc-navitem--active,.gc-navitem--active:hover{background:var(--fill-primary-soft,rgba(0,48,135,.1));color:var(--primary,#003087)}
.gc-navitem__icon{flex:none;display:grid;place-items:center;color:currentColor}
.gc-navitem__label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gc-navitem__chev{flex:none;display:grid;place-items:center;color:var(--text-muted,#94a3b8);transition:transform .2s cubic-bezier(0,0,.2,1)}
.gc-navitem--active .gc-navitem__chev{color:currentColor}
.gc-navitem__count{flex:none;display:inline-flex;min-width:24px;height:24px;align-items:center;justify-content:center;border-radius:9999px;background:var(--surface-subtle,#f1f5f9);padding:0 8px;font-size:12px;font-weight:500;color:var(--text-muted,#94a3b8);font-variant-numeric:tabular-nums}
.gc-navitem--active .gc-navitem__count{background:rgba(255,255,255,.65);color:var(--primary,#003087)}
.gc-sidebar--collapsed .gc-sidebar__body{padding-left:8px;padding-right:8px;scrollbar-width:none}
.gc-sidebar--collapsed .gc-sidebar__body::-webkit-scrollbar{display:none}
.gc-sidebar--collapsed .gc-navitem{justify-content:center;gap:0;padding:0}
.gc-sidebar--collapsed .gc-navitem__label,.gc-sidebar--collapsed .gc-navitem__chev,.gc-sidebar--collapsed .gc-navitem__count{display:none}
:host([theme="dark"]) .gc-sidebar{background:#222e45;border-color:#384766}
:host([theme="dark"]) .gc-navitem{color:#cbd5e1}
:host([theme="dark"]) .gc-navitem:hover{background:#313e59;color:#f1f5f9}
:host([theme="dark"]) .gc-navitem--active,:host([theme="dark"]) .gc-navitem--active:hover{background:#313e59;color:#7cd4fd}
:host([theme="dark"]) .gc-navitem__count{background:#26334d;color:#94a3b8}
:host([theme="dark"]) .gc-navitem--active .gc-navitem__count{background:#222e45;color:#7cd4fd}
:host([theme="dark"]) .gc-sidebar__grouphead{color:#7f8fb0}
:host([theme="dark"]) .gc-sidebar__grouphead:hover{color:#cbd5e1}
:host([theme="dark"]) .gc-sidebar__eyebrow{color:#7f8fb0}
:host([theme="dark"]) .gc-sidebar__rule{background:#384766}
:host([theme="dark"]) .gc-sidebar__back{background:#009cde}
:host([theme="dark"]) .gc-sidebar__back:hover{background:#0089c3}`;

  const NAV = [
    { label: 'General', items: [
      { id: 'home', icon: 'layout-dashboard', label: 'Home', to: 'merchant-overview/MerchantOverview.dc.html' },
      { id: 'gridai', icon: 'sparkles', label: 'GridAI', to: 'gridai/GridAI.dc.html' },
      { id: 'orders', icon: 'shopping-cart', label: 'Orders', to: 'merchant-orders/MerchantOrders.dc.html', children: [
        { id: 'orders-all', icon: 'inbox', label: 'All orders', count: 240, to: 'merchant-orders/MerchantOrders.dc.html' },
        { id: 'orders-pending', icon: 'clock', label: 'Pending', count: 18, to: 'merchant-orders/MerchantOrders.dc.html' },
        { id: 'orders-processing', icon: 'refresh-cw', label: 'Processing', count: 14, to: 'merchant-orders/MerchantOrders.dc.html' },
        { id: 'orders-shipped', icon: 'send', label: 'Shipped', count: 64, to: 'merchant-orders/MerchantOrders.dc.html' },
        { id: 'orders-transit', icon: 'truck', label: 'In transit', count: 9, to: 'merchant-orders/MerchantOrders.dc.html' },
        { id: 'orders-delivered', icon: 'package-check', label: 'Delivered', count: 158, to: 'order-detail/OrderDetail.dc.html' },
        { id: 'orders-returned', icon: 'undo-2', label: 'Returned', count: 6, to: 'merchant-orders/MerchantOrders.dc.html' },
        { id: 'orders-cancelled', icon: 'circle-x', label: 'Cancelled', count: 4, to: 'merchant-orders/MerchantOrders.dc.html' },
        { id: 'orders-ai', icon: 'phone-call', label: 'AI calls', count: 1, to: 'ai-call/AiCalls.dc.html' },
        { id: 'orders-carts', icon: 'shopping-bag', label: 'Abandoned carts', count: 31, to: 'recovery/AbandonedCarts.dc.html' },
      ] },
      { id: 'sales', icon: 'receipt-text', label: 'Sales', to: 'sales/SalesBook.dc.html', children: [
        { id: 'sales-new', icon: 'plus-circle', label: 'New sale', to: 'sales/NewSale.dc.html' },
        { id: 'sales-book', icon: 'book-open', label: 'Sales book', to: 'sales/SalesBook.dc.html' },
        { id: 'sales-wholesale', icon: 'file-text', label: 'Wholesale invoices', count: 3, to: 'sales/WholesaleInvoices.dc.html' },
        { id: 'sales-return', icon: 'undo-2', label: 'Return & exchange', to: 'sales/ReturnExchange.dc.html' }
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
      { id: 'pos', icon: 'scan-line', label: 'POS register', to: 'pos-register/PosRegister.dc.html' },
    ] },
    { label: 'Purchase', items: [
      { id: 'po-buy', icon: 'shopping-basket', label: 'Buy goods', to: 'purchase-stock/BuyGoods.dc.html' },
      { id: 'po-orders', icon: 'file-text', label: 'Purchase orders', count: 2, to: 'purchase-stock/PurchaseOrders.dc.html' },
      { id: 'po-receive', icon: 'truck', label: 'Receive goods', to: 'purchase-stock/ReceiveGoods.dc.html' },
      { id: 'po-requests', icon: 'clipboard-list', label: 'Requests', count: 4, to: 'purchase-stock/Requests.dc.html' },
      { id: 'po-suppliers', icon: 'wallet', label: 'Suppliers & payables', to: 'purchase-stock/Suppliers.dc.html' },
    ] },
    { label: 'Stocks & Inventory', items: [
      { id: 'stock-list', icon: 'boxes', label: 'Stock list', to: 'purchase-stock/Stock.dc.html' },
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
    { label: 'Tracking & analytics', items: [
      { id: 'ta-hub', icon: 'bar-chart-3', label: 'Analytics hub', to: 'tracking-analytics/AnalyticsHub.dc.html' },
      { id: 'ta-campaigns', icon: 'layers', label: 'Campaigns & creatives', to: 'tracking-analytics/Campaigns.dc.html' },
      { id: 'ta-products', icon: 'filter', label: 'Products & traffic', to: 'tracking-analytics/ProductsTraffic.dc.html' },
      { id: 'ta-attrib', icon: 'git-branch', label: 'Attribution & UTM', to: 'tracking-analytics/Attribution.dc.html' },
      { id: 'ta-reports', icon: 'bell-ring', label: 'Reports & alerts', count: 3, to: 'tracking-analytics/ReportsAlerts.dc.html' },
      { id: 'ta-track', icon: 'radar', label: 'Pixels & events', to: 'tracking-analytics/PixelsEvents.dc.html' },
      { id: 'ta-health', icon: 'activity', label: 'Event health', count: 3, to: 'tracking-analytics/EventHealth.dc.html' },
      { id: 'ta-conn', icon: 'plug', label: 'Connections', count: 2, to: 'tracking-analytics/Connections.dc.html' },
      { id: 'ta-setup', icon: 'list-checks', label: 'Setup guides', to: 'tracking-analytics/SetupGuide.dc.html' },
    ] },
    { label: 'Staff & HR', items: [
      { id: 'hr-home', icon: 'layout-grid', label: 'HR dashboard', to: 'staff-hr/HrDashboard.dc.html' },
      { id: 'hr-staff', icon: 'contact', label: 'All staff', count: 14, to: 'staff-hr/AllStaff.dc.html' },
      { id: 'hr-attendance', icon: 'calendar-check', label: 'Attendance', to: 'staff-hr/Attendance.dc.html' },
      { id: 'hr-shifts', icon: 'calendar-clock', label: 'Shifts & roster', to: 'staff-hr/Shifts.dc.html' },
      { id: 'hr-leave', icon: 'plane', label: 'Leave', count: 4, to: 'staff-hr/Leave.dc.html' },
      { id: 'hr-payroll', icon: 'banknote', label: 'Payroll', to: 'staff-hr/Payroll.dc.html' },
      { id: 'hr-loans', icon: 'hand-coins', label: 'Loans & advances', count: 1, to: 'staff-hr/LoansAdvances.dc.html' },
      { id: 'hr-setup', icon: 'settings-2', label: 'HR setup', to: 'staff-hr/HrSetup.dc.html' },
    ] },
    { label: 'Loyalty', items: [
      { id: 'loy-home', icon: 'gift', label: 'Loyalty & rewards', to: 'loyalty-promo/Loyalty.dc.html' },
      { id: 'loy-members', icon: 'crown', label: 'Members', to: 'loyalty-promo/Members.dc.html' },
      { id: 'loy-products', icon: 'star', label: 'Product points', to: 'loyalty-promo/ProductPoints.dc.html' },
      { id: 'loy-wallet', icon: 'wallet', label: 'Customer wallet', count: 5, to: 'loyalty-promo/Wallet.dc.html' },
      { id: 'loy-referrals', icon: 'share-2', label: 'Invite a friend', to: 'loyalty-promo/Referrals.dc.html' },
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
    { label: 'Accounts', items: [
      { id: 'acc-coa', icon: 'list-tree', label: 'Chart of accounts', to: 'accounts/ChartOfAccounts.dc.html' },
      { id: 'acc-gl', icon: 'book-open', label: 'Transactions', to: 'accounts/Transactions.dc.html' },
      { id: 'acc-journals', icon: 'notebook-pen', label: 'Journals', to: 'accounts/Journals.dc.html' },
      { id: 'acc-rec', icon: 'git-compare', label: 'Reconciliation', count: 2, to: 'accounts/Reconciliation.dc.html' },
      { id: 'acc-cashbook', icon: 'notebook', label: 'Cash book', to: 'accounts/CashBook.dc.html' },
      { id: 'acc-money', icon: 'arrow-down-up', label: 'Money in & out', to: 'accounts/MoneyInOut.dc.html' },
      { id: 'acc-vat', icon: 'percent', label: 'VAT', to: 'accounts/Vat.dc.html' },
      { id: 'acc-reports', icon: 'file-bar-chart', label: 'Reports', to: 'accounts/Reports.dc.html' },
      { id: 'acc-bank', icon: 'landmark', label: 'Banks', to: 'accounts/Banks.dc.html', children: [
        { id: 'acc-banks', icon: 'landmark', label: 'Banks', to: 'accounts/Banks.dc.html' },
        { id: 'acc-bankaccts', icon: 'credit-card', label: 'Bank accounts', to: 'accounts/BankAccounts.dc.html' },
        { id: 'acc-deposit', icon: 'piggy-bank', label: 'Bank deposits', to: 'accounts/BankDeposits.dc.html' }
      ] },
      { id: 'acc-mfs', icon: 'smartphone', label: 'Mobile banking', to: 'accounts/MfsAccounts.dc.html', children: [
        { id: 'acc-mfsprov', icon: 'building-2', label: 'Providers', to: 'accounts/MfsProviders.dc.html' },
        { id: 'acc-mfsacct', icon: 'smartphone', label: 'Accounts', to: 'accounts/MfsAccounts.dc.html' }
      ] },
      { id: 'acc-move', icon: 'arrow-left-right', label: 'Money movement', to: 'accounts/FundTransfers.dc.html', children: [
        { id: 'acc-transfer', icon: 'arrow-left-right', label: 'Fund transfers', to: 'accounts/FundTransfers.dc.html' },
        { id: 'acc-sessions', icon: 'monitor-check', label: 'Payment sessions', count: 2, to: 'accounts/PaymentSessions.dc.html' }
      ] },
      { id: 'acc-entries', icon: 'receipt', label: 'Entries', to: 'accounts/Expenses.dc.html', children: [
        { id: 'acc-expense', icon: 'receipt', label: 'Expenses', to: 'accounts/Expenses.dc.html' },
        { id: 'acc-invest', icon: 'trending-up', label: 'Investment', to: 'accounts/Investment.dc.html' },
        { id: 'acc-withdraw', icon: 'hand-coins', label: 'Owner withdraw', to: 'accounts/OwnerWithdraw.dc.html' },
        { id: 'acc-liab', icon: 'scale', label: 'Liability settlement', to: 'accounts/LiabilitySettlement.dc.html' },
        { id: 'acc-comm', icon: 'percent', label: 'Commissions', to: 'accounts/Commissions.dc.html' }
      ] }
    ] },
    { label: 'Communication', items: [
      { id: 'comm-cal', icon: 'calendar-days', label: 'Post calendar', to: 'communication/Calendar.dc.html' },
      { id: 'comm-new', icon: 'square-pen', label: 'Create post', to: 'communication/Composer.dc.html' },
      { id: 'comm-conn', icon: 'share-2', label: 'Connections', count: 1, to: 'communication/SocialConnections.dc.html' }
    ] },
    { label: 'Automation', items: [
      { id: 'auto-rules', icon: 'zap', label: 'Rules', to: 'automation/Automations.dc.html' },
      { id: 'auto-builder', icon: 'workflow', label: 'Workflow builder', to: 'automation/WorkflowBuilder.dc.html' },
      { id: 'auto-settings', icon: 'settings-2', label: 'Workflow settings', to: 'automation/WorkflowSettings.dc.html' }
    ] },
    { label: 'Management', items: [
      { id: 'inbox', icon: 'messages-square', label: 'Inbox', count: 12, to: 'merchant-inbox/MerchantInbox.dc.html' },
      { id: 'calls', icon: 'phone', label: 'Calls', to: 'merchant-calls/MerchantCalls.dc.html' },
      { id: 'tickets', icon: 'life-buoy', label: 'Support tickets', count: 5, to: 'support-tickets/SupportTickets.dc.html' },
      { id: 'team-report', icon: 'bar-chart-3', label: 'Team report', to: 'team-report/TeamReport.dc.html' },
      { id: 'storefront', icon: 'store', label: 'Storefront', children: [
        { id: 'storefront-pages', icon: 'layout-template', label: 'Landing pages', to: 'landing-page-builder/LandingPageBuilder.dc.html' },
        { id: 'storefront-wp', icon: 'refresh-cw', label: 'WordPress sync', to: 'integrations/WooSync.dc.html' },
        { id: 'storefront-blog', icon: 'newspaper', label: 'Blog posts', to: 'integrations/BlogPosts.dc.html' },
        { id: 'storefront-theme', icon: 'palette', label: 'Theme', to: 'landing-page-builder/LandingPageBuilder.dc.html' },
        { id: 'storefront-nav', icon: 'list', label: 'Navigation', to: 'landing-page-builder/LandingPageBuilder.dc.html' },
      ] },
      { id: 'settings', icon: 'settings', label: 'Settings', to: 'settings-console/SetGeneral.dc.html', children: [
        { id: 'set-store', icon: 'sliders-horizontal', label: 'Store settings', to: 'settings-console/SetGeneral.dc.html' },
        { id: 'set-all', icon: 'layout-grid', label: 'All settings at a glance', to: 'settings-console/SettingsConsole.dc.html' },
        { id: 'set-wallet', icon: 'wallet', label: 'Wallet & credits', to: 'billing/CreditWallet.dc.html' },
        { id: 'set-billing', icon: 'receipt', label: 'Subscription & billing', to: 'billing/Subscription.dc.html' },
        { id: 'set-help', icon: 'life-buoy', label: 'Help & support', count: 2, to: 'billing/HelpSupport.dc.html' }
      ] },
    ] },
  ];

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pascal = (n) => n.replace(/(^|-)([a-z0-9])/g, (m, a, b) => b.toUpperCase());

  // Build a Lucide glyph as inline SVG (createIcons() cannot reach into a shadow root).
  const glyph = (name, size) => {
    const lib = window.lucide && window.lucide.icons ? window.lucide.icons[pascal(name)] : null;
    let kids = [];
    if (lib) kids = Array.isArray(lib[0]) ? lib : (lib[2] || []);
    const body = kids.map(([tag, at]) => '<' + tag + ' ' + Object.keys(at || {}).map((k) => `${k}="${esc(at[k])}"`).join(' ') + '></' + tag + '>').join('');
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="flex:none;display:block">${body}</svg>`;
  };

  class GcSidebar extends HTMLElement {
    static get observedAttributes() { return ['active', 'base', 'collapsed', 'sticky', 'theme']; }
    connectedCallback() {
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.addEventListener('click', (e) => this.onClick(e));
      }
      this.drill = null;
      this.closed = {};
      const active = this.getAttribute('active') || '';
      for (const g of NAV) for (const it of g.items) {
        if (it.children && it.children.some((c) => c.id === active)) this.drill = it.id;
      }
      this.render();
      if (!window.lucide) this.waitForGlyphs();
    }
    attributeChangedCallback() { if (this.shadowRoot) this.render(); }
    get collapsed() { return this.hasAttribute('collapsed'); }
    waitForGlyphs(n) {
      if (window.lucide) return this.render();
      if ((n || 0) > 50) return;
      setTimeout(() => this.waitForGlyphs((n || 0) + 1), 100);
    }
    onClick(e) {
      const path = e.composedPath();
      const hit = (sel) => path.find((el) => el.matches && el.matches(sel));
      const drill = hit('[data-drill]'), back = hit('[data-back]'), group = hit('[data-group]'), toggle = hit('[data-toggle]');
      if (drill) { e.preventDefault(); if (this.collapsed) this.removeAttribute('collapsed'); else { this.drill = drill.dataset.drill; this.render(); } }
      else if (back) { e.preventDefault(); this.drill = null; this.render(); }
      else if (group) { e.preventDefault(); this.closed[group.dataset.group] = !this.closed[group.dataset.group]; this.render(); }
      else if (toggle) { e.preventDefault(); this.toggleAttribute('collapsed'); }
    }

    row(it, active, collapsed) {
      const cls = 'gc-navitem' + (active ? ' gc-navitem--active' : '');
      const base = this.getAttribute('base') || '../';
      const inner = `<span class="gc-navitem__icon">${glyph(it.icon, collapsed ? 20 : 18)}</span>`
        + (collapsed ? '' : `<span class="gc-navitem__label">${esc(it.label)}</span>`)
        + (!collapsed && it.count != null ? `<span class="gc-navitem__count">${it.count}</span>` : '')
        + (!collapsed && it.children ? `<span class="gc-navitem__chev">${glyph('chevron-right', 16)}</span>` : '');
      if (it.children) return `<button type="button" class="${cls}" title="${esc(it.label)}" data-drill="${it.id}">${inner}</button>`;
      return `<a class="${cls}" title="${esc(it.label)}" href="${it.to ? base + it.to : '#'}"${active ? ' aria-current="page"' : ''}>${inner}</a>`;
    }

    render() {
      const active = this.getAttribute('active') || '';
      const c = this.collapsed;
      const isOn = (it) => it.id === active || (it.children || []).some((x) => x.id === active);
      let body;
      if (c) {
        body = '<div class="gc-sidebar__items">'
          + `<button type="button" class="gc-navitem" data-toggle title="Expand sidebar"><span class="gc-navitem__icon">${glyph('panel-left-open', 20)}</span></button>`
          + NAV.map((g, i) => (i ? '<hr class="gc-sidebar__rule">' : '') + g.items.map((it) => this.row(it, isOn(it), true)).join('')).join('')
          + '</div>';
      } else if (this.drill) {
        const p = NAV.flatMap((g) => g.items).find((i) => i.id === this.drill);
        body = '<div>'
          + `<button type="button" class="gc-sidebar__back" data-back>${glyph('chevron-left', 16)} Back</button>`
          + `<p class="gc-sidebar__eyebrow">${esc(p.label)}</p><div class="gc-sidebar__items">`
          + (p.to ? this.row({ ...p, children: null }, p.id === active, false) : '')
          + p.children.map((x) => this.row(x, x.id === active, false)).join('')
          + '</div></div>';
      } else {
        body = NAV.map((g) => {
          const shut = !!this.closed[g.label];
          return `<div class="gc-sidebar__group"><button type="button" class="gc-sidebar__grouphead" data-group="${esc(g.label)}" aria-expanded="${!shut}"><span>${esc(g.label)}</span><span class="gc-navitem__chev" style="transform:${shut ? 'rotate(-90deg)' : 'none'}">${glyph('chevron-down', 16)}</span></button>`
            + (shut ? '' : `<div class="gc-sidebar__items">${g.items.map((it) => this.row(it, isOn(it), false)).join('')}</div>`)
            + '</div>';
        }).join('');
      }
      const logoHref = (this.getAttribute('base') || '../') + 'site-map/SiteMap.dc.html';
      const dark = this.getAttribute('theme') === 'dark';
      this.shadowRoot.innerHTML = `<style>${CSS}</style>
<aside class="gc-sidebar${c ? ' gc-sidebar--collapsed' : ''}${this.hasAttribute('sticky') ? ' gc-sidebar--sticky' : ''}${this.hasAttribute('fill') ? ' gc-sidebar--fill' : ''}">
<div class="gc-sidebar__head"><a href="${logoHref}" title="GridCommerce" style="display:flex;align-items:center;text-decoration:none">${c
        ? `<img src="/_blob/8c3babaf605936b39809e7960e7c846f" alt="GridCommerce" style="width:36px;height:36px;flex:none;object-fit:contain">`
        : `<img src="${dark ? '/_blob/820d4a69b45ed8fa40c9bc6015985c0e' : '/_blob/ff462bc6abaa5d30500a126b259de9d6'}" alt="GridCommerce" style="height:30px;width:auto;display:block">`}</a>${c ? '' : `<button type="button" data-toggle aria-label="Collapse sidebar" style="display:grid;place-items:center;width:34px;height:34px;flex:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:none;color:var(--text-muted);cursor:pointer">${glyph('panel-left-close', 17)}</button>`}</div>
<div class="gc-sidebar__body">${body}</div></aside>`;
    }
  }

  customElements.define('gc-sidebar', GcSidebar);
})();
