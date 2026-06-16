/**
 * Sanitize user-provided strings before injecting them into AI prompts.
 * Prevents prompt injection by stripping dangerous patterns.
 */

/**
 * Strip common prompt injection patterns from user input
 * before including it in system/user prompts sent to the AI.
 */
export function sanitizeForPrompt(input: string): string {
  if (!input) return input;

  return input
    // Strip attempts to override system instructions
    .replace(/(?:ignore|forget|disregard)\s+(?:all\s+)?(?:previous|above|prior)\s+(?:instructions?|rules?|prompts?)/gi, '[removed]')
    // Strip attempts to impersonate system messages
    .replace(/(?:^|\n)\s*(?:system|SYSTEM)\s*:/gm, '[removed]:')
    // Strip XML-style injection tags
    .replace(/<\/?(?:system|instruction|prompt|ignore|override)[^>]*>/gi, '[removed]')
    // Strip markdown heading-based injection attempts
    .replace(/^#{1,6}\s*(?:system|instruction|new\s+instructions?)/gim, '[removed]')
    // Limit total length to prevent context stuffing
    .slice(0, 10000);
}

/**
 * Sanitize an object's string values for prompt injection.
 * Recursively processes nested objects and arrays.
 */
export function sanitizeObjectForPrompt<T>(obj: T): T {
  if (typeof obj === 'string') return sanitizeForPrompt(obj) as T;
  if (Array.isArray(obj)) return obj.map(sanitizeObjectForPrompt) as T;
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeObjectForPrompt(value);
    }
    return result as T;
  }
  return obj;
}
