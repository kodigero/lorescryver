import type { Project as PrismaProject } from '@prisma/client';

export type Project = Omit<PrismaProject, 'createdAt' | 'updatedAt' | 'wordCountGoal'> & {
  wordCountGoal: number | null;
  createdAt: string;
  updatedAt: string;
};

