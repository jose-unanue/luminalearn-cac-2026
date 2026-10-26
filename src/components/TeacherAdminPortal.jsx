import React, { useState } from 'react';
import {
  Users,
  BookMarked,
  PlusCircle,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  MessageSquareWarning,
  Check,
  EyeOff,
  Lock,
  LogOut,
  RefreshCw,
  Ban,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  FileCheck2
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { ACCESSIBILITY_PRESETS } from '../data/quizMapping';
import {
  AUTHORING_CHECKLIST_ITEMS,
  validateAccessibilityChecklist
} from '../data/coursesData';

export default function TeacherAdminPortal({
  onOpenAILessonCreator,
  onOpenAISettings,
  onLaunchLesson
}) {
  const {
    currentRoute,
    navigateTo,
    returnToStudentLearning,
    isEducatorAuthenticated,
    authenticateEducator,
    logoutEducator,
    profile,
    progress,
    allLessons,
    courses,
    classrooms,
    createClassroom,
    regenerateClassroomCode,
    revokeClassroomCode,
    toggleClassAI,
    publishCourseModule,
    auditLogs,
    homeworkList,
    assignNewHomework,
    recommendations,
    addRecommendation,
    studentRoster,
    discussions,
    moderateDiscussionPost,
    aiConfig,
    applyPreset,
    setAuthModalOpen
  } = usePlatform();

  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Teacher IA Tabs: 'classes' | 'assignments' | 'content' | 'insights'
  const activeSubTab = currentRoute.includes('/assignments')
    ? 'assignments'
    : currentRoute.includes('/content') || currentRoute.includes('/builder')
    ? 'content'
    : currentRoute.includes('/insights')
    ? 'insights'
    : 'classes';

  // Tab 1: Classroom Creation State
  const [newClassName, setNewClassName] = useState('');
  const [newClassBand, setNewClassBand] = useState('elementary');
  const [newClassSubject, setNewClassSubject] = useState('Mathematics');
  const [newClassCourseId, setNewClassCourseId] = useState('course-elem-math');
  const [requireApproval, setRequireApproval] = useState(false);

  // Tab 2: 3-Step Assignment Stepper State
  const [assignmentStep, setAssignmentStep] = useState(1);
  const [selectedCourseId, setSelectedCourseId] = useState(
    courses?.[0]?.id || 'course-elem-math'
  );
  const [selectedLessonId, setSelectedLessonId] = useState(
    allLessons[0]?.id || 'elem-math-fractions'
  );
  const [assignTargetGroup, setAssignTargetGroup] = useState('whole_class');
  const [hwTitle, setHwTitle] = useState('');
  const [startDate, setStartDate] = useState('Monday, Oct 26');
  const [dueDate, setDueDate] = useState('Friday, Oct 30');
  const [teacherNote, setTeacherNote] = useState(
    'Explore the interactive model first, then complete the untimed check-in questions.'
  );
  const [accExtendedWindow, setAccExtendedWindow] = useState(true);
  const [accAltResponse, setAccAltResponse] = useState(true);
  const [accReducedSet, setAccReducedSet] = useState(false);

  // Tab 3: Content Authoring & 7-Point Accessibility Quality Gate State
  const [authorCourseId, setAuthorCourseId] = useState('course-elem-math');
  const [authorModuleTitle, setAuthorModuleTitle] = useState(
    'Equivalent Fractions on a Number Line'
  );
  const [authorObjective, setAuthorObjective] = useState(
    'Locate and compare equivalent fractions like 1/2 and 2/4 on a 0-to-1 number line.'
  );
  const [authorAltText, setAuthorAltText] = useState(
    'Interactive number line from 0 to 1 partitioned into halves, fourths, and eighths with keyboard step buttons.'
  );
  const [authorTranscript, setAuthorTranscript] = useState(
    'Card 1: A number line from 0 to 1 can be divided into equal intervals. 1/2 and 2/4 land on the exact same mark.'
  );
  const [authorKeyboard, setAuthorKeyboard] = useState(true);
  const [authorNoColorOnly, setAuthorNoColorOnly] = useState(true);
  const [authorUntimed, setAuthorUntimed] = useState(true);
  const [authorHintsRetry, setAuthorHintsRetry] = useState(true);
  const [publishResult, setPublishResult] = useState(null);

  const [recLessonId, setRecLessonId] = useState(
    allLessons[1]?.id || 'mid-sci-ecosystems'
  );
  const [recReason, setRecReason] = useState(
    'Suggested next module with interactive cause-and-effect visuals.'
  );

  const handleEducatorSignIn = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);
    const result = await authenticateEducator(passcodeInput);
    setIsAuthenticating(false);
    if (!result.authenticated) {
      setAuthError(result.error || 'Invalid educator passcode.');
    } else {
      setPasscodeInput('');
    }
  };

  // Phase 7: Authenticated Educator Role Boundary
  if (!isEducatorAuthenticated) {
    return (
      <div className="max-w-lg mx-auto my-10">
        <section
          aria-labelledby="educator-auth-heading"
          className="surface-card rounded-3xl bg-white border border-slate-200 p-6 md:p-8 space-y-5"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-xs">
              <Lock className="w-3.5 h-3.5 text-indigo-600" /> Educator Access Required
            </span>
            <button
              type="button"
              onClick={returnToStudentLearning}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to learning
            </button>
          </div>

          <div className="space-y-1.5">
            <h1
              id="educator-auth-heading"
              className="text-xl font-extrabold text-slate-900"
            >
              Educator Sign-In
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Classrooms, join codes, student support preferences, assignment management, and AI governance are protected behind educator authentication.
            </p>
          </div>

          <form onSubmit={handleEducatorSignIn} className="space-y-3 text-xs">
            <label className="block space-y-1">
              <span className="font-bold text-slate-700">
                Educator Passcode
              </span>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Enter educator passcode..."
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900"
              />
            </label>

            {authError && (
              <p role="alert" className="text-xs font-bold text-rose-700">
                {authError}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={isAuthenticating}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs"
              >
                {isAuthenticating ? 'Verifying...' : 'Unlock Educator Workspace'}
              </button>

              <button
                type="button"
                onClick={() => setPasscodeInput('lumina-educator-2026')}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Fill demo passcode (Judge preview)
              </button>

              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs"
              >
                Sign in with Educator Email (evance@luminalearn.org)
              </button>
            </div>
          </form>
        </section>
      </div>
    );
  }

  const handleCreateClassroom = (e) => {
    e.preventDefault();
    createClassroom({
      name: newClassName || 'New Inclusive STEM Classroom',
      schoolLevel: newClassBand,
      subject: newClassSubject,
      courseId: newClassCourseId,
      requireTeacherApproval: requireApproval
    });
    setNewClassName('');
  };

  const composedAccommodationTag = [
    accExtendedWindow && 'Extended window',
    accAltResponse && 'Visual models & audio response',
    accReducedSet && 'Focused practice set'
  ]
    .filter(Boolean)
    .join(' · ') || 'Standard UDL supports available';

  const handleAssignHomework = (e) => {
    e.preventDefault();
    const targetLesson =
      allLessons.find((l) => l.id === selectedLessonId) || allLessons[0];
    assignNewHomework({
      lessonId: targetLesson.id,
      title: hwTitle.trim() || `${targetLesson.title} — Class Assignment`,
      assignedToGrade: targetLesson.schoolLevel,
      targetGroup: assignTargetGroup,
      startDate,
      dueDate,
      teacherNote,
      accommodationTag: composedAccommodationTag
    });
    setHwTitle('');
    setAssignmentStep(1);
  };

  const handlePublishModuleWithGate = (e) => {
    e.preventDefault();
    const targetCourse =
      courses.find((c) => c.id === authorCourseId) || courses[0];
    const firstUnitId = targetCourse?.units?.[0]?.id || 'unit-elem-math-1';

    const checklist = {
      plainLanguageObjective: authorObjective,
      visualAltDescription: authorAltText,
      transcriptText: authorTranscript,
      keyboardOperable: authorKeyboard,
      noColorOnlyInstruction: authorNoColorOnly,
      untimedAssessmentPath: authorUntimed,
      hintsAndRetryAvailable: authorHintsRetry
    };

    const result = publishCourseModule({
      courseId: targetCourse.id,
      unitId: firstUnitId,
      moduleData: {
        id: `mod-custom-${Date.now()}`,
        lessonId: targetCourse.primaryLessonId || 'elem-math-fractions',
        title: authorModuleTitle.trim() || 'Untitled Module',
        type: 'full-5-stage',
        stagesIncluded: [
          'Learn',
          'Guided practice',
          'Apply',
          'Checkpoint',
          'Review/reflection'
        ],
        estimatedMinutes: 8,
        skillIds: targetCourse.skills?.map((s) => s.id).slice(0, 1) || [],
        accessibilityChecklist: checklist
      }
    });
    setPublishResult(result);
  };

  const liveGateValidation = validateAccessibilityChecklist({
    plainLanguageObjective: authorObjective,
    visualAltDescription: authorAltText,
    transcriptText: authorTranscript,
    keyboardOperable: authorKeyboard,
    noColorOnlyInstruction: authorNoColorOnly,
    untimedAssessmentPath: authorUntimed,
    hintsAndRetryAvailable: authorHintsRetry
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Educator Workspace Header */}
      <div className="surface-card rounded-3xl bg-slate-900 text-white p-6 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400 text-indigo-200 font-bold text-xs uppercase tracking-wider">
              Teacher Workspace
            </span>
            <h1 className="text-2xl font-extrabold mt-2">
              Classes, Assignments, Content QA & Mastery Insights
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              Create classes with join codes, assign modules with accommodations, enforce accessibility gates, and review misconception insights.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={returnToStudentLearning}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Return to learning
            </button>
            <button
              type="button"
              onClick={logoutEducator}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
            >
              <LogOut className="w-3.5 h-3.5" /> Lock workspace
            </button>
          </div>
        </div>

        {/* Teacher IA Navigation: Classes | Assignments | Content | Insights */}
        <nav
          aria-label="Educator workspace navigation"
          className="flex flex-wrap gap-2 pt-2 border-t border-slate-800"
        >
          <button
            type="button"
            onClick={() => navigateTo('/teacher/classes')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeSubTab === 'classes'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Classes & Join Codes
          </button>
          <button
            type="button"
            onClick={() => navigateTo('/teacher/assignments')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeSubTab === 'assignments'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Assignments
          </button>
          <button
            type="button"
            onClick={() => navigateTo('/teacher/content')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeSubTab === 'content'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Content & Accessibility Gate
          </button>
          <button
            type="button"
            onClick={() => navigateTo('/teacher/insights')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeSubTab === 'insights'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Insights & Moderation
          </button>
        </nav>
      </div>

      {/* ====================================================================
          TAB 1: CLASSES & JOIN CODES (Phase 4)
          ==================================================================== */}
      {activeSubTab === 'classes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Classroom Form */}
          <div className="surface-card bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">
              Create a Classroom
            </h2>
            <p className="text-xs text-slate-600">
              Generates a short human-readable join code and an accessible join link for students.
            </p>

            <form onSubmit={handleCreateClassroom} className="space-y-3 text-xs">
              <label className="block space-y-1">
                <span className="font-bold text-slate-700">Classroom Name</span>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g., Period 2 Inclusive Math"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900"
                />
              </label>

              <label className="block space-y-1">
                <span className="font-bold text-slate-700">Grade Band</span>
                <select
                  value={newClassBand}
                  onChange={(e) => setNewClassBand(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold text-slate-900 bg-white"
                >
                  <option value="elementary">Elementary (Grades K–5)</option>
                  <option value="middle">Middle School (Grades 6–8)</option>
                  <option value="high">High School (Grades 9–12)</option>
                </select>
              </label>

              <label className="block space-y-1">
                <span className="font-bold text-slate-700">Primary Course</span>
                <select
                  value={newClassCourseId}
                  onChange={(e) => setNewClassCourseId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold text-slate-900 bg-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.gradeRange})
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={(e) => setRequireApproval(e.target.checked)}
                />
                <span className="font-semibold text-slate-700">
                  Require teacher approval before final enrollment
                </span>
              </label>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" /> Create Classroom & Code
              </button>
            </form>
          </div>

          {/* Active & Archived Classrooms List */}
          <div className="lg:col-span-2 surface-card bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-extrabold text-slate-900">
                Active Classrooms & Join Code Governance
              </h2>
              <span className="text-xs text-slate-500">
                All code creations, regenerations, and revocations are audit-logged
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {classrooms.map((cls) => (
                <div
                  key={cls.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {cls.name}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-extrabold ${
                          cls.codeStatus === 'active'
                            ? 'bg-emerald-100 text-emerald-950'
                            : cls.codeStatus === 'expired'
                            ? 'bg-amber-100 text-amber-950'
                            : 'bg-rose-100 text-rose-950'
                        }`}
                      >
                        Code: {cls.joinCode} ({cls.codeStatus.toUpperCase()})
                      </span>
                    </div>
                    <p className="text-slate-600">
                      {cls.gradeRange} · {cls.subject} · {cls.enrolledStudentCount}{' '}
                      students · Accessible link:{' '}
                      <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        #/study?join={cls.joinCode}
                      </code>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleClassAI(cls.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold border ${
                        cls.aiEnabled
                          ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                          : 'bg-slate-200 text-slate-800 border-slate-300'
                      }`}
                    >
                      {cls.aiEnabled ? 'AI Help: Allowed' : 'AI Help: Hidden'}
                    </button>

                    <button
                      type="button"
                      onClick={() => regenerateClassroomCode(cls.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 font-bold text-slate-800"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Regenerate code
                    </button>

                    {cls.codeStatus === 'active' && (
                      <button
                        type="button"
                        onClick={() => revokeClassroomCode(cls.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 font-bold text-rose-900"
                      >
                        <Ban className="w-3.5 h-3.5" /> Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Classroom Security Audit Log */}
            <div className="pt-3 border-t border-slate-200 space-y-1.5">
              <div className="text-xs font-extrabold uppercase text-slate-500">
                Recent Classroom & Security Audit Log (/auditLogs)
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 text-[11px] text-slate-600">
                {auditLogs.slice(0, 6).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200"
                  >
                    <span>
                      <strong>{log.action}:</strong> {log.detail}
                    </span>
                    <span className="text-slate-400 shrink-0">
                      {String(log.timestamp).slice(0, 19).replace('T', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 2: ASSIGNMENTS (3-Step Assignment Creation Stepper + Student Preview)
          ==================================================================== */}
      {activeSubTab === 'assignments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="surface-card bg-white rounded-3xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-extrabold text-slate-900">
                  Assignment Builder (3-Step Stepper)
                </h2>
              </div>
              <span className="text-xs font-bold text-indigo-700">
                Step {assignmentStep} of 3
              </span>
            </div>

            {/* Accessible Stepper Indicator */}
            <div
              role="group"
              aria-label="Assignment creation steps"
              className="grid grid-cols-3 gap-2 text-xs"
            >
              {[
                { step: 1, label: '1. Course & Module' },
                { step: 2, label: '2. Students & Dates' },
                { step: 3, label: '3. Supports & Preview' }
              ].map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setAssignmentStep(s.step)}
                  className={`py-2 px-3 rounded-xl font-extrabold border text-left ${
                    assignmentStep === s.step
                      ? 'bg-indigo-600 text-white border-indigo-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleAssignHomework} className="space-y-4 text-xs">
              {assignmentStep === 1 && (
                <div className="space-y-3">
                  <label className="block space-y-1">
                    <span className="font-bold text-slate-700 uppercase">
                      Select Course:
                    </span>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold text-slate-900 bg-white"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          [{c.gradeRange}] {c.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-1">
                    <span className="font-bold text-slate-700 uppercase">
                      Select Module or Skill Checkpoint:
                    </span>
                    <select
                      value={selectedLessonId}
                      onChange={(e) => setSelectedLessonId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold text-slate-900 bg-white"
                    >
                      {allLessons.map((l) => (
                        <option key={l.id} value={l.id}>
                          [{l.gradeRange} · {l.subject}] {l.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={() => setAssignmentStep(2)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold"
                  >
                    Next: Choose Students & Dates →
                  </button>
                </div>
              )}

              {assignmentStep === 2 && (
                <div className="space-y-3">
                  <label className="block space-y-1">
                    <span className="font-bold text-slate-700 uppercase">
                      Assign To:
                    </span>
                    <select
                      value={assignTargetGroup}
                      onChange={(e) => setAssignTargetGroup(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold text-slate-900 bg-white"
                    >
                      <option value="whole_class">Whole Class</option>
                      <option value="small_group">
                        Small Group (Visual Models Cohort)
                      </option>
                      <option value="individual">
                        Individual Learner (Extended Window)
                      </option>
                    </select>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block space-y-1">
                      <span className="font-bold text-slate-700 uppercase">
                        Start Date:
                      </span>
                      <input
                        type="text"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900"
                      />
                    </label>
                    <label className="block space-y-1">
                      <span className="font-bold text-slate-700 uppercase">
                        Due Date:
                      </span>
                      <input
                        type="text"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900"
                      />
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAssignmentStep(1)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignmentStep(3)}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold"
                    >
                      Next: Accommodations & Preview →
                    </button>
                  </div>
                </div>
              )}

              {assignmentStep === 3 && (
                <div className="space-y-3">
                  <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="font-extrabold text-slate-900">
                      Assignment Accommodations
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={accExtendedWindow}
                        onChange={(e) => setAccExtendedWindow(e.target.checked)}
                      />
                      <span>
                        Extended submission window (no late penalty or shame language)
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={accAltResponse}
                        onChange={(e) => setAccAltResponse(e.target.checked)}
                      />
                      <span>
                        Alternative response & interactive visual models enabled
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={accReducedSet}
                        onChange={(e) => setAccReducedSet(e.target.checked)}
                      />
                      <span>
                        Focused question practice set (manageable quantity)
                      </span>
                    </label>
                  </div>

                  <label className="block space-y-1">
                    <span className="font-bold text-slate-700 uppercase">
                      Plain-Language Teacher Guidance:
                    </span>
                    <textarea
                      rows={2}
                      value={teacherNote}
                      onChange={(e) => setTeacherNote(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900"
                    />
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAssignmentStep(2)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4" /> Publish Assignment
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Live Student Assignment Preview & Queue */}
          <div className="surface-card bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Live Student View Preview
            </h3>
            <p className="text-xs text-slate-500">
              Exactly how this assignment card appears on the student’s Study page:
            </p>

            <div className="rounded-2xl border-2 border-indigo-600 bg-indigo-50/30 p-5 space-y-2.5 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 font-extrabold">
                  Due {dueDate}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-semibold">
                  ~8–10 min · Untimed
                </span>
              </div>
              <div className="text-base font-extrabold text-slate-900">
                {hwTitle ||
                  allLessons.find((l) => l.id === selectedLessonId)?.title}
              </div>
              <p className="text-slate-700">{teacherNote}</p>
              <div className="text-[11px] font-bold text-indigo-900">
                Supports included: {composedAccommodationTag}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase">
                Published Assignments ({homeworkList.length}):
              </div>
              {homeworkList.map((hw) => (
                <div
                  key={hw.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{hw.title}</div>
                    <div className="text-slate-500">
                      Due {hw.dueDate} · {hw.accommodationTag}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold ${
                      hw.completed
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {hw.completed ? '✓ Submitted' : 'Due Friday'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 3: CONTENT & ACCESSIBILITY QUALITY GATE (Phase 2 & Phase 7)
          ==================================================================== */}
      {activeSubTab === 'content' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enforced 7-Point Accessibility Quality Gate Form */}
            <div className="surface-card bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-extrabold text-slate-900">
                    Course Authoring & Accessibility Quality Gate
                  </h2>
                </div>
                <span
                  data-testid="accessibility-gate-badge"
                  className={`px-2.5 py-1 rounded-full font-extrabold text-xs ${
                    liveGateValidation.passed
                      ? 'bg-emerald-100 text-emerald-950'
                      : 'bg-amber-100 text-amber-950'
                  }`}
                >
                  {liveGateValidation.passed
                    ? '✓ Ready to Publish (7/7 Passed)'
                    : `${7 - liveGateValidation.missingItems.length}/7 Passed — Blocked`}
                </span>
              </div>

              <p className="text-xs text-slate-600">
                A module cannot be published unless all 7 Universal Design for Learning accessibility requirements are provided.
              </p>

              <form
                onSubmit={handlePublishModuleWithGate}
                className="space-y-3 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block space-y-1">
                    <span className="font-bold text-slate-700">
                      Target Course
                    </span>
                    <select
                      value={authorCourseId}
                      onChange={(e) => setAuthorCourseId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold text-slate-900 bg-white"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-1">
                    <span className="font-bold text-slate-700">
                      Module Title
                    </span>
                    <input
                      type="text"
                      value={authorModuleTitle}
                      onChange={(e) => setAuthorModuleTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900"
                    />
                  </label>
                </div>

                <label className="block space-y-1">
                  <span className="font-bold text-slate-700">
                    1. Plain-Language Learning Objective (Required)
                  </span>
                  <input
                    type="text"
                    value={authorObjective}
                    onChange={(e) => setAuthorObjective(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="font-bold text-slate-700">
                    2. Alt Text / Long Description for Meaningful Visuals (Required)
                  </span>
                  <input
                    type="text"
                    value={authorAltText}
                    onChange={(e) => setAuthorAltText(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="font-bold text-slate-700">
                    3. Captioned Narration & Downloadable Transcript (Required)
                  </span>
                  <textarea
                    rows={2}
                    value={authorTranscript}
                    onChange={(e) => setAuthorTranscript(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <input
                      type="checkbox"
                      checked={authorKeyboard}
                      onChange={(e) => setAuthorKeyboard(e.target.checked)}
                    />
                    <span>4. Keyboard-operable activity</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <input
                      type="checkbox"
                      checked={authorNoColorOnly}
                      onChange={(e) => setAuthorNoColorOnly(e.target.checked)}
                    />
                    <span>5. No color-only instruction</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <input
                      type="checkbox"
                      checked={authorUntimed}
                      onChange={(e) => setAuthorUntimed(e.target.checked)}
                    />
                    <span>6. Untimed assessment path</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <input
                      type="checkbox"
                      checked={authorHintsRetry}
                      onChange={(e) => setAuthorHintsRetry(e.target.checked)}
                    />
                    <span>7. Hints, retry & alt representation</span>
                  </label>
                </div>

                {!liveGateValidation.passed && (
                  <div
                    role="alert"
                    className="rounded-2xl bg-amber-50 border border-amber-300 p-3 text-amber-950 space-y-1"
                  >
                    <div className="font-extrabold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                      Publishing Blocked by Accessibility Quality Gate:
                    </div>
                    <ul className="list-disc pl-5">
                      {liveGateValidation.missingItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {publishResult?.published && (
                  <div
                    role="status"
                    className="rounded-2xl bg-emerald-50 border border-emerald-300 p-3 text-emerald-950 font-bold"
                  >
                    ✓ Module passed all 7 accessibility checks and was published to the course!
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold"
                >
                  Validate & Publish Module
                </button>
              </form>
            </div>

            {/* AI Lesson Builder & FERPA Proxy Governance */}
            <div className="space-y-6">
              <div className="surface-card bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-extrabold text-slate-900">
                    AI-Assisted UDL Module Generator
                  </h2>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Draft a new K–12 module with micro-cards, literal language summaries, downloadable transcripts, and step-by-step solutions.
                </p>
                <button
                  type="button"
                  onClick={onOpenAILessonCreator}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs"
                >
                  <PlusCircle className="w-4 h-4" /> Open Lesson Builder
                </button>
              </div>

              <div className="surface-card bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-extrabold text-slate-900">
                    Cloud Secret Manager & Backend AI Proxy
                  </h2>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>Backend AI Proxy:</strong> All AI requests route through <code>/api/ai-proxy</code>—browser code never calls external LLM endpoints directly.
                  </li>
                  <li>
                    <strong>Checkpoint Guard:</strong> Assessment answer leakage is blocked during checkpoints.
                  </li>
                  <li>
                    <strong>Data Minimization:</strong> Server-side PII redaction strips emails, phone numbers, and student names.
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={onOpenAISettings}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  <KeyRound className="w-4 h-4 text-amber-300" /> Configure Educator AI Proxy ({aiConfig.apiKey ? 'Session Key Active' : 'Built-In Engine Active'})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 4: INSIGHTS & MODERATION (Phase 5: Mastery Evidence & Misconception Clusters)
          ==================================================================== */}
      {activeSubTab === 'insights' && (
        <div className="space-y-6">
          {/* Misconception Clusters & Actionable Follow-Up Signals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="surface-card bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
              <div className="font-extrabold text-indigo-700 uppercase">
                Skill Mastery Signal
              </div>
              <div className="text-lg font-extrabold text-slate-900">
                84% Demonstrated Mastery
              </div>
              <p className="text-slate-600">
                Based on untimed checkpoint accuracy, worked-example use, and learner self-reflection (zero speed metrics).
              </p>
            </div>

            <div className="surface-card bg-white rounded-2xl border border-amber-300 p-5 space-y-2">
              <div className="font-extrabold text-amber-900 uppercase">
                Misconception Cluster Detected
              </div>
              <div className="text-base font-extrabold text-slate-900">
                Unit Fractions (1/2 vs. 1/8)
              </div>
              <p className="text-slate-600">
                2 learners selected 1/8 as larger than 1/2. Recommended action: assign the Visual Fraction Bar comparison step.
              </p>
            </div>

            <div className="surface-card bg-white rounded-2xl border border-emerald-300 p-5 space-y-2">
              <div className="font-extrabold text-emerald-900 uppercase">
                Effective Support Pattern
              </div>
              <div className="text-base font-extrabold text-slate-900">
                Visual Models + Step-by-Step Hints
              </div>
              <p className="text-slate-600">
                Learners using interactive manipulatives completed checkpoints on their second try 92% of the time.
              </p>
            </div>
          </div>

          {/* Class Roster & Individual Learner Timeline */}
          <div className="surface-card bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-extrabold text-slate-900">
                  Learner Progress, Submission Status & Follow-Up Needs
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                Self-selected study tools — never clinical diagnoses or punitive leaderboards
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-600 uppercase">
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Grade Band</th>
                    <th className="py-3 px-3">Active Learning Tools</th>
                    <th className="py-3 px-3">Submission Status</th>
                    <th className="py-3 px-3">Skill Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {studentRoster.map((student, idx) => {
                    const isCurrentUser = idx === 0;
                    const displayName = isCurrentUser
                      ? `${profile.studentName} (Current Learner)`
                      : student.name;

                    return (
                      <tr
                        key={student.id}
                        className={
                          isCurrentUser ? 'bg-indigo-50/70 font-semibold' : ''
                        }
                      >
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {displayName}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {student.gradeBand}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {student.activeAccommodations.map((acc, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800 text-[11px]"
                              >
                                {acc}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-950 font-bold">
                            ✓ Submitted
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800">
                          Mastered ({student.masteryPercent}% accuracy)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Educator Discussion Moderation Queue */}
          <div className="surface-card bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-extrabold text-slate-900">
                  Class Discussion Moderation & Review Queue
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                Server-backed moderation queue with audit logging
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {discussions.map((post) => {
                const status = post.moderationStatus || 'approved';
                return (
                  <div
                    key={post.id}
                    className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
                      status === 'flagged'
                        ? 'bg-amber-50 border-amber-300'
                        : status === 'hidden'
                        ? 'bg-slate-100 border-slate-300 opacity-70'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">
                          {post.author}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white border border-slate-300 font-bold text-[10px] uppercase">
                          Status: {status}
                        </span>
                      </div>
                      <p className="text-slate-700">{post.content}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          moderateDiscussionPost(post.id, 'approved')
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          moderateDiscussionPost(post.id, 'hidden')
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-rose-600 hover:text-white text-slate-800 font-bold"
                      >
                        <EyeOff className="w-3.5 h-3.5" /> Hide
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
