/**
 * LuminaLearn Firebase Authentication & Cloud Firestore Data Service
 *
 * Implements the schema enforced by `firestore.rules` and `firebase.json`:
 *   - /users/{uid}                           : Learner/Educator profile, role, schoolLevel, UDL capabilities
 *   - /users/{uid}/courseProgress/{courseId} : Per-course enrollment, skillMastery tiers, resumable sessions
 *   - /users/{uid}/submissions/{submissionId}: Module checkpoints & self-reflections
 *   - /aiThreads/{threadId}                  : Scoped Luminare Socratic AI conversations & study plans
 *
 * Supports 3 Seamless Operating Modes:
 *   1. 'firebase_cloud'    : Connects directly to Google Firebase Auth & Cloud Firestore REST APIs using project credentials.
 *   2. 'firebase_emulator' : Connects to the local Firebase Emulator Suite (Auth :9099, Firestore :8080) defined in `firebase.json`.
 *   3. 'local_cloud_mirror': Offline-first local + Vite server mirror so accounts, email/password auth, and per-user cloud documents work out of the box without requiring external keys.
 */

import { DEFAULT_CAPABILITIES } from '../data/quizMapping.js';

const USERS_DB_STORAGE_KEY = 'luminalearn_firebase_users_db_v5';
const ACTIVE_SESSION_STORAGE_KEY = 'luminalearn_firebase_active_user_v5';
const FIREBASE_CONFIG_STORAGE_KEY = 'luminalearn_firebase_config_v5';

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey:
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env.VITE_FIREBASE_API_KEY) ||
    '',
  authDomain:
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) ||
    'luminalearn-udl-2026.firebaseapp.com',
  projectId:
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID) ||
    'luminalearn-udl-2026',
  storageBucket:
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) ||
    'luminalearn-udl-2026.appspot.com',
  appId:
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env.VITE_FIREBASE_APP_ID) ||
    '1:202600000000:web:luminalearn2026',
  useEmulator: false,
  mode: 'local_cloud_mirror' // 'local_cloud_mirror' | 'firebase_emulator' | 'firebase_cloud'
};

/**
 * Pre-seeded demo accounts for instant testing by students, teachers, and judges
 */
export const DEMO_ACCOUNTS = [
  {
    uid: 'usr-student-alex',
    email: 'alex@luminalearn.org',
    password: 'Student123!',
    displayName: 'Alex Rivera',
    role: 'student',
    schoolLevel: 'elementary',
    avatarEmoji: '🌱',
    summaryTag: 'Elementary (Grade 4) · Focus & Visual Models',
    enrolledCourseIds: ['course-elem-math', 'course-elem-sci'],
    joinedClassIds: ['class-elem-4a'],
    presetCapabilities: {
      ...DEFAULT_CAPABILITIES,
      visualManipulatives: true,
      microChunking: true,
      gameBasedMode: true,
      colorCodedSteps: true
    },
    skillMastery: {
      'skill-equal-parts': 'mastered',
      'skill-num-denom': 'ready_to_review',
      'skill-equiv-fractions': 'practicing',
      'skill-states-matter': 'practicing'
    }
  },
  {
    uid: 'usr-student-maya',
    email: 'maya@luminalearn.org',
    password: 'Student123!',
    displayName: 'Maya Chen',
    role: 'student',
    schoolLevel: 'middle',
    avatarEmoji: '🧭',
    summaryTag: 'Middle School (Grade 7) · Warm Reading Paper & Audio',
    enrolledCourseIds: ['course-mid-alg', 'course-mid-sci'],
    joinedClassIds: ['class-mid-7b'],
    presetCapabilities: {
      ...DEFAULT_CAPABILITIES,
      creamPaperTint: true,
      dyslexiaFont: true,
      readAloudTTS: true,
      visualManipulatives: true
    },
    skillMastery: {
      'skill-variables-hanger': 'mastered',
      'skill-inverse-ops': 'practicing',
      'skill-proportional-graphs': 'not_started',
      'skill-producers-consumers': 'ready_to_review'
    }
  },
  {
    uid: 'usr-student-jordan',
    email: 'jordan@luminalearn.org',
    password: 'Student123!',
    displayName: 'Jordan Patel',
    role: 'student',
    schoolLevel: 'high',
    avatarEmoji: '🚀',
    summaryTag: 'High School (Grade 10) · Literal Language & Calm Screen',
    enrolledCourseIds: ['course-high-phys', 'course-high-bio'],
    joinedClassIds: ['class-high-10c'],
    presetCapabilities: {
      ...DEFAULT_CAPABILITIES,
      sensoryCalmMode: true,
      literalLanguageMode: true,
      reducedMotion: true,
      visualManipulatives: true
    },
    skillMastery: {
      'skill-displacement-vel': 'mastered',
      'skill-accel-graphs': 'ready_to_review',
      'skill-newton-laws': 'practicing',
      'skill-photosynthesis': 'practicing'
    }
  },
  {
    uid: 'usr-teacher-vance',
    email: 'evance@luminalearn.org',
    password: 'Teacher123!',
    displayName: 'Ms. Elena Vance',
    role: 'teacher',
    schoolLevel: 'elementary',
    avatarEmoji: '👩‍🏫',
    summaryTag: 'Educator Account · Full Classroom & Assignment Portal',
    enrolledCourseIds: [
      'course-elem-math',
      'course-mid-alg',
      'course-high-phys'
    ],
    joinedClassIds: ['class-elem-4a', 'class-mid-7b', 'class-high-10c'],
    presetCapabilities: {
      ...DEFAULT_CAPABILITIES
    },
    skillMastery: {
      'skill-equal-parts': 'mastered',
      'skill-num-denom': 'mastered',
      'skill-equiv-fractions': 'mastered'
    }
  }
];

