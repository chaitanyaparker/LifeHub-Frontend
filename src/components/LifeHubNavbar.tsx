import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types/auth';
import {
  Compass,
  Search,
  Bell,
  CheckSquare,
  FileText,
  CreditCard,
  Calendar,
  Menu,
  X,
  LogIn,
  UserPlus,
  Server,
} from 'lucide-react';
import { LifeNotification, LifeTask, LifeNote, LifeBill, LifeCalendarEvent } from '../services/api';
import { getActiveBackendUrl } from '../config/apiConfig';

interface LifeHubNavbarProps {
  currentUser: User | null;
  onOpenMobileMenu: () => void;
  notifications: LifeNotification[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onSelectFeatureTab: (tab: string) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenHome?: () => void;
  onOpenBackendSettings?: () => void;
  allTasks: LifeTask[];
  allNotes: LifeNote[];
  allBills: LifeBill[];
  allEvents: LifeCalendarEvent[];
}

export const LifeHubNavbar: React.FC<LifeHubNavbarProps> = ({
  currentUser,
  onOpenMobileMenu,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onSelectFeatureTab,
  onOpenLogin,
  onOpenRegister,
  onOpenHome,
  onOpenBackendSettings,
  allTasks,
  allNotes,
  allBills,
  allEvents,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Compute User Initials (e.g. "Chaitanya Parker" -> "CP")
  const getUserInitials = (user: User | null): string => {
    if (!user) return 'LH';
    const first = user.firstName ? user.firstName.trim().charAt(0).toUpperCase() : '';
    const last = user.lastName ? user.lastName.trim().charAt(0).toUpperCase() : '';
    return `${first}${last}` || (user.username ? user.username.charAt(0).toUpperCase() : 'U');
  };

  // Search Results Filtering across features
  const filteredTasks = searchQuery.trim()
    ? allTasks.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];
  const filteredNotes = searchQuery.trim()
    ? allNotes.filter((n) => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];
  const filteredBills = searchQuery.trim()
    ? allBills.filter((b) => b.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];
  const filteredEvents = searchQuery.trim()
    ? allEvents.filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];

