import { z } from 'zod';

export const projectTypes = [
  'novel',
  'novella',
  'short_story',
  'screenplay',
  'tv_series',
  'web_series',
  'stage_play',
  'musical',
  'video_game',
  'visual_novel',
  'animation',
  'comic',
  'manga',
  'podcast',
  'tabletop_rpg',
  'interactive_fiction',
  'poetry',
  'nonfiction',
  'other',
] as const;

export const projectStatuses = [
  'ideation',
  'drafting',
  'editing',
  'polishing',
  'complete',
] as const;

export const summarySectionKeys = [
  'summary.main_characters',
  'summary.scope',
  'summary.main_conflict',
  'summary.outline_overview',
  'summary.synopsis',
] as const;

export const createProjectSchema = z.object({
  title: z.string().trim().min(1).max(200),
  projectType: z.enum(projectTypes).default('novel'),
  wordCountGoal: z.number().int().positive().max(10000000).default(80000),
});

export const updateProjectSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  projectType: z.enum(projectTypes).optional(),
  status: z.enum(projectStatuses).optional(),
  wordCountGoal: z.number().int().positive().max(10000000).optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required',
});

export const sectionWriteSchema = z.object({
  key: z.string().trim().regex(/^[a-z][a-z0-9_.-]{1,80}$/),
  content: z.string().max(50000),
});

export const authRegisterSchema = z.object({
  name: z.string().trim().max(120).optional(),
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});

export const authLoginSchema = z.object({
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
});

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(8000),
});

export const assistRequestSchema = z.object({
  messages: z.array(chatMessageSchema).max(30),
  context: z.object({
    question: z.string().min(1).max(1000),
    choices: z.array(z.string().min(1).max(120)).max(20).optional(),
    protagonistName: z.string().max(120).optional(),
    protagonistGender: z.string().max(40).optional(),
    antagonistName: z.string().max(120).optional(),
  }).passthrough(),
});

export const parseRequestSchema = z.object({
  stepId: z.string().min(1).max(120),
  question: z.string().min(1).max(1000),
  answer: z.string().min(1).max(4000),
});

export const consolidateRequestSchema = z.object({
  projectId: z.string().min(1),
  previewOnly: z.boolean().optional().default(false),
  wizardData: z.object({}).passthrough(),
});

export const brainstormRequestSchema = z.object({
  messages: z.array(chatMessageSchema).max(100),
  projectId: z.string().min(1),
  conceptId: z.string().min(1).optional(),
});

export function validationError() {
  return { error: 'Invalid request body' };
}
