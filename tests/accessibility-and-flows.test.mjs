import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_PROFILE,
  DEFAULT_CAPABILITIES,
  LEARNER_TOOL_BUNDLES,
  DISCOVERY_QUIZ_QUESTIONS,
  buildProfileFromQuizSelections,
  summarizeActiveToolsPlainText
} from '../src/data/quizMapping.js';
import {
  INITIAL_COURSES,
  INITIAL_CLASSROOMS,
  MASTERY_TIERS,
  computeCourseMasteryStats,
  validateAccessibilityChecklist,
  validateJoinCodeTransaction
} from '../src/data/coursesData.js';
import {
  EXPLICIT_AI_INTENTS,
  LUMINARE_COACHING_STYLES,
  LUMINARE_STARTER_PROMPTS,
  requestContextualModuleHelp,
  chatWithLuminare,
  generatePersonalizedStudyPlan
} from '../src/services/aiService.js';
import {
  DEMO_ACCOUNTS,
  registerWithEmailPassword,
  signInWithEmailPassword,
  syncUserWorkspaceToFirestore
} from '../src/services/firebaseService.js';
import {
  redactPII,
  enforceCheckpointGuard
} from '../server/apiMiddleware.js';

const rootDir = process.cwd();

test('Phase 1: Calm student shell uses Study, Modules, and Community navigation, integrates Progress inside Study & Course Home, and has Skip link + My tools', () => {
  const appSrc = fs.readFileSync(path.join(rootDir, 'src/App.jsx'), 'utf8');
  const toolbarSrc = fs.readFileSync(
    path.join(rootDir, 'src/components/AccessibilityToolbar.jsx'),
    'utf8'
  );

  // Skip to lesson content link for keyboard users
  assert.equal(
    appSrc.includes('Skip to lesson content') &&
      appSrc.includes('href="#main-content"'),
    true,
    'Student shell must include a visible-on-focus "Skip to lesson content" link targeting #main-content'
  );

  // Single persistent My tools button in the header
  assert.equal(
    appSrc.includes('<LearningToolsButton') &&
      toolbarSrc.includes('My tools'),
    true,
    'Student header must render the single persistent My tools disclosure button'
  );

  // Student header navigation uses Study, Modules, Community (Progress is inside Study & Course Home)
  const headerMatch = appSrc.match(/<header[\s\S]*?<\/header>/);
  assert.ok(headerMatch, 'Student header element must exist');
  const headerHtml = headerMatch[0];
  assert.equal(
    headerHtml.includes('Study') &&
      headerHtml.includes('Modules') &&
      headerHtml.includes('Community'),
    true,
    'Student navigation must expose Study, Modules, and Community'
  );
  assert.equal(
    headerHtml.includes('Educator') ||
      headerHtml.includes('Teacher') ||
      headerHtml.includes('Demo') ||
      headerHtml.includes('API'),
    false,
    'Student header must not contain teacher, admin, AI-key, or demo mode controls'
  );

  // Purposeful status chips never rely on color alone
  assert.equal(
    appSrc.includes('export function PurposefulStatusChip') &&
      appSrc.includes('data-testid="study-progress-summary"') &&
      appSrc.includes('data-testid="course-home-view"'),
    true,
    'App must provide PurposefulStatusChip, integrated Study progress summary, and CourseHomeView'
  );
});

