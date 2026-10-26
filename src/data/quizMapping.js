/**
 * Learner-Owned Preferences & Configurable Support Mapping Engine
 *
 * Phases 1–6 Alignment:
 * - Supports are learner preferences, not diagnostic labels.
 * - `captionDockPreference` defaults to `'auto'` (only visible while speech is playing,
 *   unless explicitly pinned or opened as a transcript).
 * - `visualSoundCues` defaults to `false` (no floating notification banners unless explicitly enabled).
 * - `autoReadAloud` is labeled "Automatically read new cards" to distinguish it from
 *   the contextual "Read aloud" button inside lessons.
 */

export function detectSystemPreferences() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return { reducedMotion: false, highContrast: false };
  }
  return {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    highContrast: window.matchMedia('(prefers-contrast: more)').matches
  };
}

export const DEFAULT_CAPABILITIES = {
  // Focus & task flow
  gameBasedMode: true,            // Gentle milestone XP without timers
  microChunking: true,            // One concept card at a time
  focusShield: false,             // Hides site header during active lesson

  // Screen & predictability
  sensoryCalmMode: false,         // Soft low-glare palette
  visualScheduleRoadmap: true,    // Compact linear progress bar
  literalLanguageMode: false,     // Clear, direct phrasing without idioms
  reducedMotion: false,           // Freezes non-essential motion (also respects OS setting)

  // Reading comfort
  dyslexiaFont: false,            // Expanded letter/word/line spacing
  creamPaperTint: false,          // Warm paper background to reduce glare
  readingLineRuler: false,        // Movable reading line guide
  vocabularySupport: true,        // Inline syllable & word-meaning chips

  // Visual math & science models
  visualManipulatives: true,      // Interactive fraction bars, scales, & graphs
  colorCodedSteps: true,          // Color-coded step-by-step solution breakdowns

  // Listening & captions (Phase 4: On-demand by default)
  captionDockPreference: 'auto',  // 'auto' | 'pinned' | 'transcript' | 'off'
  closedCaptions: true,           // Active during speech when 'auto' or always when 'pinned'
  visualSoundCues: false,         // Phase 6: Off by default; learner can enable for session
  autoReadAloud: false,           // "Automatically read new cards"
  speechRate: 1.0,                // 0.8 (slower), 1.0 (normal), 1.2 (faster)
  quietAudioEffects: false,       // Silences sound effects

  // Visual clarity
  highContrastCVI: false,         // High-contrast dark background with yellow/cyan borders
  hyperlegibleFont: false,        // Braille Institute Atkinson Hyperlegible font
  fontScale: '100',               // '100' | '115' | '130'
  colorblindSafeShapes: true,     // Redundant geometric symbols alongside colors

  // Pointer & keyboard comfort
  largeTargets: false,            // 52px+ comfortable click/touch targets
  keyboardShortcuts: false        // Single-key shortcuts (1-4, Enter, H, R, B)
};

export const DEFAULT_PROFILE = {
  studentName: 'Alex',
  schoolLevel: 'elementary', // 'elementary' | 'middle' | 'high'
  quizCompleted: false,
  hasChosenPreferences: false,
  matchedPresetName: 'Default workspace',
  matchedReasons: [
    'Visual models and step-by-step hints available',
    'Captions appear automatically during read-aloud'
  ],
  capabilities: { ...DEFAULT_CAPABILITIES }
};

export const SCHOOL_RANGES = [
  {
    id: 'elementary',
    label: 'Elementary',
    grades: 'Grades K–5',
    description: 'Concrete visual models and step-by-step discovery.'
  },
  {
    id: 'middle',
    label: 'Middle School',
    grades: 'Grades 6–8',
    description: 'Interactive simulations, balance scales, and guided inquiry.'
  },
  {
    id: 'high',
    label: 'High School',
    grades: 'Grades 9–12',
    description: 'Coordinate graphing, kinematics, and biochemical modeling.'
  }
];

/**
 * Learner-Owned Support Bundles (Phase 3: Plain language, no clinical labels)
 */
