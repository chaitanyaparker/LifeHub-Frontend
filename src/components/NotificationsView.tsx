import React, { useState } from 'react';
import { Bell, CheckCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { LifeNotification } from '../services/api';

interface NotificationsViewProps {
  notifications: LifeNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.read : true));

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bell className="h-6 w-6 text-emerald-400" />
            <span>Notifications Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time updates regarding bill deadlines, task reminders, and calendar syncs
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-900 border border-white/[0.1] text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-2xl border border-white/[0.08] bg-slate-900/80 w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            filter === 'all'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            filter === 'unread'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-16 text-center rounded-3xl border border-dashed border-white/[0.08] space-y-2">
            <Bell className="h-8 w-8 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400">No notifications to display.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onMarkRead(item.id)}
              className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer ${
                !item.read
                  ? 'border-emerald-500/40 bg-emerald-950/20 shadow-sm'
                  : 'border-white/[0.06] bg-slate-900/60 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white leading-snug">
                      {item.title}
                    </h3>
                    {!item.read && (
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.message}
                  </p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
