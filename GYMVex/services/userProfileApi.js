// ═══════════════════════════════════════════════════════════════════════
// userProfileApi.js — Profile, Authentication & Persistent Storage Service (GYMVex)
// ═══════════════════════════════════════════════════════════════════════
// Handles user authentication, profile synchronization, unit preferences,
// gender-aware default avatar selection, and fail-safe persistent storage across Mobile and Web.
// ═══════════════════════════════════════════════════════════════════════

import safeStorage from './storage.js';
import { API_BASE_URL } from './config.js';
import { clearAllWorkoutPlanData } from './workoutPlanApi.js';
import { clearLocalFitnessTrackingState } from './fitnessTrackingApi.js';

const STORAGE_KEYS = {
  REGISTERED_USERS: '@gymvex_registered_users',
  USER_SESSION: '@gymvex_user_session',
  USER_PROFILE: '@gymvex_user_profile',
};

// ─── High Quality Curated Athletic Avatars (Men & Women) ─────────────
export const ATHLETIC_AVATARS = {
  MEN: [
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400', // Athletic Man
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400', // Fit Man
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400', // Sporty Man
    'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=400', // Casual Man
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=400', // Active Man
  ],
  WOMEN: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400', // Athletic Woman
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400', // Fit Woman
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400', // Sporty Woman
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400', // Active Woman
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400', // Energetic Woman
  ],
};

const FEMALE_NAMES_SET = new Set([
  'emma', 'olivia', 'ava', 'isabella', 'sophia', 'mia', 'charlotte', 'amelia', 'harper', 'evelyn',
  'abigail', 'emily', 'ella', 'elizabeth', 'camila', 'luna', 'sofia', 'avery', 'mila', 'aria',
  'scarlett', 'penelope', 'layla', 'chloe', 'victoria', 'madison', 'eleanor', 'grace', 'nora', 'riley',
  'zoey', 'hannah', 'hazel', 'lily', 'ellie', 'violet', 'lillian', 'zoe', 'stella', 'aurora',
  'natalie', 'emilia', 'everly', 'leah', 'aubrey', 'willow', 'addison', 'lucy', 'audrey', 'bella',
  'claire', 'skylar', 'isla', 'genesis', 'naomi', 'elena', 'sarah', 'priya', 'pooja', 'neha',
  'ananya', 'sneha', 'shreya', 'divya', 'kavya', 'rita', 'maria', 'anna', 'laura', 'jessica',
  'ashley', 'karen', 'nancy', 'lisa', 'betty', 'margaret', 'sandra', 'kimberly', 'donna', 'michelle',
  'carol', 'amanda', 'melissa', 'deborah', 'stephanie', 'rebecca', 'sharon', 'cynthia', 'kathleen', 'amy',
  'shirley', 'angela', 'helen', 'brenda', 'pamela', 'nicole', 'samantha', 'katherine', 'christine', 'debra',
  'rachel', 'carolyn', 'janet', 'catherine', 'heather', 'diane', 'ruth', 'julie', 'joyce', 'virginia',
  'kelly', 'lauren', 'christina', 'joan', 'judith', 'megan', 'andrea', 'cheryl', 'jacqueline', 'martha',
  'gloria', 'teresa', 'ann', 'sara', 'frances', 'kathryn', 'janice', 'jean', 'alice', 'julia',
  'judy', 'denise', 'amber', 'doris', 'marilyn', 'danielle', 'beverly', 'theresa', 'diana', 'brittany',
  'marie', 'kayla', 'alexis', 'lori', 'tina', 'tiffany', 'priyanka', 'deepika', 'katrina', 'alia',
  'shraddha', 'kareena', 'rashmika', 'kriti', 'kiara', 'disha', 'janhvi', 'anushka', 'radhika', 'taapsee',
  'sonam', 'sonakshi', 'parineeti', 'iliana', 'yami', 'tamannaah', 'nayanthara', 'keerthy', 'trisha', 'kajal',
  'anupama', 'hansika', 'raashi', 'shruti', 'genelia', 'aishwarya', 'madhuri', 'juhi', 'rani', 'preity',
  'bipasha', 'vidya', 'sushmita', 'lara', 'dia', 'mallika', 'kangna', 'tabu', 'urvashi', 'mrunal',
  'nushrratt', 'bhumi', 'huma', 'richa', 'swara', 'fatima', 'sanya', 'palak', 'suhana', 'khushi',
  'shanaya', 'tara', 'rhea', 'alessia', 'giulia', 'chiara', 'francesca', 'federica', 'martina', 'valentina',
  'silvia', 'elisa', 'camilla', 'giorgia', 'ilaria', 'beatrice', 'eleonora', 'roberta', 'woman', 'female', 'girl'
]);

