/**
 * Phase 2 & Phase 7: Khan Academy-Inspired Course, Unit, Module, Skill & Mastery Data Model
 *
 * Implements the K–12 course hierarchy across 3 school bands (6 complete courses, 18 complete units):
 *   - Elementary:
 *       Launch:    Math Foundations: Fractions & Fair Shares (3 units, 300 Mastery Points)
 *       Expansion: Science Explorers: Matter & Living Things (3 units, 300 Mastery Points)
 *   - Middle School:
 *       Launch:    Algebra Foundations: Patterns, Equations & Graphs (3 units, 300 Mastery Points)
 *       Expansion: Life and Earth Systems (3 units, 300 Mastery Points)
 *   - High School:
 *       Launch:    Algebra, Functions & Kinematics (3 units, 300 Mastery Points)
 *       Expansion: Biology: Energy & Systems (3 units, 300 Mastery Points)
 *
 * Mastery Tiers (Khan Academy 4-Tier Crown System + UDL Review State):
 *   - 'not_started'     : 0 pts   (Empty block)
 *   - 'practicing'      : 50 pts  (Familiar / Practicing block)
 *   - 'ready_to_review' : 80 pts  (Proficient / Ready to review block)
 *   - 'mastered'        : 100 pts (Mastered Crown block 👑)
 */

import { INITIAL_LESSONS } from './curriculumData.js';

export const MASTERY_TIERS = {
  not_started: {
    id: 'not_started',
    label: 'Not started',
    shortLabel: '0 pts',
    points: 0,
    blockClass: 'mastery-block-not-started'
  },
  practicing: {
    id: 'practicing',
    label: 'Familiar (Practicing)',
    shortLabel: '50 pts',
    points: 50,
    blockClass: 'mastery-block-familiar'
  },
  ready_to_review: {
    id: 'ready_to_review',
    label: 'Proficient (Ready to review)',
    shortLabel: '80 pts',
    points: 80,
    blockClass: 'mastery-block-proficient'
  },
  mastered: {
    id: 'mastered',
    label: 'Mastered',
    shortLabel: '100 pts 👑',
    points: 100,
    blockClass: 'mastery-block-mastered'
  }
};

export function computeCourseMasteryStats(course, skillMasteryMap = {}) {
  const skills = course?.skills || [];
  const totalPossiblePoints = skills.length * 100 || 300;
  let earnedPoints = 0;
  let masteredCount = 0;
  let proficientCount = 0;
  let familiarCount = 0;

  skills.forEach((skill) => {
    const state =
      skillMasteryMap?.[skill.id] || skill.defaultMastery || 'not_started';
    const tier = MASTERY_TIERS[state] || MASTERY_TIERS.not_started;
    earnedPoints += tier.points;
    if (state === 'mastered') masteredCount += 1;
    else if (state === 'ready_to_review') proficientCount += 1;
    else if (state === 'practicing') familiarCount += 1;
  });

  return {
    earnedPoints,
    totalPossiblePoints,
    masteredCount,
    proficientCount,
    familiarCount,
    totalSkills: skills.length,
    percent: Math.round((earnedPoints / totalPossiblePoints) * 100)
  };
}

export const AUTHORING_CHECKLIST_ITEMS = [
  {
    key: 'plainLanguageObjective',
    label: 'Plain-language learning objective',
    description: 'Short, concrete learning goal written without jargon.'
  },
  {
    key: 'visualAltDescription',
    label: 'Alt text or long description for meaningful visuals',
    description:
      'Every diagram or interactive manipulative includes a non-visual text description.'
  },
  {
    key: 'transcriptText',
    label: 'Captioned narration and downloadable transcript',
    description: 'Complete text transcript available to read or download (.txt).'
  },
  {
    key: 'keyboardOperable',
    label: 'Keyboard-operable activity',
    description:
      'All interactive controls work with Tab, Enter, Space, and Arrow keys without drag-only motion.'
  },
  {
    key: 'noColorOnlyInstruction',
    label: 'No color-only instruction',
    description:
      'Every visual state or diagram uses text labels, shapes, or icons alongside color.'
  },
  {
    key: 'untimedAssessmentPath',
    label: 'Untimed or extended-time assessment path',
    description:
      'Checkpoints have zero punitive countdown timers and allow calm review.'
  },
  {
    key: 'hintsAndRetryAvailable',
    label: 'Hint, retry, and alternative representation',
    description:
      'Learners can request progressive hints, view worked examples, and retry questions.'
  }
];

/**
 * Phase 7: Accessibility Quality Gate Validator
 * A course or module cannot be published if any required accessibility checklist item is missing.
 */
