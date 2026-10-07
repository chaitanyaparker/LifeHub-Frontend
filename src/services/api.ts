import { User } from '../types/auth';
import {
  resolveApiUrl,
  getActiveBackendUrl,
  allotBackendUrl,
} from '../config/apiConfig';

const TOKEN_KEY = 'lifehub_session_token';
const USER_KEY = 'lifehub_current_user';

export interface LifeHabit {
  id: string;
  userId: string;
  title: string;
  pillar: 'Health' | 'Mind' | 'Craft' | 'Finance';
  streak: number;
  completedToday: boolean;
  targetDays: number;
  lastCompletedDate?: string;
}

export interface LifeTask {
  id: string;
  userId: string;
  title: string;
  status: 'pending' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  category: string;
}

export interface LifeNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  tag: string;
  updatedAt: string;
  color?: string;
}

export interface LifeCalendarEvent {
  id: string;
  userId: string;
  title: string;
  date: string;
  time: string;
  category: string;
  location?: string;
}

export interface LifeBill {
  id: string;
  userId: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending';
  category: string;
  recurring?: string;
}

export interface LifeNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'task' | 'bill' | 'calendar' | 'system';
}

export interface LifeActivity {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details: string;
  type: 'auth' | 'habit' | 'profile';
}

export interface ExecutiveSummary {
  tasksCount: number;
  pendingTasksCount: number;
  completedTasksCount: number;
  notesCount: number;
  eventsCount: number;
  billsCount: number;
  pendingBillsCount: number;
  billsTotalDue: number;
  unreadNotificationsCount: number;
  habitsCount: number;
  habitsCompletedToday: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  user?: User;
  token?: string;
  email?: string;
  otpForPreview?: string;
  available?: boolean;
  habits?: LifeHabit[];
  tasks?: LifeTask[];
  task?: LifeTask;
  notes?: LifeNote[];
  note?: LifeNote;
  events?: LifeCalendarEvent[];
  event?: LifeCalendarEvent;
  bills?: LifeBill[];
  bill?: LifeBill;
  notifications?: LifeNotification[];
  notification?: LifeNotification;
  summary?: ExecutiveSummary;
  recentTasks?: LifeTask[];
  recentNotes?: LifeNote[];
  upcomingEvents?: LifeCalendarEvent[];
  recentBills?: LifeBill[];
  recentNotifications?: LifeNotification[];
  activities?: LifeActivity[];
  emails?: { id: string; to: string; subject: string; otp: string; sentAt: string }[];
  requiresVerification?: boolean;
}

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public setSession(token: string, user: User) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  public getCachedUser(): User | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Returns the currently active backend URL (' ' means same-origin relative /api).
   */
  public getBackendUrl(): string {
    return getActiveBackendUrl();
  }

  /**
   * Dynamically allot a custom backend URL (saved to localStorage).
   * Pass null or '' to reset to default.
   */
  public setBackendUrl(url: string | null): void {
    allotBackendUrl(url);
  }

  /**
   * Tests the connection to the backend health endpoint.
   * Useful to test any custom URL before saving it!
   */
  public async testBackendHealth(urlOverride?: string): Promise<{
    ok: boolean;
    status: number;
    latencyMs: number;
    data?: unknown;
    error?: string;
  }> {
    const startTime = performance.now();
    const targetUrl = urlOverride !== undefined
      ? (urlOverride.trim() ? `${urlOverride.trim().replace(/\/+$/, '')}/api/health` : '/api/health')
      : resolveApiUrl('/api/health');

    try {
      const res = await fetch(targetUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      const latencyMs = Math.round(performance.now() - startTime);

      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          latencyMs,
          error: `HTTP ${res.status}: ${res.statusText}`,
        };
      }

      const data = await res.json();
      return {
        ok: true,
        status: res.status,
        latencyMs,
        data,
      };
    } catch (err) {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        ok: false,
        status: 0,
        latencyMs,
        error: (err as Error).message || 'Failed to connect to backend.',
      };
    }
  }

  /**
   * Core HTTP request handler.
   * Automatically resolves path against the configured backend URL,
   * injects Authorization Bearer tokens, and formats error responses.
   */
  private async request<T = unknown>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const fullUrl = resolveApiUrl(path);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(fullUrl, {
        ...options,
        headers,
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.message || `Request failed with status ${res.status}`,
          requiresVerification: data.requiresVerification,
          email: data.email,
        };
      }
      return data;
    } catch (err: unknown) {
      const activeUrl = getActiveBackendUrl() || 'same-origin (/api)';
      return {
        success: false,
        message: `Network error connecting to backend (${activeUrl}): ${(err as Error).message || 'Connection refused. Ensure CORS is enabled on external backend.'}`,
      };
    }
  }

  // Auth Methods
  async checkUsername(username: string): Promise<{ available: boolean; message: string }> {
    const res = await this.request<{ available: boolean; message: string }>(
      `/api/auth/check-username?username=${encodeURIComponent(username)}`,
      { method: 'GET' }
    );
    return {
      available: res.available ?? true,
      message: res.message || '',
    };
  }

  async register(payload: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }): Promise<ApiResponse> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async verifyOtp(payload: { email: string; otp: string }): Promise<ApiResponse> {
    const res = await this.request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.success && res.token && res.user) {
      this.setSession(res.token, res.user);
    }
    return res;
  }

  async resendOtp(email: string): Promise<ApiResponse> {
    return this.request('/api/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async login(payload: { identifier: string; password: string }): Promise<ApiResponse> {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.success && res.token && res.user) {
      this.setSession(res.token, res.user);
    }
    return res;
  }

  async googleAuth(profile: {
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  }): Promise<ApiResponse> {
    const res = await this.request('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
    if (res.success && res.token && res.user) {
      this.setSession(res.token, res.user);
    }
    return res;
  }

  async getMe(): Promise<ApiResponse> {
    const res = await this.request('/api/auth/me', { method: 'GET' });
    if (res.success && res.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
    return res;
  }

  // Executive Summary API
  async getSummary(): Promise<ApiResponse> {
    return this.request('/api/lifehub/summary', { method: 'GET' });
  }

  // Tasks API
  async getTasks(): Promise<LifeTask[]> {
    const res = await this.request<{ tasks: LifeTask[] }>('/api/lifehub/tasks', { method: 'GET' });
    return res.tasks || [];
  }

  async addTask(payload: { title: string; priority?: 'high' | 'medium' | 'low'; dueDate?: string; category?: string }): Promise<ApiResponse> {
    return this.request('/api/lifehub/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async toggleTask(id: string): Promise<ApiResponse> {
    return this.request(`/api/lifehub/tasks/${id}/toggle`, { method: 'POST' });
  }

  async deleteTask(id: string): Promise<ApiResponse> {
    return this.request(`/api/lifehub/tasks/${id}`, { method: 'DELETE' });
  }

  // Notes API
  async getNotes(): Promise<LifeNote[]> {
    const res = await this.request<{ notes: LifeNote[] }>('/api/lifehub/notes', { method: 'GET' });
    return res.notes || [];
  }

  async addNote(payload: { title: string; content?: string; tag?: string; color?: string }): Promise<ApiResponse> {
    return this.request('/api/lifehub/notes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateNote(id: string, payload: Partial<LifeNote>): Promise<ApiResponse> {
    return this.request(`/api/lifehub/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteNote(id: string): Promise<ApiResponse> {
    return this.request(`/api/lifehub/notes/${id}`, { method: 'DELETE' });
  }

  // Calendar API
  async getCalendarEvents(): Promise<LifeCalendarEvent[]> {
    const res = await this.request<{ events: LifeCalendarEvent[] }>('/api/lifehub/calendar', { method: 'GET' });
    return res.events || [];
  }

  async addCalendarEvent(payload: { title: string; date: string; time?: string; category?: string; location?: string }): Promise<ApiResponse> {
    return this.request('/api/lifehub/calendar', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteCalendarEvent(id: string): Promise<ApiResponse> {
    return this.request(`/api/lifehub/calendar/${id}`, { method: 'DELETE' });
  }

  // Bills API
  async getBills(): Promise<LifeBill[]> {
    const res = await this.request<{ bills: LifeBill[] }>('/api/lifehub/bills', { method: 'GET' });
    return res.bills || [];
  }

  async addBill(payload: { title: string; amount: number; dueDate: string; category?: string; recurring?: string }): Promise<ApiResponse> {
    return this.request('/api/lifehub/bills', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async toggleBillPaid(id: string): Promise<ApiResponse> {
    return this.request(`/api/lifehub/bills/${id}/toggle-paid`, { method: 'POST' });
  }

  async deleteBill(id: string): Promise<ApiResponse> {
    return this.request(`/api/lifehub/bills/${id}`, { method: 'DELETE' });
  }

  // Notifications API
  async getNotifications(): Promise<LifeNotification[]> {
    const res = await this.request<{ notifications: LifeNotification[] }>('/api/lifehub/notifications', { method: 'GET' });
    return res.notifications || [];
  }

  async markNotificationRead(id: string): Promise<ApiResponse> {
    return this.request(`/api/lifehub/notifications/${id}/read`, { method: 'POST' });
  }

  async markAllNotificationsRead(): Promise<ApiResponse> {
    return this.request('/api/lifehub/notifications/read-all', { method: 'POST' });
  }

  // Habits API
  async getHabits(): Promise<LifeHabit[]> {
    const res = await this.request<{ habits: LifeHabit[] }>('/api/lifehub/habits', { method: 'GET' });
    return res.habits || [];
  }

  async addHabit(payload: { title: string; pillar: 'Health' | 'Mind' | 'Craft' | 'Finance'; targetDays: number }): Promise<ApiResponse> {
    return this.request('/api/lifehub/habits', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async toggleHabit(id: string): Promise<ApiResponse> {
    return this.request(`/api/lifehub/habits/${id}/toggle`, { method: 'POST' });
  }

  async deleteHabit(id: string): Promise<ApiResponse> {
    return this.request(`/api/lifehub/habits/${id}`, { method: 'DELETE' });
  }

  // Profile API
  async updateProfile(payload: Partial<User>): Promise<ApiResponse> {
    const res = await this.request('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (res.success && res.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
    return res;
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    return this.request('/api/user/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async getActivities(): Promise<LifeActivity[]> {
    const res = await this.request('/api/lifehub/activity', { method: 'GET' });
    return res.activities || [];
  }

  async getSentEmails() {
    const res = await this.request('/api/lifehub/sent-emails', { method: 'GET' });
    return res.emails || [];
  }

  async submitContact(data: { name: string; email: string; message: string }): Promise<ApiResponse> {
    return this.request('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  logout() {
    this.clearSession();
  }
}

export const api = new ApiService();
