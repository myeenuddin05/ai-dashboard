import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const source = searchParams.get('source') || '';
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (source) where.source = source;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(leads);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lead = await prisma.lead.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        company: body.company || null,
        source: body.source || 'website',
        status: body.status || 'new',
        score: body.score || 50,
        value: body.value || 0,
        notes: body.notes || null,
      },
    });
    await prisma.activity.create({
      data: { type: 'created', entity: 'lead', description: `New lead: ${lead.name}` },
    });
    return NextResponse.json(lead, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
