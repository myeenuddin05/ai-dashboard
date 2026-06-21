import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';
    const platform = searchParams.get('platform') || '';
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (platform) where.platform = platform;
    if (status) where.status = status;

    const content = await prisma.content.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(content);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const content = await prisma.content.create({
      data: {
        title: body.title,
        body: body.body || '',
        type: body.type || 'social_media',
        platform: body.platform || 'linkedin',
        status: body.status || 'draft',
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      },
    });
    await prisma.activity.create({
      data: { type: 'created', entity: 'content', description: `Created content: ${content.title}` },
    });
    return NextResponse.json(content, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 });
  }
}
