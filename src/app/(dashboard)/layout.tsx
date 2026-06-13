'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import ScryvePanel from '@/components/scryve-panel';
import { DomainProvider, useDomain } from '@/contexts/domain-context';

/* ── Icons ────────────────────────────────────────────────────────────────── */

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

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
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

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
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

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" /><path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" /><path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function HelpCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

/* ── Navigation items ─────────────────────────────────────────────────── */

const navItems = [
  { label: 'Projects', href: '/dashboard', icon: FolderIcon },
];

/* ── Placeholder notifications ──────────────────────────────────────── */

const notifications = [
  {
    id: 1,
    title: 'Welcome to LoreScryver!',
    message: 'Start by creating your first project.',
    time: 'Just now',
    unread: true,
  },
  {
    id: 2,
    title: 'Tip: Story Bible',
    message: 'Use the Story Bible to keep track of characters, locations, and lore.',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 3,
    title: 'Your Scryve AI is ready',
    message: 'Scryve can help you brainstorm, outline, and refine your narrative.',
    time: '1 day ago',
    unread: false,
  },
];

/* ── Domain Toggle (rendered in top bar when inside a project) ──── */

function DomainToggle() {
  const { activeDomain, setActiveDomain, deliveryLabel } = useDomain();

  return (
    <div className="flex h-7 items-center rounded-lg bg-white/[0.04] border border-white/5 p-0.5">
      <button
        onClick={() => setActiveDomain('foundation')}
        className={`h-6 rounded-md px-3.5 text-xs font-semibold transition ${
          activeDomain === 'foundation'
            ? 'bg-brand-600/20 text-brand-400'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Lore Codex
      </button>
      <button
        onClick={() => setActiveDomain('delivery')}
        className={`h-6 rounded-md px-3.5 text-xs font-semibold transition ${
          activeDomain === 'delivery'
            ? 'bg-brand-600/20 text-brand-400'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Creation · {deliveryLabel}
      </button>
    </div>
  );
}

/* ── Inner Layout (needs context) ─────────────────────────────────── */

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isInsideProject } = useDomain();
  const [isDark, setIsDark] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Toggle dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
        setNotifOpen(false);
        setProfileOpen(false);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const topbarBg = isDark ? 'bg-[hsl(240,6%,7%)]' : 'bg-white';
  const topbarBorder = isDark ? 'border-white/5' : 'border-gray-200';
  const sidebarBg = isDark ? 'bg-[hsl(240,6%,7%)]' : 'bg-gray-50';
  const sidebarBorder = isDark ? 'border-white/5' : 'border-gray-200';
  const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100';
  const dropdownBg = isDark ? 'bg-[hsl(240,6%,10%)]' : 'bg-white';
  const dropdownBorder = isDark ? 'border-white/10' : 'border-gray-200';
  const dropdownHover = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50';
  const dropdownDivider = isDark ? 'border-white/5' : 'border-gray-100';

  return (
    <div className={`flex h-screen flex-col overflow-hidden ${isDark ? 'bg-[hsl(240,10%,3.9%)] text-[hsl(0,0%,98%)]' : 'bg-white text-[hsl(240,10%,3.9%)]'}`}>
      {/* ── Top bar (full width) ────────────────────────────────── */}
      <header className={`flex h-14 shrink-0 items-center border-b ${topbarBorder} ${topbarBg} px-6`}>
        {/* Left: Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <QuillIcon className="h-6 w-6 text-brand-500" />
          <span className="text-lg font-bold tracking-tight">
            Lore<span className="text-brand-500">Scryver</span>
          </span>
        </Link>

        {/* Center: Domain toggle (only inside project) */}
        <div className="flex-1 flex justify-center">
          {isInsideProject && <DomainToggle />}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">

          {/* ── Search ──────────────────────────────────────────── */}
          <div className="relative flex items-center">
            {searchOpen && (
              <div className="flex items-center mr-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects, stories..."
                  className={`h-8 w-56 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-white placeholder:text-white/40' : 'border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400'} px-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition`}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  className={`ml-1 flex h-7 w-7 items-center justify-center rounded text-muted-foreground ${hoverBg} transition`}
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setSearchOpen(!searchOpen);
                setNotifOpen(false);
                setProfileOpen(false);
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${searchOpen ? 'text-brand-400 bg-brand-600/10' : `text-muted-foreground ${hoverBg} hover:text-foreground`}`}
              title="Search"
            >
              <SearchIcon className="h-4 w-4" />
            </button>
          </div>

          {/* ── Notifications ───────────────────────────────────── */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setNotifOpen(!notifOpen);
                setSearchOpen(false);
                setProfileOpen(false);
              }}
              className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition ${notifOpen ? 'text-brand-400 bg-brand-600/10' : `text-muted-foreground ${hoverBg} hover:text-foreground`}`}
              title="Notifications"
            >
              <BellIcon className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className={`absolute right-0 top-full mt-2 w-80 rounded-xl border ${dropdownBorder} ${dropdownBg} shadow-2xl z-50`}>
                <div className={`flex items-center justify-between border-b ${dropdownDivider} px-4 py-3`}>
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-brand-600/15 px-2 py-0.5 text-xs font-medium text-brand-400">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex gap-3 px-4 py-3 ${dropdownHover} cursor-pointer transition ${notif.unread ? '' : 'opacity-60'}`}
                    >
                      <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notif.unread ? 'bg-brand-500' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{notif.title}</p>
                        <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'} mt-0.5`}>{notif.message}</p>
                        <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'} mt-1`}>{notif.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={`border-t ${dropdownDivider} px-4 py-2.5`}>
                  <button className="w-full text-center text-xs font-medium text-brand-400 hover:text-brand-300 transition">
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Theme toggle ────────────────────────────────────── */}
          <button
            type="button"
            onClick={() => {
              setIsDark(!isDark);
              setNotifOpen(false);
              setProfileOpen(false);
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground ${hoverBg} hover:text-foreground transition`}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button>

          {/* ── Profile menu ────────────────────────────────────── */}
          <div className="relative ml-2" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
                setSearchOpen(false);
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition ${profileOpen ? 'ring-2 ring-brand-500 bg-brand-600/20 text-brand-400' : 'bg-brand-600/20 text-brand-400 hover:ring-2 hover:ring-brand-500/50'}`}
              title="Profile"
            >
              <UserIcon className="h-4 w-4" />
            </button>

            {profileOpen && (
              <div className={`absolute right-0 top-full mt-2 w-56 rounded-xl border ${dropdownBorder} ${dropdownBg} shadow-2xl z-50`}>
                {/* User info */}
                <div className={`border-b ${dropdownDivider} px-4 py-3`}>
                  <p className="text-sm font-medium">Test User</p>
                  <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'} mt-0.5`}>test@lorescryver.com</p>
                  <span className="mt-1.5 inline-block rounded-full bg-brand-600/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-400">
                    Free Plan
                  </span>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 text-sm ${dropdownHover} transition`}
                  >
                    <SettingsIcon className="h-4 w-4 text-muted-foreground" />
                    Settings
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 text-sm ${dropdownHover} transition`}
                  >
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    Account
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 text-sm ${dropdownHover} transition`}
                  >
                    <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                    Billing
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 text-sm ${dropdownHover} transition`}
                  >
                    <HelpCircleIcon className="h-4 w-4 text-muted-foreground" />
                    Help &amp; Support
                  </Link>
                </div>

                {/* Sign out */}
                <div className={`border-t ${dropdownDivider} py-1.5`}>
                  <Link
                    href="/"
                    className={`flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 ${dropdownHover} transition`}
                  >
                    <LogOutIcon className="h-4 w-4" />
                    Sign out
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Body: Sidebar + Content ───────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — hidden when inside a project */}
        {!isInsideProject && (
          <aside className={`hidden w-60 flex-col border-r ${sidebarBorder} ${sidebarBg} md:flex`}>
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-brand-600/15 text-brand-400'
                        : `text-muted-foreground ${hoverBg} hover:text-foreground`
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main content */}
        <main className={`flex flex-1 flex-col overflow-hidden ${isDark ? '' : 'bg-gray-50/50'}`}>
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>

      {/* ── Scryve AI Assistant ───────────────────────────────── */}
      <ScryvePanel />
    </div>
  );
}

/* ── Exported Layout (wraps with provider) ─────────────────────── */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DomainProvider>
      <DashboardShell>{children}</DashboardShell>
    </DomainProvider>
  );
}
