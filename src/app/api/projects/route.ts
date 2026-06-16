import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createProjectSchema, validationError } from '@/lib/validation';

// GET /api/projects — list all projects for the current user
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        deliveryFormat: true,
        status: true,
        wordCountGoal: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ data: projects });
  } catch (error) {
    console.error('Project list error:', error);
    return NextResponse.json({ error: 'Failed to load projects' }, { status: 500 });
  }
}

// POST /api/projects — create a new project
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = createProjectSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(validationError(), { status: 400 });
  }

  try {
    const project = await prisma.project.create({
      data: {
        ...parsed.data,
        userId: user.id,
      },
      select: {
        id: true,
        title: true,
        type: true,
        deliveryFormat: true,
        status: true,
        wordCountGoal: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error('Project create error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