  const totalMatches = filteredTasks.length + filteredNotes.length + filteredBills.length + filteredEvents.length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-3 sm:gap-6">
        {/* Left: Brand Name & Logo */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {currentUser && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-slate-900/60 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Open sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={() => {
              if (currentUser) {
                onSelectFeatureTab('summary');
              } else if (onOpenHome) {
                onOpenHome();
              }
            }}
            className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Compass className="h-5 w-5 stroke-[2.3]" />
            </div>
            <div className="flex items-baseline">
              <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                LifeHub
              </span>
              <span className="hidden sm:inline-block ml-1 text-[10px] font-mono uppercase tracking-wider text-emerald-400/80">
                OS
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search Bar ONLY SHOWN WHEN USER IS LOGGED IN (Removed on home screen as requested) */}
        {currentUser ? (
          <div ref={searchRef} className="relative flex-1 max-w-md mx-auto hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search tasks, notes, bills, calendar..."
                className="w-full rounded-2xl border border-white/[0.1] bg-slate-900/70 pl-10 pr-9 py-2 text-xs text-white placeholder-slate-400 focus:border-emerald-500 focus:bg-slate-900 focus:outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Interactive Search Results Dropdown */}
            {isSearchFocused && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-white/[0.12] bg-slate-900/98 p-3 shadow-2xl backdrop-blur-2xl z-50 max-h-96 overflow-y-auto space-y-3">
                {totalMatches === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No matching items found for "{searchQuery}".
                  </div>
                ) : (
                  <>
                    {filteredTasks.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1.5">
                          <CheckSquare className="h-3 w-3 text-emerald-400" />
                          <span>Tasks</span>
                        </div>
                        <div className="space-y-1">
                          {filteredTasks.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => {
                                onSelectFeatureTab('tasks');
                                setIsSearchFocused(false);
                              }}
                              className="w-full text-left p-2 rounded-xl hover:bg-slate-800/80 transition-colors flex items-center justify-between text-xs text-slate-200 cursor-pointer"
                            >
                              <span className="truncate">{t.title}</span>
                              <span className="text-[10px] text-slate-500 font-mono capitalize ml-2">{t.priority}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredNotes.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1.5">
                          <FileText className="h-3 w-3 text-teal-400" />
                          <span>Notes</span>
                        </div>
                        <div className="space-y-1">
                          {filteredNotes.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => {
                                onSelectFeatureTab('notes');
                                setIsSearchFocused(false);
                              }}
                              className="w-full text-left p-2 rounded-xl hover:bg-slate-800/80 transition-colors text-xs text-slate-200 cursor-pointer"
                            >
                              <div className="font-semibold truncate">{n.title}</div>
                              <div className="text-[11px] text-slate-400 truncate">{n.content}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredBills.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1.5">
                          <CreditCard className="h-3 w-3 text-amber-400" />
                          <span>Bills</span>
                        </div>
                        <div className="space-y-1">
                          {filteredBills.map((b) => (
                            <button
                              key={b.id}
                              onClick={() => {
                                onSelectFeatureTab('bills');
                                setIsSearchFocused(false);
                              }}
                              className="w-full text-left p-2 rounded-xl hover:bg-slate-800/80 transition-colors flex items-center justify-between text-xs text-slate-200 cursor-pointer"
                            >
                              <span className="truncate">{b.title}</span>
                              <span className="font-mono text-emerald-400 font-bold ml-2">${b.amount.toFixed(2)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredEvents.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-indigo-400" />
                          <span>Calendar Events</span>
                        </div>
                        <div className="space-y-1">
                          {filteredEvents.map((e) => (
                            <button
                              key={e.id}
                              onClick={() => {
                                onSelectFeatureTab('calendar');
                                setIsSearchFocused(false);
                              }}
                              className="w-full text-left p-2 rounded-xl hover:bg-slate-800/80 transition-colors flex items-center justify-between text-xs text-slate-200 cursor-pointer"
                            >
                              <span className="truncate">{e.title}</span>
                              <span className="font-mono text-slate-400 text-[10px] ml-2">{e.time}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          /* HOME SCREEN CENTER NAV: Overview, Features, Benefits, What's New */
          <div className="flex-1 flex items-center justify-center hidden sm:flex">
            <nav className="flex items-center gap-6 text-xs font-semibold text-slate-400">
              <button
                onClick={onOpenHome}
                className="hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Overview
              </button>
              <button
                onClick={onOpenHome}
                className="hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={onOpenHome}
                className="hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Benefits
              </button>
              <button
                onClick={onOpenHome}
                className="hover:text-emerald-400 transition-colors cursor-pointer"
              >
                What's New
              </button>
              <button
                onClick={() => {
                  if (onOpenHome) onOpenHome();
                  setTimeout(() => {
                    const el = document.getElementById('contact');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }}
                className="hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Contact
              </button>
            </nav>
          </div>
        )}

        {/* Right side:
            - If logged in: Notification Bell + User Avatar/Initials
            - If logged out (Home Screen): Sign In and Sign Up buttons (opposite side of LifeHub) */}
        {currentUser ? (
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Backend API Connection Allotment Button */}
            {onOpenBackendSettings && (
              <button
                onClick={onOpenBackendSettings}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-slate-900/60 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer"
                title="Backend API Connection Settings (Allot Custom URL)"
              >
                <Server className="h-4 w-4" />
              </button>
            )}

            {/* Notification Bell Dropdown */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-slate-900/60 text-slate-300 hover:text-white hover:border-emerald-500/30 transition-all cursor-pointer"
                title="Notifications"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold font-mono text-slate-950 shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-3xl border border-white/[0.12] bg-slate-900/98 p-4 shadow-2xl backdrop-blur-2xl z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-semibold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllNotificationsRead}
                        className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => onMarkNotificationRead(n.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            !n.read
                              ? 'border-emerald-500/30 bg-emerald-950/20'
                              : 'border-white/[0.06] bg-slate-950/40 opacity-75'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-semibold text-white leading-snug">
                              {n.title}
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono shrink-0">
                              {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/[0.08] mt-3 text-center">
                    <button
                      onClick={() => {
                        onSelectFeatureTab('notifications');
                        setIsNotifOpen(false);
                      }}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      View All Notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar OR Fallback First/Last Name Initials */}
            <button
              onClick={() => onSelectFeatureTab('profile')}
              className="flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-slate-900/60 p-1.5 sm:px-3 sm:py-1.5 hover:border-emerald-500/40 hover:bg-slate-800/80 transition-all cursor-pointer group"
              title="Open Profile Settings"
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.firstName}
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-xl object-cover border border-emerald-500/40"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 font-extrabold text-xs tracking-wider border border-emerald-400/40 shadow-sm">
                  {getUserInitials(currentUser)}
                </div>
              )}

              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors leading-tight">
                  {currentUser.firstName} {currentUser.lastName}
                </div>
                <div className="text-[10px] text-slate-400 font-mono leading-tight">
                  @{currentUser.username}
                </div>
              </div>
            </button>
          </div>
        ) : (
          /* HOME SCREEN NAVBAR (Logged out): Show Sign In and Sign Up on the opposite side of LifeHub */
          <div className="flex items-center gap-2.5 shrink-0">
            {onOpenBackendSettings && (
              <button
                onClick={onOpenBackendSettings}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-white/[0.08] bg-slate-900/60 text-xs font-mono text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer"
                title="Backend API Connection Settings (Allot Custom URL)"
              >
                <Server className="h-3.5 w-3.5 text-emerald-400" />
                <span>Backend API</span>
              </button>
            )}

            <button
              onClick={onOpenLogin}
              className="px-4 py-2 rounded-2xl border border-white/[0.1] bg-slate-900/60 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800/80 hover:border-white/[0.2] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogIn className="h-3.5 w-3.5 text-emerald-400" />
              <span>Sign In</span>
            </button>

            <button
              onClick={onOpenRegister}
              className="px-4 py-2 rounded-2xl bg-emerald-500 text-slate-950 text-xs font-extrabold hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
