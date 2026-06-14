'use client';

import { useState, useEffect, useCallback, useRef, Fragment } from 'react';

/* ── Icons ──────────────────────────────────────────────────────────── */

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

/* ── Types ──────────────────────────────────────────────────────────── */

interface ChatMsg {
  role: 'scryve' | 'user';
  text: string;
}

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

type SaveState = 'idle' | 'saving' | 'saved';

/* ── Constants ──────────────────────────────────────────────────────── */

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

/* ── State Machine ──────────────────────────────────────────────────── */

function processAnswer(stepId: string, answer: string, data: WizardData): NextResult {
  const d: WizardData = {
    ...data,
    characters: data.characters.map(c => ({ ...c, roles: [...c.roles] })),
    notes: [...data.notes],
  };

  const n = d.protagonistName;
  const pos = d.protagonistGender === 'female' ? 'her' : 'his';
  const obj = d.protagonistGender === 'female' ? 'her' : 'him';

  const findChar = (name: string) =>
    d.characters.find(c => c.name.toLowerCase() === name.toLowerCase());

  switch (stepId) {
    /* ── Phase 0: Characters ── */

    case 'protagonist_name': {
      d.protagonistName = answer;
      return { data: d, step: { id: 'protagonist_gender', question: `Is ${answer} male or female?`, placeholder: '', choices: ['Male', 'Female'] }, transitions: [], phase: 0 };
    }

    case 'protagonist_gender': {
      d.protagonistGender = answer.toLowerCase();
      return { data: d, step: { id: 'protagonist_occupation', question: `Nice! What does ${d.protagonistName} do?`, placeholder: 'detective, blacksmith, student...' }, transitions: [], phase: 0 };
    }

    case 'protagonist_occupation': {
      d.protagonistOccupation = answer;
      return { data: d, step: { id: 'protagonist_location', question: `Where does ${d.protagonistName} live?`, placeholder: 'Tokyo, Mars, Winterfell...' }, transitions: [], phase: 0 };
    }

    case 'protagonist_location': {
      d.protagonistLocation = answer;
      return { data: d, step: { id: 'important_person', question: `Who is the most important person in ${d.protagonistName}'s life?`, placeholder: 'a name' }, transitions: [], phase: 0 };
    }

    case 'important_person': {
      d._temp = answer;
      const ex = findChar(answer);
      if (ex) {
        ex.roles.push('important_person');
        d._temp = '';
        return { data: d, step: { id: 'role_model', question: `Who does ${n} look up to as a role model?`, placeholder: 'a name' }, transitions: [], phase: 0 };
      }
      return { data: d, step: { id: 'important_person_rel', question: `What is ${answer} to ${obj}?`, placeholder: 'mother, wife, mentor...' }, transitions: [], phase: 0 };
    }

    case 'important_person_rel': {
      d.characters.push({ name: d._temp, gender: '', relationship: answer, roles: ['important_person'] });
      d._temp = '';
      return { data: d, step: { id: 'role_model', question: `Who does ${n} look up to as a role model?`, placeholder: 'a name' }, transitions: [], phase: 0 };
    }

    case 'role_model': {
      d._temp = answer;
      const ex = findChar(answer);
      if (ex) {
        ex.roles.push('role_model');
        d._temp = '';
        return { data: d, step: { id: 'confidant', question: `Who knows ${n}'s darkest secrets?`, placeholder: 'a name' }, transitions: [], phase: 0 };
      }
      return { data: d, step: { id: 'role_model_rel', question: `What is ${answer} to ${obj}?`, placeholder: 'father, teacher, captain...' }, transitions: [], phase: 0 };
    }

    case 'role_model_rel': {
      d.characters.push({ name: d._temp, gender: '', relationship: answer, roles: ['role_model'] });
      d._temp = '';
      return { data: d, step: { id: 'confidant', question: `Who knows ${n}'s darkest secrets?`, placeholder: 'a name' }, transitions: [], phase: 0 };
    }

    case 'confidant': {
      d._temp = answer;
      const ex = findChar(answer);
      if (ex) {
        ex.roles.push('confidant');
        d._temp = '';
        return { data: d, step: { id: 'anchor', question: `Who keeps ${n} grounded when things get tough?`, placeholder: 'a name' }, transitions: [], phase: 0 };
      }
      return { data: d, step: { id: 'confidant_rel', question: `What is ${answer} to ${obj}?`, placeholder: 'best friend, sister, partner...' }, transitions: [], phase: 0 };
    }

    case 'confidant_rel': {
      d.characters.push({ name: d._temp, gender: '', relationship: answer, roles: ['confidant'] });
      d._temp = '';
      return { data: d, step: { id: 'anchor', question: `Who keeps ${n} grounded when things get tough?`, placeholder: 'a name' }, transitions: [], phase: 0 };
    }

    case 'anchor': {
      d._temp = answer;
      const ex = findChar(answer);
      if (ex) {
        ex.roles.push('anchor');
        d._temp = '';
        return { data: d, step: { id: 'enemy', question: `Who does ${n} hate the most?`, placeholder: 'a name' }, transitions: [], phase: 0 };
      }
      return { data: d, step: { id: 'anchor_rel', question: `What is ${answer} to ${obj}?`, placeholder: 'grandmother, coach, lover...' }, transitions: [], phase: 0 };
    }

    case 'anchor_rel': {
      d.characters.push({ name: d._temp, gender: '', relationship: answer, roles: ['anchor'] });
      d._temp = '';
      return { data: d, step: { id: 'enemy', question: `Who does ${n} hate the most?`, placeholder: 'a name' }, transitions: [], phase: 0 };
    }

    case 'enemy': {
      d._temp = answer;
      const ex = findChar(answer);
      if (ex) {
        ex.roles.push('enemy');
        d._temp = '';
        return { data: d, step: { id: 'antagonist', question: `Now the big one — who or what is working against ${n}?`, placeholder: 'a name or force' }, transitions: [], phase: 0 };
      }
      return { data: d, step: { id: 'enemy_rel', question: `What is ${answer} to ${obj}?`, placeholder: 'rival, bully, ex-partner...' }, transitions: [], phase: 0 };
    }

    case 'enemy_rel': {
      d.characters.push({ name: d._temp, gender: '', relationship: answer, roles: ['enemy'] });
      d._temp = '';
      return { data: d, step: { id: 'antagonist', question: `Now the big one — who or what is working against ${n}?`, placeholder: 'a name or force' }, transitions: [], phase: 0 };
    }

    case 'antagonist': {
      d.antagonistName = answer;
      return { data: d, step: { id: 'antagonist_is_person', question: `Is ${answer} a person?`, placeholder: '', choices: ['Yes', 'No'] }, transitions: [], phase: 0 };
    }

    case 'antagonist_is_person': {
      if (answer.toLowerCase() === 'yes') {
        d.antagonistIsCharacter = true;
        return { data: d, step: { id: 'antagonist_gender', question: `Is ${d.antagonistName} male or female?`, placeholder: '', choices: ['Male', 'Female'] }, transitions: [], phase: 0 };
      }
      d.antagonistIsCharacter = false;
      return { data: d, step: { id: 'more_characters', question: 'Anyone else who plays a major role we haven\'t mentioned?', placeholder: '', choices: ['Yes', 'No'] }, transitions: [], phase: 0 };
    }

    case 'antagonist_gender': {
      d.antagonistGender = answer.toLowerCase();
      const ex = findChar(d.antagonistName);
      if (ex) {
        ex.gender = answer.toLowerCase();
        if (!ex.roles.includes('antagonist')) ex.roles.push('antagonist');
        return { data: d, step: { id: 'antagonist_ally', question: `Who is ${d.antagonistName}'s most loyal ally?`, placeholder: 'a name' }, transitions: [], phase: 0 };
      }
      return { data: d, step: { id: 'antagonist_rel', question: `What is ${d.antagonistName} to ${n}?`, placeholder: 'rival, tyrant, former ally...' }, transitions: [], phase: 0 };
    }

    case 'antagonist_rel': {
      d.characters.push({ name: d.antagonistName, gender: d.antagonistGender, relationship: answer, roles: ['antagonist'] });
      return { data: d, step: { id: 'antagonist_ally', question: `Who is ${d.antagonistName}'s most loyal ally?`, placeholder: 'a name' }, transitions: [], phase: 0 };
    }

    case 'antagonist_ally': {
      d._temp = answer;
      return { data: d, step: { id: 'antagonist_ally_rel', question: `What is ${answer} to ${d.antagonistName}?`, placeholder: 'lieutenant, advisor, servant...' }, transitions: [], phase: 0 };
    }

    case 'antagonist_ally_rel': {
      const allyEx = findChar(d._temp);
      if (allyEx) {
        allyEx.roles.push('antagonist_ally');
      } else {
        d.characters.push({ name: d._temp, gender: '', relationship: `${answer} (to ${d.antagonistName})`, roles: ['antagonist_ally'] });
      }
      d._temp = '';
      return { data: d, step: { id: 'more_allies', question: `Anyone else backing ${d.antagonistName}?`, placeholder: '', choices: ['Yes', 'No'] }, transitions: [], phase: 0 };
    }

    case 'more_allies': {
      if (answer.toLowerCase() === 'yes') {
        return { data: d, step: { id: 'antagonist_ally', question: 'What\'s their name?', placeholder: 'a name' }, transitions: [], phase: 0 };
      }
      return { data: d, step: { id: 'more_characters', question: 'Anyone else who plays a major role we haven\'t mentioned?', placeholder: '', choices: ['Yes', 'No'] }, transitions: [], phase: 0 };
    }

    case 'more_characters': {
      if (answer.toLowerCase() === 'yes') {
        return { data: d, step: { id: 'extra_name', question: 'What\'s their name?', placeholder: 'a name' }, transitions: [], phase: 0 };
      }
      return {
        data: d,
        step: { id: 'checkpoint_characters', question: 'We\'ve mapped out the cast! What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Scope'] },
        transitions: [],
        phase: 0,
      };
    }

    case 'extra_name': {
      d._temp = answer;
      return { data: d, step: { id: 'extra_rel', question: `What is ${answer} to ${n}?`, placeholder: 'ally, lover, stranger...' }, transitions: [], phase: 0 };
    }

    case 'extra_rel': {
      d.characters.push({ name: d._temp, gender: '', relationship: answer, roles: ['other'] });
      d._temp = '';
      return { data: d, step: { id: 'more_characters', question: 'Anyone else?', placeholder: '', choices: ['Yes', 'No'] }, transitions: [], phase: 0 };
    }

    /* ── Checkpoint: Characters ── */

    case 'checkpoint_characters': {
      if (answer === 'Add More') {
        return { data: d, step: { id: 'add_info_characters', question: 'What else should I know about the characters?', placeholder: 'type anything...' }, transitions: [], phase: 0 };
      }
      // "Next: Scope"
      return {
        data: d,
        step: { id: 'scope_location', question: 'Where does this story unfold?', placeholder: 'kingdom, city, planet...' },
        transitions: ['Great crew! I can already see some interesting dynamics. Let\'s set the stage.'],
        phase: 1,
      };
    }

    case 'add_info_characters': {
      d.notes.push(`Characters: ${answer}`);
      return { data: d, step: { id: 'checkpoint_characters', question: 'Got it! What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Scope'] }, transitions: [], phase: 0 };
    }

    /* ── Phase 1: Scope ── */

    case 'scope_location': {
      d.scopeLocation = answer;
      return { data: d, step: { id: 'scope_time', question: 'What time period?', placeholder: 'medieval, modern, 2185...' }, transitions: [], phase: 1 };
    }

    case 'scope_time': {
      d.scopeTime = answer;
      return { data: d, step: { id: 'scope_installments', question: 'Single story or series?', placeholder: 'single, trilogy, series...' }, transitions: [], phase: 1 };
    }

    case 'scope_installments': {
      d.scopeInstallments = answer;
      return {
        data: d,
        step: { id: 'checkpoint_scope', question: 'The world is taking shape! What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Conflict'] },
        transitions: [],
        phase: 1,
      };
    }

    /* ── Checkpoint: Scope ── */

    case 'checkpoint_scope': {
      if (answer === 'Add More') {
        return { data: d, step: { id: 'add_info_scope', question: 'What else about the world?', placeholder: 'type anything...' }, transitions: [], phase: 1 };
      }
      const q = d.antagonistIsCharacter
        ? `What does ${d.antagonistName} want?`
        : `What does ${d.antagonistName} threaten?`;
      return {
        data: d,
        step: { id: 'conflict_want', question: q, placeholder: 'power, revenge, survival...' },
        transitions: ['Got it. Now for the juicy part.'],
        phase: 2,
      };
    }

    case 'add_info_scope': {
      d.notes.push(`Scope: ${answer}`);
      return { data: d, step: { id: 'checkpoint_scope', question: 'Noted! What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Conflict'] }, transitions: [], phase: 1 };
    }

    /* ── Phase 2: Conflict ── */

    case 'conflict_want': {
      d.conflictWant = answer;
      return { data: d, step: { id: 'conflict_stakes', question: `What does ${n} stand to lose?`, placeholder: 'family, freedom, identity...' }, transitions: [], phase: 2 };
    }

    case 'conflict_stakes': {
      d.conflictStakes = answer;
      return {
        data: d,
        step: { id: 'checkpoint_conflict', question: 'The stakes are clear! What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Outline'] },
        transitions: [],
        phase: 2,
      };
    }

    /* ── Checkpoint: Conflict ── */

    case 'checkpoint_conflict': {
      if (answer === 'Add More') {
        return { data: d, step: { id: 'add_info_conflict', question: 'What else about the conflict?', placeholder: 'type anything...' }, transitions: [], phase: 2 };
      }
      return {
        data: d,
        step: { id: 'outline_before', question: `What is ${n}'s life like before the conflict?`, placeholder: 'peaceful, chaotic, mundane...' },
        transitions: ['The tension is real! Let\'s sketch the big picture.'],
        phase: 3,
      };
    }

    case 'add_info_conflict': {
      d.notes.push(`Conflict: ${answer}`);
      return { data: d, step: { id: 'checkpoint_conflict', question: 'Noted! What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Next: Outline'] }, transitions: [], phase: 2 };
    }

    /* ── Phase 3: Outline ── */

    case 'outline_before': {
      d.outlineBefore = answer;
      return { data: d, step: { id: 'outline_turning', question: 'What triggers the turning point?', placeholder: 'betrayal, discovery, death...' }, transitions: [], phase: 3 };
    }

    case 'outline_turning': {
      d.outlineTurning = answer;
      return { data: d, step: { id: 'outline_ending', question: 'How does it end?', placeholder: 'victory, sacrifice, escape...' }, transitions: [], phase: 3 };
    }

    case 'outline_ending': {
      d.outlineEnding = answer;
      return {
        data: d,
        step: { id: 'checkpoint_outline', question: 'The plot is mapped! What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Finish'] },
        transitions: [],
        phase: 3,
      };
    }

    /* ── Checkpoint: Outline ── */

    case 'checkpoint_outline': {
      if (answer === 'Add More') {
        return { data: d, step: { id: 'add_info_outline', question: 'What else about the plot?', placeholder: 'type anything...' }, transitions: [], phase: 3 };
      }
      // "Finish"
      return {
        data: d,
        step: null,
        transitions: ['Perfect! Let me weave the complete story together...'],
        phase: 4,
      };
    }

    case 'add_info_outline': {
      d.notes.push(`Outline: ${answer}`);
      return { data: d, step: { id: 'checkpoint_outline', question: 'Noted! What would you like to do?', placeholder: '', choices: ['View Synopsis', 'Add More', 'Finish'] }, transitions: [], phase: 3 };
    }

    default:
      return { data: d, step: null, transitions: [], phase: 4 };
  }
}

