'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
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

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

function NetworkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="16" y="16" width="6" height="6" rx="1" />
      <rect x="2" y="16" width="6" height="6" rx="1" />
      <rect x="9" y="2" width="6" height="6" rx="1" />
      <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
      <path d="M12 12V8" />
    </svg>
  );
}

function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
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

function PenLineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
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

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
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

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/* ── Section definitions ────────────────────────────────────────────── */

interface Section {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const foundationSections: Section[] = [
  { key: 'premise', label: 'Premise & Concept', icon: SparklesIcon, description: 'The seed of your story — logline, theme, genre, tone, and the central dramatic question.' },
  { key: 'characters', label: 'Characters', icon: UsersIcon, description: 'Universal character profiles — roles, motivations, arcs, relationships, and backstories.' },
  { key: 'world', label: 'World', icon: GlobeIcon, description: 'Your setting layer — locations, rules, history, factions, and the systems that govern your universe.' },
  { key: 'plot', label: 'Plot Structure', icon: NetworkIcon, description: 'The narrative backbone — acts, turning points, subplots, and story beats in abstract form.' },
  { key: 'themes', label: 'Themes & Motifs', icon: PaletteIcon, description: 'Recurring ideas, symbols, and the thematic argument your story is making.' },
  { key: 'research', label: 'Research & Reference', icon: SearchIcon, description: 'Supporting material — notes, inspiration, mood boards, and source material.' },
];

/* Delivery sections per project type */
const deliverySections: Record<string, Section[]> = {
  novel: [
    { key: 'manuscript', label: 'Manuscript', icon: PenLineIcon, description: 'Chapters, scenes, and prose — where the Story Foundation becomes a novel.' },
    { key: 'staging', label: 'Staging & Export', icon: LayersIcon, description: 'Prepare your manuscript for review, proofing, and publication.' },
  ],
  novella: [
    { key: 'manuscript', label: 'Manuscript', icon: PenLineIcon, description: 'Chapters, scenes, and prose — your novella takes shape here.' },
    { key: 'staging', label: 'Staging & Export', icon: LayersIcon, description: 'Prepare for review, proofing, and publication.' },
  ],
  short_story: [
    { key: 'manuscript', label: 'Manuscript', icon: PenLineIcon, description: 'Draft and refine your short story.' },
    { key: 'staging', label: 'Staging & Export', icon: LayersIcon, description: 'Prepare for submission or publication.' },
  ],
  screenplay: [
    { key: 'script', label: 'Script', icon: PenLineIcon, description: 'Scenes, dialogue, and action lines in standard screenplay format.' },
    { key: 'staging', label: 'Staging & Export', icon: LayersIcon, description: 'Export to industry-standard formats.' },
  ],
  tv_series: [
    { key: 'script', label: 'Episodes & Scripts', icon: PenLineIcon, description: 'Episode breakdowns, scripts, and season arcs.' },
    { key: 'staging', label: 'Staging & Export', icon: LayersIcon, description: 'Package episodes for review and production.' },
  ],
  video_game: [
    { key: 'narrative_design', label: 'Narrative Design', icon: PenLineIcon, description: 'Quests, dialogue trees, branching paths, and game narrative.' },
    { key: 'staging', label: 'Staging & Export', icon: LayersIcon, description: 'Export narrative assets for development.' },
  ],
  comic: [
    { key: 'pages', label: 'Pages & Panels', icon: PenLineIcon, description: 'Issue breakdowns, page layouts, panel descriptions, and dialogue.' },
    { key: 'staging', label: 'Staging & Export', icon: LayersIcon, description: 'Prepare for lettering and print.' },
  ],
  manga: [
    { key: 'pages', label: 'Pages & Panels', icon: PenLineIcon, description: 'Chapter breakdowns, page layouts, and panel flow.' },
    { key: 'staging', label: 'Staging & Export', icon: LayersIcon, description: 'Prepare for publication.' },
  ],
  animation: [
    { key: 'script', label: 'Script & Storyboard', icon: PenLineIcon, description: 'Scripts, storyboard notes, and visual direction.' },
    { key: 'staging', label: 'Staging & Export', icon: LayersIcon, description: 'Package for production.' },
  ],
  podcast: [
    { key: 'script', label: 'Episodes & Scripts', icon: PenLineIcon, description: 'Episode scripts, sound cues, and voice direction.' },
    { key: 'staging', label: 'Staging & Export', icon: LayersIcon, description: 'Prepare for recording and distribution.' },
  ],
};

// Fallback for types not yet mapped
const defaultDeliverySections: Section[] = [
  { key: 'manuscript', label: 'Manuscript', icon: PenLineIcon, description: 'Your primary creative output for this delivery type.' },
  { key: 'staging', label: 'Staging & Export', icon: LayersIcon, description: 'Prepare your work for review and export.' },
];

/* ── Project type labels ────────────────────────────────────────────── */

const projectTypeLabels: Record<string, string> = {
  novel: 'Novel', novella: 'Novella', short_story: 'Short Story',
  screenplay: 'Screenplay', tv_series: 'TV Series', web_series: 'Web Series',
  stage_play: 'Stage Play', musical: 'Musical', video_game: 'Video Game',
  visual_novel: 'Visual Novel', animation: 'Animation',
  comic: 'Comic / Graphic Novel', manga: 'Manga / Webtoon',
  podcast: 'Podcast / Audio Drama', tabletop_rpg: 'Tabletop RPG',
  interactive_fiction: 'Interactive Fiction', poetry: 'Poetry Collection',
  nonfiction: 'Narrative Non-Fiction', other: 'Other',
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

type Domain = 'foundation' | 'delivery';

/* ── Page ────────────────────────────────────────────────────────────── */

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDomain, setActiveDomain] = useState<Domain>('foundation');
  const [activeSection, setActiveSection] = useState('premise');
  const [activeDeliveryType, setActiveDeliveryType] = useState<string>('');
  const [deliveryDropdownOpen, setDeliveryDropdownOpen] = useState(false);
  const deliveryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => {
        setProject(data);
        setActiveDeliveryType(data.projectType || 'novel');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  // Close delivery dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (deliveryDropdownRef.current && !deliveryDropdownRef.current.contains(e.target as Node)) {
        setDeliveryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setDeliveryDropdownOpen(false);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

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

  const currentDeliverySections = deliverySections[activeDeliveryType] || defaultDeliverySections;
  const currentSections = activeDomain === 'foundation' ? foundationSections : currentDeliverySections;
  const currentSection = currentSections.find((s) => s.key === activeSection) || currentSections[0];
  const CurrentIcon = currentSection.icon;
  const deliveryLabel = projectTypeLabels[activeDeliveryType] || activeDeliveryType;

  function switchDomain(domain: Domain) {
    setActiveDomain(domain);
    if (domain === 'foundation') {
      setActiveSection('premise');
    } else {
      const sections = deliverySections[activeDeliveryType] || defaultDeliverySections;
      setActiveSection(sections[0]?.key || 'manuscript');
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* ── Domain toggle bar ───────────────────────────────────── */}
      <div className="flex h-10 shrink-0 items-center justify-center border-b border-white/5 bg-[hsl(240,6%,7%)]">
        <div className="flex h-7 items-center rounded-lg bg-white/[0.04] border border-white/5 p-0.5">
          <button
            onClick={() => switchDomain('foundation')}
            className={`h-6 rounded-md px-3.5 text-xs font-semibold transition ${
              activeDomain === 'foundation'
                ? 'bg-brand-600/20 text-brand-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Story Foundation
          </button>
          <button
            onClick={() => switchDomain('delivery')}
            className={`h-6 rounded-md px-3.5 text-xs font-semibold transition ${
              activeDomain === 'delivery'
                ? 'bg-brand-600/20 text-brand-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Delivery · {deliveryLabel}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
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

          {/* Delivery manager (only in delivery domain) */}
          {activeDomain === 'delivery' && (
            <div className="border-b border-white/5 px-3 py-2" ref={deliveryDropdownRef}>
              <div className="relative">
                <button
                  onClick={() => setDeliveryDropdownOpen(!deliveryDropdownOpen)}
                  className="flex w-full items-center justify-between rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-white/[0.06] transition"
                >
                  <span>{deliveryLabel}</span>
                  <ChevronDownIcon className={`h-3.5 w-3.5 text-muted-foreground transition ${deliveryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {deliveryDropdownOpen && (
                  <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-lg border border-white/10 bg-[hsl(240,6%,10%)] py-1 shadow-xl">
                    {/* Current delivery type */}
                    <div className="flex items-center justify-between px-2.5 py-1.5">
                      <span className="text-xs font-medium text-brand-400">{deliveryLabel}</span>
                      <button
                        className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-white/5 hover:text-foreground transition"
                        title="Delivery settings"
                      >
                        <SettingsIcon className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="border-t border-white/5 my-1" />

                    {/* Add new delivery */}
                    <button className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground transition">
                      <PlusIcon className="h-3 w-3" />
                      Add Delivery Type
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section nav */}
          <nav className="flex-1 space-y-0.5 px-3 py-3 overflow-y-auto">
            {currentSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.key;

              return (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-600/15 text-brand-400'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </button>
              );
            })}
          </nav>

          {/* Trash pinned bottom */}
          <div className="border-t border-white/5 px-3 py-2">
            <button
              onClick={() => setActiveSection('trash')}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                activeSection === 'trash'
                  ? 'bg-brand-600/15 text-brand-400'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-red-400'
              }`}
            >
              <TrashIcon className="h-4 w-4" />
              Trash
            </button>
          </div>
        </aside>

        {/* ── Main content area ────────────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Section header */}
          <div className="flex items-center gap-3 border-b border-white/5 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600/15">
              <CurrentIcon className="h-4 w-4 text-brand-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold">{activeSection === 'trash' ? 'Trash' : currentSection.label}</h1>
              <p className="text-xs text-muted-foreground">{project.title}</p>
            </div>
          </div>

          {/* Section content placeholder */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {activeSection === 'trash' ? (
              <div className="mx-auto max-w-2xl py-16 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
                  <TrashIcon className="h-8 w-8 text-red-400" />
                </div>
                <h2 className="text-xl font-bold">Trash</h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                  Deleted items are kept here until permanently removed.
                </p>
                <p className="mt-6 text-xs text-muted-foreground/60">
                  Trash is empty.
                </p>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
