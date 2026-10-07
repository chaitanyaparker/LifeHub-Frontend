import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Calendar,
  CreditCard,
  Bell,
  User,
  LogOut,
  X,
  Compass,
  Flame,
  Server,
} from 'lucide-react';
import { User as UserType } from '../types/auth';

interface LifeHubSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  onOpenBackendSettings?: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  pendingTasksCount: number;
  unpaidBillsCount: number;
  unreadNotifsCount: number;
  notesCount: number;
  user: UserType | null;
}

export const LifeHubSidebar: React.FC<LifeHubSidebarProps> = ({
  currentTab,
  onSelectTab,
  onLogout,
  onOpenBackendSettings,
  isMobileOpen,
  onCloseMobile,
  pendingTasksCount,
  unpaidBillsCount,
  unreadNotifsCount,
  notesCount,
  user,
}) => {
  const navItems = [
    {
      id: 'summary',
      label: 'Executive Summary',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'tasks',
      label: 'Tasks & Todos',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? `${pendingTasksCount}` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      id: 'notes',
      label: 'Quick Notes',
      icon: FileText,
      badge: notesCount > 0 ? `${notesCount}` : null,
      badgeColor: 'bg-teal-500/20 text-teal-400',
    },
    {
      id: 'calendar',
      label: 'Life Calendar',
      icon: Calendar,
      badge: null,
    },
    {
      id: 'bills',
      label: 'Bills & Subscriptions',
      icon: CreditCard,
      badge: unpaidBillsCount > 0 ? `${unpaidBillsCount}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-400',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotifsCount > 0 ? `${unreadNotifsCount}` : null,
      badgeColor: 'bg-emerald-500 text-slate-950 font-bold',
    },
    {
      id: 'profile',
      label: 'Profile & Security',
      icon: User,
      badge: null,
    },
  ];

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const content = (
    <div className="flex h-full flex-col justify-between p-4 bg-slate-950/95 border-r border-white/[0.08]">
      {/* Top Section: Nav Header & Links */}
      <div className="space-y-6">
        {/* Mobile Header with Close Button */}
        <div className="flex md:hidden items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-bold">
              <Compass className="h-4.5 w-4.5 stroke-[2.3]" />
            </div>
            <span className="text-base font-extrabold text-white">LifeHub</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feature Navigation Links */}
        <div className="space-y-1.5">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4.5 w-4.5 transition-colors ${
                      isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono tabular-nums ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Backend Status & LOGOUT BUTTON at end of sidebar */}
      <div className="pt-4 border-t border-white/[0.08] space-y-2">
        {/* Backend API Connection Allotment Button */}
        {onOpenBackendSettings && (
          <button
            onClick={onOpenBackendSettings}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-white/[0.06] bg-slate-950/60 hover:bg-slate-900 text-xs text-slate-400 hover:text-slate-200 transition-all cursor-pointer group"
            title="Configure or allot any backend server URL"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-mono">Backend API</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono group-hover:underline">Configure ⚙️</span>
          </button>
        )}

        {/* LOGOUT BUTTON - Explicit requirement: in the end of sidebar */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl border border-red-500/20 bg-red-950/20 hover:bg-red-900/30 hover:border-red-500/40 text-xs font-bold text-red-300 hover:text-red-200 transition-all cursor-pointer shadow-sm group"
          title="Sign out of LifeHub"
        >
          <LogOut className="h-4 w-4 text-red-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Sticky fixed on desktop) */}
      <aside className="hidden md:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-slide-in">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
