export interface WizardStep {
  id: string;
  question: string;
  placeholder: string;
  choices?: string[];
  multiline?: boolean;
}

export interface WizardData {
  protagonistName: string;
  protagonistGender: string;
  supportingCharacters: string;
  antagonist: string;
  scopeLocation: string;
  scopeTime: string;
  scopeInstallments: string;
  conflictMain: string;
  conflictCause: string;
  conflictReason: string;
  conflictImportance: string;
  conflictOutcome: string;
  outlineBegin: string;
  outlineConflictStart: string;
  outlineResolution: string;
  outlineEnding: string;
  notes: string[];
}

export interface CardDef {
  key: string;
  title: string;
  placeholder: string;
  rows: number;
}

export interface NextResult {
  data: WizardData;
  step: WizardStep | null;
  phase: number;
}

export interface HistoryEntry {
  step: WizardStep;
  data: WizardData;
  phase: number;
}

export interface ScryveMsg {
  role: 'user' | 'assistant';
  content: string;
}

export type SaveState = 'idle' | 'saving' | 'saved';

/* -- Constants -- */

export const INITIAL_DATA: WizardData = {
  protagonistName: '',
  protagonistGender: '',
  supportingCharacters: '',
  antagonist: '',
  scopeLocation: '',
  scopeTime: '',
  scopeInstallments: '',
  conflictMain: '',
  conflictCause: '',
  conflictReason: '',
  conflictImportance: '',
  conflictOutcome: '',
  outlineBegin: '',
  outlineConflictStart: '',
  outlineResolution: '',
  outlineEnding: '',
  notes: [],
};

export const PHASES = ['Characters', 'Scope', 'Conflict', 'Outline', 'Synopsis'];

export const cards: CardDef[] = [
  { key: 'summary.main_characters', title: 'Main Characters', placeholder: 'Key characters and their connections...', rows: 6 },
  { key: 'summary.scope', title: 'Scope', placeholder: 'Scale and boundaries of the story world...', rows: 3 },
  { key: 'summary.main_conflict', title: 'Main Conflict', placeholder: 'Central dramatic tension...', rows: 4 },
  { key: 'summary.outline_overview', title: 'Outline Overview', placeholder: 'High-level story structure...', rows: 8 },
  { key: 'summary.synopsis', title: 'Synopsis', placeholder: 'Working summary of your story...', rows: 6 },
];

/* -- Helpers -- */

export function cloneData(d: WizardData): WizardData {
  return { ...d, notes: [...d.notes] };
}

/* -- State Machine -- */

