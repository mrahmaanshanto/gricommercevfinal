// settingsRegistry — every setting in one list, for the settings search (Nayeem's brief #16: "Settings Search should
// answer 'where is this configured?' even when Settings does not own the rule").
// An entry: { id, label, page, href, owner, group, permission, plan, aliases, field? }
//   page / href   the page that holds it; with `field`, the address opens the page with that field highlighted (?focus=)
//   owner         who owns the rule (Settings, or the area it was moved to: Communications, Analytics, Finance …)
//   permission    the menu item a person needs (lib/team.js › canSee); plan = the module the plan must include
//                 (lib/plans.js › entitled; lib/edition.js › hasModule)
// searchSettings(q, { user }) → the entries that match, best first, without the ones the person can't open.
//
// FIELDS is generated from the settings forms (formId → [[field, label]]): keep it in step when a form gains a field.

import { hasModule } from './edition';
import { entitled } from './plans';
import { currentUser, canSee } from './team';

/** formId → [[field name, label]] (from screens/settings-console/Set*.jsx › fields). */
const FIELDS = {
  ai: [['enable_ai_auto_reply', 'Enable AI auto-reply'], ['website_chat_widget', 'Website chat widget'], ['whatsapp_cloud_api', 'WhatsApp Cloud API'], ['facebook_messenger', 'Facebook Messenger'], ['provider', 'Provider'], ['anthropic_api_key', 'Anthropic API key'], ['model', 'Model'], ['custom_api_key', 'Custom provider API key'], ['custom_base_url', 'Custom provider base URL'], ['custom_model_name', 'Model name'], ['custom_price_in', 'Price / 1M input'], ['custom_price_out', 'Price / 1M output'], ['monthly_budget_cap', 'Monthly budget cap'], ['when_the_cap_is_reached', 'When the cap is reached'], ['office_hours', 'Office hours'], ['office_hours_to', 'Office hours (to)'], ['escalation', 'Escalation']],
  delivery: [['show_the_shipment_modal_on_status_change', 'Show the shipment modal on status change'], ['online_orders_ship_from', 'Online orders ship from'], ['default_shipping_partner', 'Default shipping partner'], ['inside_dhaka_delivery_charge', 'Inside Dhaka: Delivery charge'], ['inside_dhaka_extra_per_unit', 'Inside Dhaka: Extra per unit'], ['inside_dhaka_courier_cost', 'Inside Dhaka: Courier cost'], ['inside_dhaka_courier_extra', 'Inside Dhaka: Courier extra'], ['inside_dhaka_delivery_time', 'Inside Dhaka: Delivery time (from)'], ['inside_dhaka_delivery_time_to', 'Inside Dhaka: Delivery time (to)'], ['inside_dhaka_delivery_time_unit', 'Inside Dhaka: Delivery time (unit)'], ['sub_dhaka_delivery_charge', 'Sub-Dhaka: Delivery charge'], ['sub_dhaka_extra_per_unit', 'Sub-Dhaka: Extra per unit'], ['sub_dhaka_courier_cost', 'Sub-Dhaka: Courier cost'], ['sub_dhaka_courier_extra', 'Sub-Dhaka: Courier extra'], ['sub_dhaka_delivery_time', 'Sub-Dhaka: Delivery time (from)'], ['sub_dhaka_delivery_time_to', 'Sub-Dhaka: Delivery time (to)'], ['sub_dhaka_delivery_time_unit', 'Sub-Dhaka: Delivery time (unit)'], ['outside_dhaka_delivery_charge', 'Outside Dhaka: Delivery charge'], ['outside_dhaka_extra_per_unit', 'Outside Dhaka: Extra per unit'], ['outside_dhaka_courier_cost', 'Outside Dhaka: Courier cost'], ['outside_dhaka_courier_extra', 'Outside Dhaka: Courier extra'], ['outside_dhaka_delivery_time', 'Outside Dhaka: Delivery time (from)'], ['outside_dhaka_delivery_time_to', 'Outside Dhaka: Delivery time (to)'], ['outside_dhaka_delivery_time_unit', 'Outside Dhaka: Delivery time (unit)']],
  general: [['store_name', 'Store name'], ['copyright_line', 'Copyright line'], ['footer_about', 'Footer about'], ['currency', 'Currency'], ['default_country', 'Default country'], ['timezone', 'Timezone'], ['date_format', 'Date format'], ['time_format', 'Time format'], ['rows_per_page', 'Rows per page'], ['support_phone', 'Support phone'], ['support_email', 'Support email'], ['working_hours_text', 'Working hours text'], ['store_address', 'Store address'], ['support_line_hours', 'Support line hours'], ['support_line_hours_to', 'Support line hours (to)'], ['service_window', 'Service window'], ['service_window_to', 'Service window (to)'], ['brand_color', 'Brand colour'], ['brand_accent', 'Accent colour'], ['legal_name', 'Legal name'], ['business_type', 'Business type'], ['trade_licence', 'Trade licence'], ['bin', 'BIN (VAT registration)'], ['tin', 'TIN'], ['registered_address', 'Registered address'], ['billing_name', 'Billing name'], ['billing_address', 'Billing address'], ['billing_tax_id', 'Tax ID on bills'], ['billing_email', 'Invoice email'], ['map_embed', 'Google Maps embed code']],
  media: [['asset_light', 'Light theme logo'], ['asset_dark', 'Dark theme logo'], ['asset_favicon', 'Favicon'], ['asset_fallback', 'Fallback image'], ['asset_payment', 'Payment gateway image'], ['asset_delivery', 'Delivery partner image'], ['asset_verified', 'Verified badge image'], ['asset_licences', 'Licences image']],
  payments: [['cash_on_delivery', 'Cash on delivery'], ['sslcommerz', 'SSLCommerz'], ['eps', 'EPS'], ['nagad', 'Nagad'], ['bkash', 'bKash'], ['force_full_payment', 'Force full payment'], ['payment_discount', 'Payment discount'], ['stripe', 'Stripe'], ['paypal', 'PayPal'], ['bkash_send_money', 'bKash send money'], ['rocket_send_money', 'Rocket send money'], ['bank_transfer', 'Bank transfer'], ['bkash_mode', 'bKash mode'], ['bkash_app_key', 'App key'], ['bkash_username', 'Username'], ['bkash_password', 'Password'], ['bkash_merchant_number', 'Merchant number'], ['bkash_checkout_label', 'Checkout label'], ['priority', 'Priority'], ['min_order_amount', 'Min order amount'], ['max_order_amount', 'Max order amount'], ['fixed_advance_amount', 'Fixed advance amount'], ['advance_percentage', 'Advance percentage'], ['discount_type', 'Discount type'], ['discount_value', 'Discount value'], ['maximum_discount', 'Maximum discount'], ['minimum_order', 'Minimum order'], ['rate_usd', 'US Dollar rate in ৳'], ['rate_eur', 'Euro rate in ৳'], ['rate_gbp', 'Pound Sterling rate in ৳'], ['rate_inr', 'Indian Rupee rate in ৳'], ['offline_bkash_number', 'bKash send money number'], ['offline_rocket_number', 'Rocket send money number'], ['offline_bank_account', 'Bank transfer account number'], ['mode_full_payment', 'Full payment'], ['mode_delivery_charge_only', 'Delivery charge only'], ['mode_fixed_advance', 'Fixed advance'], ['mode_percentage_advance', 'Percentage advance'], ['mode_required_prepay', 'Required prepay (per product)'], ['inside_dhaka_full_payment', 'Inside Dhaka: Full payment'], ['inside_dhaka_delivery_charge_only', 'Inside Dhaka: Delivery charge only'], ['inside_dhaka_fixed_advance', 'Inside Dhaka: Fixed advance'], ['inside_dhaka_percentage_advance', 'Inside Dhaka: Percentage advance'], ['inside_dhaka_required_prepay', 'Inside Dhaka: Required prepay (per product)'], ['outside_dhaka_full_payment', 'Outside Dhaka: Full payment'], ['outside_dhaka_delivery_charge_only', 'Outside Dhaka: Delivery charge only'], ['outside_dhaka_fixed_advance', 'Outside Dhaka: Fixed advance'], ['outside_dhaka_percentage_advance', 'Outside Dhaka: Percentage advance'], ['outside_dhaka_required_prepay', 'Outside Dhaka: Required prepay (per product)'], ['new_customer_full_payment', 'New customer: Full payment'], ['new_customer_delivery_charge_only', 'New customer: Delivery charge only'], ['new_customer_fixed_advance', 'New customer: Fixed advance'], ['new_customer_percentage_advance', 'New customer: Percentage advance'], ['new_customer_required_prepay', 'New customer: Required prepay (per product)'], ['returning_customer_full_payment', 'Returning customer: Full payment'], ['returning_customer_delivery_charge_only', 'Returning customer: Delivery charge only'], ['returning_customer_fixed_advance', 'Returning customer: Fixed advance'], ['returning_customer_percentage_advance', 'Returning customer: Percentage advance'], ['returning_customer_required_prepay', 'Returning customer: Required prepay (per product)'], ['wholesale_full_payment', 'Wholesale: Full payment'], ['wholesale_delivery_charge_only', 'Wholesale: Delivery charge only'], ['wholesale_fixed_advance', 'Wholesale: Fixed advance'], ['wholesale_percentage_advance', 'Wholesale: Percentage advance'], ['wholesale_required_prepay', 'Wholesale: Required prepay (per product)'], ['vip_full_payment', 'VIP: Full payment'], ['vip_delivery_charge_only', 'VIP: Delivery charge only'], ['vip_fixed_advance', 'VIP: Fixed advance'], ['vip_percentage_advance', 'VIP: Percentage advance'], ['vip_required_prepay', 'VIP: Required prepay (per product)'], ['mobile_and_electronics_full_payment', 'Mobile & Electronics: Full payment'], ['mobile_and_electronics_percentage_advance', 'Mobile & Electronics: Percentage advance'], ['grocery_fresh_delivery_charge_only', 'Grocery · Fresh: Delivery charge only'], ['sslcommerz_mode', 'SSLCommerz mode'], ['sslcommerz_id', 'SSLCommerz store ID'], ['sslcommerz_secret', 'SSLCommerz store password'], ['eps_mode', 'EPS mode'], ['eps_id', 'EPS merchant ID'], ['eps_secret', 'EPS hash key'], ['nagad_mode', 'Nagad mode'], ['nagad_id', 'Nagad merchant ID'], ['nagad_secret', 'Nagad private key'], ['stripe_mode', 'Stripe mode'], ['stripe_id', 'Stripe publishable key'], ['stripe_secret', 'Stripe secret key'], ['paypal_mode', 'PayPal mode'], ['paypal_id', 'PayPal client ID'], ['paypal_secret', 'PayPal client secret']],
  preference: [['two_factor_otp_on_admin_login', 'Two-factor OTP on admin login'], ['send_otp_by_email', 'Send OTP by email'], ['send_otp_by_sms', 'Send OTP by SMS'], ['secure_delivery_otp', 'Secure delivery OTP'], ['send_order_notification_emails', 'Send order notification emails'], ['processing', 'Processing'], ['to_be_shipped', 'To be shipped'], ['shipped', 'Shipped'], ['cancelled', 'Cancelled'], ['products_need_approval', 'Products need approval'], ['brands_need_approval', 'Brands need approval'], ['categories_need_approval', 'Categories need approval'], ['attributes_need_approval', 'Attributes need approval'], ['attribute_values_need_approval', 'Attribute values need approval'], ['sellers_may_add_their_own_delivery_men', 'Sellers may add their own delivery men'], ['recently_viewed_products', 'Recently viewed products'], ['applies_to', 'Applies to'], ['customer_id_prefix', 'Customer ID prefix'], ['seller_id_prefix', 'Seller ID prefix'], ['admin_id_prefix', 'Admin ID prefix'], ['order_code_prefix', 'Order code prefix'], ['otp_length', 'OTP length'], ['otp_validity', 'OTP validity']],
  privacy: [['mkt_ask', 'Ask for marketing consent at checkout'], ['mkt_sms', 'SMS'], ['mkt_whatsapp', 'WhatsApp'], ['mkt_email', 'Email'], ['mkt_text', 'Marketing consent text'], ['legal_required', 'Customers must accept to place an order'], ['legal_text', 'Terms consent text'], ['terms_url', 'Terms of service page'], ['privacy_url', 'Privacy policy page'], ['cookie_banner', 'Show the cookie banner'], ['cookie_analytics', 'Analytics cookies'], ['cookie_ads', 'Ads cookies'], ['cookie_text', 'Cookie banner text']],
  rules: [['rule_1_on', 'Rule 1 enabled'], ['rule_2_on', 'Rule 2 enabled'], ['rule_3_on', 'Rule 3 enabled'], ['rule_4_on', 'Rule 4 enabled'], ['rule_5_on', 'Rule 5 enabled'], ['rule_enabled', 'Rule enabled'], ['rule_type', 'Rule type'], ['intent', 'Intent'], ['ch_widget', 'Website widget'], ['ch_whatsapp', 'WhatsApp'], ['ch_messenger', 'Messenger'], ['response', 'Response'], ['priority', 'Priority'], ['then', 'Then']],
  security: [['automatic_nightly_backup', 'Automatic nightly backup'], ['automatic_weekly_backup', 'Automatic weekly backup'], ['app_api_key', 'App API key'], ['google_client_id', 'Google client ID'], ['drive_refresh_token', 'Drive refresh token'], ['db_drive_folder_id', 'Drive folder ID'], ['mysqldump_path', 'mysqldump path'], ['chunk_size_mb', 'Chunk size (MB)'], ['file_drive_folder_id', 'Drive folder ID']],
  seo: [['seo_title', 'SEO title'], ['meta_description', 'Meta description'], ['keywords', 'Keywords'], ['author_name', 'Author name'], ['og_title', 'OG title'], ['og_description', 'OG description'], ['google_analytics_id', 'Google Analytics ID'], ['facebook_pixel_id', 'Facebook Pixel ID']],
  storage: [['path_style_endpoint', 'Path-style endpoint'], ['driver', 'Storage driver'], ['access_key_id', 'Access key ID'], ['bucket', 'Bucket'], ['region', 'Region'], ['endpoint', 'Endpoint'], ['public_url_cdn_base', 'Public URL / CDN base']],
};