/**
 * Automatically picks a matching high-quality male or female athletic avatar based on name.
 */
export const getDefaultAvatarForName = (name) => {
  if (!name || typeof name !== 'string') return ATHLETIC_AVATARS.MEN[0];
  
  const firstName = name.trim().toLowerCase().split(/\s+/)[0];
  
  if (FEMALE_NAMES_SET.has(firstName)) {
    return ATHLETIC_AVATARS.WOMEN[0];
  }
  
  // Specific feminine name patterns
  if (firstName.endsWith('a') && !['bhavya', 'joshua', 'luca', 'ezra', 'eliah', 'dakota', 'shiva', 'krishna', 'mustafa'].includes(firstName)) {
    return ATHLETIC_AVATARS.WOMEN[1];
  }
  if (firstName.endsWith('ya') && !['bhavya', 'shaurya', 'aditya', 'surya', 'dhairya', 'sourya'].includes(firstName)) {
    return ATHLETIC_AVATARS.WOMEN[2];
  }
  if (firstName.endsWith('i') && !['ravi', 'ali', 'eli', 'hari', 'rishi', 'mani', 'kavi', 'dmitri', 'yuri'].includes(firstName)) {
    return ATHLETIC_AVATARS.WOMEN[3];
  }

  // Default athletic man portrait
  return ATHLETIC_AVATARS.MEN[0];
};

// Default profile values
const DEFAULT_PROFILE = {
  profileImage: ATHLETIC_AVATARS.MEN[0],
  name: 'Athlete',
  email: '',
  height: 175,
  heightUnit: 'cm',
  weight: 75.0,
  targetWeight: 70.0,
  weightUnit: 'kg',
  fitnessGoal: 'Weight Loss',
  activityLevel: 'Moderately Active',
  experience: 'Beginner',
  theme: 'light',
  restTimerSeconds: 60,
  soundEnabled: true,
};

let localProfileData = { ...DEFAULT_PROFILE };

// ═══════════════════════════════════════════════════════════════════════
// STORAGE HELPERS (Persistent across app restarts)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Retrieves all registered accounts from persistent device storage.
 */
export const getStoredRegisteredAccounts = async () => {
  try {
    const jsonValue = await safeStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (e) {
    return {};
  }
};

/**
 * Saves registered accounts dictionary to persistent storage.
 */
const saveStoredRegisteredAccounts = async (accountsObj) => {
  try {
    await safeStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(accountsObj));
  } catch (e) {
    console.warn('Error saving registered accounts to storage', e);
  }
};

/**
 * Gets currently active logged-in user session.
 */
export const getCurrentUserSession = async () => {
  try {
    const jsonValue = await safeStorage.getItem(STORAGE_KEYS.USER_SESSION);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    return null;
  }
};

/**
 * Saves current active user session.
 */
export const setCurrentUserSession = async (sessionData) => {
  try {
    await safeStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(sessionData));
  } catch (e) {
    console.warn('Error saving user session to storage', e);
  }
};

/**
 * Clears active user session (Log Out).
 */
