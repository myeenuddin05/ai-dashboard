import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        company: body.company,
        source: body.source,
        status: body.status,
        score: body.score,
        value: body.value,
        notes: body.notes,
      },
    });
    await prisma.activity.create({
      data: { type: 'updated', entity: 'lead', description: `Updated lead: ${lead.name}` },
    });
    return NextResponse.json(lead);
  } catch {
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const lead = await prisma.lead.delete({ where: { id } });
    await prisma.activity.create({
      data: { type: 'deleted', entity: 'lead', description: `Deleted lead: ${lead.name}` },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
