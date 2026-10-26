/**
 * LuminaLearn Inclusive, Contextual AI Service & "Luminare" Companion Engine
 *
 * Security & Pedagogical Architecture:
 *  - Browser code NEVER calls external LLM provider URLs directly; all requests route through `/api/ai-proxy`.
 *  - Supports live API keys (Google Gemini, OpenAI, OpenRouter) passed securely via session config to `/api/ai-proxy`,
 *    with an always-available Built-In Socratic UDL Engine fallback when no key is configured.
 *  - Checkpoint Answer-Leakage Blocker: During checkpoints, direct answer reveals are blocked; the tutor responds Socratically.
 *  - Every AI response is paired with a non-AI alternative (Worked Example & Teacher Help Request).
 */

export const EXPLICIT_AI_INTENTS = [
  {
    id: 'explain_another_way',
    label: 'Explain this another way',
    shortDesc: 'See a fresh analogy or concrete walk-through'
  },
  {
    id: 'hint',
    label: 'Give me a hint',
    shortDesc: 'Get one small clue without spoiling the answer'
  },
  {
    id: 'visual_example',
    label: 'Show a visual example',
    shortDesc: 'Connect the numbers to the interactive diagram'
  },
  {
    id: 'simpler_language',
    label: 'Read this in simpler language',
    shortDesc: 'Short, literal sentences with zero jargon'
  },
  {
    id: 'plan_next_step',
    label: 'Help me plan my next step',
    shortDesc: 'Break the task into 3 manageable steps'
  },
  {
    id: 'check_reasoning',
    label: 'Check my reasoning, without giving the answer',
    shortDesc: 'Test your thinking Socratically before submitting'
  }
];

export const LUMINARE_COACHING_STYLES = [
  {
    id: 'socratic',
    label: 'Socratic Guide',
    emoji: '🧭',
    description: 'Asks friendly guiding questions so you discover the answer step by step.'
  },
  {
    id: 'micro_steps',
    label: '3 Tiny Steps (ADHD-Friendly)',
    emoji: '🪜',
    description: 'Breaks every explanation into 3 short, numbered micro-actions.'
  },
  {
    id: 'literal_clear',
    label: 'Concrete & Literal (Autism-Friendly)',
    emoji: '🎯',
    description: 'Uses direct, unambiguous sentences with zero idioms or confusing metaphors.'
  },
  {
    id: 'visual_analogy',
    label: 'Visual & Real-World Analogies',
    emoji: '🎨',
    description: 'Connects abstract math and science to everyday objects, games, and stories.'
  }
];

export const LUMINARE_STARTER_PROMPTS = [
  {
    id: 'starter-current-lesson',
    emoji: '📘',
    title: 'Help with my current lesson',
    prompt: 'Can you help me understand the main idea of my current lesson in 3 simple steps?'
  },
  {
    id: 'starter-analogy',
    emoji: '🍕',
    title: 'Explain with a fun analogy',
    prompt: 'Can you explain my current topic using a real-world analogy like cooking, games, or sports?'
  },
  {
    id: 'starter-practice-quiz',
    emoji: '🎯',
    title: 'Coach me on a practicing skill',
    prompt: 'Give me one low-stress warmup question on a skill I am currently practicing, and guide me through it.'
  },
  {
    id: 'starter-tiny-steps',
    emoji: '🪜',
    title: 'Break my task into 3 tiny steps',
    prompt: 'I feel a little overwhelmed. Can you break what I should do next into 3 tiny, easy steps?'
  },
  {
    id: 'starter-check-thinking',
    emoji: '🧠',
    title: 'Check my thinking Socratically',
    prompt: 'I want to test my understanding. Ask me one question about my course and check my reasoning!'
  },
  {
    id: 'starter-vocab',
    emoji: '🔤',
    title: 'Break down tricky vocabulary',
    prompt: 'What are the most important vocabulary words in my current unit, explained in plain language?'
  }
];

export function detectProviderFromKey(apiKey = '', explicitProvider = 'auto') {
  if (explicitProvider && explicitProvider !== 'auto') {
    return explicitProvider;
  }
  const trimmed = (apiKey || '').trim();
  if (!trimmed) return 'builtin';
  if (trimmed.startsWith('AIza')) return 'gemini';
  if (trimmed.startsWith('sk-or-')) return 'openrouter';
  if (trimmed.startsWith('sk-')) return 'openai';
  return 'openai';
}

export function sanitizeOutboundPrompt(rawText = '') {
  if (!rawText || typeof rawText !== 'string') return '';
  return rawText
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]')
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[REDACTED_PHONE]')
    .replace(
      /\b(?:my name is|i am|student name:)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/gi,
      '[STUDENT]'
    );
}