test('Phase 2 & Phase 7: Course hierarchy has 1 launch + 1 expansion course per band (3 units each), and every launch module passes the 7-point Accessibility Quality Gate', () => {
  const bands = ['elementary', 'middle', 'high'];
  for (const band of bands) {
    const bandCourses = INITIAL_COURSES.filter((c) => c.schoolLevel === band);
    assert.equal(
      bandCourses.length,
      2,
      `School band "${band}" must have 1 launch course and 1 expansion course`
    );
    const launchCourse = bandCourses.find((c) => c.isLaunchCourse);
    const expansionCourse = bandCourses.find((c) => !c.isLaunchCourse);
    assert.ok(launchCourse, `Missing launch course for ${band}`);
    assert.ok(expansionCourse, `Missing expansion course for ${band}`);
    assert.equal(
      launchCourse.units.length,
      3,
      `Launch course "${launchCourse.title}" must have 3 units`
    );

    // Every unit across BOTH launch and expansion courses has a visible learning goal and complete accessible modules (zero empty units)
    for (const course of bandCourses) {
      assert.equal(course.units.length, 3, `Course "${course.title}" must have 3 units`);
      for (const unit of course.units) {
        assert.ok(
          unit.learningGoal && unit.learningGoal.length > 10,
          `Unit "${unit.title}" must have a visible learningGoal`
        );
        assert.ok(
          unit.modules.length >= 1,
          `Unit "${unit.title}" in "${course.title}" must have at least 1 playable module (no empty placeholder units)`
        );
        for (const mod of unit.modules) {
          const check = validateAccessibilityChecklist(mod.accessibilityChecklist);
          assert.equal(
            check.passed,
            true,
            `Module "${mod.title}" failed accessibility gate: ${check.missingItems.join(', ')}`
          );
        }
      }
    }
  }

  // Verify Khan Academy 4-tier Mastery Points calculation (0, 50, 80, 100 pts)
  assert.equal(MASTERY_TIERS.not_started.points, 0);
  assert.equal(MASTERY_TIERS.practicing.points, 50);
  assert.equal(MASTERY_TIERS.ready_to_review.points, 80);
  assert.equal(MASTERY_TIERS.mastered.points, 100);

  const stats = computeCourseMasteryStats(INITIAL_COURSES[0], {
    'skill-equal-parts': 'mastered',
    'skill-num-denom': 'ready_to_review',
    'skill-equiv-fractions': 'practicing'
  });
  assert.equal(stats.earnedPoints, 230);
  assert.equal(stats.totalPossiblePoints, 300);

  // Verify the Accessibility Quality Gate blocks incomplete modules
  const incompleteCheck = validateAccessibilityChecklist({
    plainLanguageObjective: 'Short',
    visualAltDescription: '',
    transcriptText: '',
    keyboardOperable: true,
    noColorOnlyInstruction: false,
    untimedAssessmentPath: true,
    hintsAndRetryAvailable: true
  });
  assert.equal(incompleteCheck.passed, false);
  assert.equal(incompleteCheck.missingItems.length, 4);
});

test('Phase 3: Firebase Foundations & Firestore/Storage Security Rules isolate student data and enforce role claims', () => {
  const firestoreRules = fs.readFileSync(
    path.join(rootDir, 'firestore.rules'),
    'utf8'
  );
  const storageRules = fs.readFileSync(
    path.join(rootDir, 'storage.rules'),
    'utf8'
  );
  const firebaseJson = fs.readFileSync(
    path.join(rootDir, 'firebase.json'),
    'utf8'
  );

  const requiredPaths = [
    'match /users/{uid}',
    'match /courseProgress/{courseId}',
    'match /submissions/{submissionId}',
    'match /courses/{courseId}',
    'match /units/{unitId}',
    'match /modules/{moduleId}',
    'match /classes/{classId}',
    'match /members/{memberUid}',
    'match /assignments/{assignmentId}',
    'match /aiThreads/{threadId}',
    'match /auditLogs/{eventId}'
  ];
  for (const p of requiredPaths) {
    assert.equal(
      firestoreRules.includes(p),
      true,
      `firestore.rules must define collection rule: ${p}`
    );
  }

  assert.equal(
    firestoreRules.includes('request.auth.token.role') &&
      firestoreRules.includes('isOwner(uid)'),
    true,
    'firestore.rules must enforce custom role claims and strict owner isolation on student progress/submissions'
  );
  assert.equal(
    storageRules.includes('match /courses/{courseId}/media/{allPaths=**}'),
    true,
    'storage.rules must protect course media and student submission attachments'
  );
  assert.equal(
    firebaseJson.includes('"emulators"'),
    true,
    'firebase.json must configure the Firebase Local Emulator Suite'
  );
});

