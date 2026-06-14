'use client';

import { useState, useEffect, useCallback, useRef, Fragment } from 'react';

/* ── Icons ── */

function ScryveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/* ── Types ── */

interface WizardStep {
  id: string;
  question: string;
  placeholder: string;
  choices?: string[];
}

interface CharEntry {
  name: string;
  gender: string;
  relationship: string;
  roles: string[];
}

interface WizardData {
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

interface CardDef {
  key: string;
  title: string;
  placeholder: string;
  rows: number;
}

interface NextResult {
  data: WizardData;
  step: WizardStep | null;
  transitions: string[];
  phase: number;
}

interface HistoryEntry {
  step: WizardStep;
  data: WizardData;
  phase: number;
}

interface ScryveMsg {
  role: 'user' | 'assistant';
  content: string;
}

interface ParsedResponse {
  intent: 'answer' | 'skip';
  name?: string;
  role?: string;
  value?: string;
}

type SaveState = 'idle' | 'saving' | 'saved';

/* ── Constants ── */

const INITIAL_DATA: WizardData = {
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

const PHASES = ['Characters', 'Scope', 'Conflict', 'Outline', 'Synopsis'];

const cards: CardDef[] = [
  { key: 'summary.main_characters', title: 'Main Characters', placeholder: 'Key characters and their connections...', rows: 6 },
  { key: 'summary.scope', title: 'Scope', placeholder: 'Scale and boundaries of the story world...', rows: 3 },
  { key: 'summary.main_conflict', title: 'Main Conflict', placeholder: 'Central dramatic tension...', rows: 4 },
  { key: 'summary.outline_overview', title: 'Outline Overview', placeholder: 'High-level story structure...', rows: 8 },
  { key: 'summary.synopsis', title: 'Synopsis', placeholder: 'Working summary of your story...', rows: 6 },
];

const NAME_STEPS = new Set([
  'important_person', 'role_model', 'confidant', 'anchor', 'enemy',
  'antagonist', 'extra_name', 'antagonist_ally',
]);

/* ── Helpers ── */

function cloneData(d: WizardData): WizardData {
  return {
    ...d,
    characters: d.characters.map(c => ({ ...c, roles: [...c.roles] })),
    notes: [...d.notes],
  };
}

/* ── State Machine ── */

function processAnswer(stepId: string, answer: string, data: WizardData, parsedRole?: string): NextResult {
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

/* ── SummaryCard ── */

function SummaryCard({ card, projectId, initialContent }: { card: CardDef; projectId: string; initialContent: string }) {
  const [value, setValue] = useState(initialContent);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(initialContent);

  useEffect(() => { setValue(initialContent); lastSavedRef.current = initialContent; }, [initialContent]);

  const save = useCallback(async (text: string) => {
    if (text === lastSavedRef.current) return;
    setSaveState('saving');
    try {
      await fetch(`/api/projects/${projectId}/sections`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: card.key, content: text }) });
      lastSavedRef.current = text;
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 1500);
    } catch { setSaveState('idle'); }
  }, [projectId, card.key]);

  const handleChange = (text: string) => { setValue(text); if (debounceRef.current) clearTimeout(debounceRef.current); debounceRef.current = setTimeout(() => save(text), 800); };
  const handleBlur = () => { if (debounceRef.current) clearTimeout(debounceRef.current); if (value !== lastSavedRef.current) save(value); };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] transition hover:border-white/[0.1]">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
        <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {saveState === 'saving' && <><SpinnerIcon className="h-3 w-3 animate-spin" /><span>Saving</span></>}
          {saveState === 'saved' && <><CheckIcon className="h-3 w-3 text-green-400" /><span className="text-green-400">Saved</span></>}
        </div>
      </div>
      <div className="px-5 py-4">
        <textarea value={value} onChange={(e) => handleChange(e.target.value)} onBlur={handleBlur} placeholder={card.placeholder} rows={card.rows} className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 leading-relaxed focus:outline-none" />
      </div>
    </div>
  );
}

