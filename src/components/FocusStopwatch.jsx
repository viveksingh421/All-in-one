import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Clock, Timer, Sparkles, ChevronDown, ChevronUp, Hourglass, Bell } from 'lucide-react';
import { soundManager } from '../utils/audio';

export const FocusStopwatch = () => {
  // Mode switcher: 'stopwatch' | 'timer'
  const [activeTab, setActiveTab] = useState('stopwatch');

  // --- STOPWATCH STATE ---
  const [timeMs, setTimeMs] = useState(() => {
    try {
      const saved = localStorage.getItem('aether_stopwatch_time_ms');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });
  const [isRunning, setIsRunning] = useState(() => {
    try {
      return localStorage.getItem('aether_stopwatch_running') === 'true';
    } catch {
      return false;
    }
  });
  const [laps, setLaps] = useState(() => {
    try {
      const saved = localStorage.getItem('aether_stopwatch_laps');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showLaps, setShowLaps] = useState(true);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // --- TIMER (COUNTDOWN) STATE ---
  const [timerDurationSecs, setTimerDurationSecs] = useState(25 * 60); // 25 min default
  const [timerRemainingSecs, setTimerRemainingSecs] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const countdownIntervalRef = useRef(null);

  // Sync stopwatch to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aether_stopwatch_time_ms', timeMs.toString());
      localStorage.setItem('aether_stopwatch_running', isRunning.toString());
      localStorage.setItem('aether_stopwatch_laps', JSON.stringify(laps));
    } catch (e) {
      // ignore
    }
  }, [timeMs, isRunning, laps]);

  // Stopwatch ticking
  useEffect(() => {
    if (isRunning) {
      const now = Date.now();
      startTimeRef.current = now - timeMs;

      timerRef.current = setInterval(() => {
        setTimeMs(Date.now() - startTimeRef.current);
      }, 33);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // Stopwatch tab visibility accuracy
  useEffect(() => {
    const handleVisibility = () => {
      if (isRunning && startTimeRef.current) {
        setTimeMs(Date.now() - startTimeRef.current);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isRunning]);

  // Timer (Countdown) ticking
  useEffect(() => {
    if (isTimerRunning) {
      countdownIntervalRef.current = setInterval(() => {
        setTimerRemainingSecs((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            setIsTimerRunning(false);
            try {
              soundManager.playChime('complete');
            } catch {
              // ignore
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    return () => clearInterval(countdownIntervalRef.current);
  }, [isTimerRunning]);

  // Stopwatch controls
  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeMs(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (timeMs === 0) return;
    setLaps((prev) => [
      { id: Date.now(), time: timeMs, split: timeMs - (prev[0]?.time || 0) },
      ...prev,
    ]);
  };

  // Timer controls
  const handleTimerStartPause = () => {
    if (timerRemainingSecs === 0) {
      setTimerRemainingSecs(timerDurationSecs);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const handleTimerReset = () => {
    setIsTimerRunning(false);
    setTimerRemainingSecs(timerDurationSecs);
  };

  // Custom timer input state
  const [customHours, setCustomHours] = useState('');
  const [customMins, setCustomMins] = useState('');
  const [customSecs, setCustomSecs] = useState('');

  const handleApplyCustomTimer = (e) => {
    e.preventDefault();
    const h = parseInt(customHours || '0', 10);
    const m = parseInt(customMins || '0', 10);
    const s = parseInt(customSecs || '0', 10);
    const total = h * 3600 + m * 60 + s;
    if (total > 0) {
      setIsTimerRunning(false);
      setTimerDurationSecs(total);
      setTimerRemainingSecs(total);
      setCustomHours('');
      setCustomMins('');
      setCustomSecs('');
    }
  };

  const handleSetTimerPreset = (secs) => {
    setIsTimerRunning(false);
    setTimerDurationSecs(secs);
    setTimerRemainingSecs(secs);
  };

  const formatParts = (ms) => {
    const hours = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return {
      hours: String(hours).padStart(2, '0'),
      mins: String(mins).padStart(2, '0'),
      secs: String(secs).padStart(2, '0'),
      centis: String(centis).padStart(2, '0'),
    };
  };

  const { hours, mins, secs, centis } = formatParts(timeMs);

  // Stopwatch ring progress (60s)
  const currentSecsWithFraction = (timeMs % 60000) / 1000;

  // Countdown timer parts
  const timerHours = Math.floor(timerRemainingSecs / 3600);
  const timerMins = Math.floor((timerRemainingSecs % 3600) / 60);
  const timerSecs = timerRemainingSecs % 60;
  const timerProgress = timerDurationSecs > 0 ? (timerRemainingSecs / timerDurationSecs) : 0;
  const timerStrokeDashoffset = 276.46 * (1 - timerProgress);

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-cyan-400/30 shadow-[0_30px_90px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col w-full min-h-[580px] justify-between">
      {/* Ambient background glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Tabs */}
      <div className="flex items-center justify-between pb-4 mb-2 border-b border-white/10 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner">
            {activeTab === 'stopwatch' ? (
              <Timer className="w-7 h-7 animate-spin-slow" />
            ) : (
              <Hourglass className="w-7 h-7 animate-pulse text-purple-300" />
            )}
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl uppercase font-mono tracking-wider font-bold text-white">
              {activeTab === 'stopwatch' ? 'Orbital Stopwatch' : 'Countdown Chronometer'}
            </h3>
            <p className="text-sm sm:text-base text-starlight-300/80 font-mono">
              {activeTab === 'stopwatch'
                ? 'Precision Deep Space Lap & Work Tracking'
                : 'Target Focused Interval & Pomodoro Orbit'}
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-space-900/80 p-1.5 rounded-2xl border border-white/15">
          <button
            onClick={() => setActiveTab('stopwatch')}
            className={`px-5 py-2.5 rounded-xl font-mono text-sm sm:text-base font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'stopwatch'
                ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                : 'text-starlight-300/60 hover:text-white'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>Stopwatch</span>
          </button>

          <button
            onClick={() => setActiveTab('timer')}
            className={`px-5 py-2.5 rounded-xl font-mono text-sm sm:text-base font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'timer'
                ? 'bg-purple-500/25 text-purple-200 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'text-starlight-300/60 hover:text-white'
            }`}
          >
            <Hourglass className="w-4 h-4" />
            <span>Countdown Timer</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: STOPWATCH VIEW --- */}
      {activeTab === 'stopwatch' && (
        <>
          <div className="relative flex flex-col items-center justify-center my-4 sm:my-8 flex-1">
            <div className="relative w-64 h-64 xs:w-72 xs:h-72 sm:w-96 sm:h-96 md:w-[440px] md:h-[440px] flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform drop-shadow-[0_0_35px_rgba(56,189,248,0.35)]" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="transparent"
                  stroke="url(#stopwatchGlowGradient)"
                  strokeWidth="5"
                  strokeDasharray="276.46"
                  strokeDashoffset={(276.46 - (276.46 * currentSecsWithFraction) / 60)}
                  strokeLinecap="round"
                  className="transition-all duration-75"
                />
                <defs>
                  <linearGradient id="stopwatchGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
              </svg>

              <div
                className="absolute inset-0 pointer-events-none transition-transform duration-75"
                style={{
                  transform: `rotate(${(currentSecsWithFraction / 60) * 360}deg)`,
                }}
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-cyan-300 shadow-[0_0_22px_#38bdf8] mx-auto -mt-2" />
              </div>

              <div className="absolute flex flex-col items-center text-center px-2">
                <span className="text-xs sm:text-lg font-mono tracking-widest uppercase text-starlight-300/80 mb-1 sm:mb-2 font-bold">
                  ELAPSED TIME
                </span>
                <div className="font-mono text-3xl xs:text-4xl sm:text-7xl md:text-8xl font-light tracking-tight text-white flex items-baseline drop-shadow-2xl">
                  <span>{hours !== '00' ? `${hours}:` : ''}</span>
                  <span>{mins}:</span>
                  <span className="text-cyan-200 font-semibold">{secs}</span>
                  <span className="text-base sm:text-2xl md:text-3xl text-starlight-300/80 ml-1 font-normal">.{centis}</span>
                </div>
                <span className={`text-xs sm:text-base font-mono mt-2 sm:mt-4 px-3 sm:px-5 py-1 sm:py-2 rounded-full border transition-all ${
                  isRunning
                    ? 'bg-cyan-400/20 border-cyan-400/50 text-cyan-200 shadow-[0_0_20px_rgba(56,189,248,0.4)] animate-pulse font-bold'
                    : 'bg-white/5 border-white/10 text-starlight-300/60 font-medium'
                }`}>
                  {isRunning ? '● RECORDING' : 'PAUSED'}
                </span>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 my-4 w-full">
            <button
              onClick={handleStartPause}
              className={`py-4 px-6 rounded-2xl text-base sm:text-xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-xl active:scale-95 cursor-pointer ${
                isRunning
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 hover:bg-amber-500/35 shadow-[0_0_30px_rgba(245,158,11,0.35)]'
                  : 'bg-cyan-500/25 text-cyan-100 border border-cyan-400/60 hover:bg-cyan-500/35 shadow-[0_0_30px_rgba(56,189,248,0.4)]'
              }`}
            >
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
              <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
            </button>

            <button
              onClick={handleLap}
              disabled={timeMs === 0}
              className="py-4 px-6 rounded-2xl text-base sm:text-xl font-semibold bg-space-900/80 text-starlight-100 border border-white/15 hover:border-purple-400/50 hover:bg-space-850 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg"
            >
              <Flag className="w-6 h-6 text-purple-400" />
              <span>Split Lap</span>
            </button>

            <button
              onClick={handleReset}
              disabled={timeMs === 0 && laps.length === 0}
              className="py-4 px-6 rounded-2xl text-base sm:text-xl font-semibold bg-space-900/80 text-starlight-100 border border-white/15 hover:border-rose-500/40 hover:text-rose-200 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg"
            >
              <RotateCcw className="w-6 h-6" />
              <span>Reset</span>
            </button>
          </div>

          {/* Lap Splits */}
          <div className="mt-2 pt-3 border-t border-white/10 flex flex-col">
            <div
              onClick={() => setShowLaps(!showLaps)}
              className="flex items-center justify-between cursor-pointer text-starlight-300/80 hover:text-white transition-colors py-1.5"
            >
              <span className="text-sm font-mono uppercase tracking-wider flex items-center gap-2 font-bold">
                <Clock className="w-4 h-4 text-cyan-400" />
                Split Intervals ({laps.length})
              </span>
              {showLaps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>

            {showLaps && (
              <div className="overflow-y-auto space-y-2 max-h-36 pr-1 custom-scrollbar mt-2">
                {laps.length === 0 ? (
                  <p className="text-sm text-starlight-300/50 font-mono text-center py-3 italic">
                    No split intervals logged yet. Press 'Split Lap' during focus sessions.
                  </p>
                ) : (
                  laps.map((lap, i) => {
                    const { mins: lm, secs: ls, centis: lc } = formatParts(lap.time);
                    return (
                      <div
                        key={lap.id || i}
                        className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-space-900/60 border border-white/5 text-sm font-mono"
                      >
                        <span className="text-cyan-300 font-semibold">Lap #{laps.length - i}</span>
                        <span className="text-white font-medium text-base">
                          {lm}:{ls}.{lc}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* --- TAB 2: TIMER (COUNTDOWN) VIEW --- */}
      {activeTab === 'timer' && (
        <>
          {/* Preset Buttons */}
          <div className="flex items-center justify-center gap-3 my-3 flex-wrap">
            {[
              { label: '5m Sprint', secs: 5 * 60 },
              { label: '15m Orbit', secs: 15 * 60 },
              { label: '25m Pomodoro', secs: 25 * 60 },
              { label: '45m Deep Work', secs: 45 * 60 },
              { label: '60m Block', secs: 60 * 60 },
            ].map((preset) => (
              <button
                key={preset.secs}
                onClick={() => handleSetTimerPreset(preset.secs)}
                className={`px-4 py-2.5 rounded-xl text-sm sm:text-base font-mono font-bold border transition-all cursor-pointer shadow-sm ${
                  timerDurationSecs === preset.secs
                    ? 'bg-purple-500/30 border-purple-400 text-purple-100 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                    : 'bg-space-900/70 border-white/10 text-starlight-200 hover:text-white hover:bg-space-850'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Time Form */}
          <form onSubmit={handleApplyCustomTimer} className="flex items-center justify-center gap-2.5 sm:gap-4 my-4 flex-wrap bg-space-900/60 p-3 sm:p-4 rounded-2xl border border-white/10">
            <span className="text-sm sm:text-base font-mono text-starlight-100 font-bold uppercase tracking-wider flex items-center gap-2">
              <Hourglass className="w-5 h-5 text-purple-400" />
              Custom Timer:
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="99"
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
                placeholder="00"
                className="w-16 bg-space-950/90 border border-white/20 rounded-xl px-2.5 py-2 text-center text-base sm:text-lg font-mono text-white focus:outline-none focus:border-purple-400 font-bold"
              />
              <span className="text-sm font-mono text-starlight-200 font-semibold">h</span>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="59"
                value={customMins}
                onChange={(e) => setCustomMins(e.target.value)}
                placeholder="25"
                className="w-16 bg-space-950/90 border border-white/20 rounded-xl px-2.5 py-2 text-center text-base sm:text-lg font-mono text-white focus:outline-none focus:border-purple-400 font-bold"
              />
              <span className="text-sm font-mono text-starlight-200 font-semibold">m</span>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="59"
                value={customSecs}
                onChange={(e) => setCustomSecs(e.target.value)}
                placeholder="00"
                className="w-16 bg-space-950/90 border border-white/20 rounded-xl px-2.5 py-2 text-center text-base sm:text-lg font-mono text-white focus:outline-none focus:border-purple-400 font-bold"
              />
              <span className="text-sm font-mono text-starlight-200 font-semibold">s</span>
            </div>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-500/30 border border-purple-400 hover:bg-purple-500/45 text-purple-100 text-sm sm:text-base font-mono font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] active:scale-95 cursor-pointer"
            >
              Set Timer
            </button>
          </form>

          {/* Countdown Ring */}
          <div className="relative flex flex-col items-center justify-center my-4 sm:my-8 flex-1">
            <div className="relative w-64 h-64 xs:w-72 xs:h-72 sm:w-96 sm:h-96 md:w-[440px] md:h-[440px] flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform drop-shadow-[0_0_35px_rgba(168,85,247,0.35)]" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="transparent"
                  stroke="url(#timerGlowGradient)"
                  strokeWidth="5"
                  strokeDasharray="276.46"
                  strokeDashoffset={timerStrokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
                <defs>
                  <linearGradient id="timerGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute flex flex-col items-center text-center px-2">
                <span className="text-xs sm:text-lg font-mono tracking-widest uppercase text-purple-300/80 mb-1 sm:mb-2 font-bold flex items-center gap-1.5">
                  <Hourglass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                  COUNTDOWN
                </span>
                <div className="font-mono text-3xl xs:text-4xl sm:text-7xl md:text-8xl font-light tracking-tight text-white flex items-baseline drop-shadow-2xl">
                  {timerHours > 0 && <span>{String(timerHours).padStart(2, '0')}:</span>}
                  <span>{String(timerMins).padStart(2, '0')}:</span>
                  <span className="text-purple-300 font-semibold">{String(timerSecs).padStart(2, '0')}</span>
                </div>
                <span className={`text-xs sm:text-base font-mono mt-2 sm:mt-4 px-3 sm:px-5 py-1 sm:py-2 rounded-full border transition-all ${
                  isTimerRunning
                    ? 'bg-purple-400/20 border-purple-400/50 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-pulse font-bold'
                    : timerRemainingSecs === 0
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold'
                    : 'bg-white/5 border-white/10 text-starlight-300/60 font-medium'
                }`}>
                  {isTimerRunning
                    ? '● RUNNING'
                    : timerRemainingSecs === 0
                    ? 'Complete!'
                    : 'PAUSED'}
                </span>
              </div>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="grid grid-cols-2 gap-4 my-4 w-full">
            <button
              onClick={handleTimerStartPause}
              className={`py-4 px-6 rounded-2xl text-base sm:text-xl font-bold flex items-center justify-center gap-2.5 transition-all shadow-xl active:scale-95 cursor-pointer ${
                isTimerRunning
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50 hover:bg-amber-500/35 shadow-[0_0_30px_rgba(245,158,11,0.35)]'
                  : 'bg-purple-500/25 text-purple-100 border border-purple-400/60 hover:bg-purple-500/35 shadow-[0_0_30px_rgba(168,85,247,0.4)]'
              }`}
            >
              {isTimerRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
              <span>{isTimerRunning ? 'Pause Timer' : 'Start Countdown'}</span>
            </button>

            <button
              onClick={handleTimerReset}
              className="py-4 px-6 rounded-2xl text-base sm:text-xl font-semibold bg-space-900/80 text-starlight-100 border border-white/15 hover:border-purple-400/50 hover:bg-space-850 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg"
            >
              <RotateCcw className="w-6 h-6" />
              <span>Reset to {Math.round(timerDurationSecs / 60)}m</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};


