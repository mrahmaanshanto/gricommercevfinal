// help — what the Help panel shows for each page (components/ui/HelpPanel.jsx), in English and Bangla.
//   HELP[route] = { en: { what, steps: [], tips: [], video: [title, duration] }, bn: { … }, related: [routes] }
// Pages without an entry get one made from their menu entry and page description (helpFor), so every page has
// Help. Bangla follows docs/terminology.md: familiar business words stay English (Order, Stock, Payment, Due …).

import { NAV } from '../shell/navigation';
import { routeOf } from '../runtime/routes';

const E = (what, steps, tips, video) => ({ what, steps, tips, video });

export const HELP = {
  '/email': {
    en: E('Email at your own domain (like sales@yourshop.com) for you and your team, billed per mailbox.', ['Connect your domain in Settings › Domains first.', 'Pick a plan and how many mailboxes, verify the domain and add the four DNS records (copy them, or Add records for me).', 'Make mailboxes, then shared addresses like info@ and sales@.', 'Open Apps to read mail on the web or scan the QR code on a phone.'], ['When someone leaves (Staff & HR), their mailbox is suspended and the mail forwarded.', 'Order emails go out from your own domain once SPF and DKIM are green.'], null),
    bn: E('নিজের Domain-এ Email (যেমন sales@yourshop.com) আপনার আর টিমের জন্য, প্রতি Mailbox হিসেবে বিল।', ['প্রথমে Settings › Domains-এ আপনার Domain যোগ করুন।', 'Plan আর কয়টি Mailbox বাছুন, Domain যাচাই করুন আর চারটি DNS record যোগ করুন (Copy করুন, বা Add records for me)।', 'Mailbox বানান, তারপর info@ আর sales@ এর মতো শেয়ার করা ঠিকানা।', 'Apps খুলে Web-এ Mail পড়ুন বা ফোনে QR code স্ক্যান করুন।'], ['কেউ চলে গেলে (Staff & HR) তার Mailbox বন্ধ হয় আর Mail ফরোয়ার্ড হয়।', 'SPF আর DKIM সবুজ হলে Order-এর Email আপনার Domain থেকে যায়।'], null),
    related: ['/set-domains', '/set-users', '/set-notifications'],
  },
  // Batch F · Grid Career
  '/hiring': {
    en: E('Hire without Google Forms or spreadsheets: post jobs on your careers page, share them, and follow every applicant on one board.', ['Press New job, write the job and add the questions applicants answer.', 'Mark a knockout answer (for example “No” to “Can you work Fridays?”) to reject people who don’t fit by themselves.', 'Publish, then Share the link on Facebook, WhatsApp or LinkedIn.', 'Open Applicants to review, shortlist, book interviews and hire.'], ['Each shared link remembers where it was posted, so you see which post brought each applicant.', 'Turn the careers page on or off, and set its headline, about and benefits, in the Careers page card.', 'Grid Career is opened per store by GridCommerce. If the page says it is closed, ask GridCommerce support.'], null),
    bn: E('Google Form বা Spreadsheet ছাড়াই নিয়োগ দিন: আপনার Careers page-এ Job দিন, শেয়ার করুন, আর এক Board-এ প্রত্যেক আবেদনকারীকে দেখুন।', ['New job চাপুন, Job লিখুন আর আবেদনকারীরা যে প্রশ্নের উত্তর দেবেন তা যোগ করুন।', 'Knockout উত্তর ঠিক করুন (যেমন “শুক্রবার কাজ করতে পারবেন?”-এ “No”), যাঁরা মেলেন না তাঁরা নিজে থেকেই বাদ পড়বেন।', 'Publish করুন, তারপর Facebook, WhatsApp বা LinkedIn-এ Link শেয়ার করুন।', 'Applicants খুলে দেখুন, Shortlist করুন, Interview ঠিক করুন আর নিয়োগ দিন।'], ['প্রতিটি শেয়ার করা Link মনে রাখে কোথায় পোস্ট হয়েছিল, তাই কোন পোস্ট থেকে কে এসেছেন দেখতে পাবেন।', 'Careers page কার্ডে পেজ চালু বা বন্ধ করুন, আর শিরোনাম, পরিচিতি ও সুবিধা লিখুন।', 'Grid Career প্রতিটি Store-এর জন্য GridCommerce চালু করে। বন্ধ দেখালে GridCommerce support-কে বলুন।'], null),
    related: ['/hiring-applicants', '/staff-create', '/positions'],
  },
  '/hiring-applicants': {
    en: E('Every applicant by stage: New, Shortlisted, Interview, Offer, Hired and Rejected.', ['Drag a card to another column, or press its button for the next step.', 'Open a card to read the answers and CV, rate them, add notes and send a message.', 'Book interview sets the time and place and sends the invite by SMS.', 'Hire opens Add staff with their name, mobile, email and position filled in.'], ['Table shows the same applicants as a sheet, with filters and a CSV export.', 'Applicants follow their status on their own page with the code in their SMS; they never see your notes or ratings.'], null),
    bn: E('ধাপ অনুযায়ী প্রত্যেক আবেদনকারী: New, Shortlisted, Interview, Offer, Hired আর Rejected।', ['একটি Card টেনে অন্য কলামে নিন, বা পরের ধাপের Button চাপুন।', 'Card খুলে উত্তর আর CV পড়ুন, Rating দিন, Note লিখুন আর Message পাঠান।', 'Book interview সময় ও জায়গা ঠিক করে SMS-এ আমন্ত্রণ পাঠায়।', 'Hire চাপলে Add staff খোলে, নাম, মোবাইল, Email আর পদ আগে থেকেই বসানো থাকে।'], ['Table-এ একই আবেদনকারীদের Sheet-এর মতো দেখায়, Filter আর CSV Export সহ।', 'আবেদনকারীরা SMS-এর Code দিয়ে নিজেদের পেজে অবস্থা দেখেন; আপনার Note বা Rating তাঁরা কখনো দেখেন না।'], null),
    related: ['/hiring', '/staff-create'],
  },
  '/admin/career': {
    en: E('Grid Career: GridCommerce’s own hiring, and the control centre for stores that hire with it.', ['Post GridCommerce’s jobs here; they show on /jobs.', 'Follow applicants in Applicants (board or table).', 'Set the /jobs page’s headline, benefits and messages in Careers page.', 'See which stores use Grid Career, and hide a store job that breaks the rules, in Stores.'], ['Open Grid Career for more stores, or block one, in Services › Access › Grid Career.'], null),
    bn: E('Grid Career: GridCommerce-এর নিজের নিয়োগ, আর যেসব Store এটি দিয়ে নিয়োগ দেয় তাদের নিয়ন্ত্রণ।', ['GridCommerce-এর Job এখানে দিন; সেগুলো /jobs-এ দেখায়।', 'Applicants-এ আবেদনকারীদের দেখুন (Board বা Table)।', 'Careers page-এ /jobs পেজের শিরোনাম, সুবিধা আর Message ঠিক করুন।', 'Stores-এ দেখুন কোন Store Grid Career ব্যবহার করছে, আর নিয়ম ভাঙা Job লুকান।'], ['Services › Access › Grid Career-এ আরও Store-এর জন্য চালু করুন বা কোনো Store বন্ধ করুন।'], null),
    related: ['/admin/career/applicants', '/admin/career/page', '/admin/career/stores', '/admin/services/access'],
  },
  // end Batch F
  '/services': {
    en: E('Buy expert help from GridCommerce and its partners: SEO, ads, branding, store design, product upload, moving platforms, setup and product writing.', ['Pick a service and compare its packages.', 'Order it: choose a package, answer the short brief and pay.', 'An expert starts within a working day; follow it in My services.'], ['SEO and ads are monthly: the first month is paid now, the rest with your subscription.', 'Ad spend is never in our price: you pay Meta or Google directly.'], null),
    bn: E('GridCommerce ও তার Partner-দের কাছ থেকে Expert-এর সাহায্য কিনুন: SEO, Ads, Branding, Store design, Product upload, অন্য Platform থেকে আনা, Setup আর Product লেখা।', ['একটি Service বেছে তার Package মিলিয়ে দেখুন।', 'Order করুন: Package বাছুন, ছোট Brief-এর উত্তর দিন আর Payment করুন।', 'এক কর্মদিবসের মধ্যে Expert কাজ শুরু করেন; My services-এ দেখুন।'], ['SEO আর Ads মাসিক: প্রথম মাস এখন, বাকিগুলো Subscription-এর সাথে।', 'Ad-এর খরচ আমাদের দামে নেই: Meta বা Google-কে আপনি সরাসরি দেন।'], null),
    related: ['/my-services'],
  },
  '/grid-shop': {
    en: E('Grid Shop: business supplies from GridCommerce: packaging, receipt printers and scanners, labels and shop supplies.', ['Pick a category or search, then Add to the cart.', 'Open an item to see bulk prices, where it ships from and the days.', 'Check out: the address, then pay with bKash, Nagad, card or credits.'], ['Some items ship from GridCommerce stock; others come straight from the maker in their own parcel.', 'Bulk prices apply from the quantity shown.'], null),
    bn: E('Grid Shop: GridCommerce থেকে ব্যবসার সামগ্রী: প্যাকেজিং, রসিদ প্রিন্টার ও স্ক্যানার, লেবেল আর দোকানের সামগ্রী।', ['একটি বিভাগ বাছুন বা খুঁজুন, তারপর Cart-এ দিন।', 'একটি সামগ্রী খুলে বেশি কেনার দাম, কোথা থেকে আসে আর কত দিন লাগে দেখুন।', 'Checkout: ঠিকানা দিন, তারপর bKash, Nagad, Card বা Credit দিয়ে Payment করুন।'], ['কিছু সামগ্রী GridCommerce-এর স্টক থেকে যায়; বাকিগুলো নির্মাতা নিজে আলাদা পার্সেলে পাঠান।', 'দেখানো পরিমাণ থেকে বেশি কেনার দাম প্রযোজ্য।'], null),
    related: ['/grid-shop-orders', '/services'],
  },
  '/grid-shop-orders': {
    en: E('Your Grid Shop orders and where each parcel is.', ['Open an order to see each parcel, its courier and tracking number.', 'Cancel for a full refund until the first parcel leaves.'], ['Order again puts the same items back in the cart.'], null),
    bn: E('আপনার Grid Shop Order আর প্রতিটি পার্সেল কোথায়।', ['একটি Order খুলে প্রতিটি পার্সেল, কুরিয়ার আর ট্র্যাকিং নম্বর দেখুন।', 'প্রথম পার্সেল রওনা হওয়ার আগ পর্যন্ত বাতিল করলে পুরো টাকা ফেরত।'], ['আবার Order করুন একই সামগ্রী Cart-এ দেয়।'], null),
    related: ['/grid-shop'],
  },
  // Batch E · Grid Shop vendor portal and pricing rules
  '/vendor-sign-in': {
    en: E('Sign in to the Grid Shop vendor portal, where vendors sell to GridCommerce stores.', ['Demo: tap a vendor, such as Star Tech, to sign in.', 'The real portal sends a one-time code to the vendor’s email.'], ['Want to sell on Grid Shop? Write to vendors@gridcommerce.net.'], null),
    bn: E('Grid Shop Vendor portal-এ Sign in করুন, যেখানে Vendor-রা GridCommerce-এর দোকানগুলোতে বিক্রি করেন।', ['Demo: একটি Vendor (যেমন Star Tech) চাপলেই Sign in হবে।', 'আসল Portal Vendor-এর Email-এ একবারের Code পাঠায়।'], ['Grid Shop-এ বিক্রি করতে চান? vendors@gridcommerce.net-এ লিখুন।'], null),
    related: ['/vendor'],
  },
  '/vendor': {
    en: E('Your Grid Shop at a glance: sales, parcels to ship, your balance and products waiting for approval.', ['Ship the parcels in Parcels to ship first.', 'Check Products for approval: a rejected product shows why.', 'Your rates show what GridCommerce takes and any store discount you pay for.'], ['GridCommerce takes the store’s payment; you are paid for a parcel once it is delivered.'], null),
    bn: E('এক নজরে আপনার Grid Shop: বিক্রি, পাঠানোর পার্সেল, আপনার Balance আর অনুমোদনের অপেক্ষায় থাকা Product।', ['আগে Parcels to ship-এর পার্সেলগুলো পাঠান।', 'Products for approval দেখুন: বাতিল হলে কারণ দেখাবে।', 'Your rates-এ GridCommerce কত নেয় আর কোন Discount আপনি দেন তা দেখাবে।'], ['দোকানের Payment GridCommerce নেয়; পার্সেল পৌঁছালে আপনি টাকা পান।'], null),
    related: ['/vendor-orders', '/vendor-products', '/vendor-money'],
  },
  '/vendor-products': {
    en: E('Everything you sell on Grid Shop, with what stores pay and what you get.', ['Add product, fill it in and send it for approval.', 'Change stock right in the row: it saves at once.', 'A rejected product shows the reason; fix it and send it again.'], ['Changes to price, text or pictures of a live product wait for GridCommerce to approve them.'], null),
    bn: E('Grid Shop-এ আপনি যা বিক্রি করেন, দোকান কত দেয় আর আপনি কত পান সহ।', ['Add product চেপে তথ্য দিন আর অনুমোদনের জন্য পাঠান।', 'Row-এই Stock বদলান: সাথে সাথে Save হয়।', 'বাতিল হওয়া Product-এ কারণ দেখাবে; ঠিক করে আবার পাঠান।'], ['চালু Product-এর দাম, লেখা বা ছবি বদলালে GridCommerce-এর অনুমোদনের অপেক্ষায় থাকে।'], null),
    related: ['/vendor-product', '/vendor'],
  },
  '/vendor-product': {
    en: E('Add or change one of your products.', ['Fill in the name, category, short pitch and what it is.', 'Add pictures and your price; the box shows what stores will pay and what you get.', 'Save a draft, or send it for approval.'], ['Stock changes at once; other changes to a live product wait for approval.', 'Bulk prices apply from the quantity you set.'], null),
    bn: E('আপনার একটি Product যোগ করুন বা বদলান।', ['নাম, বিভাগ, ছোট বর্ণনা আর বিস্তারিত লিখুন।', 'ছবি আর আপনার দাম দিন; পাশে দেখাবে দোকান কত দেবে আর আপনি কত পাবেন।', 'Draft রাখুন, বা অনুমোদনের জন্য পাঠান।'], ['Stock সাথে সাথে বদলায়; চালু Product-এর বাকি বদল অনুমোদনের অপেক্ষায় থাকে।', 'যত পরিমাণ থেকে ঠিক করবেন, সেখান থেকে বেশি কেনার দাম।'], null),
    related: ['/vendor-products'],
  },
  '/vendor-orders': {
    en: E('Parcels stores bought from you: to ship, on the way and delivered.', ['Open a parcel to accept it.', 'Pack it, then book Steadfast, Pathao or RedX, or use your own courier.', 'Mark it delivered when the store has it.'], ['A delivered parcel is owed to you and paid in your next payout.'], null),
    bn: E('দোকান আপনার কাছ থেকে যে পার্সেল কিনেছে: পাঠানোর, পথে আর পৌঁছানো।', ['পার্সেল খুলে Accept করুন।', 'Pack করুন, তারপর Steadfast, Pathao বা RedX Book করুন, বা নিজের কুরিয়ার দিন।', 'দোকান পেলে Delivered করুন।'], ['পৌঁছানো পার্সেলের টাকা আপনার পাওনা, পরের Payout-এ পাবেন।'], null),
    related: ['/vendor-order', '/vendor-money'],
  },
  '/vendor-order': {
    en: E('One parcel: the items, where it goes and its next step.', ['Accept, then Start packing.', 'Book a courier: the tracking number goes to the store.', 'Mark delivered once the store has it.'], ['Money for this parcel shows the commission, any discount you pay and your fee per parcel.'], null),
    bn: E('একটি পার্সেল: সামগ্রী, কোথায় যাবে আর পরের ধাপ।', ['Accept করুন, তারপর Start packing।', 'কুরিয়ার Book করুন: ট্র্যাকিং নম্বর দোকানে যায়।', 'দোকান পেলে Mark delivered করুন।'], ['Money for this parcel-এ Commission, আপনার দেওয়া Discount আর প্রতি পার্সেলের Fee দেখাবে।'], null),
    related: ['/vendor-orders'],
  },
  '/vendor-money': {
    en: E('What Grid Shop owes you, parcel by parcel, and your payouts.', ['Check the balance: delivered parcels less monthly fees due.', 'Request payout to be paid to the account in your profile.', 'See every payout and monthly fee in the tabs.'], ['Parcels are owed once delivered.', 'Monthly fees come off a payout when the balance covers them.'], null),
    bn: E('Grid Shop আপনাকে কত দেবে, পার্সেল ধরে, আর আপনার Payout।', ['Balance দেখুন: পৌঁছানো পার্সেল থেকে মাসিক Fee বাদে।', 'Request payout চাপলে Profile-এর Account-এ টাকা যায়।', 'Tab-এ প্রতিটি Payout আর মাসিক Fee দেখুন।'], ['পার্সেল পৌঁছালে তবে টাকা পাওনা হয়।', 'Balance-এ কুলালে মাসিক Fee Payout থেকে কাটা হয়।'], null),
    related: ['/vendor-orders', '/vendor-profile'],
  },
  '/vendor-profile': {
    en: E('Your company, contact, payout account and return and warranty terms.', ['Add your logo and check the contact details.', 'Check the payout account twice: every payout goes there.', 'Write your return and warranty terms: stores see them on each product.'], ['Your pricing and charges are agreed with GridCommerce and shown here read-only.'], null),
    bn: E('আপনার প্রতিষ্ঠান, যোগাযোগ, Payout Account আর ফেরত ও Warranty-র শর্ত।', ['Logo দিন আর যোগাযোগের তথ্য দেখুন।', 'Payout Account দুবার মিলিয়ে নিন: সব Payout সেখানে যায়।', 'ফেরত আর Warranty-র শর্ত লিখুন: দোকান প্রতিটি Product-এ দেখে।'], ['আপনার দাম আর চার্জ GridCommerce-এর সাথে ঠিক করা; এখানে শুধু দেখা যায়।'], null),
    related: ['/vendor-money'],
  },
  '/admin/grid-shop/pricing': {
    en: E('GridCommerce’s charges and discounts on both sides of Grid Shop.', ['Add a rule: who pays, what it is (commission, markup, fee, discount, platform fee), the amount and who it covers.', 'Set dates for a time-limited offer, and switch rules on or off.', 'Try a price: pick a product, a store and a quantity to see what everyone pays and gets.'], ['One rule of each kind applies: the most specific (product, then vendor, store, plan).', 'Orders keep the prices they were sold at.'], null),
    bn: E('Grid Shop-এর দুই দিকে GridCommerce-এর চার্জ আর Discount।', ['Rule যোগ করুন: কে দেবে, কী (Commission, Markup, Fee, Discount, Platform fee), কত আর কার জন্য।', 'সময়সীমা দিন, আর Rule চালু বা বন্ধ করুন।', 'Try a price: Product, দোকান আর পরিমাণ বেছে দেখুন কে কত দেয় আর পায়।'], ['একেক ধরনের একটিই Rule খাটে: সবচেয়ে নির্দিষ্টটি (Product, তারপর Vendor, দোকান, Plan)।', 'Order যে দামে বিক্রি হয়েছে সেই দামই থাকে।'], null),
    related: ['/admin/grid-shop/vendors', '/admin/grid-shop/products'],
  },
  // Batch E · Grid Partners (models, influencers, video creators)
  '/partners': {
    en: E('Grid Partners: models, influencers and video creators checked by GridCommerce, ready to work with your shop.', ['Pick a type, or filter by niche, city, followers and budget.', 'Open a profile to see their platforms, sample work and rate card.', 'Send Request a quote with your brief, budget and date.'], ['Once the partner accepts, you both see each other’s phone and email.', 'You agree the work and pay the partner directly: GridCommerce takes no cut.'], null),
    bn: E('Grid Partners: GridCommerce-এর যাচাই করা মডেল, ইনফ্লুয়েন্সার আর ভিডিও ক্রিয়েটর, আপনার শপের সাথে কাজ করতে তৈরি।', ['একটি ধরন বাছুন, বা নিশ, শহর, ফলোয়ার আর বাজেট দিয়ে ফিল্টার করুন।', 'প্রোফাইল খুলে তাদের প্ল্যাটফর্ম, কাজের নমুনা আর রেট কার্ড দেখুন।', 'আপনার ব্রিফ, বাজেট আর তারিখ দিয়ে Request a quote পাঠান।'], ['পার্টনার রাজি হলে দুই পক্ষই একে অপরের ফোন ও ইমেইল দেখতে পাবেন।', 'কাজ আর টাকা আপনারা নিজেরাই ঠিক করবেন: GridCommerce কোনো কমিশন নেয় না।'], null),
    related: ['/partner-requests'],
  },
  '/partner-requests': {
    en: E('Your quote requests to Grid Partners and their answers.', ['Open a request to read the conversation and send a message.', 'Once accepted, call or email the partner from the request.', 'Mark it done when the work is delivered, then rate it.'], ['A waiting request can be withdrawn.', 'Your rating shows on the partner’s profile.'], null),
    bn: E('Grid Partners-এর কাছে আপনার কোটেশনের অনুরোধ আর তাদের উত্তর।', ['অনুরোধ খুলে কথোপকথন পড়ুন আর মেসেজ পাঠান।', 'রাজি হলে অনুরোধ থেকেই পার্টনারকে কল বা ইমেইল করুন।', 'কাজ পেলে Mark done চাপুন, তারপর রেটিং দিন।'], ['অপেক্ষায় থাকা অনুরোধ ফিরিয়ে নেওয়া যায়।', 'আপনার রেটিং পার্টনারের প্রোফাইলে দেখাবে।'], null),
    related: ['/partners'],
  },
  '/gp': {
    en: E('Your Grid Partners home: requests from stores, profile views and your share card.', ['Answer new requests first.', 'Finish your profile: stores pick complete profiles.', 'Share your public link or download the share card for social media.'], ['Stores see your phone and email only after you accept.', 'GridCommerce takes no cut: you agree the payment with the store.'], null),
    bn: E('আপনার Grid Partners হোম: দোকানের অনুরোধ, প্রোফাইল ভিউ আর শেয়ার কার্ড।', ['আগে নতুন অনুরোধের উত্তর দিন।', 'প্রোফাইল পূর্ণ করুন: দোকানগুলো পূর্ণ প্রোফাইল বেছে নেয়।', 'সোশ্যাল মিডিয়ার জন্য পাবলিক লিংক শেয়ার করুন বা শেয়ার কার্ড ডাউনলোড করুন।'], ['আপনি রাজি হলে তবেই দোকান আপনার ফোন ও ইমেইল দেখে।', 'GridCommerce কোনো কমিশন নেয় না: টাকা দোকানের সাথে ঠিক করুন।'], null),
    related: ['/gp-requests', '/gp-profile'],
  },
  '/admin/partners': {
    en: E('Every Grid Partner: approved and suspended models, influencers and video creators.', ['Review new creators in Applications against the minimum standards.', 'Open a partner to give the blue tick, feature or suspend them.', 'Requests shows every store ↔ partner request; cancel only for abuse.'], ['The standards, niches and cities are in Settings.', 'Who may use Grid Partners: Services › Access.'], null),
    bn: E('সব Grid Partner: অনুমোদিত ও স্থগিত মডেল, ইনফ্লুয়েন্সার আর ভিডিও ক্রিয়েটর।', ['Applications-এ ন্যূনতম মান মিলিয়ে নতুন ক্রিয়েটর যাচাই করুন।', 'পার্টনার খুলে ব্লু টিক দিন, ফিচার করুন বা স্থগিত করুন।', 'Requests-এ দোকান ↔ পার্টনারের সব অনুরোধ; শুধু অপব্যবহারে বাতিল করুন।'], ['মান, নিশ আর শহর Settings-এ।', 'কে Grid Partners ব্যবহার করতে পারবে: Services › Access।'], null),
    related: ['/admin/partners/applications', '/admin/partners/requests', '/admin/partners/settings'],
  },
  // end Batch E · Grid Partners
  '/my-services': {
    en: E('The services you bought: where each one is and what it needs from you.', ['Needs you lists orders waiting for an answer, store access, an approval or extra work.', 'Open an order to message the expert, approve the work or ask for a change, and rate it.'], ['The deadline stops while an order waits for you; without a reply it closes by itself after 14 days.'], null),
    bn: E('আপনার কেনা Service-গুলো: কোনটা কোথায় আছে আর আপনার কাছে কী দরকার।', ['Needs you-এ সেই Order-গুলো যেগুলো উত্তর, Store access, Approval বা বাড়তি কাজের অপেক্ষায়।', 'Order খুলে Expert-কে Message দিন, কাজ Approve করুন বা পরিবর্তন চান, আর Rating দিন।'], ['আপনার অপেক্ষায় থাকলে Deadline থেমে থাকে; উত্তর না দিলে ১৪ দিন পরে নিজে থেকে বন্ধ হয়।'], null),
    related: ['/services'],
  },
  '/seo': {
    en: E('How the website does in Google: a score with the issues to fix, redirects for addresses that moved, addresses customers tried that don’t exist, the sitemap and robots.txt.', ['Health lists every page Google can see that has an issue. Press Fix to write its title and description here.', 'Redirects are made by themselves when a live product, category, page, post or landing page gets a new address. Add one by hand for an old link.', 'Not found shows addresses people tried. Press Redirect to send them to the right page.', 'Sitemap and robots.txt are ready by default; change them only when you need to.'], ['Each page’s own title, description, share image and schema are in its editor, under Search engine listing.', 'The bulk editor changes titles, descriptions, addresses and alt text of many items at once.'], ['SEO in 3 minutes', '3:00']),
    bn: E('Google-এ Website কেমন দেখাচ্ছে: ঠিক করার বিষয়সহ একটি Score, ঠিকানা বদলানো Page-এর Redirect, Customer যে ঠিকানা খুঁজে পায়নি, Sitemap আর robots.txt।', ['Health-এ Google যে Page দেখতে পায় তার মধ্যে যেগুলোতে সমস্যা আছে সেগুলো দেখায়। Fix চেপে এখানেই শিরোনাম আর Description লিখুন।', 'Website-এ থাকা Product, Category, Page, Post বা Landing page-এর ঠিকানা বদলালে Redirect নিজেই তৈরি হয়। পুরোনো Link-এর জন্য নিজেও যোগ করতে পারেন।', 'Not found-এ মানুষ যে ঠিকানা খুঁজেছে তা দেখায়। Redirect চেপে সঠিক Page-এ পাঠান।', 'Sitemap আর robots.txt শুরু থেকেই ঠিক আছে; দরকার হলেই বদলান।'], ['প্রতিটি Page-এর নিজের শিরোনাম, Description, Share ছবি আর Schema তার Editor-এর Search engine listing-এ আছে।', 'Bulk editor-এ একসাথে অনেক আইটেমের শিরোনাম, Description, ঠিকানা আর Alt text বদলানো যায়।'], ['৩ মিনিটে SEO', '3:00']),
    related: ['/seo-bulk', '/set-seo', '/store-pages', '/all-products'],
  },
  '/seo-bulk': {
    en: E('Change the address, meta title, meta description and main image’s alt text of many items at once.', ['Pick Products, Categories, Pages, Blog posts or Landing pages.', 'Tick Only missing to see the rows without a description or alt text.', 'Type in the cells; changed cells turn blue.', 'Press Save changes.'], ['An empty title or description uses the default shown in grey.', 'A live item’s old address keeps working: a redirect is made.'], null),
    bn: E('একসাথে অনেক আইটেমের ঠিকানা, Meta title, Meta description আর প্রধান ছবির Alt text বদলান।', ['Products, Categories, Pages, Blog posts বা Landing pages বাছুন।', 'Description বা Alt text নেই এমন সারি দেখতে Only missing টিক দিন।', 'ঘরে লিখুন; বদলানো ঘর নীল হয়ে যায়।', 'Save changes চাপুন।'], ['শিরোনাম বা Description খালি রাখলে ধূসর লেখা Default ব্যবহার হয়।', 'Website-এ থাকা আইটেমের পুরোনো ঠিকানা কাজ করতে থাকে: একটি Redirect তৈরি হয়।'], null),
    related: ['/seo'],
  },
  '/merchant-overview': {
    name: 'Home',
    en: E('Your shop at a glance: today’s sales, orders and money in hand, what needs someone, and how sales are going.', ['Pick Today or Yesterday and a place at the top; the figures and charts follow it.', 'Press Needs you for the work waiting (orders to verify, payouts to check, bills to pay). Each line opens the page where it is done; snooze or dismiss what can wait.', 'Ask GridAI about sales, orders or stock in the box under the greeting.', 'Sales summary, Order summary and Stock alert sit below; each opens its full page.'], ['Numbers update as orders, payments and stock change.', 'The monthly target is set under This month.', 'Deeper analysis is in Analytics › Reports.'], null),
    bn: E('এক নজরে আপনার Shop: আজকের Sales, Order আর হাতে থাকা টাকা, কী কাজ বাকি আর বিক্রি কেমন চলছে।', ['উপরে আজ বা গতকাল আর একটি জায়গা বাছুন; সংখ্যা আর Chart সেটাই দেখায়।', 'বাকি কাজ দেখতে Needs you চাপুন (যাচাই করার Order, মেলানোর Payout, দেওয়ার Bill)। প্রতিটি লাইন কাজের Page খোলে; যা পরে করা যায় তা Snooze বা Dismiss করুন।', 'অভিবাদনের নিচের ঘরে GridAI-কে Sales, Order বা Stock নিয়ে প্রশ্ন করুন।', 'নিচে Sales summary, Order summary আর Stock alert; প্রতিটি পুরো Page খোলে।'], ['Order, Payment, Stock বদলালে সংখ্যাও বদলায়।', 'মাসের লক্ষ্য This month-এ ঠিক করা হয়।', 'বিস্তারিত হিসাব Analytics › Reports-এ।'], null),
    related: ['/my-dashboard', '/merchant-orders', '/daily-summary', '/notifications', '/reports-centre'],
  },
  '/notifications': {
    en: E('Everything that needs someone, newest first: new orders, payments due, low stock, late payouts, approvals, meeting notes, support tickets and mentions.', ['Tap a notification to open the page where it is done; it is marked read.', 'Use the type chips to see one kind, and Unread to see what is new.', 'Settings: choose for each kind whether you get it in the app, with a sound, by email or by SMS, and set quiet hours.'], ['Your settings are your own; each person sets theirs.', 'The bell in the top bar shows the newest six.'], null),
    bn: E('যা কিছুর জন্য কাউকে দরকার, নতুনগুলো আগে: নতুন Order, বাকি Payment, কম Stock, দেরি হওয়া Payout, Approval, Meeting-এর নোট, Support ticket আর Mention।', ['কাজের Page খুলতে একটি Notification চাপুন; সেটি পড়া হয়েছে বলে চিহ্নিত হয়।', 'একটি ধরন দেখতে ধরনের Chip, আর নতুনগুলো দেখতে Unread ব্যবহার করুন।', 'Settings: প্রতিটি ধরনের জন্য বাছুন App-এ, শব্দসহ, Email-এ বা SMS-এ পাবেন কি না, আর Quiet hours ঠিক করুন।'], ['আপনার Settings শুধু আপনার; প্রত্যেকে নিজেরটা ঠিক করেন।', 'উপরের বারের ঘণ্টায় নতুন ছয়টি দেখায়।'], null),
    related: ['/merchant-overview', '/my-account'],
  },
  '/my-dashboard': {
    en: E('Your own day: your tasks, follow-ups, attendance and the numbers for your job.', ['Tick tasks as you finish them.', 'Call the customers in My follow-ups on time.', 'Open a block’s report for the full picture.'], ['The menu shows only the pages your role uses.'], ['Your dashboard', '1:30']),
    bn: E('আপনার নিজের দিন: আপনার Task, Follow-up, হাজিরা আর আপনার কাজের হিসাব।', ['কাজ শেষ হলে Task-এ টিক দিন।', 'My follow-ups-এর Customer-দের সময়মতো Call করুন।', 'পুরো হিসাব দেখতে কোনো অংশের Report খুলুন।'], ['Menu-তে শুধু আপনার কাজের page দেখায়।'], ['আপনার Dashboard', '1:30']),
    related: ['/tasks', '/team-chat', '/sales-leads'],
  },
  '/tasks': {
    en: E('The team’s work in one place: who does what, by when, and what is waiting on what.', ['Press New task, choose the team and the person, set a due date.', 'Use My tasks for your list; Board to move tasks by dragging.', 'Something broken? Press Ask IT.'], ['A task with no person is open for anyone in its team to take.', 'Tick a few tasks to change them together.'], ['Tasks and teams', '3:00']),
    bn: E('টিমের সব কাজ এক জায়গায়: কে কী করবে, কবে মধ্যে, আর কোন কাজ কিসের জন্য আটকে আছে।', ['New task চাপুন, Team আর লোক বাছুন, Due date দিন।', 'নিজের কাজ My tasks-এ; Board-এ টেনে কাজ সরান।', 'কিছু নষ্ট হলে Ask IT চাপুন।'], ['যে Task-এ কোনো লোক নেই, Team-এর যে কেউ নিতে পারে।', 'কয়েকটা Task টিক দিয়ে একসাথে বদলান।'], ['Task আর Team', '3:00']),
    related: ['/team-chat', '/my-dashboard'],
  },
  '/team-chat': {
    en: E('Talk with your team and other teams, share tasks and turn messages into tasks.', ['Pick a channel or person on the left.', 'Type @ to mention someone, #TK- to link a task.', 'Hover a message to react, reply, pin or make a task.'], ['#announcements is for the owner and HR.'], ['Team chat', '2:00']),
    bn: E('নিজের আর অন্য Team-এর সাথে কথা বলুন, Task শেয়ার করুন, Message থেকে Task বানান।', ['বাঁ দিক থেকে Channel বা লোক বাছুন।', 'কাউকে ডাকতে @ লিখুন, Task জুড়তে #TK- লিখুন।', 'Message-এর উপর গেলে React, Reply, Pin বা Task বানানো যায়।'], ['#announcements-এ শুধু মালিক আর HR লেখেন।'], ['Team chat', '2:00']),
    related: ['/tasks'],
  },
  '/merchant-orders': {
    en: E('Every order, from new to delivered.', ['New orders start On hold (COD), Processing (paid) or Pending (payment due).', 'Open an order to verify it by call, then approve, take an advance or cancel.', 'Pack it, print the slip, then send it to the courier. It shows Sent to courier until it is delivered.'], ['Approved orders hold their stock.', 'Order SMS and email: Settings › Order notifications.'], ['Process an order start to finish', '3:40']),
    bn: E('সব Order — নতুন থেকে Delivered পর্যন্ত।', ['নতুন Order শুরু হয় হোল্ডে (COD), প্রসেসিং (Paid) বা Pending (Payment বাকি) হয়ে।', 'Order খুলে Call করে যাচাই করুন, তারপর Approve, Advance নিন বা Cancel করুন।', 'Pack করুন, Slip Print করুন, তারপর Courier-এ পাঠান। Delivered না হওয়া পর্যন্ত এটি Courier-এ পাঠানো দেখায়।'], ['Approved Order-এর Stock আলাদা রাখা থাকে।', 'Order SMS ও Email: Settings › Order notifications।'], ['একটি Order শুরু থেকে শেষ', '3:40']),
    related: ['/new-order', '/courier-returns', '/return-exchange'],
  },
  '/order-detail': {
    en: E('One order: items, customer, payment, courier and its history.', ['Move the order to the next step with the main button.', 'Print the invoice or POS memo from More.', 'Use Return if the customer sends items back.'], ['Every change is saved in the order history.'], ['Order details', '2:20']),
    bn: E('একটি Order: পণ্য, Customer, Payment, Courier আর পুরো ইতিহাস।', ['মূল button দিয়ে Order পরের ধাপে নিন।', 'More থেকে Invoice বা POS memo Print করুন।', 'Customer পণ্য ফেরত দিলে Return চাপুন।'], ['প্রতিটি পরিবর্তন Order-এর ইতিহাসে থাকে।'], ['Order-এর বিস্তারিত', '2:20']),
    related: ['/merchant-orders', '/return-exchange'],
  },
  '/new-order': {
    en: E('Make an order for a phone or chat customer and choose delivery and payment.', ['Search and add products.', 'Enter the customer’s phone — known customers fill in by themselves.', 'Choose delivery area and payment, then Create order.'], ['Cash on delivery is the default.'], ['Take a phone order', '2:30']),
    bn: E('Phone বা Chat-এর Customer-এর জন্য Order বানান, Delivery আর Payment বাছুন।', ['Product খুঁজে যোগ করুন।', 'Customer-এর Phone দিন — পুরনো Customer হলে তথ্য নিজে বসে যাবে।', 'Delivery এলাকা আর Payment বাছুন, তারপর Create order।'], ['শুরুতে Cash on delivery বাছা থাকে।'], ['Phone-এ Order নেওয়া', '2:30']),
    related: ['/merchant-orders', '/all-customers'],
  },
  '/pos': {
    en: E('The shop counter: sell, take payment and print the memo.', ['Scan or search products to add them.', 'Choose the customer (or walk-in).', 'Press Pay, take cash, bKash or card, then print.'], ['Press F1 for keyboard shortcuts.', 'When customer dues are on (Settings › Customers), a sale can be left as Due on an invoice.', 'Collect due takes an old due at the counter and prints a money receipt.', 'A discount or price change above your role’s limit needs an approver’s PIN.'], ['Make a sale at the counter', '3:00']),
    bn: E('দোকানের Counter: বিক্রি করুন, Payment নিন, Memo Print করুন।', ['Scan বা Search করে Product যোগ করুন।', 'Customer বাছুন (বা Walk-in)।', 'Pay চাপুন, Cash, bKash বা Card নিন, তারপর Print।'], ['Keyboard shortcut দেখতে F1 চাপুন।', 'Customer-এর বাকি চালু থাকলে (Settings › Customers) বিক্রি Invoice-এ বাকি রাখা যায়।', 'Collect due দিয়ে Counter-এ পুরোনো বাকি নিন, মানি রিসিট Print হয়।', 'আপনার Role-এর সীমার বেশি ছাড় বা দাম বদলে অনুমোদনকারীর PIN লাগে।'], ['Counter-এ বিক্রি', '3:00']),
    related: ['/pos-manage', '/sales-invoices', '/return-exchange'],
  },
  '/pos-manage': {
    en: E('Behind the counter: counters, staff and shifts, cash pickups and POS settings.', ['Open a counter’s shift and close it with a cash count.', 'Record cash taken from a drawer in Cash pickups.'], ['Over or short cash is shown on the shift report.', 'Settings › POS limits by role: what each role does on its own; each approver has their own PIN.', 'Report › Print 80 mm or A4 prints the shift’s Z-report.'], ['Counters and cash', '2:40']),
    bn: E('Counter-এর পেছনের কাজ: Counter, Staff আর Shift, Cash pickup আর POS settings।', ['Counter-এর Shift খুলুন, Cash গুনে বন্ধ করুন।', 'Drawer থেকে টাকা তুললে Cash pickups-এ লিখুন।'], ['Cash কম-বেশি হলে Shift report-এ দেখায়।', 'Settings › Role অনুযায়ী POS সীমা: কোন Role নিজে কী করতে পারে; প্রত্যেক অনুমোদনকারীর নিজের PIN।', 'Report › Print 80 mm বা A4 দিয়ে Shift-এর Z-report Print করুন।'], ['Counter আর Cash', '2:40']),
    related: ['/pos', '/daily-summary'],
  },
  '/sales-invoices': {
    en: E('Invoices for sales on due: who has paid, who has not.', ['Open an invoice and check it, then press Accept invoice.', 'Once accepted, record the payment. The full payment completes the sale and its order.', 'Edit an unpaid invoice with a reason: it becomes a new revision that is accepted again.'], ['To accept lists invoices nobody has checked yet. Each customer’s page has the same list under Invoices.'], ['Collect an invoice payment', '2:00']),
    bn: E('বাকির বিক্রির Invoice: কে টাকা দিয়েছে, কে দেয়নি।', ['Invoice খুলে দেখে Accept invoice চাপুন।', 'গ্রহণের পর Payment লিখুন। পুরো Payment দিলে বিক্রি আর Order শেষ হয়।', 'কারণ লিখে বাকি Invoice বদলান: নতুন সংশোধন হয়, আবার গ্রহণ করতে হয়।'], ['গ্রহণ বাকি তালিকায় যেগুলো কেউ দেখেনি। প্রতিটি Customer-এর পাতায় Invoices-এ একই তালিকা আছে।'], ['Invoice-এর টাকা তোলা', '2:00']),
    related: ['/dues', '/pos', '/all-customers'],
  },
  '/return-exchange': {
    en: E('Take back items from any sale — online or counter — and refund or exchange.', ['Find the sale by memo, order or phone.', 'Choose items and the reason, then refund or exchange.'], ['Good items go back to stock; damaged ones go to the damaged bay.'], ['Returns and exchanges', '2:30']),
    bn: E('যেকোনো বিক্রি — Online বা Counter — থেকে পণ্য ফেরত নিন, টাকা ফেরত বা Exchange করুন।', ['Memo, Order বা Phone দিয়ে বিক্রি খুঁজুন।', 'পণ্য আর কারণ বাছুন, তারপর Refund বা Exchange।'], ['ভালো পণ্য Stock-এ ফেরে; নষ্ট পণ্য Damaged-এ যায়।'], ['Return আর Exchange', '2:30']),
    related: ['/return-history', '/merchant-orders'],
  },
  '/all-customers': {
    en: E('Everyone who bought or signed up, with their orders, spending and dues.', ['Search by name or phone.', 'Open a customer to see orders, payments and notes.', 'Add a customer with their phone; set a credit limit if they may buy on due.'], ['Customers with the same phone can be merged.'], ['Customers', '2:00']),
    bn: E('যারা কিনেছেন বা Sign up করেছেন — তাদের Order, খরচ আর Due।', ['নাম বা Phone দিয়ে Search করুন।', 'Customer খুলে Order, Payment আর Note দেখুন।', 'Phone দিয়ে Customer যোগ করুন; বাকিতে কিনলে Credit limit দিন।'], ['একই Phone-এর Customer একসাথে করা যায়।'], ['Customer', '2:00']),
    related: ['/sales-leads', '/dues'],
  },
  // ---- Stage 3 · Online selling ----
  '/courier-handover': {
    en: E('Hand the day’s parcels to each courier’s rider, with a signed manifest.', ['Choose the courier, then scan or tick its parcels.', 'Check the count and the cash on delivery, and type the rider’s name.', 'Print manifest for the rider to sign, then press Mark handed over.'], ['Packed parcels not booked yet are booked with the courier as they go. Old manifests can be printed again.']),
    bn: E('দিনের Parcel প্রতিটি Courier-এর Rider-কে দিন, সই করা Manifest সহ।', ['Courier বাছুন, তারপর তার Parcel Scan বা টিক করুন।', 'সংখ্যা আর COD মিলিয়ে নিন, Rider-এর নাম লিখুন।', 'Rider-এর সইয়ের জন্য Print manifest করুন, তারপর Mark handed over চাপুন।'], ['প্যাক করা কিন্তু Book না হওয়া Parcel দেওয়ার সময় Courier-এ Book হয়। পুরনো Manifest আবার Print করা যায়।']),
    related: ['/courier-statement', '/merchant-orders', '/courier-returns'],
  },
  '/return-requests': {
    en: E('Returns of delivered online orders, step by step.', ['Open a request and Approve or Reject it.', 'Book the courier pickup, then mark it received: good pieces go back on sale, damaged ones to the damaged bay.', 'Refund the customer or send the same items again as a new order.'], ['Customers ask on their tracking page; staff can ask for them with Return on the order page.']),
    bn: E('Delivered Online Order-এর Return, ধাপে ধাপে।', ['Request খুলে Approve বা Reject করুন।', 'Courier Pickup Book করুন, পরে Received করুন: ভালো পণ্য আবার বিক্রিতে, নষ্ট পণ্য Damaged bay-তে যায়।', 'Customer-কে Refund দিন বা একই পণ্য নতুন Order হিসেবে আবার পাঠান।'], ['Customer তাদের Tracking পেজ থেকে চান; Staff Order পেজের Return দিয়ে চাইতে পারেন।']),
    related: ['/return-exchange', '/return-history', '/payment-ops'],
  },
  '/set-checkout': {
    en: E('How the online store’s checkout works.', ['Customer accounts: off, optional or required, and how customers sign in (a code to the mobile number, or email and password). “Save my details” makes an account after a guest order.', 'Choose guest checkout or sign-in with the mobile number, and whether the number is checked with a code.', 'Choose which details are asked: email, district and area, a note, the terms box.', 'Set a cash-on-delivery fee, a COD limit and the smallest order.'], ['The thank-you page links to the customer’s order page.']),
    bn: E('Online Store-এর Checkout কীভাবে চলবে।', ['Customer অ্যাকাউন্ট: বন্ধ, ঐচ্ছিক বা বাধ্যতামূলক, আর কীভাবে Sign in (মোবাইলে Code, বা Email ও Password)। “আমার তথ্য Save করুন” Guest order-এর পরে অ্যাকাউন্ট খোলে।', 'Guest checkout নাকি মোবাইল নম্বরে Sign-in, আর নম্বর Code দিয়ে যাচাই হবে কি না বাছুন।', 'কোন তথ্য চাওয়া হবে বাছুন: Email, জেলা আর এলাকা, Note, Terms-এর বক্স।', 'COD fee, COD-এর সীমা আর সবচেয়ে ছোট Order ঠিক করুন।'], ['Thank-you পেজে Customer-এর Order পেজের Link থাকে।']),
    related: ['/set-delivery', '/set-payments', '/set-privacy'],
  },
  '/affiliates': {
    en: E('People who promote your shop and earn a commission on the orders they bring.', ['Settings: the commission (% or fixed, other rates per category), how long a link counts, the minimum payout, the return window and the terms.', 'Applications come from the store’s “Become an affiliate” page; open one to Approve or Reject it.', 'Commission is payable after delivery and the return window. Make payouts adds it to Finances › Liabilities, where you pay it.'], ['An affiliate’s own orders never count. A code typed at checkout wins over a link.']),
    bn: E('যারা আপনার শপের প্রচার করে আর তাদের আনা Order-এ Commission পায়।', ['Settings: Commission (% বা নির্দিষ্ট টাকা, কিছু Category-র আলাদা হার), Link কত দিন গোনা হবে, সর্বনিম্ন Payout, Return-এর সময় আর শর্ত।', 'Store-এর “Affiliate হোন” পেজ থেকে আবেদন আসে; খুলে Approve বা Reject করুন।', 'Delivery আর Return-এর সময় পেরোলে Commission দেওয়ার যোগ্য হয়। Make payouts সেটা Finances › Liabilities-এ যোগ করে, সেখান থেকে দিন।'], ['Affiliate-এর নিজের Order কখনো গোনা হয় না। Checkout-এ লেখা Code, Link-এর চেয়ে আগে গোনা হয়।']),
    related: ['/liabilities', '/promo', '/loyalty'],
  },
  '/meetings': {
    en: E('Meetings with leads and customers on Zoom, Google Meet, by phone or at the shop.', ['Press New meeting: choose who, when, how long and where.', 'The link is made and the invite goes by WhatsApp or SMS; a reminder goes an hour before.', 'After the meeting, open it and write a short note, the outcome and the next follow-up.'], ['Needs a note lists meetings that ended without one. Connect Zoom or Google Meet in Connections.']),
    bn: E('Lead আর Customer-এর সাথে Meeting — Zoom, Google Meet, ফোনে বা দোকানে।', ['New meeting চাপুন: কার সাথে, কখন, কতক্ষণ আর কোথায় বাছুন।', 'Link তৈরি হয়, WhatsApp বা SMS-এ Invite যায়; এক ঘণ্টা আগে মনে করিয়ে দেওয়া হয়।', 'Meeting শেষে খুলে ছোট Note, ফলাফল আর পরের Follow-up লিখুন।'], ['Needs a note-এ Note ছাড়া শেষ হওয়া Meeting থাকে। Connections-এ Zoom বা Google Meet যুক্ত করুন।']),
    related: ['/sales-leads', '/all-customers', '/connections'],
  },
  // ---- Online Store › storefront builder (Module A) ----
  '/theme': {
    en: E('How your online store looks: the current look, presets and restore points.', ['Press Customize to change colours, fonts and page options.', 'Preview a preset (Signal, Nokshi, Counter) with your own products, then Import the parts you want.', 'Before every import and publish a restore point is made: Go back undoes it in one click.'], ['Importing never touches products, customers or orders.', 'Parts GridCommerce keeps fixed for your theme show as locked.']),
    bn: E('আপনার Online store দেখতে কেমন: এখনকার Look, Preset আর Restore point।', ['রং, Font আর পেজের Option বদলাতে Customize চাপুন।', 'নিজের Product দিয়ে একটি Preset (Signal, Nokshi, Counter) Preview করুন, তারপর যে অংশগুলো চান Import করুন।', 'প্রতিটি Import আর Publish-এর আগে একটি Restore point তৈরি হয়: Go back এক চাপে আগের অবস্থায় ফেরায়।'], ['Import কখনো Product, Customer বা Order ছোঁয় না।', 'GridCommerce আপনার Theme-এ যা ঠিক রাখে তা Locked দেখায়।']),
    related: ['/theme-editor', '/header-builder', '/layouts', '/html-blocks'],
  },
  '/snippets': {
    en: E('Safe code for your online store, without JavaScript.', ['Add snippet, then pick Tracking & verification (an ID from Meta, Google, TikTok or Bing), CSS, or Text or HTML.', 'Each one is checked as you type; it saves only when it is safe.', 'Use the switch to turn one off without deleting it.'], ['CSS and HTML never go on checkout, account or payment pages.', 'GridCommerce writes the tracking code from the ID; you never paste a script.']),
    bn: E('আপনার Online store-এর জন্য নিরাপদ কোড, JavaScript ছাড়া।', ['Add snippet চাপুন, তারপর Tracking & verification (Meta, Google, TikTok বা Bing-এর ID), CSS, অথবা Text or HTML বাছুন।', 'লেখার সাথে সাথে প্রতিটি যাচাই হয়; নিরাপদ হলে তবেই Save হয়।', 'মুছে না ফেলে বন্ধ রাখতে Switch ব্যবহার করুন।'], ['CSS আর HTML কখনো Checkout, Account বা Payment পেজে যায় না।', 'GridCommerce ID থেকে Tracking কোড লেখে; আপনাকে কোনো Script পেস্ট করতে হয় না।']),
    related: ['/theme-editor', '/html-blocks', '/seo'],
  },
  '/message-design': {
    en: E('How your emails and SMS look, set once for every message.', ['Email design: set the logo, colours, font, header and footer; the sample shows it on white, or press Dark to see the dark version.', 'Choose the language customers get: English, Bangla, or Bangla with English below.', 'Press Edit on any email to change its words and parts. SMS design: set the sender name and edit each SMS with a phone preview.'], ['Your shop details from Settings › General fill it in until you change them.', 'Which messages go out, and to whom, is set in Settings › Notifications.']),
    bn: E('আপনার ইমেইল আর SMS দেখতে কেমন হবে, সব মেসেজের জন্য একবারে।', ['Email design: লোগো, রং, ফন্ট, হেডার আর ফুটার ঠিক করুন; নমুনা সাদা ব্যাকগ্রাউন্ডে দেখায়, Dark চাপলে ডার্ক রূপ।', 'Customer কোন ভাষায় পাবেন বাছুন: ইংরেজি, বাংলা, বা বাংলার নিচে ইংরেজি।', 'যেকোনো ইমেইলের কথা আর অংশ বদলাতে Edit চাপুন। SMS design: Sender name আর প্রতিটি SMS ফোনের Preview-সহ বদলান।'], ['বদলানোর আগ পর্যন্ত Settings › General-এর তথ্য দিয়ে ভরা থাকে।', 'কোন মেসেজ কাকে যাবে তা Settings › Notifications-এ ঠিক হয়।']),
    related: ['/set-notifications', '/email-editor'],
  },
  '/email-editor': {
    en: E('Build one email from parts, in English and Bangla.', ['Pick a part on the left to change it; Add a part puts a new one after it.', 'Tap a variable to put it where you are typing; the preview fills it with a sample.', 'Check it on a computer and a phone, light and dark, then Save. Send test sends it to your shop email.'], ['Back to the default (More) puts the original email back.', '**bold** and [links](https://…) work in text.']),
    bn: E('অংশ দিয়ে একটি ইমেইল বানান, ইংরেজি আর বাংলায়।', ['বদলাতে বাঁ দিকে একটি অংশ বাছুন; Add a part তার পরে নতুন অংশ যোগ করে।', 'যেখানে লিখছেন সেখানে বসাতে একটি Variable চাপুন; Preview নমুনা দিয়ে দেখায়।', 'কম্পিউটার আর ফোনে, Light আর Dark-এ দেখে Save করুন। Send test আপনার শপের ইমেইলে পাঠায়।'], ['Back to the default (More) আগের ইমেইল ফিরিয়ে আনে।', 'লেখায় **bold** আর [link](https://…) চলে।']),
    related: ['/message-design', '/set-notifications'],
  },
  '/store-editor': {
    en: E('Edit your store on the page itself.', ['Pick the page at the top of the preview (Home, a product, a category …).', 'Click any section on the page, or in the list, and change it on the left. Drag sections to reorder them; Add section opens the library with every section and its looks.', 'Style changes the whole store at once; Header picks this page’s header. Save draft keeps your work; Publish shows it to customers.'], ['Undo and Redo (Ctrl+Z, Ctrl+Shift+Z) cover everything you change here.', 'Customize, Layouts and Header builder still hold every option.']),
    bn: E('পেজের ওপরেই আপনার Store সাজান।', ['Preview-এর ওপরে পেজ বাছুন (Home, একটি Product, একটি Category …)।', 'পেজে বা তালিকায় যেকোনো Section-এ চাপ দিন, বাঁ দিকে বদলান। টেনে Section-এর ক্রম বদলান; Add section-এ সব Section আর তাদের Look পাবেন।', 'Style এক চাপে পুরো Store বদলায়; Header এই পেজের Header বাছে। Save draft আপনার কাজ রাখে; Publish Customer-কে দেখায়।'], ['Undo আর Redo (Ctrl+Z, Ctrl+Shift+Z) এখানে করা সব বদল ফেরায়।', 'Customize, Layouts আর Header builder-এ সব Option আগের মতোই আছে।']),
    related: ['/theme', '/theme-editor', '/layouts', '/header-builder'],
  },
  '/theme-editor': {
    en: E('Change the theme’s options and see each change at once.', ['Pick a group or search an option (for example WhatsApp or font).', 'Change it: the preview on the right shows it on a computer or a phone.', 'Save draft keeps your work; Publish shows it to customers.'], ['Undo to last published throws your draft away. Reset to preset puts the preset’s options back in the draft.', 'A warning shows when text is hard to read on a colour.']),
    bn: E('Theme-এর Option বদলান আর সাথে সাথে দেখুন।', ['একটি Group বাছুন বা Option খুঁজুন (যেমন WhatsApp বা Font)।', 'বদলান: ডানের Preview কম্পিউটার বা ফোনে দেখায়।', 'Save draft আপনার কাজ রাখে; Publish Customer-কে দেখায়।'], ['Undo to last published Draft বাদ দেয়। Reset to preset Preset-এর Option Draft-এ ফেরায়।', 'কোনো রঙে লেখা পড়তে কষ্ট হলে সতর্কতা দেখায়।']),
    related: ['/theme', '/header-builder'],
  },
  '/header-builder': {
    en: E('Build the top of your store, separately for computers and phones.', ['Choose a header, then Computer or Phone.', 'Press Add in an area to place the logo, menu, search, cart and more; pick an element to change or move it.', 'Set each row’s height, colours and sticky, then Publish header.'], ['The default header shows everywhere; a layout can pick another.', 'Phone menu sets what the ☰ drawer holds and the bottom bar.']),
    bn: E('আপনার Store-এর উপরের অংশ বানান, কম্পিউটার আর ফোনের জন্য আলাদা করে।', ['একটি Header বাছুন, তারপর Computer বা Phone।', 'কোনো Area-তে Add চেপে Logo, Menu, Search, Cart ইত্যাদি বসান; বদলাতে বা সরাতে একটি Element বাছুন।', 'প্রতিটি Row-এর উচ্চতা, রং আর Sticky ঠিক করে Publish header চাপুন।'], ['Default header সবখানে দেখায়; একটি Layout অন্যটি বাছতে পারে।', 'Phone menu ঠিক করে ☰ Drawer-এ কী থাকবে আর নিচের Bar।']),
    related: ['/theme', '/store-menus', '/layouts'],
  },
  '/store-notices': {
    en: E('Short messages on your store: a sale with a countdown, a coupon code, a delivery cut-off.', ['Press Add notice and write it in English (and Bangla if you like), or fill it from an offer.', 'Choose where it shows, on which pages and devices, and from when until when.', 'Save: it shows at once. The preview at the bottom shows your store with it.'], ['Two notices in one place take turns. Turn one off without deleting it.', 'Customers can copy a code with one tap; a closed notice stays closed for that customer.']),
    bn: E('Store-এ ছোট বার্তা: Countdown সহ Sale, Coupon code, Delivery-র শেষ সময়।', ['Add notice চেপে ইংরেজিতে (চাইলে বাংলায়ও) লিখুন, বা একটি Offer থেকে ভরুন।', 'কোথায়, কোন পেজে আর ডিভাইসে, কখন থেকে কখন পর্যন্ত দেখাবে বাছুন।', 'Save করুন: সাথে সাথে দেখায়। নিচের Preview আপনার Store-এ সেটি দেখায়।'], ['একই জায়গায় দুটি Notice পালা করে দেখায়। মুছে না ফেলে একটি বন্ধ রাখা যায়।', 'Customer এক চাপে Code কপি করতে পারে; বন্ধ করা Notice সেই Customer-এর জন্য বন্ধই থাকে।']),
    related: ['/header-builder', '/theme', '/promo'],
  },
  '/html-blocks': {
    en: E('Reusable content: delivery info, a size guide, a banner, a footer.', ['Press Add block and build it like a page.', 'Place it in a layout, the header builder, a mega menu, the footer or the product page tab.'], ['Used in shows where each block appears. Deleting one warns you first.']),
    bn: E('বারবার ব্যবহারের Content: Delivery-র তথ্য, Size guide, Banner, Footer।', ['Add block চেপে পেজের মতো বানান।', 'Layout, Header builder, Mega menu, Footer বা Product page-এর Tab-এ বসান।'], ['Used in দেখায় কোন Block কোথায় আছে। মুছার আগে সতর্ক করা হয়।']),
    related: ['/layouts', '/header-builder', '/store-menus'],
  },
  '/layouts': {
    en: E('Each kind of store page is built from sections.', ['Open a layout or press Add layout and pick the kind of page.', 'Add, move and hide sections; set who sees it (all pages, a category, a product or a page).', 'Preview, then Publish.'], ['The most specific published layout wins on a page; without one the built-in layout shows.']),
    bn: E('Store-এর প্রতিটি ধরনের পেজ Section দিয়ে বানানো।', ['একটি Layout খুলুন বা Add layout চেপে পেজের ধরন বাছুন।', 'Section যোগ করুন, সরান, লুকান; কোথায় দেখাবে ঠিক করুন (সব পেজ, একটি Category, Product বা Page)।', 'Preview দেখে Publish করুন।'], ['একটি পেজে সবচেয়ে নির্দিষ্ট Published layout দেখায়; না থাকলে Built-in layout।']),
    related: ['/html-blocks', '/theme'],
  },
  '/files': {
    en: E('Every picture, video and document your shop uses, in one place.', ['Press Upload files, or drop files anywhere on the page. Pictures are resized for phones as they upload.', 'Open a file to give it a name and alt text, move it to a folder, copy its address or replace it.', 'Product photos, brand logos and blog covers saved on their own pages are listed too; change them there.'], ['A file that is used somewhere is kept when you delete many at once.', 'Replace keeps the same address, so every page shows the new file.']),
    bn: E('আপনার দোকানের সব ছবি, ভিডিও আর ডকুমেন্ট এক জায়গায়।', ['Upload files চাপুন, বা পেজের যেকোনো জায়গায় ফাইল ছেড়ে দিন। ছবি আপলোডের সময় ফোনের জন্য ছোট করা হয়।', 'ফাইল খুলে নাম আর Alt text দিন, ফোল্ডারে সরান, ঠিকানা কপি করুন বা বদলে দিন।', 'Product, Brand আর Blog-এর ছবিও এখানে দেখা যায়; সেগুলো নিজ নিজ পেজে বদলান।'], ['কোথাও ব্যবহার হচ্ছে এমন ফাইল একসাথে মুছলেও রেখে দেওয়া হয়।', 'Replace একই ঠিকানা রাখে, তাই সব পেজে নতুন ফাইল দেখায়।']),
    related: ['/set-hosting', '/layouts', '/all-products'],
  },
  '/email-inbox': {
    en: E('The shop’s email (info@, sales@, support@, orders@) in one list.', ['Open an email to read it; it is marked read.', 'Reply sends from the address it came to. Forward sends it on; Note is only for your team.', 'Assign it to someone so the team knows who answers. Archive it when it is done.'], ['The sender is matched to a customer, and order numbers in the mail open the order.', 'Set up Business email in Settings to get mail at your own addresses.']),
    bn: E('দোকানের Email (info@, sales@, support@, orders@) এক তালিকায়।', ['Email খুলে পড়ুন; সেটি পড়া হিসেবে চিহ্নিত হয়।', 'Reply যে ঠিকানায় Email এসেছে সেখান থেকে যায়। Forward অন্যকে পাঠায়; Note শুধু আপনার টিম দেখে।', 'কে উত্তর দেবে টিম যেন জানে, তাই কাউকে Assign করুন। কাজ শেষ হলে Archive করুন।'], ['প্রেরককে Customer-এর সাথে মেলানো হয়, আর Email-এ থাকা Order নম্বর Order খোলে।', 'নিজের ঠিকানায় Email পেতে Settings-এ Business email চালু করুন।']),
    related: ['/email', '/merchant-inbox', '/support-tickets'],
  },
  '/supplier-return': {
    en: E('Send goods back to a supplier: anything you bought from them, or damaged items from deliveries.', ['Press Return bought items, choose the supplier and how many go back.', 'Choose Deduct from what we owe (a credit note) or Send a replacement.', 'When a replacement arrives, open the return and press Receive.'], ['A return takes the pieces off stock at the place you choose.']),
    bn: E('Supplier-কে মাল ফেরত দিন: তাদের কাছ থেকে কেনা যেকোনো পণ্য, বা ডেলিভারিতে আসা নষ্ট পণ্য।', ['Return bought items চাপুন, Supplier আর কয়টি ফেরত যাবে বাছুন।', 'Deduct from what we owe (Credit note) বা Send a replacement বাছুন।', 'বদলি মাল এলে Return খুলে Receive চাপুন।'], ['Return বাছাই করা জায়গার Stock থেকে পণ্য কমায়।']),
    related: ['/purchases', '/suppliers', '/receive-goods'],
  },
  '/sales-leads': {
    en: E('People and shops who might buy, and when to call them back.', ['Add a lead from a call, message or walk-in.', 'After each call press Log it and set the next follow-up.', 'Mark Won when they buy — they become a customer.'], ['Overdue follow-ups are at the top.'], ['Leads and follow-ups', '2:30']),
    bn: E('যারা কিনতে পারেন — আর কবে আবার Call করবেন।', ['Call, Message বা Walk-in থেকে Lead যোগ করুন।', 'প্রতিটি Call-এর পর Log it চাপুন, পরের Follow-up দিন।', 'কিনলে Won করুন — তিনি Customer হয়ে যাবেন।'], ['সময় পেরোনো Follow-up সবার উপরে থাকে।'], ['Lead আর Follow-up', '2:30']),
    related: ['/all-customers', '/tasks'],
  },
  '/all-products': {
    en: E('Every product you sell, with price, stock and photos.', ['Add product for a new item.', 'Search by name, SKU or barcode; open a product to edit it.', 'Fix the "missing information" list so products sell better online.'], ['Stock numbers come from your warehouses and branches.'], ['Products', '2:30']),
    bn: E('যা যা বিক্রি করেন — দাম, Stock আর ছবি সহ।', ['নতুন পণ্যের জন্য Add product।', 'নাম, SKU বা Barcode দিয়ে Search করুন; Product খুলে Edit করুন।', 'Online-এ ভালো বিক্রির জন্য তথ্য কম থাকা Product ঠিক করুন।'], ['Stock-এর হিসাব Warehouse আর Branch থেকে আসে।'], ['Product', '2:30']),
    related: ['/add-product', '/stock', '/categories', '/brands'],
  },
  '/ai-knowledge': {
    en: E('What Grid AI knows about your shop. Shop data is read live; add files, your website, FAQs and instructions.', ['Press Add knowledge: upload a PDF, DOCX, TXT or CSV, add your website, or write an entry.', 'Wait for Ready. Open a source to see what the AI learned, change its category or sync it again.', 'Switch a source off to stop the AI using it.'], ['Sources that failed or need review are not used until fixed.', 'Temporary campaigns stop on their end date.'], ['Teach Grid AI', '2:30']),
    bn: E('আপনার দোকান সম্পর্কে Grid AI যা জানে। দোকানের তথ্য সরাসরি পড়া হয়; File, Website, FAQ আর নির্দেশনা যোগ করুন।', ['Add knowledge চাপুন: PDF, DOCX, TXT বা CSV দিন, Website যোগ করুন, বা নিজে লিখুন।', 'Ready হওয়া পর্যন্ত অপেক্ষা করুন। Source খুলে দেখুন AI কী শিখল, Category বদলান বা আবার Sync করুন।', 'AI যেন ব্যবহার না করে, তাহলে Source বন্ধ করুন।'], ['Failed বা Needs review Source ঠিক না হওয়া পর্যন্ত ব্যবহার হয় না।', 'Temporary campaign শেষের তারিখে থেমে যায়।'], ['Grid AI-কে শেখানো', '2:30']),
    related: ['/ai-behaviour', '/connections'],
  },
  '/ai-behaviour': {
    en: E('How Grid AI answers and what it may say: Auto, Assist or Off per channel, voice and language, your rules and its limits.', ['Pick the shop default: Auto, Assist or Off, then change any channel.', 'Set office hours and what the AI may answer by itself.', 'Check the voice, rules and limits, then Save.'], ['Customers can never change these rules.', 'Only people with “Configure Grid AI” can change this page; Auto also needs “Enable auto reply”.'], ['Control Grid AI', '3:00']),
    bn: E('Grid AI কীভাবে উত্তর দেবে আর কী বলতে পারবে: প্রতিটি Channel-এ Auto, Assist বা Off, ভাষা, আপনার নিয়ম আর সীমা।', ['দোকানের Default বাছুন: Auto, Assist বা Off, তারপর দরকার হলে Channel আলাদা করুন।', 'Office hours আর AI নিজে কোন প্রশ্নের উত্তর দেবে তা ঠিক করুন।', 'ভাষা, নিয়ম আর সীমা দেখে Save করুন।'], ['Customer কখনো এই নিয়ম বদলাতে পারে না।', 'শুধু “Configure Grid AI” অনুমতি থাকলে এই পাতা বদলানো যায়; Auto-র জন্য “Enable auto reply” লাগে।'], ['Grid AI নিয়ন্ত্রণ', '3:00']),
    related: ['/ai-knowledge', '/ai-models', '/merchant-inbox'],
  },
  '/smart-offers': {
    en: E('Offers that go out by themselves when a customer does something, or that you send to a group. Each customer gets their own one-time code.', ['Press New smart offer.', 'Choose when it goes out (a customer buys, stops buying, looks without buying …) and what they get.', 'Pick how to send it, check the message has {code}, and turn it on.'], ['Send rules keep anyone from getting too many offers: one every few days, only in the daytime.', 'Send now sends a turned-on offer at once; messages are paid from your GridCommerce credits.'], ['Smart offers', '2:30']),
    bn: E('Customer কিছু করলে নিজে থেকে যায় এমন Offer, বা যা আপনি কোনো Group-কে পাঠান। প্রত্যেক Customer নিজের এককালীন Code পান।', ['New smart offer চাপুন।', 'কখন যাবে (কেনা, কেনা বন্ধ, দেখে না কেনা …) আর কী পাবে বাছুন।', 'কীভাবে পাঠাবেন বাছুন, Message-এ {code} আছে দেখে চালু করুন।'], ['Send rules-এ কেউ বেশি Offer পায় না: কয়েক দিনে একবার, শুধু দিনের বেলা।', 'Send now চালু Offer এখনই পাঠায়; Message-এর খরচ GridCommerce credits থেকে যায়।'], ['Smart offer', '2:30']),
    related: ['/coupons', '/abandoned-carts', '/auto-reminders'],
  },
  '/brands': {
    en: E('The brands you sell: a name, and if you like a short description and an image (the logo).', ['Press Add brand and type the name.', 'Add a description or upload the logo if you want — both are optional.', 'Open a brand to change it or delete it.'], ['Pick the brand on a product in Add product.', 'Deleting a brand does not change products: they keep the name.'], ['Brands', '1:30']),
    bn: E('যে Brand-গুলো বিক্রি করেন: নাম, চাইলে ছোট বিবরণ আর ছবি (Logo)।', ['Add brand চাপুন, নাম লিখুন।', 'চাইলে বিবরণ দিন বা Logo Upload করুন — দুটোই ঐচ্ছিক।', 'Brand খুলে বদলান বা মুছুন।'], ['Add product-এ Product-এর Brand বাছুন।', 'Brand মুছলে Product বদলায় না: নাম থেকে যায়।'], ['Brand', '1:30']),
    related: ['/all-products', '/add-product', '/categories'],
  },
  '/add-product': {
    en: E('Add a new product: name, price, stock, photos and where it sells.', ['Fill name, price and opening stock first — the rest is optional.', 'Add photos and a short description for online sales.', 'Press Save product.'], ['Add attributes (Colour, Size …) on the product. Tick “Used for variations” and each combination gets its own price and stock.'], ['Add a product', '3:20']),
    bn: E('নতুন Product যোগ করুন: নাম, দাম, Stock, ছবি আর কোথায় বিক্রি হবে।', ['আগে নাম, দাম আর শুরুর Stock দিন — বাকিগুলো দরকার হলে।', 'Online বিক্রির জন্য ছবি আর ছোট বিবরণ দিন।', 'Save product চাপুন।'], ['Product-এই Attribute (Colour, Size …) যোগ করুন। “Variation-এর জন্য” টিক দিলে প্রতিটির আলাদা দাম আর Stock থাকে।'], ['Product যোগ করা', '3:20']),
    related: ['/all-products', '/categories'],
  },
  '/stock': {
    en: E('How much of each product you have in every warehouse and branch — on hand, held for orders and free to sell.', ['Search a product or scan its barcode.', 'Filter by place or show low stock only.', 'Open a product to see its moves.'], ['"Held" stock is reserved for pending orders.', 'Low stock is below the reorder level you set.'], ['Read your stock', '2:30']),
    bn: E('প্রতিটি Warehouse আর Branch-এ কোন পণ্য কত আছে — হাতে, Order-এর জন্য রাখা আর বিক্রির জন্য ফ্রি।', ['Product খুঁজুন বা Barcode Scan করুন।', 'জায়গা বাছুন বা শুধু কম Stock দেখুন।', 'Product খুলে তার আসা-যাওয়া দেখুন।'], ['"Held" মানে Pending Order-এর জন্য রাখা।', 'Reorder level-এর নিচে গেলে Low stock।'], ['Stock বোঝা', '2:30']),
    related: ['/receive-goods', '/transfers', '/stock-adjustments', '/purchase-orders'],
  },
  '/receive-goods': {
    en: E('Count in what a supplier delivered, against the purchase order, and add it to stock.', ['Choose the purchase order.', 'Scan each item as you unpack it.', 'Note damaged or wrong items, then Save — stock updates.'], ['The supplier bill is made for you from what you received.'], ['Receive a delivery', '3:00']),
    bn: E('Supplier যা দিয়েছে, Purchase order মিলিয়ে গুনে Stock-এ তুলুন।', ['Purchase order বাছুন।', 'খোলার সময় প্রতিটি পণ্য Scan করুন।', 'নষ্ট বা ভুল পণ্য লিখে Save — Stock বেড়ে যাবে।'], ['যা এসেছে তা থেকে Supplier-এর Bill নিজে তৈরি হয়।'], ['মাল গ্রহণ', '3:00']),
    related: ['/purchase-orders', '/suppliers', '/stock'],
  },
  '/transfers': {
    en: E('Move stock between warehouses and branches: send, it travels, the other place receives.', ['Press New transfer, choose from and to, add items.', 'Scan out when it leaves; scan in when it arrives.'], ['Missing pieces are flagged when the count does not match.'], ['Move stock between places', '2:30']),
    bn: E('Warehouse আর Branch-এর মধ্যে Stock পাঠান: পাঠানো, পথে, অন্য জায়গা গ্রহণ করে।', ['New transfer চাপুন, কোথা থেকে কোথায় বাছুন, পণ্য যোগ করুন।', 'বের হওয়ার সময় Scan out, পৌঁছালে Scan in।'], ['গোনায় না মিললে কম পণ্য আলাদা দেখায়।'], ['জায়গা বদলে Stock পাঠানো', '2:30']),
    related: ['/stock', '/warehouses', '/branches'],
  },
  '/purchase-orders': {
    en: E('Orders you send to suppliers, from draft to received.', ['New purchase order: choose the supplier and items (or start from low stock).', 'Send it, then receive the goods when they arrive.'], ['Large orders by staff wait for your approval.'], ['Purchase orders', '2:50']),
    bn: E('Supplier-কে দেওয়া Order — Draft থেকে Received পর্যন্ত।', ['New purchase order: Supplier আর পণ্য বাছুন (বা কম Stock থেকে শুরু করুন)।', 'পাঠিয়ে দিন, মাল এলে Receive goods করুন।'], ['Staff-এর বড় Order আপনার Approval-এর অপেক্ষায় থাকে।'], ['Purchase order', '2:50']),
    related: ['/receive-goods', '/suppliers', '/requests'],
  },
  '/suppliers': {
    en: E('Who you buy from, what you owe them and their bills and payments.', ['Open a supplier to see bills, payments and returns.', 'Pay a supplier from the account you choose.'], ['Overdue bills show first.'], ['Suppliers and dues', '2:10']),
    bn: E('কার কাছ থেকে কেনেন, কত Due আছে, তাদের Bill আর Payment।', ['Supplier খুলে Bill, Payment আর Return দেখুন।', 'যে Account থেকে চান, Supplier-কে Payment দিন।'], ['সময় পেরোনো Bill আগে দেখায়।'], ['Supplier আর Due', '2:10']),
    related: ['/purchase-orders', '/dues'],
  },
  '/stock-adjustments': {
    en: E('Correct stock when it does not match: damage, loss, found items or a count.', ['Choose the product and place, enter the new quantity and the reason.'], ['Every adjustment is recorded with who did it.'], ['Adjust stock', '1:50']),
    bn: E('Stock না মিললে ঠিক করুন: নষ্ট, হারানো, খুঁজে পাওয়া বা গোনা।', ['Product আর জায়গা বাছুন, নতুন সংখ্যা আর কারণ দিন।'], ['প্রতিটি Adjustment কে করেছে তা লেখা থাকে।'], ['Stock ঠিক করা', '1:50']),
    related: ['/stock', '/stock-count'],
  },
  '/stock-count': {
    en: E('Count the stock on the shelves and compare with the system.', ['Start a count for a place, count racks, enter the numbers.', 'Review the differences and apply them.'], ['Count when the shop is closed for best results.'], ['Stock count', '2:40']),
    bn: E('তাকের Stock গুনে System-এর সাথে মেলান।', ['একটি জায়গার Count শুরু করুন, Rack গুনে সংখ্যা দিন।', 'পার্থক্য দেখে Apply করুন।'], ['দোকান বন্ধ থাকলে গোনা সবচেয়ে ভালো।'], ['Stock count', '2:40']),
    related: ['/stock-adjustments', '/stock'],
  },
  '/accounts-home': {
    en: E('All your money in one view: cash, bank, wallets, what partners hold and what is due.', ['Check the balances, then open Cash, bank & wallets for every movement.'], ['Money held by couriers and gateways shows under Payouts.'], ['Money overview', '2:20']),
    bn: E('সব টাকা এক নজরে: Cash, Bank, Wallet, Partner-দের কাছে কত আছে আর কত Due।', ['Balance দেখুন, প্রতিটি লেনদেন দেখতে Cash, bank & wallets খুলুন।'], ['Courier আর Gateway-এর কাছে থাকা টাকা Payouts-এ।'], ['টাকার হিসাব', '2:20']),
    related: ['/money', '/dues', '/settlements', '/expenses-bills'],
  },
  '/money': {
    en: E('Every taka in and out of each cash drawer, bank and mobile wallet.', ['Add money, take out or move between accounts from the top.', 'Filter by account or type to find a payment.'], ['Sales and payments are recorded here by themselves.'], ['Cash, bank and wallets', '2:40']),
    bn: E('প্রতিটি Cash drawer, Bank আর Mobile wallet-এ টাকা আসা-যাওয়ার হিসাব।', ['উপর থেকে টাকা যোগ, তোলা বা এক Account থেকে আরেকটায় পাঠান।', 'Account বা ধরন বেছে Payment খুঁজুন।'], ['বিক্রি আর Payment নিজে থেকেই এখানে লেখা হয়।'], ['Cash, Bank আর Wallet', '2:40']),
    related: ['/accounts-home', '/expenses-bills'],
  },
  '/dues': {
    en: E('What customers owe you and what you owe suppliers, by how old it is.', ['Open "You will get" to collect; "You owe" to pay.', 'Send a reminder or record a payment from the row.'], ['Older than 60 days needs a call today.'], ['Dues', '2:20']),
    bn: E('Customer-রা আপনাকে কত দেবে আর আপনি Supplier-কে কত দেবেন — কত পুরনো সহ।', ['টাকা তুলতে "You will get", দিতে "You owe" খুলুন।', 'Row থেকে Reminder পাঠান বা Payment লিখুন।'], ['৬০ দিনের বেশি পুরনো হলে আজই Call করুন।'], ['Due', '2:20']),
    related: ['/sales-invoices', '/suppliers', '/accounts-home'],
  },
  '/settlements': {
    en: E('Money couriers and payment gateways collected for you and when they pay it out.', ['Each evening confirm which payouts arrived.', 'Late payouts are at the top — call the partner.'], ['Payouts skip weekends and holidays.'], ['Courier and gateway payouts', '2:30']),
    bn: E('Courier আর Payment gateway আপনার হয়ে যে টাকা তুলেছে, আর কবে দেবে।', ['প্রতি সন্ধ্যায় কোন Payout এসেছে Confirm করুন।', 'দেরি হওয়া Payout উপরে থাকে — Partner-কে Call করুন।'], ['ছুটির দিনে Payout হয় না।'], ['Courier আর Gateway Payout', '2:30']),
    related: ['/accounts-home', '/money'],
  },
  '/expenses-bills': {
    en: E('Record expenses and other income: rent, bills, salaries, ads, and what you earn besides sales.', ['Press Record expense, choose category and the account it was paid from.'], ['Tie an expense to Online, Retail or Wholesale to see profit by channel.'], ['Expenses', '1:50']),
    bn: E('খরচ আর অন্য আয় লিখুন: ভাড়া, Bill, বেতন, বিজ্ঞাপন আর বিক্রি ছাড়া আয়।', ['Record expense চাপুন, Category আর কোন Account থেকে দিলেন বাছুন।'], ['Online, Retail বা Wholesale-এর সাথে জুড়লে Channel-এর লাভ বোঝা যায়।'], ['খরচ', '1:50']),
    related: ['/money', '/liabilities'],
  },
  '/liabilities': {
    en: E('Bills the shop must pay later: salaries, sales commission, affiliate payouts and promotions.', ['Open a bill and pay it in full or in part from an account.'], ['Approved payroll shows here until it is paid.'], ['Bills to pay', '1:50']),
    bn: E('যে টাকা পরে দিতে হবে: বেতন, Sales commission, Affiliate payout আর Promotion।', ['Bill খুলে পুরো বা আংশিক Payment দিন।'], ['Approve করা Payroll দেওয়া পর্যন্ত এখানে থাকে।'], ['দেনা পরিশোধ', '1:50']),
    related: ['/expenses-bills', '/payroll'],
  },
  '/reports-centre': {
    en: E('Every report in one place: sales, delivery, stock, money, staff and marketing.', ['Search or pick a group, then open a report.', 'In a report choose the period, compare and download PDF or CSV.'], ['Your daily numbers are on the Dashboard; Reports are for deeper questions.'], ['Find the right report', '2:00']),
    bn: E('সব Report এক জায়গায়: Sales, Delivery, Stock, টাকা, Staff আর Marketing।', ['Search করুন বা Group বাছুন, তারপর Report খুলুন।', 'Report-এ সময় বাছুন, তুলনা করুন, PDF বা CSV নামান।'], ['রোজের হিসাব Dashboard-এ; Report গভীর প্রশ্নের জন্য।'], ['ঠিক Report খোঁজা', '2:00']),
    related: ['/daily-summary', '/merchant-overview'],
  },
  '/daily-summary': {
    en: E('The day in one page: sales by channel and branch, cash at closing, orders, dues and expenses.', ['Pick a day; download the PDF for your records.'], ['Schedule it by email or WhatsApp from Automation › Scheduled reports.'], ['Daily summary', '1:30']),
    bn: E('একদিন এক page-এ: Channel আর Branch অনুযায়ী Sales, দিন শেষের Cash, Order, Due আর খরচ।', ['দিন বাছুন; রাখার জন্য PDF নামান।'], ['Email বা WhatsApp-এ পেতে Automation › Scheduled reports-এ সেট করুন।'], ['Daily summary', '1:30']),
    related: ['/reports-centre', '/merchant-overview'],
  },
  '/hr-dashboard': {
    en: E('Your people today: who is in, who is late, what needs approval, payroll and what is coming up.', ['Act on "Today needs you" first.', 'Approve leave, advances and attendance fixes right here.'], ['Missing bank details stop salary — fix them before pay day.'], ['HR dashboard', '2:30']),
    bn: E('আজ আপনার লোকজন: কে এসেছে, কে দেরিতে, কী Approve করতে হবে, Payroll আর সামনে কী।', ['আগে "Today needs you" দেখুন।', 'ছুটি, Advance আর হাজিরা ঠিক করার অনুরোধ এখানেই Approve করুন।'], ['Bank তথ্য না থাকলে বেতন যাবে না — বেতনের আগে ঠিক করুন।'], ['HR Dashboard', '2:30']),
    related: ['/all-staff', '/attendance', '/payroll', '/leave'],
  },
  '/all-staff': {
    en: E('Everyone who works for you: where, which shift, what they earn and how they are paid.', ['Add staff walks you through 7 short steps.', 'Open a person for their full profile.'], ['Export the list as CSV.'], ['Staff', '2:00']),
    bn: E('যারা আপনার এখানে কাজ করেন: কোথায়, কোন Shift, কত বেতন আর কীভাবে পান।', ['Add staff ৭টি ছোট ধাপে যোগ করায়।', 'কাউকে খুললে পুরো Profile দেখবেন।'], ['তালিকা CSV হিসেবে নামান।'], ['Staff', '2:00']),
    related: ['/staff-create', '/attendance', '/payroll'],
  },
  '/attendance': {
    en: E('Who came, when, and who was late or absent — from the machines, POS and staff app.', ['Fix a missing punch from the day view.', 'Approve fix requests from staff.'], ['Every 3 lates cut a day’s pay (HR setup).'], ['Attendance', '2:10']),
    bn: E('কে কখন এসেছে, কে দেরি বা অনুপস্থিত — Machine, POS আর Staff app থেকে।', ['দিনের তালিকা থেকে বাদ পড়া Punch ঠিক করুন।', 'Staff-এর ঠিক করার অনুরোধ Approve করুন।'], ['প্রতি ৩ বার দেরিতে একদিনের বেতন কাটে (HR setup)।'], ['হাজিরা', '2:10']),
    related: ['/shifts', '/leave', '/attendance-devices'],
  },
  '/payroll': {
    en: E('Make the month’s salary: check attendance, review, approve, pay and send payslips.', ['Follow the 5 steps at the top.', 'After approval, pay from the bank, bKash or cash.'], ['Approval locks the numbers and adds the salary bill in Money.'], ['Run payroll', '3:30']),
    bn: E('মাসের বেতন তৈরি: হাজিরা দেখা, Review, Approve, Pay আর Payslip পাঠানো।', ['উপরের ৫টি ধাপ ধরে এগোন।', 'Approve-এর পর Bank, bKash বা Cash থেকে Pay করুন।'], ['Approve করলে সংখ্যা Lock হয় আর Money-তে বেতনের Bill যোগ হয়।'], ['Payroll চালানো', '3:30']),
    related: ['/salary-statements', '/loans-advances', '/liabilities'],
  },
  '/leave': {
    en: E('Leave requests and balances.', ['Approve or reject requests — warnings show if a shift would be short.'], ['Balances follow HR setup › Leave types.'], ['Leave', '1:40']),
    bn: E('ছুটির অনুরোধ আর কত দিন বাকি।', ['অনুরোধ Approve বা Reject করুন — Shift-এ লোক কম পড়লে সতর্ক করে।'], ['বাকি ছুটি HR setup › Leave types অনুযায়ী।'], ['ছুটি', '1:40']),
    related: ['/attendance', '/shifts'],
  },
  '/courier-returns': {
    en: E('Parcels the courier is bringing back (RTO): receive them and put good items back in stock.', ['Scan the parcel when it arrives; mark items good or damaged.'], ['Unreceived returns older than 7 days need a call to the courier.'], ['Courier returns', '2:00']),
    bn: E('Courier যে Parcel ফেরত আনছে (RTO): গ্রহণ করুন, ভালো পণ্য Stock-এ ফেরত দিন।', ['Parcel এলে Scan করুন; পণ্য ভালো না নষ্ট বলুন।'], ['৭ দিনের বেশি না আসা Return-এর জন্য Courier-কে Call করুন।'], ['Courier return', '2:00']),
    related: ['/merchant-orders', '/return-history'],
  },
  '/wholesale-orders': {
    en: E('Wholesale orders by delivery: what is sent, what is still to send, and the stock held for it.', ['Make a delivery challan for what you send today.'], ['Partly delivered orders keep the rest of the stock held.'], ['Wholesale deliveries', '2:10']),
    bn: E('Wholesale Order-এর Delivery: কী পাঠানো হয়েছে, কী বাকি, তার জন্য রাখা Stock।', ['আজ যা পাঠাবেন তার Delivery challan বানান।'], ['আংশিক পাঠানো Order-এর বাকি Stock আলাদা রাখা থাকে।'], ['Wholesale Delivery', '2:10']),
    related: ['/sales-invoices', '/merchant-orders'],
  },
  '/coupons': {
    en: E('Coupon codes customers enter at checkout or at the counter.', ['Create a coupon: amount or percent, minimum order, dates and limits.'], ['Pause a coupon instead of deleting it to keep its history.'], ['Coupons', '1:50']),
    bn: E('Checkout বা Counter-এ Customer যে Coupon code দেন।', ['Coupon বানান: টাকা বা %, কমপক্ষে কত Order, তারিখ আর সীমা।'], ['ইতিহাস রাখতে Delete না করে Pause করুন।'], ['Coupon', '1:50']),
    related: ['/promo', '/flash-sales'],
  },
  '/merchant-inbox': {
    en: E('Chats, comments and mentions from Facebook, Instagram, WhatsApp, TikTok and the website in one inbox, in a Messenger-style chat.', ['Reply, send a voice message (mic) or a 👍, and turn a chat into an order.', 'Hover a message to react or reply to it; tap the phone to call the customer.', 'Comments and Mentions are tabs here and items in the menu; the chat button in the top bar opens any chat from any page.'], ['In an internal note, type @ and a name to tell a teammate.', 'Oldest waiting chats are at the top.'], ['Inbox', '2:30']),
    bn: E('Facebook, Instagram, WhatsApp, TikTok আর Website-এর Chat, Comment আর Mention এক Inbox-এ, Messenger-এর মতো Chat-এ।', ['Reply দিন, Voice message (mic) বা 👍 পাঠান, Chat থেকে Order বানান।', 'Message-এর উপর মাউস রাখলে React বা Reply করা যায়; ফোন চাপলে Customer-কে Call করা যায়।', 'Comment আর Mention এখানে Tab আর Menu-তেও আছে; Top bar-এর Chat বাটন থেকে যেকোনো পাতা থেকে Chat খোলা যায়।'], ['Internal note-এ @ আর নাম লিখলে Teammate জানতে পারে।', 'সবচেয়ে বেশি সময় অপেক্ষার Chat উপরে থাকে।'], ['Inbox', '2:30']),
    related: ['/merchant-calls', '/support-tickets'],
  },
  '/set-general': {
    en: E('Your shop’s basic settings: name, contact, currency, VAT and invoice details.', ['Change a field and press Save.'], ['These appear on invoices and receipts.'], ['Store settings', '1:40']),
    bn: E('Shop-এর মূল Settings: নাম, যোগাযোগ, মুদ্রা, VAT আর Invoice-এর তথ্য।', ['তথ্য বদলে Save চাপুন।'], ['এগুলো Invoice আর Receipt-এ দেখায়।'], ['Store settings', '1:40']),
    related: ['/set-payments', '/set-delivery'],
  },
  '/channels': {
    en: E('Product sync at a glance: Meta (Facebook & Instagram), Google Merchant Center, WooCommerce and Shopify.', ['Check each card: connected, last sync and problems.', 'Press Sync now to send the latest products, prices and stock.', 'Fix the problems in Recent issues — each row says what to do.'], ['Green means fine. Orange needs you. Red failed.', 'Connect channel adds a new one in a few steps.'], ['Sales channels', '2:00']),
    bn: E('Product sync এক নজরে: Meta (Facebook ও Instagram), Google Merchant Center, WooCommerce আর Shopify।', ['প্রতিটি Card দেখুন: Connected কি না, শেষ Sync আর সমস্যা।', 'সর্বশেষ Product, দাম আর Stock পাঠাতে Sync now চাপুন।', 'Recent issues-এর সমস্যাগুলো ঠিক করুন — প্রতিটি সারিতে কী করতে হবে লেখা আছে।'], ['সবুজ মানে ঠিক আছে। কমলা মানে আপনাকে দেখতে হবে। লাল মানে Failed।', 'Connect channel দিয়ে কয়েক ধাপে নতুন Channel যোগ করুন।'], ['Sales channels', '2:00']),
    related: ['/meta-commerce', '/google-merchant', '/woocommerce', '/shopify', '/sync-issues', '/connections'],
  },
  '/meta-commerce': {
    en: E('Your products on Facebook and Instagram shops, and whether each one is synced.', ['Tap a tab to see Synced, Needs attention, Failed or Not published.', 'Press Fix or Retry on a product with a problem.', 'Select products to publish, remove or retry them together.'], ['Draft products are not sent.', 'Auto sync sends changes by itself.'], ['Meta Commerce', '1:50']),
    bn: E('Facebook আর Instagram Shop-এ আপনার Product, আর প্রতিটি Synced কি না।', ['Synced, Needs attention, Failed বা Not published দেখতে Tab-এ চাপুন।', 'সমস্যা থাকা Product-এ Fix বা Retry চাপুন।', 'একসাথে Publish, Remove বা Retry করতে Product বাছুন।'], ['Draft Product পাঠানো হয় না।', 'Auto sync নিজে থেকেই পরিবর্তন পাঠায়।'], ['Meta Commerce', '1:50']),
    related: ['/channels', '/sync-issues', '/all-products'],
  },
  '/google-merchant': {
    en: E('Your products on Google Search and the Shopping tab: Approved, Limited or Disapproved.', ['Open Limited and Disapproved to see what Google wants.', 'Press Fix product and add what is missing, such as the barcode.', 'Press Retry when the problem was on the way, such as a price mismatch.'], ['Google checks new and changed products. This can take up to 3 days.', 'Technical details are folded under each problem.'], ['Google Merchant Center', '2:10']),
    bn: E('Google Search আর Shopping Tab-এ আপনার Product: Approved, Limited বা Disapproved।', ['Google কী চায় দেখতে Limited আর Disapproved খুলুন।', 'Fix product চাপুন আর যা নেই তা দিন, যেমন Barcode।', 'পাঠানোর সময় সমস্যা হলে (যেমন দাম না মেলা) Retry চাপুন।'], ['নতুন বা বদলানো Product Google যাচাই করে, এতে ৩ দিন পর্যন্ত লাগতে পারে।', 'Technical details প্রতিটি সমস্যার নিচে ভাঁজ করা থাকে।'], ['Google Merchant Center', '2:10']),
    related: ['/channels', '/sync-issues', '/all-products'],
  },
  '/google-business': {
    en: E('Your shop on Google Search and Maps: locations, reviews, hours, posts, photos and services.', ['Check Locations for anything that needs attention.', 'Reply to reviews. Generate AI reply gives a draft; read it before you publish.', 'Keep opening hours right, including holidays (Special hours).'], ['Copy Monday to all sets the whole week at once.', 'Changes can take up to 3 days to show on Google.'], ['Google Business', '2:30']),
    bn: E('Google Search আর Maps-এ আপনার Shop: Location, Review, সময়, Post, ছবি আর সেবা।', ['কোনো Location-এ নজর দরকার কি না দেখুন।', 'Review-এর Reply দিন। Generate AI reply একটি খসড়া দেয়; Publish-এর আগে পড়ে নিন।', 'খোলার সময় ঠিক রাখুন, ছুটির দিনসহ (Special hours)।'], ['Copy Monday to all দিয়ে পুরো সপ্তাহ একবারে ঠিক করুন।', 'Google-এ পরিবর্তন দেখাতে ৩ দিন পর্যন্ত লাগতে পারে।'], ['Google Business', '2:30']),
    related: ['/merchant-inbox', '/connections'],
  },
  '/sync-issues': {
    en: E('Every channel problem in one place, with the fix in plain words.', ['Start with Needs attention: these need you to change something.', 'Failed ones often work on a retry — select them and press Retry selected.', 'Resolved shows what was fixed recently.'], ['Filter by channel to work on one at a time.'], ['Sync issues', '1:40']),
    bn: E('সব Channel-এর সমস্যা এক জায়গায়, সহজ ভাষায় সমাধানসহ।', ['Needs attention দিয়ে শুরু করুন: এগুলোতে আপনাকে কিছু বদলাতে হবে।', 'Failed গুলো প্রায়ই আবার চেষ্টা করলে ঠিক হয় — বেছে Retry selected চাপুন।', 'সম্প্রতি কী ঠিক হয়েছে Resolved-এ দেখুন।'], ['একবারে একটি Channel নিয়ে কাজ করতে Channel দিয়ে Filter করুন।'], ['Sync issues', '1:40']),
    related: ['/channels', '/meta-commerce', '/google-merchant'],
  },
  '/channel-settings': {
    en: E('What GridCommerce keeps in sync on your channels, and who hears about problems.', ['Turn Auto sync, products, stock, prices and images on or off.', 'Choose how you hear about sync problems.'], ['Advanced settings are for special cases; most shops never need them.'], ['Channel settings', '1:10']),
    bn: E('আপনার Channel-এ GridCommerce কী Sync রাখে, আর সমস্যার খবর কে পায়।', ['Auto sync, Product, Stock, দাম আর ছবি চালু বা বন্ধ করুন।', 'Sync-এর সমস্যার খবর কীভাবে পাবেন বাছুন।'], ['Advanced settings বিশেষ ক্ষেত্রের জন্য; বেশিরভাগ Shop-এর লাগে না।'], ['Channel settings', '1:10']),
    related: ['/channels'],
  },
  '/connections': {
    en: E('Every outside app and service your shop uses, connected from one place: stores, social and inbox channels, ads, payments, couriers, SMS and email, devices.', ['Pick a group, or search for the app.', 'Press Connect and follow the short steps.', 'Orange means it needs you: press Reconnect or Review.'], ['Connected channels bring their messages, comments and reviews into the Inbox.', 'Payment gateways and couriers also get their accounts in Money.'], ['Connections', '2:00']),
    bn: E('আপনার Shop যত বাইরের App আর সেবা ব্যবহার করে, সব এক জায়গা থেকে যুক্ত করুন: Store, Social ও Inbox channel, Ads, Payment, Courier, SMS ও Email, Device।', ['একটি Group বাছুন, বা App খুঁজুন।', 'Connect চাপুন আর ছোট ধাপগুলো অনুসরণ করুন।', 'কমলা মানে আপনাকে দেখতে হবে: Reconnect বা Review চাপুন।'], ['যুক্ত Channel-এর Message, Comment আর Review Inbox-এ আসে।', 'Payment gateway আর Courier-এর Account Money-তেও তৈরি হয়।'], ['Connections', '2:00']),
    related: ['/channels', '/merchant-inbox', '/set-payments'],
  },
  '/connect': {
    en: E('Connect one app in a few short steps.', ['Sign in with the app, or paste its store address and keys.', 'Choose the page, account or catalog.', 'Choose what to use it for, check the summary and connect.'], ['GridCommerce never sees your passwords.'], ['Connect an app', '1:30']),
    bn: E('কয়েকটি ছোট ধাপে একটি App যুক্ত করুন।', ['App দিয়ে Sign in করুন, বা Store-এর ঠিকানা আর Key দিন।', 'Page, Account বা Catalog বাছুন।', 'কী কাজে লাগবে বাছুন, সারাংশ দেখে Connect করুন।'], ['GridCommerce কখনো আপনার Password দেখে না।'], ['Connect an app', '1:30']),
    related: ['/connections'],
  },
  '/woocommerce': {
    en: E('Your products on your WordPress store, and its orders here.', ['Tap a tab to see Synced, Needs attention, Failed or Not published.', 'Press Fix or Retry on a product with a problem.', 'Settings opens the store connection: keys, what syncs and the change log.'], ['Draft products are not sent.'], ['WooCommerce', '1:40']),
    bn: E('আপনার WordPress Store-এ Product, আর সেখানের Order এখানে।', ['Synced, Needs attention, Failed বা Not published দেখতে Tab-এ চাপুন।', 'সমস্যা থাকা Product-এ Fix বা Retry চাপুন।', 'Settings-এ Store-এর সংযোগ: Key, কী Sync হয় আর পরিবর্তনের Log।'], ['Draft Product পাঠানো হয় না।'], ['WooCommerce', '1:40']),
    related: ['/channels', '/sync-issues', '/woo-sync'],
  },
  '/shopify': {
    en: E('Your products on your Shopify store, and its orders here.', ['Connect Shopify from Connections if it is not connected yet.', 'Fix or retry products with a problem.'], ['Shopify needs each product’s weight for delivery charges.'], ['Shopify', '1:30']),
    bn: E('আপনার Shopify Store-এ Product, আর সেখানের Order এখানে।', ['যুক্ত না থাকলে Connections থেকে Shopify যুক্ত করুন।', 'সমস্যা থাকা Product ঠিক করুন বা Retry করুন।'], ['Delivery charge-এর জন্য Shopify-র প্রতিটি Product-এর ওজন লাগে।'], ['Shopify', '1:30']),
    related: ['/channels', '/sync-issues', '/connections'],
  },
  '/connect-channel': {
    en: E('Connect Meta, Google Merchant Center or Google Business in six short steps.', ['Choose the channel and sign in with Meta or Google.', 'Pick the business, catalog or locations.', 'Choose what to sync, check the summary and connect.'], ['GridCommerce never sees your password.', 'The first sync starts as soon as you connect.'], ['Connect a channel', '1:30']),
    bn: E('ছয়টি ছোট ধাপে Meta, Google Merchant Center বা Google Business যুক্ত করুন।', ['Channel বাছুন আর Meta বা Google দিয়ে Sign in করুন।', 'Business, Catalog বা Location বাছুন।', 'কী Sync হবে বাছুন, সারাংশ দেখে Connect করুন।'], ['GridCommerce কখনো আপনার Password দেখে না।', 'Connect করার সঙ্গে সঙ্গে প্রথম Sync শুরু হয়।'], ['Connect a channel', '1:30']),
    related: ['/channels'],
  },
  '/courier-statement': {
    en: E('Every parcel handed to a courier, courier by courier: dispatched, in transit, delivered, coming back and returned, with the cash on delivery collected, charges and payouts.', ['Pick the period (by the day parcels were dispatched) and, if you like, one courier.', 'Read the courier-by-courier table, then open a courier to see each parcel.', 'Export the statement as CSV or print it.'], ['Delivered % counts delivered against everything that finished (delivered or returned).', 'Receive returned parcels on Courier returns; the statement follows.']),
    bn: E('Courier-এ দেওয়া সব Parcel, Courier অনুযায়ী: পাঠানো, পথে, Delivered, ফেরত আসছে আর ফেরত এসেছে, সাথে COD আদায়, চার্জ আর Payout।', ['সময় বাছুন (Parcel পাঠানোর দিন ধরে), চাইলে একটি Courier।', 'Courier-ভিত্তিক টেবিল দেখুন, তারপর একটি Courier খুলে প্রতিটি Parcel দেখুন।', 'Statement CSV-তে Export বা Print করুন।'], ['Delivered % = যতগুলো শেষ হয়েছে (Delivered বা ফেরত) তার মধ্যে Delivered।', 'ফেরত আসা Parcel Courier returns-এ Receive করুন; Statement সেটা মেনে চলে।']),
    related: ['/courier-returns', '/settlements', '/merchant-orders'],
  },
  // ---- new features from Nayeem's briefs (Oct 2026) ----
  '/order-work': {
    en: E('Orders that need someone: payments to check, edits, quotes and jobs running in the background.', ['Open Payment to review to match a customer’s payment proof.', 'Quotes become orders when the customer agrees.', 'Bulk bookings and labels run as jobs; check them here.'], ['A job that fails can be run again for the orders it missed.']),
    bn: E('যেসব Order-এ কারো হাত লাগবে: Payment যাচাই, Edit, Quote আর পেছনে চলা কাজ।', ['Customer-এর Payment proof মেলাতে Payment to review খুলুন।', 'Customer রাজি হলে Quote থেকে Order হয়।', 'একসাথে Booking আর Label job হিসেবে চলে; এখানে দেখুন।'], ['কোনো job ব্যর্থ হলে বাকি Order-গুলোর জন্য আবার চালানো যায়।']),
    related: ['/merchant-orders', '/order-settings'],
  },
  '/order-settings': {
    en: E('How orders behave: verification, holds, payment proof, edits and numbering.', ['Choose when an order needs a verification call.', 'Set what counts as a risky order.', 'Save; new orders follow the new rules.'], ['Orders already placed keep the rules they were placed with.']),
    bn: E('Order কীভাবে চলবে: যাচাই, Hold, Payment proof, Edit আর নম্বর।', ['কখন যাচাই কল লাগবে বাছুন।', 'ঝুঁকির Order কোনটা ঠিক করুন।', 'Save করুন; নতুন Order নতুন নিয়মে চলবে।'], ['আগের Order আগের নিয়মেই থাকে।']),
    related: ['/merchant-orders', '/order-work', '/set-notifications'],
  },
  '/payment-ops': {
    en: E('Money work in one place: refunds, payment links, manual payments and card terminal batches.', ['Send approved refunds and confirm them when the customer gets the money.', 'Make a payment link for a customer and share it.', 'Record a bank or bKash payment that came in by hand.'], ['A refund over the limit waits in Approvals first.', 'The same transaction ID can be used only once.']),
    bn: E('টাকার কাজ এক জায়গায়: Refund, Payment link, হাতে নেওয়া Payment আর Card terminal batch।', ['Approve হওয়া Refund পাঠান, Customer টাকা পেলে Confirm করুন।', 'Customer-এর জন্য Payment link বানিয়ে শেয়ার করুন।', 'হাতে আসা Bank বা bKash Payment লিখে রাখুন।'], ['লিমিটের বেশি Refund আগে Approvals-এ অপেক্ষা করে।', 'একই Transaction ID একবারই ব্যবহার করা যায়।']),
    related: ['/money-approvals', '/settlements', '/return-exchange'],
  },
  '/money-approvals': {
    en: E('Money requests waiting for a yes: big refunds, expenses, write-offs and supplier payments.', ['Open a request to see the facts.', 'Approve or deny; a denial needs a reason.'], ['You can’t approve your own request.']),
    bn: E('যেসব টাকার অনুরোধ অনুমোদনের অপেক্ষায়: বড় Refund, খরচ, Write-off আর Supplier payment।', ['অনুরোধ খুলে তথ্য দেখুন।', 'Approve বা Deny করুন; Deny করলে কারণ লিখতে হয়।'], ['নিজের অনুরোধ নিজে Approve করা যায় না।']),
    related: ['/payment-ops', '/expenses-bills'],
  },
  '/statement-match': {
    en: E('Match a bank or wallet statement against the books.', ['Import the statement file (CSV).', 'Lines that match are ticked for you; match the rest by hand.', 'Lines with no match become an expense, income or a note.'], ['Matching changes no money; it only proves the books are right.']),
    bn: E('Bank বা Wallet statement হিসাবের সাথে মেলান।', ['Statement ফাইল (CSV) Import করুন।', 'যেগুলো মেলে সেগুলো নিজে থেকে টিক হয়; বাকিগুলো হাতে মেলান।', 'না মিললে খরচ, আয় বা নোট হিসেবে রাখুন।'], ['মেলালে টাকা বদলায় না; শুধু হিসাব ঠিক আছে প্রমাণ হয়।']),
    related: ['/money', '/settlements'],
  },
  '/campaigns-messaging': {
    en: E('Send an SMS, WhatsApp or email campaign to a group of customers.', ['Pick the audience and the channel.', 'Write the message or pick a template.', 'Send now or schedule it.'], ['Customers who opted out or are on the do-not-send list are skipped.', 'Quiet hours move sends to the morning.']),
    bn: E('একদল Customer-কে SMS, WhatsApp বা Email Campaign পাঠান।', ['Audience আর Channel বাছুন।', 'Message লিখুন বা Template বাছুন।', 'এখনই পাঠান বা সময় ঠিক করুন।'], ['যারা Opt out করেছেন বা না-পাঠানোর তালিকায় আছেন তাদের বাদ দেওয়া হয়।', 'Quiet hours-এ পাঠানো সকালে চলে যায়।']),
    related: ['/automations', '/merchant-inbox'],
  },
  '/customer-settings': {
    en: E('How customer records work: selling on due, custom fields, segments, consent, restrictions and who can see what.', ['Credit & dues: turn on selling on due, set the default credit limit and the days to pay.', 'Add the fields your team needs on a customer.', 'Build segments from rules; they update by themselves.', 'Set who can see phone numbers and export lists.'], ['Restrictions (no COD, prepaid only, blocked) stop orders at POS and Create order.']),
    bn: E('Customer রেকর্ড কীভাবে চলবে: বাকিতে বিক্রি, নিজস্ব Field, Segment, সম্মতি, নিষেধ আর কে কী দেখবে।', ['Credit & dues: বাকিতে বিক্রি চালু করুন, Credit limit আর শোধের দিন ঠিক করুন।', 'Customer-এ টিমের দরকারি Field যোগ করুন।', 'নিয়ম দিয়ে Segment বানান; নিজে থেকে আপডেট হয়।', 'কে Phone নম্বর দেখবে আর তালিকা Export করবে ঠিক করুন।'], ['নিষেধ (COD নয়, আগে Payment, Blocked) POS আর Create order-এ Order আটকায়।']),
    related: ['/all-customers'],
  },
  '/ad-audiences': {
    en: E('Customer lists sent to Facebook and Google ads, kept up to date.', ['Pick a segment to send as an audience.', 'Choose the ad account.', 'It syncs by itself; customers who opted out of ads are left out.'], []),
    bn: E('Facebook আর Google বিজ্ঞাপনে পাঠানো Customer তালিকা, সবসময় হালনাগাদ।', ['Audience হিসেবে পাঠাতে একটি Segment বাছুন।', 'Ad account বাছুন।', 'নিজে থেকে Sync হয়; যারা বিজ্ঞাপনে Opt out করেছেন তারা বাদ।'], []),
    related: ['/abandoned-carts', '/customer-settings'],
  },
  '/stock-activity': {
    en: E('Every stock movement in one list: sales, receiving, transfers, adjustments, counts and returns.', ['Filter by product, place or kind of move.', 'Open a move to see who made it and why.'], ['Stock is never edited directly; every change is a move here.']),
    bn: E('সব Stock নড়াচড়া এক তালিকায়: বিক্রি, Receive, Transfer, Adjustment, Count আর Return।', ['Product, জায়গা বা ধরন দিয়ে Filter করুন।', 'কে আর কেন করেছে দেখতে একটি Move খুলুন।'], ['Stock সরাসরি বদলানো যায় না; প্রতিটি পরিবর্তন এখানে একটি Move।']),
    related: ['/stock', '/stock-adjustments'],
  },
  '/bulk-edit': {
    en: E('Change many products at once: prices, stock settings, status and tags.', ['Pick the products and the fields to change.', 'Check the preview.', 'Apply; you can undo the whole change.'], []),
    bn: E('একসাথে অনেক Product বদলান: দাম, Stock সেটিং, Status আর Tag।', ['Product আর বদলানোর Field বাছুন।', 'Preview দেখে নিন।', 'Apply করুন; পুরো পরিবর্তন Undo করা যায়।'], []),
    related: ['/all-products'],
  },
  '/set-invoices': {
    en: E('What customers receive on paper: the A4 invoice and the counter receipt.', ['Set the invoice number prefix and the invoice look.', 'Write the note at the bottom of the invoice.', 'Choose the receipt roll width (58 or 80 mm) and its last line.', 'Choose whether both print the BIN and each item’s warranty.'], ['The shop’s name, address and BIN come from Settings › General.']),
    bn: E('Customer কাগজে কী পান: A4 Invoice আর Counter-এর রসিদ।', ['Invoice নম্বরের Prefix আর Invoice-এর ধরন ঠিক করুন।', 'Invoice-এর নিচের লেখা লিখুন।', 'রসিদের রোল (58 বা 80 mm) আর শেষ লাইন বাছুন।', 'দুটোতেই BIN আর প্রতিটি পণ্যের Warranty ছাপবে কিনা বাছুন।'], ['দোকানের নাম, ঠিকানা আর BIN আসে Settings › General থেকে।']),
    related: ['/set-general', '/pos', '/warranty-policies'],
  },
  '/warranty-policies': {
    en: E('One list of warranty policies. Products pick one; invoices and receipts print it.', ['New policy: name, type, how long, what is covered, how to claim.', 'Save draft keeps changes away from customers.', 'Publish makes the next version; sold items keep the version they were sold under.', 'Archive stops offering it for new products.'], []),
    bn: E('Warranty policy-র একটাই তালিকা। Product একটি বাছে; Invoice আর রসিদে ছাপা হয়।', ['New policy: নাম, ধরন, কতদিন, কী কাভার, কীভাবে Claim।', 'Save draft পরিবর্তন Customer-এর কাছ থেকে আড়ালে রাখে।', 'Publish পরের Version বানায়; বিক্রি হওয়া পণ্য নিজের Version রাখে।', 'Archive করলে নতুন Product-এ আর দেখায় না।'], []),
    related: ['/warranty-claims', '/catalog-setup'],
  },
  '/warranty-claims': {
    en: E('Warranty claims and the IMEI / serial register.', ['New claim: look up the IMEI, phone or order and check the warranty.', 'Move the claim: received, with service centre, ready, returned to customer.', 'Reject with a reason when it is not covered.'], ['The customer is told at each step (Settings › Notifications).']),
    bn: E('Warranty claim আর IMEI / Serial রেজিস্টার।', ['New claim: IMEI, Phone বা Order খুঁজে Warranty দেখুন।', 'Claim এগিয়ে নিন: Received, Service centre-এ, Ready, Customer-কে ফেরত।', 'কাভার না হলে কারণ লিখে Reject করুন।'], ['প্রতি ধাপে Customer জানতে পারেন (Settings › Notifications)।']),
    related: ['/warranty-policies'],
  },
  '/set-privacy': {
    en: E('Privacy: cookie consent on the website, data requests and how long data is kept.', ['Choose what the cookie banner asks.', 'Handle a customer’s request to see or delete their data.'], []),
    bn: E('Privacy: ওয়েবসাইটের Cookie সম্মতি, ডেটার অনুরোধ আর ডেটা কতদিন রাখা হয়।', ['Cookie banner কী জিজ্ঞেস করবে বাছুন।', 'Customer নিজের ডেটা দেখতে বা মুছতে চাইলে সেটি সামলান।'], []),
    related: ['/settings-history'],
  },
  '/set-hosting': {
    en: E('Your store is hosted on GridCommerce: domain, DNS, email records, certificates, security, speed, files, backups and usage in one place.', ['Domains: connect your domain and make it primary.', 'DNS: point the nameservers to GridCommerce, or keep DNS at your registrar and add the records shown.', 'Email: choose who hosts your mailboxes, then add the SPF, DKIM and DMARC records (one click with GridCommerce DNS).', 'Back up the website before big changes; restore with one click.'], ['Overview lists what needs doing first.', 'DMARC: start with None, move to Quarantine when the reports look clean.', 'Certificates renew by themselves 30 days before they end.']),
    bn: E('আপনার Store GridCommerce-এ Host করা: Domain, DNS, Email record, Certificate, নিরাপত্তা, গতি, File, Backup আর ব্যবহার এক জায়গায়।', ['Domains: নিজের Domain যুক্ত করে Primary করুন।', 'DNS: Nameserver GridCommerce-এ দিন, বা Registrar-এ DNS রেখে দেখানো Record যোগ করুন।', 'Email: কে Mailbox রাখে বাছুন, তারপর SPF, DKIM আর DMARC record যোগ করুন (GridCommerce DNS-এ এক ক্লিকে)।', 'বড় পরিবর্তনের আগে Website-এর Backup নিন; এক ক্লিকে ফিরিয়ে আনুন।'], ['Overview-এ আগে কী করতে হবে তা থাকে।', 'DMARC: None দিয়ে শুরু করুন, Report ঠিক থাকলে Quarantine করুন।', 'Certificate শেষ হওয়ার ৩০ দিন আগে নিজেই নবায়ন হয়।']),
    related: ['/email', '/seo', '/subscription'],
  },
  '/set-domains': {
    en: E('Your website’s address: connect your own domain and check it works.', ['Add the domain.', 'Copy the DNS records to your domain provider.', 'Press Check; it goes live when the records are found.'], []),
    bn: E('ওয়েবসাইটের ঠিকানা: নিজের Domain যুক্ত করে কাজ করছে কিনা দেখুন।', ['Domain যোগ করুন।', 'DNS রেকর্ড Domain provider-এ কপি করুন।', 'Check চাপুন; রেকর্ড পেলে চালু হয়।'], []),
    related: ['/connections'],
  },
  '/set-verification': {
    en: E('Prove your business to GridCommerce: trade licence, TIN, the owner’s NID and photos of them. Verified shops can use their own SMS sender name and online payment gateways.', ['Fill in the numbers and add the photos.', 'Send for review; GridCommerce checks it within 2 working days.', 'If it is rejected, fix what the reason says and send again.', 'Billing details: the name, BIN and email on GridCommerce’s bills to you.'], ['The NID number is shown only as its last 4 digits once sent.']),
    bn: E('GridCommerce-এর কাছে আপনার ব্যবসা যাচাই করুন: Trade licence, TIN, মালিকের NID আর সেগুলোর ছবি। যাচাই হওয়া দোকান নিজের SMS sender নাম আর Online payment gateway ব্যবহার করতে পারে।', ['নম্বরগুলো লিখে ছবি যোগ করুন।', 'যাচাইয়ের জন্য পাঠান; GridCommerce ২ কর্মদিবসের মধ্যে দেখবে।', 'বাতিল হলে কারণ দেখে ঠিক করে আবার পাঠান।', 'Bill-এর তথ্য: GridCommerce-এর Bill-এ আপনার নাম, BIN আর Email।'], ['পাঠানোর পর NID নম্বরের শুধু শেষ ৪টি সংখ্যা দেখা যায়।']),
    related: ['/set-general', '/subscription'],
  },
  '/settings-history': {
    en: E('Every settings change: who changed what, when, and the value before.', ['Filter by section or person.', 'Open a change to see before and after.'], []),
    bn: E('সব Settings পরিবর্তন: কে কী কবে বদলেছে আর আগের মান।', ['Section বা লোক দিয়ে Filter করুন।', 'আগে-পরে দেখতে একটি পরিবর্তন খুলুন।'], []),
    related: ['/set-security'],
  },
};

