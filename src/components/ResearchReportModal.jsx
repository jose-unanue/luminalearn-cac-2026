import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Layers, ArrowLeft, Sparkles } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { ACCESSIBILITY_PRESETS } from '../data/quizMapping';

const MARKET_PLATFORMS = [
  {
    name: 'Khan Academy & Khanmigo',
    focus: 'Mastery Learning & Socratic AI',
    extracted: 'Progressive multi-step hints, non-punitive mastery, Socratic AI explanations, and full transcripts.',
    gapResolved: 'Added interactive visual math manipulatives and one-card-at-a-time micro-chunking.'
  },
  {
    name: 'Duolingo',
    focus: 'Gamified Micro-Lessons',
    extracted: 'One-card-at-a-time progressive disclosure, XP milestones, streaks, and comfortable touch targets.',
    gapResolved: 'Removed punitive "Hearts" loss and countdown timers that trigger anxiety.'
  },
  {
    name: 'Prodigy Education',
    focus: 'Game-Based Math',
    extracted: 'Low-friction preference discovery and framing math/science challenges inside an optional quest.',
    gapResolved: 'Added Calmer Screen mode & Reduced Motion to eliminate sensory overload.'
  },
  {
    name: 'Microsoft Immersive Reader / Goalbook',
    focus: 'Assistive Reading & UDL Scaffolds',
    extracted: 'Expanded letter/word spacing, Warm Paper overlay, Reading Line Guide, syllable splitting, and variable-speed TTS.',
    gapResolved: 'Embedded natively across the entire K–12 curriculum rather than requiring separate browser extensions.'
  },
  {
    name: 'Seesaw & Canvas LMS',
    focus: 'Portfolio & Classroom Management',
    extracted: 'Educator assignment workflows, recommended study modules, progress insights, and class discussions.',
    gapResolved: 'Separated student learning space from educator administration and added 1-click discussion sentence starters.'
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
    citations: 'Barkley (2015); Sonuga-Barke Dual Pathway Model; Sweller Cognitive Load Theory',
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
    researchDomain: 'Deaf/Hard of Hearing (DHH) & Auditory Processing (APD) Research',
    citations: 'ASHA Central Auditory Processing Guidelines; NIDCD; WCAG 2.2 AA/AAA',
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
    researchDomain: 'Low Vision, Color Vision Deficiency & Cortical Visual Impairment (CVI)',
    citations: 'Roman-Lantzy (2018); NIH National Eye Institute; Braille Institute',
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
    citations: 'Zorzi et al. (2012, PNAS); Shaywitz (2020); Butterworth (2005); Dehaene',
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
    researchDomain: 'Motor Coordination (Dyspraxia / DCD) & WCAG 2.2 Input Standards',
    citations: 'Blank et al. (2019); W3C WCAG 2.2 Target Size (2.5.8) & Dragging (2.5.7)',
    findings:
      'Fine-motor barriers are eliminated when all controls meet ≥24px (and optional 52px+ comfortable targets) with single-click and keyboard alternatives.',
    implementedFeatures: [
      '52px+ comfortable target mode & zero required drag-and-drop gestures',
      'Full keyboard navigation (Keys 1–4, Enter, H, R, B) with focus trapping in modals'
    ]
  }
];

export default function ResearchReportView() {
  const { applyPreset, returnToStudentLearning } = usePlatform();
  const [subView, setSubView] = useState('matrix'); // 'matrix' | 'evidence' | 'showcase'

  return (
    <div className="space-y-6 pb-20">
      {/* Demo / Research Header with Prominent "Return to learning" Control */}
      <div className="surface-card rounded-3xl bg-slate-900 text-white p-6 border-2 border-indigo-400/40 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs uppercase">
              Dedicated Demo & Judge Research Route (/demo/research)
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-2">
              LuminaLearn Research Evidence & Accommodation Matrix
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-3xl">
              Grounded in CAST UDL 3.0, W3C COGA, and WCAG 2.2. Kept on a dedicated demo route so the student learning space remains calm and distraction-free.
            </p>
          </div>
          <button
            type="button"
            onClick={returnToStudentLearning}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Return to learning
          </button>
        </div>

        {/* Demo Sub-Navigation */}
        <nav aria-label="Demo and research sections" className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setSubView('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              subView === 'matrix'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            1. Accommodation Matrix
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
            2. Research Evidence & Market Comparison
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
            3. Platform Showcase & Live Preset Switcher
          </button>
        </nav>
      </div>

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
              <p className="text-xs text-slate-700 leading-relaxed">{study.findings}</p>
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
              K–12 Learning Platform Market Analysis: Extracted Strengths & Resolved Gaps
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-600 uppercase">
                  <th className="py-3 px-3">Platform</th>
                  <th className="py-3 px-3">Primary Focus</th>
                  <th className="py-3 px-3">Features Extracted into LuminaLearn</th>
                  <th className="py-3 px-3">Cognitive / Accessibility Gap Resolved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {MARKET_PLATFORMS.map((p, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-extrabold text-slate-900">{p.name}</td>
                    <td className="py-3 px-3 text-indigo-700 font-bold">{p.focus}</td>
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
            Click any configurable starting-point preset below to preview how the entire platform adapts its typography, contrast, spacing, and lesson flow, then click “Return to learning” to test it in a lesson.
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
