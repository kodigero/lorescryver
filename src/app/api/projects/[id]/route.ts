import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTestUser } from '@/lib/test-user';

// GET /api/projects/:id — get a single project
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getTestUser();

  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(project);
}

// PATCH /api/projects/:id — update a project
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getTestUser();
  const body = await request.json();

  // Verify ownership
  const existing = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { title, projectType, status, wordCountGoal } = body;

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(projectType !== undefined && { projectType }),
      ...(status !== undefined && { status }),
      ...(wordCountGoal !== undefined && { wordCountGoal }),
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

  return NextResponse.json(project);
}

// DELETE /api/projects/:id — delete a project
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getTestUser();

  // Verify ownership
  const existing = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.project.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
