import { describe, it, expect } from 'vitest';
import { createProjectSchema, authRegisterSchema, consolidateRequestSchema } from '@/lib/validation';

describe('createProjectSchema', () => {
  it('accepts valid project data', () => {
    const result = createProjectSchema.safeParse({ title: 'My Novel' });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = createProjectSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
  });

  it('applies default projectType and wordCountGoal', () => {
    const result = createProjectSchema.safeParse({ title: 'Test' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.projectType).toBe('novel');
      expect(result.data.wordCountGoal).toBe(80000);
    }
  });
});

describe('authRegisterSchema', () => {
  it('normalizes email to lowercase', () => {
    const result = authRegisterSchema.safeParse({
      email: 'Test@Example.COM',
      password: 'password123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('test@example.com');
    }
  });

  it('rejects password shorter than 8 chars', () => {
    const result = authRegisterSchema.safeParse({
      email: 'test@example.com',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });
});

describe('consolidateRequestSchema', () => {
  it('validates wizardData fields with proper types', () => {
    const result = consolidateRequestSchema.safeParse({
      projectId: 'test-id',
      wizardData: {
        protagonistName: 'Kaizer',
        protagonistGender: 'male',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects wizardData string fields exceeding max length', () => {
    const result = consolidateRequestSchema.safeParse({
      projectId: 'test-id',
      wizardData: {
        protagonistName: 'x'.repeat(4001),
      },
    });
    expect(result.success).toBe(false);
  });
});
