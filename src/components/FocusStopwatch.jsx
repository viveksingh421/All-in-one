import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Clock, Timer, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export const FocusStopwatch = () => {
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

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aether_stopwatch_time_ms', timeMs.toString());
      localStorage.setItem('aether_stopwatch_running', isRunning.toString());
      localStorage.setItem('aether_stopwatch_laps', JSON.stringify(laps));
    } catch (e) {
      // ignore
    }
  }, [timeMs, isRunning, laps]);

  useEffect(() => {
    if (isRunning) {
      const now = Date.now();
      startTimeRef.current = now - timeMs;

      timerRef.current = setInterval(() => {
        setTimeMs(Date.now() - startTimeRef.current);
      }, 33); // ~30fps smooth millisecond display
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // Keep stopwatch running accurately even when tab is backgrounded
  useEffect(() => {
    const handleVisibility = () => {
      if (isRunning && startTimeRef.current) {
        setTimeMs(Date.now() - startTimeRef.current);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isRunning]);

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

  // Circular ring calculation (based on 60-second cycle)
  const currentSecsWithFraction = (timeMs % 60000) / 1000;
  const strokeDashoffset = 283 - (283 * currentSecsWithFraction) / 60;

  return (
    <div className="glass-panel rounded-3xl p-5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.45)] relative overflow-hidden flex flex-col h-full">
      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
            <Timer className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-white">
              Orbital Stopwatch
            </h3>
            <p className="text-[10px] text-starlight-300/60 font-mono">Deep Work Chrono</p>
          </div>
        </div>

        <span
          className={`w-2 h-2 rounded-full ${
            isRunning ? 'bg-cyan-400 animate-ping' : 'bg-starlight-300/30'
          }`}
        />
      </div>

      {/* Sleek Orbital Ring & Digital Counter */}
      <div className="relative flex flex-col items-center justify-center my-3">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="3.5"
            />
            {/* Animated Orbital Stroke */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="url(#stopwatchGlowGradient)"
              strokeWidth="4"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
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

          {/* Glowing orbital satellite tick on ring */}
          <div
            className="absolute inset-0 pointer-events-none transition-transform duration-75"
            style={{
              transform: `rotate(${(currentSecsWithFraction / 60) * 360}deg)`,
            }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#38bdf8] mx-auto -mt-1" />
          </div>

          {/* Central Digital Display */}
          <div className="absolute flex flex-col items-center text-center">
            <span className="text-[10px] font-mono tracking-widest uppercase text-starlight-300/50 mb-0.5">
              ELAPSED
            </span>
            <div className="font-mono text-2xl font-light tracking-tight text-white flex items-baseline">
              <span>{hours !== '00' ? `${hours}:` : ''}</span>
              <span>{mins}:</span>
              <span className="text-cyan-200 font-semibold">{secs}</span>
              <span className="text-xs text-starlight-300/70 ml-1">.{centis}</span>
            </div>
            <span className="text-[9px] font-mono text-cyan-400/80 mt-1 px-2 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/20">
              {isRunning ? '● RECORDING' : 'PAUSED'}
            </span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        <button
          onClick={handleStartPause}
          className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
            isRunning
              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 hover:bg-cyan-500/30 shadow-[0_0_15px_rgba(56,189,248,0.25)]'
          }`}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isRunning ? 'Pause' : 'Start'}</span>
        </button>

        <button
          onClick={handleLap}
          disabled={timeMs === 0}
          className="py-2 px-2 rounded-xl text-xs font-medium bg-space-900/60 text-starlight-200 border border-white/10 hover:border-white/20 hover:bg-space-850/80 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 transition-all"
        >
          <Flag className="w-3.5 h-3.5 text-purple-400" />
          <span>Split</span>
        </button>

        <button
          onClick={handleReset}
          disabled={timeMs === 0 && laps.length === 0}
          className="py-2 px-2 rounded-xl text-xs font-medium bg-space-900/60 text-starlight-200 border border-white/10 hover:border-rose-500/30 hover:text-rose-300 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Lap / Split Logs Drawer */}
      <div className="mt-4 pt-3 border-t border-white/10 flex-1 flex flex-col min-h-0">
        <div
          onClick={() => setShowLaps(!showLaps)}
          className="flex items-center justify-between cursor-pointer text-starlight-300/70 hover:text-white transition-colors mb-2"
        >
          <span className="text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-cyan-400" />
            Split Intervals ({laps.length})
          </span>
          {showLaps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>

        {showLaps && (
          <div className="overflow-y-auto space-y-1.5 max-h-36 pr-1 custom-scrollbar">
            {laps.length === 0 ? (
              <p className="text-[10px] text-starlight-300/40 font-mono text-center py-3 italic">
                No split intervals logged yet. Press 'Split' during study sprints.
              </p>
            ) : (
              laps.map((lap, i) => {
                const { mins: lm, secs: ls, centis: lc } = formatParts(lap.time);
                return (
                  <div
                    key={lap.id}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-space-900/40 border border-white/5 text-[11px] font-mono text-starlight-200"
                  >
                    <span className="text-cyan-400 font-semibold">#{laps.length - i}</span>
                    <span className="text-white font-medium">
                      {lm}:{ls}.{lc}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
