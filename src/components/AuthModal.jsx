import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  LogOut,
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Database,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { DEMO_ACCOUNTS } from '../services/firebaseService';

export default function AuthModal({ isOpen, onClose, initialTab = 'signin' }) {
  const {
    currentUser,
    signInUser,
    registerUser,
    signOutUser,
    resetUserPassword,
    firebaseConfig,
    updateFirebaseConfig,
    syncCloudNow,
    lastCloudSyncAt,
    profile
  } = usePlatform();

  const [activeTab, setActiveTab] = useState(
    currentUser ? 'account' : initialTab
  );

  // Sign In / Sign Up Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('student');
  const [schoolLevel, setSchoolLevel] = useState(
    profile?.schoolLevel || 'elementary'
  );
  const [showPassword, setShowPassword] = useState(false);

  // Firebase Configuration State
  const [fbProjectId, setFbProjectId] = useState(
    firebaseConfig?.projectId || 'luminalearn-udl-2026'
  );
  const [fbApiKey, setFbApiKey] = useState(firebaseConfig?.apiKey || '');
  const [fbAuthDomain, setFbAuthDomain] = useState(
    firebaseConfig?.authDomain || 'luminalearn-udl-2026.firebaseapp.com'
  );
  const [fbUseEmulator, setFbUseEmulator] = useState(
    Boolean(firebaseConfig?.useEmulator)
  );

  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const firstInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage(null);
    setStatusMessage(null);
    setActiveTab(currentUser ? 'account' : initialTab);
    setTimeout(() => firstInputRef.current?.focus(), 40);

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, currentUser, initialTab, onClose]);

  if (!isOpen) return null;

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    setLoading(true);
    try {
      const res = await signInUser({ email, password });
      if (!res.ok) {
        setErrorMessage(res.error || 'Could not sign in.');
      } else {
        setStatusMessage(
          `Welcome back, ${res.user.displayName}! Your learning profile and Course Mastery blocks are synced.`
        );
        setPassword('');
        setTimeout(() => onClose(), 700);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    setLoading(true);
    try {
      const res = await registerUser({
        email,
        password,
        displayName,
        role,
        schoolLevel
      });
      if (!res.ok) {
        setErrorMessage(res.error || 'Could not create account.');
      } else {
        setStatusMessage(
          `Account created for ${res.user.displayName}! Cloud profile initialized at /users/${res.user.uid}.`
        );
        setPassword('');
        setTimeout(() => onClose(), 800);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoAcc) => {
    setErrorMessage(null);
    setStatusMessage(null);
    setLoading(true);
    try {
      const res = await signInUser({
        email: demoAcc.email,
        password: demoAcc.password
      });
      if (res.ok) {
        setStatusMessage(
          `Signed in as ${demoAcc.displayName} (${demoAcc.email}).`
        );
        setTimeout(() => onClose(), 500);
      } else {
        setErrorMessage(res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    const res = await resetUserPassword(email);
    if (!res.ok) {
      setErrorMessage(res.error);
    } else {
      setStatusMessage(res.message);
    }
  };

  const handleSaveFirebaseConfig = (e) => {
    e.preventDefault();
    const updated = updateFirebaseConfig({
      projectId: fbProjectId.trim() || 'luminalearn-udl-2026',
      apiKey: fbApiKey.trim(),
      authDomain:
        fbAuthDomain.trim() || 'luminalearn-udl-2026.firebaseapp.com',
      useEmulator: fbUseEmulator
    });
    setStatusMessage(
      `Firebase backend mode updated to: ${updated.mode.toUpperCase()}.`
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lumina-auth-modal-title"
      data-testid="auth-modal"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="surface-card bg-white text-slate-900 rounded-3xl max-w-xl w-full border-2 border-indigo-200 shadow-2xl overflow-hidden my-8">
        {/* Top Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="lumina-auth-modal-title"
                className="font-extrabold text-base"
              >
                LuminaLearn Account & Cloud Sync
              </h2>
              <p className="text-xs text-slate-300">
                Sign in with email & password to sync your learning tools,
                mastery blocks, and Luminare coach
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            aria-label="Close account modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 pt-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setErrorMessage(null);
              setStatusMessage(null);
            }}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-extrabold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'signin'
                ? 'bg-white text-indigo-900 border-indigo-600'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setErrorMessage(null);
              setStatusMessage(null);
            }}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-extrabold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'signup'
                ? 'bg-white text-indigo-900 border-indigo-600'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Create Account
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('account');
              setErrorMessage(null);
              setStatusMessage(null);
            }}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-extrabold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'account'
                ? 'bg-white text-indigo-900 border-indigo-600'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />{' '}
            {currentUser ? 'My Profile & Firebase' : 'Firebase Cloud Setup'}
          </button>
        </div>

        {/* Status / Error Banners */}
        <div className="p-6 space-y-5 text-xs">
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 font-bold flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {statusMessage && (
            <div
              role="status"
              className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN WITH EMAIL & PASSWORD */}
          {activeTab === 'signin' && (
            <div className="space-y-5">
              <form onSubmit={handleSignInSubmit} className="space-y-3.5">
                <label className="block space-y-1">
                  <span className="font-extrabold text-slate-800 uppercase">
                    Email Address
                  </span>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      ref={firstInputRef}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@luminalearn.org"
                      className="w-full rounded-xl border-2 border-slate-300 pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-900"
                    />
                  </div>
                </label>

                <label className="block space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-800 uppercase">
                      Password
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="text-[11px] font-bold text-indigo-700 hover:underline"
                    >
                      {showPassword ? 'Hide password' : 'Show password'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password (min 6 characters)"
                      className="w-full rounded-xl border-2 border-slate-300 pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-900"
                    />
                  </div>
                </label>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-xs font-bold text-slate-600 hover:text-indigo-700 hover:underline"
                  >
                    Forgot password?
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs disabled:opacity-50"
                  >
                    <LogIn className="w-4 h-4" />
                    {loading ? 'Signing In...' : 'Sign In with Email'}
                  </button>
                </div>
              </form>

              {/* 1-Click Quick Demo Accounts for Easy Testing */}
              <div className="pt-4 border-t border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold uppercase tracking-wider text-[11px] text-slate-500">
                    Instant 1-Click Test Accounts (Pre-Seeded in Firebase Mirror)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEMO_ACCOUNTS.map((acc) => {
                    const isCurrent =
                      currentUser?.email?.toLowerCase() ===
                      acc.email.toLowerCase();
                    return (
                      <button
                        key={acc.uid}
                        type="button"
                        onClick={() => handleQuickDemoLogin(acc)}
                        className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2.5 ${
                          isCurrent
                            ? 'bg-indigo-50 border-indigo-600'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <span className="text-lg shrink-0" aria-hidden="true">
                          {acc.avatarEmoji}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span className="truncate">{acc.displayName}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded bg-indigo-600 text-white text-[10px]">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 truncate">
                            {acc.email}
                          </div>
                          <div className="text-[10px] font-semibold text-indigo-800 mt-0.5">
                            {acc.summaryTag}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE NEW EMAIL & PASSWORD ACCOUNT */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="font-extrabold text-slate-800 uppercase">
                    Your Name
                  </span>
                  <input
                    ref={firstInputRef}
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g., Sam Taylor"
                    className="w-full rounded-xl border-2 border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="font-extrabold text-slate-800 uppercase">
                    Account Role
                  </span>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 bg-white"
                  >
                    <option value="student">🎓 Student Learner (K–12)</option>
                    <option value="teacher">
                      👩‍🏫 Classroom Educator / Teacher
                    </option>
                  </select>
                </label>
              </div>

              <label className="block space-y-1">
                <span className="font-extrabold text-slate-800 uppercase">
                  School Grade Band
                </span>
                <select
                  value={schoolLevel}
                  onChange={(e) => setSchoolLevel(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 bg-white"
                >
                  <option value="elementary">
                    🌱 Elementary School (Grades K–5)
                  </option>
                  <option value="middle">
                    🧭 Middle School (Grades 6–8)
                  </option>
                  <option value="high">🚀 High School (Grades 9–12)</option>
                </select>
              </label>

              <label className="block space-y-1">
                <span className="font-extrabold text-slate-800 uppercase">
                  Email Address
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sam@school.org"
                  className="w-full rounded-xl border-2 border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900"
                />
              </label>

              <label className="block space-y-1">
                <span className="font-extrabold text-slate-800 uppercase">
                  Create Password (6+ characters)
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border-2 border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-900"
                />
              </label>

              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                <span>
                  Creating an account automatically sets up your private
                  Firestore document (<code>/users/&#123;uid&#125;</code>) to
                  save your accessibility preferences, Course Mastery crowns,
                  and Luminare study plans.
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  {loading ? 'Creating Account...' : 'Create Account & Sign In'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CURRENT ACCOUNT & FIREBASE CLOUD BACKEND CONFIGURATION */}
          {activeTab === 'account' && (
            <div className="space-y-5">
              {currentUser ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden="true">
                        {currentUser.avatarEmoji || '🌟'}
                      </span>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">
                          {currentUser.displayName}
                        </div>
                        <div className="text-xs text-slate-600">
                          {currentUser.email} · Role:{' '}
                          <strong className="uppercase">
                            {currentUser.role}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await syncCloudNow();
                          if (res?.ok) {
                            setStatusMessage(
                              `Synced to Cloud Firestore (/users/${currentUser.uid}) at ${new Date(
                                res.syncedAt
                              ).toLocaleTimeString()}.`
                            );
                          }
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Sync Now
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          signOutUser();
                          setActiveTab('signin');
                          setStatusMessage('Signed out of your account.');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                    <div>
                      <strong>Firestore Document:</strong>{' '}
                      <code>/users/{currentUser.uid}</code>
                    </div>
                    <div>
                      <strong>Last Cloud Sync:</strong>{' '}
                      {lastCloudSyncAt
                        ? new Date(lastCloudSyncAt).toLocaleTimeString()
                        : 'Synced'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-extrabold">
                      Currently browsing in Guest Mode
                    </div>
                    <p className="text-[11px] text-amber-900">
                      Sign in with an email & password to isolate and sync your
                      progress across devices.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('signin')}
                    className="px-3.5 py-2 rounded-xl bg-amber-900 text-white font-bold shrink-0"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Firebase Project & Cloud Firestore Connection Settings */}
              <form
                onSubmit={handleSaveFirebaseConfig}
                className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-indigo-600" />
                    Firebase Auth & Cloud Firestore Connection
                  </div>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold text-[10px] uppercase">
                    Mode: {firebaseConfig?.mode || 'local_cloud_mirror'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  LuminaLearn includes production <code>firestore.rules</code>,{' '}
                  <code>storage.rules</code>, and <code>firebase.json</code>. By
                  default, it runs in <strong>Offline-First Cloud Mirror</strong>{' '}
                  mode so accounts work without external setup, or you can
                  connect your live Firebase project / Local Emulator Suite
                  below:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="block space-y-1">
                    <span className="font-bold text-slate-700">
                      Firebase Project ID
                    </span>
                    <input
                      type="text"
                      value={fbProjectId}
                      onChange={(e) => setFbProjectId(e.target.value)}
                      placeholder="luminalearn-udl-2026"
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="font-bold text-slate-700">
                      Firebase Auth Domain
                    </span>
                    <input
                      type="text"
                      value={fbAuthDomain}
                      onChange={(e) => setFbAuthDomain(e.target.value)}
                      placeholder="project.firebaseapp.com"
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs"
                    />
                  </label>
                </div>

                <label className="block space-y-1">
                  <span className="font-bold text-slate-700">
                    Firebase Web API Key (Optional — leave blank for Built-In
                    Cloud Mirror)
                  </span>
                  <input
                    type="password"
                    value={fbApiKey}
                    onChange={(e) => setFbApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs"
                  />
                </label>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={fbUseEmulator}
                    onChange={(e) => setFbUseEmulator(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span className="font-semibold text-slate-700">
                    Use Firebase Local Emulator Suite (<code>127.0.0.1:9099</code>{' '}
                    Auth & <code>:8080</code> Firestore)
                  </span>
                </label>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Protected by <code>firestore.rules</code> role & owner
                    isolation
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold"
                  >
                    Save Firebase Config
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
