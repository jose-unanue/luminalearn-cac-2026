import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sparkles,
  Send,
  Volume2,
  KeyRound,
  Compass,
  BookOpen,
  CheckCircle2,
  Play,
  RefreshCw,
  Wand2,
  MessageSquareHeart,
  ShieldCheck,
  Crown,
  Lightbulb,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { summarizeActiveToolsPlainText } from '../data/quizMapping';
import {
  LUMINARE_COACHING_STYLES,
  LUMINARE_STARTER_PROMPTS,
  detectProviderFromKey,
  testAiApiKeyConnection,
  chatWithLuminare,
  generatePersonalizedStudyPlan,
  generateCustomLessonWithAI
} from '../services/aiService';

const INTEREST_CHIPS = [
  { id: 'games', label: '🎮 Video Games & Blocks', value: 'Video Games and Building Blocks' },
  { id: 'space', label: '🚀 Space & Rockets', value: 'Space Exploration and Rockets' },
  { id: 'cooking', label: '🍕 Cooking & Baking', value: 'Cooking, Pizza Slices, and Baking' },
  { id: 'animals', label: '🐾 Animals & Nature', value: 'Wildlife and Ocean Animals' },
  { id: 'sports', label: '⚽ Sports & Motion', value: 'Soccer, Basketball, and Track' },
  { id: 'music', label: '🎨 Art & Music', value: 'Music Beats and Visual Art' }
];

const QUICK_TOPICS = [
  { label: 'Equivalent Fractions', subject: 'Mathematics' },
  { label: 'Solving Two-Step Equations', subject: 'Mathematics' },
  { label: 'Newton’s Laws of Motion', subject: 'Science' },
  { label: 'Photosynthesis & Cellular Energy', subject: 'Science' },
  { label: 'States of Matter & Phase Changes', subject: 'Science' },
  { label: 'Ratios & Coordinate Graphs', subject: 'Mathematics' }
];