export const clearUserSession = async () => {
  try {
    await safeStorage.removeItem(STORAGE_KEYS.USER_SESSION);
  } catch (e) {
    console.warn('Error clearing user session', e);
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 1. GET PROFILE (GET /api/profile)
// ═══════════════════════════════════════════════════════════════════════
export const getUserProfileData = async () => {
  try {
    const session = await getCurrentUserSession();
    if (session) {
      if (session.name) localProfileData.name = session.name;
      if (session.email) localProfileData.email = session.email;
      if (session.profileImage) localProfileData.profileImage = session.profileImage;
    }

    const userIdQuery = session?.userId ? `?userId=${session.userId}` : '';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_BASE_URL}/profile${userIdQuery}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (data.success && data.data) {
      const resolvedName = session?.name || data.data.name || localProfileData.name || 'Athlete';
      const resolvedEmail = session?.email || data.data.email || localProfileData.email || '';
      const resolvedAvatar = data.data.profileImage || session?.profileImage || localProfileData.profileImage;

      localProfileData = {
        ...localProfileData,
        ...data.data,
        name: resolvedName,
        email: resolvedEmail,
        profileImage: resolvedAvatar,
      };
      await safeStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(localProfileData));
      return localProfileData;
    }
  } catch (error) {
    // API offline, fallback to safeStorage cache
    try {
      const cached = await safeStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (cached) {
        const parsed = JSON.parse(cached);
        localProfileData = { ...localProfileData, ...parsed };
      }
    } catch (e) {}
  }

  return localProfileData;
};

// ═══════════════════════════════════════════════════════════════════════
// 2. UPDATE PROFILE (POST /api/profile)
// ═══════════════════════════════════════════════════════════════════════
export const updateUserProfileData = async (updatedFields) => {
  try {
    const session = await getCurrentUserSession();
    const userId = session?.userId || localProfileData?.userId;
    const oldEmail = session?.email?.trim().toLowerCase();

    const payload = {
      ...(userId ? { userId } : {}),
      ...(oldEmail ? { currentEmail: oldEmail } : {}),
      ...updatedFields,
    };

    const newEmail = updatedFields.email ? updatedFields.email.trim().toLowerCase() : oldEmail;
    const newName = updatedFields.name ? updatedFields.name.trim() : (session?.name || localProfileData.name);

    // Update active session
    if (session) {
      await setCurrentUserSession({
        ...session,
        ...(newName ? { name: newName } : {}),
        ...(newEmail ? { email: newEmail } : {}),
        ...(updatedFields.profileImage ? { profileImage: updatedFields.profileImage } : {}),
      });
    }

    // If email changed, update key in stored registered accounts dictionary
    if (oldEmail && newEmail && oldEmail !== newEmail) {
      try {
        const accounts = await getStoredRegisteredAccounts();
        if (accounts[oldEmail]) {
          accounts[newEmail] = { ...accounts[oldEmail], email: newEmail, name: newName };
          delete accounts[oldEmail];
          await saveStoredRegisteredAccounts(accounts);
        }
      } catch (accErr) {}
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (data.success && data.data) {
      localProfileData = { ...localProfileData, ...data.data, ...updatedFields };
      await safeStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(localProfileData));
      return localProfileData;
    }
  } catch (error) {
    // Graceful offline fallback
  }

  localProfileData = { ...localProfileData, ...updatedFields };
  try {
    await safeStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(localProfileData));
  } catch (e) {}

  return localProfileData;
};

