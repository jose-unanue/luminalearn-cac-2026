/**
 * K-12 Universal Design for Learning (UDL) Curriculum & Extensible LMS Data
 *
 * Spans 3 School Ranges:
 *   1. Elementary School (Grades K-5)
 *   2. Middle School (Grades 6-8)
 *   3. High School (Grades 9-12)
 *
 * Includes 3 Flagship Core MVP Modules (Elementary Math, Middle School Science, High School Math/Physics)
 * plus 3 Additional Cross-Grade Math & Science Modules, and supports unlimited AI-Generated Lessons.
 */

export const INITIAL_LESSONS = [
  // ============================================================================
  // CORE MVP TOPIC 1: ELEMENTARY SCHOOL (K-5) — MATHEMATICS
  // ============================================================================
  {
    id: 'elem-math-fractions',
    title: 'Fractions & Fair Shares: Visual Number Sense',
    subtitle: 'Understand numerators, denominators, and equivalent fractions using visual slices and bars.',
    schoolLevel: 'elementary',
    gradeRange: 'Elementary (Grades 3–5)',
    subject: 'Mathematics',
    isCoreMVP: true,
    estimatedMinutes: 8,
    xpReward: 150,
    badgeName: 'Fraction Architect',
    badgeEmoji: '🍕',
    questStory: {
      title: 'Quest: The Starlight Bakery Fair-Share Challenge',
      mission: 'Chef Nova needs your help slicing flatbreads and berry bars so every explorer gets an equal share before launch!'
    },
    manipulativeType: 'fraction-lab',
    vocabulary: [
      {
        term: 'Fraction',
        syllables: 'Frac • tion',
        emoji: '🧩',
        definition: 'A number that shows equal parts of a whole object or group.'
      },
      {
        term: 'Numerator',
        syllables: 'Nu • mer • a • tor',
        emoji: '⬆️',
        definition: 'The top number in a fraction. It counts how many equal parts we have shaded or selected.'
      },
      {
        term: 'Denominator',
        syllables: 'De • nom • i • na • tor',
        emoji: '⬇️',
        definition: 'The bottom number in a fraction. It tells the total number of equal parts in the whole.'
      },
      {
        term: 'Equivalent',
        syllables: 'E • quiv • a • lent',
        emoji: '⚖️',
        definition: 'Two fractions that look different in numbers (like 1/2 and 2/4) but cover the exact same amount.'
      }
    ],
    microCards: [
      {
        id: 'card-1',
        stepLabel: 'Step 1: Equal Parts Make a Fraction',
        title: 'What Makes a Fraction Fair?',
        standardText: 'Imagine sharing a giant pizza with a friend. A fraction only works when every single piece is the exact same size. If a whole bar is cut into 4 equal pieces and you take 3 pieces, you have 3/4 (three-fourths) of the bar.',
        literalText: 'A fraction measures equal parts of 1 whole object. Every part must be the exact same size. When 1 whole bar is divided into 4 equal parts and 3 parts are selected, the fraction is written as 3/4.',
        visualCallout: 'Top Number (Numerator) = Parts Selected (3)  |  Bottom Number (Denominator) = Total Equal Parts (4)'
      },
      {
        id: 'card-2',
        stepLabel: 'Step 2: Numerator vs. Denominator',
        title: 'Meet the Top and Bottom Numbers',
        standardText: 'Memory trick: "Numerator UP North, Denominator DOWN Below!" As the bottom number (denominator) gets bigger, each individual slice actually gets smaller because you are sharing the same whole among more pieces.',
        literalText: 'The top number is the Numerator (how many parts you have). The bottom number is the Denominator (how many equal parts make 1 whole). Dividing 1 whole into 8 parts makes each part smaller than dividing 1 whole into 2 parts.',
        visualCallout: 'Compare: 1/2 of a bar is LARGER than 1/8 of the same bar!'
      },
      {
        id: 'card-3',
        stepLabel: 'Step 3: Equivalent Fractions',
        title: 'Different Numbers, Same Amount!',
        standardText: 'Try slicing 1/2 of a flatbread into two smaller pieces. Now you have 2/4! Even though the numerator and denominator both doubled, the total amount of food did not change at all. We call 1/2 and 2/4 equivalent fractions.',
        literalText: 'Multiplying the numerator and the denominator by the same number creates an equivalent fraction. For example: (1 × 2) / (2 × 2) = 2/4. Both 1/2 and 2/4 represent the exact same quantity.',
        visualCallout: '1/2  =  2/4  =  4/8  (All cover exactly 50% of the bar!)'
      }
    ],
    questions: [
      {
        id: 'q-frac-1',
        prompt: 'A energy bar is cut into 6 equal pieces. Maya eats 4 of those pieces. Which fraction shows how much of the bar Maya ate?',
        literalPrompt: 'An energy bar has 6 equal parts in total. Maya takes 4 parts. Select the fraction with 4 as the numerator and 6 as the denominator.',
        options: ['4/6', '6/4', '2/6', '4/10'],
        correctIndex: 0,
        hints: [
          'Remember: The top number (numerator) counts the pieces Maya ate.',
          'Maya ate 4 pieces out of 6 total equal pieces, so 4 goes on top and 6 goes on the bottom.'
        ],
        explanation: '4/6 is correct because the numerator (top) is the 4 pieces Maya ate, and the denominator (bottom) is the 6 total equal pieces in the whole bar.',
        stepByStep: [
          { label: 'Step 1 (Identify Parts Chosen)', detail: 'Count the pieces Maya ate → Numerator = 4 (Top Number)', color: 'indigo' },
          { label: 'Step 2 (Identify Total Whole)', detail: 'Count the total equal pieces in 1 whole bar → Denominator = 6 (Bottom Number)', color: 'emerald' },
          { label: 'Step 3 (Combine as Fraction)', detail: 'Place Numerator over Denominator → 4/6', color: 'amber' }
        ]
      },
      {
        id: 'q-frac-2',
        prompt: 'Which fraction represents the EXACT same amount (is equivalent to) 1/2?',
        literalPrompt: 'Select the fraction that is equal in value to 1/2.',
        options: ['1/4', '3/6', '2/6', '3/4'],
        correctIndex: 1,
        hints: [
          'In 1/2, the top number (1) is exactly half of the bottom number (2).',
          'Look at the choices: in which fraction is the top number exactly half of 6?'
        ],
        explanation: '3/6 is equivalent to 1/2 because 3 is half of 6! If you multiply both the top and bottom of 1/2 by 3, you get (1×3)/(2×3) = 3/6.',
        stepByStep: [
          { label: 'Step 1 (Start with 1/2)', detail: 'We want an equivalent fraction with denominator 6.', color: 'indigo' },
          { label: 'Step 2 (Scale Both Numbers Equally)', detail: 'Multiply top and bottom by 3: (1 × 3) / (2 × 3)', color: 'emerald' },
          { label: 'Step 3 (Verify Visual Half)', detail: '3 out of 6 blocks covers 50% of the bar → 3/6 = 1/2', color: 'amber' }
        ]
      },
      {
        id: 'q-frac-3',
        prompt: 'Two identical fruit tarts are on the table. Tart A is cut into 3 equal slices (you get 1/3). Tart B is cut into 8 equal slices (you get 1/8). Which slice is LARGER?',
        literalPrompt: 'Compare 1/3 and 1/8 of the same whole. Which fraction represents the larger piece?',
        options: [
          '1/3 is larger because the whole is shared among fewer pieces',
          '1/8 is larger because 8 is bigger than 3',
          'Both slices are the exact same size',
          'Neither slice can be compared'
        ],
        correctIndex: 0,
        hints: [
          'Think about sharing 1 tart among 3 people versus sharing that same tart among 8 people.',
          'When you cut a tart into fewer pieces (3 instead of 8), each piece stays much bigger!'
        ],
        explanation: '1/3 is larger than 1/8. When the numerator is the same (1), a smaller denominator means the whole is divided into fewer, larger parts.',
        stepByStep: [
          { label: 'Step 1 (Compare Denominators)', detail: 'Tart A is split into 3 parts; Tart B is split into 8 parts.', color: 'indigo' },
          { label: 'Step 2 (Visualize Part Size)', detail: '1 whole ÷ 3 ≈ 33.3% per slice, while 1 whole ÷ 8 = 12.5% per slice.', color: 'emerald' },
          { label: 'Step 3 (Conclusion)', detail: 'Therefore, 1/3 > 1/8.', color: 'amber' }
        ]
      }
    ]
  },

  // ============================================================================
  // CORE MVP TOPIC 2: MIDDLE SCHOOL (6-8) — SCIENCE (LIFE & EARTH SYSTEMS)
  // ============================================================================
  {
    id: 'mid-sci-ecosystems',
    title: 'Ecosystems, Food Webs & The 10% Energy Rule',
    subtitle: 'Explore how sunlight flows through producers, consumers, and decomposers in living ecosystems.',
    schoolLevel: 'middle',
    gradeRange: 'Middle School (Grades 6–8)',
    subject: 'Science',
    isCoreMVP: true,
    estimatedMinutes: 10,
    xpReward: 200,
    badgeName: 'Biome Guardian',
    badgeEmoji: '🌿',
    questStory: {
      title: 'Quest: Guardians of the Living Biosphere',
      mission: 'Balance the trophic energy pyramid in the Emerald Valley Reserve so producers, herbivores, and apex predators thrive together!'
    },
    manipulativeType: 'ecosystem-lab',
    vocabulary: [
      {
        term: 'Producer (Autotroph)',
        syllables: 'Pro • du • cer',
        emoji: '🌻',
        definition: 'An organism (like plants or algae) that makes its own food from sunlight using photosynthesis.'
      },
      {
        term: 'Consumer (Heterotroph)',
        syllables: 'Con • su • mer',
        emoji: '🦌',
        definition: 'An organism that must eat other plants or animals to get energy.'
      },
      {
        term: 'Decomposer',
        syllables: 'De • com • po • ser',
        emoji: '🍄',
        definition: 'Organisms like fungi and bacteria that break down dead matter and recycle nutrients back into the soil.'
      },
      {
        term: 'Trophic Level',
        syllables: 'Tro • phic  Lev • el',
        emoji: '🔺',
        definition: 'The step or position an organism occupies in a food chain or energy pyramid.'
      }
    ],
    microCards: [
      {
        id: 'eco-1',
        stepLabel: 'Step 1: Where Energy Starts',
        title: 'Producers Capture Sunlight Energy',
        standardText: 'Every food web on Earth starts with an energy source—almost always the Sun! Producers (like grass, trees, and ocean kelp) capture solar energy and convert water and carbon dioxide into glucose (chemical energy) through photosynthesis.',
        literalText: 'Sunlight provides the primary energy for ecosystems. Producers (plants and algae) convert light energy into chemical food energy via photosynthesis. They form Level 1 (the base) of the energy pyramid.',
        visualCallout: 'Sun ☀️ → Producers (Plants/Algae) 🌱 → Primary Consumers (Herbivores) 🐇 → Secondary/Apex Predators 🦅'
      },
      {
        id: 'eco-2',
        stepLabel: 'Step 2: Arrows Show Energy Flow',
        title: 'What Do Food Web Arrows Mean?',
        standardText: 'In a scientific food web, the arrow ALWAYS points in the direction energy flows—from the organism being eaten TO the organism that eats it! So "Grass → Rabbit → Fox" means energy flows from the grass into the rabbit, and from the rabbit into the fox.',
        literalText: 'Food web arrows indicate the direction of energy transfer. An arrow pointing from Organism A to Organism B (A → B) means Organism B eats Organism A and receives its energy.',
        visualCallout: 'Rule: Arrow = "Gives Energy To" (Berries → Mouse → Owl)'
      },
      {
        id: 'eco-3',
        stepLabel: 'Step 3: The 10% Energy Rule',
        title: 'Why Are There Fewer Apex Predators?',
        standardText: 'When a rabbit eats grass, does the fox get 100% of that energy? No! About 90% of energy at each trophic level is used for living, moving, and released as heat. Only about 10% of the energy is stored and passed up to the next level!',
        literalText: 'According to the 10% Rule of Trophic Efficiency, only 10% of the energy at one trophic level transfers to the next level above it. The remaining 90% is used for cellular metabolism or lost as thermal heat. Example: 10,000 kcal in Plants → 1,000 kcal in Herbivores → 100 kcal in Predators.',
        visualCallout: 'Level 1: 10,000 J → Level 2: 1,000 J (÷10) → Level 3: 100 J (÷10) → Level 4: 10 J (÷10)'
      }
    ],
    questions: [
      {
        id: 'q-eco-1',
        prompt: 'If the producers (plants) in a meadow ecosystem store 5,000 kilocalories (kcal) of energy, approximately how much energy will be available to the Secondary Consumers (Level 3, such as snakes that eat mice)?',
        literalPrompt: 'Apply the 10% energy rule twice: Level 1 (Producers) has 5,000 kcal. Level 2 (Primary Consumers) gets 10% of Level 1. Level 3 (Secondary Consumers) gets 10% of Level 2. Calculate Level 3 energy.',
        options: ['5,000 kcal', '500 kcal', '50 kcal', '5 kcal'],
        correctIndex: 2,
        hints: [
          'Each step up the energy pyramid keeps only 10% (which means dividing by 10 at each step).',
          'Level 1 (Plants) = 5,000 kcal → Level 2 (Mice) = 500 kcal → Now divide by 10 one more time for Level 3 (Snakes)!'
        ],
        explanation: '50 kcal is correct! Moving from Producers (5,000 kcal) to Primary Consumers leaves 10% (500 kcal). Moving to Secondary Consumers leaves 10% of 500 kcal, which is 50 kcal.',
        stepByStep: [
          { label: 'Step 1 (Level 1: Producers)', detail: 'Start with 5,000 kcal stored in meadow plants.', color: 'indigo' },
          { label: 'Step 2 (Level 2: Primary Consumers)', detail: 'Multiply by 10% (or ÷ 10): 5,000 ÷ 10 = 500 kcal.', color: 'emerald' },
          { label: 'Step 3 (Level 3: Secondary Consumers)', detail: 'Multiply by 10% again (÷ 10): 500 ÷ 10 = 50 kcal.', color: 'amber' }
        ]
      },
      {
        id: 'q-eco-2',
        prompt: 'In the food chain "Kelp → Sea Urchin → Sea Otter", what happens immediately if Sea Otters are removed from the ecosystem?',
        literalPrompt: 'In the chain Kelp → Sea Urchin → Sea Otter, Sea Otters eat Sea Urchins, and Sea Urchins eat Kelp. If Sea Otters disappear, what happens to the Sea Urchin and Kelp populations?',
        options: [
          'Sea Urchins increase rapidly and overgraze (destroy) the Kelp forest',
          'Kelp grows out of control because Sea Otters ate Kelp',
          'Sea Urchins immediately go extinct without Sea Otters',
          'Nothing changes in the ecosystem'
        ],
        correctIndex: 0,
        hints: [
          'Who eats the Sea Urchins? The Sea Otters!',
          'Without Sea Otters hunting them, the Sea Urchin population multiplies and eats up the Kelp.'
        ],
        explanation: 'Without Sea Otters (the predator), the Sea Urchin population grows unchecked and consumes the Kelp forest. This is a classic real-world "trophic cascade"!',
        stepByStep: [
          { label: 'Step 1 (Identify Predator-Prey Link)', detail: 'Sea Otters prey on Sea Urchins.', color: 'indigo' },
          { label: 'Step 2 (Remove Predator)', detail: 'Removing Sea Otters causes Sea Urchin numbers to surge.', color: 'emerald' },
          { label: 'Step 3 (Impact on Producers)', detail: 'More Sea Urchins eat more Kelp, causing the Kelp population to crash.', color: 'amber' }
        ]
      },
      {
        id: 'q-eco-3',
        prompt: 'Which organisms are responsible for breaking down dead leaves and animal remains so nutrients return to the soil for plants?',
        literalPrompt: 'Select the category of organisms (such as fungi and bacteria) that chemically break down dead organic matter into soil nutrients.',
        options: ['Producers', 'Primary Herbivores', 'Decomposers', 'Apex Predators'],
        correctIndex: 2,
        hints: [
          'Think about mushrooms (fungi) and soil bacteria.',
          'They "decompose" dead material to recycle nutrients!'
        ],
        explanation: 'Decomposers (like fungi, mushrooms, and bacteria) recycle dead organic matter back into vital mineral nutrients that producers need to grow.',
        stepByStep: [
          { label: 'Step 1 (Analyze Role)', detail: 'Dead matter contains trapped carbon and nitrogen.', color: 'indigo' },
          { label: 'Step 2 (Match Organism Type)', detail: 'Decomposers break down dead matter and return nutrients to soil.', color: 'emerald' }
        ]
      }
    ]
  },

  // ============================================================================
  // CORE MVP TOPIC 3: HIGH SCHOOL (9-12) — MATH & PHYSICS (STEM)
  // ============================================================================
  {
    id: 'high-math-linear-kinematics',
    title: 'Linear Functions, Kinematics & Rate of Change (y = mx + b)',
    subtitle: 'Connect algebraic slope and y-intercept to real-world velocity, starting position, and coordinate graphing.',
    schoolLevel: 'high',
    gradeRange: 'High School (Grades 9–12)',
    subject: 'Mathematics',
    isCoreMVP: true,
    estimatedMinutes: 12,
    xpReward: 250,
    badgeName: 'Telemetry Navigator',
    badgeEmoji: '🚀',
    questStory: {
      title: 'Quest: Mars Rover Telemetry & Trajectory Lab',
      mission: 'Program the Perseverance-II Rover trajectory by modeling its starting coordinate (b) and constant velocity (m) across Jezero Crater!'
    },
    manipulativeType: 'linear-motion-lab',
    vocabulary: [
      {
        term: 'Slope (m)',
        syllables: 'Slope (Rate of Change)',
        emoji: '📈',
        definition: 'The steepness of a line, calculated as Rise over Run: m = (y₂ - y₁) / (x₂ - x₁). In physics, slope on a position-time graph equals velocity.'
      },
      {
        term: 'Y-Intercept (b)',
        syllables: 'Y - In • ter • cept',
        emoji: '📍',
        definition: 'The value of y where the line crosses the vertical y-axis (when x = 0). In motion problems, b is the starting position at time t = 0.'
      },
      {
        term: 'Linear Function',
        syllables: 'Lin • e • ar  Func • tion',
        emoji: '📏',
        definition: 'An algebraic relationship with a constant rate of change whose graph forms a straight line: y = mx + b.'
      }
    ],
    microCards: [
      {
        id: 'lin-1',
        stepLabel: 'Step 1: Decoding y = mx + b',
        title: 'Every Symbol Has a Physical Meaning',
        standardText: 'In algebra and physics, y = mx + b isn\'t just abstract letters—it tells a story of motion! "b" is where you START (when x = 0), and "m" is how fast you CHANGE for every 1 unit of x. In physics, Position x(t) = v·t + x₀ is the exact same equation!',
        literalText: 'In the slope-intercept equation y = mx + b: (1) x is the independent input (such as time in seconds), (2) m is the constant rate of change or slope, (3) b is the initial value when x = 0, and (4) y is the resulting output.',
        visualCallout: 'y (Output Position) = m (Rate / Slope) × x (Input Time) + b (Starting Value at x = 0)'
      },
      {
        id: 'lin-2',
        stepLabel: 'Step 2: Calculating Slope (Rise over Run)',
        title: 'Finding m from Any Two Points',
        standardText: 'Given two coordinate points (x₁, y₁) and (x₂, y₂), slope measures vertical change ("Rise") divided by horizontal change ("Run"): m = (y₂ - y₁) / (x₂ - x₁). If m is positive, the line climbs upward; if m is negative, the line descends.',
        literalText: 'To calculate slope m between (x₁, y₁) and (x₂, y₂): Subtract y₁ from y₂ to find Δy. Subtract x₁ from x₂ to find Δx. Divide Δy by Δx: m = (y₂ - y₁) / (x₂ - x₁).',
        visualCallout: 'Example: From (0, 4) to (2, 10) → Δy = 10 - 4 = 6 | Δx = 2 - 0 = 2 | Slope m = 6 / 2 = 3'
      },
      {
        id: 'lin-3',
        stepLabel: 'Step 3: Predicting Future Values',
        title: 'Solving with Your Linear Model',
        standardText: 'Once you know m and b, you can predict any future state! If a rover starts 4 meters from base (b = 4) and travels at 3 meters per second (m = 3), its equation is y = 3x + 4. At x = 5 seconds, its position is y = 3(5) + 4 = 19 meters.',
        literalText: 'Substitute known values of m, x, and b into y = mx + b using order of operations (multiply m by x first, then add b). For m = 3, x = 5, b = 4: y = (3 × 5) + 4 = 15 + 4 = 19.',
        visualCallout: 'Step A: Multiply m · x (3 × 5 = 15)  →  Step B: Add starting value b (15 + 4 = 19)'
      }
    ],
    questions: [
      {
        id: 'q-lin-1',
        prompt: 'A research drone begins at an altitude of 12 meters (at t = 0 s) and climbs at a constant rate of 4 meters per second. Which linear equation models its altitude y after x seconds, and what is its altitude at x = 5 seconds?',
        literalPrompt: 'Identify the equation y = mx + b where rate m = 4 and initial value b = 12, then calculate y when x = 5.',
        options: [
          'y = 4x + 12; Altitude at 5s is 32 meters',
          'y = 12x + 4; Altitude at 5s is 64 meters',
          'y = 4x - 12; Altitude at 5s is 8 meters',
          'y = 16x; Altitude at 5s is 80 meters'
        ],
        correctIndex: 0,
        hints: [
          'The constant rate of climb (4 m/s) is the slope m, and the starting altitude (12 m) is the y-intercept b.',
          'Plug x = 5 into y = 4x + 12: multiply 4 × 5 first, then add 12!'
        ],
        explanation: 'Since the rate of change m = 4 m/s and initial altitude b = 12 m, the function is y = 4x + 12. Substituting x = 5 gives y = 4(5) + 12 = 20 + 12 = 32 meters.',
        stepByStep: [
          { label: 'Step 1 (Identify Rate m and Start b)', detail: 'Rate of change m = 4 m/s | Starting altitude at x = 0 is b = 12 m.', color: 'indigo' },
          { label: 'Step 2 (Write Linear Function)', detail: 'Substitute m and b into y = mx + b → y = 4x + 12.', color: 'emerald' },
          { label: 'Step 3 (Evaluate at x = 5)', detail: 'y = 4(5) + 12 = 20 + 12 = 32 meters.', color: 'amber' }
        ]
      },
      {
        id: 'q-lin-2',
        prompt: 'A sensor line passes through the points (2, 7) and (6, 19). What is the slope (m) of this line?',
        literalPrompt: 'Calculate the slope m = (y₂ - y₁) / (x₂ - x₁) using (x₁, y₁) = (2, 7) and (x₂, y₂) = (6, 19).',
        options: ['m = 2', 'm = 3', 'm = 4', 'm = 1/3'],
        correctIndex: 1,
        hints: [
          'Use the slope formula: m = (y₂ - y₁) / (x₂ - x₁).',
          'Subtract the y-values on top (19 - 7 = 12) and the x-values on the bottom (6 - 2 = 4), then divide!'
        ],
        explanation: 'Using m = (y₂ - y₁) / (x₂ - x₁), we calculate (19 - 7) / (6 - 2) = 12 / 4 = 3.',
        stepByStep: [
          { label: 'Step 1 (Calculate Vertical Change Δy)', detail: 'y₂ - y₁ = 19 - 7 = 12', color: 'indigo' },
          { label: 'Step 2 (Calculate Horizontal Change Δx)', detail: 'x₂ - x₁ = 6 - 2 = 4', color: 'emerald' },
          { label: 'Step 3 (Divide Rise by Run)', detail: 'm = 12 ÷ 4 = 3', color: 'amber' }
        ]
      },
      {
        id: 'q-lin-3',
        prompt: 'For the linear equation 2x + y = 10, if we rewrite it in slope-intercept form (y = mx + b), what is the slope m and what does it tell us?',
        literalPrompt: 'Solve 2x + y = 10 for y by subtracting 2x from both sides. Identify the coefficient of x (slope m).',
        options: [
          'm = -2; y decreases by 2 units for every 1 unit increase in x',
          'm = 2; y increases by 2 units for every 1 unit increase in x',
          'm = 10; y increases by 10 units for every 1 unit increase in x',
          'm = -5; y decreases by 5 units for every 1 unit increase in x'
        ],
        correctIndex: 0,
        hints: [
          'To isolate y on the left side of 2x + y = 10, subtract 2x from both sides.',
          'That gives y = -2x + 10. What number is multiplying x?'
        ],
        explanation: 'Subtracting 2x from both sides of 2x + y = 10 gives y = -2x + 10. Therefore, the slope m = -2, meaning y decreases by 2 for every 1 unit increase in x.',
        stepByStep: [
          { label: 'Step 1 (Start with Standard Form)', detail: '2x + y = 10', color: 'indigo' },
          { label: 'Step 2 (Isolate y by Subtracting 2x)', detail: 'y = -2x + 10', color: 'emerald' },
          { label: 'Step 3 (Read Slope m)', detail: 'The coefficient of x is m = -2 (a downward rate of 2 per unit x).', color: 'amber' }
        ]
      }
    ]
  },

  // ============================================================================
  // BONUS MODULE 4: ELEMENTARY SCHOOL (K-5) — SCIENCE
  // ============================================================================
  {
    id: 'elem-sci-matter',
    title: 'States of Matter & Thermal Particle Motion',
    subtitle: 'See how heating and cooling transform Solids, Liquids, and Gases at the particle level.',
    schoolLevel: 'elementary',
    gradeRange: 'Elementary (Grades 2–5)',
    subject: 'Science',
    isCoreMVP: false,
    estimatedMinutes: 7,
    xpReward: 140,
    badgeName: 'Matter Alchemist',
    badgeEmoji: '🧊',
    questStory: {
      title: 'Quest: The Cloud-Maker Weather Station',
      mission: 'Adjust the thermal heater to turn glacier ice into liquid streams and rising water vapor clouds!'
    },
    manipulativeType: 'matter-lab',
    vocabulary: [
      {
        term: 'Solid',
        syllables: 'Sol • id',
        emoji: '🧊',
        definition: 'Matter that keeps its own fixed shape and volume because its particles are packed tightly together.'
      },
      {
        term: 'Liquid',
        syllables: 'Liq • uid',
        emoji: '💧',
        definition: 'Matter that keeps a fixed volume but flows to take the shape of its container.'
      },
      {
        term: 'Gas',
        syllables: 'Gas',
        emoji: '☁️',
        definition: 'Matter whose particles move fast and spread out to fill the entire space and shape of any container.'
      }
    ],
    microCards: [
      {
        id: 'mat-1',
        stepLabel: 'Step 1: Everything Is Made of Particles',
        title: 'Solids, Liquids, and Gases',
        standardText: 'All matter around you—from an ice cube to the air you breathe—is made of tiny particles! In a SOLID (like ice), particles are locked tightly in a neat pattern and only vibrate in place, so a solid keeps its own shape.',
        literalText: 'Matter exists in three main states: Solid, Liquid, and Gas. In a Solid, particles are tightly packed and vibrate in fixed positions. A solid has a definite shape and a definite volume.',
        visualCallout: 'Solid 🧊 = Tightly packed, keeps shape | Liquid 💧 = Slides past each other | Gas ☁️ = Zooms far apart!'
      },
      {
        id: 'mat-2',
        stepLabel: 'Step 2: Adding Heat Energy',
        title: 'Melting and Evaporation',
        standardText: 'When you add heat energy to ice, the particles move faster and break free from their rigid pattern—that is MELTING (Solid → Liquid)! Add even more heat and the liquid particles zoom into the air as a gas—that is EVAPORATION (Liquid → Gas)!',
        literalText: 'Adding thermal energy (heat) increases particle speed. Melting changes a Solid to a Liquid at 0°C for water. Boiling/Evaporation changes a Liquid to a Gas at 100°C for water.',
        visualCallout: 'Add Heat 🔥: Solid → (Melting) → Liquid → (Boiling/Evaporation) → Gas'
      }
    ],
    questions: [
      {
        id: 'q-mat-1',
        prompt: 'What happens to the tiny particles inside liquid water when you heat the water until it boils into steam (gas)?',
        literalPrompt: 'Select what happens to particle speed and spacing when liquid water is heated into a gas.',
        options: [
          'The particles gain energy, move much faster, and spread far apart',
          'The particles slow down and lock into a tight crystal grid',
          'The particles disappear completely',
          'The particles shrink in size and stop moving'
        ],
        correctIndex: 0,
        hints: [
          'Think about how heat affects particle energy in the simulator.',
          'Heat is thermal energy—it makes particles move faster and bounce further apart!'
        ],
        explanation: 'Adding heat gives particles kinetic energy, causing them to move faster and spread far apart to become a gas (steam).',
        stepByStep: [
          { label: 'Step 1 (Add Thermal Energy)', detail: 'Heat energy transfers into the liquid water molecules.', color: 'indigo' },
          { label: 'Step 2 (Particle Motion)', detail: 'Molecules vibrate and move faster.', color: 'emerald' },
          { label: 'Step 3 (Phase Change to Gas)', detail: 'Molecules overcome attraction and spread far apart as steam.', color: 'amber' }
        ]
      },
      {
        id: 'q-mat-2',
        prompt: 'Which state of matter has a fixed volume (amount) but flows to take the shape of whatever cup or bottle you pour it into?',
        literalPrompt: 'Identify the state of matter with a definite volume but an indefinite shape.',
        options: ['Solid', 'Liquid', 'Gas', 'Light'],
        correctIndex: 1,
        hints: [
          'Think about pouring juice from a tall carton into a round bowl.',
          'The amount of juice stays the same, but its shape changes to match the bowl!'
        ],
        explanation: 'A liquid has a fixed volume because its particles stay close together, but it changes shape because its particles can slide past one another.',
        stepByStep: [
          { label: 'Step 1 (Check Volume)', detail: 'Particles stay close together → Volume stays constant.', color: 'indigo' },
          { label: 'Step 2 (Check Shape)', detail: 'Particles slide freely → Takes the shape of its container = Liquid.', color: 'emerald' }
        ]
      }
    ]
  },

  // ============================================================================
  // BONUS MODULE 5: MIDDLE SCHOOL (6-8) — MATHEMATICS
  // ============================================================================
  {
    id: 'mid-math-equations',
    title: 'Balancing Two-Step Linear Equations (ax + b = c)',
    subtitle: 'Use a visual balance scale and inverse operations to isolate variables with confidence.',
    schoolLevel: 'middle',
    gradeRange: 'Middle School (Grades 6–8)',
    subject: 'Mathematics',
    isCoreMVP: false,
    estimatedMinutes: 9,
    xpReward: 180,
    badgeName: 'Balance Master',
    badgeEmoji: '⚖️',
    questStory: {
      title: 'Quest: The Alchemist’s Golden Balance Scale',
      mission: 'Keep the ancient equilibrium scale perfectly level while uncovering the hidden weight of each mystery x-crystal!'
    },
    manipulativeType: 'algebra-scale-lab',
    vocabulary: [
      {
        term: 'Variable (x)',
        syllables: 'Var • i • a • ble',
        emoji: '📦',
        definition: 'A letter or symbol that stands for an unknown number we want to find.'
      },
      {
        term: 'Inverse Operation',
        syllables: 'In • verse  Op • er • a • tion',
        emoji: '🔄',
        definition: 'Opposite math operations that undo each other: Addition ↔ Subtraction, and Multiplication ↔ Division.'
      }
    ],
    microCards: [
      {
        id: 'alg-1',
        stepLabel: 'Step 1: An Equation Is a Balanced Scale',
        title: 'The Golden Rule of Algebra',
        standardText: 'Think of the equals sign (=) as the center pivot of a balance scale. Whatever you do to the LEFT side, you must do the exact same thing to the RIGHT side so the scale stays balanced!',
        literalText: 'An equation states that the left expression equals the right expression. To keep both sides equal, any operation performed on the left side must also be performed on the right side.',
        visualCallout: 'Left Side [ 2x + 3 ]  =  Right Side [ 11 ]'
      },
      {
        id: 'alg-2',
        stepLabel: 'Step 2: Two Steps to Isolate x',
        title: 'Undo Addition/Subtraction First, Then Multiplication',
        standardText: 'To solve 2x + 3 = 11: First, remove the +3 by subtracting 3 from both sides (leaving 2x = 8). Second, undo the multiplication by 2 by dividing both sides by 2 (leaving x = 4)!',
        literalText: 'To solve ax + b = c: Step 1: Subtract b from both sides to get ax = c - b. Step 2: Divide both sides by a to get x = (c - b) / a.',
        visualCallout: '2x + 3 = 11  →  (-3 both sides)  →  2x = 8  →  (÷2 both sides)  →  x = 4'
      }
    ],
    questions: [
      {
        id: 'q-alg-1',
        prompt: 'Solve for x on the balance scale: 3x + 4 = 19',
        literalPrompt: 'Find the value of x that makes 3x + 4 = 19 true.',
        options: ['x = 5', 'x = 7', 'x = 15', 'x = 3'],
        correctIndex: 0,
        hints: [
          'Step 1: Subtract 4 from both sides of 3x + 4 = 19 to get 3x by itself.',
          '19 - 4 = 15, so 3x = 15. Now divide both sides by 3!'
        ],
        explanation: 'Subtracting 4 from both sides gives 3x = 15. Dividing both sides by 3 gives x = 5. Check: 3(5) + 4 = 15 + 4 = 19!',
        stepByStep: [
          { label: 'Step 1 (Subtract Constant 4)', detail: '3x + 4 - 4 = 19 - 4  →  3x = 15', color: 'indigo' },
          { label: 'Step 2 (Divide by Coefficient 3)', detail: '3x ÷ 3 = 15 ÷ 3  →  x = 5', color: 'emerald' },
          { label: 'Step 3 (Verify Solution)', detail: 'Plug x = 5 back in: 3(5) + 4 = 19 ✓', color: 'amber' }
        ]
      },
      {
        id: 'q-alg-2',
        prompt: 'Which first step is best to begin solving the equation 4x - 6 = 14?',
        literalPrompt: 'Identify the inverse operation needed first to isolate the 4x term in 4x - 6 = 14.',
        options: [
          'Add 6 to both sides of the equation',
          'Subtract 6 from both sides of the equation',
          'Multiply both sides by 4',
          'Subtract 14 from x'
        ],
        correctIndex: 0,
        hints: [
          'Look at the constant next to 4x: it is - 6 (minus 6).',
          'What is the inverse (opposite) operation of subtracting 6?'
        ],
        explanation: 'Adding 6 is the inverse of subtracting 6. Adding 6 to both sides gives 4x = 20, which then divides cleanly by 4 to give x = 5.',
        stepByStep: [
          { label: 'Step 1 (Identify Constant Operation)', detail: 'The equation has "- 6" attached to 4x.', color: 'indigo' },
          { label: 'Step 2 (Apply Inverse Operation)', detail: 'Add 6 to both sides: 4x - 6 + 6 = 14 + 6 → 4x = 20.', color: 'emerald' }
        ]
      }
    ]
  },

  // ============================================================================
  // BONUS MODULE 6: HIGH SCHOOL (9-12) — SCIENCE (BIOLOGY / BIOCHEMISTRY)
  // ============================================================================
  {
    id: 'high-sci-cellular-energy',
    title: 'Cellular Energy: Photosynthesis & Cellular Respiration Cycle',
    subtitle: 'Model how chloroplasts and mitochondria cycle carbon, oxygen, glucose, and ATP energy.',
    schoolLevel: 'high',
    gradeRange: 'High School (Grades 9–12)',
    subject: 'Science',
    isCoreMVP: false,
    estimatedMinutes: 11,
    xpReward: 230,
    badgeName: 'Bio-Energetics Specialist',
    badgeEmoji: '🧬',
    questStory: {
      title: 'Quest: Orbital Bio-Dome Life Support',
      mission: 'Balance the oxygen, carbon dioxide, and ATP energy loop between the hydroponic chloroplasts and crew mitochondria!'
    },
    manipulativeType: 'cell-energy-lab',
    vocabulary: [
      {
        term: 'ATP (Adenosine Triphosphate)',
        syllables: 'A • T • P',
        emoji: '⚡',
        definition: 'The direct chemical energy currency used by cells to power muscle contraction, active transport, and synthesis.'
      },
      {
        term: 'Chloroplast',
        syllables: 'Chlo • ro • plast',
        emoji: '🌿',
        definition: 'The plant cell organelle that captures sunlight to build glucose (C₆H₁₂O₆) and release oxygen (O₂).'
      },
      {
        term: 'Mitochondria',
        syllables: 'Mi • to • chon • dri • a',
        emoji: '🔋',
        definition: 'The organelle in both plant and animal cells that breaks down glucose with oxygen to generate ~36–38 ATP.'
      }
    ],
    microCards: [
      {
        id: 'bio-1',
        stepLabel: 'Step 1: Photosynthesis (Storing Solar Energy)',
        title: 'Chloroplasts Build Glucose',
        standardText: 'In plant chloroplasts, light energy powers the reaction: 6 CO₂ + 6 H₂O + Light → C₆H₁₂O₆ (Glucose) + 6 O₂. Carbon dioxide and water are the inputs (reactants), while glucose sugar and oxygen gas are the outputs (products).',
        literalText: 'Photosynthesis equation: 6 CO₂ (Carbon Dioxide) + 6 H₂O (Water) + Light Energy → C₆H₁₂O₆ (Glucose) + 6 O₂ (Oxygen). It occurs in the chloroplast and converts light energy into chemical bond energy.',
        visualCallout: 'Inputs: 6 CO₂ + 6 H₂O + Sunlight ☀️  →  Outputs: 1 Glucose (C₆H₁₂O₆) + 6 O₂'
      },
      {
        id: 'bio-2',
        stepLabel: 'Step 2: Aerobic Cellular Respiration (Releasing ATP)',
        title: 'Mitochondria Unlock ATP Currency',
        standardText: 'Look closely at Cellular Respiration: C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O + ~36 ATP! Notice how the products of photosynthesis are the exact reactants of cellular respiration. Together, they form a continuous biological cycle!',
        literalText: 'Aerobic Cellular Respiration equation: C₆H₁₂O₆ (Glucose) + 6 O₂ (Oxygen) → 6 CO₂ (Carbon Dioxide) + 6 H₂O (Water) + ~36 ATP. Both plants and animals perform cellular respiration in their mitochondria.',
        visualCallout: 'PhotosynthesisOutputs (Glucose + O₂)  ⇄  Cellular Respiration Inputs!'
      }
    ],
    questions: [
      {
        id: 'q-bio-1',
        prompt: 'How are the chemical equations for Photosynthesis and Aerobic Cellular Respiration related to each other?',
        literalPrompt: 'Compare the reactants and products of Photosynthesis (6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂) with Cellular Respiration (C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP).',
        options: [
          'The products of Photosynthesis (Glucose & O₂) are the direct reactants of Cellular Respiration',
          'Both processes consume Oxygen and release Glucose',
          'Photosynthesis only happens in animals, while Respiration only happens in plants',
          'Both processes convert ATP directly into sunlight'
        ],
        correctIndex: 0,
        hints: [
          'Look at what Photosynthesis produces: Glucose (C₆H₁₂O₆) and Oxygen (O₂).',
          'What does the mitochondria take IN to start Cellular Respiration?'
        ],
        explanation: 'Photosynthesis produces Glucose and Oxygen, which are the exact starting reactants used by Mitochondria during Cellular Respiration to generate ATP, returning CO₂ and H₂O to complete the cycle.',
        stepByStep: [
          { label: 'Step 1 (Photosynthesis Outputs)', detail: 'Chloroplasts output C₆H₁₂O₆ (Glucose) + 6 O₂.', color: 'indigo' },
          { label: 'Step 2 (Respiration Inputs)', detail: 'Mitochondria take in C₆H₁₂O₆ + 6 O₂.', color: 'emerald' },
          { label: 'Step 3 (Cycle Completion)', detail: 'Mitochondria output 6 CO₂ + 6 H₂O + ATP, feeding back into Photosynthesis.', color: 'amber' }
        ]
      }
    ]
  }
];