export function validateAccessibilityChecklist(checklist = {}) {
  const missingItems = [];

  if (
    typeof checklist.plainLanguageObjective !== 'string' ||
    checklist.plainLanguageObjective.trim().length < 10
  ) {
    missingItems.push('Plain-language learning objective');
  }

  if (
    typeof checklist.visualAltDescription !== 'string' ||
    checklist.visualAltDescription.trim().length < 10
  ) {
    missingItems.push('Alt text or long description for meaningful visuals');
  }

  if (
    typeof checklist.transcriptText !== 'string' ||
    checklist.transcriptText.trim().length < 10
  ) {
    missingItems.push('Captioned narration and downloadable transcript');
  }

  if (checklist.keyboardOperable !== true) {
    missingItems.push('Keyboard-operable activity');
  }

  if (checklist.noColorOnlyInstruction !== true) {
    missingItems.push('No color-only instruction');
  }

  if (checklist.untimedAssessmentPath !== true) {
    missingItems.push('Untimed or extended-time assessment path');
  }

  if (checklist.hintsAndRetryAvailable !== true) {
    missingItems.push('Hint, retry, and alternative representation');
  }

  return {
    passed: missingItems.length === 0,
    missingItems
  };
}

function buildModuleTranscript(lesson) {
  if (!lesson) return '';
  const header = `LuminaLearn Module Transcript: ${lesson.title}\nGrade Band: ${lesson.gradeRange} | Subject: ${lesson.subject}\n`;
  const cardsText = (lesson.microCards || [])
    .map(
      (c, i) =>
        `\n[Concept Card ${i + 1}: ${c.title}]\nStandard Narration: ${c.standardText}\nPlain-Language Summary: ${c.literalText}\nKey Callout: ${c.visualCallout}`
    )
    .join('\n');
  return `${header}${cardsText}`.trim();
}

function findLessonById(id) {
  return INITIAL_LESSONS.find((l) => l.id === id) || INITIAL_LESSONS[0];
}

function createAccessibleModule({
  id,
  lessonId,
  title,
  type = 'full-5-stage',
  stagesIncluded = [
    'Learn',
    'Guided practice',
    'Apply',
    'Checkpoint',
    'Review/reflection'
  ],
  estimatedMinutes = 8,
  skillIds = [],
  applyActivityPrompt,
  plainLanguageObjective,
  visualAltDescription
}) {
  const lesson = findLessonById(lessonId);
  return {
    id,
    lessonId,
    title,
    type,
    stagesIncluded,
    estimatedMinutes,
    skillIds,
    applyActivityPrompt,
    accessibilityChecklist: {
      plainLanguageObjective,
      visualAltDescription,
      transcriptText: buildModuleTranscript(lesson),
      keyboardOperable: true,
      noColorOnlyInstruction: true,
      untimedAssessmentPath: true,
      hintsAndRetryAvailable: true
    }
  };
}

