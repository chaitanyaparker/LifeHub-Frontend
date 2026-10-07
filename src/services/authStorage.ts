import { User, RegisterFormData, BackendConfig, SentEmail, ActivityItem } from '../types/auth';

const STORAGE_KEYS = {
  USERS: 'authforge_users',
  CURRENT_USER: 'authforge_current_user',
  TOKEN: 'authforge_token',
  PENDING_VERIFICATION: 'authforge_pending_verification',
  SENT_EMAILS: 'authforge_sent_emails',
  ACTIVITIES: 'authforge_activities',
  BACKEND_CONFIG: 'authforge_backend_config',
};

const DEFAULT_BACKEND_CONFIG: BackendConfig = {
  mode: 'sandbox',
  baseUrl: 'http://localhost:5000',
  endpoints: {
    register: '/api/auth/register',
    verifyOtp: '/api/auth/verify-otp',
    resendOtp: '/api/auth/resend-otp',
    login: '/api/auth/login',
    googleAuth: '/api/auth/google',
    userProfile: '/api/user/profile',
  },
};

const DEFAULT_USERS: User[] = [
  {
    id: 'usr_demo_01',
    firstName: 'Chaitanya',
    lastName: 'Parker',
    username: 'chaitanya_p',
    email: 'chaitanyaparker08@gmail.com',
    avatarUrl: '/src/assets/images/user_profile_avatar_1791308904789.jpg',
    isEmailVerified: true,
    authProvider: 'google',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    lastLoginAt: new Date().toISOString(),
    bio: 'Full-stack developer building robust authentication workflows & clean interfaces.',
    phone: '+1 (555) 389-2041',
    twoFactorEnabled: false,
  },
  {
    id: 'usr_demo_02',
    firstName: 'Alex',
    lastName: 'Rivera',
    username: 'alex_rivera',
    email: 'alex.rivera@example.com',
    isEmailVerified: true,
    authProvider: 'email',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
    bio: 'Software engineer focusing on distributed APIs.',
    twoFactorEnabled: true,
  },
];

// Helper to get from local storage
export function getStoredUsers(): User[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_USERS;
  }
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// User credentials map in storage (for simulated password check)
const PASSWORDS_KEY = 'authforge_passwords';
export function getStoredPasswords(): Record<string, string> {
  try {
    const data = localStorage.getItem(PASSWORDS_KEY);
    return data ? JSON.parse(data) : {
      'chaitanyaparker08@gmail.com': 'Password123!',
      'chaitanya_p': 'Password123!',
      'alex.rivera@example.com': 'SecurePass2026!',
      'alex_rivera': 'SecurePass2026!',
    };
  } catch {
    return {};
  }
}

export function saveUserPassword(email: string, username: string, pass: string): void {
  const passes = getStoredPasswords();
  passes[email.toLowerCase()] = pass;
  passes[username.toLowerCase()] = pass;
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passes));
}

export function getCurrentUser(): User | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.TOKEN, `jwt_token_${user.id}_${Date.now()}`);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }
}

export function getPendingVerification(): {
  email: string;
  otp: string;
  tempUser: RegisterFormData;
  expiresAt: number;
} | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PENDING_VERIFICATION);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setPendingVerification(data: {
  email: string;
  otp: string;
  tempUser: RegisterFormData;
  expiresAt: number;
} | null): void {
  if (data) {
    localStorage.setItem(STORAGE_KEYS.PENDING_VERIFICATION, JSON.stringify(data));
  } else {
    localStorage.removeItem(STORAGE_KEYS.PENDING_VERIFICATION);
  }
}

export function getSentEmails(): SentEmail[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SENT_EMAILS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addSentEmail(email: SentEmail): void {
  const current = getSentEmails();
  const updated = [email, ...current].slice(0, 10);
  localStorage.setItem(STORAGE_KEYS.SENT_EMAILS, JSON.stringify(updated));
}

export function getActivities(): ActivityItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return data ? JSON.parse(data) : [
      {
        id: 'act_01',
        action: 'System Initialized',
        timestamp: new Date().toISOString(),
        type: 'auth',
        details: 'AuthForge portal ready for registration & login workflows.',
      },
    ];
  } catch {
    return [];
  }
}

export function addActivity(action: string, type: 'auth' | 'security' | 'profile', details: string): void {
  const list = getActivities();
  const newItem: ActivityItem = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    action,
    timestamp: new Date().toISOString(),
    type,
    details,
  };
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([newItem, ...list].slice(0, 20)));
}

export function getBackendConfig(): BackendConfig {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BACKEND_CONFIG);
    return data ? JSON.parse(data) : DEFAULT_BACKEND_CONFIG;
  } catch {
    return DEFAULT_BACKEND_CONFIG;
  }
}

export function saveBackendConfig(config: BackendConfig): void {
  localStorage.setItem(STORAGE_KEYS.BACKEND_CONFIG, JSON.stringify(config));
}

// Generate random 6-digit OTP code
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