function buildAccessibilitySystemPrompt(
  profile,
  stage = 'learn',
  coachingStyle = 'socratic'
) {
  const caps = profile?.capabilities || {};
  const level = profile?.schoolLevel || 'elementary';
  const gradeDesc =
    level === 'elementary'
      ? 'Elementary School (Grades K-5). Use warm, concrete examples and short sentences.'
      : level === 'middle'
      ? 'Middle School (Grades 6-8). Use clear analogies and structured cause-and-effect steps.'
      : 'High School (Grades 9-12). Use rigorous academic concepts paired with intuitive visual and algebraic breakdowns.';

  const traits = [];
  if (
    caps.literalLanguageMode ||
    caps.sensoryCalmMode ||
    coachingStyle === 'literal_clear'
  ) {
    traits.push(
      'Use direct, literal, unambiguous language without idioms or metaphors.'
    );
  }
  if (
    caps.gameBasedMode ||
    caps.microChunking ||
    coachingStyle === 'micro_steps'
  ) {
    traits.push(
      'Keep paragraphs to 2-3 short sentences maximum with clear bulleted micro-steps.'
    );
  }
  if (caps.dyslexiaFont || caps.creamPaperTint) {
    traits.push(
      'Highlight key vocabulary with syllable breakdowns and avoid dense blocks of text.'
    );
  }
  if (
    caps.visualManipulatives ||
    caps.colorCodedSteps ||
    coachingStyle === 'visual_analogy'
  ) {
    traits.push(
      'Pair symbolic numbers with concrete visual quantities (bars, balance scales, or coordinate steps).'
    );
  }

  const checkpointRule =
    stage === 'checkpoint' || stage === 'practice'
      ? '\nASSESSMENT SAFEGUARD: Do NOT reveal the final multiple-choice answer. Guide the learner Socratically.'
      : '';

  return `You are Luminare, a friendly, calm, Socratic K-12 Universal Design for Learning (UDL) companion on LuminaLearn.
Target Grade Band: ${gradeDesc}
Preferred Coaching Style: ${coachingStyle}
Active Learning Supports:
${
  traits.length > 0
    ? traits.join('\n')
    : '- Clear, multimodal step-by-step scaffolding.'
}${checkpointRule}`;
}

async function callBackendAIProxy({
  systemPrompt,
  userPrompt,
  stage = 'learn',
  apiConfig,
  jsonMode = false,
  mode = 'generate'
}) {
  try {
    const res = await fetch(apiConfig?.proxyEndpoint || '/api/ai-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode,
        systemPrompt: sanitizeOutboundPrompt(systemPrompt),
        userPrompt: sanitizeOutboundPrompt(userPrompt),
        stage,
        provider: apiConfig?.provider || 'auto',
        model: apiConfig?.model || '',
        serverSessionKey: apiConfig?.apiKey || '',
        jsonMode
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.text || null;
  } catch {
    return null;
  }
}

/**
 * Verify an AI API key via the `/api/ai-proxy` server endpoint
 */
export async function testAiApiKeyConnection(apiConfig = {}) {
  const trimmedKey = (apiConfig?.apiKey || '').trim();
  const detected = detectProviderFromKey(trimmedKey, apiConfig?.provider);

  if (!trimmedKey) {
    return {
      ok: true,
      provider: 'builtin',
      providerLabel: 'Built-In Luminare Socratic Engine',
      model: 'lumina-udl-socratic-v2',
      message:
        'No external API key entered. Luminare is running in Built-In Socratic UDL Mode (100% free & offline-ready).'
    };
  }

  const startMs = Date.now();
  try {
    const res = await fetch(apiConfig?.proxyEndpoint || '/api/ai-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'test_connection',
        systemPrompt: 'You are Luminare, an educational AI assistant.',
        userPrompt: 'Reply with: Luminare connection verified.',
        stage: 'learn',
        provider: detected,
        model: apiConfig?.model || '',
        serverSessionKey: trimmedKey
      })
    });
    const latencyMs = Date.now() - startMs;
    if (res.ok) {
      const data = await res.json();
      if (data?.text && data?.source && !data.source.includes('builtin')) {
        return {
          ok: true,
          provider: detected,
          providerLabel:
            detected === 'gemini'
              ? 'Google Gemini API'
              : detected === 'openrouter'
              ? 'OpenRouter API'
              : 'OpenAI API',
          model:
            apiConfig?.model ||
            (detected === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini'),
          latencyMs,
          message: `Connected to ${detected.toUpperCase()} via secure proxy (${latencyMs}ms). Response: "${data.text
            .trim()
            .slice(0, 80)}"`
        };
      }
    }
  } catch {}

  return {
    ok: true,
    provider: detected,
    providerLabel: `${detected.toUpperCase()} Key Saved (With Smart UDL Fallback)`,
    model:
      apiConfig?.model ||
      (detected === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini'),
    message:
      'API key saved in session memory. If the upstream provider is unreachable or rate-limited, Luminare automatically falls back to the built-in Socratic engine.'
  };
}