// the page each form lives on: [page, href, group, module]
const FORM_PAGE = {
  general: ['General', '/set-general', 'Store', ''],
  media: ['Media', '/set-media', 'Store', ''],
  preference: ['Preference', '/set-preference', 'Store', ''],
  privacy: ['Privacy & consent', '/set-privacy', 'Store', ''],
  payments: ['Payment Gateway', '/set-payments', 'Commerce', 'commerce'],
  delivery: ['Delivery Settings', '/set-delivery', 'Commerce', 'online'],
  ai: ['AI Auto-Reply', '/set-ai', 'Communication', 'comms'],
  rules: ['Auto-Reply Rules', '/set-rules', 'Communication', 'comms'],
  seo: ['SEO', '/set-seo', 'Discovery', 'online'],
  storage: ['Storage', '/set-storage', 'Platform', ''],
  security: ['API Security', '/set-security', 'Platform', ''],
};

// a few words people search for that the label doesn't contain
const ALIASES = {
  'general.store_name': 'shop name brand', 'general.currency': 'taka bdt money symbol', 'general.timezone': 'time zone clock dhaka',
  'general.bin': 'vat mushak registration', 'general.tin': 'tax income', 'general.trade_licence': 'trade license licence',
  'general.legal_name': 'company registered', 'general.billing_name': 'invoice subscription bill', 'general.billing_email': 'invoice email bills',
  'general.brand_color': 'colour color theme primary', 'general.support_phone': 'contact hotline', 'general.support_email': 'contact',
  'security.app_api_key': 'token', 'delivery.inside_dhaka_delivery_charge': 'shipping fee', 'privacy.cookie_banner': 'gdpr tracking consent',
  'privacy.mkt_ask': 'opt in marketing consent newsletter', 'privacy.legal_text': 'terms conditions', 'seo.google_analytics_id': 'ga4 tracking',
};

