import React, { useState } from 'react';
import { Volume2, Sparkles, RotateCcw } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';

export default function VisualManipulatives({ type }) {
  const { speakText, profile } = usePlatform();

  if (!profile.capabilities.visualManipulatives) {
    return null;
  }

  switch (type) {
    case 'fraction-lab':
      return <FractionManipulative speakText={speakText} />;
    case 'ecosystem-lab':
      return <EcosystemManipulative speakText={speakText} />;
    case 'linear-motion-lab':
      return <LinearMotionManipulative speakText={speakText} />;
    case 'matter-lab':
      return <StatesOfMatterManipulative speakText={speakText} />;
    case 'algebra-scale-lab':
      return <AlgebraScaleManipulative speakText={speakText} />;
    case 'cell-energy-lab':
      return <CellularEnergyManipulative speakText={speakText} />;
    default:
      return <FractionManipulative speakText={speakText} />;
  }
}

/* ============================================================================
   1. ELEMENTARY MATH: Interactive Fraction Bar & Equivalent Share Builder
   ============================================================================ */
function FractionManipulative({ speakText }) {
  const [denominator, setDenominator] = useState(6);
  const [numerator, setNumerator] = useState(4);

  const safeNum = Math.min(numerator, denominator);
  const percentage = Math.round((safeNum / denominator) * 100);

  // Check simple equivalents
  const isHalf = safeNum * 2 === denominator;
  const isWhole = safeNum === denominator;

  return (
    <div className="surface-card rounded-2xl border-2 border-indigo-200 bg-indigo-50/50 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="Fraction blocks">🧱</span>
          <div>
            <h4 className="font-bold text-indigo-950 text-base">
              Interactive Visual Fraction Builder (Dyscalculia & Visual Model)
            </h4>
            <p className="text-xs text-slate-600">
              Click the slices or use the + / - buttons to see how Numerator and Denominator work together!
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            speakText(
              `Visual Fraction Builder showing ${safeNum} over ${denominator}, which equals ${percentage} percent of one whole bar.`,
              'Fraction Lab'
            )
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-800 text-xs font-semibold hover:bg-indigo-100"
        >
          <Volume2 className="w-3.5 h-3.5" /> Read Model Aloud
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-4">
        {/* Big Symbolic Fraction Display (Color-Coded) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-center gap-5">
          <div className="text-center">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">
              Numerator (Selected)
            </div>
            <div className="text-3xl font-extrabold text-indigo-700 bg-indigo-50 px-4 py-1 rounded-lg border border-indigo-200">
              {safeNum}
            </div>
            <div className="my-1.5 h-1 bg-slate-800 rounded-full w-full" />
            <div className="text-3xl font-extrabold text-emerald-700 bg-emerald-50 px-4 py-1 rounded-lg border border-emerald-200">
              {denominator}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mt-1">
              Denominator (Total Parts)
            </div>
          </div>

          <div className="text-left space-y-1.5 text-sm">
            <div className="font-bold text-slate-800">= {percentage}% of 1 Whole</div>
            {isHalf && (
              <span className="inline-block px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
                ★ Equivalent to 1/2 (Exact Half!)
              </span>
            )}
            {isWhole && (
              <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300">
                ✓ Equals 1 Whole Bar!
              </span>
            )}
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="md:col-span-2 space-y-3 bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-bold text-indigo-900">
              ⬆️ Numerator (Parts Shaded: {safeNum}):
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNumerator(Math.max(0, safeNum - 1))}
                className="px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-900 font-bold hover:bg-indigo-200"
              >
                -1 Slice
              </button>
              <button
                type="button"
                onClick={() => setNumerator(Math.min(denominator, safeNum + 1))}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700"
              >
                +1 Slice
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-bold text-emerald-900">
              ⬇️ Denominator (Total Equal Slices: {denominator}):
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {[2, 3, 4, 6, 8].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDenominator(d);
                    if (numerator > d) setNumerator(d);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs border ${
                    denominator === d
                      ? 'bg-emerald-700 text-white border-emerald-800'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {d} Parts
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Visual Fraction Bar */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-700 flex justify-between">
          <span>Click any slice below to toggle it on/off:</span>
          <span>1 Whole Bar Divided into {denominator} Equal Slices</span>
        </div>
        <div
          className="grid gap-1.5 p-2 bg-white rounded-xl border-2 border-slate-300"
          style={{ gridTemplateColumns: `repeat(${denominator}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: denominator }).map((_, idx) => {
            const isSelected = idx < safeNum;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setNumerator(idx + 1 === safeNum ? idx : idx + 1)}
                className={`h-14 rounded-lg font-bold text-xs flex flex-col items-center justify-center border-2 transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-800 shadow-xs'
                    : 'bg-slate-100 text-slate-600 border-dashed border-slate-300 hover:bg-indigo-50'
                }`}
                aria-label={`Slice ${idx + 1} of ${denominator}, ${isSelected ? 'selected' : 'not selected'}`}
              >
                <span>1/{denominator}</span>
                <span className="text-[11px] opacity-90">{isSelected ? '✓ Shaded' : 'Empty'}</span>
              </button>
            );
          })}
        </div>

        {/* Reference 1/2 Benchmark Bar */}
        <div className="grid grid-cols-2 gap-1.5 px-2 pt-1 opacity-85">
          <div className="h-6 rounded bg-amber-100 border border-amber-400 text-amber-950 text-xs font-bold flex items-center justify-center">
            Benchmark: 1/2 (50%)
          </div>
          <div className="h-6 rounded bg-slate-100 border border-slate-300 text-slate-600 text-xs flex items-center justify-center">
            1/2 (50%)
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   2. MIDDLE SCHOOL SCIENCE: Trophic Energy Pyramid & 10% Rule Simulator
   ============================================================================ */
function EcosystemManipulative({ speakText }) {
  const [producerEnergy, setProducerEnergy] = useState(5000);
  const [ottersPresent, setOttersPresent] = useState(true);

  const level2 = Math.round(producerEnergy * 0.1);
  const level3 = Math.round(level2 * 0.1);
  const level4 = Math.round(level3 * 0.1);

  return (
    <div className="surface-card rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <div>
            <h4 className="font-bold text-emerald-950 text-base">
              Interactive Trophic Energy Pyramid & Food Web Simulator
            </h4>
            <p className="text-xs text-slate-600">
              Test the 10% Energy Rule and observe what happens when a keystone predator is removed!
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            speakText(
              `Trophic Pyramid Simulator. With ${producerEnergy} kilocalories in Level 1 Producers, Level 2 Primary Consumers receive ${level2} kilocalories, Level 3 Secondary Consumers receive ${level3} kilocalories, and Level 4 Apex Predators receive ${level4} kilocalories.`,
              'Ecosystem Simulator'
            )
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-900 text-xs font-semibold hover:bg-emerald-100"
        >
          <Volume2 className="w-3.5 h-3.5" /> Read Pyramid Aloud
        </button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            ☀️ Step 1: Choose Level 1 Producer Energy (Plants / Kelp):
          </label>
          <div className="flex flex-wrap gap-2">
            {[1000, 5000, 10000, 25000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setProducerEnergy(val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                  producerEnergy === val
                    ? 'bg-emerald-700 text-white border-emerald-800'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {val.toLocaleString()} kcal
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-700">
              🦦 Keystone Predator Test (Kelp → Urchin → Sea Otter):
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              {ottersPresent
                ? 'Balanced: Sea Otters keep Sea Urchins in check; Kelp thrives!'
                : '⚠️ Trophic Cascade: Without Sea Otters, Sea Urchins multiply and devour the Kelp!'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOttersPresent(!ottersPresent)}
            className={`px-3 py-2 rounded-lg text-xs font-bold shrink-0 border ${
              ottersPresent
                ? 'bg-sky-600 text-white border-sky-700 hover:bg-sky-700'
                : 'bg-amber-600 text-white border-amber-700 hover:bg-amber-700'
            }`}
          >
            {ottersPresent ? 'Remove Sea Otters' : 'Restore Sea Otters'}
          </button>
        </div>
      </div>

      {/* Visual Energy Pyramid */}
      <div className="space-y-2 max-w-2xl mx-auto">
        <div className="w-2/5 mx-auto bg-amber-100 border-2 border-amber-400 rounded-xl p-2.5 text-center">
          <div className="text-xs font-bold text-amber-950">🦅 Level 4: Apex Predators (10% of L3)</div>
          <div className="text-base font-extrabold text-amber-900">{level4.toLocaleString()} kcal</div>
        </div>
        <div className="w-3/5 mx-auto bg-sky-100 border-2 border-sky-400 rounded-xl p-2.5 text-center">
          <div className="text-xs font-bold text-sky-950">🐍 Level 3: Secondary Consumers (10% of L2)</div>
          <div className="text-base font-extrabold text-sky-900">{level3.toLocaleString()} kcal</div>
        </div>
        <div className="w-4/5 mx-auto bg-indigo-100 border-2 border-indigo-400 rounded-xl p-2.5 text-center">
          <div className="text-xs font-bold text-indigo-950">🐇 Level 2: Primary Consumers / Herbivores (10% of L1)</div>
          <div className="text-base font-extrabold text-indigo-900">{level2.toLocaleString()} kcal</div>
        </div>
        <div className="w-full bg-emerald-200 border-2 border-emerald-600 rounded-xl p-3 text-center">
          <div className="text-xs font-bold text-emerald-950">🌱 Level 1: Producers / Autotrophs (100% Baseline Solar Capture)</div>
          <div className="text-lg font-extrabold text-emerald-950">{producerEnergy.toLocaleString()} kcal</div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   3. HIGH SCHOOL MATH & PHYSICS: Linear Function & Rover Trajectory Grapher
   ============================================================================ */
function LinearMotionManipulative({ speakText }) {
  const [slopeM, setSlopeM] = useState(4);
  const [interceptB, setInterceptB] = useState(12);
  const [timeX, setTimeX] = useState(5);

  const outputY = slopeM * timeX + interceptB;

  return (
    <div className="surface-card rounded-2xl border-2 border-indigo-200 bg-slate-50 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📈</span>
          <div>
            <h4 className="font-bold text-slate-900 text-base">
              Interactive Linear Kinematics & Slope-Intercept Lab (y = mx + b)
            </h4>
            <p className="text-xs text-slate-600">
              Adjust rate of change (m), starting position (b), and time (x) to see the live equation and coordinate trajectory!
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            speakText(
              `Linear model y equals ${slopeM} x plus ${interceptB}. When input time x equals ${timeX} seconds, output position y equals ${outputY} meters.`,
              'Linear Motion Lab'
            )
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-900 text-xs font-semibold hover:bg-indigo-50"
        >
          <Volume2 className="w-3.5 h-3.5" /> Read Equation Aloud
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Color-Coded Formula & Controls */}
        <div className="lg:col-span-7 space-y-3 bg-white p-4 rounded-xl border border-slate-200">
          <div className="p-3 rounded-xl bg-slate-900 text-white text-center font-mono text-base md:text-lg font-bold tracking-wide">
            <span className="text-amber-300">y ({outputY}m)</span> ={' '}
            <span className="text-indigo-300">{slopeM} (m)</span> ×{' '}
            <span className="text-sky-300">{timeX} (x)</span> +{' '}
            <span className="text-emerald-300">{interceptB} (b)</span>
          </div>

          {/* Slope m control */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-xs font-bold text-indigo-800">
              📐 Slope / Velocity (m = {slopeM} m/s):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[-2, 1, 2, 3, 4].map((mVal) => (
                <button
                  key={mVal}
                  type="button"
                  onClick={() => setSlopeM(mVal)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    slopeM === mVal
                      ? 'bg-indigo-600 text-white border-indigo-700'
                      : 'bg-indigo-50 text-indigo-900 border-indigo-200'
                  }`}
                >
                  m = {mVal}
                </button>
              ))}
            </div>
          </div>

          {/* Y-intercept b control */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-emerald-800">
              📍 Starting Position / Y-Intercept (b = {interceptB} m):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[0, 4, 8, 12].map((bVal) => (
                <button
                  key={bVal}
                  type="button"
                  onClick={() => setInterceptB(bVal)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    interceptB === bVal
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  }`}
                >
                  b = {bVal}
                </button>
              ))}
            </div>
          </div>

          {/* Input Time x control */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-sky-800">
              ⏱️ Input Time (x = {timeX} seconds):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[0, 2, 4, 5, 6].map((xVal) => (
                <button
                  key={xVal}
                  type="button"
                  onClick={() => setTimeX(xVal)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    timeX === xVal
                      ? 'bg-sky-600 text-white border-sky-700'
                      : 'bg-sky-50 text-sky-900 border-sky-200'
                  }`}
                >
                  x = {xVal}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Coordinate Table & Visual Coordinate Graph */}
        <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-bold text-slate-700 mb-2">
            Coordinate Telemetry Table for y = {slopeM}x + {interceptB}:
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-center text-xs mb-3">
            {[0, 2, 4, 5].map((t) => {
              const pos = slopeM * t + interceptB;
              const isCurrent = t === timeX;
              return (
                <div
                  key={t}
                  className={`p-2 rounded-lg border ${
                    isCurrent
                      ? 'bg-amber-100 border-amber-400 font-bold text-amber-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="text-[11px] text-slate-500">x = {t}s</div>
                  <div className="text-sm font-extrabold">y = {pos}m</div>
                </div>
              );
            })}
          </div>
          <div className="text-xs bg-indigo-50 border border-indigo-200 rounded-lg p-2.5 text-indigo-950">
            <strong>Step-by-Step Verification:</strong> At x = {timeX}, multiply{' '}
            <strong>
              {slopeM} × {timeX} = {slopeM * timeX}
            </strong>
            , then add starting value <strong>+{interceptB}</strong> to get{' '}
            <strong>y = {outputY} meters</strong>!
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   4. ELEMENTARY SCIENCE: States of Matter Thermal Simulator
   ============================================================================ */
function StatesOfMatterManipulative({ speakText }) {
  const [tempC, setTempC] = useState(25);

  const stateInfo =
    tempC <= 0
      ? {
          name: 'SOLID (Ice)',
          emoji: '🧊',
          desc: 'Particles are locked in a tight grid and vibrate slowly in place. Keeps a fixed shape and volume!',
          color: 'bg-sky-100 border-sky-400 text-sky-950'
        }
      : tempC < 100
      ? {
          name: 'LIQUID (Water)',
          emoji: '💧',
          desc: 'Particles have enough thermal energy to slide past one another. Keeps a fixed volume but takes the shape of its cup!',
          color: 'bg-indigo-100 border-indigo-400 text-indigo-950'
        }
      : {
          name: 'GAS (Steam / Water Vapor)',
          emoji: '☁️',
          desc: 'Particles move rapidly with high kinetic energy and spread far apart to fill the entire container!',
          color: 'bg-amber-100 border-amber-400 text-amber-950'
        };

  return (
    <div className="surface-card rounded-2xl border-2 border-sky-200 bg-sky-50/50 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h4 className="font-bold text-sky-950 text-base">
          🌡️ Interactive States of Matter Thermal Simulator ({tempC}°C)
        </h4>
        <button
          type="button"
          onClick={() => speakText(`${tempC} degrees Celsius: ${stateInfo.name}. ${stateInfo.desc}`, 'Matter Lab')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-sky-200 text-sky-900 text-xs font-semibold"
        >
          <Volume2 className="w-3.5 h-3.5" /> Read State Aloud
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { label: '❄️ Freeze (-10°C Solid Ice)', temp: -10 },
          { label: '💧 Melt (25°C Liquid Water)', temp: 25 },
          { label: '🔥 Boil (110°C Gas Steam)', temp: 110 }
        ].map((preset) => (
          <button
            key={preset.temp}
            type="button"
            onClick={() => setTempC(preset.temp)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border ${
              tempC === preset.temp
                ? 'bg-sky-700 text-white border-sky-800'
                : 'bg-white text-sky-900 border-sky-200 hover:bg-sky-100'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className={`p-4 rounded-xl border-2 ${stateInfo.color}`}>
        <div className="text-lg font-extrabold flex items-center gap-2">
          <span>{stateInfo.emoji}</span>
          <span>Current Phase at {tempC}°C: {stateInfo.name}</span>
        </div>
        <p className="text-sm mt-1">{stateInfo.desc}</p>
      </div>
    </div>
  );
}

/* ============================================================================
   5. MIDDLE SCHOOL MATH: Visual Algebra Balance Scale (3x + 4 = 19)
   ============================================================================ */
function AlgebraScaleManipulative({ speakText }) {
  const [xGuess, setXGuess] = useState(5);
  const leftSide = 3 * xGuess + 4;
  const rightSide = 19;
  const isBalanced = leftSide === rightSide;

  return (
    <div className="surface-card rounded-2xl border-2 border-amber-200 bg-amber-50/40 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h4 className="font-bold text-amber-950 text-base">
          ⚖️ Interactive Visual Algebra Balance Scale: Solve 3x + 4 = 19
        </h4>
        <button
          type="button"
          onClick={() =>
            speakText(
              `Testing x equals ${xGuess}. Left pan 3 times ${xGuess} plus 4 equals ${leftSide}. Right pan equals ${rightSide}. ${
                isBalanced ? 'The scale is perfectly balanced!' : 'The scale is not balanced yet.'
              }`,
              'Algebra Balance Scale'
            )
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-950 text-xs font-semibold"
        >
          <Volume2 className="w-3.5 h-3.5" /> Read Scale Aloud
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs font-bold text-slate-700">Test a value for each mystery box (x):</span>
        {[2, 3, 4, 5, 6, 7].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => setXGuess(val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
              xGuess === val
                ? 'bg-indigo-600 text-white border-indigo-700'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-indigo-50'
            }`}
          >
            x = {val}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-center">
        <div className="bg-white p-3.5 rounded-xl border-2 border-indigo-300">
          <div className="text-xs font-bold text-indigo-800">Left Pan: 3x + 4</div>
          <div className="text-lg font-extrabold text-indigo-950 mt-1">
            3({xGuess}) + 4 = {leftSide}
          </div>
        </div>
        <div
          className={`p-3.5 rounded-xl border-2 font-extrabold text-sm ${
            isBalanced
              ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
              : 'bg-amber-100 border-amber-400 text-amber-950'
          }`}
        >
          {isBalanced
            ? '✓ BALANCED! Left (19) = Right (19) so x = 5!'
            : leftSide < rightSide
            ? `Left (${leftSide}) is lighter than Right (${rightSide}) — try a larger x!`
            : `Left (${leftSide}) is heavier than Right (${rightSide}) — try a smaller x!`}
        </div>
        <div className="bg-white p-3.5 rounded-xl border-2 border-emerald-300">
          <div className="text-xs font-bold text-emerald-800">Right Pan: Target Constant</div>
          <div className="text-lg font-extrabold text-emerald-950 mt-1">= {rightSide}</div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   6. HIGH SCHOOL SCIENCE: Cellular Energy Cycle (Photosynthesis ⇄ Respiration)
   ============================================================================ */
function CellularEnergyManipulative({ speakText }) {
  const [activeStage, setActiveStage] = useState('photosynthesis');

  return (
    <div className="surface-card rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h4 className="font-bold text-emerald-950 text-base">
          🧬 Interactive Chloroplast & Mitochondria Energy Cycle Explorer
        </h4>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveStage('photosynthesis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
              activeStage === 'photosynthesis'
                ? 'bg-emerald-700 text-white border-emerald-800'
                : 'bg-white text-emerald-900 border-emerald-300'
            }`}
          >
            🌿 Stage 1: Chloroplast (Photosynthesis)
          </button>
          <button
            type="button"
            onClick={() => setActiveStage('respiration')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
              activeStage === 'respiration'
                ? 'bg-indigo-700 text-white border-indigo-800'
                : 'bg-white text-indigo-900 border-indigo-300'
            }`}
          >
            🔋 Stage 2: Mitochondria (Respiration)
          </button>
        </div>
      </div>

      {activeStage === 'photosynthesis' ? (
        <div className="bg-white p-4 rounded-xl border-2 border-emerald-400">
          <div className="text-xs font-bold uppercase text-emerald-800">
            Organelle: Chloroplast • Stores Solar Energy in Chemical Bonds
          </div>
          <div className="text-base font-extrabold text-slate-900 mt-1">
            [Reactants] 6 CO₂ + 6 H₂O + Sunlight ☀️ ➔ [Products] C₆H₁₂O₆ (Glucose) + 6 O₂
          </div>
          <p className="text-xs text-slate-600 mt-1.5">
            Notice the outputs: Glucose and Oxygen! Click &ldquo;Stage 2: Mitochondria&rdquo; to see where those exact molecules go next.
          </p>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-xl border-2 border-indigo-400">
          <div className="text-xs font-bold uppercase text-indigo-800">
            Organelle: Mitochondria • Unlocks ~36 ATP Energy for the Cell
          </div>
          <div className="text-base font-extrabold text-slate-900 mt-1">
            [Reactants] C₆H₁₂O₆ (Glucose) + 6 O₂ ➔ [Products] 6 CO₂ + 6 H₂O + ⚡ 36 ATP Energy
          </div>
          <p className="text-xs text-slate-600 mt-1.5">
            The outputs of Photosynthesis (Glucose + O₂) are the exact inputs of Cellular Respiration, recycling CO₂ and H₂O!
          </p>
        </div>
      )}
    </div>
  );
}