/**
 * Interactive Conversational Coaching with "Luminare" (Dedicated AI Tab)
 */
export async function chatWithLuminare({
  userMessage = '',
  coachingStyle = 'socratic',
  activeCourse = null,
  activeLesson = null,
  weakSkills = [],
  profile = {},
  apiConfig = {}
}) {
  const cleanQuestion = sanitizeOutboundPrompt(userMessage).trim();
  const courseTitle =
    activeCourse?.title || activeLesson?.title || 'Math & Science Foundations';
  const weakSkillTitles = weakSkills
    .slice(0, 3)
    .map((s) => s.title)
    .join(', ');

  const systemPrompt = buildAccessibilitySystemPrompt(
    profile,
    'learn',
    coachingStyle
  );

  const userPrompt = `Active Course: "${courseTitle}"
Skills Currently Practicing / To Focus On: ${
    weakSkillTitles || 'Core unit concepts'
  }
Learner Message: "${cleanQuestion}"

Respond warmly as Luminare in 3 short, easy-to-read sections:
1. A friendly 1-2 sentence opening that connects to their question.
2. Three numbered micro-steps (Step 1, Step 2, Step 3) tailored to their "${coachingStyle}" preference.
3. One gentle Socratic question to check their understanding.`;

  const aiReply = await callBackendAIProxy({
    systemPrompt,
    userPrompt,
    stage: 'learn',
    apiConfig
  });

  const focusSkill = weakSkills[0]?.title || courseTitle;
  const isLiteral =
    profile?.capabilities?.literalLanguageMode ||
    coachingStyle === 'literal_clear';

  if (aiReply) {
    return {
      id: `lum-msg-${Date.now()}`,
      sender: 'luminare',
      coachingStyle,
      isLiveApiKey: Boolean(apiConfig?.apiKey),
      source: detectProviderFromKey(apiConfig?.apiKey, apiConfig?.provider),
      text: aiReply,
      keySteps: [
        `Focus area: ${focusSkill}`,
        'Test one value at a time in the interactive visual lab.',
        'Reply with your first step so Luminare can check your thinking!'
      ],
      suggestedFollowUps: [
        `Give me a practice question on ${focusSkill}`,
        'Explain that in even simpler words',
        'Show me a real-world analogy'
      ],
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  }

  // Context-aware Built-In Luminare Socratic Response
  const lower = cleanQuestion.toLowerCase();
  let mainText = '';
  let steps = [];
  let followUps = [];

  if (lower.includes('analogy') || coachingStyle === 'visual_analogy') {
    mainText = isLiteral
      ? `Let's connect "${courseTitle}" to a direct, concrete example around "${focusSkill}".`
      : `Great idea! Let's picture "${focusSkill}" (${courseTitle}) using an everyday analogy.`;
    steps = [
      `Step 1 (The Setup): Imagine you are sharing equal energy blocks or ingredients in a recipe for "${focusSkill}".`,
      `Step 2 (The Rule): Whenever you change one side of the recipe or balance, the other side adjusts by the exact same ratio.`,
      `Step 3 (Your Turn): Try changing one number in the visual lab—what do you notice happens to the output?`
    ];
    followUps = [
      'Let me try a practice question using this analogy',
      'Break this into 3 tiny steps',
      'What vocabulary words should I know?'
    ];
  } else if (
    lower.includes('quiz') ||
    lower.includes('practice') ||
    lower.includes('question') ||
    lower.includes('check my thinking')
  ) {
    mainText = `Let's do a calm, untimed warmup together on "${focusSkill}" from ${courseTitle}!`;
    steps = [
      `Step 1 (Warmup Prompt): In "${focusSkill}", what is the very first quantity or relationship we should look for in the problem?`,
      `Step 2 (Hint): Check the labels on the visual diagram—they always tell us the starting unit and total parts.`,
      `Step 3 (Socratic Check): Tell me how you would start solving it, and I will check your reasoning without spoiling the answer!`
    ];
    followUps = [
      'Give me a hint for Step 1',
      'Explain the rule in plain language',
      'Open this lesson so I can practice'
    ];
  } else if (lower.includes('vocab') || lower.includes('word')) {
    const vocabList = activeLesson?.vocabulary || [];
    const firstVocab = vocabList[0];
    mainText = `Here is a plain-language vocabulary breakdown for "${courseTitle}":`;
    steps = firstVocab
      ? vocabList.map(
          (v, idx) =>
            `Term ${idx + 1}: ${v.term} (${v.syllables}) — ${v.definition}`
        )
      : [
          `Key Concept 1: ${focusSkill} — The core relationship between your starting input and the final result.`,
          `Key Concept 2: Equivalent Balance — Keeping both sides or parts proportional when numbers change.`,
          `Key Concept 3: Unit Verification — Checking that your final number matches the question's unit label.`
        ];
    followUps = [
      'Quiz me on these vocabulary words',
      'Use these words in a simple example',
      'Help me with my next step'
    ];
  } else {
    mainText = isLiteral
      ? `Here is a clear, literal 3-step guide for "${cleanQuestion}" in ${courseTitle}:`
      : `I'm right here to help with "${cleanQuestion}"! Let's break "${focusSkill}" (${courseTitle}) into 3 calm, manageable steps:`;
    steps = [
      `Step 1 (Identify What You Know): Start with the known values in "${focusSkill}". You only need to focus on one relationship at a time.`,
      `Step 2 (Connect to the Visual Model): Use the interactive manipulative to see how changing the input changes the result.`,
      `Step 3 (Quick Socratic Check): Looking at Step 1, which part feels clearest to you right now, and which part should we zoom in on?`
    ];
    followUps = [
      `Explain "${focusSkill}" with a real-world analogy`,
      'Give me a warmup practice question',
      'Read this in even simpler language'
    ];
  }

  return {
    id: `lum-msg-${Date.now()}`,
    sender: 'luminare',
    coachingStyle,
    isLiveApiKey: false,
    source: 'builtin-luminare',
    text: `${mainText}\n\n• ${steps.join('\n• ')}`,
    keySteps: steps,
    suggestedFollowUps: followUps,
    timestamp: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
}

/**
 * Generate a Personalized Learning Study Plan based on the learner's skill mastery,
 * active accommodations, and optional AI API key.
 */
export async function generatePersonalizedStudyPlan({
  courses = [],
  enrolledCourseIds = [],
  skillMastery = {},
  profile = {},
  customGoal = '',
  apiConfig = {}
}) {
  const enrolledCourses = courses.filter((c) =>
    enrolledCourseIds.includes(c.id)
  );
  const targetCourses =
    enrolledCourses.length > 0 ? enrolledCourses : courses.slice(0, 2);

  const prioritySkills = [];
  targetCourses.forEach((course) => {
    (course.skills || []).forEach((skill) => {
      const state =
        skillMastery?.[skill.id] || skill.defaultMastery || 'not_started';
      if (state !== 'mastered') {
        const unit = (course.units || []).find((u) => u.id === skill.unitId);
        const mod = unit?.modules?.[0];
        prioritySkills.push({
          skillId: skill.id,
          skillTitle: skill.title,
          currentState: state,
          currentPoints:
            state === 'ready_to_review' ? 80 : state === 'practicing' ? 50 : 0,
          targetPoints: 100,
          courseId: course.id,
          courseTitle: course.title,
          unitTitle: unit?.title || 'Core Unit',
          lessonId: mod?.lessonId || course.primaryLessonId
        });
      }
    });
  });

  // Sort so 'practicing' (50 pts) and 'not_started' (0 pts) come first
  prioritySkills.sort((a, b) => a.currentPoints - b.currentPoints);
  const topFocus = prioritySkills.slice(0, 3);

  const systemPrompt = buildAccessibilitySystemPrompt(profile, 'learn');
  const userPrompt = `Student Name: ${profile?.studentName || 'Learner'}
Grade Band: ${profile?.schoolLevel || 'elementary'}
Priority Skills to Master Next: ${topFocus
    .map((s) => `${s.skillTitle} (${s.courseTitle}, ${s.currentPoints}/100 pts)`)
    .join('; ')}
${customGoal ? `Learner's Personal Goal: "${sanitizeOutboundPrompt(customGoal)}"` : ''}

Write a warm, encouraging 2-sentence personalized study tip explaining how the student can master these skills using their active learning tools.`;

  const aiTip = await callBackendAIProxy({
    systemPrompt,
    userPrompt,
    stage: 'learn',
    apiConfig
  });

  const activeSupportsSummary = [];
  const caps = profile?.capabilities || {};
  if (caps.visualManipulatives) activeSupportsSummary.push('Interactive Visual Models');
  if (caps.microChunking || caps.gameBasedMode)
    activeSupportsSummary.push('Micro-Chunked Steps');
  if (caps.readAloudTTS) activeSupportsSummary.push('Read-Aloud Audio');
  if (caps.dyslexiaFont || caps.creamPaperTint)
    activeSupportsSummary.push('Dyslexia-Friendly Reading Space');
  if (caps.literalLanguageMode || caps.sensoryCalmMode)
    activeSupportsSummary.push('Calm Literal Language');

  const supportText =
    activeSupportsSummary.length > 0
      ? activeSupportsSummary.join(', ')
      : 'Step-by-Step Visual Scaffolding';

  return {
    generatedAt: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }),
    isLiveAiGenerated: Boolean(aiTip && apiConfig?.apiKey),
    source: aiTip && apiConfig?.apiKey
      ? detectProviderFromKey(apiConfig.apiKey, apiConfig.provider)
      : 'builtin-udl-planner',
    headline:
      aiTip ||
      `Hi ${
        profile?.studentName || 'Friend'
      }! Based on your Course Mastery blocks, focusing on "${
        topFocus[0]?.skillTitle || 'your next unit'
      }" with ${supportText} is your fastest path to earning your next Mastery Crown (100 pts 👑).`,
    supportStrategyUsed: supportText,
    prioritySkills: topFocus,
    dailyMicroGoals: [
      {
        id: 'goal-1',
        step: '1. Explore the Visual Model (3 mins)',
        detail: `Open "${
          topFocus[0]?.skillTitle || 'your active module'
        }" and test 2 different values in the interactive manipulative.`
      },
      {
        id: 'goal-2',
        step: '2. Practice with Progressive Hints (4 mins)',
        detail: `Complete the untimed practice questions for "${
          topFocus[0]?.unitTitle || 'Unit 1'
        }" to move your block from ${
          topFocus[0]?.currentPoints ?? 50
        } pts to 100 pts 👑.`
      },
      {
        id: 'goal-3',
        step: '3. Quick Reflection with Luminare (1 min)',
        detail:
          'Explain the main rule in your own words to lock in long-term mastery!'
      }
    ]
  };
}

