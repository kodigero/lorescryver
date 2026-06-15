'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useDomain } from '@/contexts/domain-context';
import SummarySection from '@/components/sections/summary-section';
import StagingSection from '@/components/sections/staging-section';

/* -- Icons -- */

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function LayoutDashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
      <path d="M15 5.764v15" />
      <path d="M9 3.236v15" />
    </svg>
  );
}

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
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

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

function FlaskIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
      <path d="M8.5 2h7" />
      <path d="M7 16.5h10" />
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

/* -- Section header metadata -- */

interface SectionMeta {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const sectionMeta: Record<string, SectionMeta> = {
  summary: { label: 'Summary', icon: LayoutDashboardIcon, description: 'A high-level overview of your project - logline, synopsis, genre, tone, and key story pillars at a glance.' },
  staging: { label: 'Concept', icon: LayersIcon, description: 'Brainstorm, research, and collect references with Scryve before an idea becomes a candidate.' },
  'staging-candidate': { label: 'Candidate', icon: LayersIcon, description: 'Stress-test ideas against existing canon and future expansion before they become official.' },
  atlas: { label: 'Atlas', icon: MapIcon, description: 'The map of your universe - locations, regions, timelines, factions, and how they connect.' },
  'story-bible': { label: 'Story Bible', icon: BookOpenIcon, description: 'The canonical reference for your IP - characters, lore entries, rules, and everything that defines your story world.' },
  research: { label: 'Research', icon: SearchIcon, description: 'Notes, fact-checking, historical context, and deep-dive material supporting your story.' },
  reference: { label: 'Reference', icon: BookmarkIcon, description: 'Bookmarked inspiration, mood boards, visual references, and external links that inform your world.' },
  trash: { label: 'Trash', icon: TrashIcon, description: 'Deleted items are kept here until permanently removed.' },
};

/* -- Delivery sections (unchanged) -- */

interface Section {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const deliverySections: Record<string, Section[]> = {
  novel: [
    { key: 'manuscript', label: 'Manuscript', icon: PenLineIcon, description: 'Chapters, scenes, and prose - where the Lore Codex becomes a novel.' },
    { key: 'creation-staging', label: 'Staging & Export', icon: LayersIcon, description: 'Prepare your manuscript for review, proofing, and publication.' },
  ],
  novella: [
    { key: 'manuscript', label: 'Manuscript', icon: PenLineIcon, description: 'Chapters, scenes, and prose - your novella takes shape here.' },
    { key: 'creation-staging', label: 'Staging & Export', icon: LayersIcon, description: 'Prepare for review, proofing, and publication.' },
  ],
  short_story: [
    { key: 'manuscript', label: 'Manuscript', icon: PenLineIcon, description: 'Draft and refine your short story.' },
    { key: 'creation-staging', label: 'Staging & Export', icon: LayersIcon, description: 'Prepare for submission or publication.' },
  ],
  screenplay: [
    { key: 'script', label: 'Script', icon: PenLineIcon, description: 'Scenes, dialogue, and action lines in standard screenplay format.' },
    { key: 'creation-staging', label: 'Staging & Export', icon: LayersIcon, description: 'Export to industry-standard formats.' },
  ],
  tv_series: [
    { key: 'script', label: 'Episodes & Scripts', icon: PenLineIcon, description: 'Episode breakdowns, scripts, and season arcs.' },
    { key: 'creation-staging', label: 'Staging & Export', icon: LayersIcon, description: 'Package episodes for review and production.' },
  ],
  video_game: [
    { key: 'narrative_design', label: 'Narrative Design', icon: PenLineIcon, description: 'Quests, dialogue trees, branching paths, and game narrative.' },
    { key: 'creation-staging', label: 'Staging & Export', icon: LayersIcon, description: 'Export narrative assets for development.' },
  ],
  comic: [
    { key: 'pages', label: 'Pages & Panels', icon: PenLineIcon, description: 'Issue breakdowns, page layouts, panel descriptions, and dialogue.' },
    { key: 'creation-staging', label: 'Staging & Export', icon: LayersIcon, description: 'Prepare for lettering and print.' },
  ],
  manga: [
    { key: 'pages', label: 'Pages & Panels', icon: PenLineIcon, description: 'Chapter breakdowns, page layouts, and panel flow.' },
    { key: 'creation-staging', label: 'Staging & Export', icon: LayersIcon, description: 'Prepare for publication.' },
  ],
  animation: [
    { key: 'script', label: 'Script & Storyboard', icon: PenLineIcon, description: 'Scripts, storyboard notes, and visual direction.' },
    { key: 'creation-staging', label: 'Staging & Export', icon: LayersIcon, description: 'Package for production.' },
  ],
  podcast: [
    { key: 'script', label: 'Episodes & Scripts', icon: PenLineIcon, description: 'Episode scripts, sound cues, and voice direction.' },
    { key: 'creation-staging', label: 'Staging & Export', icon: LayersIcon, description: 'Prepare for recording and distribution.' },
  ],
};

const defaultDeliverySections: Section[] = [
  { key: 'manuscript', label: 'Manuscript', icon: PenLineIcon, description: 'Your primary creative output for this creation type.' },
  { key: 'creation-staging', label: 'Staging & Export', icon: LayersIcon, description: 'Prepare your work for review and export.' },
];

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

/* -- Types -- */

interface Project {
  id: string;
  title: string;
  projectType: string;
  status: string;
  wordCountGoal: number;
  updatedAt: string;
}

/* -- Page -- */

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { activeDomain, setDeliveryLabel, setIsInsideProject } = useDomain();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('summary');
  const [activeDeliveryType, setActiveDeliveryType] = useState<string>('');
  const [deliveryDropdownOpen, setDeliveryDropdownOpen] = useState(false);
  const [stagingOpen, setStagingOpen] = useState(true);
  const [canonOpen, setCanonOpen] = useState(true);
  const deliveryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsInsideProject(true);
    return () => setIsInsideProject(false);
  }, [setIsInsideProject]);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => {
        setProject(data);
        const pType = data.projectType || 'novel';
        setActiveDeliveryType(pType);
        setDeliveryLabel(projectTypeLabels[pType] || pType);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId, setDeliveryLabel]);

  useEffect(() => {
    if (activeDomain === 'foundation') {
      setActiveSection('summary');
    } else {
      const sections = deliverySections[activeDeliveryType] || defaultDeliverySections;
      setActiveSection(sections[0]?.key || 'manuscript');
    }
  }, [activeDomain, activeDeliveryType]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (deliveryDropdownRef.current && !deliveryDropdownRef.current.contains(e.target as Node)) {
        setDeliveryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
  const creationLabel = projectTypeLabels[activeDeliveryType] || activeDeliveryType;

  // Resolve current section metadata
  const meta = activeDomain === 'foundation'
    ? sectionMeta[activeSection] || sectionMeta.summary
    : (() => {
        const s = currentDeliverySections.find((s) => s.key === activeSection) || currentDeliverySections[0];
        return { label: s.label, icon: s.icon, description: s.description };
      })();
  const HeaderIcon = meta.icon;

  const isFullHeight = activeSection === 'staging' || activeSection === 'staging-candidate';
  const isStagingActive = activeSection === 'staging' || activeSection === 'staging-candidate';

  /* -- Render section content -- */
  function renderSectionContent() {
    if (activeSection === 'trash') {
      return (
        <div className="mx-auto max-w-2xl py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
            <TrashIcon className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold">Trash</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            Deleted items are kept here until permanently removed.
          </p>
          <p className="mt-6 text-xs text-muted-foreground/60">Trash is empty.</p>
        </div>
      );
    }

    if (activeSection === 'summary') {
      return <SummarySection projectId={projectId} />;
    }

    if (activeSection === 'staging') {
      return <StagingSection projectId={projectId} phase="concept" />;
    }

    if (activeSection === 'staging-candidate') {
      return <StagingSection projectId={projectId} phase="candidate" />;
    }

    // Default placeholder
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600/10">
          <HeaderIcon className="h-8 w-8 text-brand-400" />
        </div>
        <h2 className="text-xl font-bold">{meta.label}</h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          {meta.description}
        </p>
        <p className="mt-6 text-xs text-muted-foreground/60">This section is coming soon.</p>
      </div>
    );
  }

  /* -- Nav item helper -- */
  function navBtn(key: string, Icon: React.ComponentType<{ className?: string }>, label: string, indent?: boolean) {
    const isActive = activeSection === key;
    return (
      <button
        key={key}
        onClick={() => setActiveSection(key)}
        className={`flex w-full items-center gap-3 rounded-lg py-2 text-sm font-medium transition ${indent ? 'pl-9 pr-3' : 'px-3'} ${
          isActive
            ? 'bg-brand-600/15 text-brand-400'
            : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
        }`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>
    );
  }

  return (
    <div className="flex h-full">
      {/* -- Project sidebar -- */}
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

        {/* Creation manager (only in creation domain) */}
        {activeDomain === 'delivery' && (
          <div className="border-b border-white/5 px-3 py-2" ref={deliveryDropdownRef}>
            <div className="relative">
              <button
                onClick={() => setDeliveryDropdownOpen(!deliveryDropdownOpen)}
                className="flex w-full items-center justify-between rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-white/[0.06] transition"
              >
                <span>{creationLabel}</span>
                <ChevronDownIcon className={`h-3.5 w-3.5 text-muted-foreground transition ${deliveryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {deliveryDropdownOpen && (
                <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-lg border border-white/10 bg-[hsl(240,6%,10%)] py-1 shadow-xl">
                  <div className="flex items-center justify-between px-2.5 py-1.5">
                    <span className="text-xs font-medium text-brand-400">{creationLabel}</span>
                    <button
                      className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-white/5 hover:text-foreground transition"
                      title="Creation settings"
                    >
                      <SettingsIcon className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="border-t border-white/5 my-1" />
                  <button className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground transition">
                    <PlusIcon className="h-3 w-3" />
                    Add Creation Type
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section nav */}
        <nav className="flex-1 space-y-0.5 px-3 py-3 overflow-y-auto">
          {activeDomain === 'foundation' ? (
            <>
              {/* Summary — standalone top item */}
              {navBtn('summary', LayoutDashboardIcon, 'Summary')}

              {/* Staging group */}
              <div className="mt-3">
                <button
                  onClick={() => setStagingOpen(!stagingOpen)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition ${
                    isStagingActive ? 'text-brand-400' : 'text-muted-foreground/60 hover:text-muted-foreground'
                  }`}
                >
                  <ChevronDownIcon className={`h-3 w-3 transition ${stagingOpen ? '' : '-rotate-90'}`} />
                  Staging
                </button>
                {stagingOpen && (
                  <div className="mt-0.5 space-y-0.5">
                    {navBtn('staging', LightbulbIcon, 'Concept', true)}
                    {navBtn('staging-candidate', FlaskIcon, 'Candidate', true)}
                  </div>
                )}
              </div>

              {/* Canon group */}
              <div className="mt-3">
                <button
                  onClick={() => setCanonOpen(!canonOpen)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition ${
                    activeSection === 'atlas' || activeSection === 'story-bible'
                      ? 'text-brand-400'
                      : 'text-muted-foreground/60 hover:text-muted-foreground'
                  }`}
                >
                  <ChevronDownIcon className={`h-3 w-3 transition ${canonOpen ? '' : '-rotate-90'}`} />
                  Canon
                </button>
                {canonOpen && (
                  <div className="mt-0.5 space-y-0.5">
                    {navBtn('atlas', MapIcon, 'Atlas', true)}
                    {navBtn('story-bible', BookOpenIcon, 'Story Bible', true)}
                  </div>
                )}
              </div>
            </>
          ) : (
            currentDeliverySections.map((section) => {
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
            })
          )}
        </nav>

        {/* Bottom utility items */}
        {activeDomain === 'foundation' && (
          <div className="border-t border-white/5 px-3 py-2 space-y-0.5">
            {navBtn('research', SearchIcon, 'Research')}
            {navBtn('reference', BookmarkIcon, 'Reference')}
          </div>
        )}

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

      {/* -- Main content area -- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Section header */}
        <div className="flex items-center gap-3 border-b border-white/5 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600/15">
            <HeaderIcon className="h-4 w-4 text-brand-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold">{meta.label}</h1>
            <p className="text-xs text-muted-foreground">{project.title}</p>
          </div>
        </div>

        {/* Section content */}
        <div className={`flex-1 ${isFullHeight ? 'flex flex-col overflow-hidden' : 'overflow-y-auto p-6 md:p-8'}`}>
          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
}
