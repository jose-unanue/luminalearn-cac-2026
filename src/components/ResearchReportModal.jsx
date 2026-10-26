import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Layers,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Presentation,
  Play,
  Code2,
  Maximize2,
  Minimize2,
  Download
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { ACCESSIBILITY_PRESETS } from '../data/quizMapping';
import {
  PRESENTER_METADATA,
  CAC_PITCH_DECK_SLIDES
} from '../data/pitchDeckData';

export { PRESENTER_METADATA, CAC_PITCH_DECK_SLIDES };

const MARKET_PLATFORMS = [
  {
    name: 'Khan Academy & Khanmigo',
    focus: 'Mastery Learning & Socratic AI',
    extracted:
      'Asymmetric two-column Learner Home, 4-tier Crown Mastery blocks, progressive multi-step hints, Socratic AI explanations, and full transcripts.',
    gapResolved:
      'Added interactive visual math manipulatives, one-card-at-a-time micro-chunking, and 4 sensory/reading themes.'
  },
  {
    name: 'Duolingo',
    focus: 'Gamified Micro-Lessons',
    extracted:
      'One-card-at-a-time progressive disclosure, XP milestones, streaks, and comfortable touch targets.',
    gapResolved:
      'Removed punitive "Hearts" loss and countdown timers that trigger anxiety.'
  },
  {
    name: 'Prodigy Education',
    focus: 'Game-Based Math',
    extracted:
      'Low-friction preference discovery and framing math/science challenges inside an optional quest.',
    gapResolved:
      'Added Calmer Screen mode & Reduced Motion to eliminate sensory overload.'
  },
  {
    name: 'Microsoft Immersive Reader / Goalbook',
    focus: 'Assistive Reading & UDL Scaffolds',
    extracted:
      'Expanded letter/word spacing, Warm Paper overlay, Reading Line Guide, syllable splitting, and variable-speed TTS.',
    gapResolved:
      'Embedded natively across the entire K–12 curriculum rather than requiring separate browser extensions.'
  },
  {
    name: 'Seesaw & Canvas LMS',
    focus: 'Portfolio & Classroom Management',
    extracted:
      'Educator assignment workflows, recommended study modules, progress insights, and class discussions.',
    gapResolved:
      'Separated student learning space from educator administration and added 1-click discussion sentence starters.'
  }
];

