/** @type {import('next').NextConfig} */
// The old Accounts pages were merged into six (Overview, Money, Settlements, Expenses & bills,
// Reports, Setup). Their addresses still work and land on the page that replaced them.
const MOVED = {
  '/cash-book': '/money', '/money-book': '/money', '/transactions': '/money', '/money-in-out': '/money',
  '/bank-accounts': '/money?type=Bank', '/banks': '/account-setup?tab=accounts', '/bank-deposits': '/money?type=Bank',
  '/mfs-accounts': '/money?type=Mobile', '/mfs-providers': '/account-setup?tab=accounts', '/fund-transfers': '/money',
  '/payment-sessions': '/settlements', '/reconciliation': '/settlements', '/expenses': '/expenses-bills',
  '/investment': '/expenses-bills', '/owner-withdraw': '/expenses-bills', '/liability-settlement': '/liabilities',
  '/commissions': '/liabilities', '/reports': '/reports-centre', '/ledger-balances': '/money',
  // the staff profile's design fragments are tabs of /staff-profile now
  '/staff-overview': '/staff-profile', '/staff-access': '/staff-profile?tab=access', '/staff-attendance': '/staff-profile?tab=attendance',
  '/staff-leave': '/staff-profile?tab=leave', '/staff-salary': '/staff-profile?tab=salary', '/staff-activity': '/staff-profile?tab=activity',
  '/staff-docs': '/staff-profile?tab=docs',
};

const nextConfig = {
  reactStrictMode: false,
  async redirects() {
    return Object.entries(MOVED).map(([source, destination]) => ({ source, destination, permanent: false }));
  },
};

export default nextConfig;
