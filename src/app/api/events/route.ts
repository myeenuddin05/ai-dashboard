import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { demoEvents } from '@/lib/demo-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (status) where.status = status;
    const events = await prisma.event.findMany({ where, orderBy: { startDate: 'asc' } });
    if (events && events.length > 0) return NextResponse.json(events);
  } catch { /* fall through */ }

  let filtered = [...demoEvents];
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || '';
  const status = searchParams.get('status') || '';
  if (type) filtered = filtered.filter(e => e.type === type);
  if (status) filtered = filtered.filter(e => e.status === status);
  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = await prisma.event.create({ data: { title: body.title, description: body.description || null, type: body.type || 'meeting', location: body.location || 'Virtual', status: body.status || 'upcoming', startDate: new Date(body.date || body.startDate), endDate: body.endDate ? new Date(body.endDate) : null, clientId: body.clientId || null } });
    return NextResponse.json(event, { status: 201 });
  } catch {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({ id: `e${Date.now()}`, title: body.title || 'New Event', description: body.description || null, type: body.type || 'meeting', location: body.location || 'Virtual', status: body.status || 'upcoming', date: body.date || new Date().toISOString(), createdAt: new Date().toISOString() }, { status: 201 });
  }
}