/* ── Editable Card ──────────────────────────────────────────────────── */

function SummaryCard({ card, projectId, initialContent }: { card: CardDef; projectId: string; initialContent: string }) {
  const [value, setValue] = useState(initialContent);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(initialContent);

  useEffect(() => {
    setValue(initialContent);
    lastSavedRef.current = initialContent;
  }, [initialContent]);

  const save = useCallback(async (text: string) => {
    if (text === lastSavedRef.current) return;
    setSaveState('saving');
    try {
      await fetch(`/api/projects/${projectId}/sections`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: card.key, content: text }),
      });
      lastSavedRef.current = text;
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 1500);
    } catch {
      setSaveState('idle');
    }
  }, [projectId, card.key]);

  const handleChange = (text: string) => {
    setValue(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(text), 800);
  };

  const handleBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value !== lastSavedRef.current) save(value);
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] transition hover:border-white/[0.1]">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
        <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {saveState === 'saving' && (
            <>
              <SpinnerIcon className="h-3 w-3 animate-spin" />
              <span>Saving</span>
            </>
          )}
          {saveState === 'saved' && (
            <>
              <CheckIcon className="h-3 w-3 text-green-400" />
              <span className="text-green-400">Saved</span>
            </>
          )}
        </div>
      </div>
      <div className="px-5 py-4">
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={card.placeholder}
          rows={card.rows}
          className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 leading-relaxed focus:outline-none"
        />
      </div>
    </div>
  );
}

