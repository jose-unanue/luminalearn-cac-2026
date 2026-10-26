import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Eye,
  X
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import {
  DISCOVERY_QUIZ_QUESTIONS,
  SCHOOL_RANGES
} from '../data/quizMapping';

export default function OnboardingQuizModal({ isOpen, onClose }) {
  const {
    rawStudentProfile,
    setProfile,
    applyQuizSelections,
    speakText
  } = usePlatform();

  // Phase 4: Initialize selectedOptions as an EMPTY array [] — never pre-seed a false profile!
  const [stepIndex, setStepIndex] = useState(0); // 0 = Grade Range, 1..N = Questions, N+1 = Summary
  const [studentName, setStudentName] = useState(rawStudentProfile.studentName || 'Alex');
  const [schoolLevel, setSchoolLevel] = useState(rawStudentProfile.schoolLevel || 'elementary');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [previewedOptionId, setPreviewedOptionId] = useState(null);

  const modalRef = useRef(null);
  const initialFocusRef = useRef(null);
  const previousActiveElementRef = useRef(null);
  const snapshotProfileRef = useRef(null);

  // WAI-ARIA Modal Dialog Pattern: Initial Focus, Focus Trap, Escape Handling, and Focus Return
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElementRef.current = document.activeElement;
    snapshotProfileRef.current = rawStudentProfile;
    setPreviewedOptionId(null);

    const focusTimer = setTimeout(() => {
      initialFocusRef.current?.focus();
    }, 30);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (snapshotProfileRef.current && previewedOptionId) {
          setProfile(snapshotProfileRef.current);
        }
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      if (
        previousActiveElementRef.current &&
        typeof previousActiveElementRef.current.focus === 'function'
      ) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const totalQuestions = DISCOVERY_QUIZ_QUESTIONS.length;
  const currentQuestion =
    stepIndex >= 1 && stepIndex <= totalQuestions
      ? DISCOVERY_QUIZ_QUESTIONS[stepIndex - 1]
      : null;

  const toggleOption = (optionId, allowMultiple = true) => {
    // If the student picks an "I'm not sure" option, clear other choices in this question
    const isNotSureOption = optionId.startsWith('not_sure_');
    const questionOptionIds = currentQuestion.options.map((o) => o.id);

    if (!allowMultiple || isNotSureOption) {
      setSelectedOptions((prev) => [
        ...prev.filter((id) => !questionOptionIds.includes(id)),
        optionId
      ]);
      return;
    }

    setSelectedOptions((prev) => {
      const cleaned = prev.filter((id) => !id.startsWith('not_sure_'));
      return cleaned.includes(optionId)
        ? cleaned.filter((id) => id !== optionId)
        : [...cleaned, optionId];
    });
  };

  // Phase 4: Live Preview of a support before permanently applying it
  const handlePreviewOption = (opt) => {
    if (previewedOptionId === opt.id) {
      // Restore snapshot
      if (snapshotProfileRef.current) {
        setProfile(snapshotProfileRef.current);
      }
      setPreviewedOptionId(null);
      return;
    }
    setPreviewedOptionId(opt.id);
    setProfile((prev) => ({
      ...prev,
      capabilities: {
        ...(snapshotProfileRef.current?.capabilities || prev.capabilities),
        ...opt.enables
      }
    }));
  };

  const handleSkipForNow = () => {
    if (snapshotProfileRef.current && previewedOptionId) {
      setProfile(snapshotProfileRef.current);
    }
    setProfile((prev) => ({
      ...prev,
      studentName: (studentName || 'Alex').trim(),
      schoolLevel,
      quizCompleted: true
    }));
    onClose();
  };

  const handleFinishQuiz = () => {
    setPreviewedOptionId(null);
    applyQuizSelections(selectedOptions, schoolLevel, studentName);
    setStepIndex(totalQuestions + 1);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-modal-title"
      aria-describedby="quiz-modal-desc"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        ref={modalRef}
        className="surface-card bg-white text-slate-900 rounded-3xl max-w-2xl w-full border-2 border-indigo-300 shadow-2xl overflow-hidden my-auto"
      >
        {/* Dialog Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between gap-3">
          <div>
            <h2 id="quiz-modal-title" className="text-lg font-extrabold">
              Choose How You Like to Learn
            </h2>
            <p id="quiz-modal-desc" className="text-xs text-slate-300">
              Pick any study tools you want to try, or skip and start learning right away.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSkipForNow}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
            >
              Skip for now
            </button>
            <button
              type="button"
              onClick={handleSkipForNow}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              aria-label="Close preference chooser"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="bg-indigo-50 px-6 py-2.5 border-b border-indigo-100 flex items-center justify-between gap-4 text-xs">
          <span className="font-bold text-indigo-950">
            {stepIndex === 0
              ? 'Step 1: Choose your grade range'
              : stepIndex <= totalQuestions
              ? `Question ${stepIndex} of ${totalQuestions}: ${currentQuestion.category}`
              : '✓ Your learning tools are ready'}
          </span>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {Array.from({ length: totalQuestions + 1 }).map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === stepIndex
                    ? 'w-6 bg-indigo-600'
                    : idx < stepIndex
                    ? 'w-2.5 bg-emerald-500'
                    : 'w-2.5 bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Dialog Body */}
        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {stepIndex === 0 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xl font-extrabold text-slate-900">
                  Which grade level would you like to explore first?
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    speakText(
                      'Choose Elementary, Middle School, or High School. You can click Start Learning Now to begin immediately, or answer 5 short questions to customize your tools.',
                      'Setup Guide'
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-200 text-xs font-bold"
                >
                  <Volume2 className="w-4 h-4" /> Read aloud
                </button>
              </div>

              <label className="block max-w-xs">
                <span className="text-xs font-bold text-slate-700">Your first name (optional):</span>
                <input
                  ref={initialFocusRef}
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="mt-1 w-full rounded-xl border-2 border-slate-300 px-3.5 py-2 text-sm font-bold text-slate-900"
                  placeholder="Alex"
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SCHOOL_RANGES.map((range) => {
                  const active = schoolLevel === range.id;
                  return (
                    <button
                      key={range.id}
                      type="button"
                      onClick={() => setSchoolLevel(range.id)}
                      aria-pressed={active}
                      className={`text-left p-4 rounded-2xl border-2 transition ${
                        active
                          ? 'border-indigo-600 bg-indigo-50/90 shadow-2xs'
                          : 'border-slate-200 bg-white hover:border-indigo-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{range.emoji}</div>
                      <div className="font-extrabold text-base text-slate-900">{range.label}</div>
                      <div className="text-xs font-bold text-indigo-700">{range.grades}</div>
                      <p className="text-xs text-slate-600 mt-1">{range.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {currentQuestion && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {currentQuestion.question}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Every choice explains what it changes right away. You can also preview it live!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    speakText(
                      `${currentQuestion.spokenPrompt} ${currentQuestion.options
                        .map((o) => `${o.text}. ${o.immediateResult}`)
                        .join(' ')}`,
                      'Preference Quiz'
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-200 text-xs font-bold shrink-0"
                >
                  <Volume2 className="w-4 h-4" /> Read aloud
                </button>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOptions.includes(opt.id);
                  const isPreviewed = previewedOptionId === opt.id;
                  const hasPreviewCapabilities = Object.keys(opt.enables || {}).length > 0;

                  return (
                    <div
                      key={opt.id}
                      className={`p-4 rounded-2xl border-2 transition ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/80'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          ref={idx === 0 ? initialFocusRef : null}
                          type="button"
                          onClick={() => toggleOption(opt.id, currentQuestion.allowMultiple)}
                          aria-pressed={isSelected}
                          className="text-left flex-1 flex items-start gap-3"
                        >
                          <span className="text-2xl shrink-0 mt-0.5">{opt.emoji}</span>
                          <div>
                            <div className="font-extrabold text-base text-slate-900">
                              {opt.text}
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                              <strong>Immediate result:</strong> {opt.immediateResult}
                            </p>
                          </div>
                        </button>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleOption(opt.id, currentQuestion.allowMultiple)}
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {isSelected ? '✓ Chosen' : 'Choose'}
                          </button>

                          {hasPreviewCapabilities && (
                            <button
                              type="button"
                              onClick={() => handlePreviewOption(opt)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                                isPreviewed
                                  ? 'bg-amber-400 text-slate-950 border-amber-500'
                                  : 'bg-white text-indigo-800 border-indigo-200 hover:bg-indigo-50'
                              }`}
                            >
                              <Eye className="w-3 h-3" />
                              {isPreviewed ? 'Previewing live' : 'Preview tool'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {stepIndex > totalQuestions && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-start gap-3.5">
                <span className="text-3xl">🌟</span>
                <div>
                  <h3 className="text-xl font-extrabold text-emerald-950">
                    Your Learning Workspace Is Ready!
                  </h3>
                  <p className="text-xs text-emerald-900 mt-1">
                    Here are the study preferences you chose. You can change any of them in one click from “My learning tools.”
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {rawStudentProfile.matchedReasons.map((reason, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dialog Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {stepIndex > 0 && stepIndex <= totalQuestions ? (
            <button
              type="button"
              onClick={() => setStepIndex(stepIndex - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSkipForNow}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
            >
              Skip & start learning now
            </button>
          )}

          <div className="flex items-center gap-2">
            {stepIndex === 0 && (
              <button
                type="button"
                onClick={() => setStepIndex(1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold text-sm hover:bg-indigo-500 shadow-xs"
              >
                Choose my learning tools (5 quick questions) <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {stepIndex >= 1 && stepIndex < totalQuestions && (
              <button
                type="button"
                onClick={() => setStepIndex(stepIndex + 1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold text-sm hover:bg-indigo-500 shadow-xs"
              >
                Next ({stepIndex}/{totalQuestions}) <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {stepIndex === totalQuestions && (
              <button
                type="button"
                onClick={handleFinishQuiz}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-500 shadow-xs"
              >
                <Sparkles className="w-4 h-4" /> Save My Learning Tools
              </button>
            )}

            {stepIndex > totalQuestions && (
              <button
                ref={initialFocusRef}
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold text-sm hover:bg-indigo-500 shadow-xs"
              >
                Start Learning <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
