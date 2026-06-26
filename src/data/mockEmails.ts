import type { Email } from '../types';

const senders = [
  { name: 'GitHub', email: 'noreply@github.com' },
  { name: 'Sarah Chen', email: 'sarah.chen@company.io' },
  { name: 'AWS Notifications', email: 'no-reply@aws.amazon.com' },
  { name: 'Slack', email: 'notification@slack.com' },
  { name: 'LinkedIn', email: 'messages@linkedin.com' },
  { name: 'Alex Rivera', email: 'alex.r@startup.dev' },
  { name: 'Google Cloud', email: 'cloud-noreply@google.com' },
  { name: 'Figma', email: 'notify@figma.com' },
  { name: 'Medium Daily Digest', email: 'noreply@medium.com' },
  { name: 'Stripe', email: 'receipts@stripe.com' },
  { name: 'Vercel', email: 'notifications@vercel.com' },
  { name: 'David Kim', email: 'david.kim@acme.co' },
  { name: 'Notion', email: 'notify@makenotion.com' },
  { name: 'Digital Ocean', email: 'noreply@digitalocean.com' },
  { name: 'Emma Watson', email: 'emma.w@design.studio' },
  { name: 'NPM', email: 'support@npmjs.com' },
  { name: 'Hacker News', email: 'hn@ycombinator.com' },
  { name: 'Jira', email: 'jira@atlassian.com' },
  { name: 'Docker Hub', email: 'noreply@docker.com' },
  { name: 'Product Hunt', email: 'hello@producthunt.com' },
  { name: 'Marcus Johnson', email: 'marcus.j@bigcorp.com' },
  { name: 'Spotify', email: 'no-reply@spotify.com' },
  { name: 'Cloudflare', email: 'noreply@cloudflare.com' },
  { name: 'OpenAI', email: 'noreply@openai.com' },
  { name: 'Lisa Park', email: 'lisa.park@freelance.io' },
];

const subjects = [
  '[PR #1847] Fix: Resolve memory leak in WebSocket handler',
  'Re: Q3 Sprint Planning — Updated roadmap attached',
  'AWS Cost Alert: Your estimated charges exceed $150',
  'New message in #engineering from Alex Rivera',
  'Sarah Chen has endorsed you for TypeScript',
  'Deployment failed: ghostmail-prod (Build #342)',
  'Your invoice from Stripe — $49.00',
  'Welcome to the new Figma Dev Mode ✨',
  'Top stories: The Future of Web Assembly',
  'Re: Design Review — Homepage Redesign v3',
  '🚀 Your project "ghostmail" has been deployed',
  'Security alert: New sign-in from Chrome on Windows',
  'Weekly digest: 12 updates in your workspace',
  'Droplet CPU usage exceeded 90% threshold',
  'Team standup notes — June 15, 2025',
  'npm audit found 3 vulnerabilities in your project',
  'Show HN: GhostMail — Open source email client',
  'JIRA-4521: Backend API rate limiting [In Review]',
  'Docker image ghostmail:latest pushed successfully',
  'Product of the Day: GhostMail 🏆',
  'Re: Can we sync on the API migration?',
  'Your monthly GitHub contribution summary',
  'Action required: Renew SSL certificate',
  'New comment on your pull request #892',
  'Invitation: Design System Workshop — Thursday 2pm',
  'Build succeeded: ghostmail-staging #127',
  'Payment received: $2,400.00 from Acme Corp',
  'Your cloud functions exceeded free tier usage',
  'Re: Feedback on the Tokyo Night theme implementation',
  'Database backup completed successfully',
  '🎵 Your 2025 Wrapped is here!',
  'Cloudflare: DDoS attack mitigated on your domain',
  'GPT-5 Early Access — You\'re invited',
  'Freelance proposal: Website redesign for $8,500',
  'Your API key expires in 7 days',
];

const snippets = [
  'Hey team, I\'ve pushed a fix for the WebSocket memory leak that was causing issues in production. The root cause was an unclosed...',
  'Following up on our discussion yesterday, I\'ve updated the sprint roadmap to reflect the new priorities. Please review and...',
  'Your AWS account charges have exceeded the configured threshold. Current estimated charges are $152.47 for the billing period...',
  'Alex Rivera posted in #engineering: "Has anyone looked into the new React Server Components? I think we could leverage..."',
  'Congratulations! Sarah Chen has endorsed you for TypeScript on LinkedIn. View your updated profile and connect with...',
  'The deployment to ghostmail-prod failed at the build step. Error: Module not found: Can\'t resolve \'./config\'. Check your...',
  'Thanks for your payment of $49.00 to GhostMail Pro. Your receipt is attached. If you have any questions about your...',
  'We\'re excited to introduce Dev Mode in Figma! Now you can inspect designs, copy code, and collaborate seamlessly...',
  'This week\'s top stories include insights on WebAssembly performance, the state of TypeScript in 2025, and how leading...',
  'Hi everyone, I\'ve uploaded the latest iteration of the homepage redesign. Key changes include a simplified hero section...',
  'Your project has been successfully deployed to production. URL: https://ghostmail.dev — Build time: 23s. All health...',
  'We noticed a new sign-in to your Google Account from Chrome on Windows. If this was you, no action needed. Otherwise...',
  'Here\'s what happened in your Notion workspace this week: 12 pages updated, 3 new databases created, 7 comments added...',
  'Your Droplet \'api-server-01\' has exceeded the 90% CPU threshold for 15+ minutes. Current usage: 94%. Consider upgrading...',
  'Standup highlights: ✅ Auth service deployed ✅ API docs updated 🔄 Frontend tests in progress ❌ Redis migration blocked...',
  'We detected and mitigated a Layer 7 DDoS attack on your domain. 2.3M malicious requests were blocked. No downtime...',
  'You\'ve been selected for early access to our latest model. Click below to explore the new capabilities and provide...',
];

