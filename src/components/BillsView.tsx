import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { LifeBill } from '../services/api';

interface BillsViewProps {
  bills: LifeBill[];
  onTogglePaid: (id: string) => void;
  onDeleteBill: (id: string) => void;
  onOpenAddBill: () => void;
}

export const BillsView: React.FC<BillsViewProps> = ({
  bills,
  onTogglePaid,
  onDeleteBill,
  onOpenAddBill,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');

  const pendingBills = bills.filter((b) => b.status === 'pending');
  const paidBills = bills.filter((b) => b.status === 'paid');

  const totalPending = pendingBills.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = paidBills.reduce((acc, curr) => acc + curr.amount, 0);
  const totalObligations = bills.reduce((acc, curr) => acc + curr.amount, 0);

  const filtered = bills.filter((b) => {
    if (filter === 'pending') return b.status === 'pending';
    if (filter === 'paid') return b.status === 'paid';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="h-6 w-6 text-amber-400" />
            <span>Bills & Subscriptions</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Keep track of monthly recurring expenses, hosting invoices, and utilities
          </p>
        </div>

        <button
          onClick={onOpenAddBill}
          className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Bill</span>
        </button>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl border border-white/[0.08] bg-slate-900/70">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total Monthly Spend
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white font-mono tabular-nums">
            ${totalObligations.toFixed(2)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {bills.length} active bills & subscriptions
          </p>
        </div>

        <div className="p-5 rounded-3xl border border-white/[0.08] bg-slate-900/70">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            Pending / Due Soon
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-400 font-mono tabular-nums">
            ${totalPending.toFixed(2)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {pendingBills.length} unpaid bill{pendingBills.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="p-5 rounded-3xl border border-white/[0.08] bg-slate-900/70">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            Paid This Cycle
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-400 font-mono tabular-nums">
            ${totalPaid.toFixed(2)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {paidBills.length} completed payment{paidBills.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-2xl border border-white/[0.08] bg-slate-900/80 w-fit">
        {(['all', 'pending', 'paid'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize cursor-pointer transition-all ${
              filter === status
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {status} ({status === 'all' ? bills.length : status === 'pending' ? pendingBills.length : paidBills.length})
          </button>
        ))}
      </div>

      {/* Bills List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center rounded-3xl border border-dashed border-white/[0.08] space-y-3">
            <CreditCard className="h-8 w-8 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400">No bills found under this filter.</p>
            <button
              onClick={onOpenAddBill}
              className="text-xs font-semibold text-amber-400 hover:underline cursor-pointer"
            >
              + Add a bill or subscription
            </button>
          </div>
        ) : (
          filtered.map((bill) => (
            <div
              key={bill.id}
              className={`p-5 rounded-3xl border transition-all flex items-center justify-between gap-4 ${
                bill.status === 'paid'
                  ? 'border-emerald-500/20 bg-emerald-950/10'
                  : 'border-white/[0.08] bg-slate-900/70 hover:border-amber-500/30'
              }`}
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white truncate">
                    {bill.title}
                  </h3>
                  {bill.recurring && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 shrink-0">
                      {bill.recurring}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-slate-300">{bill.category}</span>
                  <span>·</span>
                  <span className="font-mono text-[11px]">Due: {bill.dueDate}</span>
                </div>
              </div>

              <div className="text-right shrink-0 space-y-2">
                <div className="text-lg font-extrabold text-white font-mono tabular-nums">
                  ${bill.amount.toFixed(2)}
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => onTogglePaid(bill.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      bill.status === 'paid'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                    }`}
                  >
                    {bill.status === 'paid' ? 'Paid ✓' : 'Mark Paid'}
                  </button>

                  <button
                    onClick={() => onDeleteBill(bill.id)}
                    className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Delete bill"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
