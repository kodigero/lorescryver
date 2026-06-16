import { z } from 'zod';
import { ProjectType, DeliveryFormat, ProjectStatus, Phase, Stage, ChapterStatus } from '@prisma/client';

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
  ProjectStatus.IDEATION,
  ProjectStatus.DRAFTING,
  ProjectStatus.REVISION,
  ProjectStatus.PUBLISHED,
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
  type: z.nativeEnum(ProjectType).default(ProjectType.FOUNDATION),
  deliveryFormat: z.nativeEnum(DeliveryFormat).optional(),
  wordCountGoal: z.number().int().positive().max(10000000).optional().default(80000),
});

export const updateProjectSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  type: z.nativeEnum(ProjectType).optional(),
  deliveryFormat: z.nativeEnum(DeliveryFormat).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
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

export const stagingPhases = [Phase.CONCEPT, Phase.CANDIDATE, Phase.CANON] as const;
export const stagingStages = [
  Stage.BRAINSTORM,
  Stage.RESEARCH,
  Stage.REFERENCE,
  Stage.CANON_STRESS_TEST,
  Stage.EXPANSION_STRESS_TEST,
  Stage.LOCKED,
] as const;

export type StagingPhase = typeof stagingPhases[number];
export type StagingStage = typeof stagingStages[number];

export const stagingPhaseStageMap: Record<StagingPhase, readonly StagingStage[]> = {
  [Phase.CONCEPT]: [Stage.BRAINSTORM, Stage.RESEARCH, Stage.REFERENCE],
  [Phase.CANDIDATE]: [Stage.CANON_STRESS_TEST, Stage.EXPANSION_STRESS_TEST],
  [Phase.CANON]: [Stage.LOCKED],
};

export function isValidStagingPhaseStage(
  phase: string,
  stage: string
) {
  const allowedStages = stagingPhaseStageMap[phase as StagingPhase];
  return Boolean(allowedStages?.includes(stage as StagingStage));
}

export const assistRequestSchema = z.object({
  messages: z.array(chatMessageSchema).max(30),
  context: z.object({
    question: z.string().min(1).max(1000),
    choices: z.array(z.string().min(1).max(120)).max(20).optional(),
    protagonistName: z.string().max(120).optional(),
    protagonistGender: z.string().max(40).optional(),
    antagonistName: z.string().max(120).optional(),
  }),
});

export const parseRequestSchema = z.object({
  stepId: z.string().min(1).max(120),
  question: z.string().min(1).max(1000),
  answer: z.string().min(1).max(4000),
});

const wizardStringField = z.string().max(4000).optional().default('');

export const wizardDataSchema = z.object({
  protagonistName: wizardStringField,
  protagonistGender: wizardStringField,
  supportingCharacters: wizardStringField,
  antagonist: wizardStringField,
  scopeLocation: wizardStringField,
  scopeTime: wizardStringField,
  scopeInstallments: wizardStringField,
  conflictMain: wizardStringField,
  conflictCause: wizardStringField,
  conflictReason: wizardStringField,
  conflictImportance: wizardStringField,
  conflictOutcome: wizardStringField,
  outlineBegin: wizardStringField,
  outlineConflictStart: wizardStringField,
  outlineResolution: wizardStringField,
  outlineEnding: wizardStringField,
  notes: z.array(z.string().max(4000)).max(20).optional().default([]),
});

export const consolidateRequestSchema = z.object({
  projectId: z.string().min(1),
  previewOnly: z.boolean().optional().default(false),
  wizardData: wizardDataSchema,
});

export const brainstormRequestSchema = z.object({
  messages: z.array(chatMessageSchema).max(100),
  projectId: z.string().min(1),
  conceptId: z.string().min(1).optional(),
});

export const createStagingConceptSchema = z.object({
  phase: z.nativeEnum(Phase).optional().default(Phase.CONCEPT),
  stage: z.nativeEnum(Stage).optional(),
});

export const updateStagingConceptSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  summary: z.string().max(20000).optional(),
  phase: z.nativeEnum(Phase).optional(),
  stage: z.nativeEnum(Stage).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  messages: z.array(chatMessageSchema).max(100).optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required',
});

export const createChapterSchema = z.object({
  title: z.string().trim().min(1).max(200),
  order: z.number().int().nonnegative(),
  content: z.record(z.string(), z.any()).optional(),
  wordCount: z.number().int().nonnegative().optional(),
  status: z.nativeEnum(ChapterStatus).optional(),
});

export const updateChapterSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  order: z.number().int().nonnegative().optional(),
  content: z.record(z.string(), z.any()).optional(),
  wordCount: z.number().int().nonnegative().optional(),
  status: z.nativeEnum(ChapterStatus).optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required',
});

export const createBibleEntrySchema = z.object({
  type: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(200),
  description: z.string().max(10000).optional().default(''),
  properties: z.record(z.string(), z.any()).optional().default({}),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional().default([]),
});

export const updateBibleEntrySchema = z.object({
  type: z.string().trim().min(1).max(50).optional(),
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(10000).optional(),
  properties: z.record(z.string(), z.any()).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required',
});

export function validationError() {
  return { error: 'Invalid request body' };
}

