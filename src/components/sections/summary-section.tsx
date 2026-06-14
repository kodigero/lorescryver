'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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

/* ── Micro-question wizard steps ────────────────────────────────────── */
/* Each question = ONE thought. The author just answers, Scryve thinks. */

interface WizardStep {
  key: string;
  fieldKey: string;
  question: string;
  placeholder: string;
}

const wizardSteps: WizardStep[] = [
  {
    key: 'protagonistName',
    fieldKey: 'protagonistName',
    question: "What's your main character's name?",
    placeholder: 'Kaelith',
  },
  {
    key: 'protagonistDesc',
    fieldKey: 'protagonistDesc',
    question: "In a few words, who are they?",
    placeholder: 'A tired detective with a secret',
  },
  {
    key: 'protagonistDesire',
    fieldKey: 'protagonistDesire',
    question: "What do they want more than anything?",
    placeholder: 'To find their missing sister',
  },
  {
    key: 'setting',
    fieldKey: 'setting',
    question: "Where does the story take place?",
    placeholder: 'A rain-soaked port city',
  },
  {
    key: 'timePeriod',
    fieldKey: 'timePeriod',
    question: "When does it happen?",
    placeholder: 'Modern day, medieval, far future...',
  },
  {
    key: 'genre',
    fieldKey: 'genre',
    question: "What genre is it?",
    placeholder: 'Dark fantasy, sci-fi thriller, romance...',
  },
  {
    key: 'tone',
    fieldKey: 'tone',
    question: "How does the story feel? One or two words.",
    placeholder: 'Tense, hopeful, eerie...',
  },
  {
    key: 'worldScale',
    fieldKey: 'worldScale',
    question: "How big is the world? A single room, a city, a whole planet?",
    placeholder: 'A sprawling continent',
  },
  {
    key: 'incitingIncident',
    fieldKey: 'incitingIncident',
    question: "What event kicks the story off?",
    placeholder: 'A letter arrives with a cryptic warning',
  },
  {
    key: 'obstacle',
    fieldKey: 'obstacle',
    question: "What's standing in your character's way?",
    placeholder: 'A corrupt guild controls the only route forward',
  },
  {
    key: 'supportingCast',
    fieldKey: 'supportingCast',
    question: "Any other important characters? Just names and a word or two each.",
    placeholder: 'Renn — loyal friend, Vara — rival spy',
  },
  {
    key: 'turningPoint',
    fieldKey: 'turningPoint',
    question: "What's a major turning point in the story?",
    placeholder: 'She discovers the villain is her mentor',
  },
  {
    key: 'ending',
    fieldKey: 'ending',
    question: "Last one — how does it end? Even a rough idea works.",
    placeholder: 'She wins but loses someone she loves',
  },
];

/* ── Card definitions (for the editable view) ───────────────────────── */

interface CardDef {
  key: string;
  title: string;
  placeholder: string;
  rows: number;
}

const cards: CardDef[] = [
  { key: 'summary.synopsis', title: 'Synopsis', placeholder: 'Working summary of your story...', rows: 6 },
  { key: 'summary.genre', title: 'Genre', placeholder: 'Story genre...', rows: 2 },
  { key: 'summary.tone', title: 'Tone', placeholder: 'Mood and atmosphere...', rows: 2 },
  { key: 'summary.scope', title: 'Scope', placeholder: 'Scale of the story world...', rows: 3 },
  { key: 'summary.main_characters', title: 'Main Characters', placeholder: 'Key characters and roles...', rows: 5 },
  { key: 'summary.main_conflict', title: 'Main Conflict', placeholder: 'Central dramatic tension...', rows: 4 },
  { key: 'summary.outline_overview', title: 'Outline Overview', placeholder: 'High-level story structure...', rows: 8 },
];

/* ── Save state type ────────────────────────────────────────────────── */

type SaveState = 'idle' | 'saving' | 'saved';

/* ── Editable Card component ────────────────────────────────────────── */

