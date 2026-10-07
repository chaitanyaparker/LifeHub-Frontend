import React, { useState } from 'react';
import { FileText, Plus, Trash2, Search, Tag, Sparkles } from 'lucide-react';
import { LifeNote } from '../services/api';

interface NotesViewProps {
  notes: LifeNote[];
  onDeleteNote: (id: string) => void;
  onOpenAddNote: () => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onDeleteNote,
  onOpenAddNote,
}) => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');

  const allTags = ['All', ...Array.from(new Set(notes.map((n) => n.tag).filter(Boolean)))];

  const filtered = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag === 'All' || n.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-teal-400" />
            <span>Quick Notes & Memos</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Capture thoughts, book summaries, and sprint ideas in real-time
          </p>
        </div>

        <button
          onClick={onOpenAddNote}
          className="inline-flex items-center gap-2 rounded-2xl bg-teal-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-teal-400 transition-all shadow-md shadow-teal-500/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes content..."
            className="w-full rounded-2xl border border-white/[0.1] bg-slate-900/70 pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-400 focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                selectedTag === tag
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center rounded-3xl border border-dashed border-white/[0.08] space-y-3">
            <FileText className="h-8 w-8 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400">No notes found.</p>
            <button
              onClick={onOpenAddNote}
              className="text-xs font-semibold text-teal-400 hover:underline cursor-pointer"
            >
              + Create your first note
            </button>
          </div>
        ) : (
          filtered.map((note) => (
            <div
              key={note.id}
              className="p-5 rounded-3xl border border-white/[0.08] bg-slate-900/70 hover:border-teal-500/30 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                    {note.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-teal-500/15 text-teal-300 shrink-0">
                    {note.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {note.content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-[11px] text-slate-400">
                <span className="font-mono text-[10px]">
                  {new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                  title="Delete note"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