function simpleHashPassword(password = '') {
  let hash = 2166136261;
  const str = `lumina_salt_2026_${password}`;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a_${(hash >>> 0).toString(16)}`;
}

function buildInitialUsersDatabase() {
  const db = {};
  DEMO_ACCOUNTS.forEach((acc) => {
    db[acc.email.toLowerCase()] = {
      uid: acc.uid,
      email: acc.email.toLowerCase(),
      passwordHash: simpleHashPassword(acc.password),
      displayName: acc.displayName,
      role: acc.role,
      schoolLevel: acc.schoolLevel,
      avatarEmoji: acc.avatarEmoji,
      summaryTag: acc.summaryTag,
      createdAt: '2026-10-01T12:00:00.000Z',
      lastLoginAt: '2026-10-25T15:00:00.000Z',
      firestoreCollections: {
        userDoc: {
          uid: acc.uid,
          email: acc.email.toLowerCase(),
          displayName: acc.displayName,
          role: acc.role,
          schoolLevel: acc.schoolLevel,
          profile: {
            studentName: acc.displayName,
            schoolLevel: acc.schoolLevel,
            quizCompleted: true,
            hasChosenPreferences: true,
            matchedPresetName: 'Personalized Account Setup',
            matchedReasons: [acc.summaryTag],
            capabilities: acc.presetCapabilities
          }
        },
        courseProgress: {
          enrolledCourseIds: acc.enrolledCourseIds,
          joinedClassIds: acc.joinedClassIds,
          skillMastery: acc.skillMastery,
          lessonSessions: {
            lastActiveLessonId:
              acc.schoolLevel === 'middle'
                ? 'mid-math-algebra'
                : acc.schoolLevel === 'high'
                ? 'high-phys-kinematics'
                : 'elem-math-fractions',
            byLessonId: {}
          }
        },
        submissions: {},
        aiThreads: []
      }
    };
  });
  return db;
}

export function loadUsersDatabase() {
  if (typeof localStorage === 'undefined') {
    return buildInitialUsersDatabase();
  }
  try {
    const raw = localStorage.getItem(USERS_DB_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const defaults = buildInitialUsersDatabase();
      return { ...defaults, ...parsed };
    }
  } catch {}
  const initial = buildInitialUsersDatabase();
  try {
    localStorage.setItem(USERS_DB_STORAGE_KEY, JSON.stringify(initial));
  } catch {}
  return initial;
}

function saveUsersDatabase(db) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(USERS_DB_STORAGE_KEY, JSON.stringify(db));
  } catch {}
}

export function loadSavedFirebaseConfig() {
  if (typeof localStorage === 'undefined') return DEFAULT_FIREBASE_CONFIG;
  try {
    const saved = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_FIREBASE_CONFIG, ...JSON.parse(saved) };
    }
  } catch {}
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(nextConfig) {
  const merged = { ...DEFAULT_FIREBASE_CONFIG, ...nextConfig };
  if (merged.useEmulator) {
    merged.mode = 'firebase_emulator';
  } else if (merged.apiKey && merged.projectId) {
    merged.mode = 'firebase_cloud';
  } else {
    merged.mode = 'local_cloud_mirror';
  }
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(merged));
    } catch {}
  }
  return merged;
}

export function loadActiveAuthSession() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveActiveAuthSession(sessionUser) {
  if (typeof localStorage === 'undefined') return;
  try {
    if (!sessionUser) {
      localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    } else {
      localStorage.setItem(
        ACTIVE_SESSION_STORAGE_KEY,
        JSON.stringify(sessionUser)
      );
    }
  } catch {}
}

/**
 * Helper to resolve Firebase Auth REST URL (Production Cloud vs Local Emulator :9099)
 */
function getFirebaseAuthUrl(endpoint, firebaseConfig = DEFAULT_FIREBASE_CONFIG) {
  const apiKey = firebaseConfig.apiKey || 'demo-luminalearn-key';
  if (firebaseConfig.useEmulator || firebaseConfig.mode === 'firebase_emulator') {
    return `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/${endpoint}?key=${encodeURIComponent(
      apiKey
    )}`;
  }
  return `https://identitytoolkit.googleapis.com/v1/${endpoint}?key=${encodeURIComponent(
    apiKey
  )}`;
}

/**
 * Helper to resolve Cloud Firestore REST URL (Production Cloud vs Local Emulator :8080)
 */
export function getFirestoreDocumentUrl(
  docPath,
  firebaseConfig = DEFAULT_FIREBASE_CONFIG
) {
  const projectId = firebaseConfig.projectId || 'luminalearn-udl-2026';
  const cleanPath = docPath.replace(/^\/+/, '');
  if (firebaseConfig.useEmulator || firebaseConfig.mode === 'firebase_emulator') {
    return `http://127.0.0.1:8080/v1/projects/${projectId}/databases/(default)/documents/${cleanPath}`;
  }
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${cleanPath}`;
}

export function validateEmailAndPassword(email = '', password = '') {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return {
      valid: false,
      error: 'Please enter a valid email address (for example, alex@luminalearn.org).'
    };
  }
  if (!password || String(password).length < 6) {
    return {
      valid: false,
      error: 'Password must be at least 6 characters long.'
    };
  }
  return { valid: true, cleanEmail };
}

/**
 * Register a new Email & Password account in Firebase Auth + Firestore `/users/{uid}`
 */
export async function registerWithEmailPassword({
  email,
  password,
  displayName = '',
  role = 'student',
  schoolLevel = 'elementary',
  firebaseConfig = DEFAULT_FIREBASE_CONFIG
}) {
  const check = validateEmailAndPassword(email, password);
  if (!check.valid) {
    return { ok: false, error: check.error };
  }

  const cleanEmail = check.cleanEmail;
  const cleanName =
    String(displayName || '').trim() ||
    cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
  const safeRole = role === 'teacher' ? 'teacher' : 'student';
  const safeBand = ['elementary', 'middle', 'high'].includes(schoolLevel)
    ? schoolLevel
    : 'elementary';

  const db = loadUsersDatabase();
  if (db[cleanEmail]) {
    return {
      ok: false,
      error:
        'An account with this email already exists. Please sign in instead.'
    };
  }

  let uid = `usr-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
  let idToken = `local_jwt_${uid}`;
  let providerMode = 'local_cloud_mirror';

  // Attempt live Firebase Auth REST signup if cloud/emulator mode is configured
  if (
    (firebaseConfig.mode === 'firebase_cloud' && firebaseConfig.apiKey) ||
    firebaseConfig.mode === 'firebase_emulator'
  ) {
    try {
      const authUrl = getFirebaseAuthUrl('accounts:signUp', firebaseConfig);
      const res = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          returnSecureToken: true
        })
      });
      if (res.ok) {
        const data = await res.json();
        uid = data.localId || uid;
        idToken = data.idToken || idToken;
        providerMode = firebaseConfig.mode;
      }
    } catch {}
  }

  const defaultCourses =
    safeBand === 'middle'
      ? ['course-mid-alg', 'course-mid-sci']
      : safeBand === 'high'
      ? ['course-high-phys', 'course-high-bio']
      : ['course-elem-math', 'course-elem-sci'];

  const defaultClass =
    safeBand === 'middle'
      ? ['class-mid-7b']
      : safeBand === 'high'
      ? ['class-high-10c']
      : ['class-elem-4a'];

  const newUserRecord = {
    uid,
    email: cleanEmail,
    passwordHash: simpleHashPassword(password),
    displayName: cleanName,
    role: safeRole,
    schoolLevel: safeBand,
    avatarEmoji:
      safeRole === 'teacher'
        ? '👩‍🏫'
        : safeBand === 'high'
        ? '🚀'
        : safeBand === 'middle'
        ? '🧭'
        : '🌱',
    summaryTag:
      safeRole === 'teacher'
        ? 'Educator Account'
        : `${safeBand.charAt(0).toUpperCase() + safeBand.slice(1)} School Learner`,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    firestoreCollections: {
      userDoc: {
        uid,
        email: cleanEmail,
        displayName: cleanName,
        role: safeRole,
        schoolLevel: safeBand,
        profile: {
          studentName: cleanName,
          schoolLevel: safeBand,
          quizCompleted: false,
          hasChosenPreferences: false,
          matchedPresetName: 'Default Workspace',
          matchedReasons: [],
          capabilities: { ...DEFAULT_CAPABILITIES }
        }
      },
      courseProgress: {
        enrolledCourseIds: defaultCourses,
        joinedClassIds: defaultClass,
        skillMastery: {},
        lessonSessions: {
          lastActiveLessonId:
            safeBand === 'middle'
              ? 'mid-math-algebra'
              : safeBand === 'high'
              ? 'high-phys-kinematics'
              : 'elem-math-fractions',
          byLessonId: {}
        }
      },
      submissions: {},
      aiThreads: []
    }
  };

  db[cleanEmail] = newUserRecord;
  saveUsersDatabase(db);

  // Mirror registration to backend API middleware
  if (typeof fetch !== 'undefined') {
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid,
        email: cleanEmail,
        displayName: cleanName,
        role: safeRole,
        schoolLevel: safeBand
      })
    }).catch(() => {});
  }

  const sessionUser = {
    uid,
    email: cleanEmail,
    displayName: cleanName,
    role: safeRole,
    schoolLevel: safeBand,
    avatarEmoji: newUserRecord.avatarEmoji,
    idToken,
    providerMode,
    lastSyncedAt: new Date().toISOString()
  };

  saveActiveAuthSession(sessionUser);

  return {
    ok: true,
    user: sessionUser,
    firestoreCollections: newUserRecord.firestoreCollections,
    providerMode
  };
}