/* ── Chat Bubbles ───────────────────────────────────────────────────── */

function ScryveMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600/20">
        <ScryveIcon className="h-4 w-4 text-brand-400" />
      </div>
      <div className="rounded-2xl rounded-tl-md bg-white/[0.06] px-4 py-3 text-sm leading-relaxed text-white/90">
        {children}
      </div>
    </div>
  );
}

function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 px-4 py-3 text-sm leading-relaxed text-white">
        {children}
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────── */

export default function SummarySection({ projectId }: { projectId: string }) {
  const [sectionData, setSectionData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [hasContent, setHasContent] = useState(false);

  const [wizardActive, setWizardActive] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [currentStep, setCurrentStep] = useState<WizardStep | null>(null);
  const [wizardData, setWizardData] = useState<WizardData>(INITIAL_DATA);
  const [phase, setPhase] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [consolidating, setConsolidating] = useState(false);
  const [consolidateError, setConsolidateError] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/sections`)
      .then((r) => r.json())
      .then((data) => {
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
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (wizardActive && currentStep && !currentStep.choices) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentStep, wizardActive]);

  function startWizard() {
    const initial: ChatMsg[] = [
      { role: 'scryve', text: 'Hey! I\'m Scryve, and I\'m here to help you bring your story to life. Just answer with a word or two — I\'ll handle the rest.' },
      { role: 'scryve', text: 'Let\'s start with the star of the show — what\'s your protagonist\'s name?' },
    ];
    setMessages(initial);
    setCurrentStep({ id: 'protagonist_name', question: 'What\'s your protagonist\'s name?', placeholder: 'a name' });
    setWizardData({ ...INITIAL_DATA, characters: [], notes: [] });
    setPhase(0);
    setCurrentInput('');
    setConsolidateError('');
    setWizardActive(true);
  }

  /* ── Synopsis Preview ── */

  async function generatePreview(currentMsgs: ChatMsg[], checkpointQuestion: string, data: WizardData) {
    setConsolidating(true);
    try {
      const { _temp, ...cleanData } = data;
      const res = await fetch('/api/scryve/consolidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, wizardData: cleanData, previewOnly: true }),
      });
      const result = await res.json();
      if (res.ok && result.sections) {
        const synopsis = result.sections['summary.synopsis'] || 'Not enough information yet to build a synopsis.';
        setMessages([
          ...currentMsgs,
          { role: 'scryve', text: synopsis },
          { role: 'scryve', text: checkpointQuestion },
        ]);
      } else {
        throw new Error(result.error || 'Preview failed');
      }
    } catch (err) {
      setMessages([
        ...currentMsgs,
        { role: 'scryve', text: `Hmm, couldn't generate a preview right now. ${err instanceof Error ? err.message : ''}` },
        { role: 'scryve', text: checkpointQuestion },
      ]);
    } finally {
      setConsolidating(false);
    }
  }

  /* ── Submit handler ── */

  function handleSubmit(answerOverride?: string) {
    const answer = (answerOverride || currentInput).trim();
    if (!answer || !currentStep) return;

    // Handle "View Synopsis" at checkpoints
    if (answer === 'View Synopsis') {
      const newMsgs: ChatMsg[] = [
        ...messages,
        { role: 'user', text: answer },
        { role: 'scryve', text: 'Let me put together what we have so far...' },
      ];
      setMessages(newMsgs);
      setCurrentInput('');
      generatePreview(newMsgs, currentStep.question, wizardData);
      return;
    }

    // Normal flow
    const newMessages: ChatMsg[] = [...messages, { role: 'user', text: answer }];
    const result = processAnswer(currentStep.id, answer, wizardData);

    setWizardData(result.data);
    setPhase(result.phase);

    for (const t of result.transitions) {
      newMessages.push({ role: 'scryve', text: t });
    }

    if (result.step) {
      newMessages.push({ role: 'scryve', text: result.step.question });
      setCurrentStep(result.step);
    } else {
      setCurrentStep(null);
      setMessages(newMessages);
      setCurrentInput('');
      consolidate(result.data);
      return;
    }

    setMessages(newMessages);
    setCurrentInput('');
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

      setSectionData((prev) => ({ ...prev, ...result.sections }));
      setHasContent(true);
      setWizardActive(false);
    } catch (err) {
      setConsolidateError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setConsolidating(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  /* ── Wizard view ── */
  if (wizardActive) {
    return (
      <div className="mx-auto max-w-2xl flex flex-col h-full">
        {/* Phase stepper */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 text-xs">
              {PHASES.map((p, i) => (
                <Fragment key={p}>
                  {i > 0 && <span className="text-white/10">{'›'}</span>}
                  <span
                    className={
                      i < phase
                        ? 'text-brand-400'
                        : i === phase
                        ? 'text-white font-medium'
                        : 'text-white/30'
                    }
                  >
                    {p}
                  </span>
                </Fragment>
              ))}
            </div>
            {!consolidating && (
              <button
                onClick={() => setWizardActive(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition"
              >
                Cancel
              </button>
            )}
          </div>
          <div className="h-1 rounded-full bg-white/[0.06]">
            <div
              className="h-1 rounded-full bg-brand-500 transition-all duration-500"
              style={{ width: `${((phase + 1) / PHASES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg, i) =>
            msg.role === 'scryve' ? (
              <ScryveMessage key={i}>{msg.text}</ScryveMessage>
            ) : (
              <UserMessage key={i}>{msg.text}</UserMessage>
            )
          )}

          {consolidating && (
            <ScryveMessage>
              <div className="flex items-center gap-2">
                <SpinnerIcon className="h-4 w-4 animate-spin text-brand-400" />
                <span>Weaving your story together...</span>
              </div>
            </ScryveMessage>
          )}

          {consolidateError && (
            <ScryveMessage>
              <div className="text-red-400">
                Something went wrong: {consolidateError}
                <button
                  onClick={() => consolidate(wizardData)}
                  className="ml-2 underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            </ScryveMessage>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        {!consolidating && currentStep && (
          <div className="border-t border-white/5 pt-4">
            {currentStep.choices ? (
              <div className="flex flex-wrap gap-3 justify-center">
                {currentStep.choices.map((choice) => (
                  <button
                    key={choice}
                    onClick={() => handleSubmit(choice)}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-600 hover:border-brand-600"
                  >
                    {choice}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={currentStep.placeholder}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
                  autoFocus
                />
                <button
                  onClick={() => handleSubmit()}
                  disabled={!currentInput.trim()}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-30"
                >
                  <SendIcon className="h-4 w-4" />
                </button>
              </div>
            )}
            <p className="mt-2 text-center text-[10px] text-white/20">
              {currentStep.choices ? 'Pick one' : 'Press Enter to submit'}
            </p>
          </div>
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
          Chat with Scryve and build your story&apos;s foundation. Just quick answers — Scryve does the heavy lifting.
        </p>
        <button
          onClick={startWizard}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          <ScryveIcon className="h-4 w-4" />
          Chat with Scryve
        </button>
      </div>
    );
  }

  /* ── Content view ── */
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div />
        <button
          onClick={startWizard}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/[0.06] hover:text-foreground transition"
        >
          <RefreshIcon className="h-3 w-3" />
          Re-run Wizard
        </button>
      </div>
      <div className="space-y-4">
        {cards.map((card) => (
          <SummaryCard
            key={card.key}
            card={card}
            projectId={projectId}
            initialContent={sectionData[card.key] || ''}
          />
        ))}
      </div>
    </div>
  );
}
