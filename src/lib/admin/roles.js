// admin/roles — the super admin's built-in roles and the menu areas each opens (the seed of Administration › Roles &
// permissions, lib/admin/admin.js). Kept in its own file so access.js and admin.js can both read it.

export const ADMIN_ROLES = {
  admin: { title: 'Super administrator', areas: '*' },
  management: { title: 'Management', areas: ['area-dashboard', 'area-analytics', 'area-merchants', 'area-plans', 'area-billing', 'area-crm', 'area-marketing', 'area-finance', 'area-people', 'area-merchant-ai', 'area-services', 'area-gridshop', 'area-email'] },
  sales: { title: 'Sales', areas: ['area-dashboard', 'area-merchants', 'area-crm', 'area-inbox', 'area-comms', 'area-marketing'] },
  marketing: { title: 'Marketing', areas: ['area-dashboard', 'area-analytics', 'area-crm', 'area-inbox', 'area-comms', 'area-marketing', 'area-website', 'area-themes'] },
  support: { title: 'Customer support', areas: ['area-dashboard', 'area-merchants', 'area-inbox', 'area-comms', 'area-support', 'area-gridai', 'area-merchant-ai', 'area-services', 'area-gridshop', 'area-email'] },
  ops: { title: 'Technical operations', areas: ['area-dashboard', 'area-merchants', 'area-plans', 'area-ops', 'area-support', 'area-themes', 'area-website', 'area-admin', 'area-merchant-ai', 'area-email'] },
  finance: { title: 'Finance', areas: ['area-dashboard', 'area-analytics', 'area-merchants', 'area-plans', 'area-billing', 'area-finance', 'area-merchant-ai', 'area-services', 'area-gridshop', 'area-email'] },
  hr: { title: 'HR', areas: ['area-dashboard', 'area-people'] },
  analyst: { title: 'Analyst', areas: ['area-dashboard', 'area-analytics'] },
};

// Batch F · Grid Career (area-career): every role that has Services, and HR (hiring is theirs)
Object.entries(ADMIN_ROLES).forEach(([id, r]) => {
  if (Array.isArray(r.areas) && (r.areas.includes('area-services') || id === 'hr') && !r.areas.includes('area-career')) r.areas.push('area-career');
});
// end Batch F

// Batch E · Grid Partners (area-partners): every role that has Services
Object.values(ADMIN_ROLES).forEach((r) => {
  if (Array.isArray(r.areas) && r.areas.includes('area-services') && !r.areas.includes('area-partners')) r.areas.push('area-partners');
});
// end Batch E · Grid Partners
