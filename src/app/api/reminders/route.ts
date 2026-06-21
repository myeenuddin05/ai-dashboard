import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { demoReminders } from '@/lib/demo-data';

export async function GET() {
  try {
    const reminders = await prisma.reminder.findMany({ orderBy: { dueDate: 'asc' } });
    if (reminders && reminders.length > 0) return NextResponse.json(reminders);
  } catch { /* fall through */ }
  return NextResponse.json(demoReminders);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reminder = await prisma.reminder.create({ data: { title: body.title, description: body.description || null, dueDate: new Date(body.dueDate), isRead: false } });
    return NextResponse.json(reminder, { status: 201 });
  } catch {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({ id: `r${Date.now()}`, title: body.title || 'New Reminder', description: body.description || null, dueDate: body.dueDate || new Date().toISOString(), isRead: false, createdAt: new Date().toISOString() }, { status: 201 });
  }
}
