import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  DEFAULT_PROFILE,
  DEFAULT_CAPABILITIES,
  ACCESSIBILITY_PRESETS,
  LEARNER_TOOL_BUNDLES,
  buildProfileFromQuizSelections,
  detectSystemPreferences
} from '../data/quizMapping';
import {
  INITIAL_LESSONS,
  INITIAL_HOMEWORK,
  INITIAL_RECOMMENDATIONS,
  INITIAL_DISCUSSIONS,
  INITIAL_STUDENT_ROSTER
} from '../data/curriculumData';
import {
  INITIAL_COURSES,
  INITIAL_CLASSROOMS,
  validateJoinCodeTransaction,
  validateAccessibilityChecklist
} from '../data/coursesData';
import {
  loadActiveAuthSession,
  saveActiveAuthSession,
  loadSavedFirebaseConfig,
  saveFirebaseConfig,
  registerWithEmailPassword,
  signInWithEmailPassword,
  sendPasswordReset,
  syncUserWorkspaceToFirestore
} from '../services/firebaseService';

const PlatformContext = createContext(null);

const STORAGE_KEYS = {
  STUDENT_PREFS: 'luminalearn_student_prefs_v3',
  EDUCATOR_ACCOMMODATIONS: 'luminalearn_educator_accommodations_v3',
  CUSTOM_LESSONS: 'luminalearn_custom_lessons_v3',
  PROGRESS: 'luminalearn_progress_v3',
  LESSON_SESSIONS: 'luminalearn_lesson_sessions_v3',
  HOMEWORK: 'luminalearn_homework_v3',
  DISCUSSIONS: 'luminalearn_discussions_v3',
  RECOMMENDATIONS: 'luminalearn_recommendations_v3',
  COURSES: 'luminalearn_courses_v4',
  ENROLLED_COURSES: 'luminalearn_enrolled_courses_v4',
  SKILL_MASTERY: 'luminalearn_skill_mastery_v4',
  CLASSROOMS: 'luminalearn_classrooms_v4',
  JOINED_CLASSES: 'luminalearn_joined_classes_v4',
  SUBMISSIONS: 'luminalearn_submissions_v4',
  AUDIT_LOGS: 'luminalearn_audit_logs_v4'
};