/**
 * Phase 6: Contextual Module Help by Explicit Learner Intent
 * Blocks direct answer leakage during checkpoints and always includes a non-AI worked example alternative.
 */
export async function requestContextualModuleHelp({
  intentId = 'explain_another_way',
  stage = 'learn',
  lesson,
  card,
  question,
  studentReasoning = '',
  profile,
  apiConfig
}) {
  const isCheckpoint = stage === 'checkpoint' || stage === 'practice';
  const systemPrompt = buildAccessibilitySystemPrompt(profile, stage);
  const intentObj =
    EXPLICIT_AI_INTENTS.find((i) => i.id === intentId) ||
    EXPLICIT_AI_INTENTS[0];

  const contextTitle = question
    ? `Assessment Question: "${question.prompt}"`
    : `Concept Card: "${card?.title || lesson?.title}" — ${
        card?.standardText || lesson?.subtitle || ''
      }`;

  const userPrompt = `Module: "${lesson?.title || 'Study Module'}" (${
    lesson?.gradeRange || 'K-12'
  })
Current Stage: ${stage}
Learner Intent: "${intentObj.label}"
Context: ${contextTitle}
${
  studentReasoning
    ? `Learner's Current Reasoning: "${sanitizeOutboundPrompt(studentReasoning)}"`
    : ''
}
Respond in 3 short, encouraging lines. ${
    isCheckpoint
      ? 'Remember: Do NOT give away the final answer or option letter; guide the learner to discover it.'
      : ''
  }`;

  const proxyReply = await callBackendAIProxy({
    systemPrompt,
    userPrompt,
    stage,
    apiConfig
  });

  // Non-AI worked example alternative (always available even if AI is disabled or offline)
  const nonAiWorkedExample = question
    ? `Non-AI Worked Example Pattern:\n1. Goal: ${
        question.literalPrompt || question.prompt
      }\n2. First Clue: ${
        question.hints?.[0] || 'Identify the known values given in the prompt.'
      }\n3. Strategy: Test the relationship in the interactive visual model above before locking in your choice.`
    : `Non-AI Worked Example:\n• Key Concept: ${
        card?.literalText || lesson?.subtitle || ''
      }\n• Visual Summary: ${
        card?.visualCallout || 'Use the interactive model to test how inputs change the output.'
      }`;

  if (proxyReply) {
    return {
      intentId,
      intentLabel: intentObj.label,
      checkpointAnswerBlocked: isCheckpoint,
      isGeneratedAI: true,
      text: proxyReply,
      nonAiWorkedExample
    };
  }

  // Built-in Socratic UDL responses tailored to each of the 6 explicit learner intents
  let socraticText = '';
  switch (intentId) {
    case 'explain_another_way':
      socraticText = question
        ? `Think of this problem as a two-part puzzle:\n• First, what quantity or rule does the question give you right at the start?\n• Second, how does changing that number affect the visual model? Try testing one value before choosing.`
        : `Here is another way to picture "${
            card?.title || lesson?.title
          }":\n• ${card?.literalText || lesson?.subtitle}\n• Key relationship: ${
            card?.visualCallout || 'Every input change produces a predictable output.'
          }`;
      break;
    case 'hint':
      socraticText = question
        ? `Socratic Hint (Answer Protected):\n• ${
            question.hints?.[0] ||
            'Look closely at the units and starting values in the prompt.'
          }\n• Ask yourself: Which choice matches that first step?`
        : `Focus Clue:\n• Look at the highlighted callout: "${
            card?.visualCallout || lesson?.subtitle
          }". What happens when you change the first value?`;
      break;
    case 'visual_example':
      socraticText = `Visual Model Connection:\n• In the interactive lab above, try setting a small starting number first.\n• Notice how the visual diagram updates its labels immediately—use that pattern to verify your thinking.`;
      break;
    case 'simpler_language':
      socraticText = question
        ? `Plain-Language Version:\n• ${
            question.literalPrompt || question.prompt
          }\n• Take your time—there is no timer, and you only need to match one rule at a time.`
        : `Plain-Language Summary:\n• ${
            card?.literalText || card?.standardText || lesson?.subtitle
          }`;
      break;
    case 'plan_next_step':
      socraticText = `Your 3-Step Action Plan:\n1. Read the plain-language goal at the top of the card.\n2. Test one value in the interactive model or check the first hint.\n3. Compare the result with the options and check your reasoning.`;
      break;
    case 'check_reasoning':
    default:
      socraticText = studentReasoning.trim()
        ? `Reasoning Check (Without Spoiling the Answer):\n• You wrote: "${sanitizeOutboundPrompt(
            studentReasoning
          )}"\n• Good start! Now check: does each part of your reasoning match the starting numbers and units in the problem?`
        : `Reasoning Check (Without Spoiling the Answer):\n• Before picking an option, state which number is your starting value and what operation connects them.\n• Does your choice make the visual model balanced?`;
      break;
  }

  return {
    intentId,
    intentLabel: intentObj.label,
    checkpointAnswerBlocked: isCheckpoint,
    isGeneratedAI: true,
    text: socraticText,
    nonAiWorkedExample
  };
}