const CLINICAL_STUDIES = [
  {
    learnerPreference: 'Calmer screen & Step-by-step help',
    researchDomain: 'Autism Spectrum & Predictability Research',
    citations: 'CAST UDL 3.0; W3C COGA; Valencia et al. (2019)',
    findings:
      'Predictable structure, low-glare palettes, reduced motion, and concrete literal wording lower cognitive friction and uncertainty anxiety.',
    implementedFeatures: [
      'Calmer screen pastel palette & automatic prefers-reduced-motion support',
      'Sticky progress bar with "Where am I?" context banner & gated completion',
      'Direct wording mode removing idioms/metaphors across lessons & AI prompts',
      'Always-available "Take a calm break" (Key: B) breathing reset modal'
    ]
  },
  {
    learnerPreference: 'Help me focus (Short cards & Focus mode)',
    researchDomain: 'Attention & Executive Function Research (ADHD)',
    citations:
      'Barkley (2015); Sonuga-Barke Dual Pathway Model; Sweller Cognitive Load Theory',
    findings:
      'Cluttered multi-column dashboards drain working memory. One-card-at-a-time progressive disclosure and immediate feedback sustain engagement.',
    implementedFeatures: [
      'One Primary Action per screen ("Continue learning" / "Next concept card")',
      'Focus mode that hides peripheral navigation and sidebars during active learning',
      'Pause & save + instant resume from the exact card or question checkpoint'
    ]
  },
  {
    learnerPreference: 'Captions and slower speech',
    researchDomain:
      'Deaf/Hard of Hearing (DHH) & Auditory Processing (APD) Research',
    citations:
      'ASHA Central Auditory Processing Guidelines; NIDCD; WCAG 2.2 AA/AAA',
    findings:
      'Learners with auditory processing differences benefit from slowed speech cadence (0.8x), zero competing background chimes, and synchronized visual text.',
    implementedFeatures: [
      'Movable, resizable, collapsible Caption & Full Transcript dock that never obscures focus',
      'Sentence-level boundary highlighting during Text-to-Speech with Pause/Resume/Replay',
      '0.8x slower voice speed & Visual Sound Alert banners'
    ]
  },
  {
    learnerPreference: 'Bigger, clearer text (High contrast)',
    researchDomain:
      'Low Vision, Color Vision Deficiency & Cortical Visual Impairment (CVI)',
    citations:
      'Roman-Lantzy (2018); NIH National Eye Institute; Braille Institute',
    findings:
      'High-contrast dark backgrounds with yellow/cyan borders reduce visual crowding, while redundant geometric symbols support colorblind learners.',
    implementedFeatures: [
      'High-contrast dark theme with bold yellow (#FACC15) & cyan (#38BDF8) outlines',
      'Atkinson Hyperlegible font & 100% / 115% / 130% one-click font scaling',
      'Redundant geometric symbols (◆, ▲, ●, ■, ✓, △) paired with all status colors'
    ]
  },
  {
    learnerPreference: 'More reading space & Visual math models',
    researchDomain: 'Reading (Dyslexia) & Number Sense (Dyscalculia) Research',
    citations:
      'Zorzi et al. (2012, PNAS); Shaywitz (2020); Butterworth (2005); Dehaene',
    findings:
      'Expanded letter/word spacing and warm paper tints improve reading accuracy, while concrete visual manipulatives connect symbols to magnitude.',
    implementedFeatures: [
      'Expanded letter (+0.065em) and word (+0.16em) spacing + Warm Paper tint (#F9F3E3)',
      'Movable Reading Line Guide + clickable syllable vocabulary chips',
      '6 interactive STEM visual manipulatives + color-coded step-by-step solutions'
    ]
  },
  {
    learnerPreference: 'Comfortable buttons & keyboard keys',
    researchDomain:
      'Motor Coordination (Dyspraxia / DCD) & WCAG 2.2 Input Standards',
    citations:
      'Blank et al. (2019); W3C WCAG 2.2 Target Size (2.5.8) & Dragging (2.5.7)',
    findings:
      'Fine-motor barriers are eliminated when all controls meet ≥24px (and optional 52px+ comfortable targets) with single-click and keyboard alternatives.',
    implementedFeatures: [
      '52px+ comfortable target mode & zero required drag-and-drop gestures',
      'Full keyboard navigation (Keys 1–4, Enter, H, R, B) with focus trapping in modals'
    ]
  }
];

