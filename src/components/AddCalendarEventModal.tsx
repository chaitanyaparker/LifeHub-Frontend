import React, { useState } from 'react';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { api, LifeCalendarEvent } from '../services/api';

interface AddCalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: LifeCalendarEvent) => void;
}

export const AddCalendarEventModal: React.FC<AddCalendarEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [category, setCategory] = useState('Meeting');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      setError('Please provide event title and date.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await api.addCalendarEvent({
        title,
        date,
        time,
        category,
        location,
      });

      if (res.success && res.event) {
        onEventCreated(res.event);
        setTitle('');
        setLocation('');
        onClose();
      } else {
        setError(res.message || 'Failed to save event');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-white/[0.12] bg-slate-900 p-6 sm:p-7 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="pb-4 border-b border-white/[0.08]">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-indigo-400" />
            <span>Schedule Calendar Event</span>
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Recorded to your synchronized LifeHub schedule
          </p>
        </div>

        {error && (
          <div className="mt-4 p-2.5 rounded-xl border border-red-500/30 bg-red-950/40 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Product Review with Founders"
              className="w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Product, Health, Finance..."
                className="w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Location (Optional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Zoom, Athletic Center..."
                className="w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-500 py-2.5 text-xs font-bold text-white hover:bg-indigo-400 transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              {loading ? 'Adding Event...' : 'Add Event to Calendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
