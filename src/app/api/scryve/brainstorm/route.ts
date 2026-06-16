import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Phase } from '@prisma/client';
import { chatCompletion } from '@/lib/deepseek';
import { brainstormRequestSchema, validationError } from '@/lib/validation';
import { sanitizeForPrompt } from '@/lib/sanitize';
import { checkAiRateLimit } from '@/lib/ai-rate-limit';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rateLimited = await checkAiRateLimit(user);
    if (rateLimited) return rateLimited;

    const parsed = brainstormRequestSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json(validationError(), { status: 400 });

    const { messages, projectId, conceptId } = parsed.data;

    // Verify ownership
    const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const concept = conceptId
      ? await prisma.stagingConcept.findFirst({ where: { id: conceptId, projectId } })
      : null;
    if (conceptId && !concept) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Fetch project summary context
    const sections = await prisma.projectSection.findMany({
      where: { projectId, key: { startsWith: 'summary.' } },
      select: { key: true, content: true },
    });
    const summaryMap: Record<string, string> = {};
    for (const s of sections) {
      if (s.content.trim()) summaryMap[s.key] = sanitizeForPrompt(s.content);
    }

    let projectContext = '';
    if (Object.keys(summaryMap).length > 0) {
      const parts: string[] = [];
      if (summaryMap['summary.main_characters']) parts.push(`Characters: ${summaryMap['summary.main_characters']}`);
      if (summaryMap['summary.scope']) parts.push(`Scope: ${summaryMap['summary.scope']}`);
      if (summaryMap['summary.main_conflict']) parts.push(`Main Conflict: ${summaryMap['summary.main_conflict']}`);
      if (summaryMap['summary.outline_overview']) parts.push(`Outline: ${summaryMap['summary.outline_overview']}`);
      if (summaryMap['summary.synopsis']) parts.push(`Synopsis: ${summaryMap['summary.synopsis']}`);
      projectContext = parts.join('\n');
    } else {
      projectContext = 'No summary has been written yet. The author is just getting started.';
    }

    const modeInstruction = concept?.phase === Phase.CANDIDATE
      ? `CURRENT MODE:
You are stress-testing a candidate concept before it can become canon. Compare it against the project context, existing canon, and likely future expansion paths. Flag contradictions, weak logic, missing implications, continuity risks, and places where the author needs a clearer decision. Be constructive: after each concern, suggest 1-3 concrete fixes or options.`
      : `CURRENT MODE:
You are helping the author explore rough concepts. Capture scattered ideas, organize them, ask useful follow-up questions, and help rough inspiration become a candidate idea.`;

    const systemPrompt = `You are Scryve, a warm and creative story-building assistant for LoreScryver. You are in a staging session with an author.

PROJECT CONTEXT:
${projectContext}

${modeInstruction}

YOUR PERSONALITY:
1. Be warm, friendly, like chatting with a creative friend.
2. Always be direct and to the point. Use simple, everyday language.
3. Never give convoluted or messy answers.
4. When asking for the author's decision, always offer 2-3 clear options and highlight your best recommendation.
5. Use he/him or she/her for individual people. Only use they/their for groups.
6. Keep responses concise - 2-4 sentences unless the topic needs more detail.
7. Catch and organize scattered ideas. If the author jumps between topics, gently organize them.
8. Be proactive - suggest angles, ask follow-up questions, push the brainstorm forward.
9. Avoid analysis paralysis. Always move the conversation forward with concrete options.

YOUR ROLE:
- Help the author brainstorm ANY story element: characters, locations, plot points, magic systems, technology, history, relationships, anything.
- Capture every spark of an idea, no matter how rough.
- Organize thoughts into cohesive concepts.
- When ideas crystallize, summarize them clearly.
- Reference the project context above when relevant, but do not force it into every response.`;

    const result = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      { temperature: 0.7, maxTokens: 500 }
    );

    // Save messages to concept (including new AI response)
    if (conceptId) {
      let allMessages = [
        ...messages,
        { role: 'assistant' as const, content: result.content },
      ];

      if (allMessages.length > 100) {
        // Keep the first message (greeting) and the last 99 messages
        allMessages = [allMessages[0], ...allMessages.slice(allMessages.length - 99)];
      }

      const updateData: Record<string, unknown> = { messages: allMessages };

      if (concept && concept.title === 'New Brainstorm') {
        const firstUserMsg = messages.find((m) => m.role === 'user');
        if (firstUserMsg) {
          const raw = firstUserMsg.content.trim();
          updateData.title = raw.length > 60 ? raw.slice(0, 57) + '...' : raw;
        }
      }

      await prisma.stagingConcept.update({
        where: { id: conceptId },
        data: updateData,
      });
    }

    return NextResponse.json({ data: { content: result.content } });
  } catch (err) {
    console.error('Brainstorm error:', err);
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
  }
}
