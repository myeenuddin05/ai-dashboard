import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const task = await prisma.task.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
        category: body.category,
        priority: body.priority,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      },
    });
    if (body.status === 'done') {
      await prisma.activity.create({
        data: { type: 'completed', entity: 'task', description: `Completed task: ${task.title}` },
      });
    } else {
      await prisma.activity.create({
        data: { type: 'updated', entity: 'task', description: `Updated task: ${task.title}` },
      });
    }
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const task = await prisma.task.delete({ where: { id } });
    await prisma.activity.create({
      data: { type: 'deleted', entity: 'task', description: `Deleted task: ${task.title}` },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