// ═══════════════════════════════════════════════════════════════════════
// 3. REGISTER USER (POST /api/auth/register)
// ═══════════════════════════════════════════════════════════════════════
export const registerUserApi = async (name, email, password) => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = (name || 'Athlete').trim();
  const cleanPassword = password.trim();
  const defaultAvatar = getDefaultAvatarForName(cleanName);

  // 1. First, attempt to register in MongoDB Backend
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        profileImage: defaultAvatar,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();

    if (data.success && data.data) {
      const assignedUserId = data.data.userId || `user_${Date.now()}`;
      const newAccount = {
        userId: assignedUserId,
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        profileImage: defaultAvatar,
        isFirstLogin: true,
        loginCount: 1,
        createdAt: new Date().toISOString(),
      };

      // Save to local storage cache
      const accounts = await getStoredRegisteredAccounts();
      accounts[cleanEmail] = newAccount;
      await saveStoredRegisteredAccounts(accounts);

      // Immediately establish current active user session with user's name & email
      await setCurrentUserSession({
        userId: assignedUserId,
        name: cleanName,
        email: cleanEmail,
        profileImage: defaultAvatar,
        isLoggedIn: true,
        isFirstLogin: true,
        loginCount: 1,
        loginTime: new Date().toISOString(),
      });

      localProfileData = {
        ...localProfileData,
        ...data.data,
        name: cleanName,
        email: cleanEmail,
        profileImage: defaultAvatar,
        isFirstLogin: true,
        loginCount: 1,
      };
      await safeStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(localProfileData));

      return {
        success: true,
        message: data.message || 'Account created successfully in MongoDB!',
        data: newAccount,
      };
    } else {
      // Backend returned error (e.g. email already exists)
      return {
        success: false,
        message: data.message || 'Registration failed.',
      };
    }
  } catch (error) {
    // Backend API unreachable or offline, falling back to local storage
  }

  // 2. Offline Fallback: Local persistent storage
  const accounts = await getStoredRegisteredAccounts();
  if (accounts[cleanEmail]) {
    return {
      success: false,
      message: 'An account with this email already exists. Please sign in instead.',
    };
  }

  const newAccount = {
    userId: `user_${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    password: cleanPassword,
    profileImage: defaultAvatar,
    isFirstLogin: true,
    loginCount: 1,
    createdAt: new Date().toISOString(),
  };

  accounts[cleanEmail] = newAccount;
  await saveStoredRegisteredAccounts(accounts);

  // Immediately establish current active user session with user's name & email
  await setCurrentUserSession({
    userId: newAccount.userId,
    name: cleanName,
    email: cleanEmail,
    profileImage: defaultAvatar,
    isLoggedIn: true,
    isFirstLogin: true,
    loginCount: 1,
    loginTime: new Date().toISOString(),
  });

  localProfileData = {
    ...localProfileData,
    name: cleanName,
    email: cleanEmail,
    profileImage: defaultAvatar,
    isFirstLogin: true,
    loginCount: 1,
  };
  await safeStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(localProfileData));

  return {
    success: true,
    message: 'Account created successfully (Local Storage)!',
    data: newAccount,
  };
};

// ═══════════════════════════════════════════════════════════════════════
// 4. LOGIN USER (POST /api/auth/login)
// ═══════════════════════════════════════════════════════════════════════
export const loginUserApi = async (email, password) => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  // 1. Try Backend MongoDB login first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (data.success && data.data) {
      const userData = data.data;
      const avatarToUse = userData.profileImage || getDefaultAvatarForName(userData.name);
      const isFirstLogin = userData.isFirstLogin !== undefined ? userData.isFirstLogin : (!userData.loginCount || userData.loginCount <= 1);

      // Update in-memory profile
      localProfileData = {
        ...localProfileData,
        ...userData,
        profileImage: avatarToUse,
        isFirstLogin: isFirstLogin,
        loginCount: userData.loginCount || 2,
      };

      // Cache account in persistent storage
      const accounts = await getStoredRegisteredAccounts();
      accounts[cleanEmail] = {
        userId: userData.userId,
        name: userData.name,
        email: cleanEmail,
        password: cleanPassword,
        profileImage: avatarToUse,
        loginCount: userData.loginCount || 2,
        isFirstLogin: false,
      };
      await saveStoredRegisteredAccounts(accounts);

      // Save active logged-in session with name and avatar
      await setCurrentUserSession({
        userId: userData.userId,
        name: userData.name,
        email: cleanEmail,
        profileImage: avatarToUse,
        isLoggedIn: true,
        isFirstLogin: isFirstLogin,
        loginCount: userData.loginCount || 2,
        loginTime: new Date().toISOString(),
      });

      await safeStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(localProfileData));

      return { success: true, message: data.message, data: userData };
    } else if (response.status === 401 || response.status === 404 || (data && !data.success)) {
      return { success: false, message: data.message || 'Login failed' };
    }
  } catch (error) {
    // Backend API offline or unreachable during login, checking local storage
  }

  // 2. Validate against Persistent Local Storage
  const accounts = await getStoredRegisteredAccounts();
  const existingAccount = accounts[cleanEmail];

  if (!existingAccount) {
    return {
      success: false,
      message: 'Account not found. Please create an account first.',
    };
  }

  if (existingAccount.password !== cleanPassword) {
    return {
      success: false,
      message: 'Incorrect password. Please try again.',
    };
  }

  const assignedName = existingAccount.name || 'Athlete';
  const assignedAvatar = existingAccount.profileImage || getDefaultAvatarForName(assignedName);
  const isFirstLogin = !existingAccount.loginCount || existingAccount.loginCount <= 1;
  const newLoginCount = (existingAccount.loginCount || 1) + 1;

  existingAccount.loginCount = newLoginCount;
  existingAccount.isFirstLogin = false;
  await saveStoredRegisteredAccounts(accounts);

  // Valid credentials: save active session with name & avatar
  const sessionData = {
    userId: existingAccount.userId || `user_${Date.now()}`,
    name: assignedName,
    email: cleanEmail,
    profileImage: assignedAvatar,
    isLoggedIn: true,
    isFirstLogin: isFirstLogin,
    loginCount: newLoginCount,
    loginTime: new Date().toISOString(),
  };

  await setCurrentUserSession(sessionData);

  localProfileData = {
    ...localProfileData,
    name: assignedName,
    email: cleanEmail,
    profileImage: assignedAvatar,
    isFirstLogin: isFirstLogin,
    loginCount: newLoginCount,
  };
  await safeStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(localProfileData));

  return {
    success: true,
    message: 'Signed in successfully!',
    data: sessionData,
  };
};

// ═══════════════════════════════════════════════════════════════════════
// 5. LOGOUT USER
// ═══════════════════════════════════════════════════════════════════════
export const logoutUserApi = async () => {
  await clearUserSession();
  try {
    await safeStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localProfileData = { ...DEFAULT_PROFILE };
    await clearAllWorkoutPlanData();
    clearLocalFitnessTrackingState();
  } catch (e) {}
  return { success: true, message: 'Logged out successfully' };
};

// ═══════════════════════════════════════════════════════════════════════
// 6. DELETE ACCOUNT (DELETE /api/profile/account)
// ═══════════════════════════════════════════════════════════════════════
export const deleteUserAccountApi = async () => {
  try {
    const session = await getCurrentUserSession();
    let cleanEmail = session?.email?.trim().toLowerCase();
    let userId = session?.userId;

    // Check cached profile if session was missing any ID
    if (!cleanEmail || !userId) {
      try {
        const cached = await safeStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (!cleanEmail && parsed.email) cleanEmail = parsed.email.trim().toLowerCase();
          if (!userId && parsed.userId) userId = parsed.userId;
        }
      } catch (e) {}
    }

    if (!cleanEmail && localProfileData.email) {
      cleanEmail = localProfileData.email.trim().toLowerCase();
    }
    if (!userId && localProfileData.userId) {
      userId = localProfileData.userId;
    }

    let backendResult = null;

    // Call backend MongoDB to delete account, userProfile & all associated collections
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (cleanEmail) params.append('email', cleanEmail);

      const response = await fetch(`${API_BASE_URL}/profile/account?${params.toString()}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email: cleanEmail }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      backendResult = await response.json();
    } catch (apiErr) {
      // Backend delete error fallback
    }

    // Remove from local persistent accounts
    if (cleanEmail) {
      const accounts = await getStoredRegisteredAccounts();
      delete accounts[cleanEmail];
      await saveStoredRegisteredAccounts(accounts);
    }

    // Clear active session
    await clearUserSession();

    // Reset local profile
    localProfileData = { ...DEFAULT_PROFILE };
    await safeStorage.removeItem(STORAGE_KEYS.USER_PROFILE);

    // Reset local workout plan & fitness tracking
    await clearAllWorkoutPlanData();
    clearLocalFitnessTrackingState();

    return backendResult || { success: true, message: 'Account deleted successfully' };
  } catch (error) {
    console.error('Error in deleteUserAccountApi:', error);
    return { success: false, message: error.message || 'Failed to delete account' };
  }
};

/**
 * Marks that the first login experience has been shown so subsequent visits show "Welcome Back".
 */
export const markFirstLoginCompleted = async () => {
  try {
    const session = await getCurrentUserSession();
    if (session && session.isFirstLogin) {
      const updated = { ...session, isFirstLogin: false, loginCount: Math.max(session.loginCount || 1, 2) };
      await setCurrentUserSession(updated);
    }
    if (localProfileData) {
      localProfileData.isFirstLogin = false;
      localProfileData.loginCount = Math.max(localProfileData.loginCount || 1, 2);
      await safeStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(localProfileData));
    }
  } catch (e) {
    console.warn('Error marking first login completed:', e);
  }
};