test('Phase 4: Classroom join code transaction validates active codes and rejects expired, revoked, and malformed codes', () => {
  const validRes = validateJoinCodeTransaction('LUM-4829', INITIAL_CLASSROOMS);
  assert.equal(validRes.valid, true);
  assert.equal(validRes.classroom.name, 'Grade 4 Visual Math Studio');

  const expiredRes = validateJoinCodeTransaction('EXP-1001', INITIAL_CLASSROOMS);
  assert.equal(expiredRes.valid, false);
  assert.equal(expiredRes.reason, 'expired');

  const revokedRes = validateJoinCodeTransaction('REV-2002', INITIAL_CLASSROOMS);
  assert.equal(revokedRes.valid, false);
  assert.equal(revokedRes.reason, 'revoked');

  const malformedRes = validateJoinCodeTransaction('bad_code', INITIAL_CLASSROOMS);
  assert.equal(malformedRes.valid, false);
  assert.equal(malformedRes.reason, 'malformed');
});

test('Phase 5: Lesson chrome is simplified, downloadable transcript is available, and scoring has no artificial 85% floor', () => {
  const lessonPlayerSrc = fs.readFileSync(
    path.join(rootDir, 'src/components/LessonPlayer.jsx'),
    'utf8'
  );

  assert.equal(
    lessonPlayerSrc.includes('Take a calm break') &&
      lessonPlayerSrc.includes('Lesson outline') &&
      lessonPlayerSrc.includes('Where am I?') &&
      lessonPlayerSrc.includes('Open audio transcript') &&
      lessonPlayerSrc.includes('Download transcript (.txt)'),
    true,
    'LessonPlayer Tools menu must provide calm break, outline, Where am I?, audio transcript, and downloadable transcript (.txt)'
  );

  assert.equal(
    lessonPlayerSrc.includes('Math.max(finalScore, 85)'),
    false,
    'Artificial 85% minimum score floor must be removed'
  );
});

test('Phase 6: Inclusive contextual AI help offers the 6 explicit learner intents, blocks checkpoint answer leakage, and pairs AI with a non-AI worked example', async () => {
  const intentLabels = EXPLICIT_AI_INTENTS.map((i) => i.label);
  assert.deepEqual(intentLabels, [
    'Explain this another way',
    'Give me a hint',
    'Show a visual example',
    'Read this in simpler language',
    'Help me plan my next step',
    'Check my reasoning, without giving the answer'
  ]);

  const guard = enforceCheckpointGuard(
    'Base system prompt.',
    'Can you help me?',
    'checkpoint'
  );
  assert.equal(guard.isCheckpointGuarded, true);
  assert.equal(
    guard.systemPrompt.includes('NEVER reveal the correct option letter'),
    true,
    'Checkpoint guard must instruct the AI proxy never to reveal the final answer during checkpoints'
  );

  const helpResponse = await requestContextualModuleHelp({
    intentId: 'check_reasoning',
    stage: 'checkpoint',
    lesson: { title: 'Fractions & Fair Shares', gradeRange: 'Elementary' },
    question: {
      prompt: 'Which fraction is equivalent to 1/2?',
      literalPrompt: 'Select the fraction equal to 1/2.',
      hints: ['Multiply numerator and denominator by the same number.']
    },
    studentReasoning: 'I think 3 is half of 6 so 3/6 equals 1/2.',
    profile: DEFAULT_PROFILE,
    apiConfig: {}
  });

  assert.equal(helpResponse.checkpointAnswerBlocked, true);
  assert.ok(
    helpResponse.nonAiWorkedExample.includes('Non-AI Worked Example'),
    'Every contextual AI response must include a Non-AI Worked Example alternative'
  );
});