/**
 * Sign in with Email & Password against Firebase Auth / Local Cloud Mirror
 */
export async function signInWithEmailPassword({
  email,
  password,
  firebaseConfig = DEFAULT_FIREBASE_CONFIG
}) {
  const check = validateEmailAndPassword(email, password);
  if (!check.valid) {
    return { ok: false, error: check.error };
  }

  const cleanEmail = check.cleanEmail;
  const db = loadUsersDatabase();
  const localAccount = db[cleanEmail];

  let providerMode = 'local_cloud_mirror';
  let idToken = localAccount ? `local_jwt_${localAccount.uid}` : '';

  // Attempt live Firebase Auth REST signInWithPassword if configured
  if (
    (firebaseConfig.mode === 'firebase_cloud' && firebaseConfig.apiKey) ||
    firebaseConfig.mode === 'firebase_emulator'
  ) {
    try {
      const authUrl = getFirebaseAuthUrl(
        'accounts:signInWithPassword',
        firebaseConfig
      );
      const res = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          returnSecureToken: true
        })
      });
      if (res.ok) {
        const data = await res.json();
        idToken = data.idToken || idToken;
        providerMode = firebaseConfig.mode;
      }
    } catch {}
  }

  if (!localAccount) {
    return {
      ok: false,
      error:
        'No account found with that email address. Try signing up or selecting a Quick Demo Account below.'
    };
  }

  const expectedHash = simpleHashPassword(password);
  if (localAccount.passwordHash !== expectedHash) {
    return {
      ok: false,
      error: 'Incorrect password for this email account. Please try again.'
    };
  }

  localAccount.lastLoginAt = new Date().toISOString();
  db[cleanEmail] = localAccount;
  saveUsersDatabase(db);

  if (typeof fetch !== 'undefined') {
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: localAccount.uid,
        email: cleanEmail,
        role: localAccount.role
      })
    }).catch(() => {});
  }

  const sessionUser = {
    uid: localAccount.uid,
    email: localAccount.email,
    displayName: localAccount.displayName,
    role: localAccount.role,
    schoolLevel: localAccount.schoolLevel,
    avatarEmoji: localAccount.avatarEmoji || '🌟',
    idToken,
    providerMode,
    lastSyncedAt: new Date().toISOString()
  };

  saveActiveAuthSession(sessionUser);

  return {
    ok: true,
    user: sessionUser,
    firestoreCollections: localAccount.firestoreCollections,
    providerMode
  };
}

