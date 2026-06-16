'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { FolderOpen as FolderIcon, Settings as SettingsIcon, User as UserIcon, LogOut as LogOutIcon, Search as SearchIcon, Bell as BellIcon, Sun as SunIcon, Moon as MoonIcon, X as XIcon, CreditCard as CreditCardIcon, HelpCircle as HelpCircleIcon } from 'lucide-react';
import { ScryveIcon as QuillIcon } from '@/components/icons';
import ScryvePanel from '@/components/scryve-panel';
import { DomainProvider, useDomain } from '@/contexts/domain-context';

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
  const router = useRouter();
  const { isInsideProject } = useDomain();
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState<{ name: string | null; email: string; plan: string } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    setIsDark(storedTheme ? storedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((response) => response.ok ? response.json() : null)
      .then((body) => {
        if (body?.user) setUser(body.user);
      })
      .catch(() => {});
  }, []);

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
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
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

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

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
                  <p className="text-sm font-medium">{user?.name || 'Writer'}</p>
                  <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'} mt-0.5`}>{user?.email || 'Signed in'}</p>
                  <span className="mt-1.5 inline-block rounded-full bg-brand-600/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-400">
                    {user?.plan || 'FREE'} Plan
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
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 ${dropdownHover} transition`}
                  >
                    <LogOutIcon className="h-4 w-4" />
                    Sign out
                  </button>
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
