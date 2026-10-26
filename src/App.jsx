import React, { useState, useMemo, useEffect } from 'react';
import {
  Play,
  Search,
  Award,
  Calendar,
  Clock,
  Compass,
  CheckCircle2,
  BookOpen,
  Users,
  CloudOff,
  Check,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Crown,
  Sparkles,
  FileText,
  Layers,
  LogIn,
  Cloud
} from 'lucide-react';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import {
  SCHOOL_RANGES,
  summarizeActiveToolsPlainText
} from './data/quizMapping';
import {
  MASTERY_TIERS,
  computeCourseMasteryStats
} from './data/coursesData';
import AccessibilityToolbar, {
  LearningToolsButton
} from './components/AccessibilityToolbar';
import OnboardingQuizModal from './components/OnboardingQuizModal';
import LessonPlayer from './components/LessonPlayer';
import {
  AISettingsModal,
  AILessonCreatorModal
} from './components/AIStudioModals';
import TeacherAdminPortal from './components/TeacherAdminPortal';
import CommunityDiscussions from './components/CommunityDiscussions';
import ResearchReportView from './components/ResearchReportModal';
import AuthModal from './components/AuthModal';
import LuminareView from './components/LuminareView';

export default function App() {
  return (
    <PlatformProvider>
      <LuminaPlatformShell />
    </PlatformProvider>
  );
}

/**
 * Reusable Accessible Assignment & Module Status Chip (Phase 1)
 * Never relies on color alone — always pairs an explicit icon + status label.
 */
export function PurposefulStatusChip({
  status = 'continue',
  dueText = 'Friday, Oct 30'
}) {
  switch (status) {
    case 'mastered':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-950 font-extrabold text-[11px]">
          <Crown className="w-3 h-3 text-amber-700" /> Mastered
        </span>
      );
    case 'submitted':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-950 font-extrabold text-[11px]">
          <Check className="w-3 h-3 text-emerald-700" /> Submitted
        </span>
      );
    case 'ready_to_review':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-300 text-blue-950 font-extrabold text-[11px]">
          <RefreshCw className="w-3 h-3 text-blue-700" /> Proficient · Ready to review
        </span>
      );
    case 'due_soon':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-300 text-amber-950 font-extrabold text-[11px]">
          <Calendar className="w-3 h-3 text-amber-700" /> Due {dueText}
        </span>
      );
    case 'needs_connection':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-400 text-amber-950 font-extrabold text-[11px]">
          <CloudOff className="w-3 h-3" /> Saved locally (Needs connection)
        </span>
      );
    case 'continue':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-950 font-extrabold text-[11px]">
          <Play className="w-3 h-3 fill-current text-indigo-700" /> Continue
        </span>
      );
  }
}

/**
 * Khan Academy-Inspired Visual Skill Mastery Block (4-Tier Crown Block)
 * Never relies on color alone — includes symbol + accessible label + tooltip.
 */
