'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

/* ── Icons ──────────────────────────────────────────────────────────── */

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function QuillIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
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

function PenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/* ── Project type options ───────────────────────────────────────────── */

const projectTypes = [
  { value: 'novel', label: 'Novel' },
  { value: 'novella', label: 'Novella' },
  { value: 'short_story', label: 'Short Story' },
  { value: 'screenplay', label: 'Screenplay' },
  { value: 'tv_series', label: 'TV Series' },
  { value: 'web_series', label: 'Web Series' },
  { value: 'stage_play', label: 'Stage Play' },
  { value: 'musical', label: 'Musical' },
  { value: 'video_game', label: 'Video Game' },
  { value: 'visual_novel', label: 'Visual Novel' },
  { value: 'animation', label: 'Animation' },
  { value: 'comic', label: 'Comic / Graphic Novel' },
  { value: 'manga', label: 'Manga / Webtoon' },
  { value: 'podcast', label: 'Podcast / Audio Drama' },
  { value: 'tabletop_rpg', label: 'Tabletop RPG' },
  { value: 'interactive_fiction', label: 'Interactive Fiction' },
  { value: 'poetry', label: 'Poetry Collection' },
  { value: 'nonfiction', label: 'Narrative Non-Fiction' },
  { value: 'other', label: 'Other' },
];

const projectTypeLabels: Record<string, string> = Object.fromEntries(
  projectTypes.map((t) => [t.value, t.label])
);

/* ── Status badge ───────────────────────────────────────────────────── */

const statusColors: Record<string, string> = {
  ideation: 'bg-blue-500/15 text-blue-400',
  drafting: 'bg-amber-500/15 text-amber-400',
  editing: 'bg-purple-500/15 text-purple-400',
  polishing: 'bg-emerald-500/15 text-emerald-400',
  complete: 'bg-green-500/15 text-green-400',
};

function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status] || 'bg-white/10 text-muted-foreground';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${color}`}>
      {status}
    </span>
  );
}

/* ── Types ──────────────────────────────────────────────────────────── */

interface Project {
  id: string;
  title: string;
  projectType: string;
  status: string;
  wordCountGoal: number;
  updatedAt: string;
}

/* ── Create Project Modal ───────────────────────────────────────────── */

function CreateProjectModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}) {
  const [title, setTitle] = useState('');
  const [projectType, setProjectType] = useState('novel');
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), projectType }),
      });
      if (res.ok) {
        const project = await res.json();
        onCreated(project);
        setTitle('');
        setProjectType('novel');
        onClose();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => {
        // Close when clicking on the backdrop (outside the modal card)
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <div ref={modalRef} className="w-full max-w-md rounded-2xl border border-white/10 bg-[hsl(240,6%,10%)] p-6 shadow-2xl">
        <h2 className="text-lg font-bold">Create New Project</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Give your story a name and choose its medium.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="project-title" className="mb-1.5 block text-sm font-medium">
              Project Title
            </label>
            <input
              id="project-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Crimson Gate"
              autoFocus
              className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label htmlFor="project-type" className="mb-1.5 block text-sm font-medium">
              Project Type
            </label>
            <div className="relative">
              <select
                id="project-type"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="flex h-10 w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 pr-9 text-sm text-foreground focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {projectTypes.map((type) => (
                  <option key={type.value} value={type.value} className="bg-[hsl(240,6%,10%)] text-white">
                    {type.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-medium transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || loading}
              className="h-9 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Fetch projects on mount
  useState(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        setProjects(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  });

  // Close context menu and editing when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      // Close context menu if clicking outside of it
      if (menuOpen) {
        const menuEl = document.querySelector('[data-context-menu]');
        const triggerEl = document.querySelector(`[data-menu-trigger="${menuOpen}"]`);
        if (
          menuEl && !menuEl.contains(target) &&
          triggerEl && !triggerEl.contains(target)
        ) {
          setMenuOpen(null);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Close menus on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(null);
        setEditingId(null);
        setShowCreate(false);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
    setMenuOpen(null);
  }

  function startEdit(project: Project) {
    setEditingId(project.id);
    setEditTitle(project.title);
    setMenuOpen(null);
  }

  async function saveEdit(id: string) {
    if (!editTitle.trim()) return;
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle.trim() }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    }
    setEditingId(null);
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 md:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {projects.length === 0
              ? 'Create your first narrative project'
              : `${projects.length} project${projects.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700"
        >
          <PlusIcon className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        {!loaded ? (
          /* Loading skeleton */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          /* Empty state */
          <div className="mx-auto max-w-md py-24 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600/15">
              <QuillIcon className="h-8 w-8 text-brand-400" />
            </div>
            <h2 className="text-xl font-bold">No projects yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Every great story starts with a blank page. Create your first
              project and start building your world.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-6 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700"
            >
              <PlusIcon className="h-4 w-4" />
              Create Your First Project
            </button>
          </div>
        ) : (
          /* Project grid */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:border-brand-500/20 hover:bg-white/[0.04]"
              >
                {/* Title or edit input */}
                {editingId === project.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(project.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                      className="h-8 flex-1 rounded-md border border-brand-500 bg-white/5 px-2 text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => saveEdit(project.id)}
                      className="h-8 rounded-md bg-brand-600 px-3 text-xs font-semibold text-white"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <h3 className="text-base font-bold pr-8">{project.title}</h3>
                )}

                {/* Project type + status */}
                <div className="mt-2 flex items-center gap-2">
                  {project.projectType && (
                    <span className="text-xs text-muted-foreground">
                      {projectTypeLabels[project.projectType] || project.projectType}
                    </span>
                  )}
                  {project.projectType && <span className="text-white/20">·</span>}
                  <StatusBadge status={project.status} />
                </div>

                {/* Word count goal */}
                <div className="mt-3 text-xs text-muted-foreground">
                  Goal: {project.wordCountGoal.toLocaleString()} words
                </div>

                {/* Updated at */}
                <div className="mt-1 text-xs text-muted-foreground">
                  Updated {new Date(project.updatedAt).toLocaleDateString()}
                </div>

                {/* Actions menu */}
                <div className="absolute right-4 top-4">
                  <button
                    data-menu-trigger={project.id}
                    onClick={() => setMenuOpen(menuOpen === project.id ? null : project.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition hover:bg-white/10 group-hover:opacity-100"
                  >
                    <MoreIcon className="h-4 w-4" />
                  </button>

                  {menuOpen === project.id && (
                    <div data-context-menu className="absolute right-0 top-8 z-10 w-36 rounded-lg border border-white/10 bg-[hsl(240,6%,10%)] py-1 shadow-xl">
                      <button
                        onClick={() => startEdit(project)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                      >
                        <PenIcon className="h-3.5 w-3.5" />
                        Rename
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      <CreateProjectModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(project) => setProjects((prev) => [project, ...prev])}
      />
    </>
  );
}
