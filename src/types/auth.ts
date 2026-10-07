export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  authProvider: 'email' | 'google' | 'both';
  createdAt: string;
  lastLoginAt: string;
  bio?: string;
  phone?: string;
  twoFactorEnabled?: boolean;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginFormData {
  identifier: string; // username or email
  password: string;
  rememberMe: boolean;
}

export interface OTPVerificationData {
  email: string;
  otp: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  timestamp: string;
  type: 'auth' | 'security' | 'profile';
  details: string;
}

export interface BackendConfig {
  mode: 'sandbox' | 'live';
  baseUrl: string;
  endpoints: {
    register: string;
    verifyOtp: string;
    resendOtp: string;
    login: string;
    googleAuth: string;
    userProfile: string;
  };
}

export interface SentEmail {
  id: string;
  to: string;
  subject: string;
  otp: string;
  sentAt: string;
  type: 'verification' | 'password_reset';
}
