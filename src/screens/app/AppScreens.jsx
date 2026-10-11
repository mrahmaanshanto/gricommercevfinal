// AppScreens — /app-screens, every mobile app screen on one page (as on the mobileview site): a live thumbnail of each
// screen (the real page in a 390 x 844 frame, shrunk), grouped by area; tapping one opens it in the iPhone frame, where
// "All screens" comes back here. Thumbnails load lazily and are marked framed (layout.jsx), so they never show the
// host's badge or ask for the camera; detail screens open on a demo record. A server component: nothing to hydrate.

const SECTIONS = [
  { title: 'Merchant app · main tabs', screens: [
    ['/m-home', 'Home'], ['/m-orders', 'Orders'], ['/m-inbox', 'Inbox'], ['/m-stock', 'Stock'], ['/m-more', 'More'],
  ] },
  { title: 'Sell', screens: [
    ['/m-order-detail?id=136811', 'Order details'], ['/m-new-order', 'New order'], ['/m-customers', 'Customers'],
    ['/m-customer?id=C-08020', 'Customer'], ['/m-pos', 'POS register'], ['/m-calls', 'Calls'],
    ['/m-call-active?preview=1', 'On a call'], ['/m-call-settings', 'Call settings'],
  ] },
  { title: 'Products & stock', screens: [
    ['/m-products', 'Products'], ['/m-product-edit', 'Add product'], ['/m-scan', 'Scan a barcode'],
    ['/m-purchase', 'Purchase orders'], ['/m-purchase-detail?id=PO-2609-0024', 'Purchase order'],
    ['/m-purchase-new', 'New purchase'], ['/m-receive', 'Receive goods'], ['/m-transfers', 'Transfers'],
    ['/m-adjust', 'Adjust & count'],
  ] },
  { title: 'Messages', screens: [
    ['/m-chat', 'Chat'], ['/m-gridai', 'GridAI'], ['/m-social', 'Social posts'], ['/m-post-new', 'New post'],
  ] },
  { title: 'Money & reports', screens: [
    ['/m-finance', 'Finance'], ['/m-payouts', 'Payouts'], ['/m-dues', 'Dues'], ['/m-expense-new', 'Add expense'],
    ['/m-reports', 'Reports'], ['/m-report?id=daily', 'Report'],
  ] },
  { title: 'Team', screens: [
    ['/m-hr', 'Staff & HR'], ['/m-tasks', 'Tasks'], ['/m-task?id=TK-101', 'Task'],
  ] },
  { title: 'Settings & support', screens: [
    ['/m-settings', 'Settings'], ['/m-profile', 'Profile'], ['/m-settings-devices', 'Devices'],
    ['/m-notifications', 'Notifications'], ['/m-tickets', 'Support tickets'], ['/m-ticket-detail?id=2295', 'Ticket'],
    ['/m-ticket-new', 'New ticket'],
  ] },
  { title: 'Sign in & onboarding', screens: [
    ['/onb-welcome', 'Welcome'], ['/onb-phone', 'Step 1 · Create account'], ['/onb-otp', 'Step 2 · Verify number'],
    ['/onb-store', 'Step 3 · Your business'], ['/onb-channels', 'Step 4 · How you sell'], ['/onb-link', 'Step 5 · Shop link'],
    ['/onb-done', 'Shop ready'], ['/onb-sign-in', 'Sign in'], ['/onb-sign-in-code', 'Sign in code'],
    ['/c-sign-in', 'Staff sign in'],
  ] },
  { title: 'Staff console app', screens: [
    ['/c-home', 'Home'], ['/c-merchants', 'Merchants'], ['/c-merchant-detail', 'Merchant'], ['/c-tickets', 'Tickets'],
    ['/c-ticket', 'Ticket'], ['/c-store-access', 'Enter a store with a PIN'], ['/c-store-session', 'Inside the store'],
    ['/c-collections', 'Collections'], ['/c-record-payment', 'Record payment'], ['/c-ops', 'Incident'], ['/c-more', 'More'],
  ] },
];

