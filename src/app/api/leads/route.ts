import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { demoLeads } from '@/lib/demo-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const source = searchParams.get('source') || '';
    const search = searchParams.get('search') || '';
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (source) where.source = source;
    if (search) where.OR = [{ name: { contains: search } }, { email: { contains: search } }, { company: { contains: search } }];
    const leads = await prisma.lead.findMany({ where, orderBy: { updatedAt: 'desc' } });
    if (leads && leads.length > 0) return NextResponse.json(leads);
  } catch { /* fall through */ }

  let filtered = [...demoLeads];
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';
  const source = searchParams.get('source') || '';
  if (status) filtered = filtered.filter(l => l.status === status);
  if (source) filtered = filtered.filter(l => l.source === source);
  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lead = await prisma.lead.create({ data: { name: body.name, email: body.email, phone: body.phone || null, company: body.company || null, source: body.source || 'website', status: body.status || 'new', score: body.score || 50, value: body.value || 0, notes: body.notes || null } });
    return NextResponse.json(lead, { status: 201 });
  } catch {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({ id: `l${Date.now()}`, name: body.name || 'New Lead', email: body.email || '', company: body.company || null, source: body.source || 'website', status: 'new', score: 50, value: body.value || 0, notes: body.notes || null, createdAt: new Date().toISOString() }, { status: 201 });
  }
}