export default function LuminareView({ onLaunchLesson }) {
  const {
    profile,
    courses,
    enrolledCourseIds,
    skillMastery,
    allLessons,
    addCustomLesson,
    aiConfig,
    setAiConfig,
    speakText,
    triggerCue,
    luminareMessages,
    setLuminareMessages,
    currentUser,
    setAuthModalOpen
  } = usePlatform();

  // 4 User-Friendly Workspace Modes: 'chat' | 'plan' | 'builder' | 'apikey'
  const [activeMode, setActiveMode] = useState('chat');
  const [coachingStyle, setCoachingStyle] = useState('socratic');

  // Focused Course Context
  const enrolledCourses = useMemo(() => {
    const list = courses.filter((c) => enrolledCourseIds.includes(c.id));
    return list.length > 0 ? list : courses;
  }, [courses, enrolledCourseIds]);

  const [selectedCourseId, setSelectedCourseId] = useState(
    enrolledCourses[0]?.id || courses[0]?.id || 'course-elem-math'
  );

  const activeCourse = useMemo(
    () =>
      courses.find((c) => c.id === selectedCourseId) ||
      enrolledCourses[0] ||
      courses[0],
    [courses, enrolledCourses, selectedCourseId]
  );

  const activeLesson = useMemo(
    () =>
      allLessons.find((l) => l.id === activeCourse?.primaryLessonId) ||
      allLessons[0],
    [allLessons, activeCourse]
  );

  // Identify practicing / not-started skills for the selected course
  const weakSkills = useMemo(() => {
    if (!activeCourse?.skills) return [];
    return activeCourse.skills.filter((s) => {
      const st = skillMastery?.[s.id] || s.defaultMastery || 'not_started';
      return st !== 'mastered';
    });
  }, [activeCourse, skillMastery]);

  // Chat Input State
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Personalized Study Plan State
  const [studyPlan, setStudyPlan] = useState(null);
  const [customPlanGoal, setCustomPlanGoal] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [checkedGoals, setCheckedGoals] = useState({});

  // Custom Mini-Lesson Builder State
  const [builderTopic, setBuilderTopic] = useState('');
  const [builderSubject, setBuilderSubject] = useState('Mathematics');
  const [builderBand, setBuilderBand] = useState(
    profile.schoolLevel || 'elementary'
  );
  const [builderInterest, setBuilderInterest] = useState(
    'Cooking, Pizza Slices, and Baking'
  );
  const [isBuildingLesson, setIsBuildingLesson] = useState(false);
  const [lastCreatedLesson, setLastCreatedLesson] = useState(null);

  // AI API Key Form State (alias apiConfig = aiConfig for consistency across services)
  const apiConfig = aiConfig;
  const [apiKeyInput, setApiKeyInput] = useState(aiConfig?.apiKey || '');
  const [providerInput, setProviderInput] = useState(
    aiConfig?.provider || 'auto'
  );
  const [modelInput, setModelInput] = useState(aiConfig?.model || '');
  const [rememberKeyInBrowser, setRememberKeyInBrowser] = useState(
    Boolean(aiConfig?.rememberInBrowser)
  );
  const [keyTestStatus, setKeyTestStatus] = useState(null);
  const [isTestingKey, setIsTestingKey] = useState(false);

  const chatEndRef = useRef(null);

  const detectedProvider = detectProviderFromKey(apiKeyInput, providerInput);
  const isLiveKeyConnected = Boolean((aiConfig?.apiKey || '').trim());

  // Scroll chat stream smoothly when new messages arrive
  useEffect(() => {
    if (activeMode === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [luminareMessages.length, isSendingChat, activeMode]);

  // Automatically generate initial Personalized Study Plan on first open or when course/key changes
  useEffect(() => {
    let cancelled = false;
    async function initPlan() {
      const plan = await generatePersonalizedStudyPlan({
        courses,
        enrolledCourseIds,
        skillMastery,
        profile,
        customGoal: '',
        apiConfig: aiConfig
      });
      if (!cancelled) {
        setStudyPlan(plan);
      }
    }
    initPlan();
    return () => {
      cancelled = true;
    };
  }, [enrolledCourseIds, skillMastery, profile.schoolLevel, aiConfig]);

  const handleSendMessage = async (explicitPrompt) => {
    const textToSend =
      typeof explicitPrompt === 'string' ? explicitPrompt : chatInput.trim();
    if (!textToSend || isSendingChat) return;

    const userMsg = {
      id: `usr-msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setLuminareMessages((prev) => [...prev, userMsg]);
    if (typeof explicitPrompt !== 'string') {
      setChatInput('');
    }
    setIsSendingChat(true);

    try {
      const replyMsg = await chatWithLuminare({
        userMessage: textToSend,
        coachingStyle,
        activeCourse,
        activeLesson,
        weakSkills,
        profile,
        apiConfig: aiConfig
      });
      setLuminareMessages((prev) => [...prev, replyMsg]);
      triggerCue('hint', 'Luminare replied', 'Tap Read aloud to listen.');
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleRefreshStudyPlan = async (e) => {
    if (e) e.preventDefault();
    setIsGeneratingPlan(true);
    try {
      const nextPlan = await generatePersonalizedStudyPlan({
        courses,
        enrolledCourseIds,
        skillMastery,
        profile,
        customGoal: customPlanGoal,
        apiConfig: aiConfig
      });
      setStudyPlan(nextPlan);
      triggerCue(
        'success',
        'Personalized Study Plan Updated',
        'Tailored to your Course Mastery blocks and active learning tools.'
      );
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleBuildMiniLesson = async (e) => {
    e.preventDefault();
    if (!builderTopic.trim() || isBuildingLesson) return;
    setIsBuildingLesson(true);
    try {
      const created = await generateCustomLessonWithAI({
        topic: builderTopic.trim(),
        subject: builderSubject,
        schoolLevel: builderBand,
        customInterest: builderInterest,
        profile,
        apiConfig: aiConfig
      });
      addCustomLesson(created);
      setLastCreatedLesson(created);
      triggerCue(
        'success',
        `Created: ${created.title}`,
        'Ready to launch in the interactive lesson player!'
      );
    } finally {
      setIsBuildingLesson(false);
    }
  };

  const handleSaveAndTestApiKey = async (e) => {
    e.preventDefault();
    setIsTestingKey(true);
    setKeyTestStatus(null);
    const nextConfig = {
      ...aiConfig,
      apiKey: apiKeyInput.trim(),
      provider: providerInput,
      model: modelInput.trim(),
      rememberInBrowser: rememberKeyInBrowser
    };
    setAiConfig(nextConfig);

    try {
      const result = await testAiApiKeyConnection(nextConfig);
      setKeyTestStatus(result);
      triggerCue('success', result.providerLabel, result.message);
    } finally {
      setIsTestingKey(false);
    }
  };

  return (
    <div className="space-y-6 pb-16" data-testid="luminare-view">
      {/* Top Friendly Luminare Companion Banner */}
      <div className="ka-course-banner rounded-2xl p-6 md:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4 max-w-2xl">
            <div
              aria-hidden="true"
              className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl font-extrabold shrink-0 shadow-md"
            >
              ✨
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-300">
                <span>Luminare · Friendly Socratic AI Companion</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                Hi {profile.studentName || 'Friend'}! How can we learn together
                today?
              </h1>
              <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                I adapt every explanation, hint, and custom mini-lesson to your
                active learning tools (
                <span className="text-amber-200 font-semibold">
                  {summarizeActiveToolsPlainText(profile)}
                </span>
                )—and I guide you step by step without spoiling answers!
              </p>
            </div>
          </div>

          {/* Right Status & Quick AI Key Connection Box */}
          <div className="rounded-xl bg-white/10 border border-white/15 p-4 min-w-[260px] space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                AI Engine Status
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-extrabold text-[11px] inline-flex items-center gap-1 ${
                  isLiveKeyConnected
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-amber-300 text-slate-950'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                {isLiveKeyConnected
                  ? `${detectProviderFromKey(
                      aiConfig.apiKey,
                      aiConfig.provider
                    ).toUpperCase()} Key Connected`
                  : 'Built-In Socratic Mode'}
              </span>
            </div>

            <p className="text-[11px] text-slate-200">
              {isLiveKeyConnected
                ? 'Using your connected AI API key for live personalized tutoring, study plans, and custom lessons.'
                : 'Running 100% free with Built-In Socratic UDL guidance, or connect an OpenAI / Gemini API key below.'}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveMode('apikey')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs"
              >
                <KeyRound className="w-3.5 h-3.5 text-indigo-700" />
                {isLiveKeyConnected
                  ? 'Manage AI Key & Style'
                  : 'Connect AI Key'}
              </button>

              {!currentUser && (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs"
                >
                  Sign in to save history
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Asymmetric Layout (Left Navigation & Context Rail + Right Workspace) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT RAIL (4 cols): 4 Friendly Modes + Course Focus + Coaching Style */}
        <aside
          aria-label="Luminare modes and personalization controls"
          className="lg:col-span-4 space-y-4"
        >
          {/* 1. Choose What to Do with Luminare */}
          <div className="surface-card bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              1. Choose a Helper Mode
            </h2>

            <nav aria-label="Luminare modes" className="space-y-1.5">
              {[
                {
                  id: 'chat',
                  icon: MessageSquareHeart,
                  label: 'Ask & Learn Together',
                  desc: 'Friendly step-by-step Socratic chat with 1-click starters'
                },
                {
                  id: 'plan',
                  icon: Compass,
                  label: 'My Personalized Study Plan',
                  desc: 'Custom roadmap built from your Course Mastery blocks'
                },
                {
                  id: 'builder',
                  icon: Wand2,
                  label: 'Create a Custom Mini-Lesson',
                  desc: 'Turn any topic + your favorite interest into a playable module'
                },
                {
                  id: 'apikey',
                  icon: KeyRound,
                  label: 'AI Key & Personalization Setup',
                  desc: 'Connect OpenAI / Gemini API keys & customize Luminare'
                }
              ].map((item) => {
                const IconComponent = item.icon;
                const isSelected = activeMode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveMode(item.id)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 ${
                      isSelected
                        ? 'bg-indigo-50/90 border-indigo-600 text-indigo-950'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <IconComponent
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        isSelected ? 'text-indigo-700' : 'text-slate-500'
                      }`}
                    />
                    <div>
                      <div className="font-extrabold text-xs">{item.label}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 2. Course Context Selector */}
          <div className="surface-card bg-white rounded-2xl border border-slate-200 p-4 space-y-3 text-xs">
            <label className="block space-y-1.5">
              <span className="font-extrabold uppercase tracking-wider text-slate-500">
                2. Course Focus
              </span>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold text-slate-900 bg-slate-50"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.badgeEmoji} {c.title} ({c.gradeRange})
                  </option>
                ))}
              </select>
            </label>

            {weakSkills.length > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                <div className="font-extrabold text-amber-950 text-[11px]">
                  Skills Ready to Level Up in This Course:
                </div>
                <ul className="space-y-1 text-[11px] text-slate-700">
                  {weakSkills.map((s) => (
                    <li key={s.id} className="flex items-center gap-1.5">
                      <span aria-hidden="true">🎯</span>
                      <span className="font-semibold">{s.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 3. How Should Luminare Coach You? */}
          <div className="surface-card bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5 text-xs">
            <h2 className="font-extrabold uppercase tracking-wider text-slate-500">
              3. Luminare’s Teaching Style
            </h2>
            <div className="space-y-1.5">
              {LUMINARE_COACHING_STYLES.map((style) => {
                const isSelected = coachingStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setCoachingStyle(style.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-950'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-extrabold flex items-center gap-1.5">
                      <span aria-hidden="true">{style.emoji}</span>
                      <span>{style.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {style.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN WORKSPACE (8 cols) */}
        <section
          aria-label="Luminare active workspace"
          className="lg:col-span-8 space-y-5"
        >
          {/* ================================================================
             MODE 1: SOCRATIC TUTOR CHAT WITH 1-CLICK STARTERS & READ ALOUD
             ================================================================ */}
          {activeMode === 'chat' && (
            <div className="surface-card bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
              {/* Chat Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span>💬 Ask & Learn with Luminare</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 text-[11px] font-bold">
                      {
                        LUMINARE_COACHING_STYLES.find(
                          (s) => s.id === coachingStyle
                        )?.label
                      }
                    </span>
                  </h2>
                  <p className="text-xs text-slate-600">
                    Tap a starter card below or type any question about{' '}
                    <strong>{activeCourse?.title}</strong>.
                  </p>
                </div>

                {luminareMessages.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setLuminareMessages((prev) => prev.slice(0, 1))
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Reset Chat
                  </button>
                )}
              </div>

              {/* 6 Zero-Blank-Page Starter Prompt Cards */}
              <div className="p-5 bg-slate-50/60 border-b border-slate-200 space-y-2.5">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Quick Starter Prompts (1-Click — No Typing Required):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {LUMINARE_STARTER_PROMPTS.map((starter) => (
                    <button
                      key={starter.id}
                      type="button"
                      onClick={() => handleSendMessage(starter.prompt)}
                      disabled={isSendingChat}
                      className="p-2.5 rounded-xl bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 text-left transition flex items-start gap-2 group"
                    >
                      <span className="text-base shrink-0" aria-hidden="true">
                        {starter.emoji}
                      </span>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-950 leading-snug">
                        {starter.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversation Stream */}
              <div
                aria-live="polite"
                className="p-6 space-y-4 max-h-[500px] overflow-y-auto"
              >
                {luminareMessages.map((msg) => {
                  const isLuminare = msg.sender === 'luminare';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isLuminare ? 'items-start' : 'items-end'
                      }`}
                    >
                      <div
                        className={`max-w-2xl rounded-2xl p-4 space-y-3 text-xs md:text-sm ${
                          isLuminare
                            ? 'bg-slate-50 border border-slate-200 text-slate-900'
                            : 'bg-indigo-600 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-extrabold text-xs flex items-center gap-1.5">
                            {isLuminare ? (
                              <>
                                <span aria-hidden="true">✨</span> Luminare
                                {msg.source && (
                                  <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900 text-[10px] uppercase">
                                    {msg.source}
                                  </span>
                                )}
                              </>
                            ) : (
                              <>You ({profile.studentName || 'Learner'})</>
                            )}
                          </span>

                          <div className="flex items-center gap-2">
                            {isLuminare && (
                              <button
                                type="button"
                                onClick={() =>
                                  speakText(msg.text, 'Luminare Tutor')
                                }
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-[11px]"
                              >
                                <Volume2 className="w-3 h-3 text-indigo-600" />{' '}
                                Read aloud
                              </button>
                            )}
                            <span
                              className={`text-[10px] ${
                                isLuminare
                                  ? 'text-slate-400'
                                  : 'text-indigo-200'
                              }`}
                            >
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>

                        <div className="whitespace-pre-line leading-relaxed">
                          {msg.text}
                        </div>

                        {/* Follow-up 1-click reply pills on Luminare messages */}
                        {isLuminare &&
                          Array.isArray(msg.suggestedFollowUps) &&
                          msg.suggestedFollowUps.length > 0 && (
                            <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-1.5">
                              {msg.suggestedFollowUps.map((followUp, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => handleSendMessage(followUp)}
                                  disabled={isSendingChat}
                                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold text-[11px] transition"
                                >
                                  {followUp} →
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })}

                {isSendingChat && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 inline-flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                    Luminare is crafting a step-by-step response...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Message Composer Footer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2.5"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Ask Luminare anything about ${
                    activeCourse?.title || 'your lesson'
                  }...`}
                  aria-label="Ask Luminare a question"
                  className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-xs md:text-sm font-semibold text-slate-900"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isSendingChat}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs md:text-sm disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              </form>
            </div>
          )}

          {/* ================================================================
             MODE 2: PERSONALIZED AI STUDY PLANNER
             ================================================================ */}
          {activeMode === 'plan' && (
            <div className="space-y-5">
              <div className="surface-card bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                      Personalized Learning Engine · Powered by Course Mastery &
                      UDL
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      🎯 {profile.studentName || 'Your'}’s Personalized Study
                      Roadmap
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={handleRefreshStudyPlan}
                    disabled={isGeneratingPlan}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        isGeneratingPlan ? 'animate-spin' : ''
                      }`}
                    />
                    {isGeneratingPlan
                      ? 'Building Plan...'
                      : 'Refresh with AI Key'}
                  </button>
                </div>

                {/* Custom Goal Input */}
                <form
                  onSubmit={handleRefreshStudyPlan}
                  className="flex flex-col sm:flex-row gap-2 pt-1"
                >
                  <input
                    type="text"
                    value={customPlanGoal}
                    onChange={(e) => setCustomPlanGoal(e.target.value)}
                    placeholder="Optional: Add a personal goal (e.g., 'Get ready for Friday's fractions checkpoint' or 'Understand velocity graphs')"
                    className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-slate-50"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0"
                  >
                    Tailor Plan
                  </button>
                </form>

                {/* Luminare's Personalized Summary Banner */}
                {studyPlan && (
                  <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-xs text-indigo-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-700" />
                        Luminare’s Recommendation ({studyPlan.supportStrategyUsed})
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          speakText(studyPlan.headline, 'Luminare Study Plan')
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-900 font-bold text-[11px]"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Read aloud
                      </button>
                    </div>
                    <p className="text-xs md:text-sm text-slate-800 leading-relaxed">
                      {studyPlan.headline}
                    </p>
                  </div>
                )}

                {/* Priority Skills to Level Up Next */}
                {studyPlan?.prioritySkills?.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Priority Skills to Earn Your Next Mastery Crown (100 pts 👑)
                    </h3>
                    <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                      {studyPlan.prioritySkills.map((item) => {
                        const targetLesson =
                          allLessons.find((l) => l.id === item.lessonId) ||
                          activeLesson;
                        return (
                          <div
                            key={item.skillId}
                            className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 font-extrabold text-[11px]">
                                  {item.currentPoints} / 100 pts
                                </span>
                                <span className="font-extrabold text-sm text-slate-900">
                                  {item.skillTitle}
                                </span>
                              </div>
                              <div className="text-xs text-slate-600">
                                {item.courseTitle} · {item.unitTitle}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMode('chat');
                                  handleSendMessage(
                                    `Coach me step by step on "${item.skillTitle}" from ${item.courseTitle}.`
                                  );
                                }}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                              >
                                Ask Luminare
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onLaunchLesson && onLaunchLesson(targetLesson)
                                }
                                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs"
                              >
                                <Play className="w-3 h-3 fill-current" /> Practice
                                Skill
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Today's 3 Bite-Sized Micro-Goals */}
                {studyPlan?.dailyMicroGoals && (
                  <div className="space-y-2.5 pt-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Today’s 3 Calm Micro-Goals (Check Off as You Go)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {studyPlan.dailyMicroGoals.map((goal) => {
                        const isDone = Boolean(checkedGoals[goal.id]);
                        return (
                          <button
                            key={goal.id}
                            type="button"
                            onClick={() =>
                              setCheckedGoals((prev) => ({
                                ...prev,
                                [goal.id]: !prev[goal.id]
                              }))
                            }
                            className={`p-3.5 rounded-xl border text-left transition space-y-1.5 ${
                              isDone
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                            }`}
                          >
                            <div className="font-extrabold text-xs flex items-center justify-between">
                              <span>{goal.step}</span>
                              <CheckCircle2
                                className={`w-4 h-4 ${
                                  isDone ? 'text-emerald-600' : 'text-slate-300'
                                }`}
                              />
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              {goal.detail}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================
             MODE 3: BUILD A CUSTOM INTEREST-ALIGNED MINI-LESSON
             ================================================================ */}
          {activeMode === 'builder' && (
            <div className="surface-card bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                  UDL Interest-Aligned Generator
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  🪄 Create a Custom Mini-Lesson with Luminare
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Pick any topic you need help with and connect it to your
                  favorite interest. Luminare will build an interactive,
                  playable lesson tailored to your grade band and learning tools!
                </p>
              </div>

              <form onSubmit={handleBuildMiniLesson} className="space-y-4 text-xs">
                {/* Step 1: Topic */}
                <div className="space-y-2">
                  <label className="block font-extrabold text-slate-800 uppercase">
                    1. What topic would you like to learn?
                  </label>
                  <input
                    type="text"
                    required
                    value={builderTopic}
                    onChange={(e) => setBuilderTopic(e.target.value)}
                    placeholder="e.g., Dividing Fractions, Gravity & Orbits, Balancing Equations..."
                    className="w-full rounded-xl border-2 border-slate-300 px-3.5 py-2.5 text-sm font-bold text-slate-900"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {QUICK_TOPICS.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setBuilderTopic(item.label);
                          setBuilderSubject(item.subject);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 font-bold text-[11px]"
                      >
                        + {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Subject & Grade Band */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block space-y-1">
                    <span className="font-extrabold text-slate-800 uppercase">
                      2. Subject Area
                    </span>
                    <select
                      value={builderSubject}
                      onChange={(e) => setBuilderSubject(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 font-bold text-slate-900 bg-white"
                    >
                      <option value="Mathematics">📐 Mathematics</option>
                      <option value="Science">🔬 Science</option>
                    </select>
                  </label>

                  <label className="block space-y-1">
                    <span className="font-extrabold text-slate-800 uppercase">
                      3. Grade Range
                    </span>
                    <select
                      value={builderBand}
                      onChange={(e) => setBuilderBand(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 font-bold text-slate-900 bg-white"
                    >
                      <option value="elementary">
                        🌱 Elementary (Grades K–5)
                      </option>
                      <option value="middle">
                        🧭 Middle School (Grades 6–8)
                      </option>
                      <option value="high">🚀 High School (Grades 9–12)</option>
                    </select>
                  </label>
                </div>

                {/* Step 3: Interest Theme Chips */}
                <div className="space-y-2">
                  <label className="block font-extrabold text-slate-800 uppercase">
                    4. Connect It to Something You Love (Interest Theme)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {INTEREST_CHIPS.map((chip) => {
                      const active = builderInterest === chip.value;
                      return (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => setBuilderInterest(chip.value)}
                          className={`p-2.5 rounded-xl border text-left font-bold transition ${
                            active
                              ? 'bg-indigo-50 border-indigo-600 text-indigo-950'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    value={builderInterest}
                    onChange={(e) => setBuilderInterest(e.target.value)}
                    placeholder="Or type any custom interest (e.g., Skateboarding, Minecraft, Dinosaurs)"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-slate-50"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={!builderTopic.trim() || isBuildingLesson}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs md:text-sm disabled:opacity-50"
                  >
                    <Wand2 className="w-4 h-4" />
                    {isBuildingLesson
                      ? 'Luminare is Building Your Lesson...'
                      : 'Build My Personalized Lesson'}
                  </button>
                </div>
              </form>

              {lastCreatedLesson && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-extrabold uppercase text-emerald-800">
                      Ready to Play · Passed 7-Point Accessibility Gate
                    </div>
                    <div className="font-extrabold text-sm text-slate-900">
                      {lastCreatedLesson.badgeEmoji} {lastCreatedLesson.title}
                    </div>
                    <p className="text-xs text-slate-700">
                      {lastCreatedLesson.subtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onLaunchLesson && onLaunchLesson(lastCreatedLesson)
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Launch Lesson
                    Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================================================================
             MODE 4: AI API KEY & PERSONALIZATION SETUP
             ================================================================ */}
          {activeMode === 'apikey' && (
            <div className="surface-card bg-white rounded-2xl border border-slate-200 p-6 space-y-5 text-xs">
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                  Personalized AI Configuration
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  🔑 Connect an AI API Key for Live Personalized Learning
                </h2>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Paste a Google Gemini (<code>AIza...</code>), OpenAI (
                  <code>sk-...</code>), or OpenRouter (<code>sk-or-...</code>)
                  API key below so Luminare can generate live custom lessons,
                  personalized study roadmaps, and Socratic explanations. All
                  requests route through LuminaLearn’s PII-redacting proxy (
                  <code>/api/ai-proxy</code>).
                </p>
              </div>

              <form onSubmit={handleSaveAndTestApiKey} className="space-y-4">
                <label className="block space-y-1">
                  <span className="font-extrabold text-slate-800 uppercase">
                    Your AI API Key (Google Gemini, OpenAI, or OpenRouter)
                  </span>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Paste AIzaSy... (Gemini) or sk-... (OpenAI)"
                    className="w-full rounded-xl border-2 border-slate-300 px-3.5 py-2.5 text-sm font-mono text-slate-900"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block space-y-1">
                    <span className="font-extrabold text-slate-800 uppercase">
                      AI Provider
                    </span>
                    <select
                      value={providerInput}
                      onChange={(e) => setProviderInput(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 font-bold text-slate-900 bg-white"
                    >
                      <option value="auto">
                        Auto-Detect ({detectedProvider.toUpperCase()})
                      </option>
                      <option value="gemini">Google Gemini API</option>
                      <option value="openai">OpenAI API</option>
                      <option value="openrouter">OpenRouter API</option>
                    </select>
                  </label>

                  <label className="block space-y-1">
                    <span className="font-extrabold text-slate-800 uppercase">
                      Model Name (Optional Override)
                    </span>
                    <input
                      type="text"
                      value={modelInput}
                      onChange={(e) => setModelInput(e.target.value)}
                      placeholder={
                        detectedProvider === 'gemini'
                          ? 'gemini-2.5-flash'
                          : 'gpt-4o-mini'
                      }
                      className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 font-mono text-slate-900"
                    />
                  </label>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberKeyInBrowser}
                    onChange={(e) => setRememberKeyInBrowser(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span className="font-semibold text-slate-700">
                    Remember my API key across page refreshes on this private
                    device
                  </span>
                </label>

                {keyTestStatus && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1">
                    <div className="font-extrabold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>{keyTestStatus.providerLabel}</span>
                    </div>
                    <p className="text-[11px] text-slate-700">
                      {keyTestStatus.message}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setApiKeyInput('');
                      setAiConfig({
                        ...aiConfig,
                        apiKey: '',
                        provider: 'auto',
                        model: '',
                        rememberInBrowser: false
                      });
                      setKeyTestStatus({
                        ok: true,
                        providerLabel: 'Built-In Luminare Socratic Mode Active',
                        message:
                          'Cleared external API key. Using Built-In Socratic UDL Tutor.'
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Use Free Built-In Socratic AI
                  </button>

                  <button
                    type="submit"
                    disabled={isTestingKey}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isTestingKey
                      ? 'Testing & Saving Key...'
                      : 'Save & Test AI Key'}
                  </button>
                </div>
              </form>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  How Luminare Protects Student Privacy & Academic Integrity:
                </div>
                <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-600">
                  <li>
                    <strong>PII Redaction:</strong> Student emails, phone
                    numbers, and full names are automatically scrubbed before any
                    prompt leaves the browser.
                  </li>
                  <li>
                    <strong>Checkpoint Guardrail:</strong> During graded
                    checkpoints, Luminare never gives away the multiple-choice
                    answer—it coaches you Socratically.
                  </li>
                  <li>
                    <strong>UDL Personalization:</strong> Luminare automatically
                    formats responses to match your active reading, sensory, and
                    focus preferences.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