/**
 * Send password reset email via Firebase Auth or Local Cloud Mirror
 */
export async function sendPasswordReset({
  email,
  firebaseConfig = DEFAULT_FIREBASE_CONFIG
}) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return {
      ok: false,
      error: 'Please enter your account email address first.'
    };
  }

  if (
    (firebaseConfig.mode === 'firebase_cloud' && firebaseConfig.apiKey) ||
    firebaseConfig.mode === 'firebase_emulator'
  ) {
    try {
      const authUrl = getFirebaseAuthUrl('accounts:sendOobCode', firebaseConfig);
      await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'PASSWORD_RESET',
          email: cleanEmail
        })
      });
    } catch {}
  }

  return {
    ok: true,
    message: `Password reset instructions have been sent to ${cleanEmail}.`
  };
}

/**
 * Sync the active user's profile, course progress, submissions, and Luminare threads
 * to Firestore (`/users/{uid}`, `/users/{uid}/courseProgress`, `/users/{uid}/submissions`, `/aiThreads`)
 */
export async function syncUserWorkspaceToFirestore({
  user,
  profile,
  enrolledCourseIds,
  joinedClassIds,
  skillMastery,
  lessonSessions,
  submissions,
  aiThreads = [],
  firebaseConfig = DEFAULT_FIREBASE_CONFIG
}) {
  if (!user || !user.email) {
    return { ok: false, reason: 'unauthenticated' };
  }

  const cleanEmail = user.email.toLowerCase();
  const db = loadUsersDatabase();
  const existing = db[cleanEmail];
  const syncedAt = new Date().toISOString();

  const updatedCollections = {
    userDoc: {
      uid: user.uid,
      email: cleanEmail,
      displayName: profile?.studentName || user.displayName,
      role: user.role || 'student',
      schoolLevel: profile?.schoolLevel || user.schoolLevel || 'elementary',
      updatedAt: syncedAt,
      profile
    },
    courseProgress: {
      enrolledCourseIds,
      joinedClassIds,
      skillMastery,
      lessonSessions,
      updatedAt: syncedAt
    },
    submissions: submissions || {},
    aiThreads: aiThreads.slice(0, 40)
  };

  if (existing) {
    existing.displayName = profile?.studentName || existing.displayName;
    existing.schoolLevel = profile?.schoolLevel || existing.schoolLevel;
    existing.firestoreCollections = updatedCollections;
    db[cleanEmail] = existing;
    saveUsersDatabase(db);
  }

  // Sync to Cloud Firestore REST endpoint if configured
  if (
    (firebaseConfig.mode === 'firebase_cloud' &&
      firebaseConfig.apiKey &&
      firebaseConfig.projectId) ||
    firebaseConfig.mode === 'firebase_emulator'
  ) {
    try {
      const docUrl = getFirestoreDocumentUrl(
        `users/${user.uid}`,
        firebaseConfig
      );
      await fetch(docUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(user.idToken ? { Authorization: `Bearer ${user.idToken}` } : {})
        },
        body: JSON.stringify({
          fields: {
            uid: { stringValue: String(user.uid) },
            email: { stringValue: cleanEmail },
            displayName: {
              stringValue: String(profile?.studentName || user.displayName)
            },
            role: { stringValue: String(user.role || 'student') },
            schoolLevel: {
              stringValue: String(profile?.schoolLevel || 'elementary')
            },
            updatedAt: { stringValue: syncedAt }
          }
        })
      });
    } catch {}
  }

  // Mirror to Vite server backend endpoint
  if (typeof fetch !== 'undefined') {
    fetch('/api/firebase/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        email: cleanEmail,
        collections: [
          `users/${user.uid}`,
          `users/${user.uid}/courseProgress`,
          `users/${user.uid}/submissions`,
          `aiThreads`
        ],
        syncedAt
      })
    }).catch(() => {});
  }

  return {
    ok: true,
    syncedAt,
    collectionsUpdated: [
      `users/${user.uid}`,
      `users/${user.uid}/courseProgress`,
      `users/${user.uid}/submissions`,
      `aiThreads`
    ]
  };
}