export const LEARNER_TOOL_BUNDLES = [
  {
    id: 'calmer_screen',
    label: 'Calmer screen',
    shortDesc: 'Soft low-glare colors, quiet sounds, and reduced motion.',
    primaryCapKey: 'sensoryCalmMode',
    toggles: {
      sensoryCalmMode: true,
      reducedMotion: true,
      quietAudioEffects: true,
      highContrastCVI: false,
      creamPaperTint: false
    }
  },
  {
    id: 'more_reading_space',
    label: 'More reading space',
    shortDesc: 'Wider letter spacing, warm paper background, and a reading line guide.',
    primaryCapKey: 'dyslexiaFont',
    toggles: {
      dyslexiaFont: true,
      creamPaperTint: true,
      readingLineRuler: true,
      highContrastCVI: false,
      sensoryCalmMode: false
    }
  },
  {
    id: 'step_by_step_help',
    label: 'Step-by-step help',
    shortDesc: 'Clear step progress, direct wording, and one card at a time.',
    primaryCapKey: 'literalLanguageMode',
    toggles: {
      visualScheduleRoadmap: true,
      literalLanguageMode: true,
      microChunking: true,
      colorCodedSteps: true
    }
  },
  {
    id: 'visual_math_models',
    label: 'Visual math models',
    shortDesc: 'Interactive fraction bars, balance scales, and color-coded math steps.',
    primaryCapKey: 'visualManipulatives',
    toggles: {
      visualManipulatives: true,
      colorCodedSteps: true
    }
  },
  {
    id: 'bigger_clearer_text',
    label: 'Bigger, clearer text',
    shortDesc: '130% larger text, hyperlegible letters, and high-contrast dark mode.',
    primaryCapKey: 'highContrastCVI',
    toggles: {
      highContrastCVI: true,
      hyperlegibleFont: true,
      fontScale: '130',
      largeTargets: true,
      creamPaperTint: false,
      sensoryCalmMode: false
    }
  },
  {
    id: 'captions_slower_speech',
    label: 'Captions and slower speech',
    shortDesc: 'Pinned captions, 0.8x slower clear voice speed, and quiet background.',
    primaryCapKey: 'quietAudioEffects',
    toggles: {
      closedCaptions: true,
      captionDockPreference: 'pinned',
      speechRate: 0.8,
      quietAudioEffects: true
    }
  }
];

/**
 * Generates a concise, quiet plain-text summary of active tools for the dashboard
 * e.g., "Your tools: visual models, step-by-step hints, captions on speech."
 */
export function summarizeActiveToolsPlainText(caps = DEFAULT_CAPABILITIES) {
  const list = [];
  if (caps.fontScale && caps.fontScale !== '100') {
    list.push(`larger text (${caps.fontScale}%)`);
  }
  if (caps.highContrastCVI) {
    list.push('high-contrast dark theme');
  } else if (caps.creamPaperTint) {
    list.push('warm reading paper');
  } else if (caps.sensoryCalmMode) {
    list.push('calmer screen colors');
  }
  if (caps.dyslexiaFont) {
    list.push('wider reading space');
  }
  if (caps.autoReadAloud) {
    list.push('auto read-aloud');
  }
  if (caps.focusShield) {
    list.push('focus mode');
  }
  if (caps.literalLanguageMode) {
    list.push('direct wording');
  }
  if (caps.visualManipulatives) {
    list.push('visual models');
  }
  if (caps.captionDockPreference === 'pinned') {
    list.push('pinned captions');
  } else if (caps.captionDockPreference === 'transcript') {
    list.push('transcript panel');
  } else if (caps.captionDockPreference === 'auto') {
    list.push('captions during speech');
  }
  if (caps.keyboardShortcuts) {
    list.push('keyboard shortcuts');
  }
  return list.slice(0, 4).join(', ') || 'standard workspace';
}

