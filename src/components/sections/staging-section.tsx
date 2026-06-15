'use client';
import { useState, useEffect, useRef } from 'react';

/* -- Icons -- */

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

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
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

/* -- Types -- */

interface ConceptSummary {
  id: string;
  title: string;
  phase: string;
  stage: string;
  updatedAt: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/* -- Component -- */

export default function StagingSection({ projectId }: { projectId: string }) {
  const [concepts, setConcepts] = useState<ConceptSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/staging`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setConcepts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    if (activeId && !sending) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [activeId, sending]);

  async function createConcept() {
    setCreating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/staging`, { method: 'POST' });
      if (res.ok) {
        const concept = await res.json();
        setConcepts((prev) => [
          { id: concept.id, title: concept.title, phase: concept.phase, stage: concept.stage, updatedAt: concept.updatedAt },
          ...prev,
        ]);
        setActiveId(concept.id);
        setMessages(Array.isArray(concept.messages) ? concept.messages : []);
      }
    } finally {
      setCreating(false);
    }
  }

  async function selectConcept(id: string) {
    if (id === activeId) return;
    setActiveId(id);
    setMessages([]);
    try {
      const res = await fetch(`/api/projects/${projectId}/staging/${id}`);
      if (res.ok) {
        const concept = await res.json();
        setMessages(Array.isArray(concept.messages) ? concept.messages : []);
      }
    } catch {
      /* ignore */
    }
  }

  async function sendMessage() {
    if (!input.trim() || !activeId || sending) return;

    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/scryve/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated, projectId, conceptId: activeId }),
      });

      if (res.ok) {
        const { content } = await res.json();
        setMessages((prev) => [...prev, { role: 'assistant', content }]);

        // Update title in sidebar from first user message
        if (updated.filter((m) => m.role === 'user').length === 1) {
          const raw = userMsg.content.trim();
          const title = raw.length > 60 ? raw.slice(0, 57) + '...' : raw;
          setConcepts((prev) => prev.map((c) => (c.id === activeId ? { ...c, title } : c)));
        }
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setSending(false);
    }
  }

  async function deleteConcept(id: string) {
    await fetch(`/api/projects/${projectId}/staging/${id}`, { method: 'DELETE' });
    setConcepts((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  /* -- Empty state -- */
  if (concepts.length === 0 && !activeId) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600/10">
          <ScryveIcon className="h-8 w-8 text-brand-400" />
        </div>
        <h2 className="text-xl font-bold">Staging</h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          The forge where ideas are born, tested, and refined into canon. Start a brainstorming session with Scryve to capture your first concept.
        </p>
        <button
          onClick={createConcept}
          disabled={creating}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {creating ? <SpinnerIcon className="h-4 w-4 animate-spin" /> : <ScryveIcon className="h-4 w-4" />}
          Start Brainstorming
        </button>
      </div>
    );
  }

  /* -- Split view -- */
  return (
    <div className="flex flex-1 min-h-0">
      {/* Concept list sidebar */}
      <div className="w-60 flex flex-col border-r border-white/[0.06] bg-white/[0.02] shrink-0">
        <div className="p-3 border-b border-white/[0.06]">
          <button
            onClick={createConcept}
            disabled={creating}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {creating ? <SpinnerIcon className="h-3.5 w-3.5 animate-spin" /> : <PlusIcon className="h-3.5 w-3.5" />}
            New Session
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {concepts.map((concept) => (
            <div
              key={concept.id}
              onClick={() => selectConcept(concept.id)}
              className={`group flex items-center gap-2 px-3 py-2.5 cursor-pointer transition border-b border-white/[0.03] ${
                activeId === concept.id ? 'bg-brand-600/10' : 'hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-medium truncate ${
                    activeId === concept.id ? 'text-brand-400' : 'text-foreground'
                  }`}
                >
                  {concept.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-block rounded-full bg-brand-600/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-brand-400">
                    {concept.phase}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConcept(concept.id);
                }}
                className="hidden group-hover:flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-red-400 transition"
                title="Delete"
              >
                <TrashIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {activeId ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600/20">
                      <ScryveIcon className="h-3 w-3 text-brand-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white'
                        : 'bg-white/[0.06] text-foreground'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="mr-2 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600/20">
                    <ScryveIcon className="h-3 w-3 text-brand-400" />
                  </div>
                  <div className="bg-white/[0.06] rounded-2xl px-4 py-2.5">
                    <SpinnerIcon className="h-4 w-4 animate-spin text-brand-400" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/[0.06] p-3">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type your thoughts..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-brand-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Send"
                >
                  <SendIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Select a session or start a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