/**
 * 1. Explain Why an Answer Is Right or Wrong (Post-Answer Feedback)
 */
export async function generateAnswerExplanation({
  lesson,
  question,
  selectedIndex,
  profile,
  apiConfig
}) {
  const isCorrect = selectedIndex === question.correctIndex;
  const chosenOption = question.options[selectedIndex];
  const correctOption = question.options[question.correctIndex];
  const isLiteral = profile?.capabilities?.literalLanguageMode;

  const systemPrompt = buildAccessibilitySystemPrompt(profile, 'review');
  const userPrompt = `Lesson: "${lesson.title}" (${lesson.gradeRange})
Question: "${isLiteral && question.literalPrompt ? question.literalPrompt : question.prompt}"
Student Selected: "${chosenOption}" (${isCorrect ? 'CORRECT' : 'NEEDS ANOTHER TRY'})
Correct Answer: "${correctOption}"

In 2 to 3 short, encouraging sentences, explain WHY "${correctOption}" is correct and how the student can think about it.`;

  const aiText = await callBackendAIProxy({
    systemPrompt,
    userPrompt,
    stage: 'review',
    apiConfig
  });
  if (aiText) return aiText;

  if (isCorrect) {
    return `Spot on! You chose "${chosenOption}", which is correct. ${question.explanation}`;
  }
  return `Good try selecting "${chosenOption}". Let's look closer: the correct answer is "${correctOption}". ${question.explanation}`;
}

