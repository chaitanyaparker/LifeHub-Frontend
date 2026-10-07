import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.resolve(__dirname, 'db.json');

export interface DbUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  authProvider: 'email' | 'google' | 'both';
  createdAt: string;
  lastLoginAt: string;
  bio?: string;
  phone?: string;
  twoFactorEnabled?: boolean;
}

export interface DbPendingOtp {
  email: string;
  otp: string;
  tempUser: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    passwordHash: string;
  };
  expiresAt: number;
  createdAt: string;
}

export interface DbSession {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: number;
}

export interface DbHabit {
  id: string;
  userId: string;
  title: string;
  pillar: 'Health' | 'Mind' | 'Craft' | 'Finance';
  streak: number;
  completedToday: boolean;
  targetDays: number;
  lastCompletedDate?: string;
}

export interface DbTask {
  id: string;
  userId: string;
  title: string;
  status: 'pending' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  category: string;
}

export interface DbNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  tag: string;
  updatedAt: string;
  color?: string;
}

export interface DbCalendarEvent {
  id: string;
  userId: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  category: string;
  location?: string;
}

export interface DbBill {
  id: string;
  userId: string;
  title: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: 'paid' | 'pending';
  category: string;
  recurring?: string;
}

export interface DbNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'task' | 'bill' | 'calendar' | 'system';
}

export interface DbActivity {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details: string;
  type: 'auth' | 'habit' | 'profile';
}

export interface DatabaseSchema {
  users: DbUser[];
  pendingOtps: DbPendingOtp[];
  sessions: DbSession[];
  habits: DbHabit[];
  tasks: DbTask[];
  notes: DbNote[];
  calendarEvents: DbCalendarEvent[];
  bills: DbBill[];
  notifications: DbNotification[];
  activities: DbActivity[];
  sentEmails: {
    id: string;
    to: string;
    subject: string;
    otp: string;
    sentAt: string;
  }[];
  contactMessages?: {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: string;
  }[];
}

