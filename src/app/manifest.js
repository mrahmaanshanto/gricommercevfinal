// The web-app manifest (Next links it from every page): "Add to Home Screen" installs the merchant app, which opens
// on the app's Home (/m-home) without the browser's bars. Icons: the GridCommerce mark on white (public/assets).
export default function manifest() {
  return {
    name: 'GridCommerce',
    short_name: 'GridCommerce',
    description: 'Run your shop from your phone: orders, stock, money and messages.',
    id: '/m-home',
    start_url: '/m-home',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f5f7fa',
    theme_color: '#003087',
    icons: [
      { src: '/assets/app-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/assets/app-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/assets/app-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
