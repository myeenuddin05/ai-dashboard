import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.activity.deleteMany();
  await prisma.report.deleteMany();
  await prisma.event.deleteMany();
  await prisma.content.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.task.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.clientHistory.deleteMany();
  await prisma.client.deleteMany();

  // Clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: 'Sarah Chen', email: 'sarah.chen@acme.com', phone: '+1-555-0101',
        company: 'Acme Corp', status: 'active', value: 45000,
        notes: 'Key enterprise account. Decision maker for marketing tech stack.',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Marcus Johnson', email: 'marcus@techstart.io', phone: '+1-555-0102',
        company: 'TechStart', status: 'active', value: 28500,
        notes: 'Growing startup. Interested in AI automation.',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Elena Rodriguez', email: 'elena@globex.com', phone: '+1-555-0103',
        company: 'Globex Industries', status: 'active', value: 120000,
        notes: 'Enterprise manufacturing. Long-term contract.',
      },
    }),
    prisma.client.create({
      data: {
        name: 'David Kim', email: 'david.kim@innodata.co', phone: '+1-555-0104',
        company: 'InnoData', status: 'active', value: 18500,
        notes: 'Data analytics firm. Monthly retainer.',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Aisha Patel', email: 'aisha@meridian.io', phone: '+1-555-0105',
        company: 'Meridian Health', status: 'active', value: 67500,
        notes: 'Healthcare vertical. Compliance sensitive.',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Tom OHara', email: 'tom@greenfield.ag', phone: '+1-555-0106',
        company: 'Greenfield Ag', status: 'active', value: 32000,
        notes: 'Agtech. Seasonal campaign cycles.',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Julia Fischer', email: 'julia@quantumlabs.de', phone: '+49-555-0107',
        company: 'Quantum Labs', status: 'inactive', value: 15000,
        notes: 'On hold pending Q3 budget review.',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Ravi Gupta', email: 'ravi@nexgen.io', phone: '+91-555-0108',
        company: 'NexGen Solutions', status: 'lead', value: 0,
        notes: 'Discovery call scheduled.',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Maria Santos', email: 'maria@santos.design', phone: '+1-555-0109',
        company: 'Santos Design Co', status: 'active', value: 22000,
        notes: 'Creative agency. Brand refresh project.',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Ken Watanabe', email: 'ken@tokyotech.jp', phone: '+81-555-0110',
        company: 'TokyoTech', status: 'active', value: 85000,
        notes: 'Expanding to US market. Strategic partner.',
      },
    }),
    // Extra clients
    prisma.client.create({
      data: {
        name: 'Liam OConnor', email: 'liam@celticventures.ie', phone: '+353-555-0111',
        company: 'Celtic Ventures', status: 'lead', value: 0,
        notes: 'Exploratory partnership discussions.',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Fatima Al-Rashid', email: 'fatima@desertpalm.ae', phone: '+971-555-0112',
        company: 'Desert Palm Holdings', status: 'active', value: 95000,
        notes: 'Real estate investment group. High net worth.',
      },
    }),
  ]);

  // Client histories
  for (const client of clients.slice(0, 8)) {
    await prisma.clientHistory.createMany({
      data: [
        {
          clientId: client.id,
          action: 'created',
          description: `Client ${client.name} onboarded`,
          createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        },
        {
          clientId: client.id,
          action: 'contacted',
          description: 'Initial discovery call completed',
          createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        },
        {
          clientId: client.id,
          action: client.status === 'active' ? 'deal_closed' : 'note_added',
          description: client.status === 'active' ? 'Contract signed, project underway' : 'Follow-up notes added',
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      ],
    });
  }

  // Leads
  const sources = ['website', 'referral', 'linkedin', 'conference', 'email'] as const;
  const statuses = ['new', 'contacted', 'qualified', 'converted', 'lost'] as const;
  const leadNames: [string, string, number][] = [
    ['James Wilson', 'FinEdge Capital', 18000],
    ['Priya Sharma', 'CloudSync Inc', 25000],
    ['Oliver Brown', 'DataForge', 12000],
    ['Yuki Tanaka', 'Sakura Media', 32000],
    ['Carlos Mendez', 'SolarFlare Energy', 45000],
    ['Nina Andersen', 'Nordic Design', 15000],
    ['Ahmed Hassan', 'Desert Tech', 28000],
    ['Sofia Martinez', 'EcoVerse', 22000],
    ['Leo Chang', 'ByteBridge', 38000],
    ['Isabella Costa', 'Lumina AI', 55000],
    ['Felix Bauer', 'Alpine Security', 42000],
    ['Aria Nguyễn', 'Delta Robotics', 19500],
  ];

  for (const [name, company, value] of leadNames) {
    await prisma.lead.create({
      data: {
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@${company.toLowerCase().replace(' ', '')}.com`,
        company,
        source: sources[Math.floor(Math.random() * sources.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        score: Math.floor(Math.random() * 51) + 50, // 50-100
        value: value as number,
        phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        notes: `${name} from ${company}. ${Math.random() > 0.5 ? 'Warm lead from referral.' : 'Cold outreach response.'}`,
      },
    });
  }

  // Tasks
  const taskData = [
    { title: 'Review Q3 marketing strategy', category: 'content', priority: 'high', status: 'in_progress' },
    { title: 'Prepare client onboarding deck for Acme', category: 'sales', priority: 'urgent', status: 'todo' },
    { title: 'Write newsletter for June', category: 'content', priority: 'medium', status: 'review' },
    { title: 'Schedule demo with Globex team', category: 'sales', priority: 'high', status: 'todo' },
    { title: 'Update LinkedIn company page', category: 'content', priority: 'low', status: 'done' },
    { title: 'Plan Q3 webinar series', category: 'event', priority: 'medium', status: 'in_progress' },
    { title: 'Audit CRM data quality', category: 'general', priority: 'medium', status: 'review' },
    { title: 'Draft proposal for TokyoTech', category: 'sales', priority: 'high', status: 'in_progress' },
    { title: 'Create social media calendar', category: 'content', priority: 'medium', status: 'todo' },
    { title: 'Set up automated email sequences', category: 'sales', priority: 'low', status: 'todo' },
    { title: 'Prepare annual summit agenda', category: 'event', priority: 'high', status: 'todo' },
    { title: 'Expense report for Q2', category: 'general', priority: 'low', status: 'done' },
    { title: 'Client feedback survey design', category: 'sales', priority: 'medium', status: 'in_progress' },
    { title: 'Blog post: AI trends 2026', category: 'content', priority: 'medium', status: 'review' },
    { title: 'Competitor analysis report', category: 'general', priority: 'high', status: 'todo' },
  ];

  for (const t of taskData) {
    await prisma.task.create({
      data: {
        title: t.title,
        description: `${t.title} - detailed requirements pending.`,
        category: t.category,
        priority: t.priority,
        status: t.status,
        dueDate: new Date(Date.now() + (Math.random() * 14 - 3) * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Reminders
  const reminderData = [
    { title: 'Follow up with Quantum Labs', priority: 'high', daysFromNow: -1 },
    { title: 'Send invoice to Meridian Health', priority: 'medium', daysFromNow: 0 },
    { title: 'Call Marcus about Q3 roadmap', priority: 'high', daysFromNow: 1 },
    { title: 'Review content calendar draft', priority: 'medium', daysFromNow: 2 },
    { title: 'Prep for webinar dry run', priority: 'high', daysFromNow: 3 },
    { title: 'Update pipeline in CRM', priority: 'low', daysFromNow: -2 },
    { title: 'Send thank-you note to Elena', priority: 'low', daysFromNow: 4 },
    { title: 'Check A/B test results', priority: 'medium', daysFromNow: 5 },
    { title: 'Budget review meeting prep', priority: 'high', daysFromNow: -3 },
    { title: 'Quarterly report draft', priority: 'medium', daysFromNow: 7 },
    { title: 'Team standup notes', priority: 'low', daysFromNow: 1 },
    { title: 'Renew SSL certificate', priority: 'urgent', daysFromNow: -1 },
  ];

  for (const r of reminderData) {
    await prisma.reminder.create({
      data: {
        title: r.title,
        description: `Reminder: ${r.title}`,
        priority: r.priority as string,
        dueDate: new Date(Date.now() + r.daysFromNow * 24 * 60 * 60 * 1000),
        isRead: r.daysFromNow < 0 ? false : Math.random() > 0.5,
      },
    });
  }

  // Content
  const contentData = [
    { title: 'June Newsletter: AI Agent Revolution', type: 'newsletter', platform: 'email', status: 'scheduled' },
    { title: '5 Ways AI Boosts Productivity', type: 'blog', platform: 'blog', status: 'published' },
    { title: 'Product Launch Campaign', type: 'social_media', platform: 'linkedin', status: 'draft' },
    { title: 'Customer Success Story: Acme Corp', type: 'social_media', platform: 'twitter', status: 'draft' },
    { title: 'Summer Webinar Series Promo', type: 'ad_copy', platform: 'linkedin', status: 'scheduled' },
    { title: 'Event Recap: Tech Summit 2026', type: 'event_content', platform: 'instagram', status: 'published' },
    { title: 'Industry Trends Report 2026', type: 'blog', platform: 'blog', status: 'draft' },
    { title: 'July Product Update Newsletter', type: 'newsletter', platform: 'email', status: 'draft' },
    { title: 'Holiday Campaign Ad Copy', type: 'ad_copy', platform: 'linkedin', status: 'draft' },
    { title: 'Team Spotlight: Engineering', type: 'social_media', platform: 'instagram', status: 'published' },
    { title: 'Data Privacy Whitepaper', type: 'blog', platform: 'blog', status: 'draft' },
    { title: 'Conference Landing Page Copy', type: 'event_content', platform: 'email', status: 'draft' },
  ];

  for (const c of contentData) {
    await prisma.content.create({
      data: {
        title: c.title,
        body: `Content body for: ${c.title}\n\nThis is a sample content piece that would contain the full text, images, and formatting.`,
        type: c.type,
        platform: c.platform,
        status: c.status,
        scheduledAt: c.status === 'scheduled' ? new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000) : null,
      },
    });
  }

  // Events
  const eventData = [
    { title: 'Q3 Strategy Workshop', type: 'meeting', location: 'Conference Room A', daysFromNow: 3 },
    { title: 'AI Automation Webinar', type: 'webinar', location: 'Zoom', daysFromNow: 7 },
    { title: 'Tech Innovators Conference', type: 'conference', location: 'San Francisco, CA', daysFromNow: 21 },
    { title: 'Summer Marketing Campaign Launch', type: 'campaign', location: 'Virtual', daysFromNow: 10 },
    { title: 'Client Onboarding: InnoData', type: 'meeting', location: 'Virtual', daysFromNow: 1 },
    { title: 'Product Demo for TokyoTech', type: 'meeting', location: 'Virtual', daysFromNow: 2 },
    { title: 'Monthly All-Hands', type: 'meeting', location: 'Main Hall', daysFromNow: 5 },
    { title: 'Content Strategy Sprint', type: 'meeting', location: 'War Room', daysFromNow: -1 },
    { title: 'Partner Summit 2026', type: 'conference', location: 'New York, NY', daysFromNow: 45 },
    { title: 'End-of-Quarter Review', type: 'meeting', location: 'Board Room', daysFromNow: 14 },
    { title: 'Community Meetup', type: 'campaign', location: 'The Loft Downtown', daysFromNow: 12 },
    { title: 'Holiday Planning Session', type: 'meeting', location: 'Virtual', daysFromNow: 30 },
  ];

  for (const e of eventData) {
    const start = new Date(Date.now() + e.daysFromNow * 24 * 60 * 60 * 1000);
    await prisma.event.create({
      data: {
        title: e.title,
        description: `Event: ${e.title}\nLocation: ${e.location}`,
        type: e.type,
        location: e.location,
        status: e.daysFromNow < 0 ? 'completed' : 'scheduled',
        startDate: start,
        endDate: new Date(start.getTime() + 2 * 60 * 60 * 1000),
        clientId: Math.random() > 0.6 ? clients[Math.floor(Math.random() * clients.length)].id : null,
      },
    });
  }

  // Reports
  const now = new Date();
  for (let i = 0; i < 8; i++) {
    const startDate = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    await prisma.report.create({
      data: {
        title: i === 0 ? 'Current Week Report' : `Week ${i + 1} Report`,
        type: 'weekly',
        metrics: JSON.stringify({
          revenue: 25000 + Math.floor(Math.random() * 15000),
          newClients: Math.floor(Math.random() * 5) + 1,
          newLeads: Math.floor(Math.random() * 10) + 3,
          tasksCompleted: Math.floor(Math.random() * 15) + 5,
          contentPublished: Math.floor(Math.random() * 4) + 1,
          engagementRate: (Math.random() * 5 + 2).toFixed(1),
        }),
        startDate,
        endDate,
      },
    });
  }

  // Monthly reports
  for (let i = 0; i < 3; i++) {
    const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    await prisma.report.create({
      data: {
        title: `${startDate.toLocaleString('default', { month: 'long' })} 2026 Report`,
        type: 'monthly',
        metrics: JSON.stringify({
          revenue: 120000 + Math.floor(Math.random() * 50000),
          newClients: Math.floor(Math.random() * 12) + 5,
          newLeads: Math.floor(Math.random() * 40) + 15,
          tasksCompleted: Math.floor(Math.random() * 60) + 20,
          contentPublished: Math.floor(Math.random() * 15) + 5,
          engagementRate: (Math.random() * 5 + 2).toFixed(1),
        }),
        startDate,
        endDate,
      },
    });
  }

  // Activities
  const activityData = [
    { type: 'created', entity: 'task', description: 'Created task: Review Q3 marketing strategy' },
    { type: 'completed', entity: 'task', description: 'Completed task: Update LinkedIn company page' },
    { type: 'updated', entity: 'client', description: 'Updated client: Sarah Chen - Acme Corp' },
    { type: 'created', entity: 'lead', description: 'New lead: James Wilson from FinEdge Capital' },
    { type: 'created', entity: 'content', description: 'Published: 5 Ways AI Boosts Productivity' },
    { type: 'updated', entity: 'lead', description: 'Lead Carlos Mendez moved to Qualified' },
    { type: 'completed', entity: 'task', description: 'Completed task: Expense report for Q2' },
    { type: 'created', entity: 'event', description: 'Scheduled: AI Automation Webinar' },
    { type: 'created', entity: 'reminder', description: 'Set reminder: Send invoice to Meridian Health' },
    { type: 'updated', entity: 'client', description: 'Client Marcus Johnson deal value increased to $28,500' },
    { type: 'created', entity: 'content', description: 'Scheduled: June Newsletter' },
    { type: 'completed', entity: 'task', description: 'Marked Review Q3 marketing strategy as in progress' },
    { type: 'updated', entity: 'lead', description: 'Lead score updated for Priya Sharma: 85' },
    { type: 'created', entity: 'event', description: 'Created event: Tech Innovators Conference' },
    { type: 'updated', entity: 'client', description: 'Added notes for Elena Rodriguez - Globex' },
    { type: 'completed', entity: 'reminder', description: 'Completed reminder: Renew SSL certificate' },
    { type: 'created', entity: 'task', description: 'New task: Competitor analysis report' },
    { type: 'updated', entity: 'content', description: 'Draft saved: Industry Trends Report 2026' },
    { type: 'created', entity: 'lead', description: 'New lead: Isabella Costa from Lumina AI' },
    { type: 'completed', entity: 'task', description: 'Task moved to review: Blog post AI trends 2026' },
  ];

  for (let i = 0; i < activityData.length; i++) {
    const a = activityData[i];
    await prisma.activity.create({
      data: {
        type: a.type,
        entity: a.entity,
        description: a.description,
        createdAt: new Date(Date.now() - (activityData.length - i) * 2 * 60 * 60 * 1000),
      },
    });
  }

  console.log('✅ Seed data created successfully!');
  console.log(`   - ${clients.length} clients`);
  console.log(`   - ${leadNames.length} leads`);
  console.log(`   - ${taskData.length} tasks`);
  console.log(`   - ${reminderData.length} reminders`);
  console.log(`   - ${contentData.length} content items`);
  console.log(`   - ${eventData.length} events`);
  console.log(`   - 11 reports`);
  console.log(`   - ${activityData.length} activities`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
