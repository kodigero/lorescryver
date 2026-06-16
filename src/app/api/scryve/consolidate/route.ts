import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { chatCompletion } from '@/lib/deepseek';
import { consolidateRequestSchema, validationError } from '@/lib/validation';
import { sanitizeObjectForPrompt } from '@/lib/sanitize';
import type { WizardData } from '@/lib/wizard-state-machine';
import { checkAiRateLimit } from '@/lib/ai-rate-limit';


const ALLOWED_SECTION_KEYS = new Set([
  'summary.main_characters',
  'summary.scope',
  'summary.main_conflict',
  'summary.outline_overview',
  'summary.synopsis',
]);

const SYSTEM_PROMPT = `You are Scryve, the AI narrative assistant for LoreScryver — a professional authoring platform for storytellers.

You have a warm, friendly personality. You are like a trusted creative partner — supportive but honest. Write with heart, not like a machine.

Your task: take the author's answers from a guided wizard and consolidate them into clean, structured content for their project's Summary section.

Create 5 sections:

1. Main Characters — Present the protagonist, supporting characters, and antagonist. Show who they are and how they connect. Use correct pronouns (he/him/his for male, she/her for female).

2. Scope — Where and when the story takes place. Paint the setting briefly but vividly. Include the format (standalone, series, etc.).

3. Main Conflict — The central dramatic tension. What the conflict is, who or what caused it, the real reason behind it, what is at stake, and the outcome.

4. Outline Overview — The story arc in four beats: how it begins, how the conflict starts, how it is resolved, and how it ends.

5. Synopsis — YOUR MOST IMPORTANT JOB. Weave ALL the information — characters, world, conflict, and plot — into a cohesive, compelling narrative summary. This should read like a friend passionately describing the story to another friend. Not a dry summary. Make it breathe.

Rules:
- Write in flowing prose, not bullet points (except for character entries in Main Characters)
- Preserve the author's intent — do not invent major plot points
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

function buildUserMessage(project: { title: string; type: string; deliveryFormat: string | null }, data: WizardData): string {
  const notesSection = data.notes && data.notes.length > 0
    ? `\nADDITIONAL NOTES:\n${data.notes.map(n => `- ${n}`).join('\n')}`
    : '';

  const formatStr = project.type === 'DELIVERY' && project.deliveryFormat ? project.deliveryFormat : project.type;
  return `Project: "${project.title}" (${formatStr})

PROTAGONIST:
- Name: ${data.protagonistName || '(not yet provided)'}
- Gender: ${data.protagonistGender || '(not yet provided)'}

SUPPORTING CHARACTERS:
${data.supportingCharacters || '(not yet provided)'}

ANTAGONIST:
${data.antagonist || '(not yet provided)'}

SCOPE:
- Setting: ${data.scopeLocation || '(not yet provided)'}
- Time Period: ${data.scopeTime || '(not yet provided)'}
- Format: ${data.scopeInstallments || '(not yet provided)'}

CONFLICT:
- Final conflict: ${data.conflictMain || '(not yet provided)'}
- Caused by: ${data.conflictCause || '(not yet provided)'}
- Real reason: ${data.conflictReason || '(not yet provided)'}
- Why it matters: ${data.conflictImportance || '(not yet provided)'}
- Outcome: ${data.conflictOutcome || '(not yet provided)'}

OUTLINE:
- How it begins: ${data.outlineBegin || '(not yet provided)'}
- How the conflict starts: ${data.outlineConflictStart || '(not yet provided)'}
- How it is resolved: ${data.outlineResolution || '(not yet provided)'}
- How it ends: ${data.outlineEnding || '(not yet provided)'}${notesSection}

Consolidate these into 5 structured Summary sections. For any section where data is not yet provided, write what you can from available information and note what is missing.`;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimited = await checkAiRateLimit(user);
  if (rateLimited) return rateLimited;

  const parsed = consolidateRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(validationError(), { status: 400 });
  }
  const { projectId, wizardData: rawWizardData, previewOnly } = parsed.data;

  // Sanitize all user-provided wizard data before injecting into AI prompt
  const wizardData = sanitizeObjectForPrompt(rawWizardData);

  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const userMessage = buildUserMessage(
      { title: project.title, type: project.type, deliveryFormat: project.deliveryFormat },
      wizardData
    );

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
      const parsed = JSON.parse(cleaned);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('AI response was not an object');
      }

      sections = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (ALLOWED_SECTION_KEYS.has(key) && typeof value === 'string') {
          sections[key] = value;
        }
      }

      if (Object.keys(sections).length === 0) {
        throw new Error('AI response did not include allowed section keys');
      }
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
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

    return NextResponse.json({ data: { sections, usage: result.usage } });
  } catch (error) {
    console.error('Scryve consolidation error:', error);
    return NextResponse.json(
      { error: 'AI processing failed' },
      { status: 500 }
    );
  }
}