export function processAnswer(stepId: string, answer: string, data: WizardData): NextResult {
  const d = cloneData(data);
  const n = d.protagonistName;

  switch (stepId) {
    // -- Characters (Phase 0) --
    case 'protagonist_name': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'protagonist_name', question: 'Who is the main protagonist of the story?', placeholder: 'e.g. Kaizer de Luna' }, phase: 0 };
      d.protagonistName = answer;
      return { data: d, step: { id: 'protagonist_gender', question: `Is ${answer} male or female?`, placeholder: '', choices: ['Male', 'Female'] }, phase: 0 };
    }
    case 'protagonist_gender': {
      d.protagonistGender = answer.toLowerCase();
      return { data: d, step: { id: 'supporting_characters', question: 'Who are the key supporting characters?', placeholder: 'e.g. Nida (grandmother), Jake (best friend), Clara (rival)...', multiline: true }, phase: 0 };
    }
    case 'supporting_characters': {
      if (answer !== '__SKIP__') d.supportingCharacters = answer;
      return { data: d, step: { id: 'antagonist', question: 'Who or what is the main antagonist of the story?', placeholder: 'e.g. Lord Varen, the plague, society...' }, phase: 0 };
    }
    case 'antagonist': {
      if (answer !== '__SKIP__') d.antagonist = answer;
      return { data: d, step: { id: 'checkpoint_characters', question: 'Characters complete! What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Scope'] }, phase: 0 };
    }
    case 'checkpoint_characters': {
      if (answer === 'Add More') return { data: d, step: { id: 'add_info_characters', question: 'What else should I know about the characters?', placeholder: 'Type anything you want to add...', multiline: true }, phase: 0 };
      return { data: d, step: { id: 'scope_location', question: 'Where does the story take place?', placeholder: 'e.g. Tokyo, Mars, Winterfell...' }, phase: 1 };
    }
    case 'add_info_characters': {
      if (answer !== '__SKIP__') d.notes.push(`Characters: ${answer}`);
      return { data: d, step: { id: 'checkpoint_characters', question: 'What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Scope'] }, phase: 0 };
    }

    // -- Scope (Phase 1) --
    case 'scope_location': {
      if (answer !== '__SKIP__') d.scopeLocation = answer;
      return { data: d, step: { id: 'scope_time', question: 'When does the story take place?', placeholder: 'e.g. medieval era, 1942 to present, from the dawn of time...' }, phase: 1 };
    }
    case 'scope_time': {
      if (answer !== '__SKIP__') d.scopeTime = answer;
      return { data: d, step: { id: 'scope_installments', question: 'Is this a standalone project or does it span multiple installments?', placeholder: 'e.g. standalone, trilogy, ongoing series...' }, phase: 1 };
    }
    case 'scope_installments': {
      if (answer !== '__SKIP__') d.scopeInstallments = answer;
      return { data: d, step: { id: 'checkpoint_scope', question: 'Scope complete! What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Conflict'] }, phase: 1 };
    }
    case 'checkpoint_scope': {
      if (answer === 'Add More') return { data: d, step: { id: 'add_info_scope', question: 'What else about the world?', placeholder: 'Type anything you want to add...', multiline: true }, phase: 1 };
      return { data: d, step: { id: 'conflict_main', question: `What is the final conflict that ${n} needs to resolve?`, placeholder: 'e.g. overthrow the tyrant, survive the plague...' }, phase: 2 };
    }
    case 'add_info_scope': {
      if (answer !== '__SKIP__') d.notes.push(`Scope: ${answer}`);
      return { data: d, step: { id: 'checkpoint_scope', question: 'What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Conflict'] }, phase: 1 };
    }

    // -- Conflict (Phase 2) --
    case 'conflict_main': {
      if (answer !== '__SKIP__') d.conflictMain = answer;
      return { data: d, step: { id: 'conflict_cause', question: 'Who or what caused it?', placeholder: 'e.g. a betrayal, an ancient curse, greed...' }, phase: 2 };
    }
    case 'conflict_cause': {
      if (answer !== '__SKIP__') d.conflictCause = answer;
      return { data: d, step: { id: 'conflict_reason', question: 'What is the real reason for the conflict?', placeholder: 'e.g. a power struggle, forbidden love, survival...' }, phase: 2 };
    }
    case 'conflict_reason': {
      if (answer !== '__SKIP__') d.conflictReason = answer;
      return { data: d, step: { id: 'conflict_importance', question: `Why is it important for ${n} to win or lose?`, placeholder: 'e.g. the fate of the kingdom, personal redemption...' }, phase: 2 };
    }
    case 'conflict_importance': {
      if (answer !== '__SKIP__') d.conflictImportance = answer;
      return { data: d, step: { id: 'conflict_outcome', question: `Does ${n} win or lose in the final ending?`, placeholder: 'e.g. wins at great cost, loses everything, bittersweet...' }, phase: 2 };
    }
    case 'conflict_outcome': {
      if (answer !== '__SKIP__') d.conflictOutcome = answer;
      return { data: d, step: { id: 'checkpoint_conflict', question: 'Conflict complete! What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Outline'] }, phase: 2 };
    }
    case 'checkpoint_conflict': {
      if (answer === 'Add More') return { data: d, step: { id: 'add_info_conflict', question: 'What else about the conflict?', placeholder: 'Type anything you want to add...', multiline: true }, phase: 2 };
      return { data: d, step: { id: 'outline_begin', question: 'How does the story begin?', placeholder: 'e.g. a peaceful village, a funeral, a heist gone wrong...' }, phase: 3 };
    }
    case 'add_info_conflict': {
      if (answer !== '__SKIP__') d.notes.push(`Conflict: ${answer}`);
      return { data: d, step: { id: 'checkpoint_conflict', question: 'What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Outline'] }, phase: 2 };
    }

    // -- Outline (Phase 3) --
    case 'outline_begin': {
      if (answer !== '__SKIP__') d.outlineBegin = answer;
      return { data: d, step: { id: 'outline_conflict_start', question: 'How does the conflict start?', placeholder: 'e.g. a murder, a declaration of war, a discovery...' }, phase: 3 };
    }
    case 'outline_conflict_start': {
      if (answer !== '__SKIP__') d.outlineConflictStart = answer;
      return { data: d, step: { id: 'outline_resolution', question: 'How is the conflict resolved?', placeholder: 'e.g. a final battle, a sacrifice, a revelation...' }, phase: 3 };
    }
    case 'outline_resolution': {
      if (answer !== '__SKIP__') d.outlineResolution = answer;
      return { data: d, step: { id: 'outline_ending', question: 'How does the story end?', placeholder: 'e.g. a new beginning, a tragic farewell, peace restored...' }, phase: 3 };
    }
    case 'outline_ending': {
      if (answer !== '__SKIP__') d.outlineEnding = answer;
      return { data: d, step: { id: 'checkpoint_outline', question: 'Outline complete! What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Finish'] }, phase: 3 };
    }
    case 'checkpoint_outline': {
      if (answer === 'Add More') return { data: d, step: { id: 'add_info_outline', question: 'What else about the plot?', placeholder: 'Type anything you want to add...', multiline: true }, phase: 3 };
      return { data: d, step: null, phase: 4 };
    }
    case 'add_info_outline': {
      if (answer !== '__SKIP__') d.notes.push(`Outline: ${answer}`);
      return { data: d, step: { id: 'checkpoint_outline', question: 'What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Finish'] }, phase: 3 };
    }

    default:
      return { data: d, step: null, phase: 4 };
  }
}
