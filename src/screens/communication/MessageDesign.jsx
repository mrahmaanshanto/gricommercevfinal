'use client';
// MessageDesign — Communications › Message design (/message-design?tab=email|sms; Batch C step 4). How the shop's
// messages look, in its own place instead of under Settings › Notifications: Email design (the shared look, the
// language, every designed email and its editor, test emails: components/email/EmailDesignPanel.jsx) and SMS design
// (sender name, every SMS with a phone preview and ready wordings: components/sms/SmsDesignPanel.jsx). Which message
// goes out for which event, and to whom, stays in Settings › Notifications. /email-design forwards here.

import React, { useEffect, useState } from 'react';
import { IndexTabs } from '@/components/ui/IndexKit';
import { TeamPage } from '@/screens/team/teamShared';
import { EmailDesignPanel, EMAIL_DESIGN_CSS } from '@/components/email/EmailDesignPanel';
import { SmsDesignPanel, SMS_DESIGN_CSS } from '@/components/sms/SmsDesignPanel';

const TABS = [['email', 'Email design'], ['sms', 'SMS design']];

export default function MessageDesign() {
  const [tab, setTab] = useState('email');
  useEffect(() => { const t = new URLSearchParams(window.location.search).get('tab'); if (TABS.some(([k]) => k === t)) setTab(t); }, []);
  const go = (k) => { setTab(k); const u = new URL(window.location.href); u.searchParams.set('tab', k); window.history.replaceState(null, '', u); };
  return (
    <TeamPage screen="MessageDesign" active="msg-design" crumb="Communications" page="Message design" title="Message design" icon="palette" css={EMAIL_DESIGN_CSS + SMS_DESIGN_CSS + '.md-tabs{margin-bottom:var(--space-4)}'}
      about="How your emails and SMS look. Email design: logo, colours, font, header and footer for every email, the language customers get, and each email in English and Bangla. SMS design: the sender name and every SMS with a phone preview. Which messages go out is set in Settings › Notifications."
      more={[{ label: 'Turn messages on or off', href: '/set-notifications' }]}>
      <div className="md-tabs"><IndexTabs tabs={TABS.map(([k, l]) => ({ key: k, id: 'md-tab-' + k, label: l, on: tab === k, onClick: () => go(k) }))} label="Message design" /></div>
      {tab === 'email' ? <EmailDesignPanel /> : <SmsDesignPanel />}
    </TeamPage>
  );
}
