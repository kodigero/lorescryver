import Link from 'next/link';

/* ── Icon components (inline SVG to avoid extra deps) ───────────────── */

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

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
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

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
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

function WandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
      <path d="m14 7 3 3" />
      <path d="M5 6v4" /><path d="M19 14v4" />
      <path d="M10 2v2" /><path d="M7 8H3" />
      <path d="M21 16h-4" /><path d="M11 3H9" />
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

function RocketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/* ── Data ────────────────────────────────────────────────────────────── */

const mediaTypes = [
  'Novels & Books',
  'Video Games',
  'Animation & Anime',
  'Film & TV',
  'Tabletop RPGs',
  'Comics & Manga',
  'Audio Dramas',
  'Interactive Fiction',
];

const pipeline = [
  {
    step: '01',
    title: 'Ideate & Worldbuild',
    description: 'Brainstorm plots, map systems, build character arcs, and organize your story bible — whether you’re writing a novel, a game script, or a screenplay.',
    icon: SparklesIcon,
  },
  {
    step: '02',
    title: 'Draft',
    description: 'Write in a distraction-free rich editor with inline AI suggestions, automatic chapter and scene management, and real-time word tracking.',
    icon: PenIcon,
  },
  {
    step: '03',
    title: 'Edit & Polish',
    description: 'Catch plot holes, tighten prose, and refine dialogue with AI-powered developmental and line editing tools.',
    icon: WandIcon,
  },
  {
    step: '04',
    title: 'Compile & Format',
    description: 'Export to ePub, PDF, DOCX, screenplay format, or custom templates with professional layouts and style presets.',
    icon: LayersIcon,
  },
  {
    step: '05',
    title: 'Publish & Distribute',
    description: 'Distribute to storefronts, share with collaborators, track versions, and manage your narrative portfolio across projects.',
    icon: RocketIcon,
  },
];

const features = [
  {
    title: 'Story Bible',
    description: 'A living wiki for your world — characters, locations, timelines, and lore, all cross-linked and searchable across every project.',
    icon: BookIcon,
  },
  {
    title: 'Scryve',
    description: 'Your virtual scribe. Context-aware AI that knows your world — offering suggestions that respect your canon, tone, and style.',
    icon: SparklesIcon,
  },
  {
    title: 'Rich Text Editor',
    description: 'A beautiful, responsive writing surface built for long-form narrative. Markdown shortcuts, focus mode, and chapter navigation.',
    icon: PenIcon,
  },
  {
    title: 'Multi-Format Export',
    description: 'One-click compilation to ePub, Kindle, PDF, DOCX, screenplay, and custom formats with professional typesetting.',
    icon: LayersIcon,
  },
  {
    title: 'Universe Management',
    description: 'Manage shared universes across projects — cross-project continuity checks, shared bibles, and universe-level metadata.',
    icon: GlobeIcon,
  },
  {
    title: 'Project Dashboard',
    description: 'Track progress, manage versions, view analytics, and coordinate across all your narrative projects from one screen.',
    icon: RocketIcon,
  },
];

