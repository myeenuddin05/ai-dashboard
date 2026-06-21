import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const content = await prisma.content.update({
      where: { id },
      data: {
        title: body.title,
        body: body.body,
        type: body.type,
        platform: body.platform,
        status: body.status,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      },
    });
    await prisma.activity.create({
      data: { type: 'updated', entity: 'content', description: `Updated content: ${content.title}` },
    });
    return NextResponse.json(content);
  } catch {
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.content.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
  }
}