export const DISCOVERY_QUIZ_QUESTIONS = [
  {
    id: 'focus_style',
    category: 'Focus & Pace',
    question: 'When you start a lesson, what helps you stay focused?',
    spokenPrompt: 'Question 1: When you start a lesson, what helps you stay focused?',
    allowMultiple: true,
    options: [
      {
        id: 'help_me_focus',
        text: 'Break lessons into short cards and hide extra screen clutter',
        immediateResult: 'Turns on Focus mode and shows one concept card at a time.',
        enables: {
          focusShield: true,
          microChunking: true,
          gameBasedMode: true
        },
        reasonTag: 'Focus mode and one-card-at-a-time view enabled'
      },
      {
        id: 'step_by_step_plan',
        text: 'Use direct, literal wording and step-by-step problem guides',
        immediateResult: 'Turns on "Step-by-step help" with clear, direct instructions.',
        enables: {
          visualScheduleRoadmap: true,
          literalLanguageMode: true,
          microChunking: true
        },
        reasonTag: 'Step-by-step help and direct wording enabled'
      },
      {
        id: 'not_sure_focus',
        text: 'I’m not sure yet — keep the standard view for now',
        immediateResult: 'Keeps the standard balanced lesson layout.',
        enables: {},
        reasonTag: null
      }
    ]
  },
  {
    id: 'reading_comfort',
    category: 'Reading & Listening',
    question: 'How would you like text and reading to work?',
    spokenPrompt: 'Question 2: How would you like text and reading to work?',
    allowMultiple: true,
    options: [
      {
        id: 'more_reading_space',
        text: 'Give letters more breathing room and use warm paper colors',
        immediateResult: 'Turns on "More reading space" (wider spacing, warm paper, and line guide).',
        enables: {
          dyslexiaFont: true,
          creamPaperTint: true,
          readingLineRuler: true,
          vocabularySupport: true
        },
        reasonTag: 'More reading space and warm paper tint enabled'
      },
      {
        id: 'read_this_aloud',
        text: 'Automatically read new cards out loud to me',
        immediateResult: 'Turns on "Automatically read new cards" with synchronized captions.',
        enables: {
          autoReadAloud: true,
          closedCaptions: true,
          captionDockPreference: 'auto',
          vocabularySupport: true
        },
        reasonTag: 'Automatic card read-aloud enabled'
      },
      {
        id: 'not_sure_reading',
        text: 'I’m not sure / Regular text feels fine',
        immediateResult: 'Keeps standard clean text with a Read aloud button on every card.',
        enables: {},
        reasonTag: null
      }
    ]
  },
  {
    id: 'math_numbers',
    category: 'Math & Science Models',
    question: 'What helps you most when working with numbers or science systems?',
    spokenPrompt: 'Question 3: What helps you most when working with numbers or science systems?',
    allowMultiple: true,
    options: [
      {
        id: 'visual_models_steps',
        text: 'Interactive blocks, balance scales, and color-coded steps',
        immediateResult: 'Turns on "Visual math models" and color-coded step solutions.',
        enables: {
          visualManipulatives: true,
          colorCodedSteps: true
        },
        reasonTag: 'Interactive visual models and color-coded steps enabled'
      },
      {
        id: 'not_sure_math',
        text: 'I’m not sure / Show me the standard tools',
        immediateResult: 'Keeps interactive visual models available during lessons.',
        enables: {},
        reasonTag: null
      }
    ]
  },
  {
    id: 'screen_comfort',
    category: 'Screen & Visual Comfort',
    question: 'What kind of screen look feels most comfortable for your eyes?',
    spokenPrompt: 'Question 4: What kind of screen look feels most comfortable for your eyes?',
    allowMultiple: false,
    options: [
      {
        id: 'calmer_screen',
        text: 'A calmer screen with soft colors and no animations',
        immediateResult: 'Turns on "Calmer screen" (soft low-glare colors and reduced motion).',
        enables: {
          sensoryCalmMode: true,
          reducedMotion: true,
          quietAudioEffects: true
        },
        reasonTag: 'Calmer screen palette and reduced motion enabled'
      },
      {
        id: 'bigger_clearer_text',
        text: 'Bigger, clearer text with bold high contrast',
        immediateResult: 'Turns on "Bigger, clearer text" (130% text size and high-contrast dark theme).',
        enables: {
          highContrastCVI: true,
          hyperlegibleFont: true,
          fontScale: '130',
          largeTargets: true,
          colorblindSafeShapes: true
        },
        reasonTag: 'Bigger 130% text and high-contrast dark theme enabled'
      },
      {
        id: 'not_sure_screen',
        text: 'I’m not sure / Keep the default daylight screen',
        immediateResult: 'Keeps the clean daylight theme and standard text size.',
        enables: {},
        reasonTag: null
      }
    ]
  },
  {
    id: 'audio_captions',
    category: 'Captions, Voice Speed & Controls',
    question: 'Would you like pinned captions, slower speech, or keyboard shortcuts?',
    spokenPrompt: 'Question 5: Would you like pinned captions, slower speech, or keyboard shortcuts?',
    allowMultiple: true,
    options: [
      {
        id: 'captions_slower_voice',
        text: 'Pin captions on screen and use a slower speaking voice (0.8x)',
        immediateResult: 'Turns on "Captions and slower speech" (pinned captions and 0.8x voice speed).',
        enables: {
          closedCaptions: true,
          captionDockPreference: 'pinned',
          speechRate: 0.8,
          quietAudioEffects: true
        },
        reasonTag: 'Pinned captions and slower 0.8x speech rate enabled'
      },
      {
        id: 'comfortable_buttons_keys',
        text: 'Use larger buttons and single-key keyboard shortcuts (1–4, Enter, H, R, B)',
        immediateResult: 'Turns on 52px+ comfortable buttons and keyboard shortcuts.',
        enables: {
          largeTargets: true,
          keyboardShortcuts: true
        },
        reasonTag: 'Comfortable 52px+ buttons and keyboard shortcuts enabled'
      },
      {
        id: 'not_sure_controls',
        text: 'I’m not sure / Standard audio and buttons are fine',
        immediateResult: 'Keeps standard controls with captions appearing automatically during speech.',
        enables: {},
        reasonTag: null
      }
    ]
  }
];