export const INITIAL_COURSES = [
  // ============================================================================
  // 1. ELEMENTARY LAUNCH COURSE: Math Foundations: Fractions & Fair Shares
  // ============================================================================
  {
    id: 'course-elem-math',
    title: 'Math Foundations: Fractions & Fair Shares',
    schoolLevel: 'elementary',
    gradeRange: 'Elementary (Grades 3–5)',
    subject: 'Mathematics',
    isLaunchCourse: true,
    published: true,
    accessibilityGatePassed: true,
    badgeEmoji: '🍕',
    instructorName: 'Ms. Elena Vance',
    classContext: 'Grade 4 Visual Math Studio (Class Code: LUM-4829)',
    purpose:
      'Build lasting visual intuition for equal parts, numerators, denominators, and equivalent fractions using concrete bar models.',
    accessibleOverview:
      'Every unit pairs keyboard-operable fraction bars with narrated cards, downloadable transcripts, step-by-step hints, and untimed checkpoints.',
    primaryLessonId: 'elem-math-fractions',
    skills: [
      {
        id: 'skill-equal-parts',
        title: 'Partitioning wholes into equal shares',
        unitId: 'unit-elem-math-1',
        defaultMastery: 'practicing'
      },
      {
        id: 'skill-num-denom',
        title: 'Representing numerators and denominators',
        unitId: 'unit-elem-math-2',
        defaultMastery: 'ready_to_review'
      },
      {
        id: 'skill-equiv-fractions',
        title: 'Generating equivalent fractions visually',
        unitId: 'unit-elem-math-3',
        defaultMastery: 'not_started'
      }
    ],
    units: [
      {
        id: 'unit-elem-math-1',
        unitNumber: 1,
        title: 'Equal Shares & Whole Units',
        learningGoal:
          'Identify when a whole bar or shape is divided into fair, equal-sized parts.',
        modules: [
          createAccessibleModule({
            id: 'elem-math-fractions',
            lessonId: 'elem-math-fractions',
            title: 'Fractions & Fair Shares: Visual Number Sense',
            estimatedMinutes: 8,
            skillIds: ['skill-equal-parts'],
            applyActivityPrompt:
              'Use the interactive Fraction Bar Lab to model 3/4 and verify that all 4 slices are equal in size.',
            plainLanguageObjective:
              'Learn how equal parts make a fair fraction and how to read a shaded fraction bar.',
            visualAltDescription:
              'Interactive horizontal fraction bar partitioned into 1 to 8 equal segments with high-contrast numeric labels.'
          })
        ]
      },
      {
        id: 'unit-elem-math-2',
        unitNumber: 2,
        title: 'Numerators, Denominators & Unit Fractions',
        learningGoal:
          'Compare unit fractions and explain why a larger denominator makes each individual slice smaller.',
        modules: [
          createAccessibleModule({
            id: 'mod-elem-math-u2-m1',
            lessonId: 'elem-math-fractions',
            title: 'Comparing Unit Fractions (1/2 vs. 1/8)',
            type: 'guided-practice',
            stagesIncluded: ['Learn', 'Guided practice', 'Checkpoint'],
            estimatedMinutes: 7,
            skillIds: ['skill-num-denom'],
            applyActivityPrompt:
              'Compare 1/2 and 1/6 on the visual fraction bar and explain which slice covers more of the whole.',
            plainLanguageObjective:
              'Compare two fractions with 1 on top and explain which piece covers more of the whole bar.',
            visualAltDescription:
              'Side-by-side fraction bars comparing 1/2 (50% shaded) against 1/8 (12.5% shaded) with explicit text labels.'
          })
        ]
      },
      {
        id: 'unit-elem-math-3',
        unitNumber: 3,
        title: 'Equivalent Fractions in Action',
        learningGoal:
          'Create equivalent fractions by scaling both the numerator and denominator equally.',
        modules: [
          createAccessibleModule({
            id: 'mod-elem-math-u3-m1',
            lessonId: 'elem-math-fractions',
            title: 'Building Equivalent Fractions (1/2 = 2/4 = 3/6)',
            type: 'checkpoint',
            stagesIncluded: ['Apply', 'Checkpoint', 'Review/reflection'],
            estimatedMinutes: 8,
            skillIds: ['skill-equiv-fractions'],
            applyActivityPrompt:
              'Set the fraction bar to 2/4 or 3/6 to prove it covers exactly 50% of the whole bar.',
            plainLanguageObjective:
              'Match fractions that have different numbers but cover the exact same amount of a whole.',
            visualAltDescription:
              'Interactive equivalence badge that announces when the shaded bar equals 50% (1/2, 2/4, 3/6, 4/8).'
          })
        ]
      }
    ]
  },

  // ============================================================================
  // 2. ELEMENTARY EXPANSION COURSE: Science Explorers: Matter & Living Things
  // ============================================================================
  {
    id: 'course-elem-sci',
    title: 'Science Explorers: Matter & Living Things',
    schoolLevel: 'elementary',
    gradeRange: 'Elementary (Grades K–5)',
    subject: 'Science',
    isLaunchCourse: false,
    published: true,
    accessibilityGatePassed: true,
    badgeEmoji: '🧊',
    instructorName: 'Ms. Elena Vance',
    classContext: 'Elementary Discovery Lab',
    purpose:
      'Explore how thermal energy transforms solids, liquids, and gases and how water cycles through living habitats.',
    accessibleOverview:
      'Includes an interactive temperature slider with text state labels, captioned explanations, and step-by-step practice.',
    primaryLessonId: 'elem-sci-matter',
    skills: [
      {
        id: 'skill-states-matter',
        title: 'Classifying solids, liquids, and gases by particle motion',
        unitId: 'unit-elem-sci-1',
        defaultMastery: 'practicing'
      },
      {
        id: 'skill-phase-change',
        title: 'Predicting melting and boiling from temperature changes',
        unitId: 'unit-elem-sci-2',
        defaultMastery: 'not_started'
      },
      {
        id: 'skill-water-cycle',
        title: 'Connecting evaporation and condensation to weather cycles',
        unitId: 'unit-elem-sci-3',
        defaultMastery: 'not_started'
      }
    ],
    units: [
      {
        id: 'unit-elem-sci-1',
        unitNumber: 1,
        title: 'Solids, Liquids & Gases',
        learningGoal:
          'Describe how particles are arranged and move in a solid, a liquid, and a gas.',
        modules: [
          createAccessibleModule({
            id: 'elem-sci-matter',
            lessonId: 'elem-sci-matter',
            title: 'States of Matter: Solid, Liquid & Gas',
            estimatedMinutes: 7,
            skillIds: ['skill-states-matter'],
            applyActivityPrompt:
              'Adjust the temperature slider from -10°C to 110°C and observe the particle arrangement at each phase.',
            plainLanguageObjective:
              'Observe how adding heat changes ice (solid) into liquid water and steam (gas).',
            visualAltDescription:
              'Temperature slider from -20°C to 120°C with explicit text readout of phase state (Solid Ice, Liquid Water, Water Vapor Gas).'
          })
        ]
      },
      {
        id: 'unit-elem-sci-2',
        unitNumber: 2,
        title: 'Heating, Cooling & Phase Transitions',
        learningGoal:
          'Identify the freezing point (0°C) and boiling point (100°C) of water on the Celsius scale.',
        modules: [
          createAccessibleModule({
            id: 'mod-elem-sci-u2-m1',
            lessonId: 'elem-sci-matter',
            title: 'Melting & Boiling Points Lab (0°C and 100°C)',
            type: 'guided-practice',
            stagesIncluded: ['Learn', 'Guided practice', 'Checkpoint'],
            estimatedMinutes: 7,
            skillIds: ['skill-phase-change'],
            applyActivityPrompt:
              'Find the exact temperature threshold where solid ice begins melting into liquid water.',
            plainLanguageObjective:
              'Use the Celsius thermometer lab to identify when melting (0°C) and boiling (100°C) occur.',
            visualAltDescription:
              'Interactive Celsius thermometer with phase boundary markers at 0°C and 100°C.'
          })
        ]
      },
      {
        id: 'unit-elem-sci-3',
        unitNumber: 3,
        title: 'Matter in Living Habitats',
        learningGoal:
          'Connect evaporation and condensation to cloud formation and living plant habitats.',
        modules: [
          createAccessibleModule({
            id: 'mod-elem-sci-u3-m1',
            lessonId: 'elem-sci-matter',
            title: 'Evaporation & Condensation in Nature',
            type: 'checkpoint',
            stagesIncluded: ['Apply', 'Checkpoint', 'Review/reflection'],
            estimatedMinutes: 8,
            skillIds: ['skill-water-cycle'],
            applyActivityPrompt:
              'Heat liquid water above 100°C and explain how water vapor rises to form clouds.',
            plainLanguageObjective:
              'Explain how solar heating causes liquid water to evaporate into gas and condense into rain.',
            visualAltDescription:
              'Diagram linking thermal energy input to water vapor formation and condensation.'
          })
        ]
      }
    ]
  },

  // ============================================================================
  // 3. MIDDLE SCHOOL LAUNCH COURSE: Algebra Foundations: Patterns, Equations & Graphs
  // ============================================================================
  {
    id: 'course-mid-alg',
    title: 'Algebra Foundations: Patterns, Equations & Graphs',
    schoolLevel: 'middle',
    gradeRange: 'Middle School (Grades 6–8)',
    subject: 'Mathematics',
    isLaunchCourse: true,
    published: true,
    accessibilityGatePassed: true,
    badgeEmoji: '⚖️',
    instructorName: 'Mr. Marcus Sterling',
    classContext: 'Grade 7 Algebra Studio (Class Code: ALG-7310)',
    purpose:
      'Master variables, inverse operations, and linear relationships by keeping an equation balanced like a two-pan scale.',
    accessibleOverview:
      'Pairs symbolic algebra steps with an interactive balance scale, color-and-label-coded steps, and untimed mastery checks.',
    primaryLessonId: 'mid-math-linear',
    skills: [
      {
        id: 'skill-equality-balance',
        title: 'Maintaining equality across both sides of an equation',
        unitId: 'unit-mid-alg-1',
        defaultMastery: 'practicing'
      },
      {
        id: 'skill-inverse-ops',
        title: 'Using inverse operations to isolate a variable',
        unitId: 'unit-mid-alg-2',
        defaultMastery: 'not_started'
      },
      {
        id: 'skill-two-step-eq',
        title: 'Solving and verifying two-step linear equations',
        unitId: 'unit-mid-alg-3',
        defaultMastery: 'not_started'
      }
    ],
    units: [
      {
        id: 'unit-mid-alg-1',
        unitNumber: 1,
        title: 'Variables & The Balance Scale of Equality',
        learningGoal:
          'Model an equation as a balanced scale where both sides hold the exact same value.',
        modules: [
          createAccessibleModule({
            id: 'mid-math-linear',
            lessonId: 'mid-math-linear',
            title: 'Linear Equations & The Balance Scale',
            estimatedMinutes: 10,
            skillIds: ['skill-equality-balance'],
            applyActivityPrompt:
              'Use the Algebra Balance Scale to test values of x until the left pan (2x + 3) equals the right pan (11).',
            plainLanguageObjective:
              'Solve two-step linear equations like 2x + 3 = 11 by keeping both sides of the balance scale equal.',
            visualAltDescription:
              'Two-pan balance scale comparing Left Pan (2x + 3) and Right Pan (11) with explicit Balanced/Tilted text status.'
          })
        ]
      },
      {
        id: 'unit-mid-alg-2',
        unitNumber: 2,
        title: 'Inverse Operations Step by Step',
        learningGoal:
          'Undo addition/subtraction first and multiplication/division second to isolate x.',
        modules: [
          createAccessibleModule({
            id: 'mod-mid-alg-u2-m1',
            lessonId: 'mid-math-linear',
            title: 'Isolating Variables with Inverse Operations',
            type: 'guided-practice',
            stagesIncluded: ['Learn', 'Guided practice', 'Checkpoint'],
            estimatedMinutes: 9,
            skillIds: ['skill-inverse-ops'],
            applyActivityPrompt:
              'Practice undoing constant terms before dividing by the coefficient on the balance scale.',
            plainLanguageObjective:
              'Identify the correct inverse operation to isolate x in one- and two-step equations.',
            visualAltDescription:
              'Step-by-step equation transformer showing subtraction and division on both sides.'
          })
        ]
      },
      {
        id: 'unit-mid-alg-3',
        unitNumber: 3,
        title: 'Patterns, Tables & Solution Verification',
        learningGoal:
          'Verify algebraic solutions by substituting x back into the original equation.',
        modules: [
          createAccessibleModule({
            id: 'mod-mid-alg-u3-m1',
            lessonId: 'mid-math-linear',
            title: 'Verifying Solutions by Substitution',
            type: 'checkpoint',
            stagesIncluded: ['Apply', 'Checkpoint', 'Review/reflection'],
            estimatedMinutes: 8,
            skillIds: ['skill-two-step-eq'],
            applyActivityPrompt:
              'Substitute your solution back into 2x + 3 = 11 to prove both pans equal 11.',
            plainLanguageObjective:
              'Check any proposed solution for x by substituting it into the original equation.',
            visualAltDescription:
              'Substitution verification table showing left-hand and right-hand values.'
          })
        ]
      }
    ]
  },

  // ============================================================================
  // 4. MIDDLE SCHOOL EXPANSION COURSE: Life and Earth Systems
  // ============================================================================
  {
    id: 'course-mid-sci',
    title: 'Life and Earth Systems',
    schoolLevel: 'middle',
    gradeRange: 'Middle School (Grades 6–8)',
    subject: 'Science',
    isLaunchCourse: false,
    published: true,
    accessibilityGatePassed: true,
    badgeEmoji: '🌿',
    instructorName: 'Mr. Marcus Sterling',
    classContext: 'Grade 7 Life Science Lab',
    purpose:
      'Investigate how energy flows from sunlight to producers, herbivores, carnivores, and decomposers across Earth’s ecosystems.',
    accessibleOverview:
      'Includes an interactive trophic population simulator with explicit status labels, audio captions, and guided cause-and-effect steps.',
    primaryLessonId: 'mid-sci-ecosystems',
    skills: [
      {
        id: 'skill-trophic-flow',
        title: 'Tracing energy flow across producers, consumers, and decomposers',
        unitId: 'unit-mid-sci-1',
        defaultMastery: 'not_started'
      },
      {
        id: 'skill-ten-percent-rule',
        title: 'Calculating energy transfer using the 10% energy pyramid rule',
        unitId: 'unit-mid-sci-2',
        defaultMastery: 'not_started'
      },
      {
        id: 'skill-ecosystem-stability',
        title: 'Predicting population changes when resources shift',
        unitId: 'unit-mid-sci-3',
        defaultMastery: 'not_started'
      }
    ],
    units: [
      {
        id: 'unit-mid-sci-1',
        unitNumber: 1,
        title: 'Producers, Consumers & Decomposers',
        learningGoal:
          'Trace how solar energy enters a food web through photosynthesis and cycles through decomposers.',
        modules: [
          createAccessibleModule({
            id: 'mid-sci-ecosystems',
            lessonId: 'mid-sci-ecosystems',
            title: 'Ecosystems & Food Webs: Energy Flow',
            estimatedMinutes: 10,
            skillIds: ['skill-trophic-flow'],
            applyActivityPrompt:
              'Adjust the sunlight and plant levels in the Ecosystem Simulator to stabilize the valley food web.',
            plainLanguageObjective:
              'Explain how producers, consumers, and decomposers depend on one another in a food web.',
            visualAltDescription:
              'Interactive 4-level trophic simulator (Sunlight, Producers, Rabbits, Hawks) with text stability readout.'
          })
        ]
      },
      {
        id: 'unit-mid-sci-2',
        unitNumber: 2,
        title: 'The 10% Energy Pyramid',
        learningGoal:
          'Compute available energy at each trophic level when 90% is used or released as heat.',
        modules: [
          createAccessibleModule({
            id: 'mod-mid-sci-u2-m1',
            lessonId: 'mid-sci-ecosystems',
            title: 'Calculating Trophic Energy Transfer (10% Rule)',
            type: 'guided-practice',
            stagesIncluded: ['Learn', 'Guided practice', 'Checkpoint'],
            estimatedMinutes: 9,
            skillIds: ['skill-ten-percent-rule'],
            applyActivityPrompt:
              'Trace 10,000 kcal of plant energy up to primary and secondary consumers.',
            plainLanguageObjective:
              'Divide energy by 10 at each step up the food chain to find how much energy is stored.',
            visualAltDescription:
              'Energy pyramid chart showing 10,000 kcal in producers, 1,000 kcal in herbivores, and 100 kcal in predators.'
          })
        ]
      },
      {
        id: 'unit-mid-sci-3',
        unitNumber: 3,
        title: 'Ecosystem Stability & Resource Shifts',
        learningGoal:
          'Predict how droughts or habitat restoration ripple across trophic levels.',
        modules: [
          createAccessibleModule({
            id: 'mod-mid-sci-u3-m1',
            lessonId: 'mid-sci-ecosystems',
            title: 'Food Web Ripple Effects & Restoration',
            type: 'checkpoint',
            stagesIncluded: ['Apply', 'Checkpoint', 'Review/reflection'],
            estimatedMinutes: 9,
            skillIds: ['skill-ecosystem-stability'],
            applyActivityPrompt:
              'Restore producer populations in the simulator after a simulated drought and observe herbivore recovery.',
            plainLanguageObjective:
              'Predict what happens to herbivore and predator populations when green plants decrease or recover.',
            visualAltDescription:
              'Population balance meter showing cause-and-effect changes across trophic levels.'
          })
        ]
      }
    ]
  },

  // ============================================================================
  // 5. HIGH SCHOOL LAUNCH COURSE: Algebra, Functions & Kinematics
  // ============================================================================
  {
    id: 'course-high-phys',
    title: 'Algebra, Functions & Kinematics',
    schoolLevel: 'high',
    gradeRange: 'High School (Grades 9–12)',
    subject: 'Physics & Applied Math',
    isLaunchCourse: true,
    published: true,
    accessibilityGatePassed: true,
    badgeEmoji: '🚀',
    instructorName: 'Dr. Priya Nair',
    classContext:
      'High School Quantitative Physics & Functions (Class Code: KIN-9042)',
    purpose:
      'Connect linear and quadratic functions to real-world motion: velocity, acceleration, slope, and displacement.',
    accessibleOverview:
      'Combines an interactive rover motion lab with algebraic tables, screen-reader-friendly equations, and Socratic AI scaffolding.',
    primaryLessonId: 'high-phys-kinematics',
    skills: [
      {
        id: 'skill-vel-disp',
        title: 'Distinguishing scalar speed from vector velocity and displacement',
        unitId: 'unit-high-phys-1',
        defaultMastery: 'not_started'
      },
      {
        id: 'skill-accel-formula',
        title: 'Calculating acceleration as rate of change of velocity (a = Δv / t)',
        unitId: 'unit-high-phys-2',
        defaultMastery: 'not_started'
      },
      {
        id: 'skill-motion-graphs',
        title: 'Interpreting slope on position-time and velocity-time graphs',
        unitId: 'unit-high-phys-3',
        defaultMastery: 'not_started'
      }
    ],
    units: [
      {
        id: 'unit-high-phys-1',
        unitNumber: 1,
        title: 'Vectors, Velocity & Displacement',
        learningGoal:
          'Model position and displacement using signed vector quantities and linear functions.',
        modules: [
          createAccessibleModule({
            id: 'high-phys-kinematics',
            lessonId: 'high-phys-kinematics',
            title: 'Kinematics: Velocity, Acceleration & Motion Graphs',
            estimatedMinutes: 12,
            skillIds: ['skill-vel-disp'],
            applyActivityPrompt:
              'Set initial velocity, acceleration, and time in the Kinematics Motion Lab to compute final velocity and displacement.',
            plainLanguageObjective:
              'Calculate final velocity (v = v0 + at) and distinguish vector displacement from scalar distance.',
            visualAltDescription:
              'Interactive rover track displaying live numeric readouts for initial velocity v0, acceleration a, time t, final velocity vf, and displacement d.'
          })
        ]
      },
      {
        id: 'unit-high-phys-2',
        unitNumber: 2,
        title: 'Constant Acceleration & Rate of Change',
        learningGoal:
          'Apply v_f = v_0 + a·t and d = v_0·t + 0.5·a·t² to multi-step motion scenarios.',
        modules: [
          createAccessibleModule({
            id: 'mod-high-phys-u2-m1',
            lessonId: 'high-phys-kinematics',
            title: 'Solving Acceleration & Braking Problems',
            type: 'guided-practice',
            stagesIncluded: ['Learn', 'Guided practice', 'Checkpoint'],
            estimatedMinutes: 10,
            skillIds: ['skill-accel-formula'],
            applyActivityPrompt:
              'Model negative acceleration (braking) in the Rover Lab and verify when final velocity reaches 0 m/s.',
            plainLanguageObjective:
              'Compute positive and negative acceleration from initial velocity, final velocity, and elapsed time.',
            visualAltDescription:
              'Step-by-step algebraic breakdown of a = (v_f - v_0) / t with unit verification.'
          })
        ]
      },
      {
        id: 'unit-high-phys-3',
        unitNumber: 3,
        title: 'Graphical Analysis of Motion',
        learningGoal:
          'Determine velocity from the slope of a position-time graph and acceleration from a velocity-time graph.',
        modules: [
          createAccessibleModule({
            id: 'mod-high-phys-u3-m1',
            lessonId: 'high-phys-kinematics',
            title: 'Slope & Area on Motion Graphs',
            type: 'checkpoint',
            stagesIncluded: ['Apply', 'Checkpoint', 'Review/reflection'],
            estimatedMinutes: 10,
            skillIds: ['skill-motion-graphs'],
            applyActivityPrompt:
              'Compare zero-slope constant velocity against positive-slope constant acceleration.',
            plainLanguageObjective:
              'Match motion graph slopes to constant position, constant velocity, and constant acceleration.',
            visualAltDescription:
              'Tabular and graphical summary of position-time and velocity-time slopes.'
          })
        ]
      }
    ]
  },

  // ============================================================================
  // 6. HIGH SCHOOL EXPANSION COURSE: Biology: Energy & Systems
  // ============================================================================
  {
    id: 'course-high-bio',
    title: 'Biology: Energy & Systems',
    schoolLevel: 'high',
    gradeRange: 'High School (Grades 9–12)',
    subject: 'Biology',
    isLaunchCourse: false,
    published: true,
    accessibilityGatePassed: true,
    badgeEmoji: '🧬',
    instructorName: 'Dr. Priya Nair',
    classContext: 'High School Molecular & Systems Biology',
    purpose:
      'Understand how cells capture, convert, and spend chemical energy through photosynthesis, cellular respiration, and the ATP–ADP cycle.',
    accessibleOverview:
      'Features an interactive mitochondrial ATP reactor with keyboard sliders, literal summaries, and scaffolded check-ins.',
    primaryLessonId: 'high-bio-atp',
    skills: [
      {
        id: 'skill-atp-cycle',
        title: 'Modeling energy storage and release in the ATP–ADP cycle',
        unitId: 'unit-high-bio-1',
        defaultMastery: 'not_started'
      },
      {
        id: 'skill-aerobic-respiration',
        title: 'Balancing reactants and products of aerobic cellular respiration',
        unitId: 'unit-high-bio-2',
        defaultMastery: 'not_started'
      },
      {
        id: 'skill-anaerobic-comparison',
        title: 'Comparing aerobic ATP yield (~36 ATP) vs. fermentation (2 ATP)',
        unitId: 'unit-high-bio-3',
        defaultMastery: 'not_started'
      }
    ],
    units: [
      {
        id: 'unit-high-bio-1',
        unitNumber: 1,
        title: 'Cellular Respiration & The ATP Battery',
        learningGoal:
          'Explain how cells store energy in ATP’s third phosphate bond and release it as ADP.',
        modules: [
          createAccessibleModule({
            id: 'high-bio-atp',
            lessonId: 'high-bio-atp',
            title: 'Cellular Energy: ATP, Mitochondria & Respiration',
            estimatedMinutes: 11,
            skillIds: ['skill-atp-cycle'],
            applyActivityPrompt:
              'Adjust glucose and oxygen inputs in the Mitochondrial ATP Lab to observe ATP synthesis.',
            plainLanguageObjective:
              'Explain how ATP acts as a rechargeable energy molecule inside living cells.',
            visualAltDescription:
              'Interactive cellular energy lab showing glucose and oxygen inputs and resulting ATP molecule count.'
          })
        ]
      },
      {
        id: 'unit-high-bio-2',
        unitNumber: 2,
        title: 'Mitochondrial Pathways & Reactants',
        learningGoal:
          'Track how glucose and oxygen are converted into ATP, carbon dioxide, and water.',
        modules: [
          createAccessibleModule({
            id: 'mod-high-bio-u2-m1',
            lessonId: 'high-bio-atp',
            title: 'Inputs & Outputs of Aerobic Respiration',
            type: 'guided-practice',
            stagesIncluded: ['Learn', 'Guided practice', 'Checkpoint'],
            estimatedMinutes: 10,
            skillIds: ['skill-aerobic-respiration'],
            applyActivityPrompt:
              'Balance the cellular inputs (Glucose + Oxygen) and outputs (ATP + CO2 + H2O) in the reactor.',
            plainLanguageObjective:
              'Identify the two main inputs (glucose and oxygen) and three outputs of aerobic respiration.',
            visualAltDescription:
              'Input/Output equation diagram for C6H12O6 + 6O2 -> 6CO2 + 6H2O + ~36 ATP.'
          })
        ]
      },
      {
        id: 'unit-high-bio-3',
        unitNumber: 3,
        title: 'Aerobic vs. Anaerobic Energy Systems',
        learningGoal:
          'Compare ATP output when oxygen is abundant (~36 ATP) versus when oxygen is absent (2 ATP).',
        modules: [
          createAccessibleModule({
            id: 'mod-high-bio-u3-m1',
            lessonId: 'high-bio-atp',
            title: 'Comparing Aerobic & Anaerobic ATP Yield',
            type: 'checkpoint',
            stagesIncluded: ['Apply', 'Checkpoint', 'Review/reflection'],
            estimatedMinutes: 9,
            skillIds: ['skill-anaerobic-comparison'],
            applyActivityPrompt:
              'Set oxygen to 0% in the ATP Lab to observe the shift to anaerobic fermentation (2 ATP per glucose).',
            plainLanguageObjective:
              'Compare why cells produce 18 times more ATP when oxygen is present than when oxygen is missing.',
            visualAltDescription:
              'Side-by-side yield comparison bar showing 36 ATP (Aerobic) vs. 2 ATP (Anaerobic).'
          })
        ]
      }
    ]
  }
];