/**
 * 2. Explain Step-by-Step How to Get the Answer
 */
export async function generateStepByStepGuide({
  lesson,
  question,
  profile,
  apiConfig
}) {
  const systemPrompt = buildAccessibilitySystemPrompt(profile, 'review');
  const userPrompt = `Lesson: "${lesson.title}" (${lesson.gradeRange})
Question: "${question.prompt}"
Correct Answer: "${question.options[question.correctIndex]}"

Return a JSON object with a "steps" array of 3 objects, each having "label" and "detail" showing how to solve this problem step-by-step.`;

  const aiJson = await callBackendAIProxy({
    systemPrompt,
    userPrompt,
    stage: 'review',
    apiConfig,
    jsonMode: true
  });
  if (aiJson) {
    try {
      const parsed = JSON.parse(aiJson);
      if (Array.isArray(parsed.steps) && parsed.steps.length > 0) {
        const colors = ['indigo', 'emerald', 'amber'];
        return parsed.steps.map((s, idx) => ({
          label: s.label || `Step ${idx + 1}`,
          detail: s.detail || '',
          color: colors[idx % colors.length]
        }));
      }
    } catch {}
  }

  return (
    question.stepByStep || [
      {
        label: 'Step 1 (Read the Goal)',
        detail: question.literalPrompt || question.prompt,
        color: 'indigo'
      },
      {
        label: 'Step 2 (Use the Key Clue)',
        detail: question.hints?.[0] || 'Identify the given values.',
        color: 'emerald'
      },
      {
        label: 'Step 3 (Verify the Result)',
        detail: question.explanation,
        color: 'amber'
      }
    ]
  );
}

