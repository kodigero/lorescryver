import { NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/deepseek';

const NAME_STEPS = new Set([
  'important_person', 'role_model', 'confidant', 'anchor', 'enemy',
  'antagonist', 'extra_name', 'antagonist_ally',
]);

export async function POST(req: Request) {
  try {
    const { stepId, question, answer } = await req.json();

    if (!stepId || !answer) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const isNameStep = NAME_STEPS.has(stepId);

    const systemPrompt = `You are a response parser for a story-building wizard. A user was asked a question and gave an answer. Parse the answer and extract structured data.

RESPOND ONLY WITH A JSON OBJECT. No markdown, no backticks, no explanation.

Detect if the user wants to SKIP the question. Skip signals include: "I don't know", "skip", "not yet", "no one", "none", "haven't decided", "no idea", "how should I know", "pass", "idk", "not sure", "can't think of one", "maybe later", "I'll decide later", "dunno", "no clue", "I don't have a name", "haven't thought of one", or ANY variation expressing uncertainty, deferral, confusion, or inability to answer. Be generous in detecting skips — if the user is clearly not providing the requested information, treat it as a skip.

${isNameStep ? `This is a CHARACTER NAME question. The user should provide a name.
- If the answer contains BOTH a name AND a relationship/role (e.g., "his grandmother Nida", "my best friend Jake", "her mother Clara"), extract BOTH.
- If only a name is given (e.g., "Nida", "Jake"), extract just the name.
- Clean up: capitalize the name properly, remove possessives ("his", "her", "my"), remove articles.
- For answer: {"intent":"answer","name":"extracted name","role":"extracted role or null"}
- For skip: {"intent":"skip"}` : `This is a GENERAL question. Extract the meaningful value.
- Clean up the answer: remove filler words, fix capitalization if it is a name or place.
- For answer: {"intent":"answer","value":"cleaned answer"}
- For skip: {"intent":"skip"}`}`;

    const userMsg = `Question: "${question}"\nUser's answer: "${answer}"`;

    const result = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMsg },
      ],
      { temperature: 0.1, maxTokens: 150 }
    );

    let content = result.content.trim();
    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    try {
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({ intent: 'answer', name: answer, value: answer });
    }
  } catch (err) {
    console.error('Parse error:', err);
    return NextResponse.json({ intent: 'answer', name: undefined, value: undefined });
  }
}