export default function ResearchReportView({ onOpenQuiz, onLaunchLesson }) {
  const {
    applyPreset,
    returnToStudentLearning,
    navigateTo,
    setAuthModalOpen,
    allLessons,
    speakText
  } = usePlatform();

  const [subView, setSubView] = useState('pitch_deck'); // 'pitch_deck' | 'matrix' | 'evidence' | 'showcase'
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showPresenterNotes, setShowPresenterNotes] = useState(true);
  const [isFullscreenDeck, setIsFullscreenDeck] = useState(false);

  const currentSlide =
    CAC_PITCH_DECK_SLIDES[activeSlideIndex] || CAC_PITCH_DECK_SLIDES[0];

  useEffect(() => {
    if (subView !== 'pitch_deck') return undefined;
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'ArrowRight') {
        setActiveSlideIndex((prev) =>
          Math.min(CAC_PITCH_DECK_SLIDES.length - 1, prev + 1)
        );
      } else if (e.key === 'ArrowLeft') {
        setActiveSlideIndex((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [subView]);

  const handleSlideLiveAction = (slide) => {
    if (!slide) return;
    if (slide.liveActionType === 'route') {
      navigateTo(slide.liveActionTarget);
    } else if (slide.liveActionType === 'quiz' && onOpenQuiz) {
      returnToStudentLearning();
      setTimeout(() => onOpenQuiz(), 60);
    } else if (slide.liveActionType === 'auth') {
      setAuthModalOpen(true);
    } else if (slide.liveActionType === 'lesson' && onLaunchLesson) {
      const found =
        allLessons.find((l) => l.id === slide.liveActionTarget) ||
        allLessons[0];
      onLaunchLesson(found);
    }
  };

  return (
    <div className="space-y-6 pb-20" data-testid="research-report-view">
      {/* Demo / Research Header with Prominent "Return to learning" Control */}
      <div className="surface-card rounded-3xl bg-slate-900 text-white p-6 border-2 border-indigo-400/40 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs uppercase">
              Congressional App Challenge 2026 · {PRESENTER_METADATA.district} ·{' '}
              {PRESENTER_METADATA.schoolName}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-2">
              {PRESENTER_METADATA.projectName} — Live Pitch Deck, Architecture &
              Evidence
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-3xl">
              Presented by <strong>{PRESENTER_METADATA.presenterName}</strong> (
              {PRESENTER_METADATA.gradeLevel}, {PRESENTER_METADATA.schoolName},{' '}
              {PRESENTER_METADATA.district}). Structured in the 5-part
              Championship Presentation Format.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/LuminaLearn_CAC_2026_Pitch_Deck.pptx"
              download="LuminaLearn_CAC_2026_Pitch_Deck.pptx"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-xs"
            >
              <Download className="w-4 h-4" /> Download .pptx Deck
            </a>
            <button
              type="button"
              onClick={returnToStudentLearning}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Return to learning
            </button>
          </div>
        </div>

        {/* Demo Sub-Navigation */}
        <nav
          aria-label="Demo and research sections"
          className="flex flex-wrap gap-2 pt-2 border-t border-slate-800"
        >
          <button
            type="button"
            onClick={() => setSubView('pitch_deck')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              subView === 'pitch_deck'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Presentation className="w-4 h-4" /> 1. Live Pitch Deck & Demo
            Script (7 Slides)
          </button>
          <button
            type="button"
            onClick={() => setSubView('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              subView === 'matrix'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            2. Accommodation Matrix
          </button>
          <button
            type="button"
            onClick={() => setSubView('evidence')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              subView === 'evidence'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            3. Research Evidence & Market Comparison
          </button>
          <button
            type="button"
            onClick={() => setSubView('showcase')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              subView === 'showcase'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            4. Live Preset Switcher
          </button>
        </nav>
      </div>

      {/* ====================================================================
         SUBVIEW 0: INTERACTIVE WIDESCREEN PITCH DECK & LIVE DEMO LAUNCHER
         ==================================================================== */}
      {subView === 'pitch_deck' && (
        <div
          className={
            isFullscreenDeck
              ? 'fixed inset-0 z-50 bg-slate-950 p-4 md:p-8 overflow-y-auto space-y-4'
              : 'space-y-4'
          }
          data-testid="cac-pitch-deck"
        >
          {/* Slide Selector Strip */}
          <div className="surface-card bg-white rounded-2xl border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {CAC_PITCH_DECK_SLIDES.map((s, idx) => (
                <button
                  key={s.slideNumber}
                  type="button"
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                    idx === activeSlideIndex
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Slide {s.slideNumber}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <a
                href="/LuminaLearn_CAC_2026_Pitch_Deck.pptx"
                download="LuminaLearn_CAC_2026_Pitch_Deck.pptx"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 font-extrabold text-indigo-950"
              >
                <Download className="w-3.5 h-3.5" /> Export .pptx
              </a>
              <button
                type="button"
                onClick={() => setShowPresenterNotes((p) => !p)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-bold text-slate-700"
              >
                {showPresenterNotes
                  ? 'Hide Teleprompter Script'
                  : 'Show Teleprompter Script'}
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreenDeck((f) => !f)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold"
              >
                {isFullscreenDeck ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" /> Exit Fullscreen
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" /> Presentation Mode
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 16:9 WIDESCREEN SLIDE CANVAS */}
          <div
            className={`rounded-3xl border-2 overflow-hidden shadow-xl transition-all min-h-[460px] flex flex-col justify-between p-6 md:p-10 ${
              currentSlide.themeStyle === 'navy'
                ? 'ka-course-banner border-indigo-400/40 text-white'
                : 'surface-card bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Slide Top Bar: Section Badge + Timecode */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-current/15">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                      currentSlide.themeStyle === 'navy'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-indigo-100 text-indigo-950'
                    }`}
                  >
                    {currentSlide.sectionBadge}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      currentSlide.themeStyle === 'navy'
                        ? 'text-indigo-200'
                        : 'text-slate-500'
                    }`}
                  >
                    Slide {currentSlide.slideNumber} of{' '}
                    {CAC_PITCH_DECK_SLIDES.length}
                  </span>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                    currentSlide.themeStyle === 'navy'
                      ? 'bg-white/10 text-amber-300'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  ⏱ Video Timecode: {currentSlide.timecode}
                </span>
              </div>

              {/* Assertion Headline & Subtitle (Assertion-Evidence Principle) */}
              <div className="space-y-2 max-w-4xl">
                <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">
                  {currentSlide.assertionTitle}
                </h2>
                <p
                  className={`text-sm md:text-base leading-relaxed ${
                    currentSlide.themeStyle === 'navy'
                      ? currentSlide.slideNumber === 1
                        ? 'text-amber-300 font-extrabold'
                        : 'text-slate-200'
                      : 'text-slate-600'
                  }`}
                >
                  {currentSlide.subtitle}
                </p>
                {currentSlide.missionBanner && (
                  <div className="p-3 rounded-xl bg-white/10 border border-amber-400/50 text-xs md:text-sm text-white font-semibold">
                    {currentSlide.missionBanner}
                  </div>
                )}
              </div>

              {/* Visual Evidence Type A: 3 Key Metric Cards (Slides 1, 2, 7) */}
              {currentSlide.keyMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
                  {currentSlide.keyMetrics.map((m, idx) => (
                    <div
                      key={idx}
                      className={`rounded-2xl p-5 border space-y-2 ${
                        currentSlide.themeStyle === 'navy'
                          ? 'bg-white/10 border-white/15 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <div
                        className={`text-2xl md:text-3xl font-extrabold ${
                          currentSlide.themeStyle === 'navy'
                            ? 'text-amber-300'
                            : 'text-indigo-700'
                        }`}
                      >
                        {m.value}
                      </div>
                      <div className="font-extrabold text-sm">{m.label}</div>
                      <p
                        className={`text-xs leading-relaxed ${
                          currentSlide.themeStyle === 'navy'
                            ? 'text-slate-200'
                            : 'text-slate-600'
                        }`}
                      >
                        {m.detail}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Visual Evidence Type B: Two-Column Module Breakdown Cards (Slides 3, 4, 5) */}
              {currentSlide.moduleCards && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-3">
                  {currentSlide.moduleCards.map((mod, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl p-5 bg-slate-50 border border-slate-200 space-y-3 text-slate-900"
                    >
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-extrabold text-[11px] uppercase">
                        {mod.badge}
                      </span>
                      <h3 className="text-base md:text-lg font-extrabold text-slate-900">
                        {mod.title}
                      </h3>
                      <p className="text-xs font-semibold text-indigo-950 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100">
                        <strong>Purpose:</strong> {mod.purpose}
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {mod.highlights.map((h, hIdx) => (
                          <li key={hIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Visual Evidence Type C: Technical Architecture & Code Dive (Slide 6) */}
              {currentSlide.codeDiveBlocks && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3 items-start">
                  <div className="lg:col-span-7 space-y-3">
                    {currentSlide.codeDiveBlocks.map((blk, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl p-4 bg-white/10 border border-white/15 space-y-1.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-extrabold text-sm text-amber-300">
                            {blk.title}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-indigo-500/40 text-white text-[10px] font-bold">
                            {blk.badge}
                          </span>
                        </div>
                        <ul className="space-y-1 text-xs text-slate-200 list-disc pl-4">
                          {blk.points.map((pt, pIdx) => (
                            <li key={pIdx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-5 rounded-2xl bg-slate-950 border border-indigo-400/40 p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-amber-300 border-b border-slate-800 pb-2">
                      <span className="flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5" /> Code Dive:
                        server/apiMiddleware.js
                      </span>
                      <span>OWASP / FERPA Guard</span>
                    </div>
                    <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                      <code>{currentSlide.codeSnippet}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Slide Bottom Action Bar: Live Demo Jump Button + Prev/Next Slide Controls */}
            <div className="pt-6 mt-6 border-t border-current/15 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSlideLiveAction(currentSlide)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-sm transition ${
                    currentSlide.themeStyle === 'navy'
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>
                    Live Demo Action: {currentSlide.liveActionLabel}
                  </span>
                </button>

                <span
                  className={`text-[11px] font-bold ${
                    currentSlide.themeStyle === 'navy'
                      ? 'text-slate-300'
                      : 'text-slate-500'
                  }`}
                >
                  {PRESENTER_METADATA.presenterName} ·{' '}
                  {PRESENTER_METADATA.gradeLevel} ·{' '}
                  {PRESENTER_METADATA.schoolName} ({PRESENTER_METADATA.district})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activeSlideIndex === 0}
                  onClick={() =>
                    setActiveSlideIndex((prev) => Math.max(0, prev - 1))
                  }
                  className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-xl font-bold text-xs disabled:opacity-40 ${
                    currentSlide.themeStyle === 'navy'
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous Slide
                </button>

                <button
                  type="button"
                  disabled={
                    activeSlideIndex === CAC_PITCH_DECK_SLIDES.length - 1
                  }
                  onClick={() =>
                    setActiveSlideIndex((prev) =>
                      Math.min(CAC_PITCH_DECK_SLIDES.length - 1, prev + 1)
                    )
                  }
                  className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl font-extrabold text-xs disabled:opacity-40 ${
                    currentSlide.themeStyle === 'navy'
                      ? 'bg-indigo-500 hover:bg-indigo-400 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  Next Slide <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Presenter Teleprompter & Voiceover Script Box */}
          {showPresenterNotes && (
            <div className="surface-card bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-5 space-y-2 text-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  🎙️ Presenter Voiceover Script ({currentSlide.timecode})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    speakText(
                      currentSlide.presenterScript,
                      `Slide ${currentSlide.slideNumber} Presenter Narration`
                    )
                  }
                  className="px-3 py-1 rounded-lg bg-white border border-amber-400 text-amber-950 font-bold text-xs hover:bg-amber-100"
                >
                  🔊 Rehearse Narration Aloud
                </button>
              </div>
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {currentSlide.presenterScript}
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUBVIEW 1: ACCOMMODATION MATRIX */}
      {subView === 'matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CLINICAL_STUDIES.map((study, idx) => (
            <div
              key={idx}
              className="surface-card bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase text-indigo-700">
                    Learner Preference Label:
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900">
                    “{study.learnerPreference}”
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-bold text-[11px] shrink-0">
                  {study.researchDomain}
                </span>
              </div>
              <div className="text-[11px] font-bold text-slate-500">
                📚 Standards & Studies: {study.citations}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {study.findings}
              </p>
              <div className="space-y-1.5 pt-1">
                <div className="text-xs font-extrabold text-emerald-800">
                  ✓ Implemented in LuminaLearn:
                </div>
                {study.implementedFeatures.map((feat, fIdx) => (
                  <div
                    key={fIdx}
                    className="flex items-start gap-2 text-xs text-slate-800 font-medium"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBVIEW 2: RESEARCH EVIDENCE & MARKET ANALYSIS */}
      {subView === 'evidence' && (
        <div className="surface-card bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-extrabold text-slate-900">
              K–12 Learning Platform Market Analysis: Extracted Strengths &
              Resolved Gaps
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-600 uppercase">
                  <th className="py-3 px-3">Platform</th>
                  <th className="py-3 px-3">Primary Focus</th>
                  <th className="py-3 px-3">
                    Features Extracted into LuminaLearn
                  </th>
                  <th className="py-3 px-3">
                    Cognitive / Accessibility Gap Resolved
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {MARKET_PLATFORMS.map((p, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-extrabold text-slate-900">
                      {p.name}
                    </td>
                    <td className="py-3 px-3 text-indigo-700 font-bold">
                      {p.focus}
                    </td>
                    <td className="py-3 px-3 text-slate-700">{p.extracted}</td>
                    <td className="py-3 px-3 text-emerald-900 bg-emerald-50/50 font-medium">
                      {p.gapResolved}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBVIEW 3: PLATFORM SHOWCASE & STARTING-POINT PRESETS */}
      {subView === 'showcase' && (
        <div className="surface-card bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-extrabold text-slate-900">
              Interactive Showcase: Test Starting-Point Presets Live
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            Click any configurable starting-point preset below to preview how the
            entire platform adapts its typography, contrast, spacing, and lesson
            flow, then click “Return to learning” to test it in a lesson.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ACCESSIBILITY_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="font-extrabold text-sm text-slate-900">
                    {preset.icon} {preset.name}
                  </div>
                  <div className="text-[11px] font-bold text-indigo-700">
                    {preset.educatorResearchTag}
                  </div>
                  <p className="text-xs text-slate-600">{preset.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0"
                >
                  Preview Preset
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