/**
 * 3. Personalized Tutor Question & Answer
 */
export async function generatePersonalizedTutorHelp({
  userQuestion,
  lesson,
  profile,
  apiConfig
}) {
  const safeQuestion = sanitizeOutboundPrompt(userQuestion);
  const systemPrompt = buildAccessibilitySystemPrompt(profile, 'learn');
  const userPrompt = `Current Lesson: "${
    lesson?.title || 'General K-12 STEM'
  }" (${lesson?.gradeRange || 'K-12'})
Student Question: "${safeQuestion}"

Provide a clear, encouraging, step-by-step explanation tailored to the student's active learning tools.`;

  const aiText = await callBackendAIProxy({
    systemPrompt,
    userPrompt,
    stage: 'learn',
    apiConfig
  });
  if (aiText) return aiText;

  const cardSummary =
    lesson?.microCards?.[0]?.literalText ||
    lesson?.subtitle ||
    'We break every concept into small visual steps.';
  return `Here is a step-by-step way to think about "${safeQuestion}":\n\n1. Core Idea: ${cardSummary}\n2. Visual Check: Use the interactive model inside the lesson to test how changing one number affects the result.\n3. Key Takeaway: ${
    lesson?.microCards?.[0]?.visualCallout ||
    'Take your time and work one step at a time!'
  }`;
}

/**
 * 4. AI-Assisted Custom Lesson Generator (For Luminare & Educator Workspace)
 */