const DEFAULT_DB: DatabaseSchema = {
  users: [
    {
      id: 'usr_chaitanya_01',
      firstName: 'Chaitanya',
      lastName: 'Parker',
      username: 'chaitanya_p',
      email: 'chaitanyaparker08@gmail.com',
      passwordHash: 'Password123!',
      avatarUrl: '/src/assets/images/user_profile_avatar_1791308904789.jpg',
      isEmailVerified: true,
      authProvider: 'google',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      lastLoginAt: new Date().toISOString(),
      bio: 'Building life systems, routines, and high-impact software.',
      phone: '+1 (555) 728-1920',
      twoFactorEnabled: false,
    },
  ],
  pendingOtps: [],
  sessions: [],
  habits: [
    {
      id: 'hbt_01',
      userId: 'usr_chaitanya_01',
      title: 'Morning Deep Work (90 mins)',
      pillar: 'Craft',
      streak: 14,
      completedToday: true,
      targetDays: 7,
      lastCompletedDate: new Date().toISOString().split('T')[0],
    },
    {
      id: 'hbt_02',
      userId: 'usr_chaitanya_01',
      title: 'Zone 2 Cardio or Strength Training',
      pillar: 'Health',
      streak: 9,
      completedToday: false,
      targetDays: 5,
    },
    {
      id: 'hbt_03',
      userId: 'usr_chaitanya_01',
      title: 'Read 20 Pages Non-Fiction',
      pillar: 'Mind',
      streak: 22,
      completedToday: true,
      targetDays: 7,
      lastCompletedDate: new Date().toISOString().split('T')[0],
    },
    {
      id: 'hbt_04',
      userId: 'usr_chaitanya_01',
      title: 'Weekly Budget & Investment Review',
      pillar: 'Finance',
      streak: 6,
      completedToday: false,
      targetDays: 1,
    },
  ],
  tasks: [
    {
      id: 'tsk_01',
      userId: 'usr_chaitanya_01',
      title: 'Review quarterly architecture blueprint',
      status: 'pending',
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      category: 'Work',
    },
    {
      id: 'tsk_02',
      userId: 'usr_chaitanya_01',
      title: 'Submit utility & server invoice expense report',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      category: 'Finance',
    },
    {
      id: 'tsk_03',
      userId: 'usr_chaitanya_01',
      title: 'Schedule quarterly dental checkup',
      status: 'completed',
      priority: 'low',
      dueDate: new Date().toISOString().split('T')[0],
      category: 'Health',
    },
    {
      id: 'tsk_04',
      userId: 'usr_chaitanya_01',
      title: 'Research TypeScript 5.8 performance updates',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      category: 'Learning',
    },
  ],
  notes: [
    {
      id: 'not_01',
      userId: 'usr_chaitanya_01',
      title: 'Weekly Sprint Focus & Priorities',
      content: '1. Ship the full LifeHub task & calendar modules.\n2. Consolidate cloud infrastructure costs.\n3. Keep consistent zone-2 running baseline.',
      tag: 'Work',
      updatedAt: new Date().toISOString(),
      color: 'emerald',
    },
    {
      id: 'not_02',
      userId: 'usr_chaitanya_01',
      title: 'Book Recommendations 2026',
      content: '• "Thinking in Systems" - Donella Meadows\n• "Designing Data-Intensive Applications" - Martin Kleppmann\n• "Breath" - James Nestor',
      tag: 'Reading',
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      color: 'teal',
    },
    {
      id: 'not_03',
      userId: 'usr_chaitanya_01',
      title: 'Investment & Asset Allocation Strategy',
      content: 'Rebalance index fund DCA at month end. Ensure 6-month liquid emergency reserve in high-yield account.',
      tag: 'Finance',
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      color: 'blue',
    },
  ],
  calendarEvents: [
    {
      id: 'evt_01',
      userId: 'usr_chaitanya_01',
      title: 'LifeHub Product Sync & Design Review',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      category: 'Product',
      location: 'Virtual Room A',
    },
    {
      id: 'evt_02',
      userId: 'usr_chaitanya_01',
      title: 'Quarterly Financial Planning Session',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '10:30',
      category: 'Finance',
      location: 'Home Office',
    },
    {
      id: 'evt_03',
      userId: 'usr_chaitanya_01',
      title: 'Cardio Training & Recovery',
      date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      time: '07:30',
      category: 'Health',
      location: 'Athletic Center',
    },
  ],
  bills: [
    {
      id: 'bil_01',
      userId: 'usr_chaitanya_01',
      title: 'High-Speed Fiber Internet',
      amount: 65.00,
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      status: 'pending',
      category: 'Utilities',
      recurring: 'Monthly',
    },
    {
      id: 'bil_02',
      userId: 'usr_chaitanya_01',
      title: 'Cloud Infrastructure & Server Hosting',
      amount: 142.50,
      dueDate: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
      status: 'pending',
      category: 'Cloud Services',
      recurring: 'Monthly',
    },
    {
      id: 'bil_03',
      userId: 'usr_chaitanya_01',
      title: 'Health & Gym Membership',
      amount: 80.00,
      dueDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      status: 'paid',
      category: 'Health',
      recurring: 'Monthly',
    },
    {
      id: 'bil_04',
      userId: 'usr_chaitanya_01',
      title: 'Clean Energy Electric Utility',
      amount: 94.20,
      dueDate: new Date(Date.now() + 11 * 86400000).toISOString().split('T')[0],
      status: 'pending',
      category: 'Utilities',
      recurring: 'Monthly',
    },
  ],
  notifications: [
    {
      id: 'notif_01',
      userId: 'usr_chaitanya_01',
      title: 'Fiber Internet Bill Due Soon',
      message: 'Payment of $65.00 is due in 3 days. Check Bills tab to review.',
      time: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      type: 'bill',
    },
    {
      id: 'notif_02',
      userId: 'usr_chaitanya_01',
      title: 'Calendar: Product Sync in 2 Hours',
      message: 'LifeHub Product Sync & Design Review begins at 14:00.',
      time: new Date(Date.now() - 7200000).toISOString(),
      read: false,
      type: 'calendar',
    },
    {
      id: 'notif_03',
      userId: 'usr_chaitanya_01',
      title: 'High Priority Task Deadline',
      message: '"Review quarterly architecture blueprint" is due tomorrow.',
      time: new Date(Date.now() - 86400000).toISOString(),
      read: true,
      type: 'task',
    },
  ],
  activities: [
    {
      id: 'act_seed_01',
      userId: 'usr_chaitanya_01',
      action: 'LifeHub Account Initialized',
      timestamp: new Date().toISOString(),
      details: 'Google OAuth Single Sign-On link verified.',
      type: 'auth',
    },
  ],
  sentEmails: [],
};

// Thread-safe read/write helpers
export function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDb(DEFAULT_DB);
      return DEFAULT_DB;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);

    // Ensure all collections exist in case of previous db.json version
    parsed.tasks = parsed.tasks || DEFAULT_DB.tasks;
    parsed.notes = parsed.notes || DEFAULT_DB.notes;
    parsed.calendarEvents = parsed.calendarEvents || DEFAULT_DB.calendarEvents;
    parsed.bills = parsed.bills || DEFAULT_DB.bills;
    parsed.notifications = parsed.notifications || DEFAULT_DB.notifications;

    return parsed;
  } catch (err) {
    console.error('Error reading db.json, returning default:', err);
    return DEFAULT_DB;
  }
}

export function writeDb(data: DatabaseSchema): void {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to db.json:', err);
  }
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export function generate6DigitOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
