'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check as CheckIcon, Loader2 as SpinnerIcon } from 'lucide-react';
import type { CardDef, SaveState } from '@/lib/wizard-state-machine';

export function SummaryCard({ card, projectId, initialContent }: { card: CardDef; projectId: string; initialContent: string }) {
  const [value, setValue] = useState(initialContent);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setValue(initialContent); lastSavedRef.current = initialContent; }, [initialContent]);

  /* Auto-resize textarea to fit content */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [value]);

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
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={card.placeholder}
          rows={card.rows}
          className="w-full resize-none overflow-hidden bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 leading-relaxed focus:outline-none"
        />
      </div>
    </div>
  );
}
