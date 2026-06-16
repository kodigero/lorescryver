import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  isValidStagingPhaseStage,
  updateStagingConceptSchema,
  validationError,
} from '@/lib/validation';

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

  return NextResponse.json({ data: concept });
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
  const parsed = updateStagingConceptSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(validationError(), { status: 400 });

  const nextPhase = parsed.data.phase ?? existing.phase;
  const nextStage = parsed.data.stage ?? existing.stage;
  if (!isValidStagingPhaseStage(nextPhase, nextStage)) {
    return NextResponse.json(validationError(), { status: 400 });
  }

  const concept = await prisma.stagingConcept.update({
    where: { id: conceptId },
    data: {
      ...parsed.data,
    },
  });

  return NextResponse.json({ data: concept });
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

  return NextResponse.json({ data: { ok: true } });
}
