export interface Project {
  id: string;
  title: string;
  genre: string;
  status: ProjectStatus;
  wordCountGoal: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStatus =
  | 'ideation'
  | 'drafting'
  | 'editing'
  | 'compiling'
  | 'publishing'
  | 'published';