test('Phase 7 & Phase 8: Backend AI proxy redacts PII, Educator portal enforces auth + 4-tab IA, and offline submissions never falsely claim "submitted"', () => {
  const aiServiceSrc = fs.readFileSync(
    path.join(rootDir, 'src/services/aiService.js'),
    'utf8'
  );
  const teacherPortalSrc = fs.readFileSync(
    path.join(rootDir, 'src/components/TeacherAdminPortal.jsx'),
    'utf8'
  );
  const contextSrc = fs.readFileSync(
    path.join(rootDir, 'src/context/PlatformContext.jsx'),
    'utf8'
  );

  // Browser aiService never calls external LLM URLs directly
  assert.equal(
    aiServiceSrc.includes('https://api.openai.com') ||
      aiServiceSrc.includes('https://generativelanguage.googleapis.com'),
    false,
    'Browser aiService.js must never call external LLM endpoints directly'
  );
  assert.equal(
    aiServiceSrc.includes("'/api/ai-proxy'"),
    true,
    'Browser aiService.js must route AI requests through /api/ai-proxy'
  );

  // Server-side PII redaction
  const sanitized = redactPII(
    'My name is Jordan Lee and my email is jordan@school.org or 555-234-5678.'
  );
  assert.equal(sanitized.includes('jordan@school.org'), false);
  assert.equal(sanitized.includes('555-234-5678'), false);
  assert.equal(sanitized.includes('Jordan Lee'), false);

  // Teacher portal enforces authentication and provides Classes, Assignments, Content, Insights tabs
  assert.equal(
    teacherPortalSrc.includes('if (!isEducatorAuthenticated)') &&
      teacherPortalSrc.includes('Classes & Join Codes') &&
      teacherPortalSrc.includes('Assignments') &&
      teacherPortalSrc.includes('Content & Accessibility Gate') &&
      teacherPortalSrc.includes('Insights & Moderation'),
    true,
    'TeacherAdminPortal must enforce auth and provide Classes, Assignments, Content, and Insights tabs'
  );

  // Offline submission safety in PlatformContext
  assert.equal(
    contextSrc.includes("status: 'needs_connection'") &&
      contextSrc.includes('submitted: false'),
    true,
    'Offline module submission must record status as needs_connection and submitted: false rather than falsely claiming submitted'
  );
});

test('Phase 9: Design tokens, prefers-reduced-motion, and on-demand captions (auto default, null when silent) remain enforced', () => {
  assert.equal(DEFAULT_CAPABILITIES.captionDockPreference, 'auto');
  assert.equal(DEFAULT_CAPABILITIES.visualSoundCues, false);
  assert.equal(DEFAULT_PROFILE.hasChosenPreferences, false);

  const skippedProfile = buildProfileFromQuizSelections([], 'elementary', 'Alex');
  assert.equal(skippedProfile.hasChosenPreferences, false);

  const labels = LEARNER_TOOL_BUNDLES.map((b) => b.label);
  assert.deepEqual(labels, [
    'Calmer screen',
    'More reading space',
    'Step-by-step help',
    'Visual math models',
    'Bigger, clearer text',
    'Captions and slower speech'
  ]);

  for (const q of DISCOVERY_QUIZ_QUESTIONS) {
    const hasNotSure = q.options.some((o) => o.id.startsWith('not_sure_'));
    assert.equal(hasNotSure, true);
  }

  const summary = summarizeActiveToolsPlainText(DEFAULT_CAPABILITIES);
  assert.equal(
    summary.includes('visual models') && summary.includes('captions during speech'),
    true
  );

  const css = fs.readFileSync(path.join(rootDir, 'src/index.css'), 'utf8');
  assert.equal(css.includes('@media (prefers-reduced-motion: reduce)'), true);
  assert.equal(css.includes('.skip-to-content-link:focus'), true);
});

