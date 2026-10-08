// Bangla for the shared shell (menu, top bar, common words). Screen content is not translated
// yet: t() falls back to the English text for anything missing here.
import { getLocale } from '../runtime/ui';

const BN = {
  // groups
  'General': 'সাধারণ', 'Purchase': 'ক্রয়', 'Stocks & Inventory': 'স্টক ও মজুদ', 'Tracking & analytics': 'ট্র্যাকিং ও বিশ্লেষণ',
  'Staff & HR': 'কর্মী ও এইচআর', 'Loyalty': 'লয়্যালটি', 'Promo': 'প্রোমো', 'Recovery': 'রিকভারি', 'Accounts': 'হিসাব',
  'Communication': 'যোগাযোগ', 'Automation': 'অটোমেশন', 'Management': 'ব্যবস্থাপনা',
  // sales channels
  'Sales channels': 'সেলস চ্যানেল', 'WooCommerce': 'উকমার্স', 'Shopify': 'শপিফাই', 'Online store': 'অনলাইন স্টোর', 'Channels': 'চ্যানেল', 'Overview': 'সারসংক্ষেপ', 'Meta Commerce': 'মেটা কমার্স', 'Google Merchant Center': 'গুগল মার্চেন্ট সেন্টার', 'Google Business': 'গুগল বিজনেস', 'Sync issues': 'সিঙ্কের সমস্যা',
  // general
  'Home': 'হোম', 'GridAI': 'গ্রিডএআই', 'Orders': 'অর্ডার', 'All orders': 'সব অর্ডার', 'Pending': 'অপেক্ষমাণ', 'Approved': 'অনুমোদিত',
  'Ready to ship': 'পাঠানোর জন্য প্রস্তুত', 'Shipped': 'পাঠানো হয়েছে', 'On hold': 'হোল্ডে', 'Processing': 'প্রসেসিং', 'Ready for courier': 'কুরিয়ারের জন্য প্রস্তুত', 'In transit': 'পথে আছে', 'Sent to courier': 'Courier-এ পাঠানো', 'Delivered': 'ডেলিভারি হয়েছে', 'Returned': 'ফেরত', 'Cancelled': 'বাতিল',
  'AI calls': 'এআই কল', 'POS / Retail orders': 'পিওএস / রিটেইল অর্ডার', 'Abandoned carts': 'ফেলে যাওয়া কার্ট', 'Sales': 'বিক্রয়', 'New sale': 'নতুন বিক্রয়', 'Sales book': 'বিক্রয় খাতা',
  'Invoices': 'ইনভয়েস', 'Return & exchange': 'ফেরত ও বদল', 'Products': 'পণ্য', 'All products': 'সব পণ্য',
  'Add product': 'পণ্য যোগ করুন', 'Categories': 'ক্যাটাগরি', 'Catalog setup': 'ক্যাটালগ সেটআপ', 'Collections': 'কালেকশন',
  'Customer catalogue': 'গ্রাহক ক্যাটালগ', 'Inventory': 'মজুদ', 'Low stock': 'কম স্টক', 'Barcodes': 'বারকোড', 'Media library': 'মিডিয়া লাইব্রেরি',
  'Customers': 'গ্রাহক', 'POS register': 'পিওএস রেজিস্টার',
  // purchase & stock
  'Buy goods': 'মাল কিনুন', 'Purchase orders': 'ক্রয় অর্ডার', 'Receive goods': 'মাল গ্রহণ', 'Requests': 'অনুরোধ',
  'Suppliers & payables': 'সরবরাহকারী ও দেনা', 'Stock list': 'স্টক তালিকা', 'Stock count': 'স্টক গণনা', 'Transfers': 'স্থানান্তর',
  'Damaged & expired': 'নষ্ট ও মেয়াদোত্তীর্ণ', 'Warranty policies': 'ওয়ারেন্টি নীতি', 'Warranty claims': 'ওয়ারেন্টি দাবি',
  'Warehouses': 'গুদাম', 'Branches': 'শাখা', 'Racks & bins': 'র‍্যাক ও বিন', 'Barcode labels': 'বারকোড লেবেল', 'Brands': 'ব্র্যান্ড', 'Smart offers': 'স্মার্ট অফার', 'Grid AI': 'Grid AI', 'Knowledge': 'জ্ঞানভান্ডার', 'Behaviour': 'আচরণ',
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
  // proposal switches (src/lib/proposal.js)
  'Proposal: {n} on': 'প্রস্তাব: {n}টি চালু', 'Proposal switches': 'প্রস্তাবের সুইচ',
  // business areas and their page tabs (navigation.js, Oct 2026)
  'Commerce': 'কমার্স', 'Team & settings': 'টিম ও সেটিংস', 'Warehouses & branches': 'গুদাম ও শাখা', 'Purchasing': 'ক্রয়', 'Payments': 'পেমেন্ট',
  'Communications': 'যোগাযোগ', 'Finances': 'টাকা-পয়সা', 'Analytics': 'অ্যানালিটিক্স', 'Marketing': 'মার্কেটিং',
  'Online Store': 'অনলাইন স্টোর', 'POS': 'পিওএস', 'Team': 'টিম', 'Dashboard': 'ড্যাশবোর্ড',
  'My dashboard': 'আমার ড্যাশবোর্ড', 'Tasks': 'কাজ', 'Team chat': 'টিম চ্যাট', 'Wholesale orders': 'হোলসেল অর্ডার',
  'Returns & exchanges': 'ফেরত ও বদল', 'Courier returns': 'কুরিয়ার ফেরত', 'Stock': 'স্টক',
  'Stock adjustments': 'স্টক সমন্বয়', 'Stock holds': 'স্টক হোল্ড', 'Purchases': 'কেনাকাটা', 'Suppliers': 'সরবরাহকারী',
  'Purchase requests': 'ক্রয়ের অনুরোধ', 'Payouts': 'পেআউট', 'Payment setup': 'পেমেন্ট সেটআপ',
  'All customers': 'সব গ্রাহক', 'Leads & follow-ups': 'লিড ও ফলো-আপ', 'Social posts': 'সোশ্যাল পোস্ট',
  'Automations': 'অটোমেশন', 'Cash, bank & wallets': 'নগদ, ব্যাংক ও ওয়ালেট', 'Income & expenses': 'আয় ও খরচ',
  'Dues': 'বকেয়া', 'Bills to pay': 'পরিশোধের বিল', 'Money setup': 'টাকা-পয়সা সেটআপ',
  'Daily summary': 'দৈনিক সারসংক্ষেপ', 'Scheduled reports': 'নির্ধারিত রিপোর্ট', 'Offers': 'অফার', 'Coupons': 'কুপন',
  'Offers page': 'অফার পেজ', 'Blog categories': 'ব্লগ ক্যাটাগরি', 'Authors': 'লেখক',
  'Channel settings': 'চ্যানেল সেটিংস', 'POS manage': 'পিওএস ব্যবস্থাপনা', 'Salary statements': 'বেতন বিবরণী',
  'Increments & promotions': 'ইনক্রিমেন্ট ও পদোন্নতি', 'Gratuity & leaving': 'গ্র্যাচুইটি ও চাকরি ছাড়া',
  'Positions & grades': 'পদ ও গ্রেড', 'ID cards & QR': 'আইডি কার্ড ও কিউআর', 'Attendance devices': 'হাজিরা ডিভাইস',
  'New post': 'নতুন পোস্ট', 'Add staff': 'কর্মী যোগ করুন',
  // short tab names (navigation.js › tab)
  'Adjustments': 'সমন্বয়', 'Counts': 'গণনা', 'Holds': 'হোল্ড', 'Staff': 'কর্মী', 'Shifts': 'শিফট', 'Statements': 'বিবরণী',
  'Increments': 'ইনক্রিমেন্ট', 'Loans': 'ঋণ', 'Gratuity': 'গ্র্যাচুইটি', 'Positions': 'পদ', 'ID cards': 'আইডি কার্ড',
  'Devices': 'ডিভাইস', 'Setup': 'সেটআপ', 'Wallet': 'ওয়ালেট', 'Reminders': 'রিমাইন্ডার', 'Google Merchant': 'গুগল মার্চেন্ট',
  'Cash & bank': 'নগদ ও ব্যাংক',
  // the person's menu (brief #21): pins, start page, plan and "Set up"
  'Pinned': 'পিন করা', 'Pin to menu': 'মেনুতে পিন করুন', 'Unpin': 'পিন সরান', 'Set up': 'সেট আপ করুন', 'Upgrade': 'আপগ্রেড',
  'You can pin up to {n} pages. Unpin one first.': 'সর্বোচ্চ {n}টি পেজ পিন করা যায়। আগে একটি সরান।',
  'Start page': 'শুরুর পেজ', 'Start page saved': 'শুরুর পেজ সেভ হয়েছে', 'Hide for now': 'এখন লুকান',
  'Starter plan': 'স্টার্টার প্ল্যান', 'Growth plan': 'গ্রোথ প্ল্যান', 'Business plan': 'বিজনেস প্ল্যান', '3 branches': '৩টি শাখা',
  'Connect a courier': 'কুরিয়ার যুক্ত করুন', 'Online orders need a courier to deliver them.': 'অনলাইন অর্ডার ডেলিভারির জন্য একটি কুরিয়ার লাগবে।',
  'Set up a counter': 'কাউন্টার সেট আপ করুন', 'Add a counter before you sell in the shop.': 'দোকানে বিক্রির আগে একটি কাউন্টার যোগ করুন।',
  'Connect a payment': 'পেমেন্ট যুক্ত করুন', 'Connect bKash, Nagad or a card gateway to take payments.': 'পেমেন্ট নিতে বিকাশ, নগদ বা কার্ড গেটওয়ে যুক্ত করুন।',
  // new pages (Oct 2026) and their short tab names
  'Order work': 'অর্ডারের কাজ', 'Order settings': 'অর্ডার সেটিংস', 'Payment operations': 'পেমেন্টের কাজ',
  'Approvals': 'অনুমোদন', 'Match statements': 'স্টেটমেন্ট মেলান', 'Campaigns': 'ক্যাম্পেইন', 'Store credit': 'স্টোর ক্রেডিট',
  'Communications settings': 'যোগাযোগ সেটিংস', 'Stock activity': 'স্টকের খতিয়ান', 'Customer settings': 'গ্রাহক সেটিংস',
  'Ad audiences': 'বিজ্ঞাপনের অডিয়েন্স', 'Operations': 'কাজকর্ম', 'Activity': 'খতিয়ান',
  // account menu, Help and editions (gc-topbar.js, gc-sidebar.js, lib/edition.js)
  'My tasks': 'আমার কাজ', 'Your tasks, numbers and team for today': 'আজকের কাজ, হিসাব আর টিম',
  'Profile type': 'প্রোফাইলের ধরন', 'Switch to a team member’s profile': 'টিমের অন্য কারও প্রোফাইলে যান',
  'Help': 'সাহায্য', 'Help for this page': 'এই পেজের সাহায্য', 'Ask GridAI': 'GridAI-কে জিজ্ঞেস করুন',
  'All modules': 'সব মডিউল', 'Retail + Wholesale': 'রিটেইল + হোলসেল', 'Retail': 'রিটেইল', 'Retail + Online': 'রিটেইল + অনলাইন', 'Online': 'অনলাইন',
  'Retail + Wholesale + Online': 'রিটেইল + হোলসেল + অনলাইন', 'Communication & CRM': 'যোগাযোগ ও সিআরএম',
  // Inbox area and the top-bar chat button (navigation.js area-inbox, gc-topbar.js)
  'Chats': 'চ্যাট', 'Comments': 'কমেন্ট', 'Mentions': 'মেনশন', 'Tickets': 'টিকিট', 'Unread': 'না পড়া',
  '{n} unread': '{n}টি না-পড়া', 'No unread chats': 'না পড়া কোনো চ্যাট নেই', 'Courier statement': 'কুরিয়ার স্টেটমেন্ট', 'Open Inbox': 'ইনবক্স খুলুন', 'Show': 'দেখান',
  // roles (lib/team.js)
  'CEO': 'সিইও', 'CTO': 'সিটিও', 'Social media & content': 'সোশ্যাল মিডিয়া ও কনটেন্ট', 'Order management': 'অর্ডার ব্যবস্থাপনা',
  'Ads & tracking': 'বিজ্ঞাপন ও ট্র্যাকিং', 'Warehouse manager': 'গুদাম ম্যানেজার', 'Warehouse supervisor': 'গুদাম সুপারভাইজার',
  'Shop manager': 'দোকান ম্যানেজার', 'Shop supervisor': 'দোকান সুপারভাইজার', 'Shop seller': 'দোকানের বিক্রেতা', 'HR': 'এইচআর',
  'Online sales expert': 'অনলাইন সেলস এক্সপার্ট',
};

/** Translates a shell string for the active locale. */
export function t(text, locale = getLocale()) {
  return locale === 'bn' ? (BN[text] || text) : text;
}
