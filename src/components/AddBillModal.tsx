import React, { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { api, LifeBill } from '../services/api';

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBillCreated: (bill: LifeBill) => void;
}

export const AddBillModal: React.FC<AddBillModalProps> = ({
  isOpen,
  onClose,
  onBillCreated,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Utilities');
  const [recurring, setRecurring] = useState('Monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) {
      setError('Please provide bill title and amount.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await api.addBill({
        title,
        amount: numAmount,
        dueDate,
        category,
        recurring,
      });

      if (res.success && res.bill) {
        onBillCreated(res.bill);
        setTitle('');
        setAmount('');
        onClose();
      } else {
        setError(res.message || 'Failed to add bill');
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
            <CreditCard className="h-5 w-5 text-amber-400" />
            <span>Add Bill or Subscription</span>
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Recorded into your LifeHub financial cycle
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
              Bill / Subscription Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fiber Internet, Gym, Cloud Hosting"
              className="w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="65.00"
                className="w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                required
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
                placeholder="Utilities, Cloud, Health..."
                className="w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Cadence
              </label>
              <select
                value={recurring}
                onChange={(e) => setRecurring(e.target.value)}
                className="w-full rounded-xl border border-white/[0.1] bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none cursor-pointer"
              >
                <option value="Monthly">Monthly</option>
                <option value="Annual">Annual</option>
                <option value="Quarterly">Quarterly</option>
                <option value="One-time">One-time</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              {loading ? 'Adding Bill...' : 'Add Bill to Database'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
