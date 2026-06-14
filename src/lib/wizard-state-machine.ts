export interface WizardStep {
  id: string;
  question: string;
  placeholder: string;
  choices?: string[];
}

export interface CharEntry {
  name: string;
  gender: string;
  relationship: string;
  roles: string[];
}

export interface WizardData {
  protagonistName: string;
  protagonistGender: string;
  protagonistOccupation: string;
  protagonistLocation: string;
  characters: CharEntry[];
  antagonistName: string;
  antagonistIsCharacter: boolean;
  antagonistGender: string;
  scopeLocation: string;
  scopeTime: string;
  scopeInstallments: string;
  conflictWant: string;
  conflictStakes: string;
  outlineBefore: string;
  outlineTurning: string;
  outlineEnding: string;
  notes: string[];
  _temp: string;
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
  transitions: string[];
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

export interface ParsedResponse {
  intent: 'answer' | 'skip';
  name?: string;
  role?: string;
  value?: string;
}

export type SaveState = 'idle' | 'saving' | 'saved';

/* ── Constants ── */

export const INITIAL_DATA: WizardData = {
  protagonistName: '',
  protagonistGender: '',
  protagonistOccupation: '',
  protagonistLocation: '',
  characters: [],
  antagonistName: '',
  antagonistIsCharacter: false,
  antagonistGender: '',
  scopeLocation: '',
  scopeTime: '',
  scopeInstallments: '',
  conflictWant: '',
  conflictStakes: '',
  outlineBefore: '',
  outlineTurning: '',
  outlineEnding: '',
  notes: [],
  _temp: '',
};

export const PHASES = ['Characters', 'Scope', 'Conflict', 'Outline', 'Synopsis'];

export const cards: CardDef[] = [
  { key: 'summary.main_characters', title: 'Main Characters', placeholder: 'Key characters and their connections...', rows: 6 },
  { key: 'summary.scope', title: 'Scope', placeholder: 'Scale and boundaries of the story world...', rows: 3 },
  { key: 'summary.main_conflict', title: 'Main Conflict', placeholder: 'Central dramatic tension...', rows: 4 },
  { key: 'summary.outline_overview', title: 'Outline Overview', placeholder: 'High-level story structure...', rows: 8 },
  { key: 'summary.synopsis', title: 'Synopsis', placeholder: 'Working summary of your story...', rows: 6 },
];

export const NAME_STEPS = new Set([
  'important_person', 'role_model', 'confidant', 'anchor', 'enemy',
  'antagonist', 'extra_name', 'antagonist_ally',
]);

/* ── Helpers ── */

export function cloneData(d: WizardData): WizardData {
  return {
    ...d,
    characters: d.characters.map(c => ({ ...c, roles: [...c.roles] })),
    notes: [...d.notes],
  };
}

/* ── State Machine ── */

export function processAnswer(stepId: string, answer: string, data: WizardData, parsedRole?: string): NextResult {
  const d = cloneData(data);
  const n = d.protagonistName;
  const obj = d.protagonistGender === 'female' ? 'her' : 'him';
  const findChar = (name: string) => d.characters.find(c => c.name.toLowerCase() === name.toLowerCase());

  switch (stepId) {
    case 'protagonist_name': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'protagonist_name', question: 'Every story needs a hero! What is your protagonist\'s name?', placeholder: 'a name' }, transitions: [], phase: 0 };
      d.protagonistName = answer;
      return { data: d, step: { id: 'protagonist_gender', question: `Is ${answer} male or female?`, placeholder: '', choices: ['Male', 'Female'] }, transitions: [], phase: 0 };
    }
    case 'protagonist_gender': {
      d.protagonistGender = answer.toLowerCase();
      return { data: d, step: { id: 'protagonist_occupation', question: `What does ${d.protagonistName} do?`, placeholder: 'detective, blacksmith, student...' }, transitions: [], phase: 0 };
    }
    case 'protagonist_occupation': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'protagonist_location', question: `Where does ${d.protagonistName} live?`, placeholder: 'Tokyo, Mars, Winterfell...' }, transitions: [], phase: 0 };
      d.protagonistOccupation = answer;
      return { data: d, step: { id: 'protagonist_location', question: `Where does ${d.protagonistName} live?`, placeholder: 'Tokyo, Mars, Winterfell...' }, transitions: [], phase: 0 };
    }
    case 'protagonist_location': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'important_person', question: `Who is the most important person in ${d.protagonistName}'s life?`, placeholder: 'a name' }, transitions: [], phase: 0 };
      d.protagonistLocation = answer;
      return { data: d, step: { id: 'important_person', question: `Who is the most important person in ${d.protagonistName}'s life?`, placeholder: 'a name' }, transitions: [], phase: 0 };
    }
    case 'important_person': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'role_model', question: `Who does ${n} look up to as a role model?`, placeholder: 'a name' }, transitions: [], phase: 0 };
      d._temp = answer;
      const ex = findChar(answer);
      if (ex) { ex.roles.push('important_person'); d._temp = ''; return { data: d, step: { id: 'role_model', question: `Who does ${n} look up to as a role model?`, placeholder: 'a name' }, transitions: [], phase: 0 }; }
      if (parsedRole) { d.characters.push({ name: answer, gender: '', relationship: parsedRole, roles: ['important_person'] }); d._temp = ''; return { data: d, step: { id: 'role_model', question: `Who does ${n} look up to as a role model?`, placeholder: 'a name' }, transitions: [], phase: 0 }; }
      return { data: d, step: { id: 'important_person_rel', question: `What is ${answer} to ${obj}?`, placeholder: 'mother, wife, mentor...' }, transitions: [], phase: 0 };
    }
    case 'important_person_rel': {
      if (answer === '__SKIP__') { d.characters.push({ name: d._temp, gender: '', relationship: '', roles: ['important_person'] }); d._temp = ''; return { data: d, step: { id: 'role_model', question: `Who does ${n} look up to as a role model?`, placeholder: 'a name' }, transitions: [], phase: 0 }; }
      d.characters.push({ name: d._temp, gender: '', relationship: answer, roles: ['important_person'] }); d._temp = '';
      return { data: d, step: { id: 'role_model', question: `Who does ${n} look up to as a role model?`, placeholder: 'a name' }, transitions: [], phase: 0 };
    }
    case 'role_model': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'confidant', question: `Who knows ${n}'s darkest secrets?`, placeholder: 'a name' }, transitions: [], phase: 0 };
      d._temp = answer;
      const ex = findChar(answer);
      if (ex) { ex.roles.push('role_model'); d._temp = ''; return { data: d, step: { id: 'confidant', question: `Who knows ${n}'s darkest secrets?`, placeholder: 'a name' }, transitions: [], phase: 0 }; }
      if (parsedRole) { d.characters.push({ name: answer, gender: '', relationship: parsedRole, roles: ['role_model'] }); d._temp = ''; return { data: d, step: { id: 'confidant', question: `Who knows ${n}'s darkest secrets?`, placeholder: 'a name' }, transitions: [], phase: 0 }; }
      return { data: d, step: { id: 'role_model_rel', question: `What is ${answer} to ${obj}?`, placeholder: 'father, teacher, captain...' }, transitions: [], phase: 0 };
    }
    case 'role_model_rel': {
      if (answer === '__SKIP__') { d.characters.push({ name: d._temp, gender: '', relationship: '', roles: ['role_model'] }); d._temp = ''; return { data: d, step: { id: 'confidant', question: `Who knows ${n}'s darkest secrets?`, placeholder: 'a name' }, transitions: [], phase: 0 }; }
      d.characters.push({ name: d._temp, gender: '', relationship: answer, roles: ['role_model'] }); d._temp = '';
      return { data: d, step: { id: 'confidant', question: `Who knows ${n}'s darkest secrets?`, placeholder: 'a name' }, transitions: [], phase: 0 };
    }
    case 'confidant': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'anchor', question: `Who keeps ${n} grounded when things get tough?`, placeholder: 'a name' }, transitions: [], phase: 0 };
      d._temp = answer;
      const ex = findChar(answer);
      if (ex) { ex.roles.push('confidant'); d._temp = ''; return { data: d, step: { id: 'anchor', question: `Who keeps ${n} grounded when things get tough?`, placeholder: 'a name' }, transitions: [], phase: 0 }; }
      if (parsedRole) { d.characters.push({ name: answer, gender: '', relationship: parsedRole, roles: ['confidant'] }); d._temp = ''; return { data: d, step: { id: 'anchor', question: `Who keeps ${n} grounded when things get tough?`, placeholder: 'a name' }, transitions: [], phase: 0 }; }
      return { data: d, step: { id: 'confidant_rel', question: `What is ${answer} to ${obj}?`, placeholder: 'best friend, sister, partner...' }, transitions: [], phase: 0 };
    }
    case 'confidant_rel': {
      if (answer === '__SKIP__') { d.characters.push({ name: d._temp, gender: '', relationship: '', roles: ['confidant'] }); d._temp = ''; return { data: d, step: { id: 'anchor', question: `Who keeps ${n} grounded when things get tough?`, placeholder: 'a name' }, transitions: [], phase: 0 }; }
      d.characters.push({ name: d._temp, gender: '', relationship: answer, roles: ['confidant'] }); d._temp = '';
      return { data: d, step: { id: 'anchor', question: `Who keeps ${n} grounded when things get tough?`, placeholder: 'a name' }, transitions: [], phase: 0 };
    }
    case 'anchor': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'enemy', question: `Who does ${n} hate the most?`, placeholder: 'a name' }, transitions: [], phase: 0 };
      d._temp = answer;
      const ex = findChar(answer);
      if (ex) { ex.roles.push('anchor'); d._temp = ''; return { data: d, step: { id: 'enemy', question: `Who does ${n} hate the most?`, placeholder: 'a name' }, transitions: [], phase: 0 }; }
      if (parsedRole) { d.characters.push({ name: answer, gender: '', relationship: parsedRole, roles: ['anchor'] }); d._temp = ''; return { data: d, step: { id: 'enemy', question: `Who does ${n} hate the most?`, placeholder: 'a name' }, transitions: [], phase: 0 }; }
      return { data: d, step: { id: 'anchor_rel', question: `What is ${answer} to ${obj}?`, placeholder: 'grandmother, coach, lover...' }, transitions: [], phase: 0 };
    }
    case 'anchor_rel': {
      if (answer === '__SKIP__') { d.characters.push({ name: d._temp, gender: '', relationship: '', roles: ['anchor'] }); d._temp = ''; return { data: d, step: { id: 'enemy', question: `Who does ${n} hate the most?`, placeholder: 'a name' }, transitions: [], phase: 0 }; }
      d.characters.push({ name: d._temp, gender: '', relationship: answer, roles: ['anchor'] }); d._temp = '';
      return { data: d, step: { id: 'enemy', question: `Who does ${n} hate the most?`, placeholder: 'a name' }, transitions: [], phase: 0 };
    }
    case 'enemy': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'antagonist', question: `Who or what is working against ${n}?`, placeholder: 'a name or force' }, transitions: [], phase: 0 };
      d._temp = answer;
      const ex = findChar(answer);
      if (ex) { ex.roles.push('enemy'); d._temp = ''; return { data: d, step: { id: 'antagonist', question: `Who or what is working against ${n}?`, placeholder: 'a name or force' }, transitions: [], phase: 0 }; }
      if (parsedRole) { d.characters.push({ name: answer, gender: '', relationship: parsedRole, roles: ['enemy'] }); d._temp = ''; return { data: d, step: { id: 'antagonist', question: `Who or what is working against ${n}?`, placeholder: 'a name or force' }, transitions: [], phase: 0 }; }
      return { data: d, step: { id: 'enemy_rel', question: `What is ${answer} to ${obj}?`, placeholder: 'rival, bully, ex-partner...' }, transitions: [], phase: 0 };
    }
    case 'enemy_rel': {
      if (answer === '__SKIP__') { d.characters.push({ name: d._temp, gender: '', relationship: '', roles: ['enemy'] }); d._temp = ''; return { data: d, step: { id: 'antagonist', question: `Who or what is working against ${n}?`, placeholder: 'a name or force' }, transitions: [], phase: 0 }; }
      d.characters.push({ name: d._temp, gender: '', relationship: answer, roles: ['enemy'] }); d._temp = '';
      return { data: d, step: { id: 'antagonist', question: `Who or what is working against ${n}?`, placeholder: 'a name or force' }, transitions: [], phase: 0 };
    }
    case 'antagonist': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'more_characters', question: 'Anyone else who plays a major role?', placeholder: '', choices: ['Yes', 'No'] }, transitions: [], phase: 0 };
      d.antagonistName = answer;
      return { data: d, step: { id: 'antagonist_is_person', question: `Is ${answer} a person?`, placeholder: '', choices: ['Yes', 'No'] }, transitions: [], phase: 0 };
    }
    case 'antagonist_is_person': {
      if (answer.toLowerCase() === 'yes') { d.antagonistIsCharacter = true; return { data: d, step: { id: 'antagonist_gender', question: `Is ${d.antagonistName} male or female?`, placeholder: '', choices: ['Male', 'Female'] }, transitions: [], phase: 0 }; }
      d.antagonistIsCharacter = false;
      return { data: d, step: { id: 'more_characters', question: 'Anyone else who plays a major role?', placeholder: '', choices: ['Yes', 'No'] }, transitions: [], phase: 0 };
    }
    case 'antagonist_gender': {
      d.antagonistGender = answer.toLowerCase();
      const ex = findChar(d.antagonistName);
      if (ex) { ex.gender = answer.toLowerCase(); if (!ex.roles.includes('antagonist')) ex.roles.push('antagonist'); return { data: d, step: { id: 'antagonist_ally', question: `Who is ${d.antagonistName}'s most loyal ally?`, placeholder: 'a name' }, transitions: [], phase: 0 }; }
      return { data: d, step: { id: 'antagonist_rel', question: `What is ${d.antagonistName} to ${n}?`, placeholder: 'rival, tyrant, former ally...' }, transitions: [], phase: 0 };
    }
    case 'antagonist_rel': {
      if (answer === '__SKIP__') { d.characters.push({ name: d.antagonistName, gender: d.antagonistGender, relationship: '', roles: ['antagonist'] }); return { data: d, step: { id: 'antagonist_ally', question: `Who is ${d.antagonistName}'s most loyal ally?`, placeholder: 'a name' }, transitions: [], phase: 0 }; }
      d.characters.push({ name: d.antagonistName, gender: d.antagonistGender, relationship: answer, roles: ['antagonist'] });
      return { data: d, step: { id: 'antagonist_ally', question: `Who is ${d.antagonistName}'s most loyal ally?`, placeholder: 'a name' }, transitions: [], phase: 0 };
    }
    case 'antagonist_ally': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'more_characters', question: 'Anyone else who plays a major role?', placeholder: '', choices: ['Yes', 'No'] }, transitions: [], phase: 0 };
      d._temp = answer;
      if (parsedRole) { const ae = findChar(answer); if (ae) { ae.roles.push('antagonist_ally'); } else { d.characters.push({ name: answer, gender: '', relationship: `${parsedRole} (to ${d.antagonistName})`, roles: ['antagonist_ally'] }); } d._temp = ''; return { data: d, step: { id: 'more_allies', question: `Anyone else backing ${d.antagonistName}?`, placeholder: '', choices: ['Yes', 'No'] }, transitions: [], phase: 0 }; }
      return { data: d, step: { id: 'antagonist_ally_rel', question: `What is ${answer} to ${d.antagonistName}?`, placeholder: 'lieutenant, advisor, servant...' }, transitions: [], phase: 0 };
    }
    case 'antagonist_ally_rel': {
      if (answer === '__SKIP__') { const ae = findChar(d._temp); if (ae) { ae.roles.push('antagonist_ally'); } else { d.characters.push({ name: d._temp, gender: '', relationship: '', roles: ['antagonist_ally'] }); } d._temp = ''; return { data: d, step: { id: 'more_allies', question: `Anyone else backing ${d.antagonistName}?`, placeholder: '', choices: ['Yes', 'No'] }, transitions: [], phase: 0 }; }
      const ae = findChar(d._temp); if (ae) { ae.roles.push('antagonist_ally'); } else { d.characters.push({ name: d._temp, gender: '', relationship: `${answer} (to ${d.antagonistName})`, roles: ['antagonist_ally'] }); } d._temp = '';
      return { data: d, step: { id: 'more_allies', question: `Anyone else backing ${d.antagonistName}?`, placeholder: '', choices: ['Yes', 'No'] }, transitions: [], phase: 0 };
    }
    case 'more_allies': {
      if (answer.toLowerCase() === 'yes') return { data: d, step: { id: 'antagonist_ally', question: 'What is their name?', placeholder: 'a name' }, transitions: [], phase: 0 };
      return { data: d, step: { id: 'more_characters', question: 'Anyone else who plays a major role?', placeholder: '', choices: ['Yes', 'No'] }, transitions: [], phase: 0 };
    }
    case 'more_characters': {
      if (answer.toLowerCase() === 'yes') return { data: d, step: { id: 'extra_name', question: 'What is their name?', placeholder: 'a name' }, transitions: [], phase: 0 };
      return { data: d, step: { id: 'checkpoint_characters', question: 'Characters complete! What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Scope'] }, transitions: [], phase: 0 };
    }
    case 'extra_name': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'checkpoint_characters', question: 'Characters complete! What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Scope'] }, transitions: [], phase: 0 };
      d._temp = answer;
      if (parsedRole) { d.characters.push({ name: answer, gender: '', relationship: parsedRole, roles: ['other'] }); d._temp = ''; return { data: d, step: { id: 'more_characters', question: 'Anyone else?', placeholder: '', choices: ['Yes', 'No'] }, transitions: [], phase: 0 }; }
      return { data: d, step: { id: 'extra_rel', question: `What is ${answer} to ${n}?`, placeholder: 'ally, lover, stranger...' }, transitions: [], phase: 0 };
    }
    case 'extra_rel': {
      if (answer === '__SKIP__') { d.characters.push({ name: d._temp, gender: '', relationship: '', roles: ['other'] }); d._temp = ''; return { data: d, step: { id: 'more_characters', question: 'Anyone else?', placeholder: '', choices: ['Yes', 'No'] }, transitions: [], phase: 0 }; }
      d.characters.push({ name: d._temp, gender: '', relationship: answer, roles: ['other'] }); d._temp = '';
      return { data: d, step: { id: 'more_characters', question: 'Anyone else?', placeholder: '', choices: ['Yes', 'No'] }, transitions: [], phase: 0 };
    }
    case 'checkpoint_characters': {
      if (answer === 'Add More') return { data: d, step: { id: 'add_info_characters', question: 'What else should I know about the characters?', placeholder: 'Type anything you want to add...' }, transitions: [], phase: 0 };
      return { data: d, step: { id: 'scope_location', question: 'Where does this story unfold?', placeholder: 'kingdom, city, planet...' }, transitions: [], phase: 1 };
    }
    case 'add_info_characters': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'checkpoint_characters', question: 'What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Scope'] }, transitions: [], phase: 0 };
      d.notes.push(`Characters: ${answer}`);
      return { data: d, step: { id: 'checkpoint_characters', question: 'What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Scope'] }, transitions: [], phase: 0 };
    }
    case 'scope_location': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'scope_time', question: 'What time period?', placeholder: 'medieval, modern, 2185...' }, transitions: [], phase: 1 };
      d.scopeLocation = answer;
      return { data: d, step: { id: 'scope_time', question: 'What time period?', placeholder: 'medieval, modern, 2185...' }, transitions: [], phase: 1 };
    }
    case 'scope_time': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'scope_installments', question: 'Single story or series?', placeholder: 'single, trilogy, series...' }, transitions: [], phase: 1 };
      d.scopeTime = answer;
      return { data: d, step: { id: 'scope_installments', question: 'Single story or series?', placeholder: 'single, trilogy, series...' }, transitions: [], phase: 1 };
    }
    case 'scope_installments': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'checkpoint_scope', question: 'Scope complete! What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Conflict'] }, transitions: [], phase: 1 };
      d.scopeInstallments = answer;
      return { data: d, step: { id: 'checkpoint_scope', question: 'Scope complete! What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Conflict'] }, transitions: [], phase: 1 };
    }
    case 'checkpoint_scope': {
      if (answer === 'Add More') return { data: d, step: { id: 'add_info_scope', question: 'What else about the world?', placeholder: 'Type anything you want to add...' }, transitions: [], phase: 1 };
      const q = d.antagonistIsCharacter ? `What does ${d.antagonistName} want?` : d.antagonistName ? `What does ${d.antagonistName} threaten?` : `What is the main force of conflict?`;
      return { data: d, step: { id: 'conflict_want', question: q, placeholder: 'power, revenge, survival...' }, transitions: [], phase: 2 };
    }
    case 'add_info_scope': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'checkpoint_scope', question: 'What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Conflict'] }, transitions: [], phase: 1 };
      d.notes.push(`Scope: ${answer}`);
      return { data: d, step: { id: 'checkpoint_scope', question: 'What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Conflict'] }, transitions: [], phase: 1 };
    }
    case 'conflict_want': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'conflict_stakes', question: `What does ${n} stand to lose?`, placeholder: 'family, freedom, identity...' }, transitions: [], phase: 2 };
      d.conflictWant = answer;
      return { data: d, step: { id: 'conflict_stakes', question: `What does ${n} stand to lose?`, placeholder: 'family, freedom, identity...' }, transitions: [], phase: 2 };
    }
    case 'conflict_stakes': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'checkpoint_conflict', question: 'Conflict complete! What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Outline'] }, transitions: [], phase: 2 };
      d.conflictStakes = answer;
      return { data: d, step: { id: 'checkpoint_conflict', question: 'Conflict complete! What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Outline'] }, transitions: [], phase: 2 };
    }
    case 'checkpoint_conflict': {
      if (answer === 'Add More') return { data: d, step: { id: 'add_info_conflict', question: 'What else about the conflict?', placeholder: 'Type anything you want to add...' }, transitions: [], phase: 2 };
      return { data: d, step: { id: 'outline_before', question: `What is ${n}'s life like before the conflict?`, placeholder: 'peaceful, chaotic, mundane...' }, transitions: [], phase: 3 };
    }
    case 'add_info_conflict': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'checkpoint_conflict', question: 'What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Outline'] }, transitions: [], phase: 2 };
      d.notes.push(`Conflict: ${answer}`);
      return { data: d, step: { id: 'checkpoint_conflict', question: 'What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Outline'] }, transitions: [], phase: 2 };
    }
    case 'outline_before': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'outline_turning', question: 'What triggers the turning point?', placeholder: 'betrayal, discovery, death...' }, transitions: [], phase: 3 };
      d.outlineBefore = answer;
      return { data: d, step: { id: 'outline_turning', question: 'What triggers the turning point?', placeholder: 'betrayal, discovery, death...' }, transitions: [], phase: 3 };
    }
    case 'outline_turning': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'outline_ending', question: 'How does it end?', placeholder: 'victory, sacrifice, escape...' }, transitions: [], phase: 3 };
      d.outlineTurning = answer;
      return { data: d, step: { id: 'outline_ending', question: 'How does it end?', placeholder: 'victory, sacrifice, escape...' }, transitions: [], phase: 3 };
    }
    case 'outline_ending': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'checkpoint_outline', question: 'Outline complete! What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Finish'] }, transitions: [], phase: 3 };
      d.outlineEnding = answer;
      return { data: d, step: { id: 'checkpoint_outline', question: 'Outline complete! What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Finish'] }, transitions: [], phase: 3 };
    }
    case 'checkpoint_outline': {
      if (answer === 'Add More') return { data: d, step: { id: 'add_info_outline', question: 'What else about the plot?', placeholder: 'Type anything you want to add...' }, transitions: [], phase: 3 };
      return { data: d, step: null, transitions: [], phase: 4 };
    }
    case 'add_info_outline': {
      if (answer === '__SKIP__') return { data: d, step: { id: 'checkpoint_outline', question: 'What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Finish'] }, transitions: [], phase: 3 };
      d.notes.push(`Outline: ${answer}`);
      return { data: d, step: { id: 'checkpoint_outline', question: 'What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Finish'] }, transitions: [], phase: 3 };
    }
    default:
      return { data: d, step: null, transitions: [], phase: 4 };
  }
}

