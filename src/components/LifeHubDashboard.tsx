import React, { useState, useEffect } from 'react';
import { User } from '../types/auth';
import {
  api,
  LifeTask,
  LifeNote,
  LifeCalendarEvent,
  LifeBill,
  LifeNotification,
  ExecutiveSummary,
} from '../services/api';
import { SummaryDashboard } from './SummaryDashboard';
import { TasksView } from './TasksView';
import { NotesView } from './NotesView';
import { CalendarView } from './CalendarView';
import { BillsView } from './BillsView';
import { NotificationsView } from './NotificationsView';
import { ProfileView } from './ProfileView';
import { AddTaskModal } from './AddTaskModal';
import { AddNoteModal } from './AddNoteModal';
import { AddCalendarEventModal } from './AddCalendarEventModal';
import { AddBillModal } from './AddBillModal';

interface LifeHubDashboardProps {
  user: User;
  onUserUpdate: (updated: User) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tasks: LifeTask[];
  notes: LifeNote[];
  events: LifeCalendarEvent[];
  bills: LifeBill[];
  notifications: LifeNotification[];
  onRefreshData: () => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onToggleBillPaid: (id: string) => void;
  onDeleteBill: (id: string) => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
}

export const LifeHubDashboard: React.FC<LifeHubDashboardProps> = ({
  user,
  onUserUpdate,
  activeTab,
  setActiveTab,
  tasks,
  notes,
  events,
  bills,
  notifications,
  onRefreshData,
  onToggleTask,
  onDeleteTask,
  onDeleteNote,
  onDeleteEvent,
  onToggleBillPaid,
  onDeleteBill,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
}) => {
  // Modal states
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* 1. Whole Summary View */}
      {activeTab === 'summary' && (
        <SummaryDashboard
          user={user}
          summary={null}
          tasks={tasks}
          notes={notes}
          events={events}
          bills={bills}
          notifications={notifications}
          onToggleTask={onToggleTask}
          onToggleBillPaid={onToggleBillPaid}
          onNavigateTab={setActiveTab}
          onOpenAddTask={() => setIsAddTaskOpen(true)}
          onOpenAddNote={() => setIsAddNoteOpen(true)}
          onOpenAddEvent={() => setIsAddEventOpen(true)}
          onOpenAddBill={() => setIsAddBillOpen(true)}
        />
      )}

      {/* 2. Tasks View */}
      {activeTab === 'tasks' && (
        <TasksView
          tasks={tasks}
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
          onOpenAddTask={() => setIsAddTaskOpen(true)}
        />
      )}

      {/* 3. Notes View */}
      {activeTab === 'notes' && (
        <NotesView
          notes={notes}
          onDeleteNote={onDeleteNote}
          onOpenAddNote={() => setIsAddNoteOpen(true)}
        />
      )}

      {/* 4. Calendar View */}
      {activeTab === 'calendar' && (
        <CalendarView
          events={events}
          onDeleteEvent={onDeleteEvent}
          onOpenAddEvent={() => setIsAddEventOpen(true)}
        />
      )}

      {/* 5. Bills View */}
      {activeTab === 'bills' && (
        <BillsView
          bills={bills}
          onTogglePaid={onToggleBillPaid}
          onDeleteBill={onDeleteBill}
          onOpenAddBill={() => setIsAddBillOpen(true)}
        />
      )}

      {/* 6. Notifications View */}
      {activeTab === 'notifications' && (
        <NotificationsView
          notifications={notifications}
          onMarkRead={onMarkNotificationRead}
          onMarkAllRead={onMarkAllNotificationsRead}
        />
      )}

      {/* 7. Profile & Security View */}
      {activeTab === 'profile' && (
        <ProfileView user={user} onUserUpdate={onUserUpdate} />
      )}

      {/* Modals */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onTaskCreated={() => onRefreshData()}
      />

      <AddNoteModal
        isOpen={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        onNoteCreated={() => onRefreshData()}
      />

      <AddCalendarEventModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        onEventCreated={() => onRefreshData()}
      />

      <AddBillModal
        isOpen={isAddBillOpen}
        onClose={() => setIsAddBillOpen(false)}
        onBillCreated={() => onRefreshData()}
      />
    </div>
  );
};
