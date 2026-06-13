'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

/* ── Icons ──────────────────────────────────────────────────────────── */

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function PenLineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
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

/* ── Section definitions ────────────────────────────────────────────── */

const sections = [
  { key: 'summary', label: 'Summary', icon: FileTextIcon, description: 'An overview of your project — logline, synopsis, themes, and key details at a glance.' },
  { key: 'universe', label: 'Universe Atlas', icon: GlobeIcon, description: 'Map out your world — geography, cultures, factions, timelines, and the rules that govern your universe.' },
  { key: 'canon', label: 'Canon Bible', icon: BookIcon, description: 'The single source of truth for your story — characters, lore, events, and continuity references.' },
  { key: 'manuscript', label: 'Manuscript', icon: PenLineIcon, description: 'Write and organize your narrative — chapters, scenes, acts, and the words that bring your story to life.' },
  { key: 'research', label: 'Research', icon: SearchIcon, description: 'Collect and organize your research — notes, sources, interviews, and reference material.' },
  { key: 'references', label: 'References', icon: BookmarkIcon, description: 'Bookmark inspirations, style guides, comparable works, and external references.' },
  { key: 'staging', label: 'Staging', icon: LayersIcon, description: 'Prepare your work for review and export — drafts, proofs, and pre-publication staging.' },
  { key: 'trash', label: 'Trash', icon: TrashIcon, description: 'Deleted items are kept here until permanently removed.' },
];

/* ── Project type labels ────────────────────────────────────────────── */

const projectTypeLabels: Record<string, string> = {
  novel: 'Novel',
  novella: 'Novella',
  short_story: 'Short Story',
  screenplay: 'Screenplay',
  tv_series: 'TV Series',
  web_series: 'Web Series',
  stage_play: 'Stage Play',
  musical: 'Musical',
  video_game: 'Video Game',
  visual_novel: 'Visual Novel',
  animation: 'Animation',
  comic: 'Comic / Graphic Novel',
  manga: 'Manga / Webtoon',
  podcast: 'Podcast / Audio Drama',
  tabletop_rpg: 'Tabletop RPG',
  interactive_fiction: 'Interactive Fiction',
  poetry: 'Poetry Collection',
  nonfiction: 'Narrative Non-Fiction',
  other: 'Other',
};

/* ── Status badge ───────────────────────────────────────────────────── */

const statusColors: Record<string, string> = {
  ideation: 'bg-blue-500/15 text-blue-400',
  drafting: 'bg-amber-500/15 text-amber-400',
  editing: 'bg-purple-500/15 text-purple-400',
  polishing: 'bg-emerald-500/15 text-emerald-400',
  complete: 'bg-green-500/15 text-green-400',
};

/* ── Types ──────────────────────────────────────────────────────────── */

interface Project {
  id: string;
  title: string;
  projectType: string;
  status: string;
  wordCountGoal: number;
  updatedAt: string;
}

/* ── Page ────────────────────────────────────────────────────────────── */

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('summary');

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => {
        setProject(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium">Project not found</p>
        <Link href="/dashboard" className="text-sm text-brand-400 hover:text-brand-300 transition">
          Back to Projects
        </Link>
      </div>
    );
  }

  const currentSection = sections.find((s) => s.key === activeSection) || sections[0];
  const CurrentIcon = currentSection.icon;

  return (
    <div className="flex h-full">
      {/* ── Project sidebar ──────────────────────────────────────── */}
      <aside className="flex w-56 flex-col border-r border-white/5 bg-[hsl(240,6%,7%)]">
        {/* Back + project title */}
        <div className="border-b border-white/5 px-3 py-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground transition"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            All Projects
          </Link>
          <div className="mt-2 px-2">
            <h2 className="text-sm font-bold truncate" title={project.title}>
              {project.title}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {projectTypeLabels[project.projectType] || project.projectType}
            </p>
          </div>
        </div>

        {/* Section nav */}
        <nav className="flex-1 space-y-0.5 px-3 py-3 overflow-y-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.key;
            const isTrash = section.key === 'trash';

            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-400'
                    : isTrash
                    ? 'text-muted-foreground hover:bg-white/5 hover:text-red-400 mt-4'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? '' : isTrash ? '' : ''}`} />
                {section.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main content area ────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Section header */}
        <div className="flex items-center gap-3 border-b border-white/5 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600/15">
            <CurrentIcon className="h-4.5 w-4.5 text-brand-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold">{currentSection.label}</h1>
            <p className="text-xs text-muted-foreground">{project.title}</p>
          </div>
        </div>

        {/* Section content placeholder */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-2xl py-16 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600/10">
              <CurrentIcon className="h-8 w-8 text-brand-400" />
            </div>
            <h2 className="text-xl font-bold">{currentSection.label}</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              {currentSection.description}
            </p>
            <p className="mt-6 text-xs text-muted-foreground/60">
              This section is coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
