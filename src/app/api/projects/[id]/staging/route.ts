import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/projects/:id/staging - list all concepts
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const project = await prisma.project.findFirst({ where: { id, userId: user.id } });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const concepts = await prisma.stagingConcept.findMany({
    where: { projectId: id },
    select: { id: true, title: true, summary: true, phase: true, stage: true, tags: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(concepts);
}

// POST /api/projects/:id/staging - create a new concept
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const project = await prisma.project.findFirst({ where: { id, userId: user.id } });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const greeting = { role: 'assistant', content: 'Hey there! What is on your mind? I am ready to brainstorm with you.' };

  const concept = await prisma.stagingConcept.create({
    data: {
      projectId: id,
      title: 'New Brainstorm',
      messages: [greeting],
    },
  });

  return NextResponse.json(concept, { status: 201 });
}