/**
 * Extensible LMS Data: Initial Homework Assignments (Teacher/Admin -> Student)
 */
export const INITIAL_HOMEWORK = [
  {
    id: 'hw-1',
    lessonId: 'elem-math-fractions',
    title: 'Visual Fractions & Equivalent Shares Practice',
    assignedToGrade: 'elementary',
    dueDate: 'Friday, Oct 30',
    teacherNote: 'Use the interactive Fraction Bar Builder first, then complete all 3 check-in questions! Remember hints are free.',
    accommodationTag: 'Visual Manipulatives + Multi-Step Hints Enabled',
    completed: false
  },
  {
    id: 'hw-2',
    lessonId: 'mid-sci-ecosystems',
    title: 'Trophic Pyramid & 10% Energy Rule Lab',
    assignedToGrade: 'middle',
    dueDate: 'Monday, Nov 2',
    teacherNote: 'Test the Trophic Energy simulator at 10,000 kcal and answer the 3 ecosystem questions.',
    accommodationTag: 'Closed Captions + Vocabulary Chips Enabled',
    completed: false
  },
  {
    id: 'hw-3',
    lessonId: 'high-math-linear-kinematics',
    title: 'Mars Rover Linear Telemetry (y = mx + b)',
    assignedToGrade: 'high',
    dueDate: 'Wednesday, Nov 4',
    teacherNote: 'Adjust slope (m) and y-intercept (b) on the coordinate graph before solving the trajectory problems.',
    accommodationTag: 'Color-Coded Algebra Steps Enabled',
    completed: false
  }
];