/* ── ScryveModal ── */

function ScryveModal({ isOpen, onClose, currentStep, wizardData, onLockIn }: {
  isOpen: boolean;
  onClose: () => void;
  currentStep: WizardStep;
  wizardData: WizardData;
  onLockIn: (answer: string) => void;
}) {
  const [msgs, setMsgs] = useState<ScryveMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMsgs([{ role: 'assistant', content: `Hey! Let's brainstorm. We're working on: "${currentStep.question}" — what are you thinking?` }]);
      setInput('');
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, currentStep.question]);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const updated: ScryveMsg[] = [...msgs, { role: 'user', content: text }];
    setMsgs(updated);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/scryve/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated,
          context: {
            stepId: currentStep.id,
            question: currentStep.question,
            choices: currentStep.choices || null,
            protagonistName: wizardData.protagonistName,
            protagonistGender: wizardData.protagonistGender,
            antagonistName: wizardData.antagonistName,
            characters: wizardData.characters,
          },
        }),
      });
      const data = await res.json();
      const content = data.content || 'Hmm, try asking again!';
      const lockMatch = content.match(/<<LOCK:(.+?)>>/);
      if (lockMatch) {
        const locked = lockMatch[1].trim();
        const clean = content.replace(/<<LOCK:.+?>>/, '').trim();
        setMsgs([...updated, { role: 'assistant', content: clean || `Locked in: ${locked}` }]);
        setTimeout(() => { onLockIn(locked); onClose(); }, 1200);
      } else {
        setMsgs([...updated, { role: 'assistant', content }]);
      }
    } catch {
      setMsgs([...updated, { role: 'assistant', content: 'Something went wrong. Try again!' }]);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 max-h-[70vh] flex flex-col rounded-2xl border border-white/10 bg-[#13111C] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-brand-600">
          <div className="flex items-center gap-2">
            <ScryveIcon className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">Scryve</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition"><CloseIcon className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
          {msgs.map((m, i) => m.role === 'assistant' ? (
            <div key={i} className="flex gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-600/20 mt-0.5">
                <ScryveIcon className="h-3 w-3 text-brand-400" />
              </div>
              <div className="rounded-xl rounded-tl-sm bg-white/[0.08] px-3 py-2 text-sm text-white/90 max-w-[85%] leading-relaxed">{m.content}</div>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <div className="rounded-xl rounded-br-sm bg-brand-600 px-3 py-2 text-sm text-white max-w-[85%]">{m.content}</div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-600/20 mt-0.5">
                <ScryveIcon className="h-3 w-3 text-brand-400" />
              </div>
              <div className="rounded-xl rounded-tl-sm bg-white/[0.08] px-3 py-2">
                <SpinnerIcon className="h-4 w-4 animate-spin text-brand-400" />
              </div>
            </div>
          )}
          <div ref={chatEnd} />
        </div>
        <div className="border-t border-white/10 p-3 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask Scryve..."
            className="flex-1 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-brand-500"
          />
          <button onClick={send} disabled={!input.trim() || loading} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-30">
            <SendIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */

export default function SummarySection({ projectId }: { projectId: string }) {
  const [sectionData, setSectionData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [hasContent, setHasContent] = useState(false);

  const [wizardActive, setWizardActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<WizardStep | null>(null);
  const [wizardData, setWizardData] = useState<WizardData>(INITIAL_DATA);
  const [phase, setPhase] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState('');
  const [textInput, setTextInput] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [consolidating, setConsolidating] = useState(false);
  const [consolidateError, setConsolidateError] = useState('');

  const [scryveOpen, setScryveOpen] = useState(false);
  const [showSynopsis, setShowSynopsis] = useState(false);
  const [synopsisText, setSynopsisText] = useState('');
  const [synopsisLoading, setSynopsisLoading] = useState(false);
  const [lockedNotice, setLockedNotice] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/sections`)
      .then(r => r.json())
      .then(data => {
        const mapped: Record<string, string> = {};
        let found = false;
        for (const [key, val] of Object.entries(data)) {
          const content = (val as { content: string }).content || '';
          mapped[key] = content;
          if (key.startsWith('summary.') && content.trim()) found = true;
        }
        setSectionData(mapped);
        setHasContent(found);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    if (wizardActive && currentStep && !currentStep.choices && !isParsing && !scryveOpen) {
      const isAddInfo = currentStep.id.startsWith('add_info_');
      setTimeout(() => isAddInfo ? textareaRef.current?.focus() : inputRef.current?.focus(), 100);
    }
  }, [currentStep, wizardActive, isParsing, scryveOpen]);

  function startWizard() {
    setCurrentStep({ id: 'protagonist_name', question: 'What is your protagonist\'s name?', placeholder: 'e.g. Kaizer de Luna' });
    setWizardData({ ...INITIAL_DATA, characters: [], notes: [] });
    setPhase(0);
    setSelectedChoice('');
    setTextInput('');
    setHistory([]);
    setConsolidateError('');
    setShowSynopsis(false);
    setLockedNotice('');
    setWizardActive(true);
  }

  async function handleNext() {
    if (!currentStep) return;
    const answer = currentStep.choices ? selectedChoice : textInput.trim();
    if (!answer) return;

    if (answer === 'View Synopsis') {
      setSynopsisLoading(true);
      setShowSynopsis(true);
      try {
        const { _temp, ...cleanData } = wizardData;
        const res = await fetch('/api/scryve/consolidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, wizardData: cleanData, previewOnly: true }),
        });
        const result = await res.json();
        setSynopsisText(res.ok && result.sections ? (result.sections['summary.synopsis'] || 'Not enough information yet.') : 'Could not generate synopsis.');
      } catch { setSynopsisText('Something went wrong.'); }
      finally { setSynopsisLoading(false); }
      return;
    }

    setHistory(prev => [...prev, { step: currentStep!, data: cloneData(wizardData), phase }]);

    let finalAnswer = answer;
    let parsedRole: string | undefined;

    if (NAME_STEPS.has(currentStep.id) && !currentStep.choices) {
      setIsParsing(true);
      try {
        const res = await fetch('/api/scryve/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stepId: currentStep.id, question: currentStep.question, answer }),
        });
        const parsed: ParsedResponse = await res.json();
        if (parsed.intent === 'skip') { finalAnswer = '__SKIP__'; }
        else if (parsed.name && parsed.role) { finalAnswer = parsed.name; parsedRole = parsed.role; }
        else if (parsed.name) { finalAnswer = parsed.name; }
      } catch {} finally { setIsParsing(false); }
    }

    const result = processAnswer(currentStep.id, finalAnswer, wizardData, parsedRole);
    setWizardData(result.data);
    setPhase(result.phase);
    setCurrentStep(result.step);
    setSelectedChoice('');
    setTextInput('');
    setLockedNotice('');
    if (!result.step) consolidate(result.data);
  }

  function handleBack() {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setCurrentStep(prev.step);
    setWizardData(prev.data);
    setPhase(prev.phase);
    setSelectedChoice('');
    setTextInput('');
    setShowSynopsis(false);
    setLockedNotice('');
  }

  function handleSkip() {
    if (!currentStep) return;
    setHistory(prev => [...prev, { step: currentStep!, data: cloneData(wizardData), phase }]);
    const result = processAnswer(currentStep.id, '__SKIP__', wizardData);
    setWizardData(result.data);
    setPhase(result.phase);
    setCurrentStep(result.step);
    setSelectedChoice('');
    setTextInput('');
    setLockedNotice('');
    if (!result.step) consolidate(result.data);
  }

  function handleLockIn(answer: string) {
    if (!currentStep) return;
    if (currentStep.choices) {
      const match = currentStep.choices.find(c => c.toLowerCase() === answer.toLowerCase());
      setSelectedChoice(match || answer);
    } else {
      setTextInput(answer);
    }
    setLockedNotice(`Scryve filled in: ${answer}`);
    setTimeout(() => setLockedNotice(''), 3000);
  }

  async function consolidate(data: WizardData) {
    setConsolidating(true);
    setConsolidateError('');
    try {
      const { _temp, ...cleanData } = data;
      const res = await fetch('/api/scryve/consolidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, wizardData: cleanData }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Consolidation failed');
      setSectionData(prev => ({ ...prev, ...result.sections }));
      setHasContent(true);
      setWizardActive(false);
    } catch (err) {
      setConsolidateError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setConsolidating(false);
    }
  }

  if (loading) {
    return <div className="flex h-40 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" /></div>;
  }

  /* ── Wizard view ── */
  if (wizardActive) {
    const isAddInfo = currentStep?.id.startsWith('add_info_') || false;
    const isCheckpoint = currentStep?.id.startsWith('checkpoint_') || false;
    const canSkip = currentStep?.id !== 'protagonist_name' && !isCheckpoint;
    const hasAnswer = currentStep?.choices ? !!selectedChoice : !!(isAddInfo ? textInput.trim() : textInput.trim());

    return (
      <div className="mx-auto max-w-xl flex flex-col h-full">
        {/* Phase stepper */}
        <div className="mb-8">
          <div className="flex items-center">
            {PHASES.map((p, i) => (
              <Fragment key={p}>
                {i > 0 && <div className={`flex-1 h-px ${i <= phase ? 'bg-brand-500' : 'bg-white/10'}`} />}
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    i < phase ? 'bg-brand-600 text-white' :
                    i === phase ? 'bg-brand-600 text-white ring-2 ring-brand-400/30 ring-offset-2 ring-offset-[#0a0a14]' :
                    'bg-white/[0.06] text-white/30'
                  }`}>
                    {i < phase ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span className={`text-[10px] ${i <= phase ? 'text-white/70' : 'text-white/20'}`}>{p}</span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>

        {/* Consolidating state */}
        {consolidating && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
            <SpinnerIcon className="h-8 w-8 animate-spin text-brand-400" />
            <p className="text-sm text-white/60">Weaving your story together...</p>
          </div>
        )}

        {/* Consolidation error */}
        {consolidateError && !consolidating && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
            <p className="text-sm text-red-400">Error: {consolidateError}</p>
            <button onClick={() => consolidate(wizardData)} className="text-sm text-brand-400 hover:text-brand-300 underline">Try again</button>
          </div>
        )}

        {/* Synopsis preview */}
        {showSynopsis && !consolidating && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
            <h3 className="text-base font-medium text-white mb-4">Current synopsis</h3>
            {synopsisLoading ? (
              <div className="flex items-center gap-2 py-8 justify-center">
                <SpinnerIcon className="h-5 w-5 animate-spin text-brand-400" />
                <span className="text-sm text-white/50">Generating...</span>
              </div>
            ) : (
              <>
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{synopsisText}</p>
                <button onClick={() => setShowSynopsis(false)} className="mt-6 flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 transition">
                  <ArrowLeftIcon className="h-3.5 w-3.5" /> Back to choices
                </button>
              </>
            )}
          </div>
        )}

        {/* Main wizard card */}
        {!consolidating && !consolidateError && !showSynopsis && currentStep && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
            {/* Step label */}
            <p className="text-[11px] font-medium text-brand-400 uppercase tracking-wider mb-2">
              Step {history.length + 1} — {PHASES[phase]}
            </p>

            {/* Question */}
            <h3 className="text-lg font-medium text-white mb-6">{currentStep.question}</h3>

            {/* Answer area */}
            {currentStep.choices ? (
              <div className="space-y-2.5 mb-6">
                {currentStep.choices.map(choice => (
                  <button
                    key={choice}
                    onClick={() => setSelectedChoice(choice)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${
                      selectedChoice === choice
                        ? 'border-brand-500 bg-brand-600/15 text-white'
                        : 'border-white/[0.08] bg-white/[0.02] text-white/70 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="text-sm font-medium">{choice}</span>
                  </button>
                ))}
              </div>
            ) : isAddInfo ? (
              <div className="mb-6">
                <textarea
                  ref={textareaRef}
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder={currentStep.placeholder}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-500 resize-none leading-relaxed"
                />
              </div>
            ) : (
              <div className="mb-6">
                <input
                  ref={inputRef}
                  type="text"
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && textInput.trim()) handleNext(); }}
                  placeholder={currentStep.placeholder}
                  className="w-full px-4 py-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-sm text-white placeholder:text-white/25 outline-none focus:border-brand-500"
                  autoFocus
                />
              </div>
            )}

            {/* Locked notice */}
            {lockedNotice && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-brand-600/10 border border-brand-500/20">
                <CheckIcon className="h-3.5 w-3.5 text-brand-400" />
                <span className="text-xs text-brand-300">{lockedNotice}</span>
              </div>
            )}

            {/* Parsing indicator */}
            {isParsing && (
              <div className="flex items-center gap-2 mb-4 justify-center">
                <SpinnerIcon className="h-4 w-4 animate-spin text-brand-400" />
                <span className="text-xs text-white/40">Processing...</span>
              </div>
            )}

            {/* Scryve hint */}
            {!isCheckpoint && (
              <div className="flex items-center justify-center mb-6">
                <button onClick={() => setScryveOpen(true)} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-brand-400 transition">
                  <ScryveIcon className="h-3.5 w-3.5" />
                  Stuck or need inspiration? Let Scryve help
                </button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-5 border-t border-white/[0.06]">
              <button
                onClick={handleBack}
                disabled={history.length === 0}
                className="flex items-center gap-1 text-sm text-white/40 hover:text-white/70 transition disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" /> Back
              </button>
              <div className="flex gap-2">
                {canSkip && (
                  <button
                    onClick={handleSkip}
                    className="px-4 py-2 text-sm text-white/40 hover:text-white/70 border border-white/[0.08] rounded-lg transition hover:border-white/20"
                  >
                    Skip
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!hasAnswer || isParsing}
                  className="flex items-center gap-1 px-5 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg transition hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isCheckpoint && selectedChoice === 'Finish' ? 'Finish' : 'Next'}
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel */}
        {!consolidating && (
          <div className="mt-4 text-center">
            <button onClick={() => setWizardActive(false)} className="text-xs text-white/20 hover:text-white/40 transition">
              Cancel wizard
            </button>
          </div>
        )}

        {/* Scryve Modal */}
        {currentStep && (
          <ScryveModal
            isOpen={scryveOpen}
            onClose={() => setScryveOpen(false)}
            currentStep={currentStep}
            wizardData={wizardData}
            onLockIn={handleLockIn}
          />
        )}
      </div>
    );
  }

  /* ── Empty state ── */
  if (!hasContent) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600/10">
          <ScryveIcon className="h-8 w-8 text-brand-400" />
        </div>
        <h2 className="text-xl font-bold">Set up your Summary</h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          Build your story&apos;s foundation step by step. Quick answers — Scryve does the heavy lifting.
        </p>
        <button onClick={startWizard} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700">
          <ScryveIcon className="h-4 w-4" />
          Start Wizard
        </button>
      </div>
    );
  }

  /* ── Content view ── */
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div />
        <button onClick={startWizard} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/[0.06] hover:text-foreground transition">
          <RefreshIcon className="h-3 w-3" />
          Re-run Wizard
        </button>
      </div>
      <div className="space-y-4">
        {cards.map(card => (
          <SummaryCard key={card.key} card={card} projectId={projectId} initialContent={sectionData[card.key] || ''} />
        ))}
      </div>
    </div>
  );
}