/**
 * Phase 4: Initial Classrooms with Human-Readable Join Codes
 */
export const INITIAL_CLASSROOMS = [
  {
    id: 'class-elem-4a',
    name: 'Grade 4 Visual Math Studio',
    teacherName: 'Ms. Elena Vance',
    schoolLevel: 'elementary',
    gradeRange: 'Elementary (Grades 3–5)',
    subject: 'Mathematics',
    courseId: 'course-elem-math',
    joinCode: 'LUM-4829',
    codeStatus: 'active',
    expiresAt: '2027-06-30',
    requireTeacherApproval: false,
    aiEnabled: true,
    enrolledStudentCount: 18
  },
  {
    id: 'class-mid-7b',
    name: 'Grade 7 Algebra Foundations',
    teacherName: 'Mr. Marcus Sterling',
    schoolLevel: 'middle',
    gradeRange: 'Middle School (Grades 6–8)',
    subject: 'Mathematics',
    courseId: 'course-mid-alg',
    joinCode: 'ALG-7310',
    codeStatus: 'active',
    expiresAt: '2027-06-30',
    requireTeacherApproval: false,
    aiEnabled: true,
    enrolledStudentCount: 22
  },
  {
    id: 'class-high-10p',
    name: 'High School Quantitative Physics',
    teacherName: 'Dr. Priya Nair',
    schoolLevel: 'high',
    gradeRange: 'High School (Grades 9–12)',
    subject: 'Physics & Applied Math',
    courseId: 'course-high-phys',
    joinCode: 'KIN-9042',
    codeStatus: 'active',
    expiresAt: '2027-06-30',
    requireTeacherApproval: false,
    aiEnabled: true,
    enrolledStudentCount: 24
  },
  {
    id: 'class-expired-demo',
    name: 'Archived Fall Workshop',
    teacherName: 'Ms. Elena Vance',
    schoolLevel: 'elementary',
    gradeRange: 'Elementary (Grades 3–5)',
    subject: 'Science',
    courseId: 'course-elem-sci',
    joinCode: 'EXP-1001',
    codeStatus: 'expired',
    expiresAt: '2025-01-01',
    requireTeacherApproval: false,
    aiEnabled: true,
    enrolledStudentCount: 0
  },
  {
    id: 'class-revoked-demo',
    name: 'Closed Pilot Section',
    teacherName: 'Mr. Marcus Sterling',
    schoolLevel: 'middle',
    gradeRange: 'Middle School (Grades 6–8)',
    subject: 'Science',
    courseId: 'course-mid-sci',
    joinCode: 'REV-2002',
    codeStatus: 'revoked',
    expiresAt: '2027-06-30',
    requireTeacherApproval: false,
    aiEnabled: false,
    enrolledStudentCount: 0
  }
];