export const ACCESSIBILITY_PRESETS = [
  {
    id: 'help_focus_preset',
    name: 'Help me focus (Short Cards & Focus Mode)',
    learnerLabel: 'Help me focus',
    educatorResearchTag: 'Attention & Executive Function Starting Point (ADHD Research)',
    summary: 'Hides extra navigation during lessons and presents one concept card at a time.',
    capabilities: {
      ...DEFAULT_CAPABILITIES,
      gameBasedMode: true,
      microChunking: true,
      focusShield: true,
      visualScheduleRoadmap: true,
      visualManipulatives: true,
      colorCodedSteps: true
    },
    reasons: [
      'Focus mode hides extra navigation during active lessons',
      'One concept card at a time reduces working-memory load'
    ]
  },
  {
    id: 'calmer_screen_preset',
    name: 'Calmer screen & Step-by-step help',
    learnerLabel: 'Calmer screen',
    educatorResearchTag: 'Sensory-Calm & Predictable Starting Point (Autism / COGA Research)',
    summary: 'Soft low-glare colors, clear direct wording, reduced motion, and quiet sound effects.',
    capabilities: {
      ...DEFAULT_CAPABILITIES,
      sensoryCalmMode: true,
      visualScheduleRoadmap: true,
      literalLanguageMode: true,
      reducedMotion: true,
      quietAudioEffects: true,
      gameBasedMode: true,
      creamPaperTint: false,
      highContrastCVI: false
    },
    reasons: [
      'Calmer screen palette and reduced motion active',
      'Direct wording mode removes idioms and ambiguous phrasing'
    ]
  },
  {
    id: 'reading_visual_math_preset',
    name: 'More reading space & Visual math models',
    learnerLabel: 'More reading space',
    educatorResearchTag: 'Reading & Number Sense Starting Point (Dyslexia & Dyscalculia Research)',
    summary: 'Wider letter/word spacing, warm cream paper tint, reading line guide, and interactive visual math models.',
    capabilities: {
      ...DEFAULT_CAPABILITIES,
      dyslexiaFont: true,
      creamPaperTint: true,
      readingLineRuler: true,
      vocabularySupport: true,
      visualManipulatives: true,
      colorCodedSteps: true,
      sensoryCalmMode: false,
      highContrastCVI: false
    },
    reasons: [
      'Expanded letter and word spacing with warm paper background',
      'Interactive reading line guide and visual math models active'
    ]
  },
  {
    id: 'captions_slower_speech_preset',
    name: 'Captions and slower speech',
    learnerLabel: 'Captions and slower speech',
    educatorResearchTag: 'Listening & Captioning Starting Point (DHH & Auditory Processing Research)',
    summary: 'Pinned captions, 0.8x slower clear voice speed, and zero background sound effects.',
    capabilities: {
      ...DEFAULT_CAPABILITIES,
      closedCaptions: true,
      captionDockPreference: 'pinned',
      speechRate: 0.8,
      quietAudioEffects: true,
      vocabularySupport: true
    },
    reasons: [
      'Pinned captions with 0.8x slower voice speed active',
      'Quiet background mode eliminates competing sound effects'
    ]
  },
  {
    id: 'bigger_clearer_text_preset',
    name: 'Bigger, clearer text (High Contrast)',
    learnerLabel: 'Bigger, clearer text',
    educatorResearchTag: 'High-Contrast & Large Print Starting Point (Low-Vision / CVI Research)',
    summary: '130% larger text, Atkinson Hyperlegible font, high-contrast dark background with bold yellow/cyan outlines.',
    capabilities: {
      ...DEFAULT_CAPABILITIES,
      highContrastCVI: true,
      hyperlegibleFont: true,
      fontScale: '130',
      colorblindSafeShapes: true,
      largeTargets: true,
      sensoryCalmMode: false,
      creamPaperTint: false,
      dyslexiaFont: false
    },
    reasons: [
      'High-contrast dark theme with 130% text scaling active',
      'Distinct geometric badges accompany all status colors'
    ]
  },
  {
    id: 'comfortable_controls_preset',
    name: 'Comfortable buttons & keyboard keys',
    learnerLabel: 'Comfortable buttons & keys',
    educatorResearchTag: 'Motor-Friendly & Keyboard Starting Point (Dyspraxia / WCAG 2.2 Target Size)',
    summary: '52px+ comfortable click targets, single-click manipulative controls, and keyboard shortcuts (1–4, Enter, H, R, B).',
    capabilities: {
      ...DEFAULT_CAPABILITIES,
      largeTargets: true,
      keyboardShortcuts: true,
      fontScale: '115'
    },
    reasons: [
      'Comfortable 52px+ interactive targets with keyboard shortcuts active'
    ]
  },
  {
    id: 'default_workspace_preset',
    name: 'Default Learning Workspace',
    learnerLabel: 'Default workspace',
    educatorResearchTag: 'Universal Design for Learning (UDL 3.0) Baseline',
    summary: 'Clean, task-first UDL workspace with interactive models, step progress, and on-demand read-aloud.',
    capabilities: {
      ...DEFAULT_CAPABILITIES
    },
    reasons: [
      'Clean, distraction-free workspace with on-demand learning tools'
    ]
  }
];

