import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  HeartHandshake,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Download,
  Upload
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import {
  ACCESSIBILITY_PRESETS,
  LEARNER_TOOL_BUNDLES
} from '../data/quizMapping';

/* ============================================================================
   1. LearningToolsButton — The single "My tools" disclosure button in the header
   ============================================================================ */
export function LearningToolsButton({ isOpen, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls="learning-tools-panel"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
        isOpen
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
      }`}
    >
      <Sliders className="w-3.5 h-3.5" />
      <span>My tools</span>
    </button>
  );
}

/* ============================================================================
   2. LearningToolsPanel — Opened by "My tools" (Contextual, non-duplicated)
   ============================================================================ */
export function LearningToolsPanel({ isOpen, onClose, onOpenQuiz }) {
  const {
    profile,
    toggleCapability,
    toggleLearnerBundle,
    applyPreset,
    exportPreferencesJson,
    importPreferencesJson,
    setCalmBreakOpen
  } = usePlatform();

  const [showAdvancedSection, setShowAdvancedSection] = useState(false);
  const [importText, setImportText] = useState('');
  const [exportCopied, setExportCopied] = useState(false);

  const caps = profile.capabilities;

  if (!isOpen) return null;

  return (
    <section
      id="learning-tools-panel"
      aria-label="My learning tools"
      className="surface-card bg-white border-b border-slate-200 py-5 text-slate-900"
    >
      <div className="adaptive-shell-container space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              My Learning Tools
            </h2>
            <p className="text-xs text-slate-600">
              Choose the supports that make reading, focusing, and solving problems comfortable for you.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                setCalmBreakOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-700" /> Take a break
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenQuiz();
              }}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold"
            >
              Help me choose
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              <X className="w-3.5 h-3.5" /> Close
            </button>
          </div>
        </div>

        {/* Quick Top Row: Text Size, Captions Mode, Auto-Read Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Text Size */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-2">
            <span className="font-bold text-slate-800">Text size</span>
            <div className="flex gap-1">
              {['100', '115', '130'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleCapability('fontScale', size)}
                  aria-pressed={caps.fontScale === size}
                  className={`px-2.5 py-1 rounded-lg font-bold border ${
                    caps.fontScale === size
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {size}%
                </button>
              ))}
            </div>
          </div>

          {/* Captions Behavior (Phase 4: Auto during speech | Pinned | Transcript | Off) */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-2">
            <label htmlFor="caption-pref-select" className="font-bold text-slate-800">
              Captions
            </label>
            <select
              id="caption-pref-select"
              value={caps.captionDockPreference || 'auto'}
              onChange={(e) => toggleCapability('captionDockPreference', e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-bold text-slate-800"
            >
              <option value="auto">Auto during speech</option>
              <option value="pinned">Pinned captions</option>
              <option value="transcript">Transcript panel</option>
              <option value="off">Off</option>
            </select>
          </div>

          {/* Phase 3: Renamed from "Read aloud: Off" to "Automatically read new cards" */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-2">
            <SwitchRow
              label="Automatically read new cards"
              checked={caps.autoReadAloud}
              onChange={() => toggleCapability('autoReadAloud')}
            />
          </div>
        </div>

        {/* Learner-Owned Support Bundles (Phase 3 & Phase 6: Clean borders, no nested card noise) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LEARNER_TOOL_BUNDLES.map((bundle) => {
            const isActive = Boolean(caps[bundle.primaryCapKey]);
            return (
              <button
                key={bundle.id}
                type="button"
                onClick={() => toggleLearnerBundle(bundle.id)}
                aria-pressed={isActive}
                className={`text-left p-4 rounded-xl border transition flex items-start justify-between gap-3 ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50/60'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-bold text-sm text-slate-900">
                    {bundle.label}
                  </div>
                  <p className="text-xs text-slate-600">{bundle.shortDesc}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isActive ? 'On' : 'Off'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Expandable Fine-Grained Switches & Starting-Point Presets */}
        <div className="pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setShowAdvancedSection(!showAdvancedSection)}
            aria-expanded={showAdvancedSection}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-700"
          >
            {showAdvancedSection ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            {showAdvancedSection
              ? 'Hide individual switches & starting-point presets'
              : 'More individual switches & starting-point presets'}
          </button>

          {showAdvancedSection && (
            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900">Reading & Layout</div>
                  <SwitchRow
                    label="More letter & line space"
                    checked={caps.dyslexiaFont}
                    onChange={() => toggleCapability('dyslexiaFont')}
                  />
                  <SwitchRow
                    label="Warm paper background"
                    checked={caps.creamPaperTint}
                    onChange={() => toggleCapability('creamPaperTint')}
                  />
                  <SwitchRow
                    label="Reading line guide"
                    checked={caps.readingLineRuler}
                    onChange={() => toggleCapability('readingLineRuler')}
                  />
                  <SwitchRow
                    label="Word definitions & syllables"
                    checked={caps.vocabularySupport}
                    onChange={() => toggleCapability('vocabularySupport')}
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900">Focus & Models</div>
                  <SwitchRow
                    label="Focus mode (hide site header in lesson)"
                    checked={caps.focusShield}
                    onChange={() => toggleCapability('focusShield')}
                  />
                  <SwitchRow
                    label="Direct, literal wording"
                    checked={caps.literalLanguageMode}
                    onChange={() => toggleCapability('literalLanguageMode')}
                  />
                  <SwitchRow
                    label="Interactive visual math models"
                    checked={caps.visualManipulatives}
                    onChange={() => toggleCapability('visualManipulatives')}
                  />
                  <SwitchRow
                    label="Color-coded solution steps"
                    checked={caps.colorCodedSteps}
                    onChange={() => toggleCapability('colorCodedSteps')}
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900">Vision, Audio & Keys</div>
                  <SwitchRow
                    label="High-contrast dark mode"
                    checked={caps.highContrastCVI}
                    onChange={() => toggleCapability('highContrastCVI')}
                  />
                  <SwitchRow
                    label="Reduce motion & animations"
                    checked={caps.reducedMotion}
                    onChange={() => toggleCapability('reducedMotion')}
                  />
                  <SwitchRow
                    label="Visual sound alerts (session)"
                    checked={caps.visualSoundCues}
                    onChange={() => toggleCapability('visualSoundCues')}
                  />
                  <SwitchRow
                    label="Comfortable 52px+ buttons"
                    checked={caps.largeTargets}
                    onChange={() => toggleCapability('largeTargets')}
                  />
                  <SwitchRow
                    label="Keyboard shortcuts (1–4, H, R, B)"
                    checked={caps.keyboardShortcuts}
                    onChange={() => toggleCapability('keyboardShortcuts')}
                  />
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-700 font-medium">Voice speed</span>
                    <div className="flex gap-1">
                      {[0.8, 1.0, 1.2].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => toggleCapability('speechRate', rate)}
                          className={`px-2 py-0.5 rounded font-bold border ${
                            Number(caps.speechRate) === rate
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Configurable Starting-Point Presets */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900">
                  Starting-Point Presets (Configurable preferences, not diagnoses)
                </div>
                <div className="flex flex-wrap gap-2">
                  {ACCESSIBILITY_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-800 border border-slate-300 text-xs font-semibold transition"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Portable JSON Import/Export */}
              <div className="p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <span className="text-slate-600">
                  Export or import tool preferences as JSON:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const json = exportPreferencesJson();
                      navigator.clipboard?.writeText(json);
                      setExportCopied(true);
                      setTimeout(() => setExportCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {exportCopied ? 'Copied!' : 'Copy JSON'}
                  </button>
                  <input
                    type="text"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Paste preferences JSON..."
                    aria-label="Paste preferences JSON"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                  />
                  <button
                    type="button"
                    disabled={!importText.trim()}
                    onClick={() => {
                      if (importPreferencesJson(importText)) {
                        setImportText('');
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold disabled:opacity-40"
                  >
                    <Upload className="w-3.5 h-3.5" /> Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   3. CaptionPanel — Phase 4 On-Demand Learning Aid (Never covers content when silent)
   ============================================================================ */
export function CaptionPanel() {
  const {
    profile,
    toggleCapability,
    captionEntry,
    transcriptHistory,
    isCaptionDockMounted,
    speakText,
    pauseSpeaking,
    resumeSpeaking,
    stopSpeaking,
    isSpeaking,
    isSpeechPaused
  } = usePlatform();

  const dockRef = useRef(null);
  const [reservedHeight, setReservedHeight] = useState(0);

  const caps = profile.capabilities;
  const pref = caps.captionDockPreference || 'auto';

  // Phase 4: Dynamically measure dock height when mounted and reserve exact bottom space
  // so no focused button, answer option, or lesson control can ever be covered by captions.
  useEffect(() => {
    if (!isCaptionDockMounted || !dockRef.current) {
      setReservedHeight(0);
      return;
    }
    const updateHeight = () => {
      if (dockRef.current) {
        setReservedHeight(dockRef.current.offsetHeight + 16);
      }
    };
    updateHeight();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateHeight);
      observer.observe(dockRef.current);
      return () => observer.disconnect();
    }
  }, [isCaptionDockMounted, pref, captionEntry, transcriptHistory.length]);

  // Do not mount anything when silent in default 'auto' mode or when 'off'
  if (!isCaptionDockMounted) {
    return null;
  }

  // Transcript mode: Side panel on large screens or clean sheet on compact screens
  if (pref === 'transcript') {
    return (
      <>
        <div style={{ height: `${reservedHeight}px` }} aria-hidden="true" />
        <aside
          ref={dockRef}
          aria-label="Lesson audio transcript"
          className="fixed bottom-0 right-0 left-0 lg:left-auto lg:top-16 lg:bottom-4 lg:right-4 lg:w-96 z-30 bg-slate-900 text-white border-t lg:border border-slate-700 lg:rounded-2xl shadow-lg flex flex-col max-h-72 lg:max-h-[calc(100vh-5rem)]"
        >
          <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-100">Audio Transcript</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleCapability('captionDockPreference', 'auto')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
              >
                Auto mode
              </button>
              <button
                type="button"
                onClick={() => toggleCapability('captionDockPreference', 'auto')}
                aria-label="Close transcript panel"
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4 overflow-y-auto space-y-2.5 text-xs flex-1">
            {transcriptHistory.length === 0 ? (
              <p className="text-slate-400">
                Spoken lesson cards and questions will appear here when read aloud.
              </p>
            ) : (
              transcriptHistory.map((item) => (
                <div
                  key={item.id}
                  className="border-b border-slate-800 pb-2 last:border-none"
                >
                  <div className="text-slate-400 font-semibold text-[11px]">
                    {item.speaker} · {item.timestamp}
                  </div>
                  <p className="text-slate-100 mt-0.5 leading-relaxed">{item.text}</p>
                </div>
              ))
            )}
          </div>
        </aside>
      </>
    );
  }

  // Compact caption line (shown automatically during active speech, or when explicitly pinned)
  return (
    <>
      {/* Reserve matching layout height so the fixed bar never obscures focused controls */}
      <div style={{ height: `${reservedHeight}px` }} aria-hidden="true" />
      <aside
        ref={dockRef}
        aria-label="Live captions"
        className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 text-white border-t border-slate-700 px-4 py-2.5"
      >
        <div className="adaptive-shell-container flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex-1 min-w-0">
            {captionEntry ? (
              <p className="leading-relaxed">
                {(captionEntry.sentences || [captionEntry.text]).map((sentence, sIdx) => {
                  const isCurrent =
                    isSpeaking && sIdx === (captionEntry.activeSentenceIndex || 0);
                  return (
                    <span
                      key={sIdx}
                      className={`mr-1.5 rounded px-1 ${
                        isCurrent
                          ? 'bg-amber-300 text-slate-950 font-bold'
                          : 'text-slate-100'
                      }`}
                    >
                      {sentence}
                    </span>
                  );
                })}
              </p>
            ) : (
              <span className="text-slate-300">
                Pinned captions active — click any “Read aloud” button to hear text spoken.
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isSpeaking && !isSpeechPaused && (
              <button
                type="button"
                onClick={pauseSpeaking}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold inline-flex items-center gap-1"
              >
                <Pause className="w-3 h-3" /> Pause
              </button>
            )}
            {isSpeaking && isSpeechPaused && (
              <button
                type="button"
                onClick={resumeSpeaking}
                className="px-2.5 py-1 rounded bg-indigo-600 text-white font-semibold inline-flex items-center gap-1"
              >
                <Play className="w-3 h-3" /> Resume
              </button>
            )}
            {isSpeaking && (
              <button
                type="button"
                onClick={stopSpeaking}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold inline-flex items-center gap-1"
              >
                <VolumeX className="w-3 h-3" /> Stop
              </button>
            )}
            {!isSpeaking && captionEntry && (
              <button
                type="button"
                onClick={() => speakText(captionEntry.text, captionEntry.speaker)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Replay
              </button>
            )}
            <button
              type="button"
              onClick={() => toggleCapability('captionDockPreference', 'transcript')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
            >
              Transcript
            </button>
            {pref === 'pinned' && (
              <button
                type="button"
                onClick={() => toggleCapability('captionDockPreference', 'auto')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Switch back to auto captions during speech only"
              >
                Unpin
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

/* ============================================================================
   4. CalmBreakDialog & ReadingLineRuler Overlay
   ============================================================================ */
export function CalmBreakDialog() {
  const {
    profile,
    toggleLearnerBundle,
    calmBreakOpen,
    setCalmBreakOpen,
    visualSoundCue
  } = usePlatform();

  const [rulerY, setRulerY] = useState(260);
  const [breathPhase, setBreathPhase] = useState('1. Breathe in gently... (4 seconds)');
  const calmCloseBtnRef = useRef(null);
  const caps = profile.capabilities;

  useEffect(() => {
    if (!caps.readingLineRuler) return;
    const handleMouseMove = (e) => setRulerY(e.clientY);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [caps.readingLineRuler]);

  useEffect(() => {
    if (!calmBreakOpen) return;
    calmCloseBtnRef.current?.focus();

    const phases = [
      '1. Breathe in gently through your nose... (1, 2, 3, 4)',
      '2. Rest and hold softly... (1, 2, 3, 4)',
      '3. Breathe out slowly... (1, 2, 3, 4)'
    ];
    let idx = 0;
    const timer = setInterval(() => {
      idx = (idx + 1) % phases.length;
      setBreathPhase(phases[idx]);
    }, 4000);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setCalmBreakOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [calmBreakOpen, setCalmBreakOpen]);

  return (
    <>
      {caps.readingLineRuler && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed left-0 right-0 z-40 transition-none"
          style={{
            top: Math.max(0, rulerY - 26),
            height: '52px',
            background: 'rgba(250, 204, 21, 0.16)',
            borderTop: '2px solid rgba(79, 70, 229, 0.5)',
            borderBottom: '2px solid rgba(79, 70, 229, 0.5)'
          }}
        />
      )}

      {/* Session-Only Opt-In Visual Sound Cue Banner (Phase 6: Hidden by default) */}
      {caps.visualSoundCues && visualSoundCue && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-16 right-4 z-40 max-w-sm rounded-xl border border-amber-400 bg-slate-900 text-white px-4 py-2.5 text-xs pointer-events-none"
        >
          <div className="font-bold text-amber-300">{visualSoundCue.label}</div>
          {visualSoundCue.detailText && (
            <div className="text-slate-200 mt-0.5">{visualSoundCue.detailText}</div>
          )}
        </div>
      )}

      {calmBreakOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="calm-break-title"
          className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4"
        >
          <div className="surface-card bg-white border border-slate-200 text-slate-900 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-xl">
            <h2 id="calm-break-title" className="text-xl font-extrabold text-slate-900">
              Take a Calm Break
            </h2>
            <p className="text-xs text-slate-600">
              Your lesson progress is saved. Take as much time as you need.
            </p>
            <div
              aria-live="polite"
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800"
            >
              {breathPhase}
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => toggleLearnerBundle('calmer_screen')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
              >
                {caps.sensoryCalmMode ? 'Calmer screen: On' : 'Turn on Calmer screen'}
              </button>
              <button
                ref={calmCloseBtnRef}
                type="button"
                onClick={() => setCalmBreakOpen(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs"
              >
                Resume from here
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AccessibilityToolbar(props) {
  return (
    <>
      <LearningToolsPanel
        isOpen={props.isMoreToolsOpen}
        onClose={() => props.setIsMoreToolsOpen(false)}
        onOpenQuiz={props.onOpenQuiz}
      />
      <CalmBreakDialog />
      <CaptionPanel />
    </>
  );
}

function SwitchRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-2 cursor-pointer select-none py-0.5 w-full">
      <span className="text-slate-700 font-medium">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition shrink-0 ${
          checked ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
        }`}
      >
        <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
          {checked && <Check className="w-2.5 h-2.5 text-indigo-700 stroke-[3]" />}
        </span>
      </button>
    </label>
  );
}
