export interface Chapter {
  id: string;
  projectId: string;
  title: string;
  order: number;
  content: string; // ProseMirror JSON
  wordCount: number;
  status: ChapterStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ChapterStatus =
  | 'outline'
  | 'draft'
  | 'revision'
  | 'polished'
  | 'published';
