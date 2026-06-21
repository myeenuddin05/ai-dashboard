// Demo data — used when Prisma/SQLite is unavailable (Vercel serverless)
// Mirrors the seed.ts data so the dashboard works without a database.

export const demoClients = [
  { id: 'c1', name: 'Alice Johnson', email: 'alice@acmecorp.com', company: 'Acme Corp', phone: '+1-555-0101', status: 'active', value: 67500, notes: 'Enterprise client — Q3 upsell target', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-06-20T10:00:00Z' },
  { id: 'c2', name: 'Bob Martinez', email: 'bob@meridianhealth.com', company: 'Meridian Health', phone: '+1-555-0102', status: 'active', value: 45000, notes: 'Healthcare vertical', createdAt: '2026-02-20T08:00:00Z', updatedAt: '2026-06-18T10:00:00Z' },
  { id: 'c3', name: 'Carol Wu', email: 'carol@techstart.io', company: 'TechStart', phone: '+1-555-0103', status: 'active', value: 38000, notes: 'Startup — high growth potential', createdAt: '2026-03-10T08:00:00Z', updatedAt: '2026-06-15T10:00:00Z' },
  { id: 'c4', name: 'David Chen', email: 'david@tokyotech.jp', company: 'TokyoTech', phone: '+81-3-5555-0104', status: 'active', value: 52000, notes: 'APAC expansion partner', createdAt: '2026-03-15T08:00:00Z', updatedAt: '2026-06-10T10:00:00Z' },
  { id: 'c5', name: 'Emma Davis', email: 'emma@desertpalm.com', company: 'Desert Palm', phone: '+1-555-0105', status: 'active', value: 28000, notes: 'Hospitality sector', createdAt: '2026-04-01T08:00:00Z', updatedAt: '2026-06-05T10:00:00Z' },
  { id: 'c6', name: 'Frank Lee', email: 'frank@quantumlabs.com', company: 'Quantum Labs', phone: '+1-555-0106', status: 'inactive', value: 12000, notes: 'On hold — budget review', createdAt: '2026-04-15T08:00:00Z', updatedAt: '2026-05-20T10:00:00Z' },
  { id: 'c7', name: 'Grace Kim', email: 'grace@santosdesign.com', company: 'Santos Design', phone: '+1-555-0107', status: 'active', value: 34000, notes: 'Design agency — recurring', createdAt: '2026-04-20T08:00:00Z', updatedAt: '2026-06-01T10:00:00Z' },
  { id: 'c8', name: 'Henry Patel', email: 'henry@nebulatech.com', company: 'Nebula Tech', phone: '+1-555-0108', status: 'lead', value: 0, notes: 'Initial outreach — interested in AI', createdAt: '2026-05-01T08:00:00Z', updatedAt: '2026-06-01T10:00:00Z' },
];

export const demoLeads = [
  { id: 'l1', name: 'Isabella Costa', email: 'isabella@luminaai.com', company: 'Lumina AI', phone: '+1-555-0201', source: 'linkedin', status: 'new', score: 88, value: 55000, notes: 'Warm inbound — requested demo', createdAt: '2026-06-15T08:00:00Z' },
  { id: 'l2', name: 'James Wilson', email: 'james@greenfield.co', company: 'Greenfield', phone: '+1-555-0202', source: 'website', status: 'new', score: 62, value: 18000, notes: 'Contact form submission', createdAt: '2026-06-14T08:00:00Z' },
  { id: 'l3', name: 'Sophia Lee', email: 'sophia@atlastrading.com', company: 'Atlas Trading', phone: '+1-555-0203', source: 'referral', status: 'new', score: 72, value: 35000, notes: 'Referred by Acme Corp', createdAt: '2026-06-12T08:00:00Z' },
  { id: 'l4', name: 'Felix Bauer', email: 'felix@alpinesecurity.ch', company: 'Alpine Security', phone: '+41-44-555-0204', source: 'conference', status: 'qualified', score: 82, value: 42000, notes: 'Met at CyberSec Summit', createdAt: '2026-06-01T08:00:00Z' },
  { id: 'l5', name: 'Ahmed Hassan', email: 'ahmed@nextgen.io', company: 'NextGen', phone: '+1-555-0205', source: 'email', status: 'contacted', score: 68, value: 28000, notes: 'Sent proposal — awaiting response', createdAt: '2026-05-28T08:00:00Z' },
  { id: 'l6', name: 'Leo Chang', email: 'leo@bytebridge.com', company: 'ByteBridge', phone: '+1-555-0206', source: 'linkedin', status: 'qualified', score: 85, value: 38000, notes: 'Schedule follow-up demo', createdAt: '2026-05-20T08:00:00Z' },
  { id: 'l7', name: 'Oliver Brown', email: 'oliver@cloudsprint.com', company: 'CloudSprint', phone: '+1-555-0207', source: 'website', status: 'contacted', score: 58, value: 22000, notes: 'Price-sensitive — needs nurturing', createdAt: '2026-05-15T08:00:00Z' },
  { id: 'l8', name: 'Mia Zhao', email: 'mia@datadrive.com', company: 'DataDrive', phone: '+1-555-0208', source: 'referral', status: 'converted', score: 91, value: 45000, notes: 'Signed! Onboarding next week', createdAt: '2026-05-10T08:00:00Z' },
];

export const demoTasks = [
  { id: 't1', title: 'Prepare Q3 strategy deck', description: 'Create slides for quarterly review meeting', status: 'in_progress', priority: 'high', category: 'sales', dueDate: '2026-06-25T00:00:00Z', createdAt: '2026-06-10T08:00:00Z' },
  { id: 't2', title: 'Draft newsletter for July', description: 'Monthly client newsletter — AI trends edition', status: 'todo', priority: 'medium', category: 'content', dueDate: '2026-06-28T00:00:00Z', createdAt: '2026-06-12T08:00:00Z' },
  { id: 't3', title: 'Follow up with Quantum Labs', description: 'Re-engagement call to revive the account', status: 'todo', priority: 'high', category: 'sales', dueDate: '2026-06-22T00:00:00Z', createdAt: '2026-06-08T08:00:00Z' },
  { id: 't4', title: 'Update CRM with new leads', description: 'Import leads from CyberSec Summit', status: 'done', priority: 'medium', category: 'general', dueDate: '2026-06-15T00:00:00Z', createdAt: '2026-06-05T08:00:00Z' },
  { id: 't5', title: 'Schedule AI Automation Webinar', description: 'Set up webinar platform and send invites', status: 'done', priority: 'high', category: 'event', dueDate: '2026-06-18T00:00:00Z', createdAt: '2026-06-01T08:00:00Z' },
  { id: 't6', title: 'Write case study: Meridian Health', description: 'Document the $67.5K deal journey', status: 'review', priority: 'medium', category: 'content', dueDate: '2026-06-30T00:00:00Z', createdAt: '2026-06-14T08:00:00Z' },
  { id: 't7', title: 'Competitor analysis report', description: 'Research top 5 competitors in AI automation space', status: 'in_progress', priority: 'low', category: 'general', dueDate: '2026-07-05T00:00:00Z', createdAt: '2026-06-16T08:00:00Z' },
  { id: 't8', title: 'LinkedIn content calendar', description: 'Plan posts for next 2 weeks', status: 'todo', priority: 'low', category: 'content', dueDate: '2026-06-24T00:00:00Z', createdAt: '2026-06-17T08:00:00Z' },
];

export const demoReminders = [
  { id: 'r1', title: 'Call Alice Johnson — Q3 upsell', description: 'Discuss enterprise expansion', dueDate: '2026-06-22T10:00:00Z', isRead: false, createdAt: '2026-06-15T08:00:00Z' },
  { id: 'r2', title: 'Send proposal to Bob Martinez', description: 'Meridian Health renewal', dueDate: '2026-06-20T14:00:00Z', isRead: false, createdAt: '2026-06-14T08:00:00Z' },
  { id: 'r3', title: 'Review content calendar', description: 'Weekly content planning', dueDate: '2026-06-19T09:00:00Z', isRead: true, createdAt: '2026-06-16T08:00:00Z' },
  { id: 'r4', title: 'Submit expense report', description: 'May travel expenses', dueDate: '2026-06-15T17:00:00Z', isRead: true, createdAt: '2026-06-10T08:00:00Z' },
  { id: 'r5', title: 'Team standup prep', description: 'Prepare weekly standup notes', dueDate: '2026-06-23T08:30:00Z', isRead: false, createdAt: '2026-06-18T08:00:00Z' },
];

export const demoContent = [
  { id: 'ct1', title: 'AI Trends June 2026', type: 'newsletter', platform: 'email', status: 'published', body: 'Latest AI business trends...', scheduledAt: '2026-06-15T08:00:00Z', createdAt: '2026-06-10T08:00:00Z' },
  { id: 'ct2', title: 'How We Automated 70% of Outreach', type: 'social_media', platform: 'linkedin', status: 'published', body: 'Behind-the-scenes look...', scheduledAt: '2026-06-12T10:00:00Z', createdAt: '2026-06-08T08:00:00Z' },
  { id: 'ct3', title: '5 AI Tools for 2026', type: 'blog', platform: 'website', status: 'draft', body: 'Practical recommendations...', scheduledAt: null, createdAt: '2026-06-14T08:00:00Z' },
  { id: 'ct4', title: 'Q3 Webinar Promo', type: 'ad_copy', platform: 'linkedin', status: 'scheduled', body: 'Join our AI automation webinar...', scheduledAt: '2026-06-25T10:00:00Z', createdAt: '2026-06-16T08:00:00Z' },
  { id: 'ct5', title: 'CyberSec Summit Recap', type: 'social_media', platform: 'twitter', status: 'published', body: 'Key takeaways from CyberSec...', scheduledAt: '2026-06-05T12:00:00Z', createdAt: '2026-06-03T08:00:00Z' },
  { id: 'ct6', title: 'Meridian Health Case Study', type: 'blog', platform: 'website', status: 'review', body: 'How Meridian Health transformed...', scheduledAt: null, createdAt: '2026-06-18T08:00:00Z' },
];

export const demoEvents = [
  { id: 'e1', title: 'AI Automation Webinar', description: 'Live demo of AI agent workflows', date: '2026-06-28T14:00:00Z', location: 'Zoom', type: 'webinar', status: 'upcoming', contentCopy: 'Join us for an exclusive webinar on AI automation...', createdAt: '2026-06-01T08:00:00Z' },
  { id: 'e2', title: 'TokyoTech Demo Day', description: 'Product demo for TokyoTech team', date: '2026-06-25T10:00:00Z', location: 'Tokyo Office', type: 'meeting', status: 'upcoming', contentCopy: 'Looking forward to showcasing our AI dashboard...', createdAt: '2026-06-05T08:00:00Z' },
  { id: 'e3', title: 'CyberSec Summit 2026', description: 'Annual cybersecurity conference', date: '2026-06-10T09:00:00Z', location: 'San Francisco', type: 'conference', status: 'completed', contentCopy: 'Excited to present at CyberSec Summit...', createdAt: '2026-05-20T08:00:00Z' },
  { id: 'e4', title: 'Q3 Marketing Campaign Launch', description: 'Kickoff for Q3 multi-channel campaign', date: '2026-07-01T10:00:00Z', location: 'HQ Conference Room', type: 'campaign', status: 'upcoming', contentCopy: 'Q3 is here! New campaigns launching...', createdAt: '2026-06-15T08:00:00Z' },
  { id: 'e5', title: 'Client Onboarding: DataDrive', description: 'Onboard new client DataDrive', date: '2026-06-26T11:00:00Z', location: 'Virtual', type: 'meeting', status: 'upcoming', contentCopy: 'Welcome DataDrive to the family...', createdAt: '2026-06-12T08:00:00Z' },
];

export const demoActivities = [
  { id: 'a1', type: 'deal', title: 'Meridian Health deal closed', description: '$67,500 contract signed', createdAt: '2026-06-18T14:30:00Z' },
  { id: 'a2', type: 'client', title: 'New client: Desert Palm', description: 'Onboarding completed', createdAt: '2026-06-17T10:00:00Z' },
  { id: 'a3', type: 'content', title: 'LinkedIn post published', description: '"How We Automated 70%" — 2.3K impressions', createdAt: '2026-06-16T08:00:00Z' },
  { id: 'a4', type: 'task', title: '15 tasks completed this week', description: '65% completion rate', createdAt: '2026-06-15T17:00:00Z' },
  { id: 'a5', type: 'lead', title: 'New lead: Isabella Costa', description: 'Lumina AI — $55K potential', createdAt: '2026-06-15T09:00:00Z' },
  { id: 'a6', type: 'event', title: 'CyberSec Summit attended', description: '8 new leads generated', createdAt: '2026-06-10T16:00:00Z' },
  { id: 'a7', type: 'client', title: 'Acme Corp renewal', description: 'Annual contract renewed at $32K', createdAt: '2026-06-08T11:00:00Z' },
  { id: 'a8', type: 'content', title: 'Newsletter sent', description: 'AI Trends June — 45% open rate', createdAt: '2026-06-05T09:00:00Z' },
];

export const demoReports = {
  weekly: {
    revenue: 32450,
    newClients: 3,
    newLeads: 8,
    tasksCompleted: 15,
    totalTasks: 23,
    contentPublished: 4,
    revenueData: [
      { name: 'Mon', revenue: 5200 },
      { name: 'Tue', revenue: 7800 },
      { name: 'Wed', revenue: 6100 },
      { name: 'Thu', revenue: 9100 },
      { name: 'Fri', revenue: 4250 },
    ],
    leadSources: [
      { name: 'LinkedIn', value: 35 },
      { name: 'Referral', value: 25 },
      { name: 'Website', value: 20 },
      { name: 'Conference', value: 15 },
      { name: 'Email', value: 5 },
    ],
    contentPerformance: [
      { name: 'LinkedIn', views: 2300, engagement: 340 },
      { name: 'Twitter', views: 1200, engagement: 180 },
      { name: 'Email', views: 4500, engagement: 890 },
      { name: 'Blog', views: 1800, engagement: 120 },
    ],
  },
  monthly: {
    revenue: 142500,
    newClients: 8,
    newLeads: 24,
    tasksCompleted: 52,
    totalTasks: 78,
    contentPublished: 16,
    revenueData: [
      { name: 'Jan', revenue: 98000 },
      { name: 'Feb', revenue: 112000 },
      { name: 'Mar', revenue: 125000 },
      { name: 'Apr', revenue: 138000 },
      { name: 'May', revenue: 142500 },
      { name: 'Jun', revenue: 156000 },
    ],
    leadSources: [
      { name: 'LinkedIn', value: 30 },
      { name: 'Referral', value: 28 },
      { name: 'Website', value: 22 },
      { name: 'Conference', value: 12 },
      { name: 'Email', value: 8 },
    ],
    contentPerformance: [
      { name: 'LinkedIn', views: 8900, engagement: 1200 },
      { name: 'Twitter', views: 4500, engagement: 620 },
      { name: 'Email', views: 18000, engagement: 3400 },
      { name: 'Blog', views: 7200, engagement: 480 },
    ],
  },
};
