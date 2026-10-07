import express, { type Request, type Response, type NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  readDb,
  writeDb,
  generateId,
  generate6DigitOtp,
  type DbUser,
  type DbHabit,
  type DbTask,
  type DbNote,
  type DbCalendarEvent,
  type DbBill,
  type DbNotification,
} from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // Dev server must run on port 3000
  const PORT = 3000;

  app.use(express.json());

  // Helper auth extractor
  const getAuthUser = (req: Request): DbUser | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    const db = readDb();
    const session = db.sessions.find((s) => s.token === token && s.expiresAt > Date.now());
    if (!session) return null;
    return db.users.find((u) => u.id === session.userId) || null;
  };

  // -------------------------------------------------------------
  // API Routes
  // -------------------------------------------------------------

  // Health
  app.get('/api/health', (_req: Request, res: Response) => {
    const db = readDb();
    res.json({
      status: 'ok',
      service: 'LifeHub Backend Core',
      database: 'Connected (Persistent JSON DB)',
      userCount: db.users.length,
      timestamp: new Date().toISOString(),
    });
  });

  // Check username availability
  app.get('/api/auth/check-username', (req: Request, res: Response) => {
    const username = (req.query.username as string || '').trim().toLowerCase();
    if (!username || username.length < 3) {
      return res.json({ available: false, message: 'Username must be at least 3 characters' });
    }
    const db = readDb();
    const exists = db.users.some((u) => u.username.toLowerCase() === username);
    res.json({
      available: !exists,
      message: exists ? 'Username already taken' : 'Username available',
    });
  });

  // 1. Register with firstName, lastName, username, email, password
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { firstName, lastName, username, email, password } = req.body;

    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    const db = readDb();

    // Check existing email
    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Check existing username
    if (db.users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return res.status(409).json({ success: false, message: 'Username is already in use.' });
    }

    // Generate 6-digit OTP
    const otp = generate6DigitOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save pending OTP in database
    db.pendingOtps = db.pendingOtps.filter((p) => p.email.toLowerCase() !== cleanEmail);
    db.pendingOtps.push({
      email: cleanEmail,
      otp,
      tempUser: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: cleanUsername,
        email: cleanEmail,
        passwordHash: password,
      },
      expiresAt,
      createdAt: new Date().toISOString(),
    });

    // Record sent email in database
    db.sentEmails.unshift({
      id: generateId('mail'),
      to: cleanEmail,
      subject: 'Verify your LifeHub account - 6-Digit Code',
      otp,
      sentAt: new Date().toISOString(),
    });

    writeDb(db);

    console.log(`[LifeHub DB] New pending registration for ${cleanEmail}. Verification OTP: ${otp}`);

    res.status(201).json({
      success: true,
      message: `Verification code sent to ${cleanEmail}`,
      email: cleanEmail,
      otpForPreview: otp,
    });
  });

  // 2. Verify OTP
  app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const db = readDb();
    const pending = db.pendingOtps.find((p) => p.email.toLowerCase() === cleanEmail);

    if (!pending) {
      return res.status(400).json({
        success: false,
        message: 'No pending registration found for this email. Please register again.',
      });
    }

    if (Date.now() > pending.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'The verification code has expired. Please request a new one.',
      });
    }

    if (pending.otp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect 6-digit code. Please verify and try again.',
      });
    }

    // Valid OTP! Create user in database
    const newUser: DbUser = {
      id: generateId('usr'),
      firstName: pending.tempUser.firstName,
      lastName: pending.tempUser.lastName,
      username: pending.tempUser.username,
      email: cleanEmail,
      passwordHash: pending.tempUser.passwordHash,
      isEmailVerified: true,
      authProvider: 'email',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      bio: 'LifeHub explorer organizing daily focus and life pillars.',
      twoFactorEnabled: false,
    };

    db.users.push(newUser);
    db.pendingOtps = db.pendingOtps.filter((p) => p.email.toLowerCase() !== cleanEmail);

    // Create session token
    const token = `lh_tok_${generateId('sess')}`;
    db.sessions.push({
      token,
      userId: newUser.id,
      createdAt: new Date().toISOString(),
      expiresAt: Date.now() + 30 * 86400000,
    });

    // Create default LifeHub habits for new user
    const defaultHabits: DbHabit[] = [
      {
        id: generateId('hbt'),
        userId: newUser.id,
        title: 'Morning Focus & Deep Work',
        pillar: 'Craft',
        streak: 1,
        completedToday: false,
        targetDays: 7,
      },
      {
        id: generateId('hbt'),
        userId: newUser.id,
        title: 'Daily Movement & Cardio',
        pillar: 'Health',
        streak: 1,
        completedToday: false,
        targetDays: 5,
      },
      {
        id: generateId('hbt'),
        userId: newUser.id,
        title: 'Mindful Reading (20 min)',
        pillar: 'Mind',
        streak: 1,
        completedToday: false,
        targetDays: 7,
      },
      {
        id: generateId('hbt'),
        userId: newUser.id,
        title: 'Weekly Wealth & Savings Check',
        pillar: 'Finance',
        streak: 1,
        completedToday: false,
        targetDays: 1,
      },
    ];

    db.habits.push(...defaultHabits);

    // Add activity log
    db.activities.unshift({
      id: generateId('act'),
      userId: newUser.id,
      action: 'Account Verified & Activated',
      timestamp: new Date().toISOString(),
      details: `Account @${newUser.username} registered with email OTP.`,
      type: 'auth',
    });

    writeDb(db);

    console.log(`[LifeHub DB] User ${newUser.username} successfully verified with OTP and saved to DB.`);

    const { passwordHash: _, ...safeUser } = newUser;
    res.json({
      success: true,
      message: 'Account verified successfully!',
      user: safeUser,
      token,
    });
  });

  // 3. Resend OTP
  app.post('/api/auth/resend-otp', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const cleanEmail = email.trim().toLowerCase();
    const db = readDb();
    const pending = db.pendingOtps.find((p) => p.email.toLowerCase() === cleanEmail);

    if (!pending) {
      return res.status(404).json({ success: false, message: 'No registration session found' });
    }

    const newOtp = generate6DigitOtp();
    pending.otp = newOtp;
    pending.expiresAt = Date.now() + 10 * 60 * 1000;

    db.sentEmails.unshift({
      id: generateId('mail'),
      to: cleanEmail,
      subject: 'Resent LifeHub Verification Code',
      otp: newOtp,
      sentAt: new Date().toISOString(),
    });

    writeDb(db);

    res.json({
      success: true,
      message: `New code sent to ${cleanEmail}`,
      otpForPreview: newOtp,
    });
  });

  // 4. Login with Username OR Email and Password
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Username/Email and password required.' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const db = readDb();

    const user = db.users.find(
      (u) => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found matching this username or email.',
      });
    }

    if (user.passwordHash && user.passwordHash !== password) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.',
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your email address is not verified yet. Please verify OTP first.',
        requiresVerification: true,
        email: user.email,
      });
    }

    // Update login timestamp
    user.lastLoginAt = new Date().toISOString();

    // Create session token
    const token = `lh_tok_${generateId('sess')}`;
    db.sessions.push({
      token,
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: Date.now() + 30 * 86400000,
    });

    db.activities.unshift({
      id: generateId('act'),
      userId: user.id,
      action: 'Signed In',
      timestamp: new Date().toISOString(),
      details: 'Standard credential login successful.',
      type: 'auth',
    });

    writeDb(db);

    const { passwordHash: _, ...safeUser } = user;
    res.json({
      success: true,
      message: `Welcome back, ${user.firstName}!`,
      user: safeUser,
      token,
    });
  });

  // 5. Google OAuth Service (1-Click instant login & registration)
  app.post('/api/auth/google', (req: Request, res: Response) => {
    const { email, firstName, lastName, avatarUrl } = req.body;

    if (!email || !firstName) {
      return res.status(400).json({ success: false, message: 'Google profile data is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = readDb();

    let user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (user) {
      // Existing user logging in with Google
      user.lastLoginAt = new Date().toISOString();
      if (avatarUrl && !user.avatarUrl) user.avatarUrl = avatarUrl;
      user.authProvider = user.authProvider === 'email' ? 'both' : user.authProvider;
    } else {
      // New user registering via Google OAuth
      const baseUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      let uniqueUsername = baseUsername;
      let counter = 1;
      while (db.users.some((u) => u.username.toLowerCase() === uniqueUsername)) {
        uniqueUsername = `${baseUsername}_${counter++}`;
      }

      user = {
        id: generateId('usr_g'),
        firstName: firstName.trim(),
        lastName: (lastName || '').trim(),
        username: uniqueUsername,
        email: cleanEmail,
        passwordHash: '',
        avatarUrl: avatarUrl || '/src/assets/images/user_profile_avatar_1791308904789.jpg',
        isEmailVerified: true,
        authProvider: 'google',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        bio: 'LifeHub member authenticated via Google OAuth.',
        twoFactorEnabled: false,
      };

      db.users.push(user);

      // Add default habits
      db.habits.push(
        {
          id: generateId('hbt'),
          userId: user.id,
          title: 'Morning Focus & Deep Work',
          pillar: 'Craft',
          streak: 1,
          completedToday: false,
          targetDays: 7,
        },
        {
          id: generateId('hbt'),
          userId: user.id,
          title: 'Daily Movement & Cardio',
          pillar: 'Health',
          streak: 1,
          completedToday: false,
          targetDays: 5,
        },
        {
          id: generateId('hbt'),
          userId: user.id,
          title: 'Mindful Reading (20 min)',
          pillar: 'Mind',
          streak: 1,
          completedToday: false,
          targetDays: 7,
        }
      );
    }

    const token = `lh_tok_${generateId('sess_g')}`;
    db.sessions.push({
      token,
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: Date.now() + 30 * 86400000,
    });

    db.activities.unshift({
      id: generateId('act'),
      userId: user.id,
      action: 'Google Single Sign-On',
      timestamp: new Date().toISOString(),
      details: `Signed in with verified Google account (${cleanEmail}).`,
      type: 'auth',
    });

    writeDb(db);

    const { passwordHash: _, ...safeUser } = user;
    res.json({
      success: true,
      message: `Signed in with Google as ${user.firstName}`,
      user: safeUser,
      token,
    });
  });

  // 6. Get Current User (Me)
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      // Fallback: check query parameter or return default
      return res.status(401).json({ success: false, message: 'Unauthorized session' });
    }
    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  });

  // 7. Get LifeHub Habits from DB
  app.get('/api/lifehub/habits', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const db = readDb();
    const userId = user ? user.id : 'usr_chaitanya_01';
    const habits = db.habits.filter((h) => h.userId === userId);
    res.json({ success: true, habits });
  });

  // 8. Add LifeHub Habit to DB
  app.post('/api/lifehub/habits', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const db = readDb();
    const userId = user ? user.id : 'usr_chaitanya_01';
    const { title, pillar, targetDays } = req.body;

    if (!title || !pillar) {
      return res.status(400).json({ success: false, message: 'Habit title and pillar are required' });
    }

    const newHabit: DbHabit = {
      id: generateId('hbt'),
      userId,
      title: title.trim(),
      pillar: pillar as 'Health' | 'Mind' | 'Craft' | 'Finance',
      streak: 1,
      completedToday: false,
      targetDays: Number(targetDays) || 5,
    };

    db.habits.push(newHabit);
    db.activities.unshift({
      id: generateId('act'),
      userId,
      action: 'Created Life Habit',
      timestamp: new Date().toISOString(),
      details: `Added "${newHabit.title}" under ${newHabit.pillar} pillar.`,
      type: 'habit',
    });

    writeDb(db);
    res.status(201).json({ success: true, habit: newHabit });
  });

  // 9. Toggle Habit Completion in DB
  app.post('/api/lifehub/habits/:id/toggle', (req: Request, res: Response) => {
    const db = readDb();
    const habitId = req.params.id;
    const habit = db.habits.find((h) => h.id === habitId);

    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    habit.completedToday = !habit.completedToday;
    if (habit.completedToday) {
      habit.streak += 1;
      habit.lastCompletedDate = new Date().toISOString().split('T')[0];
    } else {
      habit.streak = Math.max(0, habit.streak - 1);
    }

    db.activities.unshift({
      id: generateId('act'),
      userId: habit.userId,
      action: habit.completedToday ? 'Habit Completed' : 'Habit Unchecked',
      timestamp: new Date().toISOString(),
      details: `"${habit.title}" updated for today (Streak: ${habit.streak}d).`,
      type: 'habit',
    });

    writeDb(db);
    res.json({ success: true, habit });
  });

  // 10. Delete Habit from DB
  app.delete('/api/lifehub/habits/:id', (req: Request, res: Response) => {
    const db = readDb();
    const habitId = req.params.id;
    db.habits = db.habits.filter((h) => h.id !== habitId);
    writeDb(db);
    res.json({ success: true, message: 'Habit removed' });
  });

  // 11. Update Profile in DB
  app.put('/api/user/profile', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const db = readDb();
    const targetUserId = user ? user.id : req.body.id;
    const dbUser = db.users.find((u) => u.id === targetUserId);

    if (!dbUser) {
      return res.status(404).json({ success: false, message: 'User not found in database' });
    }

    const { firstName, lastName, username, bio, phone } = req.body;
    if (firstName) dbUser.firstName = firstName.trim();
    if (lastName) dbUser.lastName = lastName.trim();
    if (username) dbUser.username = username.trim().toLowerCase();
    if (bio !== undefined) dbUser.bio = bio;
    if (phone !== undefined) dbUser.phone = phone;

    db.activities.unshift({
      id: generateId('act'),
      userId: dbUser.id,
      action: 'Profile Updated',
      timestamp: new Date().toISOString(),
      details: 'Personal details modified in database.',
      type: 'profile',
    });

    writeDb(db);
    const { passwordHash: _, ...safeUser } = dbUser;
    res.json({ success: true, user: safeUser });
  });

  // 12. Update Password in DB
  app.put('/api/user/password', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const db = readDb();
    const targetUserId = user ? user.id : req.body.id;
    const dbUser = db.users.find((u) => u.id === targetUserId);

    if (!dbUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { currentPassword, newPassword } = req.body;
    if (dbUser.passwordHash && dbUser.passwordHash !== currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }

    dbUser.passwordHash = newPassword;
    db.activities.unshift({
      id: generateId('act'),
      userId: dbUser.id,
      action: 'Password Changed',
      timestamp: new Date().toISOString(),
      details: 'Security password was refreshed.',
      type: 'auth',
    });

    writeDb(db);
    res.json({ success: true, message: 'Password updated successfully' });
  });

  // 13. Get Activities from DB
  app.get('/api/lifehub/activity', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const db = readDb();
    const userId = user ? user.id : 'usr_chaitanya_01';
    const list = db.activities.filter((a) => a.userId === userId).slice(0, 20);
    res.json({ success: true, activities: list });
  });

  // 14. Get Sent Emails from DB (for testing/email preview)
  app.get('/api/lifehub/sent-emails', (_req: Request, res: Response) => {
    const db = readDb();
    res.json({ success: true, emails: db.sentEmails.slice(0, 10) });
  });

  // 15. Tasks API
  app.get('/api/lifehub/tasks', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const db = readDb();
    const userId = user ? user.id : 'usr_chaitanya_01';
    const tasks = db.tasks.filter((t) => t.userId === userId);
    res.json({ success: true, tasks });
  });

  app.post('/api/lifehub/tasks', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const db = readDb();
    const userId = user ? user.id : 'usr_chaitanya_01';
    const { title, priority, dueDate, category } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title required' });

    const newTask: DbTask = {
      id: generateId('tsk'),
      userId,
      title: title.trim(),
      status: 'pending',
      priority: priority || 'medium',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      category: category || 'General',
    };
    db.tasks.unshift(newTask);
    db.activities.unshift({
      id: generateId('act'),
      userId,
      action: 'Created Task',
      timestamp: new Date().toISOString(),
      details: `Added "${newTask.title}" (${newTask.priority} priority).`,
      type: 'profile',
    });
    writeDb(db);
    res.status(201).json({ success: true, task: newTask });
  });

  app.post('/api/lifehub/tasks/:id/toggle', (req: Request, res: Response) => {
    const db = readDb();
    const task = db.tasks.find((t) => t.id === req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.status = task.status === 'completed' ? 'pending' : 'completed';
    writeDb(db);
    res.json({ success: true, task });
  });

  app.delete('/api/lifehub/tasks/:id', (req: Request, res: Response) => {
    const db = readDb();
    db.tasks = db.tasks.filter((t) => t.id !== req.params.id);
    writeDb(db);
    res.json({ success: true, message: 'Task deleted' });
  });

  // 16. Notes API
  app.get('/api/lifehub/notes', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const db = readDb();
    const userId = user ? user.id : 'usr_chaitanya_01';
    const notes = db.notes.filter((n) => n.userId === userId);
    res.json({ success: true, notes });
  });

  app.post('/api/lifehub/notes', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const db = readDb();
    const userId = user ? user.id : 'usr_chaitanya_01';
    const { title, content, tag, color } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title required' });

    const newNote: DbNote = {
      id: generateId('not'),
      userId,
      title: title.trim(),
      content: content || '',
      tag: tag || 'General',
      updatedAt: new Date().toISOString(),
      color: color || 'emerald',
    };
    db.notes.unshift(newNote);
    writeDb(db);
    res.status(201).json({ success: true, note: newNote });
  });

  app.put('/api/lifehub/notes/:id', (req: Request, res: Response) => {
    const db = readDb();
    const note = db.notes.find((n) => n.id === req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    const { title, content, tag, color } = req.body;
    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content;
    if (tag !== undefined) note.tag = tag;
    if (color !== undefined) note.color = color;
    note.updatedAt = new Date().toISOString();

    writeDb(db);
    res.json({ success: true, note });
  });

  app.delete('/api/lifehub/notes/:id', (req: Request, res: Response) => {
    const db = readDb();
    db.notes = db.notes.filter((n) => n.id !== req.params.id);
    writeDb(db);
    res.json({ success: true, message: 'Note deleted' });
  });

  // 17. Calendar Events API
  app.get('/api/lifehub/calendar', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const db = readDb();
    const userId = user ? user.id : 'usr_chaitanya_01';
    const events = db.calendarEvents.filter((e) => e.userId === userId);
    res.json({ success: true, events });
  });

  app.post('/api/lifehub/calendar', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const db = readDb();
    const userId = user ? user.id : 'usr_chaitanya_01';
    const { title, date, time, category, location } = req.body;
    if (!title || !date) return res.status(400).json({ success: false, message: 'Title and date required' });

    const newEvent: DbCalendarEvent = {
      id: generateId('evt'),
      userId,
      title: title.trim(),
      date,
      time: time || '12:00',
      category: category || 'General',
      location: location || '',
    };
    db.calendarEvents.push(newEvent);
    writeDb(db);
    res.status(201).json({ success: true, event: newEvent });
  });

  app.delete('/api/lifehub/calendar/:id', (req: Request, res: Response) => {
    const db = readDb();
    db.calendarEvents = db.calendarEvents.filter((e) => e.id !== req.params.id);
    writeDb(db);
    res.json({ success: true, message: 'Event deleted' });
  });

  // 18. Bills API
  app.get('/api/lifehub/bills', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const db = readDb();
    const userId = user ? user.id : 'usr_chaitanya_01';
    const bills = db.bills.filter((b) => b.userId === userId);
    res.json({ success: true, bills });
  });

  app.post('/api/lifehub/bills', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const db = readDb();
    const userId = user ? user.id : 'usr_chaitanya_01';
    const { title, amount, dueDate, category, recurring } = req.body;
    if (!title || !amount) return res.status(400).json({ success: false, message: 'Title and amount required' });

    const newBill: DbBill = {
      id: generateId('bil'),
      userId,
      title: title.trim(),
      amount: Number(amount) || 0,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      status: 'pending',
      category: category || 'Utilities',
      recurring: recurring || 'Monthly',
    };
    db.bills.unshift(newBill);
    writeDb(db);
    res.status(201).json({ success: true, bill: newBill });
  });

  app.post('/api/lifehub/bills/:id/toggle-paid', (req: Request, res: Response) => {
    const db = readDb();
    const bill = db.bills.find((b) => b.id === req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    bill.status = bill.status === 'paid' ? 'pending' : 'paid';
    writeDb(db);
    res.json({ success: true, bill });
  });

  app.delete('/api/lifehub/bills/:id', (req: Request, res: Response) => {
    const db = readDb();
    db.bills = db.bills.filter((b) => b.id !== req.params.id);
    writeDb(db);
    res.json({ success: true, message: 'Bill deleted' });
  });

  // 19. Notifications API
  app.get('/api/lifehub/notifications', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const db = readDb();
    const userId = user ? user.id : 'usr_chaitanya_01';
    const notifications = db.notifications.filter((n) => n.userId === userId);
    res.json({ success: true, notifications });
  });

  app.post('/api/lifehub/notifications/:id/read', (req: Request, res: Response) => {
    const db = readDb();
    const notif = db.notifications.find((n) => n.id === req.params.id);
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });

    notif.read = true;
    writeDb(db);
    res.json({ success: true, notification: notif });
  });

  app.post('/api/lifehub/notifications/read-all', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const db = readDb();
    const userId = user ? user.id : 'usr_chaitanya_01';
    db.notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    writeDb(db);
    res.json({ success: true, message: 'All notifications marked as read' });
  });

  // 20. Executive Whole Summary API
  app.get('/api/lifehub/summary', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const db = readDb();
    const userId = user ? user.id : 'usr_chaitanya_01';

    const userTasks = db.tasks.filter((t) => t.userId === userId);
    const userNotes = db.notes.filter((n) => n.userId === userId);
    const userEvents = db.calendarEvents.filter((e) => e.userId === userId);
    const userBills = db.bills.filter((b) => b.userId === userId);
    const userNotifs = db.notifications.filter((n) => n.userId === userId);
    const userHabits = db.habits.filter((h) => h.userId === userId);

    const pendingTasks = userTasks.filter((t) => t.status === 'pending');
    const completedTasks = userTasks.filter((t) => t.status === 'completed');
    const pendingBills = userBills.filter((b) => b.status === 'pending');
    const billsTotalDue = pendingBills.reduce((acc, curr) => acc + curr.amount, 0);
    const unreadNotifications = userNotifs.filter((n) => !n.read);

    res.json({
      success: true,
      summary: {
        tasksCount: userTasks.length,
        pendingTasksCount: pendingTasks.length,
        completedTasksCount: completedTasks.length,
        notesCount: userNotes.length,
        eventsCount: userEvents.length,
        billsCount: userBills.length,
        pendingBillsCount: pendingBills.length,
        billsTotalDue,
        unreadNotificationsCount: unreadNotifications.length,
        habitsCount: userHabits.length,
        habitsCompletedToday: userHabits.filter((h) => h.completedToday).length,
      },
      recentTasks: userTasks.slice(0, 5),
      recentNotes: userNotes.slice(0, 4),
      upcomingEvents: userEvents.slice(0, 4),
      recentBills: userBills.slice(0, 4),
      recentNotifications: userNotifs.slice(0, 5),
    });
  });

  // 17. Submit Contact Form Message
  app.post('/api/contact', (req: Request, res: Response) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Person name, email, and message are required.',
      });
    }

    const db = readDb();
    if (!db.contactMessages) {
      db.contactMessages = [];
    }

    const newContactMessage = {
      id: generateId('msg'),
      name: String(name).trim(),
      email: String(email).trim(),
      message: String(message).trim(),
      createdAt: new Date().toISOString(),
    };

    db.contactMessages.push(newContactMessage);
    writeDb(db);

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received.',
      contactMessage: newContactMessage,
    });
  });

  // -------------------------------------------------------------
  // Vite Integration (Dev) vs Static (Prod)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[LifeHub] Server started on http://0.0.0.0:${PORT}`);
  });
}

startServer();
