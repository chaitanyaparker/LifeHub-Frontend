import React from 'react';
import {
  CheckSquare,
  Calendar,
  CreditCard,
  FileText,
  Bell,
  ArrowRight,
  Plus,
  Check,
  Flame,
  Clock,
  Sparkles,
  AlertCircle,
  Tag,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { User } from '../types/auth';
import {
  LifeTask,
  LifeNote,
  LifeCalendarEvent,
  LifeBill,
  LifeNotification,
  ExecutiveSummary,
} from '../services/api';
import { WeatherWidget } from './WeatherWidget';

interface SummaryDashboardProps {
  user: User;
  summary: ExecutiveSummary | null;
  tasks: LifeTask[];
  notes: LifeNote[];
  events: LifeCalendarEvent[];
  bills: LifeBill[];
  notifications: LifeNotification[];
  onToggleTask: (id: string) => void;
  onToggleBillPaid: (id: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenAddTask: () => void;
  onOpenAddNote: () => void;
  onOpenAddEvent: () => void;
  onOpenAddBill: () => void;
}

export const SummaryDashboard: React.FC<SummaryDashboardProps> = ({
  user,
  summary,
  tasks,
  notes,
  events,
  bills,
  notifications,
  onToggleTask,
  onToggleBillPaid,
  onNavigateTab,
  onOpenAddTask,
  onOpenAddNote,
  onOpenAddEvent,
  onOpenAddBill,
}) => {
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const nextEvent = events[0];
  const pendingBills = bills.filter((b) => b.status === 'pending');
  const totalBillsDue = pendingBills.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* 1. Executive Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <button
              onClick={() => onNavigateTab('profile')}
              className="relative group cursor-pointer focus:outline-none"
              title="Visit Profile to edit info or add picture"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.firstName}
                  referrerPolicy="no-referrer"
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl object-cover border border-emerald-500/40 shadow-xl group-hover:ring-2 group-hover:ring-emerald-400 transition-all"
                />
              ) : (
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 font-extrabold text-xl shadow-xl group-hover:ring-2 group-hover:ring-emerald-400 transition-all">
                  {user.firstName[0]}{user.lastName ? user.lastName[0] : ''}
                </div>
              )}
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Welcome back, {user.firstName}
                </h1>
                <span className="text-xs text-emerald-400 font-mono font-medium">
                  @{user.username}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Here is your live life summary across tasks, calendar, bills, notes, and alerts.
              </p>
              <div className="mt-1.5 flex items-center gap-3">
                <button
                  onClick={() => onNavigateTab('profile')}
                  className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Edit Profile & Add Picture</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Shortcuts & Weather Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <WeatherWidget compact={true} />
            <button
              onClick={onOpenAddTask}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Task</span>
            </button>
            <button
              onClick={onOpenAddBill}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Bill</span>
            </button>
            <button
              onClick={onOpenAddNote}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold hover:bg-teal-500/25 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Note</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Executive 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Tasks KPI */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-slate-900/60 hover:border-emerald-500/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Tasks
            </span>
            <CheckSquare className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
              {pendingTasks.length}
            </span>
            <span className="text-xs text-slate-400">pending</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 truncate">
            {tasks.length - pendingTasks.length} completed
          </p>
        </div>

        {/* Calendar KPI */}
        <div
          onClick={() => onNavigateTab('calendar')}
          className="p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-slate-900/60 hover:border-indigo-500/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Calendar
            </span>
            <Calendar className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
              {events.length}
            </span>
            <span className="text-xs text-slate-400">events scheduled</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 truncate">
            {nextEvent ? `Next: ${nextEvent.time} - ${nextEvent.title}` : 'No events scheduled'}
          </p>
        </div>

        {/* Bills KPI */}
        <div
          onClick={() => onNavigateTab('bills')}
          className="p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-slate-900/60 hover:border-amber-500/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Bills Due
            </span>
            <CreditCard className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-400 font-mono tabular-nums">
              ${totalBillsDue.toFixed(2)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 truncate">
            {pendingBills.length} unpaid bill{pendingBills.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Notes KPI */}
        <div
          onClick={() => onNavigateTab('notes')}
          className="p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-slate-900/60 hover:border-teal-500/30 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Quick Notes
            </span>
            <FileText className="h-4 w-4 text-teal-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
              {notes.length}
            </span>
            <span className="text-xs text-slate-400">notes saved</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 truncate">
            {notes[0] ? notes[0].title : 'No notes yet'}
          </p>
        </div>
      </div>

      {/* 3. Main Dashboard Interactive Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column (8 cols): Tasks & Bills Widgets */}
        <div className="lg:col-span-8 space-y-6">
          {/* Widget 1: Today's Tasks Interactive Summary */}
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/70 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <CheckSquare className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Active Tasks Summary</h3>
                  <span className="text-[11px] text-slate-400">Click checkmark to toggle status in DB</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAddTask}
                  className="p-1.5 rounded-lg border border-white/[0.08] hover:bg-slate-800 text-slate-300 cursor-pointer"
                  title="Add Task"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onNavigateTab('tasks')}
                  className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View All Tasks</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {tasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    task.status === 'completed'
                      ? 'border-white/[0.04] bg-slate-950/40 opacity-70'
                      : 'border-white/[0.08] bg-slate-950/80 hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      className={`h-6 w-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        task.status === 'completed'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'border border-slate-700 bg-slate-900 hover:border-emerald-500 text-transparent'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </button>
                    <span
                      className={`text-xs font-semibold truncate ${
                        task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono ${
                        task.priority === 'high'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : task.priority === 'medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                      {task.dueDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: Bills & Subscriptions Due Summary */}
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/70 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Bills & Subscriptions Due</h3>
                  <span className="text-[11px] text-slate-400">${totalBillsDue.toFixed(2)} unpaid this cycle</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAddBill}
                  className="p-1.5 rounded-lg border border-white/[0.08] hover:bg-slate-800 text-slate-300 cursor-pointer"
                  title="Add Bill"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onNavigateTab('bills')}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View All Bills</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {bills.slice(0, 4).map((bill) => (
                <div
                  key={bill.id}
                  className="p-3.5 rounded-2xl border border-white/[0.08] bg-slate-950/80 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-white truncate max-w-[130px] sm:max-w-[160px]">
                      {bill.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Due: {bill.dueDate}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-white font-mono tabular-nums">
                      ${bill.amount.toFixed(2)}
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleBillPaid(bill.id)}
                      className={`mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        bill.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                      }`}
                    >
                      {bill.status === 'paid' ? 'Paid ✓' : 'Mark Paid'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Calendar & Notes Scratchpad */}
        <div className="lg:col-span-4 space-y-6">
          {/* Widget 3: Upcoming Calendar Schedule */}
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/70 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Upcoming Calendar</h3>
              </div>
              <button
                onClick={() => onNavigateTab('calendar')}
                className="px-2 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/25 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View All Events</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-3 pt-1">
              {events.length === 0 ? (
                <p className="text-xs text-slate-400">No scheduled events.</p>
              ) : (
                events.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-2xl border border-white/[0.06] bg-slate-950/60 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate max-w-[170px]">
                        {event.title}
                      </span>
                      <span className="text-[10px] text-indigo-300 font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded">
                        {event.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span>{event.date}</span>
                      {event.location && (
                        <>
                          <span>·</span>
                          <span className="truncate">{event.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Widget 4: Quick Notes Scratchpad */}
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/70 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
                  <FileText className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Recent Notes</h3>
              </div>
              <button
                onClick={() => onNavigateTab('notes')}
                className="px-2 py-1 rounded-xl bg-teal-500/15 border border-teal-500/30 text-xs font-semibold text-teal-300 hover:bg-teal-500/25 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View All Notes</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-2.5 pt-1">
              {notes.slice(0, 3).map((note) => (
                <div
                  key={note.id}
                  onClick={() => onNavigateTab('notes')}
                  className="p-3 rounded-2xl border border-white/[0.06] bg-slate-950/60 hover:border-teal-500/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white truncate max-w-[170px]">
                      {note.title}
                    </h4>
                    <span className="text-[10px] text-teal-300 font-mono bg-teal-500/15 px-1.5 py-0.5 rounded">
                      {note.tag}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
