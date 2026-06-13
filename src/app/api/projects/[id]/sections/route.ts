import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTestUser } from '@/lib/test-user';

// GET /api/projects/:id/sections — get all section content for a project
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getTestUser();

  // Verify ownership
  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const sections = await prisma.projectSection.findMany({
    where: { projectId: id },
    select: { key: true, content: true, updatedAt: true },
  });

  // Return as a key-value map
  const data: Record<string, { content: string; updatedAt: string }> = {};
  for (const s of sections) {
    data[s.key] = { content: s.content, updatedAt: s.updatedAt.toISOString() };
  }

  return NextResponse.json(data);
}

// PUT /api/projects/:id/sections — upsert a single section
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getTestUser();
  const body = await request.json();
  const { key, content } = body;

  if (!key || typeof content !== 'string') {
    return NextResponse.json({ error: 'key and content are required' }, { status: 400 });
  }

  // Verify ownership
  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
  });

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const section = await prisma.projectSection.upsert({
    where: { projectId_key: { projectId: id, key } },
    update: { content },
    create: { projectId: id, key, content },
  });

  return NextResponse.json({ key: section.key, content: section.content, updatedAt: section.updatedAt });
}