export function SkillMasteryBlock({ skill, state = 'not_started', onClick }) {
  const tier = MASTERY_TIERS[state] || MASTERY_TIERS.not_started;
  const symbol =
    state === 'mastered'
      ? '👑'
      : state === 'ready_to_review'
      ? '✓'
      : state === 'practicing'
      ? '◐'
      : '·';

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${skill.title} — ${tier.label} (${tier.points} / 100 pts)`}
      aria-label={`${skill.title}: ${tier.label}, ${tier.points} of 100 mastery points`}
      className={`mastery-block ${tier.blockClass}`}
    >
      <span aria-hidden="true">{symbol}</span>
    </button>
  );
}

function LuminaPlatformShell() {
  const {
    appMode,
    currentRoute,
    navigateTo,
    profile,
    progress,
    lessonSessions,
    allLessons,
    courses,
    enrolledCourseIds,
    enrollInCourse,
    skillMastery,
    classrooms,
    joinedClassIds,
    previewClassroomByCode,
    joinClassroomByCode,
    submissions,
    isOffline,
    simulatedOffline,
    setSimulatedOffline,
    syncStatus,
    clearSharedDeviceCache,
    homeworkList,
    recommendations,
    getRootAccessibilityClasses,
    currentUser,
    authModalOpen,
    setAuthModalOpen
  } = usePlatform();

  const [activeLesson, setActiveLesson] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [isMoreToolsOpen, setIsMoreToolsOpen] = useState(false);

  // Study Home Left-Rail / Tab Filter ('all' | 'assignments' | 'mastery' | 'classes')
  const [studySection, setStudySection] = useState('all');
  const [assignmentTab, setAssignmentTab] = useState('active'); // 'active' | 'past'

  // Phase 4: Join a Class Flow State
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinPreview, setJoinPreview] = useState(null);
  const [joinFeedback, setJoinFeedback] = useState(null);

  // Phase 2: Default the catalog to the learner's grade band and show 3 lessons by default
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState(
    profile.schoolLevel || 'elementary'
  );
  const [showAllCatalog, setShowAllCatalog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!showAllCatalog && profile.schoolLevel) {
      setSelectedSchoolFilter(profile.schoolLevel);
    }
  }, [profile.schoolLevel, showAllCatalog]);

  // Modals
  const [quizOpen, setQuizOpen] = useState(false);
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false);
  const [aiLessonCreatorOpen, setAiLessonCreatorOpen] = useState(false);

  const caps = profile.capabilities;

  // Determine the "Continue learning" lesson
  const continueLessonInfo = useMemo(() => {
    const lastId = lessonSessions.lastActiveLessonId;
    const byId = lessonSessions.byLessonId || {};

    let targetLesson =
      allLessons.find((l) => l.id === lastId) ||
      allLessons.find((l) => l.schoolLevel === profile.schoolLevel) ||
      allLessons[0];

    const isCompleted = progress.completedLessonIds.includes(targetLesson?.id);

    if (isCompleted) {
      const nextUnfinished = allLessons.find(
        (l) => !progress.completedLessonIds.includes(l.id)
      );
      if (nextUnfinished) {
        targetLesson = nextUnfinished;
      }
    }

    const activeSession = byId[targetLesson?.id];
    const totalCards = targetLesson?.microCards?.length || 3;
    const totalQuestions = targetLesson?.questions?.length || 3;

    let currentStageLabel = `Learn · Card 1 of ${totalCards}`;
    let hasStarted = false;
    let remainingMinutes = targetLesson?.estimatedMinutes || 8;

    if (
      activeSession &&
      activeSession.stage &&
      activeSession.stage !== 'completed'
    ) {
      hasStarted = true;
      if (activeSession.stage === 'concepts') {
        const cIdx = (activeSession.activeCardIndex || 0) + 1;
        currentStageLabel = `Learn · Card ${cIdx} of ${totalCards}`;
        remainingMinutes = Math.max(
          3,
          Math.round((targetLesson.estimatedMinutes || 8) * 0.7)
        );
      } else if (activeSession.stage === 'practice') {
        const qIdx = (activeSession.activeQuestionIndex || 0) + 1;
        currentStageLabel = `Checkpoint · Question ${qIdx} of ${totalQuestions}`;
        remainingMinutes = Math.max(
          2,
          Math.round((targetLesson.estimatedMinutes || 8) * 0.4)
        );
      }
    }

    return {
      lesson: targetLesson,
      hasStarted,
      currentStageLabel,
      remainingMinutes
    };
  }, [
    lessonSessions,
    allLessons,
    profile.schoolLevel,
    progress.completedLessonIds
  ]);

  // Determine Today's Assignment
  const todaysAssignment = useMemo(() => {
    const dueHw = homeworkList.find((hw) => !hw.completed);
    if (!dueHw) return null;
    const linkedLesson =
      allLessons.find((l) => l.id === dueHw.lessonId) || allLessons[0];
    return {
      homework: dueHw,
      lesson: linkedLesson
    };
  }, [homeworkList, allLessons]);

  // Phase 2: Merge continueLessonInfo and todaysAssignment when they reference the same lesson
  const isSameLesson = Boolean(
    continueLessonInfo.lesson &&
      todaysAssignment?.lesson &&
      continueLessonInfo.lesson.id === todaysAssignment.lesson.id
  );

  const activePrimaryLessonId = useMemo(() => {
    if (isSameLesson) return todaysAssignment.lesson.id;
    return continueLessonInfo.lesson?.id || todaysAssignment?.lesson?.id || null;
  }, [isSameLesson, todaysAssignment, continueLessonInfo]);

  const recommendedNextLessonId = useMemo(() => {
    const firstRec = recommendations[0];
    if (
      firstRec &&
      firstRec.lessonId !== activePrimaryLessonId &&
      !progress.completedLessonIds.includes(firstRec.lessonId)
    ) {
      return firstRec.lessonId;
    }
    const nextUnfinished = allLessons.find(
      (l) =>
        l.id !== activePrimaryLessonId &&
        !progress.completedLessonIds.includes(l.id)
    );
    return nextUnfinished?.id || null;
  }, [
    recommendations,
    progress.completedLessonIds,
    allLessons,
    activePrimaryLessonId
  ]);

  // Phase 2: Default catalog to learner's grade band, exclude active primary lesson in compact view, limit to 3 cards
  const catalogLessons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const isSearching = Boolean(q);

    const matching = allLessons.filter((lesson) => {
      if (!showAllCatalog && !isSearching && lesson.id === activePrimaryLessonId) {
        return false;
      }

      const effectiveSchoolFilter = showAllCatalog
        ? selectedSchoolFilter
        : selectedSchoolFilter;
      const matchesSchool =
        effectiveSchoolFilter === 'all' ||
        lesson.schoolLevel === effectiveSchoolFilter;

      const matchesQuery =
        !isSearching ||
        lesson.title.toLowerCase().includes(q) ||
        lesson.subtitle.toLowerCase().includes(q) ||
        lesson.subject.toLowerCase().includes(q) ||
        lesson.gradeRange.toLowerCase().includes(q);

      return matchesSchool && matchesQuery;
    });

    if (
      !showAllCatalog &&
      !isSearching &&
      selectedSchoolFilter !== 'all' &&
      matching.length < 3
    ) {
      const additional = allLessons.filter(
        (l) =>
          l.id !== activePrimaryLessonId &&
          !matching.some((m) => m.id === l.id)
      );
      return [...matching, ...additional].slice(0, 3);
    }

    if (!showAllCatalog && !isSearching) {
      return matching.slice(0, 3);
    }

    return matching;
  }, [
    allLessons,
    selectedSchoolFilter,
    showAllCatalog,
    searchQuery,
    activePrimaryLessonId
  ]);

  const handleToggleViewAllLessons = () => {
    if (showAllCatalog) {
      setShowAllCatalog(false);
      setSelectedSchoolFilter(profile.schoolLevel || 'elementary');
    } else {
      setShowAllCatalog(true);
      setSelectedSchoolFilter('all');
    }
  };

  // Phase 4: Preview & Join Class Handlers
  const handlePreviewJoinCode = (e) => {
    e.preventDefault();
    setJoinFeedback(null);
    const preview = previewClassroomByCode(joinCodeInput);
    setJoinPreview(preview);
  };

  const handleConfirmJoinClass = async () => {
    const res = await joinClassroomByCode(joinCodeInput);
    setJoinFeedback(res);
    if (res.valid) {
      setJoinCodeInput('');
      setJoinPreview(null);
    }
  };

  const joinedClassroomsList = useMemo(
    () => classrooms.filter((c) => joinedClassIds.includes(c.id)),
    [classrooms, joinedClassIds]
  );

  // Compute Khan Academy-style Mastery Points across enrolled courses
  const masterySummary = useMemo(() => {
    const allSkills = courses.flatMap((c) => c.skills || []);
    const totalPossiblePoints = allSkills.length * 100 || 300;
    let earnedPoints = 0;
    let masteredCount = 0;
    let reviewCount = 0;
    let practicingCount = 0;

    allSkills.forEach((s) => {
      const st = skillMastery?.[s.id] || s.defaultMastery || 'not_started';
      const tier = MASTERY_TIERS[st] || MASTERY_TIERS.not_started;
      earnedPoints += tier.points;
      if (st === 'mastered') masteredCount += 1;
      else if (st === 'ready_to_review') reviewCount += 1;
      else if (st === 'practicing') practicingCount += 1;
    });

    return {
      totalSkills: allSkills.length,
      earnedPoints,
      totalPossiblePoints,
      masteredCount,
      reviewCount,
      practicingCount,
      percent: Math.round((earnedPoints / totalPossiblePoints) * 100)
    };
  }, [courses, skillMastery]);

  const isStudyRoute =
    currentRoute === '/study' ||
    currentRoute === '/learn' ||
    currentRoute === '/progress' ||
    currentRoute === '/';
  const isModulesRoute =
    currentRoute === '/modules' || currentRoute.startsWith('/courses');

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

  const activeAssignments = homeworkList.filter((h) => !h.completed).slice(0, 3);
  const completedAssignments = homeworkList.filter((h) => h.completed);

  return (
    <div className={`min-h-screen flex flex-col ${getRootAccessibilityClasses()}`}>
      {/* Phase 1: Visible-on-focus "Skip to lesson content" link for keyboard users */}
      <a href="#main-content" className="skip-to-content-link">
        Skip to lesson content
      </a>

      {/* Phase 1: Calm Khan Academy-Inspired Top Bar
          [ LuminaLearn ] [ My tools ]                     [ Study ] [ Modules ] [ Community ] */}
      {appMode === 'student' && !(activeLesson && caps.focusShield) && (
        <header className="surface-card bg-white border-b border-slate-200 py-2.5 sticky top-0 z-30">
          <div className="adaptive-shell-container flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveLesson(null);
                  setSelectedCourseId(null);
                  navigateTo('/study');
                }}
                className="inline-flex items-center gap-2 text-left group"
              >
                <span
                  aria-hidden="true"
                  className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-extrabold group-hover:bg-indigo-500 transition"
                >
                  🌟
                </span>
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  LuminaLearn
                </span>
              </button>

              {/* Single persistent "My tools" disclosure button */}
              <LearningToolsButton
                isOpen={isMoreToolsOpen}
                onToggle={() => setIsMoreToolsOpen(!isMoreToolsOpen)}
              />
            </div>

            {/* Persistent student navigation row: Study | Modules | Luminare | Community + Account */}
            <nav
              aria-label="Student navigation"
              className="flex flex-wrap items-center gap-1"
            >
              <button
                type="button"
                onClick={() => {
                  setActiveLesson(null);
                  setSelectedCourseId(null);
                  navigateTo('/study');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition ${
                  isStudyRoute && !activeLesson
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Study
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveLesson(null);
                  navigateTo('/modules');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition ${
                  isModulesRoute && !activeLesson
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Modules
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveLesson(null);
                  setSelectedCourseId(null);
                  navigateTo('/luminare');
                }}
                className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition ${
                  currentRoute === '/luminare' && !activeLesson
                    ? 'bg-indigo-600 text-white'
                    : 'text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Luminare</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveLesson(null);
                  setSelectedCourseId(null);
                  navigateTo('/community');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition ${
                  currentRoute === '/community' && !activeLesson
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Community
              </button>

              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-extrabold"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                <span>{currentUser ? currentUser.displayName : 'Sign in'}</span>
              </button>
            </nav>
          </div>
        </header>
      )}

      {/* Contextual Learning Tools Panel, Calm Break Dialog & On-Demand Caption Panel */}
      <AccessibilityToolbar
        isMoreToolsOpen={isMoreToolsOpen}
        setIsMoreToolsOpen={setIsMoreToolsOpen}
        onOpenQuiz={() => setQuizOpen(true)}
      />

      {/* Explicit Offline / Sync Notice Banner when offline (Phase 8) */}
      {isOffline && (
        <div
          role="status"
          data-testid="offline-status-banner"
          className="bg-amber-100 border-b border-amber-300 py-2 px-4 text-xs text-amber-950"
        >
          <div className="adaptive-shell-container flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold inline-flex items-center gap-1.5">
              <CloudOff className="w-4 h-4" /> Offline mode active: Course materials are cached and your work is saved locally. Assignments will submit when your connection returns.
            </span>
            {simulatedOffline && (
              <button
                type="button"
                onClick={() => setSimulatedOffline(false)}
                className="px-2.5 py-1 rounded-lg bg-white border border-amber-400 font-extrabold text-amber-950"
              >
                Reconnect now
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Landmark */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 adaptive-shell-container py-6"
      >
        {activeLesson ? (
          <LessonPlayer
            lesson={activeLesson}
            onBack={() => setActiveLesson(null)}
            onOpenToolsPanel={() => setIsMoreToolsOpen(true)}
          />
        ) : appMode === 'teacher' ? (
          <TeacherAdminPortal
            onOpenAILessonCreator={() => setAiLessonCreatorOpen(true)}
            onOpenAISettings={() => setAiSettingsOpen(true)}
            onLaunchLesson={(lesson) => setActiveLesson(lesson)}
          />
        ) : appMode === 'demo' ? (
          <ResearchReportView
            onOpenQuiz={() => setQuizOpen(true)}
            onLaunchLesson={(lesson) => setActiveLesson(lesson)}
          />
        ) : currentRoute === '/luminare' ? (
          <LuminareView
            onLaunchLesson={(lesson) => setActiveLesson(lesson)}
          />
        ) : currentRoute === '/community' ? (
          <CommunityDiscussions />
        ) : isModulesRoute ? (
          selectedCourse ? (
            <CourseHomeView
              course={selectedCourse}
              allLessons={allLessons}
              progress={progress}
              submissions={submissions}
              skillMastery={skillMastery}
              isEnrolled={enrolledCourseIds.includes(selectedCourse.id)}
              onEnroll={() => enrollInCourse(selectedCourse.id)}
              onBackToCourses={() => setSelectedCourseId(null)}
              onLaunchLesson={(lesson) => setActiveLesson(lesson)}
            />
          ) : (
            <ModulesCatalogView
              courses={courses}
              enrolledCourseIds={enrolledCourseIds}
              skillMastery={skillMastery}
              selectedSchoolFilter={selectedSchoolFilter}
              setSelectedSchoolFilter={setSelectedSchoolFilter}
              showAllCatalog={showAllCatalog}
              onToggleViewAll={handleToggleViewAllLessons}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onOpenCourse={(courseId) => setSelectedCourseId(courseId)}
              onEnrollCourse={(courseId) => enrollInCourse(courseId)}
            />
          )
        ) : (
          /* ==================================================================
             KHAN ACADEMY-INSPIRED LEARNER HOME (STUDY VIEW)
             Two-Column Asymmetric Layout:
               - Left Navigation Rail (3 cols): Learner profile, section filter, classes, tools summary
               - Right Main Workspace (9 cols):
                   1. Up Next / Merged Primary Assignment Card
                   2. Active vs. Past Assignments Inbox
                   3. Course Mastery & Visual Skill Block Grid (Crown Blocks)
                   4. Recommended Modules for Grade Band
             ================================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16 items-start">
            {/* LEFT NAVIGATION RAIL (Khan Academy Learner Home Sidebar) */}
            <aside
              aria-label="Learner Home navigation"
              className="lg:col-span-3 space-y-5"
            >
              {/* Learner Identity & Cloud Account Card */}
              <div className="surface-card bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-900 font-extrabold flex items-center justify-center text-sm">
                      {currentUser?.avatarEmoji ||
                        (profile.studentName || 'A').slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900">
                        {profile.studentName}
                      </div>
                      <div className="text-xs text-slate-500 capitalize">
                        {profile.schoolLevel} School Learner
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Account / Cloud Sync Status Pill */}
                <div className="rounded-lg bg-indigo-50/70 border border-indigo-200 px-3 py-2 flex items-center justify-between gap-2 text-xs">
                  <div className="truncate text-indigo-950 font-semibold flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                    <span className="truncate">
                      {currentUser ? currentUser.email : 'Guest Mode (Local)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuthModalOpen(true)}
                    className="font-extrabold text-indigo-700 hover:underline shrink-0"
                  >
                    {currentUser ? 'Account' : 'Sign in'}
                  </button>
                </div>

                {/* Mastery Points Summary Pill */}
                <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 inline-flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-amber-600" /> Mastery Points
                  </span>
                  <span className="font-extrabold text-slate-900">
                    {masterySummary.earnedPoints} / {masterySummary.totalPossiblePoints}
                  </span>
                </div>

                {/* Quick Luminare Companion Entry Button */}
                <button
                  type="button"
                  onClick={() => navigateTo('/luminare')}
                  className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Ask Luminare Companion
                </button>

                {/* Left-Rail Navigation Links */}
                <nav
                  aria-label="Study sections"
                  className="space-y-1 pt-1 border-t border-slate-100 text-xs"
                >
                  {[
                    { id: 'all', label: 'Learner Home Overview' },
                    {
                      id: 'assignments',
                      label: `Assignments (${activeAssignments.length})`
                    },
                    { id: 'mastery', label: 'Course Mastery & Skills' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStudySection(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg font-bold transition flex items-center justify-between ${
                        studySection === item.id
                          ? 'bg-indigo-50 text-indigo-900 border-l-4 border-indigo-600'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* My Classes & Join Code Box */}
              <div className="surface-card bg-white rounded-xl border border-slate-200 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                    My Classes ({joinedClassroomsList.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setJoinModalOpen((prev) => !prev)}
                    className="font-bold text-indigo-700 hover:underline"
                  >
                    + Join a class
                  </button>
                </div>

                <div className="space-y-2">
                  {joinedClassroomsList.map((cls) => (
                    <div
                      key={cls.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5"
                    >
                      <div className="font-bold text-slate-900">{cls.name}</div>
                      <div className="text-slate-500">
                        {cls.teacherName} · Code: {cls.joinCode}
                      </div>
                    </div>
                  ))}
                </div>

                {joinModalOpen && (
                  <div
                    role="region"
                    aria-label="Join a classroom with a class code"
                    className="pt-2 border-t border-slate-200 space-y-2.5"
                  >
                    <form onSubmit={handlePreviewJoinCode} className="space-y-2">
                      <label className="block space-y-1">
                        <span className="font-bold text-slate-700">
                          Enter Class Code (e.g., LUM-4829)
                        </span>
                        <input
                          type="text"
                          value={joinCodeInput}
                          onChange={(e) => setJoinCodeInput(e.target.value)}
                          placeholder="ABC-1234"
                          className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-slate-900 font-bold uppercase"
                        />
                      </label>
                      <div className="flex gap-1.5">
                        <button
                          type="submit"
                          className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                        >
                          Check code
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setJoinModalOpen(false);
                            setJoinPreview(null);
                            setJoinFeedback(null);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>

                    {joinPreview && (
                      <div
                        className={`p-2.5 rounded-lg border ${
                          joinPreview.valid
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                            : 'bg-amber-50 border-amber-300 text-amber-950'
                        }`}
                      >
                        <div className="font-bold">{joinPreview.message}</div>
                        {joinPreview.valid && joinPreview.classroom && (
                          <button
                            type="button"
                            onClick={handleConfirmJoinClass}
                            className="mt-2 w-full py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold"
                          >
                            Confirm enrollment
                          </button>
                        )}
                      </div>
                    )}

                    {joinFeedback && (
                      <p
                        role="status"
                        className={`font-bold ${
                          joinFeedback.valid
                            ? 'text-emerald-800'
                            : 'text-amber-900'
                        }`}
                      >
                        {joinFeedback.valid
                          ? `✓ Enrolled in ${joinFeedback.classroom.name}!`
                          : joinFeedback.message}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Phase 3: Quiet preference summary in left rail */}
              <div
                data-testid="quiet-tools-summary"
                className="px-1 space-y-1.5 text-xs text-slate-600"
              >
                <p>
                  <span className="font-bold text-slate-800">Your tools:</span>{' '}
                  {summarizeActiveToolsPlainText(caps)}.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMoreToolsOpen(!isMoreToolsOpen)}
                    className="font-bold text-indigo-700 hover:text-indigo-900 underline"
                  >
                    {isMoreToolsOpen ? 'Hide tools' : 'Change tools'}
                  </button>
                  {!profile.quizCompleted && (
                    <button
                      type="button"
                      onClick={() => setQuizOpen(true)}
                      className="font-bold text-slate-700 hover:text-slate-900 underline"
                    >
                      Choose how you like to learn
                    </button>
                  )}
                </div>
              </div>
            </aside>

            {/* RIGHT MAIN WORKSPACE (9 cols) */}
            <div className="lg:col-span-9 space-y-8">
              {/* 1. PRIMARY UP-NEXT CARD (Merged when assignment & continue lesson match) */}
              {isSameLesson && todaysAssignment ? (
                <section
                  aria-labelledby="primary-task-heading"
                  data-testid="merged-primary-task-card"
                  className="surface-card rounded-2xl bg-white border border-slate-200 border-l-4 border-l-indigo-600 p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div className="space-y-2 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-900 font-extrabold">
                          {continueLessonInfo.hasStarted
                            ? 'Continue where you left off'
                            : 'Next up'}
                        </span>
                        <PurposefulStatusChip
                          status="due_soon"
                          dueText={todaysAssignment.homework.dueDate}
                        />
                        <span className="text-slate-500 font-semibold">
                          {continueLessonInfo.lesson.gradeRange} ·{' '}
                          {continueLessonInfo.lesson.subject}
                        </span>
                      </div>

                      <h1
                        id="primary-task-heading"
                        className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight"
                      >
                        {continueLessonInfo.lesson.title.split(':')[0]}
                      </h1>

                      <p className="text-sm text-slate-600">
                        Visual models and step-by-step hints are available.
                      </p>

                      {continueLessonInfo.hasStarted && (
                        <p className="text-xs font-bold text-indigo-900">
                          Current step: {continueLessonInfo.currentStageLabel}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveLesson(todaysAssignment.lesson)}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm transition"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        {continueLessonInfo.hasStarted
                          ? 'Continue today’s assignment'
                          : 'Start today’s assignment'}
                      </button>
                    </div>
                  </div>
                </section>
              ) : (
                continueLessonInfo.lesson && (
                  <section
                    aria-labelledby="primary-task-heading"
                    data-testid="primary-task-card"
                    className="surface-card rounded-2xl bg-white border border-slate-200 border-l-4 border-l-indigo-600 p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                      <div className="space-y-2 max-w-xl">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <PurposefulStatusChip status="continue" />
                          <span className="text-slate-500 font-semibold">
                            {continueLessonInfo.lesson.gradeRange} ·{' '}
                            {continueLessonInfo.lesson.subject} · ~
                            {continueLessonInfo.remainingMinutes} min
                          </span>
                        </div>

                        <h1
                          id="primary-task-heading"
                          className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight"
                        >
                          {continueLessonInfo.lesson.title}
                        </h1>

                        <p className="text-sm text-slate-600">
                          {continueLessonInfo.lesson.subtitle}
                        </p>
                      </div>

                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveLesson(continueLessonInfo.lesson)
                          }
                          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm transition"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          {continueLessonInfo.hasStarted
                            ? `Continue ${continueLessonInfo.lesson.title.split(':')[0]}`
                            : `Start ${continueLessonInfo.lesson.title.split(':')[0]}`}
                        </button>
                      </div>
                    </div>
                  </section>
                )
              )}

              {/* 2. KHAN ACADEMY-STYLE ASSIGNMENTS LIST (Active vs. Completed Tabs, Clean Single-Line Rows) */}
              {(studySection === 'all' || studySection === 'assignments') && (
                <section
                  aria-labelledby="upcoming-assignments-heading"
                  className="surface-card bg-white rounded-2xl border border-slate-200 overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2
                        id="upcoming-assignments-heading"
                        className="text-base font-extrabold text-slate-900"
                      >
                        My Assignments
                      </h2>
                      <p className="text-xs text-slate-500">
                        Assigned by your teacher · Untimed with step-by-step hints
                      </p>
                    </div>

                    {/* Active vs. Past Tabs (Khan Academy Pattern) */}
                    <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setAssignmentTab('active')}
                        className={`px-3 py-1 rounded-md font-bold transition ${
                          assignmentTab === 'active'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600'
                        }`}
                      >
                        Active ({activeAssignments.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssignmentTab('past')}
                        className={`px-3 py-1 rounded-md font-bold transition ${
                          assignmentTab === 'past'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600'
                        }`}
                      >
                        Completed ({completedAssignments.length})
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-200 text-xs">
                    {(assignmentTab === 'active'
                      ? activeAssignments
                      : completedAssignments
                    ).length === 0 ? (
                      <div className="p-6 text-center text-slate-500">
                        {assignmentTab === 'active'
                          ? 'You are all caught up on active assignments!'
                          : 'No completed assignments yet.'}
                      </div>
                    ) : (
                      (assignmentTab === 'active'
                        ? activeAssignments
                        : completedAssignments
                      ).map((hw) => {
                        const linkedLesson =
                          allLessons.find((l) => l.id === hw.lessonId) ||
                          allLessons[0];
                        const sub = submissions?.[hw.lessonId];
                        const chipStatus =
                          sub?.status === 'needs_connection'
                            ? 'needs_connection'
                            : hw.completed || sub?.status === 'submitted'
                            ? 'submitted'
                            : 'due_soon';

                        return (
                          <div
                            key={hw.id}
                            className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/80 transition"
                          >
                            <div className="flex items-start gap-3">
                              <span
                                aria-hidden="true"
                                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-base shrink-0 mt-0.5"
                              >
                                {linkedLesson?.badgeEmoji || '📘'}
                              </span>
                              <div className="space-y-0.5">
                                <div className="font-extrabold text-sm text-slate-900">
                                  {hw.title}
                                </div>
                                <div className="text-slate-500">
                                  {linkedLesson?.gradeRange} · ~
                                  {linkedLesson?.estimatedMinutes || 8} min ·{' '}
                                  {hw.accommodationTag}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <PurposefulStatusChip
                                status={chipStatus}
                                dueText={hw.dueDate}
                              />
                              <button
                                type="button"
                                onClick={() => setActiveLesson(linkedLesson)}
                                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                              >
                                {hw.completed ? 'Review' : 'Start'}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              )}

              {/* 3. KHAN ACADEMY COURSE MASTERY & VISUAL SKILL BLOCK GRID (Crown Blocks) */}
              {(studySection === 'all' || studySection === 'mastery') && (
                <section
                  aria-labelledby="study-progress-heading"
                  data-testid="study-progress-summary"
                  className="surface-card bg-white rounded-2xl border border-slate-200 overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2
                        id="study-progress-heading"
                        className="text-base font-extrabold text-slate-900"
                      >
                        Course Mastery & Skill Blocks
                      </h2>
                      <p className="text-xs text-slate-500">
                        Click any skill square to practice that skill · Earn 100 pts (👑) per skill to reach Mastered
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigateTo('/modules')}
                      className="text-xs font-extrabold text-indigo-700 hover:underline inline-flex items-center gap-1"
                    >
                      Browse all 6 courses <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-200">
                    {courses
                      .filter((c) => enrolledCourseIds.includes(c.id))
                      .map((course) => {
                        const stats = computeCourseMasteryStats(
                          course,
                          skillMastery
                        );
                        const primaryLesson =
                          allLessons.find(
                            (l) => l.id === course.primaryLessonId
                          ) || allLessons[0];

                        return (
                          <div
                            key={course.id}
                            className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-5"
                          >
                            <div className="space-y-2 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedCourseId(course.id);
                                    navigateTo('/modules');
                                  }}
                                  className="text-left font-extrabold text-base text-slate-900 hover:text-indigo-700 transition"
                                >
                                  {course.badgeEmoji} {course.title}
                                </button>
                                <span className="text-xs font-extrabold text-slate-700">
                                  {stats.earnedPoints} / {stats.totalPossiblePoints}{' '}
                                  Mastery Points ({stats.percent}%)
                                </span>
                              </div>

                              <div
                                role="progressbar"
                                aria-valuenow={stats.percent}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`${course.title} mastery progress`}
                                className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"
                              >
                                <div
                                  className="h-full bg-indigo-600 transition-all"
                                  style={{ width: `${stats.percent}%` }}
                                />
                              </div>

                              {/* Visual Skill Blocks Row (Khan Academy Square Blocks) */}
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="text-[11px] font-bold text-slate-500 mr-1">
                                  Unit Skills:
                                </span>
                                {(course.skills || []).map((skill) => {
                                  const st =
                                    skillMastery?.[skill.id] ||
                                    skill.defaultMastery ||
                                    'not_started';
                                  return (
                                    <SkillMasteryBlock
                                      key={skill.id}
                                      skill={skill}
                                      state={st}
                                      onClick={() =>
                                        setActiveLesson(primaryLesson)
                                      }
                                    />
                                  );
                                })}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCourseId(course.id);
                                  navigateTo('/modules');
                                }}
                                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                              >
                                Unit Map
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveLesson(primaryLesson)}
                                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                              >
                                Continue
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </section>
              )}

              {/* 4. RECOMMENDED MODULES FOR YOUR GRADE BAND (Compact 3-card row) */}
              <section
                aria-labelledby="explore-subjects-heading"
                className="space-y-4 pt-2 border-t border-slate-200"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h2
                      id="explore-subjects-heading"
                      className="text-base font-extrabold text-slate-900"
                    >
                      Explore Practice Modules
                    </h2>
                    <p className="text-xs text-slate-500">
                      Showing{' '}
                      {showAllCatalog
                        ? 'all K–12 modules'
                        : '3 modules for your grade band'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search lessons..."
                        aria-label="Search lessons"
                        className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {SCHOOL_RANGES.map((range) => (
                        <button
                          key={range.id}
                          type="button"
                          onClick={() => setSelectedSchoolFilter(range.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border ${
                            selectedSchoolFilter === range.id
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleViewAllLessons}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-extrabold border border-slate-300 bg-white hover:bg-slate-100 text-slate-800"
                    >
                      {showAllCatalog ? 'Show fewer lessons' : 'View all lessons'}
                    </button>
                  </div>
                </div>

                <div
                  data-testid="catalog-grid"
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {catalogLessons.map((lesson) => {
                    const isCompleted = progress.completedLessonIds.includes(
                      lesson.id
                    );
                    const isRecommendedNext =
                      lesson.id === recommendedNextLessonId;
                    const savedSession = lessonSessions.byLessonId?.[lesson.id];
                    const isInProgress =
                      savedSession?.stage && savedSession.stage !== 'completed';

                    return (
                      <div
                        key={lesson.id}
                        data-testid={`catalog-card-${lesson.id}`}
                        className="surface-card bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between hover:border-slate-300 transition"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-bold">
                            <span className="text-slate-500">
                              {lesson.gradeRange} · {lesson.subject}
                            </span>
                            {isCompleted ? (
                              <PurposefulStatusChip status="mastered" />
                            ) : isInProgress ? (
                              <PurposefulStatusChip status="continue" />
                            ) : (
                              isRecommendedNext && (
                                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 font-extrabold">
                                  Recommended
                                </span>
                              )
                            )}
                          </div>

                          <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                            {lesson.badgeEmoji} {lesson.title}
                          </h3>
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {lesson.subtitle}
                          </p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-500">
                            ~{lesson.estimatedMinutes} min
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveLesson(lesson)}
                            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-900 font-bold text-xs transition"
                          >
                            {isInProgress
                              ? 'Continue'
                              : isCompleted
                              ? 'Review'
                              : 'Start'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Prototype Role, Offline Sync & Shared-Device Footer */}
      {!(activeLesson && caps.focusShield) && (
        <footer
          aria-label="Prototype role, sync status, and research links"
          className="border-t border-slate-200 bg-slate-100/70 py-3 px-4 text-[11px] text-slate-500"
        >
          <div className="adaptive-shell-container flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span>
                LuminaLearn K–12 UDL LMS · Sync:{' '}
                <strong>
                  {isOffline
                    ? 'Needs connection (saved locally)'
                    : syncStatus === 'submitted'
                    ? 'Submitted'
                    : 'Saved locally'}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => setSimulatedOffline(!simulatedOffline)}
                className="underline hover:text-slate-800"
              >
                {simulatedOffline
                  ? 'Exit simulated offline mode'
                  : 'Test offline mode'}
              </button>
              <button
                type="button"
                onClick={clearSharedDeviceCache}
                className="underline hover:text-slate-800"
              >
                Clear shared-device cache
              </button>
            </div>

            <div className="flex items-center gap-3">
              {appMode !== 'student' && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveLesson(null);
                    navigateTo('/study');
                  }}
                  className="font-bold text-indigo-700 hover:underline"
                >
                  Student View
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setActiveLesson(null);
                  navigateTo('/teacher/classes');
                }}
                className="hover:text-slate-800 underline"
              >
                Educator Sign-In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveLesson(null);
                  navigateTo('/demo/research');
                }}
                className="hover:text-slate-800 underline"
              >
                Judge / Research Showcase
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Accessible Modals */}
      <OnboardingQuizModal
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
      />
      <AISettingsModal
        isOpen={aiSettingsOpen}
        onClose={() => setAiSettingsOpen(false)}
      />
      <AILessonCreatorModal
        isOpen={aiLessonCreatorOpen}
        onClose={() => setAiLessonCreatorOpen(false)}
        onLessonCreated={(createdLesson) => {
          setActiveLesson(createdLesson);
        }}
      />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

/* ============================================================================
   MODULES CATALOG VIEW (#/modules) — Khan Academy Course Directory Layout
   ============================================================================ */
function ModulesCatalogView({
  courses,
  enrolledCourseIds,
  skillMastery,
  selectedSchoolFilter,
  setSelectedSchoolFilter,
  showAllCatalog,
  onToggleViewAll,
  searchQuery,
  setSearchQuery,
  onOpenCourse,
  onEnrollCourse
}) {
  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return courses.filter((c) => {
      const matchesBand =
        showAllCatalog ||
        selectedSchoolFilter === 'all' ||
        c.schoolLevel === selectedSchoolFilter;
      const matchesQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.purpose.toLowerCase().includes(q);
      return matchesBand && matchesQuery;
    });
  }, [courses, selectedSchoolFilter, showAllCatalog, searchQuery]);

  return (
    <div className="space-y-6 pb-16" data-testid="modules-catalog-view">
      {/* Clean Directory Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700">
            K–12 Course Directory
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            Courses, Unit Maps & Skill Mastery
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Select any course to open its 3-unit mastery map, interactive labs, and untimed skill checkpoints.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              aria-label="Search courses"
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900"
            />
          </div>

          {SCHOOL_RANGES.map((range) => (
            <button
              key={range.id}
              type="button"
              onClick={() => setSelectedSchoolFilter(range.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                selectedSchoolFilter === range.id && !showAllCatalog
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {range.label}
            </button>
          ))}

          <button
            type="button"
            onClick={onToggleViewAll}
            className="px-3 py-1.5 rounded-lg text-xs font-extrabold border border-slate-300 bg-white hover:bg-slate-100 text-slate-800"
          >
            {showAllCatalog ? 'My grade band' : 'All K–12 courses'}
          </button>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div
          role="status"
          className="surface-card bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2"
        >
          <div className="text-base font-extrabold text-slate-900">
            No courses matched your search
          </div>
          <p className="text-xs text-slate-600">
            Try clearing the search box or switching to “All K–12 courses.”
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.includes(course.id);
            const stats = computeCourseMasteryStats(course, skillMastery);

            return (
              <div
                key={course.id}
                data-testid={`course-card-${course.id}`}
                className="surface-card bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Course Card Top Strip */}
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl" aria-hidden="true">
                        {course.badgeEmoji}
                      </span>
                      <div>
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {course.gradeRange} · {course.subject}
                        </div>
                        <h2 className="text-base font-extrabold text-slate-900">
                          {course.title}
                        </h2>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-extrabold text-xs text-slate-800 shrink-0">
                      {stats.earnedPoints} / {stats.totalPossiblePoints} pts
                    </span>
                  </div>

                  {/* Course Purpose & Unit List */}
                  <div className="p-6 space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {course.purpose}
                    </p>

                    <div className="space-y-2">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        Course Units ({course.units.length} Units ·All Unlocked):
                      </div>
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                        {course.units.map((u) => (
                          <div
                            key={u.id}
                            className="px-3.5 py-2.5 bg-white flex items-center justify-between gap-2"
                          >
                            <span className="font-bold text-slate-800">
                              Unit {u.unitNumber}: {u.title}
                            </span>
                            <span className="text-[11px] text-slate-500 shrink-0">
                              {u.modules.length} module{u.modules.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Card Footer */}
                <div className="px-6 py-3.5 bg-slate-50/60 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    {(course.skills || []).map((skill) => {
                      const st =
                        skillMastery?.[skill.id] ||
                        skill.defaultMastery ||
                        'not_started';
                      return (
                        <SkillMasteryBlock
                          key={skill.id}
                          skill={skill}
                          state={st}
                          onClick={() => onOpenCourse(course.id)}
                        />
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isEnrolled && (
                      <button
                        type="button"
                        onClick={() => onEnrollCourse(course.id)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold"
                      >
                        Enroll
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenCourse(course.id)}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold"
                    >
                      Open Course Mastery
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   KHAN ACADEMY-INSPIRED COURSE HOME & UNIT MASTERY VIEW
   - Deep Navy Course Banner with total Mastery Points (e.g., 130 / 300 pts)
   - Left Unit Sidebar with Unit Progress Bars & Visual Skill Mastery Blocks
   - Right Main Column with Unit Cards split into:
       * Left sub-column: Learn & Interactive Lab
       * Right sub-column: Practice & Unit Checkpoint
   ============================================================================ */
function CourseHomeView({
  course,
  allLessons,
  progress,
  submissions,
  skillMastery,
  isEnrolled,
  onEnroll,
  onBackToCourses,
  onLaunchLesson
}) {
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('all');

  const primaryLesson =
    allLessons.find((l) => l.id === course.primaryLessonId) || allLessons[0];
  const stats = computeCourseMasteryStats(course, skillMastery);

  const visibleUnits =
    selectedUnitFilter === 'all'
      ? course.units
      : course.units.filter((u) => u.id === selectedUnitFilter);

  return (
    <div className="space-y-6 pb-16" data-testid="course-home-view">
      {/* Khan Academy Deep Navy Course Mastery Banner */}
      <div className="ka-course-banner rounded-2xl p-6 md:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
          <button
            type="button"
            onClick={onBackToCourses}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Courses
          </button>

          <span>
            {course.classContext} · Instructor: {course.instructorName}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
              {course.gradeRange} · {course.subject}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              {course.badgeEmoji} {course.title}
            </h1>
            <p className="text-sm text-slate-200 leading-relaxed">
              {course.purpose}
            </p>
            <p className="text-xs text-indigo-200 pt-1">
              <strong>Accessible Overview:</strong> {course.accessibleOverview}
            </p>
          </div>

          {/* Course Mastery Points Counter Box */}
          <div className="rounded-xl bg-white/10 border border-white/15 p-4 min-w-[240px] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Course Mastery
              </span>
              <span className="text-sm font-extrabold text-amber-300 inline-flex items-center gap-1">
                <Crown className="w-4 h-4" /> {stats.earnedPoints} /{' '}
                {stats.totalPossiblePoints} pts
              </span>
            </div>

            <div
              role="progressbar"
              aria-valuenow={stats.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Course skill mastery"
              className="w-full h-2 bg-white/20 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-amber-400 transition-all"
                style={{ width: `${stats.percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-xs text-slate-200 font-semibold">
                {stats.percent}% Mastered
              </span>
              <button
                type="button"
                onClick={() => onLaunchLesson(primaryLesson)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold text-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Continue course
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Khan Academy Course Body: Left Unit Sidebar + Right Unit Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SIDEBAR: Unit Mastery Navigation & Crown Block Legend (4 cols) */}
        <aside
          aria-label="Course units and skill mastery blocks"
          className="lg:col-span-4 space-y-4"
        >
          <div className="surface-card bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Course Units ({course.units.length})
              </h2>
              {selectedUnitFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedUnitFilter('all')}
                  className="text-xs font-bold text-indigo-700 hover:underline"
                >
                  Show all units
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {course.units.map((unit) => {
                const unitSkills = (course.skills || []).filter(
                  (s) => s.unitId === unit.id
                );
                const isSelected = selectedUnitFilter === unit.id;

                return (
                  <div
                    key={unit.id}
                    className={`p-3 rounded-xl border transition ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-600'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedUnitFilter(isSelected ? 'all' : unit.id)
                      }
                      className="w-full text-left space-y-1.5"
                    >
                      <div className="text-[11px] font-bold text-indigo-700 uppercase">
                        Unit {unit.unitNumber}
                      </div>
                      <div className="text-xs font-extrabold text-slate-900">
                        {unit.title}
                      </div>
                    </button>

                    {/* Visual Skill Blocks for this Unit */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 mt-2 border-t border-slate-200/80">
                      {unitSkills.map((sk) => {
                        const st =
                          skillMastery?.[sk.id] ||
                          sk.defaultMastery ||
                          'not_started';
                        return (
                          <SkillMasteryBlock
                            key={sk.id}
                            skill={sk}
                            state={st}
                            onClick={() => onLaunchLesson(primaryLesson)}
                          />
                        );
                      })}
                      <span className="text-[11px] text-slate-500 ml-1">
                        100 pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mastery Block Legend */}
          <div className="surface-card bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5 text-xs">
            <div className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">
              Skill Mastery Levels
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(MASTERY_TIERS).map((tier) => (
                <div key={tier.id} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`mastery-block ${tier.blockClass} pointer-events-none`}
                  >
                    {tier.id === 'mastered'
                      ? '👑'
                      : tier.id === 'ready_to_review'
                      ? '✓'
                      : tier.id === 'practicing'
                      ? '◐'
                      : '·'}
                  </span>
                  <div>
                    <div className="font-bold text-slate-800 leading-tight">
                      {tier.label.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {tier.points} pts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN COLUMN: Khan Academy Two-Column Unit Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {visibleUnits.map((unit) => {
            const unitSkills = (course.skills || []).filter(
              (s) => s.unitId === unit.id
            );

            return (
              <section
                key={unit.id}
                aria-labelledby={`unit-heading-${unit.id}`}
                className="surface-card bg-white rounded-2xl border border-slate-200 overflow-hidden"
              >
                {/* Unit Header */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                      Unit {unit.unitNumber} of {course.units.length}
                    </span>
                    <h2
                      id={`unit-heading-${unit.id}`}
                      className="text-base md:text-lg font-extrabold text-slate-900"
                    >
                      {unit.title}
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      <strong>Learning Goal:</strong> {unit.learningGoal}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {unitSkills.map((sk) => {
                      const st =
                        skillMastery?.[sk.id] ||
                        sk.defaultMastery ||
                        'not_started';
                      return (
                        <SkillMasteryBlock
                          key={sk.id}
                          skill={sk}
                          state={st}
                          onClick={() => onLaunchLesson(primaryLesson)}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Khan Academy Two-Column Split inside Unit: Learn (Left) vs. Practice & Checkpoint (Right) */}
                <div className="divide-y divide-slate-200">
                  {unit.modules.map((mod) => {
                    const linkedLesson =
                      allLessons.find((l) => l.id === mod.lessonId) ||
                      primaryLesson;
                    const isDone = progress.completedLessonIds.includes(
                      linkedLesson.id
                    );
                    const sub =
                      submissions?.[mod.id] || submissions?.[linkedLesson.id];
                    const rowStatus =
                      sub?.status === 'needs_connection'
                        ? 'needs_connection'
                        : sub?.status === 'submitted'
                        ? 'submitted'
                        : isDone
                        ? 'mastered'
                        : 'continue';

                    return (
                      <div
                        key={mod.id}
                        className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
                      >
                        {/* Left Sub-Column: Learn & Interactive Visual Lab */}
                        <div className="space-y-2.5">
                          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                            Learn & Interactive Lab
                          </div>
                          <button
                            type="button"
                            onClick={() => onLaunchLesson(linkedLesson)}
                            className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50/60 flex items-start gap-3 transition"
                          >
                            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                            <div className="space-y-0.5 text-xs">
                              <div className="font-extrabold text-slate-900">
                                {mod.title}
                              </div>
                              <div className="text-slate-500">
                                Concept cards · Narrated audio · Interactive{' '}
                                {linkedLesson.manipulativeType}
                              </div>
                            </div>
                          </button>
                        </div>

                        {/* Right Sub-Column: Practice & Untimed Skill Checkpoint */}
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                              Practice & Checkpoint
                            </span>
                            <PurposefulStatusChip status={rowStatus} />
                          </div>

                          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5 text-xs">
                            <div className="font-bold text-slate-900">
                              {unit.title} Skill Check-In
                            </div>
                            <p className="text-slate-600">
                              {linkedLesson.questions?.length || 3} questions ·
                              Untimed · Step-by-step hints & Socratic tutor
                            </p>
                            <button
                              type="button"
                              onClick={() => onLaunchLesson(linkedLesson)}
                              className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs"
                            >
                              {isDone ? 'Practice again' : 'Start Practice'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
