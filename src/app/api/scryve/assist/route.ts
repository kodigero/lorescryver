import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { chatCompletion } from '@/lib/deepseek';
import { assistRequestSchema, validationError } from '@/lib/validation';
import { sanitizeForPrompt } from '@/lib/sanitize';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = assistRequestSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(validationError(), { status: 400 });
    }
    const { messages, context } = parsed.data;

    // Sanitize user-provided context before injecting into AI prompt
    const safeQuestion = sanitizeForPrompt(context.question);
    const safeName = context.protagonistName ? sanitizeForPrompt(context.protagonistName) : '';
    const safeGender = context.protagonistGender ? sanitizeForPrompt(context.protagonistGender) : '';
    const safeAntagonist = context.antagonistName ? sanitizeForPrompt(context.antagonistName) : '';

    const choicesInfo = context.choices
      ? `\nAVAILABLE CHOICES: ${context.choices.join(', ')}. The locked-in answer MUST be one of these exact values.`
      : '';

    const systemPrompt = `You are Scryve, a warm and friendly story-building assistant for LoreScryver. You are helping an author brainstorm for a specific step in their story wizard.

CURRENT STEP: "${safeQuestion}"
${safeName ? `Protagonist: ${safeName}${safeGender ? ` (${safeGender})` : ''}` : ''}${safeAntagonist ? `\nAntagonist: ${safeAntagonist}` : ''}${choicesInfo}

YOUR RULES:
1. Stay STRICTLY on topic. If the author drifts, gently steer back: "That is interesting, but let us focus on the current question first!"
2. Be warm, conversational, like chatting with a creative friend.
3. Offer suggestions, ask clarifying questions, present options.
4. Use he/him or she/her for individuals. Only use they/their for groups.
5. Keep responses short - 2-3 sentences max.
6. When the author clearly decides on a final answer, confirm it and include this EXACT format at the end of your message:
   <<LOCK:the exact answer>>
   Example: "Love it! Locking that in. <<LOCK:Kaizer de Luna>>"
7. Do NOT lock in until the author explicitly says something like "yes", "that one", "let us go with that", "I will use that", confirms a suggestion, etc.
8. If the author asks you to pick for them, suggest 2-3 options and ask which one resonates.
9. NEVER drift into discussing other parts of the story that are not relevant to the current step.`;

    const result = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        ...messages.map((message) => ({ role: message.role, content: message.content })),
      ],
      { temperature: 0.7, maxTokens: 300 }
    );

    return NextResponse.json({ content: result.content });
  } catch (err) {
    console.error('Assist error:', err);
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
  }
}
