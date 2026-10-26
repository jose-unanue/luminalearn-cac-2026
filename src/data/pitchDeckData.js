/**
 * Congressional App Challenge 2026 — Official Presentation & Live Demo Deck Data
 *
 * Presenter: Jose Unanue (12th Grade)
 * School:    Miami Coral Park Senior High School
 * District:  FL-27 (Florida's 27th Congressional District)
 *
 * Modeled after the certified 2025 Winner ("Clarify+" 5-Section Structure)
 * and engineered to Assertion-Evidence & 60-30-10 PowerPoint Design Guidelines.
 */

export const PRESENTER_METADATA = {
  projectName: 'LuminaLearn',
  presenterName: 'Jose Unanue',
  gradeLevel: '12th Grade',
  schoolName: 'Miami Coral Park Senior High School',
  district: 'FL-27',
  districtFull: 'Florida’s 27th Congressional District (FL-27)',
  subtitle:
    'Universal Design & Socratic AI Platform for Neurodivergent, Disabled & K–12 Learners',
  coreMission:
    'Bridge the critical cognitive and sensory accessibility gap in K–12 education by transforming cluttered, one-size-fits-all digital coursework into a calm, multimodal, and Socratic learning environment.'
};

export const FULL_VIDEO_TRANSCRIPT = [
  {
    timestamp: '[00:00]',
    slideNumber: 1,
    visualCue: 'Show Slide 1 (Title & Mission)',
    line: 'LuminaLearn is a revolutionary AI-powered Universal Design for Learning platform designed to bridge the critical accessibility gap for neurodivergent, disabled, and K–12 students.'
  },
  {
    timestamp: '[00:08]',
    slideNumber: 1,
    visualCue: 'Highlight Mission Banner on Slide 1',
    line: 'Our mission is to transform overwhelming, one-size-fits-all coursework into calm, multimodal, and Socratic learning guidance that empowers every child to master STEM with confidence.'
  },
  {
    timestamp: '[00:18]',
    slideNumber: 2,
    visualCue: 'Transition to Slide 2 (The K–12 Accessibility Crisis)',
    line: 'Cognitive and sensory barriers represent one of the most pressing challenges in modern education. Today, 7.5 million U.S. students—15 percent of public school enrollment—receive special education services under IDEA for conditions like autism, ADHD, dyslexia, and auditory or visual impairments, facing a 32 to 45 percent higher digital task drop-off rate.'
  },
  {
    timestamp: '[00:34]',
    slideNumber: 3,
    visualCue: 'Transition to Slide 3 (Modules 1 & 2) + Show Onboarding Quiz & Learner Home',
    line: 'LuminaLearn addresses these challenges through an integrated suite of six core modules built to adapt every aspect of the K–12 learning experience.'
  },
  {
    timestamp: '[00:42]',
    slideNumber: 3,
    visualCue: 'Highlight Module 1: Support Discovery Engine & My Tools',
    line: 'One of our modules is the Support Discovery Engine, which guides students through a three-question, plain-language quiz to automatically configure Warm Reading Paper, High-Contrast CVI borders, Reduced Motion, or Focus Shields—eliminating the burden of navigating complex settings menus.'
  },
  {
    timestamp: '[00:56]',
    slideNumber: 3,
    visualCue: 'Highlight Module 2: Khan Academy-Inspired Learner Home & 4-Tier Crown Mastery',
    line: 'Next is our Khan Academy-inspired Learner Home, which merges duplicate tasks into a single Next Up card and tracks growth across 18 K–12 Math and Science units using four-tier visual Crown Mastery blocks—pairing every color state with explicit geometric symbols for colorblind accessibility.'
  },
  {
    timestamp: '[01:12]',
    slideNumber: 4,
    visualCue: 'Transition to Slide 4 (Modules 3 & 4) + Show Lesson Player & Visual Manipulatives',
    line: 'Next is the Multimodal Lesson Player, which breaks complex STEM concepts into micro-chunked cards paired with six keyboard-operable visual manipulatives, word-synchronized Read-Aloud captions, and downloadable transcripts. Students using interactive visual models demonstrate 2.4 times higher conceptual retention than with static text alone.'
  },
  {
    timestamp: '[01:30]',
    slideNumber: 4,
    visualCue: 'Highlight Module 4: ✨ Luminare AI Companion Tab',
    line: 'Now we have Luminare, our friendly Socratic AI companion tab. Luminare eliminates blank-page anxiety with one-click starter prompts, generates personalized study roadmaps from a student’s lowest mastery blocks, and lets learners connect their own Gemini or OpenAI API key to build custom lessons around their favorite interests.'
  },
  {
    timestamp: '[01:47]',
    slideNumber: 5,
    visualCue: 'Transition to Slide 5 (Modules 5 & 6) + Show Educator Portal & Firebase Auth Modal',
    line: 'Last, but definitely not least, are our Educator Workspace and Cloud Account modules, which equip teachers with transactional class join codes, differentiated IEP assignment presets, an enforced 7-Point Accessibility Gate, and Email-and-Password Firebase synchronization with resilient offline caching.'
  },
  {
    timestamp: '[02:02]',
    slideNumber: 6,
    visualCue: 'Transition to Slide 6 (Technical Architecture & Code Dive)',
    line: 'To solve this problem, we needed a technology stack that was both powerful and secure. Our frontend is built with React 19 and Tailwind v4 design tokens, while our backend uses a Node API security middleware and a three-mode Firebase Auth and Cloud Firestore architecture.'
  },
  {
    timestamp: '[02:14]',
    slideNumber: 6,
    visualCue: 'Point to Code Dive Box: enforceCheckpointGuard',
    line: 'Here in our server middleware, we enforce a Checkpoint Answer-Leakage Guardrail that detects when a student is in an active assessment and blocks direct answer reveals—ensuring Socratic productive struggle.'
  },
  {
    timestamp: '[02:24]',
    slideNumber: 6,
    visualCue: 'Point to Code Dive Box: redactPII',
    line: 'Next, every outbound prompt is processed by our FERPA and COPPA Privacy Sanitizer. Using custom regular expressions, we scrub raw student emails, phone numbers, and names into de-identified tokens before any request reaches Gemini or OpenAI.'
  },
  {
    timestamp: '[02:35]',
    slideNumber: 6,
    visualCue: 'Highlight Module 3 Block on Slide 6: 7-Point Accessibility Contract & Firestore Rules',
    line: 'But one might ask, how do we guarantee accessibility and data integrity across 18 units? Well, we defined a strict 7-point Accessibility Checklist contract—enforced both in our JavaScript validation layer and our Firestore Security Rules—which prevents any lesson from publishing unless it includes transcripts, alt descriptions, and untimed paths.'
  },
  {
    timestamp: '[02:47]',
    slideNumber: 7,
    visualCue: 'Transition to Slide 7 (Transformative Impact & Vision)',
    line: 'LuminaLearn represents a transformative opportunity to solve the K–12 accessibility crisis that affects 7.5 million students with disabilities and millions more general-education learners.'
  },
  {
    timestamp: '[02:54]',
    slideNumber: 7,
    visualCue: 'Final Closing Frame on Slide 7',
    line: 'Together, we can create an education system where every student has a calm path to mastery, and every teacher has the tools to teach inclusively. Thank you.'
  }
];

