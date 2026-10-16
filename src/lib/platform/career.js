// platform/career — Grid Career (Batch F, Oct 2026): hiring for GridCommerce itself and for the stores GridCommerce opens it
// for, replacing Google Forms, Sheets and social media posts. One engine for both sides: the super admin's Grid Career area
// (/admin/career…) and the merchant's Staff & HR › Hiring (/hiring…), plus the public pages: a store's careers page on its
// website (/careers), GridCommerce's own (/jobs) and the candidate's status page (/application?code=). Browser storage
// gc.career, event gc:career. Who may use it: lib/platform/marketAccess.js (module 'career').
//
//   Employers  employers[owner] { name, headline, about, logo, cover, benefits[], published, slug, city }
//              owner = 'gc' (GridCommerce) or a store id ('0090' = Dazzle Shop, the merchant panel's own store)
//   Jobs       { id 'JOB-101', owner, title, team, place, position (the HR position it fills, stores), type 'full-time' |
//              'part-time' | 'contract' | 'internship', salaryFrom, salaryTo, showSalary, description (plain text, blank
//              lines between paragraphs), duties[], needs[], questions[{ id, label, type 'text' | 'textarea' | 'select' |
//              'yesno' | 'number' | 'file', options[], req, knockout (the answer that rejects at once, e.g. 'No') }],
//              closesAt, status 'draft' | 'open' | 'paused' | 'closed', postedAt, views, share { text } (own share text),
//              hidden { reason, by, at } (GridCommerce hid it: abuse), createdAt, history[] }
//              Name, mobile, email, city and the CV are always asked; questions come after them.
//   Applications { id 'APP-1001', jobId, owner, name, phone, email, city, answers { [questionId]: value }, cv { name, size },
//              photo, source ('careers page' | 'facebook' | 'whatsapp' | 'linkedin' | 'referral' | 'other', from ?src=),
//              stage 'new' | 'shortlisted' | 'interview' | 'offer' | 'hired' | 'rejected', reason (why rejected),
//              knockout (the question that rejected it), rating 0–5, tags[], notes[{ by, text, at }],
//              interviews[{ at, mode 'at the shop' | 'phone' | 'video', with, link, place, outcome }],
//              messages[{ kind 'sms' | 'email', to, text, at, by, status }], code (6 letters: the status link),
//              appliedAt, hiredAt, staffCode, history[{ at, by, text, stage }] }
//   Templates  templates[owner][key] { en, bn } for received · shortlisted · interview · offer · rejected,
//              with {{name}} {{job}} {{employer}} {{time}} {{mode}} {{link}}.
//
// Functions return { ok, error, field } like services.js. Messages to candidates are simulated: they are logged on the
// application with a 'sent' status (a live build sends them through Communications).
// Front end only. The server must repeat the checks (required answers, knockout, one application per mobile and job).

export const CAREER_KEY = 'gc.career';
export const CAREER_EVENT = 'gc:career';
export const GC = 'gc';
export const SELF_SHOP = '0090';
const DAY = 864e5, H = 3600e3;
const isBrowser = typeof window !== 'undefined';

export const JOB_TYPES = [['full-time', 'Full-time'], ['part-time', 'Part-time'], ['contract', 'Contract'], ['internship', 'Internship']];
export const typeLabel = (k) => (JOB_TYPES.find((x) => x[0] === k) || [k, k])[1];
export const JOB_STATUS = {
  draft: { label: 'Draft', tone: 'neutral' }, open: { label: 'Open', tone: 'success' }, paused: { label: 'Paused', tone: 'warning' },
  closed: { label: 'Closed', tone: 'neutral' }, expired: { label: 'Closing date passed', tone: 'warning' }, hidden: { label: 'Hidden by GridCommerce', tone: 'error' },
};
export const STAGES = [
  ['new', 'New', 'info'], ['shortlisted', 'Shortlisted', 'primary'], ['interview', 'Interview', 'warning'],
  ['offer', 'Offer', 'primary'], ['hired', 'Hired', 'success'], ['rejected', 'Rejected', 'neutral'],
];
export const stageLabel = (k) => (STAGES.find((x) => x[0] === k) || [k, k])[1];
export const stageTone = (k) => (STAGES.find((x) => x[0] === k) || [k, k, 'neutral'])[2];
/** The next step forward for an application at a stage ('' at the end). */
export const NEXT_STAGE = { new: 'shortlisted', shortlisted: 'interview', interview: 'offer', offer: 'hired', hired: '', rejected: '' };
/** What the candidate reads on the status page (no internal words). */
export const CANDIDATE_WORDS = {
  new: ['We have your application', 'The team is reading the applications. We will message you when there is news.'],
  shortlisted: ['You are shortlisted', 'You are on the shortlist. We will contact you about an interview.'],
  interview: ['Interview', 'You are invited to an interview.'],
  offer: ['Offer made', 'We have made you an offer. Check your messages.'],
  hired: ['You are hired', 'Welcome to the team. We will send your joining details.'],
  rejected: ['Not selected this time', 'Thank you for applying. We have chosen other candidates for this job. You are welcome to apply again.'],
};
export const SOURCES = [['careers page', 'Careers page'], ['facebook', 'Facebook'], ['whatsapp', 'WhatsApp'], ['linkedin', 'LinkedIn'], ['referral', 'Referral'], ['other', 'Other']];
export const sourceLabel = (k) => (SOURCES.find((x) => x[0] === k) || [k, k])[1];
export const Q_TYPES = [['text', 'Short answer'], ['textarea', 'Long answer'], ['select', 'Choose one'], ['yesno', 'Yes or no'], ['number', 'Number'], ['file', 'File']];
export const qTypeLabel = (k) => (Q_TYPES.find((x) => x[0] === k) || [k, k])[1];
export const MODES = [['at the shop', 'In person'], ['phone', 'Phone call'], ['video', 'Video call']];
export const modeLabel = (k) => (MODES.find((x) => x[0] === k) || [k, k])[1];
export const TEMPLATE_KEYS = [['received', 'Application received'], ['shortlisted', 'Shortlisted'], ['interview', 'Interview invite'], ['offer', 'Offer'], ['rejected', 'Not selected']];
/** A CV or file the candidate may send: 5 MB at most (front end keeps only the name and size). */
export const FILE_MAX = 5 * 1024 * 1024;
export const FILE_TYPES = /\.(pdf|docx?|jpe?g|png)$/i;

export function now() {
  if (!isBrowser) return 0;
  try { return Date.now() + (Number(window.localStorage.getItem('gc.clock.offset')) || 0); } catch { return Date.now(); }
}

