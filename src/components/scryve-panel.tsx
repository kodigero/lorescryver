'use client';

import { useState, useRef, useEffect } from 'react';
import { X as XIcon, Send as SendIcon, Minimize2 as MinimizeIcon, Sparkles as SparklesIcon } from 'lucide-react';
import { ScryveIcon } from '@/components/icons';

/* ── Types ──────────────────────────────────────────────────────────── */

interface Message {
  id: string;
  role: 'user' | 'scryve';
  content: string;
  timestamp: Date;
}

/* ── Placeholder responses ─────────────────────────────────────────── */

const placeholderResponses = [
  "I'm still warming up my quill! My AI capabilities are being set up. Soon I'll be able to help you brainstorm, outline, draft, and refine your narrative.",
  "My scribing abilities are almost ready. Once connected, I can help with world-building, character development, plot structure, and much more.",
  "I appreciate your patience! I'm being calibrated to assist across your entire authoring pipeline — from concept to publication.",
  "Not quite ready to scribe yet, but soon I'll be able to help you craft compelling stories across any medium — novels, screenplays, games, and beyond.",
  "My ink is still drying! When fully operational, I'll be able to assist with research, continuity checking, dialogue, pacing, and every aspect of your creative process.",
];

function getPlaceholderResponse(): string {
  return placeholderResponses[Math.floor(Math.random() * placeholderResponses.length)];
}

/* ── Component ──────────────────────────────────────────────────────── */

export default function ScryvePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate Scryve "thinking" delay
    setTimeout(() => {
      const scryveMsg: Message = {
        id: crypto.randomUUID(),
        role: 'scryve',
        content: getPlaceholderResponse(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, scryveMsg]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1500);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* ── Floating button ──────────────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/40 hover:scale-105 active:scale-95"
          title="Open Scryve"
          aria-label="Open Scryve"
        >
          <ScryveIcon className="h-6 w-6" />
        </button>
      )}

      {/* ── Chat panel ──────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[hsl(240,6%,7%)] shadow-2xl shadow-black/40">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600/20">
                <ScryveIcon className="h-4 w-4 text-brand-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Scryve</h3>
                <p className="text-[10px] text-muted-foreground">Your narrative AI</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-white transition"
                title="Minimize"
                aria-label="Minimize Scryve"
              >
                <MinimizeIcon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-white transition"
                title="Close"
                aria-label="Close Scryve"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4" role="log" aria-live="polite">
            {messages.length === 0 ? (
              /* Welcome state */
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600/10">
                  <SparklesIcon className="h-7 w-7 text-brand-400" />
                </div>
                <h4 className="text-sm font-bold text-white">How can I help?</h4>
                <p className="mt-2 max-w-[260px] text-xs leading-relaxed text-muted-foreground">
                  I&apos;m Scryve, your narrative AI assistant. Ask me anything about your story, world, characters, or writing process.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {['Brainstorm ideas', 'Build a character', 'Outline a chapter'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                        inputRef.current?.focus();
                      }}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-white/5 hover:text-white transition"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Message list */
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-brand-600 text-white rounded-br-md'
                          : 'bg-white/[0.06] text-white/90 rounded-bl-md'
                      }`}
                    >
                      {msg.role === 'scryve' && (
                        <div className="mb-1.5 flex items-center gap-1.5">
                          <ScryveIcon className="h-3 w-3 text-brand-400" />
                          <span className="text-[10px] font-semibold text-brand-400">Scryve</span>
                        </div>
                      )}
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white/[0.06] px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400" style={{ animationDelay: '0ms' }} />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400" style={{ animationDelay: '150ms' }} />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-white/5 px-3 py-3">
            <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Scryve anything..."
                aria-label="Ask Scryve"
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm text-white placeholder:text-white/30 outline-none max-h-24"
                style={{ minHeight: '20px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = '20px';
                  target.style.height = Math.min(target.scrollHeight, 96) + 'px';
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-30 disabled:hover:bg-brand-600"
              >
                <SendIcon className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-white/20">
              Scryve is in preview — responses are placeholders
            </p>
          </div>
        </div>
      )}
    </>
  );
}
