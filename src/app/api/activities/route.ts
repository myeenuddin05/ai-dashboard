import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { demoActivities } from '@/lib/demo-data';

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    if (activities && activities.length > 0) return NextResponse.json(activities);
    return NextResponse.json(demoActivities);
  } catch {
    return NextResponse.json(demoActivities);
  }
}