// ---- seed -----------------------------------------------------------------------------------------------------------------
const TEMPLATES = () => ({
  received: { en: 'Hi {{name}}, thanks for applying for {{job}} at {{employer}}. Follow your application here: {{link}}', bn: '{{name}}, {{employer}}-এ {{job}} পদে আবেদনের জন্য ধন্যবাদ। আবেদনের অবস্থা এখানে দেখুন: {{link}}' },
  shortlisted: { en: 'Hi {{name}}, good news: you are shortlisted for {{job}} at {{employer}}. We will contact you about an interview. {{link}}', bn: '{{name}}, সুখবর: {{employer}}-এ {{job}} পদের জন্য আপনি সংক্ষিপ্ত তালিকায় আছেন। ইন্টারভিউয়ের জন্য আমরা যোগাযোগ করব। {{link}}' },
  interview: { en: 'Hi {{name}}, you are invited to an interview for {{job}} at {{employer}} on {{time}} ({{mode}}). Please reply to confirm. {{link}}', bn: '{{name}}, {{employer}}-এ {{job}} পদের ইন্টারভিউ {{time}} ({{mode}})। নিশ্চিত করতে উত্তর দিন। {{link}}' },
  offer: { en: 'Hi {{name}}, we are happy to offer you the {{job}} job at {{employer}}. We will call you with the details. {{link}}', bn: '{{name}}, {{employer}}-এ {{job}} পদে আপনাকে নিয়োগের প্রস্তাব দিচ্ছি। বিস্তারিত জানাতে আমরা ফোন করব। {{link}}' },
  rejected: { en: 'Hi {{name}}, thank you for applying for {{job}} at {{employer}}. We have chosen other candidates this time. We wish you the best.', bn: '{{name}}, {{employer}}-এ {{job}} পদে আবেদনের জন্য ধন্যবাদ। এবার আমরা অন্য প্রার্থী বেছে নিয়েছি। আপনার জন্য শুভকামনা।' },
});
const Q = (id, label, type, extra = {}) => ({ id, label, type, options: [], req: true, knockout: '', ...extra });
const CV = (name, kb) => ({ name, size: kb * 1024 });