export function buildProfileFromQuizSelections(
  selectedOptionIds = [],
  schoolLevel = 'elementary',
  studentName = 'Alex'
) {
  const sys = detectSystemPreferences();
  const capabilities = {
    ...DEFAULT_CAPABILITIES,
    reducedMotion: sys.reducedMotion,
    highContrastCVI: sys.highContrast
  };
  const reasons = [];

  DISCOVERY_QUIZ_QUESTIONS.forEach((q) => {
    q.options.forEach((opt) => {
      if (selectedOptionIds.includes(opt.id)) {
        Object.assign(capabilities, opt.enables);
        if (opt.reasonTag) {
          reasons.push(opt.reasonTag);
        }
      }
    });
  });

  if (capabilities.highContrastCVI) {
    capabilities.creamPaperTint = false;
    capabilities.sensoryCalmMode = false;
  } else if (capabilities.creamPaperTint && capabilities.sensoryCalmMode) {
    capabilities.sensoryCalmMode = false;
  }

  const hasChosen = reasons.length > 0;

  return {
    studentName: (studentName || 'Alex').trim(),
    schoolLevel,
    quizCompleted: true,
    hasChosenPreferences: hasChosen,
    matchedPresetName: hasChosen ? 'My Chosen Tools' : 'Default workspace',
    matchedReasons: hasChosen
      ? reasons
      : ['Default workspace active — you can turn on any learning tool whenever you want'],
    capabilities
  };
}
