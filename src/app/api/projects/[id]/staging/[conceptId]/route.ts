import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - get concept with messages
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; conceptId: string }> }
) {
  const { id, conceptId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const project = await prisma.project.findFirst({ where: { id, userId: user.id } });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const concept = await prisma.stagingConcept.findFirst({
    where: { id: conceptId, projectId: id },
  });
  if (!concept) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(concept);
}

// PUT - update concept
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; conceptId: string }> }
) {
  const { id, conceptId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const project = await prisma.project.findFirst({ where: { id, userId: user.id } });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const existing = await prisma.stagingConcept.findFirst({ where: { id: conceptId, projectId: id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const concept = await prisma.stagingConcept.update({
    where: { id: conceptId },
    data: {
      ...(body.title !== undefined && { title: String(body.title).slice(0, 200) }),
      ...(body.summary !== undefined && { summary: String(body.summary) }),
      ...(body.phase !== undefined && { phase: String(body.phase) }),
      ...(body.stage !== undefined && { stage: String(body.stage) }),
      ...(body.messages !== undefined && { messages: body.messages }),
      ...(body.tags !== undefined && { tags: body.tags }),
    },
  });

  return NextResponse.json(concept);
}

// DELETE - delete concept
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; conceptId: string }> }
) {
  const { id, conceptId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const project = await prisma.project.findFirst({ where: { id, userId: user.id } });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const existing = await prisma.stagingConcept.findFirst({ where: { id: conceptId, projectId: id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.stagingConcept.delete({ where: { id: conceptId } });

  return NextResponse.json({ ok: true });
}