function seed(t) {
  const db = {
    v: 1, seq: { job: 101, app: 1001 },
    employers: {
      gc: { name: 'GridCommerce', headline: 'Build the tools Bangladesh’s shops run on', about: 'GridCommerce is a commerce platform for shops in Bangladesh: orders, stock, POS, payments and their website in one place. We are a small team in Dhaka that ships every week and talks to merchants every day.', logo: '/assets/9b6f9ad369f1cbde65271a968e6ba1f1.png', cover: '', benefits: ['Salary reviewed every year', 'Two Eid bonuses', 'Lunch at the office', 'Work from home on Thursdays', 'Health cover for you and your family'], published: true, slug: 'gridcommerce', city: 'Dhaka' },
      [SELF_SHOP]: { name: 'Dazzle Shop', headline: 'Join the Dazzle Shop team', about: 'Dazzle Shop sells phones, accessories and repairs from Dhanmondi, Mirpur and online across Bangladesh. We look for friendly people who love phones and care about customers.', logo: '', cover: '', benefits: ['Monthly sales commission', 'Two Eid bonuses', 'Staff price on phones', 'Training on new phones'], published: true, slug: 'dazzle-shop', city: 'Dhaka' },
    },
    templates: { gc: TEMPLATES(), [SELF_SHOP]: TEMPLATES() },
    jobs: [], apps: [],
  };
  const job = (owner, f, daysAgo) => {
    const id = 'JOB-' + db.seq.job++;
    const at = t - daysAgo * DAY;
    const j = { id, owner, team: '', place: '', position: '', type: 'full-time', salaryFrom: 0, salaryTo: 0, showSalary: true, description: '', duties: [], needs: [], questions: [], closesAt: null, status: 'open', postedAt: at, views: 0, share: null, hidden: null, createdAt: at - DAY, history: [{ at: at - DAY, by: owner === GC ? 'Mahin Khan' : 'Rumana Islam', text: 'Job created' }], ...f };
    if (j.status !== 'draft') j.history.push({ at, by: j.history[0].by, text: 'Published' });
    else j.postedAt = null;
    db.jobs.push(j);
    return j;
  };
  const CS = job(GC, {
    title: 'Customer success executive', team: 'Customer success', place: 'Dhaka office (Banani)', type: 'full-time', salaryFrom: 28000, salaryTo: 38000, closesAt: t + 18 * DAY, views: 642,
    description: 'Merchants call, message and email us every day. You help them set up their shop on GridCommerce, answer their questions and make sure they get value from it.\n\nYou work with the support and product teams, and you tell us what merchants need next.',
    duties: ['Answer merchant chats, calls and email in Bangla and English', 'Run setup calls with new stores', 'Follow up stores that stop using GridCommerce', 'Write help articles from the questions you get'],
    needs: ['1+ year in customer support or sales', 'Clear Bangla and good English', 'Calm on the phone', 'Knows how online shops work in Bangladesh'],
    questions: [Q('q1', 'Can you work Saturday to Thursday, 10 am to 7 pm?', 'yesno', { knockout: 'No' }), Q('q2', 'Years of customer support experience', 'number'), Q('q3', 'Why do you want to work at GridCommerce?', 'textarea'), Q('q4', 'Expected salary (৳ a month)', 'number', { req: false })],
  }, 12);
  const DEV = job(GC, {
    title: 'Junior front-end developer', team: 'Product', place: 'Dhaka office (Banani), 3 days a week', type: 'full-time', salaryFrom: 40000, salaryTo: 60000, closesAt: t + 25 * DAY, views: 1210,
    description: 'You build the screens merchants use every day: orders, stock, POS and the store builder. We use React and Next.js and care about speed on cheap phones.\n\nYou pair with a senior developer and ship to real shops from your first month.',
    duties: ['Build and fix screens from designs', 'Make pages work well on phones', 'Write small tests for what you build', 'Review each other’s work'],
    needs: ['Good JavaScript and CSS', 'Some React (projects count)', 'Reads and writes English well', 'A portfolio or GitHub we can look at'],
    questions: [Q('q1', 'Link to your GitHub or portfolio', 'text'), Q('q2', 'Which have you used?', 'select', { options: ['React', 'Vue', 'Plain JavaScript only', 'None yet'] }), Q('q3', 'Can you work from our Dhaka office 3 days a week?', 'yesno', { knockout: 'No' }), Q('q4', 'A small project you are proud of', 'textarea', { req: false })],
  }, 9);
  const SALES = job(GC, {
    title: 'Sales executive', team: 'Sales', place: 'Dhaka (field)', type: 'full-time', salaryFrom: 25000, salaryTo: 35000, closesAt: t + 10 * DAY, views: 388,
    description: 'You visit shops across Dhaka, show them GridCommerce and help them sign up. Salary plus commission on every store that subscribes.',
    duties: ['Visit 6–8 shops a day', 'Show the POS and the online store on a tablet', 'Keep every lead in the CRM'],
    needs: ['Sales experience, any field', 'A motorbike is a plus', 'Lives in Dhaka'],
    questions: [Q('q1', 'Years of sales experience', 'number'), Q('q2', 'Do you have a motorbike and a licence?', 'yesno', { req: false }), Q('q3', 'Which areas of Dhaka do you know well?', 'text')],
  }, 5);
  job(GC, {
    title: 'Content writer (Bangla and English)', team: 'Marketing', place: 'Remote', type: 'part-time', salaryFrom: 15000, salaryTo: 20000, status: 'draft',
    description: 'Write our blog, help articles and social posts in Bangla and English.', duties: ['Two blog posts a week', 'Help articles for new features'], needs: ['Writes clean Bangla and English', 'Examples of published work'],
    questions: [Q('q1', 'Links to 2 things you wrote', 'textarea'), Q('q2', 'Writing sample', 'file', { req: false })],
  }, 2);
  job(GC, {
    title: 'Support intern', team: 'Customer success', place: 'Dhaka office (Banani)', type: 'internship', salaryFrom: 10000, salaryTo: 10000, status: 'closed', closesAt: t - 20 * DAY, views: 905,
    description: 'Three months with the support team: answer chats, test new features and learn how shops run.', duties: ['Answer simple chats', 'Test new features'], needs: ['Final-year student or fresh graduate'],
    questions: [Q('q1', 'University and subject', 'text')],
  }, 50);
  const DZS = job(SELF_SHOP, {
    title: 'Sales executive', team: 'Store operations', place: 'Dhanmondi branch', position: 'Sales associate', type: 'full-time', salaryFrom: 14000, salaryTo: 18000, closesAt: t + 14 * DAY, views: 312,
    description: 'Help customers choose phones and accessories at our Dhanmondi branch, set up new phones for them and close the sale at the counter.\n\nMonthly commission on top of the salary.',
    duties: ['Greet and help customers on the floor', 'Show phones, compare models and set them up', 'Sell at the counter with the POS', 'Keep the display clean and priced'],
    needs: ['Knows smartphones well', 'Friendly and honest', 'SSC or above', 'Can work evening shifts'],
    questions: [Q('q1', 'Can you work Fridays?', 'yesno', { knockout: 'No' }), Q('q2', 'Years in phone or electronics sales', 'number'), Q('q3', 'Which phone brands do you know well?', 'textarea', { req: false })],
  }, 8);
  const RIDER = job(SELF_SHOP, {
    title: 'Delivery rider', team: 'Delivery', place: 'Central Warehouse (Tejgaon)', position: 'Delivery rider', type: 'full-time', salaryFrom: 13000, salaryTo: 17000, closesAt: t + 20 * DAY, views: 198,
    description: 'Deliver online orders inside Dhaka from our Central Warehouse, collect cash on delivery and bring returns back.',
    duties: ['15–25 deliveries a day inside Dhaka', 'Collect cash on delivery and hand it in each evening', 'Take returns back to the warehouse'],
    needs: ['Own motorbike and a valid licence', 'Knows Dhaka’s roads', 'Has a smartphone'],
    questions: [Q('q1', 'Do you have your own motorbike?', 'yesno', { knockout: 'No' }), Q('q2', 'Driving licence number', 'text'), Q('q3', 'Which areas of Dhaka do you know well?', 'textarea', { req: false })],
  }, 6);

  // applicants: [job, name, phone, email, city, source, stage, rating, daysAgo, answers, extra]
  const A = (j, name, phone, email, city, source, stage, rating, daysAgo, answers, extra = {}) => {
    const at = t - daysAgo * DAY - (db.seq.app % 7) * H;
    const id = 'APP-' + db.seq.app++;
    const by = j.owner === GC ? 'Mahin Khan' : 'Rumana Islam';
    const a = { id, jobId: j.id, owner: j.owner, name, phone, email, city, answers, cv: CV(name.replace(/\s+/g, '_') + '_CV.pdf', 120 + (db.seq.app % 9) * 23), photo: '', source, stage: 'new', reason: '', knockout: '', rating, tags: [], notes: [], interviews: [], messages: [], code: codeFrom(id), appliedAt: at, hiredAt: null, staffCode: '', history: [{ at, by: name, text: 'Applied from ' + sourceLabel(source).toLowerCase(), stage: 'new' }], ...extra };
    a.messages.push({ kind: 'sms', to: phone, text: fill(db.templates[j.owner].received.en, a, j, db.employers[j.owner]), at: at + 60e3, by: 'Grid Career', status: 'sent' });
    const path = ['new', 'shortlisted', 'interview', 'offer', 'hired'];
    if (stage === 'rejected') {
      a.stage = 'rejected';
      a.reason = extra.reason || 'Not the right fit for this job';
      a.history.push({ at: at + (extra.knockout ? 0 : 2 * DAY), by: extra.knockout ? 'Grid Career' : by, text: extra.knockout ? 'Rejected by a knockout answer' : 'Rejected: ' + a.reason, stage: 'rejected' });
    } else {
      path.slice(1, path.indexOf(stage) + 1).forEach((s, i) => {
        const when = Math.min(t - H, at + (i + 1) * 1.5 * DAY);
        a.stage = s;
        a.history.push({ at: when, by, text: 'Moved to ' + stageLabel(s), stage: s });
        if (s === 'interview') a.interviews.push({ at: Math.round((extra.interviewAt || when + 2 * DAY) / 1800e3) * 1800e3, mode: extra.mode || 'at the shop', with: by, link: '', place: j.place, outcome: extra.outcome || '' });
        if (s === 'hired') a.hiredAt = when;
      });
    }
    if (extra.note) a.notes.push({ by, text: extra.note, at: at + DAY });
    db.apps.push(a);
    return a;
  };
  // GridCommerce: 13 across the three open jobs
  A(CS, 'Nusrat Jahan', '01711-234567', 'nusrat.jahan@gmail.com', 'Dhaka', 'linkedin', 'interview', 4, 10, { q1: 'Yes', q2: '3', q3: 'I worked 3 years at a courier’s merchant support desk and want to help shops grow.', q4: '35000' }, { interviewAt: t + 1 * DAY + 3 * H, note: 'Strong on the phone. Ask about weekend cover.' });
  A(CS, 'Tanvir Hossain', '01819-445566', 'tanvir.h@yahoo.com', 'Dhaka', 'facebook', 'shortlisted', 4, 8, { q1: 'Yes', q2: '2', q3: 'I like solving problems for people and I know e-commerce from my own Facebook page.', q4: '30000' });
  A(CS, 'Farzana Akter', '01912-778899', 'farzana.akter@gmail.com', 'Gazipur', 'careers page', 'new', 0, 1, { q1: 'Yes', q2: '1', q3: 'I want to learn about software and help shop owners.', q4: '' });
  A(CS, 'Rasel Mia', '01555-112233', '', 'Dhaka', 'facebook', 'rejected', 0, 6, { q1: 'No', q2: '4', q3: 'Good salary', q4: '45000' }, { knockout: 'q1', reason: 'Answered “No” to “Can you work Saturday to Thursday, 10 am to 7 pm?”' });
  A(CS, 'Sumaiya Rahman', '01611-998877', 'sumaiya.r@outlook.com', 'Dhaka', 'referral', 'offer', 5, 11, { q1: 'Yes', q2: '5', q3: 'I led a team of four at a telecom call centre and want a smaller team where I can do more.', q4: '38000' }, { outcome: 'Passed: great with angry callers', note: 'Referred by Mahin. Offer sent at ৳37,000.' });
  A(DEV, 'Arif Chowdhury', '01722-556644', 'arif.dev@gmail.com', 'Dhaka', 'linkedin', 'interview', 4, 8, { q1: 'github.com/arifchowdhury', q2: 'React', q3: 'Yes', q4: 'A Bangla dictionary app in React with 2,000 users.' }, { interviewAt: t + 2 * DAY + 5 * H, mode: 'video' });
  A(DEV, 'Mehedi Hasan', '01833-221100', 'mehedi.hasan@gmail.com', 'Sylhet', 'linkedin', 'new', 0, 2, { q1: 'mehedihasan.dev', q2: 'Vue', q3: 'Yes', q4: '' });
  A(DEV, 'Sadia Islam', '01944-332211', 'sadia.islam@gmail.com', 'Dhaka', 'careers page', 'shortlisted', 5, 6, { q1: 'github.com/sadiaislam', q2: 'React', q3: 'Yes', q4: 'An online order form for my aunt’s boutique, with bKash payment.' });
  A(DEV, 'Imran Kabir', '01677-889900', 'imran.kabir@gmail.com', 'Rajshahi', 'whatsapp', 'rejected', 2, 7, { q1: 'github.com/imrankabir', q2: 'Plain JavaScript only', q3: 'No', q4: '' }, { knockout: 'q3', reason: 'Answered “No” to “Can you work from our Dhaka office 3 days a week?”' });
  A(DEV, 'Lamia Sultana', '01788-667755', 'lamia.sultana@gmail.com', 'Dhaka', 'other', 'new', 0, 0.3, { q1: 'lamiasultana.github.io', q2: 'React', q3: 'Yes', q4: '' });
  A(SALES, 'Shakil Ahmed', '01515-443322', '', 'Dhaka', 'facebook', 'new', 0, 3, { q1: '2', q2: 'Yes', q3: 'Mirpur, Uttara, Mohammadpur' });
  A(SALES, 'Jannatul Ferdous', '01313-554466', 'jannatul.f@gmail.com', 'Dhaka', 'whatsapp', 'shortlisted', 3, 4, { q1: '3', q2: 'No', q3: 'Dhanmondi, Lalmatia, New Market' });
  A(SALES, 'Rakibul Islam', '01414-665577', 'rakibul.islam@gmail.com', 'Narayanganj', 'referral', 'hired', 4, 16, { q1: '4', q2: 'Yes', q3: 'Old Dhaka, Narayanganj, Jatrabari' }, { outcome: 'Passed' });
  // Dazzle Shop: 8 across the two jobs
  A(DZS, 'Sabbir Rahman', '01716-224466', 'sabbir.rahman@gmail.com', 'Dhaka', 'facebook', 'new', 0, 1, { q1: 'Yes', q2: '2', q3: 'Samsung, Xiaomi, realme' });
  A(DZS, 'Mim Akter', '01817-335577', '', 'Dhaka', 'facebook', 'shortlisted', 4, 5, { q1: 'Yes', q2: '1', q3: 'iPhone and Samsung' });
  A(DZS, 'Hasibul Hasan', '01918-446688', 'hasib.h@gmail.com', 'Dhaka', 'careers page', 'interview', 4, 7, { q1: 'Yes', q2: '3', q3: 'All the big brands, I worked at Bashundhara City' }, { interviewAt: t + 1 * DAY + 6 * H, note: 'Ask him to show a phone setup.' });
  A(DZS, 'Rubel Hossain', '01619-557799', '', 'Dhaka', 'whatsapp', 'rejected', 0, 4, { q1: 'No', q2: '5', q3: 'Symphony, Walton' }, { knockout: 'q1', reason: 'Answered “No” to “Can you work Fridays?”' });
  A(DZS, 'Nadia Chowdhury', '01720-668800', 'nadia.c@gmail.com', 'Dhaka', 'referral', 'offer', 5, 8, { q1: 'Yes', q2: '2', q3: 'iPhone, Samsung, OnePlus' }, { outcome: 'Passed: very good with customers' });
  A(RIDER, 'Jahid Hasan', '01521-779911', '', 'Dhaka', 'facebook', 'new', 0, 2, { q1: 'Yes', q2: 'DK-0412398', q3: 'Tejgaon, Gulshan, Badda' });
  A(RIDER, 'Alamgir Kabir', '01322-881122', '', 'Dhaka', 'whatsapp', 'shortlisted', 3, 4, { q1: 'Yes', q2: 'DK-0398812', q3: 'All of north Dhaka' });
  A(RIDER, 'Sohel Rana', '01423-992233', '', 'Dhaka', 'facebook', 'rejected', 0, 3, { q1: 'No', q2: '', q3: 'Mirpur' }, { knockout: 'q1', reason: 'Answered “No” to “Do you have your own motorbike?”' });
  return db;
}

