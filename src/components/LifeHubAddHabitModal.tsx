import React, { useState } from 'react';
import { X, Plus, Sparkles, Target } from 'lucide-react';
import { api, LifeHabit } from '../services/api';

interface LifeHubAddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHabitCreated: (habit: LifeHabit) => void;
}

export const LifeHubAddHabitModal: React.FC<LifeHubAddHabitModalProps> = ({
  isOpen,
  onClose,
  onHabitCreated,
}) => {
  const [title, setTitle] = useState('');
  const [pillar, setPillar] = useState<'Health' | 'Mind' | 'Craft' | 'Finance'>('Craft');
  const [targetDays, setTargetDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a habit title.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.addHabit({
        title,
        pillar,
        targetDays,
      });

      if (res.success && res.data) {
        onHabitCreated(res.data as LifeHabit);
        setTitle('');
        onClose();
      } else {
        // Fallback: reload habits
        onClose();
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to save habit');
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
            <Plus className="h-5 w-5 text-emerald-400" />
            <span>Create New Life Habit</span>
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Saved directly to your persistent LifeHub database
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
              Habit Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read 20 mins or Run 5km"
              className="w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Life Pillar
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Craft', 'Health', 'Mind', 'Finance'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPillar(p)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    pillar === p
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-white/[0.08] bg-slate-950/60 text-slate-400 hover:border-white/[0.15]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Target Frequency (Days/Week)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTargetDays(num)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-bold font-mono cursor-pointer transition-all ${
                    targetDays === num
                      ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                      : 'border-white/[0.08] bg-slate-950/60 text-slate-400'
                  }`}
                >
                  {num}d
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              {loading ? 'Writing to Database...' : 'Save Habit to Database'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
