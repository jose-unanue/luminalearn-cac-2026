import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Lightbulb,
  HelpCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sliders,
  Pause,
  Download,
  CloudOff,
  Check,
  Sparkles,
  BookOpen,
  X
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import InteractiveManipulatives from './VisualManipulatives';
import {
  EXPLICIT_AI_INTENTS,
  requestContextualModuleHelp,
  generateAnswerExplanation,
  generateStepByStepGuide
} from '../services/aiService';

export default function LessonPlayer({ lesson, onBack, onOpenToolsPanel }) {
  const {
    profile,
    aiConfig,
    speakText,
    stopSpeaking,
    triggerCue,
    recordLessonCompletion,
    addBonusXp,
    setCalmBreakOpen,
    lessonSessions,
    saveLessonSession,
    toggleCapability,
    courses,
    classrooms,
    joinedClassIds,
    submitModuleWork,
    submissions,
    isOffline,
    syncStatus
  } = usePlatform();

  const caps = profile.capabilities;
  const savedSession = lessonSessions?.byLessonId?.[lesson.id] || null;

  const parentCourse =
    courses?.find(
      (c) =>
        c.primaryLessonId === lesson.id ||
        c.units?.some((u) =>
          u.modules?.some((m) => m.lessonId === lesson.id || m.id === lesson.id)
        )
    ) || null;

  const moduleMeta =
    parentCourse?.units
      ?.flatMap((u) => u.modules || [])
      .find((m) => m.lessonId === lesson.id || m.id === lesson.id) || null;

  const activeClassroom = classrooms?.find(
    (c) => joinedClassIds?.includes(c.id) && c.courseId === parentCourse?.id
  );
  const isAiAllowedForCourse = activeClassroom
    ? activeClassroom.aiEnabled !== false
    : true;

  // Lesson Stages: 'concepts' (Learn & Apply) | 'practice' (Guided Practice & Checkpoint) | 'completed' (Review & Reflection)
  const [stage, setStage] = useState(
    savedSession?.stage && savedSession.stage !== 'completed'
      ? savedSession.stage
      : 'concepts'
  );
  const [activeCardIndex, setActiveCardIndex] = useState(
    savedSession?.activeCardIndex || 0
  );
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(
    savedSession?.activeQuestionIndex || 0
  );
  const [selectedVocab, setSelectedVocab] = useState(null);
  const [showManipulative, setShowManipulative] = useState(
    Boolean(caps.visualManipulatives)
  );
  const [showVisualDescription, setShowVisualDescription] = useState(false);

  // Contextual Lesson Tools Menu ("Take a calm break", "Lesson outline", "Where am I?", "Open audio transcript", "Download transcript (.txt)")
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const [showOutlinePanel, setShowOutlinePanel] = useState(false);
  const [showWhereAmIBanner, setShowWhereAmIBanner] = useState(false);

  // Practice & Checkpoint State
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(
    savedSession?.answeredQuestions || {}
  );

  // Post-Answer & Khanmigo-Style Socratic Sidebar State (Phase 6)
  const [aiExplanation, setAiExplanation] = useState('');
  const [stepByStepGuide, setStepByStepGuide] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const [contextualHelpOpen, setContextualHelpOpen] = useState(false);
  const [selectedIntentId, setSelectedIntentId] = useState(
    'explain_another_way'
  );
  const [studentReasoning, setStudentReasoning] = useState('');
  const [contextualHelpResult, setContextualHelpResult] = useState(null);
  const [teacherHelpRequested, setTeacherHelpRequested] = useState(false);

  // Phase 2 & 5: Learner Self-Reflection & Submission State
  const [selfReflection, setSelfReflection] = useState('solid');
  const [submissionFeedback, setSubmissionFeedback] = useState(null);

  const cards = lesson.microCards || [];
  const questions = lesson.questions || [];
  const currentCard = cards[activeCardIndex] || cards[0];
  const currentQuestion = questions[activeQuestionIndex] || questions[0];

  const isCheckpointQuestion = activeQuestionIndex === questions.length - 1;

  // Persist resumable session state whenever step changes
  useEffect(() => {
    saveLessonSession(lesson.id, {
      stage,
      activeCardIndex,
      activeQuestionIndex,
      answeredQuestions
    });
  }, [
    lesson.id,
    stage,
    activeCardIndex,
    activeQuestionIndex,
    answeredQuestions,
    saveLessonSession
  ]);

  // Auto-read aloud when card or question changes if student enabled autoReadAloud
  useEffect(() => {
    if (!caps.autoReadAloud) return;
    if (stage === 'concepts' && currentCard) {
      const textToRead =
        caps.literalLanguageMode && currentCard.literalText
          ? currentCard.literalText
          : currentCard.standardText;
      speakText(`${currentCard.title}. ${textToRead}`, 'Lesson Audio');
    } else if (stage === 'practice' && currentQuestion) {
      const qText =
        caps.literalLanguageMode && currentQuestion.literalPrompt
          ? currentQuestion.literalPrompt
          : currentQuestion.prompt;
      speakText(`Question ${activeQuestionIndex + 1}: ${qText}`, 'Check-In');
    }
    return () => stopSpeaking();
  }, [
    stage,
    activeCardIndex,
    activeQuestionIndex,
    caps.autoReadAloud,
    caps.literalLanguageMode
  ]);

  const handleReadCurrentCard = () => {
    if (!currentCard) return;
    const text =
      caps.literalLanguageMode && currentCard.literalText
        ? currentCard.literalText
        : currentCard.standardText;
    speakText(
      `${currentCard.title}. ${text}. Key takeaway: ${currentCard.visualCallout}`,
      'Lesson Audio'
    );
  };

  const handleDownloadTranscript = () => {
    const transcriptContent =
      moduleMeta?.accessibilityChecklist?.transcriptText ||
      cards
        .map(
          (c, idx) =>
            `Card ${idx + 1}: ${c.title}\n${c.standardText}\nPlain-Language Summary: ${c.literalText}\nKey Callout: ${c.visualCallout}`
        )
        .join('\n\n');

    if (typeof window !== 'undefined' && typeof Blob !== 'undefined') {
      const blob = new Blob([transcriptContent], {
        type: 'text/plain;charset=utf-8'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${lesson.id}-transcript.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setToolsMenuOpen(false);
  };

  // Phase 6: Run an Explicit Contextual AI Intent (with Checkpoint Answer-Leakage Protection)
  const handleRunContextualIntent = async (intentId) => {
    setSelectedIntentId(intentId);
    setLoadingAI(true);
    const activeStageName =
      stage === 'practice'
        ? isCheckpointQuestion
          ? 'checkpoint'
          : 'guided_practice'
        : 'learn';

    const result = await requestContextualModuleHelp({
      intentId,
      stage: activeStageName,
      lesson,
      card: stage === 'concepts' ? currentCard : null,
      question: stage === 'practice' ? currentQuestion : null,
      studentReasoning,
      profile,
      apiConfig: aiConfig
    });
    setContextualHelpResult(result);
    setLoadingAI(false);
  };

  const handleSelectOption = (idx) => {
    if (isSubmitted && answeredQuestions[activeQuestionIndex]?.isCorrect)
      return;
    setSelectedOption(idx);
  };

  const handleCheckAnswer = async () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    setIsSubmitted(true);

    setAnsweredQuestions((prev) => ({
      ...prev,
      [activeQuestionIndex]: {
        selectedIndex: selectedOption,
        isCorrect
      }
    }));

    if (isCorrect) {
      triggerCue(
        'success',
        'Correct Answer',
        currentQuestion.options[selectedOption]
      );
      addBonusXp(30);
    } else {
      triggerCue(
        'gentle-retry',
        'Try Again or View Hint',
        'Use a hint or step-by-step breakdown.'
      );
    }

    setLoadingAI(true);
    const exp = await generateAnswerExplanation({
      lesson,
      question: currentQuestion,
      selectedIndex: selectedOption,
      profile,
      apiConfig: aiConfig
    });
    setAiExplanation(exp);

    if (caps.colorCodedSteps || !isCorrect) {
      const steps = await generateStepByStepGuide({
        lesson,
        question: currentQuestion,
        profile,
        apiConfig: aiConfig
      });
      setStepByStepGuide(steps);
    }
    setLoadingAI(false);
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    setSelectedOption(null);
    setAiExplanation('');
  };

  const handleShowHint = () => {
    const nextHint = Math.min(
      hintLevel + 1,
      (currentQuestion.hints || []).length
    );
    setHintLevel(nextHint);
    triggerCue(
      'hint',
      `Hint ${nextHint}`,
      currentQuestion.hints?.[nextHint - 1] || ''
    );
  };

  // Phase 5: Accurate Lesson Score Calculation (No artificial 85% floor)
  const computeFinalScorePercent = (latestAnsweredMap) => {
    const total = questions.length;
    if (total === 0) return 100;
    let correctCount = 0;
    for (let i = 0; i < total; i += 1) {
      if (latestAnsweredMap[i]?.isCorrect) {
        correctCount += 1;
      }
    }
    return Math.round((correctCount / total) * 100);
  };

  const handleNextQuestion = () => {
    const updatedMap = {
      ...answeredQuestions,
      ...(selectedOption !== null
        ? {
            [activeQuestionIndex]: {
              selectedIndex: selectedOption,
              isCorrect: selectedOption === currentQuestion.correctIndex
            }
          }
        : {})
    };

    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setHintLevel(0);
      setAiExplanation('');
      setStepByStepGuide(null);
      setContextualHelpResult(null);
    } else {
      const finalScore = computeFinalScorePercent(updatedMap);
      recordLessonCompletion(lesson, finalScore);
      const outcome = submitModuleWork({
        moduleId: moduleMeta?.id || lesson.id,
        courseId: parentCourse?.id || 'course-elem-math',
        selfReflection,
        demonstratedMastery: finalScore >= 67,
        skillIds: moduleMeta?.skillIds || []
      });
      setSubmissionFeedback(outcome);
      setStage('completed');
    }
  };

  const handleSaveReflectionAndSubmit = () => {
    const finalScore = computeFinalScorePercent(answeredQuestions);
    const outcome = submitModuleWork({
      moduleId: moduleMeta?.id || lesson.id,
      courseId: parentCourse?.id || 'course-elem-math',
      selfReflection,
      demonstratedMastery: finalScore >= 67 && selfReflection !== 'needs_review',
      skillIds: moduleMeta?.skillIds || []
    });
    setSubmissionFeedback(outcome);
  };

  const totalStepsCount = cards.length + questions.length;
  const currentLinearStep =
    stage === 'concepts'
      ? activeCardIndex + 1
      : stage === 'practice'
      ? cards.length + activeQuestionIndex + 1
      : totalStepsCount;
  const progressPercent = Math.min(
    100,
    Math.round((currentLinearStep / Math.max(1, totalStepsCount)) * 100)
  );

  const stageSummaryText =
    stage === 'concepts'
      ? `Learn · Card ${activeCardIndex + 1} of ${cards.length}`
      : stage === 'practice'
      ? `${
          isCheckpointQuestion ? 'Checkpoint' : 'Guided practice'
        } · Question ${activeQuestionIndex + 1} of ${questions.length}`
      : `Review & Reflection · Complete`;

  const existingSubmission = submissions?.[moduleMeta?.id || lesson.id];

  return (
    <div className="space-y-5 pb-20">
      {/* ====================================================================
          PHASE 5: SIMPLIFIED TWO-ROW STICKY LESSON HEADER
          Row 1: [ ← Back ] + Breadcrumb/Title + Sync Pill + [ Tools ]
          Row 2: Stage · Step + Step Dots + [ Pause ] + Linear Progress Bar
          ==================================================================== */}
      <div className="surface-card rounded-xl bg-white p-4 border border-slate-200 sticky top-2 z-30">
        {/* Row 1 */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <div className="truncate">
              {parentCourse && (
                <span className="text-[11px] font-bold text-slate-500 hidden md:inline">
                  {parentCourse.title} ›{' '}
                </span>
              )}
              <h1 className="font-extrabold text-sm md:text-base text-slate-900 inline">
                {lesson.title}
              </h1>
            </div>
          </div>

          <div className="relative shrink-0 flex items-center gap-2">
            {/* Explicit Sync Status Pill (Phase 8) */}
            <span
              data-testid="module-sync-status"
              className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                isOffline || syncStatus === 'needs_connection'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : syncStatus === 'submitted' ||
                    existingSubmission?.status === 'submitted'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              {isOffline || syncStatus === 'needs_connection' ? (
                <>
                  <CloudOff className="w-3 h-3" /> Needs connection (saved locally)
                </>
              ) : syncStatus === 'submitted' ||
                existingSubmission?.status === 'submitted' ? (
                <>
                  <Check className="w-3 h-3" /> Submitted
                </>
              ) : (
                'Saved locally'
              )}
            </span>

            <button
              type="button"
              onClick={() => setToolsMenuOpen((prev) => !prev)}
              aria-expanded={toolsMenuOpen}
              aria-controls="lesson-contextual-tools-menu"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tools</span>
            </button>

            {toolsMenuOpen && (
              <div
                id="lesson-contextual-tools-menu"
                role="region"
                aria-label="Lesson tools menu"
                className="surface-card absolute right-0 top-10 w-64 rounded-xl bg-white border border-slate-300 shadow-lg p-2 z-40 space-y-1 text-xs"
              >
                <button
                  type="button"
                  onClick={() => {
                    setCalmBreakOpen(true);
                    setToolsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 font-bold text-slate-800 flex items-center justify-between"
                >
                  <span>Take a calm break</span>
                  <span aria-hidden="true">🌿</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowOutlinePanel((prev) => !prev);
                    setToolsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 font-bold text-slate-800 flex items-center justify-between"
                >
                  <span>
                    {showOutlinePanel ? 'Hide lesson outline' : 'Lesson outline'}
                  </span>
                  <span aria-hidden="true">🗺️</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowWhereAmIBanner((prev) => !prev);
                    setToolsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 font-bold text-slate-800 flex items-center justify-between"
                >
                  <span>Where am I?</span>
                  <span aria-hidden="true">🧭</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toggleCapability('captionDockPreference', 'transcript');
                    setToolsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 font-bold text-slate-800 flex items-center justify-between"
                >
                  <span>Open audio transcript</span>
                  <span aria-hidden="true">📜</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadTranscript}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 font-bold text-slate-800 flex items-center justify-between"
                >
                  <span>Download transcript (.txt)</span>
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                </button>

                {onOpenToolsPanel && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenToolsPanel();
                      setToolsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 font-bold text-indigo-700 border-t border-slate-100 pt-2 flex items-center justify-between"
                  >
                    <span>All learning preferences</span>
                    <span aria-hidden="true">⚙️</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Stage · Step + [ Pause ] */}
        <div className="flex items-center justify-between gap-3 mt-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <span>{stageSummaryText}</span>
            <span className="text-slate-400">·</span>
            <span className="text-indigo-700">{progressPercent}%</span>
          </div>

          <button
            type="button"
            onClick={() => setCalmBreakOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
          >
            <Pause className="w-3 h-3" /> Pause
          </button>
        </div>

        {/* Linear Progress Bar */}
        <div
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Lesson completion progress"
          className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2"
        >
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {showWhereAmIBanner && (
          <div
            role="status"
            className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-800 flex items-center justify-between gap-2"
          >
            <div>
              <span className="font-extrabold">Where you are:</span>{' '}
              {lesson.title} — {stageSummaryText}. Your progress is saved automatically.
            </div>
            <button
              type="button"
              onClick={() => setShowWhereAmIBanner(false)}
              className="px-2.5 py-1 rounded-md bg-white border border-slate-300 font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {showOutlinePanel && (
          <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-800">
                5-Stage Module Outline (Jump to any step)
              </span>
              <button
                type="button"
                onClick={() => setShowOutlinePanel(false)}
                className="font-bold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {cards.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setStage('concepts');
                    setActiveCardIndex(idx);
                    setShowOutlinePanel(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-md font-bold border ${
                    stage === 'concepts' && activeCardIndex === idx
                      ? 'bg-indigo-600 text-white border-indigo-700'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Card {idx + 1}: {c.title}
                </button>
              ))}
              {questions.map((q, qIdx) => {
                const answered = Boolean(answeredQuestions[qIdx]);
                const isCkpt = qIdx === questions.length - 1;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setStage('practice');
                      setActiveQuestionIndex(qIdx);
                      setShowOutlinePanel(false);
                    }}
                    className={`px-2.5 py-1.5 rounded-md font-bold border ${
                      stage === 'practice' && activeQuestionIndex === qIdx
                        ? 'bg-indigo-600 text-white border-indigo-700'
                        : answered
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    {isCkpt ? 'Checkpoint' : `Practice ${qIdx + 1}`}{' '}
                    {answered ? '✓' : ''}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ====================================================================
          MAIN KHAN ACADEMY SPLIT STAGE:
          - Left/Center Stage (8 cols when Socratic Tutor Sidebar is open, centered max-w-4xl when closed)
          - Right Socratic Tutor & Worked Example Sidebar (4 cols when open)
          ==================================================================== */}
      <div
        className={
          contextualHelpOpen
            ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'
            : 'max-w-4xl mx-auto space-y-5'
        }
      >
        <div className={contextualHelpOpen ? 'lg:col-span-7 space-y-5' : 'space-y-5'}>
          {/* STAGE 1: LEARN & APPLY */}
          {stage === 'concepts' && currentCard && (
            <div className="space-y-4">
              {/*Focused Micro-Card with Khan Academy Bottom Action Bar */}
              <div className="surface-card rounded-2xl bg-white border border-slate-200 overflow-hidden">
                <div className="p-6 md:p-8 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-bold">
                      Concept {activeCardIndex + 1} of {cards.length}
                    </span>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowManipulative(!showManipulative)}
                        aria-expanded={showManipulative}
                        className="font-bold text-indigo-700 hover:underline"
                      >
                        {showManipulative
                          ? 'Hide interactive lab'
                          : 'Show interactive lab'}
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadTranscript}
                        className="inline-flex items-center gap-1 font-bold text-slate-600 hover:text-slate-900 underline"
                      >
                        <Download className="w-3.5 h-3.5" /> Download transcript (.txt)
                      </button>
                    </div>
                  </div>

                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">
                    {currentCard.title}
                  </h2>

                  <p className="text-base md:text-lg text-slate-800 leading-relaxed max-w-2xl">
                    {caps.literalLanguageMode && currentCard.literalText
                      ? currentCard.literalText
                      : currentCard.standardText}
                  </p>

                  {/* Key Callout Box */}
                  <div className="rounded-xl bg-slate-50 border-l-4 border-indigo-600 p-4">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-800 mb-0.5">
                      Key Takeaway
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {currentCard.visualCallout}
                    </div>
                  </div>

                  {/* Interactive Visual Model / Apply Lab */}
                  {showManipulative && (
                    <div className="pt-2 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        {moduleMeta?.applyActivityPrompt && (
                          <span className="font-semibold text-indigo-900">
                            <strong>Try this:</strong>{' '}
                            {moduleMeta.applyActivityPrompt}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setShowVisualDescription(!showVisualDescription)
                          }
                          aria-expanded={showVisualDescription}
                          className="text-slate-500 hover:text-slate-800 underline"
                        >
                          {showVisualDescription
                            ? 'Hide visual alt description'
                            : 'Visual alt description'}
                        </button>
                      </div>

                      {showVisualDescription && (
                        <div
                          role="region"
                          aria-label="Visual model text description"
                          className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700"
                        >
                          <strong>Visual Description: </strong>
                          {moduleMeta?.accessibilityChecklist
                            ?.visualAltDescription ||
                            `Interactive ${lesson.manipulativeType} model with keyboard-operable step controls and numeric state labels.`}
                        </div>
                      )}

                      <InteractiveManipulatives
                        type={lesson.manipulativeType}
                        onSuccessCue={(msg) =>
                          triggerCue('success', 'Visual Model Match', msg)
                        }
                      />
                    </div>
                  )}

                  {/* Optional Vocabulary Strip */}
                  {!caps.focusShield && lesson.vocabulary?.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="text-xs font-bold text-slate-500">
                        Key vocabulary (click to hear & read syllables):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {lesson.vocabulary.map((v, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setSelectedVocab(v);
                              speakText(
                                `${v.term}. ${v.definition}`,
                                'Vocabulary'
                              );
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                              selectedVocab?.term === v.term
                                ? 'bg-indigo-600 text-white border-indigo-700'
                                : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {v.emoji} {v.term}{' '}
                            <span className="opacity-75 font-normal">
                              ({v.syllables})
                            </span>
                          </button>
                        ))}
                      </div>
                      {selectedVocab && (
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800">
                          <span className="font-extrabold">
                            {selectedVocab.term} ({selectedVocab.syllables}):
                          </span>{' '}
                          {selectedVocab.definition}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Khan Academy-Style Bottom Action Bar */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReadCurrentCard}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-indigo-600" /> Read aloud
                    </button>

                    <button
                      type="button"
                      onClick={() => setContextualHelpOpen((prev) => !prev)}
                      aria-expanded={contextualHelpOpen}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-950 font-bold text-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Ask
                      for help
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={activeCardIndex === 0}
                      onClick={() =>
                        setActiveCardIndex((prev) => Math.max(0, prev - 1))
                      }
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 text-slate-800 font-bold text-xs"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Previous
                    </button>

                    {activeCardIndex < cards.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setActiveCardIndex((prev) => prev + 1)}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs"
                      >
                        Next card <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setStage('practice')}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs"
                      >
                        Start Practice ({questions.length} questions){' '}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: GUIDED PRACTICE & CHECKPOINT ASSESSMENT */}
          {stage === 'practice' && currentQuestion && (
            <div className="surface-card rounded-2xl bg-white border border-slate-200 overflow-hidden">
              <div className="p-6 md:p-8 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-md font-bold ${
                        isCheckpointQuestion
                          ? 'bg-amber-100 text-amber-950'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {isCheckpointQuestion
                        ? `Checkpoint · Question ${activeQuestionIndex + 1} of ${questions.length}`
                        : `Practice · Question ${activeQuestionIndex + 1} of ${questions.length}`}
                    </span>
                    <span className="text-slate-500 font-semibold">
                      Untimed · Retries allowed
                    </span>
                  </div>
                </div>

                <h2 className="text-lg md:text-xl font-extrabold text-slate-900 leading-snug">
                  {caps.literalLanguageMode && currentQuestion.literalPrompt
                    ? currentQuestion.literalPrompt
                    : currentQuestion.prompt}
                </h2>

                {/* Khan Academy-Style Clean Choice Rows */}
                <div className="space-y-2.5">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrectChoice = idx === currentQuestion.correctIndex;

                    let btnStyle =
                      'bg-white border-slate-300 text-slate-900 hover:border-indigo-500';
                    if (isSelected && !isSubmitted) {
                      btnStyle =
                        'bg-indigo-50 border-indigo-600 text-indigo-950 ring-2 ring-indigo-200';
                    } else if (isSubmitted) {
                      if (isCorrectChoice) {
                        btnStyle =
                          'bg-emerald-50 border-emerald-600 text-emerald-950';
                      } else if (isSelected && !isCorrectChoice) {
                        btnStyle = 'bg-amber-50 border-amber-500 text-amber-950';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(idx)}
                        aria-pressed={isSelected}
                        className={`choice-option-btn w-full p-4 rounded-xl border-2 font-bold text-left text-sm transition flex items-center justify-between gap-3 ${btnStyle}`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full border border-current flex items-center justify-center text-xs font-extrabold shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </span>
                        {isSubmitted && isCorrectChoice && (
                          <span className="text-xs font-extrabold text-emerald-800">
                            ✓ Correct
                          </span>
                        )}
                        {isSubmitted && isSelected && !isCorrectChoice && (
                          <span className="text-xs font-extrabold text-amber-900">
                            Try again
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Progressive Hints */}
                {hintLevel > 0 && (
                  <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 space-y-1.5">
                    <div className="text-xs font-extrabold uppercase text-amber-900">
                      Hint ({hintLevel} of {(currentQuestion.hints || []).length})
                    </div>
                    {currentQuestion.hints.slice(0, hintLevel).map((h, i) => (
                      <p key={i} className="text-xs font-semibold text-amber-950">
                        • {h}
                      </p>
                    ))}
                  </div>
                )}

                {/* Post-Submission Explanation & Step-by-Step Guide */}
                {isSubmitted && (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">
                        {selectedOption === currentQuestion.correctIndex
                          ? '✓ Great work! Why this answer is right'
                          : '💡 Worked Example & Step-by-Step Breakdown'}
                      </span>
                      <div className="flex items-center gap-2">
                        {selectedOption !== currentQuestion.correctIndex && (
                          <button
                            type="button"
                            onClick={handleTryAgain}
                            className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs"
                          >
                            Try another choice
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            speakText(
                              aiExplanation || currentQuestion.explanation,
                              'Explanation'
                            )
                          }
                          className="px-2.5 py-1 rounded-md bg-white border border-slate-300 text-xs font-bold text-slate-800"
                        >
                          🔊 Read explanation
                        </button>
                      </div>
                    </div>

                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      {loadingAI
                        ? 'Preparing explanation...'
                        : aiExplanation || currentQuestion.explanation}
                    </p>

                    {(stepByStepGuide || currentQuestion.stepByStep) && (
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <div className="text-xs font-extrabold uppercase text-slate-600">
                          Step-by-Step Solution:
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                          {(stepByStepGuide || currentQuestion.stepByStep).map(
                            (step, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-lg border border-slate-200 bg-white text-xs space-y-1"
                              >
                                <div className="font-extrabold text-indigo-900">
                                  {step.label}
                                </div>
                                <div className="text-slate-700">{step.detail}</div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Khan Academy-Style Bottom Exercise Action Bar */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const qText =
                        caps.literalLanguageMode &&
                        currentQuestion.literalPrompt
                          ? currentQuestion.literalPrompt
                          : currentQuestion.prompt;
                      speakText(
                        `${qText}. Options: ${currentQuestion.options.join(', ')}`,
                        'Check-In'
                      );
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-indigo-600" /> Read
                    aloud
                  </button>

                  <button
                    type="button"
                    onClick={handleShowHint}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> Hint /
                    Show steps
                  </button>

                  <button
                    type="button"
                    onClick={() => setContextualHelpOpen((prev) => !prev)}
                    aria-expanded={contextualHelpOpen}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-950 font-bold text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Ask for
                    help
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStage('concepts')}
                    className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs"
                  >
                    Review cards
                  </button>

                  {!isSubmitted ? (
                    <button
                      type="button"
                      disabled={selectedOption === null}
                      onClick={handleCheckAnswer}
                      className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-extrabold text-xs"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="inline-flex items-center gap-1.5 px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs"
                    >
                      {activeQuestionIndex < questions.length - 1
                        ? 'Next question'
                        : 'Finish & View Mastery'}{' '}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: REVIEW, LEARNER SELF-REFLECTION & OFFLINE-SAFE SUBMISSION */}
          {stage === 'completed' && (
            <div className="surface-card rounded-2xl bg-white border border-slate-200 p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="text-4xl">{lesson.badgeEmoji || '🏆'}</div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-amber-100 text-amber-950 font-extrabold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Skill Level Updated
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {lesson.title}
                </h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Checkpoint accuracy:{' '}
                  <strong>{computeFinalScorePercent(answeredQuestions)}%</strong>.
                  Earned up to <strong>+100 Mastery Points</strong> toward your Course Crown.
                </p>
              </div>

              <div className="max-w-xl mx-auto rounded-xl bg-slate-50 border border-slate-200 p-5 space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Self-Reflection: How confident do you feel with this skill?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    {
                      id: 'can_explain',
                      label: 'I can explain this to a classmate',
                      tag: 'Mastered (100 pts 👑)'
                    },
                    {
                      id: 'solid',
                      label: 'I feel solid after practicing',
                      tag: 'Mastered (100 pts 👑)'
                    },
                    {
                      id: 'needs_review',
                      label: 'I would like more review on this skill',
                      tag: 'Proficient (80 pts)'
                    }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelfReflection(opt.id)}
                      aria-pressed={selfReflection === opt.id}
                      className={`p-3 rounded-lg border text-left font-bold transition ${
                        selfReflection === opt.id
                          ? 'bg-indigo-600 text-white border-indigo-700'
                          : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <div>{opt.label}</div>
                      <div
                        className={`text-[10px] mt-1 ${
                          selfReflection === opt.id
                            ? 'text-indigo-200'
                            : 'text-slate-500'
                        }`}
                      >
                        {opt.tag}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveReflectionAndSubmit}
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs"
                  >
                    {isOffline
                      ? 'Save draft locally (Offline)'
                      : 'Save reflection & submit'}
                  </button>

                  {submissionFeedback && (
                    <span
                      data-testid="submission-outcome-banner"
                      className={`text-xs font-bold ${
                        submissionFeedback.submitted
                          ? 'text-emerald-800'
                          : 'text-amber-900'
                      }`}
                    >
                      {submissionFeedback.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm"
                >
                  Return to Course & Study
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================
            KHANMIGO-INSPIRED RIGHT-HAND SOCRATIC TUTOR & WORKED EXAMPLE SIDEBAR
            Opens alongside the problem so the learner never loses their place!
            ================================================================== */}
        {contextualHelpOpen && (
          <aside
            aria-labelledby="contextual-help-heading"
            data-testid="contextual-ai-help-panel"
            className="lg:col-span-5 surface-card rounded-2xl bg-white border border-slate-200 overflow-hidden sticky top-24"
          >
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <h3
                  id="contextual-help-heading"
                  className="text-xs font-extrabold uppercase tracking-wider"
                >
                  Lumina Socratic Tutor & Worked Example
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setContextualHelpOpen(false)}
                aria-label="Close help sidebar"
                className="p-1 rounded-md hover:bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {stage === 'practice' && (
                <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 font-bold text-[11px]">
                  Checkpoint Guard Active: Direct answers are hidden so you build real mastery.
                </div>
              )}

              {!isAiAllowedForCourse ? (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-slate-700 space-y-1.5">
                  <p className="font-bold text-slate-900">
                    AI assistance is turned off for this class by your teacher.
                  </p>
                  <p>
                    Use the Non-AI Worked Example below or request teacher follow-up.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="font-bold text-slate-700">
                    Choose a Socratic prompt:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {EXPLICIT_AI_INTENTS.map((intent) => (
                      <button
                        key={intent.id}
                        type="button"
                        onClick={() => handleRunContextualIntent(intent.id)}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          selectedIntentId === intent.id && contextualHelpResult
                            ? 'bg-indigo-600 text-white border-indigo-700'
                            : 'bg-slate-50 hover:bg-indigo-50 text-slate-900 border-slate-200'
                        }`}
                      >
                        <div className="font-extrabold">{intent.label}</div>
                      </button>
                    ))}
                  </div>

                  {/* Reasoning Check Input */}
                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      value={studentReasoning}
                      onChange={(e) => setStudentReasoning(e.target.value)}
                      placeholder="Type your step to check reasoning..."
                      aria-label="Your current reasoning"
                      className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleRunContextualIntent('check_reasoning')}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600 text-white font-bold shrink-0"
                    >
                      Check
                    </button>
                  </div>

                  {/* Socratic Response Box */}
                  <div className="rounded-xl bg-indigo-50/70 border border-indigo-200 p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-indigo-950 uppercase tracking-wider text-[10px]">
                        AI-Generated Socratic Guidance
                      </span>
                      {contextualHelpResult?.text && (
                        <button
                          type="button"
                          onClick={() =>
                            speakText(contextualHelpResult.text, 'AI Help')
                          }
                          className="font-bold text-indigo-700 hover:underline"
                        >
                          🔊 Read aloud
                        </button>
                      )}
                    </div>
                    <p className="text-slate-800 whitespace-pre-line leading-relaxed">
                      {loadingAI
                        ? 'Thinking with you...'
                        : contextualHelpResult?.text ||
                          'Pick one of the prompts above for a hint, simpler wording, or reasoning check.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Always-Available Non-AI Worked Example & Teacher Help Request */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 font-extrabold text-slate-900 uppercase tracking-wider text-[10px]">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" /> Non-AI
                  Worked Example
                </div>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                  {contextualHelpResult?.nonAiWorkedExample ||
                    (stage === 'practice'
                      ? `1. Goal: ${
                          currentQuestion?.literalPrompt ||
                          currentQuestion?.prompt
                        }\n2. First Clue: ${
                          currentQuestion?.hints?.[0] ||
                          'Identify the given values.'
                        }`
                      : `Key Takeaway: ${currentCard?.visualCallout}`)}
                </p>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  {teacherHelpRequested ? (
                    <span className="font-bold text-emerald-800">
                      ✓ Sent to your teacher for follow-up
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setTeacherHelpRequested(true)}
                      className="px-2.5 py-1 rounded-md bg-white border border-slate-300 hover:bg-slate-100 font-bold text-slate-800"
                    >
                      Request teacher follow-up
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