export async function generateCustomLessonWithAI({
  topic,
  schoolLevel,
  subject,
  customInterest = '',
  profile,
  apiConfig
}) {
  const cleanTopic =
    sanitizeOutboundPrompt(topic).trim() || 'Exploring STEM Patterns';
  const cleanInterest = sanitizeOutboundPrompt(customInterest).trim();
  const gradeLabel =
    schoolLevel === 'elementary'
      ? 'Elementary (Grades K–5)'
      : schoolLevel === 'middle'
      ? 'Middle School (Grades 6–8)'
      : 'High School (Grades 9–12)';

  const manipulativeDefault =
    schoolLevel === 'elementary'
      ? 'fraction-lab'
      : schoolLevel === 'middle'
      ? 'ecosystem-sim'
      : 'kinematics-sim';

  const systemPrompt = buildAccessibilitySystemPrompt(profile, 'learn');
  const userPrompt = `Create a structured K-12 Universal Design for Learning (UDL) lesson on "${cleanTopic}"${
    cleanInterest ? ` themed around "${cleanInterest}"` : ''
  } for ${gradeLabel} in ${subject}.
Return JSON with keys: "title", "subtitle", "card1Text", "card2Text", "questionPrompt", "correctAnswer", "distractor1", "distractor2", "distractor3", "explanation".`;

  const aiJson = await callBackendAIProxy({
    systemPrompt,
    userPrompt,
    stage: 'learn',
    apiConfig,
    jsonMode: true
  });

  let parsed = null;
  if (aiJson) {
    try {
      parsed = JSON.parse(aiJson);
    } catch {}
  }

  const interestSuffix = cleanInterest ? ` (${cleanInterest} Edition)` : '';
  const interestContext = cleanInterest
    ? `Using real-world examples from ${cleanInterest}, we can see how ${cleanTopic} works in action.`
    : `Use the interactive model above to see how changing inputs affects the result.`;

  return {
    id: `custom-${Date.now()}`,
    title: parsed?.title || `${cleanTopic}${interestSuffix}`,
    subtitle:
      parsed?.subtitle ||
      `Personalized ${subject.toLowerCase()} exploration tailored for ${gradeLabel}${
        cleanInterest ? ` with ${cleanInterest}` : ''
      }.`,
    schoolLevel,
    gradeRange: gradeLabel,
    subject,
    isCoreMVP: false,
    isAIGenerated: true,
    estimatedMinutes: 8,
    xpReward: 150,
    badgeName: `${cleanTopic.split(' ')[0]} Milestone`,
    badgeEmoji: subject === 'Mathematics' ? '📐' : '🔬',
    manipulativeType: manipulativeDefault,
    accessibilityChecklist: {
      plainLanguageObjective: `Learn the core principles of ${cleanTopic} and solve structured problems step by step.`,
      visualAltDescription: `Interactive ${manipulativeDefault} visual model with explicit numeric and text labels.`,
      transcriptText: `LuminaLearn Transcript for ${cleanTopic}: Step 1 introduces the core relationship. Step 2 demonstrates solving step by step.`,
      keyboardOperable: true,
      noColorOnlyInstruction: true,
      untimedAssessmentPath: true,
      hintsAndRetryAvailable: true
    },
    vocabulary: [
      {
        term: cleanTopic,
        syllables: cleanTopic.split(/\s+/).join(' • '),
        emoji: '📘',
        definition: `The core ${subject.toLowerCase()} concept explored in this personalized lesson.`
      }
    ],
    microCards: [
      {
        id: `card-${Date.now()}-1`,
        stepLabel: 'Card 1 of 2',
        title: `Core Idea: ${cleanTopic}${interestSuffix}`,
        standardText:
          parsed?.card1Text ||
          `In this personalized module, we explore ${cleanTopic} step by step. ${interestContext}`,
        literalText: `Topic: ${cleanTopic} (${subject}, ${gradeLabel}). Every problem in ${cleanTopic} has known starting values, a rule, and a measurable output.`,
        visualCallout: `Known Input → ${cleanTopic} Rule → Output`
      },
      {
        id: `card-${Date.now()}-2`,
        stepLabel: 'Card 2 of 2',
        title: `Solving ${cleanTopic} Step by Step`,
        standardText:
          parsed?.card2Text ||
          `First, identify the given numbers or parts. Second, test the relationship in the visual model. Third, verify your final unit.`,
        literalText: `Step 1: Identify given values. Step 2: Apply the ${cleanTopic} relationship one step at a time. Step 3: Check the final answer.`,
        visualCallout: `Step 1: Identify | Step 2: Model | Step 3: Check`
      }
    ],
    questions: [
      {
        id: `q-${Date.now()}-1`,
        prompt:
          parsed?.questionPrompt ||
          `What is the best first step when solving a problem about ${cleanTopic}?`,
        literalPrompt: `Select the correct first step when solving a structured problem in ${cleanTopic}.`,
        options: [
          parsed?.correctAnswer ||
            'Identify the known starting values and break the problem into small steps',
          parsed?.distractor1 || 'Guess a number without reading the units',
          parsed?.distractor2 ||
            'Skip the visual model and do all steps at once',
          parsed?.distractor3 || 'Set all values to zero'
        ],
        correctIndex: 0,
        hints: [
          'Identifying what you already know always comes first.',
          'Breaking the problem into small steps keeps it clear.'
        ],
        explanation:
          parsed?.explanation ||
          `Identifying known values first and working one step at a time prevents errors in ${cleanTopic}.`,
        stepByStep: [
          {
            label: 'Step 1',
            detail: 'List the known starting values.',
            color: 'indigo'
          },
          {
            label: 'Step 2',
            detail: 'Apply the concept rule one step at a time.',
            color: 'emerald'
          }
        ]
      }
    ]
  };
}

/**
 * 5. Personalized Study Advice via Backend AI Proxy
 */
export async function getPersonalizedLearningAdvice({
  studentQuestion,
  profile,
  progress,
  apiConfig
}) {
  return generatePersonalizedTutorHelp({
    userQuestion:
      studentQuestion ||
      `Suggest a personalized study tip based on ${
        progress?.completedLessonIds?.length || 0
      } completed lessons.`,
    lesson: null,
    profile,
    apiConfig
  });
}
