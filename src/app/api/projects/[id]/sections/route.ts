import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sectionWriteSchema, validationError } from '@/lib/validation';

// GET /api/projects/:id/sections — get all section content for a project
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
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
  } catch (error) {
    console.error('Project sections read error:', error);
    return NextResponse.json({ error: 'Failed to load sections' }, { status: 500 });
  }
}

// PUT /api/projects/:id/sections — upsert a single section
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = sectionWriteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(validationError(), { status: 400 });
  }
  const { key, content } = parsed.data;

  try {
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
  } catch (error) {
    console.error('Project section write error:', error);
    return NextResponse.json({ error: 'Failed to save section' }, { status: 500 });
  }
}
