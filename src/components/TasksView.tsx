import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Check,
  Clock,
  Filter,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { LifeTask } from '../services/api';

interface TasksViewProps {
  tasks: LifeTask[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenAddTask: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onOpenAddTask,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filtered = tasks.filter((t) => {
    if (filterStatus === 'pending' && t.status !== 'pending') return false;
    if (filterStatus === 'completed' && t.status !== 'completed') return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="h-6 w-6 text-emerald-400" />
            <span>Tasks & Todos</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {pendingCount} pending task{pendingCount !== 1 ? 's' : ''} · {completedCount} completed
          </p>
        </div>

        <button
          onClick={onOpenAddTask}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Task</span>
        </button>
      </div>

      {/* Filter Tabs & Priority selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 rounded-2xl border border-white/[0.08] bg-slate-900/80">
          {(['all', 'pending', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize cursor-pointer transition-all ${
                filterStatus === status
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {status} ({status === 'all' ? tasks.length : status === 'pending' ? pendingCount : completedCount})
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Priority:</span>
          {(['all', 'high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-2.5 py-1 rounded-lg uppercase text-[10px] font-mono font-bold cursor-pointer transition-all ${
                filterPriority === p
                  ? 'bg-slate-800 text-white border border-white/[0.15]'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-16 text-center rounded-3xl border border-dashed border-white/[0.08] space-y-3">
            <CheckSquare className="h-8 w-8 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400">No tasks found matching these filters.</p>
            <button
              onClick={onOpenAddTask}
              className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer"
            >
              + Create a task
            </button>
          </div>
        ) : (
          filtered.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                task.status === 'completed'
                  ? 'border-white/[0.04] bg-slate-950/40 opacity-70'
                  : 'border-white/[0.08] bg-slate-900/70 hover:border-emerald-500/30'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onToggleTask(task.id)}
                  className={`h-7 w-7 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    task.status === 'completed'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                      : 'border border-slate-700 bg-slate-950 hover:border-emerald-500 text-transparent'
                  }`}
                  title={task.status === 'completed' ? 'Mark pending' : 'Mark completed'}
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                </button>

                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm font-semibold truncate ${
                      task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
                    <span className="font-mono text-[11px] text-slate-400">Due: {task.dueDate}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-400">{task.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono ${
                    task.priority === 'high'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : task.priority === 'medium'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {task.priority}
                </span>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                  title="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
