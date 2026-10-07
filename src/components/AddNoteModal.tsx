import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';
import { api, LifeNote } from '../services/api';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoteCreated: (note: LifeNote) => void;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  onClose,
  onNoteCreated,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('Ideas');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a note title.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await api.addNote({
        title,
        content,
        tag,
      });

      if (res.success && res.note) {
        onNoteCreated(res.note);
        setTitle('');
        setContent('');
        onClose();
      } else {
        setError(res.message || 'Failed to save note');
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
            <FileText className="h-5 w-5 text-teal-400" />
            <span>Create Quick Note</span>
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Saved to your personal LifeHub memory bank
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
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekly Strategy Thoughts"
              className="w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Tag / Category
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Work, Reading, Finance, Ideas..."
              className="w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Content
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your notes here..."
              className="w-full rounded-xl border border-white/[0.1] bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-teal-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-teal-400 transition-all shadow-md shadow-teal-500/20 cursor-pointer"
            >
              {loading ? 'Saving Note...' : 'Save Note to Database'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
