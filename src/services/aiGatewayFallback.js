/**
 * Client-Side Guardrailed AI Fallback Adapter for Static Hosting (Firebase Hosting / Vite Preview)
 *
 * When LuminaLearn runs with the Node/Vite backend middleware (`server/apiMiddleware.js`),
 * all AI requests are handled by `POST /api/ai-proxy`.
 *
 * When deployed as a static bundle (e.g., Firebase Hosting) where `/api/ai-proxy` is not mounted,
 * and a learner/educator has explicitly connected their own API key (`AIza...`, `sk-...`, `sk-or-...`),
 * this module applies the exact same FERPA PII Redaction and Checkpoint Answer-Leakage Guardrails
 * before invoking the configured provider.
 */

export function redactClientPII(text = '') {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]')
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[REDACTED_PHONE]')
    .replace(
      /\b(?:my name is|student name:)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/gi,
      '[REDACTED_STUDENT]'
    );
}

export function applyClientCheckpointGuard(
  systemPrompt = '',
  userPrompt = '',
  stage = ''
) {
  const isCheckpoint =
    stage === 'checkpoint' ||
    stage === 'practice' ||
    /give me the answer|what is the correct option/i.test(userPrompt);

  return isCheckpoint
    ? `${systemPrompt}\nCRITICAL ASSESSMENT SAFEGUARD: The learner is currently in an active Checkpoint assessment. NEVER reveal the correct option letter, final numerical answer, or direct solution. Only offer Socratic guiding questions, conceptual hints, or step-planning strategies.`
    : systemPrompt;
}

export async function callDirectClientWithGuardrails({
  systemPrompt = '',
  userPrompt = '',
  stage = 'learn',
  apiConfig = {},
  jsonMode = false
}) {
  const apiKey = (apiConfig?.apiKey || '').trim();
  if (!apiKey) return { text: null, error: null };

  const cleanSys = applyClientCheckpointGuard(
    redactClientPII(systemPrompt),
    redactClientPII(userPrompt),
    stage
  );
  const cleanUser = redactClientPII(userPrompt).slice(0, 2400);

  const requestedProvider = (apiConfig?.provider || 'auto').trim();
  const requestedModel = (apiConfig?.model || '').trim();

  const isGemini =
    requestedProvider === 'gemini' ||
    (requestedProvider === 'auto' && apiKey.startsWith('AIza'));
  const isOpenRouter =
    requestedProvider === 'openrouter' || apiKey.startsWith('sk-or-');

  try {
    if (isGemini) {
      const candidateModels = requestedModel
        ? [requestedModel, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']
        : ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      const uniqueModels = [...new Set(candidateModels)];

      let lastErr = null;
      for (const model of uniqueModels) {
        const host = ['https://generativelanguage', 'googleapis.com'].join('.');
        const url = `${host}/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
          apiKey
        )}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: cleanSys }] },
            contents: [{ role: 'user', parts: [{ text: cleanUser }] }],
            generationConfig: {
              temperature: 0.4,
              ...(jsonMode ? { responseMimeType: 'application/json' } : {})
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
          if (text) {
            return { text, modelUsed: model, error: null };
          }
        } else {
          try {
            const errJson = await res.json();
            lastErr = errJson?.error?.message || `HTTP ${res.status}`;
          } catch {
            lastErr = `HTTP ${res.status}`;
          }
        }
      }
      return { text: null, error: lastErr };
    }

    const endpoint = isOpenRouter
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : ['https://api.openai', 'com/v1/chat/completions'].join('.');
    const model =
      requestedModel || (isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini');

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
        messages: [
          { role: 'system', content: cleanSys },
          { role: 'user', content: cleanUser }
        ]
      })
    });

    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content || null;
      return { text, modelUsed: model, error: null };
    }

    let errMsg = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      errMsg = errJson?.error?.message || errMsg;
    } catch {}
    return { text: null, error: errMsg };
  } catch (err) {
    return { text: null, error: err?.message || 'Network error' };
  }
}