const plans = [
  {
    name: 'Scribe',
    price: 'Free',
    period: '',
    description: 'For storytellers just getting started.',
    features: [
      '1 active project',
      'Basic rich text editor',
      'Story bible (50 entries)',
      'Export to DOCX',
      'Community support',
    ],
    cta: 'Start Writing',
    featured: false,
  },
  {
    name: 'Storyteller',
    price: '$12',
    period: '/mo',
    description: 'For serious creators building worlds.',
    features: [
      'Unlimited projects',
      'Full rich text editor',
      'Unlimited story bible',
      'Scryve (50k words/mo)',
      'All export formats',
      'Universe management',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    featured: true,
  },
  {
    name: 'Worldsmith',
    price: '$29',
    period: '/mo',
    description: 'For prolific creators and studios.',
    features: [
      'Everything in Storyteller',
      'Scryve (unlimited)',
      'Advanced analytics',
      'Project dashboard',
      'Custom export templates',
      'Custom style presets',
      'Team collaboration',
      'Dedicated support',
    ],
    cta: 'Start Free Trial',
    featured: false,
  },
];

/* ── Page ────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[40%] left-1/2 h-[80%] w-[80%] -translate-x-1/2 rounded-full bg-brand-700/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] right-0 h-[50%] w-[50%] rounded-full bg-brand-900/10 blur-[100px]" />
      </div>

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav className="relative z-50 border-b border-white/5">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <QuillIcon className="h-7 w-7 text-brand-500" />
            <span className="text-xl font-bold tracking-tight">
              Lore<span className="text-brand-500">Scryver</span>
            </span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#pipeline" className="text-sm text-muted-foreground transition hover:text-foreground">Pipeline</a>
            <a href="#features" className="text-sm text-muted-foreground transition hover:text-foreground">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground transition hover:text-foreground">Pricing</a>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Get Started
            </Link>
          </div>
          <details className="group relative md:hidden">
            <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground [&::-webkit-details-marker]:hidden">
              <MenuIcon className="h-4 w-4" />
            </summary>
            <div className="absolute right-0 top-11 w-56 rounded-xl border border-white/10 bg-[hsl(240,6%,7%)] p-2 shadow-2xl">
              <a href="#pipeline" className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground">Pipeline</a>
              <a href="#features" className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground">Features</a>
              <a href="#pricing" className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground">Pricing</a>
              <div className="my-2 border-t border-white/10" />
              <Link href="/login" className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground">Sign in</Link>
              <Link href="/register" className="mt-1 flex h-9 items-center justify-center rounded-lg bg-brand-600 px-3 text-sm font-medium text-white transition hover:bg-brand-700">Get Started</Link>
            </div>
          </details>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-24 text-center md:pt-32 lg:pt-40">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-300">
            <SparklesIcon className="h-4 w-4" />
            AI-Powered Narrative Authoring Platform
          </div>

          <h1 className="font-serif text-5xl font-black leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
            If it has a story,{' '}
            <span className="gradient-text">LoreScryver writes it</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            The all-in-one command center for storytellers. Write and manage
            narrative for books, games, animation, film, and any medium with a
            story &mdash; with Scryve, your virtual scribe.
          </p>

          {/* Media type pills */}
          <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-2">
            {mediaTypes.map((media) => (
              <span
                key={media}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground"
              >
                {media}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex h-12 items-center gap-2 rounded-xl bg-brand-600 px-8 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 hover:shadow-brand-600/40"
            >
              Start Creating &mdash; It&apos;s Free
              <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#pipeline"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 text-base font-medium text-foreground transition hover:bg-white/10"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Editor mockup */}
        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="gradient-border glow overflow-hidden rounded-2xl">
            <div className="rounded-2xl bg-[hsl(240,6%,7%)] p-1">
              {/* Title bar */}
              <div className="flex items-center gap-2 rounded-t-xl bg-[hsl(240,6%,10%)] px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/70" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                  <div className="h-3 w-3 rounded-full bg-green-500/70" />
                </div>
                <span className="ml-4 text-xs text-muted-foreground">
                  Chapter 7 &mdash; The Crimson Gate
                </span>
              </div>
              {/* Editor body */}
              <div className="grid grid-cols-12 gap-0">
                {/* Sidebar */}
                <div className="col-span-3 border-r border-white/5 p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Chapters
                  </div>
                  {['Prologue', 'The Awakening', 'Shadows Rise', 'Blood Oath', 'The Crossing', 'Whispers', 'The Crimson Gate'].map(
                    (ch, i) => (
                      <div
                        key={ch}
                        className={`mb-1 rounded-md px-3 py-1.5 text-sm ${
                          i === 6
                            ? 'bg-brand-600/20 text-brand-300 font-medium'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {ch}
                      </div>
                    )
                  )}
                </div>
                {/* Writing area */}
                <div className="col-span-6 p-6">
                  <p className="font-serif text-lg leading-relaxed text-foreground/90">
                    The gate loomed before her, its surface alive with crimson
                    runes that pulsed like a heartbeat. Kaelith pressed her palm
                    against the cold iron, and the world around her dissolved into
                    light.
                  </p>
                  <p className="mt-4 font-serif text-lg leading-relaxed text-foreground/90">
                    &ldquo;You shouldn&apos;t be here,&rdquo; the voice echoed
                    from everywhere and nowhere at once. She recognized it &mdash; the
                    same voice from the prophecy scrolls.
                  </p>
                  <p className="mt-4 font-serif text-lg leading-relaxed text-foreground/60">
                    She drew her blade, its edge catching the strange light. The
                    runes on the gate shifted, rearranging themselves into words
                    she could almost read...
                  </p>
                  <div className="mt-2 h-5 w-0.5 animate-pulse bg-brand-500" />
                </div>
                {/* Bible sidebar */}
                <div className="col-span-3 border-l border-white/5 p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Story Bible
                  </div>
                  <div className="mb-3 rounded-lg bg-white/5 p-3">
                    <div className="text-xs font-semibold text-brand-400">Kaelith</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Half-elf ranger, scar on left cheek. Carries the Blade of
                      Aureth.
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3">
                    <div className="text-xs font-semibold text-brand-400">Crimson Gate</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Ancient portal to the Dusk Realm. Activated by royal blood.
                    </div>
                  </div>
                </div>
              </div>
              {/* Status bar */}
              <div className="flex items-center justify-between rounded-b-xl bg-[hsl(240,6%,10%)] px-4 py-2 text-xs text-muted-foreground">
                <span>Chapter 7 of 24</span>
                <span>2,847 words</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Auto-saved
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PIPELINE ────────────────────────────────────────────────── */}
      <section id="pipeline" className="relative z-10 border-t border-white/5 bg-black/20 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
              Your complete authoring <span className="gradient-text">pipeline</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Five phases. One workspace. Every tool a storyteller needs, from
              the first spark of an idea to a finished, polished narrative.
            </p>
          </div>

          <div className="mt-16 space-y-6">
            {pipeline.map((phase) => {
              const Icon = phase.icon;
              return (
                <div
                  key={phase.step}
                  className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition hover:border-brand-500/30 hover:bg-white/[0.04] md:flex md:items-center md:gap-8 md:p-8"
                >
                  <div className="mb-4 flex items-center gap-4 md:mb-0 md:w-64 md:shrink-0">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600/15 text-brand-400 transition group-hover:bg-brand-600/25">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-widest text-brand-500">
                        Phase {phase.step}
                      </div>
                      <div className="text-lg font-bold">{phase.title}</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground md:text-base">
                    {phase.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 border-t border-white/5 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need to <span className="gradient-text">create</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Purpose-built tools for storytellers &mdash; not generic docs with a writing skin.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition hover:border-brand-500/20 hover:bg-white/[0.04]"
                >
                  <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600/15 text-brand-400 transition group-hover:bg-brand-600/25">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────── */}
      <section id="pricing" className="relative z-10 border-t border-white/5 bg-black/20 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
              Simple, creator-friendly <span className="gradient-text">pricing</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free. Upgrade when your story demands it.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-8 transition ${
                  plan.featured
                    ? 'border-brand-500/40 bg-brand-600/5 shadow-lg shadow-brand-600/10'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                </div>
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`inline-flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition ${
                    plan.featured
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700'
                      : 'border border-white/10 bg-white/5 text-foreground hover:bg-white/10'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 border-t border-white/5 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
            Ready to bring your story to life?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Join thousands of storytellers who&apos;ve found their home.
            Whether it&apos;s a novel, a game, or a screenplay &mdash; if it has a
            story, LoreScryver can write it.
          </p>
          <div className="mt-10">
            <Link
              href="/register"
              className="group inline-flex h-12 items-center gap-2 rounded-xl bg-brand-600 px-8 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 hover:shadow-brand-600/40"
            >
              Get Started Free
              <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <QuillIcon className="h-5 w-5 text-brand-500" />
              <span className="font-bold">
                Lore<span className="text-brand-500">Scryver</span>
              </span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#pipeline" className="transition hover:text-foreground">Pipeline</a>
              <a href="#features" className="transition hover:text-foreground">Features</a>
              <a href="#pricing" className="transition hover:text-foreground">Pricing</a>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2026 LoreScryver. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
