// Route helpers shared by the converted screens and the shell.
// A design file `templates/<folder>/<PageName>.dc.html` is served at `/<kebab-page-name>`.
// Page names are unique across the whole design, so the name alone identifies the route.

/** "MerchantOrders" -> "merchant-orders", "UIKit01Shell" -> "ui-kit01-shell", "SetupGA4" -> "setup-ga4" */
export function kebab(name) {
  return String(name)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

const DC_RE = /(?:^|\/)([A-Za-z0-9_]+)\.dc\.html(#.*)?$/;

/** True when `href` points at another design screen (`Foo.dc.html`, `../x/Foo.dc.html#id`). */
export function isScreenHref(href) {
  return typeof href === 'string' && DC_RE.test(href);
}

// Reference screens and storyboards are served under /dev, away from the product routes.
const DEV_ROUTES = {
  "DevReference": "/dev/dev-reference",
  "FlowOnboarding": "/dev/flow-onboarding",
  "FlowOrders": "/dev/flow-orders",
  "FlowPayments": "/dev/flow-payments",
  "FlowProducts": "/dev/flow-products",
  "FlowPurchase": "/dev/flow-purchase",
  "FlowStaff": "/dev/flow-staff",
  "IconSet": "/dev/icon-set",
  "UIKit01Shell": "/dev/ui-kit01-shell",
  "UIKit02Actions": "/dev/ui-kit02-actions",
  "UIKit03Controls": "/dev/ui-kit03-controls",
  "UIKit04FormLayouts": "/dev/ui-kit04-form-layouts",
  "UIKit05Tables": "/dev/ui-kit05-tables",
  "UIKit06Data": "/dev/ui-kit06-data",
  "UIKit07Feedback": "/dev/ui-kit07-feedback",
  "UIKit08Commerce": "/dev/ui-kit08-commerce",
  "UIKit09Templates": "/dev/ui-kit09-templates",
  "PosRegister": "/dev/storyboards/pos-register",
  "Structure": "/dev/structure",
  "SettingsConsole": "/dev/storyboards/settings-console",
  "SiteMap": "/dev/site-map"
};

/** Maps a design link to its app route. Anything else is returned unchanged. */
export function routeOf(href) {
  if (!isScreenHref(href)) return href;
  const [, name, hash] = href.match(DC_RE);
  return (DEV_ROUTES[name] || '/' + kebab(name)) + (hash || '');
}

/** `/_blob/<id>` (the design canvas' asset store) -> `/assets/<id>.<ext>` */
const ASSET_EXT = {
  '9b6f9ad369f1cbde65271a968e6ba1f1': 'png', '62dadbbb3f365aebdd41bb9975f5931f': 'png',
  '820d4a69b45ed8fa40c9bc6015985c0e': 'png', '9f66d32bb99031029a6fbcfd91e221f2': 'png',
  '85e4f9f412e9d0859b3e4e19309ccb4d': 'png', '2059102e8af8150fddf31a9c65d3cbc7': 'png',
  '41f77fbf774c3a1c10208ca2b086bc14': 'png', '57bb10142b6017571910098da3778028': 'png',
  '17dfdfcb88d830b24dda236b7fce7488': 'png', 'c55e357bc2f730b6740093422e5af4ca': 'png',
  'ff462bc6abaa5d30500a126b259de9d6': 'png', 'cfed82fd2598f2fb3d4fb3f6c87606e5': 'png',
  '48a47ed6468079a61846b91934211c40': 'png', '25e820cfa3e50978f934abe93e0c3db7': 'png',
  'cfbbbbd758347fbb3f71590345d24674': 'webp', '2cdd11de6454f32fc6bb856d35bf4f3e': 'png',
  '8c3babaf605936b39809e7960e7c846f': 'png', 'dec2496b57e91a856eaa9f8fd17d9124': 'webp',
  '937ca529653ad58861f011f257ebc4df': 'webp', '901f735d539a8b71fb8e8162bb755ec3': 'webp',
  '99e39eac40a8abf8968649c253b23f9e': 'webp',
};

export function assetUrl(id) {
  return '/assets/' + id + '.' + (ASSET_EXT[id] || 'png');
}

export function rewriteAssets(text) {
  return String(text).replace(/\/_blob\/([0-9a-f]{32})/g, (_, id) => assetUrl(id));
}

/** Ask the app to navigate client-side (used by the shadow-DOM shell elements). */
export function navigate(href) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('dc:navigate', { detail: href }));
}