// ---- made-up help for pages without an entry ----------------------------------------------------
// a page's group is its area (Orders, Inventory …); an item without pages is its own
const ALL = NAV.flatMap((g) => g.items.flatMap((it) => [{ ...it, group: g.label }, ...(it.children || []).map((c) => ({ ...c, group: it.label, parent: it }))]));
const pathOf = (it) => (it.to ? routeOf(it.to).split('?')[0] : '');
export function navItemFor(path) { return ALL.find((it) => pathOf(it) === path) || null; }

/** Help for a page: the written entry, or one made from its menu entry and description. */
export function helpFor(path, { title = '', description = '' } = {}) {
  const item = navItemFor(path);
  const name = title || (item ? item.label : 'This page');
  const written = HELP[path];
  const siblings = item ? ALL.filter((x) => x.group === item.group && pathOf(x) && pathOf(x) !== path && (!item.parent || x.parent === item.parent || !x.parent)).slice(0, 4).map(pathOf) : [];
  const related = [...new Set((written && written.related) || siblings)].filter((r) => r !== path);
  if (written) return { ...written, related, name: written.name || name };   // name: for a page whose h1 isn't its name (Home's greeting)
  const what = description || (item ? `${item.label} — part of ${item.group}.` : `Everything about ${name.toLowerCase()} in one place.`);
  return {
    name, related,
    en: E(what, ['Use the search and filters at the top to find what you need.', 'Open a row or card to see its details and actions.', 'The main button at the top adds something new.'], ['Your changes save as you go; a message at the bottom confirms each one.'], [`How to use ${name}`, '2:00']),
    bn: E(description ? `${name} — ${item ? item.group : ''} এর অংশ।` : `${name} — সব এক জায়গায়।`, ['উপরের Search আর Filter দিয়ে যা দরকার খুঁজুন।', 'কোনো row বা card খুললে বিস্তারিত আর কাজের button পাবেন।', 'উপরের মূল button দিয়ে নতুন কিছু যোগ করুন।'], ['প্রতিটি কাজ শেষে নিচে একটি ছোট message দেখাবে।'], [`${name} কীভাবে ব্যবহার করবেন`, '2:00']),
  };
}
/** Label for a related route. */
export function labelFor(path) {
  const it = navItemFor(path);
  if (it) return it.label;
  return path.replace(/^\//, '').replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}