test('Phase 10: Email & password user authentication, Firebase Firestore document sync, and friendly "Luminare" AI companion tab work end-to-end', async () => {
  // 1. Pre-seeded demo accounts sign in with email & password
  assert.equal(DEMO_ACCOUNTS.length >= 4, true);
  const alexLogin = await signInWithEmailPassword({
    email: 'alex@luminalearn.org',
    password: 'Student123!'
  });
  assert.equal(alexLogin.ok, true);
  assert.equal(alexLogin.user.displayName, 'Alex Rivera');
  assert.equal(alexLogin.user.role, 'student');

  // Reject wrong password
  const badLogin = await signInWithEmailPassword({
    email: 'alex@luminalearn.org',
    password: 'WrongPassword'
  });
  assert.equal(badLogin.ok, false);

  // Register a brand new account with email & password
  const newReg = await registerWithEmailPassword({
    email: 'newlearner@luminalearn.org',
    password: 'SecurePass2026!',
    displayName: 'Sam Taylor',
    role: 'student',
    schoolLevel: 'middle'
  });
  assert.equal(newReg.ok, true);
  assert.equal(newReg.user.email, 'newlearner@luminalearn.org');
  assert.equal(newReg.user.schoolLevel, 'middle');

  // Sync user workspace to Firestore collections (/users/{uid}, /courseProgress, /submissions, /aiThreads)
  const syncRes = await syncUserWorkspaceToFirestore({
    user: newReg.user,
    profile: DEFAULT_PROFILE,
    enrolledCourseIds: ['course-mid-alg'],
    joinedClassIds: ['class-mid-7b'],
    skillMastery: { 'skill-variables-hanger': 'mastered' },
    lessonSessions: {},
    submissions: {},
    aiThreads: []
  });
  assert.equal(syncRes.ok, true);
  assert.equal(
    syncRes.collectionsUpdated.includes(`users/${newReg.user.uid}`),
    true
  );

  // 2. Verify Luminare AI companion tab, starter prompts, coaching styles, chat, and personalized study planner
  const appSrc = fs.readFileSync(path.join(rootDir, 'src/App.jsx'), 'utf8');
  const luminareSrc = fs.readFileSync(
    path.join(rootDir, 'src/components/LuminareView.jsx'),
    'utf8'
  );
  assert.equal(
    appSrc.includes("navigateTo('/luminare')") &&
      appSrc.includes('<LuminareView') &&
      luminareSrc.includes('data-testid="luminare-view"') &&
      luminareSrc.includes('apiConfig: aiConfig'),
    true,
    'App must expose the friendly Luminare tab and pass apiConfig: aiConfig without ReferenceError'
  );

  assert.equal(LUMINARE_COACHING_STYLES.length, 4);
  assert.equal(LUMINARE_STARTER_PROMPTS.length, 6);

  const chatReply = await chatWithLuminare({
    userMessage: 'Can you help me understand equivalent fractions with a cooking analogy?',
    coachingStyle: 'visual_analogy',
    activeCourse: INITIAL_COURSES[0],
    weakSkills: INITIAL_COURSES[0].skills,
    profile: DEFAULT_PROFILE,
    apiConfig: {}
  });
  assert.equal(chatReply.sender, 'luminare');
  assert.equal(Array.isArray(chatReply.suggestedFollowUps), true);
  assert.equal(chatReply.text.length > 20, true);

  // Verify Luminare's built-in math & equation Socratic solver
  const algebraReply = await chatWithLuminare({
    userMessage: 'Solve 2x + 4 = 10',
    coachingStyle: 'socratic',
    activeCourse: INITIAL_COURSES[2],
    weakSkills: INITIAL_COURSES[2].skills,
    profile: DEFAULT_PROFILE,
    apiConfig: {}
  });
  assert.equal(algebraReply.text.includes('x = 3'), true);

  const fractionReply = await chatWithLuminare({
    userMessage: 'Are 1/2 and 2/4 equivalent?',
    coachingStyle: 'socratic',
    activeCourse: INITIAL_COURSES[0],
    weakSkills: INITIAL_COURSES[0].skills,
    profile: DEFAULT_PROFILE,
    apiConfig: {}
  });
  assert.equal(fractionReply.text.includes('1/2') && fractionReply.text.includes('2/4'), true);

  const studyPlan = await generatePersonalizedStudyPlan({
    courses: INITIAL_COURSES,
    enrolledCourseIds: ['course-elem-math'],
    skillMastery: { 'skill-equal-parts': 'practicing' },
    profile: DEFAULT_PROFILE,
    customGoal: 'Master fractions this week',
    apiConfig: {}
  });
  assert.equal(studyPlan.prioritySkills.length > 0, true);
  assert.equal(studyPlan.dailyMicroGoals.length, 3);
});
