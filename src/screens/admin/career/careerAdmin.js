// careerAdmin — small helpers the super admin's Grid Career pages share.
import { staff } from '@/lib/platform/store';

/** The signed-in GridCommerce staff member's name (for history lines). */
export const staffName = () => { try { return staff().name; } catch { return 'Staff'; } };