/**
 * Extensible LMS Data: Recommended Study Modules
 */
export const INITIAL_RECOMMENDATIONS = [
  {
    id: 'rec-1',
    lessonId: 'elem-math-fractions',
    reason: 'Matches your Visual Manipulative & Step-by-Step preference for building concrete number sense.',
    tag: 'High Visual Impact • Dyscalculia Friendly'
  },
  {
    id: 'rec-2',
    lessonId: 'mid-sci-ecosystems',
    reason: 'Interactive cause-and-effect simulation with chunked cards and clear food web rules.',
    tag: 'Systems Thinking • ADHD & Autism Friendly'
  },
  {
    id: 'rec-3',
    lessonId: 'high-math-linear-kinematics',
    reason: 'Connects abstract algebra equations directly to live visual motion on a coordinate grid.',
    tag: 'STEM Graphing Lab • Color-Coded Steps'
  }
];

/**
 * Extensible LMS Data: Structured Class Discussion Posts
 * Includes Neurodivergent-Friendly Sentence Starters so students who struggle
 * with open-ended social pragmatics can participate comfortably.
 */
export const DISCUSSION_SENTENCE_STARTERS = [
  '💡 A visual trick that helped me understand this topic is...',
  '❓ I understood Step 1, but I have a question about...',
  '🔗 This connects to real life because I noticed...',
  '✅ One step-by-step strategy I recommend to classmates is...'
];

