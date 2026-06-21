import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { endDate: 'desc' },
    });
    return NextResponse.json(reports);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
