import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { demoContent } from '@/lib/demo-data';

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
    const content = await prisma.content.findMany({ where, orderBy: { updatedAt: 'desc' } });
    if (content && content.length > 0) return NextResponse.json(content);
  } catch { /* fall through */ }

  let filtered = [...demoContent];
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || '';
  const platform = searchParams.get('platform') || '';
  const status = searchParams.get('status') || '';
  if (type) filtered = filtered.filter(c => c.type === type);
  if (platform) filtered = filtered.filter(c => c.platform === platform);
  if (status) filtered = filtered.filter(c => c.status === status);
  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const content = await prisma.content.create({ data: { title: body.title, body: body.body || '', type: body.type || 'social_media', platform: body.platform || 'linkedin', status: body.status || 'draft', scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null } });
    return NextResponse.json(content, { status: 201 });
  } catch {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({ id: `ct${Date.now()}`, title: body.title || 'New Content', body: body.body || '', type: body.type || 'social_media', platform: body.platform || 'linkedin', status: body.status || 'draft', scheduledAt: body.scheduledAt || null, createdAt: new Date().toISOString() }, { status: 201 });
  }
}
