import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const reminders = await prisma.reminder.findMany({
      orderBy: { dueDate: 'asc' },
    });
    return NextResponse.json(reminders);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reminder = await prisma.reminder.create({
      data: {
        title: body.title,
        description: body.description || null,
        dueDate: new Date(body.dueDate),
        priority: body.priority || 'medium',
      },
    });
    await prisma.activity.create({
      data: { type: 'created', entity: 'reminder', description: `Set reminder: ${reminder.title}` },
    });
    return NextResponse.json(reminder, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 });
  }
}