function SummaryCard({
  card,
  projectId,
  initialContent,
}: {
  card: CardDef;
  projectId: string;
  initialContent: string;
}) {
  const [value, setValue] = useState(initialContent);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(initialContent);

  useEffect(() => {
    setValue(initialContent);
    lastSavedRef.current = initialContent;
  }, [initialContent]);

  const save = useCallback(
    async (text: string) => {
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
    },
    [projectId, card.key]
  );

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

/* ── Wizard Chat Bubbles ────────────────────────────────────────────── */

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

/* ── Main Summary Section ───────────────────────────────────────────── */

export default function SummarySection({ projectId }: { projectId: string }) {
  const [sectionData, setSectionData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [hasContent, setHasContent] = useState(false);
  const [wizardActive, setWizardActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentInput, setCurrentInput] = useState('');
  const [consolidating, setConsolidating] = useState(false);
  const [consolidateError, setConsolidateError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load existing section data
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

  // Auto-scroll wizard chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentStep, answers]);

  // Focus input when step changes
  useEffect(() => {
    if (wizardActive && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentStep, wizardActive]);

  function startWizard() {
    setWizardActive(true);
    setCurrentStep(0);
    setAnswers({});
    setCurrentInput('');
    setConsolidateError('');
  }

  function submitAnswer() {
    const text = currentInput.trim();
    if (!text) return;

    const step = wizardSteps[currentStep];
    const newAnswers = { ...answers, [step.fieldKey]: text };
    setAnswers(newAnswers);
    setCurrentInput('');

    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      consolidate(newAnswers);
    }
  }

  async function consolidate(finalAnswers: Record<string, string>) {
    setConsolidating(true);
    setConsolidateError('');

    try {
      const res = await fetch('/api/scryve/consolidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, answers: finalAnswers }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Consolidation failed');
      }

      setSectionData((prev) => ({ ...prev, ...data.sections }));
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
      submitAnswer();
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  /* ── Wizard view ─────────────────────────────────────────────────── */

  if (wizardActive) {
    return (
      <div className="mx-auto max-w-2xl flex flex-col h-full">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              {Object.keys(answers).length} of {wizardSteps.length} answered
            </span>
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
              style={{ width: `${((Object.keys(answers).length) / wizardSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {/* Intro message */}
          {currentStep === 0 && Object.keys(answers).length === 0 && (
            <ScryveMessage>Quick questions — just answer off the top of your head. I&apos;ll do the heavy lifting.</ScryveMessage>
          )}

          {wizardSteps.map((step, i) => {
            if (i > currentStep) return null;

            return (
              <div key={step.key} className="space-y-3">
                <ScryveMessage>{step.question}</ScryveMessage>
                {answers[step.fieldKey] && (
                  <UserMessage>{answers[step.fieldKey]}</UserMessage>
                )}
              </div>
            );
          })}

          {/* Consolidating state */}
          {consolidating && (
            <ScryveMessage>
              <div className="flex items-center gap-2">
                <SpinnerIcon className="h-4 w-4 animate-spin text-brand-400" />
                <span>Got it all. Putting your Summary together now...</span>
              </div>
            </ScryveMessage>
          )}

          {/* Error state */}
          {consolidateError && (
            <ScryveMessage>
              <div className="text-red-400">
                Something went wrong: {consolidateError}
                <button
                  onClick={() => consolidate(answers)}
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
        {!consolidating && currentStep < wizardSteps.length && !answers[wizardSteps[currentStep]?.fieldKey] && (
          <div className="border-t border-white/5 pt-4">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={wizardSteps[currentStep].placeholder}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
                autoFocus
              />
              <button
                onClick={submitAnswer}
                disabled={!currentInput.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-30"
              >
                <SendIcon className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-white/20">
              Press Enter to submit
            </p>
          </div>
        )}
      </div>
    );
  }

  /* ── Empty state — no content yet ────────────────────────────────── */

  if (!hasContent) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600/10">
          <ScryveIcon className="h-8 w-8 text-brand-400" />
        </div>
        <h2 className="text-xl font-bold">Set up your Summary</h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          Answer a few quick questions and Scryve will build your Summary for you. No overthinking — just answer off the top of your head.
        </p>
        <button
          onClick={startWizard}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          <ScryveIcon className="h-4 w-4" />
          Start Content Wizard
        </button>
      </div>
    );
  }

  /* ── Content view — editable cards ───────────────────────────────── */

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
