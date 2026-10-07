import {
  User,
  RegisterFormData,
  SentEmail,
} from '../types/auth';
import {
  getStoredUsers,
  saveUsers,
  getStoredPasswords,
  saveUserPassword,
  setCurrentUser,
  getPendingVerification,
  setPendingVerification,
  addSentEmail,
  getSentEmails,
  addActivity,
  getBackendConfig,
  generateOTP,
} from './authStorage';

export interface AuthResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  otpForPreview?: string; // provided in sandbox mode for instant developer convenience
}

export class AuthService {
  /**
   * Register user with First Name, Last Name, Username, Email, Password
   */
  static async register(formData: RegisterFormData): Promise<AuthResponse<{ email: string; otp: string }>> {
    const config = getBackendConfig();

    // If configured to hit real backend
    if (config.mode === 'live') {
      try {
        const res = await fetch(`${config.baseUrl}${config.endpoints.register}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            username: formData.username.trim().toLowerCase(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, message: data.message || 'Registration failed on backend', error: data.error };
        }
        return { success: true, message: data.message || 'OTP sent to email', data: { email: formData.email, otp: data.otp || '' } };
      } catch (err: unknown) {
        return {
          success: false,
          message: `Backend connection failed: ${(err as Error).message}. Check Backend Settings.`,
          error: (err as Error).message,
        };
      }
    }

    // Sandbox Engine
    const users = getStoredUsers();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanUsername = formData.username.trim().toLowerCase();

    // Check existing
    const emailExists = users.some((u) => u.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    const usernameExists = users.some((u) => u.username.toLowerCase() === cleanUsername);
    if (usernameExists) {
      return { success: false, message: 'This username is already taken. Please choose another.' };
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in pending verification
    setPendingVerification({
      email: cleanEmail,
      otp,
      tempUser: formData,
      expiresAt,
    });

    // Save password
    saveUserPassword(cleanEmail, cleanUsername, formData.password);

    // Record sent email for verification drawer preview
    const sentEmailRecord: SentEmail = {
      id: `mail_${Date.now()}`,
      to: cleanEmail,
      subject: 'Verify your account - 6-Digit Security Code',
      otp,
      sentAt: new Date().toISOString(),
      type: 'verification',
    };
    addSentEmail(sentEmailRecord);

    addActivity('Registration Initiated', 'auth', `Registration initiated for @${cleanUsername} (${cleanEmail}). OTP sent.`);

    return {
      success: true,
      message: `Verification code generated and sent to ${cleanEmail}`,
      data: { email: cleanEmail, otp },
      otpForPreview: otp,
    };
  }

  /**
   * Verify OTP and complete registration
   */
  static async verifyOTP(email: string, enteredOtp: string): Promise<AuthResponse<User>> {
    const config = getBackendConfig();

    if (config.mode === 'live') {
      try {
        const res = await fetch(`${config.baseUrl}${config.endpoints.verifyOtp}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase(), otp: enteredOtp.trim() }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, message: data.message || 'Invalid OTP code', error: data.error };
        }
        if (data.user) {
          setCurrentUser(data.user);
          return { success: true, message: 'Email verified successfully!', data: data.user };
        }
        return { success: true, message: 'Email verified successfully!' };
      } catch (err: unknown) {
        return {
          success: false,
          message: `Backend connection failed: ${(err as Error).message}`,
          error: (err as Error).message,
        };
      }
    }

    // Sandbox Engine
    const pending = getPendingVerification();
    const cleanEmail = email.trim().toLowerCase();

    if (!pending || pending.email.toLowerCase() !== cleanEmail) {
      return {
        success: false,
        message: 'No pending verification session found for this email. Please register again.',
      };
    }

    if (Date.now() > pending.expiresAt) {
      return {
        success: false,
        message: 'The verification code has expired. Please request a new code.',
      };
    }

    if (pending.otp !== enteredOtp.trim()) {
      return {
        success: false,
        message: 'Invalid 6-digit code. Please check and try again.',
      };
    }

    // Valid OTP! Create real user and add to DB
    const users = getStoredUsers();
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      firstName: pending.tempUser.firstName.trim(),
      lastName: pending.tempUser.lastName.trim(),
      username: pending.tempUser.username.trim().toLowerCase(),
      email: cleanEmail,
      isEmailVerified: true,
      authProvider: 'email',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      bio: `Hello! I am ${pending.tempUser.firstName}.`,
      twoFactorEnabled: false,
    };

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    setPendingVerification(null);
    setCurrentUser(newUser);

    addActivity('Email Verified', 'auth', `Account @${newUser.username} successfully verified via OTP.`);

    return {
      success: true,
      message: 'Account verified successfully! Welcome to your dashboard.',
      data: newUser,
    };
  }

  /**
   * Resend 6-digit OTP
   */
  static async resendOTP(email: string): Promise<AuthResponse<{ otp: string }>> {
    const config = getBackendConfig();

    if (config.mode === 'live') {
      try {
        const res = await fetch(`${config.baseUrl}${config.endpoints.resendOtp}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, message: data.message || 'Failed to resend OTP' };
        }
        return { success: true, message: 'New OTP sent to email!', data: { otp: data.otp || '' } };
      } catch (err: unknown) {
        return { success: false, message: `Backend error: ${(err as Error).message}` };
      }
    }

    // Sandbox Engine
    const pending = getPendingVerification();
    const cleanEmail = email.trim().toLowerCase();

    if (!pending || pending.email.toLowerCase() !== cleanEmail) {
      return { success: false, message: 'No pending registration found for this email address.' };
    }

    const newOtp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    setPendingVerification({
      ...pending,
      otp: newOtp,
      expiresAt,
    });

    const sentEmailRecord: SentEmail = {
      id: `mail_${Date.now()}`,
      to: cleanEmail,
      subject: 'New Security Verification Code',
      otp: newOtp,
      sentAt: new Date().toISOString(),
      type: 'verification',
    };
    addSentEmail(sentEmailRecord);

    addActivity('OTP Resent', 'auth', `A refreshed 6-digit OTP code was dispatched to ${cleanEmail}.`);

    return {
      success: true,
      message: `A new 6-digit code has been sent to ${cleanEmail}`,
      data: { otp: newOtp },
      otpForPreview: newOtp,
    };
  }

  /**
   * Login with Username OR Email and Password
   */
  static async login(identifier: string, pass: string): Promise<AuthResponse<User>> {
    const config = getBackendConfig();

    if (config.mode === 'live') {
      try {
        const res = await fetch(`${config.baseUrl}${config.endpoints.login}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: identifier.trim(), password: pass }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, message: data.message || 'Login failed', error: data.error };
        }
        if (data.user) {
          setCurrentUser(data.user);
          return { success: true, message: 'Logged in successfully', data: data.user };
        }
        return { success: false, message: 'User data not returned by backend' };
      } catch (err: unknown) {
        return { success: false, message: `Backend error: ${(err as Error).message}` };
      }
    }

    // Sandbox Engine
    const cleanId = identifier.trim().toLowerCase();
    const users = getStoredUsers();
    const passwords = getStoredPasswords();

    // Find user by either email or username
    const user = users.find(
      (u) => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
    );

    if (!user) {
      return {
        success: false,
        message: 'No account found with this username or email address.',
      };
    }

    const savedPass = passwords[user.email.toLowerCase()] || passwords[user.username.toLowerCase()];
    if (savedPass && savedPass !== pass) {
      return {
        success: false,
        message: 'Incorrect password. Please verify your credentials and try again.',
      };
    }

    // Check if email was verified
    if (!user.isEmailVerified) {
      return {
        success: false,
        message: 'Your email has not been verified yet. Please complete verification first.',
      };
    }

    // Update lastLoginAt
    const updatedUser: User = {
      ...user,
      lastLoginAt: new Date().toISOString(),
    };
    const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u));
    saveUsers(updatedUsers);
    setCurrentUser(updatedUser);

    addActivity('User Login', 'auth', `User @${updatedUser.username} signed in successfully.`);

    return {
      success: true,
      message: `Welcome back, ${updatedUser.firstName}!`,
      data: updatedUser,
    };
  }

  /**
   * Google OAuth Login / Registration
   * Instantly creates account or logs in and goes directly to dashboard
   */
  static async loginWithGoogle(googleProfile: {
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  }): Promise<AuthResponse<User>> {
    const config = getBackendConfig();

    if (config.mode === 'live') {
      try {
        const res = await fetch(`${config.baseUrl}${config.endpoints.googleAuth}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(googleProfile),
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, message: data.message || 'Google OAuth failed' };
        }
        if (data.user) {
          setCurrentUser(data.user);
          return { success: true, message: 'Google authentication successful', data: data.user };
        }
      } catch (err: unknown) {
        return { success: false, message: `Backend error: ${(err as Error).message}` };
      }
    }

    // Sandbox Engine
    const users = getStoredUsers();
    const cleanEmail = googleProfile.email.trim().toLowerCase();

    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (user) {
      // Existing user logging in with Google
      const updatedUser: User = {
        ...user,
        avatarUrl: googleProfile.avatarUrl || user.avatarUrl,
        authProvider: user.authProvider === 'email' ? 'both' : user.authProvider,
        lastLoginAt: new Date().toISOString(),
      };
      const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u));
      saveUsers(updatedUsers);
      setCurrentUser(updatedUser);
      addActivity('Google Sign-In', 'auth', `Signed in via Google OAuth (${cleanEmail}).`);
      return {
        success: true,
        message: `Welcome back, ${updatedUser.firstName}!`,
        data: updatedUser,
      };
    }

    // New Google OAuth User: automatically derive username and create verified account
    const baseUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    let finalUsername = baseUsername;
    let counter = 1;
    while (users.some((u) => u.username.toLowerCase() === finalUsername)) {
      finalUsername = `${baseUsername}_${counter++}`;
    }

    const newUser: User = {
      id: `usr_g_${Date.now()}`,
      firstName: googleProfile.firstName,
      lastName: googleProfile.lastName,
      username: finalUsername,
      email: cleanEmail,
      avatarUrl: googleProfile.avatarUrl || '/src/assets/images/user_profile_avatar_1791308904789.jpg',
      isEmailVerified: true,
      authProvider: 'google',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      bio: 'Authenticated via Google OAuth single sign-on.',
      twoFactorEnabled: false,
    };

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    setCurrentUser(newUser);

    addActivity('Google OAuth Registration', 'auth', `New account created via Google OAuth for @${newUser.username}.`);

    return {
      success: true,
      message: `Successfully connected with Google! Welcome, ${newUser.firstName}.`,
      data: newUser,
    };
  }

  /**
   * Request password reset code
   */
  static async requestPasswordReset(email: string): Promise<AuthResponse<{ otp: string }>> {
    const users = getStoredUsers();
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, message: 'No registered user found with that email address.' };
    }

    const otp = generateOTP();
    const sentEmailRecord: SentEmail = {
      id: `mail_pwd_${Date.now()}`,
      to: cleanEmail,
      subject: 'Password Reset Verification Code',
      otp,
      sentAt: new Date().toISOString(),
      type: 'password_reset',
    };
    addSentEmail(sentEmailRecord);
    addActivity('Password Reset Requested', 'security', `Reset code requested for ${cleanEmail}.`);

    return {
      success: true,
      message: `Password reset code sent to ${cleanEmail}`,
      data: { otp },
      otpForPreview: otp,
    };
  }

  /**
   * Reset password with OTP
   */
  static async resetPasswordWithOTP(email: string, otp: string, newPass: string): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const sent = getSentEmails().find((m) => m.to.toLowerCase() === cleanEmail && m.otp === otp.trim());

    if (!sent) {
      return { success: false, message: 'Invalid or expired reset code.' };
    }

    const users = getStoredUsers();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    saveUserPassword(cleanEmail, user.username, newPass);
    addActivity('Password Changed', 'security', `Password was updated for @${user.username}.`);

    return { success: true, message: 'Your password has been successfully reset. You can now log in.' };
  }

  /**
   * Update Profile Details
   */
  static updateUserProfile(updates: Partial<User>): User | null {
    const current = getStoredUsers();
    const active = current.find((u) => u.id === updates.id);
    if (!active) return null;

    const updated: User = { ...active, ...updates };
    const newList = current.map((u) => (u.id === active.id ? updated : u));
    saveUsers(newList);
    setCurrentUser(updated);
    addActivity('Profile Updated', 'profile', 'Personal account profile details were updated.');
    return updated;
  }

  /**
   * Logout user
   */
  static logout(): void {
    addActivity('User Logout', 'auth', 'Active session ended.');
    setCurrentUser(null);
  }
}
