import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Tag,
} from 'lucide-react';
import { LifeCalendarEvent } from '../services/api';

interface CalendarViewProps {
  events: LifeCalendarEvent[];
  onDeleteEvent: (id: string) => void;
  onOpenAddEvent: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onDeleteEvent,
  onOpenAddEvent,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Generate current month days preview (e.g. current month)
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const selectedDayEvents = events.filter((e) => e.date === selectedDate);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="h-6 w-6 text-indigo-400" />
            <span>Life Calendar & Schedule</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track syncs, training sessions, and quarterly milestones
          </p>
        </div>

        <button
          onClick={onOpenAddEvent}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-400 transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Calendar Grid (7 cols on desktop) */}
        <div className="lg:col-span-7 rounded-3xl border border-white/[0.08] bg-slate-900/70 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-white">
              {monthNames[month]} {year}
            </span>
            <span className="text-xs text-indigo-400 font-mono">
              Today: {today.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 font-mono py-1">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Calendar Day Tiles */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10 sm:h-12" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const hasEvents = events.some((e) => e.date === dateStr);
              const isToday = dayNum === today.getDate();

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-10 sm:h-12 rounded-2xl flex flex-col items-center justify-center text-xs font-mono transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                      : isToday
                      ? 'border border-indigo-400/50 bg-indigo-950/20 text-indigo-300 font-bold'
                      : 'border border-white/[0.06] bg-slate-950/60 text-slate-300 hover:border-white/[0.2]'
                  }`}
                >
                  <span>{dayNum}</span>
                  {hasEvents && (
                    <span
                      className={`h-1.5 w-1.5 rounded-full mt-0.5 ${
                        isSelected ? 'bg-white' : 'bg-indigo-400'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Events List (5 cols on desktop) */}
        <div className="lg:col-span-5 rounded-3xl border border-white/[0.08] bg-slate-900/70 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <h3 className="text-sm font-bold text-white">Events for {selectedDate}</h3>
              <span className="text-[11px] text-slate-400">
                {selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? 's' : ''} on this day
              </span>
            </div>
            <button
              onClick={onOpenAddEvent}
              className="p-1.5 rounded-xl border border-white/[0.08] hover:bg-slate-800 text-indigo-400 cursor-pointer"
              title="Add event on this date"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {selectedDayEvents.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <Clock className="h-6 w-6 mx-auto text-slate-600" />
                <p>No events scheduled for this day.</p>
                <button
                  onClick={onOpenAddEvent}
                  className="text-xs font-semibold text-indigo-400 hover:underline cursor-pointer"
                >
                  + Add schedule entry
                </button>
              </div>
            ) : (
              selectedDayEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 rounded-2xl border border-white/[0.08] bg-slate-950/80 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white leading-snug">
                      {event.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 shrink-0">
                      {event.time}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 font-medium">{event.category}</span>
                      {event.location && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-500" />
                            <span className="truncate max-w-[120px]">{event.location}</span>
                          </span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => onDeleteEvent(event.id)}
                      className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete event"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
