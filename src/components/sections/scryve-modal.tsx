'use client';

import { useEffect, useRef, useState } from 'react';
import type { ScryveMsg, WizardData, WizardStep } from '@/lib/wizard-state-machine';

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

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export function ScryveModal({ isOpen, onClose, currentStep, wizardData, onLockIn }: {
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
      setMsgs([{ role: 'assistant', content: `Hey! Let me help. We are working on: "${currentStep.question}" - what are you thinking?` }]);
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
            choices: currentStep.choices,
            protagonistName: wizardData.protagonistName,
            protagonistGender: wizardData.protagonistGender,
            antagonistName: wizardData.antagonist,
          },
        }),
      });
      const resData = await res.json();
      const content = resData.data?.content || 'Hmm, try asking again!';
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