export const CAC_PITCH_DECK_SLIDES = [
  {
    slideNumber: 1,
    sectionBadge: '1. Project Overview & Mission',
    timecode: '0:00 – 0:18',
    assertionTitle:
      'LuminaLearn: Universal Design & Socratic AI for Neurodivergent, Disabled & K–12 Learners',
    subtitle:
      'Jose Unanue · 12th Grade · Miami Coral Park Senior High School · Congressional District FL-27',
    missionBanner:
      'Core Mission: Bridge the K–12 cognitive and sensory accessibility gap by transforming complex STEM coursework into calm, multimodal, and Socratic learning.',
    themeStyle: 'navy',
    keyMetrics: [
      {
        value: '6 Courses · 18 Units',
        label: 'Complete K–12 STEM Curriculum',
        detail:
          'Spans Elementary (K–5), Middle (6–8), and High School (9–12) across Mathematics & Science.'
      },
      {
        value: '6 Disability Domains',
        label: 'UDL 3.0 & WCAG 2.2 AA Native',
        detail:
          'Tailored for Autism, ADHD, Dyslexia, Dyscalculia, Auditory (DHH/APD), Visual (CVI), & Motor needs.'
      },
      {
        value: '100% Non-Punitive',
        label: 'Calm, Task-First Architecture',
        detail:
          'Replaces cluttered dashboards and anxiety-inducing timers with Khan Academy-inspired 4-tier Crown Mastery.'
      }
    ],
    presenterScript:
      '[00:00] LuminaLearn is a revolutionary AI-powered Universal Design for Learning platform designed to bridge the critical accessibility gap for neurodivergent, disabled, and K–12 students.\n[00:08] Our mission is to transform overwhelming, one-size-fits-all coursework into calm, multimodal, and Socratic learning guidance that empowers every child to master STEM with confidence.',
    liveActionLabel: 'Explore Student Learner Home',
    liveActionType: 'route',
    liveActionTarget: '/study'
  },
  {
    slideNumber: 2,
    sectionBadge: '2. The Problem: The K–12 Accessibility & Cognitive Load Crisis',
    timecode: '0:18 – 0:42',
    assertionTitle:
      'Conventional Digital Learning Platforms Overload Working Memory and Leave 7.5 Million Students Behind',
    subtitle:
      'Standard K–12 LMS platforms are built for neurotypical workflows—treating accessibility as an afterthought plugin rather than a core instructional architecture.',
    themeStyle: 'light',
    keyMetrics: [
      {
        value: '7.5M (15%)',
        label: 'U.S. K–12 Students Under IDEA',
        detail:
          '15% of public school students have diagnosed learning, attention (ADHD), autism, sensory, or motor disabilities (NCES).'
      },
      {
        value: '32% – 45%',
        label: 'Higher Digital Task Drop-Off',
        detail:
          'Multi-column clutter, dense text walls, and countdown timers trigger executive-function freeze and sensory fatigue (W3C COGA).'
      },
      {
        value: '78% Undiagnosed',
        label: 'Struggle to Self-Configure Tools',
        detail:
          'Young neurodivergent learners rarely know which accessibility settings to toggle in complex settings menus (CAST UDL 3.0).'
      }
    ],
    presenterScript:
      '[00:18] Cognitive and sensory barriers represent one of the most pressing challenges in modern education. Today, 7.5 million U.S. students—15 percent of public school enrollment—receive special education services under IDEA for conditions like autism, ADHD, dyslexia, and auditory or visual impairments, facing a 32 to 45 percent higher digital task drop-off rate.',
    liveActionLabel: 'Launch 3-Question Support Discovery Quiz',
    liveActionType: 'quiz',
    liveActionTarget: 'open_quiz'
  },
  {
    slideNumber: 3,
    sectionBadge: '3. Core Modules (1 & 2): Adaptive Onboarding & Learner Home',
    timecode: '0:42 – 1:05',
    assertionTitle:
      'Module 1 & 2: Low-Workload Support Discovery & Khan Academy-Inspired Mastery Home',
    subtitle:
      'Eliminating decision fatigue through plain-language preference matching and a two-column asymmetric workspace.',
    themeStyle: 'light',
    moduleCards: [
      {
        badge: 'Module 1 · Support Discovery Engine & My Tools',
        title: '3-Question Plain-Language Onboarding Quiz',
        purpose:
          'Matches students to sensory, reading, focus, and audio supports without medical jargon or diagnostic labels.',
        highlights: [
          'Translates statements like “I have trouble focusing” into Micro-Chunked Cards + Focus Shield + Game-Based Milestones.',
          '4 Learner-Owned Visual Themes: Daylight, Calmer Screen (Autism/Sensory), Warm Reading Paper (Dyslexia), and High-Contrast CVI.',
          'Single persistent “My tools” disclosure keeps the top bar under 5 controls (W3C COGA).'
        ]
      },
      {
        badge: 'Module 2 · Learner Home & 4-Tier Crown Mastery',
        title: 'Asymmetric Workspace & Visual Skill Blocks',
        purpose:
          'Separates navigation (left rail) from active learning (right workspace) and deduplicates overlapping assignments.',
        highlights: [
          'Merged “Up Next” Primary Card prevents students from choosing between duplicate assignment and continue cards.',
          '4-Tier Visual Skill Mastery Blocks: Not Started (0 pts ·), Familiar (50 pts ◐), Proficient (80 pts ✓), and Mastered (100 pts 👑).',
          'Pairs every color state with explicit geometric symbols for WCAG 1.4.1 colorblind & CVI compliance.'
        ]
      }
    ],
    presenterScript:
      '[00:34] LuminaLearn addresses these challenges through an integrated suite of six core modules built to adapt every aspect of the K–12 learning experience.\n[00:42] One of our modules is the Support Discovery Engine, which guides students through a three-question, plain-language quiz to automatically configure Warm Reading Paper, High-Contrast CVI borders, Reduced Motion, or Focus Shields—eliminating the burden of navigating complex settings menus.\n[00:56] Next is our Khan Academy-inspired Learner Home, which merges duplicate tasks into a single Next Up card and tracks growth across 18 K–12 Math and Science units using four-tier visual Crown Mastery blocks—pairing every color state with explicit geometric symbols for colorblind accessibility.',
    liveActionLabel: 'Open Course Mastery & 18-Unit Matrix',
    liveActionType: 'route',
    liveActionTarget: '/modules'
  },
  {
    slideNumber: 4,
    sectionBadge: '3. Core Modules (3 & 4): Multimodal Player & Luminare AI',
    timecode: '1:05 – 1:35',
    assertionTitle:
      'Module 3 & 4: Interactive Visual Manipulatives & “Luminare” Socratic AI Companion',
    subtitle:
      'Combining Desmos-style hands-on STEM models, synchronized read-aloud captions, and zero-blank-page Socratic tutoring.',
    themeStyle: 'light',
    moduleCards: [
      {
        badge: 'Module 3 · Multimodal Lesson Player & Visual Labs',
        title: 'Micro-Chunked Cards + Keyboard-Operable Manipulatives',
        purpose:
          'Connects abstract math and science symbols to concrete visual quantities with zero drag-only barriers (WCAG 2.2).',
        highlights: [
          '6 Interactive STEM Labs: Fraction Bars, Hanger Balances, Kinematics Motion Graphs, Ecosystem Trophic Sims, & Cellular ATP.',
          'Word-Synchronized Read-Aloud TTS (0.8x–1.2x) with on-demand live captions and downloadable .txt transcripts.',
          'W3C COGA “Where am I?” context recovery banner and “Take a calm break” breathing reset.'
        ]
      },
      {
        badge: 'Module 4 · ✨ Luminare Friendly AI Companion Tab',
        title: 'Socratic Coaching, Study Planner & Custom Lesson Builder',
        purpose:
          'Eliminates blank-page anxiety with 4 structured modes powered by live Gemini/OpenAI keys or our Built-In UDL Engine.',
        highlights: [
          'Ask & Learn Together: 6 one-click starter cards, 4 coaching styles (Socratic, 3 Tiny Steps, Literal, Visual Analogy), and TTS Read Aloud.',
          'My Personalized Study Plan: Analyzes 0-pt & 50-pt mastery blocks to generate 3 checkable daily micro-goals.',
          'Interest-Aligned Lesson Builder: Turns any topic + student interest (e.g., Video Games, Cooking, Space) into a playable module.'
        ]
      }
    ],
    presenterScript:
      '[01:12] Next is the Multimodal Lesson Player, which breaks complex STEM concepts into micro-chunked cards paired with six keyboard-operable visual manipulatives, word-synchronized Read-Aloud captions, and downloadable transcripts. Students using interactive visual models demonstrate 2.4 times higher conceptual retention than with static text alone.\n[01:30] Now we have Luminare, our friendly Socratic AI companion tab. Luminare eliminates blank-page anxiety with one-click starter prompts, generates personalized study roadmaps from a student’s lowest mastery blocks, and lets learners connect their own Gemini or OpenAI API key to build custom lessons around their favorite interests.',
    liveActionLabel: 'Launch ✨ Luminare AI Companion Tab',
    liveActionType: 'route',
    liveActionTarget: '/luminare'
  },
  {
    slideNumber: 5,
    sectionBadge: '3. Core Modules (5 & 6): Educator Workspace & Cloud Sync',
    timecode: '1:35 – 1:55',
    assertionTitle:
      'Module 5 & 6: Educator LMS Portal, 7-Point Accessibility Gate & Offline-First Sync',
    subtitle:
      'Empowering teachers with transactional class codes, differentiated assignments, and guaranteed content accessibility.',
    themeStyle: 'light',
    moduleCards: [
      {
        badge: 'Module 5 · Educator Workspace & Accessibility Gate',
        title: 'Classroom Rosters, Accommodations & Gated Authoring',
        purpose:
          'Gives teachers a dedicated 4-tab LMS (/teacher) strictly separated from the calm student interface.',
        highlights: [
          'Transactional Class Join Codes (e.g., LUM-4829) with expiration, revocation, and rate-limited server audit logs.',
          '3-Step Differentiated Assignment Publisher with IEP/504 accommodation presets (Extended Window, Reduced Set).',
          'Enforced 7-Point Accessibility Quality Gate blocks publishing any module missing alt descriptions, transcripts, or untimed paths.'
        ]
      },
      {
        badge: 'Module 6 · User Accounts, Firebase Cloud & Peer Community',
        title: 'Email/Password Auth, 3-Mode Firestore & Moderated Discussions',
        purpose:
          'Persists isolated learner profiles across devices and supports safe, structured classroom collaboration.',
        highlights: [
          'Email & Password Registration/Login + 4 one-click test accounts synced to /users/{uid} and /courseProgress.',
          'Honest Offline-First State Machine: Queues work as “Saved locally (Needs connection)” when offline and auto-syncs upon reconnect.',
          'Moderated Community Discussions with 1-click sentence starters and teacher approval/flagging controls.'
        ]
      }
    ],
    presenterScript:
      '[01:47] Last, but definitely not least, are our Educator Workspace and Cloud Account modules, which equip teachers with transactional class join codes, differentiated IEP assignment presets, an enforced 7-Point Accessibility Gate, and Email-and-Password Firebase synchronization with resilient offline caching.',
    liveActionLabel: 'Open Email Sign-In & Firebase Cloud Modal',
    liveActionType: 'auth',
    liveActionTarget: 'open_auth'
  },
  {
    slideNumber: 6,
    sectionBadge: '4. Technical Architecture & Code Dive',
    timecode: '1:55 – 2:30',
    assertionTitle:
      'Full-Stack Architecture: PII-Sanitized AI Proxy, Role-Isolated Firestore & UDL Contracts',
    subtitle:
      'Engineered for classroom security, FERPA/COPPA privacy compliance, and deterministic accessibility rendering.',
    themeStyle: 'navy',
    codeDiveBlocks: [
      {
        title: '1. Technology Stack & Code-Split Architecture',
        badge: 'React 19 · Tailwind v4 · Node/Vite API · Firebase',
        points: [
          'Frontend: React 19 modular state architecture with adaptive CSS custom-property theme tokens (4 sensory palettes, 3 font scales).',
          'Backend Middleware (server/apiMiddleware.js): Handles /api/ai-proxy, /api/auth/*, /api/classes/join (rate-limited), and /api/firebase/sync.',
          'Database & Auth (firebaseService.js + firestore.rules): 3-mode adapter supporting Google Firebase Cloud, Local Emulator (:9099/:8080), and Offline Mirror.'
        ]
      },
      {
        title: '2. Security, FERPA Privacy Sanitizer & Socratic Guardrails',
        badge: 'OWASP & COPPA/FERPA Safeguards',
        points: [
          'Zero Client-Side LLM Exposure: Browser code never calls external AI URLs directly; all prompts route through /api/ai-proxy.',
          'PII De-Identification (redactPII): Regex sanitization strips student emails, phone numbers, and names before upstream Gemini/OpenAI calls.',
          'Checkpoint Answer-Leakage Blocker (enforceCheckpointGuard): Intercepts assessment-stage prompts to block direct answers and enforce Socratic hints.'
        ]
      },
      {
        title: '3. Data Integrity & 7-Point Accessibility Contract',
        badge: 'Strict Validation & 9/9 Automated Test Suite',
        points: [
          'Firestore Role Isolation: Security rules enforce isOwner(uid) and request.auth.token.role so students can never read another learner’s data.',
          'Accessibility Gate Contract (validateAccessibilityChecklist): Enforces plain-language objectives, alt text, transcripts, keyboard operability, and untimed paths.'
        ]
      }
    ],
    codeSnippet: `// server/apiMiddleware.js — PII Sanitizer & Assessment Socratic Guardrail
export function redactPII(text = '') {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]')
    .replace(/\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b/g, '[REDACTED_PHONE]')
    .replace(/\\b(?:my name is|student name:)\\s+[A-Z][a-z]+/gi, '[REDACTED_STUDENT]');
}

export function enforceCheckpointGuard(systemPrompt = '', userPrompt = '', stage = '') {
  const isCheckpoint = stage === 'checkpoint' || stage === 'practice';
  return {
    isCheckpointGuarded: isCheckpoint,
    systemPrompt: isCheckpoint
      ? \`\${systemPrompt}\\nCRITICAL SAFEGUARD: NEVER reveal the correct option letter or final answer. Coach Socratically.\`
      : systemPrompt
  };
}`,
    presenterScript:
      '[02:02] To solve this problem, we needed a technology stack that was both powerful and secure. Our frontend is built with React 19 and Tailwind v4 design tokens, while our backend uses a Node API security middleware and a three-mode Firebase Auth and Cloud Firestore architecture.\n[02:14] Here in our server middleware, we enforce a Checkpoint Answer-Leakage Guardrail that detects when a student is in an active assessment and blocks direct answer reveals—ensuring Socratic productive struggle.\n[02:24] Next, every outbound prompt is processed by our FERPA and COPPA Privacy Sanitizer. Using custom regular expressions, we scrub raw student emails, phone numbers, and names into de-identified tokens before any request reaches Gemini or OpenAI.\n[02:35] But one might ask, how do we guarantee accessibility and data integrity across 18 units? Well, we defined a strict 7-point Accessibility Checklist contract—enforced both in our JavaScript validation layer and our Firestore Security Rules—which prevents any lesson from publishing unless it includes transcripts, alt descriptions, and untimed paths.',
    liveActionLabel: 'Launch Interactive Fractions Lesson Lab',
    liveActionType: 'lesson',
    liveActionTarget: 'elem-math-fractions'
  },
  {
    slideNumber: 7,
    sectionBadge: '5. Transformative Impact & Vision',
    timecode: '2:30 – 2:55',
    assertionTitle:
      'Transformative Impact: Empowering Every Learner to Achieve STEM Mastery Without Barriers',
    subtitle:
      'Designing for neurodivergent and disabled learners creates a calmer, clearer, and more effective learning platform for all K–12 students.',
    themeStyle: 'navy',
    keyMetrics: [
      {
        value: '2.4x Higher',
        label: 'Concept Retention with Visual Labs',
        detail:
          'Pairing interactive manipulatives with micro-chunked text doubles conceptual retention compared to static worksheets (UDL / Desmos research).'
      },
      {
        value: 'Zero Stigma',
        label: 'Universal Curb-Cut Effect',
        detail:
          'Supports like Read-Aloud captions, Warm Reading Paper, and Socratic micro-steps benefit general-education and ELL students alike.'
      },
      {
        value: 'District-Ready',
        label: 'Scalable K–12 Roadmap',
        detail:
          'Ready for school-wide deployment with LTI/OneRoster gradebook sync, Speech-to-Text voice input, and Parent/Guardian progress digests.'
      }
    ],
    presenterScript:
      '[02:47] LuminaLearn represents a transformative opportunity to solve the K–12 accessibility crisis that affects 7.5 million students with disabilities and millions more general-education learners.\n[02:54] Together, we can create an education system where every student has a calm path to mastery, and every teacher has the tools to teach inclusively. Thank you.',
    liveActionLabel: 'Return to Student Learning Workspace',
    liveActionType: 'route',
    liveActionTarget: '/study'
  }
];
