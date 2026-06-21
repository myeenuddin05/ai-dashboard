import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const events = await prisma.event.findMany({
      where,
      include: { client: { select: { name: true, company: true } } },
      orderBy: { startDate: 'asc' },
    });
    return NextResponse.json(events);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description || null,
        type: body.type || 'meeting',
        location: body.location || 'virtual',
        status: body.status || 'scheduled',
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        clientId: body.clientId || null,
      },
    });
    await prisma.activity.create({
      data: { type: 'created', entity: 'event', description: `Created event: ${event.title}` },
    });
    return NextResponse.json(event, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
