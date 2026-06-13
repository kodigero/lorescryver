import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTestUser } from '@/lib/test-user';

// GET /api/projects — list all projects for the current user
export async function GET() {
  const user = await getTestUser();

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      projectType: true,
      status: true,
      wordCountGoal: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(projects);
}

// POST /api/projects — create a new project
export async function POST(request: Request) {
  const user = await getTestUser();
  const body = await request.json();

  const { title, projectType, wordCountGoal } = body;

  if (!title || typeof title !== 'string') {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      title: title.trim(),
      projectType: projectType || 'novel',
      wordCountGoal: wordCountGoal || 80000,
      userId: user.id,
    },
    select: {
      id: true,
      title: true,
      projectType: true,
      status: true,
      wordCountGoal: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