// ---- storage ----------------------------------------------------------------------------------------------------------------
const DB_VERSION = 1;
let cache = { raw: undefined, db: null };
let EMPTY = null;
const empty = () => { if (!EMPTY) EMPTY = seed(0); return EMPTY; };
export function read() {
  if (!isBrowser) return empty();
  let raw = null;
  try { raw = window.localStorage.getItem(CAREER_KEY); } catch { /* ignore */ }
  if (raw && raw === cache.raw && cache.db) return cache.db;
  let db = null;
  try { db = raw ? JSON.parse(raw) : null; } catch { db = null; }
  if (!db || db.v !== DB_VERSION) { db = seed(now()); write(db, true); return db; }
  cache = { raw, db };
  return db;
}
function write(db, quiet) {
  try { const raw = JSON.stringify(db); window.localStorage.setItem(CAREER_KEY, raw); cache = { raw, db }; if (!quiet) window.dispatchEvent(new CustomEvent(CAREER_EVENT)); } catch { /* ignore */ }
}
export function commit(fn) {
  const db = JSON.parse(JSON.stringify(read()));
  const res = fn(db, now());
  if (res && res.ok === false) return res;
  write(db);
  return res || { ok: true };
}
const fail = (error, field) => ({ ok: false, error, field });
const clean = (x) => String(x == null ? '' : x).trim();
const amt = (x) => Math.round(Number(String(x == null ? '' : x).replace(/[^0-9.]/g, '')) || 0);
const lines = (x) => (Array.isArray(x) ? x : String(x || '').split('\n')).map(clean).filter(Boolean);
const PHONE_RE = /^(?:\+?88)?01[3-9]\d{8}$/;
const EMAIL_RE = /^\S+@\S+\.\S+$/;
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function codeFrom(seedText) {
  let h = 2166136261;
  for (const c of String(seedText)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  let s = '';
  for (let i = 0; i < 6; i++) { s += CODE_CHARS[h % CODE_CHARS.length]; h = Math.imul(h ^ (h >>> 13), 2654435761) >>> 0; }
  return s;
}
function newCode(db) {
  for (let i = 0; i < 40; i++) {
    let s = '';
    for (let k = 0; k < 6; k++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    if (!db.apps.some((a) => a.code === s)) return s;
  }
  return codeFrom(String(Date.now()));
}

// ---- reads --------------------------------------------------------------------------------------------------------------------
export const BLANK_EMPLOYER = { name: '', headline: '', about: '', logo: '', cover: '', benefits: [], published: false, slug: '', city: '' };
export const employerOf = (owner, db = read()) => ({ ...BLANK_EMPLOYER, ...((db.employers || {})[owner] || {}) });
export const templatesOf = (owner, db = read()) => ({ ...TEMPLATES(), ...((db.templates || {})[owner] || {}) });
export const getJobs = (owner) => read().jobs.filter((j) => !owner || j.owner === owner).slice().sort((a, b) => (b.postedAt || b.createdAt) - (a.postedAt || a.createdAt));
export const jobById = (id) => read().jobs.find((j) => j.id === id) || null;
export const getApplications = (f = {}) => read().apps.filter((a) => (!f.owner || a.owner === f.owner) && (!f.jobId || a.jobId === f.jobId)).slice().sort((a, b) => b.appliedAt - a.appliedAt);
export const applicationById = (id) => read().apps.find((a) => a.id === id) || null;
export const owners = () => Object.keys(read().employers || {});

/** The state a job shows: hidden (by GridCommerce) beats everything; an open job past its closing date is 'expired'. */
export function jobState(j, t = now()) {
  if (!j) return 'closed';
  if (j.hidden) return 'hidden';
  if (j.status === 'open' && j.closesAt && t > j.closesAt) return 'expired';
  return j.status;
}
/** Can candidates apply now? */
export const isLive = (j, t = now()) => jobState(j, t) === 'open';
/** The open jobs on an employer's public page (none when the page is switched off). */
export function publicJobs(owner, db = read()) {
  if (!employerOf(owner, db).published) return [];
  const t = now();
  return db.jobs.filter((j) => j.owner === owner && isLive(j, t)).sort((a, b) => (b.postedAt || 0) - (a.postedAt || 0));
}
/** Applications per stage for a job (or an owner): { new: n, … , total }. */
export function stageCounts(f = {}) {
  const out = Object.fromEntries(STAGES.map(([k]) => [k, 0]));
  getApplications(f).forEach((a) => { out[a.stage] = (out[a.stage] || 0) + 1; });
  out.total = STAGES.reduce((s, [k]) => s + out[k], 0);
  return out;
}

// ---- links and sharing ---------------------------------------------------------------------------------------------------
const origin = () => (isBrowser ? window.location.origin : '');
/** The public address of a job (or the careers page without a job); src = where the link is shared. */
export function jobLink(j, src) {
  const base = origin() + (j && j.owner === GC ? '/jobs' : '/careers');
  const q = new URLSearchParams();
  if (j) q.set('job', j.id);
  if (src && src !== 'careers page') q.set('src', src);
  const s = q.toString();
  return base + (s ? '?' + s : '');
}
export const careersLink = (owner) => origin() + (owner === GC ? '/jobs' : '/careers');
export const statusLink = (code) => origin() + '/application?code=' + encodeURIComponent(code || '');
export const salaryText = (j) => {
  if (!j || !j.salaryFrom) return '';
  const f = (n) => '৳' + Math.round(n).toLocaleString('en-IN');
  return (j.salaryTo && j.salaryTo !== j.salaryFrom ? f(j.salaryFrom) + '–' + f(j.salaryTo) : f(j.salaryFrom)) + ' a month';
};
/** The automatic share text: the job, place, type, salary (when shown) and the link. */
export function autoShareText(j, link, employer) {
  if (!j) return '';
  const e = employer || employerOf(j.owner);
  const sal = j.showSalary ? salaryText(j) : '';
  const need = (j.needs || []).slice(0, 3).map((x) => '• ' + x).join('\n');
  return `We are hiring: ${j.title} at ${e.name}\n${j.place} · ${typeLabel(j.type)}${sal ? ' · ' + sal : ''}${need ? '\n' + need : ''}${j.closesAt ? '\nApply by ' + new Date(j.closesAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}${link ? '\nApply here: ' + link : ''}`;
}
export const shareText = (j, link) => (j && j.share && j.share.text ? j.share.text + (link && !j.share.text.includes(link) ? '\n' + link : '') : autoShareText(j, link));
export function saveShareText(id, text) {
  return commit((db) => { const j = db.jobs.find((x) => x.id === id); if (!j) return fail('Job not found'); j.share = clean(text) ? { text: clean(text) } : null; return { ok: true }; });
}

// ---- employers and templates -------------------------------------------------------------------------------------------------
export function saveEmployer(owner, patch, by) {
  return commit((db, t) => {
    const e = { ...employerOf(owner, db), ...patch };
    e.name = clean(e.name);
    if (!e.name) return fail('Give the employer a name.', 'name');
    e.headline = clean(e.headline); e.about = clean(e.about); e.benefits = lines(e.benefits);
    db.employers[owner] = e;
    (db.log = db.log || []).unshift({ at: t, by: by || 'Staff', owner, text: 'Careers page changed' });
    db.log = db.log.slice(0, 60);
    return { ok: true, employer: e };
  });
}
export function saveTemplates(owner, tpl) {
  return commit((db) => {
    const cur = templatesOf(owner, db);
    TEMPLATE_KEYS.forEach(([k]) => { if (tpl[k]) cur[k] = { en: clean(tpl[k].en) || cur[k].en, bn: clean(tpl[k].bn) || cur[k].bn }; });
    db.templates[owner] = cur;
    return { ok: true };
  });
}
function fill(text, a, j, e, extra = {}) {
  const iv = (a.interviews || [])[a.interviews.length - 1];
  const vars = { name: (a.name || '').split(' ')[0] || a.name, job: j ? j.title : '', employer: e ? e.name : '', link: statusLink(a.code), time: iv ? new Date(iv.at).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '', mode: iv ? modeLabel(iv.mode).toLowerCase() + (iv.mode === 'video' && iv.link ? ': ' + iv.link : iv.mode === 'at the shop' && iv.place ? ', ' + iv.place : '') : '', ...extra };
  return String(text || '').replace(/\{\{(\w+)\}\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
}
/** A template filled in for an application. lang 'en' | 'bn'; iv = an interview to show before it is booked. */
export function templateText(appId, key, lang = 'en', iv = null) {
  const db = read();
  const a = db.apps.find((x) => x.id === appId);
  if (!a) return '';
  const j = db.jobs.find((x) => x.id === a.jobId);
  // iv = an interview not booked yet (the Book interview dialog's preview): { at, mode, link, place }
  const app = iv ? { ...a, interviews: [...(a.interviews || []), iv] } : a;
  return fill((templatesOf(a.owner, db)[key] || {})[lang] || '', app, j, employerOf(a.owner, db));
}

// ---- jobs -------------------------------------------------------------------------------------------------------------------
function cleanQuestions(qs) {
  const out = [];
  for (const [i, q] of (qs || []).entries()) {
    const label = clean(q.label);
    if (!label) return fail(`Question ${i + 1} has no text.`, 'q' + i);
    const type = Q_TYPES.some((x) => x[0] === q.type) ? q.type : 'text';
    const options = type === 'select' ? lines(q.options) : [];
    if (type === 'select' && options.length < 2) return fail(`“${label}” needs at least two choices.`, 'q' + i);
    let knockout = clean(q.knockout);
    if (type === 'yesno' && !['Yes', 'No'].includes(knockout)) knockout = '';
    if (type === 'select' && !options.includes(knockout)) knockout = '';
    if (!['yesno', 'select'].includes(type)) knockout = '';
    out.push({ id: q.id || 'q' + (i + 1), label, type, options, req: !!q.req || !!knockout, knockout });
  }
  const ids = new Set();
  out.forEach((q, i) => { while (ids.has(q.id)) q.id = 'q' + (i + 1) + '_' + Math.random().toString(36).slice(2, 5); ids.add(q.id); });
  return { ok: true, questions: out };
}
/** Create or save a job. f = the job's fields (id for an existing one). New jobs start as drafts. */
export function saveJob(f, by) {
  return commit((db, t) => {
    const title = clean(f.title);
    if (!title) return fail('Give the job a title.', 'title');
    const place = clean(f.place);
    if (!place) return fail('Where is the job? A branch, a city or Remote.', 'place');
    const from = amt(f.salaryFrom), to = amt(f.salaryTo);
    if (to && from > to) return fail('The salary starts above where it ends.', 'salaryTo');
    const qs = cleanQuestions(f.questions);
    if (!qs.ok) return qs;
    const closesAt = f.closesAt ? Number(f.closesAt) : null;
    const fields = { title, team: clean(f.team), place, position: clean(f.position), type: JOB_TYPES.some((x) => x[0] === f.type) ? f.type : 'full-time', salaryFrom: from, salaryTo: to || from, showSalary: f.showSalary !== false, description: String(f.description || '').replace(/\r/g, '').trim(), duties: lines(f.duties), needs: lines(f.needs), questions: qs.questions, closesAt };
    let j = f.id ? db.jobs.find((x) => x.id === f.id) : null;
    if (f.id && !j) return fail('Job not found');
    if (j) { Object.assign(j, fields); j.history.push({ at: t, by: by || 'Staff', text: 'Saved' }); }
    else {
      if (!f.owner) return fail('Who is hiring?');
      j = { id: 'JOB-' + db.seq.job++, owner: f.owner, ...fields, status: 'draft', postedAt: null, views: 0, share: null, hidden: null, createdAt: t, history: [{ at: t, by: by || 'Staff', text: 'Job created' }] };
      db.jobs.push(j);
    }
    return { ok: true, job: j };
  });
}
/** Publish (open), pause or close a job. Opening needs a description and a closing date in the future (if set). */
export function setJobStatus(id, status, by) {
  return commit((db, t) => {
    const j = db.jobs.find((x) => x.id === id);
    if (!j) return fail('Job not found');
    if (!JOB_STATUS[status] || ['expired', 'hidden'].includes(status)) return fail('Unknown status');
    if (status === 'open') {
      if (j.hidden) return fail('GridCommerce has hidden this job: ' + j.hidden.reason);
      if (!clean(j.description)) return fail('Add a short description before you publish.', 'description');
      if (j.closesAt && j.closesAt < t) return fail('The closing date has passed: pick a new one first.', 'closesAt');
      if (!j.postedAt) j.postedAt = t;
    }
    const was = j.status;
    j.status = status;
    j.history.push({ at: t, by: by || 'Staff', text: status === 'open' ? (was === 'draft' ? 'Published' : 'Opened again') : status === 'paused' ? 'Paused' : status === 'closed' ? 'Closed' : 'Back to draft' });
    return { ok: true, job: j };
  });
}
export function deleteJob(id) {
  return commit((db) => {
    const j = db.jobs.find((x) => x.id === id);
    if (!j) return fail('Job not found');
    if (db.apps.some((a) => a.jobId === id)) return fail('This job has applicants: close it instead.');
    db.jobs = db.jobs.filter((x) => x.id !== id);
    return { ok: true };
  });
}
/** GridCommerce hides a job (abuse); the employer sees the reason, candidates no longer see it. */
export function hideJob(id, reason, by) {
  const why = clean(reason);
  if (!why) return fail('Write why: the store sees it.', 'reason');
  return commit((db, t) => {
    const j = db.jobs.find((x) => x.id === id);
    if (!j) return fail('Job not found');
    j.hidden = { reason: why, by: by || 'Staff', at: t };
    j.history.push({ at: t, by: by || 'Staff', text: 'Hidden by GridCommerce: ' + why });
    return { ok: true };
  });
}
export function unhideJob(id, by) {
  return commit((db, t) => {
    const j = db.jobs.find((x) => x.id === id);
    if (!j) return fail('Job not found');
    j.hidden = null;
    j.history.push({ at: t, by: by || 'Staff', text: 'Shown again by GridCommerce' });
    return { ok: true };
  });
}
/** Count a visit to the job's public page (once per browser session). */
export function countView(id) {
  if (!isBrowser) return;
  const k = 'gc.career.seen.' + id;
  try { if (window.sessionStorage.getItem(k)) return; window.sessionStorage.setItem(k, '1'); } catch { /* ignore */ }
  commit((db) => { const j = db.jobs.find((x) => x.id === id); if (j) j.views = (j.views || 0) + 1; return { ok: true }; });
}

// ---- applications ---------------------------------------------------------------------------------------------------------
function logMessage(db, a, kind, text, by, t) {
  a.messages.push({ kind, to: kind === 'email' ? a.email : a.phone, text, at: t, by: by || 'Staff', status: kind === 'email' && !a.email ? 'failed: no email' : 'sent' });
}
/**
 * A candidate applies. f = { name, phone, email, city, answers { [qid]: value }, cv { name, size }, photo, source }.
 * Checks the always-asked fields and required answers; a knockout answer puts the application straight into Rejected
 * (with the reason). Returns { ok, app, knockedOut } or { ok: false, error, field, code (when already applied) }.
 */
export function applyToJob(jobId, f) {
  return commit((db, t) => {
    const j = db.jobs.find((x) => x.id === jobId);
    if (!j || !isLive(j, t) || !employerOf(j.owner, db).published) return fail('This job is no longer taking applications.');
    const name = clean(f.name);
    if (name.length < 3) return fail('Enter your full name.', 'name');
    const phone = clean(f.phone).replace(/[\s-]/g, '');
    if (!PHONE_RE.test(phone)) return fail('Enter your mobile number, like 01712 345678.', 'phone');
    const email = clean(f.email);
    if (email && !EMAIL_RE.test(email)) return fail('This email looks wrong.', 'email');
    const cv = f.cv && f.cv.name ? { name: String(f.cv.name).slice(0, 120), size: Number(f.cv.size) || 0 } : null;
    if (!cv) return fail('Attach your CV (PDF, Word or a photo).', 'cv');
    if (cv.size > FILE_MAX) return fail('Your CV is larger than 5 MB.', 'cv');
    const answers = {};
    for (const q of j.questions) {
      let v = (f.answers || {})[q.id];
      if (q.type === 'file') v = v && v.name ? { name: String(v.name).slice(0, 120), size: Number(v.size) || 0 } : null;
      else v = clean(v);
      if (q.req && (!v || (q.type === 'file' && !v.name))) return fail(`Answer “${q.label}”.`, q.id);
      if (q.type === 'number' && v && !/^\d+(\.\d+)?$/.test(v)) return fail(`“${q.label}” takes a number.`, q.id);
      if (q.type === 'file' && v && v.size > FILE_MAX) return fail(`The file for “${q.label}” is larger than 5 MB.`, q.id);
      if (v) answers[q.id] = v;
    }
    const norm = (p) => p.replace(/^\+?88/, '');
    const dup = db.apps.find((a) => a.jobId === jobId && norm(a.phone.replace(/[\s-]/g, '')) === norm(phone));
    if (dup) return { ok: false, error: 'You have already applied for this job with this mobile number.', field: 'phone', code: dup.code };
    const ko = j.questions.find((q) => q.knockout && String(answers[q.id] || '').toLowerCase() === q.knockout.toLowerCase());
    const src = SOURCES.some((x) => x[0] === f.source) ? f.source : 'careers page';
    const id = 'APP-' + db.seq.app++;
    const a = { id, jobId, owner: j.owner, name, phone: phone.replace(/^(?:\+?88)?(01\d{3})(\d{6})$/, '$1-$2'), email, city: clean(f.city), answers, cv, photo: f.photo || '', source: src,
      stage: 'new', reason: '', knockout: '', rating: 0, tags: [], notes: [], interviews: [], messages: [], code: newCode(db), appliedAt: t, hiredAt: null, staffCode: '',
      history: [{ at: t, by: name, text: 'Applied from ' + sourceLabel(src).toLowerCase(), stage: 'new' }] };
    if (ko) {
      a.stage = 'rejected'; a.knockout = ko.id;
      a.reason = `Answered “${answers[ko.id]}” to “${ko.label}”`;
      a.history.push({ at: t, by: 'Grid Career', text: 'Rejected by a knockout answer', stage: 'rejected' });
    }
    const e = employerOf(j.owner, db);
    logMessage(db, a, 'sms', fill(templatesOf(j.owner, db).received.en, a, j, e), 'Grid Career', t);
    if (email) logMessage(db, a, 'email', fill(templatesOf(j.owner, db).received.en, a, j, e), 'Grid Career', t);
    db.apps.push(a);
    return { ok: true, app: a, knockedOut: !!ko };
  });
}
const findApp = (db, id) => db.apps.find((a) => a.id === id);
/** Move an application to a stage. opts { by, reason (rejected), notify (send the stage's template by SMS), lang } */
export function moveStage(appId, stage, opts = {}) {
  return commit((db, t) => {
    const a = findApp(db, appId);
    if (!a) return fail('Applicant not found');
    if (!STAGES.some(([k]) => k === stage)) return fail('Unknown stage');
    if (a.stage === stage) return { ok: true, app: a };
    if (stage === 'rejected') { a.reason = clean(opts.reason) || 'Not the right fit for this job'; }
    else { a.reason = ''; a.knockout = ''; }
    if (stage === 'hired') a.hiredAt = t;
    a.stage = stage;
    a.history.push({ at: t, by: opts.by || 'Staff', text: stage === 'rejected' ? 'Rejected: ' + a.reason : 'Moved to ' + stageLabel(stage), stage });
    const tpl = templatesOf(a.owner, db)[stage];
    if (opts.notify && tpl && stage !== 'interview') {
      const j = db.jobs.find((x) => x.id === a.jobId);
      logMessage(db, a, 'sms', fill(tpl[opts.lang || 'en'] || tpl.en, a, j, employerOf(a.owner, db)), opts.by, t);
    }
    return { ok: true, app: a };
  });
}
export function rate(appId, n, by) {
  return commit((db, t) => {
    const a = findApp(db, appId);
    if (!a) return fail('Applicant not found');
    a.rating = Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
    a.history.push({ at: t, by: by || 'Staff', text: a.rating ? `Rated ${a.rating} of 5` : 'Rating cleared' });
    return { ok: true };
  });
}
export function addNote(appId, text, by) {
  const x = clean(text);
  if (!x) return fail('Write the note first.', 'note');
  return commit((db, t) => { const a = findApp(db, appId); if (!a) return fail('Applicant not found'); a.notes.push({ by: by || 'Staff', text: x, at: t }); return { ok: true }; });
}
export function setTags(appId, tags) {
  return commit((db) => { const a = findApp(db, appId); if (!a) return fail('Applicant not found'); a.tags = [...new Set(lines(Array.isArray(tags) ? tags : String(tags).split(',')))].slice(0, 8); return { ok: true }; });
}
/** Book an interview: { at (ms), mode, with, link (video), place (in person) }. Moves the application to Interview and,
 *  with notify, sends the invite by SMS (and email when there is one). */
export function scheduleInterview(appId, iv, opts = {}) {
  return commit((db, t) => {
    const a = findApp(db, appId);
    if (!a) return fail('Applicant not found');
    const at = Number(iv.at) || 0;
    if (!at) return fail('Pick the day and time.', 'at');
    if (at < t - H) return fail('That time has passed.', 'at');
    const mode = MODES.some((x) => x[0] === iv.mode) ? iv.mode : 'at the shop';
    if (mode === 'video' && iv.link && !/^https?:\/\//.test(clean(iv.link))) return fail('The video link starts with https://', 'link');
    a.interviews.push({ at, mode, with: clean(iv.with), link: clean(iv.link), place: clean(iv.place), outcome: '' });
    if (!['interview', 'offer', 'hired'].includes(a.stage)) { a.stage = 'interview'; a.reason = ''; }
    a.history.push({ at: t, by: opts.by || 'Staff', text: 'Interview booked for ' + new Date(at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }), stage: 'interview' });
    if (opts.notify !== false) {
      const j = db.jobs.find((x) => x.id === a.jobId);
      const tpl = templatesOf(a.owner, db).interview;
      const text = fill(tpl[opts.lang || 'en'] || tpl.en, a, j, employerOf(a.owner, db));
      logMessage(db, a, 'sms', text, opts.by, t);
      if (a.email) logMessage(db, a, 'email', text, opts.by, t);
    }
    return { ok: true, app: a };
  });
}
export function setOutcome(appId, index, outcome, by) {
  return commit((db, t) => {
    const a = findApp(db, appId);
    if (!a || !a.interviews[index]) return fail('Interview not found');
    a.interviews[index].outcome = clean(outcome);
    a.history.push({ at: t, by: by || 'Staff', text: 'Interview result: ' + (clean(outcome) || 'cleared') });
    return { ok: true };
  });
}
/** Send a message to the candidate (simulated: logged on the application). */
export function sendMessage(appId, { kind = 'sms', text }, by) {
  const x = clean(text);
  if (!x) return fail('Write the message first.', 'text');
  return commit((db, t) => {
    const a = findApp(db, appId);
    if (!a) return fail('Applicant not found');
    if (kind === 'email' && !a.email) return fail('This applicant gave no email: send an SMS.', 'kind');
    logMessage(db, a, kind === 'email' ? 'email' : 'sms', x, by, t);
    return { ok: true };
  });
}
/**
 * Hire: the application moves to Hired and the result carries what the merchant's Add staff (/staff-create) needs:
 * prefill { name, phone, email, position, branch, from } and href (the address with those filled in).
 */
export function hire(appId, by) {
  const r = moveStage(appId, 'hired', { by });
  if (!r.ok) return r;
  const db = read();
  const a = findApp(db, appId);
  const j = db.jobs.find((x) => x.id === a.jobId) || {};
  const prefill = { name: a.name, phone: a.phone, email: a.email, position: j.position || j.title || '', branch: /branch/i.test(j.place || '') ? j.place : '', from: a.id };
  const q = new URLSearchParams(Object.entries(prefill).filter(([, v]) => v));
  return { ok: true, app: a, prefill, href: '/staff-create?' + q.toString() };
}
/** Mark the staff record that was made from this application (Add staff calls it after creating the person). */
export function linkStaff(appId, staffCode) {
  return commit((db, t) => { const a = findApp(db, appId); if (!a) return fail('Applicant not found'); a.staffCode = staffCode; a.history.push({ at: t, by: 'Staff & HR', text: 'Added to staff as ' + staffCode }); return { ok: true }; });
}
/** What the candidate's status page may show (no notes, ratings or internal reasons). */
export function applicationByCode(code) {
  const c = clean(code).toUpperCase();
  if (!c) return null;
  const db = read();
  const a = db.apps.find((x) => x.code === c);
  if (!a) return null;
  const j = db.jobs.find((x) => x.id === a.jobId) || {};
  const e = employerOf(a.owner, db);
  const t = now();
  const next = (a.interviews || []).filter((iv) => iv.at >= t - 2 * H).sort((x, y) => x.at - y.at)[0] || null;
  return { code: a.code, name: a.name, stage: a.stage, appliedAt: a.appliedAt, job: { id: j.id, title: j.title, place: j.place, owner: a.owner }, employer: { name: e.name, logo: e.logo },
    interview: a.stage === 'interview' && next ? { at: next.at, mode: next.mode, link: next.mode === 'video' ? next.link : '', place: next.mode === 'at the shop' ? next.place : '' } : null };
}

// ---- reports -------------------------------------------------------------------------------------------------------------------
/** Applicants per job, per source and per stage, hired count and the average days from applying to hired. */
export function report(owner, from = 0) {
  const db = read();
  const apps = db.apps.filter((a) => (!owner || a.owner === owner) && a.appliedAt >= from);
  const perStage = Object.fromEntries(STAGES.map(([k]) => [k, 0]));
  const perSource = Object.fromEntries(SOURCES.map(([k]) => [k, 0]));
  apps.forEach((a) => { perStage[a.stage] += 1; perSource[a.source] = (perSource[a.source] || 0) + 1; });
  const perJob = db.jobs.filter((j) => !owner || j.owner === owner).map((j) => {
    const mine = apps.filter((a) => a.jobId === j.id);
    return { job: j, total: mine.length, byStage: Object.fromEntries(STAGES.map(([k]) => [k, mine.filter((a) => a.stage === k).length])) };
  });
  const hired = apps.filter((a) => a.hiredAt);
  const timeToHire = hired.length ? Math.round(hired.reduce((s, a) => s + (a.hiredAt - a.appliedAt), 0) / hired.length / DAY) : null;
  return { total: apps.length, perStage, perSource, perJob, hired: hired.length, timeToHire, knockedOut: apps.filter((a) => a.knockout).length };
}
/** Applications as CSV rows (the table view's export: what the Google Sheet used to hold). */
export function toCsv(apps) {
  const db = read();
  const head = ['Application', 'Job', 'Name', 'Mobile', 'Email', 'City', 'Source', 'Stage', 'Rating', 'Applied', 'CV'];
  const esc = (v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const rows = apps.map((a) => {
    const j = db.jobs.find((x) => x.id === a.jobId) || {};
    const qs = (j.questions || []).map((q) => { const v = a.answers[q.id]; return q.label + ': ' + (v && v.name ? v.name : v || ''); }).join(' | ');
    return [a.id, j.title, a.name, a.phone, a.email, a.city, sourceLabel(a.source), stageLabel(a.stage), a.rating || '', new Date(a.appliedAt).toISOString().slice(0, 10), a.cv ? a.cv.name : '', qs];
  });
  return [[...head, 'Answers'], ...rows].map((r) => r.map(esc).join(',')).join('\n');
}
