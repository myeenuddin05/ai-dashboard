import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        histories: { orderBy: { createdAt: 'desc' } },
        events: { orderBy: { startDate: 'asc' } },
      },
    });
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    return NextResponse.json(client);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const client = await prisma.client.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        company: body.company,
        status: body.status,
        value: body.value,
        notes: body.notes,
      },
    });
    await prisma.activity.create({
      data: { type: 'updated', entity: 'client', description: `Updated client: ${client.name}` },
    });
    return NextResponse.json(client);
  } catch {
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const client = await prisma.client.delete({ where: { id } });
    await prisma.activity.create({
      data: { type: 'deleted', entity: 'client', description: `Deleted client: ${client.name}` },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
