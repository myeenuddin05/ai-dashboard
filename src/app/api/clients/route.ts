import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { demoClients } from '@/lib/demo-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } },
      ];
    }
    if (status) where.status = status;

    const clients = await prisma.client.findMany({ where, orderBy: { updatedAt: 'desc' } });
    if (clients && clients.length > 0) return NextResponse.json(clients);
  } catch { /* fall through to demo data */ }

  let filtered = [...demoClients];
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const status = searchParams.get('status') || '';
  if (search) filtered = filtered.filter(c => c.name.toLowerCase().includes(search) || c.company?.toLowerCase().includes(search));
  if (status) filtered = filtered.filter(c => c.status === status);
  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await prisma.client.create({
      data: { name: body.name, email: body.email, phone: body.phone || null, company: body.company || null, status: body.status || 'active', value: body.value || 0, notes: body.notes || null },
    });
    return NextResponse.json(client, { status: 201 });
  } catch {
    const body = await request.json().catch(() => ({}));
    const client = { id: `c${Date.now()}`, name: body.name || 'New Client', email: body.email || '', company: body.company || null, phone: body.phone || null, status: 'active', value: body.value || 0, notes: body.notes || null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return NextResponse.json(client, { status: 201 });
  }
}
