// help — what the Help panel shows for each page (components/ui/HelpPanel.jsx), in English and Bangla.
//   HELP[route] = { en: { what, steps: [], tips: [], video: [title, duration] }, bn: { … }, related: [routes] }
// Pages without an entry get one made from their menu entry and page description (helpFor), so every page has
// Help. Bangla follows docs/terminology.md: familiar business words stay English (Order, Stock, Payment, Due …).

import { NAV } from '../shell/navigation';
import { routeOf } from '../runtime/routes';

const E = (what, steps, tips, video) => ({ what, steps, tips, video });

export const HELP = {
  '/merchant-overview': {
    en: E('Your shop this morning: what needs you, how today is going, money to collect and stock to watch.', ['Start with "Needs your attention" — each line opens the page where you fix it.', 'Check today’s sales, orders and collection against yesterday.', 'Use Customise to hide sections you do not use.'], ['Numbers update as orders, payments and stock change.', 'Deeper analysis is in Reports.'], ['Your morning in 2 minutes', '2:10']),
    bn: E('সকালে Shop-এর অবস্থা: কী কী দেখতে হবে, আজ বিক্রি কেমন, কত টাকা তুলতে হবে আর কোন Stock কমে গেছে।', ['আগে "আপনার নজর দরকার" অংশ দেখুন — প্রতিটি লাইনে চাপ দিলে ঠিক করার page খুলবে।', 'আজকের Sales, Order আর Collection গতকালের সাথে মিলিয়ে দেখুন।', 'যে অংশ লাগে না, Customise থেকে লুকিয়ে রাখুন।'], ['Order, Payment, Stock বদলালে সংখ্যাও বদলায়।', 'বিস্তারিত হিসাব Reports-এ।'], ['২ মিনিটে আপনার সকাল', '2:10']),
    related: ['/my-dashboard', '/merchant-orders', '/daily-summary', '/reports-centre'],
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
    en: E('Every order, from new to delivered.', ['New orders start On hold (COD), Processing (paid) or Pending (payment due).', 'Open an order to verify it by call, then approve, take an advance or cancel.', 'Pack it, print the slip, then send it to the courier. It is In transit until delivered.'], ['Approved orders hold their stock.', 'Order SMS and email: Settings › Order notifications.'], ['Process an order start to finish', '3:40']),
    bn: E('সব Order — নতুন থেকে Delivered পর্যন্ত।', ['নতুন Order শুরু হয় হোল্ডে (COD), প্রসেসিং (Paid) বা Pending (Payment বাকি) হয়ে।', 'Order খুলে Call করে যাচাই করুন, তারপর Approve, Advance নিন বা Cancel করুন।', 'Pack করুন, Slip Print করুন, তারপর Courier-এ পাঠান। Delivered না হওয়া পর্যন্ত এটি পথে আছে।'], ['Approved Order-এর Stock আলাদা রাখা থাকে।', 'Order SMS ও Email: Settings › Order notifications।'], ['একটি Order শুরু থেকে শেষ', '3:40']),
    related: ['/new-order', '/courier-returns', '/wholesale-orders', '/return-exchange'],
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
    en: E('The shop counter: sell, take payment and print the memo. Wholesale customers get their prices here too.', ['Scan or search products to add them.', 'Choose the customer (or walk-in).', 'Press Pay, take cash, bKash or card, then print.'], ['Press F1 for keyboard shortcuts.', 'A wholesale sale can be left unpaid as an invoice.'], ['Make a sale at the counter', '3:00']),
    bn: E('দোকানের Counter: বিক্রি করুন, Payment নিন, Memo Print করুন। Wholesale Customer-এর দামও এখানেই।', ['Scan বা Search করে Product যোগ করুন।', 'Customer বাছুন (বা Walk-in)।', 'Pay চাপুন, Cash, bKash বা Card নিন, তারপর Print।'], ['Keyboard shortcut দেখতে F1 চাপুন।', 'Wholesale বিক্রি বাকিতে Invoice হিসেবে রাখা যায়।'], ['Counter-এ বিক্রি', '3:00']),
    related: ['/pos-manage', '/sales-invoices', '/return-exchange'],
  },
  '/pos-manage': {
    en: E('Behind the counter: counters, staff and shifts, cash pickups and POS settings.', ['Open a counter’s shift and close it with a cash count.', 'Record cash taken from a drawer in Cash pickups.'], ['Over or short cash is shown on the shift report.'], ['Counters and cash', '2:40']),
    bn: E('Counter-এর পেছনের কাজ: Counter, Staff আর Shift, Cash pickup আর POS settings।', ['Counter-এর Shift খুলুন, Cash গুনে বন্ধ করুন।', 'Drawer থেকে টাকা তুললে Cash pickups-এ লিখুন।'], ['Cash কম-বেশি হলে Shift report-এ দেখায়।'], ['Counter আর Cash', '2:40']),
    related: ['/pos', '/daily-summary'],
  },
  '/sales-invoices': {
    en: E('Invoices for wholesale and credit sales: who has paid, who has not.', ['Open an invoice to record a payment.', 'Recording the full payment completes the sale and its order.'], ['Partly paid invoices show what is still due.'], ['Collect an invoice payment', '2:00']),
    bn: E('Wholesale আর বাকির বিক্রির Invoice: কে টাকা দিয়েছে, কে দেয়নি।', ['Invoice খুলে Payment লিখুন।', 'পুরো Payment দিলে বিক্রি আর Order শেষ হয়।'], ['আংশিক দেওয়া Invoice-এ কত Due আছে দেখায়।'], ['Invoice-এর টাকা তোলা', '2:00']),
    related: ['/dues', '/wholesale-orders', '/pos'],
  },
  '/return-exchange': {
    en: E('Take back items from any sale — online, counter or wholesale — and refund or exchange.', ['Find the sale by memo, order or phone.', 'Choose items and the reason, then refund or exchange.'], ['Good items go back to stock; damaged ones go to the damaged bay.'], ['Returns and exchanges', '2:30']),
    bn: E('যেকোনো বিক্রি — Online, Counter বা Wholesale — থেকে পণ্য ফেরত নিন, টাকা ফেরত বা Exchange করুন।', ['Memo, Order বা Phone দিয়ে বিক্রি খুঁজুন।', 'পণ্য আর কারণ বাছুন, তারপর Refund বা Exchange।'], ['ভালো পণ্য Stock-এ ফেরে; নষ্ট পণ্য Damaged-এ যায়।'], ['Return আর Exchange', '2:30']),
    related: ['/return-history', '/merchant-orders'],
  },
  '/all-customers': {
    en: E('Everyone who bought or signed up, with their orders, spending and dues.', ['Search by name or phone.', 'Open a customer to see orders, payments and notes.', 'Add a wholesale customer with their price list.'], ['Customers with the same phone can be merged.'], ['Customers', '2:00']),
    bn: E('যারা কিনেছেন বা Sign up করেছেন — তাদের Order, খরচ আর Due।', ['নাম বা Phone দিয়ে Search করুন।', 'Customer খুলে Order, Payment আর Note দেখুন।', 'Wholesale Customer যোগ করার সময় তার Price list দিন।'], ['একই Phone-এর Customer একসাথে করা যায়।'], ['Customer', '2:00']),
    related: ['/sales-leads', '/dues'],
  },
  '/sales-leads': {
    en: E('People and shops who might buy, and when to call them back.', ['Add a lead from a call, message or walk-in.', 'After each call press Log it and set the next follow-up.', 'Mark Won when they buy — they become a customer.'], ['Overdue follow-ups are at the top.'], ['Leads and follow-ups', '2:30']),
    bn: E('যারা কিনতে পারেন — আর কবে আবার Call করবেন।', ['Call, Message বা Walk-in থেকে Lead যোগ করুন।', 'প্রতিটি Call-এর পর Log it চাপুন, পরের Follow-up দিন।', 'কিনলে Won করুন — তিনি Customer হয়ে যাবেন।'], ['সময় পেরোনো Follow-up সবার উপরে থাকে।'], ['Lead আর Follow-up', '2:30']),
    related: ['/all-customers', '/tasks'],
  },
  '/all-products': {
    en: E('Every product you sell, with price, stock and photos.', ['Add product for a new item.', 'Search by name, SKU or barcode; open a product to edit it.', 'Fix the "missing information" list so products sell better online.'], ['Stock numbers come from your warehouses and branches.'], ['Products', '2:30']),
    bn: E('যা যা বিক্রি করেন — দাম, Stock আর ছবি সহ।', ['নতুন পণ্যের জন্য Add product।', 'নাম, SKU বা Barcode দিয়ে Search করুন; Product খুলে Edit করুন।', 'Online-এ ভালো বিক্রির জন্য তথ্য কম থাকা Product ঠিক করুন।'], ['Stock-এর হিসাব Warehouse আর Branch থেকে আসে।'], ['Product', '2:30']),
    related: ['/add-product', '/stock', '/categories'],
  },
  '/add-product': {
    en: E('Add a new product: name, price, stock, photos and where it sells.', ['Fill name, price and opening stock first — the rest is optional.', 'Add photos and a short description for online sales.', 'Press Save product.'], ['Variants (size, colour) each get their own stock.'], ['Add a product', '3:20']),
    bn: E('নতুন Product যোগ করুন: নাম, দাম, Stock, ছবি আর কোথায় বিক্রি হবে।', ['আগে নাম, দাম আর শুরুর Stock দিন — বাকিগুলো দরকার হলে।', 'Online বিক্রির জন্য ছবি আর ছোট বিবরণ দিন।', 'Save product চাপুন।'], ['Size বা Colour-এর প্রতিটির আলাদা Stock থাকে।'], ['Product যোগ করা', '3:20']),
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
    en: E('Messages from Facebook, Instagram, WhatsApp and the website in one inbox.', ['Reply, use quick replies, and turn a chat into an order.'], ['Oldest waiting chats are at the top.'], ['Inbox', '2:30']),
    bn: E('Facebook, Instagram, WhatsApp আর Website-এর Message এক Inbox-এ।', ['Reply দিন, Quick reply ব্যবহার করুন, Chat থেকে Order বানান।'], ['সবচেয়ে বেশি সময় অপেক্ষার Chat উপরে থাকে।'], ['Inbox', '2:30']),
    related: ['/merchant-calls', '/support-tickets'],
  },
  '/set-general': {
    en: E('Your shop’s basic settings: name, contact, currency, VAT and invoice details.', ['Change a field and press Save.'], ['These appear on invoices and receipts.'], ['Store settings', '1:40']),
    bn: E('Shop-এর মূল Settings: নাম, যোগাযোগ, মুদ্রা, VAT আর Invoice-এর তথ্য।', ['তথ্য বদলে Save চাপুন।'], ['এগুলো Invoice আর Receipt-এ দেখায়।'], ['Store settings', '1:40']),
    related: ['/set-payments', '/set-delivery'],
  },
  '/channels': {
    en: E('Every sales channel at a glance: Meta (Facebook & Instagram), Google Merchant Center and Google Business.', ['Check each card: connected, last sync and problems.', 'Press Sync now to send the latest products, prices and stock.', 'Fix the problems in Recent issues — each row says what to do.'], ['Green means fine. Orange needs you. Red failed.', 'Connect channel adds a new one in a few steps.'], ['Sales channels', '2:00']),
    bn: E('সব Sales channel এক নজরে: Meta (Facebook ও Instagram), Google Merchant Center আর Google Business।', ['প্রতিটি Card দেখুন: Connected কি না, শেষ Sync আর সমস্যা।', 'সর্বশেষ Product, দাম আর Stock পাঠাতে Sync now চাপুন।', 'Recent issues-এর সমস্যাগুলো ঠিক করুন — প্রতিটি সারিতে কী করতে হবে লেখা আছে।'], ['সবুজ মানে ঠিক আছে। কমলা মানে আপনাকে দেখতে হবে। লাল মানে Failed।', 'Connect channel দিয়ে কয়েক ধাপে নতুন Channel যোগ করুন।'], ['Sales channels', '2:00']),
    related: ['/meta-commerce', '/google-merchant', '/google-business', '/sync-issues'],
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
    related: ['/channels', '/sync-issues'],
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
  '/connect-channel': {
    en: E('Connect Meta, Google Merchant Center or Google Business in six short steps.', ['Choose the channel and sign in with Meta or Google.', 'Pick the business, catalog or locations.', 'Choose what to sync, check the summary and connect.'], ['GridCommerce never sees your password.', 'The first sync starts as soon as you connect.'], ['Connect a channel', '1:30']),
    bn: E('ছয়টি ছোট ধাপে Meta, Google Merchant Center বা Google Business যুক্ত করুন।', ['Channel বাছুন আর Meta বা Google দিয়ে Sign in করুন।', 'Business, Catalog বা Location বাছুন।', 'কী Sync হবে বাছুন, সারাংশ দেখে Connect করুন।'], ['GridCommerce কখনো আপনার Password দেখে না।', 'Connect করার সঙ্গে সঙ্গে প্রথম Sync শুরু হয়।'], ['Connect a channel', '1:30']),
    related: ['/channels'],
  },
};

// ---- made-up help for pages without an entry ----------------------------------------------------
const ALL = NAV.flatMap((g) => g.items.flatMap((it) => [{ ...it, group: g.label }, ...(it.children || []).map((c) => ({ ...c, group: g.label, parent: it }))]));
const pathOf = (it) => (it.to ? routeOf(it.to).split('?')[0] : '');
export function navItemFor(path) { return ALL.find((it) => pathOf(it) === path) || null; }

/** Help for a page: the written entry, or one made from its menu entry and description. */
export function helpFor(path, { title = '', description = '' } = {}) {
  const item = navItemFor(path);
  const name = title || (item ? item.label : 'This page');
  const written = HELP[path];
  const siblings = item ? ALL.filter((x) => x.group === item.group && pathOf(x) && pathOf(x) !== path && (!item.parent || x.parent === item.parent || !x.parent)).slice(0, 4).map(pathOf) : [];
  const related = [...new Set((written && written.related) || siblings)].filter((r) => r !== path);
  if (written) return { ...written, related, name };
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
