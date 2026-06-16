'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import type { Project } from '@/types/project';
import { useParams } from 'next/navigation';
import { ArrowLeft as ArrowLeftIcon, LayoutDashboard as LayoutDashboardIcon, Map as MapIcon, BookOpen as BookOpenIcon, Layers as LayersIcon, Lightbulb as LightbulbIcon, FlaskConical as FlaskIcon, Bookmark as BookmarkIcon, Search as SearchIcon, PenLine as PenLineIcon, Trash2 as TrashIcon, ChevronDown as ChevronDownIcon, Plus as PlusIcon, Settings as SettingsIcon } from 'lucide-react';
import { useDomain } from '@/contexts/domain-context';
import SummarySection from '@/components/sections/summary-section';
import StagingSection from '@/components/sections/staging-section';

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
      .then((res) => {
        const proj = res.data;
        setProject(proj);
        const pType = (proj.deliveryFormat || '').toLowerCase() || 'novel';
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
              {project.type === 'FOUNDATION'
                ? 'Story Foundation'
                : (projectTypeLabels[(project.deliveryFormat || '').toLowerCase()] || project.deliveryFormat)}
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
