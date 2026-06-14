import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTestUser } from '@/lib/test-user';
import { chatCompletion } from '@/lib/deepseek';

const SYSTEM_PROMPT = `You are Scryve, the AI narrative assistant for LoreScryver — a professional authoring platform for storytellers across all media (novels, screenplays, games, comics, animation, etc.).

Your task: take the author's raw answers from a guided micro-questionnaire and consolidate them into clean, structured content for their project's Summary section.

The author answered simple, bite-sized questions. You need to weave these fragments into 7 coherent sections:
1. Synopsis — A working summary of the story (combine character, desire, inciting incident, and ending)
2. Genre — The story's genre classification
3. Tone — The mood, atmosphere, and feeling
4. Scope — The scale and boundaries of the story world (combine setting, time period, and world scale)
5. Main Characters — Key characters and their roles (combine protagonist info with supporting cast)
6. Main Conflict — The central dramatic tension (combine obstacle with stakes)
7. Outline Overview — High-level story structure (combine inciting incident, turning point, climax, and ending)

For each section:
- Weave the fragments into natural, flowing prose
- Preserve the author's voice and intent
- Add structure where helpful (e.g., character entries, act breakdowns)
- Fill in obvious gaps with sensible suggestions (clearly marked with [Suggestion: ...])
- Keep it concise and actionable — this is a working document, not a pitch

Respond ONLY with valid JSON in this exact format:
{
  "summary.synopsis": "...",
  "summary.genre": "...",
  "summary.tone": "...",
  "summary.scope": "...",
  "summary.main_characters": "...",
  "summary.main_conflict": "...",
  "summary.outline_overview": "..."
}

Do not include any text before or after the JSON.`;

export async function POST(request: Request) {
  const user = await getTestUser();
  const body = await request.json();
  const { projectId, answers } = body;

  if (!projectId || !answers) {
    return NextResponse.json({ error: 'projectId and answers are required' }, { status: 400 });
  }

  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: user.id },
  });

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // Build the user message from micro-answers
  const userMessage = `Here are the author's answers for their project "${project.title}" (${project.projectType}):

PROTAGONIST NAME: ${answers.protagonistName || '(not provided)'}
WHO THEY ARE: ${answers.protagonistDesc || '(not provided)'}
WHAT THEY WANT: ${answers.protagonistDesire || '(not provided)'}
WHERE IT TAKES PLACE: ${answers.setting || '(not provided)'}
WHEN IT HAPPENS: ${answers.timePeriod || '(not provided)'}
HOW BIG IS THE WORLD: ${answers.worldScale || '(not provided)'}
GENRE: ${answers.genre || '(not provided)'}
HOW IT FEELS: ${answers.tone || '(not provided)'}
WHAT KICKS THE STORY OFF: ${answers.incitingIncident || '(not provided)'}
WHAT STANDS IN THEIR WAY: ${answers.obstacle || '(not provided)'}
OTHER IMPORTANT CHARACTERS: ${answers.supportingCast || '(not provided)'}
MAJOR TURNING POINT: ${answers.turningPoint || '(not provided)'}
HOW IT ENDS: ${answers.ending || '(not provided)'}

Consolidate these into structured Summary content.`;

  try {
    const result = await chatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      { temperature: 0.6, maxTokens: 4096 }
    );

    // Parse the JSON response
    let sections: Record<string, string>;
    try {
      // Strip markdown code fences if present
      let cleaned = result.content.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      sections = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response', raw: result.content },
        { status: 500 }
      );
    }

    // Save all sections to database
    const upserts = Object.entries(sections).map(([key, content]) =>
      prisma.projectSection.upsert({
        where: { projectId_key: { projectId, key } },
        update: { content: String(content) },
        create: { projectId, key, content: String(content) },
      })
    );

    await Promise.all(upserts);

    return NextResponse.json({
      sections,
      usage: result.usage,
    });
  } catch (error) {
    console.error('Scryve consolidation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI processing failed' },
      { status: 500 }
    );
  }
}