const bodies = [
  `Hey team,\n\nI've pushed a fix for the WebSocket memory leak that was causing issues in production. The root cause was an unclosed connection handler in the event listener.\n\nChanges:\n- Fixed event listener cleanup in ws-handler.ts\n- Added connection pool monitoring\n- Updated unit tests\n- Added memory profiling benchmarks\n\nPlease review when you get a chance. I've also added a regression test to prevent this from happening again.\n\nBest,\nAlex`,
  `Hi all,\n\nFollowing up on our discussion yesterday, I've updated the sprint roadmap to reflect the new priorities:\n\n1. Complete the authentication flow refactor\n2. Implement bulk email operations\n3. Tokyo Night theme polish\n4. Performance optimization pass\n5. Mobile responsive overhaul\n\nI've attached the updated Gantt chart. Let me know if you have any concerns about the timeline — we have some buffer built in for Q3.\n\nCheers,\nSarah`,
  `Your AWS account (ID: ****7842) has estimated charges that exceed the configured threshold.\n\nService breakdown:\n- EC2: $67.23\n- RDS: $42.10\n- S3: $23.14\n- Lambda: $12.00\n- CloudFront: $5.50\n- Other: $2.50\n\nTotal estimated charges: $152.47\n\nTo manage your budget alerts, visit the AWS Billing Console. Consider setting up Cost Anomaly Detection for proactive monitoring.`,
  `Hey Ghost User,\n\nJust wanted to touch base about the API migration timeline. I think we should aim to have the v2 endpoints ready by end of month.\n\nHere's what I'm thinking:\n\nWeek 1: Schema design & data modeling\nWeek 2: Core CRUD endpoints\nWeek 3: Auth middleware & rate limiting\nWeek 4: Testing, docs & migration guide\n\nThe main challenge will be maintaining backward compatibility. I've drafted an RFC — would love your thoughts.\n\nThanks,\nDavid`,
  `Hi there!\n\nI've completed the initial designs for the website redesign project. Here's a summary of the deliverables:\n\n• Homepage — New hero section with animated gradients\n• About page — Team grid with hover effects\n• Pricing — Comparison table with toggle for monthly/annual\n• Dashboard — Complete overhaul with new data visualizations\n\nAll files are in the shared Figma workspace. I've also prepared a style guide document with the updated Tokyo Night color palette.\n\nLooking forward to your feedback!\n\nBest,\nEmma`,
];

function randomDate(daysBack: number = 45): Date {
  const now = new Date();
  return new Date(now.getTime() - Math.random() * daysBack * 86400000);
}

function randomId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const attachmentNames = [
  'report-q3-2025.pdf', 'screenshot-2025-06.png', 'analytics-export.csv',
  'design-v3.fig', 'meeting-notes.md', 'architecture-diagram.svg',
  'budget-forecast.xlsx', 'logo-final.png', 'presentation-deck.pptx',
  'contract-draft.pdf', 'wireframes.sketch', 'api-spec.yaml',
];

export function generateMockEmails(count: number): Email[] {
  const emails: Email[] = [];

  for (let i = 0; i < count; i++) {
    const sender = senders[Math.floor(Math.random() * senders.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const snippet = snippets[Math.floor(Math.random() * snippets.length)];
    const body = bodies[Math.floor(Math.random() * bodies.length)];
    const isRead = Math.random() > 0.4;
    const isStarred = Math.random() > 0.82;
    const hasAttachments = Math.random() > 0.72;
    const numAttachments = hasAttachments ? Math.ceil(Math.random() * 3) : 0;

    emails.push({
      id: randomId(),
      threadId: randomId(),
      subject,
      from: sender,
      to: [{ name: 'Ghost User', email: 'ghost@ghostmail.dev' }],
      snippet,
      body,
      bodyHtml: `<div style="font-family:sans-serif;line-height:1.7;color:#c0caf5">${body.replace(/\n/g, '<br>')}</div>`,
      date: randomDate(),
      isRead,
      isStarred,
      isImportant: Math.random() > 0.7,
      labels: ['INBOX'],
      hasAttachments,
      attachments: Array.from({ length: numAttachments }, () => ({
        id: randomId(),
        filename: attachmentNames[Math.floor(Math.random() * attachmentNames.length)],
        mimeType: 'application/octet-stream',
        size: Math.floor(Math.random() * 8000000) + 10000,
      })),
      selected: false,
      sizeEstimate: Math.floor(Math.random() * 150000) + 500,
    });
  }

  emails.sort((a, b) => b.date.getTime() - a.date.getTime());
  return emails;
}