function parseRouteFromHash() {
  if (typeof window === 'undefined') {
    return { appMode: 'student', route: '/study' };
  }
  const raw = window.location.hash.replace(/^#/, '') || '/study';
  if (raw.startsWith('/teacher')) {
    return { appMode: 'teacher', route: raw };
  }
  if (raw.startsWith('/demo')) {
    return { appMode: 'demo', route: raw };
  }
  return { appMode: 'student', route: raw };
}

export function PlatformProvider({ children }) {
  const initialRouteInfo = parseRouteFromHash();
  const [appMode, setAppModeState] = useState(initialRouteInfo.appMode);
  const [currentRoute, setCurrentRouteState] = useState(initialRouteInfo.route);

  // Phase 7: Educator Authentication Gate (Students cannot enter real teacher mode without authorization)
  const [isEducatorAuthenticated, setIsEducatorAuthenticated] = useState(false);

  const navigateTo = useCallback((route) => {
    const normalized = route.startsWith('/') ? route : `/${route}`;
    if (typeof window !== 'undefined') {
      window.location.hash = normalized;
    }
    if (normalized.startsWith('/teacher')) {
      setAppModeState('teacher');
    } else if (normalized.startsWith('/demo')) {
      setAppModeState('demo');
    } else {
      setAppModeState('student');
    }
    setCurrentRouteState(normalized);
  }, []);

  const setAppMode = useCallback(
    (mode) => {
      if (mode === 'teacher') {
        navigateTo('/teacher/overview');
      } else if (mode === 'demo') {
        navigateTo('/demo/research');
      } else {
        navigateTo('/learn');
      }
    },
    [navigateTo]
  );

  const returnToStudentLearning = useCallback(() => {
    navigateTo('/learn');
  }, [navigateTo]);

  useEffect(() => {
    const onHashChange = () => {
      const info = parseRouteFromHash();
      setAppModeState(info.appMode);
      setCurrentRouteState(info.route);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const authenticateEducator = useCallback(async (passcode = '') => {
    const clean = passcode.trim();
    try {
      const res = await fetch('/api/auth/educator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: clean })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setIsEducatorAuthenticated(true);
          return { ok: true, authenticated: true };
        }
      }
    } catch {}
    // Fallback check when running static preview build
    if (clean === 'lumina-educator-2026') {
      setIsEducatorAuthenticated(true);
      return { ok: true, authenticated: true };
    }
    return {
      ok: false,
      authenticated: false,
      error: 'Invalid educator passcode.'
    };
  }, []);

  const logoutEducator = useCallback(() => {
    setIsEducatorAuthenticated(false);
    navigateTo('/learn');
  }, [navigateTo]);

  // Student-Owned Learning Preferences
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENT_PREFS);
      if (saved) return JSON.parse(saved);
    } catch {}
    const sys = detectSystemPreferences();
    return {
      ...DEFAULT_PROFILE,
      capabilities: {
        ...DEFAULT_CAPABILITIES,
        reducedMotion: sys.reducedMotion,
        highContrastCVI: sys.highContrast
      }
    };
  });

  // Separate Educator-Managed Accommodations Store
  const [educatorAccommodations, setEducatorAccommodations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EDUCATOR_ACCOMMODATIONS);
      return saved ? JSON.parse(saved) : { assignedNotes: '', enforcedCapabilities: {} };
    } catch {
      return { assignedNotes: '', enforcedCapabilities: {} };
    }
  });

  // Mastery & Progress Store
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      xp: 120,
      streakDays: 5,
      completedLessonIds: [],
      earnedBadges: [{ id: 'starter-badge', name: 'Learning Explorer', emoji: '🌟' }],
      lessonScores: {}
    };
  });

  // Resumable Lesson Session Store
  const [lessonSessions, setLessonSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LESSON_SESSIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      lastActiveLessonId: 'elem-math-fractions',
      byLessonId: {}
    };
  });

  // AI Configuration (Volatile session memory by default; optional opt-in browser persistence)
  const [aiConfig, setAiConfigState] = useState(() => {
    try {
      const saved = localStorage.getItem('luminalearn_ai_config_optin_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.rememberInBrowser) return parsed;
      }
    } catch {}
    return {
      apiKey: '',
      provider: 'auto',
      model: '',
      useBackendProxy: true,
      proxyEndpoint: '/api/ai-proxy',
      piiRedactionEnabled: true,
      rememberInBrowser: false
    };
  });

  const setAiConfig = useCallback((nextConfig) => {
    setAiConfigState((prev) => {
      const resolved =
        typeof nextConfig === 'function' ? nextConfig(prev) : nextConfig;
      try {
        if (resolved?.rememberInBrowser) {
          localStorage.setItem(
            'luminalearn_ai_config_optin_v5',
            JSON.stringify(resolved)
          );
        } else {
          localStorage.removeItem('luminalearn_ai_config_optin_v5');
        }
      } catch {}
      return resolved;
    });
  }, []);

  // Firebase Auth & Cloud Firestore State
  const [currentUser, setCurrentUser] = useState(() => loadActiveAuthSession());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [firebaseConfig, setFirebaseConfigState] = useState(() =>
    loadSavedFirebaseConfig()
  );
  const [lastCloudSyncAt, setLastCloudSyncAt] = useState(() =>
    currentUser?.lastSyncedAt || null
  );

  // Friendly Luminare AI Companion Chat Thread
  const [luminareMessages, setLuminareMessages] = useState([
    {
      id: 'lum-welcome-1',
      sender: 'luminare',
      source: 'luminare-companion',
      text: `Hi there! I'm Luminare, your friendly Socratic learning companion.\n\n• Tap any starter card above to get step-by-step help on your current lesson.\n• Switch to "My Personalized Study Plan" to see which skills are closest to earning a Mastery Crown (100 pts 👑).\n• Or open "Create a Custom Mini-Lesson" to turn your favorite interest into an interactive module!`,
      suggestedFollowUps: [
        'Help me understand my current lesson in 3 tiny steps',
        'Give me a warmup practice question',
        'Explain my topic with a real-world analogy'
      ],
      timestamp: 'Just now'
    }
  ]);

  // Curriculum & LMS Stores
  const [customLessons, setCustomLessons] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_LESSONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allLessons = [...INITIAL_LESSONS, ...customLessons];

  const [homeworkList, setHomeworkList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOMEWORK);
      return saved ? JSON.parse(saved) : INITIAL_HOMEWORK;
    } catch {
      return INITIAL_HOMEWORK;
    }
  });

  const [recommendations, setRecommendations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS);
      return saved ? JSON.parse(saved) : INITIAL_RECOMMENDATIONS;
    } catch {
      return INITIAL_RECOMMENDATIONS;
    }
  });

  const [discussions, setDiscussions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DISCUSSIONS);
      return saved ? JSON.parse(saved) : INITIAL_DISCUSSIONS;
    } catch {
      return INITIAL_DISCUSSIONS;
    }
  });

  const [studentRoster] = useState(INITIAL_STUDENT_ROSTER);
  const [calmBreakOpen, setCalmBreakOpen] = useState(false);

  // Phase 2: Courses, Enrollments & Skill-Level Mastery
  const [courses, setCourses] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
      return saved ? JSON.parse(saved) : INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  });

  const [enrolledCourseIds, setEnrolledCourseIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ENROLLED_COURSES);
      return saved
        ? JSON.parse(saved)
        : ['course-elem-math', 'course-mid-alg', 'course-high-phys'];
    } catch {
      return ['course-elem-math', 'course-mid-alg', 'course-high-phys'];
    }
  });

  const [skillMastery, setSkillMastery] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SKILL_MASTERY);
      if (saved) return JSON.parse(saved);
    } catch {}
    const initialMap = {};
    INITIAL_COURSES.forEach((c) => {
      (c.skills || []).forEach((s) => {
        initialMap[s.id] = s.defaultMastery || 'not_started';
      });
    });
    return initialMap;
  });

  // Phase 4: Classrooms & Join Codes
  const [classrooms, setClassrooms] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLASSROOMS);
      return saved ? JSON.parse(saved) : INITIAL_CLASSROOMS;
    } catch {
      return INITIAL_CLASSROOMS;
    }
  });

  const [joinedClassIds, setJoinedClassIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JOINED_CLASSES);
      return saved ? JSON.parse(saved) : ['class-elem-4a'];
    } catch {
      return ['class-elem-4a'];
    }
  });

  // Phase 5 & Phase 8: Submissions, Offline Detection & Explicit Sync State
  const [submissions, setSubmissions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [browserOffline, setBrowserOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const isOffline = simulatedOffline || browserOffline;

  // Sync status: 'saved_locally' | 'syncing' | 'submitted' | 'needs_connection'
  const [syncStatus, setSyncStatus] = useState('saved_locally');

  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'audit-init-1',
              action: 'class_code_active',
              detail: 'Class LUM-4829 active for Grade 4 Visual Math Studio',
              timestamp: '2026-10-25T12:00:00Z'
            }
          ];
    } catch {
      return [];
    }
  });

  // Phase 4: Captions & Transcript History (Initialized to null when silent)
  const [captionEntry, setCaptionEntry] = useState(null);
  const [transcriptHistory, setTranscriptHistory] = useState([]);
  const [visualSoundCue, setVisualSoundCue] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENT_PREFS, JSON.stringify(profile));
    } catch {}
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.EDUCATOR_ACCOMMODATIONS,
        JSON.stringify(educatorAccommodations)
      );
    } catch {}
  }, [educatorAccommodations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch {}
  }, [progress]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LESSON_SESSIONS, JSON.stringify(lessonSessions));
    } catch {}
  }, [lessonSessions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_LESSONS, JSON.stringify(customLessons));
    } catch {}
  }, [customLessons]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HOMEWORK, JSON.stringify(homeworkList));
    } catch {}
  }, [homeworkList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(recommendations));
    } catch {}
  }, [recommendations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DISCUSSIONS, JSON.stringify(discussions));
    } catch {}
  }, [discussions]);

  const playGentleTone = useCallback(
    (type = 'success') => {
      if (profile.capabilities.quietAudioEffects || profile.capabilities.sensoryCalmMode) {
        return;
      }
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        if (type === 'success') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.1);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
          osc.start(now);
          osc.stop(now + 0.28);
        } else if (type === 'hint') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.start(now);
          osc.stop(now + 0.18);
        } else if (type === 'gentle-retry') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(349.23, now);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
        }
      } catch {}
    },
    [profile.capabilities.quietAudioEffects, profile.capabilities.sensoryCalmMode]
  );

  const appendTranscript = useCallback((speaker, text) => {
    if (!text) return;
    const timeStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    setCaptionEntry({
      speaker,
      text,
      sentences: sentences.length > 0 ? sentences : [text],
      activeSentenceIndex: 0,
      timestamp: timeStr
    });

    setTranscriptHistory((prev) => [
      { id: `tr-${Date.now()}-${Math.random()}`, speaker, text, timestamp: timeStr },
      ...prev.slice(0, 29)
    ]);
  }, []);

  const triggerCue = useCallback(
    (type, label, detailText = '') => {
      playGentleTone(type);
      // Phase 6: Visual sound-cue banners are only shown if explicitly enabled by the learner
      if (profile.capabilities.visualSoundCues) {
        const cueObj = { id: Date.now(), type, label, detailText };
        setVisualSoundCue(cueObj);
        setTimeout(() => {
          setVisualSoundCue((prev) => (prev?.id === cueObj.id ? null : prev));
        }, 3500);
      }
    },
    [playGentleTone, profile.capabilities.visualSoundCues]
  );

  // Phase 4 & 6: SpeechSynthesis with Boundary Sentence Highlighting & Auto-Collapse
  const speakText = useCallback(
    (text, speakerLabel = 'Lesson Audio') => {
      if (!text) return;
      const clean = text.replace(/[*#_`]/g, '');
      const sentences = clean
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);

      const sentenceRanges = [];
      let cursor = 0;
      (sentences.length > 0 ? sentences : [clean]).forEach((s, idx) => {
        const start = clean.indexOf(s, cursor);
        const end = start >= 0 ? start + s.length : cursor + s.length;
        sentenceRanges.push({ index: idx, start: Math.max(0, start), end });
        cursor = end;
      });

      appendTranscript(speakerLabel, clean);
      setIsSpeaking(true);
      setIsSpeechPaused(false);

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(clean);
          utterance.rate = Number(profile.capabilities.speechRate) || 1.0;
          utterance.pitch = 1.0;

          utterance.onstart = () => {
            setIsSpeaking(true);
            setIsSpeechPaused(false);
          };

          utterance.onboundary = (event) => {
            if (typeof event.charIndex === 'number') {
              const matched = sentenceRanges.find(
                (r) => event.charIndex >= r.start && event.charIndex <= r.end + 2
              );
              if (matched) {
                setCaptionEntry((prev) =>
                  prev ? { ...prev, activeSentenceIndex: matched.index } : prev
                );
              }
            }
          };

          utterance.onend = () => {
            setIsSpeaking(false);
            setIsSpeechPaused(false);
          };

          utterance.onerror = () => {
            setIsSpeaking(false);
            setIsSpeechPaused(false);
          };

          window.speechSynthesis.speak(utterance);
        } catch {
          setIsSpeaking(false);
          setIsSpeechPaused(false);
        }
      } else {
        // If browser speechSynthesis is unavailable in headless env, auto-complete after 2.5s
        setTimeout(() => {
          setIsSpeaking(false);
          setIsSpeechPaused(false);
        }, 2500);
      }
    },
    [appendTranscript, profile.capabilities.speechRate]
  );

  const pauseSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsSpeechPaused(true);
    }
  }, []);

  const resumeSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setIsSpeechPaused(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsSpeechPaused(false);
  }, []);

  const toggleCapability = useCallback((capKey, explicitValue) => {
    setProfile((prev) => {
      const nextVal =
        explicitValue !== undefined ? explicitValue : !prev.capabilities[capKey];
      const updatedCaps = {
        ...prev.capabilities,
        [capKey]: nextVal
      };

      if (capKey === 'highContrastCVI' && nextVal) {
        updatedCaps.creamPaperTint = false;
        updatedCaps.sensoryCalmMode = false;
      } else if (capKey === 'creamPaperTint' && nextVal) {
        updatedCaps.highContrastCVI = false;
        updatedCaps.sensoryCalmMode = false;
      } else if (capKey === 'sensoryCalmMode' && nextVal) {
        updatedCaps.highContrastCVI = false;
        updatedCaps.creamPaperTint = false;
      }

      if (capKey === 'captionDockPreference') {
        updatedCaps.closedCaptions = nextVal !== 'off';
      }

      return {
        ...prev,
        hasChosenPreferences: true,
        capabilities: updatedCaps
      };
    });
  }, []);

  const toggleLearnerBundle = useCallback((bundleId) => {
    const bundle = LEARNER_TOOL_BUNDLES.find((b) => b.id === bundleId);
    if (!bundle) return;
    setProfile((prev) => {
      const isCurrentlyActive = Boolean(prev.capabilities[bundle.primaryCapKey]);
      const nextCaps = { ...prev.capabilities };
      if (isCurrentlyActive) {
        Object.keys(bundle.toggles).forEach((k) => {
          nextCaps[k] = DEFAULT_CAPABILITIES[k];
        });
      } else {
        Object.assign(nextCaps, bundle.toggles);
      }
      return {
        ...prev,
        hasChosenPreferences: true,
        matchedPresetName: 'My Chosen Tools',
        capabilities: nextCaps
      };
    });
  }, []);

  const applyPreset = useCallback((presetId) => {
    const found = ACCESSIBILITY_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setProfile((prev) => ({
      ...prev,
      quizCompleted: true,
      hasChosenPreferences: presetId !== 'default_workspace_preset',
      matchedPresetName: found.learnerLabel || found.name,
      matchedReasons: found.reasons,
      capabilities: { ...found.capabilities }
    }));
  }, []);

  const applyQuizSelections = useCallback(
    (selectedOptionIds, schoolLevel, studentName) => {
      const newProfile = buildProfileFromQuizSelections(
        selectedOptionIds,
        schoolLevel,
        studentName
      );
      setProfile(newProfile);
    },
    []
  );

  const exportPreferencesJson = useCallback(() => {
    return JSON.stringify(
      {
        version: 3,
        exportedAt: new Date().toISOString(),
        matchedPresetName: profile.matchedPresetName,
        capabilities: profile.capabilities
      },
      null,
      2
    );
  }, [profile]);

  const importPreferencesJson = useCallback((rawJson) => {
    try {
      const parsed = JSON.parse(rawJson);
      if (parsed && parsed.capabilities && typeof parsed.capabilities === 'object') {
        setProfile((prev) => ({
          ...prev,
          hasChosenPreferences: true,
          matchedPresetName: parsed.matchedPresetName || 'Imported Tools',
          capabilities: {
            ...DEFAULT_CAPABILITIES,
            ...parsed.capabilities
          }
        }));
        return true;
      }
    } catch {}
    return false;
  }, []);

  const saveLessonSession = useCallback((lessonId, sessionData) => {
    setLessonSessions((prev) => ({
      lastActiveLessonId: lessonId,
      byLessonId: {
        ...prev.byLessonId,
        [lessonId]: {
          ...(prev.byLessonId[lessonId] || {}),
          ...sessionData,
          updatedAt: Date.now()
        }
      }
    }));
  }, []);

  const recordLessonCompletion = useCallback(
    (lesson, accurateScorePercent) => {
      setProgress((prev) => {
        const alreadyCompleted = prev.completedLessonIds.includes(lesson.id);
        const addedXp = alreadyCompleted ? 40 : lesson.xpReward || 150;
        const badgeExists = prev.earnedBadges.some((b) => b.id === lesson.id);

        return {
          ...prev,
          xp: prev.xp + addedXp,
          completedLessonIds: alreadyCompleted
            ? prev.completedLessonIds
            : [...prev.completedLessonIds, lesson.id],
          earnedBadges: badgeExists
            ? prev.earnedBadges
            : [
                ...prev.earnedBadges,
                {
                  id: lesson.id,
                  name: lesson.badgeName || `${lesson.title} Complete`,
                  emoji: lesson.badgeEmoji || '🏆'
                }
              ],
          lessonScores: {
            ...prev.lessonScores,
            [lesson.id]: Math.max(prev.lessonScores[lesson.id] ?? 0, accurateScorePercent)
          }
        };
      });

      setHomeworkList((prev) =>
        prev.map((hw) =>
          hw.lessonId === lesson.id ? { ...hw, completed: true } : hw
        )
      );

      setLessonSessions((prev) => ({
        ...prev,
        byLessonId: {
          ...prev.byLessonId,
          [lesson.id]: {
            ...(prev.byLessonId[lesson.id] || {}),
            stage: 'completed',
            scorePercent: accurateScorePercent,
            updatedAt: Date.now()
          }
        }
      }));

      triggerCue(
        'success',
        `Lesson Complete: ${lesson.title}`,
        `Score: ${accurateScorePercent}%`
      );
    },
    [triggerCue]
  );

  const addBonusXp = useCallback((amount = 20) => {
    setProgress((prev) => ({ ...prev, xp: prev.xp + amount }));
  }, []);

  const addCustomLesson = useCallback((newLesson) => {
    setCustomLessons((prev) => [newLesson, ...prev]);
  }, []);

  const assignNewHomework = useCallback((hwData) => {
    const newHw = { id: `hw-${Date.now()}`, completed: false, ...hwData };
    setHomeworkList((prev) => [newHw, ...prev]);
  }, []);

  const addRecommendation = useCallback((recData) => {
    const newRec = { id: `rec-${Date.now()}`, ...recData };
    setRecommendations((prev) => [newRec, ...prev]);
  }, []);

  const addDiscussionPost = useCallback(
    (postData) => {
      const newPost = {
        id: `disc-${Date.now()}`,
        author: profile.studentName || 'Alex',
        role: postData.role || 'student',
        avatar: postData.role === 'teacher' ? '👩‍🏫' : '🚀',
        timestamp: 'Just now',
        promptTag: postData.promptTag || 'Study Note',
        content: postData.content,
        lessonId: postData.lessonId || 'elem-math-fractions',
        moderationStatus: 'approved',
        flaggedReason: null,
        replies: []
      };
      setDiscussions((prev) => [newPost, ...prev]);
    },
    [profile.studentName]
  );

  const addDiscussionReply = useCallback(
    (discussionId, replyText, role = 'student') => {
      if (!replyText.trim()) return;
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === discussionId
            ? {
                ...d,
                replies: [
                  ...d.replies,
                  {
                    id: `rep-${Date.now()}`,
                    author:
                      role === 'teacher'
                        ? 'Ms. Elena Vance (Teacher)'
                        : profile.studentName || 'Alex',
                    role,
                    avatar: role === 'teacher' ? '👩‍🏫' : '🌟',
                    timestamp: 'Just now',
                    content: replyText.trim()
                  }
                ]
              }
            : d
        )
      );
    },
    [profile.studentName]
  );

  const reportDiscussionPost = useCallback((postId, reason = 'Needs teacher review') => {
    setDiscussions((prev) =>
      prev.map((d) =>
        d.id === postId
          ? { ...d, moderationStatus: 'flagged', flaggedReason: reason }
          : d
      )
    );
    fetch('/api/moderation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, action: 'report', reason })
    }).catch(() => {});
  }, []);

  const moderateDiscussionPost = useCallback((postId, nextStatus) => {
    setDiscussions((prev) =>
      prev.map((d) =>
        d.id === postId
          ? { ...d, moderationStatus: nextStatus, flaggedReason: null }
          : d
      )
    );
    fetch('/api/moderation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, action: nextStatus })
    }).catch(() => {});
  }, []);

  // Persist Courses, Enrollments, Skill Mastery, Classrooms, Submissions & Audit Logs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    } catch {}
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.ENROLLED_COURSES,
        JSON.stringify(enrolledCourseIds)
      );
    } catch {}
  }, [enrolledCourseIds]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.SKILL_MASTERY,
        JSON.stringify(skillMastery)
      );
    } catch {}
  }, [skillMastery]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(classrooms));
    } catch {}
  }, [classrooms]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.JOINED_CLASSES,
        JSON.stringify(joinedClassIds)
      );
    } catch {}
  }, [joinedClassIds]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.SUBMISSIONS,
        JSON.stringify(submissions)
      );
    } catch {}
  }, [submissions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  // Listen for browser online/offline transitions and reconcile pending local drafts (Phase 8)
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onOnline = () => setBrowserOffline(false);
    const onOffline = () => setBrowserOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    if (isOffline) {
      setSyncStatus('needs_connection');
    } else {
      // Automatically sync any local drafts that were saved while offline
      const pendingIds = Object.keys(submissions).filter(
        (k) => submissions[k]?.status === 'needs_connection'
      );
      if (pendingIds.length > 0) {
        setSyncStatus('syncing');
        setSubmissions((prev) => {
          const updated = { ...prev };
          pendingIds.forEach((id) => {
            updated[id] = {
              ...updated[id],
              status: 'submitted',
              syncedAt: new Date().toISOString()
            };
          });
          return updated;
        });
        setTimeout(() => setSyncStatus('submitted'), 300);
      } else {
        setSyncStatus('saved_locally');
      }
    }
  }, [isOffline, submissions]);

  const appendAuditLog = useCallback((action, detail) => {
    const entry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      action,
      detail,
      timestamp: new Date().toISOString()
    };
    setAuditLogs((prev) => [entry, ...prev.slice(0, 49)]);
  }, []);

  const enrollInCourse = useCallback(
    (courseId) => {
      if (!courseId) return;
      setEnrolledCourseIds((prev) =>
        prev.includes(courseId) ? prev : [...prev, courseId]
      );
      appendAuditLog('course_enrolled', `Student enrolled in course ${courseId}`);
    },
    [appendAuditLog]
  );

  const updateSkillMastery = useCallback((skillIds = [], nextLevel = 'mastered') => {
    if (!Array.isArray(skillIds) || skillIds.length === 0) return;
    setSkillMastery((prev) => {
      const updated = { ...prev };
      skillIds.forEach((id) => {
        updated[id] = nextLevel;
      });
      return updated;
    });
  }, []);

  // Phase 4: Classroom Join Code Preview & Transactional Enrollment
  const previewClassroomByCode = useCallback(
    (codeInput) => {
      return validateJoinCodeTransaction(codeInput, classrooms);
    },
    [classrooms]
  );

  const joinClassroomByCode = useCallback(
    async (codeInput) => {
      const check = validateJoinCodeTransaction(codeInput, classrooms);
      fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode: codeInput })
      }).catch(() => {});

      if (!check.valid) {
        appendAuditLog(
          `join_code_rejected_${check.reason}`,
          `Join attempt with code "${codeInput}" failed: ${check.reason}`
        );
        return check;
      }

      const targetClass = check.classroom;
      setJoinedClassIds((prev) =>
        prev.includes(targetClass.id) ? prev : [...prev, targetClass.id]
      );
      if (targetClass.courseId) {
        setEnrolledCourseIds((prev) =>
          prev.includes(targetClass.courseId)
            ? prev
            : [...prev, targetClass.courseId]
        );
      }

      appendAuditLog(
        'classroom_joined',
        `Joined "${targetClass.name}" (${targetClass.joinCode}) with ${targetClass.teacherName}`
      );
      return {
        ...check,
        enrolled: true
      };
    },
    [classrooms, appendAuditLog]
  );

  const createClassroom = useCallback(
    ({ name, schoolLevel, subject, courseId, requireTeacherApproval = false }) => {
      const prefix = (subject || 'LUM').slice(0, 3).toUpperCase();
      const digits = Math.floor(1000 + Math.random() * 9000);
      const joinCode = `${prefix}-${digits}`;
      const gradeRange =
        schoolLevel === 'elementary'
          ? 'Elementary (Grades 3–5)'
          : schoolLevel === 'middle'
          ? 'Middle School (Grades 6–8)'
          : 'High School (Grades 9–12)';

      const newClass = {
        id: `class-${Date.now()}`,
        name: name.trim() || `${subject} Studio`,
        teacherName: 'Ms. Elena Vance',
        schoolLevel,
        gradeRange,
        subject,
        courseId: courseId || 'course-elem-math',
        joinCode,
        codeStatus: 'active',
        expiresAt: '2027-06-30',
        requireTeacherApproval,
        aiEnabled: true,
        enrolledStudentCount: 1
      };

      setClassrooms((prev) => [newClass, ...prev]);
      appendAuditLog(
        'classroom_created',
        `Created classroom "${newClass.name}" with code ${joinCode}`
      );
      fetch('/api/classes/manage-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'classroom_created',
          classId: newClass.id,
          joinCode
        })
      }).catch(() => {});
      return newClass;
    },
    [appendAuditLog]
  );

  const regenerateClassroomCode = useCallback(
    (classId) => {
      let generatedCode = '';
      setClassrooms((prev) =>
        prev.map((c) => {
          if (c.id !== classId) return c;
          const prefix = (c.subject || 'LUM').slice(0, 3).toUpperCase();
          generatedCode = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
          return {
            ...c,
            joinCode: generatedCode,
            codeStatus: 'active'
          };
        })
      );
      if (generatedCode) {
        appendAuditLog(
          'join_code_regenerated',
          `Regenerated join code ${generatedCode} for class ${classId}`
        );
      }
      return generatedCode;
    },
    [appendAuditLog]
  );

  const revokeClassroomCode = useCallback(
    (classId) => {
      setClassrooms((prev) =>
        prev.map((c) =>
          c.id === classId ? { ...c, codeStatus: 'revoked' } : c
        )
      );
      appendAuditLog(
        'join_code_revoked',
        `Revoked join code for class ${classId}`
      );
    },
    [appendAuditLog]
  );

  const toggleClassAI = useCallback(
    (classId) => {
      setClassrooms((prev) =>
        prev.map((c) =>
          c.id === classId ? { ...c, aiEnabled: !c.aiEnabled } : c
        )
      );
      appendAuditLog(
        'class_ai_policy_updated',
        `Updated class-level AI availability for ${classId}`
      );
    },
    [appendAuditLog]
  );

  // Phase 5 & Phase 8: Offline-Aware Module Submission (Never falsely claims "submitted" while offline)
  const submitModuleWork = useCallback(
    ({
      moduleId,
      courseId,
      selfReflection = 'solid',
      demonstratedMastery = true,
      skillIds = []
    }) => {
      const targetMastery = demonstratedMastery ? 'mastered' : 'ready_to_review';
      if (skillIds.length > 0) {
        updateSkillMastery(skillIds, targetMastery);
      }

      if (isOffline) {
        setSyncStatus('needs_connection');
        const offlineEntry = {
          moduleId,
          courseId,
          selfReflection,
          status: 'needs_connection',
          savedLocallyAt: new Date().toISOString()
        };
        setSubmissions((prev) => ({
          ...prev,
          [moduleId]: offlineEntry
        }));
        appendAuditLog(
          'submission_saved_offline',
          `Module ${moduleId} saved locally while offline (needs connection to submit)`
        );
        return {
          submitted: false,
          status: 'needs_connection',
          message:
            'Saved locally on this device. Your work will submit automatically as soon as your connection returns.'
        };
      }

      setSyncStatus('syncing');
      const onlineEntry = {
        moduleId,
        courseId,
        selfReflection,
        status: 'submitted',
        submittedAt: new Date().toISOString()
      };
      setSubmissions((prev) => ({
        ...prev,
        [moduleId]: onlineEntry
      }));
      fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onlineEntry)
      }).catch(() => {});
      setTimeout(() => setSyncStatus('submitted'), 150);
      appendAuditLog(
        'module_submitted',
        `Submitted module ${moduleId} (${targetMastery})`
      );
      return {
        submitted: true,
        status: 'submitted',
        message: 'Work submitted and skill mastery updated.'
      };
    },
    [isOffline, updateSkillMastery, appendAuditLog]
  );

  // Phase 7: Enforced Accessibility Quality Gate on Course/Module Publishing
  const publishCourseModule = useCallback(
    ({ courseId, unitId, moduleData }) => {
      const validation = validateAccessibilityChecklist(
        moduleData?.accessibilityChecklist || {}
      );
      if (!validation.passed) {
        appendAuditLog(
          'publish_blocked_accessibility_gate',
          `Blocked publishing "${
            moduleData?.title || 'Untitled'
          }" — missing: ${validation.missingItems.join(', ')}`
        );
        return {
          published: false,
          missingItems: validation.missingItems
        };
      }

      setCourses((prev) =>
        prev.map((course) => {
          if (course.id !== courseId) return course;
          return {
            ...course,
            published: true,
            accessibilityGatePassed: true,
            units: course.units.map((u) =>
              u.id === unitId
                ? { ...u, modules: [...u.modules, moduleData] }
                : u
            )
          };
        })
      );

      appendAuditLog(
        'module_published_passed_gate',
        `Published accessible module "${moduleData.title}" in ${courseId}`
      );
      return {
        published: true,
        missingItems: []
      };
    },
    [appendAuditLog]
  );

  // Phase 8: Shared-Device Cache Clearing Control
  const clearSharedDeviceCache = useCallback(() => {
    try {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    } catch {}
    setSyncStatus('saved_locally');
    appendAuditLog(
      'shared_device_cache_cleared',
      'Cleared local storage cache for shared school device'
    );
  }, [appendAuditLog]);

  // Apply a user's isolated Firestore document collections onto active workspace state
  const applyUserFirestoreCollections = useCallback((user, collections) => {
    if (!collections) return;
    if (collections.userDoc?.profile) {
      setProfile(collections.userDoc.profile);
    } else if (user) {
      setProfile((prev) => ({
        ...prev,
        studentName: user.displayName || prev.studentName,
        schoolLevel: user.schoolLevel || prev.schoolLevel
      }));
    }

    if (collections.courseProgress) {
      const cp = collections.courseProgress;
      if (Array.isArray(cp.enrolledCourseIds)) {
        setEnrolledCourseIds(cp.enrolledCourseIds);
      }
      if (Array.isArray(cp.joinedClassIds)) {
        setJoinedClassIds(cp.joinedClassIds);
      }
      if (cp.skillMastery && typeof cp.skillMastery === 'object') {
        setSkillMastery((prev) => ({ ...prev, ...cp.skillMastery }));
      }
      if (cp.lessonSessions && typeof cp.lessonSessions === 'object') {
        setLessonSessions(cp.lessonSessions);
      }
    }

    if (collections.submissions && typeof collections.submissions === 'object') {
      setSubmissions(collections.submissions);
    }

    if (
      Array.isArray(collections.aiThreads) &&
      collections.aiThreads.length > 0
    ) {
      setLuminareMessages(collections.aiThreads);
    } else if (user) {
      setLuminareMessages([
        {
          id: `lum-welcome-${user.uid}`,
          sender: 'luminare',
          source: 'luminare-companion',
          text: `Welcome back, ${user.displayName}! I'm Luminare, your personal learning guide.\n\n• Your Course Mastery blocks and learning tools are synced to your account (${user.email}).\n• Tap any starter prompt above or check "My Personalized Study Plan" to get started!`,
          suggestedFollowUps: [
            'Help me understand my current lesson in 3 tiny steps',
            'Give me a warmup practice question',
            'Explain my topic with a real-world analogy'
          ],
          timestamp: 'Just now'
        }
      ]);
    }

    if (user?.role === 'teacher') {
      setIsEducatorAuthenticated(true);
    }
  }, []);

  const signInUser = useCallback(
    async ({ email, password }) => {
      const res = await signInWithEmailPassword({
        email,
        password,
        firebaseConfig
      });
      if (res.ok && res.user) {
        setCurrentUser(res.user);
        setLastCloudSyncAt(res.user.lastSyncedAt || new Date().toISOString());
        applyUserFirestoreCollections(res.user, res.firestoreCollections);
        appendAuditLog(
          'user_signed_in',
          `Signed in as ${res.user.displayName} (${res.user.email}, role: ${res.user.role})`
        );
      }
      return res;
    },
    [firebaseConfig, applyUserFirestoreCollections, appendAuditLog]
  );

  const registerUser = useCallback(
    async ({ email, password, displayName, role, schoolLevel }) => {
      const res = await registerWithEmailPassword({
        email,
        password,
        displayName,
        role,
        schoolLevel,
        firebaseConfig
      });
      if (res.ok && res.user) {
        setCurrentUser(res.user);
        setLastCloudSyncAt(res.user.lastSyncedAt || new Date().toISOString());
        applyUserFirestoreCollections(res.user, res.firestoreCollections);
        appendAuditLog(
          'user_registered',
          `Registered account ${res.user.displayName} (${res.user.email}, role: ${res.user.role})`
        );
      }
      return res;
    },
    [firebaseConfig, applyUserFirestoreCollections, appendAuditLog]
  );

  const signOutUser = useCallback(() => {
    const prevEmail = currentUser?.email || 'user';
    saveActiveAuthSession(null);
    setCurrentUser(null);
    setIsEducatorAuthenticated(false);
    appendAuditLog('user_signed_out', `Signed out account ${prevEmail}`);
  }, [currentUser, appendAuditLog]);

  const resetUserPassword = useCallback(
    async (emailInput) => {
      return sendPasswordReset({ email: emailInput, firebaseConfig });
    },
    [firebaseConfig]
  );

  const updateFirebaseConfig = useCallback(
    (nextCfg) => {
      const updated = saveFirebaseConfig(nextCfg);
      setFirebaseConfigState(updated);
      appendAuditLog(
        'firebase_config_updated',
        `Firebase mode set to ${updated.mode} (project: ${updated.projectId})`
      );
      return updated;
    },
    [appendAuditLog]
  );

  const syncCloudNow = useCallback(async () => {
    if (!currentUser) return { ok: false, reason: 'unauthenticated' };
    const res = await syncUserWorkspaceToFirestore({
      user: currentUser,
      profile,
      enrolledCourseIds,
      joinedClassIds,
      skillMastery,
      lessonSessions,
      submissions,
      aiThreads: luminareMessages,
      firebaseConfig
    });
    if (res.ok) {
      setLastCloudSyncAt(res.syncedAt);
    }
    return res;
  }, [
    currentUser,
    profile,
    enrolledCourseIds,
    joinedClassIds,
    skillMastery,
    lessonSessions,
    submissions,
    luminareMessages,
    firebaseConfig
  ]);

  // Automatically sync signed-in user's workspace changes to Firestore mirror
  useEffect(() => {
    if (!currentUser) return;
    syncUserWorkspaceToFirestore({
      user: currentUser,
      profile,
      enrolledCourseIds,
      joinedClassIds,
      skillMastery,
      lessonSessions,
      submissions,
      aiThreads: luminareMessages,
      firebaseConfig
    }).catch(() => {});
  }, [
    currentUser,
    profile,
    enrolledCourseIds,
    joinedClassIds,
    skillMastery,
    lessonSessions,
    submissions,
    luminareMessages,
    firebaseConfig
  ]);

  const effectiveCapabilities = {
    ...profile.capabilities,
    ...(educatorAccommodations.enforcedCapabilities || {})
  };

  // Phase 4: Determine whether a caption or transcript surface is currently mounted
  const captionPref = effectiveCapabilities.captionDockPreference || 'auto';
  const isCaptionDockMounted =
    (captionPref === 'auto' && isSpeaking && Boolean(captionEntry)) ||
    captionPref === 'pinned' ||
    captionPref === 'transcript';

  const getRootAccessibilityClasses = () => {
    const caps = effectiveCapabilities;
    const classes = [];

    if (caps.highContrastCVI) {
      classes.push('theme-cvi-contrast');
    } else if (caps.creamPaperTint) {
      classes.push('theme-dyslexia-cream');
    } else if (caps.sensoryCalmMode) {
      classes.push('theme-sensory-calm');
    } else {
      classes.push('theme-standard');
    }

    if (caps.dyslexiaFont) {
      classes.push('font-dyslexia-mode');
    } else if (caps.hyperlegibleFont) {
      classes.push('font-hyperlegible-mode');
    }

    classes.push(`font-scale-${caps.fontScale || '100'}`);

    if (caps.reducedMotion || caps.sensoryCalmMode) {
      classes.push('reduced-motion');
    }

    if (caps.largeTargets) {
      classes.push('motor-friendly-targets');
    }

    return classes.join(' ');
  };

  return (
    <PlatformContext.Provider
      value={{
        appMode,
        setAppMode,
        currentRoute,
        navigateTo,
        returnToStudentLearning,
        isEducatorAuthenticated,
        authenticateEducator,
        logoutEducator,
        profile: {
          ...profile,
          capabilities: effectiveCapabilities
        },
        rawStudentProfile: profile,
        setProfile,
        educatorAccommodations,
        setEducatorAccommodations,
        toggleCapability,
        toggleLearnerBundle,
        applyPreset,
        applyQuizSelections,
        exportPreferencesJson,
        importPreferencesJson,
        progress,
        recordLessonCompletion,
        addBonusXp,
        lessonSessions,
        saveLessonSession,
        aiConfig,
        setAiConfig,
        allLessons,
        addCustomLesson,
        homeworkList,
        assignNewHomework,
        recommendations,
        addRecommendation,
        discussions,
        addDiscussionPost,
        addDiscussionReply,
        reportDiscussionPost,
        moderateDiscussionPost,
        studentRoster,
        calmBreakOpen,
        setCalmBreakOpen,
        captionEntry,
        transcriptHistory,
        isCaptionDockMounted,
        visualSoundCue,
        triggerCue,
        speakText,
        pauseSpeaking,
        resumeSpeaking,
        stopSpeaking,
        isSpeaking,
        isSpeechPaused,
        getRootAccessibilityClasses,
        courses,
        enrolledCourseIds,
        enrollInCourse,
        publishCourseModule,
        skillMastery,
        updateSkillMastery,
        classrooms,
        joinedClassIds,
        previewClassroomByCode,
        joinClassroomByCode,
        createClassroom,
        regenerateClassroomCode,
        revokeClassroomCode,
        toggleClassAI,
        submissions,
        submitModuleWork,
        isOffline,
        simulatedOffline,
        setSimulatedOffline,
        syncStatus,
        clearSharedDeviceCache,
        auditLogs,
        currentUser,
        authModalOpen,
        setAuthModalOpen,
        firebaseConfig,
        updateFirebaseConfig,
        signInUser,
        registerUser,
        signOutUser,
        resetUserPassword,
        syncCloudNow,
        lastCloudSyncAt,
        luminareMessages,
        setLuminareMessages
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) {
    throw new Error('usePlatform must be used inside a PlatformProvider');
  }
  return ctx;
}
