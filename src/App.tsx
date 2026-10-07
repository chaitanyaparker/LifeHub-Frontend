import React, { useState, useEffect } from 'react';
import { LifeHubNavbar } from './components/LifeHubNavbar';
import { LifeHubSidebar } from './components/LifeHubSidebar';
import { LifeHubDashboard } from './components/LifeHubDashboard';
import { LifeHubAuth } from './components/LifeHubAuth';
import { WelcomeLandingPage } from './components/WelcomeLandingPage';
import { LifeHubGoogleModal } from './components/LifeHubGoogleModal';
import { LifeHubEmailToast } from './components/LifeHubEmailToast';
import { BackendConnectionModal } from './components/BackendConnectionModal';
import { User } from './types/auth';
import {
  api,
  LifeTask,
  LifeNote,
  LifeCalendarEvent,
  LifeBill,
  LifeNotification,
} from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(api.getCachedUser());
  const [guestView, setGuestView] = useState<'welcome' | 'auth'>('welcome');
  const [authView, setAuthView] = useState<'login' | 'register' | 'otp'>('register');
  const [currentTab, setCurrentTab] = useState<string>('summary');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);
  const [emailNotification, setEmailNotification] = useState<{ email: string; otp: string } | null>(null);

  // Live collections from database
  const [tasks, setTasks] = useState<LifeTask[]>([]);
  const [notes, setNotes] = useState<LifeNote[]>([]);
  const [events, setEvents] = useState<LifeCalendarEvent[]>([]);
  const [bills, setBills] = useState<LifeBill[]>([]);
  const [notifications, setNotifications] = useState<LifeNotification[]>([]);

  // Refresh all collections from database
  const refreshData = async () => {
    try {
      const [tList, nList, eList, bList, notifList] = await Promise.all([
        api.getTasks(),
        api.getNotes(),
        api.getCalendarEvents(),
        api.getBills(),
        api.getNotifications(),
      ]);
      setTasks(tList);
      setNotes(nList);
      setEvents(eList);
      setBills(bList);
      setNotifications(notifList);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  useEffect(() => {
    // Check session on mount
    const initSession = async () => {
      const meRes = await api.getMe();
      if (meRes.success && meRes.user) {
        setCurrentUser(meRes.user);
      }
      refreshData();
    };

    initSession();
  }, []);

  // Handlers for real DB interactions
  const handleToggleTask = async (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t))
    );
    await api.toggleTask(id);
    refreshData();
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await api.deleteTask(id);
  };

  const handleDeleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await api.deleteNote(id);
  };

  const handleDeleteEvent = async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    await api.deleteCalendarEvent(id);
  };

  const handleToggleBillPaid = async (id: string) => {
    setBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: b.status === 'paid' ? 'pending' : 'paid' } : b))
    );
    await api.toggleBillPaid(id);
    refreshData();
  };

  const handleDeleteBill = async (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
    await api.deleteBill(id);
  };

  const handleMarkNotificationRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await api.markNotificationRead(id);
  };

  const handleMarkAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await api.markAllNotificationsRead();
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentTab('summary');
    setEmailNotification(null);
    refreshData();
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setGuestView('welcome');
    setAuthView('login');
  };

  const pendingTasksCount = tasks.filter((t) => t.status === 'pending').length;
  const unpaidBillsCount = bills.filter((b) => b.status === 'pending').length;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300 antialiased">
      {/* 1. TOP NAVBAR: App Name, Search Bar, Notification Bell, User Avatar / Initials */}
      <LifeHubNavbar
        currentUser={currentUser}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onSelectFeatureTab={(tab) => setCurrentTab(tab)}
        onOpenLogin={() => {
          setAuthView('login');
          setGuestView('auth');
        }}
        onOpenRegister={() => {
          setAuthView('register');
          setGuestView('auth');
        }}
        onOpenHome={() => setGuestView('welcome')}
        onOpenBackendSettings={() => setIsBackendModalOpen(true)}
        allTasks={tasks}
        allNotes={notes}
        allBills={bills}
        allEvents={events}
      />

      {/* 2. MAIN WORKSPACE */}
      {currentUser ? (
        <div className="flex-1 flex flex-col md:flex-row w-full">
          {/* SIDEBAR: Feature navigation + Logout Button at the end */}
          <LifeHubSidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            onLogout={handleLogout}
            onOpenBackendSettings={() => setIsBackendModalOpen(true)}
            isMobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            pendingTasksCount={pendingTasksCount}
            unpaidBillsCount={unpaidBillsCount}
            unreadNotifsCount={unreadNotifsCount}
            notesCount={notes.length}
            user={currentUser}
          />

          {/* MAIN DASHBOARD CONTENT AREA */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <LifeHubDashboard
              user={currentUser}
              onUserUpdate={(updated) => setCurrentUser(updated)}
              activeTab={currentTab}
              setActiveTab={setCurrentTab}
              tasks={tasks}
              notes={notes}
              events={events}
              bills={bills}
              notifications={notifications}
              onRefreshData={refreshData}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onDeleteNote={handleDeleteNote}
              onDeleteEvent={handleDeleteEvent}
              onToggleBillPaid={handleToggleBillPaid}
              onDeleteBill={handleDeleteBill}
              onMarkNotificationRead={handleMarkNotificationRead}
              onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
            />
          </main>
        </div>
      ) : guestView === 'welcome' ? (
        /* WELCOME / HOME SCREEN FOR GUESTS: App features, benefits, what's new */
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <WelcomeLandingPage
            onOpenRegister={() => {
              setAuthView('register');
              setGuestView('auth');
            }}
            onOpenLogin={() => {
              setAuthView('login');
              setGuestView('auth');
            }}
          />
        </main>
      ) : (
        /* AUTH PORTAL: Registration (First/Last name, username, email, password), OTP, and Login */
        <main className="flex-1 flex items-center justify-center py-10 px-4">
          <LifeHubAuth
            initialView={authView}
            onSuccess={handleAuthSuccess}
            onOpenGoogleModal={() => setIsGoogleModalOpen(true)}
            onNotifyOtpDispatched={(email, otp) => {
              setEmailNotification({ email, otp });
            }}
            onBackToWelcome={() => setGuestView('welcome')}
          />
        </main>
      )}

      {/* Google OAuth Modal */}
      <LifeHubGoogleModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Modern Email Dispatch Toast */}
      <LifeHubEmailToast
        notification={emailNotification}
        onClear={() => setEmailNotification(null)}
      />

      {/* Backend API Connection & URL Allotment Modal */}
      <BackendConnectionModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        onUrlChanged={async () => {
          // Re-sync user session & live collections from newly allotted backend
          const meRes = await api.getMe();
          if (meRes.success && meRes.user) {
            setCurrentUser(meRes.user);
          }
          refreshData();
        }}
      />
    </div>
  );
}
