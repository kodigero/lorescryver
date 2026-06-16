/**
 * DeepSeek API client — OpenAI-compatible format
 * Uses V4 Flash (non-thinking mode) for cost efficiency
 */

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
const DEFAULT_TIMEOUT_MS = 30000;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  id: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<{ content: string; usage: DeepSeekResponse['usage'] }> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not set');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
    }),
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    // Read error body but never log it raw — it may contain the API key
    const errorBody = await response.text().catch(() => 'Unable to read error body');
    const safeError = errorBody.slice(0, 200).replace(/sk-[a-zA-Z0-9]+/g, '[REDACTED]');
    console.error(`DeepSeek API error (${response.status}): ${safeError}`);
    throw new Error(`AI service error (${response.status}). Please try again.`);
  }

  const data: DeepSeekResponse = await response.json();
  const choice = data.choices[0];

  if (!choice) {
    throw new Error('No response from DeepSeek');
  }

  return {
    content: choice.message.content,
    usage: data.usage,
  };
}