export const INITIAL_DISCUSSIONS = [
  {
    id: 'disc-1',
    lessonId: 'elem-math-fractions',
    author: 'Ms. Elena Vance (STEM Teacher)',
    role: 'teacher',
    avatar: '👩‍🏫',
    timestamp: '2 hours ago',
    promptTag: 'Pinned Study Tip',
    content: 'Welcome to our Class Study Hub! When comparing fractions like 1/3 and 1/8, try switching on the Fraction Bar Builder. What did you notice happens to the size of each slice as the bottom number (denominator) gets bigger?',
    replies: [
      {
        id: 'rep-1',
        author: 'Leo M. (Grade 4)',
        role: 'student',
        avatar: '🦊',
        timestamp: '1 hour ago',
        content: '💡 A visual trick that helped me understand this topic is seeing the bar split into 8 pieces—each piece gets super skinny compared to when it is only split into 3 pieces!'
      }
    ]
  },
  {
    id: 'disc-2',
    lessonId: 'mid-sci-ecosystems',
    author: 'Maya K. (Grade 7)',
    role: 'student',
    avatar: '🦉',
    timestamp: 'Yesterday',
    promptTag: 'Peer Strategy',
    content: '✅ One step-by-step strategy I recommend to classmates is: for the 10% energy rule, just move the decimal point one spot to the left (divide by 10) each time you climb one step up the pyramid! 5,000 → 500 → 50.',
    replies: []
  }
];

