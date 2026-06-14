import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTestUser } from '@/lib/test-user';
import { chatCompletion } from '@/lib/deepseek';

interface CharEntry {
  name: string;
  gender: string;
  relationship: string;
  roles: string[];
}

interface WizardData {
  protagonistName: string;
  protagonistGender: string;
  protagonistOccupation: string;
  protagonistLocation: string;
  characters: CharEntry[];
  antagonistName: string;
  antagonistIsCharacter: boolean;
  antagonistGender: string;
  scopeLocation: string;
  scopeTime: string;
  scopeInstallments: string;
  conflictWant: string;
  conflictStakes: string;
  outlineBefore: string;
  outlineTurning: string;
  outlineEnding: string;
  notes: string[];
}

const ROLE_LABELS: Record<string, string> = {
  important_person: 'most important person in protagonist\'s life',
  role_model: 'role model',
  confidant: 'closest confidant',
  anchor: 'emotional anchor',
  enemy: 'most hated person',
  antagonist: 'main antagonist',
  antagonist_ally: 'antagonist\'s ally',
  other: 'supporting character',
};

const SYSTEM_PROMPT = `You are Scryve, the AI narrative assistant for LoreScryver — a professional authoring platform for storytellers.

You have a warm, friendly personality. You're like a trusted creative partner — supportive but honest. Write with heart, not like a machine.

Your task: take the author's raw single-word answers from a guided conversation and consolidate them into clean, structured content for their project's Summary section.

Create 5 sections:

1. Main Characters — Present as a character web. Show each character's name, their role/relationship, and how they connect to others. Make the relationships feel alive and interconnected. Use correct pronouns (he/him/his for male, she/her for female).

2. Scope — Where and when the story takes place. Paint the setting briefly but vividly. Include the format (standalone, trilogy, series, etc.).

3. Main Conflict — The central dramatic tension. What the antagonist wants (or threatens), what's at stake for the protagonist, and why it matters.

4. Outline Overview — The story arc in three beats: the before (status quo), the turning point (what changes everything), and the ending (how it resolves).

5. Synopsis — YOUR MOST IMPORTANT JOB. Weave ALL the information — characters, world, conflict, and plot — into a cohesive, compelling narrative summary. This should read like a friend passionately describing the story to another friend. Not a dry summary. Make it breathe.

Rules:
- Write in flowing prose, not bullet points (except for character entries in Main Characters)
- Preserve the author's intent — don't invent major plot points
- Fill obvious gaps with sensible inferences (mark with [Suggestion: ...])
- Keep it concise — this is a working document, not a pitch
- Use he/him/his and she/her correctly based on character genders
- If data is incomplete (preview mode), work with what you have and note gaps

Respond ONLY with valid JSON:
{
  "summary.main_characters": "...",
  "summary.scope": "...",
  "summary.main_conflict": "...",
  "summary.outline_overview": "...",
  "summary.synopsis": "..."
}

Do not include any text before or after the JSON.`;

function buildUserMessage(project: { title: string; projectType: string }, data: WizardData): string {
  const characterLines = data.characters
    .map((c) => {
      const roles = c.roles.map((r) => ROLE_LABELS[r] || r).join(', ');
      return `- ${c.name} (${c.relationship || 'relationship unknown'}) — ${roles}`;
    })
    .join('\n');

  const antagonistType = data.antagonistIsCharacter
    ? `${data.antagonistName} (${data.antagonistGender}, character)`
    : `${data.antagonistName} (force/concept)`;

  const notesSection = data.notes && data.notes.length > 0
    ? `\nADDITIONAL NOTES:\n${data.notes.map(n => `- ${n}`).join('\n')}`
    : '';

  return `Project: "${project.title}" (${project.projectType})

PROTAGONIST:
- Name: ${data.protagonistName || '(not yet provided)'}
- Gender: ${data.protagonistGender || '(not yet provided)'}
- Occupation: ${data.protagonistOccupation || '(not yet provided)'}
- Location: ${data.protagonistLocation || '(not yet provided)'}

CHARACTERS AND RELATIONSHIPS:
${characterLines || '(none specified yet)'}

ANTAGONIST: ${data.antagonistName ? antagonistType : '(not yet provided)'}

SCOPE:
- Setting: ${data.scopeLocation || '(not yet provided)'}
- Time Period: ${data.scopeTime || '(not yet provided)'}
- Format: ${data.scopeInstallments || '(not yet provided)'}

CONFLICT:
- Antagonist wants/threatens: ${data.conflictWant || '(not yet provided)'}
- Protagonist stands to lose: ${data.conflictStakes || '(not yet provided)'}

OUTLINE:
- Before the conflict: ${data.outlineBefore || '(not yet provided)'}
- Turning point: ${data.outlineTurning || '(not yet provided)'}
- Ending: ${data.outlineEnding || '(not yet provided)'}${notesSection}

Consolidate these into 5 structured Summary sections. For any section where data is not yet provided, write what you can from available information and note what's missing.`;
}

export async function POST(request: Request) {
  const user = await getTestUser();
  const body = await request.json();
  const { projectId, wizardData, previewOnly } = body;

  if (!projectId || !wizardData) {
    return NextResponse.json({ error: 'projectId and wizardData are required' }, { status: 400 });
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: user.id },
  });

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const userMessage = buildUserMessage(
    { title: project.title, projectType: project.projectType },
    wizardData as WizardData
  );

  try {
    const result = await chatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      { temperature: 0.6, maxTokens: 4096 }
    );

    let sections: Record<string, string>;
    try {
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

    // Only save to DB on final consolidation, not previews
    if (!previewOnly) {
      const upserts = Object.entries(sections).map(([key, content]) =>
        prisma.projectSection.upsert({
          where: { projectId_key: { projectId, key } },
          update: { content: String(content) },
          create: { projectId, key, content: String(content) },
        })
      );
      await Promise.all(upserts);
    }

    return NextResponse.json({ sections, usage: result.usage });
  } catch (error) {
    console.error('Scryve consolidation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI processing failed' },
      { status: 500 }
    );
  }
}
