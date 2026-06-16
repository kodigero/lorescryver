import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Phase } from '@prisma/client';
import {
  createStagingConceptSchema,
  isValidStagingPhaseStage,
  stagingPhaseStageMap,
  stagingPhases,
  validationError,
} from '@/lib/validation';

// GET /api/projects/:id/staging - list all concepts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const project = await prisma.project.findFirst({ where: { id, userId: user.id } });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const requestedPhase = new URL(request.url).searchParams.get('phase');
  const phase = stagingPhases.find((value) => value === requestedPhase as Phase);

  const concepts = await prisma.stagingConcept.findMany({
    where: { projectId: id, ...(phase && { phase }) },
    select: { id: true, title: true, summary: true, phase: true, stage: true, tags: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ data: concepts });
}

// POST /api/projects/:id/staging - create a new concept
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const project = await prisma.project.findFirst({ where: { id, userId: user.id } });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const parsed = createStagingConceptSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json(validationError(), { status: 400 });

  const phase = parsed.data.phase;
  const stage = parsed.data.stage ?? stagingPhaseStageMap[phase][0];
  if (!isValidStagingPhaseStage(phase, stage)) {
    return NextResponse.json(validationError(), { status: 400 });
  }

  const greeting = { role: 'assistant', content: 'Hey there! What is on your mind? I am ready to brainstorm with you.' };

  const concept = await prisma.stagingConcept.create({
    data: {
      projectId: id,
      title: 'New Brainstorm',
      phase,
      stage,
      messages: [greeting],
    },
  });

  return NextResponse.json({ data: concept }, { status: 201 });
}
