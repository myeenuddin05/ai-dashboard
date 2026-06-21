import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { demoTasks } from '@/lib/demo-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const priority = searchParams.get('priority') || '';
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;
    const tasks = await prisma.task.findMany({ where, orderBy: { createdAt: 'desc' } });
    if (tasks && tasks.length > 0) return NextResponse.json(tasks);
  } catch { /* fall through */ }

  let filtered = [...demoTasks];
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';
  const category = searchParams.get('category') || '';
  const priority = searchParams.get('priority') || '';
  if (status) filtered = filtered.filter(t => t.status === status);
  if (category) filtered = filtered.filter(t => t.category === category);
  if (priority) filtered = filtered.filter(t => t.priority === priority);
  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const task = await prisma.task.create({ data: { title: body.title, description: body.description || null, status: body.status || 'todo', category: body.category || 'general', priority: body.priority || 'medium', dueDate: body.dueDate ? new Date(body.dueDate) : null } });
    return NextResponse.json(task, { status: 201 });
  } catch {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({ id: `t${Date.now()}`, title: body.title || 'New Task', description: body.description || null, status: body.status || 'todo', category: body.category || 'general', priority: body.priority || 'medium', dueDate: body.dueDate || null, createdAt: new Date().toISOString() }, { status: 201 });
  }
}
