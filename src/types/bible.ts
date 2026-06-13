// Series Bible entity types

export interface BibleEntry {
  id: string;
  projectId: string;
  type: BibleEntryType;
  name: string;
  description: string;
  properties: Record<string, unknown>;
  tags: string[];
  linkedEntries: string[]; // IDs of related entries
  createdAt: Date;
  updatedAt: Date;
}

export type BibleEntryType =
  | 'character'
  | 'location'
  | 'faction'
  | 'item'
  | 'magic_system'
  | 'event'
  | 'timeline'
  | 'lore'
  | 'custom';