/**
 * Sample Student Roster for the Teacher / Admin Management View
 */
export const INITIAL_STUDENT_ROSTER = [
  {
    id: 'stu-1',
    name: 'Alex Rivera (Current User)',
    gradeBand: 'Elementary / All-Access Demo',
    profileType: 'Adaptive Superpower Profile',
    activeAccommodations: ['Game-Based Quest Mode', 'Visual Math Manipulatives', 'Closed Captions', 'Color-Coded Steps'],
    masteryPercent: 92,
    completedCount: 2,
    streakDays: 5
  },
  {
    id: 'stu-2',
    name: 'Jordan Chen',
    gradeBand: 'Elementary (Grade 4)',
    profileType: 'Autism Sensory-Calm & Predictable',
    activeAccommodations: ['Sensory-Calm Pastel Theme', 'Visual Schedule Roadmap', 'Literal Language Mode', 'Reduced Motion'],
    masteryPercent: 95,
    completedCount: 3,
    streakDays: 8
  },
  {
    id: 'stu-3',
    name: 'Samira Patel',
    gradeBand: 'Middle School (Grade 7)',
    profileType: 'ADHD Focus & Dyslexia Reading Support',
    activeAccommodations: ['Focus Shield', 'Dyslexia Font & Cream Paper', 'Reading Line Ruler', 'Micro-Chunking'],
    masteryPercent: 88,
    completedCount: 4,
    streakDays: 6
  },
  {
    id: 'stu-4',
    name: 'Marcus Vance',
    gradeBand: 'High School (Grade 10)',
    profileType: 'Low-Vision CVI & APD Audio Support',
    activeAccommodations: ['High-Contrast CVI Yellow/Cyan', '130% Font Scale', '0.8x APD Speech Rate', 'Live Captions'],
    masteryPercent: 91,
    completedCount: 3,
    streakDays: 11
  }
];
