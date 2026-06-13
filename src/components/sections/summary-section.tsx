'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/* ── Icons ──────────────────────────────────────────────────────────── */

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
      <path d="M7 3v4a1 1 0 0 0 1 1h7" />
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

/* ── Card definitions ───────────────────────────────────────────────── */

interface CardDef {
  key: string;
  title: string;
  placeholder: string;
  rows: number;
}

const cards: CardDef[] = [
  {
    key: 'summary.synopsis',
    title: 'Synopsis',
    placeholder: 'Write a working summary of your story. What happens, to whom, and what\'s at stake? This is your north star — not a pitch, but a compass.',
    rows: 6,
  },
  {
    key: 'summary.genre',
    title: 'Genre',
    placeholder: 'What genre does this story belong to? (e.g., Dark Fantasy, Psychological Thriller, Space Opera, Slice of Life)',
    rows: 2,
  },
  {
    key: 'summary.tone',
    title: 'Tone',
    placeholder: 'What does the story feel like? (e.g., Gritty and grounded, Whimsical and lighthearted, Tense and claustrophobic, Melancholic)',
    rows: 2,
  },
  {
    key: 'summary.scope',
    title: 'Scope',
    placeholder: 'How large is the world of this story? A single room? A city? A continent? The entire universe? Define the boundaries.',
    rows: 3,
  },
  {
    key: 'summary.main_characters',
    title: 'Main Characters',
    placeholder: 'Who drives this story? List the key characters and their roles. Keep it brief — full profiles live in the Story Bible.',
    rows: 5,
  },
  {
    key: 'summary.main_conflict',
    title: 'Main Conflict',
    placeholder: 'What is the central tension? What does the protagonist want, and what stands in the way?',
    rows: 4,
  },
  {
    key: 'summary.outline_overview',
    title: 'Outline Overview',
    placeholder: 'Map out the high-level structure — acts, major beats, turning points. This is the skeleton your story hangs on.',
    rows: 8,
  },
];

/* ── Save states ────────────────────────────────────────────────────── */

type SaveState = 'idle' | 'saving' | 'saved';

/* ── Single Card component ──────────────────────────────────────────── */

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

  // Update local state if initial content changes (e.g., on reload)
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

  // Save on blur immediately
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

/* ── Summary Section ────────────────────────────────────────────────── */

export default function SummarySection({ projectId }: { projectId: string }) {
  const [sectionData, setSectionData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/sections`)
      .then((r) => r.json())
      .then((data) => {
        const mapped: Record<string, string> = {};
        for (const [key, val] of Object.entries(data)) {
          mapped[key] = (val as { content: string }).content || '';
        }
        setSectionData(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {cards.map((card) => (
        <SummaryCard
          key={card.key}
          card={card}
          projectId={projectId}
          initialContent={sectionData[card.key] || ''}
        />
      ))}
    </div>
  );
}
