import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  KeyRound,
  PlusCircle,
  Volume2,
  X,
  Send,
  Bot,
  ShieldCheck
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import {
  generateCustomLessonWithAI,
  getPersonalizedLearningAdvice,
  detectProviderFromKey
} from '../services/aiService';

/* ============================================================================
   1. Developer / Educator AI Provider & Security Settings Modal (Phase 1 & Phase 9)
   ============================================================================ */
export function AISettingsModal({ isOpen, onClose }) {
  const { aiConfig, setAiConfig, triggerCue } = usePlatform();
  const [apiKeyInput, setApiKeyInput] = useState(aiConfig.apiKey || '');
  const [providerInput, setProviderInput] = useState(aiConfig.provider || 'auto');
  const [modelInput, setModelInput] = useState(aiConfig.model || '');
  const [useBackendProxy, setUseBackendProxy] = useState(
    Boolean(aiConfig.useBackendProxy)
  );
  const [piiRedaction, setPiiRedaction] = useState(
    aiConfig.piiRedactionEnabled !== false
  );

  const initialFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => initialFocusRef.current?.focus(), 30);
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const detected = detectProviderFromKey(apiKeyInput, providerInput);

  const handleSave = (e) => {
    e.preventDefault();
    setAiConfig({
      apiKey: apiKeyInput.trim(),
      provider: providerInput,
      model: modelInput.trim(),
      useBackendProxy,
      proxyEndpoint: '/api/ai-proxy',
      piiRedactionEnabled: piiRedaction
    });
    triggerCue(
      'success',
      apiKeyInput.trim()
        ? 'Session AI Provider Configured'
        : 'Using Built-In Pedagogical AI',
      'Held in volatile session memory only (never stored in browser localStorage).'
    );
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-settings-title"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="surface-card bg-white text-slate-900 rounded-3xl max-w-lg w-full border-2 border-indigo-300 shadow-2xl overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-amber-300" />
            <div>
              <h2 id="ai-settings-title" className="font-extrabold text-base">
                Educator / Developer AI Provider & Privacy Settings
              </h2>
              <p className="text-xs text-slate-300">
                Hidden from student navigation • Session-only memory (never stored in localStorage)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            aria-label="Close AI settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
            <div className="font-extrabold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              School Deployment & FERPA Privacy Safeguards:
            </div>
            <p className="text-slate-700">
              In production school deployments, AI calls route through a secured backend proxy without exposing keys in the browser. For live demos, any key entered below is kept in volatile memory for this tab session only.
            </p>
          </div>

          <label className="block space-y-1">
            <span className="font-bold text-slate-800 uppercase">
              Session-Only Demo API Key (Optional):
            </span>
            <input
              ref={initialFocusRef}
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Paste AIza... (Gemini) or sk-... (OpenAI)"
              className="w-full rounded-xl border-2 border-slate-300 px-3.5 py-2.5 text-sm font-mono text-slate-900"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="font-bold text-slate-800 uppercase">AI Provider:</span>
              <select
                value={providerInput}
                onChange={(e) => setProviderInput(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 bg-white"
              >
                <option value="auto">Auto-Detect ({detected.toUpperCase()})</option>
                <option value="gemini">Google Gemini API</option>
                <option value="openai">OpenAI API</option>
                <option value="openrouter">OpenRouter API</option>
              </select>
            </label>

            <label className="block space-y-1">
              <span className="font-bold text-slate-800 uppercase">Model Override (Optional):</span>
              <input
                type="text"
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                placeholder="e.g., gemini-2.5-flash"
                className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-xs font-mono text-slate-900"
              />
            </label>
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={piiRedaction}
                onChange={(e) => setPiiRedaction(e.target.checked)}
                className="rounded border-slate-300"
              />
              <span className="font-semibold text-slate-800">
                Enforce student data minimization (strip student PII from outbound prompts)
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useBackendProxy}
                onChange={(e) => setUseBackendProxy(e.target.checked)}
                className="rounded border-slate-300"
              />
              <span className="font-semibold text-slate-800">
                Route requests via school backend proxy (<code>/api/ai-proxy</code>) when available
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setApiKeyInput('');
                setAiConfig({
                  apiKey: '',
                  provider: 'auto',
                  model: '',
                  useBackendProxy: false,
                  proxyEndpoint: '/api/ai-proxy',
                  piiRedactionEnabled: true
                });
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
            >
              Use Built-In AI Only
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================================
   2. AI Lesson Creator Modal
   ============================================================================ */
export function AILessonCreatorModal({ isOpen, onClose, onLessonCreated }) {
  const { profile, aiConfig, addCustomLesson } = usePlatform();

  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Science');
  const [schoolLevel, setSchoolLevel] = useState(profile.schoolLevel || 'elementary');
  const [customInterest, setCustomInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const initialFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => initialFocusRef.current?.focus(), 30);
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const created = await generateCustomLessonWithAI({
        topic: topic.trim(),
        subject,
        schoolLevel,
        customInterest: customInterest.trim(),
        profile,
        apiConfig: aiConfig
      });
      addCustomLesson(created);
      setTopic('');
      if (onLessonCreated) {
        onLessonCreated(created);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-creator-title"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="surface-card bg-white text-slate-900 rounded-3xl max-w-xl w-full border-2 border-indigo-300 shadow-2xl overflow-hidden">
        <div className="bg-indigo-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <div>
              <h2 id="ai-creator-title" className="font-extrabold text-base">
                Lesson Builder (UDL & Interest-Aligned)
              </h2>
              <p className="text-xs text-indigo-200">
                Create a customized Math or Science module with step-by-step scaffolding
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-indigo-900 text-indigo-200 hover:text-white"
            aria-label="Close lesson builder"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="p-6 space-y-4 text-xs">
          <label className="block space-y-1">
            <span className="font-bold text-slate-800 uppercase">
              1. Lesson Topic:
            </span>
            <input
              ref={initialFocusRef}
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Gravity & Orbits, Multiplying Decimals, Volcanoes..."
              className="w-full rounded-xl border-2 border-slate-300 px-3.5 py-2.5 text-sm font-bold text-slate-900"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="font-bold text-slate-800 uppercase">2. Subject Area:</span>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-300 px-3 py-2.5 text-xs font-bold text-slate-900 bg-white"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
              </select>
            </label>

            <label className="block space-y-1">
              <span className="font-bold text-slate-800 uppercase">3. Grade Range:</span>
              <select
                value={schoolLevel}
                onChange={(e) => setSchoolLevel(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-300 px-3 py-2.5 text-xs font-bold text-slate-900 bg-white"
              >
                <option value="elementary">🌱 Elementary (Grades K–5)</option>
                <option value="middle">🧭 Middle School (Grades 6–8)</option>
                <option value="high">🚀 High School (Grades 9–12)</option>
              </select>
            </label>
          </div>

          <label className="block space-y-1">
            <span className="font-bold text-slate-800 uppercase">
              4. Optional Student Interest Theme:
            </span>
            <input
              type="text"
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              placeholder="e.g., Dinosaurs, Trains, Space Rovers, Ocean Life..."
              className="w-full rounded-xl border-2 border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-900"
            />
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              {loading ? 'Building Lesson...' : 'Create Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
