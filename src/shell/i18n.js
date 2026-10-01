// Bangla for the shared shell (menu, top bar, common words). Screen content is not translated
// yet: t() falls back to the English text for anything missing here.
import { getLocale } from '../runtime/ui';

const BN = {
  // groups
  'General': 'সাধারণ', 'Purchase': 'ক্রয়', 'Stocks & Inventory': 'স্টক ও মজুদ', 'Tracking & analytics': 'ট্র্যাকিং ও বিশ্লেষণ',
  'Staff & HR': 'কর্মী ও এইচআর', 'Loyalty': 'লয়্যালটি', 'Promo': 'প্রোমো', 'Recovery': 'রিকভারি', 'Accounts': 'হিসাব',
  'Communication': 'যোগাযোগ', 'Automation': 'অটোমেশন', 'Management': 'ব্যবস্থাপনা',
  // general
  'Home': 'হোম', 'GridAI': 'গ্রিডএআই', 'Orders': 'অর্ডার', 'All orders': 'সব অর্ডার', 'Pending': 'অপেক্ষমাণ', 'Approved': 'অনুমোদিত',
  'Ready to ship': 'পাঠানোর জন্য প্রস্তুত', 'Shipped': 'পাঠানো হয়েছে', 'On hold': 'হোল্ডে', 'Processing': 'প্রসেসিং', 'Ready for courier': 'কুরিয়ারের জন্য প্রস্তুত', 'In transit': 'পথে আছে', 'Delivered': 'ডেলিভারি হয়েছে', 'Returned': 'ফেরত', 'Cancelled': 'বাতিল',
  'AI calls': 'এআই কল', 'POS / Retail orders': 'পিওএস / রিটেইল অর্ডার', 'Abandoned carts': 'ফেলে যাওয়া কার্ট', 'Sales': 'বিক্রয়', 'New sale': 'নতুন বিক্রয়', 'Sales book': 'বিক্রয় খাতা',
  'Invoices': 'ইনভয়েস', 'Return & exchange': 'ফেরত ও বদল', 'Products': 'পণ্য', 'All products': 'সব পণ্য',
  'Add product': 'পণ্য যোগ করুন', 'Categories': 'ক্যাটাগরি', 'Catalog setup': 'ক্যাটালগ সেটআপ', 'Collections': 'কালেকশন',
  'Customer catalogue': 'গ্রাহক ক্যাটালগ', 'Inventory': 'মজুদ', 'Low stock': 'কম স্টক', 'Barcodes': 'বারকোড', 'Media library': 'মিডিয়া লাইব্রেরি',
  'Customers': 'গ্রাহক', 'POS register': 'পিওএস রেজিস্টার',
  // purchase & stock
  'Buy goods': 'মাল কিনুন', 'Purchase orders': 'ক্রয় অর্ডার', 'Receive goods': 'মাল গ্রহণ', 'Requests': 'অনুরোধ',
  'Suppliers & payables': 'সরবরাহকারী ও দেনা', 'Stock list': 'স্টক তালিকা', 'Stock count': 'স্টক গণনা', 'Transfers': 'স্থানান্তর',
  'Damaged & expired': 'নষ্ট ও মেয়াদোত্তীর্ণ', 'Warranty policies': 'ওয়ারেন্টি নীতি', 'Warranty claims': 'ওয়ারেন্টি দাবি',
  'Warehouses': 'গুদাম', 'Branches': 'শাখা', 'Racks & bins': 'র‍্যাক ও বিন', 'Barcode labels': 'বারকোড লেবেল',
  // tracking
  'Analytics hub': 'অ্যানালিটিক্স হাব', 'Campaigns & creatives': 'ক্যাম্পেইন ও ক্রিয়েটিভ', 'Products & traffic': 'পণ্য ও ট্রাফিক',
  'Attribution & UTM': 'অ্যাট্রিবিউশন ও ইউটিএম', 'Reports & alerts': 'রিপোর্ট ও সতর্কতা', 'Pixels & events': 'পিক্সেল ও ইভেন্ট',
  'Event health': 'ইভেন্টের অবস্থা', 'Connections': 'সংযোগ', 'Setup guides': 'সেটআপ গাইড',
  // staff
  'HR dashboard': 'এইচআর ড্যাশবোর্ড', 'All staff': 'সব কর্মী', 'Attendance': 'হাজিরা', 'Shifts & roster': 'শিফট ও রোস্টার',
  'Leave': 'ছুটি', 'Payroll': 'বেতন', 'Loans & advances': 'ঋণ ও অগ্রিম', 'HR setup': 'এইচআর সেটআপ',
  // loyalty, promo, recovery
  'Loyalty & rewards': 'লয়্যালটি ও পুরস্কার', 'Members': 'সদস্য', 'Product points': 'পণ্যের পয়েন্ট', 'Customer wallet': 'গ্রাহক ওয়ালেট',
  'Invite a friend': 'বন্ধুকে আমন্ত্রণ', 'Offers & promo': 'অফার ও প্রোমো', 'Discount codes': 'ডিসকাউন্ট কোড', 'Flash sales': 'ফ্ল্যাশ সেল',
  'Offers page (website)': 'অফার পেজ (ওয়েবসাইট)', 'Auto reminders': 'স্বয়ংক্রিয় রিমাইন্ডার',
  // accounts
  'Chart of accounts': 'হিসাবের তালিকা', 'Transactions': 'লেনদেন', 'Journals': 'জার্নাল', 'Reconciliation': 'মিলকরণ', 'Cash book': 'ক্যাশ বই',
  'Money in & out': 'টাকা জমা ও খরচ', 'VAT': 'ভ্যাট', 'Reports': 'রিপোর্ট', 'Banks': 'ব্যাংক', 'Bank accounts': 'ব্যাংক হিসাব',
  'Bank deposits': 'ব্যাংক জমা', 'Mobile banking': 'মোবাইল ব্যাংকিং', 'Providers': 'প্রোভাইডার', 'Money movement': 'টাকা স্থানান্তর',
  'Fund transfers': 'ফান্ড ট্রান্সফার', 'Payment sessions': 'পেমেন্ট সেশন', 'Entries': 'এন্ট্রি', 'Expenses': 'খরচ', 'Investment': 'বিনিয়োগ',
  'Owner withdraw': 'মালিকের উত্তোলন', 'Liability settlement': 'দায় পরিশোধ', 'Commissions': 'কমিশন',
  // communication, automation, management
  'Post calendar': 'পোস্ট ক্যালেন্ডার', 'Create post': 'পোস্ট তৈরি', 'Rules': 'নিয়ম', 'Workflow builder': 'ওয়ার্কফ্লো বিল্ডার',
  'Workflow settings': 'ওয়ার্কফ্লো সেটিংস', 'Inbox': 'ইনবক্স', 'Calls': 'কল', 'Support tickets': 'সাপোর্ট টিকিট', 'Team report': 'টিম রিপোর্ট',
  'Storefront': 'স্টোরফ্রন্ট', 'Landing pages': 'ল্যান্ডিং পেজ', 'WordPress sync': 'ওয়ার্ডপ্রেস সিঙ্ক', 'Blog posts': 'ব্লগ পোস্ট', 'Theme': 'থিম',
  'Navigation': 'নেভিগেশন', 'Settings': 'সেটিংস', 'Store settings': 'স্টোর সেটিংস', 'All settings at a glance': 'এক নজরে সব সেটিংস',
  'Wallet & credits': 'ওয়ালেট ও ক্রেডিট', 'Subscription & billing': 'সাবস্ক্রিপশন ও বিল', 'Help & support': 'সাহায্য ও সহায়তা',
  // shell chrome
  'All menus': 'সব মেনু', 'Main': 'প্রধান মেনু', 'Collapse sidebar': 'সাইডবার ছোট করুন', 'Expand sidebar': 'সাইডবার বড় করুন',
  'Close menu': 'মেনু বন্ধ করুন', 'Open menu': 'মেনু খুলুন', 'overview': 'সারসংক্ষেপ',
  'Search': 'খুঁজুন', 'Search in': 'যেখানে খুঁজবেন', 'All': 'সব', 'Scan': 'স্ক্যান', 'Scan a barcode': 'বারকোড স্ক্যান করুন',
  'Search orders, products, customers, invoices…': 'অর্ডার, পণ্য, গ্রাহক, ইনভয়েস খুঁজুন…',
  'Files': 'ফাইল', 'View store': 'স্টোর দেখুন', 'Notifications': 'নোটিফিকেশন', 'Mark all read': 'সব পড়া হয়েছে',
  'View all notifications': 'সব নোটিফিকেশন দেখুন', 'Recent searches': 'সাম্প্রতিক খোঁজ', 'Jump to': 'সরাসরি যান',
  'My profile': 'আমার প্রোফাইল', 'Details, password and two-factor sign-in': 'তথ্য, পাসওয়ার্ড ও দুই-ধাপ সাইন-ইন',
  'Language': 'ভাষা', 'Sign out': 'সাইন আউট', 'Store owner': 'স্টোর মালিক', 'Account menu': 'অ্যাকাউন্ট মেনু',
  'Business plan · 3 branches': 'বিজনেস প্ল্যান · ৩টি শাখা', 'Recent files': 'সাম্প্রতিক ফাইল', 'File manager': 'ফাইল ম্যানেজার',
  'See all': 'সব দেখুন', 'New invoice': 'নতুন ইনভয়েস', 'Upload a file': 'ফাইল আপলোড করুন',
  'Language set to English. The menu and top bar follow it; page content is English for now.': 'ভাষা বাংলা করা হয়েছে। মেনু ও উপরের বার বাংলায় দেখাবে; পেজের ভেতরের লেখা আপাতত ইংরেজিতে।',
};

/** Translates a shell string for the active locale. */
export function t(text, locale = getLocale()) {
  return locale === 'bn' ? (BN[text] || text) : text;
}