/**
 * Validate a classroom join code transactionally (Phase 4)
 */
export function validateJoinCodeTransaction(
  codeInput = '',
  classrooms = INITIAL_CLASSROOMS
) {
  const normalized = String(codeInput || '').trim().toUpperCase();
  if (!normalized || !/^[A-Z0-9]{3,4}-[A-Z0-9]{4}$/.test(normalized)) {
    return {
      valid: false,
      reason: 'malformed',
      message:
        'Enter a valid class code in the format ABC-1234 (for example, LUM-4829).'
    };
  }

  const matched = classrooms.find(
    (c) => c.joinCode.toUpperCase() === normalized
  );

  if (!matched) {
    return {
      valid: false,
      reason: 'not_found',
      message:
        'No classroom matched that code. Check with your teacher and try again.'
    };
  }

  if (matched.codeStatus === 'expired') {
    return {
      valid: false,
      reason: 'expired',
      message: `Class code ${normalized} has expired. Ask ${matched.teacherName} for a current join code.`
    };
  }

  if (matched.codeStatus === 'revoked') {
    return {
      valid: false,
      reason: 'revoked',
      message: `Class code ${normalized} was revoked by the teacher and can no longer be used.`
    };
  }

  return {
    valid: true,
    reason: 'active',
    classroom: matched,
    message: `Ready to join ${matched.name} (${matched.teacherName}).`
  };
}
