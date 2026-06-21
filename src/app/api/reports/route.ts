import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { demoReports } from '@/lib/demo-data';

export async function GET() {
  try {
    const reports = await prisma.report.findMany({ orderBy: { endDate: 'desc' } });
    if (reports && reports.length > 0) return NextResponse.json(reports);
  } catch { /* fall through */ }
  return NextResponse.json(demoReports);
}