const fieldEntries = () => Object.entries(FIELDS).flatMap(([form, list]) => {
  const [page, href, group, plan] = FORM_PAGE[form] || [form, '/set-general', 'Store', ''];
  return list.map(([field, label]) => ({ id: form + '.' + field, label, page, href: href + '?focus=' + field, owner: 'Settings', group, permission: 'set-store', plan, aliases: ALIASES[form + '.' + field] || '', field }));
});

// settings that live on their owner's page (Settings shows where they are)
const E = (id, label, page, href, owner, permission, plan, aliases = '') => ({ id, label, page, href, owner, group: owner, permission, plan, aliases });
const OWNED = [
  E('notif.events', 'Order SMS and email', 'Order notifications', '/set-notifications', 'Communications', 'set-store', 'commerce', 'notification template sms email customer shop'),
  E('stock.mode', 'One place or many places', 'Stock setup', '/stock-setup', 'Products & stock', 'set-store', 'catalog', 'warehouse branch inventory'),
  E('stock.buying', 'Buy direct or with purchase orders', 'Stock setup', '/stock-setup', 'Products & stock', 'set-store', 'catalog', 'purchase po supplier'),
  E('stock.wholesale', 'Wholesale prices', 'Stock setup', '/stock-setup', 'Products & stock', 'set-store', 'catalog', 'moq'),
  E('pos.returns', 'Return days at the counter', 'POS settings', '/pos-manage?tab=settings', 'POS', 'pos-counters', 'pos', 'refund exchange return window'),
  E('pos.receipt', 'Receipt and register settings', 'POS settings', '/pos-manage?tab=settings', 'POS', 'pos-counters', 'pos', 'printer receipt counter'),
  E('vat.rates', 'VAT rates and BIN', 'VAT', '/vat', 'Finance', 'acc-setup', 'money', 'tax mushak'),
  E('money.accounts', 'Bank, cash and wallet accounts', 'Money setup', '/account-setup', 'Finance', 'acc-setup', 'money', 'bkash nagad bank'),
  E('gateways', 'Payment gateways and couriers', 'Connections', '/connections?group=payments', 'Connections', 'connections', '', 'sslcommerz bkash nagad pathao steadfast'),
  E('connections', 'Connected apps', 'Connections', '/connections', 'Connections', 'connections', '', 'facebook whatsapp woocommerce shopify integration'),
  E('domains', 'Domains and SSL', 'Domains', '/set-domains', 'Settings', 'set-store', 'online', 'custom domain dns ssl website address subdomain'),
  E('apikeys', 'API keys', 'API Security', '/set-security#keys', 'Settings', 'set-store', '', 'token integration developer'),
  E('history', 'Settings history', 'Settings history', '/settings-history', 'Settings', 'set-store', '', 'audit log changes who changed'),
  E('billing.plan', 'Plan and modules', 'Subscription & billing', '/subscription', 'Account & billing', 'set-billing', '', 'subscription upgrade downgrade renew'),
  E('billing.usage', 'Usage and limits', 'Subscription & billing', '/subscription#usage', 'Account & billing', 'set-billing', '', 'limit quota seats storage orders products'),
  E('billing.wallet', 'SMS, WhatsApp and AI credits', 'Wallet & credits', '/credit-wallet', 'Account & billing', 'set-wallet', '', 'top up recharge credit'),
  E('attr.model', 'Attribution model and window', 'Attribution & UTM', '/attribution', 'Analytics', 'rep-all', 'marketing', 'first click last click linear position credit utm'),
  E('alerts.rules', 'Alerts on numbers', 'Reports & alerts', '/reports-alerts', 'Analytics', 'rep-all', 'marketing', 'alert threshold notify roas sales drop'),
  E('reports.schedule', 'Scheduled reports', 'Scheduled reports', '/scheduled-reports', 'Analytics', 'auto-reports', 'reports', 'email whatsapp daily weekly'),
  E('tracking.consent', 'Tracking consent and pixels', 'Event health', '/event-health', 'Analytics', 'ta-health', 'marketing', 'pixel capi cookie consent events'),
  E('profile.type', 'Profile type', 'Profile type', '/set-profile', 'Settings', 'set-store', '', 'role switch account'),
];

export const REGISTRY = [...fieldEntries(), ...OWNED];

/** Can this person use the entry (role, plan, edition)? */
export function allowed(e, user = currentUser()) {
  try {
    if (e.plan && !hasModule(e.plan)) return false;
    if (e.plan && !entitled(e.plan)) return false;
    return !e.permission || canSee(user, e.permission);
  } catch { return true; }
}

/** Entries matching `q` (every word must match the label, page, owner or aliases), best first. */
export function searchSettings(q, { user, limit = 12 } = {}) {
  const words = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const u = user || currentUser();
  return REGISTRY.map((e) => {
    const label = e.label.toLowerCase();
    const hay = [label, e.page.toLowerCase(), e.owner.toLowerCase(), e.aliases].join(' ');
    if (!words.every((w) => hay.includes(w))) return null;
    const score = (label.startsWith(words[0]) ? 0 : label.includes(words[0]) ? 1 : 2) + (e.field ? 0 : 0.5);
    return { ...e, score };
  }).filter(Boolean).filter((e) => allowed(e, u)).sort((a, b) => a.score - b.score || a.label.length - b.label.length).slice(0, limit);
}