const withQuiet = (href) => href + (href.includes('?') ? '&' : '?') + 'quiet=1';

const CSS = `
.as{min-height:100vh;background:#f5f7fa;color:#0f172a;font-family:var(--font-sans)}
.as-head{background:linear-gradient(150deg,#012169,#0a4bb5);color:#fff;padding:40px 24px 36px}
.as-in{max-width:1240px;margin:0 auto}
.as-head img{height:30px;width:auto;display:block}
.as-head h1{margin:22px 0 6px;font-size:var(--text-3xl);line-height:1.2;font-weight:var(--weight-semibold);letter-spacing:-.02em}
.as-head p{margin:0;max-width:640px;color:#cbd8ee;font-size:var(--text-sm);line-height:1.6}
.as-go{display:inline-flex;align-items:center;gap:8px;margin-top:20px;height:44px;padding:0 20px;border-radius:var(--radius-lg);background:#fff;color:#003087;font-size:var(--text-sm);font-weight:var(--weight-semibold);text-decoration:none}
.as-go:hover{background:#eef3fb}
.as-go:focus-visible,.as-card:focus-visible{outline:3px solid rgba(0,156,222,.6);outline-offset:3px}
.as-main{padding:8px 24px 64px}
.as-sec{margin-top:36px}
.as-sec h2{margin:0 0 16px;font-size:var(--text-lg);font-weight:var(--weight-semibold)}
.as-sec h2 small{margin-left:6px;font-size:var(--text-sm);font-weight:var(--weight-regular,400);color:var(--text-muted)}
.as-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(176px,1fr));gap:22px}
.as-card{display:flex;flex-direction:column;gap:10px;color:#0f172a;font-size:var(--text-sm);font-weight:var(--weight-medium);text-decoration:none;border-radius:24px}
.as-thumb{position:relative;width:176px;height:381px;border-radius:24px;overflow:hidden;background:#dfe5ee;box-shadow:0 10px 30px -18px rgba(15,23,42,.5);transition:transform 200ms cubic-bezier(0.23,1,0.32,1)}
.as-thumb iframe{position:absolute;top:0;left:0;width:390px;height:844px;border:0;transform:scale(.4513);transform-origin:0 0;pointer-events:none}
@media (hover:hover) and (pointer:fine){.as-card:hover .as-thumb{transform:translateY(-3px)}.as-card:hover span{color:#003087}}
@media (max-width:480px){.as-head{padding:28px 16px 28px}.as-main{padding:0 16px 48px}.as-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:16px;justify-items:center}
  .as-card{width:150px}.as-thumb{width:150px;height:325px;border-radius:20px}.as-thumb iframe{transform:scale(.3846)}}
@media (prefers-reduced-motion:reduce){.as-thumb{transition:none}}
body:has(.as) .gc-ai{display:none}
`;

export default function AppScreens() {
  const total = SECTIONS.reduce((n, s) => n + s.screens.length, 0);
  return (
    <div className="as">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <header className="as-head">
        <div className="as-in">
          <img src="/assets/2cdd11de6454f32fc6bb856d35bf4f3e.png" alt="GridCommerce" />
          <h1>Mobile app screens</h1>
          <p>{`The merchant app for running the shop day to day, plus onboarding and the staff console app: ${total} screens on the live demo data. Tap a screen to open it in the phone frame.`}</p>
          <a className="as-go" href="/app">Open the app →</a>
        </div>
      </header>
      <main className="as-main">
        <div className="as-in">
          {SECTIONS.map((s) => (
            <section key={s.title} className="as-sec">
              <h2>{s.title}<small>{`${s.screens.length} screens`}</small></h2>
              <div className="as-grid">
                {s.screens.map(([href, label]) => (
                  <a key={href} className="as-card" href={withQuiet(href)}>
                    <div className="as-thumb"><iframe src={withQuiet(href)} title={label} loading="lazy" tabIndex={-1} aria-hidden="true" scrolling="no" /></div>
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
