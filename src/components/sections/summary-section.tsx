'use client';
import { useState, useEffect, useRef, Fragment } from 'react';
import { Check as CheckIcon, Loader2 as SpinnerIcon, RefreshCw as RefreshIcon, ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon } from 'lucide-react';
import { ScryveIcon } from '@/components/icons';
import { SummaryCard } from './summary-card';
import { ScryveModal } from './scryve-modal';
import { INITIAL_DATA, PHASES, cards, cloneData, processAnswer, type HistoryEntry, type WizardData, type WizardStep } from '@/lib/wizard-state-machine';

/* -- Component -- */

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
    if (wizardActive && currentStep && !currentStep.choices && !scryveOpen) {
      setTimeout(() => currentStep.multiline ? textareaRef.current?.focus() : inputRef.current?.focus(), 100);
    }
  }, [currentStep, wizardActive, scryveOpen]);

  function startWizard() {
    setCurrentStep({ id: 'protagonist_name', question: 'Who is the main protagonist of the story?', placeholder: 'e.g. Kaizer de Luna' });
    setWizardData({ ...INITIAL_DATA, notes: [] });
    setPhase(0);
    setSelectedChoice('');
    setTextInput('');
    setHistory([]);
    setConsolidateError('');
    setShowSynopsis(false);
    setLockedNotice('');
    setWizardActive(true);
  }

  function advanceWizard(answer: string) {
    if (!currentStep || !answer) return;

    if (answer === 'View Synopsis') {
      setSynopsisLoading(true);
      setShowSynopsis(true);
      fetch('/api/scryve/consolidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, wizardData, previewOnly: true }),
      })
        .then(res => res.json().then(result => {
          setSynopsisText(res.ok && result.sections ? (result.sections['summary.synopsis'] || 'Not enough information yet.') : 'Could not generate synopsis.');
        }))
        .catch(() => setSynopsisText('Something went wrong.'))
        .finally(() => setSynopsisLoading(false));
      return;
    }

    setHistory(prev => [...prev, { step: currentStep!, data: cloneData(wizardData), phase }]);

    const result = processAnswer(currentStep.id, answer, wizardData);
    setWizardData(result.data);
    setPhase(result.phase);
    setCurrentStep(result.step);
    setSelectedChoice('');
    setTextInput('');
    setLockedNotice('');
    if (!result.step) consolidate(result.data);
  }

  function handleNext() {
    if (!currentStep) return;
    const answer = currentStep.choices ? selectedChoice : textInput.trim();
    advanceWizard(answer);
  }

  function handleChoiceClick(choice: string) {
    advanceWizard(choice);
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
      const res = await fetch('/api/scryve/consolidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, wizardData: data }),
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

  /* -- Wizard view -- */
  if (wizardActive) {
    const isCheckpoint = currentStep?.id.startsWith('checkpoint_') || false;
    const isChoiceStep = !!currentStep?.choices;
    const canSkip = currentStep?.id !== 'protagonist_name' && !isCheckpoint;
    const hasAnswer = isChoiceStep ? !!selectedChoice : !!textInput.trim();

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
              Step {history.length + 1} &mdash; {PHASES[phase]}
            </p>

            {/* Question */}
            <h3 className="text-lg font-medium text-white mb-6">{currentStep.question}</h3>

            {/* Answer area */}
            {isChoiceStep ? (
              <div className="space-y-2.5 mb-6">
                {currentStep.choices!.map(choice => (
                  <button
                    key={choice}
                    onClick={() => handleChoiceClick(choice)}
                    className="w-full text-left px-4 py-3.5 rounded-xl border transition-all border-white/[0.08] bg-white/[0.02] text-white/70 hover:border-brand-500 hover:bg-brand-600/15 hover:text-white"
                  >
                    <span className="text-sm font-medium">{choice}</span>
                  </button>
                ))}
              </div>
            ) : currentStep.multiline ? (
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

            {/* Scryve hint */}
            {!isCheckpoint && !isChoiceStep && (
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
                {canSkip && !isChoiceStep && (
                  <button
                    onClick={handleSkip}
                    className="px-4 py-2 text-sm text-white/40 hover:text-white/70 border border-white/[0.08] rounded-lg transition hover:border-white/20"
                  >
                    Skip
                  </button>
                )}
                {!isChoiceStep && (
                  <button
                    onClick={handleNext}
                    disabled={!hasAnswer}
                    className="flex items-center gap-1 px-5 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg transition hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </button>
                )}
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

  /* -- Empty state -- */
  if (!hasContent) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600/10">
          <ScryveIcon className="h-8 w-8 text-brand-400" />
        </div>
        <h2 className="text-xl font-bold">Set up your Summary</h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          Build your story&apos;s foundation step by step. Quick answers &mdash; Scryve does the heavy lifting.
        </p>
        <button onClick={startWizard} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700">
          <ScryveIcon className="h-4 w-4" />
          Start Wizard
        </button>
      </div>
    );
  }

  /* -- Content view -- */
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
