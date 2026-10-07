import React, { useState } from 'react';
import {
  Compass,
  CheckSquare,
  CreditCard,
  Calendar,
  FileText,
  Bell,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  Lock,
  Database,
  Flame,
  CheckCircle2,
  Mail,
  User,
  MessageSquare,
  Send,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';

interface WelcomeLandingPageProps {
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

export const WelcomeLandingPage: React.FC<WelcomeLandingPageProps> = ({
  onOpenRegister,
  onOpenLogin,
}) => {
  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setSubmitStatus({
        success: false,
        message: 'Please fill in your name, email, and message.',
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await api.submitContact({
        name: contactName.trim(),
        email: contactEmail.trim(),
        message: contactMessage.trim(),
      });

      if (res.success) {
        setSubmitStatus({
          success: true,
          message: `Thank you, ${contactName.trim()}! Your message has been received. Our team will get back to you at ${contactEmail.trim()} shortly.`,
        });
        setContactName('');
        setContactEmail('');
        setContactMessage('');
      } else {
        setSubmitStatus({
          success: false,
          message: res.message || 'Failed to send message. Please try again.',
        });
      }
    } catch (err: unknown) {
      setSubmitStatus({
        success: false,
        message: (err as Error).message || 'An error occurred while sending.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="w-full space-y-16 sm:space-y-24 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      {/* 1. Hero Section */}
      <div className="text-center space-y-6 max-w-4xl mx-auto pt-4 sm:pt-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>LifeHub OS 2.0 · Personal Executive Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          The Unified Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">Your Daily Life</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Coordinate your tasks, track upcoming bills & subscriptions, schedule calendar events, and capture notes — all synchronized in one high-performance dashboard.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <button
            onClick={onOpenRegister}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-500 text-slate-950 font-extrabold text-sm hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl border border-white/[0.12] bg-slate-900/80 text-white font-bold text-sm hover:bg-slate-800 hover:border-white/[0.2] transition-all cursor-pointer"
          >
            <span>Sign In to Your Hub</span>
          </button>
        </div>

        {/* Real-time trust points */}
        <div className="flex items-center justify-center gap-6 pt-4 text-xs text-slate-400 flex-wrap">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Persistent Database</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Email OTP Verification</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Google OAuth 2.0</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Dashboard Preview Showcase */}
      <div className="relative mx-auto max-w-5xl rounded-3xl border border-white/[0.1] bg-slate-900/60 p-4 sm:p-7 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] text-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500/70" />
            <span className="h-3 w-3 rounded-full bg-amber-500/70" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
            <span className="ml-2 font-mono text-slate-400">app.lifehub.dev/dashboard</span>
          </div>
          <span className="text-emerald-400 font-mono font-semibold">Live Preview</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          {/* Card 1: Tasks Preview */}
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-slate-950/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-emerald-400" />
                <span>Today's Tasks</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">3 Due</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-900/60 flex items-center gap-2 text-slate-300">
                <span className="h-4 w-4 rounded bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">✓</span>
                <span className="line-through text-slate-500">Review quarterly architecture</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 flex items-center gap-2 text-slate-300">
                <span className="h-4 w-4 rounded border border-slate-700 bg-slate-950" />
                <span>Submit expense invoice</span>
              </div>
            </div>
          </div>

          {/* Card 2: Bills Preview */}
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-slate-950/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-amber-400" />
                <span>Bills & Subs Due</span>
              </span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">$207.50</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-900/60 flex items-center justify-between text-slate-300">
                <span>Fiber Internet</span>
                <span className="font-mono text-amber-300 font-bold">$65.00</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 flex items-center justify-between text-slate-300">
                <span>Cloud Infrastructure</span>
                <span className="font-mono text-amber-300 font-bold">$142.50</span>
              </div>
            </div>
          </div>

          {/* Card 3: Calendar & Notes Preview */}
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-slate-950/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-400" />
                <span>Next Schedule</span>
              </span>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">14:00</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-900/60 text-slate-300 space-y-0.5">
                <div className="font-semibold text-white">Product Sync & Architecture</div>
                <div className="text-[10px] text-slate-500">Virtual Room A</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Deep Feature Breakdown */}
      <div className="space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Comprehensive Life Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Engineered to replace fragmented apps with a unified executive interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-3xl border border-white/[0.08] bg-slate-900/60 space-y-3 hover:border-emerald-500/30 transition-all">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <CheckSquare className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Tasks & Todos</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Prioritize day-to-day actions with High/Medium/Low priority tags, due date tracking, and instant database checkmark completion.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-3xl border border-white/[0.08] bg-slate-900/60 space-y-3 hover:border-amber-500/30 transition-all">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <CreditCard className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Bills & Subscriptions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track monthly recurring obligations, prevent surprise late fees, and monitor exact amounts due with a 1-click "Mark Paid" toggle.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-3xl border border-white/[0.08] bg-slate-900/60 space-y-3 hover:border-indigo-500/30 transition-all">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Life Calendar</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive monthly and weekly schedule manager to align meetings, workouts, and strategic deep work blocks.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-3xl border border-white/[0.08] bg-slate-900/60 space-y-3 hover:border-teal-500/30 transition-all">
            <div className="h-10 w-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Quick Notes Scratchpad</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Capture instant brainstorms, book notes, and meeting memos with categorized tags and clean card layout.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-3xl border border-white/[0.08] bg-slate-900/60 space-y-3 hover:border-emerald-500/30 transition-all">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Bell className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Notifications Center</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Timely updates regarding bill payment deadlines, upcoming calendar events, and high-priority task alerts.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-3xl border border-white/[0.08] bg-slate-900/60 space-y-3 hover:border-teal-500/30 transition-all">
            <div className="h-10 w-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Persistent Storage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Backed by an Express server and persistent database. Never lose a task, note, bill, or profile update on page refresh.
            </p>
          </div>
        </div>
      </div>

      {/* 4. What's New in LifeHub OS 2.0 */}
      <div className="p-8 sm:p-10 rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-slate-900/90 to-teal-950/20 space-y-6">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold uppercase">
            What's New
          </span>
          <span className="text-xs text-slate-400">Release Notes v2.0</span>
        </div>

        <h3 className="text-2xl font-bold text-white">
          Major Enhancements in LifeHub
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.06] space-y-1">
            <div className="font-bold text-emerald-300">Executive Summary View</div>
            <p className="text-slate-400 leading-relaxed">
              Consolidated whole-summary view featuring active tasks, bills due, next calendar event, and recent notes all in one place.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.06] space-y-1">
            <div className="font-bold text-emerald-300">Custom Profile Picture & Locked Handle</div>
            <p className="text-slate-400 leading-relaxed">
              Insert custom avatar images or use automatic first/last name initials, with sensitive permanent username locking.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.06] space-y-1">
            <div className="font-bold text-emerald-300">Mobile Responsive Navigation</div>
            <p className="text-slate-400 leading-relaxed">
              Seamless mobile drawer navigation with the Logout button positioned at the end of the sidebar.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Bottom Call to Action */}
      <div className="text-center py-8 space-y-5 border-t border-white/[0.08]">
        <h3 className="text-2xl sm:text-3xl font-bold text-white">
          Ready to orchestrate your daily life?
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Join LifeHub today and experience a unified platform for tasks, bills, schedule, and notes.
        </p>
        <button
          onClick={onOpenRegister}
          className="px-8 py-3.5 rounded-2xl bg-emerald-500 text-slate-950 font-extrabold text-sm hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 cursor-pointer inline-flex items-center gap-2"
        >
          <span>Create Your Account</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* 6. Contact Section in the End: Person Name, Email, and Message */}
      <div id="contact" className="pt-8 border-t border-white/[0.08]">
        <div className="rounded-3xl border border-white/[0.1] bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Contact Information & Guarantees */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                <Mail className="h-3.5 w-3.5" />
                <span>Contact & Support</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Have questions? Let's talk.
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Have questions about LifeHub's features, need assistance with your account, or want to suggest new productivity tools? Reach out to our team directly.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-2xl border border-white/[0.06] bg-slate-950/60 text-xs">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Direct Inquiries</span>
                    <span className="text-slate-200 font-semibold font-mono">support@lifehub.app</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl border border-white/[0.06] bg-slate-950/60 text-xs">
                  <div className="h-9 w-9 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Fast Response Guarantee</span>
                    <span className="text-slate-200 font-semibold">Average reply time under 2 hours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form with Person Name, Email, and Message */}
            <div className="lg:col-span-7 rounded-2xl border border-white/[0.08] bg-slate-950/70 p-6 sm:p-8 space-y-4 shadow-xl">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="h-4 w-4 text-emerald-400" />
                <span>Send Us a Message</span>
              </h4>

              {submitStatus && (
                <div
                  className={`p-4 rounded-2xl border text-xs flex items-start gap-2.5 animate-fade-in ${
                    submitStatus.success
                      ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
                      : 'border-red-500/30 bg-red-950/40 text-red-300'
                  }`}
                >
                  {submitStatus.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{submitStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                {/* 1. Person Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>Person Name</span>
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Chaitanya Parker"
                    className="w-full rounded-xl border border-white/[0.1] bg-slate-900/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:bg-slate-900 focus:outline-none transition-colors"
                    required
                  />
                </div>

                {/* 2. Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. chaitanya@example.com"
                    className="w-full rounded-xl border border-white/[0.1] bg-slate-900/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:bg-slate-900 focus:outline-none transition-colors font-mono"
                    required
                  />
                </div>

                {/* 3. Their Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                    <span>Their Message</span>
                  </label>
                  <textarea
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Write your message, question, or feature request here..."
                    className="w-full rounded-xl border border-white/[0.1] bg-slate-900/90 p-3.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:bg-slate-900 focus:outline-none transition-colors resize-y leading-relaxed"
                    required
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500">
                    We keep your email private and respond quickly.
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
